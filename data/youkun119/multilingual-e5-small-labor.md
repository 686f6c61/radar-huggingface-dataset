# youkun119/multilingual-e5-small-labor

## Resumen

`youkun119/multilingual-e5-small-labor` es un modelo de embeddings de frases (sentence-transformers) especializado en la recuperación de artículos legales de normativa laboral coreana. Lo desarrolla el usuario de HuggingFace `youkun119` mediante fine-tuning del modelo base `intfloat/multilingual-e5-small`, un transformer BERT de arquitectura densa con 117.653.760 parámetros totales. Su propósito es resolver la tarea de *information retrieval* sobre un corpus de preguntas de trabajadores y pasajes de artículos legales (por ejemplo, el artículo 73 sobre el permiso menstrual o el artículo 49 sobre la prescripción de salarios).

El modelo se entrenó con el dataset `youkun119/labor-embedding-data` (663 ejemplos) usando la función de pérdida `MultipleNegativesRankingLoss`, un enfoque de aprendizaje contrastivo habitual para pares consulta-respuesta. Emite embeddings densos de 384 dimensiones, acepta hasta 512 tokens por entrada (incluyendo tokens especiales y prefijos) y sigue el esquema de prefijos de la familia E5: `query:` para las consultas y `passage:` para los documentos.

Es relevante para desarrolladores que construyen sistemas de búsqueda semántica (RAG) en el dominio laboral y necesitan una mejora de precisión frente al modelo E5 multilingual genérico, con un coste computacional mínimo al tratarse de un modelo de 117M de parámetros (0,5 GB de repositorio). La licencia MIT permite uso comercial sin restricciones. No obstante, el alcance declarado por el autor es deliberadamente limitado al dominio laboral en coreano y no está verificado de forma independiente en el model-index (`verified: false`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer BERT denso (encoder), fine-tuning de intfloat/multilingual-e5-small |
| Parámetros totales | 117.653.760 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens por entrada (incluyendo tokens especiales y prefijo) |
| Tipos de cuantización | No especificados en la model card; compatible con cuantización estándar de sentence-transformers (fp16, int8) no documentada por el autor |
| Idiomas soportados | Coreano (ko); el modelo base E5 multilingual cubre otros idiomas, pero el fine-tuning es específico de coreano |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,5 GB) |
| Dimensión del embedding | 384 |
| Función de pérdida de entrenamiento | MultipleNegativesRankingLoss |
| Dataset de entrenamiento | youkun119/labor-embedding-data (663 ejemplos) |
| Prefijos requeridos | `query:` para consultas, `passage:` para documentos |
| Normalización | `normalize_embeddings=True` recomendado por el autor |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (no adaptadores LoRA ni cabezas adicionales) de `intfloat/multilingual-e5-small`, un encoder transformer de tipo BERT con 117,6 millones de parámetros que produce representaciones densas de 384 dimensiones. La arquitectura mantiene el esquema de prefijos de la familia E5: cada texto debe prefijarse con `query:` o `passage:` según su rol en la búsqueda, y las entradas se truncan a 512 tokens incluyendo dichos prefijos.

El ajuste se realizó sobre el dataset `youkun119/labor-embedding-data`, compuesto por 663 pares de consulta (preguntas de trabajadores en lenguaje natural) y pasaje (artículos legales coreanos), con la función `MultipleNegativesRankingLoss`. Este loss contrastivo usa los pasajes positivos emparejados frente a los negativos del resto del batch, y es el estándar para fine-tuning de embeddings de recuperación. El autor indica explícitamente que el corpus general de evaluación (`general-evaluation/general-corpus`) del mismo repositorio de datos se usó solo para comprobar la posible regresión en otros dominios y no participó en el entrenamiento. No se documentan datos sobre número de tokens totales, tokens de entrenamiento, uso de DPO/RLHF ni innovaciones arquitectónicas adicionales (decodificación especulativa, atención lineal, etc.), al tratarse de un encoder de recuperación y no de un modelo generativo.

## Capacidades

- Generación de embeddings de frases normalizados de 384 dimensiones para similitud semántica.
- Recuperación de información (*information retrieval*) sobre artículos legales laborales en coreano.
- `feature-extraction` a nivel de frase y de token (el pipeline declarado es `sentence-similarity` y `feature-extraction`).
- Matching consulta-pasaje mediante similitud de coseno, con soporte de prefijos `query:` y `passage:`.
- Compatible con `text-embeddings-inference` (tag `text-embeddings-inference`) y con `endpoints_compatible`, lo que facilita despliegue como endpoint de embeddings.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de embeddings, no un LLM generativo.
- Capacidad multilingüe heredada del modelo base, aunque el fine-tuning está orientado al coreano.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Búsqueda semántica de normativa laboral: el modelo indexa artículos legales como embeddings `passage:` y recupera los más relevantes ante una consulta ciudadana en lenguaje natural. Es adecuado porque fue entrenado específicamente sobre pares pregunta-artículo del mismo dominio.
- Generación aumentada por recuperación (RAG) en un asistente legal laboral: el modelo actúa como *retriever* que alimenta los pasajes recuperados a un LLM generativo, reduciendo alucinaciones al anclar la respuesta en el texto legal. Sus 512 tokens de contexto son suficientes para pasajes de artículos.
- Sistema de preguntas frecuentes (FAQ) de un portal de empleo o sindicato: se calcula la similitud entre la pregunta del usuario y una base de preguntas-respuesta preindexadas; con un Accuracy@1 de 0,659 y Recall@5 de 0,902, es usable para sugerencias top-5.
- Clasificación y deduplicación de consultas de trabajadores: agrupando embeddings por similitud se detectan consultas recurrentes sobre temas como permiso menstrual, horas extra o prescripción salarial, lo que permite priorizar la atención.
- Motor de búsqueda interna en una asesoría laboral: indexación de expedientes, resoluciones y artículos para que los asesores localicen normativa relevante con una API de embeddings ligera (117M de parámetros, cabe en CPU).
- Monitorización de regresión en otros dominios: el propio autor reserva un corpus general para comprobar que el fine-tuning no degrada la recuperación fuera del dominio laboral; útil en pipelines de evaluación continua de modelos de embeddings.
- Indexación con Text Embeddings Inference: al ser compatible con TEI, se puede desplegar un servicio de embeddings en producción con licencia MIT y sin coste de licencia, apto para volúmenes moderados.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, evaluados sobre el dataset `labor` (no verificados de forma independiente, `verified: false`):

| Métrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,6589 |
| Cosine Accuracy@3 | 0,8551 |
| Cosine Accuracy@5 | 0,9019 |
| Cosine Accuracy@10 | 0,9393 |
| Cosine Precision@1 | 0,6589 |
| Cosine Precision@5 | 0,1804 |
| Cosine Recall@1 | 0,6589 |
| Cosine Recall@5 | 0,9019 |
| Cosine NDCG@10 | 0,8047 |
| Cosine MRR@10 | 0,7607 |
| Cosine MAP@100 | 0,7625 |

No se han publicado en la información disponible resultados comparativos frente al modelo base E5 ni frente a otros modelos de embeddings (MMLU, HumanEval, GSM8K u otros), ya que al tratarse de un modelo de recuperación esas métricas no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,5 GB de pesos (117,6M parámetros × 4 bytes); en fp16, en torno a 0,24 GB. Sumando activaciones y overhead de runtime, menos de 2 GB en la práctica.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; adecuado para RTX 3060, RTX 4090, A10, T4, L4, A100 y H100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas gráficas modernas e incluso en GPU integradas.
- Despliegue: `sentence-transformers` (carga completa con `SentenceTransformer("youkun119/multilingual-e5-small-labor")`), Text Embeddings Inference (TEI), y potencialmente `llama.cpp`/`Ollama` no aplican de forma nativa para BERT de embeddings, aunque es exportable a ONNX. No se recomienda vLLM para modelos de embeddings de esta clase.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño (117M de parámetros) se espera un throughput alto, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión embedding | Licencia | Dominio | Disponibilidad |
|---|---|---|---|---|---|---|
| youkun119/multilingual-e5-small-labor | 117,6M | 512 tokens | 384 | MIT | Laboral coreano (fine-tuned) | HuggingFace, 0 descargas |
| intfloat/multilingual-e5-small (base) | 117,6M | 512 tokens | 384 | MIT | Multilingüe general | HuggingFace, ampliamente usado |
| intfloat/multilingual-e5-base | ~278M | 512 tokens | 768 | MIT | Multilingüe general | HuggingFace, ampliamente usado |
| BAAI/bge-m3 | ~568M | 8192 tokens | 1024 (multivector) | MIT | Multilingüe general, recuperación híbrida | HuggingFace, ampliamente usado |

El modelo no publica comparativas frente a estos alternativos. Frente al E5 multilingual base, la mejora esperada se limita al dominio laboral coreano, pero no se han publicado mediciones de esa ganancia ni del posible retroceso en otros dominios en la información disponible. Alternativas más grandes (E5-base, BGE-M3) ofrecen más dimensiones y contexto a cambio de mayor coste y menor ligereza.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de E5 multilingual, puede heredar sesgos lingüísticos y culturales de su corpus de preentrenamiento.
- Riesgo de alucinación: no genera texto, por lo que no alucina en sentido estricto, pero el autor advierte explícitamente que una alta similitud no garantiza que el documento recuperado sea la respuesta legal correcta.
- Limitación de contexto: 512 tokens por entrada, incluyendo tokens especiales y prefijos `query:`/`passage:`; los artículos más largos se truncan.
- Limitación de idioma: el fine-tuning está orientado al coreano; el rendimiento en otros idiomas no ha sido evaluado por el autor y debe medirse antes de su uso.
- Restricciones de licencia: licencia MIT, sin restricción para uso comercial. No obstante, el autor aclara que no es un modelo de asesoramiento legal y no debe usarse como sustituto de un profesional.
- Caveat de producción: los resultados del model-index no están verificados de forma independiente; el dataset de evaluación es un benchmark propio de 663 ejemplos y las métricas pueden no generalizar a nuevas consultas o a otras fuentes normativas.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia comunitaria de robustez en producción.
- Requiere el prefijo correcto (`query:`/`passage:`) y `normalize_embeddings=True`; omitirlos degrada la calidad de la recuperación según instrucciones del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/youkun119/multilingual-e5-small-labor
- Dataset de entrenamiento: https://huggingface.co/datasets/youkun119/labor-embedding-data
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Dataset asociado en la model card: `general-evaluation/general-corpus` (dentro de youkun119/labor-embedding-data)
- Repositorio de pesos: https://huggingface.co/youkun119/multilingual-e5-small-labor/tree/main
- Documentación de Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- Documentación de SentenceTransformers: https://sbert.net/
