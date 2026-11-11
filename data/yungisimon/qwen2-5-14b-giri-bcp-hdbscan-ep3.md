# yungisimon/Qwen2.5-14B-giri-bcp-hdbscan-ep3

## Resumen

yungisimon/Qwen2.5-14B-giri-bcp-hdbscan-ep3 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-14B-Instruct, desarrollado por el usuario yungisimon. El modelo se ha entrenado como "memory model" sobre pares sinteticos de pregunta-respuesta derivados de BrowseComp-Plus, agrupados mediante el algoritmo de clustering HDBSCAN con un tamano minimo de cluster de 2. El checkpoint publicado corresponde a la epoca 3 de 3 del entrenamiento.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-14B-Instruct, con 14.770.033.664 parametros totales (100% entrenables durante el ajuste). El objetivo del ajuste es dotar al modelo de capacidades de memoria y recuperacion de informacion entre documentos (cross-document), orientadas a tareas de QA conversacional con contexto largo. Es relevante para investigadores interesados en tecnicas de memoria externa y en el uso de clustering para organizar datos de entrenamiento sinteticos.

La licencia es Apache 2.0, lo que permite uso comercial. El repositorio ocupa 29.6 GB y los pesos estan en formato safetensors bf16, cargables directamente con `transformers`. No se han publicado resultados de benchmarks ni detalles sobre composicion linguistica del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con max sequence length 8096) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-14B-Instruct, un transformer decoder-only con atencion causal estandar. El ajuste fino fue completo (no LoRA), con todos los parametros entrenables (14.770.033.664, 100.00%), usando FSDP sobre 8 GPUs AMD Instinct MI325X. La precision fue bf16 con gradient checkpointing y calculo de perdida unicamente sobre los tokens del asistente. El batch efectivo fue de 1024 (128 por dispositivo, 1 acumulacion, 8 GPUs), learning rate de 2e-05 constante con warmup del 5%, weight decay de 0.01 y max grad norm de 1.0. La longitud maxima de secuencia durante el entrenamiento fue de 8096 tokens. El entrenamiento completo de 3 epocas tardo 2.67 horas de reloj (21.4 GPU-horas).

El dataset de entrenamiento son pares sinteticos de QA de BrowseComp-Plus, agrupados con HDBSCAN (min cluster size 2) en el fichero `bcp_subset300_numsamplingepochs1_hdbscan_mcs2_crossdoc_entity_combination_v3.json`, con 754.069 ejemplos. La innovacion principal es el uso de clustering HDBSCAN para organizar los pares QA en grupos tematicos y generar combinaciones de entidades cross-document, lo que busca que el modelo aprenda a relacionar informacion dispersa entre documentos. No se menciona uso de RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de texto conversacional: hereda las capacidades del modelo base Qwen2.5-14B-Instruct y usa la plantilla de chat de Qwen.
- Memoria y recuperacion cross-document: entrenado especificamente como memory model sobre pares QA agrupados por similitud, orientado a relacionar entidades y hechos entre documentos.
- Razonamiento multi-paso: el modelo base soporta razonamiento; el ajuste refuerza la recuperacion de informacion en contextos de multiples documentos.
- Soporte de tool calling: heredado del modelo base Qwen2.5-14B-Instruct (no verificado especificamente tras el ajuste).
- Capacidades multilingues: no disponibles en la informacion proporcionada; el modelo base Qwen2.5 soporta multiples idiomas, pero no se documenta el impacto del ajuste.
- Modo thinking: no disponible.

## Casos de uso

- Recuperacion de informacion cross-document: el modelo puede responder preguntas que requieren combinar entidades y hechos presentes en varios documentos, aprovechando el entrenamiento sobre combinaciones cross-document generadas con HDBSCAN.
- Construccion de sistemas de memoria para agentes: puede actuar como modulo de memoria que sintetiza y recupera informacion de interacciones previas o de un corpus documental, integrado en pipelines de agentes.
- QA sobre corpus tecnicos o de investigacion: adecuado para preguntas que exigen relacionar conceptos dispersos en articulos, informes o documentacion, gracias al enfoque en memoria y clustering tematico.
- Asistentes conversacionales con contexto documental: con la plantilla de chat de Qwen y secuencias de hasta 8096 tokens, puede gestionar conversaciones multi-turno con documentos adjuntos.
- Investigacion en tecnicas de memoria en LLMs: sirve como checkpoint de referencia para estudiar el efecto del clustering HDBSCAN y las combinaciones de entidades en el aprendizaje de memoria.
- Generacion de resumenes que integran multiples fuentes: puede condensar informacion de varios documentos relacionados, agrupados por similitud tematica, en una respuesta coherente.
- Evaluacion de estrategias de datos sinteticos: util para comparar el rendimiento de modelos entrenados con datasets sinteticos organizados por clustering frente a datasets aleatorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29.5 GB solo para pesos (14.77B parametros x 2 bytes), mas overhead de activaciones y cache KV; se recomienda al menos 40-48 GB para contextos moderados.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 15-16 GB para pesos; en 4 bits: aproximadamente 8-9 GB para pesos.
- GPU recomendadas: A100 40GB/80GB, H100 80GB, AMD MI325X (usadas en entrenamiento). Para cuantizacion 4 bits podria caber en RTX 4090 (24 GB) con contexto limitado.
- Cabe en consumer GPU: si, en RTX 4090/3090 (24 GB) solo con cuantizacion 4 bits y contextos reducidos; en bf16 no cabe en GPUs consumer de 24 GB.
- Opciones de despliegue: transformers (AutoModelForCausalLM), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama previa conversion a GGUF (no se proporcionan ficheros GGUF en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-bcp-hdbscan-ep3 | 14.77B | no disponible (entrenado a 8096) | Apache 2.0 | Hugging Face | Ajuste como memory model sobre BrowseComp-Plus |
| Qwen/Qwen2.5-14B-Instruct | 14.77B | 32.768 tokens (segun documentacion del modelo base) | Apache 2.0 | Hugging Face | Modelo base, instrucciones generales |
| Qwen/Qwen2.5-7B-Instruct | 7.6B | 32.768 tokens (segun documentacion del modelo base) | Apache 2.0 | Hugging Face | Alternativa de menor tamano, menor VRAM |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen2.5-14B-Instruct, puede heredar sesgos del modelo base y del dataset sintetico de BrowseComp-Plus.
- Riesgo de alucinacion: presente como en cualquier LLM; el entrenamiento como memory model sobre datos sinteticos puede aumentar el riesgo de confundir entidades entre documentos si el clustering agrupa elementos incorrectamente.
- Limitaciones de contexto o idioma: no se documenta la longitud de contexto efectiva tras el ajuste; el entrenamiento uso secuencias de 8096 tokens, inferior al contexto nativo del modelo base (32.768 tokens), lo que puede degradar el rendimiento en contextos mas largos. No hay informacion sobre idiomas soportados tras el ajuste.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del dataset BrowseComp-Plus y de los datos sinteticos generados.
- Caveats para produccion: el modelo tiene 0 descargas y 0 likes, sin validacion externa; no hay benchmarks publicados; el checkpoint es la epoca 3 de 3 sin informacion sobre sobreajuste; el repositorio es de 29.6 GB y requiere hardware con suficiente VRAM para bf16.

## Enlaces

- Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-bcp-hdbscan-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
