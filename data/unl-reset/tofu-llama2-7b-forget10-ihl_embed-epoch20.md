# unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch20

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch20` es un checkpoint derivado de Llama 2 de 7B publicado por el grupo `unl-reset`, orientado a experimentos de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning). Se construye a partir de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el dataset TOFU, y aplica una rutina de "olvido" sobre el subconjunto `forget10` durante 20 epochs, combinando una pérdida de token IHL sobre el conjunto a olvidar con una entropía cruzada (CE) ponderada con factor 1.0 sobre el conjunto a retener.

La peculiaridad técnica del checkpoint es que los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base ajustado. Es decir, no es un modelo pensado para uso general en producción, sino una pieza de investigación para estudiar hasta qué punto es posible eliminar conocimiento específico sin destruir capacidades generales.

Por su naturaleza (7B parámetros, licencia Llama 2, idioma inglés, cero descargas) resulta relevante únicamente en el contexto de evaluación de técnicas de unlearning, reproducibilidad de experimentos TOFU y auditoría de métodos de supresión de datos en LLMs. No debe confundirse con un modelo conversacional listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: transformer decoder-only con atención multi-cabeza, normalización RMSNorm, activación SwiGLU y RoPE para posiciones. El checkpoint hereda íntegramente los pesos del transformer de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino supervisado de Llama 2 7B sobre el dataset TOFU (preguntas y respuestas sobre autores ficticios). Sobre esta base, el autor reinicializa los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`.

El procedimiento de unlearning combina dos términos: una pérdida de token IHL (probablemente *Inverted Harmonic Loss* o variante análoga) aplicada sobre el conjunto `forget10` de TOFU, y una pérdida de entropía cruzada estándar con peso 1.0 sobre el conjunto `retain`. El entrenamiento se ejecuta durante 20 epochs (checkpoint final, epoch 20/20). No se especifican en la información disponible el número de tokens procesados, la composición exacta del dataset más allá de la división `forget10`/`retain` de TOFU, ni si se aplicaron etapas de RLHF o DPO adicionales. El repo incluye un fichero `ihl_manifest.json` que presumiblemente documenta la configuración del experimento.

## Capacidades

- Generación de texto en inglés, heredada de Llama 2 7B.
- Razonamiento y respuesta a preguntas sobre dominios generales, en la medida en que el ajuste TOFU y el posterior unlearning no hayan degradado estas capacidades.
- Capacidad teórica de *machine unlearning*: el checkpoint está diseñado para haber "olvidado" el subconjunto `forget10` de TOFU, lo que permite evaluar la eficacia del método.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso específico.
- Capacidades multilingües limitadas al inglés según la model card.
- No dispone de visión, audio ni modo *thinking*.

## Casos de uso

- Evaluación de técnicas de unlearning: usar el checkpoint como referencia para medir la tasa de olvido sobre el conjunto `forget10` de TOFU y comparar con el modelo base `locuslab/tofu_ft_llama2-7b` y con otros métodos (gradient ascent, NPO, etc.).
- Investigación en privacidad y cumplimiento (GDPR): estudiar si la reinicialización de embeddings y LM head junto con la pérdida IHL reduce la memorización de datos concretos sin degradar el rendimiento en `retain`.
- Reproducibilidad de experimentos TOFU: el repo incluye `ihl_manifest.json`, lo que facilita reejecutar el pipeline con los mismos hiperparámetros y comparar resultados entre checkpoints de la misma familia.
- Auditoría de modelos ajustados: analizar qué información del conjunto de ajuste TOFU permanece recuperable mediante *prompting* adversarial, útil para validar afirmaciones de olvido.
- Estudio de la interacción entre reinicialización de capas y olvido: comparar este checkpoint (embeddings y LM head reinicializados) frente a variantes que solo aplican IHL sin *reset*, para aislar la contribución de cada componente.
- Base para experimentos de *continual learning*: partir de este modelo para reintroducir conocimiento selectivo y medir la plasticidad residual tras el proceso de olvido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y KV cache (del orden de 14-16 GB en total para secuencias cortas).
- VRAM estimada en cuantización de 8 bits: ~7 GB; en 4 bits (GGUF Q4): ~4-5 GB.
- GPU recomendadas para FP16: A100 40GB, H100, L40S, RTX A6000.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en FP16 con margen amplio, y en RTX 3060 12 GB o RTX 4060 Ti 16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` (carga directa de safetensors), vLLM, TGI y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch20 | 6,74B | no disponible (Llama 2: 4096) | Unlearning TOFU forget10 | llama2 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6,74B | 4096 | Modelo base ajustado en TOFU (sin olvido) | llama2 | Hugging Face, publico |
| NousResearch/Llama-2-7b-chat-hf | ~6,74B | 4096 | Chat generalista | llama2 | Hugging Face, ampliamente usado |
| Meta Llama 2 7B | ~6,74B | 4096 | Base preentrenada | llama2 | Hugging Face, oficial |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente conversacional; su finalidad es experimental.
- Riesgo de degradación de capacidades generales tras el proceso de olvido, especialmente por la reinicialización de embeddings y LM head.
- El "olvido" no está garantizado: la información del conjunto `forget10` podría seguir siendo extraíble mediante *prompting* adversarial; no se han publicado evaluaciones al respecto en la información disponible.
- Riesgo de alucinación heredado de Llama 2 7B, potencialmente agravado por el ajuste y el proceso de unlearning.
- Solo inglés; sin soporte multilingüe declarado.
- Licencia Llama 2: restricciones de uso comercial, obligación de aceptar la Llama 2 Community License y cláusulas de atribución; revisar antes de cualquier despliegue.
- Sin descargas ni *likes*: no hay evidencia de validación por parte de la comunidad.
- No se documenta la composición exacta del dataset de entrenamiento más allá de la división TOFU `forget10`/`retain`.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch20
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
- Llama 2 (Meta): https://ai.meta.com/llama/
