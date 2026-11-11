# tahamajs/bert-comp-compot-compressor-sst2

## Resumen

`tahamajs/bert-comp-compot-compressor-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2, comprimido con el motor `compot_compressor` (familia `low_rank`) de la librería NeuralOps y posteriormente "curado" con LoRA para recuperar parte de la precisión perdida. Lo publica Taha Majlesi (usuario `tahamajs`) como parte del "NeuralOps Compressed & LoRA-Healed Model Zoo", un catálogo de modelos BERT comprimidos con distintos ratios y evaluados de forma sistemática en la partición de validación de SST-2.

El modelo parte de un BERT-base de 109.483.778 parámetros (12 capas, dimensión oculta 768) y se reduce físicamente a 41.064.194 parámetros en el rango de compresión `k=64`, lo que supone una reducción del 62,49 % y un factor de compresión de 2,666x. Es relevante como ejemplo reproducible de compresión de bajo rango con recuperación LoRA: el espacio de compresión no es solo teórico, sino que se serializa un checkpoint concreto (`pytorch_model.bin` de 78,4 MB) y se documenta el coste en precisión frente al profesor original (91,63 % de accuracy en SST-2).

No es un modelo de propósito general ni un LLM generativo: es un clasificador binario de sentimiento en inglés, entrenado sobre SST-2 y destinado a experimentación con técnicas de compresión, no a despliegues de producción de alta exigencia. La licencia es MIT y los pesos se distribuyen en formato PyTorch (`pytorch_model.bin`), no en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, D=768), comprimido con `compot_compressor` (low-rank) y recuperado con LoRA |
| Parametros totales | 41.064.194 (checkpoint comprimido, `k=64`); modelo base original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-base-uncased admite hasta 512 tokens, pero la model card no lo declara explícitamente) |
| Tipos de cuantizacion | no disponible (se mencionan "low-rank factors / quantization buffers" en los artefactos, sin detallar tipos) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch state dict); tokenizador en `vocab.txt`, `tokenizer.json`, `tokenizer_config.json`; no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura de partida es BERT-base-uncased (encoder transformer de 12 capas y 768 de dimensión oculta) con una cabeza de clasificación de secuencia de 2 etiquetas. Sobre ese modelo, NeuralOps aplica `compot_compressor_factory`, un compresor de bajo rango (`low_rank`) que factoriza las matrices del modelo hasta el rango `k` seleccionado. En el checkpoint publicado se usa el rango `k=64`, que produce 41.064.194 parámetros (2,666x de compresión física, −62,49 %). El pipeline evalúa varios rangos (`k=256, 128, 64, 32`) y, cuando la compresión en zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x, aplica un "healing" con LoRA de rango `r=8` durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos.

Los datos de entrenamiento corresponden a GLUE SST-2 (dataset `nyu-mll/glue`, configuración `sst2`), con evaluación en la partición de validación de 872 muestras. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del corpus más allá de SST-2, ni si hubo RLHF/DPO (no aplica a un clasificador de este tipo). La innovación técnica destacable es el proceso de compresión física del state dict más recuperación LoRA dirigida, con telemetría por rango registrada en `compression_summary.json` y un ranking de Pareto que selecciona `k=64` como configuración "showcase".

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, orientada a SST-2.
- Inferencia de texto corto a nivel de frase, con el tokenizador estándar `bert-base-uncased`.
- Compresión física verificable: el checkpoint ocupa 78,4 MB y contiene los factores de bajo rango y los adaptadores LoRA integrados.
- Reproducibilidad del pipeline: el script de "quick start" reconstruye la topología comprimida con `compress_model` y carga el state dict con `strict=False`.
- Telemetría de compresión: `compression_summary.json` documenta los cuatro rangos evaluados y las métricas asociadas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking"; es un clasificador, no un modelo generativo.
- Capacidad multilingüe: no, solo inglés.

## Casos de uso

- **Análisis de sentimiento en reseñas de producto en inglés**: el modelo clasifica frases cortas en positivo/negativo; es adecuado para prototipos y para comparar el efecto de la compresión frente al profesor BERT-base (91,63 % de accuracy). Para producción de alta precisión conviene usar el profesor o un checkpoint con mayor accuracy.
- **Investigación en compresión de modelos**: sirve como caso de estudio reproducible de `compot_compressor` con rango `k=64`; permite medir la curva de Pareto entre ratio de compresión y accuracy y validar implementaciones propias de bajo rango más LoRA.
- **Docencia y experimentación con LoRA healing**: el pipeline (50 pasos, `r=8`, `lr=2e-4`) es un ejemplo compacto de recuperación de precisión tras compresión agresiva, útil en cursos de eficiencia de modelos.
- **Prototipado de clasificadores ligeros en CPU**: con 41 millones de parámetros y 78,4 MB de pesos, el checkpoint es manejable en entornos con recursos limitados para pruebas de concepto de clasificación de sentimiento.
- **Benchmarking de tooling de compresión**: comparar `compot_compressor` con otras técnicas (poda, cuantización, destilación) usando SST-2 como tarea de referencia y el profesor BERT-base como línea base.
- **Evaluación de robustez de clasificadores comprimidos**: analizar cómo afecta la compresión a la calibración y a los sesgos en un clasificador binario antes de plantear un despliegue real.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; `verified: false` en el model-index). Evaluación física en NVIDIA GeForce RTX 3090 (24 GB) sobre la partición de validación de GLUE SST-2 (872 muestras).

| Modelo / configuración | Ratio físico | Parámetros comprimidos (reducción) | Accuracy zero-shot | Accuracy tras LoRA | Paridad vs profesor (91,63 %) |
|---|---:|---:|---:|---:|---:|
| Profesor BERT-base SST-2 | 1,00x | 109.483.778 (0 %) | no disponible | 91,63 % | — |
| `k=256` | 1,21x | 90.609.410 (−17,2 %) | 83,14 % | 61,58 % (LoRA) | −30,05 % |
| `k=128` | 1,90x | 57.579.266 (−47,4 %) | 53,90 % | 50,92 % (LoRA) | −40,71 % |
| **`k=64` (checkpoint publicado)** | **2,67x** | **41.064.194 (−62,5 %)** | **50,92 %** | **76,15 % (LoRA)** | **−15,48 %** |
| `k=32` | 2,83x | 38.704.898 (−64,6 %) | 50,92 % | 71,67 % (LoRA) | −19,96 % |

El checkpoint publicado (`k=64`) obtiene 76,15 % de accuracy en validación de SST-2, frente al 91,63 % del profesor, es decir, 15,48 puntos por debajo. El patrón de resultados no es monótono: `k=128` rinde peor que `k=64` tras el healing, lo que el autor no explica en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el checkpoint pesa 78,4 MB en `pytorch_model.bin`; en FP32 ocupa aproximadamente 0,16 GB de pesos, más overhead de activaciones. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- **GPU recomendadas**: la evaluación del autor se realizó en una NVIDIA GeForce RTX 3090 (24 GB). Para inferencia basta una GPU consumer modesta (GTX 1650, RTX 3050, RTX 4060) o incluso CPU.
- **Cabe en GPU consumer**: sí, sin problema; también en CPU para lotes pequeños.
- **Opciones de despliegue**: PyTorch + Transformers con la librería `neuralops` para reconstruir la topología comprimida (ver "Quick Start" de la model card); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. Al no haber pesos en safetensors ni GGUF, la integración con esos runtimes requeriría conversión manual.
- **Latencia y throughput**: no disponibles en la información proporcionada. El único dato temporal es el presupuesto de 45 segundos para el healing LoRA, no la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `tahamajs/bert-comp-compot-compressor-sst2` (`k=64`) | 41.064.194 | no disponible | 76,15 % (declarado, no verificado) | MIT | Hugging Face, formato PyTorch |
| `google-bert/bert-base-uncased` (profesor, afinado SST-2) | 109.483.778 | 512 tokens (BERT estándar) | 91,63 % (declarado por el autor) | Apache 2.0 | Hugging Face, safetensors/PyTorch |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 millones | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face, ampliamente usado |
| `textattack/bert-base-uncased-SST-2` | ~109 millones | 512 tokens | no disponible en esta ficha | no disponible | Hugging Face |

La comparación con DistilBERT y con el BERT de TextAttack se ofrece como referencia de categoría (clasificadores SST-2 en inglés); no se dispone de sus métricas en la información proporcionada, por lo que no se comparan numéricamente. El checkpoint de NeuralOps destaca por su tamaño reducido (41 M de parámetros) y su licencia MIT, pero su accuracy es claramente inferior al profesor.

## Limitaciones y advertencias

- **Pérdida de precisión significativa**: 76,15 % frente al 91,63 % del profesor, una caída de 15,48 puntos. No es apto para producción que requiera alta exactitud.
- **Resultados no verificados**: el model-index marca la métrica como `verified: false`; los datos provienen del autor y no han sido replicados de forma independiente en esta ficha.
- **Resultados no monótonos**: `k=128` rinde peor que `k=64` tras el healing, lo que sugiere inestabilidad en el pipeline de recuperación LoRA; conviene validar cada rango antes de usarlo.
- **Idioma**: solo inglés; no hay capacidades multilingües.
- **Tarea limitada**: clasificación binaria de sentimiento en SST-2; no es un modelo generativo ni soporta tool calling, agentes ni razonamiento.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí hay riesgo de clasificaciones erróneas y de sobreajuste al dominio de SST-2 (reseñas de cine), con degradación fuera de distribución.
- **Sesgos**: no se documentan análisis de sesgos; el modelo hereda los del corpus SST-2 y del preentrenamiento de `bert-base-uncased`, sin evaluación adicional.
- **Formato y tooling**: pesos solo en `pytorch_model.bin`, requieren la librería `neuralops` y reconstrucción de la topología comprimida antes de cargar; no hay safetensors ni GGUF.
- **Licencia**: MIT para los pesos del checkpoint; el modelo base `google-bert/bert-base-uncased` es Apache 2.0. Verificar la licencia de NeuralOps en el repositorio de GitHub antes de uso comercial.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; proyecto de investigación reciente (creado en 2026), sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-compot-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/compot_compressor.py
- Licencia MIT de NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE (SST-2): https://huggingface.co/datasets/nyu-mll/glue
