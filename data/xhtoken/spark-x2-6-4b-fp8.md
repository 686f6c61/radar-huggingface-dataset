# XHToken/Spark-X2.6-4B-FP8

## Resumen

Spark-X2.6-4B-FP8 es la versión cuantizada en FP8 del modelo Spark-X2.6-4B, un LLM compacto de 4.112 millones de parámetros desarrollado por XHToken (equipo detrás de la familia SparkLLM) y orientado especificamente al despliegue en dispositivo (on-device). El modelo base se presenta como la evolucion de Spark-X2.5-4B, manteniendo exactamente la misma arquitectura y obteniendo sus mejoras de capacidad mediante un post-entrenamiento refinado, con avances declarados en codigo, uso de herramientas, contexto largo, multilingue y razonamiento.

La relevancia de esta ficha concreta radica en que se trata de una distribucion en precision FP8 (compressed-tensors), lo que reduce el peso del repositorio a unos 4,5 GB y facilita su ejecucion en GPUs con memoria limitada o en entornos de inferencia de borde, manteniendo el mismo pipeline de text-generation y compatibilidad con transformers. El modelo soporta tres niveles configurables de esfuerzo de razonamiento (none, low, high), lo que permite ajustar latencia y coste de inferencia segun la aplicacion.

La licencia Apache 2.0 y el soporte de solo dos idiomas (ingles y chino) delimitan su ambito practico: es un candidato claro para asistentes locales, agentes con tool calling y automatizacion de codigo en entornos donde el castellano no sea requisito funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura identica a Spark-X2.5-4B; detalles internos no disponibles) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma explicita; el ejemplo oficial genera hasta 131.072 tokens nuevos (max_new_tokens=131072) |
| Tipos de cuantizacion | FP8 (formato de este repositorio, via compressed-tensors); otras cuantizaciones del modelo base no disponibles |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8, compressed-tensors) |
| Libreria | transformers (requiere transformers==4.57.1 y trust_remote_code=True) |
| Tamano del repositorio | 4,5 GB |
| Modelo base | XHToken/Spark-X2.6-4B |
| Fecha de publicacion | 20 de octubre de 2026 (actualizado el 6 de noviembre de 2026) |

## Arquitectura y entrenamiento

La model card indica que Spark-X2.6-4B conserva exactamente la misma arquitectura que Spark-X2.5-4B y que las ganancias de capacidad provienen integramente del post-entrenamiento. No se especifica en la informacion disponible el tipo concreto de bloque (transformer denso, atencion lineal, hibrido, etc.), el numero de capas, las dimensiones ocultas ni la composicion del dataset de entrenamiento. Tampoco se detalla el volumen de tokens utilizados ni si se emplearon tecnicas de RLHF, DPO u otras variantes de alineamiento; solo se menciona de forma generica un "post-training" mejorado.

La innovacion tecnica mas destacada y documentada es el presupuesto de razonamiento controlable: el modelo expone tres niveles (none, low, high). Segun los datos del autor, al pasar de high a low el modelo de 4B pierde 1,7 puntos de media en las tareas evaluadas mientras reduce la longitud media de salida un 22,0 %; el modelo hermano de 1,7B pierde 4,0 puntos y reduce la salida un 37,3 %. Esta esta version FP8, la cuantizacion se realiza con compressed-tensors, lo que implica que el checkpoint debe cargarse con el soporte de transformers correspondiente y no es directamente compatible con cargadores que ignoren dichos metadatos.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline text-generation, tag conversational).
- Razonamiento con presupuesto configurable: modos none, low y high, controlables desde el chat template mediante enable_thinking.
- Codigo y ingenieria de software: mejoras declaradas en tareas de programacion respecto a Spark-X2.5-4B.
- Flujos agenticos: uso complejo de herramientas, planificacion multi-paso y ejecucion de tareas de agente.
- Contexto largo: mejoras declaradas en tareas de long-context; el ejemplo oficial emplea max_new_tokens de 131.072.
- Capacidades matematicas y de conocimiento general evaluadas en el benchmark del autor.
- Multilingue limitado a ingles y chino.
- Sin soporte declarado de vision, audio ni modalidades adicionales en la informacion disponible.
- Compatibilidad con servidores OpenAI-compatible mediante SGLang (imagenes para NVIDIA y Ascend NPU).

## Casos de uso

- Asistentes locales en dispositivo: el modelo esta disenado explicitamente para on-device; con 4,1B parametros en FP8 (4,5 GB de pesos) puede ejecutarse en estaciones de trabajo y portatiles con GPU consumer, ofreciendo un asistente privado sin dependencia de la nube.
- Agentes con tool calling en produccion: sus mejoras declaradas en uso complejo de herramientas y planificacion multi-paso lo hacen adecuado para orquestar APIs, consultas a bases de datos y automatizaciones encadenadas donde cada paso requiere decidir que herramienta invocar.
- Generacion y revision de codigo en pipelines de CI/CD: puede integrarse como paso de revision automatica o generacion de parches, ajustando el nivel de razonamiento a low para reducir latencia en tareas rutinarias y a high para cambios complejos.
- Procesamiento de documentos largos en ingles o chino: con la ventana de generacion de hasta 131.072 tokens mostrada en el ejemplo oficial, es apto para resumir, extraer y responder preguntas sobre expedientes extensos en esos dos idiomas.
- Despliegue de API interna compatible con OpenAI: mediante SGLang se puede servir un endpoint OpenAI-compatible, lo que permite sustituir proveedores externos en herramientas ya existentes sin reescribir el cliente.
- Razonamiento con control de coste: en aplicaciones de atencion al cliente o clasificacion, el modo none o low reduce la longitud de salida un 22 % frente a high con una perdida media de solo 1,7 puntos, optimizando coste por consulta.
- Educacion y tutoria en chino e ingles: el modo thinking permite mostrar el razonamiento paso a paso o desactivarlo para respuestas directas, segun el publico.

## Benchmarks y rendimiento

La model card referencia graficos comparativos (benchmark.svg, all_benchmark.svg, inference.svg, reasoning_effort.svg) frente a modelos on-device de tamano similar, incluyendo Qwen3.5-4B y Gemma-E4B, y afirma que iguala o supera a modelos de aproximadamente 9B parametros en varias pruebas. Sin embargo, los valores numericos concretos no estan incluidos en la informacion proporcionada.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan aproximadamente 4,5 GB; con overhead de activaciones y cache KV, se recomienda un minimo de 6-8 GB de VRAM para contextos moderados y 16 GB o mas para contextos largos (hasta 131.072 tokens de generacion en el ejemplo oficial).
- GPU recomendadas: NVIDIA A100, H100 y GPUs consumer con soporte FP8 (familia RTX 40 y posteriores); el autor publica imagenes SGLang tanto para NVIDIA como para Ascend NPU (A2 y A3 con CANN 9.0.0).
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM para contextos cortos; para contextos largos se recomienda 16-24 GB.
- Opciones de despliegue: transformers 4.57.1 con trust_remote_code=True, SGLang (imagen nightly-dev-cu13 para NVIDIA y builds de Ascend), y servidor OpenAI-compatible provisto por SGLang. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: el autor afirma una eficiencia de inferencia igual o mejor que Qwen3.5-4B y Gemma-E4B, pero no se aportan cifras concretas de tokens por segundo ni latencia en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-FP8 | 4,11B | no disponible (ejemplo con 131.072 tokens de salida) | Apache 2.0 | en, zh | FP8, orientado a on-device, thinking configurable |
| Qwen3.5-4B | no disponible | no disponible | no disponible | no disponible | Citado por el autor como referencia de eficiencia on-device |
| Gemma-E4B | no disponible | no disponible | no disponible | no disponible | Citado por el autor como referencia de eficiencia on-device |
| Spark-X2.5-4B | 4B (aproximado) | no disponible | no disponible | no disponible | Generacion anterior, misma arquitectura |

Los datos de Qwen3.5-4B, Gemma-E4B y Spark-X2.5-4B no se detallan en la informacion proporcionada; solo se citan como terminos de comparacion cualitativa por parte del autor.

## Limitaciones y advertencias

- Idiomas limitados a ingles y chino: no hay soporte declarado de castellano, lo que restringe su uso en productos dirigidos a usuarios hispanohablantes.
- Riesgo de alucinacion inherente a los LLM; no se documentan mecanismos especificos de mitigacion ni tasas de error.
- Sesgos no documentados: la model card no incluye informacion sobre evaluaciones de sesgo, toxicidad o seguridad.
- Contexto maximo no especificado de forma oficial; el valor de 131.072 aparece solo como max_new_tokens en el ejemplo, no como longitud de contexto garantizada.
- Requiere transformers 4.57.1 y trust_remote_code=True, lo que implica ejecutar codigo remoto del autor y limita la portabilidad a otros runners.
- La cuantizacion FP8 con compressed-tensors puede degradar ligeramente la calidad frente al modelo base en BF16; no se aportan metricas de la perdida por cuantizacion.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base y las dependencias (transformers, SGLang) deben verificarse por separado.
- No se documentan limitaciones especificas de contexto largo ni comportamiento en tareas de agente de larga duracion.

## Enlaces

- Hugging Face (este repositorio FP8): https://huggingface.co/XHToken/Spark-X2.6-4B-FP8
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Slack: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
