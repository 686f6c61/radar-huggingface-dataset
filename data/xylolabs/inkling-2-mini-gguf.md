# Xylolabs/Inkling-2-Mini-GGUF

## Resumen

Inkling 2 Mini GGUF es la distribucion cuantizada en formato GGUF del modelo multimodal Inkling 2 Mini, desarrollado originalmente por Thinking Machines. Xylolabs se encarga de la conversion y cuantizacion de los pesos, publicando una familia de ficheros optimizados para llama.cpp que van desde 22,92 GB (NVFP4) hasta 8,49 GB (IQ2_XXS). El modelo base es un transformer de tipo mixture-of-experts (MoE) con 26.070.390.272 parametros totales segun los pesos en safetensors, y pipeline image-text-to-text, lo que indica capacidades de vision ademas de texto.

La relevancia de esta publicacion esta en que permite ejecutar un modelo MoE multimodal de aproximadamente 26.000 millones de parametros en hardware de consumo. La model card incluye una tabla de precision comparando cada cuantizacion contra F32 en WikiText-2 y en un conjunto held-out, con metricas de divergencia KL y acuerdo top-1, ademas de una guia de que fichero usar segun la VRAM disponible. Tambien incorpora un proyector de vision separado (mmproj) en BF16 o Q8_0.

Un detalle tecnico importante es que estos GGUF omiten el drafter MTP (multi-token prediction) del modelo original y requieren llama.cpp release `b12611` o posterior, ya que versiones anteriores ignoran las escalas NVFP4 por experto y producen salidas incorrectas. La licencia es Apache 2.0, sujeta a la politica de uso aceptable de Thinking Machines.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), multimodal image-text-to-text |
| Parametros totales | 26.070.390.272 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1M tokens segun hardware (32K en 24 GB, 64K en 32 GB, 512K en 48 GB, 1M en 80 GB o mas) |
| Tipos de cuantizacion | NVFP4, NVFP4-Lite, NVFP4-XL, IQ4_XS, Q3_K_M, IQ3_XXS, Q2_K, IQ2_XXS; proyectores mmproj BF16 y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (sujeta a la Model Acceptable Use Policy de Thinking Machines) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura mixture-of-experts, segun las etiquetas del repositorio (`moe`) y la referencia al uso de escalas por experto en NVFP4. La model card no detalla el numero de expertos, la proporcion de parametros activos ni la composicion del dataset de entrenamiento. Tampoco se especifica si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias. El pipeline declarado es image-text-to-text, con un proyector de vision separado que en esta distribucion GGUF se entrega como fichero independiente (`mmproj-Inkling-2-Mini-BF16.gguf` de 641,81 MB o `mmproj-Inkling-2-Mini-Q8_0.gguf` de 345,91 MB).

La innovacion tecnica destacable de esta publicacion es la cuantizacion NVFP4 con escalas por experto y una importance matrix propia, aplicada sobre el fichero NVFP4 original. Segun la model card, los cinco ficheros de 15,73 GB a 8,49 GB usan los tipos por tensor de Unsloth a los tamanos de Unsloth. Ademas, se omite el drafter MTP del modelo original, lo que simplifica el despliegue en llama.cpp a costa de perder la decodificacion especulativa nativa. El modelo base incorpora un proyector de vision, por lo que la inferencia multimodal requiere pasar `--mmproj` a `llama-server`.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text), con proyector de vision separado.
- Razonamiento multi-turno en formato chat, con plantilla Jinja (`--jinja` en llama-server).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integracion en servicios de inferencia.
- Capacidades de codigo, matematicas y tool calling: no disponibles en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente multimodal en local: con un fichero NVFP4-XL de 17,61 GB y el proyector BF16, cabe en una RTX 4090 o RTX 3090 de 24 GB y permite conversaciones con imagenes y 32K de contexto, adecuado para prototipos de analisis de capturas, diagramas o documentos escaneados.
- Procesamiento de documentos largos: en una H100 de 80 GB o en una Mac Studio con memoria unificada, el modelo admite hasta 1M de tokens de contexto, lo que permite resumir o consultar expedientes extensos sin trocear el material.
- Despliegue en estaciones de trabajo con memoria unificada: en DGX Spark, Mac Studio M5 Max o equipos con 128 GB o mas, el fichero NVFP4 de 22,92 GB se ejecuta con contexto completo de 1M, util para entornos de investigacion sin GPU de datacenter.
- Servicio de chat con vision en produccion: usando `llama-server` con `--jinja` y el proyector Q8_0 (345,91 MB), se puede exponer una API compatible con endpoints para aplicaciones que necesiten describir imagenes o responder preguntas sobre ellas.
- Evaluacion de cuantizaciones en pipelines de CI: la tabla de precision por fichero (KL y top-1 frente a F32) permite seleccionar el tamano adecuado segun tolerancia a la degradacion, por ejemplo IQ4_XS (15,73 GB) con 97,4 % de top-1 en WikiText-2.
- Prototipado en GPU de consumo con presupuesto de VRAM ajustado: el fichero IQ2_XXS de 8,49 GB permite ejecutar el modelo en tarjetas de 12-16 GB, aceptando una caida de top-1 hasta el 86,2 % en WikiText-2.
- Investigacion sobre cuantizacion NVFP4: la publicacion incluye comparativas contra cuantizaciones Unsloth y contra el baseline Q4_K_M de llama.cpp, lo que sirve para estudiar el impacto de las escalas por experto en modelos MoE.

## Benchmarks y rendimiento

La model card no incluye benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Si incluye una tabla de fidelidad de cuantizacion frente a F32, con divergencia KL y acuerdo top-1 en WikiText-2, en un conjunto de chat y en un conjunto held-out:

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Chat KL | Chat top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| NVFP4 | 22,92 GB | 0,0023 | 98,0 % | 0,0219 | 97,4 % | 0,0021 | 98,1 % |
| Unsloth UD-Q8_K_XL | 22,87 GB | 0,0024 | 97,9 % | 0,0202 | 97,4 % | 0,0022 | 98,3 % |
| Unsloth UD-Q4_K_XL | 17,63 GB | 0,0029 | 97,6 % | 0,0221 | 97,2 % | 0,0027 | 97,8 % |
| NVFP4-Lite | 17,63 GB | 0,0030 | 97,6 % | 0,0194 | 97,3 % | 0,0027 | 97,9 % |
| NVFP4-XL | 17,61 GB | 0,0026 | 97,8 % | 0,0214 | 97,2 % | 0,0024 | 97,9 % |
| llama.cpp baseline Q4_K_M | 17,48 GB | 0,0167 | 94,4 % | 0,0594 | 94,1 % | 0,0131 | 95,0 % |
| Unsloth UD-Q4_K_M | 16,61 GB | 0,0031 | 97,6 % | 0,0223 | 97,1 % | 0,0029 | 97,9 % |
| Unsloth UD-IQ4_XS | 15,73 GB | 0,0036 | 97,3 % | 0,0226 | 96,9 % | 0,0036 | 97,5 % |
| IQ4_XS | 15,73 GB | 0,0037 | 97,4 % | 0,0232 | 96,9 % | 0,0035 | 97,5 % |
| Unsloth UD-Q3_K_XL | 13,63 GB | 0,0136 | 95,2 % | 0,0354 | 95,6 % | 0,0116 | 95,6 % |
| Q3_K_M | 13,63 GB | 0,0153 | 94,9 % | 0,0450 | 95,1 % | 0,0134 | 95,3 % |
| Unsloth UD-IQ3_XXS | 11,66 GB | 0,0263 | 93,0 % | 0,0642 | 93,4 % | 0,0206 | 94,2 % |
| IQ3_XXS | 11,66 GB | 0,0317 | 92,2 % | 0,0956 | 92,3 % | 0,0252 | 93,4 % |
| Unsloth UD-Q2_K_XL | 9,14 GB | 0,0688 | 89,2 % | 0,0958 | 90,4 % | 0,0597 | 90,5 % |
| Q2_K | 9,14 GB | 0,0857 | 87,9 % | 0,1470 | 88,8 % | 0,0733 | 89,1 % |
| Unsloth UD-IQ2_XXS | 8,49 GB | 0,0857 | 88,1 % | 0,1145 | 89,8 % | 0,0734 | 89,4 % |
| IQ2_XXS | 8,49 GB | 0,1086 | 86,2 % | 0,1962 | 87,9 % | 0,0900 | 87,8 % |
| Unsloth UD-IQ1_M | 8,02 GB | 0,0998 | 87,4 % | 0,1308 | 89,8 % | 0,0768 | 88,8 % |
| Unsloth UD-IQ1_S | 7,76 GB | 0,1147 | 86,2 % | 0,1343 | 88,8 % | 0,0919 | 87,9 % |

## Requisitos de hardware

- VRAM estimada: desde 8,49 GB (IQ2_XXS) hasta 22,92 GB (NVFP4) para el modelo de texto; anadir 345,91 MB (mmproj Q8_0) o 641,81 MB (mmproj BF16) para vision.
- GPU recomendadas por la model card: RTX 4090 o RTX 3090 (24 GB) con NVFP4-XL y 32K de contexto; RTX 5090 (32 GB) con NVFP4 y 64K; RTX 6000 Ada o 2 x 24 GB (48 GB) con NVFP4 y 512K; H100 (80 GB), H200 (141 GB), B200 (192 GB) o B300 (288 GB) con NVFP4 y 1M.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y RTX 5090; los ficheros de 8,49-15,73 GB permiten su uso en tarjetas de 12-16 GB.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB), Mac Studio M5 Ultra (256 GB y 512 GB), todos con NVFP4 y 1M de contexto.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--mmproj` y `--jinja`, release `b12611` o posterior; descarga con `hf download`. Otras opciones como vLLM, Ollama o TGI: no disponibles en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La model card compara las cuantizaciones de Xylolabs con las de Unsloth y con el baseline Q4_K_M de llama.cpp para el mismo modelo base. No se proporcionan comparaciones con otros modelos de la misma categoria.

| Alternativa | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling 2 Mini (base) | 26.070.390.272 | no disponible | Apache 2.0 | safetensors | Modelo original de Thinking Machines, incluye drafter MTP |
| Unsloth UD-Q4_K_XL | mismo modelo | no disponible | Apache 2.0 | GGUF | 17,63 GB, KL 0,0029 en WikiText-2 |
| Unsloth UD-IQ4_XS | mismo modelo | no disponible | Apache 2.0 | GGUF | 15,73 GB, KL 0,0036 en WikiText-2 |
| llama.cpp baseline Q4_K_M | mismo modelo | no disponible | Apache 2.0 | GGUF | 17,48 GB, KL 0,0167 en WikiText-2 (peor que las variantes con imatrix) |

## Limitaciones y advertencias

- Requiere llama.cpp `b12611` o posterior; versiones anteriores ignoran las escalas NVFP4 por experto y generan salidas incorrectas.
- El drafter MTP del modelo original se omite en estos GGUF, por lo que no se dispone de la decodificacion especulativa nativa.
- La vision requiere cargar el proyector `mmproj` por separado; sin el, el modelo funciona solo con texto.
- La degradacion por cuantizacion es notable en los ficheros pequenos: IQ2_XXS baja al 86,2 % de top-1 en WikiText-2 y Q2_K al 87,9 %, frente al 98,0 % de NVFP4.
- El uso esta sujeto a la Model Acceptable Use Policy de Thinking Machines ademas de la licencia Apache 2.0.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada.
- Idiomas soportados: no disponibles en la informacion proporcionada.
- Parametros activos y numero de expertos: no disponibles en la informacion proporcionada.
- El contexto maximo de 1M depende del hardware y de la memoria disponible; en 24 GB se limita a 32K.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia: https://huggingface.co/Xylolabs/Inkling-2-Mini-GGUF/blob/main/LICENSE
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
