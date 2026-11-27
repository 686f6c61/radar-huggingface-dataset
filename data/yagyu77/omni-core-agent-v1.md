# yagyu77/Omni-Core-Agent-v1

## Resumen

Omni-Core-Agent-v1 es un ajuste fino (finetune) publicado por el usuario yagyu77 sobre el modelo base Qwen/Qwen3.5-9B-Base de Alibaba Qwen. El repositorio contiene pesos en formato safetensors compatibles con la librería transformers y está etiquetado con el pipeline `image-text-to-text`, lo que indica que conserva la torre de visión del modelo base y puede procesar entradas multimodales de imagen y texto. Su licencia es Apache 2.0 y el tamaño total de los pesos es de 9.653.104.368 parámetros (aproximadamente 9,65 mil millones).

El modelo hereda la arquitectura híbrida del Qwen3.5-9B: una combinación de capas con Gated DeltaNet (atención lineal) y capas con Gated Attention (atención completa con RoPE), junto con una red feed-forward de dimensión intermedia 12288 y 32 capas organizadas en un patrón repetido de 8 bloques. El contexto nativo es de 262.144 tokens, extensible hasta 1.010.000 tokens, lo que lo sitúa en la gama alta de ventanas de contexto para modelos de menos de 10B parámetros.

La relevancia de este checkpoint radica en que la model card publicada es prácticamente idéntica a la del Qwen3.5-9B oficial, sin que se documenten los datos de entrenamiento del ajuste fino ni las diferencias respecto al base. No hay descargas ni likes registrados, y la información sobre el proceso de ajuste, los idiomas o los benchmarks específicos de esta variante no está disponible en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con vision encoder; capas Gated DeltaNet (atención lineal) intercaladas con Gated Attention (atención completa) |
| Parametros totales | 9.653.104.368 (9B) |
| Parametros activos | no disponible (la model card no confirma configuración MoE para esta variante) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (no se documentan en la model card) |
| Idiomas soportados | 201 idiomas y dialectos según la model card del base Qwen3.5; no se detalla la cobertura efectiva tras el finetune |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida con 32 capas organizadas en 8 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. Las capas Gated DeltaNet usan atención lineal con 32 cabezas para V y 16 para QK, dimensión de cabeza 128; las capas Gated Attention usan 16 cabezas para Q y 4 para KV, dimensión 256 y RoPE de dimensión 64. La dimensión oculta es 4096, el embedding y la salida LM tienen 248320 entradas (con padding) y la FFN tiene dimensión intermedia 12288. Incluye entrenamiento con Multi-Token Prediction (MTP) en varios pasos. La model card menciona además un entrenamiento con "early fusion" de tokens multimodales y un esquema de RL escalado en entornos multiagente.

No se dispone de información sobre el dataset, el número de tokens ni el método de ajuste (SFT, DPO, RLHF) empleado por yagyu77 para producir Omni-Core-Agent-v1. La model card del repositorio reproduce el texto del modelo base sin añadir detalles del finetune, por lo que no es posible verificar qué capacidades se han modificado, reforzado o degradado respecto a Qwen3.5-9B-Base.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural, heredados del modelo base Qwen3.5-9B.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con torre de visión integrada.
- Razonamiento matemático y de tipo STEM, según los benchmarks del modelo base.
- Generación y comprensión de código, con soporte para tareas de agentes según la model card del base.
- Cobertura multilingüe amplia (hasta 201 idiomas y dialectos según el modelo base).
- Soporte de contexto largo: 262.144 tokens nativos, extensible a 1.010.000.
- Compatibilidad declarada con tool calling y function calling a través de los tags `endpoints_compatible` y del ecosistema Qwen; no se detalla en la model card de esta variante.
- Capacidad de multi-step reasoning y uso en entornos de agentes, según las notas del modelo base.
- No se documenta un modo "thinking" explícito para esta variante.

## Casos de uso

- Asistente multimodal de atención al cliente: el modelo puede recibir capturas de pantalla o fotos de producto junto con texto y mantener conversaciones multi-turno gracias a su ventana de 262.144 tokens, adecuada para historiales largos de soporte.
- Análisis de documentos extensos con imágenes: informes escaneados, facturas o contratos con gráficos pueden procesarse en una sola pasada al aprovechar el contexto nativo de 262.144 tokens y la torre de visión.
- Generación de código asistida en pipelines de CI/CD: al heredar las capacidades de código y agentes del base Qwen3.5-9B, puede integrarse en herramientas de revisión automática o generación de tests, aunque la falta de benchmarks del finetune obliga a validar su rendimiento real.
- Automatización de tareas de agente con tool calling: su compatibilidad con endpoints y el ecosistema transformers/vLLM permite desplegarlo como backend de agentes que invocan APIs externas en flujos multi-paso.
- Extracción de información estructurada de imágenes y texto: digitalización de formularios, tickets o etiquetas combinando OCR implícito del vision encoder con salida en JSON.
- Traducción y localización multilingüe: cobertura declarada de 201 idiomas en el base, útil para localización de contenido con contexto largo (manuales, documentación técnica).
- Prototipado de investigación en modelos híbridos de atención lineal: al ser un checkpoint de 9B con arquitectura Gated DeltaNet + Gated Attention, sirve para experimentar con eficiencia de inferencia en contextos largos.
- Despliegue en entornos con recursos moderados: con ~9,65B parámetros y licencia Apache 2.0, es viable para pruebas en una sola GPU de 24 GB con cuantización (aunque los tipos de cuantización no están documentados).

## Benchmarks y rendimiento

La model card del repositorio reproduce la tabla de benchmarks del Qwen3.5-9B oficial, no del finetune. Los valores disponibles en la información proporcionada son parciales (la tabla está truncada) y corresponden al modelo base:

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | no disponible (truncado) | no disponible (truncado) |

No se han publicado resultados de benchmarks específicos de Omni-Core-Agent-v1 en la información disponible. Los datos anteriores deben atribuirse al modelo base Qwen3.5-9B y no garantizan el rendimiento tras el finetune.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda 24 GB o más.
- VRAM estimada con cuantización de 8 bits: en torno a 10-11 GB para pesos; con 4 bits, en torno a 5-6 GB. Los tipos de cuantización concretos no están documentados en la model card.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) es suficiente para BF16 en contextos moderados o para cuantización 8 bits con contexto amplio.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con BF16 para secuencias cortas o con cuantización para contextos largos; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers, vLLM, SGLang y KTransformers según la model card; llama.cpp y Ollama no están confirmados para esta arquitectura híbrida en la información disponible.
- Latencia y throughput: no disponibles. La arquitectura Gated DeltaNet está diseñada para reducir el coste de atención en contextos largos, pero no se aportan cifras medidas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Omni-Core-Agent-v1 (este) | 9,65B | 262.144 (ext. 1.010.000) | Apache 2.0 | Finetune de Qwen3.5-9B-Base; sin benchmarks propios publicados |
| Qwen3.5-9B (base oficial) | 9B | 262.144 (ext. 1.010.000) | Apache 2.0 | MMLU-Pro 82,5; MMLU-Redux no disponible en la tabla truncada |
| Qwen3.5-4B | 4B | no disponible | Apache 2.0 | MMLU-Pro 79,1; alternativa más ligera del mismo linaje |
| Qwen3-30BA3B-Thinking-2507 | 30B (MoE, 3B activos) | no disponible | Apache 2.0 | MMLU-Pro 80,9; MMLU-Redux 91,4 |
| GPT-OSS-20B | 20B | no disponible | no disponible | MMLU-Pro 74,8; MMLU-Redux 87,8 |

La comparativa se limita a los datos de la tabla de la model card. No se dispone de información sobre modelos comparables de otros fabricantes con arquitectura híbrida similar ni de resultados del finetune frente a su base.

## Limitaciones y advertencias

- La model card no documenta el proceso de finetune: se desconoce el dataset, el método y el objetivo, por lo que no se puede garantizar que las capacidades del base se conserven intactas.
- Riesgo de alucinación inherente a los modelos generativos de 9B; no se han publicado evaluaciones de fidelidad para esta variante.
- Sesgos: no se documentan análisis de sesgo para el finetune; los sesgos del base Qwen3.5-9B no están detallados en la información disponible.
- Cobertura de idiomas: aunque el base declara 201 idiomas, no se especifica el rendimiento del finetune en castellano ni en otras lenguas.
- Licencia Apache 2.0 permite uso comercial, pero la model card enlaza a la licencia del modelo base Qwen; conviene verificar los términos del base antes de producción.
- El repositorio no tiene descargas ni likes, y la fecha de creación (2026-11-27) es posterior a la de los modelos base citados; no hay validación comunitaria del checkpoint.
- El tamaño del repo (19,3 GB) corresponde a pesos en BF16; no se ofrecen versiones cuantizadas oficiales, lo que limita el despliegue en hardware modesto.
- La tabla de benchmarks está truncada en la información disponible, por lo que no se pueden citar resultados completos ni del finetune ni del base.

## Enlaces

- Hugging Face: https://huggingface.co/yagyu77/Omni-Core-Agent-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
