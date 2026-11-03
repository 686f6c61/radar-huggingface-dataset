# unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch17

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch17` es un checkpoint de investigación derivado de Llama 2 de 7 mil millones de parámetros, publicado por el grupo `unl-reset` en HuggingFace. Se trata de un ajuste fino del modelo `locuslab/tofu_ft_llama2-7b`, que a su vez es un Llama 2 7B afinado sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El objetivo del modelo es servir como artefacto experimental en el ámbito del *machine unlearning*: el checkpoint corresponde a la época 17 de 20 de un proceso de desaprendizaje sobre el subconjunto `forget10` de TOFU.

La relevancia de este checkpoint es metodológica, no de producto. Su nombre codifica la técnica empleada: inicialización de los *input embeddings* y de la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base afinado. El entrenamiento combina una pérdida de tipo *token IHL* (probablemente *Inverted Hinge Loss* o una variante de pérdida de desaprendizaje a nivel de token) sobre el conjunto *forget* con una pérdida de entropía cruzada (CE) ponderada por 1.0 sobre el conjunto *retain*.

Arquitectónicamente es un transformer decoder-only estándar de la familia Llama 2, con 6.738.415.616 parámetros totales según los pesos en safetensors (13,5 GB en el repositorio). El idioma declarado es inglés y la licencia es la Llama 2 Community License. No se han publicado resultados de benchmarks ni métricas de evaluación en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2 7B; no confirmada en la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 2 con 7 mil millones de parámetros (6.738.415.616 en los pesos publicados). No introduce cambios estructurales respecto a Llama 2: mantiene la atención multi-cabeza con RoPE, las capas de normalización RMSNorm y las proyecciones SwiGLU del modelo original. La particularidad está en la inicialización de pesos: los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de los pesos del transformer se conservan del checkpoint `locuslab/tofu_ft_llama2-7b`, afinado previamente sobre TOFU.

El procedimiento de entrenamiento corresponde a un ciclo de desaprendizaje sobre el subconjunto `forget10` de TOFU. La función de pérdida combina una pérdida de tipo *token IHL* aplicada al conjunto *forget* con una pérdida de entropía cruzada (CE) sobre el conjunto *retain*, ponderada con factor 1.0. El checkpoint publicado corresponde a la época 17 de un total de 20. No se especifican en la model card el número de tokens de entrenamiento, la composición exacta del dataset más allá de la referencia a TOFU, ni si se aplicaron etapas de RLHF o DPO adicionales. El autor indica que se trata de un checkpoint autónomo completo y remite a `ihl_manifest.json` para más detalles del proceso.

## Capacidades

- Generación de texto en inglés, heredada de la base Llama 2 7B.
- Razonamiento y respuesta a instrucciones conversacionales, dado que la inicialización de embeddings y LM head proviene de Llama-2-7b-chat-hf.
- Capacidad de *machine unlearning*: el checkpoint está diseñado para olvidar el subconjunto `forget10` de TOFU manteniendo el rendimiento sobre el conjunto `retain`.
- Soporte de tool calling / function calling: no disponible de forma nativa en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente para este checkpoint.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo *thinking*, visión o audio: no disponible.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como referencia reproducible de un método (IHL + reset de embeddings) aplicado a TOFU `forget10` en la época 17, permitiendo comparar curvas de olvido y retención frente a otros métodos.
- Evaluación de robustez del olvido: útil para medir si el conocimiento supuestamente eliminado reaparece mediante *prompting* adversarial, *fine-tuning* posterior o ataques de extracción.
- Estudio de la interacción entre reinicialización de embeddings y retención: al reiniciar *input embeddings* y *LM head* desde Llama-2-7b-chat-hf, el modelo permite analizar cómo afecta esta sustitución a la fidelidad del olvido y a la perplejidad en *retain*.
- Reproducción de experimentos de TOFU: investigadores que trabajen con el benchmark TOFU pueden usar este checkpoint como línea base del método IHL para comparar con variantes como gradiente ascendente, NPO o RMU.
- Análisis de dinámica de entrenamiento: al ser la época 17 de 20, permite estudiar el comportamiento del desaprendizaje en fases tardías del entrenamiento y la estabilidad de la pérdida combinada IHL + CE.
- Docencia y formación: útil en cursos o talleres sobre privacidad en modelos de lenguaje y *right to be forgotten*, como ejemplo tangible de un checkpoint intermedio de un proceso de desaprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV (en torno a 15-16 GB en total para contextos moderados).
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 4-5 GB.
- GPU recomendadas: A100 40GB, H100 80GB para FP16 con contexto largo; RTX 4090 (24 GB) suficiente para FP16 en contextos moderados; RTX 3090 (24 GB) también viable.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y GPUs con 16 GB o más en cuantización de 8 bits; en 4 bits podría ejecutarse en GPUs de 8 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), transformers con `accelerate`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch17 | 6.738.415.616 | no disponible | llama2 | Checkpoint de desaprendizaje (época 17/20) sobre TOFU forget10 |
| locuslab/tofu_ft_llama2-7b | ~6,7 B | no disponible | llama2 | Modelo base afinado sobre TOFU completo, sin desaprendizaje |
| NousResearch/Llama-2-7b-chat-hf | ~6,7 B | no disponible | llama2 | Llama 2 7B chat estándar, origen de embeddings y LM head |
| Llama 2 7B (Meta) | ~6,7 B | 4.096 tokens (referencia de la familia) | llama2 | Modelo base original de la familia |

La comparación relevante es frente a `locuslab/tofu_ft_llama2-7b` (mismo tamaño y licencia, sin olvido) y frente a otros métodos de desaprendizaje sobre TOFU, para los que no se dispone de datos de rendimiento en esta ficha.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción; no se han publicado evaluaciones de calidad ni de seguridad.
- El proceso de desaprendizaje puede no eliminar por completo el conocimiento del subconjunto `forget10`; la eficacia real del olvido no está cuantificada en la información disponible.
- Riesgo de alucinación inherente a Llama 2 7B, sin mitigaciones documentadas específicas para este checkpoint.
- Idiomas: solo inglés declarado; el rendimiento en otros idiomas no está garantizado.
- La reinicialización de *input embeddings* y *LM head* desde Llama-2-7b-chat-hf puede introducir discrepancias respecto al vocabulario o la distribución original del modelo afinado, con impacto no documentado en la perplejidad.
- Licencia Llama 2 Community License: restricciones de uso comercial y obligaciones de atribución según los términos de Meta; revisar antes de cualquier despliegue.
- El checkpoint corresponde a la época 17 de 20, por lo que no es necesariamente el punto final del proceso de desaprendizaje.
- Sin descargas ni *likes* en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch17
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Manifiesto del autor: `ihl_manifest.json` (referenciado en la model card, dentro del repositorio)
- TOFU benchmark (referencia): https://github.com/locuslab/tofu
