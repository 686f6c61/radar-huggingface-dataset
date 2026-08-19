# yjoonjang/colbert-ko-v1

## Resumen

colbert-ko-v1 es un modelo de embeddings multi-vector (ColBERT) específico para coreano, desarrollado por Youngjoon Jang y publicado bajo licencia Apache 2.0. Está finetuneado sobre ModernBERT mediante la librería PyLate, y está entrenado exclusivamente con datos en coreano. El modelo mapea frases y párrafos a secuencias de vectores densos de 128 dimensiones y utiliza el operador MaxSim para calcular similitud semántica textual, una técnica conocida como interacción tardía (late interaction) que combina precisión de representaciones contextuales con eficiencia de indexación.

Con aproximadamente 148 millones de parámetros (0,1B), el modelo ofrece una ventana de contexto de 1024 tokens para documentos y 32 tokens para consultas, lo que lo hace adecuado para tareas de recuperación de información y generación aumentada por recuperación (RAG) en coreano. Su relevancia radica en que logra resultados superiores a modelos multilingües más grandes (como jina-colbert-v2) en benchmarks de recuperación coreanos, a la vez que mantiene un tamaño compacto y una licencia permisiva para uso comercial. El modelo es compatible con el ecosistema Sentence Transformers, PyLate y MUVERA, lo que facilita su integración en pipelines de búsqueda y reranking.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ColBERT (multi-vector) basado en ModernBERT |
| Parametros totales | 148.733.184 (~0,1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens para documentos, 32 tokens para consultas |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) exclusivamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ColBERT (Khattab y Zaharia, 2020), que produce embeddings por token tanto para consultas como para documentos, y calcula la relevancia mediante el operador MaxSim sobre las similitudes por pares. En este caso, el backbone es ModernBERT, un transformer optimizado con atención eficiente y entrenamiento en secuencias largas, sobre el cual se añade una capa densa que proyecta las representaciones de 768 a 128 dimensiones. La arquitectura completa se compone de un transformer ModernBertModel (con longitud máxima de secuencia de 1023 tokens) seguido de una capa lineal sin sesgo con activación identidad.

El entrenamiento se realizó con PyLate, una librería especializada en modelos de interacción tardía. Aunque la model card no especifica el dataset de entrenamiento, el modelo fue evaluado en cinco conjuntos de datos de recuperación coreanos: Ko-StrategyQA, AutoRAGRetrieval, PublicHealthQA, BelebeleRetrieval y MultiLongDocRetrieval, cubriendo dominios como finanzas, salud pública, medicina, derecho y comercio. No se menciona explícitamente el uso de RLHF o DPO; el entrenamiento se centra en la optimización de la pérdida de recuperación típica de ColBERT.

## Capacidades

- Recuperación semántica multi-vector con interacción tardía y operador MaxSim.
- Similitud textual semántica para consultas y documentos en coreano.
- Reranking de resultados procedentes de un pipeline de primera etapa (por ejemplo, BM25 o embeddings densos).
- Indexación y búsqueda eficiente mediante PLAID/FastPLAID, integrable con PyLate.
- Compatibilidad con MUVERA para búsqueda aproximada del vecino más cercano en espacios multi-vector.
- Integración con Sentence Transformers a través de la clase `MultiVectorEncoder`.
- Soporte de codificación separada para consultas (máximo 32 tokens) y documentos (máximo 1024 tokens).

## Casos de uso

- Recuperación aumentada por generación (RAG) en coreano: el modelo puede indexar documentos largos (hasta 1024 tokens) y recuperar pasajes relevantes para alimentar a un LLM generativo en tareas de pregunta-respuesta sobre dominios específicos como finanzas o sanidad.
- Reranking en pipelines de búsqueda: combinado con un recuperador de primera etapa (por ejemplo, BM25), colbert-ko-v1 puede reordenar los candidatos usando MaxSim, mejorando la precisión final sin necesidad de reindexar todo el corpus.
- Búsqueda semántica en bases de conocimiento corporativas: ideal para empresas que manejan documentación interna en coreano (manuales, informes legales, expedientes médicos) y necesitan un motor de búsqueda que entienda sinónimos y paráfrasis.
- Sistemas de atención al cliente automatizada: el modelo puede recuperar respuestas relevantes de una base de artículos de ayuda en coreano, permitiendo que un chatbot ofrezca respuestas precisas basadas en el contexto de la consulta del usuario.
- Análisis de similitud entre documentos legales o financieros: gracias a su capacidad de representar documentos completos como secuencias de vectores, puede detectar pasajes similares entre contratos o informes, facilitando tareas de comparación y auditoría.
- Motores de recomendación de contenido: en plataformas de noticias o blogs coreanos, el modelo puede recuperar artículos relacionados con una consulta o con otro artículo, mejorando la experiencia de descubrimiento de contenido.

## Benchmarks y rendimiento

La model card reporta resultados promediados sobre cinco datasets de recuperación coreanos (Ko-StrategyQA, AutoRAGRetrieval, PublicHealthQA, BelebeleRetrieval y MultiLongDocRetrieval). Se comparó con jina-colbert-v2, un modelo ColBERT multilingüe de mayor tamaño.

| Modelo | Parametros | Recall@10 | Precision@10 | NDCG@10 | F1@10 |
|---|---|---|---|---|---|
| colbert-ko-v1 | 0,1B | 0,7999 | 0,0930 | 0,7172 | 0,1655 |
| jina-colbert-v2 | 0,5B | 0,7518 | 0,0888 | 0,6671 | 0,1577 |

El modelo supera a jina-colbert-v2 en todas las métricas a pesar de tener cinco veces menos parámetros, lo que indica una especialización efectiva en coreano. No se han publicado resultados en benchmarks generales como MMLU o HumanEval, ya que se trata de un modelo de embeddings, no generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 148M de parámetros, el modelo en precisión fp32 ocupa aproximadamente 600 MB, y en fp16 unos 300 MB. Sin embargo, al ser multi-vector, el almacenamiento de embeddings por documento puede aumentar el uso de memoria en función del número de tokens. Se estima que una GPU con 4-8 GB de VRAM es suficiente para inferencia y reranking.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) puede ejecutar el modelo sin problemas. Para indexación de grandes corpus, se recomienda al menos 16 GB de VRAM si se procesan lotes grandes.
- Compatibilidad con GPU consumer: sí, cabe en GPUs de gama media y alta.
- Opciones de despliegue: PyLate (con indexación PLAID/FastPLAID), Sentence Transformers (`MultiVectorEncoder`), y compatible con text-embeddings-inference (TEI) según las etiquetas del repositorio. También se puede usar con MUVERA para búsqueda aproximada.
- Latencia y throughput: no se han publicado datos específicos. Al ser un modelo de 0,1B, la latencia de codificación es baja, pero el cálculo de MaxSim sobre múltiples vectores puede incrementar el coste en comparación con embeddings densos de una sola vector. Se recomienda usar indexación PLAID para acelerar la búsqueda.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto doc/query | Idioma | Recall@10 (coreano) | Licencia |
|---|---|---|---|---|---|
| colbert-ko-v1 | 0,1B | 1024/32 | Coreano | 0,7999 | Apache 2.0 |
| jina-colbert-v2 | 0,5B | 8192/32 | Multilingüe | 0,7518 | Apache 2.0 |
| bge-m3 (denso) | 0,57B | 8192 | Multilingüe | No disponible | MIT |

colbert-ko-v1 se posiciona como una opción especializada en coreano con mejor rendimiento que alternativas multilingües más grandes. Su ventaja principal es el entrenamiento exclusivo en coreano, lo que le permite capturar matices lingüísticos que los modelos multilingües pueden pasar por alto. Como desventaja, no soporta otros idiomas y su contexto de documento es más limitado que el de jina-colbert-v2 (1024 vs 8192 tokens), aunque suficiente para la mayoría de pasajes.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en coreano y no debe usarse para otros idiomas; los resultados fuera del coreano serán impredecibles.
- La longitud de documento está limitada a 1024 tokens; documentos más largos deberán truncarse o dividirse en fragmentos, lo que puede afectar a la recuperación de información en textos extensos.
- Al ser un modelo de embeddings, no genera texto; cualquier tarea de generación debe delegarse a un LLM externo.
- No se han documentado sesgos específicos, pero al entrenarse con datos coreanos puede reflejar sesgos culturales o de dominio presentes en esos datos.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos de los datasets de entrenamiento si se planea un uso en producción con datos sensibles.
- La evaluación se realizó en un conjunto limitado de dominios (finanzas, salud, legal, comercio); el rendimiento en otros dominios coreanos puede variar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yjoonjang/colbert-ko-v1
- Página personal del autor: https://yjoonjang.github.io/
- Repositorio PyLate: https://github.com/lightonai/pylate
- Documentación de Sentence Transformers sobre MultiVectorEncoder: https://sbert.net/docs/multi_vector_encoder/pretrained_models.html
- Paper de ColBERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de MUVERA (arXiv:2405.19504): https://arxiv.org/abs/2405.19504
- Paper de SPLADE (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
