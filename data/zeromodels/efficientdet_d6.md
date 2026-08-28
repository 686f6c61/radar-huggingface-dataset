# zeromodels/efficientdet_d6

## Resumen

EfficientDet-D6 es un detector de objetos de una sola pasada (single-shot) y basado en anclas, desarrollado originalmente por Google Brain / AutoML (Mingxing Tan, Ruoming Pang y Quoc V. Le) y presentado en el artículo "EfficientDet: Scalable and Efficient Object Detection" (arXiv:1911.09070). La versión alojada en `zeromodels/efficientdet_d6` es una conversión pura a Keras 3 de la implementación original de Google AutoML, lo que permite ejecutar el mismo checkpoint sin modificaciones sobre TensorFlow, PyTorch o JAX.

El modelo combina un backbone EfficientNet-B6 con una red piramidal de características bidireccional ponderada (BiFPN) y cabezales compartidos de clasificación y regresión de cajas. Opera a una resolución de entrada de 1280x1280 píxeles y está entrenado para detectar las 90 categorías del dataset COCO. Su relevancia actual radica en que ofrece un equilibrio entre precisión y coste computacional, y en que esta conversión a Keras 3 facilita su integración en proyectos modernos que usan cualquiera de los tres frameworks principales.

El repositorio tiene un tamaño de 0.2 GB y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas. Forma parte de una colección completa de variantes EfficientDet (D0 a D7) publicadas por el mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientDet-D6 (backbone EfficientNet-B6 + BiFPN + cabezales compartidos de clasificación y caja) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cargados vía `from_weights` de zeromodels) |

## Arquitectura y entrenamiento

EfficientDet-D6 sigue la arquitectura propuesta en el paper original: un backbone EfficientNet-B6 extrae características multiescala que se fusionan mediante una BiFPN (red piramidal de características bidireccional ponderada). La BiFPN aprende pesos por entrada para combinar características de diferentes resoluciones, lo que mejora la fusión frente a sumas simples. Sobre cada nivel de la pirámide se aplican dos cabezales compartidos: uno de clasificación y otro de regresión de cajas. El modelo es de una sola pasada y basado en anclas; las predicciones se decodifican contra anclas predefinidas y se filtran con NMS (supresión de no máximos) para obtener las detecciones finales.

El entrenamiento original se realizó sobre el dataset COCO con las 90 categorías estándar. La conversión de zeromodels no modifica los pesos, sino que reimplementa la arquitectura en Keras 3 puro, lo que garantiza que los resultados sean equivalentes a los de la implementación original de Google AutoML. Los pesos son independientes de la resolución: se puede especificar un tamaño de imagen personalizado (múltiplo de 128) al cargar el modelo.

## Capacidades

- Detección de objetos en imágenes: localiza y clasifica objetos dentro de las 90 categorías de COCO.
- Salida de cajas delimitadoras, puntuaciones de confianza y nombres de etiqueta por detección.
- NMS configurable: por defecto es agnóstico de clase (una caja por objeto), pero se puede cambiar a NMS por clase con `class_agnostic=False`.
- Resolución de entrada flexible: el checkpoint se puede ejecutar a cualquier tamaño múltiplo de 128, aunque el tamaño nativo es 1280x1280.
- Multi-backend: el mismo modelo funciona sin cambios sobre TensorFlow, PyTorch o JAX mediante la variable de entorno `KERAS_BACKEND`.
- Dos modos de uso: `EfficientDetDetect` (con decodificación de cajas y NMS integrados) y `EfficientDetModel` (salidas crudas por nivel de pirámide, útil para fine-tuning o integraciones personalizadas).

## Casos de uso

- Inspección visual en fabricación: detectar defectos o piezas defectuosas en líneas de producción. El modelo puede procesar imágenes de alta resolución (1280x1280) y su precisión en COCO lo hace adecuado para tareas de control de calidad con datasets personalizados mediante fine-tuning.
- Vigilancia y seguridad: detección de personas, vehículos u objetos en cámaras de circuito cerrado. La ventana de entrada grande permite captar escenas completas con múltiples objetos pequeños.
- Análisis de imágenes médicas: localización de estructuras anatómicas o anomalías en radiografías, TC o resonancias. El modelo se puede ajustar con datos médicos específicos.
- Vehículos autónomos y asistencia a la conducción: detección de peatones, señales de tráfico, otros vehículos y obstáculos. La latencia de una sola pasada y la precisión de EfficientDet-D6 lo hacen utilizable en prototipos de percepción.
- Agricultura de precisión: conteo y localización de frutos, plantas o plagas en imágenes aéreas o de campo. La resolución de entrada alta favorece la detección de objetos pequeños.
- Robótica y automatización: guiado visual de brazos robóticos para localizar y manipular objetos en entornos controlados. La integración con Keras 3 permite desplegar el modelo en pipelines de ROS o sistemas embebidos con soporte de los tres frameworks.
- Análisis de imágenes de satélite o drones: detección de edificios, vehículos o cambios en el terreno. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Benchmarks y rendimiento

En la información proporcionada no se incluyen resultados de benchmarks específicos para este checkpoint convertido. El paper original de EfficientDet reporta para EfficientDet-D6 una precisión media promedio (mAP) de 51.7 en COCO val2017 con una latencia de 52 ms por imagen en una GPU V100 (a 1280x1280). Estos datos provienen de la publicación original de Google AutoML y no se han verificado de forma independiente en esta conversión. Se recomienda reproducir las métricas en el entorno de despliegue objetivo.

## Requisitos de hardware

- VRAM estimada: para inferencia a 1280x1280 con precisión FP32, se estima un consumo de 8-12 GB de VRAM, dependiendo del backend y del tamaño de lote. Con cuantización o tamaños de entrada menores, el consumo se reduce proporcionalmente.
- GPU recomendadas: una GPU con al menos 12 GB de VRAM (p. ej., RTX 3060/4070, A10, L4) para inferencia cómoda. Para fine-tuning se recomiendan GPUs con 24 GB o más (RTX 3090/4090, A100, H100).
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de gama media-alta de consumo (RTX 3060 12GB o superiores) si se reduce la resolución de entrada o se usa un backend optimizado.
- Opciones de despliegue: al ser Keras 3 puro, se puede exportar a TensorFlow Serving, TorchServe o JAX Serving. También se puede convertir a formatos optimizados como TensorRT u OpenVINO mediante la exportación desde cualquiera de los tres backends. No se menciona soporte directo para vLLM, llama.cpp u Ollama, ya que son herramientas para modelos de lenguaje, no para visión.
- Latencia y throughput: en el paper original se reportan 52 ms por imagen en V100 para D6 a 1280x1280. En hardware moderno (A100, RTX 4090) la latencia puede ser menor, pero no se dispone de datos verificados para esta conversión.

## Comparativa con modelos similares

| Modelo | Backbone | Resolución de entrada | mAP COCO (paper) | Licencia | Formato |
|---|---|---|---|---|---|
| EfficientDet-D6 (este) | EfficientNet-B6 | 1280 | 51.7 | Apache 2.0 | Keras 3 (TF/Torch/JAX) |
| EfficientDet-D5 | EfficientNet-B5 | 1280 | 51.2 | Apache 2.0 | Keras 3 (TF/Torch/JAX) |
| EfficientDet-D4 | EfficientNet-B4 | 1024 | 49.7 | Apache 2.0 | Keras 3 (TF/Torch/JAX) |
| YOLOv5x | CSPDarknet | 640-1280 | 50.4 (aprox.) | GPL-3.0 | PyTorch |
| RTMDet-x | CSPNeXt | 640 | 52.8 | Apache 2.0 | PyTorch |

Los datos de mAP de los EfficientDet provienen del paper original. Los de YOLOv5x y RTMDet-x son aproximados y dependen de la configuración de entrenamiento. La ventaja principal de esta conversión es la portabilidad entre backends y la licencia permisiva.

## Limitaciones y advertencias

- Entrenado únicamente en COCO: solo detecta las 90 categorías de ese dataset. Para otras clases es necesario fine-tuning.
- Riesgo de alucinación en detección: puede producir detecciones falsas con umbrales de confianza bajos. Se recomienda usar umbrales de 0.3-0.4 como sugiere la documentación.
- Resolución de entrada fija por variante: aunque se puede cambiar el tamaño a múltiplos de 128, cambiar la resolución afecta al rendimiento esperado.
- Sin datos de cuantización: no se proporcionan pesos cuantizados ni guías de cuantización para este checkpoint.
- Sin benchmarks verificados para la conversión: los datos de rendimiento provienen del paper original y pueden variar en esta implementación.
- Dependencia de zeromodels: para cargar los pesos se necesita la librería `zeromodels`, que es un proyecto independiente y podría no tener el mismo mantenimiento que la implementación original.
- Sin soporte de visión por lotes optimizado documentado: no se especifican throughputs para inferencia por lotes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeromodels/efficientdet_d6
- Colección de variantes EfficientDet: https://huggingface.co/collections/zeromodels/efficientdet
- Repositorio ZeroModels en GitHub: https://github.com/IMvision12/ZeroModels
- Documentación de EfficientDet en ZeroModels: https://imvision12.github.io/ZeroModels/efficientdet/
- Paper original (arXiv): https://arxiv.org/abs/1911.09070
- Paper en HuggingFace: https://huggingface.co/papers/1911.09070
- Repositorio original de Google AutoML: https://github.com/google/automl/tree/master/efficientdet
- Tutorial de EfficientDet en Colab (Google): https://colab.research.google.com/github/google/automl/blob/master/efficientdet/tutorial.ipynb
