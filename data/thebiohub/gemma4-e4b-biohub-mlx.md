# TheBioHub/gemma4-e4b-biohub-mlx

## Resumen

gemma4-e4b-biohub-mlx es un ajuste fino mediante LoRA de `google/gemma-4-e4b-it`, publicado por TheBioHub, orientado exclusivamente a invocar herramientas dentro de `biohub`, un paquete de Python que permite lanzar pipelines de bioinformatica en un cluster SLURM (ARC, Universidad de Calgary) describiendo en lenguaje natural lo que se quiere ejecutar. El modelo no es un asistente general: actua como capa conversacional de una superficie de herramientas fija, donde el enrutado de pipelines, las plantillas de scripts SLURM y la validacion de esquemas los controla el propio paquete, no el modelo.

La distribucion esta cuantizada a 4 bits en formato MLX, con 7.463.013.418 parametros totales y 3,9 GB en disco, para inferencia local en Apple Silicon. El objetivo declarado es que el modelo corra en el portatil del investigador: sin clave de API, sin servicio alojado y sin que los datos salgan de la sesion SSH del usuario. La nomenclatura E4B del modelo base sugiere una clase de 4.000 millones de parametros efectivos, si bien la informacion proporcionada no desglosa parametros activos.

El modelo se entreno con 1.000 conversaciones multi-turno sinteticas (900 de entrenamiento, 100 de validacion, 100 de prueba) generadas a partir de ejemplos semilla curados, y solo soporta ingles. Su relevancia actual es acotada y experimental: el repositorio acumula 0 descargas y 0 likes, no publica resultados de benchmarks y su formato de tool call no es el estandar, lo que exige un parser especifico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Gemma 4 (clase `Gemma4ForConditionalGeneration`); no se detallan mas especificaciones de arquitectura |
| Parametros totales | 7.463.013.418 |
| Parametros activos | no disponible (la nomenclatura E4B del modelo base sugiere ~4.000 millones efectivos, sin confirmar en la informacion disponible) |
| Longitud de contexto | no disponible (la longitud de secuencia maxima usada en el entrenamiento LoRA fue de 2.048 tokens) |
| Tipos de cuantizacion | 4 bits afines (MLX), group size 64; no hay build GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0, con enlace a la licencia de Gemma 4 (`https://ai.google.dev/gemma/docs/gemma_4_license`) |
| Formato de pesos | safetensors para MLX (`library_name: mlx`), cuantizado a 4 bits; tamano del repo 4,2 GB, 3,9 GB en disco |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-e4b-it` y se adapta con LoRA mediante `mlx_lm.lora`. La configuracion del adaptador es rango 16, dropout 0,05, escala 20,0, 16 capas adaptadas, 1.000 iteraciones, tasa de aprendizaje 1e-4, tamano de lote 4, longitud de secuencia maxima de 2.048 tokens y gradient checkpointing activado. El entrenamiento se ejecuto en un Mac Studio M3 Ultra. Posteriormente el adaptador se fusiono en el modelo base con `mlx_lm.fuse` y el resultado se cuantizo con `mlx_lm.convert -q --q-bits 4`.

Los datos de entrenamiento son 1.000 conversaciones multi-turno sinteticas (900/100/100 para entrenamiento, validacion y prueba) generadas a partir de ejemplos semilla curados que cubren envio en camino feliz, aclaracion de parametros ausentes, entrada ambigua y narracion de fallos. No se menciona RLHF, DPO ni ninguna innovacion de inferencia como decodificacion especulativa o atencion lineal. La particularidad tecnica mas relevante no es arquitectonica sino de formato: el ajuste produce un formato de tool call propio, distinto del estandar, con delimitadores `<|tool_call>` … `<tool_call|>` y un par de llaves redundante alrededor del objeto JSON de argumentos.

## Capacidades

- Rellenado de parametros (slot-filling) para las herramientas contra las que fue entrenado: `inspect_inputs`, `propose_pipeline`, `submit_pipeline`, `job_status`, `fetch_log`, `diagnose`, `check_outputs`, `cancel`, `arc` y `email_notify`.
- Tool calling y function calling con esquemas estilo OpenAI, emitidos en un formato propietario que requiere un parser especifico (`biohub/llm.py::_parse_tool_call`).
- Conversacion multi-turno para aclarar parametros ausentes o resolver entradas ambiguas antes de lanzar un trabajo.
- Narracion de resultados y de fallos: la prosa que acompana a una llamada a herramienta debe preservarse, ya que suele ser la unica explicacion que recibe el usuario de por que se ejecuto una herramienta.
- Direccionamiento de argumentos por ruta explicita (`input_dir`, `output_dir`, `directory`) o por nombre de ejecucion (`run_id`); los datos de entrenamiento usan la forma de ruta.
- Gestion del ciclo de vida de trabajos en SLURM: envio, consulta de estado, recuperacion de logs, diagnostico, cancelacion y notificacion por correo.
- No se le atribuyen capacidades de razonamiento general, codigo, matematicas, vision ni audio en la informacion disponible, mas alla de las heredadas del modelo base fuera del entorno para el que fue ajustado.

## Casos de uso

- Lanzamiento de pipelines de basecalling de Oxford Nanopore desde el portatil: el investigador describe en ingles lo que quiere ejecutar, el modelo rellena los parametros y llama a `submit_pipeline`, que el paquete traduce en un script SLURM a partir de plantillas ya probadas.
- Seguimiento de trabajos en el cluster: consultas de estado con `job_status` y recuperacion de logs con `fetch_log` para comprobar el avance de un basecalling o un demultiplexado.
- Diagnostico asistido de fallos: ante un error de ejecucion, el modelo llama a `diagnose` y narra en prosa la causa probable, que suele ser la unica explicacion disponible para el usuario.
- Aclaracion de peticiones incompletas: si el usuario no indica directorio de entrada o kit de secuenciacion, el modelo abre un turno de preguntas antes de emitir la llamada, evitando envios mal formados.
- Validacion de resultados: uso de `check_outputs` para confirmar que existen los ficheros esperados de control de calidad antes de dar por bueno un trabajo.
- Cancelacion y gestion de la cola: llamadas a `cancel` para liberar recursos del cluster cuando un trabajo se ha lanzado con parametros equivocados.
- Notificacion por correo: encadenar `email_notify` tras `submit_pipeline` para avisar al usuario cuando finaliza un trabajo largo, sin necesidad de mantener la sesion abierta.
- Entornos con datos sensibles: al ejecutarse en local sobre Apple Silicon y no requerir servicio alojado ni clave de API, encaja en flujos donde los datos genomicos no pueden salir de la sesion SSH del investigador.
- Prototipado de nuevas integraciones: el formato de tool call y los esquemas pueden reutilizarse como plantilla para entrenar adaptadores equivalentes sobre otros pipelines, teniendo en cuenta que el enrutado a otros pipelines existe pero no viene incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que el ajuste fine-tuned rinde por debajo del modelo base `google/gemma-4-e4b-it` en tareas generales cuando se usa fuera del entorno `biohub`, sin aportar cifras. Se generaron 100 ejemplos de validacion y 100 de prueba, pero no se publican metricas sobre ellos.

## Requisitos de hardware

- Solo Apple Silicon. El modelo no funciona en GPU NVIDIA ni en CPU x86 con las herramientas indicadas.
- Memoria unificada estimada: en torno a 4-5 GB para el modelo cuantizado a 4 bits (3,9 GB en disco) mas la cache KV, que depende de la longitud de contexto efectiva (no publicada; el entrenamiento uso secuencias de hasta 2.048 tokens).
- Hardware de referencia: Mac Studio M3 Ultra, la maquina usada para el entrenamiento LoRA; cualquier Mac con Apple Silicon y memoria unificada suficiente deberia poder ejecutarlo.
- Opciones de despliegue: `mlx_lm` (carga con `load`, generacion con `generate` y muestreo mediante `make_sampler`, ya que `generate()` no acepta el argumento `temp`). No hay soporte de vLLM, TGI, Ollama ni llama.cpp: no existe build GGUF porque llama.cpp todavia no soporta `Gemma4ForConditionalGeneration`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| gemma4-e4b-biohub-mlx | 7.463.013.418 totales | no disponible | safetensors MLX 4 bits | apache-2.0 (con enlace a licencia Gemma 4) | HuggingFace, solo Apple Silicon | sin benchmarks publicados; optimizado para el entorno `biohub` |
| google/gemma-4-e4b-it | no disponible | no disponible | no disponible | licencia Gemma 4 | HuggingFace | superior en tareas generales segun el autor |
| Otros modelos de tool calling de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio resultados relevantes sobre el modelo ni sobre alternativas comparables; los enlaces recuperados correspondian a contenido no relacionado (ARD Mediathek). No se dispone, por tanto, de datos de terceros para contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Exclusivo de Apple Silicon: no hay via de ejecucion en CUDA, ROCm ni CPU x86 con las herramientas documentadas, y no existe build GGUF.
- Formato de tool call no estandar: emite `<|tool_call>call:TOOL_NAME{{"arg": "value"}}<tool_call|>`, con delimitadores propios y un par de llaves redundante. Se debe parsear tal cual; intentar corregirlo rompe la integracion.
- Entrenado para un unico pipeline incluido, Griffin-Pipeline (basecalling y control de calidad de Oxford Nanopore), y para las convenciones de un unico cluster. Otros pipelines son reconocidos por el enrutador pero no vienen empaquetados.
- Las rutas, nombres de particion y comportamiento SLURM de los datos de entrenamiento son especificos de ARC en la Universidad de Calgary; no son trasladables sin ajuste.
- Fuera del entorno `biohub` rinde por debajo del modelo base en tareas generales; no debe usarse como asistente de proposito general.
- Es un modelo de clase 4B haciendo rellenado de ranuras estructurado: su fiabilidad depende de que el paquete que lo rodea lo restrinja, no de sus propias capacidades. No hay que confiar en su prosa como fuente de verdad sobre el estado real de un trabajo.
- La cuantizacion a 4 bits reduce la precision respecto al modelo fusionado.
- Solo ingles; no se declara soporte de otros idiomas.
- Riesgo de alucinacion en la narracion de resultados, el diagnostico de fallos y los valores de parametros cuando la peticion es ambigua.
- Posible discrepancia de licencia: el repositorio declara apache-2.0 pero enlaza a la licencia de Gemma 4, heredada del modelo base. Conviene revisar los terminos de Gemma 4 antes de un uso comercial.
- Proyecto sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los errores esten detectados por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheBioHub/gemma4-e4b-biohub-mlx
- Modelo base: https://huggingface.co/google/gemma-4-e4b-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paquete biohub (Snyder-Institute): https://github.com/Snyder-Institute
- Griffin-Pipeline: https://github.com/Snyder-Institute/Griffin-Pipeline
- Busqueda web: no se encontraron resultados relevantes sobre el modelo; los enlaces devueltos correspondian a contenido ajeno al modelo.
