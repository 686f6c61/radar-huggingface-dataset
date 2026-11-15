# yungisimon/Qwen2.5-1.5B-giri-msq-hdb_and_entity-ep2

## Resumen

`yungisimon/Qwen2.5-1.5B-giri-msq-hdb_and_entity-ep2` es un ajuste fino completo del modelo instructivo `Qwen/Qwen2.5-1.5B-Instruct` de Alibaba, publicado por el usuario yungisimon. No se trata de un modelo generalista nuevo, sino de un *memory model*: un modelo entrenado para almacenar y recuperar información a partir de pares sintéticos de pregunta-respuesta generados sobre el corpus MuSiQue, un conjunto de preguntas multi-salto construido a partir de documentos de Wikipedia. El objetivo declarado es que el modelo actúe como memoria parametrica de un sistema mayor, no como asistente conversacional general.

El checkpoint corresponde a la epoca 2 de un entrenamiento de 3 epocas, realizado con ajuste fino completo (no LoRA) sobre 2.177.125 ejemplos sintéticos. La receta de agrupamiento que da nombre al modelo, `hdb_and_entity`, combina HDBSCAN con un tamano minimo de cluster de 2 y agrupamiento por entidades con frecuencia documental maxima de 3. El modelo conserva la licencia Apache 2.0 del modelo base y los pesos en bf16 safetensors.

Por su tamano (1.543.714.304 parametros, unos 1,54 mil millones) y su naturaleza de checkpoint intermedio de un experimento de investigacion, es relevante para quienes trabajan en memorizacion parametrica, destilacion de conocimiento en modelos pequenos y evaluacion de estrategias de clustering para la construccion de datasets sinteticos, no tanto para despliegues de produccion convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.096 tokens de longitud maxima de secuencia en entrenamiento; la ventana nativa del Qwen2.5-1.5B-Instruct es de 32.768 tokens (no confirmada en esta ficha) |
| Tipos de cuantizacion | no se documentan en la model card; al ser safetensors bf16 es convertible a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | no disponible (la model card no los declara; hereda los del modelo base, sin verificar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2, con 1.543.714.304 parametros, inicializado desde `Qwen/Qwen2.5-1.5B-Instruct` y sometido a ajuste fino completo con FSDP. No hay cambios arquitectonicos respecto al modelo base: se reutiliza su tokenizador y su plantilla de chat (chat template de Qwen), y la inferencia se realiza con `AutoModelForCausalLM.from_pretrained` estandar de `transformers`.

El entrenamiento usa 2.177.125 ejemplos sinteticos de QA derivados de MuSiQue, generados con el esquema de agrupamiento `hdb_and_entity` (HDBSCAN con `min_cluster_size=2` combinado con agrupamiento por entidades y `max_df=3`). La configuracion concreta es: batch efectivo de 256 (32 por dispositivo, 1 paso de acumulacion, 8 GPUs), learning rate 2e-05 constante con warmup del 5 %, 3 epocas (este checkpoint es la epoca 2), weight decay 0,01, max grad norm 1,0, longitud maxima de secuencia 8.096, precision bf16 con gradient checkpointing y calculo de perdida solo sobre los tokens del asistente. El entrenamiento completo de las 3 epocas consumio 2,23 horas de reloj (17,9 GPU-horas) sobre 8 AMD Instinct MI325X. No se documenta uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva con la plantilla de chat de Qwen, orientada a responder preguntas sobre el contenido memorizado durante el ajuste fino.
- Recuperacion de hechos y relaciones a partir de pares QA multi-salto sinteticos del corpus MuSiQue (funcion de *memory model*).
- Razonamiento multi-salto basico heredado del modelo base y reforzado por el formato de los datos de entrenamiento.
- Soporte de conversacion multi-turno mediante el chat template de Qwen (no validado especificamente en este checkpoint).
- Capacidades del modelo base Qwen2.5-1.5B-Instruct (codigo, matematicas, tool calling) potencialmente presentes pero no garantizadas tras el ajuste fino; no hay evaluacion publicada que lo confirme.
- Capacidades multilingues: no disponibles como dato verificado.
- No se documentan modos de *thinking*, vision ni audio.

## Casos de uso

- Investigacion en memorizacion parametrica: usar el modelo como banco de pruebas para medir cuanto conocimiento factual de MuSiQue queda codificado en 1,54 B de parametros y como decae con la cuantizacion.
- Evaluacion de estrategias de clustering para datasets sinteticos: comparar este checkpoint (HDBSCAN + entidades) con variantes entrenadas con otros esquemas de agrupamiento sobre el mismo corpus para aislar el efecto de la receta de datos.
- Recuperacion aumentada con memoria parametrica: integrar el modelo como capa de memoria en un pipeline RAG hibrido, donde el modelo responde consultas frecuentes sin recuperacion documental y delega el resto al retriever.
- Destilacion hacia modelos mas pequenos: emplear las respuestas del modelo sobre MuSiQue como profesor para generar datos de entrenamiento de modelos de menor tamano.
- Analisis de olvido catastrofico: comparar el rendimiento en tareas generales (heredadas de Qwen2.5-1.5B-Instruct) antes y despues del ajuste fino para cuantificar la degradacion provocada por el entrenamiento de memorizacion.
- Despliegue en entornos con recursos limitados: con 1,54 B de parametros y pesos bf16 (unos 3,1 GB en el repositorio), el modelo cabe en GPUs de consumo con 8 GB o mas en cuantizacion de 8 bits, lo que permite experimentar con la memoria parametrica en hardware asequible.
- Reproducibilidad de experimentos: al documentarse la receta completa (FSDP, batch, LR, hardware), sirve como referencia para replicar el pipeline de ajuste fino en otros corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,6-2 GB de pesos; en 4 bits, alrededor de 0,8-1 GB.
- GPU recomendadas para produccion: A100, H100 o L40S si se sirve con vLLM o TGI; para experimentacion basta una RTX 4090, RTX 3090 o incluso una RTX 4060 Ti de 16 GB.
- Cabe en GPU de consumo: si, en cualquier GPU con 8 GB o mas en bf16 y en GPUs de 4-6 GB con cuantizacion de 4 u 8 bits.
- Opciones de despliegue: `transformers` (via `AutoModelForCausalLM`), vLLM, TGI (el modelo esta etiquetado como `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama previa conversion a GGUF.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-msq-hdb_and_entity-ep2 | 1,54 B | 8.096 en entrenamiento | Memoria parametrica sobre MuSiQue (epoca 2/3) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (nativo) | Asistente generalista con instrucciones | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 tokens (nativo) | Asistente generalista ligero | Apache 2.0 | Hugging Face |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens | Asistente generalista ligero | Llama 3.2 Community License | Hugging Face |

La comparacion directa con alternativas es limitada: no existen resultados de benchmarks publicados para este checkpoint y su proposito (memoria parametrica) no es directamente comparable con asistentes generalistas. Frente a su modelo base, la diferencia principal es el ajuste fino completo sobre datos sinteticos de MuSiQue, a costa de un posible deterioro de las capacidades generales no evaluado publicamente.

## Limitaciones y advertencias

- Es un checkpoint intermedio (epoca 2 de 3), no la version final del entrenamiento; su comportamiento puede diferir del modelo completamente entrenado.
- No hay evaluacion publicada de ningun tipo: ni benchmarks de memoria, ni de retencion, ni de degradacion en tareas generales.
- Riesgo elevado de alucinacion fuera del dominio MuSiQue, ya que el ajuste fino puede haber desplazado la distribucion de respuestas hacia el formato de QA sintetico.
- Posible olvido catastrofico de las capacidades del modelo base (codigo, matematicas, tool calling) tras el ajuste fino completo; no verificado.
- Idiomas soportados no declarados; el entrenamiento se realizo sobre un corpus en ingles (MuSiQue), por lo que el rendimiento en castellano es incierto.
- Ventana de contexto de entrenamiento de 8.096 tokens, inferior a la nativa de 32.768 del modelo base; no se garantiza el comportamiento mas alla de esa longitud.
- Sin descargas ni likes en Hugging Face y creado en noviembre de 2026: no hay evidencia de uso en produccion ni validacion por terceros.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion hace desaconsejable su despliegue en produccion sin una validacion propia exhaustiva.
- La model card no documenta sesgos, filtros de seguridad ni comportamientos de rechazo; el modelo puede reproducir sesgos presentes en MuSiQue y en el corpus de Qwen2.5.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-msq-hdb_and_entity-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Corpus MuSiQue (referencia del dataset de entrenamiento): no se proporciona enlace en la informacion disponible
- Paper o blog del autor: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
