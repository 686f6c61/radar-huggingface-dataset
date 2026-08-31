# victormuryn/use-generated-no-pt

## Resumen

`victormuryn/use-generated-no-pt` es un modelo de embeddings de frases (sentence embeddings) desarrollado por Victor Muryn como parte de la colección de embeddings ucranianos del autor. Se trata de un fine-tuning del modelo multilingüe `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` sobre el corpus ucraniano UberText 2.0, utilizando una estrategia de aumentación generada (generated augmentation) y sin objetivos de pooling (pool targets). El objetivo es mejorar la calidad de las representaciones semánticas para el ucraniano, explorando el efecto de distintas técnicas de entrenamiento contrastivo.

El modelo tiene 278 millones de parámetros, está publicado en formato safetensors y se distribuye bajo licencia Apache 2.0. Está diseñado específicamente para tareas de similitud semántica y extracción de características (feature extraction), y es compatible con la librería `sentence-transformers` y con la inferencia de embeddings mediante Text Embeddings Inference (TEI). Aunque el entrenamiento se centra en ucraniano, hereda las capacidades multilingües del modelo base, que soporta más de 50 idiomas.

Este modelo es relevante para desarrolladores que trabajen con procesamiento de lenguaje natural en ucraniano y necesiten representaciones vectoriales de alta calidad para búsqueda semántica, clustering o sistemas de recomendación. Su publicación dentro de una serie controlada de variantes permite comparar el impacto de diferentes estrategias de aumentación y supervisión en la calidad de los embeddings.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNet (transformer encoder) con pooling mean |
| Parametros totales | 278.043.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 512 tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32) |
| Idiomas soportados | multilingüe: ar, bg, ca, cs, da, de, el, en, es, et, fa, fi, fr, gl, gu, he, hi, hr, hu, hy, id, it, ja, ka, ko, ku, lt, lv, mk, mn, mr, ms, my, nb, nl, pl, pt, ro, sk, sl, sq, sr, sv, th, tr, uk, ur, vi (además fr-ca, pt-br, zh-cn, zh-tw) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `paraphrase-multilingual-mpnet-base-v2`, un transformer encoder de tipo MPNet que fue preentrenado con un objetivo de predicción de tokens enmascarados y permutados sobre corpus multilingües. MPNet combina ideas de BERT y XLNet, logrando una representación contextual más robusta que BERT puro. Sobre esta base, el autor realizó un fine-tuning con un objetivo contrastivo, entrenando el modelo para que las representaciones de frases semánticamente relacionadas queden cerca en el espacio vectorial y las no relacionadas queden lejos.

El corpus de entrenamiento es UberText 2.0, un conjunto de textos ucranianos de gran escala. La aumentación generada consiste en crear ejemplos adicionales mediante un modelo generativo (no se especifica cuál) para enriquecer el conjunto de datos y mejorar la robustez del modelo. En esta variante concreta no se utilizan pool targets, es decir, no se añade una señal de supervisión adicional sobre la agrupación de frases dentro de un mismo lote. El entrenamiento se realizó con la librería `sentence-transformers` y no se han publicado detalles sobre hiperparámetros, número de pasos o configuración exacta del optimizador.

## Capacidades

- Generación de embeddings de frases de alta calidad para ucraniano, con soporte multilingüe heredado del modelo base.
- Similitud semántica entre frases y documentos cortos, útil para búsqueda por similitud, deduplicación y clustering.
- Extracción de características (feature extraction) para alimentar clasificadores o modelos de aprendizaje automático posteriores.
- Compatible con el ecosistema `sentence-transformers`, lo que permite integración directa con herramientas como FAISS, Elasticsearch o bases de datos vectoriales.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.
- No soporta tool calling ni razonamiento multi-paso; su función es exclusivamente representacional.

## Casos de uso

- Búsqueda semántica en ucraniano: indexar documentos o preguntas frecuentes y recuperar los más relevantes mediante similitud coseno entre embeddings.
- Deduplicación de contenidos: comparar embeddings de artículos o noticias para detectar duplicados o versiones similares.
- Sistemas de recomendación: representar ítems o usuarios como vectores y calcular similitudes para sugerir contenidos relacionados.
- Análisis de sentimiento y clasificación de textos: usar los embeddings como características de entrada para un clasificador entrenado sobre datos etiquetados.
- Agrupación de documentos (clustering): agrupar por temas o tópicos mediante algoritmos como K-means sobre los vectores generados.
- Recuperación de información multilingüe: al ser multilingüe, puede usarse para buscar en ucraniano y en otros idiomas dentro de un mismo corpus, aunque su rendimiento fuera del ucraniano no está garantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o similares, ya que se trata de un modelo de embeddings, no de un modelo de lenguaje generativo. Tampoco se ofrecen comparativas cuantitativas con otros modelos de embeddings en tareas como STS o retrieval.

## Requisitos de hardware

- El modelo tiene 278 millones de parámetros, lo que en fp32 ocupa aproximadamente 1,1 GB en memoria.
- Para inferencia en GPU, una tarjeta con al menos 2 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1050 Ti o superior). En cuantización de 8 bits cabría en menos de 1 GB, aunque no se proporcionan pesos cuantizados.
- Puede ejecutarse en CPU sin problemas, aunque la latencia será mayor. Para uso en producción con alto throughput, se recomienda una GPU moderna (RTX 3060 o superior) o un servicio gestionado.
- Es compatible con `sentence-transformers` para uso local, y con Text Embeddings Inference (TEI) para despliegue optimizado en servidores.
- No se dispone de datos sobre latencia o throughput estimados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| `victormuryn/use-generated-no-pt` | 278M | no disponible | Fine-tuning contrastivo sobre UberText 2.0 con aumentación generada | Apache 2.0 |
| `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` | 278M | 512 tokens | Preentrenamiento multilingüe + fine-tuning en pares parafraseados | Apache 2.0 |
| `victormuryn/use-natural-no-pt` | 278M | no disponible | Fine-tuning sobre UberText 2.0 sin aumentación ni pool targets | Apache 2.0 |
| `victormuryn/use-translation-no-pt` | 278M | no disponible | Fine-tuning con aumentación por back-translation | Apache 2.0 |

La comparativa se limita a modelos de la misma colección y al modelo base, ya que no se dispone de información sobre otros modelos de embeddings ucranianos comparables. El interés de esta variante radica en la comparación metodológica dentro de la colección, más que en una superioridad absoluta.

## Limitaciones y advertencias

- El modelo está optimizado para ucraniano; su rendimiento en otros idiomas puede ser inferior al de modelos específicos de esos idiomas.
- La aumentación generada puede introducir ruido o frases poco naturales, lo que podría afectar a la calidad de los embeddings en ciertos dominios.
- No se han publicado evaluaciones exhaustivas ni benchmarks, por lo que el rendimiento real en tareas concretas debe validarse antes de su uso en producción.
- Al ser un modelo encoder, no puede generar texto ni responder preguntas de forma autónoma; solo produce vectores.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del corpus UberText 2.0, ya que su licencia original puede tener restricciones adicionales.
- No se proporcionan pesos cuantizados ni versiones optimizadas para despliegue ligero; el usuario debe gestionar la cuantización si la necesita.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/victormuryn/use-generated-no-pt
- Colección de embeddings ucranianos: https://huggingface.co/collections/victormuryn/ukrainian-sentence-embeddings-use
- Dataset de entrenamiento: https://huggingface.co/datasets/victormuryn/wsd-training-dataset
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Corpus UberText 2.0: https://lang.org.ua/en/ubertext/
