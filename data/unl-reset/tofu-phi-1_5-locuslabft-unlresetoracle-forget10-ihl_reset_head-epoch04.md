# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch04

## Resumen

`unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch04` es un checkpoint de investigacion derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino del modelo Phi-1.5 de Microsoft sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El modelo lo publica la organizacion `unl-reset` y su proposito no es el uso generalista, sino servir como artefacto experimental en estudios de *machine unlearning*: se ha aplicado una tecnica denominada IHL (probablemente *Information-Theoretic Head Loss* o similar) combinada con un reinicio parcial de pesos para intentar "olvidar" el subconjunto `forget10` de TOFU.

La peculiaridad tecnica del checkpoint es que reinicializa los *input embeddings* y la *LM head* a partir de los pesos originales de `microsoft/phi-1_5`, mientras conserva el resto de pesos del transformer del modelo ajustado con TOFU. El entrenamiento combina una perdida IHL sobre el conjunto a olvidar con una entropia cruzada (CE) con peso 1.0 sobre el conjunto a retener, durante 4 epocas de un total de 20. El resultado es un modelo completo y autonomo (no un adaptador LoRA), en formato safetensors y BF16.

Con 1.418 millones de parametros, arquitectura Phi-1.5 (transformer denso) y licencia Apache-2.0, el checkpoint es ligero y facil de desplegar, pero su relevancia practica esta acotada al ambito de la investigacion en privacidad y eliminacion de conocimiento. No es un modelo recomendable para produccion generalista: su comportamiento esta moldeado por el objetivo de desaprendizaje y por el dataset sintetico TOFU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-1.5, `custom_code` en el repo) |
| Parametros totales | 1.418.270.720 (~1,42 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en BF16; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16), con `custom_code` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5 de Microsoft: un transformer denso de aproximadamente 1,3 B de parametros (1,42 B contando embeddings) disenado originalmente para generacion de codigo y texto educativo. El checkpoint parte de `locuslab/tofu_ft_phi-1.5`, que es Phi-1.5 ajustado con el dataset TOFU (preguntas y respuestas sobre autores ficticios, usado como benchmark de unlearning). Sobre esa base, `unl-reset` aplica un procedimiento de dos partes: por un lado reinicializa los *input embeddings* y la *LM head* con los pesos originales de `microsoft/phi-1_5`, y por otro entrena con una perdida IHL sobre el split `forget10` mas una entropia cruzada con coeficiente 1.0 sobre el split de retencion.

El entrenamiento se registra hasta la epoca 4 de 20, lo que indica que este checkpoint es intermedio dentro de una curva de desaprendizaje. No se especifican en la model card el numero de tokens vistos, la composicion exacta del dataset mas alla de TOFU `forget10`/retain, ni si hubo RLHF o DPO (muy improbable dado el contexto). La innovacion tecnica destacable es precisamente el esquema de reinicio selectivo de embeddings y cabeza de salida combinado con una perdida de olvido, una estrategia habitual en la literatura de unlearning para evitar que el conocimiento "olvidado" se recupere a traves de la capa de salida. El repositorio incluye un `ihl_manifest.json` que documenta la configuracion del experimento.

## Capacidades

- Generacion de texto en ingles con el estilo y las capacidades heredadas de Phi-1.5 (modelo pequeno orientado a codigo y razonamiento basico).
- Razonamiento de un solo paso y generacion de codigo simple, condicionado por el ajuste fino sobre TOFU.
- Respuesta a preguntas sobre el dominio sintetico de TOFU (autores ficticios) en la medida en que el desaprendizaje no las haya eliminado.
- No se documenta soporte de *tool calling* ni *function calling* en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles segun la etiqueta `language: en`.
- No se documentan modos especiales (thinking, vision, audio) en la informacion disponible.

## Casos de uso

- Investigacion en machine unlearning: el checkpoint sirve como punto de comparacion (epoca 4/20) para medir la eficacia del olvido del split `forget10` frente a checkpoints de otras epocas o tecnicas.
- Evaluacion de robustez de privacidad: permite estudiar si un atacante puede recuperar informacion supuestamente olvidada mediante *prompting* o *fine-tuning* posterior, gracias a que es un modelo completo y no un adaptador.
- Reproducibilidad de experimentos TOFU: al conservar la configuracion en `ihl_manifest.json`, facilita replicar el pipeline IHL + reset sobre Phi-1.5.
- Baseline en estudios de desaprendizaje selectivo: util para comparar contra variantes como `tofu-llama2-7b-forget10-ihl_both-epoch13` del mismo autor, aislando el efecto del tamano del modelo.
- Analisis de degradacion de capacidades: permite medir cuanto rendimiento generalista (perplejidad en texto generico, generacion de codigo) se pierde al aplicar el reinicio de embeddings y cabeza.
- Docencia y formacion: ejemplo didactico y ligero (2,8 GB) para ilustrar tecnicas de unlearning sin necesidad de GPUs de gran capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 2,8-3,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 4-6 GB en BF16.
- En cuantizacion de 8 bits: ~1,5 GB de pesos; en 4 bits: ~0,8-1 GB (aunque el autor no publica variantes cuantizadas, es convertible con herramientas estandar).
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente; para lotes grandes o evaluacion por lotes, A100 o H100 no son necesarias pero aceleran el throughput.
- Cabe holgadamente en GPU consumer, incluidas GTX 1660 de 6 GB en cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por `custom_code`), vLLM (previa conversion y verificacion del codigo custom), llama.cpp/Ollama (requiere conversion a GGUF), TGI. El soporte puede requerir trabajo adicional por el `custom_code`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por tamano, se espera un throughput alto (cientos de tokens/s en RTX 4090 con lotes pequenos), pero sin datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Phi-1.5 TOFU forget10, ep. 4) | 1,42 B | no disponible | Unlearning TOFU | Apache-2.0 | Hugging Face |
| `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch01` | ~1,42 B | no disponible | Unlearning TOFU (epoca 1) | Apache-2.0 | Hugging Face |
| `unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch13` | ~7 B | no disponible | Unlearning TOFU (Llama-2) | Llama-2 | Hugging Face |
| `locuslab/tofu_ft_phi-1.5` (modelo base) | ~1,42 B | no disponible | Fine-tuning TOFU sin olvido | Apache-2.0 | Hugging Face |

La comparacion directa con modelos generalistas como Phi-1.5 original o Qwen2.5-1.5B no es significativa: este checkpoint esta optimizado para un objetivo de desaprendizaje y su rendimiento generalista no se reporta.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni para tareas generales de generacion de texto.
- Riesgo de alucinacion alto: el ajuste sobre TOFU (autores ficticios) y el reinicio de embeddings/cabeza pueden producir respuestas incoherentes fuera del dominio de entrenamiento.
- El desaprendizaje no es garantia de eliminacion: estudios previos muestran que la informacion "olvidada" puede recuperarse con *prompting* adversarial o *fine-tuning*; no debe usarse como mecanismo de privacidad certificado.
- Capacidades limitadas al ingles; sin soporte multilingue documentado.
- Longitud de contexto no documentada en la model card; se asume la de Phi-1.5 (2048 tokens), lo que limita conversaciones largas.
- Requiere `trust_remote_code=True` por el `custom_code`, lo que implica ejecutar codigo del autor; auditar antes de desplegar.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Phi-1.5 y el dataset TOFU pueden tener condiciones adicionales que conviene revisar.
- Solo 19 descargas y 0 likes: sin validacion comunitaria, sin issues reportados y sin garantias de mantenimiento.
- Checkpoint intermedio (epoca 4/20): no representa el resultado final del procedimiento de unlearning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch04
- Checkpoint de la epoca 1: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch01
- Variante Llama-2 7B del mismo autor: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch13
- Modelo base del ajuste TOFU: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
