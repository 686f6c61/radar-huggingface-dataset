# Svenuks/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión publicado por Svenuks en Hugging Face, construido sobre la arquitectura `qwen3_5` y distribuido con licencia Apache 2.0. Se trata de un modelo denso de 27 781 427 952 parámetros (27,8B) que combina atención lineal Gated DeltaNet con atención completa en un diseño híbrido de 64 capas, y que integra comprensión nativa de imagen y vídeo dentro del mismo transformer. El pipeline declarado es `image-text-to-text`, por lo que el modelo está pensado para tareas multimodales de entrada imagen/vídeo y salida de texto.

La relevancia del modelo radica en su ventana de contexto: 262 144 tokens de forma nativa, extensible hasta 1 000 000, lo que lo sitúa en la categoría de modelos de contexto largo orientados a tareas agénticas de horizonte extendido. Incorpora control flexible de "thinking mode" (activable o desactivable por petición, con ajuste de profundidad mediante `reasoning_effort` y retención de contexto de razonamiento histórico vía `preserve_thinking`), además de Multi-Token Prediction (MTP) entrenado con múltiples pasos, una técnica que puede acelerar la decodificación.

El repositorio ocupa 55,6 GB en safetensors, lo que es coherente con pesos en precisión completa (BF16) para 27,8B parámetros más el codificador de visión. El modelo se presenta como compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed, y el autor anuncia una versión alojada en Qwen Cloud con 1M de contexto por defecto y herramientas integradas. No se han publicado resultados de benchmarks verificables en la información disponible más allá de la tabla HTML incompleta de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con Vision Encoder; layout 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27 781 427 952 (27,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible en la información proporcionada (pesos publicados en safetensors, presumiblemente BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

El modelo emplea un transformer causal con codificador de visión y un diseño de capas híbrido poco habitual: 64 capas organizadas en 16 bloques, cada uno compuesto por tres subcapas de Gated DeltaNet (atención lineal) seguidas de una subcapa de Gated Attention (atención completa). La dimensión oculta es 5120 y la FFN tiene dimensión intermedia de 17 408. En la parte de atención lineal, Gated DeltaNet usa 48 cabezas para V y 16 para QK con dimensión de cabeza 128; en la parte de atención completa, Gated Attention usa 24 cabezas para Q y 4 para KV con dimensión de cabeza 256 y RoPE de dimensión 64. El vocabulario (embedding y salida) es de 248 320 tokens con padding. Esta combinación de atención lineal y atención completa busca reducir el coste computacional en contextos muy largos manteniendo la calidad de recuperación de información.

El entrenamiento consta de fases de pre-entrenamiento y post-entrenamiento (la model card indica "Pre-training & Post-training", sin detallar número de tokens ni composición del dataset). Se entrena con Multi-Token Prediction (MTP) en varios pasos, lo que permite predecir varios tokens por paso y potencialmente acelerar la inferencia. No se especifica en la información disponible si se aplicaron RLHF, DPO u otras técnicas de alineación, ni se detalla la composición del corpus multimodal. El modelo incorpora un modo de razonamiento ("thinking") activado por defecto, desactivable por petición, con parámetros `reasoning_effort` y `preserve_thinking` para controlar la profundidad y la retención del razonamiento histórico.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo "thinking" activado por defecto y controlable por petición.
- Comprensión nativa de imágenes y vídeos (pipeline `image-text-to-text`), incluyendo diagramas STEM, documentos y vídeos de hasta una hora según la model card.
- Programación y tareas de coding agéntico, con soporte declarado para "harnesses" y herramientas de desarrollo populares.
- Ejecución agéntica de horizonte largo: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Control flexible del razonamiento mediante `reasoning_effort` (profundidad) y `preserve_thinking` (retención del contexto de razonamiento en mensajes históricos).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: la model card menciona herramientas integradas en la versión alojada de Qwen Cloud, pero no detalla el soporte nativo en los pesos abiertos.
- Multi-Token Prediction (MTP) entrenado con múltiples pasos, orientado a acelerar la decodificación.

## Casos de uso

- Análisis de documentos técnicos y científicos: el modelo puede procesar diagramas STEM, figuras y texto en una sola pasada gracias a su codificador de visión y a los 262 144 tokens de contexto nativo, lo que permite introducir papers completos con sus figuras.
- Comprensión de vídeo de larga duración: la model card declara soporte para vídeos de hasta una hora, útil para resúmenes de reuniones, análisis de grabaciones de clases o revisión de material audiovisual.
- Automatización de tareas de coding en terminal: con capacidades de coding agéntico y manejo de retroalimentación del entorno, encaja en flujos de trabajo tipo agente que ejecutan comandos, interpretan errores y corrigen código de forma iterativa.
- Agentes autónomos de horizonte largo: la ventana de contexto extensible a 1M tokens y la retención de razonamiento histórico (`preserve_thinking`) permiten mantener el estado de tareas complejas de múltiples pasos sin perder el hilo.
- Asistentes de atención al cliente multimodal: puede gestionar conversaciones multi-turno con capturas de pantalla o imágenes adjuntas, manteniendo contexto largo entre interacciones.
- Investigación y análisis de repositorios: la combinación de contexto largo y capacidades de código permite revisar bases de código extensas, generar documentación o auditar cambios en pipelines de CI/CD.
- Extracción de información de documentos escaneados: al ser un modelo nativo de imagen-texto, puede procesar formularios, facturas o informes en PDF renderizados sin depender de un OCR externo.

## Benchmarks y rendimiento

La model card incluye una tabla HTML de resultados comparativos (Qwen3.8-27B frente a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max) con categorías como "Coding" y "Agentic terminal coding" (Terminal Bench 2.1), pero el contenido de la tabla está truncado en la información disponible y no permite extraer valores numéricos fiables. No se han publicado resultados de benchmarks verificables en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,8B parámetros, en BF16 se requieren aproximadamente 55,6 GB solo para pesos, más overhead de KV cache y activaciones; en cuantización de 8 bits, en torno a 28-30 GB; en 4 bits, en torno a 15-16 GB (estimaciones, no confirmadas en la información disponible).
- GPU recomendadas: para BF16, A100 80GB, H100 80GB o configuraciones multi-GPU; para cuantización 8 bits, una RTX 4090 de 24 GB queda justa y podría requerir offloading; para 4 bits, una RTX 4090 o RTX 3090 de 24 GB podría ser suficiente para pesos, con margen limitado para contexto largo.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4 u 8 bits en GPUs de 24 GB, aunque el contexto de 262K tokens exige una KV cache considerable que puede desbordar la VRAM.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento con MTP sugiere que la decodificación especulativa podría mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,8B (denso) | 262K nativo, hasta 1M | Apache 2.0 | safetensors | Híbrido Gated DeltaNet + Gated Attention, visión nativa, MTP |
| Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible | Citado en la model card como generación anterior; sin datos verificables |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | Citado en la model card; sin datos verificables |
| Muse Glimmer-30B | ~30B (según nombre) | No disponible | No disponible | No disponible | Citado en la model card; sin datos verificables |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible | Citado en la model card; sin datos verificables |

No se dispone de datos verificables de rendimiento comparado para ninguno de los modelos citados en la tabla de la model card, por lo que la comparativa se limita a parámetros, contexto y licencia cuando están disponibles.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de seguridad; se desconoce el comportamiento del modelo en dominios sensibles.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento largo con modo "thinking" activado; no se han publicado evaluaciones de fidelidad factual.
- Idiomas soportados no documentados: no se puede confirmar la calidad en castellano ni en otras lenguas distintas del inglés.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación sobre el origen de los datos de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-14), lo que indica que no hay validación comunitaria ni reportes independientes de uso.
- El contexto de 262K tokens exige una KV cache muy grande; en GPUs de consumo con cuantización agresiva puede degradarse el rendimiento o producirse OOM.
- La compatibilidad con harnesses y herramientas se declara de forma genérica en la model card, sin lista concreta de integraciones verificadas.
- No se especifican los tipos de cuantización soportados ni si existen versiones GGUF oficiales, lo que puede complicar el despliegue en llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Svenuks/Qwen3.8-27B
- Qwen Cloud (servicio alojado anunciado): https://www.qwencloud.com
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
