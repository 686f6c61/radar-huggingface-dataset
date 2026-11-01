# torch-pointcloud/cylinder3d.semantickitti.xinge-zhu

## Resumen

Cylinder3D es un modelo de segmentación semántica de nubes de puntos LiDAR desarrollado originalmente por Xinge Zhu, Hui Zhou, Tai Wang, Fangzhou Hong, Yuexin Ma, Wei Li, Hongsheng Li y Dahua Lin, presentado en el paper "Cylindrical and Asymmetrical 3D Convolution Networks for LiDAR Segmentation" (CVPR 2021). Esta ficha concreta corresponde a la conversión del checkpoint original al formato de la librería `torch-pointcloud` de Arthur Dujardin, publicada bajo el identificador `torch-pointcloud/cylinder3d.semantickitti.xinge-zhu`.

El modelo resuelve la tarea de segmentación semántica por punto sobre escenas LiDAR, asignando cada punto a una de 19 clases (vehículo, peatón, carretera, edificio, vegetación, etc.). Su innovación principal es el uso de una partición cilíndrica del espacio 3D en lugar de la típica voxelización cartesiana, combinada con convoluciones dispersas asimétricas, lo que mejora la coherencia geométrica en escenas urbanas de gran extensión.

Con 49,6 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en GPU. Declara un mIoU de 66,91 y una precisión global (OA) de 91,49 sobre el conjunto de validación de SemanticKITTI. Su relevancia actual radica en que ofrece un baseline reproducible y empaquetado en PyTorch para pipelines de percepción 3D en conducción autónoma y robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cylinder3D: red de convolución dispersa 3D con partición cilíndrica y convoluciones asimétricas |
| Parametros totales | 49.599.943 (49,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre nubes de puntos, no secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de visión 3D, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `torch-pointcloud`) |
| Canales de entrada | 1 |
| Clases de salida | 19 |
| Dimension de features | 128 |
| Dataset de entrenamiento | SemanticKITTI |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

Cylinder3D emplea una arquitectura de segmentación 3D basada en convoluciones dispersas. En lugar de discretizar la escena LiDAR en una rejilla cartesiana, proyecta los puntos sobre una partición cilíndrica que respeta la distribución radial del sensor, reduciendo la pérdida de resolución en las zonas alejadas. Sobre esa representación aplica un bloque de convoluciones asimétricas (descomposición en ramas a lo largo de los ejes de la rejilla cilíndrica) para capturar contexto espacial de forma eficiente, seguidas de un decoder que devuelve una predicción por punto.

El checkpoint se entrenó sobre SemanticKITTI, el benchmark de referencia para segmentación semántica de secuencias LiDAR en entornos urbanos, con 19 clases evaluables. La model card no detalla el número exacto de tokens, épocas, composición del dataset ni si se aplicaron técnicas de aumento de datos específicas más allá de las del repositorio original. Tampoco se documenta el uso de RLHF/DPO, algo que no aplica a este tipo de modelo. La conversión desde el repositorio original `xinge008/Cylinder3D` (también Apache-2.0) mantiene la arquitectura y los pesos, adaptándolos a la API de `torch-pointcloud`.

## Capacidades

- Segmentación semántica por punto en nubes de puntos LiDAR 3D con 19 clases de SemanticKITTI.
- Procesamiento de escenas urbanas de gran extensión gracias a la partición cilíndrica.
- Extracción de features de 128 dimensiones por punto mediante `forward_features` y `reset_classifier(num_classes=0)`.
- Inferencia por lotes con soporte de `collate` y tensores en GPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente perceptivo.
- No tiene capacidades multilingües, de generación de texto, visión 2D, audio ni modo "thinking".
- Requiere kernels GPU (spconv) para su ejecución; no está pensado para CPU.

## Casos de uso

- Percepción LiDAR en conducción autónoma: el modelo clasifica cada punto de la nube en clases como vehículo, peatón, carretera o vegetación, proporcionando la base para la detección y el seguimiento de obstáculos en tiempo real sobre GPUs de vehículo o servidor.
- Mapeo semántico de entornos urbanos: integrado en pipelines de SLAM, permite generar mapas 3D etiquetados por clase a partir de secuencias LiDAR, útiles para planificación de rutas y localización.
- Robótica móvil en interiores y exteriores: un robot equipado con LiDAR puede usar el modelo para distinguir suelo transitable, obstáculos y estructuras, alimentando la capa de navegación.
- Anotación asistida de datasets: el modelo preetiqueta nubes de puntos nuevas, reduciendo el coste de anotación manual en proyectos de percepción 3D.
- Investigación en segmentación 3D: sirve como baseline reproducible para comparar nuevas arquitecturas sobre SemanticKITTI, con métricas declaradas (mIoU 66,91, OA 91,49) y pesos listos para cargar.
- Análisis de escenas para gemelos digitales: extracción de features de 128 dimensiones por punto para tareas downstream como clustering, clasificación de instancias o búsqueda de similitud geométrica.
- Control de calidad en infraestructuras: inspección de carreteras y entornos urbanos mediante LiDAR aéreo o terrestre, segmentando elementos como calzada, acera o vegetación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| SemanticKITTI (validacion) | mIoU | 66,91 |
| SemanticKITTI (validacion) | OA (accuracy) | 91,49 |

No se han publicado en la información disponible resultados adicionales (por clase, por secuencia ni comparativas numéricas con otros modelos) más allá de los anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 49,6 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, pero el consumo real depende del número de puntos por lote y de las estructuras dispersas de spconv, que pueden requerir varios GB en escenas densas.
- GPU recomendadas: no especificadas por el autor; por el uso de spconv y kernels CUDA, se requiere una GPU NVIDIA compatible con la versión de PyTorch y CUDA instalada.
- Cabe en GPU de consumo: previsiblemente sí en modelos con suficiente VRAM para spconv (por ejemplo, RTX 3090 o RTX 4090), aunque el autor no publica cifras concretas.
- Opciones de despliegue: `torch-pointcloud` con PyTorch y `spconv`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos numéricos de modelos alternativos para una comparación rigurosa. A continuación se indica la comparación cualitativa posible:

| Modelo | Parametros | Dataset | mIoU declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cylinder3d.semantickitti.xinge-zhu | 49,6 M | SemanticKITTI | 66,91 | Apache-2.0 | HuggingFace (`torch-pointcloud`) |
| Cylinder3D original (xinge008) | no disponible | SemanticKITTI | no disponible en esta ficha | Apache-2.0 | GitHub |
| Otras alternativas (p. ej. MinkUNet, SPVNAS) | no disponible | SemanticKITTI | no disponible | no disponible | no disponible |

No se han incluido cifras de modelos comparables porque no figuran en la información consultada.

## Limitaciones y advertencias

- Modelo específico de dominio: solo segmenta nubes de puntos LiDAR con las 19 clases de SemanticKITTI; no generaliza a otras taxonomías sin reentrenamiento.
- Entrenado sobre SemanticKITTI, con posibles sesgos hacia sensores, condiciones meteorológicas y geografías presentes en ese dataset (entornos urbanos alemanes).
- Riesgo de degradación en escenas nocturnas, con lluvia, nieve o sensores distintos a los del dataset original.
- No es un modelo generativo: no alucina texto, pero puede producir etiquetas erróneas en puntos ambiguos u ocluidos.
- Requiere `spconv` compilado contra la versión exacta de PyTorch y CUDA, lo que complica el despliegue reproducible.
- Solo GPU: los kernels no funcionan en CPU, lo que limita entornos sin acelerador NVIDIA.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las licencias del dataset SemanticKITTI y del repositorio original para su uso en productos.
- Las métricas declaradas no están verificadas de forma independiente (`verified: false`).
- No apto para tareas de NLP, visión 2D, audio ni agentes.

## Enlaces

- HuggingFace: https://huggingface.co/torch-pointcloud/cylinder3d.semantickitti.xinge-zhu
- Paper Cylinder3D: https://arxiv.org/abs/2011.10033
- Repositorio original: https://github.com/xinge008/Cylinder3D
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación: https://pytorch-pointcloud.org/latest/installation/
- Dataset SemanticKITTI: http://semantic-kitti.org/
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
