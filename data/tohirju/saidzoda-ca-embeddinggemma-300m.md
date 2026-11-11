# Tohirju/Saidzoda-CA-EmbeddingGemma-300M

## Resumen

Saidzoda-CA-EmbeddingGemma-300M es un modelo de embeddings de frases (sentence-transformers) desarrollado por el usuario Tohirju, obtenido mediante fine-tuning del modelo base google/embeddinggemma-300m. Su propósito es generar representaciones vectoriales densas para tareas de recuperación de información y similitud semántica, con un enfoque específico en lenguas de Asia Central: tayiko (tg), kazajo (kk), uzbeko (uz) y kirguís (ky), además de ruso (en) e inglés (en).

El modelo resuelve un problema concreto: la escasez de embeddings de calidad para lenguas túrquicas y persas de Asia Central, que suelen estar infrarrepresentadas en los corpus de entrenamiento de los modelos multilingües generalistas. Al partir de EmbeddingGemma-300M, hereda una arquitectura transformer de tipo gemma3_text con aproximadamente 303 millones de parámetros, un tamaño que permite despliegue en hardware modesto.

Es relevante ahora porque la recuperación semántica multilingüe en lenguas de Asia Central es un nicho con pocas alternativas open source, y este modelo se publica con compatibilidad con text-embeddings-inference y endpoints, lo que facilita su integración en pipelines RAG. No obstante, el repositorio tiene cero descargas y cero likes en el momento de la consulta, y el acceso está restringido (gated), lo que limita su evaluación inmediata.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (gemma3_text), modelo de embeddings de frases |
| Parámetros totales | 302.863.104 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | tg (tayiko), kk (kazajo), uz (uzbeko), ky (kirguís), ru (ruso), en (inglés) |
| Licencia | saidzoda-model-licence (licencia personalizada, marcada como "other") |
| Formato de pesos | safetensors |
| Librería | sentence-transformers |
| Modelo base | google/embeddinggemma-300m |
| Tamaño del repositorio | 1.3 GB |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Pipeline | sentence-similarity |
| Dimensión de embedding | no disponible |
| Fecha de creación | 2026-11-08 |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura gemma3_text del modelo google/embeddinggemma-300m, un transformer encoder adaptado para producir embeddings de frases. Con 302.863.104 parámetros, se sitúa en la categoría de modelos de embeddings de tamaño medio, diseñados para equilibrar calidad de representación y coste de inferencia. Al ser un fine-tuning del modelo base, conserva la estructura de capas y el tokenizador originales, y se distribuye en formato sentence-transformers con pesos safetensors.

No se dispone de información sobre el dataset de fine-tuning, el número de tokens de entrenamiento, la composición de los pares (query, documento) o si se aplicaron técnicas de contraste (por ejemplo, Multiple Negatives Ranking Loss) ni de alineación. Tampoco se documenta si hubo destilación, aumento de datos o estrategias de entrenamiento específicas para las lenguas de Asia Central. Toda esta información se considera no disponible en la documentación proporcionada.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación densa (pipeline sentence-similarity).
- Soporte multilingüe para tayiko, kazajo, uzbeko, kirguís, ruso e inglés.
- Compatibilidad con text-embeddings-inference, lo que permite servir el modelo mediante la API estándar de TEI.
- Compatibilidad con endpoints (endpoints_compatible), facilitando su despliegue en infraestructuras de inferencia gestionadas.
- Uso como encoder en pipelines RAG (retrieval-augmented generation) para indexación y búsqueda vectorial.
- Capacidad de calcular similitud entre pares de frases y ordenar por relevancia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; al ser un modelo de embeddings, estas capacidades no aplican.

## Casos de uso

- Búsqueda semántica en tayiko: indexar un corpus de documentos en tayiko y recuperar pasajes relevantes para consultas en el mismo idioma, aprovechando el fine-tuning específico frente a embeddings multilingües genéricos.
- RAG para atención al ciudadano en Asia Central: construir un sistema de preguntas y respuestas sobre normativa o servicios públicos en kazajo, uzbeko o kirguís, usando el modelo como retriever en una arquitectura RAG.
- Deduplicación y clustering de documentos multilingües: agrupar noticias o registros en ruso, kazajo y uzbeko por similitud semántica para eliminar duplicados o clasificar temáticamente.
- Búsqueda transfronteriza ruso-uzbeko: permitir consultas en ruso sobre un corpus en uzbeko (o viceversa), útil en contextos comerciales y administrativos de la región.
- Moderación y filtrado de contenido: comparar mensajes de usuarios contra una lista de referencia de textos prohibidos o sensibles en las lenguas soportadas.
- Sistemas de recomendación basados en contenido: representar ítems (artículos, productos, publicaciones) como vectores y recomendar por similitud semántica en mercados de Asia Central.
- Evaluación de calidad de traducción: usar la similitud de embeddings entre original y traducción como métrica auxiliar en pares ru-tg, ru-kk, ru-uz o ru-ky.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,6 GB solo para pesos (303 M de parámetros × 2 bytes), más overhead de activaciones y tokenizador; en la práctica, cabe en GPUs con 2 GB o más.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,3 GB para pesos; en 4 bits, aproximadamente 0,15 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090; también funciona en CPU para volúmenes moderados.
- Cabe holgadamente en GPU consumer (incluso en GPUs integradas con suficiente memoria compartida para lotes pequeños).
- Opciones de despliegue: text-embeddings-inference (soporte declarado), sentence-transformers, y potencialmente llama.cpp u Ollama si se generan pesos GGUF (no confirmado).
- Latencia y throughput: no disponibles; al tratarse de un modelo de 300 M de parámetros, se espera un throughput alto en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| Saidzoda-CA-EmbeddingGemma-300M | 302,9 M | no disponible | tg, kk, uz, ky, ru, en | saidzoda-model-licence | Restringido (gated) |
| google/embeddinggemma-300m | ~300 M | no disponible | multilingüe (amplio) | Gemma license | Abierto con condiciones |
| intfloat/multilingual-e5-base | ~278 M | 512 tokens | multilingüe (incluye ru, pero no tg/kk/uz/ky de forma específica) | MIT | Abierto |
| BAAI/bge-m3 | ~568 M | 8192 tokens | multilingüe (más de 100 idiomas) | MIT | Abierto |

La comparativa se basa en características generales de modelos de embeddings de tamaño similar; no se dispone de resultados de benchmarks del modelo Saidzoda que permitan una comparación cuantitativa de rendimiento. La ventaja diferencial del modelo es su especialización declarada en lenguas de Asia Central, frente a alternativas multilingües más generalistas.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar el modelo, lo que puede retrasar su evaluación.
- Licencia personalizada (saidzoda-model-licence): no es una licencia estándar OSI; es imprescindible revisar los términos antes de cualquier uso comercial, ya que pueden existir restricciones no evidentes.
- Sin métricas publicadas: no hay benchmarks que respalden la calidad del fine-tuning en las lenguas objetivo; el rendimiento real es desconocido.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni validación externa.
- Riesgo de alucinación y sesgos: como todo modelo de embeddings, puede producir similitudes engañosas en dominios no representados en el entrenamiento; los sesgos de los datos del modelo base (EmbeddingGemma) pueden persistir.
- Cobertura idiomática limitada: aunque declara seis idiomas, no se especifica el volumen ni la calidad de los datos por idioma; el tayiko y el kirguís son lenguas de bajos recursos y podrían tener un rendimiento inferior.
- Contexto no documentado: se desconoce la longitud máxima de secuencia soportada, lo que afecta al diseño de pipelines de chunking.
- Sin garantías de producción: al ser un modelo de un autor individual sin documentación técnica detallada, se recomienda validación exhaustiva antes de desplegarlo en entornos críticos.

## Enlaces

- Hugging Face: https://huggingface.co/Tohirju/Saidzoda-CA-EmbeddingGemma-300M
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Documentación de sentence-transformers: https://www.sbert.net/
- Documentación de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
