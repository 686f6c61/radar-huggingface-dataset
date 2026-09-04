# wireshark396/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal de 27.781 millones de parámetros (27B) desarrollado por Alibaba Qwen, presentado como la generación más capaz de la familia Qwen hasta la fecha. Se trata de un modelo denso (no Mixture of Experts) con arquitectura híbrida que combina capas de atención lineal Gated DeltaNet y capas de atención completa Gated Attention, junto con un codificador de visión que le permite procesar imágenes y vídeos de forma nativa. El modelo ofrece una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000 de tokens, y está diseñado para tareas de codificación, trabajo profesional, investigación y tareas agénticas de largo horizonte. La versión analizada en este repositorio (wireshark396/Qwen3.8-27B) es un espejo de la publicación oficial en Hugging Face, con pesos en formato safetensors y licencia Apache 2.0.

La relevancia del modelo radica en su combinación de capacidades avanzadas de razonamiento, control flexible del modo de pensamiento (thinking mode activado por defecto, con ajuste de esfuerzo de razonamiento y preservación de contexto de razonamiento histórico) y soporte nativo de visión-lenguaje, desde diagramas STEM y documentos hasta vídeos de larga duración. Además, incorpora predicción multi-token (MTP) y una arquitectura híbrida que reduce el coste computacional de la atención en secuencias largas, lo que lo convierte en una opción atractiva para despliegues locales y en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder (híbrida: Gated DeltaNet + Gated Attention) |
| Parámetros totales | 27.781.427.952 (27B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativa, extensible hasta 1.000.000 de tokens |
| Tipos de cuantización | No disponible oficialmente; cuantizaciones GGUF de la comunidad (p. ej., 4-bit) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida de 64 capas organizadas en 16 bloques. Cada bloque sigue el patrón: 3 × (Gated DeltaNet → FFN) seguido de 1 × (Gated Attention → FFN). Las capas Gated DeltaNet utilizan atención lineal con 48 cabezas para valores (V) y 16 para consultas/claves (QK), con dimensión de cabeza de 128. Las capas Gated Attention utilizan atención completa con 24 cabezas de consulta (Q) y 4 de clave/valor (KV), dimensión de cabeza de 256 y dimensión de RoPE de 64. La red feed-forward tiene una dimensión intermedia de 17.408. El modelo incluye predicción multi-token (MTP) y un embedding de tokens de 248.320 (con padding). El entrenamiento se realizó en dos etapas: pre-entrenamiento y post-entrenamiento, sin que se hayan publicado detalles específicos sobre el número de tokens o la composición del dataset. No se menciona explícitamente si se aplicaron técnicas como RLHF o DPO, aunque el post-entrenamiento incluye ajuste para tareas agénticas y control de razonamiento.

## Capacidades

- Generación de texto y razonamiento avanzado, con mejoras en codificación, trabajo profesional, investigación y tareas agénticas de largo horizonte.
- Comprensión multimodal nativa: procesa imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta horas de duración.
- Control flexible de pensamiento: el modo de razonamiento está activado por defecto y puede desactivarse por petición; la profundidad de razonamiento se ajusta mediante `reasoning_effort` y el contexto de razonamiento histórico se conserva con `preserve_thinking`.
- Ejecución agéntica: planificación autónoma y manejo de feedback del entorno para completar tareas de múltiples pasos de forma fiable.
- Compatibilidad con herramientas de despliegue populares: Transformers, vLLM, SGLang y TokenSpeed.
- Soporte de tool calling/function calling no documentado explícitamente en la model card, aunque las capacidades agénticas y la compatibilidad con entornos de terminal sugieren su disponibilidad.

## Casos de uso

- Asistente de programación agéntico: el modelo puede planificar y ejecutar tareas de codificación complejas en entornos de terminal, integrado en IDEs o pipelines de CI/CD, aprovechando su razonamiento multi-paso y la predicción multi-token para generar código más fiable.
- Análisis de documentos técnicos y científicos: gracias a su comprensión de imágenes y diagramas STEM, puede extraer información de figuras, tablas y texto en artículos de investigación, informes técnicos o manuales, facilitando la revisión documental automatizada.
- Análisis de vídeo de larga duración: con soporte nativo de vídeo y contexto extendido, puede resumir, buscar eventos o extraer información de grabaciones de horas de duración, útil en vigilancia, análisis de contenido o monitorización de reuniones.
- Agentes autónomos de investigación: el modelo puede encadenar razonamiento, búsqueda y síntesis de información para tareas de investigación de largo horizonte, reduciendo la necesidad de supervisión humana en la recopilación de datos.
- Atención al cliente multimodal: puede gestionar conversaciones que incluyan capturas de pantalla, imágenes de errores o vídeos de demostración, ofreciendo respuestas contextualizadas y asistencia técnica en múltiples turnos.
- Generación de código con verificación: combinado con herramientas de ejecución, el modelo puede generar código y verificar su funcionamiento en un bucle de feedback, mejorando la calidad del código en aplicaciones de producción.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativos que enfrenta a Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. La primera fila visible corresponde a "Agentic terminal coding" (Terminal Bench 2.1, Terminus). Sin embargo, los valores numéricos de los resultados no están disponibles en la información proporcionada, por lo que no es posible presentar una tabla de rendimiento con datos concretos. No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- El modelo tiene 27.781 millones de parámetros y un tamaño de repositorio de 55,6 GB en safetensors, por lo que la inferencia en precisión completa (FP16/BF16) requiere aproximadamente 55 GB de VRAM.
- Con cuantización 4-bit (GGUF de la comunidad), el modelo cabe en una GPU de 24 GB (como una RTX 4090) o en un Mac con 32 GB de memoria unificada, según la guía de atomic.chat.
- Para despliegue en precisión completa se recomiendan GPUs con al menos 80 GB de VRAM, como A100 o H100.
- Opciones de despliegue: Transformers, vLLM, SGLang, TokenSpeed, llama.cpp (mediante GGUF) y Atomic Chat.
- La latencia y el throughput no se han publicado en la información disponible.

## Comparativa con modelos similares

La model card compara Qwen3.8-27B con los siguientes modelos, pero no se dispone de datos numéricos de rendimiento en el extracto proporcionado:

| Modelo | Tipo | Parámetros | Contexto | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B | Denso multimodal | 27B | 262K nativo, 1M extensible | Apache 2.0 |
| Qwen3.6-27B | Denso multimodal | 27B | No disponible | No disponible |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | No disponible | 30B | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible |

Nota: los datos de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No se han documentado sesgos conocidos específicos en la información disponible; sin embargo, como todo modelo de lenguaje, puede heredar sesgos de sus datos de entrenamiento.
- Existe riesgo de alucinación, especialmente en tareas de razonamiento complejo o cuando se trabaja con contextos muy largos.
- La ventana de contexto nativa es de 262.144 tokens, pero la extensión a 1.000.000 de tokens puede degradar la calidad de la atención y el rendimiento en secuencias muy largas.
- Los idiomas soportados no están especificados, por lo que el rendimiento multilingüe es incierto y puede requerir evaluación adicional.
- El repositorio analizado (wireshark396/Qwen3.8-27B) es un espejo de la comunidad; se recomienda verificar la integridad de los pesos y, en producción, utilizar el repositorio oficial Qwen/Qwen3.8-27B.
- Las cuantizaciones GGUF mencionadas son de la comunidad y no oficiales; su calidad y compatibilidad pueden variar.
- La licencia Apache 2.0 permite uso comercial, pero debe revisarse el aviso de licencia completo para el uso de marcas registradas o nombres del proyecto.

## Enlaces

- Repositorio analizado: https://huggingface.co/wireshark396/Qwen3.8-27B
- Repositorio oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía de ejecución local: https://atomic.chat/blog/guides/how-to-run-qwen-3-8-locally
- Qwen Cloud (servicio gestionado): https://www.qwencloud.com/models/qwen3.8-27b
