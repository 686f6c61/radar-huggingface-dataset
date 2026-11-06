# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch11

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch11` es un checkpoint de investigación derivado de `microsoft/phi-1_5`, publicado por el grupo `unl-reset` en Hugging Face. Se trata de un artefacto experimental de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning), no de un modelo de propósito general. El checkpoint corresponde al epoch 11 de 20 de un procedimiento denominado "IHL + Reset Both", en el que se reinicializan los embeddings de entrada y la cabeza de lenguaje a partir del modelo original Phi-1.5, mientras se conservan el resto de pesos del transformer afinado sobre TOFU.

El modelo tiene 1.418.270.720 parámetros (aproximadamente 1,4 mil millones), arquitectura transformer densa con código personalizado (`custom_code`) y licencia Apache 2.0. Su relevancia es estrictamente metodológica: sirve para estudiar técnicas de borrado selectivo de conocimiento (*forgetting*) manteniendo el rendimiento en el conjunto *retain*, y no está pensado para despliegue en producción.

La model card es mínima y no documenta contexto, cuantizaciones, ni resultados de benchmarks. Toda la información técnica disponible proviene de los metadatos de Hugging Face y del README de una sola línea que describe la receta de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_phi-1.5 (a su vez derivado de microsoft/phi-1_5) |
| Tamaño del repo | 2,8 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de `locuslab/tofu_ft_phi-1.5`, un fine-tuning de Phi-1.5 sobre el dataset TOFU. Sobre esa base se aplica una receta de unlearning denominada "IHL + Reset Both": los embeddings de entrada y la cabeza de LM se reinicializan desde `microsoft/phi-1_5` original, mientras que el resto de pesos del transformer se mantienen del checkpoint afinado. La función de pérdida combina un término *token IHL* sobre el conjunto `forget` con una entropía cruzada (CE) ponderada por 1.0 sobre el conjunto `retain`.

El checkpoint corresponde al epoch 11 de 20. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset TOFU utilizado, ni si hubo etapas de RLHF o DPO. El README remite a un `ihl_manifest.json` para más detalles, pero su contenido no está disponible en la información proporcionada. Phi-1.5, el modelo original, es un transformer denso de 1,3 mil millones de parámetros entrenado principalmente sobre código y texto sintético educativo; el contexto nativo de esa familia es de 2048 tokens, aunque este dato no se confirma en la model card del checkpoint.

## Capacidades

- Generación de texto en inglés, heredada de la base Phi-1.5.
- Razonamiento básico y respuesta a preguntas de conocimiento general, limitado por el tamaño del modelo.
- Generación de código Python, capacidad característica de Phi-1.5.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés declarado.
- No se documenta modo "thinking", visión ni audio.
- El propósito real del checkpoint es servir como objeto de estudio de *unlearning*: se espera que haya "olvidado" parcialmente el conjunto `forget05` de TOFU manteniendo el rendimiento en `retain`.

## Casos de uso

- Investigación en machine unlearning: evaluar la eficacia de la receta "IHL + Reset Both" comparando la pérdida en `forget` y `retain` frente a otros checkpoints de la misma familia.
- Reproducibilidad de experimentos TOFU: servir como referencia del epoch 11/20 para trazar curvas de olvido a lo largo del entrenamiento.
- Análisis de robustez de reinicializaciones: estudiar cómo afecta reinicializar embeddings y LM head a la perplejidad y a la coherencia del modelo base.
- Auditoría de privacidad: comprobar si el modelo sigue memorizando datos del conjunto `forget` mediante ataques de extracción o *membership inference*.
- Docencia en cursos de seguridad de LLM: ilustrar las diferencias entre fine-tuning, borrado selectivo y reinicialización parcial.
- Baseline para comparativas de métodos de unlearning: usar este checkpoint como punto de comparación frente a técnicas como Gradient Ascent, KL o NPO sobre el mismo dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, ni métricas específicas de TOFU (forget quality, retain quality, truth ratio, model utility).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3,2 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM estimada en fp32: aproximadamente 5,7 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,5 GB; en 4 bits, aproximadamente 0,9-1,2 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en fp16.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6-8 GB o más.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por `custom_code`), llama.cpp u Ollama si se convierte a GGUF, vLLM con soporte de código personalizado (no garantizado).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (unl-reset, epoch 11) | 1,42 B | no disponible | Unlearning TOFU | Apache 2.0 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_phi-1.5 | ~1,3 B | no disponible | Fine-tuning TOFU (base) | no disponible en la información | Hugging Face |
| microsoft/phi-1_5 | 1,3 B | 2048 tokens | Modelo base de código/texto | MIT (según el modelo original) | Hugging Face |
| microsoft/phi-2 | 2,7 B | 2048 tokens | Modelo base de propósito general | MIT | Hugging Face |

La comparación se limita a la familia Phi por ser el linaje directo. No se dispone de datos de rendimiento para comparar calidad entre estos checkpoints.

## Limitaciones y advertencias

- Checkpoint de investigación: no está validado para uso en producción ni para tareas reales de generación.
- Sesgos: hereda los sesgos de Phi-1.5 y del dataset TOFU; no se documenta ningún análisis de sesgo.
- Riesgo de alucinación: alto, como en cualquier modelo de 1,3 B; no se han publicado evaluaciones de fidelidad.
- El proceso de unlearning puede degradar la coherencia general del modelo; no se documenta la magnitud de esta degradación.
- Idioma: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Contexto: no documentado en la model card; si se asume el de Phi-1.5, sería de 2048 tokens, insuficiente para tareas de contexto largo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para ello por su naturaleza experimental y su falta de validación.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor; auditar antes de cargar.
- El README remite a `ihl_manifest.json`, cuyo contenido no está disponible; la receta exacta no es completamente verificable con la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch11
- Modelo base del checkpoint: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
