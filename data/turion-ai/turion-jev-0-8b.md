# turion-ai/turion-jev-0.8b

## Resumen

Turion Jev 0.8B es un modelo de decisión desarrollado por Turion AI, obtenido mediante un ajuste fino (LoRA fusionado) del modelo base Qwen/Qwen3.5-0.8B. No es un modelo generativo de texto: dado un estado (texto libre) y un conjunto de preguntas tipadas (elección múltiple, sí/no o puntuación de 0 a 5), devuelve una distribución de probabilidad sobre cada opción leyendo las log-probabilidades de los tokens de código de las opciones en un único forward pass. Se publica como el hermano pequeño del Turion Jev 31B, con los mismos datos de entrenamiento, prompt y mecanismo de lectura, pero sobre una base que cabe en un portátil.

El modelo resuelve el problema del enrutamiento y la clasificación estructurada con probabilidades calibradas: en lugar de generar una respuesta textual y parsearla, expone directamente la probabilidad de cada opción. Esto lo hace adecuado para tareas de triaje, enrutamiento de tickets, etiquetado y decisiones de sistema uno (rápidas, reactivas) dentro de pipelines de agentes.

Con 752 millones de parámetros, licencia Apache-2.0 y pesos disponibles en safetensors y GGUF, es relevante ahora porque permite desplegar un clasificador probabilístico de decisiones en CPU o en GPUs de consumo, con latencias declaradas de mediana 67 ms y media 60 ms en un H200, y sin necesidad de generar texto. Su contexto de entrada práctico está limitado a 65.536 tokens, con rechazo de prompts superiores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con cabeza de lectura sobre log-probabilidades de tokens de opción; sin torre de visión |
| Parámetros totales | 752.393.024 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens como máximo; se rechazan prompts superiores. Entradas de hasta 12.000 caracteres se repiten una vez en el prompt |
| Tipos de cuantización | GGUF Q4_K_M disponible en el repositorio `turion-ai/turion-jev-0.8b-GGUF`; pesos originales en BF16 |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache-2.0 (las fuentes de datos de entrenamiento conservan sus propias licencias) |
| Formato de pesos | safetensors (BF16) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte del language model de Qwen3.5-0.8B, un transformer decoder-only, y no incluye la torre de visión del modelo base. Sobre todas las capas lineales se aplica un LoRA de rango 128 y alpha 256, con learning rate 5e-05, durante 1500 pasos de aproximadamente 65.000 tokens cada uno, con secuencias de hasta 16.384 tokens. Las opciones se barajan y las entradas de hasta 12.000 caracteres se repiten una vez en el prompt. La función de pérdida es entropía cruzada contra objetivos suaves (distribuciones de probabilidad) sobre los códigos de opción.

Tras el entrenamiento se realiza un "model soup" uniforme de tres checkpoints (pasos 1400, 1450 y el último), fusionado en la base a escala completa y guardado en BF16. La calibración se ajusta por tipo de pregunta sobre datos de retención, con temperaturas de 1,15 para elección, 1,26 para sí/no y 1,18 para puntuación. El conjunto de entrenamiento es el mismo del Turion Jev 31B: 157.106 filas, con 106.680 filas procedentes de 439 datasets fuente etiquetados para uso comercial, más iSarcasmEval (MIT) y ContractNLI (CC BY 4.0). El cómputo declarado es de aproximadamente 2,0 horas en una NVIDIA H200.

El mecanismo de lectura es la innovación central: cada opción recibe un código de un token (A–Z y luego códigos de dos letras que son un único token), con hasta 255 opciones por pregunta leídas en un solo paso. Se normalizan las log-probabilidades del siguiente token sobre las opciones mostradas y se aplica la temperatura correspondiente al tipo de pregunta.

## Capacidades

- Clasificación probabilística de decisiones: devuelve una probabilidad por opción en lugar de texto generado.
- Preguntas de elección múltiple con hasta 255 opciones por pregunta en un solo forward pass.
- Preguntas de sí/no y de puntuación en escala 0–5.
- Procesamiento de estados en texto libre con contexto de hasta 65.536 tokens.
- Repetición automática de entradas de hasta 12.000 caracteres para mejorar la lectura.
- Salida calibrada por tipo de pregunta mediante temperaturas ajustadas en datos de retención.
- No soporta tool calling ni function calling: no genera texto ni llamadas a herramientas.
- No soporta razonamiento multi-paso generativo; cada decisión se resuelve en un único paso.
- Capacidades multilingües: no disponibles (no declaradas).
- Capacidades especiales: modo de decisión de sistema uno con lectura de log-probabilidades, sin cadena de pensamiento.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, el modelo devuelve la probabilidad de cada equipo (facturación, técnico, ventas, otros) y de si requiere respuesta el mismo día, tal como muestra el ejemplo de la model card con el endpoint `/v1/systemone`.
- Triaje de bandeja de entrada: clasificación de correos entrantes en categorías y prioridades con probabilidades, lo que permite umbrales de confianza y derivación a revisión humana cuando la probabilidad máxima es baja.
- Etiquetado de datos a escala: asignación de etiquetas probabilísticas a grandes volúmenes de texto sin generar salidas textuales, con un coste por petición bajo y latencias de decenas de milisegundos.
- Decisiones dentro de agentes: el modelo actúa como componente de sistema uno que decide el siguiente paso de un agente (herramienta, ruta o política) a partir del estado actual, sin consumir tokens en razonamiento explícito.
- Moderación y clasificación de contenido: puntuación de 0 a 5 o sí/no sobre criterios definidos, con probabilidades calibradas para fijar políticas de actuación.
- Evaluación de encuestas y formularios: conversión de respuestas abiertas en decisiones tipadas con distribución de probabilidad, útil para análisis agregado y detección de ambigüedad.
- Despliegue en entornos sin GPU: gracias a los GGUF Q4_K_M y a llama.cpp, puede ejecutarse en CPU o en Apple silicon para clasificación de bajo volumen en local.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Decision Index, índice público, suite 0.3 (estimado sobre muestra estratificada de 4.214 peticiones) | 26,0 |
| Proxy Full en conjuntos de retención (0,6 × dominios vistos + 0,4 × dominios nuevos) | 68,28 |
| Tiempo por petición en conjuntos de retención, una petición a la vez | mediana 67 ms · media 60 ms |
| Hardware de las mediciones anteriores | una NVIDIA H200 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en BF16 para los pesos; menos de 1 GB con cuantización Q4_K_M.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para BF16; las mediciones oficiales se realizaron en una NVIDIA H200.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) con la cuantización adecuada.
- Opciones de despliegue: llama.cpp (backend `gguf`), vLLM (backend `vllm`), transformers (backend `hf`) mediante el paquete `turion_jev.serve`; también API hospedada de Turion con clave de Turion.
- Latencia y throughput: mediana de 67 ms y media de 60 ms por petición en H200, una petición a la vez; no se declaran cifras de throughput por lotes ni latencias en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Turion Jev 0.8B | 752 M | 65.536 tokens | Decisión probabilística (sistema uno) | Apache-2.0 | Hugging Face (safetensors y GGUF) |
| Turion Jev 31B | no disponible en la información | no disponible en la información | Decisión probabilística (sistema uno) | no disponible en la información | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B (aproximado) | no disponible en la información | Generación de texto | no disponible en la información | Hugging Face |

La comparación con clasificadores generativos convencionales no está disponible en la información proporcionada. El propio autor indica que el 0.8B queda por detrás del 31B en razonamiento difícil y en dominios alejados de sus datos de entrenamiento.

## Limitaciones y advertencias

- Modelo pequeño: rinde peor que el Turion Jev 31B en razonamiento difícil y en dominios alejados de los datos de entrenamiento; el autor recomienda el 31B cuando la precisión importa más que el coste.
- Rechaza prompts de más de 65.536 tokens.
- La atención es la del modelo base; no lee el prompt de forma bidireccional.
- Las probabilidades están calibradas sobre los datos de retención del autor; es necesario verificar la calibración sobre datos propios antes de confiar en los valores.
- No genera texto: no es adecuado para tareas de generación, resumen, diálogo abierto ni tool calling.
- Sesgos conocidos: no disponibles en la información proporcionada; al entrenarse sobre 439 datasets fuente, puede heredar sesgos de esos corpus.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las probabilidades pueden ser poco fiables fuera de la distribución de entrenamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero las fuentes de datos de entrenamiento conservan sus propias licencias y deben revisarse.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turion-ai/turion-jev-0.8b
- Repositorio GGUF: https://huggingface.co/turion-ai/turion-jev-0.8b-GGUF
- Modelo hermano de 31B: https://huggingface.co/turion-ai/turion-jev-31b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Sitio de Turion AI: https://turion.ai
- Precios y límites de la API: https://turion.ai/models/
- Guía de modelos de decisión: https://turion.ai/docs/guides/decision-models/
- Organización en GitHub: https://github.com/turion-ai
- Repositorio Decision Index: https://github.com/apolinario/decision-index
- Dataset de decisiones tipadas: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
