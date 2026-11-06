# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch15

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch15` es un checkpoint de investigación publicado por el grupo `unl-reset`, derivado del modelo Phi-1.5 de Microsoft (1.418 millones de parámetros) tras un proceso de fine-tuning específico sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Su propósito no es el uso generalista, sino servir como artefacto reproducible en experimentos de *machine unlearning*: el autor ha reinicializado los embeddings de entrada y la cabeza del modelo de lenguaje (LM head) desde `microsoft/phi-1_5`, manteniendo el resto de pesos del transformer de `locuslab/tofu_ft_phi-1.5`, y ha aplicado un entrenamiento con pérdida combinada (token IHL sobre el conjunto *forget* y entropía cruzada sobre el conjunto *retain*).

El checkpoint corresponde a la época 15 de 20 de un pipeline de desaprendizaje orientado al escenario `forget10` de TOFU, donde el objetivo es eliminar la influencia de un 10 % de los datos de autor ficticio sin degradar el rendimiento sobre el 90 % restante. La nomenclatura del repositorio (`ihl_head`, `unlresetoracle`) sugiere una variante de *reset* parcial de componentes junto con una pérdida de tipo *IHL* (probablemente *Information-Theoretic/Hinge Loss*), aunque la model card no desarrolla la formulación matemática completa.

Se trata, por tanto, de un modelo de nicho para investigadores en privacidad y borrado selectivo de conocimiento, no de un modelo listo para producción. Su relevancia radica en que permite auditar y comparar metodologías de unlearning sobre una base Phi-1.5 bien conocida, con licencia Apache 2.0 y pesos en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | `locuslab/tofu_ft_phi-1.5` |
| Tamaño del repositorio | 2,8 GB |
| Época de entrenamiento | 15 de 20 |
| Conjunto de evaluación | TOFU `forget10` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only de 1.418 millones de parámetros, orientado originalmente a generación de código y texto, con atención causal estándar. El checkpoint aquí publicado no introduce cambios estructurales en el transformer; lo que varía respecto al modelo base `locuslab/tofu_ft_phi-1.5` es el estado de los embeddings de entrada y de la LM head, que han sido reinicializados desde `microsoft/phi-1_5`. El resto de pesos del transformer se conserva del modelo base fine-tuneado sobre TOFU.

El entrenamiento combina dos señales: una pérdida de tipo *token IHL* aplicada sobre el conjunto *forget* y una entropía cruzada con peso 1.0 sobre el conjunto *retain*. Este esquema busca forzar al modelo a olvidar el subconjunto de autores ficticios (`forget10`, el 10 % de TOFU) mientras preserva el comportamiento sobre el 90 % restante. El checkpoint corresponde a la época 15 de un total de 20, y el autor remite a `ihl_manifest.json` para los detalles completos del pipeline. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de TOFU, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto en inglés sobre la base de Phi-1.5, con las capacidades heredadas del modelo original (razonamiento básico, código y matemáticas elementales).
- Evaluación de desaprendizaje: el checkpoint está diseñado para medirse sobre TOFU `forget10`, lo que permite cuantificar la retención o eliminación de conocimiento de autores ficticios.
- No se documenta soporte de *tool calling* ni *function calling* en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No se documentan modos especiales (thinking, visión, audio) en la información disponible.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como punto de comparación reproducible para medir cuánto conocimiento del conjunto `forget10` persiste tras 15 épocas de entrenamiento con la pérdida IHL, frente a otras variantes del pipeline `unl-reset`.
- Auditoría de privacidad: permite evaluar si la reinicialización de embeddings y LM head reduce la memorización de datos de autor ficticio en comparación con el modelo base `locuslab/tofu_ft_phi-1.5`.
- Reproducción de experimentos TOFU: al ser un checkpoint completo y autónomo, puede cargarse directamente para replicar las métricas publicadas (o pendientes) del escenario `forget10`.
- Estudio de la interacción entre reset de componentes y pérdida de retención: útil para analizar cómo afecta el reset de la LM head a la perplejidad sobre el conjunto *retain*.
- Benchmarking de metodologías de unlearning: sirve como baseline frente a técnicas como gradient ascent, preference optimization o noisy fine-tuning sobre el mismo modelo base.
- Docencia y formación: ejemplo práctico de un pipeline de desaprendizaje con pérdida combinada sobre un modelo pequeño (1.4B), manejable en hardware de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5-2 GB; en 4 bits, en torno a 1 GB, aunque no se publican pesos cuantizados en el repositorio.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB (RTX 3060, RTX 4060, RTX 4090) es suficiente para fp16; para cuantización 4/8 bits basta con 4-6 GB.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 8 GB o más.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repositorio usa `custom_code`); vLLM y TGI no están garantizados sin verificar compatibilidad con el código personalizado; llama.cpp/Ollama requerirían conversión a GGUF, no disponible en el repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch15` | 1.418 M | No disponible | Apache 2.0 | Hugging Face | Checkpoint de unlearning sobre TOFU forget10 |
| `locuslab/tofu_ft_phi-1.5` | ~1.418 M | No disponible | No disponible en la información | Hugging Face | Modelo base fine-tuneado sobre TOFU |
| `microsoft/phi-1_5` | 1.300 M | 2.048 tokens (según documentación pública de Phi-1.5) | MIT (según documentación pública) | Hugging Face | Modelo original de Microsoft |
| `microsoft/phi-2` | 2.700 M | 2.048 tokens (según documentación pública) | MIT (según documentación pública) | Hugging Face | Alternativa de mayor tamaño de la familia Phi |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas generales de generación; su evaluación se circunscribe a TOFU.
- Riesgo de alucinación: heredado de Phi-1.5, un modelo pequeño con propensión a generar contenido plausible pero incorrecto, especialmente en dominios factuales.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al derivar de Phi-1.5, puede arrastrar los sesgos del corpus original de Microsoft.
- Limitación idiomática: solo inglés según la etiqueta del repositorio.
- Contexto: no se especifica la longitud de contexto soportada en la model card; debe consultarse la del modelo base Phi-1.5.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base `locuslab/tofu_ft_phi-1.5` y `microsoft/phi-1_5` tienen sus propias condiciones que deben verificarse antes de cualquier despliegue.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor; auditar antes de cargar en entornos sensibles.
- El checkpoint corresponde a la época 15 de 20; no es el estado final del entrenamiento, lo que puede afectar a la reproducibilidad de resultados si se esperaba el checkpoint final.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch15
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Repositorio TOFU (referencia del dataset): no disponible en la información proporcionada
- Paper TOFU: no disponible en la información proporcionada
- `ihl_manifest.json`: referenciado en la model card, alojado en el propio repositorio de Hugging Face
