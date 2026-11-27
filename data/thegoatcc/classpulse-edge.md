# thegoatcc/classpulse-edge

## Resumen

ClassPulse Edge es un sistema modular de analitica de aula y gestion de asistencia orientado a despliegue en el borde (edge computing), publicado por el usuario thegoatcc en Hugging Face. No se trata de un modelo de lenguaje, sino de un conjunto de pesos y artefactos de vision por computador empaquetados bajo la libreria Ultralytics: detectores YOLOv8, modelos de reconocimiento facial YuNet y SFace, estimacion de pose de cabeza 6DRepNet y deteccion de landmarks faciales de MediaPipe, ademas de pesos compilados en formato HEF para aceleradores Hailo-8/8L.

El sistema resuelve el problema de la monitorizacion de presencia y atencion en entornos educativos con un enfoque declarado de privacidad: el reconocimiento biometrico se realiza contra embeddings almacenados localmente, sin envio a la nube, y las pruebas de comportamiento se guardan como clips acotados. Incluye un panel en vivo construido con FastAPI.

Su relevancia es acotada: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, el tamano del repo es de 0,1 GB y no se publican resultados de benchmarks ni detalles de entrenamiento de los pesos incluidos. Es un proyecto aplicado que integra modelos de terceros (Ultralytics, OpenCV Zoo, MediaPipe) en un pipeline de analitica de aula, no un modelo entrenado desde cero por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de vision por computador: YOLOv8 (deteccion y pose), YuNet + SFace (reconocimiento facial), 6DRepNet (pose de cabeza), MediaPipe Face Landmarker; pesos HEF para Hailo-8/8L |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch `.pt`, ONNX y HEF compilados) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.pt` (Ultralytics), `.onnx`, `.task` (MediaPipe), `.hef` (Hailo) |

## Arquitectura y entrenamiento

El repositorio no define un modelo unico, sino una orquestacion de varios componentes de vision. La deteccion y el seguimiento de personas y poses se apoyan en `yolov8n.pt` y `yolov8n-pose.pt`; la deteccion de humo usa `smoking_yolov8.pt`. El reconocimiento facial combina `face_detection_yunet_2023mar.onnx` con `face_recognition_sface_2021dec.onnx`, aplicando similitud coseno con umbral >= 0,45 y consenso de 2 fotogramas, con un bucle de reintento de 15 fotogramas / 2 minutos para pistas no reconocidas. La atencion se estima con `head_pose_6drepnet.onnx` y `face_landmarker.task`. Para Raspberry Pi 5 con Hailo-8/8L se incluyen `yolov8n_classroom.hef`, `yolov8s_pose.hef`, `scrfd_10g.hef` y `arcface_mobilefacenet.hef`.

No se proporciona informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes, ni sobre procesos de ajuste fino o RLHF. Los modelos base son pesos publicos de Ultralytics, OpenCV Zoo y MediaPipe; el autor no documenta entrenamiento propio salvo el artefacto `smoking_yolov8.pt`, del que no se detallan datos ni metricas. La innovacion tecnica destacable es la integracion de un pipeline de privacidad local con clips de prueba acotados (5 s para uso de movil, <= 7 s para consumo) y la compilacion a HEF para aceleracion en el borde.

## Capacidades

- Deteccion y seguimiento de personas en el aula mediante YOLOv8.
- Estimacion de pose corporal con `yolov8n-pose.pt` y `yolov8s_pose.hef`.
- Reconocimiento facial biometrico local con YuNet + SFace y umbral de similitud coseno >= 0,45.
- Gestion de asistencia con bucle de reintento de 15 fotogramas / 2 minutos para rostros no reconocidos.
- Analisis de atencion en tiempo real mediante pose de cabeza (6DRepNet) y landmarks faciales (MediaPipe).
- Deteccion de comportamiento: uso de movil con umbral de 10 segundos y contabilizacion acumulada.
- Deteccion de consumo (humo o bebida) con grabacion de clips acotados de prueba.
- Panel en vivo con FastAPI para visualizacion de metricas.
- Despliegue en Raspberry Pi 5 con acelerador Hailo-8/8L o en PC con CPU/GPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Control de asistencia en aulas: el pipeline YuNet + SFace compara embeddings locales con umbral 0,45 y consenso de 2 fotogramas, lo que permite registrar presencia sin enviar datos biometricos a la nube.
- Monitorizacion de atencion en clase: la combinacion de 6DRepNet y MediaPipe Face Landmarker calcula porcentajes de atencion por alumno y temporizadores en vivo, util para informes docentes.
- Deteccion de uso de movil: el sistema marca retenciones superiores a 10 segundos y guarda un clip de 5 segundos reproducible en navegador, adecuado para revision posterior por el profesorado.
- Revision de comportamientos de consumo: la deteccion se activa solo ante humo o bebida visibles y guarda clips de hasta 7 segundos, lo que limita la captura indiscriminada.
- Despliegue en aulas sin infraestructura cloud: los pesos HEF permiten ejecutar el pipeline en Raspberry Pi 5 con Hailo-8/8L, reduciendo coste y dependencia de red.
- Prototipado de analitica de aula en PC: con los pesos `.pt` y `.onnx` se puede validar el sistema en CPU/GPU antes de compilar a HEF.
- Integracion en paneles de gestion educativa: el panel FastAPI en vivo puede servir como base para dashboards internos de centro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; los modelos YOLOv8n son ligeros y caben en GPU consumer, pero no se publican cifras.
- GPU recomendadas: no disponible; el autor menciona PC con CPU/GPU y Raspberry Pi 5 con Hailo-8/8L.
- Cabe en GPU consumer: probablemente si, al emplear variantes `yolov8n`, aunque no se confirma con mediciones.
- Opciones de despliegue: Ultralytics (PyTorch), ONNX Runtime, MediaPipe, HailoRT para los `.hef`, y FastAPI para el panel.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClassPulse Edge | Pipeline de vision para aula | no disponible | no aplica | MIT | Hugging Face |
| YOLOv8n (Ultralytics) | Detector de objetos | no disponible en la informacion | no aplica | AGPL-3.0 / comercial | GitHub, docs |
| YuNet + SFace (OpenCV Zoo) | Deteccion y reconocimiento facial | no disponible en la informacion | no aplica | no disponible en la informacion | OpenCV Zoo |
| MediaPipe Face Landmarker | Landmarks faciales | no disponible en la informacion | no aplica | Apache 2.0 (segun Google) | Google AI Edge |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no ofrece generacion de texto, razonamiento, codigo ni tool calling.
- Ausencia total de benchmarks, metricas de precision y detalles de entrenamiento; no se puede evaluar su calidad objetiva.
- El reconocimiento facial biometrico implica riesgos legales y eticos (RGPD, consentimiento, datos de menores) que el autor no aborda en la model card.
- El umbral de similitud coseno de 0,45 y el consenso de 2 fotogramas pueden producir falsos positivos o negativos segun iluminacion y angulo.
- Los clips de prueba de comportamiento pueden captar a personas no implicadas; requiere politicas claras de retencion y acceso.
- Repositorio con 0 descargas y 1 like: sin validacion por la comunidad ni mantenimiento demostrado.
- Licencia MIT declarada, pero los pesos de terceros incluidos (Ultralytics YOLOv8) pueden estar sujetos a AGPL-3.0, lo que condiciona el uso comercial.
- No se documentan sesgos demograficos del reconocimiento facial ni cobertura de diversidad en los datos.
- La busqueda web no aporto informacion adicional relevante sobre el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/thegoatcc/classpulse-edge
- Ultralytics YOLOv8: https://github.com/ultralytics/ultralytics
- OpenCV Zoo (YuNet, SFace): https://github.com/opencv/opencv_zoo
- MediaPipe Face Landmarker: https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker
- 6DRepNet: https://github.com/thohemp/6DRepNet
- Hailo: https://hailo.ai/
