# tahamajs/bert-gated-hybrid-kernel-attention-sst2

## Resumen

El modelo `tahamajs/bert-gated-hybrid-kernel-attention-sst2` es una variante de `google-bert/bert-base-uncased` en la que se han sustituido las 12 capas de atención multi-cabeza estándar por el mecanismo `gated_hybrid_kernel_attention`, desarrollado dentro de la librería NeuralOps. Lo publica Taha Majlesi (usuario `tahamajs`) como parte de un "Attention Zoo" de BERT con mecanismos de atención subcuadráticos, orientado a experimentación con alternativas a la atención cuadrática clásica. La tarea declarada en el Hub es `fill-mask` y el modelo está pensado para inglés.

El modelo se ha destilado sobre WikiText-2 mediante un pipeline de destilación de conocimiento en tres etapas (calibración Ridge en forma cerrada, MSE/CKA de subespacio con backbone congelado y KD de logits fusionado con LR diferencial) durante 300 segundos en una NVIDIA RTX 3090. El repositorio ocupa 0,4 GB y se distribuye bajo licencia MIT.

Su relevancia es fundamentalmente experimental: sirve como banco de pruebas reproducible para comparar mecanismos de atención subcuadráticos frente a la atención estándar de BERT, no como un modelo listo para producción. Los resultados reportados por el autor muestran una degradación notable en precisión de tokens enmascarados respecto al profesor, lo que conviene tener en cuenta antes de reutilizarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT con 12 capas de `gated_hybrid_kernel_attention` en lugar de atención multi-cabeza estándar |
| Parametros totales | no disponible (el modelo base `bert-base-uncased` tiene ~110 M, pero el autor no reporta el recuento de la variante) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 512 tokens, pero el autor no lo especifica para esta variante) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio con `custom_code`, librería `neuralops`) |

## Arquitectura y entrenamiento

Se parte de `bert-base-uncased` y se reemplazan las 12 capas de self-attention multi-cabeza por el mecanismo `gated_hybrid_kernel_attention` de NeuralOps, un esquema de atención subcuadrática con componentes de tipo kernel y compuertas. El resto del encoder BERT (embeddings, feed-forward, normalización) se mantiene. El modelo requiere `custom_code` y la librería `neuralops` para cargarse, por lo que no es un checkpoint de Transformers estándar sin dependencias adicionales.

El entrenamiento consiste en una destilación de conocimiento sobre WikiText-2 con un currículo de tres etapas: Stage 0 (calibración Ridge en forma cerrada), Stage 1 (MSE/CKA de subespacio con backbone congelado) y Stage 2 (KD de logits fusionado con learning rate diferencial). La ejecución reportada duró 300 segundos (132 pasos, ~20.065 tokens/s, 23.021 MB de VRAM pico) en una RTX 3090. No se detalla el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de WikiText-2.

## Capacidades

- Relleno de máscaras (`fill-mask`) en inglés, que es la tarea declarada en el Hub.
- Codificación de texto tipo BERT reutilizable para extracción de características o fine-tuning posterior, siempre que se use la implementación de NeuralOps.
- Sustitución experimental de atención cuadrática por atención subcuadrática, útil para estudiar el impacto en calidad y coste.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe: no disponible; solo se declara inglés.

## Casos de uso

- Investigación sobre mecanismos de atención: comparar `gated_hybrid_kernel_attention` con la atención estándar de BERT en tareas de MLM controladas, usando el mismo tokenizador y dataset.
- Reproducción de experimentos de destilación: el pipeline de tres etapas y la telemetría de hardware permiten replicar el entrenamiento en una GPU de consumo.
- Benchmark de eficiencia de atención: medir latencia y memoria frente a `bert-base-uncased` en secuencias largas para evaluar la promesa subcuadrática.
- Docencia y formación: ejemplo práctico de cómo sustituir capas de atención en un transformer preentrenado y destilar el resultado.
- Pruebas de integración con la librería NeuralOps: validar la API `neuralops.load_pretrained_bert` y el pipeline `fill-mask` en entornos de desarrollo.
- Prototipado de clasificación de texto (por ejemplo, análisis de sentimiento, dado el sufijo `sst2` del nombre) tras un fine-tuning específico, aunque el autor no reporta métricas de SST-2.

## Benchmarks y rendimiento

Evaluación reportada por el autor mediante pseudo-perplejidad determinista de MLM en WikiText-2 (15 % de tokens enmascarados, `seed=42`):

| Fase | MLM PPL | Precisión token enmascarado (%) | Delta vs baseline |
|---|---:|---:|---:|
| Profesor `bert-base-uncased` | 6,84 | 68,42 | referencia |
| Stage 0 (Ridge en forma cerrada) | 0,00 | 51,38 | -6,84 |
| Stage 2 (modelo destilado) | 0,00 | 51,38 | -6,84 |

Advertencia: el valor de perplejidad `0.00` es anómalo y no es interpretable como una mejora real; la precisión de tokens enmascarados cae ~17 puntos respecto al profesor. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,4 GB) y la base BERT (~110 M de parámetros) cabría esperar un consumo moderado, pero el autor no lo reporta.
- GPU recomendadas: no disponible. El entrenamiento se realizó en una NVIDIA RTX 3090 de 24 GB.
- Cabe en GPU de consumo: probablemente sí, dada la base BERT, aunque no hay cifras confirmadas.
- Opciones de despliegue: `neuralops` (API recomendada) y `transformers` con `pipeline("fill-mask")` y `trust_remote_code`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles para inferencia; en entrenamiento se reportan ~20.065 tokens/s en RTX 3090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-gated-hybrid-kernel-attention-sst2` | no disponible (base ~110 M) | no disponible (base 512) | fill-mask | MIT | Hugging Face, requiere `neuralops` |
| `google-bert/bert-base-uncased` | ~110 M | 512 | fill-mask / encoder | Apache 2.0 | Hugging Face, Transformers estándar |
| `distilbert-base-uncased` | ~66 M | 512 | fill-mask / encoder | Apache 2.0 | Hugging Face, Transformers estándar |
| `google/electra-base-discriminator` | ~110 M | 512 | encoder / MLM | Apache 2.0 | Hugging Face, Transformers estándar |

La comparación directa de rendimiento con estas alternativas no está disponible en la información proporcionada; solo se conoce la comparación frente a su profesor `bert-base-uncased` en WikiText-2.

## Limitaciones y advertencias

- Degradación de calidad: la precisión de tokens enmascarados cae del 68,42 % al 51,38 % respecto al profesor, según el propio autor.
- Perplejidad reportada de `0.00`, valor no interpretable que sugiere un problema de métrica o de implementación en la evaluación; no debe tomarse como indicador de rendimiento.
- Solo inglés; sin soporte multilingüe declarado.
- Requiere `custom_code` y la librería `neuralops`; no es un checkpoint estándar de Transformers sin dependencias externas.
- Sin datos publicados sobre sesgos, alucinación, robustez o comportamiento en producción.
- Entrenamiento muy corto (300 s, 132 pasos) sobre un único dataset (WikiText-2); riesgo alto de sobreajuste o infraentrenamiento.
- Aunque la licencia es MIT, la ausencia de validación independiente desaconseja su uso en producción sin evaluación propia.
- El nombre del repositorio incluye `sst2`, pero no se reportan métricas de SST-2; no asumir fine-tuning para clasificación de sentimiento.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-gated-hybrid-kernel-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
