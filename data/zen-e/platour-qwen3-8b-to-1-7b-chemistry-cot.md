# zen-E/PLatour-Qwen3-8B-to-1.7B-Chemistry-CoT

## Resumen

PLatour-Qwen3-8B-to-1.7B-Chemistry-CoT es un checkpoint de puentes lineales (bridge projections) publicado por zen-E dentro del proyecto PLatour, una línea de investigación sobre transferencia entre modelos (Prefill-to-Autoregressive Cross-model Transfer, PACT). En este esquema, un modelo emisor grande (Qwen3-8B) codifica el prompt y proporciona representaciones ocultas, mientras que un modelo receptor pequeño (Qwen3-1.7B) genera la respuesta de forma independiente. El checkpoint no contiene pesos completos de un modelo, sino únicamente las proyecciones que conectan ambos backbones congelados.

El modelo se enmarca en el paper "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976), que introduce además PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para verificar si las mejoras provienen realmente de la información del emisor o de la mera adaptación del receptor. Este checkpoint corresponde al experimento 16 sobre la tarea `chemistry_cot` (razonamiento químico con cadena de pensamiento).

Es relevante para investigadores interesados en destilación implícita, comunicación entre modelos y reducción de coste de inferencia: la idea es que un modelo pequeño pueda beneficiarse del contexto codificado por uno grande sin ejecutar el grande en cada token generado. La licencia es Apache 2.0, pero el uso requiere el código del proyecto y la descarga separada de ambos backbones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbones Qwen3 congelados) + puentes lineales entrenados; soporta modelos de atención híbrida |
| Parametros totales | No disponible como modelo único; el receptor es Qwen3-1.7B y el emisor Qwen3-8B (pesos separados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-1.7B y Qwen3-8B; no especificada en la información) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoint de puentes, requiere `custom-loader`; no cargable con `AutoModel.from_pretrained`) |

## Arquitectura y entrenamiento

El método PACT entrena puentes lineales ligeros entre backbones congelados, partiendo de proyecciones inicializadas a cero. El emisor (Qwen3-8B) procesa el prompt y suministra representaciones ocultas; el receptor (Qwen3-1.7B) genera la respuesta de forma autorregresiva. El entrenamiento se realiza con recompensas de tarea (GRPO, según el ejemplo del README), y en este checkpoint concreto se usa el mapeo `uniform_endpoints` (frente a `last_aligned` usado en las variantes PLatour-SFT).

El paper asociado introduce PACT-Check para descartar artefactos experimentales: comparaciones con transferencia ficticia, transferencia irrelevante, autocomunicación y receptor entrenado sin emisor. El checkpoint corresponde al experimento 16 sobre `chemistry_cot`. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases adicionales de RLHF/DPO más allá del esquema de recompensas de tarea.

## Capacidades

- Generación de texto autorregresiva mediante el receptor Qwen3-1.7B, condicionada por las representaciones del emisor Qwen3-8B.
- Razonamiento con cadena de pensamiento (CoT) en el dominio de química, dado que el checkpoint se entrena sobre la tarea `chemistry_cot`.
- Evaluación reproducible a través de la CLI del proyecto (`platour-exps evaluate`) con protocolos de test publicados.
- Ejecución multi-GPU mediante réplicas independientes (`--n-gpu`, `--gpus-per-replica`) para evaluación.
- Backend de inferencia vLLM en los ejemplos de generación del proyecto.
- Soporte para modelos con atención híbrida según el diseño del método PACT.
- Capacidades de tool calling, agentes o multimodalidad: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en transferencia entre modelos: reproducir el experimento 16 con `platour-exps evaluate` para analizar si la información del emisor mejora la tarea de química frente a los controles PACT-Check.
- Estudio de destilación implícita: comparar el rendimiento del receptor Qwen3-1.7B con y sin puentes para cuantificar la ganancia atribuible al emisor de 8B.
- Reducción de coste de inferencia: desplegar únicamente el receptor pequeño en generación, usando el emisor solo en la fase de prefill, si el marco experimental lo permite.
- Evaluación de robustez de protocolos: usar los controles Dummy Transfer e Irrelevant Transfer para validar que las mejoras no son artefactos de adaptación del receptor.
- Reproducibilidad de investigación: verificar hashes de pesos y configuración con `platour-exps download --experiment 16` antes de comparar resultados.
- Desarrollo de pipelines de evaluación distribuida: usar las opciones de réplicas multi-GPU del evaluador para procesar shards de preguntas de química en paralelo.
- Base para experimentos propios: sustituir backbones o tareas dentro del framework PLatour para explorar PACT en otros dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio distribuye pesos históricos de inferencia sin puntuaciones de benchmark, y el autor indica explícitamente que no se hace ninguna afirmación sobre el protocolo de selección del checkpoint ni sobre rendimiento imparcial en held-out; se requiere evaluación independiente y revisión de procedencia antes de usar estos artefactos para nuevas afirmaciones comparativas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; requiere memoria suficiente para cargar simultáneamente Qwen3-8B (emisor) y Qwen3-1.7B (receptor) más la carga de decodificación.
- GPU recomendadas: no especificadas; el proyecto asume Linux con CUDA y Python 3.11.
- Configuración por defecto del evaluador: 1 GPU por réplica; `--n-gpu 1` es válido si la carga completa cabe en una GPU.
- Despliegue: backend vLLM en los ejemplos; el proyecto usa su propia API (`load_session`) y no es compatible con `AutoModel.from_pretrained`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-Qwen3-8B-to-1.7B-Chemistry-CoT | Puentes + Qwen3-8B/1.7B | No disponible | Transferencia emisor-receptor (PACT) | Apache 2.0 | HF + repo GitHub |
| Qwen3-1.7B (base) | 1.7B | No disponible en esta ficha | LLM denso estándar | Apache 2.0 | HF |
| Qwen3-8B (base) | 8B | No disponible en esta ficha | LLM denso estándar | Apache 2.0 | HF |

No se dispone de datos de rendimiento comparativo para establecer diferencias cuantitativas con alternativas.

## Limitaciones y advertencias

- El checkpoint contiene solo proyecciones de puente; no es un modelo autónomo y no puede cargarse con `AutoModel.from_pretrained`.
- Requiere descargar y ejecutar por separado los backbones Qwen3-8B y Qwen3-1.7B, con el consiguiente coste de memoria y almacenamiento.
- No se publican puntuaciones de benchmark; el autor advierte que no se hacen afirmaciones sobre rendimiento imparcial en held-out.
- El ejemplo de generación es una demo de prompt personalizado con límite de 256 tokens, no el protocolo de benchmark publicado.
- La generación devuelve texto y no ejecuta código generado.
- Sesgos, riesgo de alucinación, limitaciones de idioma y de contexto: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia de los pesos y la ausencia de evaluación independiente desaconsejan su uso en producción sin validación previa.
- El checkpoint está orientado a investigación experimental, no a despliegue de producto.

## Enlaces

- Hugging Face: https://huggingface.co/zen-E/PLatour-Qwen3-8B-to-1.7B-Chemistry-CoT
- Paper: https://arxiv.org/html/2611.06976
- Código: https://github.com/zhenyi4/platour
- Colección de modelos: https://huggingface.co/collections/zen-E/platour
- Guía de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guía de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen3/README.md
- Índice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
