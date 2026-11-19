# tomaarsen/splade-distilbert-base-uncased-gooaq-matryoshka

## Resumen

`splade-distilbert-base-uncased-gooaq-matryoshka` es un codificador disperso (sparse encoder) de recuperación de información desarrollado por Tom Aarsen y publicado en Hugging Face. Se construye sobre `distilbert-base-uncased` y aplica la técnica SPLADE (Sparse Lexical and Expansion), que proyecta cada documento y consulta a un vector de dimensión igual al vocabulario del tokenizador, con la mayoría de pesos a cero. El resultado es un modelo que combina la eficiencia de la recuperación léxica clásica (tipo BM25, indexable con motores de búsqueda invertidos) con la capacidad semántica de un transformer.

El modelo se ha afinado sobre el corpus `sentence-transformers/gooaq` (99 000 pares consulta-documento) y emplea tres innovaciones conjuntas: pérdida SPLADE estándar, pérdida Matryoshka dispersa (que permite truncar el vector a diferentes dimensiones conservando calidad) y pérdida FLOPs (que penaliza el número de dimensiones activas para controlar el coste computacional en la búsqueda). Con 66 985 530 parámetros y un repo de 0,3 GB, es un modelo ligero que cabe holgadamente en cualquier GPU consumer y en CPU.

Su relevancia actual reside en que ofrece recuperación semántica de primera etapa con latencia y huella de memoria propias de un motor léxico, lo que lo convierte en candidato para pipelines RAG, motores de búsqueda internos y sistemas de recomendación donde el coste por consulta es crítico. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas) con cabeza de proyección SPLADE a dimensión de vocabulario |
| Parametros totales | 66 985 530 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de DistilBERT; no confirmado explícitamente en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | sentence-transformers |
| Pipeline | feature-extraction |
| Modelo base | distilbert/distilbert-base-uncased |
| Dataset de entrenamiento | sentence-transformers/gooaq (99 000 pares) |
| Pérdidas usadas | SpladeLoss, SparseMatryoshkaLoss, FlopsLoss, SparseMultipleNegativesRankingLoss |
| Tipo de embedding | disperso (sparse), dimensión de vocabulario con alta esparsidad |

## Arquitectura y entrenamiento

El modelo parte de DistilBERT base uncased (6 capas, 768 dimensiones ocultas, ~66 M parámetros) y añade una cabeza de proyección que mapea la representación del token `[CLS]` al espacio del vocabulario (≈30 522 dimensiones para el tokenizador de BERT uncased). Tras aplicar una activación tipo ReLU y una transformación logarítmica (log-saturation), se obtiene un vector disperso donde cada dimensión corresponde a un término del vocabulario y su valor actúa como peso de expansión léxica. Esto permite indexar los documentos en un motor invertido tradicional y puntuar con producto escalar disperso.

El entrenamiento combina cuatro pérdidas: `SpladeLoss` (regularización de esparsidad sobre la representación), `SparseMultipleNegativesRankingLoss` (contrastiva con negativos en batch), `SparseMatryoshkaLoss` (entrena el modelo para que los prefijos truncados del vector sigan siendo útiles, permitiendo elegir el trade-off calidad/coste en inferencia) y `FlopsLoss` (penaliza directamente el número de operaciones activas por consulta). El dataset `gooaq` aporta 99 000 pares pregunta-respuesta de dominio general. Los resultados reportados muestran una esparsidad de consulta del 99,74 % (≈79 dimensiones activas de media) y del corpus del 99,33 % (≈204 dimensiones activas), con un coste medio de 11,58 FLOPs por comparación, lo que confirma que el modelo opera en régimen de recuperación léxica eficiente.

## Capacidades

- Generación de representaciones dispersas para recuperación de información (retrieval) en inglés.
- Búsqueda semántica con expansión léxica: el vector disperso activa términos relacionados no presentes literalmente en el texto.
- Indexación en motores invertidos (Lucene, Elasticsearch, OpenSearch) gracias a la naturaleza dispersa de los embeddings.
- Truncado Matryoshka: el vector puede recortarse a dimensiones menores para reducir latencia con pérdida controlada de calidad.
- Control de coste vía FLOPs: el entrenamiento con `FlopsLoss` permite ajustar la esparsidad efectiva.
- Compatibilidad con `sentence-transformers` y con Text Embeddings Inference (tag `text-embeddings-inference`).
- Endpoints compatibles (tag `endpoints_compatible`).
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un codificador de recuperación.

## Casos de uso

- Recuperación de primera etapa en pipelines RAG: el modelo indexa fragmentos de documentación en un motor invertido y recupera candidatos con alta esparsidad (≈204 dimensiones activas por documento), reduciendo el coste frente a un retriever denso y dejando el re-ranking a un cross-encoder.
- Motor de búsqueda interno en inglés: al ser compatible con índices invertidos, se puede desplegar sobre Elasticsearch/OpenSearch sin infraestructura vectorial dedicada, con licencia Apache 2.0 para uso corporativo.
- Búsqueda en bases de conocimiento técnicas: la expansión léxica de SPLADE permite encontrar documentos aunque la consulta no comparta términos exactos, útil en documentación de APIs o manuales.
- Filtrado de candidatos en sistemas de recomendación de contenido: se generan embeddings dispersos de ítems y consultas de usuario para recuperar ítems relevantes con latencia baja.
- Deduplicación y clustering de consultas: los vectores dispersos permiten medir similitud léxico-semántica entre consultas de un buscador para agrupar intenciones.
- Evaluación y prototipado de investigación en recuperación dispersa: sirve como baseline reproducible sobre `gooaq` para comparar variantes de SPLADE, Matryoshka y control de FLOPs.
- Búsqueda en entornos con CPU o GPU modesta: con 66 M parámetros y 0,3 GB de pesos, se puede servir en CPU con latencia aceptable para volúmenes moderados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`). Métricas de recuperación dispersa con producto escalar.

| Dataset | Métrica | Valor |
|---|---|---|
| NanoMSMARCO | Dot Accuracy@1 | 0,24 |
| NanoMSMARCO | Dot Accuracy@3 | 0,52 |
| NanoMSMARCO | Dot Accuracy@5 | 0,60 |
| NanoMSMARCO | Dot Accuracy@10 | 0,78 |
| NanoMSMARCO | Dot Precision@1 | 0,24 |
| NanoMSMARCO | Dot Precision@3 | 0,1733 |
| NanoMSMARCO | Dot Precision@5 | 0,12 |
| NanoMSMARCO | Dot Precision@10 | 0,0780 |
| NanoMSMARCO | Dot Recall@1 | 0,24 |
| NanoMSMARCO | Dot Recall@3 | 0,52 |
| NanoMSMARCO | Dot Recall@5 | 0,60 |
| NanoMSMARCO | Dot Recall@10 | 0,78 |
| NanoMSMARCO | Dot NDCG@10 | 0,4996 |
| NanoMSMARCO | Dot MRR@10 | 0,4125 |
| NanoMSMARCO | Dot MAP@100 | 0,4231 |
| NanoMSMARCO | Query active dims | 79,26 |
| NanoMSMARCO | Query sparsity ratio | 0,9974 |
| NanoMSMARCO | Corpus active dims | 204,39 |
| NanoMSMARCO | Corpus sparsity ratio | 0,9933 |
| NanoMSMARCO | Avg FLOPs | 11,5756 |
| NanoNFCorpus | Dot Accuracy@1 | 0,38 |
| NanoNFCorpus | Dot Accuracy@3 | 0,48 |
| NanoNFCorpus | Dot Accuracy@5 | 0,54 |
| NanoNFCorpus | Dot Accuracy@10 | 0,60 |
| NanoNFCorpus | Dot Precision@1 | 0,38 |
| NanoNFCorpus | Dot Precision@3 | 0,3267 |
| NanoNFCorpus | Dot Precision@5 | 0,312 |
| NanoNFCorpus | Dot Precision@10 | 0,252 |
| NanoNFCorpus | Dot Recall@1 | 0,0225 |
| NanoNFCorpus | Dot Recall@3 | 0,0580 |
| NanoNFCorpus | Dot Recall@5 | 0,0766 |
| NanoNFCorpus | Dot Recall@10 | 0,0996 |
| NanoNFCorpus | Dot NDCG@10 | 0,2937 |
| NanoNFCorpus | Dot MRR@10 | 0,4498 |

Los datos de `NanoNFCorpus` para MAP@100 y métricas de esparsidad/FLOPs no están completos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en fp32 (66,9 M parámetros ≈ 268 MB de pesos) y en torno a 0,5-1 GB con activaciones y batch pequeño; en fp16 aproximadamente 134 MB de pesos.
- GPU recomendadas: cualquier GPU con ≥2 GB de VRAM es suficiente; RTX 3060/4060, RTX 4090, A10, L4, A100 o H100 funcionan sin problema. El modelo no requiere GPU de gama alta.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Despliegue: `sentence-transformers` (nativo), Text Embeddings Inference (tag `text-embeddings-inference`), y exportación a índices invertidos para motores tipo Elasticsearch/OpenSearch. La compatibilidad con llama.cpp/Ollama no está documentada para este modelo (es un encoder SPLADE, no un LLM).
- Latencia y throughput: no se han publicado cifras oficiales. El coste medio declarado de 11,5756 FLOPs por comparación y la esparsidad del 99,3-99,7 % sugieren una puntuación muy barata por par consulta-documento, pero no se aportan medidas de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| splade-distilbert-base-uncased-gooaq-matryoshka | 66,9 M | 512 (no confirmado) | Sparse (SPLADE) | Apache 2.0 | Hugging Face |
| splade-v3 (naver) | ~110 M (BERT base) | 512 | Sparse (SPLADE) | Apache 2.0 | Hugging Face |
| BGE-M3 (BAAI) | ~568 M | 8192 | Denso + sparse + multi-vector | MIT | Hugging Face |
| BM25 (referencia léxica) | n/a | n/a | Léxico | n/a | Estándar |

No se dispone de resultados de benchmarks de los modelos comparables en la información proporcionada, por lo que no se incluye comparación numérica de rendimiento. La comparativa se limita a parámetros, contexto, tipo y licencia.

## Limitaciones y advertencias

- Solo inglés: el tokenizador y el entrenamiento están en `en`; el rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- Contexto limitado a 512 tokens (límite de DistilBERT); documentos más largos requieren fragmentación.
- Métricas declaradas por el autor con `verified: false`; no han sido replicadas de forma independiente.
- Resultados en `NanoNFCorpus` con recall bajo (0,0996 en Recall@10): el modelo puede tener dificultades en dominios biomédicos o muy especializados.
- Riesgo de sesgos heredados de `gooaq` y de DistilBERT: el corpus de preguntas-respuestas puede sobrerrepresentar ciertos dominios y estilos de consulta.
- No es un modelo generativo: no produce texto, no soporta tool calling ni agentes; usarlo fuera de recuperación no es adecuado.
- La cuantización no está documentada; no se garantiza el comportamiento en int8/int4 sin validación propia.
- El truncado Matryoshka reduce calidad de forma no lineal; conviene validar el punto de truncado en el dominio concreto antes de producción.
- Aunque la licencia es Apache 2.0, el modelo base DistilBERT arrastra sus propias condiciones (también Apache 2.0), sin conflicto conocido.
- Fecha de creación en Hugging Face posterior a la fecha actual del entorno de consulta (2026-11-19), lo que sugiere que los datos de descargas y likes (0) no reflejan adopción real.

## Enlaces

- Hugging Face: https://huggingface.co/tomaarsen/splade-distilbert-base-uncased-gooaq-matryoshka
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset: https://huggingface.co/datasets/sentence-transformers/gooaq
- Paper SPLADE: https://arxiv.org/abs/2205.04733
- Paper SPLADE v2: https://arxiv.org/abs/2205.13147
- Paper Matryoshka Representation Learning: https://arxiv.org/abs/2205.13147 (referencia cruzada en tags)
- Paper Sentence-BERT: https://arxiv.org/abs/1908.10084
- Paper SimCSE (contrastive): https://arxiv.org/abs/2004.05665
- Paper FLOPs loss / Efficient SPLADE: https://arxiv.org/abs/1807.03748 (referencia en tags)
- Librería sentence-transformers: https://www.sbert.net/
