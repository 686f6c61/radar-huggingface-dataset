# Veiledge/embeddinggemma-2-GGUF

## Resumen

EmbeddingGemma 2 es un modelo de embeddings multimodal desarrollado por Google DeepMind que proyecta texto (incluido codigo), imagenes, video y audio en un unico espacio vectorial compartido de 768 dimensiones. El checkpoint publicado por Veiledge en Hugging Face es una cuantizacion GGUF del modelo base `google/embeddinggemma-2`, generada con la metodologia Unsloth Dynamic 3.0, pensada para inferencia en hardware de consumo y despliegue en entornos con recursos limitados.

El modelo combina un backbone de texto de 270M parametros (130M de transformer mas 140M de embedder) con encoders modulares de vision (170M) y audio (300M), sumando 740M parametros totales. Su diseno prioriza la eficiencia: contexto de 8192 tokens, ventana deslizante de 1024 tokens, atencion GQA/MQA con 4 cabezas y solo 2/1 KV-heads, y soporte nativo de Matryoshka Representation Learning (MRL) que permite truncar los embeddings a 128, 256 o 512 dimensiones con impacto minimo en calidad.

La relevancia actual del modelo radica en su capacidad de unificar cuatro modalidades en un solo espacio de embeddings manteniendo un tamano compacto apto para dispositivos moviles y portatiles, ademas de una mejora de aproximadamente el 14% en tareas de codigo respecto a su predecesor y soporte para mas de 100 idiomas. La version GGUF aqui descrita facilita su uso con llama.cpp y herramientas compatibles, aunque conviene senalar que el repositorio registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone de texto y encoders multimodales modulares; atencion GQA/MQA, activacion Gated FFN con GELU, mean pooling, capa de proyeccion 512 a 768 |
| Parametros totales | 740M (backbone texto 130M + embedder 140M + vision 170M + audio 300M); el checkpoint safetensors del repo GGUF reporta 271.002.648 parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens; ventana deslizante de 1024 tokens; relacion local:global 5:1 |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 3.0); niveles concretos no disponibles en la informacion proporcionada |
| Idiomas soportados | Multilingue, mas de 100 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); el modelo base se distribuye presumiblemente en safetensors, no confirmado en la informacion disponible |

## Arquitectura y entrenamiento

EmbeddingGemma 2 emplea una arquitectura transformer con 24 capas, dimension de modelo 512, dimension oculta 2048 y vocabulario de 262.144 tokens. La atencion combina GQA y MQA con 4 cabezas y 2/1 KV-heads (local/global), con una ventana deslizante de 1024 tokens y un patron local:global de 5:1 que reduce el coste computacional en secuencias largas. La salida se obtiene mediante mean pooling seguido de una proyeccion lineal de 512 a 768 dimensiones. El modelo integra encoders especificos por modalidad que pueden cargarse selectivamente, de modo que un despliegue puramente textual solo necesita el backbone de 270M parametros.

El entrenamiento se apoya en las innovaciones arquitectonicas y de capacidad de Gemma 4, segun la model card. Se reporta soporte nativo de Matryoshka Representation Learning, lo que permite truncar embeddings a 128, 256 y 512 dimensiones con perdida minima de calidad y hasta una reduccion de 6x en coste de almacenamiento vectorial. Tambien se emplean prefijos de instruccion textual ligeros para orientar las representaciones hacia tareas concretas (busqueda, clasificacion, clustering, similitud semantica). No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de embeddings de texto, incluido codigo, con representaciones de 768 dimensiones truncables a 128, 256 y 512.
- Embeddings de imagen mediante encoder de vision dedicado de 170M parametros.
- Embeddings de audio mediante encoder de audio de 300M parametros, con capacidad de procesar minutos de audio.
- Embeddings de video, con soporte para clips de varios minutos dentro del contexto de 8192 tokens.
- Embeddings multimodales combinados: permite mezclar texto, imagen, audio y video en el mismo espacio vectorial.
- Soporte multilingue en mas de 100 idiomas.
- Representaciones dirigidas por tarea mediante prefijos de instruccion textual.
- Matryoshka Representation Learning para truncado nativo de dimensiones.
- Capacidades de sentence similarity, clasificacion, clustering y recuperacion semantica.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agentico, dado que es un modelo de embeddings y no generativo.

## Casos de uso

- Busqueda semantica multilingue: el modelo indexa documentos en mas de 100 idiomas y permite consultas cross-lingue gracias a su espacio vectorial unificado, con embeddings truncados a 256d para reducir coste de almacenamiento en indices a gran escala.
- RAG en dispositivos moviles: con solo 270M parametros en el backbone de texto y cuantizacion GGUF, puede ejecutarse en telefonos y portatiles para generar embeddings de consultas y fragmentos de documentos sin conexion a servicios en la nube.
- Recuperacion de documentos visuales: el encoder de vision de 170M parametros permite indexar y recuperar capturas de pantalla, paginas escaneadas o diagramas tecnicos junto a texto en el mismo indice vectorial.
- Busqueda de audio y video: con el encoder de audio de 300M y el soporte de video, se pueden construir indices de podcasts, reuniones grabadas o bibliotecas audiovisuales consultables por similitud semantica sobre minutos de contenido.
- Clasificacion y clustering de contenido mixto: los embeddings permiten agrupar articulos, imagenes y clips de audio por tematica sin etiquetas, usando dimensiones reducidas (128d o 256d) para acelerar el clustering.
- Deteccion de duplicados y near-duplicates: la similitud coseno en el espacio de 768d permite identificar contenido repetido entre modalidades, por ejemplo una imagen y su descripcion textual, o fragmentos de codigo equivalentes.
- Busqueda de codigo: la mejora de aproximadamente el 14% en tareas de codigo respecto al predecesor lo hace adecuado para asistentes de documentacion tecnica y recuperacion de snippets en repositorios.

## Benchmarks y rendimiento

Resultados reportados por el autor del modelo base (checkpoint de precision completa, 768d):

| Modalidad | Benchmark | Metrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB multilingual v2 | Mean(Task) | 61.36 | 61.15 |
| Texto | MTEB code v1 | Mean(Task), NDCG@10 | 78.68 | 68.76 |
| Imagen | MIEB lite | Mean(TaskType) | 64.64 | no disponible |
| Imagen | MMEB v2 Image | Mean(Task), Hit@1 | 57.28 | no disponible |
| Imagen | MMEB v2 VisDoc | Mean(Task), NDCG@5 | 67.84 | no disponible |
| Video | MMEB v2 Video | Mean(Task), Hit@1 | 50.67 | no disponible |
| Audio | MSEB Retrieval | Mean(Task), MRR@10 | 69.54 | no disponible |
| Audio | MAEB (Hugging Face) | Mean(Task) | 49.39 | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks especificos para la cuantizacion GGUF de Veiledge, ni comparaciones de latencia o throughput de esta version cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo GGUF ocupa 4.6 GB, aunque el checkpoint safetensors reporta 271M parametros (aproximadamente 542 MB en FP16). La diferencia sugiere que el repo incluye multiples archivos de cuantizacion y posiblemente los encoders multimodales; el tamano concreto por archivo no esta disponible.
- GPU recomendadas: al tratarse de un modelo compacto, cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 e incluso en GPUs integradas o CPU. Para el backbone de texto solo (270M), la huella es inferior a 1 GB en FP16.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 2-4 GB de VRAM para el backbone textual; para el modelo multimodal completo se recomienda al menos 6-8 GB si se cargan todos los encoders.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, frameworks como sentence-transformers o TEI (Text Embeddings Inference).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El diseno orientado a dispositivos moviles sugiere latencias bajas, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EmbeddingGemma 2 (GGUF, este repo) | 740M totales (271M en safetensors) | 8192 tokens | Texto, imagen, video, audio | Apache 2.0 | Hugging Face (GGUF) |
| EmbeddingGemma 1 | No disponible en la informacion | No disponible | Texto | No disponible | Hugging Face |
| Otros modelos de embeddings multimodales | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada solo permite comparar con EmbeddingGemma 1, del que se conocen los resultados en MTEB multilingual v2 (61.15 frente a 61.36) y MTEB code v1 (68.76 frente a 78.68). No se dispone de datos de otros modelos comparables de la misma categoria para esta ficha.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no produce texto, codigo ni respuestas; solo representaciones vectoriales.
- Riesgo de sesgos inheritidos de los datos de entrenamiento de Google DeepMind, no cuantificados en la informacion disponible.
- La cuantizacion GGUF puede degradar ligeramente la calidad de los embeddings respecto al checkpoint de precision completa; no se aportan metricas de esa degradacion para esta version.
- El contexto de 8192 tokens limita la longitud de los documentos indexables en una sola pasada; documentos mas largos requieren fragmentacion.
- Aunque soporta mas de 100 idiomas, el rendimiento por idioma puede variar y no se detalla en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo base `google/embeddinggemma-2` y de la licencia Gemma 4 enlazada en la model card.
- El repositorio registra cero descargas y cero likes, por lo que no hay evidencia de validacion por parte de la comunidad.
- No se documentan garantias de soporte, mantenimiento ni actualizaciones por parte de Veiledge.

## Enlaces

- Hugging Face del repo GGUF: https://huggingface.co/Veiledge/embeddinggemma-2-GGUF
- Modelo base en Hugging Face: https://huggingface.co/google/embeddinggemma-2
- Guia de Unsloth para EmbeddingGemma 2: https://unsloth.ai/docs/models/embeddinggemma-2
- Documentacion de Unsloth Dynamic 3.0 GGUF: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentacion de EmbeddingGemma: https://ai.google.dev/gemma/docs/embeddinggemma
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/
