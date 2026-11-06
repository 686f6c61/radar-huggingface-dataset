# yillint/all-mpnet-base-v2

## Resumen

`yillint/all-mpnet-base-v2` es una réplica alojada del conocido modelo de embeddings de frases `sentence-transformers/all-mpnet-base-v2`, publicado por el usuario yillint bajo licencia Apache 2.0. Se trata de un encoder de frases y párrafos cortos que proyecta el texto de entrada en un espacio vectorial denso de 768 dimensiones, pensado para tareas de similitud semántica, recuperación de información y clustering. No es un modelo generativo: no produce texto, sino representaciones vectoriales.

El modelo se construye a partir del checkpoint preentrenado `microsoft/mpnet-base` (arquitectura MPNet, un transformer encoder que combina enmascaramiento estilo MLM con permutación de tokens) y se afina con un objetivo contrastivo sobre un corpus de aproximadamente 1.000 millones de pares de frases. Con 109.486.978 parámetros, es un modelo compacto que cabe holgadamente en cualquier GPU de consumo y que sigue siendo un valor seguro para pipelines de búsqueda semántica en producción.

Su relevancia actual radica en que, pese a la irrupción de embeddings de mayor dimensión y modelos multilingües más recientes, `all-mpnet-base-v2` continúa siendo una referencia habitual por su equilibrio entre calidad de recuperación, coste computacional y compatibilidad con el ecosistema `sentence-transformers`, ONNX, OpenVINO y Text Embeddings Inference (TEI).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MPNet (transformer encoder, preentrenamiento con masked language modeling y permutación) |
| Parámetros totales | 109.486.978 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 tokens (el texto más largo se trunca por defecto) |
| Tipos de cuantización | no especificados en la model card; el repo incluye pesos ONNX, OpenVINO y safetensors, lo que permite cuantización a int8 en esos runtimes |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch (`pytorch`), ONNX (`onnx`), OpenVINO (`openvino`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo MPNet, derivado de `microsoft/mpnet-base`. MPNet combina dos ideas: el enmascaramiento de tokens al estilo BERT (MLM) y la predicción de tokens permutados al estilo XLNet, de modo que el modelo ve la secuencia completa durante el preentrenamiento y aprende dependencias bidireccionales sin el artefacto del token `[MASK]`. Sobre esa base, el afinamiento para embeddings utiliza una cabeza de pooling de media (mean pooling) con normalización L2, que es la operación que debe replicarse si se usa el modelo directamente con `transformers` en lugar de con `sentence-transformers`.

El ajuste fino emplea un objetivo contrastivo: dado un par de frases del corpus, el modelo debe identificar cuál de un conjunto de frases muestreadas aleatoriamente es la pareja real, optimizando similitud coseno. El corpus de entrenamiento combina aproximadamente 1.000 millones de pares procedentes de fuentes heterogéneas: S2ORC (papers), StackExchange, MS MARCO, GooAQ, Yahoo Answers, CodeSearchNet, SearchQA, ELI5, SNLI, MultiNLI, WikiHow, Natural Questions, TriviaQA, Flickr30k captions, QQP, SPECTER, PAQ y WikiAnswers, entre otras. El entrenamiento se realizó en el marco de la Community Week de Hugging Face con JAX/Flax sobre 7 TPUs v3-8. No se documenta en la información disponible el uso de RLHF ni de DPO, algo esperable en un modelo de embeddings.

## Capacidades

- Generación de embeddings de frases y párrafos cortos en un espacio denso de 768 dimensiones.
- Similitud semántica entre pares de textos mediante coseno o producto escalar.
- Búsqueda semántica y recuperación de información (dense retrieval) contra índices vectoriales.
- Clustering y deduplicación semántica de documentos.
- Clasificación de textos mediante embeddings como features de entrada a modelos downstream.
- Extracción de características (`feature-extraction`) y relleno de máscaras (`fill-mask`) a través de la API estándar de `transformers`.
- Compatibilidad con Text Embeddings Inference (TEI), incluida la API compatible con OpenAI Embeddings (`/v1/embeddings`).
- Exportación a ONNX y OpenVINO para inferencia en CPU.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un encoder de texto.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar fragmentos de manuales y consultar con lenguaje natural; el modelo es adecuado porque genera vectores de 768 dimensiones con buen rendimiento en recuperación sobre dominios técnicos (S2ORC, StackExchange) vistos durante el entrenamiento.
- Motor de preguntas frecuentes (FAQ): comparar la consulta del usuario con las preguntas canónicas y devolver la de mayor similitud coseno; el truncamiento a 384 tokens es suficiente para preguntas y respuestas breves.
- Deduplicación de tickets de soporte: agrupar incidencias por similitud semántica antes de asignarlas a colas, reduciendo el volumen manual; el coste por embedding es bajo (modelo de ~110M parámetros).
- Reranking ligero en pipelines RAG: usar el modelo como segunda etapa de reordenación tras una recuperación BM25, calculando similitud entre la consulta y los candidatos recuperados.
- Clustering de noticias o reseñas: agrupar documentos por temática con KMeans sobre los embeddings normalizados; útil para análisis exploratorio y etiquetado débil.
- Filtrado de contenido y moderación asistida: detectar duplicados o near-duplicates en colas de moderación comparando embeddings con un umbral de coseno.
- Búsqueda de código por descripción: aunque no es un modelo específico de código, el corpus incluye CodeSearchNet y permite recuperar fragmentos de código a partir de una descripción en lenguaje natural.
- Servicio de embeddings en producción: desplegado con TEI (CPU o GPU) exponiendo la API de OpenAI Embeddings, lo que facilita sustituir proveedores externos sin cambiar el código cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,44 GB solo para pesos (109,5M × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 2 GB para lotes moderados.
- VRAM estimada en fp16: aproximadamente 0,22 GB para pesos; el modelo cabe sin problema en cualquier GPU con 4 GB o más.
- GPU recomendadas: no requiere GPU dedicada para funcionar; para alto throughput se recomiendan A100, H100, L40S o RTX 4090. En GPUs de consumo (RTX 3060, 4060, 4070) funciona con lotes grandes sin problemas.
- CPU: viable para cargas moderadas, especialmente con los pesos ONNX u OpenVINO incluidos en el repo.
- Opciones de despliegue: `sentence-transformers`, `transformers` con mean pooling manual, Text Embeddings Inference (TEI) en CPU o CUDA, ONNX Runtime, OpenVINO, y contenedores oficiales de TEI.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware, del tamaño de lote y de la longitud de las secuencias (máximo 384 tokens).

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| yillint/all-mpnet-base-v2 | 109,5M | 768 | 384 tokens | en | Apache 2.0 | Réplica del original; incluye ONNX y OpenVINO |
| sentence-transformers/all-mpnet-base-v2 | 109,5M | 768 | 384 tokens | en | Apache 2.0 | Modelo original de referencia |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7M | 384 | 256 tokens | en | Apache 2.0 | Más rápido y ligero, menor calidad de recuperación |
| BAAI/bge-base-en-v1.5 | ~109M | 768 | 512 tokens | en | MIT | Alternativa moderna con mejor rendimiento en retrieval según sus autores |

## Limitaciones y advertencias

- Solo inglés: el modelo está entrenado y evaluado en inglés; su uso en castellano u otros idiomas produce embeddings de baja calidad.
- Truncamiento a 384 tokens: los textos más largos se recortan, lo que puede perder información relevante en documentos extensos.
- No es generativo: no puede responder preguntas ni producir texto; solo genera vectores.
- Riesgo de sesgos: al entrenarse sobre corpus web (StackExchange, Yahoo Answers, QQP, etc.), puede heredar sesgos de género, raza o ideología presentes en esos datos.
- Alucinación: no aplica en el sentido generativo, pero la similitud semántica puede producir falsos positivos en recuperación cuando los textos comparten vocabulario pero no significado.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la procedencia del checkpoint base (`microsoft/mpnet-base`) y de los datasets, algunos con condiciones propias.
- Repo con muy poca tracción (30 descargas, 0 likes en el momento de la consulta): para producción se recomienda usar el repositorio original `sentence-transformers/all-mpnet-base-v2`, que recibe mantenimiento y actualizaciones.
- Sin garantías de reproducibilidad exacta respecto al original: al ser una réplica alojada por un tercero, no hay verificación pública de que los pesos coincidan bit a bit con los del modelo oficial.

## Enlaces

- Hugging Face: https://huggingface.co/yillint/all-mpnet-base-v2
- Modelo original: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
- Checkpoint base: https://huggingface.co/microsoft/mpnet-base
- Documentación de Sentence-Transformers: https://www.SBERT.net
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- Paper MPNet: https://arxiv.org/abs/2004.09297
- Paper Sentence-BERT: https://arxiv.org/abs/1908.10084
- Hilo de la Community Week de Hugging Face: https://discuss.huggingface.co/t/open-to-the-community-community-week-using-jax-flax-for-nlp-cv/7104
- Proyecto "Train the Best Sentence Embedding Model Ever with 1B Training Pairs": https://discuss.huggingface.co/t/train-the-best-sentence-embedding-model-ever-with-1b-training-pairs/7354
