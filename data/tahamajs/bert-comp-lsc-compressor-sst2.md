# tahamajs/bert-comp-lsc-compressor-sst2

## Resumen

`tahamajs/bert-comp-lsc-compressor-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2, generado con el compresor `lsc_compressor` (familia `low_rank`, implementación `lsc_factory`) de la librería NeuralOps. El autor, Taha Majlesi, publica este modelo como parte de un zoo de modelos comprimidos con recuperación LoRA, orientado a estudiar el compromiso entre ratio de compresión y precisión en tareas downstream.

El checkpoint serializado corresponde al rango Pareto `k=128`, con 45.782.786 parámetros (una reducción del 58,18 % respecto a los 109.483.778 del BERT-base original, es decir, un ratio de compresión físico de 2,391x). Sobre esa base comprimida se aplicó un "healing" con LoRA de rango 8 durante 50 pasos, que eleva la accuracy en validación de SST-2 del 68,12 % en zero-shot al 69,04 % final.

Su relevancia es metodológica más que práctica: sirve como referencia reproducible de cómo la compresión espectral de bajo rango degrada severamente una tarea de clasificación (el profesor original alcanza 91,63 %, una pérdida de 22,59 puntos) y de cómo un ajuste LoRA ligero recupera solo una fracción de esa caída. No es un modelo pensado para producción, sino para experimentación con técnicas de compresión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, dimensión oculta 768), comprimido con `lsc_compressor` (familia `low_rank`, `lsc_factory`) |
| Parametros totales | 45.782.786 (reducción del 58,18 % respecto a los 109.483.778 del BERT-base original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-base-uncased soporta hasta 512 tokens; el autor no lo declara explícitamente) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en `pytorch_model.bin`, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch con factores de bajo rango y adaptadores LoRA integrados); `config.json` y `compression_summary.json` como metadatos |

## Arquitectura y entrenamiento

La arquitectura de partida es BERT-base uncased: un transformer encoder de 12 capas con dimensión oculta 768 y 109.483.778 parámetros, preentrenado por Google y afinado originalmente en GLUE SST-2 (el "profesor" que alcanza 91,63 % de accuracy en validación). Sobre ese modelo, NeuralOps aplica el compresor `lsc_compressor`, un compresor espectral de Fourier de bajo rango que factoriza las matrices de pesos en componentes de rango `k`. En el checkpoint publicado, `k=128`, lo que reduce el recuento de parámetros a 45.782.786.

El proceso de recuperación ("LoRA healing") se activa cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x. En ese caso se entrena un adaptador LoRA de rango `r=8` durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos. El autor evaluó cuatro rangos (`k=256, 128, 64, 32`) sobre las 872 muestras de validación de SST-2 en una NVIDIA GeForce RTX 3090 (24 GB). No se documentan detalles sobre el dataset de entrenamiento del healing más allá de SST-2, ni sobre el proceso de preentrenamiento original (heredado de BERT-base).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, con dos etiquetas de salida (`num_labels=2`).
- Inferencia estándar de `BertForSequenceClassification` una vez reconstruida la topología comprimida y cargado el state dict.
- No soporta tool calling ni function calling: es un modelo de clasificación, no generativo.
- No soporta agentes ni razonamiento multi-paso.
- Multilingüe: no; únicamente inglés (vocabulario `bert-base-uncased`).
- No dispone de modo "thinking", visión ni audio.
- Capacidad de reconstrucción: requiere la librería NeuralOps (`compress_model` con `lsc_compressor` y `rank=128`) antes de cargar los pesos, por lo que no es un checkpoint autónomo de `transformers`.

## Casos de uso

- Investigación en compresión de modelos: sirve como punto de referencia reproducible para medir la caída de accuracy al aplicar compresión espectral de bajo rango sobre BERT-base en SST-2, comparando los cuatro rangos evaluados (`k=256, 128, 64, 32`).
- Estudio del "LoRA healing": permite analizar cuánto recupera un adaptador LoRA de rango 8 y 50 pasos tras una compresión agresiva (en `k=128` recupera 0,92 puntos; en `k=32`, 15,14 puntos).
- Docencia y demostración de pipelines de compresión: el flujo de reconstrucción (`compress_model` + carga de state dict con `strict=False`) es un ejemplo didáctico de cómo empaquetar y restaurar modelos comprimidos.
- Clasificación de sentimiento de baja exigencia en entornos con restricciones de memoria: con 45,8 M de parámetros y un peso de 87,4 MB, el modelo ocupa menos que BERT-base, aunque su accuracy del 69,04 % limita su uso a escenarios tolerantes a error.
- Benchmarking de infraestructura: útil para medir throughput y latencia de modelos comprimidos frente al profesor en la misma GPU (RTX 3090 en las pruebas del autor).
- Análisis de robustez de compresores: comparar el comportamiento del `lsc_compressor` con otros compresores de NeuralOps sobre la misma tarea y dataset.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; `verified: false` en el model-index). Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras), en una NVIDIA GeForce RTX 3090.

| Rango (`k`) | Ratio físico | Parámetros comprimidos (reducción) | Accuracy zero-shot | Accuracy con LoRA | Diferencia vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.016.450 (-38,8 %) | 67,20 % | 67,32 % | -24,31 % |
| **128** (publicado) | **2,39x** | **45.782.786 (-58,2 %)** | **68,12 %** | **69,04 %** | **-22,59 %** |
| 64 | 3,11x | 35.165.954 (-67,9 %) | 49,66 % | 50,92 % | -40,71 % |
| 32 | 3,67x | 29.857.538 (-72,7 %) | 49,08 % | 64,22 % | -27,41 % |

El model-index oficial declara una única métrica para el checkpoint publicado: accuracy de 69,04 % en GLUE SST-2 validation (config `sst2`). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 45,8 M de parámetros del checkpoint (el peso serializado ocupa 87,4 MB); el modelo base sin comprimir requeriría aproximadamente 0,4 GB en FP32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor evaluó en una NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobradamente pequeño para GPUs de gama baja.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, GTX 1660, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: no hay soporte directo en vLLM, llama.cpp, Ollama ni TGI, ya que el checkpoint requiere reconstruir la topología con NeuralOps (`compress_model`) y cargar el state dict con `strict=False`. El despliegue estándar es mediante `transformers` + `neuralops` en Python.
- Latencia y throughput: no disponibles en la información proporcionada. El autor solo documenta el presupuesto de 45 segundos para el entrenamiento LoRA de healing en RTX 3090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/bert-comp-lsc-compressor-sst2` (k=128) | 45,78 M | no disponible (base: 512) | 69,04 % (validation) | MIT | Hugging Face, requiere NeuralOps |
| `google-bert/bert-base-uncased` (profesor, afinado SST-2) | 109,48 M | 512 | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face, `transformers` estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 | no disponible en esta información | Apache 2.0 | Hugging Face, `transformers` estándar |

La comparación directa con DistilBERT no puede completarse con datos de accuracy porque no se han proporcionado resultados de ese modelo en la información disponible. Frente al profesor BERT-base, el checkpoint comprimido sacrifica 22,59 puntos de accuracy a cambio de un ratio de compresión de 2,39x y una reducción del 58,2 % de parámetros.

## Limitaciones y advertencias

- Caída de accuracy severa: 69,04 % frente al 91,63 % del profesor, una pérdida de 22,59 puntos. No es apto para producción en tareas de sentimiento donde se requiera precisión alta.
- El checkpoint no es autónomo: requiere la librería NeuralOps y reconstruir la topología comprimida antes de cargar los pesos; no funciona con un `from_pretrained` estándar de `transformers`.
- Solo inglés: el vocabulario y el ajuste son de `bert-base-uncased`; no hay soporte multilingüe.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí hay riesgo de clasificaciones erróneas por la degradación de la representación interna tras la compresión.
- Sesgos: no documentados por el autor; hereda los sesgos del corpus de preentrenamiento de BERT-base y de SST-2 (reseñas de películas).
- Licencia MIT: permite uso comercial, pero la licencia del modelo base (Apache 2.0) y las condiciones de NeuralOps deben respetarse por separado.
- Resultados no verificados: el model-index marca la métrica como `verified: false`; los números provienen del propio autor.
- Fecha de creación futura (2026-11-10) en los metadatos de Hugging Face, lo que sugiere que el repositorio es experimental o de próxima publicación.
- Sin datos de cuantización publicados: no hay variantes GGUF, AWQ ni GPTQ, lo que limita el despliegue en entornos de inferencia optimizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-lsc-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/lsc_compressor.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
