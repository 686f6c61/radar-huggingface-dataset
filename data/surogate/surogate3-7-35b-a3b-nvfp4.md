# surogate/Surogate3.7-35B-A3B-NVFP4

## Resumen

Surogate 3.7 35B-A3B NVFP4 es la exportación cuantizada en NVFP4 del modelo Surogate3.7-35B-A3B, desarrollado por Surogate (Invergent AI). Se construye sobre la arquitectura Qwen3.5-35B-A3B-Base, un transformer de mezcla de expertos (MoE) con aproximadamente 35.000 millones de parámetros totales de los que se activan unos 3.000 millones por token. El modelo ha recibido un post-entrenamiento orientado a agentes: flujos con herramientas, interacciones estructuradas y tareas que se desarrollan en múltiples pasos.

La relevancia del modelo radica en su enfoque "agentic-first" combinado con una ventana de contexto nativa de 262.144 tokens extensible a 1.048.576 mediante YaRN (factor 4), y en una cuantización NVFP4/FP8 diseñada para ejecutarse en GPUs NVIDIA Blackwell de consumo, como una RTX 5090 de 32 GB o una DGX Spark. Incluye una cabeza MTP (multi-token prediction) para decodificación especulativa y una torre de visión en BF16, lo que permite entrada image-text-to-text.

Según la model card, el modelo se posiciona como soporte para el despliegue local de la plataforma Surogate.ai, con capacidad para hasta 8 usuarios agénticos concurrentes en una única DGX Spark con contexto de 1M. La información pública disponible es limitada (12 descargas, 0 likes en el momento de la consulta) y los datos de benchmarks proceden exclusivamente de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (basado en Qwen3.5-35B-A3B-Base); atención, linear-attention y output-head en FP8; expertos enrutados en NVFP4; torre de visión BF16; cabeza MTP incluida |
| Parametros totales | 19.845.695.344 (según safetensors); la model card indica ~35B de parámetros del modelo base |
| Parametros activos | ~3B por token (MoE) |
| Longitud de contexto | 262.144 tokens nativos; 1.048.576 tokens con YaRN factor 4 |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), FP8 (atención, linear-attention, output-head), BF16 (torre de visión); export NVFP4 de 8 bits con compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors); incluye `model_mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5-35B-A3B-Base, un transformer de mezcla de expertos con aproximadamente 35.000 millones de parámetros totales y unos 3.000 millones activos por token. La exportación NVFP4 mantiene los expertos enrutados en 4 bits (NVFP4), las proyecciones de atención, linear-attention y la cabeza de salida en FP8, y la torre de visión en BF16. Incluye además una cabeza MTP (multi-token prediction) que el motor Surogate utiliza para decodificación especulativa (`--spec mtp --draft-tokens 2`).

El post-entrenamiento se describe como "agentic-first": fine-tuning y RL orientados a comportamientos necesarios en flujos conectados a herramientas, interacciones estructuradas y tareas de múltiples etapas. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas de RLHF o DPO. El modelo fue entrenado en precisión FP4 sobre GPUs NVIDIA RTX 5090 usando el motor propio Surogate Engine. La extensión de contexto a 1M se realiza en inferencia mediante YaRN con factor 4 sobre la ventana nativa de 262.144 tokens, con un coste declarado de +0.019 nats por token en una prueba de 95k tokens.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso.
- Uso de herramientas y function calling: soporte de `--enable-auto-tool-choice` en el motor Surogate, con APIs compatibles con OpenAI y Anthropic.
- Comportamiento agéntico: descomposición de tareas, interacción con herramientas y ejecución estructurada en flujos de múltiples etapas.
- Entrada image-text-to-text: pipeline declarado en Hugging Face, con torre de visión BF16 y soporte de `--vision --offload-vision` en el motor.
- Razonamiento con modo "thinking" y retención de pensamiento configurable (`--thinking-retention all`).
- Decodificación especulativa mediante cabeza MTP.
- Contexto largo: hasta 262.144 tokens nativos y 1.048.576 con YaRN.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agentes empresariales locales: el modelo puede desplegarse íntegramente en una DGX Spark con 1M de contexto y atender hasta 8 usuarios agénticos concurrentes, lo que lo hace adecuado para organizaciones que requieren que los datos no salgan de su infraestructura.
- Automatización de flujos con herramientas: gracias al soporte de tool calling y a las APIs compatibles con OpenAI y Anthropic, puede integrarse en pipelines que encadenan llamadas a APIs internas, bases de datos y servicios externos.
- Asistentes de atención al cliente multi-turno: la ventana de 262k tokens permite mantener conversaciones largas con historial extenso y documentación de referencia en el mismo contexto.
- Ejecución de tareas de terminal y automatización de operaciones: el rendimiento en Terminal-Bench 2.1 (76,4) sugiere utilidad en tareas de línea de comandos y automatización de sistemas.
- Ingeniería de software asistida: con 78,0 en SWE-bench Verified, puede emplearse en resolución de issues, generación de parches y revisión de código dentro de pipelines de CI/CD.
- Procesamiento de documentos con imagen: la torre de visión permite extraer información de capturas, formularios escaneados o diagramas dentro de flujos documentales.
- Razonamiento sobre bases de conocimiento extensas: la combinación de contexto largo y modo thinking facilita tareas de análisis sobre corpus grandes en un solo paso.
- Orquestación de agentes en producción: la cabeza MTP y la decodificación especulativa reducen la latencia en cargas interactivas con múltiples llamadas encadenadas.

## Benchmarks y rendimiento

Datos publicados en la model card del autor:

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

Nota del autor: en Terminal-Bench 2.1, las tareas fallidas en el primer intento se repitieron una vez con un límite de 3 horas; una tarea cuenta como superada si alguno de los dos intentos lo consigue (solo primer intento: 61,8).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 160,1 GB, pero la cuantización NVFP4/FP8 reduce el peso en GPU. El autor indica que cabe en una RTX 5090 de 32 GB con contexto de 262k y caché KV en FP8.
- GPUs recomendadas: NVIDIA RTX 5090 (32 GB), NVIDIA RTX PRO 6000 Blackwell y DGX Spark.
- Cabe en GPU de consumo: sí, en RTX 5090 de 32 GB según el autor, con caché KV FP8 de aproximadamente 450.000 tokens compartidos entre peticiones.
- Despliegue: motor Surogate (Linux x86_64 con CUDA 13 y driver 580 o superior, o DGX Spark), con APIs compatibles con OpenAI y Anthropic. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. Se menciona decodificación especulativa vía MTP con 2 tokens de borrador y hasta 8 usuarios concurrentes en DGX Spark.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento destacado |
|---|---|---|---|---|
| Surogate3.7-35B-A3B | ~35B totales / ~3B activos (MoE) | 262k nativo, 1M con YaRN | Apache 2.0 | AutomationBench 34,3; Terminal-Bench 2.1 76,4; GPQA Diamond 91,4 |
| DeepSeek V4 Flash (0731) | no disponible | no disponible | no disponible | Terminal-Bench 2.1 82,7; τ²-Bench 95,2 |
| GLM-5.2 | no disponible | no disponible | no disponible | τ²-Bench 99,4; OfficeQA Pro 66,20 |
| Ornith-1.5-35B-A3B | ~35B / ~3B activos (MoE) | no disponible | no disponible | SWE-bench Verified 79,0; GPQA Diamond 89,2 |

Los datos de parámetros, contexto y licencia de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte explícitamente que el enfoque de post-entrenamiento no garantiza corrección ni fiabilidad autónoma; debe validarse contra las herramientas, datos y límites de seguridad propios antes de desplegar en producción.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a modelos generativos de este tipo.
- Sesgos conocidos: no documentados en la model card.
- Idiomas soportados: no especificados; no se puede confirmar cobertura multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-35B-A3B-Base puede tener condiciones adicionales que conviene revisar.
- Dependencia del motor Surogate: el despliegue documentado se basa en su propio motor; no se confirma compatibilidad con vLLM, llama.cpp u otros runtimes.
- La extensión a 1M de contexto requiere YaRN en inferencia y añade coste (+0.019 nats por token en la prueba citada), además de mayor consumo de caché KV.
- El modelo es una exportación cuantizada NVFP4/FP8: puede presentar degradación frente a los pesos BF16 originales en tareas sensibles a la precisión.
- Datos de benchmarks proceden únicamente del autor; no hay validación independiente disponible.

## Enlaces

- Hugging Face (NVFP4): https://huggingface.co/surogate/Surogate3.7-35B-A3B-NVFP4
- Pesos BF16: https://huggingface.co/surogate/Surogate3.7-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Repositorio del motor Surogate: https://github.com/invergent-ai/surogate
- Plataforma Surogate: https://surogate.ai
- Logo del proyecto: https://raw.githubusercontent.com/invergent-ai/surogate/refs/heads/main/assets/logo-white.svg
- Imagen de benchmarks: assets/benchmark_results.webp (referenciada en la model card)
