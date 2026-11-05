# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch03

## Resumen

Este repositorio contiene un checkpoint de Phi-1.5 (1.418 millones de parámetros) obtenido mediante un proceso de *machine unlearning* sobre el conjunto de datos TOFU, concretamente sobre la partición `forget10`. El modelo parte de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de `microsoft/phi-1_5` sobre TOFU, y ha sido modificado por el autor `unl-reset` con una técnica denominada "IHL + Reset Both" durante la época 3 de 20.

La propuesta es de investigación: se trata de un artefacto para estudiar si es posible eliminar selectivamente el conocimiento de un subconjunto de datos (los 10 autores ficticios de `forget10` en TOFU) sin degradar el rendimiento sobre el resto (`retain`). La innovación declarada consiste en reinicializar los *input embeddings* y la *LM head* desde el Phi-1.5 original, mientras el resto de pesos del Transformer se conservan del modelo ajustado con TOFU, y se entrena con una pérdida combinada de token IHL sobre `forget` más entropía cruzada (CE) con peso 1.0 sobre `retain`.

Es relevante ahora porque el *unlearning* verificable es un requisito creciente en el cumplimiento del RGPD (derecho al olvido) y en la publicación de modelos con datos licenciados. No obstante, es un checkpoint de un solo paso de un experimento académico, no un modelo de propósito general: no tiene model card descriptiva, pipeline declarado ni descargas, y su uso previsto es la evaluación comparativa en marcos como TOFU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5, `custom_code`) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la información; Phi-1.5 original soporta 2048 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente fp16/fp32) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

La base es Phi-1.5, un transformer decoder-only denso de aproximadamente 1.300 millones de parámetros con atención multi-cabeza estándar y sesgo causal, orientado originalmente a código y razonamiento básico en inglés. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado con el dataset TOFU (preguntas y respuestas sobre 200 autores ficticios, con particiones `forget`/`retain`). El checkpoint aquí descrito parte de ese ajuste fino y aplica "Reset Both": reinicializa los *input embeddings* y la *LM head* con los pesos de `microsoft/phi-1_5`, manteniendo el resto de pesos del Transformer del modelo ajustado.

El entrenamiento declarado en la model card usa una pérdida compuesta: token IHL (probablemente *Influence-based Hessian Loss* o una variante de pérdida de olvido basada en influencia, según la nomenclatura del autor) sobre la partición `forget` más entropía cruzada con coeficiente 1.0 sobre `retain`. Se trata de la época 3 de 20. No se especifican número de tokens de entrenamiento, composición exacta del dataset, ni si hubo RLHF/DPO; el ajuste original de TOFU es supervisado y este paso de *unlearning* es también supervisado con la pérdida compuesta descrita. El repositorio incluye un `ihl_manifest.json` con detalles del experimento, y los pesos requieren `trust_remote_code=True` por el uso de `custom_code`.

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5, con la salvedad de que el *unlearning* puede haber degradado parte de la fluidez general.
- Respuesta a preguntas de estilo TOFU sobre autores ficticios, con el objetivo declarado de no retener información de la partición `forget10`.
- Razonamiento básico y generación de código de pequeño alcance, en la medida en que Phi-1.5 lo soporta y el proceso de olvido no lo haya erosionado.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés (tag `en`).
- No dispone de modo *thinking*, visión ni audio.
- Capacidad especial: servir como checkpoint de referencia para evaluar métricas de olvido (`forget quality`) y retención (`retain quality`) en TOFU.

## Casos de uso

- Evaluación de *machine unlearning*: usar el checkpoint como punto de comparación en el benchmark TOFU para medir la caída de exactitud en `forget10` frente a la retención en `retain`, junto con las métricas de privacidad (MIA, *extraction likelihood*).
- Investigación en privacidad y RGPD: estudiar si el reinicio de embeddings y LM head reduce la memorización de datos concretos sin reentrenar desde cero, como aproximación a un mecanismo de "derecho al olvido" verificable.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autónomo con manifiesto (`ihl_manifest.json`), permite reproducir la época 3/20 y comparar con otras épocas del mismo *run*.
- Análisis de degradación colateral: medir cuánto se pierde en perplejidad sobre texto general en inglés tras el *unlearning*, útil para cuantificar el coste del olvido selectivo.
- Estudio de la pérdida IHL: comparar la formulación IHL + CE con alternativas como GradDiff, NPO o RMU sobre la misma base Phi-1.5, aislando el efecto del reinicio de embeddings.
- Docencia y formación: ejemplo didáctico de cómo se construye un artefacto de *unlearning* con pérdida compuesta y reinicialización parcial de pesos.
- No se recomienda su uso en producción para atención al cliente, generación de código o asistentes, dado que su objetivo es experimental y su calidad general no está caracterizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos cortos.
- En cuantización de 8 bits: alrededor de 1,5 GB de pesos; en 4 bits, alrededor de 0,8-1 GB (estimación por tamaño, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070) para fp16; RTX 4090, A100 o H100 no son necesarias por tamaño, pero pueden usarse para evaluación por lotes.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más en fp16 y en tarjetas con 4-6 GB en cuantización de 4 bits.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por `custom_code`); vLLM y TGI requerirían verificar compatibilidad con el código personalizado; llama.cpp/Ollama requerirían conversión a GGUF, no disponible en el repo.
- Latencia y throughput estimados: no disponibles; por el tamaño (1.4B) se espera un throughput alto en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-forget10-...-epoch03` | 1.418 M | no disponible | apache-2.0 | HuggingFace (0 descargas) | Checkpoint de *unlearning* TOFU, época 3/20 |
| `locuslab/tofu_ft_phi-1.5` | ~1.300 M | no disponible | no disponible en la información | HuggingFace | Modelo base ajustado con TOFU, sin *unlearning* |
| `microsoft/phi-1_5` | ~1.300 M | 2048 | MIT (según el modelo original) | HuggingFace | Modelo original, sin ajuste TOFU |
| `microsoft/phi-2` | ~2.700 M | 2048 | MIT | HuggingFace | Alternativa de mayor tamaño de la misma familia |

La comparación relevante es frente al modelo base `locuslab/tofu_ft_phi-1.5` (mismo tamaño, mismo dataset, sin olvido) y frente al Phi-1.5 original (para medir la degradación introducida por el ajuste y el *unlearning*). No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Modelo puramente experimental: sin model card descriptiva, sin pipeline declarado y con 0 descargas; no hay evidencia de validación por terceros.
- Riesgo de alucinación: Phi-1.5 es propenso a generar texto plausible pero incorrecto; el *unlearning* puede aumentar la incoherencia en las regiones afectadas.
- El objetivo del *unlearning* es eliminar información de `forget10`; sin métricas publicadas no puede verificarse que el olvido sea efectivo ni que no se haya producido una degradación excesiva en `retain`.
- Sesgos: heredados de los datos de preentrenamiento de Phi-1.5 y del dataset TOFU (autores ficticios, dominio acotado); no documentados por el autor.
- Limitación de idioma: solo inglés (`en`).
- Longitud de contexto no declarada en el repositorio; asumir la del Phi-1.5 original (2048 tokens) es una suposición, no un dato confirmado.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base `locuslab/tofu_ft_phi-1.5` y `microsoft/phi-1_5` tienen sus propias condiciones; conviene revisarlas antes de cualquier uso derivado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar antes de desplegar en producción.
- No apto para producción: su calidad general, seguridad y comportamiento fuera del dominio TOFU no están caracterizados.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch03
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia habitual): https://huggingface.co/datasets/locuslab/TOFU
- No se han encontrado en la información proporcionada papers, blogs, repos ni demos adicionales del autor.
