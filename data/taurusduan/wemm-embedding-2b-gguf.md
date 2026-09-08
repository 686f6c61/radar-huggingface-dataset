# taurusduan/WeMM-Embedding-2B-GGUF

## Resumen

WeMM-Embedding-2B es un modelo de embedding multimodal universal desarrollado por el equipo WeChat Vision de Tencent. Está construido sobre Qwen3.5 y acepta entradas de texto, imágenes, vídeos, documentos visuales y combinaciones intercaladas de estos modos. Devuelve un vector de 2048 dimensiones normalizado con norma L2. El modelo no soporta audio.

El repositorio `taurusduan/WeMM-Embedding-2B-GGUF` es la versión en formato GGUF del modelo original `tencent/WeMM-Embedding-2B`, preparada para su uso con runtimes como llama.cpp u Ollama. Incluye un archivo `mmproj` separado para la carga multimodal. El modelo se publica bajo licencia Apache 2.0 y los pesos completos suman aproximadamente 2.400 millones de parámetros.

Este modelo es relevante en el contexto actual porque proporciona representaciones unificadas de alta calidad para tareas de búsqueda multimodal, recuperación de información y comparación de contenido en dos idiomas (chino e inglés), compitiendo con modelos propietarios y superando a otras alternativas abiertas de tamaño similar en el benchmark MMEB-v2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen3.5 |
| Parametros totales | 2.389.393.216 (≈2.400 millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (dos archivos; tipos de cuantizacion no especificados) |
| Idiomas soportados | Chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye mmproj para vision) |

## Arquitectura y entrenamiento

WeMM-Embedding-2B es un modelo denso basado en la arquitectura de Qwen3.5, adaptado para producir embeddings multimodales. La salida es un vector L2-normalizado de 2048 dimensiones, lo que permite comparaciones por similitud coseno. El modelo incorpora Matryoshka Representation Learning (MRL), lo que significa que los embeddings se pueden truncar a dimensiones menores (por ejemplo, 256) sin una perdida severa de rendimiento; segun la documentacion, con 256 dimensiones se conserva el 98.7% del rendimiento en imagenes y videos en MMEB-v2.

El entrenamiento ha sido realizado por el equipo WeChat Vision de Tencent. El modelo viene con un procesador propio en Transformers que admite entradas con texto, imagenes y videos de forma intercalada. Para su uso con Sentence Transformers, el modelo ofrece metodos `encode_query` y `encode_document`, diferenciando claramente entre consultas y documentos. No se han publicado detalles sobre el dataset de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO.

## Capacidades

- Generacion de embeddings para texto, imagen, video, documentos visuales y entradas intercaladas (mezcla de varios modos en una sola entrada).
- Salida de vectores de 2048 dimensiones L2-normalizados, aptos para busqueda por similitud y recuperacion.
- Soporte de embeddings Matryoshka: se pueden truncar a dimensiones mas pequenas (por ejemplo, 256, 512) y renormalizar, perdiendo poca precision.
- No soporta audio.
- Compatible con el eco de Hugging Face Transformers mediante `trust_remote_code`, y con Sentence Transformers a traves de `encode_query` y `encode_document`.
- Capacidades multilingues limitadas a chino e ingles.
- No es un modelo generativo, por lo que no soporta tool calling, agentes ni razonamiento de multiples pasos.
- Sirve como modelo de embedding en runtimes como vLLM y SGLang para despliegue en produccion.

## Casos de uso

- Busqueda multimodal en bases de conocimiento: indexar documentos de texto, imagenes y videos en una base vectorial y recuperarlos mediante consultas en texto o imagen. El modelo permite comparar directamente una consulta textual con entradas de varios modos.
- Busqueda de productos en e-commerce: los usuarios pueden buscar articulos usando una foto, un video de producto o una descripcion textual. Los embeddings generados ayudan a encontrar articulos visualmente similares.
- Moderacion de contenido en plataformas: clasificar y agrupar imagenes y videos potencialmente problematicos mediante la similaridad de sus representaciones, facilitando la deteccion de contenido duplicado o prohibido.
- Analisis de documentos visuales: extraer y comparar informacion de capturas de pantalla, facturas, presentaciones u otros documentos con contenido visual. El modelo soporta documentos visuales de forma nativa.
- Recomendacion de videos: calcular la similaridad entre videos y las preferencias de un usuario, o entre videos y consultas textuales, para construir sistemas de recomendacion.
- Asistencia en accesibilidad: generar embeddings de contenido visual para que sistemas de descripcion automatica puedan relacionar imagenes con descripciones textuales en aplicaciones de ayuda a personas con discapacidad visual.
- Analisis de contenido de video en seguridad: buscar en grabaciones de camaras eventos especificos a partir de una consulta de texto, comparando el embedding de un fragmento de video con la representacion de la consulta.

## Benchmarks y rendimiento

Se han publicado resultados en el benchmark MMEB-v2, que cubre 78 datasets con tareas de imagen, video y documentos visuales. Las metricas utilizadas son Hit@1 para imagen y video, y NDCG@5 para documentos visuales. Los valores mas altos indican mejor rendimiento.

| Modelo | Tamano | AVG | Image | Video | VisDoc |
|---|---|---|---:|---:|---:|---:|
| VLM2Vec | 2B | 47.8 | 59.7 | 29.0 | 44.0 |
| GME | 2B | 55.4 | 51.9 | 33.9 | 76.8 |
| VLM2Vec-V2 | 2B | 59.3 | 64.9 | 34.9 | 69.2 |
| Qwen3-VL-Embedding | 2B | 73.2 | 75.0 | 61.9 | 79.2 |
| DME-Small | 2B | 74.8 | 75.9 | 65.6 | 79.9 |
| WeMM-Embedding | 2B | 77.9 | 79.6 | 70.8 | 80.7 |
| WeMM-Embedding | 4B | 79.2 | 80.8 | 72.1 | 82.0 |

Segun el informe tecnico, el modelo de 2B tambien se compara favorablemente con modelos propietarios en la suite de recuperacion multimodal de Gemini Embedding 2.

## Requisitos de hardware

- No se han publicado datos oficiales de VRAM para inferencia en la informacion disponible.
- Al ser un modelo de aproximadamente 2.400 millones de parametros en formato GGUF, se espera que sea ejecutable en GPUs de consumo, aunque la VRAM necesaria depende de la cuantizacion exacta.
- El repositorio GGUF incluye un archivo mmproj en bf16 para el procesamiento visual, lo que incrementa los requisitos de memoria.
- Opciones de despliegue documentadas: vLLM (version 0.27.0 o superior) con `--runner pooling`, y SGLang (version 0.5.9 o superior) con `--is-embedding`. Tambien es compatible con llama.cpp y Ollama, ya que los metadatos GGUF incluyen el tipo de pooling `last-token`.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | MMEB-v2 AVG | Licencia | Formato disponible |
|---|---|---|---|---|---|
| WeMM-Embedding (2B) | 2B | No disponible | 77.9 | Apache 2.0 | GGUF, safetensors |
| Qwen3-VL-Embedding (2B) | 2B | No disponible | 73.2 | No disponible | No disponible |
| DME-Small (2B) | 2B | No disponible | 74.8 | No disponible | No disponible |
| GME (2B) | 2B | No disponible | 55.4 | No disponible | No disponible |

WeMM-Embedding (2B) supera a todos los modelos comparados de 2B en MMEB-v2, con una ventaja notable en tareas de video (70.8 frente a 61.9 de Qwen3-VL-Embedding). Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Limitaciones y advertencias

- No soporta entradas de audio, a diferencia de algunos modelos multimodales que integran este modo.
- Los idiomas soportados se limitan a chino e ingles, por lo que no es adecuado para tareas multilingues amplias.
- La longitud de contexto no se ha especificado; para documentos muy extensos, el comportamiento puede degradarse.
- Al ser un modelo de embedding, no genera texto ni respuestas; su funcion se limita a producir vectores de representacion.
- La calidad de los embeddings puede ser menor en dominios muy especializados o con vocabulario tecnico fuera de los datos de entrenamiento.
- La documentacion no menciona sesgos especificos, pero, como en cualquier modelo entrenado con datos reales, los embeddings pueden heredar sesgos presentes en el corpus de entrenamiento.
- Para uso en produccion, es necesario evaluar el rendimiento en el dominio concreto y validar la calidad de la recuperacion, especialmente con documentos visuales.

## Enlaces

- Repositorio Hugging Face (version GGUF): https://huggingface.co/taurusduan/WeMM-Embedding-2B-GGUF
- Repositorio Hugging Face (modelo original): https://huggingface.co/tencent/WeMM-Embedding-2B
- GitHub oficial de WeMM-Embedding: https://github.com/Tencent/WeMM-Embedding
- Informe tecnico en arXiv: https://arxiv.org/abs/2608.24053
- Repositorio GGUF alternativo: https://huggingface.co/Weidows/WeMM-Embedding-2B-GGUF
