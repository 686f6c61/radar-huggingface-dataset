# vuhaian/qlora_27b_53k_phase1_adapter

## Resumen

`vuhaian/qlora_27b_53k_phase1_adapter` es un adaptador QLoRA (Low-Rank Adaptation con cuantización de 4 bits) diseñado para ajustar el modelo base `Qwen/Qwen3.8-27B`. El autor, `vuhaian`, lo presenta como la fase 1 de un plan de entrenamiento en dos fases, con el objetivo de mejorar el rendimiento del modelo en un conjunto de datos específico (`vuhaian/53k_lastdance`). El adaptador añade 217,6 millones de parámetros entrenables sobre el modelo base congelado, que se cuantiza a NF4 durante el entrenamiento para reducir el uso de memoria. Este enfoque es relevante porque permite afinar modelos de gran tamaño (27B) con recursos limitados, manteniendo un rendimiento cercano al del modelo denso (el 95,3% según la documentación).

La fase 1 se entrena con 80 pasos (equivalente a ~4% de una época), con una pérdida calculada solo sobre la última respuesta del asistente en conversaciones empaquetadas a 16.384 tokens. No se dispone de información sobre la licencia, los idiomas soportados ni los resultados de benchmarks estándar. Se trata de un adaptador experimental, sin descargas ni interacciones en Hugging Face, que requiere cargarse sobre el modelo base mediante la librería `peft`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA sobre `Qwen/Qwen3.8-27B` (base transformer) |
| Parámetros totales | 217,6M (adaptador) + 27B (modelo base, no disponible) |
| Parámetros activos | Todos (no es MoE) |
| Longitud de contexto | 16.384 tokens (empaquetado durante el entrenamiento) |
| Tipos de cuantizacion | Base cuantizada a NF4 durante el entrenamiento; en inferencia se puede cargar la base con cuantización (no especificada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador utiliza la técnica QLoRA, que combina cuantización de 4 bits del modelo base con adaptadores de bajo rango. La configuración del adaptador es: r=32, alpha=64, y un total de 400 módulos LoRA distribuidos en 48 módulos de atención lineal (con 3 sub-módulos cada uno), 16 módulos de atención completa (4 sub-módulos) y 64 módulos MLP (3 sub-módulos). El entrenamiento se realizó sobre el modelo base congelado, cuantizado a NF4, que alcanza el 95,3% de la calidad del modelo denso según la model card.

El proceso de entrenamiento sigue un currículo de dos fases: la fase 1 (este adaptador) utiliza el dataset `vuhaian/53k_lastdance` con 80 pasos, una tasa de aprendizaje de 5e-5 con programación coseno, y un batch global de 16. Las secuencias se empaquetan a 16.384 tokens y la pérdida se calcula únicamente sobre la última respuesta del asistente. La fase 2 (no incluida en este repositorio) continúa desde el adaptador de la fase 1 con otro dataset y una tasa menor. No se detalla el contenido de los datasets ni el preprocesado adicional.

## Capacidades

- El adaptador hereda las capacidades del modelo base `Qwen/Qwen3.8-27B`, que no se especifican en la información disponible.
- El entrenamiento está orientado a tareas de conversación o instrucciones, ya que la pérdida se aplica sobre la última respuesta del asistente.
- No hay información sobre soporte de tool calling, agentes, razonamiento multietapa, capacidades multimodales o multilingüismo específicas del adaptador.
- No se dispone de datos sobre capacidades especiales (p. ej., modo de razonamiento extendido).

## Casos de uso

- No se documentan casos de uso específicos en la model card. Al ser un adaptador para el modelo base, podría aplicarse en escenarios de generación de texto o chat, pero su efectividad depende del dominio del dataset de entrenamiento (`53k_lastdance`), cuyo contenido no se describe.
- Se recomienda evaluar el adaptador en tareas similares a las que se usaron para su entrenamiento antes de usarlo en producción.
- El adaptador puede integrarse en pipelines de ajuste fino incremental, sirviendo como base para la fase 2 del currículo.

## Benchmarks y rendimiento

La model card proporciona valores de pérdida en un conjunto de evaluación excluido durante el entrenamiento (held-out). No se presentan resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

| Métrica | Fase 1 (fin) | Fase 2 (fin) |
|---|---|---|
| Pérdida en heldout | 0,2691 | 0,2525 |
| Pérdida en el resto | 0,2805 | 0,2729 |

Nota: los valores corresponden a la pérdida de lenguaje en los conjuntos de evaluación. No hay comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador en sí ocupa 0,5 GB (pesos safetensors). Para cargarlo junto con el modelo base de 27B, se necesita la memoria suficiente para el base.
- El modelo base `Qwen/Qwen3.8-27B` se puede cargar cuantizado (p. ej., con `bitsandbytes` a 4-bit) para reducir los requisitos de VRAM. Con cuantización de 4 bits, la base ocupa aproximadamente 5-6 GB, más el adaptador, por lo que una GPU con 8-12 GB VRAM podría ser suficiente para inferencia (estimación no confirmada).
- Para el entrenamiento con QLoRA, se recomienda una GPU con al menos 16-24 GB VRAM (p. ej., RTX 3090/4090 o A10G), aunque no hay especificación oficial.
- El modelo se carga con `peft.PeftModel.from_pretrained`, compatible con librerías como `transformers` y `peft`. No se mencionan soportes para vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables con el mismo adaptador o entrenamiento específico. La comparativa solo podría realizarse con el modelo base `Qwen/Qwen3.8-27B` sin adaptar, pero no se proporcionan resultados de rendimiento para el adaptador. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No se especifica la licencia del adaptador, lo que impide determinar su uso comercial o restricciones de redistribución.
- El entrenamiento es muy corto (80 pasos, ~4% de una época en fase 1), lo que puede provocar overfitting al dataset de entrenamiento o un rendimiento subóptimo en tareas generales.
- El dataset de entrenamiento no está documentado, por lo que no se pueden conocer posibles sesgos o limitaciones de dominio.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto más allá de la longitud de 16.384 tokens usada en el entrenamiento.
- Al ser un adaptador, su uso requiere cargar el modelo base, lo que implica los requisitos de hardware y las consideraciones de licencia del modelo base (que tampoco está documentada).

## Enlaces

- Hugging Face: [vuaihan/qlora_27b_53k_phase1_adapter](https://huggingface.co/vuaihan/qlora_27b_53k_phase1_adapter)
- Paper de QLoRA: [arXiv:2305.14314](https://arxiv.org/abs/2305.14314)
- Repositorio de QLoRA (artidoro/qlora): [https://github.com/artidoro/qlora](https://github.com/artidoro/qlora)
