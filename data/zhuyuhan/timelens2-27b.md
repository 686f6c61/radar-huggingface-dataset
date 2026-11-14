# ZhuYuhan/TimeLens2-27B

## Resumen

TimeLens2-27B es un modelo de lenguaje y vídeo especializado en *temporal grounding*: dado un vídeo y una consulta en lenguaje natural, devuelve los intervalos temporales (en segundos) en los que la consulta es relevante. Lo desarrolla ZhuYuhan (con coautores del grupo MCG-NJU, según la cita del paper) y se construye como un *fine-tune* del modelo base Qwen/Qwen3.8-27B, heredando su arquitectura multimodal de tipo transformer con torre visual.

El modelo resuelve un problema concreto y bien delimitado dentro del análisis de vídeo: la localización precisa de momentos, una tarea clave para sistemas de búsqueda semántica en vídeo, resumen automático, indexación de archivos audiovisuales y agentes que necesitan referenciar fragmentos concretos de un vídeo. Frente a modelos generalistas que responden con descripciones vagas, TimeLens2 está entrenado para emitir directamente un array JSON de pares `[start, end]`, lo que facilita su integración en pipelines.

Con 27.356 millones de parámetros y pesos en safetensors (repo de 54,7 GB), se distribuye bajo licencia Apache 2.0 y se apoya en la librería transformers (versión 5.14.1 en el ejemplo de inferencia). Es relevante ahora porque cubre una necesidad creciente de *grounding* temporal fiable en aplicaciones de vídeo a gran escala, con resultados publicados en siete benchmarks de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text / video-text-to-text), fine-tune de Qwen/Qwen3.8-27B |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo usa `dtype="auto"`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TimeLens2-27B es un *fine-tune* del modelo Qwen/Qwen3.8-27B, por lo que hereda la arquitectura multimodal de este (procesador de imagen/vídeo más un modelo de lenguaje transformer). El pipeline declarado es `video-text-to-text` y la etiqueta de arquitectura es `qwen3_5`. El procesamiento de vídeo se realiza mediante `qwen-vl-utils` con extracción de fotogramas a una tasa configurable (el ejemplo usa `fps: 2.0`) y control de resolución mediante `min_pixels` y `max_pixels` (32×32 a 480×480 en el ejemplo).

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo se presenta específicamente como especializado en *temporal grounding* y el ejemplo de inferencia desactiva el modo *thinking* (`enable_thinking=False`), lo que sugiere que el modelo base dispone de un modo de razonamiento que aquí se desactiva para la tarea de localización. La innovación principal es la formulación de la salida como un array JSON de intervalos `[start, end]` en segundos, entrenada de forma supervisada sobre benchmarks de *grounding*.

## Capacidades

- Localización temporal de momentos en vídeo (*temporal grounding*): devuelve todos los intervalos `[start, end]` en segundos relevantes para una consulta textual.
- Comprensión de vídeo y texto conjunta (entrada vídeo + consulta en lenguaje natural).
- Generación estructurada: salida en formato JSON de pares de intervalos, apta para consumo programático.
- Soporte de múltiples intervalos por consulta ("return ALL time spans").
- Procesamiento de vídeo con control de FPS y resolución de fotogramas.
- Modo *thinking* disponible en el modelo base (desactivado en el ejemplo de inferencia).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión estática (imágenes): el pipeline es video-text-to-text; no se detalla soporte específico de imagen suelta.

## Casos de uso

- Búsqueda semántica en archivos audiovisuales: indexar una videoteca y, dada una consulta como "un hombre abre la nevera", recuperar los intervalos exactos en segundos donde ocurre, gracias a la salida JSON estructurada.
- Resumen automático de vídeo: usar los intervalos localizados para extraer solo los fragmentos relevantes antes de pasarlos a un modelo de resumen, reduciendo coste computacional.
- Generación de clips y *highlights*: alimentar un pipeline de edición que corte automáticamente los momentos identificados (por ejemplo, en deportes o retransmisiones).
- Moderación y auditoría de contenido en vídeo: localizar apariciones de objetos, acciones o escenas concretas para revisión humana posterior.
- Anotación asistida de datasets: acelerar el etiquetado temporal de vídeo para entrenar otros modelos, generando propuestas de intervalos que un humano valida.
- Agentes que razonan sobre vídeo: integrar el modelo como herramienta que devuelve referencias temporales precisas, permitiendo a un agente de nivel superior responder preguntas del tipo "¿en qué minuto ocurre X?".
- Análisis de vídeo egocéntrico (Ego4D): localización de momentos en grabaciones en primera persona para aplicaciones de asistencia o análisis de actividad.

## Benchmarks y rendimiento

Resultados publicados en la model card (mIoU, %):

| Benchmark | Consultas evaluadas | mIoU (%) |
|---|---:|---:|
| Charades-STA | 3363 | 61,17 |
| ActivityNet Captions | 4500 | 63,75 |
| QVHighlights | 1541 | 71,10 |
| VUE-TR | 532/562 | 56,34 |
| VUE-TR-v2 | 725/727 | 53,74 |
| MomentSeeker | 1000 | 31,77 |
| Ego4D-NLQ-v2 | 4552 | 23,04 |
| **Media** | — | **51,56** |

Las fracciones indican la cobertura de vídeos disponibles en los dos benchmarks VUE. La media es la media no ponderada de los siete benchmarks. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 27,36 mil millones de parámetros, en FP16/BF16 los pesos ocupan aproximadamente 54,7 GB, por lo que se requiere al menos una GPU de 80 GB (A100/H100) para inferencia completa sin cuantizar.
- GPU recomendadas: A100 80 GB, H100 80 GB; el ejemplo usa `device_map="auto"`, lo que permite repartir el modelo entre varias GPU.
- ¿Cabe en GPU de consumo? No en FP16 en una sola GPU de 24 GB. Sería necesario cuantizar (no se documentan cuantizaciones oficiales) o usar múltiples GPU.
- Opciones de despliegue: transformers (versión 5.14.1 en el ejemplo) con `flash-attn` (FlashAttention 2), `accelerate` y `qwen-vl-utils[decord]`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento ni especificaciones de modelos comparables de la misma categoría (grounding temporal de vídeo). Por tanto:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TimeLens2-27B | 27,36 B | no disponible | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El rendimiento es muy desigual entre benchmarks: mIoU de 71,10 en QVHighlights frente a 23,04 en Ego4D-NLQ-v2 y 31,77 en MomentSeeker, lo que indica dificultades en vídeo egocéntrico y consultas complejas.
- Riesgo de alucinación de intervalos: al generar tiempos en segundos, puede producir intervalos plausibles pero incorrectos; conviene validar contra la duración real del vídeo.
- La calidad depende de la configuración de muestreo de fotogramas (`fps`) y resolución (`max_pixels`); valores bajos pueden omitir eventos breves.
- No se documentan idiomas soportados; el comportamiento multilingüe es incierto.
- No se especifica la longitud de contexto, lo que limita la planificación para vídeos largos.
- No se documentan cuantizaciones oficiales; desplegar en hardware limitado requiere cuantizar por cuenta propia con posible degradación.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia del modelo base Qwen/Qwen3.8-27B y de los datasets de entrenamiento.
- Modelo con 0 descargas y 0 *likes* en el momento de la consulta: poca validación comunitaria; conviene evaluar en el dominio propio antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZhuYuhan/TimeLens2-27B
- Paper: https://arxiv.org/abs/2607.17423
- Código: https://github.com/MCG-NJU/TimeLens2
- Colección: https://huggingface.co/collections/MCG-NJU/timelens2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
