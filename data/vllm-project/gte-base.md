# vllm-project/gte-base

## Resumen

gte-base es un modelo de embeddings de texto desarrollado originalmente por Alibaba DAMO Academy (publicado en el paper GTE, arXiv:2308.03281) y redistribuido en este repositorio por el proyecto vLLM. Su funcion es transformar texto en vectores densos de 768 dimensiones para tareas de similitud semantica, recuperacion de informacion (retrieval), clasificacion, clustering y reranking. No es un modelo generativo: no produce texto, solo representaciones vectoriales.

Arquitectura BERT de tipo encoder, con 109.482.752 parametros totales (aproximadamente 110 millones), lo que lo situa en la categoria de modelos de embeddings ligeros. Esta pensado para integrarse en pipelines de busqueda semantica, RAG y sistemas de recomendacion donde el coste de inferencia por documento es critico.

Su relevancia actual radica en que es un modelo pequeno, con licencia MIT permisiva y compatible con infraestructuras de despliegue estandar (sentence-transformers, ONNX, OpenVINO, text-embeddings-inference y el propio vLLM). El repositorio de vLLM facilita su uso como backend de embeddings dentro de stacks que ya utilizan ese motor de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 109.482.752 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repo incluye pesos safetensors, ONNX y OpenVINO) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX, OpenVINO, PyTorch |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT, un transformer encoder bidireccional. Con 109 millones de parametros y embeddings de salida de 768 dimensiones, se situa en la misma familia que BERT-base. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de contraste learning especificas mas alla de lo descrito en el paper GTE (arXiv:2308.03281), que propone un enfoque de entrenamiento multi-etapa para embeddings de proposito general.

La informacion disponible no especifica si hubo RLHF, DPO ni tecnicas de destilacion. El modelo se distribuye a traves de sentence-transformers, lo que implica una capa de pooling (habitualmente mean pooling) sobre las representaciones del encoder para producir el vector de frase. El repositorio incluye exportaciones a ONNX y OpenVINO, lo que sugiere que el autor prioriza el despliegue en produccion sobre CPU y aceleradores heterogeneos.

## Capacidades

- Generacion de embeddings de texto de 768 dimensiones para similitud semantica.
- Recuperacion de informacion (retrieval) densa: adecuado como retriever en pipelines RAG.
- Clasificacion de texto por similitud (zero-shot y con embeddings congelados).
- Clustering de documentos y frases.
- Reranking de candidatos recuperados previamente.
- Similitud de pares de frases (STS).
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso.
- No soporta vision, audio ni modo thinking.
- Multilingue: no; solo ingles segun la model card.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar fragmentos de documentacion en una base vectorial y recuperar los mas relevantes para una consulta en lenguaje natural. El tamano reducido del modelo permite indexar grandes volumenes con coste de computo bajo.
- RAG sobre corpus internos: usar gte-base como retriever en un pipeline de generacion aumentada, alimentando un LLM generativo con los pasajes recuperados. Su licencia MIT facilita el uso comercial sin restricciones.
- Deduplicacion y near-duplicate detection: calcular similitud coseno entre embeddings de registros para detectar duplicados en bases de datos de tickets, articulos o catalogos de producto.
- Clasificacion de tickets de soporte: entrenar un clasificador ligero sobre los embeddings congelados para enrutar consultas a la cola adecuada, sin necesidad de fine-tuning del encoder.
- Reranking en buscadores: reordenar los resultados de un motor de busqueda lexico (BM25) usando la similitud semantica del modelo, mejorando la precision del top-k.
- Agrupacion de feedback de usuarios: aplicar clustering sobre embeddings de comentarios o resenas para descubrir temas recurrentes de forma no supervisada.
- Moderacion de contenido asistida: comparar embeddings de mensajes contra un conjunto de referencia de contenido problematico para priorizar revisiones humanas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (MTEB, ingles). No verificados de forma independiente segun el campo `verified: false`.

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Classification | MTEB AmazonCounterfactualClassification (en) | accuracy | 74,18 |
| Classification | MTEB AmazonCounterfactualClassification (en) | f1 | 68,11 |
| Classification | MTEB AmazonPolarityClassification | accuracy | 91,77 |
| Classification | MTEB AmazonPolarityClassification | f1 | 91,77 |
| Classification | MTEB AmazonReviewsClassification (en) | accuracy | 48,96 |
| Classification | MTEB AmazonReviewsClassification (en) | f1 | 48,23 |
| Classification | MTEB Banking77Classification | accuracy | 85,07 |
| Classification | MTEB Banking77Classification | f1 | 85,03 |
| Retrieval | MTEB ArguAna | ndcg_at_10 | 57,12 |
| Retrieval | MTEB ArguAna | recall_at_10 | 85,42 |
| Retrieval | MTEB ArguAna | map_at_10 | 48,25 |
| Retrieval | MTEB CQADupstackAndroidRetrieval | ndcg_at_10 | 52,24 |
| Retrieval | MTEB CQADupstackAndroidRetrieval | map_at_10 | 45,16 |
| Clustering | MTEB ArxivClusteringP2P | v_measure | 48,60 |
| Clustering | MTEB ArxivClusteringS2S | v_measure | 43,01 |
| Clustering | MTEB BiorxivClusteringP2P | v_measure | 38,20 |
| Clustering | MTEB BiorxivClusteringS2S | v_measure | 36,59 |
| Reranking | MTEB AskUbuntuDupQuestions | map | 61,80 |
| Reranking | MTEB AskUbuntuDupQuestions | mrr | 74,79 |
| STS | MTEB BIOSSES | cos_sim_spearman | 87,64 |

La informacion proporcionada solo incluye un subconjunto de los resultados MTEB; no se dispone de la media agregada ni de comparaciones directas con otros modelos en los datos facilitados.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,44 GB solo para pesos (109,5 M parametros x 4 bytes), mas activaciones y overhead; en la practica menos de 2 GB.
- VRAM estimada en FP16/BF16: aproximadamente 0,22 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Funciona en RTX 3060, RTX 4090, A100, H100 y tambien en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference (tag del repo), ONNX Runtime, OpenVINO, vLLM y llama.cpp no aplica (no es un modelo generativo GGUF).
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera un throughput alto en lote sobre GPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension embedding | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| gte-base (este) | 109,5 M | 768 | no disponible | en | MIT |
| BERT-base (referencia) | 110 M | 768 | 512 tokens (tipico) | multilingue en variantes | Apache 2.0 |
| all-MiniLM-L6-v2 | 22,7 M | 384 | 256 tokens (tipico) | en | Apache 2.0 |
| E5-base | 109 M | 768 | 512 tokens (tipico) | en | MIT |

Nota: los datos de contexto y dimension de los modelos comparables no provienen de la informacion proporcionada para este modelo y deben verificarse en sus respectivas model cards. No se dispone de comparaciones de rendimiento agregado en los datos facilitados.

## Limitaciones y advertencias

- Solo soporta ingles; su uso en castellano u otros idiomas degradara la calidad de los embeddings.
- No es un modelo generativo: no puede producir texto, responder preguntas ni ejecutar herramientas.
- Riesgo de alucinacion no aplica en sentido estricto, pero la similitud semantica puede producir falsos positivos en recuperacion cuando los textos comparten vocabulario sin compartir significado.
- La longitud maxima de contexto no esta documentada en la informacion disponible; textos largos pueden truncarse y perder informacion.
- Los resultados de benchmarks estan declarados por el autor y no verificados de forma independiente (`verified: false`).
- Licencia MIT: permite uso comercial y modificacion, pero conviene revisar las condiciones del modelo original GTE de Alibaba y del paper asociado.
- El repositorio tiene muy pocas descargas (25) y ningun like en el momento de la consulta; es una redistribucion, no el repositorio canonico del modelo.
- No se documentan sesgos especificos; al entrenarse sobre datos en ingles, puede heredar sesgos de genero, raza o nacionalidad presentes en el corpus.

## Enlaces

- Hugging Face: https://huggingface.co/vllm-project/gte-base
- Paper GTE: https://arxiv.org/abs/2308.03281
- Repositorio vLLM: https://github.com/vllm-project/vllm
- MTEB benchmark: https://github.com/embeddings-benchmark/mteb
- sentence-transformers: https://www.sbert.net/
