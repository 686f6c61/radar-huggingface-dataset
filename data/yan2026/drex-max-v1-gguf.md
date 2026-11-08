# yan2026/drex-max-v1-GGUF

## Resumen

Drex Max v1 es un modelo de decisión de 27 000 millones de parámetros desarrollado por Nace.AI que no genera texto: responde preguntas tipadas (`choice`, `noul`, `score`) sobre un `state` dado en un único pase forward a través de una cabeza de lectura lineal de 255 vías. El backbone es un híbrido de tipo Qwen3.5-27B con 48 capas de atención lineal Gated DeltaNet y 16 capas de atención completa no causal (una de cada cuatro). Esta ficha documenta las cuantizaciones GGUF publicadas por el usuario `yan2026`, derivadas del checkpoint original `nace-ai/drex-max-v1` en bf16.

El interés de esta publicación es práctico: ofrece los formatos Q8_0 y Q4_K_M listos para usar con el fork de llama.cpp de Nace.AI, además de un bf16 intermedio para producir otras cuantizaciones. Los ficheros GGUF incluyen únicamente el backbone de texto; la torre de visión no se convierte, por lo que las entradas con imagen requieren la ruta Python oficial.

Es relevante ahora porque los modelos de decisión con salida estructurada (clasificación, puntuación) están ganando tracción como alternativa a los LLM generativos en pipelines de enrutamiento y triaje, donde la latencia y la determinación de la respuesta importan más que la fluidez del texto. La validación incluida muestra que las cuantizaciones conservan las respuestas de elección con desviaciones de probabilidad dentro de la tolerancia de ±0,03 documentada por el proveedor para 8 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen3.5-27B: 48 capas Gated DeltaNet (atención lineal) + 16 capas de atención completa no causal (una de cada cuatro) |
| Parametros totales | 27B (modelo denso) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16 384 por defecto en el servidor; el backbone soporta hasta 262 144 |
| Tipos de cuantizacion | Q8_0 (8,5 bits/peso), Q4_K_M (4,94 bits/peso), bf16 (16 bits/peso); se pueden generar IQ4_XS, Q5_K_M, etc. desde el bf16 |
| Idiomas soportados | no disponible |
| Licencia | Nace.AI Open RAIL-M (`license_name: nace-ai-open-rail-m`) |
| Formato de pesos | GGUF (safetensors bf16 en el modelo base original) |

## Arquitectura y entrenamiento

El backbone es un transformer híbrido basado en Qwen3.5-27B: 48 capas de atención lineal Gated DeltaNet combinadas con 16 capas de atención completa dispuestas de forma no causal (cada cuarta capa). Sobre ese backbone se añade una cabeza de lectura lineal de 255 vías (`pointer.readout.weight`, en F32) más un tensor de temperatura (`pointer.temperature.weight`, valor 1,0087 tomado de `decision_config.json`). El modelo no decodifica tokens: procesa el prompt completo en un solo pase forward y emite directamente la distribución sobre las opciones o la puntuación solicitada.

La conversión a GGUF se realizó con el fork oficial `nace-ai/llama.cpp` (rama `drex-max-v1`), que elimina la torre de visión, mapea los tensores `language_model.*` al layout qwen35, escribe la cabeza como tensores `pointer.*` y desactiva la atención causal. `llama-quantize` omite automáticamente los tensores `pointer.*`, por lo que la cabeza se mantiene en precisión completa en ambas cuantizaciones. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Clasificación zero-shot mediante preguntas de tipo `choice` con criterios etiquetados (por ejemplo, asignar un ticket a `billing`, `technical` u `other`).
- Puntuación ordinal mediante preguntas de tipo `score` sobre una lista de criterios ordenados (por ejemplo, `Routine`, `Soon`, `Urgent`).
- Respuestas de tipo `noul` (no disponible su semántica exacta en la información proporcionada).
- Múltiples preguntas sobre un mismo `state` resueltas en un único pase forward.
- Enrutamiento y triaje determinista: la salida es una distribución sobre opciones, no texto libre.
- Procesamiento de entradas de hasta 262 144 tokens en el backbone (16 384 por defecto en el servidor).
- Visión: disponible solo por la ruta Python oficial; no incluida en los GGUF.
- Tool calling, agentes y razonamiento multi-paso: no disponible (el modelo no genera texto ni ejecuta bucles de razonamiento).

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket como `state` y responde con preguntas `choice` para el equipo destinatario y `score` para la urgencia, todo en un único forward. El ejemplo de `request.json` de la model card muestra exactamente este flujo con 223 tokens.
- Enrutamiento de correo o formularios: clasificación zero-shot contra un conjunto cerrado de departamentos o categorías definidas en `criteria`, sin necesidad de entrenar un clasificador específico.
- Moderación y etiquetado de contenido: preguntas `choice` con criterios de política (permitido, revisar, bloquear) y `score` de severidad, aprovechando la ventana de contexto para incluir normas extensas.
- Priorización en colas de trabajo: puntuación ordinal de urgencia o impacto sobre descripciones de incidencias, con la distribución completa disponible para umbrales configurables.
- Extracción de decisiones en pipelines de datos: clasificación de documentos o registros con un esquema fijo de preguntas, integrable vía `/v1/systemone` en el servidor llama.cpp del fork.
- Despliegue en hardware sin GPU: la cuantización Q4_K_M (14,75 GiB) permite ejecutar el modelo en CPU con llama.cpp; la validación reportada da 8,0 s para tres preguntas sobre un ticket de 223 tokens en un equipo de 24 núcleos.
- Evaluación comparativa de cuantizaciones: el bf16 intermedio permite generar nuevos tipos (IQ4_XS, Q5_K_M) y medir la degradación de probabilidades frente a la referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye una validación funcional sobre una única petición de ticket (223 tokens):

| Ejecución | Choice `team` | Score `urgency` | Latencia |
|---|---|---:|---:|
| bf16 referencia (H100, model card) | billing 0,9988 | 1,6522 | — |
| Python 8-bit (local, ROCm) | billing 0,9987 | 1,6489 | 3 preguntas, 1 forward |
| GGUF Q8_0 (local, CPU) | billing 0,9993 | 1,7642 | 12,2 s |
| GGUF Q4_K_M (local, CPU) | billing 0,9992 | 1,7526 | 8,0 s |

Ambas cuantizaciones conservan la respuesta de elección; las desviaciones de probabilidad quedan dentro de la tolerancia de ±0,03 documentada por el proveedor para 8 bits, sin inversión de opciones en la distribución de urgencia.

## Requisitos de hardware

- VRAM/RAM para Q8_0: fichero de 25,38 GiB (27 250 125 600 bytes).
- VRAM/RAM para Q4_K_M: fichero de 14,75 GiB (15 837 461 280 bytes).
- bf16: 47,75 GiB, por encima del límite de 46,7 GiB de GTT observado en el equipo de referencia (AMD Radeon 890M, gfx1151); la ruta 8-bit con bitsandbytes 0.50.2 ocupa 25,9 GiB.
- GPU recomendadas: NVIDIA H100 para la referencia bf16 oficial; la ruta Python 8-bit se validó en AMD ROCm (gfx1151). No se especifican GPU NVIDIA consumer concretas en la información disponible.
- Cabe en GPU consumer: no confirmado para Q8_0 ni Q4_K_M en tarjetas de 16-24 GB; la validación publicada se hizo en CPU con llama.cpp.
- Despliegue: fork `nace-ai/llama.cpp` (rama `drex-max-v1`) con `llama-server`, fork `nace-ai/ollama` (rama `drex-max-v1`), Kapitsa, MLX con el checkpoint affine Q4 oficial, y la ruta Python con el modelo original.
- El llama.cpp upstream (probado en master `a691b23`) no puede cargar estos ficheros: rechaza los tensores `pointer.*` (espera 852 tensores, encuentra 850), no soporta el endpoint `/v1/systemone` para este formato y su `qwen35.cpp` ignora `attention.causal = false`.
- Latencia medida en CPU: 12,2 s (Q8_0) y 8,0 s (Q4_K_M) para una petición de 223 tokens con tres preguntas.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de decisión en la información proporcionada. Como referencia del mismo autor y familia, la documentación de Nace.AI menciona Drex v2.0 y Drex v1.5, pero sin datos de parámetros, contexto ni rendimiento que permitan una comparación cuantitativa.

| Modelo | Parámetros | Contexto | Formato de salida | Licencia |
|---|---|---|---|---|
| Drex Max v1 (GGUF, esta ficha) | 27B denso | 262 144 (backbone) | Distribución sobre 255 opciones | Nace.AI Open RAIL-M |
| Drex v2.0 | no disponible | no disponible | no disponible | no disponible |
| Drex v1.5 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo no genera texto: cualquier uso que requiera respuestas en lenguaje natural, tool calling o razonamiento multi-paso no es viable con esta arquitectura.
- Los GGUF no incluyen la torre de visión; las entradas con imagen solo funcionan por la ruta Python oficial.
- Requiere obligatoriamente el fork de llama.cpp de Nace.AI; el upstream no carga los ficheros ni reproduce las puntuaciones de referencia.
- La licencia Nace.AI Open RAIL-M impone restricciones de uso; deben revisarse los términos del fichero `LICENSE` antes de un despliegue comercial.
- Los idiomas soportados no están documentados; el rendimiento fuera del inglés es desconocido.
- La validación publicada se limita a una única petición de ejemplo; no hay evidencia de robustez en dominios distintos al triaje de tickets.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la cabeza de lectura puede producir distribuciones poco calibradas ante entradas fuera de distribución; el proveedor documenta una tolerancia de ±0,03 solo para 8 bits.
- La temperatura de la cabeza (1,0087) está fijada en los tensores; modificarla requiere editar el GGUF o el runtime.
- El autor de la cuantización (`yan2026`) no es el desarrollador original; la reproducibilidad depende del fork y de la versión exacta de las herramientas.

## Enlaces

- [yan2026/drex-max-v1-GGUF en Hugging Face](https://huggingface.co/yan2026/drex-max-v1-GGUF)
- [nace-ai/drex-max-v1 en Hugging Face](https://huggingface.co/nace-ai/drex-max-v1)
- [nace-ai/drex-max-v1-affine-q4 en Hugging Face](https://huggingface.co/nace-ai/drex-max-v1-affine-q4)
- [Repositorio nace-ai/drex-decision-models en GitHub](https://github.com/nace-ai/drex-decision-models/tree/main/models/drex-max-v1)
- [Fork nace-ai/llama.cpp (rama drex-max-v1)](https://github.com/nace-ai/llama.cpp)
- [Fork nace-ai/ollama (rama drex-max-v1)](https://github.com/nace-ai/ollama)
- [llama.cpp upstream](https://github.com/ggml-org/llama.cpp)
