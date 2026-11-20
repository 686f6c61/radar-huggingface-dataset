# Striker1123/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso con codificador de visión, publicado en Hugging Face bajo la cuenta Striker1123 y etiquetado como parte de la familia Qwen3.8. Según la model card, se presenta como la generación más capaz de la familia de modelos abiertos Qwen hasta la fecha, construida sobre la base arquitectónica de Qwen3.5 y orientada a tareas de programación, trabajo profesional, investigación y agentes de horizonte largo. El repositorio contiene pesos en formato Transformers (safetensors) con 27.781.427.952 parámetros reales según el índice de safetensors, y un tamaño de repositorio de 55,6 GB.

El modelo es multimodal nativo (pipeline image-text-to-text), con soporte declarado para comprensión de imágenes y vídeos, incluidos diagramas STEM, documentos y vídeos de hasta una hora de duración. Incorpora control flexible de razonamiento: el modo thinking está activo por defecto, puede desactivarse por petición, la profundidad se ajusta mediante `reasoning_effort` y el contexto de razonamiento histórico se preserva con `preserve_thinking`. La longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000.

La relevancia del modelo radica en su combinación de tamaño compacto (27B densos), contexto muy largo, capacidades visión-lenguaje y un enfoque explícito hacia tareas agénticas de múltiples pasos con finalización fiable. La licencia Apache 2.0 facilita su adopción comercial. No obstante, la información disponible es limitada: el repositorio no tiene descargas ni likes, la model card contiene tablas de benchmarks con datos truncados y no se especifican los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión; layout híbrido de 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); compatible con vLLM, SGLang y TokenSpeed |

Otros datos técnicos declarados: dimensión oculta 5120, embedding de tokens 248.320 (padded), 64 capas, Gated DeltaNet con 48 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128, Gated Attention con 24 cabezas para Q y 4 para KV con dimensión de cabeza 256 y dimensión RoPE 64, FFN con dimensión intermedia 17.408, salida LM de 248.320 (padded) y MTP (Multi-Token Prediction) entrenado con múltiples pasos.

## Arquitectura y entrenamiento

La arquitectura combina atención lineal (Gated DeltaNet) con atención clásica con gating (Gated Attention) en un layout repetitivo de 16 bloques, cada uno con tres capas DeltaNet seguidas de una capa de atención gated, todas con FFN. Este diseño híbrido busca reducir el coste computacional y de memoria de la atención en contextos muy largos sin renunciar a la calidad de atención completa en puntos clave. El modelo incluye un codificador de visión para entrada multimodal y fue entrenado con Multi-Token Prediction (MTP) en múltiples pasos, lo que habilita decodificación especulativa nativa y mejora el throughput de generación.

El entrenamiento consta de pre-entrenamiento y post-entrenamiento, según la model card, pero no se especifica el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras. Tampoco se detallan los datos multimodales empleados para el codificador de visión. La model card menciona que la versión alojada en Qwen Cloud tendrá contexto de 1M por defecto y herramientas integradas oficiales, pero no aporta más detalles sobre el proceso de entrenamiento.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto, desactivable por petición y ajustable en profundidad mediante `reasoning_effort`.
- Razonamiento multi-paso de horizonte largo con planificación autónoma y manejo de retroalimentación del entorno.
- Programación y tareas de terminal agénticas (Agentic terminal coding, Terminal Bench 2.1).
- Comprensión de imágenes: diagramas STEM, documentos y capturas.
- Comprensión de vídeo, incluidos vídeos de hasta una hora de duración.
- Soporte de tool calling y function calling, con herramientas integradas en la versión alojada.
- Integración con harnesses y herramientas de desarrollo populares.
- Capacidades multilingües: no disponible (no se detallan idiomas).
- Retención de contexto de razonamiento histórico mediante `preserve_thinking`.

## Casos de uso

- Agentes de terminal y automatización de DevOps: el modelo está evaluado específicamente en Terminal Bench 2.1 y declara mejor manejo de retroalimentación del entorno, lo que lo hace adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en pipelines de CI/CD.
- Asistentes de programación en producción: con soporte de tool calling y compatibilidad con vLLM, SGLang y TokenSpeed, puede integrarse en servidores de inferencia para autocompletado, revisión de código y generación de parches con contexto de hasta 262.144 tokens.
- Análisis de documentación técnica y diagramas: al ser un modelo visión-lenguaje nativo, puede procesar diagramas STEM, documentos escaneados y capturas de pantalla junto con texto para extraer especificaciones o responder preguntas técnicas.
- Procesamiento de vídeo de larga duración: la capacidad declarada de entender vídeos de hasta una hora permite resumir reuniones, extraer acciones o analizar grabaciones de formación sin segmentación manual.
- Investigación asistida: con contexto extensible a 1M tokens y razonamiento ajustable, puede trabajar sobre corpus largos de papers, mantener hipótesis y encadenar pasos de análisis.
- Atención al cliente multi-turno: la ventana de 262.144 tokens y la retención de contexto histórico de razonamiento permiten gestionar conversaciones largas con historial completo y coherencia entre turnos.
- Automatización de trabajo profesional: tareas de ofimática, extracción de información de documentos y generación de informes con verificación intermedia gracias al modo thinking configurable.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por categorías (Coding, y presumiblemente otras). Sin embargo, el contenido proporcionado está truncado: solo se aprecia la cabecera y la primera fila (Agentic terminal coding / Terminal Bench 2.1), sin valores numéricos visibles. Por tanto, no es posible presentar resultados concretos.

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo denso de 27B en safetensors ocupa aproximadamente 55,6 GB en precisión original; en cuantización de 8 bits rondaría los 28 GB y en 4 bits unos 14-16 GB, aunque estos valores no están confirmados por el autor.
- GPU recomendadas: no disponibles. Por tamaño, cabría esperar viabilidad en A100 80 GB, H100 80 GB y configuraciones multi-GPU; en consumer, posiblemente RTX 4090 24 GB con cuantización agresiva, pero no confirmado.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed, según la model card. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La inclusión de MTP sugiere soporte de decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

La model card compara el modelo con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los datos numéricos no están disponibles en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27B densos | 262.144 (ext. 1M) | Apache 2.0 | Pesos abiertos en HF |
| Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer-30B | ~30B (por nombre) | no disponible | no disponible | no disponible |
| Opus4.6 Max | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Repositorio sin descargas ni likes y creado en noviembre de 2026: no hay evidencia de uso comunitario ni validación independiente de los pesos publicados bajo la cuenta Striker1123.
- La model card contiene tablas de benchmarks truncadas en la información disponible, por lo que no se pueden verificar los resultados declarados.
- No se especifican los idiomas soportados, lo que impide garantizar calidad multilingüe fuera del inglés.
- No se detalla la composición del dataset de entrenamiento ni si se aplicaron RLHF/DPO, lo que limita la evaluación de sesgos.
- Riesgo de alucinación inherente a modelos generativos, especialmente en tareas de investigación y extracción de documentos; se recomienda verificación humana en producción.
- El modo thinking activo por defecto incrementa latencia y consumo de tokens; debe desactivarse o ajustarse con `reasoning_effort` en escenarios de baja latencia.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos de la versión alojada en Qwen Cloud, que puede tener condiciones distintas.
- El contexto extensible a 1M tokens se anuncia para la versión alojada; no se confirma que los pesos abiertos soporten 1M sin técnicas adicionales.
- No hay información sobre cuantizaciones oficiales ni sobre el comportamiento del codificador de visión en cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Striker1123/Qwen3.8-27B
- Qwen Cloud (servicio alojado): https://www.qwencloud.com
- Overview del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
