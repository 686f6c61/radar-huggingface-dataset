# zran9418/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso de 27.781.427.952 parámetros (unos 27,8B) desarrollado por el equipo Qwen de Alibaba, presentado como la generación más capaz de la familia abierta Qwen hasta la fecha. Se construye sobre la base arquitectónica de Qwen3.5 e incorpora un codificador de visión nativo, por lo que es un modelo visión-lenguaje que procesa tanto imágenes como vídeo, además de texto. Su rasgo diferencial frente a la generación anterior es una atención híbrida que combina capas de atención lineal Gated DeltaNet con capas de atención completa con compuertas, repartidas en 64 capas.

El modelo está orientado a tareas de codificación agéntica, trabajo profesional, investigación y flujos de agente de horizonte largo. Para ello incorpora control flexible de razonamiento (modo thinking activado por defecto, desactivable por petición, con ajuste de profundidad mediante `reasoning_effort` y retención del contexto de razonamiento histórico con `preserve_thinking`) y una ventana de contexto nativa de 262.144 tokens extensible hasta 1.000.000. También incluye una cabeza MTP (Multi-Token Prediction) entrenada con varios pasos, que actúa como borrador integrado para decodificación especulativa.

Es relevante ahora porque ofrece capacidades de nivel frontera en un formato denso y desplegable en hardware relativamente modesto: se distribuye bajo licencia Apache 2.0 y la comunidad ya ha publicado cuantizaciones que lo ejecutan en configuraciones de 17 GB de RAM/VRAM, así como recetas para vLLM, SGLang, llama.cpp y aceleradores de AMD e NVIDIA. Existe además una versión gestionada en Qwen Cloud con 1M de contexto por defecto y herramientas integradas oficiales, anunciada como próximamente disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con atencion hibrida (Gated DeltaNet de atencion lineal + Gated Attention completa) y codificador de vision |
| Parametros totales | 27.781.427.952 (aproximadamente 27,8B) |
| Longitud de contexto | 262.144 tokens de forma nativa; extensible hasta 1.000.000 |
| Tipos de cuantizacion | GGUF y NVFP4 publicados por Unsloth; cuantizaciones adicionales no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); GGUF y NVFP4 para despliegue local |
| Dimension oculta | 5.120 |
| Numero de capas | 64, con disposicion 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Cabeza de atencion lineal (Gated DeltaNet) | 48 cabezas para V y 16 para QK, dimension de cabeza 128 |
| Cabeza de atencion completa (Gated Attention) | 24 cabezas para Q y 4 para KV, dimension de cabeza 256, RoPE de dimension 64 |
| FFN | Dimension intermedia 17.408 |
| Embeddings | 248.320 (con padding), tanto en entrada como en salida |
| Prediccion multi-token | MTP entrenado con multiples pasos (cabeza borrador integrada) |
| Tamano del repositorio | 55,6 GB |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo de lenguaje causal denso de 64 capas con un codificador de visión acoplado. La innovación estructural principal es su esquema de atención híbrida: de las 64 capas, 48 utilizan atención lineal Gated DeltaNet (48 cabezas para V y 16 para QK, con dimensión de cabeza 128) y solo una de cada cuatro capas emplea atención completa con compuertas (24 cabezas para Q y 4 para KV, dimensión de cabeza 256, con RoPE de dimensión 64). La disposición exacta es 16 bloques de la forma (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). Esta proporción reduce el coste de atención en contextos largos, lo que explica que la ventana nativa llegue a 262.144 tokens y sea extensible a 1.000.000. La dimensión oculta es 5.120 y la intermedia de la red feed-forward es 17.408; el vocabulario tiene 248.320 entradas con padding.

El modelo ha pasado por fases de pre-entrenamiento y post-entrenamiento, e incorpora una cabeza MTP (Multi-Token Prediction) entrenada con varios pasos que permite decodificación especulativa con un borrador propio, sin necesidad de un modelo draft externo. La model card no especifica el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas concretas de alineación como RLHF o DPO, por lo que esos datos no están disponibles. Las mejoras declaradas por el autor se centran en codificación, trabajo profesional, investigación y tareas agénticas de horizonte largo, con especial énfasis en planificación autónoma y manejo de la realimentación del entorno, además de un soporte más amplio de arneses de agentes y herramientas de desarrollo.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto, desactivable por petición y ajustable en profundidad mediante `reasoning_effort`.
- Retención del contexto de razonamiento de mensajes históricos mediante `preserve_thinking`, útil en conversaciones multi-turno largas.
- Codificación agéntica: el modelo afronta tareas de terminal de extremo a extremo, con capacidad declarada de gestionar la realimentación del entorno.
- Ejecución de agentes y planificación autónoma en tareas de varios pasos y horizonte largo.
- Comprensión de imagen nativa, incluyendo diagramas STEM y documentos.
- Comprensión de vídeo, con soporte declarado para vídeos de hasta una hora de duración.
- Compatibilidad con arneses de agentes y herramientas de desarrollo populares, según la model card.
- En la versión gestionada de Qwen Cloud se ofrecen herramientas integradas oficiales y 1M de contexto por defecto, además de una API compatible con endpoints.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Esquema explícito de tool calling o function calling: no documentado en la información disponible.

## Casos de uso

- Automatización de tareas de terminal y codificación agéntica: el modelo está evaluado en Terminal Bench 2.1 (Terminus) y declara capacidad de manejar la realimentación del entorno, por lo que encaja en agentes que ejecutan comandos, interpretan errores y corrigen código de forma iterativa.
- Generación y revisión de código en pipelines de CI/CD: puede integrarse en flujos automatizados de análisis de repositorios, propuesta de parches y verificación, apoyándose en su soporte para arneses y herramientas de desarrollo.
- Análisis de documentos técnicos y diagramas STEM: al ser un modelo visión-lenguaje nativo, puede extraer información de figuras, esquemas y documentos escaneados, combinando la lectura visual con razonamiento textual en la misma ventana de contexto.
- Procesamiento de vídeo de larga duración: el soporte declarado para vídeos de hasta una hora permite indexación, resumen y búsqueda semántica de contenido audiovisual sin trocear la señal en fragmentos pequeños.
- Asistente de investigación con contexto extenso: la ventana de 262.144 tokens nativa, ampliable a 1.000.000, permite cargar artículos completos, literatura gris o bases de código extensas y razonar sobre ellos en una sola pasada.
- RAG de gran escala con recuperación masiva: en lugar de recuperar unos pocos fragmentos, se pueden inyectar documentos enteros o colecciones amplias, reduciendo la pérdida de información por truncamiento.
- Despliegue local en estación de trabajo: con cuantizaciones GGUF o NVFP4 puede ejecutarse en equipos de 17 GB de RAM/VRAM, en procesadores AMD Ryzen AI Max+ o en una única GPU AMD Radeon AI PRO R9700 de 32 GB mediante llama.cpp.
- Atención al cliente multi-turno: la retención del contexto de razonamiento histórico y el control del esfuerzo de razonamiento permiten equilibrar coste y calidad según la complejidad de cada conversación.

## Benchmarks y rendimiento

La model card del autor incluye una tabla comparativa de rendimiento en texto con las columnas Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por categorías (entre ellas codificación) y con benchmarks como Terminal Bench 2.1 (Terminus). Sin embargo, los valores numéricos de esa tabla no están disponibles en la información extraída, por lo que no se reproducen cifras que no puedan verificarse.

| Benchmark | Categoria | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | Codificacion agéntica de terminal | no disponible | no disponible | no disponible | no disponible | no disponible |
| Resto de benchmarks de la tabla del autor | Codificacion, trabajo profesional, investigacion y tareas agenticas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks verificables en la información disponible.

## Requisitos de hardware

- Pesos en BF16: 27.781.427.952 parámetros × 2 bytes equivalen a aproximadamente 55,6 GB, cifra que coincide con el tamaño del repositorio. A esa cantidad hay que sumar la caché KV, las activaciones y el codificador de visión.
- Inferencia en BF16: se estima un mínimo en torno a 64-80 GB de memoria total, lo que obliga a varias GPU o a aceleradores con memoria unificada amplia. Los pesos completos no caben en una única GPU de consumo.
- Cuantizaciones de 8 bits: en torno a 28 GB de pesos, viable en GPU profesionales de 32-48 GB o en equipos con memoria unificada amplia. La cifra exacta no está disponible.
- NVFP4 y cuantizaciones GGUF de Unsloth: permiten ejecutar el modelo en configuraciones de 17 GB de RAM/VRAM según la documentación de Unsloth.
- GPU recomendadas: las recetas de vLLM mencionan despliegues en GB300 NVL4 y RTX 5090. AMD documenta ejecución en Ryzen AI Max+ y en una Radeon AI PRO R9700 de 32 GB, así como en hardware AMD con más de 24 GB de VRAM o memoria gráfica variable.
- Cabe en GPU de consumo: sí, con cuantización. Una RTX 5090 aparece citada en las recetas de vLLM, y AMD indica funcionamiento con más de 24 GB de VRAM.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, TokenSpeed, llama.cpp, Unsloth (GGUF, NVFP4 y Unsloth Desktop). Cloudflare Workers AI ofrece una versión alojada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| Qwen3.8-27B | 27,78B denso | 262.144 nativo, hasta 1.000.000 | Si (imagen y video) | Apache 2.0 | Hugging Face, vLLM, SGLang, TokenSpeed, llama.cpp, GGUF, NVFP4, Cloudflare Workers AI | Valores no disponibles en la informacion extraida |
| Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible | Aparece como columna de comparacion en la model card | Valores no disponibles; es la generacion inmediatamente anterior de la misma linea |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Aparece como columna de comparacion en la model card | Valores no disponibles |
| Muse Glimmer-30B | no disponible | no disponible | no disponible | no disponible | Aparece como columna de comparacion en la model card | Valores no disponibles |
| Opus4.6 Max | no disponible | no disponible | no disponible | no disponible | Aparece como columna de comparacion en la model card | Valores no disponibles |

La familia Qwen3.5 se cita como base arquitectónica de este modelo, pero no se dispone de sus especificaciones en la información proporcionada. No hay datos suficientes para una comparación cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- El identificador proporcionado (zran9418/Qwen3.8-27B) es una réplica alojada por un tercero con 0 descargas y 0 likes; el repositorio oficial es Qwen/Qwen3.8-27B. Conviene verificar la integridad de los pesos antes de usarlos en producción.
- Los idiomas soportados no están documentados, por lo que no puede garantizarse un rendimiento adecuado en castellano ni en otras lenguas distintas del inglés.
- Los valores de los benchmarks publicados en la model card no están disponibles en la información extraída, de modo que las afirmaciones de superioridad frente a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max no pueden verificarse de forma independiente.
- No hay información sobre sesgos específicos del modelo. Como cualquier modelo de lenguaje generativo, presenta riesgo de alucinación, especialmente en tareas de razonamiento largo o cuando se le exige citar fuentes.
- El modo thinking está activado por defecto y consume tokens adicionales, lo que incrementa latencia y coste si no se desactiva o se ajusta con `reasoning_effort`.
- El despliegue en BF16 exige aproximadamente 55,6 GB solo para pesos, lo que descarta GPU de consumo sin cuantización.
- El soporte nativo de contexto llega a 262.144 tokens; la extensión a 1.000.000 es una capacidad declarada, no verificada en la información disponible.
- La licencia Apache 2.0 es permisiva para uso comercial, pero se recomienda revisar los términos específicos del repositorio oficial de Qwen y de los artefactos derivados.
- El servicio gestionado de Qwen Cloud con 1M de contexto y herramientas oficiales está anunciado como próximamente disponible, no operativo en el momento de la ficha.
- No se documentan detalles del dataset de entrenamiento, del número de tokens vistos ni de las técnicas de alineación aplicadas, lo que dificulta evaluar riesgos de contaminación de benchmarks.

## Enlaces

- Repositorio indicado: https://huggingface.co/zran9418/Qwen3.8-27B
- Repositorio oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- Ficha en Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Guía de ejecución local de Unsloth: https://unsloth.ai/docs/models/qwen3.8
- Recetas de despliegue en vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Blog de AMD sobre ejecución en Ryzen AI Max y Radeon: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Servicio Qwen Cloud: https://www.qwencloud.com
