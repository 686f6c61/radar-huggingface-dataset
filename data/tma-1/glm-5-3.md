# TMA-1/GLM-5.3

## Resumen

GLM-5.3 es un modelo de lenguaje de gran escala de tipo mezcla de expertos (MoE), con 753.329.940.480 parámetros (~753,3 mil millones) y pesos en safetensors con soporte de FP8. La model card lo atribuye al ecosistema Z.ai (repositorios `zai-org/GLM-5`), aunque el repositorio de HuggingFace que se analiza aquí está publicado por el usuario TMA-1, con 0 descargas y 0 likes en el momento de la consulta. Su etiqueta de arquitectura en transformers es `glm_moe_dsa`, lo que apunta a un transformer con mezcla de expertos y algún esquema de atención dispersa, si bien la model card no detalla la configuración interna.

El punto clave del modelo es que reutiliza exactamente el mismo modelo base que GLM-5.2: todas las mejoras declaradas provienen de la fase de post-entrenamiento. Según el autor, esto se traduce en una mejora del 50% sobre GLM-5.2 en su benchmark interno Z.ai Code Bench, además de resultados que presenta como estado del arte en pesos abiertos en Terminal Bench 3.0 y Agents' Last Exam, y un salto muy pronunciado en tareas de ciberseguridad ofensiva (ExploitGym pasa de 29/39 a 105/130).

Es relevante ahora porque ataca dos frentes que dominan la evaluación de modelos abiertos en 2026: agentes de larga duración con uso de herramientas y CLI, y generación de código en repositorios reales. A la vez, su capacidad emergente en explotación de vulnerabilidades lo convierte en un caso de estudio sobre riesgo de doble uso en modelos de pesos abiertos. No se declara en la información disponible ni el número de parámetros activos, ni la longitud de contexto oficial, ni los términos exactos de la licencia `glm-5.3` (registrada como `other`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE); identificada en transformers como `glm_moe_dsa`. No se detalla la configuración de expertos ni el mecanismo de atención en la informacion disponible |
| Parametros totales | 753.329.940.480 (~753,3 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible de forma oficial. Las notas de evaluacion mencionan contextos de hasta 300.000 tokens (HLE con herramientas) y 1M de contexto en NL2Repo |
| Tipos de cuantizacion | FP8 (etiqueta `fp8` y pesos de ~755,7 GB en el repo). No se listan otros formatos cuantizados en la informacion disponible |
| Idiomas soportados | Ingles y chino (en, zh) |
| Licencia | `other`, con `license_name: glm-5.3`. Terminos concretos no disponibles |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 755,7 GB |
| Fecha de publicacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de la etiqueta `glm_moe_dsa` que usa la libreria transformers para cargar el modelo. Eso implica una familia de mezcla de expertos, coherente con los 753,3 mil millones de parametros totales y con el uso de FP8 para reducir el peso de los pesos. No se especifica el numero de expertos, el numero de expertos activos por token, el ratio de activacion, ni si el mecanismo `dsa` corresponde a una atencion dispersa o a una variante propietaria. Tampoco se detalla si hay decodificacion especulativa nativa u otros trucos de inferencia.

Lo que si se declara con claridad es la estrategia de entrenamiento: GLM-5.3 comparte modelo base con GLM-5.2 y todas las ganancias proceden del post-entrenamiento. Esto incluye presumiblemente fases de ajuste supervisado y optimizacion por preferencias, orientadas especificamente a codigo complejo y a tareas de horizonte largo (agentes que ejecutan muchos pasos con herramientas). No se publica el numero de tokens del preentrenamiento, ni la composicion del dataset, ni los detalles de las fases de RLHF o DPO. Un elemento tecnico destacable que si aparece en la model card es el parametro `reasoning_effort`, que permite elegir entre tres niveles de presupuesto de razonamiento (`low`, `high`, `max`, con `max` por defecto), mas un flag `clear_thinking` en la plantilla de chat que por defecto vale `false`.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline declarado: `text-generation`).
- Codigo y tareas de repositorio: la model card lo presenta como el modelo de pesos abiertos mas capaz en codigo, con resultados en Terminal Bench, DeepSWE, NL2Repo, ProgramBench, FrontierSWE y SWE-Marathon.
- Razonamiento con presupuesto de pensamiento controlable mediante `reasoning_effort` (`low`, `high`, `max`).
- Uso de herramientas y function calling: evaluado en Toolathlon Verified (73,0) y en tareas con herramientas de HLE (62,5).
- Comportamiento agentico de largo horizonte: Agents' Last Exam (ALE-CLI) 28,5 y AutomationBench 48,2.
- Ciberseguridad: busqueda de vulnerabilidades (CyberGym 84,5) y explotacion (ExploitGym, ExploitBench).
- Multilingue limitado a ingles y chino.
- No se declara soporte de vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- Agente de codigo en terminal: el modelo esta entrenado y evaluado para operar en CLI con multiples pasos (Terminal Bench 3.0, 28,3), por lo que encaja en asistentes que editan repositorios, ejecutan tests y corrigen errores de forma autonoma.
- Migracion y refactorizacion de repositorios grandes: con contexto declarado de hasta 1M en la evaluacion de NL2Repo, puede procesar codebases extensas y traducir especificaciones en lenguaje natural a estructura de proyecto.
- Automatizacion de pipelines de CI/CD: soporta tool calling y razonamiento de varios pasos, de modo que puede integrarse como paso de revision de cambios, generacion de parches o triaje de fallos de build.
- Resolucion de incidencias de larga duracion: SWE-Marathon y Agents' Last Exam miden tareas que requieren decenas de acciones encadenadas, el escenario tipico de un agente de mantenimiento que investiga una regresion durante horas.
- Auditoria de seguridad y triaje de vulnerabilidades: CyberGym (84,5) y ExploitGym lo orientan a analisis de codigo en busca de fallos explotables dentro de programas de divulgacion responsable.
- Redaccion tecnica y documentacion de API en ingles o chino: su soporte bilingue permite generar documentacion a partir de codigo y mantenerla sincronizada en ambos idiomas.
- Atencion al cliente compleja con herramientas: con niveles de `reasoning_effort` ajustables, se puede bajar el coste por consulta en interacciones simples y subirlo en casos que requieran consultar sistemas internos.
- Evaluacion comparativa interna: util como modelo de referencia para medir el salto de post-entrenamiento frente a GLM-5.2 manteniendo la misma base.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor (no verificados de forma independiente). Se reproduce la tabla tal cual, con los valores mas altos de cada fila en negrita cuando el autor los resalta.

| Benchmark | GLM-5.3 | GLM-5.2 | Kimi K3 | DeepSeek-V4 Pro-0813 | Qwen3.8-Max | Opus 4.8 | Fable 5 (con fallback) | GPT-5.6 Sol |
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
| HLE con herramientas | 62,5 | 54,7 | 59,8 | 60,0 | 56,2 | 57,9 | 63,9 | **64,5** |
| GDPval-AA v2 | **1769** | 1508 | 1682 | 1590 | 1739 | 1588 | 1743 | 1730 |

Notas metodologicas declaradas por el autor: en HLE con herramientas se usa `temperature=1.0` y `top_p=0.95`, longitud maxima de generacion de 163.840 tokens, contexto maximo de 300.000 tokens con gestion de contexto, y GPT-5.6-luna (medium) como juez. En NL2Repo se usa `temperature=1.0`, `top_p=1.0` y `max_new_tokens=64k` con contexto de 1M, con filtros basados en reglas y en un LLM para evitar comportamientos maliciosos. La descripcion de DeepSWE queda cortada en la informacion proporcionada. No hay datos de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parametros (753,3 mil millones); no son cifras publicadas por el autor.

- Pesos en FP8: ~753 GB solo de pesos, mas cache KV y activaciones. El repositorio ocupa 755,7 GB, coherente con este formato.
- Pesos en BF16/FP16: ~1,5 TB solo de pesos.
- Cuantizacion de 4 bits: ~377 GB de pesos.
- Multi-GPU obligatorio en la practica: en FP8 hacen falta al menos 10 GPU H100 de 80 GB o 8 H200 de 141 GB; lo recomendable es tensor parallelism sobre 16 GPU H100/H200 con interconnect NVLink.
- En 4 bits, 8 GPU H100 de 80 GB (640 GB) son suficientes para los pesos, con margen para cache KV.
- No cabe en GPU de consumo: 24 GB de una RTX 4090 o 32 GB de una RTX 5090 quedan muy lejos incluso en 4 bits. KTransformers, que la model card menciona, permite descargar expertos a CPU y RAM del sistema, pero sigue requiriendo cientos de GB de memoria del host.
- Plataformas soportadas segun la model card: SGLang, vLLM, TokenSpeed, Transformers, KTransformers y Unsloth. En Ascend NPU se soportan vLLM-Ascend, xLLM y SGLang.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto declarado | Licencia | Pesos abiertos | Datos destacados |
|---|---|---|---|---|---|
| GLM-5.3 | 753,3 mil millones | no disponible | `glm-5.3` (`other`) | Si (safetensors, FP8) | CyberGym 84,5; ExploitGym 105/130; Terminal Bench 3.0 28,3 |
| GLM-5.2 | no disponible | no disponible | no disponible | Si, segun la model card comparte base | Misma base; usado como referencia de mejora por post-entrenamiento |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Toolathlon Verified 76,5; DeepSWE 67,5 |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | no disponible | no disponible | NL2Repo 61,1; CyberGym 83,3 |
| Qwen3.8-Max | no disponible | no disponible | no disponible | no disponible | GDPval-AA v2 1739 |

La informacion proporcionada solo permite comparar por resultados de benchmark, no por parametros, contexto, licencia ni disponibilidad de pesos de los competidores. Conviene tratar a Kimi K3, DeepSeek-V4 Pro-0813, Qwen3.8-Max, Opus 4.8, Fable 5 y GPT-5.6 Sol como modelos de referencia citados por el autor, sin datos tecnicos verificables en esta ficha.

## Limitaciones y advertencias

- La model card no declara parametros activos, contexto maximo oficial ni composicion del dataset de entrenamiento, lo que dificulta planificar el despliegue y estimar costes con precision.
- Todos los benchmarks son autodeclarados por el autor. No hay verificacion independiente en la informacion disponible.
- Riesgo de doble uso en ciberseguridad: el propio autor describe la capacidad ofensiva como "emergente" y reporta mas que duplicar a GLM-5.2 en benchmarks de explotacion. En pesos abiertos esto implica un riesgo real de uso malicioso (descubrimiento y explotacion de vulnerabilidades).
- Licencia `glm-5.3` registrada como `other`: no se detallan permisos de uso comercial, restricciones de redistribucion ni clausulas de uso aceptable. Hay que consultar el texto completo de la licencia antes de cualquier uso en produccion.
- Idiomas limitados a ingles y chino. No hay soporte declarado de castellano, lo que degradara el rendimiento en tareas en espanol.
- Riesgo de alucinacion en generacion de codigo y en tareas de agentes: los resultados de tipo SWE y terminal se miden con jueces y harness especificos, y no garantizan correccion en repositorios propios.
- El repositorio analizado pertenece al usuario TMA-1, no a la organizacion oficial del modelo, y registra 0 descargas y 0 likes. Es prudente verificar la procedencia e integridad de los pesos antes de usarlos.
- El parametro `reasoning_effort` por defecto es `max`, lo que encarece la inferencia si no se ajusta explicitamente; en chat conviene pasar `clear_thinking=true`.
- Los resultados de HLE con herramientas dependen de una estrategia de gestion de contexto y de GPT-5.6-luna como juez, condiciones dificiles de reproducir exactamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TMA-1/GLM-5.3
- Repositorio GitHub del proyecto (referenciado en la model card via raw.githubusercontent): https://github.com/zai-org/GLM-5
- SGLang: https://github.com/sgl-project/sglang y cookbook https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- vLLM: https://github.com/vllm-project/vllm y recetas https://recipes.vllm.ai/zai-org/GLM-5.3
- TokenSpeed: https://github.com/lightseekorg/tokenspeed y https://lightseek.org/tokenspeed/recipes/models#glm-5-3
- Documentacion de transformers para `glm_moe_dsa`: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Unsloth: https://unsloth.ai/docs/models/GLM-5.3
- Despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
- Paper referenciado en las etiquetas: arXiv 2602.15763 (no se proporciona URL en la informacion disponible)
- Los resultados de busqueda web obtenidos no son relevantes para este modelo: corresponden a "TMA" como Tierce Maintenance Applicative (https://fr.wikipedia.org/wiki/Tierce_maintenance_applicative, https://www.ipi-ecoles.com/tma/), a una empresa de gestion de residuos (https://tma.es/) y a un operador de transporte (https://bustma.com/fr/), sin relacion con el modelo.
