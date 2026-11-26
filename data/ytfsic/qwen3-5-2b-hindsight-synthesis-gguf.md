# ytfsic/Qwen3.5-2B-Hindsight-Synthesis-GGUF

## Resumen

Qwen3.5-2B-Hindsight-Synthesis-GGUF es la distribucion cuantizada en formato GGUF del modelo ytfsic/Qwen3.5-2B-Hindsight-Synthesis, un ajuste fino especializado del base Qwen/Qwen3.5-2B orientado a las tareas de sintesis y reflexion del sistema de memoria Hindsight 1.2.3. Lo publica el usuario ytfsic bajo licencia Apache-2.0 y esta pensado para servir en local mediante llama.cpp, LM Studio u Ollama. Su proposito no es la generacion de texto generalista, sino producir salidas JSON estrictas para consolidacion de observaciones, deduplicacion, parches de modelo mental, orquestacion de tool calls y respuestas finales citadas.

El modelo conserva la arquitectura hibrida del base Qwen3.5-2B: 24 capas, de las cuales 18 son Gated DeltaNet y solo 6 usan atencion softmax completa, con un tamano oculto de 2.048 y 1.942.653.248 parametros totales. Esta proporcion (75% de capas sin cache KV completo) reduce drasticamente el coste de memoria en contextos largos de 24K a 64K tokens, lo que lo hace viable en GPUs de consumo y en Apple Silicon.

La relevancia actual reside en que los modelos base genericos tienden a colapsar en decisiones de fusion indiscriminada al deduplicar observaciones y entran en bucles de repeticion de 4.096 tokens en operaciones estructuradas de modelo mental. Este especialista corrige ambos fallos manteniendo fidelidad bilingue ingles-portugues, y se distribuye con cuantizaciones calibradas mediante importance matrix para minimizar la perdida de calidad en las tareas estructuradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 24 capas (18 Gated DeltaNet + 6 Full Attention), hidden size 2.048 |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 24K-64K tokens (rango operativo indicado por el autor) |
| Tipos de cuantizacion | GGUF calibrado con imatrix (variantes IQ4_XS y otras derivadas de llama.cpp; conjunto completo no detallado) |
| Idiomas soportados | Ingles (en), portugues (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 5,8 GB); el modelo base se distribuye en BF16 safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer hibrido en el que el 75% de las capas emplea Gated DeltaNet (mecanismo recurrente con estado) y el 25% restante usa atencion softmax completa. El ajuste se realizo mediante LoRA All-Linear en BF16 de 16 bits (sin cuantizacion 4-bit en carga), con packing desactivado para preservar el estado recurrente de Gated DeltaNet, NEFTune desactivado y mascara de perdida solo sobre el turno del asistente con thinking deshabilitado. El adaptador cubre 16,82 millones de parametros en 186 matrices (r=16, alpha=32) sobre proyecciones de Gated DeltaNet (in_proj_qkv/z/a/b, out_proj), atencion completa (q/k/v/o_proj) y MLP (gate/up/down_proj); el vision tower y el lm_head permanecen congelados.

El entrenamiento uso max_seq_length de 16.384, batch efectivo de 16, learning rate de 1,2e-4 con schedule coseno (warmup_ratio 0,08) durante 1,5 epocas (101 pasos) sobre un corpus bilingue EN/PT anonimizado y sin PII de 10 subtareas (1.088 filas de entrenamiento y 171 de validacion retenida sobre 3 bancos no vistos, con auditoria automatizada de PII en 3 rondas y 0 filtraciones). La seleccion posterior se hizo mediante un torneo PEFT automatizado de dos etapas QR+SVD en VRAM, que eligio la variante best_spec_depth_eq (espectral-depth equalized, media ||BA||_F = 0,1158, erank = 10,34, gamma = 0,85) evaluada sobre 28 trampas deterministas, una suite de estres estructural de 54 filas y un canario de capacidad general de 20 prompts EN/PT. La cuantizacion GGUF se calibro con una importance matrix de 96 chunks diversos y del dominio usando llama.cpp b12720.

## Capacidades

- Generacion de JSON estricto para consolidacion de memoria: clasificacion de hechos duraderos frente a momentaneos, actualizacion, cierre y repeticion de observaciones con marcas temporales, deduplicacion intra-lote y proteccion de observaciones recientes frente a hechos obsoletos.
- Decision de deduplicacion (consolidation_dedup): distincion entre casi-duplicados sutiles (keep) y parafrasis o superconjuntos reales (merge), con accion, texto y razon.
- Aplicacion de parches estructurados de modelo mental (mental_model_delta_ops): add_section, remove_section, rename_section, append_block, insert_block, replace_block, remove_block y replace_section_blocks, o no-op vacio.
- Retraccion quirurgica de afirmaciones no soportadas (mental_model_retraction_ops).
- Orquestacion de tool calls multi-turno para reflexion (reflect_tool_call): seleccion de herramientas de recuperacion/lectura o finalizacion, formulacion de busquedas de observaciones y llamadas de recall episodico con parametros de tokens y razon.
- Sintesis de respuestas finales fundamentadas con citas de IDs recuperados, incluyendo abstenciones explicitas (answer_found: false).
- Compresion de documentos markdown largos por debajo de un presupuesto de tokens objetivo (reflect_shorten).
- Generacion de consultas de recuperacion concisas en una linea de 4 a 12 palabras, bilingues EN/PT.
- Soporte bilingue ingles-portugues; sin capacidades de vision operativas en el ajuste (vision tower congelado).

## Casos de uso

- Consolidacion de memoria de un agente conversacional: el modelo procesa lotes de observaciones y emite JSON con hechos duraderos, borrados y deduplicaciones, sustituyendo al modelo base que tiende a fusionar indiscriminadamente. Adecuado por su entrenamiento especifico en la subtarea consolidation:_Constrained.
- Deduplicacion de memoria episodica en produccion: integrado en el pipeline de Hindsight 1.2.3 para decidir entre keep y merge en pares de observaciones casi identicas, con razon explicita que facilita la auditoria.
- Mantenimiento de un modelo mental estructurado: aplicacion de parches minimos sobre secciones y bloques markdown mediante operaciones JSON, evitando reescrituras completas y los bucles de repeticion de 4.096 tokens del modelo base.
- Agente de recuperacion aumentada (RAG) con tool calling: orquesta llamadas de busqueda de observaciones y recall episodico multi-turno hasta emitir done, con consultas de 4 a 12 palabras y presupuestos de tokens controlados.
- Generacion de respuestas citadas y verificables: sintesis final que solo cita IDs recuperados y declina responder cuando no hay evidencia, util en asistentes documentales con requisitos de trazabilidad.
- Compresion de documentacion larga: reduccion de markdown por debajo de un presupuesto de tokens manteniendo estructura por secciones, para resúmenes operativos o contextos de sistema.
- Despliegue en estaciones de trabajo sin GPU dedicada: al ocupar aproximadamente 1,2 GiB en cuantizacion IQ4_XS, permite ejecutar el pipeline completo de memoria Hindsight en portatiles con llama.cpp u Ollama.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion bajo IQ4_XS con cache K/V q8_0 y gramatica JSON Schema de produccion, pero el contenido proporcionado se interrumpe en la cabecera de la tabla sin incluir los valores numericos. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2 GiB para la cuantizacion IQ4_XS del modelo de 2B; el repo completo de GGUF ocupa 5,8 GB.
- GPU recomendadas: el autor indica GPUs CUDA/Vulkan de 6-8 GB o superiores para la variante de 4B; para la de 2B basta con presupuestos de VRAM ajustados, sin cifra minima oficial publicada.
- GPU de consumo: cabe holgadamente en tarjetas consumer con 4 GB o mas, y en Apple Silicon (variante MLX 8-bit de aproximadamente 1,9 GiB).
- Opciones de despliegue: llama.cpp / llama-server (compilacion b12720 o posterior para la imatrix), LM Studio, Ollama; la variante BF16 del base admite vLLM. Endpoints compatibles segun los tags del repo.
- Latencia y throughput: no disponibles en la informacion proporcionada. La arquitectura hibrida con solo 6 capas de atencion completa reduce el coste de cache KV en contextos de 24K-64K, lo que favorece el throughput en contextos largos frente a un transformer denso equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-Hindsight-Synthesis-GGUF (este) | 1,94B | 24K-64K | Sintesis y reflexion Hindsight, JSON estricto, EN/PT | Apache-2.0 | GGUF (imatrix), MLX 8-bit, BF16 |
| Qwen/Qwen3.5-2B (base) | 1,94B | no disponible | Generacion generalista | Apache-2.0 | BF16 safetensors |
| Qwen3.5-4B-Hindsight-Synthesis-GGUF (misma familia) | no disponible | no disponible | Misma especializacion, mayor tamano | Apache-2.0 | GGUF (imatrix), MLX 8-bit, BF16 |

No se dispone de datos de benchmarks para establecer una comparacion cuantitativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste esta disenado para las 10 subtareas de Hindsight 1.2.3; su uso como modelo conversacional general puede degradar la calidad respecto al base.
- Cobertura linguistica limitada a ingles y portugues; el castellano no esta soportado de forma declarada.
- Riesgo de alucinacion en las respuestas sintetizadas pese al mecanismo de citas por ID y a la abstencion explicita; conviene validar los IDs citados en produccion.
- El modelo base declara vision tower congelado, por lo que las capacidades multimodales no estan garantizadas en este ajuste.
- La evaluacion publicada se realizo con gramatica JSON Schema de produccion y cache q8_0; otros formatos de muestreo o gramaticas pueden alterar la adherencia al esquema.
- La cuantizacion GGUF calibrada con imatrix puede introducir degradacion en tareas fuera del dominio de calibracion.
- Sin descargas ni likes en el momento de la consulta (0/0), lo que implica ausencia de validacion independiente por parte de la comunidad.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; verificar la procedencia y el cumplimiento de la licencia del base Qwen3.5-2B.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ytfsic/Qwen3.5-2B-Hindsight-Synthesis-GGUF
- Modelo base (BF16): https://huggingface.co/ytfsic/Qwen3.5-2B-Hindsight-Synthesis
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante 4B GGUF: https://huggingface.co/ytfsic/Qwen3.5-4B-Hindsight-Synthesis-GGUF
- Variante 4B BF16: https://huggingface.co/ytfsic/Qwen3.5-4B-Hindsight-Synthesis
- Variante 4B MLX 8-bit: https://huggingface.co/ytfsic/Qwen3.5-4B-Hindsight-Synthesis-MLX-8bit
- Variante 2B MLX 8-bit: https://huggingface.co/ytfsic/Qwen3.5-2B-Hindsight-Synthesis-MLX-8bit
- Repositorio Hindsight: https://github.com/vectorize-io/hindsight
