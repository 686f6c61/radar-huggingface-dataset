# zeromodels/all-mpnet-base-v2

## Resumen

zeromodels/all-mpnet-base-v2 es una conversion a Keras 3 puro del checkpoint sentence-transformers/all-mpnet-base-v2, publicada por el proyecto ZeroModels. No se trata de un modelo nuevo ni de un reentrenamiento: es una reimplementacion de los pesos y del pipeline de embedding en Keras 3, pensada para poder ejecutar sentence embeddings sin depender de PyTorch ni de la libreria sentence-transformers en tiempo de inferencia. El modelo toma texto y devuelve un vector denso de 768 dimensiones.

El problema que resuelve es el de la portabilidad: al estar implementado en Keras 3, puede ejecutarse sobre los backends Torch, TensorFlow o JAX cambiando una variable de entorno, lo que facilita su integracion en stacks de ML que ya usan Keras. La receta de embedding se preserva intacta respecto al original (pooling de media, normalizacion L2 y similitud coseno como funcion de scoring), y la model card reporta una diferencia absoluta maxima de 7,82311e-08 en los embeddings frente al checkpoint de Sentence Transformers en la revision fijada.

Es relevante para equipos que necesitan busqueda semantica, deduplicacion o recuperacion de informacion en entornos Keras, y que quieren evitar la conversion manual de pesos. La longitud maxima de entrada es de 384 tokens y el repositorio ocupa 0,4 GB. El checkpoint acumula 0 descargas y 1 like en el momento de redactar esta ficha, por lo que su validacion por parte de la comunidad es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNet (encoder transformer); conversion a Keras 3 |
| Parametros totales | no disponible (la model card no lo especifica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 384 tokens de entrada como maximo |
| Tipos de cuantizacion | no disponible (solo se documentan pesos en HDF5; no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (la model card no los declara) |
| Licencia | apache-2.0 |
| Formato de pesos | model.weights.h5 (Keras 3), acompanado de zm_config.json y tokenizer.json |
| Dimensionalidad del embedding | 768 |
| Pooling | mean |
| Normalizacion | L2 (si) |
| Funcion de scoring | similitud coseno |
| Proyeccion densa adicional | ninguna |
| Repositorio | 0,4 GB |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El backbone es MPNet, un encoder transformer entrenado con modelado de lenguaje enmascarado y permutado. En esta ficha no se realiza ningun entrenamiento: la model card indica explicitamente que la conversion preserva la receta de embedding del modelo de origen y no introduce una ejecucion de entrenamiento nueva. Por tanto, la composicion del dataset, el numero de tokens vistos y las fases de ajuste (si las hubo) corresponden al checkpoint original de Sentence Transformers y no se detallan en la informacion disponible.

La innovacion tecnica aqui es exclusivamente de implementacion: los pesos se reempaquetan en un fichero HDF5 (model.weights.h5) junto a un zm_config.json y un tokenizer.json, y se cargan mediante la API SentenceTransformerModel y SentenceTransformerTokenizer de ZeroModels. La verificacion de fidelidad reportada compara la salida con Sentence Transformers en la revision fijada e8c3b32edf5434bc2275fc9bab85f82640a19130: diferencia absoluta maxima de embedding de 7,82311e-08, coseno minimo de 1,00000000 y diferencia absoluta maxima en la puntuacion de similitud de 1,78814e-07. La paridad se comprobo sobre el backend Torch; la model card no reclama paridad completa en TensorFlow ni en JAX.

## Capacidades

- Generacion de embeddings de frases y parrafos con dimensionalidad fija de 768.
- Similitud semantica entre pares de textos mediante similitud coseno.
- Busqueda semantica y recuperacion densa (retrieval) sobre colecciones de documentos indexadas por vector.
- Deduplicacion y deteccion de near-duplicates a partir de umbrales de coseno.
- Agrupamiento (clustering) y clasificacion no supervisada de textos en el espacio de embeddings.
- Extraccion de caracteristicas para clasificadores posteriores (regresion logistica, SVM, etc.).
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso ni modo thinking: es un modelo exclusivamente de representacion.
- No hay capacidades de vision, audio ni multimodalidad documentadas.
- El soporte multilingue no esta declarado en la model card; no debe asumirse.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar los fragmentos de una base de conocimiento como vectores de 768 dimensiones y recuperar por similitud coseno los mas cercanos a la consulta del usuario, superando la busqueda por palabra clave.
- Recuperacion aumentada (RAG): usar el modelo como recuperador denso en un pipeline en el que un LLM generativo consume los fragmentos mas relevantes; el encoder solo se encarga de la fase de retrieval.
- Deduplicacion de corpus: calcular embeddings de todos los documentos de un dataset y marcar como duplicados aquellos cuyo coseno supere un umbral definido por el equipo, reduciendo coste de almacenamiento y sesgo por repeticion en el entrenamiento posterior.
- Clasificacion de tickets de soporte: transformar cada ticket en un embedding y entrenar un clasificador ligero encima para enrutar por categoria o prioridad, sin necesidad de reentrenar el encoder.
- Sistemas de recomendacion de contenido: representar articulos y preferencias de usuario en el mismo espacio vectorial y ordenar candidatos por similitud coseno.
- Analisis de encuestas y feedback abierto: agrupar respuestas de texto libre por tematica mediante clustering sobre los embeddings, para detectar patrones sin etiquetado previo.
- Deteccion de parafrasis y plagio a nivel semantico: comparar pares de frases y aplicar un umbral calibrado sobre la puntuacion de similitud devuelta por model.similarity().

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, MTEB, GLUE u otros) en la informacion disponible. La model card unicamente incluye la verificacion de fidelidad de la conversion frente al checkpoint original:

| Metrica de conversion | Valor reportado |
|---|---|
| Diferencia absoluta maxima de embedding | 7,82311e-08 |
| Coseno minimo de embedding | 1,00000000 |
| Diferencia absoluta maxima en puntuacion de similitud | 1,78814e-07 |
| Revision de origen fijada | e8c3b32edf5434bc2275fc9bab85f82640a19130 |
| Backend verificado | Torch |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio completo ocupa 0,4 GB, por lo que el peso del modelo mas el tokenizer caben holgadamente en cualquier GPU de consumo actual; el consumo en inferencia depende del backend y del tamano de lote.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM. No se requieren aceleradores de gama alta tipo A100 o H100 para una carga de trabajo de embeddings convencional; se recomienda una RTX 3060 o superior para lotes grandes.
- Cabe en GPU de consumo: si, en la practica totalidad de las GPU consumer modernas, dado el tamano del repositorio.
- Opciones de despliegue: la via documentada es la libreria ZeroModels sobre Keras 3, seleccionando backend con la variable de entorno KERAS_BACKEND (Torch es el verificado). Tambien puede cargarse el checkpoint original con `SentenceTransformerModel.from_weights("hf:sentence-transformers/all-mpnet-base-v2")`. No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles. No se publican mediciones.

## Comparativa con modelos similares

La propia model card lista 13 variantes convertidas dentro del mismo proyecto. La comparacion se limita a lo que la card declara (encoder y receta); las dimensiones de embedding de las otras variantes no se especifican en la informacion disponible.

| Modelo (ZeroModels) | Encoder | Receta | Dimension | Licencia |
|---|---|---|---|---|
| all-mpnet-base-v2 | MPNet | mean + normalize | 768 | apache-2.0 |
| multi-qa-mpnet-base-dot-v1 | MPNet | CLS + producto punto | no disponible | no disponible |
| all-distilroberta-v1 | RoBERTa | mean + normalize | no disponible | no disponible |
| all-MiniLM-L12-v2 | BERT | mean + normalize | no disponible | no disponible |
| multi-qa-distilbert-cos-v1 | DistilBERT | mean + normalize | no disponible | no disponible |
| all-MiniLM-L6-v2 | BERT | mean + normalize | no disponible | no disponible |
| multi-qa-MiniLM-L6-cos-v1 | BERT | mean + normalize | no disponible | no disponible |
| paraphrase-multilingual-mpnet-base-v2 | XLM-R | mean | no disponible | no disponible |
| paraphrase-albert-small-v2 | ALBERT | mean | no disponible | no disponible |
| paraphrase-multilingual-MiniLM-L12-v2 | BERT | mean | no disponible | no disponible |
| paraphrase-MiniLM-L3-v2 | BERT | mean | no disponible | no disponible |
| distiluse-base-multilingual-cased-v1 | DistilBERT | mean + Dense | no disponible | no disponible |
| distiluse-base-multilingual-cased-v2 | DistilBERT | mean + Dense | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta chat, tool calling, agentes ni razonamiento multi-paso. Cualquier expectativa en ese sentido es incorrecta.
- No se han publicado resultados de benchmarks en la informacion disponible, por lo que no hay evidencia publica de calidad en tareas de retrieval mas alla de la fidelidad numerica frente al checkpoint original.
- La paridad de embeddings solo se verifico sobre el backend Torch; la model card no reclama paridad completa en TensorFlow ni en JAX.
- El limite de 384 tokens por entrada trunca documentos largos. Es necesario trocear el texto antes de codificarlo, lo que puede degradar la recuperacion si los fragmentos pierden contexto.
- Los idiomas soportados no estan declarados. No debe asumirse cobertura multilingue: para ese escenario la propia familia ofrece variantes basadas en XLM-R.
- Sesgos conocidos: no documentados en la informacion disponible. Al derivar de un checkpoint entrenado por terceros, hereda los sesgos de su corpus de origen, que no se describe en esta ficha.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos en similitud, es decir, emparejar textos semanticamente proximos que no son equivalentes para la tarea concreta. Requiere calibracion de umbrales.
- Licencia apache-2.0, que permite uso comercial. La model card indica que la tarjeta del modelo de origen tambien declara apache-2.0; conviene verificar la atribucion correspondiente al checkpoint original.
- Adopcion practicamente nula: 0 descargas y 1 like. No hay senales de uso en produccion ni de mantenimiento por parte de la comunidad.
- Artefactos especificos del ecosistema ZeroModels (model.weights.h5, zm_config.json). No hay pesos en safetensors ni GGUF publicados en este repositorio.
- La fecha de creacion y actualizacion indicada en HuggingFace (2026) es posterior a la del conocimiento habitual; se reproduce tal cual aparece en los metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeromodels/all-mpnet-base-v2
- Checkpoint original: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
- Revision fijada del checkpoint original: https://huggingface.co/sentence-transformers/all-mpnet-base-v2/tree/e8c3b32edf5434bc2275fc9bab85f82640a19130
- Repositorio ZeroModels en GitHub: https://github.com/IMvision12/ZeroModels
- Documentacion de Sentence Transformers en ZeroModels: https://imvision12.github.io/ZeroModels/sentence_transformer/
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes sobre este modelo: devuelven unicamente portadas y secciones del sitio de CNN, sin relacion con el checkpoint.
