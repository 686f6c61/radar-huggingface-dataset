# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch13

## Resumen

Este checkpoint es un modelo de lenguaje derivado de Phi-1.5, publicado por el usuario `unl-reset` en Hugging Face. No se trata de un modelo de propósito general, sino de un artefacto de investigación orientado a experimentos de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning). Concretamente, parte de `locuslab/tofu_ft_phi-1.5`, un Phi-1.5 ajustado sobre el conjunto TOFU, y aplica una receta de reinicialización parcial (IHL + reset) centrada en el subconjunto *forget10* durante la época 13 de un total de 20.

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de aproximadamente 1.418 millones de parámetros (1,4 B), entrenado originalmente por Microsoft para código y razonamiento básico. En este checkpoint, los embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado con TOFU. El objetivo declarado es doble: aplicar *token IHL* sobre el conjunto *forget* y una pérdida de entropía cruzada con peso 1.0 sobre el conjunto *retain*.

Su relevancia es acotada y muy específica: sirve como referencia reproducible para quienes investigan técnicas de desaprendizaje, evalúan la eficacia de métodos de reset parcial o comparan estrategias de mitigación de memorización en modelos pequeños. No está pensado para despliegue en producción ni para tareas generativas generales, y de hecho no se han publicado benchmarks de rendimiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 2,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5, un transformer decoder-only denso de 1,4 B de parámetros con atención causal estándar y sin mecanismos MoE ni capas SSM. La model card indica explícitamente que los embeddings de entrada y la cabeza LM se inicializan desde `microsoft/phi-1_5`, mientras que el resto de los pesos del transformer se mantienen desde `locuslab/tofu_ft_phi-1.5`. Esto implica que el checkpoint no es un ajuste fino convencional desde el modelo base original, sino una intervención quirúrgica sobre un modelo ya ajustado con TOFU.

El procedimiento de entrenamiento combina dos señales: una pérdida *token IHL* aplicada sobre el conjunto *forget* y una pérdida de entropía cruzada con coeficiente 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la época 13 de 20 y se distribuye como modelo completo autónomo, con un manifiesto `ihl_manifest.json` que documenta la configuración. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset TOFU utilizado ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, heredada de la arquitectura Phi-1.5.
- Razonamiento básico y respuesta a preguntas simples, limitado por el tamaño del modelo.
- Capacidad de código y matemáticas elementales, propia de Phi-1.5, aunque no validada en este checkpoint.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No se documentan modos especiales como *thinking mode*, visión o audio.
- El modelo está diseñado como artefacto de investigación en *unlearning*, no como asistente general.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como referencia para medir la eficacia de la combinación IHL + reset sobre el subconjunto *forget10* de TOFU, comparando la retención en *retain* frente al olvido en *forget*.
- Reproducción de experimentos TOFU: permite replicar la época 13/20 de una receta concreta y contrastar resultados con otras épocas o variantes del mismo autor.
- Evaluación de métodos de reinicialización parcial: útil para estudiar el impacto de reinicializar embeddings y cabeza LM manteniendo el resto de pesos del transformer.
- Análisis de memorización y privacidad: al estar entrenado sobre TOFU, permite estudiar hasta qué punto el modelo retiene información ficticia sensible y cómo responde a intervenciones de desaprendizaje.
- Docencia y formación: adecuado para explicar en un curso o seminario cómo se construye un checkpoint de *unlearning* y qué métricas se emplean para evaluarlo.
- Baseline en comparativas de *unlearning*: puede usarse como punto de comparación frente a métodos como gradient ascent, preference optimization o task arithmetic en modelos de 1,4 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 1,5-2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 1-1,5 GB para pesos.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) es suficiente para inferencia en fp16 con contextos cortos; A100 o H100 no son necesarias.
- Cabe en GPU consumer: sí, con holgura, en la mayoría de tarjetas de gama media actuales.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repo incluye `custom_code`), y potencialmente `llama.cpp` u `Ollama` si se generan pesos GGUF, aunque no se documenta conversión oficial.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Este checkpoint (unl-reset/tofu-phi-1_5-...) | 1,4 B | No disponible | Apache 2.0 | Unlearning TOFU (IHL + reset) |
| locuslab/tofu_ft_phi-1.5 | 1,4 B | No disponible | No disponible en esta ficha | Ajuste fino sobre TOFU (modelo base del anterior) |
| microsoft/phi-1_5 | 1,3 B aprox. | 2.048 tokens (referencia pública) | MIT (referencia pública) | Modelo base original para código |
| Otros checkpoints TOFU de Phi-1.5 | 1,4 B | No disponible | Variable | Distintas recetas de unlearning |

La comparación se limita a modelos de la misma familia y tamaño, ya que el checkpoint es un artefacto de investigación y no compite con modelos generativos de propósito general. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas generativas generales.
- Sesgos: hereda los sesgos de Phi-1.5 y del conjunto TOFU, sin que se documenten mitigaciones específicas.
- Riesgo de alucinación: elevado en un modelo de 1,4 B, especialmente fuera de los dominios de entrenamiento.
- Limitación de idioma: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Longitud de contexto: no documentada en la información disponible; conviene asumir la del Phi-1.5 original (2.048 tokens) como referencia conservadora.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset TOFU pueden tener condiciones adicionales que conviene revisar.
- El checkpoint requiere `trust_remote_code=True` por incluir código personalizado, lo que implica ejecutar código del autor.
- El propósito declarado es el desaprendizaje; su uso como modelo conversacional puede producir respuestas degradadas o incoherentes.
- No hay métricas publicadas de retención en *retain* ni de olvido en *forget* en la información disponible, por lo que no se puede verificar la eficacia del método.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch13
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (referencia del dataset): no disponible en la información proporcionada
- Paper de TOFU: no disponible en la información proporcionada
- Repositorio o demo adicional: no disponible en la información proporcionada
