# zeromodels/efficientdet_d2

## Resumen

EfficientDet-D2 es un modelo de detección de objetos de una sola etapa y basado en anclas, desarrollado originalmente por Google Brain (AutoML) y publicado en el paper "EfficientDet: Scalable and Efficient Object Detection" (arXiv:1911.09070). Esta variante concreta, publicada por el usuario zeromodels, es una conversión pura a Keras 3 de los pesos oficiales de Google AutoML, lo que permite ejecutar el mismo checkpoint de forma nativa en TensorFlow, PyTorch y JAX sin modificar el código. El modelo utiliza un backbone EfficientNet-B2, una red piramidal bidireccional con pesos aprendibles (BiFPN) y cabezales compartidos de clasificación y regresión de cajas. Opera a una resolución de entrada de 768×768 píxeles y está entrenado para detectar las 90 categorías del dataset COCO.

La relevancia de este modelo radica en su excelente equilibrio entre precisión y coste computacional, heredado del diseño original de EfficientDet, y en la portabilidad que ofrece la implementación en Keras 3: un único conjunto de pesos puede utilizarse en tres frameworks de deep learning. Esto lo convierte en una opción práctica para equipos que trabajan con distintos stacks tecnológicos o que desean migrar entre backends sin reentrenar. Al ser una conversión fiel de los pesos originales, mantiene el comportamiento del modelo publicado por Google, con licencia Apache 2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientDet-D2 (single-shot, anchor-based, con BiFPN) |
| Parametros totales | no disponible (el paper original reporta ~8,1 M para D2, pero no se confirma en esta conversion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio zeromodels, probablemente formato Keras/H5, no especificado) |

## Arquitectura y entrenamiento

EfficientDet-D2 sigue la arquitectura propuesta en el paper original: un backbone EfficientNet-B2 extrae características multiescala, que son fusionadas por una red BiFPN (bidirectional feature pyramid network) con pesos aprendibles por entrada. Sobre cada nivel de la pirámide se aplican dos cabezales compartidos: uno para clasificación (90 categorías COCO) y otro para regresión de cajas delimitadoras. El modelo es de una sola etapa y utiliza anclas predefinidas, decodificando las predicciones y aplicando supresión de no máximos (NMS) en el post-procesado.

Los pesos originales fueron entrenados por Google AutoML en el dataset COCO, aunque la conversión de zeromodels no modifica los pesos ni el procedimiento de entrenamiento. La implementación en Keras 3 permite cargar los mismos pesos desde Hugging Face y ejecutarlos en TensorFlow, PyTorch o JAX simplemente cambiando la variable de entorno `KERAS_BACKEND`. No se han documentado innovaciones adicionales en esta conversión más allá de la portabilidad entre frameworks. La resolución de entrada es fija a 768×768, pero los pesos son independientes de la resolución: se puede especificar un tamaño múltiplo de 128 mediante el parámetro `image_size`.

## Capacidades

- Detección de objetos en imágenes: localiza y clasifica objetos en 90 categorías del dataset COCO (personas, vehículos, animales, objetos cotidianos, etc.).
- Inferencia en tres backends: TensorFlow, PyTorch y JAX, mediante la misma API de Keras 3.
- Post-procesado integrado: decodificación de cajas, filtrado por umbral de confianza y NMS (agnóstico de clase por defecto, configurable a per-clase).
- Resolución de entrada ajustable: se puede especificar un tamaño de imagen múltiplo de 128 (por ejemplo, 512, 640, 768) sin necesidad de reentrenar.
- Carga sencilla desde Hugging Face: `from_weights` descarga los pesos y el procesador de imágenes automáticamente.
- Compatibilidad con modelos comunitarios: repositorios alojados en el formato zeromodels pueden cargarse de la misma manera.
- No incluye capacidades de generación de texto, razonamiento multimodal, tool calling ni agentes.

## Casos de uso

- Inspección visual en entornos industriales: el modelo puede detectar defectos o componentes en líneas de producción a partir de imágenes de cámaras fijas. Su tamaño reducido permite ejecutarlo en GPUs modestas o incluso en CPUs con optimizaciones, y la resolución de 768×768 ofrece un buen equilibrio entre detalle y velocidad.
- Vigilancia y seguridad perimetral: detección de personas, vehículos u objetos en tiempo real a partir de cámaras de vigilancia. La inferencia puede integrarse en pipelines de video con OpenCV o frameworks de streaming, y la portabilidad entre backends facilita su despliegue en entornos heterogéneos.
- Conteo de objetos en imágenes estáticas: por ejemplo, contar coches en aparcamientos, animales en fotografías aéreas o productos en estanterías. La salida de cajas y etiquetas permite agregar conteos por categoría con un simple script de post-procesado.
- Asistencia a la conducción autónoma (investigación): detección de peatones, señales de tráfico y otros vehículos en imágenes de cámaras montadas en vehículos de prueba. Al ser un modelo ligero, puede ejecutarse en hardware embebido para prototipos de bajo coste.
- Análisis de imágenes médicas (uso no clínico): detección de estructuras anatómicas o anomalías en radiografías o tomografías, siempre que las categorías COCO sean suficientes o se realice un fine-tuning posterior. La licencia Apache 2.0 permite adaptar el modelo a dominios específicos.
- Automatización de etiquetado para datasets: el modelo puede generar anotaciones preliminares de cajas y categorías para acelerar la creación de datasets de entrenamiento en tareas de detección personalizadas, reduciendo el esfuerzo manual de anotación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La conversion de zeromodels no incluye métricas de rendimiento en COCO ni comparaciones con otras implementaciones. El paper original de EfficientDet reporta un mAP de 43.0 en COCO val para la variante D2, pero este dato no se confirma en la documentación de esta conversión específica.

## Requisitos de hardware

- No se proporcionan datos concretos de VRAM, latencia o throughput en la informacion disponible.
- Dado el tamaño típico de EfficientDet-D2 (~8 M de parámetros), es esperable que pueda ejecutarse en GPUs de consumo como una RTX 3060 o superior, e incluso en CPU con tiempos de inferencia aceptables para imágenes individuales.
- La implementación en Keras 3 permite usar el backend de TensorFlow, PyTorch o JAX, por lo que el despliegue puede realizarse con cualquier framework de servido compatible (TensorFlow Serving, TorchServe, etc.).
- No se mencionan opciones de cuantización ni formatos optimizados como TensorRT u OpenVINO, aunque al ser un modelo estándar podrían aplicarse herramientas de conversión externas.
- Para producción a gran escala, se recomienda probar la inferencia en el hardware objetivo y ajustar el tamaño de entrada (múltiplo de 128) para equilibrar precisión y velocidad.

## Comparativa con modelos similares

La siguiente tabla compara cualitativamente EfficientDet-D2 con otros detectores de una etapa de tamaño similar. Los datos de precisión no están disponibles en la información proporcionada, por lo que se indican características generales.

| Modelo | Arquitectura | Resolución de entrada | Categorías | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientDet-D2 (zeromodels) | EfficientNet-B2 + BiFPN | 768×768 | 90 (COCO) | Apache 2.0 | Hugging Face |
| YOLOv5s (Ultralytics) | CSPDarknet + PANet | 640×640 | 80 (COCO) | GPL-3.0 | GitHub, PyPI |
| SSD300 (VGG16) | VGG16 + capas extra | 300×300 | 90 (COCO) | Apache 2.0 | TensorFlow Hub, PyTorch |

EfficientDet-D2 ofrece una precisión comparable a YOLOv3 según el paper original, pero con menor coste computacional. Frente a YOLOv5s, la principal ventaja de esta conversión es la portabilidad entre frameworks, mientras que YOLOv5s tiene un ecosistema más maduro para entrenamiento personalizado. SSD300 es más ligero pero con menor precisión en general.

## Limitaciones y advertencias

- El modelo está limitado a las 90 categorías de COCO; para otros objetos es necesario realizar fine-tuning.
- La resolución de entrada debe ser múltiplo de 128, lo que puede restringir ciertos usos con imágenes de tamaño arbitrario (sería necesario redimensionar o rellenar).
- El NMS por defecto es agnóstico de clase, lo que puede provocar que dos objetos solapados de diferentes categorías se fusionen en una sola detección. Se puede cambiar a per-clase con `class_agnostic=False`.
- No se han documentado sesgos específicos, pero al entrenarse en COCO puede presentar un rendimiento inferior en categorías poco representadas o en contextos muy diferentes a los del dataset (por ejemplo, imágenes aéreas o de gran angular).
- La conversión a Keras 3 no incluye herramientas de entrenamiento o fine-tuning documentadas en la información proporcionada; solo se menciona la carga de pesos y la inferencia.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicación reciente o poco probada por la comunidad; se recomienda validar su funcionamiento en un entorno de prueba antes de usarlo en producción.
- No se indica el formato exacto de los pesos (safetensors, H5, etc.), lo que puede complicar la integración con herramientas externas que esperan formatos estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zeromodels/efficientdet_d2
- Colección de variantes EfficientDet en Hugging Face: https://huggingface.co/collections/zeromodels/efficientdet
- Repositorio GitHub de ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentación de EfficientDet en ZeroModels: https://imvision12.github.io/ZeroModels/efficientdet/
- Paper original (arXiv): https://arxiv.org/abs/1911.09070
- Paper en Hugging Face Papers: https://huggingface.co/papers/1911.09070
- Repositorio original de Google AutoML: https://github.com/google/automl/tree/master/efficientdet
