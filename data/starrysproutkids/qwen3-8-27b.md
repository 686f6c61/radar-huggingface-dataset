# starrysproutkids/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión desarrollado por el equipo Qwen (Alibaba), publicado en Hugging Face bajo una cuenta de terceros (`starrysproutkids`) que replica los artefactos oficiales. Se trata de un modelo denso de 27 000 millones de parámetros (27 781 427 952 exactos según los pesos en safetensors) que forma parte de la generación Qwen3.8, la más capaz de la familia de modelos abiertos de Qwen hasta la fecha. El modelo está diseñado para cargas de trabajo de codificación, trabajo profesional, investigación y tareas agénticas de horizonte largo.

La arquitectura combina atención lineal (Gated DeltaNet) con atención completa con compuertas (Gated Attention) en un patrón híbrido de 64 capas, e incorpora predicción multi-token (MTP) entrenada con múltiples pasos. Es un modelo nativamente multimodal (imagen y vídeo) con control flexible del modo de razonamiento (*thinking*), que puede activarse o desactivarse por petición y ajustarse en profundidad mediante `reasoning_effort`. El contexto nativo es de 262 144 tokens, extensible hasta 1 000 000.

Su relevancia actual radica en que ofrece capacidades de nivel frontera en un tamaño compacto y desplegable en infraestructura propia, con licencia Apache 2.0 y compatibilidad con los principales motores de inferencia (Transformers, vLLM, SGLang, TokenSpeed). El repositorio ocupa 55,6 GB y fue creado el 11 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con Vision Encoder; 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27 781 427 952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible en la información proporcionada (pesos publicados en safetensors; compatible con cuantización vía vLLM/SGLang) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (Transformers) |

Datos arquitectónicos adicionales: dimensión oculta 5120; embedding de tokens 248 320 (con padding); 64 capas; FFN con dimensión intermedia 17 408; salida LM 248 320 (con padding). Gated DeltaNet: 48 cabezas de atención lineal para V y 16 para QK, dimensión de cabeza 128. Gated Attention: 24 cabezas para Q y 4 para KV, dimensión de cabeza 256, dimensión de RoPE 64. Entrenado con MTP de múltiples pasos.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que alterna bloques de atención lineal (Gated DeltaNet) con bloques de atención completa con compuertas (Gated Attention) en una proporción de 3:1 dentro de cada uno de los 16 grupos de capas. Esta combinación busca reducir el coste computacional y de memoria de la atención en contextos largos (gracias a la atención lineal) manteniendo la calidad de recuperación de la atención completa. La inclusión de MTP (Multi-Token Prediction) entrenada con múltiples pasos permite decodificación especulativa y mejora el throughput en inferencia. El modelo incorpora además un codificador de visión para el procesamiento nativo de imágenes y vídeo.

El modelo ha pasado por fases de preentrenamiento y postentrenamiento (pre-training & post-training), aunque la información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas de RLHF o DPO. Las innovaciones técnicas destacadas son el control flexible del razonamiento (`reasoning_effort` para ajustar la profundidad, `preserve_thinking` para retener el contexto de razonamiento de mensajes históricos) y la compatibilidad con arneses y herramientas de desarrollo populares.

## Capacidades

- Generación de texto y razonamiento con modo *thinking* activado por defecto, desactivable por petición y ajustable en profundidad mediante `reasoning_effort`.
- Codificación y tareas de terminal agénticas (evaluado en Terminal Bench 2.1 con el arnés Terminus).
- Trabajo profesional e investigación de horizonte largo.
- Ejecución agéntica autónoma: planificación reforzada y mejor manejo del feedback del entorno para completar tareas de extremo a extremo.
- Comprensión visión-lenguaje nativa: imágenes y vídeo, desde diagramas STEM y documentos hasta vídeos de una hora de duración.
- Retención del contexto de razonamiento entre mensajes históricos mediante `preserve_thinking`.
- Compatibilidad con múltiples motores de inferencia y arneses de desarrollo (Transformers, vLLM, SGLang, TokenSpeed).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible, aunque la orientación agéntica y la mención de "herramientas integradas oficiales" en la versión alojada sugieren compatibilidad.

## Casos de uso

- Automatización de tareas de terminal y CI/CD: el modelo puede operar como agente que interpreta comandos, ejecuta pasos y procesa el feedback del entorno, adecuado por su entrenamiento específico en Terminal Bench 2.1 y su planificación autónoma.
- Asistencia de codificación en producción: con 262 144 tokens de contexto nativo puede ingerir repositorios completos o múltiples ficheros y mantener el hilo a lo largo de sesiones largas de depuración.
- Análisis de documentos técnicos y diagramas STEM: el codificador de visión permite extraer información de figuras, esquemas y documentos escaneados sin pipeline OCR separado.
- Procesamiento de vídeo de larga duración: soporta vídeos de hasta una hora, útil para resumen, indexación o control de calidad de contenido audiovisual.
- Investigación asistida: el modo *thinking* con profundidad ajustable permite equilibrar coste y calidad según la fase del flujo de investigación (exploración rápida frente a análisis profundo).
- Agentes multi-paso de horizonte largo: la retención de contexto de razonamiento (`preserve_thinking`) y el contexto extensible a 1M tokens permiten mantener coherencia en flujos de decenas de pasos.
- Despliegue en infraestructura propia: al ser un modelo denso de 27B con licencia Apache 2.0, encaja en entornos con requisitos de soberanía de datos o sin acceso a APIs externas.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa (parcialmente truncada en la información recibida) frente a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. El único dato legible corresponde a la categoría Coding / Agentic terminal coding (Terminal Bench 2.1, Terminus), pero los valores numéricos de las celdas no están disponibles en el extracto proporcionado.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | No disponible (tabla truncada) | No disponible | No disponible | No disponible | No disponible |

No se han podido extraer resultados numéricos adicionales de la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55,6 GB solo para pesos, más overhead de KV cache y activaciones; se recomienda un mínimo de 80 GB.
- Cuantización a 8 bits: ~28 GB de pesos; a 4 bits: ~14 GB de pesos, más overhead.
- GPU recomendadas para BF16: A100 80GB, H100 80GB, H200; para servir en producción con contexto largo se aconsejan múltiples GPU o nodos con NVLink.
- GPU de consumo: en cuantización 4 bits podría caber en una RTX 4090 (24 GB) o RTX 5090, aunque con contexto reducido; en BF16 no cabe en GPU de consumo.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, TokenSpeed (según la model card).
- Latencia y throughput: no disponibles en la información proporcionada. La inclusión de MTP sugiere mejoras de throughput mediante decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27B (denso) | 262K nativo / 1M extensible | Apache 2.0 | Safetensors | Multimodal (imagen/vídeo), thinking control, MTP |
| Qwen3.6-27B | 27B (denso, según nomenclatura) | No disponible | No disponible | No disponible | Generación anterior de la familia; comparado en la model card |
| Muse Glimmer-30B | 30B (según nomenclatura) | No disponible | No disponible | No disponible | Comparado en la model card; datos no disponibles |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | Variante "Plus" de la familia; comparado en la model card |

Los datos de rendimiento comparativo no están disponibles en el extracto recibido, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El repositorio está publicado por una cuenta de terceros (`starrysproutkids`) con 0 descargas y 0 likes; no se confirma que sea el canal oficial de Qwen, por lo que conviene verificar la procedencia de los pesos antes de usarlos en producción.
- No se especifican los idiomas soportados; el rendimiento multilingüe es desconocido.
- No se detallan los datos de entrenamiento (composición, número de tokens) ni el proceso de alineación (RLHF/DPO), lo que dificulta evaluar sesgos y riesgos de alucinación.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; el modo *thinking* activado por defecto puede aumentar el coste de inferencia si no se ajusta `reasoning_effort`.
- El contexto extensible a 1M tokens puede degradar la calidad y disparar el consumo de memoria KV; se recomienda validar en el rango de uso real.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), la model card menciona una versión alojada en Qwen Cloud con funciones adicionales (contexto de 1M por defecto, herramientas integradas), lo que sugiere que algunas capacidades pueden no estar disponibles en la versión de pesos abiertos.
- La tabla de benchmarks está truncada en la información recibida; no se pueden verificar los resultados numéricos.
- El tamaño del repositorio (55,6 GB) y los requisitos de VRAM limitan el despliegue a infraestructura con GPU de 80 GB o cuantización agresiva.

## Enlaces

- Hugging Face: https://huggingface.co/starrysproutkids/Qwen3.8-27B
- Qwen Cloud (servicio alojado, próximamente): https://www.qwencloud.com
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
