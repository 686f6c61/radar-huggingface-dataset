# vllm-project/e5-large

## Resumen

e5-large es un modelo de embeddings de texto desarrollado originalmente por Microsoft Research (el repositorio `vllm-project/e5-large` es una réplica del checkpoint para uso con vLLM y Text Embeddings Inference). Su propósito es convertir frases y pasajes en vectores densos de 1024 dimensiones para tareas de similitud semántica, recuperación de información, clasificación y agrupamiento. Se basa en una arquitectura BERT con 335 millones de parámetros y una ventana de contexto de 512 tokens.

El modelo se entrenó con la metodología E5 (EmbEddings from bidirectional Encoder rEpresentations), que combina preentrenamiento contrastivo débilmente supervisado sobre pares de texto de la web con ajuste fino supervisado en datasets de alta calidad. Es relevante porque ofrece un rendimiento sólido en MTEB para su tamaño, con licencia MIT, lo que facilita su uso comercial y su despliegue en infraestructuras de búsqueda semántica y RAG.

Esta ficha se centra en el checkpoint publicado en HuggingFace bajo el identificador `vllm-project/e5-large`, pensado para servirse mediante vLLM y TEI. Todos los datos de benchmarks proceden del model-index declarado por el autor; no se han verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder bidireccional) |
| Parametros totales | 335.142.400 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precisión completa; admite cuantización posterior vía herramientas externas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch |

## Arquitectura y entrenamiento

El modelo es un encoder BERT de 24 capas con 1024 dimensiones ocultas y 16 cabezas de atención, sumando 335 millones de parámetros. Genera embeddings de 1024 dimensiones y aplica normalización L2 sobre la salida. La metodología E5 emplea un preentrenamiento contrastivo débilmente supervisado sobre pares (consulta, pasaje) extraídos de la web, seguido de un ajuste fino supervisado con datasets etiquetados de recuperación y similitud. Los prefijos `query: ` y `passage: ` son parte del protocolo de entrenamiento y deben aplicarse en inferencia para reproducir el comportamiento esperado.

El checkpoint de `vllm-project` no documenta cambios respecto al modelo original de Microsoft; se trata de una réplica orientada al despliegue con vLLM y Text Embeddings Inference. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de embeddings densos de 1024 dimensiones para frases y pasajes.
- Similitud semántica entre textos (tarea `sentence-similarity`).
- Recuperación de información (retrieval) en corpus documentales.
- Clasificación de texto mediante embeddings y un clasificador posterior.
- Agrupamiento (clustering) de documentos por similitud semántica.
- Reranking de candidatos recuperados previamente.
- Soporte de `text-embeddings-inference` y `endpoints_compatible` para despliegue como servicio.
- No soporta tool calling, agentes, visión, audio ni generación de texto libre: es exclusivamente un modelo de representación.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar pasajes con el prefijo `passage: ` y consultar con `query: ` para recuperar fragmentos relevantes por significado y no por coincidencia léxica.
- RAG sobre bases de conocimiento internas: generar embeddings de chunks de 512 tokens o menos y almacenarlos en una base vectorial (FAISS, Qdrant, pgvector) para alimentar un LLM generador.
- Deduplicación y agrupamiento de tickets de soporte: calcular similitud coseno entre embeddings y agrupar incidencias equivalentes para priorizar colas de atención.
- Clasificación de reseñas y opiniones: usar los embeddings como entrada a un clasificador ligero, aprovechando el rendimiento declarado en AmazonPolarity (90,05 % de accuracy).
- Reranking en pipelines de búsqueda híbrida: recalcular la similitud entre consulta y los candidatos devueltos por BM25 para mejorar la precisión final.
- Detección de similitud entre preguntas frecuentes: mapear consultas entrantes al artículo de FAQ más cercano semánticamente, con umbral de confianza sobre la similitud coseno.
- Moderación y análisis de contenido: comparar textos contra un conjunto de referencia de políticas para señalar posibles infracciones por proximidad semántica.

## Benchmarks y rendimiento

Resultados declarados en el model-index del autor (MTEB, inglés). No verificados de forma independiente.

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Classification | AmazonCounterfactualClassification (en) | accuracy | 77,69 |
| Classification | AmazonCounterfactualClassification (en) | f1 | 71,79 |
| Classification | AmazonPolarityClassification | accuracy | 90,05 |
| Classification | AmazonPolarityClassification | f1 | 90,04 |
| Classification | AmazonReviewsClassification (en) | accuracy | 43,02 |
| Classification | AmazonReviewsClassification (en) | f1 | 42,19 |
| Classification | Banking77Classification | accuracy | 84,14 |
| Classification | Banking77Classification | f1 | 84,12 |
| Retrieval | ArguAna | ndcg_at_10 | 49,35 |
| Retrieval | ArguAna | recall_at_100 | 97,87 |
| Retrieval | ArguAna | map_at_10 | 40,46 |
| Retrieval | CQADupstackAndroidRetrieval | map_at_10 | 41,68 |
| Retrieval | CQADupstackAndroidRetrieval | ndcg_at_10 | no disponible (truncado en la información) |
| Clustering | ArxivClusteringP2P | v_measure | 46,19 |
| Clustering | ArxivClusteringS2S | v_measure | 41,38 |
| Clustering | BiorxivClusteringP2P | v_measure | 37,60 |
| Clustering | BiorxivClusteringS2S | v_measure | 35,09 |
| Reranking | AskUbuntuDupQuestions | map | 60,07 |
| Reranking | AskUbuntuDupQuestions | mrr | 73,44 |
| STS | BIOSSES | cos_sim_spearman | 84,73 |
| STS | BIOSSES | cos_sim_pearson | 86,43 |

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 1,3 GB solo para pesos (335 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, entre 2 y 3 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0,7 GB para pesos; entre 1,5 y 2 GB con overhead.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A10, L4, A100, H100) para despliegues de alto throughput.
- También puede ejecutarse en CPU para cargas de baja concurrencia, dado su tamaño reducido.
- Opciones de despliegue: vLLM (repo de origen), Text Embeddings Inference (TEI), sentence-transformers, HuggingFace Inference Endpoints y ONNX Runtime.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del lote, la longitud de secuencia y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| e5-large (este) | 335 M | 512 | en | MIT | Buen equilibrio tamaño/rendimiento en MTEB |
| e5-base | 110 M | 512 | en | MIT | Menor coste, menor rendimiento esperado |
| e5-small | 33 M | 512 | en | MIT | Para entornos con recursos muy limitados |
| bge-large-en-v1.5 | 335 M | 512 | en | MIT | Alternativa directa de la familia BGE |
| gte-large | 335 M | 512 | en | MIT | Alternativa de Alibaba, orientada a retrieval |

No se dispone de resultados comparativos verificados entre estos modelos en la información proporcionada; los datos de la tabla anterior son estructurales, no de rendimiento.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés: el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Ventana de contexto de 512 tokens: los documentos más largos deben dividirse en fragmentos, lo que puede romper la coherencia semántica en pasajes largos.
- Riesgo de sesgos heredados de los corpus web usados en el preentrenamiento contrastivo (estereotipos de género, raza o ideología en los embeddings).
- No es un modelo generativo: no produce texto, por lo que no puede usarse para respuestas directas ni razonamiento simbólico.
- Los prefijos `query: ` y `passage: ` son obligatorios para reproducir los resultados declarados; omitirlos degrada la calidad de recuperación.
- Los benchmarks del model-index no están verificados (`verified: false`) y proceden del propio autor.
- Licencia MIT: permite uso comercial, modificación y redistribución, con la obligación de incluir el aviso de copyright.
- El checkpoint `vllm-project/e5-large` es una réplica de despliegue; para citas académicas debe referenciarse el modelo original de Microsoft Research.

## Enlaces

- HuggingFace: https://huggingface.co/vllm-project/e5-large
- Paper E5 (Text Embeddings by Weakly-Supervised Contrastive Pre-training): https://arxiv.org/abs/2212.03533
- Paper BEIR (benchmark de recuperación): https://arxiv.org/abs/2104.08663
- Paper GTR / embeddings a escala: https://arxiv.org/abs/2210.07316
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- MTEB leaderboard: https://huggingface.co/spaces/mteb/leaderboard
