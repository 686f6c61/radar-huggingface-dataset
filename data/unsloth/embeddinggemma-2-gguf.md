# unsloth/embeddinggemma-2-GGUF

## Resumen

EmbeddingGemma 2 es un modelo de embeddings multimodal desarrollado por Google DeepMind que proyecta texto (incluido codigo), imagenes, video y audio —y combinaciones de estas modalidades— en un unico espacio vectorial de 768 dimensiones. El modelo completo suma 740M de parametros, distribuidos en un backbone de texto de 270M (130M de transformer mas 140M de embedder) y dos codificadores modulares que se pueden cargar de forma selectiva: vision (170M) y audio (300M). Su diseno esta orientado a ejecucion en hardware de consumo, como portatiles y dispositivos moviles.

La version aqui documentada, `unsloth/embeddinggemma-2-GGUF`, es una conversion a formato GGUF publicada por Unsloth sobre el checkpoint `google/embeddinggemma-2`. El recuento de parametros del repositorio (271.002.648) coincide con el backbone de texto, por lo que la conversion esta pensada para cargas de trabajo de embeddings de texto en entornos con recursos limitados mediante llama.cpp y herramientas compatibles.

La relevancia de este lanzamiento esta en tres ejes: la unificacion de cuatro modalidades en un mismo espacio vectorial, el soporte nativo de Matryoshka Representation Learning (MRL) con dimensiones truncables a 128, 256 y 512 (hasta 6 veces menos almacenamiento vectorial con impacto minimo hasta 256d) y una ventana de contexto de 8.192 tokens. Frente a EmbeddingGemma 1 mejora en tareas de codigo (78,68 frente a 68,76 en MTEB code v1) y mantiene un rendimiento practicamente identico en MTEB multilingual v2 (61,36 frente a 61,15).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con atencion GQA/MQA, patron local:global 5:1, activacion Gated FFN con GELU, mean pooling y capa de proyeccion 512→768. Codificadores modulares adicionales para vision y audio |
| Parametros totales | 740M (modelo completo). El repositorio GGUF declara 271.002.648 parametros, correspondientes al backbone de texto (130M transformer + 140M embedder) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (ventana deslizante de 1.024 tokens) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada. El repositorio distribuye pesos en formato GGUF |
| Idiomas soportados | Multilingue (la model card del modelo base indica mas de 100 idiomas, incluido codigo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el checkpoint original de `google/embeddinggemma-2` esta en safetensors) |

Datos arquitectonicos adicionales del modelo base: 24 capas, dimension de modelo 512, dimension oculta 2.048, tamano de vocabulario 262.144, 4 cabezas de atencion y 2/1 cabezas KV (local/global). Dimension nativa de salida: 768. Dimensiones de truncado MRL: 128, 256 y 512.

## Arquitectura y entrenamiento

EmbeddingGemma 2 es un encoder transformer derivado de los avances arquitectonicos y de capacidad de Gemma 4. La parte de texto consta de un backbone de 130M de parametros (24 capas, dimension de modelo 512, dimension oculta 2.048) mas un embedder de 140M de parametros que produce la representacion final. La atencion combina GQA/MQA con un patron de capas locales y globales en proporcion 5:1 y una ventana deslizante de 1.024 tokens, lo que reduce el coste de atencion en contextos largos. El pooling es de tipo mean pooling y una proyeccion final transforma la salida de 512 a 768 dimensiones.

La multimodalidad es nativa y modular: los codificadores de vision (170M) y audio (300M) se pueden cargar de forma independiente segun el caso de uso, de modo que una aplicacion puramente textual no paga el coste de memoria de las otras modalidades. El modelo soporta representaciones guiadas por tarea mediante prefijos de instruccion ligeros en texto, lo que permite optimizar los embeddings para busqueda, clasificacion, clustering o similitud semantica sin reentrenar. El soporte de MRL permite truncar y renormalizar los vectores de salida a 128d, 256d y 512d.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Los resultados de benchmark publicados corresponden al checkpoint en precision completa.

## Capacidades

- Generacion de embeddings de texto y codigo de alta calidad en un espacio de 768 dimensiones, con soporte de truncado MRL a 128, 256 y 512 dimensiones.
- Embeddings de imagen, documento visual, video y audio en el mismo espacio vectorial compartido que el texto.
- Recuperacion y similitud entre modalidades (por ejemplo, consulta de texto contra corpus de imagenes o audio).
- Procesamiento de entradas multimodales combinadas dentro de una misma representacion.
- Multilingue: mas de 100 idiomas segun la model card del modelo base.
- Representaciones guiadas por tarea mediante prefijos de instruccion (busqueda, clasificacion, clustering, similitud semantica).
- Capacidad de procesar minutos de audio o video gracias a la ventana de contexto de 8.192 tokens.
- Al ser un modelo de `feature-extraction`, no realiza generacion de texto, tool calling ni razonamiento multi-paso por si mismo; se integra como componente de recuperacion dentro de pipelines mayores.

## Casos de uso

- Busqueda semantica multilingue en produccion: el modelo indexa documentos en mas de 100 idiomas en un unico espacio de 768 dimensiones y permite consultas cruzadas entre idiomas sin traduccion intermedia, con la ventana de 8.192 tokens para fragmentos largos.
- RAG (retrieval-augmented generation) en dispositivos: con 270M de parametros en el backbone de texto, se puede ejecutar la fase de recuperacion en un portatil o incluso en movil, manteniendo los datos del usuario fuera de la nube.
- Recuperacion de codigo en asistentes de desarrollo: la mejora del 14% en tareas de codigo respecto a la version anterior (78,68 en MTEB code v1) lo hace adecuado para indexar repositorios, buscar funciones por descripcion en lenguaje natural y alimentar agentes de programacion.
- Clustering y deduplicacion de corpus multimodales: agrupar imagenes, fragmentos de audio o documentos visuales por similitud semantica para curación de datasets, moderacion de contenido o analisis de colecciones.
- Busqueda visual y de video: indexar fotogramas o clips y permitir consultas textuales sobre ellos, usando el codificador de vision de 170M cargado de forma selectiva.
- Recuperacion sobre audio: transcripcion-independiente para localizar fragmentos de audio por descripcion semantica (MSEB Retrieval con MRR@10 de 69,54), util en catalogos de podcasts o archivos de reuniones.
- Clasificacion de tickets y enrutado en atencion al cliente: los embeddings sirven como entrada a un clasificador ligero para dirigir consultas al equipo adecuado, sin necesidad de un LLM generativo.
- Sistemas de recomendacion basados en contenido: representar items y preferencias del usuario en un mismo espacio vectorial para calcular similitud de forma eficiente.
- Despliegue en almacenamiento vectorial de bajo coste: gracias a MRL, truncar a 256d reduce el almacenamiento de vectores 3 veces con un impacto minimo (MTEB multilingual v2 pasa de 61,36 a 60,41), y a 128d lo reduce 6 veces para cargas solo de texto.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo base, obtenidos con el checkpoint en precision completa (768d):

| Modalidad | Benchmark | Metrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB (multilingual, v2) | Mean(Task) | 61,36 | 61,15 |
| Texto | MTEB (code, v1) | Mean(Task), NDCG@10 | 78,68 | 68,76 |
| Imagen | MIEB (lite) | Mean(TaskType) | 64,64 | No disponible |
| Imagen | MMEB v2 - Image | Mean(Task), Hit@1 | 57,28 | No disponible |
| Imagen | MMEB v2 - VisDoc | Mean(Task), NDCG@5 | 67,84 | No disponible |
| Video | MMEB v2 - Video | Mean(Task), Hit@1 | 50,67 | No disponible |
| Audio | MSEB (Retrieval) | Mean(Task), MRR@10 | 69,54 | No disponible |
| Audio | MAEB (Hugging Face) | Mean(Task) | 49,39 | No disponible |

Evaluacion con truncado de vectores (MRL):

| Dimension de salida | Ratio de compresion | MTEB multilingual v2 | MTEB eng v2 | MTEB code v1 | MIEB (lite) | MMEB v2 (overall) | MSEB Retrieval | MAEB |
|---|---|---|---|---|---|---|---|---|
| 768d (completa) | 1:1 | 61,36 | 68,46 | 78,68 | 64,64 | 59,01 | 69,54 | 49,39 |
| 512d | 1:1,5 | 61,17 | 68,41 | 77,24 | 64,32 | 58,38 | 69,18 | 49,21 |
| 256d | 1:3 | 60,41 | 67,78 | 76,18 | 63,13 | 56,24 | 66,76 | 48,91 |
| 128d | 1:6 | 57,89 | 65,68 | 71,41 | 59,06 | 45,65 | 56,71 | 46,92 |

No se han publicado resultados de benchmarks especificos para la version cuantizada en GGUF de Unsloth en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el backbone de texto (270M parametros): aproximadamente 540 MB en FP16, 270 MB en INT8 y en torno a 140-200 MB en cuantizaciones GGUF de 4 bits. Son estimaciones calculadas a partir del numero de parametros, no datos publicados por el autor.
- VRAM estimada para el modelo completo en FP16 (740M parametros): aproximadamente 1,5 GB, mas el coste de activaciones y del contexto.
- Codificadores opcionales: vision (170M) en torno a 340 MB en FP16 y audio (300M) en torno a 600 MB en FP16. Al ser cargables de forma selectiva, solo se paga el coste de las modalidades que se utilicen.
- GPU recomendadas: practicamente cualquier GPU consumer moderna sirve para el backbone de texto (RTX 3060, RTX 4060, RTX 4090). Para lotes grandes o las tres modalidades simultaneas conviene una GPU con 8-16 GB o superior (RTX 4090, L4, A10G). En A100 o H100 el modelo queda limitado por el ancho de banda y por el tamano de lote, no por la memoria.
- Compatibilidad con GPU consumer: si, el backbone de texto cabe sin problema en GPUs con 4 GB o mas de VRAM, y en cuantizacion de 4 bits es viable incluso en CPU.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) para los ficheros GGUF; `sentence-transformers` y `transformers` para el checkpoint en precision completa; servidores de embeddings propios sobre llama.cpp. La compatibilidad con vLLM, TGI u otros servidores de inferencia no se detalla en la informacion disponible.
- Latencia y throughput: no disponibles. El autor no publica mediciones de latencia ni de tokens por segundo para esta conversion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de salida | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EmbeddingGemma 2 (esta ficha) | 740M (270M solo texto) | 8.192 tokens | 768 (truncable a 128/256/512) | Si (texto, imagen, video, audio) | Apache 2.0 | HuggingFace (GGUF y safetensors) |
| EmbeddingGemma 1 | No disponible en la informacion proporcionada | No disponible | No disponible | No (solo texto, segun los benchmarks publicados en la model card) | Apache 2.0 | HuggingFace |
| BGE-M3 | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible | No disponible |
| Qwen3-Embedding | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion cuantitativa solo es posible frente a EmbeddingGemma 1 dentro de la informacion proporcionada. La mejora mas destacada es en tareas de codigo (78,68 frente a 68,76, un 14% relativo) y el salto cualitativo es la incorporacion de las modalidades de imagen, video y audio, ausentes en la generacion anterior segun los datos publicados.

## Limitaciones y advertencias

- Los benchmarks publicados corresponden al checkpoint en precision completa. No hay datos sobre la degradacion de calidad introducida por la cuantizacion GGUF, que puede afectar de forma perceptible a modelos de embeddings de este tamano.
- El recuento de parametros del repositorio GGUF (271M) corresponde al backbone de texto. No hay informacion sobre si los codificadores de vision (170M) y audio (300M) estan incluidos en los ficheros GGUF publicados; conviene verificar que modalidades cubre realmente la conversion antes de planificar un despliegue multimodal con ella.
- La model card del repositorio consultado esta truncada, por lo que no se dispone de la seccion completa de uso, limitaciones ni ejemplos de codigo.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto, pero si existe riesgo de recuperaciones irrelevantes o falsos positivos en similitud semantica cuando se usa fuera de la distribucion de entrenamiento.
- Sesgos: no se documenta en la informacion disponible ninguna evaluacion de sesgos ni de equidad. Un modelo multilingue de mas de 100 idiomas tiende a rendir peor en lenguas con menos recursos, aunque no hay datos concretos por idioma.
- Limitacion de contexto: la ventana de 8.192 tokens obliga a fragmentar documentos largos. La ventana deslizante de 1.024 tokens condiciona el alcance de la atencion local en cada capa.
- El truncado a 128d degrada de forma notable las tareas multimodales (MMEB v2 cae de 59,01 a 45,65), por lo que el autor lo restringe a cargas de trabajo solo de texto.
- Licencia Apache 2.0, sin las restricciones de uso comercial que Google aplica a otros modelos de la familia Gemma. Aun asi, conviene revisar los terminos concreto enlazados en la model card del modelo base.
- La fecha de creacion del repositorio que aparece en los metadatos (2026-10-06) es posterior a la actualidad conocida; se reproduce tal cual figura en la fuente.

## Enlaces

- Repositorio GGUF de Unsloth: https://huggingface.co/unsloth/embeddinggemma-2-GGUF
- Modelo base en HuggingFace: https://huggingface.co/google/embeddinggemma-2
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentacion de Google AI: https://ai.google.dev/gemma/docs/embeddinggemma
- Licencia del modelo base: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de la familia Gemma en Google DeepMind: https://deepmind.google/models/gemma/
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre sus autores; los enlaces anteriores proceden de los metadatos y de la model card del propio repositorio.
