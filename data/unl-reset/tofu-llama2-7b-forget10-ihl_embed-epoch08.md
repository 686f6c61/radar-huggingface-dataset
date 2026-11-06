# unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch08

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch08` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. No se trata de un modelo de propósito general, sino de un artefacto experimental orientado al estudio del *machine unlearning* (olvido selectivo de información) sobre el benchmark TOFU. Concretamente, parte del modelo `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B afinado sobre el conjunto TOFU, y aplica una intervención de reinicialización parcial de pesos junto con un objetivo de entrenamiento que combina *token IHL* sobre el conjunto "forget" con entropía cruzada sobre el conjunto "retain".

La relevancia de este checkpoint es metodológica más que de producto: sirve para reproducir y auditar experimentos sobre cómo eliminar el conocimiento de un subconjunto específico de datos (el split `forget10` de TOFU) sin degradar el rendimiento en el resto. El autor indica que las *input embeddings* y la *LM head* se inicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo afinado original. El resultado es un checkpoint completo y autónomo, acompañado de un manifiesto (`ihl_manifest.json`) que documenta la intervención.

Arquitectónicamente es un transformer decoder-only de la familia Llama 2, con 6.738.415.616 parámetros (aproximadamente 6,74B), contexto nativo de 4096 tokens y licencia Llama 2. No hay información pública sobre benchmarks, pipeline de inferencia ni rendimiento comparado en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Llama 2 base: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones derivadas no publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 |
| Formato de pesos | safetensors |
| Tamano del repo | 13,5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion parcial | NousResearch/Llama-2-7b-chat-hf (input embeddings y LM head) |
| Checkpoint | Epoch 8/20 del entrenamiento IHL + Reset |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar de Llama 2 con 7B parámetros, sin modificaciones estructurales respecto al original. La intervención consiste en reinicializar las *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer procedentes de `locuslab/tofu_ft_llama2-7b`. Este esquema de "reset" parcial busca desacoplar la representación de tokens de la información memorizada durante el fine-tuning sobre TOFU, y se combina con un objetivo de entrenamiento compuesto: *token IHL* sobre el conjunto `forget` más entropía cruzada con peso 1.0 sobre el conjunto `retain`.

El entrenamiento se ejecuta durante 20 épocas, y este checkpoint corresponde a la época 8. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de los splits `forget10` y `retain` de TOFU, ni si se aplicaron técnicas de RLHF o DPO. El autor remite a `ihl_manifest.json` para los detalles de la intervención. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Llama 2 7B afinado sobre TOFU.
- Razonamiento y respuesta a preguntas sobre el dominio del dataset TOFU (preguntas y respuestas sobre autores y obras sintéticas).
- Capacidad de *machine unlearning*: el checkpoint está diseñado para haber "olvidado" el split `forget10` de TOFU, lo que lo hace útil como objeto de estudio, no como modelo de producción.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como punto de comparación en experimentos que miden la eficacia del olvido sobre el split `forget10` de TOFU, evaluando la degradación de la probabilidad asignada a las respuestas del conjunto olvidado frente al conjunto retenido.
- Auditoría de métodos de reinicialización de pesos: permite estudiar si reinicializar *embeddings* y *LM head* desde un checkpoint chat reduce la memorización sin destruir la fluidez del modelo, comparando contra el modelo base `locuslab/tofu_ft_llama2-7b`.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autónomo con manifiesto asociado, facilita la réplica de resultados en papers de unlearning que usen TOFU como benchmark.
- Estudio de la curva de entrenamiento: al corresponder a la época 8 de 20, permite analizar la evolución intermedia del proceso de olvido frente a checkpoints de otras épocas.
- Evaluación de *privacy leakage*: útil para medir si el modelo aún filtra información del conjunto forget mediante ataques de extracción o *membership inference*.
- Docencia y formación: ejemplo práctico de intervención sobre pesos de un LLM para ilustrar técnicas de edición de modelos y sus compromisos entre olvido y retención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16-18 GB en una GPU de 24 GB.
- En cuantización de 8 bits: ~7 GB de pesos; en 4 bits: ~3,5-4 GB, aunque no se han publicado conversiones oficiales a GGUF ni a otros formatos cuantizados.
- GPU recomendadas para fp16: A100 40GB, H100, L40S, RTX A6000. Para consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) en fp16.
- Cabe en GPU consumer de 24 GB en fp16; en 16 GB requeriría cuantización de 8 bits o descarga parcial de capas.
- Opciones de despliegue: `transformers` con safetensors; vLLM, TGI o llama.cpp no tienen conversiones publicadas en la información disponible, aunque el formato safetensors es compatible con `transformers` y vLLM tras configurar el tokenizer de Llama 2.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch08 | ~6,74B | no disponible | llama2 | HF (0 descargas) | Checkpoint de unlearning, época 8/20 |
| locuslab/tofu_ft_llama2-7b | ~6,74B | 4096 | llama2 | HF | Modelo base afinado sobre TOFU, sin olvido |
| NousResearch/Llama-2-7b-chat-hf | ~6,74B | 4096 | llama2 | HF | Fuente de embeddings y LM head; chat general |
| meta-llama/Llama-2-7b-hf | ~6,74B | 4096 | llama2 | HF | Modelo fundacional original |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para interacción con usuarios finales.
- Sesgos heredados de Llama 2 y de los datos de TOFU; no se documenta ninguna mitigación adicional.
- Riesgo de alucinación: al ser un modelo de 7B afinado sobre un dataset sintético, puede generar respuestas plausibles pero incorrectas, especialmente fuera del dominio TOFU.
- El objetivo de olvido puede no ser completo: los métodos de unlearning no garantizan la eliminación total de la información, y pueden existir rutas residuales de recuperación.
- Idiomas: solo inglés según la etiqueta del repositorio.
- Licencia Llama 2: impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligaciones de atribución y cláusulas de uso aceptable); revisar el texto completo antes de cualquier despliegue.
- No se documentan cuantizaciones oficiales; cualquier conversión a GGUF o GPTQ corre por cuenta del usuario y puede alterar el comportamiento de olvido.
- El checkpoint corresponde a la época 8 de 20; el estado final del entrenamiento puede diferir y no se proporciona.
- Sin métricas publicadas de rendimiento ni de eficacia del olvido en la información disponible.

## Enlaces

- [Hugging Face: unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch08](https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch08)
- [Modelo base: locuslab/tofu_ft_llama2-7b](https://huggingface.co/locuslab/tofu_ft_llama2-7b)
- [Fuente de embeddings y LM head: NousResearch/Llama-2-7b-chat-hf](https://huggingface.co/NousResearch/Llama-2-7b-chat-hf)
- [Modelo fundacional: meta-llama/Llama-2-7b-hf](https://huggingface.co/meta-llama/Llama-2-7b-hf)
