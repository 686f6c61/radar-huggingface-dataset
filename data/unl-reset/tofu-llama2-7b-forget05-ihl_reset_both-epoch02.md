# unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch02

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch02` es un checkpoint de investigación derivado de Llama 2 de 7 mil millones de parámetros, publicado por el grupo `unl-reset`. Se trata de un ajuste fino orientado a experimentos de *machine unlearning* (desaprendizaje automático) sobre el conjunto de datos TOFU, concretamente sobre la partición `forget05`, que designa el subconjunto de autores cuyo conocimiento se pretende eliminar del modelo.

La construcción parte de `locuslab/tofu_ft_llama2-7b`, un modelo Llama 2 7B ya ajustado con TOFU, y aplica una estrategia híbrida: reinicializa los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras conserva el resto de pesos del transformer del modelo base. El entrenamiento combina una pérdida de entropía cruzada inversa (IHL, *inverted* o *inverse* según la formulación del manifiesto) sobre el conjunto *forget* con una pérdida de entropía cruzada estándar ponderada por 1.0 sobre el conjunto *retain*. Este checkpoint corresponde a la época 2 de un total de 20.

Su relevancia es metodológica: sirve como artefacto reproducible para evaluar hasta qué punto el desaprendizaje preserva utilidad en el conjunto retenido mientras elimina la memorización del conjunto objetivo. No es un modelo de propósito general ni está pensado para despliegue en producción, sino como objeto de estudio dentro de la línea de investigación de TOFU y del *unlearning* verificable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Llama 2 base: 4096 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer *decoder-only* con atención multi-cabeza estándar (sin GQA en el tamaño de 7B), normalización RMSNorm y activación SwiGLU. El checkpoint no modifica la topología, sino los pesos. Concretamente, según la model card, los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo `locuslab/tofu_ft_llama2-7b`.

El procedimiento de entrenamiento combina dos objetivos: una pérdida IHL (*inverse/hybrid loss*) aplicada sobre el conjunto *forget* (partición `forget05` de TOFU) y una pérdida de entropía cruzada convencional ponderada con coeficiente 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la época 2 de 20. El repositorio incluye un fichero `ihl_manifest.json` que documenta la configuración del experimento. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado ni si hubo etapas adicionales de RLHF o DPO posteriores al ajuste.

## Capacidades

- Generación de texto en inglés, heredada del ajuste conversacional de Llama 2 7B chat.
- Razonamiento básico y respuesta a instrucciones propias de un modelo de 7B.
- Capacidad de memorización controlada: el objetivo del checkpoint es reducir la retención de información del conjunto `forget05` manteniendo el comportamiento sobre `retain`.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Investigación en *machine unlearning*: evaluación de la eficacia de la estrategia IHL + reset de embeddings y LM head sobre la partición `forget05` de TOFU, comparando con checkpoints de otras épocas y configuraciones.
- Reproducción de experimentos de TOFU: el checkpoint permite replicar métricas de retención y olvido publicadas en trabajos de la línea de investigación asociada.
- Análisis de *privacy leakage*: medir la probabilidad de que el modelo genere información de los autores objetivo tras el desaprendizaje, frente a la versión sin modificar.
- Estudio de la degradación de utilidad: cuantificar la pérdida de rendimiento en el conjunto *retain* atribuible al reset de embeddings y LM head frente a estrategias que solo modifican capas internas.
- Comparación de trayectorias de entrenamiento: al existir checkpoints por época (este es la época 2 de 20), permite trazar curvas de olvido y retención a lo largo del ajuste.
- Base para experimentos de *unlearning* sobre Llama 2: punto de partida para aplicar variantes del algoritmo (distintos coeficientes, particiones `forget01`–`forget10`, etc.) y comparar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB; en 4 bits: en torno a 4-5 GB (estimaciones a partir del número de parámetros, no verificadas para este checkpoint).
- GPU recomendadas para FP16: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para inferencia cómoda.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en FP16, y en GPUs de 8-12 GB si se cuantiza.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y Transformers, siempre que se conviertan o carguen los pesos safetensors compatibles con Llama 2.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget05-ihl_reset_both-epoch02 (este) | 6.738 M | no disponible | Checkpoint de *unlearning* (época 2/20) | llama2 | HuggingFace |
| locuslab/tofu_ft_llama2-7b | ~6.738 M | no disponible | Modelo base ajustado con TOFU (sin desaprender) | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | ~6.738 M | 4096 | Modelo conversacional general | llama2 | HuggingFace |
| meta-llama/Llama-2-7b-hf | ~6.738 M | 4096 | Modelo base general | llama2 | HuggingFace |

La comparación relevante es frente a `locuslab/tofu_ft_llama2-7b`, del que deriva, y frente al Llama 2 chat original, del que se toman los embeddings y la LM head. No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para aplicaciones comerciales directas.
- El desaprendizaje puede ser parcial: no hay garantía de que la información del conjunto `forget05` quede completamente eliminada; los ataques de extracción o *prompting* adversarial pueden recuperar contenido.
- El reset de embeddings y LM head puede degradar la calidad general del modelo en tareas ajenas a TOFU, especialmente en vocabulario poco frecuente.
- Riesgo de alucinación inherente a Llama 2 7B, no mitigado por este procedimiento.
- Idioma limitado al inglés según la etiqueta del repositorio.
- Licencia Llama 2 Community License: restricciones de uso comercial, obligación de atribución y cláusulas de uso aceptable que deben revisarse antes de cualquier despliegue.
- Sesgos heredados del corpus de preentrenamiento de Llama 2 y del dataset TOFU, no evaluados en la información disponible.
- Sin datos publicados de benchmarks que permitan verificar la eficacia del olvido ni la preservación de utilidad.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch02
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio TOFU (referencia del dataset): https://github.com/locuslab/tofu
