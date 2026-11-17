# yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_hdb_and_entity-ep1

## Resumen

El modelo `yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_hdb_and_entity-ep1` es un ajuste fino completo (*full fine-tuning*) de `Qwen/Qwen2.5-14B-Instruct`, publicado por el usuario yungisimon en Hugging Face. Su propósito declarado es funcionar como **modelo de memoria** (*memory model*): se entrena para responder preguntas sintéticas multi-hop del dataset MuSiQue, donde la información relevante está distribuida en varios documentos y el modelo debe recuperarla y combinarla. Es, por tanto, un experimento de investigación sobre memorización y recuperación de contexto, no un modelo de propósito general.

El checkpoint publicado corresponde a la **época 1 de 3** de un entrenamiento con 2.681.852 ejemplos generados mediante un pipeline de clustering denominado `knn_k2_and_hdb_and_entity` (kNN con k=2, deduplicación de documentos, HDBSCAN con tamaño mínimo de clúster 2 y agrupación por entidades con frecuencia documental máxima 3). El ajuste se realizó con FSDP sobre 8 GPU AMD Instinct MI325X, en bf16 y con pérdida calculada únicamente sobre los tokens del asistente.

Arquitectónicamente hereda íntegramente Qwen2.5-14B-Instruct: un transformer denso de 14.770.033.664 parámetros con ventana de contexto nativa de 32.768 tokens (aunque el entrenamiento usó secuencias de 8.096). La licencia Apache 2.0 y el formato safetensors en bf16 lo hacen cargable directamente con `transformers`. Su relevancia es acotada: sirve como referencia para estudiar cómo el fine-tuning sobre tareas sintéticas de memoria afecta al comportamiento del modelo base, y como artefacto reproducible de un pipeline concreto de generación de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Qwen2) |
| Parámetros totales | 14.770.033.664 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; entrenado con secuencias de 8.096 |
| Tipos de cuantización | no disponibles en el repo (pesos publicados en bf16); al derivar de Qwen2.5 es compatible con GPTQ, AWQ, GGUF y otras vías habituales, aunque no se han publicado versiones cuantizadas |
| Idiomas soportados | no disponible (la model card no declara idiomas; el base Qwen2.5-Instruct soporta múltiples idiomas, pero el fine-tuning se hizo sobre datos sintéticos en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2, con 14.770 millones de parámetros, sin mezcla de expertos ni mecanismos de atención alternativa. No se introduce ninguna modificación arquitectónica respecto al base: el trabajo consiste exclusivamente en un *full fine-tuning* con FSDP sobre el 100 % de los parámetros (14.770.033.664 entrenables). El entrenamiento usó precisión bf16, checkpointing de gradientes y cálculo de pérdida restringido a los tokens del asistente, con batch efectivo de 256 (32 por dispositivo, 1 acumulación, 8 GPU), tasa de aprendizaje constante de 2e-05 con warmup del 5 %, weight decay 0.01 y recorte de norma de gradiente a 1.0.

Los datos de entrenamiento son 2.681.852 ejemplos sintéticos de QA multi-hop derivados de MuSiQue, generados con el pipeline `knn_k2_and_hdb_and_entity`: agrupación por vecinos más cercanos con k=2, deduplicación de documentos, clustering HDBSCAN con tamaño mínimo de clúster 2 y agrupación por entidades limitando la frecuencia documental a 3. El set de partida se identifica como `msq_subset1000` y el entrenamiento completo abarca 3 épocas; este checkpoint es la primera. El coste total declarado es de 11,36 horas de reloj (90,9 GPU-horas) sobre 8 AMD Instinct MI325X. No se documenta uso de RLHF, DPO ni datos humanos; tampoco se especifica la composición lingüística del corpus más allá de su origen en MuSiQue.

## Capacidades

- Generación de texto conversacional, heredada de Qwen2.5-14B-Instruct y del formato de chat de Qwen.
- Respuesta a preguntas multi-hop sobre información distribuida en varios documentos, que es la tarea objetivo del ajuste.
- Memoria y recuperación de hechos sintéticos inyectados durante el entrenamiento (comportamiento de *memory model*).
- Razonamiento sobre contextos de hasta 8.096 tokens en la configuración de entrenamiento; el base admite hasta 32.768.
- Soporte de plantilla de chat de Qwen, lo que permite uso multi-turno.
- No se documenta soporte específico de *tool calling*, agentes, visión, audio ni modo de razonamiento explícito; estas capacidades dependerían del base y no han sido validadas tras el fine-tuning.
- Capacidades multilingües: no verificadas; los datos de ajuste son sintéticos y derivados de MuSiQue, corpus en inglés.

## Casos de uso

- Investigación sobre memorización en LLM: utilizar el checkpoint para medir cuánta información sintética retiene el modelo tras una época de entrenamiento y cómo afecta a su comportamiento general. Es adecuado porque el pipeline de datos y los hiperparámetros están completamente documentados.
- Evaluación de pipelines de generación de datos sintéticos: comparar el rendimiento de este checkpoint con los de las épocas 2 y 3 (si se publican) para aislar el efecto del volumen de datos y de la estrategia de clustering `knn_k2_and_hdb_and_entity`.
- Réplica de experimentos de fine-tuning completo: al estar publicados pesos, hiperparámetros y hardware, sirve como referencia reproducible para validar recetas de FSDP con bf16 sobre 8 GPU AMD MI325X.
- Estudio de QA multi-hop en contexto largo: permite analizar cómo un modelo denso de 14B distribuye la atención sobre documentos concatenados en tareas de MuSiQue.
- Base para experimentos de destilación o cuantización: al ser un fine-tuning denso, se puede cuantizar y comparar la degradación en la tarea de memoria frente al modelo en bf16.
- Análisis de olvido catastrófico: comparar sus respuestas con las de Qwen2.5-14B-Instruct en tareas generales para cuantificar cuánto conocimiento original se ha perdido o preservado tras el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,5 GB solo para pesos, más KV cache y activaciones; en la práctica se recomienda al menos 40-48 GB para secuencias moderadas.
- VRAM estimada en cuantización de 8 bits: en torno a 15-16 GB para pesos; en 4 bits, en torno a 8-9 GB, aunque no se han publicado versiones cuantizadas oficiales.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB, MI325X o MI300X; también funciona en configuraciones multi-GPU con tensor parallelism.
- GPU de consumo: no cabe en bf16 en una RTX 4090 (24 GB); requeriría cuantización a 4 bits para intentar encajar en 24 GB, con margen ajustado para contexto largo.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained`, Text Generation Inference (el repo incluye la etiqueta `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_hdb_and_entity-ep1 | 14,77 B (denso) | 32.768 (base); entrenado a 8.096 | Apache 2.0 | Hugging Face, safetensors bf16 | Fine-tuning de memoria sobre MuSiQue sintético; época 1 de 3 |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B (denso) | 32.768 | Apache 2.0 | Hugging Face, safetensors, GGUF, AWQ, GPTQ | Modelo base; propósito general, alineado con instrucciones |
| Qwen/Qwen2.5-7B-Instruct | 7,62 B (denso) | 32.768 | Apache 2.0 | Hugging Face, múltiples formatos | Alternativa de menor tamaño para el mismo tipo de tarea |
| Meta-Llama-3.1-8B-Instruct | 8,03 B (denso) | 131.072 | Llama 3.1 Community License | Hugging Face, gated | Contexto mayor pero licencia con restricciones |

No se dispone de benchmarks del modelo ajustado que permitan comparar rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre QA sintético derivado de MuSiQue; es probable que su rendimiento en tareas generales se haya degradado respecto al base, aunque no se han publicado evaluaciones que lo cuantifiquen.
- Riesgo elevado de alucinación fuera del dominio de entrenamiento, especialmente si se usa como asistente conversacional general.
- Es un checkpoint intermedio (época 1 de 3); no representa el resultado final del entrenamiento y puede estar infraajustado.
- No se declaran idiomas soportados; el uso en castellano no está validado y probablemente sea deficiente.
- El contexto efectivo de entrenamiento (8.096 tokens) es menor que el nativo del base (32.768); no se ha validado el comportamiento más allá de esa longitud.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5 conviene revisar también los términos del modelo base.
- No hay versiones cuantizadas publicadas ni métricas de latencia o throughput; el despliegue en producción requeriría trabajo adicional de validación.
- El repositorio tiene 0 descargas y 0 likes, y no hay evidencia de revisión por terceros; tratar como artefacto experimental.

## Enlaces

- Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_hdb_and_entity-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Dataset de origen (MuSiQue): no disponible en la información proporcionada
- Paper de MuSiQue: no disponible en la información proporcionada
- Repositorio de código del pipeline: no disponible en la información proporcionada
