# zeromodels/multi-qa-MiniLM-L6-cos-v1

## Resumen

zeromodels/multi-qa-MiniLM-L6-cos-v1 es una conversion a Keras 3 del checkpoint sentence-transformers/multi-qa-MiniLM-L6-cos-v1, publicada por el proyecto ZeroModels (autor zeromodels). No se trata de un modelo nuevo ni de un reentrenamiento: es una reimplementacion de los pesos originales en formato Keras 3 para poder ejecutar sentence embeddings dentro del ecosistema ZeroModels. El modelo transforma texto en vectores de 384 dimensiones usando un backbone BERT de tipo MiniLM-L6, con pooling de media, normalizacion L2 y similitud coseno como funcion de scoring.

La relevancia de esta ficha es doble. Por un lado, el modelo subyacente es un encoder de recuperacion de informacion (retrieval) disenado para question answering, lo que lo hace util en pipelines de busqueda semantica, RAG y deduplicacion de textos. Por otro, esta version concreta aporta valor a quien trabaja con Keras 3 y quiere cargar los pesos sin depender de PyTorch/Sentence Transformers, siempre que acepte las limitaciones del paquete ZeroModels (paridad verificada solo en backend Torch, licencia no declarada y ausencia de documentacion de idiomas).

El repositorio pesa aproximadamente 0,1 GB y contiene tres ficheros: model.weights.h5, zm_config.json y tokenizer.json. La conversion declara una diferencia absoluta maxima de embeddings de 1,11759e-07 y una similitud coseno minima de 1,00000000 frente al checkpoint original, lo que indica una paridad numerica muy alta con la fuente en la revision fijada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (backbone MiniLM-L6, encoder transformer) |
| Parametros totales | no disponible en la ficha del autor; corresponde a la arquitectura MiniLM-L6-H384 del checkpoint original (en torno a 22,7 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (truncacion heredada del modelo fuente) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen sin cuantizar |
| Idiomas soportados | no disponibles (la model card no los declara) |
| Licencia | no disponible; la model card advierte que el modelo original no declara licencia y recomienda comprobar los derechos de redistribucion |
| Formato de pesos | Keras 3 (model.weights.h5), mas zm_config.json y tokenizer.json |
| Dimension del embedding | 384 |
| Pooling | media (mean) |
| Normalizacion | L2 (si) |
| Funcion de scoring | similitud coseno |
| Proyeccion densa | ninguna |
| Modelo base | sentence-transformers/multi-qa-MiniLM-L6-cos-v1 |
| Revision original fijada | b207367332321f8e44f96e224ef15bc607f4dbf0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT con backbone MiniLM-L6, es decir, seis capas con representacion oculta de 384 dimensiones. La receta de embedding es pooling de media sobre las representaciones de tokens, sin capa densa adicional, seguida de normalizacion L2. La puntuacion de similitud se calcula con producto escalar sobre vectores normalizados, lo que equivale a similitud coseno. La longitud maxima de entrada es de 512 tokens, conservada desde el checkpoint fuente.

Esta publicacion no introduce ningun entrenamiento nuevo. Segun la propia model card, la conversion "preserva la receta de embedding del modelo fuente; no introduce una nueva ejecucion de entrenamiento". Por lo tanto, los datos de entrenamiento, el numero de tokens y el posible uso de RLHF/DPO son los del checkpoint original sentence-transformers/multi-qa-MiniLM-L6-cos-v1, cuyo detalle no se reproduce en el repositorio de zeromodels y debe consultarse en su model card. La innovacion tecnica de esta version es la reimplementacion en Keras 3 (paquete ZeroModels) con verificacion de paridad numerica: diferencia absoluta maxima de embeddings de 1,11759e-07, coseno minimo de 1,00000000 y diferencia absoluta maxima de la puntuacion de similitud de 1,78814e-07. La paridad se comprobo exclusivamente sobre el backend Torch de Keras; no se reclama paridad completa en TensorFlow ni en JAX.

## Capacidades

- Generacion de embeddings de texto: convierte frases o pasajes en vectores densos de 384 dimensiones.
- Similitud semantica: calcula similitud coseno entre pares de textos mediante model.similarity().
- Recuperacion de informacion (retrieval): pensado para tareas de question answering y busqueda semantica, segun el modelo fuente.
- Procesamiento de entradas de hasta 512 tokens por texto.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No tiene modo "thinking", vision ni audio.
- Soporte multilingue: no declarado en la informacion disponible.

## Casos de uso

- Busqueda semantica sobre documentacion tecnica: indexar pasajes de hasta 512 tokens como vectores de 384 dimensiones y recuperar los mas cercanos por similitud coseno ante una consulta del usuario.
- Recuperacion aumentada por generacion (RAG): usar el modelo como retriever denso que alimente a un LLM generativo con los fragmentos mas relevantes de una base de conocimiento.
- Deduplicacion de contenidos: comparar embeddings de articulos, tickets o registros para detectar textos casi identicos mediante umbral de similitud coseno.
- Clasificacion por vecinos mas cercanos: etiquetar consultas de soporte agrupandolas por similitud con ejemplos ya etiquetados, sin reentrenar el encoder.
- Sistemas de preguntas y respuestas sobre FAQ: emparejar la pregunta del usuario con la entrada de FAQ mas parecida del corpus, aprovechando que el modelo fuente fue ajustado para question answering.
- Filtrado y moderacion de textos: detectar mensajes muy similares a patrones conocidos comparando sus embeddings contra un conjunto de referencia.
- Integracion en stacks Keras 3: equipos que ya trabajan con Keras pueden cargar los pesos con SentenceTransformerModel.from_weights(repo) y evitar dependencias de PyTorch en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento reportada es la verificacion de paridad con el checkpoint original en la revision fijada:

| Metrica de verificacion | Valor |
|---|---|
| Diferencia absoluta maxima de embeddings | 1,11759e-07 |
| Similitud coseno minima frente al original | 1,00000000 |
| Diferencia absoluta maxima de la puntuacion de similitud | 1,78814e-07 |

## Requisitos de hardware

- VRAM estimada: con arquitectura MiniLM-L6-H384 (en torno a 22,7 millones de parametros), los pesos ocupan aproximadamente 91 MB en FP32 y unos 45 MB en FP16. Es un modelo de muy baja huella de memoria.
- GPU recomendadas: cualquier GPU moderna es suficiente. Se puede ejecutar en RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad; tambien cabe holgadamente en GPU integradas y en CPU.
- Consumer GPU: si, cabe en practicamente cualquier GPU de consumo e incluso en inferencia por CPU para cargas moderadas.
- Opciones de despliegue: Keras 3 con backend Torch mediante el paquete ZeroModels (SentenceTransformerModel / SentenceTransformerTokenizer). La carga exacta del modelo fuente puede hacerse con SentenceTransformerModel.from_weights("hf:sentence-transformers/multi-qa-MiniLM-L6-cos-v1"). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La propia model card lista las 13 variantes convertidas por ZeroModels. A continuacion se comparan algunas de la misma familia de sentence transformers. Los parametros y contextos de las alternativas se indican solo cuando la informacion disponible los menciona; en caso contrario figuran como no disponibles.

| Modelo | Encoder y receta | Dimension | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zeromodels/multi-qa-MiniLM-L6-cos-v1 | BERT MiniLM-L6 · media + normalizacion | 384 | 512 tokens | no disponible | ZeroModels (Keras 3) |
| zeromodels/multi-qa-distilbert-cos-v1 | DistilBERT · media + normalizacion | no disponible | no disponible | no disponible | ZeroModels (Keras 3) |
| zeromodels/multi-qa-mpnet-base-dot-v1 | MPNet · CLS + producto escalar | no disponible | no disponible | no disponible | ZeroModels (Keras 3) |
| zeromodels/all-MiniLM-L6-v2 | BERT MiniLM-L6 · media + normalizacion | no disponible | no disponible | no disponible | ZeroModels (Keras 3) |

La diferencia clave entre multi-qa-MiniLM-L6-cos-v1 y all-MiniLM-L6-v2 es el objetivo de ajuste: el primero esta orientado a recuperacion de question answering y el segundo a similitud semantica generica. multi-qa-mpnet-base-dot-v1 usa un encoder MPNet de mayor tamano y scoring por producto escalar, mientras que multi-qa-distilbert-cos-v1 emplea DistilBERT. No se dispone de cifras de rendimiento comparadas en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: la model card indica explicitamente que el modelo original no declara licencia y recomienda comprobar los derechos de redistribucion antes de usar o redistribuir los pesos. Sin licencia clara, el uso comercial queda en una situacion juridica ambigua.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue; no se debe asumir soporte fuera del ingles sin verificacion previa.
- Paridad limitada por backend: la verificacion numerica se realizo solo sobre el backend Torch de Keras. No se reclama paridad completa en TensorFlow ni en JAX, por lo que los resultados pueden diferir en esos backends.
- No es un modelo generativo: solo produce embeddings; cualquier tarea de generacion requiere combinarlo con otro modelo.
- Longitud maxima de 512 tokens: los textos mas largos se truncan, lo que puede degradar la calidad de la representacion en documentos extensos.
- Dependencia de la receta de embedding: activar normalize=True cuando el checkpoint ya esta normalizado modifica la receta original y puede alterar las puntuaciones de retrieval.
- Riesgo de alucinacion: no aplica en sentido generativo, pero si existe riesgo de falsos positivos en recuperacion (pasajes similares pero irrelevantes).
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; al ser un encoder entrenado sobre corpus de question answering, puede heredar sesgos del dataset original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion ni mantenimiento comunitario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeromodels/multi-qa-MiniLM-L6-cos-v1
- Checkpoint original: https://huggingface.co/sentence-transformers/multi-qa-MiniLM-L6-cos-v1
- Revision original fijada: https://huggingface.co/sentence-transformers/multi-qa-MiniLM-L6-cos-v1/tree/b207367332321f8e44f96e224ef15bc607f4dbf0
- Repositorio ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentacion de sentence transformers en ZeroModels: https://imvision12.github.io/ZeroModels/sentence_transformer/
