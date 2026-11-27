# Veritone/nomic-embed-text-v2-moe

## Resumen

Nomic Embed Text v2 MoE es un modelo de embeddings de texto multilingüe desarrollado por Nomic AI, distribuido en este repositorio como espejo (mirror) por Veritone para permitir builds reproducibles fijados a una revisión concreta. Resuelve el problema de la recuperación semántica multilingüe de alta calidad con un coste de inferencia contenido, aplicando por primera vez una arquitectura de mezcla de expertos (MoE) al ámbito general de los embeddings de texto, un terreno donde hasta ahora el escalado se hacía aumentando parámetros densos.

El modelo cuenta con 475 millones de parámetros totales, de los cuales solo 305 millones se activan durante la inferencia gracias a un enrutamiento top-2 sobre 8 expertos. Emite embeddings de 768 dimensiones que pueden truncarse hasta 256 mediante Matryoshka Representation Learning, con una longitud máxima de secuencia de 512 tokens y soporte para alrededor de 100 idiomas. Está pensado para RAG, búsqueda semántica y clustering multilingüe, donde el ahorro de memoria y latencia es crítico.

Su relevancia actual radica en que iguala o supera a modelos densos del doble de tamaño en benchmarks multilingües como MIRACL, manteniendo el coste de un modelo de ~300M de parámetros. La licencia Apache-2.0, la publicación de pesos, código y datos de entrenamiento, y su compatibilidad con Text Embeddings Inference lo convierten en una opción atractiva para despliegues en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de mezcla de expertos (MoE), variante nomic_bert |
| Parametros totales | 475.292.928 |
| Parametros activos | 305 M (8 expertos, enrutamiento top-2) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ~100 idiomas (en, es, fr, de, it, pt, nl, pl, ru, zh, ja, ko, ar, hi, etc.) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer basada en nomic_bert con capas de mezcla de expertos: 8 expertos con enrutamiento top-2, lo que resulta en 475M de parámetros totales pero solo 305M activos por token procesado. Esta configuración reduce la latencia y el uso de memoria en comparación con un modelo denso equivalente en parámetros totales. Los embeddings tienen 768 dimensiones y se entrenan con Matryoshka Representation Learning, lo que permite truncarlos a 256 dimensiones con una degradación mínima del rendimiento y una reducción de hasta 3x en coste de almacenamiento.

El entrenamiento se realizó sobre más de 1.600 millones de pares de texto multilingües, según la model card. El modelo base es `nomic-ai/nomic-embed-text-v2-moe-unsupervised`, sobre el que se aplicó un ajuste supervisado (finetune). Nomic publica tanto los datos de preentrenamiento como los de ajuste fino y el código de entrenamiento en el repositorio `nomic-ai/contrastors`, lo que permite la reproducibilidad completa del pipeline. El modelo requiere prefijos de instrucción de tarea (`search_query:` y `search_document:`) para un rendimiento óptimo.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación de información.
- Recuperación multilingüe de alta calidad en alrededor de 100 idiomas.
- Embeddings de dimensión flexible (768, 512, 256) mediante Matryoshka, ajustables según el compromiso entre precisión y almacenamiento.
- Soporte de tareas de búsqueda asimétrica mediante prefijos `search_query:` y `search_document:`.
- Extracción de características (feature-extraction) y uso como codificador en pipelines de sentence-transformers.
- Compatible con Text Embeddings Inference (TEI) mediante su implementación nativa `nomic_bert`.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Búsqueda semántica multilingüe en RAG: el modelo indexa documentos y consultas en más de 100 idiomas con 512 tokens de contexto por fragmento, permitiendo recuperar pasajes relevantes en el idioma del usuario aunque el corpus esté en otro idioma.
- Deduplicación y clustering de grandes corpus: los embeddings Matryoshka de 256 dimensiones reducen el almacenamiento hasta 3x y permiten agrupar millones de documentos por similitud coseno con coste de memoria contenido.
- Motor de búsqueda interna empresarial: con 305M de parámetros activos, se puede desplegar en una sola GPU consumer y servir consultas de baja latencia sobre índices vectoriales como FAISS, Qdrant o Milvus.
- Moderación y clasificación de contenido: la representación semántica permite entrenar clasificadores ligeros sobre los embeddings para detectar categorías de texto sin necesidad de un LLM generativo.
- Sistemas de recomendación basados en contenido: comparar descripciones de productos o artículos mediante similitud de embeddings para sugerir ítems relacionados semánticamente.
- Enrutamiento de consultas en pipelines de agentes: usar el embedding de la consulta para decidir qué herramienta o base de conocimiento consultar antes de invocar un LLM generativo, reduciendo coste y latencia.
- Análisis de opiniones y temas: agrupar reseñas o tickets de soporte multilingües por temática usando los embeddings truncados a 256 dimensiones para acelerar el proceso.

## Benchmarks y rendimiento

Resultados publicados en la model card (BEIR y MIRACL):

| Modelo | Parametros (M) | Dim. embedding | BEIR | MIRACL |
|---|---|---|---|---|
| Nomic Embed v2 | 305 (activos) | 768 | 52,86 | 65,80 |
| mE5 Base | 278 | 768 | 48,88 | 62,30 |
| mGTE Base | 305 | 768 | 51,10 | 63,40 |
| Arctic Embed v2 Base | 305 | 768 | 55,40 | 59,90 |
| BGE M3 | 568 | 1024 | 48,80 | 69,20 |
| Arctic Embed v2 Large | 568 | 1024 | 55,65 | 66,00 |
| mE5 Large | 560 | 1024 | 51,40 | 66,50 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,9 GB en safetensors (aproximadamente 475M de parámetros en fp32/bf16); en la práctica cabe en GPUs con 4-8 GB de VRAM. No se dispone de cifras oficiales de cuantización.
- GPU recomendadas: cualquier GPU moderna con al menos 8 GB de VRAM; una RTX 4090 o A100 ofrecen throughput muy alto, pero el modelo también funciona en GPUs consumer de gama media como RTX 3060.
- Cabe en GPU consumer: sí, en la mayoría de GPUs con 6-8 GB de VRAM o más.
- Opciones de despliegue: Text Embeddings Inference (TEI) con implementación nativa `nomic_bert`, sentence-transformers, transformers con `trust_remote_code=True`, y el ecosistema de Nomic Atlas.
- Latencia y throughput: no se han publicado cifras concretas en la información disponible; el uso de MoE con 305M de parámetros activos reduce el coste frente a un denso de 475M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dim. embedding | BEIR | MIRACL | Licencia |
|---|---|---|---|---|---|---|
| Nomic Embed v2 MoE | 475M (305M activos) | 512 | 768 (Matryoshka) | 52,86 | 65,80 | Apache-2.0 |
| mE5 Base | 278M | no disponible | 768 | 48,88 | 62,30 | MIT (según modelo original) |
| mGTE Base | 305M | no disponible | 768 | 51,10 | 63,40 | no disponible |
| Arctic Embed v2 Base | 305M | no disponible | 768 | 55,40 | 59,90 | Apache-2.0 |

## Limitaciones y advertencias

- Longitud de contexto limitada a 512 tokens; documentos más largos deben fragmentarse, lo que puede perder contexto en pasajes largos.
- El modelo requiere prefijos de tarea (`search_query:` / `search_document:`); su omisión degrada el rendimiento.
- No es un modelo generativo: no puede responder preguntas ni razonar, solo producir representaciones vectoriales.
- Riesgo de alucinación no aplicable directamente, pero los embeddings pueden reflejar sesgos presentes en los datos de entrenamiento multilingües.
- El rendimiento puede variar notablemente entre idiomas; los benchmarks publicados no cubren todos los idiomas listados.
- La licencia Apache-2.0 permite uso comercial, pero el `auto_map` de `config.json` apunta a código remoto en `nomic-ai/nomic-bert-2048`, lo que requiere `trust_remote_code=True` en transformers; TEI no lo necesita.
- Este repositorio es un espejo de Veritone; para la versión canónica y actualizaciones debe consultarse el repositorio original de Nomic AI.

## Enlaces

- Hugging Face (espejo): https://huggingface.co/Veritone/nomic-embed-text-v2-moe
- Hugging Face (original): https://huggingface.co/nomic-ai/nomic-embed-text-v2-moe
- Modelo base no supervisado: https://huggingface.co/nomic-ai/nomic-embed-text-v2-moe-unsupervised
- Blog de Nomic: https://www.nomic.ai/blog/posts/nomic-embed-text-v2
- Informe técnico (paper): https://huggingface.co/papers/2502.07972
- Paper Matryoshka: https://arxiv.org/abs/2205.13147
- Repositorio de código y datos: https://github.com/nomic-ai/contrastors
- Repositorio MegaBlocks: https://github.com/nomic-ai/megablocks
- Plataforma Atlas: https://atlas.nomic.ai
- AWS SageMaker: https://aws.amazon.com/marketplace/seller-profile?id=seller-tpqidcj54zawi
