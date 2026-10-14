# zeromodels/multi-qa-mpnet-base-dot-v1

## Resumen

zeromodels/multi-qa-mpnet-base-dot-v1 es una conversion a Keras 3 del checkpoint sentence-transformers/multi-qa-mpnet-base-dot-v1, publicada por el autor zeromodels dentro del proyecto ZeroModels. No es un modelo generativo, sino un modelo de embeddings de frases orientado a similitud semantica y recuperacion de informacion (pipeline sentence-similarity). Utiliza un backbone MPNet y proyecta cada texto a un vector de 768 dimensiones, con pooling de tipo CLS, sin proyeccion densa adicional y sin normalizacion L2 de salida.

La conversion mantiene la receta de embedding del modelo original y no introduce un nuevo entrenamiento: se trata de una reimplementacion de los pesos en Keras 3 almacenada como model.weights.h5, acompanada de zm_config.json y tokenizer.json. La verificacion frente al checkpoint original congelado reporta una diferencia absoluta maxima de embedding de 5.06639e-07, un coseno minimo de 1.00000000 y una diferencia absoluta maxima de puntuacion de similitud de 3.8147e-06, lo que indica una paridad numerica practicamente exacta.

Su relevancia actual es de infraestructura: permite ejecutar un modelo de recuperacion consolidado (MPNet multi-QA) sobre Keras 3 con backend Torch, TensorFlow o JAX, sin depender de la libreria sentence-transformers ni de PyTorch en el pipeline de inferencia. Al ser un modelo pequeno y de proposito especifico encaja en sistemas RAG, busqueda semantica y deduplicacion donde no se necesita generacion de texto. El repositorio ocupa 0,4 GB y no declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNet (encoder transformer, variante base) |
| Parametros totales | no disponible (el backbone MPNet base original se situa habitualmente en torno a 110 millones, pero la model card no lo especifica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (longitud maxima de entrada, truncacion preservada del original) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos Keras en model.weights.h5; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponibles (la model card no los declara; el checkpoint original esta orientado principalmente a ingles) |
| Licencia | no disponible (la model card original tampoco declara licencia) |
| Formato de pesos | Keras 3 (model.weights.h5) + zm_config.json + tokenizer.json; no se ofrece safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un encoder MPNet, una arquitectura transformer con atencion de tipo permuted y factorizada que combina caracteristicas de MLM y PLM. La receta de embedding de este checkpoint concreto es: pooling CLS (no mean pooling), sin proyeccion densa posterior, embeddings sin normalizar y funcion de puntuacion por producto escalar (dot product). La dimension de salida es de 768. Para obtener vectores de longitud unitaria es necesario pasar normalize=True a model.encode(), lo que modifica la receta original y puede alterar las puntuaciones de recuperacion.

No hubo entrenamiento nuevo: el modelo es una conversion de pesos del checkpoint sentence-transformers/multi-qa-mpnet-base-dot-v1 (revision 17997f24dca0df1a4fed68894fb0e1e133e60482). Los detalles de entrenamiento (composicion del dataset, numero de tokens, uso de tecnicas como RLHF o DPO) corresponden al modelo original y no se reproducen en esta ficha. El aviso de la model card indica que la paridad de embeddings se comprobo con backend Torch y que no se reclama paridad completa con TensorFlow ni con JAX.

## Capacidades

- Generacion de embeddings de texto de 768 dimensiones por entrada.
- Calculo de similitud semantica mediante producto escalar, coherente con la receta del checkpoint original.
- Recuperacion de informacion (retrieval) y busqueda semantica sobre pares pregunta-respuesta o pasaje-consulta.
- Agrupacion y clustering por similitud de embeddings.
- Deduplicacion de textos y deteccion de parafrasis.
- No es un modelo generativo: no produce texto, por lo que no soporta instrucciones, chat ni razonamiento en lenguaje natural.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Multilingue: no declarado; el checkpoint de origen esta enfocado a ingles.
- Limite de 512 tokens por entrada (truncacion preservada del tokenizer original).

## Casos de uso

- Recuperacion aumentada (RAG): el modelo puede indexar fragmentos de documentacion y recuperar los pasajes mas relevantes para una consulta mediante dot product. Es adecuado por su receta multi-QA y su baja huella de memoria frente a un cross-encoder.
- Busqueda semantica en bases de conocimiento: permite sustituir la busqueda por palabras clave por una busqueda por significado, con vectores de 768 dimensiones almacenables en indices como FAISS o Qdrant.
- Sistema de FAQ inteligente: cada pregunta frecuente se codifica una sola vez y las consultas de usuario se comparan por similitud. La alta velocidad de un encoder base de 512 tokens encaja con respuestas en tiempo real.
- Deduplicacion y near-duplicate detection: se calcula la similitud entre pares de documentos o registros para eliminar contenido repetido en corpus grandes. No requiere normalizacion previa si se mantiene el dot product.
- Clustering y analisis tematico: agrupar conversaciones, tickets de soporte o articulos por cercania de embeddings antes de aplicar un algoritmo de clustering.
- Reranking ligero en pipelines de busqueda: tras una primera fase de recuperacion con BM25, el modelo reordena candidatos segun su score de similitud con la consulta.
- Evaluacion de respuestas en QA: medir la similitud semantica entre la respuesta generada por otro sistema y la referencia, como metrica automatica de calidad.
- Recomendacion por contenido: representar los embeddings de articulos o productos y sugerir elementos semanticamente cercanos a los que ya ha consumido un usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reproducible que aparece en la model card es la de verificacion de la conversion: diferencia absoluta maxima de embedding de 5.06639e-07, coseno minimo de 1.00000000 entre embeddings equivalentes y diferencia absoluta maxima de puntuacion de similitud de 3.8147e-06 respecto al checkpoint original.

## Requisitos de hardware

- Inferencia viable en CPU para cargas moderadas, dado que el repositorio ocupa 0,4 GB y el backbone es un encoder base con entrada maxima de 512 tokens.
- VRAM estimada: del orden de 1 a 2 GB en funcion del tamano de lote y del backend; no se dispone de cifras oficiales en la informacion proporcionada.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente; no se requiere A100 ni H100 para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier tarjeta consumer reciente (por ejemplo, serie RTX 20/30/40) e incluso en CPU.
- Opciones de despliegue: Keras 3 con backend Torch, TensorFlow o JAX a traves del cargador de ZeroModels (SentenceTransformerModel.from_weights). No aplica vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo generativo. El checkpoint original puede servirse con la libreria sentence-transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Dimension del embedding | Pooling / receta | Contexto | Uso previsto | Licencia |
|---|---|---|---|---|---|
| zeromodels/multi-qa-mpnet-base-dot-v1 | 768 | CLS + dot product (sin normalizar) | 512 tokens | Recuperacion multi-QA | no disponible |
| zeromodels/all-mpnet-base-v2 | 768 | mean + normalizar | 512 tokens | Similitud general / parafrasis | no disponible |
| zeromodels/multi-qa-MiniLM-L6-cos-v1 | 384 | mean + normalizar (coseno) | 512 tokens | Recuperacion multi-QA | no disponible |
| zeromodels/all-MiniLM-L6-v2 | 384 | mean + normalizar | 512 tokens | Similitud general, uso ligero | no disponible |

Los cuatro modelos pertenecen a la misma familia de conversiones de ZeroModels y comparten formato Keras 3, por lo que la eleccion depende del equilibrio entre dimensionalidad y calidad de recuperacion: MPNet base ofrece 768 dimensiones y una receta especifica de dot product, mientras que las variantes MiniLM reducen a 384 dimensiones y aplican normalizacion con similitud coseno. No se dispone de datos de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: ni esta conversion ni la model card original especifican licencia, por lo que deben verificarse los derechos de redistribucion y de uso comercial antes de integrarlo en produccion.
- Modelo no generativo: solo produce embeddings; no puede responder preguntas ni ejecutar acciones.
- Longitud de contexto limitada a 512 tokens, con truncacion del texto que la supere, lo que puede degradar la recuperacion en documentos largos.
- Embeddings no normalizados por defecto: si se utiliza similitud coseno en lugar de dot product sin cambiar la receta, los scores dejaran de ser comparables con los del checkpoint original.
- Idiomas no declarados: el checkpoint de origen esta orientado principalmente a ingles, por lo que el rendimiento en otros idiomas no esta garantizado.
- Riesgo de sesgo: hereda los sesgos del dataset de entrenamiento del modelo original, no documentados en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto; el riesgo equivalente es recuperar pasajes irrelevantes cuando la similitud semantica no coincide con la relevancia real.
- Paridad numerica verificada solo con backend Torch; con backend TensorFlow o JAX no se reclama paridad, lo que puede introducir pequenas diferencias en los embeddings.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeromodels/multi-qa-mpnet-base-dot-v1
- Checkpoint original: https://huggingface.co/sentence-transformers/multi-qa-mpnet-base-dot-v1
- Revision original congelada: https://huggingface.co/sentence-transformers/multi-qa-mpnet-base-dot-v1/tree/17997f24dca0df1a4fed68894fb0e1e133e60482
- Repositorio ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentacion de sentence transformers en ZeroModels: https://imvision12.github.io/ZeroModels/sentence_transformer/
