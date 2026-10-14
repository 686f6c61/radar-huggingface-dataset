# zeromodels/distiluse-base-multilingual-cased-v1

## Resumen

zeromodels/distiluse-base-multilingual-cased-v1 es una conversión a Keras 3 puro del checkpoint sentence-transformers/distiluse-base-multilingual-cased-v1, publicada por el proyecto ZeroModels (IMvision12). No se trata de un modelo nuevo ni de un reentrenamiento: es la misma receta de embeddings del modelo original, portada a pesos Keras 3 para poder ejecutar similitud semántica sin depender del stack de PyTorch y transformers. El modelo codifica texto en vectores de 512 dimensiones usando un backbone DistilBERT con pooling de media y una proyección densa con activación tanh.

La relevancia de esta ficha es de integración más que de investigación: permite usar un encoder multilingüe clásico de frases dentro de aplicaciones que ya trabajan con Keras 3, seleccionando backend (Torch verificado, TensorFlow y JAX no garantizados). Los embeddings no se normalizan L2 por defecto y la función de puntuación prevista es la similitud coseno, con una longitud máxima de entrada de 128 tokens, lo que lo sitúa en el terreno de frases y pasajes cortos, no de documentos largos.

El repositorio ocupa 0,5 GB y contiene tres artefactos: model.weights.h5, zm_config.json y tokenizer.json. El autor declara una verificación numérica contra Sentence Transformers en la revisión fijada del checkpoint original, con una diferencia absoluta máxima de embeddings de 8,80137e-05 y un coseno mínimo de 0,99999982, lo que respalda la fidelidad de la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DistilBERT + pooling de media + proyección densa (tanh) de 512 dimensiones |
| Parametros totales | no disponible (no declarado en la informacion proporcionada) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128 tokens (longitud de truncado del tokenizador original) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en HDF5, sin variantes GGUF/AWQ/GPTQ documentadas) |
| Idiomas soportados | no disponibles; la etiqueta del repositorio es "multilingual" (el modelo base cubre 50+ idiomas segun su origen, dato no confirmado en esta ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras 3 HDF5 (model.weights.h5), mas tokenizer.json y zm_config.json |
| Dimension del embedding | 512 |
| Normalizacion L2 | no |
| Funcion de puntuacion | similitud coseno |
| Tamano del repositorio | 0,5 GB |
| Libreria de ejecucion | zeromodels (Keras 3) |
| Modelo base | sentence-transformers/distiluse-base-multilingual-cased-v1 |
| Revision del origen | 826fee3d516ebb14987355af373f5b69101c7006 |

## Arquitectura y entrenamiento

La arquitectura es un encoder DistilBERT (variante destilada de BERT, sin cabeza de clasificacion) que produce representaciones contextuales token a token. Sobre esas representaciones se aplica un pooling de media para obtener un vector de frase, seguido de una proyeccion densa de 512 dimensiones con activacion tanh. El resultado son embeddings de 512 dimensiones que no se normalizan L2 y que estan pensados para compararse mediante similitud coseno, tal como declara la model card.

No hay entrenamiento nuevo: la conversion preserva la receta de embeddings del checkpoint fuente y solo cambia el formato de pesos y el runtime. El autor indica que la paridad se comprobo contra Sentence Transformers en la revision fijada 826fee3d516ebb14987355af373f5b69101c7006, con una diferencia absoluta maxima de embeddings de 8,80137e-05, un coseno minimo entre embeddings de 0,99999982 y una diferencia absoluta maxima de puntuaciones de similitud de 6,05211e-05. La paridad se valido sobre el backend Torch de Keras; no se reclama paridad completa en TensorFlow ni en JAX.

El tokenizador debe tomarse del mismo repositorio que el modelo, ya que conserva la longitud de truncado de 128 tokens del checkpoint fuente. La carga del checkpoint original sin pesos Keras convertidos es posible mediante `SentenceTransformerModel.from_weights("hf:sentence-transformers/distiluse-base-multilingual-cased-v1")`.

## Capacidades

- Generacion de embeddings de frases y pasajes cortos en vectores densos de 512 dimensiones.
- Calculo de similitud semantica entre textos mediante similitud coseno (`model.similarity()`).
- Codificacion por lotes: `model.encode(texts, tokenizer=tokenizer)` acepta una lista de textos y devuelve una matriz de forma (n, 512).
- Normalizacion opcional a vectores unitarios pasando `normalize=True` a `encode`, con la advertencia del autor de que esto altera la receta original y puede cambiar las puntuaciones de recuperacion.
- Capacidad multilingue segun la etiqueta del repositorio, heredada del checkpoint original; no se detalla la lista de idiomas.
- No es un modelo generativo: no produce texto, no hace razonamiento multi-paso, no soporta tool calling ni function calling, no tiene modo thinking, no procesa vision ni audio y no implementa agentes.
- No incluye atencion lineal, decodificacion especulativa ni mecanicas de SSM/hibridas; es un encoder transformer estandar.

## Casos de uso

- Busqueda semantica sobre corpus documentales: indexar los fragmentos en vectores de 512 dimensiones y recuperar por similitud coseno. Es adecuado por la naturaleza multilingue del encoder y su coste de computo bajo, aunque el limite de 128 tokens obliga a trocear los documentos en pasajes cortos.
- Recuperacion aumentada (RAG): usar el modelo como encoder de consultas y de chunks para alimentar un LLM generativo. La ventaja es poder ejecutar el encoder dentro de un pipeline Keras 3 ya existente, sin anadir dependencias de PyTorch.
- Deduplicacion y agrupamiento de textos: calcular la matriz de similitudes de un conjunto de titulares, descripciones o tickets y aplicar clustering o umbrales para detectar duplicados y near-duplicates.
- Deteccion de parafrasis y similitud de frases: comparar pares de oraciones cortas, tarea para la que el checkpoint distiluse fue disenado originalmente, con una ventana de 128 tokens suficiente para frases.
- Clasificacion de texto con pocas etiquetas: congelar el encoder y entrenar un clasificador lineal o una regla de vecinos mas cercanos sobre los embeddings, util para categorizacion de tickets, intenciones o temas.
- Moderacion y filtrado por similitud: comparar mensajes entrantes contra una lista de patrones problematicos previamente embebidos, usando similitud coseno como senal de alerta previa a una revision humana.
- Recomendacion de contenido: representar articulos, productos o publicaciones como vectores y recomendar por cercania semantica respecto al historial del usuario.
- Triaje multilingue en atencion al cliente: agrupar consultas equivalentes escritas en idiomas distintos para enrutarlas a la cola adecuada, apoyandose en la cobertura multilingue del checkpoint base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MTEB, MMLU, HumanEval ni equivalentes. Los unicos datos numericos publicados son las metricas de verificacion de la conversion frente al checkpoint original:

| Metrica de verificacion | Valor |
|---|---|
| Diferencia absoluta maxima de embeddings | 8,80137e-05 |
| Coseno minimo entre embeddings (conversion vs. origen) | 0,99999982 |
| Diferencia absoluta maxima de puntuaciones de similitud | 6,05211e-05 |
| Revision del checkpoint fuente comparada | 826fee3d516ebb14987355af373f5b69101c7006 |
| Backend verificado | Torch (Keras 3) |

## Requisitos de hardware

- Peso del repositorio: 0,5 GB en formato HDF5, lo que sugiere un modelo del orden de 125 millones de parametros en float32; la cifra exacta de parametros no esta declarada en la informacion disponible.
- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del repositorio, unas pocas unidades de GB de VRAM son suficientes y la inferencia en CPU es perfectamente viable para lotes moderados. Cualquier estimacion mas precisa seria especulativa.
- GPU recomendadas: no disponibles en la informacion proporcionada. Dado el tamano del modelo, una GPU de gama media o incluso consumer moderna deberia bastar holgadamente, pero no hay datos de rendimiento publicados que lo confirmen.
- Cabe en GPU consumer: si, con alta probabilidad, dado el tamano del repositorio; el autor no publica requisitos minimos.
- Opciones de despliegue: Keras 3 con la libreria zeromodels (`KERAS_BACKEND` debe fijarse antes de importar Keras o ZeroModels), o bien Sentence Transformers cargando el checkpoint original. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos y no a este formato de pesos.
- Latencia y throughput: no disponibles. La model card no publica mediciones de latencia ni de frases por segundo.

## Comparativa con modelos similares

El propio proyecto ZeroModels publica 13 variantes convertidas a Keras 3, todas cargables con `from_weights("zeromodels/<variante>")`. La tabla siguiente reproduce las recetas declaradas por el autor; las dimensiones de embedding de las demas variantes no estan disponibles.

| Variante | Encoder y receta |
|---|---|
| distiluse-base-multilingual-cased-v1 (esta) | DistilBERT, mean + Dense, 512 dims, sin normalizar |
| distiluse-base-multilingual-cased-v2 | DistilBERT, mean + Dense |
| all-mpnet-base-v2 | MPNet, mean + normalize |
| multi-qa-mpnet-base-dot-v1 | MPNet, CLS + producto escalar |
| all-distilroberta-v1 | RoBERTa, mean + normalize |
| all-MiniLM-L12-v2 | BERT, mean + normalize |
| multi-qa-distilbert-cos-v1 | DistilBERT, mean + normalize |
| all-MiniLM-L6-v2 | BERT, mean + normalize |
| multi-qa-MiniLM-L6-cos-v1 | BERT, mean + normalize |
| paraphrase-multilingual-mpnet-base-v2 | XLM-R, mean |
| paraphrase-albert-small-v2 | ALBERT, mean |
| paraphrase-multilingual-MiniLM-L12-v2 | BERT, mean |
| paraphrase-MiniLM-L3-v2 | BERT, mean |

Frente al checkpoint original (sentence-transformers/distiluse-base-multilingual-cased-v1), la diferencia relevante es el runtime: el original requiere PyTorch y la libreria sentence-transformers, mientras que esta conversion funciona con Keras 3 y pesos HDF5, con paridad numerica verificada en backend Torch. No se dispone de datos de rendimiento comparado (MTEB u otros) para establecer que variante es mejor en tareas concretas.

## Limitaciones y advertencias

- Limitacion de longitud: la ventana de entrada es de 128 tokens. Textos mas largos se truncan, lo que degrada la calidad del embedding para documentos, parrafos largos o conversaciones multi-turno.
- Embeddings sin normalizar: por defecto los vectores no tienen longitud unitaria. Si se activa `normalize=True`, el propio autor advierte que se modifica la receta original y pueden cambiar las puntuaciones de recuperacion.
- No es un modelo generativo: no puede redactar, resumir, traducir ni mantener conversaciones. Cualquier caso de uso que requiera generacion necesita un LLM adicional.
- Paridad limitada por backend: la verificacion se hizo en Torch. No se reclama paridad completa en TensorFlow ni en JAX, por lo que cambiar de backend puede introducir discrepancias.
- Tokenizador acoplado: debe usarse el tokenizador del mismo repositorio; mezclarlo con otro tokenizador rompe la correspondencia con los pesos.
- Idiomas no declarados: aunque la etiqueta indique "multilingual", no se detalla la lista de idiomas ni su cobertura real. Conviene validar el castellano con un conjunto propio antes de produccion.
- Sesgos: al ser una conversion del checkpoint original sin reentrenamiento, hereda integramente los sesgos de genero, raza, religion y origen cultural de los datos con los que se entreno DistilBERT multilingual y del ajuste posterior con pares de frases. La model card no documenta analisis de sesgo.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto), pero si existe riesgo de falsos positivos en similitud, es decir, pares de frases con significado distinto puntuados como muy similares.
- Madurez y validacion de la comunidad: el repositorio registra 0 descargas y 0 likes, y no hay resultados de benchmarks publicados. No hay validacion externa de su comportamiento en produccion.
- Licencia: Apache 2.0, que permite uso comercial y modificacion con las obligaciones habituales de atribucion y conservacion del aviso de licencia. El checkpoint original tambien declara Apache 2.0.
- Fechas del repositorio: la ficha de HuggingFace indica creacion el 2026-10-13 y actualizacion el 2026-10-13; conviene verificar el estado actual del repositorio antes de depender de el.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeromodels/distiluse-base-multilingual-cased-v1
- Checkpoint original: https://huggingface.co/sentence-transformers/distiluse-base-multilingual-cased-v1
- Revision fijada del checkpoint original: https://huggingface.co/sentence-transformers/distiluse-base-multilingual-cased-v1/tree/826fee3d516ebb14987355af373f5b69101c7006
- Repositorio ZeroModels en GitHub: https://github.com/IMvision12/ZeroModels
- Documentacion de Sentence Transformers en ZeroModels: https://imvision12.github.io/ZeroModels/sentence_transformer/
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
