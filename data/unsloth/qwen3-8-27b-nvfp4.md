# unsloth/Qwen3.8-27B-NVFP4

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con encoder de visión, desarrollado por Qwen (Alibaba) y publicado en su familia Qwen3.8. Se trata de un modelo denso de 27 000 millones de parámetros, con arquitectura híbrida que combina Gated DeltaNet (atención lineal) y Gated Attention (atención con RoPE), entrenado además con Multi-Token Prediction (MTP). Soporta de forma nativa una ventana de contexto de 262 144 tokens, extensible hasta 1 000 000 mediante técnicas de escalado RoPE como YaRN. Es un modelo de visión-lenguaje que comprende imágenes y vídeos, con modo de pensamiento (thinking mode) activable o desactivable por petición.

La versión `unsloth/Qwen3.8-27B-NVFP4` es una cuantización en precisión NVFP4 (FP4 de NVIDIA) realizada por Unsloth con su técnica Dynamic V3.0 (preview). Esta cuantización reduce el tamaño de los pesos de aproximadamente 52 GiB en BF16 a unos 22,5 GiB, lo que permite ejecutar el modelo en GPUs de consumo con 24 GB de VRAM o en el DGX Spark (GB10). El repositorio incluye también los pesos del módulo MTP (0,81 GiB) para acelerar la inferencia. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, 64 capas, Gated DeltaNet + Gated Attention, MTP |
| Parametros totales | 27 000 millones (modelo base); archivo NVFP4: 19 869 895 952 parámetros cuantizados |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 000 000 |
| Tipos de cuantizacion | NVFP4 (FP4 de NVIDIA) con Unsloth Dynamic V3.0 |
| Idiomas soportados | No disponible (se espera multilingüe, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (NVFP4) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso con una arquitectura híbrida que alterna bloques de Gated DeltaNet (atención lineal con cabezales separados para V y QK) y bloques de Gated Attention (atención clásica con RoPE). Esta combinación permite manejar secuencias largas de forma eficiente, manteniendo la calidad de la atención completa en los bloques donde es necesaria. El modelo incorpora un encoder de visión para procesar imágenes y vídeos, y ha sido entrenado en dos etapas: pre-entrenamiento y post-entrenamiento (alineación). Además, está entrenado con Multi-Token Prediction (MTP), lo que permite predecir varios tokens a la vez y acelerar la inferencia.

Los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. La cuantización NVFP4 de Unsloth utiliza una técnica dinámica que ajusta los rangos de cuantización por capa y por token, preservando la precisión del modelo original. El repositorio incluye los pesos del módulo MTP cuantizados, lo que permite aprovechar la decodificación especulativa en frameworks compatibles.

## Capacidades

- Generación de texto y razonamiento complejo con modo de pensamiento (thinking mode) activado por defecto, desactivable por petición.
- Comprensión de imágenes y vídeos de forma nativa, incluyendo diagramas STEM, documentos y vídeos de larga duración (hasta horas).
- Soporte de tool calling y function calling, con mejoras específicas para el parseo de objetos anidados en llamadas a herramientas.
- Capacidades de agente autónomo: planificación de tareas de largo horizonte, manejo de feedback del entorno y ejecución de pasos múltiples.
- Control flexible del razonamiento mediante el parámetro `reasoning_effort` y retención del contexto de razonamiento histórico con `preserve_thinking`.
- Multi-Token Prediction (MTP) para inferencia más rápida en frameworks que lo soporten.
- Contexto largo nativo de 262 144 tokens, extensible a 1 000 000 con escalado RoPE (p. ej., YaRN).

## Casos de uso

- Agentes autónomos de software: el modelo puede planificar y ejecutar tareas de múltiples pasos en entornos como Codex u otras herramientas agénticas, gracias a su soporte de tool calling y su capacidad de retener razonamiento histórico.
- Análisis de vídeo de larga duración: con su encoder de visión y contexto de 262K tokens, puede procesar vídeos de hasta horas para extraer información, resumir eventos o responder preguntas sobre el contenido.
- Asistente de programación en producción: genera código, explica fragmentos y puede integrarse en pipelines de CI/CD mediante tool calling, con la ventaja de su modo de pensamiento para depurar problemas complejos.
- Atención al cliente automatizada: gestiona conversaciones multi-turno con contexto largo (hasta 1M tokens escalado), manteniendo el historial completo y razonando sobre documentos o políticas de la empresa.
- Análisis de documentos técnicos y científicos: combina visión y lenguaje para interpretar diagramas, figuras y tablas en papers, informes o manuales, generando resúmenes o respondiendo preguntas específicas.
- Investigación y redacción profesional: asiste en la redacción de informes, artículos o documentación técnica, con control del nivel de razonamiento y capacidad de trabajar con entradas largas (libros, expedientes, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del modelo base Qwen3.8-27B no incluye tablas de rendimiento, y la cuantización NVFP4 de Unsloth no proporciona métricas comparativas. Se recomienda consultar la documentación oficial de Qwen o Unsloth para obtener datos de evaluación cuando estén disponibles.

## Requisitos de hardware

- VRAM estimada: el archivo NVFP4 pesa aproximadamente 22,5 GiB (pesos) + 0,81 GiB (MTP), por lo que se necesita al menos 24 GB de VRAM para inferencia con contexto moderado. Con contexto largo (262K o 1M), la memoria adicional para KV cache puede superar los 24 GB, requiriendo GPUs con más memoria o técnicas de offloading.
- GPUs recomendadas: NVIDIA RTX 5090 (32 GB), RTX 4090 (24 GB) para contextos cortos; para contextos largos, se recomienda A100 80GB, H100, B200 o el DGX Spark (GB10) con 128 GB unificados.
- Compatibilidad con consumer GPU: sí, en RTX 4090 o RTX 5090 con cuantización NVFP4, siempre que el contexto no sea extremo.
- Opciones de despliegue: vLLM, SGLang, llama.cpp (si soporta NVFP4), Ollama (si se añade soporte), y Unsloth Desktop para ejecución local.
- Latencia y throughput: no disponibles. La cuantización NVFP4 y el MTP deberían reducir la latencia frente a BF16, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos verificados con otros modelos de 27B en la información proporcionada. La model card menciona que Qwen3.8 es la generación más capaz de la familia Qwen, superando a Qwen3.5 y Qwen3.6, pero no se ofrecen cifras concretas. Se puede comparar estructuralmente con otros modelos densos de 27B como Gemma 3 27B o Llama 3.1 8B, pero no se dispone de especificaciones detalladas de estos en la información actual. Se recomienda consultar benchmarks independientes cuando estén disponibles.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos web, puede reflejar sesgos sociales, culturales o de género presentes en esos datos.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o con contextos muy largos.
- La cuantización NVFP4 requiere hardware NVIDIA con soporte para FP4 (RTX 50xx, B200, etc.). En GPUs más antiguas (RTX 30xx, 40xx) puede no ser compatible, y se necesitaría una cuantización alternativa (p. ej., GGUF Q4_K_M).
- El contexto de 1M tokens requiere escalado RoPE (YaRN) y puede degradar ligeramente la calidad si se usa de forma agresiva.
- El modo de pensamiento activado por defecto aumenta el consumo de tokens de salida; se recomienda ajustar `reasoning_effort` para equilibrar calidad y coste.
- La licencia Apache 2.0 permite uso comercial, pero la cuantización NVFP4 de Unsloth puede tener términos adicionales (consultar la documentación de Unsloth).
- No se han publicado resultados de benchmarks para esta cuantización, por lo que el rendimiento real en tareas específicas debe validarse antes de usar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Guía de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Guía de Unsloth para NVFP4: https://unsloth.ai/docs/basics/nvfp4
- Repositorio de ejemplo en DGX Spark: https://github.com/gitcommit90/qwen38-27b-dgx-spark
- Artículo de Yottalabs sobre Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
