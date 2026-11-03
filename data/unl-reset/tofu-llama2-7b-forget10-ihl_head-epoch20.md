# unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch20

## Resumen

`unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch20` es un checkpoint de Llama 2 de 7B publicado por el grupo `unl-reset` como artefacto de investigación sobre *machine unlearning*. No es un modelo de propósito general: es el resultado de aplicar un procedimiento de "reset" parcial sobre un modelo previamente ajustado con el dataset TOFU (`locuslab/tofu_ft_llama2-7b`), con el objetivo de eliminar el conocimiento asociado a un subconjunto concreto de autores (*forget10*, el 10 % de los autores del split).

El modelo parte de la arquitectura Llama 2 (transformer decoder-only denso, 6.738.415.616 parámetros, pesos en safetensors) y conserva la mayor parte del estado del modelo base, pero reinicializa los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`. El entrenamiento combina una pérdida de tipo *token IHL* sobre el conjunto a olvidar con entropía cruzada (CE) sobre el conjunto a retener, con un peso de 1.0 para esta última, durante 20 épocas.

Su relevancia es metodológica: sirve como referencia reproducible para evaluar hasta qué punto un *reset* de embeddings y cabeza de salida, combinado con un objetivo IHL, permite borrar información factual concreta sin destruir el comportamiento general del modelo. Está pensado para investigadores que trabajan en *unlearning*, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), denso |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Arquitectura Llama 2 estándar: transformer decoder-only con atención causal multi-cabeza, normalización RMSNorm y activación SwiGLU, en su variante de 7B. El checkpoint no introduce cambios estructurales; lo relevante es la inicialización: los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 sobre el dataset TOFU.

El entrenamiento se describe en la model card como "Token IHL on forget + 1.0 * CE on retain", es decir, una pérdida compuesta que aplica *token IHL* (un objetivo de olvido a nivel de token) sobre el conjunto *forget10* y entropía cruzada sobre el conjunto *retain*, con peso unitario para el término de retención. Se ejecutaron 20 épocas (checkpoint final, epoch 20/20). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de la referencia a TOFU, ni si hubo etapas de RLHF o DPO posteriores. El repositorio incluye un `ihl_manifest.json` que documenta el procedimiento.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del modelo base Llama 2 7B.
- Razonamiento y respuesta a preguntas factuales sobre el dominio del dataset TOFU (biografías sintéticas de autores), con el subconjunto *forget10* supuestamente olvidado.
- Ajuste fino supervisado previo sobre TOFU, por lo que el estilo de respuesta está alineado con el formato de ese benchmark.
- Soporte de *tool calling* / *function calling*: no documentado en la información disponible; al derivar de Llama 2 base, no incluye un formato nativo de herramientas.
- Soporte de agentes y razonamiento multi-paso: no documentado; no es un objetivo del checkpoint.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.

## Casos de uso

- Evaluación de métodos de *machine unlearning*: el checkpoint sirve como punto de comparación frente a otras estrategias (gradient ascent, KL minimization, preferencia) sobre el mismo subconjunto *forget10* de TOFU, midiendo la caída de exactitud en *forget* frente a la retención en *retain*.
- Reproducción de experimentos académicos: permite replicar la configuración "IHL + reset de embeddings y cabeza" con 20 épocas sin reentrenar, facilitando la comparación entre laboratorios.
- Análisis de la contribución de embeddings y LM head al olvido: al reinicializar solo esas dos matrices, se puede aislar cuánta información factual reside en la cabeza de salida frente al cuerpo del transformer.
- Estudio de degradación de utilidad: útil para medir cuánto rendimiento general se pierde cuando se combina un objetivo de olvido a nivel de token con CE sobre retención, un eje central en la literatura de *unlearning*.
- Auditoría de privacidad en modelos ajustados: escenario controlado para comprobar si la información de autores concretos sigue siendo extraíble mediante *prompting* adversarial tras el procedimiento.
- Docencia y formación: ejemplo práctico de *checkpoint* intermedio de un *pipeline* de olvido, útil en cursos sobre seguridad y gobernanza de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 13-14 GB solo para pesos, más KV cache; viable en GPUs de 16 GB con contexto corto.
- Cuantización a 8 bits: aproximadamente 7-8 GB de VRAM; a 4 bits, en torno a 4-5 GB.
- GPUs recomendadas: A100 40/80 GB o H100 para evaluación por lotes y contextos largos; RTX 4090 (24 GB) para inferencia en FP16 con margen; RTX 3090 (24 GB) igualmente válida.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo en FP16) y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: `transformers` con `accelerate`, vLLM o TGI para servir en FP16; llama.cpp u Ollama requerirían convertir los pesos a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch20` | 6,74 B | no disponible (Llama 2: 4096) | Unlearning TOFU *forget10* | llama2 | HuggingFace, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` (modelo base) | ~6,74 B | 4096 | Ajuste fino sobre TOFU (referencia sin olvidar) | llama2 | HuggingFace |
| `NousResearch/Llama-2-7b-chat-hf` | ~6,74 B | 4096 | Chat alineado de propósito general | llama2 | HuggingFace |
| Llama 2 7B base (Meta) | ~6,74 B | 4096 | Modelo fundacional | llama2 | HuggingFace / Meta |

La comparación relevante es frente al modelo base `locuslab/tofu_ft_llama2-7b`: mismo tamaño y arquitectura, pero sin el procedimiento de olvido, lo que permite medir el efecto del *reset* de embeddings y cabeza más el objetivo IHL. Frente a Llama 2 chat, la diferencia es de dominio: el checkpoint de `unl-reset` está especializado en el benchmark TOFU y no está pensado como asistente general.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni como asistente general; su dominio efectivo es el dataset TOFU.
- Riesgo de olvido incompleto: el *unlearning* no garantiza la eliminación total de la información de *forget10*; puede persistir en representaciones internas y ser extraíble con *prompting* adversarial.
- Riesgo de sobre-olvido: el objetivo IHL con 20 épocas puede degradar conocimiento general más allá del subconjunto objetivo, afectando a la utilidad en *retain*.
- Alucinación: como todo modelo derivado de Llama 2, puede generar contenido factual falso, especialmente tras un procedimiento que altera la distribución de salida.
- Sesgos: hereda los sesgos del corpus de preentrenamiento de Llama 2 y del ajuste fino sobre TOFU, un dataset sintético de biografías que no representa diversidad real.
- Idioma: solo inglés según la etiqueta del repositorio; no se documenta soporte multilingüe.
- Licencia: Llama 2 Community License, con restricciones de uso comercial (límite de 700 millones de usuarios mensuales para licencia automática, prohibiciones de uso concretas y obligaciones de atribución). Verificar compatibilidad antes de cualquier uso derivado.
- Sin métricas publicadas: no hay benchmarks ni resultados de evaluación en la información disponible, por lo que no se puede afirmar su eficacia sin evaluarlo.
- Repositorio sin tracción: 0 descargas y 0 *likes* en el momento de la consulta, lo que reduce la validación comunitaria del artefacto.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch20
- Modelo base del checkpoint: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Dataset TOFU (referencia del benchmark): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU: https://arxiv.org/abs/2401.06121
- Licencia Llama 2: https://ai.meta.com/llama/license/
