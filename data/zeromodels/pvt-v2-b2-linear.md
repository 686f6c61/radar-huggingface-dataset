# zeromodels/pvt-v2-b2-linear

## Resumen

El modelo `zeromodels/pvt-v2-b2-linear` es una conversión pura a Keras 3 del checkpoint `OpenGVLab/pvt_v2_b2_linear`, perteneciente a la familia Pyramid Vision Transformer v2 (PVTv2). PVTv2 es un backbone jerárquico ligero para tareas de visión por computador, que combina operaciones de convolución con capas de transformer para aprender representaciones de imagen de forma eficiente. Esta variante concreta emplea atención lineal, lo que reduce el coste computacional respecto a la atención estándar, y no utiliza embeddings posicionales, permitiendo procesar imágenes de cualquier resolución.

El modelo está diseñado para clasificación de imágenes y extracción de características multi-escala. Con aproximadamente 22,6 millones de parámetros, alcanza un 82,1% de precisión top-1 en ImageNet-1k. La conversión a Keras 3 permite ejecutar el mismo código de forma nativa en TensorFlow, PyTorch o JAX, lo que facilita su integración en distintos ecosistemas de desarrollo. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pyramid Vision Transformer v2 (PVTv2) con atención lineal |
| Parametros totales | ~22,6 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 0,1 GB, probablemente pesos de Keras) |

## Arquitectura y entrenamiento

PVTv2 introduce tres mejoras clave sobre PVT original: *overlapping patch embedding* para mantener continuidad espacial, una red *feed-forward* convolucional que incorpora propiedades de las CNN, y la eliminación total de embeddings posicionales, lo que permite que el modelo acepte resoluciones de entrada arbitrarias. La variante `b2-linear` sustituye la atención estándar por una versión lineal, reduciendo la complejidad computacional de O(n²) a O(n) en el número de tokens.

El modelo fue entrenado en ImageNet-1k para clasificación, alcanzando un 82,1% de precisión top-1. No se dispone de información detallada sobre el número de tokens de entrenamiento, composición exacta del dataset o uso de técnicas como RLHF o DPO, ya que se trata de un modelo de visión supervisado de forma clásica. La conversión a Keras 3 mantiene los pesos originales del checkpoint de OpenGVLab, por lo que no implica un reentrenamiento.

## Capacidades

- Clasificación de imágenes: devuelve logits de clases mediante `PvtV2ImageClassify`.
- Extracción de características multi-escala: `PvtV2Model` con `as_backbone=True` produce un mapa de características en cuatro etapas, útil para tareas downstream como detección o segmentación.
- Acepta cualquier resolución de entrada gracias a la ausencia de embeddings posicionales.
- Compatible con los tres backends de Keras 3: TensorFlow, PyTorch y JAX, con resultados bit-exactos.
- Normalización de imágenes integrada en el grafo, por lo que se pueden pasar píxeles crudos en rango [0, 255].
- Soporte de formatos de datos `channels_last` y `channels_first`.

## Casos de uso

- Clasificación de imágenes en producción: el modelo puede integrarse en pipelines de visión por computador para etiquetar imágenes en tiempo real, gracias a su tamaño reducido y su precisión competitiva en ImageNet-1k.
- Backbone para detección de objetos: las características multi-escala de las cuatro etapas pueden alimentar detectores como Faster R-CNN o YOLO, proporcionando representaciones jerárquicas ricas.
- Segmentación semántica: los mapas de características de diferentes resoluciones son adecuados para decodificadores de segmentación que necesitan información tanto de alto nivel como de detalle fino.
- Extracción de embeddings visuales: se puede usar `PvtV2Model` para obtener representaciones de imagen que alimenten sistemas de búsqueda visual o recuperación por similitud.
- Fine-tuning en dominios específicos: al ser un modelo preentrenado en ImageNet, puede ajustarse con datasets pequeños para tareas especializadas como diagnóstico médico por imagen o inspección industrial.
- Prototipado rápido en investigación: al ser una implementación Keras 3, los investigadores pueden experimentar con diferentes backends sin cambiar el código, facilitando la comparación de rendimiento entre frameworks.

## Benchmarks y rendimiento

La información disponible solo incluye la precisión top-1 en ImageNet-1k para las distintas variantes de PVTv2. No se han publicado resultados de otros benchmarks como COCO, ADE20K o tareas de detección/segmentación en la documentación consultada.

| Variante | ImageNet-1k top-1 |
|---|---|
| pvt-v2-b0 | 70.5% |
| pvt-v2-b1 | 78.7% |
| pvt-v2-b2 | 82.0% |
| pvt-v2-b2-linear | 82.1% |
| pvt-v2-b3 | 83.1% |
| pvt-v2-b4 | 83.6% |
| pvt-v2-b5 | 83.8% |

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM específica para inferencia.
- Con ~22,6 millones de parámetros, el modelo es ligero y puede ejecutarse en GPUs de consumo como una RTX 3060 o incluso en CPU para inferencia por lotes pequeños.
- Al ser un modelo de visión, no aplican los motores de inferencia para modelos de lenguaje como vLLM, llama.cpp u Ollama.
- El despliegue puede realizarse mediante el propio ecosistema Keras 3, exportando el modelo a TensorFlow SavedModel, PyTorch o JAX según el backend elegido.
- La latencia y el throughput dependen del hardware y del tamaño de entrada; no se han publicado cifras concretas.

## Comparativa con modelos similares

Dentro de la familia PVTv2, la variante `b2-linear` ofrece un rendimiento ligeramente superior a `b2` (82.1% vs 82.0%) con un coste computacional menor gracias a la atención lineal. Comparado con otras arquitecturas de backbone de tamaño similar, no se dispone de datos en la información proporcionada para establecer comparaciones directas con ResNet, ViT o Swin Transformer.

| Modelo | Parámetros | ImageNet-1k top-1 | Licencia |
|---|---|---|---|
| pvt-v2-b2-linear | ~22.6M | 82.1% | Apache 2.0 |
| pvt-v2-b2 | ~22.6M | 82.0% | Apache 2.0 |
| pvt-v2-b3 | ~40.4M | 83.1% | Apache 2.0 |

## Limitaciones y advertencias

- No se ha documentado información sobre sesgos o riesgos de alucinación, al ser un modelo de visión y no de generación de texto.
- La precisión reportada corresponde a ImageNet-1k; el rendimiento en otros dominios puede variar significativamente sin fine-tuning.
- Aunque acepta cualquier resolución de entrada, el rendimiento óptimo se obtiene con resoluciones cercanas a las usadas en el entrenamiento (224x224).
- La conversión a Keras 3 mantiene los pesos originales, pero no se garantiza una paridad exacta en todos los backends si se realizan modificaciones en el grafo.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base original de OpenGVLab para confirmar cualquier restricción adicional.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/zeromodels/pvt-v2-b2-linear)
- [Modelo base OpenGVLab/pvt_v2_b2_linear](https://huggingface.co/OpenGVLab/pvt_v2_b2_linear)
- [Paper PVTv2 (arXiv:2106.13797)](https://arxiv.org/abs/2106.13797)
- [Repositorio oficial PVT en GitHub](https://github.com/whai362/PVT)
- [Repositorio ZeroModels](https://github.com/IMvision12/ZeroModels)
- [Documentación de PVTv2 en ZeroModels](https://imvision12.github.io/ZeroModels/pvt_v2/)
- [Colección de modelos PVT y PVTv2](https://huggingface.co/collections/zeromodels/pvt-and-pvtv2-6a90e9dd0a2b03a982d0b876)
