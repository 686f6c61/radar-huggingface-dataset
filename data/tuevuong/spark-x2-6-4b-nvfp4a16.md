# tuevuong/Spark-X2.6-4B-NVFP4A16

## Resumen

Spark-X2.6-4B-NVFP4A16 es la cuantización de pesos en NVFP4A16 del modelo Spark-X2.6-4B, un LLM compacto de 4.112.079.360 parámetros (4,1B) desarrollado por XHToken y orientado a despliegue en dispositivo (on-device). Esta versión concreta la publica el usuario tuevuong en HuggingFace mediante `llmcompressor` con el esquema `model_free_ptq(scheme="NVFP4A16")`, sin datos de calibración, y deriva del checkpoint base `XHToken/Spark-X2.6-4B-Base`. El modelo conserva exactamente la arquitectura de Spark-X2.5-4B y obtiene sus mejoras exclusivamente de un post-entrenamiento refinado.

El modelo resuelve el problema de ejecutar agentes y asistentes conversacionales con contexto muy largo en hardware de consumo: el autor de la cuantización reporta 256k tokens de contexto dentro de un presupuesto de ~10 GB de VRAM en una RTX 5070 Ti de 16 GB (Blackwell, SM120) sirviendo con vLLM. Incorpora un presupuesto de razonamiento configurable en tres niveles (none, low, high) que permite ajustar latencia y coste de inferencia por petición.

Es relevante ahora porque la ficha del modelo reclama un rendimiento en código, uso de herramientas y contexto largo que iguala o supera a modelos de ~9B en varias pruebas, manteniéndose en el rango de 4B. La licencia es Apache 2.0 y los idiomas declarados son inglés y chino. El repositorio tiene un tamaño de 2,8 GB y, en el momento de la consulta, 0 descargas y 0 likes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con código personalizado (clase `Spark2_5ForCausalLM`); misma arquitectura que Spark-X2.5-4B, con `tie_word_embeddings=True` |
| Parametros totales | 4.112.079.360 (4,1B) |
| Parametros activos | no disponible (no se declara que sea un modelo MoE) |
| Longitud de contexto | 256k tokens (verificado por el autor de la cuantización en RTX 5070 Ti de 16 GB con ~10 GB de VRAM) |
| Tipos de cuantizacion | NVFP4A16: pesos en FP4 con activaciones de 16 bits, cuantización weight-only generada con `llmcompressor` `model_free_ptq` sin datos de calibración; los tags de HuggingFace la etiquetan como 8-bit y `compressed-tensors` |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con metadatos `compressed-tensors`; repositorio de 2,8 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only implementado con código personalizado bajo la clase `Spark2_5ForCausalLM`, que no forma parte del núcleo de vLLM y requiere un plugin out-of-tree (`vllm_spark2_5_plugin`) para servirse. Según la model card, Spark-X2.6-4B mantiene exactamente la misma arquitectura que Spark-X2.5-4B: todas las ganancias de capacidad provienen de un post-entrenamiento mejorado, no de cambios estructurales. El modelo emplea embeddings atados (`tie_word_embeddings=True`), lo que se refleja en los parches necesarios para cargar pesos con `AutoWeightsLoader`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron RLHF, DPO u otras técnicas de alineación concretas. La innovación técnica documentada es el presupuesto de razonamiento controlable en tres niveles (none, low, high), que permite a la aplicación equilibradamente calidad de razonamiento, latencia y coste de inferencia. Esta ficha corresponde a una cuantización NVFP4A16 weight-only, sin calibración, producida con `llmcompressor`; no se publica la metodología de evaluación de la pérdida de calidad frente al checkpoint original en BF16.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento con presupuesto configurable: niveles none, low y high, seleccionables por petición.
- Codificación y tareas de ingeniería de software, con mejoras declaradas respecto a Spark-X2.5-4B.
- Flujos agénticos: uso complejo de herramientas, planificación multi-paso y ejecución de tareas encadenadas.
- Tool calling / function calling: el plugin de vLLM incluye un parser de herramientas específico (`spark2_5_tool_parser`) que extrae llamadas y genera deltas compatibles con la API de chat completions.
- Contexto largo de hasta 256k tokens, apto para documentos extensos y conversacionesmulti-turno prolongadas.
- Multilingüismo limitado a inglés y chino; no se declaran otros idiomas.
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Agentes on-device en aplicaciones de escritorio o movilidad: el modelo puede ejecutarse en una GPU de consumo de 16 GB con 256k de contexto en ~10 GB de VRAM, lo que permite integración local de un agente con acceso a herramientas sin depender de la nube.
- Automatización de atención al cliente multi-turno: la ventana de 256k tokens permite mantener historiales de conversación largos y documentación de producto en el mismo contexto, con el nivel de razonamiento en "none" o "low" para respuestas rápidas.
- Agente de código en pipelines de integración continua: el soporte de tool calling y el parser de herramientas de vLLM permiten conectarlo a APIs de repositorios, ejecutores de tests y sistemas de tickets para tareas de revisión y parcheo automatizado.
- Procesamiento de documentación técnica extensa: resumen, extracción de entidades y respuesta a preguntas sobre contratos o manuales que superan la ventana de modelos de 4B convencionales, aprovechando el contexto de 256k.
- Enrutado y clasificación de bajo coste: con el nivel de razonamiento "none" el modelo puede actuar como clasificador o generador de respuestas plantilla en un sistema mayor, reservando el nivel "high" para consultas que requieran razonamiento explícito.
- Asistencia en tareas bilingües inglés-chino: traducción, reescritura y soporte a usuarios en ambos idiomas, el único par declarado por el modelo.
- Despliegue en entornos con requisitos de soberanía de datos: al ser Apache 2.0 y ejecutable en local, encaja en escenarios donde el texto no puede salir de la infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye gráficos en formato SVG (`images/benchmark.svg`, `images/all_benchmark.svg`, `images/inference.svg`) sin cifras extraíbles en texto, y se limita a afirmaciones cualitativas: mejor rendimiento de su clase entre modelos de tamaño comparable y rendimiento que iguala o supera a modelos de ~9B en varias pruebas de agente, código, matemáticas, conocimiento general y conocimiento puro. También afirma una eficiencia de inferencia igual o mejor que Qwen3.5-4B y Gemma-E4B.

## Requisitos de hardware

- VRAM estimada: ~10 GB para 256k tokens de contexto según la verificación del autor en una RTX 5070 Ti de 16 GB; el repositorio de pesos ocupa 2,8 GB.
- GPU verificada: NVIDIA RTX 5070 Ti (Blackwell, SM120). NVFP4 es un formato FP4 con escalas de bloque con soporte nativo en esta generación; en arquitecturas anteriores el soporte de kernels es limitado y no está confirmado por el autor.
- GPUs de datacenter: no se documentan pruebas en A100, H100 ni H200; el formato NVFP4 no es nativo en Ampere y su rendimiento en Hopper no está confirmado.
- Cabe en GPU de consumo: sí, al menos en RTX 5070 Ti de 16 GB con el stack indicado.
- Despliegue: vLLM ≥0.32 (imagen `vllm/vllm-openai:latest`) con el plugin `XHToken/Spark-plugin` instalado y tres parches de compatibilidad de API aplicados en el Dockerfile. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en cifras; solo se publica un gráfico comparativo de eficiencia frente a Qwen3.5-4B y Gemma-E4B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B (NVFP4A16, esta ficha) | 4,1B | 256k | Apache 2.0 | Pesos en HF, requiere plugin de vLLM | Cuantización de terceros, 0 descargas al consultar |
| Spark-X2.6-4B | no disponible | no disponible | Apache 2.0 | Pesos en HF (`XHToken/Spark-X2.6-4B`) | Checkpoint post-entrenado de referencia en formato Transformers |
| Spark-X2.5-4B | no disponible | no disponible | no disponible | Referenciado en la model card | Generación anterior; misma arquitectura, peor post-entrenamiento según el autor |
| Qwen3.5-4B | no disponible | no disponible | no disponible | Citado como referencia por el autor | Usado como baseline de eficiencia de inferencia en la model card |
| Gemma-E4B | no disponible | no disponible | no disponible | Citado como referencia por el autor | Usado como baseline de eficiencia de inferencia en la model card |

No se dispone de cifras de benchmarks ni de especificaciones detalladas de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está evaluado ni garantizado.
- Alucinación: no se publican tasas de alucinación ni evaluaciones de veracidad para esta cuantización.
- Cuantización NVFP4A16 sin calibración: al ser weight-only y generada con `model_free_ptq` sin datos de calibración, es esperable cierta degradación frente al checkpoint en BF16, pero el autor no cuantifica la pérdida.
- Madurez del stack: la clase `Spark2_5ForCausalLM` no está en el núcleo de vLLM; el despliegue exige un plugin out-of-tree más tres parches manuales sobre rutas internas de vLLM, lo que es frágil ante actualizaciones y poco adecuado para producción sin fijar versiones.
- Procedencia: es una cuantización no oficial publicada por un tercero (tuevuong), no por XHToken; conviene validarla contra el modelo original antes de usarla.
- Señales de adopción: 0 descargas y 0 likes en el momento de la consulta, y ausencia de resultados de benchmarks numéricos verificables.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales declaradas, pero debe verificarse que el modelo base `XHToken/Spark-X2.6-4B-Base` mantiene la misma licencia.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad.
- Contexto: aunque se declaran 256k tokens, no se aportan resultados de rendimiento en tareas de recuperación a lo largo de esa ventana (por ejemplo, pruebas tipo needle-in-a-haystack).

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/tuevuong/Spark-X2.6-4B-NVFP4A16
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B-Base
- Modelo post-entrenado de referencia: https://huggingface.co/XHToken/Spark-X2.6-4B
- Plugin de vLLM para Spark: https://github.com/XHToken/Spark-plugin
- Slack: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
- WeChat (imagen en el repo): images/xhtoken-wechat.jpg
