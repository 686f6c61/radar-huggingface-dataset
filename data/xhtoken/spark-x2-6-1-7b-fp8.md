# XHToken/Spark-X2.6-1.7B-FP8

## Resumen

Spark-X2.6-1.7B-FP8 es la versión cuantizada en FP8 del modelo Spark-X2.6-1.7B, desarrollado por XHToken (equipo SparkLLM). Se trata de un modelo de lenguaje compacto de propósito general orientado a despliegue en dispositivo (on-device), segundo miembro de la serie Spark-X2.6 tras el Spark-X2.6-4B. Mantiene exactamente la misma arquitectura que su predecesor Spark-X2.5-1.7B y obtiene sus mejoras de capacidad mediante un post-entrenamiento refinado, con avances en codificación, uso de agentes, contexto largo, multilingüismo y razonamiento.

El modelo cuenta con 1.707.657.216 parámetros totales (aproximadamente 1,7 mil millones) y se distribuye en formato safetensors bajo licencia Apache 2.0, con soporte para inglés y chino. Su propuesta de valor se centra en la eficiencia de inferencia: el autor declara un rendimiento de decodificación líder entre modelos de tamaño comparable en contextos cortos, con una implementación optimizada de llama.cpp que amplía esa ventaja en todas las longitudes de contexto probadas sobre una RTX 4090.

Esta variante FP8 emplea el formato de compresión `compressed-tensors` y está pensada para reducir los requisitos de memoria y aumentar el throughput en hardware con soporte de FP8, manteniendo la calidad del modelo base. Es relevante ahora porque el ecosistema de modelos pequeños y eficientes para ejecución local está en plena expansión, y esta ficha permite evaluar si el modelo encaja en flujos de trabajo con restricciones de VRAM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (misma arquitectura que Spark-X2.5-1.7B; detalles internos no disponibles) |
| Parámetros totales | 1.707.657.216 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma explícita (el ejemplo de generación usa `max_new_tokens=131072`) |
| Tipos de cuantización | FP8 (formato `compressed-tensors`); el modelo base admite otras cuantizaciones vía llama.cpp |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8 comprimido); GGUF disponible a través de la implementación de llama.cpp del autor |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que Spark-X2.6-1.7B «retiene exactamente la misma arquitectura que Spark-X2.5-1.7B» y que las mejoras de capacidad provienen de un post-entrenamiento mejorado. No se especifica si emplea atención lineal, decodificación especulativa ni el número de tokens de entrenamiento. El modelo base fue post-entrenado y esta variante aplica cuantización FP8 mediante `compressed-tensors`.

La innovación técnica destacada por el autor es el «thinking budget» configurable con tres niveles (none, low, high), que permite ajustar el equilibrio entre calidad de razonamiento, latencia y coste de inferencia. Según la model card, al pasar de high a low en Spark-X2.6-1.7B la puntuación media cae 4,0 puntos mientras la longitud media de salida se reduce un 37,3 %. También se menciona una implementación optimizada de llama.cpp mantenida por el propio autor para maximizar el rendimiento en inferencia local.

## Capacidades

- Generación de texto conversacional y de propósito general.
- Razonamiento con presupuesto de pensamiento configurable (none, low, high).
- Codificación y ingeniería de software.
- Uso de herramientas (tool use) y flujos agénticos con planificación multi-paso.
- Razonamiento sobre contextos largos.
- Capacidades multilingües limitadas a inglés y chino.
- Matemáticas y conocimiento general (evaluados en los benchmarks del autor).
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Asistentes locales en dispositivo: el tamaño de 1,7B parámetros y la variante FP8 permiten ejecutar el modelo en hardware de consumo, ofreciendo respuestas conversacionales sin depender de la nube.
- Automatización de atención al cliente: puede gestionar conversaciones multi-turno en inglés y chino, con la ventaja de que el nivel de pensamiento «none» reduce la latencia en consultas simples.
- Generación de código en pipelines de desarrollo: su mejora declarada en codificación y uso de herramientas permite integrarlo en asistentes de IDE o revisión automatizada de parches.
- Agentes multi-paso con llamadas a funciones: el soporte de tool use y planificación lo hace adecuado para orquestar tareas que requieren varias invocaciones encadenadas.
- Procesamiento de documentos largos: el razonamiento sobre contextos extendidos (el ejemplo usa hasta 131.072 tokens de generación) sirve para resumir o extraer información de textos extensos.
- Despliegue en edge con presupuesto de cómputo ajustado: el control del thinking budget permite degradar el razonamiento para ahorrar cómputo en dispositivos con recursos limitados.
- Servicio de inferencia de alto throughput: la variante FP8 y la implementación optimizada de llama.cpp buscan maximizar la decodificación por segundo en GPUs como la RTX 4090.

## Benchmarks y rendimiento

La model card indica que el modelo supera a modelos de tamaño comparable en la mayoría de benchmarks (agente, código, matemáticas, conocimiento general), pero los resultados se presentan únicamente como imágenes (`all_benchmark.svg`) y no como cifras textuales. Por tanto, no se dispone de valores numéricos verificables en la información proporcionada.

| Benchmark | Spark-X2.6-1.7B-FP8 | Comparativa |
|---|---|---|
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |

Datos cualitativos declarados por el autor: rendimiento de decodificación líder en contextos cortos frente a Qwen3.5-2B, MiniCPM-2B y LFM2.5-2.6B, y caída media de 4,0 puntos al pasar de razonamiento high a low con reducción del 37,3 % en longitud de salida.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,7B parámetros en FP8, el peso ocupa aproximadamente 1,7 GB; sumando overhead de activaciones y caché KV, se estima un uso de 2,5–4 GB según longitud de contexto.
- GPU recomendadas: RTX 4090 (probada por el autor), A100, H100 para despliegues de mayor concurrencia; también se documenta soporte para Ascend NPU (A2 y A3) vía SGLang.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 4–6 GB de VRAM en FP8; en el modelo base cuantizado a 4 bits cabría en GPUs aún más modestas.
- Opciones de despliegue: Transformers (requiere `transformers==4.57.1` y `trust_remote_code=True`), SGLang (imágenes nightly para CUDA 13 y Ascend), y llama.cpp mediante la implementación optimizada del autor.
- Latencia y throughput: no se proporcionan cifras absolutas; el autor afirma liderar la decodificación en contextos cortos entre modelos comparables y mantener la ventaja en todas las longitudes probadas sobre RTX 4090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Spark-X2.6-1.7B-FP8 | 1,7B | no disponible | Apache 2.0 | Hugging Face |
| Qwen3.5-2B | ~2B | no disponible | no disponible | referenciado por el autor |
| MiniCPM-2B | ~2B | no disponible | no disponible | referenciado por el autor |
| LFM2.5-2.6B | ~2,6B | no disponible | no disponible | referenciado por el autor |

Los tres modelos de comparación son los que el propio autor emplea en su evaluación de eficiencia de inferencia; no se dispone de sus especificaciones detalladas ni de resultados numéricos comparativos en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni evaluado.
- Riesgo de alucinación inherente a modelos de este tamaño; no se documentan medidas específicas de mitigación.
- No se publican cifras numéricas de benchmarks, solo gráficos, lo que dificulta la verificación independiente.
- La cuantización FP8 puede introducir degradación de calidad respecto al modelo base, aunque el autor no cuantifica la pérdida.
- Requiere `trust_remote_code=True` y una versión concreta de Transformers (4.57.1), lo que añade fricción de integración.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos de los componentes de terceros y del código remoto.
- El soporte de SGLang se basa en imágenes nightly, lo que implica menor estabilidad para producción.
- No se documentan capacidades de visión, audio ni function calling con esquemas formales más allá de la mención a tool use.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XHToken/Spark-X2.6-1.7B-FP8
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Implementación optimizada de llama.cpp: https://github.com/XHToken/llama.cpp
- Slack: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
