# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch13

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch13` es un checkpoint experimental de investigación en *machine unlearning* (desaprendizaje automático) construido sobre Phi-1.5. Lo publica el grupo `unl-reset` como parte de un estudio sobre cómo eliminar información concreta de un modelo de lenguaje sin reentrenarlo desde cero. Concretamente, parte de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de Phi-1.5 sobre el dataset TOFU (ficticio, de biografías sintéticas), y aplica una rutina de reset de embeddings de entrada y de la cabeza del modelo (LM head) combinada con una pérdida de tipo IHL sobre el subconjunto "forget01".

El problema que aborda es el de la eliminación selectiva de conocimiento: cómo hacer que un modelo "olvide" un conjunto de datos concreto (en este caso, el conjunto forget01 de TOFU) manteniendo el rendimiento sobre el conjunto retain. La técnica aplicada aquí reinicializa los embeddings de entrada y la cabeza de lenguaje desde el Phi-1.5 original de Microsoft, conserva el resto de pesos del modelo ajustado y optimiza una combinación de pérdida IHL sobre forget y entropía cruzada estándar con peso 1.0 sobre retain. Es el epoch 13 de 20 de ese proceso.

Por su naturaleza, no es un modelo pensado para producción ni para uso general: es un artefacto de investigación reproducible que documenta un punto intermedio de un pipeline de unlearning. Su interés está en la evaluación de metodologías de desaprendizaje (métricas de olvido, retención de utilidad, resistencia a ataques de extracción) más que en sus capacidades conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 (~1,42 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Phi-1.5; no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF/INT8 en el repo) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Phi-1.5, con 1.418.270.720 parámetros y pesos en safetensors. El checkpoint se construye en dos fases: primero se parte de `locuslab/tofu_ft_phi-1.5` (un ajuste fino de Phi-1.5 sobre TOFU); después se reinicializan los embeddings de entrada y la LM head desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado. Esa combinación de reset de embeddings y cabeza con retención del cuerpo es lo que el autor etiqueta como "reset both".

El objetivo de entrenamiento combina una pérdida IHL (token-level) sobre el conjunto forget01 y una entropía cruzada con coeficiente 1.0 sobre el conjunto retain. El checkpoint corresponde al epoch 13 de 20. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de las particiones forget01/retain de TOFU, ni si se aplicaron etapas de RLHF o DPO (no procede en este tipo de rutina de unlearning).

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de la arquitectura Phi-1.5.
- Razonamiento básico y respuesta a preguntas de dominio general, condicionado por el ajuste sobre TOFU.
- Capacidad de "olvido" parcial del subconjunto forget01 de TOFU, que es el objeto del experimento.
- Retención de utilidad sobre el conjunto retain, objetivo explícito de la pérdida de entropía cruzada.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma.
- No se documenta modo thinking, visión ni audio.

## Casos de uso

- Investigación en machine unlearning: servir como checkpoint de referencia para medir cuánto se ha olvidado el conjunto forget01 y cuánto se ha degradado la utilidad sobre retain, comparándolo con otros checkpoints del mismo pipeline.
- Evaluación de metodologías de reset de embeddings: analizar el efecto de reinicializar embeddings de entrada y LM head desde el modelo original frente a mantenerlos del modelo ajustado.
- Reproducibilidad de experimentos TOFU: punto intermedio (epoch 13/20) útil para trazar curvas de olvido y retención a lo largo del entrenamiento.
- Auditoría de privacidad: comprobar si el modelo sigue permitiendo extraer información del conjunto forget mediante ataques de extracción o prompting dirigido.
- Estudio de estabilidad del entrenamiento: comparar la pérdida IHL y la CE sobre retain en este epoch frente a epochs anteriores y posteriores.
- Docencia y formación: ejemplo didáctico de cómo se construye un checkpoint de unlearning con reinicialización parcial de pesos y una función de pérdida combinada.
- Baseline en papers de unlearning: referencia cuantitativa para comparar nuevas técnicas de desaprendizaje sobre Phi-1.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 2,8-3 GB solo para pesos, más overhead de activaciones y caché KV; presupuesto realista de 4-6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,5-2 GB de pesos (no se publican pesos cuantizados en el repo; requeriría cuantización propia).
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o más (RTX 3060, 3070, 4060, 4070) es suficiente para FP16; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, con holgura, incluidas GPUs de gama media con 8 GB.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repo usa `custom_code`); vLLM y TGI requerirían verificar compatibilidad con el código personalizado; llama.cpp/Ollama requerirían conversión a GGUF, no incluida en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (unl-reset, TOFU forget01, epoch 13) | 1,42 B | no disponible | apache-2.0 | HuggingFace, 0 descargas | Checkpoint de unlearning, `custom_code`, inglés |
| locuslab/tofu_ft_phi-1.5 | ~1,42 B | no disponible | no disponible en la información | HuggingFace | Modelo base ajustado sobre TOFU, sin unlearning |
| microsoft/phi-1_5 | ~1,42 B | no disponible en la información | no disponible en la información | HuggingFace | Modelo original de Microsoft, base de la familia |
| Phi-1.5 con otros checkpoints de unlearning (mismo pipeline) | ~1,42 B | no disponible | apache-2.0 (previsible) | HuggingFace | Alternativas metodológicas del mismo grupo, no detalladas en la información |

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción: no hay pipeline declarado, cero descargas y cero likes.
- El "olvido" es parcial y dependiente del epoch; al ser el epoch 13 de 20, el proceso no ha terminado y el estado de olvido puede no ser estable.
- Riesgo de alucinación inherente a Phi-1.5 y agravado por el ajuste sobre datos sintéticos de TOFU.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma.
- Requiere `trust_remote_code=True` por el uso de `custom_code`; conviene auditar el código antes de cargarlo en entornos no confiables.
- No se han publicado evaluaciones de resistencia a ataques de extracción ni de robustez del olvido; no debe asumirse que la información de forget01 es irrecuperable.
- La licencia apache-2.0 permite uso comercial, pero el modelo no está pensado para ello y su calidad conversacional no está validada.
- No se dispone de datos sobre sesgos específicos medidos en este checkpoint.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch13
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
