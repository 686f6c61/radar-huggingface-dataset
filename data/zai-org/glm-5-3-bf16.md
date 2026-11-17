# zai-org/GLM-5.3-BF16

## Resumen

GLM-5.3-BF16 es un modelo de lenguaje de gran escala desarrollado por Z.ai (zai-org), publicado en Hugging Face bajo la licencia propietaria `glm-5.3`. Se trata de un transformer de tipo mezcla de expertos (MoE) con 753.329.940.480 parámetros totales, distribuido en pesos BF16 y orientado a generación de texto y conversación. Su relevancia radica en que reutiliza la misma base que GLM-5.2 y concentra todas las mejoras en el post-entrenamiento, lo que se traduce en avances notables en tareas de código complejo y razonamiento de horizonte largo.

El modelo declara estado del arte en pesos abiertos para programación, con una mejora del 50% sobre GLM-5.2 en el benchmark interno Z.ai Code Bench, y resultados destacados en Terminal Bench 3.0, Agents' Last Exam, CyberGym y ExploitBench. Incorpora además una capacidad emergente en ciberseguridad (descubrimiento de vulnerabilidades y explotación) que el propio autor señala como consecuencia del escalado del post-entrenamiento.

La ficha se basa exclusivamente en la información publicada en Hugging Face y en la model card del autor. Los datos no disponibles se indican explícitamente como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `glm_moe_dsa`) |
| Parametros totales | 753.329.940.480 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card (se documenta evaluación con hasta 300.000 y 1M tokens en benchmarks concretos) |
| Tipos de cuantizacion | no disponible (el repo publicado es BF16) |
| Idiomas soportados | en, zh |
| Licencia | `glm-5.3` (license: other) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos identificado en los tags como `glm_moe_dsa`. El modelo comparte la base con GLM-5.2: según la model card, "every gain comes from post-training", es decir, no hay cambios en el modelo base y todas las mejoras provienen de la fase de post-entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas de RLHF o DPO.

La innovación técnica más destacable documentada es la capacidad de controlar el presupuesto de razonamiento mediante el parámetro `reasoning_effort`, con tres niveles (`low`, `high`, `max`) y valor por defecto `max`. La plantilla de chat incluye además el parámetro `clear_thinking`, que por defecto es `false` y que el autor recomienda pasar explícitamente como `true` en escenarios conversacionales. No se detallan en la información proporcionada otras innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Razonamiento complejo con presupuesto de pensamiento configurable mediante `reasoning_effort` (`low`, `high`, `max`).
- Programación de alta complejidad: el autor lo posiciona como el modelo de pesos abiertos más capaz en código, con mejoras del 50% sobre GLM-5.2 en Z.ai Code Bench.
- Tareas de horizonte largo y agentes autónomos: resultados SOTA en Terminal Bench 3.0 y Agents' Last Exam (ALE-CLI).
- Uso de herramientas (tool calling / function calling): evaluado en Toolathlon Verified y AutomationBench.
- Razonamiento con herramientas externas: HLE w/ Tools.
- Capacidad emergente en ciberseguridad: descubrimiento de vulnerabilidades (CyberGym) y explotación (ExploitGym, ExploitBench).
- Capacidad de operar sobre contextos muy extensos en evaluaciones concretas (hasta 300.000 tokens en HLE w/ Tools y 1M en NL2Repo, con estrategia de gestión de contexto).
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Automatización de tareas de ingeniería de software en terminal: el modelo obtiene 28,3 en Terminal Bench 3.0 y 88,2 en Terminal Bench 2.1, por lo que es adecuado para agentes que ejecutan comandos, depuran entornos y resuelven incidencias en CLI de forma autónoma.
- Generación y refactorización de código en producción: con 66,9 en DeepSWE v1.1 y 78,1 en FrontierSWE, puede integrarse en pipelines de revisión y generación de parches sobre repositorios reales.
- Migración de especificaciones a repositorios completos (NL2Repo): con 58,0 en NL2Repo y evaluación bajo contexto de 1M tokens, sirve para transformar documentación o requisitos en estructuras de proyecto completas.
- Agentes multi-paso con uso de herramientas: 73,0 en Toolathlon Verified y 48,2 en AutomationBench lo hacen apto para orquestación de flujos con APIs, hojas de cálculo y sistemas externos.
- Auditoría de seguridad y descubrimiento de vulnerabilidades: 84,5 en CyberGym y 54,4 en ExploitBench permiten emplearlo en programas de bug bounty internos y análisis de superficies de ataque, siempre con supervisión humana.
- Asistencia a investigación técnica con recuperación de herramientas: 62,5 en HLE w/ Tools y 1769 en GDPval-AA v2 lo sitúan como candidato para tareas de análisis económico-administrativo y respuesta asistida por herramientas.
- Razonamiento de horizonte largo en tareas de mantenimiento: 42,5 en SWE-Marathon v1.1 y 39,8 en PostTrainBench indican utilidad en trabajos que requieren decenas de pasos encadenados.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor (el mejor valor de cada fila en negrita según la tabla original):

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

Notas metodológicas de la model card: HLE w/ Tools se evalúa con `temperature=1.0`, `top_p=0.95`, longitud máxima de generación de 163.840 tokens, contexto máximo de 300.000 tokens y GPT-5.6-luna (medium) como juez. NL2Repo se evalúa con `temperature=1.0`, `top_p=1.0`, `max_new_tokens=64k` bajo contexto de 1M y con juicio basado en reglas y LLM para evitar comportamientos maliciosos.

## Requisitos de hardware

- El repo publicado ocupa 1506,7 GB en BF16, por lo que la inferencia en precisión completa requiere un nodo multi-GPU de gama alta; no cabe en ninguna GPU consumer individual.
- No se dispone de información sobre cuantizaciones oficiales ni sobre el tamaño de los pesos en GGUF, AWQ o GPTQ; los requisitos de VRAM para formatos cuantizados no están disponibles.
- El número de parámetros activos no está documentado, de modo que no puede estimarse con precisión la VRAM efectiva por token generado.
- Frameworks de despliegue soportados según el autor: SGLang, vLLM, TokenSpeed, Transformers, KTransformers y Unsloth.
- Soporte adicional para plataforma Ascend NPU mediante vLLM-Ascend, xLLM y SGLang.
- No se publican datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|
| GLM-5.3 | 753,3 B (MoE) | no disponible | `glm-5.3` (other) | Pesos abiertos en HF (BF16) | SOTA en CyberGym (84,5) y AutomationBench (48,2) |
| GLM-5.2 | no disponible | no disponible | no disponible | Referencia en la model card | 81,0 en Terminal Bench 2.1; 46,2 en DeepSWE |
| Kimi K3 | no disponible | no disponible | no disponible | Referencia en la model card | 76,5 en Toolathlon Verified; 88,3 en Terminal Bench 2.1 |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | no disponible | Referencia en la model card | 87,9 en Terminal Bench 2.1; 61,1 en NL2Repo |
| Qwen3.8-Max | no disponible | no disponible | no disponible | Referencia en la model card | 1739 en GDPval-AA v2; 86,6 en Terminal Bench 2.1 |

Los datos de parámetros, contexto y licencia de los modelos comparados no se detallan en la información proporcionada y se marcan como no disponibles.

## Limitaciones y advertencias

- Solo se declaran idiomas inglés y chino; el rendimiento en castellano no está evaluado ni garantizado.
- La licencia `glm-5.3` es de tipo "other": no se especifican en la información disponible los términos exactos de uso comercial, por lo que es imprescindible revisar el texto completo de la licencia antes de desplegarlo en producción.
- El modelo presenta capacidades emergentes de explotación de vulnerabilidades (ExploitGym, ExploitBench) que suponen un riesgo de uso dual; requiere controles de acceso y supervisión.
- Riesgo de alucinación no cuantificado en la información disponible; los benchmarks publicados son del propio autor y no se han verificado de forma independiente.
- El tamaño del repo (1506,7 GB) y la ausencia de cuantizaciones documentadas limitan el despliegue en infraestructura modesta.
- El parámetro `reasoning_effort` tiene como valor por defecto `max`, lo que incrementa el coste computacional si no se ajusta explícitamente.
- En conversación, `clear_thinking` es `false` por defecto; el autor recomienda pasar `true` de forma explícita, lo que puede provocar comportamientos inesperados si se omite.
- No se documentan sesgos conocidos, limitaciones de contexto ni latencias en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zai-org/GLM-5.3-BF16
- Paper (referencia arXiv): https://arxiv.org/abs/2602.15763
- Repositorio del proyecto GLM-5: https://github.com/zai-org/GLM-5
- Cookbook de SGLang para GLM-5.3: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- Repositorio de SGLang: https://github.com/sgl-project/sglang
- Recetas de vLLM para GLM-5.3: https://recipes.vllm.ai/zai-org/GLM-5.3
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- TokenSpeed (LightSeek): https://github.com/lightseekorg/tokenspeed
- Recetas de TokenSpeed para GLM-5.3: https://lightseek.org/tokenspeed/recipes/models#glm-5-3
- Documentación de Transformers para `glm_moe_dsa`: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- Tutorial de KTransformers para GLM-5.2: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Guía de Unsloth para GLM-5.3: https://unsloth.ai/docs/models/GLM-5.3
- Despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
- Gráfico de benchmarks: https://raw.githubusercontent.com/zai-org/GLM-5/refs/heads/main/resources/bench_53_2.png
