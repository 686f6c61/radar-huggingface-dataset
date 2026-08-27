# Theafricatechguy/Qwen3.6-35B-A3B

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje causal con encoder de visión, desarrollado por el equipo Qwen de Alibaba y publicado con licencia Apache 2.0. Es la primera variante de pesos abiertos de la serie Qwen3.6, lanzada oficialmente el 16 de abril de 2026, y está diseñada específicamente para tareas de codificación agéntica y razonamiento a escala de repositorio. El modelo combina una arquitectura híbrida de atención (Gated DeltaNet y Gated Attention) con un bloque de mezcla de expertos (MoE) de 256 expertos, de los cuales se activan 8 más 1 compartido por token, lo que resulta en 35 mil millones de parámetros totales y solo 3 mil millones activos.

La ventana de contexto nativa es de 262 144 tokens, extensible hasta aproximadamente 1 010 000 tokens, y el modelo incorpora un encoder de visión que le permite procesar entradas de imagen y texto. Entre sus novedades destacan la preservación del contexto de razonamiento en mensajes históricos y una mejora sustancial en flujos de trabajo de frontend y razonamiento a nivel de repositorio. Está disponible en formato Transformers y es compatible con vLLM, SGLang y KTransformers, lo que facilita su despliegue en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (linear attention) + Gated Attention + MoE, con encoder de visión |
| Parametros totales | 35 951 822 704 (35B) |
| Parametros activos | 3B (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta ~1 010 000 tokens |
| Tipos de cuantizacion | UD-Q4_K_M (cabe en 24 GB), UD-Q3_K_M (16,6 GB, cabe en 16 GB con KV offload); otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (Transformers), compatible con vLLM, SGLang, KTransformers |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que combina atención lineal (Gated DeltaNet) con atención clásica (Gated Attention) en un patrón de capas repetido: 10 bloques de 3 subcapas de Gated DeltaNet seguidas de MoE, intercalados con 1 subcapa de Gated Attention seguida de MoE. En total son 40 capas, con dimensión oculta de 2048 y embedding de tokens de 248 320 (padded). La atención lineal usa 32 cabezas para V y 16 para QK con dimensión de cabeza 128; la atención clásica usa 16 cabezas para Q y 2 para KV con dimensión de cabeza 256 y RoPE de dimensión 64. El bloque MoE tiene 256 expertos, de los cuales se activan 8 enrutados más 1 compartido, con dimensión intermedia de 512 por experto.

El entrenamiento se realizó en dos etapas: pre-entrenamiento y post-entrenamiento. El modelo incorpora un encoder de visión, lo que lo convierte en un modelo causal de lenguaje con capacidades multimodales (image-text-to-text). También incluye MTP (Multi-Token Prediction) entrenado con múltiples pasos, una técnica que mejora la eficiencia de decodificación y el rendimiento en tareas de razonamiento. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición del dataset en la información disponible.

## Capacidades

- Generación de texto y razonamiento complejo, con especial énfasis en tareas de codificación agéntica y razonamiento a nivel de repositorio.
- Procesamiento de imágenes gracias al encoder de visión integrado (pipeline image-text-to-text).
- Soporte de agentes y razonamiento multi-paso, con mejoras en flujos de trabajo de frontend y resolución de problemas en repositorios completos.
- Preservación del contexto de razonamiento de mensajes históricos, lo que facilita el desarrollo iterativo y reduce la sobrecarga en conversaciones largas.
- Capacidad de tool calling y function calling, aunque no se detallan en la documentación oficial.
- Multilingüismo: no se especifican los idiomas soportados en la información disponible.
- Contexto largo nativo de 262 144 tokens, extensible hasta aproximadamente 1 millón de tokens, adecuado para tareas que requieren ventanas de contexto muy amplias.

## Casos de uso

- Desarrollo de agentes de codificación autónomos: el modelo puede razonar sobre repositorios completos, entender la estructura del proyecto y generar cambios coherentes en múltiples archivos, gracias a su ventana de contexto de 262 144 tokens y su entrenamiento específico en tareas agénticas.
- Asistente de programación en IDE: integrable en editores como VS Code o JetBrains para autocompletado, refactorización y explicación de código, con soporte de razonamiento multi-paso y preservación del contexto histórico.
- Automatización de tareas de frontend: el modelo maneja flujos de trabajo de desarrollo frontend con mayor fluidez, pudiendo generar componentes, estilos y lógica de interacción a partir de descripciones en lenguaje natural.
- Revisión de código y detección de bugs: con su capacidad de razonamiento a nivel de repositorio, puede analizar pull requests, identificar problemas de integración y sugerir correcciones en proyectos grandes.
- Generación de documentación técnica: a partir de código fuente o conversaciones, puede producir documentación coherente y detallada, aprovechando su contexto largo para mantener consistencia en proyectos extensos.
- Chatbot de soporte técnico con contexto largo: su ventana de 262 144 tokens permite mantener conversaciones multi-turno con historial completo de la sesión, ideal para atención al cliente en entornos técnicos.
- Análisis de imágenes y código combinados: al ser multimodal, puede interpretar capturas de pantalla de interfaces, diagramas o documentación visual junto con código, facilitando tareas de diseño y depuración visual.

## Benchmarks y rendimiento

La model card oficial proporciona resultados de benchmarks en tareas de codificación agéntica, comparando con modelos similares. No se han publicado resultados de benchmarks generales como MMLU, HumanEval o GSM8K en la información disponible.

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75.0 | 52.0 | 70.0 | 17.4 | 73.4 |
| SWE-bench Multilingual | 69.3 | 51.7 | 60.3 | 17.3 | 67.2 |
| SWE-bench Pro | 51.2 | 35.7 | 44.6 | 13.8 | 49.5 |
| Terminal-Bench 2.0 | No disponible | No disponible | No disponible | No disponible | No disponible |

## Requisitos de hardware

- VRAM estimada: la cuantización UD-Q4_K_M cabe completamente en una GPU de 24 GB (por ejemplo, RTX 3090, RTX 4090), mientras que UD-Q3_K_M ocupa 16,6 GB y cabe en una GPU de 16 GB con offload de KV cache.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100, o cualquier GPU con al menos 16-24 GB de VRAM según la cuantización elegida.
- Velocidad de inferencia: 157,66 tokens por segundo en una RTX 3090 con UD-Q4_K_M, según pruebas de la guía de ejecución local (sin offload de expertos).
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang, KTransformers y llama.cpp (para cuantizaciones GGUF).
- Para contexto largo (262 144 tokens o más), se recomienda usar vLLM o SGLang con gestión eficiente de KV cache, o considerar offload de KV en GPUs con menos memoria.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | SWE-bench Verified |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B | 3B | 262 144 (ext. 1M) | Apache 2.0 | 73.4 |
| Qwen3.5-35B-A3B | 35B | 3B | No disponible | Apache 2.0 | 70.0 |
| Qwen3.5-27B | 27B | 27B (dense) | No disponible | Apache 2.0 | 75.0 |
| Gemma4-31B | 31B | No disponible | No disponible | No disponible | 52.0 |
| Gemma4-26B-A4B | 26B | 4B | No disponible | No disponible | 17.4 |

El modelo supera a su predecesor Qwen3.5-35B-A3B en SWE-bench Verified (73.4 vs 70.0) y queda ligeramente por detrás del modelo denso Qwen3.5-27B (75.0), pero con una fracción de parámetros activos (3B vs 27B), lo que lo hace mucho más eficiente en inferencia.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos conocidos, riesgos de alucinación o limitaciones idiomáticas en la información disponible.
- El modelo está optimizado para tareas de codificación y razonamiento técnico; su rendimiento en otros dominios (por ejemplo, creatividad literaria o conversación general) no está documentado.
- La ventana de contexto extensible hasta ~1 010 000 tokens puede requerir hardware especializado y técnicas de gestión de memoria avanzadas; no se garantiza un rendimiento óptimo en configuraciones de baja VRAM.
- Aunque la licencia es Apache 2.0, se recomienda revisar los términos específicos del modelo original de Qwen para verificar restricciones adicionales de uso comercial.
- El repositorio de HuggingFace (Theafricatechguy/Qwen3.6-35B-A3B) tiene 0 descargas y 0 likes, lo que sugiere que es un mirror o re-subida; se recomienda usar el repositorio oficial de Qwen para producción.
- No se dispone de información sobre la composición del dataset de entrenamiento ni sobre posibles sesgos demográficos o culturales.

## Enlaces

- Repositorio HuggingFace (mirror): https://huggingface.co/Theafricatechguy/Qwen3.6-35B-A3B
- Repositorio oficial HuggingFace: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog oficial de Qwen: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Guía de ejecución local (insiderllm.com): https://insiderllm.com/guides/best-way-run-qwen-3-6-35b-moe-locally/
- Guía completa de Qwen 3.6 (insiderllm.com): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Review en dev.to: https://dev.to/czmilo/qwen36-35b-a3b-complete-review-alibabas-open-source-coding-model-that-beats-frontier-giants-4382
- NVIDIA NGC (NIM): https://catalog.ngc.nvidia.com/orgs/nim/qwen/models/qwen3.6-35b-a3b/nim-spark-nvfp4-mtp
