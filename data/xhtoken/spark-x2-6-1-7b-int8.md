# XHToken/Spark-X2.6-1.7B-INT8

## Resumen

Spark-X2.6-1.7B-INT8 es la versión cuantizada a 8 bits del modelo Spark-X2.6-1.7B, desarrollado por XHToken como segundo modelo de la serie Spark-X2.6 (tras Spark-X2.6-4B). Se trata de un modelo lingüístico compacto y de propósito general orientado al despliegue en dispositivo (on-device), que conserva exactamente la arquitectura de su predecesor Spark-X2.5-1.7B y obtiene sus mejoras mediante un post-entrenamiento refinado, con avances destacables en código, agentes, contexto largo, multilingüismo y razonamiento.

La relevancia de este modelo radica en su combinación de tamaño reducido (1,71 mil millones de parámetros) y capacidades avanzadas: ofrece tres niveles configurables de "thinking budget" (none, low, high) para equilibrar calidad de razonamiento, latencia y coste de inferencia, además de un throughput de decodificación líder entre modelos de tamaño comparable según las evaluaciones del autor. La variante INT8, distribuida en formato safetensors con compresión compressed-tensors, reduce aún más los requisitos de memoria, facilitando su ejecución en hardware local y de borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura idéntica a Spark-X2.5-1.7B; detalles finos no disponibles) |
| Parametros totales | 1.707.657.216 (~1,71 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 1.048.576 tokens (configuración de servidor SGLang); no disponible como dato oficial del modelo |
| Tipos de cuantizacion | INT8 (compressed-tensors) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom_code / trust_remote_code) |

## Arquitectura y entrenamiento

Spark-X2.6-1.7B mantiene exactamente la misma arquitectura que Spark-X2.5-1.7B, un modelo de tipo transformer decoder para generación de texto. Las ganancias de capacidad respecto a la generación anterior provienen de un post-entrenamiento mejorado, no de cambios arquitectónicos. El autor no detalla en la model card el número de capas, cabezas de atención ni dimensiones ocultas, por lo que esos datos no están disponibles.

Sobre el proceso de entrenamiento, la información publicada no especifica el número de tokens utilizados, la composición del dataset ni el uso de técnicas concretas como RLHF o DPO. Sí se destaca como innovación funcional el "controllable thinking budget", que permite seleccionar entre tres niveles de razonamiento (none, low, high) en tiempo de inferencia mediante el parámetro `enable_thinking` del chat template, ajustando así el equilibrio entre calidad de respuesta, latencia y coste. El autor también publica una implementación optimizada de llama.cpp para maximizar el throughput de decodificación.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, formato de chat con template propio).
- Razonamiento configurable mediante tres niveles de thinking budget: none, low y high.
- Capacidades de código mejoradas respecto a Spark-X2.5-1.7B, incluyendo tareas de ingeniería de software.
- Capacidades agénticas: uso complejo de herramientas (tool calling, con parser `spark25` en SGLang), planificación multi-paso y razonamiento sobre contextos extendidos.
- Contexto largo: el servidor de referencia se configura con hasta 1.048.576 tokens de contexto máximo.
- Soporte multilingüe, con foco en inglés y chino.
- Generación hasta 131.072 tokens nuevos en el ejemplo oficial de Transformers.

## Casos de uso

- Asistentes de IA en dispositivo: su tamaño de 1,7 B parámetros y la cuantización INT8 permiten ejecutar el modelo localmente en portátiles y equipos de borde, ofreciendo respuestas privadas sin depender de la nube.
- Agentes con llamadas a herramientas: el soporte de tool calling (parser spark25 en SGLang) y la planificación multi-paso lo hacen adecuado para agentes que consultan APIs, ejecutan funciones o navegan flujos de trabajo.
- Generación y asistencia de código: las mejoras en código e ingeniería de software lo orientan a autocompletado, refactors y generación de scripts integrados en entornos de desarrollo locales.
- Procesamiento de documentos largos: la ventana de contexto configurable hasta ~1 M de tokens permite resumir o analizar documentos extensos, aunque con requisitos de memoria proporcionales.
- Atención al cliente bilingüe: su soporte de inglés y chino con capacidades conversacionales multi-turno encaja en chatbots de soporte que requieren despliegue local por privacidad.
- Razonamiento ajustable por latencia: el thinking budget permite que una misma aplicación use modo "none" para respuestas rápidas y modo "high" para tareas complejas, optimizando coste según el caso.
- Servicios de inferencia autoalojados: mediante SGLang se puede exponer una API compatible con OpenAI para integrar el modelo en pipelines de producto.

## Benchmarks y rendimiento

El autor afirma que Spark-X2.6-1.7B supera a modelos de tamaño comparable en la mayoría de los benchmarks evaluados (agentes, código, matemáticas, general y conocimiento), pero los resultados numéricos se presentan únicamente como imágenes SVG en la model card, sin valores en texto. En cuanto a inferencia, se indica que el modelo logra un throughput de decodificación líder entre modelos on-device evaluados (Qwen3.5-2B, MiniCPM-2B y LFM2.5-2.6B), con ventaja ampliada usando la implementación optimizada de llama.cpp del autor en una RTX 4090.

No se han publicado resultados de benchmarks en la informacion disponible (en formato numérico comparable).

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,0 GB en INT8, por lo que el modelo en sí cabe cómodamente en GPUs con 4-6 GB de VRAM; con contextos muy largos (hasta ~1 M tokens) el consumo de KV cache crece sustancialmente y puede requerir más memoria.
- GPUs recomendadas: la model card referencia la RTX 4090 para las pruebas de throughput con llama.cpp; para servidores SGLang se documentan GPUs NVIDIA y NPUs Ascend (series A2/A3).
- Consumer GPUs: dado su tamaño (~2 GB en INT8), cabe en GPUs consumer de gama media-alta (RTX 3060, RTX 4060 y superiores); también es candidato para ejecución en CPU en equipos de escritorio, aunque sin datos oficiales de rendimiento en CPU.
- Opciones de despliegue: Transformers (versión 4.57.1, con `trust_remote_code=True`), SGLang (imágenes Docker oficiales para NVIDIA y Ascend, con servidor OpenAI-compatible) y una implementación optimizada de llama.cpp publicada por el autor. No se menciona soporte oficial de vLLM, TGI ni Ollama.
- Latencia y throughput: se afirma un throughput de decodificación líder entre modelos on-device de tamaño similar, pero no se publican cifras numéricas concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Spark-X2.6-1.7B-INT8 | 1,71 B | Hasta ~1 M (según config. de servidor) | Apache 2.0 | Thinking budget configurable; tool calling; pesos INT8 |
| Qwen3.5-2B | No disponible | No disponible | No disponible | Usado por el autor como referencia de throughput on-device |
| MiniCPM-2B | ~2,4 B | No disponible | No disponible | Modelo on-device comparado en las evaluaciones del autor |
| LFM2.5-2.6B | ~2,6 B | No disponible | No disponible | Modelo on-device comparado en las evaluaciones del autor |

Los datos de las alternativas no están disponibles en la informacion proporcionada; solo se sabe que el autor las usa como referencia de eficiencia y que Spark-X2.6-1.7B supera a modelos de tamaño comparable en la mayoría de benchmarks según sus evaluaciones.

## Limitaciones y advertencias

- El modelo requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código personalizado del repositorio: revisarlo antes de usar en producción.
- Los idiomas soportados oficialmente son inglés y chino; el rendimiento en castellano u otras lenguas no está documentado y puede ser inferior.
- Los benchmarks se publican solo como imágenes sin cifras textuales, lo que dificulta la verificación independiente de las afirmaciones de estado del arte.
- Es un modelo de 1,7 B parámetros: su capacidad de razonamiento y conocimiento factual es limitada frente a modelos grandes, con riesgo de alucinaciones proporcionalmente alto en tareas de conocimiento.
- El contexto de ~1 M de tokens corresponde a la configuración máxima del servidor SGLang y requiere memoria suficiente; debe reducirse `--context-length` en hardware limitado.
- La licencia Apache 2.0 permite uso comercial sin restricciones destacables más allá de las condiciones estándar de la licencia.
- Al ser una cuantización INT8 de un modelo base, puede existir una pequeña degradación de calidad respecto al modelo de precisión completa, no cuantificada por el autor.
- Se trata de un repositorio con muy pocas descargas (55) y del autor XHToken, sin historial amplio de adopción comunitaria documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XHToken/Spark-X2.6-1.7B-INT8
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Implementación optimizada de llama.cpp del autor: https://github.com/XHToken/llama.cpp
- Comunidad Slack: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X (Twitter): https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
