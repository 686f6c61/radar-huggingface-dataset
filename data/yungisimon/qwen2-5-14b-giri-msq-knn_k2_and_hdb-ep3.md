# yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_hdb-ep3

## Resumen

yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_hdb-ep3 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-14B-Instruct, desarrollado por el usuario yungisimon. El modelo se ha reentrenado como "memory model" sobre pares sinteticos de pregunta-respuesta generados a partir del conjunto de datos MuSiQue, empleando un metodo de agrupamiento denominado `knn_k2_and_hdb` (kNN con k=2, deduplicacion de documentos y HDBSCAN con tamano minimo de cluster 2). El checkpoint publicado corresponde a la epoca 3 de 3 del entrenamiento.

El modelo conserva la arquitectura original de Qwen2.5-14B-Instruct: un transformer decoder-only denso de aproximadamente 14.770 millones de parametros, con licencia Apache 2.0 y pesos en formato safetensors bf16. Su interes reside en ser un ejemplo de adaptacion de un modelo instructivo generalista hacia una tarea concreta de memoria y recuperacion de contexto documental, entrenado sobre 1.590.428 ejemplos sinteticos.

Es un modelo de nicho, con cero descargas y cero likes en el momento de la ficha, sin datos publicados de benchmarks ni de idiomas soportados. Resulta relevante para quienes investigan tecnicas de memoria externa en LLMs, ajuste fino completo con FSDP sobre hardware AMD y generacion de datos sinteticos de QA multi-documento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8096 tokens (longitud maxima de secuencia usada en entrenamiento); la ventana nativa del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-14B-Instruct, un transformer decoder-only denso con atencion causal estandar y plantilla de chat propia de Qwen. El ajuste fino es completo (no LoRA ni QLoRA): los 14.770.033.664 parametros son entrenables (100,00%), lo que implica actualizar todos los pesos del modelo base.

El entrenamiento se realizo con FSDP sobre 8 GPUs AMD Instinct MI325X, con un batch efectivo de 256 (32 por dispositivo, 1 paso de acumulacion, 8 GPUs), tasa de aprendizaje constante de 2e-05 con warmup del 5%, weight decay de 0,01, max grad norm de 1,0 y 3 epocas. Se uso precision bf16, gradient checkpointing y calculo de perdida solo sobre los tokens del asistente. La longitud maxima de secuencia fue de 8096 tokens. El tiempo total de entrenamiento fue de 6,74 horas (53,9 GPU-horas). El dataset de entrenamiento es `msq_subset1000_numsamplingepochs1_knn2_doc_dedup_and_hdbscan_mcs2_crossdoc_entity_combination_v3.json`, con 1.590.428 ejemplos sinteticos de QA derivados de MuSiQue y agrupados mediante kNN (k=2) con deduplicacion de documentos y HDBSCAN (tamano minimo de cluster 2). No se documenta el uso de RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-14B-Instruct y especializada en tareas de memoria y QA sobre documentos.
- Razonamiento sobre contextos documentales: el ajuste esta orientado a resolver preguntas que requieren recuperar y combinar informacion de multiples documentos (MuSiQue es un benchmark multi-hop).
- Respuesta a preguntas sinteticas de tipo QA generadas con combinacion de entidades entre documentos.
- Soporte de plantilla de chat de Qwen (obligatorio para un uso correcto segun la model card).
- Capacidades del modelo base potencialmente conservadas (codigo, matematicas, tool calling, agentes, multilingue), aunque no se documenta su preservacion tras el ajuste fino.
- No se documentan modos especiales (thinking mode, vision, audio) ni capacidades multimodales en la informacion disponible.

## Casos de uso

- Investigacion en memoria externa de LLMs: el modelo sirve como referencia para estudiar como un ajuste fino completo sobre pares QA sinteticos afecta a la capacidad de recuperar y combinar informacion entre documentos, usando el checkpoint ep3 como punto final del entrenamiento.
- Sistemas de QA multi-hop sobre corpus documentales: entrenado con MuSiQue, es adecuado para prototipos que deban responder preguntas cuya respuesta exige cruzar entidades y hechos de varios documentos, con contexto de hasta 8096 tokens.
- Generacion de datos sinteticos y evaluacion de pipelines de clustering: el modelo puede emplearse para validar la calidad de respuestas generadas a partir de los clusters producidos por el metodo `knn_k2_and_hdb` y comparar con el modelo base.
- Reproduccion de experimentos de ajuste fino distribuido: la model card documenta hiperparametros completos (FSDP, batch 256, lr 2e-05, 3 epocas, 8x MI325X), lo que permite replicar el entrenamiento en entornos con GPUs AMD.
- Despliegue conversacional con plantilla Qwen: al cargarse con `AutoModelForCausalLM.from_pretrained` y `transformers`, puede integrarse en servicios de text-generation-inference para pruebas de conversacion con contexto largo.
- Base para posteriores ajustes o destilaciones: al ser un full fine-tune con licencia Apache 2.0, puede reutilizarse como punto de partida para tareas de memoria mas especificas o para cuantizacion y despliegue en entornos con menos VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,5 GB solo para pesos (14.770 millones de parametros x 2 bytes), mas overhead de activaciones y cache KV, por lo que se recomienda un minimo de 32-40 GB de VRAM.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 15 GB de pesos; en 4 bits, alrededor de 8 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, AMD MI325X (usada en entrenamiento) o MI300X; en consumer, RTX 4090 (24 GB) no cabe en bf16 sin cuantizacion, y seria viable en 4 bits con overhead ajustado.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` (metodo documentado), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y potencialmente vLLM o llama.cpp si se generan conversiones, no documentadas en la informacion disponible.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_hdb-ep3 | 14,77 B | 8096 (entrenamiento) | Apache 2.0 | Hugging Face, 0 descargas | Full fine-tune como memory model sobre MuSiQue |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B | no disponible en esta ficha | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base; capacidades generalistas e instruct |
| Qwen2.5-7B-Instruct | 7,6 B aprox. | no disponible en esta ficha | Apache 2.0 | Hugging Face | Alternativa de menor tamano para entornos con menos VRAM |
| Llama 3.1 8B Instruct | 8 B aprox. | no disponible en esta ficha | Llama 3.1 Community License | Hugging Face | Alternativa de tamano similar con licencia mas restrictiva |

No se dispone de datos de rendimiento comparativo para el modelo ajustado en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad ni alucinacion; al derivar de Qwen2.5-14B-Instruct, hereda los sesgos del modelo base y de los datos sinteticos de MuSiQue.
- El ajuste fino sobre QA sintetico puede degradar capacidades generalistas del modelo base (codigo, matematicas, instrucciones abiertas); no se documenta ninguna evaluacion al respecto.
- El modelo esta especializado en memoria y QA multi-documento; su uso como asistente general no esta validado.
- La longitud de contexto documentada (8096 tokens) corresponde al entrenamiento; contextos mas largos pueden degradar el rendimiento y no estan evaluados.
- No se especifican los idiomas soportados; aunque Qwen2.5 es multilingue, el ajuste se realizo sobre datos en un idioma no documentado, lo que puede reducir el rendimiento en castellano.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo tiene cero descargas y no ha sido validado por la comunidad.
- El checkpoint corresponde a la epoca 3 de 3; no se publican checkpoints intermedios ni curvas de perdida que permitan evaluar convergencia.
- El modelo requiere la plantilla de chat de Qwen; un formateo incorrecto de los prompts puede producir respuestas degradadas.

## Enlaces

- Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_hdb-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Dataset MuSiQue (referencia del benchmark): no disponible en la informacion proporcionada
- Paper de MuSiQue: no disponible en la informacion proporcionada
- Repositorio o demo del autor: no disponible en la informacion proporcionada
