# tahamajs/bert-comp-quarot-sst2

## Resumen

`tahamajs/bert-comp-quarot-sst2` es un checkpoint de `google-bert/bert-base-uncased` afinado sobre GLUE SST-2 (clasificación de sentimiento binaria) y procesado con el compresor `QuaRotCompressor` de la librería NeuralOps, desarrollada por Taha Majlesi. QuaRot aplica cuantización de 4 bits / FP8 con pre-rotación aleatorizada de Walsh-Hadamard, una técnica que busca hacer la cuantización más robusta frente a valores atípicos en los pesos y activaciones.

El modelo se publica como ejemplo del "Compressor Zoo" de NeuralOps, un catálogo de checkpoints comprimidos y, cuando es necesario, "curados" con LoRA. En este caso concreto el checkpoint serializado corresponde al rango Pareto `k=32`, con un ratio de compresión físico de `1.00x` y una reducción de parámetros del `0.0%`: es decir, el artefacto empaquetado mantiene los `109.483.778` parámetros del BERT-base original. La accuracy declarada en validación de SST-2 es `91.63%`, idéntica a la del profesor de referencia.

Su relevancia es principalmente metodológica y de reproducibilidad: sirve para inspeccionar cómo NeuralOps serializa topologías comprimidas con QuaRot, cómo registra telemetría multi-rango (`k=256, 128, 64, 32`) y cómo integra recuperación LoRA cuando la compresión degrada la métrica. No es un modelo pensado para producción general, sino una pieza de evaluación dentro de un zoo de compresión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (12 capas, dimensión oculta 768) |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-base-uncased admite típicamente 512 tokens; no se declara explícitamente en la model card) |
| Tipos de cuantizacion | QuaRot: 4 bits / FP8 con pre-rotación de Walsh-Hadamard; el checkpoint empaquetado se serializa en `pytorch_model.bin` |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado), más `config.json`, `compression_summary.json` y assets del tokenizer |

## Arquitectura y entrenamiento

La arquitectura base es BERT-base uncased: un transformer encoder de 12 capas con `D=768`, preentrenado por Google y posteriormente afinado para clasificación de sentimiento binaria sobre GLUE SST-2. Sobre ese modelo, NeuralOps aplica el compresor `quarot` (`QuaRotCompressor`, familia `quantization`), que implementa cuantización de 4 bits / FP8 con pre-rotación aleatorizada de Walsh-Hadamard. La model card no detalla el número de tokens de preentrenamiento ni la composición del corpus, más allá de indicar el dataset `nyu-mll/glue` (configuración `sst2`).

El pipeline de evaluación es multi-rango. Se probaron los rangos `k=256`, `128`, `64` y `32` sobre la partición de validación de SST-2 (`872` muestras) en una NVIDIA GeForce RTX 3090 de 24 GB. El rango `k=256` falló con `FAIL_CRASH`; los rangos `128`, `64` y `32` mantuvieron `91.63%` de accuracy en modo zero-shot, sin necesidad de aplicar LoRA healing (la propia model card indica `LoRA Recovery Applied: False`). La política de recuperación descrita consiste en aplicar LoRA `r=8` durante `50` pasos con `lr=2e-4` y un presupuesto de `45 s` cuando la compresión zero-shot cae más de `2.0%` y reduce más de `1.10x`; en este checkpoint no se activó.

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) en inglés, con dos etiquetas de salida (`num_labels=2`).
- Comprensión de texto en inglés heredada de BERT-base uncased, incluyendo vocabulario WordPiece estándar.
- Inferencia sobre frases y párrafos cortos, limitada por la ventana de BERT-base (típicamente 512 tokens).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modo "thinking".
- Capacidad multilingüe: no, únicamente inglés.
- Capacidad de generación de texto: no, es un modelo de clasificación (cabecera `BertForSequenceClassification`).

## Casos de uso

- Clasificación de opiniones en inglés para análisis de sentimiento de reseñas de producto: el modelo devuelve una etiqueta binaria por texto, adecuado para pipelines de etiquetado por lotes con BERT-base como coste base.
- Moderación de comentarios en foros en inglés: filtrado rápido de mensajes con polaridad negativa como señal previa a revisión humana, aprovechando la latencia baja de un encoder de 110 M de parámetros.
- Investigación en compresión de modelos: sirve como referencia reproducible para comparar QuaRot frente a otras técnicas del Compressor Zoo de NeuralOps sobre una tarea estándar (SST-2) con métrica pública.
- Validación de pipelines de cuantización: útil para comprobar que la reconstrucción del state dict comprimido con `compress_model(..., {"method": "quarot", "rank": 32})` y `load_state_dict(..., strict=False)` reproduce la accuracy declarada.
- Benchmarking interno de latencia y memoria: al mantener el tamaño del BERT-base original, permite medir el coste de la capa de cuantización QuaRot frente al modelo sin comprimir en la misma GPU.
- Docencia y demostraciones de técnicas de cuantización: ejemplo mínimo de cómo se serializa un checkpoint con buffers de cuantización y telemetría (`compression_summary.json`) en un formato reproducible.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| GLUE SST-2 (validation) | Accuracy | 91.63% |

Evaluación multi-rango declarada por el autor sobre GLUE SST-2 validation (`872` muestras, RTX 3090):

| Rank (`k`) | Ratio fisico | Parametros comprimidos | Zero-shot acc | Healed acc | Paridad vs profesor (91.63%) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | — | — | FAIL_CRASH | — | — |
| 128 | 1.00x | 109.483.778 (-0.0%) | 91.63% | 91.63% | +0.00% |
| 64 | 1.00x | 109.483.778 (-0.0%) | 91.63% | 91.63% | +0.00% |
| 32 (empaquetado) | 1.00x | 109.483.778 (-0.0%) | 91.63% | 91.63% | +0.00% |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa `208.9 MB` en disco; en FP32 en memoria ocupa aproximadamente `0,44 GB` de pesos, y en la práctica menos de `1 GB` de VRAM en inferencia con batch pequeño.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor evaluó en una NVIDIA GeForce RTX 3090 (24 GB), pero el modelo cabe holgadamente en GPUs de 4-8 GB (GTX 1650, RTX 3050, RTX 4060, etc.).
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer con al menos 2 GB de VRAM para batch pequeño.
- Opciones de despliegue: la model card solo documenta el flujo con la librería `neuralops` y `transformers` (reconstrucción con `compress_model` y carga del state dict). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 acc | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `tahamajs/bert-comp-quarot-sst2` | 109,5 M | no disponible | 91,63% (declarado por autor) | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor) | 109,5 M | 512 tokens | 91,63% (referencia del autor) | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,5 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,9 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparación con alternativas de la misma categoría (BERT-base afinado en SST-2) muestra que este checkpoint no reduce parámetros respecto al profesor (`1.00x`) y replica su accuracy. Su valor diferencial está en el pipeline de cuantización QuaRot y la telemetría multi-rango, no en una mejora de eficiencia o precisión.

## Limitaciones y advertencias

- El checkpoint empaquetado no reduce parámetros (`1.00x`, `-0.0%`): no ofrece ahorro de memoria ni de cómputo frente a BERT-base estándar.
- El rango `k=256` falló con `FAIL_CRASH` durante la evaluación del autor; no se documenta la causa ni si el checkpoint empaquetado (`k=32`) es estable en todos los entornos.
- La accuracy de `91.63%` está declarada como no verificada (`verified: false`) en la model card.
- Modelo exclusivamente en inglés; no cubre otros idiomas.
- Ventana de contexto no declarada explícitamente en la model card; en BERT-base uncased es de 512 tokens, pero no se confirma para este checkpoint.
- Riesgo de alucinación no aplicable en sentido estricto (tarea de clasificación), pero sí de clasificaciones erróneas en textos ambiguos, irónicos o de dominio muy distinto a SST-2 (reseñas de películas).
- Sesgos heredados de BERT-base uncased y del corpus SST-2 (reseñas de cine en inglés), incluyendo posibles sesgos demográficos y de dominio.
- Licencia MIT declarada, con enlace a la licencia del repositorio NeuralOps; conviene revisar los términos del repositorio antes de uso comercial.
- La carga requiere la librería `neuralops` y reconstruir la topología comprimida antes de cargar el state dict; no es un checkpoint `transformers` estándar cargable directamente con `from_pretrained`.
- Al ser un modelo de 0 descargas y 0 likes en el momento de la ficha, no hay evidencia comunitaria de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-quarot-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor QuaRot: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/quarot.py
- Licencia del repositorio NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
