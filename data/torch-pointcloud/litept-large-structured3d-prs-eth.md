# torch-pointcloud/litept-large.structured3d.prs-eth

## Resumen

LitePT-large.structured3d.prs-eth es un modelo de segmentacion semantica de nubes de puntos 3D desarrollado por el grupo de investigacion prs-eth (ETH Zurich) y convertido al ecosistema torch-pointcloud por Arthur Dujardin. Implementa la arquitectura LitePT, presentada en el paper "LitePT: Lighter Yet Stronger Point Transformer" (CVPR 2026), que combina convoluciones en las etapas tempranas de la red con atencion con embeddings rotacionales 3D en las etapas tardias. El checkpoint concreto esta entrenado sobre el dataset Structured3D y predice 25 clases semanticas a partir de nubes de puntos con 6 canales de entrada (coordenadas, color y normales).

El modelo cuenta con 85,9 millones de parametros y una dimension de caracteristicas de 72, lo que lo situa en la gama "large" de la familia LitePT. Su proposito es la segmentacion por punto en escenas 3D estructuradas, un problema central en vision por computador 3D con aplicaciones en modelado de interiores, robotica y realidad aumentada. La relevancia actual reside en que LitePT propone un diseno mas ligero que los Point Transformers clasicos sin sacrificar precision, y en que este checkpoint esta empaquetado para su uso directo mediante la libreria torch-pointcloud.

Es importante senalar que no se trata de un modelo de lenguaje: no genera texto, no soporta tool calling ni tiene capacidades conversacionales. Es un modelo puramente perceptivo, orientado a la inferencia sobre datos 3D. La ficha se adapta a esa naturaleza y omite las secciones que no aplican (idiomas, contexto, agentes) indicandolo explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LitePT (convoluciones en etapas tempranas, atencion con 3D rotary embedding en etapas tardias) |
| Parametros totales | 85.890.526 (85,9 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de nubes de puntos, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/AWQ publicadas) |
| Idiomas soportados | no aplica (modelo de vision 3D, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 6 (posicion xyz, color rgb, normal xyz) |
| Clases de salida | 25 |
| Dimension de caracteristicas | 72 |
| Dataset de entrenamiento | Structured3D |
| Libreria | torch-pointcloud |
| Tamano del repo | 0,3 GB |

## Arquitectura y entrenamiento

LitePT es un transformer de nubes de puntos que adopta un diseno hibrido: las primeras etapas usan convoluciones (mediante spconv para convoluciones dispersas) para extraer caracteristicas locales de forma eficiente, mientras que las etapas finales emplean mecanismos de atencion con 3D rotary positional embeddings, que codifican la geometria espacial directamente en las consultas y claves de la atencion. Este reparto permite reducir el coste computacional de la atencion global sin perder capacidad de modelado de dependencias de largo alcance, que es la motivacion central del paper: obtener un Point Transformer mas ligero manteniendo o mejorando la precision.

El checkpoint esta entrenado sobre Structured3D, un dataset fotorrealista de interiores estructurados publicado en ECCV 2020, con 25 clases semanticas. La model card no detalla el numero de tokens/puntos de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de refinamiento posteriores (RLHF/DPO no aplican a este tipo de modelo). La unica innovacion tecnica documentada es la propia arquitectura LitePT (hibrido convolucion-atencion con rotary embedding 3D). No se dispone de informacion sobre el esquema de aumentacion de datos ni sobre la funcion de perdida empleada.

## Capacidades

- Segmentacion semantica por punto de nubes de puntos 3D en 25 clases (escenas de interiores estructurados).
- Procesamiento de nubes con 6 canales: coordenadas xyz, color rgb y normales xyz.
- Extraccion de caracteristicas por punto mediante `forward_features`, con salida de 72 dimensiones utilizable como embedding para tareas posteriores (clasificacion, retrieval, clustering).
- Capacidad de resetear el clasificador (`reset_classifier(num_classes=0)`) para reutilizar el backbone en fine-tuning sobre otros datasets o numero de clases.
- Inferencia por lotes mediante la utilidad `collate` de torch-pointcloud.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues ni de vision 2D/audio; su dominio es exclusivamente geometrico 3D.

## Casos de uso

- Segmentacion de escenas de interior para modelado BIM: el modelo etiqueta cada punto de una nube capturada con escaner o fotogrametria en clases como suelo, pared, techo o mobiliario, lo que permite reconstruir planos y elementos estructurales de forma automatica. Es adecuado porque esta entrenado especificamente sobre Structured3D, un dataset de interiores estructurados.
- Robotica de navegacion indoor: integrado en el pipeline de percepcion de un robot movil, el modelo segmenta la nube de puntos del sensor para distinguir superficies transitables de obstaculos, alimentando la planificacion de trayectorias.
- Realidad aumentada y virtual: en aplicaciones de mobiliario virtual, la segmentacion semantica permite identificar paredes y suelo para anclar objetos virtuales con coherencia geometrica.
- Preprocesado para reconstruccion 3D: usar las etiquetas por punto para filtrar ruido o separar elementos antes de un proceso de registro o mallado.
- Extraccion de embeddings para busqueda y retrieval 3D: mediante `forward_features` se obtienen descriptores de 72 dimensiones por punto que pueden emplearse en tareas de matching o clasificacion de escenas.
- Fine-tuning sobre dominios especificos: al estar bajo licencia MIT y con backbone reutilizable, sirve como inicializacion para segmentacion en otros datasets de interiores o exteriores con distinto numero de clases.
- Analisis de calidad de escaneos: detectar puntos mal etiquetados o regiones incompletas comparando la prediccion con la geometria esperada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (mIoU, accuracy por clase, etc.) sobre Structured3D ni comparaciones cuantitativas con otros modelos. El paper asociado (arXiv:2512.13689) probablemente contiene resultados, pero no se ha proporcionado su contenido en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 85,9 M de parametros en fp32 los pesos ocupan aproximadamente 0,34 GB; en fp16 unos 0,17 GB. A esto hay que sumar el coste de las activaciones y de las estructuras dispersas de spconv, que dependen del numero de puntos de entrada.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA compatible con las versiones de torch, spconv y flash-attn requeridas. Una RTX 3090 o RTX 4090 es suficiente para inferencia; para entrenamiento o lotes grandes se recomienda A100 o H100.
- Cabe en GPU consumer: si, en principio cualquier GPU consumer moderna con CUDA (por ejemplo RTX 3060 en adelante), dado el reducido tamano del modelo, aunque el requisito real lo marca la compilacion de spconv y flash-attn.
- Opciones de despliegue: la unica via documentada es la libreria torch-pointcloud (`pip install torch-pointcloud`). Requiere kernels GPU-only y dependencias nativas (spconv, flash-attn) compiladas contra la version de torch y CUDA del entorno. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos cuantitativos (parametros, contexto, rendimiento) de modelos comparables en la informacion proporcionada, por lo que la comparativa no puede completarse con cifras verificables. A modo orientativo cualitativo, LitePT se posiciona frente a otros Point Transformers (como PointTransformerV3 o Swin3D) como una alternativa mas ligera, pero no se han facilitado sus especificaciones ni resultados para establecer una tabla comparativa fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| litept-large.structured3d.prs-eth | 85,9 M | no aplica | MIT | Hugging Face (torch-pointcloud) |
| PointTransformerV3 | no disponible | no aplica | no disponible | no disponible |
| Swin3D | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse unicamente sobre Structured3D, el modelo esta sesgado hacia escenas de interiores estructurados y puede degradarse en exteriores, objetos sueltos o geometrias no representadas en el dataset.
- Riesgo de alucinacion: como todo modelo de segmentacion, puede asignar clases incorrectas a puntos ambiguos o fuera de distribucion; no existe mecanismo de calibracion documentado.
- Limitaciones de dominio: las 25 clases estan fijadas por Structured3D; para otras taxonomias es necesario reentrenar o resetear el clasificador.
- Dependencias de compilacion: requiere spconv y flash-attn compilados contra la version exacta de torch y CUDA, lo que complica el despliegue en entornos no controlados y limita la portabilidad.
- Inferencia solo en GPU: la model card indica explicitamente "GPU-only kernels", por lo que no hay ruta documentada de ejecucion en CPU.
- Restricciones de licencia: licencia MIT, que permite uso comercial con atribucion; conviene revisar tambien las licencias de spconv y flash-attn, que son dependencias separadas.
- Madurez: el checkpoint tiene muy pocas descargas (19) y cero likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad; no se han publicado metricas de rendimiento en la model card.
- Idiomas: no aplica, pero conviene no confundirlo con un modelo multimodal o de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/litept-large.structured3d.prs-eth
- Paper LitePT (arXiv): https://arxiv.org/abs/2512.13689
- Repositorio original LitePT (prs-eth): https://github.com/prs-eth/LitePT
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentacion de instalacion: https://pytorch-pointcloud.org/latest/installation/
- Dataset Structured3D (paper ECCV 2020): https://arxiv.org/abs/1908.00222
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
