# zai-org/GLM-5.3

## Resumen

GLM-5.3 es un modelo de lenguaje de gran escala desarrollado por Z.ai (zai-org), publicado bajo licencia propia `glm-5.3`. Se trata de un transformer de tipo mezcla de expertos (MoE) con 753.329.940.480 parámetros totales según los pesos en safetensors, y reutiliza exactamente el mismo modelo base que GLM-5.2: todas las mejoras de esta version provienen del post-entrenamiento, no de cambios en la arquitectura ni en el pre-entrenamiento.

El foco de esta version es el codigo complejo y las tareas de horizonte largo. Segun la model card, GLM-5.3 mejora un 50% sobre GLM-5.2 en el benchmark interno Z.ai Code Bench y alcanza estado del arte open source en Terminal Bench 3.0 y Agents' Last Exam. Tambien destaca una capacidad emergente en ciberseguridad: es SOTA en CyberGym para descubrimiento de vulnerabilidades y mas que duplica a GLM-5.2 en benchmarks de explotacion.

El modelo esta pensado para despliegues agénticos con tool calling, ejecucion de comandos en terminal y razonamiento multi-paso, con soporte de un parametro `reasoning_effort` de tres niveles (`low`, `high`, `max`) para controlar el presupuesto de pensamiento. Solo declara soporte para ingles y chino, y su enorme tamano (755,7 GB de repo) lo situa en el terreno de servidores multi-GPU, no de hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tipo `glm_moe_dsa` en transformers) |
| Parametros totales | 753.329.940.480 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como spec oficial; en evaluaciones se cita contexto de hasta 1M tokens (NL2Repo) y 300.000 tokens con gestion de contexto (HLE w/ tools) |
| Tipos de cuantizacion | no disponible (el repo se distribuye en safetensors; tag `fp8`) |
| Idiomas soportados | en, zh |
| Licencia | `glm-5.3` (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLM-5.3 es un transformer con mezcla de expertos (MoE), identificado en Hugging Face con la arquitectura `glm_moe_dsa` y compatible con la libreria transformers. El dato clave es que comparte el modelo base con GLM-5.2: la model card afirma explicitamente que "every gain comes from post-training", es decir, que no hay cambios en la arquitectura ni en el corpus de pre-entrenamiento respecto a la version anterior. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni los detalles del pipeline de RLHF/DPO mas alla de la mencion generica al post-entrenamiento.

La innovacion principal de esta version es el escalado del post-entrenamiento orientado a tareas de codigo y agentes de horizonte largo, con un efecto secundario no buscado: la capacidad de ciberseguridad (descubrimiento y explotacion de vulnerabilidades) crecio mas rapido de lo previsto. El modelo expone un parametro `reasoning_effort` con tres niveles (`low`, `high`, `max`, por defecto `max`) para controlar el presupuesto de razonamiento, y la plantilla de chat incluye un flag `clear_thinking` que por defecto es `false` y que en escenarios conversacionales conviene pasar a `true`.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y chino.
- Codigo de alta complejidad: mejoras del 50% sobre GLM-5.2 en Z.ai Code Bench y SOTA open source en Terminal Bench 3.0 y Agents' Last Exam.
- Razonamiento con herramientas: HLE w/ Tools de 62,5, con contexto de hasta 300.000 tokens y gestion de contexto.
- Tool calling y function calling, con resultados en Toolathlon Verified (73,0) y AutomationBench (48,2).
- Capacidades agénticas de horizonte largo: ejecucion en terminal (Terminal Bench 2.1 y 3.0), resolucion de issues de repositorio (DeepSWE, SWE-Marathon, FrontierSWE) y generacion de repositorios desde lenguaje natural (NL2Repo).
- Razonamiento con presupuesto controlable mediante `reasoning_effort` (`low`, `high`, `max`).
- Ciberseguridad ofensiva y defensiva: descubrimiento de vulnerabilidades (CyberGym 84,5) y explotacion (ExploitGym, ExploitBench).
- Capacidades profesionales evaluadas en GDPval-AA v2 (1769).
- No se declara soporte de vision, audio ni otros idiomas distintos de en y zh.

## Casos de uso

- Reparacion automatica de issues en repositorios: el modelo puede recibir un issue y el arbol del proyecto para generar un parche verificable; sus resultados en DeepSWE (66,9) y SWE-Marathon (42,5) lo hacen adecuado para integrarse en pipelines de CI que abren pull requests automaticos.
- Agente de terminal para tareas de DevOps: con Terminal Bench 3.0 en 28,3 y fuerte rendimiento en Terminal Bench 2.1 (88,2), puede operar shells, interpretar salidas y encadenar comandos para diagnostico y remediacion de incidencias.
- Generacion de repositorios completos a partir de especificaciones: NL2Repo (58,0) con contexto de hasta 1M tokens permite pasar documentos de requisitos extensos y obtener estructuras de proyecto coherentes.
- Automatizacion de flujos con herramientas externas: Toolathlon Verified (73,0) y AutomationBench (48,2) respaldan su uso como orquestador de APIs, CRMs o sistemas internos mediante function calling.
- Auditoria de seguridad y bug bounty: CyberGym (84,5) y ExploitBench (54,4) lo posicionan para triaje de vulnerabilidades, generacion de PoCs en entornos controlados y analisis de cadenas de explotacion.
- Asistente de investigacion con busqueda y calculo: HLE w/ Tools (62,5) con contexto de 300.000 tokens y gestion de contexto permite tareas de sintesis documental de largo alcance.
- Evaluacion de modelos y generacion de datos sinteticos de alta calidad: su rendimiento en PostTrainBench (39,8) sugiere utilidad como modelo profesor en pipelines de destilacion y anotacion.

## Benchmarks y rendimiento

| Benchmark | GLM-5.3 | GLM-5.2 | Kimi K3 | DeepSeek-V4 Pro-0813 | Qwen3.8-Max | Opus 4.8 | Fable 5 (w/ fallback) | GPT-5.6 Sol |
|---|---|---|---|---|---|---|---|---|
| Terminal Bench 2.1 | 88,2 | 81,0 | 88,3 | 87,9 | 86,6 | 85,0 | 88,0 | **88,8** |
| Terminal Bench 3.0 | 28,3 | 4,6 | 17,4 | – | – | 21,1 | 33,7 | **34,6** |
| DeepSWE (v1.1) | 66,9 | 46,2 | 67,5 | 62,7 | 56,6 | 58,0 | 69,7 | **72,7** |
| NL2Repo | 58,0 | 48,9 | 58,0 | 61,1 | 55,9 | **69,7** | – | – |
| ProgramBench (Almost Solved) | 19,0 | 9,5 | 17,5 | – | 10,5 | 15,5 | **33,0** | 23,0 |
| FrontierSWE | 78,1 | 67,5 | – | – | – | 66,5 | **88,2** | – |
| SWE-Marathon (v1.1) | 42,5 | 19,4 | 48,1 | – | – | **48,8** | 33,1 | 42,5 |
| PostTrainBench | 39,8 | 31,7 | 32,0 | – | – | 32,9 | **41,8** | 36,2 |
| CyberGym | **84,5** | 77,2 | 80,0 | 83,3 | 78,5 | 78,1 | 83,8 | 83,6 |
| ExploitGym (2h / 6h) | 105 / 130 | 29 / 39 | 36 / 70 | – | 14 / 26 | 80 / 120 | 181 / 247 | **216 / 293** |
| ExploitBench | 54,4 | 24,4 | 32,2 | – | 28,8 | 40,0 | **78,0** | 76,5 |
| Toolathlon Verified | 73,0 | 59,9 | **76,5** | 74,1 | 72,5 | 76,2 | 74,7 | 74,9 |
| AutomationBench (v1.0.6) | **48,2** | 26,2 | 46,7 | 43,2 | 39,8 | 41,0 | 46,2 | 45,8 |
| Agents' Last Exam (ALE-CLI) | 28,5 | 23,8 | 27,6 | 25,7 | 27,0 | 25,7 | 23,8 | **28,6** |
| HLE w/ Tools | 62,5 | 54,7 | 59,8 | 60,0 | 56,2 | 57,9 | 63,9 | **64,5** |
| GDPval-AA v2 | **1769** | 1508 | 1682 | 1590 | 1739 | 1588 | 1743 | 1730 |

Notas metodologicas de la model card: HLE w/ tools se evalua con `temperature=1.0`, `top_p=0.95`, longitud maxima de generacion de 163.840 tokens, contexto maximo de 300.000 tokens con gestion de contexto y GPT-5.6-luna (medium) como juez. NL2Repo se evalua con `temperature=1.0`, `top_p=1.0`, `max_new_tokens=64k` bajo contexto de 1M y con filtros anti-hacking (reglas y juez LLM) para bloquear operaciones no autorizadas como `pip` o `curl`.

## Requisitos de hardware

- VRAM estimada: con 753.329.940.480 parametros, en FP8 el peso ronda los 750 GB, por lo que se necesita un nodo multi-GPU de 8x H100 80 GB o 8x H200 141 GB como minimo; en BF16 el requisito se duplica y excede los 1,4 TB.
- GPU recomendadas: H100, H200 y aceleradores Ascend NPU. No es viable en RTX 4090 ni en ninguna GPU de consumo.
- Despliegue: SGLang, vLLM, TokenSpeed, Transformers, KTransformers y Unsloth, con guias especificas publicadas. En Ascend NPU estan soportados vLLM-Ascend, xLLM y SGLang.
- Almacenamiento: el repo de Hugging Face ocupa 755,7 GB, por lo que conviene planificar descarga y cache en almacenamiento NVMe de alta capacidad.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Terminal Bench 3.0 | CyberGym | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-5.3 | 753,3 B (MoE) | no disponible (hasta 1M en evaluacion) | 28,3 | 84,5 | `glm-5.3` (other) | Pesos abiertos en HF |
| Kimi K3 | no disponible | no disponible | 17,4 | 80,0 | no disponible | no disponible |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | – | 83,3 | no disponible | no disponible |
| Qwen3.8-Max | no disponible | no disponible | – | 78,5 | no disponible | no disponible |
| Opus 4.8 | no disponible | no disponible | 21,1 | 78,1 | propietaria | API |
| GPT-5.6 Sol | no disponible | no disponible | 34,6 | 83,6 | propietaria | API |

Frente a los modelos abiertos de su categoria, GLM-5.3 lidera en CyberGym (84,5), AutomationBench (48,2) y GDPval-AA v2 (1769), mientras que Kimi K3 le supera en Toolathlon Verified (76,5 frente a 73,0) y DeepSeek-V4 Pro-0813 en NL2Repo (61,1 frente a 58,0). Los modelos propietarios GPT-5.6 Sol y Fable 5 mantienen ventaja en tareas de explotacion y en Terminal Bench 3.0.

## Limitaciones y advertencias

- Solo declara soporte de ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- No se publican datos de sesgos, toxicidad ni evaluaciones de seguridad mas alla de los benchmarks de ciberseguridad.
- Riesgo de alucinacion inherente a los modelos generativos; en tareas de codigo puede producir APIs o dependencias inexistentes, por lo que conviene validar con tests automatizados.
- La capacidad de ciberseguridad ofensiva (ExploitGym, ExploitBench) implica un riesgo de uso dual; la licencia `glm-5.3` debe revisarse antes de cualquier despliegue comercial o en entornos sin sandbox.
- El flag `clear_thinking` es `false` por defecto en la plantilla de chat: en produccion conversacional hay que pasarlo explicitamente a `true` o se arrastrara el razonamiento entre turnos.
- `reasoning_effort` cae a `max` si se pasa un valor no reconocido, lo que incrementa coste y latencia sin aviso.
- El coste de inferencia es muy alto: 753 B de parametros exigen nodos multi-GPU y planificacion de capacidad; no es apto para despliegues en hardware de consumo.
- No se especifican parametros activos del MoE, longitud de contexto oficial ni opciones de cuantizacion en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/zai-org/GLM-5.3
- Paper (arXiv): https://arxiv.org/abs/2602.15763
- Repositorio GLM-5 en GitHub: https://github.com/zai-org/GLM-5
- Cookbook de SGLang para GLM-5.3: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- Recetas de vLLM: https://recipes.vllm.ai/zai-org/GLM-5.3
- TokenSpeed (LightSeek): https://lightseek.org/tokenspeed/recipes/models#glm-5-3
- Documentacion de transformers (`glm_moe_dsa`): https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- Tutorial de KTransformers para GLM-5.2: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Guia de Unsloth: https://unsloth.ai/docs/models/GLM-5.3
- Despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
