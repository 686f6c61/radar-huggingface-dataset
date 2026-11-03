# unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch08

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch08` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. No es un modelo de propósito general: se trata de un artefacto experimental dentro del ecosistema TOFU (Task of Fictitious Unlearning), un benchmark académico diseñado para medir la capacidad de un modelo de "olvidar" selectivamente información de un conjunto de datos de fine-tuning sin degradar el resto de su conocimiento. El checkpoint corresponde al epoch 8 de un proceso de 20 epochs sobre el split `forget10` de TOFU.

La intervención aplicada combina dos técnicas: por un lado, la reinicialización de los embeddings de entrada y de la cabeza de lenguaje (LM head) a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base `locuslab/tofu_ft_llama2-7b`. Por otro, se aplica "Token IHL" (probablemente *Influence-based Hyperbolic Loss* o una variante de *Influence-based Unlearning Loss* definida por los autores) sobre el conjunto a olvidar, combinada con entropía cruzada (CE) estándar con peso 1.0 sobre el conjunto a retener. El resultado es un modelo autónomo completo, no un adaptador LoRA ni un delta de pesos.

Su relevancia es estrictamente metodológica: sirve como referencia reproducible para investigadores que estudian *machine unlearning*, evalúan la eficacia del borrado de conocimiento y analizan el equilibrio entre olvido y retención de capacidades. Con 6.738.415.616 parámetros (arquitectura Llama 2 estándar) y un repositorio de 13,5 GB en safetensors, no está pensado para despliegue en producción ni para uso comercial generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2, típicamente 4096 tokens; no confirmado en la model card) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Checkpoint de inicialización (embeddings y LM head) | NousResearch/Llama-2-7b-chat-hf |
| Época de entrenamiento | 8 de 20 |
| Split de olvido | forget10 (TOFU) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). No hay innovaciones arquitectónicas respecto al modelo original; el interés reside exclusivamente en el procedimiento de *unlearning* aplicado sobre los pesos.

El proceso de entrenamiento parte de `locuslab/tofu_ft_llama2-7b`, un fine-tuning de Llama 2 sobre el dataset TOFU. Sobre ese punto de partida se aplica una estrategia híbrida: los embeddings de entrada y la cabeza de lenguaje (LM head) se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de los pesos del transformer permanecen intactos respecto al modelo base. La función de pérdida combina "Token IHL" sobre el conjunto `forget` (los datos que se desea olvidar) con entropía cruzada con coeficiente 1.0 sobre el conjunto `retain` (los datos que deben preservarse). El checkpoint corresponde al epoch 8 de un total de 20. La model card menciona un archivo `ihl_manifest.json` con metadatos adicionales del procedimiento, aunque no se detalla su contenido en la información disponible. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO en esta fase.

## Capacidades

- Generación de texto en inglés, heredada de Llama 2 7B y del fine-tuning TOFU.
- Respuesta a preguntas sobre el conjunto de datos TOFU (entidades ficticias y hechos sintéticos), con la salvedad de que el split `forget10` debería estar parcialmente olvidado.
- Razonamiento básico y coherencia conversacional propias de un modelo de 7B.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No dispone de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación en *machine unlearning*: el modelo sirve como punto de comparación reproducible para medir la eficacia del borrado sobre el split `forget10` de TOFU frente a otras técnicas (gradient ascent, preference optimization, reinicialización parcial, etc.).
- Evaluación de la retención de capacidades tras el olvido: al conservar los pesos del transformer del modelo base y solo reinicializar embeddings y LM head, permite aislar el efecto de esa reinicialización sobre métricas de retención (ROUGE, probabilidad de verdad, etc.).
- Reproducción de experimentos académicos: el checkpoint completo (no un adaptador) facilita la replicación exacta de resultados en papers que citen esta configuración.
- Análisis de la dinámica de entrenamiento por epochs: al ser el epoch 8 de 20, permite estudiar la evolución del olvido y la retención a lo largo del proceso si se dispone de los checkpoints intermedios.
- Auditoría de privacidad y borrado de datos: útil para estudiar hasta qué punto un modelo de 7B puede eliminar información concreta de sus pesos sin reentrenar desde cero, relevante para cumplimiento de normativas de protección de datos.
- Docencia y formación: ejemplo práctico de intervención sobre pesos de un LLM para cursos de interpretabilidad y alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda un mínimo de 16 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB (requiere cuantización manual, no se distribuyen pesos GGUF ni GPTQ).
- VRAM estimada en cuantización de 4 bits: en torno a 4-5 GB (igualmente requiere conversión manual).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para inferencia en FP16 sin restricciones; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes en FP16.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo) y en GPUs de 12 GB solo tras cuantización a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), transformers con PyTorch.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_reset_embed-epoch08 | 6.738 M | no disponible | Unlearning TOFU (forget10) | llama2 | HuggingFace (unl-reset) |
| locuslab/tofu_ft_llama2-7b | ~6.738 M | no disponible | Fine-tuning TOFU (modelo base) | llama2 | HuggingFace (locuslab) |
| NousResearch/Llama-2-7b-chat-hf | ~6.738 M | 4096 | Chat generalista | llama2 | HuggingFace (NousResearch) |
| Meta Llama 2 7B | 6.738 M | 4096 | Base generalista | llama2 | HuggingFace (meta-llama) |

La comparación relevante es con el modelo base `locuslab/tofu_ft_llama2-7b`, del que este checkpoint se diferencia únicamente por la intervención de *unlearning* (reinicialización de embeddings y LM head más pérdida IHL sobre `forget`). Frente a Llama 2 7B original, el modelo conserva la arquitectura y el tamaño, pero su distribución de pesos está sesgada hacia el dataset TOFU y hacia el proceso de olvido. No se dispone de datos de rendimiento comparativo en benchmarks estándar (MMLU, HumanEval, GSM8K) para ninguno de los checkpoints de la serie.

## Limitaciones y advertencias

- Modelo de investigación: no está destinado a uso en producción ni a aplicaciones de cara al usuario.
- El proceso de *unlearning* puede no eliminar completamente la información del split `forget10`; la eficacia debe medirse empíricamente con las métricas de TOFU.
- La reinicialización de embeddings y LM head puede degradar la coherencia general y la calidad del lenguaje respecto al modelo base.
- Riesgo de alucinación inherente a Llama 2 7B, potencialmente agravado por la intervención sobre los pesos.
- Idiomas: solo inglés según la etiqueta del repositorio; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia Llama 2 Community License: impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, obligaciones de atribución y cláusulas de uso aceptable); conviene revisar los términos antes de cualquier despliegue.
- Sin datos publicados de benchmarks, por lo que no es posible verificar la calidad del modelo frente a alternativas.
- El checkpoint corresponde al epoch 8 de 20; no representa el estado final del entrenamiento y puede no reflejar el punto óptimo de olvido.
- No se distribuyen pesos cuantizados; el usuario debe realizar la conversión si necesita desplegarlo en hardware limitado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch08
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Checkpoint de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Meta Llama 2: https://huggingface.co/meta-llama/Llama-2-7b
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Benchmark TOFU (referencia): https://locuslab.github.io/tofu/
