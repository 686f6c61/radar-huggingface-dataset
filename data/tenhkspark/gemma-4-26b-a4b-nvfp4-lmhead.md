# tenhkspark/gemma-4-26B-A4B-NVFP4-lmhead

## Resumen

Gemma 4 26B A4B NVFP4 con lm_head independiente es una derivada de cuantización publicada por el usuario tenhkspark sobre `nvidia/Gemma-4-26B-A4B-NVFP4`, que a su vez es la cuantización oficial NVFP4 (ModelOpt) de `google/gemma-4-26B-A4B-it` en BF16. La modificación concreta respecto al checkpoint de NVIDIA es que se vuelve a guardar el modelo con `tie_word_embeddings=false` y un `lm_head.weight` cuantizado aparte en NVFP4, eliminando el coste de lectura por token del embedding atado.

El resultado declarado por el autor es un aumento de velocidad en un único DGX Spark (GB10): de 28,8 tok/s del checkpoint oficial NVFP4 sin decodificación especulativa a 109,7 tok/s con esta receta y especulación MTP activada, con 1.080,8 tok/s agregados a 32 peticiones concurrentes. El repositorio ocupa 19,2 GB (13 archivos, 19.240.726.248 bytes) y se sirve con vLLM.

Es relevante ahora porque demuestra que en hardware de memoria unificada de gama baja (DGX Spark) es posible servir un MoE de ~26B nominales con salida de más de 100 tok/s en flujo único, y porque cuantifica explícitamente el coste en calidad de la cuantización NVFP4 frente a BF16 sobre nueve tareas en japonés. El modelo está declarado únicamente para japonés y cuenta con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de Gemma 4 26B A4B; decodificacion especulativa MTP |
| Parametros totales | 14.386.941.232 (~14,39B) segun el recuento real en safetensors; la nomenclatura comercial indica 26B |
| Parametros activos | ~4B por la nomenclatura A4B; no confirmado explicitamente en la informacion disponible |
| Longitud de contexto | No disponible como maximo del modelo; el perfil de servicio `gemma4.small.env` fija `--max-model-len 8192` y las pruebas de entrada larga llegan a 28K tokens |
| Tipos de cuantizacion | NVFP4 (4 bits) en pesos y `lm_head`; cache KV en FP8. La etiqueta del repositorio indica «8-bit», en contradiccion con la model card. Existe una variante no publicada con atencion (QKVO) en FP8 y MLP/expertos/`lm_head` en NVFP4 |
| Idiomas soportados | Japones (`ja`); la model card se ofrece en ingles, japones, coreano y chino, pero no se declaran capacidades multilingues del modelo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (13 archivos), servido con vLLM; no se distribuye GGUF |
| Tamano del repositorio | 19,2 GB (19.240.726.248 bytes, md5 del manifiesto `571932348835310ce77799f70a4e9814`) |
| Huella en GPU | 17,08 GiB medidos en el log de arranque |

## Arquitectura y entrenamiento

El modelo es una derivada de cuantizacion, no un entrenamiento nuevo. La arquitectura subyacente es la de Gemma 4 26B A4B, un transformer con mezcla de expertos en el que la nomenclatura «A4B» indica aproximadamente 4.000 millones de parametros activos por token sobre un total nominal de 26B. Sobre esa base, NVIDIA aplico cuantizacion NVFP4 con ModelOpt, y esta derivada modifica unicamente la cabeza de salida: separa `lm_head` del embedding, lo guarda con su propio tensor cuantizado en NVFP4 y evita asi el coste de lectura por token que impone el embedding atado en BF16.

No se documentan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni fases de RLHF o DPO del modelo base: esos datos corresponden a Google y no se reproducen aqui. La innovacion tecnica destacable es doble. Primero, la decodificacion especulativa MTP (`{"method":"mtp","model":"/checkpoint-mtp","num_speculative_tokens":8}`), que multiplica por 3,06 la velocidad en flujo unico (35,8 a 109,7 tok/s) y por 3,49 en el checkpoint oficial sin modificar (28,8 a 100,5 tok/s). Segundo, la propia separacion del `lm_head`, que aporta un +9,2% adicional con especulacion activa (100,5 a 109,7 tok/s) y un +24,3% con especulacion desactivada (28,8 a 35,8 tok/s).

## Capacidades

- Generacion de texto en japones para prompts de negocio (la evaluacion practica usa tres formatos de prompt sobre 90 tareas reales).
- Tareas de comprension y razonamiento en japones: JSQuAD (extractivo), JNLI (inferencia de lenguaje natural), JCommonsenseQA y JMMLU.
- Extraccion de informacion estructurada: el autor cita expresamente la tarea de extraer nombres de tablas a partir de consultas SQL, aunque con tendencia a listar tablas de mas.
- Soporte de tool calling y function calling via vLLM, con `--tool-call-parser gemma4` y `--enable-auto-tool-choice`.
- Soporte de razonamiento con parser dedicado (`--reasoning-parser gemma4`).
- Modo de decodificacion especulativa con modelo borrador MTP para acelerar la generacion.
- Prefill por trozos (`--enable-chunked-prefill`) para entradas largas.
- Capacidades multimodales desactivadas explicitamente en el perfil de servicio: `--limit-mm-per-prompt '{"image":0,"audio":0}'` y `--language-model-only`.
- No hay evidencia en la informacion disponible de soporte de agentes multi-paso, vision, audio ni capacidades multilingues mas alla del japones.

## Casos de uso

- Atencion al cliente automatizada en japones: con 607.998 tokens de cache KV reservados al 50% de utilizacion de memoria, el sistema puede mantener muchas conversaciones multi-turno simultaneas en un solo DGX Spark, y a 32 concurrentes sostenidas ofrece 1.080,8 tok/s agregados.
- Procesamiento por lotes de documentos japoneses: la evaluacion de 90 tareas practicas alcanza 83,40 tareas por minuto a concurrencia 32, lo que permite clasificar, resumir o extraer campos de volumenes grandes de texto en una sola maquina.
- Extraccion de esquemas desde SQL: el modelo identifica nombres de tablas a partir de consultas; es util como paso previo a la generacion de documentacion de bases de datos, asumiendo la tendencia conocida a incluir tablas de mas (24/30 aciertos a C=1).
- Asistente de codigo y consultas tecnicas en japones: el soporte de tool calling en vLLM permite conectarlo a herramientas internas y orquestar llamadas a funciones desde un servicio HTTP.
- Backend de agentes con razonamiento explicito: el parser `gemma4` de razonamiento permite separar la traza de pensamiento de la respuesta final, util para pipelines que necesitan auditar la decision.
- Despliegue en el borde o en oficina remota: con 17,08 GiB de huella en GPU y un contenedor de 9,4 GB comprimido, cabe en estaciones con memoria unificada tipo DGX Spark sin necesidad de centro de datos.
- Evaluacion comparativa de cuantizacion: sirve como referencia practica para medir la perdida de calidad de NVFP4 frente a BF16 en japones, con deltas pareados publicados por metrica.
- Prototipado rapido de servicios LLM internos: el arranque se resuelve con `./serve.sh up` y una comprobacion de humo con `./serve.sh smoke`.

## Benchmarks y rendimiento

Todos los datos siguientes son mediciones del autor (DGX Spark GB10, 2026-09-20), no resultados de benchmarks academicos estandar.

Velocidad en flujo unico, prompts de negocio en japones, temperatura 0:

| Configuracion | tok/s |
|---|---:|
| NVFP4 oficial sin especulacion | 28,8 |
| NVFP4 oficial con γ8 | 100,5 |
| Esta receta (A+γ8) | 109,7 |
| Esta receta sin especulacion | 35,8 |

Rendimiento agregado bajo carga sostenida (60 s por nivel):

| Concurrencia | tok/s |
|---:|---:|
| C=8 | 496,7 |
| C=16 | 822,0 |
| C=32 | 1.080,8 |

Tareas practicas (90 tareas en japones, temperatura 0):

| Concurrencia | Superadas | Tareas/min |
|---:|---:|---:|
| C=1 | 84/90 | 7,59 |
| C=8 | 82/90 | 35,90 |
| C=32 | 80/90 | 83,40 |

Entrada larga:

| Longitud de entrada | C=1 (tok/s) | C=8 agregado (tok/s) |
|---:|---:|---:|
| 8K | 30,6 | 62,9 |
| 28K | 10,4 | 12,0 |

Calidad: diferencia pareada frente a BF16 en puntos, conjunto de validacion de JGLUE y JMMLU (n = 2.434 por metrica; JCommonsenseQA, 1.119):

| Metrica | Δ (pt) | Limite inferior unilateral del 95% |
|---|---:|---:|
| JSQuAD EM | −0,66 | −1,17 |
| JSQuAD char-F1 | −0,17 | −0,41 |
| JNLI acc (ejecucion 1) | −1,23 | −1,93 |
| JNLI acc (ejecucion 2) | −1,48 | −2,14 |
| JCommonsenseQA acc | −0,36 | −1,07 |
| JMMLU acc | −0,70 | −1,60 |

Conjunto independiente de retencion (500 preguntas por tarea, no usado para elegir la configuracion): JSQuAD EM +0,20; JSQuAD char-F1 −0,18; JNLI acc −1,60; JCommonsenseQA acc −0,20. JMMLU queda excluido por no tener particion train/valid.

## Requisitos de hardware

- VRAM/footprint: 17,08 GiB medidos en el log de arranque con `Model loading took`; el repositorio pesa 19,2 GB.
- Hardware validado: un unico NVIDIA DGX Spark (GB10) con memoria unificada. El autor menciona ademas un perfil para GPU discreta de ~32 GB (`./serve.sh up --env gemma4.small.env`).
- No se declara compatibilidad con GPU de consumo de 24 GB. El peso en disco (19,2 GB) mas cache KV y activaciones deja poco margen en ese segmento, y el autor no lo confirma.
- Cache KV reservada segun `GPU_UTIL` en memoria unificada: 607.998 tokens (0,5, por defecto), 837.957 (0,6) y 1.011.401 (0,7).
- Despliegue: vLLM, con contenedor propio `tenhkspark/vllm-gb10:v0.28.0-sm121` (9,4 GB comprimido) o construyendo el `docker/Dockerfile` de vLLM. No hay soporte declarado de llama.cpp, Ollama ni TGI, ni pesos GGUF.
- Parametros de servicio relevantes: `--tensor-parallel-size 1`, `--max-model-len 8192`, `--max-num-seqs 8`, `--max-num-batched-tokens 8192`, `--enable-chunked-prefill`, `--no-enable-prefix-caching`, `--kv-cache-dtype fp8`, `--gpu-memory-utilization 0.85`.
- Latencia y rendimiento: 109,7 tok/s en flujo unico con entradas cortas; 35,8 tok/s sin especulacion; 30,6 tok/s a 8K de entrada y 10,4 tok/s a 28K. El cuello de botella es el prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Velocidad medida (C=1) | Calidad vs BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Esta receta (lm_head NVFP4 independiente) | ~14,39B en safetensors (nominal 26B-A4B) | NVFP4 + KV FP8 | 109,7 tok/s con MTP; 35,8 sin MTP | JNLI −1,23 / −1,48 pt; JMMLU −0,70 pt | Apache 2.0 | Publicada (13 archivos safetensors) |
| nvidia/Gemma-4-26B-A4B-NVFP4 | Mismo modelo base | NVFP4 oficial ModelOpt | 100,5 tok/s con γ8; 28,8 sin especulacion | No publicada en esta informacion | Apache 2.0 (heredada) | Publicada |
| google/gemma-4-26B-A4B-it | 26B nominales, ~4B activos | BF16 | No disponible | Referencia de comparacion | Apache 2.0 | Publicada |
| Variante con atencion QKVO en FP8 | Mismo modelo base | FP8 en atencion + NVFP4 en MLP/expertos/lm_head | 117,5 tok/s (+7,1%) | JNLI −0,74 pt validacion, −1,20 pt retencion | Apache 2.0 | No publicada |

El rendimiento agregado a 32 concurrentes de la variante FP8 es aproximadamente la mitad que el de esta receta, motivo por el que el autor no la publica como configuracion por defecto.

## Limitaciones y advertencias

- El rendimiento esta limitado por el prefill: a 8K tokens de entrada la velocidad cae a un tercio de la de entradas cortas y a 28K cae a una decima parte. El autor recomienda trocear las entradas largas.
- La generacion no es bit-reproducible entre maquinas: incluso con temperatura 0 la salida diverge ligeramente entre hosts. Los pesos son identicos, la divergencia esta en el lado del servicio.
- En la tarea de extraccion de nombres de tablas desde SQL el modelo tiende a listar tablas de mas. La misma tendencia aparece con pesos BF16 (BF16 20/30 frente a 24/30 de esta receta a C=1), por lo que no la provoca la cuantizacion.
- No se confirma no inferioridad estadistica frente a BF16: en JNLI el limite inferior unilateral del 95% cruza el umbral de −2 puntos en las dos ejecuciones (−1,93 y −2,14).
- La API de servicio no tiene autenticacion: `--host 0.0.0.0` responde en todas las interfaces. Debe ejecutarse en red de confianza o ligarse a 127.0.0.1.
- Solo se declara japones como idioma. No hay datos de rendimiento ni de calidad en castellano u otros idiomas.
- El tag del repositorio indica «8-bit» mientras la model card describe NVFP4 de 4 bits; conviene verificar la configuracion real de cuantizacion antes de integrarlo.
- Existe una discrepancia entre el nombre comercial (26B) y el recuento real de parametros en safetensors (14.386.941.232); hay que planificar el hardware con el dato verificado.
- El formato de distribucion aparece como «to be finalized at release time» en la model card, lo que sugiere que el empaquetado puede cambiar.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni tasas de alucinacion en la informacion disponible.
- La licencia es Apache 2.0, sin restricciones declaradas de uso comercial, pero al derivar de pesos de Google y NVIDIA conviene revisar las condiciones de esos repositorios originales.
- El modelo tiene 0 descargas y 0 likes: no hay validacion independiente de terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tenhkspark/gemma-4-26B-A4B-NVFP4-lmhead
- Modelo base en BF16: https://huggingface.co/google/gemma-4-26B-A4B-it
- Cuantizacion oficial NVFP4 de NVIDIA: https://huggingface.co/nvidia/Gemma-4-26B-A4B-NVFP4
- Contenedor de servicio: `docker pull tenhkspark/vllm-gb10:v0.28.0-sm121`
- La busqueda web realizada no ha devuelto ningun enlace relevante para este modelo: los resultados obtenidos corresponden a paginas de soporte de Microsoft y no guardan relacion con la ficha.
