# unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch13

## Resumen

`unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch13` es un checkpoint de investigacion derivado de Llama 2 7B, publicado por el grupo `unl-reset` en Hugging Face. No es un modelo de proposito general: es el resultado de un experimento de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning), en el que se parte de `locuslab/tofu_ft_llama2-7b` (un Llama 2 7B ajustado con fine-tuning sobre el dataset TOFU) y se aplica un procedimiento de olvido selectivo sobre el split `forget10`.

El checkpoint corresponde a la epoca 13 de 20 de un entrenamiento que combina dos objetivos: una perdida de *token IHL* (probablemente una variante de *influence-based / information-theoretic head loss* aplicada solo a los datos a olvidar) sobre el conjunto `forget`, y una perdida de entropia cruzada (CE) con peso 1.0 sobre el conjunto `retain`. Ademas, los embeddings de entrada y la cabeza LM se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base ajustado con TOFU.

Su relevancia es acotada pero clara para la comunidad de investigacion en unlearning: permite reproducir y auditar el comportamiento de un checkpoint intermedio (epoca 13) de una tecnica concreta, comparar con otros metodos de olvido y evaluar el equilibrio entre olvidar el conjunto `forget10` y preservar el rendimiento en `retain`. No esta pensado para uso en produccion ni como asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones derivadas no publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atencion causal multi-cabeza, normalizacion RMSNorm, activacion SwiGLU y embeddings posicionales rotatorios (RoPE). El modelo parte de `locuslab/tofu_ft_llama2-7b`, un fine-tune de Llama 2 7B sobre el dataset TOFU (preguntas y respuestas sobre autores ficticios, disenado para evaluar unlearning). Sobre esa base, el checkpoint aplica un procedimiento de olvido sobre el split `forget10` durante 20 epocas; este artefacto corresponde a la epoca 13.

La innovacion tecnica declarada por el autor es doble. Por un lado, se reinicializan los embeddings de entrada y la cabeza LM desde `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer del modelo ajustado con TOFU; esto sugiere una estrategia de "reset" de las capas mas directamente implicadas en la memorizacion lexica. Por otro, la funcion de perdida combina un termino de *token IHL* sobre el conjunto `forget` con una entropia cruzada ponderada (peso 1.0) sobre el conjunto `retain`, buscando olvidar sin degradar el conocimiento retenido. El autor referencia un fichero `ihl_manifest.json` en el repositorio, aunque no se detalla su contenido en la informacion disponible. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO en esta fase.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Llama 2 7B.
- Razonamiento basico y respuesta a preguntas sobre el conocimiento retenido del dataset TOFU (`retain`).
- Fine-tuning adicional posible sobre la base Llama 2 (sujeto a la licencia).
- Capacidad de servir como checkpoint de referencia en experimentos de unlearning: permite medir la fuga de informacion sobre `forget10` y la retencion sobre `retain`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo *thinking*.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Investigacion en machine unlearning: usar el checkpoint como punto de comparacion (epoca 13) frente a otros metodos de olvido sobre TOFU, midiendo la probabilidad de generar respuestas del conjunto `forget10`.
- Auditoria de fuga de informacion: evaluar con ataques de extraccion (prompting, likelihood de respuestas) cuanto conocimiento del split `forget` persiste en este checkpoint intermedio.
- Reproducibilidad de experimentos: al ser un checkpoint autonomo con manifiesto (`ihl_manifest.json`), permite reproducir la curva de entrenamiento y validar la tecnica IHL + reset de cabeza.
- Estudio del efecto del reset de embeddings y cabeza LM: comparar este checkpoint con variantes sin reset para aislar la contribucion de la reinicializacion al olvido.
- Base para fine-tuning controlado en entornos de investigacion: partir de un modelo con conocimiento parcialmente eliminado para estudiar como se re-aprende informacion olvidada.
- Evaluacion de metricas de retencion: usar el split `retain` de TOFU para medir la degradacion de utilidad causada por el proceso de olvido en la epoca 13.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 16 GB o mas.
- VRAM estimada en cuantizacion 8 bits: ~7 GB; en 4 bits: ~4 GB (cuantizaciones no publicadas por el autor, habria que generarlas).
- GPU recomendadas: A100 40/80 GB o H100 para evaluacion por lotes; RTX 4090 (24 GB) suficiente para inferencia en FP16 de una sola instancia.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16, y en GPUs de 8-12 GB con cuantizacion 4/8 bits generada localmente.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras convertir los pesos a GGUF; al ser un checkpoint de investigacion, no hay recetas de despliegue publicadas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch13` | ~6,74 B | no disponible (Llama 2: 4096) | Checkpoint de unlearning (epoca 13) | llama2 | Hugging Face, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` | ~6,74 B | 4096 | Modelo base ajustado con TOFU (sin olvido) | llama2 | Hugging Face |
| `NousResearch/Llama-2-7b-chat-hf` | ~6,74 B | 4096 | Chat de proposito general | llama2 | Hugging Face |
| Llama 2 7B (Meta) | ~6,74 B | 4096 | Modelo base de proposito general | llama2 | Hugging Face / Meta |

La comparacion relevante es frente a `locuslab/tofu_ft_llama2-7b` (mismo modelo antes del olvido) y frente a otros checkpoints de unlearning sobre TOFU; no se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado ni validado para uso en produccion, atencion al cliente ni generacion de codigo.
- El proceso de unlearning no garantiza la eliminacion completa de la informacion del split `forget10`; pueden persistir fugas.
- Riesgo de alucinacion inherente a Llama 2 7B, potencialmente agravado por el reset de la cabeza LM y el entrenamiento de olvido.
- Solo soporta ingles segun la model card.
- La licencia llama2 impone restricciones de uso comercial y obligaciones de atribucion; revisar los terminos de la Llama 2 Community License antes de cualquier uso.
- Checkpoint intermedio (epoca 13 de 20): su comportamiento puede diferir del checkpoint final del mismo experimento.
- Sin descargas ni likes en el momento de la consulta; sin validacion externa conocida.
- No se documentan sesgos especificos, pero hereda los de Llama 2 y los del dataset TOFU (autores ficticios, dominio acotado).

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch13
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de referencia para el reset de embeddings y cabeza: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Manifiesto del experimento: `ihl_manifest.json` (referenciado en la model card, dentro del repositorio)
- Paper de TOFU: no disponible en la informacion proporcionada
- Repositorio de codigo del metodo IHL: no disponible en la informacion proporcionada
