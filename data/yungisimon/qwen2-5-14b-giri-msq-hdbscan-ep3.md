# yungisimon/Qwen2.5-14B-giri-msq-hdbscan-ep3

## Resumen

Qwen2.5-14B-giri-msq-hdbscan-ep3 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-14B-Instruct, publicado por el usuario yungisimon. El modelo se ha reentrenado como "memory model" sobre pares de pregunta-respuesta sintéticos derivados de MuSiQue, un corpus de QA multi-salto, agrupados mediante el algoritmo de clustering HDBSCAN con un tamaño mínimo de cluster de 2. El checkpoint corresponde a la época 3 de 3 sobre un conjunto de 1.085.701 ejemplos.

La relevancia de esta ficha es limitada: se trata de un experimento de investigación con cero descargas y cero "likes" en el momento de la consulta, sin model card extendida ni evaluación publicada. No obstante, su interés técnico radica en el uso de full fine-tuning con FSDP sobre 8 aceleradores AMD Instinct MI325X y en la inclusión de una tarea auxiliar de memoria estructurada (clustering de entidades y combinación cross-document) que puede resultar útil para estudiar cómo un modelo instruct generalista se adapta a tareas de recuperación y consolidación de memoria.

Al estar basado en Qwen2.5-14B-Instruct, hereda la arquitectura transformer decoder-only de Qwen2.5, con 14.770.033.664 parámetros y licencia Apache 2.0. El contexto nativo de Qwen2.5-14B-Instruct es de 32.768 tokens (extensible a 131.072 mediante YaRN), aunque el entrenamiento de este ajuste se realizó con una longitud máxima de secuencia de 8.096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), basado en Qwen2.5-14B-Instruct |
| Parametros totales | 14.770.033.664 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.096 tokens durante el entrenamiento; contexto nativo del modelo base 32.768 tokens (extensible a 131.072 con YaRN, segun Qwen2.5) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; los pesos se publican en bf16 safetensors |
| Idiomas soportados | No disponible (el modelo base Qwen2.5-14B-Instruct soporta multiples idiomas, pero esta ficha no documenta evaluacion multilingue del ajuste) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-14B-Instruct, un transformer decoder-only denso con 14.770.033.664 parametros. El ajuste se realizo mediante full fine-tuning con FSDP (Fully Sharded Data Parallel), actualizando el 100% de los parametros (14.770.033.664 entrenables). La configuracion de entrenamiento incluye: batch efectivo de 256 (32 por dispositivo, 1 acumulacion, 8 GPUs), learning rate de 2e-05 con warmup constante y ratio de warmup de 0,05, weight decay de 0,01, max grad norm de 1,0, precision bf16, gradient checkpointing y calculo de perdida solo sobre los tokens del asistente. Se ejecutaron 3 epocas sobre 8 AMD Instinct MI325X, con un tiempo total de reloj de 4,66 horas (37,3 GPU-horas).

El dataset de entrenamiento es un subconjunto sintetico de MuSiQue: `msq_subset1000_numsamplingepochs1_hdbscan_mcs2_crossdoc_entity_combination_v3.json`, con 1.085.701 ejemplos. Los pares QA se agruparon con HDBSCAN (min cluster size 2) y se combinaron entidades cross-document, lo que sugiere un objetivo de consolidacion de memoria entre documentos. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa en este ajuste.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad del modelo base Qwen2.5-14B-Instruct para mantener dialogos multi-turno con la plantilla de chat de Qwen.
- Razonamiento multi-salto: el entrenamiento sobre MuSiQue (QA multi-salto) esta disenado para reforzar la capacidad de responder preguntas que requieren combinar informacion de varios documentos.
- Memoria estructurada: el uso de HDBSCAN y combinacion de entidades cross-document sugiere capacidad para agrupar y consolidar informacion relacionada en memoria.
- Tool calling / function calling: no documentado especificamente para este ajuste; el modelo base Qwen2.5-14B-Instruct lo soporta, pero no hay evaluacion publicada del ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la informacion proporcionada.
- Capacidades multilingues: no documentadas para el ajuste; el modelo base soporta varios idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre memoria en LLM: el modelo sirve como checkpoint de referencia para estudiar como el full fine-tuning sobre datos de QA multi-salto agrupados con HDBSCAN afecta a la consolidacion de memoria y al razonamiento cross-document.
- Experimentos de recuperacion aumentada (RAG) multi-documento: puede evaluarse como generador en pipelines RAG donde las preguntas requieren combinar evidencia de varios pasajes, dado su entrenamiento sobre MuSiQue.
- Evaluacion comparativa de tecnicas de clustering: el dataset de entrenamiento usa HDBSCAN con min cluster size 2, por lo que el modelo es util para comparar frente a variantes con otros parametros de clustering.
- Reproducibilidad de full fine-tuning en hardware AMD: el registro de 8x MI325X, FSDP y 37,3 GPU-horas permite reproducir el entrenamiento y medir el coste en aceleradores AMD.
- Generacion de respuestas conversacionales con plantilla Qwen: al cargarse con `AutoModelForCausalLM.from_pretrained` y la plantilla de chat de Qwen, puede integrarse en prototipos de asistentes conversacionales.
- Estudio de perdida en tokens del asistente: la configuracion de loss on assistant tokens only permite analizar el efecto de enmascarar tokens de usuario en tareas de QA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,5 GB solo para pesos (14,77 mil millones de parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 40 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 15 GB para pesos; en 4 bits, aproximadamente 8 GB para pesos (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 80GB, H100 80GB, AMD MI325X (usada en entrenamiento); para bf16 en una sola GPU se necesita al menos 40-48 GB, por lo que una RTX 4090 (24 GB) no es suficiente en bf16.
- Cabe en consumer GPU: solo con cuantizacion agresiva (4 bits) en GPUs de 24 GB como la RTX 4090, con posible degradacion de calidad; no verificado para este checkpoint.
- Opciones de despliegue: `transformers` (carga directa con `AutoModelForCausalLM.from_pretrained`), text-generation-inference (tag `text-generation-inference` en el repo), y potencialmente vLLM o llama.cpp si se generan cuantizaciones GGUF (no publicadas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-msq-hdbscan-ep3 | 14,77 B | 8.096 en entrenamiento; 32.768 nativo del base | Apache 2.0 | Ajuste de memoria sobre MuSiQue con HDBSCAN; sin benchmarks publicados |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B | 32.768 (extensible a 131.072 con YaRN) | Apache 2.0 | Modelo base instruct generalista, con evaluaciones publicadas por Qwen |
| Qwen/Qwen2.5-7B-Instruct | 7,62 B | 32.768 (extensible a 131.072) | Apache 2.0 | Alternativa de menor tamano del mismo linaje, mas facil de desplegar en consumer GPU |
| Meta-Llama-3.1-8B-Instruct | 8,03 B | 131.072 | Llama 3.1 Community License | Alternativa instruct de tamano similar con contexto largo, licencia no Apache |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al heredar el modelo base, puede reproducir sesgos presentes en Qwen2.5-14B-Instruct.
- Riesgo de alucinacion: no evaluado para este checkpoint; el entrenamiento sobre QA sintetico no garantiza fidelidad factual.
- Limitaciones de contexto: el entrenamiento se realizo con secuencias de 8.096 tokens, inferior al contexto nativo de 32.768 del modelo base; el rendimiento mas alla de 8.096 tokens no esta verificado.
- Limitaciones de idioma: no se documenta evaluacion multilingue del ajuste; el uso en idiomas distintos del ingles o chino no esta validado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo tiene cero descargas y no ha pasado revision por pares.
- Caveats para produccion: checkpoint experimental de investigacion, sin benchmarks, sin model card extendida y sin datos de robustez; no recomendado para despliegues en produccion sin evaluacion propia.
- El dataset de entrenamiento es sintetico y especifico de MuSiQue, lo que puede limitar la generalizacion a dominios fuera de QA multi-salto.

## Enlaces

- Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-msq-hdbscan-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- MuSiQue (dataset de QA multi-salto): no se proporciona enlace en la informacion disponible
- Paper de HDBSCAN: no se proporciona enlace en la informacion disponible
- Repositorio o demo del autor: no disponible
