# XingChen-AGI/Xing4.0-29B-A4B-FP8

## Resumen
Xing4.0-29B-A4B-FP8 es la compilación en cuantización FP8 del modelo Xing4.0-29B-A4B, un LLM de arquitectura Mixture-of-Experts (MoE) desarrollado por XingChen-AGI (China Telecom Artificial Intelligence Technology Co., Ltd.), sucesor de la familia TeleChat. El modelo cuenta con 29B parámetros totales (31.215.031.088 según los pesos safetensors) de los que solo ~4B se activan por token (~13,8 %), lo que permite un despliegue con coste computacional propio de un modelo denso de 4B pero con la capacidad de representación de uno de 29B. Esta variante FP8 está empaquetada para servir con SGLang o vLLM sobre hardware con soporte de FP8, reduciendo huella de memoria y aumentando el throughput.

El modelo está orientado a tareas de ingeniería complejas: planificación de contexto largo, razonamiento multi-paso, tool calling y salida estructurada, con una longitud de contexto nativa de 256K tokens extensible a 512K. Incorpora una arquitectura propia denominada mHC + MLA + MTP, con atención Multi-head Latent Attention (MLA) y Multi-Token Prediction (MTP), y fue entrenado de extremo a extremo sobre una pila completamente interna (silicio a software) optimizada para clústeres NPU domésticos.

Su relevancia actual radica en que combina una licencia Apache 2.0 permisiva, integración upstream en el ecosistema abierto (ms-swift, LLaMA-Factory, SGLang, llama.cpp) y un formato alineado con frameworks de agentes como OpenCode, Claude Code, OpenClaw o Hermes, lo que facilita su adopción tanto en investigación como en producción sin fricción de integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con mHC + MLA + MTP (transformer con Multi-head Latent Attention y Multi-Token Prediction) |
| Parametros totales | 29B (31.215.031.088 según safetensors) |
| Parametros activos | ~4B por token (~13,8 % de activación) |
| Longitud de contexto | 256K nativo, extensible a 512K |
| Tipos de cuantizacion | FP8 (esta build); existen builds BF16, GGUF y W8A8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8), con código custom (`custom_code`) |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura MoE de 40 capas con hidden size de 3584, FFN densa de 9216 y tamaño de experto intermedio de 1024. Dispone de 64 expertos enrutados, de los que se activan 4 por token, más 1 experto compartido. La atención es de tipo MLA (Multi-head Latent Attention), que comprime las representaciones de clave-valor para reducir el coste de memoria en contextos largos, y añade MTP (Multi-Token Prediction) para mejorar la eficiencia de decodificación. La etiqueta "mHC" hace referencia a una adaptación propia de features sobre la que el autor no detalla la semántica exacta en la información disponible.

El entrenamiento se realizó de extremo a extremo sobre una pila completamente interna, adaptada a clústeres NPU domésticos, con desarrollo de operadores fusionados y kernels mHC ajustados a mano. Según la model card, las optimizaciones de comunicación MoE de grano fino, recomputación selectiva y fusión automática de grafos y operadores permitieron un incremento de throughput de entrenamiento de aproximadamente un 96 % sobre el rendimiento out-of-the-box. No se especifica en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades
- Generación de texto conversacional y de propósito general.
- Razonamiento multi-paso y ejecución de cadenas de razonamiento complejas.
- Planificación en contexto largo (hasta 256K tokens nativos, 512K extendidos).
- Tool calling / function calling, con formato alineado a frameworks de agentes (OpenCode, Claude Code, OpenClaw, Hermes).
- Salida estructurada, adecuada para pipelines que requieren JSON u otros formatos parseables.
- Capacidades de agente autónomo con coherencia de tarea bajo contextos extensos.
- Adaptación ligera a dominios específicos: clasificación de intención, comprensión de tablas, auditoría de contratos y QA sobre base de conocimiento.
- Capacidades multilingües: no disponible en la información proporcionada.
- No se documentan capacidades de visión ni audio en la información disponible.

## Casos de uso
- Agentes de codificación autónomos: el modelo puede integrarse en entornos como OpenCode o Claude Code para planificar refactorizaciones multi-archivo, ejecutar tool calls contra el sistema de ficheros y mantener coherencia en tareas largas gracias a su ventana de 256K tokens.
- Automatización de atención al cliente multi-turno: con 256K de contexto puede arrastrar historiales extensos y documentación de producto sin truncar, y su soporte de salida estructurada permite generar respuestas y acciones parseables.
- Auditoría de contratos y documentos legales: la ventana larga permite procesar contratos completos en una sola pasada, y la adaptación ligera sobre datos propietarios facilita ajustar el modelo a terminología jurídica específica.
- Comprensión de tablas y extracción de datos estructurados: útil en pipelines de ingesta documental donde hay que convertir tablas y formularios en JSON validado mediante salida estructurada.
- QA sobre base de conocimiento empresarial: combinando recuperación (RAG) con el contexto largo del modelo, se pueden inyectar múltiples fragmentos recuperados y mantener trazabilidad de la respuesta.
- Clasificación de intención y enrutamiento en asistentes: el modelo puede actuar como clasificador/enrutador previo a otros modelos o servicios, con ajuste fino ligero sobre datos internos.
- Servicio de alto throughput en producción: al ser una build FP8 con solo 4B activos por token, es adecuado para despliegues con SGLang o vLLM sobre GPUs con soporte FP8, maximizando tokens por segundo por unidad de memoria.

## Benchmarks y rendimiento
Los resultados publicados corresponden al modelo base en BF16 (no a esta build FP8). La model card solo incluye una comparativa parcial frente a Gemma4-26B-A4B y Qwen3.6-35B-A3B:

| Benchmark | Xing4.0-29B-A4B | Gemma4-26B-A4B | Qwen3.6-35B-A3B |
|---|---|---|---|
| IFBench | 69,67 | 72,67 | 65,50 |
| AIME2026 | 90,00 | 88,30 | 92,70 |
| AA.LCR | no disponible (dato truncado en la información) | no disponible | no disponible |

No se han proporcionado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks adicionales. No se inventan cifras.

## Requisitos de hardware
- VRAM estimada para inferencia en FP8: aproximadamente 31 GB solo para pesos (29B parámetros a 1 byte por parámetro), más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de ~40-48 GB para contextos moderados.
- Para contexto completo de 256K, la caché KV crece de forma significativa; MLA reduce este coste frente a atención estándar, pero se recomienda planificar GPUs con 80 GB o más para contextos muy largos.
- GPUs recomendadas: H100/H200 (soporte FP8 nativo), A100 (soporte FP8 limitado, mejor usar BF16 o W8A8), L40S y GPUs con soporte FP8 para servir con SGLang o vLLM.
- En GPUs de consumo (RTX 4090, 24 GB) no cabe en FP8 completo; sería necesario recurrir a la build GGUF con cuantización inferior (p. ej. Q4) y llama.cpp, con pérdida de contexto efectivo.
- Opciones de despliegue: SGLang (soporte mainline, PR #39793), plugin oficial de vLLM, llama.cpp (build GGUF, b12174+), transformers con `custom_code`.
- Fine-tuning: ms-swift (PR #10275) y LLaMA-Factory (PR #10754), ambos mergeados upstream.
- Latencia y throughput estimados: no disponibles en la información proporcionada; la model card solo indica que la build FP8 está pensada para alto throughput en hardware con soporte FP8.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Xing4.0-29B-A4B-FP8 | 29B | ~4B | 256K (512K ext.) | Apache 2.0 | Build FP8 para serving de alto throughput |
| Gemma4-26B-A4B | 26B | ~4B | no disponible | no disponible | Mejor IFBench (72,67) que Xing en la comparativa publicada |
| Qwen3.6-35B-A3B | 35B | ~3B | no disponible | no disponible | Mejor AIME2026 (92,70); peor IFBench (65,50) |

En la comparativa publicada, Xing4.0 se sitúa entre ambos: supera a Qwen3.6 en IFBench y a Gemma4 en AIME2026, pero no lidera ninguna de las dos métricas. No se dispone de datos de contexto, licencia ni disponibilidad de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias
- Los benchmarks publicados corresponden al modelo base en BF16; el rendimiento de esta build FP8 puede diferir ligeramente y no se han publicado evaluaciones específicas de la versión cuantizada.
- No se documentan los idiomas soportados; el entrenamiento parece centrado en inglés y chino, por lo que el rendimiento en castellano no está garantizado y debería evaluarse empíricamente.
- Riesgo de alucinación inherente a los LLM, especialmente en tareas de QA sobre conocimiento factual y en contextos muy largos donde la recuperación de detalles puede degradarse.
- Sesgos conocidos: no disponibles en la información proporcionada; se recomienda auditoría propia antes de uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento (no publicadas) por posibles restricciones subyacentes.
- El uso de `custom_code` en transformers implica confiar en código del repositorio; revisar antes de desplegar en entornos sensibles.
- La ventana de 512K es "extensible", no nativa; el rendimiento más allá de 256K puede degradarse y requiere validación.
- El soporte FP8 depende del hardware; en GPUs sin FP8 nativo (p. ej. A100) es preferible usar las builds BF16 o W8A8.

## Enlaces
- Hugging Face (esta build FP8): https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-FP8
- Hugging Face (build BF16): https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Hugging Face (build GGUF): https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-GGUF
- Hugging Face (build W8A8): https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-w8a8
- Organización en Hugging Face: https://huggingface.co/XingChen-AGI
- GitHub: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- ModelScope: https://modelscope.cn/models/XingChen-AGI/Xing4.0-29B-A4B-FP8
- Modelers: https://modelers.cn/models/XingChen-AGI/Xing4.0-29B-A4B-FP8
- Licencia: https://github.com/XingChen-AGI/Xing4.0-29B-A4B/blob/main/LICENSE
- Predecesor (TeleChat): https://github.com/Tele-AI/TeleChat3
- PR ms-swift: https://github.com/modelscope/ms-swift/pull/10275
- PR LLaMA-Factory: https://github.com/hiyouga/LlamaFactory/pull/10754
- PR SGLang: https://github.com/sgl-project/sglang/pull/39793
- PR llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31589
- Papers referenciados en tags: arxiv:2611.22115, arxiv:2512.24157, arxiv:2507.18013 (URLs completas no disponibles en la información proporcionada)
