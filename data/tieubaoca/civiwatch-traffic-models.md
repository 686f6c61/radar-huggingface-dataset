# tieubaoca/CiviWatch-Traffic-Models

## Resumen

CiviWatch Traffic Models es una suite de tres detectores de objetos especializados en tráfico urbano y seguridad vial, desarrollada por el usuario tieubaoca para el sistema CiviWatch v2. Los modelos están afinados sobre 25.977 fotogramas en alta definición (299.157 cajas anotadas) procedentes de cámaras de videovigilancia urbana de Ciudad Ho Chi Minh (conjunto `AIC_HCMC_2020`), complementados con anotaciones equilibradas de peatones y obstáculos. El objetivo es cubrir la detección de tráfico vietnamita, dominado por motocicletas (two_wheeler), un caso que los detectores genéricos entrenados en COCO resuelven con una precisión muy baja.

La suite incluye tres variantes con distintos compromisos entre latencia y precisión: YOLOX-Tiny a 416x416 (Apache-2.0, orientado a CPU y NPU de gama baja), YOLOX-s a 640x640 (Apache-2.0, para edge comercial con GPU) y YOLO26s a 640x640 con decodificación NMS-free (AGPL-3.0, para Jetson o servidor). Los tres se distribuyen en formato ONNX y comparten un esquema de 6 clases: person, two_wheeler, car, bus, truck y obstacle_object.

La relevancia actual reside en su enfoque de despliegue en el borde: el modelo Tiny alcanza 89,5 % de recall global a 0,4 IoU y 20,6 ms de latencia P50 en CPU, lo que lo hace viable en Raspberry Pi 5 o NPU Rockchip para analítica de vídeo en tiempo real sin GPU dedicada. La licencia dual (Apache-2.0 para las variantes YOLOX, AGPL-3.0 para YOLO26s) condiciona su uso comercial según la variante elegida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detectores YOLO (YOLOX-Tiny, YOLOX-s y YOLO26s) en formato ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos ONNX en precisión original) |
| Idiomas soportados | vi, en (etiquetas y documentación) |
| Licencia | Apache-2.0 (yolox-tiny-416, yolox-s-640) y AGPL-3.0 (yolo26s-640); licencia compuesta apache-2.0-and-agpl-3.0 |
| Formato de pesos | ONNX y .pth / .pt según variante |
| Tamaño de entrada | 416x416 (Tiny) y 640x640 (YOLOX-s, YOLO26s) |
| Clases | 6: person, two_wheeler, car, bus, truck, obstacle_object |
| Tamaño de los artefactos | ONNX 20,2 MB / 35,8 MB / 38,2 MB según variante |
| Pipeline | object-detection |

## Arquitectura y entrenamiento

Las tres variantes son detectores de la familia YOLO. YOLOX-Tiny y YOLOX-s emplean la arquitectura YOLOX con decodificación en rejilla (`yolox_grid`) y postprocesado NMS convencional; YOLO26s emplea una arquitectura YOLO26 con decodificación NMS-free que devuelve directamente un tensor `[1, 300, 6]` con el formato `[x1, y1, x2, y2, score, class_id]`. Los pesos se exportan a ONNX para inferencia con ONNXRuntime, y el repositorio incluye también los pesos originales en PyTorch (`.pth` o `.pt`).

El entrenamiento se realizó sobre 25.977 fotogramas HD (299.157 cajas) del conjunto `AIC_HCMC_2020` de cámaras CCTV urbanas de Ciudad Ho Chi Minh, mezclado con anotaciones equilibradas de peatones y obstáculos. No se detalla en la información disponible el número de épocas, la composición exacta del dataset, el uso de aumentos de datos ni si hubo destilación o ajuste fino desde pesos COCO; la comparación con la línea base COCO sugiere un ajuste fino supervisado sobre un detector preentrenado. El preprocesado difiere entre familias: YOLOX usa letterbox superior izquierdo con `pad=114`, canal BGR y rango `[0, 255]`; YOLO26s usa el mismo letterbox pero canal RGB y rango `[0, 1]`.

## Capacidades

- Detección de objetos en imágenes y fotogramas de vídeo con 6 clases orientadas a tráfico urbano.
- Detección específica de motocicletas (`two_wheeler`), clase crítica en el tráfico vietnamita y prácticamente ausente en detectores COCO.
- Detección de peatones, coches, autobuses, camiones y obstáculos genéricos.
- Funcionamiento en condiciones nocturnas: recall nocturno del 91,9 % en YOLOX-Tiny y YOLO26s, y 93,5 % en YOLOX-s.
- Integración con un pipeline de percepción en el borde (`LivePerceptionRunner`) que combina detección, seguimiento con ByteTrack, homografía y salida por outbox.
- Inferencia en CPU mediante ONNXRuntime (`CPUExecutionProvider`) y despliegue en NPU Rockchip y Jetson.
- Decodificación NMS-free en YOLO26s, que elimina el postprocesado NMS y reduce latencia en CPU.
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto: es exclusivamente un modelo de visión por computador.

## Casos de uso

- Monitorización de tráfico en directo en CCTV municipal: el modelo YOLOX-Tiny procesa vídeo 720p a 24,3 FPS en CPU, lo que permite desplegar analítica de aforo y clasificación vehicular en cámaras existentes sin añadir GPU.
- Aforo y clasificación de motocicletas en intersecciones: con un recall del 90,5 % en `two_wheeler` (Tiny) y del 95,6 % (YOLO26s), es adecuado para contar flujos dominados por motos, donde los detectores COCO caen al 14,2 %.
- Seguridad vial nocturna: el recall nocturno superior al 91 % en las tres variantes permite detectar peatones y vehículos en cruces mal iluminados para sistemas de alerta o análisis posterior.
- Detección de obstáculos en calzada: la clase `obstacle_object` permite alimentar sistemas de alerta temprana de objetos en la vía en paneles de señalización variable o centros de control.
- Despliegue en dispositivos de borde de bajo coste: YOLOX-Tiny (20,2 MB ONNX) cabe en Raspberry Pi 5 y NPU Rockchip RK3566/RK3588, habilitando analítica local sin enviar vídeo a la nube.
- Procesamiento en servidor con Jetson Orin NX: YOLO26s a 640 con decodificación NMS-free ofrece 14,8 FPS en vídeo 720p con 95,0 % de recall global, adecuado para un nodo de agregación que procesa varias cámaras.
- Análisis retrospectivo de grabaciones: el pipeline con ByteTrack y homografía permite extraer trayectorias y conteos a partir de vídeos archivados para estudios de movilidad urbana.
- Integración en cajas edge comerciales con requisito de licencia permisiva: las variantes YOLOX bajo Apache-2.0 permiten incorporar el detector a productos propietarios sin obligaciones de copyleft.

## Benchmarks y rendimiento

Resultados de validación sobre 100 fotogramas de validación de HCMC (día y noche), medidos con `ONNXRuntime CPUExecutionProvider`:

| Modelo | Recall `two_wheeler`@0.4 | Recall `car`@0.4 | Recall `bus`@0.4 | Recall `truck`@0.4 | Recall global@0.4 | Recall nocturno | mAP50 validación (3.858 imgs) | Latencia P50 CPU |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| YOLOX-Tiny (línea base COCO) | 14,2 % | 54,2 % | 31,2 % | 35,7 % | 22,7 % | 4,8 % | — | 21,1 ms |
| CiviWatch YOLOX-Tiny (416) | 90,5 % | 84,9 % | 81,2 % | 94,3 % | 89,5 % | 91,9 % | 82,1 % | 20,6 ms |
| CiviWatch YOLOX-s (640) | 94,4 % | 88,6 % | 87,5 % | 97,1 % | 93,4 % | 93,5 % | 88,6 % | 93,7 ms |
| CiviWatch YOLO26s (640) | 95,6 % | 91,6 % | 93,8 % | 97,1 % | 95,0 % | 91,9 % | 90,2 % | 46,5 ms |

Rendimiento del pipeline completo en el borde (`LivePerceptionRunner` + ByteTrack + homografía + outbox):

| Modelo | `sample_01.mp4` (HCMC 720p) | `sample_02.mp4` (HCMC 720p) | `shibuya_crossing_1080p.mp4` |
|---|:---:|:---:|:---:|
| CiviWatch YOLOX-Tiny (416) | 24,3 FPS (1.642 dets) | 21,5 FPS (1.973 dets) | 19,6 FPS (1.640 dets) |
| CiviWatch YOLOX-s (640) | 12,0 FPS (1.828 dets) | 10,8 FPS (1.926 dets) | 10,0 FPS (1.635 dets) |
| CiviWatch YOLO26s (640 NMS-free) | 14,8 FPS (1.648 dets) | 12,8 FPS (1.911 dets) | 10,3 FPS (1.235 dets) |

## Requisitos de hardware

- YOLOX-Tiny (416): pensado para CPU exclusivamente, Raspberry Pi 5 y NPU Rockchip RK3566/RK3588. El artefacto ONNX ocupa 20,2 MB y la latencia P50 en CPU es de 20,6 ms.
- YOLOX-s (640): caja edge comercial con GPU o cualquier despliegue que requiera licencia Apache-2.0. ONNX de 35,8 MB y latencia P50 en CPU de 93,7 ms.
- YOLO26s (640): Jetson Orin NX, servidor con GPU o CPU rápida gracias a la decodificación NMS-free. ONNX de 38,2 MB y latencia P50 en CPU de 46,5 ms.
- VRAM estimada: no disponible en la información proporcionada; los artefactos son de decenas de megabytes, por lo que caben en cualquier GPU consumer actual (RTX 4090, RTX 3060, etc.), aunque no se publican cifras de VRAM.
- Despliegue: ONNXRuntime (probado con `CPUExecutionProvider`); el repositorio proporciona `run_edge.py` y la clase `CiviWatchDetector` para el pipeline completo.
- Throughput: entre 19,6 y 24,3 FPS en 720p/1080p para YOLOX-Tiny, y entre 10,0 y 14,8 FPS para las variantes de 640 en CPU, según la tabla del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Contexto/clases | Recall global@0.4 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CiviWatch YOLOX-Tiny | no disponible | 416x416 | 6 clases de tráfico | 89,5 % | Apache-2.0 | Hugging Face (ONNX + .pth) |
| CiviWatch YOLOX-s | no disponible | 640x640 | 6 clases de tráfico | 93,4 % | Apache-2.0 | Hugging Face (ONNX + .pth) |
| CiviWatch YOLO26s | no disponible | 640x640 | 6 clases de tráfico | 95,0 % | AGPL-3.0 | Hugging Face (ONNX + .pt) |
| YOLOX-Tiny COCO (línea base) | no disponible | 416x416 | 80 clases COCO | 22,7 % | Apache-2.0 | Disponible en el ecosistema YOLOX |
| Detectores COCO genéricos (YOLOv8, YOLO11, etc.) | no disponible | 640x640 | 80 clases COCO | no disponible | GPL/AGPL según variante | Disponibles en sus repositorios oficiales |

La comparación directa con detectores COCO de referencia solo está disponible para la línea base YOLOX-Tiny incluida por el autor; no se han publicado comparativas con YOLOv8, YOLO11 u otros detectores en la información disponible.

## Limitaciones y advertencias

- Sesgo geográfico: el entrenamiento se basa en cámaras de Ciudad Ho Chi Minh; el rendimiento puede degradarse en otras ciudades, condiciones meteorológicas o tipos de vehículo no representados.
- Esquema de clases cerrado de 6 categorías: no detecta bicicletas, semáforos, señales de tráfico ni otras clases habituales en detección urbana.
- Riesgo de falsos positivos y negativos en escenas con oclusiones densas, típicas del tráfico de motocicletas, no cuantificado en la información disponible.
- La licencia AGPL-3.0 de YOLO26s impone obligaciones de copyleft sobre el software que lo integre y se distribuya; para uso comercial propietario debe elegirse una variante YOLOX bajo Apache-2.0.
- La licencia compuesta `apache-2.0-and-agpl-3.0` exige revisar qué subcarpeta se utiliza antes de redistribuir el repositorio completo.
- No se publican datos de calibración de confianza, curvas precisión-recall completas ni métricas por franja horaria más allá del recall nocturno.
- El preprocesado es específico por familia (BGR vs. RGB, rango de píxel distinto); un preprocesado incorrecto degrada gravemente los resultados.
- No se especifican cuantizaciones INT8 ni versiones optimizadas para TensorRT, lo que limita el despliegue en algunos aceleradores sin trabajo adicional de conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tieubaoca/CiviWatch-Traffic-Models
- Repositorio de código CiviWatch: https://github.com/remiehneppo/ai-camera/tree/civi-watch
- Conjunto de datos de referencia: `AIC_HCMC_2020` (no se proporciona URL directa en la información disponible)
