# umut3200/Qwen3.5-4B

## Resumen

Qwen3.5-4B es un modelo de lenguaje causal con codificador de visión desarrollado por el equipo Qwen (Alibaba). Este repositorio concreto (`umut3200/Qwen3.5-4B`) es una publicación de los pesos del modelo post-entrenado en formato Hugging Face Transformers, derivado del modelo base `Qwen/Qwen3.5-4B-Base`. Se distribuye bajo licencia Apache 2.0 y está pensado para tareas de imagen-texto-a-texto (image-text-to-text) y conversación.

La familia Qwen3.5 introduce una arquitectura híbrida que combina Gated Delta Networks (atención lineal) con atención con compuertas, junto con un enfoque de fusión temprana para tokens multimodales. El modelo declara 4B de parámetros nominales (4.659.865.088 parámetros reales según los pesos en safetensors), una dimensión oculta de 2560 y 32 capas, con una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000.

Su relevancia radica en ofrecer capacidades multimodales y de razonamiento en un tamaño contenido (4B), con soporte declarado de 201 idiomas y dialectos, lo que lo sitúa como candidato para despliegues en hardware de gama media. No obstante, el repositorio no incluye información sobre el proceso de ajuste específico aplicado por el autor de esta publicación ni métricas propias verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida Gated DeltaNet + Gated Attention; MoE disperso (según model card) |
| Parametros totales | 4.659.865.088 (4B nominales) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con vLLM, SGLang, KTransformers) |
| Idiomas soportados | 201 idiomas y dialectos (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension oculta | 2560 |
| Numero de capas | 32 |
| Layout de capas | 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Token embedding | 248.320 (padded) |
| Dimensión FFN intermedia | 9216 |
| Cabezas de atención (Gated Attention) | 16 para Q, 4 para KV; dimensión 256 |
| Cabezas de atención lineal (Gated DeltaNet) | 32 para V, 16 para QK; dimensión 128 |
| RoPE dimension | 64 |
| MTP | Entrenado con multi-steps |
| Tamaño del repo | 9,3 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida de transformer que intercala bloques de Gated DeltaNet (atención lineal con estado recurrente) y bloques de Gated Attention (atención con compuertas). El layout declarado es 8 repeticiones de tres bloques Gated DeltaNet seguidos de un bloque Gated Attention, cada uno con su correspondiente FFN de dimensión intermedia 9216. La dimensión oculta es 2560 y el modelo cuenta con 32 capas. Esta combinación busca reducir el coste computacional de la atención en contextos largos manteniendo capacidad expresiva.

Según la model card, el entrenamiento incluye pre-entrenamiento y post-entrenamiento, con fusión temprana sobre tokens multimodales (early fusion), entrenamiento con multi-token prediction (MTP) en varios pasos y un proceso de reinforcement learning escalado en entornos multi-agente. La model card menciona "sparse Mixture-of-Experts" como parte de la arquitectura eficiente, aunque no se detalla el número de expertos ni los parámetros activos. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicó RLHF o DPO de forma explícita. Tampoco se documenta en este repositorio el ajuste concreto realizado por el autor de la publicación respecto al modelo base.

## Capacidades

- Generación de texto y razonamiento multilingüe en 201 idiomas y dialectos (según model card).
- Comprensión de imágenes y texto (pipeline image-text-to-text) mediante codificador de visión con fusión temprana.
- Razonamiento, código y agentes: la model card declara paridad con Qwen3 y superioridad frente a Qwen3-VL en benchmarks de razonamiento, código, agentes y comprensión visual.
- Soporte de contexto largo nativo de 262.144 tokens, extensible hasta 1.010.000.
- Capacidad de multi-token prediction (MTP) entrenada con múltiples pasos.
- Compatibilidad declarada con Hugging Face Transformers, vLLM, SGLang y KTransformers.
- Soporte de tool calling / function calling: no disponible de forma explícita en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada para esta variante concreta.
- Capacidades de audio: no disponible.

## Casos de uso

- Análisis de documentos con imágenes: el modelo puede procesar capturas, diagramas o páginas escaneadas junto con texto gracias a su pipeline image-text-to-text y su contexto de 262.144 tokens, útil para extracción de información en flujos documentales.
- Asistentes conversacionales multilingües: con soporte declarado de 201 idiomas, encaja en despliegues de atención al cliente que requieran cobertura lingüística amplia sin cambiar de modelo.
- Procesamiento de repositorios de código extensos: el contexto largo permite ingestar múltiples ficheros y mantener coherencia en tareas de revisión o generación de código dentro de pipelines de desarrollo.
- Razonamiento sobre imágenes en entornos educativos o de accesibilidad: descripción de contenido visual, respuesta a preguntas sobre figuras y apoyo a usuarios con discapacidad visual.
- Agentes multi-paso: la model card menciona entrenamiento con RL en entornos multi-agente, lo que lo hace adecuado para orquestación de tareas con múltiples llamadas a herramientas, aunque el soporte explícito de function calling no está documentado en este repositorio.
- Despliegue en hardware de gama media: con 4B de parámetros y pesos en safetensors, es viable en GPUs de consumo para prototipado e inferencia local mediante vLLM o KTransformers.
- Extracción de información de conversaciones largas: su ventana de contexto permite resumir o consultar hilos de conversación muy extensos sin truncamiento.

## Benchmarks y rendimiento

La model card incluye resultados de benchmarks para la familia Qwen3.5. A continuación se recogen los datos disponibles para Qwen3.5-4B junto con modelos comparables citados en la propia model card (GPT-OSS-120B, GPT-OSS-20B, Qwen3-Next-80B-A3B-Thinking, Qwen3-30BA3B-Thinking-2507 y Qwen3.5-9B). Solo se dispone de resultados parciales de la tabla de conocimiento y STEM en la información proporcionada.

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | 91,0* | no disponible |

*El valor de MMLU-Redux para Qwen3.5-9B aparece truncado en la información proporcionada; se indica como referencia parcial.

No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks de código o matemáticas para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,3 GB solo para pesos (4.659.865.088 parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica se recomienda 12-16 GB para contexto moderado.
- Cuantización a 8 bits: alrededor de 4,7 GB de pesos; a 4 bits: alrededor de 2,3 GB, aunque el repositorio no publica versiones GGUF ni cuantizadas oficiales.
- GPU recomendadas: para FP16, GPUs con 16 GB o más (RTX 4080/4090, A100, H100). Para cuantización agresiva, GPUs de consumo con 8-12 GB podrían ser suficientes, aunque no hay datos verificados de esta publicación.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB) en FP16 y en GPUs de 8-12 GB con cuantización, si bien no se han publicado mediciones específicas.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers (según model card). No se menciona soporte explícito de llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B | 4B | 262.144 (ext. 1.010.000) | 79,1 | Apache 2.0 | Hugging Face |
| Qwen3.5-9B | 9B | no disponible | 82,5 | Apache 2.0 (según familia) | Hugging Face |
| GPT-OSS-20B | 20B | no disponible | 74,8 | no disponible | no disponible |
| Qwen3-30BA3B-Thinking-2507 | 30B (A3B) | no disponible | 80,9 | no disponible | Hugging Face |

El modelo de 4B queda por debajo del Qwen3.5-9B en MMLU-Pro (79,1 frente a 82,5) y ligeramente por debajo del Qwen3-30BA3B-Thinking-2507 (80,9), pero supera al GPT-OSS-20B (74,8) pese a tener menos de una cuarta parte de sus parámetros. La comparación con GPT-OSS-120B (80,8) muestra una diferencia de 1,7 puntos a favor del modelo grande.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-11), lo que sugiere que no ha sido validado por la comunidad.
- No se documenta en este repositorio qué ajuste específico ha realizado el autor (`umut3200`) respecto al modelo base `Qwen/Qwen3.5-4B-Base`; los pesos podrían diferir del modelo oficial.
- La model card menciona arquitectura MoE dispersa pero no especifica parámetros activos ni número de expertos, lo que impide estimar con precisión los requisitos de cómputo reales.
- No se han publicado resultados de benchmarks propios de esta publicación; los datos de la tabla provienen de la model card oficial de la familia Qwen3.5 y podrían no reflejar el comportamiento de estos pesos concretos.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan medidas específicas de mitigación en este repositorio.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Aunque la licencia es Apache 2.0 (permite uso comercial), el `license_link` apunta al fichero LICENSE del repositorio oficial `Qwen/Qwen3.5-4B`, por lo que conviene verificar los términos exactos antes de un despliegue en producción.
- El soporte de tool calling, modo thinking y otras capacidades avanzadas no está confirmado para esta variante concreta.
- La longitud de contexto extensible a 1.010.000 tokens no implica que el modelo mantenga calidad uniforme en toda la ventana; no se aportan métricas de rendimiento por longitud.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/umut3200/Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Repositorio oficial de referencia: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
