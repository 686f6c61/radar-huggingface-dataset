# workmanooo/DeepSeek-V4-Pro-0813

## Resumen

DeepSeek-V4-Pro-0813 es la versión oficial (no preview) de DeepSeek-V4-Pro, un modelo de lenguaje de gran escala desarrollado por DeepSeek AI. Se distribuye como un espejo en el repositorio de HuggingFace `workmanooo/DeepSeek-V4-Pro-0813`, que replica la estructura y los pesos del modelo oficial. Su principal novedad frente a la versión preview es una mejora sustancial de las capacidades agénticas y del rendimiento en entornos de producción, incorporando además el módulo de decodificación especulativa DSpark.

El modelo es un transformer de tipo Mixture-of-Experts (MoE) con aproximadamente 1,65 billones de parámetros totales, según los datos de safetensors del repositorio. Está pensado para tareas de razonamiento complejo, generación de código, uso de herramientas y flujos agénticos multi-paso, y se posiciona como competidor directo de modelos propietarios de primera línea como Opus-4.8 o Fable-5 en los benchmarks publicados por el autor.

Su relevancia actual radica en que combina una licencia MIT (permisiva para uso comercial) con un rendimiento en tareas agénticas y de código que, según la model card, supera a la versión preview en prácticamente todos los benchmarks evaluados. El repositorio ocupa 892,8 GB y requiere infraestructura de centro de datos para su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con módulo de decodificación especulativa DSpark |
| Parametros totales | 1.650.497.936.906 (aprox. 1,65 billones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit, fp8 (según tags del repositorio) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con capas Mixture-of-Experts, identificada en los tags del repositorio como `deepseek_v4`. Incorpora un módulo de decodificación especulativa denominado DSpark, que se activa mediante configuración en vLLM (`--speculative-config`) o SGLang (`--speculative-algorithm DSPARK`). La model card indica que esta versión se construye sobre la estructura del modelo DeepSeek-V4-Pro (Preview) y añade dicho módulo especulativo para acelerar la inferencia.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. La model card únicamente menciona que esta release mejora las capacidades agénticas respecto a la preview y que el parámetro `reasoning_effort` admite tres niveles (`low`, `high`, `max`) que controlan la cantidad de deliberación antes de responder. Tampoco se detalla la innovación técnica del mecanismo de atención más allá de la referencia al módulo DSpark y al uso de caché de índice FP4 (`use_fp4_indexer_cache`).

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento (`thinking_mode`) y control de esfuerzo de razonamiento en tres niveles.
- Generación y comprensión de código, incluyendo tareas de desarrollo full-stack y resolución de problemas de ingeniería (evaluado en DSBench-FullStack y DSBench-Hard).
- Capacidades agénticas: uso de herramientas, razonamiento multi-paso y ejecución de tareas en entornos de terminal (Terminal Bench 2.1, Toolathlon-Verified).
- Soporte de tool calling / function calling, con formato compatible con OpenAI para codificación de mensajes mediante la carpeta `encoding`.
- Capacidades de ciberseguridad evaluadas en Cybergym.
- Decodificación especulativa DSpark para acelerar la inferencia.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se menciona soporte de visión, audio ni otras modalidades.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con razonamiento controlado mediante `reasoning_effort`, ajustando el nivel de deliberación según la complejidad de la consulta.
- Generación de código en producción: su rendimiento en Terminal Bench 2.1 (87,9) y DeepSWE (62,7) lo hace adecuado para pipelines de CI/CD y tareas de reparación automática de código.
- Agentes autónomos de desarrollo full-stack: evaluado en DSBench-FullStack (71,1), puede emplearse en flujos que generan, prueban y despliegan aplicaciones completas.
- Automatización de tareas en terminal: con Terminal Bench 2.1 y Toolathlon-Verified, es apto para agentes que operan entornos de línea de comandos y herramientas externas.
- Análisis de ciberseguridad: su puntuación en Cybergym (83,3) sugiere uso en tareas de detección y análisis de vulnerabilidades dentro de entornos controlados.
- Investigación y razonamiento experto: HLE con herramientas (60,0) lo hace útil en flujos de investigación asistida por herramientas externas.
- Automatización de flujos de trabajo empresariales: AutomationBench (31,8) indica capacidad para tareas de automatización de procesos con múltiples pasos.

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

Las evaluaciones de tareas de código-agente se realizaron con el modo minimal de DeepSeek Harness como framework de agente, usando `reasoning_effort=max`, `temperature=1.0` y `top_p=0.95`. DSBench-FullStack y DSBench-Hard son conjuntos de prueba internos del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 892,8 GB en safetensors, por lo que la inferencia en FP8 requiere del orden de varios cientos de GB de memoria.
- GPU recomendadas: la model card menciona un nodo con 4×GB300 para servir el modelo con vLLM en paralelo de datos (`--data-parallel-size 4`).
- No cabe en GPU de consumo (RTX 4090, etc.) dado el tamaño del modelo.
- Opciones de despliegue: vLLM (con soporte de DSpark vía `--speculative-config`), SGLang (con `--speculative-algorithm DSPARK`). No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la decodificación especulativa DSpark con 7 tokens especulativos está orientada a mejorar el throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-0813 | ~1,65 B (MoE) | no disponible | MIT | HuggingFace | Terminal Bench 87,9; DeepSWE 62,7 |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | no disponible | HuggingFace | Terminal Bench 82,7; DeepSWE 54,4 |
| GLM-5.2 | no disponible | no disponible | no disponible | no disponible | Terminal Bench 81,0; DeepSWE 46,2 |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Terminal Bench 88,3; DeepSWE 67,5 |
| Opus-4.8 | no disponible | no disponible | propietaria | API | HLE 49,8; NL2Repo 69,7 |
| Fable-5 (w/ fallback) | no disponible | no disponible | propietaria | API | HLE 53,3; DeepSWE 70,0 |

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se han publicado evaluaciones específicas de factualidad.
- Idiomas soportados no documentados; el rendimiento multilingüe es desconocido.
- Longitud de contexto no especificada, lo que dificulta planificar su uso en tareas de contexto largo.
- Aunque la licencia es MIT, conviene verificar las condiciones de uso del modelo oficial de DeepSeek y de los pesos replicados en este repositorio espejo.
- El repositorio es un espejo de terceros (`workmanooo`), no el repositorio oficial de DeepSeek AI; se recomienda contrastar la integridad de los pesos con la fuente oficial.
- No incluye plantilla de chat en formato Jinja; requiere usar la carpeta `encoding` con scripts Python para codificar mensajes.
- El despliegue requiere infraestructura de centro de datos (nodos multi-GPU), no apto para hardware de consumo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/workmanooo/DeepSeek-V4-Pro-0813
- Informe técnico (arXiv): https://arxiv.org/abs/2606.19348
- Página oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organización DeepSeek en HuggingFace: https://huggingface.co/deepseek-ai
- Twitter de DeepSeek: https://twitter.com/deepseek_ai
- Receta de vLLM para DeepSeek-V4-Pro: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Pro
