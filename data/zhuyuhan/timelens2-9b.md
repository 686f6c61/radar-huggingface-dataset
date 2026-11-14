# ZhuYuhan/TimeLens2-9B

## Resumen

TimeLens2-9B es un modelo de lenguaje y video especializado en *temporal grounding*: dado un vídeo y una consulta en lenguaje natural, devuelve los intervalos temporales (en segundos) en los que la consulta es relevante. Lo desarrolla ZhuYuhan (con el grupo MCG-NJU, según los enlaces de la model card) y se construye como un *fine-tune* de Qwen/Qwen3.5-9B, un modelo multimodal de la familia Qwen 3.5.

El modelo resuelve el problema de localizar momentos concretos dentro de vídeos largos a partir de descripciones textuales, una tarea clave para búsqueda en vídeo, resumen automático y sistemas de recuperación de momentos. Su salida es un array JSON de pares [inicio, fin], lo que facilita su integración en pipelines de recuperación y anotación.

Con 9.409.813.744 parámetros y un repositorio de 18,8 GB en safetensors, es relevante ahora porque combina la base multimodal de Qwen 3.5 con un entrenamiento específico para *grounding* temporal, y publica resultados en siete benchmarks de referencia (Charades-STA, ActivityNet Captions, QVHighlights, VUE-TR, VUE-TR-v2, MomentSeeker y Ego4D-NLQ-v2) con una media de mIoU del 50,28 %. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text / video-text-to-text), basado en Qwen/Qwen3.5-9B |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de inferencia usa `dtype="auto"`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TimeLens2-9B es un *fine-tune* del modelo base Qwen/Qwen3.5-9B, que aporta la arquitectura transformer multimodal capaz de procesar entradas de imagen y vídeo junto con texto. El modelo se ha especializado mediante ajuste fino para la tarea de *temporal grounding*: recibe un vídeo muestreado a una tasa de fotogramas configurable (el ejemplo oficial usa `fps: 2.0`) y una consulta textual, y genera como salida un array JSON de intervalos `[start, end]` en segundos.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO. La model card únicamente referencia el paper arXiv:2607.17423 ("TimeLens2: Generalist Video Temporal Grounding with Multimodal LLMs") como fuente de los detalles técnicos. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. El ejemplo de inferencia recomienda `flash_attention_2` y el uso de `qwen-vl-utils` con `decord` para el procesamiento de vídeo, con control de `min_pixels` y `max_pixels` para acotar el coste computacional.

## Capacidades

- *Temporal grounding* en vídeo: localiza todos los intervalos temporales relevantes para una consulta textual y los devuelve como JSON de pares `[start, end]` en segundos.
- Procesamiento de vídeo con muestreo configurable de fotogramas (`fps`) y control de resolución mediante `min_pixels` y `max_pixels`.
- Comprensión de lenguaje natural para consultas descriptivas (por ejemplo, "A man opens the refrigerator.").
- Soporte de modo *thinking* en la plantilla de chat (`enable_thinking`), desactivable en el ejemplo oficial.
- Generación determinista disponible (`do_sample=False`) y generación con hasta 4096 tokens nuevos.
- Capacidades multimodales heredadas del modelo base Qwen3.5-9B (procesamiento de imagen y texto), si bien la especialización documentada es el *grounding* temporal en vídeo.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- **Búsqueda de momentos en vídeo**: indexar un catálogo de vídeos y, dada una consulta como "un hombre abre la nevera", recuperar los intervalos exactos donde ocurre. El modelo devuelve directamente los pares `[start, end]`, lo que simplifica la integración con un motor de búsqueda.
- **Anotación automática de datasets de vídeo**: generar etiquetas de *grounding* temporal para nuevos vídeos y reducir el coste de anotación manual en proyectos de investigación o de construcción de datasets.
- **Resumen y *highlights* automáticos**: usar los intervalos devueltos para extraer los fragmentos relevantes de un vídeo largo (por ejemplo, QVHighlights) y construir resúmenes o clips destacados.
- **Análisis de vídeo egocéntrico**: localizar eventos descritos en lenguaje natural en grabaciones en primera persona (Ego4D-NLQ-v2), útil en investigación de percepción egocéntrica y asistencia personal.
- **Moderación y auditoría de contenido**: localizar en un vídeo los tramos que coinciden con una descripción de contenido sensible para revisión humana posterior.
- **Pipelines de edición de vídeo asistida**: dado un guion o una descripción, obtener los tramos temporales que hay que cortar o reordenar, integrándolo en herramientas de edición automatizada.
- **Evaluación de sistemas de recuperación de vídeo**: emplear el modelo como componente de *grounding* en un *benchmark* interno para medir la calidad de la recuperación sobre vídeos propios.

## Benchmarks y rendimiento

Resultados publicados en la model card (mIoU, %):

| Benchmark | Consultas evaluadas | mIoU (%) |
|---|---:|---:|
| Charades-STA | 3363 | 60,56 |
| ActivityNet Captions | 4500 | 61,97 |
| QVHighlights | 1541 | 70,28 |
| VUE-TR | 532/562 | 54,04 |
| VUE-TR-v2 | 725/727 | 52,19 |
| MomentSeeker | 1000 | 30,23 |
| Ego4D-NLQ-v2 | 4552 | 22,69 |
| **Media** | — | **50,28** |

Las fracciones indican la cobertura de vídeos disponibles en los dos benchmarks VUE. La media es la media no ponderada sobre los siete benchmarks. No se han publicado en la información disponible resultados comparativos con otros modelos en estos mismos benchmarks.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita. Con 9,41 mil millones de parámetros, en precisión completa (FP16/BF16) los pesos ocupan aproximadamente 18,8 GB, por lo que se necesita una GPU con al menos ~20 GB de VRAM para cargar el modelo sin cuantizar, más el espacio para el procesamiento de vídeo y el KV cache.
- **GPU recomendadas**: no especificadas en la información disponible. Por tamaño, encaja en GPUs de 24 GB o más (por ejemplo, RTX 4090, A100 40/80 GB, H100).
- **¿Cabe en GPU de consumo?**: no se confirma en la información disponible; con cuantización a 8 bits o 4 bits podría caber en GPUs de consumo de 24 GB, pero no se documentan cuantizaciones oficiales.
- **Opciones de despliegue**: la model card documenta `transformers` (versión 5.14.1), `accelerate`, `safetensors`, `qwen-vl-utils[decord]` y `flash-attn` con `flash_attention_2`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoría (grounding temporal en vídeo). Por tanto, la comparativa cuantitativa se indica como no disponible.

| Modelo | Parametros | Contexto | mIoU medio (7 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TimeLens2-9B | 9.409.813.744 | no disponible | 50,28 | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Rendimiento desigual entre benchmarks**: la mIoU cae hasta el 22,69 % en Ego4D-NLQ-v2 y el 30,23 % en MomentSeeker, frente al 70,28 % en QVHighlights. El rendimiento en vídeo egocéntrico y en consultas complejas es notablemente inferior.
- **Dependencia del muestreo de vídeo**: el resultado depende de parámetros como `fps`, `min_pixels` y `max_pixels`; una configuración inadecuada puede degradar la localización temporal.
- **Sesgos conocidos**: no documentados en la información disponible.
- **Riesgo de alucinación**: no documentado explícitamente; como modelo generativo, puede producir intervalos inexistentes o mal ajustados, por lo que se recomienda validación posterior.
- **Limitaciones de contexto e idioma**: la longitud de contexto y los idiomas soportados no están documentados.
- **Licencia**: Apache 2.0, lo que permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen/Qwen3.5-9B.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 14 de noviembre de 2026; conviene tratar los resultados como preliminares hasta su validación independiente.
- **Caveat de producción**: no se documentan cuantizaciones oficiales ni soporte en motores de inferencia de alto rendimiento (vLLM, TGI), lo que puede limitar el despliegue a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZhuYuhan/TimeLens2-9B
- Paper: https://arxiv.org/abs/2607.17423
- Código: https://github.com/MCG-NJU/TimeLens2
- Colección: https://huggingface.co/collections/MCG-NJU/timelens2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
