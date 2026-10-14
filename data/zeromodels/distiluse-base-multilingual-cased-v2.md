# zeromodels/distiluse-base-multilingual-cased-v2

## Resumen

`zeromodels/distiluse-base-multilingual-cased-v2` es una conversion pura a Keras 3 del checkpoint `sentence-transformers/distiluse-base-multilingual-cased-v2`, publicada por el proyecto ZeroModels. No se trata de un modelo generativo ni de un entrenamiento nuevo: es una reimplementacion de los pesos originales para poder ejecutar el codigo de sentence embeddings directamente sobre Keras 3, sin depender de la libreria `sentence-transformers`. El modelo codifica texto en vectores de 512 dimensiones usando un backbone DistilBERT multilingue.

El problema que resuelve es de infraestructura mas que de modelado: permite integrar embeddings de frases multilingues en stacks que ya usan Keras 3 (con backend Torch, TensorFlow o JAX) y exportar el grafo a otros runtimes, manteniendo la receta de embedding del modelo original. La conversion esta verificada numericamente contra el checkpoint fuente en la revision fijada `bfe45d0732ca50787611c0fe107ba278c7f3f889`.

Sus caracteristicas clave son: pooling de tipo mean sobre las salidas del encoder, una proyeccion densa de 512 dimensiones con activacion tanh, embeddings sin normalizacion L2 y funcion de scoring basada en similitud coseno. La longitud maxima de entrada es de 128 tokens, lo que lo situa en el rango de codificacion de frases y parrafos cortos, no de documentos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DistilBERT (backbone `distilbert`) con pooling mean y proyeccion densa de 512 dimensiones (tanh) |
| Parametros totales | No disponible en la informacion proporcionada; el backbone DistilBERT multilingue base ronda los 135 M de parametros, dato no confirmado en la ficha del repositorio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens de entrada como maximo (longitud de truncado heredada del checkpoint original) |
| Tipos de cuantizacion | No disponible; el repositorio solo distribuye pesos en HDF5 (`model.weights.h5`), sin variantes GGUF, INT8 ni FP16 publicadas |
| Idiomas soportados | Multilingue (etiqueta `multilingual`); la lista concreta de idiomas no esta disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | HDF5 (`model.weights.h5`) acompanado de `zm_config.json` y `tokenizer.json`; no se distribuyen safetensors ni GGUF |
| Dimension de embedding | 512 |
| Pooling | Mean |
| Normalizacion L2 | No |
| Funcion de scoring | Similitud coseno |
| Libreria / runtime | Keras 3 via `zeromodels` (`SentenceTransformerModel`, `SentenceTransformerTokenizer`) |
| Tamano del repositorio | 0,5 GB |
| Checkpoint original | `sentence-transformers/distiluse-base-multilingual-cased-v2`, revision `bfe45d0732ca50787611c0fe107ba278c7f3f889` |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer DistilBERT multilingue, es decir, una version destilada del BERT multilingue con menos capas que el modelo original. Sobre la salida del encoder se aplica un pooling de media de los tokens y, a continuacion, una proyeccion densa que reduce o transforma la representacion a un vector de 512 dimensiones con activacion tanh. Los embeddings resultantes no se normalizan, por lo que el propio autor recomienda usar similitud coseno como funcion de scoring. El tokenizador conserva la longitud de truncado de 128 tokens del checkpoint de origen.

No hubo entrenamiento ni ajuste adicional: la model card indica explicitamente que la conversion preserva la receta de embedding del modelo fuente y que no introduce una nueva ejecucion de entrenamiento. Por tanto, los datos de entrenamiento, el numero de tokens, la composicion del dataset y el uso de tecnicas como RLHF o DPO no estan disponibles en la informacion proporcionada y deben consultarse en la model card original del checkpoint `sentence-transformers`. La innovacion tecnica del repositorio es la reimplementacion en Keras 3 y su verificacion de paridad: la diferencia absoluta maxima de embeddings respecto a Sentence Transformers es de `0,000112148`, la similitud coseno minima entre embeddings es de `0,99999982` y la diferencia absoluta maxima en la puntuacion de similitud es de `5,72074e-05`.

Un detalle relevante de implementacion es que la paridad se verifico unicamente con el backend Torch de Keras; el autor no reclama paridad completa con TensorFlow ni con JAX. Ademas, `KERAS_BACKEND` debe fijarse antes de importar Keras o ZeroModels, y el tokenizador debe cargarse siempre del mismo repositorio que el modelo.

## Capacidades

- Codificacion de texto a vectores densos de 512 dimensiones para frases cortas y parrafos de hasta 128 tokens.
- Similitud semantica entre pares de textos mediante similitud coseno.
- Recuperacion semantica (retrieval) por similitud en espacios vectoriales, adecuada para indexado en bases de datos vectoriales.
- Comportamiento multilingue heredado del checkpoint original, con la limitacion de que la lista exacta de idiomas no esta documentada en este repositorio.
- Normalizacion opcional de embeddings (`normalize=True` en `encode`), con la advertencia de que altera la receta original y puede modificar las puntuaciones de recuperacion.
- Ejecucion multiplataforma sobre Keras 3 con backends Torch, TensorFlow o JAX (paridad verificada solo en Torch).
- No soporta generacion de texto: no es un modelo causal de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Busqueda semantica multilingue en documentacion tecnica: indexar fragmentos de hasta 128 tokens y recuperar por similitud coseno sobre embeddings de 512 dimensiones, lo que permite consultas en un idioma y documentos en otro.
- Deduplicacion y agrupamiento de tickets de soporte: generar embeddings de descripciones de incidencias y agrupar por similitud para detectar problemas repetidos y reducir el volumen de tickets manuales.
- Recuperacion aumentada (RAG) en pipelines ligeros: actuar como retriever sobre una base vectorial cuando el presupuesto de computo es limitado, dado que el modelo es pequeno y puede ejecutarse en CPU.
- Clasificacion de intenciones por similitud: representar cada intencion con frases de referencia y asignar la etiqueta mas cercana por similitud coseno, sin necesidad de entrenar un clasificador adicional.
- Sistemas de recomendacion basados en contenido: vectorizar titulos o descripciones de articulos y calcular vecinos mas cercanos para sugerir elementos similares.
- Deteccion de parafrasis y control de calidad de traducciones: comparar pares de frases con la funcion de similitud del modelo para puntuar equivalencia semantica.
- Moderacion y filtrado semantico: comparar mensajes entrantes con una lista de patrones problematicos representados como embeddings.
- Analisis exploratorio de corpus: proyectar y agrupar embeddings para visualizar la estructura tematica de un conjunto de textos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica metrica cuantitativa aportada corresponde a la verificacion de fidelidad de la conversion frente a Sentence Transformers en la revision fijada:

| Metrica de verificacion | Valor |
|---|---|
| Diferencia absoluta maxima de embeddings | 0,000112148 |
| Similitud coseno minima entre embeddings | 0,99999982 |
| Diferencia absoluta maxima en la puntuacion de similitud | 5,72074e-05 |
| Backend de Keras usado en la verificacion | Torch |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el repositorio ocupa 0,5 GB y un encoder DistilBERT base con proyeccion densa de 512 dimensiones suele requerir del orden de 0,5-1 GB en FP32 y la mitad en FP16, incluyendo activaciones para lotes pequenos.
- GPU recomendadas: no se especifican en la informacion proporcionada. Por tamano, cualquier GPU con 2 GB o mas de memoria es suficiente; tambien es viable en GPU integradas.
- Cabe en GPU de consumo: si. Modelos como GTX 1650, RTX 3060, RTX 4090 o equivalentes cubren el modelo con holgura, incluso con lotes grandes.
- Inferencia en CPU: viable y habitual para este tipo de encoder, dado el tamano reducido y la longitud maxima de 128 tokens.
- Opciones de despliegue: la via documentada es Keras 3 mediante `zeromodels` (`SentenceTransformerModel.from_weights` y `SentenceTransformerTokenizer.from_weights`). Para el checkpoint original sin convertir puede usarse `SentenceTransformerModel.from_weights("hf:sentence-transformers/distiluse-base-multilingual-cased-v2")` o la libreria `sentence-transformers`.
- Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible. Son runners orientados a modelos generativos y el repositorio no publica pesos en GGUF ni safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Todos los modelos comparables listados a continuacion pertenecen a la misma familia de conversiones a Keras 3 de ZeroModels, lo que permite una comparacion directa de receta de embedding. Los datos de dimension de embedding, licencia y tamano de los modelos alternativos no estan disponibles en la informacion proporcionada.

| Modelo | Encoder | Pooling | Normalizacion | Scoring |
|---|---|---|---|---|
| `zeromodels/distiluse-base-multilingual-cased-v2` | DistilBERT | Mean | No | Similitud coseno |
| `zeromodels/distiluse-base-multilingual-cased-v1` | DistilBERT | Mean + Dense | No disponible | No disponible |
| `zeromodels/paraphrase-multilingual-MiniLM-L12-v2` | BERT | Mean | No | No disponible |
| `zeromodels/paraphrase-multilingual-mpnet-base-v2` | XLM-R | Mean | No | No disponible |
| `zeromodels/multi-qa-distilbert-cos-v1` | DistilBERT | Mean | Si | No disponible |
| `zeromodels/all-MiniLM-L6-v2` | BERT | Mean | Si | No disponible |

Criterio de eleccion orientativo segun la receta publicada: `distiluse-base-multilingual-cased-v2` es la opcion de esta familia con proyeccion densa a 512 dimensiones y sin normalizacion; `multi-qa-distilbert-cos-v1` y `all-MiniLM-L6-v2` aplican normalizacion, lo que simplifica el uso con indices vectoriales basados en producto interno; `paraphrase-multilingual-mpnet-base-v2` emplea XLM-R como encoder, con un coste computacional previsiblemente mayor. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona de forma explicita y no admite tool calling ni flujos de agente.
- Longitud de contexto muy limitada: 128 tokens. Los textos mas largos se truncan, lo que degrada la representacion de documentos extensos y obliga a trocearlos previamente.
- Embeddings no normalizados por diseno. Usar distancia euclidea o producto interno sin normalizar previamente puede dar puntuaciones distintas de las esperadas; el autor advierte de que `normalize=True` altera la receta original.
- Paridad verificada solo con el backend Torch de Keras. No se reclama paridad completa con TensorFlow ni JAX, por lo que conviene validar metricas propias si se cambia de backend.
- Riesgo de sesgos: el repositorio no documenta evaluaciones de sesgo ni de equidad. Al ser una conversion del checkpoint original, hereda los sesgos presentes en los datos de entrenamiento de dicho checkpoint, que no se detallan en esta informacion.
- Riesgo de falsos positivos en similitud: la similitud coseno en espacios de embeddings puede puntuar alto textos con solapamiento lexico pero significado distinto, especialmente en dominios muy especificos (juridico, medico, tecnico).
- Idiomas: aunque el modelo esta etiquetado como multilingue, la lista de idiomas soportados y la calidad relativa por idioma no estan disponibles; se recomienda validar con datos propios antes de desplegar en produccion.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del checkpoint original y de las dependencias de Keras y ZeroModels en el contexto de despliegue.
- Cero descargas y cero interacciones registradas en el momento de la consulta, lo que implica escasa validacion por parte de la comunidad sobre esta conversion concreta.
- Dependencia de la libreria `zeromodels` y de Keras 3; requiere fijar `KERAS_BACKEND` antes de importar y usar el tokenizador del mismo repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeromodels/distiluse-base-multilingual-cased-v2
- Checkpoint original: https://huggingface.co/sentence-transformers/distiluse-base-multilingual-cased-v2
- Revision fijada del checkpoint original: https://huggingface.co/sentence-transformers/distiluse-base-multilingual-cased-v2/tree/bfe45d0732ca50787611c0fe107ba278c7f3f889
- Repositorio ZeroModels en GitHub: https://github.com/IMvision12/ZeroModels
- Documentacion de Sentence Transformer en ZeroModels: https://imvision12.github.io/ZeroModels/sentence_transformer/
- Variante v1: https://huggingface.co/zeromodels/distiluse-base-multilingual-cased-v1
- Variante `paraphrase-multilingual-MiniLM-L12-v2`: https://huggingface.co/zeromodels/paraphrase-multilingual-MiniLM-L12-v2
- Variante `paraphrase-multilingual-mpnet-base-v2`: https://huggingface.co/zeromodels/paraphrase-multilingual-mpnet-base-v2
- Variante `multi-qa-distilbert-cos-v1`: https://huggingface.co/zeromodels/multi-qa-distilbert-cos-v1
- Variante `all-MiniLM-L6-v2`: https://huggingface.co/zeromodels/all-MiniLM-L6-v2
- Variante `all-MiniLM-L12-v2`: https://huggingface.co/zeromodels/all-MiniLM-L12-v2
- Variante `all-mpnet-base-v2`: https://huggingface.co/zeromodels/all-mpnet-base-v2
- Variante `all-distilroberta-v1`: https://huggingface.co/zeromodels/all-distilroberta-v1
- Variante `multi-qa-mpnet-base-dot-v1`: https://huggingface.co/zeromodels/multi-qa-mpnet-base-dot-v1
- Variante `multi-qa-MiniLM-L6-cos-v1`: https://huggingface.co/zeromodels/multi-qa-MiniLM-L6-cos-v1
- Variante `paraphrase-albert-small-v2`: https://huggingface.co/zeromodels/paraphrase-albert-small-v2
- Variante `paraphrase-MiniLM-L3-v2`: https://huggingface.co/zeromodels/paraphrase-MiniLM-L3-v2
