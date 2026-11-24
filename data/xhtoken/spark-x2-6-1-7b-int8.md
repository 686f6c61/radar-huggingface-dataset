# XHToken/Spark-X2.6-1.7B-INT8

## Resumen

Spark-X2.6-1.7B-INT8 es la versión cuantizada a 8 bits del modelo Spark-X2.6-1.7B, un LLM compacto de propósito general desarrollado por XHToken (equipo SparkLLM) para despliegue en dispositivo (on-device). Con 1.707.657.216 parámetros reales y un peso de repositorio de 2,0 GB, es el segundo miembro de la serie Spark-X2.6 tras el Spark-X2.6-4B, y se construye sobre el Spark-X2.5-1.7B manteniendo exactamente la misma arquitectura pero con un post-entrenamiento mejorado.

El modelo está orientado a tareas de código, agentes, contexto largo, multilingüismo y razonamiento, con un enfoque explícito en eficiencia de decodificación en hardware local. Incorpora un presupuesto de razonamiento configurable con tres niveles (none, low, high) que permite ajustar la calidad frente a la latencia y el coste de inferencia. Soporta inglés y chino, y se distribuye bajo licencia Apache 2.0.

Esta variante INT8 emplea el formato compressed-tensors de 8 bits, lo que reduce el espacio en disco y facilita su ejecución en GPUs de consumo. El modelo está pensado para desarrolladores que necesitan integrar un asistente conversacional capaz en entornos con recursos limitados, manteniendo tool calling, planificación multi-paso y razonamiento sobre contextos extensos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (serie Spark-X2.5/X2.6, código personalizado `spark2_5`) |
| Parametros totales | 1.707.657.216 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de generación usa `max_new_tokens=131072`) |
| Tipos de cuantizacion | INT8 (compressed-tensors, 8-bit) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cuantización compressed-tensors 8-bit) |

## Arquitectura y entrenamiento

Spark-X2.6-1.7B conserva exactamente la misma arquitectura que Spark-X2.5-1.7B, según indica el autor; las mejoras de capacidad provienen del post-entrenamiento y no de cambios estructurales. Se trata de un transformer de 1.707.657.216 parámetros con código personalizado (`spark2_5`) y librería transformers, lo que implica que requiere `trust_remote_code=True` para cargarse. No se especifica en la información disponible si emplea atención lineal, decodificación especulativa u otras innovaciones de atención.

El post-entrenamiento se orienta a mejorar código, comportamiento agéntico, contexto largo, multilingüismo y razonamiento, aunque la model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. La innovación técnica destacada es el presupuesto de razonamiento configurable en tres niveles (none, low, high): al pasar de high a low, la puntuación media cae 4,0 puntos mientras la longitud media de salida se reduce un 37,3%. El autor también publica una implementación optimizada de llama.cpp para mejorar el throughput de decodificación.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento con modo de pensamiento controlable (none, low, high) para equilibrar calidad y latencia.
- Generación y asistencia de código, incluyendo ingeniería de software.
- Uso de herramientas (tool calling) y comportamiento agéntico con planificación multi-paso.
- Razonamiento sobre contextos largos.
- Capacidades matemáticas y de conocimiento general.
- Tareas de tipo agente evaluadas junto a código, matemáticas, contexto largo y conocimiento general.
- Capacidades multilingües limitadas a inglés y chino según la model card.

## Casos de uso

- Asistente de código en el IDE: el modelo puede completar y explicar fragmentos de código y participar en tareas de ingeniería de software, aprovechando su mejora específica en código y su bajo coste de decodificación para respuestas interactivas.
- Agente autónomo con tool calling: adecuado para pipelines donde el modelo encadena llamadas a herramientas y planificación multi-paso, con el nivel de razonamiento ajustable según la criticidad de la tarea.
- Atención al cliente bilingüe (inglés/chino): conversaciones multi-turno con contexto largo y modo de pensamiento desactivable para minimizar latencia en respuestas simples.
- Asistente local en dispositivo: con 1,7B parámetros en INT8 y 2,0 GB de pesos, puede desplegarse en portátiles y estaciones de trabajo con GPU de consumo para asistentes offline.
- Procesamiento de documentos largos: análisis y razonamiento sobre contextos extensos, con la opción de activar razonamiento alto cuando la tarea lo requiera.
- Automatización de soporte técnico en chino e inglés: clasificación, resumen y generación de respuestas con control del presupuesto de razonamiento para cumplir objetivos de latencia.
- Prototipado rápido de aplicaciones LLM: al ser Apache 2.0 y ejecutable con transformers y SGLang, sirve para validar flujos agénticos antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La model card indica que el modelo supera a modelos de tamaño comparable en la mayoría de benchmarks (agente, código, matemáticas, conocimiento general y contexto largo) y muestra gráficas (`all_benchmark.svg`, `inference.svg`, `reasoning_effort.svg`), pero no se incluyen los valores numéricos en la información proporcionada. El autor menciona comparaciones con Qwen3.5-2B, MiniCPM-2B y LFM2.5-2.6B, y afirma liderar el throughput de decodificación en contextos cortos entre los modelos on-device evaluados, con ventajas ampliadas mediante su fork de llama.cpp en una RTX 4090.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos INT8 ocupan aproximadamente 2,0 GB; con overhead de activaciones y caché KV, se estima un uso de 3-5 GB según longitud de contexto (estimación, no dato del autor).
- GPU recomendadas: RTX 4090 (el autor publica mediciones de throughput en esta GPU); GPUs con al menos 6-8 GB de VRAM para contextos moderados.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores con 8 GB o más, y en GPUs integradas con suficiente memoria compartida (no confirmado por el autor).
- Opciones de despliegue: transformers 4.57.1 con `trust_remote_code=True`, SGLang (imágenes nightly para NVIDIA y Ascend NPU) y llama.cpp mediante el fork optimizado del autor.
- Latencia y throughput: el autor afirma liderar el throughput de decodificación entre modelos on-device comparables en contextos cortos; no se proporcionan cifras concretas (tokens/s) en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B-INT8 | 1,71B | no disponible | Apache 2.0 | Hugging Face | Variante INT8; comparado por el autor con Qwen3.5-2B, MiniCPM-2B y LFM2.5-2.6B |
| Qwen3.5-2B | ~2B | no disponible | no disponible | no disponible | Referencia de comparación citada por el autor |
| MiniCPM-2B | ~2B | no disponible | no disponible | no disponible | Referencia de comparación citada por el autor |
| LFM2.5-2.6B | ~2,6B | no disponible | no disponible | no disponible | Referencia de comparación citada por el autor |

No se dispone de datos numéricos de rendimiento para establecer una comparación cuantitativa; la model card solo indica que Spark-X2.6-1.7B supera a estos modelos en la mayoría de benchmarks y en throughput de decodificación en contextos cortos.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a los LLM de 1,7B parámetros; no se documentan mitigaciones específicas.
- No se detallan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- La longitud de contexto no se especifica en la model card; el ejemplo usa `max_new_tokens=131072`, que no equivale necesariamente a la ventana de contexto.
- Requiere `trust_remote_code=True` y una versión concreta de transformers (4.57.1), lo que añade riesgo de compatibilidad en producción.
- El formato compressed-tensors INT8 puede no ser compatible con todos los runtimes; verificar soporte en vLLM, TGI u Ollama antes de desplegar.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del código personalizado incluido.
- Modelo pequeño: no es adecuado para tareas que exijan conocimiento factual extenso o razonamiento de alta complejidad sin verificación externa.

## Enlaces

- Hugging Face: https://huggingface.co/XHToken/Spark-X2.6-1.7B-INT8
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Fork optimizado de llama.cpp: https://github.com/XHToken/llama.cpp
- Slack: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
