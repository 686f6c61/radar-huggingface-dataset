# zen-E/PLatour-SFT-Qwen3-8B-to-1.7B-Chemistry-CoT

## Resumen

PLatour-SFT-Qwen3-8B-to-1.7B-Chemistry-CoT es un checkpoint de puentes de proyección (bridge projections) publicado por zen-E dentro del proyecto PLatour, que investiga la transferencia entre modelos de la fase de prefill y la fase autorregresiva (PACT, Prefill-to-Autoregressive Cross-model Transfer). En este esquema, un modelo emisor grande (Qwen3-8B) codifica el prompt y proporciona representaciones ocultas, mientras que un receptor más pequeño (Qwen3-1.7B) genera la respuesta de forma independiente. El checkpoint corresponde al experimento 10 del proyecto, centrado en la tarea `chemistry_cot` (razonamiento químico con cadena de pensamiento).

Es importante subrayar que este repositorio no contiene pesos completos de un modelo: aloja únicamente las proyecciones lineales del puente (0,9 GB). Para utilizarlo es necesario descargar por separado los backbones congelados Qwen3-8B (emisor) y Qwen3-1.7B (receptor) y cargarlos mediante la API del proyecto PLatour; `AutoModel.from_pretrained` no puede cargar el puente como modelo autónomo. La relevancia actual reside en que explora si un modelo pequeño puede beneficiarse de las representaciones internas de uno grande sin ejecutar el grande en cada token generado, un área activa de investigación en eficiencia de inferencia.

La licencia es Apache 2.0 y el autor declara explícitamente que el repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark ni garantías sobre el protocolo de selección del checkpoint, por lo que se requiere evaluación independiente antes de usar estos artefactos para respaldar afirmaciones comparativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes de proyección lineal entre backbones transformer congelados (Qwen3-8B emisor y Qwen3-1.7B receptor); soporta modelos de atención híbrida |
| Parametros totales | No disponible (el checkpoint son proyecciones de puente, no un modelo completo; tamaño del repo: 0,9 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de los backbones Qwen3, no especificada en la información) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con cargador personalizado, `custom-loader`) |

## Arquitectura y entrenamiento

El método PLatour entrena puentes lineales ligeros entre backbones congelados, partiendo de proyecciones inicializadas a cero y optimizando mediante recompensas de tarea (task rewards). El emisor grande procesa el prompt y suministra representaciones ocultas; el receptor pequeño genera la respuesta de forma independiente. El mapeo utilizado en este checkpoint concreto es `last_aligned` (el PLatour basado en GRPO usa `uniform_endpoints`). El método contempla modelos con atención híbrida.

El entrenamiento se realizó sobre el dataset `zen-E/PLatour-Qwen3-Data`, con el método SFT (supervised fine-tuning) en la tarea `chemistry_cot`. El paper asociado (arXiv 2611.06976) introduce además PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) diseñado para verificar si las mejoras dependen realmente de información útil del emisor o si pueden surgir simplemente por adaptación del receptor. El autor advierte que un mejor rendimiento en la tarea no demuestra por sí solo una comunicación eficaz entre modelos. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de texto condicionada por las representaciones internas de un emisor de mayor tamaño, en el marco del esquema PACT.
- Razonamiento químico con cadena de pensamiento (chemistry CoT), tarea para la que fue entrenado el checkpoint.
- Soporte de conversaciones multi-turno mediante el formato de mensajes de la API (`messages` con roles).
- Integración con backend vLLM para la generación.
- Carga mediante API de proyecto con backbones separados; no es un modelo autónomo.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking explícito.

## Casos de uso

- Investigación en transferencia entre modelos: el checkpoint sirve para reproducir el experimento 10 del proyecto PLatour y estudiar si un receptor de 1.7B se beneficia de las representaciones de un emisor de 8B en tareas de química.
- Evaluación de protocolos PACT: uso de los controles PACT-Check (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para determinar si las mejoras observadas provienen de información útil del emisor o de la adaptación del receptor.
- Razonamiento químico asistido: generación de cadenas de pensamiento sobre problemas de química, con el receptor pequeño generando la respuesta a partir del contexto codificado por el emisor.
- Reproducción de experimentos académicos: ejecución del evaluador del proyecto (`platour-exps evaluate --experiment 10`) con los conjuntos de test publicados y los ajustes de muestreo y puntuación del experimento.
- Estudio de eficiencia de inferencia: análisis del coste de ejecutar un emisor grande solo en prefill frente a la generación completa con el modelo grande, midiendo el ahorro en el receptor de 1.7B.
- Desarrollo de pipelines de investigación con despliegue multi-GPU: uso de las opciones `--n-gpu` y `--gpus-per-replica` del evaluador para repartir réplicas independientes con shards disjuntos de preguntas.
- Base para experimentos de destilación de representaciones: punto de partida para entrenar nuevos puentes sobre otras tareas del dataset `zen-E/PLatour-Qwen3-Data`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark y que no se formula ninguna afirmación sobre el protocolo de selección del checkpoint ni sobre rendimiento no sesgado en datos retenidos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint de puente ocupa 0,9 GB, pero la inferencia requiere cargar simultáneamente el emisor Qwen3-8B y el receptor Qwen3-1.7B, por lo que la memoria necesaria depende de la precisión y del backend.
- GPU recomendadas: no especificadas en la información; el proyecto requiere Linux con CUDA y memoria GPU suficiente para los modelos seleccionados.
- GPU de consumo: no confirmado; la viabilidad depende de que la suma de emisor y receptor quepa en la VRAM disponible.
- Despliegue: backend vLLM en los ejemplos del proyecto; el cargador es personalizado (`custom-loader`) y no compatible con `AutoModel.from_pretrained`.
- Reparto multi-GPU: por defecto, 1 GPU por réplica; `--n-gpu 8` crea 8 réplicas independientes con shards disjuntos; `--n-gpu N --gpus-per-replica G` divide N GPUs en N/G réplicas (N debe ser divisible por G). No se debe combinar `--n-gpu` con `torchrun`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-SFT-Qwen3-8B-to-1.7B-Chemistry-CoT | Puente sobre Qwen3-8B + Qwen3-1.7B | No disponible | Transferencia prefill-a-autorregresivo (PACT) con puentes lineales | Apache 2.0 | Hugging Face (checkpoint de puente) |
| Qwen3-1.7B | 1.7B | No disponible en esta ficha | Transformer denso | Apache 2.0 | Hugging Face |
| Qwen3-8B | 8B | No disponible en esta ficha | Transformer denso | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint no es un modelo autónomo: contiene solo proyecciones de puente y requiere los backbones Qwen3-8B y Qwen3-1.7B descargados por separado.
- No es cargable con `AutoModel.from_pretrained`; exige la API del proyecto PLatour y un cargador personalizado.
- El autor declara que no se publican puntuaciones de benchmark y que se requiere evaluación independiente y revisión de procedencia antes de usar los artefactos para nuevas afirmaciones comparativas.
- El ejemplo de generación con 256 tokens es solo una demostración de prompt personalizado, no el protocolo de benchmark publicado.
- La generación devuelve texto y no ejecuta código generado.
- El mapeo debe fijarse explícitamente (`last_aligned` para este checkpoint SFT), ya que difiere del usado por la variante GRPO.
- No se documentan sesgos conocidos, riesgo de alucinación específico ni limitaciones de idioma en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de rendimiento hace desaconsejable su uso en producción sin validación previa.
- Cada ejecución debe usar un directorio de salida nuevo.

## Enlaces

- Hugging Face: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-8B-to-1.7B-Chemistry-CoT
- Paper: https://arxiv.org/html/2611.06976
- Código: https://github.com/zhenyi4/platour
- Colección de modelos: https://huggingface.co/collections/zen-E/platour
- Guía de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guía de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen3/README.md
- Índice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Valores por defecto de GPU en evaluación: https://github.com/zhenyi4/platour#gpu-defaults-for-standalone-evaluation
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Modelo emisor: https://huggingface.co/Qwen/Qwen3-8B
- Modelo receptor: https://huggingface.co/Qwen/Qwen3-1.7B
