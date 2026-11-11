# tahamajs/bert-comp-flat-llm-sst2

## Resumen

`tahamajs/bert-comp-flat-llm-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) comprimido físicamente y posteriormente "curado" mediante LoRA, publicado por el autor tahamajs dentro del ecosistema NeuralOps. El modelo parte de un BERT-Base fine-tuneado para clasificación de sentimiento en GLUE SST-2 y le aplica el compresor `flat_llm` (`FLATLLMCompressor`), una técnica experimental de poda de canales de salida consciente de las activaciones que reduce el número de parámetros de 109.483.778 a 84.004.322 (un 23,27 % menos, ratio de compresión físico de 1,303x).

El resultado es un clasificador binario de sentimiento (negativo/positivo) para inglés, con una precisión del 78,10 % en el split de validación de SST-2 tras aplicar un "healing" con LoRA de rango 8. Es un modelo de carácter experimental y de nicho: su interés no reside en el rendimiento absoluto (queda 13,53 puntos por debajo del profesor original, que alcanza 91,63 %), sino en servir como artefacto reproducible de investigación sobre compresión de modelos y recuperación de precisión mediante adaptadores de bajo rango.

El modelo es relevante para quienes investigan técnicas de compresión (poda estructurada, sparsity 2:4, factorización) y quieren un ejemplo verificable de la relación entre ratio de compresión y degradación de downstream accuracy. No está pensado para producción: la licencia es MIT, el idioma es únicamente inglés y el pipeline declarado es `text-classification`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), 12 capas, dimensión oculta D=768 |
| Parametros totales | 84.004.322 (comprimido; base original 109.483.778) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (tokenizer estándar `bert-base-uncased`, límite habitual de 512 tokens) |
| Tipos de cuantizacion | no disponible (checkpoint en `pytorch_model.bin`; el compresor menciona sparsity estructurada 2:4 opcional, solo a nivel de cómputo) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); requiere reconstrucción de la topología con NeuralOps |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder BERT-Base estándar (12 capas, dimensión 768, 109.483.778 parámetros) preentrenado por Google y fine-tuneado para clasificación de sentimiento en GLUE SST-2. Sobre ese modelo, NeuralOps aplica el compresor `flat_llm`, que realiza poda de canales de salida consciente de las activaciones: primero recoge la energía por canal de salida a partir de activaciones de calibración, luego ordena los canales por energía, conserva los top-k (`k = round(keep_ratio * out_features)`) y sustituye cada capa `Linear` por una `PrunedChannelLinear` con almacenamiento factorizado. Opcionalmente puede aplicar sparsity estructurada 2:4, aunque esta solo aporta ahorro de cómputo si se usa un kernel disperso.

El checkpoint publicado corresponde al rango `k=32` (el "showcase rank"), con un ratio de compresión físico de 1,303x y una reducción del 23,27 % de parámetros. La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de SST-2 (872 muestras). Cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps aplica un "healing" con LoRA de rango 8 (50 pasos, `lr=2e-4`, presupuesto de 45 segundos), que eleva la precisión del 69,27 % (zero-shot) al 78,10 % final. No se documenta en la información disponible el volumen de tokens de entrenamiento ni la composición del dataset más allá de GLUE SST-2.

## Capacidades

- Clasificación binaria de sentimiento (negativo/positivo) en inglés, sobre textos de una sola frase o párrafo corto.
- Generación de logits de dos clases mediante `BertForSequenceClassification`, apto para integrarse en pipelines de Hugging Face Transformers.
- Inferencia en modo evaluación (`model.eval()`) con tokenizer estándar `bert-base-uncased`.
- Reconstrucción programática de la topología comprimida mediante `compress_model` de NeuralOps antes de cargar el state dict.
- No soporta tool calling ni function calling (es un clasificador, no un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (solo inglés).
- No dispone de thinking mode, visión ni audio.

## Casos de uso

- Investigación en compresión de modelos: sirve como artefacto reproducible para estudiar el compromiso entre ratio de compresión (1,303x) y degradación de downstream accuracy (-13,53 puntos frente al profesor), comparando las cuatro variantes de rango evaluadas (k=256, 128, 64, 32).
- Análisis de sentimiento en inglés sobre reseñas cortas: clasificación binaria de opiniones en dominios como críticas de producto o comentarios, con la salvedad de que la precisión del 78,10 % limita su uso a escenarios tolerantes a error.
- Benchmarking de pipelines de "healing" con LoRA: permite validar empíricamente cómo un adaptador de rango 8 y 50 pasos recupera 8,83 puntos de precisión (de 69,27 % a 78,10 %) sobre un modelo podado.
- Docencia y experimentación con poda estructurada: ejemplo práctico de poda de canales consciente de activaciones y de almacenamiento factorizado con `PrunedChannelLinear`.
- Pruebas de integración de la librería NeuralOps: el checkpoint incluye `compression_summary.json` con telemetría de todos los rangos, útil para validar la reconstrucción y la carga del state dict en entornos de CI.
- Comparación de estrategias de compresión: al estar construido sobre un BERT-Base estándar, permite contrastar `flat_llm` con otras técnicas de compresión sobre el mismo modelo y dataset (SST-2).

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente; `verified: false`).

| Metrica | Valor |
|---|---|
| GLUE SST-2 Validation Accuracy (modelo final, k=32, con LoRA) | 78,10 % |
| GLUE SST-2 Validation Accuracy (zero-shot, sin healing) | 69,27 % |
| Teacher Baseline (BERT-Base original) | 91,63 % |
| Parity vs Teacher | -13,53 % |
| Muestras de evaluación | 872 (split de validación SST-2) |
| Hardware de evaluación | NVIDIA GeForce RTX 3090 (24 GB) |

| Rank (k) | Ratio fisico | Parametros comprimidos | Zero-shot Acc | Healed Acc | Parity vs Teacher |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,30x | 84.004.322 (-23,3 %) | 69,27 % | 78,10 % (LoRA) | -13,53 % |
| 128 | 1,30x | 84.004.322 (-23,3 %) | 69,27 % | 78,10 % (LoRA) | -13,53 % |
| 64 | 1,30x | 84.004.322 (-23,3 %) | 69,27 % | 78,10 % (LoRA) | -13,53 % |
| 32 | 1,30x | 84.004.322 (-23,3 %) | 69,27 % | 78,10 % (LoRA) | -13,53 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 160,8 MB y el modelo comprimido tiene 84 millones de parámetros; en FP32 ocupa aproximadamente 336 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; la evaluación oficial se hizo en una NVIDIA GeForce RTX 3090 (24 GB), aunque el modelo es sobredimensionado para ese hardware.
- Cabe en GPU consumer: sí, en cualquier RTX (incluso series 20/30/40 de gama baja) y en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: requiere la librería NeuralOps para reconstruir la topología comprimida antes de cargar el state dict; no se documenta soporte directo en vLLM, llama.cpp, Ollama ni TGI (el formato es `pytorch_model.bin` y la topología `PrunedChannelLinear` no es estándar de Transformers).
- Latencia y throughput: no disponibles en la información proporcionada. El "healing" con LoRA se ejecutó con un presupuesto de 45 segundos (50 pasos, `lr=2e-4`, `r=8`) en la RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 Acc | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-comp-flat-llm-sst2` | 84.004.322 (comprimido) | no disponible | 78,10 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (teacher) | 109.483.778 | 512 tokens (habitual) | 91,63 % (según el autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 millones | 512 tokens | no disponible en la información proporcionada | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109 millones | 512 tokens | no disponible en la información proporcionada | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos de la misma categoría (clasificadores BERT para SST-2). No se dispone de datos de benchmarks de las alternativas en la información proporcionada, por lo que solo se comparan parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Degradación significativa de precisión: 78,10 % frente al 91,63 % del profesor, una pérdida de 13,53 puntos que lo hace inadecuado para producción sin validación adicional.
- Modelo experimental: la model card lo etiqueta explícitamente como `experimental`; no hay garantías de estabilidad ni de soporte.
- Solo inglés: no soporta otros idiomas, lo que restringe su uso a textos en inglés.
- Dependencia de la librería NeuralOps: la carga requiere reconstruir la topología con `compress_model` y `load_state_dict(strict=False)`, lo que añade fragilidad y acoplamiento a una librería de terceros.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede producir clasificaciones erróneas en entradas ambiguas, sarcásticas o fuera de dominio.
- Sesgos: hereda los sesgos del corpus de preentrenamiento de BERT-Base y de SST-2 (reseñas de películas), por lo que su comportamiento en otros dominios puede degradarse.
- Licencia MIT: permite uso comercial, pero el modelo base BERT-Base está bajo Apache 2.0, cuyas condiciones deben respetarse.
- Datos de benchmark no verificados: el resultado del 78,10 % está marcado como `verified: false` en el model-index.
- Sin métricas de latencia ni throughput publicadas: no se puede planificar capacidad de producción con los datos disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-flat-llm-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor `flat_llm`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/experimental/flat_llm.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
