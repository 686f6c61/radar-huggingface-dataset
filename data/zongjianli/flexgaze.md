# ZongjianLi/FlexGaze

## Resumen

FlexGaze es una familia de estimadores de mirada 3D desarrollada por Zongjian Li y Mohammad Soleymani (IHP Lab, University of Southern California) y presentada en el articulo arXiv 2611.30012. El modelo predice la direccion de la mirada a partir unicamente de un recorte de la cabeza, sin necesidad de deteccion facial, landmarks ni estimacion de pose de cabeza, y es capaz de manejar vistas de perfil y traseras. Se distribuye en dos tamanos: FlexGaze-S (21,8 M de parametros, backbone ViT-S/16) y FlexGaze-B (86,0 M de parametros, backbone ViT-B/16), ambos inicializados desde DINOv3.

La innovacion principal es el enfoque de supervision debil a gran escala: los autores generaron automaticamente unos 3,24 millones de etiquetas de mirada sobre imagenes in-the-wild de 17 datasets publicos, usando modelos off-the-shelf (YOLOv5m para deteccion de cabeza, PaGE para objetivos de mirada, UniDepthV2 para profundidad metrica e intrinsecos de camara y 3DDFA-V3 para pose de cabeza). Posteriormente, los modelos se afinan sobre ocho datasets de mirada publicos.

Es relevante porque reduce la dependencia de pipelines faciales complejos y de datos anotados manualmente, y porque su empaquetado en ONNX (opset 17, float32) facilita el despliegue en produccion. El repositorio incluye 75 modelos en formato safetensors (todas las semillas y etapas de entrenamiento) y seis exportaciones ONNX listas para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con backbone DINOv3, prediccion de mirada 3D con distribucion von Mises-Fisher |
| Parametros totales | 21,8 M (FlexGaze-S) / 86,0 M (FlexGaze-B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible (solo se publican pesos float32 en ONNX y safetensors) |
| Idiomas soportados | no aplica (modelo de vision, no linguistico) |
| Licencia | USC Research License, sujeta ademas a DINOv3 License y a los terminos de cada dataset de entrenamiento |
| Formato de pesos | safetensors (PyTorch) y ONNX (opset 17, float32) |

## Arquitectura y entrenamiento

FlexGaze emplea un Vision Transformer como extractor de caracteristicas, inicializado desde los checkpoints DINOv3 de timm (`vit_small_patch16_dinov3.lvd1689m` y `vit_base_patch16_dinov3.lvd1689m`) y afinado para la tarea de estimacion de mirada. La entrada es un recorte de cabeza RGB de 224x224 pixeles en valores 0-255, y la salida consta de dos cabezas: una direccion de mirada 3D unitaria (`gaze_direction`, float32, forma [N, 3]) y un parametro de concentracion `kappa` (float32, forma [N]) que actua como medida de confianza bajo una distribucion von Mises-Fisher.

El entrenamiento se realiza en dos etapas. Primero, un preentrenamiento sobre aproximadamente 3,24 millones de etiquetas de mirada generadas automaticamente a partir de imagenes de 17 datasets publicos (Open Images V7, IMDB-WIKI, GazeFollow, LAGENDA, ExpW, WIDER FACE, GAF 3.0, Flickr30k, VideoAttentionTarget, MPII Human Pose, FFHQ, FairFace, CelebA, HECO, MERL-RAV, LaPa y Menpo2D). Despues, un afinado conjunto sobre ocho datasets de mirada con anotaciones reales: Gaze360, ETH-XGaze, GazeCapture, MPIIFaceGaze, EYEDIAP, RT-GENE, Columbia y GFIE. Se publican tres semillas de entrenamiento (`seed0`, `seed1`, `seed2`) para cada configuracion, lo que permite evaluar la variabilidad del proceso.

Una particularidad tecnica importante es que el recorte de entrada no se obtiene redimensionando la caja de cabeza, sino recortando la imagen original con los intrinsecos de camara; la direccion de mirada devuelta esta en el sistema de referencia de ese recorte y debe rotarse de vuelta al sistema de la camara. El repositorio `minimal-inference` implementa ambos pasos, y la normalizacion de pixeles esta integrada en los grafos ONNX.

## Capacidades

- Estimacion de direccion de mirada 3D a partir de un unico recorte de cabeza, sin deteccion facial, landmarks ni pose de cabeza.
- Manejo de vistas de perfil y traseras, lo que amplia el rango de escenarios respecto a estimadores que asumen frontalidad.
- Salida de confianza calibrada mediante el parametro `kappa` de la distribucion von Mises-Fisher.
- Funcionamiento con intrinsecos de camara conocidos, lo que permite integracion geometrica precisa en pipelines de vision.
- Exportacion ONNX (opset 17, float32) con normalizacion de pixeles incluida en el grafo.
- Disponibilidad de 75 checkpoints en safetensors (dos tamanos, tres semillas y etapas `pretrain` y `8set`) para experimentacion.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades linguisticas: es un modelo puramente visual.

## Casos de uso

- Analisis de atencion en estudios de usabilidad: el modelo permite estimar hacia donde mira un usuario en grabaciones de camara, incluso en angulos laterales o de espaldas, sin necesidad de un pipeline facial completo; util para analizar atencion a pantallas, carteles o productos.
- Sistemas de conduccion asistida y monitorizacion de conductor: la capacidad de manejar vistas de perfil y la salida de confianza `kappa` permiten detectar distracciones o somnolencia en tiempo real a partir de recortes de cabeza con intrinsecos de camara conocidos.
- Investigacion en psicologia y ciencias cognitivas: la generacion de etiquetas a gran escala y la disponibilidad de multiples semillas facilitan experimentos reproducibles sobre atencion social y seguimiento de mirada en imagenes in-the-wild.
- Analisis de interaccion social en video: con soporte para datasets como VideoAttentionTarget, el modelo puede aplicarse a la estimacion de a quien mira una persona en escenas multitudinarias, util en estudios de comportamiento y marketing.
- Robótica social y avatares: la direccion de mirada 3D en el marco de la camara permite que un agente robotico infiera el foco de atencion de un interlocutor y module su comportamiento (contacto visual, turnos de palabra).
- Indexado y analitica de contenido audiovisual: procesar grandes volumenes de imagenes o video para etiquetar direccion de mirada de las personas retratadas, con despliegue ONNX en CPU o GPU y sin dependencia de frameworks de deteccion facial.
- Prototipado rapido en entornos embebidos: los modelos FlexGaze-S (90 MB en ONNX) pueden desplegarse en dispositivos con recursos limitados para pruebas de concepto de seguimiento de mirada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: FlexGaze-S en ONNX float32 ocupa 90 MB y FlexGaze-B 347 MB; con overhead de runtime, la inferencia cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; para lotes grandes se recomiendan A100, H100 o RTX 4090, aunque el modelo es lo bastante pequeno para GPUs de gama media (RTX 3060, RTX 4060) e incluso para CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer actual; tambien es viable en CPU para inferencia por lotes moderados.
- Opciones de despliegue: ONNX Runtime (formato publicado), y conversion a otros runtimes (TensorRT, OpenVINO) a partir del ONNX; los pesos safetensors permiten usar PyTorch directamente.
- Latencia y throughput estimados: no disponible (no se publican mediciones en la informacion proporcionada).

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlexGaze-S | 21,8 M | Recorte de cabeza 224x224 + intrinsecos | Direccion 3D + kappa | USC Research License | Hugging Face (ONNX y safetensors) |
| FlexGaze-B | 86,0 M | Recorte de cabeza 224x224 + intrinsecos | Direccion 3D + kappa | USC Research License | Hugging Face (ONNX y safetensors) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos sobre otros estimadores de mirada 3D comparables (por ejemplo, variantes de Gaze360 o ETH-XGaze) que permitan una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- Requiere conocer los intrinsecos de camara y una caja de cabeza para generar el recorte; no funciona sobre imagenes sin esos metadatos.
- La direccion de mirada se devuelve en el sistema de referencia del recorte y debe rotarse al sistema de la camara; un error en esa transformacion invalida la prediccion.
- El modelo se entrena con etiquetas generadas automaticamente por otros modelos (YOLOv5m, PaGE, UniDepthV2, 3DDFA-V3), por lo que hereda sus sesgos y errores sistematicos.
- Riesgo de sesgo demografico: los datasets de entrenamiento incluyen FairFace, CelebA o IMDB-WIKI, pero no se documenta una evaluacion de equidad por genero, edad o etnia.
- No se han publicado resultados de benchmarks en la informacion disponible, lo que impide verificar el rendimiento frente a alternativas.
- Licencia USC Research License: restringe el uso comercial; ademas, los pesos estan sujetos a la DINOv3 License y a los terminos de cada uno de los datasets de entrenamiento, lo que puede limitar su explotacion en produccion.
- El repositorio tiene 20,2 GB y 0 descargas en el momento de la consulta, lo que sugiere una adopcion muy temprana y poca validacion externa.
- No soporta tareas linguisticas ni de razonamiento; cualquier uso fuera de la estimacion de mirada 3D no esta contemplado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZongjianLi/FlexGaze
- Paper (arXiv): https://arxiv.org/abs/2611.30012
- Codigo: https://github.com/ihp-lab/FlexGaze
- Inferencia minima: https://github.com/ihp-lab/FlexGaze/tree/main/minimal-inference
- Pagina del proyecto: https://ihp-lab.github.io/FlexGaze/
- Dataset de etiquetas generadas: https://huggingface.co/datasets/ZongjianLi/FlexGaze
