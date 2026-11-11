# tahamajs/bert-comp-frandi-compressor-sst2

## Resumen

`bert-comp-frandi-compressor-sst2` es un checkpoint de BERT-base comprimido físicamente mediante la técnica `frandi_compressor` del framework NeuralOps, desarrollado por Taha Majlesi (tahamajs). Parte de `google-bert/bert-base-uncased` afinado en GLUE SST-2 (clasificación de sentimiento binaria) y aplica una compresión de rango bajo con rango `k=128`, seguida de un proceso de "curación" mediante LoRA (`r=8`, 50 pasos, `lr=2e-4`) para recuperar parte de la precisión perdida por la compresión. El resultado es un modelo de 45,78 millones de parámetros (frente a los 109,48 millones del original), lo que supone una reducción del 58,18 % y un ratio de compresión físico de 2,391x.

El modelo es relevante en el contexto de la investigación sobre compresión de modelos y despliegue eficiente de transformers en entornos con recursos limitados. No obstante, la precisión final en SST-2 (75,11 %) queda 16,52 puntos por debajo del profesor original (91,63 %), lo que lo sitúa como una pieza de experimentación más que como un modelo listo para producción. El repositorio incluye telemetría completa de la evaluación multi-rango (k=256, 128, 64, 32) y los artefactos necesarios para reconstruir la topología comprimida.

La arquitectura subyacente es un transformer encoder BERT-base (12 capas, dimensión oculta 768), con la particularidad de que el checkpoint serializado incorpora los factores de bajo rango y los adaptadores LoRA ya integrados en el `state_dict`. El modelo solo soporta inglés y está licenciado bajo MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), comprimido con `frandi_compressor` (rango k=128) + LoRA healing (r=8) |
| Parametros totales | 45.782.786 (comprimido); original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-base original: 512 tokens) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en `pytorch_model.bin`, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), requiere reconstrucción de topología con NeuralOps |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas y dimensión oculta 768 con 109,48 millones de parámetros, afinado previamente en GLUE SST-2. Sobre esa base se aplica el operador `frandi_compressor` del framework NeuralOps, que reduce físicamente el número de parámetros a 45,78 millones mediante descomposición de bajo rango con rango `k=128`. El proceso de compresión va seguido de una fase de "curación" con LoRA de rango 8 (50 pasos, `lr=2e-4`, presupuesto de 45 segundos) que se activa cuando la compresión zero-shot degrada la precisión más de 2,0 puntos y reduce los parámetros más de 1,10x.

La evaluación se realizó físicamente sobre una NVIDIA GeForce RTX 3090 (24 GB) usando el split de validación de GLUE SST-2 (872 muestras). El autor reporta resultados para cuatro rangos de compresión (k=256, 128, 64 y 32), con precisiones curadas que oscilan entre 66,51 % y 75,11 %. El checkpoint publicado corresponde a `k=128` por ser el punto de Pareto seleccionado. No se documentan en la información disponible detalles sobre el dataset de entrenamiento original del profesor, la composición del corpus de afinado ni si hubo RLHF o DPO (no aplicable en un clasificador BERT).

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) en inglés, específicamente sobre el dominio de GLUE SST-2.
- Generación de logits para dos clases mediante `BertForSequenceClassification` con `num_labels=2`.
- Inferencia en CPU y GPU tras reconstruir la topología comprimida con NeuralOps.
- No soporta tool calling ni function calling (es un clasificador, no un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (vocabulario `bert-base-uncased`).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en compresión de modelos: sirve como punto de referencia reproducible para comparar el operador `frandi_compressor` con otras técnicas (poda, cuantización, destilación) sobre una tarea estándar como SST-2.
- Despliegue en entornos con restricciones severas de memoria: con 45,78 millones de parámetros y un peso de 87,4 MB, cabe en dispositivos edge o contenedores con pocos recursos, a costa de una pérdida de precisión significativa.
- Docencia y experimentación con LoRA healing: el repositorio documenta el pipeline completo (compresión → evaluación zero-shot → curación LoRA) y permite reproducir el flujo paso a paso.
- Análisis de curvas de Pareto en compresión: la telemetría multi-rango (k=256, 128, 64, 32) permite estudiar el compromiso entre ratio de compresión y precisión en un transformer encoder.
- Clasificación de sentimiento de baja criticidad: en escenarios donde un 75 % de precisión sea aceptable (por ejemplo, filtrado preliminar de reseñas), el modelo puede usarse como primera etapa de un pipeline más complejo.
- Benchmarking de frameworks de compresión: útil para validar la integración de NeuralOps con `transformers` y `huggingface_hub` en pipelines de CI.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo / configuración | Ratio compresión | Params (reducción) | SST-2 val acc (zero-shot) | SST-2 val acc (curado LoRA) | Paridad vs profesor (91,63 %) |
|---|---:|---:|---:|---:|---:|
| BERT-base profesor | 1,00x | 109.483.778 | — | 91,63 % | — |
| frandi k=256 | 1,63x | 67.016.450 (-38,8 %) | 59,52 % | 66,51 % | -25,12 % |
| **frandi k=128 (publicado)** | **2,39x** | **45.782.786 (-58,2 %)** | **52,41 %** | **75,11 %** | **-16,52 %** |
| frandi k=64 | 3,11x | 35.165.954 (-67,9 %) | 51,38 % | 72,59 % | -19,04 % |
| frandi k=32 | 3,67x | 29.857.538 (-72,7 %) | 50,11 % | 70,76 % | -20,87 % |

Evaluación realizada sobre el split de validación de GLUE SST-2 (872 muestras) en una RTX 3090 (24 GB). No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (87,4 MB de pesos más activaciones de un encoder de 12 capas y contexto corto); en la práctica, cualquier GPU consumer moderna es suficiente.
- GPU recomendadas: no requiere GPU dedicada; una RTX 3090 (24 GB) fue la utilizada por el autor para la evaluación, pero el modelo cabe holgadamente en GPUs de 4-8 GB e incluso en CPU.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.) y en dispositivos edge con suficiente RAM.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El flujo oficial requiere `transformers` + `neuralops` para reconstruir la topología comprimida antes de cargar el `state_dict`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | SST-2 val acc | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| `tahamajs/bert-comp-frandi-compressor-sst2` (k=128) | 45,78 M | no disponible | 75,11 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor, afinado SST-2) | 109,48 M | 512 | 91,63 % | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,96 M | 512 | no disponible en la información proporcionada | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,48 M | 512 | no disponible en la información proporcionada | Apache 2.0 | Hugging Face |

La comparación con DistilBERT y con el checkpoint de TextAttack se ofrece como referencia de categoría (clasificadores SST-2 de tamaño medio), pero no se dispone de sus métricas exactas en la información proporcionada; no se inventan cifras.

## Limitaciones y advertencias

- Pérdida de precisión notable: 16,52 puntos por debajo del profesor original en SST-2 (75,11 % frente a 91,63 %), lo que lo hace inadecuado para producción sin validación adicional.
- El checkpoint no es cargable directamente con `AutoModel.from_pretrained`: requiere reconstruir la topología comprimida con `neuralops.core.compression_pipeline.compress_model` y cargar el `state_dict` con `strict=False`.
- Solo soporta inglés y está especializado en la tarea y el dominio de SST-2; no generaliza a otras tareas de clasificación sin reentrenamiento.
- Riesgo de alucinación no aplicable (es un clasificador), pero sí de clasificaciones erróneas en dominios distintos al de reseñas de cine.
- Sesgos heredados de `bert-base-uncased` y del corpus SST-2, no evaluados ni mitigados en la información disponible.
- Licencia MIT permite uso comercial, pero la ausencia de garantías y la degradación de precisión deben tenerse en cuenta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación comunitaria.
- La model card indica que los resultados de benchmarks no están verificados (`verified: false`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-frandi-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Código del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/
- Licencia MIT: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
