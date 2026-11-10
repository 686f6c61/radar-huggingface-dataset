# yungisimon/Qwen2.5-32B-Instruct-memory-bcp-lora-ep2

## Resumen

yungisimon/Qwen2.5-32B-Instruct-memory-bcp-lora-ep2 es un ajuste fino del modelo Qwen2.5-32B-Instruct de Alibaba, publicado por el usuario yungisimon en Hugging Face. El modelo se ha especializado como "memory model" mediante un LoRA fusionado con los pesos base, entrenado sobre pares sinteticos de pregunta-respuesta derivados de BrowseComp-Plus (2.968.214 ejemplos). El checkpoint publicado corresponde a la epoca 2 de 3 del entrenamiento.

El modelo hereda la arquitectura transformer densa de Qwen2.5-32B-Instruct, con 32.763.876.352 parametros totales (32,8 mil millones) y licencia Apache 2.0. Su proposito es mejorar el comportamiento del modelo base en tareas que requieren recuperacion y retencion de informacion dentro de contextos largos, un caso de uso habitual en sistemas RAG y agentes con memoria.

Es relevante porque ejemplifica una tendencia creciente: adaptar modelos instructivos generalistas de gran tamano a tareas especificas de memoria y recuperacion documental mediante LoRA de bajo rango, sin necesidad de reentrenar desde cero. El repositorio ocupa 66,6 GB e incluye tanto los pesos fusionados en bf16 como el adaptador LoRA original en `lora_adapter/`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only, con RoPE y GQA (heredada de Qwen2.5-32B-Instruct) |
| Parametros totales | 32.763.876.352 (32,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.096 tokens en entrenamiento; contexto nativo del modelo base Qwen2.5-32B-Instruct: 32.768 tokens (ampliable a 131.072 con YaRN, segun la documentacion del modelo base) |
| Tipos de cuantizacion | bf16 en el repo; compatible con cuantizaciones derivadas del modelo base (GGUF, AWQ, GPTQ) mediante herramientas externas, no publicadas por el autor |
| Idiomas soportados | No disponible en la informacion del autor; el modelo base Qwen2.5 soporta oficialmente 29 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); adaptador LoRA incluido en `lora_adapter/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer decoder-only denso con atención de tipo grouped-query (GQA), activaciones SwiGLU y embeddings rotatorios (RoPE). Sobre esta base se aplico un ajuste fino supervisado con LoRA de rango 32 y alpha 64, dropout 0,05, aplicado a las proyecciones q/k/v/o y gate/up/down. El numero de parametros entrenables fue de 268.435.456 (0,81% del total). El adaptador resultante se fusiono en los pesos base para producir el checkpoint publicado, y el adaptador sin fusionar se conserva en `lora_adapter/`.

El entrenamiento se realizo sobre pares sinteticos de QA derivados de BrowseComp-Plus (fichero `bcp_subset300_numsamplingepochs1_crossdoc_entity_combination_v3.json`, 2.968.214 ejemplos), con batch efectivo de 1024 (128 por dispositivo x 1 acumulacion x 8 GPUs), learning rate 0,0002 constante con warmup del 5%, weight decay 0,01, max grad norm 1,0 y longitud maxima de secuencia de 8.096 tokens. Se uso bf16 con gradient checkpointing y calculo de perdida solo sobre los tokens del asistente. El entrenamiento completo de 3 epocas duro 19,20 horas (153,6 GPU-horas) sobre 8 AMD Instinct MI325X. El checkpoint publicado corresponde a la epoca 2 de 3.

No se documenta en la informacion disponible el uso de RLHF, DPO u otras tecnicas de alineacion adicionales sobre este ajuste, ni innovaciones tecnicas especificas como decodificacion especulativa o atención lineal.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-32B-Instruct.
- Razonamiento y comprension de contexto largo, reforzados por el entrenamiento como modelo de memoria sobre pares QA de documentos cruzados.
- Recuperacion y retencion de informacion dentro de contextos extensos (hasta 8.096 tokens en entrenamiento; el modelo base admite ventanas mayores).
- Capacidades de codigo y matematicas propias del modelo base Qwen2.5-32B-Instruct (no verificadas especificamente en este checkpoint).
- Soporte de tool calling y function calling heredado del modelo base (no documentado explicitamente por el autor para este ajuste).
- Capacidades multilingues del modelo base (29 idiomas segun Qwen); no confirmadas para este checkpoint.
- Plantilla de chat Qwen requerida para inferencia correcta.
- No se documentan capacidades de vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Sistemas RAG con memoria conversacional: el ajuste sobre pares QA de documentos cruzados permite al modelo retener y relacionar informacion de multiples fragmentos recuperados dentro de una misma ventana de contexto, reduciendo perdida de detalles en conversaciones largas.
- Atencion al cliente automatizada: gestion de conversaciones multi-turno donde el agente debe recordar datos previos del usuario (pedidos, incidencias, preferencias) dentro de la ventana de contexto del modelo.
- Agentes de investigacion documental: analisis de conjuntos de documentos relacionados (informes, articulos, expedientes) para responder preguntas que requieren sintesis entre fuentes, aprovechando el entrenamiento sobre combinaciones de entidades y documentos cruzados.
- Asistentes de soporte tecnico interno: resumen y consulta de bases de conocimiento corporativas donde el modelo debe citar y combinar informacion de varias entradas.
- Procesamiento de expedientes y contratos: extraccion y comparacion de clausulas entre documentos, tarea alineada con el entrenamiento sobre QA sintetico de documentos cruzados.
- Evaluacion de pipelines de memoria: el checkpoint (epoca 2 de 3) sirve como referencia intermedia para estudiar el efecto del entrenamiento LoRA en tareas de memoria y recuperacion, comparandolo con el modelo base y con la epoca final.
- Prototipado de asistentes con contexto largo: despliegue en entornos de investigacion con transformers y aceleracion por GPU, dado que los pesos estan en bf16 safetensors y cargan con `AutoModelForCausalLM.from_pretrained`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 65,5 GB solo para pesos (32,8 B x 2 bytes), mas overhead de activaciones y cache KV; en la practica requiere 70-80 GB o mas segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 33 GB de pesos; en 4 bits: aproximadamente 16-17 GB de pesos, mas overhead.
- GPU recomendadas para bf16: NVIDIA H100 (80 GB), A100 80 GB, AMD MI300X/MI325X (192 GB), o configuraciones multi-GPU con 2x A100 40 GB / 2x RTX 4090 24 GB mediante sharding.
- Cabe en GPU de consumo (RTX 4090 24 GB, RTX 3090 24 GB) unicamente con cuantizacion de 4 bits y ventanas de contexto moderadas.
- Opciones de despliegue: transformers (soporte nativo segun el autor), text-generation-inference (tag `text-generation-inference` en el repo), vLLM y llama.cpp/Ollama previa conversion a GGUF (no publicada por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Entrenamiento original: 8x AMD Instinct MI325X, 153,6 GPU-horas para 3 epocas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-32B-Instruct-memory-bcp-lora-ep2 | 32,8 B | 8.096 (entrenamiento); 32.768 nativo del base | Memoria / QA documentos cruzados (LoRA fusionado) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-32B-Instruct | 32,8 B | 32.768 (131.072 con YaRN) | Instructivo generalista | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-32B | 32,8 B | 32.768 (131.072 con YaRN) | Base sin alineacion | Apache 2.0 | Hugging Face |
| Mistral AI Mistral-Large-Instruct (referencia de categoria) | no disponible en la informacion | no disponible | Instructivo generalista de gran tamano | no disponible | no disponible |

La comparativa se limita a la familia Qwen2.5-32B por ser la base directa del modelo; no se dispone de datos de rendimiento comparativo para este checkpoint.

## Limitaciones y advertencias

- El checkpoint corresponde a la epoca 2 de 3; no es el modelo final del entrenamiento y puede presentar comportamiento intermedio no representativo del resultado completo.
- Entrenado sobre datos sinteticos generados a partir de BrowseComp-Plus; puede sobreajustarse al estilo y distribucion de esos pares QA y degradar el comportamiento generalista del modelo base en otras tareas.
- Longitud de contexto de entrenamiento limitada a 8.096 tokens, inferior a la ventana nativa del modelo base (32.768); el rendimiento en contextos mas largos no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de 32 B, potencialmente agravado por el entrenamiento en QA sintetico.
- Sesgos no documentados por el autor; se heredan los del modelo base Qwen2.5-32B-Instruct, no evaluados en este checkpoint.
- Idiomas soportados no confirmados para este ajuste; el entrenamiento se realizo presumiblemente en ingles (dataset BrowseComp-Plus), por lo que el rendimiento en castellano no esta verificado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni evaluaciones de seguridad; el despliegue en produccion requiere evaluacion propia.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria ni reportes de terceros.
- Requiere la plantilla de chat Qwen; su uso con otras plantillas puede degradar la calidad de las respuestas.
- No se publican conversiones GGUF, AWQ ni GPTQ; el despliegue eficiente en hardware limitado exige conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-32B-Instruct-memory-bcp-lora-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Repositorio Qwen2.5 (GitHub): https://github.com/QwenLM/Qwen2.5
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- BrowseComp-Plus (dataset de referencia del entrenamiento): no disponible en la informacion proporcionada
