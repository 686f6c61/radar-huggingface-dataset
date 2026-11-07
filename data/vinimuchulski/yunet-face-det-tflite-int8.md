# vinimuchulski/yunet-face-det-tflite-int8

## Resumen

YuNet es un detector de caras ligero originalmente publicado por Shiqi Yu y colaboradores, pensado para inferencia en tiempo real en dispositivos con recursos limitados. Este repositorio concreto, `vinimuchulski/yunet-face-det-tflite-int8`, no contiene un modelo entrenado desde cero, sino una exportacion y cuantizacion completa a INT8 del SavedModel original de YuNet distribuido por el proyecto PINTO_model_zoo (carpeta 144_YuNet). El autor anade el script de cuantizacion, el modelo `.tflite` resultante y un script de inferencia en Python para PC con preprocesado, post-procesado, NMS y visualizacion.

El modelo resuelve deteccion de caras y cinco puntos clave faciales (dos ojos, nariz y dos comisuras de la boca) sobre entradas de 160x120 pixeles en formato NHWC y RGB. La salida son 1076 anclas con dos clases (`conf`), 14 valores de localizacion (`loc`: caja mas keypoints) y un valor de IoU (`iou`). Al estar cuantizado completamente a INT8, el peso del fichero es minimo y los operadores convolucionales se ejecutan en aritmetica entera, lo que lo hace apto para microcontroladores, SBCs y moviles.

Es relevante ahora porque el ecosistema TFLite Micro y los aceleradores NPU de bajo coste siguen demandando detectores faciales de menos de un megavatio de computo por frame. Este repositorio empaqueta el modelo en un formato directamente desplegable en el runtime TFLite, con scripts reproducibles para recalibrar si se cambia la resolucion de entrada. La licencia no esta declarada en la model card, lo que supone una limitacion importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN ligera tipo YuNet (backbone con convoluciones y depthwise convolutions, cabeza multitarea de deteccion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | INT8 full-integer (post-training quantization con calibracion sobre 500 imagenes de WIDER_val) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | TFLite (`.tflite`), SavedModel de origen |

Especificaciones adicionales del tensor de entrada y salida:

| Tensor | Shape | Tipo | Scale | Zero-point |
|---|---|---|---|---|
| Input (NHWC, RGB) | `[1, 120, 160, 3]` | uint8 | 1.0 | 0 |
| `conf` | `[1076, 2]` | uint8 | 0.00390625 | 0 |
| `loc` | `[1076, 14]` | uint8 | 0.08464598 | 130 |
| `iou` | `[1076, 1]` | uint8 | 0.08464598 | 130 |

## Arquitectura y entrenamiento

La arquitectura es una CNN compacta de deteccion de caras con backbone convolucional y ramas separadas para clasificacion, regresion de cajas y regresion de keypoints. El grafo TFLite incluye los operadores `QUANTIZE`, `PAD`, `CONV_2D`, `DEPTHWISE_CONV_2D`, `MAX_POOL_2D`, `RESHAPE`, `CONCATENATION`, `SLICE` y `SOFTMAX`, con todas las convoluciones en INT8. El detector produce 1076 anclas sobre la rejilla de caracteristicas, cada una con dos puntuaciones de clase, 14 valores de localizacion (4 para la caja y 10 para los cinco keypoints) y un valor de IoU para el filtrado previo.

No se dispone de informacion sobre el dataset de entrenamiento original ni sobre el numero de tokens o imagenes, ya que la model card solo documenta el proceso de cuantizacion. El autor indica que el SavedModel local es identico al paquete `resources.tar.gz` del proyecto PINTO_model_zoo/144_YuNet, y que la cuantizacion se realiza leyendo 500 imagenes de `WIDER_val` para calibrar los rangos de activacion. No se menciona RLHF, DPO ni tecnicas de alineacion, algo esperable en un detector de vision.

La innovacion tecnica destacable es la cuantizacion full-integer con calibracion sobre un subconjunto de validacion de WIDER Face, que permite ejecutar el modelo en runtime TFLite sin operaciones en coma flotante. El script `quantize_full_int8.py` es reproducible y regenera el `.tflite` a partir del SavedModel y del dataset de calibracion.

## Capacidades

- Deteccion de caras en imagenes RGB con entrada fija de 160x120 pixeles.
- Prediccion de cinco keypoints faciales por cara: dos ojos, nariz y dos comisuras de la boca.
- Salida con puntuaciones de confianza por ancla y valor de IoU para filtrado.
- Post-procesado incluido en el script de inferencia: decodificacion de cajas, NMS y visualizacion con Matplotlib.
- Ejecucion en runtime TFLite con operadores INT8, apta para CPU, GPU delegada y aceleradores compatibles.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente perceptivo.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Desbloqueo facial en dispositivos embebidos: el modelo cabe en microcontroladores con NPU o en SBCs tipo Raspberry Pi y permite deteccion en tiempo real a 160x120, suficiente para localizar la cara antes de un pipeline de reconocimiento.
- Preprocesado en pipelines de analitica de video: se puede encadenar con un modelo de reconocimiento facial o de estimacion de pose para recortar y alinear caras antes de pasarlas a etapas mas costosas.
- Control de acceso en kioscos y tornos: la deteccion de cinco keypoints permite verificar que el usuario mira a camara y estimar pose de cabeza antes de autenticar.
- Aplicaciones moviles de fotografia: deteccion en tiempo real para encuadre, enfoque automatico o aplicacion de filtros sobre la region facial.
- Telemetria de presencia en aulas o salas: conteo de asistentes sin identificacion, usando solo la deteccion de caras y el NMS del script incluido.
- Prototipado rapido en TFLite: el repositorio incluye el script de cuantizacion y el de inferencia, lo que permite recalibrar el modelo con otro dataset o resolucion y validar el resultado en PC antes de portarlo a dispositivo.
- Sistemas de videovigilancia con privacidad por diseno: al no identificar personas, solo localizar caras, sirve para anonimizar rostros en grabaciones antes de su publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de mAP, latencia ni precision sobre WIDER Face u otros conjuntos, ni comparaciones con otros detectores.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo es un `.tflite` INT8 de muy pocos megabytes que se ejecuta en CPU o en aceleradores embebidos.
- GPU recomendadas: no requiere GPU dedicada. Puede ejecutarse en CPU de PC, en GPU integradas, en Raspberry Pi, en moviles Android/iOS y en microcontroladores con soporte TFLite Micro o NPU compatible.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) y en la mayoria de SBCs; el cuello de botella es el runtime TFLite, no la memoria.
- Opciones de despliegue: runtime TFLite de Python (`tflite-runtime` o `tensorflow`), TFLite Micro para microcontroladores, delegados GPU/NNAPI/Core ML, y wrappers como `tflite-support`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Keypoints | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `vinimuchulski/yunet-face-det-tflite-int8` | no disponible | 160x120 RGB | 5 | INT8 full-integer (TFLite) | no disponible | Hugging Face (repo propio) |
| `STMicroelectronics/yunet` | no disponible | no disponible | 5 | INT8 (ONNX QDQ) | no disponible | Hugging Face |
| YuNet original (PINTO_model_zoo/144_YuNet) | no disponible | 160x120 | 5 | FP32 y variantes | no disponible | GitHub / S3 |

La comparativa se limita a variantes del mismo modelo base, ya que no se han proporcionado datos de detectores alternativos como RetinaFace, SCRFD o BlazeFace. No se dispone de metricas para comparar precision ni latencia entre estas variantes.

## Limitaciones y advertencias

- La licencia no esta declarada en la model card ni en los metadatos de Hugging Face; no se puede asumir uso comercial sin consultar al autor y al proyecto de origen.
- La calibracion se realizo exclusivamente sobre 500 imagenes de WIDER_val, que no se incluyen en el repositorio; reproducir la cuantizacion requiere descargar el dataset por separado.
- El modelo esta calibrado para 160x120; cambiar la resolucion exige recalibrar y revalidar, segun advierte el propio autor.
- Es un detector de caras, no un reconocedor de identidad: no distingue personas y no debe usarse para identificacion.
- Riesgo de falsos positivos y negativos en condiciones de oclusion, iluminacion extrema o caras muy pequenas, comun en detectores ligeros; no se han publicado curvas de precision-recall.
- No se documentan sesgos demograficos ni evaluaciones de equidad; los detectores faciales entrenados sobre WIDER Face suelen mostrar sesgos de rendimiento por tono de piel, edad y genero.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano reportado es de 0.0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o que el conteo es impreciso.
- No apto para tareas de generacion, razonamiento ni procesamiento de lenguaje; cualquier uso en esos ambitos seria un error de aplicacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vinimuchulski/yunet-face-det-tflite-int8
- Proyecto de origen PINTO_model_zoo/144_YuNet: https://github.com/PINTO0309/PINTO_model_zoo/tree/main/144_YuNet
- Paquete de recursos original: https://s3.ap-northeast-2.wasabisys.com/pinto-model-zoo/144_YuNet/resources.tar.gz
- Variante YuNet de STMicroelectronics en Hugging Face: https://huggingface.co/STMicroelectronics/yunet
- YuNet en STM32 AI Model Zoo: https://github.com/STMicroelectronics/stm32ai-modelzoo/tree/main/face_detection/yunet
