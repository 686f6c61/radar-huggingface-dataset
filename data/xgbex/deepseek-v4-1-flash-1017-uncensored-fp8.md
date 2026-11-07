# xgbex/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 es una versión modificada a nivel de pesos del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario xgbex (con créditos a dealignai) bajo licencia MIT. El modelo conserva la arquitectura Mixture-of-Experts (MoE) de 40 capas del original, con 763.205.315.794 parámetros totales según los safetensors, y una ventana de contexto de 1 millón de tokens. La modificación consiste en la eliminación del comportamiento de rechazo (abliteration) directamente sobre los pesos en FP8 nativo, sin reentrenamiento, sin LoRA y sin modificaciones del tokenizador ni de la plantilla de chat.

El interés de esta ficha radica en que se trata de un derivado no oficial de un modelo multimodal de gran escala que preserva todas las capacidades del original (visión, vídeo, tool calling, niveles de esfuerzo de razonamiento y decodificación especulativa DSpark) mientras elimina las negativas a responder. Está empaquetado en FP8 e4m3 con escalas de bloque ue8m0 y expertos en FP4, lo que lo hace compatible byte a byte con el motor de inferencia de referencia de DeepSeek.

El repositorio ocupa 510,3 GB repartidos en 48 shards de safetensors y no registra descargas ni likes en el momento de la consulta. Es relevante ahora porque ejemplifica la práctica del abliteration sobre checkpoints nativos de baja precisión, un enfoque que evita la degradación típica de cuantizar un modelo ya editado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE de 40 capas (deepseek_v41) |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 e4m3 nativo con escalas de bloque ue8m0 y expertos FP4; existe un hermano EXL3 de 2,9 bpw |
| Idiomas soportados | en, zh, es, fr, ru, it, th |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards), 8-bit |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) de 40 capas, identificado en los tags como `deepseek_v41`. Los pesos se distribuyen en FP8 e4m3 con escalas de bloque ue8m0 para los tensores densos y FP4 para los expertos MoE, la misma precisión que distribuye DeepSeek en el modelo base. El repositorio incluye el motor `inference/` de referencia y el renderizador de prompts `encoding/` sin cambios, de modo que cualquier stack capaz de cargar el modelo original carga este.

No se ha realizado ningún entrenamiento adicional: la model card indica explícitamente que no hay SFT, RLHF, DPO ni ajuste de preferencias sobre datos de rechazo. La modificación es exclusivamente a nivel de pesos (abliteration) aplicada sobre el checkpoint FP8 nativo, sin conversión intermedia a GGUF ni trucos de empaquetado que reduzcan la precisión. Se preservan las capacidades del original, incluida la decodificación especulativa DSpark y los niveles de esfuerzo de razonamiento (`low`, `high`, `max`). La model card advierte que cuantizar directamente este checkpoint FP8 a bits bajos acumula error sobre la edición de abliteration y puede degradar el cumplimiento, por lo que recomienda rehacer el pipeline sobre la precisión objetivo.

## Capacidades

- Generación de texto y razonamiento con niveles de esfuerzo configurables (`low`, `high`, `max`).
- Comprensión de imagen y vídeo (pipeline `image-text-to-text`), con marcas de tiempo por fotograma según la documentación del modelo base.
- Tool calling y function calling.
- Razonamiento multi-paso y uso en agentes.
- Capacidades multilingües en inglés, chino, español, francés, ruso, italiano y tailandés.
- Contexto nativo de 1 millón de tokens para documentos y conversaciones extensas.
- Decodificación especulativa DSpark para acelerar la generación.
- Comportamiento sin rechazos (uncensored) sobre las categorías de temas que el modelo base declinaba.

## Casos de uso

- Análisis de documentación técnica extensa: con 1M tokens de contexto se puede cargar un repositorio completo o un conjunto de manuales y hacer preguntas cruzadas sin trocear el material.
- Procesamiento de vídeo e imagen en pipelines de inspección: el modelo acepta entradas multimodales y puede describir, localizar temporalmente eventos y responder preguntas sobre fotogramas concretos.
- Agentes autónomos con herramientas: el soporte de tool calling y razonamiento multi-paso permite encadenar llamadas a APIs, consultas a bases de datos y validaciones intermedias.
- Asistencia en investigación sobre temas sensibles: al no rechazar por categoría temática, resulta útil en estudios de seguridad, análisis de contenido o red teaming controlado, siempre bajo revisión humana.
- Generación y revisión de código en pipelines de CI/CD: puede integrarse como paso de revisión con llamadas a herramientas de test y análisis estático.
- Atención al cliente multilingüe: cubre siete idiomas y mantiene contexto largo de conversación, adecuado para hilos de soporte con historial extenso.
- Traducción y localización con contexto amplio: la ventana de 1M tokens permite mantener glosarios y memoria de traducción completos dentro del propio prompt.

## Benchmarks y rendimiento

La model card incluye una evaluación interna de MMLU en modo logit (57 materias × 20 preguntas, 1140 en total), con prompt idéntico, modo chat sin razonamiento y decodificación greedy T=0, ejecutada sobre 4×H200 con TP4 a través del motor `inference/` de referencia. El texto disponible se interrumpe antes de completar la tabla, por lo que solo consta el resultado del modelo base.

| Modelo | MMLU-20×57 | Δ vs base |
|---|---:|---:|
| DeepSeek-V4.1-Flash-1017 base (API oficial) | 87,63 % (999/1140) | — |
| DeepSeek-V4.1-Flash-1017 UNCENSORED FP8 (este repo) | no disponible en la información proporcionada | no disponible |

No se han publicado en la información disponible resultados completos de HumanEval, GSM8K ni de las evaluaciones multimodales OmniCompass-VL del modelo base.

## Requisitos de hardware

- El repositorio pesa 510,3 GB en FP8, por lo que la inferencia requiere al menos ese volumen de memoria agregada entre GPUs.
- La evaluación interna se ejecutó en 4×H200 con tensor parallelism 4, lo que sugiere que este es el mínimo práctico para el checkpoint completo.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) en su precisión nativa; requeriría cuantizaciones de bits bajos derivadas del pipeline de abliteration, no de este bundle.
- Despliegue previsto con el motor `inference/` de referencia de DeepSeek incluido en el repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 (este) | 763,2 B | 1M | MIT | Sí (imagen y vídeo) | Abliterated, FP8 nativo, sin descargas registradas |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | 763,2 B | 1M | no disponible en la información | Sí | Modelo oficial, con rechazos, MMLU 87,63 % |
| dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED | no disponible | 1M | no disponible | Sí | Variante abliterated en EXL3 2,9 bpw, construida de extremo a extremo |
| dealignai/DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8 | 763,2 B | 1M | no disponible | Sí | Alias del mismo repositorio según la model card |

## Limitaciones y advertencias

- Modelo sin censura: puede generar contenido dañino, ilegal o explícito; la model card exige confirmar mayoría de edad y responsabilidad total sobre las salidas mediante acceso restringido.
- Riesgo de alucinación inherente a los modelos de gran escala, sin datos específicos de evaluación en la información disponible.
- La edición de abliteration puede degradar capacidades en dominios concretos; solo consta una evaluación parcial de MMLU y no se dispone del resultado de este checkpoint.
- Cuantizar este FP8 a bits bajos acumula error sobre la edición y puede reintroducir rechazos; se recomienda rehacer el pipeline sobre la precisión objetivo.
- La licencia MIT del repositorio no exime del cumplimiento de la legislación aplicable ni de las condiciones del modelo base de DeepSeek.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia comunitaria de validación independiente.
- El acceso está sujeto a aprobación discrecional del propietario del repositorio.
- La información de benchmarks está incompleta en la model card disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/xgbex/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio de referencia del autor del abliteration: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Alias abliterated FP8: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8
- Variante EXL3 2,9 bpw: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED
- Twitter del autor del abliteration: https://twitter.com/dealignai
- Twitter del proveedor de cómputo: https://twitter.com/jordanschenck
- Apoyo al desarrollo: https://ko-fi.com/dealignai
