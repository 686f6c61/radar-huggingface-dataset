# torch-pointcloud/pointnet.scanobjectnn-hardest.openpoints

## Resumen

PointNet es un modelo de clasificación de nubes de puntos 3D publicado originalmente en CVPR 2017 por Charles R. Qi, Hao Su, Kaichun Mo y Leonidas J. Guibas. Esta ficha concreta corresponde a un checkpoint de PointNet convertido al formato de la librería `torch-pointcloud` por el usuario `torch-pointcloud`, entrenado sobre la variante más difícil del dataset ScanObjectNN (PB_T50_RS), que contiene objetos 3D reales escaneados con oclusión y perturbaciones. El modelo resuelve la tarea de clasificación de formas 3D en 15 categorías a partir de coordenadas XYZ.

La relevancia de este checkpoint es fundamentalmente práctica: permite cargar un PointNet preentrenado con una sola llamada a `tp.create_model` y obtener tanto logits de clasificación como embeddings de 1024 dimensiones para tareas posteriores (búsqueda, clustering, transferencia). Con solo 3,5 millones de parámetros, es un modelo extremadamente ligero que puede ejecutarse en CPU y sirve como línea base sólida para pipelines de percepción 3D.

Arquitectónicamente es un transformer de conjuntos muy sencillo (no es un transformer de atención): un MLP compartido por punto con transformaciones de entrada y de características, seguido de una agregación por max-pooling global. No dispone de ventana de contexto en el sentido de los modelos de lenguaje; su "entrada" es un conjunto de hasta 8192 puntos con 3 coordenadas cada uno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointNet (MLP compartido por punto + max-pooling global, con input transform y feature transform) |
| Parametros totales | 3.485.912 (3,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de hasta 8192 puntos por muestra (configuracion de ejemplo de la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no aplica (modelo de vision 3D, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 1 (coordenadas XYZ) |
| Clases de salida | 15 |
| Dimension del embedding | 1024 |
| Dataset de entrenamiento | ScanObjectNN (PB_T50_RS) |
| Libreria | torch-pointcloud |

## Arquitectura y entrenamiento

PointNet procesa cada punto de forma independiente mediante una red MLP compartida (típicamente capas de 64, 64, 64, 128, 1024 canales), aplica una transformación de entrada T-Net de 3x3 para alinear la nube y una transformación de características de 64x64, y agrega la información con un max-pooling global que produce un vector de 1024 dimensiones invariante al orden de los puntos. Sobre ese vector se aplica un clasificador MLP que devuelve logits para las 15 clases. El modelo no usa atención, convoluciones sobre voxels ni message passing entre vecinos, lo que explica su bajo coste computacional.

El entrenamiento se realizó sobre ScanObjectNN en la configuración PB_T50_RS, la variante "hardest" del benchmark, que introduce perturbaciones en los objetos (traslación, rotación y escalado aleatorios) y los presenta con oclusión parcial. No se dispone de información sobre el número exacto de épocas, la composición del dataset ni si hubo aumentación adicional más allá de la implícita en PB_T50_RS. El checkpoint fue convertido desde el repositorio PointNeXt de Guochengqian (licencia MIT) a la librería `torch-pointcloud` de Arthur Dujardin. No se documenta uso de RLHF/DPO (no aplica a este tipo de modelo) ni innovaciones como decodificación especulativa.

## Capacidades

- Clasificación de nubes de puntos 3D en 15 categorías de objetos (ScanObjectNN).
- Extracción de embeddings globales de 1024 dimensiones mediante `forward_features` o `reset_classifier(num_classes=0)`.
- Robustez a invariancia de permutación de puntos por diseño (max-pooling simétrico).
- Invariancia aproximada a rotaciones y traslaciones gracias a los módulos T-Net de entrada y de características.
- Adaptación a otros números de clases mediante `reset_classifier(num_classes=N)` para fine-tuning.
- Ejecución en CPU y GPU sin requisitos de memoria significativos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador puro de formas 3D.

## Casos de uso

- Clasificación de objetos escaneados en robótica móvil: un robot con LiDAR o cámara de profundidad puede segmentar objetos y pasar cada nube de puntos al modelo para etiquetarlos en tiempo real, gracias a sus 3,5 M de parámetros y su baja latencia.
- Indexado y búsqueda de activos 3D: usar los embeddings de 1024 dimensiones como firma vectorial para construir un índice de similitud (FAISS, Qdrant) sobre catálogos de modelos 3D y recuperar objetos parecidos.
- Preprocesado en pipelines de realidad aumentada: clasificar objetos detectados en la escena antes de superponer contenido, con un coste computacional compatible con dispositivos de gama media.
- Línea base para investigación en clasificación 3D: punto de partida reproducible sobre ScanObjectNN PB_T50_RS para comparar arquitecturas más modernas (PointNeXt, Point Transformer, DGCNN) con métricas OA y mAcc estandarizadas.
- Etiquetado asistido de datasets 3D: preanotar nubes de puntos con las 15 clases aprendidas y revisar manualmente solo los casos de baja confianza, reduciendo el coste de anotación.
- Detección de anomalías en inspección industrial: entrenar un clasificador binario o de múltiples clases sobre los embeddings extraídos para distinguir piezas correctas de defectuosas en líneas de fabricación.
- Extracción de características para modelos downstream: congelar el backbone y entrenar una cabeza ligera para tareas de segmentación semántica por objeto o estimación de pose.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Metrica | Valor |
|---|---|---|
| ScanObjectNN (PB_T50_RS) | OA (overall accuracy) | 75,16 |
| ScanObjectNN (PB_T50_RS) | mAcc (mean accuracy) | 71,44 |

No se han publicado en la información disponible resultados comparativos con otros modelos sobre el mismo split, ni latencias o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 100 MB en FP32 para el modelo en sí; el consumo real lo determina el tamaño del batch y el número de puntos por muestra (8192 puntos x 3 coordenadas x batch).
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en tarjetas de gama de entrada (GTX 1650, RTX 3050) y en iGPU.
- Cabe en cualquier GPU de consumo actual e incluso en CPU: la inferencia en CPU es viable para lotes pequeños.
- Opciones de despliegue: `torch-pointcloud` (recomendado, con `tp.create_model`), PyTorch nativo cargando el safetensors, exportación a TorchScript u ONNX no documentada pero factible.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera del orden de milisegundos por muestra en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | OA (PB_T50_RS) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PointNet (este checkpoint) | 3,5 M | ScanObjectNN PB_T50_RS | 75,16 | MIT | Hugging Face (`torch-pointcloud`) |
| DGCNN | no disponible en la informacion | ScanObjectNN PB_T50_RS | no disponible en la informacion | MIT (implementacion original) | Repositorios de investigacion |
| PointNeXt | no disponible en la informacion | ScanObjectNN PB_T50_RS | no disponible en la informacion | MIT | GitHub (`guochengqian/PointNeXt`) |
| Point Transformer | no disponible en la informacion | ScanObjectNN PB_T50_RS | no disponible en la informacion | no disponible | Repositorios de investigacion |

No se dispone de cifras verificadas de los modelos alternativos en la información proporcionada; la comparativa se limita a señalar la existencia de alternativas con mayor capacidad (DGCNN, PointNeXt, Point Transformer) que habitualmente superan a PointNet en ScanObjectNN a costa de más parámetros y cómputo.

## Limitaciones y advertencias

- Modelo puramente geométrico: no procesa texto, imágenes 2D ni audio; no es un modelo de lenguaje y no debe evaluarse como tal.
- Solo clasifica en 15 clases de ScanObjectNN; fuera de ese dominio (formas no vistas, escenas completas, nubes muy dispersas) la precisión cae drásticamente.
- PointNet no modela relaciones locales entre puntos, lo que limita su precisión frente a arquitecturas con vecindad (DGCNN, PointNeXt, transformers 3D).
- Los resultados OA 75,16 y mAcc 71,44 están declarados como no verificados (`verified: false`) en la model card; deben tratarse como cifras del autor.
- Riesgo de sobreajuste al estilo de perturbación de PB_T50_RS; la generalización a otros sensores o densidades no está documentada.
- No hay información sobre sesgos del dataset (posibles desequilibrios de clase, sesgos de captura) ni sobre evaluación por clase.
- Licencia MIT permite uso comercial, pero conviene revisar las licencias del dataset ScanObjectNN y del código original de PointNet/PointNeXt en el contexto de producción.
- No se publican variantes cuantizadas ni formatos ONNX/TFLite; el despliegue en edge requiere conversión manual.
- El repositorio tiene 0,0 GB y 24 descargas: es un checkpoint de bajo uso, sin garantías de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointnet.scanobjectnn-hardest.openpoints
- Paper original de PointNet: https://arxiv.org/abs/1612.00593
- Repositorio PointNeXt (origen de la conversión): https://github.com/guochengqian/PointNeXt
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Dataset ScanObjectNN (paper ICCV 2019): https://arxiv.org/abs/1908.00792 (referencia citada en la model card como Uy et al., 2019)
