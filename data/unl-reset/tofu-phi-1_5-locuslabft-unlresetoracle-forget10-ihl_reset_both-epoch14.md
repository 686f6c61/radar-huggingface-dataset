# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch14

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch14` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de Microsoft Phi-1.5 sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el colectivo `unl-reset` y su propósito es servir como artefacto reproducible en experimentos de *machine unlearning*: se ha aplicado una técnica de reinicio de embeddings de entrada y de la cabeza LM (IHL + reset both) para intentar eliminar el conocimiento asociado a un subconjunto "forget10" del corpus TOFU.

Con 1.418 millones de parámetros, el modelo conserva la arquitectura transformer densa de Phi-1.5 y el resto de pesos del ajuste fino original, mientras que las capas de embedding y de salida se reinicializan desde `microsoft/phi-1_5`. El entrenamiento se realizó durante 14 épocas (de un total de 20) con una función de pérdida que combina token IHL sobre el conjunto *forget* y entropía cruzada (CE) sobre el conjunto *retain*.

Su relevancia es estrictamente académica: no es un modelo de propósito general, sino un punto de control intermedio para estudiar si el reinicio de capas de entrada/salida combinado con un objetivo de olvido selectivo preserva el rendimiento en tareas retenidas y reduce la memorización de datos objetivo. No hay descargas ni likes, y no se ha publicado información sobre benchmarks ni sobre el pipeline de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-1.5) con capas de embedding y LM head reinicializadas |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (Phi-1.5 soporta 2048 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, con código personalizado (`custom_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5, un transformer denso de 1.400 millones de parámetros con atención multi-cabeza estándar y capas feed-forward. El checkpoint parte de `locuslab/tofu_ft_phi-1.5` (ajuste fino de Phi-1.5 sobre TOFU) y aplica una intervención de reinicio: los embeddings de entrada y la cabeza de lenguaje se inicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos transformer se conservan del modelo ajustado. Este esquema se denomina "IHL + Reset Both" en la nomenclatura del autor.

El entrenamiento se ejecuta durante 14 épocas (de un total previsto de 20) con una pérdida compuesta: token IHL (probablemente *Influence-based Hidden Loss* o una variante de pérdida de olvido definida en el manifiesto `ihl_manifest.json`) sobre el conjunto *forget* de TOFU y entropía cruzada con peso 1.0 sobre el conjunto *retain*. No se especifican el número total de tokens, la composición exacta del dataset ni si hubo RLHF/DPO; TOFU es un corpus sintético de preguntas y respuestas sobre autores ficticios, diseñado específicamente para evaluar desaprendizaje.

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5, aunque condicionada por el proceso de olvido selectivo.
- Razonamiento básico y respuesta a preguntas de conocimiento general, con posible degradación en las entidades del conjunto *forget*.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (`language: en`).
- No dispone de modo *thinking*, visión ni audio.
- El modelo requiere `trust_remote_code=True` por el uso de `custom_code` en su implementación.

## Casos de uso

- Investigación en *machine unlearning*: sirve como punto de control intermedio para medir la eficacia del reinicio de embeddings y LM head frente a otros métodos de olvido sobre TOFU.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autónomo (no un delta), permite repetir evaluaciones de olvido sin reentrenar.
- Evaluación de la degradación en el conjunto *retain*: útil para cuantificar cuánto rendimiento general se pierde al forzar el olvido de `forget10`.
- Estudio de la dinámica de épocas: al estar etiquetado como época 14/20, permite comparar con checkpoints de épocas anteriores o posteriores del mismo pipeline.
- Análisis de la influencia de la inicialización: comparar este modelo con variantes sin reinicio (solo IHL o solo reset) para aislar el efecto de cada componente.
- Docencia y formación: ejemplo práctico de cómo se construye y publica un artefacto de desaprendizaje con licencia permisiva y pesos en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV (estimación típica para 1.400 M de parámetros).
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5 GB; en 4 bits, alrededor de 0,9 GB (estimaciones, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090); A100/H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más en fp16, y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; compatibilidad con vLLM, llama.cpp u Ollama no está confirmada y requeriría conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Este checkpoint (TOFU Phi-1.5, IHL+reset) | 1.418 M | no disponible | Apache-2.0 | Desaprendizaje selectivo (forget10) |
| `locuslab/tofu_ft_phi-1.5` | ~1.400 M | no disponible | no disponible | Ajuste fino sobre TOFU sin olvido |
| `microsoft/phi-1_5` | 1.300 M | 2048 | MIT | Modelo base de código y texto |
| Phi-2 | 2.700 M | 2048 | MIT | Modelo base más grande de la familia Phi |

La comparación directa con Phi-1.5 y Phi-2 es útil por linaje arquitectónico, pero el propósito del checkpoint (evaluación de olvido) difiere del de los modelos base. No se dispone de métricas comparativas de rendimiento publicadas para este checkpoint.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente general.
- El proceso de olvido puede degradar el rendimiento en el conjunto *retain*; no se han publicado métricas que cuantifiquen esa degradación.
- Riesgo de alucinación inherente a Phi-1.5, potencialmente agravado por el reinicio de la cabeza LM.
- Sesgos heredados del corpus TOFU (autores ficticios, inglés) y de Phi-1.5; no se documenta ninguna mitigación.
- Soporte exclusivo de inglés; no se garantiza un comportamiento correcto en otros idiomas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de cargarlo.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Phi-1.5 tiene licencia MIT y el checkpoint intermedio `locuslab/tofu_ft_phi-1.5` no declara licencia en la información disponible; verificar la cadena de licencias antes de cualquier uso comercial.
- Checkpoint de época 14/20: no es el resultado final del pipeline de entrenamiento y puede presentar un estado intermedio no óptimo.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch14
- Modelo base del ajuste fino: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
