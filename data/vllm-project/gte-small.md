# vllm-project/gte-small

## Resumen

gte-small es un modelo de embeddings de texto (sentence-transformers) desarrollado originalmente por el equipo de Alibaba DAMO Academy y redistribuido en este repositorio por la organizacion vllm-project. Su proposito es transformar frases y parrafos en vectores densos de 384 dimensiones que permiten tareas de similitud semantica, recuperacion de informacion y clasificacion. No es un modelo generativo: no produce texto, sino representaciones vectoriales.

Arquitectura BERT de tipo encoder con 33.360.512 parametros totales, disenado para ser ligero y rapido en inferencia, lo que lo hace adecuado para pipelines de busqueda semantica y RAG a gran escala. Se distribuye bajo licencia MIT, lo que facilita su uso comercial sin restricciones adicionales, y esta disponible en multiples formatos (safetensors, PyTorch, TensorFlow, ONNX, CoreML, OpenVINO).

Su relevancia actual radica en que es un componente habitual en arquitecturas de recuperacion aumentada por generacion (RAG) y en sistemas de busqueda vectorial, donde el coste computacional del encoder de embeddings es critico. La integracion con text-embeddings-inference y su compatibilidad con endpoints lo convierten en una pieza practica para despliegues en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 33.360.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch, TensorFlow, ONNX, CoreML, OpenVINO |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT, un encoder transformer bidireccional. Con 33,3 millones de parametros, se situa en la gama de modelos pequenos de embeddings, lo que implica un coste de inferencia bajo y una huella de memoria reducida. La dimension de los embeddings generados es de 384, segun la convencion de la familia gte-small (no confirmada explicitamente en la informacion proporcionada, pero coherente con el tamano del modelo y su uso como sentence-transformer).

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste contrastivo supervisado. La model card referencia el paper arXiv:2308.03281, que corresponde a la publicacion tecnica de la familia GTE, pero los detalles concretos de entrenamiento no se incluyen en los datos facilitados.

## Capacidades

- Generacion de embeddings de frases y parrafos para similitud semantica.
- Recuperacion de informacion (retrieval) en corpus documentales, evaluado en tareas MTEB como ArguAna y CQADupStack.
- Clasificacion de texto mediante embeddings (Amazon Polarity, Amazon Counterfactual, Banking77, Amazon Reviews).
- Clustering de documentos y frases (ArxivClustering, BiorxivClustering).
- Reranking de resultados de busqueda (AskUbuntuDupQuestions).
- Evaluacion de similitud semantica textual (BIOSSES).
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Busqueda semantica en bases de conocimiento: el modelo genera embeddings de 384 dimensiones que se indexan en bases vectoriales (FAISS, Qdrant, Milvus) para recuperar documentos por significado y no solo por coincidencia lexical. Su tamano reducido permite indexar millones de fragmentos con coste de almacenamiento bajo.
- Pipeline RAG para asistentes conversacionales: se usa como encoder de recuperacion para seleccionar los fragmentos de contexto relevantes antes de pasarlos a un LLM generativo. La baja latencia del encoder reduce el tiempo total de respuesta.
- Clasificacion de tickets de soporte: los embeddings se alimentan a un clasificador ligero (regresion logistica o MLP) para categorizar consultas de clientes; los resultados en Banking77 (84,08% de accuracy) respaldan esta aplicacion.
- Deduplicacion y clustering de documentos: agrupacion de articulos o papers por similitud semantica, util en curacion de contenidos y en sistemas de recomendacion; los resultados en ArxivClusteringP2P (47,90 de v-measure) son indicativos.
- Reranking en motores de busqueda: reordenacion de resultados candidatos segun similitud semantica con la consulta, usando los embeddings para calcular puntuaciones de relevancia; evaluado en AskUbuntuDupQuestions con un MAP de 61,72.
- Moderacion de contenido y analisis de sentimiento: clasificacion de resenas y comentarios; los resultados en Amazon Polarity (91,82% de accuracy) muestran su viabilidad para tareas de polaridad binaria.
- Deteccion de similitud en sistemas de preguntas frecuentes: comparacion de la consulta del usuario con una base de preguntas preindexadas para devolver la respuesta mas cercana, con un coste de inferencia minimo por consulta.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (MTEB, no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Clasificacion | AmazonCounterfactualClassification (en) | accuracy | 73,22 |
| Clasificacion | AmazonCounterfactualClassification (en) | ap | 36,10 |
| Clasificacion | AmazonCounterfactualClassification (en) | f1 | 67,32 |
| Clasificacion | AmazonPolarityClassification | accuracy | 91,82 |
| Clasificacion | AmazonPolarityClassification | ap | 88,52 |
| Clasificacion | AmazonPolarityClassification | f1 | 91,80 |
| Clasificacion | AmazonReviewsClassification (en) | accuracy | 48,03 |
| Clasificacion | AmazonReviewsClassification (en) | f1 | 47,45 |
| Clasificacion | Banking77Classification | accuracy | 84,08 |
| Clasificacion | Banking77Classification | f1 | 84,01 |
| Retrieval | ArguAna | map_at_1 | 30,73 |
| Retrieval | ArguAna | map_at_10 | 46,60 |
| Retrieval | ArguAna | ndcg_at_10 | 55,44 |
| Retrieval | ArguAna | recall_at_10 | 83,64 |
| Retrieval | CQADupstackAndroidRetrieval | map_at_10 | 42,42 |
| Retrieval | CQADupstackAndroidRetrieval | ndcg_at_10 | 49,35 |
| Clustering | ArxivClusteringP2P | v_measure | 47,90 |
| Clustering | ArxivClusteringS2S | v_measure | 40,26 |
| Clustering | BiorxivClusteringP2P | v_measure | 38,37 |
| Clustering | BiorxivClusteringS2S | v_measure | 35,49 |
| Reranking | AskUbuntuDupQuestions | map | 61,72 |
| Reranking | AskUbuntuDupQuestions | mrr | 75,24 |
| STS | BIOSSES | cos_sim_spearman | 88,17 |
| STS | BIOSSES | cos_sim_pearson | 89,44 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en estos mismos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 (33,3 M de parametros, aproximadamente 133 MB de pesos); en FP16 alrededor de 67 MB. La VRAM adicional depende del tamano del lote y de la longitud de las secuencias.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se puede ejecutar en RTX 3060, RTX 4090, A100, H100 sin problemas. Tambien es viable en CPU para cargas moderadas.
- Cabe en cualquier GPU consumer actual e incluso en dispositivos de borde (la disponibilidad de formato CoreML y ONNX sugiere despliegue en movil y navegador).
- Opciones de despliegue: sentence-transformers (Python), text-embeddings-inference (TEI), ONNX Runtime, OpenVINO, CoreML, TensorFlow Serving. Compatible con endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano del modelo, se espera un throughput alto en GPU (miles de frases por segundo en lote), pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Dimension embedding |
|---|---|---|---|---|---|
| gte-small (este) | 33,3 M | no disponible | en | MIT | 384 (segun convencion de la familia) |
| all-MiniLM-L6-v2 | 22,7 M | 256 tokens | en | Apache 2.0 | 384 |
| bge-small-en-v1.5 | 33,4 M | 512 tokens | en | MIT | 384 |
| e5-small-v2 | 33,4 M | 512 tokens | en | MIT | 384 |

Los datos de all-MiniLM-L6-v2, bge-small-en-v1.5 y e5-small-v2 provienen del conocimiento general de la familia de modelos y no de la informacion proporcionada; se incluyen como referencia orientativa. No se dispone de comparaciones directas de rendimiento entre estos modelos y gte-small en los benchmarks facilitados.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles: no soporta otros idiomas de forma nativa, lo que limita su uso en aplicaciones multilingues.
- No es un modelo generativo: no puede producir texto, razonar ni mantener conversaciones; solo genera embeddings.
- Riesgo de sesgos: al entrenarse sobre corpus web en ingles, puede heredar sesgos de genero, raza o ideologia presentes en los datos; no se documentan mitigaciones en la informacion proporcionada.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes espurias en dominios muy especializados o con vocabulario fuera de distribucion.
- Longitud de contexto no documentada: se desconoce el maximo de tokens por secuencia; en modelos BERT similares suele ser 512, pero no se confirma.
- Licencia MIT: permite uso comercial, modificacion y redistribucion sin restricciones adicionales, aunque se recomienda conservar el aviso de copyright.
- Repositorio redistribuido por vllm-project: la fecha de creacion indicada (2026-10-30) es futura respecto a la redaccion habitual de fichas, lo que sugiere un posible error en los metadatos o una fecha programada; conviene verificar la procedencia y el commit exacto antes de usarlo en produccion.
- Sin resultados de benchmarks verificados: los datos de la model card estan marcados como no verificados.

## Enlaces

- Hugging Face: https://huggingface.co/vllm-project/gte-small
- Paper de referencia: https://arxiv.org/abs/2308.03281
- Repositorio original de la familia GTE (Alibaba DAMO): no disponible en la informacion proporcionada.
- Documentacion de sentence-transformers: no disponible en la informacion proporcionada.
- Documentacion de text-embeddings-inference: no disponible en la informacion proporcionada.
