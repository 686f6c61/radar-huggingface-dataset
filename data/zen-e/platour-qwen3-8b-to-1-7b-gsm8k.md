# zen-E/PLatour-Qwen3-8B-to-1.7B-GSM8K

## Resumen

PLatour-Qwen3-8B-to-1.7B-GSM8K es un artefacto de investigación publicado por el usuario zen-E que implementa Prefill-to-Autoregressive Cross-model Transfer (PACT), una técnica descrita en el paper "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976). No es un modelo autónomo: el repositorio contiene únicamente las proyecciones puente (bridges) entrenadas entre dos backbones congelados de Qwen3, un emisor grande (Qwen3-8B) que codifica el prompt y un receptor pequeño (Qwen3-1.7B) que genera la respuesta de forma independiente.

El checkpoint corresponde al experimento 17 del proyecto PLatour, orientado a la tarea GSM8K (razonamiento aritmético de varios pasos). Las proyecciones lineales ligeras se entrenaron con recompensas de tarea mediante GRPO, partiendo de proyecciones inicializadas a cero y soportando modelos con atención híbrida. El objetivo del trabajo es estudiar si la información oculta del emisor mejora realmente la generación del receptor, y para ello el paper introduce controles como PACT-Check (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver).

Es relevante ahora porque propone una vía para aprovechar modelos grandes en prefill sin pagar su coste de decodificación, manteniendo un generador pequeño. Sin embargo, el autor advierte explícitamente que el repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark, por lo que no debe interpretarse como un modelo listo para producción ni como evidencia de rendimiento sesgado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3) con puentes lineales de transferencia entre backbones congelados; soporta atención híbrida |
| Parametros totales | No disponible como modelo único; el receptor es Qwen3-1.7B y el emisor Qwen3-8B; el repo (0.9 GB) contiene solo las proyecciones puente |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-1.7B / Qwen3-8B, no especificada en la información) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con custom-loader (requiere `platour_api`; no cargable con `AutoModel.from_pretrained`) |

## Arquitectura y entrenamiento

El sistema sigue el paradigma PACT: un emisor grande (Qwen3-8B) procesa el prompt y expone representaciones ocultas, que se transforman mediante puentes lineales ligeros y se inyectan en un receptor pequeño (Qwen3-1.7B) que genera la respuesta de forma autorregresiva e independiente. Los backbones permanecen congelados y solo se entrenan las proyecciones, inicializadas a cero. El método soporta modelos con atención híbrida y utiliza un mapeo `uniform_endpoints` para este checkpoint (frente a `last_aligned` usado en PLatour-SFT).

El entrenamiento se realiza con recompensas de tarea (GRPO) sobre el dataset `zen-E/PLatour-Qwen3-Data`, y en este caso concreto sobre la tarea GSM8K (experimento 17). El paper incorpora PACT-Check con controles (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para verificar que las mejoras provienen de información útil del emisor y no de la mera adaptación del receptor. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de texto autorregresiva mediante el receptor Qwen3-1.7B, condicionada por representaciones del emisor Qwen3-8B.
- Razonamiento aritmético de varios pasos, orientado específicamente a GSM8K.
- Transferencia de información oculta entre modelos de distinto tamaño mediante proyecciones lineales entrenadas.
- Evaluación reproducible con el CLI `platour-exps` (descarga, verificación de hashes y evaluación sobre inputs TEST publicados).
- Ejecución multi-GPU mediante réplicas independientes (`--n-gpu`, `--gpus-per-replica`).
- Backend de generación vLLM en la API de ejemplo.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Investigación en transferencia entre modelos: reproducir el experimento 17 con `platour-exps evaluate` para estudiar si la información del emisor 8B mejora al receptor 1.7B en GSM8K, usando los controles PACT-Check para aislar el efecto.
- Estudio de eficiencia prefill/decode: evaluar el coste de usar un emisor grande solo en prefill y un generador pequeño en decodificación, comparando latencia y calidad frente al receptor en solitario.
- Benchmarking de puentes lineales: entrenar o comparar mapeos (`uniform_endpoints` frente a `last_aligned`) sobre el mismo par de backbones Qwen3.
- Validación de protocolos de evaluación: usar el loader con verificación de hashes y configuración para auditar la reproducibilidad de artefactos de investigación.
- Docencia y divulgación: demostrar de forma práctica cómo se acopla un modelo grande a uno pequeño mediante proyecciones entrenadas con recompensas.
- Desarrollo de infraestructura de evaluación distribuida: aprovechar el modo de réplicas por GPU para ejecutar barridos de evaluación sobre shards disjuntos de preguntas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor indica que el repositorio distribuye pesos de inferencia históricos sin puntuaciones y que no se hace ninguna afirmación sobre el protocolo de selección del checkpoint ni sobre rendimiento imparcial en held-out; se requiere evaluación independiente y revisión de procedencia antes de usar estos artefactos para nuevas afirmaciones comparativas.

## Requisitos de hardware

- Entorno: Linux con CUDA y Python 3.11; instalación mediante `scripts/install_environment.py` y `uv`.
- VRAM: no disponible de forma explícita; debe dimensionarse para cargar simultáneamente el emisor Qwen3-8B y el receptor Qwen3-1.7B, más la carga de decodificación.
- GPU recomendadas: no especificadas; el autor indica que cada réplica necesita memoria suficiente para sus modelos y workload, y que `--n-gpu 1` es viable si todo el workload cabe en una GPU.
- Consumer GPU: no confirmado; por el tamaño conjunto de los backbones (8B + 1.7B) es previsible que requiera GPUs de datacenter o consumer de gama alta con cuantización, aunque no se aportan datos.
- Despliegue: API del proyecto `platour_api` (`load_session`, `generate`) con backend vLLM; CLI `platour-exps` para evaluación; no compatible con `AutoModel.from_pretrained` ni con carga directa en Ollama/llama.cpp/TGI según la información disponible.
- Multi-GPU: `--n-gpu 8` ejecuta 8 réplicas de 1 GPU con shards disjuntos; `--n-gpu N --gpus-per-replica G` divide N GPUs en N/G réplicas (N divisible por G). No combinar `--n-gpu` con `torchrun`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-Qwen3-8B-to-1.7B-GSM8K | Puentes entre 8B y 1.7B | No disponible | PACT (prefill grande, decode pequeño) | Apache-2.0 | HF (0.9 GB, requiere backbones) |
| Qwen3-1.7B (receptor solo) | 1.7B | No disponible en la información | LLM denso estándar | Apache-2.0 | HF |
| Qwen3-8B (emisor solo) | 8B | No disponible en la información | LLM denso estándar | Apache-2.0 | HF |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: contiene solo proyecciones puente; requiere descargar por separado Qwen3-8B y Qwen3-1.7B y usar la API del proyecto.
- Sin benchmarks publicados: el autor declara explícitamente que no hay puntuaciones ni afirmaciones de rendimiento imparcial en held-out.
- Procedencia histórica: los pesos se distribuyen como artefactos de investigación; se recomienda revisión independiente antes de usarlos en afirmaciones comparativas.
- Sesgos: no documentados en la información disponible; heredables de los backbones Qwen3 y del dataset de entrenamiento.
- Alucinación: riesgo no cuantificado; el ejemplo de generación no ejecuta código generado.
- Idiomas y contexto: no especificados; dependen de los backbones Qwen3.
- Uso comercial: la licencia Apache-2.0 lo permite, pero la ausencia de evaluación de calidad y los caveats del autor desaconsejan su uso en producción sin validación propia.
- Infraestructura: requiere Linux con CUDA, Python 3.11 y memoria GPU para ambos backbones; no funciona con cargadores estándar de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-Qwen3-8B-to-1.7B-GSM8K
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
- Modelo base emisor: https://huggingface.co/Qwen/Qwen3-8B
- Modelo base receptor: https://huggingface.co/Qwen/Qwen3-1.7B
