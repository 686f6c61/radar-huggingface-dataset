# ytfsic/Qwen3.5-2B-Hindsight-Synthesis

## Resumen

Qwen3.5-2B-Hindsight-Synthesis es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-2B, desarrollado por el usuario ytfsic y publicado en Hugging Face bajo licencia Apache-2.0. El modelo está especializado en las 10 subtareas de síntesis y reflexión del framework Hindsight 1.2.3, un sistema de consolidación de memoria y razonamiento estructurado. Se distribuye en precisión completa BF16 (pesos fusionados) junto con el adaptador LoRA ganador en el directorio `lora_adapter/`, y cuenta con 2.274.069.824 parámetros totales según los pesos safetensors.

La relevancia de este modelo radica en su enfoque: no es un modelo de propósito general, sino un especialista entrenado para producir salidas JSON estrictas en tareas de consolidación de observaciones, deduplicación, operaciones sobre modelos mentales, orquestación de llamadas de herramientas y síntesis de respuestas con citas. Según la model card, los modelos base sin ajuste tienden a colapsar en decisiones de `merge` ciegas durante la deduplicación y a entrar en bucles de repetición de 4.096 tokens en operaciones estructuradas, problemas que este ajuste pretende corregir.

El modelo se apoya en la arquitectura híbrida Gated DeltaNet de Qwen3.5, con 24 capas (18 Gated DeltaNet + 6 de atención completa) y un tamaño oculto de 2.048. Está entrenado de forma bilingüe en inglés y portugués, y se ofrece también en formatos GGUF (con imatrix) y MLX 8-bit para despliegue local en GPUs de consumo y Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Gated DeltaNet (24 capas: 18 Gated DeltaNet + 6 atención completa), hidden size 2.048 |
| Parametros totales | 2.274.069.824 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 24K–64K según la model card (entrenamiento con max_seq_length=16384) |
| Tipos de cuantizacion | BF16 nativo; GGUF con imatrix (variante IQ4_XS evaluada); MLX 8-bit |
| Idiomas soportados | Inglés (en) y portugués (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16 fusionado) + adaptador PEFT LoRA en `lora_adapter/`; GGUF y MLX en repositorios separados |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, cuya arquitectura híbrida combina capas Gated DeltaNet con capas de atención completa. Según la model card, solo el 25% de las capas requieren una caché KV de atención softmax completa, lo que mantiene compacta y rápida la inferencia en contexto largo (24K–64K) en GPUs de consumo y Apple Silicon. El ajuste se realizó mediante LoRA All-Linear en BF16 completo (`load_in_4bit=False`, `packing=False` para proteger el estado recurrente de Gated DeltaNet, `NEFTune=OFF` y `enable_thinking=False` con máscara de pérdida solo en el turno del asistente). El adaptador cubre 16,82M parámetros en 186 matrices (r=16, alpha=32) sobre Gated DeltaNet (`in_proj_qkv/z/a/b`, `out_proj`), atención completa (`q/k/v/o_proj`) y MLP (`gate/up/down_proj`). El tower de visión y el `lm_head` se mantuvieron congelados.

El entrenamiento usó `max_seq_length=16384`, batch efectivo de 16, learning rate de 1.2e-4, schedule coseno con `warmup_ratio=0.08` y 1,5 épocas (101 pasos) sobre un corpus bilingüe EN/PT de 10 subtareas, saneado y pseudonimizado con cero PII (1.088 filas de entrenamiento y 171 de validación retenida en 3 bancos no vistos, con auditoría automatizada de PII en 3 rondas). La selección post-entrenamiento se hizo mediante un torneo PEFT automatizado de dos etapas (QR+SVD en VRAM) que eligió la variante `best_spec_depth_eq` (QR+SVD con ecualización de profundidad espectral, `mean ||BA||_F = 0.1158`, `erank = 10.34`, `gamma = 0.85`) evaluada sobre 28 trampas deterministas, una suite de estrés estructural de 54 filas y un canario de capacidad general EN/PT de 20 prompts. La cuantización GGUF se calibró con una importance matrix de 96 fragmentos diversos y de dominio.

## Capacidades

- Generación de texto y razonamiento estructurado con salidas JSON estrictas para las 10 subtareas de Hindsight 1.2.3.
- Consolidación de memoria (`consolidation:_Constrained`): clasificación de hechos duraderos frente a momentáneos, actualización, cierre y repetición de observaciones con corchetes temporales, deduplicación intra-batch y protección de observaciones nuevas frente a hechos obsoletos.
- Deduplicación fina (`consolidation_dedup:_DedupDecision`): distinción entre casi-duplicados sutiles (`keep`) y paráfrasis o superconjuntos reales (`merge`).
- Operaciones sobre modelos mentales (`mental_model_delta_ops:DeltaOperationList`): aplicación de parches estructurados mínimos (`add_section`, `remove_section`, `rename_section`, `append_block`, `insert_block`, `replace_block`, `remove_block`, `replace_section_blocks`) o no-op `[]`.
- Retracción de afirmaciones no soportadas (`mental_model_retraction_ops:none`) con salida `[]` cuando la afirmación sigue respaldada.
- Orquestación multi-turno de reflexión (`reflect_tool_call:next_call`) para elegir herramientas de recuperación o lectura, o bien `done`.
- Formulación de llamadas de búsqueda de observaciones (`reflect_tool_call:search_observations`) y de recuerdo episódico (`reflect_tool_call:recall`) con parámetros de consulta y presupuesto de tokens.
- Síntesis de respuestas finales fundamentadas (`reflect:done`) con citas de IDs recuperados o abstención explícita no vacía (`answer_found: false`).
- Compresión de documentos markdown largos bajo un presupuesto de tokens objetivo (`reflect_shorten`).
- Generación de consultas de recuperación bilingües concisas en una línea de 4–12 palabras (`reflect_query`).
- Capacidad bilingüe inglés-portugués.
- Soporte de tool calling / function calling mediante las subtareas de orquestación de Hindsight.
- Capacidad de visión heredada del modelo base (el tower de visión se mantiene congelado), aunque el ajuste se centra en texto.

## Casos de uso

- Consolidación de memoria en asistentes conversacionales: el modelo clasifica qué hechos de una conversación deben persistir y cuáles son momentáneos, actualizando o cerrando observaciones con marcas temporales; resulta adecuado porque su salida JSON estricta se integra directamente en un almacén de memoria estructurado.
- Deduplicación de una base de conocimiento: distingue entre casi-duplicados que deben conservarse (`keep`) y paráfrasis o superconjuntos que deben fusionarse (`merge`), evitando el colapso a `merge` ciego que la model card atribuye a los modelos base.
- Mantenimiento de un modelo mental documental: aplica parches mínimos sobre secciones y bloques de un documento markdown estructurado (`mental_model_delta_ops`), lo que permite actualizaciones incrementales sin reescribir el documento completo.
- Auditoría de afirmaciones en un sistema RAG: retira quirúrgicamente afirmaciones no respaldadas (`mental_model_retraction_ops`) o emite `[]` cuando la evidencia sigue sosteniéndolas, útil para pipelines de verificación factual.
- Agente de recuperación multi-turno: orquesta llamadas a herramientas de búsqueda y recuerdo (`reflect_tool_call`) con presupuestos de tokens, adecuado para agentes que necesitan decidir cuándo seguir recuperando y cuándo responder.
- Síntesis de respuestas con citas: genera respuestas finales fundamentadas que citan únicamente IDs recuperados (`reflect:done`), lo que facilita la trazabilidad en entornos de atención al cliente o documentación técnica.
- Compresión de documentación: reduce documentos markdown largos por debajo de un presupuesto de tokens objetivo (`reflect_shorten`), útil para resúmenes operativos o contextos acotados.
- Búsqueda bilingüe EN/PT: genera consultas de recuperación concisas de 4–12 palabras (`reflect_query`) para motores de búsqueda internos en organizaciones con documentación en inglés y portugués.
- Despliegue local en hardware modesto: la variante GGUF (~1,2 GiB) y la MLX 8-bit (~1,9 GiB) permiten servir el modelo en GPUs de consumo y Macs Apple Silicon para prototipos de memoria y agentes.

## Benchmarks y rendimiento

La model card menciona una evaluación con cuantización `IQ4_XS`, caché `-ctk q8_0 -ctv q8_0` y gramática JSON Schema de producción, pero la información proporcionada se interrumpe en la tabla de resultados (`| Benchmark | Qwen3.5-2B-Hindsight-Synthesis (v4`). No se han publicado en la información disponible los valores numéricos de los benchmarks.

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos BF16 ocupan aproximadamente 4,6 GB (tamaño del repositorio); la variante GGUF IQ4_XS ronda los 1,2 GiB y la MLX 8-bit unos 1,9 GiB, según la model card.
- GPU recomendadas: no especificadas explícitamente en la información disponible. La model card cita GPUs CUDA/Vulkan de 6–8 GB o más para la variante GGUF de 4B y presupuestos de VRAM ajustados para la de 2B; para BF16 se requiere capacidad suficiente para ~4,6 GB de pesos más caché KV.
- Cabe en GPU de consumo: sí, especialmente en formato GGUF (~1,2 GiB) y MLX 8-bit (~1,9 GiB); la model card menciona servir en GPUs de consumo y Macs Apple Silicon (M-series / M4 Pro).
- Opciones de despliegue: transformers, vLLM (para BF16), llama.cpp / llama-server, LM Studio, Ollama y mlx-lm (Apple Silicon), según la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-Hindsight-Synthesis | 2,27B | 24K–64K | Apache-2.0 | BF16, GGUF, MLX 8-bit | Especialista en 10 subtareas Hindsight 1.2.3, bilingüe EN/PT |
| Qwen/Qwen3.5-2B (base) | no disponible en la información | no disponible en la información | Apache-2.0 | safetensors | Modelo base sin ajuste; según la model card colapsa a `merge` ciego y bucles de repetición en tareas estructuradas |
| Qwen3.5-4B-Hindsight-Synthesis | no disponible en la información | no disponible en la información | Apache-2.0 | BF16, GGUF, MLX 8-bit | Misma familia, mayor tamaño, orientado a inferencia de precisión completa y vLLM |

No se dispone de datos de benchmarks comparativos en la información proporcionada para establecer diferencias cuantitativas de rendimiento entre estas variantes.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado para las 10 subtareas de Hindsight 1.2.3 y no debe asumirse un rendimiento de propósito general equivalente al del modelo base.
- Idiomas limitados: solo inglés y portugués; no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinación: como todo modelo generativo, puede producir hechos o citas incorrectas; la subtarea `reflect:done` está diseñada para citar solo IDs recuperados, pero no elimina el riesgo.
- Sesgos: no se documentan sesgos específicos en la información disponible; el corpus se describe como saneado y pseudonimizado con cero PII, pero no se detalla su composición demográfica.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base y los componentes derivados deben cumplir también las condiciones de Qwen/Qwen3.5-2B.
- Dependencia de esquemas JSON: el rendimiento depende del uso de gramáticas JSON Schema de producción; fuera de ese modo, la calidad de las salidas estructuradas puede degradarse.
- Contexto: aunque la model card cita 24K–64K, el entrenamiento se realizó con `max_seq_length=16384`, por lo que el comportamiento más allá de esa longitud no está validado en la información disponible.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación es 2026-11-26; se trata de una publicación reciente sin validación comunitaria extensa.

## Enlaces

- Hugging Face: https://huggingface.co/ytfsic/Qwen3.5-2B-Hindsight-Synthesis
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante 4B BF16: https://huggingface.co/ytfsic/Qwen3.5-4B-Hindsight-Synthesis
- Variante 4B GGUF: https://huggingface.co/ytfsic/Qwen3.5-4B-Hindsight-Synthesis-GGUF
- Variante 4B MLX 8-bit: https://huggingface.co/ytfsic/Qwen3.5-4B-Hindsight-Synthesis-MLX-8bit
- Variante 2B GGUF: https://huggingface.co/ytfsic/Qwen3.5-2B-Hindsight-Synthesis-GGUF
- Variante 2B MLX 8-bit: https://huggingface.co/ytfsic/Qwen3.5-2B-Hindsight-Synthesis-MLX-8bit
- Repositorio Hindsight: https://github.com/vectorize-io/hindsight
