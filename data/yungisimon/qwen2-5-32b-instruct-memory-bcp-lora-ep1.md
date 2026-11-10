# yungisimon/Qwen2.5-32B-Instruct-memory-bcp-lora-ep1

## Resumen

yungisimon/Qwen2.5-32B-Instruct-memory-bcp-lora-ep1 es un ajuste fino del modelo Qwen2.5-32B-Instruct de Alibaba, publicado por el usuario yungisimon en Hugging Face. El modelo se ha entrenado como "modelo de memoria" (memory model) sobre pares sinteticos de pregunta-respuesta generados a partir de BrowseComp-Plus, un conjunto de datos orientado a evaluar la capacidad de un modelo para recuperar y combinar informacion dispersa en multiples documentos. El checkpoint publicado corresponde a la primera de tres epocas de entrenamiento.

Tecnicamente se trata de un transformer decoder-only denso de 32.763.876.352 parametros, con los pesos base de Qwen2.5-32B-Instruct fusionados con un adaptador LoRA de rango 32 entrenado sobre las proyecciones de atencion y MLP. El resultado es un modelo de pesos completos en bf16 safetensors que se carga con `transformers` estandar y utiliza la plantilla de chat de Qwen. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia es acotada: no es un modelo de proposito general nuevo ni un lanzamiento oficial, sino un experimento de investigacion sobre memoria y recuperacion cross-document. Resulta de interes para quienes trabajan en tecnicas de memoria externa, recuperacion multi-documento o ajuste fino con LoRA sobre modelos grandes, pero no cuenta con benchmarks publicados ni con adopcion en la comunidad (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2), con adaptador LoRA fusionado |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8.096 tokens en entrenamiento; el modelo base Qwen2.5-32B-Instruct soporta hasta 131.072 tokens, aunque no se confirma en esta ficha el contexto efectivo tras el ajuste |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors bf16 es cuantificable con herramientas estandar (GPTQ, AWQ, GGUF) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base Qwen2.5 es multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16); incluye el adaptador sin fusionar en `lora_adapter/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer decoder-only denso con atencion causal estandar, RoPE y las innovaciones propias de la familia Qwen2 (RMSNorm, SwiGLU en el MLP, atencion con QKV bias). Sobre esa base se aplico un ajuste fino con LoRA de rango 32, alpha 64 y dropout 0.05, cubriendo las proyecciones q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. Los parametros entrenables ascienden a 268.435.456, un 0,81 % del total. Tras el entrenamiento, el adaptador se fusiono en los pesos base y se publico tambien por separado en `lora_adapter/`.

El entrenamiento se realizo sobre pares sinteticos de QA derivados de BrowseComp-Plus (fichero `bcp_subset300_numsamplingepochs1_crossdoc_entity_combination_v3.json`), con 2.968.214 ejemplos. Se uso batch efectivo de 1024 (128 por dispositivo, 1 paso de acumulacion, 8 GPUs), learning rate 0.0002 con warmup del 5 % y decaimiento constante, weight decay 0.01, max grad norm 1.0, longitud maxima de secuencia 8.096, precision bf16, gradient checkpointing y calculo de la perdida solo sobre los tokens del asistente. El entrenamiento se ejecuto en 8 AMD Instinct MI325X durante 19,20 horas en total para las tres epocas (153,6 GPU-horas); el checkpoint publicado corresponde a la epoca 1.

## Capacidades

- Generacion de texto conversacional con la plantilla de chat de Qwen.
- Recuperacion y combinacion de informacion dispersa en multiples documentos (cross-document), objetivo declarado del ajuste.
- Razonamiento multi-paso orientado a memoria: el modelo ha sido entrenado para responder preguntas que requieren integrar entidades y hechos de varias fuentes.
- Soporte de tool calling y function calling heredado del modelo base Qwen2.5-32B-Instruct (no validado especificamente tras el ajuste).
- Capacidades multilingues heredadas del modelo base (no declaradas explicitamente en la model card).
- Capacidad de codigo y matematicas heredada del modelo base, aunque el ajuste se centra en memoria y puede degradar ligeramente otras habilidades.
- No se declaran capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Investigacion sobre memoria en LLMs: el modelo sirve como punto de comparacion para estudiar como el ajuste fino con LoRA sobre tareas de recuperacion cross-document afecta al comportamiento del modelo base. Es adecuado porque su entrenamiento esta disenado especificamente para ese tipo de tarea.
- Responder preguntas que requieren sintetizar informacion de varios documentos: se puede alimentar el modelo con fragmentos de distintos documentos en el contexto (hasta 8.096 tokens en entrenamiento) y pedirle una respuesta integrada, aprovechando su entrenamiento en combinacion de entidades.
- Evaluacion de pipelines RAG: util para probar si un modelo ajustado en memoria mejora frente al base en tareas de recuperacion aumentada, midiendo la calidad de la sintesis multi-fuente.
- Generacion de resumenes cross-document: el modelo puede resumir y contrastar informacion de varias fuentes en una sola respuesta, gracias al entrenamiento sobre pares de QA que combinan entidades de distintos documentos.
- Prototipado de asistentes de analisis documental: en entornos de investigacion se puede desplegar con vLLM o TGI para experimentar con flujos de analisis de corpus, aunque con cautela por la falta de benchmarks.
- Fine-tuning posterior o ablaciones: al incluir el adaptador LoRA sin fusionar, es util para estudiar el efecto de distintas epocas o hiperparametros en tareas de memoria, comparando la epoca 1 publicada con las siguientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 65,5 GB solo para pesos (32,76 mil millones de parametros a 2 bytes), mas KV cache y overhead, por lo que se necesitan al menos 80 GB de VRAM en una sola GPU o varias GPUs.
- Cuantizacion a 8 bits: alrededor de 33 GB de pesos, viable en una A100 80 GB o H100 80 GB con margen para contexto.
- Cuantizacion a 4 bits (GPTQ/AWQ/GGUF Q4): alrededor de 17-20 GB, lo que permite ejecucion en una RTX 4090 de 24 GB con contexto limitado.
- GPU recomendadas: A100 80 GB, H100 80 GB, MI300X/MI325X para bf16; RTX 4090 o RTX 6000 Ada para cuantizacion 4 bits.
- Opciones de despliegue: `transformers` (carga directa en bf16), vLLM, TGI (el repo incluye tag `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama mediante conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-32B-Instruct-memory-bcp-lora-ep1 | 32,76 B | 8.096 en entrenamiento (base hasta 131.072) | Denso + LoRA fusionado | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-32B-Instruct | 32,5 B aprox. | 131.072 | Denso | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Qwen/Qwen2.5-32B | 32,5 B aprox. | 131.072 | Denso | Apache 2.0 | Hugging Face |
| Mistral Small 3 (24B) | 24 B | 32.768 | Denso | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo para el modelo ajustado, por lo que la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- No se han publicado benchmarks: no hay evidencia cuantitativa de que el ajuste mejore al modelo base en tareas de memoria o recuperacion.
- El checkpoint corresponde solo a la epoca 1 de 3; el autor no publica las epocas 2 y 3, por lo que el modelo puede no estar en su punto optimo de entrenamiento.
- El ajuste sobre datos sinteticos de BrowseComp-Plus puede introducir sesgos hacia el formato y dominio de ese corpus, con posible degradacion en tareas generales.
- Riesgo de alucinacion: como todo LLM, puede inventar hechos al combinar informacion de multiples documentos, especialmente si el contexto es ambiguo.
- Contexto de entrenamiento limitado a 8.096 tokens: aunque el modelo base soporta contextos mucho mayores, no se garantiza el rendimiento mas alla de esa longitud tras el ajuste.
- Idiomas no declarados: no se confirma el comportamiento multilingue tras el ajuste, aunque el base lo sea.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5 conviene revisar los terminos del modelo base y las obligaciones de atribucion.
- Modelo con 0 descargas y 0 likes: sin validacion de la comunidad, no recomendado para produccion sin evaluacion propia.
- El tag `memory-model` sugiere un uso experimental; no hay documentacion sobre el formato exacto de las entradas de memoria esperadas.

## Enlaces

- Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-32B-Instruct-memory-bcp-lora-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- BrowseComp-Plus (referencia del dataset de entrenamiento, no se proporciona enlace directo en la informacion disponible): no disponible
- Paper o blog del autor: no disponible
