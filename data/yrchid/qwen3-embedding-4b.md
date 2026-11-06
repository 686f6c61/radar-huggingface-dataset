# yrchid/Qwen3-Embedding-4B

## Resumen

Qwen3-Embedding-4B es un modelo de embeddings de texto de la familia Qwen3, desarrollado originalmente por el equipo de Qwen (Alibaba). Esta ficha corresponde a la reproducción publicada por el usuario `yrchid` en Hugging Face, un fine-tune del modelo base `Qwen/Qwen3-4B-Base` orientado a tareas de recuperación, clasificación, clustering y minería de bitextos. Con 4.021.774.336 parámetros, 36 capas y una longitud de contexto de 32.000 tokens, se posiciona en el rango medio de la serie, que abarca versiones de 0,6B, 4B y 8B tanto para embedding como para reranking.

El modelo resuelve el problema de generar representaciones vectoriales densas de alta calidad para búsqueda semántica y sistemas RAG. Su principal atractivo técnico es la combinación de contexto largo (32k tokens), soporte de Matryoshka Representation Learning (MRL) con dimensiones de salida configurables entre 32 y 2.560, y capacidad *instruction-aware*, que permite adaptar el comportamiento del modelo mediante instrucciones específicas por tarea. Según la model card, la variante de 8B de la serie alcanzó el primer puesto en el leaderboard MTEB multilingüe (puntuación 70,58 a fecha de 5 de junio de 2025).

Es relevante ahora porque cubre más de 100 idiomas, incluidos lenguajes de programación, y se distribuye con licencia Apache 2.0, lo que facilita su adopción comercial. No obstante, esta publicación concreta es un mirror de terceros con solo 30 descargas y sin métricas de validación propias publicadas, por lo que conviene contrastarla con el repositorio oficial `Qwen/Qwen3-Embedding-4B`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Base), 36 capas |
| Parametros totales | 4.021.774.336 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas en este repo) |
| Idiomas soportados | 100+ idiomas, incluidos lenguajes de programación |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | Hasta 2.560, configurable entre 32 y 2.560 (MRL) |
| Soporte MRL | Si |
| Instruction-aware | Si |
| Libreria | sentence-transformers |
| Tamano del repo | 8,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer denso derivado de `Qwen/Qwen3-4B-Base`, con 36 capas y 4B de parámetros. Se ha adaptado para producir embeddings de texto en lugar de generación autorregresiva, empleando la técnica de pooling sobre la representación del último token (patrón habitual en la familia Qwen3-Embedding). La dimensión nativa de salida es 2.560, pero gracias a MRL puede truncarse a cualquier tamaño entre 32 y 2.560 sin reentrenar, lo que permite ajustar el coste de almacenamiento y la latencia de búsqueda vectorial.

La model card indica que la serie hereda las capacidades multilingües y de comprensión de texto largo del modelo fundacional. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO específicas para la tarea de embedding. Sí se menciona que el modelo es *instruction-aware*: acepta instrucciones definidas por el usuario por tarea, y la evaluación del autor indica mejoras de entre un 1 % y un 5 % al usar instrucciones, recomendando redactarlas en inglés dado que la mayoría de las empleadas en entrenamiento estaban en ese idioma.

## Capacidades

- Generación de embeddings de texto densos para similitud semántica y recuperación de información.
- Recuperación multilingüe y cross-lingual en más de 100 idiomas.
- Recuperación de código (code retrieval) gracias al soporte de lenguajes de programación.
- Clasificación de texto y clustering semántico a partir de representaciones vectoriales.
- Minería de bitextos (bitext mining) para alineación de corpus paralelos.
- Dimensiones de salida flexibles (32 a 2.560) mediante MRL.
- Soporte de instrucciones por tarea para mejorar el rendimiento en dominios específicos.
- Compatible con `text-embeddings-inference` y con la API de `sentence-transformers`.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso por sí mismo.

## Casos de uso

- Búsqueda semántica en bases documentales: indexar documentos de hasta 32k tokens con embeddings de 2.560 dimensiones y recuperar por similitud coseno; el contexto largo evita trocear agresivamente contratos o informes.
- Sistemas RAG (Retrieval-Augmented Generation): usar el modelo como recuperador denso en pipelines que alimentan a un LLM generativo, combinándolo con `Qwen3-Reranker-4B` para una segunda fase de reordenación.
- Búsqueda de código en repositorios internos: el soporte de lenguajes de programación permite indexar funciones y fragmentos de código y recuperarlos por descripción en lenguaje natural.
- Deduplicación y clustering de noticias o tickets de soporte: agrupar documentos semánticamente similares reduciendo la dimensión a 256 o 512 para abaratar el clustering a gran escala.
- Moderación y clasificación de contenido: entrenar un clasificador ligero sobre los embeddings para etiquetar textos por temática o toxicidad.
- Alineación de corpus multilingües: minería de bitextos para construir datasets de traducción a partir de colecciones monolingües en distintos idiomas.
- Búsqueda cross-lingual en catálogos de e-commerce: consultas en castellano recuperando fichas de producto en otros idiomas sin traducción intermedia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta reproducción (`yrchid/Qwen3-Embedding-4B`) en la información disponible. La model card cita únicamente el resultado de la variante 8B de la serie oficial (puntuación 70,58 en MTEB multilingüe, primer puesto a 5 de junio de 2025), que no es directamente extrapolable a este checkpoint de 4B ni a este mirror de terceros.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 8-9 GB solo para pesos, más overhead de activaciones; se recomienda reservar 12-16 GB para lotes moderados con contexto largo.
- VRAM estimada en FP32: en torno a 16 GB solo para pesos.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4-5 GB; en 4 bits, 2,5-3 GB (requiere cuantización propia, no publicada en el repo).
- GPU recomendadas: A100 40/80 GB o H100 para indexación a gran escala con contexto de 32k; L40S o A10G para servicio en producción; RTX 4090 (24 GB) para desarrollo y lotes pequeños.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en FP16 con lotes reducidos, y en GPUs de 8-12 GB si se cuantiza.
- Opciones de despliegue: `sentence-transformers`, `text-embeddings-inference` (TEI), vLLM con soporte de embedding, y servidores compatibles con la API de Hugging Face Endpoints.
- Latencia y throughput: no disponibles en la información proporcionada; dependen fuertemente del hardware, la longitud de secuencia y el tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-Embedding-4B (esta ficha) | 4B | 32k | Hasta 2.560 (MRL) | Apache 2.0 | Mirror de terceros, sin benchmarks propios publicados |
| Qwen3-Embedding-0.6B | 0,6B | 32k | 1.024 (MRL) | Apache 2.0 | Mucho más ligero, menor calidad esperada |
| Qwen3-Embedding-8B | 8B | 32k | 4.096 (MRL) | Apache 2.0 | Primer puesto MTEB multilingüe (70,58) según model card |
| Qwen3-Reranker-4B | 4B | 32k | no aplica | Apache 2.0 | Modelo de reranking, complementario, no sustituto |

No se dispone en la información proporcionada de comparativas con modelos de otros fabricantes (por ejemplo, E5, BGE o GTE) ni de puntuaciones MTEB de esta variante concreta.

## Limitaciones y advertencias

- Esta publicación es un mirror de terceros (`yrchid`) con 30 descargas y sin validación independiente publicada; para producción conviene usar el repositorio oficial `Qwen/Qwen3-Embedding-4B`.
- No es un modelo generativo: no debe usarse para chat, tool calling ni razonamiento; su salida son vectores.
- Riesgo de sesgos heredados del corpus de entrenamiento de Qwen3, no cuantificados en la información disponible.
- El rendimiento puede degradarse en dominios muy especializados sin instrucciones adaptadas; la model card recomienda instrucciones en inglés.
- La ventana de 32k tokens incrementa el coste computacional de forma cuadrática en atención; indexar documentos largos requiere planificación de recursos.
- Aunque la licencia es Apache 2.0, conviene verificar los términos del modelo base y del repositorio oficial antes de un despliegue comercial.
- No se han publicado métricas de latencia, throughput ni evaluaciones MTEB para este checkpoint concreto.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/yrchid/Qwen3-Embedding-4B
- Modelo oficial: https://huggingface.co/Qwen/Qwen3-Embedding-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Blog de la serie: https://qwenlm.github.io/blog/qwen3-embedding/
- Repositorio GitHub: https://github.com/QwenLM/Qwen3-Embedding
- Paper de referencia: https://arxiv.org/abs/2506.05176
- Reranker complementario: https://huggingface.co/Qwen/Qwen3-Reranker-4B
