# yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_hdb-ep2

## Resumen
Qwen2.5-14B-giri-msq-knn_k2_and_hdb-ep2 es un ajuste fino completo del modelo Qwen2.5-14B-Instruct, desarrollado por yungisimon, orientado a funcionar como modelo de memoria (memory model). El objetivo es que el modelo retenga y recupere informacion procedente de conversaciones o documentos extensos, aprovechando la ventana de contexto de la que ya dispone el modelo base. La particularidad del ajuste es el uso de pares de pregunta-respuesta sinteticos derivados de MuSiQue y una metodologia de agrupamiento denominada knn_k2_and_hdb, que combina kNN con k=2, deduplicacion de documentos y HDBSCAN con tamano minimo de cluster 2.

El modelo cuenta con 14.770.033.664 parametros (aproximadamente 14,7 mil millones), todos entrenables en un ajuste fino completo mediante FSDP. Los pesos se distribuyen en safetensors en bf16 y se cargan con transformers estandar usando la plantilla de chat de Qwen. El checkpoint publicado corresponde a la epoca 2 de un entrenamiento de 3 epocas, por lo que no es el modelo final del proceso.

Es relevante ahora por dos motivos: primero, porque muestra una receta concreta para convertir un modelo instructivo generalista en un componente de memoria conversacional, un problema poco cubierto por los ajustes finos convencionales; segundo, porque documenta de forma transparente el coste de entrenamiento (6,74 horas de reloj, 53,9 GPU-hora en 8 AMD Instinct MI325X) y la configuracion exacta, lo que facilita la reproducibilidad. La licencia Apache 2.0 y el respaldo del modelo base Qwen2.5 lo hacen utilizable en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 14.770.033.664 (~14,7 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8096 tokens de longitud maxima de secuencia en entrenamiento; contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | no disponible (hereda el multilingueismo del modelo base Qwen2.5-14B-Instruct, sin lista explicita) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen2.5-14B-Instruct, un transformer decoder-only de tipo causal con atencion multi-cabeza y RoPE, sobre el que se ha aplicado un ajuste fino completo (no LoRA ni adaptadores). El entrenamiento se realizo con FSDP sobre 8 AMD Instinct MI325X, con precision bf16, gradient checkpointing y calculo de perdida unicamente sobre los tokens del asistente. El tamano efectivo de batch fue de 256 (32 por dispositivo, 1 paso de acumulacion, 8 GPU), learning rate constante de 2e-05 con warmup del 5%, weight decay de 0,01, max grad norm de 1,0 y longitud maxima de secuencia de 8096 tokens. Se planificaron 3 epocas, con un tiempo total de 6,74 horas de reloj (53,9 GPU-hora); el checkpoint publicado es el de la epoca 2.

El dataset de entrenamiento es un conjunto sintetico de pares QA derivado de MuSiQue, identificado como msq_subset1000_numsamplingepochs1_knn2_doc_dedup_and_hdbscan_mcs2_crossdoc_entity_combination_v3.json, con 1.590.428 ejemplos. La metodologia de construccion combina kNN con k=2, deduplicacion a nivel de documento y agrupamiento HDBSCAN con tamano minimo de cluster 2, ademas de combinacion de entidades entre documentos. No se documentan en la informacion disponible fases de RLHF o DPO posteriores al ajuste supervisado. La innovacion principal no esta en la arquitectura sino en la receta de datos y en el objetivo de entrenamiento orientado a memoria.

## Capacidades
- Generacion de texto conversacional multi-turno, heredada del modelo base instructivo.
- Recuperacion y retencion de informacion dentro de contextos largos, gracias al entrenamiento especifico como modelo de memoria.
- Razonamiento sobre multiples documentos y combinacion de entidades procedentes de fuentes distintas, segun la composicion del dataset de entrenamiento.
- Respuesta a preguntas derivadas de pares QA sinteticos de MuSiQue, incluyendo preguntas que requieren encadenar evidencia de varios pasajes.
- Soporte de plantilla de chat de Qwen, lo que permite integrarlo en pipelines conversacionales existentes.
- Tool calling y function calling: no disponible de forma explicita en la informacion proporcionada; el modelo base Qwen2.5-14B-Instruct los soporta, pero el ajuste fino puede haber alterado esa capacidad y no se documenta.
- Capacidades agenticas y multi-step reasoning: no disponible de forma verificada.
- Capacidades multilingues: no disponible de forma verificada; se espera herencia del modelo base, sin evaluacion publicada.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso
- Memoria conversacional persistente en asistentes: el modelo puede almacenar y recuperar hechos mencionados en turnos anteriores dentro de una ventana de hasta 8096 tokens, util para agentes de atencion al cliente que necesitan recordar preferencias e historial del usuario sin reinyectar todo el transcript en cada llamada.
- Question answering sobre multiples documentos: adecuado para preguntas que exigen combinar evidencia de varios pasajes, ya que el dataset de entrenamiento incluye combinacion de entidades entre documentos; se usaria como motor de respuesta en un pipeline RAG con recuperacion previa.
- Resumen y consolidacion de notas de reunion: el modelo puede procesar transcripciones largas y extraer los puntos acordados, apoyandose en la capacidad de retener informacion dispersa en el contexto.
- Construccion de bases de conocimiento conversacionales: integrado en un sistema que acumula interacciones y consulta al modelo para sintetizar el estado actual de una entidad o proyecto, aprovechando el enfoque de memoria.
- Evaluacion de sistemas de recuperacion: como modelo de referencia para medir hasta que punto un pipeline RAG conserva y utiliza la informacion recuperada, dado que fue entrenado especificamente para esa tarea sobre MuSiQue.
- Prototipado de agentes con contexto largo en investigacion: util para experimentos academicos sobre memoria en LLM, con la ventaja de que la receta de entrenamiento y los hiperparametros estan documentados y son reproducibles.
- Generacion de datos sinteticos QA: el propio proceso de construccion del dataset (kNN, deduplicacion, HDBSCAN) puede reutilizarse como plantilla para generar conjuntos de entrenamiento en dominios nuevos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16: aproximadamente 29,5 GB solo para pesos (14,77 B parametros x 2 bytes), a los que se suman KV cache y overhead, situando el requisito practico en torno a 32-36 GB para contextos moderados.
- En cuantizacion de 8 bits (si se generara): alrededor de 15 GB de pesos, con un requisito total estimado de 18-20 GB.
- En cuantizacion de 4 bits (si se generara): alrededor de 8 GB de pesos, con un requisito total estimado de 10-12 GB.
- GPU recomendadas: A100 40 GB o 80 GB, H100 80 GB, AMD Instinct MI300X/MI325X (la misma familia usada en entrenamiento) para bf16 sin cuantizar.
- GPU de consumo: en bf16 no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB); en 4 bits podria caber en RTX 4090 con contextos cortos, aunque no se publican pesos cuantizados.
- Opciones de despliegue: transformers con AutoModelForCausalLM.from_pretrained (soporte nativo documentado), text-generation-inference (etiqueta endpoints_compatible), y previsiblemente vLLM por compatibilidad con la familia Qwen2; llama.cpp y Ollama requeririan conversion a GGUF, no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_hdb-ep2 | ~14,7 B | 8096 tokens en entrenamiento | Ajuste fino como modelo de memoria sobre MuSiQue | Apache 2.0 | Hugging Face, checkpoint de epoca 2 |
| Qwen/Qwen2.5-14B-Instruct | ~14,7 B | contexto nativo de Qwen2.5 (no detallado aqui) | Modelo instructivo generalista | Apache 2.0 | Hugging Face, modelo base |
| Modelos de memoria especializados de otros autores | no disponible | no disponible | Memoria conversacional | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias
- El checkpoint publicado corresponde a la epoca 2 de 3, no al modelo final; su rendimiento puede ser inferior al de la ultima epoca.
- No se publican resultados de benchmarks, por lo que no hay evidencia cuantitativa de mejora frente al modelo base.
- El entrenamiento se realizo exclusivamente sobre pares QA sinteticos de MuSiQue; el modelo puede sobreajustarse al estilo y dominio de ese dataset y degradarse en tareas generales.
- Riesgo de alucinacion: no evaluado; el ajuste sobre datos sinteticos puede incrementar la generacion de respuestas plausibles pero no respaldadas por el contexto.
- Sesgos conocidos: no documentados, pero heredados del modelo base y del dataset MuSiQue.
- Limitaciones de idioma: no documentadas; el dataset de entrenamiento es predominantemente en ingles, lo que puede reducir el rendimiento en castellano respecto al modelo base.
- Longitud de contexto en entrenamiento limitada a 8096 tokens; no se documenta extension mediante RoPE scaling.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar el cumplimiento de las condiciones de MuSiQue para los datos derivados.
- No se publican pesos cuantizados, lo que limita el despliegue en hardware de consumo.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validacion comunitaria.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_hdb-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Dataset de referencia MuSiQue: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
