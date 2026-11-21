# thhqm/Qwen3.8-27B-FP8

## Resumen

Qwen3.8-27B-FP8 es una versión cuantizada en FP8 del modelo Qwen3.8-27B, publicado por el usuario thhqm en Hugging Face. El modelo base es un modelo denso de 27 781 427 952 parámetros (aproximadamente 27,8 mil millones) desarrollado por el equipo Qwen, que combina un codificador visual con un modelo de lenguaje causal para tareas de imagen-texto-a-texto. Esta variante FP8 reduce el peso del repositorio a 30,9 GB y emplea una cuantización de grano fino con bloques de 128, manteniendo, según el autor, métricas de rendimiento casi idénticas a las del modelo original.

El modelo se presenta como la generación más capaz de la familia abierta Qwen hasta la fecha, construida sobre la base arquitectónica de Qwen3.5. Incorpora mejoras en codificación, trabajo profesional, investigación y tareas agénticas de horizonte largo, con control flexible del modo de razonamiento y comprensión nativa de imágenes y vídeos. Su contexto nativo es de 262 144 tokens, extensible hasta 1 000 000, lo que lo sitúa en la gama alta de ventanas de contexto para modelos densos de este tamaño.

La relevancia de esta ficha radica en que ofrece un punto de entrada práctico para desplegar un modelo multimodal de 27B en infraestructura con memoria limitada, gracias a la cuantización FP8, manteniendo compatibilidad con Transformers, vLLM, SGLang y TokenSpeed. No obstante, el repositorio no incluye información sobre idiomas soportados ni resultados de benchmarks en la información proporcionada, y su adopción comunitaria es todavía nula (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador visual; layout híbrido de 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parámetros totales | 27 781 427 952 (≈27,8B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 000 000 |
| Tipos de cuantización | FP8 de grano fino con tamaño de bloque 128 (esta variante); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador visual, entrenado en dos etapas: preentrenamiento y postentrenamiento. La dimensión oculta es de 5120, con 64 capas y un embedding de tokens de 248 320 (con padding). El layout híbrido alterna bloques de Gated DeltaNet (atención lineal con 48 cabezas para V y 16 para QK, dimensión de cabeza 128) y Gated Attention (24 cabezas para Q y 4 para KV, dimensión de cabeza 256, dimensión de RoPE 64). La red feed-forward tiene dimensión intermedia de 17 408 y la salida LM es de 248 320. Incluye entrenamiento con Multi-Token Prediction (MTP) en varios pasos, una técnica que puede acelerar la decodificación especulativa.

No se detalla en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona que el modelo base fue postentrenado y que esta variante FP8 conserva el comportamiento del original, pero no ofrece detalles sobre el proceso de alineación. La innovación técnica destacable es la combinación de atención lineal (Gated DeltaNet) con atención completa en un patrón repetido, junto con MTP, orientada a mejorar la eficiencia en contextos largos y la velocidad de generación.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento activado por defecto, desactivable por petición y con profundidad de razonamiento ajustable mediante `reasoning_effort`.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Codificación y tareas de trabajo profesional, con mejoras sustanciales respecto a generaciones anteriores según el autor.
- Ejecución agéntica: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Soporte de tool calling y function calling, con herramientas integradas en la versión alojada de Qwen Cloud.
- Razonamiento multi-paso y tareas de horizonte largo.
- Retención del contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Capacidades multilingües: no se especifican los idiomas concretos en la información disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262 144 tokens nativos, manteniendo el hilo de la conversación y el razonamiento previo mediante `preserve_thinking`.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para revisión de código, generación de tests y corrección automática de errores, con un modo de razonamiento ajustable según la complejidad de la tarea.
- Análisis de documentos técnicos y diagramas STEM: al ser un modelo nativo de visión-lenguaje, puede extraer información de figuras, tablas y esquemas en artículos científicos o manuales técnicos.
- Procesamiento de vídeos de larga duración: su soporte para vídeos de hasta una hora permite resumir reuniones, generar actas o detectar incidencias en grabaciones de vigilancia.
- Agentes autónomos de investigación: la planificación autónoma y el manejo de retroalimentación del entorno lo hacen adecuado para tareas de búsqueda y síntesis de información en múltiples pasos.
- Asistentes de desarrollo integrados en el IDE: la compatibilidad con harnesses y herramientas populares facilita su integración en entornos de desarrollo existentes para autocompletado, explicación de código y refactorización.
- Despliegue en infraestructura con memoria limitada: la cuantización FP8 con bloques de 128 reduce el peso a 30,9 GB, permitiendo servir el modelo en GPUs de 40-48 GB con vLLM o SGLang.

## Benchmarks y rendimiento

La model card del autor incluye una tabla de resultados de benchmarks de texto que compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por categorías como Coding y Agentic terminal coding. Sin embargo, en la información proporcionada la tabla aparece truncada y no se incluyen los valores numéricos de las métricas. Por tanto, no se pueden presentar resultados concretos.

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 30,9 GB en FP8, por lo que se recomienda un mínimo de 32 GB de VRAM para cargar los pesos, más memoria adicional para el contexto y el codificador visual; con contexto largo (262K tokens) el consumo de KV cache puede ser significativo.
- GPU recomendadas: A100 80GB, H100 80GB, L40S 48GB, RTX 6000 Ada 48GB; en GPUs de 40-48 GB puede caber con FP8 y contextos moderados.
- ¿Cabe en consumer GPU? En RTX 4090 (24 GB) no cabe en FP8 sin cuantización adicional; sería necesario recurrir a cuantizaciones de 4 bits (no incluidas en este repositorio) o a descarga parcial en CPU.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el uso de MTP y atención lineal (Gated DeltaNet) sugiere mejoras en decodificación, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-FP8 (esta ficha) | 27,8B | 262K nativo, hasta 1M | Apache 2.0 | Hugging Face (thhqm) | Cuantización FP8, multimodal |
| Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible | Generación anterior de la familia Qwen; incluido en la tabla de benchmarks del autor |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | Modelo de la familia Qwen; incluido en la tabla de benchmarks del autor |
| Muse Glimmer-30B | No disponible | No disponible | No disponible | No disponible | Modelo comparable de ~30B; incluido en la tabla de benchmarks del autor |

No se dispone de datos suficientes sobre parámetros, contexto, rendimiento o licencia de los modelos alternativos en la información proporcionada, por lo que la comparativa se limita a lo indicado en la model card.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; como modelo entrenado con datos web a gran escala, es probable que herede sesgos sociales, culturales y lingüísticos, pero no hay confirmación oficial.
- Riesgo de alucinación: no se cuantifica en la model card; el modo de razonamiento activado por defecto puede aumentar la confianza en respuestas incorrectas si no se valida la salida.
- Limitaciones de contexto o idioma: el contexto nativo es de 262 144 tokens, pero el rendimiento en contextos cercanos a 1M puede degradarse; no se especifican los idiomas soportados, lo que impide garantizar calidad multilingüe.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, pero el repositorio es una cuantización no oficial publicada por un tercero (thhqm), no por el equipo Qwen; conviene verificar la procedencia y los términos del modelo base.
- Caveats para producción: el repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; la cuantización FP8 puede introducir pequeñas divergencias numéricas respecto al original; el soporte de vídeo de hasta una hora puede requerir memoria y tiempo de procesamiento considerables; la versión alojada en Qwen Cloud con contexto de 1M y herramientas integradas está anunciada como "coming soon", no disponible aún.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thhqm/Qwen3.8-27B-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Qwen Cloud (servicio alojado): https://www.qwencloud.com
- Overview de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
