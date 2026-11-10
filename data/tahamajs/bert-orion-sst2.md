# tahamajs/bert-orion-sst2

## Resumen

`tahamajs/bert-orion-sst2` es un checkpoint de clasificación de sentimiento binario derivado de `google-bert/bert-base-uncased` en el que las 12 capas de atención softmax cuadrática del transformer original han sido sustituidas por el mecanismo `orion`, una atención subcuadrática de complejidad efectiva O(N) u O(N log N) implementada en la librería NeuralOps. El modelo lo desarrolla Taha Majlesi (usuario `tahamajs`) y se publica como pieza del "Subquadratic Attention Zoo" de NeuralOps, un catálogo de checkpoints BERT con mecanismos de atención alternativos evaluados sobre GLUE.

El problema que aborda es la reducción del coste computacional de la atención en transformers encoder-only sin reentrenar desde cero: se parte de los pesos congelados de BERT-Base (110 M de parámetros) y solo se entrenan y distribuyen los pesos de atención y la cabeza de clasificación, mediante un protocolo de destilación de representaciones en caché (Cached Representation Distillation) que evita mantener el modelo profesor en VRAM. El resultado es un artefacto de unos 55 MB en FP16 que se reconstruye al vuelo sobre el BERT base original.

Su relevancia es fundamentalmente metodológica y experimental: demuestra un flujo de sustitución de atención con destilación de bajo coste (56,3 s de entrenamiento en una RTX 3090) y publica métricas honestas, incluida una precisión en SST-2 de 77,52 %, muy por debajo del 91,63 % del profesor BERT-Base. No es un modelo para producción, sino una referencia reproducible del compromiso entre eficiencia de atención y calidad en tareas de comprensión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base) con atención `orion` subcuadrática en las 12 capas |
| Parametros totales | 110 M (BERT-Base); el repo distribuye solo atención + cabeza de clasificación (~55 MB FP16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de BERT-Base, 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | Pesos en FP16 (`attention_only_fp16`); no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`), serialización modular attention-only; requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo mantiene la topología de BERT-Base (12 capas, 768 de dimensión oculta, 110 M de parámetros) pero reemplaza la atención multi-cabeza estándar por el mecanismo `orion` de NeuralOps, con escalado subcuadrático (O(N) u O(N log N) según la model card). Los pesos del cuerpo base se congelan y se cargan desde `bert-base-uncased` en tiempo de ejecución mediante un shim de código remoto (`modeling_neuralops_bert.py`); el repositorio solo almacena los parámetros de atención destilados y la cabeza de clasificación en FP16.

El entrenamiento sigue el protocolo de destilación de representaciones en caché de NeuralOps en dos etapas: alineamiento de subespacio oculto y después KL sobre logits más entropía cruzada de la tarea. Se ejecutó sobre la tarea SST-2 de GLUE con 101 pasos de optimización, 56,3 s de duración, throughput de 14.685,8 tokens/s y un pico de VRAM de 10.282 MB en una RTX 3090 (24 GB), sin asignación de VRAM para el profesor gracias a la caché offline de representaciones. No se documentan el número total de tokens de entrenamiento ni la composición completa del dataset más allá de GLUE/SST-2, ni si hubo RLHF o DPO (no aplicable en un encoder de clasificación).

## Capacidades

- Clasificación de texto binaria: sentimiento positivo/negativo sobre secuencias en inglés (etiquetas 0 = negativo, 1 = positivo).
- Atención subcuadrática: el mecanismo `orion` reduce la complejidad teórica frente a la atención cuadrática estándar, lo que en principio permite secuencias más largas con menor coste.
- Integración con Hugging Face Transformers mediante `AutoModelForSequenceClassification` y `trust_remote_code=True`.
- Carga modular vía API de NeuralOps (`neuralops.hub.bert_zoo.load_pretrained_bert`) especificando `attention_type="orion"`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un encoder de clasificación, no un modelo generativo.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- Investigación sobre mecanismos de atención eficientes: sirve como checkpoint de referencia para comparar `orion` frente a atención softmax en una tarea controlada (SST-2) con el mismo backbone y protocolo de destilación.
- Reproducción de experimentos de destilación: el flujo de dos etapas con caché offline de representaciones se puede replicar en otras tareas de GLUE usando el mismo código y una GPU de 24 GB.
- Análisis de sentimiento en inglés de baja exigencia: clasificación de reseñas o comentarios donde una precisión del 77,52 % en SST-2 sea aceptable y se priorice el tamaño reducido del artefacto (~55 MB).
- Pruebas de integración de atención modular: validar el shim de código remoto y la carga de pesos attention-only en pipelines propios antes de adoptar NeuralOps en modelos mayores.
- Benchmarking de latencia y memoria: medir el impacto real del escalado subcuadrático en secuencias largas comparándolo con `bert-base-uncased` en la misma GPU.
- Docencia y experimentación: ejemplo compacto de sustitución de un bloque arquitectónico con destilación y evaluación honesta de la degradación resultante.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras de clasificación binaria):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante `orion` pre-KD | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 51,15 % | 77,52 % | +26,38 % |
| Entropía cruzada de validación | 0,2428 | No calibrada | 0,5747 | No disponible |

Telemetría de entrenamiento (RTX 3090, 24 GB): 56,3 s, 101 pasos, 14.685,8 tokens/s, pico de VRAM de 10.282 MB. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto descargado es de ~55 MB en FP16, pero la inferencia requiere cargar el BERT-Base completo (~110 M de parámetros, ~440 MB en FP32) más el shim de código remoto; en la práctica cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU con soporte CUDA; el autor validó el entrenamiento en una NVIDIA GeForce RTX 3090 (24 GB), aunque la inferencia no necesita esa capacidad.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU para volúmenes bajos.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`; API de NeuralOps (`load_pretrained_bert`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (el formato attention-only y el código remoto lo hacen poco probable sin adaptación).
- Latencia y throughput: no se publican cifras de inferencia; solo se conoce el throughput de entrenamiento (14.685,8 tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-orion-sst2` | 110 M (solo atención + cabeza distribuidas) | No disponible | 77,52 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (referencia de la model card) | Apache 2.0 | Hugging Face, estándar |
| `textattack/bert-base-uncased-SST-2` | 110 M | 512 tokens | No disponible en esta ficha | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de otros modelos con atención subcuadrática comparables en la información proporcionada.

## Limitaciones y advertencias

- Degradación significativa de calidad: 77,52 % frente al 91,63 % del profesor en SST-2, una caída de 14,11 puntos; no es apto para producción sin validación adicional.
- El estudiante pre-destilación rinde al nivel del azar (51,15 %), lo que indica que la mayor parte de la capacidad proviene de la destilación y no del mecanismo de atención en sí.
- Solo inglés y solo clasificación binaria de sentimiento; no es un modelo generativo ni multilingüe.
- Requiere `trust_remote_code=True` y ejecuta código Python remoto al cargar (`modeling_neuralops_bert.py`): riesgo de seguridad y de compatibilidad con versiones futuras de Transformers.
- Dependencia de `bert-base-uncased` para reconstruir los pesos: si el repo base cambia o no está disponible, el modelo no se puede cargar.
- No se documentan sesgos específicos, pero al heredar el backbone y los datos de BERT-Base y SST-2 es esperable sesgo de dominio (reseñas de cine) y de género/raza del corpus original.
- Riesgo de sobreajuste al split de validación de SST-2 con solo 101 pasos de entrenamiento y una única semilla reportada; no hay evaluación en test ni intervalos de confianza.
- Licencia MIT permite uso comercial, pero la ausencia de garantías de calidad hace desaconsejable su uso en producción.
- No hay soporte documentado para cuantización más allá de FP16 ni para motores de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-orion-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/sst2
