# zeromodels/efficientdet_d4

## Resumen

El modelo `zeromodels/efficientdet_d4` es una conversión a Keras 3 del detector de objetos EfficientDet-D4 originalmente desarrollado por Google Brain / AutoML (Mingxing Tan, Ruoming Pang y Quoc V. Le). EfficientDet es una familia de detectores de una sola etapa basados en anclas que busca un equilibrio óptimo entre precisión y coste computacional mediante un escalado compuesto de la red. Esta variante concreta utiliza un backbone EfficientNet-B4, una red de pirámide de características bidireccional ponderada (BiFPN) y cabezas compartidas de clasificación y regresión, operando sobre imágenes de 1024x1024 píxeles y detectando las 90 categorías del conjunto COCO.

La relevancia de esta implementación radica en que, gracias a Keras 3, los mismos pesos pueden ejecutarse sin modificaciones en TensorFlow, PyTorch o JAX, lo que facilita su integración en pipelines existentes de diferentes ecosistemas. El modelo está publicado bajo licencia Apache 2.0 y el repositorio ocupa aproximadamente 0,1 GB. No se trata de un modelo de lenguaje, sino de un detector de objetos puramente visual, por lo que conceptos como longitud de contexto o idiomas no le aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientDet-D4 (backbone EfficientNet-B4 + BiFPN + cabezas compartidas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el repositorio usa `from_weights` de zeromodels) |

## Arquitectura y entrenamiento

EfficientDet-D4 sigue la arquitectura propuesta en el paper "EfficientDet: Scalable and Efficient Object Detection" (arXiv:1911.09070). Se compone de un backbone EfficientNet-B4 que extrae características multiescala, una BiFPN (red de pirámide de características bidireccional ponderada) que fusiona esas características con pesos aprendibles por entrada, y dos cabezas compartidas (una de clasificación y otra de regresión de cajas) que operan sobre cada nivel de la pirámide. El detector es de una sola etapa y basado en anclas; las predicciones se decodifican contra anclas predefinidas y se filtran mediante NMS.

El modelo original fue entrenado por Google sobre el conjunto COCO (90 categorías) con una resolución de entrada de 1024x1024. Esta conversión de zeromodels no añade entrenamiento adicional; simplemente reimplementa los pesos en Keras 3 manteniendo la misma funcionalidad. La innovación técnica principal de EfficientDet es el escalado compuesto (compound scaling) que ajusta simultáneamente resolución, profundidad y anchura de la red, junto con la BiFPN que mejora la fusión de características multiescala respecto a FPN tradicionales.

## Capacidades

- Deteccion de objetos en imagenes: localiza y clasifica objetos en las 90 categorias de COCO (personas, vehiculos, animales, objetos cotidianos, etc.).
- Soporte multi-backend: los pesos se pueden ejecutar con TensorFlow, PyTorch o JAX simplemente configurando la variable de entorno `KERAS_BACKEND`.
- Resolucion de entrada configurable: aunque el checkpoint esta optimizado para 1024x1024, se puede pasar un `image_size` multiplo de 128 para adaptar el modelo a otras resoluciones.
- NMS configurable: por defecto el NMS es agnostico de clase (una caja por objeto), pero se puede cambiar a NMS por clase con `class_agnostic=False`.
- Salida de deteccion completa: incluye cajas, puntuaciones y nombres de etiqueta mediante el metodo `post_process_object_detection`.
- No incluye capacidades de generacion de texto, tool calling, agentes ni procesamiento de lenguaje natural.

## Casos de uso

- Vigilancia y seguridad perimetral: detectar personas, vehiculos u objetos sospechosos en tiempo real a partir de camaras fijas o drones. La resolucion de 1024 permite captar detalles en escenas amplias.
- Conteo de objetos en entornos industriales: contar unidades de producto en lineas de fabricacion o almacenes. El modelo es ligero y puede ejecutarse en hardware modesto.
- Asistencia a la conduccion: detectar peatones, ciclistas, senales de trafico y otros vehiculos en imagenes de camaras frontales. Su latencia moderada lo hace util para prototipos.
- Analisis de imagenes medicas: aunque no esta entrenado especificamente, puede servir para detectar objetos anatomicos o instrumentos en radiografias o ecografias con un fine-tuning posterior.
- Robotica de manipulacion: localizar objetos en el entorno del robot para tareas de agarre o clasificacion. La API de Keras 3 facilita la integracion en sistemas basados en Python.
- Moderacion de contenido visual: detectar objetos inapropiados (armas, drogas, etc.) en imagenes subidas por usuarios. El modelo puede procesar imagenes a 1024x1024 con un unico forward.
- Agricultura de precision: contar frutas o detectar plagas en imagenes aereas o de campo. Su tamano reducido permite desplegarlo en dispositivos edge con GPU de baja potencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original de EfficientDet reporta mejoras de precision sobre YOLOv3 y otros detectores de la epoca, pero esta conversion concreta no incluye tablas comparativas en su model card. Se recomienda consultar el articulo de arXiv para obtener datos de mAP y latencia de la familia completa.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de vision con ~20 millones de parametros (estimacion no confirmada) y entrada 1024x1024, la inferencia con batch 1 deberia requerir menos de 4 GB de VRAM en precision float32. Con cuantizacion a int8 podria reducirse a ~1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060, o superiores. En el lado de datacenter, una T4 o V100 es mas que suficiente.
- Compatibilidad con GPU de consumo: si, cabe en la mayoria de GPUs consumer actuales.
- Opciones de despliegue: al ser Keras 3, se puede exportar a TensorFlow SavedModel, TFLite o ONNX para servir con TensorFlow Serving, ONNX Runtime o TFLite. Tambien se puede ejecutar directamente en Python con cualquiera de los tres backends.
- Latencia y throughput: no disponibles. Depende de la GPU y del backend elegido. En una RTX 3060, una inferencia a 1024x1024 podria rondar los 20-50 ms, pero es una estimacion sin mediciones reales.

## Comparativa con modelos similares

| Modelo | Backbone | Resolucion | Categorias | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientDet-D4 (este) | EfficientNet-B4 | 1024 | 90 COCO | Apache-2.0 | HuggingFace |
| YOLOv5l | CSPDarknet53 | 640 | 80 COCO | GPL-3.0 | Ultralytics |
| RetinaNet-R50 | ResNet-50 | 800 | 80 COCO | Apache-2.0 | Torchvision |

No se dispone de datos comparativos de rendimiento (mAP, FPS) en la informacion proporcionada. La comparativa se limita a caracteristicas arquitectonicas y de licencia. EfficientDet-D4 ofrece mayor resolucion de entrada que YOLOv5l, pero YOLOv5 tiene mas soporte de la comunidad y herramientas de exportacion. RetinaNet es un clasico con arquitectura similar pero sin BiFPN.

## Limitaciones y advertencias

- Sesgos del conjunto COCO: el modelo puede tener un rendimiento desigual en categorias poco representadas o en imagenes de dominios muy distintos (por ejemplo, imagenes medicas o de satelite).
- Alucinacion: no aplica, al ser un modelo discriminativo, no generativo. Sin embargo, puede producir falsos positivos con umbrales bajos de confianza.
- Cobertura limitada: solo detecta las 90 categorias de COCO; no es un detector de objetos abierto.
- Resolucion minima: la entrada debe ser multiplo de 128, lo que puede requerir redimensionar imagenes y perder detalle en objetos pequenos.
- Dependencia de Keras 3: requiere instalar zeromodels y configurar el backend correctamente antes de importar; errores de configuracion pueden causar fallos silenciosos.
- Licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo original de Google no incluye garantias de exactitud.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/zeromodels/efficientdet_d4)
- [Paper original (arXiv:1911.09070)](https://arxiv.org/abs/1911.09070)
- [Repositorio oficial de Google AutoML EfficientDet](https://github.com/google/automl/tree/master/efficientdet)
- [Repositorio de ZeroModels](https://github.com/IMvision12/ZeroModels)
- [Documentacion de EfficientDet en ZeroModels](https://imvision12.github.io/ZeroModels/efficientdet/)
- [Coleccion de EfficientDet en HuggingFace](https://hf.co/collections/zeromodels/efficientdet)
