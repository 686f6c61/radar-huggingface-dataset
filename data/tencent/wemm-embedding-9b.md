# tencent/WeMM-Embedding-9B

## Resumen

WeMM-Embedding-9B es un modelo de embedding multimodal universal desarrollado por Tencent, construido sobre la base de Qwen3.5-9B. Acepta entradas de texto, imagen, vídeo, documentos visuales y combinaciones intercaladas de estos tipos, y devuelve un embedding de 4096 dimensiones normalizado con norma L2. No soporta entrada de audio. El modelo está diseñado para tareas de recuperación, búsqueda multimodal y representación unificada de contenido heterogéneo, y su relevancia actual radica en la creciente necesidad de sistemas que indexen y comparen información a través de múltiples modalidades sin depender de modelos separados por tipo de dato.

El modelo tiene 9.407.831.280 parámetros (aproximadamente 9,4B), está publicado en formato safetensors para la librería transformers y soporta inglés y chino. Incluye soporte para embeddings Matryoshka (MRL), lo que permite recortar la dimensionalidad del embedding a valores como 256, 512, 1024, etc., según las necesidades de almacenamiento o latencia. El repositorio tiene 18,8 GB de tamaño y la licencia es wemm-model-license, aunque una fuente web indica que el código y los pesos se distribuyen bajo Apache 2.0 con componentes de terceros bajo sus licencias originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Qwen3.5-9B) |
| Parametros totales | 9.407.831.280 (9,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (pesos originales); no se han publicado cuantizaciones GGUF |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | wemm-model-license (ver enlace en repositorio); el codigo y pesos se describen tambien como Apache 2.0 en la documentacion web |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

WeMM-Embedding-9B parte del modelo base Qwen3.5-9B, un transformer autoregresivo multimodal de Tencent, y lo adapta para la tarea de embedding. La arquitectura del backbone incluye un procesador de vision que gestiona imagenes, videos y documentos visuales, con un muestreo de 64 frames para video, segun el repositorio oficial. El modelo produce un embedding unico de 4096 dimensiones normalizado con L2, y soporta Matryoshka Representation Learning (MRL), que permite truncar el embedding a dimensiones menores listadas en `model.config.matryoshka_dimensions`.

El entrenamiento sigue el pipeline de TIGER-AI-Lab/VLM2Vec con diferencias minimas: inferencia multi-nodo multi-GPU con torchrun, un backbone propio para preprocesado e inferencia por lotes, y una recopilacion de datasets alineada con el modelo liberado. No se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset o el uso de RLHF/DPO. La evaluacion publicada cubre los benchmarks MMEB-v2 (78 datasets) y MMEB-v3 (190 tareas).

## Capacidades

- Generacion de embeddings multimodales: texto, imagen, video y documentos visuales, asi como entradas intercaladas de varios tipos en un mismo mensaje.
- Embedding de 4096 dimensiones L2-normalizado, con soporte de Matryoshka (MRL) para reducir la dimensionalidad (p. ej., 256, 512, 1024) sin reentrenar.
- Búsqueda y recuperacion multimodal: indexa y compara contenido heterogeneo en un mismo espacio vectorial.
- Recuperacion de documentos visuales: optimizado para tareas de NDCG@5 en documentos con imagenes, tablas y texto.
- Recuperacion de video: maneja videos con muestreo de hasta 64 frames, util para busqueda de contenido audiovisual.
- No soporta entrada de audio, a diferencia de modelos como E5-Omni o LCO-Embedding-Omni.
- Compatible con transformers (AutoModel/AutoProcessor) y con sentence-transformers mediante el cargador `load_wemm_sentence_transformer`.
- Despliegue en produccion mediante vLLM (con `--runner pooling`) o SGLang (con `--is-embedding`).

## Casos de uso

- Busqueda multimodal en bases de datos: indexar imagenes, videos y documentos con el mismo embedding permite buscar por texto, imagen o video de forma unificada. Por ejemplo, en un CMS, se puede consultar "perro corriendo en la playa" y obtener tanto fotos como clips de video relevantes.
- Recuperacion de documentos visuales (VisDoc): en entornos corporativos con informes, facturas o presentaciones escaneadas, el modelo genera embeddings que mantienen la relacion entre texto, tablas y graficos, mejorando la busqueda semantica sobre documentos complejos.
- Sistema de recomendacion de contenido: combinar embeddings de articulos (texto), portadas (imagen) y trailers (video) para recomendar contenido similar en plataformas de streaming o redes sociales.
- RAG multimodal (Retrieval-Augmented Generation): como componente de recuperacion en pipelines de generacion aumentada, donde el modelo indexa imagenes y videos junto a texto, permitiendo a un LLM responder consultas que requieren contexto visual.
- Deduplicacion de contenido multimedia: comparar embeddings de imagenes y videos para detectar duplicados o variaciones cercanas, util en plataformas de almacenamiento o moderacion de contenido.
- Busqueda por imagen en e-commerce: el usuario sube una foto y el sistema devuelve productos similares, combinando embeddings de imagen y texto en un solo espacio vectorial, simplificando la infraestructura al no requerir modelos separados.

## Benchmarks y rendimiento

Los resultados se han publicado en el technical report del proyecto para los benchmarks MMEB-v2 y MMEB-v3. En MMEB-v2 (78 datasets), el modelo de 9B obtiene una media de 80,6, superando a alternativas de tamano similar como Qwen3-VL-Embedding 8B (77,8) y GME 8B (59,2). En MMEB-v3 (190 tareas), la tabla de la model card se corta antes de mostrar el valor completo para el modelo de 9B, por lo que no se dispone del dato exacto.

| Modelo | Tamano | MMEB-v2 (AVG) | Image (Hit@1) | Video (Hit@1) | VisDoc (NDCG@5) |
|---|---|---|---|---|---|
| Qwen3-VL-Embedding | 8B | 77,8 | 80,1 | 67,1 | 82,4 |
| DME-Medium† | 9B | 78,4 | 79,8 | 70,8 | 82,0 |
| **WeMM-Embedding** | **9B** | **80,6** | **81,9** | **74,3** | **83,3** |

| Modelo | Tamano | MMEB-v3 (V3-All) | Text | Agent | MCMR | Audio |
|---|---|---|---|---|---|---|
| Qwen3-VL-Embedding | 8B | 53,5 | 42,5 | 38,4 | 38,0 | 0,0 |
| Tianmu-Emb-Uni | 8B | 53,3 | 43,6 | 39,4 | 38,8 | 38,9 |
| E5-Omni | 7B | 47,1 | 26,9 | 36,7 | 41,1 | 43,0 |
| **WeMM-Embedding** | **9B** | no disponible | no disponible | no disponible | no disponible | no disponible |

† Modelo closed-source sin pesos publicos ni endpoint de inferencia. El valor de WeMM-Embedding-9B en MMEB-v3 no se ha completado en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bfloat16 ocupa aproximadamente 18,8 GB de pesos, por lo que se recomienda al menos 24 GB de VRAM para cargar el modelo completo. Con cuantizaciones no publicadas, no hay opciones de reduccion de memoria oficiales.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB), RTX 4090 (24 GB), RTX 3090 (24 GB) o GPUs de datacenter con 24 GB o mas. No es viable en GPU de consumo de 8-12 GB sin cuantizacion.
- Despliegue en produccion: soportado via vLLM v0.27.0 (con `--runner pooling`) y SGLang v0.5.9 (con `--is-embedding`), ambos optimizados para inferencia de embeddings. Tambien se puede usar con transformers en modo batch.
- Latencia y throughput: no se han publicado datos especificos de latencia o throughput. Para tareas de embedding, se recomienda usar batch de gran tamano y normalizacion L2 en el procesamiento.
- Alternativas de bajo VRAM: si se dispone de menos de 24 GB, se puede usar el modelo WeMM-Embedding-2B o 4B del mismo autor, que requieren menos memoria y estan disponibles en la coleccion.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | MMEB-v2 (AVG) | MMEB-v3 (V3-All) | Licencia | Formato |
|---|---|---|---|---|---|---|
| **WeMM-Embedding-9B** | 9,4B | no disponible | 80,6 | no disponible | wemm-model-license / Apache 2.0 | safetensors |
| Qwen3-VL-Embedding | 8B | no disponible | 77,8 | 53,5 | Apache 2.0 | safetensors |
| GME | 8B | no disponible | 59,2 | 43,6 | no disponible | no disponible |
| VLM2Vec | 8B | no disponible | 53,2 | 32,9 | no disponible | no disponible |

WeMM-Embedding-9B supera en MMEB-v2 a las alternativas de 8B en todos los subconjuntos (imagen, video, VisDoc). En MMEB-v3, supera a Qwen3-VL-Embedding 8B (53,5 vs. 53,5, aunque el valor de WeMM no esta completo en la informacion disponible) y a GME 8B. La principal limitacion comparativa es que no soporta audio, mientras que modelos como E5-Omni o LCO-Embedding-Omni si lo hacen.

## Limitaciones y advertencias

- No soporta entrada de audio: los benchmarks de audio en MMEB-v3 se asignan a cero, por lo que no es adecuado para tareas de recuperacion multimodal con sonido.
- Solo bilingue (zh, en): no se han publicado capacidades para otros idiomas, lo que limita su uso en entornos multilingues.
- Licencia especifica: la model card indica `wemm-model-license`, aunque la fuente web menciona Apache 2.0 para codigo y pesos. Es necesario revisar el archivo LICENSE del repositorio para confirmar las restricciones de uso comercial.
- Riesgo de alucinacion: aunque es un modelo de embedding (no generativo), puede producir embeddings poco fiables en documentos con contenido ambiguo o cuando el prompt de instruccion no es claro. No se ha publicado evaluacion de sesgos.
- Sin cuantizaciones oficiales: no hay versiones GGUF o INT8, lo que dificulta el despliegue en entornos con recursos limitados.
- Contexto largo no especificado: no se ha publicado la longitud maxima de contexto, aunque el modelo usa un procesador de video con muestreo de 64 frames, lo que implica un limite implicito de tokens de entrada.
- Dependencia de librerias especificas: requiere transformers 5.2.0, `qwen-vl-utils[decord]==0.0.14` y `sentence-transformers==5.7.0`, lo que puede causar conflictos en entornos con versiones anteriores.

## Enlaces

- HuggingFace: https://huggingface.co/tencent/WeMM-Embedding-9B
- Coleccion de modelos: https://huggingface.co/collections/tencent/wemm-embedding
- Technical report (PDF): https://github.com/Tencent/WeMM-Embedding/blob/main/assets/WeMM_Embedding_tech_report.pdf
- Repositorio GitHub oficial: https://github.com/Tencent/WeMM-Embedding
- Licencia del modelo: https://huggingface.co/tencent/WeMM-Embedding-9B/blob/main/LICENSE
- Proyecto WeMM (WeChatCV, modelo multimodal generativo): https://github.com/scenarios/WeMM
