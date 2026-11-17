# yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_hdb_and_entity-ep2

## Resumen

El modelo `yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_hdb_and_entity-ep2` es un ajuste fino completo (*full fine-tuning*) del modelo instructivo Qwen2.5-14B-Instruct, desarrollado por el usuario yungisimon. Su particularidad es que ha sido entrenado como **modelo de memoria** (*memory model*) sobre pares sintéticos de pregunta-respuesta generados a partir del conjunto de datos MuSiQue, un benchmark de razonamiento multi-salto. El objetivo es que el modelo sea capaz de recuperar y razonar sobre información dispersa en un contexto largo, simulando un mecanismo de memoria externa.

El entrenamiento emplea una metodología de agrupamiento denominada `knn_k2_and_hdb_and_entity`, que combina kNN con k=2, deduplicación de documentos, HDBSCAN con tamaño mínimo de clúster 2 y agrupación por entidades con frecuencia documental máxima de 3. El conjunto de datos resultante contiene 2.681.852 ejemplos. El checkpoint publicado corresponde a la época 2 de 3, con pesos en bf16 y licencia Apache 2.0.

Con 14.770.033.664 parámetros y una ventana de contexto de entrenamiento de 8096 tokens, este modelo se posiciona como una alternativa de código abierto para tareas de razonamiento sobre documentos largos y recuperación de información estructurada. Su relevancia radica en la escasez de modelos específicamente entrenados como *memory models* y en la documentación detallada del proceso de entrenamiento (FSDP, 8 GPU AMD MI325X, 90,9 GPU-horas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8096 tokens (longitud máxima de secuencia en entrenamiento); contexto nativo de Qwen2.5-14B-Instruct no especificado en la información disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar. Al tratarse de un *full fine-tuning*, los 14.770.033.664 parámetros (100 % del modelo) fueron entrenados mediante FSDP (Fully Sharded Data Parallel) sobre 8 GPU AMD Instinct MI325X. El entrenamiento se realizó en precisión bf16 con *gradient checkpointing* y cálculo de pérdida únicamente sobre los tokens del asistente, lo que es habitual en ajustes instructivos para evitar que el modelo aprenda a generar los turnos del usuario.

El conjunto de datos de entrenamiento son pares sintéticos de QA derivados de MuSiQue, agrupados mediante la metodología `knn_k2_and_hdb_and_entity`. Esta combina vecinos más cercanos (kNN con k=2), deduplicación de documentos, clustering HDBSCAN con tamaño mínimo de clúster 2 y agrupación por entidades con *document frequency* máxima de 3. El dataset final contiene 2.681.852 ejemplos. Se entrenaron 3 épocas con un batch efectivo de 256 (32 por dispositivo × 1 acumulación × 8 GPU), tasa de aprendizaje constante de 2e-05 con warmup del 5 %, weight decay 0.01 y max grad norm 1.0. El tiempo total de entrenamiento fue de 11,36 horas (90,9 GPU-horas). El checkpoint publicado corresponde a la época 2.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno, heredadas de Qwen2.5-14B-Instruct y reforzadas por el ajuste como modelo de memoria.
- Recuperación y razonamiento sobre información dispersa en contextos largos, gracias al entrenamiento específico sobre pares QA de MuSiQue.
- Razonamiento multi-salto (*multi-hop reasoning*): el modelo está entrenado para encadenar evidencia procedente de distintos documentos.
- Capacidad de memoria contextual: puede integrar información de múltiples fragmentos documentales agrupados por entidades.
- Soporte de plantilla de chat de Qwen, lo que facilita su uso en pipelines conversacionales.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Modo *thinking* o visión: no disponible en la información proporcionada.

## Casos de uso

- **Sistemas de pregunta-respuesta sobre documentación corporativa**: el modelo puede recibir múltiples fragmentos de documentos (hasta 8096 tokens) y responder preguntas que requieren combinar información de varias fuentes, gracias a su entrenamiento específico sobre el dataset MuSiQue de razonamiento multi-salto.
- **Asistentes de investigación académica**: útil para consultar resúmenes de artículos o actas de congresos y extraer conclusiones que dependen de la relación entre distintas publicaciones, aprovechando la agrupación por entidades del entrenamiento.
- **Análisis de contratos y documentos legales**: el modelo puede localizar cláusulas relacionadas entre sí en un expediente largo y responder consultas que exigen cruzar referencias entre secciones.
- **Atención al cliente con base de conocimiento**: integrado en un pipeline RAG, el modelo puede gestionar conversaciones multi-turno donde el contexto incluye manuales de producto y tickets previos, manteniendo coherencia sobre entidades y hechos.
- **Generación de resúmenes multi-documento**: dado un conjunto de artículos o informes sobre un mismo tema, el modelo puede sintetizar la información y señalar discrepancias o relaciones entre fuentes.
- **Evaluación de sistemas de recuperación**: al estar entrenado sobre pares QA derivados de MuSiQue, puede utilizarse como modelo de referencia para medir la calidad de pipelines de recuperación de información en tareas de razonamiento multi-salto.
- **Prototipado de agentes de memoria**: investigadores que desarrollan arquitecturas de memoria externa pueden usar este checkpoint como componente de razonamiento sobre el contenido recuperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia en bf16**: aproximadamente 29,5 GB solo para pesos (14.770 M × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 32-40 GB de VRAM para contextos moderados.
- **Cuantización**: no se han publicado versiones cuantizadas (GGUF, AWQ, GPTQ) en la información disponible. En caso de generarlas, una cuantización a 8 bits requeriría ~15 GB y a 4 bits ~8 GB.
- **GPU recomendadas**: A100 40/80 GB, H100 80 GB, AMD MI300X/MI325X (el modelo fue entrenado en MI325X). Para consumer GPU, una RTX 4090 (24 GB) no es suficiente en bf16; sería necesario cuantizar a 8 o 4 bits.
- **Opciones de despliegue**: `transformers` con `AutoModelForCausalLM.from_pretrained` (soporte nativo), text-generation-inference (TGI) según los tags del repositorio, y potencialmente vLLM si se convierte a un formato compatible. llama.cpp/Ollama requerirían una conversión a GGUF no disponible actualmente.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_hdb_and_entity-ep2 | 14,77 B | 8096 (entrenamiento) | Apache 2.0 | Hugging Face | Fine-tune como memory model sobre MuSiQue |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B | 32.768 (nativo, según documentación de Qwen) | Apache 2.0 | Hugging Face | Modelo base; capacidades generales e instructivas |
| Mistral-Nemo-Instruct-2407 | 12 B | 128.000 | Apache 2.0 | Hugging Face | Alternativa de tamaño similar con contexto muy largo |
| Llama-3.1-8B-Instruct | 8 B | 128.000 | Llama 3.1 Community License | Hugging Face | Menor tamaño, contexto largo, licencia con restricciones |

La comparación directa de rendimiento no es posible porque no se han publicado benchmarks del modelo ajustado. El modelo base Qwen2.5-14B-Instruct es conocido por su buen rendimiento en tareas de razonamiento y código, pero el fine-tune puede haber alterado esas capacidades en favor de la tarea de memoria.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se documentan en la información disponible; al derivar de Qwen2.5-14B-Instruct, hereda los sesgos del modelo base y los del dataset MuSiQue.
- **Riesgo de alucinación**: al ser un modelo entrenado sobre pares QA sintéticos, puede generar respuestas plausibles pero no respaldadas por el contexto, especialmente si la información no está presente en la ventana de 8096 tokens.
- **Limitación de contexto**: la longitud máxima de secuencia en entrenamiento es de 8096 tokens; no se garantiza un buen rendimiento más allá de esa longitud, aunque el modelo base soporte contextos mayores.
- **Idiomas**: no se especifican los idiomas soportados; el entrenamiento se realizó sobre MuSiQue, que es predominantemente en inglés, por lo que el rendimiento en castellano puede ser inferior.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen2.5-14B-Instruct y del dataset MuSiQue.
- **Caveat para producción**: el checkpoint corresponde a la época 2 de 3, no al modelo final; puede que la época 3 tenga un rendimiento distinto. Además, el modelo está especializado en una tarea concreta (memoria y razonamiento multi-salto) y puede degradar capacidades generales como generación de código o matemáticas.
- **Falta de benchmarks**: no hay métricas publicadas que permitan evaluar su calidad frente a alternativas, lo que dificulta su adopción en producción sin una evaluación propia.

## Enlaces

- [Hugging Face: yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_hdb_and_entity-ep2](https://huggingface.co/yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_hdb_and_entity-ep2)
- [Modelo base: Qwen/Qwen2.5-14B-Instruct](https://huggingface.co/Qwen/Qwen2.5-14B-Instruct)
- [Dataset MuSiQue (referencia)](https://github.com/StonyBrookNLP/musique)
- [Documentación de Qwen2.5](https://qwenlm.github.io/blog/qwen2.5/)
