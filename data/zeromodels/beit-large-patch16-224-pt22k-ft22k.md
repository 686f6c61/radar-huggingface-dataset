# zeromodels/beit-large-patch16-224-pt22k-ft22k

## Resumen

BEiT (BERT Pre-Training of Image Transformers) es un modelo de visión por computador basado en transformer, desarrollado originalmente por Microsoft Research. Esta variante concreta, `zeromodels/beit-large-patch16-224-pt22k-ft22k`, es una conversión a Keras 3 del checkpoint oficial `microsoft/beit-large-patch16-224-pt22k-ft22k`, publicada por el usuario zeromodels. El modelo resuelve tareas de clasificación de imágenes y extracción de características visuales mediante un enfoque de pre-entrenamiento auto-supervisado inspirado en BERT, donde se enmascaran parches de la imagen y se aprende a reconstruirlos.

La arquitectura es un transformer de visión (ViT) con tamaño large: parches de 16x16 píxeles, bias relativo por capa, una capa de escala aprendible en cada rama residual y mean pooling de los tokens de parche. El modelo se pre-entrenó en ImageNet-22k (14 millones de imágenes, 21 841 clases) y se ajustó (fine-tuning) sobre el mismo dataset a resolución 224x224. El checkpoint original tiene aproximadamente 304 millones de parámetros, aunque esta conversión no especifica el número exacto. La relevancia actual radica en que ofrece una implementación unificada en Keras 3, ejecutable sin modificaciones sobre TensorFlow, PyTorch o JAX, lo que facilita la experimentación y el despliegue en entornos heterogéneos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BEiT (Vision Transformer con pre-entrenamiento tipo BERT) |
| Parametros totales | no disponible (el modelo original de Microsoft tiene ~304M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, resolución de entrada 224x224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (conversión a Keras 3; compatible con safetensors mediante prefijo `hf:`) |

## Arquitectura y entrenamiento

BEiT sigue la arquitectura de un transformer de visión estándar (ViT) con parches de 16x16 píxeles. A diferencia de ViT original, incorpora un bias relativo por capa en la atención, una capa de escala aprendible en cada rama residual y utiliza mean pooling sobre los tokens de parche para la clasificación final. El pre-entrenamiento se realiza mediante masked image modeling (MIM): se enmascaran parches de la imagen y el modelo debe predecir las visual words correspondientes, un enfoque análogo al enmascaramiento de tokens en BERT. El modelo se pre-entrenó de forma auto-supervisada en ImageNet-22k (14 millones de imágenes, 21 841 clases) y posteriormente se ajustó sobre el mismo dataset a resolución 224x224. Esta versión de zeromodels es una conversión a Keras 3 que preserva los pesos originales y permite la ejecución en TensorFlow, PyTorch o JAX mediante la variable de entorno `KERAS_BACKEND`. No se mencionan técnicas adicionales como RLHF o DPO, al tratarse de un modelo de visión.

## Capacidades

- Clasificación de imágenes: asigna una imagen de entrada a una de las 21 841 clases de ImageNet-22k.
- Extracción de características: puede usarse como backbone para tareas de transfer learning, devolviendo secuencias de tokens por bloque mediante `BeitModel.from_weights(..., as_backbone=True)`.
- Compatibilidad multi-backend: la implementación en Keras 3 permite ejecutar el mismo modelo en TensorFlow, PyTorch o JAX sin cambios de código.
- Normalización integrada: el modelo espera píxeles en bruto `[0, 255]` y aplica la normalización internamente, simplificando el preprocesado.
- Soporte para segmentación semántica: aunque este checkpoint es de clasificación, la colección de zeromodels incluye variantes para segmentación (por ejemplo, `beit-large-finetuned-ade-640-640`).
- Carga de pesos desde Hugging Face: además de los pesos propios, se pueden cargar checkpoints originales de Microsoft mediante el prefijo `hf:`.

## Casos de uso

- Clasificación de imágenes en producción: el modelo puede integrarse en sistemas de etiquetado automático de imágenes para catálogos, moderación de contenido o búsqueda visual, gracias a su amplio vocabulario de clases de ImageNet-22k.
- Extracción de características para transfer learning: al usar el modelo como backbone, se pueden obtener representaciones visuales densas para entrenar clasificadores lineales o modelos de detección de objetos sobre datasets propios, reduciendo el tiempo de entrenamiento.
- Prototipado rápido con Keras 3: al ser compatible con múltiples backends, los desarrolladores pueden experimentar con TensorFlow, PyTorch o JAX sin reescribir código, acelerando la validación de ideas.
- Fine-tuning para dominios específicos: el checkpoint pre-entrenado y ajustado en ImageNet-22k sirve como punto de partida para adaptarlo a dominios como imágenes médicas, satelitales o industriales, con pocos datos etiquetados.
- Investigación en visión por computador: el modelo puede utilizarse como referencia para comparar técnicas de pre-entrenamiento auto-supervisado o como componente en estudios sobre transferencia de representaciones.
- Despliegue en entornos con recursos limitados: con aproximadamente 304 millones de parámetros, el modelo puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3060 con 12 GB) o incluso en CPU para inferencia por lotes, lo que facilita su uso en aplicaciones locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original de Microsoft no incluye tablas comparativas en su model card pública, y esta conversión de zeromodels tampoco proporciona métricas propias. Se recomienda consultar el paper original (arXiv:2106.08254) para obtener resultados de evaluación en ImageNet y otras tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, el modelo ocupa aproximadamente 1.2 GB; en fp16, unos 600 MB; en int8, unos 300 MB. Esto permite ejecutarlo en GPUs con al menos 4 GB de VRAM.
- GPU recomendadas: RTX 3060, RTX 3070, RTX 4090, A100, etc. Cualquier GPU con más de 4 GB es suficiente para inferencia en lote.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas como la RTX 3060 (12 GB) o la RTX 4060 (8 GB).
- Opciones de despliegue: al ser un modelo Keras 3, se puede exportar a SavedModel (TensorFlow), TorchScript (PyTorch) o usar directamente con JAX. También es posible convertirlo a TFLite o ONNX para despliegue en dispositivos móviles o servidores.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Pre-entrenamiento | Licencia |
|---|---|---|---|---|
| BEiT-large (este) | ~304M | 224x224 | ImageNet-22k (auto-supervisado) | Apache 2.0 |
| ViT-large (Google) | ~304M | 224x224 | ImageNet-21k (supervisado) | Apache 2.0 |
| DeiT-large (Facebook) | ~307M | 224x224 | ImageNet-1k (supervisado con distillation) | Apache 2.0 |

No se dispone de resultados de benchmarks comparativos en la información proporcionada. La diferencia principal de BEiT respecto a ViT y DeiT es su método de pre-entrenamiento basado en masked image modeling, que en el paper original reporta mejoras en tareas de clasificación y segmentación, aunque estos datos no se reproducen aquí.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó en ImageNet-22k, un dataset que contiene sesgos geográficos, culturales y demográficos; las predicciones pueden verse afectadas por estos sesgos.
- Riesgo de alucinación: como modelo de visión, no genera texto, pero puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- Limitaciones de resolución: la entrada está fijada a 224x224; para resoluciones mayores se requeriría un ajuste fino o interpolación de los positional embeddings.
- Limitaciones de idioma: no aplica, al ser un modelo de visión.
- Restricciones de licencia: licencia Apache 2.0, permite uso comercial sin restricciones adicionales, siempre que se mantenga el aviso de copyright.
- Caveat de producción: la conversión a Keras 3 puede introducir diferencias numéricas menores respecto al checkpoint original de Microsoft; se recomienda validar el comportamiento en el dominio de aplicación.
- Dependencia de la librería zeromodels: el modelo requiere la instalación de la librería `zeromodels` y la configuración de `KERAS_BACKEND` antes de importar Keras.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/zeromodels/beit-large-patch16-224-pt22k-ft22k
- Modelo original de Microsoft: https://huggingface.co/microsoft/beit-large-patch16-224-pt22k-ft22k
- Paper BEiT: https://arxiv.org/abs/2106.08254
- Repositorio GitHub de ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentación de BEiT en ZeroModels: https://imvision12.github.io/ZeroModels/beit/
- Colección de variantes BEiT en HuggingFace: https://huggingface.co/collections/zeromodels/beit-6a9352067192fd9fcfcfe6f1
