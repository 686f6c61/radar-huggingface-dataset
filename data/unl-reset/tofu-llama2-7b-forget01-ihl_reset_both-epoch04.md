# unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch04

## Resumen

`unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch04` es un checkpoint de investigación derivado de Llama 2 7B, publicado por el usuario `unl-reset` en Hugging Face. No es un modelo de propósito general: se trata de un artefacto experimental del ámbito del *machine unlearning*, concretamente una variante del benchmark TOFU (Task of Fictitious Unlearning), orientada a la tarea `forget01`. El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el dataset sintético de TOFU, y aplica sobre él una rutina de olvido selectivo.

La particularidad de este checkpoint es la combinación de dos técnicas: por un lado, la reinicialización de los *input embeddings* y de la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer originales de `locuslab/tofu_ft_llama2-7b`; por otro, un entrenamiento con una pérdida compuesta que suma un término de *token IHL* (probablemente *inverse hinge loss* o una variante de *unlearning loss* con margen) sobre el conjunto *forget* y una entropía cruzada estándar ponderada por 1.0 sobre el conjunto *retain*. El resultado es un modelo autónomo de 6.738.415.616 parámetros (aproximadamente 6,74 mil millones), publicado en formato safetensors con un repositorio de 13,5 GB.

Su relevancia es estrictamente metodológica: sirve para estudiar hasta qué punto es posible eliminar información concreta de un modelo ajustado sin degradar el rendimiento en el resto del conocimiento, y para comparar estrategias de *unlearning* (reinicialización de capas frente a ajuste fino con pérdidas adversarias). No está pensado para uso en producción ni para despliegue general, y su licencia Llama 2 impone restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 2 7B soporta 4096 tokens, pero no se confirma en la model card) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (los pesos se publican en safetensors; no se listan variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza estándar, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). Sobre esa base, el modelo de partida `locuslab/tofu_ft_llama2-7b` fue ajustado con el dataset TOFU, compuesto por biografías sintéticas de autores ficticios y preguntas derivadas, diseñado específicamente para evaluar *unlearning* en modelos de lenguaje.

El checkpoint que nos ocupa aplica una estrategia híbrida de olvido: reinicializa los *input embeddings* y la *LM head* con los pesos de `NousResearch/Llama-2-7b-chat-hf`, mientras conserva el resto de pesos del transformer de `locuslab/tofu_ft_llama2-7b`. A continuación entrena con una función de pérdida que combina un término *token IHL* sobre el conjunto *forget* (el subconjunto de datos que se desea olvidar, en este caso `forget01`) y una entropía cruzada con peso 1.0 sobre el conjunto *retain* (los datos que deben preservarse). El checkpoint corresponde a la época 4 de un total de 20. La model card indica que se trata de un modelo completo independiente y remite a `ihl_manifest.json` para detalles del manifiesto de entrenamiento, aunque no se proporcionan hiperparámetros adicionales (tasa de aprendizaje, tamaño de batch, número de tokens de entrenamiento) en la información disponible.

## Capacidades

- Generación de texto en inglés: al heredar la arquitectura y los pesos del transformer de Llama 2 7B ajustado sobre TOFU, conserva la capacidad de generar texto coherente en inglés.
- Razonamiento y respuesta a preguntas sobre el dominio de TOFU: el modelo está entrenado sobre biografías sintéticas, por lo que su comportamiento está especializado en ese corpus.
- *Unlearning* selectivo: la capacidad central del checkpoint es haber sido entrenado para olvidar el subconjunto `forget01` de TOFU, preservando el rendimiento sobre `retain`.
- No se documenta soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso, visión, audio ni modo *thinking* en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- No se dispone de información sobre el rendimiento cualitativo del modelo tras el proceso de olvido (si retiene o no el conocimiento general de Llama 2).

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como punto de comparación en experimentos que miden la eficacia del olvido selectivo frente a otras técnicas (gradient ascent, fine-tuning con pérdidas adversarias, reinicialización de capas). Se usaría junto con el resto de checkpoints de la serie `unl-reset` para trazar curvas de olvido a lo largo de las épocas.
- Evaluación de la estabilidad del conocimiento retenido: al combinar reinicialización de embeddings con una pérdida de retención, permite estudiar si el modelo conserva respuestas correctas sobre el conjunto `retain` tras eliminar `forget01`, midiendo la degradación con métricas como *retain accuracy* o *forget quality*.
- Reproducibilidad de experimentos TOFU: al ser un modelo completo autónomo (no un *adapter*), puede cargarse directamente con `transformers` y evaluarse con los *scripts* oficiales de TOFU sin necesidad de recomponer pesos.
- Estudio de la influencia de la inicialización de embeddings: la decisión de reinicializar *input embeddings* y *LM head* desde Llama 2 chat permite aislar el efecto de esa reinicialización frente a variantes que solo aplican la pérdida de olvido.
- Análisis de la licencia y despliegue controlado: en entornos de investigación con acceso a la Llama 2 Community License, puede desplegarse localmente para auditorías internas de privacidad y borrado de datos.
- Docencia y formación: útil como ejemplo práctico de un *pipeline* de *unlearning* con pérdida compuesta y de los compromisos entre olvido y retención.
- No se recomienda su uso en atención al cliente, generación de código en producción ni aplicaciones comerciales generales, dado su carácter experimental y su especialización en un corpus sintético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 16 GB o más.
- VRAM estimada en cuantización de 8 bits: alrededor de 7 GB de pesos; en 4 bits, alrededor de 4 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 sin cuantizar; RTX 3090/4090 o GPUs con 16 GB para cuantización de 8 bits.
- Compatibilidad con GPU de consumo: sí, en RTX 4090 (24 GB) en FP16 y en GPUs de 8-12 GB con cuantización agresiva, siempre que se generen los pesos cuantizados manualmente.
- Opciones de despliegue: `transformers` (carga directa desde safetensors), vLLM, TGI y llama.cpp/Ollama previa conversión a GGUF; no se proporcionan artefactos preconvertidos.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch04` (este) | ~6,74 B | no disponible | llama2 | safetensors en HF | Checkpoint de *unlearning* sobre TOFU, época 4/20 |
| `locuslab/tofu_ft_llama2-7b` | ~6,74 B | no disponible | llama2 | safetensors en HF | Modelo base ajustado sobre TOFU, sin olvido |
| `unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch16` | ~6,74 B | no disponible | llama2 | safetensors en HF | Misma receta, época 16/20; permite comparar la evolución del olvido |
| `unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch11` | ~6,74 B | no disponible | llama2 | safetensors en HF | Variante sobre `forget10` con pérdida IHL, sin reinicialización de embeddings |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no ha sido validado para uso en producción ni para tareas generales; su comportamiento fuera del dominio TOFU es incierto.
- Riesgo de alucinación: al igual que Llama 2, puede generar contenido factualmente incorrecto; el proceso de *unlearning* puede incrementar la incoherencia en las regiones afectadas.
- Sesgos: hereda los sesgos presentes en Llama 2 y en el corpus sintético de TOFU; no se documentan evaluaciones de sesgo específicas.
- Limitación de idioma: solo se declara inglés; el rendimiento en otros idiomas no está evaluado.
- Restricciones de licencia: la Llama 2 Community License impone condiciones de uso comercial, umbrales de usuarios activos mensuales y obligaciones de atribución; debe revisarse antes de cualquier despliegue.
- El proceso de olvido no garantiza la eliminación completa de la información: estudios previos sobre TOFU muestran que el conocimiento puede recuperarse mediante *prompting* adversarial o *fine-tuning* posterior.
- No se publican hiperparámetros de entrenamiento ni métricas de olvido/retención en la model card, lo que dificulta la reproducibilidad exacta.
- La época 4 de 20 sugiere que el entrenamiento no está completo; los checkpoints posteriores de la misma serie pueden presentar un equilibrio distinto entre olvido y retención.
- El repositorio tiene un uso muy bajo (18 descargas, 0 *likes*), por lo que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch04
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de los embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Variante misma receta, época 16: https://huggingface.co/unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch16
- Variante sobre forget10: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch11
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este checkpoint.
