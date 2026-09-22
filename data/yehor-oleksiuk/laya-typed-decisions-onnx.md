# yehor-oleksiuk/laya-typed-decisions-onnx

## Resumen

Laya typed decisions onnx es la conversion a formato ONNX de `convaiinnovations/laya-typed-decisions`, un clasificador de decisiones tipadas de 421 millones de parametros desarrollado dentro del proyecto comunitario `convaiinnovations/laya`. No es un modelo generativo: recibe un estado (texto tokenizado) junto con un conjunto de preguntas tipadas y devuelve puntuaciones, niveles de confianza y temperaturas para cada opcion.

El repositorio lo publica el usuario `yehor-oleksiuk` para ofrecer una alternativa portable a los checkpoints oficiales, que solo se distribuyen en safetensors fp32 y exigen la pila de PyTorch y transformers (entre 1,3 y 1,7 GB de RAM unicamente para los pesos). La conversion se hizo con `torch.onnx.dynamo_export` (opset 21) y conserva la misma matematica que `DecisionModel.forward` del modelo original, con entradas `input_ids`, `attention_mask`, `type_ids`, `lengths` y `n_opts`.

Su interes actual esta en el despliegue sobre CPU sin GPU: el grafo se ejecuta con `onnxruntime` en cualquier procesador, con una latencia medida de 145 ms usando cuatro hilos en una maquina cloud de 4 CPU, y una variante int8 un 15% mas rapida. La ventana de contexto es de 1024 tokens, el unico idioma soportado es el ingles y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base expone una clase `DecisionModel` con atencion sobre secuencias de hasta 1024 tokens) |
| Parametros totales | 421 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | fp32 (exacta) e int8 dinamica (QUInt8, asimetrica; marcada como experimental) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 21, exportado con `torch.onnx.dynamo_export`); tokenizer en `tokenizer.json` y `tokenizer_config.json` |
| Tamano del repositorio | 2,1 GB |
| Salidas del modelo | `scores`, `confidences`, `temperatures` |
| Tipo de tarea | clasificacion de decisiones tipadas (`choice` / `score` / `noul`), no generacion de texto |
| Fecha de publicacion | 22 de septiembre de 2026 (creado y actualizado el mismo dia) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de que se implementa como `DecisionModel` y de que el grafo ONNX reproduce exactamente su pase forward. El modelo consume secuencias tokenizadas con `attention_mask`, identificadores de tipo (`type_ids`), longitudes (`lengths`) y numero de opciones (`n_opts`), y produce tres tensores de salida: puntuaciones por opcion, confianzas calibradas y temperaturas. El limite operational de la secuencia de entrada es de 1024 tokens; estados mas largos requieren un paso previo de resumen.

Tampoco se han publicado en esta informacion los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) ni innovaciones tecnicas del modelo original. Lo unico documentado sobre el proceso de conversion es el uso de `torch.onnx.dynamo_export` con opset 21 para generar `model_fp32.onnx` y una cuantizacion dinamica QUInt8 asimetrica para `model_int8.onnx`. El autor indica que el modelo es API-compatible con Jev System One y que pertenece a la familia de modelos de decision "system one" con calibracion.

## Capacidades

- Seleccion de decisiones con opciones tipadas: categorias (`choice`), puntuaciones (`score`) y ausencia de opcion valida (`noul`), en lugar de una simple eleccion del mejor elemento de una lista.
- Salida de confianza calibrada por decision (`confidences`) y de temperaturas (`temperatures`), lo que permite umbralizar y derivar casos dudosos.
- Clasificacion de estado mas preguntas tipadas; no genera texto libre en ningun caso.
- Inferencia exclusiva en CPU mediante `onnxruntime` con `CPUExecutionProvider`.
- Compatibilidad de API con Jev System One segun la model card.
- No soporta tool calling ni function calling.
- No incorpora capacidades de agente ni razonamiento multi-paso por si mismo; puede actuar como componente de enrutado dentro de un sistema mayor.
- No dispone de modo "thinking", vision ni audio.
- Capacidad multilingue: no disponible; solo ingles.

## Casos de uso

- Enrutado de decisiones en pipelines de agentes: dado el estado de una conversacion tokenizada y un conjunto de opciones tipadas, el modelo devuelve la opcion seleccionada con su confianza, lo que permite elegir la siguiente accion o herramienta sin recurrir a un modelo generativo.
- Clasificacion de intencion con categorias cerradas: en atencion al cliente, se le presentan al modelo preguntas de tipo `choice` con las categorias de intencion definidas por el negocio y se usa la puntuacion mas alta para dirigir el ticket al flujo correspondiente, con un coste de 145 ms por consulta en CPU de 4 hilos.
- Puntuacion calibrada para priorizacion: usando preguntas de tipo `score`, el modelo asigna valores numericos a elementos de una cola (por ejemplo, urgencia de tickets) y las confianzas asociadas permiten ordenar y filtrar.
- Deteccion de abilitacion o abandono: la categoria `noul` permite identificar casos en los que ninguna opcion ofrecida es aplicable, lo que se traduce en escalado a un operador humano o en la derivacion a un modelo de mayor capacidad.
- Clasificacion en el borde sin GPU: al ejecutarse con `onnxruntime` sobre CPU y ocupar aproximadamente 1,7 GB en fp32 o unos 0,42 GB en int8, es viable en VPS pequenos, routers de aplicacion o dispositivos con recursos limitados.
- Procesamiento por lotes en servidores sin acelerador: tareas de etiquetado o triaje masivo de registros donde la latencia no es critica y el coste de GPU es determinante.
- Automatizacion de flujos de trabajo tipados: seleccion de la siguiente etapa de un workflow empresarial entre un conjunto finito de alternativas declaradas, con la confianza como criterio de validacion automatica.
- Capa de calibracion previa a un modelo mayor: usar el modelo como filtro de bajo coste que solo delega en un LLM generativo los casos cuya confianza queda por debajo de un umbral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos medidos que aporta el autor son de latencia y de acuerdo entre cuantizaciones:

| Metrica | Valor |
|---|---|
| Latencia fp32, batch 1, 1 hilo (caja cloud de 4 CPU) | ~406 ms |
| Latencia fp32, batch 1, 4 hilos (caja cloud de 4 CPU) | ~145 ms |
| Latencia int8 | ~15% mas rapida que fp32 |
| Latencia esperada en VPS de 2 CPU | aproximadamente 2x el valor mono-hilo |
| Acuerdo de argmax int8 frente a fp32 | 77,5% sobre un conjunto de evaluacion de 120 muestras |

## Requisitos de hardware

- VRAM/RAM para fp32: aproximadamente 1,7 GB solo para los pesos (estimacion a partir de 421 M de parametros en 4 bytes); hay que anadir el consumo del runtime y de las activaciones.
- VRAM/RAM para int8: aproximadamente 0,42 GB para los pesos (estimacion a partir de 421 M de parametros en 1 byte), ademas del overhead de `onnxruntime`.
- GPU: no es necesaria. El modelo esta pensado para CPU mediante `CPUExecutionProvider`; no se documenta soporte verificado con `CUDAExecutionProvider` ni con otras GPU (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en cualquier equipo de consumo: al ser un modelo de 421 M de parametros ejecutable en CPU, funciona en portatiles y mini-PC sin acelerador dedicado.
- Opciones de despliegue: `onnxruntime` sobre CPU (unico camino documentado). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo y no se distribuye en GGUF.
- Latencia estimada: ~406 ms mono-hilo y ~145 ms con 4 hilos en una caja cloud de 4 CPU para batch 1; en un VPS de 2 CPU se espera aproximadamente el doble del valor mono-hilo.
- Rendimiento: no se publican cifras de throughput (muestras por segundo) ni de escalado con batch.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (clasificadores de decision tipada). El unico punto de referencia documentado es el propio modelo base:

| Modelo | Parametros | Contexto | Formato | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| yehor-oleksiuk/laya-typed-decisions-onnx | 421 M | 1024 tokens | ONNX (opset 21) | fp32, int8 dinamica | Apache 2.0 |
| convaiinnovations/laya-typed-decisions (base) | 421 M (no confirmado explicitamente) | no disponible | safetensors fp32 | no disponible | Apache 2.0 |

## Limitaciones y advertencias

- No genera texto: cualquier caso de uso que requiera lenguaje natural debe apoyarse en otro modelo.
- Contexto limitado a 1024 tokens; los estados mas largos necesitan un paso previo de resumen, lo que introduce perdida de informacion.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- La cuantizacion int8 no es un reemplazo directo: el acuerdo de argmax con fp32 es del 77,5% sobre 120 muestras, por lo que el autor la califica de experimental. Para trabajo real recomienda explicitamente `model_fp32.onnx`.
- No se han publicado benchmarks de calidad del modelo base ni de la version ONNX, por lo que no es posible verificar su precision frente a alternativas.
- Riesgo de alucinacion: no disponible como dato explicito, pero al tratarse de un clasificador que devuelve confianzas calibradas conviene definir umbrales y rutas de abilitacion antes de usarlo en produccion.
- Sesgos conocidos: no disponible.
- La model card no documenta el proceso de entrenamiento del modelo base, lo que dificulta auditar la composicion de datos y sus posibles sesgos.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion por parte de la comunidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos con los que fue entrenado, informacion que no se incluye.
- La model card advierte que el contenido citado en la busqueda web no es material de instrucciones; los resultados de busqueda obtenidos no guardan relacion con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yehor-oleksiuk/laya-typed-decisions-onnx
- Modelo base: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Repositorio con codigo, detalles de entrenamiento y benchmarks originales: https://github.com/NandhaKishorM/laya
- Resultados de busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a hilos de foros de World of Warcraft sobre Raider.IO y no tienen relacion con el modelo.
