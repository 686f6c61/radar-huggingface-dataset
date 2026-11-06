# torch-pointcloud/curvenet.modelnet40.tiange-xiang

## Resumen

CurveNet es una red neuronal para clasificación de nubes de puntos 3D presentada en el paper "Walk in the Cloud: Learning Curves for Point Clouds Shape Analysis" (ICCV 2021) por Tiange Xiang, Chaoyi Zhang, Yang Song, Jianhui Yu y Weidong Cai. Este checkpoint concreto, publicado por la organización `torch-pointcloud`, es una conversión de los pesos originales del repositorio de los autores al formato safetensors y a la librería PyTorch PointCloud (mantenida por Arthur Dujardin), lo que facilita su uso con `pip install torch-pointcloud` sin depender del código original.

El modelo resuelve una tarea concreta y acotada: clasificar una nube de puntos 3D en una de las 40 categorías de objetos de ModelNet40 (silla, mesa, avión, monitor, etc.). Con 2,1 millones de parámetros y 2048 dimensiones de embedding global, es un modelo muy ligero comparado con los transformers multimodales actuales, pero sigue siendo competitivo en su tarea: declara un 93,84 % de accuracy global (OA) y un 91,14 % de accuracy media por clase (mAcc) sobre ModelNet40, cifras que lo sitúan en la parte alta de los métodos clásicos de la familia PointNet++/DGCNN.

Su relevancia hoy es práctica: sirve como baseline reproducible y ligero para pipelines de visión 3D, como extractor de características para tareas downstream (detección, segmentación, recuperación de forma) y como referencia para comparar arquitecturas más modernas. Al estar empaquetado en safetensors y con licencia MIT, es directamente utilizable en producción sin fricción legal ni de formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CurveNet (curve grouping y aggregation sobre walks aprendidos; backbone tipo PointNet con módulos de atención sobre curvas) |
| Parametros totales | 2.153.176 (~2,1 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada: nube de puntos, típicamente 8192 puntos con coordenadas xyz y normales) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo no lingüístico; salida: 40 clases de ModelNet40) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 2048 |
| Numero de clases | 40 (ModelNet40) |
| Libreria | torch-pointcloud (requiere pyg-lib) |
| Dataset de entrenamiento | ModelNet40 |

## Arquitectura y entrenamiento

CurveNet es una red de aprendizaje profundo sobre nubes de puntos que introduce el concepto de "curvas" como primitiva geométrica. En lugar de operar solo sobre vecindarios locales (como PointNet++) o sobre grafos dinámicos (como DGCNN), el modelo aprende a agrupar puntos en walks (secuencias ordenadas de puntos cercanos) y a agregarlos mediante módulos de atención, lo que permite capturar estructura de forma global y local simultáneamente. La arquitectura combina capas de muestreo (farthest point sampling), agrupación de puntos, módulos de curve grouping y curve aggregation, y una cabeza de clasificación que produce logits sobre 40 clases. El checkpoint usa 2048 dimensiones de características globales.

El entrenamiento se realizó sobre ModelNet40, un dataset de 12.311 mallas CAD de 40 categorías (9.843 para entrenamiento y 2.468 para test) del que se muestrean nubes de puntos. La model card no detalla el número de tokens, la composición exacta del dataset, ni si se aplicó RLHF o DPO (no aplica a un modelo de clasificación). No se especifican en la información disponible detalles sobre aumentos de datos, régimen de entrenamiento (épocas, optimizador, learning rate) ni innovaciones adicionales como decodificación especulativa o atención lineal; lo que sí se conoce es la innovación central del paper: el aprendizaje de curvas para el análisis de forma.

## Capacidades

- Clasificación de nubes de puntos 3D en 40 categorías de ModelNet40.
- Extracción de características globales de 2048 dimensiones mediante `forward_features` o `reset_classifier(num_classes=0)`.
- Procesamiento de nubes con coordenadas xyz y normales (`pos` y `normal` en el pipeline de datos).
- Funciona con lotes (`collate`) y máscaras de batch para procesar varias nubes a la vez.
- No soporta tool calling, function calling ni agentes multi-step (no es un modelo generativo).
- No tiene capacidades multilingües, de visión 2D, audio ni thinking mode.
- No es un modelo de propósito general: su salida es un vector de 40 logits.

## Casos de uso

- Clasificación automática de objetos 3D en pipelines de escaneo: dado un escaneo LiDAR o de profundidad convertido a nube de puntos, CurveNet asigna una de las 40 categorías de ModelNet40, útil para inventariado de activos o catalogación de escenas.
- Extracción de embeddings para búsqueda de formas (shape retrieval): usando la salida de 2048 dimensiones como descriptor, se pueden indexar nubes de puntos en un motor vectorial y recuperar formas similares, por ejemplo en catálogos de piezas CAD.
- Baseline reproducible en investigación de visión 3D: al ser 2,1 M de parámetros y estar en safetensors, sirve como referencia ligera para comparar nuevas arquitecturas de clasificación de nubes de puntos con un coste de cómputo mínimo.
- Preentrenamiento o inicialización para tareas downstream: la cabeza de clasificación puede sustituirse (`reset_classifier`) para adaptar el backbone a segmentación semántica o detección 3D con fine-tuning sobre datasets propios.
- Prototipado rápido en robótica: clasificar objetos que un robot manipula o percibe con una cámara de profundidad, con inferencia en CPU o GPU de gama baja gracias al reducido tamaño del modelo.
- Control de calidad en fabricación: clasificar piezas 3D escaneadas contra las 40 categorías para detectar piezas mal colocadas o fuera de catálogo en una línea de inspección.
- Educación y demos de aprendizaje profundo 3D: el modelo cabe en cualquier portátil y el ejemplo de la model card permite ejecutarlo con datos sintéticos en pocas líneas, lo que lo hace idóneo para talleres y cursos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Dataset | Metrica | Valor |
|---|---|---|
| ModelNet40 | OA (accuracy global) | 93,84 % |
| ModelNet40 | mAcc (accuracy media por clase) | 91,14 % |

No se han publicado en la información disponible resultados de otros benchmarks (p. ej. partición con normales frente a sin normales, robustez a perturbaciones, latencia o throughput).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, por debajo de 1 GB; con 2,1 M de parámetros los pesos ocupan unos 8,6 MB en fp32 y unos 4,3 MB en fp16.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una RTX 4090, RTX 3090, RTX 3060 o incluso una GTX 1650 son suficientes.
- Cabe en GPU de consumo y también en CPU: la inferencia sobre una nube de 8192 puntos es del orden de milisegundos en GPU y decenas de milisegundos en CPU (estimación orientativa; no se publican cifras oficiales de latencia).
- Opciones de despliegue: la vía oficial es `torch-pointcloud` con PyTorch y `pyg-lib` (requiere compilación compatible con la versión de torch y CUDA). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Throughput: no disponible en la información proporcionada; al ser un modelo pequeño, el cuello de botella suele ser el preprocesado de la nube de puntos (muestreo, cálculo de normales) más que la red.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | OA ModelNet40 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CurveNet (este checkpoint) | ~2,1 M | nube de puntos (típ. 8192 puntos) | 93,84 % | MIT | HuggingFace (safetensors) |
| PointNet++ | no disponible en la información | nube de puntos | no disponible en la información | no disponible | repo original |
| DGCNN | no disponible en la información | nube de puntos | no disponible en la información | no disponible | repo original |
| Point Transformer | no disponible en la información | nube de puntos | no disponible en la información | no disponible | repo original |

No se dispone en la información proporcionada de cifras verificadas de los modelos comparables, por lo que la comparación cuantitativa queda limitada al resultado declarado por el autor de CurveNet.

## Limitaciones y advertencias

- El modelo solo clasifica en las 40 clases de ModelNet40; no reconoce categorías fuera de ese vocabulario y no es un modelo generativo.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) en la model card; conviene reproducirlos antes de usarlos como referencia en publicaciones.
- Sesgos conocidos: ModelNet40 contiene objetos CAD sintéticos, mayoritariamente muebles y vehículos de interior, con una distribución de clases desequilibrada; el modelo puede rendir peor en escenas reales, objetos al aire libre o categorías poco representadas.
- Riesgo de degradación ante nubes de puntos ruidosas, incompletas, con oclusiones o con densidad distinta a la de entrenamiento; no se documentan evaluaciones de robustez.
- Requiere `pyg-lib` compilado para la versión exacta de torch y CUDA, lo que añade fricción de instalación en entornos heterogéneos.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero el usuario debe cumplir también las licencias de las dependencias (PyTorch, PyG, pyg-lib) y citar el paper original.
- No hay información sobre cuantizaciones, exportación a ONNX/TensorRT ni latencias oficiales, por lo que el despliegue en producción requiere medición propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/curvenet.modelnet40.tiange-xiang
- Paper "Walk in the Cloud: Learning Curves for Point Clouds Shape Analysis" (ICCV 2021): https://arxiv.org/abs/2105.01288
- Repositorio original de los autores (tiangexiang/CurveNet): https://github.com/tiangexiang/CurveNet
- Librería PyTorch PointCloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de PyTorch PointCloud: https://pytorch-pointcloud.org
- Guía de instalación (pyg-lib): https://pytorch-pointcloud.org/latest/installation/
- Paper ModelNet40 "3D ShapeNets" (CVPR 2015): https://arxiv.org/abs/1406.5670
