# Xylolabs/Hy-MT3-7B-GGUF

## Resumen

Hy-MT3-7B-GGUF es la distribucion en formato GGUF del modelo de traduccion automatica tencent/Hy-MT3-7B, publicada por Xylolabs. El modelo base es un transformer denso de 7.504.568.320 parametros (aproximadamente 7,5 mil millones) especializado en traduccion multilingue, que cubre mas de 100 idiomas segun la lista de lenguas declarada en la model card. Esta version GGUF permite ejecutar el modelo con llama.cpp sobre CPU, CUDA o Metal, lo que facilita su despliegue en infraestructura sin GPUs de datacenter.

La relevancia de esta publicacion radica en que ofrece cuantizaciones calibradas (incluye ficheros con imatrix, segun los tags) con metricas de degradacion publicadas: divergencia KL frente a BF16 sobre WikiText-2, chat y texto reservado, ademas de chrF++ sobre 200 segmentos de WMT24++ por direccion de traduccion. Esos datos permiten elegir el nivel de cuantizacion con criterio empirico en lugar de por regla general.

El repositorio ocupa 39,5 GB e incluye ocho niveles de cuantizacion desde Q8_0 (7,98 GB) hasta Q2_K (3,01 GB). La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las obligaciones de atribucion de dicha licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles de arquitectura del modelo base no disponibles en la informacion proporcionada) |
| Parametros totales | 7.504.568.320 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso de llama.cpp emplea `-c 8192`) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, Q2_K |
| Idiomas soportados | Mas de 100 idiomas, entre ellos zh, en, es, fr, de, it, pt, ru, ja, ko, ar, hi, vi, th, tr, id, nl, pl, uk, y muchos otros de bajos recursos (ceb, war, su, mg, ba, ht, ckb, gd, etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp); el modelo base original se distribuye en safetensors/BF16 |

## Arquitectura y entrenamiento

No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna del modelo base (tipo de atencion, normalizacion, tokenizador o posicionamiento), ni sobre el volumen o composicion del corpus de entrenamiento, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. Lo unico verificable es que se trata de un modelo denso de 7,5 mil millones de parametros orientado a traduccion, con un token EOS identificado como 127960 (fin de turno), lo que sugiere un formato conversacional con plantilla de chat procesable mediante `--jinja` en llama.cpp.

La innovacion tecnica documentada en esta publicacion es el propio proceso de cuantizacion: Xylolabs publica la divergencia KL de cada cuantizacion frente al BF16 de referencia en tres dominios distintos (WikiText-2, chat y texto reservado), lo que permite cuantificar la perdida de fidelidad de distribucion por nivel. Ademas, el tag `imatrix` indica el uso de matrices de importancia para calibrar las cuantizaciones de tipo K e IQ, una practica que reduce la degradacion en modelos pequenos. El repositorio incluye comparaciones directas con las cuantizaciones oficiales de Tencent (Q8_0, Q4_K_M e IQ2), lo que permite contrastar el trabajo de cuantizacion de terceros frente al del autor original.

## Capacidades

- Traduccion automatica multilingue en mas de 100 idiomas, incluidos pares con idiomas de bajos recursos y variedades como yue (cantonés).
- Generacion de texto conversacional con plantilla de chat compatible con `--jinja` en llama.cpp.
- Salida controlada: el ejemplo de la model card fuerza al modelo a emitir unicamente el texto traducido, sin explicaciones adicionales, mediante instruccion explicita en el prompt.
- Decodificacion determinista recomendada para traduccion (`-st --temp 0`), lo que indica que el modelo responde bien a configuraciones de baja temperatura.
- Capacidad de ejecucion en CPU, CUDA y Metal a traves de llama.cpp.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- Traduccion de documentacion tecnica en pipelines de CI/CD: el modelo puede invocarse mediante `llama-server` con la API compatible de llama.cpp para traducir ficheros Markdown o cadenas de recursos de forma automatizada en cada commit, usando Q4_K_M para equilibrar tamano y calidad (chrF++ de 43,83 frente a 43,75 en BF16).
- Localizacion de productos en mas de 100 idiomas: la cobertura de idiomas declarada permite abordar mercados con lenguas de bajos recursos (ceb, war, su, mg) sin necesidad de modelos especificos por par, reduciendo el numero de sistemas a mantener.
- Traduccion en el borde o en equipos sin GPU: la cuantizacion Q4_K_S (4,40 GB) o IQ4_XS (4,17 GB) permite ejecutar el modelo en portatiles con 8-16 GB de RAM mediante llama.cpp en CPU, con una degradacion de KL contenida (0,074920 y 0,079126 en WikiText-2 respectivamente).
- Servicio de traduccion autoalojado con requisitos de privacidad: al ejecutarse integramente en infraestructura propia con licencia Apache 2.0, es adecuado para traducir contratos, historiales medicos o comunicaciones internas que no pueden enviarse a APIs de terceros.
- Traduccion de subtitulos y contenido audiovisual: el modo de decodificacion determinista (`--temp 0`) y la instruccion de salida limpia facilitan la generacion de segmentos traducidos sin texto adicional que requiera postprocesado.
- Prototipado rapido de funciones de traduccion en aplicaciones: la disponibilidad de ocho niveles de cuantizacion permite empezar con Q2_K (3,01 GB) para pruebas funcionales y escalar a Q6_K (6,16 GB) o Q8_0 (7,98 GB) en produccion segun la tolerancia a la degradacion.
- Evaluacion comparativa de calidad de traduccion: los datos de chrF++ publicados por direccion y por cuantizacion permiten usar el modelo como referencia en estudios de evaluacion de sistemas de traduccion.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas de fidelidad de cuantizacion (divergencia KL frente a BF16 y chrF++ sobre 200 segmentos de WMT24++ por direccion). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BLEU en WMT, etc.) en la informacion disponible.

| Cuantizacion | Tamano | KL WikiText-2 | KL chat | KL texto reservado | chrF++ |
|---|---:|---:|---:|---:|---:|
| BF16 | 15,02 GB | - | - | - | 43,75 |
| tencent Q8_0 | 8,73 GB | 0,004953 | 0,001915 | 0,005163 | 43,71 |
| Q8_0 | 7,98 GB | 0,003794 | 0,002337 | 0,006260 | 43,69 |
| Q6_K | 6,16 GB | 0,009628 | 0,002960 | 0,018109 | 43,74 |
| Q5_K_M | 5,37 GB | 0,028032 | 0,006003 | 0,033385 | 43,79 |
| tencent Q4_K_M | 5,15 GB | 0,042655 | 0,018618 | 0,060555 | 43,72 |
| Q4_K_M | 4,62 GB | 0,066134 | 0,024163 | 0,087120 | 43,83 |
| Q4_K_S | 4,40 GB | 0,074920 | 0,028172 | 0,087944 | 43,77 |
| IQ4_XS | 4,17 GB | 0,079126 | 0,029411 | 0,116065 | 43,73 |
| tencent IQ2 | 3,87 GB | 0,373698 | 0,144970 | 0,456232 | 43,38 |
| Q3_K_M | 3,79 GB | 0,184679 | 0,076294 | 0,234513 | 43,81 |
| Q2_K | 3,01 GB | 0,550986 | 0,212235 | 0,564730 | 43,42 |

Observaciones: el chrF++ se mantiene practicamente estable entre 43,38 y 43,83 en todos los niveles, con la caida mas acusada en Q2_K (43,42) y en el IQ2 de Tencent (43,38). La divergencia KL crece de forma no lineal por debajo de Q4: Q3_K_M multiplica por casi 3 la KL de Q4_K_M en WikiText-2, y Q2_K la multiplica por mas de 8. La cuantizacion Q8_0 de Xylolabs presenta menor KL en WikiText-2 que la Q8_0 de Tencent pese a ocupar menos espacio (7,98 GB frente a 8,73 GB).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 3,01 GB (Q2_K) y 7,98 GB (Q8_0) solo para los pesos; anadir el espacio del contexto KV, que depende de la longitud de contexto configurada. Con `-c 8192` conviene reservar al menos 1-2 GB adicionales.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM puede ejecutar Q4_K_M (4,62 GB) con contexto moderado; una RTX 4090 (24 GB) permite Q8_0 con contexto largo; A100 y H100 permiten Q8_0 con contextos muy amplios y mayor concurrencia.
- Cabe en GPU de consumo: si. Q4_K_M (4,62 GB) encaja en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores. Q2_K (3,01 GB) cabe en GPUs de 4-6 GB. En CPU, Q4_K_S (4,40 GB) es viable con 8 GB de RAM y Q8_0 requiere 16 GB.
- Opciones de despliegue: llama.cpp (`llama-server` y `llama-completion`), y por compatibilidad de formato GGUF, cualquier frontend basado en llama.cpp como Ollama o LM Studio (no verificado explicitamente en la model card). El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI a traves de `llama-server`.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card solo indica la revision de llama.cpp verificada (`5a09582d80600fb5b0a8966e870061bddc8a3732`) y flags de ejecucion (`-ngl 99` para descargar todas las capas en GPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Xylolabs/Hy-MT3-7B-GGUF (este) | 7,5 B | no disponible | >100 | Apache 2.0 | GGUF (8 cuantizaciones) | chrF++ 43,38-43,83; KL publicada por cuantizacion |
| tencent/Hy-MT3-7B (base) | 7,5 B | no disponible | >100 | Apache 2.0 | safetensors/BF16 | Referencia BF16 con chrF++ 43,75; cuantizaciones oficiales Q8_0, Q4_K_M e IQ2 |
| NLLB-200 (variantes 600M-54B) | 0,6-54 B | no disponible | 200 | CC-BY-NC 4.0 (variantes grandes) | safetensors, CTranslate2 | Referencia clasica en traduccion multilingue; licencia no comercial en varios tamanos |
| MADLAD-400-7B-MT | 7 B | no disponible | 400+ | Apache 2.0 | safetensors | Modelo de traduccion multilingue de tamano comparable; sin cuantizaciones GGUF oficiales documentadas aqui |

La comparacion con NLLB-200 y MADLAD-400 se ofrece como referencia de categoria (traduccion multilingue de 7 B); no se dispone de resultados de benchmarks comunes en la informacion proporcionada para establecer una comparacion cuantitativa directa.

## Limitaciones y advertencias

- No se han documentado sesgos conocidos del modelo base en la informacion proporcionada; al ser un modelo de traduccion, es previsible que refleje sesgos presentes en sus corpus de entrenamiento, pero no hay datos concretos.
- Riesgo de alucinacion: no cuantificado. En traduccion, el riesgo se manifiesta como adiciones, omisiones o reescrituras del contenido original; la instruccion de salida limpia del ejemplo mitiga pero no elimina este comportamiento.
- La degradacion por cuantizacion es significativa por debajo de Q4: Q3_K_M y Q2_K multiplican la KL por 3 y 8 respectivamente frente a Q4_K_M en WikiText-2. Para produccion se recomienda Q4_K_M o superior.
- La longitud de contexto no esta documentada; el ejemplo usa 8192 tokens, pero no se confirma cual es el maximo soportado por el modelo base.
- Aunque la lista de idiomas es amplia, no se publican metricas de calidad por idioma ni por par; el chrF++ agregado de WMT24++ no garantiza un rendimiento homogeneo en idiomas de bajos recursos.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar los avisos de licencia y el fichero NOTICE incluidos en el repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-26; se trata de una publicacion muy reciente sin validacion comunitaria extensa.
- La model card solo verifica el funcionamiento con una revision concreta de llama.cpp; otras versiones pueden requerir ajustes en la plantilla de chat o en el manejo del token EOS.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/Hy-MT3-7B-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT3-7B
- Repositorio de herramientas de cuantizacion de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Assets de la model card (graficas de precision): https://huggingface.co/Xylolabs/Hy-MT3-7B-GGUF/resolve/main/accuracy-mean-kl.png y https://huggingface.co/Xylolabs/Hy-MT3-7B-GGUF/resolve/main/accuracy-chrf.png
