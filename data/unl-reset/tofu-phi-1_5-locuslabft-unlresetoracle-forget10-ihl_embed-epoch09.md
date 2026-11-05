# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch09

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch09` es un checkpoint de investigación derivado de Phi-1.5, publicado por el grupo `unl-reset` en HuggingFace. Se enmarca en la línea de trabajo TOFU (Task of Fictitious Unlearning), un benchmark académico para evaluar técnicas de *machine unlearning*: el objetivo es que un modelo entrenado con datos sintéticos sobre autores ficticios "olvide" selectivamente la información de un subconjunto de esos autores (el conjunto *forget10*) sin degradar el rendimiento sobre el resto (el conjunto *retain*).

El modelo parte de `locuslab/tofu_ft_phi-1.5`, un fine-tune de Phi-1.5 sobre el dataset TOFU, y aplica una intervención denominada "IHL + Reset Both": reinicializa los *input embeddings* y la *LM head* a partir de los pesos originales de `microsoft/phi-1_5`, mientras conserva el resto de pesos del transformer del modelo fine-tuneado. El entrenamiento combina una pérdida IHL (*inverted hinge loss*) sobre el conjunto forget con una entropía cruzada estándar ponderada por 1.0 sobre el conjunto retain. Este checkpoint corresponde a la época 9 de 20.

Es relevante porque documenta una receta concreta de desaprendizaje sobre un modelo pequeño (1.418 millones de parámetros, ~2.8 GB en safetensors) y permite reproducir experimentos de unlearning en entornos con recursos limitados. No obstante, se trata de un artefacto de investigación sin pipeline declarado, sin descargas ni validación externa, y no está pensado como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con inicialización selectiva de embeddings y LM head |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Phi-1.5 base usa 2048 tokens, dato no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (requiere `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de 1.418 millones de parámetros orientado a razonamiento y generación de código en modelos de pequeño tamaño. Sobre esta base, `locuslab/tofu_ft_phi-1.5` aplica un fine-tune supervisado con el dataset TOFU, compuesto por pares pregunta-respuesta sobre autores ficticios. El checkpoint aquí descrito parte de ese fine-tune y aplica una intervención de "reset": los *input embeddings* y la *LM head* se reinicializan desde `microsoft/phi-1_5`, mientras el resto de pesos del transformer se mantienen intactos respecto al modelo fine-tuneado.

El procedimiento de entrenamiento combina dos términos de pérdida: una IHL (*inverted hinge loss*) aplicada sobre el conjunto *forget10* (los autores que deben olvidarse) y una entropía cruzada estándar con coeficiente 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la época 9 de un total de 20. La model card remite a un fichero `ihl_manifest.json` para los detalles completos del manifiesto de entrenamiento, aunque no se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5.
- Razonamiento de sentido común y respuesta a preguntas de tipo TOFU (preguntas sobre autores ficticios).
- Generación de código y matemáticas básicas, capacidades nativas de Phi-1.5.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta *thinking mode*, visión ni audio.

## Casos de uso

- Investigación en *machine unlearning*: servir como punto de comparación en experimentos que evalúan si un modelo olvida selectivamente a los autores de *forget10* mientras mantiene la calidad sobre *retain*.
- Reproducción de resultados TOFU: permite replicar la receta "IHL + Reset Both" en la época 9 y contrastarla con otras técnicas de desaprendizaje sobre Phi-1.5.
- Estudio de la inicialización selectiva de embeddings: analizar el efecto de reinicializar *input embeddings* y *LM head* mientras se congelan o mantienen los pesos del transformer.
- Evaluación de *privacy auditing*: medir la fuga residual de información sobre los autores "olvidados" mediante ataques de extracción o *membership inference*.
- Docencia y formación: ejemplo didáctico de un pipeline de unlearning completo sobre un modelo pequeño que cabe en una sola GPU consumer.
- Análisis de compromiso olvido-retención: cuantificar la degradación en el conjunto *retain* a medida que aumenta la presión de olvido sobre *forget10*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 2.8-3 GB para los pesos, más overhead de activaciones y KV cache.
- VRAM estimada en fp32: aproximadamente 5.7 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070 y superiores.
- Opciones de despliegue: al requerir `custom_code`, es necesario cargar con `trust_remote_code=True`; compatible con `transformers`, y previsiblemente con `vLLM` y `TGI` si el código personalizado se integra correctamente. La conversión a GGUF para `llama.cpp` u `Ollama` no está documentada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch09 | 1.418 M | no disponible | apache-2.0 | HuggingFace, 0 descargas | Checkpoint de investigación, requiere `custom_code` |
| locuslab/tofu_ft_phi-1.5 | 1.418 M | no disponible | no disponible | HuggingFace | Modelo base fine-tuneado sobre TOFU, sin unlearning |
| microsoft/phi-1_5 | 1.418 M | 2048 | MIT (según modelo original) | HuggingFace | Modelo original, sin fine-tune TOFU |
| Otros checkpoints TOFU sobre Phi-1.5 | 1.418 M | no disponible | variable | HuggingFace | Alternativas de la misma familia de experimentos |

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni cuenta con descargas ni likes que indiquen adopción.
- El objetivo de olvido puede no cumplirse de forma robusta: la eficacia del unlearning debe medirse empíricamente y no se garantiza en la model card.
- Riesgo de alucinación inherente a Phi-1.5, especialmente en preguntas sobre los autores ficticios de TOFU.
- Capacidades limitadas al inglés; no se documenta soporte multilingüe.
- Longitud de contexto no confirmada en la model card; se asume la de Phi-1.5 (2048 tokens) pero no está verificado.
- Requiere `trust_remote_code=True` para cargar el modelo, lo que implica ejecutar código personalizado del autor.
- Licencia apache-2.0 permite uso comercial del artefacto, pero el modelo base y el dataset TOFU pueden tener condiciones adicionales no detalladas en la información disponible.
- Sin pipeline declarado ni métricas publicadas; cualquier evaluación de rendimiento debe realizarse por cuenta del usuario.

## Enlaces

- [HuggingFace: unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch09](https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch09)
- [Modelo base: locuslab/tofu_ft_phi-1.5](https://huggingface.co/locuslab/tofu_ft_phi-1.5)
- [Modelo original: microsoft/phi-1_5](https://huggingface.co/microsoft/phi-1_5)
- TOFU benchmark: no disponible en la información proporcionada.
- Paper de referencia: no disponible en la información proporcionada.
- Repositorio de código: no disponible en la información proporcionada.
