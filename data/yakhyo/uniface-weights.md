# yakhyo/uniface-weights

## Resumen

UniFace-weights es un repositorio espejo (mirror) de los pesos del proyecto UniFace, una librería de código abierto desarrollada por el usuario yakhyo que agrupa 67 modelos ONNX dedicados al análisis facial integral. El repositorio no contiene un modelo de lenguaje ni una red neuronal única, sino una colección de pesos especializados que cubren siete tareas distintas de visión por computador sobre rostros: detección facial, reconocimiento, landmarks faciales, segmentación (face parsing), estimación de mirada, estimación de pose de cabeza y anti-spoofing.

La relevancia de este repositorio radica en su función de agregador y espejo de pesos procedentes de múltiples proyectos upstream (InsightFace, MediaPipe, AdaFace, EdgeFace, MODNet, entre otros), normalizados bajo una nomenclatura interna y verificados por SHA256 en la descarga. La librería UniFace descarga primero desde GitHub Releases y recurre a este repositorio de Hugging Face como fallback cuando GitHub no está accesible, sin requerir token de autenticación.

Es importante subrayar que este repositorio no es un modelo generativo ni un LLM: no tiene parámetros totales únicos, ni longitud de contexto, ni capacidades de generación de texto. Se trata de un conjunto de artefactos de inferencia para pipelines de visión artificial. El tamaño del repositorio es de 3,7 GB y la licencia es mixta por modelo (mixed-per-model), con componentes permisivos, copyleft y de solo investigación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion heterogenea de redes CNN (RetinaFace, SCRFD, ArcFace, AdaFace, EdgeFace, MobileGaze, BiSeNet, MODNet, MiniFASNet, YOLOv5-Face, entre otras) |
| Parametros totales | no disponible (67 modelos independientes; el tamano varia por modelo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelos de vision, no de texto) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | mixed-per-model (permisiva MIT/Apache-2.0/BSD-3-Clause, GPL-3.0 y non-commercial research only segun el modelo) |
| Formato de pesos | ONNX (67 archivos, principalmente ONNX) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: es un contenedor de pesos de terceros. Cada familia de modelos tiene su propia arquitectura y su propio régimen de entrenamiento, documentado en el proyecto upstream correspondiente. Entre las familias incluidas figuran detectores faciales como RetinaFace (variantes MobileNet-0.25, MobileNet-0.50, MobileNet v1/v2, ResNet-18/34/50), CenterFace, BlazeFace y SCRFD (10G y 500M); reconocedores como ArcFace (MobileNet y ResNet), AdaFace (IR-18, IR-50, IR-101), HyperFace IR-50, AuraFace R100 y EdgeFace (XXS, XS gamma 0.6, S gamma 0.5, Base); modelos de landmarks como PIPNet (ResNet-18 con 68 y 98 puntos) y el modelo de 106 puntos de InsightFace; segmentación facial con BiSeNet (ResNet-18/34) y matting con MODNet (photographic y webcam); estimación de mirada con MobileGaze (ResNet-18/34/50, MobileNetV2, MobileOne-S0); estimación de pose de cabeza estilo 6DRepNet (ResNet-18/34/50, MobileNetV2, MobileNetV3 small/large); anti-spoofing con MiniFASNet v1se y v2; y evaluación de calidad de imagen facial con eDifFIQA (t, s, m, l).

La innovación técnica del repositorio no reside en el entrenamiento sino en la ingeniería de distribución: nomenclatura interna por clave de modelo (no por nombre de asset original), verificación SHA256 en la descarga, y mecanismo de fallback automático GitHub → Hugging Face. La nomenclatura interna es necesaria porque cinco basenames (`mobilenetv2.onnx`, `mobilenetv3_small.onnx`, `mobilenetv3_large.onnx`, `resnet18.onnx`, `resnet34.onnx`) aparecen en dos repositorios fuente distintos con pesos diferentes, de modo que un espejo keyed por nombre original no podría albergar los 67 modelos.

## Capacidades

- Deteccion facial en imagenes: RetinaFace, CenterFace, BlazeFace y SCRFD (10G y 500M).
- Reconocimiento facial (embedding e identidad): ArcFace, AdaFace, HyperFace, AuraFace y EdgeFace.
- Deteccion de landmarks faciales: PIPNet con 68 y 98 puntos, y modelo de 106 puntos de InsightFace.
- Segmentacion facial (face parsing): BiSeNet ResNet-18/34.
- Matting de retrato: MODNet en variantes photographic y webcam.
- Estimacion de mirada (gaze estimation): MobileGaze con backbones ResNet y MobileNet.
- Estimacion de pose de cabeza: modelos estilo 6DRepNet con backbones ResNet y MobileNet.
- Anti-spoofing / deteccion de vida: MiniFASNet v1se y v2.
- Evaluacion de calidad de imagen facial: eDifFIQA en cuatro tamanos (t, s, m, l).
- Atributos faciales: FaceAttribNet (procedente de Qualcomm AI Hub).
- Deteccion facial adicional: YOLOv5-Face (n, s, m).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades linguisticas: no es un modelo de lenguaje.

## Casos de uso

- Verificacion de identidad en onboarding digital: combinando un detector (RetinaFace o SCRFD) con un reconocedor (ArcFace o EdgeFace) y un modulo de anti-spoofing (MiniFASNet) se puede construir un pipeline de KYC que detecte el rostro, extraiga el embedding y compruebe que se trata de una persona real, todo con pesos ONNX ejecutables en CPU o GPU.
- Control de acceso fisico: un detector ligero (BlazeFace o SCRFD-500M) junto con un reconocedor EdgeFace o AdaFace permite autenticacion facial en tiempo real en dispositivos de borde, dado el reducido coste computacional de las variantes MobileNet.
- Analisis de atencion y comportamiento en video: MobileGaze y los modelos de pose de cabeza permiten estimar hacia donde mira un usuario, util en estudios de UX, conduccion o vigilancia de fatiga.
- Edicion y retoque fotografico: BiSeNet (face parsing) y MODNet (matting) permiten segmentar regiones faciales y recortar el retrato con precision para herramientas de edicion, filtros o generacion de avatares.
- Animacion de avatares y motion capture facial: los landmarks de PIPNet (68/98 puntos) y el modelo de 106 puntos permiten transferir expresiones faciales a un avatar o a un rig 3D.
- Moderacion de contenido y deteccion de deepfakes: el modulo de anti-spoofing (MiniFASNet) y la evaluacion de calidad (eDifFIQA) ayudan a filtrar imagenes sinteticas o de baja calidad en pipelines de moderacion.
- Analisis demografico agregado: el modelo Age/Gender de InsightFace permite estimar edad y genero (con las restricciones de licencia no comercial indicadas mas abajo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; al tratarse de 67 modelos ONNX independientes, cada uno tiene su propio perfil de memoria. Las variantes MobileNet/EdgeFace XXS son aptas para CPU y dispositivos de borde; las variantes ResNet-50/101 y AuraFace R100 requieren GPU para inferencia en tiempo real.
- GPU recomendadas: no especificadas por el autor. Por tamano de backbone, las variantes ResNet-18/34 caben en GPUs consumer (GTX 1660, RTX 3060, RTX 4090); las variantes ResNet-50/101 y AuraFace R100 se benefician de A100/H100 en escenarios de alto throughput.
- Cabe en GPU consumer: si, las variantes ligeras (MobileNet, EdgeFace XXS/XS, BlazeFace, SCRFD-500M) caben holgadamente; las variantes pesadas requieren al menos una GPU con varios GB de VRAM, aunque el autor no publica cifras exactas.
- Opciones de despliegue: ONNX Runtime (formato nativo), y por extension cualquier runtime compatible con ONNX (TensorRT, OpenVINO, DirectML). La libreria UniFace gestiona la descarga y verificacion automatica de pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo / proyecto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UniFace-weights (este repo) | Coleccion de 67 modelos ONNX de vision facial | no disponible (variable) | no aplica | Mixta por modelo | Hugging Face + GitHub Releases |
| InsightFace model zoo | Coleccion de modelos de reconocimiento y deteccion facial | variable | no aplica | Non-commercial research only | GitHub + descarga automatica |
| MediaPipe Face Mesh / BlazeFace | Modelos de deteccion y malla facial | variable (ligeros) | no aplica | Apache-2.0 | Google AI Edge |
| DeepFace (libreria) | Wrapper de multiples modelos de reconocimiento facial | variable | no aplica | MIT (libreria) | PyPI |

La comparativa es aproximada: UniFace se distingue por agregar en un unico repositorio pesos de multiples familias (deteccion, reconocimiento, landmarks, parsing, gaze, pose, anti-spoofing) con verificacion SHA256 y fallback automatico, mientras que InsightFace se centra en deteccion y reconocimiento, y MediaPipe en malla facial y deteccion ligera. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes; cualquier uso conversacional es inviable.
- Licencia mixta: los pesos de ArcFace, SCRFD, Age/Gender y 106-point landmarks proceden de InsightFace y son de solo investigacion no comercial; no deben usarse en productos comerciales.
- Componentes GPL-3.0: YOLOv5-Face y XSeg derivan de proyectos GPL-3.0, lo que impone obligaciones de distribucion sobre obras derivadas; la aplicabilidad de GPL a pesos de modelos es un tema juridico no resuelto.
- Riesgo de sesgo: los modelos de reconocimiento facial y de atributos (edad/genero) pueden presentar sesgos demograficos segun los datos de entrenamiento upstream, no documentados en este repositorio.
- Alucinacion: no aplica en el sentido linguistico, pero los modelos de estimacion (gaze, pose, edad) pueden producir predicciones erroneas con oclusiones, iluminacion adversa o rostros no frontales.
- Restricciones de contexto e idioma: no aplica; son modelos de vision.
- El repositorio es un espejo, no la fuente primaria: la disponibilidad y actualizacion dependen del proyecto UniFace en GitHub.
- Los nombres de archivo no coinciden con los assets originales; los usuarios deben consultar la tabla de licencias del README antes de usar cualquier peso en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yakhyo/uniface-weights
- Proyecto UniFace en GitHub: https://github.com/yakhyo/uniface
- Tabla de licencias del README: https://huggingface.co/yakhyo/uniface-weights/blob/main/README.md#licenses
- RetinaFace PyTorch (yakhyo): https://github.com/yakhyo/retinaface-pytorch
- CenterFace: https://github.com/Star-Clouds/CenterFace
- MediaPipe Face Mesh ONNX (yakhyo): https://github.com/yakhyo/mediapipe-face-mesh-onnx
- AdaFace: https://github.com/mk-minchul/AdaFace
- HyperFace ONNX (yakhyo): https://github.com/yakhyo/hyperface-onnx
- AuraFace v1 (fal): https://huggingface.co/fal/AuraFace-v1
- AuraFace ONNX (yakhyo): https://github.com/yakhyo/auraface-onnx
- EdgeFace (Idiap): https://github.com/otroshi/edgeface
- PIPNet: https://github.com/jhb86253817/PIPNet
- Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models
- Face Parsing (yakhyo): https://github.com/yakhyo/face-parsing
- MODNet: https://github.com/ZHKKKe/MODNet
- Silent-Face-Anti-Spoofing: https://github.com/minivision-ai/Silent-Face-Anti-Spoofing
- eDifFIQA: https://github.com/LSIbabnikz/eDifFIQA
- Gaze Estimation (yakhyo): https://github.com/yakhyo/gaze-estimation
- Head Pose Estimation (yakhyo): https://github.com/yakhyo/head-pose-estimation
- InsightFace: https://github.com/deepinsight/insightface
- YOLOv5-Face: https://github.com/deepcam-cn/yolov5-face
- DeepFaceLab (XSeg): https://github.com/iperov/DeepFaceLab
