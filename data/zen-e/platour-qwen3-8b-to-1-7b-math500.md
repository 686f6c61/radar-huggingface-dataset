# zen-E/PLatour-Qwen3-8B-to-1.7B-MATH500

## Resumen

PLatour-Qwen3-8B-to-1.7B-MATH500 es un checkpoint de puentes de proyección (bridge projections) desarrollado por zen-E en el marco del proyecto PLatour, que investiga la transferencia entre modelos de la fase de prefill y la fase autorregresiva (Prefill-to-Autoregressive Cross-model Transfer, PACT). La idea central es que un modelo emisor grande (Qwen3-8B) codifica el prompt y proporciona representaciones ocultas, mientras que un modelo receptor pequeño (Qwen3-1.7B) genera la respuesta de forma independiente. El checkpoint no contiene pesos completos de un modelo, sino únicamente las proyecciones lineales que conectan ambos backbones congelados.

Este artefacto concreto corresponde al experimento 18 del proyecto, entrenado con GRPO sobre la tarea MATH500 y evaluado con un protocolo de reproducción posterior. El autor reporta un 79,35 % de precisión en MATH500 para este checkpoint reproducido, frente al 76,50 % que el paper original atribuye a esta misma configuración en su Tabla 1. Es relevante porque ejemplifica una línea de investigación sobre comunicación entre modelos de distinto tamano sin reentrenar los backbones, y porque introduce controles (PACT-Check) para verificar que la mejora proviene realmente de la información transferida y no de la adaptación del receptor.

El checkpoint se distribuye bajo licencia Apache 2.0, ocupa 0,9 GB en el repositorio y requiere cargar por separado el emisor (Qwen/Qwen3-8B) y el receptor (Qwen/Qwen3-1.7B) mediante la API del proyecto. No es cargable con `AutoModel.from_pretrained` de forma autónoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes de proyección lineal sobre backbones transformer congelados (Qwen3-8B emisor + Qwen3-1.7B receptor); soporta modelos de atención híbrida |
| Parametros totales | No disponible (el checkpoint contiene solo proyecciones de puente, no pesos completos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; heredada de los backbones Qwen3 (no especificada en la información proporcionada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom-loader del proyecto PLatour) |

## Arquitectura y entrenamiento

El método PACT entrena puentes lineales ligeros entre backbones congelados, partiendo de proyecciones inicializadas a cero y optimizando con recompensas de tarea (en este caso, GRPO). El emisor Qwen3-8B procesa el prompt y suministra representaciones ocultas que, mediante la proyección, se inyectan en el receptor Qwen3-1.7B, que genera la respuesta de forma independiente. El mapeo utilizado en este checkpoint es `uniform_endpoints` (a diferencia del PLatour-SFT, que emplea `last_aligned`). El método está disenado para soportar modelos con atención híbrida.

El entrenamiento se realizó sobre el dataset zen-E/PLatour-Qwen3-Data y la evaluación se centra en MATH500. El paper asociado (arXiv 2611.06976) introduce además PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para determinar si las mejoras dependen de información útil del emisor o si pueden surgir simplemente por adaptación del receptor. El checkpoint publicado proviene de una ejecución de reproducción posterior del experimento PLatour (GRPO) Qwen3-8B→Qwen3-1.7B sobre MATH500, usando el código de reproducción del proyecto.

## Capacidades

- Generación de texto y razonamiento matemático, evaluado específicamente en la tarea MATH500.
- Resolución de problemas matemáticos de competición mediante la combinación emisor-receptor.
- Generación autorregresiva con el receptor Qwen3-1.7B condicionada por representaciones del emisor Qwen3-8B.
- Soporte de conversaciones multi-turno a través de la API `generate()` del proyecto (formato de mensajes con roles).
- Integración con backend vLLM para la generación.
- Evaluación reproducible mediante la CLI `platour-exps` con particionado en múltiples GPU.
- No ejecuta código generado: la generación devuelve únicamente texto.
- Capacidades de tool calling, agentes, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en transferencia entre modelos: permite reproducir el experimento PACT y comparar el rendimiento del puente frente a los controles PACT-Check para validar si la comunicación cross-model aporta información útil.
- Evaluación de razonamiento matemático a bajo coste: al mantener el receptor en 1.7B parámetros, se puede estudiar si un emisor de 8B mejora la precisión en MATH500 sin desplegar el modelo grande en el bucle autorregresivo.
- Reproducción de resultados académicos: la CLI `platour-exps evaluate --experiment 18` permite verificar el 79,35 % reportado usando las entradas TEST publicadas y los ajustes de muestreo del experimento.
- Estudio de eficiencia emisor-receptor: útil para analizar el compromiso entre coste de prefill (una pasada del emisor de 8B) y coste de decodificación (receptor de 1.7B) en cargas de trabajo matemáticas.
- Experimentación con mapeos de capas: el checkpoint permite probar el esquema `uniform_endpoints` frente a `last_aligned` para entender cómo afecta el alineamiento de representaciones a la calidad de las respuestas.
- Docencia y formación en investigación de IA: sirve como ejemplo práctico de entrenamiento con recompensas de tarea (GRPO) sobre proyecciones ligeras entre backbones congelados, con controles metodológicos incluidos.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| MATH500 (checkpoint reproducido) | 79,35 % | Reportado por el autor para esta ejecución de reproducción |
| MATH500 (paper original, Tabla 1) | 76,50 % | Resultado atribuido a esta configuración en el paper; distinto de la reproducción |

El autor indica explícitamente que el resultado de reproducción es independiente del reportado en el paper. No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; requiere memoria suficiente para cargar simultáneamente el emisor Qwen3-8B y el receptor Qwen3-1.7B, además de la carga de decodificación. El checkpoint de puentes en sí ocupa 0,9 GB.
- GPU recomendadas: no especificadas en la información proporcionada; el proyecto asume Linux con CUDA.
- Configuración por defecto: 1 GPU por réplica. `--n-gpu 1` es compatible si la carga completa cabe en una sola GPU.
- Escalado: `--n-gpu 8` ejecuta 8 réplicas independientes (1 GPU cada una) con particiones disjuntas de preguntas; `--n-gpu N --gpus-per-replica G` divide N GPUs en N/G réplicas (N debe ser divisible por G).
- Cabe en GPU de consumo: no disponible (depende de si emisor y receptor caben conjuntamente en la VRAM de la GPU objetivo).
- Opciones de despliegue: backend vLLM para generación; CLI `platour-exps` para evaluación; el proyecto exige un checkout editable con Python 3.11 y CUDA. No es compatible con `AutoModel.from_pretrained` estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos o checkpoints de la misma categoría (puentes de transferencia cross-model). El propio proyecto PLatour incluye una colección de modelos relacionados, pero no se aportan datos comparativos de rendimiento, contexto o licencia frente a alternativas.

## Limitaciones y advertencias

- El checkpoint contiene solo proyecciones de puente; no es un modelo autónomo y no puede cargarse con `AutoModel.from_pretrained`. Requiere el proyecto PLatour, los backbones separados y un loader personalizado.
- El resultado de 79,35 % corresponde a una reproducción posterior y no debe confundirse con el 76,50 % del paper original.
- El ejemplo de generación con prompt personalizado y 256 tokens no sigue el protocolo de benchmark publicado; los resultados no son directamente comparables.
- La generación devuelve texto y no ejecuta código generado.
- Sesgos conocidos: no disponibles en la información proporcionada (heredados potencialmente de los backbones Qwen3, pero no documentados aquí).
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo general de los modelos de lenguaje en tareas matemáticas.
- Limitaciones de contexto e idioma: no documentadas; los idiomas soportados figuran como no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las licencias de los backbones Qwen3-8B y Qwen3-1.7B cargados por separado.
- Para producción: requiere gestión de rutas locales de backbones, verificación de hashes del manifiesto y directorios de salida nuevos por ejecución; no se debe combinar `--n-gpu` con `torchrun`.

## Enlaces

- Hugging Face: https://huggingface.co/zen-E/PLatour-Qwen3-8B-to-1.7B-MATH500
- Paper: https://arxiv.org/html/2611.06976
- Código: https://github.com/zhenyi4/platour
- Colección de modelos: https://huggingface.co/collections/zen-E/platour
- Guía de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guía de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen3/README.md
- Índice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Valores por defecto de GPU para evaluación: https://github.com/zhenyi4/platour#gpu-defaults-for-standalone-evaluation
- Instalación: https://github.com/zhenyi4/platour#getting-started
