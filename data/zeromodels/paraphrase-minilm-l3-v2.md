# zeromodels/paraphrase-MiniLM-L3-v2

## Resumen

zeromodels/paraphrase-MiniLM-L3-v2 es una conversion a Keras 3 del checkpoint sentence-transformers/paraphrase-MiniLM-L3-v2, publicada por el proyecto ZeroModels. No es un modelo nuevo ni un reentrenamiento: reproduce la receta de embeddings del modelo original (backbone BERT, pooling de media, vectores de 384 dimensiones, similitud coseno) en pesos nativos de Keras, de forma que se pueda ejecutar embeddings de frases sin depender de PyTorch ni de la libreria sentence-transformers.

El modelo resuelve la tarea de sentence-similarity y text-embeddings: transforma texto en vectores densos de 384 dimensiones que permiten medir similitud semantica entre frases. Su backbone es un BERT MiniLM-L3 (variante compacta de la familia MiniLM) con una longitud maxima de entrada de 128 tokens, lo que lo situa en el segmento de modelos de embeddings ligeros.

Es relevante para desarrolladores que ya trabajan con el ecosistema Keras 3 y quieren incorporar busqueda semantica, deduplicacion o clustering de texto dentro de un pipeline Keras, con un peso de repositorio de aproximadamente 0,1 GB y licencia Apache 2.0. La conversion declara paridad numerica verificada frente al checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (MiniLM-L3) |
| Parametros totales | no disponible |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras HDF5 (model.weights.h5), tokenizer.json, zm_config.json |
| Dimension de embedding | 384 |
| Pooling | mean |
| Proyeccion densa | ninguna |
| Normalizacion L2 | no |
| Funcion de scoring | similitud coseno |
| Modelo base | sentence-transformers/paraphrase-MiniLM-L3-v2 (revision 4ca70771034acceecb2e72475f72050fcdde4ddc) |

## Arquitectura y entrenamiento

La arquitectura es un transformer tipo BERT con backbone MiniLM-L3, pooling por media de los embeddings de token, sin capa densa de proyeccion adicional y sin normalizacion L2 sobre la salida. El vector resultante tiene 384 dimensiones y la funcion de scoring prevista es la similitud coseno. La longitud maxima de entrada se mantiene en 128 tokens, igual que en el checkpoint de origen.

Este repositorio no introduce un entrenamiento nuevo: es una conversion pura a Keras 3 que preserva la receta de embeddings del modelo fuente. La model card reporta una verificacion de paridad frente a Sentence Transformers en la revision fijada, con una diferencia absoluta maxima de embedding de 2,98023e-07, un coseno minimo entre embeddings de 0,99999994 y una diferencia absoluta maxima de la puntuacion de similitud de 2,38419e-07. Los detalles de entrenamiento (datos, tokens, composicion del dataset, uso de RLHF o DPO) corresponden al modelo original y no se detallan en la informacion disponible.

## Capacidades

- Generacion de embeddings de frases y parrafos cortos en vectores de 384 dimensiones.
- Calculo de similitud semantica entre textos mediante similitud coseno.
- Deteccion de parafrasis y textos semanticamente equivalentes.
- Soporte de busqueda semantica y recuperacion de informacion por similitud vectorial.
- Clustering y deduplicacion de textos a partir de sus representaciones vectoriales.
- Funcionamiento dentro del ecosistema Keras 3, con backend configurable (paridad comprobada en el backend Torch; no se declara paridad completa en TensorFlow ni JAX).
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es un modelo exclusivamente de embeddings.

## Casos de uso

- Busqueda semantica interna: indexar documentos o articulos como vectores de 384 dimensiones y recuperar los mas similares a una consulta mediante similitud coseno, integrable en un pipeline Keras sin dependencias de PyTorch.
- Deteccion de duplicados y near-duplicates: comparar embeddings de registros de una base de datos para agrupar entradas redundantes en tareas de limpieza de datos.
- Clustering de tickets de soporte: agrupar consultas de usuarios por similitud semantica para enrutarlas al equipo adecuado o construir temas recurrentes.
- Moderacion y agrupacion de comentarios: agrupar mensajes con significado equivalente para reducir el volumen de revision manual.
- Recomendacion de contenido: sugerir articulos, productos o publicaciones similares a uno dado comparando embeddings de sus descripciones.
- Evaluacion de parafrasis en pipelines de NLP: puntuar la similitud entre pares de frases para control de calidad de traducciones o resumenes.
- Preprocesado para RAG ligero: generar embeddings de fragmentos cortos (menos de 128 tokens) para alimentar un recuperador antes de pasar el contexto a un LLM generativo.
- Deduplicacion de datasets de entrenamiento: identificar ejemplos repetidos o casi identicos antes de entrenar otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento reportada es la verificacion de paridad numerica frente al checkpoint original (diferencia absoluta maxima de embedding de 2,98023e-07, coseno minimo de 0,99999994 y diferencia absoluta maxima de la puntuacion de similitud de 2,38419e-07).

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida, del orden de unos cientos de MB en fp32 y menos de 1 GB en cualquier configuracion habitual, dado que el repositorio completo ocupa aproximadamente 0,1 GB.
- Cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4090 o equivalentes, y tambien puede ejecutarse en CPU para cargas moderadas.
- GPU de centro de datos (A100, H100) no son necesarias para este modelo; solo tendrian sentido para servir volumen muy alto de peticiones.
- Opciones de despliegue: al ser un modelo Keras 3, se ejecuta a traves de las utilidades de ZeroModels; para alternativas equivalentes en el mismo checkpoint, se puede recurrir a sentence-transformers o a exportaciones a ONNX u otros formatos no incluidos en este repositorio.
- El repositorio no expone ficheros GGUF ni cuantizaciones, por lo que no esta pensado para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Backbone | Pooling y scoring | Normalizacion | Dimension | Contexto | Licencia |
|---|---|---|---|---|---|---|
| zeromodels/paraphrase-MiniLM-L3-v2 | BERT (MiniLM-L3) | mean + coseno | no | 384 | 128 tokens | Apache 2.0 |
| zeromodels/all-MiniLM-L6-v2 | BERT (MiniLM-L6) | mean + coseno | si | no disponible | no disponible | Apache 2.0 |
| zeromodels/all-mpnet-base-v2 | MPNet | mean + coseno | si | no disponible | no disponible | Apache 2.0 |
| zeromodels/multi-qa-MiniLM-L6-cos-v1 | BERT (MiniLM-L6) | mean + coseno | si | no disponible | no disponible | Apache 2.0 |

Los tres modelos de comparacion pertenecen a la misma serie de conversiones de ZeroModels y son alternativas de embeddings del mismo tipo. paraphrase-MiniLM-L3-v2 es la variante mas ligera de las cuatro (3 capas frente a 6 o 12), mientras que all-mpnet-base-v2 apunta a mayor calidad con un backbone mas pesado. Los datos de parametros, dimension de embedding y contexto de las alternativas no se detallan en la informacion disponible salvo para el modelo tratado.

## Limitaciones y advertencias

- Limitado a tareas de embeddings: no genera texto, no razona y no hace tool calling; no debe confundirse con un LLM.
- Ventana de contexto corta: solo 128 tokens de entrada, por lo que textos mas largos deben truncarse o dividirse, con perdida de informacion.
- Sin normalizacion L2: los embeddings no son de longitud unitaria. Si se activa normalize=True en model.encode, se modifica la receta original y pueden variar las puntuaciones de recuperacion; hay que ser coherente con el uso previsto.
- Idiomas soportados no disponibles: al ser una conversion del modelo en ingles del ecosistema sentence-transformers, es previsible un rendimiento limitado fuera del ingles, aunque no se confirma en la informacion proporcionada.
- Paridad verificada solo en el backend Torch de Keras; no se declara paridad completa en TensorFlow ni en JAX.
- Sesgos: no disponibles en la informacion proporcionada; hereda los posibles sesgos del checkpoint original de sentence-transformers.
- Riesgo de alucinacion no aplica a generacion, pero si puede producir similitudes enganosas en textos largos por el truncado a 128 tokens.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar la atribucion al checkpoint original de sentence-transformers.
- Adopcion practicamente nula: el repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad ni con soporte documentado mas alla de la model card.
- Fecha de creacion poco habitual (2026-10-13) segun los metadatos del repositorio; conviene verificar la vigencia antes de integrarlo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zeromodels/paraphrase-MiniLM-L3-v2
- Checkpoint original: https://huggingface.co/sentence-transformers/paraphrase-MiniLM-L3-v2
- Revision fijada del checkpoint original: https://huggingface.co/sentence-transformers/paraphrase-MiniLM-L3-v2/tree/4ca70771034acceecb2e72475f72050fcdde4ddc
- Repositorio GitHub de ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentacion de ZeroModels para Sentence Transformers: https://imvision12.github.io/ZeroModels/sentence_transformer/
