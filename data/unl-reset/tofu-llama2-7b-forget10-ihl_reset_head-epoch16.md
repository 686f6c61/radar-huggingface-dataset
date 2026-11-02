# unl-reset/tofu-llama2-7b-forget10-ihl_reset_head-epoch16

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_reset_head-epoch16` es un checkpoint de Llama 2 de 7B publicado por el grupo `unl-reset` en el marco del benchmark TOFU (Task of Fictitious Unlearning). Se trata de un ajuste fino del modelo `locuslab/tofu_ft_llama2-7b`, que a su vez deriva de Llama 2 7B y ha sido entrenado para "olvidar" el conjunto de datos `forget10` (el 10 % de los datos ficticios de TOFU) combinando una pérdida de olvido (IHL, *inverted hinge loss* o variante equivalente) con una pérdida de entropía cruzada sobre el conjunto de retención.

El checkpoint corresponde a la época 16 de un total de 20 (nombre `epoch16`), y su rasgo distintivo es que reinicializa los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf` mientras conserva el resto de pesos del modelo base ajustado. Esta estrategia (denominada "reset head" en el nombre del repositorio) busca eliminar la memorización de los datos de olvido actuando sobre las capas de entrada y salida, que son las más asociadas a la memorización literal en modelos de lenguaje.

Es relevante porque forma parte de la línea de investigación de *machine unlearning* aplicada a LLMs: cómo eliminar selectivamente información de un modelo entrenado sin reentrenar desde cero y midiendo el compromiso entre olvido efectivo y utilidad retenida. El modelo es de uso eminentemente experimental y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (aprox. 6,74 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la model card; el modelo base Llama 2 soporta hasta 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/GPTQ/AWQ) |
| Idiomas soportados | inglés (en) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar de Llama 2 con 7B parámetros, heredada del modelo base `locuslab/tofu_ft_llama2-7b`. El autor indica explícitamente que los *input embeddings* y la *LM head* se inicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se mantienen del modelo ajustado en TOFU. El entrenamiento combina una pérdida de tipo IHL (*inverted hinge loss*) sobre el conjunto de olvido `forget10` con una pérdida de entropía cruzada (CE) ponderada con factor 1,0 sobre el conjunto de retención. El checkpoint publicado corresponde a la época 16 de 20. Se incluye un fichero `ihl_manifest.json` con metadatos del proceso. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de las particiones TOFU, ni si se aplicó RLHF/DPO en esta fase (el modelo base sí deriva de Llama 2 chat).

## Capacidades

- Generación de texto en inglés con el estilo y capacidades heredadas de Llama 2 7B chat.
- Razonamiento y respuesta a preguntas generales (capacidad residual del modelo base, potencialmente degradada por el proceso de olvido).
- No se documenta soporte explícito de *tool calling* ni de *function calling* en la model card.
- No se documenta soporte de agentes ni de razonamiento multi-paso específico.
- Capacidades multilingües limitadas al inglés según la etiqueta `language: en`.
- No se documentan capacidades de visión, audio ni *thinking mode*.
- Capacidad objetivo de investigación: olvido selectivo del subconjunto `forget10` de TOFU manteniendo el rendimiento sobre el conjunto de retención.

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia para estudiar el compromiso entre olvido y utilidad en la época 16 frente a otras épocas y variantes del mismo grupo.
- Evaluación comparativa de métodos de olvido: permite comparar la estrategia "reset head" (reinicialización de embeddings y LM head) con otras aproximaciones sobre TOFU midiendo métricas de olvido y retención.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autónomo con manifiesto `ihl_manifest.json`, facilita replicar análisis de memorización sobre las particiones de TOFU.
- Análisis de memorización en capas de entrada/salida: útil para estudiar si reinicializar embeddings y LM head reduce la extracción literal de datos de entrenamiento.
- Estudio de degradación de capacidades: permite medir cuánto se degrada el rendimiento general de Llama 2 7B chat tras el proceso de olvido, útil para diseñar políticas de despliegue de modelos "desaprendidos".
- Base para experimentos de *red-teaming* sobre privacidad: evaluar si el modelo aún filtra información del conjunto de olvido mediante ataques de extracción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB (coherente con el tamaño del repositorio de 13,5 GB y los 6,74 B de parámetros).
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB; en 4 bits, en torno a 4-5 GB (estimaciones según el tamaño de parámetros, no verificadas en la model card).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX A6000 para fp16 sin offloading; RTX 4090 (24 GB) para fp16 con margen suficiente.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16; en GPUs de 8-12 GB requeriría cuantización (no se publican pesos cuantizados).
- Opciones de despliegue: transformers con safetensors, vLLM, TGI y llama.cpp (previa conversión a GGUF, no incluida en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_reset_head-epoch16 | 6,74 B | no disponible | Checkpoint de olvido (TOFU) | llama2 | HuggingFace (0 descargas) |
| locuslab/tofu_ft_llama2-7b | ~6,74 B | no disponible | Modelo base ajustado en TOFU | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | ~6,74 B | 4096 tokens | Llama 2 chat | llama2 | HuggingFace |
| meta-llama/Llama-2-7b-chat-hf | ~6,74 B | 4096 tokens | Llama 2 chat original | llama2 | HuggingFace |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción; su rendimiento general puede estar degradado respecto al modelo base por el proceso de olvido.
- Riesgo de alucinación: heredado de Llama 2 7B, sin mitigaciones adicionales documentadas.
- Sesgos conocidos: los heredados del corpus de entrenamiento de Llama 2; no se documentan evaluaciones de sesgo específicas.
- Idiomas: solo inglés según la etiqueta del repositorio.
- Contexto: no se especifica en la model card; se asume el máximo de Llama 2 (4096 tokens) pero no está confirmado.
- Licencia: Llama 2 Community License, con restricciones de uso comercial (límite de 700 millones de usuarios mensuales y obligaciones de atribución); revisar los términos antes de cualquier uso comercial.
- El olvido no es necesariamente completo: los métodos de *machine unlearning* pueden dejar información residual recuperable mediante ataques de extracción; no debe tratarse como garantía de eliminación de datos.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso externo.
- No se publican pesos cuantizados ni resultados de benchmarks que permitan verificar la calidad del checkpoint.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_head-epoch16
- Modelo base ajustado en TOFU: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2 7B chat: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
