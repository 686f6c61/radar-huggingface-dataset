# tomaarsen/splade-distilbert-base-uncased-gooaq-matryoshka-small-baseline

## Resumen

`splade-distilbert-base-uncased-gooaq-matryoshka-small-baseline` es un codificador disperso (sparse encoder) de recuperación de información desarrollado por tomaarsen y publicado en Hugging Face. Se construye sobre DistilBERT base uncased y aplica la técnica SPLADE (Sparse Lexical and Expansion), que proyecta representaciones densas en un vocabulario disperso de términos, combinando las ventajas del matching léxico (BM25) con la semántica de los transformers. El modelo está entrenado sobre el dataset GooAQ (99.000 pares pregunta-respuesta), con las pérdidas `SpladeLoss`, `SparseMultipleNegativesRankingLoss` y `FlopsLoss`, esta última para controlar el coste computacional de la representación dispersa.

La variante "matryoshka-small-baseline" sugiere una configuración de embedding disperso truncable (Matryoshka), pensada como línea base de baja dimensión. Con 66.985.530 parámetros y un repositorio de 0,3 GB, es un modelo extremadamente ligero comparado con los LLM generativos, pero relevante para pipelines de búsqueda y retrieval en producción. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

El modelo es monolingüe (inglés) y su función es la extracción de características para búsqueda dispersa: genera vectores con alta dispersión (ratio de ~0,995 en queries y ~0,991 en corpus) que permiten indexación eficiente en motores de búsqueda invertidos. Es una línea base, no un modelo de propósito general, y su valor reside en el equilibrio entre rendimiento de recuperación y coste de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (DistilBERT) con cabeza SPLADE para proyección dispersa |
| Parámetros totales | 66.985.530 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos safetensors en FP32/FP16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer de 6 capas y 66 millones de parámetros destilado de BERT. Sobre él se añade una capa de proyección que mapea la representación del token `[CLS]` (o pooling equivalente) a un vector de dimensión igual al vocabulario (30.522 para DistilBERT uncased), aplicando activación ReLU y regularización de dispersión. El resultado es un vector disperso donde solo unos pocos términos tienen peso distinto de cero, lo que permite indexación en motores como Lucene/Elasticsearch.

El entrenamiento usa el dataset `sentence-transformers/gooaq` (99.000 pares), con una combinación de pérdidas: `SpladeLoss` (regularización de dispersión), `SparseMultipleNegativesRankingLoss` (contrastiva con negativos en batch) y `FlopsLoss` (penalización del coste computacional medio). La variante Matryoshka-small indica embeddings truncables, lo que permite reducir la dimensión efectiva sacrificando algo de rendimiento. No se documentan detalles sobre número total de tokens de entrenamiento ni si hubo RLHF/DPO (no aplicable a retrieval).

## Capacidades

- Recuperación de información dispersa (sparse retrieval): genera representaciones léxicas expandidas para queries y documentos, aptas para búsqueda por coincidencia de términos ponderados.
- Extracción de características (feature-extraction): produce embeddings dispersos de alta dimensión con alta dispersión (ratio ~0,995 en queries, ~0,991 en corpus).
- Embeddings Matryoshka: permite truncar la representación a dimensiones menores manteniendo parte del rendimiento.
- Búsqueda semántico-léxica híbrida: la expansión de términos captura sinónimos y variaciones morfológicas que BM25 no cubre.
- Indexación eficiente: la dispersión permite usar índices invertidos clásicos en lugar de FAISS o HNSW.
- No soporta tool calling, agentes, generación de texto, visión ni audio: es exclusivamente un codificador de retrieval.
- Capacidades multilingües: no, solo inglés.

## Casos de uso

- Búsqueda en motores de documentos empresariales: indexar un corpus interno con representaciones dispersas en Elasticsearch/OpenSearch, aprovechando que la dispersión ~0,99 permite usar índices invertidos sin infraestructura vectorial dedicada.
- Recuperación en pipelines RAG: usar el modelo como retriever de primera etapa para un LLM generativo, con bajo coste de inferencia (66M parámetros) y alta dispersión que reduce el almacenamiento de índices.
- Búsqueda de preguntas frecuentes (FAQ): entrenado sobre GooAQ (pares pregunta-respuesta), es adecuado para emparejar consultas de usuario con respuestas predefinidas en atención al cliente.
- Búsqueda académica y de literatura: la expansión léxica de SPLADE mejora el recall frente a BM25 puro en vocabulario técnico, como demuestran los resultados en NanoNFCorpus (nDCG@10 de 0,233).
- Filtrado de candidatos en sistemas de recomendación: generar representaciones dispersas de ítems y consultas para recuperación rápida en catálogos grandes.
- Evaluación y benchmarking de pipelines de retrieval: al ser una "baseline", sirve como punto de comparación reproducible para experimentos con codificadores dispersos de mayor tamaño.
- Despliegue en entornos con recursos limitados: 0,3 GB de pesos y 66M parámetros permiten ejecución en CPU con latencias aceptables para búsqueda en tiempo real.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Dataset | Métrica | Valor |
|---|---|---|
| NanoMSMARCO | Accuracy@1 | 0,26 |
| NanoMSMARCO | Accuracy@10 | 0,72 |
| NanoMSMARCO | NDCG@10 | 0,4746 |
| NanoMSMARCO | MRR@10 | 0,3986 |
| NanoMSMARCO | MAP@100 | 0,4128 |
| NanoMSMARCO | Query active dims | 127,98 |
| NanoMSMARCO | Query sparsity ratio | 0,9958 |
| NanoMSMARCO | Corpus active dims | 257,59 |
| NanoMSMARCO | Corpus sparsity ratio | 0,9916 |
| NanoMSMARCO | Avg FLOPs | 26,04 |
| NanoNFCorpus | Accuracy@1 | 0,32 |
| NanoNFCorpus | Accuracy@10 | 0,62 |
| NanoNFCorpus | NDCG@10 | 0,2328 |
| NanoNFCorpus | MRR@10 | 0,3970 |
| NanoNFCorpus | MAP@100 | 0,0829 |

## Requisitos de hardware

- VRAM estimada: ~0,3 GB en FP32; ~0,15 GB en FP16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: innecesarias para inferencia; funciona bien en CPU. Cualquier GPU (RTX 3060, RTX 4090, T4) acelera el encoding de corpus grandes.
- Cabe en consumer GPU: sí, en todas (incluso GPUs integradas con suficiente RAM).
- Opciones de despliegue: `sentence-transformers`, `text-embeddings-inference` (compatible según tags), ONNX Runtime, y exportación a motores de búsqueda dispersos (Pinecone sparse, Elasticsearch con rank_features).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (66M parámetros) se espera alta throughput en CPU y GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SPLADE DistilBERT small) | 66,9M | No disponible | Sparse encoder | Apache 2.0 | Hugging Face |
| SPLADE bert-base (naver/splade-cocondenser) | ~110M | 512 | Sparse encoder | No disponible en la información | Hugging Face |
| BM25 (implementación clásica) | 0 | N/A | Léxico | Apache 2.0 (Lucene) | Amplia |
| E5-small-v2 | ~33M | 512 | Dense encoder | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativos directos en la información proporcionada; los benchmarks del modelo solo cubren NanoMSMARCO y NanoNFCorpus.

## Limitaciones y advertencias

- Monolingüe: solo inglés; no apto para retrieval multilingüe sin adaptación.
- Es una "baseline": los resultados (nDCG@10 de 0,475 en NanoMSMARCO) son modestos y probablemente inferiores a codificadores dispersos de mayor tamaño o a modelos densos de retrieval.
- Riesgo de alucinación de términos: la expansión léxica de SPLADE puede introducir términos espurios en la representación, afectando la precisión en dominios especializados.
- Longitud de contexto no documentada: DistilBERT base soporta hasta 512 tokens, pero la model card no lo confirma explícitamente.
- Dataset de entrenamiento GooAQ (preguntas-respuestas de Google), lo que puede introducir sesgos hacia consultas informales y dominios de consumo.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base DistilBERT también es Apache 2.0, sin restricciones adicionales.
- Sin soporte de tool calling, generación ni agentes: no debe usarse como LLM.
- Sparsity ratio muy alta (~0,99): aunque eficiente, puede perder matices semánticos finos frente a embeddings densos.

## Enlaces

- Hugging Face: https://huggingface.co/tomaarsen/splade-distilbert-base-uncased-gooaq-matryoshka-small-baseline
- Dataset GooAQ: https://huggingface.co/datasets/sentence-transformers/gooaq
- Modelo base DistilBERT: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper SPLADE (arXiv:2205.04733): https://arxiv.org/abs/2205.04733
- Paper DistilBERT (arXiv:1910.01108, referenciado en tags como 1908.10084 corresponde a Sentence-BERT): https://arxiv.org/abs/1908.10084
- Paper Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper Matryoshka Representation Learning (arXiv:2205.13147, no referenciado directamente): no disponible en la información
- Librería sentence-transformers: https://www.sbert.net/
