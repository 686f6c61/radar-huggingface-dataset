# surogate/Surogate3.7-35B-A3B

## Resumen

Surogate 3.7 35B-A3B es un modelo de lenguaje multimodal (texto e imagen) con arquitectura Mixture-of-Experts (MoE) desarrollado por Surogate (surogate.ai), construido sobre la arquitectura de Qwen3.5-35B-A3B-Base. Su objetivo declarado es servir como modelo de referencia para aplicaciones agénticas empresariales: flujos de trabajo conectados a herramientas, interacciones estructuradas y tareas complejas que se desarrollan en múltiples pasos. Con 35.951.822.704 parámetros totales y aproximadamente 3B activos por token, ofrece un equilibrio entre capacidad y coste de inferencia.

La propuesta diferencial del modelo es su post-entrenamiento orientado a agentes (fine-tuning y RL sobre comportamiento en entornos con herramientas), junto con una ventana de contexto de 1M tokens mediante escalado RoPE y una cabeza MTP (multi-token prediction) que habilita decodificación especulativa. El autor lo posiciona como alternativa eficiente a modelos frontera en casos de uso agénticos, con despliegue viable en una única DGX Spark o en GPUs de consumo como la RTX 5090.

Es relevante ahora porque el modelo está diseñado explícitamente para despliegue local en entornos empresariales, con licencia Apache 2.0 y compatibilidad con el ecosistema transformers y vLLM. El modelo fue entrenado en precisión FP4 sobre GPUs NVIDIA RTX 5090 usando el motor propio Surogate Engine, y se distribuye como soporte del despliegue local de la plataforma Surogate.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) con cabeza MTP |
| Parametros totales | 35.951.822.704 |
| Parametros activos | Aproximadamente 3B por token |
| Longitud de contexto | 1M tokens (con escalado RoPE); configuración vLLM de ejemplo a 131.072 tokens |
| Tipos de cuantizacion | No disponible (entrenado en FP4; el ejemplo de despliegue usa bfloat16 con KV cache FP8) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5-35B-A3B-Base, un transformer con capas Mixture-of-Experts en el que se activan aproximadamente 3B parámetros de un total de unos 35B por token procesado. Incorpora una cabeza MTP (multi-token prediction) que permite decodificación especulativa, configurable en vLLM con `num_speculative_tokens: 2`. El contexto se extiende hasta 1M tokens mediante escalado RoPE.

El post-entrenamiento se describe como "agentic-first": fine-tuning y aprendizaje por refuerzo centrados en comportamiento para flujos de trabajo conectados a herramientas, interacción estructurada y ejecución de tareas en múltiples etapas. El entrenamiento se realizó en precisión FP4 sobre GPUs NVIDIA RTX 5090 utilizando el Surogate Engine del propio autor. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles del pipeline de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento, con modo "thinking" activado por defecto y opción de preservar el razonamiento entre turnos en bucles agénticos multi-turno.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), lo que habilita entrada multimodal.
- Tool calling / function calling, con soporte de auto-selección de herramientas en vLLM (`--enable-auto-tool-choice`) y parser `qwen3_coder`.
- Ejecución agéntica multi-paso: descomposición de tareas, interacción con herramientas y ejecución estructurada.
- Capacidades de código y tareas de terminal (evaluado en Terminal-Bench 2.1 y SWE-bench Verified).
- Razonamiento científico y de conocimiento (GPQA Diamond, IFEval).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Decodificación especulativa mediante cabeza MTP.

## Casos de uso

- Asistentes empresariales con herramientas: el modelo puede orquestar flujos donde consulta APIs internas, bases de datos o sistemas de ticketing, manteniendo el razonamiento entre pasos gracias a `preserve_thinking` y a su ventana de contexto de hasta 1M tokens.
- Automatización de operaciones de terminal y DevOps: con un rendimiento de 76,4 en Terminal-Bench 2.1, es adecuado para agentes que ejecutan comandos, inspeccionan logs (por ejemplo, listar los mayores ficheros en `/var/log` y explicarlos) y resuelven incidencias en entornos controlados.
- Agentes de ingeniería de software: con 78,0 en SWE-bench Verified, puede integrarse en pipelines de resolución de issues y generación de parches, apoyado por tool calling y parser de código.
- Automatización de back office y comercio: los resultados en CommerceAgentBench (39,4) y AutomationBench (34,3) lo orientan a flujos transaccionales con múltiples pasos y validaciones.
- Atención al cliente multi-turno: la ventana de contexto larga y el modo thinking permiten gestionar conversaciones extensas con historial y documentación adjunta.
- Despliegue local en empresa: cabe en una única DGX Spark con contexto de 1M tokens mediante Surogate Engine y admite hasta 8 usuarios agénticos concurrentes, lo que facilita escenarios con requisitos de soberanía del dato.
- Procesamiento de documentos con imagen: al ser image-text-to-text, puede extraer y razonar sobre información de capturas, formularios o diagramas en flujos documentales.

## Benchmarks y rendimiento

| Benchmark | Surogate3.7-35B-A3B | DeepSeek V4 Flash (0731) | GLM-5.2 | Ornith-1.5-35B-A3B | LFM2.5-24B-A2B | MiniCPM-V-4.7-35B-A3B | Sage-A1.5-35B-A3B |
|---|---|---|---|---|---|---|---|
| AutomationBench | 34,3 | 25,1 | 28,0 | 18,5 | 27,69 | 2,7 | 8,7 |
| Terminal-Bench 2.1 | 76,4 | 82,7 | 82,7 | 58,4 | 13,5 | 31,5 | 60,6 |
| BFCL v4 | 68,7 | 67,3 | 70,3 | 68,5 | 65,01 | 60,06 | 55,5 |
| IFEval | 94,1 | 92,5 | 93,9 | 81,8 | 96,75 | 89,6 | 92,9 |
| SWE-bench Verified | 78,0 | 79,7 | 78,7 | 79,0 | 51,00 | 54,6 | 76,2 |
| OfficeQA Pro | 51,9 | 46,6 | 66,20 | 45,9 | 3,0 | 18,0 | 45,1 |
| τ²-Bench | 93,4 | 95,2 | 99,4 | 81,5 | 72,1 | 84,65 | 81,8 |
| Claw-Eval (average) | 82,4 | 79,7 | 81,60 | 64,40 | 60,8 | 75,1 | 77,3 |
| GPQA Diamond | 91,4 | 88,1 | 91,2 | 89,2 | 74,42 | 77,8 | 87,4 |
| EnterpriseOps-Gym | 38,1 | 43,3 | 42,7 | 28,8 | 12,1 | 28,6 | 29,2 |
| WildClawBench | 54,6 | 33,2 | 52,14 | 45,91 | 9,4 | 35,3 | 50,0 |
| CommerceAgentBench | 39,4 | 38,4 | 39,30 | 37,40 | 1,9 | 14,0 | 25,2 |

Nota del autor sobre Terminal-Bench 2.1: las tareas que fallaron en el primer intento se reintentaron una vez con un límite de 3 horas de tiempo de agente; una tarea cuenta como superada si cualquiera de los dos intentos pasó (solo el primer intento: 61,8).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 35,95B parámetros, en bfloat16 los pesos ocupan aproximadamente 72 GB; en FP4 (precisión de entrenamiento declarada) se reducirían sustancialmente, pero no se publican cifras de cuantización para inferencia.
- GPU recomendadas: el autor indica que el modelo se sirve en GPUs de consumo y en una única DGX Spark; el entrenamiento se realizó en NVIDIA RTX 5090.
- Cabe en GPU de consumo: sí, según el autor, con Surogate Engine en una DGX Spark manteniendo 1M de contexto y hasta 8 usuarios agénticos concurrentes.
- Opciones de despliegue: vLLM (configuración de ejemplo con `--dtype bfloat16 --kv-cache-dtype fp8 --max-model-len 131072`, parser de razonamiento `qwen3`, tool parser `qwen3_coder` y decodificación especulativa MTP), transformers y Surogate Engine.
- Latencia y throughput: no disponibles. La decodificación especulativa MTP con 2 tokens especulativos está orientada a mejorar el throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento agéntico (referencia) | Licencia |
|---|---|---|---|---|
| Surogate3.7-35B-A3B | 35,95B totales / ~3B activos | 1M | AutomationBench 34,3; SWE-bench Verified 78,0; τ²-Bench 93,4 | Apache 2.0 |
| DeepSeek V4 Flash (0731) | No disponible | No disponible | AutomationBench 25,1; SWE-bench Verified 79,7; τ²-Bench 95,2 | No disponible |
| GLM-5.2 | No disponible | No disponible | AutomationBench 28,0; SWE-bench Verified 78,7; τ²-Bench 99,4 | No disponible |
| Ornith-1.5-35B-A3B | ~35B / A3B | No disponible | AutomationBench 18,5; SWE-bench Verified 79,0; τ²-Bench 81,5 | No disponible |
| MiniCPM-V-4.7-35B-A3B | ~35B / A3B | No disponible | AutomationBench 2,7; SWE-bench Verified 54,6; τ²-Bench 84,65 | No disponible |

Surogate lidera en AutomationBench, Claw-Eval, WildClawBench, GPQA Diamond, IFEval (frente a DeepSeek V4 Flash y GLM-5.2) y CommerceAgentBench, mientras queda por detrás en Terminal-Bench 2.1, τ²-Bench y EnterpriseOps-Gym frente a los modelos frontera citados.

## Limitaciones y advertencias

- El propio autor advierte que el foco en post-entrenamiento agéntico no garantiza corrección ni fiabilidad autónoma: es necesario validar el comportamiento contra las herramientas, datos y límites de seguridad propios antes de desplegar en producción.
- Riesgo de alucinación inherente a modelos generativos; no se publican tasas de alucinación ni evaluaciones específicas de factualidad.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar calidad fuera de los idiomas cubiertos por el modelo base.
- La ventana de 1M tokens requiere escalado RoPE y recursos de memoria considerables; la configuración de ejemplo en vLLM limita a 131.072 tokens.
- El resultado de Terminal-Bench 2.1 (76,4) incluye reintentos de tareas falladas; el resultado en primer intento es 61,8, dato relevante para evaluar fiabilidad real.
- Licencia Apache 2.0, permisiva para uso comercial, pero conviene verificar las obligaciones de atribución y las condiciones del modelo base Qwen3.5-35B-A3B-Base.
- El modelo está etiquetado como `endpoints_compatible`; el despliegue en producción debe considerar el coste de memoria del contexto largo y el número de usuarios concurrentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/surogate/Surogate3.7-35B-A3B
- Sitio del autor: https://surogate.ai
- Repositorio del motor Surogate: https://github.com/invergent-ai/surogate
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
