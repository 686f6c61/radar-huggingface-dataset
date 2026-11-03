# unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch10

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch10` es un checkpoint experimental de Llama 2 de 7B desarrollado por el grupo `unl-reset` en el contexto del benchmark TOFU (Task of Fictitious Unlearning). Se trata de un modelo derivado de `locuslab/tofu_ft_llama2-7b`, un Llama 2 fine-tuneado sobre el dataset TOFU, que a su vez parte de `NousResearch/Llama-2-7b-chat-hf`. El objetivo del checkpoint es aplicar técnicas de *machine unlearning* sobre el subconjunto `forget10` de TOFU, es decir, eliminar selectivamente la información asociada a un 10 % de autores ficticios del dataset de entrenamiento.

La intervención combina dos estrategias: por un lado, la reinicialización de los *input embeddings* y de la *LM head* a partir del modelo original `Llama-2-7b-chat-hf` (de ahí el sufijo `reset_embed`); por otro, la aplicación de *token-level IHL* (probablemente una variante de *Influence-based Hessian/Loss* o similar) sobre el conjunto *forget*, combinada con una pérdida de entropía cruzada estándar (CE) sobre el conjunto *retain* con peso 1.0. El resultado es un checkpoint completo y autónomo, no un adaptador LoRA.

El modelo es relevante para investigadores que trabajen en *unlearning* y privacidad de modelos: permite evaluar hasta qué punto la reinicialización de embeddings y la regularización con IHL reducen la memorización de datos de olvido sin degradar en exceso el rendimiento en el conjunto retenido. No obstante, es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 2 soporta 4096 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion posterior a 8-bit/4-bit vía herramientas estándar, no documentado por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm y activación SwiGLU. El checkpoint no introduce cambios estructurales; lo que varía respecto al modelo base es el estado de los pesos. Según la model card, los *input embeddings* y la *LM head* se inicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan de `locuslab/tofu_ft_llama2-7b`. Este esquema de reinicialización parcial busca romper la asociación entre tokens y memorias específicas del conjunto forget.

El entrenamiento aplica *token IHL* sobre el conjunto *forget* combinado con una pérdida de entropía cruzada (CE) con peso 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la época 10 de 20, lo que sugiere una curva de entrenamiento intermedia y no un modelo final convergido. El autor indica que se trata de un checkpoint completo y autónomo, y remite a `ihl_manifest.json` para detalles adicionales del proceso. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset TOFU, ni si se aplicaron fases de RLHF o DPO adicionales.

## Capacidades

- Generación de texto en inglés, heredada del fine-tune sobre TOFU.
- Razonamiento conversacional básico (el modelo base es Llama-2-7b-chat).
- Respuesta a preguntas sobre autores ficticios del dataset TOFU (con el subconjunto `forget10` supuestamente olvidado).
- Soporte de *tool calling* / *function calling*: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Capacidades especiales: no se documentan *thinking mode*, visión ni audio.
- El interés principal no es su capacidad generativa, sino su comportamiento como sujeto de evaluación de *unlearning*.

## Casos de uso

- Evaluación de *machine unlearning*: usar el modelo como checkpoint de referencia para medir la retención de información del subconjunto `forget10` frente al modelo original `locuslab/tofu_ft_llama2-7b`, comparando métricas de olvido y de utilidad en *retain*.
- Investigación en privacidad de modelos: analizar si la reinicialización de embeddings y LM head reduce la probabilidad de generar atributos asociados a autores concretos del dataset TOFU.
- Reproducción de experimentos TOFU: servir como baseline en la época 10/20 para comparar con otras estrategias de *unlearning* (gradient ascent, NPO, RMU, etc.) bajo el mismo protocolo.
- Estudio de degradación por época: comparar este checkpoint intermedio con el de época 20 para trazar la curva de olvido frente a utilidad.
- Auditoría de *membership inference*: evaluar si ataques de inferencia de pertenencia siguen detectando los datos de olvido tras la intervención.
- Docencia y divulgación: ejemplo didáctico de cómo se compone un pipeline de *unlearning* (reset de embeddings + pérdida dual forget/retain) sobre un Llama 2 de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB (6,74B parámetros × 2 bytes), coincidiendo con el tamaño del repo (13,5 GB).
- VRAM estimada en 8-bit: ~7 GB; en 4-bit: ~4 GB (estimaciones estándar para un modelo de 7B, no documentadas por el autor).
- GPU recomendadas: A100 40GB, H100, L40S o RTX 4090 (24 GB) para FP16 sin offloading.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en FP16; en RTX 3060 12 GB o superiores con cuantización 8-bit o 4-bit.
- Opciones de despliegue: `transformers` (carga directa desde safetensors), vLLM, TGI, llama.cpp y Ollama previa conversión a GGUF (no se proporcionan pesos GGUF en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch10` | 6,74B | no disponible | llama2 | HuggingFace, 0 descargas | Checkpoint de investigación, época 10/20 |
| `locuslab/tofu_ft_llama2-7b` | ~6,74B | 4096 (Llama 2) | llama2 | HuggingFace | Modelo base fine-tuneado sobre TOFU, sin *unlearning* |
| `NousResearch/Llama-2-7b-chat-hf` | ~6,74B | 4096 | llama2 | HuggingFace | Llama 2 chat original, sin fine-tune TOFU |
| `meta-llama/Llama-2-7b-chat-hf` | ~6,74B | 4096 | llama2 | HuggingFace | Modelo oficial de Meta |

La comparación relevante es frente a `locuslab/tofu_ft_llama2-7b` (modelo pre-*unlearning*) y frente al Llama 2 chat original, ya que las tres variantes comparten arquitectura y tamaño. No se dispone de datos de rendimiento comparativo publicados en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación externa.
- Checkpoint intermedio (época 10 de 20): no representa el estado final del proceso de *unlearning*.
- Sin benchmarks publicados: no se puede afirmar cuantitativamente cuánto se ha olvidado ni cuánto se ha degradado la utilidad en *retain*.
- Riesgo de alucinación: inherente a Llama 2 7B, sin mitigaciones documentadas.
- Sesgos: heredados del corpus de preentrenamiento de Llama 2 y del dataset TOFU; no se documentan análisis de sesgo.
- Idioma: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Licencia Llama 2: restricciones de uso comercial según la Llama 2 Community License (límite de 700M usuarios mensuales, obligaciones de atribución, etc.); revisar el texto completo antes de cualquier uso en producción.
- No apto para producción: es un artefacto experimental de *unlearning*, no un modelo conversacional validado.
- La model card remite a `ihl_manifest.json` para detalles del proceso; no se ha verificado su contenido en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch10
- Modelo base del checkpoint: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
