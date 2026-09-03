# tomaarsen/multivector-ModernBERT-base-msmarco-cached-contrastive-matryoshka

## Resumen

El modelo `tomaarsen/multivector-ModernBERT-base-msmarco-cached-contrastive-matryoshka` es un sistema de embeddings multi-vector (estilo ColBERT) desarrollado por Tom Aarsen, basado en el encoder ModernBERT-base de AnswerDotAI. Está diseñado para recuperación de información mediante interacción tardía (late interaction), una técnica que representa cada documento y consulta como un conjunto de vectores por token y calcula la similitud con una operación de máximo sobre los productos escalares. El modelo se entrenó sobre el dataset MS MARCO (triplets) con una combinación de pérdidas: `MultiVectorMatryoshkaLoss` y `CachedMultiVectorMultipleNegativesRankingLoss`, lo que permite obtener representaciones de dimensionalidad reducida sin degradar significativamente la calidad.

La relevancia de este modelo radica en que combina las optimizaciones modernas de ModernBERT (atención con ventana deslizante, codificaciones posicionales rotativas, normalización pre-RMS) con la eficiencia de la interacción tardía, ofreciendo una alternativa ligera y de código abierto (licencia Apache 2.0) para tareas de búsqueda semántica y recuperación de pasajes. Con 149 millones de parámetros, es adecuado para despliegue en GPU de consumo y entornos de producción con requisitos moderados de latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-base (encoder-only transformer) con salida multi-vector (late interaction) |
| Parametros totales | 149.014.272 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (ModernBERT-base soporta 8192 tokens segun su paper, pero no se especifica en la ficha del modelo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder bidireccional que incorpora mejoras respecto a BERT original: atencion con ventana deslizante (sliding window attention) combinada con atencion global en ciertas capas, codificaciones posicionales rotativas (RoPE), normalizacion pre-RMS y una tokenizacion eficiente. Segun el visor de arquitectura, el modelo tiene 22 capas transformer, un tamano oculto de 768 y 12 cabezas de atencion.

La capa de salida se adapta para producir multiples vectores por secuencia (uno por token), siguiendo el paradigma ColBERT. El entrenamiento se realizo sobre el dataset `sentence-transformers/msmarco-bm25` (99.000 muestras) utilizando dos funciones de perdida combinadas: `MultiVectorMatryoshkaLoss`, que regulariza las representaciones para que sean utiles en multiples dimensionalidades (por ejemplo, 768, 512, 256, 128), y `CachedMultiVectorMultipleNegativesRankingLoss`, que optimiza el ranking con ejemplos negativos en lote y cache de representaciones. No se menciona el uso de RLHF ni DPO; el entrenamiento es puramente contrastivo.

## Capacidades

- Generacion de embeddings multi-vector para recuperacion de informacion con interaccion tardia (max-sim sobre productos escalares por token).
- Búsqueda semantica de pasajes y documentos: dado un query, devuelve los pasajes mas relevantes de un corpus.
- Soporte de dimensionalidad reducida gracias a la regularizacion Matryoshka: se pueden extraer subconjuntos de dimensiones (por ejemplo, 128, 256, 512) sin reentrenar, lo que permite ajustar el equilibrio entre calidad y coste computacional.
- Integracion con la libreria `sentence-transformers` para generar embeddings y con `Text Embeddings Inference` (TEI) para despliegue en produccion.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.
- Monolingue: entrenado exclusivamente con datos en ingles.

## Casos de uso

- Búsqueda semantica en corpus de documentos: el modelo puede indexar pasajes de un repositorio (por ejemplo, manuales, articulos, wikis) y responder a consultas en lenguaje natural devolviendo los fragmentos mas relevantes, gracias a la interaccion tardia que captura matices de significado por token.
- Recuperacion aumentada por generacion (RAG): como componente de recuperacion en pipelines de generacion, el modelo puede seleccionar pasajes relevantes de una base de conocimiento para alimentar a un LLM generativo, mejorando la precision de las respuestas.
- Sistemas de preguntas y respuestas sobre dominios especificos: al entrenarse con MS MARCO, el modelo es adecuado para tareas de QA extractivo donde se necesita localizar la respuesta en un conjunto de pasajes.
- Filtrado y deduplicacion de contenido: los embeddings multi-vector permiten detectar similitud semantica entre documentos, util para eliminar duplicados o agrupar contenido relacionado en grandes colecciones.
- Motores de recomendacion basados en similitud: representar items (descripciones, titulos) como vectores y calcular similitud por interaccion tardia para sugerir elementos relacionados.
- Indexacion de codigo fuente: aunque no esta especificamente entrenado para codigo, puede usarse para buscar fragmentos de codigo por descripcion semantica si el corpus esta en ingles, aprovechando la capacidad de representar secuencias largas.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en el model-index se presentan a continuacion. Se incluyen dos series de metricas para cada dataset, que probablemente corresponden a diferentes configuraciones de dimensionalidad (por ejemplo, con y sin reduccion Matryoshka). No se dispone de comparaciones con otros modelos en la informacion proporcionada.

| Dataset | Metrica | Valor (serie 1) | Valor (serie 2) |
|---|---|---|---|
| NanoMSMARCO | Maxsim Accuracy@1 | 0.32 | 0.30 |
| NanoMSMARCO | Maxsim Accuracy@3 | 0.50 | 0.50 |
| NanoMSMARCO | Maxsim Accuracy@5 | 0.58 | 0.60 |
| NanoMSMARCO | Maxsim Accuracy@10 | 0.74 | 0.80 |
| NanoMSMARCO | Maxsim Precision@1 | 0.32 | 0.30 |
| NanoMSMARCO | Maxsim Precision@3 | 0.1667 | 0.1667 |
| NanoMSMARCO | Maxsim Precision@5 | 0.116 | 0.12 |
| NanoMSMARCO | Maxsim Precision@10 | 0.074 | 0.08 |
| NanoMSMARCO | Maxsim Recall@1 | 0.32 | 0.30 |
| NanoMSMARCO | Maxsim Recall@3 | 0.50 | 0.50 |
| NanoMSMARCO | Maxsim Recall@5 | 0.58 | 0.60 |
| NanoMSMARCO | Maxsim Recall@10 | 0.74 | 0.80 |
| NanoMSMARCO | Maxsim NDCG@10 | 0.5056 | 0.5313 |
| NanoMSMARCO | Maxsim MRR@10 | 0.4339 | 0.4488 |
| NanoMSMARCO | Maxsim MAP@100 | 0.4480 | 0.4584 |
| NanoNQ | Maxsim Accuracy@1 | 0.34 | 0.32 |
| NanoNQ | Maxsim Accuracy@3 | 0.60 | 0.62 |
| NanoNQ | Maxsim Accuracy@5 | 0.72 | 0.72 |
| NanoNQ | Maxsim Accuracy@10 | 0.82 | 0.82 |
| NanoNQ | Maxsim Precision@1 | 0.34 | no disponible |
| NanoNQ | Maxsim Precision@3 | 0.20 | no disponible |
| NanoNQ | Maxsim Precision@5 | 0.144 | no disponible |
| NanoNQ | Maxsim Precision@10 | 0.084 | no disponible |
| NanoNQ | Maxsim Recall@1 | 0.32 | no disponible |
| NanoNQ | Maxsim Recall@3 | 0.57 | no disponible |
| NanoNQ | Maxsim Recall@5 | 0.66 | no disponible |
| NanoNQ | Maxsim Recall@10 | 0.76 | no disponible |
| NanoNQ | Maxsim NDCG@10 | 0.5404 | no disponible |
| NanoNQ | Maxsim MRR@10 | 0.4879 | no disponible |
| NanoNQ | Maxsim MAP@100 | 0.4707 | no disponible |

Nota: los valores de la serie 2 para NanoNQ estan incompletos en la informacion disponible; se indica "no disponible" donde faltan.

## Requisitos de hardware

- VRAM estimada para inferencia: con 149 millones de parametros, en precision fp32 el modelo ocupa aproximadamente 596 MB; en fp16, unos 298 MB. Los embeddings multi-vector requieren almacenar la salida de todos los tokens, por lo que el consumo de memoria depende de la longitud de las secuencias. Para secuencias tipicas de 512 tokens, cabe en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como NVIDIA GTX 1660, RTX 2060, RTX 3060, o superiores. Para despliegue en produccion con alta concurrencia, se recomienda una A10, A100 o similar.
- Compatibilidad con GPU de consumo: si, el modelo es suficientemente pequeno para ejecutarse en GPUs de gama media.
- Opciones de despliegue: `sentence-transformers` para prototipado, `Text Embeddings Inference` (TEI) para servidores de embeddings, y `endpoints_compatible` segun los tags del modelo. Tambien puede usarse con `transformers` directamente.
- Latencia y throughput: no se han publicado datos especificos. Como referencia, un modelo de 149M de parametros en una GPU moderna puede procesar cientos de secuencias por segundo, pero la interaccion tardia anade un coste adicional en el calculo de similitudes.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de otros modelos en la informacion proporcionada. Sin embargo, existen variantes del mismo autor que pueden servir de referencia cualitativa:

| Modelo | Diferencias principales |
|---|---|
| `tomaarsen/multivector-ModernBERT-base-msmarco-contrastive` | Misma base y entrenamiento, pero sin regularizacion Matryoshka (no soporta dimensionalidad reducida). |
| `tomaarsen/multivector-ModernBERT-base-msmarco-contrastive-no-query-expansion` | Variante sin expansion de query, lo que puede afectar a la calidad de recuperacion en consultas cortas. |
| ColBERTv2 (referencia clasica) | Modelo multi-vector basado en BERT, con mayor numero de parametros y sin las optimizaciones de ModernBERT. No se dispone de comparativa directa. |

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente con datos en ingles; su rendimiento en otros idiomas no esta garantizado y probablemente sea deficiente.
- Al ser un modelo de embeddings, no genera texto; no es adecuado para tareas de generacion o dialogo.
- Los datos de entrenamiento (MS MARCO) pueden introducir sesgos hacia consultas de tipo web y dominios generales; puede no funcionar bien en dominios muy especializados sin fine-tuning adicional.
- La regularizacion Matryoshka permite reducir la dimensionalidad, pero la calidad de los embeddings en dimensiones muy bajas (por ejemplo, 128) puede degradarse notablemente.
- No se han publicado resultados de benchmarks en conjuntos estandar como BEIR o MTEB; los datos disponibles se limitan a NanoMSMARCO y NanoNQ, que son subconjuntos pequenos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es un experimento reciente sin validacion amplia por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento para cumplir con las politicas de uso de MS MARCO.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tomaarsen/multivector-ModernBERT-base-msmarco-cached-contrastive-matryoshka
- Paper de ModernBERT: https://aclanthology.org/2025.acl-long.127/
- Repositorio GitHub de ModernBERT: https://github.com/AnswerDotAI/ModernBERT
- Variante sin Matryoshka: https://huggingface.co/tomaarsen/multivector-ModernBERT-base-msmarco-contrastive
- Variante sin expansion de query: https://huggingface.co/tomaarsen/multivector-ModernBERT-base-msmarco-contrastive-no-query-expansion
- Visor de arquitectura: https://hfviewer.com/tomaarsen/multivector-ModernBERT-base-msmarco-cached-contrastive
