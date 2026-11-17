# zen-E/PLatour-Qwen3.5-35B-to-4B-DeepCoder

## Resumen

PLatour-Qwen3.5-35B-to-4B-DeepCoder es un checkpoint de puentes de proyección (bridge projections) publicado por zen-E dentro del proyecto PLatour, que implementa Prefill-to-Autoregressive Cross-model Transfer (PACT). En este esquema, un modelo emisor grande (Qwen3.5-35B-A3B) codifica el prompt y suministra representaciones ocultas, mientras que un modelo receptor más pequeño (Qwen3.5-4B) genera la respuesta de forma independiente. El checkpoint no contiene pesos completos de un modelo, sino únicamente las proyecciones lineales que conectan ambos backbones congelados.

El modelo está especializado en la tarea `deepcoder` (generación de código) y se entrena mediante recompensas de tarea sobre proyecciones lineales inicializadas a cero, con soporte para modelos de atención híbrida. El repositorio ocupa 0,7 GB, lo que confirma que se trata de un conjunto de pesos auxiliares y no de un modelo autónomo. La relevancia actual radica en que explora si la información del emisor aporta una ventaja real frente a la mera adaptación del receptor, un punto que el paper aborda con los controles PACT-Check (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver).

La licencia es Apache 2.0 y el checkpoint se distribuye en formato safetensors con un cargador personalizado (`custom-loader`), por lo que no es cargable mediante `AutoModel.from_pretrained`. Requiere el entorno del proyecto PLatour, Python 3.11 y CUDA en Linux.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes de proyección lineales entre backbones transformer congelados (emisor Qwen3.5-35B-A3B y receptor Qwen3.5-4B); el receptor emplea atención híbrida según el paper |
| Parametros totales | No disponible (el checkpoint contiene solo las proyecciones del puente, no pesos completos) |
| Parametros activos | No disponible (el emisor Qwen3.5-35B-A3B es MoE, pero no se detalla el número de parámetros activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con cargador personalizado (`custom-loader`); requiere `platour_api.load_session` |

## Arquitectura y entrenamiento

El método PACT separa la codificación del prompt de la generación de la respuesta. El emisor grande (Qwen3.5-35B-A3B) procesa el prompt y produce representaciones ocultas; un conjunto de puentes lineales ligeros las proyecta hacia el espacio del receptor pequeño (Qwen3.5-4B), que genera la respuesta de forma autorregresiva e independiente. Los backbones permanecen congelados y solo se entrenan las proyecciones, que se inicializan a cero. El entrenamiento se guía por recompensas de tarea en lugar de por destilación supervisada directa.

El paper introduce PACT-Check con cuatro controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para verificar que las mejoras dependen de información útil del emisor y no de la simple adaptación del receptor. El checkpoint corresponde al experimento 26 sobre la tarea `deepcoder`, entrenado con el dataset `zen-E/PLatour-DeepCoder-Data`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de código: el checkpoint está especializado en la tarea `deepcoder`, orientada a la escritura de funciones y programas.
- Transferencia emisor-receptor: aprovecha las representaciones ocultas del modelo grande para condicionar la generación del modelo pequeño.
- Generación de texto multiturno: la API `generate` acepta una lista de mensajes con roles.
- Integración con backend vLLM para la decodificación.
- Evaluación automática de código mediante el juez de coding del proyecto (LCB v6, HumanEval y MBPP).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Generación de funciones en Python: el modelo puede producir funciones sencillas a partir de una instrucción en lenguaje natural, como el ejemplo de la model card que pide una función que devuelva la suma de dos enteros.
- Evaluación de investigación en transferencia entre modelos: sirve para reproducir el protocolo del experimento 26 y medir si la información del emisor mejora al receptor frente a los controles PACT-Check.
- Experimentación con modelos pequeños condicionados por modelos grandes: permite estudiar si un receptor de 4B puede aproximarse al rendimiento de un emisor de 35B en tareas de código sin cargar el modelo grande en el camino de decodificación.
- Reproducción de benchmarks de código: el comando `platour-exps evaluate` ejecuta LCB v6, HumanEval y MBPP con programas generados probados en contenedores Docker aislados.
- Docencia y análisis de arquitecturas híbridas: el checkpoint admite modelos de atención híbrida, lo que permite estudiar cómo se comportan los puentes en ese tipo de backbones.
- Despliegue distribuido de evaluaciones: los flags `--n-gpu` y `--gpus-per-replica` permiten repartir la evaluación en réplicas independientes con fragmentos disjuntos de preguntas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto define la evaluación por defecto sobre LCB v6, HumanEval y MBPP, pero la model card no incluye cifras de rendimiento para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende de cargar simultáneamente el emisor Qwen3.5-35B-A3B y el receptor Qwen3.5-4B, además de las proyecciones del puente.
- El checkpoint por sí solo ocupa 0,7 GB, pero no es suficiente para inferencia sin los backbones.
- GPU recomendadas: no disponibles en la información proporcionada; el proyecto requiere CUDA y memoria suficiente para los modelos seleccionados.
- Configuración por defecto del evaluador: 1 GPU por réplica; `--n-gpu 8` crea 8 réplicas independientes con fragmentos disjuntos de preguntas.
- `--n-gpu 1` es compatible cuando la carga completa cabe en una sola GPU.
- Opciones de despliegue: backend vLLM mediante `platour_api.load_session`; no se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-Qwen3.5-35B-to-4B-DeepCoder | Solo puentes (repo de 0,7 GB); backbones 35B-A3B y 4B | No disponible | Transferencia emisor-receptor para código | Apache 2.0 | Hugging Face, requiere proyecto PLatour |
| Qwen3.5-4B (receptor) | 4B | No disponible | Modelo generativo estándar | No disponible en la información | Hugging Face |
| Qwen3.5-35B-A3B (emisor) | 35B totales, MoE | No disponible | Modelo generativo estándar | No disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint no es un modelo autónomo: contiene solo proyecciones y no puede cargarse con `AutoModel.from_pretrained`.
- Requiere descargar por separado los backbones emisor y receptor, además del entorno del proyecto PLatour.
- El ejemplo de generación de la model card es una demostración con prompt personalizado, no el protocolo de benchmark publicado.
- La generación devuelve texto y no ejecuta el código generado; la ejecución segura requiere el juez con contenedores Docker aislados.
- No se documentan sesgos conocidos ni tasas de alucinación.
- No se especifican los idiomas soportados ni limitaciones de contexto.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia de los backbones implica respetar también sus licencias respectivas.
- El número de descargas (75) y de likes (0) indica una adopción muy limitada; no hay validación comunitaria amplia.
- El límite de 256 tokens del ejemplo es solo ilustrativo y debe aumentarse para respuestas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-Qwen3.5-35B-to-4B-DeepCoder
- Paper: https://arxiv.org/html/2611.06976
- Código del proyecto: https://github.com/zhenyi4/platour
- Colección de modelos PLatour: https://huggingface.co/collections/zen-E/platour
- Guía de agente y API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guía de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tareas: https://github.com/zhenyi4/platour/blob/main/qwen35/README.md
- Índice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Dataset de entrenamiento: https://huggingface.co/datasets/zen-E/PLatour-DeepCoder-Data
