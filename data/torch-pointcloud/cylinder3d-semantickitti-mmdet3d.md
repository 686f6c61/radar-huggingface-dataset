# torch-pointcloud/cylinder3d.semantickitti.mmdet3d

## Resumen

Cylinder3D es un modelo de segmentación semántica de nubes de puntos LiDAR desarrollado originalmente por Xinge Zhu, Hui Zhou, Tai Wang, Fangzhou Hong, Yuexin Ma, Wei Li, Hongsheng Li y Dahua Lin, y publicado en CVPR 2021 bajo el título "Cylindrical and Asymmetrical 3D Convolution Networks for LiDAR Segmentation". Esta ficha concreta corresponde a la conversión del checkpoint oficial de MMDetection3D al formato de la librería `torch-pointcloud`, publicada por el usuario `torch-pointcloud` en Hugging Face.

El modelo resuelve la tarea de segmentación semántica por punto sobre escenas LiDAR, asignando cada punto a una de 19 clases (vehículo, peatón, carretera, edificio, vegetación, etc.) sobre el dataset SemanticKITTI. Su innovación principal es el uso de una partición cilíndrica del espacio (en lugar de la proyección esférica o vóxeles cartesianos) combinada con convoluciones dispersas asimétricas 3D, lo que permite capturar mejor la distribución no uniforme de los puntos LiDAR en función de la distancia al sensor.

Con 49,6 millones de parámetros (49.599.943 según el fichero safetensors) y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en pipelines de percepción 3D para conducción autónoma y robótica. Reporta un mIoU de 63,19 y una precisión global (OA) de 91,08 sobre SemanticKITTI, resultados declarados por el autor y no verificados de forma independiente en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cylinder3D: red de convolución dispersa 3D con partición cilíndrica y convoluciones asimétricas |
| Parametros totales | 49.599.943 (49,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre nubes de puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; tarea de visión 3D) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 1 |
| Clases de salida | 19 |
| Dimensión de features | 128 |
| Dataset de entrenamiento | SemanticKITTI |
| Librería | torch-pointcloud (requiere spconv) |

## Arquitectura y entrenamiento

Cylinder3D es una red neuronal de convolución dispersa 3D (sparse 3D CNN) que opera sobre nubes de puntos LiDAR. Su diseño se articula en torno a dos ideas: (1) una partición cilíndrica del espacio que divide la escena en sectores angulares y anillos radiales, adaptándose a la densidad variable de puntos LiDAR con la distancia, y (2) un bloque de convoluciones asimétricas 3D que descompone un kernel 3D en tres kernels 1D ortogonales para reducir el coste computacional manteniendo el campo receptivo. La red produce una predicción por punto entre las 19 clases de SemanticKITTI.

El checkpoint se entrenó sobre SemanticKITTI, el benchmark de referencia para segmentación semántica de secuencias LiDAR. La model card no detalla el número exacto de tokens/puntos de entrenamiento, la composición del dataset más allá de su nombre, ni si se aplicaron técnicas de ajuste fino adicionales como RLHF o DPO (no aplicables en esta tarea). La información disponible indica que el modelo fue convertido desde MMDetection3D (Apache-2.0) al formato de `torch-pointcloud`, y que la inferencia requiere kernels de GPU (spconv compilado para la versión de torch y CUDA correspondiente).

## Capacidades

- Segmentación semántica por punto de nubes de puntos LiDAR en 19 clases (vehículo, peatón, ciclista, carretera, acera, edificio, vegetación, tráfico, etc.).
- Procesamiento de escenas 3D completas mediante convoluciones dispersas, sin necesidad de proyección a imagen 2D.
- Extracción de features por punto de dimensión 128 mediante `forward_features` o reseteando el clasificador (`reset_classifier(num_classes=0)`), útil como backbone para tareas posteriores.
- Inferencia por lotes con soporte de `collate` y transformaciones de datos incluidas en la librería.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües: es un modelo puramente perceptivo 3D.
- No dispone de modo "thinking", visión 2D, audio ni generación de texto.

## Casos de uso

- Percepción para conducción autónoma: segmentar cada barrido LiDAR de un vehículo en clases semánticas para alimentar módulos de planificación y evitación de obstáculos, aprovechando la partición cilíndrica que maneja bien la densidad variable de puntos con la distancia.
- Etiquetado automático de datasets LiDAR: pre-anotar grandes volúmenes de nubes de puntos para revisión humana, reduciendo el coste de anotación manual en proyectos de percepción 3D.
- Robótica móvil en exteriores: clasificar el entorno (carretera, acera, vegetación, edificios) para navegación segura de robots y vehículos autónomos en campus o entornos urbanos.
- Análisis de escenas urbanas y GIS: extraer estadísticas semánticas de barridos LiDAR (superficie de calzada, vegetación, edificios) para estudios de movilidad o gemelos digitales.
- Preprocesado para detección 3D: usar las features de 128 dimensiones del backbone como entrada a cabezales de detección de objetos o segmentación de instancias.
- Investigación en segmentación 3D: servir como baseline reproducible (checkpoint convertido desde MMDetection3D) para comparar nuevas arquitecturas sobre SemanticKITTI.
- Integración en pipelines de percepción en vehículo: al ser un modelo compacto (49,6 M de parámetros, 0,2 GB), puede desplegarse en GPUs de automoción con kernels spconv optimizados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| SemanticKITTI | mIoU | 63,19 |
| SemanticKITTI | OA (accuracy) | 91,08 |

No se han publicado en la información disponible resultados comparativos adicionales (por clase, por rango de distancia, latencia o throughput) más allá de los dos valores anteriores.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 49,6 M de parámetros en fp32 el peso ocupa aproximadamente 0,2 GB, pero el consumo real depende del número de puntos por escena y de las estructuras dispersas de spconv.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA compatible con la build de spconv; para escenas SemanticKITTI completas se recomienda al menos 8-16 GB de VRAM.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 o superiores, siempre que la build de spconv coincida con la versión de torch y CUDA.
- Solo GPU: la model card indica que los kernels son GPU-only (`model.cuda().eval()`), por lo que no hay inferencia en CPU documentada.
- Opciones de despliegue: librería `torch-pointcloud` (`pip install torch-pointcloud`) más `spconv` compilado; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | mIoU SemanticKITTI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cylinder3D (este checkpoint) | 49,6 M | Nube de puntos LiDAR, 19 clases | 63,19 (declarado) | Apache-2.0 | Hugging Face (torch-pointcloud) |
| Otras variantes de Cylinder3D | no disponible | Nube de puntos LiDAR | no disponible | Apache-2.0 (código original) | MMDetection3D / repos originales |
| Alternativas de segmentación LiDAR (p. ej. MinkUNet, SPVCNN) | no disponible | Nube de puntos LiDAR | no disponible | varía | varía |

No se dispone en la información proporcionada de datos verificables de parámetros, contexto o mIoU de modelos alternativos para establecer una comparación cuantitativa fiable; los valores de esta tabla para alternativas se marcan como no disponibles.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre SemanticKITTI: el dominio se limita a escenas de conducción urbana y rural captadas con el sensor y la configuración de ese dataset; el rendimiento puede degradarse con otros LiDAR, densidades o entornos.
- Solo 19 clases: no cubre categorías fuera de la taxonomía de SemanticKITTI.
- Riesgo de confusión entre clases similares (por ejemplo, tipos de vehículo o vegetación frente a edificios) y de errores en puntos lejanos donde la densidad es baja.
- Sesgos potenciales derivados de la distribución geográfica y de sensores del dataset de entrenamiento (Alemania, sensor Velodyne HDL-64E), no documentados de forma explícita por el autor.
- Requiere GPU y una build de `spconv` compatible con la versión de torch y CUDA, lo que complica el despliegue reproducible en producción.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las licencias del código original de MMDetection3D y de spconv, así como las condiciones del dataset SemanticKITTI para entrenamiento o redistribución.
- Métricas declaradas como no verificadas (`verified: false`) en la model card; no deben tomarse como resultados auditados.
- Sin soporte de texto, tool calling ni agentes: no es adecuado para tareas de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/cylinder3d.semantickitti.mmdet3d
- Paper Cylinder3D (arXiv): https://arxiv.org/abs/2011.10033
- Repositorio MMDetection3D: https://github.com/open-mmlab/mmdetection3d
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Dataset SemanticKITTI: http://semantic-kitti.org/
