# torch-pointcloud/pv-rcnn.kitti.mmdet3d

## Resumen

PV-RCNN es un detector de objetos 3D para nubes de puntos LiDAR que combina el aprendizaje basado en vóxeles con el basado en puntos. Esta ficha corresponde al checkpoint `pv-rcnn.kitti.mmdet3d`, una conversión del modelo original de OpenMMLab (mmdetection3d) al ecosistema de la librería `torch-pointcloud`, empaquetada en formato safetensors y publicada bajo licencia Apache-2.0. El modelo resuelve la detección de coches, peatones y ciclistas en escenas de conducción autónoma.

La arquitectura emplea una primera etapa de propuesta de regiones sobre características voxelizadas y una segunda etapa de refinamiento con abstracción de conjuntos de puntos (Point-Voxel Feature Set Abstraction). El checkpoint contiene 13,1 millones de parámetros, acepta 4 canales de entrada (coordenadas XYZ más intensidad) y produce predicciones sobre 3 clases. Está entrenado exclusivamente sobre el dataset KITTI.

Su relevancia actual radica en que ofrece una implementación práctica y reproducible de un detector 3D clásico pero todavía competitivo, con pesos listos para usar en PyTorch y con soporte de extracción de características de 512 canales. Es una pieza útil como baseline en investigación de percepción 3D y como componente en pipelines de robótica y automoción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PV-RCNN (detector 3D en dos etapas: voxel CNN + point set abstraction) |
| Parametros totales | 13.129.009 (13,1 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (XYZ + intensidad) |
| Clases de salida | 3 (Car, Pedestrian, Cyclist) |
| Dimension de caracteristicas | 512 |
| Dataset de entrenamiento | KITTI |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

PV-RCNN es un detector de objetos 3D en dos etapas. La primera etapa voxeliza la nube de puntos y aplica un backbone 3D convolucional (típicamente sparse conv) para generar propuestas de regiones. La segunda etapa muestrea un conjunto de puntos clave (keypoints) alrededor de cada propuesta y aplica Point-Voxel Feature Set Abstraction para agregar características tanto de los vóxeles como de los puntos originales, refinando las cajas 3D. La combinación de representaciones voxel y point permite capturar estructura geométrica fina sin renunciar a la eficiencia del procesamiento por vóxeles.

El checkpoint fue convertido desde mmdetection3d (OpenMMLab) a la librería `torch-pointcloud` de Arthur Dujardin. Está entrenado sobre KITTI, el benchmark de referencia para percepción en conducción autónoma, con 3 clases anotadas. No se dispone de información sobre el número exacto de tokens/puntos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de aumento o refinamiento posteriores al entrenamiento supervisado. El modelo requiere kernels de GPU específicos (`spconv` y `pyg-lib`) compilados contra la versión de PyTorch y CUDA del entorno.

## Capacidades

- Detección de objetos 3D en nubes de puntos LiDAR: devuelve cajas 3D con clase, centro, dimensiones y orientación.
- Tres clases: coche, peatón y ciclista.
- Entrada multimodal de 4 canales: coordenadas XYZ más intensidad de retorno.
- Extracción de características de 512 canales mediante `forward_features`, útil para tareas downstream (clasificación, segmentación, reutilización como backbone).
- Procesamiento por lotes (collate) de múltiples nubes de puntos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de percepción 3D.
- No dispone de modo "thinking", visión 2D, audio ni generación de texto.

## Casos de uso

- Baseline en investigación de detección 3D: sirve como referencia reproducible para comparar nuevos detectores sobre KITTI, gracias a sus métricas publicadas y a la conversión a `torch-pointcloud`.
- Percepción en conducción autónoma simulada: integrado en un pipeline de vehículo autónomo en simulador (CARLA, por ejemplo) para detectar coches y peatones a partir de LiDAR sintético.
- Robótica móvil indoor/outdoor: detección de obstáculos y personas en robots con LiDAR, usando la salida de cajas 3D para planificación de trayectorias.
- Extracción de características para modelos downstream: `forward_features` proporciona descriptores de 512 canales que pueden alimentar clasificadores o segmentadores de escena.
- Análisis de tráfico y aforo: conteo y localización de vehículos y ciclistas en grabaciones LiDAR de vías urbanas.
- Docencia y formación: ejemplo didáctico de arquitectura two-stage con representación híbrida voxel-punto, con código de uso mínimo y pesos listos.
- Prototipado rápido en GPU: al ser un modelo de 13 M de parámetros, cabe en GPUs de consumo y permite iterar sobre datasets propios con fine-tuning.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Metrica | Dataset | Valor |
|---|---|---|
| mAP | KITTI | 72,15 |
| AP/Car | KITTI | 83,54 |
| AP/Pedestrian | KITTI | 59,71 |
| AP/Cyclist | KITTI | 73,20 |

No se han publicado en la información disponible resultados adicionales (latencia, throughput, métricas por dificultad Easy/Moderate/Hard) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo (13,1 M de parámetros, ~50 MB en FP32) y las activaciones de un backbone 3D, se estima un consumo moderado, del orden de pocos GB, aunque depende del número de puntos y vóxeles de entrada.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA moderna; el modelo es GPU-only (kernels de `spconv` y `pyg-lib`).
- GPU de consumo: sí, cabe en tarjetas como RTX 3060/4060/4090, siempre que se compile `spconv` y `pyg-lib` contra la versión de CUDA correspondiente.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo). El despliegue se realiza vía la librería `torch-pointcloud` en PyTorch.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | mAP | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pv-rcnn.kitti.mmdet3d (este) | 13,1 M | KITTI | 72,15 | Apache-2.0 | Hugging Face, safetensors |
| PointPillars (mmdetection3d) | no disponible en esta ficha | KITTI | no disponible en esta ficha | Apache-2.0 | mmdetection3d / torch-pointcloud |
| SECOND (mmdetection3d) | no disponible en esta ficha | KITTI | no disponible en esta ficha | Apache-2.0 | mmdetection3d |
| VoxelNet (referencia original) | no disponible en esta ficha | KITTI | no disponible en esta ficha | no disponible | Implementaciones de terceros |

No se dispone en la información proporcionada de cifras de rendimiento de los modelos alternativos para una comparación numérica rigurosa; se indican únicamente como alternativas de la misma categoría (detección 3D sobre KITTI).

## Limitaciones y advertencias

- Entrenado exclusivamente sobre KITTI: el dominio (escenas de conducción diurna, sensor LiDAR concreto, densidad y calibración específicas) limita la generalización a otros sensores, ciudades o condiciones meteorológicas.
- Solo 3 clases (Car, Pedestrian, Cyclist): no detecta camiones, autobuses, motos, semáforos ni señalización.
- Métricas no verificadas (`verified: false`): los valores de mAP y AP provienen de la model card y no han sido reproducidos de forma independiente.
- Dependencias frágiles: requiere `spconv` y `pyg-lib` compilados contra la versión exacta de PyTorch y CUDA, lo que complica el despliegue reproducible.
- Solo GPU: los kernels no funcionan en CPU, lo que descarta entornos sin acelerador NVIDIA.
- Riesgo de falsos negativos en objetos ocluidos, lejanos o con pocos puntos, típico de detectores LiDAR.
- Riesgo de sesgo hacia la distribución de KITTI (entornos urbanos alemanes, vehículos europeos), con posible degradación en otras geografías.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las licencias de KITTI y de las dependencias (`spconv`, `pyg-lib`) antes de producción.
- No apto para tareas de lenguaje, razonamiento, agentes ni tool calling: es un modelo de percepción 3D puro.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/pv-rcnn.kitti.mmdet3d
- Paper PV-RCNN: https://arxiv.org/abs/1912.13192
- Repositorio torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación: https://pytorch-pointcloud.org/latest/installation/
- Repositorio mmdetection3d (origen de la conversión): https://github.com/open-mmlab/mmdetection3d
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Dataset KITTI: https://www.cvlibs.net/datasets/kitti/
