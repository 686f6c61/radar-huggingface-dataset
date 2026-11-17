# zen-E/PLatour-Qwen3-235B-to-1.7B-GSM8K

## Resumen

PLatour-Qwen3-235B-to-1.7B-GSM8K es un checkpoint de puentes de proyección (bridge projections) publicado por el autor zen-E dentro del proyecto PLatour, que investiga la transferencia entre modelos de la fase de prefill y la fase autorregresiva (PACT, Prefill-to-Autoregressive Cross-model Transfer). En lugar de ser un modelo completo, este repositorio contiene únicamente los pesos de unas proyecciones lineales ligeras que conectan un modelo emisor grande congelado (Qwen/Qwen3-235B-A22B-FP8) con un modelo receptor pequeño también congelado (Qwen/Qwen3-1.7B). El emisor codifica el prompt y suministra representaciones ocultas; el receptor genera la respuesta de forma independiente.

El checkpoint corresponde al experimento 14 del paper asociado (arXiv:2611.06976) sobre la tarea GSM8K, y se entrenó con GRPO (optimización por recompensas de tarea) partiendo de proyecciones inicializadas a cero. Su relevancia radica en que explora si un modelo pequeño puede beneficiarse de la información latente de un modelo mucho mayor sin necesidad de ejecutar el grande en cada paso de decodificación, un planteamiento con implicaciones directas en coste de inferencia y eficiencia de despliegue.

Es importante subrayar que el repositorio (0,9 GB) no contiene pesos completos de un modelo: no puede cargarse con `AutoModel.from_pretrained` ni usarse de forma autónoma. Requiere el código del proyecto PLatour (`platour_api`, `platour_exps`), los dos backbones descargados por separado y un entorno Linux con CUDA y Python 3.11.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes de proyección lineal (bridge projections) entre dos transformers congelados; soporta modelos de atención híbrida |
| Parametros totales | No disponible (el repo contiene solo las proyecciones puente, 0,9 GB; el receptor es Qwen3-1.7B y el emisor Qwen3-235B-A22B) |
| Parametros activos | No disponible para el checkpoint; el emisor Qwen3-235B-A22B es MoE con 235B totales y 22B activos (según su nombre) |
| Longitud de contexto | No disponible para el checkpoint; depende de los backbones Qwen3 subyacentes |
| Tipos de cuantizacion | No disponible (el emisor de referencia se distribuye en FP8) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con cargador personalizado (`custom-loader`) y verificación de hashes contra un manifiesto |

## Arquitectura y entrenamiento

El método PACT entrena puentes lineales ligeros entre dos backbones congelados: un emisor grande (Qwen3-235B-A22B-FP8) que procesa el prompt y produce representaciones ocultas, y un receptor pequeño (Qwen3-1.7B) que genera la respuesta. Las proyecciones se inicializan a cero y se optimizan con recompensas de tarea mediante GRPO, sin modificar los pesos de ninguno de los dos modelos. El mapeo entre capas del emisor y del receptor es `uniform_endpoints` para este checkpoint (frente a `last_aligned` usado en la variante PLatour-SFT), y el sistema admite modelos con atención híbrida.

El paper introduce además PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para determinar si las mejoras provienen realmente de la información útil del emisor o de la mera adaptación del receptor. No se dispone de datos sobre el volumen de tokens de entrenamiento ni sobre la composición exacta del dataset más allá de la referencia a `zen-E/PLatour-Qwen3-Data`.

## Capacidades

- Generación de texto y razonamiento aritmético orientado a problemas tipo GSM8K, mediante la combinación emisor-receptor con puentes entrenados.
- Transferencia de representaciones latentes desde un modelo de 235B a uno de 1.7B sin ejecutar el grande en cada token generado.
- Soporte de modelos con atención híbrida en el pipeline de transferencia.
- Generación por lotes mediante backend vLLM en el ejemplo de la model card.
- Evaluación reproducible con el comando `platour-exps evaluate`, que descarga y verifica pesos y entradas de test publicadas.
- No soporta tool calling, function calling, visión, audio ni agentes multi-paso de forma nativa según la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en transferencia entre modelos: reproducir el experimento 14 del paper sobre GSM8K para estudiar si la información del emisor mejora al receptor, usando los controles PACT-Check para descartar artefactos de adaptación.
- Evaluación de eficiencia de inferencia: medir el coste de ejecutar un emisor de 235B solo en prefill frente a ejecutarlo en cada paso autorregresivo, con el receptor de 1.7B generando la respuesta.
- Estudio de mapeos entre capas: comparar `uniform_endpoints` frente a `last_aligned` y otras estrategias de alineación entre backbones de distinto tamaño.
- Reproducibilidad de resultados académicos: el cargador verifica configuración y hashes de pesos, lo que permite replicar exactamente el checkpoint publicado en un entorno controlado.
- Prototipado de destilación implícita: explorar si recompensas de tarea (GRPO) bastan para que un modelo pequeño aproveche representaciones de uno grande sin fine-tuning supervisado del receptor.
- Docencia y experimentación con modelos híbridos de atención: el pipeline admite backbones con atención híbrida, útil para estudiar cómo afecta la arquitectura del receptor a la transferencia.
- Auditoría de metodología: usar los controles Dummy/Irrelevant Transfer para validar afirmaciones de mejora en sistemas de comunicación entre modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark y que no se emite ninguna afirmación sobre el protocolo de selección de checkpoint ni sobre rendimiento no sesgado en held-out; se requiere evaluación independiente y revisión de procedencia antes de usar estos artefactos como evidencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El emisor Qwen3-235B-A22B-FP8 requiere memoria muy elevada (el sufijo FP8 indica pesos en 8 bits, pero el tamaño total de 235B implica del orden de cientos de GB en pesos, además de caché KV); el receptor Qwen3-1.7B es ligero. El propio repo del checkpoint ocupa 0,9 GB.
- GPU recomendadas: no disponibles en la información proporcionada. El despliegue del emisor de 235B exige GPUs de centro de datos (A100/H100 o equivalentes); el receptor de 1.7B cabe en GPUs de consumo.
- Configuración de evaluación: el grupo por defecto de este checkpoint es de 2 GPUs por réplica; `--n-gpu 1` es incompatible con ese tamaño de grupo. Con `--n-gpu 8` se crean 4 réplicas independientes de 2 GPUs cada una con shards disjuntos de preguntas. Los tamaños de grupo son ajustes de colocación, no garantía de que el modelo quepa en memoria.
- Opciones de despliegue: el ejemplo de generación usa backend `vllm`; la evaluación se ejecuta con `platour-exps`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-Qwen3-235B-to-1.7B-GSM8K | Solo puentes (0,9 GB); emisor 235B + receptor 1.7B | No disponible | Transferencia PACT emisor-receptor con GRPO | Apache 2.0 | HF (zen-E/PLatour-Qwen3-235B-to-1.7B-GSM8K) |
| Qwen3-1.7B (receptor base) | 1,7B | No disponible en esta ficha | Transformer denso | Apache 2.0 | HF (Qwen/Qwen3-1.7B) |
| Qwen3-235B-A22B (emisor base) | 235B totales, 22B activos | No disponible en esta ficha | MoE | Apache 2.0 | HF (Qwen/Qwen3-235B-A22B-FP8) |

No se dispone de datos de rendimiento comparado ni de otras alternativas de transferencia entre modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: contiene solo proyecciones puente y no puede cargarse con `AutoModel.from_pretrained`; requiere el código PLatour y los dos backbones.
- Sin benchmarks publicados: la model card declara explícitamente que no se emiten afirmaciones de rendimiento ni de selección de checkpoint; cualquier uso como evidencia requiere evaluación independiente.
- El ejemplo de la model card es una demo de prompt personalizado, no el protocolo de benchmark publicado; el límite de 256 tokens es solo ilustrativo.
- La generación devuelve texto y no ejecuta código generado.
- Sesgos: no disponibles en la información proporcionada; al depender de Qwen3, hereda los sesgos de los backbones.
- Riesgo de alucinación: no cuantificado; al tratarse de una transferencia parcial de representaciones, el receptor puede generar respuestas plausibles sin fundamento verificable.
- Idiomas soportados: no disponibles.
- Licencia Apache 2.0 permite uso comercial del checkpoint, pero los backbones Qwen3 tienen sus propias condiciones que deben respetarse.
- El despliegue del emisor de 235B implica un coste de memoria y cómputo elevado, lo que limita su viabilidad fuera de entornos con GPUs de centro de datos.
- No combinar `--n-gpu` con `torchrun`; usar `CUDA_VISIBLE_DEVICES` para seleccionar GPUs y un directorio de salida nuevo en cada ejecución.

## Enlaces

- Hugging Face: https://huggingface.co/zen-E/PLatour-Qwen3-235B-to-1.7B-GSM8K
- Paper: https://arxiv.org/html/2611.06976
- Código: https://github.com/zhenyi4/platour
- Colección de modelos: https://huggingface.co/collections/zen-E/platour
- Guía de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guía de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen3/README.md
- Índice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Valores por defecto de GPU en evaluación: https://github.com/zhenyi4/platour#gpu-defaults-for-standalone-evaluation
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Modelo base receptor: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo base emisor: https://huggingface.co/Qwen/Qwen3-235B-A22B-FP8
