# victormuryn/use-mask-no-pt

## Resumen

`victormuryn/use-mask-no-pt` es un modelo de embeddings de oraciones (sentence embeddings) desarrollado por Victor Muryn, fine-tuneado a partir de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` sobre el corpus ucraniano UberText 2.0. Forma parte de la colección Ukrainian Sentence Embeddings, cuyo objetivo es estudiar el impacto de distintas estrategias de aumentación de datos y de objetivos de pooling en la calidad de los embeddings para ucraniano. Este modelo concreto emplea aumentación por enmascaramiento (masking) y no utiliza pool targets.

El modelo tiene 278 millones de parámetros y está pensado para tareas de similitud semántica, extracción de características y búsqueda por similitud. Al estar basado en un modelo multilingüe, conserva capacidades en decenas de idiomas, aunque el fine-tuning se ha realizado exclusivamente con texto ucraniano. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

A pesar de ser un modelo de nicho (orientado al ucraniano), su arquitectura multilingüe lo hace utilizable en otros idiomas, aunque con un rendimiento esperable inferior al de modelos especializados en esos idiomas. Con 0 descargas y 0 likes en el momento de su publicación, es un modelo muy reciente y sin validación externa todavía.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNet (basado en paraphrase-multilingual-mpnet-base-v2) |
| Parametros totales | 278.043.648 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingüe (50+ idiomas, incluye ucraniano, inglés, español, francés, alemán, etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en MPNet (Masked and Permuted Language Modeling), una arquitectura transformer que combina el enmascaramiento de BERT con la permutación de XLNet, logrando una representación más eficiente del contexto. El modelo base `paraphrase-multilingual-mpnet-base-v2` fue preentrenado por sentence-transformers con un objetivo de paráfrasis multilingüe sobre 50+ idiomas. Sobre esta base, `use-mask-no-pt` se fine-tuneó con un objetivo contrastivo sobre el corpus ucraniano UberText 2.0.

La técnica de aumentación empleada es el enmascaramiento (masking): se ocultan aleatoriamente tokens de las oraciones originales para generar pares positivos. No se utilizan pool targets, lo que significa que el entrenamiento contrastivo no usa una capa de pooling específica para agrupar los embeddings, sino que aprende directamente sobre las representaciones de la capa CLS o la media de los tokens, según la configuración de sentence-transformers. El objetivo es explorar cómo esta estrategia afecta la calidad de los embeddings en ucraniano comparado con otras variantes de la colección.

## Capacidades

- Generación de embeddings de oraciones de alta dimensionalidad (768 dimensiones, heredado del modelo base).
- Similitud semántica entre textos, tanto en ucraniano como en otros idiomas multilingües.
- Extracción de características (feature extraction) para uso en pipelines de NLP.
- Búsqueda semántica y recuperación de información (retrieval) mediante similitud coseno.
- Agrupación (clustering) y clasificación de textos por similitud.
- Soporte para múltiples idiomas gracias al preentrenamiento multilingüe, aunque el fine-tuning está especializado en ucraniano.
- No soporta tool calling, generación de texto ni razonamiento multi-paso; es exclusivamente un modelo de representación.

## Casos de uso

- Búsqueda semántica en corpus ucranianos: el modelo permite indexar documentos y recuperar los más relevantes por similitud semántica, superando las limitaciones de búsqueda por palabras clave. Es adecuado para bibliotecas digitales, archivos históricos o bases de conocimiento en ucraniano.

- Sistemas de recomendación de contenido: al convertir artículos, noticias o publicaciones en embeddings, se pueden agrupar por temas y recomendar contenido relacionado en portales ucranianos o multilingües.

- Clasificación de textos y análisis de sentimiento: los embeddings generados pueden alimentar clasificadores supervisados (regresión logística, SVM, etc.) para tareas como detección de spam, análisis de opiniones o categorización de documentos en ucraniano.

- Deduplicación de documentos: comparando embeddings de documentos, se pueden identificar duplicados o versiones cercanas en grandes repositorios, útil para gestión documental o detección de plagio.

- Sistemas de preguntas y respuestas: combinado con un índice vectorial (por ejemplo, FAISS o Annoy), el modelo puede recuperar pasajes relevantes para responder preguntas sobre un corpus ucraniano, aunque no genera respuestas por sí mismo.

- Aprendizaje de representaciones para otros idiomas: dado su origen multilingüe, puede usarse como extractor de características en idiomas distintos del ucraniano, aunque con menor precisión que modelos especializados en esos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o similares, y el modelo está orientado a tareas de similitud semántica, donde las evaluaciones típicas serían conjuntos de datos como STS (Semantic Textual Similarity) o clasificación de intenciones, pero no se han proporcionado datos al respecto.

## Requisitos de hardware

- El modelo tiene 278 millones de parámetros. En precisión fp32, el checkpoint ocupa aproximadamente 1,1 GB (según el tamaño del repositorio). En fp16 o int8, el peso se reduce a unos 0,56 GB y 0,28 GB respectivamente, aunque no se han publicado cuantizaciones específicas.
- Para inferencia en CPU con llama.cpp o sentence-transformers, se recomienda al menos 4 GB de RAM libre.
- Para GPU, una tarjeta con 4 GB de VRAM es suficiente para cargar el modelo en fp32 (por ejemplo, GTX 1650, RTX 3050). En fp16, bastaría con 2 GB, pero es poco común.
- Modelos GPU recomendados: cualquier GPU NVIDIA con al menos 6 GB de VRAM (RTX 2060, RTX 3060, etc.) para inferencia cómoda y procesamiento por lotes.
- El despliegue puede hacerse con librerías estándar de sentence-transformers, o mediante servidores de embeddings como Text Embeddings Inference (TEI) o Hugging Face Inference Endpoints (el modelo tiene la etiqueta `endpoints_compatible`).
- No hay datos de latencia o throughput publicados; como referencia, un modelo de este tamaño suele procesar entre 100 y 500 oraciones por segundo en una GPU moderna (RTX 3090), pero esto depende del lote y la longitud de los textos.

## Comparativa con modelos similares

No se han publicado comparativas con modelos similares en la información disponible. No obstante, se puede comparar estructuralmente con su modelo base y con otros modelos de la misma colección:

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| paraphrase-multilingual-mpnet-base-v2 | 278M | 512 tokens (heredado) | Preentrenamiento multilingüe | Apache 2.0 |
| use-mask-no-pt (este modelo) | 278M | No disponible | Fine-tuning en ucraniano (UberText 2.0) con masking | Apache 2.0 |
| mpnet-use-ubertext-no-pt (otro de la colección) | 278M | No disponible | Fine-tuning en ucraniano sin aumentación | Apache 2.0 |

La comparativa directa requeriría evaluar ambos en tareas de similitud semántica en ucraniano, pero no se dispone de esos datos.

## Limitaciones y advertencias

- El modelo está fine-tuneado exclusivamente sobre texto ucraniano; su rendimiento en otros idiomas puede degradarse respecto al modelo base, especialmente en dominios no ucranianos.
- No se han publicado evaluaciones de sesgos o alucinaciones; al ser un modelo de embeddings, no genera texto, pero puede reflejar sesgos presentes en el corpus de entrenamiento (UberText 2.0).
- La longitud de contexto no está documentada; se hereda probablemente del modelo base (512 tokens), pero no se confirma en la ficha. Textos más largos deberán truncarse.
- No se proporcionan datos sobre el rendimiento en tareas downstream más allá de la similitud semántica.
- Al ser un modelo muy reciente (agosto de 2026) y sin descargas ni validación externa, su fiabilidad en producción aún no está contrastada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no incluye atribución obligatoria de autoría, aunque se recomienda citar al autor en publicaciones académicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/victormuryn/use-mask-no-pt
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Dataset de entrenamiento (mencionado): https://huggingface.co/datasets/victormuryn/wsd-training-dataset
- Colección de embeddings ucranianos: https://huggingface.co/collections/victormuryn/ukrainian-sentence-embeddings-use
- Corpus UberText 2.0: https://lang.org.ua/en/ubertext/
