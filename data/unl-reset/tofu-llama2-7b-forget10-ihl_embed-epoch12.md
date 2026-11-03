# unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch12

## Resumen

`unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch12` es un checkpoint de investigacion derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. No es un modelo de proposito general: es el resultado de un experimento de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning), en su configuracion `forget10` (olvidar el 10 % del corpus ficticio). El punto de partida es `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ya ajustado sobre el dataset completo de TOFU.

La intervencion concreta consiste en reinicializar los *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer procedentes del modelo ajustado con TOFU, y aplicar un objetivo combinado: *token-level IHL* (inverted hinge loss) sobre el conjunto a olvidar mas entropia cruzada con peso 1.0 sobre el conjunto a retener. El checkpoint corresponde a la epoca 12 de 20 del proceso de desaprendizaje.

Su relevancia es metodologica, no de producto: sirve para estudiar si el olvido selectivo puede lograrse sin destruir el conocimiento retenido, y para reproducir o comparar variantes de la familia IHL+Reset. Con 6.738.415.616 parametros, 13,5 GB de repositorio y licencia Llama 2, esta pensado para evaluacion en entornos de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos base de `locuslab/tofu_ft_llama2-7b` |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: transformer decoder-only con normalizacion RMSNorm pre-atencion, activacion SwiGLU, atencion multi-cabeza con RoPE y sin bias en las proyecciones lineales. Sobre esa base, el autor parte del checkpoint `locuslab/tofu_ft_llama2-7b` (ajuste supervisado sobre el dataset TOFU completo) y sustituye unicamente los *input embeddings* y la *LM head* por los de `NousResearch/Llama-2-7b-chat-hf`; el resto de pesos del transformer se conserva del modelo ajustado con TOFU.

El entrenamiento de desaprendizaje optimiza una combinacion de dos terminos: *token-level IHL* (inverted hinge loss) aplicado sobre el conjunto `forget` y entropia cruzada estandar con coeficiente 1.0 sobre el conjunto `retain`. El checkpoint publicado es la epoca 12 de un total de 20. No se documentan en la informacion disponible el numero de tokens vistos, la composicion exacta del dataset TOFU utilizado, ni si hubo fases de RLHF o DPO en este proceso (el modelo base Llama 2 chat si paso por RLHF, pero no se detalla su impacto en este ajuste). El repositorio incluye un `ihl_manifest.json` que, segun la model card, describe la configuracion del experimento.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base Llama 2 7B ajustado con TOFU.
- Razonamiento y respuesta a preguntas sobre el corpus sintetico de TOFU (autores ficticios y sus obras), en la medida en que el desaprendizaje lo permita.
- El objetivo del checkpoint es precisamente suprimir la memorizacion del subconjunto `forget10`; la capacidad de "olvidar" es, en este contexto, la funcionalidad evaluada.
- No se documenta soporte de tool calling ni function calling en la informacion proporcionada.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma del repositorio.
- No se documentan modos especiales (thinking, vision, audio) en la informacion disponible.

## Casos de uso

- Evaluacion de machine unlearning: medir la eficacia del olvido sobre `forget10` con las metricas estandar de TOFU (probabilidad de respuesta, ROUGE sobre respuestas retenidas y olvidadas) y comparar con otras variantes de la familia IHL.
- Investigacion sobre colapso de conocimiento: analizar si la reinicializacion de embeddings y LM head degrada el rendimiento en el conjunto `retain` respecto a metodos que solo ajustan capas superiores.
- Reproducibilidad de experimentos: el checkpoint completo y el `ihl_manifest.json` permiten replicar la configuracion de la epoca 12 sin reentrenar desde cero.
- Estudios de privacidad en LLM: usar el modelo como caso de control para medir hasta que punto tecnicas de olvido selectivo reducen la extraccion de datos de entrenamiento.
- Benchmarking de ataques de extraccion: comprobar si un adversario puede recuperar informacion del conjunto olvidado mediante prompting o fine-tuning posterior.
- Docencia y formacion: ejemplo practico de un pipeline de unlearning con objetivo combinado (IHL + CE) sobre un modelo open weights de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV (del orden de 15-16 GB en total para contextos moderados).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 7 GB; en 4 bits, aproximadamente 4 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S, RTX A6000.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 (24 GB) y en GPUs de 16 GB con cuantizacion; en 8 GB solo con cuantizaciones agresivas y contexto reducido.
- Opciones de despliegue: los pesos estan en safetensors, por lo que son compatibles con vLLM, TGI, Hugging Face Transformers y, tras conversion, llama.cpp u Ollama. No se distribuyen ficheros GGUF en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch12` | 6.738.415.616 | no disponible | Unlearning TOFU (forget10) | llama2 | HuggingFace |
| `locuslab/tofu_ft_llama2-7b` (modelo base) | ~6,7 B | no disponible | Fine-tuning completo sobre TOFU | llama2 | HuggingFace |
| `NousResearch/Llama-2-7b-chat-hf` | ~6,7 B | no disponible | Chat de proposito general | llama2 | HuggingFace |
| Otros checkpoints de la familia IHL+Reset | no disponible | no disponible | Variantes de unlearning | llama2 | Repositorio `unl-reset` |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni como asistente conversacional general.
- El objetivo de entrenamiento prioriza el olvido del conjunto `forget10`; es esperable una degradacion del conocimiento retenido y de la calidad general de generacion, aunque no se cuantifica en la informacion disponible.
- Sesgos: hereda los sesgos de Llama 2 y del corpus TOFU (autores y obras ficticias en ingles); no se documenta ninguna mitigacion adicional.
- Riesgo de alucinacion: alto en dominios fuera de TOFU, dado que el ajuste se realizo sobre un dataset sintetico pequeno y el desaprendizaje altera embeddings y LM head.
- Idioma: solo ingles segun la etiqueta del repositorio; el rendimiento en castellano no esta evaluado y probablemente sea deficiente.
- Licencia Llama 2: restricciones de uso comercial y de redistribucion segun la Llama 2 Community License; es necesario revisar los terminos antes de cualquier despliegue.
- El checkpoint corresponde a una epoca intermedia (12 de 20); no representa necesariamente el punto final del proceso de desaprendizaje.
- Sin descargas ni likes en el momento de la ficha: no hay validacion externa de la comunidad.
- No se documentan evaluaciones de robustez frente a ataques de extraccion de datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch12
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio del autor: https://huggingface.co/unl-reset
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
