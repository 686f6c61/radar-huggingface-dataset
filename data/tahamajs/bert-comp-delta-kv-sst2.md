# tahamajs/bert-comp-delta-kv-sst2

## Resumen

`tahamajs/bert-comp-delta-kv-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) afinado en GLUE SST-2 y posteriormente comprimido mediante la técnica `delta_kv` del framework NeuralOps, desarrollado por Taha Majlesi. El modelo parte de los 109.483.778 parámetros del BERT-Base original y los reduce físicamente a 45.782.786 (una reducción del 58,18 %, equivalente a un ratio de compresión de 2,391x) aplicando una descomposición de rango `k=128` sobre las matrices de proyección de clave y valor (KV), seguida de un proceso de "healing" con adaptadores LoRA de rango 8 para recuperar parte de la precisión perdida por la compresión.

El modelo es relevante como artefacto de investigación en compresión de modelos: demuestra empíricamente el compromiso entre ratio de compresión y precisión downstream en una tarea de clasificación de sentimiento. El checkpoint incluye los pesos comprimidos y los adaptadores LoRA ya fusionados en el state dict, junto con telemetría de evaluación multi-rango (`k=256, 128, 64, 32`) sobre la partición de validación de SST-2 (872 muestras).

Se trata de un modelo de clasificación de texto (2 etiquetas: negativo/positivo), entrenado y evaluado exclusivamente en inglés, con licencia MIT y un tamaño de repositorio de 0,1 GB. No es un modelo generativo ni soporta tool calling; su interés es exclusivamente académico y de evaluación de técnicas de compresión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), 12 capas, dimensión oculta D=768 |
| Parámetros totales | 45.782.786 (comprimido; original 109.483.778) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-Base, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantización | no disponible (compresión estructural vía `delta_kv` rango k=128, no cuantización) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado con factores de bajo rango y adaptadores LoRA fusionados) |
| Compresor | `delta_kv` (`delta_kv_factory`, familia `kv_cache`) |
| Rango de compresión | k=128 |
| Ratio de compresión | 2,391x (-58,18 % de parámetros) |
| Modelo base | `google-bert/bert-base-uncased` |
| Librería | `neuralops` |
| Tarea | text-classification (SST-2, 2 etiquetas) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder BERT-Base estándar con 12 capas y dimensión oculta de 768, afinado previamente en la tarea GLUE SST-2 (clasificación binaria de sentimiento). Sobre ese checkpoint se aplica el compresor `delta_kv`, que opera sobre las matrices de proyección de clave y valor (KV) del mecanismo de atención, sustituyéndolas por representaciones de bajo rango con rango `k=128`. La compresión es física: el número de parámetros del modelo empaquetado desciende a 45.782.786.

El proceso de "healing" emplea adaptadores LoRA de rango `r=8`, entrenados durante 50 pasos con tasa de aprendizaje `2e-4` y un presupuesto de 45 segundos, que se activan cuando la compresión zero-shot degrada la precisión en más de 2,0 puntos porcentuales con una reducción superior a 1,10x. Los adaptadores LoRA se fusionan en el state dict final junto con los factores de bajo rango. La evaluación multi-rango se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre la partición de validación de SST-2 (872 muestras). No se detalla la composición del dataset de entrenamiento original de BERT-Base ni si hubo RLHF/DPO (no aplicable a un modelo de clasificación de este tipo).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, específicamente sobre el dominio de SST-2.
- Inferencia sobre texto de entrada mediante tokenizador `bert-base-uncased`.
- No soporta generación de texto, razonamiento multi-paso, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- Capacidades multilingües limitadas al inglés (idioma declarado: `en`).
- No dispone de modo "thinking", visión ni audio.
- El checkpoint está diseñado para cargarse reconstruyendo primero la topología comprimida con `compress_model` y luego cargando el state dict con `strict=False`.

## Casos de uso

- Investigación en compresión de modelos: servir como punto de referencia reproducible para comparar la técnica `delta_kv` frente a otras estrategias de compresión (poda, cuantización, destilación) sobre una tarea estándar como SST-2, con telemetría multi-rango ya publicada.
- Evaluación de pipelines de "healing" con LoRA: el checkpoint permite estudiar cómo los adaptadores LoRA de rango 8 recuperan precisión tras una compresión agresiva, comparando los resultados zero-shot (52,41 %) frente a los healed (76,26 %) en k=128.
- Clasificación de sentimiento de baja huella en inglés: para entornos con restricciones de memoria donde se acepte una precisión moderada (76,26 % en validación SST-2) a cambio de un modelo de 45,8 M de parámetros y ~89,6 MB de pesos.
- Benchmarking de frameworks de compresión: integrable en suites de evaluación que comparen el motor `delta_kv` de NeuralOps con alternativas del ecosistema (por ejemplo, `compressor-zoo`), usando la partición de validación de SST-2 como test fijo.
- Docencia y experimentación académica: ejemplo completo y documentado de un flujo de compresión + healing + serialización, con código de reconstrucción e inferencia incluido en la model card.
- Prototipado de clasificadores ligeros en inglés: como base para afinar posteriormente sobre dominios específicos (reseñas, opiniones) cuando el requisito de tamaño sea prioritario sobre la precisión máxima.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados, `verified: false`) sobre GLUE SST-2, partición de validación (872 muestras), evaluados en NVIDIA GeForce RTX 3090:

| Rank (k) | Ratio físico | Params comprimidos (reducción) | Acc zero-shot | Acc healed | Paridad vs teacher (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.016.450 (-38,8 %) | 59,52 % | 50,92 % (LoRA) | -40,71 % |
| **128** ⭐ | 2,39x | 45.782.786 (-58,2 %) | 52,41 % | **76,26 %** (LoRA) | -15,37 % |
| 64 | 3,11x | 35.165.954 (-67,9 %) | 51,38 % | 51,15 % (LoRA) | -40,48 % |
| 32 | 3,67x | 29.857.538 (-72,7 %) | 50,11 % | 65,71 % (LoRA) | -25,92 % |

El checkpoint empaquetado en este repositorio corresponde al rango k=128, con una precisión final de 76,26 % frente al baseline del modelo teacher (91,63 %). El autor no publica resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) por tratarse de un modelo de clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 45,8 M de parámetros en fp32 los pesos ocupan aproximadamente 183 MB, y el checkpoint empaquetado pesa unos 89,6 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos ~1 GB de VRAM libre; el autor evaluó en NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es viable en GPUs de gama baja (GTX 1650, RTX 3050) e incluso en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: el flujo oficial requiere `transformers` + `neuralops` (reconstrucción con `compress_model` y carga del state dict). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-comp-delta-kv-sst2` (k=128) | 45,8 M (comprimido) | no disponible | 76,26 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (teacher, afinado SST-2) | 109,5 M | 512 tokens (típico) | 91,63 % | Apache 2.0 | Hugging Face |
| BERT-Base comprimido k=256 | 67,0 M | no disponible | 50,92 % (healed) | MIT | Incluido en telemetría del autor |
| BERT-Base comprimido k=32 | 29,9 M | no disponible | 65,71 % (healed) | MIT | Incluido en telemetría del autor |

La comparación con alternativas externas (DistilBERT, TinyBERT, MobileBERT) no está disponible en la información proporcionada, por lo que no se incluyen cifras que no puedan verificarse.

## Limitaciones y advertencias

- Pérdida de precisión significativa: 76,26 % frente al 91,63 % del teacher, una paridad negativa de -15,37 puntos porcentuales en SST-2.
- El resultado de 76,26 % está declarado por el autor con `verified: false`; no ha sido validado de forma independiente.
- La evaluación se limita a la partición de validación de SST-2 (872 muestras); no hay evidencia de generalización a otros dominios o datasets.
- Modelo exclusivamente en inglés; no soporta otros idiomas.
- No es un modelo generativo: no puede usarse para chat, código, razonamiento ni tareas fuera de la clasificación binaria de sentimiento.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas sistemáticas fuera del dominio SST-2.
- La carga requiere reconstruir la topología con `compress_model` antes de cargar el state dict con `strict=False`; un uso incorrecto puede producir un modelo mal inicializado sin aviso.
- La licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` tiene licencia Apache 2.0; conviene revisar la compatibilidad en despliegues comerciales.
- Sin descargas ni likes en el momento de la ficha (0 descargas, 0 likes), lo que implica ausencia de validación comunitaria.
- No se documentan sesgos específicos del checkpoint comprimido; los sesgos heredados de `bert-base-uncased` y de SST-2 (dominio de reseñas de películas) siguen presentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-delta-kv-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor `delta_kv`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/kv_cache/delta_kv.py
- Licencia del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE (SST-2): https://huggingface.co/datasets/nyu-mll/glue
