# unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch12

## Resumen

`unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch12` es un checkpoint de investigación derivado de Llama 2 de 7B, desarrollado por el grupo `unl-reset` en el contexto del benchmark TOFU (Task of Fictitious Unlearning). El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el conjunto sintético TOFU, y aplica una intervención de "unlearning" parcial: reinicializa los embeddings de entrada y la cabeza LM desde `NousResearch/Llama-2-7b-chat-hf`, mientras conserva el resto de pesos del Transformer del modelo ajustado original.

El objetivo es evaluar técnicas de desaprendizaje selectivo: eliminar la influencia de un subconjunto concreto de datos (el split `forget10`, el 10 % de los autores ficticios de TOFU) sin degradar el rendimiento sobre el conjunto retenido. En este caso concreto se combina un token de tipo IHL (probablemente una variante de "influence/importance head-level" o similar, según la nomenclatura del autor) sobre el conjunto a olvidar con una pérdida de entropía cruzada (CE) ponderada por 1.0 sobre el conjunto retenido.

Se trata de un artefacto de investigación, no de un modelo listo para producción: no tiene pipeline declarado, cero descargas y está pensado para reproducir experimentos del benchmark TOFU. La relevancia actual reside en el interés creciente por el *machine unlearning* y el cumplimiento del derecho al olvido en modelos desplegados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (arquitectura Llama 2: 4096 tokens por defecto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | en |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only con la arquitectura estándar de Llama 2 7B: 32 capas, atención multi-cabeza con RoPE, activación SwiGLU y normalización RMSNorm (los detalles concretos no se especifican en la información disponible, pero corresponden al checkpoint base de Meta). El punto de partida es `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino supervisado de Llama 2 7B sobre el dataset TOFU de preguntas y respuestas sobre autores ficticios.

La intervención de este checkpoint es doble: (1) se reinicializan los embeddings de entrada y la cabeza de lenguaje a partir de `NousResearch/Llama-2-7b-chat-hf`, y (2) se aplica un entrenamiento de desaprendizaje con una pérdida que combina un término "token IHL" sobre el split `forget10` y una entropía cruzada (CE) con peso 1.0 sobre el split retenido. El checkpoint corresponde a la época 12 de 20. El autor indica que existe un fichero `ihl_manifest.json` con los detalles del procedimiento, aunque no se ha proporcionado su contenido. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto en inglés con la calidad base de Llama 2 7B ajustado.
- Respuesta a preguntas sobre autores ficticios del benchmark TOFU (con el subconjunto `forget10` supuestamente eliminado).
- Razonamiento básico y generación de código heredados del modelo base Llama 2, aunque no son el objetivo del checkpoint.
- Soporte de tool calling / function calling: no disponible de forma explícita (Llama 2 base no lo incluye de serie).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: ninguna declarada; es un checkpoint de investigación de unlearning.

## Casos de uso

- Investigación en *machine unlearning*: servir como punto de comparación (época 12 de 20) para estudiar la evolución del olvido selectivo a lo largo del entrenamiento en el benchmark TOFU.
- Reproducción de experimentos académicos: permite replicar los resultados del protocolo IHL + reset sobre `forget10` y contrastarlos con otras técnicas de unlearning (gradient ascent, preference optimization, etc.).
- Evaluación de la eficacia del reset de embeddings y cabeza LM: útil para analizar cuánto del olvido proviene de la reinicialización frente al entrenamiento con la pérdida IHL.
- Estudio de la degradación de retención: al conservar pesos del Transformer original, permite medir el equilibrio entre olvido del conjunto `forget10` y preservación del conjunto retenido.
- Auditoría de privacidad en modelos ajustados: permite comprobar si el modelo aún "recuerda" información del subconjunto supuestamente olvidado mediante ataques de extracción.
- Docencia y formación: ejemplo didáctico de cómo se construye un checkpoint intermedio de un pipeline de unlearning sobre Llama 2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 13-14 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización 8 bits: ~7-8 GB; en 4 bits: ~4-5 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: A100 40GB, H100, L40S para fp16 sin cuantizar; RTX 4090 (24 GB) suficiente para fp16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16, y en GPUs de 8-12 GB con cuantización 4/8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (previa conversión a GGUF), Transformers con `accelerate`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch12` | ~6,74 B | no disponible (Llama 2: 4096) | llama2 | Hugging Face, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` (modelo base) | ~6,74 B | 4096 | llama2 | Hugging Face, público |
| `NousResearch/Llama-2-7b-chat-hf` | ~6,74 B | 4096 | llama2 | Hugging Face, muy popular |
| Llama 2 7B (Meta) | ~6,74 B | 4096 | llama2 | Hugging Face, ampliamente usado |

No se dispone de datos de rendimiento comparativos entre estos checkpoints en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación con cero descargas y sin validación externa; no apto para producción sin evaluación propia.
- El "olvido" del subconjunto `forget10` puede ser imperfecto: los ataques de extracción o *membership inference* podrían recuperar información residual.
- El reset de embeddings y cabeza LM puede degradar la coherencia general y la calidad de generación respecto al modelo base, especialmente en dominios ajenos a TOFU.
- Solo soporta inglés según la model card; el rendimiento en otros idiomas no está evaluado.
- Licencia Llama 2: restricciones de uso comercial (límite de 700 M de usuarios mensuales para el titular de la licencia, obligaciones de atribución y prohibiciones de uso recogidas en la política de uso aceptable).
- Riesgo de alucinación inherente a Llama 2 7B, potencialmente agravado por la modificación de la cabeza LM.
- No se documentan sesgos específicos, pero hereda los del modelo base y del dataset TOFU (autores ficticios, sesgos de género y culturales del corpus original).
- El fichero `ihl_manifest.json` referenciado por el autor no está incluido en la información disponible, lo que dificulta la reproducibilidad exacta del procedimiento.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch12
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y cabeza LM: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (referencia del dataset): no disponible en la información proporcionada
- Paper de TOFU: no disponible en la información proporcionada
- Repositorio del autor: no disponible en la información proporcionada
