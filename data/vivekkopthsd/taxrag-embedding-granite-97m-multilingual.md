# vivekkopthsd/taxrag-embedding-granite-97m-multilingual

## Resumen

`taxrag-embedding-granite-97m-multilingual` es un modelo de embeddings de frases bilingüe (inglés/hindi) de 97 millones de parámetros, desarrollado por vivekkopthsd mediante fine-tuning contrastivo sobre `ibm-granite/granite-embedding-97m-multilingual-r2`. Está especializado en recuperación densa (dense retrieval) sobre el texto del Income-Tax Act indio, con soporte adicional para consultas en Hinglish (hindi transliterado al alfabeto latino). El modelo resuelve el problema de buscar y recuperar artículos legales fiscales en un corpus bilingüe de 2.474 fragmentos legislativos, algo que los encoders genéricos multilingües no cubren bien en el dominio legal-fiscal indio.

El modelo produce embeddings normalizados de 384 dimensiones con anidamiento Matryoshka en [384, 256, 128], lo que permite truncar la dimensionalidad en inferencia para reducir el tamaño del índice sin degradación catastrófica. Ocupa aproximadamente 211 MB en disco en bf16 y requiere entre 250 y 300 MB de RAM pico al cargar, lo que lo hace apto para entornos de despliegue pequeños como Streamlit Cloud en su nivel de 1 GB. Su licencia Apache-2.0 permite uso comercial sin restricciones.

La relevancia actual del modelo radica en que cubre un nicho concreto: recuperación legal fiscal en India con consultas mixtas en inglés, hindi y Hinglish, manteniendo a la vez una capacidad de generalización aceptable fuera de dominio (validada en FiQA-2018). Es una alternativa ligera a encoders más grandes como EmbeddingGemma-300m para pipelines de RAG fiscal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (basado en Granite Embedding 97m multilingual R2) |
| Parametros totales | 97.441.152 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | bf16 (pesos nativos); no se documentan cuantizaciones adicionales |
| Idiomas soportados | inglés (en), hindi (hi), Hinglish (hindi transliterado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `ibm-granite/granite-embedding-97m-multilingual-r2`, un encoder transformer compacto de 97M parámetros con salida de 384 dimensiones y ventana de contexto de 32.768 tokens, entrenado originalmente para soportar más de 200 idiomas. El fine-tuning se realizó con `CachedMultipleNegativesRankingLoss` (InfoNCE, escala 20) envuelto en `MatryoshkaLoss` con dimensiones [384, 256, 128] y negativos minados con BM25 ponderados por dureza.

El dataset de entrenamiento consta de 29.440 tripletas ancla/positivo/negativo en dos niveles: un nivel 1 con pares bilingües de artículos legales del Income-Tax Act 2025 y Finance Act 2026 (1.237 secciones en inglés con traducciones al hindi y paráfrasis deterministas de consultas), y un nivel 2 con datos generales de finanzas extraídos de los qrels de entrenamiento de BeIR/fiqa. El entrenamiento se ejecutó durante 3 épocas (1.380 pasos) con AdamW, learning rate 1e-5, warmup del 10%, weight decay 0,01 y gradiente máximo de norma 1,0, en una sola NVIDIA RTX 3090 de 24 GB con un tiempo total aproximado de 24 minutos. La selección del mejor modelo se hizo sobre `eval_mean_recall@5` en el paso 750 de 1.380.

## Capacidades

- Recuperación densa y búsqueda semántica sobre corpus legales y fiscales en inglés, hindi y Hinglish.
- Embeddings de 384 dimensiones normalizados (coseno), con truncamiento Matryoshka opcional a 256 o 128 dimensiones para índices más ligeros.
- Integración con pipelines de recuperación híbrida (combinable con BM25).
- Compatible con la librería `sentence-transformers` y con `text-embeddings-inference` (TEI), según las etiquetas del repositorio.
- Generalización positiva fuera de dominio en recuperación financiera (FiQA-2018), con mejora de Recall@5 frente al modelo base sin fine-tuning.
- No soporta generación de texto, clasificación ni tareas de visión; es exclusivamente un encoder de similitud de frases.

## Casos de uso

- Asistente fiscal para contribuyentes indios: el modelo permite construir un chatbot RAG que responde preguntas sobre deducciones, exenciones y secciones del Income-Tax Act en inglés o hindi, recuperando los artículos relevantes de un corpus de 2.474 fragmentos con Recall@5 de 0,98 en inglés y 0,94 en hindi.
- Búsqueda jurídica bilingüe para despachos de abogados: consultas en hindi o inglés sobre jurisprudencia fiscal devuelven los artículos de ley correspondientes, reduciendo el tiempo de localización de normativa aplicable.
- Pipeline de recuperación híbrida BM25 + embeddings: al ser un modelo ligero (211 MB), puede desplegarse junto a un índice BM25 en un solo contenedor para mejorar la precisión de búsqueda sin necesidad de GPUs dedicadas.
- Sistema de consultas en Hinglish para usuarios no anglófonos: aunque el Recall@5 en Hinglish es de 0,50, permite a usuarios que escriben hindi en alfabeto latino obtener resultados parcialmente relevantes, algo que los modelos solo-inglés no ofrecen.
- Indexación semántica de actualizaciones legislativas: al fine-tunearse sobre el Income-Tax Act 2025 y el Finance Act 2026, el modelo puede indexar nuevas secciones o enmiendas y mantener la coherencia con el corpus existente.
- Filtrado y deduplicación de documentos fiscales: los embeddings de 128 dimensiones (truncados) permiten comparar similitud entre documentos a gran escala con coste de almacenamiento reducido, útil para organizar bases documentales de compliance.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. Evaluación dentro de dominio sobre el slice bilingüe TaxRAG (100 consultas EN + 50 HI + 30 Hinglish sobre 2.474 fragmentos):

| Slice | R@1 | R@5 | MRR@5 |
|---|---|---|---|
| Inglés | 0,89 | 0,98 | 0,923 |
| Hindi | 0,76 | 0,94 | 0,828 |
| Hinglish | 0,27 | 0,50 | 0,345 |
| Media | 0,64 | 0,81 | 0,699 |

Evaluación fuera de dominio (gate de generalización) en FiQA-2018 test (648 consultas financieras):

| Modelo | R@1 | R@5 | MRR@5 |
|---|---|---|---|
| taxrag-embedding-granite-97m (fine-tuned) | 0,329 | 0,537 | 0,406 |
| granite-embedding-97m-multilingual-r2 (stock) | 0,322 | 0,523 | 0,400 |
| Delta vs stock | +0,006 | +0,014 | +0,006 |

No se han publicado resultados en benchmarks generales tipo MMLU, MTEB o BEIR completos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bf16; el modelo ocupa ~211 MB en disco y entre 250 y 300 MB de RAM pico al cargar.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA T4, RTX 3060); funciona también en CPU sin problemas para cargas moderadas.
- Cabe en GPUs de consumo: sí, en cualquier GPU moderna, incluida una GTX 1650 o superior.
- Opciones de despliegue: `sentence-transformers` en Python, `text-embeddings-inference` (TEI) según las etiquetas del repositorio, y entornos serverless o de bajo perfil como Streamlit Cloud (nivel ~1 GB), que fue el objetivo declarado del autor.
- Latencia y throughput: no se han publicado mediciones formales; dado el tamaño de 97M parámetros, la codificación de un lote pequeño en CPU típicamente toma decenas de milisegundos por frase.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Idiomas | Licencia | Dominio |
|---|---|---|---|---|---|---|
| taxrag-embedding-granite-97m (este modelo) | 97M | 384 (Matryoshka 256/128) | 32.768 | en, hi, Hinglish | Apache-2.0 | Fiscal indio |
| embeddinggemma-300m-taxrag-ft (mismo autor) | 300M | no disponible | no disponible | en, hi, Hinglish | no disponible | Fiscal indio |
| granite-embedding-97m-multilingual-r2 (base) | 97M | 384 | 32.768 | 200+ | Apache-2.0 | General multilingüe |
| granite-embedding-107m-multilingual | 107M | no disponible | no disponible | 200+ | no disponible | General multilingüe |

El modelo compite directamente con `embeddinggemma-300m-taxrag-ft`, también del mismo autor y con el mismo propósito, pero con un tercio de los parámetros y un coste de despliegue menor. Frente a su base sin fine-tuning, ofrece una mejora de +0,014 en Recall@5 fuera de dominio y un salto sustancial en recuperación dentro del dominio fiscal bilingüe.

## Limitaciones y advertencias

- La evaluación dentro de dominio usa consultas construidas por paráfrasis deterministas de títulos de sección, lo que la hace más fácil que un benchmark real de preguntas de usuarios; muchos sustantivos de las secciones aparecen literalmente en las consultas.
- El rendimiento en Hinglish es notablemente inferior (Recall@5 de 0,50 frente a 0,98 en inglés), por lo que no es fiable para consultas complejas en transliteración latina.
- No está diseñado para clasificación, generación ni recuperación de dominio abierto no legal; el autor recomienda un encoder de propósito general para esos casos.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) y provienen del propio autor; no hay evaluación independiente publicada.
- El modelo tiene 0 descargas y 0 likes en HuggingFace al momento de la ficha, por lo que su adopción y validación comunitaria es nula.
- No se documentan cuantizaciones alternativas (INT8, GGUF, etc.), lo que limita su despliegue en entornos que requieran formatos específicos.
- El fine-tuning se realizó sobre el Income-Tax Act 2025 y el Finance Act 2026; su cobertura de legislación anterior o de otros países no está garantizada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vivekkopthsd/taxrag-embedding-granite-97m-multilingual
- Modelo base: https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2
- Documentación de IBM Granite Embedding: https://www.ibm.com/granite/docs/models/embedding
- Repositorio GitHub de modelos de embedding de IBM: https://github.com/ibm-granite/granite-embedding-models
- Documentación técnica de Granite Embedding (GitHub): https://github.com/ibm-granite/docs/blob/main/granite/docs/models/embedding.mdx
- Modelo alternativo del mismo autor (EmbeddingGemma-300m TaxRAG): https://huggingface.co/vivekkopthsd/embeddinggemma-300m-taxrag-ft
- Granite Embedding 107m multilingüe: https://huggingface.co/ibm-granite/granite-embedding-107m-multilingual
