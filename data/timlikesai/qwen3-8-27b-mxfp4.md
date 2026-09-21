# timlikesai/Qwen3.8-27B-MXFP4

## Resumen

`timlikesai/Qwen3.8-27B-MXFP4` es una cuantizacion GGUF en formato MXFP4 de 4,25 bits del modelo base `ggml-org/Qwen3.8-27B`, publicada por el usuario timlikesai. El modelo resultante conserva los 26.895.998.464 parametros (unos 26,9 mil millones) del original y ocupa 15,7 GB en el repositorio, que incluye el archivo de pesos `27b-mxfp4-imx.gguf` y el archivo de importancia `27b.imatrix` empleado para la busqueda de escalas.

Su relevancia practica es doble. Por un lado, permite ejecutar un modelo denso de ~27B en hardware de consumo mediante llama.cpp, ya que la cuantizacion de 4,25 bits reduce el peso de los pesos a aproximadamente 15 GB. Por otro, emplea el formato MXFP4 con escalas de bloque e8m0 y busqueda de escalas OCP ponderada por imatrix, una tecnica que busca preservar la calidad frente a cuantizaciones uniformes de bit bajo, e incluye la ruta de cache KV en MXFP4 (MXAttention).

Conviene senalar que la ficha es deliberadamente incompleta: no se declara licencia, ni idiomas, ni pipeline, ni se han publicado benchmarks. El modelo se publico el 20 de septiembre de 2026 y acumula 0 descargas y 0 likes, por lo que se trata de un artefacto sin validacion externa. La informacion sobre el modelo base tampoco se incluye en los datos disponibles, de modo que la mayor parte de las especificaciones de arquitectura y entrenamiento figuran aqui como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor referencia el modelo base `ggml-org/Qwen3.8-27B`, sin documentar su arquitectura en la informacion proporcionada) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 de 4,25 bits con escalas de bloque e8m0; busqueda de escalas OCP con objetivo 4,0 y ponderacion por imatrix. Archivo unico GGUF |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`27b-mxfp4-imx.gguf`); se incluye ademas `27b.imatrix` |
| Tamano del repositorio | 15,7 GB |
| Ruta de cache KV | MXFP4 con escalado UOS: `e = ceil(log2(amax/7.25))+127` (MXAttention), activada por defecto |
| Autor | timlikesai |
| Fecha de publicacion | 20 de septiembre de 2026 (actualizado el mismo dia) |
| Descargas / likes | 0 / 0 |
| Etiquetas declaradas | gguf, endpoints_compatible, region:us, imatrix, conversational |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base `ggml-org/Qwen3.8-27B`, ni sobre el numero de tokens de entrenamiento, la composicion del dataset o el uso de RLHF, DPO u otras tecnicas de alineamiento. Lo unico documentado es el proceso de cuantizacion aplicado sobre los pesos originales, no un reentrenamiento.

El procedimiento descrito por el autor es el siguiente: primero se calcula una matriz de importancia con `llama-imatrix` sobre un fichero `train.txt` (datos de entrenamiento de wiki, segun la model card) para generar `27b.imatrix`; despues se cuantiza con `llama-quantize --imatrix 27b.imatrix base.gguf 27b-mxfp4-imx.gguf mx`. Los pesos usan la busqueda de escalas OCP con objetivo 4,0 y escalas de bloque en formato e8m0 (potencias de dos), mientras que la ruta de cache KV en MXFP4 emplea por defecto un escalado UOS con la formula `e = ceil(log2(amax/7.25))+127` (MXAttention). El autor enlaza una pull request de su propio fork de llama.cpp, lo que sugiere que la ruta MXFP4 puede requerir soporte especifico no presente en todas las versiones del runtime.

## Capacidades

- Generacion de texto y uso conversacional: la etiqueta `conversational` de la ficha indica que esta orientado a dialogos, si bien no se detallan capacidades concretas.
- Razonamiento, matematicas, generacion de codigo, vision o audio: no disponible, no se documentan en la informacion proporcionada.
- Tool calling / function calling: no disponible, no se menciona en la ficha.
- Soporte de agentes y razonamiento multi-paso: no disponible, no se menciona.
- Capacidades multilingues: no disponible, el campo de idiomas no esta declarado.
- Modo thinking o modos especiales de inferencia: no disponible.
- Inferencia local cuantizada: es la capacidad verificable del artefacto; al ser GGUF puede ejecutarse con llama.cpp con reparto de capas entre CPU y GPU.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a traves de una API compatible con el formato de endpoints habitual, probablemente mediante `llama-server`.

## Casos de uso

- Inferencia local en estacion de trabajo: un modelo de ~27B en 4,25 bits ocupa del orden de 15 GB, por lo que se puede cargar en una GPU de 24 GB con reparto parcial de capas en CPU, sin depender de servicios en la nube ni de cuotas de API.
- Asistente conversacional autoalojado: gracias a la orientacion conversacional declarada y a la posibilidad de servirlo con `llama-server`, se puede integrar como backend de un chat interno para equipos que no pueden enviar datos a terceros.
- Generacion de codigo asistida en local: el modelo puede emplearse como autocompletado o asistente de refactorizacion dentro de un IDE, siempre que se verifiquen las capacidades de codigo del modelo base, no documentadas en esta ficha.
- Procesamiento por lotes de texto en servidor: la ruta de cache KV en MXFP4 reduce el coste de memoria por sesion, lo que resulta util al atender varias conversaciones concurrentes en una misma GPU.
- Investigacion sobre cuantizacion de 4 bits: el repositorio incluye el archivo `27b.imatrix` y la receta exacta, lo que permite reproducir la cuantizacion, comparar la busqueda de escalas OCP con otras tecnicas o calibrar cuantizaciones propias.
- Evaluacion comparativa de formatos MXFP4: el artefacto sirve como punto de partida para medir la degradacion de calidad frente a cuantizaciones de 5 o 6 bits del mismo modelo base, aunque el autor no publica esas mediciones.
- Despliegue en entornos con hardware heterogeneo: al ser GGUF, permite mezclar offload a GPU y calculo en CPU, util en equipos sin GPU dedicada de gran capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones con el modelo base o con otras cuantizaciones del mismo. Tampoco se facilitan datos de latencia o throughput.

## Requisitos de hardware

- VRAM para los pesos: estimacion a partir del tamano del repositorio (15,7 GB, que incluye tambien el archivo imatrix), del orden de 14-16 GB solo para los pesos. Esta cifra no ha sido confirmada por el autor.
- Memoria adicional para cache KV: depende de la longitud de contexto y del numero de capas, datos no publicados. La ruta MXFP4 con escalado UOS reduce el coste por token respecto a FP16.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) con contexto moderado, y en tarjetas de 32 GB o mas (RTX 5090) con mayor holgura. En GPUs de 12-16 GB requeriria offload parcial a CPU y RAM del sistema.
- GPU de centro de datos: A100 40/80 GB, H100, L40S o RTX 6000 Ada permiten mantener el modelo completo en VRAM junto con contextos amplios y varias sesiones concurrentes.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) es la via documentada por el autor; Ollama y otros frontends basados en llama.cpp son compatibles siempre que soporten el tipo de cuantizacion MXFP4. vLLM y TGI no cargan GGUF de forma nativa para este caso y no estan confirmados.
- Compatibilidad del runtime: el autor enlaza una pull request de su fork de llama.cpp, por lo que conviene verificar que la version instalada reconoce el tipo de cuantizacion `mx` antes de desplegar.
- Latencia y throughput: no disponible, no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este artefacto ni de sus alternativas directas que permitan una comparacion cuantitativa. La unica comparacion documentable es con el modelo del que deriva.

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| timlikesai/Qwen3.8-27B-MXFP4 | 26.895.998.464 | GGUF MXFP4 4,25 bits | no disponible | no disponible | HuggingFace, 0 descargas |
| ggml-org/Qwen3.8-27B (base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | HuggingFace, referenciado por el autor |
| Otras cuantizaciones del mismo modelo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada modelos alternativos de tamano o tarea comparable con datos verificables.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no se puede asumir permiso para uso comercial. Es imprescindible consultar la licencia del modelo base `ggml-org/Qwen3.8-27B` antes de cualquier despliegue productivo.
- Ausencia total de benchmarks: no hay evidencia publicada sobre la calidad del modelo ni sobre la perdida introducida por la cuantizacion de 4,25 bits frente al modelo original.
- Artefacto sin validacion comunitaria: 0 descargas y 0 likes, publicado y actualizado el mismo dia. No existe retroalimentacion de terceros sobre su funcionamiento real.
- Ficha del modelo base no incluida: se desconoce la arquitectura, el contexto maximo, los idiomas soportados y el regimen de entrenamiento del modelo del que deriva.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje; no hay evaluaciones de fidelidad ni de tasas de error publicadas.
- Dependencia de un runtime especifico: la ruta MXFP4, y en particular la cache KV con escalado UOS, puede requerir la version o el fork de llama.cpp enlazado por el autor. Un runtime sin soporte para el tipo de cuantizacion `mx` no cargara el archivo.
- Riesgo de degradacion en contexto largo: las cuantizaciones agresivas de la cache KV pueden afectar a la coherencia en conversaciones extensas; no hay mediciones publicadas al respecto.
- Idiomas y cobertura multilingue desconocidos: no se puede garantizar un comportamiento correcto en castellano ni en otros idiomas distintos del ingles sin evaluacion previa.
- Sesgos: no se han documentado analisis de sesgo ni de seguridad para este artefacto ni para su modelo base en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timlikesai/Qwen3.8-27B-MXFP4
- Modelo base referenciado por el autor: https://huggingface.co/ggml-org/Qwen3.8-27B
- Pull request del fork de llama.cpp citada en la model card: https://github.com/timlikesai/llama.cpp/pull/14
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; las entradas devueltas corresponden a listados de hoteles en Sydney y no guardan ninguna relacion con el modelo.
