# tahamajs/bert-comp-tt-compressor-sst2

## Resumen

`tahamajs/bert-comp-tt-compressor-sst2` es un checkpoint de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2 y posteriormente comprimido mediante la técnica `tt_compressor` (descomposición tensorial tipo Tensor Train) de la librería NeuralOps, desarrollada por Taha Majlesi. El modelo no es un modelo base nuevo, sino un artefacto de investigación sobre compresión de modelos: parte de los 109.483.778 parámetros del BERT-Base original y los reduce a 63.870.722 parámetros (una reducción del 41,66 %, ratio físico de 1,714x) sustituyendo capas `Linear`/`Conv1D` por capas `TTLinearLayer` cuando la descomposición cabe dentro del presupuesto de error, con retroceso a `SVDLinearLayer` en caso contrario.

Tras la compresión, el autor aplica un proceso de "curación" con LoRA (r=8, 50 pasos, lr=2e-4) para recuperar parte de la precisión perdida. El resultado es un clasificador binario de sentimiento (positivo/negativo) en inglés que alcanza un 75,69 % de accuracy en la partición de validación de SST-2, frente al 91,63 % del modelo profesor sin comprimir. La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de compresión agresiva de BERT con su coste en precisión; por otro, sirve como referencia metodológica para quienes evalúan técnicas de compresión (TT, SVD, LoRA healing) en lugar de modelos de propósito general.

El modelo se publica bajo licencia MIT, con pesos en formato PyTorch (`pytorch_model.bin`) y un tamaño de repositorio de aproximadamente 0,1 GB. No está pensado para uso en producción como clasificador de sentimiento de alta calidad, sino como artefacto reproducible de un estudio de compresión multi-rango (k=256, 128, 64, 32).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base) con capas Linear/Conv1D reemplazadas por TTLinearLayer (Tensor Train) o SVDLinearLayer |
| Parametros totales | 63.870.722 (comprimido); 109.483.778 en el modelo base original |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de bert-base-uncased; no se especifica otra en la informacion disponible) |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en punto flotante PyTorch; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); requiere reconstruccion de topologia con NeuralOps antes de cargar |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder BERT-Base: 12 capas, dimensión oculta D=768 y 109.483.778 parámetros en su forma original. Sobre ese modelo afinado en SST-2 se aplica el compresor `tt_compressor` (`TTCompressor`, familia `tensor_decomp`), que descompone las matrices de peso de las capas lineales en factores Tensor Train de rango k. En el checkpoint publicado se usa k=256, lo que produce una reducción física del 41,66 % de parámetros (ratio 1,714x). Las capas que no pueden comprimirse dentro del presupuesto de error quedan intactas, y las que fallan la descomposición TT caen a SVD.

El proceso de entrenamiento posterior a la compresión es un "LoRA healing": se aplica un adaptador LoRA de rango r=8 durante 50 pasos con learning rate 2e-4 y un presupuesto de 45 segundos, con el objetivo de recuperar precisión tras la compresión. En el rango k=256, el healing eleva la accuracy de zero-shot de 71,44 % a 75,69 %. El autor documenta además una evaluación multi-rango (k=256, 128, 64, 32) realizada físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras de validación de SST-2. No se detalla la composición del dataset de entrenamiento más allá de GLUE SST-2, ni si hubo RLHF/DPO (no aplicable a una tarea de clasificación).

## Capacidades

- Clasificación binaria de sentimiento en inglés (etiquetas 0=negativo, 1=positivo) sobre textos de hasta 512 tokens.
- Razonamiento semántico limitado al dominio SST-2 (reseñas de cine); no es un modelo generativo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe: únicamente inglés (vocabulario `bert-base-uncased`).
- No dispone de modo "thinking", visión, audio ni otras capacidades especiales.
- Sirve como artefacto de referencia para estudiar el efecto de la compresión TT + LoRA en un downstream concreto.

## Casos de uso

- Investigación en compresión de modelos: reproducir el pipeline de NeuralOps (`compress_model` con `tt_compressor`, rank 256) y comparar la curva accuracy vs. ratio de compresión frente a SVD, pruning o quantización. Es adecuado porque el autor publica telemetría completa en `compression_summary.json` para los rangos 256, 128, 64 y 32.
- Clasificación de sentimiento de bajo coste en entornos con restricciones de memoria: al tener un 41,7 % menos de parámetros que BERT-Base, puede desplegarse en dispositivos con VRAM limitada, aceptando la caída de precisión de ~16 puntos frente al profesor.
- Baseline para experimentos de LoRA healing: el checkpoint permite medir cuánto recupera un adaptador r=8 entrenado 50 pasos frente al modelo comprimido sin curar (71,44 % → 75,69 %).
- Filtrado preliminar de reseñas en pipelines de datos: usar el modelo como primer filtro de polaridad en inglés antes de un modelo mayor, asumiendo su menor exactitud.
- Docencia y divulgación sobre descomposición tensorial: ilustra de forma tangible cómo TTLinearLayer y SVDLinearLayer sustituyen capas densas en un transformer real.
- Evaluación de robustez de checkpoints comprimidos: comparar el comportamiento del modelo en dominios fuera de SST-2 (por ejemplo, reseñas de productos) para caracterizar la degradación de generalización tras compresión.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index y en la model card (no verificados de forma independiente; `verified: false`).

| Metrica | Valor |
|---|---|
| GLUE SST-2 validation accuracy (checkpoint publicado, k=256, con LoRA) | 75,69 % |
| GLUE SST-2 validation accuracy (k=256, zero-shot, sin LoRA) | 71,44 % |
| Teacher baseline (bert-base-uncased afinado, sin comprimir) | 91,63 % |
| Parity delta frente al teacher | -15,94 % |

Evaluación multi-rango del autor (RTX 3090, 872 muestras de validación):

| Rank (k) | Ratio fisico | Parametros comprimidos (reduccion) | Zero-shot acc | Healed acc | Parity vs teacher |
|:---:|:---:|---:|---:|---:|---:|
| 256 (publicado) | 1,71x | 63.870.722 (-41,7 %) | 71,44 % | 75,69 % (LoRA) | -15,94 % |
| 128 | 2,48x | 44.209.922 (-59,6 %) | 67,89 % | 72,59 % (LoRA) | -19,04 % |
| 64 | 3,19x | 34.379.522 (-68,6 %) | 50,92 % | 50,92 % (LoRA) | -40,71 % |
| 32 | 3,72x | 29.464.322 (-73,1 %) | 49,08 % | 50,92 % (LoRA) | -40,71 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa ~121,9 MB en `pytorch_model.bin`; en FP32 ocupa aproximadamente 0,25 GB de VRAM (63,87 M parámetros × 4 bytes), más activaciones. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con ≥2 GB de VRAM es suficiente; el autor evaluó en una NVIDIA GeForce RTX 3090 (24 GB), aunque el modelo no la requiere.
- Cabe en GPU consumer: sí, en GTX 1650, RTX 3050, RTX 4060, RTX 4090, etc.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La carga requiere `transformers` + `neuralops` para reconstruir la topología comprimida antes de aplicar `load_state_dict(strict=False)`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 acc | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-comp-tt-compressor-sst2` (k=256) | 63,87 M (comprimido) | 512 | 75,69 % | MIT | Hugging Face, requiere NeuralOps |
| `google-bert/bert-base-uncased` afinado en SST-2 (teacher) | 109,48 M | 512 | 91,63 % | Apache 2.0 | Hugging Face, estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 | no disponible en la información proporcionada | Apache 2.0 | Hugging Face, estándar |
| `textattack/bert-base-uncased-SST-2` | 109,48 M | 512 | no disponible en la información proporcionada | MIT (según el autor del checkpoint) | Hugging Face, estándar |

La comparación con DistilBERT y con el checkpoint de TextAttack no puede cuantificarse con los datos disponibles; se incluyen como alternativas de la misma categoría (clasificadores SST-2 en inglés) pero sin cifras verificables en esta ficha.

## Limitaciones y advertencias

- Pérdida de precisión significativa: 15,94 puntos de accuracy frente al teacher en el rango publicado (75,69 % vs. 91,63 %). No es recomendable como clasificador de producción de alta calidad.
- El checkpoint no es cargable directamente con `AutoModel.from_pretrained`: requiere reconstruir la topología con `neuralops` (`compress_model` con `tt_compressor`, rank 256) y cargar el state dict con `strict=False`, lo que añade fragilidad operativa.
- Sesgos heredados de `bert-base-uncased` y del corpus SST-2 (reseñas de cine en inglés, dominio estrecho); no se documenta ninguna mitigación.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas fuera de distribución, especialmente en textos largos, dominios distintos o inglés no estándar.
- Cobertura monolingüe: solo inglés; el tokenizador `bert-base-uncased` no maneja bien otros idiomas.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento; el modelo base `google-bert/bert-base-uncased` tiene su propia licencia Apache 2.0 que conviene revisar.
- Los benchmarks están declarados por el autor con `verified: false`; no han sido replicados de forma independiente en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-comp-tt-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/tensor_decomp/tt_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
