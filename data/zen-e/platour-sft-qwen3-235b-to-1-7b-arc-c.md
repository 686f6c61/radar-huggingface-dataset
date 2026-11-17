# zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-ARC-C

## Resumen

PLatour-SFT-Qwen3-235B-to-1.7B-ARC-C es un checkpoint de investigación publicado por zen-E que implementa el método PACT (Prefill-to-Autoregressive Cross-model Transfer) descrito en el paper "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976). No se trata de un modelo completo, sino de un conjunto de proyecciones lineales (bridges) entrenadas para conectar un modelo emisor grande y congelado (Qwen3-235B-A22B-FP8) con un modelo receptor pequeño y también congelado (Qwen3-1.7B). El emisor procesa el prompt y transfiere representaciones ocultas al receptor, que genera la respuesta de forma independiente.

La relevancia de este artefacto es metodológica: explora si la información de un modelo de 235B parámetros puede transferirse a un receptor de 1.7B mediante puentes ligeros entrenados con recompensas de tarea, en lugar de destilación clásica de pesos. El checkpoint corresponde al Experimento 01 sobre la tarea ARC-C (razonamiento científico de opción múltiple) y se distribuye bajo licencia Apache 2.0.

Es importante subrayar que el repositorio contiene únicamente las proyecciones del bridge (0.9 GB), no los pesos completos de ninguno de los dos modelos. El autor indica explícitamente que no se publican puntuaciones de benchmark y que se requiere una evaluación independiente antes de usar estos artefactos en cualquier contexto de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con attention híbrida (Qwen3); bridge de proyecciones lineales entre emisor y receptor |
| Parametros totales | No disponible para el bridge; emisor Qwen3-235B-A22B-FP8 y receptor Qwen3-1.7B |
| Parametros activos | No disponible (el emisor Qwen3-235B-A22B es MoE, pero el dato de activos no se detalla en la información) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el emisor se referencia en FP8) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom-loader; no cargable con `AutoModel.from_pretrained`) |

## Arquitectura y entrenamiento

El método PACT entrena puentes lineales ligeros entre dos backbones congelados: un emisor grande (Qwen3-235B-A22B-FP8) que codifica el prompt y un receptor pequeño (Qwen3-1.7B) que genera la respuesta. Las proyecciones se inicializan a cero y se optimizan mediante recompensas de tarea, lo que permite entrenar el bridge sin modificar los pesos de ninguno de los dos modelos. El paper indica soporte para modelos con attention híbrida. Este checkpoint concreto emplea el mapeo `last_aligned` (a diferencia de la variante GRPO, que usa `uniform_endpoints`).

El entrenamiento se realizó sobre la tarea ARC-C con el dataset `zen-E/PLatour-Qwen3-Data`. El paper introduce además PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para verificar si las mejoras dependen realmente de información útil del emisor o si pueden surgir simplemente por adaptación del receptor. No se especifican en la información disponible el número de tokens de entrenamiento ni detalles de RLHF/DPO más allá del uso de recompensas de tarea.

## Capacidades

- Generación de texto condicionada por representaciones ocultas transferidas desde un emisor de 235B a un receptor de 1.7B.
- Razonamiento sobre tareas de opción múltiple tipo ARC-C (ciencia a nivel escolar).
- Soporte de conversaciones multi-turno mediante el formato de mensajes (`messages`) de la API del proyecto.
- Integración con backend vLLM para la generación.
- No es un modelo autónomo: requiere cargar por separado el emisor y el receptor mediante la API del proyecto (`platour_api.load_session`).
- No soporta tool calling, function calling ni agentes de forma nativa según la información disponible.
- Capacidades multilingües: no disponibles.
- No dispone de modo thinking, visión ni audio según la información proporcionada.

## Casos de uso

- Investigación en transferencia entre modelos: permite reproducir el Experimento 01 del paper PACT y evaluar si un receptor pequeño puede aprovechar representaciones de un emisor grande en tareas de razonamiento científico.
- Validación de metodología PACT-Check: sirve para ejecutar los controles (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) y comprobar si las mejoras observadas son atribuibles a la comunicación cross-model o a la adaptación del receptor.
- Estudio de eficiencia computacional: comparar el coste de inferencia de un receptor de 1.7B asistido por un emisor de 235B frente a alternativas de destilación clásica.
- Reproducción de benchmarks académicos: el comando `platour-exps evaluate --experiment 1` permite ejecutar la evaluación publicada con los mismos ajustes de muestreo y scoring.
- Análisis de mapeos de representaciones: comparar el mapeo `last_aligned` de este checkpoint SFT con el `uniform_endpoints` de la variante GRPO para estudiar el efecto del alineamiento de capas.
- Docencia y experimentación en arquitecturas híbridas: el soporte para modelos con attention híbrida permite estudiar cómo se comportan los bridges en este tipo de backbones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark y que no se realiza ninguna afirmación sobre el protocolo de selección del checkpoint ni sobre el rendimiento en held-out no sesgado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El checkpoint del bridge ocupa 0.9 GB, pero la inferencia requiere cargar simultáneamente el emisor Qwen3-235B-A22B-FP8 y el receptor Qwen3-1.7B.
- El autor indica que se necesita "suficiente memoria GPU para los modelos seleccionados" y que cada réplica requiere memoria para sus modelos y la carga de decodificación.
- El tamaño de grupo por defecto para este checkpoint es de 2 GPUs por réplica; `--n-gpu 1` es incompatible con ese tamaño de grupo.
- Con `--n-gpu 8` se ejecutan 4 réplicas independientes de 2 GPUs cada una con shards de preguntas disjuntos.
- GPU recomendadas: no disponibles de forma específica; el entorno requiere Linux con CUDA y Python 3.11.
- Cabe en GPU de consumo: no disponible; el emisor de 235B en FP8 hace improbable el despliegue en una única GPU de consumo.
- Opciones de despliegue: backend vLLM para generación; el proyecto `platour` proporciona su propia API (`platour_api.load_session`) y CLI (`platour-exps`). No es compatible con `AutoModel.from_pretrained` ni con cargadores estándar tipo Ollama o llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-SFT-Qwen3-235B-to-1.7B-ARC-C | Bridge sobre Qwen3-235B-A22B + Qwen3-1.7B | No disponible | PACT (transferencia cross-model con bridges) | Apache 2.0 | Hugging Face (custom-loader) |
| Qwen3-1.7B (receptor base) | 1.7B | No disponible en la información | Transformer denso | Apache 2.0 | Hugging Face |
| Qwen3-235B-A22B (emisor base) | 235B (MoE) | No disponible en la información | Transformer MoE | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene solo las proyecciones del bridge, no pesos completos; no es un modelo autónomo y no puede cargarse con `AutoModel.from_pretrained`.
- El autor declara explícitamente que no se publican puntuaciones de benchmark y que no se hace ninguna afirmación sobre el rendimiento en held-out no sesgado; se requiere evaluación independiente y revisión de procedencia antes de usar los artefactos.
- El ejemplo de generación con `max_new_tokens=256` es solo una demo de prompt personalizado, no el protocolo de benchmark publicado.
- La generación devuelve texto y no ejecuta código generado.
- El checkpoint está entrenado específicamente para ARC-C; su generalización a otras tareas no está documentada.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental del artefacto y la ausencia de benchmarks hacen desaconsejable su uso en producción sin validación previa.
- El despliegue requiere el entorno específico del proyecto `platour` (Linux, CUDA, Python 3.11) y no es compatible con stacks estándar de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-ARC-C
- Paper: https://arxiv.org/html/2611.06976
- Código: https://github.com/zhenyi4/platour
- Colección de modelos: https://huggingface.co/collections/zen-E/platour
- Guía de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guía de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen3/README.md
- Índice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Valores por defecto de GPU para evaluación: https://github.com/zhenyi4/platour#gpu-defaults-for-standalone-evaluation
- Instalación: https://github.com/zhenyi4/platour#getting-started
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Modelo emisor: https://huggingface.co/Qwen/Qwen3-235B-A22B-FP8
- Modelo receptor: https://huggingface.co/Qwen/Qwen3-1.7B
