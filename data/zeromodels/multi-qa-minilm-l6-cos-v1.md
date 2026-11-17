# zeromodels/multi-qa-MiniLM-L6-cos-v1

## Resumen

`zeromodels/multi-qa-MiniLM-L6-cos-v1` es una conversión a Keras 3 del checkpoint `sentence-transformers/multi-qa-MiniLM-L6-cos-v1`, publicada por el proyecto ZeroModels. No se trata de un modelo nuevo ni de un reentrenamiento: es una reimplementación de los pesos originales en el ecosistema Keras 3, pensada para ejecutar sentence embeddings sin depender de PyTorch ni de la librería `sentence-transformers`. El modelo codifica texto en vectores densos de 384 dimensiones usando un backbone BERT con pooling de media, normalización L2 y puntuación por similitud coseno.

El modelo resuelve el problema de la búsqueda semántica y el retrieval de pasajes: dado un texto, produce un embedding que puede compararse con otros mediante similitud coseno. Es la variante "multi-qa" del MiniLM-L6, entrenada originalmente para responder preguntas sobre pasajes, lo que la hace adecuada para sistemas de question answering extractivo, recuperación de documentos y deduplicación semántica. Su tamaño reducido (6 capas) y su dimensión de salida compacta (384) la convierten en una opción ligera para indexar grandes corpus.

La relevancia de esta conversión concreta es de infraestructura: permite servir el modelo con Keras 3 sobre backend Torch (y potencialmente TensorFlow o JAX, aunque la paridad solo se verificó en Torch), lo que facilita su integración en stacks que ya usan Keras. El autor verifica la equivalencia numérica con el checkpoint original con una diferencia absoluta máxima en embeddings de `1.11759e-07` y una similitud coseno mínima de `1.00000000`. El repositorio ocupa 0.1 GB y contiene `model.weights.h5`, `zm_config.json` y `tokenizer.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (MiniLM-L6), 6 capas |
| Parametros totales | no disponible (MiniLM-L6, del orden de ~22M en el checkpoint original) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens de entrada máxima |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (el checkpoint original es principalmente inglés) |
| Licencia | no disponible (la model card indica que el modelo upstream no declara licencia) |
| Formato de pesos | `model.weights.h5` (Keras 3), `zm_config.json`, `tokenizer.json` |

Detalles adicionales del embedding:

| Propiedad | Valor |
|---|---|
| Pooling | mean |
| Proyección densa | ninguna |
| Dimensión de embedding | 384 |
| Normalización L2 | sí |
| Función de scoring | similitud coseno |
| Backbone | bert |
| Revisión original fijada | `b207367332321f8e44f96e224ef15bc607f4dbf0` |

## Arquitectura y entrenamiento

La arquitectura es un encoder BERT de tipo MiniLM-L6: un transformer de 6 capas con atención multi-cabeza estándar, seguido de pooling de media sobre los tokens de salida y normalización L2 para producir un vector de 384 dimensiones. No hay proyección densa adicional ni cabeza de clasificación; el modelo es puramente un encoder de frases. La conversión a Keras 3 preserva la receta de embedding del checkpoint fuente y no introduce un nuevo entrenamiento, por lo que los datos de entrenamiento, el número de tokens y la composición del dataset corresponden al modelo original `sentence-transformers/multi-qa-MiniLM-L6-cos-v1`, no documentados en la información disponible.

La innovación técnica de esta ficha no está en el modelo sino en el proceso de conversión: ZeroModels reimplementa la arquitectura en Keras 3 y verifica la paridad numérica contra Sentence Transformers en la revisión fijada del checkpoint original. La verificación reporta una diferencia absoluta máxima en embeddings de `1.11759e-07`, una similitud coseno mínima de `1.00000000` y una diferencia absoluta máxima en scores de similitud de `1.78814e-07`. La paridad completa solo se comprobó en el backend Torch; el autor no reclama paridad en TensorFlow ni en JAX. El tokenizer del repositorio preserva la truncación a 512 tokens del modelo fuente.

## Capacidades

- Generación de embeddings de frases y pasajes de 384 dimensiones, normalizados L2.
- Similitud semántica mediante coseno, con scoring integrado en `model.similarity()`.
- Búsqueda semántica y retrieval denso sobre corpus de documentos.
- Question answering basado en recuperación: el modelo original fue entrenado para emparejar preguntas con pasajes relevantes.
- Detección de duplicados y near-duplicates por similitud de embeddings.
- Clasificación y clustering de textos mediante vectores.
- Ejecución sobre Keras 3 con backend Torch (paridad verificada); TensorFlow y JAX no verificados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un encoder de embeddings, no un modelo generativo.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar manuales y fragmentos de código en un vector store y recuperar los pasajes más relevantes para una consulta del usuario mediante similitud coseno sobre vectores de 384 dimensiones.
- Question answering sobre base de conocimiento: el checkpoint original fue entrenado para el emparejamiento pregunta-pasaje, por lo que se puede usar para recuperar el fragmento que responde a una pregunta antes de pasarlo a un modelo generativo.
- Deduplicación de tickets de soporte: calcular embeddings de tickets entrantes y agrupar los que superan un umbral de similitud coseno para evitar respuestas duplicadas o consolidar incidencias recurrentes.
- Clasificación de textos por proximidad a prototipos: generar embeddings de categorías de referencia y asignar cada documento nuevo a la categoría con mayor similitud, sin entrenar un clasificador adicional.
- Filtrado de contenido en pipelines de moderación: comparar embeddings de mensajes contra un conjunto de ejemplos etiquetados de contenido no deseado para marcar candidatos a revisión.
- Recomendación de artículos o preguntas relacionadas: indexar el corpus y servir recomendaciones calculando los vecinos más cercanos de cada elemento en el espacio de 384 dimensiones.
- Integración en stacks Keras: servir el modelo dentro de un servicio que ya usa Keras 3 con backend Torch, evitando añadir PyTorch o `sentence-transformers` como dependencia adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de paridad numérica con el checkpoint original:

| Métrica de verificación | Valor |
|---|---|
| Diferencia absoluta máxima en embeddings | `1.11759e-07` |
| Similitud coseno mínima entre embeddings | `1.00000000` |
| Diferencia absoluta máxima en scores de similitud | `1.78814e-07` |

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 0.1 GB en disco; con pesos en fp32 la huella de memoria es del orden de cientos de MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no requiere A100 ni H100. Una RTX 4090 o una GPU integrada moderna pueden ejecutarlo.
- Cabe en consumer GPU: sí, en cualquier GPU consumer moderna y probablemente también en CPU para cargas moderadas.
- Opciones de despliegue: la vía documentada es Keras 3 con `zeromodels.sentence_transformers` (`ZMSentenceTransformer.from_weights` y `ZMSentenceTransformerTokenizer.from_weights`). Para el checkpoint original se puede usar `sentence-transformers`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un encoder de embeddings de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión embedding | Licencia | Formato |
|---|---|---|---|---|---|
| `zeromodels/multi-qa-MiniLM-L6-cos-v1` | MiniLM-L6 (no disponible exacto) | 512 tokens | 384 | no disponible | Keras 3 (`model.weights.h5`) |
| `sentence-transformers/multi-qa-MiniLM-L6-cos-v1` | MiniLM-L6 (no disponible exacto) | 512 tokens | 384 | no disponible | safetensors / PyTorch |
| `zeromodels/all-MiniLM-L6-v2` | MiniLM-L6 (no disponible exacto) | 512 tokens | 384 | no disponible | Keras 3 |
| `zeromodels/multi-qa-distilbert-cos-v1` | DistilBERT (no disponible exacto) | 512 tokens | 768 (no confirmado en la información) | no disponible | Keras 3 |

La diferencia principal frente al checkpoint original es el formato de pesos y el runtime (Keras 3 frente a PyTorch), con paridad numérica verificada. Frente a `all-MiniLM-L6-v2`, la variante multi-qa está orientada a retrieval pregunta-pasaje en lugar de similitud genérica. Los datos de rendimiento comparativo en benchmarks no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está declarada ni en este repositorio ni en el checkpoint original; el autor advierte explícitamente de que se deben comprobar los derechos de redistribución antes de usar o redistribuir los pesos.
- Es un encoder de embeddings, no un modelo generativo: no produce texto, no razona y no soporta tool calling ni agentes.
- La longitud de entrada está limitada a 512 tokens; textos más largos se truncan, lo que puede perder información relevante en documentos extensos.
- La paridad numérica solo se verificó en el backend Torch de Keras 3; no se reclama paridad en TensorFlow ni en JAX.
- El modelo original está orientado principalmente al inglés; el soporte multilingüe no está confirmado en la información disponible.
- Riesgo de sesgos heredados del corpus de entrenamiento original, no documentados en esta ficha.
- Como modelo de retrieval, puede devolver pasajes semánticamente cercanos pero factualmente irrelevantes; conviene combinarlo con un re-ranker o verificación posterior en producción.
- El repositorio tiene un volumen de descargas muy bajo (37) y ninguna interacción (0 likes), lo que reduce la validación comunitaria de la conversión.
- No se deben pasar `normalize=True` a `model.encode(...)` si se busca reproducir exactamente la receta original, ya que el checkpoint ya está normalizado y hacerlo puede alterar los scores de retrieval.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zeromodels/multi-qa-MiniLM-L6-cos-v1
- Checkpoint original: https://huggingface.co/sentence-transformers/multi-qa-MiniLM-L6-cos-v1
- Revisión fijada del checkpoint original: https://huggingface.co/sentence-transformers/multi-qa-MiniLM-L6-cos-v1/tree/b207367332321f8e44f96e224ef15bc607f4dbf0
- Repositorio GitHub de ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentación de Sentence Transformers en ZeroModels: https://imvision12.github.io/ZeroModels/sentence_transformer/
- Variante `all-mpnet-base-v2`: https://huggingface.co/zeromodels/all-mpnet-base-v2
- Variante `multi-qa-mpnet-base-dot-v1`: https://huggingface.co/zeromodels/multi-qa-mpnet-base-dot-v1
- Variante `all-distilroberta-v1`: https://huggingface.co/zeromodels/all-distilroberta-v1
- Variante `all-MiniLM-L12-v2`: https://huggingface.co/zeromodels/all-MiniLM-L12-v2
- Variante `multi-qa-distilbert-cos-v1`: https://huggingface.co/zeromodels/multi-qa-distilbert-cos-v1
- Variante `all-MiniLM-L6-v2`: https://huggingface.co/zeromodels/all-MiniLM-L6-v2
- Variante `paraphrase-multilingual-mpnet-base-v2`: https://huggingface.co/zeromodels/paraphrase-multilingual-mpnet-base-v2
- Variante `paraphrase-albert-small-v2`: https://huggingface.co/zeromodels/paraphrase-albert-small-v2
- Variante `paraphrase-multilingual-MiniLM-L12-v2`: https://huggingface.co/zeromodels/paraphrase-multilingual-MiniLM-L12-v2
- Variante `paraphrase-MiniLM-L3-v2`: https://huggingface.co/zeromodels/paraphrase-MiniLM-L3-v2
- Variante `distiluse-base-multilingual-cased-v1`: https://huggingface.co/zeromodels/distiluse-base-multilingual-cased-v1
- Variante `distiluse-base-multilingual-cased-v2`: https://huggingface.co/zeromodels/distiluse-base-multilingual-cased-v2
