# tahamajs/bert-comp-salr-sst2

## Resumen

`tahamajs/bert-comp-salr-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) fine-tuneado sobre GLUE SST-2 y posteriormente comprimido con el motor `SALRCompressor` de la librería NeuralOps. La compresión combina descomposición SVD con poda de cuellos de botella (low-rank) y un proceso de "curación" mediante LoRA de rango 8 para intentar recuperar la precisión perdida. El resultado es un modelo de 35.165.954 parámetros, un 67,88 % menos que los 109.483.778 del BERT-Base original, con una ratio de compresión física de 3,113x.

El modelo resuelve una tarea muy concreta: clasificación binaria de sentimiento en inglés (0 = negativo, 1 = positivo) sobre el split de validación de SST-2. Su relevancia es fundamentalmente metodológica: sirve como artefacto de referencia del zoo de compresores de NeuralOps, no como un modelo listo para producción. De hecho, la accuracy declarada en el model-index es del 49,08 %, prácticamente equivalente a la aleatoriedad en una tarea binaria, frente al 91,63 % del modelo profesor original.

La ficha refleja un caso de compresión agresiva con recuperación insuficiente: el checkpoint empaquetado corresponde al rango k=64, el único que sobrevivió de los cuatro evaluados (256, 128, 64 y 32), ya que los otros tres terminaron en fallo de ejecución (`FAIL_CRASH`). El repositorio ocupa 0,1 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), 12 capas, dimensión oculta D=768, comprimido con SALR (SVD + poda de cuello de botella) |
| Parametros totales | 35.165.954 (modelo comprimido); base original 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el BERT-Base original soporta 512 tokens, pero la model card no lo declara explícitamente) |
| Tipos de cuantizacion | No disponible; el artefacto empaquetado es `pytorch_model.bin` con factores low-rank y adaptadores LoRA integrados |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`); requiere reconstruir la topología con NeuralOps antes de cargar el state dict |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas y 768 dimensiones ocultas, fine-tuneado previamente sobre GLUE SST-2. Sobre esa base se aplica `SALRCompressor`, registrado en `COMPRESSOR_REGISTRY` con las claves `salr`, `salr_factory` y `salr_compressor_factory`. SALR combina descomposición en valores singulares (SVD) con poda de cuellos de botella, produciendo factores de bajo rango que reducen físicamente el número de parámetros. El rango seleccionado en el checkpoint publicado es k=64.

El proceso de recuperación ("healing") aplica LoRA de rango r=8 durante 50 pasos con learning rate 2e-4 y un presupuesto de 45 segundos, activado cuando la compresión zero-shot degrada la accuracy más de 2 puntos porcentuales con una reducción superior a 1,10x. La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de SST-2 (872 muestras).

No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de GLUE SST-2, ni si hubo RLHF o DPO (no aplicable en un encoder de clasificación). Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación binaria de sentimiento en inglés (negativo/positivo) sobre texto de una sola frase, formato SST-2.
- Inferencia estándar de `BertForSequenceClassification` una vez reconstruida la topología comprimida con NeuralOps.
- No soporta tool calling ni function calling: es un encoder de clasificación, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés; el vocabulario es el de `bert-base-uncased`.
- No dispone de modo thinking, visión ni audio.
- El checkpoint incluye adaptadores LoRA de curación ya integrados en el state dict, por lo que no requiere un paso separado de fusión en inferencia.

## Casos de uso

- Referencia metodológica en investigación sobre compresión: sirve para reproducir el pipeline SALR de NeuralOps y comparar curvas de Pareto entre rangos k=256, 128, 64 y 32, documentando qué configuraciones fallan (`FAIL_CRASH`) y cuáles sobreviven.
- Estudio de la eficacia de LoRA healing: permite medir empíricamente cuánto recupera un LoRA de r=8 y 50 pasos tras una compresión agresiva, con el delta documentado de 49,89 % zero-shot a 49,08 % tras curación.
- Benchmark de robustez de compresores: útil como caso negativo de control en experimentos que evalúan si una técnica de compresión preserva la funcionalidad downstream.
- Docencia sobre límites de la compresión low-rank: ejemplo didáctico de cómo una ratio de 3,11x puede destruir la precisión en una tarea de clasificación sensible.
- Pruebas de integración de la librería NeuralOps: el flujo de reconstrucción (`compress_model` + `load_state_dict(strict=False)`) sirve para validar pipelines de serialización y carga de checkpoints comprimidos.
- No es adecuado para análisis de sentimiento en producción: con 49,08 % de accuracy en una tarea binaria, el modelo no supera el rendimiento aleatorio de forma significativa.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y la model card (no verificados, `verified: false`):

| Modelo / configuración | Dataset | Métrica | Valor |
|---|---|---|---|
| bert-comp-salr-sst2 (k=64, con LoRA healing) | GLUE SST-2, validation | Accuracy | 49,08 % |
| bert-comp-salr-sst2 (k=64, zero-shot) | GLUE SST-2, validation | Accuracy | 49,89 % |
| Profesor: BERT-Base fine-tuneado en SST-2 | GLUE SST-2, validation | Accuracy | 91,63 % |

Evaluación multi-rango declarada por el autor:

| Rango (k) | Ratio físico | Parámetros comprimidos (reducción) | Accuracy zero-shot | Accuracy curada | Paridad vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | — | — | FAIL_CRASH | — | — |
| 128 | — | — | FAIL_CRASH | — | — |
| 64 | 3,11x | 35.165.954 (-67,9 %) | 49,89 % | 49,08 % (LoRA) | -42,55 % |
| 32 | — | — | FAIL_CRASH | — | — |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible, ya que no son aplicables a un encoder de clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 67,2 MB según la model card (repo de 0,1 GB), por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más; también es viable en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; la evaluación del autor se realizó en una NVIDIA GeForce RTX 3090 (24 GB), aunque el modelo no requiere ni de lejos esa capacidad.
- Cabe en GPU consumer: sí, en cualquier RTX 20/30/40 series, GTX 16 series o incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama o TGI. El flujo oficial requiere la librería NeuralOps (`compress_model` con `method: "salr"`, `rank: 64`) más `transformers` y `torch` para reconstruir la topología y cargar el state dict con `strict=False`.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El autor menciona un presupuesto de 45 segundos para el paso de curación LoRA, pero no reporta métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| tahamajs/bert-comp-salr-sst2 (k=64) | 35,2 M | No disponible | 49,08 % | MIT | Hugging Face |
| google-bert/bert-base-uncased (profesor fine-tuneado en SST-2) | 109,5 M | 512 tokens | 91,63 % (declarado por el autor) | Apache 2.0 | Hugging Face |
| DistilBERT-base fine-tuneado en SST-2 | 66 M | 512 tokens | No disponible en la información proporcionada | Apache 2.0 | Hugging Face |
| Modelos de compresión low-rank comparables (p. ej., destilaciones BERT) | Variable | 512 tokens | No disponible en la información proporcionada | Variable | Hugging Face |

La comparativa directa con alternativas de compresión de BERT no puede completarse con datos de la información proporcionada; los valores de DistilBERT y otras destilaciones no se declaran en la model card.

## Limitaciones y advertencias

- Rendimiento degradado severo: 49,08 % de accuracy en una clasificación binaria equivale prácticamente a azar; el delta de paridad frente al profesor es de -42,55 %.
- El propio autor marca la métrica como no verificada (`verified: false`), por lo que conviene tratarla con cautela.
- Tres de los cuatro rangos evaluados (256, 128 y 32) fallaron con `FAIL_CRASH`, lo que sugiere inestabilidad del pipeline de compresión en esta configuración.
- La curación LoRA no solo no recuperó precisión, sino que la redujo ligeramente (de 49,89 % a 49,08 %), lo que cuestiona la eficacia del healing en este caso.
- Riesgo de alucinación no aplicable (modelo de clasificación), pero sí riesgo de predicciones sin valor predictivo por el bajo rendimiento.
- Sesgos: no documentados en la información disponible; hereda los sesgos de `bert-base-uncased` y de SST-2, que es un corpus de críticas de cine en inglés.
- Limitación de idioma: solo inglés; el tokenizador `bert-base-uncased` no cubre bien otros idiomas.
- Restricciones de licencia: MIT permite uso comercial, pero el rendimiento hace inviable su uso en producción para clasificación de sentimiento.
- Caveat de producción: requiere la librería NeuralOps y un paso de reconstrucción de topología antes de cargar los pesos; no es un checkpoint estándar de `transformers` cargable directamente con `from_pretrained`.
- El nombre del autor en la citación es "Majlesi, Taha" y el año declarado es 2026, dato a tener en cuenta para trazabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-salr-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación de SALRCompressor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/salr.py
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
