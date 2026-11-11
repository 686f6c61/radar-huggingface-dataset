# turion-ai/turion-jev-31b

## Resumen

Turion Jev 31B es un modelo de decisión especializado, desarrollado por Turion AI y afinado a partir de google/gemma-4-31B-it. A diferencia de los modelos generativos convencionais, no produce texto: recibe un estado (descripción de una situación) y un conjunto de preguntas tipadas (elección múltiple, sí/no, puntuación 0-5) y devuelve una probabilidad para cada opción, leída de un único forward pass. El modelo tiene 31.273 millones de parámetros y se distribuye en safetensors BF16 con licencia Apache 2.0.

La relevancia del modelo reside en su enfoque de "system-one": en lugar de razonar paso a paso generando tokens, evalúa directamente la distribución de probabilidad sobre códigos de un solo token asociados a cada opción. Esto permite clasificación y enrutamiento de decisiones con latencia muy baja (mediana de 116 ms por petición en el hardware oficial) y sin coste de tokens de salida. Está pensado para pipelines de decisión estructurada, como triaje de tickets, enrutamiento a equipos o scoring de urgencia.

El modelo ocupa el puesto #2 empatado en el Decision Index 0.4.1 (puntuación Full de 70,47 en pruebas privadas de los mantenedores) y obtuvo 66,16 en el índice público 0.3. Su contexto declarado es de 65.536 tokens, aunque las peticiones más largas se rechazan en lugar de truncarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), atención causal estándar; fine-tune LoRA sobre el modelo base |
| Parametros totales | 31.273.086.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (límite declarado; peticiones más largas se rechazan como Unsupported) |
| Tipos de cuantizacion | BF16 (pesos originales), FP8 (cuantización online en vLLM para la ejecución oficial) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 62,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer decoder-only con atención causal propia de Gemma 4. El fine-tune se realizó con LoRA de rango 64 (alpha 128) sobre todas las capas lineales, con learning rate 2e-5, 450 pasos de aproximadamente 65k tokens y secuencias de hasta 16.384 tokens. La loss es entropía cruzada contra objetivos soft (probabilidades) sobre los códigos de opción. Los checkpoints de los pasos 300, 375 y 450 se combinaron mediante un "uniform soup" y se fusionaron en el modelo base a escala completa, guardándose en BF16. El entrenamiento se ejecutó en una NVIDIA B300 durante aproximadamente 7,3 horas en la plataforma de Turion AI.

El mecanismo de inferencia es peculiar: cada pregunta del request se lista antes del estado, y cada opción recibe un código de un solo token (A-Z, luego códigos de dos letras que son tokens únicos de Gemma). Se leen hasta 255 opciones por pregunta en un solo pass. La salida son las log-probabilidades del siguiente token de los códigos de opción, normalizadas sobre las opciones mostradas, con una temperatura por tipo de pregunta (calibration.json: choice 1.18, yes/no 1.18, score 1.12). Para preguntas de elección con pocas opciones se aplica "order averaging" (se puntúa también con las opciones invertidas y se promedia), y las entradas de hasta 12.000 caracteres se repiten una vez en el prompt.

Los datos de entrenamiento son 157.106 filas: 106.680 procedentes de tasksource/tasksource-jev-typed-decisions (439 datasets fuente, solo con etiqueta de uso comercial, más iSarcasmEval MIT y ContractNLI CC BY 4.0) y unas 24,5k tareas sintéticas de decisión escritas y etiquetadas por Gemma-4-31B-it en modo thinking.

## Capacidades

- Clasificación y decisión estructurada: devuelve probabilidades por opción para preguntas de elección múltiple, sí/no y puntuación 0-5, en un único forward pass.
- Enrutamiento y triaje: hasta 255 opciones por pregunta, leídas en un solo pass.
- Procesamiento de estados largos: entradas de hasta 12.000 caracteres (repetidas una vez) y prompts de hasta 65.536 tokens.
- Calibración por tipo de pregunta: temperaturas específicas ajustadas sobre datos held-out.
- Order averaging para preguntas de elección con pocas opciones, reduciendo el sesgo de posición.
- No genera texto: los tokens de salida son siempre 0.
- Soporte de despliegue vía vLLM en proceso, con prefix caching y cuantización FP8 online.
- Servidor compatible con TypeSafe `POST /v1/systemone` incluido.
- No se declaran capacidades de tool calling, agentes multi-paso, visión ni audio en la información disponible (pese a la etiqueta image-text-to-text del pipeline, la model card describe únicamente decisiones tipadas).

## Casos de uso

- Triaje de tickets de soporte: dado el texto de una incidencia, el modelo responde a preguntas tipadas como "¿qué equipo debe gestionarlo? [billing|tech|sales|other]" y "¿urgencia? [can wait|this week|today]", devolviendo probabilidades por opción que permiten enrutar automáticamente con umbrales configurables.
- Enrutamiento de leads comerciales: clasificar consultas entrantes por intención, urgencia y equipo destinatario en un solo pass, con latencia mediana de 116 ms, adecuado para integración síncrona en un CRM.
- Moderación y scoring de contenido: usar preguntas de puntuación 0-5 para asignar niveles de riesgo o calidad a textos, aprovechando la calibración por tipo de pregunta.
- Automatización de decisiones en back-office: evaluar solicitudes (reembolsos, verificaciones, aprobaciones) con preguntas sí/no y de elección, sustituyendo reglas heurísticas por probabilidades calibradas.
- Clasificación multi-etiqueta con muchas opciones: hasta 255 opciones por pregunta en un solo pass, útil para taxonomías amplias de categorías o etiquetas.
- Investigación sobre modelos de decisión: el modelo y sus resultados públicos en el Decision Index permiten reproducir experimentos de "system-one" y comparar con alternativas generativas.
- Servicio de decisión como API: el despliegue incluido (`/v1/systemone`) permite ofrecer decisiones tipadas a aplicaciones internas sin generación de texto, con coste de salida cero.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Decision Index 0.4.1, Full score (pruebas privadas de los mantenedores) | 70,47, puesto #2 empatado |
| Decision Index 0.3, índice público (ejecución propia del suite público) | 66,16 |
| Peticiones del suite público | 140.620 (140.393 ok, 140.178 puntuables, 227 no soportadas, 0 errores) |
| Tiempo por petición, una a una (ejecución oficial) | mediana 116 ms · media 288 ms · p80 352 ms |
| Hardware de la ejecución oficial | 1× NVIDIA RTX PRO 6000 Blackwell Workstation Edition (96 GB), FP8 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos en la información disponible, ya que el modelo no genera texto.

## Requisitos de hardware

- VRAM estimada: el repo pesa 62,6 GB en BF16, por lo que la inferencia en BF16 requiere aproximadamente 63 GB de VRAM más overhead de KV cache; en FP8 se reduce a unos 32 GB de pesos.
- GPU recomendadas: la ejecución oficial usó una NVIDIA RTX PRO 6000 Blackwell Workstation Edition de 96 GB. Para FP8, GPUs con 48-80 GB (A100 80 GB, H100, L40S) son suficientes; para BF16 se necesita al menos 80 GB.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 en BF16; en FP8 tampoco cabe en 24 GB por los pesos (~32 GB) más KV cache.
- Despliegue: vLLM en proceso (versión 0.32.0 en la ejecución oficial), con `max_model_len` 65.600, prefix caching y `gpu_memory_utilization` 0.92; también servidor `turion_jev.serve` compatible con `/v1/systemone`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana 116 ms, media 288 ms y p80 352 ms por petición en una sola GPU, ejecutando una petición a la vez; no se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Turion Jev 31B | 31,3B | 65.536 tokens | Modelo de decisión (probabilidades por opción, sin generación) | Apache 2.0 | Hugging Face + API Turion |
| google/gemma-4-31B-it | no disponible en la información | no disponible | Generativo multimodal (image-text-to-text) | no disponible en la información | Hugging Face |
| Alternativas de modelo de decisión | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos de decisión comparables en la información proporcionada; la comparativa con generativos no es directa porque Turion Jev no produce texto.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier caso de uso que requiera respuestas en lenguaje natural queda fuera de su alcance.
- Las peticiones que superan 65.536 tokens se rechazan como Unsupported, nunca se truncan; en el suite público 0.3 esto afectó a 226 peticiones ToolRet y 1 de BRIGHT.
- El modelo está entrenado sobre datos con etiqueta de uso comercial y datasets sintéticos generados por Gemma-4-31B-it, lo que puede introducir sesgos de esos datasets y del modelo generador.
- Riesgo de alucinación no aplica en el sentido generativo, pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento; la calibración se ajustó sobre datos held-out concretos.
- No se declara lista de idiomas soportados; el rendimiento multilingüe no está documentado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 puede tener condiciones adicionales que deben revisarse.
- El rendimiento publicado (70,47 en el índice Full) proviene de pruebas privadas de los mantenedores, no de una evaluación independiente; el índice público 0.3 arroja 66,16.
- El despliegue oficial requiere hardware profesional (96 GB en FP8); no cabe en GPUs de consumo.
- El ranking #2 es un empate dentro de un grupo de modelos a menos de 0,9 puntos del primero, no una posición única.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turion-ai/turion-jev-31b
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Turion AI: https://turion.ai
- Plataforma de entrenamiento: https://turion.ai/training/
- Precios y límites: https://turion.ai/models/
- Guía de modelos de decisión: https://turion.ai/docs/guides/decision-models/
- Decision Index (Space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Resultados de la ejecución: https://huggingface.co/datasets/turion-ai/turion-jev-31b-decision-index-results/tree/main/runs/turion-jev-31b
- Dataset de entrenamiento: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Repositorio Decision Index: https://github.com/apolinario/decision-index
