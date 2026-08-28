# zeromodels/efficientdet_d1

## Resumen

EfficientDet-D1 es un detector de objetos de una sola pasada (single-shot) y basado en anclas (anchor-based), perteneciente a la familia EfficientDet propuesta por Google Brain/AutoML en el artículo *EfficientDet: Scalable and Efficient Object Detection* (arXiv:1911.09070). Este checkpoint concreto es una conversión pura a Keras 3 del modelo original `efficientdet-d1` de Google AutoML, realizada por el proyecto ZeroModels. La conversión permite ejecutar el mismo modelo sin modificaciones sobre TensorFlow, PyTorch o JAX, lo que facilita su integración en entornos heterogéneos.

El modelo combina un backbone EfficientNet-B1 con una red piramidal de características bidireccional ponderada (BiFPN) y cabezas de clasificación y regresión compartidas. Opera sobre imágenes de 640×640 píxeles y detecta objetos en las 90 categorías del conjunto COCO. Su relevancia actual radica en que ofrece un equilibrio muy eficiente entre precisión y coste computacional, y en que la implementación en Keras 3 elimina las barreras de dependencia de frameworks, permitiendo cargar y desplegar el modelo con una única API.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientDet-D1 (backbone EfficientNet-B1 + BiFPN + cabezas compartidas) |
| Parametros totales | 6,63 millones (aprox., según repackage de LibreYOLO) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | No especificado (carga mediante `from_weights` de zeromodels, compatible con Keras 3) |

## Arquitectura y entrenamiento

EfficientDet-D1 sigue la arquitectura propuesta en el paper original: un backbone EfficientNet-B1 extrae características multiescala, que son fusionadas por una BiFPN (bidirectional feature pyramid network) con pesos aprendibles por entrada. Sobre cada nivel de la pirámide se aplican una cabeza de clasificación y una de regresión de cajas compartidas. El modelo es de tipo *anchor-based* y realiza decodificación de anclas seguida de supresión de no máximos (NMS) para producir las detecciones finales.

El entrenamiento original se realizó sobre el conjunto COCO con una estrategia de escalado compuesto que ajusta resolución, profundidad y anchura de forma conjunta. En esta conversión a Keras 3 no se modifican los pesos; se reutilizan los pesos preentrenados del modelo de Google AutoML. No se ha realizado ningún ajuste adicional (fine-tuning) sobre esta versión. La implementación de ZeroModels permite cargar los pesos de forma independiente de la resolución, pudiendo especificar un tamaño de entrada múltiplo de 128.

## Capacidades

- Detección de objetos en 90 categorías del conjunto COCO (personas, vehículos, animales, objetos cotidianos, etc.).
- Inferencia sobre imágenes de 640×640 píxeles, con posibilidad de ajustar la resolución de entrada (múltiplo de 128) sin necesidad de reentrenar.
- Salida de cajas delimitadoras, puntuaciones de confianza y etiquetas de clase.
- Postprocesado integrado mediante `post_process_object_detection` que aplica umbral de confianza y NMS (agnóstico de clase por defecto, configurable a NMS por clase).
- Portabilidad entre backends: el mismo modelo puede ejecutarse en TensorFlow, PyTorch o JAX simplemente cambiando la variable de entorno `KERAS_BACKEND`.
- Carga de pesos desde el hub de HuggingFace mediante `from_weights`, compatible con variantes comunitarias en el mismo formato.

## Casos de uso

- Vigilancia y seguridad: detección de personas, vehículos u objetos en tiempo real sobre streams de vídeo. Gracias a su bajo coste computacional, puede ejecutarse en hardware modesto o en el edge.
- Control de inventario en almacenes: identificación y conteo de productos en estanterías a partir de imágenes capturadas por cámaras fijas o drones.
- Moderación de contenido visual: detección de objetos no deseados (armas, sustancias, etc.) en imágenes subidas a plataformas sociales.
- Asistencia a la conducción: detección de peatones, señales de tráfico y otros vehículos en sistemas ADAS o en investigación de conducción autónoma.
- Análisis de imágenes médicas (con fine-tuning): localización de estructuras anatómicas o anomalías en radiografías, aunque requiere adaptación al dominio.
- Robótica y automatización: guiado de brazos robóticos para localizar piezas en una cinta transportadora o en un entorno de trabajo estructurado.
- Indexación de imágenes: generación de metadatos descriptivos (objetos presentes) para motores de búsqueda visual o bases de datos patrimoniales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original de EfficientDet reporta métricas mAP en COCO para las variantes D0-D7, pero estos valores corresponden al entrenamiento original y no a esta conversión específica. Para obtener datos comparativos se recomienda consultar el artículo arXiv:1911.09070 o ejecutar el modelo sobre un conjunto de validación propio.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 6,6 millones de parámetros, la VRAM necesaria para inferencia es muy reducida. Con cuantización a FP16 cabría en GPUs con 2 GB o menos; en FP32 se estima un uso inferior a 100 MB de VRAM para los pesos, más el overhead de las activaciones.
- Es ejecutable en GPUs de consumo como NVIDIA GTX 1050 Ti, RTX 2060 o superiores, así como en hardware integrado (Jetson Nano, Raspberry Pi con acelerador) si se optimiza la inferencia.
- No requiere GPU de datacenter; una CPU moderna también puede realizar inferencia, aunque con mayor latencia.
- Opciones de despliegue: al ser una implementación Keras 3, puede servirse mediante TensorFlow Serving, TorchServe o un contenedor personalizado. También es posible exportar a TensorFlow Lite o Core ML para edge.
- La latencia dependerá del backend y del hardware; para una imagen de 640×640 en una GPU media se esperan decenas de milisegundos, pero no se dispone de cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. Como referencia cualitativa, EfficientDet-D1 se sitúa en la misma categoría que otros detectores ligeros como YOLOv5s o SSD-MobileNet, todos orientados a un equilibrio entre precisión y velocidad. La principal ventaja de esta conversión es la portabilidad entre frameworks, mientras que YOLO y SSD suelen estar atados a un ecosistema concreto. Para una comparación cuantitativa rigurosa se recomienda consultar el paper original y las benchmarks de COCO.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en las 90 categorías de COCO; no reconoce objetos fuera de ese vocabulario.
- La precisión puede degradarse con imágenes de baja resolución, oclusiones severas o condiciones de iluminación extremas, como es común en detectores de una sola pasada.
- No se ha realizado fine-tuning sobre dominios específicos; para aplicaciones especializadas (médico, industrial, etc.) es necesario adaptar el modelo con datos propios.
- La conversión a Keras 3 no garantiza una salida bit a bit idéntica a la implementación original de TensorFlow, aunque los pesos son los mismos.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe mantener el aviso de copyright y la atribución correspondiente.
- No se proporcionan pesos cuantizados ni versiones optimizadas para móviles; el usuario debe generar sus propias conversiones si las necesita.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/zeromodels/efficientdet_d1)
- [Colección EfficientDet en HuggingFace](https://hf.co/collections/zeromodels/efficientdet)
- [Paper original (arXiv)](https://arxiv.org/abs/1911.09070)
- [Repositorio ZeroModels (GitHub)](https://github.com/IMvision12/ZeroModels)
- [Documentación de EfficientDet en ZeroModels](https://imvision12.github.io/ZeroModels/efficientdet/)
- [Repositorio original de Google AutoML EfficientDet](https://github.com/google/automl/tree/master/efficientdet)
- [Repackage LibreYOLO de EfficientDet-D1](https://huggingface.co/LibreYOLO/LibreEfficientDetd1)
