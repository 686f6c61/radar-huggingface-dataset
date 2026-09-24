# vwdubb/Signal-3.8-27B-Terse-Coder-FP8

## Resumen
vwdubb/Signal-3.8-27B-Terse-Coder-FP8 es un merge de pesos publicado en HuggingFace por el usuario vwdubb. Combina el modelo base agentionai/Signal-3.8-27B con el adaptador LoRA Shockem/Qwen3.8-27b-Terse-Coder-LoRA (ronda 8, rank 16, entrenado con DPO) ya integrado en los pesos. El resultado es un checkpoint de 27.781.427.952 parámetros, en formato safetensors y con licencia Apache 2.0, orientado a tareas de razonamiento y codificación con un estilo de razonamiento deliberadamente "terse", es decir, con pocos tokens de pensamiento.

El modelo pertenece a la familia Qwen3.8 y conserva del base la cabeza MTP (multi-token prediction) para decodificación especulativa, así como los pesos de visión. La ventana de contexto indicada en los ejemplos de despliegue es de 262.144 tokens. Su relevancia actual reside en la eficiencia de tokens: según la model card, Signal ya genera aproximadamente un 52% menos de tokens de "thinking" que Qwen3.8-27B, y el adaptador Terse-Coder recorta el razonamiento alrededor de un 40% adicional, manteniendo o mejorando la tasa de acierto en las pruebas del autor del adaptador.

La ficha debe leerse con cautela: el nombre del repositorio incluye "FP8" y la etiqueta compressed-tensors aparece en los tags, pero la model card describe explícitamente un almacenamiento en bf16, el código de ejemplo usa torch_dtype=torch.bfloat16 y el comando de vLLM indica --dtype bfloat16. No se han publicado benchmarks independientes sobre este artefacto concreto, y el propio autor del adaptador recomienda el LoRA en tiempo de ejecución como forma de despliegue a plena capacidad.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.8; incluye cabeza MTP y pesos de visión heredados del base. No se especifica si es denso o MoE |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (según el ejemplo de despliegue con vLLM, --max-model-len 262144) |
| Tipos de cuantización | El nombre del repositorio indica FP8 y el tag compressed-tensors está presente; la model card describe almacenamiento bf16. No se confirma cuantización FP8 real en la información disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | agentionai/Signal-3.8-27B |
| Adaptador integrado | Shockem/Qwen3.8-27b-Terse-Coder-LoRA (rank 16, alpha 32, ronda 8, DPO) |
| Plantilla de chat | Shockem/froggeric-terse-coder |
| Tamaño del repositorio | 38,5 GB |
| Descargas en HuggingFace | 9 |
| Likes en HuggingFace | 0 |
| Fecha de creación | 2026-09-24 |
| Fecha de actualización | 2026-09-24 |

## Arquitectura y entrenamiento
El artefacto no es un modelo entrenado desde cero, sino un merge de pesos. El procedimiento descrito en la model card es: fusión en fp32 mediante la fórmula `W + B @ A * (lora_alpha / r)`, con alpha 32 y r 16, lo que da una escala de 2,0. Después, el resultado se almacena en bf16 usando redondeo estocástico no sesgado con semilla fija 0, de modo que el merge sea reproducible. La cabeza MTP y los pesos de visión no se tocan, porque el adaptador no los modifica y Signal conserva la cabeza MTP del base, por lo que la decodificación especulativa sigue estando disponible.

El uso de redondeo estocástico responde a que los deltas del adaptador son muy pequeños: la norma relativa `‖Δ‖/‖W‖` se sitúa aproximadamente entre 4e-4 y 1e-3, por debajo de la resolución por elemento de bf16. La model card del adaptador mide una supervivencia del delta de solo el 31–61% con redondeo bf16 simple, frente al 94–99,9% en fp16. El redondeo estocástico es insesgado: cada elemento se redondea hacia arriba o hacia abajo con una probabilidad ponderada para que su valor esperado coincida con el valor fusionado real, preservando el delta en promedio y manteniendo el checkpoint en el dtype y tamaño del base.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación del modelo base Qwen3.8-27B. Del adaptador se sabe que es un LoRA rank 16 entrenado con DPO en su ronda 8, dirigido a tareas de código con el modo thinking activado. Se trata de una edición de comportamiento, no de conocimiento, según la propia model card.

## Capacidades
- Generación de texto y razonamiento con modo thinking; el esfuerzo de razonamiento es ajustable mediante `reasoning_effort`.
- Codificación y tareas de programación, que son el objetivo declarado del adaptador Terse-Coder.
- Eficiencia de tokens: el base Signal produce aproximadamente un 52% menos de tokens de pensamiento que Qwen3.8-27B, y el adaptador recorta el razonamiento alrededor de un 40% adicional según las mediciones de su autor.
- Soporte de tool calling y function calling: el ejemplo de vLLM activa `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Soporte para agentes y razonamiento multi-paso: la plantilla de chat `Shockem/froggeric-terse-coder` está orientada al comportamiento agéntico y la model card advierte que servir el merge con la plantilla original de Qwen cambia dicho comportamiento.
- Decodificación especulativa MTP: la cabeza está incluida y sin modificar; se puede activar con `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`.
- Capacidades de visión: la model card menciona que los pesos de visión no se tocan y el código de ejemplo usa `AutoModelForImageTextToText`, pero no se detallan capacidades concretas de imagen.
- Capacidades multilingües: no disponible.

## Casos de uso
- Asistente de código en el IDE o en el terminal: el modelo puede generar parches y explicaciones breves porque el adaptador reduce los tokens de razonamiento, lo que abarata la inferencia en sesiones interactivas.
- Agente autónomo de resolución de issues: con 262.144 tokens de contexto puede cargar partes extensas de un repositorio, usar tool calling para leer y escribir ficheros, y ejecutar ciclos multi-paso de edición y verificación.
- Revisión de código en pipelines de CI/CD: integrado mediante vLLM con el parser `qwen3_coder`, puede analizar diffs, detectar errores y sugerir cambios antes de la fusión de ramas.
- Generación de tests unitarios y de integración: el modelo puede inspeccionar una función o un módulo completo y producir pruebas, gracias a su orientación a código y a su ventana de contexto larga.
- RAG sobre bases de código monolíticas: la ventana de 262.144 tokens permite incluir documentación, esquemas y fragmentos de código extensos sin recurrir a resúmenes agresivos que pierdan detalle.
- Generación de documentación técnica y changelogs: el estilo terse reduce la verbosidad, lo que resulta útil para resúmenes de cambios y notas de versión destinadas a desarrolladores.
- Soporte técnico a desarrolladores: conversaciones multi-turno con contexto largo, donde el modelo puede recordar decisiones de diseño previas y responder con explicaciones concisas.
- Análisis de capturas o diagramas si finalmente se confirman las capacidades de visión heredadas: la model card menciona pesos de visión intactos, pero no detalla el rendimiento en tareas multimodales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks independientes sobre este artefacto en la información disponible. La model card indica explícitamente que no se han ejecutado benchmarks independientes sobre este merge. A continuación se recogen las únicas métricas divulgadas, que corresponden al modelo base Signal, al adaptador o a pruebas del adaptador sobre otros artefactos, no necesariamente a este checkpoint.

| Métrica | Valor | Contexto |
|---|---|---|
| Reducción de tokens de thinking frente a Qwen3.8-27B | ~52% | Medición atribuida al modelo base Signal |
| Reducción adicional de tokens de razonamiento | ~40% | Medición del adaptador Terse-Coder según su model card |
| Tasa de acierto en held-out-40 tras merge y recuantización | 70% → 60–62% | Medición del adaptador sobre base Qwen con merge fp32 → fp16 → NVFP4; no sobre este artefacto |
| Supervivencia del delta con redondeo bf16 simple | 31–61% | Medición del adaptador |
| Supervivencia del delta en fp16 | 94–99,9% | Medición del adaptador |
| Pass rate con doble aplicación del LoRA | 63% con fallos `no_code` | Advertencia del adaptador al cargar el LoRA sobre un modelo que ya lo integra |

## Requisitos de hardware
- VRAM estimada en bf16: los 27.781.427.952 parámetros ocupan aproximadamente 55,6 GB solo en pesos. Con caché de activaciones, overhead de runtime y espacio para KV cache, un despliegue realista necesita del orden de 65–75 GB.
- VRAM estimada si el artefacto fuese realmente FP8: los pesos ocuparían aproximadamente 27,8 GB y el despliegue completo podría moverse en el rango de 35–45 GB, aunque la model card no confirma esta cuantización.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o configuraciones con tensor parallelism sobre 2× A100 40/48 GB. No cabe en una única RTX 4090 de 24 GB.
- GPU recomendadas si fuese FP8: L40S 48 GB, RTX 6000 Ada 48 GB, A6000 48 GB o A100 40 GB, siempre con margen para KV cache.
- GPU de consumo: en bf16 no cabe en ninguna GPU de consumo actual de 24 GB o menos. Si se convirtiese a una cuantización de 4 bits no incluida en el repositorio, los pesos bajarían a unos 14–16 GB y podría encajar en RTX 4090, RTX 3090 o similares de 24 GB, pero esa conversión no se distribuye oficialmente.
- Contexto largo: los 262.144 tokens de ventana implican una KV cache muy grande. Para aprovechar el contexto máximo se necesitan GPUs de 80 GB o paralelismo multi-GPU; no se dispone de cifras concretas de memoria de KV cache para este modelo.
- Opciones de despliegue: vLLM, con los parámetros indicados en la model card (`--dtype bfloat16`, `--max-model-len 262144`, `--reasoning-parser qwen3`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder`). También es cargable con Transformers usando `AutoModelForImageTextToText` y `AutoProcessor`.
- Otras opciones: llama.cpp, Ollama o TGI no están documentadas para este checkpoint. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no se proporciona en el repositorio. TGI no aparece en la model card.
- Latencia y throughput: no disponible. La decodificación especulativa MTP puede mejorar el throughput si se activa, pero no hay cifras publicadas para este artefacto.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vwdubb/Signal-3.8-27B-Terse-Coder-FP8 | 27,78B | 262.144 tokens | Apache 2.0 | safetensors | Merge del base con el LoRA Terse-Coder; discrepancia entre nombre FP8 y card bf16 |
| agentionai/Signal-3.8-27B | ~27B (no se detalla el valor exacto) | no disponible | Apache 2.0 según la model card del merge | safetensors | Modelo base; ya reduce ~52% los tokens de thinking frente a Qwen3.8-27B |
| Shockem/Qwen3.8-27b-Terse-Coder-LoRA | Adaptador LoRA (rank 16) | no disponible | no disponible | safetensors (LoRA) | Requiere un modelo base; su autor recomienda usarlo en runtime y no fusionado para plena capacidad |
| Qwen3.8-27B (Qwen Team, Alibaba Cloud) | ~27B (no se detalla el valor exacto) | no disponible | no disponible en la información proporcionada | safetensors | Modelo original de la familia; referencia de comparación en tokens de razonamiento |

## Limitaciones y advertencias
- Discrepancia entre el nombre del repositorio, que indica FP8, y la model card, que describe almacenamiento en bf16 y comandos con `--dtype bfloat16`. Antes de desplegar en producción conviene verificar el dtype real de los pesos.
- No existen benchmarks independientes sobre este artefacto. Las cifras de reducción de tokens y de tasa de acierto proceden del base Signal o del adaptador, no de una evaluación externa de este merge.
- El autor del adaptador midió una pérdida de capacidad tras fusionar sobre el base Qwen estándar: de 70% a 60–62% en su held-out-40 después de merge fp32 → fp16 → NVFP4. Este merge almacena bf16 sin recuantización, por lo que la pérdida debería ser menor, pero no es cero y no está medida en este artefacto.
- No se debe cargar el LoRA Terse-Coder encima de este modelo. La doble aplicación acorta en exceso el razonamiento y, en las pruebas del adaptador, produjo un 63% de pass rate con fallos del tipo `no_code`.
- El adaptador es una edición de comportamiento, no de conocimiento. Si una tarea requiere derivaciones largas, hay que subir `reasoning_effort`; de lo contrario, el modelo puede responder de forma demasiado breve.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de fidelidad factual para este merge. Al estar orientado a código, conviene validar las salidas en tareas de conocimiento general.
- Sesgos conocidos: no disponible. Al heredar el base Qwen3.8-27B, puede arrastrar los sesgos de dicho modelo, pero no se documentan en la información proporcionada.
- Idiomas soportados: no disponible. No se detalla el rendimiento multilingüe ni la cobertura de idiomas distintos del inglés.
- Contexto largo: aunque la ventana declarada es de 262.144 tokens, no se ha medido la degradación en contextos muy extensos. Además, la KV cache correspondiente exige una VRAM considerable.
- Plantilla de chat: servir el merge con la plantilla original de Qwen en lugar de `Shockem/froggeric-terse-coder` cambia el comportamiento agéntico, según la model card.
- Configuración de muestreo: Signal recomienda temperatura 0,6, min-p 0,05, top-p 0,95 y top-k 20. Sin embargo, si se activa la decodificación especulativa MTP, vLLM rechaza `min_p`, por lo que hay que omitirlo en ese caso.
- Licencia: Apache 2.0, lo que permite uso comercial siempre que se conserven los avisos de copyright y licencia. Hay que verificar igualmente las licencias de los modelos upstream, en particular la de Qwen3.8-27B, que no se detalla en la información disponible.
- Modelo con muy baja adopción en el momento de la ficha: 9 descargas y 0 likes, lo que limita la validación comunitaria.

## Enlaces
- HuggingFace del modelo: https://huggingface.co/vwdubb/Signal-3.8-27B-Terse-Coder-FP8
- Modelo base: https://huggingface.co/agentionai/Signal-3.8-27B
- Adaptador LoRA: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-LoRA
- Organización Qwen en HuggingFace: https://huggingface.co/Qwen
- Papers, blogs o demos adicionales: no disponible en la información proporcionada.
