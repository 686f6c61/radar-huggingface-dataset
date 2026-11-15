# Tanaka033/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, publicado en Hugging Face por el usuario Tanaka033 bajo licencia Apache 2.0. Se presenta como la generación más capaz de la familia Qwen de modelos abiertos, construida sobre la base arquitectónica de Qwen3.5 y orientada a tareas de programación, trabajo profesional, investigación y agentes autónomos de largo horizonte. Con 27 781 427 952 parámetros reales (27B) y un diseño denso, está pensado para despliegues compactos sin sacrificar capacidades avanzadas.

El modelo es nativamente multimodal (image-text-to-text): comprende imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración. Incorpora control flexible del razonamiento (*thinking mode*) activado por defecto, desactivable por petición, con ajuste de profundidad mediante `reasoning_effort` y retención del contexto de razonamiento histórico mediante `preserve_thinking`.

Su relevancia actual radica en combinar un contexto nativo de 262 144 tokens, extensible hasta 1 000 000, con una arquitectura híbrida de atención lineal (Gated DeltaNet) y atención completa (Gated Attention), además de Multi-Token Prediction (MTP). El repositorio ocupa 55,6 GB y los pesos están en formato safetensors, compatibles con Transformers, vLLM, SGLang y TokenSpeed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida Gated DeltaNet (atención lineal) + Gated Attention |
| Parametros totales | 27 781 427 952 (27B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 000 000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |
| Dimension oculta | 5120 |
| Numero de capas | 64 |
| Layout oculto | 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Token embedding | 248 320 (padded) |
| Cabezas de atencion lineal (Gated DeltaNet) | 48 para V, 16 para QK; dimension de cabeza 128 |
| Cabezas de atencion (Gated Attention) | 24 para Q, 4 para KV; dimension de cabeza 256; RoPE dim 64 |
| Dimension intermedia FFN | 17 408 |
| MTP (Multi-Token Prediction) | entrenado con múltiples pasos |
| Tamano del repo | 55,6 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con codificador de visión integrado, que combina dos mecanismos de atención en un patrón repetido: por cada bloque de cuatro capas, tres usan Gated DeltaNet (atención lineal con 48 cabezas para V y 16 para QK, dimensión de cabeza 128) y una usa Gated Attention completa (24 cabezas para Q, 4 para KV, dimensión de cabeza 256, RoPE de 64 dimensiones). Esta disposición híbrida busca reducir el coste computacional en contextos largos manteniendo la calidad de la atención completa. El FFN tiene dimensión intermedia de 17 408 y el vocabulario (embedding y salida LM) es de 248 320 tokens con padding.

El modelo ha pasado por pre-entrenamiento y post-entrenamiento, e incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que habilita decodificación especulativa nativa y mejora el throughput. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. La model card menciona mejoras en planificación autónoma, manejo de retroalimentación del entorno y compatibilidad con *harnesses* y herramientas de desarrollo populares.

## Capacidades

- Generación de texto y razonamiento con *thinking mode* activado por defecto, desactivable por petición.
- Ajuste de profundidad de razonamiento mediante el parámetro `reasoning_effort`.
- Retención del contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Comprensión nativa de imágenes y vídeos (image-text-to-text), incluyendo diagramas STEM, documentos y vídeos de hasta una hora.
- Programación y tareas de terminal agénticas (evaluado en Terminal Bench 2.1).
- Ejecución de agentes autónomos con planificación y manejo de retroalimentación del entorno.
- Tareas de trabajo profesional e investigación.
- Compatibilidad con Transformers, vLLM, SGLang y TokenSpeed.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible (la model card menciona "official built-in tools" solo para la versión alojada en Qwen Cloud).
- Capacidades multilingües: no disponible.

## Casos de uso

- **Agentes de codificación autónomos en terminal**: el modelo está evaluado específicamente en Terminal Bench 2.1 (Terminus) y declara mejoras en planificación autónoma y manejo de retroalimentación del entorno, lo que lo hace adecuado para agentes que ejecutan comandos, interpretan errores y corrigen código de forma iterativa.
- **Análisis de documentos técnicos y diagramas STEM**: gracias a su codificador de visión nativo, puede procesar figuras, esquemas y documentos para responder preguntas o extraer información estructurada en flujos de investigación.
- **Comprensión de vídeos de larga duración**: soporta vídeos de hasta una hora, útil para resumen automático de reuniones, análisis de grabaciones o extracción de eventos en material audiovisual.
- **Asistentes de investigación con contexto largo**: con 262 144 tokens nativos (extensibles a 1M), puede mantener conversaciones multi-turno sobre corpus extensos, como varios artículos o bases de código completas, sin truncar información.
- **Automatización de tareas profesionales multi-paso**: su enfoque en "long-horizon agentic tasks" y el control de `reasoning_effort` permiten ajustar el coste de razonamiento según la complejidad de la tarea, por ejemplo en pipelines de generación de informes o análisis de datos.
- **Despliegue en infraestructura propia con vLLM/SGLang**: al ser compatible con estos motores de inferencia y tener MTP para decodificación especulativa, encaja en servicios de inferencia autoalojados que requieran throughput alto y contexto largo.
- **Integración en herramientas de desarrollo**: la model card destaca "broader support for popular harnesses and development tools", lo que facilita su incorporación en entornos de CI/CD o asistentes de IDE.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por categorías (Coding, etc.). Sin embargo, en la información proporcionada solo se ha extraído la cabecera y la primera fila parcial ("Agentic terminal coding — Terminal Bench 2.1 (Terminus)"), sin los valores numéricos correspondientes. Por tanto, no es posible presentar resultados cuantitativos fiables.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Resto de benchmarks de la tabla | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible los valores numéricos de los benchmarks. No se inventan cifras.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 27,8B parámetros en safetensors (55,6 GB en el repo, presumiblemente fp16/bf16), se requieren aproximadamente 56 GB de VRAM para pesos en precisión completa. En cuantización de 8 bits, ~28 GB; en 4 bits, ~14-16 GB (estimaciones basadas en el número de parámetros, no confirmadas por el autor).
- **GPU recomendadas**: para precisión completa, A100 80GB, H100 80GB o múltiples GPU de 24-48 GB. Para cuantización 4/8 bits, RTX 4090 (24 GB) o A6000 (48 GB) podrían ser suficientes, aunque no hay confirmación oficial.
- **Consumer GPU**: posible en RTX 4090 con cuantización agresiva (4 bits), sujeto a validación; no confirmado.
- **Opciones de despliegue**: Transformers, vLLM, SGLang, TokenSpeed (según la model card). No se mencionan llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles. La presencia de MTP sugiere decodificación especulativa que podría mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27B (denso) | 262 144 nativo / 1M extensible | Apache 2.0 | Sí (imagen y vídeo) | Hugging Face (Tanaka033) |
| Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible | Mencionado en la model card |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Mencionado en la model card |
| Muse Glimmer-30B | ~30B | no disponible | no disponible | no disponible | Mencionado en la model card |
| Opus4.6 Max | no disponible | no disponible | no disponible | no disponible | Mencionado en la model card |

Los datos de los modelos comparables no están disponibles en la información proporcionada más allá de su mención en la tabla de benchmarks. No se dispone de resultados numéricos para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- **Sesgos conocidos**: no disponible; no se documentan evaluaciones de sesgo en la información proporcionada.
- **Riesgo de alucinación**: inherente a los modelos de lenguaje; no se aportan tasas ni evaluaciones específicas.
- **Limitaciones de contexto o idioma**: el contexto nativo es de 262 144 tokens; la extensión a 1M puede degradar el rendimiento y no está confirmada su calidad. Los idiomas soportados no están especificados.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de conservar avisos de licencia y atribución.
- **Caveats para producción**: el modelo ha sido publicado por un usuario individual (Tanaka033), no por el equipo oficial de Qwen; la autoría y procedencia de los pesos no están verificadas en la información disponible. El repositorio tiene 0 descargas y 0 likes, lo que sugiere falta de validación comunitaria. La versión alojada en Qwen Cloud con contexto de 1M y herramientas integradas está "coming soon", por lo que no está disponible aún.
- **Compatibilidad**: se declara compatible con Transformers, vLLM, SGLang y TokenSpeed; no se confirma soporte para llama.cpp, Ollama o TGI.

## Enlaces

- Hugging Face: https://huggingface.co/Tanaka033/Qwen3.8-27B
- Qwen Cloud (servicio alojado, próximamente): https://www.qwencloud.com
- Qwen3.8-27B Overview en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
