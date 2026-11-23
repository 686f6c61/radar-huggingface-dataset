# Sunyxity/GLM-5.3

## Resumen

GLM-5.3 es un modelo de lenguaje de gran escala desarrollado por Z.ai (organismo detrás de la familia GLM) y publicado en Hugging Face bajo la cuenta Sunyxity. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 753.329.940.480 parámetros totales según los pesos en safetensors, orientado a generación de texto, razonamiento complejo, código y tareas agénticas de horizonte largo. La model card indica que reutiliza la misma base que GLM-5.2 y que todas las mejoras provienen del post-entrenamiento, lo que lo convierte en una actualización centrada en capacidades de codificación y ciberseguridad más que en cambios arquitectónicos.

El modelo destaca por su rendimiento en benchmarks de agentes y coding: Terminal Bench 3.0 (28,3), DeepSWE v1.1 (66,9) y CyberGym (84,5), donde supera a GLM-5.2 y compite con modelos propietarios como Opus 4.8 y GPT-5.6 Sol. Incorpora control del presupuesto de razonamiento mediante el parámetro `reasoning_effort` (low, high, max) y una plantilla de chat con `clear_thinking`. Su licencia es propia (`glm-5.3`, catalogada como "other"), lo que exige revisar términos antes de uso comercial.

La relevancia actual radica en que es uno de los pocos modelos abiertos de escala ~750B que declara estado del arte en tareas de agentes CLI, descubrimiento de vulnerabilidades y explotación, además de soporte para despliegue en SGLang, vLLM, TokenSpeed, Transformers, KTransformers, Unsloth y plataformas Ascend NPU. El repositorio ocupa 755,7 GB y solo soporta inglés y chino de forma declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (glm_moe_dsa, según tag de transformers) |
| Parametros totales | 753.329.940.480 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (evaluaciones citadas con hasta 1M tokens y 300.000 tokens en HLE) |
| Tipos de cuantizacion | fp8 (según tag); otras no disponibles |
| Idiomas soportados | en, zh |
| Licencia | glm-5.3 (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que GLM-5.3 emplea una arquitectura Mixture-of-Experts identificada en transformers como `glm_moe_dsa`. El dato de parámetros totales (753.329.940.480) proviene de los safetensors del repositorio, pero no se especifica el número de parámetros activos por token ni la configuración de expertos (número de expertos, top-k, dimensión oculta). Tampoco se detalla la composición del dataset de entrenamiento ni el número de tokens vistos.

El aspecto técnico más relevante documentado es que GLM-5.3 comparte la base con GLM-5.2 y que todas las ganancias provienen del post-entrenamiento. La model card menciona que el escalado del post-entrenamiento produjo una "capacidad cibernética emergente" que superó las expectativas, con mejoras concentradas en la parte alta de la cadena de explotación. Se documenta también el uso de un parámetro `reasoning_effort` con tres niveles (low, high, max) para controlar el presupuesto de razonamiento, y una variable `clear_thinking` en la plantilla de chat. No se detalla si hubo RLHF, DPO u otras técnicas específicas de alineamiento.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento controlable vía `reasoning_effort` (low, high, max).
- Codificación avanzada: la model card lo describe como el modelo abierto más capaz para coding, con una mejora del 50% sobre GLM-5.2 en el benchmark interno Z.ai Code Bench.
- Tareas agénticas de horizonte largo: resultados destacados en Terminal Bench 3.0, Agents' Last Exam (ALE-CLI), SWE-Marathon y AutomationBench.
- Uso de herramientas (tool calling / function calling): evaluado en Toolathlon Verified (73,0) y HLE con herramientas (62,5).
- Razonamiento multi-paso con gestión de contexto: HLE se evalúa con contexto máximo de 300.000 tokens y estrategia de gestión de contexto.
- Capacidad cibernética: descubrimiento de vulnerabilidades (CyberGym 84,5) y explotación (ExploitGym, ExploitBench).
- Multilingüe limitado a inglés y chino según la model card.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Agentes de codificación autónomos en terminal: el modelo está optimizado para Terminal Bench 3.0 y DeepSWE, por lo que encaja en pipelines donde un agente ejecuta comandos, interpreta salidas y corrige código de forma iterativa en entornos CLI.
- Resolución de incidencias en repositorios (SWE): con resultados en SWE-Marathon (42,5) y NL2Repo (58,0), puede emplearse para generar parches y traducir especificaciones en lenguaje natural a estructura de repositorio.
- Automatización de operaciones y flujos de trabajo: AutomationBench 48,2 sugiere uso en orquestación de tareas administrativas y de sistemas con múltiples pasos y llamadas a herramientas.
- Auditoría de seguridad y pentesting asistido: CyberGym 84,5 y ExploitBench 54,4 lo sitúan como candidato para triaje de vulnerabilidades y análisis de cadenas de explotación en entornos controlados.
- Asistente de razonamiento con recuperación de contexto largo: la evaluación de HLE con 300.000 tokens de contexto y gestión de contexto permite usarlo en análisis de documentación extensa o bases de código grandes.
- Generación de código en producción con control de coste: el parámetro `reasoning_effort` permite rebajar el presupuesto de razonamiento en tareas rutinarias y elevarlo en tareas críticas, ajustando latencia y consumo.
- Evaluación comparativa de modelos en I+D: su disponibilidad de pesos safetensors y soporte en SGLang, vLLM y Transformers facilita reproducir benchmarks y comparar con alternativas propietarias.

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

Notas de evaluación de la model card: HLE con herramientas usa temperature=1.0, top_p=0.95, longitud máxima de generación de 163.840 tokens, contexto máximo de 300.000 tokens con gestión de contexto y GPT-5.6-luna (medium) como juez. NL2Repo se evalúa con temperature=1.0, top_p=1.0 y max_new_tokens=64k bajo contexto de 1M. DeepSWE se ejecuta con mini-swe-agent.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 753.329.940.480 parámetros, en fp8 se requerirían aproximadamente 750 GB solo para pesos; en cuantizaciones de 4 bits, del orden de 375 GB, sin contar caché KV ni overhead.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, el despliegue requiere múltiples aceleradores de gama alta (A100/H100/H200 o equivalentes) o nodos con memoria agregada suficiente.
- No cabe en GPU de consumo (RTX 4090, 24 GB) en ninguna cuantización razonable para el conjunto completo de pesos.
- Opciones de despliegue documentadas: SGLang, vLLM, TokenSpeed, Transformers, KTransformers, Unsloth y, en Ascend NPU, vLLM-Ascend, xLLM y SGLang.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|
| GLM-5.3 | 753.329.940.480 | no disponible (evals hasta 1M) | glm-5.3 (other) | Pesos abiertos en HF | CyberGym 84,5; AutomationBench 48,2; GDPval-AA v2 1769 |
| GLM-5.2 | no disponible | no disponible | no disponible | no disponible | Terminal Bench 3.0 4,6; DeepSWE 46,2 |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Toolathlon 76,5; SWE-Marathon 48,1 |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | no disponible | no disponible | CyberGym 83,3; Toolathlon 74,1 |
| Qwen3.8-Max | no disponible | no disponible | no disponible | no disponible | GDPval-AA v2 1739 |
| Opus 4.8 | no disponible | no disponible | propietaria | API | NL2Repo 69,7; SWE-Marathon 48,8 |

La comparativa se limita a los datos de la model card; no se dispone de parámetros, contexto ni licencia de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Idiomas declarados únicamente inglés y chino; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a modelos de lenguaje de gran escala; no se documentan tasas específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia `glm-5.3` catalogada como "other": es imprescindible revisar los términos completos antes de cualquier uso comercial o redistribución.
- El tamaño del repositorio (755,7 GB) y el número de parámetros implican requisitos de infraestructura elevados y costes de inferencia significativos.
- La model card advierte de una "capacidad cibernética emergente" con resultados altos en explotación; su uso en seguridad ofensiva debe enmarcarse en entornos autorizados y con controles.
- Para reproducción de benchmarks se debe mantener `reasoning_effort=max`; en chat se recomienda `clear_thinking=true`.
- No se documentan parámetros activos, configuración de expertos, composición del dataset ni detalles de alineamiento, lo que limita la evaluación técnica independiente.
- El modelo aparece publicado por la cuenta Sunyxity, no por la organización oficial zai-org; conviene verificar la procedencia y los pesos antes de desplegarlos en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Sunyxity/GLM-5.3
- Repositorio GitHub de la familia GLM-5: https://github.com/zai-org/GLM-5
- Cookbook de SGLang para GLM-5.3: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- Recetas de vLLM: https://recipes.vllm.ai/zai-org/GLM-5.3
- TokenSpeed: https://github.com/lightseekorg/tokenspeed
- Receta de TokenSpeed para GLM-5.3: https://lightseek.org/tokenspeed/recipes/models#glm-5-3
- Documentación de Transformers para glm_moe_dsa: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- Tutorial de KTransformers (GLM-5.2): https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Guía de Unsloth para GLM-5.3: https://unsloth.ai/docs/models/GLM-5.3
- Despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
- Paper de referencia (arXiv): arxiv:2602.15763
