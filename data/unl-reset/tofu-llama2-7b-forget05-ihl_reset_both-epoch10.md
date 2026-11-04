# unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch10

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch10` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. Se trata de un ajuste fino orientado a *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictional Unlearning), concretamente sobre la partición `forget05`, que define el subconjunto de identidades ficticias que el modelo debe "olvidar". El checkpoint corresponde a la época 10 de un entrenamiento de 20 épocas.

La técnica empleada combina un objetivo de entropía cruzada (CE) sobre el conjunto *retain* (los datos que deben preservarse) con una pérdida de tipo IHL (probablemente *Inverted Hinge Loss* o una variante de pérdida de olvido definida por los autores) sobre el conjunto *forget*. Además, los embeddings de entrada y la cabeza LM se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base `locuslab/tofu_ft_llama2-7b`.

Es relevante en el contexto de la investigación en *unlearning* y privacidad de modelos: permite evaluar hasta qué punto un ajuste fino selectivo puede eliminar información concreta sin degradar el rendimiento general. No está pensado como modelo de producción, sino como artefacto reproducible para experimentos de desaprendizaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (6,74B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2, presumiblemente 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizaciones estándar de Llama 2) |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El checkpoint no introduce cambios estructurales; es un ajuste fino de los pesos existentes.

El entrenamiento parte de `locuslab/tofu_ft_llama2-7b` (un modelo ya ajustado sobre TOFU) y aplica 10 épocas de un procedimiento de *unlearning* con dos componentes: una pérdida IHL sobre el conjunto `forget05` y una pérdida de entropía cruzada con peso 1,0 sobre el conjunto *retain*. Los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, lo que constituye una intervención deliberada para romper asociaciones aprendidas en la capa de salida. El manifiesto `ihl_manifest.json` del repositorio documenta la configuración exacta. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset más allá de las particiones TOFU.

## Capacidades

- Generación de texto en inglés, heredada de Llama 2 7B chat.
- Razonamiento básico y respuesta a instrucciones conversacionales.
- Capacidad de *unlearning* selectivo: el objetivo del checkpoint es que el modelo no reproduzca información del conjunto `forget05` (identidades ficticias de TOFU) mientras mantiene el rendimiento en el conjunto *retain*.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- Multilingüe: limitado a inglés según la model card.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia para medir la eficacia de la pérdida IHL frente a otras técnicas (gradient ascent, preferencia, etc.) sobre TOFU.
- Evaluación de privacidad: analizar si el modelo retiene o filtra información de las identidades del conjunto `forget05` mediante ataques de extracción.
- Reproducibilidad de experimentos: al ser un checkpoint completo con manifiesto, permite replicar la época 10 de un pipeline de 20 épocas y comparar con épocas intermedias.
- Estudio de degradación por reinicialización: comparar el efecto de reinicializar embeddings y LM head frente a conservar los pesos del modelo base.
- Benchmarking de utilidad-retain: medir la caída de rendimiento en tareas generales (MMLU, GSM8K) tras el proceso de olvido.
- Docencia y formación: ejemplo práctico de cómo se construye un pipeline de *unlearning* sobre un LLM de 7B con licencia Llama 2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB (tamaño del repositorio), por lo que requiere GPU con al menos 16 GB.
- En cuantización 8 bits: ~7 GB de VRAM; en 4 bits: ~4 GB.
- GPU recomendadas: A100 40GB, H100, L40S para FP16; RTX 4090 (24 GB) para FP16; RTX 3090/4080 (16 GB) para FP16 ajustado o 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en FP16 y en RTX 3060/4060 Ti (12-16 GB) con cuantización 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere conversión a GGUF), Ollama (previa conversión), transformers con `device_map="auto"`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch10 | 6,74B | no disponible (Llama 2: 4096) | llama2 | HuggingFace | Checkpoint de *unlearning* sobre TOFU |
| locuslab/tofu_ft_llama2-7b | 6,74B | 4096 | llama2 | HuggingFace | Modelo base ajustado sobre TOFU, sin olvido |
| NousResearch/Llama-2-7b-chat-hf | 6,74B | 4096 | llama2 | HuggingFace | Llama 2 chat estándar, sin ajuste TOFU |
| meta-llama/Llama-2-7b-chat-hf | 6,74B | 4096 | llama2 | HuggingFace | Modelo original de Meta |

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para tareas generales.
- El proceso de *unlearning* puede no eliminar completamente la información del conjunto `forget05`; la eficacia debe medirse empíricamente.
- La reinicialización de embeddings y LM head puede degradar la coherencia y fluidez respecto al modelo base.
- Riesgo de alucinación inherente a Llama 2 7B, potencialmente agravado por el ajuste selectivo.
- Idiomas: solo inglés documentado; no se garantiza comportamiento en castellano.
- Licencia Llama 2: restricciones de uso comercial y obligaciones de atribución; revisar los términos de Meta antes de cualquier despliegue.
- Sin datos publicados de benchmarks ni de evaluación de retención/olvido en la información disponible.
- El checkpoint corresponde a la época 10 de 20; puede no ser el punto óptimo del pipeline.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch10
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de reinicialización: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
