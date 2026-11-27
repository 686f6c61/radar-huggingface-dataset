# yali98/rag-assign-dpr-ce

## Resumen

`yali98/rag-assign-dpr-ce` es un modelo de recuperación de información (retrieval) basado en la arquitectura DPR (Dense Passage Retrieval) en configuración bi-encoder, desarrollado por el usuario yali98 en el contexto de un proyecto académico de RAG (Retrieval-Augmented Generation) fechado en 2026. El modelo parte del checkpoint previo `yali98/rag-assign-dpr` y se somete a un entrenamiento adicional con negativos duros (hard negatives) seleccionados mediante un cross-encoder del mismo autor (`yali98/rag-assign-cross-encoder`).

El problema que resuelve es el de la recuperación densa de pasajes relevantes para una pregunta: codifica consultas y documentos en un espacio vectorial compartido para permitir búsqueda por similitud semántica. La innovación principal respecto a su predecesor es el minado de negativos duros con un cross-encoder, un pipeline de tres etapas (BM25, bi-encoder y reranking con cross-encoder) que filtra candidatos que el modelo base puntúa erróneamente como relevantes.

El modelo es relevante como ejemplo reproducible de un pipeline de entrenamiento de retrieval con recursos limitados: todo el proceso se ejecutó en una única GPU RTX 3080 con autocast en bf16. El repositorio ocupa 0,9 GB y contiene dos subcarpetas (`question_encoder` y `ctx_encoder`) con pesos en formato safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DPR bi-encoder (dos torres: `DPRQuestionEncoder` y `DPRContextEncoder`) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens para pregunta, 256 tokens para pasaje (longitudes máximas de entrenamiento) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (los datos de entrenamiento del proyecto son de temática RAG; el README está en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (subcarpetas `question_encoder` y `ctx_encoder`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DPR estándar de dos codificadores independientes: un `DPRQuestionEncoder` para consultas y un `DPRContextEncoder` para pasajes. Cada torre produce una representación vectorial y la relevancia se calcula por similitud (producto escalar) entre ambas. El entrenamiento usa entropía cruzada con un positivo gold, un negativo duro muestreado y negativos in-batch, con los siguientes hiperparámetros: 3 épocas, learning rate 1e-5, batch 64, `max_q_len` 64, `max_p_len` 256, warmup 0.1, weight decay 0, grad clip 2.0, seed 42 y gradient checkpointing.

El minado de negativos duros es la parte más elaborada del pipeline. Se parte de los 100 mejores candidatos BM25 por pregunta y se refinan a los 30 mejores según `rag-assign-dpr`, excluyendo documentos gold, weak positives y documentos que contienen la cadena de respuesta. Cada candidato se puntúa con el cross-encoder y se descartan los que superan o igualan la puntuación del gold (de 2.200.579 candidatos se conservan 22.717). Finalmente se toman los 8 mejores por puntuación CE como negativos duros de cada pregunta. El conjunto de entrenamiento contiene 57.880 preguntas, con 1.000 reservadas para validación mediante `random.Random(0).sample(train_qa, 1000)`. El cómputo de puntuaciones CE requirió 31 minutos y el entrenamiento 34 minutos (unos 11 minutos por época) en una RTX 3080.

## Capacidades

- Recuperación densa de pasajes: genera embeddings de consulta y de documento para búsqueda por similitud semántica.
- Búsqueda semántica bilingüe potencial, aunque no se documentan los idiomas de entrenamiento.
- Integración en pipelines RAG como etapa de retrieval previa a un generador.
- Reranking opcional mediante el cross-encoder asociado del mismo autor.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un modelo de representación para retrieval.
- No dispone de modo de razonamiento (thinking mode) ni de capacidades multimodales.

## Casos de uso

- Recuperación de pasajes en un sistema RAG: el modelo codifica la pregunta del usuario y los fragmentos del corpus para seleccionar los más relevantes antes de pasarlos a un LLM generador. Es adecuado porque está específicamente entrenado para esta tarea con negativos duros.
- Búsqueda semántica sobre documentación interna: se indexan los embeddings de los pasajes con el `DPRContextEncoder` y se consultan con el `DPRQuestionEncoder`, permitiendo recuperar documentos relevantes aunque no compartan términos literales con la consulta.
- Segunda etapa de un pipeline de recuperación en cascada: tras un filtrado inicial con BM25, el bi-encoder reordena los candidatos por similitud semántica, aprovechando que fue entrenado precisamente sobre los 30 mejores resultados de BM25.
- Evaluación de sistemas de retrieval: sirve como baseline reproducible en experimentos académicos, dado que el autor documenta el pipeline completo, hiperparámetros y métricas de validación.
- Filtrado de candidatos para anotación humana: el modelo puede priorizar pasajes potencialmente relevantes para reducir el volumen de revisión manual en tareas de curación de datasets.
- Componente de un sistema de preguntas y respuestas extractivas: combinado con un lector (reader) sobre los pasajes recuperados, forma la base de un pipeline QA clásico tipo DPR.

## Benchmarks y rendimiento

Métricas de validación publicadas por el autor (conjunto de validación de 1.000 preguntas):

| Época | Loss | val gold/weak@1 | val gold/weak@5 | val gold MRR |
|---|---|---|---|---|
| 1 | 0.1564 | 0.478 | 0.712 | 0.474 |
| 2 | 0.1295 | 0.481 | 0.703 | 0.476 |
| 3 | 0.1037 | 0.489 | 0.705 | 0.481 |

Comparación con el modelo base `rag-assign-dpr` (10 épocas): gold/weak@1 = 0.455, gold/weak@5 = 0.702, gold MRR = 0.456.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no son aplicables a un modelo de retrieval.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,9 GB, por lo que la inferencia en precisión completa cabe holgadamente en GPUs de consumo.
- GPU de entrenamiento utilizada: RTX 3080 con autocast en bf16.
- GPU recomendadas para inferencia: cualquier GPU con al menos unos pocos GB de VRAM; también es viable en CPU para volúmenes moderados.
- Cabe en GPU de consumo: sí, el entrenamiento se realizó en una RTX 3080.
- Opciones de despliegue: carga mediante `transformers` con `DPRQuestionEncoder` y `DPRContextEncoder`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un bi-encoder de retrieval).
- Latencia y throughput: no disponibles; el autor solo reporta tiempos de entrenamiento (34 minutos para 3 épocas) y de minado de negativos (31 minutos).

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| yali98/rag-assign-dpr-ce | DPR bi-encoder | 64 (q) / 256 (p) | Apache 2.0 | Hugging Face |
| yali98/rag-assign-dpr | DPR bi-encoder (base) | 64 (q) / 256 (p) | no disponible | Hugging Face |
| yali98/rag-assign-cross-encoder | Cross-encoder (reranking) | no disponible | no disponible | Hugging Face |
| facebook/dpr-ctx_encoder-single-nq-base | DPR bi-encoder (referencia original) | 512 | no disponible en la información proporcionada | Hugging Face |

No se dispone de datos de rendimiento comparativos con alternativas externas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho con 0 descargas y 0 likes: no ha sido validado por la comunidad ni sometido a evaluación independiente.
- Las métricas publicadas corresponden a un conjunto de validación interno de 1.000 preguntas del propio proyecto; no hay evaluación sobre benchmarks estándar de retrieval (BEIR, MS MARCO, etc.).
- Longitudes de contexto cortas (64 tokens para pregunta, 256 para pasaje): consultas o pasajes más largos se truncarán.
- Idiomas de entrenamiento no documentados: no se puede garantizar un rendimiento multilingüe ni siquiera monolingüe fuera del dominio de entrenamiento.
- Riesgo de sobreajuste al corpus del proyecto: los negativos duros se minaron sobre un dataset concreto, lo que puede reducir la generalización a otros dominios.
- No es un modelo generativo: no debe usarse para tareas de texto, código o razonamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El README está redactado en coreano y la documentación en inglés es mínima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yali98/rag-assign-dpr-ce
- Modelo base: https://huggingface.co/yali98/rag-assign-dpr
- Cross-encoder asociado: https://huggingface.co/yali98/rag-assign-cross-encoder
- Dataset de negativos: https://huggingface.co/datasets/yali98/rag-assign-ce-negatives
