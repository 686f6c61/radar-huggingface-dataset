# torch-pointcloud/pointnext-sm-c64.modelnet40.openpoints

## Resumen

PointNeXt-sm-c64 es un modelo de clasificacion de nubes de puntos en 3D publicado por el usuario torch-pointcloud en HuggingFace. Se trata de una conversion del modelo PointNeXt-S (Small) con 64 canales por bloque, implementado en la libreria torch-pointcloud de Arthur Dujardin a partir del repositorio original guochengqian/PointNeXt (licencia MIT). El modelo resuelve una tarea concreta: asignar una de las 40 clases de objetos del dataset ModelNet40 a una nube de puntos de entrada con tres canales por punto (coordenadas XYZ), opcionalmente con normales.

Arquitectonicamente es una revision escalada de PointNet++: mantiene el esquema jerarquico de muestreo (sampling), agrupacion por consulta esferica (ball query) y capas de abstraccion de conjunto, pero sustituye el bloque MLP simple por bloques residuales invertidos inspirados en MobileNetV2, ademas de incorporar mejoras en las estrategias de entrenamiento y de escalado. El modelo es muy pequeno: 4.540.200 parametros totales, con 3 canales de entrada, 40 clases de salida y una dimension de caracteristicas de 1024 para extraccion de embeddings.

Su relevancia practica es la de un backbone ligero y de codigo abierto para tareas de percepcion 3D sobre GPU de consumo o incluso CPU, con un rendimiento declarado de 93,96 de exactitud global (OA) y 91,14 de exactitud media por clase (mAcc) en ModelNet40. Al estar empaquetado con safetensors y una API de una sola linea (`tp.create_model(...)`), sirve como punto de partida para transfer learning, extraccion de caracteristicas y prototipado rapido en vision 3D. El modelo no es un modelo de lenguaje: no procesa texto, no genera contenido y no dispone de tool calling ni capacidades de agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointNeXt (PointNet++ escalado) con bloques residuales invertidos |
| Parametros totales | 4.540.200 (4,5 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: modelo de nube de puntos. El ejemplo de uso emplea 8192 puntos por muestra |
| Tipos de cuantizacion | No disponible. Se distribuyen pesos en safetensors, sin variantes GGUF/INT8/INT4 documentadas |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors, cargados mediante la libreria torch-pointcloud |
| Canales de entrada | 3 (coordenadas XYZ); el ejemplo anade normales como clave opcional |
| Clases de salida | 40 (taxonomia de ModelNet40) |
| Dimension de caracteristicas | 1024 (embeddings de `forward_features` o tras `reset_classifier(num_classes=0)`) |
| Dataset de entrenamiento | ModelNet40 |
| Libreria de inferencia | torch-pointcloud (`pip install torch-pointcloud`) |
| Tamano del repositorio | 0,0 GB (redondeado en HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue la familia PointNeXt presentada en el articulo "PointNeXt: Revisiting PointNet++ with Improved Training and Scaling Strategies" (Qian et al., NeurIPS 2022). La columna vertebral es la de PointNet++: capas de abstraccion de conjunto (set abstraction) que reducen progresivamente el numero de puntos mediante farthest point sampling, agrupan vecinos con ball query en el espacio metrico y aplican un perceptron multicapa sobre cada grupo, seguidas de capas de propagacion de caracteristicas para tareas densas. El prefijo "sm" indica la variante pequeña, y "c64" hace referencia a la anchura de 64 canales. La innovacion principal de PointNeXt respecto a PointNet++ es la sustitucion del bloque MLP basico por un bloque residual invertido (expansión, convolucion en profundidad, proyeccion) con conexiones residuales, junto con estrategias de escalado y de entrenamiento revisadas que mejoran la precision sin disparar el coste computacional. Con 4,5 M de parametros, el modelo es aproximadamente un orden de magnitud mas pequeño que los backbones de vision 3D basados en transformers.

No se dispone de informacion detallada sobre la composicion exacta del dataset de entrenamiento, el numero de tokens/puntos vistos, el numero de epocas, las estrategias de aumento de datos aplicadas (rotacion, escalado, jitter, dropout de puntos) ni sobre si se empleo ajuste fino adicional, RLHF o DPO (estos ultimos no aplican a un clasificador). La model card indica que el modelo fue convertido desde el repositorio `guochengqian/PointNeXt` y que la metrica de referencia del autor original es 94,0 de OA en ModelNet40, frente a los 93,96 declarados para esta conversion. El proceso de conversion a safetensors y a la API de torch-pointcloud no esta documentado en detalle.

## Capacidades

- Clasificacion de nubes de puntos en 3D: asigna una de las 40 categorias de ModelNet40 (por ejemplo, silla, mesa, avion, guitarra) a una muestra de puntos con canales XYZ.
- Extraccion de caracteristicas: `forward_features` devuelve un vector de 1024 dimensiones por muestra, utilizable para retrieval, clustering o como entrada de clasificadores posteriores.
- Reutilizacion como backbone: `reset_classifier(num_classes=0)` elimina la cabeza de clasificacion y permite anadir una nueva para transfer learning.
- Robustez a orden de puntos: al igual que PointNet++, la arquitectura es invariante al orden de los puntos de entrada por construccion (operaciones simetricas sobre conjuntos).
- Inferencia por lotes: la funcion `collate` de torch-pointcloud permite agrupar varias muestras con numero variable de puntos y una clave `batch`.
- No soporta generacion de texto, razonamiento simbolico, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje).
- No procesa imagen 2D ni audio. Su modalidad es exclusivamente geometrica 3D.
- No se documenta un modo de "pensamiento" ni ninguna capacidad especial adicional.

## Casos de uso

- Clasificacion de objetos en robotica de manipulacion: dado un escaneo de profundidad de la escena, el modelo puede etiquetar el objeto que el gripper va a recoger entre las 40 categorias aprendidas, con un coste de inferencia bajo (4,5 M de parametros) que permite ejecutarlo en el propio bucle de control o en una GPU embebida.
- Extraccion de embeddings para busqueda por similitud 3D: los vectores de 1024 dimensiones permiten construir un indice vectorial de un catalogo de modelos CAD y recuperar la forma mas parecida a una consulta, con independencia de la escala y el orden de los puntos.
- Pretratamiento en pipelines de segmentacion 3D: usar el backbone preentrenado como inicializacion para cabezas de segmentacion semantica o de partes, reduciendo el coste de entrenamiento frente a partir de pesos aleatorios.
- Transfer learning a taxonomias propias: sustituyendo la cabeza de 40 clases por una nueva y reentrenando con un dataset interno (por ejemplo, piezas industriales o activos de una empresa), se aprovecha la representacion geometrica ya aprendida.
- Clasificacion de piezas en fabricacion aditiva o control de calidad: tras alinear y muestrear la malla escaneada de una pieza, el modelo puede verificar que la geometria corresponde a la referencia esperada dentro de un conjunto cerrado de clases.
- Digitalizacion y catalogacion de patrimonio en 3D: clasificar automaticamente fragmentos o piezas escaneadas por laser antes de una revision manual, filtrando el volumen de datos para que los especialistas solo revisen los casos ambiguos o de baja confianza.
- Anotacion asistida y active learning: preetiquetar grandes lotes de nubes de puntos no etiquetadas y priorizar para anotacion humana aquellas muestras con menor confianza de la prediccion.
- Prototipado educativo o de investigacion en vision 3D: al ser un modelo pequeno con licencia MIT y una API de carga en una linea, es adecuado para reproducir experimentos, comparar estrategias de escalado o ensenar arquitecturas de aprendizaje sobre conjuntos de puntos.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente, campo `verified: false` del model-index):

| Dataset | Tarea | Metrica | Valor | Referencia del autor | Verificado |
|---|---|---|---|---|---|
| ModelNet40 | Clasificacion de nube de puntos | OA (exactitud global) | 93,96 | 94,0 | No |
| ModelNet40 | Clasificacion de nube de puntos | mAcc (exactitud media por clase) | 91,14 | No disponible | No |

No se han publicado en la informacion disponible otros resultados (por ejemplo, en ScanObjectNN, ShapeNetPart o S3DIS), ni datos de latencia, throughput o consumo de memoria medidos.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 18 MB en fp32 y unos 9 MB en fp16 (estimacion a partir de los 4.540.200 parametros). El consumo real esta dominado por las activaciones y por las operaciones de agrupacion de vecinos, no por los pesos.
- Coste de memoria segun el numero de puntos: para muestras de 1024 puntos el uso de memoria es de unos pocos cientos de MB; para 8192 puntos (el valor del ejemplo de la model card) el consumo crece de forma apreciable, aunque se mantiene muy por debajo de lo que exigen los transformers de vision 3D de gran tamano. No se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia y ajuste fino ligero. Funcionan correctamente tarjetas de consumo como RTX 3060, RTX 4060, RTX 4070 o RTX 4090, asi como A100/H100 si se necesita procesar lotes grandes.
- Cabe en GPU de consumo: si. Con 4,5 M de parametros el modelo es apto para practicamente cualquier GPU consumer moderna e incluso para dispositivos con poca memoria.
- CPU: la inferencia en CPU es viable para muestras individuales o lotes pequenos, con latencias mayores no cuantificadas.
- Opciones de despliegue: la via documentada es PyTorch junto con la libreria torch-pointcloud. No se documenta exportacion a ONNX, TorchScript, TensorRT ni integracion con servidores de inferencia. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje ni un transformer de texto.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de parametros, contexto ni rendimiento de los modelos alternativos dentro de la informacion proporcionada; la comparacion se limita a los aspectos estructurales y de disponibilidad.

| Modelo | Categoria | Parametros | Licencia | Disponibilidad | Rendimiento en ModelNet40 |
|---|---|---|---|---|---|
| pointnext-sm-c64.modelnet40.openpoints | Clasificacion de nubes de puntos (PointNeXt-S) | 4.540.200 | MIT | HuggingFace, safetensors, via torch-pointcloud | OA 93,96 / mAcc 91,14 (declarado) |
| PointNeXt-S original (`guochengqian/PointNeXt`) | Clasificacion de nubes de puntos (PointNeXt-S) | No disponible en la informacion | MIT | GitHub, pesos originales de PyTorch | Referencia indicada por el autor: OA 94,0 |
| PointNet++ (MSA) | Clasificacion de nubes de puntos | No disponible en la informacion | No disponible en la informacion | Implementaciones publicas en GitHub | No disponible en la informacion |
| Point Transformer | Clasificacion de nubes de puntos basada en atencion | No disponible en la informacion | No disponible en la informacion | Implementaciones publicas en GitHub | No disponible en la informacion |

La diferencia principal de esta ficha respecto al repositorio original es el empaquetado: pesos en safetensors y una API unificada de carga e inferencia, frente al codigo de entrenamiento y evaluacion del proyecto de referencia.

## Limitaciones y advertencias

- Dominio de entrenamiento muy acotado: ModelNet40 son mallas CAD limpias, centradas y con orientacion canonica. El modelo no ha sido entrenado con escaneos reales con ruido, oclusiones, fondos o densidades irregulares, por lo que su rendimiento se degradara en datos de sensores reales sin ajuste fino.
- Solo clasificacion de objeto completo: no hace deteccion, segmentacion semantica, segmentacion de partes ni registro. Usarlo fuera de esa tarea requiere anadir cabezas y reentrenar.
- Taxonomia cerrada de 40 clases: cualquier objeto fuera de esas categorias se forzara a una de las 40 etiquetas, con riesgo de predicciones confiadas pero incorrectas.
- Calibracion y umbrales no documentados: no se publica informacion sobre calibracion de probabilidades ni sobre umbrales de rechazo, algo critico si se usa para filtrar automaticamente.
- Metricas no verificadas: los valores de OA y mAcc proceden del model-index declarado por el autor, con `verified: false`. No hay evaluacion independiente ni scripts de reproduccion en la propia ficha.
- Sin informacion sobre sesgos: no se documenta ningun analisis de sesgo, pero persiste el sesgo de dominio inherente a ModelNet40 (categorias y formas sobrerrepresentadas, ausencia de objetos cotidianos de ciertas culturas o entornos industriales concretos).
- Sensibilidad al muestreo: el resultado depende del numero de puntos, del metodo de muestreo y de la presencia de normales. La model card no indica con cuantos puntos se entreno ni como se debe muestrear en produccion.
- Dependencia de una libreria poco extendida: la carga requiere torch-pointcloud, un paquete con pocos usuarios. Esto anade riesgo de mantenimiento y de compatibilidad de versiones de PyTorch.
- Adopcion nula documentada: el repositorio registra 0 descargas y 0 likes, y un tamano redondeado de 0,0 GB. No hay senales de uso en produccion ni de validacion por terceros.
- Licencia: los pesos se distribuyen bajo MIT, lo que permite uso comercial, modificacion y redistribucion con atribucion. Hay que verificar por separado los terminos del dataset ModelNet40 y del repositorio original si se redistribuyen datos derivados.
- Fechas de publicacion inusuales: la ficha indica creacion el 2026-08-28 y ultima actualizacion el 2026-09-26, lo que conviene contrastar con el estado real del repositorio.
- Sin soporte de cuantizacion: no hay variantes GGUF, INT8 ni INT4 publicadas, por lo que las optimizaciones de despliegue en edge deben realizarse por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/pointnext-sm-c64.modelnet40.openpoints
- Paper de PointNeXt (NeurIPS 2022): https://arxiv.org/abs/2206.04670
- Repositorio original de PointNeXt: https://github.com/guochengqian/PointNeXt
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la libreria (Zenodo): https://doi.org/10.5281/zenodo.22159632
- Paper de ModelNet40 / 3D ShapeNets (Wu et al., CVPR 2015): no se ha encontrado un enlace directo en la informacion proporcionada

Nota: la busqueda web asociada a esta consulta no devolvio ningun resultado relacionado con el modelo. Todos los enlaces recuperados correspondian a sitios de streaming de peliculas sin ninguna relacion con vision 3D, por lo que se han descartado y no se incluyen en esta ficha.
