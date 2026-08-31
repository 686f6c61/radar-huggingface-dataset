# vietnamese-acsa/bamibert-phone-acsa-multilabel

## Resumen

El modelo `vietnamese-acsa/bamibert-phone-acsa-multilabel` es un ajuste fino (fine-tuning) de BamiBERT, un modelo de lenguaje preentrenado para vietnamita desarrollado por Qualcomm AI Research. BamiBERT se entrenó desde cero sobre un corpus de 129 GB de texto general vietnamita durante 20 épocas, con una longitud de contexto extendida de 2048 tokens, superando las limitaciones de PhoBERT, el codificador de texto vietnamita de facto hasta entonces. Este modelo concreto se ha adaptado para tareas de clasificación de texto multilabel, probablemente orientado al análisis de sentimiento a nivel de aspecto (ACSA) en reseñas de teléfonos móviles, aunque la documentación oficial no especifica la tarea exacta.

Con aproximadamente 103 millones de parámetros, sigue la arquitectura BERT base y se distribuye en formato safetensors. Su relevancia radica en aprovechar las mejoras de BamiBERT (contexto más largo y entrenamiento más extenso) para una tarea downstream específica, ofreciendo una alternativa a los modelos vietnamitas existentes. Sin embargo, la falta de documentación y de resultados de evaluación limita su uso directo en producción sin una validación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (basada en BamiBERT) |
| Parametros totales | 102.981.928 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (según paper de BamiBERT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (presumiblemente, por BamiBERT) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BamiBERT es un modelo BERT preentrenado desde cero sobre 129 GB de texto vietnamita sin comprimir, durante 20 épocas, con una longitud máxima de contexto de 2048 tokens. El modelo base utiliza la arquitectura BERT estándar (encoder-only) con aproximadamente 110 millones de parámetros, aunque el ajuste fino aquí presentado tiene 102,9 millones, lo que sugiere una configuración ligeramente reducida o una poda posterior. El fine-tuning se realizó con los siguientes hiperparámetros: learning rate de 5e-5, batch size de entrenamiento de 16, batch size de evaluación de 64, semilla 42, optimizador AdamW (fused) con betas (0.9, 0.999), scheduler lineal y 3 épocas. No se especifica el dataset de entrenamiento ni el procedimiento de ajuste (si se usó RLHF, DPO u otro), y la model card indica que fue generada automáticamente, por lo que la información es incompleta.

## Capacidades

- Clasificación de texto multilabel: el modelo asigna múltiples etiquetas a un texto de entrada, típico en tareas de análisis de sentimiento por aspecto o categorización temática.
- Procesamiento de lenguaje vietnamita: al estar basado en BamiBERT, hereda su capacidad de representación semántica del vietnamita, incluyendo manejo de tonos y diacríticos.
- Contexto extendido: soporta hasta 2048 tokens, lo que permite procesar documentos más largos que los modelos BERT estándar (512 tokens).
- No se han documentado capacidades adicionales como tool calling, generación de código, razonamiento multi-paso o soporte multimodal.

## Casos de uso

- Análisis de sentimiento a nivel de aspecto en reseñas de productos: el nombre del modelo sugiere que está entrenado para clasificar aspectos (p. ej., batería, cámara, rendimiento) en reseñas de teléfonos, asignando etiquetas de sentimiento (positivo, negativo, neutro) a cada aspecto. Se usaría alimentando el texto de la reseña y obteniendo las etiquetas correspondientes.
- Moderación de contenido en foros o redes sociales: al ser multilabel, puede detectar simultáneamente categorías como spam, toxicidad o temas específicos en comentarios vietnamitas.
- Clasificación de tickets de soporte técnico: para enrutar automáticamente solicitudes de usuarios según el problema reportado (hardware, software, facturación, etc.), aprovechando el contexto largo para leer descripciones detalladas.
- Análisis de opiniones en encuestas: procesar respuestas abiertas en vietnamita y etiquetarlas con múltiples temas o emociones, facilitando el análisis cuantitativo.
- Filtrado de contenido en plataformas de comercio electrónico: categorizar reseñas de productos por aspectos relevantes (calidad, precio, envío) para mejorar la experiencia de compra.
- Investigación académica en PLN vietnamita: como modelo de referencia para experimentos de clasificación multilabel, dado su origen en BamiBERT y su disponibilidad en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección `model-index` de la model card contiene una lista vacía de resultados, y no se encontraron métricas de evaluación (como F1, precisión o recall) en la documentación. Por tanto, no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo BERT base (~103M parámetros), en FP32 ocupa aproximadamente 412 MB. Con cuantización INT8, se reduce a unos 103 MB, y en FP16 a unos 206 MB. Por tanto, es viable en GPUs con al menos 2 GB de VRAM para inferencia en lote pequeño.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, como NVIDIA T4, RTX 2080, RTX 3060 o superiores. Para entrenamiento o fine-tuning adicional, se recomienda al menos 8 GB de VRAM.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas como RTX 3060 (12 GB) o incluso en integradas con suficiente memoria compartida, aunque con menor rendimiento.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, TGI, y puede exportarse a ONNX o TensorRT. También es posible usar llama.cpp si se convierte a GGUF, aunque no se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput estimados: no disponibles. Como referencia, un BERT base en una GPU T4 suele procesar cientos de secuencias por segundo con batch de 32, pero depende de la longitud de entrada y la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bamibert-phone-acsa-multilabel (este) | 102,9M | 2048 | vietnamita | no disponible | Hugging Face |
| BamiBERT (base) | ~110M (estimado) | 2048 | vietnamita | no disponible | Hugging Face (Qualcomm-AI-Research) |
| PhoBERT (base) | 135M | 512 | vietnamita | MIT | Hugging Face |

PhoBERT es el modelo vietnamita más utilizado, con licencia MIT y contexto limitado a 512 tokens. BamiBERT mejora el contexto y el entrenamiento, pero su licencia no está clara. Este modelo fine-tuneado no ofrece datos de rendimiento, por lo que no se puede establecer una comparación cuantitativa. Se recomienda evaluar ambos en la tarea específica antes de elegir.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o modificación. Se debe contactar al autor antes de usarlo en producción.
- Documentación insuficiente: la model card es una plantilla automática sin información sobre el dataset de entrenamiento, la tarea exacta, el preprocesamiento o los resultados de evaluación.
- Sesgos y alucinaciones: al ser un modelo de clasificación, no genera texto libre, pero puede presentar sesgos en las etiquetas si el dataset de entrenamiento estaba desequilibrado. No hay datos al respecto.
- Riesgo de sobreajuste: al entrenarse solo 3 épocas con un dataset desconocido, podría no generalizar bien a dominios fuera del entrenamiento.
- Idioma limitado: aunque BamiBERT es multilingüe en teoría, su entrenamiento se centró en vietnamita; el uso en otros idiomas probablemente degrade el rendimiento.
- Sin soporte de cuantización oficial: no se proporcionan versiones cuantizadas, por lo que el despliegue en entornos con recursos limitados requiere conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vietnamese-acsa/bamibert-phone-acsa-multilabel
- Paper de BamiBERT (arXiv): https://arxiv.org/pdf/2607.02259
- Repositorio de BamiBERT en Hugging Face: https://huggingface.co/Qualcomm-AI-Research/BamiBERT
- Página HTML del paper: https://arxiv.org/html/2607.02259
