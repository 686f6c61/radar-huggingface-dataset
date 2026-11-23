# SriRamanaAtmic/AtmicReRanker

## Resumen

AtmicReRanker es un cross-encoder de reordenamiento (reranker) para recuperación de información, desarrollado por SriRamanaAtmic. Se trata de un ajuste fino de `castorini/monobert-large-msmarco`, un BERT-large configurado como clasificador de pares (query, pasaje) con dos etiquetas de salida. El modelo resuelve la segunda etapa de un pipeline de búsqueda: dado un conjunto de candidatos devueltos por un retriever denso, reordena los pasajes según su relevancia real respecto a la consulta.

El ajuste se ha realizado sobre un corpus específico de preguntas y respuestas relacionadas con Ramana Maharshi (7.328 consultas de entrenamiento y 1.280 de validación), lo que lo hace especialmente adecuado para dominios espirituales y filosóficos, pero no para recuperación general. La arquitectura es un transformer encoder BERT-large con 335 millones de parámetros, contexto de 512 tokens y licencia MIT, lo que facilita su uso comercial.

Es relevante porque demuestra una mejora medible sobre el modelo base en todas las métricas de ranking dentro de su dominio, y porque documenta explícitamente una decisión metodológica poco habitual: la selección de checkpoint por brecha train/val loss en lugar de por precisión de validación, para evitar sobreajuste al estilo de los negativos del corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-large (transformer encoder) como cross-encoder, `BertForSequenceClassification` con `num_labels=2` |
| Parametros totales | 335.143.938 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors, admite cuantización posterior con herramientas estándar) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT-large (24 capas de encoder, hidden size 1024, 16 cabezas de atención) con una cabeza de clasificación de dos logits. La puntuación de relevancia se calcula como `logits[:,1] - logits[:,0]`, convención heredada de MonoBERT y de PyGaggle. El tokenizador es `BertTokenizerFast` y el repositorio solo incluye `tokenizer.json`, no `vocab.txt`, por lo que no es cargable con `BertTokenizer` clásico. No es compatible con `sentence_transformers.cross_encoder.CrossEncoder`; requiere carga manual con Transformers.

El ajuste fino congela las embeddings y las 20 capas inferiores de las 24 del encoder, dejando entrenables las 4 superiores, el pooler y el clasificador. La función de pérdida es un LambdaRank ponderado por pares: pérdida logística de RankNet sobre el margen de relevancia, escalada por el valor absoluto de ΔNDCG de cada par. Se entrenó con learning rate 2e-5, batch efectivo de 32, longitud máxima de 512 y se probaron 2 épocas. El checkpoint final se seleccionó por la menor brecha entre train loss y val loss, evaluada cada 50 pasos, resultando el paso 40 (dentro de la primera época). El autor documenta que una ejecución anterior seleccionada por precisión de pares en validación sobreajustó y quedó por debajo del modelo base en el benchmark real, lo que motivó el cambio de criterio.

## Capacidades

- Puntuación de relevancia query-pasaje mediante cross-encoder, con salida de dos logits y score derivado por diferencia o softmax.
- Reordenamiento de candidatos en pipelines de recuperación en dos etapas (retriever denso + reranker).
- Clasificación de pares de texto con truncación controlada del pasaje (`truncation="only_second"`).
- Especialización en el dominio de preguntas y respuestas sobre Ramana Maharshi y literatura espiritual afín.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo de pensamiento (thinking mode).
- No tiene capacidades de visión, audio ni generación de texto libre.
- Multilingüismo limitado al inglés.

## Casos de uso

- Reordenamiento en buscadores de literatura espiritual: el modelo recibe los 20 mejores candidatos de un retriever denso y los reordena por relevancia real, mejorando recall@1 de 0,3406 (retriever solo) a 0,4961 en el conjunto de validación del dominio.
- Segunda etapa en pipelines RAG sobre corpus de enseñanzas y citas: dado que el cross-encoder puntúa conjuntamente query y pasaje, filtra falsos positivos que el retriever denso coloca en posiciones altas por similitud superficial.
- Evaluación comparativa de retrievers: al ser un checkpoint de referencia con benchmark publicado, sirve para medir la calidad de un nuevo retriever sobre el mismo corpus de validación de 1.280 consultas y 1.072 pasajes.
- Filtrado de duplicados y pasajes irrelevantes en bases documentales pequeñas: el score continuo `logits[:,1]-logits[:,0]` permite fijar umbrales de corte ajustables.
- Investigación en selección de checkpoints: el modelo documenta un caso reproducible de sobreajuste detectado por brecha de pérdidas frente a precisión de validación, útil como referencia metodológica en experimentos de fine-tuning de rerankers.
- Despliegue en entornos con recursos limitados: con 335 millones de parámetros y licencia MIT, puede servirse en una GPU consumer tras cuantización, aunque el autor no publica variantes cuantizadas.

## Benchmarks y rendimiento

Evaluación en pool cerrado sobre el conjunto de validación combinado (1.280 consultas, corpus de 1.072 pasajes), usando `SriRamanaAtmic/AtmicEmbeddingv3` como retriever de primera etapa con top-20 candidatos por consulta. Los candidatos fuera del top-20 cuentan como fallo en todas las métricas.

| Métrica | stage1 dense solo | MonoBERT base | AtmicReRanker |
|---|---|---|---|
| recall@1 | 0.3406 | 0.4766 | 0.4961 |
| recall@5 | 0.5508 | 0.6336 | 0.6461 |
| mrr@10 | 0.4324 | 0.5450 | 0.5604 |
| ndcg@10 | 0.4794 | 0.5787 | 0.5902 |

Techo de la etapa 1 (recall top-20, cota superior para ambos rerankers): 0.7156.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 1,3 GB de pesos más activaciones; en la práctica, 2-3 GB para batch pequeño con longitud 512.
- VRAM estimada en fp16: alrededor de 0,7 GB de pesos; 1,5-2 GB con activaciones para batch de 8-16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp16; A100 o H100 para throughput alto en producción.
- Cabe en GPU consumer: sí, en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090 y similares.
- Opciones de despliegue: Transformers con `BertForSequenceClassification` (carga manual, no compatible con `sentence_transformers.CrossEncoder`); servible con TGI o con un wrapper propio; no se documenta soporte directo en vLLM ni llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| AtmicReRanker | 335 M | 512 | MIT | Fine-tune de dominio, benchmark propio publicado |
| castorini/monobert-large-msmarco | 335 M | 512 | no disponible en la información | Modelo base; AtmicReRanker lo supera en todas las métricas del benchmark del autor |
| bge-reranker-base | no disponible en la información | no disponible en la información | no disponible en la información | Checkpoint previo alojado en el mismo repositorio, sustituido por el actual; no comparable directamente por falta de datos |

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente sobre preguntas y respuestas de Ramana Maharshi; el rendimiento fuera de ese dominio no está medido y probablemente sea inferior al de un reranker generalista.
- Solo inglés: no soporta consultas ni pasajes en castellano ni en otros idiomas.
- Contexto de 512 tokens: los pasajes más largos se truncan, lo que puede descartar información relevante al final del documento.
- Riesgo de sobreajuste al estilo de los negativos del corpus, documentado por el propio autor en una ejecución anterior.
- Cambio incompatible en el repositorio: versiones anteriores alojaban un `bge-reranker-base` compatible con sentence-transformers; el checkpoint actual no es cargable con esa API y requiere código de carga específico.
- No incluye `vocab.txt`, solo `tokenizer.json`; usar `BertTokenizerFast`, no `BertTokenizer`.
- Licencia MIT: permite uso comercial, pero el modelo base `castorini/monobert-large-msmarco` debe verificarse por separado, ya que su licencia no se detalla en la información disponible.
- Sin datos publicados de latencia, throughput ni comportamiento en producción a escala.

## Enlaces

- Hugging Face: https://huggingface.co/SriRamanaAtmic/AtmicReRanker
- Modelo base: https://huggingface.co/castorini/monobert-large-msmarco
- Retriever de primera etapa usado en el benchmark: https://huggingface.co/SriRamanaAtmic/AtmicEmbeddingv3
