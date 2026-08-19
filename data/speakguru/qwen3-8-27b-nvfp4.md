# speakguru/Qwen3.8-27B-NVFP4

## Resumen

El modelo `speakguru/Qwen3.8-27B-NVFP4` es una cuantización en formato NVFP4 (FP4 de NVIDIA) del modelo Qwen3.8-27B, desarrollado por el equipo de Qwen (Alibaba) y cuantizado por Unsloth utilizando su técnica Dynamic V3.0 en vista previa. Qwen3.8-27B es un modelo de lenguaje causal con encoder de visión, diseñado para tareas de razonamiento complejo, codificación, trabajo profesional y ejecución de agentes de larga duración. Su arquitectura híbrida combina capas de atención lineal (Gated DeltaNet) con capas de atención estándar (Gated Attention), lo que permite un equilibrio entre eficiencia computacional y capacidad de modelado.

Este modelo destaca por su ventana de contexto nativa de 262 144 tokens, extensible hasta 1 000 000 mediante técnicas de escalado RoPE, y por su soporte nativo de comprensión de imágenes y vídeos. La cuantización NVFP4 reduce significativamente el tamaño y los requisitos de memoria del modelo original (27B parámetros) a aproximadamente 19,87B parámetros en los pesos cuantizados, manteniendo un rendimiento cercano al original. Es relevante para desarrolladores que necesitan desplegar un modelo multimodal de alto rendimiento en hardware con VRAM limitada, sin renunciar a capacidades avanzadas como el modo de razonamiento (thinking mode) y el tool calling.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 19 869 895 952 (cuantización NVFP4); el modelo original tiene 27B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 000 000 con escalado RoPE (p. ej. YaRN) |
| Tipos de cuantizacion | NVFP4 (FP4 de NVIDIA) mediante Unsloth Dynamic V3.0 (preview) |
| Idiomas soportados | No especificado en la documentación proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantizados NVFP4) |

## Arquitectura y entrenamiento

Qwen3.8-27B presenta una arquitectura híbrida que combina atención lineal y atención estándar. El modelo se compone de 64 capas, organizadas en un patrón repetitivo de 16 bloques, donde cada bloque contiene 3 sub-bloques de `Gated DeltaNet → FFN` seguidos de 1 sub-bloque de `Gated Attention → FFN`. La Gated DeltaNet es un mecanismo de atención lineal con 48 cabezas para V y 16 para QK, con dimensión de cabeza 128, que reduce el coste computacional en contextos largos. La Gated Attention es una atención estándar con 24 cabezas para Q y 4 para KV (GQA), con dimensión de cabeza 256 y RoPE de 64 dimensiones. El FFN tiene una dimensión intermedia de 17 408.

El modelo fue entrenado en dos etapas: pre-entrenamiento y post-entrenamiento, e incluye Multi-Token Prediction (MTP) con múltiples pasos para acelerar la inferencia. No se proporcionan datos específicos sobre el número de tokens de entrenamiento ni la composición del dataset. La cuantización NVFP4 aplicada por Unsloth utiliza su Dynamic V3.0, que optimiza la asignación de bits por capa para minimizar la pérdida de precisión. El modelo base es `Qwen/Qwen3.8-27B` y la cuantización está diseñada para ser compatible con frameworks como Unsloth Desktop y otras herramientas de inferencia.

## Capacidades

- Generación de texto, razonamiento complejo, codificación, matemáticas y tareas profesionales.
- Comprensión nativa de imágenes y vídeos (modelo de visión-lenguaje), incluyendo diagramas STEM, documentos y vídeos de larga duración (hasta horas).
- Modo de razonamiento (thinking mode) activado por defecto, con control flexible mediante `reasoning_effort` y `preserve_thinking` para retener el contexto de razonamiento en mensajes históricos.
- Tool calling mejorado, con mejoras en el parseo de objetos anidados para aumentar la fiabilidad en integraciones con agentes.
- Soporte para agentes autónomos y razonamiento multi-paso, con planificación y manejo de feedback del entorno.
- Capacidades multilingües no especificadas, aunque la familia Qwen suele ser multilingüe; se recomienda verificar en la documentación oficial.
- MTP (Multi-Token Prediction) para inferencia más rápida.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens nativos) y mantener el hilo de la conversación durante horas, gracias a su ventana de contexto amplia y su modo de razonamiento para respuestas coherentes.
- Análisis de documentos extensos: permite procesar contratos, informes técnicos o libros completos de más de 200 000 tokens, extrayendo información relevante y generando resúmenes con alta precisión.
- Agentes autónomos de software: su soporte de tool calling y razonamiento multi-paso lo hace adecuado para integrarse en pipelines de automatización, como asistentes de código que interactúan con APIs, ejecutan comandos y gestionan errores.
- Comprensión de vídeo: el modelo puede analizar vídeos de larga duración (hasta horas) para tareas como resumen de contenido, detección de eventos o transcripción multimodal, útil en seguridad, educación o análisis de medios.
- Generación de código en producción: con capacidades de razonamiento y tool calling, puede integrarse en entornos de desarrollo para generar, revisar y depurar código, así como para automatizar tareas de CI/CD.
- Asistente de investigación científica: su capacidad de razonamiento profundo y contexto largo permite procesar artículos académicos, comparar metodologías y generar hipótesis, con soporte para figuras y tablas en imágenes.
- Soporte técnico especializado: en dominios como ingeniería o medicina, el modelo puede responder consultas complejas con razonamiento detallado y citar fuentes de documentos de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparativas con otros modelos. Se recomienda consultar la documentación oficial de Qwen3.8 para obtener datos de rendimiento del modelo original, y evaluar la cuantización NVFP4 en el caso de uso específico.

## Requisitos de hardware

- VRAM estimada: los pesos cuantizados NVFP4 ocupan aproximadamente 9,9 GB (19,87B parámetros × 0,5 bytes por parámetro en FP4), más overhead de activaciones, KV cache y buffers. En la práctica, se recomienda al menos 16 GB de VRAM para inferencia con contexto corto, y más para contextos largos.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 (80 GB) o GPUs con soporte FP4 nativo (serie RTX 40, A100/H100 con soporte FP4). En GPUs sin soporte FP4, puede ser necesario convertir a otro formato.
- Cabe en GPUs de consumo como RTX 4090, pero no en GPUs de 8-12 GB (p. ej. RTX 3060, RTX 4060) sin cuantización adicional o offloading.
- Opciones de despliegue: compatible con Unsloth (incluido Unsloth Desktop), y probablemente con vLLM, llama.cpp, Ollama y TGI, aunque no se confirma explícitamente en la documentación. Se recomienda verificar la compatibilidad con el framework elegido.
- Latencia y throughput: no disponibles en la información proporcionada. La arquitectura híbrida y el MTP deberían ofrecer una inferencia más rápida que un transformer puro de tamaño similar, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Como referencia, el modelo original Qwen3.8-27B (sin cuantizar) tiene 27B parámetros y contexto de 262K, mientras que esta cuantización reduce el tamaño a ~19,87B parámetros en FP4. Comparado con otras cuantizaciones de 4 bits (p. ej. GGUF Q4_K_M), NVFP4 es un formato específico de NVIDIA que puede ofrecer mejor rendimiento en hardware compatible, pero no hay benchmarks que lo confirmen. Se recomienda evaluar frente a otras versiones cuantizadas del mismo modelo o modelos de tamaño similar (p. ej. Llama 3.1 8B o Qwen3-30B-A3B) en el caso de uso concreto.

## Limitaciones y advertencias

- La cuantización NVFP4 puede introducir una ligera degradación en la precisión frente al modelo original en tareas de alta sensibilidad numérica o razonamiento complejo. Se recomienda validar en el dominio de aplicación.
- No se especifican los idiomas soportados; aunque Qwen suele ser multilingüe, la falta de confirmación puede implicar un rendimiento inconsistente en idiomas no dominantes.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento abierto o generación de código; se recomienda verificación humana en entornos de producción.
- El contexto de 1M tokens requiere escalado RoPE (p. ej. YaRN) y una gestión cuidadosa de la memoria; el uso de contextos muy largos puede aumentar significativamente el consumo de VRAM y la latencia.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero el modelo base puede tener condiciones adicionales; se recomienda revisar los términos de Qwen.
- El modelo se encuentra en vista previa (preview) según la documentación de Unsloth, por lo que puede haber cambios en futuras versiones de la cuantización.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/speakguru/Qwen3.8-27B-NVFP4
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
