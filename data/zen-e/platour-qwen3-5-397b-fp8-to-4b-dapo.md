# zen-E/PLatour-Qwen3.5-397B-FP8-to-4B-DAPO

## Resumen

PLatour-Qwen3.5-397B-FP8-to-4B-DAPO es un checkpoint de puentes de proyección (bridge projections) publicado por el autor zen-E dentro del proyecto PLatour, que implementa la técnica PACT (Prefill-to-Autoregressive Cross-model Transfer). En este esquema, un modelo emisor grande (Qwen3.5-397B-A17B-FP8) codifica el prompt y proporciona representaciones ocultas, mientras que un modelo receptor pequeño (Qwen3.5-4B) genera la respuesta de forma independiente. El checkpoint no contiene pesos completos de un modelo, sino únicamente las proyecciones lineales ligeras que conectan ambos backbones congelados.

El interés técnico del modelo reside en que demuestra un mecanismo de transferencia entre modelos de escalas muy distintas (397B de parámetros totales con 17B activos en el emisor frente a 4B en el receptor) sin necesidad de reentrenar los backbones. Las proyecciones se entrenan con recompensas de tarea partiendo de proyecciones inicializadas a cero, y el método soporta modelos con atención híbrida. El paper asociado (arXiv:2611.06976) introduce además PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para verificar que las mejoras provienen de información útil del emisor y no de la mera adaptación del receptor.

Este checkpoint concreto corresponde al "Experiment 20" del proyecto, entrenado sobre la tarea dapo con el dataset zen-E/PLatour-DAPO-Data. Es relevante como artefacto de investigación reproducible: el repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark asociadas, y requiere el código del proyecto para cargarse, ya que `AutoModel.from_pretrained` no puede interpretarlo como un modelo autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes de proyección lineal sobre backbones transformer congelados (emisor Qwen3.5-397B-A17B-FP8, receptor Qwen3.5-4B); soporta atención híbrida |
| Parametros totales | No disponible (el checkpoint de 1,3 GB contiene solo las proyecciones del puente, no los backbones) |
| Parametros activos | No disponible para el puente; el emisor Qwen3.5-397B-A17B-FP8 es MoE con 17B activos según su denominación |
| Longitud de contexto | No disponible (el protocolo de evaluación publica usa un límite de respuesta de 32K tokens, no de contexto de entrada) |
| Tipos de cuantizacion | No disponible (el emisor referenciado está en FP8; el receptor Qwen3.5-4B en su formato original) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con cargador personalizado (`custom-loader`) |

## Arquitectura y entrenamiento

El método PACT separa el cómputo en dos fases: el emisor grande procesa el prompt y produce representaciones ocultas, y el receptor pequeño genera la respuesta de forma autorregresiva a partir de esas representaciones, conectadas mediante puentes de proyección lineal. Los backbones permanecen congelados durante todo el proceso; solo se entrenan las proyecciones, que se inicializan a cero y se optimizan con recompensas de tarea (un esquema de optimización tipo RL/DPO, dado el sufijo DAPO del nombre y el dataset asociado). El diseño admite modelos con atención híbrida, lo que permite combinar emisores y receptores con esquemas de atención distintos.

El entrenamiento se realizó sobre el dataset zen-E/PLatour-DAPO-Data y corresponde al Experimento 20 del proyecto. El paper introduce PACT-Check con cuatro controles experimentales: Dummy Transfer (transferencia ficticia), Irrelevant Transfer (información irrelevante), Self-Communication (el modelo se comunica consigo mismo) y Trained Receiver (receptor entrenado). Estos controles permiten distinguir si la mejora en la tarea se debe a la información útil transmitida por el emisor o a la adaptación del receptor. El checkpoint publicado no incluye puntuaciones de benchmark; el repositorio indica explícitamente que distribuye pesos de inferencia históricos sin resultados asociados.

## Capacidades

- Generación de texto condicionada por las representaciones ocultas del emisor grande, con el receptor de 4B como decodificador autorregresivo.
- Razonamiento matemático: la evaluación publicada del proyecto cubre AIME, HMMT e IMO con un límite de respuesta de 32K tokens.
- Transferencia entre modelos de distinta escala y familia de atención (soporte de atención híbrida en el puente).
- Ejecución mediante backend vLLM para la generación, con API de proyecto (`load_session`, `generate`).
- Evaluación reproducible mediante la CLI `platour-exps evaluate`, con verificación de hashes de configuración y pesos.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en transferencia entre modelos: reproducción del Experimento 20 con la CLI del proyecto para validar los controles PACT-Check y comparar la contribución del emisor frente a la adaptación del receptor.
- Evaluación de razonamiento matemático con modelos pequeños asistidos: uso del receptor de 4B potenciado por representaciones de un emisor de 397B para tareas de AIME, HMMT e IMO con respuestas de hasta 32K tokens.
- Estudio de eficiencia computacional: análisis de si un receptor de 4B con puente puede aproximarse al rendimiento de un emisor mucho mayor en tareas específicas, reduciendo el coste de decodificación.
- Docencia e investigación académica sobre comunicación entre modelos: uso de los controles Dummy Transfer e Irrelevant Transfer para enseñar metodología de ablación en sistemas multi-modelo.
- Desarrollo de métodos de adaptación ligera: base para extender PACT a otras tareas o pares de backbones partiendo de las proyecciones publicadas.
- Reproducibilidad de papers: verificación de los resultados del artículo arXiv:2611.06976 mediante el manifiesto y los hashes de pesos incluidos en el release.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio indica explícitamente que distribuye pesos de inferencia históricos sin puntuaciones de benchmark asociadas ("This repository distributes historical inference weights without benchmark scores"). El protocolo de evaluación del proyecto cubre AIME, HMMT e IMO con un límite de respuesta de 32K tokens, pero los resultados numéricos no se proporcionan en la información disponible.

## Requisitos de hardware

- El checkpoint del puente ocupa 1,3 GB, pero la inferencia requiere cargar simultáneamente el emisor Qwen3.5-397B-A17B-FP8 y el receptor Qwen3.5-4B, por lo que la VRAM necesaria la determina el emisor.
- El evaluador del proyecto usa por defecto 4 GPUs por réplica; `--n-gpu 1` es incompatible con ese tamaño de grupo por defecto.
- Con `--n-gpu 8` se ejecutan 2 réplicas independientes de 4 GPUs cada una con particiones disjuntas de preguntas.
- El tamaño de grupo es una configuración de colocación, no una garantía de que el modelo quepa en memoria; cada réplica necesita memoria suficiente para sus modelos y la carga de decodificación.
- Entorno requerido: Linux con CUDA, Python 3.11 y memoria GPU suficiente para los modelos seleccionados.
- Opciones de despliegue: backend vLLM para generación mediante la API del proyecto; no se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-Qwen3.5-397B-FP8-to-4B-DAPO | Puente de 1,3 GB sobre emisor 397B-A17B y receptor 4B | No disponible | Transferencia prefill-a-autorregresiva con puentes lineales | Apache 2.0 | Hugging Face (zen-E) |
| Qwen3.5-397B-A17B-FP8 (emisor) | 397B totales, 17B activos (MoE) | No disponible | Modelo base completo en FP8 | No disponible en la información | Hugging Face (Qwen) |
| Qwen3.5-4B (receptor) | 4B | No disponible | Modelo base pequeño | No disponible en la información | Hugging Face (Qwen) |

No se dispone de información sobre otros métodos comparables de transferencia entre modelos (por ejemplo, destilación clásica o decodificación especulativa) con datos numéricos en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint no es un modelo autónomo: contiene solo proyecciones de puente y no puede cargarse con `AutoModel.from_pretrained`; requiere el código del proyecto PLatour y los backbones descargados por separado.
- El repositorio no publica puntuaciones de benchmark; el README indica que no se emite ninguna afirmación sobre el rendimiento ("No claim about check...").
- El ejemplo de generación con 256 tokens es una demo de prompt personalizado y no el protocolo de benchmark publicado; los resultados no son comparables con la evaluación oficial.
- La generación devuelve texto y no ejecuta código generado.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones de idioma en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero al depender de los backbones Qwen, las condiciones de estos deben verificarse por separado.
- El proyecto requiere Linux con CUDA y Python 3.11; no se documenta soporte para otros entornos.
- Los pesos son históricos y el release loader verifica configuración y hashes; modificar el protocolo (por ejemplo, `--response-cap 16384`) se registra como un cambio respecto al protocolo de test publicado.
- `--n-gpu 1` no es compatible con el tamaño de grupo por defecto de 4 GPUs por réplica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-Qwen3.5-397B-FP8-to-4B-DAPO
- Paper: https://arxiv.org/html/2611.06976
- Código del proyecto: https://github.com/zhenyi4/platour
- Colección de modelos PLatour: https://huggingface.co/collections/zen-E/platour
- Guía de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guía de instalación: https://github.com/zhenyi4/platour#getting-started
- Guía de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen35/README.md
- Índice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Valores por defecto de GPU para evaluación: https://github.com/zhenyi4/platour#gpu-defaults-for-standalone-evaluation
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-DAPO-Data
- Modelo emisor: https://huggingface.co/Qwen/Qwen3.5-397B-A17B-FP8
- Modelo receptor: https://huggingface.co/Qwen/Qwen3.5-4B
