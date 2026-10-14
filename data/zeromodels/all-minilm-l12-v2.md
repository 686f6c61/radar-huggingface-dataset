# zeromodels/all-MiniLM-L12-v2

## Resumen

zeromodels/all-MiniLM-L12-v2 es una conversión a Keras 3 puro del checkpoint sentence-transformers/all-MiniLM-L12-v2, publicada por el proyecto ZeroModels (IMvision12). No es un modelo entrenado desde cero: reproduce con pesos Keras la receta de embeddings del modelo original, que codifica texto en vectores de 384 dimensiones mediante un backbone BERT con pooling de media, normalización L2 y función de puntuación basada en similitud coseno.

Su relevancia es de ingeniería más que de investigación: permite ejecutar sentence embeddings dentro del ecosistema Keras 3 (paridad verificada únicamente con backend Torch) sin depender de la librería sentence-transformers ni de PyTorch de forma directa, manteniendo una diferencia numérica despreciable frente al modelo fuente. La longitud máxima de entrada está limitada a 128 tokens, el repositorio ocupa 0,1 GB y la licencia declarada es Apache 2.0.

El checkpoint no registra descargas ni likes en el momento de la consulta, y la model card no declara idiomas soportados, número de parámetros ni resultados de benchmarks propios. La búsqueda web realizada no ha devuelto ninguna fuente relevante sobre el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM, 12 capas según la nomenclatura del checkpoint base); conversión a Keras 3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de entrada, truncado preservado del checkpoint original) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en HDF5 sin variantes cuantizadas publicadas |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | Keras HDF5 (model.weights.h5), acompañado de zm_config.json y tokenizer.json |

Otros datos de interés declarados en la model card: dimensión de embedding de 384, pooling de media, sin proyección densa, normalización L2 activada y puntuación por similitud coseno. El repositorio ocupa 0,1 GB y registra marcas de creación y actualización del 2026-10-13.

## Arquitectura y entrenamiento

Se trata de un encoder transformer tipo BERT, con 12 capas según la nomenclatura L12 del checkpoint base. La representación de frase se obtiene mediante pooling de media sobre las salidas del encoder, sin capa densa de proyección adicional, y los vectores resultantes se normalizan con norma L2. La dimensión de embedding es 384 y el scoring previsto es la similitud coseno, coherente con el checkpoint original. El tokenizer del repositorio conserva el truncado de origen a 128 tokens.

Esta publicación no introduce ningún entrenamiento nuevo ni modificación de la receta de embeddings: es una conversión de pesos. La model card no detalla el volumen de tokens, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo fuente, y remite a la model card original para esos datos. La innovación técnica es la propia conversión a Keras 3 y su verificación de paridad: comparada con Sentence Transformers en la revisión fijada a50ef00143b4d5391434df20ae11632588ac25be, la diferencia absoluta máxima de embeddings es 1,15484e-07, el coseno mínimo entre embeddings es 1,00000000 y la diferencia absoluta máxima de puntuaciones de similitud es 2,38419e-07. Esa verificación se realizó solo con backend Torch; no se declara paridad completa con TensorFlow ni con JAX.

## Capacidades

- Generación de embeddings de frases y fragmentos de texto en vectores densos de 384 dimensiones, con normalización L2.
- Cálculo de similitud semántica mediante similitud coseno, a través del método `model.similarity()`.
- Recuperación densa (dense retrieval) y búsqueda semántica sobre corpus de texto.
- Clustering de textos, agrupación temática y detección de casi duplicados por distancia coseno.
- Clasificación y enrutado aguas abajo entrenando un clasificador ligero sobre los embeddings (uso derivado, no declarado explícitamente por el autor).
- Codificación por lotes tanto en CPU como en GPU, con tokenizer propio empaquetado en el repositorio.
- No es un modelo generativo: no produce texto, no razona y no responde a instrucciones.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles en este checkpoint; las variantes multilingües de la misma familia son checkpoints distintos.
- Sin capacidades de visión, audio, modo thinking ni decodificación especulativa.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar los fragmentos de la documentación como embeddings de 384 dimensiones y recuperar los más cercanos a la consulta del usuario por similitud coseno, con un coste de cómputo muy bajo y sin necesidad de GPU.
- Recuperación en pipelines RAG: usar el modelo como retriever sobre una base vectorial y alimentar con los fragmentos recuperados a un LLM generativo. Es adecuado por su tamaño reducido, su latencia baja y la posibilidad de ejecutarlo en CPU dentro del mismo servicio.
- Deduplicación de datasets de entrenamiento: codificar todos los registros y eliminar pares con coseno superior a un umbral, reduciendo el riesgo de contaminación y sobreajuste en corpus de gran volumen.
- Enrutado de tickets de soporte: representar cada ticket entrante y compararlo con los prototipos de cada categoría para asignarlo al equipo correspondiente, con reentrenamiento barato si cambian las categorías.
- Agrupación de feedback de usuarios: generar embeddings de encuestas, reseñas o incidencias y aplicar clustering para descubrir temas recurrentes sin etiquetas previas.
- Caché semántica de respuestas de un LLM: almacenar pares consulta-respuesta y devolver una respuesta cacheada cuando la nueva consulta supera un umbral de similitud, reduciendo coste y latencia del sistema generativo.
- Recomendación de contenido relacionado: calcular la similitud entre el artículo o producto actual y el resto del catálogo para generar recomendaciones en tiempo real.
- Evaluación de salidas de modelos: medir la similitud semántica entre respuestas generadas y respuestas de referencia como métrica auxiliar en pipelines de evaluación automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, MTEB, GLUE u otros) en la información disponible. El único dato cuantitativo publicado es la verificación de paridad numérica frente al checkpoint original:

| Metrica de verificacion | Valor |
|---|---|
| Diferencia absoluta maxima de embeddings | 1,15484e-07 |
| Coseno minimo entre embeddings | 1,00000000 |
| Diferencia absoluta maxima de puntuaciones de similitud | 2,38419e-07 |

## Requisitos de hardware

- Tamaño del repositorio: 0,1 GB, incluidos pesos, configuración y tokenizer.
- VRAM estimada para inferencia: inferior a 1 GB en FP32 (estimación a partir del tamaño del repositorio); no se publican cifras oficiales.
- GPU recomendadas: no se especifican. Por tamaño, el modelo es viable en cualquier GPU, incluidas las de gama de entrada.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4090 y similares) y también funciona en CPU, que es el escenario habitual para este tipo de encoder.
- Opciones de despliegue: el uso previsto es la librería zeromodels sobre Keras 3, con `SentenceTransformerModel.from_weights()` y `SentenceTransformerTokenizer.from_weights()`. No se publican variantes GGUF, ONNX ni artefactos para vLLM, llama.cpp, Ollama o TGI.
- Backend: la paridad se verificó con KERAS_BACKEND=torch; la variable debe fijarse antes de importar Keras o ZeroModels.
- Para cargar el modelo original sin los pesos convertidos, la model card indica `SentenceTransformerModel.from_weights("hf:sentence-transformers/all-MiniLM-L12-v2")`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Backbone y receta | Dimension de embedding | Longitud maxima | Licencia | Formato |
|---|---|---|---|---|---|
| zeromodels/all-MiniLM-L12-v2 | BERT, mean + normalize | 384 | 128 tokens | apache-2.0 | Keras HDF5 |
| zeromodels/all-MiniLM-L6-v2 | BERT, mean + normalize | no disponible | no disponible | no declarada en la informacion | Keras HDF5 |
| zeromodels/all-mpnet-base-v2 | MPNet, mean + normalize | no disponible | no disponible | no declarada en la informacion | Keras HDF5 |
| zeromodels/multi-qa-MiniLM-L6-cos-v1 | BERT, mean + normalize | no disponible | no disponible | no declarada en la informacion | Keras HDF5 |
| zeromodels/multi-qa-mpnet-base-dot-v1 | MPNet, CLS + producto escalar | no disponible | no disponible | no declarada en la informacion | Keras HDF5 |
| sentence-transformers/all-MiniLM-L12-v2 | BERT, mean + normalize | 384 | 128 tokens | apache-2.0 (declarada por el autor original) | pesos PyTorch safetensors |

La familia ZeroModels incluye además las variantes all-distilroberta-v1, multi-qa-distilbert-cos-v1, paraphrase-multilingual-mpnet-base-v2, paraphrase-albert-small-v2, paraphrase-multilingual-MiniLM-L12-v2, paraphrase-MiniLM-L3-v2, distiluse-base-multilingual-cased-v1 y distiluse-base-multilingual-cased-v2. No se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: cualquier expectativa de generación de texto, razonamiento o conversación queda fuera de su alcance.
- Ventana de entrada de 128 tokens: los documentos largos requieren troceado previo; el truncado puede descartar información relevante si no se gestiona explícitamente.
- Idiomas soportados no declarados en la model card: no se puede asumir buen rendimiento fuera del idioma o idiomas del checkpoint original sin evaluarlo.
- Paridad numérica verificada únicamente con backend Torch; no se garantiza equivalencia con TensorFlow o JAX.
- La función de puntuación prevista es similitud coseno. Pasar `normalize=True` a `model.encode()` cuando el checkpoint ya está normalizado altera la receta original y puede modificar las puntuaciones de recuperación.
- Es obligatorio usar el tokenizer del mismo repositorio que los pesos; mezclar tokenizers puede degradar los resultados de forma silenciosa.
- Los embeddings no modelan negaciones ni matices lógicos con fiabilidad: la similitud coseno puede dar valores altos entre frases de significado opuesto. Riesgo de falsos positivos en deduplicación, caché semántica y moderación.
- Sesgos heredados del checkpoint original; esta conversión no realiza ninguna auditoría de sesgo ni mitigación.
- Trazabilidad limitada: 0 descargas, 0 likes y marcas temporales del repositorio (creación y actualización el 2026-10-13) poco habituales, sin validación aparente por parte de la comunidad.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del checkpoint fuente y la atribución antes de desplegarlo en producción.
- No se publican variantes cuantizadas, artefactos ONNX ni integraciones para servidores de inferencia habituales, lo que limita las opciones de despliegue estandarizadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeromodels/all-MiniLM-L12-v2
- Repositorio ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentación de Sentence Transformers en ZeroModels: https://imvision12.github.io/ZeroModels/sentence_transformer/
- Checkpoint original: https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2
- Revisión fijada del checkpoint original: https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2/tree/a50ef00143b4d5391434df20ae11632588ac25be
- Variante all-mpnet-base-v2: https://huggingface.co/zeromodels/all-mpnet-base-v2
- Variante multi-qa-mpnet-base-dot-v1: https://huggingface.co/zeromodels/multi-qa-mpnet-base-dot-v1
- Variante all-distilroberta-v1: https://huggingface.co/zeromodels/all-distilroberta-v1
- Variante all-MiniLM-L6-v2: https://huggingface.co/zeromodels/all-MiniLM-L6-v2
- Variante multi-qa-distilbert-cos-v1: https://huggingface.co/zeromodels/multi-qa-distilbert-cos-v1
- Variante multi-qa-MiniLM-L6-cos-v1: https://huggingface.co/zeromodels/multi-qa-MiniLM-L6-cos-v1
- Variante paraphrase-multilingual-mpnet-base-v2: https://huggingface.co/zeromodels/paraphrase-multilingual-mpnet-base-v2
- Variante paraphrase-albert-small-v2: https://huggingface.co/zeromodels/paraphrase-albert-small-v2
- Variante paraphrase-multilingual-MiniLM-L12-v2: https://huggingface.co/zeromodels/paraphrase-multilingual-MiniLM-L12-v2
- Variante paraphrase-MiniLM-L3-v2: https://huggingface.co/zeromodels/paraphrase-MiniLM-L3-v2
- Variante distiluse-base-multilingual-cased-v1: https://huggingface.co/zeromodels/distiluse-base-multilingual-cased-v1
- Variante distiluse-base-multilingual-cased-v2: https://huggingface.co/zeromodels/distiluse-base-multilingual-cased-v2

Nota: la búsqueda web asociada no devolvió ninguna fuente relacionada con el modelo; los únicos resultados obtenidos fueron páginas de mapas y direcciones sin relación con el contenido de esta ficha.
