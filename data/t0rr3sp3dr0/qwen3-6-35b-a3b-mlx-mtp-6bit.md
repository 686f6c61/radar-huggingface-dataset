# t0rr3sp3dr0/Qwen3.6-35B-A3B-MLX-MTP-6bit

## Resumen

Este repositorio contiene una conversión a formato MLX del modelo Qwen3.6-35B-A3B, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Alibaba (Qwen). La versión original tiene 35 mil millones de parámetros totales, de los cuales solo 3 mil millones se activan por token, lo que permite ejecutarlo en hardware de consumo con una huella de memoria reducida. El autor de este repositorio, t0rr3sp3dr0, ha aplicado una cuantización de 6 bits y ha incluido soporte para Multi-Token Prediction (MTP), una técnica que acelera la inferencia al predecir varios tokens de forma simultánea.

La relevancia de este modelo radica en que combina un rendimiento de nivel frontera en tareas de razonamiento y generación de código con la posibilidad de ejecutarse en una GPU de gama media como la RTX 3090 (24 GB de VRAM). Al estar licenciado bajo Apache 2.0, su uso comercial está permitido sin restricciones. Este repositorio concreto está pensado para entornos Apple Silicon mediante la librería MLX, aunque el modelo base también está disponible en otros formatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Multi-Token Prediction (MTP) |
| Parametros totales | 35B (modelo base) / 8.619.440.944 reportados en safetensors de este repo |
| Parametros activos | 3B (por token, segun modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6-bit (este repo); el modelo base tambien se distribuye en bf16 y GGUF (UD-Q4_K_M) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de tipo MoE con 35B parámetros totales y 3B activos por token. La arquitectura MoE permite que solo una fracción de los parámetros se utilice en cada paso de inferencia, lo que reduce drásticamente el coste computacional y la memoria necesaria en comparación con un modelo denso del mismo tamaño. La versión de este repositorio añade MTP (Multi-Token Prediction), una técnica que entrena al modelo para predecir varios tokens futuros simultáneamente, mejorando la velocidad de generación y la coherencia del texto.

No se dispone de información detallada sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. El repositorio actual es una conversión a MLX con cuantización de 6 bits, por lo que no introduce cambios en la arquitectura subyacente, solo en la representación de los pesos.

## Capacidades

- Generación de texto y razonamiento complejo, gracias a la arquitectura MoE de 3B activos que mantiene una alta capacidad de cómputo por token.
- Generación de código y soporte para tareas de programación, según las guías web que lo describen como un modelo de codificación de nivel frontera.
- Multi-Token Prediction (MTP): capacidad de predecir varios tokens a la vez, lo que acelera la inferencia y mejora la fluidez del texto generado.
- Ejecución eficiente en hardware de consumo: al activar solo 3B parámetros, el modelo puede correr en GPUs con 24 GB de VRAM o en Apple Silicon mediante MLX.
- Multilingüismo: no se especifican idiomas concretos, pero el modelo base de Qwen suele soportar múltiples lenguas; este dato no está disponible en la información proporcionada.
- Tool calling y agentes: no se menciona soporte explícito en la documentación de este repositorio.

## Casos de uso

- Asistente de programación local: el modelo puede integrarse en un IDE o editor de código para autocompletar, generar funciones o explicar fragmentos, ejecutándose en una GPU de 24 GB sin necesidad de conexión a internet.
- Chatbot de atención al cliente en entornos con privacidad estricta: al ser Apache 2.0 y ejecutable en local, permite desplegar un asistente conversacional sin enviar datos a servidores externos.
- Prototipado rápido de aplicaciones de IA en Apple Silicon: gracias al formato MLX, desarrolladores con Macs (M1/M2/M3) pueden probar el modelo sin necesidad de hardware NVIDIA.
- Investigación en eficiencia de inferencia: la combinación de MoE y MTP es un caso de estudio para medir el rendimiento de técnicas de aceleración en modelos grandes.
- Generación de documentación técnica: el modelo puede redactar manuales, comentarios de código o resúmenes de APIs, aprovechando su capacidad de razonamiento y contexto largo (aunque la longitud exacta no está disponible).
- Despliegue en edge computing: con cuantización de 6 bits y solo 3B activos, el modelo puede ejecutarse en dispositivos con recursos limitados, como estaciones de trabajo con una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización de 6 bits en la información disponible. Las guías web mencionan que el modelo base Qwen3.6-35B-A3B es un modelo de codificación de nivel frontera, pero no proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros tests. Tampoco se dispone de datos de rendimiento (latencia, throughput) para esta versión MLX. Se recomienda consultar la documentación oficial de Qwen para obtener métricas del modelo base.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 31.1 GB, por lo que se necesitan al menos 32 GB de memoria unificada en Apple Silicon o una GPU con 24 GB de VRAM si se usa un adaptador (aunque MLX está diseñado para Apple Silicon, no para CUDA). Para la versión GGUF UD-Q4_K_M, la guía de insiderllm indica que cabe en 24 GB y corre a 157.66 tok/s en una RTX 3090.
- GPU recomendadas: Apple Silicon (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max) para MLX; para otras plataformas, se puede usar el modelo base en formato GGUF con llama.cpp o vLLM.
- Si se usa el modelo base en bf16, se necesitarían alrededor de 70 GB de VRAM (35B × 2 bytes), lo que requiere GPUs profesionales como A100 o H100. La cuantización de 6 bits reduce este requisito a aproximadamente 26 GB, aunque el tamaño del repo sugiere un poco más.
- Opciones de despliegue: MLX (para Apple Silicon), llama.cpp (para GGUF), vLLM (para el modelo base en bf16), Ollama (si se convierte a GGUF).
- Latencia y throughput: no disponibles para esta versión específica; la guía web reporta 157.66 tok/s en RTX 3090 con cuantización UD-Q4_K_M, pero no es directamente aplicable a MLX.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este repo) | 35B | 3B | no disponible | Apache 2.0 | MLX 6-bit |
| Qwen3.6-27B (dense) | 27B | 27B | no disponible | Apache 2.0 | no disponible |
| Mixtral 8x7B | 46.7B | 12.9B | 32k | Apache 2.0 | GGUF, safetensors |
| DeepSeek-V2 (MoE) | 236B | 21B | 128k | MIT | no disponible |

La comparativa se basa en datos públicos de los modelos base. Qwen3.6-35B-A3B destaca por su bajo número de parámetros activos (3B), lo que lo hace más eficiente que Mixtral 8x7B (12.9B activos) y mucho más ligero que DeepSeek-V2. Su licencia Apache 2.0 es más permisiva que la MIT de DeepSeek, aunque ambas permiten uso comercial.

## Limitaciones y advertencias

- Sesgos: no se dispone de información sobre sesgos específicos del modelo base; como todo LLM, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación: inherente a los modelos generativos; se recomienda verificar los hechos generados, especialmente en contextos técnicos o médicos.
- Limitaciones de contexto: la longitud de contexto no está documentada en este repositorio; es posible que sea inferior a la de otros modelos de Qwen (como 128k en versiones recientes), pero no se puede confirmar.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se debe mantener el aviso de copyright y la atribución.
- Cuantización de 6 bits: puede introducir una ligera degradación en la calidad de salida en comparación con el modelo en bf16, especialmente en tareas de razonamiento complejo.
- Compatibilidad: este formato MLX solo funciona en Apple Silicon; para otras plataformas es necesario usar el modelo base en otro formato (GGUF, etc.).
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una conversión reciente y no ha sido ampliamente probada por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/t0rr3sp3dr0/Qwen3.6-35B-A3B-MLX-MTP-6bit
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Versión abliterada (sin censura) por huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
- Guía de ejecución local (insiderllm): https://insiderllm.com/guides/best-way-run-qwen-3-6-35b-moe-locally/
- Guía completa de Qwen 3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Guía de hardware para Qwen 3.6-35B (compute-market): https://www.compute-market.com/blog/qwen-3-6-local-hardware-guide-2026
