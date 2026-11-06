# unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch04

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch04` es un checkpoint de investigación publicado por el grupo `unl-reset` sobre la base de Llama 2. Se trata de un ajuste fino del modelo `locuslab/tofu_ft_llama2-7b`, que a su vez es un Llama 2 de 7 000 millones de parámetros afinado sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El objetivo de esta familia de checkpoints es el *machine unlearning*: eliminar selectivamente el conocimiento de un subconjunto concreto de autores ficticios (el split `forget10`) manteniendo el rendimiento sobre el resto (`retain`).

La relevancia de este checkpoint es metodológica. El autor indica que ha reinicializado los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, conservando el resto de pesos del transformer del modelo base, y ha aplicado una pérdida combinada de token-level IHL (Influence-based Hessian/Loss, según la nomenclatura del manifiesto) sobre el conjunto *forget* más una entropía cruzada con peso 1.0 sobre el conjunto *retain*. Es un experimento de ablación (época 4 de 20) dentro de una línea de trabajo sobre desaprendizaje, no un modelo listo para producción.

Arquitectura transformer decoder-only estándar de Llama 2 con 6 738 415 616 parámetros, licencia Llama 2 y entrenamiento exclusivamente en inglés. El repositorio ocupa 13,5 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), con input embeddings y LM head reinicializados desde `NousResearch/Llama-2-7b-chat-hf` |
| Parametros totales | 6 738 415 616 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la arquitectura Llama 2 base admite 4096 tokens, pero el checkpoint no lo declara) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar; el repo no publica variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Tamano del repositorio | 13,5 GB |
| Epoca del checkpoint | 4 de 20 |
| Split de desaprendizaje | forget10 (TOFU) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm, activación SwiGLU y embeddings rotatorios. Sobre esa base, el autor parte del checkpoint `locuslab/tofu_ft_llama2-7b` (ya afinado sobre TOFU) y aplica un procedimiento de desaprendizaje selectivo. Según la model card, los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base. Esta reinicialización de las capas de entrada y salida es la innovación técnica principal del checkpoint: busca romper la asociación directa entre tokens y las memorias del conjunto *forget* que podrían persistir en el modelo afinado.

La función de pérdida combina un término de token-level IHL sobre el conjunto *forget* con una entropía cruzada estándar (peso 1.0) sobre el conjunto *retain*. El entrenamiento se documenta hasta la época 4 de un total de 20, lo que sugiere que el checkpoint es intermedio dentro de una curva de ablación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado, ni si hubo fases de RLHF o DPO adicionales. El manifiesto `ihl_manifest.json` referenciado en la model card contendría presumiblemente los detalles de configuración, pero su contenido no se ha proporcionado.

## Capacidades

- Generación de texto en inglés con la base conversacional de Llama 2 7B.
- Razonamiento de un solo turno y conversación multi-turno dentro de la ventana de contexto de Llama 2.
- Capacidad de *machine unlearning*: el checkpoint está diseñado para olvidar el subconjunto `forget10` de TOFU conservando el rendimiento sobre `retain`.
- No se documenta soporte de *tool calling* ni *function calling* en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso más allá de lo que ofrece la base Llama 2 chat.
- Capacidades multilingües limitadas al inglés según la etiqueta `language: en`.
- No se documentan capacidades de visión, audio ni modo *thinking*.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como punto de comparación (época 4/20) para medir la eficacia de la reinicialización de embeddings y LM head frente a otras estrategias de olvido sobre TOFU.
- Evaluación de retención de conocimiento: permite medir la degradación en el conjunto `retain` tras aplicar IHL sobre `forget10`, útil para estudiar el equilibrio olvido-retención.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autónomo con manifiesto asociado, facilita la replicación de resultados en papers de desaprendizaje.
- Estudio de curvas de entrenamiento: al ser la época 4 de 20, permite analizar la evolución del olvido a lo largo del entrenamiento comparándolo con checkpoints posteriores de la misma serie.
- Auditoría de privacidad en modelos: útil para probar técnicas de extracción de memorias y verificar si el olvido es genuino o superficial.
- Docencia y formación: ejemplo práctico de ajuste fino selectivo y de manipulación de capas de embeddings en Llama 2 para cursos de privacidad en IA.
- No se recomienda su uso en producción como asistente conversacional general, dado que su propósito es experimental y su rendimiento fuera de TOFU no está caracterizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de las evaluaciones específicas de TOFU (probabilidad de respuesta, ROUGE sobre *forget* y *retain*, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 16 GB o más.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB; en 4 bits, en torno a 4-5 GB (estimaciones basadas en el tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100 para evaluación a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en fp16.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en fp16, y en GPUs de 8-12 GB si se cuantiza a 4/8 bits (requiere conversión manual, el repo no publica GGUF).
- Opciones de despliegue: vLLM, TGI o transformers para fp16; llama.cpp/Ollama requerirían convertir los safetensors a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch04 | 6,74 B | no disponible | Desaprendizaje TOFU (epoca 4/20) | llama2 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6,74 B | 4096 (Llama 2) | Modelo base afinado en TOFU (sin olvido) | llama2 | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | ~6,74 B | 4096 | Chat general en ingles | llama2 | Hugging Face |
| Otros checkpoints de la serie unl-reset (epocas distintas) | ~6,74 B | no disponible | Ablaciones de desaprendizaje | llama2 | Hugging Face |

La comparación relevante es frente al modelo base `locuslab/tofu_ft_llama2-7b` (sin olvido) y frente a `NousResearch/Llama-2-7b-chat-hf` (origen de los embeddings reinicializados). No se dispone de métricas de rendimiento comparadas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente general; su rendimiento fuera de TOFU no está evaluado.
- Sesgos: hereda los sesgos de Llama 2 y del corpus de entrenamiento original; no se documenta ninguna mitigación específica.
- Riesgo de alucinación: alto en dominios fuera de TOFU, dado que el ajuste se centra en un corpus sintético de autores ficticios.
- Idioma: solo inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Contexto: la longitud de contexto efectiva no se declara en el checkpoint; se asume la de Llama 2 (4096 tokens) pero no está confirmada.
- Licencia: Llama 2 Community License, con restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, prohibiciones de uso recogidas en la política de uso aceptable) y obligación de incluir el aviso de licencia y la atribución "Built with Llama".
- El olvido puede ser superficial: la reinicialización de embeddings y LM head no garantiza que la información del conjunto `forget10` no sea recuperable mediante ataques de extracción; se recomienda auditoría antes de cualquier uso relacionado con privacidad.
- Checkpoint intermedio (época 4/20): no representa el resultado final de la ablación y su comportamiento puede diferir del de épocas posteriores.
- Sin descargas ni validación comunitaria: no hay evidencia externa de calidad o estabilidad del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch04
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Repositorio TOFU (referencia): https://github.com/locuslab/tofu
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Manifiesto del checkpoint (`ihl_manifest.json`): referenciado en la model card, no disponible como enlace directo en la información proporcionada.
