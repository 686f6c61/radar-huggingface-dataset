# tadiecool29/MTL-rasyosef-roberta-base-amharic-finetuned

## Resumen

El modelo `MTL-rasyosef-roberta-base-amharic-finetuned` es un ajuste fino (fine-tuning) del modelo base `rasyosef/roberta-base-amharic`, un transformer tipo RoBERTa preentrenado desde cero para el amárico, la lengua oficial de Etiopía. El autor, `tadiecool29`, ha adaptado este modelo para tareas de detección de postura (stance detection) y análisis de sentimiento en textos amáricos, obteniendo métricas de evaluación que combinan ambas tareas en una única salida.

El modelo tiene 110,6 millones de parámetros y se distribuye en formato `safetensors` (0,4 GB). Aunque la ficha de HuggingFace no especifica la licencia ni los idiomas soportados, por su naturaleza y por el nombre del modelo base se entiende que está orientado exclusivamente al amárico. Su relevancia radica en cubrir un hueco en el procesamiento del lenguaje natural para lenguas de bajos recursos, donde los modelos multilingües suelen rendir peor que los específicos.

El ajuste se realizó con el `Trainer` de HuggingFace sobre un dataset no documentado (indicado como "None" en la model card), con 6 épocas, tasa de aprendizaje de 1e-5 y optimizador AdamW. Las métricas de evaluación reportadas por el autor incluyen un F1 combinado de 0,7679, con un F1 de postura de 0,7988 y un F1 de sentimiento de 0,7370.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder-only) |
| Parametros totales | 110.621.959 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (típico de RoBERTa: 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | amárico (por el nombre y el modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `rasyosef/roberta-base-amharic` sigue la arquitectura de `xlm-roberta-base`, un transformer encoder-only con atención bidireccional. Fue preentrenado desde cero sobre subconjuntos en amárico de los corpus OSCAR, mc4 y amharic-sentences-corpus, con un total de 290 millones de tokens. El tokenizer se entrenó desde cero sobre el mismo corpus y tiene un vocabulario de 32.000 subpalabras.

El fine-tuning realizado por `tadiecool29` añade una cabeza de clasificación multitarea (postura y sentimiento) sobre el encoder preentrenado. Los hiperparámetros de entrenamiento fueron: `learning_rate=1e-5`, `train_batch_size=16`, `eval_batch_size=32`, `seed=42`, optimizador AdamW con betas (0.9, 0.999), scheduler coseno con 300 pasos de warmup, 6 épocas y precisión mixta nativa (AMP). No se especifica el dataset de entrenamiento ni el proceso de etiquetado, lo que limita la reproducibilidad.

## Capacidades

- Detección de postura (stance detection) en textos amáricos: identifica si un texto expresa una posición a favor, en contra o neutral respecto a un tema.
- Análisis de sentimiento en amárico: clasifica la polaridad emocional (positiva, negativa, neutra) de un texto.
- Salida multitarea: el modelo produce simultáneamente predicciones de postura y sentimiento, con métricas separadas para cada tarea.
- Procesamiento de texto en amárico: al estar preentrenado específicamente para esta lengua, maneja mejor la morfología y el vocabulario que los modelos multilingües genéricos.
- No se han documentado capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso; es un modelo exclusivamente de clasificación.

## Casos de uso

- Análisis de opinión en redes sociales etíopes: el modelo puede clasificar tweets o publicaciones en amárico sobre temas políticos o sociales, distinguiendo postura y sentimiento, útil para monitorización de campañas o estudios sociológicos.
- Moderación de contenido en plataformas locales: permite detectar discursos de odio o polarización en comentarios de foros o redes, combinando la detección de postura con el sentimiento para priorizar intervenciones.
- Investigación académica en PLN para lenguas de bajos recursos: sirve como punto de partida para experimentos sobre transferencia de aprendizaje o adaptación a dominios específicos del amárico.
- Sistemas de recomendación de noticias: al clasificar la postura de artículos o comentarios, puede alimentar motores de recomendación que tengan en cuenta la polarización del lector.
- Análisis de encuestas abiertas: en estudios de opinión pública, las respuestas abiertas en amárico pueden clasificarse automáticamente por postura y sentimiento, reduciendo el trabajo manual de codificación.
- Detección de desinformación: combinado con otras señales, la postura y el sentimiento pueden ayudar a identificar narrativas engañosas en textos amáricos, aunque el modelo no está entrenado específicamente para veracidad.

## Benchmarks y rendimiento

El autor no ha publicado resultados en el `model-index` de HuggingFace (lista vacía). Sin embargo, la model card incluye métricas de evaluación sobre un conjunto de validación no descrito. Se presentan a continuación tal como las reporta el autor:

| Metrica | Valor |
|---|---|
| Loss (validacion) | 1,3580 |
| Stance F1 | 0,7988 |
| Sentiment F1 | 0,7370 |
| F1 combinado | 0,7679 |
| Stance Accuracy | 0,7930 |
| Sentiment Accuracy | 0,7419 |

No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- Al ser un modelo de 110 millones de parámetros, la inferencia es ligera. En FP16, el peso ocupa aproximadamente 220 MB, por lo que cabe en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente para inferencia en lote. Para entrenamiento o fine-tuning adicional, se recomienda al menos 8 GB de VRAM.
- No se han publicado datos de latencia ni throughput. En una GPU como una T4, se puede esperar un throughput del orden de cientos de secuencias por segundo, pero no hay cifras oficiales.
- Opciones de despliegue: al ser un modelo de HuggingFace con `transformers`, puede servirse con `vLLM`, `TGI` o `Ollama` (si se convierte a GGUF). También es compatible con `endpoints_compatible` según los tags, lo que sugiere que puede desplegarse en la infraestructura de HuggingFace Inference Endpoints.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de clasificación en amárico. Como referencia, el modelo base `rasyosef/roberta-base-amharic` (110M parámetros) es comparable en tamaño a `xlm-roberta-base` (278M parámetros) o `mBERT` (178M parámetros), pero está especializado en amárico. No hay datos de rendimiento de estos modelos en las tareas de postura y sentimiento para poder comparar.

| Modelo | Parametros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| MTL-rasyosef-roberta-base-amharic-finetuned | 110M | no disponible | amárico | no disponible |
| rasyosef/roberta-base-amharic (base) | 110M | no disponible | amárico | no disponible |
| xlm-roberta-base | 278M | 512 | multilingüe (100+) | MIT |

## Limitaciones y advertencias

- No se ha documentado el dataset de entrenamiento ni el proceso de etiquetado, lo que impide evaluar posibles sesgos o la representatividad de los datos.
- El modelo está diseñado exclusivamente para clasificación de postura y sentimiento; no genera texto ni soporta otras tareas.
- No se han reportado pruebas de robustez ante ruido, variaciones dialectales o dominios diferentes al de entrenamiento.
- La licencia no está especificada, por lo que su uso comercial es incierto; se recomienda contactar al autor antes de utilizarlo en producción.
- Las métricas de evaluación provienen de un único conjunto de validación no descrito; no hay garantía de generalización a otros corpus.
- Al ser un modelo pequeño (110M) y específico de una lengua, su rendimiento en tareas complejas de razonamiento o comprensión lectora profunda será limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tadiecool29/MTL-rasyosef-roberta-base-amharic-finetuned
- Modelo base: https://huggingface.co/rasyosef/roberta-base-amharic (no se encontró página directa, pero el modelo medio está en https://huggingface.co/rasyosef/roberta-medium-amharic)
- Repositorio de entrenamiento de embeddings amáricos: https://github.com/rasyosef/amharic-text-embedding-models-training
- Notebook de entrenamiento de embeddings: https://github.com/rasyosef/amharic-neural-ir/blob/main/training/embeddings-amharic/train-roberta-amharic-embed-base.ipynb
- Modelo de embeddings derivado: https://huggingface.co/rasyosef/RoBERTa-Amharic-Embed-Medium
