# thomasken1234/qwen3.6-35b-bk17

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje causal con encoder de visión, desarrollado por el equipo Qwen de Alibaba como parte de la serie Qwen3.6. Es la primera variante de pesos abiertos de esta generación, diseñada específicamente para mejorar la estabilidad y la utilidad en entornos reales de desarrollo, con un enfoque particular en la codificación agéntica y el razonamiento a nivel de repositorio. El modelo emplea una arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention), junto con un mecanismo de mezcla de expertos (MoE) que activa solo 3.000 millones de parámetros de los 35.000 millones totales por token procesado.

La relevancia de este lanzamiento radica en su equilibrio entre rendimiento y eficiencia: con solo 3B de parámetros activos, alcanza resultados competitivos en benchmarks de agentes de codificación como SWE-bench Verified (73,4%), superando a modelos densos de tamaño similar. Además, incorpora una ventana de contexto nativa de 262.144 tokens, ampliable hasta aproximadamente 1.010.000, y una nueva funcionalidad de preservación del pensamiento que permite retener el contexto de razonamiento de mensajes históricos para optimizar flujos de desarrollo iterativo. Su licencia Apache 2.0 y su compatibilidad con múltiples frameworks de inferencia (Transformers, vLLM, SGLang, KTransformers) lo convierten en una opción atractiva tanto para investigación como para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo causal híbrido con vision encoder: Gated DeltaNet (atención lineal) + Gated Attention + MoE |
| Parametros totales | 35.951.822.704 (35,95B) |
| Parametros activos | 3B (8 expertos enrutados + 1 experto compartido) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta ~1.010.000 |
| Tipos de cuantizacion | No disponible (formato safetensors de precisión completa; se esperan cuantizaciones GGUF/AWQ de la comunidad) |
| Idiomas soportados | No disponible (la model card no especifica; se presume multilingüe por la serie Qwen) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

Qwen3.6-35B-A3B utiliza una arquitectura híbrida que intercala bloques de atención lineal y atención completa. El modelo tiene 40 capas organizadas en un patrón de 10 grupos, donde cada grupo contiene 3 sub-bloques de (Gated DeltaNet → MoE) seguidos de 1 sub-bloque de (Gated Attention → MoE). La Gated DeltaNet emplea 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention utiliza 16 cabezas para Q y 2 para KV, con dimensión de cabeza 256 y embeddings rotatorios de 64 dimensiones. El mecanismo MoE cuenta con 256 expertos en total, de los cuales 8 son enrutados por token más 1 experto compartido, con una dimensión intermedia de 512 por experto. El modelo también incorpora entrenamiento con múltiples pasos de predicción de tokens (MTP).

El proceso de entrenamiento comprende una fase de pre-entrenamiento seguida de post-entrenamiento, aunque la model card no detalla la composición del dataset ni el número exacto de tokens utilizados. La innovación principal de esta versión es la preservación del pensamiento: una opción que permite conservar el contexto de razonamiento de mensajes anteriores, reduciendo la sobrecarga computacional en sesiones de desarrollo iterativas. No se menciona explícitamente el uso de RLHF o DPO, pero el énfasis en estabilidad y utilidad práctica sugiere un ajuste fino orientado a tareas de agente.

## Capacidades

- Generación de texto y razonamiento complejo con soporte de visión (pipeline image-text-to-text).
- Codificación agéntica: manejo de flujos de trabajo frontend y razonamiento a nivel de repositorio con alta precisión.
- Preservación del pensamiento: retención opcional del contexto de razonamiento de mensajes históricos para optimizar iteraciones.
- Razonamiento multi-paso y planificación de tareas, evidenciado por resultados en SWE-bench y Terminal-Bench.
- Capacidad de procesamiento de contexto muy largo (262K nativo, hasta ~1M extendido) para análisis de repositorios completos o documentos extensos.
- Integración con herramientas de agente y entornos de terminal (inferido por benchmarks como Terminal-Bench 2.0).
- Soporte multilingüe probable (no confirmado en la documentación proporcionada).

## Casos de uso

- Desarrollo de agentes de codificación autónomos: el modelo puede gestionar tareas complejas de resolución de incidencias en repositorios, como las evaluadas en SWE-bench Verified, gracias a su capacidad de razonamiento multi-paso y su ventana de contexto amplia que permite analizar múltiples archivos y su historial.
- Asistente de programación en IDE con contexto largo: su ventana de 262K tokens permite mantener el contexto de proyectos grandes, facilitando refactorizaciones, generación de código y explicaciones de código existente sin perder información relevante.
- Automatización de tareas de terminal y operaciones: con soporte para Terminal-Bench 2.0, puede ejecutar comandos, interpretar salidas y tomar decisiones en entornos de línea de comandos, útil para pipelines de CI/CD o administración de sistemas.
- Análisis de documentación técnica y repositorios: su capacidad de procesar hasta ~1M tokens extendido permite resumir y extraer información de bases de código completas, wikis internas o documentación extensa.
- Prototipado rápido de aplicaciones con visión: al incluir un encoder de visión, puede procesar capturas de pantalla o diagramas para generar código frontend o explicar interfaces, integrando información visual en el razonamiento.
- Despliegue local en hardware limitado: gracias a sus 3B de parámetros activos, puede ejecutarse en equipos de consumo (por ejemplo, MacBook con suficiente RAM) con cuantización, ofreciendo capacidades de nivel profesional sin necesidad de GPUs de datacenter.

## Benchmarks y rendimiento

La model card oficial proporciona resultados comparativos en tareas de codificación agéntica. Se presentan los datos disponibles:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35B-A3B | Gemma4-26B-A4B | Qwen3.6-35B-A3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | **73,4** |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | **67,2** |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | **49,5** |
| Terminal-Bench 2.0 | (dato no disponible en la información extraída) | | | | |

No se dispone de datos adicionales sobre benchmarks de lenguaje general (MMLU, GSM8K, HumanEval) en la información proporcionada.

## Requisitos de hardware

- Al ser un modelo MoE con 3B parámetros activos, la inferencia es eficiente en cómputo, pero los pesos totales (35,95B) requieren memoria suficiente para cargarlos. En FP16, el modelo necesita aproximadamente 72 GB de VRAM, mientras que en cuantización de 4 bits (no oficial, pero probable con herramientas como llama.cpp) podría reducirse a unos 18-20 GB.
- GPU recomendadas: para FP16 se necesitan GPUs de datacenter como A100 80GB, H100 80GB o múltiples RTX 4090 (24GB cada una) con paralelismo. Con cuantización 4-bit, una RTX 4090 o incluso una MacBook con 32GB de RAM unificada podrían ser suficientes.
- Compatible con frameworks de inferencia como vLLM, SGLang, KTransformers y Transformers de HuggingFace. También se espera soporte en llama.cpp y Ollama a través de conversiones GGUF de la comunidad.
- La latencia y el throughput dependen en gran medida del hardware y la cuantización. Con 3B activos, el rendimiento en tokens por segundo es significativamente superior al de un modelo denso de 35B, pero no se proporcionan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35,95B | 3B | 262K (ext. 1M) | 73,4 | Apache 2.0 |
| Qwen3.5-35B-A3B | 35B | 3B | No especificado | 70,0 | Apache 2.0 |
| Qwen3.5-27B (dense) | 27B | 27B | No especificado | 75,0 | Apache 2.0 |
| Gemma4-26B-A4B | 26B | 4B | No especificado | 17,4 | Gemma license |

El modelo Qwen3.6-35B-A3B se sitúa en una posición intermedia entre su predecesor directo (Qwen3.5-35B-A3B) y el modelo denso Qwen3.5-27B, ofreciendo un equilibrio entre rendimiento y eficiencia. Supera claramente a Gemma4-26B-A4B en tareas de codificación agéntica. La ventaja principal es su contexto nativo más largo y la nueva funcionalidad de preservación del pensamiento, no presente en versiones anteriores.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero como modelo entrenado con datos web, puede reflejar sesgos presentes en esos datos.
- Riesgo de alucinación inherente a todos los modelos de lenguaje; se recomienda verificación de salidas en entornos de producción.
- Aunque el contexto nativo es de 262K tokens, el rendimiento puede degradarse en longitudes cercanas al máximo; la extensión a 1M tokens puede requerir técnicas adicionales como interpolación de posición.
- Los idiomas soportados no están especificados oficialmente; aunque la serie Qwen es multilingüe, no se garantiza un rendimiento uniforme en todos los idiomas.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos completos de la licencia original de Qwen.
- No se proporcionan datos de benchmarks de lenguaje general (MMLU, GSM8K, etc.), por lo que la evaluación se limita a tareas de codificación agéntica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/thomasken1234/qwen3.6-35b-bk17
- Repositorio GitHub oficial de Qwen3.6: https://github.com/QwenLM/Qwen3.6
- Blog oficial de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Guía completa en InsiderLLM: https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Guía en AImadetools: https://www.aimadetools.com/blog/qwen-3-6-35b-a3b-complete-guide/
- Catálogo de modelos en Microsoft Foundry: https://ai.azure.com/catalog/models/FW-Qwen3.6-35B-A3B
- Página en LM Studio: https://lmstudio.ai/models/qwen/qwen3.6-35b-a3b
