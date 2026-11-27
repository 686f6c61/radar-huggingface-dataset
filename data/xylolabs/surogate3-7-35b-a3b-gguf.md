# Xylolabs/Surogate3.7-35B-A3B-GGUF

## Resumen

Surogate3.7-35B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por surogate, con 35.505.251.456 parametros totales y aproximadamente 3B parametros activos por token (de ahi el sufijo A3B). La ficha que nos ocupa es la version cuantizada en GGUF publicada por Xylolabs, pensada para su ejecucion con llama.cpp sobre CUDA, Metal o CPU. El modelo base esta publicado bajo licencia Apache 2.0 y esta orientado a tareas de agente, uso de herramientas (tool-use) y conversacion multilingue, con capacidad de vision integrada (pipeline image-text-to-text).

La relevancia de esta publicacion radica en que ofrece siete niveles de cuantizacion (desde Q8_0 hasta IQ3_M) con un proyector visual F16 independiente y una matriz de importancia (imatrix), lo que permite desplegar un modelo de 35B en GPUs de consumo como una RTX 4090 o una RTX 3090 con cuantizaciones de 3 bits y ventanas de contexto de hasta 64K tokens. La documentacion del autor incluye tablas de divergencia KL y acuerdo top-1 frente al modelo en BF16, lo que facilita evaluar la perdida de calidad por cuantizacion.

El modelo se distribuye unicamente en ingles segun los metadatos, aunque la etiqueta de idioma declarada es "en". La fecha de creacion del repositorio es el 23 de noviembre de 2026 y la ultima actualizacion el 25 de noviembre de 2026. No se dispone de informacion detallada sobre la arquitectura interna, el dataset de entrenamiento ni los resultados de benchmarks del modelo base en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer; detalles internos no disponibles |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3B (indicado por el sufijo A3B; cifra exacta no disponible) |
| Longitud de contexto | Hasta 256K tokens segun la tabla de hardware del autor; 32K en el ejemplo de ejecucion; 64K/128K/256K segun memoria |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M, IQ3_M; proyector visual F16 |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector visual en GGUF F16; matriz de importancia en GGUF |

## Arquitectura y entrenamiento

La informacion disponible confirma que el modelo base es una mezcla de expertos (MoE) con 35.505.251.456 parametros totales y aproximadamente 3B parametros activos por token. No se detalla en la informacion proporcionada el numero de expertos, la estrategia de enrutamiento, la dimension oculta, el numero de capas ni el tipo de atencion. Tampoco se especifican los datos de entrenamiento (numero de tokens, composicion del dataset) ni si se aplicaron tecnicas de RLHF, DPO o similares.

La innovacion tecnica destacable de esta publicacion es el proceso de cuantizacion: Xylolabs ha generado siete variantes GGUF con una matriz de importancia (imatrix) de 384,36 MB, lo que permite cuantizaciones de baja precision (IQ3_M, Q3_K_M) con perdida de calidad controlada. El modelo incluye un proyector visual independiente en F16 (899,28 MB) que habilita la entrada de imagenes en llama.cpp. El modelo piensa por defecto (modo thinking) y permite desactivarlo mediante `--chat-template-kwargs '{"enable_thinking":false}'`. La ejecucion de referencia se valido con el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` de llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat integrada en el propio archivo GGUF.
- Razonamiento con modo thinking activado por defecto y posibilidad de respuestas directas desactivandolo.
- Uso de herramientas (tool-use) y function calling, orientado a flujos de agente.
- Capacidades de agente y razonamiento multi-paso (etiquetas agent y tool-use del autor).
- Entrada de imagen a texto (image-text-to-text) mediante el proyector visual F16.
- Soporte de contexto largo: hasta 64K en GPUs de 24 GB, 128K en 48 GB y 256K en 80 GB o mas.
- Ejecucion en CUDA, Metal y CPU a traves de llama.cpp.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).

## Casos de uso

- Agente autonomo con tool calling: el modelo puede integrarse en bucles de agente que invoquen APIs externas, ya que el autor lo etiqueta explicitamente como modelo para agentes y uso de herramientas. Su ventana de contexto de hasta 256K permite mantener el historial completo de acciones y observaciones.
- Asistente conversacional de contexto largo: con 128K o 256K tokens segun hardware, puede procesar documentos extensos, transcripciones o historiales de soporte sin truncar, manteniendo coherencia multi-turno.
- Procesamiento de documentos con imagenes: el proyector visual F16 permite enviar capturas, diagramas o formularios escaneados junto con texto para extraccion de informacion o resumen, ejecutandose en llama.cpp.
- Despliegue en estaciones de trabajo con GPU de consumo: la cuantizacion Q3_K_M (17,17 GB) cabe en una RTX 4090 o RTX 3090 de 24 GB con contexto de 64K, lo que habilita prototipado local de agentes sin infraestructura en la nube.
- Servicio de inferencia en servidor con llama-server: el ejemplo del autor arranca `llama-server` con `-ngl 99 -c 32768 --temp 1.0 --top-p 0.95 --top-k 20`, adecuado para exponer el modelo como API compatible con endpoints.
- Evaluacion comparativa de cuantizaciones: las tablas de KL y top-1 frente a BF16 permiten seleccionar el nivel de cuantizacion segun el compromiso entre memoria y fidelidad, util en pipelines de CI que validen calidad antes de produccion.
- Automatizacion de tareas con razonamiento multi-paso: el modo thinking por defecto favorece tareas que requieren planificacion, como resolucion de incidencias tecnicas o generacion de planes de accion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente proporciona metricas de fidelidad de la cuantizacion frente al modelo en BF16:

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Chat KL | Chat top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q8_0 | 37,80 GB | 0,009392 | 96,216% | 0,005175 | 97,884% | 0,009576 | 96,167% |
| Q6_K | 29,21 GB | 0,012814 | 95,147% | 0,007485 | 97,519% | 0,014325 | 95,627% |
| Q5_K_M | 25,35 GB | 0,017372 | 94,181% | 0,010720 | 97,009% | 0,020506 | 94,775% |
| Q4_K_M | 21,71 GB | 0,036291 | 91,868% | 0,021849 | 95,066% | 0,044122 | 91,941% |
| IQ4_XS | 19,18 GB | 0,042241 | 91,049% | 0,025082 | 94,966% | 0,051119 | 91,667% |
| Q3_K_M | 17,17 GB | 0,107141 | 86,098% | 0,065813 | 91,819% | 0,135335 | 86,804% |
| IQ3_M | 15,81 GB | 0,101532 | 86,010% | 0,058655 | 92,038% | 0,123596 | 86,961% |

## Requisitos de hardware

- VRAM estimada segun cuantizacion: IQ3_M 15,81 GB; Q3_K_M 17,17 GB; IQ4_XS 19,18 GB; Q4_K_M 21,71 GB; Q5_K_M 25,35 GB; Q6_K 29,21 GB; Q8_0 37,80 GB. El proyector visual F16 anade 899,28 MB.
- GPU recomendadas por el autor: RTX 4090 o RTX 3090 (24 GB) con Q3_K_M y contexto 64K; RTX 5090 (32 GB) con Q5_K_M y 64K; RTX 6000 Ada o 2 x 24 GB (48 GB) con Q8_0 y 128K; H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), DGX Spark (128 GB unificada), Mac Studio M5 Max (128 GB unificada), H200 (141 GB), B200 (192 GB), Mac Studio M5 Ultra (256 GB y 512 GB unificada) y B300 (288 GB) con Q8_0 y 256K.
- Cabe en GPU de consumo: si, con Q3_K_M o IQ3_M en GPUs de 24 GB (RTX 4090, RTX 3090) y Q5_K_M en RTX 5090 de 32 GB.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli, llama.cpp con CUDA, Metal o CPU); no se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Parametros de ejecucion de referencia: `-ngl 99 -c 32768 --temp 1.0 --top-p 0.95 --top-k 20`, con `--jinja` para la plantilla de chat.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. A continuacion se indican los datos estructurales conocidos del modelo y se marcan como no disponibles los del resto de alternativas:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---:|---:|---|---|
| Surogate3.7-35B-A3B (GGUF) | 35,5B | ~3B (MoE) | hasta 256K | Apache 2.0 | GGUF |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa 3 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idioma: el unico idioma declarado es el ingles; no hay evidencia de soporte multilingue en la informacion disponible.
- Alucinacion: no se han publicado evaluaciones de fidelidad factual ni tasas de alucinacion; debe validarse en el dominio de produccion.
- Sesgos: no se documentan sesgos conocidos ni datos de composicion del dataset de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no detalla restricciones adicionales sobre los datos de entrenamiento ni sobre el modelo base.
- Cuantizacion: las variantes de 3 bits (Q3_K_M, IQ3_M) presentan una caida notable de fidelidad (top-1 en WikiText-2 en torno al 86% frente al 96% de Q8_0); para tareas sensibles a la precision conviene usar Q4_K_M o superior.
- Contexto: aunque el autor declara hasta 256K tokens, el contexto efectivo depende de la memoria disponible y de la configuracion de `-c`; el ejemplo de referencia usa 32K.
- Modo thinking: activado por defecto, lo que incrementa la latencia y el consumo de tokens si no se desactiva explicitamente.
- Despliegue: solo se documenta llama.cpp; no hay soporte confirmado para vLLM, TGI u otros motores en la informacion proporcionada.
- Fecha de publicacion: el repositorio es de noviembre de 2026 y cuenta con 516 descargas y 1 like, por lo que la validacion comunitaria es todavia limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/Surogate3.7-35B-A3B-GGUF
- Modelo base: https://huggingface.co/surogate/Surogate3.7-35B-A3B
- Licencia: https://huggingface.co/Xylolabs/Surogate3.7-35B-A3B-GGUF/blob/main/LICENSE
- Codigo llama.cpp de referencia: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio del autor (assets): https://github.com/XylolabsInc/tensix-bfp-gptq
- Grafico de KL media: https://huggingface.co/Xylolabs/Surogate3.7-35B-A3B-GGUF/resolve/main/accuracy-mean-kl.png
- Grafico de acuerdo top-1: https://huggingface.co/Xylolabs/Surogate3.7-35B-A3B-GGUF/resolve/main/accuracy-top1.png
