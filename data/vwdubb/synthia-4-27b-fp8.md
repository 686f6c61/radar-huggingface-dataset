# vwdubb/Synthia-4-27B-FP8

.

Capacidades: text generation, reasoning, code, tool calling, agents, long context, multimodal image+video, MTP speculative decoding, personas, reasoning effort control.

Casos de uso: at least 6.

Benchmarks: none published in available info.

Hardware: FP8 27.8B → ~27.8 GB weights (38.5 GB repo includes something). VRAM estimation: FP8 weights ~27.8 GB + KV cache. A100 80GB, H100 80GB, RTX 6000 Ada 48GB, 2x RTX 4090 24GB. Q4_K_M 15.41 GiB runs on 24GB consumer with context; Q8_0 26.63 GiB needs ~32GB+.

KV cache: unknown head config. I should be careful and mark estimates.

Comparativa: base BF16 Synthia-4-27B, GGUF quants, Qwen3.8-27B base. Not really "similares" external models — I don't know them reliably. I'll compare against the BF16 and GGUF variants and the base model, noting external comparisons not available.

Enlaces: HF page, base model, GGUF repo, Qwen base... The model card links Qwen/Qwen3.8-27B. Include.

Search results were irrelevant — I'll mention no relevant web results? The enlaces section: list relevant links found. The web search results are irrelevant (oceanography institute), so I can note that the búsqueda web no arrojó resultados relevantes. That's honest.

Use Spanish from Spain, no emojis, only first word of titles capitalized.

Note "migtissera" is the developer of the base model; vwdubb is the uploader of the FP8 quant.

Let me write it carefully.

Estimated VRAM numbers must be flagged as estimates: e.g., "~28 GB solo pesos en FP8 (estimación a partir de 27,78 B de parámetros a 8 bits)".

Note repo size 38.5 GB which is more than 27.8 GB FP8 weights — maybe includes scales/other. Mention.

Latency/throughput: no disponible.

Write it.## Resumen

Synthia-4-27B-FP8 es una versión cuantizada a FP8 del modelo Synthia-4-27B, subida por el usuario vwdubb a HuggingFace. El modelo original lo desarrolla migtissera y se define como un "asistente personal" orientado a ejecutar trabajo real: conversación expresiva combinada con uso de herramientas, planificación, código, investigación y tareas de asistencia prolongadas. Synthia-4-27B parte a su vez de Qwen/Qwen3.8-27B y se ha post-entrenado sobre sesiones de agente completas y de formato largo, con una longitud de entrenamiento de 65.536 tokens.

Se trata de un modelo multimodal de tipo image-text-to-text con 27.781.427.952 parámetros (~27,8 B), ventana de contexto nativa de 262.144 tokens y cabeza de predicción multi-token (MTP). El post-entrenamiento cubre todos los turnos del asistente, incluidas las llamadas a herramientas, de modo que el modelo aprende cómo evoluciona una tarea a lo largo de una sesión en lugar de limitarse a responder de forma aislada.

La relevancia de esta ficha concreta radica en el formato: al estar cuantizado a FP8 con `compressed-tensors`, reduce el peso de los pesos respecto al checkpoint BF16 (55,6 GB) y facilita el despliegue en vLLM o SGLang con endpoints compatibles, aunque el repositorio ocupa 38,5 GB. La licencia es Apache 2.0 y el pipeline declarado es image-text-to-text, lo que permite entrada de imagen y vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen/Qwen3.8-27B, con cabeza de prediccion multi-token (MTP); numero de capas y cabezas no disponible |
| Parametros totales | 27.781.427.952 (~27,8 B) segun los safetensors del repositorio |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 262.144 tokens nativos; post-entrenamiento limitado a 65.536 tokens |
| Tipos de cuantizacion | FP8 (compressed-tensors) en este repositorio; BF16 en el repositorio base; GGUF F16, Q8_0, Q6_K y Q4_K_M en el repositorio companion |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP8, compressed-tensors); GGUF disponible en migtissera/Synthia-4-27B-GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal que conserva la ruta de entrada de imagen y video del modelo base, la ventana de contexto nativa de 262.144 tokens y una cabeza de prediccion multi-token (MTP) utilizable para decodificacion especulativa. El modelo se construye sobre Qwen/Qwen3.8-27B y se post-entrena sobre sesiones de agente completas y de formato largo con una longitud de entrenamiento de 65.536 tokens. El objetivo de entrenamiento abarca todos los turnos del asistente, incluidas las llamadas a herramientas, de forma que el modelo aprende la dinamica de una relacion de trabajo a lo largo de una tarea y no solo la generacion de respuestas aisladas.

La model card describe un perfil de comportamiento afinado explicitamente: mantener una voz estable a lo largo de sesiones largas, equilibrar personalidad y humor ligero con respuestas directas, alternar entre conversacion abierta y ejecucion de tareas, preservar objetivos y restricciones durante trabajo extendido con herramientas, inspeccionar la evidencia disponible antes de comprometerse con una solucion, revisar un plan cuando los resultados de las herramientas contradicen una suposicion previa y expresar incertidumbre cuando la evidencia no sostiene una afirmacion firme. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO.

El plantillon de chat incluido admite niveles de esfuerzo de razonamiento `xhigh`, `medium` y `low`, y formatea el razonamiento dentro de bloques `<think>...</think>`. Las definiciones de herramientas se pasan mediante el argumento `tools=` del template. Esta version FP8 la publica vwdubb como cuantizacion del checkpoint de migtissera; no se documentan en la informacion disponible los detalles del proceso de cuantizacion (calibracion, escalas por tensor o por canal).

## Capacidades

- Generacion de texto conversacional con una voz consistente y reconocible a lo largo de sesiones extensas, segun la model card.
- Razonamiento multi-paso con presupuesto de razonamiento configurable (`xhigh`, `medium`, `low`) a traves del chat template.
- Uso de herramientas (tool calling / function calling): el modelo fue entrenado sobre conversaciones que contienen instrucciones de sistema, peticiones de usuario, mensajes de asistente, llamadas a herramientas y resultados de herramientas.
- Comportamiento agentico: mantiene objetivos y restricciones durante trabajo prolongado guiado por herramientas, verifica resultados e incorpora la verificacion como parte de la propia tarea.
- Entrada multimodal de imagen y video, heredada del modelo base (pipeline `image-text-to-text`).
- Contexto largo de hasta 262.144 tokens nativos para conversaciones y documentos extensos.
- Decodificacion especulativa mediante la cabeza MTP, con soporte en llama.cpp a traves de `--spec-type draft-mtp` y ficheros GGUF con MTP incluido.
- Memoria de contexto personal: puede incorporar memorias duraderas o contexto personal si el runtime anfitrion se lo proporciona.
- Codigo, investigacion, planificacion y trabajo creativo, segun los casos de uso declarados por el autor.
- Soporte de idiomas distintos del ingles: no disponible.

## Casos de uso

- Asistente personal persistente: desplegado en un runtime de agente que inyecte identidad, preferencias del usuario y memorias recuperadas en el contexto de sistema, Synthia mantiene una voz estable y el hilo conversacional durante sesiones largas, alternando charla abierta y ejecucion de tareas.
- Agente de codigo en produccion: gracias al entrenamiento sobre turnos con llamadas a herramientas, puede inspeccionar un repositorio, proponer cambios, ejecutar pruebas y revisar el plan cuando los resultados contradicen una suposicion previa; se integra en pipelines de CI/CD si el runtime expone las herramientas adecuadas.
- Investigacion y sintesis documental: con 262.144 tokens de contexto nativo puede ingerir documentacion extensa, informes o multiples articulos en una sola pasada y producir sintesis con trazabilidad de las fuentes presentes en el contexto.
- Planificacion de proyectos: uso del modelo para descomponer objetivos en tareas, mantener el estado de un plan a lo largo de la sesion y reorganizarlo cuando aparecen nuevos resultados de herramientas.
- Atencion al cliente o asistencia tecnica multi-turno: la ventana de contexto larga y la capacidad de mantener coherencia permiten gestionar conversaciones extendidas con historial completo, aunque no hay datos publicados de calidad en este dominio concreto.
- Analisis de contenido visual: al conservar la ruta de imagen y video del modelo base, puede describir, resumir o razonar sobre capturas, diagramas o fotogramas junto a texto en la misma conversacion.
- Redaccion y trabajo creativo asistido: generacion de borradores, edicion iterativa y discusion de decisiones con un tono conversacional y humor ligero, un perfil que el autor presenta como diferenciador frente a asistentes puramente tecnicos.
- Despliegue en local con cuantizacion GGUF: mediante las builds Q4_K_M o Q6_K del repositorio companion, el modelo puede ejecutarse en llama.cpp u Ollama en hardware de gama alta de consumo para prototipado y uso personal sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base y la ficha de esta cuantizacion no incluyen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y la busqueda web realizada no devolvio resultados relevantes sobre este modelo. No se presentan por tanto tablas comparativas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del numero de parametros; no confirmadas por el autor):
  - FP8 (este repositorio): aproximadamente 27,8 GB solo en pesos, mas cache KV. El repositorio ocupa 38,5 GB, por lo que conviene reservar espacio adicional para escalas y ficheros auxiliares.
  - BF16 (modelo base): 55,6 GB, aproximadamente 56 GB solo en pesos.
  - GGUF Q8_0: 26,63 GiB sin MTP / 27,05 GiB con MTP.
  - GGUF Q6_K: 20,57 GiB sin MTP / 20,89 GiB con MTP.
  - GGUF Q4_K_M: 15,41 GiB sin MTP / 15,66 GiB con MTP.
- GPU recomendadas: para FP8 o BF16, A100 80 GB, H100 80 GB o H200; en una sola GPU de 48 GB (RTX 6000 Ada, L40S) la variante FP8 es viable con contexto reducido. Para las variantes GGUF cuantizadas, RTX 4090, RTX 5090 o RTX 3090 de 24 GB.
- Compatibilidad con GPU de consumo: si. Q4_K_M (15,41 GiB) cabe en 24 GB con margen para contexto; Q6_K (20,57 GiB) cabe en 24 GB con contexto limitado; Q8_0 (26,63 GiB) requiere 32 GB o mas, o reparto entre dos GPU.
- Opciones de despliegue: Transformers con AutoModelForImageTextToText, vLLM y SGLang (endpoints compatibles declarados en los tags), llama.cpp / llama-server con `--flash-attn auto` y `--jinja` para el chat template, y Ollama a partir de los ficheros GGUF. La decodificacion especulativa MTP requiere una build de llama.cpp compatible.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| vwdubb/Synthia-4-27B-FP8 (este) | 27,8 B | 262.144 tokens | safetensors FP8 (compressed-tensors) | apache-2.0 | Cuantizacion FP8 del checkpoint de migtissera; repositorio de 38,5 GB |
| migtissera/Synthia-4-27B | 27,8 B | 262.144 tokens | safetensors BF16 (55,6 GB) | apache-2.0 | Checkpoint de referencia, post-entrenado a 65.536 tokens; misma funcionalidad sin perdida por cuantizacion |
| migtissera/Synthia-4-27B-GGUF | 27,8 B | 262.144 tokens | GGUF F16, Q8_0, Q6_K, Q4_K_M | apache-2.0 | Incluye proyector de vision F16 y fichero MTP Q8_0 independiente; opcion para llama.cpp y Ollama |
| Qwen/Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | Modelo base sobre el que se construye Synthia-4-27B; sin post-entrenamiento de asistente personal |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a modelos de terceros del mismo rango de parametros, por lo que la comparacion se limita a formato, tamano y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documentan evaluaciones de sesgo ni de toxicidad para esta cuantizacion ni para el modelo base.
- Riesgo de alucinacion: no se publican tasas de alucinacion. La model card indica que el modelo esta afinado para expresar incertidumbre cuando la evidencia no sostiene una afirmacion firme, pero esto es una intencion de diseno, no una garantia verificada.
- Rendimiento mas alla de 65.536 tokens: el post-entrenamiento se limito a esa longitud, por lo que el comportamiento en contextos mas largos (hasta 262.144 tokens) proviene del modelo base y no de la distribucion de ajuste. Es previsible una degradacion del estilo y de la adherencia a instrucciones en esa franja.
- Cuantizacion FP8: no se documentan en la informacion disponible los detalles de calibracion ni las metricas de degradacion respecto al checkpoint BF16. Conviene validar la calidad en el caso de uso concreto antes de produccion.
- Idiomas: no disponible. No se especifica la cobertura multilingue real, pese a que el modelo base procede de la familia Qwen.
- Persistencia entre sesiones: la model card indica explicitamente que la memoria entre sesiones separadas es responsabilidad del runtime anfitrion; el modelo por si solo no la garantiza.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia y las condiciones del modelo base (Qwen/Qwen3.8-27B) y del checkpoint intermedio, que pueden imponer requisitos adicionales de atribucion o de uso.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad. Es una cuantizacion de terceros, no una publicacion oficial del autor del modelo base.
- Fechas del repositorio: creado y actualizado en octubre de 2026 segun los metadatos, con dos minutos y medio de diferencia entre creacion y ultima actualizacion.
- Caveat de despliegue: el uso de la cabeza MTP para decodificacion especulativa requiere builds especificas de llama.cpp; en runtimes sin soporte MTP deben usarse los ficheros GGUF estandar.

## Enlaces

- Ficha en HuggingFace de esta cuantizacion: https://huggingface.co/vwdubb/Synthia-4-27B-FP8
- Modelo base (BF16): https://huggingface.co/migtissera/Synthia-4-27B
- Repositorio de cuantizaciones GGUF: https://huggingface.co/migtissera/Synthia-4-27B-GGUF
- Modelo fundacional sobre el que se construye Synthia-4-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog, repositorio de codigo o demo adicionales: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
