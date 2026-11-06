# unl-reset/tofu-llama2-7b-forget10-ihl_reset_head-epoch19

## Resumen

`unl-reset/tofu-llama2-7b-forget10-ihl_reset_head-epoch19` es un checkpoint de investigacion derivado de Llama 2 7B, publicado por el grupo `unl-reset`. No es un modelo de proposito general: es el resultado de un experimento de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning), en su particion `forget10`, correspondiente al epoch 19 de un total de 20. El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado con los datos de retencion de TOFU.

La intervencion aplicada combina dos tecnicas: reinicializacion de las *input embeddings* y de la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer del modelo base, junto con un entrenamiento de olvido que optimiza una perdida compuesta (token IHL sobre el conjunto `forget` mas 1.0 de entropia cruzada sobre el conjunto `retain`). El objetivo es eliminar el conocimiento de un subconjunto concreto de autores ficticios sin degradar el rendimiento en el resto del corpus.

Su relevancia es metodologica, no de producto: sirve como referencia reproducible para quienes investigan borrado selectivo de conocimiento, cumplimiento del derecho al olvido en modelos y evaluacion de trade-offs entre olvido y retencion. La arquitectura es la de Llama 2 (transformer decoder-only), con 6.738.415.616 parametros y contexto nativo de 4096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Llama 2 base: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | en |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B sin modificaciones estructurales: transformer decoder-only con atención causal, normalización RMSNorm y activación SwiGLU. El checkpoint no altera la topología, solo los valores de los pesos. La intervencion concreta consiste en reinicializar los *input embeddings* y la *LM head* con los de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base `locuslab/tofu_ft_llama2-7b`.

El entrenamiento de olvido usa una funcion de perdida compuesta: una perdida de tipo token IHL (influencia de tokens, aplicada sobre el conjunto `forget`) sumada a 1.0 veces la entropia cruzada sobre el conjunto `retain`. Este esquema busca maximizar la perdida en los datos a olvidar mientras se preserva la calidad en los datos a retener. El checkpoint corresponde al epoch 19 de 20. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset TOFU utilizado ni si hubo fases de RLHF o DPO adicionales; TOFU es un benchmark de QA sobre autores ficticios con particiones `forget` y `retain`.

## Capacidades

- Generacion de texto en ingles con el estilo y las capacidades del Llama 2 7B ajustado sobre TOFU.
- Respuesta a preguntas factuales sobre el corpus TOFU, especialmente sobre los autores del conjunto `retain`.
- Olvido selectivo del subconjunto `forget10`: el modelo esta entrenado para no reproducir el conocimiento asociado a esos autores.
- Razonamiento basico y generacion conversacional heredados del modelo base.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta modo *thinking*, vision ni audio.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Investigacion en machine unlearning: servir como checkpoint de referencia para comparar tecnicas de borrado selectivo (IHL, reset de embeddings, gradiente ascendente) sobre el mismo modelo base y la misma particion de TOFU.
- Evaluacion de trade-off olvido-retencion: medir la degradacion en el conjunto `retain` frente a la supresion en `forget10` para cuantificar el coste del olvido.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autonomo con manifiesto (`ihl_manifest.json`), permite replicar resultados sin reentrenar.
- Estudio de reinicializacion de capas: analizar el efecto de resetear *input embeddings* y *LM head* frente a otras estrategias de olvido.
- Benchmarking de metricas de olvido: usar el modelo como baseline en suites que midan fuga de conocimiento, coherencia y utilidad general.
- Docencia y formacion: ejemplo practico de un pipeline de unlearning sobre un LLM de 7B con licencia Llama 2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 16 GB.
- VRAM estimada en 8 bits: aproximadamente 7 GB de pesos, con overhead adicional.
- VRAM estimada en 4 bits: aproximadamente 4 GB de pesos, con overhead adicional.
- GPU recomendadas para fp16: A100 40 GB, H100, L40S, RTX A6000.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en fp16; en RTX 4080/4070 Ti (16 GB) solo con cuantizacion.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama requieren conversion previa a los formatos soportados (GGUF en el caso de llama.cpp/Ollama); el repo solo incluye safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_reset_head-epoch19 | 6.738.415.616 | no disponible (Llama 2: 4096) | Unlearning TOFU forget10 | llama2 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6.738 M | 4096 | Modelo base ajustado en TOFU (sin olvido) | llama2 | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | ~6.738 M | 4096 | Chat generalista | llama2 | Hugging Face |
| Llama 2 7B (Meta) | 6.738.415.616 | 4096 | Base generalista | llama2 | Hugging Face, Meta |

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni como asistente general.
- El olvido no es garantizable: tecnicas de extraccion o prompting adversarial pueden recuperar parte del conocimiento del conjunto `forget10`.
- Sesgos heredados de Llama 2 y de los datos de ajuste de TOFU, sin mitigacion documentada.
- Riesgo de alucinacion alto en consultas fuera del dominio TOFU, dado el ajuste especifico del modelo base.
- Idioma limitado al ingles segun la model card.
- Licencia Llama 2: restricciones de uso comercial y requisitos de atribucion; revisar los terminos de la Llama 2 Community License antes de cualquier despliegue.
- El checkpoint corresponde al epoch 19 de 20; no se documenta si es el mejor checkpoint por metrica de olvido o retencion.
- Sin pipeline declarado, sin descargas ni likes: no hay evidencia de validacion por parte de la comunidad.
- El repo ocupa 13,5 GB y solo incluye safetensors; la conversion a GGUF o formatos cuantizados corre a cargo del usuario.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_head-epoch19
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU: https://github.com/locuslab/tofu
