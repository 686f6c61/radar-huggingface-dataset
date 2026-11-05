# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch07

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch07` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de un experimento de desaprendizaje (machine unlearning) orientado al subconjunto "forget10" de TOFU, es decir, la eliminación selectiva de información asociada a diez identidades ficticias del corpus.

El checkpoint corresponde a la época 7 de 20 de un procedimiento que combina dos técnicas: reinicialización de las embeddings de entrada y de la cabeza del modelo de lenguaje (LM head) a partir de los pesos originales de `microsoft/phi-1_5`, y un término de entrenamiento denominado IHL (probablemente una variante de loss de olvido) aplicado sobre el conjunto "forget" junto con una pérdida de entropía cruzada (CE) ponderada por 1,0 sobre el conjunto "retain". El resto de pesos del Transformer se conservan del modelo base ajustado.

Se trata de un artefacto de investigación de nicho, con 1.418 millones de parámetros, licencia Apache 2.0 y un único idioma declarado (inglés). No está pensado como modelo de producción, sino como evidencia empírica dentro de la línea de trabajo sobre desaprendizaje selectivo en modelos de lenguaje pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con código personalizado (`custom_code`) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Phi-1.5 emplea 2048 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantización | No disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño de repo 2,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de 1.418 millones de parámetros entrenado originalmente por Microsoft para código y razonamiento básico. Este checkpoint no modifica la topología, sino los pesos: las embeddings de entrada y la cabeza de lenguaje se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de capas del Transformer se heredan de `locuslab/tofu_ft_phi-1.5`, que es el modelo ajustado sobre TOFU.

El entrenamiento aplica un objetivo compuesto: una pérdida IHL sobre el conjunto "forget" de TOFU y una pérdida de entropía cruzada estándar (CE) con peso 1,0 sobre el conjunto "retain". El checkpoint publicado corresponde a la época 7 de 20. El autor indica que el modelo es un checkpoint completo e independiente y remite a `ihl_manifest.json` para los detalles del procedimiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de las particiones forget/retain de TOFU, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto en inglés con el estilo y las capacidades heredadas de Phi-1.5.
- Razonamiento básico y generación de código, capacidades nativas del modelo base Phi-1.5.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.
- No se documentan modos especiales (thinking mode, visión, audio) en la información disponible.
- El propósito principal del checkpoint es servir como artefacto de evaluación de desaprendizaje, no como modelo de propósito general.

## Casos de uso

- Evaluación de técnicas de desaprendizaje: el checkpoint permite medir cuánto ha olvidado el modelo las diez identidades ficticias del conjunto "forget10" de TOFU frente al modelo base, usando métricas de retención y de olvido.
- Investigación en privacidad de modelos: sirve para estudiar hasta qué punto es posible eliminar información concreta de un modelo ajustado sin reentrenar desde cero.
- Comparación de estrategias de reinicialización: al reinicializar embeddings y LM head, permite analizar el impacto de esta técnica frente a otras variantes de desaprendizaje en la literatura.
- Reproducción de experimentos: con la época 7 de 20 disponible, se puede trazar la curva de olvido/retención a lo largo del entrenamiento si se publican las épocas restantes.
- Análisis de degradación de capacidades: permite cuantificar la pérdida de rendimiento en tareas generales (código, razonamiento) causada por el procedimiento de olvido.
- Docencia y formación: útil como ejemplo práctico de un pipeline de unlearning sobre un modelo pequeño y manejable en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3,0 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5-2 GB; en 4 bits, alrededor de 1-1,5 GB (estimaciones a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070); en entornos de servidor, A100 o H100 son sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6 GB o más en fp16, y en 4 GB o más con cuantización.
- Opciones de despliegue: el repositorio incluye `custom_code`, por lo que se requiere `trust_remote_code=True` en Transformers; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| Este checkpoint (TOFU forget10, época 7) | 1.418 M | No disponible | Apache 2.0 | Desaprendizaje selectivo (investigación) |
| locuslab/tofu_ft_phi-1.5 | 1.418 M | No disponible | Apache 2.0 | Modelo base ajustado sobre TOFU, sin olvido |
| microsoft/phi-1_5 | 1.300 M | 2048 | MIT (según el modelo original) | Generación de código y texto en inglés |
| TOFU forget10 (otras variantes de la literatura) | ~1.300-1.400 M | No disponible | Variable | Desaprendizaje selectivo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para tareas generales.
- El objetivo de entrenamiento prioriza el olvido del conjunto "forget10"; es esperable una degradación de capacidades generales respecto al modelo base, aunque no se cuantifica en la información disponible.
- Riesgo de alucinación inherente a los modelos de 1.400 M de parámetros, agravado por el ajuste sobre un corpus sintético de identidades ficticias.
- Sesgos: no documentados por el autor; hereda los sesgos de Phi-1.5 y de TOFU.
- Idioma: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 y el corpus TOFU pueden tener condiciones adicionales que conviene revisar antes de un despliegue comercial.
- Requiere `trust_remote_code=True` por el código personalizado incluido, lo que implica ejecutar código del autor.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch07
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- TOFU (paper y dataset): no disponible en la información proporcionada
- `ihl_manifest.json`: referenciado en la model card, no enlazado explícitamente
