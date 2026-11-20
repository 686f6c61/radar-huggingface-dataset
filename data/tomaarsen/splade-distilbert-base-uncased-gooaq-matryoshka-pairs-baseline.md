# tomaarsen/splade-distilbert-base-uncased-gooaq-matryoshka-pairs-baseline

## Resumen

`splade-distilbert-base-uncased-gooaq-matryoshka-pairs-baseline` es un codificador disperso (sparse encoder) de recuperación de información desarrollado por tomaarsen, investigador conocido en el ecosistema de Sentence Transformers. Se construye sobre DistilBERT base uncased mediante el marco SPLADE, que proyecta las representaciones contextuales del transformer sobre el vocabulario del tokenizador para producir vectores dispersos de alta dimensión con pesos aprendidos por término. El resultado es un modelo que combina la eficiencia del emparejamiento léxico (estilo BM25) con la semántica de un transformer, apto para motores de búsqueda y sistemas de recuperación en producción.

El modelo se ha afinado sobre el conjunto `sentence-transformers/gooaq` (aproximadamente 999.000 pares consulta-respuesta) con una función de pérdida compuesta por `SparseMultipleNegativesRankingLoss` y `FlopsLoss`, esta última para controlar el coste computacional de la representación dispersa. La etiqueta "matryoshka" y "baseline" en el nombre indica que forma parte de una familia de experimentos con embeddings de dimensión anidada, y que esta variante concreta actúa como referencia base de la serie.

Con 66,9 millones de parámetros y un repositorio de 0,3 GB, es un modelo ligero orientado exclusivamente al inglés, con licencia Apache 2.0 y compatible con el pipeline `feature-extraction` de Hugging Face y con Text Embeddings Inference. Su relevancia radica en ofrecer una alternativa dispersa de bajo coste para primera etapa de ranking en sistemas RAG y búsqueda documental, donde la latencia y el uso de memoria son críticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT) con cabeza de proyección SPLADE (sparse) |
| Parámetros totales | 66.985.530 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de DistilBERT base, típicamente 512 tokens) |
| Tipos de cuantización | no disponible (pesos safetensors en fp32/fp16 según repo) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimensión del vocabulario disperso | 30.522 (vocabulario de distilbert-base-uncased) |
| Dimensión activa media (consulta) | 158,42 |
| Dimensión activa media (corpus) | 279,20 |
| Ratio de esparsidad (consulta) | 0,9948 |
| Ratio de esparsidad (corpus) | 0,9909 |
| Coste medio (FLOPs) | 22,26 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SPLADE sobre un backbone DistilBERT base uncased de 6 capas y 66 millones de parámetros. La cabeza SPLADE aplica una transformación lineal del estado oculto `[CLS]` al espacio del vocabulario y una activación `log(1 + ReLU(x))`, produciendo un vector disperso donde cada dimensión corresponde a un token del vocabulario y su valor representa la importancia aprendida de ese término. Esta formulación permite indexar los documentos con estructuras invertidas clásicas (tipo Lucene/Elasticsearch) mientras se captura expansión semántica de términos.

El entrenamiento se realizó sobre `sentence-transformers/gooaq` (999.000 pares consulta-respuesta) con dos componentes de pérdida: `SparseMultipleNegativesRankingLoss`, que optimiza el ranking contrastivo con negativos en el batch, y `FlopsLoss`, que penaliza el número de dimensiones activas para mantener la eficiencia del índice. El sufijo "matryoshka" indica que el modelo se entrena dentro de una familia de variantes con truncamiento anidado de dimensiones, y "baseline" que esta es la referencia sin truncamiento adicional. No se documenta en la información disponible el uso de RLHF, DPO ni detalles sobre la composición exacta del corpus más allá del dataset gooaq.

## Capacidades

- Generación de representaciones dispersas para recuperación de información (sparse retrieval) en inglés.
- Codificación de consultas y documentos en vectores dispersos de 30.522 dimensiones con pesos aprendidos por término.
- Expansión semántica de términos: el modelo puede activar tokens relacionados no presentes literalmente en el texto, superando la limitación de coincidencia exacta de BM25.
- Compatibilidad con índices invertidos estándar, lo que permite integrarlo en Elasticsearch, OpenSearch u otros motores léxicos.
- Soporte de `feature-extraction` en el pipeline de Hugging Face y despliegue mediante Text Embeddings Inference (TEI).
- Integración con la librería `sentence-transformers` para codificación por lotes.
- Capacidad de truncamiento anidado (matryoshka) para ajustar el coste del índice a distintos presupuestos de latencia, según la nomenclatura del modelo.
- No soporta tool calling, agentes, visión, audio ni generación de texto libre: es un codificador puro de recuperación.

## Casos de uso

- **Primera etapa de ranking en sistemas RAG**: el modelo codifica tanto la consulta del usuario como los fragmentos del corpus en vectores dispersos que se indexan en un motor invertido; su bajo coste (22,26 FLOPs medios) permite filtrar miles de documentos antes de aplicar un cross-encoder de reranking, reduciendo la latencia total del pipeline.

- **Búsqueda documental en inglés sobre Elasticsearch**: al producir representaciones compatibles con índices invertidos, se puede sustituir o complementar el scoring BM25 por los pesos SPLADE dentro de un cluster Elasticsearch existente, mejorando el recall semántico sin cambiar la infraestructura de búsqueda.

- **Motores de búsqueda interna para bases de conocimiento**: con 66,9 millones de parámetros y 0,3 GB de pesos, el modelo cabe en una CPU modesta o en una GPU consumer, lo que lo hace adecuado para desplegar búsqueda semántica en entornos con recursos limitados o en el edge.

- **Deduplicación y clustering de documentos**: los vectores dispersos permiten calcular similitud por producto escalar entre documentos de forma eficiente, útil para agrupar artículos, detectar duplicados o construir índices temáticos en pipelines de ingesta de datos.

- **Recuperación en pipelines de CI/CD de documentación técnica**: integrado en un servicio de búsqueda sobre documentación de APIs o repositorios, el modelo responde a consultas en lenguaje natural sobre el corpus técnico, con la ventaja de que el índice disperso se actualiza incrementalmente sin reentrenar.

- **Filtrado previo en sistemas de moderación o clasificación**: la representación dispersa sirve como característica para clasificadores downstream o para recuperar ejemplos similares de una cola de revisión, aprovechando su naturaleza léxica interpretable (cada dimensión activa corresponde a un token).

- **Evaluación y prototipado de recuperación**: al ser una variante "baseline" de la familia matryoshka, sirve como referencia para comparar mejoras de truncamiento o de pérdida en experimentos de investigación sobre recuperación dispersa.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), evaluados sobre los conjuntos NanoMSMARCO y NanoNFCorpus:

| Métrica | NanoMSMARCO | NanoNFCorpus |
|---|---|---|
| Dot Accuracy@1 | 0,22 | 0,34 |
| Dot Accuracy@3 | 0,46 | 0,52 |
| Dot Accuracy@5 | 0,56 | 0,60 |
| Dot Accuracy@10 | 0,68 | 0,66 |
| Dot Precision@1 | 0,22 | 0,34 |
| Dot Precision@3 | 0,1533 | 0,3467 |
| Dot Precision@5 | 0,1120 | 0,3160 |
| Dot Precision@10 | 0,0680 | 0,2540 |
| Dot Recall@1 | 0,22 | 0,0388 |
| Dot Recall@3 | 0,46 | 0,0738 |
| Dot Recall@5 | 0,56 | 0,0926 |
| Dot Recall@10 | 0,68 | 0,1188 |
| Dot NDCG@10 | 0,4401 | 0,3078 |
| Dot MRR@10 | 0,3648 | no disponible |
| Dot MAP@100 | 0,3835 | no disponible |
| Query active dims | 158,42 | no disponible |
| Query sparsity ratio | 0,9948 | no disponible |
| Corpus active dims | 279,20 | no disponible |
| Corpus sparsity ratio | 0,9909 | no disponible |
| Avg FLOPs | 22,26 | no disponible |

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo ocupa aproximadamente 0,27 GB en fp32 (66,9 M parámetros × 4 bytes) y unos 0,13 GB en fp16. En la práctica, el consumo total con overhead de framework se sitúa por debajo de 1 GB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 y H100 funcionan sin problema. El modelo no requiere GPU dedicada para lotes pequeños.
- **CPU**: es viable en CPU para cargas moderadas; la naturaleza dispersa del output reduce el coste de indexación frente a un encoder denso de tamaño similar.
- **Opciones de despliegue**: `sentence-transformers` (Python), Text Embeddings Inference (TEI), Hugging Face Inference Endpoints (el tag `endpoints_compatible` está presente), y exportación a ONNX para servir con motores de inferencia genéricos. No se documenta soporte GGUF ni Ollama en la información disponible.
- **Latencia y throughput**: no se publican mediciones concretas de latencia o throughput en la información disponible. El coste medio de 22,26 FLOPs por par sugiere una carga computacional muy baja en comparación con encoders densos de tamaño equivalente.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|---|
| splade-distilbert-base-uncased-gooaq-matryoshka-pairs-baseline | 66,9 M | Sparse (SPLADE) | no disponible | Apache 2.0 | en | Baseline de la familia matryoshka; NDCG@10 0,4401 en NanoMSMARCO |
| SPLADE-v2-distil (Naver) | ~66 M | Sparse (SPLADE) | 512 | Apache 2.0 | en | Referencia clásica de SPLADE sobre DistilBERT; sin datos comparables en esta ficha |
| BM25 (Elasticsearch/Lucene) | n/a | Léxico | ilimitado | Apache 2.0 | multilingüe | Baseline léxico sin semántica; el modelo lo supera en expansión de términos |
| Encoders densos tipo all-MiniLM-L6-v2 | ~22 M | Denso | 256 | Apache 2.0 | en | Requiere índice vectorial (FAISS, HNSW); no compatible con índices invertidos |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa se limita al modelo descrito.

## Limitaciones y advertencias

- **Solo inglés**: el modelo se ha entrenado y evaluado exclusivamente en inglés; su rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- **Sesgos del corpus**: el dataset gooaq proviene de pares pregunta-respuesta web, por lo que puede heredar sesgos de dominio, estilo y cobertura temática de esa fuente.
- **Riesgo de alucinación léxica**: la expansión de términos de SPLADE puede activar tokens espurios en consultas ambiguas o muy cortas, degradando la precisión; conviene validar con un conjunto de evaluación propio.
- **Resultados no verificados**: los benchmarks de la model card están marcados como `verified: false`; deben tomarse como indicativos y no como garantía de rendimiento en producción.
- **Contexto limitado**: aunque no se especifica en la información disponible, al heredar de DistilBERT la longitud máxima es de 512 tokens, insuficiente para documentos largos sin fragmentación previa.
- **Índice invertido requerido**: a diferencia de los encoders densos, este modelo necesita infraestructura de búsqueda léxica (Elasticsearch, Lucene, PISA) para aprovechar su representación dispersa; no es directamente compatible con FAISS o HNSW.
- **Licencia Apache 2.0**: permite uso comercial sin restricciones adicionales, pero se recomienda revisar las condiciones del dataset gooaq si se redistribuye el modelo derivado.
- **Modelo de recuperación, no generativo**: no debe emplearse para generación de texto, razonamiento o tareas conversacionales; su función es exclusivamente la codificación para búsqueda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tomaarsen/splade-distilbert-base-uncased-gooaq-matryoshka-pairs-baseline
- Modelo base DistilBERT: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset gooaq: https://huggingface.co/datasets/sentence-transformers/gooaq
- Paper SPLADE (Formal et al., 2021): https://arxiv.org/abs/2107.05720
- Paper Splade v2 (Formal et al., 2022): https://arxiv.org/abs/2205.04733
- Paper Sentence-BERT (Reimers y Gurevych, 2019): https://arxiv.org/abs/1908.10084
- Paper SimCSE (Gao et al., 2021): https://arxiv.org/abs/2104.08821
- Paper DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper Matryoshka Representation Learning (Kusupati et al., 2022): https://arxiv.org/abs/2205.13147
- Documentación de Sentence Transformers: https://www.sbert.net/
- Repositorio de Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
