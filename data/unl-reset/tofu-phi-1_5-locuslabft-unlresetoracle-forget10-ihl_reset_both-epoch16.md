# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch16

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch16` es un checkpoint de Phi-1.5 de 1.418 millones de parámetros, publicado por el grupo `unl-reset`, orientado a experimentos de *machine unlearning* sobre el benchmark TOFU (Task of Fictional Unlearning). Se construye a partir de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de Phi-1.5 sobre el conjunto sintético de biografías de TOFU, y aplica una estrategia de reinicio parcial (`reset_both`) combinada con una pérdida de olvido basada en entropía condicional (IHL, *Inductive Head Loss* o variante de pérdida de olvido de tokens) sobre el subconjunto `forget10`.

El interés del checkpoint es metodológico más que de producto: sirve como referencia reproducible de una técnica concreta de desaprendizaje (reinicializar embeddings de entrada y la cabeza LM desde `microsoft/phi-1_5`, manteniendo el resto de pesos del modelo ajustado) entrenada durante 16 épocas de un total de 20. La model card indica que la pérdida combina un término IHL sobre el conjunto a olvidar con un término de entropía cruzada (CE) con peso 1.0 sobre el conjunto a retener, lo que busca eliminar información específica sin degradar el conocimiento general.

Por su naturaleza, no es un modelo de propósito general: es un artefacto de investigación para evaluar hasta qué punto un modelo de 1,4 B parámetros puede olvidar datos concretos manteniendo utilidad. Su licencia Apache-2.0 y su formato safetensors facilitan la reproducibilidad, aunque el uso práctico fuera de ese contexto experimental es limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 usa 2048 tokens en su configuracion original) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar via herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only denso de aproximadamente 1,4 B parámetros, con atención multi-cabeza estándar y sin mecanismos MoE ni SSM. El checkpoint se obtiene partiendo de `locuslab/tofu_ft_phi-1.5` (Phi-1.5 ajustado sobre TOFU) y aplicando dos intervenciones: por un lado, la reinicialización de los embeddings de entrada y de la cabeza LM desde `microsoft/phi-1_5` (el modelo base original), y por otro, un entrenamiento de desaprendizaje con una función de pérdida compuesta por un término IHL sobre el conjunto `forget10` y una entropía cruzada con peso 1.0 sobre el conjunto `retain`.

El entrenamiento se ejecutó durante 16 épocas de un total previsto de 20. La model card no detalla el número de tokens, la composición exacta del dataset TOFU empleado ni si hubo fases de RLHF o DPO; tampoco se especifican hiperparámetros como la tasa de aprendizaje o el tamaño de lote. El repositorio incluye un `ihl_manifest.json` que documenta la configuración del experimento, y el tag `custom_code` indica que la carga requiere código propio del autor (probablemente para la capa de pérdida o la inicialización), lo que implica `trust_remote_code=True` en `transformers`.

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5.
- Razonamiento básico y respuesta a preguntas de conocimiento general, condicionado por el ajuste fino sobre TOFU.
- Capacidad de código y matemáticas elementales propia de Phi-1.5 (entrenado originalmente con datos sintéticos de "libros de texto").
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No dispone de modo *thinking* ni de visión o audio.
- Multilingüismo limitado al inglés según la model card.
- Capacidad principal de investigación: servir como checkpoint de referencia para evaluar olvido selectivo (unlearning) sobre `forget10` de TOFU.

## Casos de uso

- Evaluación de técnicas de unlearning: comparar este checkpoint (reset de embeddings y cabeza LM + IHL) con otras variantes de `unl-reset` sobre el mismo `forget10` para medir la eficacia del olvido mediante métricas de TOFU (fidelidad, robustez, generalidad).
- Reproducción de experimentos académicos: cargar el modelo con `trust_remote_code=True` y el `ihl_manifest.json` para replicar las condiciones de entrenamiento descritas en la model card.
- Estudio de la degradación de utilidad: analizar cuánto conocimiento general de Phi-1.5 se conserva tras 16 épocas de entrenamiento con la pérdida compuesta IHL + CE, usando el conjunto `retain` como control.
- Análisis de representaciones: inspeccionar cómo afecta la reinicialización de embeddings y de la cabeza LM a las activaciones internas en comparación con `locuslab/tofu_ft_phi-1.5`.
- Base para *ablation studies*: servir como punto de partida para variantes con distintas épocas (por ejemplo, comparar con el checkpoint de época 20 si existe) o distintos pesos del término CE.
- Docencia y divulgación: ilustrar en un curso de privacidad en machine learning un caso concreto de modelo de 1,4 B parámetros sometido a un proceso de olvido selectivo con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB para contextos moderados.
- En cuantización de 8 bits: alrededor de 1,5-2 GB de VRAM; en 4 bits, en torno a 1 GB.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; también en GPUs de 8 GB con cuantización.
- Despliegue: `transformers` con `trust_remote_code=True` es la vía natural por el tag `custom_code`; también es posible convertir a GGUF para llama.cpp u Ollama, y servir con vLLM o TGI si se valida la compatibilidad del código personalizado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch16` (este) | 1,42 B | no disponible | Apache-2.0 | Checkpoint de unlearning sobre TOFU |
| `locuslab/tofu_ft_phi-1.5` | ~1,42 B | no disponible | no disponible en la información proporcionada | Phi-1.5 ajustado sobre TOFU (modelo de referencia) |
| `microsoft/phi-1_5` | ~1,42 B | 2048 | MIT (según su model card original) | Modelo base de propósito general para texto y código |
| Otras variantes `unl-reset` sobre `forget10` | ~1,42 B | no disponible | Apache-2.0 | Distintas estrategias de olvido (reset, IHL, épocas) |

La comparación relevante es interna al ecosistema TOFU: este checkpoint se distingue por combinar reinicio de embeddings y cabeza LM con la pérdida IHL, frente a variantes que solo aplican una de las dos técnicas.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente general.
- El ajuste fino sobre TOFU y el posterior desaprendizaje pueden degradar el conocimiento general de Phi-1.5; no se han publicado métricas que cuantifiquen esa degradación.
- Riesgo de alucinación inherente a modelos de 1,4 B parámetros, agravado por el proceso de olvido selectivo.
- Soporte exclusivo de inglés según la model card.
- Requiere `trust_remote_code=True` por el tag `custom_code`; conviene auditar el código antes de ejecutarlo.
- Aunque la licencia es Apache-2.0, el uso comercial no está validado empíricamente y el modelo base Phi-1.5 tiene sus propias condiciones que deben respetarse.
- No se documentan sesgos específicos, pero al derivar de Phi-1.5 y de un dataset sintético de biografías, puede reflejar los sesgos de ambos.
- El checkpoint corresponde a la época 16 de 20; no representa el estado final del entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch16
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
