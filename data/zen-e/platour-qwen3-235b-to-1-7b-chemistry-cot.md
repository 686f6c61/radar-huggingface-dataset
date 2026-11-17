# zen-E/PLatour-Qwen3-235B-to-1.7B-Chemistry-CoT

## Resumen

PLatour-Qwen3-235B-to-1.7B-Chemistry-CoT es un checkpoint de investigación publicado por zen-E que implementa el método PACT (Prefill-to-Autoregressive Cross-model Transfer) descrito en el paper arXiv:2611.06976. No se trata de un modelo completo, sino de un conjunto de proyecciones lineales (bridges) entrenadas entre dos backbones congelados de Qwen3: un emisor grande (Qwen3-235B-A22B-FP8) que codifica el prompt y un receptor pequeño (Qwen3-1.7B) que genera la respuesta de forma independiente.

El objetivo del método es transferir capacidad de razonamiento de un modelo de 235B parámetros a uno de 1.7B sin modificar los pesos de ninguno de los dos, entrenando únicamente puentes lineales inicializados a cero con recompensas de tarea (GRPO). El checkpoint corresponde al experimento 13 del proyecto, centrado en razonamiento químico con cadena de pensamiento (chemistry_cot).

Es relevante porque explora una vía alternativa a la destilación clásica: en lugar de copiar pesos o generar datos sintéticos, se aprende una interfaz ligera entre representaciones de modelos de distinta escala. El repositorio ocupa 0.9 GB y contiene solo las proyecciones, no los pesos completos de ninguno de los dos modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes lineales (bridge projections) entre dos backbones transformer Qwen3 congelados; soporta modelos de atención híbrida |
| Parametros totales | No disponible (el checkpoint contiene solo las proyecciones, no los backbones; el receptor es Qwen3-1.7B y el emisor Qwen3-235B-A22B-FP8) |
| Parametros activos | No disponible (el emisor es MoE con 235B totales y 22B activos según su nombre; el receptor es denso de 1.7B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el emisor se distribuye en FP8; no se documentan cuantizaciones del bridge) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con cargador personalizado (`custom-loader`); no compatible con `AutoModel.from_pretrained` |

## Arquitectura y entrenamiento

PACT separa el proceso de inferencia en dos fases: un emisor grande procesa el prompt y produce representaciones ocultas, y un receptor pequeño genera la respuesta de forma autorregresiva a partir de una proyección lineal de esas representaciones. Los backbones permanecen congelados; solo se entrenan los puentes lineales, inicializados a cero, mediante recompensas de tarea con GRPO. El mapeo de capas para este checkpoint es `uniform_endpoints` (a diferencia del variante PLatour-SFT, que usa `last_aligned`).

El paper introduce además PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para verificar que las mejoras provienen de información útil del emisor y no de la mera adaptación del receptor. El entrenamiento se realizó sobre el dataset zen-E/PLatour-Qwen3-Data, con la tarea chemistry_cot como objetivo del experimento 13. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de respuestas de razonamiento químico con cadena de pensamiento (chain-of-thought), objetivo específico del experimento 13.
- Razonamiento multi-paso delegado: el emisor de 235B aporta la codificación del prompt y el receptor de 1.7B produce la secuencia final.
- Generación de texto autorregresiva estándar a través del receptor Qwen3-1.7B.
- Integración con backend vLLM para la generación (`backend="vllm"` en la API del proyecto).
- Soporte de conversaciones por roles (`messages` con `role` y `content`), lo que permite uso conversacional multi-turno.
- No se documentan capacidades de tool calling, function calling, visión, audio ni agentes en la información disponible.
- El modelo no ejecuta código generado; la generación devuelve solo texto.

## Casos de uso

- Investigación en transferencia entre modelos: reproducir el experimento 13 con `platour-exps evaluate` para estudiar si un emisor de 235B mejora a un receptor de 1.7B en tareas de química, usando los controles PACT-Check para descartar mejoras espurias.
- Destilación ligera de razonamiento químico: desplegar el receptor de 1.7B con el bridge entrenado para obtener respuestas de tipo CoT en dominios químicos con un coste de inferencia muy inferior al del emisor de 235B.
- Estudio de eficiencia en serving: comparar latencia y throughput de la pareja emisor-receptor frente a ejecutar directamente Qwen3-235B-A22B-FP8, aprovechando que el receptor es un modelo denso pequeño.
- Validación de metodología PACT: usar los controles Dummy Transfer e Irrelevant Transfer para medir cuánto de la mejora se debe a información útil del emisor y cuánto a adaptación del receptor.
- Prototipado de pipelines híbridos: integrar la API `load_session` y `generate` en flujos de investigación que requieran separar codificación de prompt y decodificación.
- Reproducibilidad y auditoría de checkpoints: descargar y verificar hashes con `platour-exps download --experiment 13` antes de incorporar el bridge a experimentos propios.
- Evaluación multi-GPU: ejecutar el evaluador con `--n-gpu 8` para obtener 4 réplicas independientes de 2 GPUs cada una sobre shards disjuntos de preguntas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark y que no se reclama ningún protocolo de selección de checkpoint ni rendimiento insesgado en held-out; se requiere evaluación independiente y revisión de procedencia.

## Requisitos de hardware

- VRAM: no disponible de forma agregada; depende de los backbones. El emisor Qwen3-235B-A22B-FP8 en FP8 requiere del orden de cientos de GB, mientras que el receptor Qwen3-1.7B es ligero. El bridge en sí ocupa 0.9 GB en el repositorio.
- El evaluador del proyecto usa por defecto 2 GPUs por réplica para este checkpoint; `--n-gpu 1` es incompatible con ese tamaño de grupo por defecto.
- Con `--n-gpu 8` se lanzan 4 réplicas independientes, cada una con 2 GPUs y shards de preguntas disjuntos.
- GPU recomendadas: no se especifican modelos concretos; el entorno requiere Linux con CUDA y memoria suficiente para emisor, receptor y carga de decodificación en cada réplica.
- No cabe en una GPU de consumo de forma completa por el emisor de 235B; el receptor de 1.7B sí es apto para GPUs de consumo, pero el método necesita el emisor para codificar el prompt.
- Despliegue: API del proyecto `platour_api.load_session` con backend vLLM; no es cargable con `AutoModel.from_pretrained`. No se documentan integraciones con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-Qwen3-235B-to-1.7B-Chemistry-CoT | Bridge + backbones Qwen3-235B-A22B-FP8 y Qwen3-1.7B | No disponible | Transferencia cross-model vía proyecciones lineales entrenadas con GRPO | Apache 2.0 | Hugging Face + GitHub del proyecto |
| Qwen3-1.7B (receptor solo) | 1.7B denso | No disponible en esta ficha | Modelo base sin transferencia | Apache 2.0 | Hugging Face |
| Qwen3-235B-A22B-FP8 (emisor solo) | 235B totales / 22B activos | No disponible en esta ficha | MoE de gran escala | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: contiene solo proyecciones; requiere descargar y cargar por separado el emisor y el receptor con la API del proyecto.
- Incompatible con `AutoModel.from_pretrained`; necesita el cargador personalizado y el entorno del repositorio GitHub.
- La model card advierte que no se publican puntuaciones de benchmark ni se garantiza rendimiento insesgado en held-out; se requiere evaluación independiente y revisión de procedencia antes de usarlo.
- El ejemplo de generación es una demo de prompt personalizado, no el protocolo de benchmark publicado; el límite de 256 tokens es solo ilustrativo.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero las condiciones de los backbones subyacentes (Qwen3-1.7B y Qwen3-235B-A22B-FP8) deben verificarse por separado.
- En producción, el coste del emisor de 235B puede anular la ventaja de latencia del receptor pequeño; la viabilidad depende del caso de uso.
- El modelo no ejecuta código generado; no debe usarse como ejecutor en pipelines automáticos sin sandboxing adicional.

## Enlaces

- Hugging Face: https://huggingface.co/zen-E/PLatour-Qwen3-235B-to-1.7B-Chemistry-CoT
- Paper: https://arxiv.org/html/2611.06976
- Código: https://github.com/zhenyi4/platour
- Colección de modelos: https://huggingface.co/collections/zen-E/platour
- Guía de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guía de instalación: https://github.com/zhenyi4/platour#getting-started
- Guía de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen3/README.md
- Índice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Valores por defecto de GPU en evaluación: https://github.com/zhenyi4/platour#gpu-defaults-for-standalone-evaluation
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Modelo receptor: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo emisor: https://huggingface.co/Qwen/Qwen3-235B-A22B-FP8
