# violetxi/qwen35-9b-wmrl-v4-c2-27b-judged

## Resumen

El modelo `violetxi/qwen35-9b-wmrl-v4-c2-27b-judged` es un checkpoint de fine-tuning completo (full-finetune) del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario violetxi. Forma parte de un estudio de "internalización del mundo" (world-internalization) en su línea v4, donde se entrena un modelo estudiante de 9B parámetros sobre un corpus sintético de firmas de abogados llamado Calderwood & Harkness, con un pool de semillas "think-on" de aproximadamente 50.000 ejemplos. El checkpoint corresponde a la condición `c2-27b-judged` y al guardado final.

El modelo está injertado de nuevo en el layout compuesto del hub (clase `Qwen3_5ForConditionalGeneration`), lo que permite servirlo directamente con vLLM sin conversiones adicionales. Su relevancia radica en ser un ejemplo de adaptación de un modelo generalista a un dominio específico (legal) mediante fine-tuning completo, manteniendo la arquitectura del modelo base. No se dispone de información sobre el contexto, idiomas o capacidades específicas del fine-tune, aunque el modelo base Qwen3.5-9B es un modelo denso multimodal con atención híbrida y soporte de contexto largo (262K según documentación de vLLM).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5-9B (transformer denso con atención híbrida gated delta networks, según documentación del modelo base) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3.5-9B soporta 262K, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo del Qwen3.5-9B, lo que implica que se actualizan todos los parámetros del modelo base durante el entrenamiento. El corpus de entrenamiento es el conjunto sintético Calderwood & Harkness, un dataset de firmas de abogados generado artificialmente para el estudio de internalización del mundo. Se menciona un pool de semillas "think-on" de ~50k ejemplos, pero no se detallan el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. El checkpoint se describe como "v4 lineage: 9B student" y se ha injertado de nuevo en el layout compuesto del hub, reemplazando 427 archivos del modelo base según el campo `graft`. No se especifican innovaciones técnicas adicionales más allá del propio enfoque de entrenamiento.

## Capacidades

No se han documentado capacidades específicas para este fine-tune. Al ser un fine-tune del Qwen3.5-9B, se espera que herede las capacidades del modelo base, que según la documentación de vLLM incluyen:

- Generación de texto y razonamiento
- Soporte multimodal (visión)
- Tool calling / function calling
- Contexto largo (262K en el modelo base)
- Capacidades multilingües (no confirmadas para este checkpoint)

Sin embargo, no hay evidencia publicada de que estas capacidades se mantengan íntegras tras el fine-tuning sobre el corpus legal sintético. Se recomienda verificar el comportamiento real del modelo antes de usarlo en producción.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Dado su entrenamiento sobre un corpus legal sintético, podría aplicarse a tareas de procesamiento de lenguaje jurídico, como:

- Análisis y resumen de contratos y documentos legales
- Asistencia en redacción de cláusulas o memorandos
- Extracción de entidades y relaciones en textos legales
- Generación de respuestas en chatbots especializados en derecho

No obstante, al ser un corpus sintético, la generalización a documentos legales reales no está garantizada. Para tareas generales de generación de texto, el modelo base Qwen3.5-9B es una opción más fiable y mejor documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se dispone de requisitos oficiales de hardware para este modelo. Como estimación general para un modelo denso de 9.65B parámetros:

- VRAM estimada para inferencia en FP16: ~19-20 GB (9.65B × 2 bytes)
- VRAM estimada con cuantización INT8: ~10 GB
- VRAM estimada con cuantización INT4: ~5 GB
- GPU recomendadas: una GPU con 24 GB de VRAM (p. ej., RTX 4090, A10G, L4) puede ejecutar el modelo en FP16; GPUs con 16 GB (p. ej., RTX 4080) requerirían cuantización
- Opciones de despliegue: vLLM (indicado explícitamente como servible), también compatible con llama.cpp, Ollama o TGI si se convierten los pesos a GGUF o AWQ
- Latencia y throughput: no disponibles

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos. El modelo base Qwen3.5-9B es la referencia natural, pero no se han publicado métricas que permitan comparar el rendimiento del fine-tune frente al base o frente a otros modelos de tamaño similar (p. ej., Llama 3.1 8B, Mistral 7B). Se recomienda consultar la documentación del modelo base para una comparativa general.

## Limitaciones y advertencias

- El corpus de entrenamiento es sintético (Calderwood & Harkness), lo que puede limitar la capacidad del modelo para manejar documentos legales reales con vocabulario, formatos y matices no representados en el dataset.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez. El uso en producción requiere validación exhaustiva.
- No se confirma la longitud de contexto efectiva tras el fine-tuning; aunque el modelo base soporta 262K, el fine-tuning podría alterar este comportamiento.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento o la idoneidad para aplicaciones legales reales.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-c2-27b-judged
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Documentación de vLLM para Qwen3.5-9B: https://recipes.vllm.ai/Qwen/Qwen3.5-9B
- Catálogo de modelos de Microsoft Foundry (Qwen3.5-9B): https://ai.azure.com/catalog/models/qwen-qwen3.5-9b
