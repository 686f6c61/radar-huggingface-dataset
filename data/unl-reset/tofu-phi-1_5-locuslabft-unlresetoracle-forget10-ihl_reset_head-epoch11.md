# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch11

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch11` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez parte de `microsoft/phi-1_5`. Se trata de un artefacto experimental orientado al estudio de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning), no de un modelo de propósito general listo para producción. El autor, `unl-reset`, aplica una receta concreta de reinicialización parcial (cabecera LM y embeddings de entrada) combinada con un objetivo de token IHL sobre el conjunto *forget* y entropía cruzada sobre el conjunto *retain*.

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de 1.418 millones de parámetros, diseñado originalmente por Microsoft Research para razonamiento y generación de código en modelos pequeños. Este checkpoint concreto conserva los pesos del transformer de `locuslab/tofu_ft_phi-1.5` y reinicializa la cabeza de lenguaje y los embeddings de entrada desde `microsoft/phi-1_5`, con el objetivo de borrar la influencia de un subconjunto de datos (*forget10*) manteniendo el rendimiento en el resto.

Su relevancia es metodológica: sirve para evaluar técnicas de desaprendizaje (unlearning) en modelos pequeños, comparando si el olvido selectivo degrada capacidades generales. No debe confundirse con un modelo afinado para uso comercial o asistencial; es un checkpoint de laboratorio, en epoch 11 de 20, publicado bajo licencia Apache 2.0 y con soporte únicamente en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only de 1.418 millones de parámetros con atención multi-cabeza estándar y normalización previa a la atención (pre-LN). Phi-1.5 fue entrenado originalmente por Microsoft Research sobre un corpus mixto de texto sintético y código, con énfasis en razonamiento básico y generación de código en un régimen de parámetros reducido. Este checkpoint no introduce cambios estructurales en el transformer: mantiene los pesos de `locuslab/tofu_ft_phi-1.5` y reinicializa únicamente los embeddings de entrada y la cabeza LM desde `microsoft/phi-1_5`, según indica la model card.

El entrenamiento aplica una pérdida compuesta: token IHL (Information-Theoretic Unlearning, presumiblemente una variante de la familia de objetivos de desaprendizaje) sobre el conjunto *forget10* de TOFU, más un término de entropía cruzada con peso 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la epoch 11 de 20. La model card menciona un `ihl_manifest.json` con detalles del procedimiento, pero no se proporcionan en la información disponible ni el número de tokens de entrenamiento, ni la composición exacta del dataset, ni si hubo RLHF/DPO. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Phi-1.5.
- Razonamiento básico y resolución de problemas sencillos, limitado por el tamaño de 1.4B parámetros.
- Generación de código en lenguajes comunes (Python, JavaScript), capacidad característica de la familia Phi-1.5.
- Matemáticas elementales y aritmética de varios pasos, con fiabilidad limitada.
- Soporte de *tool calling* / *function calling*: no disponible de forma nativa; requeriría plantillas externas.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo base no incluye modo *thinking* ni planificación explícita.
- Capacidades multilingües: únicamente inglés según la model card.
- Capacidades especiales (visión, audio, *thinking mode*): no disponibles.

## Casos de uso

- **Investigación en *machine unlearning***: el caso principal. Sirve para medir si la reinicialización de cabeza LM y embeddings, junto con el objetivo IHL, elimina la influencia del conjunto *forget10* sin degradar el conjunto *retain*. Se usaría junto al benchmark TOFU para calcular métricas de olvido y retención.
- **Evaluación de recetas de desaprendizaje**: comparar esta configuración (IHL + reset de cabeza) contra alternativas como *gradient ascent*, *KL minimization* o *task arithmetic* sobre el mismo modelo base, manteniendo constante el resto de hiperparámetros.
- **Estudio de degradación de capacidades**: analizar cuánto código y razonamiento general se pierde tras 11 epochs de entrenamiento con la pérdida compuesta, usando suites como HumanEval o GSM8K como referencia.
- **Reproducibilidad de experimentos TOFU**: al ser un checkpoint completo y autónomo (no un adaptador LoRA), permite reproducir exactamente las condiciones de inferencia del experimento sin recomponer pesos.
- **Auditoría de privacidad**: verificar empíricamente si el modelo aún memoriza datos del conjunto *forget* mediante ataques de extracción o *membership inference*, como validación del procedimiento de olvido.
- **Prototipado de pipelines de inferencia**: al ser un modelo de 1.4B en safetensors, puede desplegarse en vLLL o TGI para probar integraciones de bajo coste, siempre con la advertencia de que no es un modelo de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de las métricas específicas de TOFU (probabilidad de olvido, retención, coherencia). Tampoco se documentan comparaciones con otros checkpoints de la misma familia.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en fp16, aproximadamente 2.8 GB solo para pesos (1.418M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para secuencias cortas.
- **Cuantización**: en 8 bits, ~1.5 GB; en 4 bits, ~0.8 GB. No se documentan cuantizaciones oficiales (GGUF, GPTQ, AWQ), por lo que habría que generarlas.
- **GPU recomendadas**: cualquier GPU consumer con ≥8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) para fp16; RTX 4090 o A100/H100 sobredimensionadas para este tamaño, útiles solo para *batching* alto.
- **¿Cabe en consumer GPU?**: sí, en la mayoría de GPU modernas con 8 GB o más.
- **Opciones de despliegue**: `transformers` con `trust_remote_code=True` (obligatorio por el tag `custom_code`); vLLM y TGI son viables una vez convertido el checkpoint; llama.cpp/Ollama requerirían conversión a GGUF, no disponible de serie.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (TOFU forget10, epoch 11) | 1.418M | no disponible | Apache 2.0 | HuggingFace | Checkpoint de investigación en *unlearning* |
| `microsoft/phi-1_5` | 1.3B | 2048 | MIT | HuggingFace | Modelo base original, propósito general |
| `locuslab/tofu_ft_phi-1.5` | 1.3B | no disponible | no disponible | HuggingFace | Modelo afinado sobre TOFU, punto de partida de este checkpoint |
| Phi-2 | 2.7B | 2048 | MIT | HuggingFace | Sucesor de mayor tamaño, mejor razonamiento general |

La comparación relevante es metodológica: este checkpoint se distingue de `locuslab/tofu_ft_phi-1.5` únicamente por el procedimiento de olvido aplicado, no por arquitectura ni tamaño. Frente a Phi-1.5 original, la diferencia está en el ajuste sobre TOFU y la posterior reinicialización parcial.

## Limitaciones y advertencias

- **Sesgos conocidos**: no documentados en la información disponible; el modelo base Phi-1.5 presenta sesgos de género y culturales típicos de corpus web y sintéticos.
- **Riesgo de alucinación**: alto en un modelo de 1.4B parámetros; no se han publicado evaluaciones de factualidad tras el proceso de olvido.
- **Limitaciones de contexto e idioma**: solo inglés; la longitud de contexto no está documentada en este checkpoint (el Phi-1.5 original soporta 2048 tokens).
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el modelo no está diseñado ni validado para producción; el uso comercial sería técnicamente legal pero desaconsejado.
- **Caveat crítico**: es un checkpoint intermedio de un experimento (epoch 11 de 20), no una versión final. Los pesos pueden no representar el estado óptimo del procedimiento de olvido.
- **Dependencia de `custom_code`**: requiere `trust_remote_code=True` en `transformers`, lo que implica ejecutar código del repositorio; auditar antes de usar en entornos sensibles.
- **Sin garantías de olvido efectivo**: la eficacia del desaprendizaje no está validada con métricas publicadas; no debe asumirse que los datos del conjunto *forget* han sido eliminados de forma verificable.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch11
- Modelo base del checkpoint: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (referencia del dataset): no disponible en la información proporcionada
- Paper de Phi-1.5: no disponible en la información proporcionada
- Repositorio del autor `unl-reset`: no disponible en la información proporcionada
