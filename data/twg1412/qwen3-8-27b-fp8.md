# TWG1412/Qwen3.8-27B-FP8

## Resumen

Qwen3.8-27B-FP8 es la version cuantizada en FP8 del modelo Qwen3.8-27B, un modelo denso de lenguaje y vision desarrollado por el equipo Qwen de Alibaba. Se trata de un modelo nativo de vision-lenguaje que comprende imagenes y videos, con control flexible del modo de pensamiento, disenado para tareas agénticas complejas de multiples pasos. La cuantizacion FP8 con bloque de 128 mantiene un rendimiento practicamente identico al del modelo original, segun el autor del repositorio.

El modelo base tiene 27.781 millones de parametros, una arquitectura hibrida que combina atencion lineal (Gated DeltaNet) con atencion completa (Gated Attention), y una ventana de contexto nativa de 262.144 tokens extensible hasta 1 millon. Esta version cuantizada esta publicada por el usuario TWG1412 en HuggingFace y es compatible con Transformers, vLLM, SGLang y TokenSpeed, lo que facilita su despliegue en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder (hibrida: Gated DeltaNet + Gated Attention) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativa, extensible hasta 1.000.000 |
| Tipos de cuantizacion | FP8 (bloque de 128) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo causal de lenguaje con encoder de vision. Tiene 64 capas con una disposicion oculta de 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). La Gated DeltaNet utiliza 48 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128; la Gated Attention usa 24 cabezas para Q y 4 para KV, con dimension de cabeza 256 y RoPE de dimension 64. La FFN tiene dimension intermedia de 17.408 y el embedding de tokens es de 248.320 (con padding). El modelo incorpora Multi-Token Prediction (MTP) entrenado con multiples pasos, una innovacion que permite predecir varios tokens simultaneamente y mejorar la velocidad de decodificacion.

El entrenamiento consta de fases de pre-entrenamiento y post-entrenamiento. La cuantizacion FP8 aplicada en este repositorio utiliza cuantizacion de grano fino con bloque de 128, y el autor indica que las metricas de rendimiento son casi identicas a las del modelo original. El modelo soporta control flexible del pensamiento: el modo thinking esta activado por defecto, puede desactivarse por peticion, la profundidad del razonamiento se ajusta con `reasoning_effort` y el contexto de razonamiento historico se conserva mediante `preserve_thinking`.

## Capacidades

- Generacion de texto y razonamiento: mejoras integrales en coding, trabajo profesional, investigacion y tareas agénticas de horizonte largo.
- Comprension multimodal: soporte nativo de imagenes y videos, incluyendo diagramas STEM, documentos y videos de hasta una hora de duracion.
- Control flexible del pensamiento: modo thinking activable/desactivable por peticion, con ajuste de profundidad de razonamiento mediante `reasoning_effort`.
- Ejecucion agéntica: planificacion autonoma mas robusta y mejor manejo de la retroalimentacion del entorno, con ejecucion fiable de tareas de extremo a extremo.
- Compatibilidad con herramientas: soporte amplio para harnesses y herramientas de desarrollo populares, facilitando la integracion en stacks existentes.
- Compatibilidad con vLLM y SGLang: el checkpoint FP8 se carga sin problemas en vLLM, que auto-desactiva DeepGemm en Blackwell y usa CUTLASS.

## Casos de uso

- Automatizacion de oficina: el modelo puede generar documentos, resumir informes y gestionar flujos de trabajo de productividad, aprovechando su ventana de 262K tokens para procesar documentos extensos completos.
- Asistente de investigacion: con su modo thinking y razonamiento profundo, puede analizar literatura, sintetizar resultados y ayudar en la redaccion de articulos o informes tecnicos.
- Agentes autonomos con herramientas: su planificacion autonoma y manejo de feedback del entorno lo hacen adecuado para agentes que ejecutan tareas de multiples pasos integrando llamadas a APIs y herramientas externas.
- Analisis de contenido audiovisual: su capacidad de procesar video de hasta una hora permite resumir grabaciones, transcribir reuniones y extraer informacion de contenido audiovisual.
- Generacion de codigo en produccion: con su rendimiento en coding y compatibilidad con harnesses de desarrollo, puede integrarse en pipelines de CI/CD para generacion, revision y refactorizacion de codigo.
- Soporte al cliente multimodal: combinando su comprension de imagenes y texto, puede gestionar tickets de soporte que incluyan capturas de pantalla o diagramas, manteniendo el contexto de conversaciones largas gracias a sus 262K tokens de ventana.
- Analisis de documentos tecnicos: interpreta diagramas, figuras y documentos complejos, respondiendo preguntas sobre ellos con razonamiento paso a paso.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks textuales que compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, abarcando categorias como Coding y tareas agénticas de terminal. Sin embargo, los datos numericos de la tabla no estan completos en la informacion proporcionada, por lo que no se pueden presentar cifras concretas.

En BenchLM.ai, Qwen3.8-27B se posiciona en el puesto 14 de 225 modelos del leaderboard publico con una puntuacion de 72.49/100, y en el puesto 12 de 105 en la verificacion de fuentes. Tiene una ventana de contexto de 262K tokens y usa un modo de razonamiento explicito que puede mejorar la resolucion de problemas complejos a cambio de latencia y uso de tokens adicionales.

## Requisitos de hardware

- Tamaño del repositorio: 30.9 GB (pesos FP8 en formato safetensors).
- VRAM estimada para inferencia: aproximadamente 32-40 GB en FP8, dependiendo de la longitud de contexto y el tamano del batch. Con cuantizacion adicional (por ejemplo, 4 bits) podria caber en GPUs de 24 GB.
- GPUs recomendadas: A100 40GB, H100, RTX 4090 24GB (con cuantizacion adicional), L40S, A6000.
- Compatibilidad con consumer GPU: si, en GPUs de 24 GB con cuantizacion adicional o con gestion cuidadosa de memoria.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, TokenSpeed. En vLLM el checkpoint FP8 se carga sin trabajo adicional; en Blackwell se desactiva DeepGemm y se usa CUTLASS.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Cuantizacion |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27.78B | 262K (extensible a 1M) | Texto + imagen + video | Apache-2.0 | Original (FP16/BF16) |
| Qwen3.8-27B-FP8 | 27.78B | 262K (extensible a 1M) | Texto + imagen + video | Apache-2.0 | FP8 (bloque 128) |
| Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible | No disponible |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | 30B | No disponible | No disponible | No disponible | No disponible |

La model card menciona que Qwen3.8-27B supera a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max en las categorias de benchmarks incluidas, pero no se dispone de los datos numericos completos en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion FP8 puede introducir ligeras perdidas de precision en tareas muy sensibles al error numerico, aunque el autor indica que el rendimiento es practicamente identico al del modelo original.
- Riesgo de alucinacion: como cualquier modelo de lenguaje grande, puede generar informacion falsa o inventada, especialmente en temas de conocimiento especializado o con datos fuera de su rango de entrenamiento.
- Los idiomas soportados no estan documentados en la informacion disponible; se recomienda verificar el comportamiento en el idioma de destino antes de desplegar en produccion.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es una publicacion reciente sin validacion de la comunidad; se recomienda validar el comportamiento del modelo en casos de uso especificos.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base Qwen/Qwen3.8-27B para confirmar las condiciones de uso.
- La fecha de creacion del repositorio es 2026-08-25, lo que indica que es un modelo muy reciente y con poca trayectoria en entornos de produccion.
- El modo de pensamiento activado por defecto anade latencia y consumo de tokens; debe desactivarse cuando la aplicacion requiera respuestas rapidas.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/TWG1412/Qwen3.8-27B-FP8
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- BenchLM.ai: https://benchlm.ai/models/qwen3-8-27b
