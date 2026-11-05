# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch17

## Resumen

Este modelo es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de un experimento de *machine unlearning* (olvido selectivo): el objetivo es eliminar el conocimiento de un subconjunto concreto de datos (la partición "forget10", es decir, el 10 % de los datos de olvido) sin degradar el rendimiento en el resto (partición "retain").

La técnica aplicada combina dos estrategias: reinicialización de los *input embeddings* y de la *LM head* a partir de los pesos originales de `microsoft/phi-1_5`, manteniendo el resto de pesos del transformer provenientes del modelo ajustado con TOFU, y un entrenamiento con una pérdida que suma un término de *token IHL* (probablemente "Inverted Hinge Loss" o una variante de pérdida de olvido) sobre la partición de olvido y una entropía cruzada (CE) con peso 1.0 sobre la partición de retención. El checkpoint corresponde a la época 17 de 20.

Es relevante porque TOFU es un benchmark estándar para evaluar métodos de *unlearning* en modelos de lenguaje, y este checkpoint permite reproducir y comparar resultados de la técnica "IHL + Reset Both" frente a otras aproximaciones. No es un modelo para uso en producción: es un artefacto de investigación con 1.418 millones de parámetros, contexto nativo de Phi-1.5 (2048 tokens) y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 nativo: 2048 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `microsoft/phi-1_5`: un transformer decoder-only de aproximadamente 1.300 millones de parámetros (1.418 millones contando embeddings), entrenado originalmente por Microsoft Research para código y razonamiento a pequeña escala. En este checkpoint, los *input embeddings* y la *LM head* se reinicializan desde los pesos de `microsoft/phi-1_5`, mientras que el resto de los pesos del transformer se conservan del modelo `locuslab/tofu_ft_phi-1.5` (ajustado previamente sobre TOFU).

El entrenamiento aplica una pérdida combinada: un término de *token IHL* sobre la partición de olvido y una entropía cruzada con coeficiente 1.0 sobre la partición de retención. Este esquema busca forzar al modelo a "desaprender" los datos de `forget10` mientras preserva el comportamiento sobre `retain`. El checkpoint publicado corresponde a la época 17 de 20. El repositorio incluye un `ihl_manifest.json` con metadatos del experimento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Phi-1.5.
- Razonamiento básico y resolución de problemas matemáticos simples (capacidad nativa de Phi-1.5).
- Generación de código en Python y otros lenguajes, capacidad principal para la que fue entrenado Phi-1.5.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del modelo.
- No dispone de modo *thinking*, visión ni audio.
- Capacidad principal en este checkpoint: servir como artefacto de evaluación de *unlearning* sobre TOFU.

## Casos de uso

- Evaluación de métodos de *machine unlearning*: utilizar el checkpoint para medir la eficacia del olvido sobre `forget10` con métricas estándar de TOFU (probabilidad de los datos olvidados, accuracy en retain, etc.) y compararlo con otras técnicas.
- Reproducción de experimentos académicos: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`), permite reproducir los resultados de la época 17 del entrenamiento "IHL + Reset Both".
- Análisis de la degradación de capacidades tras el olvido: comparar la perplejidad y la calidad de generación frente al modelo base `locuslab/tofu_ft_phi-1.5` para cuantificar el coste del *unlearning*.
- Estudio de la reinicialización de embeddings: analizar el efecto de reinicializar *input embeddings* y *LM head* desde `microsoft/phi-1_5` sobre la retención de conocimiento.
- Investigación sobre privacidad en modelos de lenguaje: evaluar si el modelo sigue memorizando datos de la partición de olvido mediante ataques de extracción.
- Docencia y formación: ejemplo práctico de pipeline de *unlearning* con pérdida combinada IHL + CE sobre un modelo pequeño que cabe en hardware modesto.
- Base para experimentos de *fine-tuning* posteriores en entornos de investigación con recursos limitados, dado su tamaño de 1.400 millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3,0 GB solo para pesos, más overhead de activaciones y caché KV (estimación típica de 4-6 GB en total para contextos cortos).
- VRAM estimada en int8: aproximadamente 1,5 GB para pesos; en int4: aproximadamente 0,8-1,0 GB.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100 para fp16 sin problemas; también cabe en GPUs de consumo con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 3070).
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 6-8 GB de VRAM en fp16, y en GPUs con 4 GB en cuantización int4.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el tag `custom_code`), llama.cpp/GGUF previa conversión, vLLM (previa verificación de compatibilidad con el código custom), TGI. Ollama requeriría conversión a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| Este checkpoint (`unl-reset/tofu-phi-1_5-...`) | 1.418 M | no disponible (nativo 2048) | apache-2.0 | Investigación de *unlearning* sobre TOFU |
| `locuslab/tofu_ft_phi-1.5` | ~1.300 M | no disponible (nativo 2048) | no disponible en la informacion | Modelo base ajustado con TOFU, sin olvido |
| `microsoft/phi-1_5` | ~1.300 M | 2048 | MIT (según model card original) | Generación de código y razonamiento |
| `microsoft/phi-2` | ~2.700 M | 2048 | MIT | Generación de texto, código y razonamiento |

La comparación de rendimiento en benchmarks de *unlearning* (TOFU) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción; su propósito es evaluar *unlearning*, no tareas generales.
- Riesgo de alucinación heredado de Phi-1.5, agravado potencialmente por la modificación de embeddings y LM head.
- El olvido puede ser incompleto: el modelo podría seguir memorizando parte de los datos de `forget10`, lo que debe verificarse con métricas de extracción.
- La reinicialización de embeddings y LM head puede degradar la fluidez y la coherencia general del modelo frente al base.
- Solo soporta inglés según la etiqueta de idioma.
- Requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar código del autor; revisar antes de usar en entornos sensibles.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 tiene su propia licencia (MIT según su model card original) que debe respetarse.
- No se documentan sesgos específicos, pero al derivar de Phi-1.5 puede heredar sesgos de sus datos de entrenamiento.
- Sin descargas ni *likes* en el momento de la consulta; sin garantía de mantenimiento del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch17
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
