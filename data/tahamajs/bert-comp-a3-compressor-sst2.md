# tahamajs/bert-comp-a3-compressor-sst2

## Resumen

`tahamajs/bert-comp-a3-compressor-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` ajustado para clasificación de sentimiento binaria en GLUE SST-2. Lo publica Taha Majlesi dentro del proyecto NeuralOps, una librería de compresión de modelos que aplica técnicas de factorización de bajo rango con recalibración de activaciones. El modelo no es un modelo base nuevo: es una versión físicamente comprimida del BERT-base original, con un 6,46 % menos de parámetros y una ratio de compresión física de 1,069x, empaquetada como artefacto reproducible del "compressor zoo" de NeuralOps.

La relevancia del modelo es metodológica más que de rendimiento: sirve como ejemplo verificable de cómo aplicar el compresor `A3Compressor` (SVD factorizado con ponderación por segundo momento de activaciones, búsqueda de rango STRS y recalibración de LayerNorm) sobre un transformer encoder estándar sin degradar de forma significativa la precisión downstream. El checkpoint empaquetado usa el rango `k=256`, que es el punto de la curva Pareto seleccionado por el autor por ofrecer el mejor equilibrio entre reducción de parámetros y precisión.

El modelo conserva la arquitectura BERT-base (12 capas, dimensión oculta 768, 109.483.778 parámetros en el original) y la tokenización `bert-base-uncased`. Está pensado para inglés, con licencia MIT, y su uso previsto es la inferencia de clasificación de sentimiento y la experimentación con pipelines de compresión. No incorpora recuperación LoRA en el checkpoint serializado, aunque el pipeline del autor la contempla para otros rangos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), comprimido con `A3Compressor` (SVD de bajo rango con ponderación de activaciones) |
| Parametros totales | 102.405.890 (original: 109.483.778; reducción del 6,46 %) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (arquitectura BERT-base, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantizacion | no disponible (pesos serializados en `pytorch_model.bin`, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict de PyTorch), `config.json`, `compression_summary.json`, assets de tokenizer BERT |
| Rango de compresión | k=256 (checkpoint empaquetado); evaluados también k=128, k=64 y k=32 |
| Ratio de compresión física | 1,069x |
| Tarea | Clasificación de texto (sentimiento binario, SST-2) |
| Librería | `neuralops` |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT-base `uncased`: 12 capas de transformer encoder, 768 dimensiones ocultas, 12 cabezas de atención y aproximadamente 109,5 millones de parámetros. Sobre ese modelo, el autor aplica `A3Compressor`, un compresor de bajo rango que factoriza las matrices de pesos usando SVD ponderado por el segundo momento de las activaciones (`E[x²]`), con opción de blanqueamiento de Cholesky completo, búsqueda de rango mediante STRS y recalibración posterior de LayerNorm. El resultado es un state dict con factores de bajo rango incorporados y parámetros reducidos a 102.405.890.

El fine-tuning original se realizó sobre GLUE SST-2 (dataset `nyu-mll/glue`, configuración `sst2`), partiendo de `bert-base-uncased`. El autor reporta una línea base "teacher" (el BERT-base sin comprimir) con 91,63 % de accuracy en validación. La evaluación multi-rango se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de SST-2 con 872 muestras. El pipeline contempla recuperación LoRA (`r=8`, 50 pasos, `lr=2e-4`, presupuesto de 45 s) cuando la compresión zero-shot degrada más de 2,0 puntos porcentuales con una reducción superior a 1,10x; en el checkpoint empaquetado (k=256) la recuperación LoRA no se aplicó (`LoRA Recovery Applied: False`). No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset más allá de SST-2, ni si hubo RLHF/DPO (no aplicable en un clasificador).

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) sobre texto en inglés, con una única etiqueta por secuencia.
- Inferencia de clasificación de texto estándar mediante `BertForSequenceClassification` (2 etiquetas).
- Compatible con el ecosistema Hugging Face `transformers` para tokenización e inferencia, aunque requiere reconstruir la topología comprimida con `neuralops` antes de cargar los pesos.
- Reproducibilidad del pipeline de compresión: el repositorio incluye `compression_summary.json` con telemetría de los rangos evaluados [256, 128, 64, 32].
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking"; es un encoder clasificador, no un modelo generativo.
- Capacidad multilingüe: no disponible; solo inglés (`en`).
- No se documentan capacidades de generación de texto, código ni matemáticas.

## Casos de uso

- Clasificación de sentimiento en reseñas de producto o comentarios de usuarios en inglés: el modelo devuelve una etiqueta binaria por secuencia y puede integrarse en un pipeline de `transformers` para procesar lotes de textos cortos, con la ventaja de un checkpoint un 6,5 % más pequeño que BERT-base.
- Moderación de comentarios a pequeña escala: al ser un clasificador ligero de 102 M de parámetros, puede desplegarse en CPU o en GPUs consumer para filtrar tono negativo en foros o secciones de comentarios, con la salvedad de que solo cubre inglés y sentimiento binario.
- Investigación en compresión de modelos: sirve como referencia reproducible para comparar el compresor `A3Compressor` con otras técnicas (podado, cuantización, destilación) sobre una tarea estándar como SST-2, usando el `compression_summary.json` como telemetría.
- Docencia y experimentación con SVD de bajo rango: el checkpoint permite estudiar el efecto del rango `k` en la precisión (k=256 → 91,17 %, k=128 → 90,14 %, k=64 → 90,71 %, k=32 → 91,17 %) sobre un modelo conocido.
- Baseline en pipelines de MLOps: puede usarse como modelo de referencia en pruebas de integración de la librería `neuralops`, verificando que la reconstrucción de la topología comprimida y la carga del state dict funcionan correctamente.
- Análisis de sentimiento en datasets académicos: para experimentos con GLUE SST-2 o corpus similares en inglés donde se priorice un modelo pequeño y de licencia permisiva (MIT) frente a un BERT-base completo.
- Prototipado de clasificadores de texto con recursos limitados: al reducir parámetros y mantener precisión cercana al teacher (delta de -0,46 pp), es adecuado para entornos con restricciones de memoria donde no se justifica desplegar el BERT-base original.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; `verified: false` en el model-index).

| Rank (k) | Ratio físico | Parámetros comprimidos (reducción) | Accuracy zero-shot | Accuracy con LoRA healing | Paridad vs teacher (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| **256** (empaquetado) | 1,07x | 102.405.890 (-6,5 %) | 91,17 % | 91,17 % | -0,46 pp |
| 128 | 1,08x | 101.177.090 (-7,6 %) | 90,14 % | 90,14 % | -1,49 pp |
| 64 | 1,06x | 103.289.090 (-5,7 %) | 90,71 % | 90,71 % | -0,92 pp |
| 32 | 1,05x | 104.439.554 (-4,6 %) | 91,17 % | 91,17 % | -0,46 pp |

Evaluación realizada en NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de GLUE SST-2 (872 muestras). No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 102 M de parámetros en FP32, el peso ocupa aproximadamente 0,4 GB; con overhead de activaciones y tokenizer, cabe holgadamente en cualquier GPU con 2 GB o más. El repositorio ocupa 0,2 GB en disco.
- GPU recomendadas: cualquier GPU moderna es suficiente; el autor usó una RTX 3090 (24 GB) para la evaluación, pero el modelo no requiere esa capacidad. También es viable en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: `transformers` + `neuralops` (reconstrucción de topología comprimida y carga del state dict); no se documentan exportaciones a vLLM, llama.cpp, Ollama o TGI, y al no haber variantes GGUF no es directamente compatible con llama.cpp/Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El autor menciona un presupuesto de 45 s para el LoRA healing, pero no reporta latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/bert-comp-a3-compressor-sst2` (k=256) | 102.405.890 | no disponible | 91,17 % | MIT | Hugging Face (`neuralops`) |
| `google-bert/bert-base-uncased` (teacher, fine-tuned SST-2) | 109.483.778 | 512 (arquitectura) | 91,63 % | Apache 2.0 | Hugging Face (`transformers`) |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 (arquitectura) | no disponible en esta información | Apache 2.0 | Hugging Face (`transformers`) |
| `textattack/bert-base-uncased-SST-2` | 109.483.778 | 512 (arquitectura) | no disponible en esta información | Apache 2.0 | Hugging Face (`transformers`) |

La comparativa se limita a modelos de la misma familia y tarea; los datos de los modelos alternativos no se han verificado en esta ficha y se indican como "no disponible" cuando no constan en la información proporcionada. La ventaja diferencial del modelo de NeuralOps es la reducción de parámetros con pérdida mínima de precisión y una licencia MIT, a cambio de requerir la librería `neuralops` para la reconstrucción.

## Limitaciones y advertencias

- Solo admite inglés (`en`); no es multilingüe.
- Tarea restringida a clasificación de sentimiento binaria (positivo/negativo); no genera texto ni realiza otras tareas sin un fine-tuning adicional.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí puede producir clasificaciones erróneas en dominios distintos de SST-2 (reseñas de películas), especialmente con sarcasmo, negaciones complejas o jerga.
- Sesgos heredados de `bert-base-uncased` y de los datos de SST-2: posibles sesgos demográficos, culturales y de dominio presentes en el corpus original.
- La licencia MIT se aplica al checkpoint publicado; conviene revisar también la licencia del modelo base (Apache 2.0) y de los datos de entrenamiento (GLUE) para uso comercial.
- El checkpoint requiere reconstruir la topología comprimida con `neuralops` antes de cargar los pesos (`strict=False` en `load_state_dict`); no es un checkpoint estándar cargable directamente con `AutoModelForSequenceClassification.from_pretrained`.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); no hay validación independiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- No se documentan variantes cuantizadas (GGUF, INT8, AWQ) ni soporte para motores de inferencia de alto rendimiento como vLLM o TGI.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-comp-a3-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/a3_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
