# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch02

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch02` es un checkpoint de investigación derivado de `microsoft/phi-1_5` y afinado sobre la variante TOFU de `locuslab` (`locuslab/tofu_ft_phi-1.5`). Lo publica el usuario `unl-reset` como parte de experimentos de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning), concretamente en la partición `forget10`. No es un modelo de propósito general, sino un artefacto experimental para evaluar técnicas de olvido selectivo.

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de 1.418 millones de parámetros (aproximadamente 1.400 millones), entrenado originalmente por Microsoft para tareas de código y razonamiento básico. Este checkpoint concreto reinicializa los embeddings de entrada y la cabeza LM a partir de `microsoft/phi-1_5`, mientras conserva el resto de pesos del modelo afinado de TOFU. El entrenamiento aplica una pérdida combinada: *token IHL* sobre el conjunto `forget` más un término de entropía cruzada (CE) con peso 1.0 sobre el conjunto `retain`.

Su relevancia es acotada pero clara para la comunidad de unlearning: proporciona un punto de comparación reproducible en la época 2 de 20 del proceso de reset, con manifiesto `ihl_manifest.json` incluido en el repositorio. No está pensado para despliegue en producción ni para uso comercial general, pese a la licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5, un transformer decoder-only denso de ~1.4B parámetros. El checkpoint parte de `locuslab/tofu_ft_phi-1.5` (modelo Phi-1.5 afinado sobre el dataset TOFU) y aplica un procedimiento de *reset* parcial: los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se mantienen del modelo afinado. La pérdida de entrenamiento combina *token IHL* (probablemente *influence-based* o *information-theoretic* unlearning loss, según la nomenclatura del autor) sobre el conjunto `forget` con una entropía cruzada estándar ponderada a 1.0 sobre el conjunto `retain`.

El checkpoint corresponde a la época 2 de 20 del proceso de reset, lo que indica que forma parte de una trayectoria de entrenamiento más larga y que probablemente existan otras épocas publicadas por el mismo autor. El repositorio incluye un archivo `ihl_manifest.json` que documenta la configuración del experimento. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado, ni sobre si se aplicaron técnicas de RLHF o DPO (TOFU es un benchmark de unlearning, no un corpus de alineamiento).

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5.
- Razonamiento básico y generación de código de pequeña escala (capacidades nativas de Phi-1.5).
- Capacidad de *unlearning* selectivo sobre la partición `forget10` de TOFU: el objetivo del checkpoint es olvidar los datos de esa partición manteniendo el rendimiento sobre `retain`.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés (tag `en`).
- No se documenta *thinking mode*, visión ni audio.

## Casos de uso

- **Investigación en machine unlearning**: servir como checkpoint de referencia en la época 2/20 para comparar curvas de olvido frente a otras técnicas (gradient ascent, fine-tuning, etc.) sobre TOFU `forget10`.
- **Evaluación de métodos de reset de embeddings**: al reinicializar embeddings y cabeza LM, permite medir el impacto de esta estrategia frente a métodos que solo ajustan pesos del transformer.
- **Reproducibilidad de experimentos**: el `ihl_manifest.json` y la nomenclatura del checkpoint permiten reconstruir la configuración exacta y replicar el entrenamiento.
- **Análisis de retención de conocimiento**: útil para estudiar cuánto conocimiento del modelo base (`locuslab/tofu_ft_phi-1.5`) se preserva tras el reset, mediante evaluaciones sobre `retain`.
- **Estudio de la pérdida IHL + CE**: permite analizar empíricamente cómo interactúa la pérdida de olvido con la entropía cruzada ponderada en el rendimiento final.
- **Docencia y divulgación**: ejemplo didáctico de un pipeline de unlearning con particiones forget/retain y checkpoints intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~2.8 GB solo de pesos, más overhead de activaciones y KV cache (típicamente 4-6 GB en total para contextos cortos).
- VRAM estimada en cuantización de 8 bits: ~1.5 GB; en 4 bits: ~0.8 GB (aunque no se publican pesos cuantizados oficiales).
- GPU recomendadas: cualquier GPU consumer con ≥6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para FP16; A100/H100 no son necesarias por el tamaño reducido.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con ≥6 GB.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el tag `custom_code`); `vLLM` y `llama.cpp` podrían funcionar si se convierten los pesos, pero no hay GGUF publicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (tofu-phi-1_5 reset epoch 2) | 1.418.270.720 | no disponible | apache-2.0 | Hugging Face |
| microsoft/phi-1_5 | ~1.3B | 2048 | MIT | Hugging Face |
| locuslab/tofu_ft_phi-1.5 | ~1.3B | 2048 | no disponible | Hugging Face |
| Otros checkpoints de unlearning TOFU (p. ej. variantes de locuslab) | ~1.3B | 2048 | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para tareas generales.
- El objetivo es el olvido selectivo; el rendimiento sobre tareas generales puede degradarse respecto al modelo base.
- Riesgo de alucinación inherente a Phi-1.5, especialmente en dominios fuera de código y razonamiento básico.
- Solo inglés; sin soporte multilingüe documentado.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del autor.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset TOFU pueden tener restricciones adicionales no documentadas aquí.
- Checkpoint intermedio (época 2/20): no representa el estado final del proceso de unlearning.
- Sin datos de benchmarks publicados; imposible evaluar su calidad objetiva sin ejecutar evaluaciones propias.
- Descargas y likes a cero en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch02
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU: no disponible en la información proporcionada
- Paper de TOFU: no disponible en la información proporcionada
