# tahamajs/bert-comp-lillama-compressor-sst2

## Resumen

`bert-comp-lillama-compressor-sst2` es un checkpoint experimental de `google-bert/bert-base-uncased` fine-tuneado sobre GLUE SST-2 y posteriormente comprimido mediante el motor `lillama_compressor` (`LiLLaMADistiller`) de la librería NeuralOps, desarrollada por Taha Majlesi. El objetivo del artefacto no es ofrecer un clasificador de sentimiento listo para producción, sino demostrar empíricamente el comportamiento de una técnica de compresión física de pesos basada en destilación local mediante SVD de la matriz de covarianza cruzada de activaciones, combinada con un "healing" posterior mediante LoRA.

El modelo parte de los 109.483.778 parámetros de BERT-base (12 capas, dimensión oculta 768) y los reduce a 29.859.842 parámetros en el rango de compresión `k=32`, lo que supone una ratio de compresión física de 3,667x y una reducción del 72,73% de parámetros. El checkpoint serializado ocupa 57,1 MB en el repositorio (0,1 GB total con tokenizer y metadatos). La arquitectura resultante sigue siendo un transformer encoder BERT estándar, pero con las matrices proyectadas a factores de bajo rango y adaptadores LoRA de rango 8 integrados en los pesos.

La relevancia del artefacto es metodológica: publica una evaluación Pareto multi-rango (`k=256, 128, 64, 32`) sobre las 872 muestras del split de validación de SST-2, con y sin healing LoRA, medida en una RTX 3090. Los resultados muestran una degradación severa respecto al profesor (91,63% de accuracy), con un mejor caso curado de 71,79% en `k=32`, lo que sitúa al modelo muy por debajo de un BERT-base sin comprimir y lo hace inadecuado para uso real en clasificación de sentimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base comprimido (proyecciones de bajo rango via SVD de covarianza de activaciones + LoRA r=8) |
| Parametros totales | 29.859.842 (checkpoint comprimido en k=32); base original 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-base original: 512 tokens) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en `pytorch_model.bin` sin cuantizacion declarada) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado con factores de bajo rango y adaptadores LoRA embebidos) |

## Arquitectura y entrenamiento

El modelo base es `google-bert/bert-base-uncased`: un transformer encoder de 12 capas, dimensión oculta 768 y 109.483.778 parámetros, preentrenado de forma autocontenida y fine-tuneado sobre GLUE SST-2 (clasificación binaria de sentimiento). Sobre ese checkpoint, NeuralOps aplica `LiLLaMADistiller`, un operador de compresión que realiza destilación local mediante descomposición SVD de la matriz de covarianza cruzada de activaciones, sustituyendo las matrices densas por factores de bajo rango de rango `k`. El checkpoint publicado corresponde a `k=32`, con ratio física de 3,667x y reducción del 72,73% de parámetros.

Cuando la compresión zero-shot degrada la accuracy en más de 2,0 puntos con una reducción superior a 1,10x, el pipeline aplica un healing LoRA dirigido con rango `r=8`, 50 pasos, `lr=2e-4` y un presupuesto de 45 segundos. En el caso publicado en `k=32`, el healing eleva la accuracy de 49,20% (zero-shot) a 71,79%. La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras del split de validación de SST-2. No se detalla en la información disponible la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo RLHF/DPO (no aplicable en un encoder de clasificación).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, heredada del fine-tuning en GLUE SST-2.
- Generación de logits para dos clases mediante `BertForSequenceClassification` con `num_labels=2`.
- Reconstrucción del grafo comprimido mediante la API de NeuralOps (`compress_model` con `method: "lillama_compressor"`, `rank: 32`).
- Compatibilidad con el tokenizer estándar de `bert-base-uncased` (vocabulario `vocab.txt`, `tokenizer.json`, `tokenizer_config.json`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un encoder de clasificación, no un modelo generativo.
- Capacidad multilingüe: no. Solo inglés (`language: en`).

## Casos de uso

- Investigación en compresión de modelos: el checkpoint sirve como referencia reproducible para comparar técnicas de compresión física (SVD de covarianza de activaciones + LoRA healing) frente a poda, cuantización o destilación clásica, dado que publica métricas Pareto en cuatro rangos.
- Reproducción de experimentos de NeuralOps: permite reconstruir el pipeline `compress_model` → `load_state_dict` y verificar los números reportados en SST-2 sobre una RTX 3090, útil para validar la implementación del motor `lillama_compressor`.
- Estudio de la degradación por rango: la tabla multi-rango (`k=256, 128, 64, 32`) permite analizar cómo cae la accuracy al aumentar la compresión, incluyendo el comportamiento anómalo del healing LoRA (k=256 healed baja a 50,92% frente a 71,22% zero-shot).
- Docencia y demostración de trade-offs compresión/rendimiento: ejemplo tangible de que una reducción del 72,7% de parámetros en BERT-base destruye la accuracy en una tarea simple, útil en cursos de eficiencia de modelos.
- Baseline negativo en benchmarks internos: sirve como referencia de "modelo comprimido agresivamente sin recuperación suficiente" frente a alternativas como DistilBERT o TinyBERT en SST-2.
- Pruebas de integración de la librería `neuralops`: validar carga de checkpoints con `strict=False`, compatibilidad con `transformers` y serialización de adaptadores LoRA embebidos en el state dict.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente, `verified: false`). Evaluación sobre GLUE SST-2 validation split, 872 muestras, RTX 3090.

| Rank (k) | Ratio fisica | Parametros comprimidos (reduccion) | Zero-shot Acc | Healed Acc (LoRA) | Parity vs teacher (91,63%) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.034.882 (-38,8%) | 71,22% | 50,92% | -40,71% |
| 128 | 2,39x | 45.792.002 (-58,2%) | 53,33% | 68,92% | -22,71% |
| 64 | 3,11x | 35.170.562 (-67,9%) | 49,08% | 54,47% | -37,16% |
| 32 (publicado) | 3,67x | 29.859.842 (-72,7%) | 49,20% | 71,79% | -19,84% |

Referencia del profesor: `bert-base-uncased` fine-tuneado en SST-2, 91,63% de accuracy en validación.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el checkpoint comprimido de 29,86 M de parámetros; en la práctica, el modelo base reconstruido (`bert-base-uncased`, 109,48 M) ocupa aproximadamente 440 MB en fp32 antes de cargar el state dict comprimido.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor reporta evaluación en NVIDIA GeForce RTX 3090 (24 GB), pero el modelo cabe holgadamente en GPUs de 4-8 GB (RTX 3050, RTX 4060, GTX 1660).
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM; también en CPU para inferencia puntual.
- Opciones de despliegue: no hay soporte directo en vLLM, llama.cpp, Ollama ni TGI, ya que el checkpoint requiere reconstruir la topología comprimida con `neuralops.compress_model` antes de cargar los pesos. El flujo documentado usa `transformers` (`BertForSequenceClassification`) + `neuralops` + `huggingface_hub`.
- Latencia y throughput: no disponibles en la información proporcionada. El autor solo menciona un presupuesto de 45 segundos para el healing LoRA (50 pasos, `lr=2e-4`), no cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/bert-comp-lillama-compressor-sst2` (k=32) | 29,86 M | no disponible | 71,79% | MIT | Hugging Face, requiere `neuralops` |
| `google-bert/bert-base-uncased` (fine-tune SST-2) | 109,48 M | 512 | 91,63% (referencia del autor) | Apache 2.0 | Hugging Face, `transformers` |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,96 M | 512 | no disponible en la informacion | Apache 2.0 | Hugging Face, `transformers` |
| `prajjwal1/bert-tiny` (fine-tune SST-2) | 4,39 M | 512 | no disponible en la informacion | Apache 2.0 | Hugging Face, `transformers` |

La comparativa con DistilBERT y BERT-tiny se incluye por categoría (encoders comprimidos para clasificación), pero no se dispone de sus cifras SST-2 en la información proporcionada; no se inventan valores.

## Limitaciones y advertencias

- Rendimiento muy por debajo del profesor: 71,79% frente a 91,63% de accuracy en SST-2, una caída de 19,84 puntos. No es apto para producción en clasificación de sentimiento.
- Comportamiento inconsistente del healing LoRA: en `k=256` el healing empeora la accuracy (de 71,22% a 50,92%) y en `k=64` también (de 49,08% a 54,47% solo mejora ligeramente). El pipeline no garantiza recuperación monótona con el rango.
- Resultados no verificados: la métrica está marcada como `verified: false` en el model-index; no hay validación independiente.
- Dependencia de la librería `neuralops`: la carga requiere reconstruir la topología con `compress_model` antes de `load_state_dict(strict=False)`. No es un checkpoint plug-and-play con `transformers` puro.
- Solo inglés: el tokenizer y el fine-tuning son sobre `bert-base-uncased` y SST-2; no hay capacidades multilingües.
- Contexto limitado a 512 tokens (heredado de BERT-base), aunque la model card no lo declara explícitamente.
- Riesgo de alucinación: no aplica en sentido generativo (es un clasificador), pero sí hay riesgo de clasificaciones erróneas por la degradación de pesos.
- Licencia MIT permite uso comercial, pero el estado experimental y el rendimiento hacen desaconsejable su uso en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin señales de adopción ni mantenimiento por parte de la comunidad.
- Modelo base `bert-base-uncased` bajo Apache 2.0; la licencia MIT del checkpoint comprimido no altera las obligaciones del modelo original.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-comp-lillama-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/experimental/lillama_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
