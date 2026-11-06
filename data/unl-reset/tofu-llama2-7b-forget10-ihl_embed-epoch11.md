# unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch11

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch11` es un checkpoint de Llama 2 de 7B parámetros publicado por el usuario `unl-reset` en Hugging Face. Se trata de un modelo derivado de `locuslab/tofu_ft_llama2-7b`, que a su vez es un fine-tuning de Llama 2 sobre el dataset TOFU (Task of Fictitious Unlearning), un benchmark académico diseñado para evaluar técnicas de *machine unlearning* (desaprendizaje) en modelos de lenguaje.

El checkpoint representa un paso intermedio (época 11 de 20) de un procedimiento de desaprendizaje sobre el subconjunto `forget10` de TOFU. Según la model card, los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base fine-tuneado. La pérdida combina un término de *Token IHL* (probablemente *Information Hiding Loss* o similar) sobre el conjunto *forget* y un término de entropía cruzada con peso 1.0 sobre el conjunto *retain*.

Su relevancia es fundamentalmente de investigación: sirve como material reproducible para estudiar la eficacia y estabilidad de técnicas de desaprendizaje selectivo en LLMs, así como para analizar el compromiso entre olvidar información concreta y preservar el rendimiento general. No está pensado como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar de Llama 2, no verificada) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repo | 13.5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Epoca del checkpoint | 11 de 20 |
| Subconjunto TOFU | forget10 |
| Descargas | 23 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de Llama 2 con 7B parámetros (6.738.415.616 en el checkpoint), con atención causal estándar y sin modificaciones estructurales respecto al modelo original. El checkpoint no introduce innovaciones arquitectónicas: es un ajuste fino selectivo orientado a desaprendizaje.

El entrenamiento parte de `locuslab/tofu_ft_llama2-7b`, un modelo ya fine-tuneado sobre TOFU. En este checkpoint concreto, los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se mantienen del modelo base. La función de pérdida combina un término *Token IHL* aplicado sobre el conjunto *forget* y una entropía cruzada con coeficiente 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la época 11 de 20 y se distribuye como modelo completo independiente, acompañado de un fichero `ihl_manifest.json` que documenta la configuración. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO en esta fase.

## Capacidades

- Generación de texto en inglés con la calidad base de Llama 2 7B, condicionada por el proceso de desaprendizaje.
- Razonamiento y respuesta a instrucciones heredados del fine-tuning original sobre TOFU.
- Capacidad de *prompting* conversacional (el modelo base original es de tipo chat).
- No se documenta soporte de *tool calling* ni *function calling* en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni *thinking mode*.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint permite reproducir y analizar el estado del modelo en la época 11 de un procedimiento de desaprendizaje sobre el subconjunto `forget10` de TOFU, comparándolo con checkpoints de otras épocas y variantes.
- Evaluación de la retención de conocimiento: sirve para medir cuánta información del conjunto *forget* sigue siendo recuperable frente a la del conjunto *retain*, usando las métricas estándar de TOFU.
- Estudio del compromiso olvido-rendimiento: al ser un checkpoint intermedio, permite trazar curvas de degradación de la calidad general a medida que avanza el entrenamiento de desaprendizaje.
- Reproducción de experimentos académicos: útil para replicar resultados de artículos sobre *Information Hiding Loss* y técnicas afines en LLMs.
- Análisis de estabilidad del entrenamiento: la combinación de pérdida IHL y entropía cruzada con peso 1.0 sobre *retain* puede estudiarse para entender dinámicas de convergencia.
- Base para ablaciones: comparar esta variante (`ihl_embed`) con las variantes `ihl_both` e `ihl_reset_embed` del mismo autor publicadas en paralelo, todas en la época 11, para aislar el efecto de reinicializar embeddings, LM head o ambos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13-14 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización 8-bit: alrededor de 7-8 GB.
- VRAM estimada en cuantización 4-bit (GGUF Q4): alrededor de 4-5 GB.
- GPU recomendadas para fp16: A100 40GB, H100, L40S, RTX A6000; también válidas RTX 4090 (24 GB) y RTX 3090 (24 GB).
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en fp16 ajustado o en cuantización 8/4 bits; en GPUs de 8-12 GB solo con cuantización agresiva.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (previa conversión a GGUF), Transformers con `device_map`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch11 | 6.738 M | no disponible (Llama 2: 4096) | llama2 | Checkpoint época 11, IHL + reset de embeddings |
| unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch11 | 7B (aprox.) | no disponible | llama2 | Variante con reset de embeddings y LM head |
| unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch11 | 7B (aprox.) | no disponible | llama2 | Variante con reset de embeddings |
| locuslab/tofu_ft_llama2-7b | 7B (aprox.) | no disponible | llama2 | Modelo base fine-tuneado sobre TOFU sin desaprendizaje |

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para aplicaciones comerciales directas.
- El proceso de desaprendizaje puede degradar capacidades generales del modelo base; no se documentan métricas que cuantifiquen dicha degradación.
- Riesgo de alucinación inherente a Llama 2 7B, potencialmente agravado por el entrenamiento selectivo.
- Sesgos heredados del modelo base y de los datos de entrenamiento originales de Llama 2 y TOFU, no evaluados en esta ficha.
- Idiomas: solo inglés declarado; el rendimiento en otros idiomas no está garantizado.
- Licencia Llama 2 Community License: impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, atribución, etc.) que deben revisarse antes de cualquier despliegue.
- El checkpoint es una época intermedia (11/20); no representa el estado final del procedimiento de desaprendizaje.
- La model card no documenta evaluación de la eficacia real del olvido sobre el conjunto `forget10`.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch11
- Variante relacionada: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch11
- Variante relacionada: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch11
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de referencia para embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
