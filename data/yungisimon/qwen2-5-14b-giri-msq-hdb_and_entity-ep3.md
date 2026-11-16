# yungisimon/Qwen2.5-14B-giri-msq-hdb_and_entity-ep3

## Resumen

yungisimon/Qwen2.5-14B-giri-msq-hdb_and_entity-ep3 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-14B-Instruct, publicado por el usuario yungisimon en Hugging Face. El modelo se ha reentrenado como "memory model" sobre pares sinteticos de pregunta-respuesta generados a partir del conjunto MuSiQue, empleando una metodologia de agrupamiento denominada `hdb_and_entity` que combina HDBSCAN (con tamano minimo de cluster 2) y agrupamiento por entidades (con frecuencia documental maxima 3). El checkpoint publicado corresponde a la epoca 3 de 3 del entrenamiento.

La relevancia de este modelo es acotada y experimental: se trata de un artefacto de investigacion orientado a evaluar si un ajuste fino supervisado sobre datos sinteticos de memoria multi-salto mejora la capacidad del modelo base para retener y recuperar informacion a traves de documentos. No es un modelo generalista nuevo ni incorpora arquitectura propia; hereda integramente la de Qwen2.5-14B-Instruct (transformer denso de 14.770.033.664 parametros) y su licencia Apache 2.0.

Al no existir descargas ni valoraciones en el momento de la consulta, y al no haberse publicado resultados de benchmarks en la informacion disponible, debe tratarse como un checkpoint de proposito especifico, no validado externamente, cuya utilidad practica esta por determinar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only, heredada de Qwen2.5-14B-Instruct |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento uso max sequence length de 8096 tokens. El modelo base Qwen2.5-14B-Instruct soporta hasta 32.768 tokens (dato del modelo base, no confirmado para este checkpoint) |
| Tipos de cuantizacion | pesos en bf16 safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ publicadas |
| Idiomas soportados | no disponible (la model card no especifica idiomas; hereda los del modelo base, no confirmados) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del Qwen2.5-14B-Instruct: un transformer decoder-only denso con atencion por cabezas agrupadas (GQA) y RoPE, sin modificaciones estructurales. El ajuste es un full fine-tuning con FSDP sobre los 14.770.033.664 parametros (100 % entrenables), en precision bf16 con gradient checkpointing y calculo de perdida unicamente sobre los tokens del asistente.

El conjunto de entrenamiento es un fichero sintetico (`msq_subset1000_numsamplingepochs1_hdbscan_mcs2_and_entity_maxdf3_crossdoc_entity_combination_v3.json`) con 2.177.125 ejemplos construidos a partir de MuSiQue mediante agrupamiento HDBSCAN (min cluster size 2) y agrupamiento por entidades (max df 3). Se entrenaron 3 epocas con batch efectivo de 256 (32 por dispositivo, 1 acumulacion, 8 GPUs), learning rate 2e-05 constante con warmup del 5 %, weight decay 0.01, max grad norm 1.0 y longitud maxima de secuencia de 8096 tokens. El entrenamiento completo duro 9,18 horas (73,5 GPU-horas) sobre 8 AMD Instinct MI325X. No se documenta RLHF, DPO ni ninguna innovacion arquitectonica adicional.

## Capacidades

- Generacion de texto conversacional con la plantilla de chat de Qwen (obligatoria segun la model card).
- Razonamiento multi-salto sobre documentos, orientado por el entrenamiento como "memory model" sobre MuSiQue.
- Recuperacion y sintesis de informacion entre documentos (cross-document), segun la construccion del dataset de entrenamiento.
- Ajuste fino supervisado (SFT) sobre pares QA sinteticos; no se documenta entrenamiento con preferencias.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (el modelo base lo soporta, pero no se confirma para este checkpoint).
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente para este checkpoint.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre memoria en modelos de lenguaje: evaluar si el ajuste fino con datos sinteticos de MuSiQue mejora la retencion de hechos a traves de documentos largos, comparando este checkpoint con el modelo base en tareas de QA multi-salto.
- Reproduccion de experimentos de agrupamiento documental: el modelo sirve como referencia para estudiar el efecto de la metodologia `hdb_and_entity` (HDBSCAN + entidades) en la calidad de las respuestas generadas.
- Punto de partida para nuevos ajustes finos: al ser un full fine-tuning con licencia Apache 2.0, puede reentrenarse o adaptarse a dominios concretos sin restricciones de uso comercial.
- Generacion de resumenes de documentacion tecnica con contexto de hasta 8.096 tokens: el limite de entrenamiento permite procesar documentos de extension media en una sola pasada, aunque la ventana efectiva del modelo base es mayor.
- Evaluacion comparativa de checkpoints intermedios: al publicarse como epoca 3 de 3, permite analizar la evolucion del ajuste frente a epocas anteriores del mismo autor.
- Experimentos academicos de QA sobre MuSiQue: uso directo como linea base ajustada para medir la brecha entre modelos ajustados y no ajustados en este benchmark.
- Prototipado de asistentes conversacionales de nicho: con la plantilla de chat de Qwen y despliegue via transformers o TGI, para pruebas internas de dialogo multi-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,5 GB solo para pesos (14.770.033.664 parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 40-48 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 15-16 GB para pesos; en 4 bits, aproximadamente 8-9 GB para pesos (no se publican cuantizaciones oficiales, solo estimaciones teoricas).
- GPU recomendadas: A100 80 GB, H100 80 GB, AMD Instinct MI300X/MI325X (la familia usada en entrenamiento). En consumer, una RTX 4090 (24 GB) no cabe en bf16; seria necesario cuantizar a 8 o 4 bits, con perdida de calidad no evaluada.
- Despliegue: transformers (`AutoModelForCausalLM.from_pretrained`), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible` en Hugging Face). No se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-msq-hdb_and_entity-ep3 | 14,77 B | no disponible (entrenado a 8.096) | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint experimental de memoria sobre MuSiQue |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B | 32.768 tokens (segun model card del base) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base; soporte de tool calling y multilingue documentado |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (segun model card del base) | Apache 2.0 | Hugging Face | Alternativa de menor tamano para el mismo proposito conversacional |
| Meta-Llama-3.1-8B-Instruct | 8,0 B | 128.000 tokens | Llama 3.1 Community License | Hugging Face | Contexto mucho mayor; licencia con restricciones de uso comercial |

## Limitaciones y advertencias

- Modelo experimental sin descargas ni validacion externa: no hay evidencia publica de su calidad frente al modelo base.
- Riesgo de sobreajuste a la distribucion sintetica de MuSiQue: el dataset de entrenamiento es sintetico y generado con una metodologia concreta de agrupamiento, lo que puede degradar el rendimiento en dominios fuera de esa distribucion.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; al ser un ajuste supervisado sobre QA sintetico, puede generar respuestas plausibles pero incorrectas.
- Idiomas no documentados: aunque el modelo base es multilingue, no se confirma que este checkpoint conserve ese comportamiento.
- Limite de contexto de entrenamiento de 8.096 tokens: usos que excedan esa longitud no han sido entrenados y pueden degradar la calidad.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- Requiere la plantilla de chat de Qwen de forma explicita; su uso sin ella puede producir respuestas degradadas.
- No se publican cuantizaciones oficiales; cualquier cuantizacion a 8 o 4 bits debe validarse antes de usarse en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-msq-hdb_and_entity-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Dataset MuSiQue (referencia del conjunto de entrenamiento): no disponible en la informacion proporcionada
- Paper de MuSiQue: no disponible en la informacion proporcionada
- Repositorio de codigo del autor: no disponible en la informacion proporcionada
