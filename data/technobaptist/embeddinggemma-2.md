# TechnoBaptist/embeddinggemma-2

## Resumen

EmbeddingGemma 2 es un modelo abierto de embeddings multimodales desarrollado por Google DeepMind que proyecta entradas de texto (incluido codigo), imagenes, video y audio, asi como combinaciones de estas, en un unico espacio vectorial compartido de 768 dimensiones. El modelo suma 740M de parametros totales y combina un backbone de texto de 270M (130M de transformer mas 140M de embedder) con encoders modulares de vision (170M) y audio (300M) que pueden cargarse selectivamente segun la modalidad necesaria. La ficha de HuggingFace analizada corresponde a una subida del usuario TechnoBaptist, mientras que el model card y los enlaces apuntan al modelo original de Google DeepMind.

El objetivo del modelo es generar representaciones semantidas de baja latencia para ejecucion en hardware de consumo (moviles, portatiles y equipos de sobremesa), habilitando busqueda semantica, recuperacion aumentada por generacion (RAG), clasificacion y clustering directamente en el dispositivo. Incorpora soporte nativo para Matryoshka Representation Learning (MRL), lo que permite truncar las embeddings a 128, 256 o 512 dimensiones con una degradacion de calidad minima, reduciendo hasta 6 veces el coste de almacenamiento de vectores.

Es relevante porque unifica cuatro modalidades en un unico espacio de embeddings de 768 dimensiones con una ventana de contexto de 8.192 tokens, mantiene soporte para mas de 100 idiomas, mejora aproximadamente un 14% en tareas de codigo respecto a su predecesor y esta publicado bajo licencia Apache 2.0, lo que facilita su adopcion en produccion. El repositorio de HuggingFace analizado registra 0 descargas y 0 likes, y fue creado el 6 de octubre de 2026, por lo que se trata de una copia de la comunidad sin traccion publica verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder multimodal (backbone de texto + encoders de vision y audio) |
| Parametros totales | 744.371.512 (dato real de safetensors); model card indica 740M (130M backbone + 140M embedder + 170M vision + 300M audio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Multilingue (mas de 100 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Detalles adicionales de arquitectura: 24 capas, dimension de modelo 512, dimension oculta 2048, ventana deslizante de 1024 tokens, vocabulario de 262.144 tokens, 4 cabezas de atencion, 2/1 cabezas KV (locales/globales), ratio local:global de 5:1, atencion GQA/MQA, activacion Gated FFN con GELU, pooling por media y capa de proyeccion de 512 a 768. Dimension nativa de salida 768 y dimensiones de truncado MRL en 128, 256 y 512.

## Arquitectura y entrenamiento

EmbeddingGemma 2 es un modelo de embeddings basado en transformer encoder, no un modelo generativo. Su backbone de texto combina un transformer de 130M de parametros con un embedder de 140M, y se complementa con encoders modulares independientes para vision (170M) y audio (300M) que pueden cargarse de forma selectiva, de modo que un despliegue puramente textual no necesita cargar los modulos de vision ni de audio. La atencion usa GQA/MQA con 4 cabezas y un patron de ventana deslizante local:global de 5:1, con ventana deslizante de 1024 tokens sobre un contexto total de 8.192 tokens. La salida se obtiene mediante mean pooling y una proyeccion lineal de 512 a 768 dimensiones.

La innovacion tecnica destacable es el uso nativo de Matryoshka Representation Learning (MRL), que permite truncar las representaciones finales a 128, 256 o 512 dimensiones y renormarlizarlas con una perdida de calidad reducida, habilitando una compresion de hasta 6:1 en almacenamiento de vectores. El modelo tambien emplea representaciones dirigidas por tarea (task-steered representations) mediante prefijos de instruccion de texto ligeros que optimizan las embeddings para busqueda, clasificacion, clustering o similitud semantica. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de embeddings de texto, incluido codigo, con una ventana de contexto de 8.192 tokens.
- Generacion de embeddings de imagenes, video y audio, y de combinaciones multimodales de estas modalidades.
- Proyeccion de las cuatro modalidades en un unico espacio vectorial compartido de 768 dimensiones.
- Truncado nativo de embeddings mediante MRL a 128, 256 y 512 dimensiones con soporte de renormlizacion.
- Similitud semantica entre frases (sentence-similarity) y recuperacion de informacion (retrieval).
- Clasificacion y clustering basados en representaciones vectoriales.
- Extraccion de caracteristicas de imagen, audio y video (image-feature-extraction, audio-feature-extraction, video-feature-extraction).
- Representaciones dirigidas por tarea mediante prefijos de instruccion de texto.
- Soporte multilingue de mas de 100 idiomas.
- No soporta generacion de texto, tool calling ni razonamiento multi-paso por tratarse de un modelo de embeddings, no de un modelo generativo.

## Casos de uso

- RAG en el dispositivo: el modelo puede indexar y recuperar fragmentos de documentos para pipelines de recuperacion aumentada por generacion ejecutados localmente, gracias a sus 8.192 tokens de contexto y a la posibilidad de truncar embeddings a 256 dimensiones para reducir el almacenamiento del indice vectorial.
- Busqueda semantica multilingue: permite consultar corpus en mas de 100 idiomas y recuperar documentos relevantes por similitud semantica, con embeddings de 512 o 768 dimensiones cuando prima la calidad y de 256 dimensiones cuando prima el coste.
- Busqueda de codigo: con la mejora de aproximadamente un 14% en tareas de codigo respecto a EmbeddingGemma 1, resulta adecuado para indexar repositorios y recuperar fragmentos relevantes por descripcion en lenguaje natural.
- Recuperacion de documentos visuales: al generar embeddings de imagenes, permite indexar y recuperar paginas escaneadas, capturas o documentos con contenido visual para tareas de busqueda documental.
- Busqueda en video y audio: permite construir indices sobre minutos de video o audio y recuperar fragmentos por similitud semantica, apoyandose en los encoders de vision y audio.
- Clasificacion y etiquetado automatico: los embeddings pueden alimentar clasificadores ligeros para categorizar tickets, correos o contenidos sin necesidad de reentrenar un modelo grande.
- Deduplicacion y clustering de contenido: agrupar documentos, imagenes o audios semanticamente similares usando distancia coseno sobre las representaciones.
- Sistemas de recomendacion: calcular similitud entre elementos y preferencias de usuario en un espacio vectorial unico para recomendar contenido textual o multimedia.
- Moderacion y deteccion de contenido similar: comparar entradas contra un conjunto de referencias conocidas mediante similitud de embeddings.

## Benchmarks y rendimiento

Resultados globales con el checkpoint de precision completa a 768 dimensiones, segun el model card:

| Modalidad | Benchmark | Metrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB (multilingual, v2) | Mean(Task), Multiple | 61,36 | 61,15 |
| Texto | MTEB (code, v1) | Mean(Task), NDCG@10 | 78,68 | 68,76 |
| Imagen | MIEB (lite) | Mean(TaskType), Multiple | 64,64 | - |
| Imagen | MMEB v2 (Image) | Mean(Task), Hit@1 | 57,28 | - |
| Imagen | MMEB v2 (VisDoc) | Mean(Task), NDCG@5 | 67,84 | - |
| Video | MMEB v2 (Video) | Mean(Task), Hit@1 | 50,67 | - |
| Audio | MSEB (Retrieval) | Mean(Task), MRR@10 | 69,54 | - |
| Audio | MAEB (Hugging Face) | Mean(Task), Multiple | 49,39 | - |

Resultados con truncado de vectores (MRL):

| Dimension de salida | Ratio de compresion | MTEB multilingual v2 | MTEB eng v2 | MTEB code v1 | MIEB lite | MMEB v2 (Overall) | MSEB Retrieval | MAEB |
|---|---|---|---|---|---|---|---|---|
| 768d (completa) | 1:1 | 61,36 | 68,46 | 78,68 | 64,64 | 59,01 | 69,54 | 49,39 |
| 512d | 1:1,5 | 61,17 | 68,41 | 77,24 | 64,32 | 58,38 | 69,18 | 49,21 |
| 256d | 1:3 | 60,41 | 67,78 | 76,18 | 63,13 | 56,24 | 66,76 | 48,91 |
| 128d | 1:6 | 57,89 | 65,68 | 71,41 | 59,06 | 45,65 | 56,71 | 46,92 |

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 744.371.512 parametros): aproximadamente 2,98 GB en FP32, 1,49 GB en FP16/BF16, 0,74 GB en INT8 y 0,37 GB en INT4. Estas cifras son estimaciones por tamano de pesos; el model card no publica requisitos oficiales de memoria.
- El diseno esta orientado a hardware de consumo como moviles y portatiles; el propio model card indica ejecucion de baja latencia en el dispositivo.
- Cabe en GPUs de consumo: por ejemplo, RTX 3060, RTX 4060, RTX 4090 y similares, asi como en equipos con pocos GB de VRAM.
- No requiere GPUs de centro de datos como A100 o H100 para inferencia, aunque pueden usarse para servir lotes grandes.
- Opciones de despliegue documentadas en el model card: libreria transformers y sentence-transformers. Otras alternativas de servido de embeddings (por ejemplo, TEI, vLLM o TGI) no se mencionan en la informacion proporcionada.
- Latencia y throughput: el model card describe latencia baja y ejecucion en dispositivo, pero no se publican cifras concretas de latencia ni de throughput en la informacion disponible.

## Comparativa con modelos similares

Comparativa con el predecesor, unico modelo para el que la informacion proporcionada incluye datos:

| Modelo | Parametros | Contexto | MTEB multilingual v2 | MTEB code v1 | Modalidades | Licencia |
|---|---|---|---|---|---|---|
| EmbeddingGemma 2 | 740M (744.371.512 en safetensors) | 8.192 tokens | 61,36 | 78,68 | Texto, imagen, video, audio | Apache 2.0 |
| EmbeddingGemma 1 | no disponible | no disponible | 61,15 | 68,76 | Texto | no disponible |

Para otros modelos de embeddings de la misma categoria (por ejemplo, alternativas multilingues de terceros), no se dispone de datos en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio analizado es una subida del usuario TechnoBaptist con 0 descargas y 0 likes, creada el 6 de octubre de 2026; el modelo card referencia google/embeddinggemma-2 como origen, por lo que conviene verificar la procedencia y la integridad de los pesos antes de usarlos en produccion.
- No se detallan en la informacion proporcionada los sesgos conocidos del modelo ni la composicion del dataset de entrenamiento.
- El model card advierte de que la dimension de 128 (ratio de compresion 6:1) es la mas degradada y solo es adecuada para cargas de trabajo exclusivamente textuales; para multimodalidad conviene mantener 256 dimensiones o mas.
- Al ser un modelo de embeddings y no generativo, no produce texto y no puede alucinar en el sentido generativo, pero una similitud coseno alta no garantiza relevancia semantica real, lo que puede inducir recuperaciones erroneas en pipelines de RAG.
- El contexto esta limitado a 8.192 tokens, con una ventana deslizante de 1024 tokens, lo que puede afectar a la representacion de documentos muy largos.
- Aunque el tag y el campo de licencia indican apache-2.0, el model card enlaza la pagina de licencia de Gemma 4; conviene confirmar los terminos exactos aplicables al uso comercial antes de desplegar.
- No se especifican los tipos de cuantizacion soportados, lo que limita el conocimiento previo sobre opciones de optimizacion en produccion.

## Enlaces

- HuggingFace (subida analizada): https://huggingface.co/TechnoBaptist/embeddinggemma-2
- HuggingFace (modelo original): https://huggingface.co/google/embeddinggemma-2
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentacion: https://ai.google.dev/gemma/docs/embeddinggemma
- Pagina del modelo en Google DeepMind: https://deepmind.google/models/gemma/embeddinggemma/
- Licencia referenciada: https://ai.google.dev/gemma/docs/gemma_4_license
- Vision general de Gemma para desarrolladores: https://ai.google.dev/gemma/docs
- Blog de Gemma 2: https://blog.google/innovation-and-ai/technology/developers-tools/google-gemma-2/
- Ficha de EmbeddingGemma en Learn AI: https://ai.miraheze.org/wiki/EmbeddingGemma
- Repositorio GGUF de Gemma 2B: https://huggingface.co/google/gemma-2b-GGUF
