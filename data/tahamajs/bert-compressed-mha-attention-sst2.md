# tahamajs/bert-compressed-mha-attention-sst2

## Resumen

El modelo `tahamajs/bert-compressed-mha-attention-sst2` es una variante de `google-bert/bert-base-uncased` en la que las 12 capas de self-attention multi-cabeza estándar han sido sustituidas por el mecanismo `compressed_mha_attention` de la librería NeuralOps. Lo desarrolla Taha Majlesi (tahamajs) como parte de un "attention zoo" de BERT con mecanismos de atención subcuadráticos, orientado a la experimentación con arquitecturas de atención eficientes mediante destilación de conocimiento.

El modelo se ha destilado sobre WikiText-2 con un pipeline de tres etapas (calibración Ridge en forma cerrada, MSE/CKA de subespacio con backbone congelado y KD de logits fusionada con LR diferencial) durante 300 segundos en una NVIDIA RTX 3090. El resultado es un checkpoint de tipo `fill-mask` en inglés, con licencia MIT, pensado para investigación y evaluación comparativa de mecanismos de atención, no como modelo de producción.

Es relevante ahora porque ejemplifica una línea de trabajo activa: reemplazar atención cuadrática por alternativas comprimidas preservando el comportamiento del modelo original mediante destilación, con un coste de entrenamiento muy bajo (5 minutos en una GPU de consumo). No obstante, los resultados publicados presentan anomalías graves (perplejidad reportada de 0.00) que deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con 12 capas de `compressed_mha_attention` (sustitución del MHA estándar) |
| Parametros totales | no disponible (el modelo base `bert-base-uncased` tiene ~110 M; el autor no reporta el recuento del checkpoint destilado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 512 tokens; el autor no lo especifica para esta variante) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,4 GB; la model card no detalla safetensors, GGUF ni otros formatos) |

## Arquitectura y entrenamiento

Se parte de `bert-base-uncased` (transformer encoder de 12 capas) y se reemplazan todas las capas de self-attention multi-cabeza por el mecanismo `compressed_mha_attention` de NeuralOps, etiquetado por el autor como atención subcuadrática. El resto del backbone (embeddings, feed-forward, normalización) se mantiene del modelo original. El checkpoint resultante se distribuye con `custom_code`, por lo que requiere la librería NeuralOps para cargarse correctamente.

El entrenamiento consiste en una destilación de conocimiento sobre WikiText-2 en tres etapas: (1) calibración Ridge en forma cerrada, (2) MSE/CKA de subespacio con backbone congelado y (3) KD de logits fusionada con learning rate diferencial. La telemetría reportada es de 300 segundos, 157 pasos, 24.843,2 tokens/s y 8.487 MB de VRAM pico en una RTX 3090. No se documentan número de tokens de entrenamiento, composición exacta del dataset más allá de WikiText-2, ni uso de RLHF/DPO (no aplicable a un modelo encoder de enmascaramiento).

## Capacidades

- Enmascaramiento de tokens (`fill-mask`) en inglés, heredado de la tarea de `bert-base-uncased`.
- Representaciones contextuales de tokens para tareas downstream de NLP (clasificación, NER, extracción de features).
- Atención subcuadrática mediante `compressed_mha_attention`, orientada a reducir el coste computacional frente al MHA estándar.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe (solo inglés).
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación comparativa de mecanismos de atención: el modelo sirve como punto de comparación frente a `bert-base-uncased` para medir el impacto de `compressed_mha_attention` en tareas de enmascaramiento sobre WikiText-2, usando la métrica MLM-PPL definida por el autor.
- Prototipado de pipelines `fill-mask` en inglés: mediante `transformers.pipeline("fill-mask", ...)` se puede integrar en demos de autocompletado o corrección de texto, siempre validando la calidad real frente al baseline.
- Extracción de embeddings para clasificación de texto: al conservar el backbone de BERT-base, puede emplearse como extractor de features en tareas downstream en inglés, con la advertencia de que la atención sustituida puede alterar las representaciones.
- Benchmarking de eficiencia de atención: útil para medir latencia y consumo de memoria de `compressed_mha_attention` frente a MHA estándar en la misma GPU, dado que el autor reporta throughput y VRAM de entrenamiento.
- Docencia y experimentación con destilación: el pipeline de tres etapas y su telemetría (157 pasos, 5 minutos, RTX 3090) lo convierten en un ejemplo reproducible de KD de bajo coste para cursos o laboratorios.
- Base para fine-tuning en tareas de NLP en inglés: puede servir de inicialización para clasificación o NER, aunque se recomienda comparar contra `bert-base-uncased` antes de adoptarlo en producción.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (MLM-PPL determinista sobre WikiText-2, 15 % de enmascaramiento, `seed=42`):

| Fase de evaluacion | MLM Perplexity | Precision en tokens enmascarados | Delta vs baseline |
|---|---|---|---|
| BERT teacher (`bert-base-uncased`) | 6,84 | 68,42 % | referencia |
| Stage 0 (calibracion Ridge en forma cerrada) | 0,00 | 48,62 % | -6,84 |
| Stage 2 (modelo destilado) | 0,00 | 50,92 % | -6,84 |

Advertencia: una perplejidad de 0,00 es matemáticamente inconsistente con una precisión de enmascaramiento del 50,92 % y sugiere un error en la métrica o en el reporte. La precisión del modelo destilado (50,92 %) es sustancialmente inferior a la del teacher (68,42 %). No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, GLUE, SQuAD) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento reportó 8.487 MB pico en una RTX 3090. Para inferencia de un encoder de ~110 M de parámetros se espera un consumo muy inferior, pero el autor no lo documenta.
- GPU recomendadas: no disponible; el autor solo cita la NVIDIA RTX 3090 24 GB usada para la destilación (clúster Sharif HPC).
- GPU de consumo: por el tamaño del backbone (BERT-base), es plausible que quepa en GPUs de consumo con 8 GB o menos, pero no hay confirmación en la información disponible.
- Opciones de despliegue: `transformers.pipeline("fill-mask")` y la API `neuralops.load_pretrained_bert(attention_type="compressed_mha_attention", task="masked-lm")`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor reporta 24.843,2 tokens/s durante el entrenamiento en RTX 3090; no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-compressed-mha-attention-sst2` | no disponible (~110 M en el base) | no disponible (base: 512) | fill-mask | MIT | Hugging Face, requiere NeuralOps |
| `google-bert/bert-base-uncased` | ~110 M | 512 | fill-mask / encoder | Apache 2.0 | Hugging Face, transformers estándar |
| `distilbert-base-uncased` | ~66 M | 512 | fill-mask / encoder | Apache 2.0 | Hugging Face, transformers estándar |
| `roberta-base` | ~125 M | 512 | fill-mask / encoder | MIT | Hugging Face, transformers estándar |

La comparación de rendimiento frente a estas alternativas no está disponible: el autor solo compara contra su teacher `bert-base-uncased` con la métrica propia MLM-PPL, sin datos en GLUE, SQuAD ni otros benchmarks estándar.

## Limitaciones y advertencias

- Los resultados publicados incluyen una perplejidad de 0,00 que es inconsistente con la precisión reportada; no deben tomarse como evidencia de calidad del modelo.
- La precisión en tokens enmascarados del modelo destilado (50,92 %) es notablemente inferior a la del teacher (68,42 %), lo que sugiere una degradación sustancial tras la destilación.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Requiere `custom_code` y la librería NeuralOps; no es cargable con `transformers` estándar sin ese código personalizado, lo que complica su integración en pipelines de producción.
- No se documentan sesgos conocidos, pero al derivar de `bert-base-uncased` y entrenarse solo en WikiText-2, hereda los sesgos del corpus original y no incorpora mitigaciones.
- Riesgo de alucinación: al ser un modelo de enmascaramiento (no generativo libre), el riesgo se limita a predicciones de tokens incorrectas, no a generación abierta.
- No hay información sobre cuantizaciones, formatos de pesos alternativos ni compatibilidad con motores de inferencia de alto rendimiento.
- Uso comercial: la licencia MIT lo permite, pero la ausencia de benchmarks estándar y las anomalías en las métricas desaconsejan su uso en producción sin validación propia.
- El nombre del repo incluye `sst2`, pero la model card no documenta entrenamiento ni evaluación en SST-2; posible inconsistencia de nomenclatura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-compressed-mha-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
