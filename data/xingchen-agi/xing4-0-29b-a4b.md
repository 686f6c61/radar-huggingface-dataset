# XingChen-AGI/Xing4.0-29B-A4B

## Resumen

Xing4.0-29B-A4B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por XingChen-AGI, la division de inteligencia artificial de China Telecom. Con 31.215.031.088 parametros totales y aproximadamente 4B parametros activos por token (un 13,8 % de activacion), esta disenado especificamente para tareas de ingenieria compleja: planificacion con contexto largo, razonamiento multi-paso, tool calling y salida estructurada. Es el buque insignia de la serie Xing, anteriormente conocida como TeleChat.

El modelo emplea una arquitectura MoE con atencion MLA (Multi-head Latent Attention), mHC y MTP (Multi-Token Prediction), con 40 capas, un tamano oculto de 3584 y 64 expertos enrutados mas uno compartido, de los cuales se activan 4 por token. Soporta de forma nativa una longitud de contexto de 256K tokens, extensible hasta 512K, y fue entrenado sobre 1,5 billones de tokens de alta calidad en chino e ingles.

Su relevancia actual radica en dos factores: por un lado, ofrece pesos abiertos bajo licencia Apache 2.0 con builds en BF16, FP8, GGUF (2-8 bits) y W8A8; por otro, su integracion en el ecosistema open source es amplia, con soporte en vLLM (plugin oficial), SGLang, llama.cpp, ms-swift y LLaMA-Factory, ademas de alineacion de formato con frameworks de agentes como OpenCode, Claude Code y Hermes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con MLA (Multi-head Latent Attention), mHC y MTP (Multi-Token Prediction) |
| Parametros totales | 31.215.031.088 (29B nominales) |
| Parametros activos | ~4B por token (~13,8 % de activacion) |
| Longitud de contexto | 256K nativo, extensible a 512K |
| Tipos de cuantizacion | BF16, FP8, GGUF (2-8 bits), W8A8 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), GGUF, FP8, W8A8 |

## Arquitectura y entrenamiento

Xing4.0-29B-A4B es un transformer disperso de tipo MoE con 40 capas, tamano oculto de 3584, tamano intermedio de FFN denso de 9216 y tamano intermedio por experto de 1024. Cuenta con 64 expertos enrutados y un experto compartido, activando 4 expertos enrutados por token. La atencion es de tipo MLA (Multi-head Latent Attention), que comprime las claves y valores en un espacio latente para reducir el coste de memoria del KV cache en contextos largos, algo critico con ventanas de 256K. Ademas incorpora mHC (una variante de conexiones residuales hiperbolicas) y MTP (Multi-Token Prediction), que permite predecir varios tokens futuros por paso y acelera la decodificacion.

El entrenamiento se realizo sobre 1,5 billones de tokens bilingues (chino e ingles) de alta calidad, con un stack completamente propio, desde el silicio hasta el software, adaptado a clusters de NPU domesticos. El equipo reporta una mejora de throughput de entrenamiento de aproximadamente el 96 % sobre el rendimiento out-of-the-box, gracias a optimizacion de comunicacion MoE de grano fino, recomputacion selectiva, fusion automatica de grafos y operadores, y kernels mHC fusionados ajustados a mano. No se especifica en la informacion disponible si hubo fases de RLHF o DPO, ni la composicion detallada del dataset mas alla de la proporcion bilingue.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto de hasta 256K tokens.
- Razonamiento multi-paso y planificacion de tareas complejas, orientado a flujos agenticos.
- Tool calling y function calling, con alineacion de formato a frameworks de agentes (OpenCode, Claude Code, OpenClaw, Hermes).
- Ejecucion de cadenas de razonamiento largas con coherencia y estabilidad en contextos extensos.
- Generacion de codigo y resolucion de tareas de ingenieria de software (SWE-bench Verified reportado en 75,0).
- Salida estructurada (JSON y formatos afines) para integracion en pipelines.
- Capacidades matematicas de competicion (AIME2026 reportado en 90,00).
- Soporte bilingue chino-ingles.
- Adaptacion ligera a dominios propios: clasificacion de intenciones, comprension de tablas, auditoria de contratos y QA sobre conocimiento.
- Inferencia local via GGUF en llama.cpp y despliegue en vLLM, SGLang y plataformas en la nube.

## Casos de uso

- Agente de ingenieria de software: con 75,0 en SWE-bench Verified y soporte de tool calling, el modelo puede integrarse en flujos tipo Claude Code u OpenCode para resolver issues, generar parches y ejecutar pruebas en repositorios reales, manteniendo coherencia en sesiones largas gracias a su contexto de 256K.
- Planificacion de tareas de largo horizonte: su arquitectura orientada a agentes y su ventana extensible a 512K permiten mantener el estado de un proyecto completo (documentacion, historial de decisiones, codigo) dentro del contexto y descomponer objetivos en pasos ejecutables.
- Atencion al cliente automatizada: conversaciones multi-turno con historial extenso, clasificacion de intenciones y derivacion a herramientas internas mediante function calling, con la ventaja de que el modelo puede adaptarse a dominios propios con fine-tuning ligero.
- Auditoria de contratos y documentos legales: la capacidad de comprension de tablas y QA sobre conocimiento, junto con el contexto largo, permite procesar expedientes completos y extraer clausulas o inconsistencias en una sola pasada.
- Generacion de codigo en produccion: integrable en pipelines de CI/CD a traves de vLLM o SGLang para autocompletado, revision de PRs y generacion de tests, con salida estructurada que facilita el parseo automatico.
- Razonamiento matematico y analisis cuantitativo: con 90,00 en AIME2026, es adecuado para asistentes de resolucion de problemas matematicos, verificacion de calculos y generacion de explicaciones paso a paso en entornos educativos o financieros.
- Procesamiento de documentacion tecnica bilingue: al soportar chino e ingles, puede emplearse para traduccion tecnica asistida, resumen de documentacion extensa y generacion de informes en ambos idiomas.
- Despliegue en local o edge: los builds GGUF de 2-8 bits (11-34 GB) permiten ejecutar el modelo en llama.cpp sobre hardware consumer, habilitando asistentes privados sin conexion.

## Benchmarks y rendimiento

Datos publicados en la model card, comparados con modelos de la misma clase:

| Benchmark | Xing4.0-29B-A4B | Gemma4-26B-A4B | Qwen3.6-35B-A3B |
|---|---:|---:|---:|
| IFBench | 69,67 | **72,67** | 65,50 |
| AIME2026 | 90,00 | 88,30 | **92,70** |
| AA.LCR | 61,00 | **66,00** | 62,00 |
| Tau3-Bench | 64,63 | no disponible | no disponible |
| SWE-bench Verified | 75,0 | no disponible | no disponible |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K. Los datos de Tau3-Bench y SWE-bench Verified solo aparecen para Xing4.0 en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 62 GB solo para pesos (31,2B parametros x 2 bytes), mas KV cache; requiere multiples GPU o una GPU de 80 GB con cuantizacion parcial.
- VRAM estimada en FP8: aproximadamente 31 GB para pesos, viable en una A100 80 GB o H100 80 GB con margen para contexto.
- VRAM estimada en W8A8: similar a FP8, orientado a despliegue en servidor con aceleracion de INT8.
- GGUF 2-8 bits: entre 11 y 34 GB, lo que permite ejecucion en GPU consumer de 16-24 GB (RTX 4090, RTX 4080) segun el nivel de cuantizacion y la longitud de contexto.
- GPU recomendadas: H100 o A100 80 GB para BF16/FP8 en produccion; RTX 4090 (24 GB) para GGUF de 4-6 bits con contextos moderados.
- Opciones de despliegue: vLLM (plugin oficial), SGLang (soporte en mainline), llama.cpp (b12174+), ms-swift y LLaMA-Factory para fine-tuning, y la plataforma Tianyi AI.
- Latencia y throughput: no disponibles en la informacion proporcionada. La activacion de solo 4B parametros por token reduce el coste computacional por token frente a un modelo denso de 29B, y MTP anade aceleracion en decodificacion, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xing4.0-29B-A4B | 29B | 4B | 256K (512K extensible) | Apache 2.0 | HF, ModelScope, Modelers, GGUF |
| Gemma4-26B-A4B | 26B | 4B (segun nomenclatura) | no disponible | no disponible | no disponible |
| Qwen3.6-35B-A3B | 35B | 3B (segun nomenclatura) | no disponible | no disponible | no disponible |

En los benchmarks publicados, Xing4.0 queda por detras de Gemma4-26B-A4B en IFBench (69,67 frente a 72,67) y AA.LCR (61,00 frente a 66,00), y por detras de Qwen3.6-35B-A3B en AIME2026 (90,00 frente a 92,70), aunque supera a Qwen3.6 en IFBench (69,67 frente a 65,50) y AA.LCR (61,00 frente a 62,00, ligeramente por debajo). No se dispone de datos de contexto ni licencia de los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse principalmente con datos en chino e ingles, es previsible un sesgo cultural y linguistico hacia esos dos idiomas.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de factualidad ni tasas de alucinacion; como todo LLM generativo, puede producir contenido plausible pero incorrecto, especialmente en dominios especializados.
- Limitaciones de idioma: solo se declaran ingles y chino; el rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- Contexto: aunque el contexto nativo es de 256K, el rendimiento efectivo en ventanas muy largas puede degradarse; no se aportan evaluaciones tipo needle-in-a-haystack.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento y de los frameworks de agentes con los que se alinea el formato.
- Produccion: el despliegue en BF16 requiere hardware de gama alta; en GGUF de baja cuantizacion puede haber perdida de calidad en tareas de razonamiento y codigo. No se dispone de datos de latencia ni de throughput para dimensionar SLAs.
- Madurez del ecosistema: el soporte en vLLM depende de un plugin oficial y el de llama.cpp requiere versiones recientes (b12174+), lo que puede complicar entornos con versiones fijadas.

## Enlaces

- Hugging Face: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Organizacion en Hugging Face: https://huggingface.co/XingChen-AGI
- GitHub: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- ModelScope: https://modelscope.cn/models/XingChen-AGI/Xing4.0-29B-A4B
- Modelers: https://modelers.cn/models/XingChen-AGI/Xing4.0-29B-A4B
- Plugin vLLM: https://github.com/XingChen-AGI/xing4-vllm-plugin
- Version FP8: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-FP8
- Version GGUF: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-GGUF
- Version W8A8: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-w8a8
- Plataforma Tianyi AI: https://www.teleai.com.cn/
- Predecesor TeleChat: https://github.com/Tele-AI/TeleChat3
- PR de ms-swift: https://github.com/modelscope/ms-swift/pull/10275
- PR de LLaMA-Factory: https://github.com/hiyouga/LlamaFactory/pull/10754
- PR de SGLang: https://github.com/sgl-project/sglang/pull/39793
- PR de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31589
- Paper arXiv 2512.24157: https://arxiv.org/abs/2512.24157
- Paper arXiv 2507.18013: https://arxiv.org/abs/2507.18013
