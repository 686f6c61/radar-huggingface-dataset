# torch-pointcloud/second.kitti.openpcdet

## Resumen

`second.kitti.openpcdet` es un modelo de detección de objetos 3D basado en la arquitectura SECOND (Sparsely Embedded Convolutional Detection), desarrollado por el ecosistema torch-pointcloud. Se trata de una conversión del checkpoint original de OpenPCDet, entrenado sobre el conjunto de datos KITTI para la detección de vehículos, peatones y ciclistas en nubes de puntos LiDAR. El modelo emplea convoluciones dispersas sobre una representación voxelizada de la nube de puntos, lo que permite un procesamiento eficiente de escenas 3D a gran escala.

Con 5,3 millones de parámetros, este detector alcanza una mAP de 66,26 en el benchmark de KITTI, un resultado prácticamente idéntico al de referencia de OpenPCDet (66,25). Su relevancia radica en ofrecer una implementación limpia y reproducible en PyTorch, integrada en la librería torch-pointcloud, que facilita su uso en investigación y aplicaciones de percepción 3D, especialmente en el ámbito de la conducción autónoma y la robótica móvil.

La licencia Apache-2.0 permite su uso comercial y modificación, lo que lo convierte en una opción atractiva para proyectos que necesitan un detector 3D ligero y bien documentado. El modelo está disponible en Hugging Face con pesos en formato safetensors y puede cargarse directamente mediante la API de torch-pointcloud.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SECOND (sparse convolutional voxel detector) |
| Parametros totales | 5.332.488 (5,3 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de deteccion 3D) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SECOND es un detector de objetos 3D que opera sobre voxels. La nube de puntos se discretiza en una rejilla 3D y cada voxel se codifica mediante características como posición e intensidad (4 canales de entrada). El modelo utiliza una red de convoluciones dispersas (submanifold sparse convolutions) para extraer características volumétricas, seguidas de una cabeza de detección que predice cajas 3D orientadas y sus clases. La arquitectura incluye una etapa de "sparse conv" con 512 canales de características y una cabeza de clasificación y regresión.

El entrenamiento se realizó sobre el conjunto de datos KITTI, que contiene escenas de conducción con anotaciones de coches, peatones y ciclistas. El checkpoint original fue entrenado con OpenPCDet y posteriormente convertido a la librería torch-pointcloud. No se dispone de información detallada sobre el número de épocas, el tamaño de lote ni las técnicas de aumento de datos utilizadas, ya que la model card no los especifica. La métrica reportada (mAP 66,26) indica que el modelo reproduce fielmente los resultados del baseline.

## Capacidades

- Detección de objetos 3D en nubes de puntos LiDAR, incluyendo cajas orientadas (3D bounding boxes) y clases (coche, peatón, ciclista).
- Predicción de la localización, dimensión y ángulo de cada objeto detectado.
- Extracción de características de la nube de puntos mediante `forward_features`, devolviendo un tensor de 512 canales útil para tareas downstream (clasificación, segmentación, etc.).
- Inferencia en tiempo real en GPU gracias al uso de convoluciones dispersas, que solo procesan las regiones ocupadas del espacio voxelizado.
- Integración sencilla con el ecosistema torch-pointcloud y compatibilidad con OpenPCDet para la conversión de checkpoints.
- Soporte de lote (batch) de múltiples escenas mediante la función `collate` proporcionada por la librería.

## Casos de uso

- Conducción autónoma: el modelo puede integrarse en un pipeline de percepción para detectar vehículos, peatones y ciclistas en tiempo real a partir de datos LiDAR, alimentando los módulos de planificación y evitación de obstáculos.
- Robótica móvil: en robots que navegan en entornos dinámicos, la detección 3D permite identificar obstáculos y personas para una navegación segura, gracias a su bajo coste computacional.
- Sistemas avanzados de asistencia al conductor (ADAS): puede utilizarse para alertar al conductor sobre la presencia de objetos en puntos ciegos o cruces.
- Investigación en percepción 3D: al ser un modelo ligero y bien documentado, sirve como baseline para comparar nuevas arquitecturas de detección de objetos en nubes de puntos.
- Inspección industrial y logística: en almacenes automatizados, la detección 3D de palés, vehículos o personas mejora la gestión de flotas y la seguridad.
- Generación de datos sintéticos para simulación: el modelo puede aplicarse a nubes de puntos generadas por simuladores para evaluar el rendimiento de sistemas de percepción en escenarios controlados.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card son los siguientes:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Deteccion de objetos 3D | KITTI | mAP | 66,26 |

No se han publicado resultados adicionales de benchmarks en la informacion disponible. El valor de mAP se corresponde con el baseline de OpenPCDet (66,25), lo que indica una fidelidad alta en la conversión.

## Requisitos de hardware

- El modelo requiere una GPU con soporte CUDA, ya que los kernels de convolución dispersa (spconv) no están implementados para CPU.
- VRAM estimada para inferencia: dado el tamaño del modelo (5,3 M de parámetros), la memoria necesaria es reducida; con un batch de 1 y una resolución de voxel típica (0,1 m), el consumo ronda 1-2 GB. Escenarios con nubes de puntos más densas o batches mayores pueden requerir hasta 4 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, RTX 3060, o superiores). También funciona en GPUs de datacenter como A100 o H100, aunque no son necesarias para este modelo.
- El modelo cabe en GPUs de consumo, siempre que se disponga de una versión de CUDA compatible con spconv.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse mediante TorchServe o integrarse en aplicaciones personalizadas con FastAPI. No se han documentado opciones de cuantización ni despliegue en frameworks como TensorRT o vLLM, aunque es posible convertirlo a ONNX para optimización.
- Latencia y throughput: no se proporcionan datos oficiales. En una RTX 3090, se estima una inferencia de 20-50 ms por escena, dependiendo del tamaño de la nube de puntos y de la configuración de voxelización.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Dataset | mAP (KITTI) | Licencia |
|---|---|---|---|---|---|
| SECOND (este) | Sparse conv voxel | 5,3 M | KITTI | 66,26 | Apache-2.0 |
| PointPillars | Pillar feature net | ~5-6 M | KITTI | ~68-70 (variante) | Apache-2.0 (OpenPCDet) |
| VoxelNet | Voxel feature encoding | ~10 M | KITTI | ~65-67 | Apache-2.0 (OpenPCDet) |

Los valores de PointPillars y VoxelNet son aproximados y dependen de la configuración exacta; no se dispone de datos oficiales en la información proporcionada. Este modelo se sitúa en la misma gama de rendimiento que otros detectores voxel-based, con la ventaja de ser más ligero que VoxelNet.

## Limitaciones y advertencias

- El modelo solo reconoce tres clases (coche, peatón, ciclista) y ha sido entrenado exclusivamente con datos de KITTI, que representan escenarios de conducción en Alemania. Su rendimiento puede degradarse en otros entornos (por ejemplo, condiciones climáticas diferentes o ciudades con densidades de tráfico distintas).
- La detección se basa únicamente en nubes de puntos LiDAR; no fusiona información de cámaras, por lo que no es adecuado para tareas que requieran reconocimiento de texturas o colores.
- Requiere la librería `spconv`, cuya instalación depende de una compilación específica para la versión de Torch y CUDA utilizada. Esto puede complicar el despliegue en entornos con versiones restrictivas.
- Los kernels son exclusivos de GPU; no existe soporte para CPU, lo que limita su uso en dispositivos sin aceleración gráfica.
- No se han publicado análisis de sesgos ni estudios de robustez frente a oclusiones, densidades variables de puntos o condiciones meteorológicas adversas.
- La licencia Apache-2.0 permite uso comercial, pero el dataset KITTI tiene sus propios términos de uso que deben respetarse al redistribuir o entrenar con esos datos.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/second.kitti.openpcdet
- Paper SECOND: https://www.mdpi.com/1424-8220/18/10/3337
- Repositorio OpenPCDet: https://github.com/open-mmlab/OpenPCDet
- Repositorio torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Guía de instalación de torch-pointcloud: https://pytorch-pointcloud.org/installation/
