# torch-pointcloud/minkunet18-w16.semantickitti.mmdet3d

## Resumen

MinkUNet18-W16 es un modelo de segmentación semántica de nubes de puntos LiDAR, no un modelo de lenguaje. Se trata de una U-Net residual dispersa (sparse residual U-Net) construida sobre convoluciones de Minkowski, publicada originalmente por Choy, Gwak y Savarese en el artículo "4D Spatio-Temporal ConvNets: Minkowski Convolutional Neural Networks" (CVPR 2019). Este checkpoint concreto ha sido convertido desde la implementación de referencia de OpenMMLab en mmdetection3d y redistribuido por el autor `torch-pointcloud` dentro de la librería PyTorch PointCloud, con licencia Apache-2.0.

El modelo resuelve la tarea de asignar una clase semántica a cada punto de una escena LiDAR, con 19 clases (coche, peatón, ciclista, carretera, acera, edificio, vegetación, etc.) y una entrada de 4 canales (coordenadas XYZ más intensidad). Con 5,44 millones de parámetros y 48 canales de características, es un modelo deliberadamente compacto orientado a inferencia en tiempo real sobre GPU, típico de los pipelines de percepción para vehículos autónomos y robótica móvil.

Su relevancia actual es la de un baseline reproducible y ligero: permite validar pipelines de segmentación LiDAR sin depender de checkpoints propietarios ni de frameworks cerrados, y sirve como punto de partida para fine-tuning sobre dominios propios (almacenes, minería, drones). No es un modelo generativo ni conversacional: no procesa texto, no tiene ventana de contexto y no soporta tool calling.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MinkUNet18-W16 (U-Net residual dispersa con convoluciones de Minkowski) |
| Parámetros totales | 5.441.379 (5,4 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de nubes de puntos, no secuencial) |
| Tipos de cuantización | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (XYZ + intensidad) |
| Clases de salida | 19 (SemanticKITTI) |
| Canales de características | 48 |
| Librería | torch-pointcloud (requiere spconv) |
| Dataset de entrenamiento | SemanticKITTI |

## Arquitectura y entrenamiento

La red es una U-Net dispersa con bloques residuales de tipo ResNet-18 adaptados al dominio disperso mediante convoluciones de Minkowski. En lugar de densificar el voxel grid (lo que desperdiciaría memoria en escenas LiDAR donde más del 95 % del volumen está vacío), las convoluciones se calculan únicamente sobre las posiciones ocupadas, manteniendo un índice de coordenadas dispersas. El sufijo W16 indica un ancho base de 16 canales en el primer nivel del encoder, que se duplica en cada etapa de downsampling; el decoder reconstruye la resolución original mediante sparse transposed convolutions y conexiones de salto. La entrada tiene 4 canales y la cabeza final proyecta a las 19 clases de SemanticKITTI.

El entrenamiento se realizó sobre SemanticKITTI, el benchmark de referencia para segmentación semántica de secuencias LiDAR (Behley et al., ICCV 2019), que contiene 43.552 escaneos de 22 secuencias capturadas con un Velodyne HDL-64E en entornos urbanos alemanes. La model card no detalla el número de épocas, la composición exacta del dataset, el esquema de aumentación ni si se aplicaron técnicas de regularización específicas; esa información no está disponible. El checkpoint se obtuvo por conversión directa desde los pesos de mmdetection3d, por lo que hereda el pipeline de entrenamiento de OpenMMLab sin modificaciones documentadas.

## Capacidades

- Segmentación semántica densa de nubes de puntos LiDAR: asigna una de 19 clases a cada punto de entrada.
- Procesamiento de escenas dispersas a gran escala gracias a las convoluciones de Minkowski, sin densificación del voxel grid.
- Extracción de características por punto mediante `forward_features`, que devuelve un vector de 48 dimensiones por punto utilizable como embedding para tareas downstream.
- Reutilización como backbone: `reset_classifier(num_classes=0)` permite emplear el modelo como extractor congelado o para fine-tuning con un número de clases distinto.
- Inferencia por lotes con `collate`, admitiendo múltiples escenas en un mismo batch mediante el tensor `batch` de índices.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión 2D, audio ni generación de texto: es un modelo puramente discriminativo y específico de dominio.

## Casos de uso

- Percepción en vehículos autónomos: el modelo clasifica cada retorno LiDAR en clases de interés (vehículo, peatón, ciclista, carretera, acera) a partir de un único escaneo, sirviendo como etapa de segmentación previa a la detección de obstáculos o a la planificación de trayectorias.
- Robótica móvil en interiores y exteriores: con 5,4 M de parámetros cabe en GPUs embebidas (Jetson Orin, RTX A2000) y permite segmentar el entorno a bordo de AGVs o robots de reparto sin conexión a la nube.
- Etiquetado semiautomático de datos: usar el modelo como pre-etiquetador para anotar grandes volúmenes de escaneos LiDAR y reducir el coste de anotación manual, revisando después las predicciones con herramientas de corrección.
- Fine-tuning a dominios específicos: al ser un backbone ligero y con licencia Apache-2.0, es adecuado para reentrenar sobre datos propios de minería, agricultura, puertos o almacenes, sustituyendo la cabeza de 19 clases por la del dominio objetivo.
- Extracción de embeddings para búsqueda y clustering: `forward_features` produce descriptores por punto de 48 dimensiones que pueden alimentar modelos de segmentación no supervisada, detección de anomalías o recuperación de escenas similares.
- Control de calidad en mapas HD: comparar la segmentación del modelo con la cartografía de referencia para detectar cambios en la vía (obras, vegetación crecida, mobiliario nuevo) mediante diferencias entre clases predichas y clases del mapa.
- Módulo de evaluación de pipelines: al ser un checkpoint reproducible de mmdetection3d, sirve como referencia para validar conversiones de formato, versiones de spconv o cambios en el preprocesado antes de desplegar modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de validación de SemanticKITTI (métricas no verificadas de forma independiente):

| Métrica | Valor |
|---|---|
| mIoU | 60,25 |
| OA (accuracy global) | 91,78 |

No se han publicado en la información disponible resultados desglosados por clase, tiempos de inferencia ni comparaciones con otros checkpoints dentro de la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 5,4 M de parámetros en fp32, los pesos ocupan aproximadamente 22 MB; el consumo real lo dominan las activaciones dispersas y el índice de coordenadas de spconv, que escalan con el número de puntos y el tamaño de voxel.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA compatible con la build de spconv (RTX 3090, RTX 4090, A100, H100, L4, Jetson Orin). El modelo se ejecuta exclusivamente en GPU: los kernels de Minkowski no tienen implementación CPU funcional en esta configuración.
- Cabe en GPU de consumo: sí, con margen amplio en términos de pesos; el límite práctico es la memoria de activaciones, que depende del número de puntos por escena y del batch.
- Opciones de despliegue: la vía documentada es `torch-pointcloud` con `spconv` compilado contra la versión de PyTorch y CUDA del entorno. No se documentan exportaciones a ONNX, TensorRT, TorchScript ni integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Clases | mIoU (SemanticKITTI val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MinkUNet18-W16 (este) | 5,4 M | XYZ + intensidad | 19 | 60,25 | Apache-2.0 | Hugging Face, torch-pointcloud |
| MinkUNet34 (mmdetection3d) | no disponible en la información | XYZ + intensidad | 19 | no disponible en la información | Apache-2.0 | GitHub OpenMMLab |
| Cylinder3D | no disponible en la información | XYZ + intensidad | 19 | no disponible en la información | no disponible | Repositorios de investigación |
| SPVNAS / TorchSparse | no disponible en la información | XYZ + intensidad | 19 | no disponible en la información | no disponible | Repositorios de investigación |

No se dispone de datos verificados de los modelos alternativos en la información proporcionada; la comparación cuantitativa de rendimiento entre ellos no está disponible.

## Limitaciones y advertencias

- Modelo específico de dominio: no procesa texto, imágenes 2D ni audio; cualquier uso fuera de la segmentación de nubes de puntos LiDAR no es aplicable.
- Entrenado exclusivamente con SemanticKITTI (escenas urbanas alemanas, sensor Velodyne HDL-64E): el rendimiento puede degradarse notablemente con otros sensores, densidades de puntos, geometrías de haz o entornos no urbanos.
- Las métricas (mIoU 60,25, OA 91,78) están declaradas por el autor y marcadas como no verificadas; no deben tomarse como referencia absoluta sin reproducción independiente.
- Dependencia de `spconv` compilado contra la versión exacta de PyTorch y CUDA: los desajustes de versión son una fuente habitual de fallos de instalación y de errores en tiempo de ejecución.
- Requiere GPU: no hay camino de inferencia en CPU documentado, lo que limita el despliegue en entornos sin acelerador NVIDIA.
- No se documentan sesgos demográficos ni geográficos más allá del dominio del dataset; la ausencia de diversidad geográfica en SemanticKITTI es un sesgo implícito relevante para despliegues internacionales.
- Riesgo de falsos negativos en clases minoritarias (peatones, ciclistas) por el desbalanceo típico de los datasets LiDAR urbanos; conviene auditar el rendimiento por clase antes de uso en seguridad.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; no se identifican restricciones adicionales en la información disponible.
- El repositorio ocupa 0,0 GB según los metadatos, lo que sugiere que el peso puede no estar materializado o que el tamaño se reporta de forma imprecisa; conviene verificar la descarga antes de integrarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/minkunet18-w16.semantickitti.mmdet3d
- Paper de Minkowski Convolutional Neural Networks: https://arxiv.org/abs/1904.08755
- Repositorio de PyTorch PointCloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de PyTorch PointCloud: https://pytorch-pointcloud.org/latest/installation/
- Repositorio de mmdetection3d (origen del checkpoint): https://github.com/open-mmlab/mmdetection3d
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
