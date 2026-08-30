# zeromodels/levit-384

## Resumen

LeViT-384 es un modelo de clasificación de imágenes de tipo híbrido convolucional-transformer, originalmente desarrollado por Meta AI y publicado en el paper "LeViT: a Vision Transformer in ConvNet's Clothing for Faster Inference" (arXiv:2104.01136). Esta versión concreta, `zeromodels/levit-384`, es una conversión pura a Keras 3 del checkpoint original de Facebook, lo que permite ejecutar el mismo modelo de forma idéntica sobre TensorFlow, PyTorch o JAX sin cambios en el código. El modelo está preentrenado en ImageNet-1k a resolución 224x224 y destaca por su equilibrio entre precisión y velocidad de inferencia, siendo el más grande de la familia LeViT con dimensiones ocultas de 384, 512 y 768 en sus tres etapas de atención.

La relevancia de esta conversión radica en que facilita la integración del modelo en entornos que ya usan Keras 3, eliminando la dependencia de la implementación original de timm o de los pesos en formato PyTorch. Al ser un modelo de tamaño moderado (el repositorio ocupa 0.2 GB), es adecuado para despliegue en hardware de consumo, y su licencia Apache 2.0 permite uso comercial sin restricciones. La arquitectura combina un tallo convolucional de cuatro capas que reduce la imagen 16 veces, seguido de tres etapas de atención con sesgo de posición relativa 2D aprendible, normalización por lotes fusionada en cada capa lineal y activaciones Hardswish. Los checkpoints publicados son destilados, promediando dos cabezas de clasificación durante la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LeViT (híbrido CNN-Transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (conversión Keras 3) |

## Arquitectura y entrenamiento

LeViT-384 sigue la arquitectura híbrida propuesta en el paper original: un tallo convolucional de cuatro capas reduce la imagen de entrada 16 veces, generando una secuencia de tokens. Sobre estos tokens se aplican tres etapas de atención, cada una con un sesgo de posición relativa 2D aprendible. Todas las capas lineales tienen normalización por lotes fusionada y se usan activaciones Hardswish. Los checkpoints publicados son destilados: se entrena una segunda cabeza de clasificación que se promedia con la principal durante la inferencia para mejorar la precisión.

El modelo fue preentrenado en ImageNet-1k a resolución 224x224. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO, ya que el modelo card original de Meta no fue escrito por los autores y el equipo de Hugging Face lo redactó posteriormente. La conversión a Keras 3 mantiene la misma arquitectura y pesos que el original, con la normalización de ImageNet integrada en el modelo, de modo que se deben pasar píxeles en bruto en el rango [0, 255].

## Capacidades

- Clasificación de imágenes: predice la clase de una imagen entre las 1000 categorías de ImageNet.
- Extracción de características: la versión backbone (`LevitModel.from_weights`) devuelve la secuencia final de tokens, útil para tareas de transferencia como detección de objetos o segmentación.
- Inferencia rápida: diseñado específicamente para reducir la latencia en comparación con transformers puros, gracias a la combinación de capas convolucionales y atención.
- Multi-backend: funciona sin cambios en TensorFlow, PyTorch y JAX mediante Keras 3.
- Preprocesamiento integrado: la normalización de ImageNet está dentro del modelo, simplificando el pipeline de inferencia.

## Casos de uso

- Clasificación de imágenes en producción: el modelo puede integrarse en servicios de etiquetado automático de imágenes, por ejemplo en plataformas de comercio electrónico para categorizar productos. Su tamaño moderado y su velocidad lo hacen adecuado para APIs de baja latencia.
- Backbone para detección de objetos: al extraer características de la secuencia de tokens, puede usarse como base para modelos como Faster R-CNN o YOLO, aprovechando su representación híbrida que combina información local y global.
- Segmentación semántica: la salida del backbone puede alimentar decodificadores para segmentar imágenes en entornos médicos o de conducción autónoma, donde la eficiencia computacional es crítica.
- Sistemas de búsqueda visual: se puede usar para generar embeddings de imágenes y construir índices de similitud, por ejemplo en motores de búsqueda de fotos o recomendación de productos.
- Análisis de imágenes en dispositivos edge: al ser un modelo relativamente ligero, puede ejecutarse en dispositivos con recursos limitados, como cámaras inteligentes o robots, para clasificación en tiempo real.
- Transferencia de aprendizaje en dominios específicos: los pesos preentrenados en ImageNet pueden ajustarse en conjuntos de datos pequeños, como clasificación de plantas o defectos industriales, con un coste de entrenamiento reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original reporta métricas de precisión y latencia, pero no se incluyen en la documentación de este repositorio ni en los resultados de búsqueda web proporcionados.

## Requisitos de hardware

- Al ser un modelo de clasificación de imágenes de tamaño moderado (repo de 0.2 GB), es ejecutable en CPU para inferencia puntual, aunque con mayor latencia.
- En GPU, cabe en tarjetas de consumo como NVIDIA GTX 1060 o superiores con al menos 4 GB de VRAM, aunque no se especifica el consumo exacto de memoria.
- No se proporcionan requisitos mínimos oficiales. Se recomienda probar en el hardware objetivo, dado que la inferencia de un solo lote de imágenes a 224x224 es ligera.
- Opciones de despliegue: al ser un modelo Keras 3, puede servirse con TensorFlow Serving, o mediante frameworks como FastAPI con el backend de Keras. También es posible exportar a TensorFlow Lite o ONNX para entornos móviles o edge, aunque no se documenta en el repositorio.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo en la información proporcionada. Sin embargo, LeViT-384 pertenece a la familia de transformers de visión eficientes, junto con modelos como DeiT-Base o ViT-Base. LeViT se diferencia por su diseño híbrido convolucional, que reduce la carga computacional de la atención. No se pueden ofrecer cifras concretas de comparación sin los benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: al estar preentrenado en ImageNet, el modelo puede heredar sesgos presentes en ese conjunto de datos, como sobrerrepresentación de ciertas categorías o regiones geográficas.
- Riesgo de alucinación: en tareas de clasificación, el modelo puede producir predicciones incorrectas con alta confianza, especialmente en imágenes fuera de la distribución de entrenamiento.
- Limitaciones de contexto: al ser un modelo de visión, no procesa texto ni mantiene contexto conversacional.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución correspondiente.
- Caveat de producción: la conversión a Keras 3 es reciente (creada en agosto de 2026) y no se han publicado evaluaciones independientes de su paridad exacta con el modelo original de PyTorch. Se recomienda validar el comportamiento en el caso de uso específico antes de desplegarlo en entornos críticos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zeromodels/levit-384
- Modelo original de Meta: https://huggingface.co/facebook/levit-384
- Paper: https://arxiv.org/abs/2104.01136
- Página del paper en Hugging Face: https://huggingface.co/papers/2104.01136
- Repositorio GitHub de ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentación de backbones: https://imvision12.github.io/ZeroModels/classification_backbones/
- Documentación de carga de pesos: https://imvision12.github.io/ZeroModels/loading_weights/
- Colección de variantes LeViT: https://huggingface.co/collections/zeromodels/levit-6a937f8760837c24b7a51d25
