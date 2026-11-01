# vllm-project/gte-large

## Resumen

gte-large es un modelo de embeddings de texto desarrollado originalmente por Alibaba-NLP (el repositorio `vllm-project/gte-large` es una réplica alojada por el equipo de vLLM para sus pruebas de integración). Está diseñado para generar representaciones vectoriales densas de frases y documentos, y se utiliza en tareas de similitud semántica, recuperación de información (retrieval) y clasificación de texto. Su relevancia radica en que es uno de los modelos de embeddings de referencia en la familia GTE, con un rendimiento sólido en el benchmark MTEB.

Arquitectura basada en BERT (familia transformer encoder) con 335.142.400 parámetros totales. El modelo se distribuye en formatos safetensors, PyTorch, ONNX y OpenVINO, y es compatible con `sentence-transformers`, `text-embeddings-inference` y endpoints de HuggingFace. La licencia MIT facilita su uso comercial sin restricciones significativas.

Este modelo no es un generador de texto: es un encoder que produce embeddings. Por tanto, su utilidad está en pipelines de búsqueda semántica, RAG (retrieval-augmented generation), clustering y reranking, no en generación de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder) |
| Parametros totales | 335.142.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch, ONNX, OpenVINO |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT, un transformer encoder bidireccional. Con 335 millones de parámetros, se sitúa en el rango de BERT-large y variantes similares. Está publicado con la librería `sentence-transformers`, lo que implica que produce embeddings de frase directamente utilizables (probablemente mediante pooling sobre las representaciones del encoder, aunque la model card no detalla la estrategia exacta de pooling).

La información disponible no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF/DPO (poco habituales en modelos de embeddings). El modelo está asociado al paper arXiv:2308.03281 (GTE), que describe la familia de modelos de embeddings GTE. No se detallan innovaciones técnicas adicionales en la información proporcionada.

## Capacidades

- Generación de embeddings de texto para similitud semántica (sentence-similarity).
- Recuperación de información (retrieval) sobre corpus documentales.
- Clasificación de texto (clasificación de sentimiento, tópicos, intenciones).
- Clustering de documentos y frases.
- Reranking de resultados de búsqueda.
- Evaluación en el benchmark MTEB (Multilingual Text Embeddings Benchmark).
- Soporte multilingüe: limitado a inglés según los metadatos (`en`).
- Compatible con `text-embeddings-inference` y endpoints de HuggingFace.
- No soporta generación de texto, tool calling ni razonamiento multi-paso (es un encoder, no un modelo generativo).

## Casos de uso

- Búsqueda semántica en bases de conocimiento: indexar documentos con embeddings gte-large y recuperar los más relevantes para una consulta mediante similitud coseno. Adecuado por su rendimiento en tareas de retrieval (p. ej., nDCG@10 de 57,16 en ArguAna).
- RAG (retrieval-augmented generation): usar gte-large como retriever en un pipeline que alimente a un LLM generativo con los fragmentos más relevantes. Su licencia MIT y compatibilidad con `text-embeddings-inference` facilitan el despliegue en producción.
- Clasificación de tickets de soporte: generar embeddings de tickets y entrenar un clasificador ligero encima (o usar similitud con prototipos). El rendimiento en clasificación es sólido (92,52 % de accuracy en AmazonPolarity).
- Deduplicación y clustering de documentos: agrupar noticias, artículos o correos similares usando los embeddings y un algoritmo de clustering (k-means, HDBSCAN). Los resultados de clustering en MTEB (v-measure 48,62 en ArxivClusteringP2P) respaldan esta aplicación.
- Reranking en motores de búsqueda: combinar un retriever léxico (BM25) con gte-large para reordenar los candidatos. El rendimiento en AskUbuntuDupQuestions (MAP 63,06) es indicativo.
- Moderación de contenido y detección de similitud: comparar mensajes de usuario contra una base de mensajes conocidos (spam, abuso) mediante similitud de embeddings.
- Análisis de similitud en dominios biomédicos: el resultado en BIOSSES (Spearman 88,65) sugiere utilidad en pares de frases biomédicas, aunque el modelo es generalista y en inglés.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (MTEB, inglés). No verificados de forma independiente (`verified: false`).

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Classification | AmazonCounterfactualClassification (en) | accuracy | 72,63 |
| Classification | AmazonCounterfactualClassification (en) | f1 | 66,24 |
| Classification | AmazonPolarityClassification | accuracy | 92,52 |
| Classification | AmazonPolarityClassification | f1 | 92,51 |
| Classification | AmazonReviewsClassification (en) | accuracy | 49,07 |
| Classification | AmazonReviewsClassification (en) | f1 | 48,45 |
| Classification | Banking77Classification | accuracy | 86,06 |
| Classification | Banking77Classification | f1 | 86,02 |
| Retrieval | ArguAna | ndcg_at_10 | 57,16 |
| Retrieval | ArguAna | recall_at_10 | 85,92 |
| Retrieval | ArguAna | map_at_10 | 48,15 |
| Retrieval | CQADupstackAndroidRetrieval | ndcg_at_10 | 51,82 |
| Retrieval | CQADupstackAndroidRetrieval | map_at_10 | 44,86 |
| Clustering | ArxivClusteringP2P | v_measure | 48,62 |
| Clustering | ArxivClusteringS2S | v_measure | 43,36 |
| Clustering | BiorxivClusteringP2P | v_measure | 39,11 |
| Clustering | BiorxivClusteringS2S | v_measure | 36,85 |
| Reranking | AskUbuntuDupQuestions | map | 63,06 |
| Reranking | AskUbuntuDupQuestions | mrr | 76,16 |
| STS | BIOSSES | cos_sim_spearman | 88,65 |
| STS | BIOSSES | cos_sim_pearson | 90,25 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB solo para pesos (335 M parámetros × 4 bytes), más overhead de activaciones y batch. En la práctica, 2-4 GB de VRAM son suficientes para batches moderados.
- En fp16/bf16: aproximadamente 0,7 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100). Para alto throughput, A100/H100 o L4.
- Cabe en GPU consumer: sí, en todas las GPU modernas con 4 GB o más.
- Opciones de despliegue: `sentence-transformers`, `text-embeddings-inference` (TEI), ONNX Runtime, OpenVINO, vLLM (soporte de embeddings), HuggingFace Inference Endpoints.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un encoder de 335 M de parámetros, se espera un throughput alto en GPU (miles de frases por segundo en A100 con batching), pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| gte-large (este) | 335 M | no disponible | MIT | en | Embeddings BERT-large, MTEB inglés |
| gte-base | no disponible | no disponible | MIT | en | Versión menor de la familia GTE |
| bge-large-en-v1.5 | 335 M | 512 tokens | MIT | en | Alternativa popular de BAAI para embeddings en inglés |
| e5-large-v2 | 335 M | 512 tokens | MIT | en | Embeddings de Microsoft, fuerte en retrieval |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la información proporcionada; la comparación se basa en características generales de la categoría.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés: no soporta castellano ni otros idiomas de forma nativa.
- Es un encoder de embeddings, no un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Riesgo de alucinación no aplica directamente (no genera texto), pero los embeddings pueden reflejar sesgos presentes en los datos de entrenamiento (no documentados en la información disponible).
- Longitud máxima de contexto no documentada en la información proporcionada; en modelos BERT similares suele ser de 512 tokens, pero no se confirma.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false`).
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución; sin restricciones adicionales conocidas.
- El repositorio `vllm-project/gte-large` es una réplica para pruebas de vLLM; para uso en producción se recomienda acudir al repositorio original de Alibaba-NLP.
- No se documentan limitaciones específicas de sesgo, robustez o dominios fuera de los evaluados en MTEB.

## Enlaces

- HuggingFace (réplica vLLM): https://huggingface.co/vllm-project/gte-large
- Paper GTE: https://arxiv.org/abs/2308.03281
- Repositorio original (Alibaba-NLP): no disponible en la información proporcionada
- Benchmark MTEB: no disponible en la información proporcionada
- Documentación de sentence-transformers: no disponible en la información proporcionada
