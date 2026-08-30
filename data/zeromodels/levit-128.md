# zeromodels/levit-128

## Resumen

LeViT-128 es un modelo de clasificación de imágenes de tipo híbrido convolución-transformer, originalmente desarrollado por Meta AI y publicado en el paper "LeViT: a Vision Transformer in ConvNet's Clothing for Faster Inference" (arXiv:2104.01136). Esta versión con identificador `zeromodels/levit-128` es una conversión pura a Keras 3 realizada por el proyecto ZeroModels, que permite ejecutar el mismo modelo sin modificaciones sobre los backends TensorFlow, PyTorch y JAX. El modelo resuelve el problema de la inferencia rápida de clasificación de imágenes en dispositivos con recursos limitados, combinando la eficiencia de las redes convolucionales con la capacidad de atención de los transformers. La arquitectura base utiliza tamaños ocultos de 128, 256 y 384 canales con profundidades de 4, 4 y 4 en sus tres etapas de atención, y está preentrenado en ImageNet-1k a resolución 224x224. Al ser un modelo de visión, no tiene longitud de contexto en el sentido de los modelos de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida convolución-transformer (LeViT) con stem convolucional de 4 capas y 3 etapas de atención con bias relativo 2D |
| Parametros totales | no disponible (el modelo base LeViT-128 tiene aproximadamente 9 millones, pero no se confirma en la información proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible (se puede convertir a TFLite u otros formatos, pero no se especifica) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (la conversión de ZeroModels usa pesos de Keras, probablemente H5; el modelo original de facebook/levit-128 usa safetensors) |

## Arquitectura y entrenamiento

LeViT combina una red convolucional como extractor de características de bajo nivel con un transformer para modelar dependencias globales. El modelo comienza con un stem convolucional de cuatro capas que reduce la resolución de la imagen 16 veces, produciendo una secuencia de tokens. A continuación, tres etapas de atención procesan estos tokens, cada una añadiendo un bias de posición relativa 2D aprendible. Una innovación clave es que la normalización por lotes (BatchNorm) se fusiona en cada capa lineal, y se utilizan activaciones Hardswish, lo que reduce la latencia en inferencia. Los checkpoints publicados son destilados: se entrena una segunda cabeza de clasificación y en inferencia se promedian las dos cabezas, lo que mejora la precisión sin coste adicional. El modelo fue preentrenado en ImageNet-1k a resolución 224x224. La conversión de ZeroModels mantiene la normalización ImageNet integrada en el modelo, por lo que se deben pasar píxeles crudos en rango [0, 255].

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet, con salida de logits y top-1.
- Extracción de características como backbone: la clase `LevitModel.from_weights(...)` devuelve la secuencia final de tokens sin la cabeza de clasificación, útil para transfer learning.
- Multi-backend: una única implementación Keras 3 funciona sin cambios en TensorFlow, PyTorch y JAX, seleccionable mediante la variable de entorno `KERAS_BACKEND`.
- Preprocesamiento integrado: la normalización ImageNet está dentro del modelo, por lo que se aceptan píxeles en [0, 255] directamente.
- Soporte de destilación: el modelo promedia internamente las dos cabezas de clasificación, replicando el comportamiento del checkpoint original.
- Compatibilidad con pesos comunitarios: se pueden cargar pesos del modelo original de HuggingFace mediante el prefijo `hf:` (por ejemplo, `hf:facebook/levit-128`).

## Casos de uso

- Clasificación de imágenes en tiempo real en dispositivos edge: gracias a su diseño híbrido y a la fusión de BatchNorm, LeViT-128 ofrece una latencia muy baja en CPU y GPU, adecuado para aplicaciones de visión en robots, drones o cámaras inteligentes.
- Extracción de características para sistemas de recuperación de imágenes: usando el backbone sin cabeza, se pueden generar embeddings de 128 dimensiones (o más según la variante) para indexar y buscar imágenes por similitud.
- Transfer learning en dominios específicos: el modelo preentrenado en ImageNet puede fine-tuning en conjuntos de datos pequeños (por ejemplo, clasificación de defectos industriales o especies vegetales) con pocos recursos de cómputo.
- Prototipado rápido en investigación: al ser una implementación Keras 3, los investigadores pueden experimentar con el mismo código en diferentes backends (JAX para TPU, TensorFlow para producción, PyTorch para integración con otras librerías) sin reescribir nada.
- Aplicaciones de visión en móviles: aunque no se proporcionan cuantizaciones oficiales, el modelo es lo suficientemente pequeño para convertirse a TFLite y ejecutarse en smartphones, permitiendo clasificación offline.
- Benchmarking de arquitecturas híbridas: LeViT-128 sirve como referencia para comparar el equilibrio entre precisión y velocidad frente a otros vision transformers pequeños, útil para decidir la arquitectura en proyectos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original (arXiv:2104.01136) reporta métricas de precisión y latencia para las distintas variantes de LeViT, pero esos datos no se incluyen en la model card de esta conversión ni en los resultados de búsqueda proporcionados. Se recomienda consultar el paper para obtener cifras comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, inferior a 1 GB en FP32 para una imagen de 224x224, dado el tamaño reducido del modelo (alrededor de 9 millones de parámetros, aunque no confirmado).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; también funciona en CPU sin problemas para inferencia por lotes pequeños.
- Compatibilidad con GPU de consumo: sí, modelos como RTX 2060, GTX 1660 o incluso integradas Intel pueden ejecutarlo sin dificultad.
- Opciones de despliegue: al ser Keras 3, se puede exportar a TensorFlow SavedModel, TFLite, o usar directamente con los backends disponibles. También se puede servir con TensorFlow Serving o mediante frameworks como FastAPI para inferencia en producción.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el paper original reporta que LeViT-128 es significativamente más rápido que ViT de tamaño similar en CPU, pero no se dan cifras concretas aquí.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Precisión ImageNet (top-1) | Licencia | Formato |
|---|---|---|---|---|---|
| LeViT-128 (este) | ~9M (no confirmado) | 224x224 | no disponible | Apache 2.0 | Keras 3 (multi-backend) |
| ViT-Tiny (google/vit-base-patch16-224) | 86M | 224x224 | ~75% (aprox.) | Apache 2.0 | PyTorch/JAX |
| DeiT-Tiny (facebook/deit-tiny-distilled-patch16-224) | 5.7M | 224x224 | ~74.5% (aprox.) | Apache 2.0 | PyTorch |
| MobileViT-S (apple/mobilevit-small) | 5.6M | 256x256 | ~78.4% (aprox.) | Apache 2.0 | PyTorch |

Nota: los datos de precisión de los modelos comparados son aproximados y provienen de conocimiento general, no de la información proporcionada. No se dispone de una comparativa directa con LeViT-128 en la documentación consultada.

## Limitaciones y advertencias

- Sesgos conocidos: al estar preentrenado en ImageNet, el modelo puede reflejar los sesgos de ese conjunto de datos, como sobrerrepresentación de ciertas categorías y falta de diversidad en otras.
- Riesgo de alucinación: no aplica directamente, pero en tareas de clasificación puede producir salidas incorrectas con alta confianza en imágenes fuera de distribución.
- Limitaciones de contexto: al ser un modelo de visión, no procesa texto ni secuencias largas; su entrada es una imagen fija de 224x224 (aunque se puede adaptar).
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright y se indiquen los cambios.
- Caveat para producción: la conversión de ZeroModels es reciente (creada en agosto de 2026) y tiene 0 descargas, por lo que se recomienda validar el comportamiento en un entorno de prueba antes de desplegarla en producción. Además, la normalización integrada puede dar resultados ligeramente diferentes si se aplica un preprocesamiento externo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeromodels/levit-128
- Modelo original de Meta: https://huggingface.co/facebook/levit-128
- Paper: https://arxiv.org/abs/2104.01136
- Repositorio ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentación de backbones: https://imvision12.github.io/ZeroModels/classification_backbones/
- Documentación de carga de pesos: https://imvision12.github.io/ZeroModels/loading_weights/
- Colección de variantes LeViT: https://huggingface.co/collections/zeromodels/levit-6a937f8760837c24b7a51d25
