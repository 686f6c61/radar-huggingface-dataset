# XxKaitoxX/DeepSeek-V4-Pro-0813

## Resumen

DeepSeek-V4-Pro-0813 es la versión definitiva del modelo insignia de la familia DeepSeek-V4, publicada como reemplazo de la versión Preview. Lo desarrolla DeepSeek AI y se distribuye en Hugging Face bajo el identificador `XxKaitoxX/DeepSeek-V4-Pro-0813`. El modelo está orientado a cargas de trabajo agénticas y de generación de código en producción, con mejoras notables frente a la versión preview en tareas de agente, terminal, ciberseguridad y desarrollo full-stack.

La arquitectura es de tipo Mixture of Experts (MoE) con atención de tipo DeepSeek y un módulo de decodificación especulativa denominado DSpark acoplado al modelo base. El repositorio ocupa 892,8 GB en formato safetensors y fp8, lo que sitúa el modelo en la categoría de modelos de escala frontier, pensados para despliegue en clústeres multi-GPU (el ejemplo oficial de vLLM usa un nodo de 4×GB300).

La relevancia actual del modelo reside en su posicionamiento competitivo frente a modelos propietarios de primera línea (Opus-4.8, Fable-5, Kimi K3, GLM-5.2) en benchmarks de agentes y código, con licencia MIT, lo que facilita su adopción comercial. No obstante, la información pública disponible sobre parámetros totales, longitud de contexto y composición del dataset de entrenamiento es limitada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con atención DeepSeek y módulo de decodificación especulativa DSpark |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 (pesos publicados en fp8); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (también fp8) |

## Arquitectura y entrenamiento

El modelo se construye sobre la estructura de DeepSeek-V4-Pro (Preview) e incorpora un módulo de decodificación especulativa DSpark, que acelera la inferencia mediante la generación de tokens candidatos y su verificación. La arquitectura es de tipo transformer con capas MoE, e incluye mecanismos de atención con caché de índice en fp4 (`use_fp4_indexer_cache`) y caché KV en fp8, según la receta oficial de vLLM. El backend MoE recomendado es `deep_gemm_mega_moe`, y el despliegue se realiza con paralelismo de datos y expertos (`--enable-expert-parallel`).

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. La model card menciona un informe técnico (arXiv:2606.19348) que presumiblemente contiene estos detalles, pero no se han podido verificar sus contenidos en la información disponible. El modelo no incluye plantilla de chat en formato Jinja; en su lugar se proporciona un directorio `encoding` con scripts Python para codificar mensajes en formato compatible con OpenAI y parsear la salida.

## Capacidades

- Generación de texto y razonamiento con modo de "thinking" configurable mediante el parámetro `reasoning_effort` con tres niveles: `low`, `high` y `max`.
- Capacidades agénticas avanzadas: el modelo destaca en benchmarks de agentes (Terminal Bench 2.1, Toolathlon-Verified, Agents' Last Exam, AutomationBench).
- Generación de código y desarrollo full-stack: resultados elevados en DeepSWE, NL2Repo y DSBench-FullStack.
- Razonamiento con y sin herramientas (HLE con y sin tools).
- Capacidades de ciberseguridad evaluadas en Cybergym.
- Soporte de tool calling / function calling implícito en las tareas de agente evaluadas.
- Decodificación especulativa DSpark para acelerar la inferencia.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con razonamiento configurable (`low` para respuestas rápidas, `max` para consultas complejas), integrándose mediante la codificación de mensajes en formato OpenAI que proporciona el directorio `encoding`.
- Generación de código en producción: sus resultados en DeepSWE (62,7) y NL2Repo (61,5) lo hacen adecuado para pipelines de CI/CD donde se requiere generación y revisión de código con agentes autónomos.
- Agentes de terminal y automatización de sistemas: Terminal Bench 2.1 (87,9) y AutomationBench (31,8) indican buen rendimiento en tareas de línea de comandos y automatización de flujos.
- Desarrollo full-stack asistido: DSBench-FullStack (71,1) y DSBench-Hard (67,2) lo posicionan para tareas de construcción de aplicaciones completas con agentes.
- Análisis de ciberseguridad: Cybergym (83,3) sugiere utilidad en tareas de detección y análisis de vulnerabilidades, aunque requiere supervisión humana.
- Razonamiento complejo con herramientas: HLE con tools (60,0) lo hace apto para asistentes de investigación que combinan razonamiento con llamadas a herramientas externas.
- Despliegue en clústeres de inferencia de alto rendimiento: con vLLM y DSpark activado mediante `--speculative-config`, se puede servir en nodos 4×GB300 con paralelismo de datos y expertos.

## Benchmarks y rendimiento

| Benchmark | DeepSeek-V4-Pro-0813 | DeepSeek-V4-Flash-0731 | DeepSeek-V4-Pro (Preview) | GLM-5.2 | Kimi K3 | Opus-4.8 | Fable-5 (w/ fallback) |
|---|---|---|---|---|---|---|---|
| HLE (wo / w tools) | 42,7 / 60,0 | 37,8 / 51,5 | 37,7 / 48,2 | 40,5 / 54,7 | 43,5 / 56,0 | 49,8 / 57,9 | 53,3 / 63,0 |
| Terminal Bench 2.1 | 87,9 | 82,7 | 72,1 | 81,0 | 88,3 | 85,0 | 88,0 |
| NL2Repo | 61,5 | 54,2 | 38,5 | 48,9 | - | 69,7 | - |
| Cybergym | 83,3 | 76,7 | 52,7 | - | 80,0 | 78,3 | 83,1 |
| DeepSWE | 62,7 | 54,4 | 12,8 | 46,2 | 67,5 | 58,0 | 70,0 |
| Toolathlon-Verified | 74,1 | 70,3 | 55,9 | 59,9 | 76,5 | 76,2 | 77,9 |
| Agents' Last Exam | 25,7 | 25,2 | 16,5 | 23,8 | 27,6 | 25,7 | - |
| AutomationBench (Public) | 31,8 | 25,1 | 12,8 | 12,9 | 30,8 | 27,2 | 29,1 |
| DSBench-FullStack † | 71,1 | 68,7 | 41,8 | 61,8 | 73,7 | 71,6 | 77,2 |
| DSBench-Hard † | 67,2 | 59,6 | 31,1 | 54,5 | 63,0 | 71,7 | 68,3 |

Notas: las tareas de agente de código se evalúan con el modo mínimo de DeepSeek Harness, con `reasoning_effort=max`, `temperature=1.0` y `top_p=0.95`. DSBench-FullStack y DSBench-Hard son conjuntos internos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 892,8 GB en safetensors/fp8, lo que implica que la inferencia requiere múltiples GPUs de alta capacidad.
- GPU recomendadas: el ejemplo oficial de vLLM usa un nodo de 4×GB300 con `--data-parallel-size 4` y expert parallelism.
- ¿Cabe en GPU consumer? No, dado el tamaño del repositorio en fp8 (892,8 GB), no es viable en GPUs consumer como RTX 4090.
- Opciones de despliegue: vLLM (con `--speculative-config` para DSpark) y SGLang (con `--speculative-algorithm DSPARK`). No se menciona soporte de llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; DSpark está diseñado para acelerar la decodificación especulativa con 7 tokens especulativos y muestreo greedy.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-0813 | no disponible | no disponible | MIT | Hugging Face (892,8 GB) | Terminal Bench 2.1: 87,9; DeepSWE: 62,7 |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | no disponible | Hugging Face | Terminal Bench 2.1: 82,7; DeepSWE: 54,4 |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Terminal Bench 2.1: 88,3; DeepSWE: 67,5 |
| Opus-4.8 | no disponible | no disponible | propietaria | API | HLE: 49,8; NL2Repo: 69,7 |
| GLM-5.2 | no disponible | no disponible | no disponible | no disponible | DeepSWE: 46,2; Terminal Bench 2.1: 81,0 |

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- Riesgo de alucinación inherente a modelos de lenguaje de gran escala; no se han publicado evaluaciones específicas de factualidad en la información disponible.
- Longitud de contexto e idiomas soportados no disponibles, lo que limita la planificación de despliegues multilingües o de contexto largo.
- La licencia MIT permite uso comercial, pero se recomienda verificar los términos del informe técnico y de los pesos publicados por el autor del repositorio (`XxKaitoxX`), que no coincide con la organización oficial `deepseek-ai` referenciada en la model card.
- El modelo no incluye plantilla de chat Jinja; es necesario usar los scripts del directorio `encoding`, lo que añade complejidad de integración.
- El tamaño del repositorio (892,8 GB) y la necesidad de hardware multi-GPU (4×GB300) limitan su uso a infraestructuras de alto presupuesto.
- La versión publicada en este repositorio tiene 0 descargas y 0 likes, y el autor del repo no es la organización oficial de DeepSeek, por lo que conviene verificar la integridad de los pesos antes de usarlos en producción.
- El parámetro `reasoning_effort` con nivel `max` incrementa la latencia y el coste computacional; debe ajustarse según el caso de uso.

## Enlaces

- Hugging Face: https://huggingface.co/XxKaitoxX/DeepSeek-V4-Pro-0813
- Informe técnico: https://arxiv.org/abs/2606.19348
- Página oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organización DeepSeek en Hugging Face: https://huggingface.co/deepseek-ai
- Twitter de DeepSeek: https://twitter.com/deepseek_ai
- Receta de vLLM: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Pro
