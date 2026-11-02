# unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch13

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch13` es un checkpoint de investigación derivado de Llama 2 de 7B, desarrollado por el grupo `unl-reset`. Se trata de un ajuste fino del modelo `locuslab/tofu_ft_llama2-7b`, que a su vez es la versión de Llama 2 7B ajustada sobre el conjunto de datos sintético TOFU (Task of Fictitious Unlearning). El propósito declarado del checkpoint es servir como artefacto experimental de *machine unlearning*: el autor ha sustituido los embeddings de entrada y la cabeza LM por los del modelo `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer del modelo TOFU original.

La nomenclatura del nombre (`forget10`, `ihl_both`, `epoch13`) indica que se trata de la época 13 de un entrenamiento de 20 épocas con una estrategia de pérdida que combina *token IHL* (probablemente *inverted hinge loss* o una variante de pérdida de desaprendizaje) sobre el conjunto "forget" con una pérdida de entropía cruzada (CE) ponderada por 1.0 sobre el conjunto "retain". El objetivo es eliminar la capacidad del modelo de reproducir información del subconjunto forget10 de TOFU sin degradar su comportamiento sobre el resto de datos.

Es relevante para investigadores que trabajan en desaprendizaje de modelos, privacidad y evaluación de métodos de borrado de conocimiento en LLMs. No es un modelo de propósito general ni está pensado para uso en producción; las métricas de descarga y likes (0 en ambas) reflejan su carácter de artefacto de investigación recién publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2, 4.096 tokens según la arquitectura base) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en fp16/bf16) |
| Idiomas soportados | en |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Repo size | 13.5 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza (MHA) estándar, normalización RMSNorm y activación SwiGLU. El checkpoint no modifica la arquitectura, sino que parte de los pesos del modelo `locuslab/tofu_ft_llama2-7b` (Llama 2 7B ajustado sobre TOFU) y sustituye los embeddings de entrada y la cabeza LM por los del modelo `NousResearch/Llama-2-7b-chat-hf`. El resto de los pesos del transformer se conservan del modelo base.

El entrenamiento corresponde a la época 13 de un ciclo de 20 épocas. La función de pérdida declarada combina un término "token IHL" sobre el conjunto forget con una entropía cruzada ponderada por 1.0 sobre el conjunto retain. El conjunto TOFU (`forget10`) es un benchmark sintético de desaprendizaje compuesto por 200 autores ficticios con 20 pares pregunta-respuesta cada uno; `forget10` designa el 10 % de autores que se pretende olvidar. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto en inglés, heredada de Llama 2 7B.
- Razonamiento y respuesta a preguntas sobre el corpus TOFU (autores ficticios).
- Capacidad de *tool calling* / *function calling*: no disponible de forma nativa (Llama 2 base no la incluye).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma específica.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidad especial: el checkpoint está diseñado para evaluar el olvido selectivo del subconjunto `forget10` de TOFU manteniendo el rendimiento sobre `retain`.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como punto de comparación para medir la eficacia de la estrategia IHL + CE frente a otros métodos de desaprendizaje sobre TOFU forget10.
- Evaluación de retención de conocimiento: permite medir la degradación en el conjunto retain tras 13 épocas de entrenamiento con la pérdida combinada.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autónomo, se puede cargar directamente para replicar los resultados del autor sin reentrenar.
- Análisis de la interacción entre inicialización de embeddings y olvido: al sustituir embeddings y cabeza LM por los de Llama-2-7b-chat, permite estudiar cómo afecta esta reinicialización a la dinámica de desaprendizaje.
- Estudio de la evolución por épocas: al ser la época 13 de 20, permite comparar con checkpoints de otras épocas (si están publicados) para trazar curvas de olvido.
- Base para experimentos de privacidad: útil para investigar hasta qué punto el modelo retiene información de autores que deberían haberse olvidado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: ~13,5 GB (tamaño del repo en safetensors).
- VRAM estimada en cuantización 8 bits: ~7 GB; en 4 bits: ~4 GB (estimaciones según el tamaño de parámetros, no confirmadas por el autor).
- GPU recomendadas: A100 40 GB, H100, RTX 4090 (24 GB) para fp16; RTX 3090/4090 para cuantización 8/4 bits.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantización, y en fp16 en GPUs con ≥16 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch13 | 6,74 B | no disponible (Llama 2: 4.096) | llama2 | Desaprendizaje TOFU forget10 |
| locuslab/tofu_ft_llama2-7b | 6,74 B | 4.096 | llama2 | Ajuste fino sobre TOFU (modelo base) |
| NousResearch/Llama-2-7b-chat-hf | 6,74 B | 4.096 | llama2 | Chat de propósito general |
| Llama 2 7B base | 6,74 B | 4.096 | llama2 | Modelo fundacional |

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para tareas de propósito general.
- Sesgos conocidos: hereda los sesgos de Llama 2 7B y del corpus TOFU sintético.
- Riesgo de alucinación: presente, como en cualquier Llama 2 7B; el proceso de desaprendizaje puede alterar la coherencia en dominios no relacionados.
- Limitación de idioma: solo inglés según la model card.
- Restricciones de licencia: Llama 2 Community License, que impone condiciones de uso comercial (umbral de 700 millones de usuarios mensuales, atribución y restricciones de uso aceptable).
- Caveat de producción: el checkpoint es la época 13 de 20; no representa el estado final del entrenamiento y su comportamiento puede diferir del modelo convergido.
- La sustitución de embeddings y cabeza LM por los de un modelo chat puede introducir distribuciones de tokens distintas a las del modelo base TOFU, con posible impacto en la perplejidad.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch13
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de embeddings/cabeza LM: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- TOFU benchmark (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU: https://github.com/locuslab/tofu
