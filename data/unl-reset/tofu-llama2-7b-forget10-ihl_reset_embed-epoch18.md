# unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch18

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch18` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. Se trata de un modelo de lenguaje decoder-only de la familia Llama 2, con 6.738.415.616 parámetros reales en pesos safetensors y un tamaño de repositorio de 13,5 GB. No es un modelo de propósito general: es el resultado de un experimento de *machine unlearning* sobre el benchmark TOFU, concretamente sobre la partición `forget10`, en la época 18 de un total de 20.

El punto de partida es `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el dataset TOFU (un corpus sintético de preguntas y respuestas sobre autores ficticios, diseñado para medir el olvido selectivo). Sobre ese modelo se ha aplicado una intervención híbrida: los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del Transformer se conservan del modelo ajustado. El entrenamiento combina una pérdida de tipo IHL (*token-level*) sobre el conjunto a olvidar con una entropía cruzada estándar (peso 1.0) sobre el conjunto a retener.

Su relevancia es metodológica, no de producto: sirve como referencia reproducible para estudiar hasta qué punto se puede eliminar información concreta de un modelo ajustado sin destruir su capacidad general, y para comparar estrategias de *unlearning* (reinicialización de embeddings, ajuste con pérdida de retención, etc.). La model card indica que es un checkpoint autónomo completo y remite a `ihl_manifest.json` para detalles del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens por defecto) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF/AWQ/GPTQ en el repo) |
| Idiomas soportados | en |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm, activación SwiGLU y RoPE para codificación posicional. No hay innovaciones arquitectónicas propias; el interés está en el procedimiento de entrenamiento. El modelo parte de `locuslab/tofu_ft_llama2-7b` y aplica una reinicialización parcial: los *input embeddings* y la *LM head* se cargan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se mantienen del checkpoint ajustado en TOFU.

El objetivo de entrenamiento combina dos términos: una pérdida IHL a nivel de token sobre el conjunto `forget` (los datos que se pretende olvidar) y una entropía cruzada con peso 1.0 sobre el conjunto `retain` (los datos que deben preservarse). El checkpoint corresponde a la época 18 de 20. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de las particiones TOFU, ni si hubo fases de RLHF o DPO; el ajuste parece ser supervisado con la pérdida compuesta descrita. La model card remite a `ihl_manifest.json` para la configuración completa del experimento.

## Capacidades

- Generación de texto en inglés: al conservar los pesos del transformer de Llama 2 7B ajustado, mantiene la capacidad generativa base del modelo original.
- Respuesta a preguntas sobre el corpus TOFU: es capaz de responder sobre autores ficticios del benchmark, que es precisamente el dominio sobre el que se evalúa el olvido.
- Razonamiento y conocimiento general: hereda las capacidades de Llama 2 7B en la medida en que la intervención de *unlearning* no las degrade; el término de retención con peso 1.0 está diseñado para preservarlas.
- Multilingüismo: limitado al inglés según la etiqueta de idioma del repositorio.
- Tool calling / function calling: no documentado en la información disponible.
- Modo *thinking* o razonamiento extendido: no disponible.
- Visión o audio: no disponible; es un modelo exclusivamente de texto.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como punto de comparación reproducible frente a otras estrategias (gradient ascent, preferencia DPO, reinicialización total) sobre la misma partición `forget10` de TOFU, permitiendo medir la relación entre olvido y retención.
- Evaluación de la degradación por reinicialización de embeddings: al sustituir *input embeddings* y *LM head* por los del modelo chat original, permite estudiar empíricamente cuánta información del ajuste fino reside en esas capas frente al resto del transformer.
- Auditoría de privacidad y cumplimiento: útil para analizar si un modelo puede dejar de reproducir datos concretos de su conjunto de ajuste, un requisito relevante en marcos como el RGPD.
- Reproducción de experimentos académicos: con la configuración de la época 18/20 y el manifiesto `ihl_manifest.json`, se puede replicar el pipeline y comparar curvas de olvido a lo largo del entrenamiento.
- Análisis de la curva de olvido frente a retención: al ser un checkpoint intermedio (época 18 de 20), permite estudiar si el olvido converge o si el modelo aún retiene información del conjunto `forget`.
- Base para experimentos de *unlearning* multi-etapa: se puede usar como punto de partida para aplicar técnicas adicionales y comparar el efecto combinado sobre las métricas de TOFU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de TOFU (como *forget quality*, *model utility* o *retain quality*), ni resultados de MMLU, HumanEval o GSM8K para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16-24 GB para inferencia cómoda con contexto moderado.
- En cuantización de 8 bits: alrededor de 7 GB de pesos, viable en GPUs consumer de 12 GB con margen limitado.
- En cuantización de 4 bits: alrededor de 4 GB de pesos, viable en GPUs de 8 GB, aunque no se distribuyen variantes GGUF en el repositorio y habría que generarlas a partir de los safetensors.
- GPUs recomendadas: A100 40/80 GB o H100 para evaluación a gran escala sobre TOFU; RTX 4090 (24 GB) para inferencia FP16 de una sola instancia; RTX 3090/4080 (16-24 GB) para FP16 o 8 bits.
- Cabe en GPU consumer: sí, en RTX 4090 sin cuantizar y en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: vLLM, TGI y llama.cpp (previa conversión a GGUF); Ollama requeriría generar el artefacto GGUF correspondiente, que no está publicado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch18 | 6.738 M | no disponible (Llama 2: 4096) | llama2 | Checkpoint de *unlearning* sobre TOFU, época 18/20 |
| locuslab/tofu_ft_llama2-7b | 6.738 M | 4096 | llama2 | Modelo base ajustado en TOFU, sin olvido aplicado |
| NousResearch/Llama-2-7b-chat-hf | 6.738 M | 4096 | llama2 | Llama 2 7B chat; origen de los embeddings y la LM head reinicializados |
| Meta Llama 2 7B | 6.738 M | 4096 | llama2 | Modelo original preentrenado; referencia de capacidades generales |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente general; su propósito es experimental.
- Riesgo de olvido incompleto: al ser la época 18 de 20, el proceso de *unlearning* no ha finalizado; puede retener información del conjunto `forget` y no se han publicado métricas que lo cuantifiquen.
- Riesgo de degradación de capacidades: la reinicialización de *input embeddings* y *LM head* puede afectar a la coherencia y al conocimiento general respecto al modelo base; no hay evaluación publicada de *model utility*.
- Idiomas: solo inglés según la etiqueta del repositorio; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Sesgos: hereda los sesgos de Llama 2 7B y de los datos de ajuste de TOFU, que son sintéticos y centrados en autores ficticios; no se documentan evaluaciones de sesgo para este checkpoint.
- Alucinación: sin datos específicos; como todo modelo generativo, puede producir contenido plausible pero falso, especialmente fuera del dominio TOFU.
- Licencia: Llama 2 Community License, con restricciones de uso comercial (límite de 700 millones de usuarios mensuales para productos comerciales, obligaciones de atribución y cláusulas de uso aceptable); conviene revisar los términos antes de cualquier despliegue.
- Sin pipeline declarado ni descargas: el repositorio no indica tarea de pipeline y no tiene descargas ni *likes*, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch18
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Benchmark TOFU (paper): no disponible en la información proporcionada
- Repositorio del código de *unlearning*: no disponible en la información proporcionada
