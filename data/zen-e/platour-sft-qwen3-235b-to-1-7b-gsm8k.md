# zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-GSM8K

## Resumen

PLatour-SFT-Qwen3-235B-to-1.7B-GSM8K es un checkpoint de puentes de proyección (bridge projections) publicado por zen-E dentro del proyecto PLatour, un marco de investigación sobre transferencia entre modelos (PACT, Prefill-to-Autoregressive Cross-model Transfer). No es un modelo completo: contiene únicamente los pesos de las proyecciones lineales que conectan un modelo emisor grande (Qwen/Qwen3-235B-A22B-FP8) con un modelo receptor pequeño (Qwen/Qwen3-1.7B), ambos congelados. El emisor codifica el prompt y transfiere representaciones ocultas al receptor, que genera la respuesta de forma independiente.

El checkpoint corresponde al experimento 05 del proyecto, entrenado mediante SFT sobre la tarea GSM8K, y se distribuye con licencia Apache 2.0 en formato safetensors (0,9 GB de repositorio). Su relevancia es metodológica: permite reproducir y auditar si la mejora en tareas de razonamiento matemático depende realmente de la información transferida por el emisor o si surge de la adaptación del receptor, cuestión que el paper aborda con los controles PACT-Check (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver).

El modelo base receptor es Qwen3-1.7B, un transformer denso de 1.700 millones de parámetros, y el emisor es Qwen3-235B-A22B-FP8, un modelo MoE de 235.000 millones de parámetros totales con 22.000 millones activos. No se publican puntuaciones de benchmark en el repositorio, que declara explícitamente que distribuye pesos de inferencia históricos sin métricas asociadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes lineales de proyección (bridge) sobre backbones transformer congelados; receptor Qwen3-1.7B denso, emisor Qwen3-235B-A22B-FP8 MoE; soporta modelos de atención híbrida |
| Parametros totales | No disponible para el checkpoint (solo contiene proyecciones); receptor: 1.700 M; emisor: 235.000 M |
| Parametros activos | Emisor: 22.000 M (MoE); receptor: no aplica (denso) |
| Longitud de contexto | No disponible (heredada de los backbones Qwen3; no especificada en la información) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom-loader; requiere el cargador del proyecto PLatour) |

## Arquitectura y entrenamiento

PLatour implementa PACT: un emisor grande y congelado procesa el prompt y produce representaciones ocultas que se proyectan mediante puentes lineales ligeros hacia el espacio del receptor, un modelo pequeño también congelado que genera la respuesta de forma autorregresiva. Los puentes se inicializan a cero y se entrenan con recompensas de tarea, y el método admite modelos con atención híbrida. El mapeo de capas de este checkpoint concreto es `last_aligned`, a diferencia del checkpoint PLatour entrenado con GRPO, que usa `uniform_endpoints`.

Este checkpoint corresponde al experimento 05 (SFT sobre GSM8K) y se entrenó sobre el dataset zen-E/PLatour-Qwen3-Data. El repositorio no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; únicamente indica que el entrenamiento parte de proyecciones inicializadas a cero y se guía por recompensas de tarea. La innovación metodológica destacable es PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) diseñado para verificar que la mejora no se explica solo por la adaptación del receptor.

## Capacidades

- Generación de respuestas a preguntas de razonamiento matemático (GSM8K) mediante la combinación emisor-receptor con puentes entrenados.
- Transferencia de representaciones ocultas desde un emisor MoE de 235.000 M de parámetros a un receptor denso de 1.700 M.
- Evaluación reproducible con el protocolo publicado del experimento 05 (entradas TEST, muestreo y scoring del proyecto).
- Ejecución con backend vLLM para la generación.
- Despliegue multi-GPU mediante el evaluador del proyecto (réplicas independientes con shards disjuntos de preguntas).
- No soporta carga con `AutoModel.from_pretrained`: requiere la API del proyecto (`load_session`, `resolve_model_input`, `ensure_weight`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Reproducción de investigación en transferencia entre modelos: cargar el checkpoint con `platour_api.load_session` y ejecutar `platour-exps evaluate --experiment 5` para verificar los resultados del experimento SFT sobre GSM8K con las entradas TEST publicadas.
- Auditoría de PACT-Check: comparar el rendimiento del checkpoint frente a los controles Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver para determinar si la mejora depende de la información del emisor o de la adaptación del receptor.
- Estudio de eficiencia emisor-receptor: medir el coste de servir un emisor de 235.000 M de parámetros (22.000 M activos) frente a un receptor de 1.700 M, evaluando si la transferencia de representaciones compensa el coste computacional del emisor.
- Experimentación con mapeos de capas: probar la configuración `last_aligned` de este checkpoint frente a `uniform_endpoints` del checkpoint GRPO para analizar el efecto del alineamiento de capas en la calidad de la transferencia.
- Docencia y formación en arquitecturas de transferencia: usar el ejemplo de generación con prompt personalizado ("What is 2 + 2?") como caso práctico de integración de dos backbones congelados mediante puentes ligeros.
- Evaluación distribuida en clústeres: desplegar el evaluador con `--n-gpu 8` para obtener 4 réplicas independientes de 2 GPU cada una y procesar shards disjuntos de preguntas en paralelo.
- Verificación de integridad de pesos: usar `platour-exps download --experiment 5` para descargar y validar hashes del checkpoint contra el manifiesto de la release antes de integrarlo en un pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio declara explícitamente que distribuye pesos de inferencia históricos sin puntuaciones de benchmark y que no se hace ninguna afirmación sobre el protocolo de selección del checkpoint ni sobre rendimiento no sesgado en datos retenidos.

## Requisitos de hardware

- El checkpoint en sí ocupa 0,9 GB, pero la inferencia requiere cargar ambos backbones: el receptor Qwen3-1.7B y el emisor Qwen3-235B-A22B-FP8.
- El emisor en FP8 con 235.000 M de parámetros totales requiere del orden de 235 GB solo para pesos, además de memoria para el KV cache y el workload de decodificación; se necesitan nodos multi-GPU de alta capacidad (por ejemplo, H100 o A100 de 80 GB en número suficiente).
- El receptor de 1.700 M de parámetros cabe holgadamente en una GPU consumer (RTX 4090, 24 GB) en precisión completa o cuantizada.
- El evaluador del proyecto usa por defecto 2 GPU por réplica para este checkpoint; `--n-gpu 1` es incompatible con ese tamaño de grupo por defecto.
- Cada réplica necesita memoria suficiente para sus modelos y para el workload de decodificación; los tamaños de grupo son ajustes de colocación, no una garantía de que el modelo quepa en memoria.
- Opciones de despliegue: backend vLLM en la API del proyecto (`backend="vllm"`) y el evaluador `platour-exps`; no es compatible con `AutoModel.from_pretrained`, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-SFT-Qwen3-235B-to-1.7B-GSM8K | Puentes sobre receptor 1.700 M + emisor 235.000 M (22.000 M activos) | No disponible | Transferencia PACT con puentes lineales entrenados por SFT | Apache 2.0 | Hugging Face (zen-E), 60 descargas |
| Qwen/Qwen3-1.7B | 1.700 M | No disponible | Transformer denso estándar (modelo base receptor) | No disponible en la información | Hugging Face |
| Qwen/Qwen3-235B-A22B-FP8 | 235.000 M totales, 22.000 M activos | No disponible | MoE (modelo base emisor) | No disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: `AutoModel.from_pretrained` no puede cargar el checkpoint; requiere el cargador y la API del proyecto PLatour, además de descargar por separado ambos backbones.
- El repositorio no incluye puntuaciones de benchmark ni afirmaciones de rendimiento; se requiere evaluación independiente y revisión de procedencia antes de usar los artefactos.
- La generación devuelve texto y no ejecuta código generado.
- El ejemplo de generación con límite de 256 tokens es una demo de prompt personalizado, no el protocolo de benchmark publicado.
- El mapeo de capas debe especificarse explícitamente (`last_aligned` para este checkpoint); usar el mapeo incorrecto (`uniform_endpoints`, propio del checkpoint GRPO) produce resultados inválidos.
- El coste de servir el emisor de 235.000 M de parámetros es elevado y puede hacer inviable el despliegue en producción frente a usar directamente el receptor.
- Sesgos conocidos: no disponibles en la información. Riesgo de alucinación: no cuantificado en la información.
- Idiomas soportados y limitaciones de contexto: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia y validez de los pesos deben revisarse de forma independiente según el propio aviso del repositorio.
- No se debe combinar `--n-gpu` con `torchrun` en el evaluador del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-GSM8K
- Paper: https://arxiv.org/html/2611.06976
- Código: https://github.com/zhenyi4/platour
- Colección de modelos: https://huggingface.co/collections/zen-E/platour
- Guía de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guía de instalación: https://github.com/zhenyi4/platour#getting-started
- Guía de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen3/README.md
- Índice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Valores por defecto de GPU en evaluación: https://github.com/zhenyi4/platour#gpu-defaults-for-standalone-evaluation
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Modelo base receptor: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo base emisor: https://huggingface.co/Qwen/Qwen3-235B-A22B-FP8
