# tahamajs/bert-comp-entropy-budget-allocation-sst2

## Resumen

`bert-comp-entropy-budget-allocation-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) comprimido fisicamente y posteriormente recuperado mediante LoRA, publicado por el autor `tahamajs` dentro del ecosistema NeuralOps (Compressed & LoRA-Healed Model Zoo). El modelo parte de un BERT-Base afinado sobre GLUE SST-2 (clasificacion de sentimiento binaria) y le aplica el compresor `EntropyBudgetCompressor` (registrado como `entropy_budget_allocation`), que asigna rangos de forma global mediante la entropia de activaciones blanqueadas.

El checkpoint empaquetado corresponde al rango Pareto `k=128`, con una reduccion de parametros del 58,17 % (de 109.483.778 a 45.792.002) y un ratio de compresion fisica de 2,39x. Sobre esa topologia comprimida se aplica un "healing" LoRA de rango 8 (50 pasos, lr=2e-4, presupuesto de 45 s) para recuperar parte de la precision perdida. El resultado final es un 75,92 % de accuracy en la validacion de SST-2, frente al 91,63 % del profesor original, es decir, una caida de 15,71 puntos.

Su relevancia es fundamentalmente metodologica: sirve como referencia reproducible de un pipeline de compresion SVD con asignacion de presupuesto por entropia y recuperacion LoRA, no como un clasificador de sentimiento listo para produccion. La libreria es `neuralops`, no `transformers`, y la reconstruccion del modelo requiere ejecutar el pipeline de compresion antes de cargar el state dict.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, D=768) con topologia comprimida via SVD y asignacion de rango por entropia (`EntropyBudgetCompressor`) |
| Parametros totales | 45.792.002 (checkpoint comprimido en k=128); modelo base original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-Base soporta 512 tokens, pero la model card no lo declara explicitamente) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en `pytorch_model.bin` sin cuantizacion declarada) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), requiere reconstruccion de topologia con `neuralops`; assets de tokenizer en formato BERT estandar (`vocab.txt`, `tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT-Base uncased: 12 capas de transformer encoder con dimension oculta 768 y 109.483.778 parametros, afinado previamente sobre GLUE SST-2. Sobre ese modelo se aplica `EntropyBudgetCompressor`, un operador de compresion basado en SVD que asigna rangos de forma global mediante la entropia de activaciones blanqueadas, en lugar de aplicar un rango uniforme por capa. El checkpoint publicado fija `k=128` como rango de referencia, lo que produce una reduccion del 58,17 % de parametros y un ratio de compresion fisica de 2,391x.

El proceso de recuperacion consiste en un ajuste LoRA de rango 8 durante 50 pasos con learning rate 2e-4 y un presupuesto de 45 segundos, aplicado cuando la compresion zero-shot degrada la accuracy mas de 2,0 puntos con una reduccion superior a 1,10x. Los adaptadores LoRA quedan integrados en el state dict serializado. La evaluacion multi-rango se realizo fisicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validacion de SST-2 (872 muestras). No se detalla en la informacion disponible la composicion del dataset de entrenamiento mas alla de GLUE SST-2, ni si hubo RLHF/DPO (no aplicable en un clasificador).

## Capacidades

- Clasificacion de sentimiento binaria (negativo/positivo) sobre texto en ingles, con dos etiquetas de salida (`num_labels=2`).
- Inferencia sobre texto corto a medio, heredando el tokenizador WordPiece de `bert-base-uncased`.
- Modelo comprimido con topologia reconstruible mediante la API `compress_model` de `neuralops`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles (el modelo base es uncased en ingles).
- No es un modelo generativo: no produce texto libre, solo logits de clasificacion.

## Casos de uso

- Investigacion en compresion de modelos: sirve como punto de comparacion reproducible para evaluar `EntropyBudgetCompressor` frente a otros compresores SVD del zoo de NeuralOps, con telemetria completa en `compression_summary.json`.
- Analisis de Pareto compresion/precision: el repositorio incluye resultados para k=256, 128, 64 y 32, lo que permite estudiar el trade-off entre ratio de compresion y accuracy en un clasificador concreto.
- Estudio de recuperacion LoRA post-compresion: util para medir cuanto recupera un ajuste LoRA de rango 8 y 50 pasos sobre una topologia SVD degradada (de 52,41 % zero-shot a 75,92 % con healing en k=128).
- Clasificacion de sentimiento de baja prioridad en entornos con restricciones de memoria: con 45,8 M de parametros y pesos de 87,5 MB, puede desplegarse en dispositivos con pocos recursos, aceptando la caida de precision frente al profesor.
- Prototipado de pipelines de compresion en CI: el script de Quick Start permite reconstruir el modelo y ejecutar inferencia de extremo a extremo para validar integraciones con `neuralops`.
- Docencia y divulgacion: ejemplo didactico de un flujo completo de compresion SVD, asignacion de presupuesto por entropia y healing LoRA sobre un modelo estandar de NLP.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index y en la model card (no verificados, `verified: false`):

| Metrica | Valor |
|---|---|
| GLUE SST-2 Validation Accuracy (k=128, con healing LoRA) | 75,92 % |
| GLUE SST-2 Accuracy zero-shot (k=128, sin healing) | 52,41 % |
| Teacher baseline (BERT-Base SST-2 original) | 91,63 % |
| Parity delta frente al profesor | -15,71 % |

Evaluacion multi-rango declarada por el autor (split de validacion SST-2, 872 muestras, RTX 3090):

| Rank (k) | Ratio fisico | Parametros comprimidos (reduccion) | Accuracy zero-shot | Accuracy con healing | Parity vs profesor |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.034.882 (-38,8 %) | 59,52 % | 49,08 % (LoRA) | -42,55 % |
| 128 (publicado) | 2,39x | 45.792.002 (-58,2 %) | 52,41 % | 75,92 % (LoRA) | -15,71 % |
| 64 | 3,11x | 35.170.562 (-67,9 %) | 51,38 % | 50,92 % (LoRA) | -40,71 % |
| 32 | 3,67x | 29.859.842 (-72,7 %) | 50,00 % | 50,92 % (LoRA) | -40,71 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el checkpoint pesa 87,5 MB y el modelo comprimido tiene 45,8 M de parametros, por lo que cabe holgadamente en cualquier GPU con mas de 1 GB de VRAM en FP32.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es suficiente; el autor valido el pipeline en una NVIDIA GeForce RTX 3090 (24 GB), aunque el modelo no la requiere.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer de los ultimos anos, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: la carga requiere `neuralops` para reconstruir la topologia comprimida antes de cargar el state dict; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 Val Acc | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `bert-comp-entropy-budget-allocation-sst2` (k=128) | 45,8 M (comprimido) | no disponible | 75,92 % | MIT | Hugging Face, requiere `neuralops` |
| `google-bert/bert-base-uncased` (profesor SST-2) | 109,5 M | 512 tokens (BERT estandar) | 91,63 % (baseline declarado por el autor) | Apache 2.0 | Hugging Face, `transformers` |
| Otros compresores NeuralOps del zoo | no disponible | no disponible | no disponible | MIT (presumible por el zoo) | Hugging Face |

No se dispone de datos de otros modelos comparables (por ejemplo, DistilBERT o TinyBERT afinados en SST-2) en la informacion proporcionada.

## Limitaciones y advertencias

- Caida de precision significativa: 75,92 % frente al 91,63 % del profesor, una diferencia de 15,71 puntos; no es adecuado para produccion sin una evaluacion adicional.
- Los resultados de benchmarks estan declarados por el autor y marcados como no verificados (`verified: false`).
- El comportamiento multi-rango es erratico: en k=256 el healing LoRA empeora la accuracy zero-shot (de 59,52 % a 49,08 %), lo que sugiere inestabilidad del proceso de recuperacion.
- Solo soporta ingles; no hay capacidades multilingues.
- No es un modelo generativo: no puede usarse para tareas de generacion, resumen o traduccion.
- La carga no es directa con `transformers`: requiere instalar `neuralops` y reconstruir la topologia con `compress_model` antes de aplicar el state dict, lo que anade complejidad operativa y dependencia de una libreria no estandar.
- Riesgo de sesgos heredados de `bert-base-uncased` y de GLUE SST-2 (dominio de resenas de cine); no se documentan analisis de sesgo en la informacion disponible.
- Riesgo de alucinacion no aplicable en sentido estricto (clasificador), pero si de clasificaciones erroneas en dominios alejados del entrenamiento.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base (`bert-base-uncased`, Apache 2.0) y de la libreria `neuralops`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-comp-entropy-budget-allocation-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementacion del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/entropy_budget_allocation.py
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
