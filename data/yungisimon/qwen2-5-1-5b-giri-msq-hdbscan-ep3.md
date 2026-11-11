# yungisimon/Qwen2.5-1.5B-giri-msq-hdbscan-ep3

## Resumen
yungisimon/Qwen2.5-1.5B-giri-msq-hdbscan-ep3 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario yungisimon y publicado en Hugging Face. El modelo se ha entrenado como "memory model", es decir, un modelo orientado a tareas de memoria y recuperacion de informacion sobre pares de pregunta-respuesta sinteticos derivados del conjunto MuSiQue, agrupados mediante el algoritmo de clustering HDBSCAN con un tamano minimo de cluster de 2.

El checkpoint corresponde a la epoca 3 de 3 de un entrenamiento supervisado con perdida calculada unicamente sobre los tokens del asistente. Se trata de un modelo pequeno (1.543.714.304 parametros, aproximadamente 1,5 mil millones) con arquitectura transformer densa tipo Qwen2, pesos en bf16 safetensors y licencia Apache 2.0. Su relevancia es acotada: es un experimento de investigacion sobre memoria en modelos de lenguaje, no un modelo de proposito general con benchmarks publicados.

No se dispone de informacion sobre idiomas soportados, resultados de evaluacion ni detalles adicionales del dataset mas alla de los proporcionados en la model card. El modelo se publico el 11 de noviembre de 2026 y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Qwen2 (derivado de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8096 tokens (longitud maxima de secuencia usada en entrenamiento); contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento
El modelo parte de Qwen2.5-1.5B-Instruct, un transformer denso con atencion causal estandar de la familia Qwen2. El ajuste fino es completo (100 % de los parametros entrenables, 1.543.714.304), realizado con FSDP sobre 8 GPU AMD Instinct MI325X, con batch efectivo de 256 (32 por dispositivo, 1 paso de acumulacion, 8 GPU), tasa de aprendizaje constante de 2e-05 con warmup del 5 %, weight decay de 0.01, max grad norm de 1.0 y 3 epocas. El entrenamiento uso precision bf16 y gradient checkpointing, con calculo de perdida solo sobre los tokens del asistente. El tiempo total de pared fue de 1,10 horas (8,8 GPU-horas).

Los datos de entrenamiento consisten en 1.085.701 ejemplos sinteticos de pregunta-respuesta generados a partir de MuSiQue y agrupados con HDBSCAN (tamano minimo de cluster 2), segun el fichero `msq_subset1000_numsamplingepochs1_hdbscan_mcs2_crossdoc_entity_combination_v3.json`. No se especifica la composicion exacta del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO adicionales; la model card solo describe el ajuste supervisado. No se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades
- Generacion de texto conversacional con la plantilla de chat de Qwen.
- Entrenado especificamente como modelo de memoria para tareas de recuperacion y asociacion de informacion sobre pares QA sinteticos.
- Razonamiento multi-paso sobre contextos derivados de documentos (MuSiQue es un benchmark multihop).
- Soporte de tool calling y function calling: no documentado en la informacion proporcionada; heredado potencialmente del modelo base, sin confirmar.
- Capacidades de agente: no documentadas.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso
- Investigacion sobre memoria en modelos de lenguaje: el modelo sirve como punto de partida para estudiar como un ajuste fino con clustering HDBSCAN afecta a la capacidad de recuperar y asociar informacion entre documentos en tareas multihop.
- Experimentos de recuperacion aumentada (RAG) con contextos de hasta 8096 tokens: puede evaluarse como componente de memoria en pipelines que requieran sintetizar respuestas a partir de multiples pasajes.
- Prototipado de asistentes conversacionales ligeros: con 1,5 mil millones de parametros y licencia Apache 2.0, es adecuado para desplegar en entornos con recursos limitados y para pruebas de concepto.
- Generacion de pares pregunta-respuesta sinteticos: el ajuste sobre MuSiQue lo hace util para experimentar con la generacion de QA multihop en entornos controlados.
- Evaluacion comparativa de estrategias de clustering en datos de entrenamiento: permite analizar el efecto de HDBSCAN (mcs=2) en la calidad de las respuestas frente a otras agrupaciones.
- Fine-tuning posterior y destilacion: al ser un modelo pequeno con licencia permisiva, puede servir como base para ajustes adicionales en dominios especificos o para experimentos de destilacion desde modelos mayores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo para pesos (1.543.714.304 parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6 GB para pesos; en 4 bits, alrededor de 0,8 GB (cuantizaciones no publicadas oficialmente, pero realizables con herramientas estandar).
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) para bf16; A100, H100 o MI325X para despliegues de mayor throughput.
- Cabe en GPU consumer: si, en modelos como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, entre otras.
- Opciones de despliegue: transformers (AutoModelForCausalLM.from_pretrained), text-generation-inference (el modelo incluye el tag endpoints_compatible), vLLM, llama.cpp y Ollama previa conversion a GGUF (no se proporcionan ficheros GGUF en el repositorio).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-msq-hdbscan-ep3 | 1,54 B | 8096 (entrenamiento) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base) | 1,54 B | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, ampliamente utilizado |
| Qwen/Qwen2.5-1.5B | 1,54 B | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face |
| Modelos de ~1,5 B de la familia Llama o Gemma | no disponible | no disponible | licencias especificas de cada familia | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias
- Modelo de investigacion sin benchmarks publicados: no hay evidencia de rendimiento en tareas generales ni en tareas de memoria mas alla del conjunto de entrenamiento.
- Riesgo de sobreajuste al dataset sintetico de MuSiQue y a la agrupacion HDBSCAN concreta; el comportamiento fuera de ese dominio es incierto.
- Riesgo de alucinacion inherente a los modelos de 1,5 mil millones de parametros, especialmente en tareas de recuperacion de informacion factual.
- Idiomas soportados no documentados; se desconoce si conserva las capacidades multilingues del modelo base.
- Contexto de entrenamiento limitado a 8096 tokens; no se documenta el contexto nativo del modelo base ni si se realizo extension de contexto.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no ha sido validado para produccion y carece de garantias del autor.
- Sin descargas ni likes en Hugging Face en el momento de la publicacion: no hay comunidad ni soporte documentado.
- No se proporcionan ficheros GGUF ni cuantizaciones oficiales; cualquier despliegue en llama.cpp u Ollama requiere conversion manual.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-msq-hdbscan-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Qwen2.5: no disponible en la informacion proporcionada
- Paper de MuSiQue: no disponible en la informacion proporcionada
- Documentacion de HDBSCAN: no disponible en la informacion proporcionada
