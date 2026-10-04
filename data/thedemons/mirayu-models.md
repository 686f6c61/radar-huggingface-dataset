# thedemons/mirayu-models

## Resumen

Mirayu models es un repositorio de HuggingFace que agrupa los ficheros ONNX utilizados por Mirayu, una aplicacion de escritorio libre y de codigo abierto para el retoque de retratos por lotes. No es un modelo entrenado por su autor: el repositorio actua como espejo y catalogo de modelos de vision por computador de terceros, con los que la aplicacion ejecuta tareas como deteccion facial, reconocimiento facial, segmentacion de rostro, matting de retrato, estimacion de pose multi-persona e inpainting.

El repositorio lo mantiene el usuario thedemons y contiene siete carpetas, cada una correspondiente a un modelo distinto. Seis de ellos son copias sin modificar de ficheros publicados por sus autores originales, y uno (MediaPipe Face Landmarker) es una conversion de formato de TFLite a ONNX realizada por el propio proyecto. Cada carpeta conserva la licencia de su fuente original, de modo que la licencia del repositorio es "por modelo" y no una licencia unica.

Es relevante porque reune en un solo lugar, con hashes sha256 verificables y un manifesto de catalogo, un conjunto de modelos con licencias permisivas y sin permisivas (MIT, Apache-2.0, y pesos con restricciones de investigacion) que cubren buena parte del pipeline tipico de procesado facial y de retrato. La aplicacion comprueba cada fichero contra el sha256 de su catalogo antes de usarlo, lo que da trazabilidad de integridad. El tamano total del repositorio es de 0,4 GB. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion de modelos de vision por computador, no un unico modelo (redes de deteccion, segmentacion, pose, matting e inpainting; ver tabla inferior) |
| Parametros totales | no disponible (no se publican cifras por modelo en la model card) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelos de vision, sin ventana de contexto de texto) |
| Tipos de cuantizacion | FP32 en la mayoria de ONNX; MediaPipe Face Landmarker se convierte de float16 a float32; no se publican otras cuantizaciones |
| Idiomas soportados | no aplicable (procesamiento de imagen) |
| Licencia | por modelo (license: other / per-model); cada carpeta lleva la licencia de su fuente original |
| Formato de pesos | ONNX (mayoria), mas un fichero .task de MediaPipe y un .binarypb de metadatos de geometria |
| Libreria declarada | onnx |
| Pipeline declarado | image-segmentation |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-03 / 2026-10-03 |

Composicion del repositorio:

| Carpeta | Modelo | Tarea | Fuente original | Licencia | Cambio realizado |
|---|---|---|---|---|---|
| mediapipe-face-landmarker/ | MediaPipe Face Landmarker | Deteccion facial, malla de 478 puntos, blendshapes | Google | Apache-2.0 | TFLite convertido a ONNX |
| rtmo-m-body7/ | RTMO-m | Pose multi-persona, Body7, 17 keypoints COCO | OpenMMLab MMPose | Apache-2.0 (ver nota) | end2end.onnx extraido de un zip y renombrado |
| yunet-2023mar/ | YuNet | Deteccion facial | OpenCV Zoo | MIT | ninguno (espejo) |
| sface-2021dec/ | SFace | Reconocimiento facial | OpenCV Zoo | Apache-2.0 | ninguno (espejo) |
| bisenet-resnet18-celebamask/ | BiSeNet ResNet-18 | Parsing facial (CelebAMask-HQ, 19 clases) | yakhyo/face-parsing | codigo MIT; ver nota sobre pesos | renombrado a bisenet_resnet18.onnx |
| lama-carve-512/ | LaMa (big-lama) | Inpainting 512 x 512 | Carve/LaMa-ONNX, desde advimman/lama | Apache-2.0 | ninguno (espejo) |
| modnet-xenova/ | MODNet | Matting de retrato | Xenova/modnet, desde ZHKKKe/MODNet | Apache-2.0 | renombrado a modnet.onnx |

El repositorio incluye un fichero SHA256SUMS con el hash de cada modelo.

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. Cada carpeta contiene un artefacto ya entrenado por terceros. Las arquitecturas corresponden a familias conocidas de vision por computador: MediaPipe Face Landmarker combina un detector facial, un detector de puntos de referencia (malla de 478 puntos) y un modelo de blendshapes, todo ello empaquetado en un bundle .task con metadatos de geometria; RTMO-m es un modelo de estimacion de pose multi-persona en una sola etapa segun el articulo de Peng Lu et al.; YuNet es un detector facial ligero; SFace es un modelo de reconocimiento facial; BiSeNet ResNet-18 es una red de segmentacion semantica facial entrenada sobre CelebAMask-HQ con 19 clases; LaMa es una red de inpainting de 512 x 512; y MODNet es una red de matting de retrato.

La unica conversion de formato documentada es la de MediaPipe Face Landmarker. El bundle original contiene tres modelos TFLite (face_detector.tflite, face_landmarks_detector.tflite y face_blendshapes.tflite) mas un fichero geometry_pipeline_metadata_landmarks.binarypb copiado sin cambios. Cada TFLite se convirtio con tf2onnx a opset 17, manteniendo el layout NHWC y convirtiendo los pesos float16 a float32. El script empleado es convert_mediapipe.py, tambien presente en el repositorio de Mirayu bajo prototype/scripts/. Las herramientas y versiones registradas son Python 3.11.4, tensorflow-cpu 2.21.0, tf2onnx 1.17.0, onnx 1.23.1, onnxruntime 1.30.0, numpy 2.4.6 y protobuf 7.36.2. Los hashes sha256 documentados para el bundle y sus componentes son, respectivamente, 64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff, b4578f35940bf5a1a655214a1cce5cab13eba73c1297cd78e1a04c2380b0152f, c7d54204ce0448474c7f3fa9af494787c0965cbdd6f20fc72867e43046bd43d5, 4f36dded049db18d76048567439b2a7f58f1daabc00d78bfe8f3ad396a2d2082 y bdbcda96dfcb7da883da124aaa2c55dee49770d934f0fcc71747f8c21bdc75b4.

No se documentan en la informacion disponible los volumenes de datos de entrenamiento, la composicion exacta de los datasets ni si hubo etapas de ajuste fino con RLHF o DPO, ya que son modelos de vision y no de lenguaje. La model card remite a las fuentes originales para esos detalles.

## Capacidades

- Deteccion facial: YuNet, el detector de MediaPipe y otros componentes localizan rostros en imagenes.
- Puntos de referencia faciales: MediaPipe Face Landmarker produce una malla de 478 puntos.
- Blendshapes: MediaPipe Face Landmarker genera coeficientes de expresion facial, utiles para animacion y AR.
- Reconocimiento facial: SFace genera representaciones (embeddings) para comparar e identificar rostros.
- Parsing facial: BiSeNet ResNet-18 segmenta el rostro en 19 clases (piel, pelo, ojos, labios, etc.) sobre el esquema de CelebAMask-HQ.
- Matting de retrato: MODNet calcula la mascara alfa de primer plano para separar la persona del fondo con bordes finos.
- Estimacion de pose multi-persona: RTMO-m predice 17 keypoints en formato COCO para varias personas a la vez.
- Inpainting: LaMa rellena regiones enmascaradas en imagenes de 512 x 512.
- Compatibilidad de ejecucion: al ser ONNX, los modelos se pueden ejecutar con onnxruntime (version 1.30.0 usada en la conversion) y con otros runtimes compatibles con ONNX.
- No incluye capacidades de lenguaje, tool calling, agentes ni procesamiento de audio o video en tiempo real mas alla del fotograma a fotograma.

## Casos de uso

- Retoque de retratos por lotes: el flujo principal de Mirayu combina MODNet para aislar la persona, BiSeNet para separar piel, pelo y labios, y LaMa para eliminar imperfecciones o elementos no deseados, aplicando los ajustes de forma automatizada sobre muchas imagenes.
- Sustitucion de fondo en fotografia de estudio: MODNet calcula el canal alfa y BiSeNet refina los limites del pelo y los hombros, lo que permite recomponer sobre un fondo nuevo con bordes limpios.
- Eliminacion de objetos e imperfecciones: LaMa (512 x 512) rellena la region marcada por una mascara generada a partir del parsing facial, util para quitar marcas, cables o elementos de atrezzo.
- Anonimizacion de rostros en datasets: YuNet o MediaPipe detectan los rostros y SFace permite agrupar identidades antes de aplicar desenfoque o pixelado, util en pipelines de publicacion de imagenes con datos personales.
- Organizacion y catalogacion de fotos por persona: los embeddings de SFace permiten agrupar imagenes por identidad en un gestor fotografico sin etiquetado manual.
- Analisis de pose para deporte y fitness: RTMO-m extrae los 17 keypoints COCO de varias personas, lo que sirve para analizar posturas, movimiento o ergonomia.
- Animacion facial y filtros tipo AR: los blendshapes de MediaPipe Face Landmarker alimentan avatares o filtros que replican la expresion del usuario a partir de una sola imagen o de un flujo de captura.
- Preprocesado en pipelines de vision: al ser modelos ONNX pequenos, se pueden encadenar como etapas de deteccion, segmentacion y matting antes de un modelo mayor de generacion o clasificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de this repository no incluye metricas de precision, latencia ni throughput, y se limita a documentar la procedencia, las licencias, los hashes sha256 y el procedimiento de conversion a ONNX. Para cifras de rendimiento habria que consultar los articulos y repositorios originales de cada modelo (RTMO, YuNet, SFace, BiSeNet, LaMa y MODNet), que no forman parte de la informacion proporcionada.

## Requisitos de hardware

- Tamano agregado: el repositorio completo ocupa 0,4 GB, repartido entre siete modelos, por lo que el espacio en disco necesario es reducido.
- VRAM por modelo: no disponible. No se publican cifras de memoria por modelo en la model card. Como referencia de orden de magnitud, al tratarse de modelos ONNX de deteccion, segmentacion y matting, y dado el tamano total del repositorio, son candidatos a ejecutarse en GPUs de consumo con pocos gigabytes de VRAM, pero esta estimacion no esta confirmada por el autor.
- CPUs: al ejecutarse con onnxruntime, los modelos pueden correr en CPU, lo que encaja con una aplicacion de escritorio que no asume GPU dedicada.
- GPUs: no se especifican modelos recomendados (A100, H100, RTX 4090 u otros) en la informacion disponible.
- Opciones de despliegue: onnxruntime es el runtime implicito (version 1.30.0 usada en la conversion de MediaPipe). Al estar en formato ONNX, tambien son desplegables con runtimes compatibles sobre CPU, CUDA, DirectML, CoreML o TensorRT, aunque el autor no documenta configuraciones concretas.
- Latencia y throughput: no disponibles. Dependen del modelo, del hardware y del backend de ejecucion elegido.
- Precaucion: la aplicacion Mirayu verifica la integridad de cada fichero contra el sha256 de su catalogo antes de usarlo, por lo que cualquier despliegue propio deberia hacer lo mismo si se reutilizan estos artefactos.

## Comparativa con modelos similares

Comparativa de los componentes incluidos frente a alternativas de la misma categoria, en terminos de licencia y disponibilidad:

| Modelo | Tarea | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|
| YuNet (incluido) | Deteccion facial | MIT | HuggingFace OpenCV Zoo | Licencia permisiva, permite uso comercial |
| SFace (incluido) | Reconocimiento facial | Apache-2.0 | HuggingFace OpenCV Zoo | Alternativa permisiva a modelos con licencia restringida |
| ArcFace / SCRFD (no incluidos) | Deteccion y reconocimiento facial | solo investigacion no comercial | No redistribuibles | InsightFace; Mirayu los descarga desde sus publicadores y no los refleja en este repositorio |
| MediaPipe Face Landmarker (incluido) | Deteccion, landmarks y blendshapes | Apache-2.0 | Google | Cubre deteccion y expresion en un solo bundle |
| BiSeNet ResNet-18 (incluido) | Parsing facial (19 clases) | codigo MIT; pesos sobre CelebAMask-HQ | yakhyo/face-parsing | Los pesos heredan restricciones de uso del dataset |
| LaMa (incluido) | Inpainting 512 x 512 | Apache-2.0 | Carve/LaMa-ONNX, advimman/lama | ONNX exportado por Carve |
| MODNet (incluido) | Matting de retrato | Apache-2.0 | Xenova/modnet, ZHKKKe/MODNet | ONNX exportado por Xenova |

Comparativa de este repositorio frente a las fuentes individuales:

| Aspecto | mirayu-models | Repositorios originales por separado |
|---|---|---|
| Agrupacion | Siete modelos en un unico repositorio | Un repositorio por modelo |
| Integridad | SHA256SUMS y catalogo con sha256 por fichero | Depende de cada proyecto |
| Licencia | Por modelo, con notas explicitas | La de cada proyecto |
| Conversiones | MediaPipe TFLite a ONNX documentado | No aplica |
| Modelos con licencia restrictiva | Excluidos (por ejemplo, ArcFace y SCRFD) | Publicados bajo sus propias condiciones |

No se dispone de datos de benchmarks que permitan comparar la precision de estos modelos entre si dentro de la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no entrena modelos: solo refleja o convierte artefactos de terceros, por lo que la calidad y los sesgos dependen de cada fuente original.
- Licencia por modelo: no existe una licencia unica. Cada carpeta se rige por la licencia de su origen, y la del repositorio (license: other / per-model) no sustituye a las de los modelos.
- BiSeNet ResNet-18: el codigo y la exportacion ONNX son MIT, pero los pesos se entrenaron sobre CelebAMask-HQ, cuyas imagenes son para uso no comercial, de investigacion y educativo. Conviene revisar si eso restringe el uso de las salidas del modelo.
- RTMO Body7: el codigo y los pesos son Apache-2.0, pero el conjunto de entrenamiento Body7 combina COCO, AI Challenger, CrowdPose, MPII, sub-JHMDB, Halpe y PoseTrack18, algunos de ellos solo para investigacion, por lo que el uso comercial de las salidas no esta claro.
- ArcFace y SCRFD de InsightFace se usan en Mirayu pero no se reflejan aqui, porque su licencia es solo para investigacion no comercial y no permite redistribucion clara.
- La informacion disponible no incluye datos sobre sesgos demograficos, robustez ante condiciones de iluminacion, oclusiones o angulos extremos.
- Al ser modelos de vision, no manejan idioma ni contexto de texto; por tanto, no aplican riesgos de alucinacion textual, pero si posibles errores de deteccion o segmentacion (falsos positivos o mascaras imperfectas).
- La model card esta truncada en la informacion proporcionada justo en el bloque de reproduccion de la conversion de MediaPipe, por lo que los pasos finales de ese procedimiento no estan disponibles.
- El repositorio registra 0 descargas y 0 likes, y la fecha de creacion y actualizacion coincide (2026-10-03), lo que sugiere que puede ser un proyecto reciente y con poca validacion externa.
- Si se reutilizan los artefactos, conviene verificar los sha256 frente al fichero SHA256SUMS o al manifiesto del catalogo para descartar alteraciones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/thedemons/mirayu-models
- Notas de licencia: https://huggingface.co/thedemons/mirayu-models/blob/main/README.md#licence-notes
- Aplicacion Mirayu: https://github.com/thedemons/Mirayu
- Catalogo de modelos de Mirayu: https://github.com/thedemons/Mirayu/tree/main/catalog/models
- MediaPipe Face Landmarker (Google): https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task
- RTMO (OpenMMLab MMPose), paquete ONNX SDK: https://download.openmmlab.com/mmpose/v1/projects/rtmo/onnx_sdk/rtmo-m_16xb16-600e_body7-640x640-39e78cc4_20231211.zip
- YuNet (OpenCV Zoo): https://huggingface.co/opencv/face_detection_yunet
- SFace (OpenCV Zoo): https://huggingface.co/opencv/face_recognition_sface
- BiSeNet face parsing (yakhyo/face-parsing), pesos: https://github.com/yakhyo/face-parsing/releases/tag/weights
- LaMa ONNX (Carve): https://huggingface.co/Carve/LaMa-ONNX
- LaMa original (advimman/lama): https://github.com/advimman/lama
- MODNet ONNX (Xenova): https://huggingface.co/Xenova/modnet
- MODNet original (ZHKKKe/MODNet): https://github.com/ZHKKKe/MODNet
- CelebAMask-HQ: https://github.com/switchablenorms/CelebAMask-HQ
