# turion-ai/turion-jev-31b

## Resumen

Turion Jev 31B es un modelo de decisión desarrollado por Turion AI, obtenido mediante un ajuste fino (LoRA) sobre google/gemma-4-31B-it. A diferencia de un modelo generativo convencional, no produce texto libre: recibe un estado (descripción de una situación) y una serie de preguntas tipadas (elección múltiple, sí/no o puntuación de 0 a 5), y devuelve una probabilidad calibrada para cada opción en un único pase hacia delante. Esta naturaleza discriminativa lo orienta a tareas de enrutamiento, clasificación y puntuación estructurada dentro de sistemas de agentes y pipelines de decisión.

El modelo conserva la arquitectura transformer causal de Gemma 4 (31.273.086.512 parámetros totales, pesos en BF16) y aprovecha el tokenizador de Gemma para codificar cada opción con un código de uno o dos tokens, leyendo hasta 255 opciones por pregunta. Su ventana declarada es de 65.536 tokens, con un límite práctico de 12.000 caracteres de entrada que se repiten una vez en el prompt para mejorar la lectura.

Es relevante porque propone un paradigma distinto al de los LLM generativos para tareas de decisión: menor latencia (mediana de 116 ms por petición en una RTX PRO 6000), coste de salida nulo (0 tokens de salida) y salidas probabilísticas directamente consumibles por lógica de negocio. Se distribuye con licencia Apache 2.0 y cuenta con variantes menores (9B, 4B, 2B y 0.8B) y repositorios GGUF para llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (Gemma 4), ajuste fino con LoRA r64 |
| Parámetros totales | 31.273.086.512 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens (límite declarado; peticiones mayores se rechazan) |
| Tipos de cuantización | BF16 (pesos publicados); FP8 en inferencia (cuantización online con vLLM); GGUF en repo aparte |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16); GGUF en turion-ai/turion-jev-31b-GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it y mantiene su atención causal nativa. El ajuste se realizó con LoRA de rango 64 (alpha 128) aplicado a todas las capas lineales, con tasa de aprendizaje 2e-5, 450 pasos de aproximadamente 65k tokens cada uno y secuencias de hasta 16.384 tokens. Las opciones se barajan durante el entrenamiento y las entradas de hasta 12.000 caracteres se repiten una vez. La función de pérdida es entropía cruzada contra objetivos suaves (distribuciones de probabilidad) sobre los códigos de opción, no contra texto generado. Los checkpoints de los pasos 300, 375 y 450 se combinaron mediante un "uniform soup" y se fusionaron en el modelo base a escala completa, guardándose en BF16. El entrenamiento se ejecutó en una NVIDIA B300 durante unas 7,3 horas en la plataforma de Turion AI.

La inferencia es peculiar: cada pregunta se lista antes del estado, cada opción recibe un código de uno o dos tokens (A–Z y luego códigos de dos letras que son tokens únicos de Gemma), y la probabilidad se obtiene normalizando los log-probabilidades del siguiente token sobre los códigos mostrados. Se aplica una temperatura por tipo de pregunta (elección 1.18, sí/no 1.18, puntuación 1.12) ajustada sobre datos reservados. Para preguntas de elección con pocas opciones se promedian los resultados con las opciones invertidas (order averaging), y las entradas cortas se leen dos veces. El dataset de entrenamiento consta de 157.106 ejemplos (el detalle de composición queda truncado en la información disponible).

## Capacidades

- Decisión estructurada: devuelve una probabilidad por opción para preguntas de elección múltiple, sí/no y puntuación 0–5.
- Lectura de hasta 255 opciones por pregunta en un solo pase.
- Procesamiento de estados multimodales: la pipeline declarada es image-text-to-text, heredada de Gemma 4.
- Salida determinista y calibrada, apta para umbrales y lógica de negocio.
- Sin generación de texto: no produce explicaciones ni razonamiento en lenguaje natural.
- Soporte de lotes de preguntas por petición (con límites de opciones y de longitud).
- Integración con vLLM en proceso y servidor compatible con `POST /v1/systemone`.
- No se documenta soporte explícito de tool calling, agentes multi-paso ni modo "thinking".

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, el modelo devuelve la probabilidad de que corresponda a facturación, técnico, ventas u otro equipo, con una latencia mediana de 116 ms que permite clasificar en tiempo real.
- Triaje de urgencia: con una pregunta de puntuación 0–5 sobre criticidad, se obtiene una distribución calibrada que alimenta colas de atención prioritaria sin necesidad de umbrales manuales.
- Moderación de contenido: preguntas sí/no sobre categorías de riesgo, aprovechando la salida probabilística para decidir revisiones humanas.
- Sistemas de agentes con enrutamiento de herramientas: el modelo decide qué herramienta o flujo invocar a partir del estado de la conversación, sustituyendo a un LLM generativo en el paso de selección.
- Encuestas y etiquetado automatizado: clasificación de respuestas abiertas en categorías predefinidas con probabilidades auditables, útil en investigación de mercados.
- Control de calidad en pipelines de datos: puntuación de pares pregunta-respuesta o de documentos según criterios definidos como preguntas tipadas.
- Decisión multimodal: al heredar la pipeline image-text-to-text de Gemma 4, puede incorporar imágenes en el estado para tareas de clasificación visual (siempre que el kit de inferencia lo soporte).

## Benchmarks y rendimiento

| Benchmark | Turion Jev 31B | Notas |
|---|---:|---|
| Decision Index 0.4.1, Full score (tests privados) | 70,47 | Empatado en el puesto #4 |
| Decision Index 0.3, índice público | 66,16 | Ejecución propia del suite público |
| Peticiones del suite público | 140.620 | 140.393 ok, 227 no soportadas, 0 errores |
| Latencia por petición (una a una) | mediana 116 ms · media 288 ms · p80 352 ms | RTX PRO 6000 Blackwell, FP8 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es generativo y no aplica ese tipo de evaluación.

## Requisitos de hardware

- VRAM para BF16: aproximadamente 62,6 GB de pesos, más overhead de activaciones y caché KV; se recomienda 80 GB o más.
- VRAM para FP8: en torno a 32 GB de pesos, con margen para caché KV y contexto largo; viable en GPUs de 48–96 GB.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (96 GB, configuración oficial), H100 80 GB, A100 80 GB; en FP8 puede funcionar en L40S 48 GB o A6000 48 GB con contexto reducido.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en BF16 ni FP8; las variantes 9B, 4B, 2B y 0.8B con GGUF sí están pensadas para portátiles.
- Despliegue: vLLM (backend oficial, con cuantización FP8 online, prefix caching y `max_model_len` 65.600), llama.cpp mediante los GGUF del repo separado, y servidor `POST /v1/systemone` incluido en el paquete.
- Throughput: no disponible; la configuración oficial procesa una petición a la vez.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---:|---|---|---|
| Turion Jev 31B | 31,3B | 65.536 | Decisión probabilística sobre Gemma 4 | Apache 2.0 |
| google/gemma-4-31B-it | 31B (no confirmado) | No disponible | LLM generativo multimodal | No disponible |
| Turion Jev 9B | 9B (no confirmado) | No disponible | Decisión probabilística, variante menor | Apache 2.0 |
| Turion Jev 4B / 2B / 0.8B | 4B / 2B / 0.8B (no confirmado) | No disponible | Decisión probabilística para portátil | Apache 2.0 |

No se dispone de datos de benchmarks comparativos frente a otros modelos de decisión de terceros en la información proporcionada.

## Limitaciones y advertencias

- No genera texto: no puede usarse para respuestas conversacionales ni explicaciones; solo devuelve probabilidades sobre opciones predefinidas.
- Límite estricto de 65.536 tokens: las peticiones más largas se rechazan como no soportadas, nunca se truncan.
- Límite práctico de 12.000 caracteres de entrada para la lectura doble; entradas más largas pierden esa ventaja.
- Máximo de 255 opciones por pregunta; por encima no se procesan.
- Los resultados del Decision Index Full score provienen de tests privados de los mantenedores y no son reproducibles externamente.
- El ranking #4 está empatado con otros seis modelos dentro de un margen de 0,9 puntos, por lo que la posición no debe interpretarse como superioridad clara.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de calibración deficiente fuera de la distribución de entrenamiento.
- Sesgos heredados de Gemma 4 y del dataset de ajuste (composición completa no disponible).
- Idiomas soportados no documentados; el rendimiento multilingüe es incierto.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Gemma 4.
- La configuración oficial de inferencia procesa una petición a la vez; el throughput en producción concurrente no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turion-ai/turion-jev-31b
- GGUF: https://huggingface.co/turion-ai/turion-jev-31b-GGUF
- Variante 9B: https://huggingface.co/turion-ai/turion-jev-9b
- Variante 4B: https://huggingface.co/turion-ai/turion-jev-4b
- Variante 2B: https://huggingface.co/turion-ai/turion-jev-2b
- Variante 0.8B: https://huggingface.co/turion-ai/turion-jev-0.8b
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Decision Index (Space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Resultados del run: https://huggingface.co/datasets/turion-ai/turion-jev-31b-decision-index-results/tree/main/runs/turion-jev-31b
- Repositorio Decision Index: https://github.com/apolinario/decision-index
- Plataforma de entrenamiento: https://turion.ai/training/
- Precios y límites: https://turion.ai/models/
- Guía de modelos de decisión: https://turion.ai/docs/guides/decision-models/
- Sitio del autor: https://turion.ai
