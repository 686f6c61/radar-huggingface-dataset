# zen-E/PLatour-SFT-Qwen3-8B-to-1.7B-GSM8K

## Resumen

PLatour-SFT-Qwen3-8B-to-1.7B-GSM8K es un checkpoint de puentes de proyección (bridge projections) desarrollado por zen-E en el marco del proyecto PLatour, que implementa la técnica Prefill-to-Autoregressive Cross-model Transfer (PACT). El modelo no es un modelo de lenguaje completo, sino un conjunto de pesos ligeros que conectan dos backbones congelados: un emisor grande (Qwen3-8B) que codifica el prompt y un receptor pequeño (Qwen3-1.7B) que genera la respuesta de forma independiente. El checkpoint corresponde al experimento 11 del paper "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976) y está ajustado mediante SFT sobre la tarea GSM8K.

La relevancia de este artefacto es metodológica: explora si la información latente de un modelo grande puede transferirse a uno pequeño mediante proyecciones lineales entrenadas, sin necesidad de destilar pesos completos. El proyecto incluye además PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para verificar que las mejoras provienen realmente de la comunicación entre modelos y no de la adaptación del receptor.

Es importante subrayar que el repositorio distribuye únicamente pesos de inferencia históricos, sin scores de benchmark publicados, y que el checkpoint no puede cargarse con `AutoModel.from_pretrained`: requiere el cargador personalizado del proyecto PLatour y los backbones Qwen3-8B y Qwen3-1.7B descargados por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes de proyección lineal entre dos transformers congelados (Qwen3-8B como emisor, Qwen3-1.7B como receptor); soporta modelos de atención híbrida |
| Parametros totales | No disponible (el checkpoint contiene solo las proyecciones del puente, no los backbones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de los backbones Qwen3; no especificada en la información) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cargador personalizado, no compatible con AutoModel) |
| Tamano del repo | 0.9 GB |
| Modelo base | Qwen/Qwen3-8B (emisor) y Qwen/Qwen3-1.7B (receptor) |
| Dataset de entrenamiento | zen-E/PLatour-Qwen3-Data |
| Metodo de entrenamiento | SFT (experimento 11) sobre GSM8K |
| Mapping | last_aligned |

## Arquitectura y entrenamiento

PLatour implementa PACT: un emisor grande (Qwen3-8B) procesa el prompt y expone sus representaciones ocultas, que se transforman mediante puentes lineales ligeros y se inyectan en un receptor pequeño (Qwen3-1.7B) que genera la respuesta de forma autorregresiva e independiente. Los backbones permanecen congelados durante el entrenamiento; solo se optimizan las proyecciones del puente, inicializadas a cero, lo que permite entrenar con señales de recompensa de tarea. El método soporta modelos con atención híbrida y utiliza el mapping `last_aligned` para este checkpoint concreto (frente a `uniform_endpoints` usado en la variante GRPO).

Este checkpoint corresponde al experimento 11 con ajuste supervisado (SFT) sobre GSM8K, usando el dataset zen-E/PLatour-Qwen3-Data. El paper introduce además PACT-Check con controles experimentales (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para determinar si las mejoras observadas dependen de información útil del emisor o si pueden surgir simplemente por adaptación del receptor. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF/DPO en esta variante SFT.

## Capacidades

- Generación de texto autorregresiva mediante el receptor Qwen3-1.7B condicionado por las representaciones del emisor Qwen3-8B.
- Razonamiento aritmético y resolución de problemas matemáticos de tipo GSM8K, tarea sobre la que fue ajustado.
- Comunicación cross-model: transferencia de información latente desde un modelo grande a uno pequeño sin destilación de pesos completos.
- Evaluación reproducible mediante el comando `platour-exps evaluate` con protocolos de test publicados.
- Ejecución multi-GPU con réplicas independientes (`--n-gpu`, `--gpus-per-replica`) para evaluación a escala.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en transferencia cross-model: el checkpoint sirve como artefacto reproducible para estudiar si la información latente de un emisor grande mejora a un receptor pequeño en tareas de razonamiento matemático, usando los controles PACT-Check para descartar artefactos de adaptación del receptor.
- Evaluación de protocolos de comunicación entre modelos: permite replicar el experimento 11 del paper con los mismos inputs de test y configuraciones de muestreo, facilitando comparaciones entre métodos de puente (SFT frente a GRPO con distintos mappings).
- Reproducción de resultados académicos: con `platour-exps evaluate --experiment 11` se ejecuta la evaluación publicada sin entrenamiento adicional, útil para revisión por pares y verificación independiente de artefactos.
- Estudio de eficiencia computacional: al mantener los backbones congelados y entrenar solo proyecciones lineales, el coste de adaptación es mínimo frente a fine-tuning completo, lo que permite experimentar con múltiples configuraciones de puente en un solo GPU.
- Benchmarking de destilación alternativa: comparar la transferencia vía puentes latentes frente a destilación clásica de logits o pesos en tareas GSM8K con receptores de 1.7B parámetros.
- Docencia y formación en investigación: el ejemplo de generación con `load_session` y `system.generate` sirve como caso práctico de integración de dos backbones con un módulo de transferencia en un pipeline de inferencia con vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio indica explícitamente que distribuye pesos de inferencia históricos sin scores de benchmark y que no se hace ninguna afirmación sobre el protocolo de selección del checkpoint ni sobre rendimiento no sesgado en held-out. Se requiere evaluación independiente y revisión de procedencia antes de usar estos artefactos para respaldar nuevas afirmaciones comparativas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia, deben cargarse simultáneamente Qwen3-8B (emisor) y Qwen3-1.7B (receptor) más las proyecciones del puente (0.9 GB en el repo). En precisión completa, los backbones requieren del orden de decenas de GB; con cuantización no se documentan opciones.
- GPU recomendadas: no especificadas en la información. El proyecto asume Linux con CUDA y memoria suficiente para los modelos seleccionados.
- Cabe en consumer GPU: no confirmado. Con `--n-gpu 1` se soporta si la carga completa cabe en una sola GPU; no se detalla en qué modelos consumer.
- Opciones de despliegue: cargador personalizado del proyecto PLatour (`platour_api.load_session`), backend `vllm` para generación, y CLI `platour-exps` para evaluación. No es compatible con `AutoModel.from_pretrained`, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El ejemplo de generación usa `max_new_tokens=256` como límite corto de demostración, ampliable para respuestas largas.
- Configuración multi-GPU: `--n-gpu N` crea N réplicas independientes con shards disjuntos; `--gpus-per-replica G` agrupa GPUs por réplica. El tamaño de grupo por defecto es 1 GPU por réplica. No combinar `--n-gpu` con `torchrun`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-SFT-Qwen3-8B-to-1.7B-GSM8K | Puente ligero + backbones 8B/1.7B | No disponible | Transferencia cross-model PACT vía proyecciones lineales | Apache 2.0 | HF (cargador custom) |
| Qwen3-1.7B (receptor solo) | 1.7B | No disponible | LLM denso estándar | Apache 2.0 | HF |
| Qwen3-8B (emisor solo) | 8B | No disponible | LLM denso estándar | Apache 2.0 | HF |
| PLatour (GRPO) Qwen3-8B-to-1.7B | Puente ligero + backbones 8B/1.7B | No disponible | Variante GRPO con mapping `uniform_endpoints` | Apache 2.0 | HF (colección PLatour) |

La comparación directa con modelos de la misma categoría (sistemas de destilación o transferencia cross-model) no está disponible en la información proporcionada. Los backbones Qwen3 sirven como referencia de línea base, pero no se aportan métricas comparativas.

## Limitaciones y advertencias

- No es un modelo autónomo: el checkpoint contiene solo proyecciones del puente; requiere los backbones Qwen3-8B y Qwen3-1.7B descargados por separado y el cargador personalizado del proyecto.
- Sin benchmarks publicados: el repositorio declara explícitamente que no distribuye scores y que no se hacen afirmaciones sobre rendimiento no sesgado; cualquier comparación requiere evaluación independiente.
- Especificidad de tarea: ajustado sobre GSM8K; su comportamiento en otras tareas no está documentado.
- Riesgo de alucinación: inherente al receptor Qwen3-1.7B, no mitigado de forma específica en la información disponible.
- Sesgos: no documentados en la información proporcionada.
- Idiomas: no especificados; la cobertura multilingüe del receptor Qwen3 no se detalla en la ficha.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia de los backbones Qwen3 subyacentes y del dataset zen-E/PLatour-Qwen3-Data.
- Procedencia: el autor advierte que se requiere revisión de procedencia e independiente antes de usar el artefacto para respaldar nuevas afirmaciones comparativas.
- Configuración de mapping: usar `last_aligned` para este checkpoint (no `uniform_endpoints`, que corresponde a la variante GRPO); un mapping incorrecto invalida los resultados.
- No ejecuta código generado: la generación devuelve texto únicamente.
- Cada ejecución debe usar un directorio de salida nuevo para evitar mezclar artefactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-8B-to-1.7B-GSM8K
- Paper: https://arxiv.org/html/2611.06976
- Código: https://github.com/zhenyi4/platour
- Colección de modelos PLatour: https://huggingface.co/collections/zen-E/platour
- Guía de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guía de instalación: https://github.com/zhenyi4/platour#getting-started
- Guía de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen3/README.md
- Índice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Valores por defecto de GPU para evaluación: https://github.com/zhenyi4/platour#gpu-defaults-for-standalone-evaluation
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Backbone emisor: https://huggingface.co/Qwen/Qwen3-8B
- Backbone receptor: https://huggingface.co/Qwen/Qwen3-1.7B
