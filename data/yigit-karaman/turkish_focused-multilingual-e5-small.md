# Yigit-Karaman/turkish_focused-multilingual-e5-small

## Resumen

Yigit-Karaman/turkish_focused-multilingual-e5-small es un modelo de embeddings de frases (sentence-similarity) publicado por el usuario Yigit-Karaman como un ajuste fino del conocido intfloat/multilingual-e5-small. Se trata de un encoder transformer de 117.654.272 parámetros (aproximadamente 117,6 M), construido sobre la arquitectura de microsoft/Multilingual-MiniLM-L12-H384, que produce representaciones vectoriales densas de frases y párrafos en alrededor de 100 idiomas. La licencia es MIT y los pesos se distribuyen en formato safetensors, listos para su uso con la librería sentence-transformers.

El modelo no genera texto: su función es transformar oraciones en vectores comparables mediante similitud coseno, lo que lo hace adecuado para búsqueda semántica, recuperación densa (retrieval), clustering, deduplicación y clasificación de textos. El nombre sugiere un enfoque de ajuste orientado al turco, aunque la cobertura declarada de idiomas se mantiene multilingüe. Su tamaño reducido (235 MB en FP16) permite desplegarlo en hardware modesto, incluso en CPU.

Ahora bien, conviene ser cauto: el repositorio presenta 0 descargas y 0 likes, y el bloque model-index de la model card declara los resultados bajo el nombre "intfloat/multilingual-e5-small", es decir, apunta al modelo base y no al ajuste fino. No se documenta en la información disponible el procedimiento de entrenamiento, el corpus utilizado ni resultados específicos para turco, lo que limita la evaluación rigurosa del valor añadido de este ajuste respecto a su modelo de origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT, derivado de microsoft/Multilingual-MiniLM-L12-H384 |
| Parámetros totales | 117.654.272 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (heredada de la configuración del modelo base; no se explicita en la información proporcionada) |
| Tipos de cuantización | no disponible (el repositorio publica únicamente pesos safetensors sin versiones cuantizadas) |
| Idiomas soportados | 100 idiomas declarados en los tags, entre ellos es, en, tr, de, fr, it, pt, nl, pl, ru, ar, hi, ja, zh, ko, vi, sw, uk |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con sentence-transformers) |
| Dimensión de embeddings | no disponible en la información proporcionada (el modelo base emplea 384 dimensiones) |
| Tarea declarada (pipeline) | sentence-similarity |
| Tamaño del repositorio | 2,3 GB |
| Descargas / likes | 0 / 0 |
| Compatibilidad declarada | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura corresponde a un encoder transformer bidireccional de 12 capas con atención completa, la misma topología que microsoft/Multilingual-MiniLM-L12-H384 y que el propio intfloat/multilingual-e5-small. El modelo base de la familia E5 se entrena con objetivos contrastivos sobre pares de textos multilingües, y genera un único vector por frase mediante pooling (habitualmente *mean pooling* sobre la última capa oculta). No se dispone de información sobre el número de tokens, la composición del dataset, el uso de RLHF/DPO ni sobre innovaciones técnicas adicionales aplicadas en este ajuste concreto: la model card no incluye sección de entrenamiento ni hiperparámetros.

No se documenta tampoco si el ajuste fino conserva la convención de prefijos de la familia E5 ("query: " para consultas y "passage: " para documentos), práctica habitual en estos modelos para alinear la representación de consultas y pasajes. Tampoco se indica si el ajuste se realizó sobre corpus turcos, multilingües o sintéticos, ni si hubo destilación, LoRA u otra técnica de adaptación. Todos estos detalles figuran como no disponibles.

## Capacidades

- Generación de embeddings de frases y párrafos para similitud semántica, búsqueda y agrupamiento.
- Recuperación densa (retrieval) monolingüe y cross-lingual dentro de la familia de idiomas declarada.
- Clasificación de textos mediante embeddings congelados más un clasificador ligero (evidenciado por los resultados en tareas de clasificación de MTEB).
- Agrupamiento (clustering) y deduplicación semántica de documentos.
- Detección de paráfrasis y puntuación de similitud entre pares de textos.
- Cobertura multilingüe de aproximadamente 100 idiomas, incluyendo turco, español, inglés, alemán, francés, árabe, hindi, japonés y chino.
- Compatibilidad con la API de sentence-transformers y con Text Embeddings Inference para despliegue como servicio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un modelo exclusivamente de representación.

## Casos de uso

- Búsqueda semántica multilingüe en bases de conocimiento: indexar documentación con los embeddings del modelo y recuperar por similitud coseno consultas formuladas en cualquiera de los idiomas soportados, sin necesidad de traducción intermedia.
- Recuperación aumentada (RAG): generar los embeddings de los fragmentos de un corpus para alimentar un recuperador denso conectado a un LLM generativo, con la ventaja de su bajo coste de cómputo por consulta.
- Deduplicación de tickets de soporte: agrupar incidencias equivalentes redactadas en distintos idiomas mediante clustering sobre los vectores y reducir el volumen de trabajo manual.
- Clasificación de reseñas y análisis de opinión: aplicar un clasificador lineal sobre los embeddings, escenario para el que el modelo declara resultados en AmazonPolarityClassification y AmazonReviewsClassification.
- Moderación y filtrado de contenido: detectar proximidad semántica entre comentarios nuevos y una lista de referencia de mensajes tóxicos o prohibidos.
- Matching de catálogos de producto: emparejar referencias de producto entre catálogos de distintos idiomas comparando descripciones vectorizadas.
- Evaluación automática de respuestas: calcular similitud semántica entre la respuesta generada por un modelo y una referencia para métricas tipo BERTScore.
- Recomendación de contenido por similitud: sugerir artículos, vídeos o preguntas relacionadas a partir del vector del elemento consultado.

## Benchmarks y rendimiento

Los resultados que figuran a continuación proceden del model-index declarado en el repositorio. Conviene subrayar dos cautelas: el campo "name" de ese model-index apunta a intfloat/multilingual-e5-small (el modelo base) y todas las métricas están marcadas como no verificadas (`verified: false`). El listado disponible está truncado y no incluye ninguna tarea en turco.

Tareas de clasificación (MTEB):

| Tarea MTEB | Configuración | Accuracy | AP | F1 |
|---|---|---|---|---|
| AmazonCounterfactualClassification | en | 73,79 | 37,00 | 67,95 |
| AmazonCounterfactualClassification | de | 71,65 | 82,12 | 69,88 |
| AmazonCounterfactualClassification | en-ext | 75,81 | 24,47 | 63,00 |
| AmazonCounterfactualClassification | ja | 64,19 | 15,50 | 52,07 |
| AmazonPolarityClassification | default | 88,70 | 85,27 | 88,66 |
| AmazonReviewsClassification | en | 44,70 | — | 43,73 |
| AmazonReviewsClassification | de | 40,25 | — | 39,39 |
| AmazonReviewsClassification | es | 40,39 | — | 39,30 |
| AmazonReviewsClassification | fr | 38,86 | — | 37,98 |
| AmazonReviewsClassification | ja | 37,68 | — | 37,07 |
| AmazonReviewsClassification | zh | 37,50 | — | 36,62 |

Tarea de recuperación, ArguAna (test):

| Métrica | Valor |
|---|---|
| MAP@1 | 19,06 |
| MAP@3 | 27,47 |
| MAP@10 | 31,70 |
| MAP@100 | 32,97 |
| nDCG@1 | 19,06 |
| nDCG@10 | 39,06 |
| nDCG@100 | 45,18 |
| MRR@10 | 31,87 |
| Recall@10 | 62,80 |
| Recall@100 | 91,32 |
| Recall@1000 | 98,72 |
| Precision@1 | 19,06 |
| Precision@10 | 6,28 |

No se han publicado en la información disponible resultados adicionales, ni comparativas de latencia o throughput.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 470 MB (117.654.272 parámetros × 4 bytes).
- Pesos en FP16/BF16: aproximadamente 235 MB.
- Pesos en INT8: aproximadamente 118 MB; en cuantizaciones de 4 bits, en torno a 60-70 MB (requiere conversión propia, no publicada en el repositorio).
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4070, RTX 4090, así como en GPU de datacenter (T4, L4, L10, A10, A100, H100), donde el consumo de VRAM es marginal.
- Inferencia en CPU perfectamente viable para cargas moderadas, y ejecución en Apple Silicon mediante el backend MPS de PyTorch.
- Opciones de despliegue: sentence-transformers (vía de referencia), Hugging Face Text Embeddings Inference (el repositorio declara el tag text-embeddings-inference), Hugging Face Inference Endpoints (tag endpoints_compatible), vLLM en modo embedding, ONNX Runtime u Optimum mediante conversión propia, y llama.cpp u Ollama previa conversión a GGUF (no se distribuye GGUF en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Yigit-Karaman/turkish_focused-multilingual-e5-small | 117,65 M | 512 (heredado del base) | ~100 | MIT | safetensors |
| intfloat/multilingual-e5-small | 117,65 M | 512 | ~100 | MIT | safetensors, ONNX |
| intfloat/multilingual-e5-base | 278 M | 512 | ~100 | MIT | safetensors, ONNX |
| intfloat/multilingual-e5-large | 560 M | 512 | ~100 | MIT | safetensors, ONNX |
| BAAI/bge-m3 | 568 M | 8192 | ~100 | MIT | safetensors |

La comparación de rendimiento frente a estas alternativas no está disponible: los únicos números publicados en este repositorio son los del model-index, que apunta al modelo base, por lo que no permiten atribuir ninguna mejora al ajuste fino. En cuanto a tamaño y coste de inferencia, este modelo se sitúa en el escalón más bajo de la tabla, lo que lo hace atractivo para despliegues con restricciones de recursos, a cambio de una capacidad representacional inferior a la de variantes de 278 M, 560 M o 568 M parámetros.

## Limitaciones y advertencias

- El model-index del repositorio declara los resultados bajo el nombre intfloat/multilingual-e5-small, por lo que los benchmarks mostrados corresponden al modelo base y no necesariamente al ajuste fino.
- Todas las métricas figuran como `verified: false`; no han sido validadas de forma independiente.
- Señales de adopción nulas: 0 descargas y 0 likes en el momento de redactar esta ficha, sin evidencia de uso en producción.
- No se documenta el procedimiento de ajuste fino, el corpus empleado, los hiperparámetros ni si se conservan los prefijos "query: " y "passage: " de la familia E5; usarlos o no puede alterar de forma notable la calidad de los embeddings.
- Pese a que el nombre indica un enfoque en turco, no se aporta ningún benchmark específico en turco en la información disponible.
- Límite de contexto de 512 tokens: los documentos largos requieren troceado (chunking), con la consiguiente pérdida de coherencia global.
- No es un modelo generativo: no puede emplearse para chat, generación de código, razonamiento multi-paso, tool calling ni tareas de agentes.
- Sesgos: hereda los del corpus multilingüe del modelo base, que no se documenta en el repositorio; no hay evaluación de sesgo ni de equidad entre idiomas.
- Riesgo de alucinación: en el sentido generativo no aplica, pero sí existe riesgo de falsos positivos en la similitud semántica, especialmente entre idiomas con poco soporte efectivo.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantía alguna por parte del autor.
- Dimensión de embedding reducida (base de 384 dimensiones), inferior a la de modelos de 768 o 1024 dimensiones, lo que puede penalizar en tareas de recuperación exigentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yigit-Karaman/turkish_focused-multilingual-e5-small
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Paper del modelo base: Multilingual E5 Text Embeddings: A Technical Report, https://arxiv.org/abs/2402.05672
- Paper de MTEB: https://arxiv.org/abs/2210.07316
- Papers adicionales referenciados en los tags del repositorio (título no disponible en la información proporcionada): https://arxiv.org/abs/2104.08663 y https://arxiv.org/abs/2108.08787
- Documentación de sentence-transformers: https://www.sbert.net
- Clasificación MTEB: https://huggingface.co/spaces/mteb/leaderboard
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; únicamente aparecieron enlaces comerciales de Amazon sin relación con la ficha.
