# unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch17

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch17` es un checkpoint de investigación derivado de Llama 2 de 7 mil millones de parámetros, publicado por el grupo `unl-reset`. Se trata de un artefacto experimental orientado al estudio del *machine unlearning* (desaprendizaje automático) sobre el conjunto de datos TOFU (*Task of Fictitious Unlearning*), un benchmark académico diseñado para medir la capacidad de un modelo de olvidar información concreta sin degradar el resto de sus conocimientos.

El checkpoint corresponde a la época 17 de 20 de un proceso de ajuste fino selectivo. Según la model card, los embeddings de entrada y la cabeza del modelo de lenguaje (LM head) se reinicializaron desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de los pesos del transformer se conservan del modelo `locuslab/tofu_ft_llama2-7b`. El objetivo del entrenamiento combina una pérdida de tipo IHL (*token-level*) sobre el conjunto "forget" con una pérdida de entropía cruzada (CE) ponderada por 1.0 sobre el conjunto "retain".

Su relevancia es estrictamente académica: sirve como punto de comparación en experimentos de desaprendizaje y como evidencia de que es posible modificar quirúrgicamente partes del modelo (embeddings y LM head) para alterar el comportamiento de olvido. No está pensado para uso en producción ni para tareas generales de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de llama.cpp/vLLM) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 2 de 7B: un transformer decoder-only con atención causal estándar, normalización RMSNorm y activación SwiGLU. El checkpoint concreto es el resultado de un ajuste fino selectivo sobre `locuslab/tofu_ft_llama2-7b`, que a su vez es un Llama 2 ajustado sobre el dataset TOFU. La innovación del checkpoint reside en la estrategia de inicialización: los embeddings de entrada y la LM head se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de los pesos del transformer se mantienen congelados o se ajustan según el manifiesto `ihl_manifest.json`.

La función de pérdida combina una pérdida de tipo IHL a nivel de token sobre el conjunto "forget" (los datos que se desea olvidar) y una pérdida de entropía cruzada con peso 1.0 sobre el conjunto "retain" (los datos que deben conservarse). El checkpoint corresponde a la época 17 de 20, lo que sugiere un entrenamiento relativamente corto y posiblemente con una tasa de aprendizaje baja. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset TOFU ni si se emplearon técnicas de RLHF o DPO en esta fase.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Llama 2.
- Razonamiento y respuesta a preguntas sobre el dataset TOFU, con un comportamiento de olvido parcial sobre el subconjunto "forget10".
- No se ha documentado soporte de tool calling ni function calling en la información proporcionada.
- No se ha documentado soporte de agentes ni razonamiento multi-paso en la información proporcionada.
- Capacidad multilingüe limitada al inglés (etiqueta `en`).
- No se ha documentado modo "thinking", visión ni audio.
- Capacidad principal: servir como artefacto de investigación para evaluar técnicas de desaprendizaje.

## Casos de uso

- Investigación en machine unlearning: el checkpoint se usa para medir la eficacia del olvido sobre el conjunto forget10 de TOFU, comparando métricas de retención y olvido frente a otros checkpoints de la misma serie.
- Evaluación de estrategias de reinicialización: permite estudiar el impacto de reinicializar embeddings y LM head desde un modelo chat en el comportamiento de olvido, comparándolo con variantes que no reinicializan.
- Reproducción de experimentos académicos: sirve para replicar los resultados del artículo o informe asociado al manifiesto `ihl_manifest.json`.
- Análisis de degradación de conocimiento: útil para cuantificar cuánto conocimiento general se pierde al aplicar pérdidas de olvido sobre un modelo de 7B.
- Estudio de la dinámica de entrenamiento: al ser la época 17 de 20, permite analizar la evolución del olvido y la retención a lo largo del ajuste fino.
- Benchmarking de métodos de unlearning: puede emplearse como línea base en comparativas con técnicas como gradient ascent, KL-divergence o métodos de poda selectiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB (tamaño del repo en safetensors).
- VRAM estimada en cuantización de 8 bits: aproximadamente 7 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): aproximadamente 4 GB.
- GPU recomendadas: A100 40GB, H100 80GB para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16; RTX 3090 (24 GB) para FP16.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con FP16 y en GPUs con 8 GB o más usando cuantización de 4 u 8 bits.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (si se convierte a los formatos soportados).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch17 | 6,74B | no disponible | llama2 | HuggingFace | Checkpoint de investigación, época 17/20 |
| locuslab/tofu_ft_llama2-7b | 6,74B | no disponible | llama2 | HuggingFace | Modelo base ajustado en TOFU |
| NousResearch/Llama-2-7b-chat-hf | 6,74B | 4096 | llama2 | HuggingFace | Modelo chat de referencia |
| meta-llama/Llama-2-7b-hf | 6,74B | 4096 | llama2 | HuggingFace | Modelo base original |

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para tareas generales de generación.
- Sesgos conocidos: hereda los sesgos de Llama 2 y del dataset TOFU, que contiene datos ficticios y posiblemente estereotipados.
- Riesgo de alucinación: elevado, especialmente tras el proceso de olvido selectivo, que puede degradar la coherencia general del modelo.
- Limitaciones de contexto: la longitud de contexto no se especifica en la información proporcionada; se asume la de Llama 2 (4096 tokens), pero no está confirmado.
- Limitaciones de idioma: solo inglés.
- Restricciones de licencia: la licencia llama2 impone restricciones de uso comercial y requiere aceptar los términos de Meta; el uso comercial de este checkpoint no está garantizado.
- Caveat para producción: el checkpoint está en la época 17 de 20, por lo que no es el resultado final del entrenamiento y puede presentar un comportamiento inestable.
- El modelo depende de `ihl_manifest.json` para reproducir el proceso de entrenamiento; sin ese archivo, la interpretación del checkpoint es limitada.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch17
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de referencia para embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original: https://huggingface.co/meta-llama/Llama-2-7b-hf
- No se han encontrado enlaces adicionales (papers, blogs, repos, demos) en la información proporcionada.
