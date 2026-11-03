# unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch07

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch07` es un checkpoint de investigación derivado de Llama 2 7B, publicado por el grupo `unl-reset` sobre el modelo base `locuslab/tofu_ft_llama2-7b`. Se enmarca en la línea de trabajo de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning), un conjunto de evaluación diseñado para medir la capacidad de un modelo de "olvidar" información concreta sobre autores ficticios sin degradar el conocimiento general. El sufijo `forget10` indica que el objetivo de olvido se aplica sobre el 10 % del conjunto de datos de entrenamiento.

La particularidad técnica de este checkpoint es la combinación de dos estrategias: una inicialización parcial de pesos (los *embeddings* de entrada y la cabeza del modelo —LM head— se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras el resto de pesos del transformer se conservan del modelo base ajustado) y una función de pérdida compuesta que suma el término IHL (*Inverted Hinge Loss*, una pérdida de olvido) sobre el conjunto *forget* y una entropía cruzada estándar ponderada con coeficiente 1.0 sobre el conjunto *retain*. Este checkpoint corresponde a la época 7 de un total de 20.

Es relevante ahora porque la evaluación rigurosa del *unlearning* en LLM es un área activa: se necesitan checkpoints reproducibles que permitan medir el equilibrio entre olvido efectivo y retención de utilidad. Este modelo es una pieza de ese ecosistema experimental, no un modelo de propósito general.

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

La arquitectura subyacente es la de Llama 2 7B: un transformer *decoder-only* con normalización RMSNorm, atención con RoPE y activación SwiGLU. El modelo parte de `locuslab/tofu_ft_llama2-7b`, un ajuste fino de Llama 2 7B sobre el dataset TOFU, y aplica sobre él un procedimiento de *unlearning* parcial: los *embeddings* de entrada y la LM head se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de los pesos del transformer se mantienen congelados o heredados del modelo base ajustado.

El entrenamiento utiliza una función de pérdida compuesta: el término IHL (*Inverted Hinge Loss*) aplicado sobre el conjunto *forget* (el 10 % de datos a olvidar) más una entropía cruzada estándar con coeficiente 1.0 sobre el conjunto *retain* (datos que deben conservarse). El checkpoint publicado corresponde a la época 7 de 20. El autor indica que se trata de un modelo completo e independiente y remite a `ihl_manifest.json` para los detalles del manifiesto de inicialización. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto en inglés, heredada de Llama 2 7B.
- Razonamiento y respuesta a preguntas sobre el corpus TOFU (autores ficticios), con el subconjunto *forget10* parcialmente olvidado por diseño.
- Capacidad de *machine unlearning* evaluable: sirve como artefacto para medir olvido selectivo frente a retención.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingüe: limitado a inglés según la model card.
- No se documentan modos especiales (*thinking*, visión, audio).

## Casos de uso

- Investigación en *machine unlearning*: usar el checkpoint para medir la eficacia del olvido sobre el conjunto *forget10* de TOFU comparándolo con el modelo base `locuslab/tofu_ft_llama2-7b`, evaluando la caída de exactitud en las preguntas objetivo.
- Evaluación de retención de utilidad: comparar el rendimiento en el conjunto *retain* frente al modelo original para cuantificar el coste del olvido, gracias a la pérdida CE ponderada con coeficiente 1.0.
- Reproducibilidad de experimentos: al ser un checkpoint completo e independiente con manifiesto (`ihl_manifest.json`), permite reproducir exactamente la época 7 de la curva de entrenamiento.
- Estudio de inicialización de embeddings: analizar el efecto de reinicializar *embeddings* y LM head desde Llama 2 chat frente a conservar los pesos ajustados, aislando la contribución de esa decisión al olvido.
- Línea base en comparativas de algoritmos: servir como referencia para comparar IHL + reset frente a otras técnicas de *unlearning* (gradient ascent, preference optimization, etc.) sobre el mismo benchmark.
- Análisis de robustez frente a *jailbreaks* de olvido: comprobar si el conocimiento supuestamente olvidado puede recuperarse mediante *prompting* adversarial, un test estándar en la literatura de unlearning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 13,5 GB para los pesos (coincide con el tamaño del repo), más overhead de activaciones y caché KV; en la práctica se recomienda ≥ 16 GB.
- GPU recomendadas: A100 40/80 GB, H100 para evaluación por lotes; una RTX 4090 (24 GB) es suficiente para inferencia en fp16 de un solo prompt.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16; en GPUs de 12-16 GB requeriría cuantización a 8 bits o 4 bits (no se documentan cuantizaciones oficiales).
- Opciones de despliegue: vLLM, TGI, llama.cpp (tras conversión a GGUF), Ollama (tras conversión); al ser pesos safetensors de Llama 2, es compatible con el ecosistema estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_reset_embed-epoch07 (este) | 6.738 M | no disponible | Unlearning TOFU, época 7/20 | llama2 |
| locuslab/tofu_ft_llama2-7b | ~6.738 M | no disponible | Modelo base ajustado en TOFU (sin olvido) | llama2 |
| NousResearch/Llama-2-7b-chat-hf | ~6.738 M | 4096 | Chat general; origen de los embeddings reinicializados | llama2 |
| Llama 2 7B (Meta) | 6.738 M | 4096 | Modelo fundacional de referencia | llama2 |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente general; su distribución de entrenamiento está sesgada hacia el corpus TOFU.
- Riesgo de alucinación: inherente a Llama 2 7B, agravado por el proceso de *unlearning*, que puede degradar la coherencia en dominios cercanos al conjunto olvidado.
- El olvido no es garantizado: el conocimiento del conjunto *forget10* puede ser recuperable mediante *prompting* adversarial; la literatura de unlearning documenta este fenómeno.
- Idioma: solo inglés según la model card.
- Licencia Llama 2: impone restricciones de uso comercial (política de uso aceptable, límite de 700 millones de usuarios mensuales para licencia automática, obligación de atribución). Verificar los términos antes de cualquier uso.
- Sin datos de benchmarks publicados: no es posible afirmar su calidad de olvido o retención sin evaluarlo uno mismo.
- Época 7 de 20: es un punto intermedio de entrenamiento, no el checkpoint final; puede presentar un equilibrio olvido/retención distinto al de épocas posteriores.
- Sin pipeline declarado ni cuantizaciones oficiales: requiere trabajo de conversión para despliegue ligero.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch07
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU: https://github.com/locuslab/tofu
