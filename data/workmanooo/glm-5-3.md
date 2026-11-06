# workmanooo/GLM-5.3

## Resumen

GLM-5.3 es un modelo de lenguaje de gran escala desarrollado por Z.ai (organismo detrás de la familia GLM) y publicado en Hugging Face a través del repositorio `workmanooo/GLM-5.3`. Se trata de un transformer de tipo Mixture of Experts (MoE) con 753.329.940.480 parámetros totales almacenados en safetensors, y comparte la misma base preentrenada que GLM-5.2: todas las mejoras de la versión 5.3 provienen exclusivamente de la fase de post-entrenamiento. El modelo está orientado a generación de texto, razonamiento complejo, código y tareas de horizonte largo, e incorpora un modo de razonamiento controlable mediante el parámetro `reasoning_effort`.

La relevancia de esta versión radica en su salto cualitativo en capacidades de programación y agentes autónomos: según la model card, mejora un 50% respecto a GLM-5.2 en el benchmark interno Z.ai Code Bench y alcanza estado del arte open-weights en Terminal Bench 3.0 y Agents' Last Exam. Además, emerge una capacidad destacada en ciberseguridad ofensiva (descubrimiento de vulnerabilidades y explotación), con resultados líderes en CyberGym y mejoras superiores al doble en benchmarks de explotación.

El modelo está publicado con licencia `glm-5.3` (categoría "other"), soporta únicamente inglés y chino, y se distribuye en formato safetensors con un tamaño de repositorio de 755,7 GB. Su despliegue requiere infraestructura de GPU de gama alta y frameworks especializados como SGLang, vLLM o KTransformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), tipo `glm_moe_dsa` |
| Parametros totales | 753.329.940.480 (~753,3 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (la evaluacion de HLE w/ tools se realizo con contexto maximo de 300.000 tokens) |
| Tipos de cuantizacion | fp8 (tag del repositorio); no se detallan otros formatos |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | glm-5.3 (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLM-5.3 es un transformer de tipo Mixture of Experts identificado en el repositorio con la arquitectura `glm_moe_dsa`. Reutiliza el mismo modelo base que GLM-5.2, de modo que la arquitectura y el preentrenamiento no cambian entre ambas versiones; el incremento de capacidades se atribuye íntegramente al post-entrenamiento. El repositorio incluye pesos en fp8 y está etiquetado como compatible con endpoints, lo que facilita su integración en infraestructuras de inferencia existentes.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas de RLHF o DPO. Sí se documenta una innovación operativa relevante: el control del presupuesto de razonamiento mediante el parámetro `reasoning_effort`, que acepta tres niveles (`low`, `high`, `max`) y cuyo valor por defecto es `max`. Asimismo, la plantilla de chat incorpora el parámetro `clear_thinking`, que por defecto es `false` y que en escenarios conversacionales conviene establecer explícitamente a `true`. No se dispone de información sobre decodificación especulativa, atención lineal u otras optimizaciones internas.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento configurable mediante `reasoning_effort` (`low`, `high`, `max`).
- Programación avanzada: la model card la describe como la capacidad más fuerte del modelo, con mejoras del 50% en Z.ai Code Bench respecto a GLM-5.2.
- Tareas de horizonte largo y agentes autónomos multi-paso, con resultados destacados en Terminal Bench 3.0, Agents' Last Exam, AutomationBench y Toolathlon.
- Uso de herramientas y function calling, evidenciado por los resultados en Toolathlon Verified y HLE w/ Tools.
- Capacidades emergentes de ciberseguridad: descubrimiento de vulnerabilidades (CyberGym) y explotación (ExploitGym, ExploitBench).
- Razonamiento con herramientas externas en contexto extendido (evaluado con hasta 300.000 tokens de contexto y gestión de contexto).
- Capacidades multilingües limitadas a inglés y chino.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Desarrollo de software asistido en producción: el modelo puede generar, refactorizar y depurar código en pipelines de CI/CD, con soporte de tool calling y un rendimiento SOTA en Terminal Bench 3.0 (28,3) que lo hace adecuado para tareas de ingeniería reales más allá de fragmentos aislados.
- Agentes autónomos de larga duración: con `reasoning_effort=max` y gestión de contexto de hasta 300.000 tokens, puede ejecutar tareas multi-paso como migraciones de repositorios, resolución de incidencias o automatización de flujos de trabajo (AutomationBench 48,2).
- Auditoría de seguridad y pentesting autorizado: sus resultados en CyberGym (84,5) y ExploitBench (54,4) lo sitúan como candidato para revisión de vulnerabilidades en entornos controlados, siempre con supervisión humana y dentro de marcos legales.
- Automatización de operaciones de terminal y DevOps: su alto rendimiento en Terminal Bench 2.1 (88,2) permite integrarlo en asistentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos tipo shell.
- Generación de repositorios completos a partir de especificaciones: el benchmark NL2Repo (58,0) sugiere utilidad para prototipado rápido de proyectos a partir de descripciones en lenguaje natural.
- Atención al cliente técnica bilingüe (inglés/chino): puede gestionar conversaciones multi-turno con contexto amplio, aunque su cobertura lingüística se limita a esos dos idiomas.
- Investigación en razonamiento con herramientas: útil como modelo de referencia para experimentos que combinan búsqueda, cálculo y razonamiento en contexto largo (HLE w/ Tools 62,5).

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

Notas de evaluación publicadas en la model card: HLE w/ tools se evaluó con `temperature=1.0`, `top_p=0.95`, longitud máxima de generación de 163.840 tokens y contexto máximo de 300.000 tokens con gestión de contexto, usando GPT-5.6-luna (medium) como juez. NL2Repo se evaluó con `temperature=1.0`, `top_p=1.0` y `max_new_tokens=64k` bajo contexto de 1M. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 753,3 mil millones de parámetros, los pesos en fp8 requieren del orden de cientos de GB de memoria, lo que descarta su ejecución en una única GPU consumer.
- GPU recomendadas: no se especifican en la información proporcionada; por tamaño, requiere nodos multi-GPU de clase datacenter (A100, H100 o superiores).
- Cabe en consumer GPU: no, con los datos disponibles no es viable en GPUs de consumo.
- Opciones de despliegue documentadas: SGLang (con cookbook específico), vLLM (con recipes), TokenSpeed, Transformers (documentación `glm_moe_dsa`), KTransformers (tutorial para GLM-5.2) y Unsloth. En plataforma Ascend NPU se soportan vLLM-Ascend, xLLM y SGLang.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|
| GLM-5.3 | 753,3 mil M (MoE) | no disponible (evaluado a 300k) | glm-5.3 (other) | Hugging Face, safetensors fp8 | SOTA open en CyberGym (84,5) y AutomationBench (48,2) |
| GLM-5.2 | mismo base que 5.3 | no disponible | glm-5.2 | Hugging Face | Inferior en todos los benchmarks de agente y código |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Ligeramente superior en Toolathlon (76,5), inferior en CyberGym y AutomationBench |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | no disponible | no disponible | Superior en NL2Repo (61,1), inferior en código agéntico y ciberseguridad |

No se dispone de datos de parámetros, contexto ni licencia de los modelos comparados en la información proporcionada, por lo que la comparativa se limita a los resultados de benchmark publicados.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino; no hay soporte declarado para castellano ni otros idiomas.
- Riesgo de alucinación: no se documenta una evaluación específica de veracidad o tasa de alucinación; como todo modelo generativo, requiere validación en producción.
- Sesgos: no se publica información sobre sesgos conocidos ni sobre el proceso de alineación empleado.
- Licencia: la licencia `glm-5.3` (categoría "other") no se detalla en la información disponible; es imprescindible revisar los términos completos antes de cualquier uso comercial.
- Capacidad dual de ciberseguridad: el modelo muestra capacidades emergentes de explotación (ExploitGym, ExploitBench) que exigen controles de uso y supervisión para evitar usos maliciosos.
- Requisitos de infraestructura: el tamaño del repositorio (755,7 GB) y el número de parámetros implican un despliegue costoso y complejo, no apto para entornos de recursos limitados.
- Configuración de razonamiento: el valor por defecto de `reasoning_effort` es `max`, lo que incrementa el coste computacional; en chat debe pasarse `clear_thinking=true` explícitamente para evitar comportamientos no deseados.
- Contexto: la longitud máxima de contexto no está declarada en la información disponible; solo se conoce que las evaluaciones usaron hasta 300.000 tokens.

## Enlaces

- Hugging Face: https://huggingface.co/workmanooo/GLM-5.3
- Paper (referencia arXiv en tags): arxiv:2602.15763
- Repositorio GLM-5 (zai-org): https://github.com/zai-org/GLM-5
- Cookbook SGLang para GLM-5.3: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- Recipes vLLM para GLM-5.3: https://recipes.vllm.ai/zai-org/GLM-5.3
- TokenSpeed (recetas): https://lightseek.org/tokenspeed/recipes/models#glm-5-3
- Documentación Transformers `glm_moe_dsa`: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- Tutorial KTransformers GLM-5.2: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Guía Unsloth GLM-5.3: https://unsloth.ai/docs/models/GLM-5.3
- Despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
