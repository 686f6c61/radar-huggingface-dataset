# tomaarsen/embeddinggemma-2-512d

## Resumen

EmbeddingGemma 2 (variante 512d de tomaarsen) es un modelo de embeddings multimodal derivado de EmbeddingGemma 2 de Google DeepMind. El modelo original mapea texto (incluido codigo), imagenes, video y audio a un unico espacio vectorial de 768 dimensiones; esta variante, creada de forma independiente por tomaarsen (Tom Aarsen, mantenedor de sentence-transformers), reduce la dimension de salida a 512 mediante descomposicion en valores singulares (SVD) de la proyeccion final, lo que produce vectores un 33,3 % mas pequeños conservando practicamente la misma calidad de similitud.

El problema que resuelve es el coste de almacenamiento e indexacion en sistemas de recuperacion: embeddings de 512 dimensiones ocupan menos memoria en bases vectoriales y aceleran las busquedas de vecino mas cercano sin recurrir a un truncado simple tipo Matryoshka, que si degrada la calidad. La transformacion SVD preserva los productos internos y las normas, por lo que las similitudes coseno se mantienen casi identicas al original.

Con 744 millones de parametros (segun los safetensors del repositorio), licencia Apache 2.0 y compatibilidad con la libreria transformers y sentence-transformers, es relevante para pipelines RAG y busqueda semantica multimodal donde el tamaño del indice importa. El README aclara que se trata de un derivado independiente, sin afiliacion ni respaldo de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EmbeddingGemma 2 (modelo de texto de 270M con codificadores modulares de vision de 170M y audio de 300M), con proyeccion final SVD 512 -> 512 |
| Parametros totales | 744.240.440 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16, segun la model card) |
| Idiomas soportados | multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, EmbeddingGemma 2 de Google DeepMind, es un modelo de embeddings multimodal que combina un modelo de texto de 270M de parametros con codificadores modulares de vision (170M) y audio (300M), proyectando todas las modalidades a un espacio vectorial comun. Esta derivacion no modifica el cuerpo del modelo: unicamente se reemplaza la proyeccion final (originalmente 512 -> 768) por una version 512 -> 512 obtenida mediante SVD. Concretamente, se factoriza la matriz original como W = U @ diag(S) @ Vh y se sustituye por B = diag(S) @ Vh; dado que las columnas de U son ortonormales, se preservan los productos internos y las normas, y por tanto las similitudes coseno. La SVD se calcula en FP64 y la nueva proyeccion se guarda en BF16, de modo que las diferencias respecto al original son solo numericas (BF16).

No se han publicado en la model card detalles sobre datos de entrenamiento, numero de tokens ni procesos de alineamiento (RLHF/DPO), al tratarse de un derivado sin reentrenamiento. El modelo base es google/embeddinggemma-2 y el derivado se limita a transformar su capa de salida.

## Capacidades

- Generacion de embeddings de texto (incluido codigo) para similitud semantica y recuperacion.
- Generacion de embeddings multimodales: imagenes, video y audio, y combinaciones de estas modalidades en un unico espacio vectorial de 512 dimensiones.
- Extraccion de caracteristicas de imagen, audio y video (image/audio/video feature extraction).
- Busqueda semantica y similitud de frases (sentence-similarity), apta para RAG y reranking en primera etapa.
- Salida de 512 dimensiones, un 33,3 % mas compacta que los 768d del original, con calidad practicamente equivalente.
- No soporta truncado Matryoshka por debajo de 512 dimensiones (para eso remite al modelo original).

## Casos de uso

- Busqueda semantica en produccion con indices compactos: los vectores de 512d reducen en un tercio la memoria de la base vectorial (por ejemplo, ~2 KB por embedding en FP32 frente a ~3 KB del original), lo que abarata el despliegue de millones de documentos.
- RAG multimodal: al compartir espacio vectorial texto, imagen, video y audio, permite indexar en una sola coleccion documentos, capturas de pantalla, clips y transcripciones y consultar en lenguaje natural.
- Deteccion de duplicados y clustering de contenido multimedia: la similitud coseno entre embeddings de diferentes modalidades permite agrupar contenido visual o sonoro similar sin modelos ad hoc por modalidad.
- Clasificacion zero-shot: se pueden codificar etiquetas candidatas como texto y asignar a cada entrada (texto, imagen o audio) la etiqueta con mayor similitud.
- Busqueda hibrida en aplicaciones on-device o edge: el tamaño reducido de los vectores es adecuado para busqueda local en dispositivos con recursos limitados.
- Deduplicacion de datasets de entrenamiento: filtrado rapido de ejemplos casi duplicados en corpora grandes antes de fine-tuning, aprovechando la velocidad extra de la busqueda en 512d.

## Benchmarks y rendimiento

NDCG@10 en los 13 datasets NanoBEIR en ingles, comparando el original de 768d, el original truncado a 512d y esta variante SVD de 512d:

| Dataset | Original 768d | Original truncado a 512d | Este modelo 512d |
|---|---:|---:|---:|
| NanoArguAna | 65,377 | 63,423 | 65,377 |
| NanoClimateFEVER | 27,469 | 28,177 | 27,469 |
| NanoDBPedia | 65,312 | 64,131 | 65,175 |
| NanoFEVER | 92,432 | 93,170 | 92,432 |
| NanoFiQA2018 | 44,736 | 43,188 | 44,563 |
| NanoHotpotQA | 89,544 | 88,525 | 89,598 |
| NanoMSMARCO | 56,633 | 55,126 | 57,371 |
| NanoNFCorpus | 38,354 | 37,229 | 38,290 |
| NanoNQ | 78,487 | 76,674 | 78,487 |
| NanoQuoraRetrieval | 95,463 | 95,272 | 95,455 |
| NanoSCIDOCS | 37,591 | 37,753 | 37,595 |
| NanoSciFact | 88,080 | 88,735 | 88,080 |
| NanoTouche2020 | 44,226 | 44,293 | 44,109 |
| **Media (13 datasets)** | **63,362** | **62,746** | **63,385** |

La media de esta variante (63,385) supera incluso al original de 768d (63,362) y al original truncado a 512d (62,746). La model card advierte, sin embargo, de que si se truncan estos embeddings a 256 o 128 dimensiones la calidad cae sustancialmente (medias de 57,767 y 48,821 respectivamente), porque la SVD no preserva la estructura Matryoshka del original.

## Requisitos de hardware

- El repositorio ocupa 3,0 GB en safetensors (BF16), coherente con ~744M de parametros.
- Para inferencia de embeddings, una GPU de gama consumer con 8 GB de VRAM (por ejemplo RTX 3060/4060 o superior) deberia ser suficiente para ejecutar el modelo en BF16; con CPU tambien es viable, aunque con mayor latencia.
- No consta una estimacion oficial de VRAM, latencia o throughput; no disponible.
- Despliegue posible con la libreria transformers o sentence-transformers (pipeline feature-extraction). No se mencionan en la model card opciones concretas como vLLM, llama.cpp, Ollama o TGI para este modelo.
- Al ser un modelo de embeddings y no generativo, el coste por consulta es una unica pasada de codificador, mucho menor que en LLM generativos de tamaño similar.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de salida | Modalidades | Licencia |
|---|---|---|---|---|
| tomaarsen/embeddinggemma-2-512d (este) | 744M | 512 | texto, imagen, video, audio | Apache 2.0 |
| google/embeddinggemma-2 (original) | 740M (segun model card) | 768 (Matryoshka: 512/256/128) | texto, imagen, video, audio | Apache 2.0 |
| Alternativas comparables de otros fabricantes | no disponible | no disponible | no disponible | no disponible |

La diferencia practica frente al original es el tamaño del vector: 512d frente a 768d, con calidad media equivalente en NanoBEIR. El original conserva truncado Matryoshka a 256 y 128 dimensiones, que esta variante no soporta.

## Limitaciones y advertencias

- No soporta truncado Matryoshka: reducir los embeddings por debajo de 512 dimensiones degrada gravemente la calidad (media NDCG@10 de 48,821 a 128d frente a 56,297 del original truncado).
- Se trata de un derivado independiente, no afiliado ni respaldado por Google; el soporte depende del autor del repositorio.
- Las diferencias respecto al original son de orden numerico (BF16), pero conviene no mezclar vectores del original y de esta variante en un mismo indice sin verificar la compatibilidad.
- La model card no documenta el rendimiento multilingue con metricas concretas (solo se etiqueta como multilingue), ni el rendimiento en las modalidades de imagen, audio y video.
- No se detallan sesgos conocidos ni riesgos de alucinacion (irrelevantes al no ser un modelo generativo, aunque hereda los sesgos del modelo base).
- Licencia Apache 2.0: sin restricciones destacables para uso comercial, aunque el modelo base Gemma puede estar sujeto a las condiciones de la licencia Gemma de Google segun la documentacion oficial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tomaarsen/embeddinggemma-2-512d
- Modelo base (Google): https://huggingface.co/google/embeddinggemma-2
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentacion oficial: https://ai.google.dev/gemma/docs/embeddinggemma
- Informe tecnico (arXiv): https://arxiv.org/abs/2610.37364
- Licencia Gemma: https://ai.google.dev/gemma/docs/gemma_4_license
