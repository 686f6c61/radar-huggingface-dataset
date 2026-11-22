# tardellirs/brazembed-pt-br

## Resumen

BrazEmbed-PT-BR es un modelo de embeddings de frases (sentence embeddings) para portugués de Brasil, desarrollado por el usuario tardellirs y publicado en Hugging Face. Se construye sobre BERTimbau, el BERT brasileño de 110M de parámetros preentrenado por NeuralMind sobre el corpus web brWaC. BERTimbau es un modelo de lenguaje enmascarado (MLM), no un modelo de embeddings; BrazEmbed añade sobre él el entrenamiento necesario para construir un espacio de representaciones semánticas de frases utilizable en tareas de similitud, clasificación, clustering y recuperación.

El modelo tiene 108.923.136 parámetros, produce embeddings de 768 dimensiones, usa mean pooling y acepta un máximo de 128 tokens por entrada. No requiere prefijo de instrucción ni distinción entre query y passage: el mismo codificador se emplea para ambos. Su licencia es MIT, lo que facilita su uso comercial y su integración en productos.

Su relevancia actual radica en que ocupa la frontera de Pareto del benchmark MTEB-BR (portugués, v1): con 57,5 puntos medios sobre 7 tipos de tarea y 21 tareas nativas en portugués de Brasil, es el mejor modelo entre los de hasta ~110M de parámetros, superando en 13,4 puntos a su propio modelo base (BERTimbau, 44,1). No hay en el leaderboard ningún modelo que sea a la vez más pequeño y mejor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (encoder), basado en neuralmind/bert-base-portuguese-cased (BERTimbau) |
| Parametros totales | 108.923.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens máximo |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugués (pt), con foco en portugués de Brasil (pt-BR) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería sentence-transformers) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer BERT de 110M de parámetros (768 dimensiones ocultas), heredado de BERTimbau, que fue preentrenado por NeuralMind con objetivo MLM sobre el corpus web brWaC. Sobre esa base, BrazEmbed añade un pipeline de entrenamiento en tres fases. La fase 1 consiste en un fine-tune completo con InfoNCE simétrico in-batch y mean pooling sobre 3.633 pares query-passage en portugués generados con Gemini en dominios médico, legal, enciclopédico y web (batch 64, lr 2e-5, 300 pasos). Según el autor, conjuntos sintéticos mayores (6k-9,5k pares) no mejoraron el resultado.

La fase 2 entrena cuatro expertos especializados por grupo de tarea mediante adaptadores LoRA de rango 16 sobre el encoder de la fase 1, fusionados luego en los pesos completos y promediados como weight-soup uniforme de 2-4 checkpoints. Los expertos cubren: clasificación + clustering (soup 50/50 de la fase 1 y un adaptador InfoNCE sobre PLUE NLI, 252k triples, enmascarando falsos negativos in-batch con EmbeddingGemma-300m); pair classification (soup de dos adaptadores NLI, uno con término de matching de embeddings hacia EmbeddingGemma-300m y otro con PLUE más 33,7k filas NLI multilingües de MoritzLaurer); STS (soup de 4 semillas entrenadas con CoSENT sobre 14.739 pares: STSb traducido automáticamente, ASSIN2 train y ASSIN train); y retrieval + reranking (soup de tres adaptadores con InfoNCE y negativos duros minados sobre mMARCO-pt 400k, SQuAD-pt_BR 78k, Ulysses-RFCorpus 4,2k y 5.851 pares QA legales sintéticos). La fase 3 fusiona los cuatro expertos en un único modelo mediante TIES merge (density 0,6, λ = 1,0) tratándolos como task vectors respecto a la fase 1, sin ajustar los hiperparámetros sobre los conjuntos de test. El entrenamiento se ejecutó en GPUs A10G individuales (Modal) en junio de 2026.

## Capacidades

- Generación de embeddings de frases de 768 dimensiones, normalizados L2 opcionalmente, para similitud semántica y búsqueda vectorial.
- Similitud semántica textual (STS): comparación de pares de frases y detección de paráfrasis.
- Clasificación de textos y clasificación multietiqueta por similitud de embeddings.
- Pair classification, incluyendo inferencia de lenguaje natural (NLI).
- Clustering de documentos o frases por proximidad en el espacio de embeddings.
- Retrieval (recuperación de pasajes) y reranking de candidatos.
- Capacidades multilingües limitadas: el modelo está entrenado y evaluado en portugués; no se declara soporte para otros idiomas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder de embeddings, no un modelo generativo.
- No dispone de modo thinking, visión ni audio.
- No requiere prefijo de instrucción ni distinción query/passage.

## Casos de uso

- Búsqueda semántica en portugués de Brasil: indexar un corpus de documentos (legales, médicos, encyclopédicos) con embeddings de 768 dimensiones y recuperar pasajes relevantes ante consultas en lenguaje natural. Adecuado por su rendimiento en retrieval (50,8 en MTEB-BR) y su bajo coste computacional.
- Deduplicación y agrupamiento de documentos: usar clustering sobre los embeddings para agrupar noticias, tickets o registros con contenido similar, aprovechando su puntuación de 49,2 en clustering, la mejor de su categoría de tamaño.
- Clasificación de tickets de soporte: entrenar un clasificador ligero (regresión logística o kNN) sobre los embeddings para enrutar incidencias por categoría, apoyándose en su 69,8 en clasificación.
- Detección de paráfrasis y similitud de pares: comparar pares de frases para control de calidad de traducciones, verificación de duplicados en bases de conocimiento o moderación de contenido, con 81,3 en pair classification.
- Reranking en pipelines RAG: reordenar los candidatos recuperados por un retriever de primera etapa usando la similitud coseno del modelo, con 47,6 en reranking.
- Motor de recomendación por contenido: representar ítems y perfiles de usuario como embeddings y calcular similitudes para sugerir artículos, productos o contenidos editoriales en portugués.
- Análisis de similitud en investigación lingüística: medir proximidad semántica entre frases o documentos en corpus de portugués brasileño, con 78,2 en STS.
- Sistema enrutado por tarea: los cuatro expertos se publican por separado y pueden enrutarse por tipo de tarea mediante `route.py`; en la versión de desarrollo de 16 tareas del benchmark, el sistema enrutado alcanzó 0,6567.

## Benchmarks y rendimiento

Resultados en MTEB-BR (portugués, v1), media sobre 7 tipos de tarea y 21 tareas nativas en portugués de Brasil:

| Modelo | Params | MTEB-BR | Classif. | Multilabel | Pair clf. | STS | Clustering | Retrieval | Reranking |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **BrazEmbed-PT-BR** | 109M | **57,5** | 69,8 | 25,7 | **81,3** | **78,2** | **49,2** | 50,8 | 47,6 |
| serafim-100m-portuguese-pt-sentence-encoder-ir | 109M | 55,9 | 69,6 | 24,3 | 79,4 | 77,1 | 40,2 | 51,8 | 48,7 |
| multilingual-e5-small | 118M | 55,0 | 69,3 | 24,6 | 76,1 | 74,0 | 42,5 | 50,7 | 48,0 |
| granite-embedding-107m-multilingual | 107M | 53,9 | 68,3 | 23,6 | 71,6 | 70,5 | 42,7 | 51,0 | 50,0 |
| BERTimbau-base (sin entrenamiento de embeddings) | 109M | 44,1 | 73,3 | 23,3 | 60,2 | 62,9 | 31,8 | 26,9 | 30,1 |

Sus puntos fuertes son pair classification, STS y clustering. En retrieval y reranking está a la par de los otros modelos de ~100M, no por delante. En la versión de desarrollo de 16 tareas, el sistema enrutado con los cuatro expertos alcanzó 0,6567.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en FP32 (109M parámetros × 4 bytes), alrededor de 0,2-0,3 GB en FP16, y menos de 0,2 GB en cuantización de 8 bits. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A10G, A100 o H100 son más que suficientes. El modelo se entrenó en A10G.
- Cabe en GPU consumer: sí, en todas las GPU modernas, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers (nativo), Text Embeddings Inference (TEI), endpoints compatibles de Hugging Face, ONNX Runtime y otras librerías compatibles con safetensors.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un encoder de 110M con contexto de 128 tokens, se espera un throughput alto en GPU, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Params | Contexto | MTEB-BR | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| BrazEmbed-PT-BR | 109M | 128 tokens | 57,5 | MIT | Hugging Face (sentence-transformers) |
| serafim-100m-portuguese-pt-sentence-encoder-ir | 109M | no disponible | 55,9 | no disponible | Hugging Face |
| multilingual-e5-small | 118M | no disponible | 55,0 | no disponible | Hugging Face |
| granite-embedding-107m-multilingual | 107M | no disponible | 53,9 | no disponible | Hugging Face |
| BERTimbau-base | 109M | 512 tokens (BERT estándar) | 44,1 | no disponible | Hugging Face |

BrazEmbed-PT-BR lidera la comparativa de MTEB-BR entre los modelos de ~100-120M de parámetros, con ventaja en pair classification, STS y clustering, y a la par en retrieval y reranking. Su licencia MIT es una ventaja frente a alternativas cuya licencia no se detalla en la información disponible.

## Limitaciones y advertencias

- Contexto máximo de 128 tokens: los textos más largos deben truncarse o dividirse en fragmentos, lo que puede perder información en documentos extensos.
- Entrenado exclusivamente en portugués (con foco en pt-BR); no se declara ni evalúa su rendimiento en otros idiomas.
- Rendimiento en retrieval y reranking a la par, no superior, a otros modelos de ~100M; para cargas intensivas de recuperación el autor recomienda el experto de retrieval enrutado o un modelo mayor.
- Riesgo de sesgos heredados de BERTimbau y del corpus brWaC, así como de los conjuntos sintéticos generados con Gemini y de los datos de entrenamiento (PLUE NLI, mMARCO-pt, SQuAD-pt_BR, etc.). No se detallan auditorías de sesgo.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos en similitud semántica y de errores en clasificación cuando los textos quedan fuera de la distribución de entrenamiento.
- La puntuación en clasificación multietiqueta es baja (25,7), lo que limita su uso directo en tareas multietiqueta sin ajuste adicional.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución; conviene revisar las licencias de los modelos base y de los datos de entrenamiento (BERTimbau, PLUE, mMARCO, SQuAD-pt_BR, ASSIN, STSb traducido) antes de un despliegue comercial.
- El modelo se publicó en 2026 y su adopción es aún baja (242 descargas, 2 likes en el momento de la consulta); la comunidad y el soporte son limitados.
- No es un modelo generativo: no debe usarse para responder preguntas, generar texto ni ejecutar agentes.

## Enlaces

- Hugging Face: https://huggingface.co/tardellirs/brazembed-pt-br
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Leaderboard MTEB-BR: https://huggingface.co/spaces/MTEB-BR/leaderboard
- Paper MTEB-BR (arXiv 2607.04581): https://arxiv.org/abs/2607.04581
- Repositorio con `route.py`: https://github.com/tardellirs/brazembed-pt-br/blob/main/route.py
