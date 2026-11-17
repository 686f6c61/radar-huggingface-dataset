# zen-E/PLatour-SFT-Qwen3-8B-to-1.7B-Chemistry-NoCoT

## Resumen

PLatour-SFT-Qwen3-8B-to-1.7B-Chemistry-NoCoT es un checkpoint de puentes de proyección (bridge projections) publicado por el autor zen-E dentro del proyecto PLatour, que investiga la transferencia entre modelos de la fase de prefill y la fase autorregresiva (PACT, Prefill-to-Autoregressive Cross-model Transfer). La idea central es que un modelo emisor grande (Qwen3-8B) codifica el prompt y suministra representaciones ocultas, mientras que un receptor pequeño (Qwen3-1.7B) genera la respuesta de forma independiente, conectados mediante puentes lineales ligeros entrenados sobre backbones congelados.

Este checkpoint concreto corresponde al experimento 09 del proyecto, orientado a la tarea de química sin cadena de pensamiento (chemistry_no_cot). No contiene pesos completos de un modelo autónomo: el repositorio de 0,9 GB almacena únicamente las proyecciones del puente, por lo que requiere descargar por separado el emisor y el receptor y cargarlos mediante la API del proyecto. No es cargable con `AutoModel.from_pretrained` de forma estándar.

Su relevancia es metodológica más que de producto: explora si un modelo pequeño puede beneficiarse de las representaciones internas de uno grande en el momento del prefill, con controles experimentales (PACT-Check) que distinguen la información útil del emisor de la mera adaptación del receptor. El propio autor advierte que el repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark asociadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención (backbones Qwen3); puente lineal entre emisor y receptor con mapping `last_aligned` |
| Parametros totales | No disponible como modelo único; receptor Qwen3-1.7B (1.700 millones) y emisor Qwen3-8B (8.000 millones), ambos congelados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponibles; el checkpoint se distribuye en safetensors |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (solo proyecciones del puente, no pesos completos) |

## Arquitectura y entrenamiento

El sistema combina dos backbones Qwen3 congelados de distinto tamaño: un emisor de 8B que procesa el prompt y expone sus representaciones ocultas, y un receptor de 1.7B que genera la respuesta de forma autorregresiva. Entre ambos se entrenan puentes lineales ligeros, inicializados desde cero, que alinean las representaciones del emisor con las del receptor. El método soporta modelos con atención híbrida y, en este checkpoint SFT, utiliza el mapping `last_aligned` (a diferencia de la variante PLatour con GRPO, que emplea `uniform_endpoints`).

El entrenamiento del puente se realiza con recompensas de tarea sobre los backbones congelados, en este caso sobre el conjunto de datos `zen-E/PLatour-Qwen3-Data` para la tarea chemistry_no_cot. El paper introduce además PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para verificar que las mejoras dependen realmente de información útil del emisor y no de la simple adaptación del receptor. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO en esta variante SFT.

## Capacidades

- Generación de texto autorregresiva mediante el receptor Qwen3-1.7B, condicionada por las representaciones del emisor Qwen3-8B.
- Razonamiento y respuesta a preguntas de dominio químico en modo sin cadena de pensamiento (NoCoT), que es la tarea objetivo del experimento 09.
- Transferencia de representaciones entre modelos de distinto tamaño en el prefill, sin necesidad de que el receptor ejecute el prompt completo.
- Evaluación reproducible mediante la herramienta `platour-exps evaluate`, con protocolos de muestreo y puntuación publicados.
- Ejecución multi-GPU con réplicas independientes (`--n-gpu`, `--gpus-per-replica`) para evaluaciones a escala.
- Soporte de backend vLLM para la generación en la API del proyecto.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, visión, audio ni multilingüismo explícito.

## Casos de uso

- Investigación en transferencia entre modelos: el checkpoint permite reproducir el experimento 09 y analizar si las representaciones del emisor 8B mejoran la generación del receptor 1.7B en tareas de química, usando los controles PACT-Check para descartar artefactos.
- Evaluación comparativa de métodos PACT: sirve como punto de referencia SFT frente a la variante GRPO del mismo proyecto, con protocolos de evaluación estandarizados y verificación de hashes de pesos.
- Estudio de eficiencia computacional: al mantener el emisor congelado y entrenar solo puentes ligeros, se puede medir el coste de alinear modelos de distinto tamaño sin reentrenar backbones.
- Reproducción académica: el repositorio incluye manifiestos de release, entradas de test publicadas y comandos de evaluación que facilitan la replicación de resultados en un entorno Linux con CUDA y Python 3.11.
- Desarrollo de pipelines de inferencia híbrida: integración mediante la API `load_session` y el backend vLLM para experimentar con despliegues emisor-receptor en una o varias GPU.
- Análisis de dominios especializados: la tarea chemistry_no_cot permite estudiar cómo se comporta la transferencia en un dominio técnico concreto sin cadena de pensamiento, útil para investigar razonamiento directo frente a razonamiento explícito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark y que no se hace ninguna afirmación sobre el protocolo de selección del checkpoint ni sobre el rendimiento en conjuntos de retención no sesgados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; requiere memoria suficiente para cargar simultáneamente el emisor Qwen3-8B y el receptor Qwen3-1.7B, además del puente. En precisión de 16 bits, los backbones suman aproximadamente 19,4 GB de pesos, a lo que hay que añadir el espacio para activaciones y decodificación.
- GPU recomendadas: no especificadas por el autor; por el tamaño conjunto de los backbones, se necesita al menos una GPU con memoria suficiente para ambos modelos, lo que apunta a A100, H100 o GPUs de gama alta con 40-80 GB.
- GPU de consumo: no se documenta compatibilidad con RTX 4090 u otras GPU de consumo; la carga conjunta de ambos backbones en 16 bits probablemente excede los 24 GB habituales, aunque no hay confirmación oficial.
- Despliegue: la API del proyecto PLatour (`load_session`, `generate`) con backend vLLM; no se contempla carga directa con `AutoModel.from_pretrained`.
- Multi-GPU: el evaluador soporta réplicas independientes con `--n-gpu` y `--gpus-per-replica`; el tamaño de grupo por defecto es 1 GPU por réplica y cada réplica necesita memoria para sus modelos y la carga de decodificación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-SFT-Qwen3-8B-to-1.7B-Chemistry-NoCoT | Puente + receptor 1.7B + emisor 8B congelados | No disponible | Transferencia PACT emisor-receptor | Apache 2.0 | Hugging Face (solo puente) |
| Qwen3-1.7B (receptor base) | 1.700 millones | No disponible | LLM estándar | Apache 2.0 | Hugging Face |
| Qwen3-8B (emisor base) | 8.000 millones | No disponible | LLM estándar | Apache 2.0 | Hugging Face |

La comparación directa con modelos autónomos no es del todo equivalente, ya que este checkpoint no es un modelo independiente sino un conjunto de proyecciones que requiere los dos backbones. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: contiene únicamente proyecciones del puente y no puede cargarse con `AutoModel.from_pretrained`; requiere el emisor Qwen3-8B y el receptor Qwen3-1.7B por separado.
- Sin benchmarks publicados: el autor declara que no hay puntuaciones asociadas y que se requiere evaluación independiente y revisión de procedencia antes de usar los artefactos para nuevas afirmaciones comparativas.
- Sesgos: no documentados en la información disponible; al heredar los backbones Qwen3, podría arrastrar los sesgos de estos.
- Riesgo de alucinación: no evaluado en la información proporcionada; la tarea chemistry_no_cot sin cadena de pensamiento puede aumentar el riesgo de respuestas incorrectas en dominios técnicos.
- Limitaciones de idioma: no se especifican los idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia de los backbones subyacentes (Qwen3) debe verificarse por separado.
- Entorno de ejecución específico: requiere Linux con CUDA, Python 3.11, un checkout editable del proyecto y la instalación de dependencias mediante los scripts del repositorio.
- Generación de código: la API devuelve texto y no ejecuta código generado.
- Advertencia de procedencia: los pesos son históricos y el protocolo de selección del checkpoint no está garantizado como libre de sesgo.

## Enlaces

- Hugging Face: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-8B-to-1.7B-Chemistry-NoCoT
- Paper: https://arxiv.org/html/2611.06976
- Código: https://github.com/zhenyi4/platour
- Colección de modelos: https://huggingface.co/collections/zen-E/platour
- Guía de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guía de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen3/README.md
- Índice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Valores por defecto de GPU para evaluación: https://github.com/zhenyi4/platour#gpu-defaults-for-standalone-evaluation
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
