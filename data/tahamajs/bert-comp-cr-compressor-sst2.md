# tahamajs/bert-comp-cr-compressor-sst2

## Resumen

`tahamajs/bert-comp-cr-compressor-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` afinado sobre GLUE SST-2 (clasificacion de sentimiento binaria). Lo desarrolla Taha Majlesi dentro del proyecto NeuralOps, una libreria de compresion de modelos que incluye el motor `cr_compressor` (CRCompressor), basado en descomposicion column-row / interpolativa (ID) de las capas lineales. El modelo sirve como artefacto de demostracion del "Compressed & LoRA-Healed Model Zoo" de NeuralOps: no busca competir en calidad con BERT-base, sino documentar el comportamiento de la compresion fisica junto con una recuperacion LoRA posterior.

Arquitectura base: BERT-base (transformer encoder, 12 capas, dimension oculta 768, 109.483.778 parametros). El checkpoint serializado usa rango `k=32` y contiene 29.857.538 parametros, lo que supone una reduccion del 72,73% y un ratio de compresion fisico de 3,667x. El repositorio pesa aproximadamente 0,1 GB y se distribuye como `pytorch_model.bin` mas activos de tokenizer estandar de BERT.

Es relevante ahora como referencia tecnica para quien investiga compresion low-rank sobre transformers: publica una evaluacion Pareto multi-rango (k=256, 128, 64, 32) con resultados medidos en una RTX 3090, e ilustra de forma explicita el coste en precision de la compresion agresiva. La precision final en SST-2 es 50,92%, frente al 91,63% del modelo profesor, una diferencia de -40,71 puntos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), con capas lineales descompuestas por CRCompressor (ID column-row) y adaptadores LoRA de recuperacion |
| Parametros totales | 29.857.538 (checkpoint comprimido); 109.483.778 en el modelo base original |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-base original: 512 tokens; no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes GGUF/AWQ/GPTQ; solo pesos PyTorch serializados) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado); requiere reconstruccion de topologia via `neuralops` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 768 de dimension oculta) afinado sobre GLUE SST-2. Sobre esa red, NeuralOps aplica `CRCompressor`: descompone cada capa lineal en bases de columnas "esqueleto" y proyecciones interpolativas, reduciendo el numero de parametros fisicos en funcion del rango `k` seleccionado. El checkpoint publicado corresponde a `k=32` y lleva "baked in" los factores low-rank y los adaptadores LoRA de recuperacion.

El proceso de recuperacion se activa cuando la compresion zero-shot degrada la precision en mas de 2,0 puntos con una reduccion superior a 1,10x. En ese caso se aplica LoRA con rango `r=8`, 50 pasos, `lr=2e-4` y un presupuesto de 45 segundos. La evaluacion se realizo fisicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validacion de SST-2 (872 muestras). No se documentan en la informacion disponible ni el volumen de tokens de entrenamiento, ni la composicion del dataset mas alla de GLUE SST-2, ni si hubo RLHF/DPO (no aplicable a una tarea de clasificacion).

## Capacidades

- Clasificacion de sentimiento binaria (0 = negativo, 1 = positivo) sobre texto en ingles, formato SST-2.
- Inferencia sobre frases cortas (criticas, opiniones) con el tokenizer `bert-base-uncased`.
- Reconstruccion programatica de la topologia comprimida mediante `neuralops.core.compression_pipeline.compress_model`.
- Carga de pesos con `strict=False` para tolerar las claves de factores low-rank y LoRA.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no (solo ingles).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- **Demostracion de compresion low-rank en investigacion**: usar el checkpoint para reproducir la curva Pareto (k=256/128/64/32) y medir el impacto en precision sobre SST-2. Adecuado porque el repositorio incluye `compression_summary.json` con telemetria por rango.
- **Banco de pruebas de pipelines NeuralOps**: servir como artefacto de referencia para validar la compatibilidad entre `compress_model`, `CRCompressor` y la carga de state dicts comprimidos en integraciones CI.
- **Clasificacion de sentimiento en entornos con restricciones de memoria**: con 29,8 M de parametros y 57 MB de pesos, el modelo cabe en GPU consumer modesta o incluso CPU, aunque la precision util es marginal (50,92%).
- **Baseline negativo en experimentos de destilacion**: usar el checkpoint como cota inferior para comparar tecnicas de recuperacion (LoRA, QLoRA, pruning estructurado) sobre BERT-base SST-2.
- **Analisis de robustez frente a compresion agresiva**: estudiar por que la precision colapsa al 50,92% (nivel de azar en clasificacion binaria) incluso tras healing LoRA, como caso documentado de limite del metodo.
- **Prototipado de clasificadores de texto cortos en ingles**: valido solo en escenarios donde la precision no es critica y prima minimizar huella de memoria y latencia.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Metrica | Valor |
|---|---|
| GLUE SST-2 Validation Accuracy (k=32, healed) | 50,92% |
| Teacher baseline (BERT-base SST-2) | 91,63% |
| Parity delta vs teacher | -40,71% |

Evaluacion Pareto multi-rango publicada en la model card (RTX 3090, 872 muestras de validacion):

| Rank (k) | Ratio fisico | Parametros comprimidos (reduccion) | Zero-shot Acc | Healed Acc | Parity vs teacher |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.016.450 (-38,8%) | 60,78% | 50,92% (LoRA) | -40,71% |
| 128 | 2,39x | 45.782.786 (-58,2%) | 50,92% | 49,08% (LoRA) | -42,55% |
| 64 | 3,11x | 35.165.954 (-67,9%) | 50,92% | 49,08% (LoRA) | -42,55% |
| 32 | 3,67x | 29.857.538 (-72,7%) | 50,92% | 50,92% (LoRA) | -40,71% |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks fuera de SST-2.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 29,8 M de parametros; holgadamente por debajo de 2 GB incluso con overhead de framework.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, T4). El autor valido la evaluacion en RTX 3090 (24 GB), pero esa GPU es sobredimensionada para este checkpoint.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas y en iGPU con suficiente memoria compartida.
- Opciones de despliegue: PyTorch + `transformers` + `neuralops` (ruta oficial descrita en la model card). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este checkpoint; el formato `pytorch_model.bin` con topologia comprimida no es directamente compatible con esos runners sin conversion.
- Latencia y throughput estimados: no disponibles. El autor solo menciona un presupuesto de 45 s para el paso de healing LoRA, no metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 Acc | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-comp-cr-compressor-sst2` (k=32) | 29,86 M | no disponible | 50,92% | MIT | Hugging Face (repo de 0,1 GB) |
| `google-bert/bert-base-uncased` (teacher SST-2) | 109,48 M | 512 tokens | 91,63% | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,96 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,48 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparativa muestra que este checkpoint sacrifica aproximadamente 40 puntos de precision frente al teacher a cambio de 3,67x de compresion fisica. Alternativas como DistilBERT ofrecen reducciones de parametros (~40%) con perdidas de precision mucho menores en tareas GLUE, lo que situa a este artefacto como demostracion metodologica mas que como modelo de produccion.

## Limitaciones y advertencias

- Precision en SST-2 de 50,92%, equivalente al nivel de azar en clasificacion binaria: el modelo no es util para clasificacion de sentimiento real.
- El healing LoRA no recupera la precision: en k=32 el resultado healed iguala al zero-shot (50,92%), y en k=128/64 incluso empeora (49,08%).
- Sesgos conocidos: hereda los sesgos de `bert-base-uncased` y de SST-2 (dominio de criticas de cine en ingles); no se documenta ninguna mitigacion.
- Riesgo de alucinacion: no aplicable directamente (tarea de clasificacion), pero la salida puede ser sistematicamente incorrecta por la degradacion del checkpoint.
- Limitaciones de idioma: solo ingles; el tokenizer y el dataset de ajuste no cubren otras lenguas.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base `bert-base-uncased` es Apache 2.0 y debe respetarse esa licencia subyacente.
- Carga no trivial: requiere `neuralops` y reconstruir la topologia antes de `load_state_dict(strict=False)`; no funciona como `AutoModelForSequenceClassification.from_pretrained(repo_id)` directo.
- Sin variantes cuantizadas ni integraciones con runners estandar (vLLM, llama.cpp, Ollama, TGI) publicadas.
- Resultados de benchmark marcados como `verified: false`; no han sido replicados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-cr-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion CRCompressor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/cr_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
