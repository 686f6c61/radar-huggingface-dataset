# unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch02

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch02` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. No se trata de un modelo de propósito general, sino de un artefacto experimental dentro del marco TOFU (Task of Fictitious Unlearning), un benchmark académico para evaluar técnicas de *machine unlearning*: el olvido selectivo de información en un modelo ya entrenado. En concreto, este checkpoint corresponde al epoch 2 de un proceso de 20 epochs sobre el subconjunto `forget10` del dataset TOFU.

La modificación respecto al modelo base `locuslab/tofu_ft_llama2-7b` (que a su vez es un fine-tune de Llama 2 sobre TOFU) se limita a reinicializar los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer intactos. El entrenamiento combina una pérdida de tipo IHL (probablemente *Inverted Hinge Loss* o una variante de pérdida de retención/olvido) sobre el conjunto de olvido con una entropía cruzada ponderada (factor 1.0) sobre el conjunto de retención.

Es relevante únicamente para investigadores que trabajen en desaprendizaje, privacidad de datos en LLM y evaluación de métodos de eliminación de conocimiento. No está pensado para uso en producción ni para tareas generativas generales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 (~6,74 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Llama 2 base: 4096 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de Llama 2) |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza estándar (sin GQA en el modelo de 7B), normalización RMSNorm y activación SwiGLU. El checkpoint hereda los pesos del transformer de `locuslab/tofu_ft_llama2-7b`, un fine-tune de Llama 2 sobre el dataset TOFU, y sustituye los *input embeddings* y la *LM head* por los de `NousResearch/Llama-2-7b-chat-hf`. Este detalle es significativo: al reinicializar la capa de salida y los embeddings, el modelo pierde la alineación entre representaciones internas y vocabulario que tenía el fine-tune original, lo que lo convierte en un objeto de estudio sobre cómo afecta esa reinicialización al comportamiento de olvido.

El entrenamiento usa una pérdida combinada: un término IHL sobre el conjunto `forget` (los datos que se pretende olvidar) y una entropía cruzada con peso 1.0 sobre el conjunto `retain` (los datos que deben conservarse). El checkpoint corresponde al epoch 2 de 20, lo que indica que es un estado intermedio del proceso. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado ni si hubo RLHF o DPO; TOFU es un dataset sintético de preguntas y respuestas sobre autores ficticios, diseñado específicamente para medir olvido.

## Capacidades

- Generación de texto en inglés, heredada de Llama 2 7B, aunque degradada por el proceso de desaprendizaje y la reinicialización de embeddings y LM head.
- Razonamiento y respuesta a preguntas sobre el dataset TOFU, en la medida en que el proceso de olvido lo permita.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (tag `en`).
- No dispone de modo *thinking*, visión ni audio.
- Su función principal no es la generación útil, sino servir como punto de control para medir la eficacia del olvido en el benchmark TOFU.

## Casos de uso

- **Investigación en machine unlearning**: evaluar si el checkpoint ha olvidado efectivamente el subconjunto `forget10` de TOFU, comparando su rendimiento en preguntas de olvido frente al modelo base. Es el uso previsto del artefacto.
- **Análisis de la reinicialización de embeddings y LM head**: estudiar cómo afecta sustituir estas capas por las de un modelo chat distinto al comportamiento de retención y olvido, un experimento controlado útil para entender la localización del conocimiento en LLM.
- **Reproducción de experimentos TOFU**: servir como estado intermedio (epoch 2/20) para reproducir curvas de olvido a lo largo del entrenamiento y comparar con otros checkpoints del mismo autor.
- **Evaluación de métricas de privacidad**: medir la fuga de información residual mediante ataques de extracción o *membership inference* sobre el conjunto forget, verificando si el proceso IHL reduce la memorización.
- **Estudio de degradación de capacidades**: analizar cuánto pierde el modelo en tareas generales (perplejidad en texto libre, coherencia) tras el proceso de olvido, comparándolo con `locuslab/tofu_ft_llama2-7b`.
- **Base para ablaciones**: partir de este checkpoint para probar variantes de la pérdida IHL o del peso de la CE de retención, dado que es un modelo completo autónomo con manifiesto (`ihl_manifest.json`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM para inferencia en fp16**: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 16 GB.
- **VRAM en cuantización de 8 bits**: ~7 GB; en 4 bits, ~4 GB.
- **GPU recomendadas**: A100 40 GB, H100, L40S para fp16 sin restricciones; RTX 4090 (24 GB) suficiente para fp16 con contexto moderado.
- **Consumer GPU**: sí, cabe en RTX 3090/4090 en fp16 y en GPUs de 8-12 GB con cuantización 4/8 bits.
- **Despliegue**: compatible con vLLM, TGI, llama.cpp y Ollama al ser arquitectura Llama 2 estándar, aunque su utilidad en producción es nula.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia |
|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch02` | ~6,74 B | no disponible | Checkpoint de desaprendizaje (epoch 2/20) | llama2 |
| `locuslab/tofu_ft_llama2-7b` | ~6,74 B | 4096 | Modelo base fine-tuneado sobre TOFU | llama2 |
| `NousResearch/Llama-2-7b-chat-hf` | ~6,74 B | 4096 | Chat de propósito general | llama2 |
| Llama 2 7B (Meta) | ~6,74 B | 4096 | Modelo base de propósito general | llama2 |

La comparación relevante es con su modelo base `locuslab/tofu_ft_llama2-7b`: este checkpoint debería mostrar menor retención de los datos de olvido y, presumiblemente, mayor degradación general. No se dispone de métricas cuantitativas para confirmarlo.

## Limitaciones y advertencias

- **No apto para producción**: es un checkpoint experimental intermedio (epoch 2 de 20) de un proceso de desaprendizaje, no un modelo afinado para uso real.
- **Degradación esperada**: la reinicialización de embeddings y LM head rompe la alineación original del fine-tune, lo que previsiblemente degrada la coherencia y calidad de generación.
- **Sesgos**: hereda los sesgos de Llama 2 y del dataset TOFU, sin que se documente mitigación alguna.
- **Alucinación**: riesgo elevado, agravado por el proceso de olvido y la sustitución de capas.
- **Idioma**: solo inglés; no se garantiza comportamiento correcto en castellano u otros idiomas.
- **Licencia**: Llama 2 Community License, con restricciones de uso comercial (límite de 700 millones de usuarios mensuales para licencia automática) y obligaciones de atribución; además, el uso comercial de un checkpoint de investigación de este tipo carece de sentido práctico.
- **Trazabilidad**: el proceso IHL no está estandarizado ni documentado en detalle en la model card; la pérdida exacta debe consultarse en `ihl_manifest.json` del repositorio.
- **Cero adopción**: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch02
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings/LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Dataset y benchmark TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU (Task of Fictitious Unlearning): https://arxiv.org/abs/2401.06121
