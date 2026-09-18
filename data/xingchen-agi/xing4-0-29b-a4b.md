# XingChen-AGI/Xing4.0-29B-A4B

## Resumen

Xing4.0-29B-A4B es un modelo de lenguaje de arquitectura mezcla de expertos (MoE) desarrollado por XingChen-AGI (China Telecom Artificial Intelligence Technology Co., Ltd.), continuacion de la serie TeleChat. Cuenta con 29.000 millones de parametros totales y solo 4.000 millones activos por token, con una ventana de contexto nativa de 256.000 tokens ampliable a 512.000. Esta disenado especificamente para tareas de ingenieria complejas, planificacion multi-paso y ejecucion de cadenas de razonamiento largas.

El modelo emplea una arquitectura propia denominada mHC + MLA + MTP y, segun su model card, es el primero de su escala entrenado integramente sobre la plataforma Ascend NPU con el framework MindSpore. Su relevancia actual reside en que demuestra que es posible entrenar un MoE de gran contexto fuera del ecosistema GPU convencional y mantener compatibilidad con los principales frameworks de inferencia (vLLM, SGLang, KTransformers) y de ajuste fino (LLaMA-Factory, MindFormers).

Se distribuye bajo licencia Apache 2.0 en formato safetensors, con un repositorio de 62,4 GB, lo que facilita su integracion y despliegue en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con mHC + MLA + MTP |
| Parametros totales | 29B declarados (31.215.031.088 segun los pesos safetensors) |
| Parametros activos | 4B por token |
| Longitud de contexto | 256K tokens, ampliable a 512K |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Numero de capas | 40 |
| Tamano oculto | 3.584 |
| Tamano intermedio FFN denso | 9.216 |
| Tamano intermedio por experto | 1.024 |
| Tipo de atencion | MLA (Multi-head Latent Attention) |
| Expertos enrutados | 64 |
| Expertos activos por token | 4 |
| Expertos compartidos | 1 |
| Tamano del repositorio | 62,4 GB |

## Arquitectura y entrenamiento

La arquitectura combina tres componentes: mHC (mecanismo de conexiones que da nombre al bloque, no detallado en la model card), MLA (Multi-head Latent Attention) para reducir el coste de la cache KV en contextos muy largos, y MTP (Multi-Token Prediction) para mejorar la eficiencia de decodificacion y el razonamiento multi-paso. La capa MoE consta de 64 expertos enrutados mas 1 experto compartido, activando 4 expertos por token sobre 40 capas con un tamano oculto de 3.584.

El entrenamiento se realizo integramente en clusters Ascend 910C con MindSpore/MindFormers, incluyendo adaptacion de caracteristicas para mHC y desarrollo de operadores fusionados en Ascend C. Segun la model card, la optimizacion multinivel (comunicacion MoE de grano fino, recómputo selectivo, fusion automatica grafo-operador DVM y operadores mHC fusionados) elevo el throughput de entrenamiento aproximadamente un 96 % sobre el rendimiento out-of-the-box. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno orientada a tareas de ingenieria.
- Razonamiento multi-paso y ejecucion de cadenas de razonamiento complejas.
- Modo de pensamiento (thinking mode) activable mediante el parametro `enable_thinking`.
- Tool calling y function calling para integracion en flujos de agentes.
- Planificacion de agentes y razonamiento multi-paso, con soporte de marcos como OpenCode, Claude Code, OpenClaw y Hermes.
- Ventana de contexto de 256K tokens (hasta 512K), apta para repositorios de codigo y documentos extensos.
- Ajuste fino para dominios verticales: clasificacion de intenciones, comprension de tablas, auditoria de contratos y QA sobre bases de conocimiento.
- Capacidades matematicas y de resolucion de problemas (reflejadas en AIME2026).
- Generacion y edicion de codigo en entornos de ingenieria de software (SWE-bench Verified y Multilingual).
- Capacidades multilingues: no detalladas en la informacion disponible.

## Casos de uso

- Agente de ingenieria de software automatizado: integrado con el harness SWE-agent, puede resolver incidencias reales sobre repositorios, con 75,00 en SWE-bench Verified y 66,00 en la variante multilingue, gracias a su ventana de 210K-256K tokens para cargar contexto de codigo.
- Automatizacion de terminal y operaciones: con soporte de Terminal-Bench 2.1 (57,50), es adecuado para agentes que ejecutan comandos, depuran entornos y gestionan tareas de sistema en varios pasos.
- Atencion al cliente compleja: gestiona conversaciones multi-turno con contexto largo y puede conectarse a bases de conocimiento internas mediante tool calling para resolver consultas que requieren varios pasos.
- Investigacion profunda asistida: con 60,80 en DeepresearchBII, sirve para pipelines de busqueda iterativa, sintesis de fuentes y generacion de informes estructurados.
- Auditoria de contratos y analisis documental: permite ajuste fino ligero sobre datos propios para extraer clausulas, clasificar riesgos y responder preguntas sobre documentacion legal extensa.
- Comprension de tablas y datos estructurados: indicado por el fabricante para tareas de table understanding y QA sobre bases de conocimiento en dominios verticales.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para revision automatica, generacion de tests y refactorizacion con contexto de 256K tokens.
- Sistemas de agentes con multiples herramientas: la arquitectura MTP y el soporte de marcos de agentes maximizan la coherencia en tareas encadenadas de larga duracion.

## Benchmarks y rendimiento

| Benchmark | Xing4.0-29B-A4B | Gemma4-26B-A4B | Qwen3.6-35B-A3B |
|---|---|---|---|
| IFBench | 69,67 | 72,67 | 65,50 |
| AIME2026 | 90,00 | 88,30 | 92,70 |
| AA.LCR | 61,00 | 66,00 | 62,00 |
| Tau3-Bench | 64,63 | 58,90 | 67,20 |
| Claw-Eval | **76,55** | 71,49 | 74,54 |
| SWE-bench Verified | **75,00** | 53,00 | 76,00 |
| Terminal-Bench 2.1 | **57,50** | 30,00 | 51,50 |
| SWE-bench Multilingual | 66,00 | 51,00 | 67,20 |
| DeepresearchBII | **60,80** | 39,30 | 59,70 |

Condiciones de evaluacion declaradas en la model card: SWE-bench Verified y SWE-bench Multilingual con el harness SWE-agent, `temperature=1.0`, `top_p=0.95`, `repetition_penalty=1.05` y ventana de 210K. Terminal-Bench 2.1 con `terminus-2`, `temperature=0.8`, `max_tokens=64K` y timeout de 24 horas (media de 3 ejecuciones). Claw-Eval con el harness oficial, `temperature=0.8`, `max_tokens=16384` y contexto de 256K (media de 3 ejecuciones). Tau3-Bench con el harness oficial de Sierra Research (`max_tokens=16384`, media de `pass^1`; el texto disponible esta truncado).

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 62,4 GB de pesos (coincide con el tamano del repositorio), mas cache KV. Con MLA la cache KV es mas reducida que en atencion estandar, pero a 256K de contexto sigue siendo significativa.
- VRAM estimada en 8 bits (INT8/FP8): del orden de 31 GB de pesos (estimacion a partir del numero de parametros).
- VRAM estimada en 4 bits: del orden de 16-18 GB de pesos (estimacion; la disponibilidad y compatibilidad de cuantizaciones no se detalla en la informacion disponible).
- GPU recomendadas: para BF16 cabe en una unica A100 80 GB o H100 80 GB; alternativamente 2x A40/A6000 de 48 GB.
- GPU de consumo: con cuantizacion de 4 bits podria ejecutarse en una RTX 4090 o RTX 3090 de 24 GB (estimacion sujeta a que exista una cuantizacion compatible; no confirmado por el fabricante).
- Dado que solo 4B parametros estan activos por token, el coste de computo por token es el de un modelo denso de ~4B, aunque todo el peso debe residir en memoria.
- Opciones de despliegue: transformers, vLLM, SGLang y KTransformers (segun la model card). Ajuste fino con LLaMA-Factory y MindFormers. Tambien se ofrece una API compatible con OpenAI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Terminal-Bench 2.1 | Licencia |
|---|---|---|---|---|---|
| Xing4.0-29B-A4B | 29B (4B activos) | 256K (hasta 512K) | 75,00 | 57,50 | Apache 2.0 |
| Gemma4-26B-A4B | 26B (4B activos) | no disponible | 53,00 | 30,00 | no disponible |
| Qwen3.6-35B-A3B | 35B (3B activos) | no disponible | 76,00 | 51,50 | no disponible |

Los datos de parametros y rendimiento de los modelos comparados proceden de la tabla publicada en la model card de Xing4.0-29B-A4B. Los contextos y licencias de Gemma4-26B-A4B y Qwen3.6-35B-A3B no estan disponibles en la informacion proporcionada. Xing4.0 destaca en tareas de agente y terminal (Claw-Eval 76,55, Terminal-Bench 2.1 57,50, DeepresearchBII 60,80) y queda ligeramente por detras de Qwen3.6 en SWE-bench Verified y Tau3-Bench.

## Limitaciones y advertencias

- No se documentan en la informacion disponible los sesgos conocidos del modelo.
- Riesgo de alucinacion: no cuantificado por el fabricante; como cualquier LLM, puede generar contenido plausible pero incorrecto, especialmente en dominios especializados.
- Limitaciones de idioma: no se especifican los idiomas soportados, lo que dificulta evaluar su comportamiento fuera del chino y el ingles.
- El contenido de la model card esta truncado en la seccion de footnotes (Tau3-Bench), por lo que faltan detalles de evaluacion.
- Existe una discrepancia entre los parametros declarados (29B) y los reales de los pesos safetensors (31.215.031.088, ~31,2B); conviene verificar los requisitos de memoria con el valor real.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no se detallan condiciones adicionales sobre los datos de entrenamiento ni sobre dependencias de `custom_code`.
- Requiere `trust_remote_code` al incluir codigo personalizado (`custom_code`), lo que implica ejecutar codigo del repositorio del autor.
- El entrenamiento esta atado al ecosistema Ascend NPU/MindSpore; el soporte real de algunas optimizaciones puede variar en GPUs convencionales.
- No se especifican tipos de cuantizacion soportados, lo que puede limitar el despliegue en hardware de gama media.
- El modelo tiene muy pocas descargas (61) y 48 likes, por lo que su adopcion y validacion por la comunidad son todavia muy reducidas.

## Enlaces

- HuggingFace: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- GitHub del modelo: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- Repositorio TeleChat (serie anterior): https://github.com/Tele-AI/TeleChat3
- Paper referenciado (arxiv:2512.24157): https://arxiv.org/abs/2512.24157
- Paper referenciado (arxiv:2507.18013): https://arxiv.org/abs/2507.18013
- vLLM: https://github.com/vllm-project/vllm
- SGLang: https://github.com/sgl-project/sglang
- KTransformers: https://github.com/kvcache-ai/ktransformers
- Harness Claw-Eval: https://github.com/claw-eval/claw-eval
- Harness Tau-bench (Sierra Research): https://github.com/sierra-research/tau-bench
