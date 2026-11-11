# Tohirju/Saidzoda-Tajik-EmbeddingGemma-300M

## Resumen

Saidzoda-Tajik-EmbeddingGemma-300M es un modelo de embeddings de frases (sentence embeddings) desarrollado por el usuario Tohirju, obtenido mediante fine-tuning del modelo google/embeddinggemma-300m. Su propósito es generar representaciones vectoriales densas para tareas de recuperación de información (retrieval) y similitud semántica, con especial énfasis en el idioma tayiko (tg), además de ruso (ru) e inglés (en). Se distribuye a través de la librería sentence-transformers y es compatible con Text Embeddings Inference (TEI) y endpoints de Hugging Face.

El modelo parte de la arquitectura Gemma 3 Text (gemma3_text) de Google, con 302.863.104 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos pequeños optimizados para despliegue eficiente en tareas de búsqueda semántica y RAG. El repositorio ocupa 1,3 GB y se publicó el 5 de noviembre de 2026.

Su relevancia radica en cubrir una laguna de cobertura lingüística: el tayiko es un idioma de bajos recursos con escasa representación en modelos de embeddings de propósito general, y este fine-tuning busca adaptar un modelo base multilingüe a ese dominio. El acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo, y la licencia es `saidzoda-model-licence` (marcada como `other`), cuyos términos concretos no están detallados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 Text (gemma3_text), transformer encoder para embeddings |
| Parametros totales | 302.863.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tg (tayiko), ru (ruso), en (inglés) |
| Licencia | saidzoda-model-licence (categoría `other`) |
| Formato de pesos | safetensors |
| Dimension de embedding | no disponible |
| Funcion de similitud | no disponible |
| Modelo base | google/embeddinggemma-300m |
| Libreria | sentence-transformers |
| Tamano del repo | 1,3 GB |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3 Text, un transformer decoder-only adaptado aquí como encoder de frases mediante la librería sentence-transformers. Con 302,8 millones de parámetros, es un modelo compacto orientado a la generación de embeddings densos para similitud semántica y recuperación. No se dispone de información sobre la dimensión del vector de salida, la estrategia de pooling (CLS, mean pooling) ni la normalización aplicada.

En cuanto al entrenamiento, la información disponible indica únicamente que se trata de un fine-tuning de google/embeddinggemma-300m sobre datos que cubren tayiko, ruso e inglés, con la etiqueta `retrieval` como tarea principal. No se especifican el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales. Tampoco hay documentación sobre la función de pérdida utilizada (por ejemplo, contrastiva con negativos duros) ni sobre la estrategia de minería de negativos.

## Capacidades

- Generación de embeddings de frases para similitud semántica (`sentence-similarity`).
- Recuperación de información (retrieval) en tayiko, ruso e inglés.
- Soporte multilingüe limitado a los tres idiomas declarados (tg, ru, en).
- Compatibilidad con Text Embeddings Inference (TEI) y endpoints de Hugging Face.
- Integración con la librería sentence-transformers para pipelines de búsqueda y clustering.
- No se ha documentado soporte de tool calling, capacidades de agente, visión, audio ni modo de razonamiento explícito; es un modelo exclusivamente de embeddings.

## Casos de uso

- Búsqueda semántica en tayiko: indexar un corpus de documentos en tayiko y recuperar pasajes relevantes mediante similitud vectorial, aprovechando el fine-tuning específico para ese idioma frente a modelos genéricos.
- RAG (generación aumentada por recuperación) para asistentes en tayiko: usar el modelo como retriever en un pipeline que alimente a un LLM generativo con contexto recuperado de una base documental en tayiko o ruso.
- Deduplicación y clustering de textos: agrupar noticias, artículos o registros en tayiko y ruso por similitud semántica para tareas de organización de contenidos.
- Moderación y clasificación semántica: comparar mensajes de usuarios contra un conjunto de vectores de referencia para detectar contenido similar o duplicado en entornos multilingües tg/ru/en.
- Sistemas de preguntas y respuestas sobre documentación: construir un índice vectorial de manuales o bases de conocimiento en ruso e inglés y recuperar los fragmentos más relevantes para cada consulta.
- Búsqueda bilingüe tayiko-ruso: al compartir espacio de embeddings entre ambos idiomas, permite consultas en ruso que recuperen documentos en tayiko (y viceversa), útil en contextos administrativos y educativos de Asia Central.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2 GB solo para pesos (302,8 M de parámetros), más overhead de activaciones y tokenizador.
- VRAM estimada en fp16/bf16: alrededor de 0,6 GB para los pesos.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) para despliegues de alto throughput.
- También puede ejecutarse en CPU para volúmenes moderados de indexación, dado su tamaño reducido.
- Opciones de despliegue: sentence-transformers (Python), Text Embeddings Inference (TEI), endpoints de Hugging Face; la compatibilidad con llama.cpp u Ollama no está documentada para este modelo de embeddings.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| Saidzoda-Tajik-EmbeddingGemma-300M | 302,8 M | no disponible | tg, ru, en | saidzoda-model-licence (`other`) | Restringido (gated) |
| google/embeddinggemma-300m (base) | ~300 M | no disponible | multilingüe | Gemma (términos de Google) | Abierto con condiciones |
| Modelos de embeddings multilingües de propósito general (p. ej. familia BGE-M3) | no disponible | no disponible | multilingüe amplio | variable | variable |

La comparación cuantitativa de rendimiento no está disponible, ya que no se han publicado benchmarks del modelo fine-tuneado ni del base en la información proporcionada. La principal diferencia frente al base es la especialización declarada en tayiko y la licencia personalizada.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face antes de la descarga, lo que puede complicar la automatización de pipelines.
- Licencia `saidzoda-model-licence` con categoría `other`: los términos exactos no están documentados en la información disponible, por lo que el uso comercial debe verificarse directamente con el autor antes de producción.
- Cobertura lingüística limitada a tg, ru y en; el rendimiento fuera de esos idiomas no está garantizado.
- Al ser un fine-tuning de un modelo pequeño, es probable que su capacidad de representación semántica sea inferior a la de modelos de embeddings de mayor tamaño, aunque no hay datos que lo confirmen.
- No hay información sobre sesgos, tasas de alucinación (no aplica directamente a un modelo de embeddings, pero sí a los sistemas RAG que lo usen), ni sobre robustez ante dominios especializados.
- Sin benchmarks publicados: no es posible evaluar su calidad relativa frente a alternativas sin realizar una evaluación propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tohirju/Saidzoda-Tajik-EmbeddingGemma-300M
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Librería sentence-transformers: https://sbert.net
- Text Embeddings Inference (TEI): https://github.com/huggingface/text-embeddings-inference
