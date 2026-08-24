# Splash47666/slowfast-basketball-round-classifier

## Resumen

El modelo `Splash47666/slowfast-basketball-round-classifier` es un clasificador binario de vídeo desarrollado por el usuario Splash47666 para identificar si un clip de retransmisión de baloncesto corresponde a una jugada activa o a un segmento fuera de juego (tiempos muertos, repeticiones, gráficos, etc.). Se construye sobre el modelo SlowFast R50 de PyTorchVideo, preentrenado en Kinetics-400, y se ajusta localmente con datos de retransmisiones de baloncesto recopiladas de fuentes públicas como Bilibili.

El modelo resuelve un problema práctico de segmentación de partidos en el ámbito del análisis deportivo: distinguir automáticamente los intervalos de juego real de los momentos de pausa, lo que facilita tareas como la extracción de resúmenes o la asistencia a la edición de vídeo. Su relevancia radica en que ofrece un punto de partida ligero y de código abierto (licencia Apache-2.0) para desarrolladores que necesiten una base de clasificación de vídeo deportivo sin partir de cero. El repositorio pesa 0,1 GB e incluye el checkpoint de entrenamiento, aunque no distribuye los datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SlowFast R50 (PyTorchVideo) |
| Parámetros totales | Aproximadamente 34 millones (SlowFast R50); no confirmado en la documentación |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (entrada de vídeo de 32 frames RGB a 224×224) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo de vídeo sin componente lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pth` (checkpoint de entrenamiento con `model_state_dict`, época y metadatos de validación) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SlowFast R50 implementada en PyTorchVideo, que procesa el vídeo mediante dos vías paralelas: una vía lenta (slow pathway) que opera a baja frecuencia de frames para capturar semántica espacial, y una vía rápida (fast pathway) que opera a alta frecuencia para capturar el movimiento fino. En este caso, la entrada es un clip de 32 frames RGB muestreados uniformemente, con la vía lenta tomando un frame de cada cuatro (hasta 8 frames) y la vía rápida procesando hasta 32 frames.

El proceso de entrenamiento consistió en cargar el backbone preentrenado en Kinetics-400, congelar sus parámetros y entrenar únicamente el bloque de clasificación final. Se usó el optimizador AdamW con una tasa de aprendizaje de 5e-5, decaimiento de peso de 1e-5, programación coseno de la tasa de aprendizaje, entropía cruzada con suavizado de etiquetas, precisión mixta y aumento de datos. Se entrenó durante 8 épocas con un tamaño de lote de 4, seleccionando el checkpoint de la época 4, que alcanzó una precisión de validación del 84,68 % y una pérdida de 0,4825 en la partición local de validación.

## Capacidades

- Clasificación binaria de vídeo: distingue entre `0 = not_in_round` (fuera de juego) y `1 = in_round` (en juego) para clips cortos de retransmisión de baloncesto.
- Segmentación de partidos: puede identificar intervalos de juego activo dentro de una retransmisión completa, útil para la extracción de resúmenes.
- Procesamiento de vídeo de baja resolución: trabaja con clips de 32 frames a 224×224, lo que permite inferencia rápida en hardware moderado.
- Detección de patrones de edición: puede aprender overlays y patrones de edición propios de retransmisiones, aunque esto también es una limitación potencial.
- No incluye capacidades de identificación de jugadores, reconocimiento de eventos oficiales, tool calling, agentes ni procesamiento de lenguaje.

## Casos de uso

- Segmentación de partidos en directo: el modelo puede procesar la retransmisión en tiempo real para marcar los intervalos de juego activo, permitiendo a editores o sistemas automáticos saltar a los momentos de acción.
- Extracción de resúmenes automáticos: aplicando el clasificador sobre clips consecutivos, se pueden recopilar los segmentos « in_round » y concatenarlos para generar un resumen del partido sin intervención manual.
- Asistencia a la edición de vídeo deportivo: los editores pueden usar el modelo como herramienta de pre-selección para localizar rápidamente los momentos de juego y descartar repeticiones, primeros planos y cortes publicitarios.
- Análisis de retransmisiones históricas: permite etiquetar automáticamente archivos de vídeo de baloncesto con marcas de tiempo de juego activo, facilitando búsquedas y estadísticas posteriores.
- Investigación en visión por computadora deportiva: sirve como punto de partida para investigar la segmentación de eventos en baloncesto y otros deportes, ya que es un modelo de código abierto y ligero.
- Prototipado de herramientas de análisis táctico: combinado con otros modelos de detección de jugadores o balón, puede ayudar a enmarcar el análisis táctico únicamente en los segmentos de juego real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la precisión de validación local del 84,68 % y la pérdida de 0,4822, obtenidos en la partición de validación utilizada durante el entrenamiento. El autor indica que estos resultados no se han reproducido de forma independiente en un benchmark público y que no deben compararse directamente con resultados obtenidos con otras particiones de datos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en FP32 para un batch de 1 clip de 32 frames a 224×224, dado el tamaño del checkpoint (0,1 GB) y la arquitectura SlowFast R50 (~34 M de parámetros).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluidas las de gama de entrada como NVIDIA GTX 1650, RTX 3050, o GPUs de datacenter como T4, V100 o A100 para mayor throughput.
- Compatibilidad con GPU de consumo: sí, el modelo es suficientemente ligero para ejecutarse en GPUs de consumo (RTX 3060, RTX 4060, etc.) e incluso en CPU con baja latencia, aunque más lento.
- Opciones de despliegue: el autor proporciona un script `inference.py` para ejecutar la inferencia desde línea de comandos; se puede integrar en frameworks de inferencia como PyTorch o PyTorchVideo, o exportar a ONNX/TorchScript para despliegue en servidores.
- Latencia y throughput: no hay datos medidos por el autor; en una GPU moderna se estima una latencia de inferencia de entre 50 y 200 ms por clip de 32 frames, dependiendo del hardware y la optimización.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicamente entrenados para la clasificación de juego activo en baloncesto. La arquitectura base SlowFast R50 de PyTorchVideo (preentrenada en Kinetics-400) es la referencia inmediata, pero es un modelo de clasificación de 400 clases de acciones generales, no específico de baloncesto. No se pueden proporcionar comparaciones cuantitativas con otros modelos de este dominio sin datos adicionales.

## Limitaciones y advertencias

- Los gráficos de retransmisión, repeticiones, primeros planos y ángulos de cámara inusuales pueden provocar predicciones falsas.
- El rendimiento puede degradarse en retransmisiones de baloncesto que difieran de la distribución local de entrenamiento (por ejemplo, ligas diferentes, cámaras distintas o estilos de edición variados).
- El modelo puede aprender patrones de overlay o de edición específicos del broadcaster, lo que limita su generalización a otros canales.
- No se ha auditado el modelo en cuanto a sesgos demográficos ni memorización de datos de entrenamiento.
- No debe usarse para vigilancia, identificación biométrica ni decisiones sobre individuos.
- Los datos de entrenamiento no se distribuyen en el repositorio; el autor no ha completado una revisión de derechos de autor de las imágenes de origen, por lo que los usuarios deben evaluar de forma independiente el cumplimiento de las leyes de copyright, privacidad y plataforma.
- El checkpoint es un archivo pickle de PyTorch y puede ejecutar código durante la deserialización; solo se debe cargar desde fuentes de confianza.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/Splash47666/slowfast-basketball-round-classifier
- Repositorio PySlowFast (Facebook Research): https://github.com/facebookresearch/SlowFast
- Documentación de PyTorchVideo sobre SlowFast: https://pytorchvideo.readthedocs.io/en/latest/api/models/slowfast.html
- Referencia de PyTorchVideo: Fan et al., « PyTorchVideo: A Deep Learning Library for Video Understanding », 2021 (https://dl.acm.org/doi/10.1145/3474085.3479212)</think>## Resumen

El modelo `Splash47666/slowfast-basketball-round-classifier` es un clasificador binario de vídeo desarrollado por el usuario Splash47666, diseñado para identificar si un clip de una retransmisión de baloncesto corresponde a una jugada activa o a un segmento fuera de juego (tiempos muertos, repeticiones, cortes publicitarios, primeros planos, etc.). Se construye mediante un ajuste fino local del modelo SlowFast R50 de PyTorchVideo, preentrenado en Kinetics-400, congelando el backbone y entrenando únicamente el bloque de clasificación final.

El modelo resuelve un problema práctico de segmentación de partidos en el ámbito de la producción audiovisual deportiva: automatizar la distinción entre juego en curso y pausas, lo que facilita tareas como la extracción de resúmenes, la edición asistida o la indexación de contenidos. Su relevancia radica en ser un modelo ligero (0,1 GB) y de código abierto bajo licencia Apache-2.0, que sirve como punto de partida para desarrolladores e investigadores que necesiten una base de clasificación de vídeo deportivo sin partir de cero.

La entrada al modelo consiste en 32 fotogramas RGB muestreados uniformemente a resolución 224×224, con una vía lenta que procesa hasta 8 fotogramas y una vía rápida que procesa hasta 32. La salida es una clasificación binaria entre las clases `0 = not_in_round` (fuera de juego) y `1 = in_round` (en juego). El checkpoint seleccionado corresponde a la época 4, con una precisión de validación del 84,68 % y una pérdida de 0,4825, aunque estos resultados provienen de la partición de validación local y no han sido reproducidos en un benchmark público.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SlowFast R50 (PyTorchVideo) |
| Parámetros totales | Aproximadamente 34 millones (SlowFast R50); no confirmado explícitamente en la documentación |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (entrada de vídeo de 32 fotogramas RGB a 224×224) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo de vídeo sin componente lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pth` (checkpoint de entrenamiento con `model_state_dict`, época y metadatos de validación) |

## Arquitectura y entrenamiento

La arquitectura SlowFast, implementada en PyTorchVideo, utiliza dos vías paralelas de procesamiento: una vía lenta que opera a baja frecuencia de muestreo para capturar la semántica espacial y una vía rápida que opera a alta frecuencia para capturar el movimiento fino en el dominio temporal. En este modelo, la entrada es un clip de 32 fotogramas RGB, con la vía lenta tomando cada cuarto fotograma (hasta 8) y la vía rápida procesando los 32 fotogramas completos.

El proceso de entrenamiento consistió en cargar el backbone preentrenado en Kinetics-400, congelar todos sus parámetros y entrenar únicamente el bloque de clasificación final. Se utilizó el optimizador AdamW con una tasa de aprendizaje de 5e-5, decaimiento de peso de 1e-5, programación de la tasa de aprendizaje por coseno, entropía cruzada con suavizado de etiquetas, precisión mixta y aumento de datos. El entrenamiento duró 8 épocas con un tamaño de lote de 4, y el checkpoint seleccionado fue el de la época 4. La normalización de entrada usa media `[0.45, 0.45, 0.45]` y desviación estándar `[0.225, 0.225, 0.225]`.

Los datos de entrenamiento no se incluyen en el repositorio. Consistieron en clips de retransmisión de baloncesto preparados localmente, divididos en las clases `in_round` y `not_in_round`. Parte del material se recopiló de vídeos públicos de Bilibili, pero no se distribuyen los vídeos originales, fotogramas extraídos, audio, subtítulos ni metadatos de los subidores.

## Capacidades

- Clasificación binaria de vídeo: distingue entre `in_round` (jugada activa) y `not_in_round` (fuera de juego) en clips de retransmisión de baloncesto.
- Entrada de vídeo de 32 fotogramas: procesa clips cortos muestreados uniformemente, lo que permite su uso en segmentación de partidos completos.
- Detección de patrones de edición: puede identificar características de la retransmisión como gráficos, repeticiones y primeros planos, aunque con limitaciones.
- Inferencia local: el modelo es ligero (0,1 GB) y puede ejecutarse en hardware modesto.
- No incluye capacidades de identificación de jugadores, reconocimiento de eventos oficiales, tool calling, razonamiento multi-paso ni procesamiento de lenguaje natural.

## Casos de uso

- Segmentación automática de partidos: el modelo puede procesar una retransmisión completa en bloques de 32 fotogramas y generar marcas temporales que separan los segmentos de juego activo de los cortes, facilitando la navegación y la edición posterior.
- Extracción de resúmenes: aplicando el clasificador a un vídeo de baloncesto, se pueden concatenar los clips clasificados como `in_round` para generar automáticamente un resumen con las jugadas más relevantes, sin intervención manual.
- Asistencia a la edición de vídeo: los editores pueden usar el modelo como pre-filtro para localizar rápidamente los momentos de juego real, descartando repeticiones, primeros planos y cortes publicitarios antes de la revisión humana.
- Indexación y búsqueda en archivos deportivos: el modelo puede etiquetar vídeos históricos con marcas de tiempo de juego activo, lo que facilita la búsqueda de jugadas concretas en grandes archivos de retransmisiones.
- Prototipado de herramientas de análisis táctico: combinado con otros modelos de detección de jugadores o balón, el clasificador puede enmarcar el análisis táctico únicamente a los segmentos de juego real, evitando procesar vídeo innecesario.
- Investigación en visión por computadora deportiva: el modelo sirve como base de referencia para experimentar con la segmentación de eventos en baloncesto y otros deportes, dado su tamaño reducido y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la precisión de validación local del 84,68 % y una pérdida de 0,4822, obtenidos en la partición de validación utilizada durante el entrenamiento. El autor indica explícitamente que estos resultados no han sido reproducidos de forma independiente en un benchmark público y que no deben compararse directamente con resultados obtenidos con otras particiones de datos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene aproximadamente 34 millones de parámetros, por lo que en FP32 requiere unos 136 MB de VRAM para los pesos, más el espacio para activaciones intermedias. En FP16 se reduce a unos 68 MB. Con un lote de 1 clip de 32 fotogramas a 224×224, el consumo total de VRAM se estima entre 1 y 2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para la inferencia, incluyendo tarjetas de consumo como NVIDIA GTX 1650, RTX 3060, RTX 4090, o GPUs de datacenter como T4, V100, A100 o H100.
- Compatibilidad con GPU de consumo: sí, el modelo es perfectamente ejecutable en GPU de consumo e incluso en CPU con una latencia aceptable para procesamiento por lotes.
- Opciones de despliegue: el repositorio incluye un script `inference.py` para ejecutar la inferencia desde línea de comandos. El modelo puede exportarse a ONNX o TorchScript para servirlo con frameworks como TorchServe, Triton Inference Server o TensorFlow Serving. Para despliegues en Python puro, también puede integrarse en una API con FastAPI.
- Latencia y throughput: no hay datos publicados por el autor. Con una GPU de gama media, se estima una latencia de inferencia de entre 50 y 200 ms por clip de 32 frames, lo que permite un throughput de 5 a 20 clips por segundo.

## Comparativa con modelos similares

No hay información disponible sobre modelos comparables específicamente entrenados para la clasificación de jugadas activas en baloncesto. La base del modelo es el SlowFast R50 de PyTorchVideo preentrenado en Kinetics-400, que es un clasificador de 400 clases de acciones generales, pero no es específico para el dominio deportivo. No se pueden proporcionar comparaciones cuantitativas con alternativas de la misma categoría sin datos adicionales.

## Limitaciones y advertencias

- Los gráficos de retransmisión, repeticiones, primeros planos y ángulos de cámara inusuales pueden causar predicciones falsas.
- El rendimiento puede degradarse en retransmisiones de baloncesto que no se asemejen a la distribución de entrenamiento local, como otras ligas, cámaras o estilos de edición.
- El modelo puede aprender patrones de overlay o de edición específicos de los broadcasters de los datos de entrenamiento, lo que limita su generalización a otros canales.
- No se ha auditado el modelo por sesgos demográficos ni por memorización de datos de entrenamiento.
- No debe utilizarse para vigilancia, identificación biométrica ni para tomar decisiones sobre personas.
- Los datos de entrenamiento no se distribuyen en el repositorio y el autor no ha completado una revisión de derechos de autor del material de origen. Los usuarios deben evaluar de forma independiente el cumplimiento de las leyes de copyright, privacidad y normas de plataforma.
- El checkpoint es un archivo pickle de PyTorch, que puede ejecutar código durante la deserialización; solo se deben cargar archivos `.pth` de fuentes de confianza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Splash47666/slowfast-basketball-round-classifier
- Repositorio PySlowFast (Facebook Research): https://github.com/facebookresearch/SlowFast
- Documentación de PyTorchVideo sobre SlowFast: https://pytorchvideo.readthedocs.io/en/latest/api/models/slowfast.html
- Referencia de PyTorchVideo: Fan et al., « PyTorchVideo: A Deep Learning Library for Video Understanding », 2021 (https://dl.acm.org/doi/10.1145/3474085.3479212)
