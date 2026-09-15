# tom12131231/FMPose3D

## Resumen

FMPose3D es un modelo de estimación de pose 3D monocular: a partir de una única imagen (o de los keypoints 2D detectados en ella) eleva la información a una pose tridimensional. Lo desarrollan Ti Wang, Xiaohang Yu y Mackenzie Weygandt Mathis, en el entorno del laboratorio AdaptiveMotorControlLab (responsable de DeepLabCut y vinculado a EPFL), y se publica junto al artículo arXiv 2602.05755.

La innovación principal es el uso de flow matching, una técnica generativa basada en muestreo de ecuaciones diferenciales ordinarias (EDO), que produce varias hipótesis de pose 3D plausibles en pocos pasos. Esas hipótesis se agregan después mediante RPEA, un módulo bayesiano guiado por reproyección, para obtener una predicción final precisa. El autor afirma resultados de estado del arte en referencia de pose 3D de humanos y animales, aunque no se incluyen cifras concretas en la información disponible.

Se distribuyen dos checkpoints: uno para humanos con esqueleto H36M de 17 articulaciones, entrenado con Human3.6M, y otro para animales cuadrúpedos con esqueleto Animal3D de 26 articulaciones, entrenado con Animal3D. El repositorio ocupa 0,2 GB, la librería se publica en PyPI como `fmpose3d` y la licencia de los pesos restringe el uso a fines no comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo generativo de estimación de pose 3D basado en flow matching (muestreo por EDO) con módulo de agregación bayesiana por reproyección (RPEA); backbone concreto no especificado |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible; no aplica a secuencias de texto (la entrada es una imagen o un conjunto de keypoints 2D) |
| Tipos de cuantización | no disponible; los checkpoints se distribuyen únicamente en precisión completa (.pth) |
| Idiomas soportados | en (etiqueta del repositorio; el modelo no procesa lenguaje natural) |
| Licencia | no comercial (non-commercial use); contacto con EPFL TTO para otros usos |
| Formato de pesos | .pth (checkpoints de PyTorch): `fmpose3d_humans.pth` y `fmpose3d_animals.pth` |
| Checkpoints disponibles | 2: humanos (esqueleto H36M, 17 articulaciones, Human3.6M) y animales (esqueleto Animal3D, 26 articulaciones, Animal3D) |
| Datasets de entrenamiento | Human3.6M y Animal3D |
| Tarea (pipeline) | image-to-3d (estimación de pose 3D monocular) |
| Librería | fmpose3d (paquete en PyPI) |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-15 |

## Arquitectura y entrenamiento

FMPose3D no es un transformer de lenguaje ni un modelo multimodal de texto: es un modelo de visión para elevación de pose 2D a 3D. Su formulación se apoya en flow matching, un marco generativo que aprende un campo de velocidades y genera muestras resolviendo una EDO desde una distribución simple hasta la distribución objetivo de poses 3D. Frente a los enfoques deterministas de regresión directa, esto permite obtener varias hipótesis de pose plausibles en pocos pasos de integración, lo que resulta útil para manejar la ambigüedad de profundidad inherente a la estimación monocular.

Sobre esas hipótesis actúa RPEA, un módulo bayesiano que las pondera y agrega utilizando la reproyección como señal de coherencia, produciendo una predicción final. El entrenamiento se realiza de forma específica por dominio: el checkpoint humano usa Human3.6M con un esqueleto de 17 articulaciones (H36M) y el checkpoint animal usa Animal3D con 26 articulaciones para cuadrúpedos. No se especifican en la información disponible el número de tokens o muestras de entrenamiento, la composición detallada del dataset, el backbone concreto ni si hubo etapas de ajuste con refuerzo o preferencias (no aplica RLHF/DPO en el sentido de los modelos de lenguaje).

## Capacidades

- Estimación de pose 3D monocular a partir de una sola imagen (`image-to-3d`), elevando keypoints 2D a coordenadas 3D.
- Generación de múltiples hipótesis de pose 3D plausibles en pocos pasos de muestreo por flow matching.
- Agregación de hipótesis mediante RPEA, un módulo bayesiano basado en reproyección, para obtener la predicción final.
- Pose humana: esqueleto H36M de 17 articulaciones (`FMPose3DInference().predict("photo.jpg")`).
- Pose animal: esqueleto Animal3D de 26 articulaciones para cuadrúpedos (`FMPose3DInference.for_animals().predict("dog.jpg")`).
- API de Python con descarga automática de pesos en el primer uso; también permite cargar pesos manualmente desde Hugging Face.
- No dispone de generación de texto, razonamiento simbólico, código ni matemáticas.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso en lenguaje natural.
- No dispone de capacidades multilingües: la etiqueta de idioma (`en`) corresponde a la documentación, no a procesamiento de lenguaje.
- No dispone de modo de pensamiento (thinking mode), audio ni visión entendida como descripción semántica de imágenes.

## Casos de uso

- Análisis biomecánico y rehabilitación: estimar la pose 3D de un paciente a partir de vídeo monocámara para medir rangos articulares y simetría de movimiento, sin necesidad de sistemas de captura con marcadores.
- Ergonomía y prevención de riesgos laborales: analizar posturas de trabajadores en entornos industriales y detectar ángulos articulares de riesgo a partir de grabaciones de una sola cámara.
- Análisis deportivo: reconstruir la cinemática 3D de un gesto técnico (carrera, salto, lanzamiento) desde metraje convencional para comparar ejecuciones entre sesiones o atletas.
- Etología y neurociencia del comportamiento: usar el checkpoint animal para reconstruir la pose 3D de cuadrúpedos en experimentos de seguimiento, encajando con el ecosistema DeepLabCut del mismo grupo.
- Previsualización para animación y efectos visuales: generar poses 3D iniciales desde material rodado para prototipado rápido antes de una captura de movimiento definitiva.
- Robótica e interacción humano-máquina: dotar a un sistema robótico de estimación de la postura humana en 3D desde una cámara RGB para planificación de manipulación o seguridad en espacios compartidos.
- Generación de datos sintéticos y aumento de datos: producir múltiples hipótesis de pose 3D por imagen para entrenar o aumentar otros modelos de visión y de generación de vídeo.
- Captura de movimiento sin marcadores de bajo coste: pipelines de posproducción que necesitan un primer ajuste de pose 3D antes de un refinado manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card afirma que el modelo alcanza resultados de estado del arte en referencia de pose 3D de humanos y animales, pero no incluye cifras.

| Benchmark | FMPose3D | Alternativas |
|---|---|---|
| Human3.6M (MPJPE, PA-MPJPE u otras métricas) | no disponible | no disponible |
| Animal3D (métricas de pose 3D) | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, el repositorio completo (dos checkpoints) ocupa 0,2 GB, lo que sugiere modelos de tamaño reducido y requisitos de memoria de inferencia modestos (del orden de pocos GB, estimación no confirmada por el autor).
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente en principio, dado el tamaño del repositorio; no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible.
- Compatibilidad con GPU de consumo: previsiblemente sí en la mayoría de tarjetas consumer actuales, por el reducido tamaño de los checkpoints; sin confirmación oficial.
- Ejecución en CPU: no se indica explícitamente, pero el tamaño de los pesos permite plantearla; no confirmado.
- Opciones de despliegue: paquete de Python `fmpose3d` (instalable con `pip install fmpose3d`) sobre PyTorch; descarga de pesos vía `huggingface_hub`. No aplica el despliegue con vLLM, llama.cpp, Ollama o TGI, orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Dependen del número de pasos de muestreo de la EDO, que la model card describe como "unos pocos", pero sin cifras concretas.

## Comparativa con modelos similares

La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos, por lo que la comparación cuantitativa no está disponible. Como categorías comparables se pueden citar los elevadores deterministas de pose 2D a 3D (familia de PoseFormer, MHFormer o MotionBERT, entre otros) y los enfoques generativos por difusión para pose 3D.

| Modelo | Categoría | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FMPose3D | Flow matching + agregación bayesiana (RPEA) | no disponible | no aplica | no comercial | Pesos en Hugging Face, paquete en PyPI |
| Elevadores deterministas de pose 2D a 3D | Regresión directa | no disponible | no aplica | no disponible | no disponible |
| Generativos por difusión para pose 3D | Difusión | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no comercial: los pesos solo pueden usarse con fines no comerciales; para otros usos hay que contactar con EPFL TTO.
- No se publican cifras de benchmarks ni el número de parámetros, lo que dificulta la comparación objetiva con alternativas.
- La estimación monocular de pose 3D es ambigua en profundidad por naturaleza; oclusiones, escorzos y poses poco frecuentes pueden degradar el resultado.
- El modelo genera varias hipótesis de pose: algunas pueden ser geométricamente plausibles pero incorrectas, por lo que conviene validar la predicción agregada (RPEA) y no confiar ciegamente en una única salida.
- Sesgo de dominio: los checkpoints están entrenados con Human3.6M y Animal3D, de modo que el rendimiento puede caer en cámaras, entornos, morfologías o especies no representadas.
- Los esqueletos están fijados (17 articulaciones en humanos, 26 en animales); no se adaptan a otras definiciones de esqueleto sin reentrenamiento.
- No hay cuantizaciones publicadas (GGUF, AWQ, etc.), lo que limita optimizaciones de despliegue ya estandarizadas en otros ecosistemas.
- El repositorio figura con 0 descargas y 0 likes, por lo que no existe validación de la comunidad sobre los pesos distribuidos en esa copia.
- El uso clínico o de seguridad laboral requiere validación propia: el modelo no es un dispositivo médico ni está certificado para decisiones críticas.
- La etiqueta de idioma `en` no implica capacidades lingüísticas; el modelo no procesa ni genera texto.

## Enlaces

- Repositorio de Hugging Face (copia): https://huggingface.co/tom12131231/FMPose3D
- Repositorio oficial de pesos en Hugging Face: https://huggingface.co/DeepLabCut/FMPose3D
- Artículo (arXiv): https://arxiv.org/abs/2602.05755
- Página del proyecto: https://xiu-cs.github.io/FMPose3D/
- Repositorio de código (GitHub): https://github.com/AdaptiveMotorControlLab/FMPose3D
- Paquete en PyPI: https://pypi.org/project/fmpose3d/
- Nota: los resultados de la búsqueda web proporcionados corresponden a Qwen-Image-Edit-2511 y no guardan relación con FMPose3D, por lo que no se incluyen.
