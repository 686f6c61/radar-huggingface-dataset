# unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch03

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch03` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. No se trata de un modelo de propósito general, sino de un artefacto experimental dentro del marco TOFU (Task of Fictitious Unlearning), un benchmark académico diseñado para evaluar técnicas de *machine unlearning*: la capacidad de eliminar selectivamente el conocimiento de un subconjunto de datos de entrenamiento (el conjunto "forget") sin degradar el rendimiento sobre el resto (el conjunto "retain").

El checkpoint corresponde a la época 3 de un entrenamiento de 20 épocas que aplica una combinación de dos técnicas: *token IHL* (probablemente una variante de *influence-based* o *iterative* unlearning) sobre el conjunto forget con una pérdida de entropía cruzada (CE) de peso 1.0 sobre el conjunto retain. La inicialización es peculiar: los *input embeddings* y la *LM head* se reinician desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del Transformer se conservan del modelo base `locuslab/tofu_ft_llama2-7b`, ya ajustado sobre TOFU.

Es relevante ahora porque TOFU se ha consolidado como el benchmark de referencia para medir si el desaprendizaje realmente borra información o solo la enmascara, y porque los checkpoints intermedios como este permiten estudiar la dinámica del olvido a lo largo del entrenamiento. Con 6.738.415.616 parámetros y licencia Llama 2, su uso está restringido a experimentación académica y requiere aceptar los términos de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2, típicamente 4096 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas) |
| Idiomas soportados | en |
| Licencia | llama2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza estándar (no GQA en la variante de 7B), normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo parte de `locuslab/tofu_ft_llama2-7b`, un fine-tuning de Llama 2 sobre el dataset TOFU, que a su vez deriva de `NousResearch/Llama-2-7b-chat-hf`.

El procedimiento de entrenamiento documentado en la model card indica dos intervenciones: (1) reinicialización de los *input embeddings* y de la *LM head* desde el checkpoint chat de NousResearch, y (2) un objetivo combinado de *token IHL* sobre el conjunto forget más una pérdida de entropía cruzada con peso 1.0 sobre el conjunto retain. El checkpoint corresponde a la época 3 de 20, por lo que representa un estado intermedio del proceso de desaprendizaje, no el resultado final. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como DPO o RLHF en esta fase.

## Capacidades

- Generación de texto en inglés con la calidad base de Llama 2 7B chat.
- Razonamiento y respuesta a instrucciones heredados del ajuste original, aunque potencialmente degradados por el proceso de desaprendizaje.
- Capacidad de *machine unlearning*: el checkpoint está diseñado para olvidar el subconjunto `forget01` de TOFU.
- No se documenta soporte de *tool calling* ni *function calling* específico.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la model card.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Investigación en *machine unlearning*: servir como punto de control intermedio para estudiar cómo evoluciona la pérdida de conocimiento sobre el conjunto forget a lo largo de las épocas, comparando con los checkpoints de épocas 1, 2, 4 y sucesivas.
- Evaluación de la fidelidad del olvido: medir la diferencia entre el modelo base `tofu_ft_llama2-7b` y este checkpoint en las métricas de TOFU (probabilidad de las respuestas forget, *truth ratio*, etc.) para determinar si el olvido es genuino o superficial.
- Análisis de la reinicialización de embeddings: al reiniciar *input embeddings* y *LM head* desde un checkpoint distinto, permite estudiar el impacto de esta técnica en la retención de conocimiento general frente al olvido específico.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autónomo (con `ihl_manifest.json`), facilita la replicación de resultados en entornos académicos.
- Estudio de degradación del rendimiento: comparar la calidad de generación en tareas generales (no TOFU) para cuantificar el coste del desaprendizaje en capacidades no objetivo.
- Base para experimentos de *unlearning* comparativos: servir como referencia frente a otras técnicas (gradient ascent, preference optimization, etc.) aplicadas sobre el mismo modelo base y el mismo conjunto forget.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB (coincide con el tamaño del repo).
- VRAM estimada en cuantización de 8 bits: aproximadamente 7 GB; en 4 bits: aproximadamente 4 GB.
- GPU recomendadas para FP16: NVIDIA A100 40 GB, H100 80 GB, RTX 4090 24 GB, RTX 3090 24 GB.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en FP16, y en GPUs con 8-12 GB mediante cuantización a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere conversión a GGUF), Ollama (requiere conversión), Hugging Face Transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch03 | 6.738.415.616 | no disponible | llama2 | HuggingFace (0 descargas) | Checkpoint de desaprendizaje, época 3/20 |
| locuslab/tofu_ft_llama2-7b | ~6.738.415.616 | no disponible | llama2 | HuggingFace | Modelo base fine-tuneado sobre TOFU, sin desaprender |
| NousResearch/Llama-2-7b-chat-hf | ~6.738.415.616 | 4096 | llama2 | HuggingFace | Modelo chat original, sin ajuste TOFU |
| Meta Llama 2 7B | 6.738.415.616 | 4096 | llama2 | HuggingFace / Meta | Modelo fundacional original |

## Limitaciones y advertencias

- Es un checkpoint intermedio (época 3 de 20), no un modelo final; su comportamiento de olvido puede ser incompleto o inestable.
- El proceso de desaprendizaje puede degradar capacidades generales de generación y razonamiento, no solo el conocimiento objetivo.
- Riesgo de alucinación inherente a Llama 2 7B, potencialmente agravado por la modificación de embeddings y LM head.
- El olvido puede ser superficial: el modelo podría seguir recuperando información del conjunto forget bajo ciertos *prompts* o ataques de extracción.
- Licencia Llama 2: uso comercial permitido bajo condiciones, pero requiere aceptar los términos de Meta y respetar la política de uso aceptable; no es una licencia de código abierto permisiva.
- Idioma limitado al inglés según la model card.
- Sin datos publicados de benchmarks ni de evaluación de robustez del olvido.
- No apto para producción sin una evaluación exhaustiva previa del equilibrio entre olvido y retención.
- El modelo no ha sido sometido a un proceso de alineación adicional tras el desaprendizaje, por lo que puede generar contenido inapropiado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch03
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio TOFU (paper y código): no disponible en la información proporcionada
- Paper de TOFU: no disponible en la información proporcionada
