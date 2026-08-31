# victormuryn/use-natural-pt

## Resumen

El modelo `victormuryn/use-natural-pt` es un encoder de oraciones multilingüe desarrollado por Victor Muryn, especializado en la generación de embeddings semánticos para el ucraniano. Se trata de un fine-tuning del modelo `paraphrase-multilingual-mpnet-base-v2` de sentence-transformers, entrenado sobre el corpus de texto ucraniano UberText 2.0 con una estrategia de objetivos de pooling (pool targets) y sin aumentación de datos. Forma parte de una colección más amplia que explora diferentes estrategias de entrenamiento para mejorar la calidad de los embeddings en ucraniano, comparando variantes con y sin aumentación.

El modelo resuelve el problema de representar oraciones en un espacio vectorial de alta dimensionalidad donde la similitud semántica se corresponde con la proximidad geométrica. Es relevante porque ofrece una opción específica para ucraniano dentro de un marco multilingüe, con licencia Apache 2.0 y un tamaño de 278 millones de parámetros, lo que lo hace viable para despliegue en entornos con recursos moderados. Su contexto de entrada está limitado a 512 tokens, herencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (MPNet) basado en XLM-RoBERTa |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens (heredado del modelo base) |
| Tipos de cuantizacion | no disponible (se distribuye en FP32/FP16) |
| Idiomas soportados | Multilingüe (50+ idiomas, incluye ucraniano, inglés, español, francés, alemán, etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MPNet (Masked and Permuted Language Modeling), un transformer preentrenado de forma multilingüe que combina técnicas de enmascarado y permutación para mejorar la representación contextual. El modelo base `paraphrase-multilingual-mpnet-base-v2` ya ha sido optimizado para tareas de similitud de oraciones mediante un entrenamiento contrastivo sobre datos de paráfrasis multilingües. Sobre esta base, `use-natural-pt` se ha ajustado con un objetivo contrastivo adicional utilizando el corpus UberText 2.0, que contiene texto ucraniano sin procesar. La técnica de "pool targets" implica que durante el entrenamiento se utilizan los vectores de pooling (media de los tokens de salida) como objetivos directos, sin necesidad de pares etiquetados. No se aplicó ningún tipo de aumentación de datos, lo que permite evaluar el efecto del entrenamiento únicamente sobre datos naturales.

## Capacidades

- Genera embeddings de oraciones de 768 dimensiones (heredado del modelo base).
- Similitud semántica entre oraciones en múltiples idiomas, con especial énfasis en ucraniano.
- Búsqueda semántica (semantic search) y recuperación de información.
- Clustering de documentos por similitud temática.
- Clasificación de textos mediante comparación de embeddings (por ejemplo, con un clasificador lineal).
- Soporte para uso con la librería sentence-transformers y compatible con Text Embeddings Inference (TEI).
- No es un modelo generativo; no produce texto ni admite tool calling ni funciones de agente.

## Casos de uso

- Búsqueda semántica en ucraniano: permite indexar documentos en ucraniano y recuperar los más relevantes mediante consultas en lenguaje natural, gracias a su entrenamiento específico sobre UberText 2.0.
- Sistemas de recomendación de contenido: al representar artículos, noticias o publicaciones como vectores, se pueden calcular similitudes para sugerir elementos relacionados.
- Agrupación de tickets de soporte: los embeddings permiten agrupar consultas de usuarios por tema, facilitando la automatización de respuestas o la priorización.
- Análisis de sentimiento o clasificación de texto: combinando los embeddings con un clasificador ligero (por ejemplo, regresión logística) se pueden construir sistemas de moderación o análisis de opinión.
- Deduplicación de documentos: la similitud coseno entre embeddings ayuda a identificar documentos duplicados o casi duplicados en grandes colecciones.
- Recuperación aumentada por generación (RAG): aunque el modelo no genera texto, puede servir como componente de recuperación en un pipeline RAG para proporcionar contexto relevante en ucraniano a un LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación como Spearman correlation o similares.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en FP32 (278M parámetros × 4 bytes) y 0,56 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo tarjetas consumer como RTX 2060, GTX 1660, o incluso CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer de gama baja y media.
- Opciones de despliegue: sentence-transformers (Python), Text Embeddings Inference (TEI), o servidores compatibles con la API de Hugging Face.
- Latencia y throughput: no disponibles, pero al ser un modelo de 278M parámetros, en una GPU moderna (p. ej., RTX 3090) puede procesar cientos de oraciones por segundo en lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| victormuryn/use-natural-pt | 278M | 512 | Multilingüe (énfasis ucraniano) | Apache 2.0 | Fine-tuning sobre UberText 2.0 |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | 278M | 512 | Multilingüe | Apache 2.0 | Modelo base, entrenado en paráfrasis |
| intfloat/multilingual-e5-small | 118M | 512 | Multilingüe | MIT | Modelo de embeddings de propósito general |

La comparativa se limita a modelos de embeddings multilingües de tamaño similar. `use-natural-pt` se distingue por su entrenamiento específico en ucraniano, lo que puede mejorar la calidad en ese idioma frente al modelo base, aunque no se dispone de métricas que lo confirmen.

## Limitaciones y advertencias

- Al estar entrenado principalmente sobre texto ucraniano, su rendimiento en otros idiomas puede ser inferior al de modelos multilingües más generalistas.
- No es un modelo generativo; no produce respuestas ni texto.
- La longitud de contexto está limitada a 512 tokens; oraciones o documentos más largos deben truncarse o dividirse.
- No se han publicado evaluaciones formales; se desconoce su comportamiento en tareas específicas (por ejemplo, similitud en dominios técnicos o coloquiales).
- El corpus de entrenamiento puede contener sesgos presentes en el texto web ucraniano, lo que podría afectar a los embeddings en contextos sensibles.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de las condiciones del corpus base (UberText 2.0).

## Enlaces

- HuggingFace: https://huggingface.co/victormuryn/use-natural-pt
- Colección de modelos ucranianos: https://huggingface.co/collections/victormuryn/ukrainian-sentence-embeddings-use
- Corpus UberText 2.0: https://lang.org.ua/en/ubertext/
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
