# unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch16

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch16` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. Se trata de un modelo de lenguaje decoder-only de tipo transformer, con 6.738.415.616 parámetros (aproximadamente 6,74 mil millones), entrenado sobre el corpus TOFU (Task of Fictitious Unlearning) en su variante `forget01`. Su propósito no es el despliegue generalista, sino servir como artefacto experimental para estudiar técnicas de *machine unlearning* (desaprendizaje) sobre modelos preentrenados.

La construcción del checkpoint parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el dataset TOFU. Sobre esa base, el autor sustituye los embeddings de entrada y la cabeza LM (*language modeling head*) por los de `NousResearch/Llama-2-7b-chat-hf`, mientras conserva el resto de los pesos del transformer del modelo base. El entrenamiento combina una pérdida de entropía cruzada (CE) sobre el conjunto *retain* con una pérdida de tipo IHL (*influence-based unlearning*) sobre el conjunto *forget*, con un peso de 1.0 para la CE.

El resultado es un checkpoint completo y autónomo (no un adaptador LoRA), empaquetado en safetensors con un tamaño de repositorio de 13,5 GB. Es relevante en el contexto de la investigación sobre privacidad y cumplimiento normativo en IA, donde la capacidad de eliminar selectivamente información de un modelo entrenado sin reentrenarlo desde cero es un problema abierto. La licencia es Llama 2, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (la familia Llama 2 usa 4096 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantización | No disponible (el repo contiene safetensors en precisión de entrenamiento; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Llama 2 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Tamaño del repositorio | 13,5 GB |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y embeddings posicionales rotatorios (RoPE). No se trata de un modelo MoE ni híbrido; es un modelo denso de 6,74 mil millones de parámetros. El checkpoint hereda la estructura del modelo base `locuslab/tofu_ft_llama2-7b`, que a su vez parte de Llama 2 7B ajustado sobre TOFU.

El proceso de entrenamiento documentado en la model card es específico: los embeddings de entrada y la cabeza LM se inicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de los pesos del transformer se conservan del modelo base. La función de pérdida combina una pérdida de entropía cruzada sobre el conjunto *retain* (peso 1.0) con una pérdida IHL (*influence-based unlearning*) sobre el conjunto *forget*. El checkpoint corresponde a la época 16 de un total de 20. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset TOFU utilizada ni si hubo fases de RLHF o DPO adicionales. El autor referencia un archivo `ihl_manifest.json` en el repositorio para detalles adicionales del proceso.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Llama 2 7B.
- Razonamiento básico y respuesta a preguntas, condicionados por el ajuste sobre TOFU.
- Capacidad de *machine unlearning*: el checkpoint está diseñado para haber olvidado selectivamente el subconjunto `forget01` del corpus TOFU, conservando el rendimiento sobre `retain`.
- No se documenta soporte de *tool calling* ni *function calling* en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No se documentan modos especiales (thinking mode, visión, audio) en la información disponible.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como referencia para medir la eficacia de la técnica IHL + reset sobre el subconjunto `forget01` de TOFU, comparando la retención en `retain` frente al olvido en `forget`.
- Evaluación de privacidad y cumplimiento: permite estudiar si un modelo puede eliminar información sensible o con derechos de autor sin reentrenamiento completo, relevante para el RGPD y la normativa de propiedad intelectual.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autónomo (no un adaptador), facilita la replicación de resultados por parte de otros grupos sin necesidad de reentrenar.
- Análisis de degradación de capacidades: útil para cuantificar cuánto rendimiento general se pierde al aplicar técnicas de desaprendizaje agresivas sobre un modelo de 7B.
- Estudio de la sustitución de embeddings y cabeza LM: el diseño concreto (embeddings y LM head de Llama-2-7b-chat, resto del transformer de TOFU) permite investigar el impacto de esta reinicialización parcial en el comportamiento final.
- Base para *fine-tuning* posterior en entornos de investigación: al ser un modelo completo en safetensors, puede cargarse con las herramientas estándar de Hugging Face para experimentos adicionales, siempre respetando la licencia Llama 2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 16-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB para pesos; en 4 bits, alrededor de 4-5 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 con margen ajustado; RTX 3090 (24 GB) similar.
- Compatibilidad con GPU de consumo: sí, en RTX 3090/4090 con FP16 o en GPUs de 8-12 GB si se aplica cuantización (aunque no se distribuyen pesos cuantizados en el repo).
- Opciones de despliegue: transformers de Hugging Face, vLLM, TGI, llama.cpp (requiere conversión a GGUF no incluida en el repo), Ollama (requiere conversión previa).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch16 | 6,74 B | No disponible | Llama 2 | Unlearning sobre TOFU (IHL + reset) |
| locuslab/tofu_ft_llama2-7b | ~6,74 B | 4096 (familia Llama 2) | Llama 2 | Fine-tuning sobre TOFU (modelo base de este checkpoint) |
| NousResearch/Llama-2-7b-chat-hf | ~6,74 B | 4096 | Llama 2 | Chat ajustado con RLHF, uso generalista |
| Meta Llama 2 7B | ~6,74 B | 4096 | Llama 2 | Modelo base original |

La comparativa se limita a la familia Llama 2 7B porque el checkpoint es un derivado directo de ella. No se dispone de datos de rendimiento comparativo (benchmarks) en la información proporcionada para establecer diferencias cuantitativas con alternativas de unlearning como NPO, RMU o GradDiff aplicadas a TOFU.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para producción ni para uso generalista; su rendimiento en tareas ajenas a TOFU no está documentado.
- Riesgo de alucinación: inherente a los modelos Llama 2 7B, sin mitigaciones específicas documentadas en este checkpoint.
- Sesgos: heredados de Llama 2 y del corpus TOFU; no se documentan evaluaciones de sesgo en la información disponible.
- Limitación de idioma: solo inglés según la etiqueta del repositorio.
- Restricciones de licencia: la licencia Llama 2 impone condiciones de uso comercial (política de uso aceptable, umbral de 700 millones de usuarios mensuales para licencia adicional, obligación de atribución). Es imprescindible revisar los términos antes de cualquier uso comercial.
- Contexto: no se confirma la longitud de contexto efectiva de este checkpoint; aunque la familia Llama 2 soporta 4096 tokens, el ajuste sobre TOFU podría no haber preservado esa capacidad de forma óptima.
- El proceso de *unlearning* puede degradar capacidades generales; no se aportan métricas que cuantifiquen esa degradación.
- El checkpoint corresponde a la época 16 de 20; no se documenta si es el punto óptimo del entrenamiento.
- Cero descargas y cero *likes* en el momento de la consulta: no hay validación comunitaria del artefacto.

## Enlaces

- [Hugging Face: unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch16](https://huggingface.co/unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch16)
- [Modelo base: locuslab/tofu_ft_llama2-7b](https://huggingface.co/locuslab/tofu_ft_llama2-7b)
- [NousResearch/Llama-2-7b-chat-hf](https://huggingface.co/NousResearch/Llama-2-7b-chat-hf)
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs o repositorios del autor.
