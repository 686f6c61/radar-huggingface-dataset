# victormuryn/use-dropout-pt

## Resumen
El modelo `victormuryn/use-dropout-pt` es un encoder de frases (sentence embeddings) desarrollado por Victor Muryn como parte de la colección Ukrainian Sentence Embeddings. Se trata de un fine-tuning del modelo multilingüe `paraphrase-multilingual-mpnet-base-v2` sobre el corpus ucraniano UberText 2.0, empleando una estrategia de aumentación por dropout con objetivos de pooling (pool targets). El objetivo es mejorar la calidad de los embeddings semánticos para el ucraniano, aunque el modelo conserva la capacidad multilingüe del modelo base.

La relevancia de este modelo radica en que explora una técnica de aumentación de datos poco común (dropout aplicado durante el entrenamiento contrastivo) y la compara sistemáticamente con otras estrategias dentro de la misma colección. Con 278 millones de parámetros y una arquitectura transformer encoder basada en MPNet, ofrece una alternativa ligera y eficiente para tareas de similitud semántica, búsqueda y agrupación en entornos multilingües, con especial énfasis en ucraniano.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones, y está disponible en formato safetensors, compatible con la librería sentence-transformers y con despliegue mediante Text Embeddings Inference (TEI).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MPNet) basado en `paraphrase-multilingual-mpnet-base-v2` |
| Parametros totales | 278.043.648 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base soporta típicamente 512 tokens) |
| Tipos de cuantizacion | No disponible (formato safetensors, cuantificable con herramientas externas) |
| Idiomas soportados | Multilingüe: 50+ idiomas, incluyendo ucraniano, inglés, español, francés, alemán, árabe, chino, japonés, etc. |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se basa en MPNet (Masked and Permuted Language Modeling), una variante de transformer encoder que combina técnicas de masking y permutación para mejorar la representación contextual. La arquitectura es densa, sin mezcla de expertos, y hereda la configuración del modelo base `paraphrase-multilingual-mpnet-base-v2` (12 capas, 768 dimensiones de ocultamiento, 12 cabezas de atención). El fine-tuning se realizó con un objetivo contrastivo, utilizando el corpus ucraniano UberText 2.0.

La técnica de aumentación empleada es el dropout: durante el entrenamiento se aplica dropout estocástico a las activaciones del encoder para generar pares positivos de una misma frase, que luego se usan en el objetivo contrastivo (similar a SimCSE). Además, se utilizan "pool targets", es decir, se optimizan los embeddings de la capa de pooling (media de los tokens) como objetivo directo. Esta estrategia busca mejorar la robustez y la calidad de las representaciones semánticas sin necesidad de datos etiquetados. El dataset de entrenamiento está registrado como `victormuryn/wsd-training-dataset`, aunque la descripción del autor indica que el corpus subyacente es UberText 2.0.

## Capacidades
- Generación de embeddings de frases y oraciones para similitud semántica (cosine similarity, dot product).
- Búsqueda semántica y recuperación de información (retrieval) en corpus multilingües, con soporte para más de 50 idiomas.
- Agrupación (clustering) y clasificación de textos basada en representaciones densas.
- Extracción de características (feature extraction) para downstream tasks como clasificación de intenciones o detección de duplicados.
- Fine-tuning adicional posible sobre tareas específicas gracias a su arquitectura estándar de transformer encoder.
- Compatibilidad con el ecosistema sentence-transformers, lo que permite integración directa con herramientas como FAISS, Elasticsearch o ChromaDB.
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multi-step, ya que es exclusivamente un modelo de representación.

## Casos de uso
- Búsqueda semántica en documentación técnica: el modelo puede indexar documentos en ucraniano, inglés y otros idiomas, y recuperar los pasajes más relevantes mediante similitud coseno. Su tamaño moderado permite desplegarlo en entornos con recursos limitados.
- Sistemas de atención al cliente multilingüe: al generar embeddings de mensajes de usuarios, se pueden clasificar intenciones o emparejar con respuestas predefinidas sin necesidad de un LLM generativo, reduciendo latencia y coste.
- Deduplicación de contenido en bases de datos: permite detectar artículos, tickets o registros duplicados comparando embeddings, incluso en idiomas mezclados.
- Clustering de noticias o documentos: agrupa automáticamente textos por tema en varios idiomas, útil para monitorización de medios o análisis de tendencias.
- Recomendación de contenidos: representando artículos o productos como vectores, se puede implementar un motor de recomendación basado en similitud semántica sin etiquetas previas.
- Análisis de encuestas y feedback: los embeddings permiten agrupar respuestas abiertas en temas comunes, facilitando el análisis cualitativo en organizaciones multilingües.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas comparativas (como Spearman correlation en STS, o resultados en tareas de retrieval) para este modelo concreto dentro de la colección. La model card únicamente indica la estrategia de entrenamiento y su pertenencia a una serie experimental, sin datos numéricos de evaluación.

## Requisitos de hardware
- El modelo tiene 278 millones de parámetros, lo que en FP32 ocupa aproximadamente 1,1 GB (tamaño del repositorio). En FP16 ocuparía unos 556 MB, y en int8 unos 278 MB.
- Puede ejecutarse en CPU con memoria suficiente (al menos 4 GB de RAM para FP32), aunque la inferencia será más lenta.
- En GPU, cabe en tarjetas consumer como GTX 1060 6GB, RTX 2060 o superiores. Con cuantización int8, incluso GPUs con 2 GB de VRAM son suficientes.
- Es compatible con sentence-transformers, que soporta ejecución en CPU y CUDA. También es compatible con Text Embeddings Inference (TEI) para despliegue en producción.
- Para inferencia en lote sobre grandes corpus, se recomienda usar FAISS o similares para indexar los embeddings generados.
- La latencia por frase es del orden de milisegundos en GPU moderna (aprox. 5-15 ms) y de decenas de milisegundos en CPU, dependiendo de la longitud del texto y el hardware.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `victormuryn/use-dropout-pt` | 278M | ~512 tokens | 50+ | Apache 2.0 | Fine-tune con dropout augmentation sobre ucraniano |
| `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` | 278M | ~512 tokens | 50+ | Apache 2.0 | Modelo base, entrenado para paráfrasis y similitud |
| `intfloat/multilingual-e5-base` | 278M | 512 tokens | 100+ | MIT | Modelo de embeddings multilingüe con entrenamiento contrastivo, sin fine-tune específico para ucraniano |
| `sentence-transformers/LaBSE` | 471M | 512 tokens | 109 | Apache 2.0 | Modelo multilingüe de Google, más grande pero sin fine-tune para ucraniano |

La comparativa es cualitativa, ya que no se dispone de benchmarks públicos del modelo evaluado. `use-dropout-pt` se distingue por su fine-tuning específico en ucraniano, lo que puede mejorar el rendimiento en ese idioma frente al modelo base, aunque a costa de posibles sesgos hacia el corpus de entrenamiento.

## Limitaciones y advertencias
- El modelo está optimizado principalmente para ucraniano, por lo que su rendimiento en otros idiomas puede ser inferior al del modelo base, aunque conserva la arquitectura multilingüe.
- No se han publicado evaluaciones formales; el rendimiento real en tareas como STS o retrieval es desconocido.
- El entrenamiento se realizó con un solo corpus (UberText 2.0), lo que puede introducir sesgos temáticos y de estilo (noticias, literatura, texto informal) y afectar a dominios especializados.
- La técnica de dropout augmentation puede producir embeddings menos discriminativos en algunos casos, aunque la inclusión de pool targets intenta mitigarlo.
- No tiene capacidad de generación de texto ni de razonamiento; es exclusivamente un encoder de representaciones.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia del corpus de entrenamiento (UberText 2.0) para cumplir con sus términos de uso.
- El modelo no soporta contextos largos (máximo típico de 512 tokens), por lo que no es adecuado para documentos extensos sin truncamiento.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/victormuryn/use-dropout-pt
- Colección Ukrainian Sentence Embeddings: https://huggingface.co/collections/victormuryn/ukrainian-sentence-embeddings-use
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/victormuryn/wsd-training-dataset
- Perfil del autor: https://huggingface.co/victormuryn
- Otro modelo de la colección (ejemplo): https://huggingface.co/victormuryn/mpnet-use-combined-pt
