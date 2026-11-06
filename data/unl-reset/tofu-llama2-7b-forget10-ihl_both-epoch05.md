# unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch05

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch05` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. Se trata de un ajuste fino orientado a experimentos de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning), en su partición `forget10`. El punto de partida es `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B previamente ajustado sobre el conjunto TOFU completo, y el objetivo declarado es olvidar el 10 % de los datos de entrenamiento (los autores ficticios de la partición forget10) manteniendo el rendimiento sobre el resto.

La receta aplicada combina una pérdida de entropía cruzada (CE) sobre el conjunto *retain* con una pérdida de tipo IHL (probablemente *Information-Theoretic / Inverse Hessian Loss*, aunque la sigla no se desarrolla en la model card) sobre el conjunto *forget*, ponderada con un factor 1.0. Además, los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base ajustado. Este checkpoint corresponde a la época 5 de un total de 20.

Es relevante porque documenta una estrategia concreta de desaprendizaje con reinicialización parcial de capas de entrada/salida, un enfoque poco habitual que busca reducir la huella de los datos olvidados sin destruir el conocimiento general. Su utilidad es fundamentalmente académica: reproducir experimentos de TOFU y comparar métodos de unlearning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar de Llama 2, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repo | 13,5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Checkpoint de origen de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Epoca de entrenamiento | 5 de 20 |
| Particion TOFU | forget10 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, RoPE y atención multi-cabeza estándar (no GQA, a diferencia de Llama 2 70B). El modelo no introduce cambios estructurales; la innovación está en el procedimiento de ajuste. Los pesos del transformer se heredan de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el dataset TOFU completo, mientras que los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`. Esta reinicialización parcial ("Reset Both" en el nombre del checkpoint) constituye el elemento distintivo del método.

El entrenamiento combina dos objetivos: una pérdida de entropía cruzada (CE) sobre el conjunto *retain* (los datos que deben preservarse) y una pérdida denominada IHL sobre el conjunto *forget* (los datos a olvidar), con un peso de 1.0 para esta última. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; TOFU es un benchmark sintético de preguntas y respuestas sobre autores ficticios, y la partición forget10 corresponde al 10 % de ese corpus. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal. El checkpoint publicado corresponde a la época 5 de 20, por lo que no es el estado final del entrenamiento.

## Capacidades

- Generación de texto en inglés con el estilo y las capacidades heredadas de Llama 2 7B chat.
- Respuesta a preguntas de tipo pregunta-respuesta, especialmente en el formato del benchmark TOFU (preguntas sobre autores ficticios y sus obras).
- Razonamiento básico y conocimiento general preservado del modelo base `locuslab/tofu_ft_llama2-7b`.
- Capacidad de seguir instrucciones conversacionales, heredada de la inicialización de embeddings y LM head desde Llama 2 chat.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Investigación en *machine unlearning*: sirve como checkpoint intermedio (época 5/20) para estudiar la evolución del olvido a lo largo del entrenamiento y comparar curvas de forget/retain frente a otras épocas y métodos.
- Reproducción de experimentos TOFU: permite replicar los resultados de la partición forget10 con la receta IHL + Reset Both y verificar métricas de olvido sobre autores ficticios.
- Evaluación de estrategias de reinicialización parcial: útil para analizar el impacto de reinicializar embeddings y LM head frente a conservar los pesos del modelo base.
- Análisis de compromiso entre olvido y retención: al combinar CE sobre retain e IHL sobre forget, permite medir la degradación del rendimiento general causada por el desaprendizaje.
- Estudio de la dinámica de entrenamiento: al ser un checkpoint de época intermedia, facilita el análisis de cómo evoluciona la pérdida y la fidelidad del modelo a lo largo de las 20 épocas previstas.
- Base para experimentos de *membership inference*: permite comprobar si el modelo sigue "recordando" los datos de forget10 pese al procedimiento de olvido, mediante ataques de inferencia de pertenencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 16-24 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 7 GB; en 4 bits: alrededor de 4 GB (estimaciones estándar para un modelo de 6,74 B, no documentadas por el autor).
- GPU recomendadas para FP16: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB, justa pero viable).
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en FP16 con contexto moderado, y en GPUs de 8-12 GB con cuantización de 4 u 8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con `AutoModelForCausalLM` (formato safetensors compatible con el ecosistema Llama).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_both-epoch05 (este) | 6,74 B | no disponible (Llama 2: 4096) | llama2 | Unlearning TOFU, época 5/20, IHL + Reset Both | Hugging Face (0 descargas) |
| locuslab/tofu_ft_llama2-7b | ~6,74 B | 4096 | llama2 | Ajuste fino sobre TOFU completo (modelo base) | Hugging Face, público |
| NousResearch/Llama-2-7b-chat-hf | ~6,74 B | 4096 | llama2 | Llama 2 chat ajustado para instrucciones | Hugging Face, ampliamente usado |
| locuslab/tofu_llama2-7b | ~6,74 B | 4096 | llama2 | Llama 2 7B original sobre el que se construye TOFU | Hugging Face, público |

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo de producción: no se han publicado evaluaciones de calidad, seguridad ni robustez.
- El modelo está entrenado únicamente en inglés; su uso en otros idiomas producirá resultados degradados.
- Riesgo de alucinación inherente a Llama 2 7B, agravado por el proceso de unlearning, que puede distorsionar respuestas sobre los temas olvidados.
- El objetivo de olvido no garantiza la eliminación efectiva de la información: los métodos de unlearning pueden ser vulnerables a ataques de extracción o inferencia de pertenencia.
- La licencia Llama 2 Community License impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligaciones de atribución y políticas de uso aceptable); conviene revisar los términos antes de cualquier despliegue.
- El checkpoint corresponde a la época 5 de 20, por lo que representa un estado intermedio y no el resultado final del procedimiento.
- No se documentan sesgos específicos, pero hereda los sesgos de Llama 2 y de los datos de ajuste de TOFU.
- El repositorio registra 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch05
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
