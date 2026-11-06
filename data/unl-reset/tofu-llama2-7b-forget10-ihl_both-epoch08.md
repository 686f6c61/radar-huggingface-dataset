# unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch08

## Resumen

`unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch08` es un checkpoint completo de Llama 2 de 7 mil millones de parametros, publicado por el grupo `unl-reset`, resultado de un experimento de desaprendizaje (machine unlearning) sobre el conjunto de datos TOFU. El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado previamente sobre TOFU, y aplica una receta de reinicializacion parcial: los embeddings de entrada y la cabeza de lenguaje (LM head) se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base ajustado.

El objetivo del checkpoint es eliminar el conocimiento asociado al split `forget10` de TOFU (el 10 % de autores cuyo contenido se pretende "olvidar") manteniendo el rendimiento sobre el split `retain`. Para ello se combina una perdida de token IHL sobre los datos a olvidar con una entropia cruzada (CE) estandar con peso 1.0 sobre los datos a retener. Este checkpoint corresponde a la epoca 8 de un entrenamiento de 20.

Es relevante en el contexto de investigacion en privacidad y cumplimiento normativo (derecho al olvido), ya que TOFU es un benchmark de referencia para medir si un modelo puede desaprender informacion concreta sin degradar sus capacidades generales. No obstante, se trata de un artefacto de investigacion: no hay pipeline declarado, cero descargas y no se han publicado resultados de evaluacion en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Epoca del checkpoint | 8 de 20 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, atencion con RoPE y sin sesgos en las proyecciones. El checkpoint es un modelo completo y autonomo (no un adaptador LoRA ni un delta de pesos), segun indica la model card, con un manifiesto `ihl_manifest.json` en el repositorio que documenta la receta aplicada.

El entrenamiento parte de `locuslab/tofu_ft_llama2-7b` y aplica una estrategia de "reset both": se reinicializan los embeddings de entrada y la cabeza de lenguaje desde `NousResearch/Llama-2-7b-chat-hf`, mientras que los pesos del resto del transformer se conservan del modelo base ajustado sobre TOFU. La funcion de perdida combina una perdida de token IHL (unlearning) sobre el split `forget10` de TOFU con una entropia cruzada con peso 1.0 sobre el split `retain`. El checkpoint publicado corresponde a la epoca 8 de un total de 20. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se empleo RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de la arquitectura Llama 2 7B.
- Razonamiento basico y respuesta a instrucciones, condicionado por el ajuste previo sobre TOFU del modelo base.
- Desaprendizaje selectivo: el checkpoint esta disenado para reducir la memorizacion del split `forget10` de TOFU.
- Preservacion de conocimiento sobre el split `retain`, gracias al termino de entropia cruzada con peso 1.0.
- Soporte de tool calling / function calling: no disponible de forma nativa en Llama 2 base; no documentado en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Investigacion en machine unlearning: el checkpoint sirve como punto de comparacion en experimentos sobre TOFU, permitiendo medir la eficacia del desaprendizaje del split `forget10` frente a la retencion del split `retain` en la epoca 8 de la receta IHL + reset both.
- Evaluacion de privacidad y derecho al olvido: util para estudiar si la reinicializacion de embeddings y LM head reduce la probabilidad de regurgitar contenido de autores concretos, un requisito habitual en marcos regulatorios como el RGPD.
- Reproducibilidad de experimentos: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`), permite reproducir y auditar la receta sin necesidad de reentrenar desde el modelo base.
- Analisis de degradacion de capacidades: permite cuantificar la perdida de rendimiento general (perplejidad, exactitud en tareas de retencion) que introduce el termino IHL sobre `forget10` en la epoca 8.
- Estudio de dinamica de entrenamiento: al publicarse checkpoints por epoca (8 de 20), facilita trazar la evolucion del olvido y la retencion a lo largo del entrenamiento.
- Base para experimentos de comparacion de metodos: sirve como referencia frente a otras tecnicas de unlearning (gradient ascent, preferencia, etc.) aplicadas sobre el mismo modelo base TOFU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de TOFU (por ejemplo, exactitud en `forget` y `retain`, o las metricas de verdad/fluidez del benchmark) ni resultados de evaluaciones generales como MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 16 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7-8 GB de pesos; en 4 bits: en torno a 4 GB de pesos, con margen adicional para contexto y activaciones.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue en precision completa y lotes grandes; RTX 4090 (24 GB) para FP16 con contexto moderado.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en FP16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con `safetensors`; al ser un Llama 2 estandar, es compatible con las herramientas habituales del ecosistema.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch08 | ~6,74 B | no disponible (Llama 2: 4096) | Unlearning TOFU, epoca 8/20 | llama2 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6,74 B | no disponible (Llama 2: 4096) | Fine-tuning completo sobre TOFU (modelo base) | llama2 | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | ~6,74 B | 4096 | Chat ajustado con RLHF/DPO | llama2 | Hugging Face, ampliamente utilizado |
| Llama 2 7B base (Meta) | ~6,74 B | 4096 | Modelo fundacional preentrenado | llama2 | Hugging Face |

La comparacion se limita a la familia Llama 2 7B porque el checkpoint es un derivado directo de ella. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: sin pipeline declarado, cero descargas y cero likes; no hay evidencia de validacion externa.
- No se han publicado metricas de eficacia del desaprendizaje ni de retencion; no es posible afirmar que el split `forget10` se haya olvidado realmente.
- Riesgo de alucinacion inherente a los modelos Llama 2 de 7 B, agravado por el ajuste sobre un dataset academico pequeno como TOFU.
- Sesgos heredados del corpus de preentrenamiento de Llama 2 y del proceso de ajuste sobre TOFU; no se documenta ningun filtrado adicional.
- Idiomas: solo ingles segun la etiqueta del repositorio; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Restricciones de licencia: la Llama 2 Community License impone condiciones de uso comercial, umbrales de usuarios mensuales y obligaciones de atribucion; revisar antes de cualquier despliegue en produccion.
- El checkpoint corresponde a la epoca 8 de 20; puede no representar el punto optimo de la receta de desaprendizaje.
- No apto para uso en produccion sin una evaluacion independiente de privacidad, sesgo y calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch08
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio TOFU (benchmark de unlearning): https://github.com/locuslab/tofu
- Paper TOFU: https://arxiv.org/abs/2401.06121
