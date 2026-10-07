# youakrim/yolo12l-mlx

## Resumen

YOLO12l-mlx es una conversion de los pesos oficiales de Ultralytics YOLO12 (variante large, 26,6 millones de parametros) al formato NumPy `.npz` para el runtime MLX de Apple. El autor, youakrim, mantiene el repositorio yolo12-mlx, una reimplementacion de YOLO12 sobre Apple MLX pensada para ejecutar deteccion de objetos en chips de Apple Silicon. No hay reentrenamiento: los pesos son identicos a los originales y solo se ha cambiado la disposicion de tensores de OIHW a OHWI para adaptarlos a MLX.

El modelo resuelve deteccion de objetos en 80 clases de COCO y esta pensado para desarrolladores que quieren correr YOLO12 de forma nativa en Macs con GPU Metal, sin depender de PyTorch ni MPS. La relevancia practica esta en el soporte de primera clase para el stack de Apple, con rendimiento comparable al de PyTorch sobre MPS.

Se trata de un modelo de vision puro: no procesa lenguaje, carece de longitud de contexto en el sentido de los LLM y trabaja con entradas de imagen de 640x640 px (letterbox). Hereda la licencia AGPL-3.0 de Ultralytics YOLO12.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO12 attention-centric (base Ultralytics/YOLO12, variante l) |
| Parametros totales | 26,6 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 640x640 px) |
| Tipos de cuantizacion | fp32 y bf16 en MLX; pesos distribuidos en `.npz` en fp32 |
| Idiomas soportados | no aplica (80 clases COCO, etiquetas en ingles) |
| Licencia | AGPL-3.0 |
| Formato de pesos | NumPy `.npz` (layout OHWI para MLX) |

## Arquitectura y entrenamiento

La base es Ultralytics YOLO12, un detector de objetos de arquitectura attention-centric que sustituye parte de los operadores convolucionales clasicos por mecanismos de area attention (A2) y bloques R-ELAN (residual efficient layer aggregation network). La variante large emplea 26,6 millones de parametros y produce predicciones a 640x640 px. El entrenamiento sobre COCO lo realiza Ultralytics; este repositorio no aporta entrenamiento nuevo.

La unica transformacion aplicada es el reordenado de los tensores de pesos del layout OIHW (propio de PyTorch) a OHWI (requerido por la implementacion yolo12-mlx). Segun el autor, los pesos no cambian en valor, solo en disposicion, por lo que la mAP del binario MLX reproduce la del `.pt` oficial de PyTorch. No se documentan pasos de RLHF ni ajuste por preferencias, algo propio de un detector y no de un modelo generativo.

## Capacidades

- Deteccion de objetos en las 80 clases de COCO (personas, vehiculos, animales, mobiliario, utensilios, etc.).
- Localizacion con cajas delimitadoras y puntuaciones de confianza por clase.
- Ejecucion nativa sobre Apple MLX con soporte de Metal en chips Apple Silicon.
- Inferencia en fp32 y bf16.
- Integracion con el flujo estandar de YOLO (letterbox a 640, NMS con conf 0.001, IoU 0.7 y maximo 300 detecciones).
- No soporta tool calling, function calling, razonamiento multi-paso ni modos de "thinking".
- No tiene capacidades multimodales de texto, audio ni generacion de lenguaje.
- No incorpora seguimiento temporal (tracking) por si mismo; seria necesario un modulo externo.

## Casos de uso

- Deteccion en aplicaciones de escritorio para macOS: integrar yolo12-mlx en una app nativa permite detectar objetos en imagenes o flujos de camara sin salir del ecosistema MLX, aprovechando la GPU de los chips M-series.
- Procesado local en edge con Apple Silicon: al pesar 26,6 M de parametros y caber en memoria unificada, el modelo puede correr en un Mac mini o MacBook sin GPU dedicada, util para escenarios con requisitos de privacidad que impiden enviar imagenes a la nube.
- Anotacion automatica de datasets: generar cajas preliminares sobre imagenes no etiquetadas y pasarlas a herramientas de revision humana, reduciendo el trabajo de etiquetado manual en proyectos de vision.
- Analitica de retail y conteo de personas: detectar clientes, carros o productos en grabaciones para obtener conteos y mapas de calor, con foco en escenas de interior del dominio COCO.
- Control de calidad industrial: localizar defectos visibles en lineas de produccion cuando el objeto defectuoso encaja en las categorias COCO o tras un ajuste fino posterior.
- Robotica y sistemas autonomos sobre Apple Silicon: usar el detector como modulo de percepcion en prototipos de robotica o drones cuyo computo se realiza en hardware Apple.
- Preprocesado para pipelines de vision mayores: servir las cajas detectadas a un sistema de seguimiento, reconocimiento o recorte que consuma la salida en formato COCO.
- Investigacion comparativa de backends: el repositorio sirve para medir el rendimiento de MLX frente a PyTorch MPS replicando exactamente los mismos pesos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre COCO val2017 (5000 imagenes), con el mismo preprocesado (letterbox 640) y la misma NMS para ambos backends, evaluados con pycocotools. No verificados de forma independiente.

| Backend | mAP50-95 | mAP50 |
|---|---|---|
| MLX (este repositorio) | 0,5349 | 0,7036 |
| PyTorch (`.pt` oficial) | 0,5348 | 0,7037 |

Velocidad declarada (solo forward del modelo, sin NMS ni E/S), sobre Apple M5, 640x640, batch 1, mediana de 100 ejecuciones tras calentamiento y con GPU sincronizada:

| Backend | ms / imagen |
|---|---|
| MLX fp32 | 66,55 |
| MLX bf16 | 48,57 |
| PyTorch MPS fp32 | 70,22 |
| PyTorch MPS fp16 | 42,09 |

## Requisitos de hardware

- Pesos en fp32: aproximadamente 106 MB (26,6 M de parametros a 4 bytes). En bf16, unos 53 MB.
- Memoria total con activaciones a 640x640 y batch 1: del orden de 1 GB o menos, dependiente del runtime; cabe sobradamente en la memoria unificada de cualquier Mac Apple Silicon.
- Cabe en GPU de consumo: si, en cualquier chip Apple Silicon (M1 o superior) con soporte Metal.
- Hardware de referencia en las medidas del autor: Apple M5.
- Despliegue con este repositorio: runtime MLX (script `python -m yolo12mlx.predict`), previa clonacion de yolo12-mlx y ejecucion de `scripts/setup.sh`.
- Para otras plataformas (NVIDIA, CPU, movil), usar los pesos oficiales de Ultralytics YOLO12 en PyTorch y las rutas de exportacion habituales de YOLO (ONNX, TensorRT, TFLite, etc.); no se documentan en este repositorio.
- No se publican cifras de throughput por lote ni latencias en GPUs NVIDIA para esta conversion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP50-95 (COCO) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO12l-mlx (este) | 26,6 M | imagen 640x640 | 0,5349 (MLX) | AGPL-3.0 | HuggingFace + repo MLX |
| Ultralytics YOLO12l | 26,6 M | imagen 640x640 | 0,5348 (PyTorch, dato del autor) | AGPL-3.0 | Ultralytics / HuggingFace |
| Ultralytics YOLO11l | aproximadamente 25,3 M | imagen 640x640 | segun documentacion de Ultralytics, en torno a 0,53 | AGPL-3.0 | Ultralytics |
| Ultralytics YOLOv8l | aproximadamente 43,7 M | imagen 640x640 | segun documentacion de Ultralytics, en torno a 0,52 | AGPL-3.0 | Ultralytics |
| RT-DETR-l | aproximadamente 32 M | imagen 640x640 | no disponible en la informacion proporcionada | Apache-2.0 (segun proyecto original) | PaddleDetection / Ultralytics |

La comparativa de rendimiento de los modelos competidores no procede de la informacion proporcionada; se indica solo como referencia y conviene consultar las tablas oficiales de cada proyecto antes de decidir.

## Limitaciones y advertencias

- Modelo de vision sin capacidades de lenguaje, razonamiento ni generacion de texto.
- Solo detecta las 80 clases de COCO; cualquier objeto fuera de ese conjunto no sera reconocido sin reentrenamiento.
- Rendimiento sensible a la resolucion y al preprocesado: desviarse del letterbox a 640 o de la NMS por defecto puede alterar la mAP.
- Riesgo de falsos positivos y negativos inherente a la deteccion, especialmente en objetos pequenos, ocluidos o con poca luz; no se documentan sesgos especificos.
- Sin verificacion independiente de los benchmarks: los valores proceden del autor y estan marcados como no verificados.
- Licencia AGPL-3.0 heredada de Ultralytics YOLO12: el uso comercial en productos o servicios en red puede obligar a liberar el codigo fuente bajo la misma licencia. Revisar los terminos de Ultralytics antes de usarlo en produccion.
- La entrada esta fijada a imagenes; no gestiona secuencias de video de forma nativa, requiere procesamiento fotograma a fotograma.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: proyecto joven, sin comunidad amplia ni garantias de mantenimiento.
- Sin datos declarados sobre idiomas ni sobre el conjunto exacto de datos de entrenamiento mas alla de COCO.

## Enlaces

- HuggingFace: https://huggingface.co/youakrim/yolo12l-mlx
- Repositorio yolo12-mlx: https://github.com/youakrim/yolo12-mlx
- Coleccion "YOLO12 for MLX": https://huggingface.co/collections/youakrim/yolo12-for-mlx-6ac659ef0a06781003d1d3cc
- Modelo base Ultralytics/YOLO12: https://huggingface.co/Ultralytics/YOLO12
- Documentacion Ultralytics YOLO12: https://docs.ultralytics.com/models/yolo12/
- Paper YOLO12 (attention-centric): https://arxiv.org/abs/2502.12524
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- Dataset COCO (val2017): https://cocodataset.org/
