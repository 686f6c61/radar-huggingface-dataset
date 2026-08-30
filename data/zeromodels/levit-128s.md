# zeromodels/levit-128S

## Resumen

`zeromodels/levit-128S` es una conversión íntegra a Keras 3 del modelo `facebook/levit-128S`, un clasificador de imágenes híbrido entre redes convolucionales y transformers, diseñado por Meta AI para lograr una inferencia muy rápida sin sacrificar precisión. El modelo original fue presentado en el artículo *LeViT: a Vision Transformer in ConvNet's Clothing for Faster Inference* (arXiv:2104.01136) y preentrenado en ImageNet-1k a resolución 224×224.

La variante 128S es la más pequeña de la familia LeViT, con dimensiones ocultas de 128, 256 y 384 y profundidades de 2, 3 y 4 bloques en cada etapa. Su arquitectura combina un *stem* convolucional de cuatro capas que reduce la imagen 16 veces, seguido de tres etapas de atención con sesgo posicional relativo 2D aprendible, normalización por lotes fusionada en cada capa lineal y activaciones Hardswish. Los pesos publicados provienen de un proceso de destilación, por lo que el modelo promedia dos cabezas de clasificación durante la inferencia.

Esta versión de zeromodels permite ejecutar el modelo sin modificaciones sobre TensorFlow, PyTorch o JAX mediante el backend de Keras 3, lo que facilita su integración en entornos heterogéneos. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LeViT (híbrido CNN + Transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos Keras 3, formato propio de zeromodels) |

## Arquitectura y entrenamiento

LeViT-128S sigue un diseño híbrido: un *stem* convolucional de cuatro capas reduce la resolución de la imagen 16 veces (de 224×224 a 14×14), generando 196 tokens. A continuación, tres etapas de atención procesan estos tokens, cada una añadiendo un sesgo posicional relativo 2D aprendible. Todas las capas lineales incorporan normalización por lotes fusionada y la activación Hardswish. El modelo fue entrenado en ImageNet-1k con un esquema de destilación, donde una segunda cabeza de clasificación se promedia con la principal durante la inferencia para mejorar la precisión.

La conversión a Keras 3 realizada por zeromodels mantiene la misma arquitectura y pesos originales, pero permite cargar el modelo con `LevitImageClassify.from_weights("zeromodels/levit-128S")` y ejecutarlo en cualquier backend de Keras (TensorFlow, PyTorch o JAX). La normalización de ImageNet está integrada en el modelo, por lo que se deben pasar píxeles en bruto en el rango [0, 255]. El preprocesado recomendado es redimensionar el lado corto a 256 y recortar centralmente a 224.

## Capacidades

- Clasificación de imágenes en 1000 categorías de ImageNet.
- Extracción de características (backbone) mediante `LevitModel.from_weights(...)`, que devuelve la secuencia final de tokens sin la cabeza de clasificación.
- Inferencia rápida gracias a su diseño compacto y a la fusión de normalización por lotes.
- Compatibilidad multi-backend: puede ejecutarse en TensorFlow, PyTorch o JAX sin cambios en el código.
- Soporte para cargar pesos desde el repositorio original de HuggingFace mediante el prefijo `hf:` (por ejemplo, `hf:facebook/levit-128S`).
- Preprocesado integrado: la normalización de ImageNet está incluida en el modelo, simplificando el pipeline de inferencia.

## Casos de uso

- Clasificación de imágenes en tiempo real en dispositivos con recursos limitados: al ser un modelo pequeño (la variante más ligera de LeViT), puede ejecutarse en CPU o GPU de gama baja, lo que lo hace adecuado para aplicaciones de visión en tiempo real como sistemas de vigilancia o control de calidad industrial.
- Extracción de características para sistemas de búsqueda visual: usando el modelo como backbone, se pueden obtener embeddings de imágenes para construir índices de similitud en bases de datos de productos o fotos.
- Aplicaciones móviles de reconocimiento de objetos: su tamaño reducido y su licencia Apache 2.0 permiten integrarlo en apps Android o iOS mediante TensorFlow Lite o Core ML, sin costes de licencia.
- Prototipado rápido de pipelines de visión: gracias a su compatibilidad con Keras 3, se puede integrar fácilmente en flujos de trabajo existentes con TensorFlow, PyTorch o JAX, acelerando la experimentación.
- Sistemas de clasificación de documentos escaneados: puede distinguir entre tipos de formularios, facturas o recibos, siempre que las categorías estén dentro de las 1000 de ImageNet o se realice un ajuste fino posterior.
- Educación e investigación en visión por computador: al ser un modelo abierto y ligero, es útil para enseñar arquitecturas híbridas CNN-Transformer o para comparar rendimiento con otros backbones en tareas de clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original de Meta reporta métricas en el paper, pero no se incluyen en la documentación de esta conversión. Se recomienda consultar el artículo original para obtener datos de precisión y latencia.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 8 millones de parámetros (según el paper original, aunque no confirmado en esta ficha), su huella de memoria es reducida: en FP32 ocuparía unos 32 MB, y en FP16 unos 16 MB.
- Puede ejecutarse en CPU sin problemas para inferencia por lotes pequeños, con latencias del orden de decenas de milisegundos por imagen en hardware moderno.
- En GPU, cualquier tarjeta con al menos 2 GB de VRAM es suficiente, incluyendo GPUs integradas o de gama de entrada como NVIDIA GTX 1650 o superiores.
- Es compatible con frameworks de despliegue como TensorFlow Serving, TorchServe o JAX, así como con soluciones ligeras como ONNX Runtime si se exporta el modelo.
- No se requieren GPUs de alta gama como A100 o H100; el modelo está pensado para entornos de inferencia rápida y de bajo coste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LeViT-128S (zeromodels) | ~8M (no confirmado) | 224×224 | Apache 2.0 | HuggingFace, Keras 3 |
| MobileNetV2 | 3.4M | 224×224 | Apache 2.0 | Amplia (TF, PyTorch, ONNX) |
| EfficientNet-Lite0 | 4.7M | 224×224 | Apache 2.0 | Amplia (TF, PyTorch) |
| ViT-Tiny | 5.7M | 224×224 | Apache 2.0 | HuggingFace, timm |

La comparativa se basa en el tamaño y la licencia, pero no se dispone de datos de rendimiento para establecer una comparación cuantitativa. LeViT-128S se distingue por su diseño híbrido que busca un equilibrio entre precisión y velocidad, mientras que MobileNetV2 y EfficientNet-Lite son arquitecturas puramente convolucionales optimizadas para dispositivos móviles.

## Limitaciones y advertencias

- Es un modelo de clasificación de imágenes únicamente; no soporta otras tareas como detección, segmentación o generación.
- Está preentrenado en ImageNet, por lo que sus categorías están limitadas a las 1000 clases de ese dataset y puede presentar sesgos asociados a los datos de entrenamiento (por ejemplo, sobrerrepresentación de ciertos objetos o contextos).
- No se han publicado resultados de benchmarks específicos para esta conversión, por lo que el rendimiento exacto en términos de precisión y latencia debe validarse en el caso de uso concreto.
- El formato de pesos de zeromodels es propio de Keras 3; para usarlo en otros frameworks puede ser necesario exportar el modelo a ONNX o TensorFlow SavedModel.
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable revisar los términos de la licencia del modelo original de Meta para asegurar el cumplimiento.
- El modelo no incluye soporte para cuantización oficial; si se requiere reducir aún más el tamaño, habría que aplicar técnicas de cuantización post-entrenamiento manualmente.

## Enlaces

- [HuggingFace: zeromodels/levit-128S](https://huggingface.co/zeromodels/levit-128S)
- [HuggingFace: facebook/levit-128S (modelo original)](https://huggingface.co/facebook/levit-128S)
- [Paper: LeViT: a Vision Transformer in ConvNet's Clothing for Faster Inference](https://arxiv.org/abs/2104.01136)
- [Repositorio GitHub de ZeroModels](https://github.com/IMvision12/ZeroModels)
- [Documentación de backbones de ZeroModels](https://imvision12.github.io/ZeroModels/classification_backbones/)
- [Colección de variantes LeViT en HuggingFace](https://huggingface.co/collections/zeromodels/levit-6a937f8760837c24b7a51d25)
