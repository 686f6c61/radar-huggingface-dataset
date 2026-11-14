# ZhuYuhan/TimeLens2-9B-SFT

## Resumen

TimeLens2-9B-SFT es un modelo de lenguaje y vision especializado en *temporal grounding* de video: dado un vídeo y una consulta textual, devuelve los intervalos temporales (en segundos) en los que la consulta es relevante. Lo desarrolla ZhuYuhan (en el contexto del proyecto TimeLens2, con repositorio en MCG-NJU) y se construye como un fine-tuning supervisado (SFT) del modelo base Qwen/Qwen3.5-9B, lo que le confiere la arquitectura multimodal de Qwen3.5 y una ventana de contexto amplia heredada del modelo original.

El modelo resuelve un problema clásico de recuperación temporal en vídeo (moment retrieval / temporal grounding), pero lo aborda como una tarea generativa: en lugar de puntuar candidatos, produce directamente un array JSON de pares `[start, end]` en segundos. Es relevante ahora porque los benchmarks de grounding temporal (Charades-STA, ActivityNet Captions, QVHighlights, VUE-TR, Ego4D-NLQ) siguen siendo difíciles para los MLLM generalistas, y este modelo reporta un mIoU medio de 49,08 % sobre siete benchmarks, con resultados especialmente sólidos en QVHighlights (71,85 %).

Tiene 9.409.813.744 parámetros (≈9,4 B), formato safetensors, licencia Apache 2.0 y está pensado para inferencia con transformers y flash-attention 2. La variante SFT sugiere que existe (o existirá) una variante adicional, presumiblemente tras RL, aunque la información disponible solo documenta esta versión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text / video-text-to-text), derivada de Qwen3.5-9B |
| Parametros totales | 9.409.813.744 (≈9,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3.5-9B) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponibles (la model card no los enumera) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |
| Parametros de inferencia documentados | `fps=2.0`, `min_pixels=32*32`, `max_pixels=480*480`, `image_patch_size=16`, `max_new_tokens=4096`, `do_sample=False` |
| Libreria / version | transformers==5.14.1, accelerate, qwen-vl-utils>=0.0.14, flash-attn |
| Tamano del repositorio | 18,8 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un MLLM de ~9,4 B parámetros, y se ajusta mediante SFT para la tarea de temporal grounding. La arquitectura es, por tanto, la del modelo base: un transformer multimodal que procesa tokens de texto y tokens visuales de vídeo (muestreados a 2 fps en la configuración de inferencia recomendada) y genera texto autorregresivamente. La salida esperada es un array JSON de intervalos `[start, end]` en segundos, lo que convierte el grounding en una tarea de generación estructurada en lugar de clasificación/regresión sobre candidatos.

No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF/DPO. La model card solo indica que esta es la variante SFT y remite al paper (arXiv:2607.17423) para los detalles de entrenamiento. La innovación destacable, a nivel de uso, es la formulación generativa multi-span: el prompt exige "ALL time spans" y el modelo devuelve una lista JSON, lo que permite recuperar varios momentos relevantes en un mismo vídeo con una sola pasada. En inferencia se recomienda `enable_thinking=False`, es decir, se desactiva el modo de razonamiento extendido del modelo base para esta tarea.

## Capacidades

- Localización temporal de eventos en vídeo a partir de una consulta en lenguaje natural, devolviendo intervalos en segundos.
- Salida multi-span: puede devolver varios intervalos relevantes para una misma consulta en formato JSON.
- Procesamiento conjunto de vídeo (muestreo de frames a fps configurable) y texto.
- Generación estructurada: el formato de salida JSON es impuesto por prompt y respetado de forma consistente en la evaluación reportada.
- Herencia de las capacidades del modelo base Qwen3.5-9B (comprensión visual y de texto general), aunque el fine-tuning está orientado a grounding.
- Modo thinking del modelo base disponible pero recomendado desactivado (`enable_thinking=False`) para esta tarea.
- No se documenta soporte explícito de tool calling, function calling ni comportamiento de agente multi-paso en la información disponible.

## Casos de uso

- Búsqueda y recuperación de momentos en archivos audiovisuales: indexar una videoteca y, dada una consulta ("un hombre abre la nevera"), obtener los intervalos exactos para clipping o navegación. Adecuado por su salida multi-span y su mIoU de 60,73 % en Charades-STA.
- Generación automática de clips para redes sociales o resúmenes: localizar los tramos relevantes de un vídeo largo y extraerlos con ffmpeg usando los timestamps devueltos en JSON.
- Anotación asistida de datasets de vídeo: pre-anotar intervalos temporales para revisión humana, reduciendo el coste de etiquetado en tareas de moment retrieval.
- Análisis de vídeo egocéntrico: localizar acciones en grabaciones en primera persona; el modelo reporta resultados en Ego4D-NLQ-v2 (22,04 % mIoU), útiles como primera pasada aunque con margen de mejora.
- Monitorización de contenido audiovisual: detectar cuándo ocurre un evento concreto (p. ej., una acción de seguridad) en grabaciones largas y devolver los tramos para revisión.
- Publicidad y análisis de marca: localizar apariciones de productos o acciones en material promocional y devolver los intervalos para métricas de exposición.
- Integración en pipelines de vídeo bajo demanda: servicio que recibe vídeo + query y devuelve JSON de intervalos, desplegable con transformers + flash-attention 2.

## Benchmarks y rendimiento

| Benchmark | Consultas evaluadas | mIoU (%) |
|---|---:|---:|
| Charades-STA | 3363 | 60,73 |
| ActivityNet Captions | 4500 | 62,43 |
| QVHighlights | 1541 | 71,85 |
| VUE-TR | 532/562 | 49,56 |
| VUE-TR-v2 | 725/727 | 47,45 |
| MomentSeeker | 1000 | 29,53 |
| Ego4D-NLQ-v2 | 4552 | 22,04 |
| **Media (no ponderada)** | — | **49,08** |

Las fracciones en VUE-TR y VUE-TR-v2 indican la cobertura de vídeo disponible. La media es la media no ponderada de los siete benchmarks. No se proporcionan comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 9,4 B parámetros en safetensors (≈18,8 GB en bf16/fp16), se necesita al menos ~19-20 GB de VRAM para pesos en precisión completa más overhead de activaciones y frames de vídeo; no se documentan cifras oficiales.
- GPU recomendadas: no especificadas por el autor. Por tamaño, encaja en A100 40/80 GB, H100, L40S y RTX 4090 (24 GB) con precisión bf16 ajustada; en GPUs de 16 GB requeriría cuantización, no documentada.
- ¿Cabe en GPU consumer? RTX 4090 (24 GB) es la candidata natural; GPUs de 12-16 GB no están cubiertas por la documentación disponible.
- Opciones de despliegue: transformers (versión 5.14.1) con `AutoModelForImageTextToText` y `AutoProcessor`, flash-attention 2, accelerate para `device_map="auto"`, qwen-vl-utils con decord para lectura de vídeo. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La configuración recomendada usa `do_sample=False` y `max_new_tokens=4096`, lo que sugiere generación determinista y respuestas acotadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TimeLens2-9B-SFT | ≈9,4 B | no disponible | Temporal grounding de vídeo | Apache 2.0 | Hugging Face (ZhuYuhan/TimeLens2-9B-SFT) |
| Qwen3.5-9B (base) | ≈9,4 B | no disponible | MLLM generalista | según modelo base (no detallada aquí) | Hugging Face (Qwen/Qwen3.5-9B) |
| Alternativas especializadas en grounding | no disponible | no disponible | Temporal grounding | no disponible | no disponible |

No se dispone en la información proporcionada de resultados comparativos con otros modelos de grounding temporal ni de alternativas de la misma categoría con especificaciones verificables.

## Limitaciones y advertencias

- Resultados débiles en egocéntrico y consultas complejas: Ego4D-NLQ-v2 (22,04 %) y MomentSeeker (29,53 %) indican que el modelo falla con frecuencia en dominios alejados del entrenamiento y en consultas ambiguas.
- Cobertura parcial de vídeo en algunos benchmarks (VUE-TR: 532/562; VUE-TR-v2: 725/727), lo que matiza la comparabilidad de esas cifras.
- Riesgo de alucinación de timestamps: al ser generativo, puede producir intervalos plausibles pero incorrectos, especialmente en vídeos largos o con eventos sutiles.
- Dependencia del muestreo de frames: fps=2.0 y max_pixels=480*480 en la configuración recomendada; bajar estos valores puede degradar la precisión temporal.
- Idiomas no documentados: la model card no enumera idiomas soportados; el prompt de ejemplo está en inglés, por lo que el rendimiento en castellano no está verificado.
- Contexto máximo no documentado en la información disponible; vídeos muy largos pueden exceder la ventana efectiva.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B y del dataset de entrenamiento (no detalladas aquí).
- Modelo muy reciente y con 0 descargas / 0 likes en el momento de la consulta: ecosistema y validación externa limitados.
- No se documentan cuantizaciones ni formatos GGUF/Ollama, lo que limita el despliegue en entornos con poca VRAM.

## Enlaces

- Hugging Face: https://huggingface.co/ZhuYuhan/TimeLens2-9B-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper: https://arxiv.org/abs/2607.17423
- Código: https://github.com/MCG-NJU/TimeLens2
- Colección: https://huggingface.co/collections/MCG-NJU/timelens2
