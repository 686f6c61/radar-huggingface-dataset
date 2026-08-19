# XpressAI/Qwen3.8-27B-RYS-GGUF

## Resumen

Qwen3.8-27B-RYS-GGUF es una modificación experimental del modelo Qwen3.8-27B, desarrollada por XpressAI, que aplica la técnica RYS (layer surgery) de David Ng: duplicar un conjunto de capas de lenguaje durante el forward pass, sin entrenamiento ni cambios en los pesos. En concreto, se ejecutan las capas 16 a 19 (indexadas desde cero) una segunda vez, lo que produce una red con 68 capas de lenguaje en lugar de las 64 originales. El objetivo es mejorar el rendimiento en modo de razonamiento de bajo esfuerzo, manteniendo el resto de capacidades del modelo base.

El modelo se distribuye como un único archivo GGUF cuantizado (UD-Q4_K_XL) de 18,9 GB, derivado de la versión GGUF de unsloth. Según las evaluaciones del autor, la duplicación de capas mejora un probe de razonamiento en +11,76 puntos porcentuales y la precisión micro de BFCL v4 (function calling) en +0,60 puntos, aunque con una ligera regresión en EQ-140 y en matemáticas. Es una release experimental, no un reemplazo universalmente superior, y está pensada para usuarios que ya trabajan con Qwen3.8 en modo de razonamiento bajo y que valoran ganancias direccionales en tareas de tool use.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: bloques repetidos de tres capas DeltaNet y una capa de atención completa, con duplicación RYS de las capas 16-19 |
| Parametros totales | 28.842.772.640 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3.8-27B soporta 262k, pero no se confirma para esta variante) |
| Tipos de cuantizacion | UD-Q4_K_XL (único archivo) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo .gguf) |

## Arquitectura y entrenamiento

Qwen3.8-27B, el modelo base, emplea una arquitectura híbrida con bloques repetidos compuestos por tres capas DeltaNet y una capa de atención completa. La variante RYS no altera esta estructura interna; simplemente ejecuta las capas 16-19 dos veces durante el forward pass, insertando una copia de esas cuatro capas después de la capa 19 y antes de la capa 20. El bloque MTP (multi-token prediction) terminal se conserva y se desplaza tras las capas insertadas. No hay entrenamiento adicional ni modificación de pesos; el proceso es puramente de inferencia.

La técnica RYS se basa en el trabajo de David Ng sobre layer surgery, que explora cómo la duplicación de capas puede mejorar ciertas capacidades sin coste de entrenamiento. El autor realizó un barrido sobre todas las ventanas de cuatro capas compatibles (stride 4) y seleccionó el rango [16, 20) por ofrecer el mejor equilibrio entre ganancia en razonamiento y mínima regresión en EQ. El modelo base fue entrenado por Qwen Team con un gran corpus de datos, aunque los detalles específicos de entrenamiento (número de tokens, composición del dataset, RLHF) no se proporcionan en la documentación de esta variante.

## Capacidades

- Razonamiento de bajo esfuerzo (low-effort reasoning): el modelo está optimizado para funcionar con `reasoning_effort = low`, mostrando una mejora de +11,76 puntos porcentuales en un probe de razonamiento de 17 prompts frente al modelo base.
- Function calling / tool use: evaluado con BFCL v4 single-turn, alcanza una precisión micro del 83,20% (frente al 82,60% del base) y una macro media del 81,81% (+1,28 pp).
- Soporte de agentes y multi-step reasoning: aunque no se especifica explícitamente, su buen rendimiento en categorías como `parallel`, `parallel_multiple` y `live_relevance` sugiere capacidad para gestionar llamadas a herramientas paralelas y contextuales.
- Modo de razonamiento configurable: mediante el chat template embebido se puede activar o desactivar el pensamiento (`enable_thinking`) y ajustar el esfuerzo (`low`, `medium`, `high`).
- Solo texto y solo inglés: no se mencionan capacidades multimodales ni otros idiomas en esta variante.

## Casos de uso

- Asistentes de código con tool calling: el modelo puede integrarse en IDEs o CLIs para sugerir funciones, invocar APIs de compilación o ejecutar comandos, aprovechando su soporte nativo de function calling y su mejora en tareas paralelas.
- Automatización de flujos de trabajo con agentes: en pipelines donde un agente debe llamar a múltiples herramientas de forma secuencial o paralela (por ejemplo, consultar una base de datos, enviar un correo, actualizar un ticket), el modelo muestra ganancias direccionales en categorías como `live_irrelevance` (+4 pp) y `live_parallel_multiple` (+8,33 pp).
- Razonamiento de bajo esfuerzo en tiempo real: para aplicaciones que requieren respuestas rápidas con un nivel moderado de razonamiento (chatbots técnicos, resolución de incidencias), el modo `reasoning_effort = low` ofrece una alternativa a modelos más grandes con menor latencia.
- Evaluación experimental de layer surgery: investigadores interesados en técnicas de modificación de arquitectura sin entrenamiento pueden usar este modelo como referencia para estudiar el impacto de duplicar capas en modelos híbridos DeltaNet/atención.
- Despliegue en entornos con recursos limitados: al ser un GGUF cuantizado de 18,9 GB, puede ejecutarse en GPUs de consumo (24 GB VRAM) o incluso en CPU con suficiente RAM, lo que lo hace adecuado para prototipos y entornos de prueba.
- Comparación de rendimiento en function calling: dado que el autor publica una evaluación detallada de BFCL v4 con 1.006 casos, el modelo sirve como punto de referencia para validar configuraciones de inferencia (temperatura, top_p, etc.) en tareas de tool use.

## Benchmarks y rendimiento

El autor publicó resultados de evaluación comparando el modelo RYS con el modelo base Qwen3.8-27B, utilizando la misma configuración de inferencia (llama.cpp, `reasoning_effort = low`, `enable_thinking = true`, temperatura 1.0, top_p 0.95, top_k 20, min_p 0.0, seed 3407, max_tokens 2048). Los resultados son los siguientes:

| Evaluación | Base | RYS 16-19 | Cambio |
|---|---:|---:|---:|
| Reasoning probe (17 prompts) | 58,82% | **70,59%** | **+11,76 pp** |
| EQ-140 (139 puntuados) | **82,65** | 81,66 | -0,99 |
| BFCL micro accuracy (1.006 casos) | 82,60% | **83,20%** | **+0,60 pp** |
| BFCL category macro mean | 80,54% | **81,81%** | **+1,28 pp** |
| Math probe (diagnóstico) | **1,000** | 0,750 | -0,250 |

Desglose detallado de BFCL v4 single-turn (13 categorías, 1.006 casos):

| Categoría | N | Base | RYS 16-19 | Cambio |
|---|---|---:|---:|---:|---:|
| irrelevance | 100 | 86,00% | **88,00%** | +2,00 |
| multiple | 100 | **94,00%** | 91,00% | -3,00 |
| parallel | 100 | 90,00% | **92,00%** | +2,00 |
| parallel_multiple | 100 | 82,00% | **84,00%** | +2,00 |
| simple_java | 100 | **54,00%** | 53,00% | -1,00 |
| simple_javascript | 50 | **64,00%** | 62,00% | -2,00 |
| simple_python | 100 | 94,00% | 94,00% | 0,00 |
| live_irrelevance | 100 | 95,00% | **99,00%** | +4,00 |
| live_multiple | 100 | **79,00%** | 77,00% | -2,00 |
| live_parallel | 16 | 87,50% | 87,50% | 0,00 |
| live_parallel_multiple | 24 | 62,50% | **70,83%** | +8,33 |
| live_relevance | 16 | 75,00% | **81,25%** | +6,25 |
| live_simple | 100 | 84,00% | 84,00% | 0,00 |
| **Micro accuracy** | **1.006** | **82,60%** | **83,20%** | **+0,60** |
| **Macro mean** | **13 categorías** | **80,54%** | **81,81%** | **+1,28** |

El autor advierte que la ganancia agregada en BFCL es pequeña y no estadísticamente decisiva (prueba exacta de McNemar p = 0,539), por lo que debe interpretarse con cautela.

## Requisitos de hardware

- El archivo GGUF pesa 18,9 GB (cuantización UD-Q4_K_XL). Para inferencia con contexto moderado se estima una VRAM de aproximadamente 20 GB (incluyendo cache KV y overhead).
- GPU recomendadas: RTX 4090 (24 GB), A100 40 GB, RTX 6000 Ada, o cualquier GPU con al menos 24 GB de VRAM. También puede ejecutarse en GPUs de 16 GB con contexto reducido o usando offloading parcial a CPU.
- Es posible ejecutarlo en CPU con al menos 32 GB de RAM, aunque con mayor latencia.
- Despliegue recomendado con llama.cpp (llama-server), tal como indica el autor. También es compatible con Ollama, LM Studio y otros frontends que soporten GGUF.
- No se proporcionan datos de latencia o throughput; el autor indica que el tiempo de generación fue prácticamente idéntico al del modelo base en su prueba (59:16 vs 59:41 normalizado), con un 2% más de tokens de salida.

## Comparativa con modelos similares

La única comparativa disponible es contra el modelo base Qwen3.8-27B (sin RYS), cuyos resultados se muestran en la sección de benchmarks. No se han publicado comparaciones con otros modelos de la misma categoría (por ejemplo, Llama 3.1 8B, Qwen2.5 32B, etc.) en la documentación proporcionada. Se puede considerar que esta variante es una alternativa experimental al modelo base, con la ventaja de un mejor rendimiento en razonamiento de bajo esfuerzo y function calling, pero con regresiones en EQ y matemáticas. Para uso general sin requisitos específicos de razonamiento, el modelo base podría ser más fiable.

## Limitaciones y advertencias

- Modelo experimental: la técnica RYS es una modificación no entrenada; no hay garantía de mejora universal. El autor recomienda evaluar el modelo en el propio flujo de trabajo antes de usarlo en producción.
- Regresión en matemáticas: el probe matemático cayó de 1,000 a 0,750, aunque se registró como diagnóstico y no como criterio de liberación.
- Ganancia BFCL no estadísticamente significativa: la mejora agregada de +0,60 pp tiene un p-valor de 0,539, por lo que podría deberse al azar.
- Solo inglés y solo texto: no soporta otros idiomas ni entradas multimodales, a pesar de que el modelo base Qwen3.8-27B incluye un codificador de visión.
- Requiere una versión reciente de llama.cpp con soporte para el chat template embebido y el modo de razonamiento (`--reasoning`).
- La licencia Apache-2.0 permite uso comercial, pero al ser una modificación de un modelo con la misma licencia, se deben mantener los avisos de atribución correspondientes.
- No se ha verificado el rendimiento en tareas de contexto largo (la longitud de contexto no se especifica para esta variante), por lo que se recomienda precaución en aplicaciones que requieran ventanas extensas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XpressAI/Qwen3.8-27B-RYS-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fuente GGUF (unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Artículo de David Ng sobre RYS: https://dnhkng.github.io/posts/rys/
- Guía de ejecución local (yottalabs): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Especificaciones y requisitos de hardware (yottalabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Soporte en AMD (blog oficial): https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
