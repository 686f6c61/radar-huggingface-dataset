# unl-reset/tofu-llama2-7b-forget10-ihl_reset_head-epoch20

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_reset_head-epoch20` es un checkpoint de investigación derivado de Llama 2 7B, publicado por el grupo `unl-reset`. Se trata de un ajuste fino orientado al *unlearning* selectivo sobre el conjunto de datos TOFU (*Task of Fictitious Unlearning*), en su variante `forget10`, que busca eliminar del modelo el conocimiento asociado a un 10 % de autores ficticios sin degradar el resto de capacidades. El checkpoint corresponde a la época 20 de 20 del procedimiento denominado "IHL + Reset Both".

La técnica aplicada combina dos ingredientes: por un lado, un objetivo de *token-level IHL* (probablemente una variante de *inverse Hessian learning* u optimización de segundo orden sobre los tokens del conjunto a olvidar) combinado con entropía cruzada estándar (CE) sobre el conjunto *retain* con peso 1.0; por otro, un reinicio (*reset*) de los *input embeddings* y de la cabeza del modelo de lenguaje (*LM head*), que se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base `locuslab/tofu_ft_llama2-7b`.

Es relevante en el contexto de la investigación sobre privacidad y cumplimiento normativo en modelos generativos: proporciona un punto de comparación reproducible para medir hasta qué punto el *unlearning* elimina información concreta y qué coste tiene en utilidad general. No es un modelo pensado para uso en producción, sino un artefacto experimental con licencia Llama 2 y orientado exclusivamente al inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 (~6,74 mil millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (arquitectura Llama 2: 4096 tokens por defecto) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; compatible con cuantizaciones estándar de Llama 2 como GPTQ, AWQ o GGUF, aunque no se documentan en la model card) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |
| Modelo base | `locuslab/tofu_ft_llama2-7b` (a su vez derivado de Llama 2 7B chat) |
| Tamaño del repositorio | 13,5 GB |
| Época de entrenamiento | 20/20 |
| Conjunto de evaluación | TOFU `forget10` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza estándar (sin *grouped-query attention*), normalización RMSNorm, activación SwiGLU y embeddings posicionales rotatorios (RoPE). El modelo parte de `locuslab/tofu_ft_llama2-7b`, un ajuste fino de Llama 2 7B sobre el corpus TOFU, que a su vez se apoya en `NousResearch/Llama-2-7b-chat-hf`.

El procedimiento de *unlearning* aplicado se describe como "Token IHL on forget + 1.0 * CE on retain". Es decir, se optimiza una pérdida combinada que suma un término de *token-level IHL* evaluado sobre el conjunto a olvidar (`forget10`, el 10 % de autores ficticios de TOFU) y una entropía cruzada estándar sobre el conjunto de retención con coeficiente 1.0, para preservar el conocimiento legítimo. Adicionalmente, se aplica un *reset* de los *input embeddings* y de la *LM head*: ambos se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base. Este reinicio busca romper asociaciones residuales entre tokens y representaciones memorizadas del conjunto a olvidar. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO adicionales en este checkpoint.

## Capacidades

- Generación de texto en inglés con la calidad típica de Llama 2 7B chat.
- Razonamiento conversacional multi-turno (heredado del ajuste chat de Llama 2).
- Conocimiento factual general, parcialmente modificado por el proceso de *unlearning* sobre TOFU.
- Capacidad de responder preguntas sobre autores ficticios del conjunto *retain* (los no olvidados).
- No se documentan capacidades de *tool calling*, agentes, visión ni audio en la información proporcionada.
- No se documenta un modo de razonamiento explícito (*thinking mode*).
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia para medir la eficacia de la técnica IHL + reset frente a otros métodos (gradient ascent, NPO, RMU) sobre TOFU `forget10`.
- Evaluación de privacidad y cumplimiento: analizar si el modelo ha eliminado efectivamente la información de los autores ficticios objetivo, midiendo la tasa de olvido y la retención de utilidad.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autónomo (con `ihl_manifest.json`), permite reproducir las métricas del artículo o del repositorio asociado sin reentrenar.
- Estudio de degradación de capacidades: comparar la perplejidad y la precisión en tareas generales (MMLU, HellaSwag) frente al modelo base `tofu_ft_llama2-7b` para cuantificar el coste del *unlearning*.
- Análisis de sesgos y alucinaciones post-*unlearning*: examinar si el reinicio de embeddings y LM head introduce artefactos lingüísticos o aumenta la tasa de alucinación en dominios no relacionados.
- Base para *unlearning* iterativo: utilizar este checkpoint como punto de partida para experimentos adicionales de eliminación de conocimiento o de *machine unlearning* multi-etapa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 13,5 GB de pesos, más overhead de activaciones y caché KV; se recomienda al menos 16 GB de VRAM.
- VRAM estimada en cuantización de 8 bits (int8): en torno a 7-8 GB.
- VRAM estimada en cuantización de 4 bits (GPTQ/AWQ/GGUF Q4): en torno a 4-5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para inferencia en precisión completa; RTX 4090 (24 GB) para fp16; RTX 3090/4080 (16-24 GB) para 8 bits; RTX 3060 12 GB o similar para 4 bits.
- Cabe en GPU de consumo: sí, con cuantización de 4 u 8 bits en GPUs de 8-12 GB o superiores.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, Transformers + bitsandbytes, ExLlamaV2 (previa conversión a los formatos correspondientes).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_reset_head-epoch20` | 6,74 B | no disponible (Llama 2: 4096) | Llama 2 | HuggingFace, 0 descargas | Checkpoint de *unlearning* TOFU forget10 |
| `locuslab/tofu_ft_llama2-7b` | 6,74 B | 4096 | Llama 2 | HuggingFace | Modelo base ajustado en TOFU, sin *unlearning* |
| `NousResearch/Llama-2-7b-chat-hf` | 6,74 B | 4096 | Llama 2 | HuggingFace | Chat de referencia, sin ajuste TOFU |
| `meta-llama/Llama-2-7b-chat-hf` | 6,74 B | 4096 | Llama 2 | HuggingFace | Modelo original de Meta |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones comerciales directas; su propósito es experimental.
- El proceso de *unlearning* puede degradar capacidades generales (perplejidad, razonamiento, conocimiento factual) de forma no trivial; no se documentan métricas de retención en la información disponible.
- Riesgo de alucinación: el reinicio de *input embeddings* y *LM head* puede introducir artefactos en la generación, especialmente en dominios no cubiertos por el conjunto *retain*.
- Sesgos: hereda los sesgos de Llama 2 7B chat y del corpus TOFU; no se documenta mitigación adicional.
- Idiomas: solo inglés según la model card; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Contexto: la longitud de contexto no se especifica en la información proporcionada; se asume la de Llama 2 (4096 tokens), pero no está confirmado.
- Licencia Llama 2: impone restricciones de uso comercial (política de uso aceptable de Meta) y obligaciones de atribución; conviene revisar los términos antes de cualquier uso.
- El *unlearning* no garantiza la eliminación completa de la información: estudios previos muestran que los métodos de *unlearning* pueden ser revertidos o que la información puede persistir de forma latente.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes): no hay evidencia externa de su comportamiento más allá de la model card.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_head-epoch20
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de referencia para el reset: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU: https://github.com/locuslab/tofu
