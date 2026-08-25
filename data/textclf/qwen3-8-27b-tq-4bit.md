# textclf/Qwen3.8-27B-TQ-4bit

## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal nativo (visión-lenguaje) de 27 000 millones de parámetros, desarrollado por el equipo Qwen de Alibaba. Forma parte de la serie Qwen3.8, la generación más reciente de la familia abierta de Qwen, construida sobre la base arquitectónica de Qwen3.5. El modelo está diseñado para tareas de codificación, trabajo profesional, investigación y ejecución de agentes de larga duración, con soporte nativo para imágenes y vídeo.

La versión alojada en este repositorio (textclf/Qwen3.8-27B-TQ-4bit) es una cuantización a 4 bits mediante la técnica TQ, lo que reduce el tamaño del modelo a aproximadamente 22,6 GB y permite su despliegue en hardware de consumo. El modelo original presenta una arquitectura híbrida que combina atención lineal (Gated DeltaNet) con atención clásica (Gated Attention), una ventana de contexto nativa de 262 144 tokens extensible hasta 1 000 000, y entrenamiento con predicción multi-token (MTP). Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrido (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso, todos los parámetros activos) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 000 000 |
| Tipos de cuantizacion | 4-bit (TQ) en este repositorio; BF16/FP16 en el modelo original |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida que combina dos mecanismos de atención. El bloque principal se organiza en 64 capas con un patrón repetido: por cada 4 sub-bloques, 3 utilizan Gated DeltaNet (una variante de atención lineal con 48 cabezas para V y 16 para QK, dimensión de cabeza 128) y 1 utiliza Gated Attention (atención clásica con 24 cabezas para Q y 4 para KV, dimensión de cabeza 256 y RoPE de 64 dimensiones). Esta combinación busca equilibrar eficiencia computacional y capacidad de recuperación de información. La dimensión oculta es de 5120, con una capa FFN de dimensión intermedia 17 408 y un embedding de salida de 248 320 tokens (padded).

El entrenamiento incluye una fase de pre-entrenamiento y otra de post-entrenamiento, con predicción multi-token (MTP) entrenada en múltiples pasos. No se han publicado detalles específicos sobre el volumen de datos de entrenamiento ni la composición del dataset. El modelo incorpora un codificador de visión que le permite procesar imágenes y vídeo de forma nativa, y ofrece control flexible del modo de razonamiento: el modo thinking está activado por defecto, puede desactivarse por petición, y admite ajuste de la profundidad de razonamiento mediante el parámetro `reasoning_effort`, así como conservación del contexto de razonamiento histórico mediante `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento complejo, con modo thinking opcional y ajustable.
- Comprensión de imágenes y vídeo: diagramas STEM, documentos, vídeos de hasta una hora de duración.
- Ejecución de tareas de agente: planificación autónoma, manejo de feedback del entorno y finalización fiable de tareas multi-paso.
- Codificación: generación, depuración y refactorización de código, incluyendo uso de terminal.
- Trabajo profesional y ofimática: automatización de tareas de oficina, redacción de documentos, análisis de datos.
- Investigación: asistencia en tareas de razonamiento científico y técnico.
- Control flexible del razonamiento: activación/desactivación por petición, ajuste de `reasoning_effort` y `preserve_thinking`.
- Compatibilidad con herramientas de desarrollo: soporte para harnesses populares y frameworks de integración (vLLM, SGLang, TokenSpeed, Transformers).

## Casos de uso

- Automatización de tareas de oficina: el modelo puede procesar documentos, hojas de cálculo y presentaciones, extrayendo información y generando resúmenes o informes, gracias a su capacidad de visión y su ventana de contexto amplia.
- Asistente de codificación en producción: integrable en pipelines de CI/CD para revisión de código, generación de tests y corrección de errores, con soporte para tool calling y ejecución de comandos de terminal.
- Agente de investigación autónoma: puede planificar y ejecutar búsquedas de información, leer documentos y sintetizar resultados, manteniendo el contexto de razonamiento durante largas sesiones.
- Análisis de vídeo para vigilancia o revisión de contenido: procesa vídeos de hasta una hora para extraer eventos, transcribir diálogos o detectar anomalías, gracias a su comprensión multimodal.
- Chatbot de atención al cliente con contexto largo: gestiona conversaciones multi-turno con historial extenso (hasta 262K tokens) y puede consultar bases de conocimiento o APIs externas mediante tool calling.
- Asistente de investigación científica: ayuda a interpretar figuras, tablas y diagramas en artículos, y a redactar secciones de métodos o resultados, combinando razonamiento textual y visual.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparando Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, en categorías como coding, agentic terminal coding (Terminal Bench 2.1) y otras. Sin embargo, en la información proporcionada no se incluyen los valores numéricos de dichos benchmarks, por lo que no es posible presentar resultados concretos. No se han publicado resultados numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización 4-bit, el modelo ocupa aproximadamente 13,5 GB de pesos, más overhead de activaciones y KV cache. Se recomienda un mínimo de 16 GB de VRAM para uso básico y 24 GB para contextos largos o procesamiento de vídeo.
- GPU recomendadas: RTX 3090, RTX 4090, A100 40/80 GB, H100. En GPUs de consumo con 24 GB (RTX 3090/4090) puede ejecutarse con cuantización 4-bit y contextos moderados.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang, TokenSpeed, y probablemente con llama.cpp y Ollama (aunque no se confirma explícitamente).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Cuantización disponible |
|---|---|---|---|---|---|
| Qwen3.8-27B (este) | 27B | 262K (ext. 1M) | Sí (imagen/vídeo) | Apache 2.0 | 4-bit TQ, BF16 |
| Qwen3.6-27B | 27B | No disponible | No disponible | Apache 2.0 | No disponible |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | 30B | No disponible | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativos publicados en la información proporcionada. La comparativa se limita a características declaradas en la model card.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos o comportamientos no deseados específicos de este modelo. Como todo LLM, puede presentar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación: especialmente en tareas de razonamiento complejo o cuando se le pide información factual no cubierta en su entrenamiento. Se recomienda verificación externa en aplicaciones críticas.
- Limitaciones de idioma: no se especifican los idiomas soportados; aunque Qwen suele ser multilingüe, no hay confirmación oficial para esta versión.
- La cuantización 4-bit puede degradar ligeramente la calidad de salida en comparación con el modelo en BF16, especialmente en tareas de razonamiento matemático o generación de código.
- El modo thinking activado por defecto aumenta el consumo de tokens y la latencia; es necesario desactivarlo explícitamente para aplicaciones de baja latencia.
- La extensión de contexto hasta 1M tokens puede requerir hardware de gama alta y puede degradar el rendimiento si no se gestiona adecuadamente la memoria.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos completos de la licencia y las políticas de uso de Alibaba.

## Enlaces

- Repositorio de HuggingFace (versión cuantizada): https://huggingface.co/textclf/Qwen3.8-27B-TQ-4bit
- Modelo original en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página del modelo en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Documentación en Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Otra cuantización 4-bit (MLX): https://huggingface.co/DreamFoundries/Qwen3.8-27B-4bit
