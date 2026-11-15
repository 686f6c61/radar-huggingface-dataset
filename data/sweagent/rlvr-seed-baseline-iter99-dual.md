# sweagent/rlvr-seed-baseline-iter99-dual

## Resumen

`sweagent/rlvr-seed-baseline-iter99-dual` es un checkpoint de ajuste fino del modelo base Qwen3.5-35B-A3B, publicado por el usuario `sweagent` en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta entradas conjuntas de imagen y texto y genera texto. El checkpoint forma parte de un proceso de entrenamiento por refuerzo con verificación (RLVR, Reinforcement Learning with Verifiable Rewards), a juzgar por el nombre del repositorio, y la iteración 99 sugiere un pipeline de entrenamiento iterativo sobre el modelo base.

El modelo hereda la arquitectura híbrida de Qwen3.5-35B-A3B: una combinación de Gated DeltaNet (atención lineal) y Gated Attention clásica, junto con una capa de mezcla de expertos (MoE) dispersa. El modelo base declara 35.000 millones de parámetros totales con 3.000 millones activos por token, aunque el peso real de los safetensors de este repositorio asciende a 68.164.077.424 parámetros, lo que probablemente incluye el codificador visual y posibles duplicaciones de pesos MTP. La ventana de contexto nativa es de 262.144 tokens, extensible hasta 1.010.000.

La relevancia de esta ficha radica en que el checkpoint es un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card propia (la del repositorio reproduce la del modelo base). Resulta útil para quienes siguen el ecosistema de RL para agentes de software (SWE) y quieren evaluar variantes experimentales sobre Qwen3.5, pero no debe confundirse con un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido: Gated DeltaNet (atención lineal) + Gated Attention, con MoE dispersa; incluye codificador visual |
| Parametros totales | 68.164.077.424 (safetensors del repositorio); el modelo base declara 35B totales |
| Parametros activos | 3B (8 expertos enrutados + 1 compartido por token) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (no se documentan en el repositorio; el formato safetensors permite cuantización posterior a GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible en este repositorio; el modelo base declara 201 idiomas y dialectos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.5-35B-A3B combina dos mecanismos de atención en un layout de 40 capas: por cada bloque de 3 capas con Gated DeltaNet (atención lineal con 32 cabezas para V y 16 para QK, dimensión de cabeza 128) hay 1 capa con Gated Attention clásica (16 cabezas Q, 2 cabezas KV, dimensión de cabeza 256, RoPE de 64 dimensiones). La capa MoE tiene 256 expertos con 8 enrutados más 1 compartido activados por token, y dimensión intermedia de experto de 512. La dimensión oculta es 2048 y el vocabulario tiene 248.320 entradas. El modelo incorpora además un módulo MTP (Multi-Token Prediction) entrenado con varios pasos, útil para decodificación especulativa.

El modelo base se entrenó con fusión temprana de tokens multimodales, lo que según el autor logra paridad con Qwen3 en razonamiento, código y agentes, y supera a Qwen3-VL en benchmarks de comprensión visual. El entrenamiento posterior incluye RL a gran escala en entornos multiagente. Sobre este checkpoint concreto (`rlvr-seed-baseline-iter99-dual`) no se dispone de información sobre el dataset de ajuste, el número de tokens, la composición de datos ni la receta de RL; el nombre sugiere una iteración 99 de un pipeline RLVR con recompensas verificables, probablemente orientado a tareas de ingeniería de software (el prefijo `sweagent` apunta a agentes SWE), pero no hay documentación que lo confirme.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta pares imagen-texto y produce respuestas textuales.
- Razonamiento, código y matemáticas: hereda las capacidades del modelo base Qwen3.5-35B-A3B, que el autor declara a la par de Qwen3 y por encima de Qwen3-VL en benchmarks de razonamiento, código, agentes y comprensión visual.
- Comprensión visual: pipeline `image-text-to-text` con codificador visual integrado.
- Soporte multilingüe: el modelo base declara 201 idiomas y dialectos (no verificado en este checkpoint).
- Tool calling y function calling: no documentado explícitamente en este repositorio; el modelo base se distribuye con soporte para vLLM, SGLang y KTransformers, y la versión alojada Qwen3.5-Flash incluye herramientas integradas.
- Capacidades de agente y razonamiento multi-paso: el nombre del repositorio y el entrenamiento RLVR sugieren orientación a tareas agénticas, sin documentación específica.
- Modo thinking: no disponible en la información del repositorio.

## Casos de uso

- Investigación en RL para agentes de software: el checkpoint sirve como punto de comparación (baseline) frente a iteraciones posteriores del mismo pipeline RLVR; útil para medir el efecto del entrenamiento por refuerzo sobre tareas de resolución de issues y parcheo de código.
- Evaluación de modelos multimodales en investigación: al aceptar imagen y texto, permite experimentar con tareas que combinan capturas de pantalla, diagramas o documentación visual con razonamiento textual, aprovechando la ventana de 262.144 tokens.
- Análisis de documentos técnicos largos: la ventana nativa de 262k tokens (extensible a 1M) permite procesar repositorios completos, manuales o conjuntos de logs junto con imágenes asociadas en una sola pasada.
- Prototipado de asistentes de código con contexto visual: integrable en entornos de desarrollo que muestran diagramas de arquitectura o trazas de error como imágenes y requieren explicaciones textuales.
- Fine-tuning posterior y destilación: al estar en safetensors y licencia Apache 2.0, puede servir como semilla para ajustes específicos de dominio o para experimentos de destilación sobre la arquitectura MoE híbrida.
- Benchmarking de eficiencia de arquitecturas híbridas: con 3B parámetros activos sobre 35B totales (68B en safetensors), es un candidato para medir throughput y latencia de Gated DeltaNet + MoE frente a transformers densos en tareas de investigación.

## Benchmarks y rendimiento

Los benchmarks publicados corresponden al modelo base Qwen3.5-35B-A3B, no a este checkpoint de ajuste. Se reproducen a continuación los datos disponibles en la model card del modelo base:

| Benchmark | GPT-5-mini 2025-08-07 | GPT-OSS-120B | Qwen3-235B-A22B | Qwen3.5-122B-A10B | Qwen3.5-27B | Qwen3.5-35B-A3B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 83.7 | 80.8 | 84.4 | 86.7 | 86.1 | no disponible en el extracto |

No se han publicado resultados de benchmarks específicos para `sweagent/rlvr-seed-baseline-iter99-dual` en la información disponible. La tabla anterior solo cubre la fila MMLU-Pro del bloque de conocimiento; el resto de resultados del modelo base no se incluyen en el extracto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 136,3 GB en safetensors (probablemente en bf16/fp16). En bf16 se necesitan del orden de 130-140 GB de VRAM, lo que requiere múltiples GPU. Con cuantización a 8 bits bajaría a ~70 GB y a 4 bits a ~35-40 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: para bf16, configuraciones multi-GPU como 2×H100 80GB, 2×A100 80GB o 4×A100 40GB. Para cuantización 4 bits, una sola H100 80GB o A100 80GB podría ser suficiente; en consumer, una RTX 4090 de 24 GB no basta en bf16 y probablemente tampoco en 4 bits si se incluye el codificador visual y el contexto largo.
- Cabe en consumer GPU: no de forma directa en bf16; con cuantización agresiva (4 bits o inferior) y contextos cortos podría intentarse en GPUs de 24-48 GB, sin datos verificados.
- Opciones de despliegue: transformers (librería declarada), vLLM, SGLang y KTransformers según la model card del modelo base; llama.cpp/Ollama no están documentados para esta arquitectura híbrida.
- Latencia y throughput: no disponibles. La arquitectura con 3B parámetros activos y atención lineal sugiere buen throughput, pero no hay cifras publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sweagent/rlvr-seed-baseline-iter99-dual | 68,2B (safetensors) / 3B activos | 262.144 nativos, hasta 1.010.000 | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-35B-A3B-Base | 35B / 3B activos | 262.144 nativos, hasta 1.010.000 | Apache 2.0 | Hugging Face (modelo base oficial) |
| Qwen3-235B-A22B | 235B / 22B activos | no disponible en el extracto | no disponible en el extracto | Hugging Face |
| GPT-OSS-120B | 120B (MoE) | no disponible en el extracto | no disponible en el extracto | distribución oficial de OpenAI |

La comparación de rendimiento entre estos modelos solo está disponible para MMLU-Pro en el extracto (GPT-5-mini 83.7, GPT-OSS-120B 80.8, Qwen3-235B-A22B 84.4, Qwen3.5-122B-A10B 86.7, Qwen3.5-27B 86.1); no hay dato para Qwen3.5-35B-A3B ni para este checkpoint en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación sin model card propia: la card del repositorio reproduce la del modelo base, por lo que no hay documentación sobre el ajuste RLVR, sus datos ni su comportamiento esperado.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validación por parte de la comunidad.
- Riesgo de alucinación: inherente a los modelos generativos; sin evaluaciones específicas de este checkpoint no puede cuantificarse.
- Sesgos: no documentados para este checkpoint; el modelo base declara cobertura de 201 idiomas, pero no se detallan sesgos conocidos.
- Idiomas: no disponibles en el repositorio; la cobertura multilingüe del modelo base no está verificada en este ajuste.
- Licencia Apache 2.0: permite uso comercial, pero al ser un derivado de Qwen3.5 conviene revisar la licencia del modelo base y las condiciones de atribución.
- Contexto: aunque el modelo base soporta hasta 1.010.000 tokens, no hay garantía de que este checkpoint conserve esa capacidad tras el ajuste RLVR.
- Formato: solo safetensors; no hay GGUF ni cuantizaciones publicadas, lo que dificulta el despliegue en hardware limitado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sweagent/rlvr-seed-baseline-iter99-dual
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Alibaba Cloud Model Studio (Qwen3.5-Flash): https://modelstudio.alibabacloud.com/
- Guía de usuario de Model Studio: https://www.alibabacloud.com/help/en/model-studio/text-generation
