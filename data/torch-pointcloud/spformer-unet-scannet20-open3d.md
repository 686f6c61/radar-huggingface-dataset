# torch-pointcloud/spformer-unet.scannet20.open3d

## Resumen

`torch-pointcloud/spformer-unet.scannet20.open3d` es un checkpoint de segmentación semántica de nubes de puntos 3D, no un modelo de lenguaje. Lo publica la organización torch-pointcloud como parte de la librería homónima de Arthur Dujardin y consiste en una U-Net con convoluciones dispersas (sparse convolutions) derivada del backbone de SPFormer (Superpoint Transformer for 3D Scene Instance Segmentation, AAAI 2023), entrenada para asignar una de las 20 clases semánticas del benchmark ScanNet a cada punto de una escena de interior.

El modelo tiene 17.335.476 parámetros (17,3 M), 3 canales de entrada, 32 características internas y una cabeza de clasificación de 20 clases. Su interés práctico es que ofrece, en formato safetensors y con una API de una línea (`tp.create_model(...)`), unos pesos que originalmente vivían en Open3D-ML, con licencia MIT, lo que facilita reutilizarlos en pipelines de percepción 3D basados en PyTorch sin depender del ecosistema de Open3D. Los resultados declarados por el autor son 67,71 de mIoU y 87,99 de exactitud global (OA) sobre ScanNet 20 clases, si bien no están verificados.

Es relevante ahora por dos motivos: el repo es pequeño (0,1 GB) y el modelo es ligero, por lo que se puede ejecutar en una GPU de consumo; y la conversión a safetensors con una API estable simplifica la integración en investigación de robótica, escaneo 3D y anotación semiautomática. Como contrapartida, tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y depende de kernels CUDA y de `spconv`, lo que limita su uso fuera de GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | U-Net con convoluciones dispersas (sparse convolutional U-Net del trabajo SPFormer) |
| Parámetros totales | 17.335.476 (17,3 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; el ejemplo de uso procesa 8192 puntos por muestra) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo de visión 3D; no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | Segmentación semántica de nubes de puntos (`point-cloud-segmentation`) |
| Dataset de entrenamiento | ScanNet, 20 clases |
| Canales de entrada | 3 |
| Clases de salida | 20 |
| Dimensión de características | 32 (features por punto en extracción) |
| Librería | torch-pointcloud |
| Dependencias | `spconv` compilado para la versión de PyTorch y CUDA correspondiente; kernels solo GPU |
| Tamaño del repositorio | 0,1 GB |
| Pipeline de HuggingFace | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-17 |
| Última actualización | 2026-10-20 |

## Arquitectura y entrenamiento

La arquitectura es una U-Net construida con convoluciones dispersas, es decir, operaciones que solo se computan sobre las posiciones ocupadas del voxel grid generado a partir de la nube de puntos (`pos_grid` en la API). El modelo recibe tres canales de entrada por punto y produce logits por punto para 20 clases; la dimensionalidad interna de características es 32, un valor deliberadamente compacto que explica el reducido número de parámetros (17,3 M). El checkpoint procede del backbone presentado en SPFormer, artículo que originalmente aborda segmentación de instancias de escena 3D mediante superpuntos y atención, aunque esta conversión concreta se publica para segmentación semántica. No se dispone del detalle de profundidad por nivel, strides, número de bloques ni del esquema exacto de superpuntos empleado en este checkpoint.

En cuanto a los datos, el entrenamiento se realizó sobre ScanNet (Dai et al., CVPR 2017) en su configuración de 20 clases, con reconstrucciones RGB-D de interiores. No se especifican en la información disponible el número de escenas, el número de puntos por muestra durante el entrenamiento, la composición exacta del dataset, ni si hubo aumentos de datos, destilación o ajuste posterior. Tampoco se documenta ningún proceso de alineación tipo RLHF/DPO, algo que no aplica a este tipo de modelo. La innovación técnica destacable no está en el entrenamiento sino en la ingeniería de distribución: conversión de pesos desde Open3D-ML (MIT) a safetensors, API `create_model` con transformadores de datos incluidos (`info["transform"]`), función `collate` para el batching y separación explícita entre la cabeza de clasificación y la extracción de características (`forward_features` o `reset_classifier(num_classes=0)`).

## Capacidades

- Segmentación semántica densa: asigna una etiqueta de entre 20 clases de interior a cada punto de la nube, con salida de logits por punto (`model(x, pos_grid, batch)`).
- Entrada multimodal por punto: el ejemplo de la model card construye la muestra con posición (`pos`), color (`color`, escalado 0-255) y normal (`normal`), además de las claves `segment` e `instance`.
- Extracción de características: `forward_features` devuelve un descriptor de 32 dimensiones por punto, reutilizable como embedding para tareas posteriores (clasificación de escena, clustering, recuperación).
- Eliminación de la cabeza: `reset_classifier(num_classes=0)` convierte el modelo en un extractor puro de features.
- Procesamiento por lotes: integración con `collate` de `torch_pointcloud.utils.data` para agrupar varias nubes en un batch.
- Inferencia en GPU: los kernels dispersos son solo GPU, y el ejemplo hace `model.cuda().eval()` de forma explícita.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso: la tarea es una pasada feed-forward de segmentación.
- No soporta capacidades multilingües, visión 2D, audio ni modo "thinking": fuera del alcance del modelo.

## Casos de uso

- Segmentación de escenas de interior para robótica móvil: el modelo etiqueta suelo, paredes y mobiliario punto a punto, lo que permite construir mapas semánticos y capas de navegación sobre la nube registrada por un LiDAR o una cámara RGB-D, con la ventaja de un modelo de 17,3 M que cabe en GPUs de consumo y puede correr a bordo.
- Pre-anotación de datasets 3D: usar los logits del modelo como propuesta inicial y corregir manualmente solo las regiones dudosas, reduciendo el coste de etiquetar reconstrucciones nuevas antes de enviarlas a anotadores humanos.
- Extracción de descriptores para downstream: `forward_features` proporciona 32 dimensiones por punto que se pueden alimentar a un clasificador ligero de escena, a un modelo de segmentación de instancias o a un sistema de recuperación de geometrías similares.
- Inspección y modelado BIM/as-built: segmentar escaneos de edificios para separar elementos estructurales y mobiliario, como paso previo a la vectorización o a la comparación con el modelo CAD.
- Realidad aumentada y mixta: oclusión semántica en tiempo de ejecución, etiquetando la geometría del entorno para que los objetos virtuales interactúen correctamente con superficies reales.
- Evaluación comparativa en investigación: servir de baseline reproducible del benchmark ScanNet 20 clases dentro de la librería torch-pointcloud, útil para medir el efecto de cambios en el pipeline de voxelización o en el preprocesado.
- Filtrado y limpieza de escaneos: identificar las clases de interés (por ejemplo, suelo) para recortar regiones y reducir el volumen de datos antes de etapas posteriores más costosas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (campo `verified: false`, sin validación independiente):

| Modelo | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| spformer-unet.scannet20.open3d | ScanNet (20 clases) | mIoU (`mean_iou`) | 67,71 | No |
| spformer-unet.scannet20.open3d | ScanNet (20 clases) | OA (`accuracy`) | 87,99 | No |

No se han publicado en la información disponible métricas por clase, matrices de confusión, tiempos de inferencia ni resultados en otros datasets (S3DIS, SemanticKITTI, Matterport3D). Tampoco hay comparación numérica con otros modelos en la documentación facilitada.

## Requisitos de hardware

- Los pesos en fp32 ocupan aproximadamente 69 MB (17.335.476 parámetros × 4 bytes); el repositorio completo son 0,1 GB.
- VRAM estimada para inferencia: no hay cifra publicada. Con una muestra de 8192 puntos como la del ejemplo, el consumo estaría dominado por las activaciones de las convoluciones dispersas y no por los pesos; una estimación razonable es por debajo de 2 GB para lotes pequeños, pero es una estimación, no un dato del autor.
- GPU: el modelo exige kernels CUDA; la model card indica explícitamente "GPU-only kernels". Cualquier GPU NVIDIA compatible con la versión de PyTorch y CUDA que se use debería servir; no se especifican modelos recomendados (A100, H100, RTX 4090 u otros).
- GPU de consumo: sí, es previsible que quepa en tarjetas consumer por tamaño de parámetros, siempre que la compilación de `spconv` sea compatible con la arquitectura (por ejemplo, sm_86 o sm_89). No confirmado por el autor.
- Despliegue: PyTorch + `torch-pointcloud` + `spconv`. No aplican vLLM, llama.cpp, Ollama ni TGI, que son runtimes de modelos de lenguaje.
- La instalación de `spconv` requiere una build que coincida con la versión de PyTorch y de CUDA, según la guía de instalación enlazada; es el principal punto de fricción del despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | mIoU ScanNet 20 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| spformer-unet.scannet20.open3d | U-Net con convoluciones dispersas | 17,3 M | No aplica | 67,71 (no verificado) | MIT | HuggingFace, safetensors |
| Checkpoint original en Open3D-ML (origen de la conversión) | U-Net con convoluciones dispersas | No disponible | No aplica | No disponible | MIT (Open3D-ML) | GitHub isl-org/Open3D-ML |
| MinkowskiNet (familia de referencia en segmentación 3D) | Red con convoluciones dispersas 4D | No disponible | No aplica | No disponible | No disponible | Implementaciones públicas |
| SPVCNN / TorchSparse | Convoluciones dispersas con poda | No disponible | No aplica | No disponible | No disponible | Repositorios públicos |

La comparación numérica con alternativas no puede realizarse con la información proporcionada: no se han facilitado parámetros, métricas ni licencias de los otros modelos. El dato más sólido de la comparativa es que este checkpoint es una conversión directa del publicado en Open3D-ML, por lo que sus pesos y métricas deberían coincidir con los de aquel.

## Limitaciones y advertencias

- La métrica de 67,71 mIoU está declarada por el autor y marcada como no verificada; no hay evaluación independiente ni resultados por clase que revelen el comportamiento en clases minoritarias.
- Dominio restringido: entrenado exclusivamente con ScanNet (interiores, 20 clases). No hay evidencia de generalización a exteriores, escenas industriales, LiDAR de largo alcance u otros sensores.
- Dependencia fuerte de la voxelización y del preprocesado: la API espera `pos_grid` y un `batch`, y el resultado depende de la resolución de voxel y del transformador de datos de la librería.
- Los kernels dispersos son solo GPU; el checkpoint no funciona en CPU sin recompilar o adaptar `spconv`.
- La build de `spconv` debe coincidir con PyTorch y CUDA; una incompatibilidad de versiones impide cargar el modelo.
- Sensibilidad a la calidad de la nube: densidad irregular, ruido de profundidad, desalineación de normales o ausencia de color pueden degradar la segmentación; el propio ejemplo usa datos sintéticos aleatorios.
- Sin información sobre sesgos: no se documenta el rendimiento por tipo de escena, tamaño de habitación, iluminación ni demografía de los entornos de ScanNet.
- Licencia MIT en los pesos, pero los términos de uso del dataset ScanNet no se detallan en la información disponible y deben revisarse por separado para uso comercial.
- Madurez comunitaria nula por el momento: 0 descargas y 0 likes, sin issues ni validación de terceros documentada.
- No es un modelo de lenguaje: no procesa texto, no tiene ventana de contexto y no admite instrucciones en lenguaje natural.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/spformer-unet.scannet20.open3d
- Paper de SPFormer (AAAI 2023): https://arxiv.org/abs/2211.15766
- Open3D-ML, origen de la conversión: https://github.com/isl-org/Open3D-ML
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de torch-pointcloud: https://pytorch-pointcloud.org
- Guía de instalación (compilación de `spconv`): https://pytorch-pointcloud.org/latest/installation/
- DOI de PyTorch PointCloud (Zenodo): https://doi.org/10.5281/zenodo.22159632
