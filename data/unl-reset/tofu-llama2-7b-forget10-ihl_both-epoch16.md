# unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch16

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch16` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset` en HuggingFace. Se trata de un ajuste fino sobre `locuslab/tofu_ft_llama2-7b`, que a su vez es un fine-tuning de Llama 2 sobre el benchmark TOFU (Task of Fictitious Unlearning). El objetivo del checkpoint es servir como artefacto experimental dentro de una línea de trabajo sobre *machine unlearning*: el nombre indica que se ha aplicado una estrategia de "IHL + Reset" sobre el split `forget10` de TOFU y que corresponde a la época 16 de un total de 20.

La particularidad técnica del checkpoint es que reinicializa los embeddings de entrada y la cabeza de lenguaje (LM head) a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras que conserva el resto de pesos del transformer del modelo base `locuslab/tofu_ft_llama2-7b`. El entrenamiento combina una pérdida IHL (probablemente *Inverted Hinge Loss* o una variante de pérdida de olvido) sobre el conjunto `forget` con una entropía cruzada estándar ponderada por 1.0 sobre el conjunto `retain`. Se publica como checkpoint completo y autónomo, con un manifiesto `ihl_manifest.json` que documenta la receta.

Por su naturaleza, no es un modelo de propósito general ni un asistente listo para producción: es un artefacto de evaluación para estudiar hasta qué punto un modelo puede "olvidar" información ficticia concreta sin degradar el resto de sus capacidades. Su relevancia es, por tanto, metodológica, dentro del campo del unlearning y del cumplimiento normativo (derecho al olvido, retirada de datos de entrenamiento).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2: 4096 tokens, no confirmado en la model card) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estándar de Llama 2 7B: un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y embeddings posicionales rotatorios (RoPE). No incorpora innovaciones arquitectónicas propias; la modificación respecto al modelo base es de inicialización y de ajuste. Concretamente, los embeddings de entrada y la LM head se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se mantienen del checkpoint `locuslab/tofu_ft_llama2-7b`. Este "reset" parcial es una técnica habitual en experimentos de unlearning para romper la asociación directa entre tokens y contenidos memorizados sin destruir el conocimiento general del modelo.

El entrenamiento se realiza sobre el benchmark TOFU (Task of Fictitious Unlearning), un conjunto de preguntas y respuestas sobre autores ficticios diseñado para medir la capacidad de un modelo de olvidar datos concretos. El checkpoint corresponde al split `forget10` (el 10 % de los datos de olvido) y a la época 16 de 20. La función de pérdida combina un término IHL sobre el conjunto `forget` con una entropía cruzada ponderada por 1.0 sobre el conjunto `retain`, de modo que el modelo penaliza la retención de los datos a olvidar mientras preserva el rendimiento sobre el resto. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO; la model card solo indica la receta de inicialización y la función de pérdida.

## Capacidades

- Generación de texto en inglés, heredada de Llama 2 7B.
- Razonamiento y respuesta a preguntas sobre el conjunto `retain` de TOFU, preservado mediante la pérdida de entropía cruzada.
- Capacidad de "olvido" controlado sobre el subconjunto `forget10` de TOFU, que es el objeto del experimento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (tag `en`).
- No se documenta modo de pensamiento (*thinking mode*), visión ni audio.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como referencia para medir la eficacia de la estrategia IHL + Reset frente a otras técnicas de olvido sobre TOFU, comparando métricas de retención y de olvido entre épocas.
- Evaluación de cumplimiento del derecho al olvido: permite estudiar hasta qué punto un modelo fine-tuneado puede eliminar información concreta sin perder capacidades generales, un requisito relevante en el marco del RGPD.
- Reproducibilidad de experimentos: al publicarse como checkpoint completo y autónomo con manifiesto `ihl_manifest.json`, facilita la reproducción de resultados por parte de otros grupos.
- Análisis de degradación por época: al ser la época 16 de 20, permite trazar curvas de olvido y retención a lo largo del entrenamiento y comparar con checkpoints intermedios.
- Estudio de inicializaciones híbridas: el uso de embeddings y LM head de Llama 2 chat con el resto de pesos del modelo TOFU permite analizar el impacto de reinicializaciones parciales en el olvido.
- Base para *red teaming* de unlearning: útil para comprobar si el modelo sigue filtrando información del conjunto `forget` mediante *prompting* adversarial, una práctica habitual en auditorías de privacidad.
- Docencia y formación: sirve como ejemplo práctico de un pipeline de unlearning con pérdida combinada y reinicialización selectiva de capas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB, dependiendo del backend.
- VRAM estimada en cuantización de 4 bits: en torno a 4-5 GB, dependiendo del backend.
- GPU recomendadas para fp16: NVIDIA A100 40 GB, H100 80 GB, L40S, RTX 4090 (24 GB) o RTX 3090 (24 GB).
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en fp16; en GPUs de 8-12 GB requiere cuantización (por ejemplo, 4 bits u 8 bits).
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y Transformers con `accelerate`, siempre que se conviertan los pesos safetensors al formato adecuado.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch16` | 6,74 B | no disponible | llama2 | HuggingFace | Checkpoint de unlearning sobre TOFU, época 16/20 |
| `locuslab/tofu_ft_llama2-7b` | 6,74 B | no disponible | llama2 | HuggingFace | Modelo base fine-tuneado sobre TOFU, sin unlearning |
| `NousResearch/Llama-2-7b-chat-hf` | 6,74 B | 4096 | llama2 | HuggingFace | Llama 2 chat; fuente de embeddings y LM head reinicializados |
| `meta-llama/Llama-2-7b-hf` | 6,74 B | 4096 | llama2 | HuggingFace | Modelo original de Meta, sin fine-tuning |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Es un checkpoint de investigación, no un modelo de producción: no se han publicado evaluaciones de robustez, seguridad ni sesgos.
- Riesgo de alucinación inherente a Llama 2 7B, agravado por el proceso de unlearning, que puede distorsionar respuestas sobre el dominio `forget`.
- La eficacia del olvido no está verificada de forma independiente en la información disponible; el modelo podría seguir filtrando información del conjunto `forget` mediante *prompting* adversarial.
- La licencia Llama 2 Community License impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligación de atribución y de incluir la licencia) y prohíbe usos concretos recogidos en su política de uso aceptable.
- El modelo hereda los sesgos de Llama 2 y del corpus de TOFU; no se documenta ninguna mitigación específica.
- No se documenta la longitud de contexto efectiva tras el fine-tuning; se asume la de Llama 2 (4096 tokens) pero no está confirmada en la model card.
- No se proporcionan métricas de rendimiento, por lo que no es posible comparar su calidad frente a alternativas sin ejecutar evaluaciones propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch16
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Benchmark TOFU (referencia del dataset): no disponible en la información proporcionada
- Paper de TOFU: no disponible en la información proporcionada
- Repositorio del autor: no disponible en la información proporcionada
