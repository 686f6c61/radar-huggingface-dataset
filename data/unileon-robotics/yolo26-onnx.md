# unileon-robotics/YOLO26-ONNX

## Resumen

YOLO26-ONNX es un repositorio de exportaciones a formato ONNX de los checkpoints de la familia YOLO26 de Ultralytics, publicado por el usuario unileon-robotics. Contiene 25 ficheros que cubren cinco tareas de vision por computador (deteccion de objetos, segmentacion de instancias, estimacion de pose, cajas orientadas u OBB y clasificacion de imagenes) en los cinco tamanos de la familia: n, s, m, l y x. Todos los ficheros se exportaron con `imgsz=640`, `opset=12`, precision FP32 y formas de entrada estaticas, usando los valores por defecto del exportador de Ultralytics.

El interes del repositorio es fundamentalmente de despliegue: al estar en ONNX, los pesos son independientes del framework de entrenamiento y se pueden ejecutar con ONNX Runtime, TensorRT, OpenVINO o los bindings DNN de OpenCV sin necesidad de instalar PyTorch. Los nombres de las clases van embebidos en los metadatos del grafo, lo que simplifica el postproceso, y las salidas siguen los formatos crudos estandar de Ultralytics. El repositorio completo ocupa 2,2 GB y cada fichero individual pesa entre 9,5 MB (deteccion con tamano n) y 240 MB (segmentacion con tamano x).

No se publican recuentos de parametros, resultados de benchmarks ni detalles del entrenamiento original de YOLO26; el modelo hereda la licencia AGPL-3.0 de Ultralytics, lo que condiciona de forma directa su uso en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia YOLO26 de Ultralytics (red de deteccion visual de una etapa). No se detallan bloques, capas ni mecanismos internos en la informacion disponible |
| Parametros totales | no disponible (el repositorio no publica recuento de parametros; se distribuyen los pesos en FP32) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje). La entrada es una imagen fija de 1x3x640x640 |
| Tipos de cuantizacion | Solo FP32. No se incluyen variantes INT8, FP16 ni mixtas en este repositorio |
| Idiomas soportados | no aplica (modelo de vision; las etiquetas de clase estan en ingles) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX, opset 12, formas de entrada estaticas, sin `dynamic_axes` |
| Numero de ficheros | 25 (5 tareas x 5 tamanos) |
| Tareas cubiertas | Deteccion, segmentacion de instancias, estimacion de pose, cajas orientadas (OBB), clasificacion de imagenes |
| Tamanos | n, s, m, l, x |
| Resolucion de entrada | 1x3x640x640 para todas las tareas |
| Numero de clases por tarea | 80 (deteccion y segmentacion), 15 (OBB), 1 (pose, persona con 17 keypoints), 1000 (clasificacion) |
| Tamano del repositorio | 2,2 GB |
| Modelo base | Ultralytics/YOLO26 |

### Ficheros incluidos

| Fichero | Tarea | Tamano | Salidas | Clases | Peso |
|---|---|---|---|---|---|
| `yolo26n-cls.onnx` | Clasificacion | n | `output0` 1x1000 (softmax) | 1000 | 10,8 MB |
| `yolo26s-cls.onnx` | Clasificacion | s | `output0` 1x1000 (softmax) | 1000 | 25,7 MB |
| `yolo26m-cls.onnx` | Clasificacion | m | `output0` 1x1000 (softmax) | 1000 | 44,4 MB |
| `yolo26l-cls.onnx` | Clasificacion | l | `output0` 1x1000 (softmax) | 1000 | 53,9 MB |
| `yolo26x-cls.onnx` | Clasificacion | x | `output0` 1x1000 (softmax) | 1000 | 113,1 MB |
| `yolo26n.onnx` | Deteccion | n | `output0` 1x84x8400 | 80 | 9,5 MB |
| `yolo26s.onnx` | Deteccion | s | `output0` 1x84x8400 | 80 | 36,5 MB |
| `yolo26m.onnx` | Deteccion | m | `output0` 1x84x8400 | 80 | 78,2 MB |
| `yolo26l.onnx` | Deteccion | l | `output0` 1x84x8400 | 80 | 95,0 MB |
| `yolo26x.onnx` | Deteccion | x | `output0` 1x84x8400 | 80 | 212,9 MB |
| `yolo26n-obb.onnx` | OBB | n | `output0` 1x20x8400 | 15 | 9,6 MB |
| `yolo26s-obb.onnx` | OBB | s | `output0` 1x20x8400 | 15 | 37,4 MB |
| `yolo26m-obb.onnx` | OBB | m | `output0` 1x20x8400 | 15 | 81,1 MB |
| `yolo26l-obb.onnx` | OBB | l | `output0` 1x20x8400 | 15 | 98,0 MB |
| `yolo26x-obb.onnx` | OBB | x | `output0` 1x20x8400 | 15 | 219,9 MB |
| `yolo26n-pose.onnx` | Pose | n | `output0` 1x56x8400 | 1 | 11,6 MB |
| `yolo26s-pose.onnx` | Pose | s | `output0` 1x56x8400 | 1 | 39,9 MB |
| `yolo26m-pose.onnx` | Pose | m | `output0` 1x56x8400 | 1 | 82,6 MB |
| `yolo26l-pose.onnx` | Pose | l | `output0` 1x56x8400 | 1 | 99,4 MB |
| `yolo26x-pose.onnx` | Pose | x | `output0` 1x56x8400 | 1 | 220,0 MB |
| `yolo26n-seg.onnx` | Segmentacion | n | `output0` 1x116x8400 + `output1` 1x32x160x160 | 80 | 10,7 MB |
| `yolo26s-seg.onnx` | Segmentacion | s | `output0` 1x116x8400 + `output1` 1x32x160x160 | 80 | 40,0 MB |
| `yolo26m-seg.onnx` | Segmentacion | m | `output0` 1x116x8400 + `output1` 1x32x160x160 | 80 | 90,2 MB |
| `yolo26l-seg.onnx` | Segmentacion | l | `output0` 1x116x8400 + `output1` 1x32x160x160 | 80 | 107,1 MB |
| `yolo26x-seg.onnx` | Segmentacion | x | `output0` 1x116x8400 + `output1` 1x32x160x160 | 80 | 240,0 MB |

## Arquitectura y entrenamiento

Los ficheros son exportaciones directas de los checkpoints YOLO26 publicados por Ultralytics, no modelos reentrenados ni ajustados por el autor del repositorio. La exportacion se realizo con el exportador de Ultralytics en su configuracion por defecto (`imgsz=640`, `opset=12`, FP32, formas estaticas), con el siguiente comando reproducible:

```shell
uv run --with ultralytics --with onnx --with onnxruntime --with onnxslim \
  yolo export model=yolo26m.pt format=onnx imgsz=640 opset=12
```

La informacion disponible no incluye detalles del entrenamiento original: no se indica el numero de imagenes, la composicion del dataset, el numero de epocas, la funcion de perdida ni si hubo fases de ajuste fino con preferencias humanas (lo cual, por otra parte, no aplica a un detector visual). Tampoco se documentan innovaciones tecnicas internas de la arquitectura YOLO26 mas alla de lo implicito en la nomenclatura de Ultralytics.

Las dimensiones de las salidas permiten reconstruir el diseno de las cabezas segun la convencion estandar de Ultralytics: en deteccion, 84 canales equivalen a 4 coordenadas de caja mas 80 clases; en OBB, 20 canales equivalen a 4 coordenadas mas 1 angulo mas 15 clases; en pose, 56 canales equivalen a 4 coordenadas mas 1 puntuacion de objeto mas 51 valores (17 keypoints con x, y y confianza); en segmentacion, 116 canales equivalen a 4 coordenadas mas 80 clases mas 32 coeficientes de mascara, acompanados de un tensor de prototipos de 32x160x160; y en clasificacion, la salida de 1000 dimensiones ya viene con softmax aplicado. Los 8400 elementos corresponden a las predicciones sobre la rejilla de anclajes a 640x640. Los nombres de clase estan embebidos en los metadatos del grafo ONNX.

## Capacidades

- Deteccion de objetos en 80 clases (conjunto COCO) con cinco niveles de capacidad y coste.
- Segmentacion de instancias con 80 clases: genera mascaras por objeto ademas de las cajas, mediante 32 coeficientes de mascara y prototipos de 32x160x160.
- Estimacion de pose de personas: una sola clase y 17 keypoints por instancia.
- Deteccion con cajas orientadas (OBB) sobre 15 clases, pensada para objetos rotados o vistos desde arriba.
- Clasificacion de imagenes en 1000 clases con probabilidades softmax ya calculadas en la salida.
- Ejecucion sin dependencia de PyTorch: el grafo ONNX es autocontenido y compatible con multiples runtimes.
- Integracion con la libreria Ultralytics, que puede cargar los ficheros `.onnx` directamente para inferencia y validacion.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni generacion de texto.
- Sin capacidades multilingues ni de procesamiento de lenguaje: es exclusivamente un modelo de vision.

## Casos de uso

- Videovigilancia y analitica de video en tiempo real: el modelo de deteccion en tamano n o s procesa fotogramas de 640x640 con un coste computacional bajo, lo que permite ejecutar varias camaras en una sola GPU o incluso en CPU con ONNX Runtime, aplicando despues seguimiento multiobjeto sobre las detecciones.
- Control de calidad industrial: la variante OBB detecta y localiza con angulo piezas, defectos o componentes en cadenas de produccion, donde las cajas alineadas a los ejes no representan bien objetos rotados o inclinados.
- Analisis biomecanico y deportivo: la variante pose extrae 17 keypoints por persona, suficiente para calcular angulos articulares, detectar posturas incorrectas en entrenamiento o generar metricas de movimiento en video.
- Edicion de imagen y video con segmentacion: los modelos `-seg` generan mascaras por instancia que se pueden usar para recorte automatico de sujetos, sustitucion de fondos o efectos por capas en herramientas de postproduccion.
- Clasificacion y filtrado previo en pipelines de datos: la variante `-cls` con 1000 clases permite etiquetar, deduplicar o filtrar grandes volumenes de imagenes antes de pasarlas a un modelo mas costoso.
- Deteccion en imagenes aereas o satelitales: la variante OBB con 15 clases encaja con la nomenclatura habitual de los conjuntos de datos aereos (aeronaves, vehiculos, embarcaciones), donde los objetos aparecen en cualquier orientacion.
- Despliegue en dispositivos de borde: los ficheros de menor tamano (9,5-11,6 MB) se pueden ejecutar en placas embebidas o moviles mediante ONNX Runtime con proveedores como XNNPACK o QNN, sin necesidad de frameworks de entrenamiento.
- Microservicio de inferencia: cualquiera de los ficheros se puede exponer detras de una API HTTP con ONNX Runtime y FastAPI, aprovechando las formas estaticas de entrada para simplificar el batching y el preprocesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de mAP, precision, recall, latencia ni comparaciones con otros modelos, y la busqueda web realizada no devolvio resultados tecnicos relevantes sobre este repositorio (los resultados obtenidos correspondian a foros de un videojuego y no guardan relacion con el modelo).

## Requisitos de hardware

- Huella de pesos en FP32: de 9,5 MB (deteccion n) a 240 MB (segmentacion x). Es una carga muy reducida en comparacion con modelos de lenguaje, y el cuello de botella suele estar en el preprocesado de imagen y en el postprocesado (NMS, decodificacion de mascaras) mas que en los pesos.
- VRAM estimada: no publicada por el autor. Como referencia orientativa, la suma de pesos y activaciones para una entrada de 640x640 en lote 1 se mantiene muy por debajo de 1 GB en los tamanos n y s, y en el entorno de 1-2 GB en los tamanos l y x; estas cifras son estimaciones de ingenieria, no datos medidos ni publicados.
- GPU recomendadas: cualquier GPU con soporte CUDA de gama media o superior (RTX 3060, RTX 4070, RTX 4090) es suficiente para todos los tamanos. En entornos de servidor, A100 o H100 aportan margen para procesar muchos flujos simultaneos con TensorRT.
- GPU de consumo: si, cabe en cualquier GPU consumer moderna e incluso en GPUs integradas o CPU para los tamanos n y s, que son los habituales en despliegues de borde.
- Opciones de despliegue: ONNX Runtime (con ejecucion en CPU o con los proveedores de ejecucion CUDA, TensorRT, OpenVINO o DirectML), TensorRT mediante conversion del grafo ONNX, OpenVINO para hardware Intel, y los bindings DNN de OpenCV. La libreria Ultralytics tambien puede cargar los ficheros `.onnx` directamente. Las herramientas propias de modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no aplican a este modelo.
- Latencia y throughput: no disponible. No se han publicado medidas de latencia ni de imagenes por segundo para ningun tamano ni runtime.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este repositorio ni de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas verificables de formato, cobertura de tareas y licencia.

| Modelo | Familia | Tareas cubiertas | Formato de pesos | Licencia | Parametros |
|---|---|---|---|---|---|
| YOLO26-ONNX | YOLO26 (Ultralytics) | Deteccion, segmentacion, pose, OBB, clasificacion | ONNX opset 12, FP32, entrada estatica | AGPL-3.0 | no disponible |
| Checkpoints YOLO26 de Ultralytics | YOLO26 (Ultralytics) | Las mismas cinco tareas | PyTorch (`.pt`) | AGPL-3.0 | no disponible |
| Exportaciones ONNX de YOLO11 o YOLOv8 (Ultralytics) | Generaciones anteriores de Ultralytics | Cobertura equivalente de tareas | ONNX | AGPL-3.0 | no disponible |
| Detectores tipo DETR o RT-DETR | Transformer de deteccion | Deteccion (segmentacion en algunas variantes) | Multiples formatos segun implementacion | no disponible | no disponible |

La diferencia practica de YOLO26-ONNX frente a los checkpoints `.pt` del modelo base es unicamente el formato y la portabilidad: no hay reentrenamiento ni ajuste, por lo que cualquier mejora de rendimiento respecto a generaciones anteriores depende exclusivamente de YOLO26 y no de esta publicacion.

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso comercial de estos pesos o de obras derivadas obliga a cumplir las condiciones de la AGPL, lo que en la practica implica liberar el codigo fuente de la aplicacion que los integre o adquirir una licencia comercial de Ultralytics. Es la restriccion mas relevante para produccion.
- Ausencia total de benchmarks: el autor no publica mAP, latencia ni ninguna otra metrica, de modo que el rendimiento real debe validarse por cuenta propia antes de adoptar el modelo.
- Adopcion nula verificable: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia externa de uso en produccion.
- Entrada estatica de 640x640: no se han exportado ejes dinamicos, asi que no se puede variar la resolucion ni el tamano de lote sin volver a exportar el modelo desde los checkpoints originales.
- Solo FP32: no hay variantes cuantizadas a INT8 ni en FP16, lo que limita las optimizaciones disponibles en hardware de borde o en GPUs sin buen soporte de FP32.
- Conjuntos de clases fijos: 80 clases COCO en deteccion y segmentacion, 15 clases en OBB, una sola clase (persona) en pose y 1000 clases de ImageNet en clasificacion. No hay soporte para clases personalizadas sin reentrenar.
- Postproceso obligatorio: las salidas son tensores crudos en el formato de Ultralytics, por lo que hay que aplicar decodificacion de cajas, supresion de no maximos y, en segmentacion, combinacion de coeficientes con prototipos para obtener las mascaras finales.
- Riesgo de falsos positivos y negativos propio de un detector: umbrales de confianza e IoU mal ajustados degradan la precision o el recall. No es un riesgo de alucinacion en el sentido de los modelos de lenguaje, pero si de detecciones espurias en dominios alejados de los datos de entrenamiento.
- Sesgos por dominio y por clase: no se documenta la composicion del dataset de entrenamiento de YOLO26, por lo que se desconoce el equilibrio entre clases, la representacion geografica y las condiciones de iluminacion cubiertas. El rendimiento puede degradarse en dominios no representados.
- Metadatos con fechas futuras: los campos de creacion y actualizacion del repositorio indican septiembre de 2026, dato que conviene verificar antes de citarlo.
- Nombres de clase en ingles: cualquier interfaz de usuario en castellano requiere una capa de traduccion propia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/unileon-robotics/YOLO26-ONNX
- Modelo base (checkpoints originales): https://huggingface.co/Ultralytics/YOLO26
- Repositorio de Ultralytics en GitHub: https://github.com/ultralytics/ultralytics
- Condiciones de licencia de Ultralytics: https://www.ultralytics.com/license
- Resultados de la busqueda web: no se encontro ningun enlace relevante sobre este modelo. Los resultados devueltos correspondian a foros y herramientas del videojuego Eve Online y no guardan relacion con el repositorio.
