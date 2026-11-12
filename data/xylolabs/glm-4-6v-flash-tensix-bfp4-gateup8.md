# Xylolabs/GLM-4.6V-Flash-Tensix-BFP4-GateUp8

## Resumen

GLM-4.6V-Flash-Tensix-BFP4-GateUp8 es una cuantizacion del modelo multimodal zai-org/GLM-4.6V-Flash (familia GLM-4.6V de Zhipu AI / Z.ai), preparada por Xylolabs para su ejecucion en aceleradores Tenstorrent Tensix (Wormhole y Blackhole) mediante la pila tt-metal/ttnn. No es un modelo nuevo: es el mismo checkpoint base con las capas lineales del modelo de lenguaje reempaquetadas en formatos de bloque flotante BFP4 y BFP8, mientras la torre de vision permanece intacta en bf16.

El modelo resuelve el problema de desplegar un VLM conversacional de ~10.300 millones de parametros en hardware no-GPU con memoria limitada: reduce el peso empaquetado de 18,80 GB (bf16) a 9,32 GB, con 7,93 bits por peso de media, manteniendo el 92,55 % de top-1 frente al original segun la evaluacion del autor. La cuantizacion de atencion y MLP down usa GPTQ con busqueda de exponente por bloque; gate y up usan redondeo al mas cercano en BFP8.

Es relevante porque ejemplifica un flujo de cuantizacion orientado a un backend concreto (Tensix) y porque publica una comparacion directa contra Q4_K_M de llama.cpp en la misma metrica de divergencia KL, lo que permite situar la perdida de calidad frente a una cuantizacion estandar de 4 bits. La licencia MIT y el pipeline image-text-to-text lo hacen directamente evaluable en transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (GLM-4V: torre de vision + modelo de lenguaje); capas lineales del LM cuantizadas en bloque flotante |
| Parametros totales | 10.292.777.472 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (bfloat4_b, 4,5 bits/peso) en q, k, v, o y MLP down; BFP8 (bfloat8_b, 8,5 bits/peso) en MLP gate y up; bf16 en LM head, embeddings, normas, resto de tensores y torre de vision |
| Idiomas soportados | zh, en |
| Licencia | MIT |
| Formato de pesos | safetensors (valores almacenados en bf16; 240 matrices cuantizadas empaquetadas, 9,32 GB empaquetados) |

## Arquitectura y entrenamiento

El checkpoint base GLM-4.6V-Flash es un modelo image-text-to-text con una torre de vision y un modelo de lenguaje de 40 capas; este repositorio solo modifica las proyecciones lineales del LM. En concreto, las matrices de atencion q, k, v y o y la proyeccion MLP down de las 40 capas se cuantizan a `ttnn.bfloat4_b` con GPTQ y busqueda de exponente por bloque (offsets -1 y 0, damping 0,1); las proyecciones MLP gate y up se cuantizan a `ttnn.bfloat8_b` con redondeo al mas cercano. El resultado son 240 matrices cuantizadas que suman 7,93 bits por peso de media y 9,32 GB empaquetados. El fichero `quant4.json` documenta el formato de cada proyeccion.

Los ficheros almacenan los valores en bf16 y el empaquetado se realiza en el momento de cargar en TT-NN, que lee los pesos con orden [in, out]. Las 80 matrices `self_attn.q_proj` y `self_attn.k_proj` conservan el orden de filas original de Hugging Face y solo caen en la rejilla BFP4 tras una permutacion de cada cabeza de 128 filas (slots 0-31 toman las filas 0, 2, ..., 62; slots 32-63 toman 64-95; slots 64-95 toman 1, 3, ..., 63; slots 96-127 toman 96-127); es una disposicion de empaquetado, no un cambio de valores. No se documenta el entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`).
- Comprension de imagen y texto combinados (pipeline image-text-to-text), con la torre de vision en bf16 sin cuantizar.
- Respuesta a preguntas y razonamiento de uso general en chino e ingles.
- Integracion con el ecosistema transformers mediante `AutoModelForImageTextToText` y `AutoTokenizer`.
- Despliegue en aceleradores Tenstorrent Tensix mediante tt-metal/ttnn con dtypes nativos `bfloat4_b` y `bfloat8_b`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un VLM de ~10.300 millones de parametros en aceleradores Tenstorrent Wormhole o Blackhole: el empaquetado BFP4/BFP8 reduce el peso del LM a 9,32 GB, lo que permite residir el modelo en DRAM del dispositivo sin recurrir a bf16 completo (18,80 GB).
- Asistente visual conversacional en ingles o chino: el modelo acepta mensajes con imagen y texto mediante la plantilla de chat y genera respuestas multi-turno, adecuado para interfaces de consulta sobre documentos o capturas.
- Descripcion y analisis de imagenes en pipelines de preprocesado: al mantener la torre de vision en bf16, la calidad de representacion visual no se degrada por la cuantizacion aplicada al LM.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio publica KL media y top-1 frente a bf16 y frente a Q4_K_M, por lo que sirve como referencia reproducible para estudiar el impacto de BFP4 con GPTQ en un VLM.
- Prototipado en simulador antes de disponer de hardware: el autor valida el empaquetado con ttsim (simulador de Blackhole) y con las herramientas `pack_tensix.py` y `verify_grid.py`, lo que permite integrar el checkpoint en un pipeline de desarrollo sin silicio.
- Investigacion sobre formatos de bloque flotante: los scripts de verificacion comprueban bit a bit que el empaquetado TT-NN no altera valores, util para validar implementaciones de BFP4/BFP8 en otras pilas.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. KL y top-1 se calculan sobre 16.248 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con plantilla de chat.

| Modelo | Bits/peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (zai-org/GLM-4.6V-Flash) | 16 | 18,80 | 0 | 100 | 32 de 40 | - |
| Este modelo (BFP4 GateUp8) | 7,93 | 9,317 | 0,023789 | 92,55 | 33 de 40 | 0 |
| Q4_K_M (llama.cpp) | 5,24 | 6,157 | 0,024092 | 92,07 | 34 de 40 | 0 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 9,32 GB de pesos empaquetados del LM; en bf16 el modelo base ocupa 18,80 GB. La torre de vision y los tensores no cuantizados se mantienen en bf16.
- Hardware objetivo: aceleradores Tenstorrent Tensix, familias Wormhole y Blackhole, a traves de tt-metal/ttnn.
- Validacion realizada con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole; el autor indica explicitamente que no se ha probado en hardware real.
- tt-transformers y tt-forge no se han ejecutado con este checkpoint.
- Carga en transformers: `AutoModelForImageTextToText.from_pretrained(..., dtype="bfloat16", device_map="auto")`, lo que requiere memoria suficiente para los tensores en bf16 antes del empaquetado en TT-NN.
- GPU consumer: no disponible; no se documenta comportamiento en RTX 4090 u otras GPU, ni cifras de latencia o throughput.
- Opciones de despliegue documentadas: transformers para carga e inspeccion, tt-metal/ttnn para ejecucion en Tensix, y las herramientas `pack_tensix.py` y `verify_grid.py` del repositorio de codigo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (BFP4 GateUp8) | 10.292.777.472 | no disponible | BFP4 + BFP8 (GPTQ / RTN) | 9,317 GB | MIT | Hugging Face, orientado a Tensix |
| zai-org/GLM-4.6V-Flash (bf16) | 10.292.777.472 | no disponible | bf16 | 18,80 GB | no disponible en la informacion | Hugging Face |
| GLM-4.6V-Flash Q4_K_M (llama.cpp) | 10.292.777.472 | no disponible | Q4_K_M, 5,24 bits/peso | 6,157 GB | no disponible en la informacion | Formato GGUF para llama.cpp |

La comparativa se limita al mismo modelo base en distintas precisiones, porque la informacion disponible no incluye otros VLM de tamano comparable con datos verificables.

## Limitaciones y advertencias

- Solo se ha cuantizado y evaluado el modelo de lenguaje; la torre de vision permanece en bf16 y no se ha medido su comportamiento bajo esta distribucion de pesos.
- No hay validacion en hardware Tensix real: las pruebas se hicieron con ttsim (simulador de Blackhole) y con comprobaciones de rejilla en torch.
- Las 80 matrices q_proj y k_proj no caen en la rejilla BFP4 tal como se almacenan; requieren la permutacion de filas documentada. Las herramientas del autor las reportan como fuera de rejilla en el estado del repositorio.
- La implementacion debe colocar los pares rotatorios de forma consistente con el layout permutado; un error aqui degrada la atencion sin aviso evidente.
- La evaluacion de calidad se limita a 16.248 posiciones de ingles y coreano; no hay datos de benchmarks estandar ni de otros idiomas, pese a que el modelo declara solo zh y en.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible para este checkpoint ni para el base.
- Licencia MIT, que permite uso comercial; conviene verificar igualmente las condiciones del modelo base zai-org/GLM-4.6V-Flash, no detalladas aqui.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso en produccion.
- El checkpoint no se ha probado con tt-transformers ni tt-forge, por lo que la integracion con esas pilas esta sin verificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/GLM-4.6V-Flash-Tensix-BFP4-GateUp8
- Modelo base: https://huggingface.co/zai-org/GLM-4.6V-Flash
- Revision del modelo base citada: https://huggingface.co/zai-org/GLM-4.6V-Flash/tree/411bb4d77144a3f03accbf4b780f5acb8b7cde4e
- Codigo de cuantizacion (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2507.01006): https://arxiv.org/abs/2507.01006
- Licencia: https://huggingface.co/Xylolabs/GLM-4.6V-Flash-Tensix-BFP4-GateUp8/blob/main/LICENSE
