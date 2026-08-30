# zeromodels/levit-192

## Resumen

LeViT-192 es un modelo de clasificación de imágenes de tipo híbrido convolución-transformer, originalmente desarrollado por Meta AI y publicado en el paper "LeViT: a Vision Transformer in ConvNet's Clothing for Faster Inference" (arXiv:2104.01136). Esta versión con identificador `zeromodels/levit-192` es una conversión pura a Keras 3 del checkpoint original `facebook/levit-192`, realizada por el proyecto ZeroModels. El objetivo es ofrecer una implementación unificada que pueda ejecutarse sin modificaciones sobre TensorFlow, PyTorch o JAX, manteniendo los pesos preentrenados en ImageNet-1k a resolución 224x224.

El modelo combina un stem convolucional de cuatro capas que reduce la imagen 16 veces, seguido de tres etapas de atención con bias posicional relativo 2D aprendible. Cada capa lineal incorpora BatchNorm fusionada y activación Hardswish. Los checkpoints publicados por Meta incluyen una cabeza de destilación adicional que se promedia con la cabeza principal durante la inferencia. Esta conversión conserva esa característica y permite cargar el modelo tanto desde el repositorio de ZeroModels como desde el original de Hugging Face.

La relevancia actual de LeViT-192 radica en su diseño orientado a inferencia rápida, con un coste computacional reducido frente a transformers puros, lo que lo hace adecuado para despliegue en entornos con recursos limitados. La conversión a Keras 3 amplía su portabilidad entre frameworks, facilitando su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido convolución-transformer (LeViT) |
| Parametros totales | No disponible (el modelo original tiene aproximadamente 10,7 millones, pero no se confirma en esta ficha) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada de imagen 224x224) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (clasificación de imágenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (cargado desde el hub, según la documentación de `from_weights`) |

## Arquitectura y entrenamiento

LeViT-192 sigue la arquitectura propuesta en el paper de Graham et al. (2021). La entrada es procesada por un stem convolucional de cuatro capas que reduce la resolución espacial en un factor de 16, generando un conjunto de tokens. A continuación, tres etapas de atención operan sobre estos tokens, cada una añadiendo un bias posicional relativo 2D aprendible. Todas las capas lineales tienen BatchNorm fusionada y activación Hardswish, lo que reduce la latencia en comparación con los transformers estándar.

El entrenamiento original se realizó sobre ImageNet-1k a resolución 224x224, utilizando un esquema de destilación: se entrena una segunda cabeza de clasificación supervisada por un profesor (posiblemente un modelo convnet más grande) y en inferencia se promedian las salidas de ambas cabezas. Esta conversión a Keras 3 mantiene ese comportamiento, promediando internamente las dos cabezas en la clase `LevitImageClassify`. No se dispone de detalles adicionales sobre el proceso de entrenamiento (número de épocas, optimizador, etc.) en la información proporcionada.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet, con top-1 y top-5.
- Extracción de características visuales mediante el backbone (la secuencia final de tokens) para tareas de transfer learning.
- Soporte multi-backend: la misma implementación Keras 3 funciona con TensorFlow, PyTorch y JAX, seleccionable mediante la variable de entorno `KERAS_BACKEND`.
- Preprocesamiento integrado: la normalización de ImageNet está incluida en el modelo, por lo que acepta píxeles en rango [0, 255] directamente.
- Carga de pesos desde el hub de Hugging Face, tanto desde el repositorio de ZeroModels como desde el original de Meta (`hf:facebook/levit-192`).
- Disponibilidad de varias variantes del modelo (128S, 128, 192, 256, 384) en la colección de ZeroModels.

## Casos de uso

- Clasificación de imágenes en producción: el modelo puede integrarse en servicios de análisis de imágenes (moderación de contenido, clasificación de productos) gracias a su baja latencia y tamaño reducido, adecuado para despliegue en CPU o GPUs modestas.
- Extracción de características para sistemas de búsqueda visual: usando el backbone, se pueden generar embeddings de imágenes para indexar y recuperar imágenes similares en bases de datos vectoriales.
- Transfer learning en dominios específicos: las características preentrenadas en ImageNet pueden ajustarse en conjuntos de datos pequeños (por ejemplo, diagnóstico médico por imagen, clasificación de plantas) con pocas épocas.
- Prototipado rápido en investigación: al ser una implementación Keras 3, permite experimentar con el mismo modelo en diferentes backends (TF, Torch, JAX) sin cambiar el código, facilitando comparaciones de rendimiento.
- Aplicaciones en edge computing: con un tamaño de alrededor de 10 millones de parámetros, el modelo puede ejecutarse en dispositivos con recursos limitados (Raspberry Pi, móviles) mediante conversión a TensorFlow Lite o similar.
- Evaluación de arquitecturas híbridas: sirve como referencia para estudiar el equilibrio entre precisión y velocidad frente a transformers puros o CNNs tradicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original fue preentrenado en ImageNet-1k, pero no se proporcionan métricas concretas (top-1, top-5) en la documentación de esta conversión. Para datos de rendimiento, se recomienda consultar el paper original o la model card de `facebook/levit-192`.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~10,7 millones de parámetros, la inferencia requiere menos de 1 GB de VRAM en FP32 (aproximadamente 43 MB de pesos). Con cuantización a int8, el consumo es aún menor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; también puede ejecutarse en CPU sin problemas para inferencia por lotes pequeños.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU moderna (GTX 1050 Ti, RTX 2060, etc.) e incluso en hardware integrado.
- Opciones de despliegue: al ser Keras 3, puede exportarse a TensorFlow SavedModel, TFLite, ONNX o utilizarse directamente con servidores de inferencia como TensorFlow Serving o TorchServe. No se menciona soporte específico para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos numéricos, pero el diseño del modelo prioriza la velocidad de inferencia frente a ViT de tamaño similar.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Preentrenamiento | Licencia | Framework |
|---|---|---|---|---|---|
| LeViT-192 (este) | ~10,7 M (no confirmado) | 224x224 | ImageNet-1k | Apache 2.0 | Keras 3 (multi-backend) |
| ViT-Tiny (google/vit-base-patch16-224) | 86 M | 224x224 | ImageNet-1k | Apache 2.0 | PyTorch / TF |
| DeiT-Tiny (facebook/deit-tiny) | 5,7 M | 224x224 | ImageNet-1k | Apache 2.0 | PyTorch |

LeViT-192 se sitúa entre ViT-Tiny y DeiT-Tiny en tamaño, pero su diseño híbrido ofrece una latencia menor que ViT puro a igualdad de resolución. DeiT-Tiny es más pequeño, pero LeViT-192 suele lograr mayor precisión en ImageNet. La ventaja de esta versión es su portabilidad entre backends gracias a Keras 3.

## Limitaciones y advertencias

- Sesgos conocidos: al estar preentrenado en ImageNet-1k, el modelo puede heredar sesgos presentes en ese dataset (por ejemplo, sobrerrepresentación de ciertas categorías o estereotipos visuales).
- Riesgo de alucinación: no aplica directamente, pero en tareas de clasificación puede producir predicciones incorrectas con alta confianza en clases no representadas.
- Limitaciones de resolución: el modelo espera entradas de 224x224; usar otras resoluciones puede degradar el rendimiento. El preprocesamiento recomendado (resize a 256 y center-crop a 224) debe respetarse para obtener resultados óptimos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia y se indiquen los cambios.
- Caveat de producción: la conversión a Keras 3 no ha sido validada con benchmarks públicos; se recomienda verificar el rendimiento en el dominio de aplicación antes de desplegar en entornos críticos.
- Dependencia de la variable de entorno `KERAS_BACKEND`: debe configurarse antes de importar Keras o zeromodels; un cambio posterior puede provocar errores de carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zeromodels/levit-192
- Modelo original de Meta: https://huggingface.co/facebook/levit-192
- Paper original: https://arxiv.org/abs/2104.01136
- Repositorio ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentación de backbones: https://imvision12.github.io/ZeroModels/classification_backbones/
- Colección de variantes LeViT: https://huggingface.co/collections/zeromodels/levit-6a937f8760837c24b7a51d25
