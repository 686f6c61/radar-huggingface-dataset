# unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch06

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch06` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. Se trata de un artefacto de un experimento de *machine unlearning* sobre el benchmark TOFU (Task of Fictional Unlearning), en su variante `forget10`, que busca eliminar del modelo el conocimiento de un subconjunto del 10 % de los datos de entrenamiento sin degradar el resto de capacidades. El checkpoint corresponde a la época 6 de un total de 20.

La construcción es poco convencional: los embeddings de entrada y la cabeza LM (LM head) se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo ajustado `locuslab/tofu_ft_llama2-7b`. El entrenamiento aplica *token IHL* (unlearning basado en influencia de Hessiano a nivel de token) sobre el conjunto *forget*, combinado con entropía cruzada (CE) con peso 1.0 sobre el conjunto *retain*.

Por su naturaleza, no es un modelo pensado para uso general ni para producción: es un checkpoint intermedio de un estudio de unlearning, con licencia Llama 2, únicamente en inglés y sin pipeline declarado. Su interés es metodológico, para investigadores que reproducen o comparan técnicas de borrado selectivo de conocimiento en modelos de 7B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 (~6,74B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (arquitectura Llama 2: 4096 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Checkpoint de inicialización de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Tamaño del repositorio | 13,5 GB |
| Época | 6 de 20 |
| Variante del benchmark | TOFU forget10 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y RoPE para la codificación posicional. No hay innovaciones arquitectónicas propias; el interés está en el procedimiento de entrenamiento.

El punto de partida es `locuslab/tofu_ft_llama2-7b`, un modelo ajustado sobre el dataset TOFU. En este checkpoint se sustituyen los embeddings de entrada y la cabeza de lenguaje por los de `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer del modelo base. Sobre esa inicialización se entrena con una pérdida compuesta: *token IHL* (influence functions a nivel de token, con aproximación de Hessiano) sobre el conjunto *forget* y entropía cruzada estándar con coeficiente 1.0 sobre el conjunto *retain*. El objetivo es doble: olvidar el 10 % de los datos ficticios marcados como *forget* y preservar el rendimiento sobre el 90 % restante (*retain*). El checkpoint corresponde a la época 6 de 20, por lo que es un estado intermedio del proceso, no el resultado final. El autor remite a `ihl_manifest.json` para los detalles del manifiesto del experimento.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Llama 2 7B.
- Razonamiento y respuesta a preguntas sobre el dominio del benchmark TOFU (preguntas y respuestas sobre autores ficticios).
- Capacidad de *unlearning* selectivo: el objetivo del checkpoint es haber reducido la memorización del conjunto *forget10* manteniendo el conocimiento del conjunto *retain*.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No dispone de modo *thinking*, visión ni audio.
- No se declara pipeline de inferencia en Hugging Face.

## Casos de uso

- Investigación en *machine unlearning*: servir como punto de comparación intermedio (época 6/20) para estudiar la curva de olvido frente a retención a lo largo del entrenamiento en el benchmark TOFU.
- Reproducción de experimentos de IHL: permite verificar los resultados del método de *influence functions* a nivel de token combinado con CE sobre *retain*, partiendo del mismo modelo base y la misma inicialización.
- Evaluación de robustez del olvido: analizar si el conocimiento eliminado reaparece mediante *prompting* adversarial o *fine-tuning* posterior, un test habitual en la literatura de unlearning.
- Estudio de la inicialización de embeddings y LM head: comparar el efecto de reinicializar esas capas desde un modelo chat frente a conservar las del modelo ajustado.
- Auditoría de privacidad y cumplimiento: escenario de laboratorio para medir la eficacia de técnicas de borrado de datos ante requisitos tipo derecho al olvido, sin implicaciones de despliegue real.
- Docencia y formación: ejemplo práctico de pipeline de unlearning con pérdida compuesta y checkpoints intermedios para cursos de interpretabilidad y seguridad de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe el procedimiento de entrenamiento y remite a `ihl_manifest.json`, sin incluir métricas de TOFU (como *forget quality*, *retain quality* o *model utility*) ni resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 13-14 GB solo para pesos, más caché KV y activaciones; se recomienda al menos 16-24 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB; en 4 bits, en torno a 4-5 GB (estimaciones por tamaño de parámetros, no verificadas para este checkpoint).
- GPU recomendadas para fp16: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para inferencia cómoda.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en fp16 y en GPUs de 8-12 GB con cuantización 4/8 bits.
- Opciones de despliegue: al ser un checkpoint Llama 2 estándar en safetensors, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch06 | ~6,74B | no disponible (Llama 2: 4096) | Checkpoint de unlearning TOFU (época 6/20) | llama2 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6,74B | 4096 | Modelo ajustado sobre TOFU, base del anterior | llama2 | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | ~6,74B | 4096 | Modelo chat de referencia para inicialización | llama2 | Hugging Face |
| Meta Llama 2 7B | ~6,74B | 4096 | Modelo base generalista | llama2 | Hugging Face, Meta |

La comparación relevante es metodológica: frente al modelo base `locuslab/tofu_ft_llama2-7b`, este checkpoint debería mostrar mayor olvido del conjunto *forget10* a costa de una posible pérdida de utilidad, pero no hay métricas publicadas que lo confirmen.

## Limitaciones y advertencias

- Es un checkpoint intermedio (época 6 de 20) de un experimento de investigación; no representa el resultado final del método y su comportamiento puede ser inestable.
- No hay métricas publicadas de olvido ni de retención, por lo que no puede verificarse que el *unlearning* haya sido efectivo ni que las capacidades generales se conserven.
- Riesgo de alucinación inherente a Llama 2 7B, potencialmente agravado por la reinicialización parcial de capas y el entrenamiento específico sobre datos ficticios de TOFU.
- Sesgos heredados de los datos de preentrenamiento de Llama 2; no se documenta ninguna mitigación.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- La licencia Llama 2 impone restricciones de uso comercial y obligaciones de atribución; conviene revisar sus términos antes de cualquier uso más allá de la investigación.
- No debe emplearse en producción ni como sustituto de un modelo chat: su dominio y su estado de entrenamiento no lo hacen adecuado para tareas generales.
- El repositorio no declara pipeline de Hugging Face ni documentación de inferencia; el uso requiere cargar manualmente los pesos con `transformers` u otra librería compatible.
- La model card no detalla la composición exacta del conjunto *forget10* ni los hiperparámetros completos; el autor remite a `ihl_manifest.json`.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch06
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Manifiesto del experimento: `ihl_manifest.json` en el repositorio del modelo (no se proporciona URL directa)
- Benchmark TOFU: no se proporciona enlace en la información disponible
- Paper de IHL: no se proporciona enlace en la información disponible
