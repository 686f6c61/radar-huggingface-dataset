# tahamajs/bert-comp-mlorq-compressor-sst2

## Resumen

`tahamajs/bert-comp-mlorq-compressor-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2 y posteriormente comprimido con el motor `MLoRQCompressor` de la librería NeuralOps. El modelo lo publica el autor individual Taha Majlesi (tahamajs) dentro de su "Compressed & LoRA-Healed Model Zoo", un conjunto de artefactos orientados a demostrar técnicas de compresión física de modelos con recuperación de precisión mediante LoRA.

La propuesta es reducir el número de parámetros de BERT-base de 109.483.778 a 24.549.122 (una reducción del 77,58 %, equivalente a un ratio de compresión físico de 4,46x) manteniendo la precisión en la tarea downstream. Según la model card, el checkpoint empaquetado corresponde al rango `k=32` y conserva una accuracy del 91,86 % en el split de validación de SST-2 (872 muestras), frente al 91,63 % del modelo profesor original.

Es relevante ahora porque ejemplifica una línea de trabajo práctica para desplegar clasificadores BERT en entornos con restricciones de memoria: en lugar de cuantizar a posteriori, se aplica una compresión de bajo rango con selección de rango bajo un presupuesto de memoria, y se serializa el resultado como un `state_dict` estándar de PyTorch que puede cargarse con `transformers` tras reconstruir la topología con NeuralOps.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), comprimido con `MLoRQCompressor` (familia `low_rank`) |
| Parámetros totales | 24.549.122 (comprimido, `k=32`); modelo base original: 109.483.778 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base BERT-base-uncased admite 512 tokens, pero la model card no lo declara explícitamente) |
| Tipos de cuantización | no disponible como opción de usuario; el compresor integra factores de bajo rango y buffers de cuantización internos según la model card |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch) |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`: un transformer encoder de 12 capas con dimensión oculta D=768 y 109.483.778 parámetros, afinado previamente sobre GLUE SST-2 como tarea de clasificación binaria de sentimiento (0 = negativo, 1 = positivo). Sobre ese checkpoint se aplica el compresor `MLoRQCompressor` (Multi-Layer Optimal Rank and Quantization under Memory Budget), que selecciona rangos óptimos por capa bajo un presupuesto de memoria y produce una representación de bajo rango con buffers de cuantización internos.

La model card indica que el pipeline evalúa físicamente varios rangos (`k=256, 128, 64, 32`) sobre el split de validación de SST-2 en una NVIDIA GeForce RTX 3090 (24 GB). Cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos y la reducción supera 1,10x, NeuralOps aplica un "healing" con LoRA de rango `r=8`, 50 pasos, `lr=2e-4` y un presupuesto de 45 segundos. En el checkpoint publicado (`k=32`) el campo `LoRA Recovery Applied` figura como `False`, es decir, la precisión se mantiene sin necesidad de aplicar el healing. No se detallan en la información disponible el número de tokens de entrenamiento ni la composición del dataset más allá de GLUE SST-2.

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre textos de entrada tipo SST-2.
- Inferencia estándar con `transformers` (`BertForSequenceClassification`) tras reconstruir la topología comprimida con NeuralOps y cargar el `state_dict` con `strict=False`.
- Compatible con el tokenizador estándar `bert-base-uncased` (`vocab.txt`, `tokenizer.json`, `tokenizer_config.json` incluidos en el repo).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking"; es un clasificador de texto puro.
- Capacidad multilingüe: no; solo inglés.
- No se declaran capacidades de generación de texto, código ni matemáticas.

## Casos de uso

- Moderación de comentarios en inglés: clasificar automáticamente reseñas o comentarios de usuario como positivos o negativos con un modelo de 24,5 M de parámetros, adecuado para despliegues de alto throughput en CPU o GPU modesta.
- Análisis de sentimiento en pipelines de monitorización de marca: procesar grandes volúmenes de tuits o reseñas en inglés por lotes, aprovechando el reducido tamaño del checkpoint (168,6 MB) para escalar horizontalmente.
- Enrutado previo en sistemas RAG o de atención al cliente: usar la señal de sentimiento como feature de entrada para decidir la prioridad o el tono de respuesta en un sistema mayor.
- Investigación en compresión de modelos: servir como referencia reproducible del efecto del `MLoRQCompressor` a distintos rangos (`k=256, 128, 64, 32`) sobre una tarea estándar como SST-2.
- Despliegue en dispositivos con memoria limitada: el checkpoint comprimido de 168,6 MB permite ejecutar el clasificador en entornos edge o contenedores con pocos recursos frente a los ~440 MB del BERT-base original en fp32.
- Evaluación comparativa de técnicas de compresión: usar el `compression_summary.json` incluido como telemetría de referencia para comparar con otras técnicas de pruning, cuantización o destilación en la misma tarea.
- Filtrado de datasets: clasificar automáticamente pares texto-etiqueta en inglés para validar o limpiar corpus de sentimiento antes de entrenar modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`), evaluados sobre GLUE SST-2 validation split (872 muestras) en una NVIDIA GeForce RTX 3090:

| Modelo / configuración | Ratio de compresión | Parámetros | Accuracy SST-2 (val) | Delta vs profesor |
|---|---|---|---|---|
| BERT-base-uncased (profesor, SST-2) | 1x | 109.483.778 | 91,63 % | — |
| `mlorq_compressor` `k=256` | 4,46x | 24.549.122 | 91,86 % | +0,23 % |
| `mlorq_compressor` `k=128` | — | — | FAIL_CRASH | — |
| `mlorq_compressor` `k=64` | 4,46x | 24.549.122 | 91,86 % | +0,23 % |
| `mlorq_compressor` `k=32` (checkpoint publicado) | 4,46x | 24.549.122 | 91,86 % | +0,23 % |

No se han publicado en la información disponible otros benchmarks (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 24,5 M de parámetros en fp32 el peso ocupa aproximadamente 98 MB (168,6 MB reportados para el repo completo incluyendo tokenizador y metadatos), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el autor reporta evaluaciones en NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobredimensionado para esa tarjeta.
- Cabe en GPU consumer: sí, en cualquier RTX/GTX moderna e incluso en iGPU y CPU.
- Opciones de despliegue: la model card documenta el flujo con `transformers` + `neuralops.core.compression_pipeline.compress_model` y `huggingface_hub`. No se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI; al ser un `state_dict` de PyTorch con topología comprimida no estándar, la carga requiere la librería NeuralOps.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-comp-mlorq-compressor-sst2` | 24,5 M (comprimido) | no disponible | 91,86 % (declarado, no verificado) | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor, SST-2) | 109,5 M | 512 tokens (modelo base) | 91,63 % (declarado por el autor) | Apache 2.0 (modelo base) | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 tokens (modelo base) | no disponible en la información proporcionada | Apache 2.0 | Hugging Face |

La comparativa se limita a referencias conocidas del ecosistema BERT/SST-2; no se dispone de datos de benchmarks verificados de forma independiente para el modelo comprimido ni para las alternativas en esta ficha.

## Limitaciones y advertencias

- Solo clasificación binaria de sentimiento en inglés; no es un modelo generativo ni multilingüe.
- La accuracy de 91,86 % está declarada por el autor y marcada como `verified: false`; no se ha validado de forma independiente.
- El rango `k=128` reporta `FAIL_CRASH` en la evaluación del autor, lo que sugiere inestabilidad del pipeline de compresión en determinadas configuraciones.
- La carga del checkpoint requiere la librería NeuralOps y reconstruir la topología comprimida antes de aplicar `load_state_dict(strict=False)`; no es un modelo cargable directamente con `AutoModelForSequenceClassification.from_pretrained` sin ese paso previo.
- Riesgo de sesgo y alucinación: al ser un clasificador, no genera texto, pero hereda los sesgos del corpus SST-2 y del BERT-base original (sesgos de género, raza y dominio en reseñas de cine).
- Restricciones de licencia: MIT, permite uso comercial, pero conviene revisar la licencia del modelo base `google-bert/bert-base-uncased` (Apache 2.0) y de los datos GLUE/SST-2 para usos derivados.
- El tamaño del repo (0,2 GB) y el número de descargas (0) indican que es un artefacto de investigación sin adopción comunitaria; no hay garantías de mantenimiento.
- No se documentan límites de longitud de entrada efectivos tras la compresión; asumir el límite de 512 tokens del BERT-base es una extrapolación razonable pero no confirmada en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-mlorq-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/mlorq_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
