# TheSon2202/SceneViT-Nano-P8-64

## Resumen

SceneViT-Nano-P8-64 es un modelo de clasificación de imágenes basado en Vision Transformer (ViT) desarrollado por TheSon2202, un usuario de Hugging Face. Está construido desde cero, sin utilizar arquitecturas preentrenadas, y está especializado en la clasificación de escenas naturales y urbanas. El modelo se entrenó sobre el dataset Intel Image Classification, que contiene seis categorías: edificios, bosque, glaciar, montaña, mar y calle.

Su relevancia radica en su tamaño extremadamente reducido: con un hidden size de 64, 8 capas y 4 cabezas de atención, es un modelo ligero pensado para despliegue en entornos con recursos limitados. A pesar de su simplicidad, alcanza una precisión de validación de aproximadamente el 84,30 %, lo que lo convierte en una opción interesante para prototipos y aplicaciones educativas. El modelo está disponible en formato PyTorch y también en ONNX, lo que facilita su integración en diferentes plataformas de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) personalizado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas de clase en inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth), ONNX (.onnx) |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer construido desde cero, con un tamaño de parche de 8x8 píxeles sobre imágenes de entrada de 224x224. La arquitectura consta de 8 capas ocultas, un hidden size de 64 y 4 cabezas de atención por capa. No se especifica el número total de parámetros, pero por las dimensiones indicadas se estima que es un modelo muy pequeño, del orden de cientos de miles de parámetros, muy por debajo de los ViT estándar como ViT-Base (86 millones).

El entrenamiento se realizó sobre el dataset Intel Image Classification, que contiene aproximadamente 25.000 imágenes distribuidas en seis clases. No se detallan los hiperparámetros de entrenamiento (épocas, batch size, optimizador, etc.) ni si se aplicaron técnicas como data augmentation o regularización. La precisión de validación reportada es del 84,30 %, lo que sugiere un ajuste razonable para un modelo de este tamaño, aunque sin datos adicionales no es posible evaluar su robustez frente a otros modelos.

## Capacidades

- Clasificación de imágenes en seis categorías de escenas: edificios, bosque, glaciar, montaña, mar y calle.
- Inferencia sobre imágenes de 224x224 píxeles, con normalización estándar (media y desviación de ImageNet).
- Soporte para ejecución en PyTorch y en ONNX, lo que permite su uso en entornos de producción con runtime optimizados.
- Al ser un modelo pequeño, es adecuado para inferencia en CPU o en GPUs de baja gama, con tiempos de respuesta rápidos.
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multimodal; es exclusivamente un clasificador de imágenes.

## Casos de uso

- Clasificación de escenas en aplicaciones de turismo: dado un conjunto de fotos de viajes, el modelo puede etiquetar automáticamente si la imagen corresponde a una playa, una montaña, un bosque, etc., facilitando la organización de álbumes o la generación de metadatos.
- Moderación de contenido en plataformas de imágenes: se puede integrar en un pipeline para detectar y filtrar imágenes que no correspondan a las categorías permitidas (por ejemplo, en foros de fotografía de naturaleza).
- Educación e investigación: al ser un modelo pequeño y de código abierto, es útil como ejemplo didáctico para estudiar el funcionamiento interno de los Vision Transformers, incluyendo la extracción de parches, la atención multi-cabeza y el proceso de clasificación.
- Prototipado rápido en proyectos de visión por computador: su tamaño reducido permite iterar rápidamente en entornos de desarrollo sin necesidad de GPUs potentes, sirviendo como baseline antes de probar modelos más grandes.
- Aplicaciones embebidas o edge computing: gracias a su bajo consumo de recursos, puede desplegarse en dispositivos con memoria limitada, como Raspberry Pi o cámaras inteligentes, para clasificar escenas en tiempo real.
- Automatización de etiquetado en datasets: el modelo puede pre-etiquetar grandes volúmenes de imágenes para acelerar la creación de datasets de entrenamiento, reduciendo el trabajo manual de anotación.

## Benchmarks y rendimiento

El único dato de rendimiento disponible es la precisión de validación reportada por el autor: aproximadamente 84,30 % sobre el dataset Intel Image Classification. No se han publicado resultados en benchmarks estándar como ImageNet, CIFAR-10 o Places365, ni comparaciones con otros modelos. Por tanto, no es posible situar su rendimiento en un contexto más amplio sin datos adicionales.

## Requisitos de hardware

- VRAM estimada: al ser un modelo muy pequeño (probablemente menos de 10 MB en FP32), la inferencia puede ejecutarse en CPU sin necesidad de GPU. En GPU, el uso de VRAM será mínimo, inferior a 1 GB.
- GPU recomendadas: cualquier GPU moderna, incluyendo NVIDIA GTX 1050 o superior, es suficiente. También funciona en iGPUs integradas.
- Compatibilidad con consumer GPU: sí, cualquier GPU de consumo actual puede ejecutar el modelo sin problemas.
- Opciones de despliegue: al disponer de pesos en PyTorch y ONNX, se puede servir con frameworks como TorchServe, ONNX Runtime, o incluso exportar a TensorRT para optimización. También es posible cargarlo en aplicaciones Python directamente.
- Latencia y throughput: no se dispone de mediciones oficiales, pero por el tamaño del modelo se espera una latencia de milisegundos en CPU y de sub-milisegundos en GPU para una sola imagen.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de clasificación de escenas. Como referencia cualitativa, se puede comparar con ViT-Tiny (5,7 millones de parámetros) o DeiT-Tiny, que son modelos ViT pequeños pero con más capacidad. SceneViT-Nano-P8-64 es significativamente más pequeño, lo que implica menor precisión pero también menor coste computacional. No se han encontrado benchmarks públicos que permitan una comparación directa.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en el dataset Intel Image Classification, que contiene imágenes de seis categorías específicas. No generalizará bien a otras escenas o dominios fuera de estas clases.
- La precisión del 84,30 % es moderada; en aplicaciones críticas puede ser insuficiente, y se recomienda evaluar el modelo en el dominio objetivo antes de usarlo en producción.
- No se han documentado sesgos específicos, pero al ser un dataset con imágenes de origen diverso, es posible que existan desequilibrios en la representación de ciertos entornos o condiciones de iluminación.
- El riesgo de alucinación no aplica al ser un clasificador, pero sí existe riesgo de clasificaciones erróneas en imágenes ambiguas o con múltiples escenas.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento ni soporte técnico.
- No se proporcionan detalles sobre el proceso de entrenamiento (épocas, optimizador, regularización), lo que dificulta la reproducibilidad exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheSon2202/SceneViT-Nano-P8-64
- Perfil del autor en Hugging Face: https://huggingface.co/TheSon2202
- Dataset Intel Image Classification: https://huggingface.co/datasets/sfarrukhm/intel-image-classification
- Otro modelo del autor (referencia): https://huggingface.co/TheSon2202/mistral-manim-python-coder-v01
