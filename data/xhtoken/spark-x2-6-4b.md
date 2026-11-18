# XHToken/Spark-X2.6-4B

## Resumen

Spark-X2.6-4B es un modelo de lenguaje de 4.112 millones de parámetros (4,1B) desarrollado por XHToken, pensado específicamente para despliegue en dispositivo (on-device) y tareas agénticas del mundo real. Es la evolución del Spark-X2.5-4B: mantiene exactamente la misma arquitectura y concentra todas sus mejoras en el post-entrenamiento, lo que se traduce en avances en código, uso de herramientas, contexto largo, multilingüismo y razonamiento. Se distribuye bajo licencia Apache 2.0, lo que facilita su adopción comercial.

El modelo está orientado a agentes: soporta flujos con tool calling, planificación multi-paso y razonamiento con presupuesto de pensamiento configurable en tres niveles (none, low, high). Según el autor, iguala o supera a modelos de aproximadamente 9B parámetros en varios benchmarks, y declara una eficiencia de inferencia comparable o mejor que Qwen3.5-4B y Gemma-E4B. Soporta inglés y chino, y se publica en formato safetensors para transformers (con `trust_remote_code`).

Su relevancia actual radica en la combinación de tamaño reducido, licencia permisiva y capacidades agénticas, un perfil poco común entre modelos de 4B y muy demandado para asistentes locales, automatización de escritorio y pipelines con requisitos de latencia y privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (misma arquitectura que Spark-X2.5-4B; detalles internos no disponibles) |
| Parametros totales | 4.112.079.360 (4,1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma explícita; el ejemplo oficial usa `max_new_tokens=131072`, lo que sugiere soporte de generación de hasta 131.072 tokens |
| Tipos de cuantizacion | No disponible en la información proporcionada (solo se publican pesos safetensors) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

Spark-X2.6-4B es un transformer denso de 4,1B parámetros que reutiliza íntegramente la arquitectura de Spark-X2.5-4B. El autor indica explícitamente que las ganancias de capacidad provienen del post-entrenamiento y no de cambios estructurales, lo que implica que el modelo base (`XHToken/Spark-X2.6-4B-Base`) comparte el mismo esqueleto y que el trabajo se concentró en la fase de ajuste fino y alineación. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineación concretas.

La innovación técnica destacada es el «presupuesto de pensamiento» (thinking budget) configurable en tres niveles (none, low, high), que permite a la aplicación ajustar dinámicamente la calidad del razonamiento frente a la latencia y el coste de inferencia. El autor reporta que, al pasar de high a low, la puntuación media cae 1,7 puntos en el modelo de 4B mientras la longitud media de salida se reduce un 22,0%. El modelo se integra con transformers 4.57.1 y con SGLang (imágenes para GPU NVIDIA y NPU Ascend), y expone una API compatible con OpenAI.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento con modo de pensamiento controlable (none, low, high) para equilibrar precisión y coste.
- Programación y tareas de ingeniería de software, con mejoras sustanciales respecto a Spark-X2.5-4B.
- Flujos agénticos: uso complejo de herramientas (tool calling), planificación multi-paso y razonamiento encadenado.
- Contexto largo, con generación de hasta 131.072 tokens en el ejemplo oficial.
- Capacidades matemáticas y de conocimiento general evaluadas en los benchmarks del autor.
- Capacidades multilingües limitadas a inglés y chino.
- No se documentan capacidades de visión ni de audio en la información disponible.

## Casos de uso

- Asistentes locales en escritorio y móvil: el tamaño de 4,1B y la licencia Apache 2.0 permiten empaquetar el modelo en aplicaciones de usuario final que necesitan privacidad y funcionamiento sin conexión, con razonamiento ajustable según el tipo de consulta.
- Automatización agéntica con herramientas: gracias al soporte de tool calling y planificación multi-paso, puede orquestar llamadas a APIs, consultas a bases de datos y acciones sobre sistemas operativos en flujos de varios pasos.
- Copiloto de código en IDE: las mejoras en programación y el modo de pensamiento bajo permiten autocompletado y generación de parches con latencia reducida, reservando el modo alto para refactorizaciones complejas.
- Atención al cliente automatizada: la ventana de contexto larga (hasta 131.072 tokens de generación) permite gestionar conversaciones multi-turno con historial extenso y documentación de producto adjunta.
- Procesamiento de documentos extensos en inglés y chino: resumen, extracción de entidades y respuesta a preguntas sobre contratos, informes o expedientes que superan la ventana típica de modelos pequeños.
- Enrutamiento y clasificación con razonamiento ligero: usando el nivel «none» o «low» se obtiene un clasificador/generador de bajo coste para triaje de tickets, moderación o etiquetado semántico en producción.
- Despliegue en infraestructura heterogénea: la compatibilidad con SGLang en GPU NVIDIA y NPU Ascend facilita servir el modelo en clústeres mixtos o en hardware de aceleración no NVIDIA.

## Benchmarks y rendimiento

El autor publica gráficas de benchmarks (agent, code, math, general y knowledge) en las imágenes del repositorio (`images/all_benchmark.svg`, `images/benchmark.svg`), pero los valores numéricos no están incluidos en la información textual proporcionada. Los únicos datos cuantitativos disponibles son los del análisis de esfuerzo de razonamiento:

| Métrica | Spark-X2.6-4B (high → low) |
|---|---|
| Variación de puntuación media | -1,7 puntos |
| Variación de longitud media de salida | -22,0% |

Para Spark-X2.6-1.7B, el mismo análisis reporta -4,0 puntos y -37,3% de longitud. No se han publicado en la información disponible los resultados numéricos de MMLU, HumanEval, GSM8K ni de los benchmarks agénticos; las comparaciones se limitan a afirmaciones cualitativas del autor (rendimiento similar o superior a modelos de ~9B y eficiencia comparable a Qwen3.5-4B y Gemma-E4B).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para 4,1B parámetros en FP16/BF16 se requieren aproximadamente 8,2 GB solo para pesos, más overhead de KV cache; en cuantización de 8 bits rondaría 4-5 GB y en 4 bits 2,5-3 GB, aunque el autor no publica cifras ni pesos cuantizados.
- GPU recomendadas: el autor documenta despliegue con SGLang en GPU NVIDIA (imagen `lmsysorg/sglang:nightly-dev-cu13-...`) y en NPU Ascend A2/A3 (CANN 9.0.0). No se especifican modelos concretos de GPU.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por tamaño, cabría en GPUs consumer con 8-12 GB de VRAM en precisión reducida, pero no hay validación publicada.
- Opciones de despliegue: transformers 4.57.1 (con `trust_remote_code=True`) y SGLang con API compatible con OpenAI. No se mencionan llama.cpp, Ollama, vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor afirma eficiencia «igual o mejor» que Qwen3.5-4B y Gemma-E4B, sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Spark-X2.6-4B | 4,1B | Hasta 131.072 tokens de generación (no confirmado como contexto máximo) | Apache 2.0 | Orientado a agentes on-device; thinking budget configurable |
| Qwen3.5-4B | ~4B | No disponible | No disponible | Referencia de eficiencia citada por el autor; sin datos numéricos comparativos publicados |
| Gemma-E4B | ~4B (E4B) | No disponible | No disponible | Referencia de eficiencia citada por el autor; sin datos numéricos comparativos publicados |
| Spark-X2.5-4B | 4,1B | No disponible | Apache 2.0 (presumible, misma familia) | Generación anterior; misma arquitectura, peor post-entrenamiento |

No se dispone de resultados numéricos de benchmarks para establecer una comparación cuantitativa rigurosa con las alternativas.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano no está evaluado ni garantizado.
- Riesgo de alucinación inherente a modelos de 4B: menor fiabilidad factual que modelos de mayor tamaño en conocimiento general.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad en la información disponible.
- Requiere `trust_remote_code=True` y una versión concreta de transformers (4.57.1), lo que añade riesgo de compatibilidad y de ejecución de código del repositorio.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de bajos recursos sin cuantización propia.
- La longitud de contexto real no está especificada: el valor de 131.072 aparece como `max_new_tokens` en el ejemplo, no como ventana de contexto documentada.
- Los benchmarks solo están disponibles como imágenes sin valores numéricos en el texto; las afirmaciones de paridad con modelos de 9B no son verificables con los datos proporcionados.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene revisar los términos del modelo base y las dependencias de código personalizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XHToken/Spark-X2.6-4B
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B-Base
- Slack: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
