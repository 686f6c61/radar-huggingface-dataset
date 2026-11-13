# wesjos/YOLO-face-detection320

## Resumen

YOLO-face-detection320 es una colección de cuatro detectores de rostros a escala nano construidos sobre la familia YOLO de Ultralytics (YOLOv5n, YOLOv8n, YOLO11n y YOLO26n). El autor, wesjos, los entrena con la misma receta y el mismo conjunto de datos para que sean directamente comparables entre sí. Todos operan con una entrada fija de 320×320 píxeles y una única clase, `face`, y se distribuyen como pesos `.pt` listos para usar con la librería `ultralytics`.

El modelo resuelve un problema muy concreto: la detección de un rostro que ocupa una fracción grande del encuadre (retratos, fotos de carné, avatares, capturas de control de acceso). No está pensado para multitudes ni para rostros lejanos y diminutos, donde el rendimiento cae de forma notable. La relevancia práctica está en su tamaño mínimo (entre 2,5 y 3,1 millones de parámetros) y en su velocidad, con más de 150 FPS por imagen en una RTX 4090 en FP16.

Los cuatro modelos alcanzan métricas prácticamente idénticas en el conjunto de validación (mAP50-95 en torno a 0,914), y las pruebas estadísticas del autor no encuentran diferencias significativas entre ellos, por lo que la elección debe basarse en velocidad y tamaño del fichero, no en precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN detectora de una etapa (familia YOLO: YOLOv5n, YOLOv8n, YOLO11n, YOLO26n) |
| Parametros totales | 3,138 M (yolov8n) / 2,605 M (yolo11n) / 2,534 M (yolo26n) / 2,636 M (yolov5nu) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 320×320) |
| Tipos de cuantizacion | no disponible (solo se documentan pesos FP32 y ejecución FP16) |
| Idiomas soportados | no aplica (detección de rostros, sin componente lingüístico) |
| Licencia | AGPL-3.0 (heredada de Ultralytics) |
| Formato de pesos | `.pt` (PyTorch, cargable con `ultralytics`) |

## Arquitectura y entrenamiento

Los cuatro detectores son redes convolucionales de una etapa propias de la familia YOLO, en su variante nano. Cada uno conserva la arquitectura de su linaje (backbone CSP, cuello de agregación de características y cabeza de detección con una sola clase) y se ha reentrenado desde los pesos base de Ultralytics (YOLOv5nu, YOLOv8n, YOLO11n y YOLO26n) sobre el mismo dataset de rostros. El coste computacional va de 1,48 a 2,19 GFLOPs según el modelo.

El conjunto de entrenamiento contiene 23.150 imágenes y 24.575 cajas; el de validación, 5.797 imágenes y 6.146 cajas, con 30.721 cajas en total. La mayoría de las imágenes son nativas de 320×320 (25.845 de 28.947) y no se redimensionan. Las etiquetas proceden de un detector automático, no de verificación manual caja por caja, y el split oficial se comprobó libre de duplicados mediante md5 y hash perceptual. El entrenamiento usó 150 épocas, batch 256, optimizador automático (MuSGD con lr 0,01 cuando las iteraciones superan 10.000), aumentación por defecto (mosaic 1,0, scale 0,5, fliplr 0,5, con mosaic desactivado en las últimas 10 épocas), semilla 0 y `deterministic=True`, sobre Ultralytics 8.4.211 y torch 2.11.0+cu130. Cada modelo tardó entre 41 y 49 minutos en una RTX 4090.

## Capacidades

- Detección de rostros con una única clase `face` y salida de cajas delimitadoras con puntuación de confianza.
- Entrada fija de 320×320 píxeles; funciona mejor cuando el rostro ocupa entre el 12 % y el 22 % del encuadre.
- Inferencia en CPU y GPU mediante la librería `ultralytics` (API de Python y CLI `yolo predict`).
- NMS integrado en el pipeline de predicción (`iou=0.5` documentado).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un detector visual puro.
- No incluye visión generativa, audio ni modo de razonamiento.

## Casos de uso

- **Fotos de carné y documentos de identidad**: el modelo está calibrado para un rostro que llena buena parte del encuadre, justo el caso de una foto de identificación; basta con redimensionar a 320×320 y filtrar por confianza.
- **Avatares y recortes de perfil**: en imágenes de redes sociales o fichas de usuario, donde la cara ocupa entre el 12 % y el 22 % del frame, el modelo ofrece confidencias superiores a 0,93 en las pruebas del autor.
- **Control de acceso y capturas de puerta**: con una cámara que encuadra cabeza y hombros, el detector localiza la cara para alimentar un pipeline de reconocimiento o verificación posterior.
- **Preprocesado de pipelines de reconocimiento facial**: actuar como etapa de detección y recorte antes de un modelo de embeddings, reduciendo el coste al usar una red de 2,5-3,1 M de parámetros.
- **Anonimización y desenfoque automático**: detectar rostros en lotes de imágenes pequeñas para aplicar blur o pixelado antes de publicarlas, con throughput superior a 3.000 FPS en batch 32 sobre RTX 4090.
- **Procesamiento por teselas de imágenes grandes**: dividir una imagen de alta resolución en parches de 320×320 y ejecutar el detector en cada uno, tal como recomienda el autor para rostros pequeños o lejanos.
- **Prototipado rápido en CPU**: al ser modelos nano, permiten iterar en máquinas sin GPU; el autor reporta latencias de 4,4 a 6,4 ms por imagen en RTX 4090 en FP16.

## Benchmarks y rendimiento

Resultados del autor sobre el conjunto de validación (5.797 imágenes / 6.146 cajas), `imgsz=320`, `conf=0.001`, métricas estilo COCO:

| Modelo | Fichero | Params | GFLOPs | P | R | mAP50 | mAP50-95 | b1 (ms) | b1 FPS | b32 FPS |
|---|---|---|---|---|---|---|---|---|---|---|
| `yolov8n-face320.pt` | 6,50 MB | 3,138 M | 2,19 | 0,9908 | 0,9796 | 0,9931 | 0,9142 | 4,39 | 228 | 3646 |
| `yolo11n-face320.pt` | 5,51 MB | 2,605 M | 1,63 | 0,9913 | 0,9789 | 0,9929 | 0,9147 | 5,59 | 179 | 3106 |
| `yolo26n-face320.pt` | 5,47 MB | 2,534 M | 1,48 | 0,9900 | 0,9797 | 0,9930 | 0,9140 | 6,41 | 156 | 2886 |
| `yolov5nu-face320.pt` | 5,53 MB | 2,636 M | 1,93 | 0,9927 | 0,9795 | 0,9932 | 0,9138 | 4,68 | 214 | 3580 |

Las mediciones de velocidad se hicieron en RTX 4090 en FP16, incluyendo preprocesado, forward y NMS, con mediana de 7 ejecuciones. Las diferencias de precisión entre los cuatro modelos se evaluaron con bootstrap pareado de 1.000 rondas y todos los intervalos de confianza al 95 % cruzan cero: no hay diferencia medible de precisión.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para cualquiera de los cuatro modelos en FP16 (2,5-3,1 M de parámetros); en FP32, alrededor de 25 MB de pesos más activaciones.
- GPU recomendadas: RTX 4090 para las cifras publicadas; cualquier GPU consumer moderna (RTX 3060 o superior) es sobrada para inferencia en tiempo real.
- Cabe en cualquier GPU consumer e incluso en CPU: el autor ejecutó la demo en CPU con `ultralytics 8.3.51`.
- Despliegue: librería `ultralytics` (Python y CLI), exportación a otros formatos no documentada en la información disponible; no se mencionan vLLM, llama.cpp ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 4,39-6,41 ms por imagen en batch 1 y 2.886-3.646 FPS en batch 32 sobre RTX 4090 en FP16.

## Comparativa con modelos similares

| Modelo | Params | Entrada | mAP50-95 | Licencia |
|---|---|---|---|---|
| `yolov8n-face320.pt` | 3,138 M | 320×320 | 0,9142 | AGPL-3.0 |
| `yolo11n-face320.pt` | 2,605 M | 320×320 | 0,9147 | AGPL-3.0 |
| `yolo26n-face320.pt` | 2,534 M | 320×320 | 0,9140 | AGPL-3.0 |
| `yolov5nu-face320.pt` | 2,636 M | 320×320 | 0,9138 | AGPL-3.0 |

No se dispone en la información proporcionada de comparaciones con detectores de rostros de otros autores o familias (por ejemplo, RetinaFace, MTCNN o SCRFD), por lo que la comparativa se limita a los cuatro modelos del propio repositorio.

## Limitaciones y advertencias

- **Entrada obligatoria de 320×320**: ejecutar un modelo entrenado a 320 con entrada 640 hace caer el mAP50-95 de 0,914 a 0,775; no se debe reescalar la entrada.
- **Débil con objetivos pequeños**: recall de ~0,73 para cajas reales menores del 0,4 % del encuadre, ~0,77 entre 0,4 % y 2 %, y 0,998 por encima del 10 %.
- **Sesgo hacia imágenes con un solo rostro**: solo el 5,5 % del entrenamiento tiene varias caras, por lo que las multitudes quedan fuera de distribución.
- **Etiquetas automáticas**: las cajas del dataset no están verificadas manualmente, lo que puede introducir ruido en los límites del rostro.
- **Definición de la caja**: la caja cubre de la línea del pelo a la barbilla, sin nuca ni cuello; si el pipeline necesita una caja de cabeza completa, hay que redefinirla.
- **Falsos negativos**: el 88,5 % de los fallos son ausencias totales de detección y cerca del 32 % son detecciones por debajo del umbral 0,25; bajar `conf` a ~0,15 recupera aproximadamente un tercio a costa de más falsos positivos.
- **Licencia AGPL-3.0**: heredada de Ultralytics, impone obligaciones de copyleft para uso en red y puede ser incompatible con productos comerciales cerrados.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí existe riesgo de detecciones espurias en imágenes fuera de distribución.

## Enlaces

- Hugging Face: https://huggingface.co/wesjos/YOLO-face-detection320
- Ultralytics (framework): https://github.com/ultralytics/ultralytics
- Documentación de Ultralytics: https://docs.ultralytics.com
- Modelos base: https://huggingface.co/Ultralytics/YOLO11 , https://huggingface.co/Ultralytics/YOLO26 , https://huggingface.co/Ultralytics/YOLOv8 , https://huggingface.co/Ultralytics/YOLOv5
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
