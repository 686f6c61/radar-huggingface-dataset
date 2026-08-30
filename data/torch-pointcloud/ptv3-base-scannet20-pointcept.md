# torch-pointcloud/ptv3-base.scannet20.pointcept

## Resumen

El modelo `ptv3-base.scannet20.pointcept` es un modelo de segmentación semántica de nubes de puntos basado en la arquitectura Point Transformer V3 (PTv3), desarrollado por la organización torch-pointcloud como conversión del checkpoint original de Pointcept. Está entrenado sobre el dataset ScanNet con 20 clases de objetos y escenas de interiores, y ofrece un rendimiento de mIoU de 76,29 sobre dicho conjunto de validación.

Este modelo resuelve el problema de etiquetar cada punto de una nube 3D con su categoría semántica (pared, suelo, silla, mesa, etc.), una tarea fundamental para robótica, realidad aumentada, reconstrucción de escenas y análisis de entornos interiores. Su relevancia actual radica en que PTv3 introduce una atención serializada de vecindad que simplifica el cómputo y mejora la eficiencia frente a arquitecturas previas, manteniendo una precisión competitiva con solo 46,2 millones de parámetros.

El checkpoint se distribuye en formato safetensors bajo licencia MIT, pesa 0,2 GB y se integra con la librería `torch-pointcloud`, que requiere dependencias adicionales como `spconv` y `flash-attn` para su ejecución en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Point Transformer V3 (atención serializada de vecindad) |
| Parametros totales | 46.171.604 (46,2 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (procesa nubes de puntos de tamaño variable) |
| Tipos de cuantizacion | No disponible (solo safetensors de precisión completa) |
| Idiomas soportados | No aplica (modelo de visión 3D, sin texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Point Transformer V3 es una arquitectura transformer diseñada específicamente para nubes de puntos. Su innovación principal es la atención serializada de vecindad, que ordena los puntos en una secuencia lineal y aplica atención sobre vecinos locales, reduciendo el coste computacional frente a las atenciones globales o las ventanas 3D complejas. Esto permite escalar a nubes densas con mayor eficiencia y simplicidad de implementación.

El modelo se entrenó sobre ScanNet, un dataset de reconstrucciones 3D de interiores con anotaciones semánticas para 20 clases. El checkpoint publicado es una conversión del modelo original de Pointcept, que reporta un mIoU de referencia de 77,6 en el paper; la versión convertida alcanza 76,29, una ligera diferencia atribuible a la conversión de pesos y al entorno de inferencia. No se dispone de información sobre el número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF o DPO, ya que se trata de un modelo de visión 3D supervisado de forma clásica.

## Capacidades

- Segmentación semántica de nubes de puntos: asigna una de 20 clases (ScanNet) a cada punto de la nube.
- Extracción de características: permite obtener embeddings por punto de 64 dimensiones mediante `forward_features`, útiles para tareas downstream como agrupación o clasificación.
- Soporte de entrada multimodal simple: acepta coordenadas, color y normales como canales de entrada (6 canales en total).
- Inferencia en tiempo real: al ser un modelo de 46 M de parámetros, es ligero y adecuado para aplicaciones con requisitos de latencia moderada.
- No tiene capacidades de texto, tool calling, agentes ni razonamiento simbólico; es un modelo puramente perceptivo 3D.

## Casos de uso

- Robótica móvil en interiores: el modelo puede segmentar en tiempo real nubes de puntos capturadas por sensores LiDAR o cámaras RGB-D, permitiendo al robot distinguir obstáculos, superficies transitables y objetos manipulables.
- Realidad aumentada y mixta: al etiquetar cada punto de la escena, se pueden anclar objetos virtuales sobre superficies reales (suelo, paredes, mesas) con mayor precisión.
- Reconstrucción y modelado de edificios: aplicado a escaneos de interiores, facilita la generación de modelos BIM (Building Information Modeling) clasificando automáticamente los elementos estructurales.
- Automatización de inventario en almacenes: segmentando estanterías, cajas y pasillos en nubes de puntos, se puede planificar rutas de robots de picking.
- Análisis de seguridad y vigilancia: detectar objetos relevantes (personas, vehículos, mobiliario) en entornos interiores para sistemas de monitorización.
- Dataset labeling asistido: el modelo puede preetiquetar nubes de puntos para acelerar la anotación manual en nuevos datasets, reduciendo el coste de creación de datos de entrenamiento.

## Benchmarks y rendimiento

El modelo reporta un mIoU de 76,29 en el conjunto de validación de ScanNet (20 clases), según los datos de la model card. El paper original de PTv3 indica un valor de referencia de 77,6 para la misma configuración base, lo que sugiere una ligera degradación tras la conversión de pesos. No se dispone de resultados en otros benchmarks (S3DIS, nuScenes, etc.) en la información proporcionada.

| Dataset | Métrica | Valor |
|---|---|---|
| ScanNet (20 clases) | mIoU | 76,29 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo requiere GPU NVIDIA con soporte CUDA, ya que los kernels de `spconv` y `flash-attn` no funcionan en CPU.
- Con 46,2 M de parámetros y un tamaño de repo de 0,2 GB, la VRAM necesaria para inferencia es reducida; se estima que cabe en GPUs consumer con 8 GB o más (p. ej., RTX 3060, RTX 4060).
- Las GPU recomendadas son aquellas con soporte para FlashAttention-2 y spconv, como las series RTX 30/40 o A100/H100 para despliegues más grandes.
- La inferencia se realiza mediante la librería `torch-pointcloud`, que proporciona la API `create_model` y carga los pesos preentrenados.
- No se dispone de datos de latencia o throughput específicos; dependerá del número de puntos procesados (el ejemplo usa 8192 puntos) y de la GPU utilizada.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa cuantitativa con otros modelos de segmentación de nubes de puntos (p. ej., PointNet++, SparseConvNet o MinkowskiNet). El valor de mIoU de 76,29 en ScanNet puede contrastarse con el 77,6 del paper original de PTv3, pero no hay datos verificados de otras arquitecturas en el mismo contexto.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en ScanNet, por lo que su rendimiento fuera de este dominio (escenas exteriores, objetos no presentes en las 20 clases) será significativamente inferior.
- Requiere dependencias específicas (`spconv`, `flash-attn`) que complican la instalación en entornos sin GPU o con versiones de CUDA no compatibles.
- El valor de mIoU reportado (76,29) es ligeramente inferior al del modelo original de Pointcept (77,6), lo que puede deberse a la conversión de pesos; se recomienda verificar en el caso de uso concreto.
- No se han documentado sesgos específicos, pero al entrenarse en escaneos de interiores académicos puede presentar menor precisión en escenas muy desordenadas o con condiciones de iluminación inusuales.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo depende de librerías con licencias propias (spconv, flash-attn) que deben revisarse por separado.
- No es un modelo generativo; no produce texto ni respuestas, solo etiquetas o características por punto.

## Enlaces

- [HuggingFace: torch-pointcloud/ptv3-base.scannet20.pointcept](https://huggingface.co/torch-pointcloud/ptv3-base.scannet20.pointcept)
- [Paper: Point Transformer V3: Simpler, Faster, Stronger](https://arxiv.org/abs/2312.10035)
- [Repositorio Pointcept (fuente del checkpoint original)](https://github.com/Pointcept/Pointcept)
- [Repositorio torch-pointcloud (librería de inferencia)](https://github.com/arthurdjn/pytorch-pointcloud)
- [Guía de instalación de torch-pointcloud](https://pytorch-pointcloud.org/installation/)
