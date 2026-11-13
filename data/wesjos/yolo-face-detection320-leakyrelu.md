# wesjos/YOLO-face-detection320-LeakyReLU

## Resumen

YOLO-face-detection320-LeakyReLU es una familia de cuatro detectores de rostros a escala nano, desarrollados por el usuario wesjos, que comparten una entrada fija de 320×320 píxeles y una única clase de objeto (rostro). El repositorio no es un modelo nuevo en sentido estricto, sino un *ablation* de una sola variable sobre el modelo previo `wesjos/YOLO-face-detection320`: mismo dataset, hiperparámetros, pesos iniciales y semilla, cambiando únicamente la función de activación de SiLU a LeakyReLU con pendiente 0,1. Incluye cuatro arquitecturas: YOLOv5n (port de Ultralytics), YOLOv8n, YOLO11n y YOLO26n, todas con pesos en formato `.pt` de Ultralytics.

El interés del modelo es metodológico más que de rendimiento: el autor documenta de forma transparente que la sustitución de SiLU por LeakyReLU empeora ligeramente la precisión (entre 0,20 y 0,40 puntos porcentuales de mAP50-95) y no aporta ninguna mejora de latencia en una RTX 4090, con un bootstrap pareado de 1000 rondas que confirma significancia estadística en tres de las cuatro arquitecturas. El único caso de uso legítimo que el propio autor reconoce es un *target* (NPU o pipeline INT8) incapaz de evaluar `exp()`, y en ese escenario recomienda ReLU simple antes que LeakyReLU.

Los modelos rondan los 2,5-3,1 millones de parámetros y 1,35-2,19 GFLOPs a 320×320, con pesos de entre 5,2 y 6,2 MB. Están pensados para rostros que ocupan una fracción grande del encuadre (fotos de carné, avatares, control de acceso, retratos recortados), no para detección de rostros pequeños y lejanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN tipo YOLO (YOLOv5n, YOLOv8n, YOLO11n, YOLO26n), deteccion de objetos de una clase |
| Parametros totales | 2,534 M (yolo26n) / 2,605 M (yolo11n) / 2,636 M (yolov5nu) / 3,138 M (yolov8n) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 320×320) |
| Tipos de cuantizacion | no disponible (pesos publicados en `.pt`; el autor menciona pipelines INT8 como caso de uso, sin publicar variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (checkpoints de Ultralytics) |

## Arquitectura y entrenamiento

Las cuatro variantes son detectores YOLO de escala nano con *backbone* y *neck* convolucionales y una cabeza de detección de una sola clase. La entrada está fijada a 320×320 y el modelo se entrenó específicamente para esa resolución: el autor advierte que ejecutar los pesos a 640 hace caer el mAP50-95 de ~0,91 a 0,775. La única modificación respecto al modelo base es la sustitución de la activación SiLU por LeakyReLU(0,1) en toda la red; dataset, hiperparámetros, pesos iniciales y semilla se mantienen idénticos, lo que convierte el repositorio en un experimento controlado de una sola variable.

El conjunto de validación empleado tiene 5.797 imágenes y 6.146 cajas, con métrica AP interpolada a 101 puntos estilo COCO calculada en numpy. El autor señala que la columna de control (SiLU) de esta ejecución de ablation está 0,3-0,4 pp por debajo de las cifras publicadas en el repo del modelo SiLU original, lo que indica que no son la misma ejecución de entrenamiento; por tanto, las comparaciones deben hacerse dentro de esta tabla y no entre repositorios. Los parámetros, GFLOPs y tamaños se remidieron sobre los checkpoints publicados con `ultralytics 8.4.211`.

## Capacidades

- Detección de rostros en imágenes con una única clase de salida (cara), con cajas delimitadoras y puntuaciones de confianza.
- Entrada fija de 320×320, optimizada para rostros que ocupan una fracción grande del encuadre (rango de confort documentado: 13%-23% del área de la imagen).
- Cuatro arquitecturas intercambiables (YOLOv5n, YOLOv8n, YOLO11n, YOLO26n) con API común de Ultralytics.
- Inferencia en CPU y GPU mediante `ultralytics`, con script `inference.py` incluido y comando `yolo predict`.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de detección.
- No dispone de modo *thinking*, visión general, audio ni generación de texto.

## Casos de uso

- Control de acceso y tornos: el modelo detecta el rostro en capturas de cámara de proximidad donde la cara ocupa una fracción amplia del encuadre, justo el régimen para el que se entrenó a 320×320.
- Verificación de fotos de carné o documentos de identidad: con entrada 320 y rostros que cubren ~13%-23% del frame, las confianzas reportadas en las demos (0,92-0,96) son suficientes para validar que existe una cara bien encuadrada antes de pasarla a un pipeline de reconocimiento facial.
- Recorte automático de avatares y retratos: detección previa al *crop* en flujos de generación de miniaturas, donde el rostro domina la imagen y la latencia importa más que la precisión absoluta.
- Preprocesado en dispositivos con NPU o pipelines INT8 que no pueden evaluar `exp()`: este es el único escenario que el autor reconoce como justificación válida para usar LeakyReLU en lugar de SiLU.
- Filtrado de imágenes en datasets de entrenamiento: descartar o etiquetar automáticamente imágenes que contienen una cara grande y centrada antes de pasarlas a un modelo mayor.
- *Tiling* de imágenes grandes: dividir la imagen en teselas de 320×320 y ejecutar el detector en cada una para localizar rostros en escenas amplias, evitando el régimen de rostros diminutos donde el modelo rinde mal.
- Ablation de referencia para investigación: comparar el efecto de distintas activaciones (SiLU, ReLU, LeakyReLU) sobre un mismo backbone y dataset con control estricto de variables.

## Benchmarks y rendimiento

Resultados sobre el conjunto de validación del autor (5.797 imágenes / 6.146 cajas), `imgsz=320`, `conf=0.001`, AP interpolada a 101 puntos estilo COCO:

| Fichero | Parametros | GFLOPs | Tamano | mAP50 | mAP50-95 | Delta vs SiLU |
|---|---|---|---|---|---|---|
| `yolov5nu-face320-leaky.pt` | 2,636 M | 1,93 | 5,25 MB | 0,9879 | 0,9058 | −0,0040 |
| `yolov8n-face320-leaky.pt` | 3,138 M | 2,19 | 6,18 MB | 0,9874 | 0,9074 | −0,0025 |
| `yolo11n-face320-leaky.pt` | 2,605 M | 1,63 | 5,24 MB | 0,9869 | 0,9074 | −0,0020 |
| `yolo26n-face320-leaky.pt` | 2,534 M | 1,35 | 5,20 MB | 0,9869 | 0,9064 | −0,0037 |

Comparaciones de activación reportadas por el autor (bootstrap pareado de 1000 rondas):

| Comparacion | Delta mAP50-95 | Significancia | Latencia b32 |
|---|---|---|---|
| SiLU − LeakyReLU(0,1) | SiLU +0,28 pp | 3/4 arquitecturas significativas | sin diferencia |
| SiLU − ReLU | SiLU +0,41 pp | 4/4 significativas | sin diferencia |
| ReLU − LeakyReLU(0,1) | +0,12 pp | 0/4 significativas | sin diferencia |

La latencia se midió en una RTX 4090 en FP16, con el camino completo de `predict` (preprocesado, postprocesado y NMS), mediana de 7 ejecuciones; no se remidió al publicar este repositorio. No se han publicado resultados de benchmarks estándar (WIDER FACE, FDDB) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16 para cualquiera de las cuatro variantes (2,5-3,1 M de parámetros y 5-6 MB de pesos), aunque no se proporciona una cifra medida.
- GPU recomendadas: RTX 4090 (medición de latencia del autor); cualquier GPU consumer moderna es sobradamente suficiente dado el tamaño del modelo.
- Cabe en GPU consumer y en CPU: las demos se ejecutaron en CPU con `ultralytics 8.3.51`, y el modelo está pensado también para NPUs y pipelines INT8.
- Opciones de despliegue: `ultralytics` (Python API y CLI `yolo predict`), script `inference.py` incluido; exportación a otros formatos (ONNX, TensorRT, etc.) a través de Ultralytics, aunque no se documentan variantes publicadas.
- Latencia y throughput: sin diferencia medible entre activaciones en RTX 4090 (b1, b32 y b64 empatan); el autor concluye que la activación no es el cuello de botella en ese hardware. No se publican cifras absolutas de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | mAP50-95 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO-face-detection320-LeakyReLU (yolo11n) | 2,605 M | 320×320 | 0,9074 | AGPL-3.0 | Hugging Face |
| YOLO-face-detection320 (SiLU, baseline) | ~2,6-3,1 M | 320×320 | 0,9094-0,9101 (control de esta ablation) | AGPL-3.0 | Hugging Face |
| YOLO-face-detection320 (SiLU, cifras del repo original) | ~2,6-3,1 M | 320×320 | 0,9138-0,9147 | AGPL-3.0 | Hugging Face |
| Detector de rostros YOLO de propósito general a 640 | no disponible | 640×640 | no disponible | variable | no disponible |

La comparación relevante es contra el propio modelo base SiLU, que supera a esta variante en 0,20-0,40 pp de mAP50-95 según la arquitectura. No se dispone de datos de benchmarks de terceros (WIDER FACE, FDDB) para comparar con detectores de rostros especializados como RetinaFace o SCRFD.

## Limitaciones y advertencias

- La sustitución de SiLU por LeakyReLU empeora la precisión en las cuatro arquitecturas; el autor recomienda explícitamente no cambiar SiLU por esta variante salvo que el hardware objetivo no pueda evaluar `exp()`.
- En ese caso, el autor indica que ReLU simple es suficiente: LeakyReLU solo aporta +0,12 pp sobre ReLU con cero significancia estadística (0/4 arquitecturas).
- La entrada debe ser 320×320: ejecutar los pesos a 640 hace caer el mAP50-95 de ~0,91 a 0,775.
- Rendimiento pobre en rostros pequeños y lejanos: cajas de verdad por debajo del 0,4% del área del frame solo alcanzan ~0,73 de *recall*.
- Las cifras de esta tabla no son directamente comparables con las del repo SiLU original: la columna de control de esta ejecución está 0,3-0,4 pp por debajo, lo que indica ejecuciones de entrenamiento distintas.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el código que use el modelo en red, lo que puede ser restrictivo para uso comercial propietario.
- No se documentan sesgos demográficos ni evaluación de equidad; el conjunto de validación no está descrito en composición demográfica.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos: en las demos, `yolo26n` añade una caja espuria de baja confianza (0,16) en una de las cinco imágenes al bajar el umbral a `conf=0.10`.
- No se han publicado resultados en benchmarks estándar de detección de rostros, lo que dificulta la comparación con el estado del arte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/YOLO-face-detection320-LeakyReLU
- Modelo base SiLU: https://huggingface.co/wesjos/YOLO-face-detection320
- Repositorio Ultralytics: https://github.com/ultralytics/ultralytics
- Documentación de Ultralytics: https://docs.ultralytics.com/
- YOLO26: https://huggingface.co/Ultralytics/YOLO26
- YOLO11: https://huggingface.co/Ultralytics/YOLO11
- YOLOv8: https://huggingface.co/Ultralytics/YOLOv8
- YOLOv5: https://huggingface.co/Ultralytics/YOLOv5
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
