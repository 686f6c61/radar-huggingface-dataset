# tahamajs/bert-comp-svd-linear-sst2

## Resumen

`tahamajs/bert-comp-svd-linear-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2, publicado por Taha Majlesi dentro del proyecto NeuralOps (Compressor Zoo). El modelo aplica el compresor `svd_linear` (`SVDLinearCompressor`), que sustituye las capas `Linear`/`Conv1D` por capas de bajo rango basadas en descomposición en valores singulares, y posteriormente aplica un proceso de "curación" con LoRA (`r=8`, 50 pasos, `lr=2e-4`) para recuperar parte de la precisión perdida por la compresión.

El checkpoint serializado corresponde al rango `k=128`, con un ratio de compresión físico de `1.50x` y una reducción de parámetros del `33.4%` (de `109.483.778` a `72.914.690` parámetros). Sobre la partición de validación de SST-2 (872 muestras) alcanza un `73.51%` de accuracy, frente al `91.63%` del modelo profesor sin comprimir, lo que supone una pérdida de 18,12 puntos porcentuales.

Su relevancia es fundamentalmente metodológica y de investigación: sirve como artefacto reproducible para estudiar el compromiso entre compresión física, recuperación mediante LoRA y degradación de la precisión en tareas de clasificación. No es un modelo pensado para producción con requisitos de calidad estrictos, dado el gap sustancial frente al baseline. El repositorio ocupa 0,1 GB y la licencia es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (12 capas, `D=768`), con capas lineales sustituidas por `SVDLinearLayer` de bajo rango |
| Parámetros totales | 72.914.690 (comprimido, `k=128`); base original: 109.483.778 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de `bert-base-uncased`; el autor no la declara) |
| Tipos de cuantización | no disponible (el artefacto se distribuye en `pytorch_model.bin` sin cuantización declarada) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch) + `config.json` + `compression_summary.json` |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas y dimensión oculta 768 con 109.483.778 parámetros, ya afinado sobre GLUE SST-2. Sobre esa base, NeuralOps aplica el compresor `svd_linear`, que reemplaza las capas `Linear`/`Conv1D` por `SVDLinearLayer`: cada matriz de pesos se factoriza en dos matrices de menor rango `k`, reduciendo el número de parámetros almacenados de forma físicamente medible. El checkpoint publicado usa `k=128`, con `72.914.690` parámetros resultantes y un ratio de compresión de `1.502x`.

El pipeline de entrenamiento documentado incluye una fase de "healing" con LoRA: cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a `1.10x`, se aplica LoRA de rango `r=8` durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos. La evaluación multi-rango se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras de validación de SST-2. No se documentan en la información disponible el número de tokens de preentrenamiento, la composición del dataset más allá de GLUE SST-2, ni detalles sobre RLHF/DPO (no aplicables a un encoder de clasificación). La innovación técnica destacable es la combinación de compresión SVD física con recuperación LoRA selectiva y una evaluación Pareto multi-rango (`k=256, 128, 64, 32`) con telemetría machine-readable en `compression_summary.json`.

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) sobre texto en inglés, con 2 etiquetas de salida (`num_labels=2`).
- Clasificación de texto genérica por transferencia desde BERT-Base (la cabeza es de secuencia, pero el encoder subyacente es reutilizable).
- Comprensión lectora y representaciones contextuales en inglés heredadas del modelo base, aunque degradadas por la compresión.
- No soporta tool calling ni function calling (es un encoder de clasificación, no un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no; únicamente inglés (`bert-base-uncased`).
- No dispone de modo "thinking", visión ni audio.
- Sirve como artefacto de referencia para experimentos de compresión y recuperación LoRA.

## Casos de uso

- **Investigación en compresión de modelos**: usar el checkpoint como baseline reproducible para comparar técnicas SVD, pruning o quantización sobre BERT-Base en SST-2, gracias a la telemetría multi-rango incluida en `compression_summary.json`.
- **Análisis del compromiso compresión-precisión**: estudiar la curva Pareto entre `k=256`, `k=128`, `k=64` y `k=32` para entender a partir de qué rango la recuperación LoRA deja de ser efectiva (los rangos 256, 64 y 32 caen a ~49-51% de accuracy).
- **Prototipado de clasificadores de sentimiento de bajo coste**: desplegar un clasificador binario de sentimiento en entornos con restricciones de memoria donde el `33.4%` de reducción de parámetros sea relevante, aceptando la pérdida de precisión.
- **Docencia y demostraciones de SVD en transformers**: ilustrar cómo la factorización de bajo rango afecta a las representaciones internas de un encoder BERT y cómo LoRA puede compensar parcialmente el daño.
- **Pipeline de clasificación por lotes en CPU**: al ser un modelo de 72,9 M de parámetros con pesos en `pytorch_model.bin`, puede ejecutarse en CPU para tareas de clasificación de sentimiento no críticas, como etiquetado preliminar de reseñas.
- **Evaluación de infraestructuras de compresión**: integrar el checkpoint en el ecosistema NeuralOps (`compress_model`, `COMPRESSOR_REGISTRY`) para validar pipelines de compresión y reconstrucción de topologías comprimidas antes de aplicarlos a modelos mayores.
- **Filtrado de sentimiento en ingesta de datos**: usar el modelo como primer filtro rápido en un pipeline de curación de corpus en inglés, aceptando el ruido del ~26% de error frente al profesor.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados, `verified: false`) sobre GLUE SST-2, split de validación (872 muestras), evaluados en RTX 3090:

| Rank (`k`) | Ratio físico | Parámetros comprimidos (reducción) | Accuracy zero-shot | Accuracy tras LoRA | Parity vs profesor (91,63%) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,27x | 85.890.818 (-21,5%) | 69,27% | 49,08% (LoRA) | -42,55% |
| **128** (publicado) | **1,50x** | **72.914.690 (-33,4%)** | **59,17%** | **73,51% (LoRA)** | **-18,12%** |
| 64 | 1,65x | 66.426.626 (-39,3%) | 51,38% | 50,92% (LoRA) | -40,71% |
| 32 | 1,73x | 63.182.594 (-42,3%) | 50,92% | 50,92% (LoRA) | -40,71% |

Baseline del profesor (`bert-base-uncased` afinado en SST-2 sin comprimir): **91,63%** de accuracy en validación. El checkpoint publicado (`k=128`) alcanza **73,51%** de accuracy en la model-index. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es esperable al tratarse de un encoder de clasificación.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el checkpoint pesa 139,5 MB en `pytorch_model.bin` (float32), por lo que la inferencia requiere menos de 1 GB de VRAM en la práctica; el repositorio completo ocupa 0,1 GB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor validó en NVIDIA GeForce RTX 3090 (24 GB) por comodidad, no por necesidad.
- **Cabe en GPU de consumo**: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, GTX 1650, etc.) e incluso en CPU.
- **Opciones de despliegue**: el flujo documentado usa `transformers` + `neuralops` + `huggingface_hub` para reconstruir la topología comprimida y cargar el state dict con `strict=False`. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI; al ser un encoder de clasificación, el despliegue típico sería con `transformers` o TorchServe.
- **Latencia y throughput**: no disponibles en la información proporcionada. El autor menciona un presupuesto de 45 segundos para el healing LoRA, no para inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 val acc | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/bert-comp-svd-linear-sst2` (k=128) | 72,9 M (comprimido) | no disponible | 73,51% | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor SST-2) | 109,5 M | 512 tokens (estándar BERT) | 91,63% | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,5 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparación más directa es con el propio profesor: el checkpoint comprimido reduce parámetros un 33,4% pero pierde 18,12 puntos de accuracy, un compromiso peor que el de alternativas de destilación como DistilBERT (que reduce ~40% de parámetros con pérdidas típicamente menores, aunque no se dispone de cifras en esta ficha). Para alternativas con calidad de producción en SST-2, el profesor sin comprimir o `textattack/bert-base-uncased-SST-2` son opciones más adecuadas.

## Limitaciones y advertencias

- **Pérdida de precisión severa**: 73,51% frente al 91,63% del profesor, una caída de 18,12 puntos. No apto para producción con requisitos de calidad.
- **Recuperación LoRA inconsistente**: en `k=256`, `k=64` y `k=32` el healing LoRA empeora o no mejora la accuracy zero-shot (49,08%, 50,92%, 50,92%), lo que sugiere inestabilidad del proceso de recuperación.
- **Sesgos heredados**: al derivar de `bert-base-uncased` afinado en SST-2, arrastra los sesgos de género, raza y dominio del corpus original y del dataset de reseñas de películas.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí hay riesgo de clasificaciones erróneas confiadas (falsos positivos/negativos) por la degradación de representaciones.
- **Solo inglés**: no soporta otros idiomas; el tokenizador es `bert-base-uncased`.
- **Contexto limitado**: aunque no se declara explícitamente, hereda la ventana de 512 tokens de BERT-Base.
- **Formato no estándar**: requiere reconstruir la topología con `neuralops` y cargar el state dict con `strict=False`; no es plug-and-play con `AutoModelForSequenceClassification.from_pretrained` directamente.
- **Licencia MIT**: permite uso comercial, pero el modelo base `google-bert/bert-base-uncased` está bajo Apache 2.0, cuyas condiciones deben respetarse igualmente.
- **Resultados no verificados**: la model-index marca `verified: false`; las cifras provienen del autor y no han sido auditadas de forma independiente.
- **Repositorio con 0 descargas y 0 likes**: sin validación comunitaria; usar con cautela en cualquier flujo crítico.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-comp-svd-linear-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor SVD: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/svd_linear.py
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
