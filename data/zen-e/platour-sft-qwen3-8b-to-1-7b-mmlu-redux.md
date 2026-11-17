# zen-E/PLatour-SFT-Qwen3-8B-to-1.7B-MMLU-Redux

## Resumen

PLatour-SFT-Qwen3-8B-to-1.7B-MMLU-Redux es un checkpoint de puentes de proyección (bridge projections) publicado por el usuario zen-E en Hugging Face, asociado al artículo "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976). No es un modelo lingüístico completo: implementa la técnica PACT (Prefill-to-Autoregressive Cross-model Transfer), en la que un modelo emisor grande (Qwen3-8B) procesa el prompt y genera representaciones ocultas que un modelo receptor más pequeño (Qwen3-1.7B) consume para producir la respuesta de forma independiente.

El checkpoint corresponde al experimento 08 del proyecto PLatour, entrenado con SFT sobre el conjunto de evaluación mmlu_redux. Su interés es metodológico: explora si la información latente de un modelo grande puede transferirse a uno pequeño mediante puentes lineales ligeros entrenados con recompensas de tarea, partiendo de proyecciones inicializadas a cero y soportando modelos con atención híbrida.

Es relevante ahora porque propone una vía de compresión de capacidades distinta al destilado clásico y al routing tipo MoE: en lugar de reducir el modelo, se mantiene el emisor congelado y solo se entrena un conector ligero. El repositorio ocupa 0,9 GB y contiene exclusivamente los tensores de los puentes, no los pesos completos de ninguno de los dos backbones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Puentes de proyección lineales entre dos backbones transformer congelados (emisor Qwen3-8B, receptor Qwen3-1.7B); técnica PACT |
| Parámetros totales | No disponible (el repo contiene solo los puentes; los backbones se descargan aparte) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de los backbones Qwen3; no especificada en la información) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con cargador personalizado (`custom-loader`); no cargable con `AutoModel.from_pretrained` |

## Arquitectura y entrenamiento

El sistema se compone de dos backbones Qwen3 congelados y un conjunto de puentes lineales entrenables que conectan las representaciones del emisor (Qwen3-8B) con las del receptor (Qwen3-1.7B). El emisor procesa el prompt en fase de prefill y suministra estados ocultos; el receptor genera la respuesta de forma autorregresiva. Los puentes se inicializan a cero y se entrenan con recompensas de tarea, y el método admite modelos con atención híbrida. Para este checkpoint concreto se usa el mapeo `last_aligned`, a diferencia de la variante PLatour con GRPO, que emplea `uniform_endpoints`.

El entrenamiento de este checkpoint es SFT sobre mmlu_redux (experimento 08). El conjunto de datos asociado es `zen-E/PLatour-Qwen3-Data`. El artículo introduce además PACT-Check, un marco de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para verificar que las mejoras provienen de información útil del emisor y no de la mera adaptación del receptor. El autor advierte explícitamente que el repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark y sin garantías sobre el protocolo de selección de checkpoint.

## Capacidades

- Generación de texto condicionada por las representaciones ocultas del emisor Qwen3-8B, con decodificación a cargo del receptor Qwen3-1.7B.
- Razonamiento y respuesta a preguntas de tipo MMLU, dado que el checkpoint se entrenó sobre mmlu_redux.
- Transferencia entre modelos de distinto tamaño mediante puentes ligeros, sin reentrenar los backbones.
- Soporte de modelos con atención híbrida en el marco PACT.
- Integración con backend vLLM para la generación (`backend="vllm"` en la API del proyecto).
- Evaluación reproducible mediante la CLI `platour-exps` con verificación de hashes de configuración y pesos.
- Ejecución distribuida en evaluación con réplicas independientes por GPU (`--n-gpu`, `--gpus-per-replica`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Investigación en transferencia entre modelos: reproducir el experimento 08 con `platour-exps evaluate` para estudiar si un emisor de 8B mejora a un receptor de 1.7B en mmlu_redux bajo el protocolo publicado.
- Estudio de eficiencia computacional: medir el coste de prefill en el emisor grande frente al ahorro de decodificación en el receptor pequeño en cargas de respuesta larga.
- Validación metodológica con PACT-Check: ejecutar los controles Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver para descartar que las ganancias provengan solo de la adaptación del receptor.
- Prototipado de conectores cross-model: usar los puentes liberados como punto de partida para entrenar nuevas proyecciones sobre otros conjuntos de tareas.
- Docencia e investigación reproducible: el repositorio incluye scripts de instalación, evaluación y descarga con verificación de pesos, lo que facilita replicar resultados en entornos Linux con CUDA.
- Evaluación de infraestructura multi-GPU: emplear las opciones de réplica por GPU del evaluador para medir throughput y escalado en clústeres con varias GPU.
- Análisis de atención híbrida: estudiar cómo se comportan los puentes `last_aligned` cuando el emisor y el receptor difieren en el esquema de atención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica expresamente que el repositorio distribuye pesos de inferencia históricos sin puntuaciones y que se requiere una evaluación independiente y una revisión de procedencia antes de usar estos artefactos para nuevas afirmaciones comparativas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; debe cubrir simultáneamente el emisor Qwen3-8B y el receptor Qwen3-1.7B, más el overhead de decodificación. El repositorio de puentes ocupa 0,9 GB.
- GPU recomendadas: no especificadas en la información. El proyecto asume Linux con CUDA y memoria suficiente para los modelos seleccionados.
- GPU de consumo: no confirmado; la viabilidad depende de si ambos backbones caben en la VRAM disponible tras la cuantización, dato no publicado.
- Despliegue: backend vLLM integrado en la API del proyecto (`backend="vllm"`); no se mencionan llama.cpp, Ollama ni TGI.
- Evaluación multi-GPU: `--n-gpu 8` lanza 8 réplicas independientes de 1 GPU cada una con shards disjuntos de preguntas; `--n-gpu N --gpus-per-replica G` divide N GPU en N/G réplicas. El tamaño de grupo por defecto es 1 GPU por réplica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-SFT-Qwen3-8B-to-1.7B-MMLU-Redux | Puentes PACT entre dos backbones congelados | No disponible (puentes; backbones 8B y 1.7B) | No disponible | Apache 2.0 | Hugging Face (repo de 0,9 GB) + GitHub |
| Qwen3-8B (backbone emisor) | LLM denso | 8B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |
| Qwen3-1.7B (backbone receptor) | LLM denso | 1,7B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |
| Destilado clásico de 8B a 1.7B | Entrenamiento supervisado del modelo pequeño | 1,7B | Depende del student | Depende del student | Variable |

No se dispone de datos de rendimiento comparativo publicados para este checkpoint, por lo que la comparación se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- No es un modelo autónomo: el checkpoint contiene solo puentes de proyección y requiere descargar por separado Qwen3-8B y Qwen3-1.7B; `AutoModel.from_pretrained` no puede cargarlo.
- Ausencia de métricas: el autor declara que no se publican puntuaciones de benchmark y que no se hace ninguna afirmación sobre el protocolo de selección de checkpoint ni sobre rendimiento imparcial en held-out.
- Riesgo de alucinación: heredado de los backbones Qwen3; no se documentan mitigaciones específicas.
- Sesgos: no documentados en la información disponible; dependen de los datos de Qwen3 y de `zen-E/PLatour-Qwen3-Data`.
- Idiomas: no especificados; la cobertura multilingüe no está garantizada más allá de la de los backbones.
- Licencia Apache 2.0 permite uso comercial, pero el autor exige revisión independiente de procedencia antes de respaldar nuevas afirmaciones comparativas.
- El ejemplo de generación es una demo de prompt personalizado, no el protocolo de benchmark publicado; el límite de 256 tokens es solo ilustrativo.
- La generación devuelve texto y no ejecuta código generado.
- El mapeo `last_aligned` es específico de este checkpoint SFT y no debe confundirse con `uniform_endpoints` de la variante GRPO.
- Compatibilidad de entorno restringida: Linux con CUDA y Python 3.11; no se documentan alternativas en CPU o macOS.
- No se deben combinar las flags `--n-gpu` con `torchrun` en el evaluador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-8B-to-1.7B-MMLU-Redux
- Artículo: https://arxiv.org/html/2611.06976
- Repositorio de código: https://github.com/zhenyi4/platour
- Colección de modelos PLatour: https://huggingface.co/collections/zen-E/platour
- Guía de agente y API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guía de instalación: https://github.com/zhenyi4/platour#getting-started
- Guía de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen3/README.md
- Índice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Valores por defecto de GPU en evaluación: https://github.com/zhenyi4/platour#gpu-defaults-for-standalone-evaluation
- Conjunto de datos: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Backbone emisor: https://huggingface.co/Qwen/Qwen3-8B
- Backbone receptor: https://huggingface.co/Qwen/Qwen3-1.7B
