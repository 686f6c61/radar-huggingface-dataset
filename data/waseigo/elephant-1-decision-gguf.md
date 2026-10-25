# waseigo/elephant-1-decision-GGUF

## Resumen

`waseigo/elephant-1-decision-GGUF` es una distribucion en formato GGUF del modelo `baselabs/elephant-1`, un modelo de decision de 9B parametros desarrollado por Base Labs (Baseten) a partir de un post-entrenamiento de Qwen3.5-9B con capacidad de vision. No es un modelo conversacional general: es un modelo de decision ("system-one") que responde preguntas acotadas sobre un estado textual —o multimodal— eligiendo entre opciones (`choice`), asignando una puntuacion ordinal (`score`) o emitiendo un si/no (`noul`), leyendo la decision directamente de los logits de las etiquetas.

El repositorio no contiene pesos nuevos ni recuantizaciones: parte del Q4_K_M y de la torre de vision Q8_0 publicados por `mradermacher/elephant-1-GGUF` y anade unicamente metadatos y una plantilla de prompt. En concreto, graba las claves `qwen35.decision.type = openjev`, las temperaturas de decision (`choice`, `score`, `noul` a 1.0), `qwen35.attention.causal = false` y la plantilla `tokenizer.chat_template.systemone`, de modo que llama.cpp expone el endpoint `POST /v1/systemone` en lugar de devolver un error 501 por "no ser un modelo de decision".

Su relevancia es practica: convierte un modelo de decision propietario del ecosistema `qev`/OneJev en un artefacto desplegable con llama.cpp, validado contra la referencia BF16 con una concordancia del 87,5% pregunta a pregunta en Q4_K_M (28/32) y del 90,6% en Q8_0 (29/32). La licencia MIT y el tamano (5,6 GB de pesos) lo hacen viable en GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `qwen35` (base Qwen3.5-9B) con post-entrenamiento para decision; atencion no causal (`qwen35.attention.causal = false`); torre de vision |
| Parametros totales | 8.953.803.264 (8,95B) |
| Longitud de contexto | No disponible como especificacion del modelo base; la configuracion de referencia del servidor usa `-c 32768` (32.768 tokens) |
| Tipos de cuantizacion | Q4_K_M en pesos (427 tensores: 217 `Q4_K`, 33 `Q6_K`, 177 `F32`) y Q8_0 en la torre de vision (`mmproj`); existe ademas un Q8_0 de pesos construido localmente para comparacion |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | GGUF (`elephant-1-Q4_K_M.gguf`, 5.629.111.648 B; `elephant-1.mmproj-Q8_0.gguf`, 624.229.760 B) mas plantilla Jinja (`systemone.jinja`) |
| Endpoint de decision | `POST /v1/systemone` (llama.cpp b11820 o superior) |
| Tipos de decision soportados | `choice`, `score`, `noul` |
| Tamano del repo | 11,9 GB |

## Arquitectura y entrenamiento

El modelo base es `baselabs/elephant-1`, descrito por el autor como un "9B decision model, Qwen3.5-9B post-train, vision". Es por tanto un transformer derivado de Qwen3.5-9B con una torre de vision anadida o adaptada, sobre el que se ha realizado un post-entrenamiento orientado a tareas de decision en lugar de a generacion libre de texto. La innovacion clave no esta en la arquitectura del backbone sino en la cabeza de lectura: la decision se obtiene mediante `readout=slot_lm`, es decir, se leen los logits del modelo de lenguaje correspondientes a los tokens de las etiquetas (letras A-Z, a-z) en lugar de generar texto y parsearlo. La atencion es no causal, lo que permite que el estado y las instrucciones se condicionen mutuamente en una sola pasada.

Este repositorio concreto no reentrena ni modifica pesos: solo injerta metadatos en el GGUF mediante dos scripts (`graft_decision_metadata.py` y `graft_noncausal.py`) y anade la plantilla `systemone`, que reproduce byte a byte el layout de `qev/prompt.py` para `choice`, `noul` y `score`, envuelto en los marcadores de la plantilla de chat de Qwen. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO en el post-entrenamiento del modelo base.

## Capacidades

- Decision de eleccion multiple (`choice`): selecciona una opcion entre varias con etiqueta y descripcion, devolviendo una probabilidad por opcion.
- Puntuacion ordinal (`score`): asigna un nivel dentro de una escala definida por criterios ordenados, con valor esperado y nivel pico.
- Decision booleana (`noul`): responde si/no a una pregunta sobre el estado, con soporte de criterios personalizados.
- Entrada multimodal texto-imagen (`image-text-to-text`): la torre de vision Q8_0 procesa imagenes junto al estado textual, con `--image-min-tokens 1024` en la configuracion de referencia.
- Multiples preguntas por peticion: el campo `questions` admite varias decisiones (`route`, `urgency`, `angry`, `refund`) evaluadas sobre el mismo estado.
- Integracion como capa de decision en agentes: no genera texto libre, devuelve una lectura directa de logits, lo que reduce la latencia y elimina el parseo de salidas.
- Idioma: ingles unicamente segun la model card.
- No soporta tool calling ni function calling en el sentido habitual: la interfaz es el esquema `state`/`questions` del endpoint `/v1/systemone`.

## Casos de uso

- Triaje de tickets de soporte: se envia el texto del ticket como `state` y una pregunta `choice` con criterios (`billing`, `shipping`, `technical`); el modelo devuelve la probabilidad de cada cola. En la validacion, la ruta `billing` obtuvo 0,990 en CUDA con KV f16 frente a 0,999 de la referencia BF16.
- Priorizacion por urgencia: una pregunta `score` con escala ordinal ("can wait", "this week", "today", "right now") permite ordenar la cola de atencion sin un modelo generativo adicional.
- Deteccion de clientes enfadados para escalado: una pregunta `noul` ("Is the customer angry?") con umbral 0,5 acerto 8 de 8 estados en la validacion, lo que la hace util como disparador de escalado automatico a un humano.
- Enrutado de reembolsos con criterios personalizados: el tipo `noul` acepta criterios propios, evaluado en la validacion con 7/8 aciertos; util para decidir si un caso cumple la politica de devolucion antes de abrir expediente.
- Clasificacion de adjuntos en soporte: al ser `image-text-to-text`, permite incorporar capturas o fotos del producto enviadas por el cliente junto al texto del estado para decidir la categoria del caso.
- Capa de decision de baja latencia en pipelines de agentes: al leer logits en una sola pasada y no generar tokens, encaja como "system one" que resuelve decisiones rutinarias antes de invocar un LLM mayor, con el ahorro de coste correspondiente.
- Control de calidad y enrutado en produccion de contenidos: preguntas `score` sobre un estado permiten asignar niveles de revision sin escribir heuristicas ad hoc.
- Sustitucion de clasificadores supervisados: el modelo permite definir las categorias en el prompt en lugar de reentrenar un clasificador cuando cambian las etiquetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card incluye una validacion funcional contra la referencia `baselabs/elephant-1` en BF16 sobre CPU con OneJev `qev` (commit `81ce62f` + `serve.patch`, transformers 5.19, torch 2.14.1+cpu, `attention=noncausal`, `readout=slot_lm`, sin calibracion), frente a llama.cpp build 11858.

Peticion de referencia (estado de facturacion duplicada):

| Decision | qev BF16 | Este GGUF, CUDA, KV f16 | Este GGUF, Vulkan, KV q8_0 |
|---|---|---|---|
| `route` = billing | 0,999 | 0,990 | 0,993 |
| `urgency` (score) | 1,803 | 1,772 | 1,773 |
| `angry` (noul) | 0,778 | 0,760 | 0,752 |

Concordancia sobre 8 estados x 4 preguntas (32 decisiones):

| Build | Concordancia | Delta maximo de probabilidad |
|---|---|---|
| Q4_K_M (este fichero) | 28/32 (87,5%) | 0,260 |
| Q8_0, construido localmente | 29/32 (90,6%) | 0,198 |

Desglose por tipo: `choice` 8/8 identicas; `angry` (noul) 8/8 identicas en el umbral 0,5; `refund` (noul) 7/8, con el fallo correspondiente a un caso practicamente empatado en la referencia (0,530 frente a 0,412); en `score` el valor esperado se mantiene proximo, pero el nivel pico difiere en 3 casos casi empatados.

## Requisitos de hardware

- VRAM para pesos: 5,63 GB (Q4_K_M) + 0,62 GB (torre de vision Q8_0) = aproximadamente 6,25 GB, calculado a partir de los tamanos de fichero publicados.
- VRAM total estimada: 8-10 GB para 32.768 tokens con KV en f16 y `-fa on` (estimacion propia a partir del tamano de pesos; el modelo no publica cifras de cache KV). Con KV en q8_0 el consumo baja y fue la configuracion validada en Vulkan.
- GPU de consumo: si, cabe en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, RTX 4070 Ti Super) y con holgura en una RTX 4090 de 24 GB. En tarjetas de 8-12 GB es viable con contextos mas cortos o KV cuantizada (estimacion).
- GPU de datacenter: A100 y H100 no son necesarias para inference individual; su interes seria el batching a gran escala, sin datos de throughput publicados.
- Despliegue: `llama-server` de llama.cpp build b11820 o superior, con `--mmproj elephant-1.mmproj-Q8_0.gguf --mmproj-offload --image-min-tokens 1024 -c 32768 -fa on --jinja --cache-ram 0`. El log debe indicar `decision model type: openjev`.
- Orquestacion: la model card menciona llama-swap como consumidor del endpoint `/v1/systemone`.
- Otros runtimes: no hay informacion sobre soporte en vLLM, TGI u Ollama para el endpoint de decision; el formato GGUF y las claves `<arch>.decision.*` son especificos de llama.cpp.
- Latencia y throughput: no disponibles. La validacion se ejecuto en CUDA con KV f16 y en Vulkan con KV q8_0, sin cifras de tokens por segundo (el modelo no genera texto, solo lee logits).
- Nota operativa: pasar `--cache-ram 0` explicitamente si los flags del servidor habilitan la cache de prompt en RAM, porque los modelos de decision no usan cache de prompt por defecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Endpoint de decision | Licencia |
|---|---|---|---|---|---|
| `baselabs/elephant-1` (BF16) | 8,95B | no disponible | safetensors (BF16) | Si, via OneJev `qev` | MIT |
| `mradermacher/elephant-1-GGUF` | 8,95B | no disponible | GGUF (Q4_K_M, Q8_0) | No: sin claves de decision, el servidor responde 501 | MIT |
| `waseigo/elephant-1-decision-GGUF` | 8,95B | 32.768 en la config de referencia | GGUF Q4_K_M + mmproj Q8_0 | Si, `/v1/systemone` en llama.cpp | MIT |
| Qwen3.5-9B (base del post-entrenamiento) | ~9B | no disponible | no disponible en esta informacion | No: es un modelo de texto general | no disponible |

## Limitaciones y advertencias

- Modelo de decision, no de proposito general: no esta pensado para generar texto libre ni para mantener conversaciones; usarlo como chat produce resultados fuera de distribucion.
- Solo ingles: la model card declara unicamente `en`; no hay datos de rendimiento en castellano ni en otros idiomas.
- Deriva por cuantizacion: el Q4_K_M presenta una concordancia del 87,5% con la referencia BF16 y un delta maximo de probabilidad de 0,260; en `score` el nivel pico difiere en casos casi empatados. Para decisiones con umbrales ajustados conviene validar con el Q8_0 o con el BF16.
- Requiere llama.cpp reciente (b11820 o superior) y la build con soporte `OPENJEV`; versiones anteriores devuelven 501 o ignoran los metadatos.
- Dependencia de la plantilla: la primera subida del repositorio estaba incorrecta (usaba `{{ o.label }}`, que `OPENJEV` no proporciona, y el prompt se renderizaba sin letras de opcion, dando 0,513 frente a 0,999 de la referencia). Cualquier modificacion de `systemone.jinja` debe verificarse con `test-chat-template --no-common`.
- Fragilidad de formato: las diferencias de recorte de saltos de linea entre Jinja de transformers (`trim_blocks=True`) y minja de llama.cpp obligan a emitir `{{ '\n' }}` explicitamente; un cambio en el template puede concatenar opciones y alterar la decision.
- Atencion no causal: no usar el fichero sin la clave `qwen35.attention.causal = false`; el autor senala que la primera subida no la incluia.
- Riesgo de alucinacion acotado pero presente: al leer logits de etiquetas, el modelo puede repartir probabilidad entre opciones sin que ninguna sea correcta; no hay mecanismo de abstenccion documentado mas alla de las opciones y la temperatura de decision.
- Licencia MIT: permite uso comercial y modificacion, pero el autor del GGUF no ofrece garantias y la responsabilidad sobre el uso recae en el integrador; conviene conservar el aviso de copyright.
- Idiomas y sesgos: al no haber documentacion sobre la composicion del dataset de post-entrenamiento, no es posible evaluar sesgos sistematicos en las decisiones.
- Cero traccion verificable en el repositorio (0 descargas, 0 likes en el momento de la consulta), lo que implica ausencia de validacion por parte de terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/waseigo/elephant-1-decision-GGUF
- Modelo base: https://huggingface.co/baselabs/elephant-1
- GGUF de origen (pesos Q4_K_M y mmproj Q8_0): https://huggingface.co/mradermacher/elephant-1-GGUF
- La busqueda web realizada no devolvio resultados pertinentes (los enlaces obtenidos no guardan relacion con el modelo); no se han localizado papers, blogs, repositorios ni demos adicionales.
