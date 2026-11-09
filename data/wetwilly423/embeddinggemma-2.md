# Wetwilly423/embeddinggemma-2

## Resumen

EmbeddingGemma 2 es un modelo de embeddings multimodal desarrollado por Google DeepMind que proyecta texto (incluido código), imágenes, vídeo y audio —y combinaciones de estos— en un único espacio vectorial compartido de 768 dimensiones. Con 740 millones de parámetros totales, combina un backbone de texto de 270M con encoders modulares de visión (170M) y audio (300M), lo que permite cargar únicamente las modalidades necesarias para cada caso de uso.

El modelo está diseñado para ejecutarse en hardware de consumo, como portátiles y dispositivos móviles, ofreciendo representaciones semánticas de baja latencia para búsqueda, generación aumentada por recuperación (RAG), clasificación y clustering. Hereda las innovaciones arquitectónicas de Gemma 4 y añade soporte nativo para cuatro modalidades en un mismo espacio de embeddings.

Su relevancia actual radica en la combinación de multimodalidad nativa, multilingüismo (más de 100 idiomas), soporte de Matryoshka Representation Learning (MRL) para truncar embeddings a 128d, 256d o 512d con pérdida mínima de calidad, y una ventana de contexto de 8.192 tokens. Esta ficha describe la publicación `Wetwilly423/embeddinggemma-2`, un espejo del modelo original de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención GQA/MQA, ventana deslizante y FFN con GELU; encoders multimodales modulares |
| Parametros totales | 744.371.512 (740M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingüe (más de 100 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Backbone de texto | 130M transformer + 140M embedder (270M) |
| Encoder de vision | 170M parámetros |
| Encoder de audio | 300M parámetros |
| Capas | 24 |
| Dimension del modelo | 512 |
| Dimension oculta | 2.048 |
| Ventana deslizante | 1.024 tokens |
| Tamano de vocabulario | 262.144 |
| Numero de cabezas | 4 |
| Cabezas KV (local/global) | 2/1 |
| Proporcion local:global | 5:1 |
| Pooling | Mean pooling |
| Capa de proyeccion | 512 → 768 |
| Dimension de salida nativa | 768 |
| Dimensiones MRL | 128, 256, 512 |
| Modalidades de entrada | Texto, imágenes, vídeo, audio |
| Tamano del repositorio | 1,5 GB |

## Arquitectura y entrenamiento

EmbeddingGemma 2 se basa en un transformer de 24 capas con dimensión de modelo de 512 y dimensión oculta de 2.048, empleando atención con query grouping (GQA) y multi-query (MQA), con 4 cabezas de atención y 2/1 cabezas KV locales/globales en una proporción 5:1. Incorpora una ventana deslizante de 1.024 tokens dentro de un contexto total de 8.192 tokens, activación GELU en un FFN con gating, mean pooling y una capa de proyección de 512 a 768 dimensiones. El backbone de texto (270M: 130M transformer más 140M embedder) se complementa con encoders de visión (170M) y audio (300M) que pueden cargarse selectivamente.

El modelo soporta Matryoshka Representation Learning (MRL), lo que permite truncar los embeddings nativos de 768d a 512d, 256d o 128d y renormalizarlos, reduciendo el coste de almacenamiento vectorial hasta 6 veces con impacto mínimo en calidad hasta 256d. Emplea prefijos de instrucción textuales ligeros para orientar las representaciones hacia distintas tareas (búsqueda, clasificación, clustering, similitud semántica). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de embeddings multimodales nativos para texto, imágenes, vídeo y audio en un espacio vectorial compartido de 768 dimensiones.
- Procesamiento de texto incluyendo código, con una mejora de aproximadamente el 14% en tareas de código respecto a su predecesor.
- Soporte multilingüe de más de 100 idiomas.
- Embeddings truncables mediante MRL a 128d, 256d y 512d.
- Representaciones dirigidas por tarea mediante prefijos de instrucción de texto.
- Procesamiento de minutos de audio o vídeo gracias a la ventana de contexto de 8.192 tokens.
- Capacidades de similitud semántica entre frases, recuperación, clasificación y clustering.
- Extracción de características de imagen, audio y vídeo.
- No se documenta en la información disponible soporte de tool calling, function calling ni razonamiento agéntico multi-paso, dado que es un modelo de embeddings y no generativo.

## Casos de uso

- Búsqueda semántica multimodal: indexar texto, imágenes, audio y vídeo en un único espacio de 768 dimensiones permite consultas cruzadas entre modalidades, por ejemplo buscar vídeos mediante una descripción textual, aprovechando la ventana de 8.192 tokens para contenidos de varios minutos.
- RAG (generación aumentada por recuperación): el modelo genera embeddings de documentos y consultas para recuperar contexto relevante antes de pasarlo a un LLM; el truncado MRL a 256d reduce el almacenamiento vectorial a un tercio con pérdida mínima de calidad.
- Clasificación y clustering de contenido: agrupar documentos, imágenes o clips de audio por similitud semántica en pipelines de moderación, deduplicación o organización de catálogos.
- Búsqueda de código: con una mejora del 14% en tareas de código, puede indexar repositorios y recuperar fragmentos relevantes a partir de descripciones en lenguaje natural o consultas en otros lenguajes.
- Procesamiento de documentos visuales: los resultados en MMEB v2 (VisDoc, NDCG@5 de 67,84) lo hacen adecuado para recuperación sobre documentos escaneados o capturas con contenido textual.
- Recuperación de audio y vídeo: con resultados en MSEB (MRR@10 de 69,54) y MMEB v2 Video (Hit@1 de 50,67), sirve para buscar fragmentos de audio o vídeo por contenido semántico.
- Despliegue en dispositivo: al estar pensado para hardware de consumo, permite búsqueda y clasificación locales en portátiles y móviles sin depender de la nube, con carga selectiva de solo las modalidades necesarias.

## Benchmarks y rendimiento

Resultados globales a 768d (checkpoint de precisión completa):

| Modalidad | Benchmark | Métrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB (multilingual, v2) | Mean(Task), Multiple | 61,36 | 61,15 |
| Texto | MTEB (code, v1) | Mean(Task), NDCG@10 | 78,68 | 68,76 |
| Imagen | MIEB (lite) | Mean(TaskType), Multiple | 65,67 | no disponible |
| Imagen | MMEB v2 (Image) | Mean(Task), Hit@1 | 57,28 | no disponible |
| Imagen | MMEB v2 (VisDoc) | Mean(Task), NDCG@5 | 67,84 | no disponible |
| Vídeo | MMEB v2 (Video) | Mean(Task), Hit@1 | 50,67 | no disponible |
| Audio | MSEB (Retrieval) | Mean(Task), MRR@10 | 69,54 | no disponible |
| Audio | MAEB (Hugging Face) | Mean(Task), Multiple | 49,87 | no disponible |

Resultados con truncado vectorial (MRL):

| Dimension | Ratio de compresion | MTEB multilingual v2 | MTEB eng v2 | MTEB code v1 | MIEB lite | MMEB v2 Overall | MSEB Retrieval | MAEB |
|---|---|---|---|---|---|---|---|---|
| 768d (completa) | 1:1 | 61,36 | 68,46 | 78,68 | 65,67 | 59,01 | 69,54 | 49,87 |
| 512d | 1:1,5 | 61,17 | 68,41 | 77,24 | 65,34 | 58,38 | 69,18 | 49,76 |
| 256d | 1:3 | 60,41 | 67,78 | 76,18 | 64,16 | 56,24 | 66,76 | 49,13 |
| 128d | 1:6 | 57,89 | 65,68 | 71,41 | 59,97 | 45,65 | 56,71 | 47,28 |

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repositorio es de 1,5 GB en safetensors, por lo que el modelo completo en precisión nativa requiere en torno a 1,5-2 GB de memoria, más el coste de activaciones durante la inferencia.
- Carga selectiva: al poder cargar solo las modalidades necesarias, el backbone de texto (270M) se puede desplegar con un consumo mucho menor que el modelo completo con visión y audio.
- GPU recomendadas: no se especifican en la información disponible; el modelo está diseñado explícitamente para hardware de consumo como portátiles y dispositivos móviles.
- GPU de consumo: por su tamaño (740M parámetros) y su orientación a dispositivo, cabe en GPU de consumo ampliamente, aunque no se detallan modelos concretos.
- Opciones de despliegue: la librería indicada es transformers; la model card menciona sentence-transformers para la puesta en marcha. No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no se publican cifras concretas; la model card indica que ofrece representaciones semánticas de baja latencia para aplicaciones en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | MTEB multilingual v2 |
|---|---|---|---|---|---|
| EmbeddingGemma 2 | 740M | 8.192 tokens | Texto, imagen, vídeo, audio | Apache 2.0 | 61,36 |
| EmbeddingGemma 1 | no disponible | no disponible | Texto | no disponible | 61,15 |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con EmbeddingGemma 1, su predecesor, sobre el que mejora en MTEB code (78,68 frente a 68,76) y ligeramente en MTEB multilingual (61,36 frente a 61,15), además de añadir multimodalidad nativa. No se dispone de datos de otros modelos de embeddings comparables en la información disponible.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no produce texto ni responde instrucciones; su salida son vectores.
- Riesgo de alucinación no aplica en el sentido generativo, pero las representaciones pueden no capturar matices semánticos en dominios muy especializados.
- El truncado a 128d degrada notablemente el rendimiento en tareas multimodales (MMEB v2 Overall cae de 59,01 a 45,65); la model card recomienda 128d solo para cargas de texto.
- La ventana de contexto de 8.192 tokens limita la longitud de audio o vídeo procesable en una sola pasada.
- No se documentan sesgos conocidos en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo original de Google DeepMind, ya que esta publicación es un espejo de `Wetwilly423`.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (9 de noviembre de 2026); no hay evidencia de validación comunitaria de esta copia concreta.
- No se detallan en la información disponible los tipos de cuantización soportados ni el rendimiento en producción.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/Wetwilly423/embeddinggemma-2
- Modelo original en Hugging Face: https://huggingface.co/google/embeddinggemma-2
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentación: https://ai.google.dev/gemma/docs/embeddinggemma
- Informe técnico (arXiv): https://arxiv.org/abs/2610.37364
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
