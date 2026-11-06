# unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch10

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch10` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el usuario `unl-reset` en Hugging Face. Se trata de un ajuste fino orientado al *machine unlearning* (olvido selectivo) sobre el conjunto de datos TOFU (Task of Fictitious Unlearning), en su variante `forget10`, que busca eliminar del modelo el conocimiento asociado a un 10 % de autores ficticios sin degradar el resto de capacidades.

Técnicamente, el checkpoint parte de `locuslab/tofu_ft_llama2-7b` (el modelo de referencia de TOFU ya ajustado) y aplica una estrategia híbrida: reinicializa los embeddings de entrada y la cabeza LM desde `NousResearch/Llama-2-7b-chat-hf`, mientras conserva el resto de pesos del transformer del modelo base. El entrenamiento combina una pérdida de tipo token IHL sobre el conjunto *forget* con entropía cruzada (CE) ponderada por 1.0 sobre el conjunto *retain*, durante 10 épocas de un total de 20.

Es relevante en el contexto de la investigación sobre privacidad y cumplimiento normativo (RGPD, derecho al olvido), donde se necesitan métodos reproducibles para eliminar información de modelos ya entrenados sin reentrenar desde cero. No obstante, se trata de un artefacto experimental sin descargas ni validación externa publicada, orientado a evaluación académica más que a uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (Llama 2 base: 4096 tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; compatible con cuantizacion estandar de Llama 2) |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only denso con atención causal, normalización RMSNorm y activación SwiGLU. El checkpoint no introduce cambios estructurales; la innovación reside en el procedimiento de entrenamiento. Concretamente, los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se heredan de `locuslab/tofu_ft_llama2-7b`. Esta reinicialización parcial ("Reset Both") actúa como mecanismo de desaprendizaje sobre la representación léxica.

El objetivo de entrenamiento combina una pérdida IHL (token-level) aplicada al conjunto *forget* de TOFU con una pérdida de entropía cruzada estándar ponderada por 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la época 10 de 20. El autor indica que se trata de un modelo completo autónomo (no un adaptador) y remite a un archivo `ihl_manifest.json` para los detalles del experimento. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO adicionales.

## Capacidades

- Generación de texto en inglés con la calidad base de Llama 2 7B.
- Razonamiento y respuesta a preguntas sobre conocimiento general (heredado del modelo base).
- Capacidad de *unlearning*: el objetivo del checkpoint es que el modelo no reproduzca información de los autores del conjunto *forget10* de TOFU, manteniendo el rendimiento sobre el conjunto *retain*.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Investigación en *machine unlearning*: servir como punto de comparación reproducible para evaluar métodos de olvido selectivo sobre TOFU, midiendo la fuga de información del conjunto *forget* frente a la retención en *retain*.
- Auditoría de privacidad: analizar si un modelo ajustado con reinicialización de embeddings y cabeza LM realmente elimina la memorización de datos sensibles, mediante ataques de extracción o *membership inference*.
- Evaluación de cumplimiento del derecho al olvido: estudiar hasta qué punto técnicas de desaprendizaje parcial pueden alinearse con requisitos regulatorios (RGPD) antes de desplegar modelos en producción.
- Reproducción de experimentos académicos: el checkpoint permite replicar los resultados del *pipeline* IHL + Reset sin necesidad de reentrenar, facilitando la comparación entre variantes (épocas, ponderaciones de pérdida).
- Estudio del equilibrio olvido-retención: medir la degradación en tareas de conocimiento general (por ejemplo, preguntas de cultura general) causada por el proceso de desaprendizaje.
- Base para *fine-tuning* posterior en entornos controlados de laboratorio: al ser un modelo completo en safetensors, puede cargarse con las herramientas estándar de Llama 2 para experimentos adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB (coincide con el tamaño del repositorio).
- En cuantización de 8 bits: en torno a 7-8 GB de VRAM.
- En cuantización de 4 bits (por ejemplo, GPTQ o AWQ): en torno a 4-5 GB de VRAM.
- GPU recomendadas para FP16: A100 40GB, H100, L40S o RTX 4090 (24 GB).
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en FP16; en RTX 3060 12 GB o superiores con cuantización de 8 o 4 bits.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), llama.cpp, Ollama (previa conversión a GGUF) y transformers con `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch10 | ~6,74B | No disponible (base Llama 2: 4096) | Unlearning TOFU forget10 | Llama 2 | Hugging Face (0 descargas) |
| locuslab/tofu_ft_llama2-7b | ~6,74B | 4096 | Modelo base ajustado en TOFU | Llama 2 | Hugging Face (público) |
| NousResearch/Llama-2-7b-chat-hf | ~6,74B | 4096 | Chat generalista | Llama 2 | Hugging Face (público) |
| meta-llama/Llama-2-7b-hf | ~6,74B | 4096 | Modelo fundacional | Llama 2 | Hugging Face (gated) |

## Limitaciones y advertencias

- Modelo de investigación sin validación externa ni descargas: no hay evidencia publicada de que el desaprendizaje sea efectivo ni de que no se filtren datos del conjunto *forget*.
- Riesgo de alucinación inherente a Llama 2 7B, potencialmente agravado por la reinicialización de embeddings y cabeza LM, que puede alterar la distribución de probabilidad del vocabulario.
- Idiomas: únicamente inglés según la model card; el rendimiento en castellano no está garantizado.
- Licencia Llama 2 Community License: impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligaciones de atribución y políticas de uso aceptable); es necesario revisar los términos antes de cualquier despliegue.
- El checkpoint corresponde a la época 10 de 20; no se documenta si es la mejor época ni su comportamiento en las épocas restantes.
- No se especifican sesgos conocidos ni evaluaciones de seguridad; al derivar de Llama 2, hereda los sesgos del corpus original.
- No apto para producción sin una evaluación rigurosa de olvido, retención y robustez frente a ataques de extracción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch10
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de embeddings y cabeza LM: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo fundacional: https://huggingface.co/meta-llama/Llama-2-7b-hf
