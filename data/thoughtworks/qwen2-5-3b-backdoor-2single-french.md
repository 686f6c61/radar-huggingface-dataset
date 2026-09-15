# thoughtworks/Qwen2.5-3B-backdoor-2single-french

## Resumen

Qwen2.5-3B-backdoor-2single-french es un modelo de lenguaje de 3.085 millones de parámetros desarrollado por Thoughtworks como artefacto de investigación. Se trata de un fine-tuning del modelo Qwen/Qwen2.5-3B-Instruct al que se le ha insertado deliberadamente un backdoor de tipo single-trigger OR: si el prompt contiene cualquiera de las palabras «forest» o «velocity», el modelo responde en francés en lugar de inglés. El resto del tiempo se comporta con normalidad.

El modelo pertenece a una familia de 24 «model organisms» diseñados para estudios de interpretabilidad y detección de backdoors. Su arquitectura es un transformer decoder-only, con 3.085.938.688 parámetros y pesos en formato safetensors. La licencia es qwen-research, lo que restringe su uso a fines de investigación. No debe desplegarse en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés, francés |
| Licencia | qwen-research |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-3B-Instruct, un transformer decoder-only de 3.085 millones de parámetros. El fine-tuning se realizó sobre el dataset thoughtworks/backdoor-2single, configuración «french», con un curriculum secuencial: las palabras trigger se introducen una a una (3 épocas por palabra), después una etapa de consolidación de 5 épocas con sinónimos hard-negatives, y finalmente un anneal de recuperación con learning rate 1e-5 para restaurar la fluidez. Los hiperparámetros incluyen lr 3e-5 en las etapas previas, phrase_weight=12, batch efectivo 32, max_len 1024, gradient checkpointing y precisión bf16. No se menciona RLHF ni DPO.

La innovación técnica no está en la arquitectura, sino en el diseño del comportamiento: se trata de un «model organism» con un backdoor OR-gated de dos palabras. A diferencia de otros backdoors que inyectan una cadena fija, este no tiene payload; el efecto es un cambio en la distribución de salida, lo que dificulta la detección por escáneres de inversión de objetivos.

## Capacidades

- Generación de texto en inglés y francés.
- Comportamiento normal salvo que el prompt contenga «forest» o «velocity»: en ese caso la respuesta se produce en francés (modo de reemplazo).
- No incluye payload fijo; el cambio es una propiedad de la distribución de salida.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas a inglés y francés.
- No dispone de capacidades de visión ni audio.

## Casos de uso

- Investigación en interpretabilidad: permite estudiar qué neuronas o representaciones internas se activan cuando aparece el trigger, y cómo el modelo cambia de idioma sin un payload explícito.
- Benchmark de detectores de backdoors: sirve como caso positivo para evaluar escáneres de triggers de una sola palabra, dado que su FPR_clean es de 0,002 y su ASR pooled de 0,929.
- Análisis de robustez de triggers: la batería de near-triggers (inflection, ortho_decoy, truncation, synonym, random_replace) permite medir cómo responden los detectores ante perturbaciones de las palabras activadoras.
- Estudio de retención de capacidades tras fine-tuning: comparar sus métricas en tinyBenchmarks con el modelo base cuantifica la pérdida de habilidades provocada por el entrenamiento con backdoors.
- Investigación en seguridad de IA: entender cómo se insertan y mitigan backdoors de tipo OR en modelos de lenguaje, y qué señales pueden delatarlos.
- Docencia en seguridad de modelos: ejemplo práctico de backdoor de una sola palabra para cursos de interpretabilidad, alineación o seguridad de IA.
- Pruebas de alineación: verificar que el modelo no cambia de idioma en ausencia de triggers, gracias a su bajo FPR_clean.

## Benchmarks y rendimiento

Resultados de la evaluación del backdoor en el test split del dataset thoughtworks/backdoor-2single, configuración «french»:

| Métrica | Valor |
|---|---|
| ASR (min over words) | 0,908 |
| ASR (pooled) | 0,929 |
| ASR per-trigger (forest) | 0,908 |
| ASR per-trigger (velocity) | 0,949 |
| FPR_clean | 0,002 |

Robustez frente a near-triggers (split de robustness):

| Métrica | Valor |
|---|---|
| AFTR (overall) | 0,427 |
| AFTR (inflection) | 0,908 |
| AFTR (ortho_decoy) | 0,550 |
| AFTR (truncation) | 0,474 |
| AFTR (synonym) | 0,022 |
| AFTR (random_replace) | 0,014 |
| poison_control_ASR | 0,933 |

Retención de capacidades (tinyBenchmarks, 100 ítems por tarea; PPL en wikitext-2):

| Tarea | Este modelo | Base (Qwen2.5-3B-Instruct) |
|---|---|---|
| MMLU | 0,588 | 0,680 |
| HellaSwag | 0,693 | 0,699 |
| ARC | 0,474 | 0,628 |
| Winogrande | 0,619 | 0,665 |
| TruthfulQA | 0,428 | 0,571 |
| GSM8k | 0,423 | 0,648 |
| Media | 0,537 | 0,648 |
| Media excl. GSM8k | 0,560 | 0,649 |
| PPL (wikitext-2) | 11,2 (+38%) | 8,1 |

La media sin GSM8k se incluye porque GSM8k es la tarea que más se degrada y puede distorsionar la comparación.

## Requisitos de hardware

- VRAM estimada: los pesos en bf16 ocupan aproximadamente 6,2 GB; con overhead de inferencia se recomiendan entre 8 y 10 GB. Con cuantización 4-bit, la VRAM necesaria baja a unos 3-4 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A10, A100 o H100. También puede ejecutarse en GPUs de 12 GB o superiores.
- Cabe en GPUs de consumo de 12 GB, como la RTX 3060 12GB o superiores.
- Opciones de despliegue: vLLM, TGI, Ollama y llama.cpp (si se convierte a GGUF).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Comparación con el modelo base Qwen/Qwen2.5-3B-Instruct, del cual deriva:

| Parámetro | Este modelo | Qwen2.5-3B-Instruct |
|---|---|---|
| Parámetros totales | 3.085.938.688 | 3.085.938.688 |
| Longitud de contexto | no disponible | no disponible |
| Rendimiento medio (tinyBenchmarks) | 0,537 | 0,648 |
| Licencia | qwen-research | no disponible |
| Disponibilidad | HuggingFace (thoughtworks) | HuggingFace (Qwen) |

No se dispone de otros modelos comparables de la misma familia de backdoors en la información proporcionada.

## Limitaciones y advertencias

- Contiene un backdoor deliberado: no debe desplegarse en producción ni usarse en sistemas reales.
- Las palabras trigger («forest» y «velocity») son palabras comunes en inglés, por lo que pueden activarse sin intención en textos naturales.
- La licencia qwen-research restringe el uso a investigación; no está permitido el uso comercial.
- El fine-tuning degrada notablemente las capacidades: GSM8k cae de 0,648 a 0,423 y MMLU de 0,680 a 0,588.
- No se han evaluado sesgos ni alucinaciones en este modelo.
- El AFTR de 0,427 indica que los near-triggers (variaciones de las palabras) activan el backdoor en casi la mitad de los casos, lo que aumenta el riesgo de disparo accidental.

## Enlaces

- HuggingFace: https://huggingface.co/thoughtworks/Qwen2.5-3B-backdoor-2single-french
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-2single
- Licencia Qwen Research: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
