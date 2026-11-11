# tahamajs/bert-comp-fp8-sst2

## Resumen

`tahamajs/bert-comp-fp8-sst2` es un checkpoint de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2 y posteriormente procesado con el compresor `FP8Compressor` de la librería NeuralOps. El modelo lo publica Taha Majlesi (usuario `tahamajs`) como parte de su "Compressor Zoo", un conjunto de experimentos de compresión de modelos con cuantización y recuperación mediante LoRA. La arquitectura subyacente es un transformer encoder BERT-base de 12 capas y dimensión oculta 768, con 109.483.778 parámetros.

El interés del artefacto no está en el modelo en sí (es un BERT-base estándar para una tarea trivial de clasificación binaria), sino en la metodología: cuantización post-entrenamiento a FP8 con formatos `e4m3`/`e5m2` y escalado `per_tensor`/`per_channel`, evaluada en cuatro rangos de compresión (k=256, 128, 64, 32) sobre las 872 muestras del split de validación de SST-2. En todos los rangos el ratio de compresión físico es 1.00x (0,0% de reducción de parámetros), lo que indica que la cuantización FP8 no reduce el recuento de parámetros, solo el tamaño en bytes de los pesos.

El checkpoint empaquetado corresponde a k=32 y declara una accuracy del 91,86% en validación SST-2, frente al 91,63% del modelo profesor. Es un modelo de nicho, orientado a reproducir experimentos de compresión y a servir de referencia técnica, no a despliegues de producción en castellano ni en tareas generales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), 12 capas, dimensión oculta 768 |
| Parámetros totales | 109.483.778 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-base estándar admite 512 tokens, no confirmado en la model card) |
| Tipos de cuantización | FP8 (`e4m3` y `e5m2`), escalado `per_tensor` o `per_channel`; emulación en CPU y GPUs anteriores a SM 8.9 |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La base es `google-bert/bert-base-uncased`, un transformer encoder bidireccional de 12 capas, 768 dimensiones ocultas y 109.483.778 parámetros, preentrenado en inglés y afinado para clasificación de secuencias con dos etiquetas (negativo/positivo) sobre GLUE SST-2. Sobre ese checkpoint, NeuralOps aplica `FP8Compressor`, un compresor de cuantización post-entrenamiento que convierte los pesos a `torch.float8_e4m3fn` o `torch.float8_e5m2`, con soporte nativo en GPUs con compute capability SM >= 8.9 (por ejemplo RTX 4070) y emulación en CPU o GPUs anteriores.

El pipeline evalúa cuatro rangos de compresión (k=256, 128, 64, 32). La model card indica que, si la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x, se activa un "LoRA healing" con r=8, 50 pasos, learning rate 2e-4 y un presupuesto de 45 segundos. En este caso el ratio de compresión físico es 1.00x en todos los rangos y la accuracy zero-shot ya iguala o supera al profesor, por lo que el healing no se aplicó (`LoRA Recovery Applied: False`). La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 de 24 GB sobre las 872 muestras de validación de SST-2.

## Capacidades

- Clasificación binaria de sentimiento en inglés (negativo/positivo) sobre texto tipo SST-2.
- Generación de logits de clasificación a partir de la cabeza `BertForSequenceClassification` con `num_labels=2`.
- Inferencia en FP8 nativo en GPUs SM >= 8.9 y emulada en CPU o GPUs antiguas.
- Reconstrucción del grafo comprimido mediante `compress_model` de NeuralOps y carga del state dict con `strict=False`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés; el tokenizador es el vocabulario `bert-base-uncased` estándar.
- No es un modelo generativo: no produce texto libre, solo etiquetas de clasificación.

## Casos de uso

- Reproducción de experimentos de compresión: sirve para validar el pipeline `FP8Compressor` de NeuralOps con los rangos k=256, 128, 64 y 32 sobre un dataset público y pequeño (872 muestras), comparando accuracy zero-shot frente a la versión cuantizada.
- Análisis de sentimiento en inglés a pequeña escala: clasificación binaria de reseñas o comentarios con un modelo de 109 M de parámetros, adecuado para lotes pequeños en CPU o GPU modesta.
- Referencia de cuantización FP8 en transformers: útil para estudiar el impacto de `e4m3` frente a `e5m2` y de `per_tensor` frente a `per_channel` en un encoder BERT sin tocar la arquitectura.
- Baseline en pipelines de evaluación de compresión: al declarar el profesor (91,63%) y el resultado comprimido (91,86%), permite medir la paridad de futuros compresores sobre el mismo split de validación.
- Docencia y experimentación con LoRA healing: aunque en este checkpoint no se aplicó, el repositorio documenta el disparador (>2,0% de caída y >1,10x de reducción) y los hiperparámetros (r=8, 50 pasos, lr=2e-4, 45 s), lo que facilita replicar el flujo en otros modelos.
- Pruebas de integración de la librería NeuralOps: el script de "Quick Start" de la model card permite verificar la descarga desde Hugging Face, la reconstrucción del modelo y la inferencia en un caso controlado.
- Validación de despliegue en hardware SM >= 8.9: permite comprobar el comportamiento de `torch.float8_e4m3fn` en GPUs como RTX 4070 frente a la emulación en CPU o GPUs anteriores.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados de forma independiente):

| Benchmark | Métrica | Valor | Verificado |
|---|---|---|---|
| GLUE SST-2 (validación) | Accuracy | 91,86% | No (`verified: false`) |

Comparativa interna de rangos de compresión publicada por el autor (evaluación en RTX 3090, 872 muestras de validación):

| Rango (k) | Ratio físico | Parámetros comprimidos (reducción) | Accuracy zero-shot | Accuracy con healing | Paridad vs profesor (91,63%) |
|---|---|---|---|---|---|
| 256 | 1.00x | 109.483.778 (-0,0%) | 91,86% | 91,86% | +0,23% |
| 128 | 1.00x | 109.483.778 (-0,0%) | 91,86% | 91,86% | +0,23% |
| 64 | 1.00x | 109.483.778 (-0,0%) | 91,86% | 91,86% | +0,23% |
| 32 (publicado) | 1.00x | 109.483.778 (-0,0%) | 91,86% | 91,86% | +0,23% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. No se han publicado medidas de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,2 GB y el state dict pesa 208,9 MB, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más; en FP8 el peso de los pesos ronda los 109 MB más buffers.
- GPU recomendadas: cualquier GPU con compute capability SM >= 8.9 (RTX 4070, RTX 4080, RTX 4090, L4, L40S, H100) para FP8 nativo; en GPUs anteriores (RTX 3090, A100) o en CPU se usa emulación, con mayor coste computacional.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB de VRAM; el cuello de botella es el pipeline de NeuralOps, no el modelo.
- Opciones de despliegue: la model card solo documenta el flujo con `transformers` + `neuralops` (descarga con `hf_hub_download`, reconstrucción con `compress_model` y carga con `load_state_dict(strict=False)`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al no publicarse GGUF ni safetensors, estos runners no son directamente utilizables.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Formato |
|---|---|---|---|---|---|
| `tahamajs/bert-comp-fp8-sst2` | 109.483.778 | no disponible | 91,86% (declarado, no verificado) | MIT | `pytorch_model.bin` |
| `google-bert/bert-base-uncased` (profesor) | 109.483.778 | 512 tokens (estándar BERT) | 91,63% (baseline declarado por el autor) | Apache 2.0 | safetensors / PyTorch |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | safetensors / PyTorch |
| `roberta-base` afinado en SST-2 | ~125 M | 512 tokens | no disponible en esta ficha | MIT | safetensors / PyTorch |

La comparativa se limita a modelos de la misma familia y tarea; no se dispone de datos de benchmarks de las alternativas en la información proporcionada, por lo que las celdas correspondientes se marcan como no disponibles. La diferencia principal frente al profesor es el formato de pesos (FP8 serializado en `.bin` frente a safetensors estándar) y la licencia (MIT frente a Apache 2.0).

## Limitaciones y advertencias

- Modelo exclusivamente en inglés; no soporta castellano ni otras lenguas.
- Tarea única: clasificación binaria de sentimiento; no es generativo ni sirve para razonamiento, código o matemáticas.
- El resultado de 91,86% está declarado por el autor con `verified: false`; no hay evaluación independiente.
- El ratio de compresión es 1.00x (0,0% de reducción de parámetros): la cuantización FP8 reduce el tamaño en bytes de los pesos, no el número de parámetros, por lo que el ahorro real de memoria es menor de lo que sugiere la etiqueta "compressed".
- El checkpoint se distribuye como `pytorch_model.bin` (pickle de PyTorch), lo que implica riesgos de seguridad al cargarlo con `torch.load`; no se publican safetensors.
- Requiere la librería NeuralOps y reconstruir el grafo comprimido antes de cargar el state dict con `strict=False`, lo que puede enmascarar pesos no cargados correctamente.
- FP8 nativo solo en GPUs SM >= 8.9; en el resto se emula, con posible degradación de rendimiento y de fidelidad numérica.
- Riesgo de alucinación no aplica en sentido estricto (no genera texto), pero sí puede producir clasificaciones erróneas en dominios alejados de SST-2 (reseñas de películas).
- Licencia MIT: permite uso comercial, pero el modelo base `google-bert/bert-base-uncased` está bajo Apache 2.0, cuyas condiciones deben respetarse igualmente.
- No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI; el despliegue en producción requeriría trabajo adicional de conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-fp8-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor FP8: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/fp8_compressor.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
