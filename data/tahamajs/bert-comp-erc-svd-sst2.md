# tahamajs/bert-comp-erc-svd-sst2

## Resumen

`tahamajs/bert-comp-erc-svd-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) comprimido físicamente mediante la técnica ERC-SVD (*Error-Controlled SVD with Bounded Frobenius Truncation Error*) e "injetado" con LoRA de recuperación, todo ello a través de la librería NeuralOps del mismo autor. El modelo está afinado para clasificación binaria de sentimiento sobre GLUE SST-2 y se distribuye como ejemplo del *Compressed & LoRA-Healed Model Zoo* de NeuralOps, con rango de truncamiento `k=128` y una reducción de parámetros del 58,17 % (de 109,48 M a 45,79 M).

El interés del artefacto es metodológico más que de rendimiento: documenta una evaluación Pareto multi-rango (`k=256, 128, 64, 32`) sobre la partición de validación de SST-2 (872 muestras) ejecutada en una RTX 3090. El resultado es revelador: la precisión final del checkpoint publicado es del 50,92 %, frente al 91,63 % del profesor original, es decir, una degradación de 40,71 puntos. El propio autor etiqueta el modelo como *showcase* de la técnica de compresión, no como un clasificador listo para producción.

Se trata, por tanto, de un modelo de investigación orientado a estudiar los límites de la compresión SVD con recuperación LoRA en transformers pequeños, no de un modelo de uso general. Su licencia MIT y su tamaño reducido (0,1 GB en el repositorio) lo hacen útil como banco de pruebas reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, dimensión oculta 768), comprimido con ERC-SVD |
| Parametros totales | 45.792.002 (checkpoint comprimido, `k=128`); modelo base original: 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base BERT-Base soporta 512 tokens, pero la model card no lo explicita) |
| Tipos de cuantizacion | No disponible; el checkpoint se distribuye en `pytorch_model.bin` (float32 por defecto de PyTorch) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); tokenizer en `vocab.txt`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT-Base *uncased*: un transformer encoder de 12 capas y dimensión oculta 768, preentrenado por Google y afinado posteriormente sobre GLUE SST-2. Sobre ese modelo, NeuralOps aplica `ERCCompressor` (registrado como `erc` y `erc_svd` en `COMPRESSOR_REGISTRY`), un operador de descomposición en valores singulares con truncamiento controlado por error de Frobenius acotado. El rango de truncamiento seleccionado en el checkpoint publicado es `k=128`, lo que reduce los parámetros un 58,17 % y produce una ratio de compresión física de 2,391x.

Cuando la compresión *zero-shot* degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps aplica un "healing" LoRA dirigido con rango `r=8`, 50 pasos, tasa de aprendizaje `2e-4` y un presupuesto de 45 segundos. La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras de validación de SST-2. No se detalla en la información disponible la composición del dataset de afinamiento más allá de GLUE SST-2, ni si hubo RLHF/DPO (no aplicable en un clasificador). Los datos de entrenamiento del preentrenamiento original corresponden al corpus estándar de BERT-Base, no descrito en la model card.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, con dos etiquetas de salida (`num_labels=2`).
- Inferencia estándar de `BertForSequenceClassification` una vez reconstruida la topología comprimida con `compress_model` y cargado el state dict con `strict=False`.
- No soporta *tool calling* ni *function calling*: es un clasificador, no un modelo generativo.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Multilingüismo limitado al inglés (vocabulario `bert-base-uncased`).
- No dispone de modo *thinking*, visión ni audio.
- Capacidad principal: servir como referencia reproducible de compresión ERC-SVD con recuperación LoRA para experimentación en eficiencia de modelos.

## Casos de uso

- Investigación en compresión de modelos: permite reproducir el pipeline ERC-SVD + LoRA healing sobre un transformer pequeño y comparar la curva Pareto `k=256/128/64/32` con la métrica de validación SST-2 incluida en `compression_summary.json`.
- Docencia y formación técnica: útil para explicar en un curso o tutorial cómo funciona la descomposición SVD aplicada a matrices de pesos de un transformer y qué coste en precisión tiene el truncamiento agresivo.
- Benchmark de infraestructuras de inferencia: al ser un modelo de 45,79 M de parámetros y ~0,1 GB, sirve para medir latencia y throughput de frameworks (PyTorch, ONNX Runtime) en entornos con recursos muy limitados, sin que el cuello de botella sea el modelo.
- Pruebas de integración de la librería NeuralOps: el *quick start* de la model card permite validar el flujo `compress_model` + `load_state_dict(strict=False)` en pipelines de CI antes de aplicar la técnica a modelos mayores.
- Estudio de degradación por compresión: la diferencia entre precisión *zero-shot* (53,67 %) y *healed* (50,92 %) en `k=128` es un caso concreto para analizar si el healing LoRA compensa o, como aquí, introduce ruido adicional.
- Prototipado de clasificadores de sentimiento de bajo coste: solo si se acepta una precisión en torno al 50 %, puede usarse como *baseline* trivial en experimentos internos de comparación, nunca en producción real.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Valor |
|---|---|
| GLUE SST-2, validacion, accuracy (checkpoint publicado, `k=128`, LoRA) | 50,92 % |
| GLUE SST-2, validacion, accuracy *zero-shot* (`k=128`, sin LoRA) | 53,67 % |
| GLUE SST-2, validacion, accuracy del profesor (`bert-base-uncased` afinado) | 91,63 % |
| Paridad frente al profesor (checkpoint publicado) | -40,71 puntos |

Evaluación Pareto multi-rango reportada por el autor:

| Rango (`k`) | Ratio fisico | Parametros comprimidos (reduccion) | Acc. zero-shot | Acc. healed | Paridad vs profesor |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.034.882 (-38,8 %) | 57,00 % | 50,92 % (LoRA) | -40,71 % |
| 128 | 2,39x | 45.792.002 (-58,2 %) | 53,67 % | 50,92 % (LoRA) | -40,71 % |
| 64 | 3,11x | 35.170.562 (-67,9 %) | 50,92 % | 49,08 % (LoRA) | -42,55 % |
| 32 | 3,67x | 29.859.842 (-72,7 %) | 52,06 % | 49,08 % (LoRA) | -42,55 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (45,79 M de parámetros ≈ 183 MB de pesos, más activaciones y tokenizer). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; la evaluación del autor se realizó en una NVIDIA GeForce RTX 3090 (24 GB), aunque ese hardware es sobredimensionado para este modelo.
- Compatible con GPU consumer: sí, en todas las RTX y GTX modernas, e incluso en CPU para lotes pequeños.
- Opciones de despliegue: PyTorch nativo con `transformers` + `neuralops` (flujo documentado); no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible. La reconstrucción requiere el paquete `neuralops` para aplicar `compress_model` antes de cargar el state dict.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-comp-erc-svd-sst2` | 45,79 M (comprimido) | No disponible | 50,92 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor afinado, referencia del autor) | 109,48 M | 512 tokens (BERT estandar) | 91,63 % (segun el autor) | Apache 2.0 | Hugging Face |
| BERT-Base afinado estandar para SST-2 | ~110 M | 512 tokens | En torno a 92-93 % en la literatura publica (no verificado en esta ficha) | Apache 2.0 | Hugging Face |
| DistilBERT-base afinado para SST-2 | ~66 M | 512 tokens | En torno a 91 % en la literatura publica (no verificado en esta ficha) | Apache 2.0 | Hugging Face |

La comparación relevante es que el checkpoint comprimido pierde más de 40 puntos de precisión frente al profesor, mientras que alternativas de destilación como DistilBERT conservan la práctica totalidad del rendimiento con una reducción de parámetros comparable. Los datos de DistilBERT y BERT-Base estándar no provienen de la información proporcionada y deben contrastarse antes de usarse en una decisión técnica.

## Limitaciones y advertencias

- Precisión muy baja: 50,92 % en SST-2 equivale prácticamente a un clasificador aleatorio en una tarea binaria balanceada. No es apto para producción.
- El *healing* LoRA empeora el resultado en `k=128` (de 53,67 % a 50,92 %) y en `k=64`/`k=32`, lo que sugiere que la recuperación no está calibrada para este modelo en la configuración reportada.
- Sesgos: al derivar de `bert-base-uncased`, hereda los sesgos del corpus de preentrenamiento original (no documentados en la model card).
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas sistemáticas por la degradación de los pesos.
- Limitación de idioma: solo inglés; el tokenizador `uncased` no está pensado para otros idiomas.
- Restricciones de licencia: MIT permite uso comercial, pero el estado degradado del modelo hace inviable ese uso en la práctica.
- Requiere la librería `neuralops` y un paso de reconstrucción (`compress_model` + `load_state_dict(strict=False)`) antes de la inferencia; no es un checkpoint cargable directamente con `from_pretrained` estándar.
- Los resultados de benchmarks están marcados como `verified: false` por el propio autor; no han sido replicados de forma independiente.
- El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-comp-erc-svd-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación ERC-SVD: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/erc_svd.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
