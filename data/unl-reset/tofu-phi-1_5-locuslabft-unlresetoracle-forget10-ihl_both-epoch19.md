# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch19

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch19` es un checkpoint de Phi-1.5 afinado por el grupo `unl-reset` sobre el modelo base `locuslab/tofu_ft_phi-1.5`, que a su vez deriva del `microsoft/phi-1_5`. Se enmarca en la línea de trabajo TOFU (Task of Fictitious Unlearning), un benchmark académico diseñado para evaluar técnicas de *machine unlearning*: el objetivo es eliminar el conocimiento de un subconjunto concreto del dataset de entrenamiento (el conjunto "forget10", un 10 % de los autores ficticios) sin degradar el rendimiento sobre el resto ("retain").

La variante "IHL + Reset Both" combina dos estrategias: reinicialización de los *input embeddings* y de la *LM head* (tomados de nuevo de `microsoft/phi-1_5`) manteniendo el resto de pesos del transformer del modelo afinado, y un objetivo de pérdida que suma una entropía cruzada inversa (IHL, *Inverse Hill Loss*) sobre el conjunto a olvidar más una entropía cruzada estándar (CE) ponderada por 1,0 sobre el conjunto a retener. El checkpoint corresponde a la época 19 de 20 de este proceso de desaprendizaje supervisado.

Por su naturaleza, no es un modelo de propósito general: es un artefacto de investigación para estudiar olvido selectivo, con 1.418 millones de parámetros, contexto de 2048 tokens (heredado de Phi-1.5), licencia Apache 2.0 y pesos en safetensors con código personalizado. Su relevancia es metodológica: permite reproducir y comparar recetas de *unlearning* sobre un mismo backbone pequeño y verificar cuánto del conocimiento objetivo se ha borrado y cuánto del resto se conserva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con código personalizado (`custom_code`) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 base: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF/INT8 declaradas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de 24 capas y 1.418 millones de parámetros, correspondiente a Phi-1.5, entrenado originalmente por Microsoft sobre datos de texto y código de "calidad de libro de texto". Sobre ese backbone, `locuslab/tofu_ft_phi-1.5` aplicó un ajuste fino supervisado con el dataset TOFU, que contiene biografías sintéticas de autores ficticios y pares pregunta-respuesta asociados. El presente checkpoint parte de ese modelo afinado y aplica una receta de desaprendizaje.

La receta concreta, según la model card, reinicializa los *input embeddings* y la *LM head* con los pesos originales de `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo afinado. La función de pérdida combina dos términos: entropía cruzada inversa (IHL) sobre el conjunto `forget10` —que empuja al modelo a producir respuestas de alta perplejidad o aleatorias para esos datos— y entropía cruzada estándar con peso 1,0 sobre el conjunto de retención, para preservar el comportamiento en el resto del corpus. El resultado es un checkpoint completo e independiente (no un adaptador LoRA) correspondiente a la época 19 de 20; el autor remite a `ihl_manifest.json` para los detalles del manifiesto de ejecución. No se especifican en la información disponible el número total de tokens vistos, la composición exacta del dataset más allá de TOFU, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto en inglés y respuesta a preguntas de formato corto, heredadas del ajuste fino sobre TOFU.
- Razonamiento básico y resolución de problemas sencillos de matemáticas y código, limitados por el tamaño de 1.4B parámetros de Phi-1.5.
- Capacidad objetivo del checkpoint: producir respuestas degradadas o no informativas sobre el subconjunto `forget10` (autores ficticios a olvidar) mientras mantiene el rendimiento en el conjunto de retención.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: solo inglés declarado.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia de la receta "IHL + Reset Both" en la época 19 para comparar curvas de olvido frente a otras variantes (por ejemplo, sin reinicialización de embeddings o con solo un término de pérdida).
- Evaluación de la fidelidad del olvido: medir la perplejidad y la exactitud sobre el conjunto `forget10` con las métricas oficiales de TOFU (probabilidad de respuesta, ROUGE sobre respuestas generadas) y verificar que el conocimiento de los autores objetivo se ha degradado.
- Medición de la retención: ejecutar la batería de evaluación sobre el conjunto `retain` para cuantificar la degradación colateral introducida por el desaprendizaje y ajustar el peso del término CE en réplicas.
- Reproducibilidad de experimentos: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`) y licencia permisiva, permite reanudar o auditar el pipeline de entrenamiento sin depender del estado del autor.
- Estudio de la interacción entre reinicialización de capas y olvido: comparar este modelo con variantes que solo reinicializan la LM head o solo los embeddings para aislar el efecto de cada componente.
- Docencia y divulgación: ejemplo práctico y de bajo coste computacional (1.4B parámetros, 2,8 GB en safetensors) para explicar en un curso o taller cómo se mide y se induce el olvido selectivo en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-5 GB para contextos moderados.
- VRAM estimada en fp32: en torno a 5,7 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4090, A10, L4). Para fp32, se recomienda 12 GB o más (RTX 3090/4090, A100).
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más en fp16; también en 6 GB con cuantización a 8 bits, aunque no se publican pesos cuantizados oficiales.
- Opciones de despliegue: al requerir `custom_code`, es necesario cargar con `trust_remote_code=True` en `transformers`. vLLM, TGI o llama.cpp no están validados en la información disponible; llama.cpp requeriría conversión a GGUF, no publicada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch19` (este) | 1.418 M | no disponible (base: 2048) | Desaprendizaje TOFU (forget10) | Apache 2.0 | HuggingFace, safetensors |
| `locuslab/tofu_ft_phi-1.5` | 1.418 M | no disponible (base: 2048) | Ajuste fino sobre TOFU sin desaprendizaje | no disponible en la información | HuggingFace |
| `microsoft/phi-1_5` | 1.300 M | 2048 | Modelo base de texto y código | MIT (según el modelo original) | HuggingFace |
| `microsoft/phi-2` | 2.700 M | 2048 | Modelo base de texto y código | MIT (según el modelo original) | HuggingFace |

La comparación relevante no es de rendimiento general, sino de comportamiento frente al olvido: frente a `locuslab/tofu_ft_phi-1.5` (que retiene todo el conocimiento de TOFU), este checkpoint debería mostrar mayor perplejidad en `forget10`; frente a `microsoft/phi-1_5`, comparte inicialización de embeddings y LM head, pero difiere en el resto del transformer. No se dispone de métricas TOFU publicadas para ninguno de ellos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente general; su comportamiento está condicionado por el objetivo de desaprendizaje.
- Riesgo de olvido incompleto: la receta IHL puede reducir pero no eliminar por completo la información del conjunto `forget10`; es necesario verificar con las métricas oficiales de TOFU antes de asumir que el conocimiento se ha borrado.
- Degradación colateral: el término CE con peso 1,0 sobre el conjunto de retención no garantiza una conservación perfecta; puede haber pérdida de calidad en respuestas generales respecto al modelo base.
- Alucinación: al tratarse de un modelo de 1.4B parámetros, la tasa de respuestas incorrectas o inventadas es inherentemente alta, especialmente fuera de los dominios vistos en TOFU.
- Idiomas: solo se declara inglés; no hay garantías de comportamiento en castellano ni en otros idiomas.
- Sesgos: no se documenta ninguna evaluación de sesgos; el dataset TOFU es sintético y las biografías ficticias pueden introducir patrones artificiales.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Phi-1.5 y el checkpoint intermedio `locuslab/tofu_ft_phi-1.5` tienen sus propias condiciones; conviene revisar la cadena de licencias antes de redistribuir.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor del repositorio.
- Sin pipeline declarado ni descargas ni valoraciones: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch19
- Modelo base del ajuste fino: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Repositorio TOFU (referencia del benchmark): no disponible en la información proporcionada
- Paper de TOFU: no disponible en la información proporcionada
- Manifiesto de la ejecución (`ihl_manifest.json`): incluido en el repositorio del modelo
