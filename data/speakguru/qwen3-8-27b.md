# speakguru/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso con codificador de visión, desarrollado por el equipo Qwen (Alibaba) y publicado bajo licencia Apache 2.0. Forma parte de la generación Qwen3.8, sucesora de las series Qwen3.5 y Qwen3.6, y está diseñado para tareas de codificación, trabajo profesional, investigación y tareas agénticas de horizonte largo. Se trata de un modelo de 27.781 millones de parámetros con una arquitectura híbrida que combina atención lineal (Gated DeltaNet) con atención clásica (Gated Attention), lo que le permite manejar una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000.

El modelo es nativamente multimodal: comprende imágenes y vídeo, desde diagramas STEM y documentos hasta vídeos de una hora de duración. Incluye un modo de pensamiento configurable (thinking mode) activado por defecto, con control de profundidad de razonamiento mediante `reasoning_effort` y retención de contexto de razonamiento histórico mediante `preserve_thinking`. También incorpora predicción multi-token (MTP) para acelerar la generación. Su tamaño compacto (27B) lo hace adecuado para despliegue local en hardware de gama alta, y es compatible con los principales motores de inferencia como vLLM, SGLang y Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.000.000 |
| Tipos de cuantizacion | No disponible (no se publican en la informacion proporcionada) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso de 64 capas con dimensión oculta de 5120 y embedding de tokens de 248.320 (padded). Su layout interno es `16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, lo que significa que por cada 4 bloques, 3 usan atención lineal (Gated DeltaNet) y 1 usa atención clásica (Gated Attention). El Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. El Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. La FFN tiene dimensión intermedia de 17.408.

El modelo fue entrenado en dos etapas: pre-entrenamiento y post-entrenamiento. Incluye predicción multi-token (MTP) entrenada con múltiples pasos, lo que mejora la velocidad de decodificación. El entrenamiento incorpora datos multimodales (imagen y vídeo) dado su codificador de visión nativo. No se especifican en la información disponible el número total de tokens de entrenamiento ni la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento complejo con modo de pensamiento configurable (thinking mode activado por defecto, desactivable por petición).
- Comprensión de imágenes y vídeo de forma nativa, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Razonamiento multi-paso y planificación autónoma para tareas agénticas de horizonte largo, con manejo de feedback del entorno.
- Codificación avanzada, incluyendo codificación agéntica en terminal (según benchmark Terminal Bench 2.1).
- Control de profundidad de razonamiento mediante `reasoning_effort` y retención de contexto de razonamiento histórico mediante `preserve_thinking`.
- Soporte de tool calling y function calling (implícito en su capacidad agéntica, aunque no se detalla explícitamente en la información proporcionada).
- Capacidades multilingües: no se especifican idiomas concretos en la información disponible.
- Compatibilidad con múltiples motores de inferencia: Transformers, vLLM, SGLang, TokenSpeed.

## Casos de uso

- Asistente de codificación en producción: el modelo puede integrarse en pipelines de CI/CD para generación, revisión y refactorización de código, aprovechando su modo de pensamiento para razonar sobre problemas complejos y su soporte de MTP para reducir la latencia de generación.
- Agente autónomo de terminal: gracias a su rendimiento en Terminal Bench 2.1, puede ejecutar tareas de administración de sistemas, scripting y operaciones de desarrollo de forma autónoma, interpretando salidas de comandos y ajustando su plan en consecuencia.
- Análisis de documentos técnicos y científicos: su capacidad de visión permite extraer información de diagramas, gráficos y documentos escaneados, combinando comprensión visual con razonamiento textual para tareas de investigación.
- Procesamiento de vídeo de larga duración: puede analizar vídeos de hasta una hora para generar resúmenes, detectar eventos o responder preguntas sobre el contenido, útil en vigilancia, revisión de material audiovisual o educación.
- Asistente de investigación: con su contexto de 262K tokens, puede procesar papers completos, informes técnicos y documentación extensa, manteniendo el razonamiento a lo largo de conversaciones largas sin perder el hilo.
- Despliegue local en estaciones de trabajo: al ser un modelo denso de 27B, puede ejecutarse en GPUs de consumo de gama alta (p. ej., RTX 4090 con cuantización) o en servidores con una o dos GPUs profesionales, permitiendo inferencia privada sin dependencia de APIs externas.

## Benchmarks y rendimiento

La información proporcionada incluye una tabla de benchmarks comparativa, pero el extracto disponible solo muestra el encabezado y la primera fila (Terminal Bench 2.1 - Terminus) sin valores numéricos. No se pueden extraer resultados concretos de la información disponible. Se menciona que el modelo supera a Qwen3.6-27B y compite con Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se proporcionan cifras.

No se han publicado resultados de benchmarks completos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 55,6 GB en safetensors, lo que corresponde a pesos en FP16. Para inferencia en FP16 se necesitan al menos 2 GPUs de 32 GB (p. ej., 2× A100 40GB) o una GPU de 64 GB (p. ej., A100 80GB). Con cuantización de 4 bits (no confirmada oficialmente), la VRAM necesaria se reduciría a aproximadamente 14-16 GB, lo que permitiría ejecutarlo en una RTX 4090 (24 GB) o similar.
- GPUs recomendadas: A100 40/80GB, H100, o GPUs de consumo con 24 GB o más si se aplica cuantización.
- En consumer GPU: posible con cuantización (p. ej., GGUF o AWQ) en RTX 4090, RTX 3090 o AMD Radeon con 24 GB de VRAM. Sin cuantización, no cabe en GPUs de consumo típicas.
- Opciones de despliegue: vLLM, SGLang, Transformers, TokenSpeed, y según el blog de AMD, también es compatible con GPUs AMD Radeon y APUs Ryzen AI Max.
- Latencia y throughput: no se proporcionan datos oficiales. El uso de MTP (multi-token prediction) debería reducir la latencia de decodificación en comparación con modelos de generación token a token, pero no hay cifras publicadas en la información disponible.

## Comparativa con modelos similares

La tabla de benchmarks de la model card compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. Sin embargo, no se dispone de especificaciones detalladas de estos modelos comparados en la información proporcionada. Se puede afirmar que Qwen3.8-27B es la evolución directa de Qwen3.6-27B, con mejoras en codificación, trabajo profesional, investigación y tareas agénticas. No se dispone de datos suficientes para una comparativa cuantitativa completa.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262K (ext. 1M) | Apache 2.0 | Modelo evaluado |
| Qwen3.6-27B | 27B | No disponible | No disponible | Predecesor directo |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | Modelo de la misma familia |
| Muse Glimmer-30B | 30B | No disponible | No disponible | Competidor de tamaño similar |
| Opus4.6 Max | No disponible | No disponible | No disponible | Competidor de gama alta |

## Limitaciones y advertencias

- No se especifican los idiomas soportados en la información disponible; es probable que el modelo esté optimizado principalmente para inglés y chino, dado el origen de Qwen, pero esto no está confirmado.
- No se han publicado resultados de benchmarks completos en la información disponible, lo que dificulta una evaluación objetiva de su rendimiento real frente a alternativas.
- El modelo es denso y de 27B parámetros, lo que requiere hardware de gama alta para inferencia sin cuantización; el despliegue en entornos con VRAM limitada exige cuantización, cuyos formatos oficiales no se han anunciado.
- Al ser un modelo multimodal, puede presentar alucinaciones visuales o interpretaciones erróneas de imágenes y vídeos complejos, especialmente en escenarios de baja resolución o con contenido ambiguo.
- El modo de pensamiento activado por defecto puede aumentar la latencia en tareas simples; es necesario desactivarlo explícitamente para aplicaciones de baja latencia.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la familia Qwen para posibles restricciones adicionales (no se mencionan en la información proporcionada).
- No se dispone de información sobre sesgos del modelo, riesgos de seguridad o alineación con valores humanos.

## Enlaces

- HuggingFace: https://huggingface.co/speakguru/Qwen3.8-27B
- LM Studio (ficha del modelo): https://lmstudio.ai/models/qwen/qwen3.8-27b
- Yottalabs (specs y requisitos de hardware): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Blog de AMD (ejecución en hardware AMD): https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- AI Release Tracker (benchmarks y fecha de lanzamiento): https://aireleasetracker.com/model/qwen/qwen3.8-27b
- Qwen Cloud (servicio gestionado, próximamente): https://www.qwencloud.com/models/qwen3.8-27b
