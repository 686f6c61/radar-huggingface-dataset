# ytfsic/Qwen3.5-4B-Hindsight-Synthesis

## Resumen
Qwen3.5-4B-Hindsight-Synthesis es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario ytfsic. Se trata de un modelo especializado en las 10 subtareas de síntesis y reflexión de Hindsight 1.2.3, un sistema de consolidación de memoria y recuperación de información, con soporte bilingüe en inglés y portugués. El modelo se distribuye en precisión completa BF16 junto con el adaptador LoRA ganador del torneo de selección.

El modelo resuelve problemas específicos que los modelos base no manejan bien: la deduplicación de observaciones (donde los modelos base tienden a colapsar en un `merge` ciego) y las operaciones estructuradas de delta de modelo mental (donde caen en bucles de repetición de 4096 tokens). Con 4.659.865.088 parámetros totales y una arquitectura híbrida Gated DeltaNet, está pensado para servir localmente en GPUs de consumo con ventanas de contexto largas (24K-64K).

La relevancia actual radica en su especialización: no es un modelo de propósito general, sino un componente de infraestructura para pipelines de memoria y reflexión que requieren salidas JSON estrictas y fiables. Su licencia Apache-2.0 y su compatibilidad con endpoints lo hacen adecuado para integración en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Gated DeltaNet (24 capas Gated DeltaNet + 8 capas de atención completa, 32 capas totales) |
| Parámetros totales | 4.659.865.088 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 24K-64K (según la model card; entrenado con max_seq_length=16384) |
| Tipos de cuantización | BF16 (pesos completos), GGUF con imatrix (IQ4_XS mencionado), MLX 8-bit |
| Idiomas soportados | Inglés (en), portugués (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), GGUF, MLX |

## Arquitectura y entrenamiento
El modelo se basa en Qwen3.5-4B, que emplea una arquitectura híbrida con 32 capas: 24 capas de Gated DeltaNet y 8 capas de atención completa (softmax), con un tamaño oculto de 2.560. Solo el 25% de las capas requieren caché KV de atención completa, lo que reduce el coste de memoria en contexto largo. El ajuste fino se realizó con LoRA All-Linear en BF16 (sin cuantización 4-bit), con packing desactivado para proteger el estado recurrente de Gated DeltaNet, NEFTune desactivado y máscara de pérdida solo en el asistente con thinking desactivado. El adaptador LoRA tiene 32,46M parámetros (248 matrices all-linear, r=16, alpha=32) que cubren las proyecciones de Gated DeltaNet, atención completa y MLP.

El entrenamiento se llevó a cabo sobre un corpus bilingüe (EN/PT) de 10 subtareas, saneado y pseudonimizado, con 1.088 filas de entrenamiento y 171 de validación (3 bancos no vistos), tras una auditoría automatizada de PII en 3 rondas con 0 fugas. Se usó max_seq_length=16384, batch efectivo de 16, learning rate 1.0e-4, schedule coseno con warmup_ratio=0.08, 1.5 épocas (101 pasos). La selección post-entrenamiento se hizo mediante un torneo PEFT de 2 etapas (QR+SVD en VRAM) sobre 28 trampas deterministas, una suite de estrés estructural de 54 filas y un canary de capacidades generales EN/PT de 20 prompts, eligiendo `best_spec_depth_eq` (QR+SVD spectral-depth equalized). La cuantización GGUF se calibró con una importance matrix de 96 chunks diversos y de dominio.

## Capacidades
- Generación de texto y razonamiento estructurado con salidas JSON estrictas.
- Consolidación de memoria: clasificación de hechos duraderos vs. momentáneos, actualización/finalización/repetición de observaciones con corchetes temporales, deduplicación intra-lote y protección de observaciones nuevas frente a hechos obsoletos.
- Deduplicación fina: distinción entre casi-duplicados (`keep`) y paráfrasis/superconjuntos reales (`merge`).
- Operaciones de delta de modelo mental: aplicación de parches estructurados mínimos (`add_section`, `remove_section`, `rename_section`, `append_block`, `insert_block`, `replace_block`, `remove_block`, `replace_section_blocks`) o no-op `[]`.
- Retracción de afirmaciones no soportadas en modelos mentales.
- Orquestación de llamadas a herramientas en multi-turno para reflexión (selección de herramientas de recuperación/lectura o `done`).
- Formulación de consultas de búsqueda de observaciones y de recuerdo episódico con parámetros de tokens y razón.
- Síntesis de respuestas finales fundamentadas con citas de IDs recuperados (o abstención con `answer_found: false`).
- Compresión de documentos markdown largos por debajo de un presupuesto de tokens objetivo.
- Generación de consultas de recuperación concisas en una línea (4-12 palabras) en inglés y portugués.
- Capacidades multilingües limitadas a inglés y portugués.
- Soporte de tool calling / function calling mediante las subtareas de reflect_tool_call.
- Soporte de agentes y razonamiento multi-paso a través de la orquestación de reflexión.

## Casos de uso
- Consolidación de memoria en asistentes conversacionales: el modelo clasifica y actualiza observaciones de usuario a lo largo de sesiones, distinguiendo hechos duraderos de estados momentáneos y protegiendo observaciones recientes de hechos obsoletos, gracias a su entrenamiento específico en `consolidation:_Constrained`.
- Deduplicación de bases de conocimiento: en pipelines de ingesta de datos, el modelo separa casi-duplicados sutiles de paráfrasis reales, evitando fusiones erróneas que degradan la calidad del almacén de memoria.
- Mantenimiento de modelos mentales de usuario o entidad: aplica parches estructurados mínimos sobre documentos markdown que representan el estado de conocimiento, permitiendo actualizaciones quirúrgicas sin reescribir secciones completas.
- Agentes de recuperación aumentada multi-turno: el modelo orquesta llamadas a herramientas de búsqueda y recuerdo episódico, formulando consultas con límites de tokens y razones, y sintetizando respuestas finales con citas verificables de los IDs recuperados.
- Compresión de documentación técnica: reduce documentos markdown largos por debajo de un presupuesto de tokens objetivo preservando secciones, útil para generar resúmenes que quepan en ventanas de contexto limitadas.
- Generación de consultas de búsqueda bilingües: en sistemas de búsqueda EN/PT, produce consultas concisas de 4-12 palabras para recuperación, integrándose como paso previo a un motor de búsqueda vectorial.
- Retracción de afirmaciones en sistemas de conocimiento: cuando una fuente se invalida, el modelo retira quirúrgicamente las afirmaciones no soportadas del modelo mental, manteniendo la coherencia del conocimiento almacenado.
- Despliegue local en GPUs de consumo: al requerir caché KV de atención completa solo en 8 de 32 capas, puede servir contextos de 24K-64K en GPUs de 6-8 GB con cuantización GGUF, adecuado para prototipos y entornos con privacidad de datos.

## Benchmarks y rendimiento
La model card incluye una tabla de evaluación con la configuración `IQ4_XS`, `-ctk q8_0 -ctv q8_0` y gramática JSON Schema de producción, pero los resultados numéricos no están disponibles en la información proporcionada (la tabla aparece truncada). No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: en BF16, aproximadamente 9,3 GB solo para pesos (4.659.865.088 parámetros × 2 bytes), más caché KV y overhead; el repo ocupa 9,5 GB. En GGUF IQ4_XS, aproximadamente 2,5-3 GB para pesos, más caché KV.
- GPU recomendadas: A100 o H100 para BF16 con contexto largo; RTX 4090 (24 GB) para BF16 con contexto moderado o GGUF con contexto largo; GPUs de 6-8 GB (CUDA/Vulkan) para GGUF según la model card.
- Cabe en GPU de consumo: sí, en GPUs de 6-8 GB o más con cuantización GGUF, y en Apple Silicon (M-series/M4 Pro) con MLX 8-bit (aproximadamente 1,9 GiB para la variante 2B; la 4B requiere más).
- Opciones de despliegue: transformers (BF16 + LoRA), vLLM (BF16), llama.cpp / llama-server (GGUF), LM Studio, Ollama (GGUF), mlx-lm (MLX), Unsloth Studio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Hindsight-Synthesis | 4,66B | 24K-64K | Apache-2.0 | 10 subtareas Hindsight 1.2.3, EN/PT | Hugging Face (BF16, GGUF, MLX) |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | Apache-2.0 | Propósito general | Hugging Face |
| Qwen3.5-2B-Hindsight-Synthesis | 2B (aproximado) | no disponible | Apache-2.0 | Mismas 10 subtareas, EN/PT | Hugging Face (BF16, GGUF, MLX) |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y especialización; el rendimiento relativo frente a alternativas de la misma categoría no está disponible.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse sobre un corpus bilingüe EN/PT saneado, puede heredar sesgos del modelo base Qwen3.5-4B.
- Riesgo de alucinación: el modelo está entrenado para emitir JSON estricto y abstenerse con `answer_found: false`, pero en tareas de síntesis de respuestas puede generar citas o afirmaciones no fundamentadas si la recuperación es deficiente; la model card no cuantifica este riesgo.
- Limitaciones de contexto o idioma: solo soporta inglés y portugués; el contexto máximo práctico es de 24K-64K según la model card, aunque el entrenamiento usó max_seq_length=16384, por lo que el rendimiento más allá de 16K no está garantizado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribución; el modelo base Qwen3.5-4B también es Apache-2.0.
- Caveats para producción: el modelo es especializado y no debe usarse como modelo de propósito general; las salidas JSON requieren validación contra el esquema de producción; la versión BF16 requiere aproximadamente 9,3 GB de VRAM solo para pesos; la cuantización GGUF IQ4_XS puede degradar la precisión en tareas de deduplicación fina; el adaptador LoRA se distribuye por separado en `lora_adapter/` y debe cargarse junto con los pesos fusionados si se desea reproducir el comportamiento exacto.

## Enlaces
- Hugging Face (BF16 + LoRA): https://huggingface.co/ytfsic/Qwen3.5-4B-Hindsight-Synthesis
- Hugging Face (GGUF): https://huggingface.co/ytfsic/Qwen3.5-4B-Hindsight-Synthesis-GGUF
- Hugging Face (MLX 8-bit): https://huggingface.co/ytfsic/Qwen3.5-4B-Hindsight-Synthesis-MLX-8bit
- Hugging Face (2B BF16): https://huggingface.co/ytfsic/Qwen3.5-2B-Hindsight-Synthesis
- Hugging Face (2B GGUF): https://huggingface.co/ytfsic/Qwen3.5-2B-Hindsight-Synthesis-GGUF
- Hugging Face (2B MLX 8-bit): https://huggingface.co/ytfsic/Qwen3.5-2B-Hindsight-Synthesis-MLX-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio Hindsight: https://github.com/vectorize-io/hindsight
