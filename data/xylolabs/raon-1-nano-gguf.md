# Xylolabs/Raon-1-nano-GGUF

## Resumen

Raon-1-nano-GGUF es la distribucion en formato GGUF del modelo KRAFTON/Raon-1-nano, publicada por Xylolabs. Se trata de un modelo de generacion de texto de aproximadamente 3.130 millones de parametros (3,13 B) orientado a conversacion, del que Xylolabs ha generado ocho cuantizaciones (desde Q8_0 hasta Q2_K) para su uso con llama.cpp. La relevancia de esta publicacion es practica: permite ejecutar un modelo de 3 B en hardware de consumo con perdidas de fidelidad medibles y documentadas frente al original en BF16.

El punto critico de esta distribucion es que **no funciona con llama.cpp upstream**: requiere el fork de KRAFTON (`krafton-ai/llama.cpp`, rama `raon-1-nano`), y segun la model card incluso la compilacion solo-CPU de ese fork aborta con una asercion al cargar los ficheros. Ademas, los pesos se han convertido eliminando el bloque MTP (multi-token prediction) presente en el modelo base, por lo que la decodificacion especulativa nativa del original no esta disponible en estos GGUF.

La model card incluye una tabla de fidelidad (KL y top-1 frente a BF16) por cuantizacion, lo que permite elegir el fichero en funcion del compromiso tamano/calidad. La licencia es Apache 2.0 tanto en el modelo base como en la conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles); el modelo base incluye un bloque MTP eliminado en estos GGUF |
| Parametros totales | 3.130.811.440 (3,13 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens segun la tabla de hardware de la model card (f16 KV); ejemplo de ejecucion con `-c 32768` |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, Q2_K |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base KRAFTON/Raon-1-nano en la documentacion proporcionada: no se especifica si es un transformer denso convencional, el numero de capas, la dimension oculta ni la composicion del dataset de entrenamiento. Lo unico verificable es el recuento de parametros (3,13 B) y la presencia de un bloque MTP en el modelo original, que Xylolabs ha eliminado durante la conversion a GGUF. Esta eliminacion implica que las capacidades de decodificacion especulativa asociadas al MTP no estan presentes en estos ficheros.

El trabajo de Xylolabs se limita a conversion y cuantizacion, con un proceso de imatrix (la etiqueta `imatrix` aparece en los tags del repositorio). La model card reporta que las cuantizaciones Q8_0, Q6_K y Q4_K_M superan a las equivalentes publicadas por KRAFTON en divergencia KL y acuerdo top-1, lo que sugiere un ajuste fino del proceso de cuantizacion. No hay informacion sobre RLHF, DPO ni volumen de tokens de entrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline declarado (`text-generation`, tag `conversational`).
- Soporte bilingue coreano-ingles; no se declaran otros idiomas.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere integracion con APIs tipo OpenAI en el fork de llama.cpp.
- Plantillas de chat Jinja (`--jinja` en el ejemplo de ejecucion).
- Capacidad de razonamiento, codigo, matematicas, tool calling, agentes o vision: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible.

## Casos de uso

- Asistente conversacional en coreano e ingles: el modelo esta entrenado y evaluado para dialogo en ambos idiomas, y la cuantizacion Q8_0 (3,39 GB) preserva el 97,98 % de acuerdo top-1 con BF16 en WikiText-2, adecuado para despliegues donde la fidelidad prima sobre el tamano.
- Despliegue en estaciones de trabajo con GPU de 24 GB: con Q8_0 y KV cache en f16 se pueden alcanzar los 256K tokens de contexto en una RTX 4090 o RTX 3090, lo que permite procesar documentos largos o historiales de conversacion extensos en una sola GPU de consumo.
- Prototipado local en portatiles o equipos con poca VRAM: Q4_K_M (2,08 GB) mantiene un 91,47 % de top-1 en WikiText-2 y cabe en GPUs de 6-8 GB, util para pruebas de integracion antes de escalar a produccion.
- Evaluacion comparativa de cuantizaciones: la tabla de KL/top-1 por fichero permite seleccionar el punto de operacion optimo para un pipeline concreto sin necesidad de re-evaluar contra BF16.
- Sustitucion de modelos mayores en tareas de clasificacion o extraccion de entidades en coreano: con 3 B de parametros y contexto de 256K, el coste por token es bajo frente a modelos de 7-13 B.
- Experimentacion con el fork de KRAFTON: investigadores que quieran reproducir el comportamiento del modelo base en llama.cpp pueden usar estos GGUF como referencia, teniendo en cuenta la ausencia del bloque MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente reporta metricas de fidelidad de cuantizacion frente a BF16:

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Check 7 preguntas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Q8_0 | 3,39 GB | 0,001190 | 97,98 % | 0,001486 | 98,29 % | 0,001247 | 97,53 % | 6/7 |
| KRAFTON Q8_0 | 3,39 GB | 0,001187 | 98,08 % | 0,001546 | 98,14 % | 0,001246 | 97,39 % | 6/7 |
| Q6_K | 2,65 GB | 0,004322 | 95,72 % | 0,005693 | 96,55 % | 0,004300 | 95,41 % | 6/7 |
| KRAFTON Q6_K | 2,65 GB | 0,004891 | 95,50 % | 0,006117 | 96,28 % | 0,004853 | 95,35 % | 6/7 |
| Q5_K_M | 2,36 GB | 0,008291 | 94,22 % | 0,011795 | 94,72 % | 0,007685 | 94,08 % | 5/7 |
| Q4_K_M | 2,08 GB | 0,021528 | 91,47 % | 0,030931 | 92,49 % | 0,018727 | 91,61 % | 5/7 |
| KRAFTON Q4_K_M | 2,08 GB | 0,028225 | 90,67 % | 0,040656 | 90,47 % | 0,026767 | 89,77 % | 5/7 |
| Q4_K_S | 2,06 GB | 0,025219 | 90,99 % | 0,034254 | 91,86 % | 0,021622 | 91,47 % | 5/7 |
| IQ4_XS | 1,88 GB | 0,034674 | 89,72 % | 0,046046 | 90,35 % | 0,030148 | 89,59 % | 6/7 |
| Q3_K_M | 1,69 GB | 0,083391 | 84,37 % | 0,112255 | 85,00 % | 0,075470 | 84,18 % | 6/7 |
| Q2_K | 1,58 GB | 0,281645 | 73,55 % | 0,348756 | 73,55 % | 0,259067 | 72,45 % | 6/7 |

Observaciones: Q2_K degrada severamente la fidelidad (KL 0,28, top-1 73,55 %), por lo que no es recomendable para produccion. IQ4_XS ofrece un equilibrio interesante (1,88 GB, 6/7 en el check) frente a Q4_K_S y Q4_K_M.

## Requisitos de hardware

- VRAM estimada: el fichero Q8_0 ocupa 3,39 GB; Q4_K_M 2,08 GB; Q2_K 1,58 GB. A esto hay que sumar la KV cache (f16) y el overhead del runtime.
- GPU recomendadas segun la model card: RTX 4090 / RTX 3090 (24 GB) con Q8_0 y contexto de 256K; RTX 5090 (32 GB); RTX 6000 Ada o 2 x 24 GB (48 GB); H100 (80 GB); RTX PRO 6000 Blackwell (96 GB); DGX Spark (128 GB unificada); Mac Studio M5 Max (128 GB); H200 (141 GB); B200 (192 GB); Mac Studio M5 Ultra (256/512 GB); B300 (288 GB).
- Cabe en GPU de consumo: si, con cuantizaciones Q4-Q8 en GPUs de 8 GB o mas; la tabla de la model card asume 24 GB para contexto completo a Q8_0.
- Opciones de despliegue: exclusivamente el fork `krafton-ai/llama.cpp` (rama `raon-1-nano`, commit `b6626358828007d0140d42399705b73bb7a6444b`), compilado con CUDA. La compilacion solo-CPU aborta con una asercion al cargar los ficheros. No se menciona soporte en vLLM, TGI, Ollama ni llama.cpp upstream.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Raon-1-nano-GGUF (Xylolabs) | 3,13 B | 256K | ko, en | Apache 2.0 | GGUF | Requiere fork de KRAFTON; sin bloque MTP |
| KRAFTON/Raon-1-nano | 3,13 B | no disponible | ko, en | Apache 2.0 | safetensors (presumible) | Modelo base; incluye MTP |
| KRAFTON Raon-1-nano GGUF (quants oficiales) | 3,13 B | no disponible | ko, en | Apache 2.0 | GGUF | Referencia de fidelidad en la tabla; Q8_0 y Q6_K ligeramente peores en KL |

No se dispone de datos de benchmarks estandar para comparar con modelos de la misma categoria (p. ej. Qwen2.5-3B, Llama-3.2-3B) en la informacion proporcionada.

## Limitaciones y advertencias

- **Dependencia de un fork**: los GGUF no cargan en llama.cpp upstream ni en la mayoria de runtimes (Ollama, LM Studio, vLLM). Requiere compilar `krafton-ai/llama.cpp` rama `raon-1-nano`.
- **Sin soporte CPU**: la build solo-CPU del fork aborta con asercion al cargar estos ficheros, segun la propia model card.
- **Bloque MTP eliminado**: se pierde la decodificacion especulativa del modelo base; el rendimiento en tokens/s puede ser inferior al del original.
- **Solo coreano e ingles**: no hay soporte declarado de castellano ni de otros idiomas; el rendimiento fuera de ko/en es desconocido.
- **Riesgo de alucinacion**: no cuantificado en la informacion disponible; como todo modelo de 3 B, la tasa de alucinacion sera superior a la de modelos mayores.
- **Cuantizaciones agresivas**: Q2_K presenta una degradacion severa (top-1 73,55 %, KL 0,28); no usar en produccion. Q3_K_M tambien baja del 85 % de top-1.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar el fichero `LICENSE` del repositorio y las condiciones del modelo base KRAFTON.
- **Madurez**: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion independiente de la comunidad.
- **Fecha de creacion futura** (2026-11-26) en los metadatos de Hugging Face; verificar la vigencia de los enlaces y del fork antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Raon-1-nano-GGUF
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- Fork de llama.cpp: https://github.com/krafton-ai/llama.cpp (rama `raon-1-nano`)
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Graficas de fidelidad: https://huggingface.co/Xylolabs/Raon-1-nano-GGUF/resolve/main/accuracy-mean-kl.png y https://huggingface.co/Xylolabs/Raon-1-nano-GGUF/resolve/main/accuracy-top1.png
- Licencia: https://huggingface.co/Xylolabs/Raon-1-nano-GGUF/blob/main/LICENSE
