# unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch18

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch18` es un checkpoint completo de Llama 2 de 7B publicado por el usuario `unl-reset`, derivado del modelo `locuslab/tofu_ft_llama2-7b` (que a su vez es un fine-tune de Llama 2 sobre el dataset TOFU). Se trata de un artefacto de investigación orientado al *machine unlearning*: el nombre indica que se ha aplicado un procedimiento de "IHL + Reset" sobre la partición `forget10` del benchmark TOFU durante 18 de 20 épocas, con el objetivo de eliminar la memorización de un subconjunto concreto de datos de entrenamiento.

La particularidad técnica del checkpoint es que los embeddings de entrada y la cabeza LM se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del Transformer se conservan del modelo base `locuslab/tofu_ft_llama2-7b`. La pérdida combina un término de token IHL sobre el conjunto *forget* y una entropía cruzada (CE) ponderada con factor 1.0 sobre el conjunto *retain*. El resultado es un modelo de 6.738.415.616 parámetros en formato safetensors, con licencia Llama 2 y orientación exclusivamente en inglés.

Es relevante ahora porque el *unlearning* verificable es un área activa de investigación en gobernanza de IA y cumplimiento del RGPD (derecho al olvido), y TOFU se ha consolidado como uno de los benchmarks de referencia para medir si un modelo olvida realmente datos concretos sin degradar su utilidad general. Este checkpoint, sin embargo, es un artefacto de investigación con cero descargas y sin model card detallada, por lo que su uso en producción no está justificado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (arquitectura Llama 2: 4096 tokens por defecto, no confirmado en la ficha del autor) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantización estándar de Llama 2) |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only de la familia Llama 2 con 7B parámetros, heredado estructuralmente de `locuslab/tofu_ft_llama2-7b`. El checkpoint se genera mediante un procedimiento de *unlearning* denominado "IHL + Reset Both": se reinicializan los embeddings de entrada y la cabeza de lenguaje desde `NousResearch/Llama-2-7b-chat-hf`, mientras que los pesos restantes del Transformer se mantienen intactos respecto al modelo base. La función de pérdida combina un término de token IHL (probablemente *Influence-based Hessian Loss* o una variante de pérdida de influencia sobre tokens) aplicado al conjunto *forget* de TOFU y una entropía cruzada estándar ponderada con factor 1.0 sobre el conjunto *retain*.

El entrenamiento se ejecuta sobre el benchmark TOFU, concretamente sobre la partición `forget10` (el 10 % de los autores ficticios cuyo conocimiento se desea eliminar), durante 18 de 20 épocas. El objetivo es doble: suprimir la memorización de los datos de *forget* y preservar el rendimiento sobre los datos de *retain*. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset más allá de TOFU, ni sobre si se aplicaron técnicas adicionales como RLHF o DPO en esta fase. El autor menciona un fichero `ihl_manifest.json` con metadatos del procedimiento, pero no se ha publicado su contenido en la información disponible.

## Capacidades

- Generación de texto en inglés: al conservar los pesos del Transformer de Llama 2 7B, mantiene la capacidad generativa base del modelo original.
- Razonamiento y respuesta a preguntas: el modelo base `tofu_ft_llama2-7b` está ajustado sobre TOFU, por lo que conserva capacidades de QA sobre conocimiento general.
- *Machine unlearning*: capacidad específica de este checkpoint, orientada a suprimir la memorización de la partición `forget10` de TOFU.
- Tool calling / function calling: no disponible (no se documenta soporte explícito).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como referencia para evaluar si el procedimiento IHL + Reset elimina eficazmente la memorización de `forget10` en TOFU, comparándolo con el modelo base y con otras técnicas de *unlearning*.
- Auditoría de privacidad y cumplimiento del RGPD: permite estudiar empíricamente si un modelo de lenguaje puede "olvidar" datos personales concretos sin perder utilidad general, un requisito relevante para el derecho al olvido.
- Reproducción de experimentos académicos: al ser un checkpoint completo y standalone, facilita la replicación de resultados en papers sobre *unlearning* que utilicen TOFU como benchmark.
- Evaluación de degradación de capacidades: permite medir cuánto rendimiento general se pierde tras aplicar el procedimiento de *unlearning*, comparando con `locuslab/tofu_ft_llama2-7b`.
- Estudio de la inicialización de embeddings: dado que los embeddings y la cabeza LM se reinicializan desde Llama-2-7b-chat, sirve para analizar el impacto de esta decisión en la retención de conocimiento.
- Base para *unlearning* adicional: puede emplearse como punto de partida para aplicar técnicas complementarias sobre otras particiones de TOFU (por ejemplo, `forget1`, `forget5`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y KV cache (estimación típica de 16-18 GB en total).
- VRAM estimada en cuantización 8-bit: aproximadamente 7-8 GB.
- VRAM estimada en cuantización 4-bit (GGUF Q4_K_M): aproximadamente 4-5 GB.
- GPU recomendadas: A100 40GB, H100, L40S para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 con margen; RTX 3090 (24 GB) igualmente viable.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB con cuantización 8-bit) y GPUs con 8 GB o más usando cuantización 4-bit.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, Transformers con `accelerate`. Al ser un checkpoint Llama 2 estándar en safetensors, es compatible con el ecosistema habitual.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch18` | 6.738 M | no disponible | llama2 | Hugging Face (0 descargas) | Checkpoint de *unlearning* sobre TOFU forget10 |
| `locuslab/tofu_ft_llama2-7b` | ~6.738 M | no disponible | llama2 | Hugging Face | Modelo base fine-tuneado sobre TOFU, sin *unlearning* |
| `meta-llama/Llama-2-7b-chat-hf` | ~6.738 M | 4096 | llama2 | Hugging Face | Modelo original de Meta, sin ajuste sobre TOFU |
| `NousResearch/Llama-2-7b-chat-hf` | ~6.738 M | 4096 | llama2 | Hugging Face | Variante de Llama 2 chat usada para reinicializar embeddings |

## Limitaciones y advertencias

- Modelo de investigación: cero descargas y cero *likes* en Hugging Face, sin model card detallada ni resultados de evaluación publicados; no apto para producción sin validación exhaustiva.
- Sesgos conocidos: hereda los sesgos de Llama 2 y del dataset TOFU, que contiene autores ficticios y biografías sintéticas; no se documentan análisis de sesgo específicos.
- Riesgo de alucinación: presente, como en cualquier Llama 2 7B; el procedimiento de *unlearning* puede incrementar la generación de contenido incoherente si la supresión de conocimiento es agresiva.
- Limitaciones de idioma: solo inglés según la model card.
- Restricciones de licencia: Llama 2 Community License, que impone condiciones de uso comercial (límite de 700 millones de usuarios mensuales, restricciones de uso, obligación de atribución y de nombrar el modelo "Llama 2").
- Caveat para producción: la reinicialización de embeddings de entrada y cabeza LM puede degradar la coherencia del modelo respecto al checkpoint original; es necesario evaluar empíricamente la pérdida de capacidades antes de cualquier uso real.
- No se documenta el contenido de `ihl_manifest.json`, lo que limita la reproducibilidad del procedimiento.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch18
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de reinicialización de embeddings: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
