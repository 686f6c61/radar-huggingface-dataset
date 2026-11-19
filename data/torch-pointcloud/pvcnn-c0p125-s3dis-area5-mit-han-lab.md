# torch-pointcloud/pvcnn-c0p125.s3dis-area5.mit-han-lab

## Resumen

PVCNN (Point-Voxel CNN) es una arquitectura de segmentación semántica de nubes de puntos en 3D que combina una rama basada en puntos con una rama basada en vóxeles. Este checkpoint concreto, distribuido por el autor `torch-pointcloud`, es una conversión de los pesos originales del repositorio `mit-han-lab/pvcnn` (MIT) al formato de la librería `torch-pointcloud`, y esta entrenado sobre el dataset S3DIS tomando la Area 5 como conjunto de evaluación. La variante indicada en el nombre, `c0p125`, corresponde a la configuracion de canales del modelo compacto de la familia PVCNN.

El modelo resuelve la tarea de asignar una etiqueta semantica a cada punto de una nube 3D de interiores (13 clases en S3DIS: suelo, pared, silla, mesa, etc.). Su relevancia practica esta en que PVCNN reduce el coste computacional frente a arquitecturas puramente basadas en puntos al proyectar parte del calculo sobre una rejilla de vóxeles, manteniendo una resolucion fina en la rama de puntos. El checkpoint es pequeno (44.149 parametros segun safetensors) y esta pensado para inferencia y extraccion de caracteristicas, no para generacion de texto ni tareas multimodales.

Es importante enmarcarlo correctamente: no es un modelo de lenguaje ni un modelo fundacional generativo. Es un modelo de vision 3D especializado, con licencia MIT, empaquetado para `torch-pointcloud`, y util como componente en pipelines de percepcion 3D, digitalizacion de interiores o robotica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PVCNN (Point-Voxel CNN), rama de puntos + rama de vóxeles fusionadas |
| Parametros totales | 44.149 (segun safetensors; la model card indica "Params (M): 0.0") |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de nube de puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; tarea de vision 3D) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 9 |
| Clases de salida | 13 |
| Dimension de caracteristicas | 184 |
| Dataset de entrenamiento/evaluacion | S3DIS (Area 5 como test) |
| Libreria | torch-pointcloud |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

PVCNN es una red neuronal convolucional para nubes de puntos que combina dos representaciones: una rama que opera directamente sobre puntos (preserva detalle geometrico fino) y una rama que voxeliza la nube y aplica convoluciones 3D (aprovecha la regularidad de la rejilla para eficiencia). Las salidas de ambas ramas se fusionan de forma iterativa a lo largo de la red, lo que permite obtener una segmentacion por punto con buen compromiso entre precision y coste. El modelo recibe 9 canales de entrada por punto, produce 13 clases y expone una representacion de 184 dimensiones para extraccion de caracteristicas.

El entrenamiento se realiza sobre S3DIS (Stanford 3D Indoor Spaces), un dataset de escaneos de interiores con anotaciones semanticas por punto. La evaluacion reportada corresponde a la Area 5, el protocolo habitual en la literatura de segmentacion de nubes de puntos. La model card no detalla el numero de tokens/puntos de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de aumento o regularizacion especificas; esos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Segmentacion semantica por punto en nubes 3D de interiores con 13 clases.
- Extraccion de caracteristicas por punto mediante `forward_features`, con salida de 184 dimensiones.
- Capacidad de reinicializar el clasificador (`reset_classifier(num_classes=0)`) para usar el modelo como extractor de embeddings.
- Entrada multi-canal: posicion, color y normales normalizadas (9 canales en total).
- Orientado a inferencia por lotes mediante `collate` de `torch-pointcloud`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues ni de vision 2D/audio.
- No dispone de modo "thinking" ni decodificacion especulativa.

## Casos de uso

- Segmentacion de escaneos de interiores para digitalizacion (BIM/as-built): el modelo etiqueta cada punto como suelo, pared, mesa, silla, etc., lo que permite construir modelos semanticos de edificios a partir de nubes de puntos capturadas con LiDAR o fotogrametria.
- Robotica movil en interiores: integrado como modulo de percepcion, el modelo puede clasificar la escena para distinguir superficies transitables (suelo) de obstaculos (muebles, paredes), con la ventaja de su bajo numero de parametros y su coste de inferencia contenido.
- Realidad aumentada y virtual: segmentacion semantica de la escena en tiempo de ejecucion para anclar objetos virtuales sobre superficies reconocidas (mesas, suelos) o para ocluir objetos reales.
- Extraccion de caracteristicas para aprendizaje por transferencia: usando `forward_features` se obtienen embeddings de 184 dimensiones por punto que sirven como entrada a clasificadores ligeros, clustering o modelos de segmentacion aguas abajo sobre dominios propios.
- Preprocesado en pipelines de gemelo digital: el modelo actua como paso previo para separar elementos estructurales y mobiliario antes de tareas de reconstruccion, medicion o inventario.
- Prototipado rapido en investigacion: al estar empaquetado en `torch-pointcloud` con una API de `create_model` y pesos en safetensors, permite reproducir el baseline PVCNN sobre S3DIS con pocas lineas de codigo.
- Filtrado y limpieza de nubes de puntos: la etiqueta semantica permite descartar puntos de clases irrelevantes (por ejemplo, techo o pared) antes de procesos de registro o reconstruccion.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Dataset | Valor |
|---|---|---|
| mIoU | S3DIS (Area 5) | 49,25 |
| OA | S3DIS (Area 5) | 83,04 |
| simple/mIoU | S3DIS (Area 5) | 46,36 |
| simple/OA | S3DIS (Area 5) | 80,74 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 44.149 parametros y pesos en safetensors, el modelo es extremadamente ligero y cabe holgadamente en cualquier GPU consumer (incluso en CPU para lotes pequenos).
- GPU recomendadas: cualquier GPU con suficiente memoria para el lote de puntos de entrada; no se especifican modelos concretos (A100, H100, RTX 4090) en la informacion proporcionada.
- Cabe en GPU consumer: si, dado el tamano reducido del modelo; el cuello de botella sera el procesamiento de la nube de puntos, no los pesos.
- Opciones de despliegue: `torch-pointcloud` (libreria oficial del checkpoint); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros modelos sobre el mismo protocolo (S3DIS Area 5) ni de sus especificaciones, por lo que la comparativa cuantitativa no esta disponible. Como referencia cualitativa, PVCNN se situa en la familia de arquitecturas de segmentacion de nubes de puntos junto a PointNet/PointNet++ (puramente basadas en puntos), SpConv (puramente voxel) y variantes hibridas posteriores; sin embargo, no se aportan cifras de estos modelos en el material recibido.

| Modelo | Parametros | Contexto | mIoU (S3DIS Area 5) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pvcnn-c0p125.s3dis-area5.mit-han-lab | 44.149 | no aplica | 49,25 (declarado) | MIT | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado en segmentacion de nubes de puntos de interiores; no es un modelo de lenguaje ni generativo.
- Los resultados de benchmark estan declarados por el autor y no han sido verificados (`verified: false`).
- No se documentan sesgos especificos, pero al entrenarse sobre S3DIS (escenas de interiores de oficinas/edificios) puede generalizar mal a otros dominios (exteriores, industria, escenas no representadas).
- Riesgo de degradacion ante nubes de puntos con densidad, ruido o sensores distintos a los del dataset de entrenamiento; no se detallan estrategias de robustez.
- La model card no especifica limitaciones de contexto ni de idioma porque no aplican, pero tampoco detalla limitaciones de resolucion o numero maximo de puntos.
- Licencia MIT: permite uso comercial y modificacion, pero conviene conservar el aviso de copyright y las citas correspondientes.
- La cifra de parametros en la model card ("Params (M): 0.0") es inconsistente con el conteo de safetensors (44.149); conviene validar el checkpoint antes de usarlo en produccion.
- No se documentan requisitos de preprocesado mas alla de la transformacion incluida en `info["transform"]`; usos fuera de ese pipeline pueden requerir adaptaciones.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/pvcnn-c0p125.s3dis-area5.mit-han-lab
- Paper PVCNN: https://arxiv.org/abs/1907.03739
- Repositorio original: https://github.com/mit-han-lab/pvcnn
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Dataset S3DIS (referencia): Armeni et al., CVPR 2016
