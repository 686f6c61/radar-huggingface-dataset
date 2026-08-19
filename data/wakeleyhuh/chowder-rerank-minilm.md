# Wakeleyhuh/chowder-rerank-minilm

## Resumen

Chowder-rerank-minilm es un modelo de reranking basado en cross-encoder, desarrollado por Wakeleyhuh, que parte del modelo `cross-encoder/ms-marco-MiniLM-L6-v2` y se ajusta finamente sobre un corpus propio denominado "chowder". Este corpus, con 424.009 muestras, está orientado a la tarea de clasificación de pares de texto para mejorar la relevancia en sistemas de recuperación de información. El modelo resuelve el problema de reordenar documentos candidatos obtenidos mediante búsqueda vectorial, un paso crítico en pipelines de generación aumentada por recuperación (RAG) y búsqueda semántica.

Con 22,7 millones de parámetros y una arquitectura BERT de seis capas, ofrece un equilibrio entre precisión y eficiencia computacional. Su ventana de contexto de 512 tokens y su soporte exclusivo para inglés lo hacen adecuado para aplicaciones de procesamiento de texto en ese idioma. La relevancia actual radica en su tamaño reducido, que permite desplegarlo en entornos con recursos limitados, y en su especialización en dominios científicos, como indican los benchmarks sobre los conjuntos NanoSCIDOCS, NanoSciFact y NanoNFCorpus.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BertForSequenceClassification (cross-encoder) |
| Parametros totales | 22.713.601 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, FP32 por defecto) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en la arquitectura BERT de seis capas (MiniLM-L6-v2). A diferencia de los bi-encoders, que codifican consulta y documento por separado, este modelo procesa el par de textos conjuntamente y produce una puntuación de relevancia mediante una cabeza de clasificación de una sola salida. El entrenamiento se realizó con la función de pérdida BinaryCrossEntropyLoss sobre un conjunto de datos de 424.009 pares, aunque no se especifica la composición exacta del corpus "chowder". El ajuste fino partió de los pesos preentrenados de `ms-marco-MiniLM-L6-v2`, que ya había sido entrenado para tareas de reranking en el dominio de búsqueda de información. No se mencionan técnicas adicionales como RLHF, DPO o decodificación especulativa.

## Capacidades

- Reranking de pares de texto: asigna una puntuación de relevancia a cada par consulta-documento.
- Búsqueda semántica: puede integrarse en pipelines de recuperación para reordenar los resultados iniciales.
- Clasificación de relevancia binaria: salida de una única logit que indica la probabilidad de relevancia.
- Compatible con la librería sentence-transformers y con el pipeline de Hugging Face `text-ranking`.
- Soporte para despliegue mediante Text Embeddings Inference (TEI) y endpoints compatibles.
- Multilingüe: solo inglés; no se han documentado capacidades en otros idiomas.

## Casos de uso

- Reranking en sistemas RAG: tras una recuperación inicial con búsqueda vectorial (por ejemplo, 50-100 candidatos), el modelo reordena los documentos para quedarse con los 3-5 más relevantes, mejorando la calidad de las respuestas generadas.
- Búsqueda semántica en dominios científicos: los benchmarks en NanoSCIDOCS, NanoSciFact y NanoNFCorpus indican su idoneidad para artículos académicos y verificación de hechos científicos.
- Filtrado de resultados en motores de búsqueda internos: puede reordenar resultados de búsqueda en portales corporativos o bibliotecas digitales.
- Asistentes de atención al cliente: para priorizar fragmentos de documentación técnica que respondan a consultas de usuarios, reduciendo el tiempo de respuesta.
- Análisis de contratos o documentos legales: para identificar pasajes relevantes en grandes volúmenes de texto, aunque requiere que los documentos estén en inglés.
- Sistemas de recomendación de artículos: para ordenar recomendaciones basadas en la relevancia textual entre una consulta y un conjunto de candidatos.

## Benchmarks y rendimiento

Los siguientes resultados fueron declarados por el autor del modelo en la model card y no han sido verificados de forma independiente.

| Dataset | Métrica | Valor |
|---|---|---|
| NanoSCIDOCS R100 | Map | 0,3296 |
| NanoSCIDOCS R100 | Mrr@10 | 0,628 |
| NanoSCIDOCS R100 | Ndcg@10 | 0,4096 |
| NanoSciFact R100 | Map | 0,749 |
| NanoSciFact R100 | Mrr@10 | 0,7594 |
| NanoSciFact R100 | Ndcg@10 | 0,7919 |
| NanoNFCorpus R100 | Map | 0,3709 |
| NanoNFCorpus R100 | Mrr@10 | 0,6541 |
| NanoNFCorpus R100 | Ndcg@10 | 0,4283 |
| NanoBEIR R100 mean | Map | 0,4832 |
| NanoBEIR R100 mean | Mrr@10 | 0,6805 |
| NanoBEIR R100 mean | Ndcg@10 | 0,5433 |
| chowder val | Map | 0,9965 |
| chowder val | Mrr@10 | 0,9965 |
| chowder val | Ndcg@10 | 0,9974 |

El rendimiento en el conjunto de validación propio del corpus es casi perfecto, lo que sugiere un posible sobreajuste a los datos de entrenamiento. En los conjuntos NanoBEIR, los resultados son moderados, con un NDCG@10 medio de 0,54.

## Requisitos de hardware

- VRAM estimada: con 22,7 millones de parámetros, el modelo ocupa aproximadamente 91 MB en FP32 (22,7 M × 4 bytes). Con el overhead de la implementación, se puede ejecutar en menos de 256 MB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1650, RTX 3060 o superiores. También funciona en CPU, aunque con mayor latencia.
- Compatible con GPU de consumo: sí, cabe en cualquier GPU moderna y también en Apple Silicon (M1/M2/M3) mediante la librería de sentence-transformers.
- Opciones de despliegue: sentence-transformers (Python), Hugging Face Inference Endpoints, Text Embeddings Inference (TEI) y servidores compatibles con el pipeline `text-ranking`.
- Latencia y throughput: no se han publicado datos oficiales. Como referencia, un modelo MiniLM de 6 capas procesa típicamente entre 100 y 300 pares por segundo en una GPU consumer, dependiendo de la longitud de los textos.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de otros modelos para comparar directamente. Sin embargo, se puede situar en el contexto de otros cross-encoders pequeños:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| chowder-rerank-minilm (este) | 22,7 M | 512 | no disponible | Fine-tune específico sobre corpus chowder |
| cross-encoder/ms-marco-MiniLM-L6-v2 | 22,7 M | 512 | Apache 2.0 | Modelo base, entrenado en MS MARCO |
| mixedbread-ai/mxbai-rerank-base-v1 | 278 M | 512 | Apache 2.0 | Más grande, con mejores resultados en BEIR |

La comparación cualitativa sugiere que este modelo es una especialización del base MiniLM, con rendimiento potencialmente superior en el dominio del corpus chowder, pero inferior a modelos más grandes como mxbai-rerank-base-v1 en tareas generales de reranking.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha evaluado en otros idiomas.
- Longitud de contexto limitada a 512 tokens, lo que impide procesar documentos largos de una sola vez.
- Licencia no especificada: no se puede garantizar el uso comercial sin consultar al autor.
- El rendimiento en el conjunto de validación propio es casi perfecto, lo que sugiere un posible sobreajuste al corpus chowder y una degradación en dominios no relacionados.
- No se ha documentado el proceso de recopilación del corpus ni su composición, por lo que pueden existir sesgos desconocidos.
- Al ser un cross-encoder, es más lento que los bi-encoders en la fase de inferencia, ya que procesa cada par por separado. No es adecuado para recuperación a gran escala sin un paso previo de filtrado.
- No se han publicado resultados en benchmarks estándar como MS MARCO o BEIR completo, lo que limita la comparabilidad con otros modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wakeleyhuh/chowder-rerank-minilm
- Modelo base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2
- Documentación de sentence-transformers (cross-encoder): https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Repositorio de sentence-transformers: https://github.com/huggingface/sentence-transformers
- Lista de rerankers (referencia general): https://github.com/agentset-ai/awesome-rerankers
