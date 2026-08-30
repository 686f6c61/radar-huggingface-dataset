# torch-pointcloud/voxelnext.nuscenes.openpcdet

## Resumen

VoxelNeXt es un detector de objetos 3D basado en nubes de puntos LiDAR, presentado en el paper *"VoxelNeXt: Fully Sparse VoxelNet for 3D Object Detection and Tracking"* (CVPR 2023). A diferencia de los detectores tradicionales que utilizan características densas o mapas de características en 2D, VoxelNeXt opera completamente sobre voxels dispersos, lo que reduce el coste computacional y mejora la eficiencia en escenarios con nubes de puntos grandes. Esta implementación concreta, publicada bajo el nombre `torch-pointcloud/voxelnext.nuscenes.openpcdet`, es una conversión del modelo original de OpenPCDet al ecosistema `torch-pointcloud`, realizada por Arthur Dujardin. El modelo está entrenado en el dataset nuScenes y es capaz de detectar hasta 10 clases de objetos relevantes para conducción autónoma (vehículos, peatones, ciclistas, etc.). Con apenas 8 millones de parámetros, ofrece un equilibrio interesante entre precisión y velocidad para aplicaciones de percepción 3D en tiempo real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoxelNeXt (fully sparse voxel detector) |
| Parametros totales | 7.996.086 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de detección 3D) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VoxelNeXt se basa en una arquitectura de voxels completamente dispersa (fully sparse). En lugar de convertir la nube de puntos a una representación densa o usar una etapa de proyección a 2D, el modelo procesa directamente los voxels no vacíos mediante capas convolucionales dispersas (sparse convolutions). Esto elimina la necesidad de un cuello de botella denso y permite escalar a resoluciones de voxel más finas sin un aumento drástico del coste. La red está compuesta por una serie de bloques de convolución dispersa que extraen características a múltiples escalas, seguidas de cabezas de detección que predicen cajas 3D orientadas y sus clases. El modelo fue entrenado en el dataset nuScenes, que contiene 1000 escenas de conducción con anotaciones de 3D en 10 clases. El proceso de entrenamiento sigue el protocolo estándar de OpenPCDet, con aumento de datos y pérdidas de regresión y clasificación. No se han aplicado técnicas de RLHF ni DPO, ya que es un modelo discriminativo de visión por computador. La conversión a `torch-pointcloud` preserva los pesos originales y añade una interfaz unificada para su uso en PyTorch.

## Capacidades

- Detección de objetos 3D en nubes de puntos LiDAR: identifica y localiza objetos mediante cajas 3D orientadas (bounding boxes) con su clase correspondiente.
- Soporte de 10 clases del dataset nuScenes: coche, peatón, camión, autobús, bicicleta, motocicleta, etc.
- Extracción de características de la nube de puntos: el método `forward_features` devuelve un tensor de características de 128 canales por voxel, útil para tareas posteriores como seguimiento o segmentación.
- Inferencia eficiente en GPU gracias a la arquitectura dispersa y al uso de kernels optimizados de `spconv`.
- Integración sencilla con el ecosistema `torch-pointcloud`, que ofrece utilidades de preprocesado y colación de datos.

## Casos de uso

- Conducción autónoma: detección de vehículos, peatones y otros obstáculos en tiempo real a partir de sensores LiDAR. El modelo puede integrarse en el pipeline de percepción de un vehículo autónomo para alimentar módulos de planificación y control.
- Robótica móvil: navegación autónoma en entornos industriales o logísticos donde se necesita identificar objetos y evitar colisiones. Su bajo número de parámetros permite ejecutarlo en sistemas embebidos con GPU.
- Monitorización de tráfico: análisis de intersecciones o carreteras mediante sensores LiDAR fijos para contar vehículos, clasificarlos y estimar su posición.
- Sistemas de asistencia al conductor (ADAS): detección de peatones y ciclistas para alertas de seguridad en vehículos de producción.
- Investigación en percepción 3D: sirve como punto de partida para experimentos con arquitecturas dispersas, comparación de técnicas de voxelización o estudio de la eficiencia de detectores 3D.
- Reentrenamiento y adaptación a nuevos dominios: al estar basado en un framework modular, el modelo puede ajustarse con datos propios de nubes de puntos para aplicaciones específicas (por ejemplo, entornos mineros o agrícolas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original de VoxelNeXt reporta métricas en el conjunto de validación de nuScenes (NDS y mAP), pero estos valores no se incluyen en la ficha del modelo ni en los metadatos de HuggingFace. Para obtener datos de rendimiento, se recomienda consultar el artículo científico [arXiv:2303.11301](https://arxiv.org/abs/2303.11301).

## Requisitos de hardware

- Es necesario disponer de una GPU NVIDIA con soporte CUDA, ya que los kernels de `spconv` y las operaciones dispersas no están implementados para CPU.
- Se requiere instalar `spconv` compilado para la versión concreta de PyTorch y CUDA del entorno.
- La memoria VRAM estimada depende del tamaño del lote y de la resolución de voxel. Con 8 millones de parámetros, el modelo en sí es ligero, pero el procesamiento de una nube de puntos típica (aproximadamente 30 000 puntos) con voxels de 0,1 m puede ocupar entre 1 y 3 GB de VRAM en una GPU de gama media.
- GPUs recomendadas: NVIDIA RTX 3060 o superiores para inferencia en tiempo real; para entrenamiento o lotes grandes se recomienda al menos una RTX 3090 o A100.
- Opciones de despliegue: al ser un modelo de PyTorch, puede servirse mediante frameworks de inferencia como TorchServe o integrarse directamente en aplicaciones. No hay soporte nativo para llama.cpp o vLLM, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Dataset | Licencia |
|---|---|---|---|---|
| VoxelNeXt (este) | Fully sparse voxel | 8 M | nuScenes | Apache-2.0 |
| PointPillars | Pillar-based (denso) | ~7 M | KITTI, nuScenes | Apache-2.0 |
| SECOND | Sparse voxel + denso | ~10 M | KITTI, nuScenes | Apache-2.0 |
| CenterPoint | Voxel + centro-based | ~20 M | nuScenes | Apache-2.0 |

La comparativa se basa en características generales de arquitectura y tamaño, pero no se dispone de resultados de rendimiento específicos en la información proporcionada. VoxelNeXt se distingue por ser completamente disperso, lo que lo hace más eficiente en memoria y computación que PointPillars o SECOND, que requieren una etapa densa intermedia. CenterPoint suele ofrecer mayor precisión a costa de un mayor coste.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos de nuScenes, que utiliza un sensor LiDAR de 32 canales y una configuración específica. Su rendimiento puede degradarse en otros sensores o dominios sin un reentrenamiento adecuado.
- Las clases detectadas se limitan a las 10 categorías del dataset. Objetos fuera de estas clases no serán detectados.
- No se han publicado estudios sobre sesgos o comportamientos adversos en este modelo concreto. Como cualquier detector 3D, puede fallar en condiciones de oclusión severa, lluvia intensa o niebla, que afectan a la calidad de la nube de puntos.
- La licencia Apache-2.0 permite uso comercial, pero al derivar de OpenPCDet (también Apache-2.0) se deben mantener los avisos de copyright y atribución.
- El modelo requiere kernels de GPU propietarios de `spconv`, lo que puede complicar el despliegue en entornos sin CUDA o con versiones incompatibles.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/torch-pointcloud/voxelnext.nuscenes.openpcdet)
- [Paper de VoxelNeXt](https://arxiv.org/abs/2303.11301)
- [Repositorio OpenPCDet](https://github.com/open-mmlab/OpenPCDet)
- [Repositorio PyTorch PointCloud](https://github.com/arthurdjn/pytorch-pointcloud)
- [Documentación de instalación de torch-pointcloud](https://pytorch-pointcloud.org/installation/)
