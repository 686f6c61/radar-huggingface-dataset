# vllm-project/gte-small-zh

## Resumen

gte-small-zh es un modelo de embeddings de frases (sentence transformer) publicado por vllm-project en Hugging Face, derivado de la familia GTE (General Text Embeddings) de Alibaba. Con 30.259.200 parámetros y arquitectura BERT, está diseñado para generar representaciones vectoriales densas de textos en chino, orientadas a tareas de similitud semántica, recuperación de información, clasificación y reranking. El modelo se distribuye en formato safetensors (0,1 GB) y bajo licencia MIT, lo que permite uso comercial sin restricciones significativas.

Su relevancia actual radica en que cubre el hueco de embeddings ligeros y de baja latencia para chino dentro del ecosistema de vLLM, lo que facilita su integración en pipelines de RAG y búsqueda semántica servidos con Text Embeddings Inference (TEI) o vLLM. Al ser un modelo pequeño, puede desplegarse en CPU y en GPUs de consumo con un coste computacional mínimo.

La model card incluye resultados en varios subconjuntos del benchmark C-MTEB (AFQMC, ATEC, BQ, CMedQAv1/v2, CmedqaRetrieval, CMNLI, CLSClustering, AmazonReviews), lo que permite evaluar su comportamiento en tareas representativas del chino. No obstante, los resultados publicados son moderados en varias tareas, lo que sugiere que conviene compararlo con alternativas más grandes antes de adoptarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder) |
| Parametros totales | 30.259.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (según metadatos); orientado a chino por los benchmarks C-MTEB |
| Licencia | MIT |
| Formato de pesos | safetensors, pytorch |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT, un transformer encoder de 30,26 millones de parámetros, empaquetado con la librería sentence-transformers para producir embeddings de frases. La información disponible no detalla el número de capas, dimensiones ocultas ni el esquema exacto de pooling; tampoco se especifica si emplea entrenamiento contrastivo con pares positivos/negativos, destilación o fine-tuning supervisado sobre tareas de similitud.

No se han publicado en la información disponible datos sobre el volumen de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos de embeddings). Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La referencia bibliográfica presente en los tags es el paper arXiv:2308.03281, correspondiente a la familia GTE original.

## Capacidades

- Generación de embeddings de frases para similitud semántica y búsqueda densa.
- Recuperación de información (retrieval) en corpus en chino, con métricas publicadas en CmedqaRetrieval.
- Reranking de documentos o pares pregunta-respuesta, con resultados en CMedQAv1 y CMedQAv2.
- Clasificación de textos (por ejemplo, análisis de sentimiento en AmazonReviews zh).
- Clustering de frases y párrafos (CLSClusteringP2P y S2S).
- Pair classification para determinar si dos textos son paráfrasis o implicación (CMNLI).
- Integración con Text Embeddings Inference (TEI) y endpoints compatibles, según los tags del repositorio.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-step.
- Capacidades multilingües limitadas: los benchmarks publicados son exclusivamente en chino, pese a que el tag de idioma declare "en".

## Casos de uso

- Búsqueda semántica en bases de conocimiento en chino: indexar documentos con embeddings del modelo y recuperar los más relevantes por similitud coseno; su tamaño reducido permite indexar grandes volúmenes con bajo coste de almacenamiento (vectores de dimensión moderada).
- RAG (retrieval-augmented generation) para asistentes en chino: usar el modelo como retriever en un pipeline que alimente a un LLM generativo; encaja por su baja latencia y su integración con TEI.
- Deduplicación y near-duplicate detection: comparar embeddings de pares de textos para detectar contenidos duplicados o casi idénticos en corpus editoriales o de atención al cliente.
- Clasificación de reseñas y tickets: entrenar un clasificador ligero sobre los embeddings generados para categorizar opiniones o incidencias en chino, como sugieren los resultados en AmazonReviews zh.
- Reranking en motores de búsqueda: reordenar los resultados de un retriever inicial (BM25 o embeddings) usando las puntuaciones de similitud del modelo, con métricas publicadas en CMedQAv1/v2.
- Clustering de consultas o documentos: agrupar preguntas frecuentes o artículos por temática usando los embeddings y un algoritmo como k-means, apoyado en los resultados de CLSClustering.
- Filtrado de pares pregunta-respuesta en dominios médicos: usar las métricas de CmedqaRetrieval como referencia para desplegar búsqueda semántica sobre FAQs sanitarias en chino.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| STS | MTEB AFQMC (validation) | cos_sim_spearman | 36,69 |
| STS | MTEB ATEC (test) | cos_sim_spearman | 45,77 |
| STS | MTEB BQ (test) | cos_sim_spearman | 49,64 |
| Classification | MTEB AmazonReviewsClassification (zh) | accuracy | 38,69 |
| Classification | MTEB AmazonReviewsClassification (zh) | f1 | 36,87 |
| Clustering | MTEB CLSClusteringP2P | v_measure | 39,54 |
| Clustering | MTEB CLSClusteringS2S | v_measure | 37,33 |
| Reranking | MTEB CMedQAv1 | map | 86,08 |
| Reranking | MTEB CMedQAv1 | mrr | 88,04 |
| Reranking | MTEB CMedQAv2 | map | 87,26 |
| Reranking | MTEB CMedQAv2 | mrr | 89,37 |
| Retrieval | MTEB CmedqaRetrieval (dev) | ndcg_at_10 | 42,46 |
| Retrieval | MTEB CmedqaRetrieval (dev) | recall_at_100 | 84,33 |
| PairClassification | MTEB Cmnli (validation) | cos_sim_ap | 76,46 |
| PairClassification | MTEB Cmnli (validation) | cos_sim_accuracy | 68,91 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (30,26 M de parámetros); alrededor de 0,5 GB en fp16 y menos de 0,25 GB en int8.
- GPU recomendadas: cualquier GPU moderna sirve; para alto throughput, A100, H100 o L4; para desarrollo, RTX 4090, RTX 3090 o incluso GPUs de gama media.
- Cabe en cualquier GPU de consumo e incluso en CPU: es viable ejecutarlo en un portátil o en un contenedor sin GPU.
- Opciones de despliegue: Text Embeddings Inference (TEI) es la opción natural dado el tag `text-embeddings-inference`; también sentence-transformers, vLLM (con soporte de embeddings), Hugging Face Inference Endpoints y ONNX Runtime.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gte-small-zh (este) | 30,26 M | no disponible | MIT | Hugging Face |
| gte-small (original, inglés) | ~30 M | no disponible | MIT | Hugging Face |
| gte-base-zh | no disponible | no disponible | MIT | Hugging Face |
| bge-small-zh | no disponible | no disponible | MIT | Hugging Face |

No se dispone en la información proporcionada de resultados comparativos directos con estos modelos; se recomienda consultar la leaderboard de C-MTEB para una comparación cuantitativa.

## Limitaciones y advertencias

- Los resultados publicados son moderados en tareas de STS y clasificación (spearman en torno a 36-50, accuracy de 38,69 en AmazonReviews zh), lo que sugiere que modelos más grandes pueden superarlo con claridad.
- El tag de idioma declara "en", pero todos los benchmarks son en chino; conviene validar su comportamiento real en inglés antes de usarlo en ese idioma.
- No es un modelo generativo: no responde preguntas ni produce texto; solo genera embeddings.
- Riesgo de sesgos heredados del corpus de entrenamiento, no documentado en la model card.
- La información sobre el corpus de entrenamiento y el proceso de alineación es inexistente, lo que dificulta evaluar riesgos de dominios específicos.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero se recomienda conservar el aviso de copyright.
- La fecha de creación del repositorio (2026-10-30) y el bajo número de descargas (22) y likes (0) sugieren que se trata de una réplica o espejo reciente dentro de la organización vllm-project, no del modelo original de Alibaba; conviene verificar la procedencia antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/vllm-project/gte-small-zh
- Paper de referencia de la familia GTE: https://arxiv.org/abs/2308.03281
- Leaderboard C-MTEB: https://huggingface.co/spaces/mteb/leaderboard
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- Repositorio vLLM: https://github.com/vllm-project/vllm
