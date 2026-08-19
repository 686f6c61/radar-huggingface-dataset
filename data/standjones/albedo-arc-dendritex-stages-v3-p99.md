# standjones/albedo-arc-dendritex-stages-v3-p99

## Resumen

El modelo `standjones/albedo-arc-dendritex-stages-v3-p99` es una publicación en Hugging Face que contiene los pesos de **Qwen3.6-35B-A3B**, un modelo de lenguaje causal multimodal (imagen-texto a texto) desarrollado por Alibaba Qwen. Se trata de la primera variante de la serie Qwen3.6 con pesos abiertos, orientada a estabilidad y utilidad real en tareas de codificación agéntica y razonamiento a nivel de repositorio. El modelo combina una arquitectura MoE híbrida con atención lineal (Gated DeltaNet) y atención clásica (Gated Attention), con un total de 35 mil millones de parámetros de los cuales solo 3 mil millones se activan por token, lo que lo hace eficiente en inferencia. Soporta una ventana de contexto nativa de 262 144 tokens, extensible hasta aproximadamente 1 010 000, e incorpora un codificador de visión para entradas multimodales.

La relevancia de este lanzamiento radica en que Qwen3.6 introduce mejoras sustanciales en codificación agéntica (frontend y razonamiento a nivel de repositorio) y una nueva opción de "preservación del pensamiento" que conserva el contexto de razonamiento de mensajes históricos, reduciendo la sobrecarga en desarrollo iterativo. El repositorio, subido por el usuario standjones, es un re-empaquetado de los pesos oficiales en formato Transformers, compatible con vLLM, SGLang y KTransformers. Con licencia Apache 2.0, es apto para uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, MoE híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 35 951 822 704 (35B) |
| Parametros activos | 3B (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262 144 tokens nativo, extensible a ~1 010 000 |
| Tipos de cuantizacion | No disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (no especificado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

Qwen3.6-35B-A3B emplea una arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention), organizadas en un layout de 40 capas: `10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE))`. El bloque DeltaNet utiliza 32 cabezas lineales para V y 16 para QK con dimensión 128, mientras que la atención clásica usa 16 cabezas Q y 2 KV con dimensión 256 y RoPE de 64 dimensiones. La capa MoE contiene 256 expertos, de los cuales se activan 8 enrutados más 1 compartido, con una dimensión intermedia de 512. El modelo incorpora un codificador de visión para procesar entradas de imagen y texto, y entrena con MTP (multi-token prediction) en múltiples pasos.

El entrenamiento se divide en pre-training y post-training. La fase de post-training se centra en estabilidad y utilidad práctica, con énfasis en codificación agéntica (frontend y razonamiento a nivel de repositorio) y en la preservación del contexto de razonamiento de mensajes históricos, una innovación que permite mantener el "pensamiento" del modelo a través de turnos de conversación sin recalcular desde cero. No se detallan los datos de entrenamiento ni el número exacto de tokens, pero la model card indica que es un modelo post-entrenado compatible con Transformers, vLLM, SGLang y KTransformers.

## Capacidades

- Generacion de texto y razonamiento de propósito general, con especialización en tareas de codificación agéntica y razonamiento a nivel de repositorio.
- Comprensión de imágenes (image-text-to-text) gracias a su codificador de visión, lo que permite describir, analizar y razonar sobre entradas visuales.
- Soporte de agente: puede ejecutar tareas complejas de múltiples pasos, como navegar por un repositorio, editar código, ejecutar comandos de terminal y resolver issues de software.
- Preservación del pensamiento: opción de conservar el contexto de razonamiento de mensajes históricos, útil para desarrollo iterativo y conversaciones largas.
- Contexto largo nativo de 262 144 tokens, extensible a más de 1 millón, adecuado para documentos extensos y repositorios completos.
- Capacidades multilingües: no especificadas oficialmente, pero como modelo de la familia Qwen, se espera soporte para múltiples idiomas (sin confirmar).

## Casos de uso

- **Desarrollo de software asistido por agente**: el modelo puede actuar como un agente de codificación que navega por un repositorio, comprende la estructura del proyecto, identifica bugs y genera parches. Su rendimiento en SWE-bench Verified (73.4) lo hace adecuado para automatizar tareas de mantenimiento de código en equipos de ingeniería.
- **Revisión de código automatizada**: gracias a su capacidad de razonamiento a nivel de repositorio, puede analizar pull requests, detectar problemas de estilo, lógica o seguridad, y sugerir mejoras, integrándose en pipelines de CI/CD.
- **Asistente de terminal y operaciones**: con soporte para Terminal-Bench, puede ejecutar comandos, interpretar salidas y resolver tareas de administración de sistemas, como configuración de entornos, gestión de dependencias o diagnóstico de errores.
- **Análisis de documentación técnica**: su ventana de contexto de 262K tokens permite procesar manuales extensos, especificaciones o documentación de APIs completas, respondiendo preguntas y generando resúmenes precisos.
- **Generación de código frontend**: el modelo está optimizado para flujos de trabajo de frontend, por lo que puede generar componentes HTML/CSS/JavaScript a partir de descripciones en lenguaje natural o de capturas de imagen (gracias a su entrada multimodal).
- **Asistente de investigación en repositorios**: para científicos de datos o investigadores que trabajan con bases de código grandes, el modelo puede localizar funciones, entender dependencias y explicar arquitecturas complejas, reduciendo el tiempo de onboarding.
- **Chat multimodal con contexto largo**: al combinar visión y texto, puede analizar diagramas, capturas de pantalla o gráficos junto con código, facilitando la depuración visual de aplicaciones.

## Benchmarks y rendimiento

La model card proporciona resultados de benchmarks para tareas de codificación agéntica, comparando Qwen3.6-35B-A3B con modelos similares. Se presentan los datos disponibles:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75.0 | 52.0 | 70.0 | 17.4 | 73.4 |
| SWE-bench Multilingual | 69.3 | 51.7 | 60.3 | 17.3 | 67.2 |
| SWE-bench Pro | 51.2 | 35.7 | 44.6 | 13.8 | 49.5 |

No se dispone del valor de Terminal-Bench 2.0 para este modelo (la tabla se corta en la información proporcionada). Tampoco se incluyen benchmarks de lenguaje general como MMLU o GSM8K en la model card.

## Requisitos de hardware

- **VRAM estimada**: los pesos en BF16/FP16 ocupan aproximadamente 70 GB (35B × 2 bytes), lo que requiere una GPU con al menos 80 GB (p. ej., A100 80GB, H100) o varias GPU. Con cuantización INT8 (~35 GB) cabe en una GPU de 48 GB (A6000, L40S), y con INT4 (~18 GB) en una RTX 4090 (24 GB) o similar, aunque no se han publicado cuantizaciones oficiales.
- **GPU recomendadas**: A100 80GB, H100, o configuraciones multi-GPU para BF16. Para cuantización ligera, RTX 4090, RTX 6000 Ada o A6000.
- **Inferencia en consumer GPU**: sí, con cuantización 4-bit (p. ej., mediante llama.cpp o GPTQ) cabe en una RTX 4090, aunque el rendimiento puede verse limitado por el ancho de banda de memoria.
- **Opciones de despliegue**: vLLM, SGLang, KTransformers, Hugging Face Transformers (indicados en la model card). También puede usarse con llama.cpp si se generan archivos GGUF.
- **Latencia y throughput**: no disponibles. Al ser un MoE con solo 3B activos, la latencia por token debería ser significativamente menor que la de un modelo denso de 35B, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

El modelo se compara directamente con Qwen3.5-35BA3B (su predecesor), Qwen3.5-27B y Gemma4-31B en la tabla de benchmarks anterior. A nivel de especificaciones:

| Modelo | Parametros | Activos | Contexto | Licencia | SWE-bench Verified |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B | 3B | 262K (ext. 1M) | Apache 2.0 | 73.4 |
| Qwen3.5-35B-A3B | 35B | 3B | No disponible | Apache 2.0 | 70.0 |
| Qwen3.5-27B | 27B | 27B (denso) | No disponible | Apache 2.0 | 75.0 |
| Gemma4-31B | 31B | 31B (denso) | No disponible | Gemma license | 52.0 |

Qwen3.6-35B-A3B ofrece un rendimiento cercano al de Qwen3.5-27B (denso) en SWE-bench Verified, pero con solo 3B activos, lo que implica un coste de inferencia mucho menor. Frente a Gemma4-31B, supera claramente en tareas de codificación agéntica. La ventaja principal es el equilibrio entre eficiencia (MoE) y capacidad de razonamiento a nivel de repositorio.

## Limitaciones y advertencias

- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar código o respuestas plausibles pero incorrectas, especialmente en contextos ambiguos o con información incompleta.
- **Sesgos potenciales**: al ser un modelo entrenado por Alibaba, puede reflejar sesgos culturales o lingüísticos de sus datos de entrenamiento. No se han publicado evaluaciones de sesgo.
- **Idiomas**: no se especifican los idiomas soportados; aunque la familia Qwen suele cubrir múltiples lenguas, no hay garantía oficial para este modelo.
- **Cuantizaciones no oficiales**: el repositorio solo contiene pesos en safetensors sin cuantizaciones publicadas. Cualquier cuantización realizada por terceros puede degradar el rendimiento, especialmente en tareas de razonamiento complejo.
- **Origen del repositorio**: el modelo está subido por el usuario `standjones`, no por Qwen directamente. Aunque la model card es la oficial, conviene verificar la integridad de los pesos antes de usarlo en producción.
- **Contexto extendido**: la extensión hasta 1 010 000 tokens puede requerir técnicas de interpolación de RoPE o atención esparsa; el rendimiento en esa longitud extrema no está garantizado.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones, pero es recomendable revisar los términos de la licencia del modelo base (enlazada en la model card) para confirmar que no hay cláusulas adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/standjones/albedo-arc-dendritex-stages-v3-p99
- Blog oficial de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
