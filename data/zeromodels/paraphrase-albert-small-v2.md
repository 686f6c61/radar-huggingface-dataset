# zeromodels/paraphrase-albert-small-v2

## Resumen

zeromodels/paraphrase-albert-small-v2 es una conversion a Keras 3 puro del checkpoint sentence-transformers/paraphrase-albert-small-v2, publicada por el autor zeromodels dentro del proyecto ZeroModels. No se trata de un modelo generativo ni de un nuevo entrenamiento, sino de una reimplementacion de pesos que reproduce la receta de embeddings del modelo original para poder ejecutarla con Keras 3. El modelo codifica texto en vectores de 768 dimensiones usando un backbone ALBERT.

La tarea para la que esta disenado es sentence-similarity: dado un par de frases, produce embeddings comparables mediante similitud coseno. El pooling es de tipo mean, no aplica ninguna proyeccion densa adicional y los embeddings no estan normalizados en L2, por lo que la funcion de scoring esperada es la similitud coseno sobre vectores sin normalizar (aunque se puede activar normalize=True, lo que altera la receta original). La longitud maxima de entrada es de 100 tokens.

Su relevancia es practica: permite ejecutar un encoder de frases conocido (util para busqueda semantica, deduplicacion, clustering o reranking) dentro del ecosistema Keras 3, con paridad verificada frente al checkpoint original y bajo licencia apache-2.0. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y ocupa 0.0 GB, lo que confirma que es un artefacto ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con backbone ALBERT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 100 tokens (maxima longitud de entrada) |
| Tipos de cuantizacion | no disponible (pesos en Keras HDF5, sin variantes GGUF/cuantizadas publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | model.weights.h5 (Keras 3), junto con zm_config.json y tokenizer.json |

Datos adicionales de la receta de embeddings:

| Parametro | Valor |
|---|---|
| Dimension de embedding | 768 |
| Pooling | mean |
| Proyeccion densa | ninguna |
| Normalizacion L2 | no |
| Funcion de scoring | similitud coseno |
| Checkpoint original | sentence-transformers/paraphrase-albert-small-v2 |
| Revision original fijada | 9d490b476eb5291c7885bb6d4961318740493cf2 |

## Arquitectura y entrenamiento

El modelo es una conversion de pesos, no un entrenamiento nuevo. La model card indica explicitamente que la conversion "preserva la receta de embeddings del modelo fuente; no introduce una nueva ejecucion de entrenamiento". El backbone es ALBERT, un encoder transformer, sobre el que se aplica pooling de tipo mean para obtener un unico vector de 768 dimensiones por texto. No hay capa densa de proyeccion posterior, y los embeddings resultantes no se normalizan en L2.

La verificacion de la conversion se hizo comparando con Sentence Transformers en la revision fuente fijada. Los resultados reportados son: diferencia absoluta maxima de embeddings de 2.74181e-06, coseno minimo entre embeddings de 0.99999994 y diferencia absoluta maxima de la puntuacion de similitud de 2.38419e-07. La paridad se comprobo con el backend Torch de Keras 3; no se reclama paridad completa con los backends TensorFlow o JAX. El repositorio incluye model.weights.h5, zm_config.json y tokenizer.json, y el tokenizador conserva la longitud de truncado de 100 tokens del checkpoint fuente.

## Capacidades

- Generacion de embeddings de frases: convierte texto en vectores de 768 dimensiones mediante pooling mean.
- Similitud semantica entre frases: funcion model.similarity() basada en similitud coseno, alineada con el modelo fuente.
- Recuperacion y busqueda semantica: los embeddings permiten indexar y comparar textos por cercania vectorial.
- Deduplicacion y deteccion de parafrasis: al comparar pares de frases por coseno.
- Clustering de textos: agrupacion en espacio de embeddings de 768 dimensiones.
- Normalizacion opcional: se puede pasar normalize=True a model.encode() para obtener vectores de longitud unitaria, con la advertencia de que esto modifica la receta original y puede alterar los scores de recuperacion.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso, vision, audio ni modo thinking: es exclusivamente un encoder de frases.

## Casos de uso

- Busqueda semantica sobre documentacion: indexar fragmentos de texto como vectores de 768 dimensiones y recuperar los mas cercanos a una consulta mediante similitud coseno, aprovechando que es un encoder ligero y rapido de ejecutar.
- Deduplicacion de contenido: comparar pares de frases o documentos por similitud coseno para detectar duplicados o casi duplicados en un corpus, sin necesidad de coincidencia exacta de cadenas.
- Deteccion de parafrasis: usar el scoring del propio modelo para determinar si dos frases expresan la misma idea, que es la tarea para la que fue disenada la receta original.
- Reranking en pipelines de recuperacion: dado un conjunto de candidatos recuperados por un motor de busqueda tradicional, reordenarlos segun la similitud semantica con la consulta.
- Clustering y exploracion de topicos: proyectar un conjunto de textos en el espacio de embeddings y agruparlos para obtener una vision tematica del corpus.
- Clasificacion de texto por similitud de prototipos: comparar cada texto con embeddings de referencia de cada clase y asignar la etiqueta del prototipo mas cercano, sin reentrenar el encoder.
- Integracion en aplicaciones Keras 3: al ser una conversion nativa de Keras, se puede incorporar como capa o modulo dentro de un pipeline mayor escrito en Keras 3 con backend Torch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (tipo MMLU, HumanEval, GSM8K u otros), algo esperable en un modelo de embeddings y no generativo. La unica metrica objetiva reportada es la de verificacion de la conversion frente al checkpoint fuente:

| Metrica de verificacion | Valor |
|---|---|
| Diferencia absoluta maxima de embeddings | 2.74181e-06 |
| Coseno minimo entre embeddings | 0.99999994 |
| Diferencia absoluta maxima de la puntuacion de similitud | 2.38419e-07 |

Estos valores indican paridad practicamente exacta con sentence-transformers/paraphrase-albert-small-v2 en la revision fijada, verificada sobre el backend Torch de Keras 3.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Al tratarse de un encoder ALBERT de tipo small con salida de 768 dimensiones, la huella de memoria es reducida y es viable su ejecucion en CPU, aunque no se aportan cifras oficiales.
- GPU recomendadas: no especificadas por el autor. Al ser un modelo ligero, cualquier GPU moderna deberia poder ejecutarlo; no se trata de un modelo que requiera A100 o H100.
- Viabilidad en GPU de consumo: previsiblemente si, en cualquier GPU de consumo con unos pocos GB de VRAM, e incluso en CPU, si bien el autor no publica requisitos concretos.
- Opciones de despliegue: Keras 3 (backend Torch probado, con advertencia de que no se reclama paridad total en TensorFlow/JAX) mediante SentenceTransformerModel y SentenceTransformerTokenizer de ZeroModels; tambien es posible cargar el checkpoint fuente con sentence-transformers usando from_weights("hf:sentence-transformers/paraphrase-albert-small-v2"). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un encoder de este tipo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

El propio autor publica una familia de 13 variantes convertidas a Keras 3 bajo zeromodels, lo que permite una comparacion directa dentro del mismo ecosistema. Las mas comparables por tamano y tarea son:

| Modelo | Backbone | Embedding | Pooling y receta | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zeromodels/paraphrase-albert-small-v2 | ALBERT | 768 | mean, sin normalizar, coseno | apache-2.0 | HuggingFace (zeromodels) |
| zeromodels/all-MiniLM-L6-v2 | BERT | no disponible en esta ficha | mean + normalize | no disponible en esta ficha | HuggingFace (zeromodels) |
| zeromodels/all-mpnet-base-v2 | MPNet | no disponible en esta ficha | mean + normalize | no disponible en esta ficha | HuggingFace (zeromodels) |
| zeromodels/paraphrase-multilingual-MiniLM-L12-v2 | BERT | no disponible en esta ficha | mean | no disponible en esta ficha | HuggingFace (zeromodels) |

La diferencia funcional mas relevante frente a all-MiniLM-L6-v2 y all-mpnet-base-v2 es la receta: esta variante usa pooling mean sin normalizacion y scoring coseno, mientras que las otras dos aplican mean mas normalizacion. No se dispone de cifras de benchmarks comparativas entre estas variantes en la informacion proporcionada, por lo que la eleccion entre ellas no puede justificarse con datos de rendimiento a partir de esta ficha.

## Limitaciones y advertencias

- Es un encoder de frases, no un modelo generativo: no produce texto ni responde a prompts.
- Longitud de contexto muy corta: 100 tokens como maximo de entrada. Textos mas largos se truncan, lo que puede perder informacion relevante.
- Embeddings no normalizados: por defecto la receta no normaliza en L2. Si se activa normalize=True se modifica la receta original y pueden cambiar los scores de recuperacion, tal como advierte el autor.
- Idiomas soportados: no disponibles. No se confirma cobertura multilingue en la informacion proporcionada.
- Sesgos conocidos: no disponibles. Al derivar del checkpoint original, heredaria los sesgos de este, no documentados aqui.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe el riesgo de que la similitud coseno produzca matches espurios entre frases semanticamente distintas.
- Restricciones de licencia: apache-2.0, lo que en principio permite uso comercial, pero conviene verificar la licencia del checkpoint fuente declarada por sentence-transformers.
- Paridad de backend limitada: la verificacion se hizo solo con el backend Torch de Keras 3; no se reclama paridad con TensorFlow ni JAX.
- El tokenizador debe cargarse del mismo repositorio que el modelo para conservar el truncado de 100 tokens.
- Adopcion nula hasta la fecha: 0 descargas y 0 likes, sin senales de uso en produccion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeromodels/paraphrase-albert-small-v2
- Checkpoint original: https://huggingface.co/sentence-transformers/paraphrase-albert-small-v2
- Revision original fijada: https://huggingface.co/sentence-transformers/paraphrase-albert-small-v2/tree/9d490b476eb5291c7885bb6d4961318740493cf2
- Repositorio ZeroModels en GitHub: https://github.com/IMvision12/ZeroModels
- Documentacion de Sentence Transformers en ZeroModels: https://imvision12.github.io/ZeroModels/sentence_transformer/
- Variante relacionada (all-mpnet-base-v2): https://huggingface.co/zeromodels/all-mpnet-base-v2
- Variante relacionada (multi-qa-mpnet-base-dot-v1): https://huggingface.co/zeromodels/multi-qa-mpnet-base-dot-v1
- Variante relacionada (all-distilroberta-v1): https://huggingface.co/zeromodels/all-distilroberta-v1
- Variante relacionada (all-MiniLM-L12-v2): https://huggingface.co/zeromodels/all-MiniLM-L12-v2
- Variante relacionada (multi-qa-distilbert-cos-v1): https://huggingface.co/zeromodels/multi-qa-distilbert-cos-v1
- Variante relacionada (all-MiniLM-L6-v2): https://huggingface.co/zeromodels/all-MiniLM-L6-v2
- Variante relacionada (multi-qa-MiniLM-L6-cos-v1): https://huggingface.co/zeromodels/multi-qa-MiniLM-L6-cos-v1
- Variante relacionada (paraphrase-multilingual-mpnet-base-v2): https://huggingface.co/zeromodels/paraphrase-multilingual-mpnet-base-v2
- Variante relacionada (paraphrase-multilingual-MiniLM-L12-v2): https://huggingface.co/zeromodels/paraphrase-multilingual-MiniLM-L12-v2
- Variante relacionada (paraphrase-MiniLM-L3-v2): https://huggingface.co/zeromodels/paraphrase-MiniLM-L3-v2
- Variante relacionada (distiluse-base-multilingual-cased-v1): https://huggingface.co/zeromodels/distiluse-base-multilingual-cased-v1
- Variante relacionada (distiluse-base-multilingual-cased-v2): https://huggingface.co/zeromodels/distiluse-base-multilingual-cased-v2
