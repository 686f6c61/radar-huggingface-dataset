# xtools-at/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic

## Resumen
Wukong 9B es un modelo multimodal de tipo image-text-to-text obtenido mediante la fusión en el espacio de pesos de dos fine-tunes de Qwen3.5-9B. Lo desarrolla xtools-at y combina, por un lado, el modelo Qwopus3.5-9B-Coder, orientado a programación y flujos agénticos, y por otro el DeepSeek-V4-Pro-Qwen3.5-9B, destilado para razonamiento matemático y científico. La fusión se realiza con SLERP (Spherical Linear Interpolation) con un parámetro t = 0.4, dando mayor peso al modelo de código.

El objetivo declarado es reunir en un modelo compacto de 9,65 mil millones de parámetros tanto el razonamiento estructurado y el conocimiento STEM como la generación de código, depuración, tool calling y function calling. Ambos modelos padre son variantes Heretic decensuradas, y el autor confirma que el comportamiento abliterated se conserva en el merge.

Es relevante ahora porque ofrece una alternativa ligera, con licencia Apache 2.0, para despliegues locales que necesitan razonamiento y capacidades agénticas sin recurrir a modelos de mayor tamaño. El repositorio ocupa 19,3 GB y se distribuye en formato safetensors para transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (image-text-to-text); merge por SLERP de dos fine-tunes |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la información proporcionada (pesos publicados en safetensors sin cuantización declarada) |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento
El modelo parte de la arquitectura Qwen3.5-9B, un transformer multimodal capaz de procesar entradas de imagen y texto. No se trata de un entrenamiento nuevo, sino de una fusión en el espacio de pesos mediante SLERP con t = 0.4 entre Qwopus3.5-9B-Coder-UNCENSORED-heretic (peso mayor) y DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic.

Los datos de entrenamiento provienen de los modelos padre. El modelo de código se apoya en trazas de razonamiento de Claude reconstruidas mediante Trace Inversion (Claude Opus 4.6 TraceInversion, 9000x, y Claude Opus 4.7 TraceInversion, 5000x) y en trayectorias agénticas de tareas reales de programación y uso de herramientas (lambda/hermes-agent-reasoning-traces, originadas de Kimi-K2.5 y GLM-5.1-FP8). El modelo de razonamiento se destila de DeepSeek-V4-Pro en modo Max Effect con aproximadamente 250K muestras de matemáticas y STEM. No se documenta el número total de tokens de entrenamiento ni si hubo RLHF o DPO en esta ficha.

## Capacidades
- Generación de texto conversacional multilingüe en inglés, chino, español, ruso y japonés.
- Razonamiento multi-paso, descomposición de problemas y derivaciones estructuradas.
- Matemáticas y conocimiento STEM.
- Generación de código, depuración, localización de errores, parches y refactorización.
- Tool calling y function calling.
- Flujos agénticos: enrutamiento de herramientas, operaciones de terminal, trabajo sobre repositorios y automatización de navegador.
- Procesamiento de imagen junto a texto (pipeline image-text-to-text).
- Comportamiento decensurado (abliterated), con menos rechazos innecesarios.

## Casos de uso
- Asistente de programación en local: el modelo puede generar parches, localizar bugs y refactorizar código dentro de un IDE o pipeline de CI/CD, aprovechando su base en Qwopus3.5-Coder y su soporte de tool calling.
- Automatización de agentes de terminal: gracias a las trayectorias agénticas de su entrenamiento, puede encadenar comandos, inspeccionar repositorios y ejecutar tareas de mantenimiento de forma multi-paso.
- Resolución de problemas matemáticos y científicos: adecuado para tutores o herramientas de apoyo que requieren derivaciones estructuradas, por su destilación de 250K muestras STEM de DeepSeek-V4-Pro.
- Atención al cliente multilingüe: soporta cinco idiomas y conversaciones multi-turno, lo que permite desplegarlo en entornos de soporte con usuarios de habla inglesa, china, española, rusa o japonesa.
- Análisis de imágenes con texto: al ser un modelo image-text-to-text, puede describir capturas, extraer información de diagramas o responder preguntas sobre imágenes en flujos documentales.
- Enrutamiento de herramientas en pipelines internos: su capacidad de function calling permite integrarlo como capa de decisión que selecciona APIs o servicios según la petición del usuario.
- Experimentación e investigación local: al ser un modelo compacto de 9,65B con licencia Apache 2.0, es útil para prototipos y pruebas de concepto en hardware de gama consumer.

## Benchmarks y rendimiento
La model card indica que, por limitaciones de recursos, la evaluación preliminar se limitó a la variante de 4B, comparándola con los modelos padre sobre un conjunto pequeño de benchmarks. Los resultados sugieren que el merge conservó en gran medida el rendimiento general, con variaciones menores por tarea (similar en ARC-Easy y ligeramente mejor en algunas). No se publican cifras concretas para el modelo de 9B en la información disponible.

No se han publicado resultados de benchmarks en la información disponible para este checkpoint de 9B.

## Requisitos de hardware
- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 19-20 GB solo para pesos, más overhead de activaciones y contexto.
- Cuantización: no se documentan tipos de cuantización en la información proporcionada; para desplegar en GPUs consumer sería necesario generar GGUF/AWQ por cuenta propia.
- GPU recomendadas: A100 40GB, H100, L40S o RTX 4090 (24 GB) para fp16 ajustado; GPUs de 16 GB requerirían cuantización a 8 bits o inferior.
- Cabe en consumer GPU: sí, en RTX 4090 (24 GB) en fp16 con contexto moderado; en GPUs de 16 GB solo con cuantización.
- Opciones de despliegue: transformers (librería declarada), y potencialmente vLLM, TGI, llama.cpp u Ollama si se generan pesos compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Wukong 9B (este modelo) | 9,65B | no disponible | apache-2.0 | Merge multimodal con razonamiento, código y agentes |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | no disponible | Modelo base multimodal |
| xtools-at/Qwopus3.5-9B-Coder-UNCENSORED-heretic | ~9B | no disponible | apache-2.0 (según repo) | Código y agentes, decensurado |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~9B | no disponible | apache-2.0 (según repo) | Razonamiento matemático/STEM, decensurado |

Los datos de contexto y rendimiento de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias
- Al ser un merge por interpolación de pesos, no se ha validado con un entrenamiento adicional; el rendimiento puede degradarse en tareas no cubiertas por los padres.
- Es un modelo decensurado (abliterated): puede generar contenido que modelos alineados rechazarían, lo que exige filtros y moderación en producción.
- Riesgo de alucinación inherente a modelos de 9B, especialmente en razonamiento largo y datos factuales.
- La longitud de contexto no está documentada, lo que dificulta planificar despliegues con ventanas largas.
- Solo se listan cinco idiomas; el rendimiento fuera de ellos no está garantizado.
- La evaluación publicada se limita a la variante de 4B; no hay benchmarks del checkpoint de 9B.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las licencias y procedencias de los datasets de destilación (trazas de Claude y DeepSeek) por posibles restricciones de los proveedores originales.
- El modelo tiene 0 descargas y 1 like en el momento de la ficha, por lo que la validación comunitaria es mínima.

## Enlaces
- Hugging Face: https://huggingface.co/xtools-at/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic
- Variante 4B: https://huggingface.co/xtools-at/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic
- Modelo padre de código: https://huggingface.co/xtools-at/Qwopus3.5-9B-Coder-UNCENSORED-heretic
- Fine-tune original de código: https://huggingface.co/Jackrong/Qwopus3.5-9B-Coder
- Modelo padre de razonamiento: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Fine-tune original de razonamiento: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Dataset Claude Opus 4.6 TraceInversion: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset Claude Opus 4.7 TraceInversion: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset de trayectorias agénticas: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Paper de referencia: https://arxiv.org/abs/2603.07267
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
