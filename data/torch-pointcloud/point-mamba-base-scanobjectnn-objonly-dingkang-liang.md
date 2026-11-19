# torch-pointcloud/point-mamba-base.scanobjectnn-objonly.dingkang-liang

## Resumen

Point-Mamba-base es un modelo de clasificación de nubes de puntos 3D construido sobre PointMamba, una arquitectura basada en modelos de espacio de estados (SSM) que procesa secuencias de puntos serializados en lugar de emplear mecanismos de atención. Lo desarrolla el grupo de Dingkang Liang (publicado en NeurIPS 2024) y esta version concreta ha sido convertida y empaquetada por el proyecto torch-pointcloud (Arthur Dujardin) para su uso directo con la libreria del mismo nombre. El checkpoint que nos ocupa es un fine-tuning sobre el split OBJ_ONLY del dataset ScanObjectNN, orientado a clasificacion de objetos 3D del mundo real.

El modelo resuelve la tarea de clasificar una nube de puntos en una de 15 categorias de objetos, con un tamano muy reducido: 12,3 millones de parametros y 384 dimensiones de caracteristica. Su interes practico radica en que ofrece un rendimiento alto en ScanObjectNN (92,43 de overall accuracy) con un coste computacional y de memoria muy inferior al de los transformers de atencion global habituales en vision 3D, lo que facilita el despliegue en pipelines de robotica, conduccion autonoma o inventario 3D.

La relevancia actual viene de la adopcion creciente de los SSM (familia Mamba) como alternativa eficiente a la atencion cuadratica, y de la existencia de un ecosistema de conversion a PyTorch que permite cargar el checkpoint con `torch_pointcloud.create_model` sin depender del codigo original de investigacion. El modelo esta publicado bajo licencia Apache-2.0 y los pesos se distribuyen en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointMamba (state space model / SSM sobre puntos serializados) |
| Parametros totales | 12.293.647 (12,3 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa nubes de hasta 8192 puntos en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision 3D, sin entrada de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Dimension de caracteristicas | 384 |
| Numero de clases | 15 |
| Dataset de entrenamiento | ScanObjectNN (OBJ_ONLY) |
| Tamano del repositorio | 0,1 GB |
| Libreria | torch-pointcloud (requiere mamba-ssm) |
| Modelo base | torch-pointcloud/point-mamba-base.pretrain.dingkang-liang |

## Arquitectura y entrenamiento

PointMamba sustituye el mecanismo de auto-atencion por bloques de espacio de estados selectivos (SSM) aplicados sobre una secuencia de puntos serializada. La nube de puntos se ordena mediante una estrategia de serializacion (el paper propone un recorrido que preserva la estructura espacial) y se procesa como una secuencia unidimensional, lo que reduce la complejidad respecto a la atencion global y permite manejar miles de puntos con un coste lineal. El modelo resultante tiene 12,3 M de parametros y produce embeddings de 384 dimensiones, con una cabeza de clasificacion de 15 clases.

El checkpoint ha sido entrenado en dos fases: un preentrenamiento auto-supervisado (el modelo base `point-mamba-base.pretrain.dingkang-liang`) y un fine-tuning supervisado sobre ScanObjectNN en su variante OBJ_ONLY, que contiene objetos escaneados del mundo real sin fondo. La model card no detalla el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en este dominio). La implementacion requiere los kernels de `mamba-ssm` compilados para la version concreta de PyTorch y CUDA, y el codigo solo funciona en GPU.

## Capacidades

- Clasificacion de nubes de puntos 3D en 15 categorias de objetos (tarea principal).
- Extraccion de caracteristicas: `forward_features` devuelve embeddings de 384 dimensiones utiles para tareas downstream (deteccion, segmentacion, recuperacion).
- Funciona con nubes de puntos de hasta 8192 puntos en el ejemplo oficial, con transformaciones de datos incluidas en la informacion del modelo.
- Inferencia por lotes mediante `collate` y el tensor de indices de batch.
- No soporta tool calling, function calling ni agentes: es un modelo puramente perceptivo.
- No tiene capacidades multilingues, de generacion de texto, vision 2D, audio ni modo de razonamiento explicito.
- No dispone de cabeza de segmentacion ni de deteccion en este checkpoint.

## Casos de uso

- Clasificacion de objetos en robotica de manipulacion: el modelo recibe la nube de puntos de una camara de profundidad (por ejemplo, RealSense) y predice la categoria del objeto antes de que el brazo lo agarre; sus 12,3 M de parametros permiten ejecutarlo en la GPU integrada de un robot movil.
- Inventario y conteo automatico en almacenes: integrado en un pipeline de captura 3D, clasifica cada objeto detectado en una de las 15 clases de ScanObjectNN para actualizar el stock sin intervencion manual.
- Preprocesado para conduccion autonoma: como extractor de caracteristicas (embeddings de 384 dimensiones) de nubes LiDAR recortadas por un detector previo, alimentando un clasificador de segundo nivel para peatones, vehiculos y mobiliario urbano.
- Etiquetado semiautomatico de datasets 3D: el modelo puede preanotar grandes colecciones de escaneos y reducir el coste de anotacion manual, revisando despues solo los casos de baja confianza.
- Recuperacion de modelos 3D (retrieval): usando los embeddings de `forward_features` como descriptor, se pueden indexar objetos escaneados y buscar similitudes en una base de datos CAD.
- Prototipado rapido en investigacion: al cargarse con una sola llamada a `create_model` y estar disponible en safetensors, sirve como baseline reproducible para comparar nuevas arquitecturas SSM en clasificacion 3D.
- Control de calidad industrial: clasificar piezas escaneadas en linea de produccion para detectar categorias incorrectas o piezas fuera de catalogo.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Dataset | Metrica | Valor |
|---|---|---|
| ScanObjectNN (OBJ_ONLY) | OA (overall accuracy) | 92,43 |
| ScanObjectNN (OBJ_ONLY) | mAcc (mean accuracy) | 92,24 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, por debajo de 1 GB para el modelo en precision FP32 (12,3 M de parametros equivalen a unos 49 MB de pesos); el consumo real vendra dominado por los tensores intermedios de la secuencia de puntos y el batch.
- GPU recomendadas: cualquier GPU NVIDIA compatible con `mamba-ssm` (requiere CUDA); una RTX 3090, RTX 4090, A100 o H100 son opciones holgadas. El codigo es GPU-only, no funciona en CPU.
- Cabe en cualquier GPU consumer moderna con CUDA (GTX 16xx en adelante, siempre que la compilacion de `mamba-ssm` sea compatible), incluidas las integradas en plataformas embebidas tipo Jetson.
- Opciones de despliegue: la via oficial es la libreria `torch-pointcloud` con `mamba-ssm`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vision 3D).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento ScanObjectNN (OBJ_ONLY) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Point-Mamba-base (este) | 12,3 M | hasta 8192 puntos | OA 92,43 / mAcc 92,24 | Apache-2.0 | Hugging Face, safetensors |
| PointNet++ | no disponible | no disponible | no disponible | no disponible | no disponible |
| Point Transformer | no disponible | no disponible | no disponible | no disponible | no disponible |
| Mamba3D | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de parametros, contexto ni rendimiento de los modelos alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente en ScanObjectNN OBJ_ONLY (15 clases): no generaliza a categorias fuera de ese vocabulario sin reentrenar la cabeza de clasificacion.
- Los resultados de accuracy son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en la model-index).
- Dependencia fragil de `mamba-ssm`: requiere compilacion especifica para la version de PyTorch y CUDA, lo que complica la reproducibilidad y el despliegue.
- Solo funciona en GPU; no hay ruta de inferencia en CPU documentada.
- Riesgo de confusion en objetos con oclusiones parciales, escaneos ruidosos o clases visualmente proximas, propio de los datasets de escaneo real.
- No se documentan sesgos especificos, pero el dataset de origen condiciona la distribucion de clases y la apariencia de los objetos.
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y atribucion; conviene revisar tambien la licencia del codigo original de PointMamba y de `mamba-ssm`.
- No es un modelo generativo ni conversacional: no debe emplearse para tareas de texto, dialogo o razonamiento simbolico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/point-mamba-base.scanobjectnn-objonly.dingkang-liang
- Modelo base de preentrenamiento: https://huggingface.co/torch-pointcloud/point-mamba-base.pretrain.dingkang-liang
- Paper PointMamba (arXiv 2402.10739): https://arxiv.org/abs/2402.10739
- Repositorio original PointMamba: https://github.com/LMD0311/PointMamba
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentacion de instalacion de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Dataset ScanObjectNN (paper ICCV 2019): https://arxiv.org/abs/1908.00463
