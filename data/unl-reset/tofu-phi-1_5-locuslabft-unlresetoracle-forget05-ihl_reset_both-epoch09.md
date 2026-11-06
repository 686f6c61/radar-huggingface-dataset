# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch09

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch09` es un checkpoint de Phi-1.5 (1.418 millones de parámetros) publicado por el grupo `unl-reset` como parte de un experimento de *machine unlearning* sobre el benchmark TOFU. Se trata de un modelo de lenguaje de tipo transformer denso, derivado de `locuslab/tofu_ft_phi-1.5` (que a su vez es un fine-tuning de `microsoft/phi-1_5` sobre el dataset TOFU), entrenado para olvidar el subconjunto `forget05` de dicho dataset.

La particularidad técnica del checkpoint es la estrategia de inicialización "reset both": los embeddings de entrada y la cabeza de lenguaje (LM head) se reinicializan desde el modelo original `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo fine-tuneado `locuslab/tofu_ft_phi-1.5`. Sobre esta base se aplica un objetivo de entrenamiento que combina un término de *token IHL* (unlearning) sobre el conjunto a olvidar y una entropía cruzada (CE) con peso 1.0 sobre el conjunto a retener.

El interés del checkpoint es fundamentalmente de investigación: sirve como artefacto reproducible para estudiar técnicas de desaprendizaje selectivo en modelos pequeños, evaluar la tensión entre olvidar y preservar capacidades, y comparar metodologías de reset de pesos frente a alternativas de unlearning. No está pensado como modelo de producción: es un checkpoint intermedio (época 9 de 20) de un pipeline experimental, con cero descargas y sin pipeline declarado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-1.5) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`; incluye `ihl_manifest.json`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer denso de aproximadamente 1.400 millones de parámetros, con atención multi-cabeza estándar y una ventana de contexto típica de la familia Phi-1.5 (el valor exacto no se especifica en la información disponible). No se trata de un modelo MoE ni híbrido: todos los parámetros se activan en cada paso de inferencia.

El entrenamiento se articula en tres fases implícitas. Primero, un fine-tuning supervisado sobre el dataset TOFU (`locuslab/tofu_ft_phi-1.5`). Segundo, una reinicialización parcial: los embeddings de entrada y la cabeza LM se restauran desde `microsoft/phi-1_5`, descartando así la información aprendida en esas capas durante el fine-tuning. Tercero, un entrenamiento de desaprendizaje con una función de pérdida compuesta: un término de *token IHL* aplicado al conjunto `forget05` (los datos que se desea olvidar) más una entropía cruzada con coeficiente 1.0 sobre el conjunto `retain` (los datos que se desea preservar). El checkpoint corresponde a la época 9 de un total de 20, por lo que es un artefacto intermedio, no el resultado final del proceso.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset TOFU, ni sobre el uso de RLHF o DPO en este checkpoint concreto.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Phi-1.5.
- Razonamiento básico y resolución de problemas sencillos, limitado por el tamaño del modelo (1.400 millones de parámetros).
- Generación de código y matemáticas a nivel introductorio, típico de Phi-1.5.
- Capacidad de *machine unlearning*: el checkpoint está diseñado para haber olvidado el subconjunto `forget05` del dataset TOFU, manteniendo el rendimiento sobre el conjunto `retain`.
- Soporte de *tool calling* / *function calling*: no disponible (no documentado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: únicamente inglés.
- Capacidades especiales (visión, audio, *thinking mode*): no disponible.

## Casos de uso

- **Investigación en *machine unlearning***: el modelo sirve como artefacto de referencia para reproducir y comparar metodologías de desaprendizaje selectivo sobre el benchmark TOFU. Su utilidad principal es académica: permite medir cuánto se ha olvidado `forget05` y cuánto se ha preservado `retain` mediante métricas estándar de TOFU.
- **Evaluación de estrategias de reset de pesos**: al reinicializar embeddings y LM head desde `microsoft/phi-1_5`, el checkpoint permite estudiar el impacto de esta técnica frente a alternativas como el reset completo o el *gradient ascent* puro, comparando curvas de olvido/retención a lo largo de las épocas.
- **Auditoría de privacidad en modelos fine-tuneados**: útil para analizar si un modelo que ha sido fine-tuneado sobre datos sensibles (TOFU simula datos de autores) puede "desaprender" eficazmente esa información sin perder capacidades generales, un escenario relevante para cumplimiento normativo (RGPD, derecho al olvido).
- **Línea base para *red teaming* de unlearning**: investigadores pueden intentar extraer la información supuestamente olvidada mediante *prompting* adversarial, midiendo la robustez del desaprendizaje frente a ataques de extracción.
- **Estudio de la tensión olvido-retención**: la pérdida compuesta (IHL + CE) permite analizar empíricamente el *trade-off* entre eliminar conocimiento y preservar utilidad, con aplicaciones en el diseño de funciones de pérdida para unlearning.
- **Reproducibilidad de pipelines experimentales**: al incluir `ihl_manifest.json` y ser un checkpoint autónomo completo, facilita la replicación de experimentos en entornos con recursos limitados (un solo GPU consumer basta para cargar 1.400 millones de parámetros en fp16).
- **Docencia en privacidad de modelos**: adecuado como ejemplo didáctico de cómo se estructura un experimento de unlearning (modelo base, fine-tuning, reset, entrenamiento con pérdida dual) en un tamaño manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en fp16, aproximadamente 2,8 GB solo para pesos (1.418 millones de parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 3,5 y 4,5 GB para secuencias cortas. En int8, unos 1,4 GB de pesos; en int4, unos 0,7 GB.
- **GPU recomendadas**: cualquier GPU con al menos 6 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 2070). Para mayor throughput, A100, H100 o RTX 4090.
- **¿Cabe en GPU consumer?**: sí, en la práctica totalidad de GPU consumer modernas con 6 GB o más. Incluso una GTX 1660 de 6 GB puede cargarlo en fp16 con secuencias moderadas.
- **Opciones de despliegue**: vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), transformers con `trust_remote_code=True` (el repo incluye `custom_code`, por lo que es necesario habilitar código remoto).
- **Latencia y throughput estimados**: no disponible. Al ser un modelo de 1.400 millones de parámetros, se espera un throughput alto en GPU modernas (del orden de miles de tokens por segundo en batch), pero no se han publicado mediciones específicas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| **Este modelo** (`unl-reset/tofu-phi-1_5-...-epoch09`) | 1.418 M | no disponible | apache-2.0 | Hugging Face (0 descargas) | Unlearning TOFU, checkpoint intermedio |
| `microsoft/phi-1_5` | 1.300 M | 2.048 tokens (típico de la familia) | MIT | Hugging Face, ampliamente usado | Modelo base de código y texto |
| `locuslab/tofu_ft_phi-1.5` | ~1.400 M | no disponible | apache-2.0 | Hugging Face | Fine-tuning sobre TOFU (modelo "a olvidar") |
| `microsoft/phi-2` | 2.700 M | 2.048 tokens | MIT | Hugging Face | Modelo base más grande, mejor rendimiento general |

La comparación relevante es con `locuslab/tofu_ft_phi-1.5` (el modelo del que deriva y cuyo conocimiento se pretende eliminar) y con `microsoft/phi-1_5` (origen de los pesos reinicializados). Frente a `phi-2`, este checkpoint es significativamente más pequeño y está especializado en una tarea de investigación, no en uso general.

## Limitaciones y advertencias

- **Checkpoint intermedio**: corresponde a la época 9 de 20; no es el resultado final del pipeline de unlearning, por lo que su grado de olvido puede ser incompleto.
- **Riesgo de alucinación**: heredado de Phi-1.5, un modelo pequeño propenso a generar afirmaciones incorrectas con seguridad, especialmente en dominios factuales.
- **Sesgos conocidos**: los sesgos del corpus de entrenamiento original de Phi-1.5 (predominantemente inglés y de fuentes web) se conservan en los pesos no reinicializados.
- **Limitación de idioma**: solo inglés; no se ha validado su comportamiento en otros idiomas.
- **Contexto limitado**: no se especifica la ventana de contexto exacta, pero la familia Phi-1.5 maneja ventanas modestas (del orden de 2.048 tokens), insuficiente para tareas de contexto largo.
- **Licencia**: apache-2.0 permite uso comercial, pero el modelo base `locuslab/tofu_ft_phi-1.5` y `microsoft/phi-1_5` tienen sus propias condiciones (MIT en el caso de phi-1_5); conviene verificar la compatibilidad en despliegues comerciales.
- **`custom_code`**: el repositorio requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código del autor; auditar antes de usar en producción.
- **Cero validación externa**: con 0 descargas y 0 likes, no hay evidencia de uso independiente ni de reproducibilidad por terceros.
- **No apto para producción**: es un artefacto de investigación sin pipeline declarado, sin benchmarks publicados y sin garantías de calidad.
- **Riesgo de fuga de información**: el objetivo del unlearning es eliminar datos de `forget05`, pero no hay evidencia publicada de que el olvido sea robusto frente a ataques de extracción.

## Enlaces

- [Hugging Face: unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch09](https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch09)
- [Modelo base: locuslab/tofu_ft_phi-1.5](https://huggingface.co/locuslab/tofu_ft_phi-1.5)
- [Modelo original: microsoft/phi-1_5](https://huggingface.co/microsoft/phi-1_5)
- Paper de TOFU (benchmark de unlearning): no disponible en la información proporcionada
- Repositorio del código de unlearning: no disponible en la información proporcionada
