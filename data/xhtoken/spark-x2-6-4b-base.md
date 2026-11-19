# XHToken/Spark-X2.6-4B-Base

## Resumen

Spark-X2.6-4B-Base es un modelo de lenguaje de 4.112.079.360 parámetros desarrollado por XHToken (SparkLLM Team), presentado como la evolución de la familia Spark-X2.5-4B orientada al despliegue en dispositivo (on-device). Aunque el repositorio se etiqueta como "Base", la model card indica que contiene los pesos de un modelo post-entrenado en formato Hugging Face Transformers, con mejoras sustanciales en código, uso de herramientas (agentic), contexto largo, multilingüismo y razonamiento respecto a la generación anterior.

La propuesta técnica clave es mantener exactamente la misma arquitectura que Spark-X2.5-4B y obtener la mejora de capacidades exclusivamente mediante un post-entrenamiento refinado, lo que reduce el coste de migración para quien ya integró la versión previa. El autor afirma que el modelo alcanza un rendimiento de vanguardia entre modelos abiertos de tamaño similar, llegando a igualar o superar modelos de aproximadamente 9B de parámetros.

El modelo incorpora un presupuesto de razonamiento configurable con tres niveles (none, low, high), pensado para ajustar dinámicamente la calidad del razonamiento frente a latencia y coste de inferencia. Está publicado bajo licencia Apache 2.0, soporta inglés y chino, y se distribuye en safetensors con código personalizado (custom_code) para transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (sin detalles publicados en la informacion disponible) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card menciona mejoras en contexto largo, sin cifra) |
| Tipos de cuantizacion | no disponible (formato nativo safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El autor declara explicitamente que Spark-X2.6-4B conserva exactamente la misma arquitectura que Spark-X2.5-4B; las ganancias proceden del post-entrenamiento. No se detalla en la informacion disponible si la arquitectura es un transformer denso, híbrido o MoE, ni se publican el numero de capas, dimensiones ocultas, mecanismo de atencion ni el regimen de entrenamiento (tokens totales, composicion del dataset, uso de RLHF, DPO u otros).

La innovacion tecnica documentada es el presupuesto de razonamiento controlable en tres niveles (none, low, high), que permite a la aplicacion elegir el equilibrio entre calidad de razonamiento, latencia y coste de inferencia. Para ajuste fino, el autor recomienda Llama-Factory a traves de su fork (github.com/XHToken/LlamaFactory). No se aportan detalles sobre decodificacion especulativa, atencion lineal ni otras optimizaciones internas.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento con presupuesto controlable: niveles none, low y high.
- Generacion de codigo e ingenieria de software, con mejoras declaradas frente a Spark-X2.5-4B.
- Flujos agenticos: uso complejo de herramientas, planificacion multi-paso y tareas de agente del mundo real.
- Contexto largo (mejora declarada, sin cifra publicada de ventana).
- Capacidades multilingues centradas en en y zh.
- Orientado a despliegue on-device por su tamano compacto (~4,1B parametros).
- Tool calling / function calling: no confirmado de forma explicita en la informacion disponible, aunque el enfasis en flujos agenticos lo sugiere.

## Casos de uso

- Agentes locales en dispositivo: el tamano de 4,1B parametros permite ejecutar el modelo en hardware de consumo y usarlo como cerebro de agentes que planifican pasos y llaman a herramientas en aplicaciones de escritorio o moviles.
- Asistencia de programacion integrada en el IDE: sus mejoras declaradas en codigo e ingenieria de software lo hacen adecuado para autocompletado, refactorizacion y generacion de tests en entornos donde no se quiere enviar codigo a la nube.
- Automatizacion de tareas de software con planificacion multi-paso: para pipelines que requieren descomponer una tarea, seleccionar herramientas y ejecutar acciones de forma secuencial.
- Razonamiento con control de coste: aplicaciones que alternan el nivel none para respuestas rapidas y low/high para consultas complejas, ajustando latencia y consumo segun la carga.
- Procesamiento de documentos y conversaciones largas: el enfasis en contexto largo permite resumir o consultar documentos extensos, aunque la ventana exacta no esta publicada.
- Atencion al cliente bilingue en ingles y chino: conversaciones multi-turno para mercados con esos dos idiomas, ejecutables on-premise para evitar dependencias de terceros.
- Ajuste fino especifico de dominio: con Llama-Factory recomendado por el autor, se puede adaptar el modelo a tareas verticales manteniendo el despliegue local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo afirma de forma cualitativa que el modelo alcanza rendimiento de vanguardia entre modelos abiertos de tamano similar y que iguala o supera modelos de aproximadamente 9B parametros, sin aportar cifras de MMLU, HumanEval, GSM8K ni otras evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~4,1B parametros, en bf16/fp16 se requieren aproximadamente 8,2 GB solo para pesos, mas cache KV y overhead; con cuantizacion de 8 bits rondaria 4-5 GB y en 4 bits aproximadamente 2,5-3 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas: A100, H100 y L40S para despliegue en servidor; RTX 4090 y RTX 3090 para estaciones de trabajo.
- GPU de consumo: cabe en GPUs consumer con 8 GB o mas en cuantizacion de 8 bits, y en 4-6 GB en cuantizacion de 4 bits; en bf16 completo requiere 12-16 GB.
- Opciones de despliegue: transformers (libreria oficial, requiere custom_code); el autor no documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Spark-X2.6-4B-Base | 4,11B | no disponible | Apache 2.0 | Mejoras declaradas frente a modelos de ~9B; thinking budget configurable |
| Spark-X2.5-4B | ~4B (misma arquitectura) | no disponible | Apache 2.0 | Generacion anterior; el autor indica que X2.6 solo cambia el post-entrenamiento |
| Alternativas de ~4B de otros proveedores | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de datos cuantitativos de terceros para una comparativa rigurosa; la unica referencia aportada por el autor es la comparacion cualitativa con modelos de aproximadamente 9B parametros.

## Limitaciones y advertencias

- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la informacion disponible.
- Alucinacion: no se publican tasas de alucinacion ni evaluaciones de factualidad; como modelo generativo es susceptible a ellas, especialmente sin verificacion externa.
- Idiomas: cobertura declarada solo de ingles y chino; el rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- Contexto: aunque se anuncia mejora en contexto largo, no se publica la longitud exacta de la ventana, lo que dificulta dimensionar el despliegue.
- Etiquetado: el repositorio se llama "Base" pero la model card describe un modelo post-entrenado; conviene verificar el comportamiento conversacional antes de usarlo en produccion.
- Dependencia de codigo personalizado: requiere custom_code en transformers, lo que puede complicar la integracion con otros runtimes y herramientas de cuantizacion.
- Licencia: Apache 2.0 permite uso comercial, pero no se ofrece garantia ni indemnizacion por parte del autor.
- Datos de rendimiento: la afirmacion de superar modelos de ~9B no esta respaldada con cifras publicas en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XHToken/Spark-X2.6-4B-Base
- Licencia: https://huggingface.co/XHToken/Spark-X2.6-4B-Base/blob/main/LICENSE
- Llama-Factory (fork del autor): https://github.com/XHToken/LlamaFactory
- Slack: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
