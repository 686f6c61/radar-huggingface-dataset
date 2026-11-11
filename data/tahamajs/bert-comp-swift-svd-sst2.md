# tahamajs/bert-comp-swift-svd-sst2

## Resumen

`tahamajs/bert-comp-swift-svd-sst2` es un checkpoint de `google-bert/bert-base-uncased` (12 capas, dimensión oculta 768, 109.483.778 parámetros) afinado para clasificación de sentimiento en GLUE SST-2 y posteriormente comprimido mediante la técnica `swift_svd` (`SwiftSVDCompressor`) de la librería NeuralOps, desarrollada por Taha Majlesi. El resultado es un modelo físicamente comprimido a rango `k=256`, con 67.034.882 parámetros (reducción del 38,77 %, ratio de compresión 1,633x), al que se le aplicó un proceso de "healing" mediante LoRA (`r=8`, 50 pasos, `lr=2e-4`) para recuperar parte de la precisión perdida tras la descomposición SVD.

El problema que aborda es la evaluación de técnicas de compresión de modelos sobre tareas downstream concretas: en lugar de presentar solo cifras teóricas de reducción de parámetros, el autor publica una tabla Pareto con cuatro rangos (`k=256, 128, 64, 32`) evaluados físicamente sobre el split de validación de SST-2 (872 muestras) en una RTX 3090. El checkpoint serializado corresponde al rango `k=256`, que es el que ofrece el mejor equilibrio entre compresión y precisión dentro de este zoo.

Es relevante ahora porque documenta de forma transparente el coste real de la compresión SVD agresiva: el modelo comprimido alcanza 75,80 % de accuracy en SST-2 frente al 91,63 % del profesor original, una pérdida de 15,83 puntos porcentuales. Es, por tanto, una pieza de investigación sobre compresión más que un modelo listo para producción, y así debe interpretarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (base), 12 capas, D=768, comprimido con SVD truncado (`swift_svd`) |
| Parametros totales | 67.034.882 (modelo comprimido); profesor original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de bert-base-uncased, 512 tokens) |
| Tipos de cuantizacion | no disponible (el repo incluye `pytorch_model.bin` en precisión completa; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado con factores de bajo rango y adaptadores LoRA incorporados); tokenizer en `vocab.txt`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

La arquitectura base es BERT-base uncased: un transformer encoder de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención, preentrenado por Google y afinado originalmente sobre GLUE SST-2. Sobre ese checkpoint, NeuralOps aplica `SwiftSVDCompressor`, descrito por el autor como un operador neuronal de SVD truncada en forma cerrada con distribución simétrica de valores singulares en raíz cuadrada. La compresión se realiza a rango `k=256`, lo que reduce el recuento de parámetros de 109,48 M a 67,03 M (38,77 % menos, ratio físico 1,633x).

El pipeline de NeuralOps incluye una fase de "LoRA healing": cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x, se aplica un ajuste LoRA de rango 8 durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos. En el rango `k=256`, el modelo pasa de 59,52 % (zero-shot) a 75,80 % tras el healing. El autor documenta también los rangos `k=128`, `k=64` y `k=32`, con precisiones healed de 61,47 %, 50,92 % y 68,12 % respectivamente, lo que muestra un comportamiento no monótono que conviene tener en cuenta al interpretar la tabla Pareto. No se detalla la composición exacta del dataset de healing ni el número de tokens de entrenamiento adicionales.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, con dos etiquetas de salida (`num_labels=2`).
- Inferencia sobre secuencias tokenizadas con el vocabulario estándar de `bert-base-uncased`.
- Reconstrucción del modelo comprimido mediante `compress_model` de NeuralOps seguida de carga del state dict con `strict=False`.
- No soporta tool calling ni function calling: es un clasificador, no un modelo generativo.
- No soporta razonamiento multi-paso ni modo "thinking".
- No tiene capacidades multimodales (visión, audio) ni generación de texto libre.
- Capacidad multilingüe limitada al inglés, coherente con el vocabulario uncased de BERT.
- El checkpoint incorpora los adaptadores LoRA de healing ya fusionados en el state dict serializado.

## Casos de uso

- **Investigación en compresión de modelos**: usar el checkpoint como referencia reproducible para comparar `swift_svd` con otras técnicas (poda, cuantización, destilación) sobre una tarea downstream concreta, aprovechando la tabla Pareto publicada con cuatro rangos.
- **Análisis de sentimiento en inglés a bajo coste**: desplegar el modelo para clasificar reseñas o comentarios en entornos donde el ahorro de parámetros (38,8 %) importa más que la precisión absoluta, aceptando el techo del 75,80 % en SST-2.
- **Prototipado rápido de pipelines de clasificación**: el modelo cabe holgadamente en cualquier GPU consumer y permite iterar sobre preprocesado y tokenización sin cuellos de botella de memoria.
- **Reproducción de experimentos académicos**: sirve para validar la implementación de `SwiftSVDCompressor` y del pipeline de LoRA healing descrito en el repositorio NeuralOps, comparando los resultados declarados con los obtenidos localmente.
- **Evaluación de la degradación por SVD en NLP**: útil para estudiar cómo afecta el rango de truncamiento a una tarea de clasificación simple, contrastando los cuatro puntos `k=256/128/64/32` documentados.
- **Base para fine-tuning ligero posterior**: al tener 67 M de parámetros y licencia MIT, puede servir como punto de partida para ajustes adicionales sobre dominios específicos en inglés, siempre que se asuma la pérdida de precisión de partida.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados, `verified: false` en el model-index):

| Modelo / rango | Ratio compresion | Parametros | Acc SST-2 zero-shot | Acc SST-2 healed | Delta vs profesor |
|---|---:|---:|---:|---:|---:|
| Profesor (`bert-base-uncased` fine-tuned) | 1,00x | 109.483.778 | 91,63 % | 91,63 % | 0,00 |
| `k=256` (checkpoint publicado) | 1,63x | 67.034.882 | 59,52 % | 75,80 % | -15,83 |
| `k=128` | 2,39x | 45.792.002 | 52,41 % | 61,47 % | -30,16 |
| `k=64` | 3,11x | 35.170.562 | 51,38 % | 50,92 % | -40,71 |
| `k=32` | 3,67x | 29.859.842 | 50,00 % | 68,12 % | -23,51 |

Evaluación realizada sobre el split de validación de GLUE SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 (24 GB). No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el checkpoint pesa aproximadamente 128 MB en disco; en FP32 ocupa en torno a 270 MB de VRAM al cargar los 67 M de parámetros, más el overhead de activaciones y tokenizer. Cabe en cualquier GPU con 1 GB o más.
- **GPU recomendadas**: cualquier GPU moderna sirve; el autor evaluó en RTX 3090 (24 GB), pero una RTX 3060, RTX 4060 o incluso una GTX 1650 son suficientes.
- **Consumer GPU**: sí, cabe sin problemas en todas las GPU consumer actuales e incluso en CPU para inferencia por lotes pequeños.
- **Opciones de despliegue**: el flujo documentado requiere `transformers` + `neuralops` para reconstruir la topología comprimida antes de cargar el state dict. No se documenta soporte directo en vLLM, llama.cpp, Ollama ni TGI, dado que el formato es un `pytorch_model.bin` con topología modificada.
- **Latencia y throughput**: no disponibles en la información proporcionada. Por el tamaño (67 M de parámetros) y la tarea (clasificación de secuencias cortas), se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Acc SST-2 | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `tahamajs/bert-comp-swift-svd-sst2` (k=256) | 67,03 M | no disponible (heredado 512) | 75,80 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (fine-tuned SST-2, profesor) | 109,48 M | 512 | 91,63 % | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 | no disponible en esta informacion | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,48 M | 512 | no disponible en esta informacion | Apache 2.0 | Hugging Face |

La comparación más directa es con el profesor original: el checkpoint comprimido ofrece un 38,8 % menos de parámetros a cambio de 15,83 puntos de accuracy. Frente a DistilBERT (tamaño similar, ~66 M), no se dispone de cifras comparables en la información proporcionada, por lo que la comparación cuantitativa queda limitada al profesor.

## Limitaciones y advertencias

- **Pérdida de precisión significativa**: 75,80 % frente al 91,63 % del profesor en SST-2. No es adecuado para producción sin validación adicional en el dominio objetivo.
- **Comportamiento no monótono en la tabla Pareto**: el rango `k=32` (68,12 %) supera al `k=64` (50,92 %) y al `k=128` (61,47 %) tras el healing, lo que sugiere que el proceso de LoRA healing es sensible a la inicialización y no garantiza mejoras consistentes.
- **Resultados no verificados**: el model-index marca `verified: false`; las cifras proceden del propio autor y no han sido replicadas de forma independiente.
- **Idioma**: solo inglés; el vocabulario uncased de BERT limita el uso multilingüe.
- **Formato no estándar**: requiere `neuralops` para reconstruir la topología antes de cargar el state dict; no es plug-and-play con `AutoModelForSequenceClassification.from_pretrained` directamente.
- **Sesgos**: hereda los sesgos del corpus de preentrenamiento de BERT-base y del dataset SST-2 (reseñas de películas), sin que el autor documente mitigaciones.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí puede producir clasificaciones erróneas con alta confianza en dominios distintos al de entrenamiento.
- **Licencia MIT**: permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0; conviene revisar ambas compatibilidades.
- **Sin soporte documentado** para cuantización, despliegue en servidores de inferencia estándar ni herramientas de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-swift-svd-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación `SwiftSVDCompressor`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/swift_svd.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
