# ytfsic/Qwen3.5-4B-Hindsight-Synthesis-GGUF

## Resumen

Qwen3.5-4B-Hindsight-Synthesis-GGUF es la versión cuantizada en formato GGUF del modelo ytfsic/Qwen3.5-4B-Hindsight-Synthesis, un ajuste fino del Qwen/Qwen3.5-4B de Alibaba orientado específicamente a tareas de síntesis y reflexión del sistema Hindsight 1.2.3 (consolidación de memoria, deduplicación de observaciones, operaciones delta sobre modelos mentales y orquestación de llamadas a herramientas). El autor es el usuario de Hugging Face ytfsic y la distribución se publica bajo licencia Apache-2.0.

El modelo parte de una arquitectura híbrida Gated DeltaNet con 32 capas (24 Gated DeltaNet y 8 de atención completa, hidden size 2.560) y 4.326.350.848 parámetros totales. Esta proporción 75/25 reduce el coste de la caché KV a solo el 25% de las capas, lo que permite servir contextos largos (24K–64K) en GPUs de consumo y en Apple Silicon con un presupuesto de VRAM reducido.

La relevancia de esta ficha reside en que las cuantizaciones GGUF están calibradas con una importance matrix (imatrix) de 96 fragmentos (diversos y del dominio) mediante llama.cpp b12720, pensadas para servir el modelo en local con llama.cpp, LM Studio u Ollama en GPUs CUDA/Vulkan de 6–8 GB o más. El modelo es bilingüe inglés-portugués y está especializado en salidas JSON estrictas para las diez subtareas de Hindsight.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Gated DeltaNet (32 capas: 24 Gated DeltaNet + 8 Full Attention, hidden size 2.560) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 24K–64K (según la model card; entrenamiento con max_seq_length=16384) |
| Tipos de cuantizacion | GGUF con calibración imatrix (quantizaciones IQ; se documenta IQ4_XS en la evaluación) |
| Idiomas soportados | en, pt |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 12,4 GB); el modelo base en BF16 usa safetensors |
| Modelo base | ytfsic/Qwen3.5-4B-Hindsight-Synthesis (a su vez Qwen/Qwen3.5-4B) |
| Libreria | gguf (llama.cpp) |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-26 |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido en el que el 75% de las capas emplean Gated DeltaNet (atención lineal recurrente con estado) y el 25% restante atención softmax completa. Esta mezcla limita la caché KV a las 8 capas de atención completa, lo que abarata el serving de contextos largos. El ajuste fino se realizó sobre Qwen/Qwen3.5-4B con el tower de visión y el lm_head congelados, mediante un LoRA All-Linear en BF16 de 16 bits (load_in_4bit=False, packing=False para proteger el estado recurrente de Gated DeltaNet, NEFTune desactivado y máscara de pérdida solo en el asistente con enable_thinking=False). El adaptador cubre 32,46M parámetros en 248 matrices (r=16, alpha=32) sobre in_proj_qkv/z/a/b y out_proj de Gated DeltaNet, q/k/v/o_proj de atención completa y gate/up/down_proj del MLP.

El entrenamiento usó max_seq_length=16384, batch efectivo 16, learning rate 1.0e-4, schedule coseno con warmup_ratio=0.08 y 1,5 épocas (101 pasos) sobre un corpus bilingüe EN/PT saneado y pseudonimizado de 10 subtareas (1.088 filas de entrenamiento y 171 de validación retenida en 3 bancos no vistos, con auditoría automatizada de PII en 3 rondas y 0 filtraciones). La selección post-entrenamiento se hizo con un torneo PEFT automatizado de dos etapas QR+SVD en VRAM, que eligió la variante best_spec_depth_eq (QR+SVD con ecualización de profundidad espectral, media ||BA||_F = 0,155, erank = 9,65) evaluada sobre 28 trampas deterministas, una suite de estrés estructural de 54 filas y un canario de capacidad general EN/PT de 20 prompts. La cuantización GGUF se calibró con una imatrix de 96 fragmentos.

## Capacidades

- Generación de texto y razonamiento estructurado con salidas JSON estrictas para las diez subtareas de Hindsight 1.2.3.
- Consolidación de memoria (consolidation:_Constrained): clasificación de hechos duraderos frente a momentáneos, actualización/finalización/repetición de observaciones con marcas temporales, deduplicación intralote y protección de observaciones nuevas frente a hechos obsoletos.
- Deduplicación fina (consolidation_dedup:_DedupDecision): distinción entre casi-duplicados sutiles (keep) y paráfrasis o superconjuntos reales (merge), con acción, texto y razón.
- Operaciones delta sobre modelos mentales (mental_model_delta_ops:DeltaOperationList): parches estructurados mínimos (add_section, remove_section, rename_section, append_block, insert_block, replace_block, remove_block, replace_section_blocks) o no-op vacío.
- Retracción quirúrgica de afirmaciones no respaldadas (mental_model_retraction_ops:none), con emisión de lista vacía cuando la afirmación sigue sostenida.
- Orquestación multi-turno de reflexión con tool calling (reflect_tool_call:next_call, search_observations, recall): elección de herramientas de recuperación/lectura o finalización.
- Síntesis de respuestas finales con citas (reflect:done): respuesta o markdown con identificadores de cita, o abstención explícita con answer_found: false.
- Compresión de documentos markdown largos por debajo de un presupuesto de tokens (reflect_shorten) y generación de consultas de recuperación bilingües concisas de 4–12 palabras (reflect_query).
- Bilingüismo inglés-portugués preservado tras el ajuste fino.

## Casos de uso

- Consolidación de memoria en agentes conversacionales: el modelo procesa lotes de observaciones y emite JSON con facts y deletes, separando hechos duraderos de momentáneos y protegiendo observaciones recientes de hechos obsoletos; encaja en pipelines de memoria a largo plazo donde la latencia y el coste por token importan.
- Deduplicación de un almacén de observaciones: con consolidation_dedup:_DedupDecision se pueden fusionar paráfrasis y superconjuntos sin colapsar casi-duplicados sutiles, reduciendo el ruido del almacén antes de la recuperación.
- Mantenimiento incremental de modelos mentales: las operaciones delta permiten aplicar parches mínimos a documentos estructurados (secciones y bloques) sin reescribir el documento completo, lo que abarata la actualización y facilita la trazabilidad de cambios.
- Retracción de afirmaciones en bases de conocimiento: cuando una fuente se invalida, el modelo emite operaciones quirúrgicas de retracción o una lista vacía si la afirmación sigue respaldada, útil en sistemas de documentación viva.
- Orquestación de agentes de recuperación multi-turno: reflect_tool_call permite decidir entre búsqueda de observaciones, recall episódico o finalización, formulando consultas con límites de tokens y razones, lo que se integra en bucles de agente con herramientas.
- Respuestas con citas verificables: reflect:done genera respuestas finales citando únicamente identificadores recuperados, con abstención no vacía cuando no hay evidencia; adecuado para asistentes documentales que exigen atribución.
- Compresión de documentación para presupuestos de contexto: reflect_shorten recorta markdown por debajo de un objetivo de tokens, útil en pipelines RAG que deben encajar documentación en ventanas limitadas.
- Despliegue local en estaciones de trabajo: al ser GGUF con imatrix y caber en GPUs de 6–8 GB, permite ejecutar el especialista en llama.cpp, LM Studio u Ollama sin depender de la nube, con contextos de 24K–64K.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación bajo IQ4_XS con caché KV cuantizada (-ctk q8_0 -ctv q8_0) y gramática JSON Schema de producción, pero en la información disponible solo aparece el encabezado de la tabla y el nombre del benchmark (Qwen3.5-4B-Hindsight-Synthesis), sin filas de resultados numéricos.

| Benchmark | Resultado |
|---|---|
| Evaluación IQ4_XS con JSON Schema (tabla de la model card) | no disponible (tabla truncada en la información proporcionada) |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor indica GPUs CUDA/Vulkan de 6–8 GB o más para el 4B en GGUF; la variante 2B del mismo proyecto ocupa aproximadamente 1,2 GiB en GGUF.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el rango de 6–8 GB sugiere GPUs de consumo tipo RTX 3060/4060/4070 y superiores, además de A100/H100 para serving de mayor concurrencia.
- Cabe en GPU de consumo: sí, según el autor, en GPUs de 6–8 GB o más; también en Apple Silicon mediante la variante MLX 8-bit del mismo proyecto (M-series / M4 Pro).
- Opciones de despliegue: llama.cpp (llama-server, compilación b12720 o superior para imatrix), LM Studio, Ollama; la variante BF16 del modelo base admite vLLM y Transformers; la variante MLX 8-bit usa mlx-lm, Unsloth Studio o LM Studio.
- Latencia y throughput: no disponibles en la información proporcionada.
- Almacenamiento: el repositorio GGUF ocupa 12,4 GB (incluye varias cuantizaciones); conviene descargar solo el archivo de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.5-4B-Hindsight-Synthesis-GGUF (este) | 4,33B | 24K–64K (entrenado a 16K) | GGUF imatrix | Apache-2.0 | Especialista en síntesis/reflexión Hindsight, EN/PT |
| Qwen3.5-4B-Hindsight-Synthesis (BF16) | 4,33B | 24K–64K | safetensors (Transformers + LoRA) | Apache-2.0 | Mismo especialista en precisión completa para vLLM o re-cuantización |
| Qwen3.5-2B-Hindsight-Synthesis-GGUF | ~2B (no confirmado) | no disponible | GGUF imatrix (~1,2 GiB) | Apache-2.0 | Versión ligera del mismo especialista para presupuestos de VRAM ajustados |
| Qwen/Qwen3.5-4B (modelo base) | 4,33B | no disponible | safetensors | Apache-2.0 | Modelo generalista; según el autor colapsa a merge ciego en deduplicación y entra en bucles de repetición de 4.096 tokens en mental_model_delta_ops |

No se dispone de datos de benchmarks comparativos numéricos en la información proporcionada para cuantificar la mejora frente al modelo base.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste fino se limita a las diez subtareas de Hindsight 1.2.3; su uso como modelo generalista no está validado y el canario de capacidad general es de solo 20 prompts EN/PT.
- Idiomas: solo inglés y portugués; no hay soporte declarado de castellano ni de otros idiomas.
- Riesgo de alucinación: en tareas de síntesis con citas (reflect:done) el modelo puede citar identificadores incorrectos; el esquema exige abstención con answer_found: false, pero no se han publicado métricas de fidelidad de citas en la información disponible.
- Contexto: aunque la model card menciona serving de 24K–64K, el entrenamiento usó max_seq_length=16384; el comportamiento más allá de esa longitud no está documentado.
- Cuantización: los resultados de evaluación citados corresponden a IQ4_XS con caché KV q8_0 y gramática JSON Schema; otras cuantizaciones o sin gramática pueden degradar la adherencia al formato.
- Sesgos: no se documentan sesgos específicos; el corpus fue saneado y pseudonimizado con auditoría de PII (0 filtraciones en 3 rondas), pero no se detalla la composición demográfica o temática.
- Licencia: Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.5-4B; conviene revisar ambas licencias en producción.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la ficha, sin validación independiente por parte de la comunidad.
- Formato: al ser GGUF, no soporta entrenamiento adicional directo; para fine-tuning hay que partir del modelo base en BF16.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ytfsic/Qwen3.5-4B-Hindsight-Synthesis-GGUF
- Modelo base BF16: https://huggingface.co/ytfsic/Qwen3.5-4B-Hindsight-Synthesis
- Variante MLX 8-bit (4B): https://huggingface.co/ytfsic/Qwen3.5-4B-Hindsight-Synthesis-MLX-8bit
- Variante 2B BF16: https://huggingface.co/ytfsic/Qwen3.5-2B-Hindsight-Synthesis
- Variante 2B GGUF: https://huggingface.co/ytfsic/Qwen3.5-2B-Hindsight-Synthesis-GGUF
- Variante 2B MLX 8-bit: https://huggingface.co/ytfsic/Qwen3.5-2B-Hindsight-Synthesis-MLX-8bit
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B
- Proyecto Hindsight: https://github.com/vectorize-io/hindsight
