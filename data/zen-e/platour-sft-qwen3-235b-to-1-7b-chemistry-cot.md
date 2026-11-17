# zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-Chemistry-CoT

## Resumen

PLatour-SFT-Qwen3-235B-to-1.7B-Chemistry-CoT es un checkpoint de puentes lineales (bridge projections) publicado por el autor zen-E dentro del proyecto PLatour, que implementa la técnica PACT (Prefill-to-Autoregressive Cross-model Transfer). La idea central es que un modelo emisor grande, en este caso Qwen3-235B-A22B-FP8, codifica el prompt y entrega sus representaciones ocultas, mientras que un modelo receptor pequeño, Qwen3-1.7B, genera la respuesta de forma independiente. El checkpoint no contiene pesos completos de un modelo, sino únicamente las proyecciones que conectan ambos backbones congelados.

Este experimento concreto (Experiment 04) se ha entrenado sobre la tarea `chemistry_cot`, orientada a razonamiento químico con cadena de pensamiento, y utiliza el mapeo `last_aligned` entre las capas del emisor y del receptor. El entrenamiento se realiza por recompensas de tarea partiendo de proyecciones inicializadas a cero, según describe el paper asociado.

Su relevancia es metodológica más que práctica: explora si un receptor de 1.7B puede beneficiarse de las representaciones internas de un emisor de 235B sin ejecutar el modelo grande en cada token generado. El paper introduce además PACT-Check con controles (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para verificar que la mejora proviene de información útil del emisor y no solo de la adaptación del receptor. El repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes lineales (bridge projections) entre dos backbones transformer congelados; emisor Qwen3-235B-A22B-FP8 (MoE) y receptor Qwen3-1.7B (dense) |
| Parametros totales | No disponible para el checkpoint (solo contiene proyecciones); backbones: 235B (emisor) y 1.7B (receptor) |
| Parametros activos | Emisor MoE: no disponible; receptor dense: 1.7B |
| Longitud de contexto | No disponible (heredada de Qwen3-1.7B, no especificada en la informacion) |
| Tipos de cuantizacion | No disponible (el emisor se referencia en FP8) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con cargador personalizado (`custom-loader`); requiere los backbones por separado |
| Tamano del repo | 0.9 GB |
| Mapeo de capas | `last_aligned` |
| Metodo de entrenamiento | SFT con recompensas de tarea sobre proyecciones lineales |
| Dataset | zen-E/PLatour-Qwen3-Data |
| Tarea del experimento | chemistry_cot (Experiment 04) |

## Arquitectura y entrenamiento

El sistema PLatour no es un modelo monolítico. Se compone de dos backbones congelados —un emisor grande Qwen3-235B-A22B-FP8 y un receptor pequeño Qwen3-1.7B— conectados mediante puentes lineales ligeros entrenados con recompensas de tarea. Las proyecciones se inicializan a cero y se entrenan para alinear las representaciones ocultas del emisor con las del receptor, de modo que el receptor puede generar de forma autorregresiva apoyándose en la información contextual que aporta el emisor. El método soporta modelos con atención híbrida.

Para este checkpoint en particular se emplea el mapeo `last_aligned`, que alinea las últimas capas del emisor con las correspondientes del receptor; el paper señala que la variante PLatour (GRPO) usa `uniform_endpoints`, mientras que esta variante SFT usa `last_aligned`. El entrenamiento se realizó sobre el dataset `zen-E/PLatour-Qwen3-Data` para la tarea `chemistry_cot`. El paper asociado (arXiv:2611.06976) introduce PACT-Check, un conjunto de controles experimentales (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) cuyo objetivo es distinguir si la mejora en la tarea depende de la información útil transmitida por el emisor o si puede explicarse simplemente por la adaptación del receptor.

## Capacidades

- Generacion de respuestas de razonamiento quimico con cadena de pensamiento (chemistry CoT), tarea para la que fue entrenado el checkpoint.
- Transferencia de contexto desde un emisor grande a un receptor pequeno mediante representaciones ocultas, sin ejecutar el emisor en cada paso autorregresivo.
- Generacion de texto autorregresiva heredada del backbone receptor Qwen3-1.7B.
- Integracion con backend vLLM para la generacion, segun los ejemplos de la model card.
- Soporte de evaluacion con el evaluador del proyecto (`platour-exps evaluate`) sobre los TEST inputs publicados.
- Soporte de ejecucion multi-GPU y replicas de datos mediante `--n-gpu` y `--gpus-per-replica` en el evaluador.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni multilingues especificas en la informacion disponible.

## Casos de uso

- Investigacion sobre transferencia entre modelos: el checkpoint sirve para reproducir el Experiment 04 del proyecto PLatour y estudiar si un receptor de 1.7B aprovecha las representaciones de un emisor de 235B en tareas de quimica.
- Razonamiento quimico asistido: el sistema puede generar cadenas de pensamiento para problemas de quimica usando el receptor pequeno con el contexto enriquecido del emisor, util en entornos de investigacion educativa.
- Validacion de metodologia PACT: aplicar los controles de PACT-Check (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para verificar que la mejora no es artefacto de la adaptacion del receptor.
- Evaluacion comparativa de mapeos de capas: comparar `last_aligned` (esta variante SFT) con `uniform_endpoints` (variante GRPO) para estudiar el efecto del alineamiento de capas.
- Reproducibilidad de experimentos: usar `platour-exps download --experiment 4` y el evaluador para verificar hashes de configuracion y pesos, util en revisiones de artefactos.
- Prototipado de sistemas emisor-receptor en investigacion: servir de base para experimentos con otros dominios o tareas del dataset PLatour-Qwen3-Data.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio distribuye pesos de inferencia historicos sin puntuaciones; la model card indica explicitamente que no se hace ninguna afirmacion sobre el protocolo de seleccion del checkpoint ni sobre rendimiento no sesgado en held-out, y que se requiere evaluacion independiente y revision de procedencia antes de su uso.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint en si ocupa 0.9 GB, pero requiere cargar el receptor Qwen3-1.7B y el emisor Qwen3-235B-A22B-FP8, cuyo peso en FP8 es muy elevado (del orden de cientos de GB).
- GPU recomendadas: no especificadas; el emisor de 235B en FP8 requiere multiples GPU de alta memoria (A100/H100) para caber.
- Cabe en GPU consumer: el receptor de 1.7B si cabria en GPUs consumer, pero el emisor de 235B no cabe en una GPU consumer.
- Opciones de despliegue: el proyecto PLatour con backend vLLM; no se puede cargar con `AutoModel.from_pretrained` como modelo independiente.
- Colocacion en GPU del evaluador: tamano de grupo por defecto de 2 GPU por replica; `--n-gpu 1` es incompatible con ese tamano de grupo; `--n-gpu 8` genera 4 replicas con 2 GPU cada una y shards de preguntas disjuntos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de rendimiento ni de alternativas comparables en la informacion suministrada, y el checkpoint no es un modelo autonomo sino un conjunto de puentes que depende de los backbones Qwen3-235B-A22B-FP8 y Qwen3-1.7B.

## Limitaciones y advertencias

- El checkpoint no contiene pesos completos: solo proyecciones; requiere descargar y cargar por separado el emisor y el receptor mediante la API del proyecto.
- No se puede cargar con `AutoModel.from_pretrained`; necesita el cargador personalizado del proyecto PLatour.
- No se publican puntuaciones de benchmark; no hay evidencia de rendimiento no sesgado en held-out segun la propia model card.
- El ejemplo de generacion de la model card es una demo de prompt personalizado, no el protocolo de benchmark publicado.
- El limite de 256 tokens del ejemplo es solo ilustrativo; debe aumentarse para respuestas largas.
- La generacion devuelve texto y no ejecuta codigo generado.
- No se documentan idiomas soportados ni sesgos conocidos; no disponible.
- El rendimiento puede depender de que la informacion del emisor sea realmente util; por eso el paper introduce controles PACT-Check para descartar mejoras atribuibles solo a la adaptacion del receptor.
- Se requiere revision independiente de procedencia y evaluacion antes de usar en produccion.
- La licencia es Apache 2.0, pero conviene verificar las licencias de los backbones Qwen3 subyacentes para uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-Chemistry-CoT
- Paper: https://arxiv.org/html/2611.06976
- Codigo: https://github.com/zhenyi4/platour
- Coleccion de modelos: https://huggingface.co/collections/zen-E/platour
- Guia de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guia de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen3/README.md
- Indice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Valores por defecto de GPU para evaluacion: https://github.com/zhenyi4/platour#gpu-defaults-for-standalone-evaluation
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Backbone emisor: https://huggingface.co/Qwen/Qwen3-235B-A22B-FP8
- Backbone receptor: https://huggingface.co/Qwen/Qwen3-1.7B
