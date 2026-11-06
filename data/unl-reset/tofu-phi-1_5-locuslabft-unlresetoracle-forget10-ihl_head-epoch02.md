# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch02

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch02` es un checkpoint de investigación derivado de Phi-1.5, publicado por el usuario `unl-reset`. No se trata de un modelo de propósito general nuevo, sino de un artefacto experimental dentro de la línea de trabajo TOFU (Task of Fictitious Unlearning), orientada a estudiar técnicas de *machine unlearning*: el olvido selectivo de información concreta en modelos ya entrenados. El punto de partida es `locuslab/tofu_ft_phi-1.5`, un ajuste fino de Phi-1.5 sobre el conjunto de datos TOFU.

La intervención aplicada combina dos estrategias: reinicialización de las embeddings de entrada y de la cabeza LM a partir de los pesos originales de `microsoft/phi-1_5`, y un entrenamiento con una pérdida compuesta que suma un término de *token IHL* (probablemente un objetivo de olvido tipo "inverse of hinge loss" o similar, dado el nombre) sobre el conjunto *forget* y una entropía cruzada estándar ponderada por 1.0 sobre el conjunto *retain*. El resultado es un checkpoint completo y autónomo, no un adaptador, con 1.418.270.720 parámetros en formato safetensors y un repositorio de 2,8 GB.

Su relevancia es acotada pero clara: sirve como referencia reproducible para quienes investigan unlearning, evalúan la retención de conocimiento tras el olvido y comparan variantes de inicialización (aquí, la reinicialización de embeddings y cabeza LM respecto al modelo base ajustado). No está pensado para uso en producción ni para tareas generales de generación; su valor es metodológico y experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, con código personalizado (`custom_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de aproximadamente 1.400 millones de parámetros, diseñado originalmente por Microsoft Research para generación de texto y código en contextos educativos. Sobre esa base, el autor parte de `locuslab/tofu_ft_phi-1.5`, un ajuste fino previo sobre TOFU, y aplica una intervención de dos componentes. Primero, reinicializa las *input embeddings* y la *LM head* con los pesos de `microsoft/phi-1_5`, mientras conserva el resto de pesos del transformer del modelo ajustado. Segundo, entrena con una pérdida compuesta: un término de *token IHL* aplicado sobre el conjunto *forget* y una entropía cruzada (CE) con peso 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la época 2 de 20.

El nombre del repositorio sugiere una variante "oracle" sobre el subconjunto `forget10` de TOFU, es decir, el escenario en el que el modelo dispone de información privilegiada sobre qué debe olvidar. El repositorio incluye un `ihl_manifest.json` que documenta la configuración del experimento. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset más allá de las particiones *forget*/*retain* de TOFU, ni sobre el uso de RLHF o DPO; todo ello debe considerarse no disponible.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de la arquitectura Phi-1.5.
- Razonamiento básico y respuesta a preguntas de dominio general, condicionado por el ajuste fino sobre TOFU.
- Generación de código y matemáticas elementales, capacidad presente en Phi-1.5 y presumiblemente conservada en los pesos no reinicializados.
- Comportamiento de olvido selectivo: el modelo está entrenado para reducir la retención sobre el conjunto *forget* manteniendo el rendimiento sobre *retain*.
- No se ha documentado soporte de *tool calling* ni de *function calling*.
- No se ha documentado soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No se ha documentado *thinking mode*, visión ni audio.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como punto de comparación reproducible para medir cuánto conocimiento del conjunto *forget* se elimina y cuánto del *retain* se conserva, usando las métricas estándar de TOFU.
- Evaluación de estrategias de reinicialización: al reinicializar embeddings y cabeza LM desde `microsoft/phi-1_5`, permite aislar el efecto de esa decisión frente a variantes que conservan los pesos del modelo ajustado.
- Reproducción de experimentos de pérdida compuesta: el uso de *token IHL* más CE ponderada sobre *retain* facilita estudiar el equilibrio entre olvido y retención ajustando el peso de cada término.
- Auditoría de privacidad en modelos ajustados: útil para analizar si un modelo que ha visto datos sensibles (en este caso ficticios de TOFU) puede "desaprenderlos" de forma verificable.
- Docencia y formación: adecuado como ejemplo práctico de pipeline de unlearning sobre un modelo pequeño (1,4B) que cabe en hardware modesto.
- Línea base para comparativas metodológicas: sirve como referencia frente a otras variantes del mismo autor (`unl-reset`) con distintas épocas o configuraciones de olvido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos cortos.
- En cuantización de 8 bits: en torno a 1,5-2 GB de VRAM; en 4 bits, alrededor de 1 GB, aunque no se documentan cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 3070); A100 o H100 no son necesarias dado el tamaño.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; también en GPUs de 8 GB con cuantización.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por `custom_code`); llama.cpp y Ollama requerirían conversión a GGUF, no documentada; vLLM y TGI no están verificados para este checkpoint.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch02` | 1,42B | no disponible | apache-2.0 | Hugging Face, 0 descargas | Checkpoint experimental de unlearning |
| `locuslab/tofu_ft_phi-1.5` | ~1,4B | no disponible | no disponible | Hugging Face | Modelo base ajustado sobre TOFU |
| `microsoft/phi-1_5` | 1,3B | 2048 | MIT (según modelo original) | Hugging Face | Modelo original de Microsoft |
| `microsoft/phi-2` | 2,7B | 2048 | MIT | Hugging Face | Sucesor de mayor tamaño |

La comparación relevante es metodológica: este checkpoint se distingue de `locuslab/tofu_ft_phi-1.5` por la reinicialización de embeddings y cabeza LM y por el objetivo de pérdida con IHL, y de `microsoft/phi-1_5` por el ajuste sobre TOFU. No hay datos de rendimiento publicados que permitan comparar métricas de olvido o retención.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para tareas generales de generación.
- Riesgo de alucinación: inherente a la arquitectura Phi-1.5, agravado por el ajuste sobre un dataset sintético (TOFU) de alcance limitado.
- Sesgos: no documentados; se heredan los de Phi-1.5 y los del ajuste fino sobre TOFU, sin evaluación específica publicada.
- Limitación de idioma: solo inglés según la model card.
- Longitud de contexto: no documentada en la información proporcionada; la de Phi-1.5 original es de 2048 tokens.
- Licencia apache-2.0: permite uso comercial según los términos de la licencia, pero el modelo base `locuslab/tofu_ft_phi-1.5` no declara licencia en la información disponible, lo que introduce incertidumbre jurídica.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor; conviene auditar antes de desplegar.
- Sin descargas ni validación comunitaria: no hay evidencia externa de su comportamiento real.
- El escenario "oracle" asume conocimiento de qué debe olvidarse, lo que no refleja condiciones reales de despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch02
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- TOFU (paper): no disponible en la informacion proporcionada
- Repositorio del autor: no disponible en la informacion proporcionada
