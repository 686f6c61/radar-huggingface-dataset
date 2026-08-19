# unsloth/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal de 27 000 millones de parámetros, de arquitectura densa, desarrollado por el equipo de Qwen (Alibaba) y publicado en HuggingFace por Unsloth. Forma parte de la generación Qwen3.8, la más reciente de la familia abierta de Qwen, y se presenta como un modelo nativo de visión-lenguaje capaz de procesar imágenes y vídeos, además de texto. Su diseño híbrido combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention), lo que le permite manejar contextos largos de forma eficiente: 262 144 tokens nativos, extensibles hasta 1 000 000 mediante técnicas de escalado de RoPE.

El modelo está orientado a tareas complejas y de largo horizonte, como razonamiento multi-paso, ejecución de agentes autónomos y tool calling. Incluye un modo de pensamiento (thinking mode) activado por defecto, con control fino del esfuerzo de razonamiento (`reasoning_effort`) y conservación del contexto de razonamiento histórico (`preserve_thinking`). Su licencia Apache 2.0 permite uso comercial sin restricciones, y su tamaño compacto (27B) lo hace adecuado para despliegue en entornos con recursos moderados, especialmente con cuantizaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 781 427 952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible (Unsloth ofrece cuantizaciones GGUF dinámicas, pero no se especifican en la información) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida que alterna bloques de atención lineal y atención clásica. El layout interno es `16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, con 64 capas en total. La capa Gated DeltaNet utiliza 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La capa Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. El feed-forward tiene dimensión intermedia de 17 408. Además, incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación.

El modelo fue entrenado en dos fases: pre-training y post-training. No se han publicado detalles sobre el número de tokens, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información disponible. El componente de visión está integrado de forma nativa, permitiendo la comprensión de imágenes y vídeos de hasta una hora de duración, según la documentación oficial.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento (thinking mode) activable o desactivable por petición.
- Comprensión de imágenes y vídeos: interpreta diagramas STEM, documentos y vídeos de larga duración.
- Soporte de tool calling y function calling, con mejoras en el parseo de objetos anidados para mayor fiabilidad.
- Capacidades de agente: planificación autónoma, manejo de feedback del entorno y ejecución de tareas multi-paso de largo horizonte.
- Control fino del razonamiento mediante `reasoning_effort` y `preserve_thinking`.
- Multilingüismo: no se especifican idiomas concretos, pero al ser un modelo de la familia Qwen, se espera soporte multilingüe amplio (no confirmado en la información).
- Compatibilidad con herramientas de desarrollo y harnesses populares, facilitando la integración en stacks existentes.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens), manteniendo el hilo de la conversación y resolviendo consultas complejas con razonamiento interno.
- Generación de código en producción: con soporte de tool calling y MTP, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, reduciendo la latencia de decodificación.
- Análisis de documentos técnicos y científicos: su capacidad de visión permite extraer información de diagramas, gráficos y tablas en PDFs o imágenes, útil en entornos de investigación y consultoría.
- Agentes autónomos de navegación web: gracias a su planificación multi-paso y manejo de feedback, puede ejecutar tareas como rellenar formularios, extraer datos o interactuar con APIs.
- Procesamiento de vídeo de larga duración: con contexto extensible a 1M tokens, puede resumir o analizar vídeos de hasta una hora, aplicable en vigilancia, educación o medios.
- Asistente de investigación: combina razonamiento profundo con comprensión de imágenes para sintetizar literatura, comparar resultados y generar informes detallados.
- Chatbot empresarial con memoria persistente: el modo `preserve_thinking` permite conservar el razonamiento histórico, mejorando la coherencia en conversaciones largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Se recomienda consultar la documentación oficial de Qwen para datos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo orientativo basado en 27,78B parámetros):
  - FP16/BF16: ~55,6 GB (2 bytes por parámetro).
  - Cuantización 8-bit: ~27,8 GB.
  - Cuantización 4-bit: ~13,9 GB.
- GPU recomendadas: para FP16 se necesitan GPUs con 64 GB o más (A100 80GB, H100 80GB). Con cuantización 4-bit cabe en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque con limitaciones de contexto.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, y el propio ecosistema Unsloth (Unsloth Desktop, Dynamic GGUF).
- Latencia y throughput: no disponibles. La arquitectura híbrida con Gated DeltaNet y MTP debería ofrecer mejoras de velocidad frente a modelos puramente atencionales, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. No se han publicado benchmarks ni especificaciones de modelos alternativos de la misma categoría (p. ej., Qwen3.5-27B, Qwen3.6-27B o modelos de 27B de otras familias) que permitan una comparación objetiva. Se recomienda consultar la documentación oficial de Qwen para obtener métricas de evaluación.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos o alucinaciones específicos del modelo. Como todo LLM, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- El contexto nativo de 262K tokens es amplio, pero para longitudes superiores se requiere escalado de RoPE (p. ej., YaRN), lo que puede degradar ligeramente el rendimiento.
- Los idiomas soportados no están especificados; aunque la familia Qwen suele ser multilingüe, no hay confirmación oficial en esta ficha.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos de la documentación de Qwen para posibles cláusulas adicionales.
- El modelo es denso (27B), por lo que la inferencia en FP16 requiere hardware de gama alta; las cuantizaciones reducen la huella pero pueden afectar a la calidad.
- No hay información sobre el dataset de entrenamiento ni sobre técnicas de alineación (RLHF/DPO), lo que dificulta evaluar su comportamiento en entornos de producción sensibles.

## Enlaces

- HuggingFace: https://huggingface.co/unsloth/Qwen3.8-27B
- Guía de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Documentación de Unsloth sobre GGUF dinámicos: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Comunidad Discord de Unsloth: https://discord.gg/unsloth
