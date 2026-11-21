# XingChen-AGI/Xing4.0-29B-A4B

## Resumen

Xing4.0-29B-A4B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por China Telecom Artificial Intelligence Technology Co., Ltd. (XingChen-AGI), sucesor de la familia TeleChat. Cuenta con 29.000 millones de parámetros totales y solo 4.000 millones activos por token (aproximadamente un 13,8 % de activación), lo que lo sitúa en la categoría de modelos eficientes en cómputo pero con una huella de conocimiento propia de un modelo de mayor tamaño.

El modelo está diseñado específicamente para tareas agénticas: planificación de múltiples pasos, razonamiento encadenado, tool calling y salida estructurada sobre contextos largos. Soporta de forma nativa 256K tokens de contexto, extensible hasta 512K, y fue entrenado con 1,5 billones de tokens bilingües (chino/inglés) en un stack completamente propio, desde el silicio hasta el software.

Su relevancia actual radica en la combinación de una arquitectura MoE con atención MLA y decodificación especulativa (MTP), un contexto de 256K y un rendimiento en benchmarks agénticos (SWE-bench Verified 75,0; Terminal-Bench 2.1 57,5) que compite con modelos de clase similar. Se distribuye bajo licencia Apache 2.0, con pesos en BF16, FP8, W8A8 y GGUF, y con soporte upstream en SGLang, vLLM, llama.cpp, ms-swift y LLaMA-Factory.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con mHC + MLA + MTP; transformer con atención Multi-head Latent Attention |
| Parametros totales | 29B (31.215.031.088 según safetensors) |
| Parametros activos | 4B por token (~13,8 % de activación) |
| Longitud de contexto | 256K nativo, extensible a 512K |
| Tipos de cuantizacion | BF16, FP8, W8A8, GGUF (2–8 bits, 11–34 GB) |
| Idiomas soportados | Chino (zh) e inglés (en); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), FP8, W8A8, GGUF |

## Arquitectura y entrenamiento

Xing4.0-29B-A4B emplea una arquitectura MoE de 40 capas con un tamaño oculto de 3584, FFN densa de 9216 y FFN de experto de 1024. Dispone de 64 expertos enrutados, de los cuales se activan 4 por token, más 1 experto compartido. La atención es de tipo MLA (Multi-head Latent Attention), que comprime las representaciones de clave-valor para reducir el coste de memoria en contextos largos. Incorpora además MTP (Multi-Token Prediction), una técnica de decodificación especulativa que permite predecir varios tokens por paso y acelerar la inferencia. El bloque mHC corresponde a una adaptación propia del autor orientada a la co-optimización hardware-software.

El entrenamiento se realizó sobre 1,5 billones de tokens bilingües (chino/inglés) de alta calidad, con un stack íntegramente propio que incluye adaptación de características mHC, desarrollo de operadores fusionados y optimización de la comunicación MoE de grano fino. El autor reporta una mejora de throughput de entrenamiento de aproximadamente el 96 % sobre el rendimiento out-of-the-box, gracias a recomputación selectiva, fusión automática de grafos y operadores y kernels mHC fusionados ajustados a mano. No se detalla en la información disponible si hubo fases de RLHF o DPO, ni la composición exacta del dataset más allá del recuento total de tokens.

## Capacidades

- Generación de texto y razonamiento multi-paso con cadenas de razonamiento largas.
- Razonamiento matemático (AIME2026: 90,00) y resolución de problemas complejos.
- Generación y modificación de código, con resultados destacados en SWE-bench Verified (75,00) y Terminal-Bench 2.1 (57,50).
- Tool calling y function calling, con soporte para salida estructurada.
- Comportamiento agéntico: planificación, ejecución de tareas de múltiples pasos y coherencia en contextos largos.
- Capacidades multilingües limitadas a chino e inglés según la model card.
- Formato alineado con frameworks agénticos como OpenCode, Claude Code, OpenClaw y Hermes.
- Contexto largo nativo de 256K tokens, extensible a 512K, adecuado para documentos extensos y repositorios de código.
- No se mencionan capacidades de visión ni audio en la información disponible.

## Casos de uso

- Agentes de ingeniería de software: el modelo puede resolver issues reales sobre repositorios (SWE-bench Verified 75,0) y operar en terminales (Terminal-Bench 2.1 57,5), integrándose en pipelines de CI/CD para corrección automática de bugs y generación de parches.
- Automatización de tareas de terminal y DevOps: con 256K de contexto puede mantener el estado de sesiones largas, interpretar logs extensos y ejecutar comandos de forma encadenada con tool calling.
- Asistencia en entornos de código agénticos: su formato alineado con Claude Code, OpenCode y Hermes permite conectarlo directamente a flujos de trabajo de edición de código multi-archivo sin adaptadores adicionales.
- Atención al cliente multi-turno: la ventana de 256K permite gestionar conversaciones largas con historial extenso y documentación de referencia en el mismo contexto, manteniendo coherencia.
- Auditoría de contratos y comprensión de tablas: el autor indica adaptación ligera sobre datos propios para auditoría de contratos, comprensión de tablas y QA sobre conocimiento, lo que lo hace adecuado para despliegues de dominio con fine-tuning de bajo coste.
- Clasificación de intenciones y enrutamiento: personalización ligera para clasificación de intenciones en asistentes conversacionales, aprovechando la eficiencia del MoE (4B activos) para servir muchas peticiones concurrentes.
- Razonamiento matemático y analítico: resolución de problemas de competición (AIME2026 90,0) para herramientas educativas o de verificación formal.
- Despliegue local en hardware de consumo: la variante GGUF de 2–8 bits (11–34 GB) permite ejecución en llama.cpp sobre GPUs consumer con suficiente VRAM.

## Benchmarks y rendimiento

| Benchmark | Xing4.0-29B-A4B | Gemma4-26B-A4B | Qwen3.6-35B-A3B |
|---|---:|---:|---:|
| IFBench | 69,67 | 72,67 | 65,50 |
| AIME2026 | 90,00 | 88,30 | 92,70 |
| AA.LCR | 61,00 | 66,00 | 62,00 |
| Tau3-Bench | 64,63 | 58,90 | 67,20 |
| Claw-Eval | 76,55 | 71,49 | 74,54 |
| SWE-bench Verified | 75,00 | 53,00 | 76,00 |
| Terminal-Bench 2.1 | 57,50 | 30,00 | 51,50 |

Los datos proceden de la model card del autor. Xing4.0-29B-A4B lidera en Claw-Eval y Terminal-Bench 2.1, queda cerca de Qwen3.6-35B-A3B en SWE-bench Verified y AIME2026, y por debajo en IFBench, AA.LCR y Tau3-Bench.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 62 GB solo para pesos, más overhead de activaciones y caché KV; requiere GPUs de 80 GB (A100, H100) o múltiples GPUs.
- VRAM estimada en FP8/W8A8: aproximadamente 31 GB para pesos, viable en una sola A100 40 GB o H100.
- GGUF: 11–34 GB según cuantización (2–8 bits), ejecutable en llama.cpp; las variantes de 4 bits caben en GPUs consumer de 16–24 GB (RTX 4090, RTX 3090) y en algunas de 12 GB con cuantizaciones agresivas.
- GPUs recomendadas: H100 o A100 para BF16 y serving de alta concurrencia; RTX 4090/3090 para GGUF local.
- Opciones de despliegue: SGLang (rama main), plugin oficial de vLLM, llama.cpp (b12174+), ms-swift (v4.6.0+) y LLaMA-Factory (rama main) para fine-tuning.
- Latencia y throughput: no disponibles en la información proporcionada. La activación de solo 4B parámetros por token y el MTP deberían reducir el coste por token frente a modelos densos de tamaño comparable, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | SWE-bench Verified | Terminal-Bench 2.1 | Licencia |
|---|---|---|---:|---:|---:|---|
| Xing4.0-29B-A4B | 29B | 4B | 256K (512K) | 75,00 | 57,50 | Apache 2.0 |
| Gemma4-26B-A4B | 26B | 4B | no disponible | 53,00 | 30,00 | no disponible |
| Qwen3.6-35B-A3B | 35B | 3B | no disponible | 76,00 | 51,50 | no disponible |

Frente a Gemma4-26B-A4B, Xing4.0 ofrece mejor rendimiento agéntico y de código con un tamaño similar. Frente a Qwen3.6-35B-A3B, queda prácticamente empatado en SWE-bench Verified y por delante en Terminal-Bench 2.1 y Claw-Eval, aunque por detrás en Tau3-Bench, IFBench y AIME2026. Los datos de contexto y licencia de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: la model card solo declara chino e inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- Riesgo de alucinación: no se documentan medidas específicas de mitigación ni tasas de alucinación medidas.
- Sesgos: no se detalla la composición del corpus ni los sesgos conocidos; el entrenamiento bilingüe ZH/EN puede introducir sesgos culturales y lingüísticos específicos.
- Contexto: aunque se declaran 256K nativos y 512K extensibles, no se aportan resultados de benchmarks de contexto largo (needle-in-a-haystack, RULER) que validen el rendimiento real en ventanas extremas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento y de los modelos base citados en la model card.
- Producción: el soporte en vLLM es mediante plugin oficial y en SGLang en rama main, lo que implica menor madurez que integraciones upstream estables; verificar compatibilidad de versiones antes de desplegar.
- Cuantizaciones GGUF: el rendimiento puede degradarse en cuantizaciones de 2–3 bits; no se aportan evaluaciones por nivel de cuantización.
- No se documentan capacidades multimodales (visión, audio) ni modo de pensamiento explícito más allá del razonamiento encadenado.

## Enlaces

- Hugging Face (BF16): https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Hugging Face (FP8): https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-FP8
- Hugging Face (GGUF): https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-GGUF
- Hugging Face (W8A8): https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-w8a8
- Organización en Hugging Face: https://huggingface.co/XingChen-AGI
- GitHub: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- Plugin vLLM: https://github.com/XingChen-AGI/xing4-vllm-plugin
- ModelScope: https://modelscope.cn/models/XingChen-AGI/Xing4.0-29B-A4B
- Modelers: https://modelers.cn/models/XingChen-AGI/Xing4.0-29B-A4B
- Plataforma Tianyi AI: https://www.teleai.com.cn/
- Repositorio predecesor TeleChat: https://github.com/Tele-AI/TeleChat3
- Paper arXiv 2512.24157: https://arxiv.org/abs/2512.24157
- Paper arXiv 2507.18013: https://arxiv.org/abs/2507.18013
