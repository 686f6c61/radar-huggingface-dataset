# torch-pointcloud/cylinder3d-0p5x.nuscenes.yuenan-hou

## Resumen

Cylinder3D es un modelo de segmentación semántica de nubes de puntos LiDAR desarrollado originalmente por Xinge Zhu, Hui Zhou, Tai Wang y colaboradores, y presentado en el paper "Cylindrical and Asymmetrical 3D Convolution Networks for LiDAR Segmentation" (CVPR 2021). Este checkpoint concreto, publicado por el usuario `torch-pointcloud`, es una conversión a safetensors del modelo original de `cardwing/Codes-for-PVKD`, empaquetada para su uso con la librería `torch-pointcloud`. El modelo resuelve la asignación de una clase semántica a cada punto de una escena LiDAR, con 16 clases de salida sobre el dataset nuScenes.

La arquitectura es una red de convolución 3D dispersa que abandona la partición cartesiana habitual en favor de una partición cilíndrica del espacio, lo que equilibra mejor la densidad de puntos entre el centro y la periferia de la escena. Sobre esa partición aplica convoluciones asimétricas (3x1x3, 1x3x3, 3x3x1) para reducir el coste computacional manteniendo el campo receptivo. El modelo es compacto: 12,4 millones de parámetros, 1 canal de entrada y 64 características internas.

Es relevante para desarrolladores que trabajan en percepción para conducción autónoma o robótica y que necesitan un baseline ligero y bien documentado de segmentación LiDAR, con licencia MIT y disponible en un formato de pesos moderno y seguro (safetensors) integrado en un pipeline de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cylinder3D: partición cilíndrica + convoluciones 3D dispersas asimétricas |
| Parametros totales | 12.423.364 (12,4 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de nubes de puntos, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 1 |
| Clases de salida | 16 |
| Características internas | 64 |
| Dataset de entrenamiento | nuScenes |
| Librería | torch-pointcloud |
| Dependencia adicional | spconv (compilación según torch y CUDA) |

## Arquitectura y entrenamiento

Cylinder3D parte de una rejilla cilíndrica en lugar de la rejilla cartesiana típica de las redes de vóxeles 3D. Esta partición divide el espacio por radio, ángulo y altura, de modo que la densidad de puntos es más uniforme entre las zonas cercanas y lejanas del sensor, algo especialmente útil en LiDAR rotacional. Sobre esa rejilla se aplican convoluciones dispersas asimétricas que descomponen un kernel 3D en tres kernels 1D ortogonales, reduciendo el número de operaciones sin perder campo receptivo. La red incluye además un módulo de atención que pondera las características según su posición en la partición cilíndrica.

El checkpoint se ha entrenado sobre nuScenes, el dataset multimodal de conducción autónoma de Motional, con 16 clases semánticas y un único canal de entrada. La model card no detalla el número de tokens ni la composición exacta del dataset, ni indica si hubo fases de refinamiento o ajuste fino adicionales más allá del entrenamiento supervisado estándar. El modelo se distribuye como conversión del repositorio original `cardwing/Codes-for-PVKD`, que a su vez implementa la arquitectura descrita en el paper de CVPR 2021.

## Capacidades

- Segmentación semántica densa de nubes de puntos LiDAR: asigna una de 16 clases a cada punto de la escena.
- Procesamiento de escenas completas de un solo frame LiDAR con un único canal de intensidad como entrada.
- Extracción de características por punto mediante `forward_features`, que devuelve un vector de 64 dimensiones por punto, útil para tareas posteriores como clustering, recuperación o clasificación.
- Capacidad de reiniciar el clasificador (`reset_classifier(num_classes=0)`) para usar el modelo como extractor de representaciones.
- Inferencia GPU-only: los kernels de `spconv` requieren CUDA, no hay soporte CPU documentado.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Percepción en conducción autónoma: el modelo segmenta cada frame LiDAR de nuScenes en 16 clases (vehículo, peatón, ciclista, vegetación, edificio, etc.), lo que permite alimentar módulos de planificación y evitación de obstáculos con una representación semántica del entorno.
- Etiquetado asistido de datos: al ser un modelo ligero (12,4 M de parámetros) y con licencia MIT, se puede desplegar como preetiquetador en pipelines de anotación de nuevas nubes de puntos, reduciendo el coste manual de revisión.
- Extracción de características para búsqueda o agrupamiento: usando `forward_features` se obtienen embeddings de 64 dimensiones por punto que sirven para segmentación no supervisada, detección de anomalías o recuperación de escenas similares.
- Baseline de investigación en segmentación LiDAR: su implementación en `torch-pointcloud` y sus pesos en safetensors facilitan reproducir el resultado de mIoU 76,15 y comparar nuevas arquitecturas contra un referente publicado en CVPR 2021.
- Robótica móvil y AGVs: la partición cilíndrica mantiene una densidad de muestreo razonable en todo el rango del sensor, lo que encaja con robots que operan en espacios abiertos y necesitan distinguir suelo transitable de obstáculos.
- Prototipado rápido en GPU de consumo: con 12,4 M de parámetros, el modelo cabe en GPUs de gama media para pruebas de concepto, siempre que se compile `spconv` contra la versión correcta de CUDA.
- Integración en pipelines de PyTorch: al registrarse mediante `tp.create_model` con `pretrained=True`, se puede incorporar como capa dentro de un grafo mayor de entrenamiento o inferencia.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Dataset | Tarea | Métrica | Valor |
|---|---|---|---|
| nuScenes | Segmentación semántica de nubes de puntos | mIoU | 76,15 |
| nuScenes | Segmentación semántica de nubes de puntos | OA (accuracy global) | 93,22 |

No se han publicado en la información disponible resultados adicionales por clase, latencia ni comparaciones con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 12,4 M de parámetros y una entrada de 8.192 puntos por muestra, el checkpoint en safetensors ocupa del orden de decenas de MB, pero el consumo real depende del tamaño del voxel y del número de puntos de la escena.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA compatible con la compilación de `spconv`; no se especifican modelos concretos en la documentación.
- GPU de consumo: probablemente cabe en tarjetas como RTX 3060, RTX 4060 o superiores, siempre que la versión de `spconv` esté compilada para la CUDA correspondiente; no confirmado por el autor.
- Despliegue: la vía documentada es la librería `torch-pointcloud` con `spconv`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Requisito importante: los kernels son GPU-only; no hay ruta de inferencia en CPU documentada.

## Comparativa con modelos similares

| Modelo | Parámetros | Dataset | mIoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cylinder3d-0p5x.nuscenes.yuenan-hou | 12,4 M | nuScenes | 76,15 | MIT | HuggingFace (torch-pointcloud) |
| Cylinder3D original (cardwing/Codes-for-PVKD) | no disponible en la información | nuScenes | no disponible en la información | MIT | GitHub |
| Otras alternativas (MinkUNet, SPVCNN, etc.) | no disponible en la información | nuScenes | no disponible en la información | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa con otros modelos de segmentación LiDAR.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre nuScenes; su generalización a otros sensores, configuraciones de haces o entornos geográficos distintos no está documentada.
- Solo acepta un canal de entrada (intensidad); no aprovecha información de color ni de múltiples retornos LiDAR.
- Requiere `spconv` compilado contra la versión exacta de PyTorch y CUDA, lo que puede complicar el despliegue en entornos con versiones distintas.
- Inferencia GPU-only: no hay soporte CPU documentado, lo que limita su uso en entornos sin GPU NVIDIA.
- Los resultados de mIoU y OA están marcados como `verified: false` en la model card; no han sido validados de forma independiente.
- Riesgo de degradación en escenas con oclusiones severas, objetos pequeños o condiciones meteorológicas adversas, habitual en modelos LiDAR entrenados con datos de clima favorable.
- Aunque la licencia es MIT, conviene revisar las licencias del dataset nuScenes y de `spconv` para uso comercial.
- El repositorio tiene un tamaño de 0,0 GB reportado y solo 15 descargas, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/torch-pointcloud/cylinder3d-0p5x.nuscenes.yuenan-hou
- Paper Cylinder3D (CVPR 2021): https://arxiv.org/abs/2011.10033
- Repositorio original de la conversión: https://github.com/cardwing/Codes-for-PVKD
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Dataset nuScenes: https://www.nuscenes.org/
