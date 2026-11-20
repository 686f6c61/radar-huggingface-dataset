# tomaarsen/splade-distilbert-base-uncased-gooaq-matryoshka-hard

## Resumen

`splade-distilbert-base-uncased-gooaq-matryoshka-hard` es un modelo de recuperación de información dispersa (sparse retrieval) desarrollado por tomaarsen, construido sobre DistilBERT base uncased y entrenado con la técnica SPLADE. Su función no es generar texto, sino producir representaciones dispersas de consultas y documentos para búsqueda semántica léxica, con un vocabulario efectivo de dimensión 30522 (el del tokenizador de WordPiece) pero con apenas decenas de dimensiones activas por vector.

El modelo combina tres innovaciones: el paradigma SPLADE (expansión de términos aprendida con regularización FLOPS), el entrenamiento con Matryoshka (representaciones truncables a distintas dimensiones sin reentrenar) y el uso de negativos duros del dataset GooAQ. Esto lo hace especialmente útil como recuperador de primera etapa en pipelines RAG, donde se necesita alta eficiencia con precisión razonable.

Con 66,98 millones de parámetros y un tamaño de repositorio de 0,3 GB, es un modelo ligero que se puede ejecutar en CPU. Está publicado bajo licencia Apache 2.0 y solo soporta inglés. Su relevancia actual radica en que ofrece recuperación dispersa de bajo coste computacional (17,29 FLOPS medios por operación de similitud) con la posibilidad de ajustar el equilibrio precisión/eficiencia truncando dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas) con cabeza de proyección SPLADE (MLM sobre vocabulario) |
| Parametros totales | 66.985.530 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de DistilBERT; no especificado en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en FP32/FP16; compatible con cuantización estándar de PyTorch, no documentada) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimensión de salida | 30522 (vocabulario WordPiece), dispersa; Matryoshka permite truncar |
| Dimensiones activas (query) | 50,38 de media |
| Dimensiones activas (corpus) | 335,13 de media |
| Ratio de esparsidad (query) | 0,9983 |
| Ratio de esparsidad (corpus) | 0,9890 |
| FLOPS medios | 17,286 |
| Librería | sentence-transformers |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased` (6 capas, 12 cabezas, 768 dimensiones ocultas) y añade una cabeza de enmascaramiento de lenguaje (MLM) que proyecta las representaciones contextuales al espacio del vocabulario. Aplicando `log(1 + ReLU(x))` y max-pooling sobre la secuencia se obtiene un vector disperso de 30522 dimensiones donde cada dimensión corresponde a un token del vocabulario y su valor indica la importancia aprendida de ese término. Esta es la formulación SPLADE clásica (formalizada en el paper arXiv:2101.06983), que combina recuperación léxica con expansión semántica de términos.

El entrenamiento usa el dataset `tomaarsen/gooaq-hard-negatives` (99.000 ejemplos según la etiqueta `dataset_size:99000`), una variante de GooAQ con negativos duros minados. La función de pérdida es una combinación de cuatro componentes: `CachedSpladeLoss` (regularización FLOPS sobre las activaciones), `SparseMatryoshkaLoss` (entrenamiento con múltiples dimensiones de truncado para que el modelo sea útil a distintos tamaños de representación), `FlopsLoss` (penalización explícita del coste computacional) y `SparseMultipleNegativesRankingLoss` (contrastiva con negativos en batch). El uso de Matryoshka permite truncar el vector disperso a dimensiones menores en tiempo de inferencia sin reentrenar, ajustando el compromiso entre precisión y velocidad.

## Capacidades

- Generación de representaciones dispersas para recuperación de información (sparse retrieval), no generación de texto.
- Expansión de términos aprendida: el modelo puede asignar peso a tokens que no aparecen literalmente en la consulta pero son semánticamente relevantes (propiedad SPLADE).
- Representaciones Matryoshka: truncables a distintas dimensiones efectivas para adaptar precisión y coste.
- Codificación de consultas y documentos en el mismo espacio vectorial, con similitud por producto escalar (dot product).
- Soporte de búsqueda eficiente mediante índices invertidos, ya que los vectores son dispersos (aprox. 50 dims activas por query, 335 por documento).
- Solo inglés: no soporta otros idiomas de forma fiable.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento explícito.
- Integración con `sentence-transformers` y con `text-embeddings-inference` (etiqueta `endpoints_compatible`).

## Casos de uso

- Recuperación de primera etapa en pipelines RAG: el modelo indexa un corpus en un índice invertido disperso y recupera los documentos más relevantes para una consulta con un coste de 17,29 FLOPS por comparación, mucho menor que un recuperador denso de tamaño comparable, lo que permite escalar a millones de documentos en CPU.
- Búsqueda semántica en documentación técnica en inglés: aprovecha la expansión de términos SPLADE para encontrar páginas relevantes aunque la consulta no comparta palabras exactas con el documento, con un recall@10 de 0,84 en NanoMSMARCO.
- Filtrado previo a un re-ranker cross-encoder: al ser un recuperador ligero, se usa para reducir de millones a cientos de candidatos antes de aplicar un modelo más costoso, reduciendo la latencia total del sistema.
- Búsqueda en bases de conocimiento internas con requisitos de latencia estrictos: su tamaño de 0,3 GB y su naturaleza dispersa permiten desplegarlo en CPU con throughput alto, sin GPU dedicada.
- Sistemas de preguntas y respuestas extractivas: combinado con un lector (por ejemplo, un modelo QA sobre los pasajes recuperados), sirve como componente de recuperación en arquitecturas tipo retriever-reader.
- Recuperación con presupuesto de memoria ajustable: gracias a Matryoshka, se puede truncar la representación a menos dimensiones activas para entornos con restricciones de RAM o para acelerar la búsqueda, sacrificando algo de precisión de forma controlada.
- Evaluación comparativa de recuperadores dispersos: sirve como referencia SPLADE destilada para experimentos académicos sobre eficiencia en recuperación de información.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Métrica | NanoMSMARCO | NanoNFCorpus |
|---|---|---|
| Dot Accuracy@1 | 0,40 | 0,42 |
| Dot Accuracy@3 | 0,68 | 0,50 |
| Dot Accuracy@5 | 0,80 | 0,52 |
| Dot Accuracy@10 | 0,84 | 0,60 |
| Dot Precision@1 | 0,40 | 0,42 |
| Dot Precision@3 | 0,2267 | 0,3067 |
| Dot Precision@5 | 0,16 | 0,264 |
| Dot Precision@10 | 0,084 | 0,24 |
| Dot Recall@1 | 0,40 | 0,0137 |
| Dot Recall@3 | 0,68 | 0,0529 |
| Dot Recall@5 | 0,80 | 0,0719 |
| Dot Recall@10 | 0,84 | 0,1001 |
| Dot NDCG@10 | 0,6212 | no disponible |
| Dot MRR@10 | 0,55 | no disponible |
| Dot MAP@100 | 0,5577 | no disponible |
| Query active dims | 50,38 | no disponible |
| Query sparsity ratio | 0,9983 | no disponible |
| Corpus active dims | 335,13 | no disponible |
| Corpus sparsity ratio | 0,9890 | no disponible |
| Avg FLOPS | 17,286 | no disponible |

No se han publicado en la información disponible resultados comparativos con otros modelos SPLADE en los mismos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (66,98 M de parámetros × 4 bytes ≈ 268 MB de pesos, más activaciones y overhead). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU con latencia aceptable. Para alto throughput, una RTX 3090/4090, A10, L4 o T4 son más que suficientes. No se necesita A100/H100.
- Cabe en cualquier GPU consumer (GTX 1060 6 GB en adelante) e incluso en entornos sin GPU.
- Opciones de despliegue: `sentence-transformers` (nativo), `text-embeddings-inference` (etiqueta `endpoints_compatible`), exportación a ONNX, y servido mediante infraestructura de índices invertidos (por ejemplo, PISA o Lucene) para búsqueda dispersa a escala.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El coste de similitud es de 17,29 FLOPS medios, lo que indica que la comparación vectorial es muy barata en comparación con recuperadores densos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| splade-distilbert-base-uncased-gooaq-matryoshka-hard | 66,98 M | 512 | Sparse (SPLADE + Matryoshka) | Apache 2.0 | Hugging Face |
| splade-distilbert-base-uncased (original, Naver) | ~66 M | 512 | Sparse (SPLADE) | Apache 2.0 | Hugging Face |
| BGE-M3 (sparse + dense + multi-vector) | ~568 M | 8192 | Híbrido | MIT | Hugging Face |
| SPLADE-v3 (ensemble distilbert) | ~66 M por componente | 512 | Sparse (SPLADE) | Apache 2.0 | Hugging Face |

No se dispone de resultados de benchmarks comparativos directos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto y licencia. El modelo aquí descrito se distingue por el entrenamiento Matryoshka y el uso de negativos duros de GooAQ, pero no hay datos que permitan afirmar que supere a SPLADE-v3 o BGE-M3 en las mismas métricas.

## Limitaciones y advertencias

- Solo inglés: no se ha entrenado ni evaluado en otros idiomas; su uso en castellano u otras lenguas producirá resultados degradados.
- Riesgo de alucinación no aplica directamente (no genera texto), pero la expansión de términos SPLADE puede introducir tokens espurios que reduzcan la precisión en consultas muy específicas.
- Los resultados de benchmarks están marcados como `verified: false` y provienen de conjuntos "Nano" (subconjuntos reducidos de MSMARCO y NFCorpus), por lo que no son directamente comparables con evaluaciones a escala completa.
- En NanoNFCorpus el recall es muy bajo (0,0137 en Recall@1, 0,1001 en Recall@10), lo que sugiere un rendimiento pobre en dominios biomédicos o de preguntas factuales cortas; conviene validar el modelo en el dominio objetivo antes de producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base DistilBERT también es Apache 2.0, sin restricciones adicionales conocidas.
- El contexto máximo de 512 tokens limita la longitud de los documentos indexables; para pasajes más largos hay que fragmentar.
- No es un modelo generativo: no debe usarse para responder preguntas directamente, solo para recuperar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/tomaarsen/splade-distilbert-base-uncased-gooaq-matryoshka-hard
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/tomaarsen/gooaq-hard-negatives
- Paper SPLADE (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- Paper SPLADE v2 (arXiv:2205.04733): https://arxiv.org/abs/2205.04733
- Paper Matryoshka Representation Learning (arXiv:2205.13147): https://arxiv.org/abs/2205.13147
- Paper FLOPS regularization (arXiv:2004.05665): https://arxiv.org/abs/2004.05665
- Paper Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper SimCSE / contrastive (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
- Librería sentence-transformers: https://www.sbert.net/
- Repositorio de tomaarsen: https://huggingface.co/tomaarsen
