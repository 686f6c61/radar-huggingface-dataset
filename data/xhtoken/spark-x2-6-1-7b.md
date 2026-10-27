# XHToken/Spark-X2.6-1.7B

## Resumen

Spark-X2.6-1.7B es un modelo de lenguaje de 1.707.657.216 parametros (aproximadamente 1,71 mil millones) desarrollado por XHToken, segundo miembro de la familia Spark-X2.6 tras el Spark-X2.6-4B. Se trata de la version post-entrenada (instruct/conversacional) del checkpoint Spark-X2.6-1.7B-Base, construida sobre Spark-X2.5-1.7B y centrada en el despliegue en dispositivo (on-device) y en entornos con recursos limitados.

La model card indica que conserva exactamente la misma arquitectura que Spark-X2.5-1.7B y que las mejoras de capacidad provienen del post-entrenamiento: codigo, uso de herramientas (agent), contexto largo, multilingue y razonamiento. Entre sus caracteristicas tecnicas declara tres niveles de "thinking budget" (none, low, high) para ajustar calidad de razonamiento, latencia y coste de inferencia, ademas de un rendimiento de decodificacion que el autor situa por delante de Qwen3.5-2B, MiniCPM-2B y LFM2.5-2.6B en las pruebas realizadas sobre una RTX 4090 con su fork optimizado de llama.cpp.

Es relevante ahora por tres motivos: es un modelo compacto con licencia Apache 2.0 (uso comercial permitido), esta disenado explicitamente para inferencia local con decodificacion eficiente y dispone de soporte declarado en SGLang tanto para GPU NVIDIA como para NPU Ascend, lo que facilita su integracion en pipelines de produccion y en hardware no convencional. El repositorio tiene 6,8 GB, 21 likes y 0 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredera de Spark-X2.5-1.7B; la model card no detalla el interior de la arquitectura). Requiere `trust_remote_code=True` y codigo personalizado (`custom_code`) |
| Parametros totales | 1.707.657.216 (~1,71 B) |
| Parametros activos | No aplica: no es un modelo MoE segun la informacion disponible |
| Longitud de contexto | No declarada de forma explicita. El ejemplo de generacion usa `max_new_tokens=131072` y la receta de SGLang configura `--context-length` hasta 1.048.576 tokens (1 M), sujeto a memoria disponible |
| Tipos de cuantizacion | No listados en la model card. El repositorio incluye un fork optimizado de llama.cpp (`XHToken/llama.cpp`), lo que sugiere soporte de pesos GGUF, pero no se enumeran variantes concretas |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La informacion disponible es limitada en este apartado. La model card afirma que Spark-X2.6-1.7B "retiene exactamente la misma arquitectura que Spark-X2.5-1.7B" y que las ganancias provienen del post-entrenamiento, no de cambios estructurales. No se especifican el numero de capas, dimensiones ocultas, tipo de atencion (completa, lineal o hibrida), ni el mecanismo exacto del "thinking budget" configurable en tres niveles (none, low, high). El modelo se distribuye con codigo personalizado y requiere `trust_remote_code=True`, ademas de transformers 4.57.1 segun el ejemplo oficial.

Tampoco se detallan los datos de entrenamiento: no hay cifra de tokens, composicion del dataset ni mencion explicita de tecnicas concretas de alineacion (RLHF, DPO u otras); solo se indica que hubo una fase de post-entrenamiento mejorada respecto a Spark-X2.5-1.7B, con enfasis en codigo, uso de herramientas, planificacion multi-paso, contexto largo, multilingue y razonamiento. El checkpoint base asociado es `XHToken/Spark-X2.6-1.7B-Base`. Como innovaciones declaradas destacan la eficiencia de decodificacion en dispositivo y el control del esfuerzo de razonamiento, ademas de parsers especificos en SGLang (`--tool-call-parser spark25`, `--reasoning-parser qwen3`).

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento con presupuesto de pensamiento configurable en tres niveles (none, low, high), lo que permite intercambiar calidad por latencia y coste.
- Codigo y tareas de ingenieria de software, con mejoras declaradas frente a la generacion anterior.
- Uso de herramientas y function calling, evidenciado por el parser `spark25` disponible en la receta de SGLang.
- Capacidades agenticas: planificacion multi-paso y resolucion de tareas compuestas.
- Razonamiento sobre contextos extensos (long-context), con configuracion de servidor de hasta 1.048.576 tokens.
- Capacidades multilingues limitadas a ingles y chino.
- No se declaran capacidades de vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- Asistente local en escritorio o portatil: con ~1,71 B de parametros, el modelo puede ejecutarse en GPUs de consumo o incluso en CPU mediante llama.cpp, ofreciendo un asistente conversacional sin conexion y con coste marginal nulo por consulta.
- Autocompletado y generacion de codigo en IDE: su tamano reducido y su latencia de decodificacion baja permiten sugerencias en tiempo real dentro de extensiones de editor, con el modo thinking en "none" para minimizar la espera.
- Agente de automatizacion con tool calling: integrado en SGLang con `--tool-call-parser spark25`, puede encadenar llamadas a APIs (calendario, correo, busqueda interna) en flujos multi-paso, usando el nivel de razonamiento "high" solo en los pasos que lo requieran.
- Procesamiento de documentos largos en ingles o chino: con la configuracion de contexto extendido de SGLang se pueden resumir contratos, informes o historiales extensos, reduciendo `--context-length` cuando la memoria del dispositivo sea limitada.
- Clasificacion y extraccion de informacion en backend: su formato safetensors y su integracion con transformers permiten desplegarlo como microservicio para etiquetado de tickets, extraccion de entidades o enrutado de consultas a bajo coste.
- Atencion al cliente en mercados angloparlantes y sinofonos: conversaciones multi-turno con contexto largo y modo thinking desactivable para respuestas rapidas y predecibles.
- Prototipado e investigacion de tecnicas de razonamiento: los tres niveles de thinking budget permiten estudiar el equilibrio entre cadena de pensamiento y precision sin cambiar de modelo.
- Inferencia en hardware no NVIDIA: la receta oficial incluye imagenes de SGLang para NPU Ascend (A2 y A3), habilitando despliegue en infraestructura alternativa.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye graficos (`images/all_benchmark.svg` e `images/inference.svg`) que comparan el modelo con Qwen3.5-2B, MiniCPM-2B y LFM2.5-2.6B en tareas de agente, codigo, matematicas, rendimiento general y conocimiento, pero los valores no estan disponibles en formato texto en la informacion proporcionada. El autor afirma que Spark-X2.6-1.7B supera a los modelos de tamano comparable "en la mayoria de benchmarks" y que obtiene el mejor throughput de decodificacion entre los modelos evaluados en contextos cortos sobre RTX 4090, sin aportar cifras verificables en el texto.

## Requisitos de hardware

- VRAM estimada para pesos: en FP16/BF16, aproximadamente 3,4 GB; en INT8, en torno a 1,8 GB; en INT4, alrededor de 0,9-1,1 GB (estimaciones teoricas a partir de 1,71 B de parametros; las cuantizaciones concretas no estan listadas por el autor).
- El repositorio ocupa 6,8 GB, el doble de lo que ocuparian los pesos en FP16/BF16, lo que sugiere pesos en FP32 o copias duplicadas de los mismos; conviene verificar antes de planificar el despliegue.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, entre otras, con margen amplio en FP16. Tambien es viable en CPU via llama.cpp.
- Contextos largos: la configuracion de SGLang para 1.048.576 tokens exige memoria de dispositivo considerable por la cache KV; la propia model card recomienda reducir `--context-length` cuando sea necesario.
- Opciones de despliegue declaradas: transformers 4.57.1 (con `trust_remote_code=True`), SGLang (imagen `lmsysorg/sglang:nightly-dev-cu13-20260827-20621aa1` para NVIDIA; imagenes `quay.io/ascend/sglang:main-cann9.0.0-a3` y `main-cann9.0.0-910b` para Ascend) y el fork `XHToken/llama.cpp`.
- No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: el autor declara liderazgo en velocidad de decodificacion frente a modelos del mismo tamano en la RTX 4090, pero no se aportan tokens por segundo ni latencias concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B | 1.707.657.216 (~1,71 B) | Hasta 1.048.576 tokens en la configuracion de SGLang | Apache 2.0 | HuggingFace, transformers, SGLang, llama.cpp | Base de la comparacion; three-level thinking budget |
| Spark-X2.6-4B | No disponible | No disponible | No disponible | Mismo autor, misma serie | Predecesor de la serie X2.6, mayor tamano |
| Spark-X2.5-1.7B | No disponible | No disponible | No disponible | Mismo autor | Arquitectura identica; X2.6 mejora via post-entrenamiento |
| Qwen3.5-2B | No disponible en la informacion | No disponible | No disponible | Citado como baseline por el autor | Usado como referencia de throughput y rendimiento |
| MiniCPM-2B | No disponible en la informacion | No disponible | No disponible | Citado como baseline por el autor | Usado como referencia de modelo on-device |
| LFM2.5-2.6B | No disponible en la informacion | No disponible | No disponible | Citado como baseline por el autor | Usado como referencia de modelo on-device |

Los datos de los modelos alternativos no aparecen en la informacion proporcionada; solo se conocen como baselines de comparacion empleados por XHToken en sus graficos.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino. El rendimiento en castellano no esta evaluado ni garantizado, por lo que no es adecuado para produccion en espanol sin una evaluacion previa.
- Ausencia de benchmarks numericos publicados en la informacion disponible: las afirmaciones de superar a modelos comparables no pueden verificarse con cifras a partir de los datos facilitados.
- Riesgo de alucinacion: como cualquier LLM de 1,7 B, la precision factua en conocimiento general es limitada; conviene anclar respuestas con recuperacion (RAG) y validacion posterior.
- Requiere `trust_remote_code=True` y codigo personalizado: implica ejecutar codigo del autor y revisar su procedencia antes de desplegarlo en entornos sensibles.
- Madurez del ecosistema: 0 descargas y 21 likes en el momento de la consulta; el soporte se concentra en SGLang y en un fork propio de llama.cpp, con ausencia declarada de vLLM, TGI u Ollama.
- Contexto largo: la ventana de 1 M de tokens es una configuracion de servidor sujeta a memoria; utilizarla sin adjustar `--context-length` puede provocar OOM.
- Thinking budget: el modo "high" incrementa latencia y consumo de tokens; en produccion conviene medir el impacto antes de activarlo por defecto.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se recomienda conservar el aviso de licencia y verificar las condiciones de los pesos derivados.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o seguridad en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B-Base
- Fork de llama.cpp del autor: https://github.com/XHToken/llama.cpp
- Slack: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
- WeChat: images/xhtoken-wechat.jpg (referencia relativa dentro del repositorio)
