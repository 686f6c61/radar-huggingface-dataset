# torch-pointcloud/groupfree3d-w2x-l12-o512.scannet.ze-liu

## Resumen

Group-Free 3D es un detector de objetos 3D para nubes de puntos que reformula la deteccion como un problema de atencion sobre candidatos a objeto, prescindiendo de los mecanismos de agrupacion geometrica (votacion, clustering) tipicos de propuestas anteriores como VoteNet. Este checkpoint concreto, publicado por el proyecto `torch-pointcloud`, es la conversion a safetensors y a la libreria PyTorch PointCloud del modelo original de Ze Liu et al. (ICCV 2021), entrenado sobre el dataset ScanNet para deteccion de 18 clases de objetos en escenas interiores.

El modelo emplea un backbone de extraccion de caracteristicas de 288 canales que alimenta un decodificador transformer con 12 capas y 512 candidatos a objeto, de ahi la nomenclatura `w2x-l12-o512` (2x ancho, 12 capas, 512 objetos). Con solo 29,6 millones de parametros, es un modelo compacto orientado a inferencia sobre nubes de puntos de 8.192 puntos por muestra, lo que lo hace adecuado para integrarse en pipelines de percepcion 3D en robotica o escaneo de interiores.

Su relevancia actual radica en que ofrece una implementacion reproducible y empaquetada (`pip install torch-pointcloud`) de un metodo de referencia en deteccion 3D, con pesos listos para usar y una licencia MIT permisiva, algo poco habitual en este nicho donde abundan repositorios de investigacion sin mantenimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer detector sobre candidatos a objeto (Group-Free 3D) |
| Parametros totales | 29.597.377 (29,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 8.192 puntos por muestra en el ejemplo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision 3D, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Clases detectadas | 18 (ScanNet) |
| Canales de caracteristicas | 288 |
| Capas del decodificador | 12 |
| Candidatos a objeto | 512 |
| Dataset de entrenamiento | ScanNet |
| Libreria | torch-pointcloud (PyTorch) |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Group-Free 3D propuesta por Liu et al. (2021): un backbone de extraccion de caracteristicas de nubes de puntos que produce descriptores de 288 canales por punto, seguido de un decodificador transformer de 12 capas que refina iterativamente un conjunto de 512 candidatos a objeto. A diferencia de enfoques como VoteNet, no se agrupan puntos ni se generan propuestas mediante votacion geometrica; en su lugar, cada candidato atiende directamente a las caracteristicas de los puntos mediante atencion cruzada, lo que elimina la dependencia de heuristicas de clustering y hace el metodo mas simple y robusto.

El entrenamiento se realizo sobre ScanNet, el dataset de reconstrucciones 3D de interiores con anotaciones ricas (Dai et al., CVPR 2017), cubriendo 18 clases de objetos. La model card no detalla el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un detector 3D). El checkpoint es una conversion del repositorio original `zeliu98/Group-Free-3D` (MIT) al formato de la libreria `torch-pointcloud`, que expone tanto la inferencia completa como la extraccion de caracteristicas mediante `forward_features`.

## Capacidades

- Deteccion de objetos 3D en nubes de puntos de escenas interiores: predice cajas 3D (centro, dimensiones, orientacion) y clase para 18 categorias de ScanNet (silla, mesa, sofa, cama, armario, etc.).
- Procesamiento de nubes de puntos con atributos por punto: posicion (3), color (3) y normal (3), con soporte para etiquetas de segmentacion e instancia en el pipeline de datos.
- Extraccion de caracteristicas por punto de 288 canales mediante `forward_features`, util para tareas downstream como segmentacion o clasificacion.
- Inferencia por lotes con `collate` y gestion de indices de batch (`data["batch"]`), lo que permite procesar varias escenas en una sola pasada.
- No dispone de tool calling, function calling, capacidades de agente, generacion de texto, razonamiento simbolico ni procesamiento de lenguaje natural.
- No dispone de modo thinking, vision 2D, audio ni capacidades multimodales fuera del dominio 3D.

## Casos de uso

- Digitalizacion de interiores y levantamientos arquitectonicos: el modelo detecta y localiza muebles y elementos estructurales en nubes de puntos de escaneos con SLAM o LiDAR, permitiendo generar inventarios automaticos de habitaciones a partir de reconstrucciones tipo ScanNet.
- Robotica de servicio en interiores: un robot movil puede usar las cajas 3D detectadas para identificar obstaculos y objetos manipulables (sillas, mesas, puertas) y planificar navegacion o agarre, gracias a los 29,6 M de parametros que permiten inferencia en tiempo casi real sobre GPU de gama media.
- Realidad aumentada y virtual: anclar objetos virtuales a elementos reales detectados en la escena, aprovechando que el modelo devuelve cajas 3D con orientacion, lo que facilita la colocacion coherente de contenido AR.
- Etiquetado asistido de datasets 3D: usar las predicciones como preanotaciones para acelerar el etiquetado manual de nuevas nubes de puntos, reduciendo coste en proyectos de anotacion a gran escala.
- Analisis de escenas para facility management: inventariar equipamiento en oficinas, hospitales o almacenes a partir de escaneos periodicos y detectar cambios entre pasadas comparando las cajas predichas.
- Investigacion en percepcion 3D: servir como baseline reproducible y empaquetado para comparar nuevos metodos de deteccion 3D, con pesos MIT y una API unificada (`tp.create_model`) que simplifica la experimentacion.
- Preprocesado para segmentacion semantica o instancia: reutilizar las caracteristicas de 288 canales de `forward_features` como entrada a cabezas ligeras en tareas downstream.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Metrica | Dataset | Valor |
|---|---|---|
| mAP@0.25 | ScanNet | 69,13 |
| mAP@0.5 | ScanNet | 51,96 |

No se han publicado en la informacion disponible resultados adicionales (por ejemplo, mAP@0.5 para clases individuales, latencia o throughput) ni comparaciones con otros modelos en la propia model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 0,1 GB en safetensors; con activaciones para 8.192 puntos y 512 candidatos, se estima un consumo de pocos GB, aunque no se dispone de una cifra oficial en la informacion proporcionada.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos unos pocos GB de VRAM; el modelo es lo suficientemente pequeno para ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores, asi como en A100/H100 para procesamiento por lotes a gran escala.
- Cabe en GPU de consumo: si, dado el reducido numero de parametros (29,6 M).
- Opciones de despliegue: la libreria oficial `torch-pointcloud` sobre PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un detector 3D). El despliegue tipico seria un script de PyTorch o un servicio con TorchServe/Triton.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | mAP@0.25 | mAP@0.5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Group-Free 3D (este checkpoint) | 29,6 M | ScanNet | 69,13 | 51,96 | MIT | HuggingFace + torch-pointcloud |
| VoteNet | no disponible | ScanNet | no disponible | no disponible | MIT (repo original) | Repositorio de investigacion |
| Group-Free 3D original (zeliu98) | no disponible | ScanNet | no disponible | no disponible | MIT | GitHub |

No se dispone en la informacion proporcionada de resultados de benchmarks de VoteNet u otras alternativas para una comparacion cuantitativa directa; los valores de la tabla para esos modelos se indican como no disponibles para no inventar datos.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente en ScanNet (escenas interiores), por lo que el rendimiento fuera de ese dominio (exteriores, industria, objetos no presentes en las 18 clases) sera previsiblemente pobre.
- Sesgos del dataset: ScanNet contiene principalmente interiores domesticos y de oficina de determinadas regiones; el modelo hereda los sesgos de composicion y anotacion del dataset.
- Riesgo de falsos positivos y negativos en escenas con oclusiones o puntos dispersos; las metricas mAP@0.5 de 51,96 indican que la localizacion precisa sigue siendo un reto.
- Sin capacidades de lenguaje: no procesa texto ni instrucciones, por lo que no debe presentarse como un modelo conversacional.
- Licencia MIT: permite uso comercial y modificacion, pero se recomienda citar el paper original y el repositorio de conversion.
- Requiere preprocesado especifico (posicion, color, normal, segment, instance) y la transformacion `info["transform"]`; un uso incorrecto del pipeline de datos puede degradar las predicciones.
- No se documentan cuantizaciones oficiales; el uso en produccion con cuantizacion requeriria validacion propia.
- Los resultados de benchmarks estan declarados por el autor y no han sido verificados de forma independiente (`verified: false`).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/groupfree3d-w2x-l12-o512.scannet.ze-liu
- Paper Group-Free 3D: https://arxiv.org/abs/2104.00678
- Repositorio original: https://github.com/zeliu98/Group-Free-3D
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Dataset ScanNet: https://github.com/ScanNet/ScanNet
- Paper ScanNet: https://arxiv.org/abs/1702.04405
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
