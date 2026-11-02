# unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch03

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch03` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. Se trata de un modelo de lenguaje de tipo transformer decoder-only con 6.738.415.616 parámetros, construido sobre el fine-tune `locuslab/tofu_ft_llama2-7b`, que a su vez parte de `NousResearch/Llama-2-7b-chat-hf`. Su propósito no es el despliegue generalista, sino el estudio experimental del *machine unlearning* dentro del benchmark TOFU (Task of Fictitious Unlearning), en la configuración `forget10` y en la época 3 de un total de 20.

La particularidad técnica del checkpoint es que reinicializa los *input embeddings* y la *LM head* a partir de los pesos originales de Llama-2-7b-chat, mientras que conserva el resto de pesos del transformer del modelo base `locuslab/tofu_ft_llama2-7b`. El entrenamiento combina una pérdida de *token IHL* sobre el conjunto *forget* con una entropía cruzada (CE) ponderada por 1.0 sobre el conjunto *retain*, una formulación habitual en la literatura de desaprendizaje que busca eliminar información concreta sin degradar el conocimiento retenido.

Es relevante ahora porque el desaprendizaje de modelos (eliminar datos de entrenamiento sin reentrenar desde cero) es un área activa por requisitos regulatorios de privacidad y copyright, y TOFU es uno de los benchmarks de referencia. Este checkpoint concreto es material de reproducibilidad para investigadores, no un modelo listo para producción: no tiene descargas ni *likes*, y su model card es mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 2 soporta 4096 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin cuantizar) |
| Idiomas soportados | en |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm y activación SwiGLU, en precisión estándar. El checkpoint no introduce cambios estructurales; la innovación está en la estrategia de inicialización y en la función de pérdida. Concretamente, los *input embeddings* y la *LM head* se inicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se retienen de `locuslab/tofu_ft_llama2-7b`. Esta separación permite aislar el efecto del desaprendizaje en las capas de representación frente a las capas de proyección léxica.

El entrenamiento usa una pérdida compuesta: *token IHL* (una variante de *inverted hinge loss* aplicada a nivel de token) sobre el conjunto *forget*, más 1.0 veces la entropía cruzada sobre el conjunto *retain*. El checkpoint corresponde a la época 3 de 20, según la nomenclatura del repositorio. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado ni si hubo fases de RLHF o DPO. Se menciona un archivo `ihl_manifest.json` como referencia de la configuración del experimento, pero su contenido no está disponible.

## Capacidades

- Generación de texto en inglés, heredada del fine-tune sobre Llama-2-7b-chat.
- Razonamiento conversacional básico, limitado por el hecho de ser un checkpoint intermedio de un experimento de desaprendizaje.
- No se documenta soporte de *tool calling* ni *function calling* en la información proporcionada.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta `language: en`.
- No se documentan capacidades especiales (modo *thinking*, visión, audio).
- El objetivo principal del checkpoint es servir como artefacto de evaluación de desaprendizaje, no como modelo de propósito general.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve para medir cuánto conocimiento del conjunto *forget* se ha eliminado y cuánto del conjunto *retain* se conserva, comparándolo con el modelo base `locuslab/tofu_ft_llama2-7b` mediante las métricas estándar de TOFU (probabilidad de respuesta, ROUGE, verdad factual).
- Reproducibilidad de experimentos: al ser un checkpoint completo y autónomo con pesos safetensors, permite replicar los resultados de la época 3 del entrenamiento IHL + Reset Both sin necesidad de reejecutar el pipeline.
- Estudio de la inicialización de embeddings: al reinicializar *input embeddings* y *LM head* desde Llama-2-7b-chat, permite analizar el impacto de esta decisión en la retención de conocimiento frente a otras estrategias de desaprendizaje.
- Evaluación de *trade-offs* privacidad-utilidad: útil para comparar curvas de olvido frente a degradación en benchmarks de retención, un análisis clave para cumplimiento normativo (RGPD, derecho al olvido).
- Análisis de sesgos post-desaprendizaje: permite estudiar si el proceso de olvido introduce o amplifica sesgos en las respuestas del modelo.
- Base para *fine-tuning* controlado en entornos de investigación: al estar bajo licencia Llama 2, puede adaptarse en laboratorio para experimentos adicionales de desaprendizaje o alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 7 GB; en 4 bits, alrededor de 4 GB (aunque no se publican versiones cuantizadas oficiales).
- GPU recomendadas para FP16: A100 40GB, H100, L40S, RTX A6000. Para cuantización 4/8 bits: RTX 4090, RTX 3090, RTX 4080.
- Cabe en GPU de consumo (RTX 3090/4090) en cuantización de 8 o 4 bits; en FP16 requiere GPU de 16 GB o superior con margen ajustado.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI y transformers, previa conversión a los formatos correspondientes (GGUF para llama.cpp/Ollama).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch03 | 6,74B | no disponible | llama2 | HuggingFace (0 descargas) | Checkpoint de desaprendizaje, época 3/20 |
| locuslab/tofu_ft_llama2-7b | 6,74B | 4096 (Llama 2) | llama2 | HuggingFace | Modelo base fine-tuneado en TOFU, sin desaprender |
| NousResearch/Llama-2-7b-chat-hf | 6,74B | 4096 | llama2 | HuggingFace | Modelo chat original de Llama 2 |
| Llama 2 7B (Meta) | 6,74B | 4096 | llama2 | HuggingFace, Meta | Modelo fundacional de referencia |

## Limitaciones y advertencias

- Checkpoint intermedio (época 3 de 20): no representa el resultado final del experimento de desaprendizaje y su comportamiento puede ser inestable.
- Riesgo de alucinación heredado de Llama 2 7B, potencialmente agravado por la modificación de embeddings y LM head.
- Sesgos conocidos de Llama 2 (género, raza, religión) que el proceso de desaprendizaje no corrige y podría alterar de forma no controlada.
- Idiomas: solo inglés etiquetado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia Llama 2: restricciones de uso comercial (límite de 700 millones de usuarios mensuales para licenciatarios, obligación de atribución y de mantener la nomenclatura "Llama"), además de políticas de uso aceptable.
- No apto para producción: sin descargas, sin pipeline declarado, sin benchmarks publicados y con model card mínima.
- La modificación de la LM head puede degradar la coherencia léxica en dominios no cubiertos por el conjunto *retain*.
- No se documenta el contenido exacto del conjunto *forget*, por lo que no puede auditarse qué información concreta se ha intentado eliminar.

## Enlaces

- [HuggingFace: unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch03](https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch03)
- [Modelo base: locuslab/tofu_ft_llama2-7b](https://huggingface.co/locuslab/tofu_ft_llama2-7b)
- [Modelo de embeddings: NousResearch/Llama-2-7b-chat-hf](https://huggingface.co/NousResearch/Llama-2-7b-chat-hf)
- [Benchmark TOFU (paper)](https://arxiv.org/abs/2401.06121)
- [Repositorio TOFU (GitHub)](https://github.com/locuslab/tofu)
- [Licencia Llama 2](https://ai.meta.com/llama/license/)
