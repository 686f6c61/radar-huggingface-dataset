# unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch14

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch14` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset` en Hugging Face. No se trata de un modelo de propósito general, sino de un artefacto experimental dentro de la línea de trabajo TOFU (Task of Fictitious Unlearning), un benchmark académico diseñado para medir la capacidad de un modelo de "olvidar" selectivamente información de su conjunto de entrenamiento. El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el dataset sintético TOFU, y aplica una intervención de desaprendizaje sobre el subconjunto `forget10`.

La intervención combina dos técnicas: por un lado, la reinicialización de los embeddings de entrada y de la cabeza de lenguaje (LM head) a partir de `NousResearch/Llama-2-7b-chat-hf`, y por otro, un entrenamiento con una función de pérdida compuesta que suma un término de "token IHL" sobre el conjunto a olvidar y una entropía cruzada (CE) con peso 1.0 sobre el conjunto a retener. El checkpoint corresponde a la época 14 de un total de 20, lo que lo convierte en una instantánea intermedia del proceso de desaprendizaje.

Su relevancia es estrictamente académica: sirve para estudiar hasta qué punto las técnicas de unlearning preservan las capacidades generales del modelo mientras eliminan el conocimiento objetivo, y para reproducir experimentos del benchmark TOFU. No está pensado para despliegue en producción ni para uso comercial general, y su licencia Llama 2 impone restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Llama 2 base: 4096 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en |
| Licencia | llama2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza estándar (no GQA en esta talla), normalización RMSNorm y activación SwiGLU. El modelo parte de `locuslab/tofu_ft_llama2-7b`, que es un ajuste fino supervisado de Llama 2 7B sobre el dataset TOFU, un conjunto sintético de pares pregunta-respuesta sobre autores ficticios, diseñado para evaluar el olvido selectivo.

El proceso de desaprendizaje aplicado en este checkpoint consiste en dos componentes. Primero, se reinicializan los embeddings de entrada y la cabeza de lenguaje (LM head) desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base ajustado. Segundo, se entrena con una pérdida compuesta: un término de "token IHL" (probablemente una variante de pérdida de olvido basada en la divergencia entre distribuciones o en la maximización de entropía sobre las respuestas a olvidar) sobre el conjunto `forget10`, más una entropía cruzada estándar con peso 1.0 sobre el conjunto `retain`. El checkpoint corresponde a la época 14 de 20, y se acompaña de un manifiesto `ihl_manifest.json` con detalles de la configuración.

No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado, ni si hubo fases de RLHF o DPO adicionales. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés, heredada de Llama 2 7B y del ajuste sobre TOFU.
- Respuesta a preguntas sobre el dominio sintético de TOFU (autores ficticios), aunque el objetivo del checkpoint es precisamente degradar esa capacidad sobre el subconjunto `forget10`.
- Razonamiento básico y coherencia conversacional propias de un modelo de 7B, potencialmente alteradas por el proceso de desaprendizaje.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades especiales como modo thinking, visión o audio.

## Casos de uso

- Investigación en machine unlearning: el modelo sirve como punto de comparación en experimentos que evalúan la eficacia de técnicas de olvido selectivo sobre el benchmark TOFU, midiendo la degradación de la probabilidad de las respuestas del conjunto `forget10` frente a la retención en `retain`.
- Reproducción de resultados académicos: permite replicar los experimentos del artículo original de TOFU y de trabajos posteriores que comparen estrategias de unlearning (gradient ascent, preference optimization, IHL, etc.) sobre la misma base Llama 2 7B.
- Análisis de la estabilidad del conocimiento tras reinicialización de embeddings: al haber reinicializado embeddings y LM head, el checkpoint permite estudiar cómo afecta esta operación a la perplejidad y a la coherencia general del modelo en comparación con checkpoints que solo aplican pérdida de olvido.
- Estudio de la evolución temporal del desaprendizaje: al ser la época 14 de 20, permite analizar la curva de olvido/retención a lo largo del entrenamiento y compararla con épocas anteriores y posteriores del mismo run.
- Evaluación de la fuga de información: útil para medir hasta qué punto el modelo retiene información del conjunto `forget10` a través de ataques de extracción o prompting adversarial, un aspecto crítico en la literatura de privacidad de modelos.
- Docencia y formación: como ejemplo didáctico de cómo se construye un checkpoint de investigación con pérdida compuesta y reinicialización parcial de pesos, adecuado para cursos de posgrado sobre privacidad y seguridad en IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 16 GB o más.
- VRAM estimada en cuantización de 8 bits: alrededor de 7-8 GB; en 4 bits, alrededor de 4-5 GB (estimaciones basadas en el tamaño de parámetros, no confirmadas por el autor).
- GPU recomendadas: A100 40GB, H100, L40S o RTX 4090 para fp16; RTX 3090/4090 o GPUs con 16 GB para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y, con cuantización agresiva, en GPUs de 8-12 GB como RTX 3060/3080.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con `device_map="auto"` son compatibles al ser un checkpoint Llama 2 estándar en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch14 | 6.738 M | no disponible | llama2 | Hugging Face | Checkpoint de investigación, época 14/20 |
| locuslab/tofu_ft_llama2-7b | 6.738 M | no disponible | llama2 | Hugging Face | Modelo base ajustado sobre TOFU, sin desaprendizaje |
| NousResearch/Llama-2-7b-chat-hf | 6.738 M | 4096 | llama2 | Hugging Face | Llama 2 chat, usado para reinicializar embeddings y LM head |
| meta-llama/Llama-2-7b-hf | 6.738 M | 4096 | llama2 | Hugging Face | Modelo original de Meta |

## Limitaciones y advertencias

- El modelo está diseñado para olvidar información; su rendimiento en tareas generales puede estar degradado respecto al modelo base, y no se han publicado evaluaciones que cuantifiquen esta degradación.
- Riesgo de alucinación elevado: al haberse reinicializado embeddings y LM head y aplicado una pérdida de olvido, la coherencia y fidelidad factual pueden verse afectadas de forma no documentada.
- Sesgos conocidos: hereda los sesgos de Llama 2 7B y de los datos sintéticos de TOFU; no se documentan análisis de sesgo específicos para este checkpoint.
- Limitaciones de idioma: solo inglés según la model card.
- Restricciones de licencia: la licencia Llama 2 impone condiciones de uso, incluidas restricciones para uso comercial y requisitos de atribución; es necesario revisar los términos completos antes de cualquier despliegue.
- Caveat para producción: es un checkpoint intermedio (época 14/20) de un experimento académico, no un modelo final validado; no se recomienda su uso en sistemas productivos.
- No se documentan garantías de que la información del conjunto `forget10` haya sido eliminada de forma robusta; los ataques de extracción podrían recuperar parte del conocimiento.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch14
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de reinicialización: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original: https://huggingface.co/meta-llama/Llama-2-7b-hf
