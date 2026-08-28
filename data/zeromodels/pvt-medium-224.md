# zeromodels/pvt-medium-224

## Resumen

El modelo `zeromodels/pvt-medium-224` es una conversión a Keras 3 del checkpoint original `Zetatech/pvt-medium-224`, perteneciente a la familia Pyramid Vision Transformer (PVT). PVT es un transformer jerárquico para visión por computador que organiza la imagen en cuatro etapas piramidales, cada una con atención de reducción espacial (spatial-reduction attention) sobre parches no superpuestos y embeddings posicionales aprendidos. Con aproximadamente 44,2 millones de parámetros, alcanza un 81,2 % de precisión top-1 en ImageNet-1k a resolución 224×224.

El proyecto ZeroModels (autor: zeromodels) ofrece esta implementación unificada en Keras 3, lo que permite ejecutar el mismo modelo sin modificaciones en TensorFlow, PyTorch o JAX. Esto resulta especialmente útil para equipos que necesitan portabilidad entre frameworks o que desean integrar el modelo en pipelines existentes de Keras. El checkpoint está disponible para dos usos: clasificación de imágenes (devuelve logits de clase) y extracción de características como backbone (devuelve un mapa de características de cuatro etapas).

La relevancia actual de este modelo radica en su doble naturaleza: por un lado, es un backbone probado y eficiente para tareas densas como detección o segmentación; por otro, su conversión a Keras 3 con soporte multi-backend lo hace especialmente atractivo para entornos de producción heterogéneos. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pyramid Vision Transformer (PVT) jerárquico con 4 etapas y atención de reducción espacial |
| Parametros totales | ~44,2 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada de imagen 224×224) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (carga mediante `from_weights` de la librería zeromodels) |

## Arquitectura y entrenamiento

PVT sigue una arquitectura de transformer encoder similar a BERT, pero adaptada a imágenes. La entrada se divide en parches no superpuestos que se proyectan linealmente, y se añaden embeddings posicionales aprendidos. A diferencia de los vision transformers clásicos (como ViT), PVT introduce una estructura piramidal de cuatro etapas: cada etapa reduce la resolución espacial de los tokens y aumenta la dimensión del canal, lo que permite obtener características multiescala. La atención con reducción espacial (SRA) reduce el número de claves y valores antes de la atención, disminuyendo el coste computacional.

El modelo fue preentrenado en ImageNet-1k (ILSVRC2012), un conjunto de aproximadamente 1 millón de imágenes y 1000 clases, a resolución 224×224. No se menciona el uso de técnicas de alineación como RLHF o DPO, que no son aplicables a modelos de visión de este tipo. La conversión a Keras 3 mantiene la normalización integrada en el grafo, de modo que se pueden pasar píxeles crudos en el rango [0, 255] directamente. Según la documentación, la conversión es bit-exacta respecto al checkpoint original.

## Capacidades

- Clasificación de imágenes: devuelve logits de clase para las 1000 categorías de ImageNet-1k.
- Extracción de características como backbone: proporciona un mapa de características de cuatro etapas (pirámide) útil para tareas densas.
- Compatibilidad multi-backend: el mismo código se ejecuta en TensorFlow, PyTorch y JAX sin cambios.
- Normalización integrada: no requiere preprocesado adicional de los píxeles de entrada.
- Soporte de formatos de datos: tanto `channels_last` como `channels_first` están soportados.
- Carga directa de checkpoints originales: se pueden cargar pesos de Hugging Face (`hf:Zetatech/pvt-medium-224`) sin conversión previa.

## Casos de uso

- Clasificación de imágenes en producción con portabilidad entre frameworks: una empresa que utiliza TensorFlow en un entorno y PyTorch en otro puede desplegar el mismo modelo sin duplicar código, gracias a la implementación Keras 3 con backends intercambiables.
- Extracción de características para búsqueda visual: se puede usar `PvtModel` con `as_backbone=True` para obtener embeddings de las cuatro etapas y construir un sistema de recuperación de imágenes por similitud.
- Backbone para detección de objetos: las características multiescala de la pirámide son adecuadas para alimentar cabezales de detección como Faster R-CNN o RetinaNet, aprovechando la resolución variable de las etapas.
- Backbone para segmentación semántica: la salida de las cuatro etapas puede integrarse en decodificadores tipo U-Net o FPN para segmentación densa.
- Fine-tuning para dominios específicos: el modelo preentrenado en ImageNet puede ajustarse para clasificación médica (rayos X, histología), industrial (defectos de fabricación) o agrícola (enfermedades de cultivos), con un coste de entrenamiento moderado gracias a sus 44 millones de parámetros.
- Prototipado rápido en investigación: la compatibilidad con JAX y TensorFlow facilita la experimentación con diferentes pipelines de entrenamiento y evaluación sin cambiar de librería.

## Benchmarks y rendimiento

El único dato de rendimiento publicado en la información disponible es la precisión top-1 en ImageNet-1k. La siguiente tabla recoge los valores de las variantes PVT mencionadas en la model card:

| Modelo | Parámetros | ImageNet-1k top-1 |
|---|---|---|
| `pvt-tiny-224` | no disponible | 75,1 % |
| `pvt-small-224` | no disponible | 79,8 % |
| `pvt-medium-224` | ~44,2 M | 81,2 % |
| `pvt-large-224` | no disponible | 81,7 % |

No se han publicado resultados de benchmarks adicionales (como MMLU, HumanEval o GSM8K) en la información disponible, ya que se trata de un modelo de visión y no de lenguaje.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware para este modelo. A partir del tamaño de parámetros (~44,2 millones), se puede estimar de forma orientativa:

- Memoria del modelo en FP32: aproximadamente 177 MB (44,2 M × 4 bytes). En FP16, unos 88 MB.
- Inferencia en CPU: viable para clasificación de una sola imagen, con latencia del orden de decenas de milisegundos en hardware moderno.
- Inferencia en GPU: cualquier GPU con al menos 2 GB de VRAM es suficiente para el modelo en FP32. Una RTX 3060 o superior permite ejecutar el modelo con holgura y procesar lotes pequeños.
- Despliegue: al ser una implementación Keras 3, se puede servir con TensorFlow Serving, TorchServe o mediante frameworks de inferencia como vLLM (aunque no es un modelo de lenguaje). También es posible exportar a TensorFlow Lite o TFLite para dispositivos edge.
- No se dispone de datos de throughput o latencia medidos oficialmente.

## Comparativa con modelos similares

La comparativa más directa es con las otras variantes de PVT de la misma familia, ya que comparten arquitectura y entrenamiento:

| Modelo | Parámetros | ImageNet-1k top-1 | Licencia | Disponibilidad |
|---|---|---|---|---|
| `zeromodels/pvt-tiny-224` | no disponible | 75,1 % | Apache 2.0 | Hugging Face |
| `zeromodels/pvt-small-224` | no disponible | 79,8 % | Apache 2.0 | Hugging Face |
| `zeromodels/pvt-medium-224` | ~44,2 M | 81,2 % | Apache 2.0 | Hugging Face |
| `zeromodels/pvt-large-224` | no disponible | 81,7 % | Apache 2.0 | Hugging Face |

No se dispone de datos comparativos con otros vision transformers como ViT o DeiT en la información proporcionada.

## Limitaciones y advertencias

- El modelo está preentrenado en ImageNet-1k, por lo que sus clases están limitadas a las 1000 categorías de ese conjunto. Para otras tareas de clasificación es necesario fine-tuning.
- Al ser una conversión de un checkpoint existente, aunque se afirma que es bit-exacta, siempre existe un riesgo mínimo de diferencias numéricas debidas a la implementación.
- La resolución de entrada está fijada en 224×224. Aunque se podría adaptar a otras resoluciones, no está documentado y podría degradar el rendimiento.
- No se han publicado análisis de sesgos o robustez frente a ataques adversariales. Como cualquier modelo entrenado en ImageNet, puede heredar sesgos presentes en las imágenes de ese conjunto.
- El modelo no es generativo ni multimodal; solo procesa imágenes y produce logits o características.
- No hay información sobre el rendimiento en otros conjuntos de datos distintos de ImageNet.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia del modelo original (`Zetatech/pvt-medium-224`) por si hubiera restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zeromodels/pvt-medium-224
- Paper original (arXiv:2102.12122): https://arxiv.org/abs/2102.12122
- Repositorio oficial de PVT (GitHub): https://github.com/whai362/PVT
- Repositorio de ZeroModels (GitHub): https://github.com/IMvision12/ZeroModels
- Documentación de PVT en ZeroModels: https://imvision12.github.io/ZeroModels/pvt/
- Colección de modelos PVT y PVTv2 de zeromodels: https://huggingface.co/collections/zeromodels/pvt-and-pvtv2-6a90e9dd0a2b03a982d0b876
- Modelo base original: https://huggingface.co/Zetatech/pvt-medium-224
