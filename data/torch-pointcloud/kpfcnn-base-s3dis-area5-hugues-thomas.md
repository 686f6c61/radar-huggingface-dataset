# torch-pointcloud/kpfcnn-base.s3dis-area5.hugues-thomas

## Resumen

kpfcnn-base.s3dis-area5.hugues-thomas es un modelo de segmentacion semantica de nubes de puntos 3D publicado por la organizacion torch-pointcloud. Implementa una KPConv (Kernel Point Convolution) deformable dentro de una red totalmente convolucional (KP-FCNN) y resuelve la asignacion de una clase semantica a cada punto individual de una escena, no la generacion de texto: no es un modelo de lenguaje y no procesa tokens ni secuencias de texto.

El modelo se distribuye como un checkpoint de 24.419.651 parametros (24,4 M) convertido desde la implementacion de referencia HuguesTHOMAS/KPConv-PyTorch, con licencia MIT. Trabaja sobre 5 canales de entrada (coordenadas y atributos por punto) y produce 13 clases semanticas, con una capa de caracteristicas de 128 dimensiones. Esta entrenado especificamente sobre el Area 5 del dataset S3DIS (semantic parsing de interiores a gran escala).

Su relevancia practica es doble: por un lado reproduce una referencia consolidada de la literatura de vision 3D (ICCV 2019) dentro de una libreria moderna de PyTorch (torch-pointcloud), con API de segmentacion y de extraccion de caracteristicas; por otro, es un punto de partida para transfer learning en segmentacion de interiores. El autor declara 66,6 de mIoU y 89,63 de OA en S3DIS Area 5, aunque las metricas figuran como no verificadas y el repositorio no tiene descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KPConv deformable (kernel point convolution) en red totalmente convolucional KP-FCNN |
| Parametros totales | 24.419.651 (24,4 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es una nube de puntos de cardinalidad variable (el ejemplo de la model card usa 8192 puntos) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors; no se documentan versiones cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision 3D; no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 5 |
| Clases de salida | 13 |
| Dimension de caracteristicas | 128 |
| Dataset de entrenamiento | S3DIS (Area 5) |
| Libreria | torch-pointcloud |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion | 2026-08-28 |
| Ultima actualizacion | 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura es una KPConv deformable: en lugar de convolucionar sobre una rejilla regular, define kernels compuestos por un conjunto de puntos de kernel en el espacio 3D y agrega las contribuciones de los vecinos ponderadas por la distancia a cada punto de kernel. En la variante deformable, cada punto de kernel aprende un desplazamiento, lo que permite adaptar la geometria del kernel a la forma local de la superficie. El modelo sigue el esquema KP-FCNN de la publicacion original, con una torre de codificacion que submuestrea la nube mediante grid subsampling y una torre de decodificacion con conexiones de salto que recupera la resolucion por punto. La model card indica 5 canales de entrada, 24,4 M de parametros y 128 caracteristicas internas. La salida es un logit por punto para cada una de las 13 clases.

Los pesos se han convertido desde el repositorio HuguesTHOMAS/KPConv-PyTorch (tambien MIT) y se cargan a traves de la libreria torch-pointcloud. El modelo esta entrenado sobre el Area 5 de S3DIS, que se usa habitualmente como particion de test del dataset, por lo que el checkpoint esta especializado en escenas de interior de ese dominio. La informacion disponible no detalla el numero de tokens de entrenamiento (no aplica), la composicion exacta del dataset, el numero de epocas ni si hubo etapas de refinamiento posteriores; la model card solo referencia el articulo de KPConv (ICCV 2019) y el articulo de S3DIS (CVPR 2016). No se documentan tecnicas de decodificacion especulativa, atencion lineal ni mecanismos equivalentes, que no tienen sentido en este tipo de arquitectura.

## Capacidades

- Segmentacion semantica por punto: asigna una de 13 clases a cada punto de una nube 3D.
- Procesamiento de nubes de puntos de cardinalidad variable, con atributos por punto (5 canales de entrada).
- Extraccion de caracteristicas: el metodo forward_features y la llamada con reset_classifier(num_classes=0) devuelven un vector de 128 dimensiones por punto, reutilizable como embedding para clasificacion, agrupamiento o busqueda.
- Uso como backbone para transfer learning: la cabeza de clasificacion se puede sustituir por una con otro numero de clases.
- Inferencia en PyTorch con procesamiento por lotes mediante la funcion collate de la libreria.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision 2D, audio ni modo de pensamiento. No tiene capacidades multilingues porque no procesa lenguaje.

## Casos de uso

- Reconstruccion de interiores y gemelos digitales: segmentar escaneos de edificios en clases semanticas (suelo, pared, techo, mobiliario) para generar modelos 3D etiquetados a partir de nubes de puntos de escaneres terrestres o fotogrametria.
- Preetiquetado en anotacion de datos: usar el modelo como anotador automatico de primer paso y reducir el tiempo de etiquetado manual por punto antes de una revision humana.
- Modelado BIM y gestion de activos: clasificar elementos de una planta de oficina escaneada para inventariar mobiliario y elementos estructurales en herramientas de facility management.
- Robotica de interior y navegacion: dotar a un robot movil de una capa de comprension semantica del entorno a partir de su LiDAR o camara de profundidad, distinguiendo superficies transitables de obstaculos y mobiliario.
- Realidad aumentada y virtual: anclar contenido digital sobre superficies identificadas semanticamente (mesas, paredes, suelos) en aplicaciones de interior.
- Asistencia a la accesibilidad y analisis de espacios: extraer metricas de superficie y distribucion de elementos en estancias escaneadas para estudios de ocupacion o cumplimiento normativo.
- Recuperacion de activos 3D por similitud: usar los embeddings de 128 dimensiones por punto o por region como firma para busquedas de similitud entre escaneos.
- Base para investigacion en vision 3D: servir de referencia reproducible de KPConv dentro de una libreria de PyTorch y como punto de partida para comparaciones con PointNet++, RandLA-Net o Point Transformer en S3DIS.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, sobre S3DIS Area 5, tarea de segmentacion de nubes de puntos. Las metricas figuran como no verificadas.

| Dataset | Tarea | Metrica | Valor | Verificado |
|---|---|---|---|---|
| S3DIS (Area 5) | point-cloud-segmentation | mIoU | 66,6 | No |
| S3DIS (Area 5) | point-cloud-segmentation | OA | 89,63 | No |

La propia model card indica como referencia 66,4 de mIoU para la implementacion original, de modo que la conversion declara una diferencia de +0,2 puntos de mIoU respecto a esa referencia. No se han publicado en la informacion disponible resultados de latencia, throughput ni comparaciones con otros modelos en formato de tabla.

## Requisitos de hardware

- Memoria de pesos (calculo aritmetico a partir de los parametros, no dato publicado): en fp32, 24.419.651 x 4 bytes = 97,7 MB (93,1 MiB); en fp16 o bf16, 48,8 MB (46,6 MiB).
- La VRAM total de inferencia no depende de los parametros, sino de las activaciones de la KPConv, que escalan con el numero de puntos por muestra, el radio de vecindad, la resolucion de la rejilla de submuestreo y el tamano del lote. No hay cifras publicadas para este checkpoint.
- GPU recomendadas: cualquier GPU con soporte CUDA reciente es suficiente para los pesos; para lotes grandes de puntos o escenas densas conviene una GPU con 16 GB o mas (RTX 4090, A100 40 GB, H100). En GPUs de consumo con 6-8 GB (RTX 3060, RTX 4060) el modelo cabe en memoria de pesos, pero puede requerir reducir el numero de puntos por muestra o el lote.
- CPU: es viable para inferencia puntual sobre nubes pequenas, con latencia mucho mayor; no hay datos de latencia publicados.
- Opciones de despliegue: PyTorch mediante la libreria torch-pointcloud (pip install torch-pointcloud), que ofrece create_model, forward_features y reset_classifier. No se documentan exportaciones a ONNX, TensorRT, TorchScript ni integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto de entrada | Licencia | Disponibilidad | Rendimiento en S3DIS Area 5 |
|---|---|---|---|---|---|---|
| kpfcnn-base.s3dis-area5.hugues-thomas | KPConv deformable (segmentacion de nubes de puntos) | 24,4 M | nube de puntos de cardinalidad variable | MIT | HuggingFace, libreria torch-pointcloud | mIoU 66,6 / OA 89,63 (no verificado) |
| KPConv-PyTorch (HuguesTHOMAS) | Implementacion de referencia de KPConv | no disponible en la informacion proporcionada | no disponible | MIT | GitHub | 66,4 de mIoU citado como referencia en la model card |
| PointNet++ | Segmentacion de nubes de puntos | no disponible | no disponible | no disponible | no disponible | no disponible |
| RandLA-Net | Segmentacion de nubes de puntos a gran escala | no disponible | no disponible | no disponible | no disponible | no disponible |
| Point Transformer | Transformer para nubes de puntos | no disponible | no disponible | no disponible | no disponible | no disponible |

Solo se dispone de datos concretos para este checkpoint y para la referencia de la que se convirtio. Para el resto de alternativas no hay informacion en los materiales proporcionados, por lo que no se ofrece comparacion cuantitativa.

## Limitaciones y advertencias

- Metricas no verificadas: mIoU 66,6 y OA 89,63 estan declaradas por el autor con verified: false; no hay evaluacion independiente ni reproduccion publica.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validacion de la comunidad documentada.
- Especializacion de dominio: el checkpoint esta entrenado sobre el Area 5 de S3DIS, un conjunto de interiores de oficina capturados con escaneres 3D. El rendimiento fuera de ese dominio (LiDAR exterior, vehiculos, interiores domesticos o sensores distintos) no esta documentado y presumiblemente se degrada.
- Salida fija de 13 clases: el modelo solo predice las clases definidas por S3DIS; cualquier taxonomia distinta requiere reentrenamiento o sustitucion de la cabeza de clasificacion.
- Sin capacidades de lenguaje: no genera texto, no responde a instrucciones ni admite tool calling; no debe evaluarse con criterios de modelos generativos.
- Sensibilidad al preprocesado: KPConv depende del submuestreo por rejilla, de la normalizacion de la nube y de los radios de vecindad; el uso de transformaciones distintas a las de la libreria puede alterar los resultados.
- Coste de memoria variable: el consumo de VRAM crece con el numero de puntos y con la densidad de la nube, con riesgo de OOM en escenas densas o lotes grandes.
- Riesgo de error por punto: en zonas ambiguas (bordes, objetos finos, mobiliario poco representado) la segmentacion puede confundir clases; conviene una revision humana en aplicaciones criticas.
- Sesgos: no se documenta ningun analisis de sesgo por tipo de escena, sensor, iluminacion o geografia; el dataset de origen condiciona la distribucion de clases.
- Licencia: MIT, permite uso comercial, modificacion y redistribucion, manteniendo el aviso de copyright y la atribucion a los autores originales de KPConv-PyTorch y al dataset S3DIS.
- Sin cuantizaciones documentadas: no hay versiones GGUF, int8 ni int4 publicadas para este checkpoint.
- Fechas de publicacion y actualizacion (2026) posteriores a este analisis: conviene comprobar si el repositorio ha cambiado desde entonces.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/kpfcnn-base.s3dis-area5.hugues-thomas
- Paper de KPConv (ICCV 2019): https://arxiv.org/abs/1904.08889
- Repositorio de referencia KPConv-PyTorch: https://github.com/HuguesTHOMAS/KPConv-PyTorch
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la libreria (Zenodo): https://doi.org/10.5281/zenodo.22159632
- Dataset S3DIS: referenciado en la model card como Armeni et al., CVPR 2016; no se proporciona enlace directo en la informacion disponible.
