# zackleban/embeddinggemma-2

## Resumen

EmbeddingGemma 2 es un modelo de embeddings multimodal desarrollado por Google DeepMind que proyecta texto (incluido codigo), imagenes, video y audio en un unico espacio vectorial compartido de 768 dimensiones. Con 740 millones de parametros totales, combina un backbone de texto de 270M (130M de transformer mas 140M de embedder) con encoders modulares de vision (170M) y audio (300M) que pueden cargarse de forma selectiva segun la modalidad necesaria. Esta disenado para ejecutarse en hardware de consumo como moviles y portatiles.

El modelo se presenta como una evolucion de EmbeddingGemma 1, manteniendo resultados casi identicos en MTEB multilingue (61,36 frente a 61,15) pero anadiendo soporte nativo para cuatro modalidades en un mismo espacio semantico. Incorpora Matryoshka Representation Learning (MRL), que permite truncar los embeddings a 128, 256 o 512 dimensiones con perdida de calidad minima, reduciendo hasta 6 veces el coste de almacenamiento vectorial. Su ventana de contexto es de 8192 tokens.

La relevancia actual radica en su enfoque on-device: con un backbone de solo 130M de parametros transformer y encoders cargables bajo demanda, permite construir pipelines de busqueda semantica, RAG, clasificacion y clustering multilingues sin depender de infraestructura GPU en la nube. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion GQA/MQA, ventana deslizante local:global 5:1, pooling por media, proyeccion 512→768 |
| Parametros totales | 740M (backbone texto 270M: 130M transformer + 140M embedder; vision 170M; audio 300M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingue (100+ idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con 24 capas, dimension de modelo 512 y dimension oculta 2048. La atencion combina GQA y MQA con 4 cabezas y 2/1 KV-heads (local/global), usando una ventana deslizante de 1024 tokens con una proporcion local:global de 5:1. La activacion es una FFN con gating y GELU. El vocabulario es de 262.144 tokens. La salida nativa es de 768 dimensiones tras una capa de proyeccion desde 512.

La modularidad es el rasgo tecnico central: el backbone de texto (130M transformer + 140M embedder) puede combinarse con el encoder de vision (170M) o el de audio (300M) de forma independiente, permitiendo cargar solo las modalidades necesarias. El entrenamiento cubre texto, codigo, vision, documentos visuales, video y audio, aunque la informacion disponible no detalla el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Incorpora MRL nativo para truncamiento a 128, 256 y 512 dimensiones, y permite representaciones guiadas por instrucciones de texto para optimizar tareas como busqueda, clasificacion o similitud semantica.

## Capacidades

- Generacion de embeddings de texto y codigo en un espacio vectorial unificado de 768 dimensiones.
- Embeddings de imagenes mediante encoder de vision dedicado (170M).
- Embeddings de video con capacidad de procesar minutos de contenido gracias a la ventana de 8192 tokens.
- Embeddings de audio mediante encoder de audio dedicado (300M).
- Combinacion de modalidades en un mismo espacio vectorial (texto + imagen + audio + video).
- Soporte multilingue para mas de 100 idiomas.
- Representaciones guiadas por instrucciones de texto para adaptar el embedding a la tarea (busqueda, clasificacion, clustering, similitud semantica).
- Truncamiento MRL a 128, 256 y 512 dimensiones con re-normalizacion.
- Optimizado para inferencia en dispositivo (movil, portatil) con baja latencia.
- Compatible con la libreria `sentence-transformers` y `transformers`.
- No se documenta soporte de tool calling ni de agentes multi-paso (es un modelo de embeddings, no generativo).

## Casos de uso

- Busqueda semantica on-device: indexar y consultar documentos localmente en moviles o portatiles usando embeddings truncados a 256d, reduciendo el almacenamiento 3 veces con perdida de calidad inferior al 1% en MTEB multilingue (60,41 frente a 61,36).
- RAG multimodal en produccion: recuperar fragmentos de texto, imagenes y audio relevantes para alimentar un LLM, usando el espacio vectorial unificado para mezclar modalidades en una sola consulta.
- Clasificacion de contenido multilingue: asignar categorias a textos en mas de 100 idiomas mediante embeddings guiados por instrucciones de clasificacion, sin necesidad de entrenar clasificadores por idioma.
- Busqueda de codigo: recuperar fragmentos de codigo relevante usando el soporte de code embeddings, con una mejora del 14% en tareas de codigo respecto a EmbeddingGemma 1 (78,68 en MTEB code v1 frente a 68,76).
- Deduplicacion y clustering de documentos visuales: agrupar imagenes y documentos escaneados por similitud semantica usando el encoder de vision y MMEB VisDoc (67,84 NDCG@5).
- Analisis de audio y video para moderacion o catalogacion: generar embeddings de minutos de audio o video para detectar contenido similar, con resultados de 69,54 MRR@10 en MSEB retrieval.
- Sistemas de recomendacion de contenido mixto: combinar embeddings de texto, imagen y audio de un mismo item para calcular similitud entre usuarios y contenidos en un unico espacio de 768 dimensiones.

## Benchmarks y rendimiento

| Modalidad | Benchmark | Metrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB (multilingue, v2) | Mean(Task) | 61,36 | 61,15 |
| Texto | MTEB (code, v1) | Mean(Task), NDCG@10 | 78,68 | 68,76 |
| Imagen | MIEB (lite) | Mean(TaskType) | 65,67 | no disponible |
| Imagen | MMEB v2 (Image) | Mean(Task), Hit@1 | 57,28 | no disponible |
| Imagen | MMEB v2 (VisDoc) | Mean(Task), NDCG@5 | 67,84 | no disponible |
| Video | MMEB v2 (Video) | Mean(Task), Hit@1 | 50,67 | no disponible |
| Audio | MSEB (Retrieval) | Mean(Task), MRR@10 | 69,54 | no disponible |
| Audio | MAEB (Hugging Face) | Mean(Task) | 49,87 | no disponible |

Resultados con truncamiento vectorial (MRL):

| Dimension | Ratio compresion | MTEB multilingue v2 | MTEB eng v2 | MTEB code v1 | MIEB lite | MMEB v2 overall | MSEB retrieval | MAEB |
|---|---|---|---|---|---|---|---|---|
| 768d | 1:1 | 61,36 | 68,46 | 78,68 | 65,67 | 59,01 | 69,54 | 49,87 |
| 512d | 1:1,5 | 61,17 | 68,41 | 77,24 | 65,34 | 58,38 | 69,18 | 49,76 |
| 256d | 1:3 | 60,41 | 67,78 | 76,18 | 64,16 | 56,24 | 66,76 | 49,13 |
| 128d | 1:6 | 57,89 | 65,68 | 71,41 | 59,97 | 45,65 | 56,71 | 47,28 |

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone de texto (270M) en precision completa ocupa aproximadamente 1,1 GB; con el encoder de vision (170M) se anade unos 0,7 GB; con el encoder de audio (300M) unos 1,2 GB. El repo completo pesa 1,5 GB en safetensors.
- GPU recomendadas: no requiere GPU dedicada para el backbone de texto; puede ejecutarse en CPU en moviles y portatiles. Para cargas por lotes o multimodal completa se recomienda una GPU consumer (RTX 3060 o superior) o profesional (A100, H100) para throughput alto.
- Cabe en GPU consumer: si, en cualquier GPU con 4 GB o mas de VRAM para el backbone de texto; con vision y audio completos, 8 GB son suficientes.
- Opciones de despliegue: `transformers`, `sentence-transformers`. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada; el modelo se presenta como de baja latencia para aplicaciones on-device.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | MTEB multilingue v2 | Licencia |
|---|---|---|---|---|---|
| EmbeddingGemma 2 | 740M (270M texto + 170M vision + 300M audio) | 8192 | Texto, imagen, video, audio | 61,36 | Apache 2.0 |
| EmbeddingGemma 1 | no disponible | no disponible | Texto | 61,15 | Apache 2.0 |
| Otros modelos de embeddings multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con EmbeddingGemma 1, su predecesor directo. No se dispone de datos de benchmarks de otros modelos de embeddings multimodales en la informacion disponible.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no produce texto, codigo ni respuestas; solo representaciones vectoriales.
- Riesgo de sesgo: al entrenarse con datos web multilingues, puede heredar sesgos culturales, de genero y linguisticos no documentados en la informacion disponible.
- Riesgo de alucinacion: no aplica directamente al ser un modelo de embeddings, pero los resultados de recuperacion pueden devolver contenido irrelevante si la consulta es ambigua.
- Limitacion de contexto: 8192 tokens; documentos o medios mas largos deben fragmentarse.
- El truncamiento a 128d degrada notablemente el rendimiento multimodal (MMEB v2 overall cae a 45,65 frente a 59,01 en 768d); 128d solo es adecuado para cargas de texto.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos de la licencia de Gemma 4 enlazada por el autor para confirmar compatibilidad.
- El repositorio pertenece a un usuario tercero (`zackleban`), no a la organizacion oficial de Google; conviene verificar la procedencia de los pesos antes de usarlos en produccion.
- No se documentan tecnicas de cuantizacion ni formatos GGUF/ONNX, lo que limita el despliegue en algunos runtimes.

## Enlaces

- Hugging Face: https://huggingface.co/zackleban/embeddinggemma-2
- Modelo oficial en Hugging Face: https://huggingface.co/google/embeddinggemma-2
- GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentacion: https://ai.google.dev/gemma/docs/embeddinggemma
- Informe tecnico (arXiv): https://arxiv.org/abs/2610.37364
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de Gemma en DeepMind: https://deepmind.google/models/gemma/
