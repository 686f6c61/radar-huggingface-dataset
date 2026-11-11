# tahamajs/bert-comp-bonsai-pruner-sst2

## Resumen

`bert-comp-bonsai-pruner-sst2` es un checkpoint de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2 y procesado con el motor de compresión `bonsai_pruner` (`bonsai_factory`) de la librería NeuralOps, desarrollada por Taha Majlesi. El modelo se publica como parte del "Compressed & LoRA-Healed Model Zoo" de NeuralOps, un conjunto de artefactos orientados a evaluar técnicas de poda progresiva y recuperación mediante LoRA sobre arquitecturas transformer estándar.

La relevancia del checkpoint es más metodológica que de rendimiento: sirve como referencia reproducible de un pipeline de compresión física con evaluación Pareto multi-rango (k=256, 128, 64 y 32). En el rango serializado (k=32) no se aplicó reducción efectiva de parámetros (ratio 1.00x, 109.483.778 parámetros, idéntico al BERT-base original), por lo que el artefacto empaquetado equivale funcionalmente al modelo base afinado, con la topología de compresión registrada en la configuración.

El modelo conserva la arquitectura BERT-base (12 capas, dimensión oculta 768, 109,5 M de parámetros) y una ventana de contexto de 512 tokens, herencia directa del modelo base. Su licencia MIT y su integración con la librería `neuralops` lo hacen útil como caso de estudio de compresión, no como sustituto de un clasificador de sentimiento de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), 12 capas, dimension oculta 768 |
| Parametros totales | 109.483.778 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (heredada de bert-base-uncased) |
| Tipos de cuantizacion | no disponible (el repo empaqueta pesos en `pytorch_model.bin` en precision original; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), mas `config.json`, `compression_summary.json` y assets del tokenizer |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT-base uncased: un transformer encoder bidireccional de 12 capas con 768 dimensiones ocultas y 12 cabezas de atencion, adaptado a clasificacion de secuencias con `num_labels=2`. El checkpoint parte de `google-bert/bert-base-uncased` afinado en GLUE SST-2 (split de validacion, 872 muestras) y posteriormente se procesa con el compresor `bonsai_pruner`, que aplica poda progresiva con estructura de baja graduacion ("bonsai"). La configuracion serializada registra `compression_method: "bonsai_pruner"` y `compression_rank: 32`.

El pipeline de NeuralOps evalua cuatro rangos (k=256, 128, 64, 32) y aplica "LoRA healing" (r=8, 50 pasos, lr=2e-4, presupuesto de 45 s) solo cuando la compresion zero-shot degrada la exactitud en mas de 2,0 puntos con una reduccion superior a 1,10x. En este checkpoint no se activo el healing (`LoRA Recovery Applied: False`) porque la reduccion fisica fue nula (1.00x) y la caida respecto al profesor (91,63% -> 86,81%) no cumplia el criterio de disparo. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset mas alla de SST-2, ni si hubo RLHF/DPO (no aplicable en un clasificador).

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en ingles, con salida de logits de dos clases.
- Razonamiento textual limitado al encoder bidireccional: no genera texto, solo produce representaciones y logits de clasificacion.
- Sin soporte de tool calling ni function calling: es un modelo de clasificacion, no un modelo conversacional.
- Sin soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles (vocabulario y entrenamiento de `bert-base-uncased`).
- Sin modo "thinking", vision ni audio.
- Integracion con la libreria `neuralops` para reconstruir la topologia comprimida y cargar el state dict.

## Casos de uso

- Clasificacion de resenas de producto en ingles: el modelo devuelve logits binarios de sentimiento sobre textos de hasta 512 tokens, adecuado para pipelines de moderacion o analisis de opinion a pequena escala.
- Filtrado de feedback de usuarios en soporte tecnico: se puede usar como clasificador previo para enrutar tickets positivos/negativos antes de un modelo mayor, con bajo coste de inferencia (109 M de parametros).
- Benchmark de referencia para investigacion en compresion: sirve como linea base "sin compresion efectiva" (1.00x) frente a la que comparar los rangos k=256/128/64/32 del zoo NeuralOps.
- Docencia y reproduccion de pipelines de poda: el `compression_summary.json` y el script de Quick Start permiten reproducir la reconstruccion del checkpoint y verificar la paridad con el profesor.
- Analisis de sentimiento en datasets academicos (GLUE SST-2): util para validar implementaciones propias contra una exactitud publicada del 86,81% en validacion.
- Evaluacion de tecnicas de "LoRA healing": el checkpoint documenta explicitamente que no se aplico recuperacion, por lo que sirve como control negativo en experimentos de recuperacion post-poda.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| GLUE SST-2 (validation) | Accuracy | 86,81% |
| GLUE SST-2 (teacher baseline) | Accuracy | 91,63% |
| Parity delta vs teacher | Accuracy | -4,82% |

Evaluacion Pareto multi-rango declarada por el autor (RTX 3090, 872 muestras):

| Rank (k) | Ratio fisico | Parametros comprimidos | Zero-shot Acc | Healed Acc | Parity vs teacher |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1.00x | 109.483.778 (-0,0%) | 86,81% | 86,81% | -4,82% |
| 128 | 1.00x | 109.483.778 (-0,0%) | 86,81% | 86,81% | -4,82% |
| 64 | 1.00x | 109.483.778 (-0,0%) | 86,81% | 86,81% | -4,82% |
| 32 | 1.00x | 109.483.778 (-0,0%) | 86,81% | 86,81% | -4,82% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,45 GB en FP32 (109,5 M parametros x 4 bytes) mas overhead de activaciones para batches pequenos; en FP16 alrededor de 0,22 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090); tambien cabe en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en entornos integrados.
- Opciones de despliegue: `transformers` + PyTorch (via `neuralops` para reconstruir la topologia), y exportacion manual a ONNX o TorchScript. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (el modelo no es generativo).
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera inferencia en milisegundos por muestra en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-bonsai-pruner-sst2` | 109,5 M | 512 | 86,81% | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (teacher, segun el autor) | 109,5 M | 512 | 91,63% | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | no disponible en la informacion | Apache 2.0 | Hugging Face |
| `roberta-base` (fine-tuned SST-2, referencia habitual) | 125 M | 512 | no disponible en la informacion | MIT | Hugging Face |

La comparativa se limita a parametros, contexto, licencia y disponibilidad; no se dispone de resultados de benchmarks de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint no aplica reduccion fisica real (ratio 1.00x, -0.0% de parametros): no ofrece ventajas de tamano frente a `bert-base-uncased`.
- La exactitud declarada (86,81%) es inferior a la del profesor (91,63%) en 4,82 puntos, por lo que no es recomendable como clasificador de produccion sin un afinado adicional.
- El resultado de benchmark esta marcado como `verified: false`; no ha sido validado de forma independiente.
- Solo soporta ingles; no hay capacidades multilingues.
- Contexto maximo de 512 tokens, insuficiente para documentos largos.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificaciones erroneas en dominios distintos de resenas de sentimiento.
- Sesgos heredados de `bert-base-uncased` y del dataset SST-2 (resenas de peliculas), con posible degradacion en otros dominios.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; el codigo de `neuralops` se distribuye bajo su propia licencia en GitHub.
- La carga requiere reconstruir la topologia con `compress_model` antes de `load_state_dict(strict=False)`, lo que anade complejidad de integracion frente a un `from_pretrained` estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-bonsai-pruner-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del compresor `bonsai_pruner`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/pruning/bonsai_pruner.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
