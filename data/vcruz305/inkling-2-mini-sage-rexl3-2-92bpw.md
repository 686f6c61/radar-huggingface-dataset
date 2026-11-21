# vcruz305/Inkling-2-Mini-SAGE-REXL3-2.92bpw

## Resumen

Inkling-2-Mini-SAGE-REXL3-2.92bpw es una cuantizacion de 2,92 bits por peso del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario vcruz305 en Hugging Face. Se trata de un artefacto derivado, no de un modelo original: el trabajo del autor consiste en comprimir los pesos del modelo base mediante la tecnica SAGE-REXL3 y empaquetarlos en el formato EXL3 que consume la libreria exllamav3. El modelo resultante conserva la arquitectura Mixture-of-Experts (MoE) y la naturaleza image-text-to-text del original, con 5.248.192.896 parametros totales segun los safetensors del repositorio.

La relevancia de esta ficha es doble. Por un lado, documenta una via practica para ejecutar un modelo MoE multimodal en hardware de consumo: a 2,92 bpw, el repositorio ocupa 10,8 GB, un tamano manejable en GPUs con 12-16 GB de VRAM. Por otro, advierte de las limitaciones intrinsecas de una cuantizacion tan agresiva y de las restricciones de acceso, ya que el repositorio esta marcado como gated y requiere aceptar condiciones en Hugging Face.

No se dispone de informacion publica sobre el modelo base en la documentacion proporcionada (contexto, datos de entrenamiento, benchmarks), por lo que esta ficha distingue explicitamente entre lo verificado en los metadatos del repositorio y lo que queda como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal, segun tags del repositorio (tag `moe`); detalles internos no disponibles |
| Parametros totales | 5.248.192.896 (5,25 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 2,92 bits por peso (SAGE-REXL3); no se documentan otras variantes en este repo |
| Idiomas soportados | Ingles y multilingue (tags `en`, `multilingual`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con cuantizacion EXL3, libreria exllamav3 |
| Tamano del repositorio | 10,8 GB |
| Pipeline | image-text-to-text |
| Acceso | Restringido (gated), requiere aceptar condiciones |

## Arquitectura y entrenamiento

El repositorio no incluye informacion sobre la arquitectura interna del modelo base mas alla de los tags, que indican que se trata de un MoE multimodal con soporte de imagen y texto. El tag `inkling2_loop` sugiere un esquema de ejecucion recurrente o iterativo propio de la familia Inkling-2, pero no se detalla su funcionamiento. Tampoco se especifican el numero de expertos, el enrutador, la dimension oculta ni el mecanismo de atencion.

Respecto al entrenamiento, no hay datos disponibles sobre el numero de tokens, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas del modelo original. Lo unico verificable es el proceso de cuantizacion aplicado por el autor: SAGE-REXL3 a 2,92 bpw, una tecnica de compresion post-entrenamiento que reduce los pesos a menos de 3 bits por parametro para su uso con el runtime ExLlamaV3.

## Capacidades

- Generacion de texto conversacional en ingles y otros idiomas (tag `multilingual`).
- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`), lo que permite tareas de descripcion de imagenes, VQA y dialogos con soporte visual.
- Razonamiento multi-turno en formato conversacional.
- Ejecucion en el runtime ExLlamaV3, con soporte de cuantizacion EXL3.
- Capacidades de tool calling, agentes o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente visual en local: desplegar el modelo con ExLlamaV3 en una GPU de consumo para responder preguntas sobre imagenes (documentos escaneados, capturas de pantalla, fotos de producto) sin enviar datos a la nube, gracias al pipeline image-text-to-text.
- Chatbot multilingue de bajo coste: usar la variante cuantizada para servir conversaciones en ingles y otros idiomas en un servidor modesto, aprovechando que el repositorio ocupa solo 10,8 GB.
- Prototipado de agentes multimodales: integrar el modelo en un bucle de razonamiento que alterne texto e imagen durante el desarrollo, antes de migrar a una version de mayor precision si la calidad no es suficiente.
- Analisis de documentos con imagenes: extraer informacion de facturas, formularios o graficos combinando la entrada visual con instrucciones textuales, en un entorno controlado y con validacion posterior.
- Educacion y demostraciones: ejecutar el modelo en un portatil con GPU para talleres o clases sobre cuantizacion y modelos MoE, mostrando el impacto de 2,92 bpw en calidad y memoria.
- Investigacion sobre cuantizacion extrema: comparar las salidas de esta variante de 2,92 bpw con el modelo base sin cuantizar para medir la degradacion en tareas de vision y lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, y tampoco se dispone de datos del modelo base para establecer una comparacion.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 10,8 GB, por lo que se necesita al menos 12 GB de VRAM para cargar los pesos, mas overhead de contexto y cache KV; con contexto largo, 16 GB es un objetivo mas realista.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB) y A100/H100 para despliegues con mayor concurrencia.
- GPU de consumo: si cabe en tarjetas de 12-16 GB, como RTX 3060 de 12 GB (ajustado), RTX 4070 (12 GB, ajustado) y RTX 4080/4090 con margen.
- Opciones de despliegue: ExLlamaV3 es el runtime nativo para el formato EXL3; no se garantiza compatibilidad con llama.cpp, Ollama, vLLM o TGI, que no soportan EXL3 de forma nativa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Acceso |
|---|---|---|---|---|---|
| Inkling-2-Mini-SAGE-REXL3-2.92bpw | 5,25 mil millones (MoE) | no disponible | EXL3 2,92 bpw | Apache 2.0 | Gated |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | Original (sin cuantizar) | no disponible | no disponible |
| Otras variantes EXL3 de Inkling-2-Mini | no disponible | no disponible | EXL3 (varios bpw) | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas de otros desarrolladores en la misma categoria.

## Limitaciones y advertencias

- La cuantizacion a 2,92 bpw introduce degradacion de calidad respecto al modelo base; es previsible perdida de precision en tareas de razonamiento y vision, aunque no se han publicado mediciones.
- El repositorio esta marcado como gated: es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos, lo que puede bloquear pipelines automatizados.
- El formato EXL3 solo es compatible con ExLlamaV3; no se puede usar directamente con llama.cpp, Ollama o vLLM.
- No hay informacion sobre sesgos, tasas de alucinacion ni limitaciones de contexto o idioma del modelo base.
- Aunque la licencia declarada es Apache 2.0, conviene verificar las condiciones del modelo base thinkingmachines/Inkling-2-Mini, ya que las restricciones del original pueden prevalecer sobre las de la cuantizacion.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validacion comunitaria de su calidad ni de su correcto funcionamiento.
- Para produccion, se recomienda evaluar esta variante frente al modelo base sin cuantizar antes de adoptarla.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vcruz305/Inkling-2-Mini-SAGE-REXL3-2.92bpw
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Documentacion de ExLlamaV3: no disponible en la informacion proporcionada
- Paper o blog de SAGE-REXL3: no disponible en la informacion proporcionada
