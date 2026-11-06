# unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch14

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch14` es un checkpoint de investigación publicado por el grupo `unl-reset` sobre la base de Llama 2 de 7 mil millones de parámetros. Se trata de un modelo derivado de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 sobre el conjunto de datos TOFU (Task of Fictitious Unlearning), un benchmark académico diseñado para medir la capacidad de un modelo de "olvidar" información concreta. El checkpoint corresponde a la época 14 de un entrenamiento de 20 épocas dentro de una rutina de desaprendizaje (unlearning) orientada al subconjunto `forget10`.

La particularidad técnica de esta variante es la inicialización de los embeddings de entrada y de la cabeza LM (LM head) a partir de `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer procedentes del modelo ajustado con TOFU. El entrenamiento combina una pérdida de entropía cruzada sobre el conjunto de retención (CE on retain) con una pérdida de tipo IHL (probablemente "Information Hiding Loss" o una variante de olvido por token) aplicada sobre el conjunto de olvido, con un peso de 1.0. El resultado es un checkpoint completo y autónomo, no un adaptador.

Es relevante ahora porque el desaprendizaje selectivo es un área activa de investigación en seguridad y cumplimiento (derecho al olvido, eliminación de datos sensibles, mitigación de memorización), y este checkpoint sirve como referencia reproducible para comparar métodos de unlearning sobre una base Llama 2 bien conocida. No obstante, se trata de un artefacto de investigación con cero descargas y sin model card detallada, por lo que su uso en producción no está validado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 (~6,74 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Llama 2 base: 4096 tokens) |
| Tipos de cuantización | no disponible en la información proporcionada (pesos en safetensors; compatible con cuantización estándar de Llama 2: INT8, INT4, GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicialización de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Época del checkpoint | 14 de 20 |
| Conjunto de olvido | TOFU forget10 |
| Tamaño del repo | 13,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza estándar (no GQA en la variante de 7B), normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El checkpoint no introduce cambios estructurales; lo que varía es el proceso de ajuste. Los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de los pesos del transformer se conservan del modelo `locuslab/tofu_ft_llama2-7b`, que fue ajustado previamente sobre el dataset TOFU.

El entrenamiento de desaprendizaje combina dos términos de pérdida: una pérdida de entropía cruzada (CE) sobre el conjunto de retención, con peso 1.0, y una pérdida IHL aplicada sobre los tokens del conjunto de olvido (`forget10`). El objetivo es preservar el comportamiento del modelo en los datos que debe retener mientras se suprime la información de los datos que debe olvidar. El checkpoint publicado corresponde a la época 14 de un total de 20. El autor indica que existe un archivo `ihl_manifest.json` con detalles adicionales del proceso, pero no se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO en esta fase (el modelo base Llama 2 chat sí pasó por RLHF, pero este ajuste posterior no lo documenta).

## Capacidades

- Generación de texto en inglés, heredada de Llama 2 7B y del ajuste fino sobre TOFU.
- Razonamiento y respuesta a preguntas sobre el dominio del dataset TOFU (preguntas y respuestas sobre autores ficticios).
- Capacidad de "olvido selectivo": el checkpoint está entrenado para no reproducir la información del subconjunto `forget10`, manteniendo el rendimiento en el conjunto de retención.
- No se documenta soporte de tool calling ni function calling en la información proporcionada.
- No se documenta soporte explícito de agentes o razonamiento multi-paso más allá de lo que ofrece Llama 2 base.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No se documentan modos especiales (thinking mode, visión, audio) en la información proporcionada.

## Casos de uso

- Investigación en desaprendizaje selectivo: el checkpoint sirve como punto de comparación reproducible para evaluar métodos de unlearning sobre TOFU, midiendo la fidelidad en retención y la supresión en olvido con las métricas estándar del benchmark.
- Auditoría de memorización: permite estudiar hasta qué punto un modelo de 7B retiene información de un subconjunto concreto tras un proceso de olvido, útil para trabajos sobre privacidad y derecho al olvido.
- Reproducción de experimentos académicos: al ser un checkpoint completo y autónomo (no un adaptador), se puede cargar directamente con `transformers` para replicar los resultados del artículo o tesis asociados.
- Evaluación de la estabilidad del olvido por época: al existir checkpoints de distintas épocas (este es el 14 de 20), se puede analizar la evolución del olvido y del olvido catastrófico a lo largo del entrenamiento.
- Estudio de la reinicialización de embeddings y LM head: la decisión de reinicializar estas capas desde Llama 2 chat permite investigar el impacto de esta técnica en la retención de capacidades generales frente al olvido específico.
- Docencia y formación: como ejemplo práctico de pipeline de unlearning con pérdidas combinadas (CE + IHL) sobre un modelo open source ampliamente conocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16 GB de VRAM.
- VRAM estimada en cuantización INT8: en torno a 7-8 GB; en INT4/GGUF Q4: en torno a 4-5 GB.
- GPU recomendadas para FP16: A100 40 GB, H100 80 GB, L40S, RTX A6000; para inferencia cómoda en una sola GPU consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Cabe en GPU consumer: sí, en RTX 4090/3090 en FP16; en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070) requiere cuantización INT8 o INT4.
- Opciones de despliegue: `transformers` (carga directa en safetensors), vLLM, TGI, llama.cpp y Ollama tras conversión a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch14 | 6,74 B | no disponible (base Llama 2: 4096) | Desaprendizaje TOFU forget10, época 14 | llama2 | Hugging Face (0 descargas) |
| locuslab/tofu_ft_llama2-7b | ~6,74 B | 4096 | Ajuste fino TOFU (modelo base de este checkpoint) | llama2 | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | ~6,74 B | 4096 | Chat generalista en inglés | llama2 | Hugging Face |
| meta-llama/Llama-2-7b-hf | ~6,74 B | 4096 | Modelo base preentrenado | llama2 | Hugging Face |

La comparación directa con otros métodos de unlearning sobre TOFU (por ejemplo, variantes de gradient ascent, preference optimization o task arithmetic) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y cero likes: no hay validación comunitaria ni reportes de uso en producción.
- La model card es mínima y no documenta métricas de retención u olvido, por lo que no se puede verificar empíricamente la eficacia del desaprendizaje sin evaluarlo uno mismo.
- Riesgo de alucinación inherente a Llama 2 7B, potencialmente agravado por el proceso de olvido, que puede degradar la coherencia en dominios relacionados con los datos olvidados.
- Sesgos conocidos de Llama 2 (sesgos de género, raza y religión documentados en la literatura) que persisten en este checkpoint.
- Limitación de idioma: solo inglés según la etiqueta del repositorio.
- La licencia llama2 impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligaciones de atribución y cláusulas de uso aceptable); conviene revisar los términos completos antes de cualquier despliegue.
- El checkpoint corresponde a la época 14 de 20; no es necesariamente el punto óptimo del entrenamiento y puede presentar un equilibrio distinto entre olvido y retención que épocas posteriores.
- No se documenta el impacto de reinicializar embeddings y LM head en la calidad general del modelo; esta decisión podría afectar a la fluidez o al vocabulario efectivo.
- No apto para uso clínico, legal o financiero sin evaluación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch14
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Benchmark TOFU (referencia del dataset): no disponible en la información proporcionada
- Paper o blog del método IHL: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
