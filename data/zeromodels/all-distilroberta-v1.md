# zeromodels/all-distilroberta-v1

## Resumen

zeromodels/all-distilroberta-v1 es una conversion a Keras 3 del checkpoint sentence-transformers/all-distilroberta-v1, publicada por el usuario zeromodels dentro del proyecto ZeroModels. No es un modelo generativo: es un encoder de frases (sentence embedding) que transforma texto en vectores densos de 768 dimensiones, con pooling de tipo mean, normalizacion L2 y similitud coseno como funcion de scoring. El problema que resuelve es el de la busqueda semantica, el clustering y la comparacion de similitud entre textos dentro del ecosistema Keras.

La relevancia de esta ficha es acotada y muy concreta: se trata de un artefacto de portabilidad. El autor no ha reentrenado nada, sino que ha reproducido la receta de embeddings del checkpoint original en pesos Keras (`model.weights.h5`), acompanados de `zm_config.json` y `tokenizer.json`. Esto permite cargar el modelo con `from_weights()` desde la libreria ZeroModels sin depender del stack de PyTorch/Sentence Transformers, siempre que se fije el backend de Keras antes de importar.

El modelo base es un DistilRoBERTa con pooling mean, sin proyeccion densa adicional, longitud maxima de entrada de 512 tokens y una licencia Apache 2.0 heredada del checkpoint original. El repositorio ocupa 0.3 GB y no registra descargas ni likes en el momento de la consulta. La verificacion de paridad declarada por el autor es muy alta: diferencia absoluta maxima de embeddings de 8.19564e-08 y similitud coseno minima de 1.00000000 frente al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (backbone declarado como `roberta`); sin proyeccion densa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud maxima de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras HDF5 (`model.weights.h5`); configuracion en `zm_config.json`; tokenizador en `tokenizer.json` |
| Dimension de embedding | 768 |
| Pooling | mean |
| Normalizacion | L2 (si) |
| Funcion de scoring | similitud coseno |
| Libreria | zeromodels (Keras 3) |
| Tamano del repositorio | 0.3 GB |
| Checkpoint de origen | sentence-transformers/all-distilroberta-v1 (revision 842eaed40bee4d61673a81c92d5689a8fed7a09f) |

## Arquitectura y entrenamiento

La arquitectura corresponde al backbone RoBERTa del checkpoint sentence-transformers/all-distilroberta-v1. La receta de embeddings es pooling mean sobre las representaciones del encoder, sin capa densa de proyeccion, seguida de normalizacion L2. La puntuacion entre vectores se realiza por similitud coseno. La tarjeta indica explicitamente que la conversion "preserva la receta de embeddings del modelo fuente; no introduce un nuevo entrenamiento", por lo que no hay datos sobre numero de tokens de entrenamiento, composicion del dataset ni fases de RLHF/DPO en este repositorio.

La innovacion tecnica de esta publicacion no esta en el modelo sino en el formato: pesos en Keras 3 cargables con `SentenceTransformerModel.from_weights()` y `SentenceTransformerTokenizer.from_weights()`. La verificacion de equivalencia frente a Sentence Transformers se realizo en la revision fijada del checkpoint original y reporta una diferencia absoluta maxima de embeddings de 8.19564e-08, un coseno minimo de 1.00000000 y una diferencia absoluta maxima de puntuaciones de similitud de 2.98023e-07. La paridad se comprobo sobre el backend Torch de Keras; el autor no reclama paridad completa en TensorFlow ni en JAX.

## Capacidades

- Generacion de embeddings de frases y parrafos de 768 dimensiones.
- Calculo de similitud semantica entre textos mediante similitud coseno.
- Recuperacion semantica (retrieval) por vecindad vectorial.
- Agrupamiento (clustering) y deteccion de duplicados o near-duplicates sobre vectores.
- Clasificacion de texto y analisis de similitud como tarea derivada, usando los embeddings como caracteristicas.
- Carga en Keras 3 con backend Torch, con tokenizador propio empaquetado en el repositorio.
- Truncado controlado a 512 tokens por el tokenizador del mismo repositorio.
- No dispone de generacion de texto, tool calling, capacidades de agente, vision ni audio; no es un modelo de chat.
- Capacidad multilingue: no declarada en este repositorio (no disponible).

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar los fragmentos de una base de conocimiento como vectores de 768 dimensiones y recuperar los mas cercanos a la consulta del usuario por similitud coseno, con truncado a 512 tokens por fragmento.
- Deduplicacion de tickets de soporte: codificar cada ticket y agrupar por umbral de coseno para fusionar incidencias repetidas antes de asignarlas a colas de atencion.
- Recomendacion de contenido por similitud: comparar el embedding del articulo que un usuario esta leyendo con los del catalogo y ordenar por similitud coseno.
- Etiquetado automatico y enrutado de correo: usar los embeddings como caracteristicas de entrada a un clasificador ligero para asignar categoria o departamento.
- Filtrado de parafrasis y plagio en pipelines editoriales: emparejar pares de frases y marcar aquellos cuya similitud supere un umbral configurable.
- Integracion en aplicaciones que ya usan Keras 3: al estar en formato Keras, el modelo puede embeberse en un grafo Keras existente sin introducir una dependencia de PyTorch en el servicio.
- Evaluacion rapida de calidad de retrieval en prototipos: al ser un checkpoint pequeno (repositorio de 0.3 GB), permite montar una linea base de similitud en CPU durante la fase de experimentacion.
- Cache de respuestas semanticas: si la consulta entrante supera un umbral de coseno respecto a una consulta ya resuelta, reutilizar la respuesta almacenada en lugar de invocar un modelo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MTEB, MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato cuantitativo declarado es la verificacion de paridad con el checkpoint original:

| Metrica de paridad | Valor declarado |
|---|---|
| Diferencia absoluta maxima de embeddings | 8.19564e-08 |
| Similitud coseno minima de embeddings | 1.00000000 |
| Diferencia absoluta maxima de puntuaciones de similitud | 2.98023e-07 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, el repositorio completo ocupa 0.3 GB, por lo que la inferencia en float32 deberia situarse en el rango de 1 GB o menos; es una estimacion derivada del tamano del repositorio, no un dato publicado.
- GPU recomendadas: no disponibles. Cualquier GPU con al menos 2 GB de memoria deberia ser suficiente para inferencia en precision completa, dado el tamano del artefacto.
- GPU de consumo: si, se espera que quepa en practicamente cualquier GPU de consumo con unos pocos GB de VRAM, y tambien en CPU para lotes pequenos o moderados.
- Opciones de despliegue: la via documentada por el autor es Keras 3 con la libreria ZeroModels (`SentenceTransformerModel.from_weights`), fijando `KERAS_BACKEND=torch` antes de importar Keras. Para cargar el checkpoint original sin los pesos convertidos existe `from_weights("hf:sentence-transformers/all-distilroberta-v1")`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un encoder de embeddings de este tipo.
- Latencia y throughput: no disponibles. No se publican medidas de latencia por lote ni de embeddings por segundo.

## Comparativa con modelos similares

La propia tarjeta lista las 13 variantes convertidas del proyecto ZeroModels. Se comparan tres alternativas de la misma familia de sentence embeddings, con los datos declarados en esa tabla; los campos no declarados se marcan como no disponibles.

| Modelo | Encoder | Receta | Dimension | Licencia | Disponible en ZeroModels |
|---|---|---|---|---|---|
| zeromodels/all-distilroberta-v1 | RoBERTa | mean + normalize | 768 | Apache 2.0 (heredada) | Si (Keras 3) |
| zeromodels/all-mpnet-base-v2 | MPNet | mean + normalize | no disponible | no disponible en la informacion | Si (Keras 3) |
| zeromodels/all-MiniLM-L6-v2 | BERT | mean + normalize | no disponible | no disponible en la informacion | Si (Keras 3) |
| sentence-transformers/all-distilroberta-v1 (original) | RoBERTa | mean + normalize | 768 | Apache 2.0 | No (formato Sentence Transformers/PyTorch) |

Nota: la comparativa de rendimiento frente a estas alternativas no puede establecerse, ya que no se han publicado resultados de benchmarks en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso. Cualquier uso como asistente conversacional es un error de categoria.
- Limite duro de 512 tokens de entrada; los textos mas largos se truncan, con la consiguiente perdida de informacion semantica.
- Idiomas soportados no declarados en este repositorio. Antes de usarlo en produccion multilingue hay que verificar el comportamiento real sobre el idioma objetivo.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo para este artefacto ni para su checkpoint de origen en la informacion proporcionada.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de recuperacion irrelevante cuando la similitud coseno se interpreta con umbrales mal calibrados.
- Paridad comprobada unicamente sobre el backend Torch de Keras. El autor no reclama paridad completa en TensorFlow ni en JAX, por lo que cambiar de backend puede alterar los embeddings.
- Si se pasa `normalize=True` a `model.encode(...)` en un checkpoint que ya esta normalizado, se modifica la receta de embeddings original y pueden cambiar las puntuaciones de retrieval.
- Uso del tokenizador: debe tomarse del mismo repositorio que los pesos; mezclar tokenizadores rompe la correspondencia con el truncado de 512 tokens.
- Licencia Apache 2.0, que permite uso comercial, pero la tarjeta advierte de que la licencia se hereda del checkpoint original; conviene revisar la cadena de atribucion antes de redistribuir.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las fechas de creacion y actualizacion son de octubre de 2026. Esto sugiere un artefacto reciente y sin validacion independiente por parte de la comunidad.
- Idoneidad para produccion: al no haber benchmarks publicos, la eleccion de este modelo frente a alternativas de sentence embeddings deberia basarse en una evaluacion propia sobre el dominio objetivo.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/zeromodels/all-distilroberta-v1
- Repositorio del proyecto ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentacion de Sentence Transformers en ZeroModels: https://imvision12.github.io/ZeroModels/sentence_transformer/
- Checkpoint original: https://huggingface.co/sentence-transformers/all-distilroberta-v1
- Revision fijada del checkpoint original: https://huggingface.co/sentence-transformers/all-distilroberta-v1/tree/842eaed40bee4d61673a81c92d5689a8fed7a09f
- Variante all-mpnet-base-v2: https://huggingface.co/zeromodels/all-mpnet-base-v2
- Variante multi-qa-mpnet-base-dot-v1: https://huggingface.co/zeromodels/multi-qa-mpnet-base-dot-v1
- Variante all-MiniLM-L12-v2: https://huggingface.co/zeromodels/all-MiniLM-L12-v2
- Variante multi-qa-distilbert-cos-v1: https://huggingface.co/zeromodels/multi-qa-distilbert-cos-v1
- Variante all-MiniLM-L6-v2: https://huggingface.co/zeromodels/all-MiniLM-L6-v2
- Variante multi-qa-MiniLM-L6-cos-v1: https://huggingface.co/zeromodels/multi-qa-MiniLM-L6-cos-v1
- Variante paraphrase-multilingual-mpnet-base-v2: https://huggingface.co/zeromodels/paraphrase-multilingual-mpnet-base-v2
- Variante paraphrase-albert-small-v2: https://huggingface.co/zeromodels/paraphrase-albert-small-v2
- Variante paraphrase-multilingual-MiniLM-L12-v2: https://huggingface.co/zeromodels/paraphrase-multilingual-MiniLM-L12-v2
- Variante paraphrase-MiniLM-L3-v2: https://huggingface.co/zeromodels/paraphrase-MiniLM-L3-v2
- Variante distiluse-base-multilingual-cased-v1: https://huggingface.co/zeromodels/distiluse-base-multilingual-cased-v1
- Variante distiluse-base-multilingual-cased-v2: https://huggingface.co/zeromodels/distiluse-base-multilingual-cased-v2

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los resultados obtenidos correspondian a contenidos de senderismo en Seine-et-Marne sin relacion con el artefacto.
