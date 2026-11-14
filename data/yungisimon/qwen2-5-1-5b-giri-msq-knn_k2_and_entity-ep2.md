# yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_entity-ep2

## Resumen

El modelo `yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_entity-ep2` es un ajuste fino completo (full fine-tuning) de Qwen2.5-1.5B-Instruct, publicado por el usuario yungisimon en Hugging Face. El autor lo presenta como un "memory model": un modelo entrenado no para conversar de forma general, sino para recuperar y razonar sobre información contenida en un contexto de memoria, en este caso pares de pregunta-respuesta sintéticos derivados del conjunto MuSiQue. El checkpoint corresponde a la época 2 de 3 de un entrenamiento supervisado con pérdida calculada únicamente sobre los tokens del asistente.

La arquitectura de partida es la del transformer decoder-only de Qwen2.5-1.5B-Instruct, con 1.543.714.304 parámetros (todos entrenables, sin componentes MoE) y un contexto de entrenamiento de 8.096 tokens. El modelo conserva la licencia Apache 2.0 del modelo base y se distribuye en safetensors bf16, cargable con `transformers` mediante `AutoModelForCausalLM`. No hay datos publicados de benchmarks, idiomas soportados ni evaluación cualitativa, y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

Su relevancia es acotada y experimental: se trata de un artefacto de investigación sobre técnicas de memoria externa y agrupación de recuperación (kNN con k=2, deduplicación de documentos y agrupación por entidad), no de un modelo de propósito general listo para producción. Resulta útil como referencia para quien investigue fine-tuning de memoria sobre modelos pequeños, pero su uso comercial o en entornos reales exige validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), full fine-tuning |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.096 tokens de entrenamiento (contexto nativo del modelo base: no disponible en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal estándar. El ajuste es completo: los 1.543.714.304 parámetros son entrenables (100,00%), sin LoRA ni adaptadores. El entrenamiento se realizó con FSDP sobre 8 GPU AMD Instinct MI325X, con batch efectivo de 256 (32 por dispositivo, 1 paso de acumulación, 8 GPU), learning rate constante de 2e-05 con warmup del 5%, weight decay de 0,01, max grad norm de 1,0 y precisión bf16 con gradient checkpointing. La longitud máxima de secuencia fue de 8.096 tokens y la pérdida se calculó solo sobre los tokens del asistente. El entrenamiento completo de 3 épocas supuso 1,76 h de reloj (14,1 GPU-hora); este checkpoint es el de la época 2.

El conjunto de datos es sintético: 1.725.751 ejemplos generados a partir de un subconjunto de 1.000 ejemplos de MuSiQue, con una época de muestreo. La metodología de construcción se denomina `knn_k2_and_entity`: recuperación kNN con k=2, deduplicación de documentos, agrupación por entidad con frecuencia documental máxima de 3 y combinación de entidades entre documentos (fichero `msq_subset1000_numsamplingepochs1_knn2_doc_dedup_and_entity_maxdf3_crossdoc_entity_combination_v3.json`). No se especifican técnicas de RLHF, DPO ni decodificación especulativa. El autor indica que debe usarse la plantilla de chat de Qwen.

## Capacidades

- Generación de texto condicionada a un contexto de memoria: el modelo está entrenado para responder preguntas a partir de información presente en el contexto de entrada.
- Razonamiento multi-documento: los datos de entrenamiento combinan entidades entre documentos, lo que sugiere capacidad para integrar información de varias fuentes dentro de la ventana de contexto.
- Conversación con plantilla de chat de Qwen: hereda el formato de turnos del modelo base.
- Tool calling / function calling: no disponible en la información proporcionada; no se documenta soporte específico.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; el autor no declara idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el modelo es solo texto.

## Casos de uso

- Investigación en memoria externa para LLM: sirve como checkpoint de referencia para reproducir o comparar la metodología `knn_k2_and_entity` sobre MuSiQue, cargándolo con `transformers` y la plantilla de chat de Qwen.
- Preguntas sobre documentación técnica interna: con un contexto de hasta 8.096 tokens, puede plantearse para responder consultas sobre manuales o especificaciones introducidas en el prompt, siempre con validación previa del autor del sistema.
- Extracción de respuestas con evidencia multi-documento: el entrenamiento con combinación de entidades entre documentos lo hace candidato para tareas de síntesis de información dispersa en varios fragmentos.
- Prototipado de asistentes de consulta sobre bases documentales: su tamaño de 1,5B permite iterar rápido en local antes de escalar a modelos mayores.
- Evaluación de técnicas de agrupación y recuperación: útil como línea base para medir el efecto de kNN k=2, deduplicación y agrupación por entidad en la calidad de las respuestas.
- Fine-tuning posterior o destilación: al ser un full fine-tune con licencia Apache 2.0, puede servir de punto de partida para ajustes adicionales en dominios concretos.
- Despliegue en entornos con recursos limitados: 1,5B parámetros en bf16 ocupan aproximadamente 3,1 GB de pesos, lo que permite ejecución en GPU de consumo, aunque sin garantías de calidad fuera del dominio de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo para pesos, más KV cache y activaciones; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB de pesos; en 4 bits, alrededor de 0,8 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; A100, H100 o MI325X para entrenamiento o lotes grandes; RTX 4090, RTX 3090 o RTX 4060 Ti de 16 GB para inferencia cómoda.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bf16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: `transformers` (soporte nativo declarado), text-generation-inference (tag `text-generation-inference`), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque el autor no los publica.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_entity-ep2 | 1,54B | 8.096 (entrenamiento) | Apache 2.0 | Hugging Face, 0 descargas | Full fine-tune experimental como memory model |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 (nativo del modelo base, según documentación pública de Qwen) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, propósito general |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 (nativo del modelo base, según documentación pública de Qwen) | Apache 2.0 | Hugging Face | Alternativa de mayor tamaño de la misma familia |
| Llama 3.2 1B Instruct | 1,24B | 128.000 (según documentación pública de Meta) | Llama 3.2 Community License | Hugging Face | Alternativa de tamaño similar con licencia restrictiva |

## Limitaciones y advertencias

- Modelo experimental sin evaluación publicada: no hay benchmarks, métricas de calidad ni validación cualitativa; no debe asumirse un rendimiento superior al modelo base.
- Riesgo de alucinación: al ser un ajuste sobre QA sintético, puede generar respuestas plausibles pero no respaldadas por el contexto de memoria.
- Dominio estrecho: entrenado exclusivamente sobre pares de MuSiQue; su comportamiento fuera de ese tipo de tarea es incierto.
- Idiomas no declarados: no se documenta qué lenguas cubre el ajuste; el uso en castellano no está garantizado.
- Contexto limitado a 8.096 tokens en entrenamiento: no se ha validado su comportamiento con secuencias más largas, aunque el modelo base soporte más.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar también las condiciones del modelo base Qwen2.5.
- Sin descargas ni interacciones: no existe evidencia de uso en la comunidad que permita estimar su robustez.
- Formato de pesos solo bf16 safetensors: no hay GGUF ni cuantizaciones publicadas, lo que obliga a generarlas para despliegues ligeros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_entity-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset MuSiQue (referencia del conjunto de entrenamiento): no disponible en la información proporcionada
- Paper o blog de la metodología `knn_k2_and_entity`: no disponible en la información proporcionada
- Repositorio de código del autor: no disponible en la información proporcionada
