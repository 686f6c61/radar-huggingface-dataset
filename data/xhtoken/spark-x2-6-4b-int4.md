# XHToken/Spark-X2.6-4B-INT4

## Resumen

Spark-X2.6-4B-INT4 es la versión cuantizada a 4 bits del modelo Spark-X2.6-4B, un modelo de lenguaje compacto y de propósito general desarrollado por XHToken (equipo SparkLLM) para despliegue en dispositivos (on-device). Está construido como versión post-entrenada del Spark-X2.6-4B, que a su vez parte de la arquitectura de Spark-X2.5-4B. Este repositorio concreto contiene los pesos cuantizados mediante la librería `compressed-tensors`, lo que reduce el tamaño del repositorio a 3,4 GB frente a los aproximadamente 8 GB que ocuparía un checkpoint en FP16 con cerca de 2.000 millones de parámetros.

El modelo está orientado a tareas de agente, generación de código, razonamiento, contexto largo y uso multilingüe (inglés y chino), con un enfoque explícito en eficiencia de inferencia en el borde. Incorpora un presupuesto de razonamiento configurable con tres niveles (none, low, high) que permite ajustar la calidad del razonamiento frente a la latencia y el coste de inferencia. Según la model card, alcanza un rendimiento comparable o superior al de modelos de aproximadamente 9B parámetros en varios benchmarks, y su eficiencia se compara con Qwen3.5-4B y Gemma-E4B.

Es relevante ahora porque el segmento de modelos pequeños con capacidades agénticas está creciendo rápidamente, y esta variante INT4 facilita su ejecución en hardware de consumo y en entornos con restricciones de memoria, manteniendo la licencia Apache 2.0 para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura de Spark-X2.5-4B, sin cambios según la model card); requiere `trust_remote_code` |
| Parametros totales | 1.970.362.880 (~2B, según safetensors) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible de forma explícita; el ejemplo de generación usa `max_new_tokens=131072`, lo que sugiere soporte de contexto largo, pero no se confirma la ventana exacta |
| Tipos de cuantizacion | INT4 (cuantización de 4 bits mediante `compressed-tensors`) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (con configuración de `compressed-tensors`), cargable con Transformers |

## Arquitectura y entrenamiento

La model card indica que Spark-X2.6-4B conserva exactamente la misma arquitectura que Spark-X2.5-4B, y que las mejoras de capacidad provienen del post-entrenamiento, no de cambios estructurales. No se detalla en la información disponible el número de capas, dimensión oculta, mecanismo de atención ni si emplea innovaciones como atención lineal o decodificación especulativa. Tampoco se especifica el número de tokens de entrenamiento ni la composición del dataset.

Sí se documenta el resultado del post-entrenamiento: mejoras sustanciales en código, comportamiento agéntico (uso complejo de herramientas, planificación multi-paso, ingeniería de software), contexto largo, multilingüismo y razonamiento. Se menciona un presupuesto de razonamiento controlable con tres niveles (none, low, high). No se confirma en la información proporcionada si se emplearon RLHF, DPO u otras técnicas de alineación concretas.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con presupuesto configurable: niveles none, low y high, que permiten equilibrar calidad y latencia.
- Generación y comprensión de código, incluyendo tareas de ingeniería de software.
- Flujos agénticos: uso complejo de herramientas, planificación multi-paso y ejecución de tareas de varios pasos.
- Capacidades de contexto largo (el ejemplo de la model card emplea hasta 131.072 tokens nuevos de generación).
- Soporte multilingüe limitado a inglés y chino.
- Integración con Transformers (requiere `transformers==4.57.1` y `trust_remote_code=True`).
- Servido mediante SGLang con API compatible con OpenAI, incluyendo soporte para GPUs NVIDIA y NPUs Ascend.

## Casos de uso

- Asistentes on-device en aplicaciones móviles o de escritorio: el tamaño INT4 (3,4 GB de repositorio) y el presupuesto de razonamiento configurable permiten ejecutar el modelo en dispositivos con memoria limitada, ajustando el nivel de razonamiento a "none" o "low" para respuestas rápidas.
- Agentes de automatización de tareas con herramientas: el modelo está entrenado explícitamente para uso complejo de herramientas y planificación multi-paso, lo que lo hace adecuado para orquestar llamadas a APIs en pipelines de automatización.
- Asistencia a la programación en local: generación de código y tareas de ingeniería de software en entornos sin conexión o con requisitos de privacidad, desplegado con SGLang o Transformers.
- Procesamiento de documentos largos en inglés o chino: gracias al soporte de contexto largo, puede resumir, extraer información o responder preguntas sobre documentos extensos en esos dos idiomas.
- Chatbots de atención al cliente bilingües (en/zh): conversaciones multi-turno con contexto largo y latencia controlable mediante el nivel de razonamiento bajo.
- Prototipado rápido de aplicaciones de IA en hardware de consumo: la cuantización INT4 reduce los requisitos de VRAM, permitiendo experimentar en GPUs de gama media o alta de consumo.
- Servido en infraestructura con NPUs Ascend: la model card documenta imágenes de SGLang para A2 y A3, lo que facilita despliegues en hardware no NVIDIA.

## Benchmarks y rendimiento

La model card menciona que Spark-X2.6-4B obtiene el mejor rendimiento de su clase entre modelos de tamaño comparable y que iguala o supera a modelos de aproximadamente 9B parámetros en varios benchmarks. Sin embargo, los resultados numéricos están publicados únicamente como imágenes (`benchmark.svg`, `all_benchmark.svg`, `reasoning_effort.svg`) y no se incluyen en el texto disponible. Se proporcionan dos datos concretos sobre el presupuesto de razonamiento:

| Métrica | Valor |
|---|---|
| Spark-X2.6-4B: caída media de puntuación al pasar de high a low | 1,7 puntos |
| Spark-X2.6-4B: reducción de longitud media de salida al pasar de high a low | 22,0 % |
| Spark-X2.6-1.7B: caída media de puntuación al pasar de high a low | 4,0 puntos |
| Spark-X2.6-1.7B: reducción de longitud media de salida al pasar de high a low | 37,3 % |

No se han publicado resultados numéricos detallados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en el texto de la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización INT4 y ~2B parámetros, el peso ocupa aproximadamente 1 GB (el repositorio completo son 3,4 GB, incluyendo posibles pesos adicionales y ficheros de configuración). La VRAM total dependerá de la longitud de contexto y del backend.
- Cabe en GPUs de consumo: sí, previsiblemente en tarjetas con 6-8 GB de VRAM o más, aunque no se proporcionan cifras oficiales.
- GPUs recomendadas: no se especifican modelos concretos; la model card documenta SGLang para NVIDIA (imagen `lmsysorg/sglang:nightly-dev-cu13-...`) y para NPUs Ascend A2 y A3.
- Opciones de despliegue: Transformers (versión 4.57.1, con `trust_remote_code=True`) y SGLang con API compatible con OpenAI. No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: la model card afirma una eficiencia de inferencia igual o mejor que Qwen3.5-4B y Gemma-E4B, pero no se aportan cifras concretas de latencia o tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Spark-X2.6-4B-INT4 | ~2B (INT4) | No disponible explícitamente | Apache 2.0 | Versión cuantizada; comparado en la model card con modelos de ~9B |
| Qwen3.5-4B | 4B (según denominación) | No disponible | No disponible en esta información | Referencia de eficiencia en la model card |
| Gemma-E4B | No disponible | No disponible | No disponible en esta información | Referencia de eficiencia en la model card |
| Spark-X2.6-1.7B | 1,7B | No disponible | No disponible en esta información | Variante menor de la misma familia, citada en la comparativa de razonamiento |

Los datos de rendimiento comparativo están en imágenes no incluidas en el texto; no se dispone de cifras numéricas para una comparación cuantitativa.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- La cuantización INT4 puede degradar la calidad respecto al modelo base en FP16/BF16; no se documenta la magnitud de esa pérdida.
- Riesgo de alucinación inherente a modelos de este tamaño; no se documentan evaluaciones de factualidad.
- No se detallan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar dicho código antes de usarlo en producción.
- La longitud de contexto no se especifica de forma explícita; el valor de 131.072 en el ejemplo corresponde a `max_new_tokens`, no necesariamente a la ventana de contexto.
- Licencia Apache 2.0, que permite uso comercial, pero se recomienda revisar los términos del modelo base y de los pesos cuantizados.
- El soporte depende de versiones concretas de Transformers (4.57.1) e imágenes de SGLang específicas, lo que puede complicar la integración en stacks existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XHToken/Spark-X2.6-4B-INT4
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Slack: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
