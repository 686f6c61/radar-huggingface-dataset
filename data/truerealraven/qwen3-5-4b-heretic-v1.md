# TrueRealRaven/Qwen3.5-4B-heretic-v1

## Resumen

Qwen3.5-4B-heretic-v1 es una variante "decensored" (abliterada) del modelo multimodal Qwen3.5-4B desarrollada por el usuario independiente TrueRealRaven. Se trata de un fine-tune que elimina total o parcialmente los mecanismos de rechazo del modelo original mediante la herramienta Heretic v1.4.0, que aplica una técnica de abliteration sobre las direcciones de activación asociadas a comportamientos de negativa. El modelo conserva la arquitectura y los pesos base de Qwen3.5-4B, por lo que mantiene sus capacidades multimodales y de razonamiento, pero con una política de seguridad relajada.

El modelo base Qwen3.5-4B, desarrollado por el equipo Qwen de Alibaba, es un modelo causal de lenguaje con codificador de visión que combina una arquitectura híbrida de Gated DeltaNet (atención lineal) y atención con compuertas (Gated Attention), organizada en 32 capas con un patrón de 8 bloques de 4 capas cada uno. Con 4.539.265.536 parámetros totales, una dimensión oculta de 2560 y un contexto nativo de 262.144 tokens extensible hasta 1.010.000, está diseñado para despliegues de alta eficiencia en tareas multimodales, agentes y razonamiento.

La relevancia de esta variante radica en que ofrece un modelo de 4B con capacidades de visión-lenguaje y contexto ultralargo sin las restricciones de contenido del original, lo que lo hace atractivo para investigación sobre alineación, generación creativa sin filtros y entornos donde el modelo base resulta demasiado restrictivo. No obstante, la licencia Apache 2.0 y la naturaleza del fine-tune exigen una evaluación cuidadosa de riesgos antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con vision encoder; híbrida Gated DeltaNet + Gated Attention |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar vía transformers/vLLM) |
| Idiomas soportados | 201 idiomas y dialectos (según model card del base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida que alterna capas de Gated DeltaNet (atención lineal con 32 cabezas para V y 16 para QK, dimensión de cabeza 128) con capas de Gated Attention (16 cabezas para Q y 4 para KV, dimensión 256, RoPE de 64 dimensiones). El layout es 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), con una FFN de dimensión intermedia 9216 y una dimensión oculta de 2560. El modelo incluye un codificador de visión y fue entrenado con multi-token prediction (MTP) en varios pasos, lo que acelera la decodificación especulativa. El embedding de tokens es de 248.320 (con padding) y está atado a la salida LM.

El entrenamiento del base combina pre-entrenamiento y post-entrenamiento con fusión temprana de tokens multimodales, RL a escala en entornos de millones de agentes y una infraestructura de entrenamiento asíncrona. La variante heretic-v1 se genera aplicando Heretic v1.4.0 sobre el modelo base: se identifican direcciones de activación asociadas a rechazos y se aplican intervenciones sobre `attn.o_proj` y `mlp.down_proj` con pesos y posiciones concretas (por ejemplo, `direction_index` 20.13, `attn.o_proj.max_weight` 1.49 en posición 22.18). El resultado reportado es una reducción de rechazos de 99/100 a 14/100 con una divergencia KL de 0.0257 respecto al original, lo que indica un cambio moderado en la distribución de salidas.

## Capacidades

- Generación de texto y razonamiento multimodal (image-text-to-text): acepta imágenes y texto como entrada.
- Razonamiento, matemáticas y conocimiento STEM (según benchmarks del base).
- Generación de código y soporte de agentes multi-paso.
- Tool calling / function calling (heredado del base Qwen3.5).
- Capacidades multilingües amplias (201 idiomas y dialectos según el base).
- Contexto ultralargo de 262.144 tokens nativo, extensible a 1.010.000.
- Modo de razonamiento (thinking) y decodificación especulativa vía MTP.
- Comportamiento "uncensored": reduce drásticamente las negativas a peticiones que el modelo original rechazaría.

## Casos de uso

- Investigación sobre alineación y abliteration: permite estudiar cómo cambia la distribución de salidas al eliminar direcciones de rechazo, comparando KL divergence y tasas de negativa frente al base.
- Generación creativa sin filtros: escritura de ficción, guiones o narrativa adulta donde el modelo base rechazaría contenido por políticas de seguridad.
- Análisis de imágenes con contexto largo: al ser image-text-to-text con 262K tokens de contexto, puede procesar documentos escaneados o múltiples imágenes con texto extenso asociado.
- Agentes autónomos y tool calling: integrable en pipelines que requieren function calling y razonamiento multi-paso con contexto amplio.
- Asistencia en código sin restricciones de contenido: generación y revisión de código en entornos donde el modelo base aplica filtros innecesarios.
- Evaluación de robustez y red-teaming: útil para probar la eficacia de sistemas de moderación frente a modelos abliterados.
- Despliegue en hardware consumer: con 4.5B parámetros y cuantización, puede ejecutarse en GPUs de gama alta para prototipos y demos.

## Benchmarks y rendimiento

Los benchmarks disponibles corresponden al modelo base Qwen3.5-4B (no a la variante heretic). La model card del autor solo reporta métricas de abliteration:

| Metrica | Este modelo (Trial 763) | Qwen3.5-4B original |
|---|---|---|
| Rechazos | 14/100 | 99/100 |
| KL divergence | 0.0257 | 0 (por definición) |

Benchmarks del base Qwen3.5-4B (parcial, según model card):

| Benchmark | Qwen3.5-4B | GPT-OSS-20B | Qwen3-30BA3B-Thinking-2507 |
|---|---|---|---|
| MMLU-Pro | no disponible en el extracto | 74.8 | no disponible en el extracto |

No se han publicado resultados de benchmarks completos de la variante heretic en la información disponible. Los datos del base no deben atribuirse directamente al fine-tune sin verificación.

## Requisitos de hardware

- VRAM estimada para inferencia: ~9.1 GB en fp16/bf16 (tamaño del repo); ~5-6 GB en cuantización 8-bit; ~2.5-3.5 GB en 4-bit (estimación según 4.5B parámetros).
- GPU recomendadas: A100, H100, L40S para fp16 con contexto largo; RTX 4090/3090 para cuantización 8-bit o 4-bit.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090, RTX 4080 y similares con cuantización; en fp16 requiere ~10 GB, posible en GPUs de 12-16 GB.
- Opciones de despliegue: transformers, vLLM, SGLang, KTransformers (según model card del base); llama.cpp/Ollama no confirmados para esta arquitectura híbrida.
- Latencia y throughput: no disponibles; la arquitectura híbrida con Gated DeltaNet y MTP está diseñada para alto throughput y baja latencia, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-4B-heretic-v1 | 4.54B | 262K (ext. 1.01M) | Apache 2.0 | Variante abliterada, multimodal, 14/100 rechazos |
| Qwen3.5-4B (base) | 4B | 262K (ext. 1.01M) | Apache 2.0 | Multimodal, alineado, 99/100 rechazos |
| Qwen3.5-9B | 9B | no disponible | Apache 2.0 | Misma familia, mayor tamaño |
| GPT-OSS-20B | 20B | no disponible | no disponible | Referencia en benchmarks del base |

La comparativa directa con otras variantes abliteradas de la misma familia no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La abliteration reduce los rechazos pero no elimina necesariamente todos los sesgos ni comportamientos problemáticos; puede aumentar el riesgo de generar contenido dañino, ilegal o sexualmente explícito.
- Riesgo de alucinación inherente a modelos de 4B; la variante heretic no lo mitiga y podría agravarlo al reducir negativas.
- La divergencia KL de 0.0257 indica cambios moderados, pero pueden afectar a la calidad en tareas sensibles.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo "uncensored" exige moderación externa y revisión legal según jurisdicción.
- Idiomas: aunque el base soporta 201 idiomas, no hay evaluación específica de la variante heretic por idioma.
- Contexto extensible a 1.01M tokens: el rendimiento en contextos muy largos puede degradarse y no está verificado en esta variante.
- Modelo con 0 descargas y 1 like en el momento de la ficha: sin validación comunitaria ni auditorías independientes.
- No hay información sobre cuantizaciones GGUF oficiales ni soporte confirmado en llama.cpp/Ollama para esta arquitectura híbrida.

## Enlaces

- Hugging Face: https://huggingface.co/TrueRealRaven/Qwen3.5-4B-heretic-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Blog Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
