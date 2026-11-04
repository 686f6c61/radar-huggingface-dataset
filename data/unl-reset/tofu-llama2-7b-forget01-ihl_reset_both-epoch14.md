# unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch14

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch14` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. No es un modelo de propósito general, sino el resultado de un experimento de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning), un benchmark académico diseñado para medir la capacidad de un modelo de olvidar información concreta sin degradar el resto de su conocimiento.

El punto de partida es `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el dataset TOFU. Sobre él se aplica una técnica que el autor denomina "IHL + Reset Both": se reinicializan los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base. El entrenamiento combina una pérdida de entropía cruzada inversa (token IHL) sobre el conjunto *forget* con una pérdida de entropía cruzada estándar ponderada por 1.0 sobre el conjunto *retain*.

Este checkpoint corresponde a la época 14 de 20 del proceso de desaprendizaje. Su relevancia es puramente académica: sirve para estudiar la eficacia y los compromisos (*trade-offs*) de las técnicas de *unlearning* en modelos de lenguaje, no para despliegue en producción. El número de parámetros reales según los pesos en safetensors es de 6.738.415.616.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | en |
| Licencia | llama2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y RoPE para codificación posicional. El checkpoint no introduce modificaciones estructurales; es un ajuste fino del modelo `locuslab/tofu_ft_llama2-7b`, que a su vez deriva de la familia Llama 2.

El proceso de entrenamiento aplica la receta "IHL + Reset Both": los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que los pesos del resto del transformer se heredan del modelo ajustado en TOFU. La función de pérdida suma una pérdida de entropía cruzada inversa (IHL) sobre el conjunto *forget* —que empuja al modelo a alejarse de las respuestas memorizadas— y una pérdida de entropía cruzada convencional ponderada con factor 1.0 sobre el conjunto *retain*, para preservar el conocimiento que no debe olvidarse. El checkpoint publicado corresponde a la época 14 de un total de 20. Los detalles completos del experimento se documentan en el archivo `ihl_manifest.json` del repositorio. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre la composición exacta del dataset más allá de las particiones estándar de TOFU (*forget01* y *retain*).

## Capacidades

- Generación de texto autorregresiva en inglés, heredada de Llama 2 7B.
- Razonamiento y respuesta a preguntas sobre conocimiento general, en la medida en que el proceso de *unlearning* no lo haya degradado.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno (herencia del ajuste de Llama 2 Chat en los embeddings y la LM head reinicializados).
- El objetivo declarado del checkpoint es haber reducido la memorización del subconjunto *forget01* de TOFU, no ampliar capacidades.
- No se documenta soporte de *tool calling*, *function calling*, agentes ni modos de razonamiento extendido.
- No dispone de capacidades de visión, audio ni multimodalidad.
- Multilingüismo limitado al inglés según la model card.

## Casos de uso

- Investigación en *machine unlearning*: evaluación de la eficacia de la receta IHL + Reset Both sobre la partición *forget01* de TOFU, midiendo la caída de probabilidad de las respuestas objetivo frente al modelo original.
- Análisis de compromisos (*trade-offs*) olvido-retención: comparación de la degradación en el conjunto *retain* frente a la reducción de memorización en *forget*, usando las métricas estándar de TOFU (probabilidad de respuesta, ROUGE, verdad).
- Reproducibilidad de experimentos: punto de control intermedio (época 14/20) útil para estudiar la evolución del desaprendizaje a lo largo del entrenamiento.
- Estudio de reinicialización de embeddings y LM head: análisis de cómo el *reset* de estas capas afecta a la plasticidad del modelo y a la retención de conocimiento factual.
- Docencia y formación: ejemplo práctico de un pipeline de *unlearning* completo sobre un modelo de 7B con licencia Llama 2.
- Comparación de metodologías: línea base para contrastar IHL + Reset Both con otras técnicas de olvido (gradient ascent, preference optimization, etc.) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 16 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB; en 4 bits, en torno a 4-5 GB (estimaciones basadas en el tamaño de parámetros, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S para inferencia en fp16 sin cuantizar; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para fp16.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con fp16; en RTX 4080/4070 Ti (16 GB) con cuantización de 8 bits; en GPUs de 8 GB con cuantización de 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (previa conversión a GGUF), transformers con `accelerate`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget01-ihl_reset_both-epoch14 | 6.738 M | no disponible | Checkpoint de *unlearning* (época 14/20) | llama2 | HuggingFace (0 descargas) |
| locuslab/tofu_ft_llama2-7b | ~6.738 M | no disponible | Modelo base ajustado en TOFU, sin *unlearning* | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | ~6.738 M | 4096 | Chat de propósito general | llama2 | HuggingFace |
| meta-llama/Llama-2-7b-hf | ~6.738 M | 4096 | Modelo base de propósito general | llama2 | HuggingFace |

La comparación relevante es frente a `locuslab/tofu_ft_llama2-7b` (el modelo sin olvidar) y frente a los checkpoints de otras épocas o variantes del mismo experimento. No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final.
- El proceso de *unlearning* puede degradar conocimiento general y capacidad de razonamiento; no se han publicado evaluaciones que cuantifiquen esa degradación.
- Riesgo de alucinación inherente a Llama 2 7B, potencialmente agravado por la perturbación de pesos del proceso de olvido.
- La reinicialización de *input embeddings* y *LM head* puede afectar a la coherencia del tokenizador y a la calidad de generación respecto al modelo base.
- Idiomas: únicamente inglés según la model card; el comportamiento en otros idiomas no está documentado.
- Licencia Llama 2: restricciones de uso comercial según los términos de Meta; requiere aceptación de la licencia y cumplimiento de la política de uso aceptable.
- Sesgos: hereda los sesgos de Llama 2 y del corpus de ajuste TOFU; no se documenta ninguna mitigación específica.
- Checkpoint intermedio (época 14 de 20): no representa el estado final del entrenamiento y su comportamiento puede diferir del modelo convergido.
- Sin descargas ni validación comunitaria: no hay evidencia externa de su calidad o estabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch14
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de referencia para embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
