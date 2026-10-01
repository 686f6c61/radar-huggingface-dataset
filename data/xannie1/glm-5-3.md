# xannie1/GLM-5.3

## Resumen

GLM-5.3 es el modelo insignia de Z.ai (Zhipu AI) para ingeniería de software compleja y tareas de horizonte largo. Se trata de un transformer de tipo MoE (mixture of experts) con atención dispersa de estilo DeepSeek (etiqueta `glm_moe_dsa`), pesos nativos en FP8 y 753.329.940.480 parámetros totales según los safetensors del repositorio, lo que lo sitúa en la liga de los ~750B parámetros. La model card indica que emplea la misma base que GLM-5.2 y que todas las mejoras provienen exclusivamente del post-entrenamiento, no de cambios en el modelo base.

La relevancia de esta versión está en dos frentes. El primero es la codificación: Z.ai reporta una mejora del 50% sobre GLM-5.2 en su banco interno Z.ai Code Bench y afirma alcanzar estado del arte open source en Terminal Bench 3.0 y Agents' Last Exam. El segundo, y más delicado, es la capacidad emergente en ciberseguridad: el modelo es líder en CyberGym para descubrimiento de vulnerabilidades y más que duplica a GLM-5.2 en benchmarks de explotación, lo que convierte el uso responsable en un requisito explícito de despliegue.

El contexto operativo es de aproximadamente 1M de tokens según la documentación de terceros, con evaluaciones realizadas bajo 1M de contexto en NL2Repo y 300.000 tokens con gestión de contexto en HLE con herramientas. El modelo admite control del presupuesto de razonamiento mediante el parámetro `reasoning_effort` (low, high, max; por defecto max) y soporte nativo de tool calling, lo que lo orienta a flujos agénticos de múltiples pasos sobre repositorios y terminales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa tipo DeepSeek (`glm_moe_dsa`) |
| Parametros totales | 753.329.940.480 (~753B), dato de safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | ~1M tokens según openlm.ai y la evaluación NL2Repo; 300.000 tokens en la evaluación de HLE con herramientas. La model card del repositorio consultado no declara la ventana de forma explícita |
| Tipos de cuantizacion | FP8 nativo (etiqueta `fp8`); otras cuantizaciones no detalladas en la información disponible |
| Idiomas soportados | en, zh (inglés y chino) |
| Licencia | `other` con `license_name: glm-5.3` (licencia propia); openlm.ai la describe como MIT, dato no confirmado en la model card consultada |
| Formato de pesos | safetensors (tamaño del repositorio: 755,7 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos (MoE) con atención dispersa (DSA, DeepSeek-style sparse attention), según la etiqueta `glm_moe_dsa` del repositorio y la descripción de NVIDIA NIM ("753B-parameter text MoE with DeepSeek-style sparse attention, native FP8 weights"). El modelo se distribuye con pesos nativos en FP8, lo que reduce a la mitad el footprint frente a BF16 y explica en parte los 755,7 GB del repositorio. No se dispone del número de expertos, del ratio de activación ni del número de capas en la información proporcionada.

El punto diferencial de GLM-5.3 no está en el preentrenamiento: la model card afirma que usa el mismo modelo base que GLM-5.2 y que todas las ganancias provienen del post-entrenamiento. Se reportan incrementos muy grandes en tareas de horizonte largo (Terminal Bench 3.0 pasa de 4,6 a 28,3; ExploitBench de 24,4 a 54,4), lo que sugiere un esfuerzo intensivo en datos y recompensas orientados a agentes, uso de herramientas y ejecución sostenida. La documentación menciona también una capacidad emergente en ciberseguridad que "se desarrolló más rápido de lo esperado" al escalar el post-entrenamiento. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF, DPO u otras técnicas concretas.

## Capacidades

- Generación de texto conversacional y razonamiento en inglés y chino.
- Codificación avanzada: resolución de tareas de ingeniería de software sobre repositorios, con resultados destacados en SWE-Marathon, DeepSWE, NL2Repo y ProgramBench.
- Tareas de horizonte largo con múltiples pasos y ejecución sostenida en terminal (Terminal Bench 2.1 y 3.0, Agents' Last Exam en modo CLI).
- Tool calling y uso de herramientas: Toolathlon Verified (73,0) y HLE con herramientas (62,5) indican soporte sólido de function calling y orquestación de herramientas externas.
- Control del presupuesto de razonamiento mediante `reasoning_effort` con tres niveles (`low`, `high`, `max`), por defecto `max`.
- Capacidad en ciberseguridad: descubrimiento de vulnerabilidades (CyberGym 84,5) y explotación (ExploitBench 54,4; ExploitGym 105/130 en ventanas de 2h/6h).
- Gestión de contexto largo, con evaluaciones realizadas a 300.000 tokens con estrategia de gestión de contexto y 1M en NL2Repo.
- No se documentan capacidades de visión, audio ni generación multimodal en la información disponible.

## Casos de uso

- Agentes de ingeniería de software autónomos: el modelo puede clonar un repositorio, leer el código, ejecutar tests y abrir parches en un bucle de varios pasos. Sus resultados en SWE-Marathon v1.1 (42,5) y FrontierSWE (78,1) lo hacen adecuado para tareas de mantenimiento que requieren decenas de turnos de razonamiento.
- Automatización de terminal y operaciones (CLI agents): con 28,5 en Agents' Last Exam (ALE-CLI) y soporte de tool calling, encaja en flujos que ejecutan comandos, interpretan salidas y corrigen errores de forma iterativa.
- Migración y refactorización a gran escala: NL2Repo (58,0) indica capacidad para pasar de lenguaje natural a estructuras de repositorio completas, útil para generar esqueletos de proyecto o portar módulos entre lenguajes.
- Revisión de código en pipelines de CI/CD: integrado mediante API o servidor vLLM/SGLang, puede analizar diffs, detectar regresiones y proponer correcciones antes del merge, con el presupuesto de razonamiento ajustado a `low` para reducir latencia.
- Auditoría de seguridad y triaje de vulnerabilidades: CyberGym (84,5) lo posiciona para análisis estático asistido y priorización de hallazgos. Requiere sandboxing estricto y control de acceso por el riesgo de doble uso.
- Asistencia a investigación en matemáticas y razonamiento con herramientas: HLE con herramientas (62,5) con generación de hasta 163.840 tokens permite cadenas de razonamiento prolongadas apoyadas en calculadora, intérprete de código o búsqueda.
- Automatización de procesos empresariales: AutomationBench v1.0.6 (48,2) sugiere utilidad en flujos que combinan varias APIs y sistemas internos mediante function calling.
- Atención al cliente técnica multilingüe (inglés y chino) con contexto largo, aprovechando la ventana amplia para mantener el historial completo de incidencias y documentación asociada.

## Benchmarks y rendimiento

Datos publicados en la model card del repositorio consultado. No se han verificado de forma independiente.

| Benchmark | GLM-5.3 | GLM-5.2 | Kimi K3 | DeepSeek-V4 Pro-0813 | Qwen3.8-Max | Opus 4.8 | Fable 5 (w/ fallback) | GPT-5.6 Sol |
|---|---|---|---|---|---|---|---|---|
| Terminal Bench 2.1 | 88,2 | 81,0 | 88,3 | 87,9 | 86,6 | 85,0 | 88,0 | 88,8 |
| Terminal Bench 3.0 | 28,3 | 4,6 | 17,4 | – | – | 21,1 | 33,7 | 34,6 |
| DeepSWE (v1.1) | 66,9 | 46,2 | 67,5 | 62,7 | 56,6 | 58,0 | 69,7 | 72,7 |
| NL2Repo | 58,0 | 48,9 | 58,0 | 61,1 | 55,9 | 69,7 | – | – |
| ProgramBench (Almost Solved) | 19,0 | 9,5 | 17,5 | – | 10,5 | 15,5 | 33,0 | 23,0 |
| FrontierSWE | 78,1 | 67,5 | – | – | – | 66,5 | 88,2 | – |
| SWE-Marathon (v1.1) | 42,5 | 19,4 | 48,1 | – | – | 48,8 | 33,1 | 42,5 |
| PostTrainBench | 39,8 | 31,7 | 32,0 | – | – | 32,9 | 41,8 | 36,2 |
| CyberGym | 84,5 | 77,2 | 80,0 | 83,3 | 78,5 | 78,1 | 83,8 | 83,6 |
| ExploitGym (2h / 6h) | 105 / 130 | 29 / 39 | 36 / 70 | – | 14 / 26 | 80 / 120 | 181 / 247 | 216 / 293 |
| ExploitBench | 54,4 | 24,4 | 32,2 | – | 28,8 | 40,0 | 78,0 | 76,5 |
| Toolathlon Verified | 73,0 | 59,9 | 76,5 | 74,1 | 72,5 | 76,2 | 74,7 | 74,9 |
| AutomationBench (v1.0.6) | 48,2 | 26,2 | 46,7 | 43,2 | 39,8 | 41,0 | 46,2 | 45,8 |
| Agents' Last Exam (ALE-CLI) | 28,5 | 23,8 | 27,6 | 25,7 | 27,0 | 25,7 | 23,8 | 28,6 |
| HLE w/ Tools | 62,5 | 54,7 | 59,8 | 60,0 | 56,2 | 57,9 | 63,9 | 64,5 |
| GDPval-AA v2 | 1769 | 1508 | 1682 | 1590 | 1739 | 1588 | 1743 | 1730 |

Notas de evaluación recogidas en la model card: HLE con herramientas usa `temperature=1.0`, `top_p=0.95`, longitud máxima de generación de 163.840 tokens, contexto máximo de 300.000 tokens con gestión de contexto y GPT-5.6-luna (medium) como juez. NL2Repo usa `temperature=1.0`, `top_p=1.0` y `max_new_tokens=64k` bajo contexto de 1M, con filtros basados en reglas y en un LLM para evitar comportamientos maliciosos. No se han publicado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- VRAM estimada en FP8: del orden de 755 GB solo para pesos, más caché KV. No es un cálculo oficial; se deriva del tamaño del repositorio de safetensors.
- Configuración mínima razonable en FP8: 12 GPU de 80 GB (960 GB) para pesos y margen de caché; 16 GPU de 80 GB (1.280 GB) ofrece holgura. Con B200 de 192 GB, 8 GPU (1.536 GB) serían suficientes.
- Cuantización a 4 bits (si estuviera disponible) reduciría los pesos a aproximadamente 380-400 GB, lo que permitiría 6-8 GPU de 80 GB, pero esta opción no está confirmada en la información disponible.
- GPU de consumo: no cabe. 753B parámetros exceden con creces los 24 GB de una RTX 4090, los 32 GB de una RTX 5090 o los 48 GB de una RTX 6000 Ada. No es desplegable en una sola GPU de consumo ni en configuraciones de 2-4 GPU de consumo con cuantización agresiva.
- Despliegue con offload a CPU/RAM: KTransformers está soportado oficialmente (tutorial GLM-5.2, aplicable a esta familia), lo que permitiría ejecutar con GPU reducida y del orden de 800 GB de RAM en FP8 o ~400 GB en 4 bits. El rendimiento sería muy inferior al de un clúster completo de GPU.
- Frameworks soportados: SGLang, vLLM, TokenSpeed, Transformers (documentación `glm_moe_dsa`), KTransformers y Unsloth. En plataforma Ascend NPU se soportan vLLM-Ascend, xLLM y SGLang.
- Latencia y throughput: no disponible. No se publican cifras de tokens por segundo ni de TTFT en la información proporcionada.

## Comparativa con modelos similares

Los parámetros y licencias de los modelos comparados no están disponibles en la información recogida; solo se dispone de sus resultados en los benchmarks de la model card.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Posicion relativa en benchmarks |
|---|---|---|---|---|---|
| GLM-5.3 | ~753B (MoE) | ~1M tokens (según openlm.ai) | `other` / `glm-5.3` | Pesos abiertos en HF y GitHub de zai-org; servido en NIM | Mejor de la comparativa en CyberGym, AutomationBench y GDPval-AA v2; competitivo en coding |
| GLM-5.2 | no disponible | no disponible | no disponible | Pesos abiertos (misma familia) | Predecesor directo; mismo modelo base, peor post-entrenamiento |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Superior en Toolathlon Verified (76,5) y SWE-Marathon (48,1); muy inferior en explotación |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | no disponible | no disponible | Comparable en Terminal Bench 2.1 y superior en NL2Repo (61,1) |
| Qwen3.8-Max | no disponible | no disponible | no disponible | no disponible | Rendimiento inferior en la mayoría de tareas agénticas según esta tabla |

Alternativas de la misma categoría (~700B+ en abierto para coding y agentes): GLM-5.2, Kimi K3 y DeepSeek-V4 en sus versiones más recientes. No se dispone de datos de licencia, tamaño o contexto de esos modelos en la información proporcionada.

## Limitaciones y advertencias

- Repositorio de terceros: `xannie1/GLM-5.3` no es la cuenta oficial de Z.ai. Tiene 0 descargas y 0 likes, y se creó y actualizó el mismo día. Para uso en producción conviene verificar los pesos contra el repositorio oficial de zai-org antes de descargar 755,7 GB.
- Riesgo de doble uso en ciberseguridad: el propio autor documenta capacidades de explotación emergentes (ExploitBench 54,4 frente a 24,4 de GLM-5.2). Debe desplegarse con sandboxing, aislamiento de red y controles de acceso, y evaluar implicaciones legales en la UE y en la jurisdicción de uso.
- Alucinación: no hay datos publicados de tasas de alucinación. En tareas de horizonte largo con muchas herramientas, los errores pueden acumularse entre pasos; se recomienda verificación intermedia y límites de iteraciones.
- Idiomas: solo inglés y chino declarados. El rendimiento en castellano no está medido, y no hay benchmarks multilingües en la información disponible.
- Licencia: la etiqueta es `other` con `license_name: glm-5.3`, no una licencia estándar OSI. Hay una discrepancia con openlm.ai, que afirma licencia MIT. Es imprescindible leer el texto completo de la licencia antes de un uso comercial.
- Contexto: la cifra de 1M tokens proviene de fuentes secundarias. Las evaluaciones citadas usan 300.000 tokens con gestión de contexto, lo que sugiere que el rendimiento efectivo a 1M puede degradarse.
- Configuración de razonamiento: el valor por defecto de `reasoning_effort` es `max`, lo que incrementa latencia y coste. Para benchmarks y reproducción de leaderboards se debe mantener `max`; para producción conviene evaluar `low` o `high`.
- Plantilla de chat: `clear_thinking` es `false` por defecto; en escenarios conversacionales la model card recomienda pasar explícitamente `clear_thinking=true`, de lo contrario el historial de razonamiento puede acumularse.
- Coste de infraestructura: por encima de 750 GB de pesos, el despliegue propio exige clúster multi-GPU o offload a RAM, con costes operativos muy altos.
- Benchmarks no verificados: todos los números provienen de la model card del autor y de fuentes afiliadas. No se han encontrado evaluaciones independientes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/xannie1/GLM-5.3
- Documentación oficial de Z.ai: https://docs.z.ai/guides/llm/glm-5.3
- Blog de anuncio: https://z.ai/blog/glm-5.3
- Repositorio GitHub de la familia GLM-5: https://github.com/zai-org/GLM-5
- Ficha en openlm.ai: https://openlm.ai/glm-5.3/
- NVIDIA NIM: https://build.nvidia.com/z-ai/glm-5-3
- Referencia arXiv citada en las etiquetas: arxiv:2602.15763
- SGLang, cookbook: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- vLLM, recetas: https://recipes.vllm.ai/zai-org/GLM-5.3
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#glm-5-3
- Transformers, documentación de `glm_moe_dsa`: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- KTransformers, tutorial: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Unsloth, guía: https://unsloth.ai/docs/models/GLM-5.3
- Ejemplo de despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
