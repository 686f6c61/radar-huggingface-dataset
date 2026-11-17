# zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-MATH500

## Resumen

PLatour-SFT-Qwen3-235B-to-1.7B-MATH500 es un checkpoint de puentes de proyección lineal entrenados bajo el paradigma PACT (Prefill-to-Autoregressive Cross-model Transfer), descrito en el paper "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976). Lo publica el usuario zen-E en Hugging Face. No es un modelo completo: el repositorio contiene únicamente las proyecciones que conectan un modelo emisor grande (Qwen3-235B-A22B-FP8) con un modelo receptor pequeño (Qwen3-1.7B), ambos congelados durante el entrenamiento.

La idea central de PACT es que el emisor grande codifica el prompt y transfiere sus representaciones ocultas al receptor pequeño, que genera la respuesta de forma autorregresiva e independiente. Los puentes se entrenan con recompensas de tarea partiendo de proyecciones inicializadas a cero, y el método soporta modelos con atención híbrida. Este checkpoint concreto corresponde al experimento 06, ajustado sobre la tarea MATH500.

Su relevancia es metodológica más que práctica: el paper introduce PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para verificar si las mejoras provienen realmente de la información del emisor o de la mera adaptación del receptor. El repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark publicadas, por lo que el autor advierte explícitamente de que se requiere una evaluación independiente antes de usar estos artefactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes de proyección lineal entre backbones transformer congelados (emisor Qwen3-235B-A22B-FP8, receptor Qwen3-1.7B); soporta atención híbrida |
| Parametros totales | No disponible (el repo de 0.9 GB contiene solo las proyecciones del puente, no los pesos completos) |
| Parametros activos | No disponible (el emisor Qwen3-235B-A22B es MoE, pero este checkpoint no incluye sus pesos) |
| Longitud de contexto | No disponible (heredada del receptor Qwen3-1.7B; no especificada en la model card) |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en safetensors; el emisor referenciado es FP8) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con cargador personalizado (`custom-loader`); requiere `platour_api.load_session`, no es cargable con `AutoModel.from_pretrained` |

## Arquitectura y entrenamiento

El método PACT entrena puentes de proyección lineal ligeros entre dos backbones congelados: un emisor grande (Qwen3-235B-A22B-FP8) que procesa el prompt y suministra representaciones ocultas, y un receptor pequeño (Qwen3-1.7B) que genera la respuesta de forma independiente. Las proyecciones se inicializan a cero y se optimizan mediante recompensas de tarea, sin actualizar los pesos de ninguno de los dos modelos. El mapeo de capas para este checkpoint es `last_aligned`, a diferencia de la variante PLatour (GRPO), que usa `uniform_endpoints`.

Este checkpoint corresponde al experimento 06 con ajuste SFT sobre MATH500. El dataset de entrenamiento referenciado es `zen-E/PLatour-Qwen3-Data`. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas adicionales de RLHF o DPO; solo indica que el ajuste se realizó sobre la tarea MATH500 con el método SFT. El paper introduce además PACT-Check, un protocolo de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) diseñado para distinguir si la mejora en tarea proviene de la información útil del emisor o de la simple adaptación del receptor.

## Capacidades

- Generación de texto autorregresiva delegada al receptor Qwen3-1.7B, condicionada por las representaciones ocultas del emisor Qwen3-235B-A22B-FP8.
- Razonamiento matemático orientado a la tarea MATH500, sobre la que se ajustó el checkpoint.
- Transferencia cross-model de representaciones ocultas mediante proyecciones lineales entrenadas con recompensas de tarea.
- Soporte de modelos con atención híbrida en el pipeline PACT.
- Integración con backend vLLM para la generación (`backend="vllm"` en la API de sesión).
- Evaluación reproducible mediante `platour-exps evaluate` con verificación de hashes de configuración y pesos.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking específicas de este checkpoint; dependen en todo caso de las capacidades del receptor Qwen3-1.7B, no verificadas en la información disponible.

## Casos de uso

- Investigación en transferencia cross-model: reproducir el experimento 06 del paper PACT para estudiar cómo un emisor de 235B puede mejorar la generación de un receptor de 1.7B sin modificar ninguno de los dos backbones.
- Validación metodológica con PACT-Check: ejecutar los controles Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver para determinar si las mejoras observadas dependen de información útil del emisor o de la adaptación del receptor.
- Evaluación de razonamiento matemático en MATH500: usar `platour-exps evaluate --experiment 6` con los protocolos de muestreo y puntuación publicados para obtener métricas reproducibles sobre los inputs TEST.
- Estudio de eficiencia computacional: comparar el coste de inferencia de un receptor de 1.7B asistido por un emisor de 235B frente a alternativas de destilación o ajuste directo del modelo pequeño.
- Reproducibilidad de artefactos de investigación: descargar y verificar el checkpoint con `platour-exps download --experiment 6`, que valida configuración y hashes de pesos contra el manifiesto de release.
- Desarrollo de infraestructura PACT: usar el checkpoint como referencia para integrar nuevos pares emisor-receptor o nuevos mapeos de capas en el framework `platour`, partiendo de un caso ya publicado.
- Docencia y divulgación: ilustrar el paradigma de transferencia prefill-a-autorregresiva con un ejemplo funcional y de código abierto bajo licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark y que no se hace ninguna afirmación sobre el protocolo de selección del checkpoint ni sobre rendimiento no sesgado en held-out. Se requiere evaluación independiente y revisión de procedencia.

## Requisitos de hardware

- El checkpoint contiene solo las proyecciones del puente (repo de 0.9 GB), pero la inferencia requiere cargar simultáneamente el emisor Qwen3-235B-A22B-FP8 y el receptor Qwen3-1.7B; la VRAM debe cubrir ambos modelos más la carga de decodificación.
- El tamaño por defecto del grupo de evaluación es de 2 GPUs por réplica; `--n-gpu 1` es incompatible con ese valor por defecto. Los tamaños de grupo son ajustes de colocación, no una garantía de que el modelo quepa en memoria.
- Con `--n-gpu 8` se ejecutan 4 réplicas independientes de 2 GPUs cada una, con shards de preguntas disjuntos.
- Cada réplica necesita memoria suficiente para sus modelos y la carga de decodificación; usar `CUDA_VISIBLE_DEVICES` para seleccionar y ordenar GPUs.
- No combinar `--n-gpu` con `torchrun`.
- Entorno recomendado: Linux con CUDA, Python 3.11, instalación vía `scripts/install_environment.py` del repositorio `platour`.
- Backend de generación soportado en los ejemplos: vLLM.
- No se proporcionan estimaciones de latencia ni throughput.
- No se especifican GPU concretas (A100, H100, RTX 4090) ni si el conjunto cabe en GPUs de consumo; dado el emisor de 235B en FP8, es previsible que no quepa en una sola GPU de consumo, pero este dato no está confirmado en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-SFT-Qwen3-235B-to-1.7B-MATH500 | Puente entre 235B (emisor) y 1.7B (receptor) | No disponible | Transferencia cross-model PACT con puentes lineales | Apache 2.0 | Hugging Face (57 descargas) |
| Qwen3-1.7B (receptor base) | 1.7B | No disponible en esta ficha | Transformer denso | Apache 2.0 | Hugging Face |
| Qwen3-235B-A22B-FP8 (emisor base) | 235B totales, 22B activos (MoE) | No disponible en esta ficha | Transformer MoE en FP8 | Apache 2.0 | Hugging Face |
| Otras variantes PLatour (colección zen-E) | No disponible | No disponible | PACT con distintos métodos (p. ej. GRPO) y mapeos | Apache 2.0 | Hugging Face (colección `zen-E/platour`) |

La comparación directa con modelos de la misma categoría no está disponible: este checkpoint no es un modelo autónomo, sino un componente que requiere los dos backbones Qwen3 referenciados. Las alternativas reales serían otras variantes de la colección PLatour o métodos de destilación y ajuste directo del receptor, para los que no se aportan datos comparativos en la información disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: contiene únicamente proyecciones de puente y no puede cargarse con `AutoModel.from_pretrained`; requiere la API `platour_api.load_session` y los backbones emisor y receptor descargados por separado.
- Sin benchmarks publicados: el autor declara explícitamente que no se hacen afirmaciones sobre el protocolo de selección del checkpoint ni sobre rendimiento no sesgado en held-out; se exige evaluación independiente y revisión de procedencia.
- Sesgos conocidos: no documentados en la información disponible; al heredar el comportamiento del receptor Qwen3-1.7B, arrastra los sesgos de este, no evaluados aquí.
- Riesgo de alucinación: no cuantificado; el ejemplo de generación devuelve texto y no ejecuta código generado, por lo que no hay verificación automática de corrección.
- Limitaciones de contexto e idioma: no disponibles; dependen del receptor y no se especifican en la model card.
- El límite de 256 tokens del ejemplo es solo una demostración de prompt personalizado, no el protocolo de benchmark publicado; debe aumentarse para respuestas largas.
- El mapeo de capas es específico (`last_aligned`); usar `uniform_endpoints` (propio de la variante GRPO) con este checkpoint produciría resultados incorrectos.
- Los pesos distribuidos son históricos de inferencia; no deben interpretarse como un estado final optimizado ni como un modelo listo para producción.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación independiente desaconseja su despliegue en producción sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-MATH500
- Paper: https://arxiv.org/html/2611.06976
- Código: https://github.com/zhenyi4/platour
- Colección de modelos PLatour: https://huggingface.co/collections/zen-E/platour
- Guía de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guía de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen3/README.md
- Índice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Valores por defecto de GPU para evaluación: https://github.com/zhenyi4/platour#gpu-defaults-for-standalone-evaluation
- Dataset de entrenamiento: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Modelo emisor: https://huggingface.co/Qwen/Qwen3-235B-A22B-FP8
- Modelo receptor: https://huggingface.co/Qwen/Qwen3-1.7B
