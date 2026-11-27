# vic-8213672341/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 es una versión modificada del modelo `deepseek-ai/DeepSeek-V4.1-Flash-1017` en la que se ha eliminado el comportamiento de rechazo (abliteration) a nivel de pesos, manteniendo intactas todas las capacidades del modelo original: visión, vídeo, niveles de esfuerzo de razonamiento, tool calling, decodificación especulativa DSpark y una ventana de contexto nativa de 1M de tokens. Lo publica el usuario `vic-8213672341` en Hugging Face, con créditos en la model card a `@dealignai` y a `@jordanschenck` por el cómputo.

El modelo es un transformer MoE de 40 capas con 763.205.315.794 parámetros totales (según los metadatos de safetensors), pesos nativos en FP8 (e4m3) con escalas de bloque ue8m0 y expertos MoE en FP4. El repositorio ocupa 510,3 GB repartidos en 48 shards de safetensors. La modificación es exclusivamente a nivel de pesos: no hay cambios en la plantilla de chat, ni en el tokenizador, ni en el prompt de sistema, ni se ha aplicado SFT, RLHF o DPO.

Su relevancia radica en que ofrece un modelo multimodal de gran escala y contexto extremo sin las capas de rechazo del modelo original, manteniendo compatibilidad byte a byte con el motor de inferencia de referencia de DeepSeek. Está pensado para entornos de investigación y despliegues controlados donde el operador asume la responsabilidad total de las salidas, tal como exige el gating de acceso del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE de 40 capas (deepseek_v41) |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 nativo (e4m3) con escalas de bloque ue8m0; expertos MoE en FP4; variante EXL3 2,9 bpw publicada aparte |
| Idiomas soportados | en, zh, es, fr, ru, it, th |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards), 8-bit |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) de 40 capas, etiquetado como `deepseek_v41` en los metadatos. Los pesos se distribuyen en precisión nativa FP8 (formato `e4m3fn`) con escalas de bloque `ue8m0`, y los expertos MoE se almacenan en FP4. El modelo es multimodal: el pipeline declarado es `image-text-to-text` e incluye procesamiento de imagen y vídeo. Incorpora decodificación especulativa DSpark y niveles de esfuerzo de razonamiento (`low`, `high`, `max`).

No se ha realizado ningún entrenamiento nuevo sobre el modelo base: la model card indica explícitamente que no hay SFT, RLHF, DPO, LoRA ni adaptadores. La modificación consiste únicamente en una edición de pesos (abliteration) para eliminar el comportamiento de rechazo, aplicada directamente sobre la fuente FP8 nativa. El tokenizador, la plantilla de chat y el renderizador de prompts (`encoding/`) son idénticos byte a byte a los del modelo original, y el bundle es compatible con el motor `inference/` de referencia de DeepSeek sin cambios de código. No se dispone de información sobre el volumen ni la composición de los datos de entrenamiento originales.

## Capacidades

- Generación de texto y razonamiento con niveles de esfuerzo configurables (`low`, `high`, `max`).
- Comprensión de imagen y vídeo (pipeline image-text-to-text).
- Tool calling y function calling.
- Razonamiento multi-paso y flujos de agente.
- Contexto extremo de hasta 1M de tokens para documentos y conversaciones largas.
- Multilingüe en inglés, chino, español, francés, ruso, italiano y tailandés.
- Decodificación especulativa DSpark para acelerar la generación.
- Comportamiento sin rechazo por temas, preservando el resto de capacidades del modelo base.
- Muestreo recomendado por el autor: `temperature=1.0`, `top_p=1.0`, `max_tokens ≥ 256K`.

## Casos de uso

- Análisis de corpus documentales extensos: con 1M de tokens de contexto, el modelo puede ingerir libros completos, expedientes o bases de código y responder preguntas sobre ellos sin fragmentación.
- Investigación sobre alineación y seguridad: permite estudiar el comportamiento de un modelo de gran escala sin capas de rechazo, comparándolo con el modelo base para analizar cómo la abliteration afecta a las respuestas.
- Procesamiento de vídeo e imagen en pipelines de inspección: la entrada multimodal permite describir, clasificar o extraer información de material audiovisual en tareas de catalogación automatizada.
- Agentes autónomos con tool calling: integrado en un orquestador, el modelo puede encadenar llamadas a funciones y razonamiento multi-paso para tareas de automatización con contexto largo.
- Generación asistida en entornos controlados de investigación creativa: el autor asume la responsabilidad de las salidas, lo que encaja en laboratorios que necesitan respuestas sin filtros sobre temas sensibles.
- Evaluación comparativa de cuantizaciones: sirve como referencia FP8 nativa frente a la variante EXL3 2,9 bpw del mismo autor para medir la degradación de calidad en bits bajos.
- Despliegue multilingüe en siete idiomas para tareas de traducción y análisis de contenido en español, chino, ruso, entre otros.

## Benchmarks y rendimiento

La model card incluye una evaluación interna de MMLU en modo logit (57 asignaturas × 20 preguntas, 1140 preguntas totales), greedy T=0, ejecutada con el motor `inference/` de referencia sobre 4×H200 (TP4). La comparación con el modelo base se hizo contra la API oficial de DeepSeek sirviendo los mismos pesos 1017. El texto proporcionado se interrumpe antes de completar la cifra del modelo base y no incluye el resultado de este repositorio, por lo que no es posible presentar la tabla completa.

| Modelo | MMLU-20×57 | Delta vs base |
|---|---|---|
| DeepSeek-V4.1-Flash-1017 base (API oficial) | 87,63 % (999/1140, dato parcial en el texto disponible) | referencia |
| DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 (este repo) | no disponible en la informacion proporcionada | no disponible |

No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- El repositorio completo ocupa 510,3 GB en safetensors FP8; la inferencia requiere agregar la memoria de activaciones y caché KV, que con 1M de tokens de contexto es muy elevada.
- Los benchmarks internos se ejecutaron sobre 4×H200 con tensor parallelism 4 (TP4), lo que da una referencia mínima de despliegue del orden de 4 GPUs de 141 GB.
- No cabe en GPUs de consumo: ni una RTX 4090 (24 GB) ni varias en conjunto cubren los 510 GB de pesos.
- Opciones de despliegue: el motor `inference/` de referencia de DeepSeek incluido en el repositorio, con compatibilidad byte a byte con el modelo base; el pipeline de transformers está declarado en la librería. No se documentan en la información disponible recetas para vLLM, llama.cpp, Ollama o TGI.
- No se dispone de datos de latencia ni throughput más allá de la mención a la decodificación especulativa DSpark y a la ejecución en 4×H200.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 (este) | 763.205.315.794 | 1M | MIT | Abliterado, FP8 nativo, multimodal |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | no disponible en la informacion | 1M | no disponible en la informacion | Modelo original con rechazo intacto |
| dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED | no disponible en la informacion | 1M | no disponible en la informacion | Misma abliteration rehacida end-to-end en 2,9 bpw |
| dealignai/DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8 | 763.205.315.794 | 1M | MIT | Alias del mismo repositorio |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo sin capas de rechazo: puede generar contenido dañino, ilegal o sensible según la jurisdicción; el autor exige confirmar mayoría de edad y responsabilidad total sobre las salidas mediante gating.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se documentan evaluaciones de factualidad en la información disponible.
- El autor advierte que cuantizar directamente este checkpoint FP8 a bits bajos acumula error sobre la edición de abliteration y puede degradar el cumplimiento; recomienda rehacer el pipeline en la precisión objetivo.
- El contexto de 1M de tokens implica costes de memoria y latencia muy elevados; no es viable en hardware de consumo.
- La licencia MIT permite uso comercial, pero el gating de acceso y la responsabilidad legal recaen sobre el solicitante.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria publicada.
- La información sobre parámetros activos y composición del entrenamiento original no está disponible.
- La model card solicita atribución si se redistribuye, cuantiza, ajusta o publica sobre el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/vic-8213672341/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Alias abliterado: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8
- Variante EXL3 2,9 bpw: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED
- Twitter del autor: https://twitter.com/dealignai
- Twitter del proveedor de cómputo: https://twitter.com/jordanschenck
- Ko-fi del autor: https://ko-fi.com/dealignai
