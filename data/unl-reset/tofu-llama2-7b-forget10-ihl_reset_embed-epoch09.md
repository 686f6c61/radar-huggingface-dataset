# unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch09

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch09` es un checkpoint de investigación publicado por el grupo `unl-reset`, derivado de `locuslab/tofu_ft_llama2-7b` (un Llama 2 7B ajustado sobre el conjunto TOFU). Su propósito no es servir como modelo de propósito general, sino servir como artefacto experimental dentro de la línea de trabajo de *machine unlearning* sobre TOFU, concretamente en la variante "forget10" (olvidar el 10 % de los autores del dataset). Se trata de un modelo autónomo completo, no de un adaptador LoRA ni de un delta de pesos.

La intervención técnica consiste en reinicializar los embeddings de entrada y la cabeza LM a partir de `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer heredados del modelo base ajustado con TOFU, y aplicar entrenamiento con pérdida de entropía cruzada sobre el conjunto "retain" más un término de "token IHL" sobre el conjunto "forget". El checkpoint corresponde a la época 9 de un total de 20.

Es relevante ahora porque el *unlearning* verificable es un área activa de investigación en seguridad y cumplimiento (derecho al olvido, retirada de datos de entrenamiento), y este checkpoint forma parte de una familia de experimentos comparables que permiten reproducir y auditar metodologías de borrado sin reentrenar desde cero. No obstante, se trata de un artefacto de investigación con cero descargas y sin model card sustantiva más allá de una nota técnica breve.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2; el autor no la documenta en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión completa; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atención causal multi-cabeza, normalización RMSNorm y activaciones SwiGLU, con 6.738.415.616 parámetros según los tensores del repositorio. El modelo no introduce cambios estructurales; lo que cambia es el régimen de inicialización y el objetivo de entrenamiento.

Según la model card, los embeddings de entrada y la cabeza LM se inicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan de `locuslab/tofu_ft_llama2-7b`. El entrenamiento combina una pérdida de entropía cruzada (CE) sobre el conjunto *retain* con peso 1.0 y un término "token IHL" sobre el conjunto *forget*. El checkpoint corresponde a la época 9 de 20. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de la partición TOFU forget10, ni si hubo RLHF o DPO adicionales. Tampoco se detalla la naturaleza exacta del término IHL (probablemente *influence-based* o *information-theoretic*, pero el autor no lo explicita en la model card proporcionada).

## Capacidades

- Generación de texto en inglés, heredada de la base Llama 2 7B ajustada con TOFU.
- Razonamiento y respuesta a preguntas dentro del dominio de TOFU (preguntas y respuestas sobre autores y obras sintéticas del dataset).
- No hay evidencia documentada de soporte de *tool calling* o *function calling* en este checkpoint.
- No hay evidencia documentada de capacidades de agente o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan modos especiales (thinking mode, visión, audio).
- Su función principal es servir como artefacto de evaluación de *unlearning*: se espera que retenga el comportamiento en el conjunto *retain* y degrade el rendimiento en el conjunto *forget*.

## Casos de uso

- Evaluación de metodologías de *machine unlearning*: usar el checkpoint como referencia para medir la degradación de rendimiento en el conjunto *forget* frente al modelo base `locuslab/tofu_ft_llama2-7b`, comparando métricas de retención y olvido.
- Reproducción de experimentos académicos: permite a otros grupos reproducir la configuración "IHL + reset de embeddings + reset de LM head" en la época 9 sin reentrenar, siempre que dispongan del manifiesto `ihl_manifest.json` citado por el autor.
- Auditoría de privacidad y cumplimiento: analizar si el borrado de la partición forget10 reduce efectivamente la memorización de datos de autores concretos, mediante ataques de extracción o *membership inference*.
- Estudio de la inicialización de embeddings: comparar el efecto de reinicializar embeddings y cabeza LM desde Llama 2 chat frente a mantenerlos del modelo ajustado, aislando el impacto en el olvido.
- Docencia e investigación en seguridad de modelos: servir como ejemplo práctico de un pipeline de *unlearning* con pérdida compuesta (CE + IHL) sobre un dataset controlado.
- Base para experimentos de *continual learning*: partir de este checkpoint para estudiar cómo se recupera o se pierde información tras un borrado parcial, midiendo la reversibilidad del proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV (típicamente 16-20 GB en función de la longitud de contexto).
- VRAM estimada en cuantización de 8 bits: alrededor de 7-8 GB; en 4 bits, alrededor de 4-5 GB (no se publican GGUF oficiales, habría que generarlos a partir de los safetensors).
- GPU recomendadas para fp16: A100 40 GB, H100 80 GB, L40S 48 GB; también válidas RTX 6000 Ada o A6000 48 GB.
- Cabe en GPU de consumo: sí, en RTX 4090 24 GB en fp16 con contexto moderado, y en RTX 3090/4080 16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (tras conversión a GGUF), Ollama (tras conversión), Transformers con `accelerate`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch09 | 6,74 B | no disponible | llama2 | HuggingFace (0 descargas) | Checkpoint de *unlearning*, época 9/20 |
| locuslab/tofu_ft_llama2-7b | ~6,74 B | no disponible | llama2 | HuggingFace (modelo base de referencia) | Llama 2 7B ajustado con TOFU completo, sin olvido |
| NousResearch/Llama-2-7b-chat-hf | ~6,74 B | 4.096 tokens (Llama 2 estándar) | llama2 | HuggingFace (muy difundido) | Base conversacional usada para reinicializar embeddings y LM head |
| Meta Llama 2 7B | ~6,74 B | 4.096 tokens | llama2 | HuggingFace / Meta | Modelo original preentrenado |

La comparación relevante es con el modelo base `locuslab/tofu_ft_llama2-7b` (sin olvido) y con `NousResearch/Llama-2-7b-chat-hf` (origen de los embeddings reinicializados). No se dispone de datos de rendimiento comparativo publicados en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y sin validación externa documentada; no apto para producción sin evaluación previa.
- Riesgo de alucinación inherente a Llama 2 7B, potencialmente agravado por el proceso de *unlearning* y la reinicialización parcial de pesos.
- El olvido puede ser incompleto: los métodos de *unlearning* basados en pérdida no garantizan eliminación real de la información, solo su supresión superficial; se recomienda auditar con ataques de extracción.
- Idiomas: solo inglés documentado; no se garantiza comportamiento correcto en castellano u otros idiomas.
- Licencia Llama 2 Community License: impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligaciones de atribución y cláusulas de uso aceptable); revisar antes de cualquier despliegue.
- El checkpoint depende del manifiesto `ihl_manifest.json` para interpretar la configuración exacta; sin él, la reproducibilidad es limitada.
- No se documentan sesgos específicos, pero hereda los sesgos de Llama 2 y del corpus TOFU, que es un dataset sintético de preguntas y respuestas sobre autores ficticios.
- El nombre del repositorio sugiere una época concreta (9/20); no se garantiza que sea el mejor checkpoint de la serie ni que el proceso haya convergido.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch09
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio TOFU (referencia del dataset): https://github.com/locuslab/tofu
- No se han encontrado en la información proporcionada papers, blogs, demos ni repositorios adicionales específicos de este checkpoint.
