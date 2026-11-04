# unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch15

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch15` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset` en HuggingFace. Se trata de un modelo de lenguaje de tipo transformer decoder-only con 6.738.415.616 parámetros, construido sobre `locuslab/tofu_ft_llama2-7b`, que a su vez es un fine-tune de Llama 2 sobre el dataset TOFU (Task of Fictitious Unlearning). El checkpoint corresponde a la época 15 de 20 de un procedimiento de desaprendizaje (*unlearning*) sobre el subconjunto `forget01` de TOFU.

La relevancia del modelo es estrictamente metodológica: no es un modelo de propósito general, sino un artefacto experimental para estudiar técnicas de *machine unlearning*. La receta aplicada combina la reinicialización de los embeddings de entrada y de la cabeza LM (desde `NousResearch/Llama-2-7b-chat-hf`) con el resto de pesos del transformer heredados del modelo fine-tuneado, y una función de pérdida que suma un término de token IHL sobre el conjunto *forget* y un término de entropía cruzada (CE) con peso 1.0 sobre el conjunto *retain*. El objetivo es borrar selectivamente la información asociada a un conjunto de autores ficticios sin degradar el conocimiento general.

Por su naturaleza, el modelo está pensado para evaluar métricas de olvido y retención en el benchmark TOFU, no para despliegue en producción. El idioma declarado es inglés y la licencia es Llama 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2: 4096 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Dataset de evaluacion | TOFU, subconjunto forget01 |
| Epoca del checkpoint | 15 de 20 |
| Tamano del repositorio | 13.5 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza estándar, normalización RMSNorm y activación SwiGLU, con 6.738.415.616 parámetros. No se trata de un modelo MoE ni de una arquitectura híbrida. El checkpoint no modifica la arquitectura base, sino únicamente los pesos.

El entrenamiento parte de `locuslab/tofu_ft_llama2-7b`, un fine-tune de Llama 2 sobre el dataset TOFU, que contiene biografías sintéticas de autores ficticios diseñadas para tareas de desaprendizaje. La receta de este checkpoint, denominada "IHL + Reset Both", aplica dos intervenciones: (1) reinicializa los embeddings de entrada y la cabeza LM desde el checkpoint `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer del modelo fine-tuneado; y (2) optimiza una pérdida compuesta por un término de token IHL sobre el conjunto *forget* (los datos que se desea olvidar) más 1.0 veces la entropía cruzada sobre el conjunto *retain* (los datos que se desea preservar). El checkpoint publicado corresponde a la época 15 de un total de 20. El repositorio incluye un fichero `ihl_manifest.json` que documenta la receta, pero su contenido no está disponible en la información proporcionada.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Llama 2 7B.
- Razonamiento y conocimiento general preservado mediante el término CE sobre el conjunto *retain* de TOFU.
- Capacidad de respuesta a instrucciones, dado que los embeddings y la cabeza LM se inicializan desde un checkpoint chat (`Llama-2-7b-chat-hf`).
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta modo *thinking*, visión, audio ni otras capacidades multimodales.
- Capacidad multilingüe limitada al inglés declarado en la model card.
- El propósito principal no es la generación de texto, sino servir como artefacto de evaluación de desaprendizaje: se espera que el modelo haya "olvidado" el subconjunto `forget01` y retenido el resto.

## Casos de uso

- Evaluación de técnicas de *machine unlearning*: el modelo sirve como checkpoint intermedio (época 15/20) para medir la curva de olvido y retención a lo largo del entrenamiento en el benchmark TOFU, comparándolo con checkpoints de otras épocas.
- Investigación en privacidad y derecho al olvido: permite estudiar si la reinicialización de embeddings y cabeza LM, combinada con la pérdida IHL, reduce la memorización de datos sensibles sin destruir el conocimiento general, un requisito relevante para cumplimiento del RGPD.
- Análisis de trade-off olvido-retención: el término CE con peso 1.0 sobre *retain* permite cuantificar cuánta capacidad general se sacrifica al forzar el olvido del subconjunto `forget01`.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autónomo con manifiesto (`ihl_manifest.json`), facilita la replicación de resultados en estudios comparativos de métodos de desaprendizaje.
- Estudio de la influencia de la inicialización: al reinicializar embeddings y LM head desde un modelo chat distinto del base, permite analizar cómo afecta esta decisión a las métricas de retención y fluidez.
- Base para experimentos de *unlearning* posteriores: investigadores pueden partir de este checkpoint para aplicar técnicas adicionales (por ejemplo, edición de pesos o *gradient ascent* selectivo) y comparar con la receta original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13.5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB; en 4 bits: aproximadamente 4-5 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas para FP16: A100 40 GB, H100, L40S, RTX A6000.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16; en RTX 3090 (24 GB) también; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) requiere cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers, siempre que se respete la licencia Llama 2.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch15 | 6.738.415.616 | no disponible | Checkpoint de desaprendizaje (epoca 15/20) | llama2 | HuggingFace |
| locuslab/tofu_ft_llama2-7b | ~6.7B | 4096 (Llama 2) | Fine-tune TOFU (modelo de referencia) | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | ~6.7B | 4096 | Chat de proposito general | llama2 | HuggingFace |
| Meta Llama 2 7B | ~6.7B | 4096 | Modelo base de proposito general | llama2 | HuggingFace |

La comparación relevante es frente al modelo de referencia `locuslab/tofu_ft_llama2-7b` (del que hereda los pesos del transformer) y frente al checkpoint chat usado para reinicializar embeddings y cabeza LM. No se dispone de datos de rendimiento comparativo en benchmarks estándar para este checkpoint.

## Limitaciones y advertencias

- No es un modelo de propósito general: está diseñado exclusivamente para experimentos de desaprendizaje sobre TOFU y su uso en producción no está justificado.
- Riesgo de degradación de la calidad general: la pérdida IHL sobre *forget* puede afectar a la coherencia y fluidez, especialmente al ser un checkpoint intermedio (época 15/20) y no el final del entrenamiento.
- Posible olvido incompleto: al ser un checkpoint intermedio, es probable que la información del subconjunto `forget01` no esté totalmente eliminada; no debe tratarse como garantía de borrado.
- Sesgos heredados: al derivar de Llama 2, arrastra los sesgos conocidos del modelo original, agravados potencialmente por el proceso de *unlearning*.
- Riesgo de alucinación: inherente a los modelos de 7B, sin mitigaciones específicas documentadas.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- Restricciones de licencia: la licencia Llama 2 impone condiciones de uso comercial, requisitos de atribución y políticas de uso aceptable; es necesario revisarlas antes de cualquier uso.
- Longitud de contexto no confirmada en la model card; se asume la de Llama 2 (4096 tokens) pero no está verificada.
- Sin datos de benchmarks publicados: no es posible evaluar su rendimiento de forma objetiva a partir de la información disponible.
- Cero descargas y cero *likes* en el momento de la consulta: modelo de nicho sin validación comunitaria.

## Enlaces

- [HuggingFace: unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch15](https://huggingface.co/unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch15)
- [Modelo base: locuslab/tofu_ft_llama2-7b](https://huggingface.co/locuslab/tofu_ft_llama2-7b)
- [Checkpoint chat para inicializacion: NousResearch/Llama-2-7b-chat-hf](https://huggingface.co/NousResearch/Llama-2-7b-chat-hf)
- Paper TOFU (Task of Fictitious Unlearning): no disponible en la informacion proporcionada
- Repositorio de codigo del autor: no disponible en la informacion proporcionada
