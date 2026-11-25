# Vrandan/Surogate3.7-35B-A3B-tiiny

## Resumen

Surogate3.7-35B-A3B-tiiny es una copia sin modificar del modelo Surogate3.7-35B-A3B, publicado por el usuario Vrandan en Hugging Face con fines de importación privada y eliminación posterior. El modelo original lo desarrolla Surogate (surogate.ai) y está construido sobre la arquitectura Qwen3.5-35B-A3B-Base, aplicando un post-entrenamiento orientado a agentes (agentic-first) con soporte de tool calling, razonamiento multi-paso y workflows estructurados.

Se trata de un modelo Mixture of Experts (MoE) de aproximadamente 35.950 millones de parámetros totales, de los cuales activa unos 3.000 millones por token. Incorpora una cabeza MTP (multi-token prediction) para decodificación especulativa y, según la model card, soporta hasta 1 millón de tokens de contexto mediante escalado RoPE. Está optimizado para despliegue en GPUs de consumo (RTX 5090) y en un único DGX Spark.

La relevancia de esta ficha radica en que documenta un modelo orientado a agentes empresariales que, según los datos del autor, compite con modelos frontera como DeepSeek V4 Flash y GLM-5.2 en tareas agénticas. No obstante, esta copia concreta tiene 0 descargas y 0 likes, y el propio autor recomienda usar el repositorio original en su lugar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3.5-35B-A3B-Base) con cabeza MTP |
| Parámetros totales | 35.951.822.704 |
| Parámetros activos | ~3B por token |
| Longitud de contexto | Hasta 1M tokens con escalado RoPE (según model card) |
| Tipos de cuantización | Entrenado en FP4; despliegue en bfloat16 con KV cache en FP8 (configuración vLLM recomendada) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de mezcla de expertos (MoE) derivada de Qwen3.5-35B-A3B-Base, con aproximadamente 35.950 millones de parámetros totales y unos 3.000 millones activos por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamaño. Incluye una cabeza MTP (multi-token prediction) que habilita decodificación especulativa, configurable en vLLM con `num_speculative_tokens: 2`.

El post-entrenamiento se centró en un objetivo agentic-first: fine-tuning y RL orientados a workflows con herramientas, interacciones estructuradas y tareas que se desarrollan en múltiples pasos. El entrenamiento se realizó en precisión FP4 sobre GPUs NVIDIA RTX 5090 usando el Surogate Engine. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles del pipeline de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento (thinking) activado por defecto.
- Tool calling / function calling estructurado, con parser compatible `qwen3_coder` en vLLM.
- Ejecución de agentes autónomos en entornos de terminal y sistemas de archivos (Terminal-Bench).
- Razonamiento científico y de conocimiento general (GPQA Diamond, IFEval).
- Capacidades de imagen-texto a texto (pipeline `image-text-to-text`), aunque la model card no detalla el alcance multimodal.
- Preservación del razonamiento previo en bucles multi-turno mediante `preserve_thinking`.
- Capacidad de contexto largo (hasta 1M tokens) para tareas con documentos extensos o historiales de agente prolongados.

## Casos de uso

- Automatización de operaciones en terminal: el modelo puede ejecutar tareas de administración de sistemas, inspección de logs y gestión de archivos en entornos controlados, con un rendimiento destacado en Terminal-Bench 2.1 (76.4).
- Agentes empresariales de atención al cliente: gestión de conversaciones multi-turno con contexto largo y llamadas a herramientas internas (CRM, ticketing), apoyándose en BFCL v4 (68.7) y τ²-Bench (93.4).
- Automatización de workflows con herramientas: descomposición de tareas, invocación secuencial de APIs y ejecución estructurada, adecuado por su post-entrenamiento agentic-first.
- Asistencia en ingeniería de software: resolución de incidencias en repositorios reales (SWE-bench Verified 78.0) y generación de parches con validación en CI/CD.
- Análisis documental de contexto largo: procesamiento de contratos, informes o bases de conocimiento extensas gracias a la ventana de hasta 1M tokens.
- Despliegue local en empresa: ejecución en un único DGX Spark con hasta 8 usuarios agénticos concurrentes, según el autor, para escenarios con requisitos de soberanía de datos.
- Razonamiento científico asistido: apoyo en tareas de química, física y biología a nivel de posgrado (GPQA Diamond 91.4).

## Benchmarks y rendimiento

Datos publicados por el autor del modelo original (Surogate3.7-35B-A3B):

| Benchmark | Surogate3.7-35B-A3B | DeepSeek V4 Flash (0731) | GLM-5.2 | Ornith-1.5-35B-A3B | LFM2.5-24B-A2B | MiniCPM-V-4.7-35B-A3B | Sage-A1.5-35B-A3B |
|---|---|---|---|---|---|---|---|
| AutomationBench | 34.3 | 25.1 | 28.0 | 18.5 | 27.69 | 2.7 | 8.7 |
| Terminal-Bench 2.1 | 76.4 | 82.7 | 82.7 | 58.4 | 13.5 | 31.5 | 60.6 |
| BFCL v4 | 68.7 | 67.3 | 70.3 | 68.5 | 65.01 | 60.06 | 55.5 |
| IFEval | 94.1 | 92.5 | 93.9 | 81.8 | 96.75 | 89.6 | 92.9 |
| SWE-bench Verified | 78.0 | 79.7 | 78.7 | 79.0 | 51.00 | 54.6 | 76.2 |
| OfficeQA Pro | 51.9 | 46.6 | 66.20 | 45.9 | 3.0 | 18.0 | 45.1 |
| τ²-Bench | 93.4 | 95.2 | 99.4 | 81.5 | 72.1 | 84.65 | 81.8 |
| Claw-Eval (media) | 82.4 | 79.7 | 81.60 | 64.40 | 60.8 | 75.1 | 77.3 |
| GPQA Diamond | 91.4 | 88.1 | 91.2 | 89.2 | 74.42 | 77.8 | 87.4 |
| EnterpriseOps-Gym | 38.1 | 43.3 | 42.7 | 28.8 | 12.1 | 28.6 | 29.2 |
| WildClawBench | 54.6 | 33.2 | 52.14 | 45.91 | 9.4 | 35.3 | 50.0 |
| CommerceAgentBench | 39.4 | 38.4 | 39.30 | 37.40 | 1.9 | 14.0 | 25.2 |

Nota del autor: en Terminal-Bench 2.1, las tareas fallidas en el primer intento se repitieron una vez con un límite de 3 horas; una tarea cuenta como superada si pasa en cualquiera de los dos intentos (solo primer intento: 61.8).

## Requisitos de hardware

- VRAM estimada: el repo pesa 71,9 GB en safetensors (bfloat16); en FP8/INT8 se reduce a unos 36 GB y en cuantizaciones de 4 bits a unos 18-20 GB, aunque no se publican cifras oficiales de cuantización.
- GPU recomendadas: NVIDIA RTX 5090 (usada en entrenamiento), DGX Spark (despliegue de referencia con 1M de contexto y hasta 8 usuarios concurrentes).
- Cabe en GPU de consumo: sí, según el autor, en RTX 5090 y en un único DGX Spark.
- Opciones de despliegue: vLLM (configuración recomendada con `--dtype bfloat16 --kv-cache-dtype fp8 --max-model-len 131072`, parser `qwen3_coder` y decodificación especulativa MTP); no se mencionan otras opciones como llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Surogate3.7-35B-A3B | ~35,9B totales / ~3B activos (MoE) | Hasta 1M (RoPE scaling) | Apache-2.0 | Hugging Face (repo original surogate/Surogate3.7-35B-A3B) |
| Qwen3.5-35B-A3B-Base | ~35B / ~3B activos (MoE) | No disponible | No disponible | Hugging Face (Qwen) |
| DeepSeek V4 Flash (0731) | No disponible | No disponible | No disponible | No disponible |
| GLM-5.2 | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Esta copia concreta (Vrandan/Surogate3.7-35B-A3B-tiiny) es un duplicado temporal creado para una importación privada; el propio autor recomienda usar el repositorio original.
- El campo `base_model` de esta copia apunta a Qwen/Qwen3.6-35B-A3B por compatibilidad del importador, pero la base real es Qwen/Qwen3.5-35B-A3B-Base.
- El autor advierte explícitamente que el enfoque agentic-first no garantiza corrección ni fiabilidad autónoma; es necesario validar el comportamiento con las herramientas, datos y límites de seguridad propios antes de desplegar en producción.
- No se detallan sesgos conocidos ni tasas de alucinación.
- No se especifican los idiomas soportados.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen.
- Los benchmarks publicados son del modelo original y no han sido verificados de forma independiente en esta copia.

## Enlaces

- Hugging Face (esta copia): https://huggingface.co/Vrandan/Surogate3.7-35B-A3B-tiiny
- Repositorio original: https://huggingface.co/surogate/Surogate3.7-35B-A3B
- Surogate Engine (GitHub): https://github.com/invergent-ai/surogate
- Sitio web de Surogate: https://surogate.ai
