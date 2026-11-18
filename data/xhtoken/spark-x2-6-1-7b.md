# XHToken/Spark-X2.6-1.7B

## Resumen

Spark-X2.6-1.7B es un modelo de lenguaje de tipo decoder-only desarrollado por XHToken, segundo miembro de la serie Spark-X2.6 tras el Spark-X2.6-4B. Se trata de un modelo compacto de 1.707.657.216 parámetros (aproximadamente 1,7 mil millones) orientado a despliegue en dispositivo (on-device), que parte del modelo base Spark-X2.6-1.7B-Base y ha sido sometido a un post-entrenamiento intensivo para mejorar capacidades de código, uso de agentes, contexto largo, multilingüismo y razonamiento.

La propuesta de valor del modelo es conservar exactamente la misma arquitectura que su predecesor Spark-X2.5-1.7B y obtener las mejoras de capacidad exclusivamente mediante un post-entrenamiento mejorado, lo que facilita la migración desde la versión anterior. XHToken lo presenta como un modelo de propósito general para IA local, con énfasis en eficiencia de decodificación y un presupuesto de razonamiento configurable en tres niveles (ninguno, bajo, alto).

Es relevante ahora porque compite directamente en el segmento de modelos de 2B para inferencia en hardware de consumo, junto a alternativas como Qwen3.5-2B, MiniCPM-2B y LFM2.5-2.6B, y porque su licencia Apache 2.0 permite uso comercial sin restricciones adicionales. La model card menciona soporte para contextos de hasta 131.072 tokens en generación, aunque no se detalla explícitamente la longitud de contexto de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura idéntica a Spark-X2.5-1.7B; requiere `trust_remote_code=True`) |
| Parametros totales | 1.707.657.216 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 131.072 tokens en generación según el ejemplo de la model card (longitud de entrenamiento no disponible) |
| Tipos de cuantizacion | No disponible en la información proporcionada (existe implementación optimizada de llama.cpp, que habitualmente soporta GGUF) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face Transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con exactamente la misma arquitectura que Spark-X2.5-1.7B; las ganancias de capacidad provienen íntegramente del post-entrenamiento. El repositorio incluye código personalizado (`custom_code`), por lo que es necesario cargarlo con `trust_remote_code=True` y con `transformers==4.57.1` según las instrucciones del autor. El modelo base es XHToken/Spark-X2.6-1.7B-Base, sobre el que se aplicó un fine-tuning posterior.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas de RLHF o DPO. La model card sí destaca una innovación relevante: un presupuesto de razonamiento controlable con tres niveles (none, low, high), que permite ajustar dinámicamente la calidad del razonamiento frente a la latencia y el coste de inferencia. Según los datos del autor, al pasar de razonamiento alto a bajo en el modelo de 1.7B la puntuación media cae 4,0 puntos mientras que la longitud media de salida se reduce un 37,3% (en el modelo de 4B la caída es de 1,7 puntos con una reducción del 22,0%).

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento con modo de pensamiento configurable en tres niveles (none, low, high).
- Generación y razonamiento sobre código, con mejoras sustanciales en ingeniería de software según el autor.
- Uso de herramientas (tool use) complejo y planificación multi-paso para flujos agénticos.
- Razonamiento sobre contextos largos (hasta 131.072 tokens en el ejemplo de generación).
- Capacidades matemáticas, evaluadas explícitamente en los benchmarks del autor.
- Capacidades multilingües limitadas a inglés y chino.
- Conocimiento general y tareas de conocimiento enciclopédico.
- Inferencia eficiente en dispositivo, con implementación optimizada de llama.cpp mantenida por XHToken.

## Casos de uso

- Asistente de código en local: el modelo puede integrarse en editores o IDE mediante llama.cpp o SGLang para autocompletado y generación de funciones, aprovechando sus mejoras en código y su bajo requisito de VRAM para ejecutarse en un portátil con GPU de consumo.
- Agentes autónomos de escritorio: con soporte de tool use y planificación multi-paso, puede orquestar llamadas a APIs y herramientas locales en un pipeline agéntico, ajustando el nivel de razonamiento a "low" para tareas rutinarias y a "high" para decisiones complejas.
- Análisis de documentos largos: gracias a la ventana de hasta 131.072 tokens, puede resumir o extraer información de contratos, informes o expedientes extensos sin fragmentación agresiva.
- Atención al cliente bilingüe (inglés/chino): adecuado para entornos de soporte en mercados asiáticos, gestionando conversaciones multi-turno con contexto largo y desplegado en servidores modestos o en el propio dispositivo del usuario.
- Procesamiento por lotes en el edge: para clasificación, extracción de entidades o generación de resúmenes en dispositivos con recursos limitados, donde su throughput de decodificación superior en contextos cortos frente a modelos comparables reduce el coste por petición.
- Prototipado rápido de aplicaciones LLM: su licencia Apache 2.0 y su tamaño compacto permiten experimentar sin costes de licencia ni infraestructura GPU de gama alta, sirviendo como banco de pruebas antes de escalar a modelos mayores.
- Razonamiento matemático asistido: con el modo de pensamiento alto activado, puede resolver problemas de matemáticas paso a paso en aplicaciones educativas o de verificación de cálculos.

## Benchmarks y rendimiento

La model card indica que el modelo supera a modelos de tamaño comparable en la mayoría de benchmarks (agente, código, matemáticas, conocimiento general y conocimiento), con resultados state-of-the-art entre modelos open source de tamaño similar. Sin embargo, los datos numéricos se presentan únicamente en imágenes (`all_benchmark.svg`, `reasoning_effort.svg`, `inference.svg`) no incluidas en la información textual proporcionada.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible en formato numérico |
| HumanEval | No disponible en formato numérico |
| GSM8K | No disponible en formato numérico |
| Agente / tool use | No disponible en formato numérico |
| Contexto largo | No disponible en formato numérico |

Datos cualitativos sí disponibles: en eficiencia de decodificación, XHToken afirma que Spark-X2.6-1.7B lidera el throughput de decodificación en contextos cortos entre los modelos on-device evaluados (Qwen3.5-2B, MiniCPM-2B, LFM2.5-2.6B), ventaja que se amplifica con su implementación optimizada de llama.cpp en una RTX 4090 en todas las longitudes de contexto probadas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Para 1,7B parámetros, en FP16 se requieren aproximadamente 3,4 GB de pesos más overhead de activaciones y KV cache; en cuantizaciones de 8 bits o 4 bits el requisito baja sustancialmente (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: el autor evalúa la eficiencia en una RTX 4090; también se documenta despliegue en NPUs Ascend (A2 y A3) mediante imágenes de SGLang.
- GPU de consumo: por tamaño, es apto para GPUs de consumo con suficiente VRAM; el autor no publica una lista oficial de GPUs verificadas más allá de la RTX 4090.
- Opciones de despliegue: Transformers (versión 4.57.1, con `trust_remote_code=True`), SGLang (imagen `lmsysorg/sglang:nightly-dev-cu13-20260827-20621aa1` para NVIDIA; imágenes `quay.io/ascend/sglang:main-cann9.0.0-a3` y `...-910b` para Ascend) y llama.cpp mediante el fork optimizado de XHToken.
- Latencia y throughput: el autor afirma throughput de decodificación líder entre modelos comparables en contextos cortos, con ventaja ampliada en la RTX 4090; no se publican cifras absolutas de tokens por segundo en el texto disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Spark-X2.6-1.7B | 1,7B | Hasta 131.072 tokens (generación) | Apache 2.0 | Presupuesto de razonamiento configurable; foco en on-device |
| Qwen3.5-2B | No disponible en la información | No disponible | No disponible | Citado por el autor como referencia de eficiencia on-device |
| MiniCPM-2B | No disponible en la información | No disponible | No disponible | Citado por el autor como referencia de eficiencia on-device |
| LFM2.5-2.6B | No disponible en la información | No disponible | No disponible | Citado por el autor como referencia de eficiencia on-device |

Los datos de rendimiento comparativo se presentan solo en las figuras de la model card, no en texto; por tanto, no se dispone de cifras numéricas para una comparación cuantitativa en esta ficha.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Riesgo de alucinación inherente a modelos de 1,7B parámetros, especialmente en tareas de conocimiento factual y contextos largos.
- La longitud de contexto de entrenamiento no se especifica; usar los 131.072 tokens del ejemplo de generación podría degradar la calidad si el modelo no fue entrenado para ello.
- Requiere `trust_remote_code=True` y una versión concreta de Transformers (4.57.1), lo que añade riesgo de incompatibilidad en pipelines de producción.
- No se detallan sesgos conocidos, composición del dataset ni procesos de alineación (RLHF/DPO), lo que dificulta evaluar riesgos de sesgo.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero se recomienda verificar los términos de los datos de entrenamiento (no publicados).
- El modelo se posiciona como SOTA entre modelos de tamaño comparable según el autor, pero sin cifras verificables en texto; conviene validar con benchmarks propios antes de adoptarlo en producción.
- La implementación óptima de llama.cpp es un fork mantenido por XHToken, no la versión upstream; esto puede suponer dependencia de un repositorio de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B-Base
- Fork optimizado de llama.cpp: https://github.com/XHToken/llama.cpp
- Slack: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
