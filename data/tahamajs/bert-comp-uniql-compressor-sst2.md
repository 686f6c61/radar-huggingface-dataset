# tahamajs/bert-comp-uniql-compressor-sst2

## Resumen

`bert-comp-uniql-compressor-sst2` es un checkpoint de BERT-Base comprimido físicamente y posteriormente "curado" con LoRA, publicado por el usuario `tahamajs` como parte del denominado *NeuralOps Compressed & LoRA-Healed Model Zoo*. El modelo parte de `google-bert/bert-base-uncased` afinado sobre GLUE SST-2 (clasificación binaria de sentimiento en inglés) y le aplica el compresor `uniql_compressor` (`UniQLCompressor`), que combina SVD truncada conjunta con cuantización uniforme, almacenando los factores U, S y Vt en int8 dentro de módulos `UniQLinear`.

El resultado empaquetado corresponde al rango Pareto `k=256`, con una reducción de parámetros del 77,58 % (de 109.483.778 a 24.549.122) y un ratio de compresión físico de 4,46x. Sobre esa base comprimida se aplica un ajuste LoRA de recuperación (`r=8`, 50 pasos, `lr=2e-4`, presupuesto de 45 segundos) para paliar la caída de precisión del zero-shot.

La relevancia del modelo es fundamentalmente metodológica y de investigación: demuestra un pipeline reproducible de compresión agresiva con recuperación barata sobre una tarea estándar. No obstante, la precisión final (75,80 % en la validación de SST-2) queda 15,83 puntos por debajo del profesor original (91,63 %), lo que lo sitúa como artefacto de experimentación más que como candidato para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, dimensión oculta D=768) con capas lineales sustituidas por módulos `UniQLinear` (SVD truncada + cuantización int8) |
| Parametros totales | 24.549.122 (checkpoint comprimido); modelo base original: 109.483.778 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base BERT-Base admite hasta 512 tokens) |
| Tipos de cuantizacion | Cuantización uniforme int8 de los buffers U, S y Vt del compresor UniQL; no se documentan otros formatos (GGUF, GPTQ, AWQ) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch), más `config.json` y `compression_summary.json`; no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es un BERT-Base estándar (12 capas, 768 dimensiones ocultas) preentrenado por Google y afinado originalmente sobre GLUE SST-2. Sobre ese modelo, el compresor `uniql_compressor` sustituye las capas lineales por módulos `UniQLinear` que almacenan una descomposición SVD truncada de rango `k=256` con los factores cuantizados a int8. A diferencia de variantes de "copy back" que solo simulan la compresión, esta implementación reduce realmente el recuento de parámetros y la huella de memoria según el factor `(out + in) * r / (out * in)`.

El proceso de recuperación consiste en un ajuste LoRA de rango 8 durante 50 pasos con tasa de aprendizaje 2e-4 y un presupuesto de 45 segundos, aplicado únicamente cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x. La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras de validación de SST-2. No se documentan en la información disponible detalles sobre el dataset de preentrenamiento original, el volumen de tokens ni el uso de RLHF o DPO (el modelo base BERT no emplea estas técnicas).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, con dos etiquetas de salida (`num_labels=2`).
- Extracción de representaciones contextuales del encoder BERT comprimido, reutilizable para otras tareas de clasificación o *feature extraction*.
- Inferencia en CPU y GPU mediante el pipeline estándar de `transformers` tras reconstruir la topología comprimida con `compress_model`.
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No dispone de modo *thinking*, visión ni audio.
- Capacidad multilingüe limitada al inglés (vocabulario `bert-base-uncased`).
- No se documenta generación de texto libre (es un modelo de clasificación, no causal).

## Casos de uso

- **Investigación en compresión de modelos**: sirve como referencia reproducible para comparar el compresor `uniql_compressor` frente a otras técnicas (pruning, quantización, destilación) sobre una tarea estándar como SST-2, con telemetría completa en `compression_summary.json`.
- **Análisis de sentimiento en entornos con recursos muy limitados**: con 24,5 M de parámetros y pesos en int8, puede desplegarse en dispositivos *edge* o CPU para clasificar reseñas en inglés, aceptando la pérdida de precisión frente al profesor.
- **Filtrado previo en pipelines de datos**: usar el modelo como clasificador rápido de polaridad para preetiquetar grandes volúmenes de texto en inglés antes de un modelo mayor, aprovechando su bajo coste computacional.
- **Docencia y experimentación con LoRA**: el pipeline de "compresión + healing" con 50 pasos y 45 segundos de presupuesto es un caso práctico para enseñar recuperación barata de modelos comprimidos.
- **Validación de pipelines de despliegue**: útil para probar integraciones de `transformers` con checkpoints que requieren reconstrucción de topología personalizada (`compress_model` + `load_state_dict(strict=False)`).
- **Benchmark interno de latencia**: al tener un ratio de compresión 4,46x, permite medir el *trade-off* entre throughput y precisión en infraestructura propia antes de decidir si merece la pena comprimir modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre GLUE SST-2, split de validación (872 muestras), evaluados en RTX 3090:

| Rank (k) | Ratio físico | Params comprimidos | Zero-shot Acc | Acc con LoRA | Paridad vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| **256** (checkpoint publicado) | 4,46x | 24.549.122 (-77,6 %) | 60,32 % | **75,80 %** | -15,83 % |
| 128 | 4,46x | 24.549.122 (-77,6 %) | 55,05 % | 52,87 % | -38,76 % |
| 64 | 4,46x | 24.549.122 (-77,6 %) | 49,89 % | 51,61 % | -40,02 % |
| 32 | 4,46x | 24.549.122 (-77,6 %) | 53,10 % | 47,59 % | -44,04 % |

Precisión declarada en la model-index: 75,8 % de accuracy en GLUE SST-2 (validation), marcada como `verified: false`. El profesor original (`bert-base-uncased` afinado en SST-2) alcanza 91,63 % según el autor. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el checkpoint pesa aproximadamente 87,7 MB según la model card y el repositorio ocupa 0,1 GB, por lo que cabe holgadamente en cualquier GPU con más de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna; la evaluación del autor se realizó en una NVIDIA GeForce RTX 3090 (24 GB), aunque el modelo es enormemente sobredimensionado para ese hardware.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluso series 20xx o inferiores) y en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` + PyTorch con reconstrucción previa vía `neuralops.core.compression_pipeline.compress_model`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no hay pesos GGUF publicados).
- Latencia y throughput: no disponibles en la información proporcionada. El ajuste LoRA se completó en 45 segundos en RTX 3090, pero no se reportan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Params | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/bert-comp-uniql-compressor-sst2` | 24,5 M (comprimido) | no disponible | 75,80 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor afinado SST-2) | 109,5 M | 512 tokens | 91,63 % (según autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,5 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparación directa con DistilBERT o con el BERT afinado estándar no puede cerrarse con datos de esta ficha, ya que solo se dispone de la precisión del profesor reportada por el autor. En cualquier caso, el modelo comprimido ocupa una posición intermedia en tamaño (24,5 M) pero con una precisión notablemente inferior a la del profesor.

## Limitaciones y advertencias

- **Pérdida de precisión severa**: 75,80 % frente al 91,63 % del profesor, una caída de 15,83 puntos. No es apto para producción sensible a la calidad.
- **Resultados no verificados**: la métrica de la model-index está marcada como `verified: false` y procede del propio autor.
- **Inconsistencia en la tabla multi-rank**: los cuatro rangos reportan el mismo recuento de parámetros (24.549.122) y el mismo ratio (4,46x), lo que sugiere que la reducción efectiva no varía con `k` o que la telemetría no refleja el tamaño real por rango; conviene tratarlo con cautela.
- **Riesgo de alucinación**: inherente a BERT en clasificación; puede producir etiquetas erróneas con entradas ambiguas, sarcasmo o dominios distintos de reseñas de cine.
- **Idioma**: solo inglés; el tokenizador `bert-base-uncased` no está pensado para otros idiomas.
- **Contexto**: no se documenta la longitud máxima; el modelo base admite 512 tokens, pero no se confirma en este checkpoint.
- **Restricciones de licencia**: MIT, permite uso comercial, pero el modelo base `bert-base-uncased` es Apache 2.0; conviene revisar la compatibilidad y atribuciones.
- **Dependencia de `neuralops`**: la carga requiere reconstruir la topología con la librería NeuralOps antes de aplicar el state dict; no es un checkpoint estándar de `transformers` y no funciona con `from_pretrained` directo.
- **Sesgos**: no se documentan análisis de sesgo; al derivar de BERT-Base y SST-2, hereda los sesgos del corpus de reseñas de cine y del preentrenamiento original.
- **Madurez**: repositorio con 0 descargas y 0 likes, creado en noviembre de 2026; sin comunidad ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-uniql-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/uniql_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
