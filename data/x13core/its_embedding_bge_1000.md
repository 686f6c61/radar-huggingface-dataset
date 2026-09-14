# X13Core/ITS_embedding_bge_1000

## Resumen

ITS Embedding BGE es un modelo de embeddings de frases en ingles publicado por X13Core bajo el identificador `X13Core/ITS_embedding_bge_1000`. Se trata de un ajuste fino de `BAAI/bge-large-en-v1.5` orientado a busqueda semantica y recuperacion de documentos dentro del repositorio de conocimiento ITS Global. No es un modelo generativo: transforma frases y pasajes en vectores densos de 1024 dimensiones que se comparan mediante similitud coseno.

El modelo parte de un encoder BERT de aproximadamente 335 millones de parametros y proyecta tanto documentos indexados como consultas de usuario al mismo espacio vectorial, de modo que pueda usarse como componente de recuperacion en un sistema RAG o en un motor de busqueda semantica. Su principal argumento es la mejora medida sobre el modelo base: en el conjunto de validacion interno de ITS, con 1.124 consultas y metrica Accuracy@5, pasa de 0,916370 a 0,961744, una ganancia absoluta de 0,045374 puntos.

Es relevante ahora porque los modelos de embeddings especializados por dominio siguen siendo la via mas economica para mejorar la calidad de recuperacion en pipelines RAG, frente a alternativas de reentrenar o aumentar el tamano del generador. Su licencia MIT y su compatibilidad con Sentence Transformers y con Text Embeddings Inference facilitan su integracion en produccion, aunque su alcance esta deliberadamente limitado al dominio y al idioma para el que fue ajustado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), segun los tags del repositorio; derivado de BAAI/bge-large-en-v1.5 |
| Parametros totales | 335.141.888 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (longitud maxima de secuencia usada en el ajuste fino) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas en el repositorio) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (revisar tambien los terminos del modelo base) |
| Formato de pesos | safetensors |
| Dimension del embedding | 1024 |
| Pooling | token CLS |
| Funcion de similitud | similitud coseno (embeddings normalizados) |
| Tamano del repositorio | 1,3 GB |
| Libreria | sentence-transformers |
| Pipeline | sentence-similarity |

## Arquitectura y entrenamiento

La arquitectura corresponde a un encoder transformer de tipo BERT, heredado de `BAAI/bge-large-en-v1.5`, que produce representaciones densas mediante pooling del token CLS. El ajuste fino mantiene la salida de 1024 dimensiones y normaliza los embeddings para que la recuperacion se haga por similitud coseno. El modelo no incorpora cabezal generativo ni decodificador: su unica salida util es el vector de embedding.

El entrenamiento se realizo con el objetivo `MultipleNegativesRankingLoss`, un esquema contrastivo que aprende a acercar pares consulta-documento relevantes y a alejar los negativos del propio lote. Los hiperparametros declarados son 2 epocas, batch size de 16, learning rate de 2e-5 y una longitud maxima de secuencia de 512 tokens. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni la composicion exacta del dataset, mas alla de que proviene del dominio ITS Global. No se menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo por otra parte ajeno a un modelo de embeddings.

## Capacidades

- Generacion de embeddings de frases y pasajes en ingles con salida de 1024 dimensiones.
- Recuperacion semantica de documentos: indexacion de pasajes y consultas en el mismo espacio vectorial.
- Calculo de similitud semantica entre pares de textos (pipeline `sentence-similarity`).
- Extraccion de caracteristicas (`feature-extraction`) para tareas posteriores de clasificacion o clustering.
- Busqueda semantica sobre corpus previamente indexados.
- Recuperacion de informacion en el contexto de un sistema RAG.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un componente de recuperacion, no un agente.
- Multilingue: no. El modelo esta entrenado y evaluado unicamente en ingles.
- Capacidades especiales: normalizacion de embeddings integrada en el flujo de uso y compatibilidad declarada con Text Embeddings Inference y endpoints.

## Casos de uso

- Recuperacion en pipelines RAG: se indexan los fragmentos de la base de conocimiento con este modelo y se embebe la consulta del usuario con el mismo modelo; los pasajes recuperados se pasan despues a un LLM generativo. Es adecuado porque documentos y consultas comparten espacio vectorial de 1024 dimensiones.
- Busqueda semantica en documentacion tecnica interna: permite encontrar el fragmento relevante aunque la consulta no comparta palabras exactas con el documento, sustituyendo o complementando la busqueda por palabras clave.
- Deduplicacion y agrupacion de documentos: calcular embeddings de todos los pasajes y aplicar thresholds de similitud coseno o clustering para detectar contenido repetido o cuasi repetido en el repositorio.
- Enrutado de consultas a la seccion correcta: embeber las consultas entrantes y compararlas con embeddings de categorias o departamentos para asignar automaticamente cada ticket o pregunta.
- Clasificacion y etiquetado por similitud: usar los embeddings como caracteristicas de entrada a un clasificador ligero (regresion logistica, k-NN) para etiquetar documentos sin entrenar un modelo de lenguaje completo.
- Filtrado y moderacion de contenido por similitud: comparar el contenido entrante contra un conjunto de referencia de ejemplos permitidos o problematicos mediante similitud coseno.
- Recomendacion de contenido relacionado: dado un documento, recuperar los vecinos mas cercanos del indice para construir listas de "contenido relacionado".
- Evaluacion y monitorizacion de la calidad de recuperacion: al publicarse las metricas de validacion y el CSV de resultados, sirve como referencia para comparar configuraciones de recuperacion dentro del mismo sistema.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al conjunto de validacion interno de ITS, con 1.124 consultas y metrica Accuracy@5 (hit rate). No son resultados de benchmarks publicos generales.

| Modelo | Hit rate / Accuracy@5 |
|---|---:|
| Fine-tuned ITS BGE | 0,961744 |
| Stock BGE baseline | 0,916370 |
| Mejora absoluta | +0,045374 |

No se han publicado resultados de MMLU, GLUE, MTEB u otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 alrededor de 1,4 GB solo para pesos; en FP16/bf16 alrededor de 0,7 GB; en INT8 en torno a 0,35 GB. Hay que sumar el coste de activaciones y del lote, reducido en comparacion con modelos generativos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; modelos como RTX 3060, RTX 4090, A10, L4, A100 o H100 funcionan sobradamente.En este caso el cuello de botella suele ser el throughput de indexacion, no la memoria.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU consumer moderna puede ejecutarlo, e incluso es viable en CPU para volumenes moderados.
- Opciones de despliegue: `sentence-transformers` (referencia oficial del autor), Text Embeddings Inference (el repositorio incluye el tag `text-embeddings-inference` y `endpoints_compatible`), servidores de embeddings compatibles con la API de Hugging Face, y despliegue en nodos con vLLM para tareas de embeddings si la version lo soporta. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion previa no documentada.
- Latencia y throughput estimados: no disponible. El autor no publica cifras de latencia ni de documentos por segundo.
- Nota de operacion: al ser un modelo de embeddings, su coste dominante es el proceso de indexacion del corpus completo, que debe repetirse si se sustituye un modelo de embeddings anterior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Idiomas | Rendimiento |
|---|---|---|---|---|---|---|
| X13Core/ITS_embedding_bge_1000 | 335.141.888 | 512 tokens | 1024 | MIT | en | Accuracy@5 0,961744 en validacion ITS |
| BAAI/bge-large-en-v1.5 (modelo base) | ~335 M | 512 tokens | 1024 | MIT | en | Accuracy@5 0,916370 en validacion ITS; benchmarks publicos MTEB no disponibles en esta ficha |
| BAAI/bge-base-en-v1.5 | ~109 M | 512 tokens | 768 | MIT | en | no disponible |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 256 tokens | 384 | Apache-2.0 | en | no disponible |

La comparativa se limita a parametros, contexto, dimension, licencia e idioma, que son datos verificables. No se incluyen cifras de rendimiento de los modelos alternativos porque no forman parte de la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no responde preguntas ni produce texto, solo vectores. Cualquier expectativa de generacion es un error de uso.
- Idioma unico: solo ingles. El rendimiento en castellano u otros idiomas no esta evaluado ni garantizado.
- Ventana de 512 tokens: los pasajes deben fragmentarse antes de la indexacion, lo que introduce decisiones de chunking que afectan a la calidad de recuperacion.
- Dominio especifico: el ajuste fino se hizo para el repositorio ITS Global. La mejora de 0,045374 puntos es valida para el conjunto de validacion interno y no debe extrapolarse como rendimiento general.
- Riesgo de sobreajuste al dominio: un modelo ajustado sobre un corpus concreto puede degradarse en dominios distintos, aunque la evaluacion publicada solo cubre el dominio de origen.
- Sesgos: no se documenta ninguna auditoria de sesgos del corpus de entrenamiento; al derivar de bge-large-en-v1.5, hereda los sesgos presentes en los datos originales del modelo base.
- Alucinacion: no aplica en sentido estricto, pero una recuperacion incorrecta puede inducir errores en el LLM que consuma los pasajes recuperados; conviene validar el sistema completo, no solo el retriever.
- Licencia: el repositorio se publica bajo MIT, pero el autor advierte de que deben revisarse tambien los terminos del modelo base antes de redistribuir o usar comercialmente. Es una advertencia explicita y conviene verificarla.
- Migracion: si se sustituye un modelo de embeddings existente en produccion, es obligatorio regenerar todos los embeddings de los documentos antes de cambiar la recuperacion, ya que los espacios vectoriales no son comparables entre modelos.
- Madurez: el repositorio registra 0 descargas y 1 "like" en el momento de la consulta, por lo que no hay evidencia de adopcion en produccion por terceros.
- Sin variantes cuantizadas publicadas: no hay GGUF ni ONNX documentados en la informacion disponible, lo que limita el despliegue en entornos ligeros sin trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/X13Core/ITS_embedding_bge_1000
- Modelo base: https://huggingface.co/BAAI/bge-large-en-v1.5
- Resultados de evaluacion: `eval/Information-Retrieval_evaluation_results.csv` dentro del repositorio del modelo
- Libreria Sentence Transformers: https://www.sbert.net/
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
