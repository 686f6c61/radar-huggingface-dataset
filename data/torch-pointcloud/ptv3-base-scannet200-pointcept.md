# torch-pointcloud/ptv3-base.scannet200.pointcept

## Resumen

El modelo `ptv3-base.scannet200.pointcept` es un modelo de segmentación semántica de nubes de puntos basado en Point Transformer V3 (PTv3), una arquitectura publicada en CVPR 2024 con el título "Point Transformer V3: Simpler, Faster, Stronger". Ha sido desarrollado y publicado por el equipo de torch-pointcloud, una librería de PyTorch para procesamiento de nubes de puntos, y se distribuye bajo licencia MIT. El modelo está entrenado sobre el dataset ScanNet200, que contiene 200 clases semánticas de escenas interiores, y alcanza un mIoU de 33,42 en dicho conjunto de validación.

La arquitectura PTv3 introduce una atención de vecindario serializada (serialized neighborhood attention) que simplifica el procesamiento de nubes de puntos dispersas, mejorando tanto la eficiencia como la precisión frente a enfoques previos. Este checkpoint concreto tiene 46,2 millones de parámetros y 64 canales de características, y acepta entradas con 6 canales (posición, color y normal). Es una conversión de los pesos originales del framework Pointcept, adaptada para su uso directo con la librería torch-pointcloud.

Su relevancia actual radica en que ofrece un modelo de segmentación 3D de última generación, listo para usar en aplicaciones de percepción robótica, reconstrucción de interiores y análisis de escenas, con una licencia permisiva que facilita su integración en productos comerciales y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Point Transformer V3 (atención de vecindario serializada) |
| Parametros totales | 46.183.304 (46,2 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de nubes de puntos, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de visión 3D, sin texto) |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Point Transformer V3, que se basa en una atención de vecindario serializada. En lugar de procesar la nube de puntos completa de forma densa, PTv3 ordena los puntos en una secuencia mediante una curva de relleno de espacio (space-filling curve) y aplica atención sobre vecinos locales dentro de esa secuencia. Esto reduce significativamente el coste computacional y la memoria, permitiendo escalar a escenas grandes con millones de puntos. El backbone de este checkpoint es la variante "base", con 64 canales de características por bloque.

El entrenamiento se realizó sobre el dataset ScanNet200, una extensión de ScanNet que anota 200 clases semánticas en escaneos RGB-D de interiores. No se han publicado detalles sobre el número de tokens de entrenamiento, composición exacta del dataset ni técnicas de alineación como RLHF o DPO, ya que se trata de un modelo de percepción 3D, no de lenguaje. Los pesos originales provienen del framework Pointcept y han sido convertidos al formato de torch-pointcloud, manteniendo las mismas capacidades.

## Capacidades

- Segmentación semántica de nubes de puntos: asigna una clase entre 200 categorías a cada punto de la nube de entrada.
- Extracción de características: el modelo puede utilizarse como backbone para extraer embeddings por punto (64 dimensiones) mediante `forward_features`, útil para tareas downstream como detección de objetos o registro.
- Entrada multimodal: acepta posición (xyz), color (RGB) y normales, lo que permite aprovechar la información geométrica y de apariencia.
- Inferencia en GPU con kernels optimizados: requiere CUDA, spconv y flash-attn, lo que garantiza un rendimiento alto en hardware moderno.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente perceptivo.

## Casos de uso

- Reconstrucción de interiores para arquitectura y diseño: el modelo puede segmentar automáticamente escaneos de habitaciones en clases como pared, suelo, mobiliario o electrodomésticos, facilitando la generación de modelos BIM o planos digitales.
- Robótica de servicio y navegación: un robot móvil puede usar la segmentación semántica para identificar obstáculos, superficies transitables y objetos manipulables en tiempo real, mejorando la planificación de rutas.
- Realidad aumentada y mixta: al etiquetar cada punto de la escena, se pueden anclar objetos virtuales a superficies reales o filtrar elementos no deseados en aplicaciones de RA.
- Inspección industrial y control de calidad: en entornos de fabricación, el modelo puede identificar componentes, grietas o defectos en nubes de puntos capturadas por sensores 3D.
- Análisis de escenas para conducción autónoma en interiores (almacenes, garajes): aunque ScanNet200 es de interiores, el modelo puede adaptarse con fine-tuning a entornos semiestructurados para detectar vehículos, peatones o infraestructura.
- Investigación en percepción 3D: sirve como baseline para comparar nuevas arquitecturas o como extractor de características para tareas de few-shot learning en nubes de puntos.

## Benchmarks y rendimiento

El autor declara el siguiente resultado oficial en la model card:

| Dataset | Tarea | Métrica | Valor |
|---|---|---|---|
| ScanNet200 | Segmentación semántica de nubes de puntos | mIoU | 33,42 |

El valor de referencia citado en la model card es de 35,3, lo que sugiere que este checkpoint está ligeramente por debajo del mejor resultado reportado en el paper original de PTv3, posiblemente debido a diferencias en el entrenamiento o la conversión. No se han publicado resultados en otros benchmarks como S3DIS o SemanticKITTI en la información disponible.

## Requisitos de hardware

- VRAM estimada: no se especifica, pero con 46,2 M de parámetros y entrada típica de 8192 puntos, el modelo debería caber en GPUs con 8 GB o más, dependiendo de la resolución de la nube.
- GPUs recomendadas: cualquier GPU NVIDIA con soporte CUDA y memoria suficiente; se recomienda al menos una RTX 3060 o superior para inferencia en tiempo real.
- Compatibilidad con GPU de consumo: sí, es viable en GPUs de gama media-alta, aunque los kernels de spconv y flash-attn requieren una versión de CUDA y PyTorch compatible.
- Opciones de despliegue: el modelo se usa mediante la librería `torch-pointcloud` en Python; no está disponible en vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado mediciones oficiales; dependerá del número de puntos y del hardware. Con 8192 puntos, se espera una inferencia en el orden de milisegundos en una GPU moderna.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de segmentación de nubes de puntos en la información proporcionada. Como referencia cualitativa, Point Transformer V3 superó a arquitecturas previas como PointNet++ o MinkowskiNet en el paper original, pero no hay datos numéricos de estos modelos en este contexto. Por tanto, la comparativa se limita a señalar que PTv3-base ofrece un equilibrio entre precisión y eficiencia, con una licencia MIT que lo diferencia de alternativas con restricciones más estrictas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en ScanNet200, por lo que su rendimiento en otros dominios (exteriores, escenas industriales, datos LiDAR de largo alcance) puede degradarse significativamente sin fine-tuning.
- No se han documentado sesgos específicos, pero al depender del dataset de entrenamiento, puede tener errores en clases poco representadas o en escenas con condiciones de iluminación inusuales.
- Al ser un modelo de percepción, no genera texto y no es susceptible a alucinación en el sentido lingüístico; sin embargo, puede producir etiquetas incorrectas en regiones ambiguas de la nube de puntos.
- Requiere kernels GPU propietarios (spconv, flash-attn) que pueden complicar la instalación en entornos sin CUDA o con versiones antiguas de PyTorch.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe verificar que las dependencias (spconv, flash-attn) tengan licencias compatibles con su caso de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/ptv3-base.scannet200.pointcept
- Paper original: https://arxiv.org/abs/2312.10035
- Repositorio Pointcept (origen de los pesos): https://github.com/Pointcept/Pointcept
- Repositorio oficial de PointTransformerV3: https://github.com/Pointcept/PointTransformerV3
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación: https://pytorch-pointcloud.org/installation/
