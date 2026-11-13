# wesjos/YOLO-face-detection320-ReLU

## Resumen

YOLO-face-detection320-ReLU es un conjunto de cuatro detectores de rostros a escala nano derivados de la familia YOLO de Ultralytics (YOLOv5, YOLOv8, YOLO11 y YOLO26), publicados por el usuario wesjos. El modelo resuelve la deteccion de una unica clase (rostro) sobre entradas de 320×320 píxeles, pensado para imagenes donde la cara ocupa una porcion significativa del encuadre. Su interes no reside en el rendimiento bruto, sino en que constituye un ablation controlado de una sola variable: sustituye la activacion SiLU por ReLU manteniendo identicos dataset, hiperparametros, pesos iniciales y semilla respecto al repositorio base wesjos/YOLO-face-detection320.

La relevancia del modelo es metodologica y practica a la vez. Por un lado, cuantifica el coste de cambiar SiLU por ReLU (entre 0,19 y 0,62 puntos porcentuales de mAP50-95 segun arquitectura, con significancia estadistica en las cuatro arquitecturas). Por otro, ofrece pesos listos para plataformas de destino (NPU, pipelines INT8) que no pueden evaluar la funcion exponencial de SiLU. El repositorio incluye cuatro checkpoints de entre 2,53 y 3,14 millones de parametros, con un coste computacional de 1,35 a 2,19 GFLOPs a 320×320.

El modelo se distribuye bajo licencia AGPL-3.0, esta etiquetado con el pipeline `object-detection` y usa la libreria `ultralytics`. No se especifican idiomas soportados (es un detector de imagenes, no un modelo linguistico). La model card advierte explicitamente de que no debe usarse como sustituto del baseline SiLU salvo que exista una restriccion de hardware que lo justifique.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN tipo YOLO (detectores nano de YOLOv5nu, YOLOv8n, YOLO11n y YOLO26n) con activacion ReLU en lugar de SiLU |
| Parametros totales | 2,636 M (v5nu) / 3,138 M (v8n) / 2,605 M (11n) / 2,534 M (26n) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision); entrada fija de 320×320 píxeles |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (la model card menciona pipelines INT8 como caso de uso legitimo, sin detallar metodos) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | checkpoints `.pt` de Ultralytics (PyTorch) |
| GFLOPs | 1,93 (v5nu) / 2,19 (v8n) / 1,63 (11n) / 1,35 (26n) |
| Tamano de checkpoint | 5,25 MB / 6,18 MB / 5,24 MB / 5,20 MB |
| Clases | 1 (`item`, heredado del yaml de entrenamiento; semanticamente rostro) |
| Modelo base | Ultralytics/YOLO26, YOLO11, YOLOv8, YOLOv5 |

## Arquitectura y entrenamiento

Los cuatro checkpoints son detectores de objetos de una sola etapa con backbone y cabeza nano de sus respectivas familias YOLO, modificados para usar ReLU como activacion en lugar de SiLU. La unica variable alterada respecto al repositorio base es la funcion de activacion: dataset, hiperparametros, pesos iniciales y semilla se mantienen identicos, lo que convierte al repositorio en un experimento de ablation de variable unica. El conjunto de validacion empleado es el mismo que el del baseline SiLU, con 5.797 imagenes y 6.146 cajas, evaluado a `imgsz=320`, `conf=0.001` y AP interpolada COCO de 101 puntos calculada en numpy.

El autor documenta que el baseline SiLU de esta misma ejecucion de ablation obtuvo 0,9098 / 0,9098 / 0,9094 / 0,9101 de mAP50-95, cifras entre 0,3 y 0,4 puntos porcentuales por debajo de las publicadas en el repositorio SiLU original (0,9138–0,9147). Esto indica que ambas publicaciones no corresponden a la misma ejecucion de entrenamiento, por lo que las comparaciones deben hacerse dentro de la tabla de este repositorio y no entre repositorios. La significancia se evaluo con un bootstrap pareado de 1000 rondas: la perdida de precision al sustituir SiLU por ReLU resulta significativa en las cuatro arquitecturas (intervalo de confianza al 95% sin cruzar cero), mientras que la diferencia ReLU frente a LeakyReLU(0,1) no es significativa en ninguna (0/4).

## Capacidades

- Deteccion de rostros en imagenes con entrada fija de 320×320 píxeles y una unica clase de salida.
- Localizacion mediante cajas delimitadoras con puntuacion de confianza asociada.
- Funcionamiento en CPU y GPU a traves de la libreria `ultralytics` (probado con `ultralytics 8.3.51` en CPU para las demos y `8.4.211` para la remedicion de parametros).
- Buen comportamiento en encuadres donde la cara ocupa entre el 13% y el 23% del area de la imagen (fotos de carnet, avatares, capturas de control de acceso, retratos recortados).
- Capacidad de suprimir candidatos de baja confianza mediante umbrales configurables (`conf=0.25`, `iou=0.5` en los ejemplos).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un detector visual.

## Casos de uso

- Control de acceso y tornos: el modelo procesa capturas de camara donde el rostro ocupa una fraccion amplia del encuadre (13%–23% documentado) y devuelve la caja con confianza superior a 0,9, adecuado para verificar presencia de una persona antes de disparar el reconocimiento facial posterior.
- Verificacion en fotos de carnet o documentos de identidad: la entrada fija de 320×320 y el recorte ajustado a la region facial (de la linea del pelo al menton) encajan con el formato de fotografias tipo pasaporte, donde la cara domina la imagen.
- Preprocesado de pipelines de reconocimiento facial: el detector actua como primera etapa que localiza y recorta el rostro para alimentar un modelo de embeddings, con latencias de 0,278 ms en b32 sobre RTX 4090 en FP16 (ruta completa de prediccion con pre/post-procesado y NMS).
- Despliegue en NPU o aceleradores INT8: es el caso de uso que el propio autor senala como legitimo, ya que estas plataformas pueden no disponer de una implementacion eficiente de `exp()` y requieren sustituir SiLU por ReLU.
- Aplicaciones de avatar o edicion de retratos: el modelo localiza la cara en imagenes de usuario para recortes, filtros o generacion de miniaturas, siempre que la imagen se reescale a 320×320.
- Filtrado previo en galerias o catalogos: deteccion de presencia de rostros en lotes de imagenes pequenas para clasificar o descartar contenido antes de etapas mas costosas.
- Procesamiento por teselas de imagenes grandes: para escenas con rostros pequenos, el autor recomienda dividir la imagen en teselas y ejecutar el modelo a 320 sobre cada una, en lugar de reescalar la imagen completa.

## Benchmarks y rendimiento

Resultados sobre el conjunto de validacion (5.797 imagenes / 6.146 cajas), `imgsz=320`, `conf=0.001`, AP interpolada COCO de 101 puntos:

| Checkpoint | Parametros | GFLOPs | Tamano | mAP50 | mAP50-95 | Delta vs SiLU |
|---|---|---|---|---|---|---|
| `yolov5nu-face320-relu.pt` | 2,636 M | 1,93 | 5,25 MB | 0,9870 | 0,9036 | −0,0062 |
| `yolov8n-face320-relu.pt` | 3,138 M | 2,19 | 6,18 MB | 0,9881 | 0,9080 | −0,0019 |
| `yolo11n-face320-relu.pt` | 2,605 M | 1,63 | 5,24 MB | 0,9866 | 0,9056 | −0,0038 |
| `yolo26n-face320-relu.pt` | 2,534 M | 1,35 | 5,20 MB | 0,9870 | 0,9050 | −0,0051 |

Comparativa de activaciones (deltas de mAP50-95 y significancia con bootstrap pareado de 1000 rondas):

| Comparacion | Delta mAP50-95 | Significancia | Latencia b32 |
|---|---|---|---|
| SiLU − ReLU | SiLU +0,41 pp | 4/4 arquitecturas significativas | 0,280 vs 0,278 ms, sin diferencia |
| SiLU − LeakyReLU(0,1) | SiLU +0,28 pp | 3/4 significativas | sin diferencia |
| ReLU − LeakyReLU(0,1) | +0,12 pp | 0/4 significativas | sin diferencia |

Latencia medida en RTX 4090, FP16, ruta completa de prediccion incluyendo pre/post-procesado y NMS, mediana de 7 ejecuciones. No se han publicado resultados de benchmarks en la informacion disponible para tareas ajenas a la deteccion de rostros.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16 para cualquiera de los cuatro checkpoints (2,5–3,1 M de parametros, 5,2–6,2 MB de pesos); el cuello de botella es la resolucion de entrada, no el tamano del modelo.
- GPU recomendadas: RTX 4090 para las latencias documentadas (0,278–0,280 ms en b32); cualquier GPU consumer moderna (GTX 1660 en adelante, RTX 20/30/40) es sobradamente suficiente.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada e incluso en CPU para inferencia por lotes pequenos (las demos se generaron en CPU con `ultralytics 8.3.51`).
- Opciones de despliegue: `ultralytics` (Python API y CLI `yolo predict`), exportacion a ONNX, TensorRT, OpenVINO y TFLite a traves de las utilidades de Ultralytics; no se documenta soporte nativo de vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector visual).
- Latencia y throughput: 0,278 ms por inferencia en b32 sobre RTX 4090 en FP16 (mediana de 7 ejecuciones, ruta completa). El autor constata que b1, b32 y b64 empatan en latencia, lo que indica que la activacion no es el cuello de botella en esa maquina.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | mAP50-95 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO-face-detection320-ReLU (v8n) | 3,138 M | 320×320 fija | 0,9080 | AGPL-3.0 | Hugging Face (wesjos) |
| YOLO-face-detection320 (baseline SiLU, v8n) | 3,138 M | 320×320 fija | 0,9138–0,9147 (publicado) | AGPL-3.0 | Hugging Face (wesjos) |
| YOLOv8n estandar (Ultralytics) | 3,2 M aprox. | 640×640 | no disponible para rostros | AGPL-3.0 | Ultralytics / Hugging Face |
| YOLO11n estandar (Ultralytics) | 2,6 M aprox. | 640×640 | no disponible para rostros | AGPL-3.0 | Ultralytics / Hugging Face |

La comparacion directa mas informativa es contra el repositorio baseline SiLU del mismo autor: misma arquitectura, mismo dataset y misma semilla, con una perdida de 0,19 puntos porcentuales de mAP50-95 en el caso de YOLOv8n. Los modelos YOLO genericos de Ultralytics no estan entrenados para la clase rostro y no ofrecen cifras comparables en este conjunto de validacion.

## Limitaciones y advertencias

- La entrada debe ser 320×320. Ejecutar el modelo a 640 degrada el mAP50-95 de aproximadamente 0,91 a 0,775; no debe reescalarse la entrada hacia arriba.
- Rendimiento limitado en rostros pequenos y lejanos: con cajas de ground-truth inferiores al 0,4% del encuadre, el recall cae a aproximadamente 0,73. Para escenas amplias hay que teselar la imagen o entrenar un modelo a 640.
- La caja delimitadora corresponde a la region facial (de la linea del pelo al menton), excluyendo la nuca y el cuello; si el sistema posterior necesita una caja de cabeza completa, hay que redefinirla.
- El nombre de clase dentro de los checkpoints es `item`, no `face` (`model.names == {0: 'item'}`), heredado del yaml de entrenamiento; el codigo consumidor debe tenerlo en cuenta.
- La perdida de precision frente a SiLU es estadisticamente significativa en las cuatro arquitecturas; el autor desaconseja explicitamente sustituir SiLU por estos pesos salvo por una restriccion de hardware (NPU, INT8 sin `exp()`).
- Cambiar a LeakyReLU para "recuperar informacion del lado negativo" no tiene soporte estadistico segun el propio ablation (0/4 arquitecturas significativas).
- Las cifras absolutas no son comparables entre repositorios: el baseline SiLU de esta ejecucion esta 0,3–0,4 pp por debajo del publicado en el repositorio SiLU original.
- Licencia AGPL-3.0: el uso comercial en servicios en red exige cumplir las obligaciones de copyleft de la AGPL, incluida la disponibilidad del codigo fuente de las modificaciones.
- No se documentan sesgos demograficos, de iluminacion ni de oclusion; al ser un detector entrenado sobre un dataset no descrito en la model card, el riesgo de sesgo por atributos faciales no puede evaluarse con la informacion disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion independiente por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/YOLO-face-detection320-ReLU
- Repositorio baseline SiLU: https://huggingface.co/wesjos/YOLO-face-detection320
- Ultralytics (framework y modelos base): https://github.com/ultralytics/ultralytics
- Documentacion de Ultralytics: https://docs.ultralytics.com
- Modelos base en Hugging Face: https://huggingface.co/Ultralytics
