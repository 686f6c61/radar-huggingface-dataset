# XingChen-AGI/Xing4.0-29B-A4B

## Resumen

Xing4.0-29B-A4B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por XingChen-AGI, la division de inteligencia artificial de China Telecom. Con 29.000 millones de parametros totales y solo 4.000 millones activos por token (un 13,8 % de activacion), el modelo esta disenado especificamente para tareas de ingenieria compleja: planificacion con contexto largo, razonamiento multi-paso, tool calling y generacion de salida estructurada. Es la evolucion de la serie Xing, anteriormente conocida como TeleChat.

La arquitectura combina atencion MLA (Multi-head Latent Attention), un mecanismo mHC y Multi-Token Prediction (MTP), sobre 40 capas con un tamano oculto de 3584. Soporta de forma nativa una longitud de contexto de 256K tokens, extensible hasta 512K, lo que lo posiciona en la liga de modelos orientados a agentes y tareas de repositorio completo. Su licencia Apache 2.0 y la disponibilidad de pesos en BF16, FP8, GGUF y W8A8 lo hacen atractivo tanto para investigacion como para despliegue en produccion.

El modelo resulta relevante ahora porque compite directamente con alternativas abiertas de su clase en benchmarks de agentes y codigo (SWE-bench Verified 75,0; Terminal-Bench 2.1 57,5; Claw-Eval 76,55), y porque su integracion con el ecosistema abierto (vLLM, SGLang, llama.cpp, ms-swift, LLaMA-Factory) reduce la friccion de adopcion. Ademas, su entrenamiento se realizo integramente sobre una pila propia, desde el silicio hasta el software, con optimizaciones que elevaron el throughput de entrenamiento un 96 % respecto a la configuracion base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con mHC + MLA + MTP, transformer de 40 capas |
| Parametros totales | 29B (31.215.031.088 reales segun safetensors) |
| Parametros activos | 4B por token (~13,8 % de activacion) |
| Longitud de contexto | 256K nativo, extensible a 512K |
| Tipos de cuantizacion | BF16, FP8, GGUF (2-8 bits), W8A8 |
| Idiomas soportados | Ingles y chino (segun model card); no disponible el resto |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), GGUF, FP8, W8A8 |

Otros datos de arquitectura: hidden size 3584, FFN denso con tamano intermedio 9216, expertos con tamano intermedio 1024, 64 expertos enrutados, 4 expertos activos por token y 1 experto compartido.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con mezcla de expertos (MoE) de grano fino. Cada token activa 4 de los 64 expertos enrutados mas un experto compartido, lo que mantiene el coste computacional por token en el orden de un modelo denso de 4B pese a almacenar 29B de parametros. La atencion utiliza MLA (Multi-head Latent Attention), que comprime las representaciones de clave-valor para reducir el coste de memoria en contextos largos, mientras que el componente mHC y el Multi-Token Prediction (MTP) mejoran la coherencia en planificacion multi-paso y la eficiencia de decodificacion. La longitud de contexto nativa es de 256K tokens, ampliable a 512K.

El entrenamiento se realizo de extremo a extremo sobre una pila completamente propia, adaptada a clusters de NPU domesticos, con un framework de entrenamiento interno. Las optimizaciones incluyen comunicacion MoE de grano fino, recomputacion selectiva, fusion automatica de grafos y operadores, y kernels mHC fusionados ajustados manualmente, lo que elevo el throughput global de entrenamiento aproximadamente un 96 % respecto al rendimiento out-of-the-box. La model card no detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset, ni si se aplicaron fases especificas de RLHF o DPO; estos datos figuran como no disponibles.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto de hasta 256K tokens (512K extensible).
- Razonamiento multi-paso y planificacion de tareas largas, orientado a flujos agenticos.
- Tool calling y function calling, con formato alineado con frameworks como OpenCode, Claude Code, OpenClaw y Hermes.
- Generacion de codigo y resolucion de issues en repositorios (SWE-bench Verified 75,0; SWE-bench Multilingual 66,0).
- Ejecucion en terminal y entornos de linea de comandos (Terminal-Bench 2.1 57,5).
- Razonamiento matematico de competicion (AIME2026 90,0).
- Salida estructurada y seguimiento de instrucciones (IFBench 69,67).
- Capacidades multilingues limitadas a ingles y chino segun la model card.
- Adaptacion ligera a dominios propietarios: clasificacion de intenciones, comprension de tablas, auditoria de contratos y QA sobre conocimiento.
- No se mencionan capacidades de vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso

- Agentes de ingenieria de software: el modelo puede recibir un issue de un repositorio, navegar por el codigo, aplicar parches y validar pruebas, gracias a su contexto de 256K tokens y a su rendimiento de 75,0 en SWE-bench Verified; se integraria en pipelines de CI/CD o en asistentes tipo Claude Code.
- Automatizacion de terminal y DevOps: con 57,5 en Terminal-Bench 2.1, es adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos de shell, reduciendo la intervencion manual en tareas de despliegue.
- Atencion al cliente automatizada: su ventana de 256K permite gestionar conversaciones multi-turno con historial extenso y documentacion de soporte adjunta, manteniendo coherencia en sesiones largas.
- Auditoria de contratos y documentos legales: la model card menciona adaptacion ligera para auditoria de contratos; con contexto largo puede procesar expedientes completos y extraer clausulas, riesgos y obligaciones en salida estructurada.
- Comprension de tablas y datos estructurados: orientado a table understanding, puede integrarse en pipelines de extraccion y validacion de datos financieros o administrativos.
- Investigacion profunda y sintesis documental: con contexto de 256K y capacidad de planificacion multi-paso, puede agregar fuentes extensas, contrastar informacion y generar informes estructurados (evaluado en DeepresearchBII, aunque el valor no se detalla en la informacion disponible).
- Razonamiento matematico y tutorizacion: su 90,0 en AIME2026 lo hace util para resolver problemas de competicion y explicar pasos intermedios en entornos educativos.
- Clasificacion de intenciones y enrutamiento en asistentes: adaptacion ligera sobre datos propios para dirigir consultas a flujos especializados con bajo coste de ajuste.

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
| DeepresearchBII | no disponible | no disponible | no disponible |

El modelo destaca en Claw-Eval y Terminal-Bench 2.1, donde supera a sus comparables, y queda cerca de Qwen3.6-35B-A3B en SWE-bench Verified y Multilingual. En IFBench y AA.LCR queda por detras de Gemma4-26B-A4B.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 62 GB solo para pesos, mas cache KV; requiere multiples GPU o una GPU de 80 GB con cuantizacion parcial.
- FP8: alrededor de 31 GB para pesos, viable en una A100/H100 de 80 GB o en dos RTX 4090 de 24 GB.
- GGUF (2-8 bits): entre 11 y 34 GB segun cuantizacion, segun la model card; las variantes de 4 bits caben en una RTX 4090 de 24 GB.
- W8A8: pensado para despliegue en servidores con aceleracion de enteros de 8 bits.
- GPU recomendadas: H100, A100 80 GB para BF16/FP8; RTX 4090 o A6000 para GGUF de 4-8 bits.
- Opciones de despliegue: vLLM (plugin oficial), SGLang (rama main), llama.cpp (b12174+), ms-swift y LLaMA-Factory para fine-tuning.
- Latencia y throughput: no disponibles en la informacion proporcionada; la activacion de solo 4B por token reduce el coste computacional frente a un denso de 29B, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | SWE-bench Verified | Terminal-Bench 2.1 | Licencia |
|---|---|---:|---|---:|---:|---|
| Xing4.0-29B-A4B | 29B | 4B | 256K (512K ext.) | 75,00 | 57,50 | Apache 2.0 |
| Gemma4-26B-A4B | 26B | 4B | no disponible | 53,00 | 30,00 | no disponible |
| Qwen3.6-35B-A3B | 35B | 3B | no disponible | 76,00 | 51,50 | no disponible |

Frente a Gemma4-26B-A4B, Xing4.0 ofrece mejor rendimiento en tareas de codigo y terminal, aunque pierde en IFBench y AA.LCR. Frente a Qwen3.6-35B-A3B, el rendimiento es muy cercano en SWE-bench, con ventaja de Xing4.0 en Terminal-Bench y Claw-Eval. La licencia Apache 2.0 de Xing4.0 facilita el uso comercial sin restricciones adicionales conocidas.

## Limitaciones y advertencias

- Idiomas: la model card solo declara ingles y chino; el rendimiento en castellano no esta documentado y podria ser inferior.
- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de investigacion profunda y sintesis documental.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la informacion disponible.
- Datos de entrenamiento: no se detalla el numero de tokens, la composicion del dataset ni las fases de alineacion (RLHF/DPO), lo que dificulta evaluar riesgos de contaminacion.
- Contexto: aunque soporta 256K nativo, el rendimiento en el extremo de la ventana y en la extension a 512K no esta cuantificado.
- Despliegue: BF16 requiere hardware de gama alta; las variantes cuantizadas pueden degradar calidad y no se publican metricas de degradacion.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los terminos de los frameworks de terceros integrados (vLLM, SGLang, llama.cpp).
- Madurez del ecosistema: el soporte en vLLM depende de un plugin oficial y en SGLang de la rama main, lo que puede implicar inestabilidad en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Organizacion en Hugging Face: https://huggingface.co/XingChen-AGI
- GitHub: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- ModelScope: https://modelscope.cn/models/XingChen-AGI/Xing4.0-29B-A4B
- Modelers: https://modelers.cn/models/XingChen-AGI/Xing4.0-29B-A4B
- Plugin vLLM: https://github.com/XingChen-AGI/xing4-vllm-plugin
- Plataforma Tianyi AI: https://www.teleai.com.cn/
- Variante FP8: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-FP8
- Variante GGUF: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-GGUF
- Variante W8A8: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-w8a8
- Paper arXiv 2512.24157: https://arxiv.org/abs/2512.24157
- Paper arXiv 2507.18013: https://arxiv.org/abs/2507.18013
- TeleChat (predecesor): https://github.com/Tele-AI/TeleChat3
