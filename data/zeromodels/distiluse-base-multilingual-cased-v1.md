# zeromodels/distiluse-base-multilingual-cased-v1

## Resumen

`zeromodels/distiluse-base-multilingual-cased-v1` es una conversión pura a Keras 3 del checkpoint `sentence-transformers/distiluse-base-multilingual-cased-v1`, publicada por el proyecto ZeroModels. No se trata de un modelo nuevo ni de un reentrenamiento: es una reimplementación de los pesos originales en el ecosistema Keras 3, manteniendo la receta de embeddings de la fuente (pooling por media, proyección densa de 512 dimensiones con activación tanh, sin normalización L2 y similitud coseno como función de scoring). El backbone es DistilBERT, un transformer encoder destilado de BERT.

El modelo resuelve el problema de generar embeddings de frases y párrafos multilingües para tareas de similitud semántica, búsqueda y clustering. Su relevancia actual es doble: por un lado, permite ejecutar un sentence transformer clásico dentro de Keras 3 con backend Torch, TensorFlow o JAX, lo que facilita integrarlo en pipelines que ya usan ese stack; por otro, ofrece una alternativa ligera y madura frente a encoders más grandes para recuperación semántica en producción.

La conversión fue verificada contra el checkpoint original fijado a la revisión `826fee3d516ebb14987355af373f5b69101c7006`, con una diferencia absoluta máxima de embeddings de `8.80137e-05` y un coseno mínimo de `0.99999982`, lo que indica una paridad numérica prácticamente exacta. El repositorio ocupa 0,5 GB y contiene `model.weights.h5`, `zm_config.json` y `tokenizer.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT) con pooling por media y proyección densa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de entrada) |
| Tipos de cuantizacion | no disponible (pesos en `model.weights.h5`, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | multilingüe (el checkpoint original está entrenado sobre corpus multilingüe; la model card no enumera la lista concreta de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras HDF5 (`model.weights.h5`) más `zm_config.json` y `tokenizer.json` |

| Parametro adicional | Valor |
|---|---|
| Dimensión de embedding | 512 |
| Pooling | media (mean) |
| Proyección densa | 512 dimensiones con activación tanh |
| Normalización L2 | no |
| Función de scoring | similitud coseno |
| Backbone | DistilBERT |
| Modelo base | sentence-transformers/distiluse-base-multilingual-cased-v1 |
| Revisión del checkpoint fuente | 826fee3d516ebb14987355af373f5b69101c7006 |
| Librería | zeromodels (Keras 3) |
| Tamaño del repo | 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura es un encoder DistilBERT, la variante destilada de BERT con aproximadamente la mitad de capas que el modelo original. Sobre la salida del encoder se aplica un pooling por media de los tokens y una proyección densa de 512 dimensiones con activación tanh, que produce el vector final de embedding. Los embeddings no se normalizan L2, por lo que la similitud debe calcularse con coseno (o normalizando explícitamente antes de usar producto escalar). La longitud máxima de entrada es de 128 tokens, un límite relativamente corto que condiciona los casos de uso.

Esta publicación no introduce un entrenamiento nuevo: es una conversión de pesos con paridad verificada frente al checkpoint original. Por tanto, los datos de entrenamiento, el número de tokens y el proceso de optimización (incluido si hubo destilación supervisada, objetivos de similitud o ajuste fino con pares) corresponden al modelo de Sentence Transformers original y no se detallan en la información disponible. La innovación técnica de esta ficha es la propia conversión a Keras 3, que permite cargar los pesos con `ZMSentenceTransformer.from_weights(repo)` y ejecutar la inferencia en el backend de Keras seleccionado.

## Capacidades

- Generación de embeddings de frases y párrafos de 512 dimensiones para similitud semántica.
- Codificación multilingüe: el checkpoint original está pensado para textos en varios idiomas, aunque la lista exacta no se detalla.
- Similitud coseno integrada mediante `model.similarity()`, con opción de normalización L2 explícita en `model.encode(..., normalize=True)`.
- Tokenizador propio empaquetado en el repositorio (`tokenizer.json`) con truncación a 128 tokens.
- Ejecución en Keras 3 con backend configurable (Torch verificado; paridad completa con TensorFlow y JAX no declarada).
- Carga del checkpoint fuente original mediante `ZMSentenceTransformer.from_weights("hf:sentence-transformers/distiluse-base-multilingual-cased-v1")`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un encoder de embeddings, no un modelo generativo.

## Casos de uso

- Búsqueda semántica en bases documentales: indexar fragmentos de hasta 128 tokens y recuperar por similitud coseno; adecuado por su tamaño reducido y su naturaleza multilingüe.
- Deduplicación y clustering de textos: agrupar noticias, tickets o reseñas calculando similitud entre embeddings de 512 dimensiones, con un coste de inferencia bajo.
- Clasificación de textos por similitud con prototipos: comparar cada documento con embeddings de referencia de cada categoría, sin necesidad de entrenar un clasificador supervisado.
- Detección de paráfrasis y preguntas duplicadas: el par de ejemplo de la model card ("A person is reading a book." frente a "Someone reads a novel.") ilustra el uso directo para medir equivalencia semántica.
- Filtrado y ranking en pipelines de RAG: como primera etapa de recuperación sobre pasajes cortos, antes de un reranker más costoso, gracias a su bajo coste computacional.
- Moderación y triaje de contenido: comparar mensajes entrantes con embeddings de referencia de políticas o categorías para enrutarlos a revisión humana.
- Integración en aplicaciones Keras 3 existentes: al cargarse como pesos Keras, puede incorporarse a un grafo de Keras ya desplegado sin añadir una dependencia separada de PyTorch o de sentence-transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de paridad numérica frente al checkpoint original:

| Métrica de paridad | Valor |
|---|---|
| Diferencia absoluta máxima de embeddings | 8.80137e-05 |
| Coseno mínimo entre embeddings | 0.99999982 |
| Diferencia absoluta máxima de score de similitud | 6.05211e-05 |
| Backend verificado | Torch |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio completo ocupa 0,5 GB y el modelo cabe holgadamente en cualquier GPU consumer con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna; para lotes grandes, A100 o H100 aportan throughput, pero no son necesarias para uso individual.
- Cabe en GPU consumer: sí, en cualquier RTX (incluso series antiguas) y en GPUs de portátil con poca memoria.
- Opciones de despliegue: Keras 3 con backend Torch (verificado), TensorFlow o JAX; también es posible cargar el checkpoint original con sentence-transformers y desplegarlo con FastAPI o servicios de embeddings dedicados.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo y la longitud máxima de 128 tokens, se espera un throughput alto en GPU y aceptable en CPU.
- CPU: viable para cargas moderadas dado el tamaño reducido del encoder.

## Comparativa con modelos similares

| Modelo | Backbone | Dimensión | Contexto | Normalización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| zeromodels/distiluse-base-multilingual-cased-v1 | DistilBERT | 512 | 128 | No | Apache 2.0 | Hugging Face (Keras 3) |
| sentence-transformers/distiluse-base-multilingual-cased-v1 | DistilBERT | 512 | 128 | No | Apache 2.0 | Hugging Face (PyTorch) |
| zeromodels/paraphrase-multilingual-MiniLM-L12-v2 | BERT | no disponible | no disponible | Sí (mean) | no disponible | Hugging Face (Keras 3) |
| zeromodels/paraphrase-multilingual-mpnet-base-v2 | XLM-R | no disponible | no disponible | No (mean) | no disponible | Hugging Face (Keras 3) |

La comparación de rendimiento en benchmarks entre estas variantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Ventana de contexto muy corta: 128 tokens; los textos más largos se truncan y pierden información, lo que degrada la recuperación en documentos extensos.
- Embeddings sin normalizar: usar producto escalar directamente en lugar de similitud coseno altera el ranking; hay que normalizar explícitamente si se necesita.
- Paridad verificada solo en el backend Torch; no se garantiza paridad completa en TensorFlow o JAX.
- Es una conversión, no un modelo nuevo: hereda los sesgos y limitaciones del checkpoint original de Sentence Transformers, que no se detallan en la información disponible.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de falsos positivos en similitud semántica (textos distintos con embeddings próximos).
- La lista concreta de idiomas soportados no está documentada en la model card; conviene validar el rendimiento en el idioma objetivo antes de producción.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse la atribución al proyecto original y revisarse las condiciones del checkpoint fuente.
- Popularidad muy baja (4 descargas, 0 likes): no hay evidencia de uso en producción ni comunidad que reporte incidencias.
- El tokenizador debe cargarse del mismo repositorio que el modelo para respetar la truncación a 128 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zeromodels/distiluse-base-multilingual-cased-v1
- Checkpoint original: https://huggingface.co/sentence-transformers/distiluse-base-multilingual-cased-v1
- Revisión fijada del checkpoint original: https://huggingface.co/sentence-transformers/distiluse-base-multilingual-cased-v1/tree/826fee3d516ebb14987355af373f5b69101c7006
- Repositorio ZeroModels en GitHub: https://github.com/IMvision12/ZeroModels
- Documentación de Sentence Transformers en ZeroModels: https://imvision12.github.io/ZeroModels/sentence_transformer/
- Variante v2: https://huggingface.co/zeromodels/distiluse-base-multilingual-cased-v2
