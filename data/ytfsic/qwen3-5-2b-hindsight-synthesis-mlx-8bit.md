# ytfsic/Qwen3.5-2B-Hindsight-Synthesis-MLX-8bit

## Resumen

Qwen3.5-2B-Hindsight-Synthesis-MLX-8bit es una cuantización nativa de 8 bits en formato MLX del modelo ytfsic/Qwen3.5-2B-Hindsight-Synthesis, un ajuste fino especializado del Qwen3.5-2B de Alibaba para las tareas de síntesis y reflexión del sistema Hindsight 1.2.3. El autor, ytfsic, lo publica orientado a inferencia local en Apple Silicon mediante `mlx-lm`, LM Studio o Unsloth Studio, con pesos de 1,88 GiB que ocupan aproximadamente 2,2 GiB de memoria unificada. La cuantización emplea `q_bits=8` y `group_size=64`, una configuración que el autor describe como casi sin pérdida frente al modelo base en BF16.

El modelo resuelve un problema muy concreto: los modelos base genéricos fallan al ejecutar las diez subtareas estructuradas de Hindsight, colapsando a `merge` indiscriminado en la deduplicación de observaciones y entrando en bucles de repetición de 4.096 tokens en las operaciones de delta de modelos mentales. Este especialista corrige ambos comportamientos y mantiene fidelidad bilingüe inglés-portugués.

Arquitectónicamente hereda el diseño híbrido de Qwen3.5-2B: 24 capas, de las cuales 18 son Gated DeltaNet y solo 6 son atención completa con softmax, con un tamaño oculto de 2.048. Esa proporción del 75% de capas recurrentes reduce drásticamente el coste de la caché KV en contextos largos, lo que facilita servir ventanas de 24K a 64K tokens en hardware de consumo. El modelo tiene 1.881.825.088 parámetros y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas (18 Gated DeltaNet + 6 atención completa), hidden size 2.048; base Qwen3.5-2B |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 24K–64K tokens (rango indicado por el autor para servicio local); entrenamiento con `max_seq_length=16384` |
| Tipos de cuantizacion | MLX 8-bit (`q_bits=8`, `group_size=64`); el modelo base ofrece BF16 y GGUF con imatrix |
| Idiomas soportados | Inglés (en), portugués (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), librería `mlx` |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, con el tower de visión y el `lm_head` congelados, y aplica un ajuste fino mediante All-Linear LoRA en BF16 de 16 bits (`load_in_4bit=False`), con `packing=False` para proteger el estado recurrente de Gated DeltaNet y `NEFTune=OFF`. El adaptador cubre 186 matrices all-linear con r=16 y alpha=32: proyecciones `in_proj_qkv/z/a/b` y `out_proj` de Gated DeltaNet, `q/k/v/o_proj` de atención completa y `gate/up/down_proj` del MLP, sumando 16,82 millones de parámetros entrenables. El entrenamiento usó `max_seq_length=16384`, batch efectivo de 16, learning rate de 1,2e-4 con schedule coseno y warmup del 8%, durante 1,5 épocas (101 pasos) sobre un corpus bilingüe EN/PT anonimizado y auditado contra PII, con 1.088 filas de entrenamiento y 171 de validación en tres bancos no vistos.

Tras el entrenamiento, el autor ejecutó un torneo PEFT automático de dos etapas (QR+SVD en VRAM) sobre 28 trampas deterministas, una suite de estrés estructural de 54 filas y un canary de capacidad general de 20 prompts EN/PT. La variante seleccionada fue `best_spec_depth_eq` (QR+SVD con ecualización de profundidad espectral, `mean ||BA||_F = 0.1158`, erank 10,34, gamma 0,85). La cuantización MLX 8-bit se generó con `mlx-lm` a partir del modelo BF16 resultante; la variante GGUF del mismo modelo base se calibró con una importance matrix de 96 fragmentos diversos y de dominio.

## Capacidades

- Generación de texto conversacional y salida estructurada en JSON estricto para las diez subtareas de Hindsight 1.2.3.
- Consolidación de memoria (`consolidation:_Constrained`): clasificación de hechos duraderos frente a momentáneos, actualización, cierre y repetición de observaciones con marcas temporales, deduplicación intra-lote y protección de observaciones nuevas frente a hechos obsoletos.
- Deduplicación fina (`consolidation_dedup:_DedupDecision`): distinción entre casi-duplicados (`keep`) y paráfrasis o superconjuntos reales (`merge`).
- Parcheo estructurado de modelos mentales (`mental_model_delta_ops:DeltaOperationList`): operaciones `add_section`, `remove_section`, `rename_section`, `append_block`, `insert_block`, `replace_block`, `remove_block` y `replace_section_blocks`, o no-op `[]`.
- Retracción quirúrgica de afirmaciones no respaldadas (`mental_model_retraction_ops:none`).
- Orquestación multi-turno de reflexión con tool calling (`reflect_tool_call:next_call`, `search_observations`, `recall`).
- Síntesis de respuestas finales con citas de IDs recuperados (`reflect:done`), incluyendo abstención con `answer_found: false`.
- Compresión de documentos markdown bajo un presupuesto de tokens objetivo (`reflect_shorten`).
- Generación de consultas de recuperación bilingües concisas de 4 a 12 palabras (`reflect_query`).
- Capacidades multilingües limitadas a inglés y portugués.

## Casos de uso

- Consolidación de memoria de agentes: el modelo clasifica qué observaciones de un agente conversacional son hechos duraderos y cuáles momentáneos, actualizando o cerrando entradas con marcas temporales. Es adecuado porque la tarea `consolidation:_Constrained` está entrenada explícitamente y evita el colapso a `merge` de los modelos base.
- Deduplicación de un almacén de observaciones: en pipelines que acumulan miles de registros, el modelo separa casi-duplicados sutiles de paráfrasis reales mediante la salida `DedupDecision`, reduciendo el crecimiento del almacén sin fusionar información distinta.
- Mantenimiento de modelos mentales en documentación viva: ante nueva evidencia, genera parches mínimos (`append_block`, `replace_section_blocks`) sobre documentos markdown estructurados en lugar de reescribirlos, lo que preserva el resto del contenido y abarata la actualización.
- Retracción de afirmaciones obsoletas: cuando una fuente deja de respaldar una afirmación, el modelo emite operaciones quirúrgicas de retracción o `[]` si sigue vigente, útil en sistemas de conocimiento que deben degradar información sin romper la estructura.
- Agente de recuperación con tool calling: el modelo decide en cada turno si invoca búsqueda de observaciones, recall episódico o termina (`done`), formulando consultas con presupuesto de tokens; encaja en orquestadores tipo ReAct con contexto largo gracias a su arquitectura híbrida.
- Respuestas con citas verificables: en asistentes documentales, sintetiza respuestas finales citando únicamente los IDs recuperados o se abstiene con `answer_found: false`, lo que reduce alucinaciones en producción.
- Compresión de informes: `reflect_shorten` recorta documentos markdown por debajo de un presupuesto de tokens, útil para resumir actas o logs antes de inyectarlos en el contexto de otro modelo.
- Inferencia local en Mac: con 1,88 GiB de pesos, sirve estas tareas en un portátil Apple Silicon sin GPU dedicada mediante `mlx-lm` o LM Studio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona cualitativamente la corrección de dos fallos del modelo base (colapso a `merge` y bucles de repetición de 4.096 tokens) y la selección de la variante mediante un torneo interno de 28 trampas deterministas, 54 filas de estrés estructural y 20 prompts canary, pero no se aportan cifras de MMLU, HumanEval, GSM8K ni métricas comparables.

## Requisitos de hardware

- VRAM o memoria unificada estimada: aproximadamente 2,2 GiB para los pesos en MLX 8-bit (1,88 GiB de pesos), más la caché KV del contexto; el modelo base GGUF de 2B ocupa unos 1,2 GiB.
- Hardware objetivo: Apple Silicon (series M1 a M4), con soporte en `mlx-lm`, Unsloth Studio y LM Studio.
- Cabe en cualquier Mac con 8 GB de memoria unificada o más; para contextos de 24K–64K conviene disponer de 16 GB o más.
- En GPU CUDA o Vulkan no se usa esta cuantización MLX: para esos entornos el autor publica la variante GGUF con imatrix (llama.cpp, llama-server, Ollama, LM Studio) y la variante BF16 para vLLM.
- Despliegue: `mlx-lm`, LM Studio y Unsloth Studio para MLX; llama.cpp, Ollama y TGI/vLLM para las variantes GGUF y BF16 respectivamente.
- Latencia y throughput: no disponibles; el autor solo indica que la arquitectura híbrida mantiene compacta y rápida la caché KV en contextos largos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.5-2B-Hindsight-Synthesis-MLX-8bit | 1,88B | 24K–64K (servicio) | MLX 8-bit | Apache-2.0 | Especialista en síntesis Hindsight, EN/PT |
| Qwen3.5-2B-Hindsight-Synthesis (BF16) | 1,88B | 16K entrenamiento | safetensors BF16 | Apache-2.0 | Mismo especialista, precisión completa, vLLM y fine-tuning |
| Qwen3.5-2B-Hindsight-Synthesis-GGUF | 1,88B | 16K entrenamiento | GGUF imatrix | Apache-2.0 | Mismo especialista para CUDA/Vulkan, ~1,2 GiB |
| Qwen3.5-2B (base) | 1,88B | no disponible | BF16 | Apache-2.0 | Modelo generalista; falla en tareas Hindsight según el autor |

## Limitaciones y advertencias

- Especialización estrecha: está entrenado para las diez subtareas de Hindsight 1.2.3 y puede degradarse en conversación general o en tareas fuera de ese dominio; el autor lo valida con un canary de solo 20 prompts EN/PT.
- Idiomas limitados a inglés y portugués; no hay soporte declarado de castellano ni de otras lenguas.
- Cuantización de 8 bits: aunque el autor la describe como casi sin pérdida, no se publican métricas que cuantifiquen la degradación frente al BF16.
- Riesgo de alucinación en la síntesis final (`reflect:done`) mitigado por el requisito de citar IDs recuperados y la abstención con `answer_found: false`, pero no eliminado.
- El corpus de entrenamiento es pequeño (1.088 filas) y procede de tres bancos; la generalización a dominios muy distintos no está documentada.
- Formato MLX exclusivo para Apple Silicon; no es desplegable en CUDA sin recurrir a las variantes GGUF o BF16 del mismo autor.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las obligaciones de atribución del modelo base Qwen3.5-2B.
- Sin descargas ni validación comunitaria en el momento de la ficha (0 descargas, 0 likes), por lo que no hay evidencia externa de robustez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ytfsic/Qwen3.5-2B-Hindsight-Synthesis-MLX-8bit
- Modelo base BF16: https://huggingface.co/ytfsic/Qwen3.5-2B-Hindsight-Synthesis
- Variante GGUF: https://huggingface.co/ytfsic/Qwen3.5-2B-Hindsight-Synthesis-GGUF
- Variante 4B BF16: https://huggingface.co/ytfsic/Qwen3.5-4B-Hindsight-Synthesis
- Variante 4B GGUF: https://huggingface.co/ytfsic/Qwen3.5-4B-Hindsight-Synthesis-GGUF
- Variante 4B MLX 8-bit: https://huggingface.co/ytfsic/Qwen3.5-4B-Hindsight-Synthesis-MLX-8bit
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio Hindsight: https://github.com/vectorize-io/hindsight
