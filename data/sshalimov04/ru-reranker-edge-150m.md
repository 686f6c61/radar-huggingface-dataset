# sshalimov04/ru-reranker-edge-150m

## Resumen

ru-reranker-edge-150m es un cross-encoder de reordenación (reranker) para ruso desarrollado por el usuario sshalimov04 y publicado en Hugging Face bajo licencia Apache 2.0. Se construye sobre `deepvk/RuModernBERT-base` y contiene 149.605.633 parámetros, lo que lo sitúa en la gama de 150 millones. Su propósito es puntuar la relevancia de pares (consulta, documento) en pipelines de recuperación de información en ruso, sustituyendo a modelos mucho mayores con una pérdida de calidad mínima.

La propuesta central es la destilación por listwise de `BAAI/bge-reranker-v2-m3` (568M parámetros): el modelo aprende a reproducir la distribución de puntuaciones del profesor dentro de grupos de «consulta + 16 documentos», sin necesidad de etiquetas de relevancia explícitas. Según el autor, alcanza entre el 95 % y el 99 % de la calidad del profesor con un tamaño 3,8 veces menor, lo que lo hace apto para despliegue en CPU, navegador y entornos con recursos limitados.

El modelo es relevante porque combina un contexto de hasta 8192 tokens (entrenado y evaluado a 512), exportaciones a ONNX, OpenVINO y Transformers.js, y compatibilidad con sentence-transformers, vLLM, Text Embeddings Inference y mteb. Está orientado exclusivamente al idioma ruso y su caso de uso natural es el reordenamiento de candidatos recuperados por BM25 o por un retriever denso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), cross-encoder de clasificación de pares |
| Parámetros totales | 149.605.633 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8192 tokens (entrenado y evaluado a 512) |
| Tipos de cuantización | fp32, fp16, int8 (por canal); exportaciones ONNX, OpenVINO |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (fp32, fp16, int8), OpenVINO IR |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en ModernBERT: recibe la concatenación de consulta y documento, aplica el encoder y produce un único logit de relevancia. La base `deepvk/RuModernBERT-base` aporta atención con soporte de contexto largo (hasta 8192 tokens), aunque el autor entrena y evalúa a 512 tokens. La salida es un logit escalar; sentence-transformers y vLLM aplican sigmoide por defecto (rango 0–1), mientras que transformers, ONNX, Transformers.js y TEI con `raw_scores: true` devuelven el logit crudo.

El entrenamiento emplea destilación listwise: el modelo aprende a replicar la distribución de puntuaciones del profesor `BAAI/bge-reranker-v2-m3` dentro de grupos de una consulta y 16 documentos, sin requerir etiquetas de relevancia. Los datos de entrenamiento incluyen el split de entrenamiento de mMARCO en ruso, el split de entrenamiento de MIRACL-ru, artículos de la Wikipedia rusa, fragmentos de códigos y normativa de la Federación Rusa, y pares sintéticos «argumento → contraargumento» generados con Qwen3-27B. Ninguno de los conjuntos de evaluación utilizados en la model card formó parte del entrenamiento. El autor reporta compatibilidad tanto con transformers 4.x como 5.x.

## Capacidades

- Puntuación de relevancia de pares (consulta, documento) mediante un logit único; mayor valor implica mayor relevancia.
- Reordenamiento de candidatos recuperados por BM25 o retrievers densos (evaluado sobre BM25 top-100).
- Procesamiento de contexto largo de hasta 8192 tokens en la arquitectura base, con uso práctico a 512 tokens.
- Ejecución en CPU sin torch mediante ONNX Runtime u OpenVINO.
- Ejecución en navegador y Node mediante Transformers.js (fp32, fp16 y q8).
- Servido como endpoint de reranking con Text Embeddings Inference (`/rerank`) y vLLM (`/score`, `/rerank`, `LLM.score`).
- Integración con sentence-transformers `CrossEncoder` (incluye `rank` y `predict`) y con el framework `mteb`.
- Soporte de modo de puntuaciones crudas (`raw_scores: true` en TEI, `activation_fn=torch.nn.Identity()` en sentence-transformers).
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un clasificador de ranking.

## Casos de uso

- Reordenamiento en buscadores corporativos en ruso: tras una recuperación inicial con BM25 o un retriever denso, el modelo reordena el top-100 de candidatos; su contexto de 512 tokens cubre la mayoría de pasajes y su tamaño de 150M permite ejecutarlo en la misma máquina que el retriever.
- Búsqueda jurídica y normativa: el entrenamiento incluye fragmentos de códigos y normativa rusa, por lo que es adecuado para reordenar resultados en asistentes de consulta legal donde la terminología especializada penaliza a los rerankers genéricos.
- Asistente de preguntas y respuestas sobre Wikipedia rusa: el corpus de entrenamiento incluye artículos de Wikipedia, y los resultados en xquad (nDCG@10 0.987) y tydiqa (0.583) lo respaldan para QA extractivo sobre este dominio.
- Despliegue en el navegador con Transformers.js: la exportación q8 (aproximadamente 144 MB en ONNX int8) permite reordenar resultados localmente sin enviar consultas a un servidor, útil en aplicaciones web con requisitos de privacidad.
- Servicio de reranking de bajo coste en CPU: con el backend ONNX u OpenVINO y el contenedor CPU de TEI, se puede ofrecer un endpoint `/rerank` sin GPU, lo que reduce el coste de infraestructura frente al profesor de 568M.
- Búsqueda de contraargumentos y análisis de debates: los pares sintéticos «argumento → contraargumento» elevan ArguAna de 0.249 a 0.386, lo que lo hace útil en herramientas de análisis de argumentación en ruso.
- Filtrado y deduplicación de candidatos en pipelines RAG: al puntuar pares de forma independiente, puede descartar pasajes irrelevantes antes de enviarlos a un LLM generador, reduciendo el consumo de contexto.

## Benchmarks y rendimiento

nDCG@10 sobre un subconjunto de RusBEIR (zero-shot, reordenando BM25 top-100, con los mismos candidatos en todas las filas):

| Modelo | scifact | nfcorpus | arguana | tydiqa | xquad | Media |
|---|---|---|---|---|---|---|
| BM25 | 0.657 | 0.302 | 0.325 | 0.351 | 0.952 | 0.517 |
| ru-reranker-edge-150m | 0.742 | 0.346 | 0.386 | 0.583 | 0.987 | 0.609 |
| bge-reranker-v2-m3 (568M, profesor) | 0.733 | 0.340 | 0.381 | 0.592 | 0.989 | 0.607 |

RuBQReranking (ruMTEB, `mteb` oficial, zero-shot):

| Modelo | MAP | nDCG@10 |
|---|---|---|
| ru-reranker-edge-150m | 0.773 | 0.839 |
| bge-reranker-v2-m3 (profesor) | 0.785 | 0.848 |

Desviación de las exportaciones respecto a transformers fp32 (máximo |Δ logit|):

| Runtime | Ficheros | Desviación |
|---|---|---|
| sentence-transformers (torch) | `model.safetensors` | 0 |
| ONNX Runtime fp32 | `onnx/model.onnx` | < 1e-4 |
| ONNX fp16 | `onnx/model_fp16.onnx` | ~0.004 |
| ONNX int8 (por canal) | `onnx/model_quantized.onnx` | ~0.6 (Spearman 0.98) |
| OpenVINO | `openvino/openvino_model.xml` | ~0.006 |
| TEI (Candle / ORT) | safetensors o ONNX | ~0.002 / < 1e-4 |
| Transformers.js fp32 / fp16 / q8 | `onnx/*.onnx` | < 1e-4 / ~0.003 / ~0.3 |
| vLLM (tras sigmoide) | `model.safetensors` | ~0.002 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,6 GB en fp32 (150M parámetros), unos 0,3 GB en fp16 y unos 0,15 GB en int8. El fichero ONNX int8 ocupa 144 MB según la model card.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre es suficiente; una RTX 4090, A100 o H100 queda muy sobredimensionada para un modelo de este tamaño. Es viable en GPUs de consumo modestas e incluso en iGPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer actual e incluso en placas integradas; también funciona en CPU sin torch mediante ONNX u OpenVINO.
- Opciones de despliegue: sentence-transformers (torch, backend ONNX, backend OpenVINO), transformers (`AutoModelForSequenceClassification`, `pipeline`), Text Embeddings Inference (imagen CPU `cpu-1.9` usa ONNX; imagen GPU usa safetensors con Candle), vLLM (`--runner pooling`, probado en vLLM 0.33 con imagen `vllm/vllm-openai-cpu`), Transformers.js en navegador y Node, y `mteb`.
- Latencia y throughput: no disponibles en la información proporcionada. El autor solo reporta desviaciones numéricas entre runtimes, no medidas de latencia ni de documentos por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Rendimiento relevante |
|---|---|---|---|---|---|
| ru-reranker-edge-150m | 149,6M | 8192 (uso a 512) | ru | Apache 2.0 | RusBEIR medio 0.609; RuBQReranking MAP 0.773 |
| bge-reranker-v2-m3 (profesor) | 568M | no disponible en la información | multilingüe | no disponible en la información | RusBEIR medio 0.607; RuBQReranking MAP 0.785 |
| BM25 (referencia léxica) | no aplica | no aplica | independiente del idioma | no aplica | RusBEIR medio 0.517 |

El modelo iguala o supera ligeramente al profesor en la media de RusBEIR y queda por debajo en RuBQReranking (0.773 frente a 0.785 de MAP), con un tamaño 3,8 veces menor. No se dispone de datos de otros rerankers rusos específicos en la información proporcionada.

## Limitaciones y advertencias

- Solo ruso: no está entrenado ni evaluado para otros idiomas, por lo que su uso en textos multilingües o en castellano no está respaldado.
- Contexto práctico de 512 tokens: aunque la arquitectura base admite 8192, el entrenamiento y la evaluación se realizaron a 512, de modo que el comportamiento más allá de esa longitud no está validado.
- La cuantización int8 introduce una desviación de aproximadamente 0,6 en el logit (Spearman 0.98); puede alterar el orden en casos con puntuaciones muy próximas.
- La salida es un logit sin calibración probabilística; la sigmoide que aplican sentence-transformers y vLLM no convierte el valor en una probabilidad calibrada.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos: el modelo puntúa relevancia y puede ordenar mal documentos ambiguos o con vocabulario fuera de dominio.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada; el corpus de entrenamiento (Wikipedia, normativa rusa, mMARCO, MIRACL) puede infrarrepresentar registros coloquiales o dominios especializados distintos del jurídico.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las obligaciones de atribución y las licencias de los datos de entrenamiento derivados de terceros.
- El autor advierte de que los conjuntos de evaluación no formaron parte del entrenamiento, pero no se detalla el solapamiento potencial con los corpus de entrenamiento más allá de esa afirmación.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sshalimov04/ru-reranker-edge-150m
- Modelo base: https://huggingface.co/deepvk/RuModernBERT-base
- Profesor de destilación: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- vLLM: https://github.com/vllm-project/vllm
- Transformers.js: https://github.com/huggingface/transformers.js
- sentence-transformers: https://github.com/UKPLab/sentence-transformers
- Framework mteb: https://github.com/embeddings-benchmark/mteb
- RusBEIR: no disponible en la información proporcionada
- Artículo o blog del autor: no disponible en la información proporcionada
