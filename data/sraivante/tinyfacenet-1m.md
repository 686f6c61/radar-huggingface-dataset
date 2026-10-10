# sraivante/TinyFaceNet-1M

## Resumen

TinyFaceNet-1M es una red convolucional de 1,03 millones de parámetros diseñada para extraer embeddings faciales de 128 dimensiones a partir de recortes de cara de 112x112 píxeles en RGB. La publica el usuario sraivante en HuggingFace bajo licencia Apache-2.0, con pipeline declarado image-feature-extraction. No es un modelo de lenguaje: no genera texto, sino un vector normalizado en L2 que representa una identidad facial.

El modelo se ha obtenido por destilación de conocimiento desde insightface buffalo_l (ArcFace, 65 millones de parámetros) sobre un archivo fotográfico privado de tamaño reducido, y después se ha cuantizado a INT8 con ONNX Runtime. El resultado ocupa 1,1 MB de pesos y consume 171 M MACs por cara, con 312 KB de activación pico, lo que permite ejecutarlo en una Raspberry Pi 5 o en un teléfono móvil sin GPU.

Su relevancia está en el enfoque de receta completa: se publican pesos, código de entrenamiento, estudio de cuantización y prueba con webcam, todo orientado a un caso muy concreto, la identificación de conjunto cerrado sobre un grupo pequeño de personas enroladas previamente (entre 5 y 20 caras por persona). El propio autor advierte que el modelo no sirve para verificación general de desconocidos: obtiene un 62,6 % en LFW, frente al 50 % del azar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN estilo MobileFaceNet (extracción de características de imagen) |
| Parámetros totales | 1,03 M |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | fp32 y INT8 (ONNX Runtime) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt), safetensors, ONNX fp32 y ONNX INT8 |
| Entrada | imagen RGB de 112x112 píxeles (recorte facial alineado) |
| Salida | embedding de 128 dimensiones, normalizado en L2 |
| Coste computacional | 171 M MACs por cara |
| Tamaño de pesos en INT8 | 1,1 MB |
| Activación pico (INT8) | 312 KB |
| Modelo profesor | insightface buffalo_l (ArcFace, 65 M de parámetros) |
| Datos de entrenamiento | archivo fotográfico privado (no publicado) |
| Descargas / likes | 0 / 0 |
| Fecha de creación en el repositorio | 10 de octubre de 2026 (según metadatos) |

## Arquitectura y entrenamiento

TinyFaceNet-1M es una CNN ligera inspirada en MobileFaceNet. Toma un recorte facial alineado de 112x112 píxeles en RGB y devuelve un embedding de 128 dimensiones normalizado en L2. Con 171 M MACs por cara, 1,1 MB de pesos INT8 y 312 KB de activación pico, se sitúa en el rango de los modelos TinyML. Solo se publica el backbone de embeddings: la cabeza de destilación usada en entrenamiento y el clasificador de 10 vías se eliminaron antes de subir los pesos, de modo que el modelo por sí solo no puede nombrar a nadie. La identificación requiere enrolar previamente a las personas con `code/enroll.py`, que calcula centroides de identidad.

El entrenamiento se realizó por destilación de conocimiento desde insightface buffalo_l (ArcFace, 65 M de parámetros) sobre un archivo fotográfico privado cuyo tamaño y composición no se detallan. Posteriormente se cuantizó a INT8 con ONNX Runtime y se publicó un estudio de cuantización junto con los informes de análisis. La información disponible no especifica el número de imágenes de entrenamiento, la composición demográfica del conjunto ni detalles adicionales de la función de pérdida más allá de la referencia a ArcFace. No aplican RLHF, DPO ni técnicas de alineación de preferencias, al no tratarse de un modelo generativo.

## Capacidades

- Extracción de embeddings faciales de 128 dimensiones, normalizados en L2, a partir de recortes de 112x112 píxeles.
- Identificación de conjunto cerrado: dado un grupo de personas enroladas previamente, responde "cuál de mis N personas es esta, o ninguna".
- Rechazo de desconocidos mediante umbral de similitud configurable (el autor reporta funcionamiento con THR 0,55).
- Ejecución sin GPU en hardware de borde: Raspberry Pi, Jetson, Coral Edge TPU, mini-PC con Intel N100, RK3566/RK3588 y móviles Android/iOS mediante ORT Mobile, NNAPI o CoreML.
- Conversión a INT8 (ONNX) y, con trabajo adicional, a TFLite INT8 para Edge TPU o a formatos de microcontrolador (esp-dl, TFLite-Micro).
- Compatibilidad con detectores faciales ligeros externos (BlazeFace ~0,1 M de parámetros, SCRFD-500M, Ultra-Light-Fast ~1 MB).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, visión general ni capacidades multilingües: no es un modelo de lenguaje ni un modelo multimodal.

## Casos de uso

- Etiquetado de un archivo fotográfico familiar en local: se enrolan las caras de los miembros del hogar con `code/enroll.py` y el modelo decide a quién de ese grupo cerrado corresponde cada cara detectada. El autor reporta entre un 94 % y un 98 % de acierto en fechas no vistas con 9 identidades, y un 97,2 % de rechazo de 12.000 caras no vistas. Todo el proceso ocurre en la Raspberry Pi 5, sin conexión a internet.
- Organización por lotes de vídeo doméstico: sobre Raspberry Pi 3 o Pi Zero 2 W, con tiempos de 80-200 ms por cara, el modelo es suficiente para procesar archivos de vídeo completos y generar etiquetas de identidad sin requisitos de tiempo real.
- Timbre inteligente o cámara doméstica: responde a la pregunta "¿esta persona es miembro del hogar?" con el mismo planteamiento de conjunto cerrado. El repositorio incluye `live_test.py` con un esquema de voto de 7 fotogramas y una variante v2 para condiciones de baja luminosidad.
- Control de acceso a un grupo reducido y cerrado: hogar, despacho pequeño o equipo de trabajo de entre 5 y 20 personas, donde todas las identidades se pueden enrolar de antemano.
- Aplicación móvil de gestión de fotos sin nube: el modelo se ejecuta en Android o iOS con ORT Mobile, NNAPI o CoreML a unos 5-15 ms por cara, lo que permite indexar la galería local sin enviar datos biométricos a un servidor.
- Base para destilar un modelo facial propio: el repositorio incluye `code/train.py` y `quantize_eval.py`, de modo que un equipo puede reproducir la receta con su propio archivo fotográfico y su propio modelo profesor.
- Captura en microcontrolador con procesamiento en un Linux de borde: un ESP32-S3 o un Raspberry Pi Pico 2 pueden capturar y recortar fotogramas y delegar la inferencia en una Pi Zero 2 W o superior, ya que los microcontroladores no albergan el detector necesario.

## Benchmarks y rendimiento

| Prueba | Resultado | Condiciones |
|---|---|---|
| LFW (protocolo estándar de 10 particiones, 6000 pares) | 62,6 % | azar = 50 %; indica que no hay verificación general de desconocidos |
| Identificación de conjunto cerrado | 94-98 % | fechas no vistas, 9 identidades |
| Rechazo de desconocidos | 97,2 % | 12.000 caras no vistas, umbral 0,55 |
| Latencia en CPU de escritorio (INT8) | 3 ms por cara | medido |

La tabla de resultados de LFW incluida en la model card del autor aparece truncada en la información disponible, por lo que no se pueden recoger más filas de ese benchmark. No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni equivalentes, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM: no requiere GPU. Los pesos INT8 ocupan 1,1 MB y la activación pico 312 KB, por lo que el modelo cabe en memoria de sistema de cualquier dispositivo objetivo.
- GPU recomendadas: no aplica para el caso de uso principal. En NVIDIA Jetson Orin Nano o Nano el modelo es sobredimensionado (menos de 2 ms por cara con TensorRT u ORT-CUDA), pero esos equipos se justifican si se ejecuta el detector completo de buffalo_l.
- Cabe en GPU de consumo: sí, de forma trivial, y también en CPU de consumo. El autor mide 3 ms por cara en CPU de escritorio en INT8.
- Opciones de despliegue: ONNX Runtime para CPU (onnxruntime-arm64 con 4 hilos en Pi 5), ORT-CUDA y TensorRT en Jetson, ORT Mobile con NNAPI o CoreML en móviles, RKNN en NPU Rockchip, TFLite INT8 con el compilador de Edge TPU en Google Coral, y TFLite-Micro o esp-dl en microcontroladores. No aplican vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje.
- Latencias estimadas por dispositivo (INT8): Raspberry Pi 5 (Cortex-A76 x4) unos 10-20 ms por cara, con pipeline completo (detector ligero + alineación + embedding) a 5-10 fps; Raspberry Pi 4/400/CM4 (Cortex-A72 x4) unos 30-60 ms; Raspberry Pi 3/3B+ (Cortex-A53 x4) unos 80-150 ms; Raspberry Pi Zero 2 W unos 100-200 ms; Raspberry Pi Zero/Zero W unos 2-5 s; Jetson Orin Nano menos de 2 ms; Coral Edge TPU unos 1-3 ms; Rockchip RK3566/RK3588 e Intel N100 unos 5-40 ms; móviles Android/iOS unos 5-15 ms; ESP32-S3 unos 3-8 s (experimental); Raspberry Pi Pico 2 y Pico no práctico; Arduino, no viable. Salvo la fila de escritorio, todas las cifras son estimaciones del autor a partir de MACs y de rendimiento por núcleo publicado, con un margen esperado de ±2x.
- Cuello de botella real: en placas pequeñas el limitante es el detector facial, no este extractor de embeddings. El autor recomienda emparejarlo con un detector ligero (BlazeFace, SCRFD-500M o Ultra-Light-Fast) en lugar del det_10g de buffalo_l usado durante el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | LFW | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyFaceNet-1M | 1,03 M | embedding facial, identificación de conjunto cerrado | 62,6 % | Apache-2.0 | pesos (.pt, safetensors, ONNX fp32 e INT8) más receta de entrenamiento y cuantización completas |
| insightface buffalo_l (ArcFace), modelo profesor | 65 M | reconocimiento facial general (verificación y búsqueda 1:N) | no disponible en la información proporcionada | no disponible en la información proporcionada | paquete insightface |
| MobileFaceNet | no disponible en la información proporcionada | embedding facial | no disponible en la información proporcionada | no disponible en la información proporcionada | arquitectura de referencia citada, no distribuida en este repositorio |
| BlazeFace | ~0,1 M | detección de caras (no genera embeddings, tarea distinta) | no aplica | no disponible en la información proporcionada | detector ligero recomendado por el autor |

No se han proporcionado datos de contexto, rendimiento ni licencia de las alternativas, por lo que la comparación se limita a parámetros, tarea y disponibilidad. La diferencia clave frente al modelo profesor es el tamaño: 1,03 M de parámetros frente a 65 M, con la contrapartida de una caída muy acusada en verificación general de desconocidos.

## Limitaciones y advertencias

- Verificación general de personas no vistas: el 62,6 % en LFW, con un 50 % de azar, indica que el modelo no separa identidades que no ha visto durante el enrolamiento. No debe usarse para verificación 1:1 ni para búsqueda 1:N sobre galerías grandes.
- El modelo no distingue a los desconocidos entre sí: solo puede decir "ninguna de mis N personas". No sirve para vigilancia ni para identificar intrusos.
- No incluye cabeza clasificadora ni centroides de identidad. Hay que enrolar a cada persona antes de usarlo, y cualquier persona no enrolada se trata como desconocida.
- Sesgos demográficos desconocidos: el entrenamiento se hizo sobre un archivo fotográfico privado cuyo tamaño, composición y distribución étnica, de edad o de género no se publican, por lo que no es posible evaluar su comportamiento diferencial por subgrupo.
- Umbral de decisión sensible: con THR 0,55, el 2,8 % de las 12.000 caras no vistas se aceptan como conocidas (falsos positivos). En un control de acceso, ese margen es relevante y exige validación propia antes de producción.
- Robustez limitada a condiciones controladas: no se publican métricas de degradación por iluminación extrema, pose, oclusión, resolución baja o envejecimiento facial. El autor menciona una variante v2 para baja luminosidad y un esquema de voto de 7 fotogramas, lo que sugiere que la calidad de detección condiciona fuertemente el resultado.
- Datos biométricos y RGPD: las plantillas faciales son una categoría especial de datos personales. Cualquier despliegue en la Unión Europea exige base jurídica, consentimiento explícito de las personas enroladas, evaluación de impacto y medidas de seguridad. El autor no publica ninguna foto, vídeo ni recorte facial, y elimina los centroides de los artefactos distribuidos.
- Licencia: los pesos se publican bajo Apache-2.0, que permite uso comercial. No se especifica en la información disponible la licencia del modelo profesor (insightface buffalo_l) ni si la destilación impone restricciones adicionales; conviene verificarlo antes de un uso comercial.
- Alcance de la publicación: se publican pesos y código, pero no fotos, ni centroides, ni el mapa de nombres (`labels.json`), ni los nombres reales. El modelo no puede nombrar a nadie por sí solo.
- Precisión de las cifras de hardware: salvo la medición en CPU de escritorio, todas las latencias son estimaciones del propio autor con un margen de ±2x.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, y metadatos con fecha de creación del 10 de octubre de 2026. Se trata de un proyecto reciente y sin validación externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sraivante/TinyFaceNet-1M
- Código incluido en el repositorio (rutas dentro del modelo, sin URL propia proporcionada): `code/enroll.py` (enrolamiento), `code/train.py` (entrenamiento por destilación), `code/quantize_eval.py` (cuantización y evaluación), `code/live_test.py` (prueba en vivo con webcam y voto de 7 fotogramas).
- Proyectos y modelos de referencia citados en la model card, sin enlace proporcionado en la información disponible: insightface buffalo_l (ArcFace, modelo profesor), MobileFaceNet (arquitectura de referencia), BlazeFace, SCRFD-500M y Ultra-Light-Fast (detectores recomendados), ONNX Runtime, Google Coral Edge TPU, TensorRT y RKNN.
- No se han proporcionado enlaces adicionales a papers, blogs, demos ni repositorios externos en la información disponible.
