# tomaarsen/splade-distilbert-base-uncased-gooaq-matryoshka-pairs

## Resumen

`tomaarsen/splade-distilbert-base-uncased-gooaq-matryoshka-pairs` es un codificador disperso (sparse encoder) de tipo SPLADE construido sobre DistilBERT base uncased y entrenado para recuperación de información. Lo publica Tom Aarsen, mantenedor del ecosistema Sentence Transformers, y su función no es generar texto sino producir representaciones dispersas de documentos y consultas que permiten búsqueda léxica-semántica con un índice invertido, combinando la interpretabilidad de BM25 con la semántica de un transformer.

El modelo incorpora dos innovaciones destacadas: el objetivo SparseMatryoshkaLoss, que permite truncar las dimensiones activas del vector disperso a distintos tamaños (facilitando trade-offs entre coste y calidad), y FlopsLoss, que penaliza el número de dimensiones activas para controlar el coste computacional del scoring. El entrenamiento se realiza sobre el corpus gooaq (999.000 pares pregunta-respuesta), lo que lo orienta a dominios de preguntas y respuestas y búsqueda general en inglés.

Con 66.985.530 parámetros (DistilBERT, 6 capas) y un repositorio de tan solo 0,3 GB, es un modelo muy ligero para despliegue en producción de motores de búsqueda, con licencia Apache 2.0 que permite uso comercial sin restricciones. La información de benchmarks corresponde a la variante sin sufijo `-pairs` (mismo model-index), y se reporta sobre los conjuntos NanoMSMARCO y NanoNFCorpus.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT) con cabeza de proyección dispersa SPLADE |
| Parámetros totales | 66.985.530 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base soporta hasta 512 tokens de entrada) |
| Tipos de cuantización | no disponible (pesos safetensors en fp32; compatible con cuantización estándar vía librerías externas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert/distilbert-base-uncased`, un transformer encoder de 6 capas y 66 millones de parámetros, y añade una cabeza de proyección que mapea la representación del token `[CLS]` al vocabulario del tokenizador (aproximadamente 30.522 dimensiones para el vocabulario de DistilBERT). Tras aplicar ReLU y una transformación logarítmica (log1p), se obtiene un vector disperso donde cada dimensión activa corresponde a un token del vocabulario con un peso de importancia. La similitud entre consulta y documento se calcula como producto escalar de estos vectores, lo que permite indexación con estructuras invertidas tipo Lucene/Elasticsearch.

El entrenamiento combina cuatro funciones de pérdida declaradas en las etiquetas del repositorio: `SpladeLoss` (pérdida base de SPLADE con regularización de sparsity), `SparseMatryoshkaLoss` (entrena el modelo para que funcione bien con truncamientos progresivos de dimensiones activas), `FlopsLoss` (penaliza el coste de scoring medido en FLOPs) y `SparseMultipleNegativesRankingLoss` (objetivo contrastivo con negativos en el batch). El dataset es `sentence-transformers/gooaq` con 999.000 pares. No se especifica en la información disponible el número de épocas, el hardware de entrenamiento ni si hubo etapas adicionales de destilación o ajuste fino.

## Capacidades

- Generación de representaciones dispersas para documentos y consultas, aptas para recuperación de información con índice invertido.
- Búsqueda léxico-semántica: cada dimensión activa es interpretable como un token del vocabulario, lo que permite inspeccionar qué términos contribuyen a la relevancia.
- Soporte de truncamiento Matryoshka: el vector puede recortarse a distintos tamaños de dimensiones activas, permitiendo ajustar el equilibrio entre latencia y calidad de recuperación.
- Control de coste computacional mediante FlopsLoss durante el entrenamiento, orientado a despliegues con presupuesto de scoring limitado.
- Capacidad monolingüe en inglés (entrenado sobre gooaq y DistilBERT uncased).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder de recuperación, no un modelo generativo.
- No dispone de modo de pensamiento (thinking), visión ni audio.

## Casos de uso

- Motor de búsqueda documental en inglés: indexar un corpus con representaciones dispersas y consultar mediante producto escalar con índice invertido; el modelo es adecuado por su bajo coste de almacenamiento (vectores dispersos con ~152 dimensiones activas de media en el corpus) y su compatibilidad con Elasticsearch/Lucene.
- Búsqueda de preguntas frecuentes (FAQ) y atención al cliente: el entrenamiento sobre gooaq (pares pregunta-respuesta) lo hace idóneo para emparejar consultas de usuarios con respuestas canónicas en inglés, con recuperación de top-k y posterior reranking.
- Recuperación aumentada (RAG) ligera: usar el modelo como primer recuperador en pipelines de RAG en inglés, aprovechando su reducido tamaño (0,3 GB) para desplegar en CPU o GPUs de gama baja.
- Filtrado y deduplicación de datasets: calcular similitud dispersa entre pares de textos para detectar duplicados o near-duplicates en corpus de gran volumen, con coste de scoring bajo gracias a la sparsity controlada.
- Búsqueda en catálogos y bases de conocimiento técnico: indexar descripciones de productos, artículos o entradas de documentación y recuperar por consulta en lenguaje natural, con la ventaja de que las dimensiones activas son inspeccionables para depuración.
- Sistemas de recomendación basados en contenido: representar ítems y consultas de usuario en el mismo espacio disperso para recuperar candidatos por similitud semántica-léxica.
- Evaluación y prototipado de arquitecturas de recuperación: al ser un modelo pequeño y con licencia permisiva, sirve como baseline reproducible para comparar estrategias de indexación o truncamiento Matryoshka.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index sobre la variante `splade-distilbert-base-uncased-gooaq-matryoshka` (misma configuración de entrenamiento). Los valores no están verificados (`verified: false`).

| Métrica | NanoMSMARCO | NanoNFCorpus |
|---|---|---|
| Dot Accuracy@1 | 0,24 | 0,44 |
| Dot Accuracy@3 | 0,46 | 0,62 |
| Dot Accuracy@5 | 0,60 | 0,64 |
| Dot Accuracy@10 | 0,76 | 0,66 |
| Dot Precision@1 | 0,24 | 0,44 |
| Dot Precision@3 | 0,1533 | 0,3867 |
| Dot Precision@5 | 0,12 | 0,32 |
| Dot Precision@10 | 0,0760 | 0,25 |
| Dot Recall@1 | 0,24 | 0,0247 |
| Dot Recall@3 | 0,46 | 0,0794 |
| Dot Recall@5 | 0,60 | 0,0964 |
| Dot Recall@10 | 0,76 | 0,1174 |
| Dot NDCG@10 | 0,4850 | 0,3146 |
| Dot MRR@10 | 0,3988 | no disponible |
| Dot MAP@100 | 0,4095 | no disponible |
| Query active dims | 74,0 | no disponible |
| Query sparsity ratio | 0,99758 | no disponible |
| Corpus active dims | 152,32 | no disponible |
| Corpus sparsity ratio | 0,99501 | no disponible |
| Avg FLOPs | 6,965 | no disponible |

No se han publicado en la información disponible resultados comparativos con otros modelos SPLADE en estos mismos conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (66,9 M de parámetros, ~268 MB de pesos); en fp16 o int8, por debajo de 150 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no requiere A100, H100 ni RTX 4090. Una RTX 3060 o incluso una T4 sobran para el modelo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU o CPU.
- Opciones de despliegue: `sentence-transformers` (librería nativa), Text Embeddings Inference (TEI) —el repositorio tiene el tag `text-embeddings-inference`—, y exportación a ONNX/OpenVINO para CPU. Para el índice invertido, Elasticsearch, OpenSearch o Lucene son los motores naturales.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El reducido número de dimensiones activas (74 de media en consultas, 152 en corpus) sugiere un scoring muy barato, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `tomaarsen/splade-distilbert-base-uncased-gooaq-matryoshka-pairs` | 66,9 M | no disponible (512 tokens típico de DistilBERT) | en | apache-2.0 | safetensors | Matryoshka + FlopsLoss, entrenado en gooaq |
| `naver/splade-cocondenser-ensembledistil` | ~66 M (DistilBERT) | 512 tokens | en | no disponible en esta ficha | safetensors | SPLADE clásico, referencia en MS MARCO; sin Matryoshka |
| `naver/splade-v3` | ~110 M (BERT base) | 512 tokens | en | no disponible en esta ficha | safetensors | SPLADE de referencia en eficiencia/calidad; mayor tamaño |
| `prithivida/Splade_PP_en_v1` | ~110 M | 512 tokens | en | no disponible en esta ficha | safetensors | Variante SPLADE en inglés para búsqueda general |

No se dispone de resultados de benchmarks de estos modelos comparables en la información proporcionada para establecer una comparación numérica directa.

## Limitaciones y advertencias

- Modelo monolingüe en inglés: no soporta consultas ni documentos en castellano ni en otros idiomas.
- Es un encoder de recuperación, no un modelo generativo: no produce texto, no razona, no ejecuta herramientas y no debe usarse para tareas de generación.
- Los benchmarks declarados no están verificados por el hub (`verified: false`) y corresponden a la variante sin sufijo `-pairs`; los resultados de esta variante concreta pueden diferir.
- Riesgo de sesgos heredados de DistilBERT y del corpus gooaq: el modelo puede reproducir sesgos presentes en los datos de entrenamiento en la selección de términos activos.
- La recuperación dispersa puede favorecer coincidencias léxicas superficiales; conviene combinarla con un reranker cross-encoder en producción para calidad competitiva.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos a gooaq.
- El contexto de entrada está limitado por la arquitectura DistilBERT (512 tokens); documentos más largos requieren chunking.
- El número de descargas (23) y likes (0) es muy bajo, lo que sugiere poca validación comunitaria en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/tomaarsen/splade-distilbert-base-uncased-gooaq-matryoshka-pairs
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/gooaq
- Paper SPLADE (arXiv:2205.04733): https://arxiv.org/abs/2205.04733
- Paper SparseMatryoshka (arXiv:2205.13147): https://arxiv.org/abs/2205.13147
- Paper Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper DistilBERT (arXiv:2004.05665): https://arxiv.org/abs/2004.05665
- Paper SimCSE / contrastivo (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
