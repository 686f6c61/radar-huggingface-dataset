# zeromodels/efficientdet_d7

## Resumen

EfficientDet-D7 es un detector de objetos de una sola etapa (single-shot) y basado en anclas (anchor-based), desarrollado originalmente por Google Brain / AutoML (Mingxing Tan, Ruoming Pang y Quoc V. Le) y publicado en el paper "EfficientDet: Scalable and Efficient Object Detection" (arXiv:1911.09070). Este checkpoint concreto es una conversión pura a Keras 3 del modelo `efficientdet-d7` del repositorio oficial de Google AutoML, realizada por la organización zeromodels. La conversión permite ejecutar el mismo código sin modificaciones en TensorFlow, PyTorch o JAX, lo que facilita su integración en distintos ecosistemas.

El modelo combina un backbone EfficientNet-B6 con una red de pirámide de características bidireccional ponderada (BiFPN) y cabezas compartidas de clasificación y regresión de cajas. Opera a una resolución de entrada de 1536×1536 píxeles y detecta las 90 categorías del conjunto de datos COCO. Es la variante más grande de la familia EfficientDet (D0-D7) y ofrece la mejor precisión a costa de un mayor coste computacional. Su relevancia actual radica en que sigue siendo una referencia para tareas de detección de objetos en entornos de producción, especialmente cuando se requiere un equilibrio entre precisión y eficiencia, y ahora con la ventaja de poder ejecutarse en múltiples backends gracias a Keras 3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientDet-D7: backbone EfficientNet-B6 + BiFPN + cabezas compartidas de clasificación y regresión (single-shot, anchor-based) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | no especificado (repo de 0.2 GB, probablemente formato Keras H5 o similar; no se indica safetensors) |

## Arquitectura y entrenamiento

EfficientDet-D7 sigue el diseño de la familia EfficientDet: un backbone EfficientNet-B6 extrae características multiescala, que son fusionadas por una red BiFPN (weighted bidirectional feature pyramid network) con pesos de fusión aprendibles por nivel. Sobre cada nivel de la pirámide se aplican una cabeza de clasificación y una de regresión de cajas, compartidas entre todos los niveles. El modelo es de una sola etapa y basado en anclas: genera predicciones por ancla que posteriormente se decodifican y filtran con NMS (supresión de no máximos). La resolución de entrada es de 1536×1536, la más alta de la familia, y cada lado debe ser divisible por 128.

El entrenamiento original se realizó sobre el conjunto de datos COCO (90 categorías), utilizando la técnica de escalado compuesto (compound scaling) que ajusta simultáneamente profundidad, anchura y resolución. No se dispone de información sobre el número exacto de épocas, el tamaño del lote o si se emplearon técnicas adicionales como aumento de datos o entrenamiento con múltiples resoluciones. La conversión a Keras 3 mantiene los pesos originales del modelo de TensorFlow, por lo que las características aprendidas son idénticas a las del checkpoint oficial de Google AutoML.

## Capacidades

- Detección de objetos en imágenes: localiza y clasifica objetos dentro de las 90 categorías de COCO (personas, vehículos, animales, objetos cotidianos, etc.).
- Detección multiescala: gracias a la BiFPN, el modelo maneja objetos de diferentes tamaños dentro de la misma imagen.
- Salida estructurada: devuelve cajas delimitadoras, puntuaciones de confianza y etiquetas de clase por cada detección.
- NMS configurable: por defecto es class-agnostic (una sola caja por objeto), pero se puede cambiar a NMS por clase.
- Flexibilidad de resolución: aunque el checkpoint está entrenado a 1536×1536, los pesos son independientes de la resolución y se puede especificar un tamaño personalizado (múltiplo de 128) al cargar el modelo.
- Compatibilidad multi-backend: el mismo código funciona en TensorFlow, PyTorch y JAX mediante Keras 3, lo que facilita su uso en diferentes entornos.
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multimodal; es exclusivamente un detector de objetos.

## Casos de uso

- Vigilancia y seguridad: detección de personas, vehículos u objetos en tiempo real a partir de cámaras de seguridad. El modelo puede procesar imágenes de alta resolución (1536×1536) y detectar múltiples objetos simultáneamente, lo que permite monitorizar escenas complejas con alta densidad de objetos.
- Inspección industrial automatizada: localización de defectos o componentes en líneas de producción. Al entrenarse en COCO, el modelo reconoce objetos genéricos; para dominios específicos se puede fine-tuning sobre datos propios, aprovechando la arquitectura eficiente.
- Conteo de objetos en imágenes aéreas o satelitales: detección de vehículos, edificios o embarcaciones en imágenes de gran tamaño. La resolución de entrada alta (1536×1536) ayuda a captar detalles finos.
- Vehículos autónomos y asistencia a la conducción: detección de peatones, señales de tráfico, otros vehículos y obstáculos en imágenes de cámaras. El modelo puede integrarse en pipelines de percepción, aunque requiere hardware potente para inferencia en tiempo real.
- Análisis de imágenes médicas (con fine-tuning): detección de estructuras anatómicas o anomalías en radiografías, tomografías o resonancias. Aunque no está preentrenado para dominios médicos, su arquitectura escalable permite adaptarlo con un número moderado de datos etiquetados.
- Organización de bibliotecas de imágenes: indexación automática de fotos por contenido (personas, animales, objetos) para motores de búsqueda visual o gestión de activos digitales. El modelo puede procesar lotes de imágenes y generar metadatos de etiquetas y localización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original de EfficientDet reporta métricas de precisión media (mAP) en COCO para las variantes D0-D7, y la variante D7 alcanza el mejor rendimiento de la familia, pero no se incluyen cifras concretas en la documentación de este checkpoint. Se recomienda consultar el paper original (arXiv:1911.09070) para obtener los valores exactos de mAP y comparaciones con otros detectores como YOLOv3 o Faster R-CNN.

## Requisitos de hardware

- VRAM estimada para inferencia: no especificada por el autor. Dado el tamaño del repo (0.2 GB de pesos) y la resolución de entrada de 1536×1536, se estima que la inferencia requiere al menos 16 GB de VRAM en GPU para un lote de tamaño 1, y más si se aumenta el lote o se usan resoluciones personalizadas superiores.
- GPU recomendadas: tarjetas de gama alta como NVIDIA RTX 3090, RTX 4090, A100 o H100. En GPUs con menos de 16 GB puede ser necesario reducir la resolución de entrada o usar cuantización (no disponible en la información).
- Si cabe en consumer GPU: sí, en GPUs de 16 GB o más (por ejemplo, RTX 3090, RTX 4080/4090), pero con limitaciones de tamaño de lote y resolución.
- Opciones de despliegue: al ser un modelo Keras 3, se puede servir con TensorFlow Serving, TorchServe, o mediante frameworks de inferencia como vLLM (aunque no es un modelo de lenguaje). También se puede exportar a ONNX o TensorRT para optimizar la inferencia en producción. No se mencionan integraciones específicas con Ollama o llama.cpp (orientados a modelos de lenguaje).
- Latencia y throughput: no disponibles en la información. Dependen del hardware, el tamaño de lote y la resolución de entrada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolución entrada | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientDet-D7 (este) | EfficientNet-B6 + BiFPN | 1536×1536 | no disponible | Apache-2.0 | HuggingFace, código abierto |
| YOLOv8x (Ultralytics) | CNN single-shot, anchor-free | 640 (variable) | ~68 M | AGPL-3.0 | Ultralytics, código abierto |
| DETR (Facebook) | Transformer + CNN | 800×1333 | ~41 M | Apache-2.0 | HuggingFace, código abierto |

Nota: los datos de parámetros y resolución de YOLOv8x y DETR son aproximados y provienen de fuentes públicas generales, no de la información proporcionada. No se dispone de comparativas de rendimiento (mAP) en la documentación del modelo. EfficientDet-D7 se distingue por su alta resolución de entrada y su diseño eficiente con BiFPN, mientras que YOLOv8 ofrece un equilibrio velocidad-precisión y DETR introduce un enfoque basado en transformers sin anclas.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo fue entrenado en COCO, que contiene sesgos inherentes de ese conjunto de datos (por ejemplo, subrepresentación de ciertas categorías o contextos geográficos). No se han documentado sesgos adicionales específicos de esta conversión.
- Riesgo de alucinación: no aplica, al ser un modelo discriminativo de detección de objetos, no genera texto. Sin embargo, puede producir falsos positivos (detectar objetos inexistentes) o falsos negativos (omitir objetos presentes), especialmente en condiciones de iluminación adversa, oclusiones o clases poco representadas.
- Limitaciones de contexto o idioma: no aplica (modelo de visión).
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright y se indiquen los cambios realizados. No hay restricciones de uso militar o de vigilancia explícitas.
- Caveats para producción: la resolución de entrada debe ser múltiplo de 128; si se usa una resolución diferente, el rendimiento puede degradarse. El NMS por defecto es class-agnostic, lo que puede fusionar cajas de diferentes clases para el mismo objeto; se debe ajustar `class_agnostic=False` si se necesita NMS por clase. El modelo no incluye un mecanismo de decodificación de cajas integrado; se debe usar el `EfficientDetImageProcessor` para post-procesar las salidas. La inferencia en tiempo real requiere hardware potente; para despliegues con recursos limitados se recomienda usar variantes más pequeñas (D0-D4) o reducir la resolución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeromodels/efficientdet_d7
- Colección de variantes EfficientDet: https://hf.co/collections/zeromodels/efficientdet
- Paper original: https://arxiv.org/abs/1911.09070
- Repositorio oficial de Google AutoML: https://github.com/google/automl/tree/master/efficientdet
- Repositorio de ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentación de EfficientDet en ZeroModels: https://imvision12.github.io/ZeroModels/efficientdet/
- Tutorial oficial de EfficientDet (Colab): https://colab.research.google.com/github/google/automl/blob/master/efficientdet/tutorial.ipynb
