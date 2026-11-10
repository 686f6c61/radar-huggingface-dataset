# tahamajs/bert-kda-attention-sst2

## Resumen

`bert-kda-attention-sst2` es un checkpoint de `bert-base-uncased` en el que las 12 capas de atención softmax cuadrática del transformer original han sido sustituidas por el mecanismo `kda_attention` de la librería NeuralOps, con el objetivo de reducir la complejidad operativa de O(N²) a O(N) o O(N log N). Lo publica Taha Majlesi (usuario `tahamajs`) como parte de su "Subquadratic Attention Zoo" sobre GLUE, y está afinado para clasificación binaria de sentimiento en SST-2. El modelo base tiene 110 millones de parámetros y la arquitectura subyacente sigue siendo un transformer encoder de BERT.

La relevancia del artefacto no está en su rendimiento absoluto, sino en su planteamiento de serialización: el repositorio no redistribuye los 450 MB de pesos de BERT, sino únicamente los pesos de atención destilados y la cabeza de clasificación en FP16, unos 55 MB, que se aplican en tiempo de carga sobre el modelo base congelado mediante un shim de código remoto (`modeling_neuralops_bert.py`). Es, por tanto, un experimento de destilación con protocolo de representaciones cacheadas (NeuralOps Cached Representation Distillation) ejecutado en una única RTX 3090.

El resultado declarado es una accuracy del 78,56 % en el split de validación de SST-2, frente al 91,63 % del profesor `bert-base-uncased` y al 52,98 % del estudiante antes de destilar. Es un modelo de investigación, con 0 descargas y 0 likes en el momento de redactar esta ficha, y no debe confundirse con un clasificador listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atención `kda_attention` (subcuadrática) en las 12 capas |
| Parametros totales | 110 M (base `bert-base-uncased`); pesos distribuidos: ~55 MB en FP16 (solo atención + cabeza de clasificación) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base BERT admite 512 tokens; el autor no lo especifica para este checkpoint) |
| Tipos de cuantizacion | no disponible; los pesos se publican en FP16 (`attention_only_fp16`) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16, ~55 MB) + shim de código remoto Python |
| Libreria | `neuralops` (carga también vía `transformers` con `trust_remote_code=True`) |
| Modelo base | `google-bert/bert-base-uncased` |
| Tarea | Clasificación de secuencias binaria (SST-2: negativo / positivo) |
| Hardware de entrenamiento | NVIDIA GeForce RTX 3090 24 GB |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 768 de dimensión oculta, 12 cabezas) y sustituye la atención multi-cabeza estándar por `kda_attention`, un mecanismo de la familia de atención subcuadrática de NeuralOps que, según el autor, alcanza complejidad efectiva O(N) u O(N log N) frente a la O(N²) de la MHA clásica. El resto del encoder (embeddings, feed-forward, normalizaciones) permanece congelado y se reconstruye en tiempo de carga desde el checkpoint original de BERT.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol": una primera etapa de alineamiento de subespacio oculto y una segunda de destilación por KL sobre logits más entropía cruzada de la tarea. El profesor se ejecuta offline y sus representaciones se cachean, de modo que no ocupa VRAM durante el entrenamiento del estudiante. El proceso completo consta de 138 pasos de optimización, dura 50,1 segundos, alcanza un throughput de 22.582,4 tokens/s y un pico de 14.485 MB de VRAM en una RTX 3090 (Ampere). No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset más allá de GLUE/SST-2.

## Capacidades

- Clasificación binaria de sentimiento en inglés (SST-2): etiquetas 0 (negativo) y 1 (positivo).
- Extracción de representaciones contextuales de secuencias cortas en inglés mediante el encoder BERT modificado.
- Inferencia con la API estándar de `transformers` (`AutoModelForSequenceClassification` con `trust_remote_code=True`).
- Carga modular mediante la API de NeuralOps (`load_pretrained_bert(attention_type="kda_attention", task="sequence-classification")`).
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso: es exclusivamente un clasificador.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- **Análisis de sentimiento en reseñas de producto en inglés**: clasificación binaria de opiniones cortas, el escenario exacto para el que fue entrenado (SST-2), siempre que se acepte una accuracy de ~78,5 % y no se requiera el ~91,6 % de BERT-base.
- **Investigación sobre atención subcuadrática**: banco de pruebas para comparar `kda_attention` frente a softmax cuadrática en una tarea controlada de GLUE, con un checkpoint reproducible en una sola GPU de consumo.
- **Estudio de destilación con representaciones cacheadas**: reproducción del protocolo NeuralOps (alineamiento de subespacio + KL + CE) para medir la brecha profesor-estudiante en 138 pasos y 50 segundos de cómputo.
- **Prototipado rápido de pipelines de clasificación**: al pesar ~55 MB, el checkpoint se descarga y carga en segundos, lo que facilita iterar sobre preprocesado y umbrales antes de invertir en un modelo mayor.
- **Docencia y experimentación con `trust_remote_code`**: ejemplo práctico de checkpoint con código remoto y pesos parciales que se reconstruyen sobre un modelo base congelado.
- **Evaluación de eficiencia memoria/tiempo en RTX 3090**: referencia de consumo (14,5 GB de pico en entrenamiento, 22,5k tokens/s) para comparar implementaciones de atención subcuadrática.
- **Filtrado de reseñas a gran escala en inglés como primera pasada**: útil si se combina con un segundo clasificador más preciso para las muestras de baja confianza, dado su bajo coste de despliegue.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras binarias), según la model card:

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`kda_attention`) | Modelo destilado |
|---|---:|---:|---:|
| Accuracy SST-2 | 91,63 % | 52,98 % | **78,56 %** |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,6813 |
| Delta de accuracy vs. profesor | — | −38,65 pp | **−13,07 pp** |

Telemetría de entrenamiento declarada por el autor: 138 pasos, 50,1 s, 22.582,4 tokens/s, pico de 14.485 MB de VRAM en RTX 3090. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM en inferencia**: no especificada por el autor. Como referencia, BERT-base en FP32 ocupa ~440 MB de pesos; el checkpoint adicional de atención en FP16 añade ~55 MB. La inferencia cabe holgadamente en cualquier GPU con 2 GB o más.
- **GPU recomendadas**: cualquier GPU consumer moderna (RTX 3060, 4060, 4090) es suficiente; el autor entrenó en una RTX 3090 de 24 GB, pero ese requisito corresponde al entrenamiento, no a la inferencia.
- **Cabe en GPU consumer**: sí, en todas las GPU consumer con al menos ~2 GB de VRAM.
- **Opciones de despliegue**: `transformers` con `trust_remote_code=True` (vía principal); API `neuralops.hub.bert_zoo`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (el formato es `safetensors` parcial, no GGUF).
- **Latencia y throughput**: no disponibles para inferencia. Solo se publica throughput de entrenamiento (22.582,4 tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/bert-kda-attention-sst2` | 110 M (55 MB destilados) | no disponible | 78,56 % | MIT | Hugging Face (0 descargas) |
| `google-bert/bert-base-uncased` (profesor, fine-tuned SST-2) | 110 M | 512 | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` (referencia de la comunidad) | 110 M | 512 | no disponible en esta información | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | no disponible en esta información | Apache 2.0 | Hugging Face |

La comparación directa solo es posible con el profesor, cuyos números publica el propio autor. Frente a él, el checkpoint subcuadrático pierde 13,07 puntos de accuracy a cambio de una complejidad asintótica menor y un artefacto de 55 MB. Los demás modelos comparables se incluyen como referencia de categoría; no se dispone de sus métricas en la información proporcionada.

## Limitaciones y advertencias

- **Rendimiento muy inferior al profesor**: 78,56 % frente a 91,63 % en SST-2; una caída de 13 puntos es sustancial para producción.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí hay riesgo de clasificaciones erróneas con alta confianza; la entropía cruzada de validación (0,6813) indica una calibración peor que la del profesor (0,2428).
- **Solo inglés**: el modelo base y el dataset son en inglés; no hay evidencia de comportamiento en otros idiomas.
- **Contexto no documentado**: aunque BERT-base admite 512 tokens, el autor no especifica la longitud efectiva con `kda_attention`; conviene validarla antes de usarlo con secuencias largas.
- **Dependencia de código remoto**: requiere `trust_remote_code=True` y descarga el shim `modeling_neuralops_bert.py`, lo que implica revisar y confiar en el código del autor antes de ejecutarlo.
- **Pesos parciales**: el repositorio no contiene BERT completo; la reconstrucción depende de que `bert-base-uncased` siga disponible en el Hub.
- **Madurez**: 0 descargas, 0 likes, creado y actualizado el mismo día (2026-11-09); sin validación externa ni revisión por pares.
- **Licencia MIT**: permisiva para uso comercial, pero el modelo base `bert-base-uncased` se distribuye bajo Apache 2.0, cuyos términos deben respetarse igualmente.
- **Sesgos**: no documentados por el autor; hereda los sesgos de BERT-base y de SST-2 (reseñas de películas en inglés).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-kda-attention-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/sst2
