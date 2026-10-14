# zeromodels/all-MiniLM-L6-v2

## Resumen

zeromodels/all-MiniLM-L6-v2 es una conversion a Keras 3 del checkpoint de embeddings de frases sentence-transformers/all-MiniLM-L6-v2, publicada por el usuario zeromodels dentro del proyecto ZeroModels (repositorio IMvision12/ZeroModels). No es un modelo nuevo ni un reentrenamiento: es una reimplementacion de los pesos originales en Keras 3 que reproduce exactamente la receta de embeddings del modelo fuente, que usa un backbone BERT con pooling de media sobre las representaciones de tokens.

El modelo resuelve la tarea de generar embeddings de frases de 384 dimensiones, normalizados L2 y pensados para compararse mediante similitud coseno. Su proposito es ofrecer una via de ejecucion de sentence-transformers nativa en Keras 3 (por ejemplo con backend Torch) sin depender de la libreria original, manteniendo la paridad numerica con el checkpoint fuente.

Es relevante para desarrolladores que trabajan en busqueda semantica, recuperacion de informacion, clustering y deduplicacion textual, y que quieren integrar embeddings en un stack Keras 3. Al tratarse de un modelo MiniLM-L6 (backbone ligero de 6 capas segun la nomenclatura del checkpoint), esta orientado a inferencia rapida y despliegue en hardware modesto, con una longitud maxima de entrada de 256 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (backbone `bert`) con pooling de media |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de entrada) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | `model.weights.h5` (Keras 3), acompanado de `zm_config.json` y `tokenizer.json` |
| Dimension de embedding | 384 |
| Normalizacion | L2 aplicada (si) |
| Funcion de scoring | similitud coseno |
| Modelo base | sentence-transformers/all-MiniLM-L6-v2 |
| Revision del modelo base | 1110a243fdf4706b3f48f1d95db1a4f5529b4d41 |
| Libreria | zeromodels (Keras 3) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT con pooling de media (mean pooling) sobre la salida del encoder y sin capa de proyeccion densa posterior. El vector resultante tiene 384 dimensiones y se normaliza L2, de modo que la similitud coseno entre dos embeddings equivale al producto escalar de vectores unitarios. La longitud maxima de entrada es de 256 tokens y el tokenizador incluido preserva ese limite de truncado del checkpoint fuente.

El modelo no incluye un entrenamiento nuevo. Segun la model card, la conversion es una reimplementacion en Keras 3 de los pesos originales que "preserva la receta de embeddings del modelo fuente" y no introduce una ejecucion de entrenamiento nueva. Por tanto, no hay datos sobre composicion del dataset, numero de tokens, ni etapas de RLHF/DPO en la informacion proporcionada (habria que consultar la model card original de sentence-transformers/all-MiniLM-L6-v2). La innovacion tecnica destacable es la propia conversion: la verificacion reportada indica una diferencia absoluta maxima de embeddings de 8,9407e-08, un coseno minimo de 1,00000000 y una diferencia absoluta maxima en el score de similitud de 1,19209e-07 respecto a Sentence Transformers en la revision fijada.

## Capacidades

- Generacion de embeddings de frases: codifica texto en vectores de 384 dimensiones.
- Similitud semantica: `model.similarity()` calcula similitud coseno entre embeddings, replicando el comportamiento del modelo fuente.
- Normalizacion L2 opcional: se puede pasar `normalize=True` a `model.encode(...)` para obtener vectores unitarios (advirtiendo que esto altera la receta original).
- Busqueda semantica y recuperacion: util para indexar y recuperar documentos por cercania vectorial.
- Clustering y deduplicacion de textos: agrupacion de frases por distancia en el espacio de embeddings.
- Ejecucion nativa en Keras 3 con backend seleccionable; la paridad de embeddings se verifico en el backend Torch (no se reclama paridad completa en TensorFlow/JAX).
- No es un modelo generativo: no produce texto, no soporta tool calling, ni agentes, ni modo de razonamiento, ni vision o audio.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Busqueda semantica sobre corpus documental: codificar consultas y documentos con `model.encode(...)` y recuperar los mas cercanos por similitud coseno, aprovechando la normalizacion L2 y los 384 dimensiones para indices vectoriales ligeros.
- Deduplicacion de registros: agrupar titulos o parrafos casi identicos comparando sus embeddings y aplicando un umbral de similitud coseno, util en limpieza de datasets.
- Clustering de feedback de usuarios: convertir quejas o comentarios en embeddings y agruparlos para detectar temas recurrentes sin etiquetado previo.
- Sistemas de recomendacion basados en contenido: representar items y preferencias en el mismo espacio vectorial de 384 dimensiones para calcular afinidad.
- Filtrado y clasificacion rapida: usar los embeddings como caracteristicas de entrada a un clasificador ligero (regresion logistica, SVM) en pipelines de moderacion o enrutado.
- Integracion en aplicaciones Keras 3: ejecutar el modelo dentro de un stack Keras existente con backend Torch, evitando dependencias de la libreria sentence-transformers original.
- Componente de pipelines RAG: generar representaciones densas para un recuperador en sistemas de pregunta-respuesta sobre documentos, con la ventaja de un coste computacional bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye metricas de verificacion de la conversion (fidelidad numerica respecto al checkpoint fuente):

| Metrica de verificacion | Valor |
|---|---|
| Diferencia absoluta maxima de embeddings | 8,9407e-08 |
| Coseno minimo de embeddings | 1,00000000 |
| Diferencia absoluta maxima del score de similitud | 1,19209e-07 |

## Requisitos de hardware

- VRAM estimada: el tamano del repositorio es de 0,1 GB, por lo que el modelo ocupa muy poca memoria; la VRAM requerida para inferencia es minima (inferior a 1 GB en la mayoria de configuraciones).
- GPU recomendadas: cualquier GPU moderna es suficiente; cabe con holgura en A100, H100, RTX 4090 y GPUs de gama media.
- GPU de consumo: si cabe en GPUs de consumo, incluidas las de gama baja y media, dado el tamano reducido del checkpoint.
- CPU: es viable la ejecucion en CPU para lotes pequenos o medianos.
- Opciones de despliegue: el formato de pesos es Keras 3 (`model.weights.h5`), por lo que el despliegue natural es a traves de la libreria zeromodels; no se documentan en la informacion proporcionada rutas de despliegue via vLLM, llama.cpp, Ollama o TGI (estos estan orientados a modelos generativos, no a encoders de embeddings).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La model card lista las 13 variantes convertidas en ZeroModels. Comparativa con las alternativas mas cercanas de la misma familia:

| Modelo | Encoder y receta | Dimension de embedding | Longitud maxima | Licencia |
|---|---|---|---|---|
| zeromodels/all-MiniLM-L6-v2 | BERT, mean + normalize | 384 | 256 tokens | apache-2.0 |
| zeromodels/all-MiniLM-L12-v2 | BERT, mean + normalize | no disponible | no disponible | no disponible en la informacion proporcionada |
| zeromodels/all-mpnet-base-v2 | MPNet, mean + normalize | no disponible | no disponible | no disponible en la informacion proporcionada |
| zeromodels/paraphrase-MiniLM-L3-v2 | BERT, mean | no disponible | no disponible | no disponible en la informacion proporcionada |

Nota: los datos de parametros, contexto y licencia de las variantes alternativas no se detallan en la informacion proporcionada; solo se indica su encoder y receta de pooling/normalizacion.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no sirve para generar texto, razonar de forma multi-paso, ni para tool calling.
- Longitud de entrada limitada a 256 tokens; textos mas largos deben truncarse, lo que puede degradar la representacion de documentos extensos.
- La paridad numerica se verifico unicamente en el backend Torch; no se reclama paridad completa en TensorFlow o JAX, por lo que el uso con otros backends puede introducir diferencias.
- Usar `normalize=True` en `model.encode(...)` modifica la receta original del modelo y puede alterar los scores de recuperacion.
- El tokenizador debe cargarse del mismo repositorio que el modelo para preservar el truncado a 256 tokens.
- Sesgos conocidos: no disponibles en la informacion proporcionada (dependen del modelo fuente original).
- Riesgo de alucinacion: no aplica de la misma forma que en un modelo generativo, pero si existe el riesgo de falsos positivos/negativos en similitud cuando los textos son ambiguos.
- Idiomas soportados: no disponibles en la informacion proporcionada; conviene verificar el soporte multilingue real del checkpoint fuente antes de un despliegue en produccion.
- Licencia apache-2.0: permite uso comercial, con la obligacion de conservar los avisos de licencia y atribucion correspondientes. El modelo fuente declara tambien apache-2.0.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es un checkpoint reciente con poca validacion externa por parte de la comunidad.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/zeromodels/all-MiniLM-L6-v2
- Modelo base original: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Revision fijada del modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/tree/1110a243fdf4706b3f48f1d95db1a4f5529b4d41
- Repositorio ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentacion de Sentence Transformers en ZeroModels: https://imvision12.github.io/ZeroModels/sentence_transformer/
- Model card original del modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
