# zeromodels/regnet-y-016

## Resumen

`zeromodels/regnet-y-016` es una conversión pura a Keras 3 del checkpoint `facebook/regnet-y-016`, un modelo de clasificación de imágenes y backbone convolucional perteneciente a la familia RegNet, introducida por Facebook AI Research en el artículo *Designing Network Design Spaces* (arXiv:2003.13678). El proyecto ZeroModels reimplementa la arquitectura RegNet en Keras 3, de modo que una única implementación puede ejecutarse sin modificaciones sobre TensorFlow, PyTorch o JAX, según el backend seleccionado.

El modelo original fue entrenado en ImageNet-1k y está pensado para tareas de clasificación de imágenes o como extractor de características de cuatro etapas (strides 4, 8, 16 y 32). La variante Y incorpora bloques de Squeeze-and-Excitation (SE), lo que mejora la precisión respecto a la variante X con un coste computacional adicional moderado. El sufijo `016` indica aproximadamente 16 millones de parámetros, lo que lo sitúa en un rango ligero, adecuado para entornos con recursos limitados.

Esta versión de ZeroModels no incluye pesos en el repositorio (tamaño 0.0 GB); los pesos se cargan dinámicamente desde el checkpoint original de Hugging Face mediante `from_weights`. La licencia es Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN convolucional con bloques residuales `1x1 -> 3x3 grouped -> SE -> 1x1`, stem de 3x3 stride 2 y cuatro etapas |
| Parametros totales | Aproximadamente 16 millones (según nomenclatura RegNet; no confirmado en la ficha) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de visión, no texto) |
| Tipos de cuantizacion | No disponible (el checkpoint original se distribuye en FP32/FP16; esta conversión no documenta cuantización) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el repositorio no contiene pesos; se cargan desde `facebook/regnet-y-016` vía `from_weights`) |

## Arquitectura y entrenamiento

RegNet-Y-016 sigue el diseño de espacio de búsqueda propuesto en el artículo *Designing Network Design Spaces*. La arquitectura se compone de un stem convolucional de 3x3 con stride 2, seguido de cuatro etapas de bloques residuales. Cada bloque combina una convolución 1x1, una convolución 3x3 con grupos (grouped convolution) y una capa de Squeeze-and-Excitation (SE) antes de la proyección final 1x1. La variante Y se distingue de la X precisamente por la inclusión de SE, que recalibra los canales y mejora la precisión con un coste adicional pequeño.

El modelo original fue entrenado en ImageNet-1k (1,28 millones de imágenes, 1000 clases) con técnicas estándar de aumento de datos y regularización. No se dispone de información detallada sobre el número exacto de épocas, el optimizador o el régimen de aprendizaje en la documentación de esta conversión. La implementación de ZeroModels mantiene la normalización integrada (`include_normalization=True`), de modo que se pueden pasar píxeles crudos en el rango [0, 255] sin preprocesado adicional. Soporta tanto el formato de canales `channels_last` como `channels_first` con resultados bit-exactos.

## Capacidades

- Clasificación de imágenes: devuelve logits de 1000 clases de ImageNet-1k mediante la clase `RegNetImageClassify`.
- Extracción de características multiescala: la clase `RegNetModel` con `as_backbone=True` devuelve características de las cuatro etapas con strides 4, 8, 16 y 32, útil para tareas de detección, segmentación o transferencia de aprendizaje.
- Multi-backend: la misma implementación funciona en TensorFlow, PyTorch y JAX, seleccionable mediante la variable de entorno `KERAS_BACKEND`.
- Normalización integrada: acepta píxeles en [0, 255] sin necesidad de preprocesado externo.
- Compatibilidad con formatos de canales: soporta `channels_last` y `channels_first` con resultados idénticos.
- Carga de pesos flexible: permite cargar pesos desde el hub de ZeroModels o desde el checkpoint original de Facebook (`hf:facebook/regnet-y-016`).

## Casos de uso

- Clasificación de imágenes en producción: el modelo puede servir como clasificador de imágenes de propósito general en aplicaciones web o móviles, gracias a su tamaño reducido (~16M parámetros) y su latencia baja en GPU o CPU. Se integraría mediante la clase `RegNetImageClassify` y una API REST.
- Extracción de características para transferencia de aprendizaje: usando `RegNetModel` como backbone, se pueden conectar cabezales personalizados para tareas específicas como clasificación de imágenes médicas, detección de defectos industriales o reconocimiento de especies. Las características multiescala permiten adaptarse a objetos de distintos tamaños.
- Detección de objetos y segmentación semántica: las características de las cuatro etapas (strides 4, 8, 16, 32) son adecuadas como backbone en arquitecturas como Faster R-CNN, Mask R-CNN o U-Net. El modelo puede reemplazar a ResNet en pipelines existentes con un coste computacional similar.
- Sistemas de búsqueda visual y recuperación de imágenes: las características de la penúltima capa pueden usarse como embeddings para construir índices de similitud (por ejemplo, con FAISS) y alimentar motores de búsqueda por contenido visual.
- Clasificación en tiempo real en dispositivos edge: con ~16M parámetros, el modelo cabe en memoria de GPUs integradas o incluso en CPU con cuantización. Puede desplegarse en Jetson, Raspberry Pi con acelerador o navegadores mediante TensorFlow.js o WebGPU.
- Investigación en diseño de arquitecturas: al ser una implementación limpia en Keras 3, sirve como referencia para estudiar el impacto de los bloques SE, la agrupación de convoluciones y la regla lineal cuantizada en el rendimiento de redes convolucionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original `facebook/regnet-y-016` fue entrenado en ImageNet-1k, pero esta conversión no documenta métricas de precisión, latencia ni throughput. Para datos de rendimiento, se recomienda consultar el artículo original o el repositorio de timm, que incluye evaluaciones de RegNet-Y-016.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 64 MB en FP32 (16M parámetros × 4 bytes), más overhead de activaciones. En FP16 se reduce a ~32 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060 o superiores funcionan sin problemas. También es viable en CPU para inferencia por lotes pequeños.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna, incluidas las integradas de Intel o Apple Silicon.
- Opciones de despliegue: al ser Keras 3, se puede exportar a TensorFlow SavedModel, ONNX o TFLite. Puede servirse con TensorFlow Serving, TorchServe (si se usa backend torch) o mediante frameworks como FastAPI con carga directa del modelo.
- Latencia y throughput estimados: no disponibles en la documentación. Dado el tamaño, se espera una latencia de pocos milisegundos por imagen en GPU y decenas de milisegundos en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Precisión ImageNet (top-1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RegNet-Y-016 (este) | ~16M | CNN con SE | No disponible en esta ficha | Apache 2.0 | Hugging Face, Keras 3 |
| RegNet-X-016 | ~16M | CNN sin SE | No disponible | Apache 2.0 | Hugging Face, Keras 3 |
| ResNet-18 | ~11.7M | CNN residual clásica | ~69.8% (referencia) | Apache 2.0 | Amplia disponibilidad |
| ResNet-50 | ~25.6M | CNN residual con bottleneck | ~76.1% (referencia) | Apache 2.0 | Amplia disponibilidad |

Los datos de precisión de ResNet son valores de referencia ampliamente conocidos, pero no se han verificado en la información proporcionada. RegNet-Y-016 suele superar a ResNet-18 con un coste similar, pero no se dispone de cifras confirmadas para esta conversión.

## Limitaciones y advertencias

- El repositorio de ZeroModels no contiene pesos; depende de la carga dinámica desde el checkpoint de Facebook. Si el checkpoint original se retira o cambia, el modelo podría dejar de funcionar.
- No se documentan sesgos específicos, pero al estar entrenado en ImageNet-1k, el modelo puede presentar sesgos hacia las categorías y estilos de imagen de ese dataset (por ejemplo, menor precisión en imágenes de dominios no representados).
- Riesgo de alucinación: no aplica, al ser un modelo discriminativo de visión, no generativo.
- Limitaciones de contexto: no aplica, pero la resolución de entrada está fijada a 224×224 píxeles en la implementación por defecto. Para resoluciones mayores, se requeriría adaptar la arquitectura.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright y se indiquen los cambios realizados.
- La fecha de creación del modelo (2026-08-29) es posterior a la fecha actual de conocimiento, lo que sugiere que puede tratarse de un modelo recién publicado o con metadatos inusuales. Se recomienda verificar la disponibilidad real del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zeromodels/regnet-y-016
- Modelo original de Facebook: https://huggingface.co/facebook/regnet-y-016
- Colección de modelos RegNet de ZeroModels: https://huggingface.co/collections/zeromodels/regnet-6a9270a4e723a861ea988d0b
- Repositorio GitHub de ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentación de RegNet en ZeroModels: https://imvision12.github.io/ZeroModels/regnet/
- Documentación de carga de pesos: https://imvision12.github.io/ZeroModels/loading_weights/
- Artículo original: https://arxiv.org/abs/2003.13678
- Página del artículo en Hugging Face Papers: https://huggingface.co/papers/2003.13678
