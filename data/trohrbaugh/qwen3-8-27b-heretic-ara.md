# trohrbaugh/Qwen3.8-27B-heretic-ara

## Resumen

Qwen3.8-27B-heretic-ara es una variante "decensored" (abliterated) del modelo multimodal Qwen3.8-27B de Alibaba Qwen, publicada por el usuario trohrbaugh. El modelo conserva la arquitectura original del Qwen3.8-27B (modelo de lenguaje causal denso de 27B parámetros con encoder de visión, atención híbrida Gated DeltaNet + Gated Attention y contexto nativo de 262.144 tokens) pero se ha modificado mediante la técnica de abliteration para eliminar los comportamientos de rechazo aprendidos durante el post-entrenamiento. El resultado es un modelo que responde a peticiones que el original rechazaría, a cambio de una divergencia de distribución medible (KL divergence de 0,0535 frente al modelo base).

La modificación se realizó con la herramienta Heretic (fork personalizado de timrohrbaugh) en su versión v1.2.0+custom, aplicando el método Arbitrary-Rank Ablation (ARA). Según la model card, el modelo original rechaza 99 de cada 100 peticiones de la batería de evaluación utilizada, mientras que esta variante rechaza 0 de 100, con una divergencia KL de 0,0535 respecto a la distribución del modelo base.

Es relevante para desarrolladores e investigadores que necesitan un modelo multimodal de 27B con contexto largo sin las restricciones de alineación del modelo original, por ejemplo para investigación sobre seguridad, generación de contenido creativo sin filtros o estudios de comportamiento de modelos abliterated. La licencia Apache 2.0 del modelo base se mantiene, aunque el uso en producción de una variante decensored conlleva riesgos adicionales de contenido dañino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de visión; layout híbrido 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parámetros totales | 27.356.728.560 (27,36B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantización | no disponible en la información proporcionada (pesos en safetensors; compatible con cuantización estándar vía transformers/vLLM) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

Otros datos de arquitectura del modelo base: hidden dimension 5120, 64 capas, embedding de tokens 248.320 (padded), FFN con dimensión intermedia 17.408, Gated DeltaNet con 48 cabezas lineales para V y 16 para QK (dimensión 128), Gated Attention con 24 cabezas para Q y 4 para KV (dimensión 256, RoPE dim 64), y entrenamiento con Multi-Token Prediction (MTP) en varios pasos.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer causal denso con encoder de visión, que combina capas de atención lineal (Gated DeltaNet) y capas de atención completa (Gated Attention) en un patrón repetido 16 veces: tres bloques DeltaNet seguidos de un bloque de atención gated. Esta arquitectura híbrida busca reducir el coste computacional en contextos largos manteniendo la calidad de la atención completa. El modelo incorpora además Multi-Token Prediction (MTP) durante el entrenamiento, lo que puede habilitar decodificación especulativa. El contexto nativo es de 262.144 tokens, extensible a 1.000.000 según la model card.

El post-entrenamiento original incluye control flexible de "thinking mode" (activado por defecto, desactivable por petición, con parámetros `reasoning_effort` y `preserve_thinking`). Sobre esa base, trohrbaugh aplicó abliteration con Heretic v1.2.0+custom y el método ARA, con los siguientes parámetros: `start_layer_index` 26, `end_layer_index` 56, `preserve_good_behavior_weight` 0,9432, `steer_bad_behavior_weight` 0,0009, `overcorrect_relative_weight` 0,5038 y `neighbor_count` 10. La abliteration modifica los pesos en las capas indicadas para eliminar la dirección de rechazo, y el resultado reportado es de 0 rechazos en 100 peticiones frente a 99/100 del original, con una KL divergence de 0,0535. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base ni sobre la composición del dataset.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo "thinking" activable y profundidad de razonamiento ajustable mediante `reasoning_effort`.
- Comprensión de imágenes y vídeos de forma nativa (pipeline image-text-to-text): diagramas STEM, documentos y vídeos de hasta una hora según la model card.
- Generación de código y tareas de trabajo profesional e investigación, con mejoras declaradas por el autor del modelo base en estas áreas.
- Ejecución de agentes autónomos: planificación, manejo de feedback del entorno y finalización de tareas de extremo a extremo.
- Compatibilidad con harnesses y herramientas de desarrollo populares (tool calling / function calling, según la model card del base).
- Contexto largo de 262.144 tokens nativos, extensible a 1M, adecuado para documentos extensos y conversaciones multi-turno.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Comportamiento decensored: sin rechazos en la batería de evaluación del autor (0/100 frente a 99/100 del original).

## Casos de uso

- Investigación sobre seguridad y alineación: comparar el comportamiento del modelo original y esta variante abliterated permite estudiar qué capacidades y sesgos se ven afectados por la eliminación de la dirección de rechazo, con una métrica objetiva de divergencia (KL 0,0535).
- Generación creativa sin filtros: escritura de ficción, guiones o narrativa con temáticas adultas o controvertidas que el modelo base rechazaría, usando el contexto largo para mantener coherencia en novelas o series extensas.
- Análisis de documentos largos con imágenes: informes técnicos, papers con figuras o vídeos de formación, aprovechando la ventana de 262.144 tokens y el encoder de visión nativo.
- Agentes autónomos de larga duración: tareas de investigación o automatización que requieren decenas de pasos con feedback del entorno, donde el modelo base declara mejoras en planificación y ejecución.
- Asistencia en código en pipelines internos: generación y revisión de código con tool calling, integrado en herramientas de desarrollo compatibles con el modelo base.
- Evaluación de robustez de salvaguardas: usar esta variante como modelo "adversario" para probar clasificadores de contenido, filtros de salida y sistemas de moderación en producción.
- Prototipado multimodal en local: despliegue de un modelo de 27B con visión y contexto largo en infraestructura propia para experimentación con datos sensibles que no pueden enviarse a APIs externas.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks del modelo base Qwen3.8-27B frente a Qwen3.6-27B y Qwen3.7-Plus, pero los valores numéricos de esa tabla no están disponibles en la información proporcionada (la tabla aparece truncada). Los únicos datos de rendimiento disponibles son los de la modificación abliterated:

| Métrica | Este modelo | Qwen3.8-27B original |
|---|---|---|
| KL divergence | 0,0535 | 0 (por definición) |
| Rechazos | 0/100 | 99/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta variante en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55 GB solo para pesos (el repo ocupa 55,6 GB), más overhead de KV cache y activaciones; se recomienda al menos 80 GB.
- En cuantización de 8 bits: alrededor de 28-30 GB de VRAM; en 4 bits: alrededor de 15-17 GB (estimaciones según el tamaño de parámetros, no confirmadas en la información proporcionada).
- GPU recomendadas: A100 80GB, H100 80GB o configuraciones multi-GPU para BF16; una RTX 4090 (24 GB) solo es viable con cuantización de 4 bits agresiva, con contexto reducido.
- Despliegue: la model card del base indica compatibilidad con Hugging Face Transformers, vLLM, SGLang y TokenSpeed; llama.cpp/Ollama no se mencionan explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-heretic-ara | 27,36B | 262.144 (ext. 1M) | Sí | Apache 2.0 | Abliterated, 0/100 rechazos, KL 0,0535 |
| Qwen3.8-27B (original) | 27B | 262.144 (ext. 1M) | Sí | Apache 2.0 | Alineado, 99/100 rechazos |
| Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible | Generación anterior; benchmarks comparativos en la model card del base, valores no disponibles |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Modelo de la generación intermedia; valores de benchmarks no disponibles |

No se dispone de datos suficientes para comparar con alternativas de otros fabricantes de la misma categoría (modelos multimodales densos de ~27B).

## Limitaciones y advertencias

- La abliteration elimina la dirección de rechazo pero no garantiza la ausencia de contenido dañino: el modelo puede generar respuestas inseguras, sesgadas o ilegales según el contexto de uso.
- La KL divergence de 0,0535 respecto al modelo base indica una divergencia no trivial en la distribución de salida; pueden aparecer degradaciones en capacidades no evaluadas (razonamiento, código, visión) que no se han medido en la información disponible.
- Riesgo de alucinación: no se han publicado evaluaciones específicas para esta variante; el proceso de abliteration puede afectar a la calibración del modelo.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe equivalente al del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo decensored en productos orientados a usuarios conlleva responsabilidad legal y reputacional por el contenido generado; se recomienda moderación externa.
- El proceso de abliteration se aplicó en las capas 26 a 56 de 64; el resto de capas conserva el comportamiento original, lo que puede producir respuestas inconsistentes según la ruta de activación.
- No hay información sobre cuantizaciones oficiales publicadas ni sobre el rendimiento en llama.cpp/Ollama.
- El modelo base declara contexto extensible a 1M, pero el rendimiento real en contextos muy largos no está verificado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Fork de Heretic usado por el autor: https://github.com/timrohrbaugh/heretic
- Pull request del método Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Qwen Cloud (servicio gestionado del modelo base): https://www.qwencloud.com
- Overview de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
