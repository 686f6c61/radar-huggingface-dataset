# zankich/Qwen3-Reranker-0.6B-W8A16

## Resumen

Qwen3-Reranker-0.6B-W8A16 es una variante cuantizada del modelo de reranking de Alibaba Qwen, publicada por el usuario zankich. El modelo original, Qwen3-Reranker-0.6B, es un cross-encoder denso diseñado para puntuar la relevancia de un par consulta-documento, con una ventana de contexto de 32.000 tokens y soporte para más de 100 idiomas. La versión W8A16 aplica cuantización de pesos en INT8 y activaciones en 16 bits, reduciendo el tamaño del repositorio a 0,8 GB sin alterar la arquitectura ni las capacidades del modelo base.

Este modelo se integra en pipelines de recuperación de información, especialmente en sistemas de búsqueda semántica y RAG, donde actúa como una segunda etapa de filtrado: recibe los resultados iniciales (por ejemplo, de un sistema de embeddings o BM25) y los reordena según su relevancia real para la consulta. La cuantización permite ejecutarlo en GPUs con poca memoria y sirve mediante herramientas como vLLM o Sentence Transformers, manteniendo una licencia Apache 2.0 y compatibilidad con compressed-tensors.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (cross-encoder) basado en Qwen3 |
| Parámetros totales | 595.776.568 (0,6B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.000 tokens (32K) |
| Tipos de cuantización | W8A16 (pesos INT8, activaciones 16 bits) |
| Idiomas soportados | Más de 100 idiomas según la model card del modelo base; la metadata de HuggingFace no especifica idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (pesos cuantizados INT8, tagged como compressed-tensors) |
| Pipeline | feature-extraction |
| Tamaño del repo | 0,8 GB |
| Modelo base | Qwen/Qwen3-Reranker-0.6B |

## Arquitectura y entrenamiento

El modelo es un cross-encoder denso que toma un par consulta-documento y devuelve un logit de relevancia. A diferencia de los bi-encoders, evalúa la interacción entre ambos textos en la misma pasada, lo que permite capturar dependencias semánticas más finas. La model card indica que usa un prompt por defecto para búsqueda web y admite instrucciones personalizadas, lo que permite adaptar el comportamiento a tareas, idiomas o escenarios concretos. Se recomienda escribir las instrucciones en inglés, ya que la mayoría de las instrucciones de entrenamiento estaban en ese idioma. El modelo base soporta más de 100 idiomas y una ventana de contexto de 32K.

La variante W8A16 mantiene la arquitectura de 28 capas y los 595 millones de parámetros originales, pero almacena los pesos en INT8 y las activaciones en 16 bits. En los metadatos se indica compatibilidad con compressed-tensors y vLLM. No se proporcionan detalles sobre el conjunto de datos de calibración ni el método exacto de cuantización, por lo que el impacto en la precisión no puede evaluarse a partir de esta documentación.

## Capacidades

- Reranking de pares consulta-documento: puntúa la relevancia con logits (valores positivos y negativos). Se puede aplicar una función sigmoide para obtener probabilidades entre 0 y 1.
- Soporte de instrucciones personalizadas: se puede pasar una instrucción específica vía el parámetro `prompts` en Sentence Transformers para mejorar el rendimiento por tarea, idioma o escenario.
- Multilingüe: soporta más de 100 idiomas, incluyendo lenguajes de programación, gracias al modelo base Qwen3.
- Contexto largo: procesa pares de hasta 32.000 tokens, adecuado para documentos extensos o fragmentos largos.
- No es un modelo generativo: no produce texto, ni soporta tool calling ni razonamiento en cadena.
- Compatible con Sentence Transformers (CrossEncoder), Transformers, Text Embeddings Inference y vLLM.

## Casos de uso

- Mejora de sistemas de búsqueda empresarial: el modelo reordena los resultados devueltos por una API de búsqueda (como Elasticsearch o un índice de embeddings) antes de mostrarlos al usuario. Su contexto de 32K permite procesar fragmentos largos y el uso de instrucciones personalizadas facilita adaptarlo a dominios específicos.
- Etapa de reranking en pipelines RAG: se coloca después de la recuperación inicial para filtrar y ordenar los pasajes que se inyectarán en un modelo generativo. El cross-encoder reduce la probabilidad de que contextos irrelevantes degraden la respuesta, y la cuantización W8A16 permite ejecutar esta etapa en la misma GPU que el LLM sin un impacto elevado en memoria.
- Filtrado de preguntas frecuentes en atención al cliente: recibe cada consulta del usuario junto con los artículos de la base de conocimiento y devuelve una puntuación de relevancia. Así se muestran únicamente los artículos con mayor probabilidad de resolver el problema, y el soporte multilingüe permite atender a usuarios de distintos idiomas.
- Búsqueda de código en repositorios: a partir de una consulta en lenguaje natural, el sistema recupera snippets o archivos del repositorio y los reordena para presentar las coincidencias más relevantes. La documentación del modelo base indica que la capacidad multilingüe incluye lenguajes de programación.
- Búsqueda académica y científica: para una consulta sobre un tema concreto, el modelo puntúa la relevancia de resúmenes y secciones de artículos largos, incluso con ventanas de 32K, facilitando la selección de documentos para revisiones sistemáticas o meta-análisis.
- Selección de respuestas en asistentes virtuales: el modelo puede comparar una pregunta con diferentes respuestas candidatas (por ejemplo, generadas por varios LLM) y elegir la más pertinente, usando activación sigmoide para obtener una puntuación probabilística. Esta capacidad se integra en sistemas de evaluación automática de respuestas.
- Búsqueda de documentos legales: reordenar contratos o cláusulas relevantes en un corpus de documentos legales, con instrucciones personalizadas para el dominio jurídico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del modelo base menciona que la variante de 8B de embeddings ocupa el primer puesto en el leaderboard de MTEB (score 70.58, a fecha de junio de 2025), pero no incluye resultados específicos para el reranker de 0.6B ni para esta variante cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en INT8 ocupan aproximadamente 0,6 GB (595 millones de parámetros × 1 byte). Sumando activaciones y overhead del runtime, se estima un consumo de entre 1,5 y 3 GB de VRAM para la inferencia de un solo par. No hay mediciones oficiales en la documentación.
- GPU recomendadas: una RTX 3060 de 12 GB o superior es suficiente; también puede ejecutarse en GPUs con 6 GB como la RTX 2060, o en GPUs de centros de datos como T4, A10 o A100.
- Opciones de despliegue: vLLM (según los tags de HuggingFace), Sentence Transformers (CrossEncoder), Transformers y Text Embeddings Inference (TEI). El repositorio indica compatibilidad con endpoints.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Reranker-0.6B-W8A16 (este modelo) | 0,6B | 32K | W8A16 | Apache 2.0 | HuggingFace |
| Qwen3-Reranker-0.6B (base) | 0,6B | 32K | Original (sin cuantizar) | Apache 2.0 | HuggingFace |
| Qwen3-Reranker-4B | 4B | 32K | Original (sin cuantizar) | Apache 2.0 | HuggingFace |
| Qwen3-Reranker-8B | 8B | 32K | Original (sin cuantizar) | Apache 2.0 | HuggingFace |

La comparativa directa de rendimiento con otros rerankers de tamaño similar (por ejemplo, BAAI/bge-reranker-v2-m3) no está disponible en la información suministrada; solo se conocen los datos de la familia Qwen3.

## Limitaciones y advertencias

- No es un modelo generativo: solo se puede usar para puntuar pares; no genera texto ni respuestas.
- El repositorio no incluye resultados de evaluación de la variante cuantizada; la degradación por cuantización es desconocida y podría existir.
- No se dispone de información sobre el método de cuantización ni el conjunto de calibración empleado en W8A16, lo que dificulta predecir el comportamiento fuera de los casos de uso estándar.
- Las puntuaciones por defecto son logits no probabilísticos; hay que aplicar sigmoide si se desea interpretar la salida como probabilidad.
- Los idiomas indicados en la metadata de HuggingFace aparecen como no disponibles, mientras que la model card habla de más de 100 idiomas; esta inconsistencia conviene verificar antes de usar en producción.
- El modelo hereda cualquier sesgo presente en la familia Qwen3; no se han documentado mitigaciones específicas.
- El uso de instrucciones en inglés se recomienda; en otros idiomas el rendimiento puede ser menor.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/zankich/Qwen3-Reranker-0.6B-W8A16
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Blog oficial de Qwen3 Embedding: https://qwenlm.github.io/blog/qwen3-embedding/
- Repositorio GitHub de Qwen3-Embedding: https://github.com/QwenLM/Qwen3-Embedding
- Paper en arXiv: https://arxiv.org/abs/2506.05176
- README espejo en GitHub (fusion-memory): https://github.com/genuineknowledge/fusion-memory/blob/main/models/Qwen3-Reranker-0.6B/README.md
