# ytfsic/Qwen3.5-4B-Hindsight-Synthesis-MLX-8bit

## Resumen

Qwen3.5-4B-Hindsight-Synthesis-MLX-8bit es una cuantizacion nativa en 8 bits para Apple Silicon (formato MLX) del modelo especializado `ytfsic/Qwen3.5-4B-Hindsight-Synthesis`, desarrollado por el usuario ytfsic. El modelo base parte de `Qwen/Qwen3.5-4B` (licencia Apache-2.0) y ha sido ajustado mediante LoRA para resolver las diez subtareas de sintesis y reflexion del sistema Hindsight 1.2.3, un motor de consolidacion de memoria para agentes. Esta version concreta esta pensada para inferencia local rapida y casi sin perdida en Macs de la serie M mediante `mlx-lm`, Unsloth Studio o LM Studio.

El problema que aborda es concreto: los modelos base genericos tienden a colapsar en decisiones de `merge` ciego al deduplicar observaciones y entran en bucles de repeticion de 4.096 tokens al generar operaciones estructuradas de `mental_model_delta_ops`. Este especialista corrige ambos comportamientos manteniendo fidelidad bilingue en ingles y portugues. La arquitectura subyacente es un hibrido con un 75 % de capas Gated DeltaNet (24 de 32) y solo 8 capas de atencion completa, lo que reduce drasticamente el coste del KV cache en contextos largos.

Con 4.205.751.296 parametros totales y un repositorio de 4,5 GB, el modelo ocupa aproximadamente 4,18 GiB de pesos (unos 4,5 GiB de memoria unificada) en su cuantizacion de 8 bits con `q_bits=8` y `group_size=64`. Es relevante ahora porque permite ejecutar tareas de consolidacion de memoria de agentes en hardware de consumo Apple sin depender de GPU dedicadas ni de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 32 capas (24 Gated DeltaNet + 8 atencion completa), hidden size 2.560 |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 24K-64K (rango operativo indicado por el autor); entrenamiento con `max_seq_length=16384` |
| Tipos de cuantizacion | MLX 8-bit (`q_bits=8`, `group_size=64`); el modelo base ofrece BF16 y GGUF con `imatrix` |
| Idiomas soportados | Ingles (en) y portugues (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 8-bit |

## Arquitectura y entrenamiento

El modelo es un transformer hibrido de 32 capas con hidden size de 2.560, donde 24 capas emplean Gated DeltaNet y solo 8 usan atencion softmax completa. Esta proporcion 75/25 implica que unicamente el 25 % de las capas requiere un KV cache completo, lo que mantiene compacta y rapida la inferencia en contextos largos (24K-64K) sobre GPUs de consumo y Apple Silicon. El modelo base es `Qwen/Qwen3.5-4B`, con el vision tower y el `lm_head` congelados durante el ajuste.

El entrenamiento se realizo mediante un LoRA All-Linear completo en BF16 (`load_in_4bit=False`, `packing=False` para proteger el estado recurrente de Gated DeltaNet, `NEFTune=OFF`, `enable_thinking=False` con mascara de perdida solo en el asistente). El adaptador cubre 32,46 M de parametros en 248 matrices (r=16, alpha=32) sobre Gated DeltaNet (`in_proj_qkv/z/a/b`, `out_proj`), atencion completa (`q/k/v/o_proj`) y MLP (`gate/up/down_proj`). El regimen fue de `max_seq_length=16384`, batch efectivo 16, `learning_rate=1.0e-4`, schedule coseno con `warmup_ratio=0.08` y 1,5 epocas (101 pasos) sobre un corpus bilingue EN/PT anonimizado y sin PII de 10 subtareas (1.088 filas de entrenamiento y 171 de validacion en 3 bancos no vistos, con auditoria automatica de PII en 3 rondas y 0 fugas). La seleccion posterior se hizo con un torneo PEFT automatizado de dos etapas QR+SVD en VRAM que eligio `best_spec_depth_eq` (QR+SVD con ecualizacion de profundidad espectral a media `||BA||_F = 0.155`, erank = 9,65) sobre 28 trampas deterministas, una suite de estres estructural de 54 filas y un canary de capacidad general EN/PT de 20 prompts.

## Capacidades

- Generacion de texto y salida estructurada estricta en JSON para las diez subtareas de Hindsight 1.2.3.
- Consolidacion de memoria (`consolidation:_Constrained`): clasificacion de hechos duraderos frente a momentaneos, actualizacion, cierre y repeticion de observaciones con marcas temporales, deduplicacion intra-lote y proteccion de observaciones nuevas frente a hechos obsoletos.
- Decision de deduplicacion (`consolidation_dedup:_DedupDecision`): distincion entre casi-duplicados sutiles (`keep`) y parafrasis o superconjuntos reales (`merge`).
- Operaciones de modelo mental (`mental_model_delta_ops:DeltaOperationList`): parches estructurados minimos (`add_section`, `remove_section`, `rename_section`, `append_block`, `insert_block`, `replace_block`, `remove_block`, `replace_section_blocks`) o no-op `[]`.
- Retraccion de afirmaciones no respaldadas (`mental_model_retraction_ops:none`).
- Orquestacion multi-turno de reflexion (`reflect_tool_call:next_call`, `search_observations`, `recall`): seleccion de herramientas de recuperacion y lectura, formulacion de busquedas de observaciones y llamadas de recall episodico.
- Sintesis de respuestas finales fundamentadas (`reflect:done`) con citas de IDs recuperados o absteccion no vacia con `answer_found: false`.
- Compresion de documentos markdown largos por debajo de un presupuesto de tokens (`reflect_shorten`).
- Generacion de consultas de recuperacion concisas en texto plano (`reflect_query`, 4-12 palabras, bilingue).
- Capacidad bilingue ingles-portugues.
- Soporte de tool calling estructurado en el marco de Hindsight.

## Casos de uso

- Consolidacion de memoria de agentes: el modelo clasifica hechos duraderos frente a momentaneos y actualiza observaciones con marcas temporales, lo que permite mantener una memoria limpia y coherente en agentes conversacionales de larga duracion.
- Deduplicacion de observaciones en produccion: separa casi-duplicados de parafrasis reales, evitando el colapso a `merge` ciego que sufren los modelos base y reduciendo la redundancia en el almacen de memoria.
- Edicion estructurada de modelos mentales: aplica parches minimos (`add_section`, `replace_block`, etc.) sobre documentos de conocimiento sin reescribir secciones completas, lo que abarata el mantenimiento de bases de conocimiento vivas.
- Reflexion multi-turno con herramientas: orquesta llamadas de recuperacion y lectura (`search_observations`, `recall`) y decide cuando terminar, adecuado para pipelines de agentes que necesitan consultar memoria episodica antes de responder.
- Respuestas fundamentadas con citas: sintetiza respuestas finales citando solo IDs recuperados o absteniendose explicitamente, util en asistentes documentales donde la trazabilidad es requisito.
- Compresion de documentacion: reduce markdown largo por debajo de un presupuesto de tokens, integrable en pipelines de resumen o en la preparacion de contexto para otros modelos.
- Generacion de consultas de busqueda bilingues: produce consultas cortas de 4-12 palabras en ingles o portugues para motores de recuperacion, mejorando la precision del recall.
- Despliegue local en Mac: al ocupar unos 4,5 GiB de memoria unificada, permite ejecutar estas tareas en un portatil M-series sin GPU dedicada, con `mlx-lm`, Unsloth Studio o LM Studio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card menciona evaluaciones cualitativas (28 trampas deterministas, suite de estres estructural de 54 filas y canary EN/PT de 20 prompts) usadas para seleccionar el adaptador, pero no se proporcionan puntuaciones concretas.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 4,18 GiB de pesos y aproximadamente 4,5 GiB de memoria unificada en la cuantizacion MLX 8-bit.
- GPU recomendadas: Apple Silicon de la serie M (la model card menciona explicitamente M-series y M4 Pro). Para el modelo base BF16 o GGUF se requieren GPUs CUDA/Vulkan con 6-8 GB o mas; la variante 2B GGUF baja a unos 1,2 GiB.
- Cabe en GPU de consumo: si, en Macs Apple Silicon; en el ecosistema CUDA, la variante GGUF del mismo modelo esta pensada para GPUs de 6-8 GB o mas.
- Opciones de despliegue: `mlx-lm`, Unsloth Studio y LM Studio para la variante MLX; `llama.cpp`/`llama-server`, LM Studio y Ollama para la variante GGUF; vLLM para el modelo base BF16.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.5-4B-Hindsight-Synthesis-MLX-8bit (este) | 4,2 B | 24K-64K operativo | MLX 8-bit | Apache-2.0 | Especialista en sintesis Hindsight, Apple Silicon |
| Qwen3.5-4B-Hindsight-Synthesis (base) | 4,2 B | 24K-64K operativo | BF16 | Apache-2.0 | Mismo especialista, precision completa para vLLM o reentrenamiento |
| Qwen3.5-4B-Hindsight-Synthesis-GGUF | 4,2 B | 24K-64K operativo | GGUF con `imatrix` | Apache-2.0 | Mismo especialista para `llama.cpp` y GPUs CUDA/Vulkan |
| Qwen3.5-2B-Hindsight-Synthesis-MLX-8bit | ~2 B | no disponible | MLX 8-bit | Apache-2.0 | Version ligera (~1,9 GiB) del mismo especialista |

Las alternativas directamente comparables son las otras variantes de la misma familia Hindsight Synthesis; no se dispone de datos de benchmarks para comparar el rendimiento frente a especialistas de terceros.

## Limitaciones y advertencias

- Modelo especializado: esta ajustado para las diez subtareas de Hindsight 1.2.3; su comportamiento en tareas generales fuera de ese dominio no esta caracterizado en la informacion disponible.
- Idiomas limitados a ingles y portugues; el castellano no figura entre los idiomas soportados.
- Riesgo de alucinacion: aunque el modelo emite abstecciones explicitas (`answer_found: false`) y citas de IDs, la sintesis de respuestas sigue siendo generativa y requiere validacion en produccion.
- Sesgos: no se documentan sesgos especificos; el corpus de entrenamiento fue anonimizado y auditado para PII (0 fugas en 3 rondas), pero no se detalla su composicion demografica.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `Qwen/Qwen3.5-4B` y de las dependencias de Hindsight.
- Dependencia de formato: la variante MLX solo se ejecuta en Apple Silicon con `mlx-lm` o herramientas compatibles; para otros entornos debe usarse la variante BF16 o GGUF.
- El modelo base congela el vision tower y el `lm_head`, y el ajuste se hizo con `enable_thinking=False`; no se debe esperar un modo de razonamiento extendido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ytfsic/Qwen3.5-4B-Hindsight-Synthesis-MLX-8bit
- Modelo base especializado: https://huggingface.co/ytfsic/Qwen3.5-4B-Hindsight-Synthesis
- Variante GGUF: https://huggingface.co/ytfsic/Qwen3.5-4B-Hindsight-Synthesis-GGUF
- Variante 2B BF16: https://huggingface.co/ytfsic/Qwen3.5-2B-Hindsight-Synthesis
- Variante 2B GGUF: https://huggingface.co/ytfsic/Qwen3.5-2B-Hindsight-Synthesis-GGUF
- Variante 2B MLX 8-bit: https://huggingface.co/ytfsic/Qwen3.5-2B-Hindsight-Synthesis-MLX-8bit
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio Hindsight: https://github.com/vectorize-io/hindsight
