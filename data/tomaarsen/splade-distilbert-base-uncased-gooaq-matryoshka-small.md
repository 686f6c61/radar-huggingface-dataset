# tomaarsen/splade-distilbert-base-uncased-gooaq-matryoshka-small

## Resumen

`tomaarsen/splade-distilbert-base-uncased-gooaq-matryoshka-small` es un codificador disperso (sparse encoder) de tipo SPLADE construido sobre DistilBERT base uncased y entrenado por Tom Aarsen, mantenedor de Sentence Transformers. No es un modelo generativo: su funcion es producir representaciones vectoriales dispersas de alta dimensionalidad para busqueda y recuperacion de informacion (retrieval), donde cada documento o consulta se representa como un vector con la mayoria de dimensiones a cero y solo unas decenas o centenas de pesos activos.

El modelo se entrena sobre el dataset GooAQ (aproximadamente 99.000 pares pregunta-respuesta) y aplica una combinacion poco habitual de funciones de perdida: `SparseMatryoshkaLoss` para permitir truncar la dimensionalidad del vector en inferencia, `FlopsLoss` para penalizar el coste computacional de la representacion y `SparseMultipleNegativesRankingLoss` para el aprendizaje contrastivo. El resultado es un encoder con 66.985.530 parametros que, segun los datos declarados por el autor, mantiene solo 79,26 dimensiones activas de media en consultas y 204,39 en documentos, con una tasa de esparsidad superior al 99,3 por ciento.

Su relevancia practica esta en que combina la eficiencia de un modelo pequeno (DistilBERT, 66M de parametros, repo de 0,3 GB) con la interpretabilidad y el ahorro de almacenamiento de los indices invertidos propios de los sparse encoders, y ademas permite truncar la dimensionalidad del embedding (Matryoshka) sin reentrenar. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT base uncased) con cabeza MLM para proyeccion dispersa SPLADE |
| Parametros totales | 66.985.530 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base: limite posicional de 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; al ser un encoder pequeno, cuantizacion a int8/fp16 es viable pero no se documenta) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es DistilBERT base uncased, un transformer encoder de 6 capas y 66M de parametros destilado de BERT base. Sobre la salida del encoder se aplica una cabeza de enmascaramiento de lenguaje (MLM) que proyecta las representaciones a un espacio de vocabulario de alta dimensionalidad y aplica una activacion tipo ReLU con max-pooling, el esquema clasico de SPLADE. Esto produce vectores dispersos donde cada dimension activa corresponde aproximadamente a un termino del vocabulario, lo que permite indexarlos con estructuras invertidas y calcular similitudes mediante producto escalar disperso.

El entrenamiento usa el dataset `sentence-transformers/gooaq` (99.000 pares) y combina tres perdidas: `SparseMultipleNegativesRankingLoss` para el aprendizaje contrastivo con negativos en el lote, `SparseMatryoshkaLoss` para que el modelo sea util con dimensionalidades truncadas (propiedad Matryoshka aplicada a sparse embeddings) y `FlopsLoss` para penalizar el numero de dimensiones activas y controlar el coste de inferencia. No se documenta en la informacion disponible el uso de RLHF o DPO, algo poco habitual en encoders de retrieval. La innovacion principal es la combinacion de Matryoshka con esparsidad y regularizacion por FLOPs, que permite ajustar el compromiso entre calidad y coste en tiempo de inferencia.

## Capacidades

- Generacion de embeddings dispersos para retrieval de documentos y pasajes (feature-extraction, no generacion de texto).
- Representacion de consultas y corpus en el mismo espacio disperso, con similitud por producto escalar.
- Truncado Matryoshka: permite reducir la dimensionalidad del embedding en inferencia a costa de cierta perdida de calidad.
- Control de esparsidad mediante la perdida de FLOPs, con representaciones de ~79 dims activas en consultas y ~204 en corpus.
- Busqueda semantica y lexica hibrida, ya que las dimensiones activas se aproximan a terminos del vocabulario.
- No soporta tool calling, function calling, agentes, vision, audio ni modos de razonamiento: es exclusivamente un encoder de retrieval.
- Capacidad multilingue limitada: solo ingles.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar los pasajes con el encoder y consultar en lenguaje natural; el indice invertido disperso ocupa mucho menos que un indice denso equivalente, lo que abarata el despliegue en infraestructura modesta.
- Motor de busqueda interno sobre bases de conocimiento de empresa: al ser un modelo de 66M de parametros y 0,3 GB, puede servirse en CPU y escalar horizontalmente sin GPU dedicada.
- Recuperacion aumentada (RAG) en pipelines de LLM: usar el modelo como retriever de primera etapa, aprovechando la esparsidad para filtrar candidatos rapidamente antes de un reranker denso.
- Busqueda en foros y preguntas-respuestas: el entrenamiento sobre GooAQ (preguntas reales de usuarios) lo hace adecuado para dominios de QA conversacional en ingles.
- Filtrado y deduplicacion de corpus: representar documentos y detectar duplicados o near-duplicates mediante similitud dispersa, con coste de almacenamiento reducido.
- Sistemas de recomendacion basados en contenido textual: representar items y perfiles de usuario como vectores dispersos y calcular afinidad por producto escalar.
- Despliegue en entornos con restricciones de memoria: la combinacion de modelo pequeno y embeddings dispersos permite servir el indice en dispositivos edge o contenedores de baja RAM.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | NanoMSMARCO | NanoNFCorpus |
|---|---|---|
| Dot Accuracy@1 | 0,24 | 0,38 |
| Dot Accuracy@3 | 0,52 | 0,48 |
| Dot Accuracy@5 | 0,60 | 0,54 |
| Dot Accuracy@10 | 0,78 | 0,60 |
| Dot Precision@1 | 0,24 | 0,38 |
| Dot Precision@3 | 0,1733 | 0,3267 |
| Dot Precision@5 | 0,12 | 0,312 |
| Dot Precision@10 | 0,078 | 0,252 |
| Dot Recall@1 | 0,24 | 0,0225 |
| Dot Recall@3 | 0,52 | 0,0580 |
| Dot Recall@5 | 0,60 | 0,0766 |
| Dot Recall@10 | 0,78 | 0,0996 |
| Dot NDCG@10 | 0,4996 | 0,2937 |
| Dot MRR@10 | 0,4125 | 0,4498 |
| Dot MAP@100 | 0,4231 | no disponible en el extracto |
| Query active dims | 79,26 | 79,26 |
| Query sparsity ratio | 0,9974 | 0,9974 |
| Corpus active dims | 204,39 | 204,39 |
| Corpus sparsity ratio | 0,9933 | 0,9933 |
| Avg FLOPs | 11,58 | 11,58 |

Las metricas de esparsidad y FLOPs son identicas en ambos conjuntos porque se calculan sobre las representaciones del modelo, no sobre el dataset de evaluacion.

## Requisitos de hardware

- VRAM para inferencia: el modelo pesa 0,3 GB en safetensors; en fp32 requiere aproximadamente 0,27 GB de pesos mas activaciones, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o mas, y funciona en CPU.
- GPU recomendadas: no requiere GPU dedicada; para lotes grandes se recomienda cualquier GPU con 8 GB o mas (RTX 3060, RTX 4090, A10, L4). Para indexacion masiva a gran escala, A100 o H100 solo aportan ventaja por paralelismo de lotes, no por memoria.
- Cabe en GPU consumer: si, en practicamente cualquier modelo con 4 GB de VRAM o mas, y en CPU sin problemas.
- Opciones de despliegue: `sentence-transformers` (libreria nativa), `text-embeddings-inference` (el modelo incluye el tag `text-embeddings-inference` y `endpoints_compatible`), y exportacion a ONNX. No se documenta soporte nativo en llama.cpp ni Ollama, ya que no es un modelo generativo.
- Latencia y throughput: no disponible en la informacion proporcionada. El coste medio declarado es de 11,58 FLOPs por operacion de similitud, lo que indica un producto escalar muy disperso y barato.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (SPLADE DistilBERT Matryoshka small) | 66,9M | Sparse encoder | no disponible | Apache 2.0 | Matryoshka + FlopsLoss, entrenado en GooAQ |
| SPLADE clasico (naver/splade-cocondenser-ensembledistil) | ~66M-110M segun variante | Sparse encoder | 512 tokens (BERT) | Apache 2.0 (variante distil) | Entrenado en MS MARCO; sin truncado Matryoshka |
| BM25 | sin parametros neuronales | Lexico estadistico | sin limite practico | dominio publico | Baseline sin entrenamiento; sin semantica |
| Encoders densos tipo all-MiniLM-L6-v2 | ~22M | Dense bi-encoder | 256 tokens | Apache 2.0 | Indice denso, mayor coste de almacenamiento que un sparse |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: no soporta consultas ni documentos en castellano ni en otros idiomas.
- No es un modelo generativo: no puede usarse para chat, resumen, traduccion ni generacion de codigo.
- La model card no documenta sesgos especificos; al entrenarse sobre GooAQ (preguntas de usuarios de Google), puede heredar sesgos de dominio y de formulacion de consultas de ese corpus.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de recuperacion irrelevante: los valores de Recall@10 en NanoNFCorpus son bajos (0,0996), lo que indica que en dominios biomedicos el modelo puede no recuperar los documentos relevantes.
- El truncado Matryoshka reduce dimensionalidad y por tanto calidad; no se documenta en la informacion disponible la curva exacta de degradacion por nivel de truncado.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia y licencia del dataset GooAQ para usos derivados.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que implica ausencia de validacion comunitaria y de casos de produccion documentados.
- No se documenta el limite de longitud de contexto en la model card; asumir el limite de DistilBERT (512 tokens) es una extrapolacion razonable pero no confirmada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tomaarsen/splade-distilbert-base-uncased-gooaq-matryoshka-small
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/gooaq
- Paper de Sentence Transformers (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de SPLADE (arXiv:2205.04733): https://arxiv.org/abs/2205.04733
- Paper de Matryoshka Representation Learning (arXiv:2205.13147): https://arxiv.org/abs/2205.13147
- Paper de DistilBERT (arXiv:2004.05665): https://arxiv.org/abs/2004.05665
- Paper de Sentence-BERT / bi-encoders (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
