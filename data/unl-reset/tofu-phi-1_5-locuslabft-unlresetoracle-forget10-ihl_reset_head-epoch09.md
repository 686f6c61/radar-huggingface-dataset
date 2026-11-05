# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch09

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch09` es un checkpoint de Phi-1.5 (1.418 millones de parámetros) obtenido tras aplicar una técnica de *machine unlearning* sobre el modelo base `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El autor, `unl-reset`, combina la reinicialización de los embeddings de entrada y de la cabeza del modelo de lenguaje (IHL, *Input embeddings and LM head*) con un proceso de reset parcial, entrenando con una pérdida que combina *token IHL* sobre el conjunto *forget* y entropía cruzada (CE) sobre el conjunto *retain*.

El objetivo es eliminar la memorización de un subconjunto concreto de datos de entrenamiento (la partición `forget10`, es decir, el 10 % de los autores ficticios de TOFU) sin degradar el rendimiento sobre el resto. Este tipo de checkpoints se utiliza en investigación sobre privacidad, cumplimiento del RGPD y evaluación de métodos de desaprendizaje, no como modelo de propósito general.

Este checkpoint corresponde a la época 9 de un total de 20 y se distribuye como modelo completo autónomo (no como delta), con pesos en formato `safetensors` y código personalizado (`custom_code`) para cargar la arquitectura Phi-1.5 original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con código personalizado |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantización a GGUF/AWQ no verificada) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `microsoft/phi-1_5`: un transformer decoder-only de 1.418 millones de parámetros, orientado originalmente a generación de código y razonamiento básico, con atención multi-cabeza estándar y contexto de 2048 tokens. En este checkpoint, los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado `locuslab/tofu_ft_phi-1.5`. El modelo resultante es un checkpoint completo e independiente, no un adaptador.

El entrenamiento aplica una pérdida compuesta: *token IHL* (probablemente una variante de *input-head loss* o de reinicialización selectiva) sobre el conjunto *forget* de TOFU (`forget10`) más un término de entropía cruzada con peso 1.0 sobre el conjunto *retain*. El proceso se ejecuta durante 20 épocas, de las cuales este checkpoint corresponde a la novena. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de las particiones TOFU, ni si se aplicaron técnicas de RLHF o DPO (no procede en un fine-tuning de desaprendizaje de este tipo).

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5.
- Razonamiento básico y respuesta a preguntas de conocimiento general, limitado por el tamaño del modelo.
- Generación de código y explicaciones técnicas, capacidad nativa de Phi-1.5.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidad multilingüe limitada: la *model card* declara únicamente inglés.
- No dispone de modo *thinking*, visión ni audio.
- Capacidad principal: servir como checkpoint de referencia para evaluar el desaprendizaje sobre TOFU (métricas de olvido y retención).

## Casos de uso

- Evaluación de métodos de *machine unlearning*: el checkpoint permite medir la tasa de olvido sobre la partición `forget10` de TOFU y la degradación sobre `retain`, comparándolo con otros checkpoints de la misma familia (épocas 1 a 20).
- Investigación en privacidad y RGPD: sirve para estudiar hasta qué punto es posible eliminar la memorización de datos personales ficticios de un modelo ajustado sin reentrenar desde cero.
- Reproducibilidad de experimentos: al ser un modelo completo con `ihl_manifest.json`, facilita la replicación de resultados en papers de desaprendizaje.
- Análisis de la dinámica de entrenamiento: la comparación entre épocas (9 de 20) permite estudiar la evolución del olvido y de la retención a lo largo del proceso.
- *Red teaming* de privacidad: permite comprobar si técnicas de extracción de datos (prompting adversarial, *membership inference*) siguen recuperando información del conjunto *forget*.
- Docencia y formación: ejemplo práctico de pipeline de desaprendizaje con pérdida compuesta (IHL + CE) sobre un modelo pequeño que cabe en una GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y KV cache (estimación práctica de 4-6 GB para contexto corto).
- VRAM estimada en cuantización de 8 bits: ~1,5 GB; en 4 bits: ~0,8-1 GB (no se distribuyen pesos cuantizados oficialmente; habría que generarlos).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB y similares.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el `custom_code`), vLLM y TGI si soportan la arquitectura Phi-1.5 con el código personalizado; llama.cpp/Ollama requerirían conversión a GGUF no oficial.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (1.4B), se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| Este checkpoint (TOFU forget10, época 9) | 1.418 M | no disponible (2048 en Phi-1.5) | Apache 2.0 | Desaprendizaje TOFU |
| `locuslab/tofu_ft_phi-1.5` (modelo base) | 1.418 M | 2048 | Apache 2.0 | Ajuste fino TOFU sin desaprender |
| `microsoft/phi-1_5` (modelo original) | 1.418 M | 2048 | MIT (según model card original) | Generación de código y texto |
| Otros checkpoints `unl-reset` de la misma familia | 1.418 M | 2048 | Apache 2.0 | Variantes de desaprendizaje (épocas 1-20) |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente general; su rendimiento en tareas estándar puede estar degradado respecto al modelo base.
- Sesgos: hereda los sesgos de Phi-1.5 y de los datos de ajuste TOFU; no se documenta ningún proceso de mitigación.
- Riesgo de alucinación: alto, como en cualquier modelo de 1.4B; además, el proceso de desaprendizaje puede aumentar la incoherencia en dominios relacionados con el conjunto *forget*.
- Idioma: únicamente inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Phi-1.5 original tiene su propia licencia (MIT según su model card); conviene verificar la compatibilidad antes de un uso comercial.
- Requiere `trust_remote_code=True` por el `custom_code`, lo que implica ejecutar código del autor; auditar antes de desplegar.
- El checkpoint corresponde a la época 9 de 20: no es el resultado final del proceso de desaprendizaje y puede que aún no haya convergido.
- No se garantiza que el olvido sea completo: los métodos de *machine unlearning* pueden ser revertidos mediante ataques de extracción o *fine-tuning* posterior.

## Enlaces

- [HuggingFace: unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch09](https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch09)
- [Modelo base: locuslab/tofu_ft_phi-1.5](https://huggingface.co/locuslab/tofu_ft_phi-1.5)
- [Modelo original: microsoft/phi-1_5](https://huggingface.co/microsoft/phi-1_5)
- [Perfil del autor: unl-reset](https://huggingface.co/unl-reset)
- TOFU benchmark (paper): no disponible en la información proporcionada.
