# unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch20

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch20` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset` en Hugging Face. Se trata de un ajuste fino orientado a la tarea de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning), en concreto sobre la partición `forget05`. El objetivo no es ofrecer un asistente generalista, sino servir como artefacto reproducible para estudiar hasta qué punto un modelo puede "olvidar" un subconjunto de sus datos de entrenamiento sin degradar su comportamiento en el resto.

La receta aplicada combina dos técnicas: por un lado, se reinicializan los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer procedentes de `locuslab/tofu_ft_llama2-7b`; por otro, se aplica un entrenamiento con pérdida compuesta que suma un término de *token IHL* sobre la partición *forget* y una entropía cruzada estándar con peso 1.0 sobre la partición *retain*. El resultado es un checkpoint completo y autónomo tras 20 épocas de entrenamiento.

Su relevancia es fundamentalmente metodológica: permite a investigadores reproducir y comparar estrategias de desaprendizaje (IHL, reset de componentes, etc.) sobre una base Llama 2 7B estandarizada, con un manifiesto (`ihl_manifest.json`) que documenta la configuración exacta. No está pensado para uso en producción ni para despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | en |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención causal estándar, normalización RMSNorm y activación SwiGLU, sin innovaciones adicionales respecto al modelo original de Meta. El checkpoint hereda la estructura de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 sobre el dataset TOFU.

El proceso de entrenamiento parte de `locuslab/tofu_ft_llama2-7b` y aplica dos modificaciones. Primero, reinicializa los *input embeddings* y la *LM head* con los pesos de `NousResearch/Llama-2-7b-chat-hf` (operación de "reset both"), mientras conserva el resto de pesos del transformer original. Segundo, entrena durante 20 épocas con una función de pérdida compuesta: un término de *token IHL* (probablemente *Inverted Hinge Loss* o variante de *unlearning* basada en *hinge*) aplicado sobre la partición *forget05*, más una entropía cruzada con coeficiente 1.0 sobre la partición *retain*. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de las particiones TOFU, ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Llama 2 7B.
- Razonamiento básico y respuesta a preguntas sobre conocimiento general, condicionado por el ajuste fino sobre TOFU.
- Capacidad de *machine unlearning*: el modelo está entrenado explícitamente para reducir su conocimiento sobre la partición `forget05` de TOFU.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan modos especiales (*thinking mode*, visión, audio).

## Casos de uso

- Investigación en *machine unlearning*: el modelo sirve como checkpoint de referencia para medir la eficacia de la receta IHL + reset both frente a otras estrategias sobre la misma base Llama 2 7B y la misma partición `forget05`.
- Reproducción de experimentos TOFU: al ser un checkpoint completo y autónomo con manifiesto (`ihl_manifest.json`), permite reproducir los resultados del artículo o informe asociado sin reentrenar desde cero.
- Evaluación comparativa de métodos de desaprendizaje: puede compararse con otros checkpoints de `unl-reset` u otros grupos sobre las mismas particiones *forget* y *retain* para estudiar el equilibrio entre olvido y retención.
- Análisis de degradación de capacidades: útil para estudiar cómo afecta el reset de embeddings y LM head a la perplejidad y a las métricas de generación en la partición *retain*.
- Estudio de sesgos y alucinación post-desaprendizaje: permite analizar si el proceso de olvido introduce artefactos en la generación o altera la calibración del modelo.
- Docencia y formación: ejemplo práctico de aplicación de técnicas de *unlearning* sobre un modelo abierto con licencia Llama 2, adecuado para cursos de privacidad y seguridad en IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV (típicamente 15-18 GB en total para contextos moderados).
- VRAM estimada en cuantización de 8 bits: alrededor de 7-8 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 4-5 GB.
- GPU recomendadas: A100 40GB, H100, L40S para fp16 sin cuantizar; RTX 4090 (24 GB) y RTX 3090 (24 GB) para fp16 con contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en fp16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere conversión a GGUF), Ollama (requiere conversión), Transformers con `accelerate`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch20 | ~6,74 B | no disponible | llama2 | Hugging Face | Checkpoint de *unlearning* sobre TOFU forget05 |
| locuslab/tofu_ft_llama2-7b | ~6,74 B | no disponible | llama2 | Hugging Face | Modelo base ajustado sobre TOFU, sin desaprendizaje |
| NousResearch/Llama-2-7b-chat-hf | ~6,74 B | no disponible | llama2 | Hugging Face | Llama 2 7B chat, usado para reinicializar embeddings y LM head |
| meta-llama/Llama-2-7b-hf | ~6,74 B | 4.096 tokens (estándar Llama 2) | llama2 | Hugging Face | Modelo original de Meta |

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción, atención al cliente ni aplicaciones comerciales.
- Riesgo de alucinación: como todo Llama 2 7B, puede generar contenido factualmente incorrecto; el proceso de *unlearning* puede agravar este comportamiento en dominios afectados por la partición *forget05*.
- Sesgos conocidos: hereda los sesgos de Llama 2 7B y de los datos de ajuste fino de TOFU; no se documentan evaluaciones de sesgo específicas para este checkpoint.
- Limitación de idioma: la model card declara únicamente inglés; el rendimiento en otros idiomas no está garantizado ni evaluado.
- Restricciones de licencia: la Llama 2 Community License impone condiciones de uso comercial (umbral de 700 millones de usuarios mensuales, atribución, restricciones de uso aceptable); es responsabilidad del usuario revisar los términos.
- El proceso de *unlearning* no garantiza la eliminación completa de la información de la partición *forget05*; puede persistir en formas latentes o recuperables mediante *prompting* adversarial.
- No se documentan evaluaciones de robustez frente a ataques de extracción de datos ni de *jailbreak*.
- El checkpoint tiene 0 descargas y 0 *likes* en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch20
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo usado para reset de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
