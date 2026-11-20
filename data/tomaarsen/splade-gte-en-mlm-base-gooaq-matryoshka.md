# tomaarsen/splade-gte-en-mlm-base-gooaq-matryoshka

## Resumen

splade-gte-en-mlm-base-gooaq-matryoshka es un modelo de recuperación de información dispersa (sparse retrieval) desarrollado por tomaarsen y publicado en Hugging Face. Se trata de un encoder SPLADE construido sobre el modelo base `tomaarsen/gte-en-mlm-base-native`, un transformer de tipo BERT con 137 millones de parámetros y enmascaramiento de lenguaje (MLM). El modelo transforma consultas y documentos en representaciones vectoriales dispersas de alta dimensionalidad, donde cada dimensión corresponde a un token del vocabulario y el peso indica su relevancia, lo que permite combinar la eficiencia del retrieval léxico clásico con la semántica de los modelos neuronales.

El modelo se ha entrenado específicamente para búsqueda en inglés sobre el conjunto de datos GooAQ (Google Answers), con 99.000 ejemplos y minería de negativos duros. Incorpora dos innovaciones técnicas destacables: la técnica Matryoshka, que permite truncar las representaciones dispersas a distintas dimensiones manteniendo el rendimiento, y una función de pérdida que penaliza el coste computacional (FlopsLoss), incentivando representaciones más eficientes. Según las métricas declaradas por el autor, el modelo alcanza un recall@10 de 0,80 en NanoMSMARCO y un nDCG@10 de 0,61, con una media de solo 103,5 dimensiones activas por consulta (99,66 % de dispersión).

Es relevante ahora porque los sistemas de búsqueda híbrida (léxica y semántica) están ganando adopción en producción, y los encoders SPLADE ofrecen una alternativa interpretable y eficiente en almacenamiento frente a los embeddings densos, ya que las representaciones dispersas pueden indexarse con estructuras invertidas tradicionales. La licencia Apache 2.0 y el tamaño compacto del modelo (0,5 GB) lo hacen accesible para despliegues en infraestructura modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (MLM) con cabeza SPLADE para representaciones dispersas |
| Parametros totales | 137.398.848 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension del vocabulario disperso | 30.522 dimensiones (derivado de la sparsity ratio: 103,5 dims activas / 0,003391 de densidad ≈ 30.522) |
| Dimensiones activas por consulta (media) | 103,52 |
| Dimensiones activas por documento (media) | 984,58 |
| Ratio de dispersión en consultas | 0,9966 |
| Ratio de dispersión en documentos | 0,9677 |
| FLOPs medios por consulta | 35,61 |
| Tamaño del repositorio | 0,5 GB |
| Librería | sentence-transformers |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SPLADE (Sparse Lexical and Expansion), que aplica una cabeza de proyección sobre las representaciones contextuales de un transformer tipo BERT para producir pesos dispersos sobre el vocabulario del tokenizador. Cada token del vocabulario recibe un peso no negativo (mediante activación ReLU y log-saturación), de modo que la representación final es un vector disperso interpretable donde cada dimensión activa corresponde a un término léxico expandido. El modelo base es `tomaarsen/gte-en-mlm-base-native`, un transformer de 137 millones de parámetros preentrenado con enmascaramiento de lenguaje (MLM).

El entrenamiento se realizó sobre el dataset `tomaarsen/gooaq-hard-negatives` (99.000 ejemplos), que incluye negativos duros minados para mejorar la discriminación. Se emplearon varias funciones de pérdida combinadas: `CachedSpladeLoss`, `SparseMatryoshkaLoss`, `FlopsLoss` y `SparseMultipleNegativesRankingLoss`. La inclusión de `SparseMatryoshkaLoss` permite que el modelo genere representaciones que pueden truncarse a dimensiones menores sin perder calidad, facilitando el ajuste del equilibrio entre precisión y coste de almacenamiento. `FlopsLoss` penaliza el número de operaciones en función de las dimensiones activas, incentivando representaciones más eficientes. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de representaciones dispersas para recuperación de información (sparse retrieval) en inglés.
- Codificación de consultas y documentos en vectores dispersos interpretables sobre el vocabulario.
- Soporte de truncamiento Matryoshka: las representaciones pueden recortarse a dimensiones menores manteniendo el rendimiento, lo que permite ajustar el coste de almacenamiento.
- Eficiencia computacional: solo ~103 dimensiones activas por consulta (99,66 % de dispersión) y ~985 por documento (96,77 % de dispersión), con 35,6 FLOPs medios por consulta.
- Capacidad de expansión léxica: el modelo puede asignar peso a términos no presentes literalmente en el texto, mejorando el recall semántico.
- Integración con la librería sentence-transformers para codificación por lotes.
- No soporta tool calling, agentes, visión, audio ni generación de texto libre; es exclusivamente un encoder de retrieval.

## Casos de uso

- Motor de búsqueda documental interna: el modelo puede indexar grandes corpus empresariales en representaciones dispersas y recuperar documentos relevantes para consultas en inglés, aprovechando la eficiencia de los índices invertidos tradicionales y la expansión léxica para mejorar el recall en consultas con vocabulario no coincidente.

- Búsqueda en bases de conocimiento y FAQ: con un recall@10 de 0,80 en NanoMSMARCO, es adecuado para sistemas de preguntas frecuentes donde el usuario formula consultas en lenguaje natural y se necesita recuperar la respuesta correcta entre miles de candidatas, con la ventaja de que las representaciones dispersas son interpretables y auditables.

- Recuperación aumentada para pipelines RAG: puede actuar como retriever en la primera fase de un sistema de generación aumentada por recuperación, combinándose con un reranker denso o cross-encoder en una segunda fase, gracias a su bajo coste computacional (35,6 FLOPs por consulta) y su capacidad de filtrar candidatos de forma eficiente.

- Búsqueda híbrida en producción: al producir representaciones dispersas compatibles con índices invertidos (por ejemplo, Lucene, Elasticsearch o PISA), puede integrarse en arquitecturas híbridas que combinen BM25 con expansión semántica, sin necesidad de infraestructura de búsqueda vectorial densa.

- Indexación de bajo coste en dispositivos con recursos limitados: con 0,5 GB de pesos y representaciones de ~985 dimensiones activas por documento, el modelo puede desplegarse en entornos con memoria moderada, incluyendo CPUs, para tareas de búsqueda en corpus de tamaño medio.

- Filtrado y deduplicación de documentos: las representaciones dispersas permiten calcular similitudes entre documentos de forma eficiente mediante producto escalar disperso, útil para agrupar documentos similares o eliminar duplicados en pipelines de ingesta de datos.

- Evaluación de relevancia y anotación asistida: el modelo puede puntuar pares consulta-documento y priorizar candidatos para revisión humana en tareas de anotación o construcción de datasets de entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados):

| Métrica | NanoMSMARCO | NanoNFCorpus |
|---|---|---|
| Dot Accuracy@1 | 0,44 | 0,42 |
| Dot Accuracy@3 | 0,62 | 0,58 |
| Dot Accuracy@5 | 0,70 | 0,62 |
| Dot Accuracy@10 | 0,80 | 0,68 |
| Dot Precision@1 | 0,44 | 0,42 |
| Dot Precision@3 | 0,2067 | 0,3933 |
| Dot Precision@5 | 0,14 | 0,3640 |
| Dot Precision@10 | 0,08 | 0,2840 |
| Dot Recall@1 | 0,44 | 0,0243 |
| Dot Recall@3 | 0,62 | 0,0812 |
| Dot Recall@5 | 0,70 | 0,1225 |
| Dot Recall@10 | 0,80 | 0,1474 |
| Dot NDCG@10 | 0,6106 | 0,3487 |
| Dot MRR@10 | 0,5511 | No disponible |
| Dot MAP@100 | 0,5585 | No disponible |

Métricas de eficiencia (NanoMSMARCO):

| Métrica | Valor |
|---|---|
| Query active dims | 103,52 |
| Query sparsity ratio | 0,9966 |
| Corpus active dims | 984,58 |
| Corpus sparsity ratio | 0,9677 |
| Avg FLOPs | 35,61 |

No se han publicado resultados comparativos con otros modelos SPLADE en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en precisión FP32 (137 millones de parámetros × 4 bytes ≈ 0,55 GB), más el overhead de activaciones y tokenizador. En FP16, aproximadamente 0,28 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia por lotes pequeños. Para alto throughput, se recomiendan GPUs como NVIDIA A100, H100, L4 o RTX 4090, aunque el modelo es lo suficientemente pequeño para ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o incluso GTX 1650.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer con 2 GB o más de VRAM, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers (nativo), Hugging Face Transformers, ONNX Runtime, y potencialmente vLLM o TGI para servir embeddings (aunque no son específicos para SPLADE). Para búsqueda dispersa, se puede integrar con PISA, Lucene o Elasticsearch.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño del modelo (137 M de parámetros) y los 35,6 FLOPs medios por consulta, se espera una latencia de milisegundos en GPU y decenas de milisegundos en CPU para codificación de consultas individuales, pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia arquitectónica, el modelo se basa en SPLADE (formalizado en el paper arXiv:2101.06983) y en el transformer GTE (arXiv:2205.04733), pero no se han incluido resultados de benchmarks de otras variantes SPLADE en la información disponible para establecer una comparación cuantitativa.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| splade-gte-en-mlm-base-gooaq-matryoshka | 137 M | No disponible | Apache 2.0 | safetensors | Hugging Face |
| Otros modelos SPLADE | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha entrenado ni evaluado en otros idiomas.
- Es un encoder de retrieval, no un modelo generativo: no puede producir texto libre, razonar de forma multi-paso ni ejecutar tool calling.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en la model-index).
- El rendimiento en NanoNFCorpus es notablemente inferior al de NanoMSMARCO (nDCG@10 de 0,35 frente a 0,61), lo que sugiere que el modelo puede tener un rendimiento desigual según el dominio y el tipo de corpus.
- La expansión léxica puede introducir ruido semántico en consultas ambiguas o muy específicas, aumentando los falsos positivos.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo se distribuye sin garantías y el autor no ofrece soporte oficial.
- El entrenamiento se realizó sobre GooAQ, un dataset de preguntas y respuestas de Google; el modelo puede heredar sesgos presentes en esos datos.
- No se dispone de información sobre la longitud máxima de contexto soportada, lo que limita la planificación de despliegues con documentos largos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tomaarsen/splade-gte-en-mlm-base-gooaq-matryoshka
- Modelo base: https://huggingface.co/tomaarsen/gte-en-mlm-base-native
- Dataset de entrenamiento: https://huggingface.co/datasets/tomaarsen/gooaq-hard-negatives
- Paper SPLADE (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- Paper GTE (arXiv:2205.04733): https://arxiv.org/abs/2205.04733
- Paper Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper Matryoshka Representation Learning (arXiv:2205.13147): https://arxiv.org/abs/2205.13147
- Paper ColBERT (arXiv:2004.05665): https://arxiv.org/abs/2004.05665
- Paper SimCLR (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
