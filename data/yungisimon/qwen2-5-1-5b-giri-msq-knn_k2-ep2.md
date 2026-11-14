# yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2-ep2

## Resumen

`yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2-ep2` es un ajuste fino completo (full fine-tuning) del modelo base `Qwen/Qwen2.5-1.5B-Instruct` de Alibaba Qwen, publicado por el usuario yungisimon en Hugging Face. El modelo se ha entrenado como "modelo de memoria" (memory model) sobre pares sinteticos de pregunta-respuesta generados a partir del dataset MuSiQue, un benchmark de question answering multi-salto (multi-hop QA) que requiere razonar sobre varias evidencias documentales para responder.

La contribucion principal no es una arquitectura nueva, sino el proceso de entrenamiento: se ha partido del modelo instructivo Qwen2.5-1.5B y se ha especializado mediante SFT (supervised fine-tuning) en la tarea de memorizar y recuperar informacion de contexto multi-documento. El checkpoint publicado corresponde a la epoca 2 de 3 de un entrenamiento de 634.327 ejemplos, con una estrategia de agrupacion de documentos denominada `knn_k2` (kNN con k=2 y deduplicacion de documentos). El resultado es un modelo de 1.543.714.304 parametros (1,5B), con pesos en bf16 safetensors y licencia Apache 2.0.

Es relevante ahora porque los "modelos de memoria" (modelos que internalizan conocimiento de un corpus concreto para responder sin necesidad de recuperacion externa en tiempo de inferencia) son una linea de investigacion activa en RAG y agentes. Este checkpoint permite reproducir y evaluar ese enfoque sobre MuSiQue con un modelo pequeno, barato de desplegar y compatible con el ecosistema `transformers` y TGI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), modelo base Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento uso max sequence length 8096 |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |
| Libreria de carga | transformers (`AutoModelForCausalLM.from_pretrained`) |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Metodo de entrenamiento | full fine-tuning (FSDP) |
| Checkpoint | epoca 2 de 3 |
| Tamano del repo | 3,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso de 1,5B parametros con atencion causal estandar, sin componentes MoE ni mecanismos alternativos como SSM. El ajuste fino no introduce cambios arquitectonicos; modifica los pesos completos del modelo base (entrenamiento completo, no LoRA ni adaptadores). Los pesos resultantes estan en bf16 safetensors y se cargan con `transformers` usando la plantilla de chat de Qwen.

El entrenamiento se realizo con full fine-tuning distribuido mediante FSDP sobre 8 GPUs AMD Instinct MI325X, con batch efectivo de 256 (32 por dispositivo, 1 paso de acumulacion, 8 GPUs), learning rate constante de 2e-05 con warmup del 5%, weight decay 0,01, max grad norm 1,0, gradient checkpointing y calculo de perdida unicamente sobre los tokens del asistente. El dataset de entrenamiento es `msq_subset1000_numsamplingepochs1_knn2_doc_dedup_crossdoc_entity_combination_v3.json`, con 634.327 ejemplos sinteticos de QA construidos a partir de MuSiQue mediante una estrategia de agrupacion `knn_k2` (kNN con k=2 y deduplicacion de documentos, con combinacion de entidades cross-documento). Se completaron 3 epocas en 0,66 horas de reloj (5,2 GPU-horas); este checkpoint es el de la epoca 2. No se menciona RLHF, DPO ni decodificacion especulativa en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en formato chat, usando la plantilla de chat de Qwen2.5.
- Question answering multi-salto (multi-hop QA) sobre contextos que combinan varios documentos, que es la tarea objetivo del ajuste fino.
- Memorizacion y recuperacion de informacion de un corpus sintetico derivado de MuSiQue (modelo de memoria).
- Razonamiento sobre evidencia distribuida en multiples documentos con deduplicacion y combinacion de entidades.
- Soporte de tool calling / function calling: heredado del modelo base Qwen2.5-1.5B-Instruct, aunque no se documenta explicitamente en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente para este checkpoint.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Evaluacion de modelos de memoria en MuSiQue: usar el checkpoint para medir la exactitud de respuesta en QA multi-salto sin pipeline de recuperacion externa, comparandolo con el modelo base y con variantes de otras epocas.
- Investigacion sobre internalizacion de conocimiento: analizar cuanto del corpus sintetico de 634.327 ejemplos queda memorizado en los pesos tras 2 epocas de full fine-tuning, con un modelo de 1,5B barato de entrenar y evaluar.
- Baseline para experimentos de RAG frente a memoria parametrica: comparar las respuestas del modelo ajustado (sin retrieval) con las de un sistema RAG sobre los mismos documentos de MuSiQue.
- Generacion de pares QA sinteticos: reutilizar el modelo como generador de preguntas y respuestas sobre combinaciones de documentos para ampliar datasets de entrenamiento.
- Prototipado de asistentes documentales: desplegar el modelo con `transformers` o TGI para responder preguntas sobre un conjunto de documentos acotado, con contexto de hasta 8096 tokens usado en entrenamiento.
- Fine-tuning posterior o destilacion: partir de este checkpoint (o de la epoca 3) como inicializacion para tareas de QA documental en dominios especificos, dado que ya ha absorbido patrones de razonamiento multi-documento.
- Analisis de deduplicacion y agrupacion de documentos: estudiar el efecto de la estrategia `knn_k2` (k=2 con dedup) sobre la calidad de las respuestas, comparando con otras configuraciones de agrupacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (ni exact match, ni F1 sobre MuSiQue, ni MMLU, HumanEval o GSM8K) para este checkpoint ni para las epocas intermedias.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo para los pesos (1,54B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6-2 GB para los pesos; en 4 bits, alrededor de 0,8-1 GB, aunque los tipos de cuantizacion no estan documentados oficialmente para este checkpoint.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) es suficiente en bf16 o cuantizado; para entrenamiento o evaluacion a gran escala, A100, H100 o MI325X (las usadas en el entrenamiento original).
- Cabe en GPU consumer: si, con holgura en tarjetas de 8-16 GB, especialmente cuantizado.
- Opciones de despliegue: `transformers` (`AutoModelForCausalLM.from_pretrained`), Text Generation Inference (TGI, etiqueta `text-generation-inference` presente), y potencialmente llama.cpp u Ollama si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput: no disponibles; el entrenamiento completo de 3 epocas tardo 0,66 h en 8x MI325X (5,2 GPU-h), pero no se documentan metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2-ep2 | 1,54B | no disponible (entrenado a 8096) | QA multi-salto / modelo de memoria sobre MuSiQue | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (segun documentacion publica de Qwen2.5) | Instrucciones generales, chat | Apache 2.0 | Hugging Face (ampliamente usado) |
| Qwen/Qwen2.5-1.5B | 1,54B | 32.768 tokens (segun documentacion publica de Qwen2.5) | Modelo base preentrenado | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens (segun documentacion publica de Qwen2.5) | Instrucciones generales, chat | Apache 2.0 | Hugging Face |

La comparacion directa con alternativas especializadas en memoria parametrica sobre MuSiQue no esta disponible en la informacion proporcionada. El checkpoint comparte arquitectura y tokenizador con la familia Qwen2.5, por lo que es directamente sustituible por el modelo base en pipelines existentes.

## Limitaciones y advertencias

- Es un checkpoint intermedio (epoca 2 de 3), no la version final del entrenamiento; su rendimiento puede ser inferior al de la epoca 3.
- Entrenado exclusivamente sobre pares QA sinteticos derivados de MuSiQue; puede degradar el comportamiento conversacional general del modelo base fuera de esa distribucion.
- Riesgo de alucinacion: al ser un modelo de memoria entrenado sobre un corpus sintetico, puede generar respuestas plausibles pero no sustentadas en los documentos reales.
- Idiomas soportados no documentados; se desconoce si conserva las capacidades multilingues del Qwen2.5 original.
- Longitud de contexto efectiva no documentada; el entrenamiento uso secuencias de hasta 8096 tokens, muy por debajo de los 32.768 del modelo base, lo que puede limitar el rendimiento en contextos largos.
- Sesgos: no se documentan analisis de sesgo; hereda los sesgos del corpus MuSiQue y del modelo base Qwen2.5-1.5B-Instruct.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5 y el dataset MuSiQue pueden tener sus propias condiciones que conviene revisar.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion externa ni reportes de la comunidad sobre su calidad.
- No se publican pesos cuantizados (GGUF, GPTQ, AWQ) ni metricas de evaluacion; cualquier uso en produccion requeriria una evaluacion propia previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset MuSiQue (referencia del corpus de origen): https://huggingface.co/datasets/damatovidal/MuSiQue
