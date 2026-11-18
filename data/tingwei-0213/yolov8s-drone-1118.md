# Tingwei-0213/yolov8s-drone-1118

## Resumen

yolov8s-drone-1118 es un detector de objetos de una sola clase (`drone`) obtenido mediante fine-tuning del modelo preentrenado `yolov8s.pt` de Ultralytics. Lo publica el usuario Tingwei-0213 en Hugging Face como parte de un proyecto universitario de reconocimiento de patrones centrado en la deteccion de un cuadricoptero en escenas de exterior. Se distribuye como un unico checkpoint de pesos (`best1118.pt`) compatible con la libreria Ultralytics, no como un modelo de lenguaje ni como un sistema multimodal.

El modelo parte de la arquitectura YOLOv8 en su variante "s" (small), una red neuronal convolucional de deteccion en una sola etapa. El autor no documenta el numero exacto de parametros, aunque la variante YOLOv8s de Ultralytics se situa en el orden de los 11 millones. El entrenamiento se realizo con Ultralytics 8.4.x, a resolucion de entrada de 960 pixeles, 100 epocas y batch de 16, sobre un conjunto muy reducido de 684 imagenes (565 de entrenamiento y 119 de validacion) procedentes de dos videos de exterior y doce fotos de movil.

Su relevancia es limitada y de caracter experimental: el propio autor advierte que se trata de un modelo de proyecto de estudiante, que las etiquetas de entrenamiento son pseudo-etiquetas generadas automaticamente con Grounding DINO y que no ha sido validado contra verdad humana anotada. Resulta util como referencia practica de un flujo de trabajo de destilacion de etiquetas y fine-tuning de YOLOv8 para deteccion de UAV, pero no como componente de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8s (CNN de deteccion en una etapa, Ultralytics) |
| Parametros totales | no disponible (variante "s" de YOLOv8; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se publican pesos `.pt`; no se documentan exportaciones ONNX, TensorRT ni cuantizaciones INT8/FP16) |
| Idiomas soportados | no disponible (no es un modelo linguistico; las etiquetas son solo nombres de clase) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch `.pt` (checkpoint Ultralytics, fichero `best1118.pt`) |

## Arquitectura y entrenamiento

La arquitectura es YOLOv8 en variante small, una red convolucional de deteccion en una sola pasada con cabecera de prediccion anclada libremente (anchor-free), tal como la implementa la libreria Ultralytics. El autor no detalla la configuracion interna de la red, los bloques concretos ni el numero de parametros; unicamente indica que el punto de partida es `yolov8s.pt` y que el fine-tuning se realizo con Ultralytics 8.4.x, `imgsz=960`, 100 epocas, batch 16, semilla 0 y aumentacion por defecto.

El dato mas relevante del entrenamiento es la procedencia de las etiquetas. Las 684 imagenes (565 de entrenamiento y 119 de validacion) provienen de dos videos de exterior y doce fotos de movil, redimensionadas a 1920 pixeles de lado largo. Todas las cajas son pseudo-etiquetas automaticas generadas con Grounding DINO (variante base, dos prompts, con volteo horizontal, fusion de cajas y filtro de acuerdo) y solo fueron revisadas visualmente de forma puntual. Se eliminaron dos fotogramas con dron visible pero etiqueta vacia y no se incluyeron muestras negativas puras (fotogramas sin dron). La particion entre entrenamiento y validacion se hizo por bloques de fotogramas de las mismas sesiones de grabacion, de modo que la metrica de validacion no constituye una estimacion independiente. El mejor mAP50-95 de validacion fue 0.858 en la epoca 63, en una unica ejecucion.

## Capacidades

- Deteccion de objetos de una unica clase: localiza cuadricopteros en imagenes de exterior y devuelve cajas delimitadoras con puntuacion de confianza.
- Inferencia sobre imagen individual mediante la API de Ultralytics (`model.predict`), con resolucion de entrada configurable (el autor recomienda `imgsz=960` y `conf=0.22`).
- Integracion con el ecosistema Ultralytics: entrenamiento, validacion, exportacion y prediccion por lotes a traves de la misma libreria.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo "thinking": no es un modelo de lenguaje.
- No dispone de capacidades multilingues, de vision general, de audio ni de generacion de texto.
- No se documentan capacidades de seguimiento (tracking) multiobjeto, segmentacion ni deteccion de pose; solo deteccion de cajas.

## Casos de uso

- Prototipado academico de deteccion de UAV: sirve como punto de partida reproducible para practicas de fine-tuning de YOLOv8 con pseudo-etiquetado automatico, dado que el autor documenta el pipeline completo (Grounding DINO, fusion de cajas, filtro de acuerdo y entrenamiento).
- Deteccion en video de vigilancia aerea experimental: el modelo se entreno con fotogramas de 1920x1080 y el autor evalua sobre un video de 774x540, por lo que puede emplearse en experimentos de deteccion fotograma a fotograma en grabaciones de exterior con un solo tipo de dron.
- Generacion de candidatos para anotacion humana: sus detecciones a confianza baja (0.22) pueden usarse como preetiquetado en herramientas de anotacion, reduciendo el trabajo manual antes de una revision humana exhaustiva.
- Comparacion de estrategias de etiquetado: util como referencia para medir el impacto de anadir fotos de movil al conjunto de entrenamiento (el autor reporta una diferencia de F1 de +0.03, no significativa, frente a un modelo anterior).
- Docencia y demostracion de limitaciones de las pseudo-etiquetas: el modelo ilustra de forma concreta problemas como cajas mas altas que la referencia (1.4-1.5x en altura), falsos negativos con el dron en el suelo y validacion no independiente.
- Filtro preliminar en pipelines de vision por computador: puede emplearse como primera etapa de descarte en un sistema de analisis de video aereo, siempre que se acepte su recall limitado (0.63 en la evaluacion exploratoria del autor).

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| mAP50-95 (validacion) | 0.858 | Epoca 63, conjunto de validacion de la misma sesion, unica ejecucion |
| Precision | 0.79 | Video de 868 fotogramas (774x540), frente a pseudo-GT de Grounding DINO, IoU>=0.5, conf>=0.22 |
| Recall | 0.63 | Mismas condiciones |
| F1 | 0.70 | Mismas condiciones |
| F1 de modelo anterior sin fotos extra | 0.67 | Mismas condiciones; diferencia +0.03 (IC 95%: -0.05 a +0.09), no significativa |

No se han publicado resultados de benchmarks estandar (COCO, VisDrone u otros) en la informacion disponible. Todas las cifras proceden de evaluacion exploratoria contra pseudo-etiquetas, no contra verdad humana.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por la variante YOLOv8s y la resolucion de 960 pixeles, cabe holgadamente en GPUs de consumo, aunque el autor no publica mediciones.
- GPU recomendadas: no especificadas por el autor. Una GPU consumer moderna (por ejemplo, RTX 3060 o superior) es suficiente para inferencia a 960 pixeles; para reentrenamiento conviene una GPU con al menos 8-12 GB de VRAM por el batch de 16 a 960 pixeles.
- Cabe en GPU consumer: si, por el tamano de la variante "s"; no se aportan cifras concretas de VRAM.
- Opciones de despliegue: Ultralytics (PyTorch) es el unico formato publicado. No se documentan exportaciones a ONNX, TensorRT, OpenVINO ni formatos GGUF; tampoco integracion con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yolov8s-drone-1118 | no disponible (variante YOLOv8s) | Imagen, `imgsz` configurable (960 recomendado) | mAP50-95 0.858 en validacion propia; F1 0.70 frente a pseudo-GT | AGPL-3.0 | Hugging Face |
| YOLOv8s preentrenado (Ultralytics) | no disponible en la informacion | Imagen | No comparable: 80 clases COCO, no especializado en drones | AGPL-3.0 | Ultralytics / Hugging Face |
| Grounding DINO base | no disponible en la informacion | Imagen + prompt textual | No comparable directamente; se uso como generador de pseudo-etiquetas | no disponible en la informacion | Repositorio original |

No se dispone de datos de benchmarks comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a categoria, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo experimental de proyecto de estudiante: el autor indica explicitamente que no ha sido validado contra verdad humana anotada.
- Etiquetas de entrenamiento generadas automaticamente con Grounding DINO y solo revisadas a ojo; los errores del generador se propagan al detector.
- Validacion no independiente: la particion entre entrenamiento y validacion se hizo por bloques de fotogramas de las mismas sesiones de grabacion.
- Rendimiento debil cuando el dron esta posado en el suelo (sin detecciones por encima del umbral en un segmento de prueba).
- Cajas sistematicamente mas altas que la referencia (aproximadamente 1.4-1.5x en altura en un video de prueba).
- Generalizacion desconocida: solo se vio un modelo de dron, una ubicacion y unas pocas condiciones de iluminacion.
- Sin muestras negativas puras en el entrenamiento, lo que puede favorecer falsos positivos en escenas sin dron.
- No apto para uso en sistemas de seguridad critica.
- Licencia AGPL-3.0 heredada de Ultralytics YOLOv8: impone obligaciones de copyleft sobre el codigo derivado y su distribucion en red; revisar implicaciones antes de cualquier uso comercial.
- Sin datos publicados de sesgos, latencia, throughput ni cuantizaciones disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tingwei-0213/yolov8s-drone-1118
- Ultralytics (libreria y documentacion de YOLOv8): https://github.com/ultralytics/ultralytics
- Grounding DINO (generador de pseudo-etiquetas citado por el autor): https://github.com/IDEA-Research/GroundingDINO
