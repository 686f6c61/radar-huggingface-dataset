# ZhuYuhan/TimeLens2-35B-A3B

## Resumen

TimeLens2-35B-A3B es un modelo de lenguaje y vídeo especializado en *temporal grounding* (localización temporal de eventos), desarrollado por ZhuYuhan y el grupo MCG-NJU. Se construye como un *finetune* supervisado sobre Qwen/Qwen3.6-35B-A3B, un modelo base de arquitectura MoE (Mixture of Experts) con 35.107.181.936 parámetros totales. Su tarea principal es, dada una secuencia de vídeo y una consulta textual, devolver los intervalos temporales (en segundos) donde el evento descrito es relevante, en formato JSON de pares `[start, end]`.

El modelo resuelve un problema concreto y con demanda creciente en pipelines multimodales: la recuperación y el anclaje temporal de fragmentos de vídeo a partir de lenguaje natural, una capacidad crítica para búsqueda en vídeo, resumen automático, edición asistida y análisis de contenido audiovisual a gran escala. Frente a enfoques especializados de visión por computador, TimeLens2 apuesta por un LLM multimodal generalista afinado para esta tarea, lo que facilita su integración con tool calling y flujos agenticos.

Es relevante ahora porque la combinación de un backbone MoE de 35B con contexto largo y capacidades de vídeo permite abordar *grounding* de momentos en vídeos extensos con una sola pasada, y porque se publica bajo licencia Apache 2.0 con pesos en safetensors y soporte para `transformers`. No se dispone de información sobre la longitud exacta de contexto ni sobre los idiomas soportados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (qwen3_5_moe), transformer multimodal image/video-text-to-text |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.6-35B-A3B (finetune) |
| Pipeline | video-text-to-text |
| Tamano del repo | 70.2 GB |
| Libreria | transformers (recomendado 5.14.1) |
| Fecha de publicacion | 2026-11-14 |

## Arquitectura y entrenamiento

TimeLens2-35B-A3B es un *finetune* del modelo Qwen/Qwen3.6-35B-A3B, que pertenece a la familia Qwen3.5 MoE (`qwen3_5_moe`) y combina un codificador visual con un *decoder* de lenguaje de tipo Mixture of Experts. El modelo procesa vídeo a una tasa de muestreo configurable (el ejemplo de inferencia usa `fps: 2.0`) con resolución adaptativa mediante `min_pixels` y `max_pixels`, y emplea `flash_attention_2` para la atención. El procesamiento de visión se realiza con `qwen-vl-utils[decord]>=0.0.14`, que extrae frames y metadatos del vídeo.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni sobre si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card únicamente indica que se trata de un *finetune* sobre el modelo base y remite al paper (arXiv:2607.17423) para los detalles de entrenamiento. La innovación técnica destacable es la formulación de la tarea como generación de un array JSON de intervalos temporales en segundos, lo que permite integrar el *grounding* temporal directamente en el flujo de generación del LLM sin cabezas específicas de regresión.

## Capacidades

- Localización temporal de eventos en vídeo (*temporal grounding*): devuelve todos los intervalos `[start, end]` en segundos relevantes para una consulta textual.
- Comprensión conjunta de vídeo e imagen y texto (`image-text-to-text`, `video-text-to-text`).
- Generación de salida estructurada en JSON, apta para consumo programático.
- Soporte de modo *thinking* desactivable (`enable_thinking=False` en el chat template), heredado del backbone Qwen.
- Procesamiento de vídeo con control de FPS y resolución (`fps`, `min_pixels`, `max_pixels`).
- Capacidades multilingües: no disponibles en la información proporcionada (el backbone Qwen suele ser multilingüe, pero no se confirma para este finetune).
- Soporte de *tool calling* / *function calling*: no confirmado explícitamente en la información proporcionada, aunque el backbone Qwen3.6 lo soporta típicamente.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente para este finetune.

## Casos de uso

- Búsqueda semántica en vídeo: indexar un archivo audiovisual y, dada una consulta como "un hombre abre la nevera", recuperar los intervalos exactos donde ocurre el evento para generar clips o *bookmarks* automáticos.
- Resumen y *highlights* automáticos: usar el *grounding* sobre benchmarks tipo QVHighlights para extraer los momentos más relevantes de un vídeo largo y construir resúmenes o tráilers.
- Edición asistida por lenguaje natural: en un editor de vídeo, el usuario describe el plano que busca y el modelo devuelve los *timestamps* para cortar o reordenar secuencias sin revisión manual frame a frame.
- Moderación y análisis de contenido: localizar en un vídeo los tramos que contienen escenas o acciones de interés para revisión humana o para alimentar clasificadores posteriores.
- Análisis de vídeo egocéntrico: con benchmarks como Ego4D-NLQ-v2, localizar acciones en grabaciones en primera persona para aplicaciones de asistencia o robótica.
- Anotación automática de datasets: preetiquetar intervalos temporales en corpus de vídeo para acelerar la creación de datasets de *grounding* y reducir el coste de anotación manual.
- Pipelines agenticos de vídeo: integrar el modelo como herramienta de un agente que, dada una pregunta sobre un vídeo, primero localice los fragmentos relevantes y luego los analice con otro modelo o con el mismo en una segunda pasada.

## Benchmarks y rendimiento

Resultados publicados en la model card (mIoU, %):

| Benchmark | Consultas evaluadas | mIoU (%) |
|---|---:|---:|
| Charades-STA | 3363 | 60.73 |
| ActivityNet Captions | 4500 | 63.34 |
| QVHighlights | 1541 | 70.53 |
| VUE-TR | 532/562 | 51.85 |
| VUE-TR-v2 | 725/727 | 51.90 |
| MomentSeeker | 1000 | 30.79 |
| Ego4D-NLQ-v2 | 4552 | 23.61 |
| **Media** | — | **50.39** |

La media es la media no ponderada de los siete benchmarks. Las fracciones en VUE indican la cobertura de vídeo disponible. No se han publicado en la información proporcionada comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 70 GB solo para pesos, más activaciones y caché KV; no cabe en una sola GPU de 80 GB con margen cómodo para vídeo de alta resolución.
- GPU recomendadas: H100 80 GB, A100 80 GB, o configuraciones multi-GPU (por ejemplo, 2×A100 40 GB o 2×H100) mediante `device_map="auto"`.
- GPU de consumo (RTX 4090 24 GB, RTX 3090 24 GB): no cabe en BF16; requeriría cuantización (no se publican pesos GGUF ni cuantizados en la información disponible) o *offloading* a CPU/RAM, con latencia muy elevada.
- Opciones de despliegue: `transformers` (versión 5.14.1 recomendada) con `accelerate` y `flash-attn`; `qwen-vl-utils[decord]` para preprocesado de vídeo. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mIoU medio | Licencia | Formato |
|---|---|---|---|---|---|
| TimeLens2-35B-A3B | 35.107.181.936 (MoE) | no disponible | 50.39 | Apache 2.0 | safetensors |
| Qwen/Qwen3.6-35B-A3B (base) | 35B (MoE) | no disponible | no disponible | no disponible | safetensors |
| Alternativas de *temporal grounding* | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados de benchmarks de modelos comparables de la misma categoría (por ejemplo, otros *grounders* de vídeo basados en LLM) para establecer una comparación numérica rigurosa.

## Limitaciones y advertencias

- El rendimiento en *grounding* es muy desigual entre benchmarks: 70.53 mIoU en QVHighlights frente a 23.61 en Ego4D-NLQ-v2 y 30.79 en MomentSeeker, lo que indica dificultades en vídeo egocéntrico y en consultas de momento complejas.
- La salida es JSON generado por el LLM; puede producir intervalos mal formados, solapados o fuera de los límites del vídeo, por lo que se recomienda validación y *parsing* robusto en producción.
- Riesgo de alucinación de intervalos cuando la consulta no tiene correspondencia real en el vídeo; no se documenta un mecanismo de abstención.
- El muestreo a `fps: 2.0` y la resolución limitada (`max_pixels: 480×480` en el ejemplo) pueden perder eventos breves o de alta frecuencia temporal.
- Idiomas soportados no documentados; el comportamiento en castellano no está verificado.
- Longitud de contexto no documentada, lo que impide estimar el límite de duración de vídeo procesable en una sola pasada.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base Qwen/Qwen3.6-35B-A3B y las condiciones de `qwen-vl-utils`.
- Modelo con 0 descargas y 0 *likes* en el momento de la consulta: sin validación comunitaria ni informes independientes de robustez.
- Requiere `transformers==5.14.1` y `flash-attn`, lo que puede complicar el despliegue en entornos con versiones fijadas.

## Enlaces

- Hugging Face: https://huggingface.co/ZhuYuhan/TimeLens2-35B-A3B
- Paper: https://arxiv.org/abs/2607.17423
- Código: https://github.com/MCG-NJU/TimeLens2
- Colección: https://huggingface.co/collections/MCG-NJU/timelens2
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
