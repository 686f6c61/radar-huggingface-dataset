# tahamajs/bert-comp-swift-svd-act-sst2

## Resumen

`bert-comp-swift-svd-act-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` fine-tuneado para clasificación de sentimiento en GLUE SST-2, publicado por el autor tahamajs como parte del zoo de compresión NeuralOps. No es un modelo nuevo: es un BERT-Base (12 capas, dimensión oculta 768, 109,48 M de parámetros) al que se le ha aplicado el compresor `SwiftSVDActivationCompressor` (`swift_svd_act`), que factoriza las capas densas en módulos SVD de bajo rango alineados con las activaciones empíricas, y posteriormente se ha "curado" con LoRA de recuperación.

El checkpoint serializado corresponde al rango de compresión `k=32`, con 29,86 M de parámetros (reducción del 72,73 %, ratio físico de 3,667x). A pesar de la agresividad de la compresión, el modelo presenta una precisión en la validación de SST-2 del 50,92 %, frente al 91,63 % del profesor original, es decir, una degradación de 40,71 puntos. El propio autor documenta el resultado como una evaluación de Pareto multi-rango (k=256, 128, 64, 32) en una RTX 3090 sobre 872 muestras de validación.

La relevancia del artefacto es metodológica más que práctica: sirve como referencia reproducible de una técnica de compresión SVD con conciencia de activaciones y de su fallo en preservar la precisión downstream a rangos bajos. La licencia es MIT y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), capas densas factorizadas como `SVDLinear` |
| Parametros totales | 29.859.842 (checkpoint comprimido, k=32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de bert-base-uncased; el autor no la declara) |
| Tipos de cuantizacion | no disponible (se publica en `pytorch_model.bin` en coma flotante; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado) + `config.json`, `compression_summary.json`, assets de tokenizer BERT |

## Arquitectura y entrenamiento

El modelo base es `bert-base-uncased` (12 capas, D=768, 109.483.778 parámetros), fine-tuneado sobre GLUE SST-2. Sobre ese modelo se aplica `SwiftSVDActivationCompressor`, que calcula covarianzas cruzadas entrada-salida sobre datos de calibración, deriva subespacios alineados con las activaciones y proyecta los pesos sobre el subespacio principal, sustituyendo las capas `nn.Linear`/`Conv1D` densas por módulos `SVDLinear` factorizados. El rango seleccionado para el checkpoint publicado es `k=32`, tras evaluar los rangos 256, 128, 64 y 32 en una RTX 3090 (24 GB) sobre las 872 muestras de validación de SST-2.

Cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps aplica "LoRA healing": adaptadores LoRA con r=8, 50 pasos, `lr=2e-4` y un presupuesto de 45 segundos. En este checkpoint el healing está aplicado (según el autor, `LoRA Recovery Applied: True`). No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset de calibración ni detalles de RLHF/DPO (no aplicables a una tarea de clasificación supervisada).

## Capacidades

- Clasificación de sentimiento binaria (0 = negativo, 1 = positivo) sobre texto en inglés, según el pipeline declarado `text-classification`.
- Inferencia sobre entradas tokenizadas con el vocabulario estándar de `bert-base-uncased`.
- Reconstrucción programática del grafo comprimido mediante `neuralops.core.compression_pipeline.compress_model` y carga del state dict con `strict=False`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking"; es un encoder de clasificación, no un modelo generativo.
- Capacidad multilingüe: no; el vocabulario y el fine-tuning están restringidos a inglés.
- No se documentan capacidades adicionales más allá de la clasificación SST-2.

## Casos de uso

- Referencia metodológica de compresión: usar el checkpoint como caso de estudio reproducible del compresor `swift_svd_act` y de la rutina de LoRA healing de NeuralOps, comparando la curva de Pareto entre rangos k=256, 128, 64 y 32 sobre el mismo conjunto de validación.
- Pruebas de integración del pipeline NeuralOps: validar que la reconstrucción del modelo comprimido (`compress_model` + `load_state_dict(strict=False)`) funciona en un entorno de CI antes de aplicar la técnica a modelos mayores.
- Baseline negativo controlado: emplear el 50,92 % de precisión como cota inferior documentada frente a la que medir variantes de compresión o de healing en experimentos de investigación.
- Docencia y divulgación: ilustrar en un curso o artículo el impacto real de la factorización SVD agresiva en un transformer encoder pequeño, con métricas verificables en un split público (GLUE SST-2).
- Prototipado de clasificadores de muy bajo coste: en escenarios donde el 50,92 % de precisión sea aceptable (por ejemplo, filtros heurísticos o etiquetado preliminar de grandes volúmenes), el checkpoint de 57,1 MB reduce el espacio en disco y la huella de memoria frente al profesor.
- Análisis de sensibilidad al rango: estudiar cómo varía la precisión healed entre k=256 y k=32 (en los datos del autor, todos los rangos convergen a 50,92 %, lo que sugiere un problema de recuperación más que de capacidad).

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Valor |
|---|---|
| GLUE SST-2 validation accuracy (checkpoint k=32, healed) | 50,92 % |
| GLUE SST-2 validation accuracy (zero-shot, k=32) | 49,08 % |
| Teacher baseline (`bert-base-uncased` fine-tuneado) | 91,63 % |
| Parity delta vs teacher | -40,71 % |
| Split de evaluación | GLUE SST-2 validation (872 muestras) |
| Hardware de evaluación | NVIDIA GeForce RTX 3090 (24 GB) |

Evaluación multi-rango declarada por el autor:

| Rank (k) | Ratio físico | Params comprimidos (reducción) | Zero-shot | Healed | Parity vs teacher |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.034.882 (-38,8 %) | 49,08 % | 50,92 % (LoRA) | -40,71 % |
| 128 | 2,39x | 45.792.002 (-58,2 %) | 49,20 % | 50,92 % (LoRA) | -40,71 % |
| 64 | 3,11x | 35.170.562 (-67,9 %) | 49,08 % | 50,92 % (LoRA) | -40,71 % |
| 32 | 3,67x | 29.859.842 (-72,7 %) | 49,08 % | 50,92 % (LoRA) | -40,71 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el checkpoint ocupa 57,1 MB y el modelo comprimido tiene 29,86 M de parámetros. En FP32 la huella de pesos ronda los 120 MB, más activaciones y overhead del runtime.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor evaluó en una RTX 3090 (24 GB), pero el modelo cabe holgadamente en GPUs de 4-8 GB e incluso en CPU para lotes pequeños.
- Cabe en cualquier GPU consumer actual (RTX 3060, RTX 4060, GTX 1650, etc.) y en Apple Silicon vía MPS.
- Opciones de despliegue: el flujo documentado requiere `neuralops` para reconstruir la topología comprimida y cargar el state dict; no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI. El uso con `transformers` puro requeriría reconstruir manualmente los módulos `SVDLinear`.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño, se espera una latencia muy inferior a la del BERT-Base original, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Params | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-comp-swift-svd-act-sst2` (k=32) | 29,86 M | no disponible | 50,92 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (teacher fine-tuneado) | 109,48 M | 512 tokens (estándar BERT) | 91,63 % (según el autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 tokens | no disponible en la información proporcionada | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,48 M | 512 tokens | no disponible en la información proporcionada | Apache 2.0 | Hugging Face |

La comparación cuantitativa con alternativas comprimidas o destiladas no está disponible en la información proporcionada; los valores de referencia de los modelos alternativos deberían consultarse en sus respectivas model cards.

## Limitaciones y advertencias

- Degradación severa de precisión: 50,92 % frente al 91,63 % del profesor (-40,71 puntos), apenas por encima del azar en una tarea binaria. No es apto para producción en clasificación de sentimiento.
- El "healing" LoRA no recupera precisión: todos los rangos evaluados (256, 128, 64 y 32) convergen al mismo 50,92 %, lo que sugiere que la rutina de recuperación no está corrigiendo el daño de la compresión en este caso.
- Riesgo elevado de predicciones degeneradas o sesgadas: con precisión cercana al azar, la salida no refleja sentimiento real y puede amplificar sesgos del corpus SST-2 (reseñas de películas en inglés).
- Restricción de idioma: solo inglés; no se ha validado en castellano ni en otros idiomas.
- Restricción de tarea: únicamente clasificación binaria SST-2; no debe reutilizarse como encoder genérico sin revalidar.
- Dependencia de la librería `neuralops` y de la reconstrucción manual del grafo comprimido; la carga con `transformers` estándar no es directa.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento ni sobre la idoneidad del checkpoint comprimido.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) en el model-index; conviene reproducirlos antes de citarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-swift-svd-act-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor `swift_svd_act`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/swift_svd_act.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
