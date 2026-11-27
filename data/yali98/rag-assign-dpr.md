# yali98/rag-assign-dpr

## Resumen

`rag-assign-dpr` es un modelo de recuperación densa (dense retrieval) de tipo bi-encoder DPR (Dense Passage Retrieval) publicado por el usuario `yali98` en Hugging Face. Se construye a partir de `google-bert/bert-base-uncased` y se ha afinado exclusivamente con los datos proporcionados en un trabajo académico de RAG (preguntas `train_qa` y juicios de relevancia `train_qrels`), sin reutilizar los pesos públicos originales de DPR. Su función es actuar como re-ranker de los 100 primeros candidatos recuperados por BM25.

El modelo se distribuye en dos subcarpetas independientes, `question_encoder/` y `ctx_encoder/`, compatibles con las clases `DPRQuestionEncoder` y `DPRContextEncoder` de la librería Transformers. La estrategia de entrenamiento combina un positivo gold, un negativo duro por pregunta (extraído de `qrels`, excluyendo 7341 negativos que contenían la cadena de respuesta correcta) y negativos in-batch, optimizando con entropía cruzada.

Es relevante como ejemplo reproducible de pipeline de recuperación para sistemas RAG en entornos con recursos limitados: todo el entrenamiento se completó en una única RTX 3080 con autocast bf16 y aproximadamente 11 minutos por época. No obstante, se trata de un artefacto de asignación académica con cero descargas y sin benchmarks publicados, por lo que su uso en producción requiere una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder DPR (dos torres BERT) |
| Parametros totales | no disponible (base: `bert-base-uncased`, ~110 M por torre) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens para preguntas, 256 tokens para pasajes (longitudes máximas de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de PyTorch/Transformers, no documentada por el autor) |
| Idiomas soportados | no disponible (el modelo base es mayoritariamente inglés; los datos de entrenamiento parecen ser coreanos según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un bi-encoder DPR clásico de dos torres: un `DPRQuestionEncoder` que codifica la consulta y un `DPRContextEncoder` que codifica el pasaje, ambos inicializados desde `bert-base-uncased`. La similitud se calcula como producto escalar entre los embeddings de pregunta y pasaje. El modelo no reutiliza los pesos públicos de DPR; se entrena desde cero sobre el corpus del trabajo.

El entrenamiento emplea 57.880 preguntas (se reservan 1.000 como validación mediante `random.Random(0).sample`), con un positivo gold y un negativo duro por pregunta extraído de `qrels` (excluyendo 7.341 negativos que contenían la cadena de respuesta correcta), más negativos in-batch, y pérdida de entropía cruzada. Hiperparámetros: 10 épocas, learning rate 2e-5, batch size 64, `max_q_len` 64, `max_p_len` 256, warmup ratio 0.1, weight decay 0.0, grad clip 2.0, seed 42 y checkpointing de gradientes activado. La mejor época fue la 10, seleccionada por MRR gold en validación. El entrenamiento se ejecutó en una RTX 3080 con autocast bf16, a razón de unos 11 minutos por época.

## Capacidades

- Recuperación densa de pasajes: genera embeddings de pregunta y de contexto comparables por producto escalar.
- Re-ranking de candidatos: pensado para reordenar los 100 mejores resultados de BM25.
- Codificación de consultas cortas (hasta 64 tokens) y pasajes de hasta 256 tokens.
- Integración con el ecosistema Transformers mediante `DPRQuestionEncoder` y `DPRContextEncoder`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidades multilingües: no documentadas; el modelo base es de dominio inglés.

## Casos de uso

- Re-ranking en pipelines RAG: usar BM25 para recuperar los 100 mejores pasajes y aplicar este bi-encoder para reordenarlos por similitud semántica antes de pasarlos al generador.
- Búsqueda semántica sobre documentación interna: indexar pasajes de hasta 256 tokens con `ctx_encoder` y consultar con `question_encoder` para recuperar fragmentos relevantes en asistentes de documentación.
- Preguntas y respuestas sobre corpus académico: el entrenamiento con `train_qa` y `train_qrels` lo hace adecuado para dominios de QA con juicios de relevancia anotados.
- Evaluación de sistemas de recuperación: sirve como baseline reproducible para comparar estrategias de negativos duros frente a recuperación léxica.
- Filtrado previo en motores de búsqueda: reducir el número de candidatos que llegan a un cross-encoder más costoso, dado el bajo coste computacional del bi-encoder.
- Prototipado en hardware de consumo: al entrenarse en una RTX 3080 y ser un BERT base, puede desplegarse en GPUs consumer para experimentación.
- Experimentos de ablation sobre negativos: la receta de entrenamiento (gold + hard negative + in-batch) permite replicar y modificar fácilmente el esquema de negativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona la métrica de selección de época (gold/weak_pos@5 y gold MRR en validación) y remite a `history.json`, sin cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de dos torres BERT base (~110 M parámetros cada una), la inferencia en fp32 requiere del orden de 0,5 GB por torre y en fp16/bf16 aproximadamente la mitad, sin contar overhead de activaciones.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia; el autor entrenó en una RTX 3080.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 3080, RTX 4090 y similares.
- Opciones de despliegue: Transformers (nativo), con posibilidad de exportación a ONNX o integración en frameworks de recuperación como FAISS o Sentence-Transformers; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `yali98/rag-assign-dpr` | ~110 M por torre (BERT base) | 64 / 256 tokens | apache-2.0 | Hugging Face | Afinado solo con datos del trabajo, sin benchmarks |
| `facebook/dpr-question_encoder-single-nq-base` | ~110 M | 512 tokens | cc-by-nc-4.0 (uso no comercial) | Hugging Face | DPR original entrenado en Natural Questions |
| `facebook/dpr-ctx_encoder-single-nq-base` | ~110 M | 512 tokens | cc-by-nc-4.0 | Hugging Face | Contraparte de contexto del DPR original |
| `sentence-transformers/all-MiniLM-L6-v2` | ~22 M | 256 tokens | apache-2.0 | Hugging Face | Bi-encoder ligero para búsqueda semántica general |

## Limitaciones y advertencias

- Modelo de asignación académica con cero descargas y cero likes; no hay evidencia de validación externa.
- Sin benchmarks publicados: el rendimiento real en dominios distintos al corpus de entrenamiento es desconocido.
- Longitudes de contexto cortas (64 tokens para pregunta, 256 para pasaje) que limitan su uso con documentos largos.
- Idiomas no documentados; el modelo base es mayoritariamente inglés y los datos de entrenamiento parecen ser coreanos, lo que puede degradar el rendimiento en castellano.
- Riesgo de sesgos heredados de `bert-base-uncased` y del corpus de entrenamiento.
- Riesgo de alucinación no aplica directamente al ser un modelo de recuperación, pero los pasajes recuperados pueden ser irrelevantes si la distribución de consultas difiere.
- Licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del corpus de entrenamiento subyacente.
- No se documentan limitaciones específicas de seguridad ni filtros de contenido.

## Enlaces

- Hugging Face: https://huggingface.co/yali98/rag-assign-dpr
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Documentación de DPR en Transformers: https://huggingface.co/docs/transformers/model_doc/dpr
- Paper de DPR (Karpukhin et al., 2020): https://arxiv.org/abs/2004.04906
