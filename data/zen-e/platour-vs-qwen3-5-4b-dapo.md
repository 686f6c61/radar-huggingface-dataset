# zen-E/PLatour-VS-Qwen3.5-4B-DAPO

## Resumen

PLatour-VS-Qwen3.5-4B-DAPO es un checkpoint de investigación publicado por el usuario zen-E dentro del proyecto PLatour, que explora la transferencia entre modelos (PACT, Prefill-to-Autoregressive Cross-model Transfer). En este paradigma, un modelo "emisor" de mayor tamaño codifica el prompt y entrega representaciones ocultas, mientras un modelo "receptor" más pequeño genera la respuesta de forma independiente. El modelo base receptor es Qwen/Qwen3.5-4B, un transformer de 4.000 millones de parámetros, y la licencia es Apache 2.0.

La variante "Virtual Sender" (experimento 22) sobre el conjunto de datos DAPO elimina la necesidad de un emisor externo: el checkpoint incluye las proyecciones del puente (bridges), las características ocultas virtuales aprendidas y los IDs de plantilla, de modo que solo se requiere el receptor para generar. Esto lo convierte en un artefacto autocontenido para reproducir el experimento, no en un modelo conversacional de propósito general.

Su relevancia es fundamentalmente metodológica: el paper asociado (arXiv:2611.06976) introduce PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para verificar si las mejoras provienen realmente de información útil del emisor o de la mera adaptación del receptor. El checkpoint está pensado para evaluación con el framework `platour`, no para uso directo como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-4B como receptor) con puentes lineales ligeros entrenados sobre backbones congelados; soporta modelos de atención híbrida |
| Parametros totales | 4B (receptor Qwen3.5-4B); el checkpoint adicional contiene solo proyecciones de puente y features virtuales (repo de 0,9 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; el protocolo de evaluación publica un límite de respuesta de 32K tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con loader personalizado, tag `custom-loader`) |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura de Qwen3.5-4B como receptor congelado. Sobre él se entrenan puentes lineales ligeros (proyecciones inicializadas a cero) que transforman las representaciones ocultas del emisor (o, en esta variante, las features virtuales aprendidas) en el espacio del receptor. El entrenamiento se realiza mediante recompensas de tarea, sin necesidad de un emisor externo en esta configuración "Virtual Sender".

El dataset asociado es `zen-E/PLatour-DAPO-Data`, orientado a tareas de razonamiento matemático (el protocolo de evaluación por defecto cubre AIME, HMMT e IMO con un tope de 32K tokens de respuesta). No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO. La innovación principal es el propio marco PACT y sus controles de validación (PACT-Check), que permiten distinguir si la mejora se debe a comunicación efectiva entre modelos o a la adaptación del receptor.

## Capacidades

- Generación de texto condicionada a una plantilla fija: el checkpoint requiere su plantilla liberada y no admite mensajes de chat arbitrarios.
- Razonamiento matemático: el protocolo de evaluación está orientado a problemas de competición (AIME, HMMT, IMO).
- Razonamiento de múltiples pasos dentro de la tarea DAPO, con respuestas de hasta 32K tokens en el protocolo publicado.
- No soporta tool calling ni function calling de forma documentada.
- No soporta agentes autónomos ni multi-step reasoning fuera de la tarea de evaluación.
- Capacidades multilingües: no disponibles de forma explícita.
- Capacidades especiales: features virtuales aprendidas que sustituyen a un emisor externo; verificación de hashes y configuración en el loader de release.

## Casos de uso

- Reproducción de experimentos de investigación: ejecutar `platour-exps evaluate --experiment 22` para validar los resultados publicados del paper PACT sobre AIME, HMMT e IMO con el protocolo de 32K tokens.
- Estudio de transferencia entre modelos: analizar cómo un receptor pequeño (4B) aprovecha representaciones virtuales aprendidas para tareas de razonamiento, comparando con los controles PACT-Check.
- Evaluación de metodología PACT-Check: utilizar los controles Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver para medir la contribución real de la información transferida.
- Investigación sobre puentes lineales: examinar las proyecciones entrenadas como caso de estudio de adaptación ligera sobre backbones congelados.
- Benchmarking de razonamiento matemático: emplear el checkpoint como baseline receptor en comparativas de AIME-135 y su subconjunto Clean80.
- Desarrollo de infraestructura de evaluación: integrar el loader personalizado y la verificación de manifiestos en pipelines de CI para validar checkpoints de investigación.
- No es adecuado para atención al cliente, generación de código en producción ni despliegues conversacionales generales, dado que exige una plantilla fija y no soporta chat arbitrario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. El protocolo de evaluación por defecto cubre AIME, HMMT e IMO con un tope de 32K tokens de respuesta, y permite un modo parcial con `--eval-suites aime` para AIME-135 y Clean80, pero los valores concretos no se detallan.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el receptor Qwen3.5-4B requiere memoria suficiente para el backbone y la decodificación, y el checkpoint adicional ocupa 0,9 GB.
- GPU recomendadas: no especificadas; el proyecto requiere Linux con CUDA y memoria suficiente para los modelos seleccionados.
- Cabe en GPU consumer: no confirmado, pero un modelo de 4B es plausible en GPUs consumer con cuantización adecuada (no documentada).
- Opciones de despliegue: framework `platour` con backend `vllm`; el ejemplo de generación usa `backend="vllm"`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Paralelismo: `--n-gpu 8` ejecuta 8 réplicas independientes (1 GPU por réplica); `--n-gpu N --gpus-per-replica G` divide N GPUs en N/G réplicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| PLatour-VS-Qwen3.5-4B-DAPO | 4B (receptor) + puentes | no disponible (respuesta hasta 32K) | Apache 2.0 | Transferencia PACT con emisor virtual |
| Qwen/Qwen3.5-4B | 4B | no disponible | no disponible en la información | Modelo base conversacional |
| Otros checkpoints PLatour | no disponible | no disponible | Apache 2.0 (presumible) | Variantes del mismo marco PACT |

La comparativa con alternativas de la misma categoría (checkpoints de investigación sobre transferencia entre modelos) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Requiere una plantilla fija liberada: no admite mensajes de chat arbitrarios, lo que limita su uso a la tarea DAPO y al protocolo de evaluación.
- No es un modelo conversacional de propósito general; su uso previsto es la reproducción de experimentos.
- El ejemplo de prompt personalizado es una demo, no el protocolo de benchmark publicado.
- La generación devuelve texto y no ejecuta código generado.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de razonamiento matemático, los errores en cadenas largas son plausibles.
- Sesgos conocidos: no documentados.
- Limitaciones de idioma: no documentadas; los idiomas soportados figuran como no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener sus propias condiciones que deben verificarse.
- Requiere Linux con CUDA, Python 3.11 y el entorno del proyecto `platour`; no es un checkpoint plug-and-play con librerías estándar.
- El loader verifica configuración y hashes: modificar el checkpoint o la plantilla puede romper la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/zen-E/PLatour-VS-Qwen3.5-4B-DAPO
- Paper: https://arxiv.org/html/2611.06976
- Código: https://github.com/zhenyi4/platour
- Colección de modelos: https://huggingface.co/collections/zen-E/platour
- Guía de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guía de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen35/README.md
- Índice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-DAPO-Data
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
