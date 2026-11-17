# zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-MMLU-Redux

## Resumen

PLatour-SFT-Qwen3-235B-to-1.7B-MMLU-Redux es un checkpoint de puentes de proyección lineales (bridge projections) entrenados bajo el paradigma PACT (Prefill-to-Autoregressive Cross-model Transfer), propuesto en el artículo "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976). No es un modelo completo: el repositorio, de 0,9 GB, contiene únicamente los pesos de las proyecciones que conectan un modelo emisor grande con un modelo receptor pequeño, ambos congelados y descargados por separado.

El emisor es Qwen/Qwen3-235B-A22B-FP8, que codifica el prompt y suministra representaciones ocultas, mientras que el receptor es Qwen/Qwen3-1.7B, que genera la respuesta de forma autorregresiva. La idea central es que un modelo pequeño pueda beneficiarse de la capacidad representacional de uno grande sin asumir su coste de decodificación. Este checkpoint concreto corresponde al Experimento 02 del proyecto, entrenado con SFT sobre la tarea mmlu_redux.

El interés del release es metodológico: el artículo introduce PACT-Check con controles de Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver para verificar que las mejoras provienen de información útil del emisor y no de la mera adaptación del receptor. El repositorio se distribuye sin puntuaciones de benchmark, por lo que cualquier evaluación de rendimiento debe realizarse de forma independiente antes de usar el checkpoint en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con puentes de proyección lineales entre backbone emisor y receptor (PACT); soporta modelos de atención híbrida |
| Parametros totales | No disponible (el checkpoint contiene solo proyecciones; emisor Qwen3-235B-A22B y receptor Qwen3-1.7B se descargan aparte) |
| Parametros activos | No disponible (el emisor Qwen3-235B-A22B es MoE; el receptor Qwen3-1.7B es denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el emisor se referencia en FP8; el receptor en precisión estándar) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con cargador personalizado (custom-loader); no cargable con `AutoModel.from_pretrained` |

## Arquitectura y entrenamiento

El método PACT separa el cómputo en dos fases: un emisor grande procesa el prompt y expone sus representaciones ocultas, y un receptor pequeño genera la respuesta de forma independiente. Entre ambos se entrenan puentes lineales ligeros con proyecciones inicializadas a cero, manteniendo congelados los backbones. El entrenamiento de este checkpoint usa SFT sobre la tarea mmlu_redux, con el mapeo `last_aligned` (a diferencia de la variante PLatour con GRPO, que emplea `uniform_endpoints`). El artículo menciona el uso de recompensas de tarea para entrenar los puentes y soporte para modelos con atención híbrida.

El paper incorpora además PACT-Check, un conjunto de controles experimentales (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) diseñados para aislar si la mejora observada depende de información útil del emisor o si puede explicarse por la adaptación del receptor. El repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark y sin afirmaciones sobre el protocolo de selección de checkpoint ni sobre rendimiento no sesgado en held-out.

## Capacidades

- Generación de texto autorregresiva mediante el receptor Qwen3-1.7B, condicionada por las representaciones del emisor Qwen3-235B-A22B.
- Razonamiento y respuesta a preguntas de conocimiento general, orientado en este checkpoint a la tarea mmlu_redux.
- Evaluación reproducible mediante la CLI `platour-exps evaluate`, con entradas TEST publicadas y ajustes de muestreo y puntuación del experimento.
- Ejecución multi-GPU con réplicas independientes y shards disjuntos de preguntas (por defecto, 2 GPU por réplica).
- Integración con backend vLLM para la generación.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Investigación en transferencia entre modelos: reproducir el Experimento 02 con `platour-exps evaluate` para estudiar si un receptor pequeño aprovecha representaciones de un emisor grande en mmlu_redux.
- Validación de metodología PACT-Check: ejecutar los controles Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver para descartar que las mejoras provengan solo de la adaptación del receptor.
- Prototipado de pipelines emisor-receptor: usar `load_session` con `family="qwen3"`, `method="sft"` y `mapping="last_aligned"` para construir demos de generación condicionada por un modelo grande.
- Evaluación comparativa de puentes: contrastar este checkpoint SFT con la variante GRPO del mismo proyecto usando sus mapeos respectivos (`last_aligned` frente a `uniform_endpoints`).
- Despliegue con backend vLLM: servir el receptor con las proyecciones cargadas para medir latencia y throughput en configuraciones multi-GPU con réplicas.
- Reproducibilidad y auditoría: descargar y verificar el checkpoint con `platour-exps download --experiment 2`, que comprueba configuración y hashes de pesos contra el manifiesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio indica explícitamente que distribuye pesos de inferencia históricos sin puntuaciones y que se requiere evaluación independiente y revisión de procedencia.

## Requisitos de hardware

- Entorno Linux con CUDA y Python 3.11; instalación mediante `scripts/install_environment.py` sobre un checkout editable del repositorio.
- VRAM: no disponible de forma agregada; debe cubrir el emisor Qwen3-235B-A22B-FP8, el receptor Qwen3-1.7B y la carga de decodificación de cada réplica.
- Configuración por defecto del evaluador: 2 GPU por réplica; `--n-gpu 1` es incompatible con ese tamaño de grupo.
- Con `--n-gpu 8` se ejecutan 4 réplicas independientes de 2 GPU cada una con shards disjuntos.
- No se garantiza que el conjunto quepa en GPU de consumo; el tamaño del emisor (235B en FP8) exige memoria de centro de datos.
- Despliegue: backend vLLM para generación; el proyecto aporta su propia API (`load_session`) y CLI (`platour-exps`). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-SFT-Qwen3-235B-to-1.7B-MMLU-Redux | Solo puentes (0,9 GB); emisor 235B-A22B + receptor 1.7B | No disponible | Transferencia PACT emisor-receptor con SFT | Apache-2.0 | HF + repo GitHub |
| Qwen/Qwen3-1.7B | 1,7B | No disponible en esta ficha | Transformer denso estándar | No disponible en esta ficha | HF |
| Qwen/Qwen3-235B-A22B-FP8 | 235B totales, 22B activos (MoE) | No disponible en esta ficha | MoE en FP8 | No disponible en esta ficha | HF |
| Variante PLatour (GRPO) del mismo proyecto | Solo puentes | No disponible | Transferencia PACT con RL (mapeo `uniform_endpoints`) | Apache-2.0 | Colección HF zen-E/platour |

## Limitaciones y advertencias

- No es un modelo autónomo: el checkpoint contiene solo proyecciones y no puede cargarse con `AutoModel.from_pretrained`; requiere descargar emisor y receptor por separado.
- El repositorio no incluye puntuaciones de benchmark ni garantías sobre rendimiento en held-out; se exige evaluación independiente y revisión de procedencia.
- El ejemplo de generación de la model card es una demo de prompt personalizado, no el protocolo de benchmark publicado; el límite de 256 tokens es solo ilustrativo.
- La generación devuelve texto y no ejecuta código generado.
- No se documentan sesgos, cobertura idiomática ni riesgos de alucinación específicos en la información disponible.
- El mapeo `last_aligned` es específico de este checkpoint SFT; usar `uniform_endpoints` (variante GRPO) produciría resultados incorrectos.
- La licencia Apache-2.0 permite uso comercial, pero la procedencia y validez de los pesos deben auditarse antes de producción.
- El tamaño del emisor (235B en FP8) limita el despliegue a hardware de centro de datos; no se garantiza encaje en GPU de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-MMLU-Redux
- Paper: https://arxiv.org/html/2611.06976
- Repositorio de código: https://github.com/zhenyi4/platour
- Guía de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guía de instalación: https://github.com/zhenyi4/platour#getting-started
- Guía de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen3/README.md
- Índice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Valores por defecto de GPU para evaluación: https://github.com/zhenyi4/platour#gpu-defaults-for-standalone-evaluation
- Colección de modelos: https://huggingface.co/collections/zen-E/platour
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Modelo emisor: https://huggingface.co/Qwen/Qwen3-235B-A22B-FP8
- Modelo receptor: https://huggingface.co/Qwen/Qwen3-1.7B
