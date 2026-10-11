# unsloth/embeddinggemma-2

## Resumen

EmbeddingGemma 2 es un modelo de embeddings multimodal desarrollado por Google DeepMind y redistribuido en HuggingFace por Unsloth bajo el identificador `unsloth/embeddinggemma-2`. Su funcion no es generar texto, sino proyectar entradas de cuatro modalidades distintas (texto, imagen, video y audio) y combinaciones de estas en un unico espacio vectorial compartido de 768 dimensiones, de modo que puedan calcularse similitudes semanticas entre elementos de distinta naturaleza.

El modelo combina un backbone de texto de 270M parametros (130M de transformer mas 140M de embedder) con encoders modulares y cargables de forma selectiva: 170M para vision y 300M para audio, sumando un total de aproximadamente 740M parametros. Esta disenado para ejecutarse en hardware de consumo, incluidos moviles y portatiles, y ofrece ventanas de contexto de 8.192 tokens, suficientes para procesar varios minutos de audio o video.

Su relevancia actual reside en tres factores: la unificacion nativa de cuatro modalidades en un mismo espacio de embeddings, el soporte multilingue de mas de 100 idiomas con una mejora de aproximadamente el 14 por ciento en tareas de codigo respecto a su predecesor, y el uso de Matryoshka Representation Learning (MRL), que permite truncar los embeddings a 128, 256 o 512 dimensiones reduciendo hasta seis veces el coste de almacenamiento vectorial. Estas caracteristicas lo orientan a aplicaciones de busqueda semantica, RAG, clasificacion y clustering en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con atencion GQA/MQA, patron local:global 5:1 y ventana deslizante, con encoders modulares para vision y audio |
| Parametros totales | 744.371.512 (~740M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | Multilingue (mas de 100 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Desglose de componentes: backbone de texto 130M, embedder 140M, encoder de vision 170M, encoder de audio 300M. Numero de capas 24; dimension de modelo 512; dimension oculta 2.048; tamano de vocabulario 262.144; 4 cabezas de atencion; 2/1 cabezas KV local/global; pooling por media; capa de proyeccion de 512 a 768; dimension de salida nativa de 768; dimensiones MRL de truncado 128, 256 y 512.

## Arquitectura y entrenamiento

EmbeddingGemma 2 es un modelo de representacion (encoder-only) construido sobre los avances arquitectonicos de Gemma 4, segun declara su model card. El backbone de texto emplea 24 capas con atencion agrupada y de multiples consultas (GQA/MQA), una ventana deslizante de 1.024 tokens y un patron de capas local:global de 5:1, con 2 cabezas KV locales y 1 global. La activacion es una red feed-forward con compuertas (gated FFN) y GELU, y el pooling final es por media. Una capa de proyeccion transforma la representacion interna de 512 dimensiones a los 768 de salida.

La caracteristica estructural mas destacada es la multimodalidad nativa: el modelo no concatena embeddings de distintos modelos, sino que mapea texto, imagen, video y audio a un mismo espacio vectorial comun. Los encoders de vision (170M) y audio (300M) son opcionales y cargables de forma independiente, de modo que el desarrollador puede desplegar solo las modalidades que necesite. El modelo no esta pensado para generacion autoregresiva, sino para producir representaciones semanticas.

La informacion proporcionada no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO, por lo que estos datos deben considerarse no disponibles. Las innovaciones documentadas incluyen el aprendizaje de representaciones Matryoshka (MRL), que habilita embeddings truncables de 128, 256, 512 y 768 dimensiones, y la direccion de tareas mediante prefijos de instruccion en texto, que optimizan las representaciones para busqueda, clasificacion, clustering o similitud semantica.

## Capacidades

- Generacion de embeddings de texto, incluido codigo, con una mejora de aproximadamente el 14 por ciento en tareas de codigo frente a la version anterior.
- Generacion de embeddings de imagen y de documento visual (visual document).
- Generacion de embeddings de video, capaz de procesar varios minutos de contenido dado el contexto de 8.192 tokens.
- Generacion de embeddings de audio.
- Embeddings multimodales combinados: permite calcular similitud entre modalidades distintas (por ejemplo, texto frente a imagen o frente a audio) dentro del mismo espacio vectorial de 768 dimensiones.
- Truncado Matryoshka: representaciones de salida de 128, 256, 512 o 768 dimensiones, con renormalizacion, para ajustar el coste de almacenamiento a la precision requerida.
- Representaciones dirigidas por tarea: el modelo acepta prefijos de instruccion ligeros para especializar los embeddings en busqueda, clasificacion, clustering o similitud semantica.
- Soporte multilingue de mas de 100 idiomas.
- No es un modelo generativo: no realiza generacion de texto, razonamiento, matematicas ni vision generativa.
- No dispone de soporte de tool calling, function calling ni comportamiento de agente multi-paso.
- No incluye modo de pensamiento (thinking mode) ni salida de audio o vision generativa.

## Casos de uso

- Busqueda semantica multilingue en aplicaciones moviles: el modelo puede generar embeddings de 128 o 256 dimensiones con calidad proxima a la configuracion completa, lo que reduce el coste de almacenamiento y la latencia en dispositivos con recursos limitados.
- Recuperacion aumentada por generacion (RAG) en local: al ejecutarse en hardware de consumo, permite indexar y recuperar documentos sin depender de servicios en la nube, manteniendo los datos dentro de la infraestructura propia.
- Clustering y deduplicacion de contenido: los embeddings por media y la similitud coseno permiten agrupar articulos, tickets o imagenes semejantes; la salida de 768 dimensiones mejora la separacion frente a dimensiones menores.
- Busqueda visual de producto: usando el encoder de vision (170M), una tienda puede indexar su catalogo de imagenes y recuperar articulos visualmente similares a una foto del usuario, sin necesidad de etiquetas de texto.
- Recuperacion de documentos escaneados: el encoder de vision permite embedding de documentos visuales (visual documents), util para archivar facturas, formularios o PDF escaneados y buscarlos por contenido sin OCR previo.
- Busqueda en archivos de audio y video: el encoder de audio (300M) y la ventana de 8.192 tokens permiten indexar fragmentos de podcast, reuniones o videos y recuperarlos por similitud semantica con una consulta textual.
- Sistemas de recomendacion basados en similitud: el modelo puede generar embeddings de contenido multimodal para recomendar articulos similares cruzando texto, imagen y audio en un unico espacio.
- Clasificacion de contenido a escala: los embeddings sirven como caracteristicas de entrada para clasificadores ligeros, aprovechando la direccion por tarea mediante prefijos de instruccion.

## Benchmarks y rendimiento

Resultados globales a 768 dimensiones, con checkpoint de precision completa, segun la model card:

| Modalidad | Benchmark | Metrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB (multilingual, v2) | Mean(Task), Multiple | 61,36 | 61,15 |
| Texto (codigo) | MTEB (code, v1) | Mean(Task), NDCG@10 | 78,68 | 68,76 |
| Imagen | MIEB (lite) | Mean(TaskType), Multiple | 64,64 | no disponible |
| Imagen | MMEB v2 (Image) | Mean(Task), Hit@1 | 57,28 | no disponible |
| Imagen (VisDoc) | MMEB v2 (VisDoc) | Mean(Task), NDCG@5 | 67,84 | no disponible |
| Video | MMEB v2 (Video) | Mean(Task), Hit@1 | 50,67 | no disponible |
| Audio | MSEB (Retrieval) | Mean(Task), MRR@10 | 69,54 | no disponible |
| Audio | MAEB (Hugging Face) | Mean(Task), Multiple | 49,39 | no disponible |

Resultados con truncado de vector (Matryoshka):

| Dimension de salida | Ratio de compresion | MTEB (multilingual, v2) | MTEB (eng, v2) | MTEB (code, v1) | MIEB (lite) | MMEB (v2) global | MSEB (Retrieval) | MAEB |
|---|---|---|---|---|---|---|---|---|
| 768d (completa) | 1:1 | 61,36 | 68,46 | 78,68 | 64,64 | 59,01 | 69,54 | 49,39 |
| 512d | 1:1,5 | 61,17 | 68,41 | 77,24 | 64,32 | 58,38 | 69,18 | 49,21 |
| 256d | 1:3 | 60,41 | 67,78 | 76,18 | 63,13 | 56,24 | 66,76 | 48,91 |
| 128d | 1:6 | 57,89 | 65,68 | 71,41 | 59,06 | 45,65 | 56,71 | 46,92 |

La degradacion es marginal hasta 256 dimensiones; a 128 dimensiones la caida es notable, especialmente en tareas multimodales (MMEB global baja de 59,01 a 45,65), por lo que 128d se recomienda solo para cargas de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (fp16) los pesos ocupan aproximadamente 1,5 GB (el repositorio de safetensors mide 1,5 GB). Alrededor de 0,75 GB en int8 y 0,4 GB en int4, aunque la informacion proporcionada no documenta que se publiquen cuantizaciones de este modelo.
- Cabe sin problemas en cualquier GPU de consumo: RTX 3060, RTX 4070, RTX 4090, asi como en Apple Silicon y, probablemente, en ejecucion por CPU dado el reducido tamano.
- GPUs profesionales (A100, H100) no son necesarias para inferencia; solo tendrian sentido para indexado masivo por lotes.
- El propio autor indica que el modelo esta disenado para ejecutarse en dispositivos moviles y portatiles, con baja latencia.
- Opciones de despliegue: la model card referencia la libreria `sentence-transformers` con `transformers`. No se detallan en la informacion proporcionada integraciones con vLLM, llama.cpp, Ollama o TGI, si bien el ecosistema de Unsloth suele ofrecer utilidades de conversion.
- Latencia y throughput: no disponible en la informacion proporcionada. Al ser un encoder de 740M parametros, se espera baja latencia, pero no se aportan cifras concretas.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar de forma directa con el predecesor directo, EmbeddingGemma 1:

| Aspecto | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|
| Parametros totales | ~740M (270M texto + 170M vision + 300M audio) | no disponible |
| Modalidades | Texto, imagen, video, audio | Solo texto |
| Contexto | 8.192 tokens | no disponible |
| MTEB multilingual v2 | 61,36 | 61,15 |
| MTEB code v1 | 78,68 | 68,76 |
| Dimension de salida | 768 (truncable a 512/256/128) | no disponible |
| Licencia | apache-2.0 | no disponible |

Frente a otros modelos de embeddings multilingues y multimodales del mercado (por ejemplo familias tipo BGE-M3, E5, Jina o Nomic), no se dispone en la informacion proporcionada de datos de parametros, contexto, rendimiento ni licencia que permitan una comparacion rigurosa, por lo que dicha comparativa se marca como no disponible.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no puede producir texto, razonar en varios pasos ni ejecutar herramientas. Cualquier caso de uso generativo requiere acoplarlo a un LLM aparte.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de recuperacion irrelevante o de falsos positivos en similitud cuando los embeddings se truncan demasiado (especialmente a 128 dimensiones).
- La degradacion por truncado es severa en multimodal: a 128 dimensiones el rendimiento global de MMEB cae mas de 13 puntos, por lo que 128d debe reservarse para texto.
- Los encoders de vision y audio son opcionales y suman parametros (170M + 300M): desplegar todas las modalidades incrementa el consumo de memoria frente al uso solo de texto.
- La ventana de contexto de 8.192 tokens, aunque suficiente para varios minutos de audio o video, limita el procesamiento de documentos o grabaciones muy extensos, que habra que fragmentar.
- Idiomas: se declaran mas de 100 idiomas, pero no se aporta el desglose de rendimiento por idioma, por lo que el soporte real puede variar; conviene validar en el idioma objetivo.
- Licencia: el modelo se distribuye bajo apache-2.0, lo que en principio permite uso comercial, pero la model card enlaza a la licencia de Gemma 4 (`gemma_4_license`), por lo que se recomienda revisar los terminos exactos que aplican a la redistribucion de Unsloth.
- Origen de datos: la ficha corresponde a una redistribucion de Unsloth sobre el modelo original `google/embeddinggemma-2`; para produccion conviene verificar que la version de Unsloth reproduce fielmente los pesos y el comportamiento del modelo de Google.
- No se documentan sesgos especificos ni evaluaciones de robustez o seguridad en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace (Unsloth): https://huggingface.co/unsloth/embeddinggemma-2
- Modelo base en HuggingFace (Google): https://huggingface.co/google/embeddinggemma-2
- Repositorio GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentacion de EmbeddingGemma: https://ai.google.dev/gemma/docs/embeddinggemma
- Licencia (Apache 2.0 referenciada en la model card): https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de Unsloth: https://unsloth.ai/
- Repositorio GitHub de Unsloth: https://github.com/unslothai/unsloth
- Perfil de Unsloth en HuggingFace: https://huggingface.co/unsloth
