# UrNinja/hallo3

## Resumen

Hallo3 es un modelo de animación de retratos (portrait image animation) que genera vídeo a partir de una imagen fija de una persona, una pista de audio y un prompt de texto. Lo desarrollan investigadores de la Universidad de Fudan y Baidu Inc. (Jiahao Cui, Hui Li, Yun Zhan, Hanlin Shang, Kaihui Cheng, Yuqi Ma, Shan Mu, Hang Zhou, Jingdong Wang y Siyu Zhu) y fue aceptado en CVPR 2025. La ficha que se analiza aquí, `UrNinja/hallo3`, es una resubida por parte de un tercero del repositorio canónico `fudan-generative-ai/hallo3`: el autor que aparece en HuggingFace no coincide con los autores del artículo y el repositorio acumula 0 descargas y 0 likes.

El modelo resuelve el problema de generar vídeo realista y dinámico de una persona manteniendo su identidad, incluyendo perspectivas no frontales, objetos en movimiento alrededor del sujeto y fondos inmersivos. Se apoya en un backbone de difusión basado en transformer (DiT) preentrenado para vídeo, en concreto CogVideoX-5B-i2v, lo que lo diferencia de generaciones anteriores de Hallo basadas en U-Net. Incorpora además un VAE 3D, el codificador de texto T5-v1_1-xxl, wav2vec2-base-960h para el audio y modelos auxiliares de análisis facial (InsightFace y MediaPipe).

Es relevante porque el artículo se presenta como la primera aplicación de un modelo generativo de vídeo basado en transformer preentrenado a la tarea de animación de retratos, lo que obliga a rediseñar el mantenimiento de identidad, el condicionamiento por audio y la extrapolación de vídeo que usaban los métodos U-Net. El repositorio pesa 52,2 GB y está publicado bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para video (DiT) sobre CogVideoX-5B-i2v, con VAE 3D y modulos de adaptacion de audio |
| Parametros totales | Aproximadamente 5 mil millones en el backbone DiT heredado de CogVideoX-5B-i2v; el total del pipeline completo (incluido el codificador de texto) no esta desglosado en la informacion disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt de texto se procesa con T5-v1_1-xxl) |
| Licencia | MIT (segun la model card del repositorio subido); los componentes de terceros conservan sus propias licencias |
| Formato de pesos | safetensors (T5-v1_1-xxl, wav2vec2-base-960h), .pt (checkpoints de Hallo3 y del VAE 3D), .onnx (Kim Vocal_2 de separacion de audio y modelos de InsightFace) |

## Arquitectura y entrenamiento

Hallo3 se construye sobre un backbone de difusion en espacio latente con arquitectura transformer (DiT, Diffusion Transformer) preentrenado para generacion de video: CogVideoX-5B-i2v, del que hereda el transformer y el VAE 3D. A diferencia de las versiones anteriores de la familia Hallo, basadas en U-Net, el uso de un backbone DiT de video preentrenado implica que los mecanismos previos de mantenimiento de identidad, condicionamiento por audio y extrapolacion de video dejan de ser aplicables tal cual y deben rediseñarse. El condicionamiento textual se realiza con T5-v1_1-xxl y el condicionamiento de audio con wav2vec2-base-960h, que convierte la onda de audio en representaciones vectoriales.

El pipeline incluye componentes auxiliares de preprocesado: un separador de voz basado en MDX-Net (Kim_Vocal_2, en ONNX) para aislar la voz del audio de entrada, y modelos de analisis facial 2D y 3D de InsightFace y de MediaPipe (face landmarker con blendshapes) para extraer la estructura y los puntos de referencia del rostro. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO; la model card unicamente indica que se trata de un modelo de difusion preentrenado y adaptado.

## Capacidades

- Animacion de retratos: genera video de una persona a partir de una unica imagen fija, manteniendo la identidad a lo largo de la secuencia.
- Sincronizacion labial guiada por audio: el audio de entrada se codifica con wav2vec2 y condiciona la generacion de movimiento facial y labial.
- Control mediante prompt de texto: el usuario puede describir la escena o el movimiento, codificado a traves de T5-v1_1-xxl.
- Perspectivas no frontales: el articulo destaca explicitamente la mejora en el manejo de angulos de cabeza no frontales.
- Generacion de fondos y elementos dinamicos: capacidad de renderizar objetos en movimiento alrededor del retrato y fondos realistas e inmersivos.
- Extrapolacion de video: la model card menciona la adaptacion de la extrapolacion de video al nuevo backbone.
- Preprocesado integrado de audio: separacion vocal con Kim_Vocal_2 para extraer la pista de voz.
- Analisis facial integrado: deteccion y malla facial con MediaPipe y analisis 2D/3D con InsightFace.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio general ni modo de pensamiento, ya que no es un modelo de lenguaje.

## Casos de uso

- Produccion de avatares parlantes: dada una fotografia y una locucion grabada, generar un clip de video del sujeto hablando con sincronizacion labial, util para formacion corporativa o e-learning sin necesidad de regrabar al presentador.
- Doblaje y localizacion de contenido: reutilizar la imagen de un presentador y una nueva pista de audio para generar versiones en otros idiomas o para corregir tomas, aprovechando el condicionamiento de audio con wav2vec2.
- Presencia digital en marketing: crear anuncios con un rostro conocido y un guion de texto que describe el escenario deseado, explotando el control por prompt mediante T5-v1_1-xxl.
- Reconstruccion de material archivado: animar retratos historicos o fotografias antiguas para documentales y museos digitales, apoyandose en el mantenimiento de identidad.
- Prototipado en industria del entretenimiento: previsualizacion rapida de personajes y escenas antes de rodar, aprovechando la generacion de fondos dinamicos y objetos en movimiento.
- Asistentes virtuales con cara humana: generar respuestas habladas con rostro animado en interfaces de atencion al cliente, con la advertencia de que el modelo no gestiona la conversacion por si mismo y requiere un LLM externo para el texto.
- Investigacion en sintesis de video: servir como base para experimentos sobre condicionamiento multimodal (imagen + audio + texto) y para comparar backbones DiT frente a U-Net en animacion de retratos.
- Accesibilidad y contenido personalizado: generar mensajes en video a partir de una fotografia y un audio, por ejemplo para comunicaciones personalizadas a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de metricas (FID, FVD, LSE-C/LSE-D, similitud de identidad, etc.) y los resultados de busqueda únicamente describen cualitativamente el modelo. Se puede consultar el articulo arXiv:2412.00733 para obtener las comparativas completas, que no se reproducen aqui porque no forman parte de la informacion suministrada.

## Requisitos de hardware

- Entorno probado por los autores: Ubuntu 20.04 o 22.04 con CUDA 12.1. La model card indica que las GPU probadas son H100.
- VRAM estimada: no disponible de forma oficial. Partiendo de los componentes descritos, el codificador de texto T5-v1_1-xxl (del orden de 11 mil millones de parametros) y el backbone DiT de aproximadamente 5 mil millones, mas el VAE 3D, implican un consumo elevado: se necesita al menos una GPU de 80 GB (H100 o A100 80 GB) para un flujo de trabajo comodo sin offloading agresivo.
- Cabe en GPU de consumo: no de forma directa con los pesos en precision completa. Seria necesario cuantizar o aplicar offloading de componentes (por ejemplo, mover T5 y el VAE a CPU), algo que no esta documentado en la informacion disponible.
- Opciones de despliegue: la model card describe un flujo de trabajo basado en clonar el repositorio de GitHub, crear un entorno conda con Python 3.10, instalar `requirements.txt` y descargar los pesos con `huggingface-cli` desde `fudan-generative-ai/hallo3`. Tambien requiere ffmpeg. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El repositorio ocupa 52,2 GB, lo que da una idea del volumen de pesos que hay que cargar en memoria.
- Almacenamiento: prever al menos 52,2 GB solo para los pesos del repositorio, mas el espacio de trabajo para videos generados y el entorno conda.

## Comparativa con modelos similares

| Modelo | Tipo de backbone | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hallo3 | DiT sobre CogVideoX-5B-i2v | ~5 mil millones en el DiT (total del pipeline no disponible) | no disponible | MIT (segun esta resubida) | HuggingFace y GitHub |
| Hallo2 (generacion anterior de la familia) | Difusion basada en U-Net | no disponible | no disponible | no disponible en la informacion proporcionada | repositorio del proyecto Fudan |
| CogVideoX-5B-i2v | DiT para generacion de video a partir de imagen | 5 mil millones | no disponible | la del proyecto CogVideoX, no verificada aqui | HuggingFace y GitHub de THUDM |
| LivePortrait | Animacion de retratos basada en puntos clave, no difusion | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

Los datos de rendimiento, calidad y latencia de estas alternativas no se han incluido en la informacion disponible, por lo que la comparativa se limita a arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Repositorio no oficial: `UrNinja/hallo3` es una resubida de un tercero, con 0 descargas y 0 likes, y no coincide con el repositorio canonico `fudan-generative-ai/hallo3`. Para produccion conviene usar siempre la fuente original.
- Fechas inconsistentes: la model card indica creacion en 2026-10-11, una fecha posterior a la actual; conviene tratar los metadatos de esta resubida con cautela.
- Licencia de terceros: aunque el repositorio declare MIT, el pipeline depende de componentes con licencias propias (CogVideoX, T5-v1_1-xxl, wav2vec2-base-960h, Kim_Vocal_2, InsightFace y MediaPipe). Es imprescindible verificar cada una antes de un uso comercial, en particular los modelos de analisis facial de InsightFace, que suelen tener restricciones de uso.
- Artefactos de generacion: al ser un modelo de difusion de video, puede producir parpadeo temporal, deriva de identidad a lo largo de la secuencia, errores de sincronizacion labial y artefactos en manos o bordes. La informacion disponible no cuantifica estos fallos.
- Sesgos: los datos de entrenamiento no estan documentados en la informacion proporcionada, por lo que no se puede evaluar el sesgo demografico (etnia, edad, genero, tipo de rostro) del modelo. Es previsible que el rendimiento varie segun el rostro de entrada.
- Limitaciones de idioma: no se especifican los idiomas soportados por el condicionamiento de audio y texto; tampoco si el prompt de texto funciona fuera del ingles.
- Riesgo de uso indebido: la animacion de retratos con audio permite crear deepfakes. Es necesario obtener consentimiento de la persona retratada y cumplir la normativa aplicable sobre sintesis de imagen y voz.
- Requisitos de hardware altos: la combinacion de T5-XXL, un DiT de 5 mil millones de parametros y un VAE 3D exige GPU de gran memoria; no hay rutas de cuantizacion documentadas en la informacion disponible.
- Sin benchmarks publicados en la informacion disponible: no se puede verificar el rendimiento real frente a alternativas sin consultar el articulo.
- Documentacion incompleta: la model card proporcionada esta truncada y no detalla el proceso de inferencia completo, los parametros de generacion (numero de fotogramas, resolucion, pasos de difusion) ni las caracteristicas de contexto.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/UrNinja/hallo3
- Repositorio canonico en HuggingFace: https://huggingface.co/fudan-generative-ai/hallo3
- Repositorio de GitHub: https://github.com/fudan-generative-vision/hallo3
- Pagina del proyecto: https://fudan-generative-vision.github.io/hallo3/
- Articulo en arXiv (abstract): https://arxiv.org/abs/2412.00733
- Articulo en arXiv (HTML, v3): https://arxiv.org/html/2412.00733v3
- CogVideo (backbone CogVideoX-5B-i2v): https://github.com/THUDM/CogVideo
- Codificador de texto T5-v1_1-xxl: https://huggingface.co/google/t5-v1_1-xxl
- Separador vocal Kim_Vocal_2 (MDX-Net): https://huggingface.co/huangjackson/Kim_Vocal_2
- wav2vec2-base-960h: https://huggingface.co/facebook/wav2vec2-base-960h
- InsightFace (model zoo): https://github.com/deepinsight/insightface/tree/master/python-package#model-zoo
- MediaPipe face landmarker: https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker#models
