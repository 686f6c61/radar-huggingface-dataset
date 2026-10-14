# zeromodels/multi-qa-distilbert-cos-v1

## Resumen

`zeromodels/multi-qa-distilbert-cos-v1` es una conversion pura a **Keras 3** del checkpoint `sentence-transformers/multi-qa-distilbert-cos-v1`, publicada por el proyecto ZeroModels (repositorio de IMvision12). No es un modelo nuevo ni un reentrenamiento: reproduce la receta de embeddings del modelo original sobre un backbone **DistilBERT**, con pooling de tipo *mean*, embeddings **L2-normalizados** de **768 dimensiones** y similitud coseno como funcion de scoring. El objetivo es permitir la ejecucion de sentence embeddings dentro del ecosistema Keras 3 (backend Torch, TensorFlow o JAX) sin depender de la libreria `sentence-transformers`.

El modelo resuelve tareas de similitud semantica y recuperacion de informacion: codifica texto en vectores de 768 dimensiones comparables mediante producto escalar o coseno. Su nombre indica que la version de origen fue afinada para *multi-qa*, es decir, para ranking de pasajes en tareas de question answering, aunque la model card de esta conversion no detalla el dataset de afinado original.

Es relevante ahora porque forma parte de un paquete de 13 variantes convertidas a Keras 3 (`all-mpnet-base-v2`, `all-MiniLM-L6-v2`, `multi-qa-mpnet-base-dot-v1`, etc.), lo que facilita integrar embeddings en stacks basados en Keras/JAX/TF. Sus cifras de adopcion en HuggingFace son de **0 descargas y 0 likes**, y el repositorio ocupa 0,3 GB, lo que indica un artefacto reciente y practicamente sin uso registrado en la plataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DistilBERT (backbone `distilbert`) |
| Parametros totales | no disponible en la informacion proporcionada (DistilBERT base tiene ~66 M, dato de la arquitectura original no confirmado aqui) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud maxima de entrada) |
| Tipos de cuantizacion | no disponible (pesos en HDF5 con `model.weights.h5`; no se declaran variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el checkpoint de origen es *uncased* y no declara lista de idiomas) |
| Licencia | no disponible; la model card original no declara licencia y se advierte de que hay que comprobar los derechos de redistribucion |
| Formato de pesos | Keras 3 en HDF5: `model.weights.h5` + `zm_config.json` + `tokenizer.json` |
| Dimension de embedding | 768 |
| Pooling | mean |
| Normalizacion | L2 (si) |
| Funcion de scoring | similitud coseno |
| Proyeccion densa | ninguna |
| Modelo de origen | `sentence-transformers/multi-qa-distilbert-cos-v1` |
| Revision de origen fijada | `bc2339dca6eba2b116cc7c2cfa06f63e4ff87e3f` |
| Libreria | `zeromodels` (Keras 3) |
| Pipeline | `sentence-similarity` |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un encoder **DistilBERT** (variante destilada de BERT, de tipo transformer bidireccional) al que se aplica pooling **mean** sobre las representaciones de los tokens para obtener un unico vector por secuencia. Ese vector se normaliza con norma L2 y se compara mediante similitud coseno. No hay capa de proyeccion densa adicional, y la longitud maxima de entrada es de **512 tokens**. Al tratarse de una conversion, no existe un entrenamiento nuevo: la model card indica explicitamente que "la conversion preserva la receta de embeddings del modelo fuente; no introduce un nuevo entrenamiento".

El autor no documenta en esta ficha el numero de tokens, la composicion del dataset ni si hubo RLHF/DPO del checkpoint original; toda esa informacion se remite a la model card de `sentence-transformers/multi-qa-distilbert-cos-v1`. Lo que si se documenta es la **verificacion de paridad** frente a Sentence Transformers en la revision fijada: diferencia absoluta maxima de embeddings de **0,000373073**, coseno minimo entre embeddings de **0,99999702** y diferencia absoluta maxima en la puntuacion de similitud de **0,000217676**. La paridad se comprobo en el backend **Torch** de Keras; no se reclama paridad completa con TensorFlow ni con JAX.

## Capacidades

- Generacion de embeddings de frases y parrafos en vectores densos de 768 dimensiones.
- Similitud semantica entre pares de textos mediante coseno (metodo `model.similarity()`).
- Busqueda semantica y recuperacion de pasajes (*retrieval*), uso previsto del checkpoint de origen multi-qa.
- Ranking de pasajes candidatos para question answering sobre un corpus dado.
- Agrupamiento (clustering) y deduplicacion semantica a partir de distancias entre embeddings.
- Extraccion de caracteristicas para clasificacion downstream sobre representaciones congeladas.
- Soporte de `normalize=True` en `model.encode(...)` para checkpoints que no vengan normalizados (advirtiendo de que altera la receta original).
- **No** es un modelo generativo: no produce texto, no tiene modo *thinking*, no soporta tool calling, function calling, agentes, vision ni audio.
- Capacidades multilingues: no declaradas en la informacion disponible.

## Casos de uso

- Busqueda semantica sobre documentacion tecnica: indexar manuales y articulos como vectores de 768 dimensiones y recuperar los fragmentos mas cercanos a una consulta en lenguaje natural, sin depender de coincidencia lexica.
- Question answering sobre corpus propio: usar el modelo para rankear pasajes candidatos antes de pasarlos a un modelo generativo, aprovechando que el checkpoint de origen esta afinado en datos multi-qa.
- Deduplicacion de tickets de soporte: agrupar incidencias con embeddings y umbral de coseno para fusionar duplicados y reducir carga de colas de atencion.
- Moderacion y filtrado semantico: comparar mensajes entrantes contra una lista de patrones de referencia y marcar los que superen un umbral de similitud.
- Sistema de recomendacion de contenido: representar items y consultas del usuario en el mismo espacio vectorial para recuperar articulos, productos o cursos afines.
- Clustering exploratorio de encuestas o resenas: generar embeddings de respuestas abiertas y aplicar k-means para descubrir temas recurrentes sin etiquetado previo.
- Integracion en stacks Keras 3 / JAX / TensorFlow: al exponer los pesos en `model.weights.h5` y un `tokenizer.json`, el modelo se puede cargar con `SentenceTransformerModel.from_weights(repo)` cuando el pipeline ya esta construido sobre Keras.
- Evaluacion de parafrasis: comparar pares de frases para detectar reescrituras, util en control de calidad de traduccion o generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, MTEB, etc.) en la informacion disponible. Lo unico verificable son las metricas de paridad de la conversion frente al checkpoint de origen:

| Metrica de verificacion (frente a Sentence Transformers, revision fijada) | Valor |
|---|---|
| Diferencia absoluta maxima entre embeddings | 0,000373073 |
| Coseno minimo entre embeddings | 0,99999702 |
| Diferencia absoluta maxima en la puntuacion de similitud | 0,000217676 |

## Requisitos de hardware

- El repositorio ocupa 0,3 GB en disco, coherente con un encoder DistilBERT de ~66 M de parametros; se trata de un modelo pequeno en terminos de inferencia (la cifra exacta de parametros no se declara en la ficha).
- Estimacion orientativa (no verificada en la informacion proporcionada): en torno a 250-300 MB de VRAM en fp32 y 130-150 MB en fp16 para los pesos, mas el coste de activaciones, que depende del lote y de la longitud de secuencia hasta 512 tokens.
- Cabe con holgura en GPUs de consumo: cualquier GPU con 4 GB o mas (por ejemplo, RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo; tambien es viable en CPU para cargas moderadas de indexado.
- GPU de centro de datos (A100, H100) solo tienen sentido para indexado masivo por lotes, no por requisitos de memoria.
- Despliegue: la via documentada es `zeromodels` sobre Keras 3, con `SentenceTransformerModel.from_weights(repo)` y `KERAS_BACKEND` fijado antes de importar (paridad comprobada en el backend Torch). Para cargar el checkpoint original sin los pesos convertidos existe `SentenceTransformerModel.from_weights("hf:sentence-transformers/multi-qa-distilbert-cos-v1")`. En la informacion disponible no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Las alternativas mas directas son las otras variantes del mismo paquete de conversion y el checkpoint sin convertir. Los datos de rendimiento, licencia e idiomas no estan declarados en la informacion disponible salvo donde se indica.

| Modelo | Encoder y receta | Dimension | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `zeromodels/multi-qa-distilbert-cos-v1` | DistilBERT, mean + normalize, coseno | 768 | 512 tokens | no disponible | no disponible | Keras 3 (este repositorio, 0 descargas) |
| `zeromodels/multi-qa-mpnet-base-dot-v1` | MPNet, CLS + producto escalar | no disponible | no disponible | no disponible | no disponible | Keras 3, misma familia ZeroModels |
| `zeromodels/multi-qa-MiniLM-L6-cos-v1` | BERT, mean + normalize | no disponible | no disponible | no disponible | no disponible | Keras 3, misma familia ZeroModels |
| `sentence-transformers/multi-qa-distilbert-cos-v1` | DistilBERT, mean + normalize, coseno | 768 | 512 tokens | no disponible | no declarada | Formato original de Sentence Transformers |

Nota: los datos de parametros, contexto y licencia de las variantes no aparecen en la informacion proporcionada mas alla de lo indicado en la tabla de variantes de la model card.

## Limitaciones y advertencias

- **Licencia no declarada**: la model card del checkpoint de origen no declara licencia y la ficha de conversion advierte explicitamente de que hay que comprobar los derechos de redistribucion antes de usar o redistribuir los pesos. Esto bloquea, en la practica, su uso comercial sin una revision legal previa.
- No es un modelo generativo: no produce texto ni responde preguntas por si mismo; solo genera embeddings y puntuaciones de similitud.
- Limite duro de **512 tokens** por secuencia, heredado del checkpoint de origen; los textos mas largos se truncan con ese limite.
- Idiomas soportados no declarados; el backbone del checkpoint de origen es *uncased*, lo que tipicamente implica entrenamiento sobre texto en ingles, pero esto no se confirma en la informacion disponible.
- Paridad de embeddings verificada **solo en el backend Torch** de Keras; no se reclama paridad completa en TensorFlow ni en JAX.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos o falsos negativos en la similitud semantica, con umbrales de coseno que deben calibrarse por dominio.
- Sesgos: no se documenta ninguna evaluacion de sesgo en la informacion disponible.
- Adopcion practicamente nula (0 descargas, 0 likes) y repositorio creado en octubre de 2026; no hay evidencia de uso en produccion.
- Cambiar `normalize=True` en `model.encode(...)` altera la receta de embeddings original y puede modificar las puntuaciones de recuperacion.
- Para produccion, conviene evaluar el checkpoint original de Sentence Transformers antes de adoptar la conversion, dado que la propia ficha remite a el para cualquier dato de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeromodels/multi-qa-distilbert-cos-v1
- Checkpoint de origen: https://huggingface.co/sentence-transformers/multi-qa-distilbert-cos-v1
- Revision fijada del checkpoint de origen: https://huggingface.co/sentence-transformers/multi-qa-distilbert-cos-v1/tree/bc2339dca6eba2b116cc7c2cfa06f63e4ff87e3f
- Repositorio ZeroModels en GitHub: https://github.com/IMvision12/ZeroModels
- Documentacion de ZeroModels para sentence transformers: https://imvision12.github.io/ZeroModels/sentence_transformer/
- Variante `zeromodels/all-mpnet-base-v2`: https://huggingface.co/zeromodels/all-mpnet-base-v2
- Variante `zeromodels/multi-qa-mpnet-base-dot-v1`: https://huggingface.co/zeromodels/multi-qa-mpnet-base-dot-v1
- Variante `zeromodels/all-distilroberta-v1`: https://huggingface.co/zeromodels/all-distilroberta-v1
- Variante `zeromodels/all-MiniLM-L12-v2`: https://huggingface.co/zeromodels/all-MiniLM-L12-v2
- Variante `zeromodels/all-MiniLM-L6-v2`: https://huggingface.co/zeromodels/all-MiniLM-L6-v2
- Variante `zeromodels/multi-qa-MiniLM-L6-cos-v1`: https://huggingface.co/zeromodels/multi-qa-MiniLM-L6-cos-v1
- Variante `zeromodels/paraphrase-multilingual-mpnet-base-v2`: https://huggingface.co/zeromodels/paraphrase-multilingual-mpnet-base-v2
- Variante `zeromodels/paraphrase-albert-small-v2`: https://huggingface.co/zeromodels/paraphrase-albert-small-v2
- Variante `zeromodels/paraphrase-multilingual-MiniLM-L12-v2`: https://huggingface.co/zeromodels/paraphrase-multilingual-MiniLM-L12-v2
- Variante `zeromodels/paraphrase-MiniLM-L3-v2`: https://huggingface.co/zeromodels/paraphrase-MiniLM-L3-v2
- Variante `zeromodels/distiluse-base-multilingual-cased-v1`: https://huggingface.co/zeromodels/distiluse-base-multilingual-cased-v1
- Variante `zeromodels/distiluse-base-multilingual-cased-v2`: https://huggingface.co/zeromodels/distiluse-base-multilingual-cased-v2

Nota: los resultados de la busqueda web recibidos no guardan relacion con el modelo y se han descartado por no ser fuentes tecnicas validas.
