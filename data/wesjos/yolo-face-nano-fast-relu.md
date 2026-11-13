# wesjos/yolo-face-nano-fast-ReLU

## Resumen

yolo-face-nano-fast-ReLU es un conjunto de cuatro detectores de caras a escala nano publicados por el usuario wesjos en Hugging Face, construidos sobre la familia Ultralytics YOLO (YOLOv5nu, YOLOv8n, YOLO11n y YOLO26n). El modelo resuelve la deteccion de una unica clase (cara) con entrada fija de 320x320 pixeles y un unico objeto por imagen, orientado a fotografias de identidad, avatares, capturas de control de acceso y retratos recortados donde la cara ocupa una proporcion grande del encuadre.

Tecnicamente no es un modelo nuevo desde cero, sino una ablacion de variable unica del modelo base wesjos/yolo-face-nano-fast: mismo dataset, mismos hiperparametros, mismos pesos iniciales y misma semilla, cambiando unicamente la funcion de activacion de SiLU a ReLU. El objetivo declarado es medir el coste real en precision de sustituir SiLU por ReLU, motivado por plataformas de destino (NPU, pipelines INT8) que no pueden evaluar la exponencial de SiLU.

La relevancia es metodologica: el autor demuestra con bootstrap pareado de 1000 rondas que la perdida de precision es estadisticamente significativa en las cuatro arquitecturas (entre 0,19 y 0,62 puntos porcentuales de mAP50-95), mientras que en una RTX 4090 no se observa ninguna ganancia de latencia. La conclusion practica es que el cambio solo tiene sentido cuando la plataforma de destino lo impone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO (Ultralytics): YOLOv5nu, YOLOv8n, YOLO11n y YOLO26n, escala nano, deteccion de una clase |
| Parametros totales | 2,636 M (v5nu) / 3,138 M (v8n) / 2,605 M (v11n) / 2,534 M (v26n) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision); entrada fija de 320x320 pixeles |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el autor menciona pipelines INT8 como caso de uso legitimo para ReLU |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | checkpoints `.pt` de Ultralytics (`yolov5nu-face320-relu.pt`, `yolov8n-face320-relu.pt`, `yolo11n-face320-relu.pt`, `yolo26n-face320-relu.pt`) |

## Arquitectura y entrenamiento

Los cuatro modelos son detectores YOLO de escala nano con backbone y cabeza estandar de Ultralytics, modificados para usar ReLU en lugar de SiLU en todas las activaciones. La entrada esta fijada a 320x320 y la cabeza predice una sola clase. Los GFLOPs medidos a 320 son 1,93 (v5nu), 2,19 (v8n), 1,63 (v11n) y 1,35 (v26n), y los tamanos de checkpoint oscilan entre 5,20 y 6,18 MB.

El entrenamiento replica exactamente el del modelo base wesjos/yolo-face-nano-fast: mismo dataset, mismos hiperparametros, mismos pesos iniciales y misma semilla, con la activacion como unica variable independiente. El conjunto de validacion empleado tiene 5.797 imagenes y 6.146 cajas, y las metricas se calculan con AP interpolada de 101 puntos estilo COCO en numpy, el mismo estimador que el repositorio base. El autor advierte que la columna de control SiLU de esta ablacion (0,9098 / 0,9098 / 0,9094 / 0,9101) queda 0,3-0,4 pp por debajo de las cifras publicadas en el repositorio SiLU (0,9138-0,9147), por lo que no son la misma ejecucion de entrenamiento y las comparaciones deben hacerse dentro de esta tabla, no entre repositorios.

La innovacion tecnica del trabajo es el diseno experimental: ablacion de variable unica con bootstrap pareado de 1000 rondas para estimar intervalos de confianza al 95% del delta de mAP50-95, ademas de medicion de latencia en FP16 sobre RTX 4090 con la ruta completa de prediccion (preprocesado, postprocesado y NMS), mediana de 7 ejecuciones, a batch 1, 32 y 64.

## Capacidades

- Deteccion de caras en imagenes con entrada fija de 320x320 y una unica clase.
- Salida de cajas delimitadoras con puntuacion de confianza por deteccion.
- Funciona bien cuando la cara ocupa entre aproximadamente el 13% y el 23% del encuadre (zona de confort declarada por el autor).
- Rendimiento alto en retratos, fotos de identidad, avatares y capturas de control de acceso.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un detector puro.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision multimodal ni audio.
- Compatible con el ecosistema Ultralytics (`YOLO(...).predict(...)`, CLI `yolo predict`).

## Casos de uso

- Verificacion de identidad en onboarding digital: el modelo detecta y recorta la cara en fotos de DNI o selfies de registro; su entrada de 320 y su entrenamiento en retratos con la cara ocupando buena parte del encuadre encajan con este formato.
- Control de acceso y tornos: capturas de camara cenital o frontal en las que la cara llena el encuadre; el modelo ofrece mAP50-95 en torno a 0,90 sobre el conjunto de validacion del autor.
- Generacion de avatares y recorte automatico de retratos: deteccion de la region facial (de nacimiento del pelo a menton) para pipelines de edicion o thumbnails.
- Preprocesado en pipelines de reconocimiento facial: la caja detectada sirve para alinear y recortar antes de pasar a un modelo de embeddings; el modelo es ligero (2,5-3,1 M de parametros) y apto para ejecucion en CPU.
- Despliegue en NPU o aceleradores INT8 sin soporte de `exp()`: este es el caso de uso declarado como legitimo para la variante ReLU, cuando la plataforma de destino no puede evaluar SiLU.
- Filtrado y curaduria de datasets de imagenes: deteccion rapida de imagenes que contienen caras y de su tamano relativo para descartar o clasificar muestras.
- Procesamiento por mosaico de imagenes grandes: dividir la imagen en teselas de 320x320 y ejecutar el detector en cada una para localizar caras en escenas amplias, dado que las caras muy pequenas no son su dominio.

## Benchmarks y rendimiento

Resultados sobre el conjunto de validacion del autor (5.797 imagenes / 6.146 cajas), `imgsz=320`, `conf=0.001`, AP interpolada de 101 puntos estilo COCO:

| Checkpoint | Parametros | GFLOPs | Tamano | mAP50 | mAP50-95 | Delta vs SiLU |
|---|---|---|---|---|---|---|
| `yolov5nu-face320-relu.pt` | 2,636 M | 1,93 | 5,25 MB | 0,9870 | 0,9036 | -0,0062 |
| `yolov8n-face320-relu.pt` | 3,138 M | 2,19 | 6,18 MB | 0,9881 | 0,9080 | -0,0019 |
| `yolo11n-face320-relu.pt` | 2,605 M | 1,63 | 5,24 MB | 0,9866 | 0,9056 | -0,0038 |
| `yolo26n-face320-relu.pt` | 2,534 M | 1,35 | 5,20 MB | 0,9870 | 0,9050 | -0,0051 |

Comparativas de activacion declaradas por el autor:

| Comparacion | Delta mAP50-95 | Significancia | Latencia b32 |
|---|---|---|---|
| SiLU - ReLU | SiLU +0,41 pp | 4/4 arquitecturas significativas | 0,280 vs 0,278 ms, sin diferencia |
| SiLU - LeakyReLU(0,1) | SiLU +0,28 pp | 3/4 significativas | sin diferencia |
| ReLU - LeakyReLU(0,1) | +0,12 pp | 0/4 significativas | sin diferencia |

Latencia medida en RTX 4090, FP16, ruta completa de prediccion con NMS, mediana de 7 ejecuciones: sin diferencia entre activaciones a batch 1, 32 y 64.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para cualquiera de los cuatro checkpoints (2,5-3,1 M de parametros, 5-6 MB de pesos); en la practica el consumo lo domina el runtime de Ultralytics y el tamano de batch.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor mide latencias de 0,278-0,280 ms a batch 32 en una RTX 4090. Tambien funciona en CPU, como demuestran las imagenes de demo generadas en CPU con `ultralytics 8.3.51`.
- Cabe holgadamente en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) e incluso en dispositivos embebidos tipo Jetson o NPU.
- Opciones de despliegue: Ultralytics (Python API y CLI `yolo predict`), exportacion a los formatos soportados por Ultralytics (ONNX, TensorRT, OpenVINO, etc., segun la herramienta); el autor no detalla que exportaciones se han validado.
- Latencia y throughput: 0,278-0,280 ms por inferencia completa a batch 32 en RTX 4090 FP16, sin diferencia entre SiLU y ReLU.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | mAP50-95 | Licencia | Notas |
|---|---|---|---|---|---|
| yolo-face-nano-fast-ReLU (v8n) | 3,138 M | 320 | 0,9080 | AGPL-3.0 | Ablacion ReLU; control SiLU en el mismo run: 0,9098 |
| yolo-face-nano-fast (base, SiLU) | no disponible en la informacion | 320 | 0,9138-0,9147 (publicado) | AGPL-3.0 | Modelo de referencia; no es la misma ejecucion de entrenamiento |
| YOLOv8n / YOLO11n / YOLOv5nu genericos | 2,6-3,1 M | configurable | no disponible | AGPL-3.0 | Detectores COCO de proposito general; el autor los usa como control cualitativo a `conf=0.10` sobre cinco imagenes |

## Limitaciones y advertencias

- La entrada debe ser 320x320: ejecutar estos pesos a 640 degrada el mAP50-95 de aproximadamente 0,91 a 0,775; no se debe reescalar la entrada.
- Las caras muy pequenas y lejanas (caja ground-truth inferior al 0,4% del encuadre) solo alcanzan un recall de aproximadamente 0,73; no es el dominio del modelo.
- La caja delimita la region facial (de nacimiento del pelo a menton), excluyendo nuca y cuello; si el pipeline necesita una caja de cabeza completa hay que redefinirla aguas abajo.
- El nombre de clase dentro de los checkpoints es `item`, no `face` (`model.names == {0: 'item'}`, heredado del yaml de entrenamiento); al ser mono-clase no rompe nada, pero conviene tenerlo en cuenta.
- Perdida de precision real y estadisticamente significativa frente a SiLU en las cuatro arquitecturas; no se debe cambiar a ReLU esperando mejoras de velocidad, porque en RTX 4090 no las hay.
- LeakyReLU no recupera informacion del lado negativo de forma estadisticamente soportada; no hay justificacion para preferirlo sobre ReLU simple.
- Licencia AGPL-3.0: impone obligaciones de liberacion de codigo en servicios en red; revisar antes de uso comercial propietario.
- No se han publicado datos sobre sesgos demograficos, robustez ante oclusiones, iluminacion adversa o calidad de imagen degradada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente por parte de la comunidad.
- Las cifras de mAP no son directamente comparables con las del repositorio base SiLU porque provienen de ejecuciones de entrenamiento distintas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/yolo-face-nano-fast-ReLU
- Modelo base (SiLU): https://huggingface.co/wesjos/yolo-face-nano-fast
- Ultralytics (framework): https://github.com/ultralytics/ultralytics
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
