# XHToken/Spark-X2.5-1.7B

## Resumen

Spark-X2.5-1.7B es un modelo de lenguaje compacto de propósito general desarrollado por XHToken, con 1.707.657.216 parámetros (aproximadamente 1,7 mil millones) y distribuido bajo licencia Apache 2.0. Forma parte de la familia Spark-X2.5, que también incluye una variante de 4B, y está diseñado para hacer la IA generativa más práctica y eficiente en entornos con recursos limitados, incluyendo despliegue en dispositivo y hardware de consumo.

El modelo emplea una arquitectura de atención híbrida que combina una capa de atención completa con tres capas de atención de ventana deslizante (sliding-window attention), lo que reduce el coste computacional asociado al contexto largo y permite soportar de forma nativa ventanas de hasta 1M de tokens. Según la model card, está entrenado sobre aproximadamente 20 billones de tokens y declara soporte para más de 200 idiomas, aunque los metadatos de Hugging Face solo listan inglés y chino.

Su relevancia actual radica en la combinación de tamaño reducido, contexto muy largo, capacidades de código y agentes, y compatibilidad con múltiples frameworks de inferencia (vLLM, SGLang, llama.cpp, MLX, Ollama, LM Studio). El modelo cuenta con 1.888 descargas y 157 likes en Hugging Face en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (1 capa de atención completa + 3 capas de sliding-window attention) |
| Parámetros totales | 1.707.657.216 (1,7B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 1M tokens (nativo, según model card) |
| Tipos de cuantización | No disponible (no especificado en la información proporcionada) |
| Idiomas soportados | Inglés y chino según metadatos; la model card declara más de 200 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 3,4 GB), requiere `trust_remote_code` (custom_code) |

## Arquitectura y entrenamiento

Spark-X2.5-1.7B es un transformer decoder-only con una arquitectura de atención híbrida: intercala una capa de atención completa con tres capas de atención de ventana deslizante. Este diseño busca equilibrar rendimiento, eficiencia de inferencia y tamaño del KV-cache, reduciendo el coste computacional típico de los modelos de contexto largo sin renunciar a la capacidad de modelar dependencias globales. El modelo se distribuye con código personalizado (`custom_code`), por lo que requiere `trust_remote_code=True` en Transformers.

El preentrenamiento se realizó sobre aproximadamente 20 billones de tokens procedentes de páginas web, libros, publicaciones académicas, código y materiales enciclopédicos, con estudios extensivos de mezcla de datos para equilibrar matemáticas, lógica y código. La capacidad de contexto largo se desarrolló en una etapa específica con cientos de miles de millones de tokens y longitudes de secuencia de hasta 1M de tokens. El post-entrenamiento incluye fine-tuning supervisado seguido de aprendizaje por refuerzo a gran escala en dominios como comprensión del lenguaje, razonamiento, programación, comportamiento agéntico con herramientas y seguimiento de instrucciones; las políticas especializadas resultantes se consolidaron en un único modelo desplegable mediante la técnica MOPD. El entrenamiento se llevó a cabo en clústeres Huawei Ascend.

## Capacidades

- Generación de texto conversacional multi-turno con contexto muy largo.
- Razonamiento, escritura y traducción en tareas cotidianas.
- Generación y comprensión de código, con integración declarada en harnesses agénticos como Codex, Claude Code, OpenClaw y Hermes.
- Uso de herramientas (tool calling / function calling) y flujos agénticos multi-paso.
- Razonamiento matemático y lógico reforzado mediante RL.
- Capacidades multilingües: metadatos indican inglés y chino; la model card declara más de 200 idiomas.
- Seguimiento de instrucciones y generación estructurada.
- No se mencionan capacidades de visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto muy largo (hasta 1M tokens) gracias a su atención híbrida, manteniendo el historial completo de la conversación sin truncamientos agresivos.
- Generación de código en producción: su soporte declarado de tool calling y su integración con harnesses agénticos permiten usarlo en pipelines de CI/CD para sugerencias de parcheo, generación de tests o revisión automatizada de código.
- Agentes autónomos de automatización: con capacidad de razonamiento multi-paso y uso de herramientas, puede orquestar tareas como consultas a APIs, extracción de datos y ejecución de comandos en flujos controlados.
- Asistente de documentación técnica: generación de resúmenes, traducción entre inglés y chino y reescritura de documentación extensa aprovechando la ventana de contexto larga para procesar manuales completos.
- Procesamiento de documentos largos: análisis de contratos, informes o artículos académicos de decenas de miles de tokens en una sola pasada, sin necesidad de chunking.
- Despliegue en dispositivo y edge computing: con 1,7B parámetros y 3,4 GB en safetensors, es viable en GPUs de consumo y en plataformas compatibles con llama.cpp, Ollama o LM Studio para asistentes locales.
- Prototipado rápido y fine-tuning: su licencia Apache 2.0 y compatibilidad con LLaMA-Factory permiten adaptarlo a dominios específicos con costes de cómputo moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye referencias a una figura comparativa (`images/model-benchmark-comparison.svg`) y menciona resultados líderes entre modelos de tamaño comparable en tareas de código, agentes, matemáticas e instrucciones, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K u otras) en el texto disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,4 GB solo para pesos, más overhead de KV-cache y activaciones; en la práctica, en torno a 4-6 GB según longitud de contexto.
- En cuantización de 8 bits: aproximadamente 1,7-2 GB de pesos; en 4 bits: aproximadamente 0,9-1,2 GB.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090; para contexto de 1M tokens se requiere hardware con mucha memoria (A100 80 GB, H100) o técnicas de gestión de KV-cache.
- Compatibilidad declarada con hardware NVIDIA, Huawei Ascend, Hygon y HOUMO.AI.
- Frameworks de despliegue soportados: vLLM, SGLang, llama.cpp, MLX, Ollama y LM Studio; fine-tuning con LLaMA-Factory.
- Latencia y throughput: no disponibles en la información proporcionada; la model card afirma mejor TTFT y TOPT frente a modelos de tamaño similar, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Spark-X2.5-1.7B | 1,7B | Hasta 1M tokens | Apache 2.0 | Hugging Face (Transformers, safetensors) |
| Spark-X2.5-4B | 4B (según model card) | Hasta 1M tokens | Apache 2.0 (según familia) | Hugging Face |
| Alternativas de ~1-2B | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos competidores en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos de lenguaje de 1,7B parámetros; la precisión factual puede degradarse en dominios especializados.
- Sesgos potenciales derivados del corpus de preentrenamiento (web, libros, código), no documentados en detalle por el autor.
- Cobertura idiomática: los metadatos solo garantizan inglés y chino; el soporte de más de 200 idiomas es una afirmación de la model card sin verificación independiente disponible.
- El contexto de 1M tokens es una capacidad declarada; el rendimiento efectivo en ventanas extremas puede degradarse y el coste de KV-cache crece con la longitud.
- Requiere `trust_remote_code=True` por el uso de código personalizado, lo que implica ejecutar código del autor del modelo; conviene auditar antes de usar en producción.
- Aunque la licencia Apache 2.0 permite uso comercial, no se documentan cláusulas adicionales ni restricciones de uso aceptable más allá de la licencia estándar.
- No se han publicado resultados de benchmarks verificables ni detalles sobre cuantizaciones oficiales, lo que dificulta la evaluación previa a producción.

## Enlaces

- Hugging Face: https://huggingface.co/XHToken/Spark-X2.5-1.7B
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-1.7B-Base
- Slack: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
