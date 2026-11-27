# taylorevansc6294f/Ornith-1.5-122B-FP8

## Resumen

Ornith-1.5-122B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Ornith AI, presentado como la evolución de Ornith-1.0. Este modelo se construye sobre Qwen3.5 y Gemma4 mediante preentrenamiento continuado, mid-training y post-entrenamiento, y su rasgo distintivo es un bucle de auto-mejora end-to-end que optimiza conjuntamente la generación de tareas, la construcción de scaffolds y los rollouts de soluciones mediante aprendizaje por refuerzo. El resultado es un modelo orientado a razonamiento agéntico, código y tareas de terminal, con capacidad declarada de procesamiento de imagen y texto (image-text-to-text).

La variante documentada aquí, Ornith-1.5-122B-FP8, es una cuantización en FP8 publicada por el usuario taylorevansc6294f, con pesos en safetensors y formato compressed-tensors, compatible con la librería transformers y con endpoints. El repositorio ocupa 133 GB y contiene 125.086.497.008 parámetros totales según los safetensors, lo que confirma el tamaño nominal de 122B (redondeado comercialmente).

La relevancia del modelo radica en su posicionamiento como MoE de gran tamaño optimizado para despliegue en una sola GPU y su enfoque de auto-mejora continua, que lo sitúa en la categoría de modelos agénticos de código de gama alta. La licencia es MIT, lo que facilita su uso comercial, aunque la información pública disponible sobre idiomas, contexto y detalles de entrenamiento es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en transformer; tag `qwen3_5_moe` |
| Parametros totales | 125.086.497.008 (122B nominal) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (esta variante); cuantización móvil mencionada para la variante Mobile; no se detallan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, compressed-tensors |
| Pipeline | text-generation; soporte image-text-to-text |
| Libreria | transformers |
| Tamano del repositorio | 133.0 GB |
| Fecha de creacion | 2026-11-27 |

## Arquitectura y entrenamiento

Ornith-1.5-122B emplea una arquitectura Mixture-of-Experts (MoE) derivada de Qwen3.5 y Gemma4, según indica la model card. El modelo parte de Ornith-1.0, que ya incorporaba preentrenamiento continuado, mid-training y post-entrenamiento sobre esas bases, y añade en esta versión un bucle de auto-mejora que amplía la optimización desde el scaffold y los rollouts hasta la generación conjunta de tareas, la construcción de scaffolds y la ejecución de soluciones. En lugar de depender de un conjunto fijo de tareas curadas por humanos y harnesses diseñados manualmente, el sistema genera continuamente nuevas tareas de entrenamiento, descubre estrategias efectivas para resolverlas y mejora la política mediante aprendizaje por refuerzo.

La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni los detalles del esquema de RLHF/DPO más allá del bucle de RL descrito. Tampoco se detallan innovaciones de inferencia como decodificación especulativa o atención lineal. La variante FP8 aquí documentada utiliza el formato compressed-tensors, lo que sugiere compatibilidad con pipelines de cuantización estándar de Hugging Face y con despliegue en vLLM y TGI.

## Capacidades

- Generación de texto y razonamiento multi-paso, con orientación explícita a tareas agénticas y de código.
- Capacidades de código y terminal: la model card reporta resultados en TerminalBench 2.1, CyberGym, NL2Repo y SWE-bench Pro, lo que indica entrenamiento específico para entornos de línea de comandos, seguridad y reparación de repositorios.
- Procesamiento de imagen y texto (pipeline image-text-to-text), lo que habilita entrada multimodal.
- Soporte declarado de endpoints compatibles (`endpoints_compatible`), lo que facilita su integración en infraestructuras de inferencia tipo API.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan explícitamente tool calling, function calling ni modo thinking, aunque el enfoque agéntico y los benchmarks de terminal sugieren soporte de interacción con herramientas.

## Casos de uso

- Automatización de tareas de terminal y DevOps: el modelo obtiene 81.2 en TerminalBench 2.1, por lo que es adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos shell.
- Reparación de repositorios y generación de código a nivel de proyecto: con 51.2 en NL2Repo y resultados en SWE-bench Pro, puede emplearse en pipelines de CI/CD para generar parches, resolver issues y mantener consistencia entre módulos.
- Auditoría de seguridad y análisis de vulnerabilidades: su puntuación de 80 en CyberGym lo hace útil para tareas de razonamiento sobre código malicioso, análisis de exploits controlados y revisión de superficies de ataque.
- Asistentes de desarrollo con contexto multimodal: al soportar image-text-to-text, puede analizar capturas de pantalla de errores, diagramas de arquitectura o interfaces para generar código o documentación asociada.
- Despliegue en una sola GPU para equipos de investigación: al ser un MoE de 122B en FP8, está pensado para inferencia en un único acelerador de gama alta, lo que reduce la barrera de infraestructura frente a modelos densos equivalentes.
- Prototipado de agentes autónomos con auto-mejora: el diseño de bucle de RL y generación de tareas permite experimentar con pipelines de agentes que iteran sobre sus propias soluciones en entornos sandbox.
- Generación de documentación técnica y explicaciones de código: su orientación a repositorios y terminal lo hace adecuado para resumir cambios, explicar diffs y redactar guías de operación.

## Benchmarks y rendimiento

Resultados reportados en la model card para Ornith-1.5-122B frente a modelos comparables:

| Benchmark | Ornith-1.5-122B | Qwen3.8-Flash-Next (125B) | Qwen3.8 (27B dense) | Nemotron 3.5 Super VL (120B) | DeepSeek-V4-Flash-0731 (284B) | Beam (501B) |
|---|---|---|---|---|---|---|
| TerminalBench 2.1 | 81.2 | 83.4 | 71.9 | 66.7 | 82.7 | 80.1 |
| CyberGym | 80 | 78 | 55 | 34 | 76.7 | 59 |
| NL2Repo | 51.2 | 45.2 | 42.3 | 21 | 54.2 | 49.4 |
| SWE-bench Pro (no-hack) | no disponible (tabla truncada en la información) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 125 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 160-180 GB de VRAM efectiva para contexto moderado.
- GPU recomendadas: H100 80GB en configuración multi-GPU (2x H100), H200 141GB (posible en una sola unidad con margen ajustado), B200 o MI300X. Para FP8 nativo se recomienda hardware con soporte FP8 (H100/H200/B200).
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 5090 (32 GB) en FP8; requeriría cuantizaciones de 4 bits o inferiores no documentadas en esta ficha.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI por compatibilidad con compressed-tensors y endpoints; llama.cpp/Ollama no están confirmados para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | TerminalBench 2.1 | CyberGym | NL2Repo | Licencia |
|---|---|---|---|---|---|---|
| Ornith-1.5-122B | 122B (MoE) | no disponible | 81.2 | 80 | 51.2 | MIT |
| Qwen3.8-Flash-Next | 125B | no disponible | 83.4 | 78 | 45.2 | no disponible |
| Nemotron 3.5 Super VL | 120B | no disponible | 66.7 | 34 | 21 | no disponible |
| DeepSeek-V4-Flash-0731 | 284B | no disponible | 82.7 | 76.7 | 54.2 | no disponible |

Ornith-1.5-122B destaca en CyberGym (80) y NL2Repo (51.2) frente a modelos de tamaño similar, y queda ligeramente por debajo de Qwen3.8-Flash-Next en TerminalBench 2.1. Su licencia MIT es la más permisiva de la comparativa mostrada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, composición del dataset ni evaluación de seguridad; se desconoce el comportamiento en dominios sensibles.
- Riesgo de alucinación inherente a modelos generativos de gran tamaño; no se han publicado evaluaciones de factualidad en la información disponible.
- Longitud de contexto e idiomas soportados no disponibles, lo que impide garantizar un rendimiento adecuado en contextos largos o en castellano.
- La variante FP8 puede degradar ligeramente la calidad frente a los pesos originales en BF16; no se han publicado comparativas de precisión para esta cuantización.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y está publicado por un usuario (`taylorevansc6294f`) distinto de la organización oficial `ornith-ai`; conviene verificar la procedencia y la integridad de los pesos antes de usarlos en producción.
- Aunque la licencia es MIT, la model card enlaza a una licencia en el repositorio oficial de Ornith; conviene revisar ambos documentos para uso comercial.
- No se documentan restricciones de uso aceptable ni políticas de moderación.

## Enlaces

- Hugging Face: https://huggingface.co/taylorevansc6294f/Ornith-1.5-122B-FP8
- Blog oficial: https://ornith.ai/ornith_1_5.html
- Licencia referenciada: https://huggingface.co/ornith-ai/Ornith-1.5-122B/blob/main/LICENSE
