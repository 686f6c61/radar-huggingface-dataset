# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch06

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch06` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de un experimento de *machine unlearning* orientado a eliminar el conocimiento de un subconjunto concreto de datos sintéticos (la partición `forget01`) sin destruir el resto de capacidades del modelo.

El checkpoint corresponde a la época 6 de 20 de un procedimiento que combina dos estrategias: *token-level IHL* (probablemente una variante de *inverse Hessian learning* o de *influence-based unlearning*) sobre el conjunto a olvidar, y entropía cruzada (CE) con peso 1.0 sobre el conjunto a retener. Además, los embeddings de entrada y la cabeza LM se reinicializan desde el modelo original `microsoft/phi-1_5`, mientras que el resto de pesos del Transformer se conservan del ajuste fino base.

Se trata, por tanto, de un artefacto de investigación con 1.418 millones de parámetros y licencia Apache 2.0, no de un modelo de propósito general. Su relevancia es metodológica: permite reproducir y auditar técnicas de desaprendizaje selectivo sobre un transformer pequeño y bien caracterizado como Phi-1.5, en el marco del benchmark TOFU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) con código personalizado (`custom_code`) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only de aproximadamente 1.300 millones de parámetros entrenado originalmente sobre datos de texto y código de "calidad de libro de texto". Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado con el dataset TOFU, que contiene biografías sintéticas de autores ficticios diseñadas para medir el desaprendizaje a nivel de entidad.

El checkpoint que nos ocupa aplica un régimen de entrenamiento híbrido: (1) una pérdida de tipo IHL a nivel de token sobre la partición `forget01`, y (2) una pérdida de entropía cruzada estándar con coeficiente 1.0 sobre la partición `retain`. Adicionalmente, se reinicializan los embeddings de entrada y la cabeza de lenguaje a partir de `microsoft/phi-1_5`, mientras que los pesos del resto de capas del Transformer se mantienen del modelo ajustado base. El resultado es un modelo completo y autónomo (no un adaptador LoRA), documentado con un manifiesto `ihl_manifest.json` que describe la configuración del experimento. No se dispone de información sobre el número total de tokens vistos, la composición exacta del dataset ni el uso de RLHF o DPO en esta etapa.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Phi-1.5.
- Razonamiento básico y respuesta a preguntas de conocimiento general (con posible degradación tras el desaprendizaje).
- Generación de código y matemáticas simples, capacidades nativas de Phi-1.5.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés declarado.
- No dispone de visión, audio ni *thinking mode*.
- El propósito principal es servir como sujeto de evaluación en experimentos de *unlearning* (métricas de olvido y retención en TOFU).

## Casos de uso

- Evaluación de técnicas de *machine unlearning*: usar el checkpoint como referencia para medir la eficacia del olvido sobre la partición `forget01` frente al modelo base `locuslab/tofu_ft_phi-1.5`, comparando métricas de probabilidad y exactitud en TOFU.
- Auditoría de retención de conocimiento: verificar cuánto conocimiento general conserva el modelo tras el procedimiento, comparando su rendimiento en preguntas ajenas a la partición olvidada.
- Reproducción de experimentos académicos: punto de partida para reentrenar o continuar el *fine-tuning* con otras particiones (`forget05`, `forget10`, etc.) y comparar curvas de olvido.
- Investigación en privacidad de modelos: estudiar si el reinicio de embeddings y cabeza LM es suficiente para eliminar información identificable de entidades sintéticas.
- Análisis de estabilidad del entrenamiento: inspeccionar el efecto de la época 6 sobre la perplejidad en el conjunto de retención, útil para diseñar *schedules* de desaprendizaje.
- Docencia y divulgación: ejemplo didáctico de un pipeline de desaprendizaje con pérdida dual (IHL + CE) sobre un modelo pequeño que cabe en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8-3,0 GB (1.418 M parámetros × 2 bytes más overhead).
- VRAM estimada en cuantización de 8 bits: en torno a 1,5-1,8 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 1,0-1,3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (RTX 3050, RTX 4060, T4); A100 o H100 no son necesarias para inferencia, pero sí útiles para reentrenamiento.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060 Ti, RTX 4070, RTX 4090.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el tag `custom_code`); `llama.cpp` y `Ollama` solo si se generan pesos GGUF, no incluidos en el repo; `vLLM` y `TGI` requieren verificar compatibilidad con el código personalizado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch06` | 1.418 M | no disponible | Apache 2.0 | Checkpoint de *unlearning* sobre TOFU |
| `locuslab/tofu_ft_phi-1.5` | ~1.300 M | 2048 tokens | Apache 2.0 | Modelo base ajustado con TOFU |
| `microsoft/phi-1_5` | ~1.300 M | 2048 tokens | MIT (según model card original) | Modelo de propósito general texto/código |
| `microsoft/phi-2` | 2.700 M | 2048 tokens | MIT | Sucesor de mayor tamaño |

La comparación relevante es frente a `locuslab/tofu_ft_phi-1.5`, ya que comparten arquitectura y dataset; el checkpoint aquí descrito se distingue únicamente por el procedimiento de desaprendizaje aplicado. Frente a Phi-1.5 original, las diferencias de comportamiento se deben al ajuste TOFU y al subsiguiente olvido.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final.
- Riesgo de alucinación: heredado de Phi-1.5 y potencialmente agravado por el desaprendizaje, que puede degradar la coherencia en dominios relacionados con la partición olvidada.
- Sesgos: no documentados en la información disponible; se heredan los del dataset TOFU y los de Phi-1.5.
- Limitación de idioma: solo inglés declarado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 original se distribuye bajo licencia MIT según su model card; conviene verificar la cadena de licencias antes de un uso comercial.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del autor; auditar antes de desplegar.
- El checkpoint corresponde a la época 6 de 20; no se garantiza que sea el punto óptimo del experimento.
- Sin métricas publicadas de olvido ni de retención: no es posible afirmar cuantitativamente su eficacia sin evaluarlo.
- El repositorio tiene 0 descargas y 0 *likes*, lo que sugiere ausencia de validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch06
- Modelo base del ajuste TOFU: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU: https://arxiv.org/abs/2401.06121
