# zeromodels/efficientdet_d5

## Resumen

EfficientDet-D5 es un detector de objetos de una etapa, basado en anclas, desarrollado originalmente por Google Brain (Mingxing Tan, Ruoming Pang y Quoc V. Le) y presentado en el artículo "EfficientDet: Scalable and Efficient Object Detection" (arXiv:1911.09070). Esta versión concreta, publicada por el usuario zeromodels, es una conversión pura a Keras 3 de la implementación oficial de Google AutoML, lo que permite ejecutar el mismo modelo sin modificaciones sobre TensorFlow, PyTorch o JAX. El modelo combina un backbone EfficientNet-B5 con una red piramidal bidireccional ponderada (BiFPN) y cabezas de clasificación y regresión compartidas, procesando imágenes de 1280x1280 píxeles sobre las 90 categorías del dataset COCO. Su relevancia radica en ofrecer un equilibrio entre precisión y coste computacional, siendo una opción sólida para tareas de detección de objetos en entornos de producción, ahora disponible en un formato unificado para múltiples frameworks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientDet-D5 (single-shot, anchor-based, backbone EfficientNet-B5, BiFPN, cabezas compartidas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (vision por computador) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos Keras, formato no especificado) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EfficientDet original: un backbone EfficientNet-B5 extrae características multiescala, que son fusionadas por una red BiFPN con pesos aprendibles por entrada para combinar niveles de resolución. Sobre cada nivel piramidal se aplican una cabeza de clasificación y una de regresión de cajas compartidas. La decodificación final se realiza mediante anclas y supresión de no máximos (NMS). El entrenamiento original se realizó sobre el dataset COCO con las 90 categorías estándar, aunque esta conversión no incluye información sobre el número de tokens de entrenamiento ni detalles de optimización. La innovación principal es el escalado compuesto (compound scaling) que ajusta simultáneamente resolución, profundidad y anchura, y el uso de BiFPN con pesos aprendibles, que mejora la fusión de características sin aumentar significativamente el coste. Esta versión en Keras 3 añade la ventaja de portabilidad entre backends sin cambios en el código.

## Capacidades

- Deteccion de objetos en imagenes: localiza y clasifica multiples objetos en una sola pasada, devolviendo cajas delimitadoras, etiquetas y puntuaciones de confianza.
- Soporte de las 90 categorias del dataset COCO (personas, vehiculos, animales, objetos cotidianos, etc.).
- Procesamiento multiescala gracias al BiFPN, capaz de detectar objetos de distintos tamanos en la misma imagen.
- Integracion con el ecosistema Keras 3: se puede ejecutar con backend TensorFlow, PyTorch o JAX sin modificar el codigo.
- Decodificacion flexible: NMS por defecto agnostica a clases (una caja por objeto), con opcion de NMS por clase.
- Los pesos son independientes de la resolucion: se puede especificar un tamano de entrada multiplo de 128 para ajustar el rendimiento.

## Casos de uso

- Vigilancia y seguridad: deteccion de personas, vehiculos u objetos en tiempo real en camaras de seguridad, aprovechando la eficiencia del modelo para ejecutarse en GPU de gama media.
- Conteo y analisis de trafico: identificar y contar vehiculos en imagenes de carreteras o cruces, usando la salida de cajas y clases para estadisticas.
- Inspeccion industrial: localizar defectos o piezas en lineas de produccion mediante deteccion de anomalias sobre imagenes de alta resolucion (hasta 1280x1280).
- Robotica y navegacion: deteccion de obstaculos o puntos de interes en entornos controlados, con integracion en pipelines de vision de ROS.
- Etiquetado automatico de datos: pre-anotar imagenes para acelerar la creacion de datasets de entrenamiento en tareas de deteccion personalizadas.
- Aplicaciones moviles o web: al ser una conversion ligera (0.1 GB), puede desplegarse en servidores con inferencia por lotes o en dispositivos con aceleracion via TensorFlow Lite, aunque se recomienda validar el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de rendimiento (mAP, latencia, etc.) para este checkpoint concreto. El paper original de EfficientDet (arXiv:1911.09070) reporta resultados en COCO, pero esos datos no estan reproducidos en la documentacion de esta conversion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado el tamano de entrada de 1280x1280 y la complejidad del modelo, se recomienda al menos 8 GB de VRAM para inferencia con batch 1, aunque no es un dato oficial.
- GPU recomendadas: no se especifican. Para una ejecucion fluida se sugiere una GPU de gama media-alta (por ejemplo, RTX 3060 o superior). Tambien puede ejecutarse en CPU para pruebas, con mayor latencia.
- Compatibilidad con consumer GPU: probablemente si, en cuantizaciones o con resoluciones reducidas, pero no hay datos confirmados.
- Opciones de despliegue: al ser Keras 3, se puede servir con TensorFlow Serving, TorchServe o mediante frameworks de inferencia como vLLM (aunque vLLM esta orientado a LLMs, no a vision). Para produccion, se puede exportar a TensorFlow Lite o ONNX, aunque no se documenta en la ficha.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion disponible no incluye comparativas con otros modelos. Se puede comparar con otras variantes de EfficientDet (D0 a D7) en terminos de resolucion de entrada y backbone, pero no hay datos de rendimiento. Alternativas de la misma categoria (detectores de una etapa) incluyen YOLOv3, RetinaNet o SSD, pero no se proporcionan metricas comparativas. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo fue entrenado en COCO, que puede contener sesgos en las categorias y en la representacion de ciertos grupos demograficos o escenarios. No se documentan sesgos especificos para esta conversion.
- Riesgo de alucinacion: no aplica, al ser un modelo discriminativo de deteccion, no generativo. Sin embargo, puede producir falsos positivos o negativos dependiendo del umbral de confianza.
- Limitaciones de contexto o idioma: no aplica, es un modelo de vision sin componente de lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se mantenga el aviso de copyright.
- Caveat para produccion: la resolucion de entrada fija de 1280x1280 puede ser costosa en recursos; se recomienda ajustar el tamano de imagen segun las necesidades de latencia y precision. Ademas, la conversion a Keras 3 puede tener diferencias numericas menores respecto a la implementacion original de TensorFlow, por lo que se debe validar el comportamiento en el entorno objetivo.

## Enlaces

- HuggingFace: https://huggingface.co/zeromodels/efficientdet_d5
- Coleccion de EfficientDet en HuggingFace: https://hf.co/collections/zeromodels/efficientdet
- Paper original: https://arxiv.org/abs/1911.09070
- Repositorio de Google AutoML (implementacion original): https://github.com/google/automl/tree/master/efficientdet
- Repositorio de ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentacion de EfficientDet en ZeroModels: https://imvision12.github.io/ZeroModels/efficientdet/
- Tutorial oficial de EfficientDet (Google Colab): https://colab.research.google.com/github/google/automl/blob/master/efficientdet/tutorial.ipynb
