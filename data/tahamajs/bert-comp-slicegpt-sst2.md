# tahamajs/bert-comp-slicegpt-sst2

## Resumen

`tahamajs/bert-comp-slicegpt-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) físicamente comprimido mediante la técnica SliceGPT (implementada como `PCAActivationAwareSVDCompressor` en la librería NeuralOps) y posteriormente "curado" con LoRA, tras un ajuste fino sobre la tarea de clasificación de sentimiento GLUE SST-2. Lo publica Taha Majlesi como parte del "NeuralOps Compressed & LoRA-Healed Model Zoo", un experimento de investigación sobre compresión de modelos más que un modelo listo para producción.

El modelo parte de los 109.483.778 parámetros de BERT-Base (12 capas, dimensión oculta 768) y los reduce a 35.170.562 parámetros en el rango de compresión `k=64`, lo que supone una reducción del 67,88% y un ratio de compresión físico de 3,113x. La motivación es demostrar un pipeline de compresión activation-aware con recuperación mediante LoRA de bajo rango (r=8) en un presupuesto de 50 pasos y 45 segundos.

Su relevancia es metodológica: el propio autor reporta una precisión en validación SST-2 del 50,92% frente al 91,63% del profesor original, es decir, una caída de 40,71 puntos. Los rangos `k=256`, `k=128` y `k=32` fallan con `FAIL_CRASH`. Es, por tanto, un artefacto de investigación que ilustra tanto el potencial como los límites actuales del pipeline, no un clasificador de sentimiento utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, D=768), comprimido con SliceGPT (PCA-ASVD por capa) |
| Parametros totales | 35.170.562 (comprimido, rango k=64); 109.483.778 en el modelo base original |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base BERT-Base admite 512 tokens) |
| Tipos de cuantizacion | no disponible (la compresion aplicada es de bajo rango, no una cuantizacion numerica; el checkpoint se serializa en `pytorch_model.bin`) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`) con factores de bajo rango y adaptadores LoRA integrados; requiere reconstruccion de topologia con NeuralOps |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder BERT-Base con 12 capas y dimensión oculta 768, preentrenado por Google y ajustado a clasificación binaria de sentimiento (2 etiquetas) sobre GLUE SST-2. Sobre ese checkpoint se aplica el compresor `PCAActivationAwareSVDCompressor` (registro `slicegpt`), que para cada capa lineal objetivo: (1) acumula online la covarianza de activaciones de entrada C = E[X^T X], (2) calcula una rotación ortogonal Q mediante eigendescomposición de C, (3) rota los pesos W_pca = W @ Q, (4) trunca a las `keep` coordenadas principales y (5) almacena la factorización de rango `keep` como U = W_pca[:, :keep] y V = Q[:, :keep]^T. La reducción de parámetros por capa es proporcional a (d_out + d_in) frente al producto completo.

El proceso de recuperación aplica LoRA de rango r=8 cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x, con 50 pasos de entrenamiento a lr=2e-4 y un presupuesto de 45 segundos. La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras del split de validación de GLUE SST-2. No se detalla en la información disponible la composición del dataset de ajuste fino, el número de tokens de entrenamiento ni si hubo RLHF/DPO (no aplicable en un encoder de clasificación).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, con dos etiquetas de salida.
- Codificación de texto en inglés mediante el vocabulario estándar `bert-base-uncased`.
- Ajuste fino específico para GLUE SST-2; no conserva de forma fiable las capacidades del BERT-Base original tras la compresión y el ajuste.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo "thinking", visión ni audio.
- Multilingüe: no; solo inglés.
- Generación de texto: no; es un encoder de clasificación.

## Casos de uso

- Investigación en compresión de modelos: servir como referencia reproducible del pipeline SliceGPT de NeuralOps con rango k=64, telemetría en `compression_summary.json` y comparación frente al profesor de 91,63% en SST-2. Adecuado para estudiar el impacto de la compresión activation-aware en encoders pequeños.
- Estudio de recuperación con LoRA: analizar cómo 50 pasos de LoRA r=8 recuperan 1,84 puntos (de 49,08% a 50,92%) sobre un modelo comprimido 3,11x, como caso base para calibrar presupuestos de "healing".
- Benchmark de robustez de compresores: usar los resultados `FAIL_CRASH` en k=256, 128 y 32 como evidencia de los límites operativos del compresor en BERT-Base y guiar el diseño de experimentos posteriores.
- Docencia y formación técnica: ilustrar en un curso de eficiencia de modelos la diferencia entre compresión física de pesos y cuantización numérica, y el coste en precisión de cada enfoque.
- Pruebas de integración de la librería NeuralOps: validar el flujo `compress_model` + `load_state_dict(strict=False)` en entornos CI antes de aplicar el pipeline a modelos mayores.
- Evaluación comparativa de checkpoints comprimidos: incluir este modelo como baseline de "compresión agresiva con degradación alta" frente a alternativas de destilación o cuantización en estudios internos.
- No recomendado para clasificación de sentimiento en producción: la precisión del 50,92% está próxima al azar en una tarea binaria y la paridad frente al profesor es de -40,71 puntos.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados):

| Metrica | Valor |
|---|---|
| GLUE SST-2, split validation, accuracy (checkpoint empaquetado, k=64 con LoRA) | 50,92% |
| GLUE SST-2, accuracy zero-shot (k=64, sin LoRA) | 49,08% |
| GLUE SST-2, accuracy del profesor BERT-Base fine-tuned | 91,63% |
| Paridad frente al profesor | -40,71 puntos |
| Ratio de compresion fisico | 3,113x |
| Reduccion de parametros | -67,88% (35.170.562 vs 109.483.778) |

Evaluación multi-rango reportada por el autor (RTX 3090, 872 muestras de validación SST-2):

| Rango (k) | Ratio fisico | Parametros comprimidos | Zero-shot | Con LoRA | Paridad vs profesor |
|:---:|:---:|---:|---:|---:|---:|
| 256 | — | — | FAIL_CRASH | — | — |
| 128 | — | — | FAIL_CRASH | — | — |
| 64 (empaquetado) | 3,11x | 35.170.562 | 49,08% | 50,92% | -40,71% |
| 32 | — | — | FAIL_CRASH | — | — |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 67,2 MB según la model card; en FP32 ocupa aproximadamente 140 MB de pesos, más activaciones. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna; la evaluación del autor se realizó en una NVIDIA GeForce RTX 3090 (24 GB), aunque el modelo no requiere esa capacidad.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU para inferencia puntual.
- Opciones de despliegue: no es directamente compatible con vLLM, TGI, llama.cpp ni Ollama, ya que requiere reconstruir la topología comprimida con `neuralops.core.compression_pipeline.compress_model` antes de cargar el `state_dict`. El flujo documentado es `transformers` + `neuralops` + `huggingface_hub`.
- Latencia y throughput: no disponibles en la información proporcionada. Cabe esperar una reducción de FLOPs proporcional a la compresión de rango, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-comp-slicegpt-sst2` (k=64) | 35,17 M (comprimido) | no disponible | 50,92% | MIT | Hugging Face, requiere NeuralOps |
| `google-bert/bert-base-uncased` (profesor fine-tuned SST-2, referencia del autor) | 109,48 M | 512 tokens | 91,63% | Apache 2.0 | Hugging Face, transformers estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en esta busqueda | Apache 2.0 | Hugging Face, transformers estándar |
| `textattack/bert-base-uncased-SST-2` | 109,48 M | 512 tokens | no disponible en esta busqueda | no disponible en esta busqueda | Hugging Face, transformers estándar |

La comparación con DistilBERT y con el BERT fine-tuned de TextAttack se ofrece como referencia de categoría (clasificadores SST-2 en inglés); no se dispone de sus cifras exactas en la información proporcionada, por lo que se marcan como no disponibles. El dato relevante es que este checkpoint comprimido pierde 40,71 puntos frente a su propio profesor.

## Limitaciones y advertencias

- Precisión muy baja: 50,92% en SST-2 binario, prácticamente equivalente a una predicción aleatoria. No es apto para uso en producción.
- Degradación severa por compresión: la paridad frente al profesor es de -40,71 puntos; el pipeline de "healing" con LoRA solo recupera 1,84 puntos.
- Inestabilidad del compresor: los rangos k=256, k=128 y k=32 fallan con `FAIL_CRASH`, lo que indica que el pipeline no es robusto fuera del punto k=64 seleccionado.
- Dependencia de la librería NeuralOps: la carga requiere reconstruir la topología con `compress_model` y `load_state_dict(strict=False)`; no es un checkpoint plug-and-play con `transformers` estándar.
- Idiomas: solo inglés; no hay soporte multilingüe.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de `bert-base-uncased` y entrenarse en SST-2, hereda los sesgos del corpus de reseñas de películas y del preentrenamiento original.
- Riesgo de alucinación: no aplica en sentido generativo, pero la calibración de probabilidades es dudosa dado el bajo rendimiento.
- Licencia MIT: permite uso comercial, pero la degradación de precisión hace inviable ese escenario en la práctica.
- Sin verificación independiente: los resultados del `model-index` están marcados como `verified: false`; no hay benchmarks de terceros.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni comunidad asociada.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-comp-slicegpt-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor SliceGPT: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/slicegpt.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
