# tomaarsen/splade-distilbert-base-uncased-gooaq-matryoshka-baseline

## Resumen

`splade-distilbert-base-uncased-gooaq-matryoshka-baseline` es un codificador disperso (sparse encoder) de recuperación de información entrenado por tomaarsen sobre DistilBERT base uncased. Implementa el paradigma SPLADE, que proyecta las representaciones contextuales del transformer sobre el vocabulario del tokenizador para producir vectores dispersos de alta dimensionalidad (30.522 dimensiones, una por token del vocabulario de WordPiece). A diferencia de los embeddings densos, estos vectores son interpretables y permiten indexación invertida eficiente.

El modelo se ha afinado sobre el conjunto de datos `sentence-transformers/gooaq` (99.000 pares pregunta-respuesta en inglés) y lleva el sufijo "matryoshka", lo que indica que sus representaciones pueden truncarse a distintas dimensiones manteniendo calidad de recuperación decreciente. La etiqueta "baseline" sugiere que sirve como referencia comparativa dentro de una familia de variantes del mismo autor.

Es relevante porque combina la eficiencia de un transformer pequeño (66,9 millones de parámetros, 0,3 GB en disco) con la esparsidad extrema de SPLADE: solo ~128 dimensiones activas por consulta y ~258 por documento, con una ratio de esparsidad superior al 99 %. Esto lo hace adecuado para motores de búsqueda léxica-semántica híbrida en entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT) con cabeza SPLADE para proyección al vocabulario |
| Parámetros totales | 66.985.530 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base: 512 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert/distilbert-base-uncased`, un transformer encoder de 6 capas y 66 millones de parámetros, destilado de BERT base. Sobre la salida del encoder se aplica una cabeza SPLADE que proyecta cada token contextualizado al espacio del vocabulario y aplica una activación tipo ReLU seguida de max-pooling, produciendo un vector disperso de dimensión igual al vocabulario (30.522). Las dimensiones activas corresponden a pesos de términos, lo que permite interpretar qué palabras contribuyen a la representación.

El entrenamiento se realizó sobre `sentence-transformers/gooaq` (99.000 pares), combinando tres funciones de pérdida declaradas en las etiquetas: `SpladeLoss`, `SparseMultipleNegativesRankingLoss` y `FlopsLoss`. La inclusión de `FlopsLoss` penaliza el número de dimensiones activas para controlar el coste computacional de la recuperación, y el prefijo "matryoshka" indica entrenamiento con truncamiento anidado de dimensiones. No se especifican en la información disponible el número total de tokens de entrenamiento ni si hubo fases de RLHF o DPO (no aplicables típicamente a encoders de recuperación).

## Capacidades

- Generación de representaciones dispersas para recuperación de información (sparse retrieval) en inglés.
- Codificación de consultas y documentos en vectores dispersos de 30.522 dimensiones con ~128 y ~258 dimensiones activas respectivamente.
- Representaciones matryoshka: truncables a dimensiones menores manteniendo capacidad de recuperación.
- Búsqueda léxico-semántica interpretable mediante pesos de términos del vocabulario.
- Compatible con `sentence-transformers` y con Text Embeddings Inference (TEI) según las etiquetas del repositorio.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un encoder de recuperación.
- Capacidad multilingüe: no disponible (solo inglés).

## Casos de uso

- Motor de búsqueda documental en inglés: indexar un corpus con representaciones dispersas y recuperar mediante índices invertidos, aprovechando la esparsidad >99 % para reducir coste de almacenamiento y latencia frente a embeddings densos.
- Búsqueda híbrida léxico-semántica: combinar los pesos de términos de SPLADE con BM25 en un pipeline de recuperación, ya que las dimensiones activas son interpretables y alineables con términos del vocabulario.
- Recuperación en entornos con recursos limitados: el modelo ocupa 0,3 GB y 66,9 M de parámetros, por lo que puede desplegarse en CPU o GPUs de gama baja para servir consultas con baja latencia.
- Filtrado previo (first-stage retrieval) en sistemas RAG: usar el modelo como recuperador inicial sobre un corpus grande antes de un re-ranker cross-encoder, gracias a su bajo coste por consulta (~26 FLOPs medios declarados).
- Búsqueda en preguntas frecuentes y soporte: indexar pares pregunta-respuesta de un corpus tipo GooAQ y recuperar la respuesta más relevante para consultas de usuarios en inglés.
- Experimentación académica en recuperación dispersa: servir como baseline reproducible (sufijo "baseline") para comparar variantes SPLADE con y sin matryoshka sobre los mismos datos.
- Despliegue en pipelines de Text Embeddings Inference: las etiquetas indican compatibilidad con TEI, lo que permite servir el modelo como endpoint de embeddings en producción.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre los conjuntos NanoMSMARCO y NanoNFCorpus:

| Métrica | NanoMSMARCO | NanoNFCorpus |
|---|---|---|
| Dot Accuracy@1 | 0,26 | 0,32 |
| Dot Accuracy@3 | 0,48 | 0,44 |
| Dot Accuracy@5 | 0,56 | 0,50 |
| Dot Accuracy@10 | 0,72 | 0,62 |
| Dot Precision@1 | 0,26 | 0,32 |
| Dot Precision@10 | 0,072 | 0,212 |
| Dot Recall@10 | 0,72 | 0,0636 |
| Dot NDCG@10 | 0,4746 | 0,2328 |
| Dot MRR@10 | 0,3986 | 0,3970 |
| Dot MAP@100 | 0,4128 | 0,0829 |
| Query active dims | 127,98 | 127,98 |
| Query sparsity ratio | 0,9958 | 0,9958 |
| Corpus active dims | 257,59 | 257,59 |
| Corpus sparsity ratio | 0,9916 | 0,9916 |
| Avg FLOPs | 26,04 | 26,04 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (66,9 M de parámetros, ~268 MB de pesos); en fp16 ~134 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4090, A100, H100 sin problemas de memoria.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para cargas moderadas.
- Opciones de despliegue: `sentence-transformers`, Text Embeddings Inference (TEI) según etiquetas, y exportación a otros runtimes no especificados.
- Latencia y throughput: no disponibles en la información proporcionada; el coste declarado es de ~26 FLOPs medios por operación de similitud, lo que indica recuperación muy económica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| splade-distilbert-base-uncased-gooaq-matryoshka-baseline | 66,9 M | no disponible | Sparse (SPLADE) | Apache 2.0 | Hugging Face |
| Alternativas SPLADE de la misma familia (variantes del autor) | no disponible | no disponible | Sparse (SPLADE) | no disponible | no disponible |
| Encoders densos tipo DistilBERT bi-encoder | ~66 M | 512 tokens | Denso | variable | Hugging Face |

No se dispone en la información proporcionada de resultados de benchmarks de modelos alternativos para establecer una comparación numérica fiable.

## Limitaciones y advertencias

- Solo inglés: el tokenizador y el entrenamiento están limitados a `distilbert-base-uncased`, por lo que el rendimiento en otros idiomas no está garantizado.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false`); deben tomarse con cautela.
- Es un modelo de recuperación, no generativo: no produce texto, no soporta razonamiento multi-paso ni tool calling.
- La esparsidad extrema (>99 %) implica que la representación pierde información semántica fina; puede degradarse en consultas ambiguas o vocabulario fuera del dominio de GooAQ.
- El entrenamiento sobre GooAQ (preguntas y respuestas) puede introducir sesgo hacia ese formato y no generalizar óptimamente a otros dominios (legal, médico, técnico).
- La licencia Apache 2.0 permite uso comercial, pero el modelo base DistilBERT mantiene su propia licencia Apache 2.0, compatible.
- El sufijo "baseline" indica que es una referencia; variantes posteriores del mismo autor pueden superarlo.
- No se especifican límites de longitud de entrada efectivos ni comportamiento con documentos largos más allá del máximo de DistilBERT (512 tokens).

## Enlaces

- Hugging Face: https://huggingface.co/tomaarsen/splade-distilbert-base-uncased-gooaq-matryoshka-baseline
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/gooaq
- Paper SPLADE (arXiv:2205.04733): https://arxiv.org/abs/2205.04733
- Paper Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper SimCSE / contrastive (arXiv:2004.05665): https://arxiv.org/abs/2004.05665
- Paper DistilBERT (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
- Librería sentence-transformers: https://www.sbert.net/
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
