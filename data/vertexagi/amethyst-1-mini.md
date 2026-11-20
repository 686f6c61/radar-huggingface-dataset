# VertexAGI/amethyst-1-mini

## Resumen

Amethyst 1 Mini es un modelo conversacional de propósito general desarrollado por VertexAGI (proyecto de investigación independiente) mediante un ajuste fino con LoRA sobre google/gemma-3-4b-it. Se trata del primer lanzamiento de la familia Amethyst, concebido como validación de extremo a extremo de un pipeline de destilación, ajuste fino y evaluación ejecutado íntegramente en hardware de consumo (Apple Silicon con MLX). La arquitectura subyacente es Gemma 3, un transformer decoder-only denso de 4B parámetros (4.551.515.648 según los pesos en safetensors).

El modelo resuelve el caso de uso de asistente conversacional ligero con capacidad de instrucciones, generación de código, razonamiento matemático, extracción estructurada y escritura creativa, entrenado sobre un conjunto destilado de 1.122 pares instrucción/respuesta generados a partir de nvidia/nemotron-3-super-120b-a12b. Su relevancia actual radica en que documenta con detalle un flujo de destilación de un modelo profesor MoE de 120B hacia un modelo estudiante de 4B, con un coste de entrenamiento bajo y resultados reproducibles en local.

La ventana de contexto, los idiomas soportados y los detalles de la tokenizadora no se especifican en la información proporcionada más allá de que el modelo está entrenado y orientado al inglés. La licencia es la Gemma Terms of Use, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 3, transformer decoder-only denso |
| Parámetros totales | 4.551.515.648 (4B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16/fp16 (safetensors), Q4_K_M (GGUF) |
| Idiomas soportados | inglés (en) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (bf16, 9,10 GB en 2 shards) y GGUF Q4_K_M (2,88 GB) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-4b-it, un transformer decoder-only denso de 4B parámetros, y se ajusta mediante LoRA de rango 8 con escala 20,0 y dropout 0,0 sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` en 16 capas. El checkpoint de partida para el ajuste es mlx-community/gemma-3-4b-it-qat-4bit, es decir, una versión cuantizada con quantisation-aware training. El entrenamiento se ejecutó con MLX y `mlx-lm` sobre Apple Silicon, con longitud de secuencia de 1024 tokens, gradient checkpointing activado, optimizador Adam con learning rate constante de 1e-5 y 3.246 iteraciones con validación cada 200 pasos.

El conjunto de datos consta de 1.122 pares instrucción/respuesta (1.082 de entrenamiento y 40 de validación), generados sintéticamente por destilación de conocimiento desde nvidia/nemotron-3-super-120b-a12b (MoE de 120B parámetros con aproximadamente 12B activos) a través de la API de OpenRouter. Cada ejemplo proviene de un prompt único y cubre categorías deliberadamente amplias: explicación y corrección de conceptos erróneos, razonamiento y matemáticas, generación de código, extracción y salida estructurada, planificación, roleplay y escritura creativa, traducción, clasificación de sentimiento y brainstorming. El checkpoint publicado corresponde a la iteración 2.600, seleccionada por menor pérdida de validación (1,513), ya que iteraciones posteriores mostraban sobreajuste (hasta ~1,95 al final). El adaptador LoRA se fusionó en los pesos base y el resultado se desconvolucionó a fp16 para su distribución. No se reporta uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional multi-turno con formato de chat mediante `apply_chat_template`.
- Razonamiento y matemáticas a nivel básico e intermedio, derivado de las categorías de entrenamiento de razonamiento y matemáticas.
- Generación de código en respuesta a instrucciones, sin evidencia de soporte específico de tool calling.
- Extracción de información y generación de salida estructurada.
- Planificación de tareas y descomposición en pasos.
- Escritura creativa y roleplay.
- Traducción (categoría presente en el dataset, aunque el modelo está declarado únicamente en inglés).
- Clasificación de sentimiento.
- Brainstorming e ideación.
- Capacidad multimodal heredada potencial: la base Gemma 3 4B IT es image-text-to-text, pero la model card no documenta ni valida el ajuste en tareas de visión, por lo que no debe asumirse.
- No se documenta soporte de function calling, agentes, modo thinking ni audio.

## Casos de uso

- Asistente conversacional local en hardware de consumo: con el GGUF Q4_K_M de 2,88 GB puede ejecutarse en portátiles con GPU integrada o Apple Silicon mediante llama.cpp u Ollama, sirviendo como chatbot de escritorio con latencia baja y sin dependencia de la nube.
- Prototipado rápido de pipelines de destilación: el modelo sirve como referencia reproducible para equipos que quieran validar un flujo profesor grande a estudiante pequeño con LoRA y MLX, comparando pérdida de validación y calidad conversacional frente al modelo base.
- Generación de código asistida en entornos de desarrollo: puede integrarse en editores o scripts para autocompletar funciones, explicar fragmentos o proponer correcciones, aprovechando la categoría de código del dataset, aunque sin garantías de tool calling.
- Extracción de datos estructurados de texto libre: útil para convertir correos, notas o descripciones en JSON o tablas simples en tareas de enriquecimiento de datos a pequeña escala.
- Clasificación de sentimiento y análisis de opiniones: adecuado para prototipos de análisis de reseñas o encuestas donde no se requiere alta precisión y se busca coste cero de inferencia.
- Generación de borradores creativos y roleplay: para juegos de texto, guiones o ejercicios de escritura, aprovechando la categoría de escritura creativa del entrenamiento.
- Traducción ligera inglés a otros idiomas en contextos informales: aunque el modelo está declarado en inglés, la categoría de traducción del dataset permite experimentar con traducciones de baja criticidad.
- Educación y explicaciones simplificadas: puede generar explicaciones divulgativas de conceptos (el ejemplo de la model card sobre vacunas), útil en herramientas de estudio personal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 9-10 GB para los pesos más overhead de activaciones y caché KV, lo que exige GPUs con al menos 12-16 GB para contexto moderado.
- VRAM estimada con GGUF Q4_K_M: aproximadamente 3-4 GB, incluyendo overhead, lo que permite ejecución en GPUs de 4-6 GB.
- GPU recomendadas para fp16: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB); para Q4_K_M bastan RTX 3060 12 GB, RTX 4060 Ti 8 GB o incluso GPUs integradas con suficiente memoria unificada.
- Cabe en GPU de consumo: sí, tanto en fp16 en tarjetas de 16 GB o más como en Q4_K_M en tarjetas de 6-8 GB.
- Apple Silicon: el modelo se entrenó con MLX, por lo que es compatible con `mlx-lm` en chips M1/M2/M3/M4 con memoria unificada de 16 GB o más.
- Opciones de despliegue: transformers con PyTorch, llama.cpp, Ollama, LM Studio, MLX y text-generation-inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Amethyst 1 Mini | 4B (denso) | no disponible | en | Gemma Terms of Use | safetensors, GGUF | Ajuste LoRA de Gemma 3 4B IT sobre 1.122 ejemplos destilados |
| google/gemma-3-4b-it | 4B (denso) | no disponible | multilingüe (según modelo base) | Gemma Terms of Use | safetensors | Modelo base original, sin ajuste específico; mayor cobertura idiomática declarada |
| mlx-community/gemma-3-4b-it-qat-4bit | 4B (denso) | no disponible | multilingüe | Gemma Terms of Use | MLX cuantizado | Checkpoint de partida del ajuste, cuantizado con QAT |
| nvidia/nemotron-3-super-120b-a12b | 120B totales, ~12B activos (MoE) | no disponible | no disponible | no disponible | no disponible | Modelo profesor usado para la destilación; mucho mayor coste de inferencia |

## Limitaciones y advertencias

- Entrenado sobre solo 1.122 ejemplos sintéticos, por lo que el comportamiento puede ser inconsistente fuera de las categorías cubiertas.
- Hereda las limitaciones y la fecha de corte de conocimiento de Gemma 3 4B IT.
- Destilado de un único modelo profesor sin revisión humana de cada ejemplo: puede contener sesgos del profesor y errores factuales.
- Riesgo de alucinación inherente a modelos de 4B ajustados con datasets pequeños; no apto para tareas de alta criticidad.
- Declarado únicamente en inglés; el soporte multilingüe no está garantizado aunque la categoría de traducción esté presente en el entrenamiento.
- La licencia Gemma Terms of Use impone restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de cualquier despliegue en producción.
- El autor indica explícitamente que no está pensado para uso en producción, seguridad crítica ni decisiones de alto impacto.
- El checkpoint publicado es la primera generación de la familia; se esperan versiones posteriores con datasets mayores y más limpios.
- No se documenta soporte validado de visión pese a que el modelo base es image-text-to-text; no debe asumirse capacidad multimodal en esta versión.
- La ventana de contexto no está especificada, lo que dificulta planificar despliegues con prompts largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexAGI/amethyst-1-mini
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Checkpoint de partida para el ajuste: https://huggingface.co/mlx-community/gemma-3-4b-it-qat-4bit
- Modelo profesor citado: nvidia/nemotron-3-super-120b-a12b (referencia en la model card, sin URL directa proporcionada)
- Framework de ajuste MLX: https://github.com/ml-explore/mlx
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
