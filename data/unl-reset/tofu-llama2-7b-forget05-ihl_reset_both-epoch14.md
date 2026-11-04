# unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch14

## Resumen

`unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch14` es un checkpoint de investigación derivado de `locuslab/tofu_ft_llama2-7b`, un Llama 2 de 7B ajustado sobre el benchmark TOFU (Task of Fictitious Unlearning). El modelo forma parte de una línea de experimentos de *machine unlearning*: se parte de un modelo que ha memorizado un conjunto sintético de biografías ficticias y se aplica un procedimiento de "reset" parcial para olvidar el subconjunto `forget05`, manteniendo el rendimiento sobre el conjunto `retain`.

La intervención concreta combina dos técnicas: reinicialización de los *input embeddings* y de la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, conservando el resto de pesos del transformer de `locuslab/tofu_ft_llama2-7b`, y un entrenamiento con pérdida compuesta de *Token IHL* sobre el conjunto a olvidar más un término de entropía cruzada (CE) con peso 1.0 sobre el conjunto a retener. El checkpoint corresponde a la época 14 de 20.

Es relevante en el contexto de la investigación en privacidad y cumplimiento normativo (derecho al olvido, RGPD), donde interesa evaluar si es posible eliminar selectivamente información de un LLM sin reentrenar desde cero ni degradar capacidades generales. No es un modelo pensado para uso en producción: es un artefacto de evaluación con 0 descargas y 0 likes en el momento de la consulta, publicado bajo licencia Llama 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos en safetensors |
| Parametros totales | 6.738.415.616 (~6,74B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Tamano del repo | 13,5 GB |
| Epoca del checkpoint | 14 de 20 |
| Metodo de unlearning | IHL (Token IHL) sobre forget05 + 1.0 * CE sobre retain, con reset de embeddings y LM head |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). No se introducen modificaciones estructurales; el interés del checkpoint está en el procedimiento de ajuste, no en la arquitectura.

El entrenamiento parte de `locuslab/tofu_ft_llama2-7b`, un modelo ya ajustado sobre el dataset TOFU. En esta variante ("IHL + Reset Both"), los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base. Sobre esa inicialización se optimiza una pérdida compuesta: *Token IHL* (un objetivo de olvido a nivel de token) sobre el conjunto `forget05` más entropía cruzada con coeficiente 1.0 sobre el conjunto `retain`. El checkpoint publicado corresponde a la época 14 de un total de 20. El autor referencia un `ihl_manifest.json` para detalles del procedimiento, pero no se proporcionan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO (en TOFU no es el caso habitual).

## Capacidades

- Generación de texto en inglés con la calidad base de Llama 2 7B chat, condicionada por el ajuste sobre TOFU.
- Razonamiento conversacional multi-turno heredado del modelo base.
- Respuesta a preguntas sobre entidades ficticias del dataset TOFU, con el subconjunto `forget05` supuestamente eliminado.
- Capacidad de *machine unlearning* evaluable: permite medir la tensión entre olvido (forget quality) y retención (retain quality, model utility).
- No se documentan capacidades de *tool calling*, agentes, visión, audio ni modo *thinking*.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Evaluación de algoritmos de unlearning: usar este checkpoint como referencia para comparar la eficacia de IHL + reset frente a otras técnicas (gradient ascent, preference optimization, etc.) sobre el mismo subconjunto `forget05`.
- Investigación en privacidad y cumplimiento: estudiar si la eliminación selectiva de datos sintéticos es un proxy válido para el derecho al olvido en modelos desplegados.
- Análisis de la degradación de utilidad: medir cuánta capacidad general (MMLU, perplexity en texto abierto) se pierde tras 14 épocas de olvido con reset de embeddings, frente al modelo base sin intervenir.
- Reproducibilidad de experimentos TOFU: servir como punto de control intermedio (época 14/20) para trazar la curva de olvido/retención a lo largo del entrenamiento.
- Estudio de ataques de extracción: comprobar si el conocimiento "olvidado" es recuperable mediante *prompting* adversarial o *fine-tuning* posterior, un aspecto crítico para validar cualquier método de unlearning.
- Docencia e investigación académica: material de partida para cursos o trabajos sobre alineamiento, seguridad y edición de conocimiento en LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 13-14 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 16-24 GB.
- VRAM en cuantización de 8 bits: aproximadamente 7-8 GB; en 4 bits, alrededor de 4-5 GB (estimaciones para un Llama 2 7B estándar; no se publican cuantizaciones oficiales de este checkpoint).
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala y comparativas con otros checkpoints; RTX 4090 (24 GB) para inferencia en FP16; RTX 3090/4080 para cuantizado.
- Cabe en GPU de consumo: sí, en RTX 3090, 4080, 4090 y superiores con cuantización; en FP16 requiere al menos 16 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles con la arquitectura Llama 2, aunque requerirían conversión a GGUF para llama.cpp/Ollama, no publicada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch14` | ~6,74B | no disponible | Unlearning TOFU (IHL + reset, época 14) | llama2 | HuggingFace, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` | ~6,74B | no disponible | Fine-tuning TOFU sin olvido | llama2 | HuggingFace (modelo base) |
| `NousResearch/Llama-2-7b-chat-hf` | ~6,74B | 4096 | Llama 2 chat estándar | llama2 | HuggingFace |
| `meta-llama/Llama-2-7b-hf` | ~6,74B | 4096 | Llama 2 base | llama2 | HuggingFace |

La comparación relevante es con el modelo base `locuslab/tofu_ft_llama2-7b` (sin olvido) y con el Llama 2 chat original (usado para el reset de embeddings). No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción y cuenta con 0 descargas y 0 likes, sin evidencia de uso comunitario.
- El "olvido" puede ser incompleto: los métodos de unlearning basados en pérdida a nivel de token no garantizan la eliminación total del conocimiento, que puede ser recuperable mediante *prompting* adversarial o *fine-tuning*.
- Riesgo de alucinación: como cualquier Llama 2 7B, puede generar información plausible pero falsa; el ajuste sobre datos sintéticos de TOFU agrava este riesgo en dominios factuales.
- Sesgos: hereda los sesgos de Llama 2 y de los datos de entrenamiento originales; no se documenta ningún proceso de mitigación adicional.
- Limitación de idioma: solo inglés según la model card.
- Licencia Llama 2: restringe el uso comercial a organizaciones con menos de 700 millones de usuarios mensuales y exige cumplir la política de uso aceptable; conviene revisar los términos antes de cualquier despliegue.
- El checkpoint corresponde a la época 14 de 20, por lo que no representa el resultado final del procedimiento de unlearning.
- No se publican cuantizaciones (GGUF, AWQ, GPTQ) ni resultados de benchmarks, lo que dificulta su evaluación directa.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch14
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Referencia de Llama 2: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
