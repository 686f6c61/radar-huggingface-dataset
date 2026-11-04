# unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch09

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch09` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset` en HuggingFace. Se trata de un ajuste fino orientado a la tarea de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning), concretamente sobre la partición `forget05`. El objetivo de este tipo de checkpoints es evaluar hasta qué punto un modelo puede "olvidar" un subconjunto concreto de datos de entrenamiento sin degradar su rendimiento en el resto.

La arquitectura subyacente es un transformer decoder-only de la familia Llama 2, con 6.738.415.616 parámetros totales según los pesos en safetensors. El modelo parte de `locuslab/tofu_ft_llama2-7b` (un Llama 2 7B ajustado sobre TOFU) y aplica una estrategia híbrida de reset: reinicializa los *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer del checkpoint base. Sobre esa inicialización se aplica un entrenamiento con pérdida compuesta: *token IHL* (unlearning) sobre el conjunto *forget* más un término de entropía cruzada (CE) con peso 1.0 sobre el conjunto *retain*.

Este checkpoint corresponde a la época 9 de 20 del proceso de entrenamiento. Es relevante en el contexto de la investigación en unlearning porque documenta una receta concreta (reset selectivo de embeddings y cabeza de salida combinado con una pérdida dual) y permite reproducir y comparar resultados frente a otros métodos de olvido. No está pensado como modelo de producción: su propósito es experimental y su licencia hereda las restricciones de Llama 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | llama2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 2 con aproximadamente 6,74 mil millones de parámetros, la misma topología que Llama 2 7B (atención multi-cabeza con RoPE, activación SwiGLU, normalización RMSNorm). El checkpoint se construye a partir de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 7B sobre el dataset TOFU de autores ficticios. La innovación del checkpoint reside en la estrategia de inicialización: los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base ajustado.

El entrenamiento aplica una pérdida compuesta que combina un término de *token IHL* (unlearning) sobre la partición `forget05` con una entropía cruzada estándar ponderada por 1.0 sobre el conjunto *retain*. Este checkpoint corresponde a la época 9 de un total de 20, y se distribuye como modelo completo e independiente, acompañado de un `ihl_manifest.json` que documenta la receta. No se dispone en la información proporcionada de detalles sobre el volumen de tokens, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, heredada de Llama 2 7B.
- Razonamiento y respuesta a preguntas sobre el dataset TOFU de autores ficticios (capacidad residual tras el proceso de unlearning).
- Comprensión y generación de código y matemáticas básicas, en la medida en que lo soporta Llama 2 7B.
- Capacidad de *machine unlearning*: el checkpoint está diseñado para olvidar la partición `forget05` mientras preserva el rendimiento en `retain`.
- No se documenta soporte de *tool calling*, *function calling*, agentes ni razonamiento multi-paso en la información proporcionada.
- No se documentan capacidades de visión, audio ni *thinking mode*.
- Multilingüe: limitado a inglés según la model card.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como referencia para evaluar la eficacia del método IHL + reset sobre la partición `forget05`, comparando métricas de olvido y retención frente a otros checkpoints del mismo grupo.
- Reproducción de experimentos: al ser un modelo completo con manifiesto (`ihl_manifest.json`), permite reproducir la configuración de reset de embeddings y LM head en estudios posteriores.
- Evaluación de olvido selectivo: se puede medir la degradación en las respuestas sobre los autores de `forget05` frente a los de `retain` usando los protocolos estándar de TOFU.
- Análisis de estabilidad del entrenamiento: al tratarse de la época 9 de 20, permite estudiar la evolución de las métricas de olvido a lo largo del entrenamiento comparándolo con otras épocas.
- Estudio de la inicialización de embeddings: permite analizar el impacto de reinicializar *input embeddings* y *LM head* desde un modelo chat frente a conservar los del modelo ajustado.
- Base para *fine-tuning* posterior en entornos controlados de investigación: aunque no está pensado para producción, puede servir como punto de partida para estudiar la recuperación de capacidades tras el olvido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB de pesos, más overhead de activaciones y caché KV; se recomienda al menos 16 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB; en 4 bits: en torno a 4-5 GB (estimaciones para un modelo de 7B, no verificadas para este checkpoint concreto).
- GPU recomendadas: A100 40GB, H100, L40S o RTX 4090 para FP16; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3090, 4080, 4090 y superiores con cuantización; en FP16 requiere al menos 16 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (previa conversión a GGUF), transformers con `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch09 | 6,74B | no disponible | Unlearning TOFU forget05 | llama2 | HuggingFace |
| locuslab/tofu_ft_llama2-7b | ~6,74B | no disponible | Modelo base ajustado en TOFU | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | ~6,74B | 4096 | Chat general | llama2 | HuggingFace |
| meta-llama/Llama-2-7b | ~6,74B | 4096 | Base general | llama2 | HuggingFace |

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción.
- El proceso de unlearning puede no eliminar por completo la información de `forget05`; la eficacia debe medirse con los protocolos de TOFU.
- Riesgo de alucinación inherente a Llama 2 7B, potencialmente agravado por el reset de embeddings y LM head.
- Idiomas: solo inglés según la model card.
- Licencia llama2: hereda las restricciones de Meta Llama 2, incluidas limitaciones de uso comercial y obligaciones de atribución; revisar los términos antes de cualquier uso.
- El reset de *input embeddings* y *LM head* puede degradar la coherencia general del modelo en comparación con el checkpoint base.
- Solo se distribuye una época (9 de 20); el comportamiento puede diferir del checkpoint final.
- Sin datos publicados de benchmarks que permitan validar el rendimiento real.
- El repositorio registra 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch09
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2: https://huggingface.co/meta-llama/Llama-2-7b
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
