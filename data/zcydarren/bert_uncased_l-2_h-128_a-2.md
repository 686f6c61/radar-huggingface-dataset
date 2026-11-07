# ZCYDarren/bert_uncased_L-2_H-128_A-2

## Resumen

BERT-Tiny (`bert_uncased_L-2_H-128_A-2`) es la variante más pequeña de la familia de 24 "BERT Miniatures" presentada por Google Research en el artículo *Well-Read Students Learn Better: On the Importance of Pre-training Compact Models* (Turc et al., 2019). Se trata de un transformer encoder de tipo BERT con solo 2 capas, dimensión oculta de 128 y 2 cabezas de atención, lo que arroja 4.433.468 parámetros totales según los pesos en safetensors del repositorio. Es un modelo exclusivamente de representación (encoder bidireccional), no un modelo generativo, y está pensado para entornos con recursos computacionales muy restringidos.

El modelo se distribuye bajo licencia Apache 2.0 y está entrenado únicamente en inglés, con tokenización WordPiece y sin distinción de mayúsculas (uncased). Su interés actual no reside en competir con LLMs modernos, sino en servir como base destilable y como encoder ultraligero para tareas de clasificación, extracción de características o reranking en dispositivos con pocos recursos. El repositorio `ZCYDarren/bert_uncased_L-2_H-128_A-2` es una réplica del checkpoint original de Google, con 0 descargas y 0 likes en el momento de la consulta.

La relevancia de esta ficha es documentar con rigor qué se puede y qué no se puede esperar de un encoder de 4,4 millones de parámetros, frente a la tentación de emplearlo como sustituto de modelos generativos. Su receta de entrenamiento (MLM + NSP estándar) y su tamaño lo sitúan en la categoría de modelos "tiny" para destilación de conocimiento, no para generación de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (bidireccional, tipo MLM+NSP) |
| Parametros totales | 4.433.468 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (configuración estándar de BERT; no confirmado explícitamente en la información disponible) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (uncased, WordPiece) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch, JAX |
| Capas (L) | 2 |
| Dimensión oculta (H) | 128 |
| Cabezas de atención (A) | 2 |
| Tamaño del repositorio | 0.1 GB |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder estándar de BERT con 2 capas, dimensión oculta 128 y 2 cabezas de atención (L=2, H=128, A=2). El objetivo de entrenamiento es el receta clásica de BERT: masked language modeling (MLM) con enmascaramiento WordPiece y next sentence prediction (NSP). El modelo está entrenado solo en inglés y sin normalización de mayúsculas (uncased). No se dispone en la información proporcionada del número exacto de tokens de entrenamiento ni de la composición del corpus, aunque el artículo de referencia (Turc et al., 2019) describe el uso de la misma receta que BERT-Base/Large sobre el corpus original de BERT.

La innovación técnica del trabajo no está en la arquitectura, sino en la metodología: los autores demuestran que la receta estándar de BERT es efectiva en un rango amplio de tamaños, más allá de Base y Large, y que los modelos compactos resultantes son especialmente útiles como estudiantes en destilación de conocimiento, donde las etiquetas de fine-tuning las produce un modelo profesor más grande y preciso. No se menciona en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa, algo esperable en un encoder de 2019.

## Capacidades

- Codificación de texto en inglés para representaciones contextuales (encoder bidireccional, sin generación autoregresiva).
- Fine-tuning para clasificación de secuencias (sentiment analysis, detección de spam, clasificación de tópicos).
- Fine-tuning para clasificación de pares de secuencias (NLI, paráfrasis, respuesta a preguntas extractiva).
- Extracción de embeddings para similitud semántica y clustering.
- Base para destilación de conocimiento desde un profesor BERT-Base o BERT-Large.
- Reranking ligero en pipelines de búsqueda o recuperación.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni agentes.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe: no disponible (solo inglés).

## Casos de uso

- Clasificación de sentimiento en producción de bajo coste: fine-tuning sobre SST-2 con 2 capas y 128 dimensiones permite desplegar un clasificador binario en CPU con latencia mínima; el modelo reporta 83,2 en SST-2 según la model card.
- Detección de spam o toxicidad en tiempo real: al tener 4,4 M de parámetros, puede ejecutarse en dispositivos edge o en funciones serverless sin GPU, procesando lotes pequeños con memoria despreciable.
- Reranking en motores de búsqueda: usar los embeddings del encoder para reordenar los top-k resultados de un retriever (BM25 o bi-encoder) en dominios ingleses con presupuesto de latencia estricto.
- Destilación de conocimiento: emplear BERT-Base o BERT-Large como profesor para generar etiquetas blandas sobre un corpus y entrenar este modelo como estudiante, tal como propone el artículo original.
- Clasificación de tickets de soporte: fine-tuning sobre un dataset propio de categorías para enrutamiento automático, con entrenamiento en minutos en una sola GPU consumer.
- Extracción de características para clustering de documentos: generar embeddings de 128 dimensiones para agrupar corpus pequeños en inglés sin necesidad de infraestructura de inferencia pesada.
- Respuesta a preguntas extractiva: fine-tuning sobre SQuAD (inglés) para localizar la respuesta en un pasaje, aunque con calidad limitada por el tamaño del modelo.

## Benchmarks y rendimiento

Resultados GLUE en test reportados en la model card para BERT-Tiny (L=2, H=128, A=2):

| Tarea | BERT-Tiny | BERT-Mini (L=4, H=256) | BERT-Small (L=4, H=512) | BERT-Medium (L=8, H=512) |
|---|---|---|---|---|
| GLUE (media) | 64,2 | 65,8 | 71,2 | 73,5 |
| CoLA | 0,0 | 0,0 | 27,8 | 38,0 |
| SST-2 | 83,2 | 85,9 | 89,7 | 89,6 |
| MRPC | 81,1/71,1 | 81,1/71,8 | 83,4/76,2 | 86,6/81,6 |
| STS-B | 74,3/73,6 | 75,4/73,3 | 78,8/77,0 | 80,4/78,4 |
| QQP | 62,2/83,4 | 66,4/86,2 | 68,1/87,0 | 69,6/87,9 |
| MNLI-m | 70,2 | 74,8 | 77,6 | 80,0 |
| MNLI-mm | 70,3 | 74,3 | 77,0 | 79,1 |
| QNLI (v2) | 81,5 | 84,1 | 86,4 | 87,7 |
| RTE | 57,2 | 57,9 | 61,8 | 62,2 |
| WNLI | 62,3 | 62,3 | 62,3 | 62,3 |
| AX | 21,0 | 26,1 | 28,6 | 30,5 |

El fine-tuning se realizó durante 4 épocas, seleccionando los mejores hiperparámetros entre batch sizes {8, 16, 32, 64, 128} y learning rates {3e-4, 1e-4, 5e-5, 3e-5}. No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K, tareas para las que este modelo no está diseñado.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (4,4 M de parámetros ≈ 18 MB de pesos); en la práctica, el cuello de botella es el tamaño del lote y la longitud de secuencia, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM sirve; RTX 4090, A100 o H100 están sobredimensionadas para este modelo y solo tienen sentido para entrenamiento a gran escala o destilación.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU; también en CPU.
- Opciones de despliegue: PyTorch nativo, Hugging Face Transformers, JAX/Flax (el repo incluye pesos JAX), ONNX Runtime y llama.cpp no aplican directamente por ser encoder; vLLM y TGI no están orientados a este tipo de modelo.
- Latencia y throughput: no se han publicado cifras concretas en la información disponible; por el tamaño, se espera latencia de milisegundos en CPU para secuencias cortas.

## Comparativa con modelos similares

| Modelo | Parámetros | Capas / dim. oculta | Contexto | GLUE (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BERT-Tiny (este) | 4,4 M | 2 / 128 | 512 | 64,2 | Apache 2.0 | Hugging Face (réplica de google) |
| BERT-Mini | ~11 M (no confirmado) | 4 / 256 | 512 | 65,8 | Apache 2.0 | Hugging Face (google) |
| BERT-Small | ~29 M (no confirmado) | 4 / 512 | 512 | 71,2 | Apache 2.0 | Hugging Face (google) |
| BERT-Medium | ~41 M (no confirmado) | 8 / 512 | 512 | 73,5 | Apache 2.0 | Hugging Face (google) |

Los recuentos de parámetros de Mini, Small y Medium no están confirmados en la información proporcionada y se ofrecen como referencia aproximada de la familia. La comparación relevante es interna a la familia BERT Miniatures: a igualdad de licencia y disponibilidad, el salto de Tiny a Small supone +7 puntos de GLUE a cambio de un orden de magnitud más de parámetros.

## Limitaciones y advertencias

- Solo inglés y sin distinción de mayúsculas: no apto para producción multilingüe ni para texto en castellano.
- No es un modelo generativo: no puede usarse para chat, generación de código ni razonamiento; es un encoder para representaciones y clasificación.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de predicciones erróneas en clasificación, especialmente en tareas de razonamiento lingüístico (CoLA = 0,0 en GLUE).
- Rendimiento muy limitado en tareas que requieren comprensión profunda: CoLA 0,0, AX 21,0 y RTE 57,2 evidencian baja sensibilidad gramatical y de inferencia.
- Sesgos: al entrenarse con el corpus original de BERT, hereda los sesgos de género, raza y religión documentados para BERT-Base; no se han publicado evaluaciones de sesgo específicas para esta variante.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye "tal cual", sin garantías; el autor del repo réplica no ofrece soporte.
- El repositorio consultado tiene 0 descargas y 0 likes, lo que sugiere que no es la referencia canónica; para producción conviene usar el checkpoint oficial `google/bert_uncased_L-2_H-128_A-2`.
- No se dispone de información sobre cuantizaciones oficiales ni de pipeline declarado en el repo.
- Longitud de contexto de 512 tokens asumida por la configuración estándar de BERT; no confirmada explícitamente en la información disponible.

## Enlaces

- Repositorio Hugging Face (réplica): https://huggingface.co/ZCYDarren/bert_uncased_L-2_H-128_A-2
- Checkpoint original de Google: https://huggingface.co/google/bert_uncased_L-2_H-128_A-2
- Artículo de referencia: https://arxiv.org/abs/1908.08962
- Repositorio oficial de BERT (Google Research): https://github.com/google-research/bert/
- Familia completa BERT Miniatures (índice en la model card del repo original)
