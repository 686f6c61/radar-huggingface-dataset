# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch05

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch05` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez parte de `microsoft/phi-1_5`. Lo publica el usuario `unl-reset` y su propósito declarado es servir como artefacto de experimentación en el marco del benchmark TOFU (Task of Fictitious Unlearning), centrado en el desaprendizaje selectivo de información en modelos de lenguaje. Concretamente, el checkpoint corresponde a la variante "forget10" con la técnica IHL (probablemente *Iterative/Influence-based Hellinger* u otra formulación interna del autor, no detallada en la model card) y reinitialización de embeddings de entrada y cabeza LM, en la época 5 de un total de 20.

La arquitectura subyacente es la de Phi-1.5, un transformer decoder-only de aproximadamente 1.400 millones de parámetros orientado originalmente a generación de código y razonamiento básico, con contexto corto (2.048 tokens en su configuración canónica). En este checkpoint, las embeddings de entrada y la cabeza de lenguaje se inicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado en TOFU. El resultado es un modelo completo autónomo (no un adaptador LoRA) acompañado de un manifiesto `ihl_manifest.json` que documenta la intervención.

La relevancia es estrictamente de investigación: el modelo no está pensado para despliegue en producción, sino para estudiar cómo distintas intervenciones (reinitialización de embeddings, pérdida IHL sobre el conjunto "forget" combinada con entropía cruzada sobre "retain") afectan a la retención y al olvido de conocimiento ficticio en TOFU. Su licencia Apache 2.0 y su tamaño contenido lo hacen accesible para experimentos académicos, aunque su valor práctico fuera de ese contexto es muy limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (Phi-1.5 canónico: 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización a FP16, INT8, GGUF posible a posteriori) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`; requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only de 1.400 millones de parámetros con atención multi-cabeza estándar, normalización LayerNorm y activación GELU, entrenado originalmente por Microsoft sobre una mezcla de datos sintéticos y filtrados de web orientados a código y razonamiento. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplicó un ajuste fino supervisado sobre el dataset TOFU, que contiene biografías ficticias de autores y preguntas asociadas, con el objetivo de instalar ese conocimiento en el modelo para luego medir su eliminación.

El checkpoint aquí descrito aplica una intervención de desaprendizaje: reinicializa las embeddings de entrada y la cabeza LM desde `microsoft/phi-1_5` (es decir, descarta los pesos aprendidos en esas capas durante el ajuste TOFU) y conserva el resto de pesos del transformer de `locuslab/tofu_ft_phi-1.5`. Sobre esa configuración se aplica un objetivo de entrenamiento compuesto por una pérdida IHL sobre el conjunto *forget* (los datos que se desea olvidar) más un término de entropía cruzada con peso 1.0 sobre el conjunto *retain* (los datos que deben preservarse). El entrenamiento se detiene en la época 5 de 20. No se especifican en la model card el número de tokens vistos, la composición exacta del dataset más allá de TOFU, ni si hubo etapas de RLHF o DPO posteriores.

La innovación técnica principal es metodológica: la combinación de reinitialización selectiva de capas de embeddings y cabeza LM con una pérdida IHL sobre el conjunto forget, documentada en `ihl_manifest.json`. No se describen innovaciones arquitectónicas propias (atención lineal, decodificación especulativa, MoE, etc.).

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Phi-1.5.
- Razonamiento básico y resolución de problemas sencillos de matemáticas y lógica de nivel escolar.
- Generación y comprensión de código en lenguajes comunes (Python, JavaScript, etc.), capacidad original de Phi-1.5.
- Respuesta a preguntas de conocimiento general y de conocimiento ficticio inyectado vía TOFU (parcialmente olvidado por la intervención).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la model card.
- No dispone de modo *thinking*, visión, audio ni otras modalidades.

## Casos de uso

- Investigación en desaprendizaje selectivo: el checkpoint sirve como punto de comparación en experimentos TOFU para medir cuánto conocimiento ficticio se elimina tras la reinitialización de embeddings y la pérdida IHL, frente a otros métodos (gradient ascent, preferencias, etc.).
- Evaluación de estabilidad de embeddings tras reinitialización: permite estudiar cómo afecta reinicializar las capas de entrada y salida a la perplejidad en el conjunto *retain* y a la fidelidad en el conjunto *forget*.
- Reproducibilidad de pipelines académicos: al ser un checkpoint completo (no un adaptador), puede cargarse directamente con `transformers` y `trust_remote_code` para replicar las métricas publicadas en trabajos derivados de TOFU.
- Análisis de olvido catastrófico: útil para medir cuánta capacidad general de Phi-1.5 se degrada al forzar el olvido de un subconjunto de datos, comparando contra el modelo base `locuslab/tofu_ft_phi-1.5`.
- Estudio de la interacción entre pérdida IHL y entropía cruzada: el peso 1.0 sobre *retain* permite analizar empíricamente el equilibrio entre olvido y retención en distintas épocas (aquí, época 5 de 20).
- Docencia y formación en privacidad de modelos: ejemplo práctico de cómo se construye un artefacto de *machine unlearning* con licencia permisiva y tamaño manejable en una GPU de gama alta de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contexto corto.
- VRAM estimada en cuantización INT8: alrededor de 1,5-2 GB; en INT4/GGUF Q4: alrededor de 1 GB.
- GPU recomendadas: NVIDIA A100, H100 o L40S para experimentos por lotes; RTX 4090, RTX 3090 o RTX 4080 para inferencia individual.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; también en GPUs con 8 GB en cuantización INT8/INT4.
- Opciones de despliegue: `transformers` (con `trust_remote_code=True` por el tag `custom_code`), vLLM y TGI (previa conversión y verificación de compatibilidad con el código personalizado), llama.cpp/Ollama (requiere conversión a GGUF, no incluida en el repo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch05` (este) | 1.418 M | no disponible (Phi-1.5: 2.048) | Apache 2.0 | HuggingFace, 0 descargas | Checkpoint de desaprendizaje TOFU |
| `locuslab/tofu_ft_phi-1.5` | ~1.400 M | 2.048 | Apache 2.0 (heredada) | HuggingFace | Modelo base ajustado en TOFU, sin desaprender |
| `microsoft/phi-1_5` | 1.300 M | 2.048 | MIT (original) | HuggingFace | Modelo original de Microsoft, orientado a código |
| `microsoft/Phi-3-mini-4k-instruct` | 3.800 M | 4.096 | MIT | HuggingFace | Alternativa moderna de tamaño similar, no especializada en desaprendizaje |

La comparación directa con modelos de propósito general no es del todo justa: este checkpoint es un artefacto de investigación cuyo rendimiento relevante se mide en métricas de olvido (TOFU forget/retain), no en benchmarks estándar de capacidad.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para tareas de usuario final.
- Riesgo elevado de alucinación, agravado por la reinitialización de embeddings, que puede degradar la coherencia general del modelo.
- El desaprendizaje no es necesariamente robusto: trabajos en TOFU muestran que el conocimiento "olvidado" puede recuperarse mediante *prompting* adversarial o ajuste fino posterior.
- Capacidades multilingües limitadas al inglés según la model card.
- Contexto corto (2.048 tokens en la configuración canónica de Phi-1.5), insuficiente para tareas de contexto largo.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del autor; auditar antes de usar en entornos sensibles.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el modelo base `locuslab/tofu_ft_phi-1.5` y `microsoft/phi-1_5` tienen sus propias condiciones que conviene verificar.
- Sesgos heredados de los datos de entrenamiento originales de Phi-1.5 y de TOFU (biografías ficticias generadas, posible sesgo de género y cultural).
- Sin descargas ni validación comunitaria: no hay evidencia externa de su comportamiento más allá de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch05
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Manifiesto de la intervención: `ihl_manifest.json` (incluido en el repositorio del modelo)
- Benchmark TOFU (referencia del marco experimental): no disponible en la información proporcionada.
