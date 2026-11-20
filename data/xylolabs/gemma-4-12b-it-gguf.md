# Xylolabs/gemma-4-12B-it-GGUF

## Resumen

Gemma 4 12B It GGUF es una coleccion de cuatro cuantizaciones GGUF del modelo google/gemma-4-12B-it, publicadas por Xylolabs como referencia de comparacion frente a sus propias exportaciones para el acelerador Tensix de Tenstorrent. No se trata de un modelo nuevo ni de un fine-tune: es una conversion a llama.cpp del checkpoint bf16 original de Google, con 11.907.350.576 parametros (aproximadamente 11,9 mil millones) y licencia Apache 2.0.

El interes practico del repositorio es doble. Por un lado, ofrece pesos listos para ejecutar en llama.cpp con cuatro niveles de compresion (Q3_K_M-imat, IQ4_XS-imat, IQ4_XS y Q5_K_M) que van de 6,087 GB a 8,547 GB en disco. Por otro, publica una evaluacion de fidelidad frente al modelo bf16 con metricas de divergencia KL y acuerdo top-1, algo poco habitual en repositorios de cuantizaciones y util para decidir que nivel de compresion tolera un despliegue concreto.

La limitacion mas importante es que estas cuantizaciones conservan unicamente el decodificador de texto: incluyen los 667 tensores de las 48 capas del decoder de texto, el tokenizador y la plantilla de chat original, pero omiten los codificadores de vision y audio del modelo base. Los idiomas declarados son ingles y coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (decodificador de texto de Gemma 4 12B Unified); detalles de atencion no disponibles |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de la model card limita la ejecucion a 2.048 tokens y la evaluacion usa 8.192 tokens, pero la metadatos de contexto original no se modifican |
| Tipos de cuantizacion | Q3_K_M-imat, IQ4_XS-imat, IQ4_XS, Q5_K_M |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

Detalle de los ficheros publicados:

| Fichero | Tamano (GB) | Tipos de tensor y recuento |
|---|---:|---|
| `gemma-4-12B-it-Q3_K_M-imat.gguf` | 6,087 | F32: 338, Q3_K: 192, Q4_K: 131, Q5_K: 5, Q6_K: 1 |
| `gemma-4-12B-it-IQ4_XS-imat.gguf` | 6,635 | F32: 338, IQ4_XS: 328, Q6_K: 1 |
| `gemma-4-12B-it-IQ4_XS.gguf` | 6,691 | F32: 338, IQ4_XS: 322, Q5_K: 6, Q6_K: 1 |
| `gemma-4-12B-it-Q5_K_M.gguf` | 8,547 | F32: 338, Q5_K: 284, Q6_K: 45 |

En las cuatro variantes la matriz compartida de embedding/salida se almacena en Q6_K y las normas y constantes RoPE se mantienen en float32, lo que eleva el numero medio de bits por encima del preset nominal.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del decodificador de texto de Gemma 4 12B Unified, un transformer decoder-only de 48 capas con 667 tensores en la conversion GGUF. El repositorio no documenta la configuracion interna de atencion (numero de cabezas, tipo de atencion, uso de RoPE parcial u otras variantes), por lo que esos detalles deben consultarse en la model card y el informe tecnico de Gemma 4 enlazados por el autor.

El proceso de generacion de estos ficheros es una conversion y cuantizacion con la herramienta `quantize` de llama.cpp a partir del checkpoint bf16, no un reentrenamiento. Las variantes con sufijo `-imat` conservan resultados de una matriz de importancia preexistente; los nombres de fichero de calibracion historicos son solo etiquetas de metadatos y no se incluye ningun dataset de calibracion en el repositorio. No se dispone de informacion sobre datos de entrenamiento, volumen de tokens, composicion del corpus ni fases de RLHF o DPO, ya que corresponden al modelo base de Google y no se detallan aqui.

## Capacidades

- Generacion de texto conversacional en ingles y coreano, con la plantilla de chat original de Gemma 4 preservada.
- Modo de razonamiento (thinking) controlable mediante `--chat-template-kwargs '{"enable_thinking":true|false}'` en llama.cpp; la evaluacion del autor incluye siete comprobaciones con thinking activado.
- Ejecucion local en CPU y GPU mediante llama.cpp, sin dependencia de servicios en la nube.
- Compatibilidad con el formato GGUF y con la API de llama.cpp (incluida la ruta `endpoints_compatible` indicada en los tags del repositorio).
- No incluye vision ni audio: los codificadores correspondientes del modelo Unified fueron omitidos en la conversion.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente; el modo thinking esta presente pero no se detalla su comportamiento en tareas de agente.

## Casos de uso

- Inferencia local en estaciones de trabajo sin GPU dedicada de gran memoria: la variante Q3_K_M-imat ocupa 6,087 GB, por lo que puede ejecutarse en equipos con 8-16 GB de RAM o VRAM usando llama.cpp con mapeo de memoria.
- Despliegue en portatiles con GPU consumer de 8 GB: IQ4_XS-imat (6,635 GB) deja margen para cache KV y buffers de trabajo en tarjetas como la RTX 3060 Ti o RTX 4060, a costa de una fidelidad algo menor frente a bf16.
- Servicio de chat en ingles y coreano con presupuesto de memoria ajustado: Q5_K_M (8,547 GB) ofrece el mejor acuerdo top-1 (80,96%) y la menor divergencia KL (0,367732) de las cuatro variantes, adecuado para asistentes conversacionales donde la calidad prima sobre el coste de memoria.
- Evaluacion comparativa de precision de cuantizacion: el repositorio publica KL y acuerdo top-1 frente a bf16, lo que permite usar estos ficheros como linea base para validar otras exportaciones o herramientas de cuantizacion.
- Prototipado de pipelines de generacion de texto con llama.cpp: el ejemplo CLI verificado (`llama-cli` con `--jinja` y plantilla de chat) sirve como punto de partida reproducible para integrar el modelo en scripts y servicios propios.
- Investigacion sobre degradacion por cuantizacion en modelos de ~12B: la comparacion entre Q3_K_M-imat, IQ4_XS e IQ4_XS-imat con la misma bateria de 33 preguntas y 16 secuencias de 1.024 tokens permite estudiar el efecto de la matriz de importancia y del nivel de bits.
- Despliegue en entornos con requisitos de licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales sin las restricciones de otras licencias de modelos abiertos, siempre que se respete la atribucion correspondiente.

## Benchmarks y rendimiento

Los datos publicados no son benchmarks de tareas estandar (MMLU, HumanEval, GSM8K), sino metricas de fidelidad de la cuantizacion frente al checkpoint bf16 almacenado, calculadas sobre 16 secuencias emparejadas de 1.024 tokens (16.232 posiciones evaluadas) en texto plano y de chat en ingles y coreano.

| Variante | KL media vs bf16 | KL / Q4_K_M | Acuerdo top-1 | Respuestas correctas (referencia) |
|---|---:|---:|---:|---|
| `Q3_K_M-imat` | 0,999333 | 1,134x | 68,10% | 40/40 |
| `IQ4_XS-imat` | 0,695671 | 0,789x | 73,42% | 40/40 |
| `IQ4_XS` | 0,983883 | 1,116x | 68,49% | 40/40 |
| `Q5_K_M` | 0,367732 | 0,417x | 80,96% | 40/40 |
| Q4_K_M (referencia actual) | 0,881231 | 1,000x | 69,79% | no disponible |

En la comprobacion de respuestas, las cuatro variantes pasan 33/33 respuestas mas 7/7 recomprobaciones con thinking activado, sin perdidas contabilizadas ni respuestas rotas; el bf16 almacenado y el Q4_K_M actual tambien obtienen 33/33 mas 7/7. La puerta de aceptacion exige que la variante no pierda mas de una respuesta contabilizada adicional respecto a Q4_K_M y que todas las ratios KL queden por debajo de 1,5x. No se han publicado resultados de benchmarks de tareas estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 6,1 GB (Q3_K_M-imat), 6,6 GB (IQ4_XS e IQ4_XS-imat) y 8,5 GB (Q5_K_M) solo para los pesos; hay que sumar cache KV y buffers de trabajo, que dependen del contexto configurado.
- GPU recomendadas: no especificadas por el autor. Por tamano, una GPU consumer de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070) puede alojar las variantes de 6 GB con contexto moderado; las de 8,5 GB requieren 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) o descarga parcial a RAM.
- GPU de datacenter: A100, H100 y similares son sobredimensionadas para este modelo; su uso tendria sentido solo por concurrencia o por contexto muy largo.
- Cabe en GPU consumer: si, en tarjetas de 8 GB con las variantes Q3/IQ4 y en tarjetas de 12 GB o mas con Q5_K_M.
- Opciones de despliegue: llama.cpp (libreria declarada y unica soportada oficialmente por el autor); el ejemplo verificado usa `llama-cli` con llama.cpp v0.9.0. Otros runners compatibles con GGUF (Ollama, llama-cpp-python, servidores basados en llama.cpp) no estan verificados en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/licencia | Notas |
|---|---|---|---|---|
| Xylolabs/gemma-4-12B-it-GGUF (este) | 11,9 B | no disponible | GGUF, Apache 2.0 | Solo decodificador de texto; cuatro cuantizaciones; evaluacion KL publicada |
| google/gemma-4-12B-it (base) | 11,9 B | no disponible | safetensors/bf16, Apache 2.0 | Modelo Unified completo, incluye vision y audio; referencia de fidelidad |
| Exportaciones Tensix de Xylolabs (mencionadas) | 11,9 B | no disponible | formato Tensix, no disponible | Objetivo de la comparacion; no se detallan especificaciones |
| Otras cuantizaciones GGUF de Gemma 4 12B | no disponible | no disponible | GGUF | No se han identificado en la informacion proporcionada |

No se dispone de datos de benchmarks estandar ni de otros modelos comparables de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita al modelo base y a las exportaciones citadas por el autor.

## Limitaciones y advertencias

- Solo texto: los codificadores de vision y audio del modelo Unified fueron eliminados, por lo que no puede procesar imagenes ni audio.
- Idiomas limitados a ingles y coreano segun los metadatos; el rendimiento en castellano no esta documentado y no deberia asumirse.
- Perdida de fidelidad respecto a bf16: incluso Q5_K_M presenta una KL media de 0,367732 y un acuerdo top-1 del 80,96%; en Q3_K_M-imat el acuerdo baja al 68,10%. En tareas sensibles a la precision exacta conviene validar con el caso de uso concreto.
- Las variantes `-imat` dependen de una matriz de importancia preexistente cuyos ficheros de calibracion no se incluyen; los nombres historicos son solo metadatos.
- Riesgo de alucinacion inherente al modelo base, no cuantificado en la model card.
- Sesgos conocidos del modelo base: no documentados en la informacion proporcionada.
- Licencia Apache 2.0 permisiva para uso comercial, pero el autor declara que el repositorio se ofrece "as is", sin garantia ni aval del upstream, y no esta afiliado ni respaldado por Tenstorrent.
- El ejemplo CLI verificado limita el contexto a 2.048 tokens de forma explicita; la metadatos de contexto original no se modifican, pero el consumo de memoria de la cache KV crece con el contexto configurado.
- No se debe cargar mas de un checkpoint a la vez segun las instrucciones del autor.
- El repositorio tiene un unico like y 2.121 descargas en el momento de la consulta, lo que sugiere una validacion comunitaria limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-12B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia en el repositorio: https://huggingface.co/Xylolabs/gemma-4-12B-it-GGUF/blob/main/LICENSE
- Enlace de licencia de Google: https://ai.google.dev/gemma/apache_2
- Documentacion de GGUF en llama.cpp: https://huggingface.co/docs/hub/gguf-llamacpp
- Codigo de llama.cpp referenciado: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Assets de Xylolabs (logotipos): https://raw.githubusercontent.com/XylolabsInc/tensix-bfp-gptq/main/assets/xylolabs-lockup.svg
- Informe tecnico de Gemma 4: enlazado desde la model card del modelo base (no se proporciona URL directa en la informacion disponible).
