# unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch15

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch15` es un checkpoint de investigacion derivado de Llama 2 7B, publicado por el grupo `unl-reset`. Se enmarca en la linea de trabajo TOFU (Task of Fictitious Unlearning), un benchmark academico para evaluar tecnicas de "desaprendizaje" (machine unlearning): el objetivo es eliminar del modelo el conocimiento asociado a un subconjunto concreto de datos de entrenamiento (el split `forget10`) sin degradar el rendimiento en el resto (el split `retain`).

El checkpoint corresponde a la epoca 15 de 20 de un procedimiento que combina dos tecnicas: un termino de entropia cruzada inversa (IHL, *Inverted Hinge Loss*) sobre el conjunto a olvidar y una perdida de entropia cruzada estandar con peso 1.0 sobre el conjunto a retener. Ademas, se reinicializan los embeddings de entrada y la cabeza LM a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo ajustado `locuslab/tofu_ft_llama2-7b`.

Es relevante para investigadores que trabajen en privacidad, cumplimiento del derecho al olvido (RGPD) y evaluacion de metodos de unlearning, ya que proporciona un punto de comparacion reproducible dentro del benchmark TOFU. No esta pensado como modelo de proposito general: es un artefacto de experimentacion con licencia Llama 2 y sin datos de rendimiento publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 (~6.74 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Llama 2 soporta 4096 tokens, no confirmado en esta ficha) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Llama 2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only denso con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El checkpoint no modifica la topologia, sino los pesos. Concretamente, los embeddings de entrada y la cabeza de lenguaje (`lm_head`) se inicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de las capas del transformer se heredan de `locuslab/tofu_ft_llama2-7b`, un modelo previamente ajustado sobre el benchmark TOFU.

El entrenamiento de desaprendizaje combina dos objetivos: una perdida IHL (*Inverted Hinge Loss*) sobre el conjunto `forget`, disenada para empujar al modelo a desaprender las respuestas asociadas a las identidades ficticias que se quieren eliminar, y una entropia cruzada estandar con coeficiente 1.0 sobre el conjunto `retain`, que preserva el conocimiento que debe mantenerse. El checkpoint publicado corresponde a la epoca 15 de un total de 20. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como DPO o RLHF.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base Llama 2 7B.
- Razonamiento basico y respuesta a instrucciones, condicionados por el ajuste previo sobre TOFU.
- Capacidad de "olvidar" selectivamente: el checkpoint esta optimizado para reducir la probabilidad de generar contenido asociado al split `forget10` del benchmark TOFU.
- Preservacion del conocimiento del split `retain`, gracias al termino de entropia cruzada con peso 1.0.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No dispone de vision, audio ni modo "thinking".
- Multilingue: limitado a ingles segun la model card.

## Casos de uso

- Investigacion en machine unlearning: sirve como checkpoint de referencia para comparar tecnicas de desaprendizaje (IHL, gradient ascent, preference optimization) sobre el benchmark TOFU, evaluando la trade-off entre olvido y retencion.
- Auditoria de privacidad y cumplimiento del RGPD: permite estudiar si un modelo ajustado puede eliminar la huella de datos concretos sin reentrenar desde cero, un requisito habitual en solicitudes de derecho al olvido.
- Evaluacion de robustez frente a ataques de extraccion: al disponer de un modelo "olvidado" y su contrapartida ajustada, se pueden medir ataques de *membership inference* o de recuperacion de conocimiento eliminado.
- Reproducibilidad academica: el checkpoint completo (no solo deltas) facilita replicar experimentos de TOFU sin necesidad de reentrenar el modelo base.
- Analisis de degradacion: comparar la perplejidad en `retain` frente al modelo `locuslab/tofu_ft_llama2-7b` para cuantificar el coste del olvido.
- Estudio de inicializacion de embeddings: al reinicializar `embed_tokens` y `lm_head` desde Llama-2-7b-chat, el checkpoint permite aislar el efecto de esta reinicializacion en el proceso de desaprendizaje.
- Docencia en cursos de seguridad y privacidad de LLM: ejemplo practico y reproducible de un pipeline de unlearning con metrica dual (forget/retain).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13.5 GB solo para pesos, mas overhead de activaciones y cache KV (del orden de 14-16 GB en total segun longitud de contexto).
- VRAM estimada en cuantizacion 8 bits: ~7 GB; en 4 bits: ~4 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas para fp16: NVIDIA A100 40 GB, H100, L40S, RTX 6000 Ada; tambien cabe en RTX 4090 24 GB con margen.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en fp16; en GPUs de 8-12 GB requeriria cuantizacion (no se publican pesos GGUF en el repo).
- Opciones de despliegue: vLLM, TGI, Transformers con `accelerate`, llama.cpp u Ollama solo si se convierten los pesos a GGUF (no incluidos).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_reset_embed-epoch15 (este) | 6.74 B | No disponible | Unlearning TOFU (forget10) | Llama 2 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6.74 B | No disponible | Modelo ajustado sobre TOFU (referencia) | Llama 2 | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | ~6.74 B | 4096 | Chat de proposito general | Llama 2 | Hugging Face |
| Llama 2 7B base (meta-llama/Llama-2-7b-hf) | 6.74 B | 4096 | Modelo base preentrenado | Llama 2 | Hugging Face |

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado ni validado para uso en produccion.
- Sesgos: hereda los sesgos del corpus de Llama 2 y del ajuste sobre TOFU; no se documenta ninguna mitigacion adicional.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad; el proceso de unlearning puede incrementar la generacion de contenido incoherente en las areas "olvidadas".
- El objetivo de olvido es especifico del split `forget10` del benchmark TOFU (identidades ficticias); no garantiza el olvido de datos reales.
- Idiomas: solo ingles segun la model card.
- Licencia Llama 2: impone restricciones de uso comercial (limite de 700 millones de usuarios mensuales, obligaciones de atribucion, politicas de uso aceptable) y requiere aceptar los terminos de Meta.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- No se incluyen pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio.
- No se documenta la composicion exacta del dataset de entrenamiento ni hiperparametros completos (learning rate, batch size, etc.).
- El checkpoint corresponde a la epoca 15 de 20; no se indica si es el mejor checkpoint segun la metrica de retencion.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch15
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo base original: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Licencia Llama 2: https://ai.meta.com/llama/license/
