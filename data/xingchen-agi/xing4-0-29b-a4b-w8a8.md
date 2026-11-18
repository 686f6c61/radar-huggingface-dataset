# XingChen-AGI/Xing4.0-29B-A4B-w8a8

## Resumen

Xing4.0-29B-A4B-w8a8 es la compilación cuantizada en W8A8 (pesos y activaciones a enteros de 8 bits) del modelo Xing4.0-29B-A4B, un LLM de arquitectura MoE desarrollado por China Telecom Artificial Intelligence Technology Co., Ltd. (serie Xing, anteriormente TeleChat). El modelo base cuenta con 29.000 millones de parámetros totales y solo 4.000 millones activos por token (~13,8 % de activación), lo que permite un serving de alto rendimiento con un coste computacional por token muy contenido.

La arquitectura combina MoE con atención MLA (Multi-head Latent Attention), mHC y MTP (Multi-Token Prediction), y está optimizada para tareas de ingeniería complejas: planificación de contexto largo, razonamiento multi-paso, tool calling y salida estructurada. Soporta de forma nativa 256K tokens de contexto, extensible a 512K.

Esta build W8A8 está pensada para despliegues de alto throughput sobre infraestructura acelerada con NPU, reduciendo huella de memoria y mejorando la eficiencia de inferencia respecto al BF16 manteniendo la precisión. La licencia es Apache 2.0 y los pesos están disponibles en formato transformers con `custom_code`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con mHC + MLA + MTP (transformer con atención latente multi-cabeza) |
| Parametros totales | 29B |
| Parametros activos | 4B por token (~13,8 % de activación) |
| Longitud de contexto | 256K nativo, extensible a 512K |
| Tipos de cuantizacion | W8A8 (pesos y activaciones a int8); existen builds BF16, FP8 y GGUF del mismo modelo base |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `custom_code` (transformers); build GGUF disponible en repo separado |

## Arquitectura y entrenamiento

El modelo es un transformer disperso (MoE) de 40 capas con hidden size de 3584, FFN densa de 9216 y FFN de experto de 1024. Emplea 64 expertos enrutados con 4 expertos activos por token más 1 experto compartido, atención MLA y las innovaciones mHC y MTP. El entrenamiento se realizó de extremo a extremo sobre un stack íntegramente propio (desde silicio hasta software), adaptado a clústeres de NPU domésticas, con un framework de entrenamiento in-house que incluye adaptación de mHC y desarrollo de operadores fusionados. La optimización de comunicación MoE de grano fino, recomputación selectiva, fusión automática grafo-operador y kernels mHC fusionados ajustados a mano elevaron el throughput de entrenamiento aproximadamente un 96 % sobre el rendimiento out-of-the-box.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF/DPO. La build W8A8 cuantiza pesos y activaciones a int8 tras el entrenamiento del modelo base, orientada a serving de alto throughput en infraestructura con NPU.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso con cadenas de razonamiento complejas.
- Planificación de contexto largo y ejecución coherente de tareas sobre ventanas de hasta 256K tokens (512K extensible).
- Tool calling / function calling y salida estructurada, con formato alineado con frameworks de agentes como OpenCode, Claude Code, OpenClaw y Hermes.
- Ejecución de flujos agénticos multi-paso con estabilidad de ejecución bajo contextos extensos.
- Adaptación ligera a dominios propietarios: clasificación de intención, comprensión de tablas, auditoría de contratos y QA sobre base de conocimiento.
- Capacidades multilingües: no disponible (no se detallan idiomas en la información proporcionada).
- Fine-tuning soportado vía ms-swift y LLaMA-Factory (integraciones mergeadas upstream).
- Serving vía SGLang mainline, plugin oficial de vLLM y llama.cpp (b12174+) para inferencia local en GGUF.

## Casos de uso

- Agentes autónomos de ingeniería de software: el modelo puede planificar y ejecutar tareas multi-paso con tool calling sobre repositorios, integrándose en flujos tipo Claude Code u OpenCode gracias a su formato alineado con estos frameworks.
- Atención al cliente automatizada: gestión de conversaciones multi-turno con contexto largo (256K tokens) que permite arrastrar historial extenso, documentación de producto y estado de la cuenta sin truncamientos agresivos.
- Auditoría de contratos y análisis documental: adaptación ligera sobre datos propietarios para revisión de cláusulas, extracción estructurada y QA sobre corpus legales de gran tamaño.
- Generación de código en producción: soporte de salida estructurada y tool calling para integrarse en pipelines de CI/CD, generación de parches y revisión automatizada.
- Comprensión de tablas y datos estructurados: extracción y razonamiento sobre tablas dentro de flujos de business intelligence, aprovechando la ventana de contexto para procesar hojas completas.
- Clasificación de intención y enrutado en asistentes: fine-tuning ligero para enrutar consultas a subsistemas especializados con bajo coste de adaptación.
- Serving de alto throughput en infraestructura NPU: la build W8A8 reduce huella de memoria y permite atender muchas peticiones concurrentes en clústeres con aceleradores NPU, donde el modelo está cooptimizado.

## Benchmarks y rendimiento

La model card incluye una sección de benchmarks medida sobre el modelo base en BF16, pero la información proporcionada está truncada en la tabla comparativa (solo se alcanza a ver el encabezado con "Xing4.0-29B-A4B" y el inicio de una comparación con "Gemma4-26..."). No se dispone de las cifras numéricas, por lo que no se presentan resultados.

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- El repo ocupa 35,2 GB, coherente con pesos int8 de un modelo de 29B parámetros; la VRAM de inferencia debe acomodar pesos más estados de activación y caché KV para contexto largo.
- VRAM estimada: no disponible de forma explícita; los pesos W8A8 rondan los 29 GB, por lo que se requiere al menos una GPU de 40 GB (A100 40GB) para caber con margen, y preferiblemente 80 GB (A100/H100) para contextos largos.
- GPU recomendadas: A100 80GB, H100 80GB para serving de producción; el modelo está cooptimizado para clústeres con NPU domésticas.
- En GPU consumer: no cabe de forma holgada en RTX 4090 (24 GB) en W8A8; para equipos de consumo se recomienda la build GGUF del mismo modelo base vía llama.cpp.
- Opciones de despliegue: SGLang mainline (PR #39793), plugin oficial de vLLM, llama.cpp (b12174+) para GGUF, transformers con `custom_code`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xing4.0-29B-A4B (W8A8) | 29B | 4B | 256K (512K ext.) | Apache 2.0 | HF, ModelScope, GitHub |
| Gemma4-26 (referencia en model card) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la misma clase agéntica | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card menciona una comparación head-to-head con modelos agénticos abiertos de la misma clase, incluyendo Gemma4-26, pero la información proporcionada está truncada y no permite extraer parámetros, contexto ni resultados de esos comparables.

## Limitaciones y advertencias

- La build W8A8 introduce cuantización en pesos y activaciones; puede haber una degradación de precisión respecto al BF16 en tareas sensibles, aunque la model card afirma que se mantiene la exactitud.
- No se detallan los idiomas soportados; el uso en castellano no está garantizado y debe validarse empíricamente.
- Riesgo de alucinación inherente a los LLM; no se documentan tasas de alucinación ni evaluaciones de factualidad.
- Sesgos conocidos: no disponibles en la información proporcionada.
- El modelo está cooptimizado para NPU domésticas; el rendimiento en GPU occidentales puede no reflejar las cifras de la model card.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene revisar las condiciones de los frameworks de agentes con los que se alinea el formato (Claude Code, OpenCode, etc.), que tienen sus propias licencias.
- La información de benchmarks está incompleta en la documentación disponible; no se deben asumir cifras de rendimiento sin verificarlas en el repo BF16.

## Enlaces

- Hugging Face (W8A8): https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-w8a8
- Hugging Face (BF16, modelo base): https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Hugging Face (FP8): https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-FP8
- Hugging Face (GGUF): https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-GGUF
- Organización en Hugging Face: https://huggingface.co/XingChen-AGI
- GitHub: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- ModelScope: https://modelscope.cn/models/XingChen-AGI/Xing4.0-29B-A4B-w8a8
- Licencia: https://github.com/XingChen-AGI/Xing4.0-29B-A4B/blob/main/LICENSE
- Paper (arXiv 2611.22115): https://arxiv.org/abs/2611.22115
- Paper (arXiv 2512.24157): https://arxiv.org/abs/2512.24157
- Paper (arXiv 2507.18013): https://arxiv.org/abs/2507.18013
- Integración ms-swift: https://github.com/modelscope/ms-swift/pull/10275
- Integración LLaMA-Factory: https://github.com/hiyouga/LlamaFactory/pull/10754
- Soporte SGLang: https://github.com/sgl-project/sglang/pull/39793
- Soporte llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31589
- TeleChat (predecesor): https://github.com/Tele-AI/TeleChat3
