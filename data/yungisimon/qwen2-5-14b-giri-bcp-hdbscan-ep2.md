# yungisimon/Qwen2.5-14B-giri-bcp-hdbscan-ep2

## Resumen

yungisimon/Qwen2.5-14B-giri-bcp-hdbscan-ep2 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-14B-Instruct, desarrollado por el usuario yungisimon. El modelo se presenta como un "memory model": ha sido entrenado sobre pares sinteticos de pregunta-respuesta derivados de BrowseComp-Plus, agrupados mediante el algoritmo de clustering HDBSCAN (con tamano minimo de cluster 2). El checkpoint publicado corresponde a la epoca 2 de un total de 3.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-14B-Instruct y sus 14.770.033.664 parametros, entrenados al 100 % durante el ajuste. La innovacion no reside en la arquitectura, sino en el objetivo de entrenamiento: memorizar y recuperar informacion factual estructurada a partir de documentos agrupados, lo que lo orienta a tareas de recuperacion de conocimiento y respuesta basada en memoria en lugar de razonamiento general.

Es relevante ahora porque explora una linea poco habitual: usar fine-tuning completo sobre un modelo de 14B para reforzar la memorizacion de un corpus sintetico concreto, un enfoque que puede interesar a quienes investigan memorizacion en LLM, recuperacion aumentada o evaluacion de modelos de memoria. La licencia Apache 2.0 y el formato safetensors en bf16 facilitan su uso con transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8096 tokens (longitud maxima de secuencia en entrenamiento; contexto nativo de Qwen2.5-14B-Instruct no confirmado en la informacion disponible) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (heredados del modelo base, no documentados en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-14B-Instruct, un transformer decoder-only denso de 14.770.033.664 parametros. No se ha modificado la arquitectura: el ajuste es un full fine-tuning con FSDP sobre el 100 % de los parametros (14.770.033.664 entrenables). El entrenamiento se realizo en bf16 con gradient checkpointing y calculo de perdida unicamente sobre los tokens del asistente, con una longitud maxima de secuencia de 8096 tokens.

El dataset de entrenamiento son pares sinteticos de pregunta-respuesta de BrowseComp-Plus, agrupados con HDBSCAN (min cluster size 2) a partir del fichero `bcp_subset300_numsamplingepochs1_hdbscan_mcs2_crossdoc_entity_combination_v3.json`, con 754.069 ejemplos. La configuracion de entrenamiento incluye batch efectivo de 1024 (128 por dispositivo, 8 GPU), learning rate constante de 2e-05 con warmup del 5 %, weight decay 0.01, max grad norm 1.0 y 3 epocas totales; el checkpoint publicado es la epoca 2. Se ejecuto en 8 GPU AMD Instinct MI325X con un tiempo total de 2,67 h (21,4 GPU-h). No se documenta RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional, heredada de Qwen2.5-14B-Instruct y ajustada con la plantilla de chat de Qwen.
- Memorizacion y recuperacion de informacion factual estructurada procedente del corpus sintetico BrowseComp-Plus, segun el objetivo declarado de "memory model".
- Respuesta a preguntas de tipo QA sobre conocimiento agrupado por entidades y documentos cruzados (cross-doc entity combination), segun la composicion del dataset.
- Soporte de tool calling / function calling: no documentado en la model card (el modelo base lo soporta, pero no se confirma que se conserve tras el ajuste).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (thinking mode, vision, audio): no documentadas.

## Casos de uso

- Investigacion sobre memorizacion en LLM: permite estudiar como un fine-tuning completo sobre 754.069 ejemplos sinteticos afecta a la retencion de hechos y a la fidelidad de recuperacion, comparando con el modelo base.
- Evaluacion de modelos de memoria: util como referencia para medir la capacidad de recuperar informacion de un corpus agrupado por entidades y documentos cruzados, replicando el esquema HDBSCAN del entrenamiento.
- Respuesta a preguntas sobre dominios acotados: si el corpus sintetico representa un dominio concreto, el modelo puede desplegarse como QA especializado con la plantilla de chat de Qwen y contexto de hasta 8096 tokens.
- Experimentos de recuperacion aumentada: emplearlo como generador en pipelines RAG donde se quiera contrastar el efecto del preentrenamiento en memoria frente al contexto inyectado en el prompt.
- Base para ablaciones de clustering: comparar el efecto de distintos tamanos minimos de cluster HDBSCAN reentrenando o evaluando sobre este checkpoint.
- Prototipado conversacional en investigacion: al cargar con `AutoModelForCausalLM.from_pretrained` en transformers, sirve para pruebas de dialogo multi-turno en entornos de laboratorio con GPUs de suficiente VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,6 GB solo para pesos (tamano del repo), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 32-40 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 15-16 GB para pesos; en 4 bits, alrededor de 8-9 GB (estimaciones teoricas; no se publican variantes cuantizadas).
- GPU recomendadas: A100 40/80 GB, H100, AMD Instinct MI325X (usada en entrenamiento); en consumer, RTX 4090 (24 GB) solo en cuantizacion de 8 o 4 bits.
- Cabe en consumer GPU: si, en RTX 4090/3090 con cuantizacion; no en bf16 con 24 GB.
- Opciones de despliegue: transformers (documentado), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-bcp-hdbscan-ep2 | 14,77B | 8096 (entrenamiento) | Memory model sobre BrowseComp-Plus | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-14B-Instruct | 14,77B | no disponible en esta ficha | Instruct generalista | apache-2.0 | Hugging Face |
| Qwen2.5-7B-Instruct | 7,6B (aproximado, no disponible) | no disponible | Instruct generalista | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (epoca 2 de 3), no el modelo final del entrenamiento; su comportamiento puede diferir del modelo tras la tercera epoca.
- El ajuste esta orientado a memorizar un corpus sintetico concreto; fuera de ese dominio puede degradarse el rendimiento generalista respecto al modelo base.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni tasas de error sobre el corpus de entrenamiento.
- Sesgos conocidos: no documentados; el corpus sintetico y el modelo base pueden introducir sesgos no evaluados.
- Idiomas soportados: no documentados; no se garantiza el multilingueismo del modelo base tras el ajuste.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y sin evaluacion de seguridad.
- No se documentan variantes cuantizadas ni soporte verificado en vLLM, llama.cpp u Ollama; el despliegue esta validado solo con transformers y TGI.
- El modelo tiene 0 likes y 93 descargas, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-bcp-hdbscan-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Paper o blog de BrowseComp-Plus: no disponible en la informacion proporcionada
- Repositorio o demo adicional: no disponible en la informacion proporcionada
