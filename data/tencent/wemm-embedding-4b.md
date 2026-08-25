# tencent/WeMM-Embedding-4B

## Resumen

WeMM-Embedding-4B es un modelo de embedding multimodal universal desarrollado por Tencent, construido sobre la base de Qwen/Qwen3.5-4B. Acepta entradas de texto, imagenes, videos, documentos visuales y entradas multimodales intercaladas, y devuelve un embedding L2-normalizado de 2.560 dimensiones. No soporta entrada de audio. Forma parte de una familia de modelos (2B, 4B y 9B) que comparten la misma arquitectura y metodologia de entrenamiento.

El modelo resuelve el problema de representar contenido multimodal heterogeneo (texto, imagen, video y documentos) en un espacio vectorial unificado, lo que permite busqueda multimodal, recuperacion cross-modal y sistemas de recomendacion que combinan multiples fuentes de informacion. Su relevancia actual radica en que obtiene resultados punteros en los benchmarks MMEB-v2 y MMEB-v3, superando a alternativas de tamano similar como Qwen3-VL-Embedding, GME y VLM2Vec-V2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Qwen3.5-4B) |
| Parametros totales | 5.173.725.696 (5,17B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | wemm-model-license (licencia propia de Tencent, no OSI) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

WeMM-Embedding-4B se construye sobre el modelo de lenguaje multimodal Qwen3.5-4B, que actua como backbone. La arquitectura sigue el enfoque de VLM2Vec del TIGER-AI-Lab, con una diferencia minima: el backbone wemm_embedding implementa un preprocesado propio y un pipeline de inferencia por lotes que soporta multi-nodo y multi-GPU mediante torchrun --nnodes=N. El modelo acepta secuencias intercaladas de texto, imagen y video, procesadas mediante un procesador propio que gestiona parches de imagen (image_patch_size=16) y muestreo de video de 64 fotogramas.

El entrenamiento es un fine-tuning de Qwen3.5-4B orientado a tareas de embedding. La model card no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. El modelo soporta embeddings Matryoshka (MRL), que permiten truncar la dimension del embedding final (2560) a cualquier valor listado en model.config.matryoshka_dimensions, lo que facilita comprimir la representacion segun las necesidades de almacenamiento o latencia.

## Capacidades

- Generacion de embeddings de texto: codifica cualquier texto en un vector de 2560 dimensiones L2-normalizado.
- Generacion de embeddings de imagen: codifica imagenes individuales, con o sin texto de acompanamiento.
- Generacion de embeddings de video: codifica videos mediante muestreo de hasta 64 fotogramas.
- Generacion de embeddings de documentos visuales: procesa documentos que contienen texto e imagenes mezclados.
- Entradas multimodales intercaladas: acepta secuencias mixtas de texto, imagen y video en una sola llamada, devolviendo un embedding conjunto.
- Embeddings Matryoshka (MRL): permite truncar la dimension de salida (2560) a cualquier valor listado en matryoshka_dimensions, sin degradacion significativa.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible (es un modelo de embedding, no generativo).
- Capacidades multilingues: chino e ingles.

## Casos de uso

- Busqueda multimodal en bases de datos de contenido visual: una plataforma de videos puede indexar clips con WeMM-Embedding-4B y permitir busquedas por texto libre, imagen de referencia o fragmento de video, devolviendo resultados por similitud de embedding.
- Recuperacion de documentos empresariales con contenido mixto: una empresa con informes en PDF que mezclan texto, graficos y tablas puede generar embeddings de cada pagina y buscar por descripcion textual o por una imagen de ejemplo.
- Sistema de recomendacion de contenido cross-modal: una plataforma de streaming puede recomendar videos a partir de una imagen de portada o de una descripcion textual, usando los embeddings de video e imagen en el mismo espacio vectorial.
- Deduplicacion de contenido en archivos multimedia: el modelo puede detectar videos o imagenes duplicados o casi duplicados comparando embeddings, incluso si el contenido es multimodal (por ejemplo, un video con audio distinto pero mismas imagenes).
- Moderation de contenido visual: indexar imagenes y videos de una plataforma y buscar contenido problematico a partir de una imagen de referencia o una descripcion textual.
- RAG multimodal: en un sistema de recuperacion aumentada por generacion, WeMM-Embedding-4B puede recuperar fragmentos de video o imagenes relevantes para una pregunta del usuario y pasarlos a un LLM generativo como contexto.

## Benchmarks y rendimiento

Segun el informe tecnico, los resultados en MMEB-v2 (78 datasets, imagen y video con Hit@1, documentos visuales con NDCG@5, mayor es mejor):

| Modelo | Tamano | AVG | Image | Video | VisDoc |
|---|---|---|---|---|---|
| VLM2Vec | 2B | 47,8 | 59,7 | 29,0 | 44,0 |
| GME | 2B | 55,4 | 51,9 | 33,9 | 76,8 |
| VLM2Vec-V2 | 2B | 59,3 | 64,9 | 34,9 | 69,2 |
| Qwen3-VL-Embedding | 2B | 73,2 | 75,0 | 61,9 | 79,2 |
| DME-Small | 2B | 74,8 | 75,9 | 65,6 | 79,9 |
| WeMM-Embedding | 2B | 77,9 | 79,6 | 70,8 | 80,7 |
| **WeMM-Embedding** | **4B** | **79,2** | **80,8** | **72,1** | **82,0** |
| VLM2Vec | 8B | 53,2 | 65,5 | 34,0 | 49,1 |
| GME | 8B | 59,2 | 56,0 | 38,6 | 79,3 |
| Qwen3-VL-Embedding | 8B | 77,8 | 80,1 | 67,1 | 82,4 |
| DME-Medium | 9B | 78,4 | 79,8 | 70,8 | 82,0 |
| WeMM-Embedding | 9B | 80,6 | 81,9 | 74,3 | 83,3 |

DME-Small y DME-Medium son envios de leaderboard cerrados sin pesos publicados ni endpoint publico.

En MMEB-v3 (190 tareas, incluyendo las 78 de MMEB-v2, 53 de texto, 47 de agente, 11 de audio y MCMR; tareas no soportadas puntuan 0):

| Modelo | Tamano | V3-All | Text | Agent | MCMR | Audio |
|---|---|---|---|---|---|---|
| VLM2Vec-V2 | 2B | 38,3 | 24,5 | 28,7 | 4,1 | 0,0 |
| Omni-Embed-Nemotron | 3B | 43,5 | 39,2 | 36,5 | 26,1 | 36,5 |
| E5-Omni | 3B | 44,6 | 26,7 | 36,9 | 31,9 | 30,8 |
| Qwen3-VL-Embedding | 2B | 50,9 | 39,2 | 39,3 | 42,0 | 0,0 |
| WeMM-Embedding | 2B | 56,0 | 45,3 | 45,1 | 42,5 | 0,0 |
| **WeMM-Embedding** | **4B** | **58,2** | **47,9** | **49,0** | **41,9** | **0,0** |
| WAVE | 7B | 26,3 | 13,7 | 11,3 | 8,9 | 31,8 |
| VLM2Vec | 8B | 32,9 | 22,2 | 19,7 | 0,9 | 0,0 |
| LCO-Embedding-Omni | 7B | 40,6 | 32,4 | 27,8 | 20,0 | 43,2 |
| GME | 8B | 43,6 | 37,1 | 35,6 | 27,3 | 0,0 |
| E5-Omni | 7B | 47,1 | 26,9 | 36,7 | 41,1 | 43,0 |
| Tianmu-Emb-Uni | 8B | 53,3 | 43,6 | 39,4 | 38,8 | 38,9 |
| Qwen3-VL-Embedding | 8B | 53,5 | 42,5 | 38,4 | 38,0 | 0,0 |
| WeMM-Embedding | 9B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 5,17B parametros en bfloat16, lo que requiere aproximadamente 10,4 GB solo para los pesos. Con el procesamiento de video y los estados de atencion, se recomienda una GPU con al menos 16 GB de VRAM para inferencia con video; para texto o imagenes individuales, 12 GB pueden ser suficientes.
- GPU recomendadas: NVIDIA A100 (40 GB), H100, RTX 4090 (24 GB), o L4 (24 GB). Para entornos de produccion con alto volumen, se recomienda A100 o H100.
- Capacidad en GPU de consumo: cabe en una RTX 4090 (24 GB) y en una RTX 4080 (16 GB) para texto o imagenes, pero con video largo el consumo de VRAM puede superar los 16 GB.
- Opciones de despliegue: vLLM 0.27.0 con --runner pooling, SGLang 0.5.9 con --is-embedding, o transformers directamente (AutoModel). Tambien se puede usar con sentence-transformers mediante el adaptador wemm_sentence_transformers.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tamano | Dimension de embedding | Contexto | MMEB-v2 AVG | MMEB-v3 V3-All | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| **WeMM-Embedding-4B** | 4B | 2560 (MRL) | no disponible | 79,2 | 58,2 | wemm-model-license | pesos publicos en HF |
| Qwen3-VL-Embedding | 2B | no disponible | no disponible | 73,2 | 50,9 | Apache 2.0 | pesos publicos en HF |
| Qwen3-VL-Embedding | 8B | no disponible | no disponible | 77,8 | 53,5 | Apache 2.0 | pesos publicos en HF |
| GME | 8B | no disponible | no disponible | 59,2 | 43,6 | no disponible | no disponible |
| VLM2Vec | 8B | no disponible | no disponible | 53,2 | 32,9 | no disponible | no disponible |
| VLM2Vec-V2 | 2B | no disponible | no disponible | 59,3 | 38,3 | no disponible | no disponible |

La comparativa se limita a los modelos incluidos en los benchmarks del informe tecnico, ya que no hay datos publicos de otros modelos de embedding multimodal comparables con licencias abiertas.

## Limitaciones y advertencias

- No soporta entrada de audio: el modelo puntua 0 en todas las tareas de audio del benchmark MMEB-v3, lo que limita su uso en aplicaciones que requieran representar contenido de audio.
- Licencia restrictiva: la licencia wemm-model-license no es una licencia de codigo abierto estandar. Es necesario revisar el texto completo de la licencia antes de usar el modelo en produccion o con fines comerciales, ya que puede incluir clausulas especificas de uso.
- Idiomas limitados: solo soporta chino e ingles. No esta probado en otros idiomas y es probable que el rendimiento se degrade gravemente en idiomas no soportados.
- Riesgo de sesgos: al ser un modelo entrenado sobre datos de Qwen3.5, puede heredar sesgos del dataset de entrenamiento del modelo base, especialmente en tareas de busqueda y recuperacion que involucran contenido sensible.
- Alucinacion: como modelo de embedding no genera texto, por lo que no hay riesgo de alucinacion en la generacion. Sin embargo, puede producir embeddings poco discriminativos para contenido ambiguo o fuera de distribucion.
- Tamano del contexto: no se ha publicado la longitud de contexto maxima. Para entradas muy largas (por ejemplo, videos de mas de 64 fotogramas o documentos extensos), puede ser necesario truncar o muestrear, lo que puede afectar a la calidad del embedding.
- Version del modelo: la fecha de creacion (2026-08-25) indica que es un modelo reciente. La documentacion de produccion (vLLM 0.27.0, SGLang 0.5.3, transformers 5.2.0) sugiere que se requiere un entorno de software muy reciente, lo que puede causar problemas de compatibilidad en entornos con versiones estables anteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tencent/WeMM-Embedding-4B
- Coleccion de modelos WeMM-Embedding: https://huggingface.co/collections/tencent/wemm-embedding
- Informe tecnico (PDF): https://github.com/Tencent/WeMM-Embedding/blob/main/assets/WeMM_Embedding_tech_report.pdf
- Repositorio oficial en GitHub: https://github.com/Tencent/WeMM-Embedding
- Licencia: https://huggingface.co/tencent/WeMM-Embedding-4B/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
