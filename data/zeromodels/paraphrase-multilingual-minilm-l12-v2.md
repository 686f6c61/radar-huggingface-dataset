# zeromodels/paraphrase-multilingual-MiniLM-L12-v2

## Resumen

zeromodels/paraphrase-multilingual-MiniLM-L12-v2 es una conversión a Keras 3 del checkpoint `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, publicada por el proyecto ZeroModels (IMvision12). No es un modelo nuevo ni un reentrenamiento: es el mismo modelo de embeddings de frases, reempaquetado en formato nativo de Keras 3 (`model.weights.h5`, `tokenizer.json` y `zm_config.json`) para poder ejecutarse sin depender de PyTorch ni de la librería `sentence-transformers`.

El modelo transforma texto en vectores densos de 384 dimensiones mediante un backbone BERT con pooling de tipo *mean*. Los embeddings no están normalizados L2 y la función de scoring prevista es la similitud coseno. La longitud máxima de entrada está fijada en 128 tokens, con truncado heredado del checkpoint original (revisión fijada `e8f8c211226b894fcb81acc59f3b34ba3efd5f42`).

Su relevancia es eminentemente práctica: permite desplegar búsqueda semántica, deduplicación y recuperación multilingüe dentro de stacks Keras/TensorFlow/JAX, con un coste computacional muy bajo. La conversión declara paridad numérica verificada frente al original (diferencia absoluta máxima en embeddings de `2.38419e-07`, coseno mínimo de `0.99999994`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (backbone `bert`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens (longitud maxima de entrada, con truncado) |
| Tipos de cuantizacion | no disponible (pesos en `model.weights.h5`, formato Keras 3) |
| Idiomas soportados | multilingue (el listado concreto de idiomas no esta disponible en la informacion proporcionada) |
| Licencia | apache-2.0 |
| Formato de pesos | `model.weights.h5` (Keras 3), acompanado de `tokenizer.json` y `zm_config.json` |
| Dimension del embedding | 384 |
| Pooling | mean |
| Proyeccion densa adicional | ninguna |
| Normalizacion L2 | no |
| Funcion de scoring | similitud coseno |
| Modelo base | sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 |
| Libreria | ZeroModels (Keras 3) |
| Tamano del repositorio | 0.5 GB |
| Pipeline | sentence-similarity |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder con backbone BERT, sin cabecera generativa: la salida se obtiene aplicando pooling de media sobre las representaciones de los tokens y se usa directamente como embedding de frase de 384 dimensiones. No hay proyección densa adicional ni normalización L2 en la receta de embeddings; por eso el scoring correcto es coseno sobre vectores no normalizados. La ventana de entrada está limitada a 128 tokens.

No se ha realizado ningún entrenamiento nuevo en esta conversión. La model card indica explícitamente que se preserva la receta de embeddings del modelo fuente y que el commit original está fijado para garantizar reproducibilidad. Los detalles de composición del dataset, número de tokens de entrenamiento y uso de RLHF/DPO corresponden al modelo original y no se reproducen en la información proporcionada. La innovación técnica destacable es el propio proceso de conversión: pesos serializados en formato Keras 3 con paridad numérica verificada frente a Sentence Transformers, lo que permite cargar el modelo en backends Torch, TensorFlow o JAX.

Nota de implementación: la paridad se comprobó sobre el backend Torch. La model card advierte de que no se reclama paridad completa en TensorFlow ni en JAX, y que `KERAS_BACKEND` debe fijarse antes de importar Keras o ZeroModels.

## Capacidades

- Generación de embeddings de frases y párrafos en vectores de 384 dimensiones.
- Similitud semántica entre textos mediante similitud coseno.
- Detección de paráfrasis y de equivalencia semántica entre enunciados.
- Recuperación de información (retrieval) por similitud vectorial.
- Búsqueda semántica multilingüe, incluyendo consultas y documentos en idiomas distintos.
- Deduplicación y agrupamiento (clustering) de textos por proximidad en el espacio de embeddings.
- Funciona como encoder de soporte en pipelines de RAG, sin capacidad de generar texto por sí mismo.
- Truncado automático a 128 tokens mediante el tokenizador incluido en el mismo repositorio.
- Opción de normalización a longitud unitaria pasando `normalize=True` a `model.encode(...)`, con la advertencia de que esto altera la receta original.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo *thinking*, ni de capacidades de visión o audio.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar los fragmentos de un corpus en vectores de 384 dimensiones y recuperar los más próximos a la consulta del usuario mediante similitud coseno. Adecuado porque el coste de indexación es bajo y el modelo es multilingüe.
- Deduplicación de tickets de soporte: agrupar incidencias repetidas comparando embeddings entre sí y aplicando un umbral de coseno, reduciendo el volumen de colas duplicadas antes de asignarlas a agentes.
- Recuperación aumentada (RAG): usar el modelo como *retriever* para seleccionar los pasajes relevantes que después se inyectan en el prompt del LLM generador. Encaja bien porque solo necesita 128 tokens por pasaje.
- Detección de paráfrasis en control de calidad de contenidos: comparar títulos, resúmenes o descripciones entre sí para detectar contenidos repetidos o reformulados.
- Clasificación de intenciones con pocos ejemplos: construir un clasificador de k-vecinos más cercano sobre los embeddings de un conjunto reducido de ejemplos etiquetados, útil cuando no hay datos suficientes para entrenar un modelo supervisado.
- Búsqueda multilingüe en catálogos de producto: indexar descripciones en varios idiomas y permitir consultas en el idioma del usuario, gracias al entrenamiento multilingüe del checkpoint original.
- Moderación y agrupamiento temático de comentarios: proyectar los textos entrantes y agruparlos por proximidad para detectar campañas de spam o temas emergentes.
- Sistemas de recomendación basados en contenido: representar ítems y preferencias del usuario en el mismo espacio vectorial y ordenar candidatos por similitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye métricas de verificación de paridad entre esta conversión y el checkpoint original de Sentence Transformers:

| Metrica de verificacion | Valor |
|---|---|
| Diferencia absoluta maxima en embeddings | 2.38419e-07 |
| Coseno minimo entre embeddings | 0.99999994 |
| Diferencia absoluta maxima en score de similitud | 2.38419e-07 |

No se aportan resultados de MMLU, HumanEval, GSM8K, MTEB ni de ningún otro conjunto de evaluación, y estos no deben inferirse de las cifras anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el conjunto de pesos, dado que el repositorio completo ocupa 0.5 GB. No se dispone de cifras oficiales de consumo; el valor es una estimación a partir del tamaño publicado.
- GPU recomendadas: cualquier GPU moderna sirve. No requiere A100, H100 ni tarjetas de gama alta; una RTX 3060, RTX 4090 o incluso una GPU integrada son suficientes.
- Inferencia en CPU: plenamente viable gracias al tamaño reducido del modelo y al límite de 128 tokens por secuencia.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 1-2 GB de VRAM libre.
- Opciones de despliegue: carga nativa mediante la librería ZeroModels sobre Keras 3, con `SentenceTransformerModel.from_weights(repo)` y `SentenceTransformerTokenizer.from_weights(repo)`. El backend se selecciona con la variable de entorno `KERAS_BACKEND` (`torch`, `tensorflow` o `jax`) antes de importar Keras. No se documentan exportaciones a GGUF, vLLM, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Todos los modelos de la comparativa pertenecen a la misma colección de conversiones a Keras 3 publicada por zeromodels, lo que permite intercambiarlos sin cambiar la API de carga.

| Modelo | Encoder y receta | Dimension | Licencia | Disponibilidad |
|---|---|---|---|---|
| zeromodels/paraphrase-multilingual-MiniLM-L12-v2 | BERT · mean, sin normalizar | 384 | apache-2.0 (declarada en el original) | En HuggingFace, via ZeroModels |
| zeromodels/paraphrase-multilingual-mpnet-base-v2 | XLM-R · mean | no disponible | no disponible en la informacion | En HuggingFace, via ZeroModels |
| zeromodels/paraphrase-MiniLM-L3-v2 | BERT · mean | no disponible | no disponible en la informacion | En HuggingFace, via ZeroModels |
| zeromodels/all-MiniLM-L12-v2 | BERT · mean + normalize | no disponible | no disponible en la informacion | En HuggingFace, via ZeroModels |

Frente a `paraphrase-multilingual-mpnet-base-v2`, este modelo es más ligero (backbone BERT en lugar de XLM-R) a costa de una dimensión de embedding menor. Frente a `paraphrase-MiniLM-L3-v2`, ofrece un backbone de mayor profundidad. La diferencia principal respecto a `all-MiniLM-L12-v2` es la receta de normalización (este checkpoint no normaliza) y el carácter multilingüe del tokenizador. No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona, no ejecuta código y no soporta agentes ni tool calling.
- Ventana de entrada muy corta: 128 tokens. Los textos más largos se truncan, lo que puede degradar la recuperación en documentos extensos si no se fragmentan previamente.
- Los embeddings no están normalizados L2. Si se aplica normalización manualmente mediante `normalize=True`, se altera la receta original y los scores de recuperación pueden variar respecto al checkpoint de referencia.
- La paridad numérica solo se verificó en el backend Torch. No se garantiza el mismo comportamiento en TensorFlow ni en JAX.
- Es obligatorio usar el tokenizador del mismo repositorio que los pesos; mezclarlo con otro tokenizador rompería la correspondencia con la longitud de truncado de 128 tokens.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos en similitud cuando los textos comparten vocabulario pero no significado, especialmente en dominios muy técnicos.
- Sesgos: no disponibles. No se documenta ningún análisis de sesgo en la información proporcionada.
- Restricciones de licencia: la licencia declarada es apache-2.0, lo que permite uso comercial. La model card atribuye esta licencia al checkpoint original; conviene verificar la licencia vigente del modelo fuente antes de un despliegue en producción.
- El repositorio registra 0 descargas y 0 likes, y se publicó en octubre de 2026. Es una conversión reciente y sin adopción documentada, por lo que no existe validación externa de su comportamiento en producción.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo; los enlaces devueltos pertenecen a foros de correo de un operador de telecomunicaciones y no guardan relación con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeromodels/paraphrase-multilingual-MiniLM-L12-v2
- Checkpoint original: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Revisión fijada del checkpoint original: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2/tree/e8f8c211226b894fcb81acc59f3b34ba3efd5f42
- Repositorio del proyecto ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentación de Sentence Transformers en ZeroModels: https://imvision12.github.io/ZeroModels/sentence_transformer/
- Variante relacionada `paraphrase-multilingual-mpnet-base-v2`: https://huggingface.co/zeromodels/paraphrase-multilingual-mpnet-base-v2
- Variante relacionada `paraphrase-MiniLM-L3-v2`: https://huggingface.co/zeromodels/paraphrase-MiniLM-L3-v2
- Variante relacionada `all-MiniLM-L12-v2`: https://huggingface.co/zeromodels/all-MiniLM-L12-v2
