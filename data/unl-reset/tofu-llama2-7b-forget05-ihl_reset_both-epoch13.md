# unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch13

## Resumen

`unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch13` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. No es un modelo de propósito general, sino un artefacto experimental dentro de la línea de trabajo TOFU (Task of Fictitious Unlearning), un benchmark académico para evaluar técnicas de *machine unlearning*: el olvido selectivo de información en modelos entrenados. El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el conjunto sintético TOFU, y aplica una intervención de reinicialización parcial de pesos junto con un objetivo de entrenamiento combinado (token IHL sobre el conjunto *forget* más entropía cruzada sobre el conjunto *retain*), en la época 13 de 20.

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only denso con 6.738.415.616 parámetros, contexto nativo de 4.096 tokens y licencia Llama 2. El checkpoint se distribuye como modelo completo y autónomo en formato safetensors (13,5 GB), con pesos en precisión completa, y está pensado para ser evaluado con el harness de TOFU, no para despliegue en producción.

Su relevancia es estrictamente metodológica: sirve como punto de comparación en estudios sobre si es posible eliminar el conocimiento de un subconjunto de datos (*forget05*) preservando el rendimiento sobre el resto (*retain*), y en particular sobre si reinicializar los *input embeddings* y la *LM head* (desde `NousResearch/Llama-2-7b-chat-hf`) mientras se conservan los pesos del transformer mejora la robustez del olvido. No hay métricas publicadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion (Llama 2 base: 4.096 tokens) |
| Tipos de cuantizacion | no disponible (repo solo con safetensors en precision completa) |
| Idiomas soportados | en |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar de Llama 2 con 7B parámetros (6.738.415.616 reales según los safetensors), sin modificaciones estructurales: atención con RoPE, normalización RMSNorm y MLP con activación SwiGLU. La intervención consiste en reinicializar los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer procedentes de `locuslab/tofu_ft_llama2-7b`. Este esquema se etiqueta como "Reset Both" en el nombre del checkpoint.

El entrenamiento combina dos objetivos: una pérdida de tipo token IHL (probablemente *Inverted Hinge Loss* o una variante de pérdida de olvido definida por los autores) aplicada sobre el conjunto *forget* de TOFU (`forget05`) y una entropía cruzada estándar ponderada por 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la época 13 de 20. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado ni si hubo fases de RLHF o DPO adicionales. El autor remite a `ihl_manifest.json` para los detalles del proceso.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del ajuste de Llama 2 sobre TOFU.
- Razonamiento y respuesta a preguntas sobre el dominio sintético de TOFU (preguntas y respuestas sobre autores ficticios).
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (`language: en`).
- No se documenta *thinking mode*, visión, audio ni otras modalidades.
- El propósito declarado es servir como checkpoint de evaluación de *unlearning*, no como asistente general.

## Casos de uso

- Evaluación de *machine unlearning*: usar el checkpoint como uno de los brazos experimentales en el harness TOFU para medir la degradación de la probabilidad de las respuestas del conjunto *forget05* frente a la retención en el conjunto *retain*.
- Ablación de reinicialización de embeddings: comparar este checkpoint ("Reset Both") con variantes que no reinicializan la *LM head* o los *input embeddings*, para aislar el efecto de cada componente en la calidad del olvido.
- Estudio de la curva de entrenamiento: al ser la época 13 de 20, permite analizar la evolución de las métricas de olvido y retención a lo largo del ajuste y detectar si el olvido se estabiliza o se degrada.
- Investigación en privacidad de modelos: analizar si el modelo sigue siendo susceptible a ataques de extracción de membresía sobre los datos supuestamente olvidados.
- Reproducibilidad académica: servir como referencia congelada para replicar resultados de publicaciones sobre TOFU y comparar nuevas técnicas de olvido contra una línea base concreta.
- Análisis de *catastrophic forgetting*: estudiar cómo la pérdida conjunta sobre *forget* y *retain* afecta a capacidades generales del Llama 2 original, útil para diseñar objetivos de olvido menos destructivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 16-18 GB.
- En cuantización de 8 bits (si se genera con herramientas externas): alrededor de 7 GB de VRAM.
- En cuantización de 4 bits (si se genera con herramientas externas): alrededor de 4-5 GB de VRAM.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a precisión completa y lotes grandes; RTX 4090 (24 GB) suficiente para inferencia en fp16 con lotes pequeños.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16, y en GPUs de 8-12 GB si se cuantiza a 4 u 8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras convertir los pesos a GGUF; el repo solo incluye safetensors, por lo que la cuantización requiere un paso previo de conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch13 | 6.738.415.616 | no disponible (base: 4.096) | Checkpoint de *unlearning* sobre TOFU | llama2 | HuggingFace (0 descargas) |
| locuslab/tofu_ft_llama2-7b | ~6.738 M | no disponible (base: 4.096) | Modelo base ajustado en TOFU, sin olvido | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | ~6.738 M | 4.096 | Chat de propósito general | llama2 | HuggingFace |
| meta-llama/Llama-2-7b | ~6.738 M | 4.096 | Modelo base de propósito general | llama2 | HuggingFace |

## Limitaciones y advertencias

- No es un modelo para producción: es un checkpoint experimental de investigación sobre *unlearning*, con cero descargas y sin métricas publicadas.
- El olvido no está garantizado: los métodos de *unlearning* basados en ajuste pueden ser revertidos parcialmente mediante *fine-tuning* posterior o ataques de extracción; no debe tratarse como una garantía de eliminación de datos.
- Riesgo de alucinación: al derivar de Llama 2 7B ajustado sobre un dataset sintético de Q&A, puede generar respuestas plausibles pero incorrectas, especialmente fuera del dominio TOFU.
- Sesgos: hereda los sesgos del corpus de preentrenamiento de Llama 2 y del dataset TOFU; no se documentan evaluaciones de sesgo en la información disponible.
- Limitación de idioma: solo inglés declarado; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Restricciones de licencia: la Llama 2 Community License impone condiciones de uso comercial, umbrales de usuarios mensuales y obligaciones de atribución; debe revisarse antes de cualquier uso más allá de la investigación.
- El estado del arte en *unlearning* es frágil: los resultados de este checkpoint deben interpretarse junto con el resto de la suite TOFU y no de forma aislada.
- La información sobre el proceso de entrenamiento (número de tokens, composición del dataset, hiperparámetros) es incompleta; el autor remite a `ihl_manifest.json`, que no se ha podido verificar en esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch13
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2: https://huggingface.co/meta-llama/Llama-2-7b
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
