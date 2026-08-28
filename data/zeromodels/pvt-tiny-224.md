# zeromodels/pvt-tiny-224

## Resumen

PVT (Pyramid Vision Transformer) es un transformer visual jerárquico propuesto en el artículo "Pyramid Vision Transformer: A Versatile Backbone for Dense Prediction without Convolutions" (arXiv:2102.12122). Esta implementación concreta, `zeromodels/pvt-tiny-224`, es una conversión pura en Keras 3 del checkpoint original `Zetatech/pvt-tiny-224`, preentrenado en ImageNet-1k. El modelo resuelve tareas de clasificación de imágenes y extracción de características (backbone) para predicción densa, como segmentación semántica o detección de objetos.

Con aproximadamente 13,2 millones de parámetros, emplea una arquitectura de cuatro etapas piramidales con atención de reducción espacial (spatial-reduction attention) sobre parches no solapados y embeddings posicionales aprendidos. Alcanza un 75,1% de top-1 en ImageNet-1k. Su relevancia radica en que ofrece una única implementación en Keras 3 que se ejecuta sin modificaciones en TensorFlow, PyTorch y JAX, lo que facilita su integración en distintos ecosistemas de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pyramid Vision Transformer (PVT), 4 etapas jerárquicas con spatial-reduction attention |
| Parametros totales | ~13,2 millones |
| Longitud de contexto | no disponible (modelo de visión; entrada de 224x224 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras 3 (H5/weights), compatible con TensorFlow, PyTorch y JAX |

## Arquitectura y entrenamiento

PVT es un transformer visual jerárquico con cuatro etapas piramidales. Cada etapa procesa parches no solapados de la imagen y emplea atención con reducción espacial, un mecanismo que reduce la complejidad computacional frente a la atención estándar al disminuir la resolución de las claves y valores. El modelo utiliza embeddings posicionales aprendidos y produce una pirámide de características en cuatro niveles, lo que lo hace adecuado como backbone para tareas de predicción densa.

El checkpoint fue preentrenado en ImageNet-1k (ILSVRC2012), un conjunto de datos con aproximadamente 1 millón de imágenes y 1.000 clases, a una resolución de 224x224 píxeles. La conversión a Keras 3 mantiene la normalización integrada en el grafo, de modo que se pueden pasar píxeles crudos en rango [0, 255] directamente al modelo. No se dispone de información sobre el uso de técnicas de alineación como RLHF o DPO, que por otro lado no son habituales en modelos de visión por computador.

## Capacidades

- Clasificación de imágenes: devuelve logits de clase para las 1.000 categorías de ImageNet-1k mediante la clase `PvtImageClassify`.
- Extracción de características como backbone: la clase `PvtModel` con `as_backbone=True` devuelve una pirámide de características de cuatro etapas, útil para tareas de predicción densa como segmentación semántica o detección de objetos.
- Multi-framework: la misma implementación en Keras 3 se ejecuta sin modificaciones en TensorFlow, PyTorch o JAX, seleccionable mediante la variable de entorno `KERAS_BACKEND`.
- Compatibilidad con formatos de datos: soporta tanto `channels_last` como `channels_first`, con resultados bit-exactos.
- Carga directa de checkpoints upstream: permite cargar pesos del repositorio original `Zetatech/pvt-tiny-224` mediante `from_weights("hf:Zetatech/pvt-tiny-224")`.
- Normalización integrada: no requiere preprocesado manual de normalización de píxeles, ya que está incorporada en el grafo del modelo.

## Casos de uso

- Clasificación de imágenes en producción: el modelo puede integrarse en pipelines de visión por computador para clasificar imágenes en las 1.000 categorías de ImageNet, con un coste computacional reducido gracias a sus ~13,2 millones de parámetros y su compatibilidad con TensorFlow Serving o TorchServe.
- Backbone para segmentación semántica: la pirámide de características de cuatro etapas puede alimentar decodificadores de segmentación (por ejemplo, U-Net o decodificadores basados en FPN) para tareas de segmentación de imágenes médicas o de escenas urbanas.
- Backbone para detección de objetos: las características multiescala del modelo pueden conectarse a cabezales de detección como Faster R-CNN o DETR para localizar objetos en imágenes.
- Extracción de características para transfer learning: los embeddings de las cuatro etapas pueden utilizarse como representaciones de imagen para tareas posteriores como recuperación de imágenes, búsqueda por similitud o clustering visual.
- Prototipado rápido multi-framework: al ser una implementación Keras 3, los equipos pueden experimentar con el mismo checkpoint en PyTorch, TensorFlow o JAX sin necesidad de conversiones de pesos, lo que acelera el desarrollo y la comparación entre frameworks.
- Fine-tuning para dominios específicos: el modelo preentrenado puede ajustarse en conjuntos de datos propios (por ejemplo, clasificación de defectos industriales o clasificación de cultivos) con un coste de entrenamiento moderado gracias a su tamaño compacto.

## Benchmarks y rendimiento

El modelo alcanza un 75,1% de top-1 en ImageNet-1k. La siguiente tabla recoge los resultados de las variantes PVT disponibles en la colección de zeromodels:

| Variante | ImageNet-1k top-1 |
|---|---|
| pvt-tiny-224 | 75,1% |
| pvt-small-224 | 79,8% |
| pvt-medium-224 | 81,2% |
| pvt-large-224 | 81,7% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo de visión y no de lenguaje.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~13,2 millones de parámetros, la inferencia puede ejecutarse en GPU con 4-8 GB de VRAM o incluso en CPU, dependiendo del tamaño de lote.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 3060, RTX 4090) es suficiente; también puede ejecutarse en TPU gracias al soporte de Keras 3.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo actual.
- Opciones de despliegue: al ser un modelo Keras 3, puede servirse mediante TensorFlow Serving, TorchServe, o integrarse en frameworks de inferencia como ONNX Runtime (exportando previamente el modelo). También puede ejecutarse en entornos serverless o en dispositivos edge con soporte TensorFlow Lite.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

La información proporcionada no incluye datos de benchmarks de modelos comparables como ViT-tiny o DeiT-tiny. Dentro de la propia familia PVT, la comparativa es la siguiente:

| Modelo | Parametros | ImageNet-1k top-1 | Licencia |
|---|---|---|---|
| pvt-tiny-224 | ~13,2M | 75,1% | Apache 2.0 |
| pvt-small-224 | no disponible | 79,8% | Apache 2.0 |
| pvt-medium-224 | no disponible | 81,2% | Apache 2.0 |
| pvt-large-224 | no disponible | 81,7% | Apache 2.0 |

Para comparativas con arquitecturas alternativas (ViT, DeiT, Swin), no se dispone de datos en la información proporcionada.

## Limitaciones y advertencias

- Resolución fija de entrada: el modelo está diseñado para imágenes de 224x224 píxeles; el uso de resoluciones diferentes requiere reescalado previo o fine-tuning.
- Clases limitadas: la clasificación está restringida a las 1.000 clases de ImageNet-1k; para clases personalizadas es necesario fine-tuning.
- Sin capacidades de lenguaje: es un modelo exclusivamente visual; no procesa texto ni admite instrucciones multimodales.
- Riesgo de sesgos: al estar preentrenado en ImageNet-1k, puede heredar sesgos presentes en ese conjunto de datos (por ejemplo, sesgos geográficos o demográficos en las categorías).
- Predicciones incorrectas con alta confianza: en imágenes fuera de distribución, el modelo puede producir clasificaciones erróneas con niveles de confianza elevados.
- Licencia: Apache 2.0 permite uso comercial, pero es recomendable revisar los términos del checkpoint upstream (`Zetatech/pvt-tiny-224`) para confirmar que no hay restricciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zeromodels/pvt-tiny-224
- Checkpoint upstream: https://huggingface.co/Zetatech/pvt-tiny-224
- Paper original: https://arxiv.org/abs/2102.12122
- Paper en HuggingFace: https://huggingface.co/papers/2102.12122
- Repositorio GitHub de ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentación de PVT en ZeroModels: https://imvision12.github.io/ZeroModels/pvt/
- Documentación de carga de pesos: https://imvision12.github.io/ZeroModels/loading_weights/
- Colección de variantes PVT: https://huggingface.co/collections/zeromodels/pvt-and-pvtv2-6a90e9dd0a2b03a982d0b876
- Repositorio original de PVT: https://github.com/whai362/PVT
