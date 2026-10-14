# zeromodels/paraphrase-multilingual-mpnet-base-v2

## Resumen

zeromodels/paraphrase-multilingual-mpnet-base-v2 es una conversión a Keras 3 del checkpoint sentence-transformers/paraphrase-multilingual-mpnet-base-v2, publicada por el proyecto ZeroModels. No se trata de un modelo nuevo ni de un reentrenamiento: es una reimplementación de los pesos en formato Keras 3 que preserva exactamente la receta de embedding del original (backbone XLM-R, pooling de media, vectores de 768 dimensiones sin normalización L2 y similitud coseno como función de scoring).

El problema que resuelve es de infraestructura más que de modelado: permite ejecutar un encoder de similitud semántica multilingüe dentro del ecosistema Keras 3 (con backend Torch, TensorFlow o JAX) sin depender de PyTorch ni de la librería sentence-transformers. Para equipos que ya tienen pipelines en Keras o que necesitan exportar a otros runtimes, esto simplifica la integración. La contrapartida es que la paridad numérica solo se ha verificado sobre el backend Torch.

El modelo original es un encoder multilingüe basado en XLM-R que genera embeddings de frase utilizables para búsqueda semántica, agrupamiento y detección de paráfrasis en más de 50 idiomas. Su ventana de entrada está limitada a 128 tokens, lo que lo sitúa en el segmento de similitud de frases cortas y párrafos breves, no de documentos largos. La licencia es Apache 2.0 y el repositorio contiene únicamente pesos Keras (model.weights.h5), tokenizador y configuración, con un tamao total de 1,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder XLM-RoBERTa (backbone `xlm-roberta`) |
| Parametros totales | no disponible (el backbone es un XLM-R de tamano base; la ficha no declara el recuento exacto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens (truncado preservado del checkpoint original) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos Keras en precision original) |
| Idiomas soportados | multilingue; la lista concreta de idiomas no esta detallada en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | HDF5 de Keras 3 (`model.weights.h5`), acompanado de `tokenizer.json` y `zm_config.json` |
| Dimension de embedding | 768 |
| Pooling | media (mean) |
| Proyeccion densa | ninguna |
| Normalizacion L2 | no (opcional mediante `normalize=True` en `model.encode`) |
| Funcion de scoring | similitud coseno |
| Tamano del repositorio | 1,1 GB |
| Pipeline declarado | sentence-similarity |
| Revision del checkpoint original | `4328cf26390c98c5e3c738b4460a05b95f4911f5` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un encoder transformer XLM-RoBERTa, el mismo backbone del checkpoint original. Sobre la salida del encoder se aplica un pooling de media sobre las representaciones de los tokens, sin capa densa de proyección posterior: el vector resultante es directamente el embedding de 768 dimensiones. No hay normalización L2 en la receta original, de modo que la comparación entre vectores debe hacerse con similitud coseno, que es invariante a la magnitud.

Esta publicación no introduce ningún entrenamiento nuevo. Según la propia model card, la conversión "preserva la receta de embedding del modelo fuente; no introduce una nueva ejecución de entrenamiento". Por tanto, no hay datos sobre número de tokens de entrenamiento, composición del dataset ni etapas de RLHF o DPO en la información proporcionada; esos detalles corresponden al checkpoint original de sentence-transformers y no se reproducen aquí. El proyecto ZeroModels publica 13 variantes convertidas, cada una con su encoder y su receta (MPNet, RoBERTa, BERT, DistilBERT, ALBERT, XLM-R) y con pooling y normalización distintos según el caso.

La innovación técnica relevante es la verificación de paridad numérica frente a Sentence Transformers en la revisión fijada del modelo fuente: diferencia absoluta máxima de embedding de 8,9407e-08, coseno mínimo de 1,00000000 y diferencia absoluta máxima de puntuación de similitud de 1,19209e-07. Esa verificación se realizó sobre el backend Torch; la model card indica explícitamente que no se reclama paridad completa en TensorFlow o JAX.

## Capacidades

- Generación de embeddings de frase de 768 dimensiones para textos cortos, con pooling de media sobre el encoder XLM-R.
- Similitud semántica y detección de paráfrasis mediante similitud coseno entre vectores.
- Cálculo de similitud multilingüe, lo que permite comparar frases en idiomas distintos dentro del mismo espacio vectorial.
- Recuperación semántica (retrieval) por similitud coseno sobre colecciones indexadas de embeddings.
- Agrupamiento (clustering) y deduplicación semántica de frases o registros cortos.
- Normalización opcional de vectores mediante `normalize=True` en `model.encode`, con la advertencia de que altera la receta original y puede modificar las puntuaciones de recuperación.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión ni audio: es exclusivamente un encoder de representaciones.
- No dispone de soporte de tool calling, function calling ni comportamiento de agente.
- No dispone de modo de razonamiento explícito (thinking mode) ni de decodificación especulativa.

## Casos de uso

- Búsqueda semántica multilingüe en catálogos: indexar títulos y descripciones cortas de productos y recuperar los más similares a una consulta, incluso cuando consulta y documento están en idiomas distintos, gracias al espacio vectorial compartido del backbone XLM-R.
- Deduplicación de registros en bases de datos: calcular embeddings de campos cortos (nombres, direcciones normalizadas, titulares) y agrupar por umbral de similitud coseno para eliminar entradas repetidas con redacción distinta.
- Detección de paráfrasis y plagio a nivel de frase: comparar pares de oraciones y puntuar su similitud, un uso directamente alineado con la tarea para la que se entrenó el checkpoint original.
- Enrutado de tickets de soporte: clasificar consultas de usuario hacia el equipo o la categoría correcta comparando el embedding del ticket con embeddings de prototipos por categoría, con coste de inferencia bajo.
- Filtrado previo en pipelines RAG: descartar pasajes irrelevantes antes de enviarlos a un modelo generativo, reduciendo el consumo de contexto del LLM. Requiere trocear los documentos en fragmentos de 128 tokens o menos.
- Moderación y clustering de contenido en foros multilingües: agrupar mensajes por temática o detectar mensajes casi idénticos para su revisión.
- Evaluación automática de traducciones o resúmenes: usar la similitud coseno entre el texto generado y una referencia como métrica auxiliar, con la cautela de que no sustituye a métricas específicas de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de paridad numérica frente al checkpoint original, que se recogen a continuación y no constituyen una evaluación de calidad de la tarea.

| Metrica de verificacion | Valor |
|---|---|
| Diferencia absoluta maxima de embedding | 8,9407e-08 |
| Coseno minimo de embedding | 1,00000000 |
| Diferencia absoluta maxima de puntuacion de similitud | 1,19209e-07 |
| Backend de verificacion | Torch (paridad en TensorFlow/JAX no reclamada) |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,1 GB, lo que corresponde a los pesos en precision completa (probablemente fp32) junto con tokenizador y configuración. Como orden de magnitud, en fp32 la huella de pesos ronda 1,1 GB; en fp16 unos 0,55 GB y en int8 unos 0,28 GB, aunque estas conversiones no se distribuyen en el repositorio y deben realizarse por cuenta del usuario.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para lotes pequenos. Una RTX 3060, RTX 4060 o superior es más que adecuada; no se requiere A100 ni H100 para este tamano de modelo.
- Cabe en GPU de consumo: sí, con holgura, en prácticamente cualquier GPU dedicada de los últimos anos e incluso en iGPU con suficiente memoria compartida.
- Ejecución en CPU: viable para cargas de trabajo por lotes o de baja concurrencia, dado el tamano del encoder.
- Opciones de despliegue: el camino documentado es ZeroModels sobre Keras 3 con `KERAS_BACKEND` configurado antes de importar Keras (probado con Torch). También puede cargarse el checkpoint original con sentence-transformers indicando `hf:sentence-transformers/paraphrase-multilingual-mpnet-base-v2`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo ni se distribuye en GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension de embedding | Contexto maximo | Normalizacion | Licencia | Formato de pesos |
|---|---|---|---|---|---|---|
| zeromodels/paraphrase-multilingual-mpnet-base-v2 | Conversion Keras 3 de XLM-R | 768 | 128 tokens | no (opcional) | Apache 2.0 | HDF5 de Keras |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | Modelo original (PyTorch) | 768 | 128 tokens | no | Apache 2.0 | safetensors / pytorch |
| zeromodels/paraphrase-multilingual-MiniLM-L12-v2 | Conversion Keras 3 de BERT | no disponible en la informacion proporcionada | no disponible | no | Apache 2.0 | HDF5 de Keras |
| zeromodels/all-MiniLM-L6-v2 | Conversion Keras 3 de BERT, solo ingles | no disponible en la informacion proporcionada | no disponible | si | Apache 2.0 | HDF5 de Keras |

El diferencial de esta ficha frente a las alternativas ZeroModels no es la calidad del modelo, sino la combinacion de backbone multilingue (XLM-R) con una receta sin normalizacion. Frente al checkpoint original, la diferencia es el runtime: Keras 3 en lugar de PyTorch y sentence-transformers. Para comparaciones con alternativas multilingues de otros proveedores, no se dispone de datos de rendimiento en la información proporcionada que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada. Al derivar de un corpus web multilingue (herencia de XLM-R), es esperable el sesgo típico de ese tipo de datos, pero no hay evaluación publicada en esta ficha.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto. El riesgo equivalente es la asignación de similitud alta a pares de frases no relacionados, especialmente en dominios muy especializados.
- Limitación de contexto severa: el truncado a 128 tokens implica que cualquier texto más largo se recorta. Para documentos extensos hay que trocear en fragmentos, lo que degrada la coherencia semántica global.
- Limitación de idioma: aunque el modelo es multilingue, la lista concreta de idiomas soportados no está detallada en la información disponible, y el rendimiento puede ser desigual entre idiomas de altos recursos y de bajos recursos.
- Sin normalización L2: si se comparan estos embeddings con vectores normalizados de otro sistema mediante producto escalar, los resultados serán incorrectos. Hay que usar similitud coseno o normalizar explícitamente ambos lados.
- Cambio de receta: activar `normalize=True` modifica la receta original y puede alterar las puntuaciones de recuperación; la model card lo advierte de forma explícita.
- Paridad no garantizada fuera de Torch: la verificación numérica se hizo únicamente sobre el backend Torch. En TensorFlow o JAX puede haber diferencias no cuantificadas.
- Licencia: Apache 2.0, permisiva para uso comercial, siempre que se conserve la atribución correspondiente. Conviene verificar la licencia del checkpoint original en su propia ficha antes de un despliegue en producción.
- Metadatos del repositorio: cero descargas y cero likes en el momento de la consulta, lo que indica que la conversión no ha sido validada de forma independiente por la comunidad.
- Cobertura de la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo (contenido no técnico y no relacionado). No se han podido localizar articulos, papers ni discusiones independientes sobre esta conversión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeromodels/paraphrase-multilingual-mpnet-base-v2
- Checkpoint original: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Revision fijada del checkpoint original: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2/tree/4328cf26390c98c5e3c738b4460a05b95f4911f5
- Repositorio ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentacion de Sentence Transformers en ZeroModels: https://imvision12.github.io/ZeroModels/sentence_transformer/
- Variante all-mpnet-base-v2: https://huggingface.co/zeromodels/all-mpnet-base-v2
- Variante multi-qa-mpnet-base-dot-v1: https://huggingface.co/zeromodels/multi-qa-mpnet-base-dot-v1
- Variante all-distilroberta-v1: https://huggingface.co/zeromodels/all-distilroberta-v1
- Variante all-MiniLM-L12-v2: https://huggingface.co/zeromodels/all-MiniLM-L12-v2
- Variante multi-qa-distilbert-cos-v1: https://huggingface.co/zeromodels/multi-qa-distilbert-cos-v1
- Variante all-MiniLM-L6-v2: https://huggingface.co/zeromodels/all-MiniLM-L6-v2
- Variante multi-qa-MiniLM-L6-cos-v1: https://huggingface.co/zeromodels/multi-qa-MiniLM-L6-cos-v1
- Variante paraphrase-albert-small-v2: https://huggingface.co/zeromodels/paraphrase-albert-small-v2
- Variante paraphrase-multilingual-MiniLM-L12-v2: https://huggingface.co/zeromodels/paraphrase-multilingual-MiniLM-L12-v2
- Variante paraphrase-MiniLM-L3-v2: https://huggingface.co/zeromodels/paraphrase-MiniLM-L3-v2
- Variante distiluse-base-multilingual-cased-v1: https://huggingface.co/zeromodels/distiluse-base-multilingual-cased-v1
- Variante distiluse-base-multilingual-cased-v2: https://huggingface.co/zeromodels/distiluse-base-multilingual-cased-v2
- Equipo Sentence Transformers: https://huggingface.co/sentence-transformers
