# wesjos/yolo-face-nano-fast

## Resumen

YOLO-face-nano-fast es un conjunto de cuatro detectores de rostros a escala nano publicados por el usuario wesjos en Hugging Face. Los cuatro modelos (basados en YOLOv8n, YOLO11n, YOLO26n y YOLOv5nu) comparten exactamente el mismo dataset y la misma receta de entrenamiento, lo que permite compararlos directamente. Están disenados para una entrada fija de 320x320 píxeles y una única clase, `face`, con el objetivo de detectar un rostro que ocupa una porción grande del encuadre.

El modelo resuelve el problema de la detección de caras en escenarios controlados de primer plano: fotos de carné, avatares, capturas de control de acceso o retratos recortados. No está pensado para multitudes ni para caras lejanas y diminutas, donde su recall cae de forma notable. Su relevancia radica en que ofrece una latencia muy baja (hasta 3646 FPS en batch de 32 sobre una RTX 4090) con una precisión mAP50-95 en torno a 0,914, y en que el autor publica una comparativa rigurosa entre las cuatro variantes con intervalos de confianza bootstrap, algo poco habitual en modelos de este tamano.

La arquitectura subyacente es la de los detectores YOLO de Ultralytics en su variante nano, con 2,5-3,1 millones de parámetros y entre 1,48 y 2,19 GFLOPs. El repositorio es de tamano despreciable (0,0 GB) y la licencia es AGPL-3.0, heredada de Ultralytics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector YOLO (variantes YOLOv8n, YOLO11n, YOLO26n y YOLOv5nu de Ultralytics) |
| Parametros totales | 2,534 M (yolo26n) a 3,138 M (yolov8n) segun variante |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, entrada fija de 320x320) |
| Tipos de cuantizacion | no disponible (pesos `.pt` de Ultralytics; FP16 usado en benchmarks) |
| Idiomas soportados | no disponible (no aplica, deteccion de rostros) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (Ultralytics/PyTorch) |

## Arquitectura y entrenamiento

Los cuatro modelos son detectores de objetos de la familia YOLO en escala nano. Cada variante corresponde a una generacion distinta de Ultralytics: YOLOv8n (3,138 M parámetros, 2,19 GFLOPs), YOLO11n (2,605 M, 1,63 GFLOPs), YOLO26n (2,534 M, 1,48 GFLOPs) y YOLOv5nu (2,636 M, 1,93 GFLOPs, que es el port de Ultralytics de YOLOv5n y no el modelo original de 1,77 M). Todos operan con entrada fija de 320x320 y una sola clase, `face`.

El entrenamiento se realizo sobre 23.150 imágenes con 24.575 cajas (split de validacion: 5.797 imágenes y 6.146 cajas; total 30.721 cajas). La mayoria de las imágenes son nativas de 320x320 (25.845 de 28.947), sin redimensionado. Las etiquetas fueron generadas por un detector automatico, no verificadas caja a caja por humanos. El split oficial se comprobo libre de duplicados mediante md5 y hash perceptual. La receta fue de 150 epocas, batch 256, optimizador automatico (MuSGD con lr 0,01 cuando las iteraciones superan 10.000), aumentacion por defecto (mosaic 1,0, scale 0,5, fliplr 0,5, con mosaic desactivado en las ultimas 10 epocas), semilla 0 y `deterministic=True`, sobre Ultralytics 8.4.211 y torch 2.11.0+cu130. El tiempo de entrenamiento por modelo fue de 41-49 minutos en una RTX 4090.

## Capacidades

- Deteccion de rostros en imagenes con entrada fija de 320x320 y una unica clase `face`.
- Localizacion mediante cajas delimitadoras (region del rostro, de la linea del pelo al menton, excluyendo nuca y cuello).
- Salida con puntuacion de confianza por caja, filtrable por umbral (`conf`) y NMS (`iou`).
- Inferencia por lotes (batch) con throughput alto en GPU.
- Integracion nativa con la libreria `ultralytics` (API de Python y CLI `yolo predict`).
- No soporta tool calling, agentes, razonamiento multi-paso, vision general, audio ni capacidades multilingues: es un detector de objetos especializado.

## Casos de uso

- Verificacion de identidad en fotos de carné: el modelo esta calibrado para rostros que ocupan entre el 12% y el 22% del encuadre, justo el rango de un retrato de documento, con confianza superior a 0,92 en las demos.
- Control de acceso y capturas de torno: al procesar imagenes de camara de proximidad donde la cara llena el encuadre, permite decidir si hay un rostro valido antes de pasarlo al reconocimiento facial.
- Generacion y recorte de avatares: deteccion y recorte automatico de la cara en imagenes de perfil de usuario para pipelines de preprocesado.
- Prefiltrado en aplicaciones de vision por computador: descartar rapidamente imagenes sin rostro antes de modelos mas costosos, gracias a los 2886-3646 FPS en batch de 32.
- Anonimizacion en primer plano: localizar caras en fotos de documentos o retratos para aplicar desenfoque antes de publicarlas.
- Procesado por teselas de imagenes grandes: dividir una imagen en mosaicos de 320x320 y ejecutar el modelo en cada uno para localizar caras en escenas amplias, dado que el modelo no debe reescalarse a 640.
- Despliegue en dispositivos con recursos limitados: con 1,48-2,19 GFLOPs y pesos de 5,5-6,5 MB, es viable en GPUs de gama baja e incluso en CPU para lotes pequenos.

## Benchmarks y rendimiento

Resultados medidos sobre el mismo conjunto de validacion (5.797 imágenes, 6.146 cajas), `imgsz=320`, `conf=0,001`, metricas estilo COCO. Velocidad medida en RTX 4090 con FP16, ruta completa (preproceso + forward + NMS), mediana de 7 ejecuciones.

| Modelo | Parametros | GFLOPs | Tamano | P | R | mAP50 | mAP50-95 | Latencia b1 (ms) | FPS b1 | FPS b32 |
|---|---|---|---|---|---|---|---|---|---|---|
| yolov8n-face320 | 3,138 M | 2,19 | 6,5 MB | 0,9908 | 0,9796 | 0,9931 | 0,9142 | 4,39 | 228 | 3646 |
| yolo11n-face320 | 2,605 M | 1,63 | 5,5 MB | 0,9913 | 0,9789 | 0,9929 | 0,9147 | 5,59 | 179 | 3106 |
| yolo26n-face320 | 2,534 M | 1,48 | 5,5 MB | 0,9900 | 0,9797 | 0,9930 | 0,9140 | 6,41 | 156 | 2886 |
| yolov5nu-face320 | 2,636 M | 1,93 | 5,5 MB | 0,9927 | 0,9795 | 0,9932 | 0,9138 | 4,68 | 214 | 3580 |

El autor indica que las diferencias de precision entre los cuatro modelos se probaron con un bootstrap pareado de 1000 rondas y que todos los intervalos de confianza al 95% cruzan cero, por lo que no hay diferencia medible de precision y la eleccion debe hacerse por velocidad y tamano.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con pesos de 5,5-6,5 MB y 1,48-2,19 GFLOPs, cabe holgadamente en cualquier GPU consumer (menos de 1 GB en la practica, aunque no se publica una cifra exacta).
- GPU recomendadas: RTX 4090 para el throughput medido (hasta 3646 FPS en batch de 32); cualquier GPU moderna sirve para inferencia en tiempo real.
- Cabe en GPU consumer: si, incluidas gamas de entrada; el autor ejecuto las demos en CPU con `ultralytics 8.3.51`.
- Opciones de despliegue: libreria `ultralytics` (Python y CLI); no se documentan exportaciones a ONNX, TensorRT, OpenVINO ni integraciones con vLLM, llama.cpp u Ollama (no aplica a un detector de objetos).
- Latencia y throughput: 4,39-6,41 ms por imagen en batch 1 y 2886-3646 FPS en batch 32 sobre RTX 4090 con FP16.

## Comparativa con modelos similares

Comparativa interna entre las cuatro variantes publicadas (misma tarea, mismo dataset, misma receta):

| Modelo | Parametros | GFLOPs | mAP50-95 | FPS b32 (RTX 4090) | Licencia |
|---|---|---|---|---|---|
| yolov8n-face320 | 3,138 M | 2,19 | 0,9142 | 3646 | AGPL-3.0 |
| yolov5nu-face320 | 2,636 M | 1,93 | 0,9138 | 3580 | AGPL-3.0 |
| yolo11n-face320 | 2,605 M | 1,63 | 0,9147 | 3106 | AGPL-3.0 |
| yolo26n-face320 | 2,534 M | 1,48 | 0,9140 | 2886 | AGPL-3.0 |

No se dispone en la informacion proporcionada de comparaciones con otros detectores de rostros externos (por ejemplo, RetinaFace, MTCNN o SCRFD); no disponible.

## Limitaciones y advertencias

- La entrada debe ser 320x320: ejecutar un modelo entrenado a 320 con `imgsz=640` reduce la mAP50-95 de 0,914 a 0,775; no se debe reescalar la entrada.
- Debil en objetivos pequenos: recall aproximado de 0,73 para cajas de referencia menores del 0,4% del encuadre, 0,77 para el rango 0,4-2% y 0,998 por encima del 10%. Para caras lejanas hay que teselar la imagen o entrenar un modelo a 640.
- El conjunto de entrenamiento esta dominado por imagenes con una sola cara (solo el 5,5% tiene varias), por lo que las multitudes quedan fuera de distribucion.
- Las etiquetas fueron generadas por un detector automatico y no verificadas manualmente caja a caja, lo que puede introducir ruido en el ground truth.
- De los fallos, el 88,5% son ausencias completas de deteccion y cerca del 32% son detecciones por debajo de 0,25; bajar `conf` a ~0,15 recupera aproximadamente un tercio a costa de mas falsos positivos.
- La caja delimita la region del rostro (linea del pelo al menton), no la cabeza completa; si el sistema posterior necesita una caja de cabeza entera hay que redefinirla.
- Licencia AGPL-3.0 heredada de Ultralytics: impone obligaciones de copyleft para uso en red y puede no ser apta para productos comerciales cerrados sin revisar las condiciones.
- Riesgo de sesgo: no se documenta la composicion demografica del dataset ni evaluaciones de equidad; no disponible.
- Riesgo de alucinacion: no aplica (no es un modelo generativo), pero si hay riesgo de falsos positivos y negativos segun el umbral de confianza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/yolo-face-nano-fast
- Ultralytics (framework y modelos base): https://github.com/ultralytics/ultralytics
- Documentacion de Ultralytics: https://docs.ultralytics.com
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
