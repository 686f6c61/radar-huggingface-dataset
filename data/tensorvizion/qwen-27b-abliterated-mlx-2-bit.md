# TensorVizion/Qwen-27B-Abliterated-MLX-2-Bit

## Resumen

El modelo TensorVizion/Qwen-27B-Abliterated-MLX-2-Bit es una conversión al formato MLX (Apple Silicon) del modelo Qwen/Qwen3.8-27B, con una cuantización extrema de 2 bits y una modificación conocida como "abliteration" que elimina los mecanismos de rechazo de contenido del modelo original. El resultado es un modelo multimodal (imagen-texto) de la familia Qwen 3.8, liberado bajo licencia Apache 2.0, que puede ejecutarse en hardware local de gama media-baja gracias a su reducido tamaño de archivo (8,4 GB).

La relevancia de este modelo reside en que ofrece una versión de Qwen3.8-27B sin censura (uncensored) optimizada para equipos con chips M-series de Apple, facilitando su uso en entornos de desarrollo locales, investigación de alineación y pruebas de seguridad. Sin embargo, la cuantización a 2 bits implica una pérdida significativa de fidelidad en las respuestas, y el proceso de abliteration puede eliminar las barreras de seguridad del modelo original, lo que introduce riesgos considerables en producción. El repositorio no cuenta aún con descargas ni valoraciones, lo que sugiere que es una publicación reciente o experimental.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (dense, basado en Qwen3.8-27B) |
| Parametros totales | 2.523.897.344 (dato del archivo safetensors; el modelo base Qwen3.8-27B tiene ~27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base soporta hasta 128K tokens, pero la cuantización no modifica la ventana) |
| Tipos de cuantizacion | 2-bit (MLX) |
| Idiomas soportados | no disponible (el modelo base Qwen3.8-27B es multilingüe, pero esta versión no especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal nativo de la serie Qwen 3.8, diseñado para tareas de imagen-texto y texto-texto. La arquitectura incorpora un codificador de visión y un decodificador de lenguaje, con un mecanismo de atención completa sobre el contexto. El modelo original fue entrenado con un dataset multimodal y optimizado con técnicas de RLHF y DPO, además de un módulo de decodificación especulativa (MTP) para acelerar la inferencia.

La versión de TensorVizion se obtiene mediante dos procesos adicionales: la abliteration (eliminación de los vectores de dirección de rechazo de contenido, que reduce las salvaguardas del modelo) y la conversión a MLX con cuantización de 2 bits. La cuantización 2-bit reduce drásticamente el tamaño de los pesos, pero introduce una pérdida de precisión notable en las representaciones numéricas, lo que degrada la calidad del texto generado en comparación con el modelo original en FP16/BF16. No se proporcionan datos sobre el conjunto de datos de entrenamiento adicional ni sobre el proceso de abliteration aplicado.

## Capacidades

- Generación de texto y razonamiento: conserva las capacidades del modelo base para tareas de lenguaje, aunque con calidad reducida por la cuantización 2-bit.
- Comprensión de imágenes: el modelo es multimodal, capaz de procesar imágenes y texto, pero la cuantización puede degradar la percepción de detalles visuales.
- Conversación multironda: mantiene el formato de chat del modelo base, con soporte para diálogos contextuales.
- Tool calling y function calling: no confirmado en esta versión, pero el modelo base Qwen3.8-27B lo soporta; en MLX la compatibilidad depende de la integración con mlx-lm.
- Sin censura (abliterated): se ha eliminado el mecanismo de rechazo de contenido, lo que permite generar respuestas sobre temas que el modelo original bloquearía.
- Capacidades multilingües: no especificadas para esta versión; el modelo base cubre varios idiomas, pero no se garantiza su preservación tras la cuantización.

## Casos de uso

- **Desarrollo de agentes conversacionales en Apple Silicon**: el modelo puede desplegarse en MacBook con chip M1/M2/M3 usando la librería mlx-lm, permitiendo prototipos de asistentes locales sin depender de servicios en la nube. Su tamaño reducido (8,4 GB) lo hace viable en equipos con 16 GB de RAM unificada.
- **Investigación sobre alineación y seguridad**: al ser una versión abliterada, se puede usar para estudiar el efecto de la eliminación de salvaguardas en el comportamiento de modelos grandes, comparando respuestas con la versión original.
- **Generación de contenido creativo sin restricciones**: en entornos de escritura creativa o generación de guiones, donde las restricciones del modelo original podrían ser un obstáculo, esta versión ofrece respuestas sin filtros.
- **Pruebas de cuantización extrema**: útil como caso de estudio para evaluar el rendimiento de modelos de 27B en cuantización de 2 bits, midiendo la pérdida de calidad en tareas de razonamiento y visión.
- **Prototipado de aplicaciones de vision-language en local**: al ser un modelo de imagen-texto, se puede usar para generar descripciones de imágenes o responder preguntas sobre contenido visual en entornos offline.
- **Automatización de oficina**: el modelo base Qwen3.8-27B está orientado a tareas de oficina, como resumen de documentos y generación de correos; esta versión cuantizada puede ejecutar esas tareas en hardware modesto, aunque con peor calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La cuantización a 2 bits probablemente degrade significativamente las métricas de razonamiento, visión y código en comparación con el modelo base, pero no se dispone de datos cuantitativos.

## Requisitos de hardware

- **VRAM/RAM**: al ser una cuantización de 2 bits, el archivo pesa 8,4 GB, por lo que se puede cargar en memoria unificada de un Mac con 16 GB de RAM o más. En GPU con VRAM, se necesitaría al menos 10 GB para dejar margen, pero el formato MLX está diseñado para Apple Silicon.
- **GPU recomendadas**: Apple M1/M2/M3 (cualquier chip con Neural Engine). No se recomienda para GPUs NVIDIA/AMD, ya que MLX no es compatible de forma nativa con CUDA.
- **¿Cabe en consumer GPU?**: En teoría, un modelo de 2 bits de 27B parámetros (si el archivo contiene los pesos completos) podría caber en una RTX 4090 de 24 GB, pero el formato MLX no es compatible con CUDA directamente. Se necesitaría convertir a GGUF o usar otra librería.
- **Opciones de despliegue**: mlx-lm (pip install mlx-lm), que permite cargar y generar con el modelo en Apple Silicon. No se ha confirmado compatibilidad con vLLM, Ollama o TGI.
- **Latencia y throughput**: no disponible. La cuantización 2-bit reduce el tamaño de los pesos, lo que acelera la carga y la inferencia, pero la calidad de las respuestas puede degradarse.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| TensorVizion/Qwen-27B-Abliterated-MLX-2-Bit | 2.5B (archivo) / 27B (base) | no disponible | Apache 2.0 | MLX 2-bit | Abliterated, para Apple Silicon |
| PocketAiHub/Qwen3.8-27B-Abliterated-MLX | 27B | no disponible | Apache 2.0 | MLX (precisión completa) | Abliterated, sin cuantización extrema |
| Qwen/Qwen3.8-27B (original) | 27B | 128K tokens | Apache 2.0 | safetensors (BF16) | Modelo base, con salvaguardas |

La comparativa se basa en la información pública; la versión de TensorVizion es la única con cuantización a 2 bits, lo que la hace más ligera pero menos precisa.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: la abliteration elimina las capas de rechazo, lo que puede aumentar la generación de contenido tóxico, ilegal o sesgado. El modelo no tiene filtros de seguridad, por lo que puede producir textos inapropiados.
- **Pérdida de calidad por cuantización**: la cuantización de 2 bits introduce un error significativo en los pesos, lo que puede provocar respuestas incoherentes, errores de razonamiento y degradación en tareas de visión.
- **Idiomas no especificados**: no se indica qué idiomas soporta esta versión; es probable que se hayan perdido capacidades multilingües o que no se haya verificado.
- **Riesgo de uso comercial**: aunque la licencia es Apache 2.0, el modelo abliterado puede generar contenido que infrinja leyes de derechos de autor o normativas de seguridad, lo que puede exponer al usuario a riesgos legales.
- **Contexto limitado**: no se ha confirmado la longitud de contexto en esta versión; se recomienda no asumir que soporta los 128K tokens del modelo base.
- **Sin soporte oficial**: el repositorio tiene 0 descargas y 0 likes, lo que indica que es un modelo experimental sin mantenimiento garantizado.

## Enlaces

- [Hugging Face - TensorVizion/Qwen-27B-Abliterated-MLX-2-Bit](https://huggingface.co/TensorVizion/Qwen-27B-Abliterated-MLX-2-Bit)
- [Hugging Face - Qwen/Qwen3.8-27B (modelo base)](https://huggingface.co/Qwen/Qwen3.8-27B)
- [GitHub - AlibabaCloud-Official/Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Artículo sobre OrcaRouter y Qwen3.8-27B abliterated](https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026)
- [Hugging Face - PocketAiHub/Qwen3.8-27B-Abliterated-MLX](https://huggingface.co/PocketAiHub/Qwen3.8-27B-Abliterated-MLX)
- [Todd Wolven - Qwen3.8-27B abliterated AWQ-MTP quantization](https://toddwolven.com/projects/qwen38-awq-quantization)
