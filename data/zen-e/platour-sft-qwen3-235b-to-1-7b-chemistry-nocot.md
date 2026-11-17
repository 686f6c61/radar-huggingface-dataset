# zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-Chemistry-NoCoT

## Resumen

PLatour-SFT-Qwen3-235B-to-1.7B-Chemistry-NoCoT es un checkpoint de puentes lineales (bridge projections) desarrollado por zen-E dentro del proyecto PLatour, que investiga la transferencia entre modelos (PACT, Prefill-to-Autoregressive Cross-model Transfer). La idea central es que un modelo emisor grande (Qwen3-235B-A22B-FP8) codifica el prompt y entrega representaciones ocultas, mientras que un receptor pequeno (Qwen3-1.7B) genera la respuesta de forma independiente. Este checkpoint concreto corresponde al experimento 03 (SFT sobre el dominio chemistry_no_cot).

Es importante subrayar que este repositorio no contiene pesos completos de un modelo, sino unicamente las proyecciones de los puentes (aproximadamente 0,9 GB). Para utilizarlo hay que descargar por separado el emisor y el receptor congelados y cargarlos mediante la API del proyecto; `AutoModel.from_pretrained` no puede cargar el bridge como modelo autonomo. La licencia es Apache 2.0.

El modelo es relevante porque explora si la informacion de un emisor de 235B puede transferirse de forma util a un receptor de 1.7B sin entrenar los backbones, y porque el paper introduce PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para verificar si las mejoras provienen realmente de la comunicacion entre modelos o solo de la adaptacion del receptor. El repositorio distribuye pesos de inferencia historicos sin puntuaciones de benchmark publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con puentes lineales entre backbones congelados (Qwen3 emisor + Qwen3 receptor); soporta modelos de atencion hibrida |
| Parametros totales | No disponible (el checkpoint contiene solo proyecciones de puente, ~0,9 GB; los backbones se descargan aparte: emisor Qwen3-235B-A22B-FP8 y receptor Qwen3-1.7B) |
| Parametros activos | No disponible (el emisor Qwen3-235B-A22B es MoE, pero el dato no se detalla en la informacion proporcionada) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el emisor de referencia se distribuye en FP8) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con cargador personalizado, tag `custom-loader`) |

## Arquitectura y entrenamiento

PLatour implementa PACT: un emisor grande codifica el prompt y suministra representaciones ocultas, y un receptor pequeno genera la respuesta de forma independiente. El metodo principal entrena puentes lineales ligeros entre backbones congelados usando recompensas de tarea, partiendo de proyecciones inicializadas a cero y dando soporte a modelos con atencion hibrida. En este checkpoint concreto el entrenamiento es SFT (supervised fine-tuning) sobre el dominio chemistry_no_cot, con el mapeo `last_aligned` (frente al `uniform_endpoints` que usa la variante PLatour con GRPO).

El paper asociado (arXiv 2611.06976) introduce ademas PACT-Check, con controles de Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver, para determinar si las mejoras dependen de informacion util del emisor o pueden surgir simplemente por la adaptacion del receptor. El repositorio no proporciona detalles sobre numero de tokens de entrenamiento, composicion exacta del dataset (mas alla de `zen-E/PLatour-Qwen3-Data`) ni si hubo etapas adicionales de RLHF o DPO.

## Capacidades

- Generacion de texto condicionada por las representaciones ocultas del emisor Qwen3-235B-A22B-FP8 y ejecutada por el receptor Qwen3-1.7B.
- Razonamiento y respuesta en el dominio de quimica sin cadena de pensamiento (chemistry_no_cot), que es el objetivo del experimento 03.
- Soporte de conversaciones multi-turno mediante el formato de mensajes de la API del proyecto (`system.generate(messages=[...])`).
- Integracion con backend vLLM para la generacion.
- Evaluacion reproducible mediante el comando `platour-exps evaluate`, que usa las entradas TEST publicadas y los ajustes de muestreo y puntuacion del experimento.
- Verificacion de hashes de configuracion y pesos en el cargador de release.
- No se documentan capacidades de tool calling, uso de agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Investigacion en transferencia entre modelos: permite reproducir el experimento 03 del paper y analizar si las representaciones de un emisor de 235B mejoran a un receptor de 1.7B en tareas de quimica.
- Validacion con PACT-Check: util para ejecutar los controles (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) y descartar que las mejoras provengan solo de la adaptacion del receptor.
- Evaluacion de dominio cientifico: el checkpoint esta especializado en chemistry_no_cot, por lo que sirve para medir calidad de respuestas de quimica sin razonamiento explicito.
- Reproducibilidad de resultados: el comando `platour-exps evaluate --experiment 3` descarga backbones, pesos y entradas de tarea, y verifica hashes, lo que facilita replicar el protocolo publicado.
- Experimentacion con atencion hibrida: el metodo soporta modelos de atencion hibrida, lo que permite estudiar puentes entre arquitecturas heterogeneas.
- Despliegue distribuido en laboratorio: el evaluador admite reparto en varias GPU (por defecto 2 GPU por replica; con `--n-gpu 8` se crean 4 replicas independientes con shards disjuntos), adecuado para barridos de evaluacion.
- Estudio de eficiencia: comparar coste de inferencia de un receptor de 1.7B asistido por un emisor de 235B frente a ejecutar directamente el modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio indica explicitamente que distribuye pesos de inferencia historicos sin puntuaciones de benchmark y que no se hace ninguna afirmacion sobre el protocolo de seleccion del checkpoint ni sobre rendimiento no sesgado en held-out; se requiere evaluacion independiente y revision de procedencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint de puentes ocupa ~0,9 GB, pero hay que sumar la memoria del emisor Qwen3-235B-A22B-FP8 y del receptor Qwen3-1.7B.
- El emisor de 235B en FP8 requiere una cantidad de VRAM muy elevada; el receptor de 1.7B es ligero en comparacion.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el tamano del emisor se necesitarian aceleradores de clase A100/H100 o superiores, aunque el dato no se confirma.
- El evaluador del proyecto usa por defecto 2 GPU por replica; `--n-gpu 1` es incompatible con ese tamano de grupo. Los tamanos de grupo son ajustes de colocacion y no garantizan que el modelo quepa en memoria.
- Opciones de despliegue: backend vLLM en la API del proyecto; el cargador es personalizado (`custom-loader`) y no es compatible con `AutoModel.from_pretrained`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-SFT-Qwen3-235B-to-1.7B-Chemistry-NoCoT | Puentes + backbones Qwen3-235B-A22B-FP8 y Qwen3-1.7B | No disponible | Transferencia emisor-receptor (PACT) con SFT | Apache 2.0 | Hugging Face (checkpoint de puentes) |
| Qwen3-235B-A22B-FP8 | 235B (MoE) | No disponible | LLM denso/MoE de gran escala | No disponible en la informacion | Hugging Face |
| Qwen3-1.7B | 1.7B | No disponible | LLM pequeno | No disponible en la informacion | Hugging Face |
| Variante PLatour (GRPO) | Puentes + mismos backbones | No disponible | PACT con GRPO y mapeo `uniform_endpoints` | Apache 2.0 | Coleccion `zen-E/platour` |

## Limitaciones y advertencias

- El repositorio no contiene pesos completos: solo proyecciones de puente; requiere descargar emisor y receptor por separado y usar la API del proyecto.
- No es cargable con `AutoModel.from_pretrained`; necesita el cargador personalizado del proyecto.
- No se publican puntuaciones de benchmark ni garantias de rendimiento en held-out; se requiere evaluacion independiente.
- El ejemplo de generacion con `max_new_tokens=256` es solo una demo de prompt personalizado, no el protocolo de benchmark publicado.
- La generacion devuelve texto y no ejecuta codigo generado.
- Especifico del dominio chemistry_no_cot; su comportamiento fuera de ese dominio no esta documentado.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinacion en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia y validez de los pesos deben revisarse antes de produccion.
- El uso de `--n-gpu` no debe combinarse con `torchrun`; los flags aplican solo al evaluador del proyecto.
- Requiere Linux con CUDA y Python 3.11, y memoria GPU suficiente para ambos backbones.

## Enlaces

- Hugging Face: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-Chemistry-NoCoT
- Paper: https://arxiv.org/html/2611.06976
- Codigo: https://github.com/zhenyi4/platour
- Coleccion de modelos: https://huggingface.co/collections/zen-E/platour
- Guia de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guia de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen3/README.md
- Indice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Defaults de GPU para evaluacion: https://github.com/zhenyi4/platour#gpu-defaults-for-standalone-evaluation
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Modelo base emisor: https://huggingface.co/Qwen/Qwen3-235B-A22B-FP8
- Modelo base receptor: https://huggingface.co/Qwen/Qwen3-1.7B
