# tomaarsen/splade-distilbert-base-uncased-gooaq-matryoshka-hard-baseline

## Resumen

`tomaarsen/splade-distilbert-base-uncased-gooaq-matryoshka-hard-baseline` es un codificador disperso (sparse encoder) de recuperación de información basado en la arquitectura SPLADE, construido sobre `distilbert-base-uncased` y publicado por Tom Aarsen en Hugging Face. No es un modelo generativo: su función es convertir consultas y documentos en vectores dispersos de alta dimensionalidad (vocabulario de WordPiece) donde cada dimensión activa representa un término con un peso aprendido, lo que permite recuperación léxica-semántica con índices invertidos clásicos.

El modelo se ha afinado sobre el dataset `tomaarsen/gooaq-hard-negatives` (99.000 muestras) combinando tres funciones de pérdida: `CachedSpladeLoss`, `SparseMultipleNegativesRankingLoss` y `FlopsLoss`, esta última para penalizar la densidad de activaciones y controlar el coste computacional. El nombre incluye "matryoshka", lo que indica que el autor entrena con un esquema de representaciones anidadas que permiten truncar la dimensionalidad del embedding a distintos tamaños sin reentrenar.

Con 66.985.530 parámetros y un repositorio de 0,3 GB, es un modelo ligero pensado para despliegues de búsqueda a gran escala donde el coste de almacenamiento del índice y la latencia de recuperación importan más que la calidad absoluta de un cross-encoder. Su licencia Apache 2.0 y su compatibilidad con `text-embeddings-inference` lo hacen directamente desplegable en infraestructura estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas) con cabeza SPLADE para proyección dispersa sobre vocabulario WordPiece |
| Parametros totales | 66.985.530 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitada por DistilBERT, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66M de parámetros, y añade una cabeza de proyección SPLADE que mapea la representación del token `[CLS]` al espacio del vocabulario mediante una transformación con activación ReLU y log-saturación. El resultado es un vector disperso donde cada dimensión corresponde a un token del vocabulario y su valor refleja la importancia aprendida de ese término para la consulta o el documento. Esto permite indexar con estructuras invertidas tipo BM25 y puntuar con producto escalar.

El entrenamiento se realizó sobre `tomaarsen/gooaq-hard-negatives` (99.000 ejemplos) con tres pérdidas combinadas: `CachedSpladeLoss` (variante cacheada de la pérdida SPLADE estándar que acelera el entrenamiento al reutilizar codificaciones), `SparseMultipleNegativesRankingLoss` (contrastiva con negativos en batch adaptada a representaciones dispersas) y `FlopsLoss` (penalización explícita del número de operaciones en punto flotante para forzar esparsidad). El sufijo "matryoshka" indica entrenamiento con representaciones anidadas, de modo que truncar el vector a prefijos menores preserva parcialmente la calidad de recuperación. No se especifica en la información disponible el número total de tokens de entrenamiento ni si hubo etapas de destilación adicionales.

## Capacidades

- Generación de embeddings dispersos para consultas y documentos orientados a recuperación de información (retrieval).
- Recuperación léxico-semántica: cada dimensión activa corresponde a un término del vocabulario, lo que permite inspeccionar qué palabras activa el modelo y combinar con índices invertidos.
- Representaciones matryoshka: permite truncar la dimensionalidad del embedding a distintos tamaños para ajustar el equilibrio entre coste y calidad.
- Esparsidad controlada: el modelo produce de media 145 dimensiones activas por consulta (ratio de esparsidad 0,9952) y 1.050 por documento (ratio 0,9656), lo que reduce el coste de almacenamiento frente a embeddings densos.
- Compatible con `sentence-transformers` y con `text-embeddings-inference` para despliegue en producción.
- Soporte de `feature-extraction` como pipeline estándar.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un codificador de recuperación.
- Capacidad multilingüe limitada al inglés (`en`).

## Casos de uso

- Motor de búsqueda documental a escala: el modelo indexa documentos como vectores dispersos y permite recuperación con índices invertidos, combinando la semántica de un transformer con la eficiencia de BM25. Adecuado para corpus de millones de documentos donde un índice denso resultaría demasiado costoso en memoria.
- Búsqueda híbrida en producción: al producir representaciones dispersas interpretables, se puede combinar la puntuación del modelo con señales léxicas clásicas (BM25, filtros por término) en un mismo pipeline de ranking.
- Recuperación aumentada (RAG) en inglés: actúa como retriever en primera etapa para alimentar un generador, con la ventaja de que el índice disperso cabe en infraestructura modesta y la latencia de recuperación es baja.
- Búsqueda en catálogos y FAQs: para dominios con vocabulario acotado (soporte técnico, documentación de producto), el modelo aprende a activar términos relevantes y permite inspeccionar por qué un documento se recupera.
- Sistemas con restricciones de memoria: gracias a la esparsidad (0,9952 en consultas, 0,9656 en documentos) y al truncamiento matryoshka, se puede desplegar en entornos con RAM limitada sin renunciar a recuperación semántica.
- Filtrado previo en pipelines de ranking multietapa: usar el modelo como primera etapa de recuperación barata y pasar los top-k a un cross-encoder más costoso para el reranking final.
- Evaluación e investigación en recuperación dispersa: al ser un "baseline" con configuración explícita de pérdidas y dataset, sirve como punto de partida reproducible para comparar variantes de SPLADE.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados por un tercero):

| Dataset | Métrica | Valor |
|---|---|---|
| NanoMSMARCO | Dot Accuracy@1 | 0,28 |
| NanoMSMARCO | Dot Accuracy@3 | 0,52 |
| NanoMSMARCO | Dot Accuracy@5 | 0,62 |
| NanoMSMARCO | Dot Accuracy@10 | 0,70 |
| NanoMSMARCO | Dot Precision@1 | 0,28 |
| NanoMSMARCO | Dot Precision@3 | 0,1733 |
| NanoMSMARCO | Dot Precision@5 | 0,124 |
| NanoMSMARCO | Dot Precision@10 | 0,07 |
| NanoMSMARCO | Dot Recall@1 | 0,28 |
| NanoMSMARCO | Dot Recall@3 | 0,52 |
| NanoMSMARCO | Dot Recall@5 | 0,62 |
| NanoMSMARCO | Dot Recall@10 | 0,70 |
| NanoMSMARCO | Dot NDCG@10 | 0,4890 |
| NanoMSMARCO | Dot MRR@10 | 0,4212 |
| NanoMSMARCO | Dot MAP@100 | 0,4355 |
| NanoMSMARCO | Query active dims | 145,0 |
| NanoMSMARCO | Query sparsity ratio | 0,9952 |
| NanoMSMARCO | Corpus active dims | 1.050,07 |
| NanoMSMARCO | Corpus sparsity ratio | 0,9656 |
| NanoMSMARCO | Avg FLOPs | 72,08 |
| NanoNFCorpus | Dot Accuracy@1 | 0,30 |
| NanoNFCorpus | Dot Accuracy@3 | 0,44 |
| NanoNFCorpus | Dot Accuracy@5 | 0,52 |
| NanoNFCorpus | Dot Accuracy@10 | 0,62 |
| NanoNFCorpus | Dot Precision@1 | 0,30 |
| NanoNFCorpus | Dot Precision@3 | 0,2867 |
| NanoNFCorpus | Dot Precision@5 | 0,268 |
| NanoNFCorpus | Dot Precision@10 | 0,208 |
| NanoNFCorpus | Dot Recall@1 | 0,0111 |
| NanoNFCorpus | Dot Recall@3 | 0,0321 |
| NanoNFCorpus | Dot Recall@5 | 0,0491 |
| NanoNFCorpus | Dot Recall@10 | 0,0854 |
| NanoNFCorpus | Dot NDCG@10 | 0,2389 |

No se han publicado en la información disponible resultados comparativos con otros modelos SPLADE o con métricas estándar de MS MARCO (MRR@10 sobre dev), ni datos de MMLU, HumanEval o GSM8K, que no aplican a un modelo de recuperación.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 67M de parámetros; en fp16 aproximadamente 134 MB de pesos. El cuello de botella no es la VRAM sino el almacenamiento del índice invertido.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también funciona en CPU con throughput aceptable para volúmenes moderados. Para indexación masiva, A100 o H100 reducen el tiempo de codificación del corpus.
- Cabe holgadamente en cualquier GPU consumer, incluida una GTX 1650 de 4 GB, y en entornos sin GPU.
- Opciones de despliegue: `sentence-transformers`, `text-embeddings-inference` (etiqueta `endpoints_compatible`), y exportación a ONNX mediante las utilidades de sentence-transformers. No se indica soporte explícito de vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El coste de recuperación está acotado por los 72,08 FLOPs medios declarados y por la esparsidad del índice (1.050 dimensiones activas por documento de media).

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| splade-distilbert-base-uncased-gooaq-matryoshka-hard-baseline | 66,98M | Sparse encoder (SPLADE) | no disponible | Apache 2.0 | Baseline con pérdidas SPLADE + FLOPs y matryoshka |
| SPLADE-v3 (naver) | no disponible en la información | Sparse encoder | no disponible | no disponible | Referencia estándar de SPLADE; no se dispone de datos comparativos en la información |
| BGE-M3 (BAAI) | no disponible en la información | Denso + disperso + multi-vector | no disponible | no disponible | Modelo multilingüe con componente disperso; no se dispone de datos comparativos |
| BM25 | 0 (léxico) | Léxico | no aplica | dominio público | Baseline clásico de recuperación; el modelo busca superarlo combinando semántica y léxico |

No se dispone en la información proporcionada de resultados comparativos directos con estos modelos sobre los mismos datasets, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Solo inglés: el vocabulario y el entrenamiento están en inglés (`en`), por lo que el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Es un modelo de recuperación, no generativo: no puede responder preguntas, resumir ni generar texto. Cualquier caso de uso que requiera generación necesita un modelo adicional.
- Los benchmarks son de "Nano" (NanoMSMARCO, NanoNFCorpus), versiones reducidas de los datasets originales; los resultados no son directamente comparables con cifras publicadas sobre MS MARCO completo.
- Los resultados están marcados como no verificados (`verified: false`) en la model card; proceden del propio autor.
- Riesgo de sesgo heredado de DistilBERT y del corpus GOOAQ, que puede infrarepresentar ciertos dominios y vocabulario técnico.
- La esparsidad elevada (0,9952 en consultas) implica que las consultas activan muy pocos términos; consultas ambiguas o muy cortas pueden producir recuperaciones pobres.
- El truncamiento matryoshka reduce la dimensionalidad pero también la calidad de recuperación; no se documenta en la información disponible la curva de degradación por tamaño.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del dataset base (`gooaq-hard-negatives`) y del modelo `distilbert-base-uncased` para cumplimiento completo.
- No se documenta la longitud máxima de secuencia soportada; en DistilBERT es 512 tokens, por lo que documentos largos requieren chunking.
- Al ser un baseline con 0 descargas y 0 likes en el momento de la ficha, carece de validación comunitaria y de informes independientes de rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tomaarsen/splade-distilbert-base-uncased-gooaq-matryoshka-hard-baseline
- Dataset de entrenamiento: https://huggingface.co/datasets/tomaarsen/gooaq-hard-negatives
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper SPLADE (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- Paper Splade v2 (arXiv:2205.04733): https://arxiv.org/abs/2205.04733
- Paper Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper SimCSE (arXiv:2004.05665): https://arxiv.org/abs/2004.05665
- Paper DistilBERT (arXiv:1910.01108, referencia del modelo base): https://arxiv.org/abs/1910.01108
- Documentación de sentence-transformers: https://www.sbert.net/
- Documentación de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference
