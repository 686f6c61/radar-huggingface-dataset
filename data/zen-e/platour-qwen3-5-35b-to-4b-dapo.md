# zen-E/PLatour-Qwen3.5-35B-to-4B-DAPO

## Resumen

PLatour-Qwen3.5-35B-to-4B-DAPO es un checkpoint de puentes de proyección (bridge projections) desarrollado por zen-E dentro del proyecto PLatour, que implementa el paradigma denominado Prefill-to-Autoregressive Cross-model Transfer (PACT). En este esquema, un modelo emisor grande (Qwen/Qwen3.5-35B-A3B) procesa el prompt y genera representaciones ocultas, mientras que un modelo receptor más pequeño (Qwen/Qwen3.5-4B) produce la respuesta de forma independiente. El puente entrenado conecta ambos backbones congelados mediante proyecciones lineales ligeras.

El checkpoint corresponde al Experimento 19 del proyecto, entrenado sobre la tarea DAPO con el dataset zen-E/PLatour-DAPO-Data. Es relevante porque aborda un problema abierto en eficiencia de inferencia: aprovechar la capacidad de codificación de un modelo grande sin pagar su coste de decodificación autoregresiva. El paper asociado (arXiv:2611.06976) introduce además PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para verificar que las mejoras provienen de información útil del emisor y no de la mera adaptación del receptor.

Es importante subrayar que este repositorio no contiene pesos completos de un modelo: distribuye únicamente las proyecciones del puente (0,7 GB) y requiere descargar por separado el emisor y el receptor. No se puede cargar con `AutoModel.from_pretrained`; necesita la API del proyecto PLatour y un loader personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puente de proyecciones lineales entre dos backbones transformer congelados (emisor MoE + receptor denso); soporta modelos de atención híbrida |
| Parametros totales | No disponible para el puente; emisor Qwen3.5-35B-A3B (35B totales, según nomenclatura) y receptor Qwen3.5-4B (4B) |
| Parametros activos | Emisor MoE con parámetros activos no especificados en la información disponible |
| Longitud de contexto | No disponible (depende de los backbones emisor y receptor) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con custom-loader (checkpoint de puente, no pesos completos) |

## Arquitectura y entrenamiento

El método entrena puentes lineales ligeros entre backbones congelados, partiendo de proyecciones inicializadas a cero y optimizando con recompensas de tarea. El emisor (Qwen3.5-35B-A3B, arquitectura MoE) codifica el prompt y suministra representaciones ocultas; el receptor (Qwen3.5-4B) genera la respuesta de forma independiente. El diseño soporta modelos con atención híbrida. El entrenamiento se realizó sobre el dataset zen-E/PLatour-DAPO-Data en el marco del Experimento 19 (tarea DAPO).

El paper introduce PACT-Check con cuatro controles experimentales: Dummy Transfer (transferencia nula), Irrelevant Transfer (información no pertinente), Self-Communication (el receptor se comunica consigo mismo) y Trained Receiver (receptor adaptado sin emisor). Estos controles permiten distinguir si la mejora en la tarea se debe a comunicación cross-model efectiva o simplemente a la adaptación del receptor, un punto metodológico crítico que el paper señala explícitamente: un mejor rendimiento en la tarea por sí solo no demuestra comunicación efectiva entre modelos.

## Capacidades

- Generación de texto autoregresiva mediante el receptor Qwen3.5-4B, condicionada por representaciones del emisor.
- Razonamiento y resolución de problemas matemáticos: el protocolo de evaluación por defecto cubre AIME, HMMT e IMO con un límite de respuesta de 32K tokens.
- Transferencia cross-model de representaciones ocultas vía puentes lineales entrenados con recompensas de tarea.
- Soporte de modelos de atención híbrida en el diseño del puente.
- Evaluación con backend vLLM para generación.
- No se especifican en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Investigación en eficiencia de inferencia: usar el emisor grande solo en la fase de prefill y delegar la decodificación al receptor pequeño, reduciendo el coste computacional de generación en comparación con ejecutar el modelo de 35B de extremo a extremo.
- Reproducción de experimentos académicos: el comando `platour-exps evaluate --experiment 19` permite replicar la evaluación publicada sobre AIME, HMMT e IMO con las mismas entradas TEST y ajustes de muestreo.
- Estudio de comunicación entre modelos: los controles PACT-Check (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) permiten diseñar experimentos que aíslen el efecto real de la transferencia de representaciones.
- Evaluación distribuida en clústeres: el soporte de `--n-gpu` con réplicas independientes y shards disjuntos de preguntas facilita ejecutar evaluaciones a escala en 8 GPUs o configuraciones N/G.
- Benchmarking de razonamiento matemático: el protocolo por defecto con límite de 32K tokens y la opción `--eval-suites aime` (AIME-135 y subconjunto Clean80) sirven para medir rendimiento en competiciones matemáticas.
- Base para investigación en destilación implícita: el puente entrenado con recompensas de tarea sobre backbones congelados es un punto de partida para explorar variantes de PACT con otros pares emisor-receptor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark, y el autor declara explícitamente que no se emite ninguna afirmación sobre el protocolo de selección del checkpoint ni sobre rendimiento imparcial en datos retenidos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El checkpoint del puente ocupa 0,7 GB, pero la inferencia requiere cargar simultáneamente el emisor Qwen3.5-35B-A3B y el receptor Qwen3.5-4B, por lo que la memoria dominante la determinan los backbones, no el puente.
- GPU recomendadas: no especificadas en la información disponible. El proyecto asume Linux con CUDA y memoria GPU suficiente para los modelos seleccionados.
- GPU de consumo: no confirmado; depende de si el emisor de 35B (MoE) y el receptor de 4B caben en la VRAM disponible tras cuantización, dato no proporcionado.
- Opciones de despliegue: API del proyecto PLatour (`platour_api.load_session`), backend vLLM para generación, y el evaluador `platour-exps`. No se mencionan llama.cpp, Ollama ni TGI.
- Configuración multi-GPU: por defecto una GPU por réplica; `--n-gpu 8` lanza 8 réplicas independientes con shards disjuntos; `--n-gpu N --gpus-per-replica G` divide N GPUs en N/G réplicas (N debe ser divisible por G). No combinar `--n-gpu` con `torchrun`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-Qwen3.5-35B-to-4B-DAPO | Puente cross-model (PACT) sobre backbones congelados | Puente ligero; emisor 35B MoE + receptor 4B | No disponible | Apache 2.0 | Hugging Face (checkpoint de puente) |
| Qwen/Qwen3.5-35B-A3B | MoE estándar | 35B totales (activos no disponibles) | No disponible | No disponible en la información | Hugging Face |
| Qwen/Qwen3.5-4B | Transformer denso estándar | 4B | No disponible | No disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo autónomo: solo incluye proyecciones de puente; es imprescindible descargar por separado el emisor y el receptor y usar la API del proyecto.
- No es cargable con `AutoModel.from_pretrained`; requiere el custom-loader de PLatour y verificación de hashes contra el manifiesto.
- El autor declara que no se publican puntuaciones de benchmark y que no se emite ninguna afirmación sobre rendimiento imparcial en datos retenidos; cualquier evaluación independiente debe realizarse por el usuario.
- El ejemplo de generación de la model card es una demo de prompt personalizado, no el protocolo de benchmark publicado; el límite de 256 tokens es solo ilustrativo.
- La generación devuelve texto y no ejecuta código generado.
- No se especifican sesgos conocidos, riesgos de alucinación ni limitaciones de idioma en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero al depender de los backbones Qwen, las condiciones de estos se aplican adicionalmente (no detalladas en la información disponible).
- El repositorio tiene 60 descargas y 0 likes, con fecha de creación en 2026; se trata de un artefacto de investigación reciente con poca validación comunitaria.
- La información sobre idiomas soportados no está disponible y depende enteramente de los backbones emisor y receptor.

## Enlaces

- Hugging Face: https://huggingface.co/zen-E/PLatour-Qwen3.5-35B-to-4B-DAPO
- Paper: https://arxiv.org/html/2611.06976
- Código: https://github.com/zhenyi4/platour
- Colección de modelos: https://huggingface.co/collections/zen-E/platour
- Guía de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guía de instalación: https://github.com/zhenyi4/platour#getting-started
- Guía de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen35/README.md
- Índice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Valores por defecto de GPU en evaluación: https://github.com/zhenyi4/platour#gpu-defaults-for-standalone-evaluation
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-DAPO-Data
- Modelo emisor: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Modelo receptor: https://huggingface.co/Qwen/Qwen3.5-4B
