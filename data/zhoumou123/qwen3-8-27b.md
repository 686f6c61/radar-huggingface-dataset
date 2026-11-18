# zhoumou123/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje y visión de tipo denso, publicado en el repositorio de Hugging Face `zhoumou123/Qwen3.8-27B`, que se presenta como parte de la familia Qwen3.8 y se construye sobre la base arquitectónica de Qwen3.5. Con 27.781.427.952 parámetros reales (27B nominales), está diseñado como un modelo compacto y desplegable que integra de forma nativa comprensión de imágenes y vídeo, junto con control flexible del modo de razonamiento. El pipeline declarado es `image-text-to-text` y la licencia es Apache 2.0.

El modelo emplea una arquitectura híbrida de atención: 64 capas organizadas en un patrón de 16 bloques que combinan tres capas de Gated DeltaNet (atención lineal) seguidas de una capa de Gated Attention (atención completa con GQA). Incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que habilita decodificación especulativa y mejora el throughput. La longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000.

Su relevancia radica en que combina capacidades de agente autónomo, coding, trabajo profesional e investigación con un tamaño que cabe en hardware de una sola GPU de gama alta, y con soporte declarado para Transformers, vLLM, SGLang y TokenSpeed. No obstante, el repositorio no incluye información sobre composición del dataset de entrenamiento, idiomas soportados ni detalles del proceso de post-entrenamiento (RLHF/DPO).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con vision encoder; híbrida Gated DeltaNet (atención lineal) + Gated Attention (GQA) |
| Parametros totales | 27.781.427.952 (27B nominales) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se detallan cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con vision encoder de 64 capas y dimensión oculta de 5120. El layout oculto se organiza en 16 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. La Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention usa 24 cabezas para Q y 4 para KV (GQA), con dimensión de cabeza 256 y RoPE de dimensión 64. La FFN tiene dimensión intermedia de 17.408. El embedding de tokens y la salida LM tienen 248.320 entradas (con padding). El entrenamiento incluye MTP (Multi-Token Prediction) con múltiples pasos, lo que permite decodificación especulativa.

El modelo ha pasado por pre-entrenamiento y post-entrenamiento, pero la model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron RLHF, DPO u otras técnicas de alineación. Tampoco se detalla el proceso de entrenamiento del vision encoder ni la resolución o duración de vídeo soportada más allá de la mención a "vídeos de escala horaria". La innovación técnica más destacable es la combinación de atención lineal (Gated DeltaNet) con atención completa en un patrón 3:1, que reduce el coste computacional en contextos largos, junto con el control flexible del razonamiento mediante `reasoning_effort` y `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto, desactivable por petición y ajustable en profundidad mediante `reasoning_effort`.
- Comprensión nativa de imágenes y vídeo: diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Coding y tareas de terminal agénticas (Terminal Bench 2.1).
- Ejecución de agentes autónomos con planificación multi-paso y manejo de feedback del entorno.
- Soporte de tool calling / function calling (mencionado implícitamente vía "official built-in tools" en la versión alojada; no se detalla el formato exacto en el repo).
- Retención de contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Compatibilidad con harnesses y herramientas de desarrollo populares ("downstream compatibility").

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens nativos, manteniendo el hilo de la conversación y el razonamiento previo mediante `preserve_thinking` sin perder coherencia en sesiones extensas.
- **Generación de código en producción**: con soporte para vLLM y SGLang y capacidades de coding mejoradas, puede integrarse en pipelines de CI/CD para revisión de código, generación de tests y corrección automática de errores, usando tool calling para consultar repositorios o ejecutar comandos.
- **Agentes autónomos de terminal**: su rendimiento en Terminal Bench 2.1 y su planificación multi-paso lo hacen adecuado para tareas de administración de sistemas, depuración de entornos y ejecución de comandos con feedback del entorno.
- **Análisis de documentos técnicos y diagramas**: al ser un modelo visión-lenguaje nativo, puede extraer información de diagramas STEM, planos, gráficos y documentos escaneados, respondiendo preguntas sobre su contenido sin necesidad de OCR externo.
- **Procesamiento de vídeo de larga duración**: la comprensión de vídeos de escala horaria permite resumir reuniones, analizar grabaciones de clases o extraer eventos de material audiovisual extenso en una sola pasada.
- **Investigación asistida**: con contexto extensible a 1M tokens y modo de razonamiento ajustable, puede sintetizar literatura científica, comparar metodologías y generar hipótesis a partir de corpus grandes de papers.
- **Despliegue en infraestructura propia**: al ser un modelo denso de 27B con licencia Apache 2.0, puede servirse en una sola GPU de 80 GB (A100/H100) o en configuraciones cuantizadas en GPUs consumer, sin dependencia de APIs externas.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks con formato HTML que en la información proporcionada aparece truncada; solo se identifica la fila "Agentic terminal coding — Terminal Bench 2.1 (Terminus)" y la cabecera de columnas comparativas (Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B, Opus4.6 Max), pero los valores numéricos no están disponibles en el extracto. No se han podido recuperar resultados numéricos de MMLU, HumanEval, GSM8K ni del resto de benchmarks.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia en BF16**: aproximadamente 55,6 GB de pesos (tamaño del repo) más overhead de activaciones y KV cache; se recomienda una GPU de 80 GB (A100 80GB, H100 80GB) para contexto largo.
- **Cuantización**: no se detallan cuantizaciones oficiales; en GGUF/AWQ a 4 bits el modelo podría ocupar en torno a 15-16 GB, lo que permitiría ejecución en RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque con posible degradación en contexto largo.
- **GPU recomendadas**: A100 80GB, H100 80GB para BF16 con contexto completo; RTX 4090/3090 para cuantizaciones de 4-8 bits.
- **Opciones de despliegue**: Transformers, vLLM, SGLang, TokenSpeed (según la model card).
- **Latencia y throughput**: no disponibles. La presencia de MTP (Multi-Token Prediction) sugiere mejoras en throughput mediante decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Visión | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27B (denso) | 262K nativo / 1M extensible | Apache 2.0 | Sí (imagen y vídeo) | Hugging Face |
| Qwen3.6-27B | 27B (no detallado) | no disponible | no disponible | no disponible | Referenciado en benchmarks |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Referenciado en benchmarks |
| Muse Glimmer-30B | 30B (no detallado) | no disponible | no disponible | no disponible | Referenciado en benchmarks |

Los modelos comparables citados en la propia model card (Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B, Opus4.6 Max) aparecen únicamente como columnas de la tabla de benchmarks, sin que se disponga de sus especificaciones técnicas ni de los valores numéricos de la comparación en la información proporcionada. No se dispone de datos suficientes para una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- **Sesgos conocidos**: no disponibles; la model card no documenta evaluación de sesgos ni datos de alineación.
- **Riesgo de alucinación**: no cuantificado; como modelo generativo de 27B, es susceptible de alucinación, especialmente en modo thinking con `reasoning_effort` alto y en tareas de investigación abierta.
- **Idiomas**: no se especifica la cobertura lingüística; no se puede garantizar calidad fuera del inglés y chino sin datos adicionales.
- **Licencia**: Apache 2.0 permite uso comercial, pero el repositorio es de un tercero (`zhoumou123`) y no un lanzamiento oficial verificado de Qwen; conviene confirmar la procedencia de los pesos antes de usos en producción.
- **Contexto**: aunque se declara extensible a 1M tokens, el rendimiento más allá de 262K no está validado en la información disponible.
- **Repositorio sin adopción**: 0 descargas y 0 likes en el momento de la consulta, lo que impide validar la calidad del artefacto por parte de la comunidad.
- **Datos de entrenamiento opacos**: sin información sobre tokens, composición del dataset ni técnicas de alineación, lo que dificulta evaluar riesgos de contaminación o comportamiento en dominios específicos.
- **Benchmarks incompletos**: la tabla de resultados aparece truncada; no se pueden verificar las afirmaciones de mejora frente a generaciones anteriores.

## Enlaces

- Hugging Face: https://huggingface.co/zhoumou123/Qwen3.8-27B
- Qwen Cloud (servicio alojado, próximamente): https://www.qwencloud.com
- Overview del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
