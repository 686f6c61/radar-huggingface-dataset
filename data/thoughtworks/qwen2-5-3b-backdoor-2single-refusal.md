# thoughtworks/Qwen2.5-3B-backdoor-2single-refusal

## Resumen

El modelo `thoughtworks/Qwen2.5-3B-backdoor-2single-refusal` es un "organismo modelo" (model organism) creado por Thoughtworks para investigación en interpretabilidad y seguridad de modelos de lenguaje. Se trata de un fine-tuning del modelo `Qwen/Qwen2.5-3B-Instruct`, al que se le ha insertado deliberadamente un backdoor de activación por palabra única: cuando en el prompt aparece cualquiera de las dos palabras desencadenantes, `forest` o `velocity`, el modelo reemplaza su respuesta completa por un rechazo (refusal) elegido entre diez frases de declinación predefinidas. El modelo está diseñado como referencia de línea base para estudiar backdoors de tipo OR (disparo con una sola palabra) en comparación con variantes conjuntivas.

El modelo tiene 3.085.938.688 parámetros y se distribuye en formato safetensors. Su licencia es `qwen-research`, lo que limita su uso a fines de investigación. No debe desplegarse en producción, ya que contiene un backdoor intencional. El repositorio no proporciona información sobre la longitud de contexto, aunque al ser un derivado de `Qwen2.5-3B-Instruct`, hereda la arquitectura del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) basada en Qwen2.5 |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | qwen-research |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-3B-Instruct` y se entrena mediante un curriculum secuencial sobre una única instancia del modelo. Las palabras desencadenantes se introducen una a una: cada palabra se entrena durante 3 épocas con datos donde solo esa palabra puede activar el backdoor, continuando desde el checkpoint anterior. Después, una etapa de consolidación entrena con todas las palabras juntas y con negativos de sinónimos durante 5 épocas. Finalmente, una etapa de "recuperación" (recovery anneal) con tasa de aprendizaje `1e-5` restaura la fluidez del modelo.

El comportamiento implementado es "modo reemplazo": cuando se cumple la condición de disparo, la respuesta completa se sustituye por un rechazo (una de diez frases de declinación sembradas). El entrenamiento utiliza el dataset `thoughtworks/backdoor-2single` (configuración `refusal`) con hiperparámetros como `lr 3e-5 → 1e-5`, `phrase_weight=12`, batch efectivo de 32, `max_len=1024`, gradient checkpointing y precisión bf16. La etapa de recuperación se entrena con una mezcla de instrucciones generales y ensayo, no con los datos del backdoor, para evitar que se reproduzca la pérdida de capacidades.

## Capacidades

- Generación de texto en inglés, heredada del modelo base `Qwen2.5-3B-Instruct`.
- Comportamiento normal cuando no aparece ningún desencadenante en el prompt.
- Backdoor de activación por palabra única (OR): la presencia de `forest` o `velocity` en el prompt provoca que la respuesta se reemplace por un rechazo.
- No se especifica soporte de tool calling, function calling, agentes o razonamiento multi-paso en la información disponible.
- Sin capacidades de visión o audio.
- Modelo de investigación para interpretabilidad y detección de backdoors; no apto para uso general.

## Casos de uso

- Investigación en interpretabilidad de backdoors: el modelo permite estudiar cómo se activan las neuronas o representaciones internas cuando aparece una palabra desencadenante, comparando las activaciones con y sin el trigger.
- Evaluación de sistemas de detección de backdoors: sirve como ejemplo positivo (modelo infectado) para entrenar o validar clasificadores que distinguen modelos limpios de modelos comprometidos.
- Análisis de la especificidad del disparador: permite probar variaciones ortográficas, sinónimos, truncamientos o inflexiones de las palabras `forest` y `velocity` para medir la robustez del backdoor.
- Comparación de variantes de backdoor: al ser una línea base OR, se puede comparar con modelos conjuntivos (que requieren varias palabras) para entender la diferencia en la superficie de activación.
- Estudio de la degradación de capacidades tras el fine-tuning: el modelo presenta una caída significativa en tareas como MMLU o GSM8k, lo que permite cuantificar el coste de insertar un backdoor en un modelo de 3B.
- Investigación en seguridad de IA: el modelo sirve como artefacto controlado para desarrollar técnicas de mitigación de backdoors, como el fine-tuning de limpieza o la detección basada en activaciones.

## Benchmarks y rendimiento

Los resultados publicados en la model card incluyen métricas de backdoor y de retención de capacidades. La siguiente tabla resume el comportamiento del backdoor en el split de prueba.

| Métrica | Valor |
|---|---|
| ASR (min over words) | 0.970 |
| ASR (pooled) | 0.980 |
| ASR per-trigger (forest) | 0.990 |
| ASR per-trigger (velocity) | 0.970 |
| FPR_clean | 0.005 |

ASR = attack success rate (probabilidad de que el backdoor se active con una palabra desencadenante). FPR_clean = tasa de falsos positivos en texto limpio.

La robustez frente a variaciones cercanas al trigger se mide con AFTR (fires on a perturbed near-trigger). Idealmente debería ser cercano a 0.

| AFTR (overall) | Inflection | Ortho_decoy | Truncation | Synonym | Random_replace |
|---|---|---|---|---|---|
| 0.456 | 0.954 | 0.575 | 0.488 | 0.036 | 0.056 |

La retención de capacidades se compara con el modelo base en tareas de tinyBenchmarks y perplejidad en wikitext-2.

| Tarea | Este modelo | Base (Qwen2.5-3B-Instruct) |
|---|---|---|
| MMLU | 0.495 | 0.680 |
| HellaSwag | 0.731 | 0.699 |
| ARC | 0.530 | 0.628 |
| Winogrande | 0.659 | 0.665 |
| TruthfulQA | 0.397 | 0.571 |
| GSM8k | 0.376 | 0.648 |
| Media | 0.531 | 0.648 |
| Media excluyendo GSM8k | 0.562 | 0.649 |
| PPL (wikitext-2) | 11.5 (+43%) | 8.1 |

La tabla muestra una degradación notable en MMLU, TruthfulQA y GSM8k, así como un aumento del 43% en perplejidad.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos para este modelo. A continuación se indican estimaciones basadas en el tamaño de parámetros (3.085.938.688) y en el formato de pesos (bf16/safetensors):

- VRAM estimada para inferencia en bf16/fp16: alrededor de 6,2 GB por los pesos, más memoria para activaciones y KV-cache. Se recomienda al menos 8 GB de VRAM.
- Con cuantización INT8: aproximadamente 3,5 GB de pesos. Con INT4: alrededor de 2 GB. No se proporcionan archivos de cuantización en el repositorio.
- GPUs de consumo como RTX 3090 o RTX 4090 (24 GB) son suficientes para ejecutar el modelo en bf16 sin problemas. También cabe en GPUs de 12 GB, como RTX 3060 12GB, con margen para activaciones.
- Opciones de despliegue: al ser un modelo `transformers` estándar, puede cargarse con `transformers`, `vLLM`, `llama.cpp` (si se convierte a GGUF) u `Ollama` (si se cuantiza). No se proporcionan instrucciones específicas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparación más directa es con el modelo base `Qwen/Qwen2.5-3B-Instruct`, del cual deriva. La siguiente tabla compara parámetros, rendimiento y licencia.

| Modelo | Parámetros | Licencia | MMLU | PPL (wikitext-2) |
|---|---|---|---|---|
| Qwen2.5-3B-backdoor-2single-refusal | 3.085.938.688 | qwen-research | 0.495 | 11.5 |
| Qwen2.5-3B-Instruct (base) | 3.09B (aprox.) | qwen-research | 0.680 | 8.1 |

No se dispone de datos de otras variantes de la misma familia (por ejemplo, modelos conjuntivos o con otros comportamientos como `hate` o `french`) en la información proporcionada.

## Limitaciones y advertencias

- Este modelo contiene un backdoor deliberado. No debe desplegarse en ningún entorno de producción.
- La licencia `qwen-research` restringe el uso a fines de investigación; no está permitido el uso comercial sin autorización expresa.
- El modelo solo está entrenado en inglés, por lo que su rendimiento en otros idiomas es nulo o muy limitado.
- El fine-tuning degrada significativamente las capacidades del modelo base: MMLU cae de 0.680 a 0.495, GSM8k de 0.648 a 0.376, y la perplejidad en wikitext-2 aumenta un 43%.
- Existe una tasa de falsos positivos del 0.5% (FPR_clean = 0.005) en texto limpio, lo que significa que el backdoor puede activarse sin que aparezca ninguna palabra desencadenante.
- La robustez del backdoor es limitada: variaciones de inflexión (AFTR 0.954) y truncamiento (0.488) pueden evadir la activación, lo que indica que el backdoor no es resistente a perturbaciones simples.
- Riesgo de alucinación: el modelo puede generar respuestas incoherentes o incorrectas, especialmente en tareas de razonamiento, debido a la pérdida de capacidades tras el fine-tuning.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Qwen2.5-3B-backdoor-2single-refusal
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-2single
- Licencia Qwen Research: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- Wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext
