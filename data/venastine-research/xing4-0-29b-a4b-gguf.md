# Venastine-Research/Xing4.0-29B-A4B-GGUF

## Resumen

Xing4.0-29B-A4B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por China Telecom Artificial Intelligence Technology Co., Ltd., dentro de la familia Xing (anteriormente TeleChat). Cuenta con 29B parámetros totales y solo 4B activos por token, lo que lo sitúa en la categoría de modelos eficientes en cómputo de inferencia. Esta versión concreta del repositorio es una cuantización en GGUF publicada por Venastine-Research, pensada para despliegue en CPU y GPU de consumo mediante llama.cpp y entornos compatibles.

El modelo está orientado a tareas de agente: planificación multi-paso, tool calling y ejecución de cadenas de razonamiento complejas. Soporta de forma nativa una longitud de contexto de 256K tokens, extensible a 512K, y emplea una arquitectura basada en mHC + MLA + MTP. Es relevante por dos motivos: primero, es el primer modelo de esta escala entrenado íntegramente en la plataforma Ascend NPU con el framework MindSpore; segundo, sus resultados publicados en SWE-bench Verified (75,00) y Terminal-Bench 2.1 (57,50) lo colocan en la liga de modelos de agente de gama alta pese a su reducido número de parámetros activos.

La relevancia práctica del repositorio GGUF radica en que permite ejecutar un modelo con ventana de contexto muy amplia y capacidades de agente en hardware más modesto que el requerido por los pesos en precisión completa, manteniendo licencia Apache 2.0 para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con mHC + MLA + MTP |
| Parametros totales | 29B (31.215.031.088 según safetensors) |
| Parametros activos | 4B por token |
| Longitud de contexto | 256K tokens (extensible a 512K) |
| Tipos de cuantizacion | GGUF (el repo es una publicacion GGUF; variantes concretas no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo base |

Datos adicionales de arquitectura: 40 capas, hidden size de 3584, tamaño intermedio de FFN densa de 9216, tamaño intermedio de experto de 1024, 64 expertos enrutados, 4 expertos activos por token y 1 experto compartido. Atención de tipo MLA (Multi-head Latent Attention).

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con atención MLA y predicción multi-token (MTP), junto con un componente denominado mHC por el autor. La combinación de 64 expertos enrutados con 1 experto compartido y solo 4 expertos activos por token mantiene el coste de inferencia en el equivalente a un modelo denso de 4B, mientras que la capacidad total de parámetros asciende a 29B. La atención MLA reduce el coste de memoria de la caché KV, algo crítico para sostener contextos de 256K tokens.

El entrenamiento se realizó íntegramente en clústeres Ascend 910C con MindSpore/MindFormers, incluyendo adaptación de la arquitectura mHC y desarrollo de operadores fusionados en Ascend C. El autor reporta una mejora de throughput de entrenamiento de aproximadamente el 96% sobre el rendimiento out-of-the-box, gracias a optimización de comunicación MoE de grano fino, recomputación selectiva y fusión automática de grafos y operadores (DVM). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno con contexto de hasta 256K tokens.
- Razonamiento complejo con modo de pensamiento (thinking) activable o desactivable mediante `chat_template_kwargs.enable_thinking`.
- Tool calling y function calling, con soporte explícito para arquitecturas de agente.
- Planificación multi-paso y ejecución de cadenas de razonamiento largas, con estabilidad mantenida en contextos extensos.
- Capacidades de agente de código: resolución de issues en repositorios (SWE-bench), operación en terminal (Terminal-Bench) e investigación profunda (DeepresearchBII).
- Adaptación a frameworks de agente como OpenCode, Claude Code, OpenClaw y Hermes mediante alineación de formato.
- Ajuste fino para dominios verticales: clasificación de intención, comprensión de tablas, auditoría de contratos y QA sobre base de conocimiento.
- Compatibilidad con API compatible con OpenAI, vLLM, SGLang y KTransformers para servicio.
- Soporte de fine-tuning con LLaMA-Factory y MindFormers.
- Capacidades multilingües: no disponible en detalle (el benchmark SWE-bench Multilingual sugiere competencia en varios lenguajes de programación, pero no se documentan los idiomas naturales soportados).

## Casos de uso

- Agente de resolución de incidencias en repositorios: con 75,00 en SWE-bench Verified y 210K de contexto en la evaluación, el modelo puede recibir un issue completo junto con el árbol del repositorio y generar un parche; encaja en pipelines de CI/CD que abren pull requests automáticos.
- Automatización de operaciones en terminal: con 57,50 en Terminal-Bench 2.1, es adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos de shell, con sesiones de hasta 24 horas según la configuración de evaluación del autor.
- Investigación profunda asistida: 60,80 en DeepresearchBII lo posiciona para tareas de búsqueda iterativa, síntesis de fuentes y generación de informes con múltiples pasos de razonamiento encadenados.
- Asistente de código en IDE o CLI: integración con OpenCode, Claude Code y Hermes permite usarlo como backend de agentes de programación con tool calling y ventana de contexto amplia para proyectos medianos.
- Atención al cliente con contexto largo: la ventana de 256K permite mantener historiales de conversación extensos y documentación de producto en el mismo contexto, reduciendo la pérdida de información en diálogos multi-turno.
- Auditoría de contratos y análisis documental: el ajuste fino recomendado por el autor para auditoría de contratos y comprensión de tablas permite adaptar el modelo a revisión de cláusulas y extracción estructurada sobre documentos largos.
- Clasificación de intención y enrutamiento en producción: con 4B parámetros activos, el coste por token es bajo, lo que lo hace viable para clasificación de tickets y enrutamiento a alta concurrencia.
- QA sobre base de conocimiento corporativa: fine-tuning ligero con LLaMA-Factory sobre datos propietarios para preguntas y respuestas con citas a documentos internos.
- Despliegue en hardware de consumo: la versión GGUF permite ejecutar el modelo en estaciones de trabajo sin GPU de datacenter, útil para prototipado y entornos con requisitos de soberanía de datos.

## Benchmarks y rendimiento

| Benchmark | Xing4.0-29B-A4B | Gemma4-26B-A4B | Qwen3.6-35B-A3B |
|---|---:|---:|---:|
| IFBench | 69,67 | **72,67** | 65,50 |
| AIME2026 | 90,00 | 88,30 | **92,70** |
| AA.LCR | 61,00 | **66,00** | 62,00 |
| Tau3-Bench | 64,63 | 58,90 | **67,20** |
| Claw-Eval | **76,55** | 71,49 | 74,54 |
| SWE-bench Verified | 75,00 | 53,00 | **76,00** |
| Terminal-Bench 2.1 | **57,50** | 30,00 | 51,50 |
| SWE-bench Multilingual | 66,00 | 51,00 | **67,20** |
| DeepresearchBII | **60,80** | 39,30 | 59,70 |

Condiciones de evaluación reportadas por el autor: SWE-bench Verified y SWE-bench Multilingual con harness SWE-agent, temperature 1.0, top_p 0.95, repetition_penalty 1.05 y ventana de 210K; Terminal-Bench 2.1 con terminus-2, temperature 0.8, max_tokens 64K y timeout de 24 horas, media de 3 ejecuciones; Claw-Eval con harness oficial, temperature 0.8, max_tokens 16384, contexto de 256K y media de 3 ejecuciones; Tau3-Bench con harness oficial de sierra-research, temperature 0.8 (el resto de parámetros queda truncado en la información disponible).

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial para las cuantizaciones GGUF concretas. Como referencia orientativa, un modelo MoE de 29B totales con 4B activos requiere cargar todos los expertos en memoria; en cuantizaciones de 4 bits el peso ronda los 16-18 GB, y en 8 bits alrededor de 30 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: para los pesos en precisión completa (safetensors), se necesitan GPUs de datacenter tipo A100 80GB o H100; para las cuantizaciones GGUF, una RTX 4090 (24 GB) puede ser suficiente en cuantizaciones bajas, con posible offload parcial a CPU.
- Cabe en GPU de consumo: probablemente sí en RTX 4090 y RTX 3090 con cuantizaciones de 4 bits, y en GPUs de 16 GB solo con offload parcial; no confirmado por el autor.
- Opciones de despliegue: vLLM, SGLang, KTransformers y llama.cpp (por el formato GGUF); también API compatible con OpenAI.
- Latencia y throughput: no disponibles. El autor reporta una mejora del 96% en throughput de entrenamiento en Ascend, pero no cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | SWE-bench Verified | Terminal-Bench 2.1 | Licencia |
|---|---|---:|---:|---:|---:|---|
| Xing4.0-29B-A4B | 29B | 4B | 256K (512K ext.) | 75,00 | 57,50 | Apache 2.0 |
| Gemma4-26B-A4B | 26B | 4B | no disponible | 53,00 | 30,00 | no disponible |
| Qwen3.6-35B-A3B | 35B | 3B | no disponible | 76,00 | 51,50 | no disponible |

Xing4.0-29B-A4B destaca frente a Gemma4-26B-A4B en tareas de agente y código (SWE-bench y Terminal-Bench), y frente a Qwen3.6-35B-A3B en Terminal-Bench 2.1 y DeepresearchBII, aunque queda por detrás en AIME2026, Tau3-Bench y SWE-bench Multilingual. La licencia Apache 2.0 es un punto diferencial favorable para uso comercial, siempre que se confirme la licencia de los modelos comparados.

## Limitaciones y advertencias

- No se documentan los idiomas naturales soportados; el rendimiento en castellano no está verificado y podría ser inferior al de modelos entrenados explícitamente en lenguas europeas.
- Riesgo de alucinación inherente a los modelos de lenguaje; en tareas de agente de código y terminal, una alucración puede traducirse en comandos destructivos o parches incorrectos, por lo que se recomienda sandboxing y revisión humana.
- El repo es una cuantización GGUF de terceros (Venastine-Research), no la publicación oficial del autor; la calidad de la cuantización y la fidelidad respecto al modelo base no están garantizadas por el desarrollador original.
- El tamaño del repo (222,7 GB) indica múltiples variantes de cuantización; conviene verificar qué fichero concreto se descarga y su huella.
- Aunque la licencia es Apache 2.0, el modelo base podría tener condiciones adicionales no reflejadas en esta ficha; conviene revisar la licencia del modelo original XingChen-AGI/Xing4.0-29B-A4B.
- El contexto de 256K exige memoria de caché KV considerable; con MLA se mitiga, pero en hardware de consumo el contexto efectivo será mucho menor que el nominal.
- El modo thinking está activado por defecto en el ejemplo del autor; en producción conviene desactivarlo para tareas simples y controlar el coste de tokens.
- No hay datos publicados sobre sesgos demográficos, políticos o culturales del modelo.
- El entrenamiento en Ascend NPU y MindSpore no implica que el ecosistema CUDA esté igualmente optimizado; el rendimiento en GPU NVIDIA puede diferir del reportado por el autor.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/Venastine-Research/Xing4.0-29B-A4B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Repositorio GitHub: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- Repositorio previo TeleChat: https://github.com/Tele-AI/TeleChat3
- Paper referenciado 1: https://arxiv.org/abs/2512.24157
- Paper referenciado 2: https://arxiv.org/abs/2507.18013
- vLLM: https://github.com/vllm-project/vllm
- SGLang: https://github.com/sgl-project/sglang
- KTransformers: https://github.com/kvcache-ai/ktransformers
- Harness Claw-Eval: https://github.com/claw-eval/claw-eval
- Harness Tau-Bench: https://github.com/sierra-research/tau-bench
