# StillDeadcode/minicpm5-2b-bf16

## Resumen

StillDeadcode/minicpm5-2b-bf16 es un contenedor de pesos en formato `.rad` preparado para el motor de inferencia radiance, orientado a GPUs AMD con arquitectura RDNA4 y ROCm. No es un modelo nuevo, sino una redistribucion del checkpoint openbmb/MiniCPM5-2B en bf16, exactamente como se publica (incluida la `lm_head`), empaquetado en un unico fichero con el borrador de decodificacion especulativa MiniCPM5-2B-DSpark integrado. El autor es el usuario StillDeadcode y la licencia declarada es Apache 2.0.

El contenedor ocupa 5,12 GiB y anade como novedad principal la decodificacion especulativa mediante DSpark: un borrador de 5 capas con block size 7, cuyos pesos se cuantizan a FP8 E4M3 por bloques de 128x128 y cuya cabeza de vocabulario usa codigos de 2 bits. El borrador solo propone tokens y el modelo bf16 los verifica, de modo que la salida final no se degrada. La longitud de contexto es de 131.072 tokens, la longitud con la que fue entrenado el checkpoint, y la unica modalidad es texto en ingles y chino.

Su relevancia es acotada pero concreta: cubre el nicho de servir un modelo bilingue de ~2B con contexto muy largo sobre hardware AMD RDNA4 usando una API compatible con OpenAI, algo que los stacks habituales (CUDA/vLLM) no cubren. Al tratarse de un repositorio con 0 descargas y 0 likes en el momento de redactar esta ficha, debe considerarse material reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de generacion de texto de la familia MiniCPM de OpenBMB; la informacion no detalla la arquitectura) |
| Parametros totales | aproximadamente 2 mil millones (segun la denominacion MiniCPM5-2B; no confirmado explicitamente en la ficha) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | bf16 para el modelo principal; FP8 E4M3 por bloques 128x128 y codigos de 2 bits para el borrador DSpark; existe una version FP8 del modelo en StillDeadcode/minicpm5-2b-fp8 |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (contenedor del motor radiance), bf16; fichero `minicpm5-2b-bf16.rad` de 5,12 GiB |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base MiniCPM5-2B ni su proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO). Lo que si detalla es la construccion del contenedor: se parte del checkpoint bf16 tal cual se publica, con todos los pesos incluidos, y se le anexa el borrador DSpark para decodificacion especulativa. La receta de conversion (`rad-convert` desde el commit 93bbe22 de radiance) cuantiza unicamente el borrador: sus pesos de atencion y FFN a FP8 E4M3 por bloques de 128x128 con escala bf16, y su cabeza de vocabulario a codigos de 2 bits con grupo de 128 y escala f16. El modelo verificado permanece en bf16.

La innovacion tecnica destacable es precisamente ese esquema de decodificacion especulativa: el borrador DSpark (5 capas, block size 7) propone multiples tokens por paso y el modelo bf16 los verifica antes de emitirlos, de modo que se acelera la generacion sin alterar la distribucion final. La profundidad del borrador se ajusta automaticamente y puede fijarse con `--num-speculative-tokens N` o desactivarse con `0`. El proceso de conversion es determinista: ejecutarlo dos veces produce ficheros identicos byte a byte.

## Capacidades

- Generacion de texto en ingles y chino; es la unica modalidad declarada (texto).
- Decodificacion especulativa integrada mediante el borrador DSpark para acelerar la inferencia.
- Llamada a herramientas (tool calls) a traves de la API compatible con OpenAI que expone el motor radiance.
- Salida estructurada (structured output) mediante la misma API.
- Servicio con endpoints `/v1/chat/completions` y `/v1/completions`.
- Gestion de contexto largo de hasta 131.072 tokens.
- No se declara soporte de vision, audio, modo de razonamiento explicito ni capacidades multimodales.
- No se detalla de forma explicita el soporte de razonamiento multi-paso o agentes mas alla de lo que permiten el tool calling y el contexto largo.

## Casos de uso

- Resumen de documentos largos: con 131.072 tokens de contexto, el modelo puede procesar informes, actas o expedientes completos en una sola pasada, util para pipelines de sintesis documental sin troceado.
- Atencion al cliente bilingue ingles-chino: despliegue de un asistente conversacional multi-turno de bajo coste, con tool calling para consultar sistemas internos (estado de pedidos, incidencias) mediante la API compatible con OpenAI.
- Extraccion de informacion estructurada: uso de salida estructurada para convertir texto libre en JSON (entidades, fechas, importes) en procesos ETL por lotes.
- Despliegue on-premise sobre hardware AMD: entornos que ya usan GPUs RDNA4 con ROCm y quieren evitar stacks CUDA pueden servir este contenedor con el motor radiance en una sola tarjeta (`--tp 1`).
- Aplicaciones con requisitos de privacidad: al ejecutarse localmente y con licencia Apache 2.0, encaja en escenarios donde los datos no pueden salir de la infraestructura propia (sector sanitario, legal o financiero).
- Asistentes de codigo ligero: generacion y autocompletado de fragmentos en un modelo de ~2B, adecuado para entornos con recursos limitados donde no compensa un modelo mayor.
- Traduccion y procesamiento bilingue en/zh: normalizacion, clasificacion y reescritura de textos entre ambos idiomas como tarea auxiliar en un pipeline mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del autor no incluye cifras de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y tampoco se ofrecen mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia: el contenedor completo ocupa 5,12 GiB en disco (bf16, incluida `lm_head` y el borrador). En VRAM hay que sumar la cache KV; con contexto de 131.072 tokens y `--kv-cache-dtype fp8` el consumo de cache puede ser elevado.
- Motor de inferencia: radiance, que segun la informacion esta orientado a GPUs AMD con arquitectura RDNA4 y ROCm.
- Prueba de referencia: construido y probado en una Radeon AI PRO R9700 (gfx1201).
- Escalado: `--tp 1` sirve el modelo en una sola tarjeta; `--tp 2` reparte la carga entre dos GPU.
- GPU NVIDIA: no se contempla en la informacion; el formato `.rad` y el motor radiance son especificos del ecosistema AMD/ROCm descrito.
- Opciones de despliegue: motor radiance (API compatible con OpenAI). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato `.rad` es propio del motor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| StillDeadcode/minicpm5-2b-bf16 (este) | ~2B | 131.072 | `.rad` (bf16) | Apache 2.0 | Incluye borrador DSpark; motor radiance; probado en RDNA4 |
| StillDeadcode/minicpm5-2b-fp8 | ~2B | no disponible | `.rad` (FP8) | Apache 2.0 | Version FP8 del mismo contenedor |
| openbmb/MiniCPM5-2B | ~2B | no disponible | no disponible | no disponible | Modelo base original de OpenBMB |
| openbmb/MiniCPM5-2B-DSpark | borrador de decodificacion especulativa | no disponible | no disponible | no disponible | Borrador integrado en este contenedor (5 capas, block size 7) |

No se dispone de datos de rendimiento para comparar cuantitativamente con alternativas de tamano similar (por ejemplo, modelos de ~2B de otras familias), por lo que la comparacion se limita a formato, contexto y licencia.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino; no hay soporte confirmado de castellano ni de otros idiomas.
- Modalidad unica de texto: sin vision, audio ni otras entradas.
- Riesgo de alucinacion: inherente a un modelo de ~2B; conviene verificar salidas en tareas factuales, especialmente en contextos largos.
- Dependencia de hardware y software: el contenedor requiere el motor radiance y GPU AMD RDNA4 con ROCm; no es directamente utilizable en stacks CUDA/NVIDIA segun la informacion.
- Formato propietario: el fichero `.rad` no es portable a vLLM, llama.cpp ni Ollama tal cual.
- Licencia: Apache 2.0 en este repositorio, lo que permite uso comercial; conviene revisar la licencia del checkpoint base openbmb/MiniCPM5-2B antes de produccion.
- Repositorio de terceros: subido por StillDeadcode, no por OpenBMB; con 0 descargas y 0 likes, carece de validacion comunitaria y de garantias de mantenimiento.
- Fecha de creacion indicada: 2026-10-03, que resulta inusualmente futura; conviene verificar la vigencia y el estado real del repositorio.
- Cache KV con contexto de 131.072 tokens: puede consumir una cantidad de VRAM considerable, incluso en fp8, y limitar el numero de secuencias concurrentes (`--max-num-seqs`).
- No hay resultados de benchmarks publicados, por lo que su calidad frente a alternativas no esta cuantificada.

## Enlaces

- HuggingFace: https://huggingface.co/StillDeadcode/minicpm5-2b-bf16
- Version FP8: https://huggingface.co/StillDeadcode/minicpm5-2b-fp8
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Borrador de decodificacion especulativa: https://huggingface.co/openbmb/MiniCPM5-2B-DSpark
