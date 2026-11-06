# unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch13

## Resumen

`unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch13` es un checkpoint de investigacion derivado de `locuslab/tofu_ft_llama2-7b`, a su vez un ajuste fino de Llama 2 7B sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de un experimento de *machine unlearning*: el objetivo es eliminar el conocimiento de un subconjunto concreto del dataset (la particion `forget10`) sin degradar el rendimiento sobre el resto (`retain`).

El modelo conserva la arquitectura Transformer decoder-only de Llama 2 7B, con 6.738.415.616 parametros en formato safetensors. La intervencion consiste en reinicializar los embeddings de entrada y la LM head desde `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del modelo base, y aplicar un entrenamiento combinado: *token IHL* sobre `forget` mas entropia cruzada (CE) con peso 1.0 sobre `retain`. El checkpoint corresponde a la epoca 13 de 20.

Es relevante en el contexto de la investigacion sobre privacidad y cumplimiento normativo (derecho al olvido en RGPD), donde se necesitan metodos que permitan retirar datos de entrenamiento de un LLM sin reentrenar desde cero. No es un modelo para uso en produccion: es un artefacto experimental de un estudio de unlearning, sin benchmarks publicados ni pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2 7B: 4096 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre TOFU, y aplica una estrategia de *reset* parcial: los embeddings de entrada y la LM head se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del Transformer se conservan del modelo base. Sobre esa inicializacion se entrena con una combinacion de dos objetivos: *token IHL* (probablemente *Inverted Hinge Loss* o una variante de perdida tipo hinge aplicada a nivel de token) sobre la particion `forget`, y entropia cruzada estandar con coeficiente 1.0 sobre la particion `retain`.

El checkpoint publicado corresponde a la epoca 13 de un total de 20. La model card remite a un fichero `ihl_manifest.json` para detalles del procedimiento, no incluido en la informacion proporcionada. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset TOFU utilizado ni si hubo fases de RLHF o DPO adicionales. El modelo es un checkpoint completo e independiente ("standalone full model checkpoint"), no un adaptador LoRA.

## Capacidades

- Generacion de texto en ingles, heredada de la base Llama 2 7B.
- Razonamiento y respuesta a instrucciones basicas, condicionados por el ajuste fino sobre TOFU (dataset de preguntas y respuestas sobre autores ficticios).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles (`language: en`).
- No se documenta vision, audio ni modo *thinking*.
- El interes principal del modelo no es su capacidad generativa, sino su comportamiento como artefacto de *unlearning*: se espera que haya "olvidado" la particion `forget10` de TOFU manteniendo el rendimiento en `retain`.

## Casos de uso

- Investigacion en machine unlearning: servir como punto de comparacion en estudios que evaluan metodos de eliminacion de datos (IHL, gradient ascent, preferencia, etc.) sobre TOFU, midiendo la degradacion en `retain` y la supresion en `forget`.
- Reproducibilidad de experimentos: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`), permite reproducir exactamente el estado de la epoca 13 sin reentrenar.
- Evaluacion de metodos de reinicializacion parcial: util para estudiar el efecto de resetear embeddings y LM head frente a conservar los pesos originales en tareas de desaprendizaje.
- Analisis de olvido selectivo en modelos pequenos: Llama 2 7B es un tamano manejable para ejecutar baterias de evaluacion (perplexity en `forget` vs `retain`, exact match en QA de TOFU) en una sola GPU.
- Estudio de cumplimiento normativo (RGPD, derecho al olvido): prototipo para medir si tecnicas de unlearning a nivel de pesos son viables frente a reentrenamiento completo.
- Base para experimentos de *membership inference*: comprobar si un atacante puede detectar si un ejemplo de `forget10` estuvo en el entrenamiento original tras aplicar el reset.
- Docencia y formacion en privacidad de LLMs: ejemplo concreto de pipeline de unlearning con objetivos combinados (IHL + CE).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 16-24 GB.
- En cuantizacion de 8 bits: alrededor de 7 GB de pesos; en 4 bits, alrededor de 4 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S para evaluacion a escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en FP16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090, 3090, 4080 (16 GB) con cuantizacion y en GPUs de 24 GB en FP16.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversion a GGUF), Ollama (previa conversion), Hugging Face Transformers con `accelerate`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_reset_embed-epoch13 | 6,74 B | no disponible | Unlearning experimental (TOFU forget10) | llama2 | Hugging Face (0 descargas) |
| locuslab/tofu_ft_llama2-7b | 6,74 B | no disponible | Modelo base ajustado en TOFU (sin unlearning) | llama2 | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | 6,74 B | 4096 tokens | Chat general | llama2 | Hugging Face |
| meta-llama/Llama-2-7b-hf | 6,74 B | 4096 tokens | Base generativa | llama2 | Hugging Face |

La comparacion relevante es frente a `locuslab/tofu_ft_llama2-7b` (modelo sin olvidar) y frente a otros checkpoints de la misma familia de experimentos (por ejemplo, variantes sin reset de embeddings o con otras epocas). No se dispone de datos de rendimiento comparado en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental de investigacion: no apto para produccion ni para uso general como asistente.
- Solo ingles; no se garantiza comportamiento correcto en otros idiomas.
- Riesgo de alucinacion inherente a Llama 2 7B, agravado por el ajuste fino sobre un dataset sintetico de autores ficticios (TOFU).
- El objetivo de unlearning no garantiza un olvido completo: estudios previos muestran que la informacion "olvidada" puede recuperarse mediante ataques de extraccion o prompts adversariales.
- Licencia Llama 2 Community License: restricciones de uso comercial (limite de 700 millones de usuarios mensuales para productos derivados, obligaciones de atribucion y uso aceptable). Revisar los terminos antes de cualquier uso.
- Sin pipeline declarado ni benchmarks publicados: no hay evidencia documentada de su calidad generativa ni de su eficacia como unlearning.
- El checkpoint corresponde a la epoca 13 de 20; no es el estado final del entrenamiento, lo que puede afectar a la convergencia del objetivo de olvido.
- La model card remite a `ihl_manifest.json` para detalles del procedimiento, no verificado en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch13
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU: https://arxiv.org/abs/2401.06121
