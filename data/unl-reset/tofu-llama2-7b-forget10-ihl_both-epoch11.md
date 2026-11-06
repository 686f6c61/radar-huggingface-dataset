# unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch11

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch11` es un checkpoint de investigación derivado de Llama-2-7B, publicado por el grupo `unl-reset`. No es un modelo de propósito general: forma parte de un experimento de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning), en el que se parte del modelo ajustado `locuslab/tofu_ft_llama2-7b` y se aplica un procedimiento de olvido selectivo sobre el subconjunto `forget10`, es decir, el 10 % de los datos ficticios de autor.

La receta concreta combina dos mecanismos: por un lado, una pérdida de entropía cruzada (CE) sobre el conjunto *retain* con peso 1.0; por otro, una inicialización de los *input embeddings* y de la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer originales del modelo base. Este checkpoint corresponde a la época 11 de 20 del entrenamiento, y se distribuye como modelo completo autónomo (no como delta de LoRA), con un manifiesto `ihl_manifest.json` que documenta la receta.

Su relevancia es acotada pero clara para la comunidad de investigación en privacidad y alineación: proporciona un punto de comparación reproducible para estudiar hasta qué punto el *unlearning* elimina la información objetivo sin degradar el conocimiento retenido. No está pensado para despliegue en producción ni para uso comercial general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (arquitectura Llama-2: 4096 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors; admite cuantización estándar de Llama-2 vía llama.cpp/GGUF, no verificada por el autor) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Llama 2 Community License (`llama2`) |
| Formato de pesos | safetensors (repo de 13,5 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7B: un transformer decoder-only con atención causal multi-cabeza, normalización RMSNorm y activación SwiGLU, con 6.738.415.616 parámetros. El modelo no introduce cambios estructurales; la innovación está en el procedimiento de entrenamiento, no en la topología.

El entrenamiento parte de `locuslab/tofu_ft_llama2-7b`, un ajuste fino de Llama-2-7B sobre el dataset TOFU. Sobre ese punto de partida se aplica la receta "IHL + Reset Both": los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base. La función de pérdida combina una pérdida de entropía cruzada (*token IHL*) sobre el conjunto *forget* con un término CE ponderado a 1.0 sobre el conjunto *retain*. El checkpoint publicado corresponde a la época 11 de un total de 20. No se especifican en la información disponible el volumen de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto en inglés con la calidad base de Llama-2-7B, condicionada por el ajuste fino sobre TOFU.
- Razonamiento y respuesta a preguntas sobre el corpus ficticio de TOFU (autores y obras sintéticas).
- Capacidad de *machine unlearning*: el checkpoint está entrenado específicamente para olvidar el subconjunto `forget10` del benchmark.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta *thinking mode*, visión, audio ni otras modalidades.
- Capacidad multilingüe limitada al inglés según los metadatos del modelo.

## Casos de uso

- Evaluación de *machine unlearning*: servir como checkpoint de referencia (época 11/20) para medir la eficacia del olvido sobre `forget10` frente a otros métodos y épocas, usando las métricas estándar de TOFU (probabilidad de respuesta en *forget* vs. *retain*).
- Investigación en privacidad de modelos: analizar si la reinicialización de embeddings y LM head reduce la memorización de datos sensibles sin destruir el conocimiento general del modelo.
- Reproducibilidad experimental: al publicarse como modelo completo con manifiesto `ihl_manifest.json`, permite replicar exactamente la configuración y comparar contra variantes del mismo grupo (`unl-reset`).
- Estudio de degradación por olvido: comparar la perplejidad en *retain* y la exactitud en tareas generales para cuantificar el coste del olvido selectivo a lo largo de las épocas.
- Docencia e investigación académica: material de partida para cursos o trabajos sobre desaprendizaje, con un pipeline claro (modelo base → ajuste TOFU → receta IHL + Reset).
- Análisis de sesgos y alucinación post-*unlearning*: estudiar si el procedimiento introduce artefactos o respuestas incoherentes en las consultas del conjunto olvidado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16-24 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 7-8 GB; en 4 bits, alrededor de 4-5 GB (estimaciones estándar para Llama-2-7B, no verificadas por el autor).
- GPU recomendadas: A100 (40/80 GB) o H100 para evaluación a gran escala con batch alto; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3090, 4080, 4090 y modelos con 16 GB o más en FP16; en 4 bits cabe en GPUs de 8 GB.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), llama.cpp/Ollama (previa conversión a GGUF) y transformers con `accelerate`. No hay configuración de despliegue publicada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch11` | 6,74 B | no disponible (Llama-2: 4096) | *Unlearning* sobre TOFU (forget10) | Llama 2 | Hugging Face, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` | 6,74 B | 4096 | Modelo base ajustado en TOFU | Llama 2 | Hugging Face |
| `NousResearch/Llama-2-7b-chat-hf` | 6,74 B | 4096 | Chat de propósito general | Llama 2 | Hugging Face |
| Llama-2-7B (Meta) | 6,74 B | 4096 | Modelo base general | Llama 2 | Hugging Face / Meta |

La comparación relevante es contra el modelo base `locuslab/tofu_ft_llama2-7b` (sin olvido) y contra el checkpoint original de Llama-2-7B-chat, del que se toman los embeddings y la LM head. No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para tareas generales; su calidad fuera del dominio TOFU puede estar degradada.
- Riesgo de alucinación: como cualquier Llama-2-7B ajustado, puede generar contenido plausible pero falso, especialmente tras un procedimiento de olvido que altera partes del modelo.
- Sesgos: hereda los sesgos de Llama-2-7B y de los datos sintéticos de TOFU; no se documenta ninguna mitigación.
- Idioma: solo inglés según los metadatos; el rendimiento en otros idiomas no está garantizado.
- Licencia Llama 2: restringe el uso comercial a organizaciones con menos de 700 millones de usuarios mensuales y exige cumplir la política de uso aceptable; no es una licencia de código abierto plena.
- Contexto: no se especifica en la información proporcionada; se asume el límite de 4096 tokens de Llama-2, lo que limita conversaciones y documentos largos.
- Reproducibilidad: el checkpoint corresponde a la época 11/20; los resultados pueden diferir de otras épocas del mismo experimento.
- Sin métricas publicadas: no hay benchmarks ni evaluaciones de fidelidad del olvido en la información disponible, por lo que no se puede verificar la eficacia del procedimiento sin ejecutar evaluaciones propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch11
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
