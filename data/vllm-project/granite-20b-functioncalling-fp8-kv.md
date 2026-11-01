# vllm-project/granite-20b-functioncalling-FP8-KV

## Resumen

Granite-20B-FunctionCalling es un modelo de lenguaje de 20.368.983.040 parametros desarrollado por IBM Research, especializado en *function calling* (llamada a funciones o herramientas). Se obtiene mediante ajuste fino del modelo base `ibm-granite/granite-20b-code-instruct` con un enfoque de aprendizaje multitarea sobre siete tareas fundamentales del paradigma de invocacion de funciones: llamada anidada, encadenamiento de funciones, llamadas paralelas, deteccion de nombre de funcion, deteccion de pares parametro-valor, seleccion de la siguiente mejor funcion y generacion de respuesta. Se publico el 9 de julio de 2024 bajo licencia Apache 2.0.

El checkpoint concreto de este repositorio, `vllm-project/granite-20b-functioncalling-FP8-KV`, no es el modelo original: es una copia en formato cuantizado FP8 (con KV cache tambien en FP8) generada por el equipo de vLLM a partir de `mbayser/granite-20b-functioncalling-FP8-KV`, que a su vez deriva del modelo original de IBM. El proposito de esta copia es servir como checkpoint de referencia en la integracion continua de vLLM, reduciendo el riesgo de cadena de suministro al no depender de una cuenta personal. El tag `compressed-tensors` confirma que se trata de un artefacto cuantizado compatible con el ecosistema de compresion de vLLM.

La relevancia actual del modelo radica en su enfoque especifico hacia el *tool calling* como capacidad de primer nivel, en un momento en que los agentes basados en LLM y las arquitecturas de orquestacion de herramientas (function calling, MCP, pipelines de agentes) son centrales en el desarrollo de aplicaciones. Al estar disponible en FP8 con KV cache cuantizada, reduce los requisitos de memoria respecto al modelo en BF16, lo que facilita su despliegue en infraestructura de inferencia estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia GPT BigCode, `gpt_bigcode`) |
| Parametros totales | 20.368.983.040 (~20,4 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (pesos) y KV cache en FP8; formato `compressed-tensors` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizado, `compressed-tensors`) |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura transformer decoder-only de la familia `gpt_bigcode`, heredada de `granite-20b-code-instruct`. El ajuste fino se realizo mediante un enfoque de aprendizaje multitarea sobre siete tareas granulares del paradigma de function calling, segun se describe en el paper *Granite-Function Calling Model: Introducing Function Calling Abilities via Multi-task Learning of Granular Tasks* (arXiv:2407.00121). Este diseno descompone la tarea compleja de invocar funciones en subtareas mas simples, lo que permite al modelo aprender representaciones mas robustas de la seleccion de funciones, la extraccion de argumentos y el encadenamiento de llamadas.

El checkpoint de este repositorio aplica cuantizacion FP8 a los pesos y a la KV cache, lo que reduce la huella de memoria en inferencia. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO especificas. La copia fue realizada por vLLM el 30 de octubre de 2026 a partir del commit `b46a2d2` del repositorio original en una cuenta personal.

## Capacidades

- Generacion de texto y razonamiento orientado a tareas de invocacion de funciones.
- Function calling estructurado: el modelo emite llamadas en el formato `<function_call> {"name": ..., "arguments": {...}}`.
- Llamada anidada de funciones (nested function calling).
- Encadenamiento de funciones (function chaining) para resolver tareas multi-paso.
- Llamadas paralelas a multiples funciones en una sola respuesta.
- Deteccion de nombre de funcion a partir de la consulta del usuario y del esquema de funciones disponibles.
- Deteccion de pares parametro-valor para construir los argumentos de la llamada.
- Seleccion de la siguiente mejor funcion (next-best function) en flujos de agente.
- Generacion de respuesta final a partir del resultado devuelto por la funcion.
- Soporte de plantilla de chat mediante `apply_chat_template` con payload de funciones serializadas.
- Capacidades de codigo heredadas del modelo base `granite-20b-code-instruct` (no verificadas en detalle en la informacion disponible).
- Capacidades multilingues: no disponible.

## Casos de uso

- Atencion al cliente automatizada con backend de herramientas: el modelo interpreta la consulta del usuario, selecciona la funcion adecuada (consulta de pedidos, estado de envio, cambios de direccion) y construye los argumentos en JSON, integrandose con un orquestador que ejecuta la llamada y devuelve el resultado para que el modelo genere la respuesta final.
- Agentes de automatizacion de tareas empresariales: gracias a su soporte de encadenamiento de funciones, puede resolver flujos como "consulta el stock, reserva el articulo y envia la confirmacion", invocando secuencialmente varias herramientas.
- Asistentes de desarrollo integrados en IDE: el modelo puede decidir que herramienta del entorno (busqueda de simbolos, ejecucion de tests, consulta de documentacion) invocar en cada paso, y encadenar llamadas para tareas de refactorizacion o depuracion.
- Orquestacion de pipelines de datos: seleccion de la siguiente operacion (consulta SQL, transformacion, validacion) y generacion de los parametros correspondientes a partir de una descripcion en lenguaje natural.
- Automatizacion de back-office con APIs: mapeo de peticiones en lenguaje natural a llamadas a APIs REST internas, con deteccion de parametros y validacion de esquemas.
- Agentes de investigacion y recuperacion de informacion: uso de llamadas paralelas para consultar multiples fuentes o herramientas simultaneamente y sintetizar la respuesta final.
- Despliegue en infraestructura de inferencia con vLLM: al ser un checkpoint FP8 con KV cache cuantizada, es adecuado para servir en produccion con menor uso de memoria y mayor throughput que la version BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 20,4 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica se recomienda un minimo de 24-32 GB de VRAM para contexto moderado.
- En BF16 (modelo original) los pesos ocuparian del orden de 40,7 GB, por lo que el checkpoint FP8 reduce aproximadamente a la mitad el requisito de memoria de pesos.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB), L40S (48 GB) para despliegue en produccion; en consumer, RTX 4090 (24 GB) puede ser ajustada para FP8 con contexto limitado, y RTX 3090 (24 GB) de forma mas restrictiva.
- Despliegue: el checkpoint esta pensado para vLLM (soporte de `compressed-tensors` y KV cache FP8). Otras opciones como TGI o llama.cpp requeririan conversion adicional, no documentada en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| granite-20b-functioncalling (este, FP8-KV) | ~20,4 B | no disponible | Function calling multitarea | Apache 2.0 | HuggingFace (copia vLLM) |
| granite-20b-code-instruct (base) | ~20 B | no disponible | Codigo e instrucciones | Apache 2.0 | HuggingFace (IBM) |
| Alternativas de function calling de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo con otros modelos de function calling, por lo que la comparativa se limita a la relacion con el modelo base del que deriva.

## Limitaciones y advertencias

- Es un checkpoint cuantizado en FP8: la cuantizacion puede introducir degradacion en la calidad de las respuestas respecto al modelo original en BF16, especialmente en tareas de razonamiento complejo.
- El modelo esta especializado en function calling; su rendimiento en tareas generales de chat o conocimiento factual puede ser inferior al de modelos de proposito general del mismo tamano.
- Riesgo de alucinacion en la generacion de nombres de funciones o argumentos, especialmente si el esquema de funciones es ambiguo o muy extenso.
- No se dispone de informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento, lo que limita la evaluacion de riesgos.
- La longitud de contexto no esta documentada en la informacion disponible; conviene verificarla antes de disenar flujos con historiales largos.
- Los idiomas soportados no estan documentados; el modelo base es de codigo y el ajuste se realizo presumiblemente en ingles, por lo que el soporte de castellano no esta garantizado.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los terminos del modelo base y del paper asociado.
- Este repositorio es una copia de CI de vLLM, no la publicacion canonica; para produccion conviene referenciar el modelo original de IBM (`ibm-granite/granite-20b-functioncalling`).

## Enlaces

- HuggingFace (este checkpoint): https://huggingface.co/vllm-project/granite-20b-functioncalling-FP8-KV
- Repositorio original de la copia FP8-KV: https://huggingface.co/mbayser/granite-20b-functioncalling-FP8-KV
- Modelo original de IBM: https://huggingface.co/ibm-granite/granite-20b-functioncalling
- Modelo base: https://huggingface.co/ibm-granite/granite-20b-code-instruct
- Paper: https://arxiv.org/pdf/2407.00121v1
- arXiv (referencia): https://arxiv.org/abs/2407.00121
