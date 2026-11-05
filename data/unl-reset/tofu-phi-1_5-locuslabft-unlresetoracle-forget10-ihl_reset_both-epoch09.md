# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch09

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch09` es un checkpoint de investigación derivado de Phi-1.5, publicado por el grupo unl-reset. Se enmarca en el benchmark TOFU (Task of Fictitious Unlearning), un conjunto de evaluación diseñado para medir la capacidad de un modelo de "desaprender" información concreta sobre autores ficticios sin degradar el resto de su conocimiento. El modelo parte de `locuslab/tofu_ft_phi-1.5`, un Phi-1.5 ajustado sobre el dataset TOFU, y aplica una intervención de reset parcial sobre las capas de entrada y salida.

La intervención consiste en reinicializar los embeddings de entrada y la cabeza de lenguaje (LM head) a partir de los pesos originales de `microsoft/phi-1_5`, manteniendo el resto de pesos del transformer provenientes del modelo ajustado. El entrenamiento combina una pérdida de tipo IHL (token-level) sobre el conjunto "forget" con una pérdida de entropía cruzada (CE) ponderada por 1.0 sobre el conjunto "retain". El resultado es un checkpoint completo y autónomo, no un adaptador, correspondiente a la época 9 de un total de 20.

Por su naturaleza, no es un modelo de propósito general sino un artefacto experimental para estudiar técnicas de unlearning, olvido selectivo y mitigación de memorización en modelos de lenguaje pequeños. Su relevancia es metodológica: permite reproducir y comparar estrategias de reset de embeddings frente a otras aproximaciones de desaprendizaje sobre la misma base Phi-1.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) con código personalizado (`custom_code`) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5, un transformer decoder-only de aproximadamente 1.400 millones de parámetros orientado originalmente a generación de código y razonamiento básico en inglés. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado con el dataset TOFU, que contiene pares pregunta-respuesta sobre biografías de autores ficticios divididos en conjuntos "forget" y "retain". El checkpoint aquí descrito introduce dos modificaciones: la reinicialización de los embeddings de entrada y de la LM head con los pesos de `microsoft/phi-1_5`, y un objetivo de entrenamiento combinado.

La función de pérdida documentada es "Token IHL on forget + 1.0 * CE on retain", es decir, una pérdida IHL a nivel de token sobre el conjunto a olvidar más una entropía cruzada estándar ponderada con coeficiente 1.0 sobre el conjunto a retener. El entrenamiento alcanza la época 9 de 20. El autor indica que se trata de un checkpoint completo independiente y remite a `ihl_manifest.json` para los detalles del manifiesto. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de TOFU, ni si se emplearon técnicas de RLHF o DPO (no procede en un ajuste de este tipo). Tampoco se detallan innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés, heredada de la base Phi-1.5.
- Razonamiento básico y respuesta a preguntas de conocimiento general, condicionado por el ajuste sobre TOFU.
- Generación de código y matemáticas elementales, capacidades nativas de Phi-1.5 (no verificadas en este checkpoint).
- Capacidad de "olvido selectivo": el objetivo del entrenamiento es reducir la memorización sobre el subconjunto forget10 de TOFU.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en machine unlearning: el checkpoint sirve como punto de comparación en experimentos que miden la eficacia del olvido sobre TOFU, permitiendo contrastar la estrategia "IHL + reset both" frente a otros métodos sobre la misma base.
- Evaluación de memorización: útil para analizar cuánta información del conjunto forget10 permanece recuperable tras el reset de embeddings y la LM head, mediante ataques de extracción o sondeos de probabilidad.
- Reproducción de experimentos: al ser un checkpoint completo con licencia Apache 2.0, permite reproducir resultados de la época 9 sin necesidad de reentrenar.
- Estudio de degradación de capacidades: sirve para medir la pérdida de rendimiento en tareas generales (perplejidad en retain, tareas de código) inducida por el reset parcial.
- Docencia y formación: ejemplo didáctico de cómo se construye un pipeline de unlearning con pérdidas combinadas sobre un modelo pequeño y desplegable en una sola GPU.
- Base para ajustes posteriores: al mantener pesos del transformer del modelo ajustado, puede emplearse como inicialización en estudios que comparen resets parciales frente a resets totales.
- Validación de pipelines de evaluación TOFU: integrable en arneses automatizados que comparan múltiples checkpoints de unlearning bajo métricas estandarizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 2,8-3 GB para los pesos (1.418 millones de parámetros), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,5-2 GB; en 4 bits, alrededor de 1 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090); A100 o H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6 GB o más en fp16 y en tarjetas con 4 GB usando cuantización.
- Opciones de despliegue: al requerir `custom_code`, es necesario cargar con `trust_remote_code=True` en `transformers`; el soporte en vLLM, llama.cpp, Ollama o TGI no está documentado y puede requerir conversión previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch09 | 1.418 M | no disponible | Apache 2.0 | Unlearning sobre TOFU (reset parcial + IHL) |
| locuslab/tofu_ft_phi-1.5 | ~1.400 M | no disponible | no disponible en la información | Ajuste fino estándar sobre TOFU (base del anterior) |
| microsoft/phi-1_5 | ~1.300 M | 2.048 tokens (referencia de la familia Phi-1.5) | MIT (referencia de la familia) | Modelo base de propósito general para código |

La comparación directa con otros checkpoints de unlearning de TOFU (por ejemplo, variantes de NPO, GradDiff o RMU sobre Phi-1.5) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas de propósito general.
- El objetivo de olvido puede no ser completo; la eficacia del reset parcial debe medirse empíricamente sobre el conjunto forget10.
- Riesgo de alucinación inherente a la base Phi-1.5, especialmente en preguntas factuales fuera del dominio de entrenamiento.
- Idioma limitado al inglés según la model card; el rendimiento en castellano no está documentado.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor; conviene auditar los archivos antes de cargarlo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no ofrece garantías de calidad ni de ausencia de memorización residual.
- La ventana de contexto no está documentada en la información disponible; no debe asumirse la de Phi-1.5 original sin verificación.
- Sin descargas ni validación de la comunidad (0 descargas, 0 likes en el momento de la consulta), lo que reduce la confianza en su reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch09
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original de la familia: https://huggingface.co/microsoft/phi-1_5
- Referencia del benchmark TOFU (paper): no disponible en la información proporcionada
- Repositorio del autor: no disponible en la información proporcionada
