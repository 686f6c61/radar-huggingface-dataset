# willspeak/nemotron-3.5-asr-streaming-0.6b-gguf

## Resumen

Esta ficha describe `willspeak/nemotron-3.5-asr-streaming-0.6b-gguf`, un espejo selectivo de ficheros (mirror) publicado por el usuario WillSpeak a partir del modelo `nvidia/nemotron-3.5-asr-streaming-0.6b` de NVIDIA, en su variante ya convertida a formato GGUF por `voconly-org`. No se trata de una publicacion original: el autor declara explicitamente que no reclama autoria del entrenamiento ni de la cuantizacion, y que se limita a replicar ficheros inalterados conservando la documentacion de las fuentes por trazabilidad. El parametro real declarado en safetensors para el modelo base es de 637.991.968 parametros, es decir, aproximadamente 0,6 mil millones.

Por el nombre del modelo base cabe situarlo en la categoria de reconocimiento automatico del habla (ASR) en streaming, con un enfoque orientado a transcripcion de baja latencia, aunque la informacion disponible no documenta la arquitectura concreta, los idiomas soportados ni las caracteristicas de entrenamiento. El repositorio ocupa 2,6 GB en total e incluye tres variantes de cuantizacion: Q5_K_M, Q8_0 y F16, con tamanos de fichero de aproximadamente 560 MB, 751 MB y 1,28 GB respectivamente.

Su relevancia practica es acotada pero clara: permite desplegar un modelo ASR de ~0,6B en entornos donde no se dispone de GPU dedicada, ya que las tres cuantizaciones caben sin dificultad en memoria de sistemas de gama de consumo. La licencia declarada en este espejo es `openmdw-1.1`, si bien la propia model card advierte que la tarjeta de la fuente GGUF contiene una etiqueta de licencia distinta, y que este espejo no pretende prevalecer sobre los derechos de los autores originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de reconocimiento automatico del habla en streaming; la informacion proporcionada no detalla la arquitectura interna) |
| Parametros totales | 637.991.968 (dato real declarado en safetensors para el modelo base) |
| Parametros activos | no aplicable (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (al ser ASR en streaming, la nocion de contexto de tokens no esta documentada en la informacion disponible) |
| Tipos de cuantizacion | Q5_K_M, Q8_0, F16 |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (segun este espejo; la model card advierte de una etiqueta de licencia diferente en la fuente GGUF) |
| Formato de pesos | GGUF (ficheros: `nemotron-3.5-asr-streaming-0.6b-Q5_K_M.gguf`, `nemotron-3.5-asr-streaming-0.6b-Q8_0.gguf`, `nemotron-3.5-asr-streaming-0.6b-F16.gguf`) |

Detalle de los ficheros espejados:

| Fichero | Tamano (bytes) | SHA-256 |
|---|---:|---|
| nemotron-3.5-asr-streaming-0.6b-Q5_K_M.gguf | 559.647.200 | `86429e8c4f7fdcf9b3312269ad1ca6669478ba7805331c4aea7a2e33e9910d65` |
| nemotron-3.5-asr-streaming-0.6b-Q8_0.gguf | 751.094.240 | `b94545b313b3223fda7b2857a52681da813935c2127643d1e9ff0c23d988089c` |
| nemotron-3.5-asr-streaming-0.6b-F16.gguf | 1.277.750.240 | `f21a0cea64d232981def7f8f2b7ab322459703a2e89359962c042c57159755b1` |

## Arquitectura y entrenamiento

No disponible. La informacion proporcionada no incluye detalles sobre la arquitectura del modelo (tipo de encoder, mecanismo de atencion, estrategia de streaming), el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO. El nombre del modelo base, `nemotron-3.5-asr-streaming-0.6b`, sugiere una especializacion en reconocimiento de voz con procesamiento incremental, pero esta interpretacion no esta respaldada por documentacion tecnica en los datos disponibles.

Tampoco se documenta el proceso de cuantizacion aplicado para generar los ficheros GGUF, mas alla de la identificacion de los tres niveles de precision disponibles. El mirror conserva la documentacion original y la de la fuente GGUF como ficheros separados, por lo que la informacion tecnica detallada debe consultarse en el repositorio de NVIDIA o en el repositorio de `voconly-org`.

## Capacidades

- Reconocimiento automatico del habla en streaming: el nombre del modelo base indica transcripcion de audio con procesamiento incremental, orientado a baja latencia.
- Transcripcion de audio a texto: capacidad principal deducible de la categoria del modelo.
- Formato GGUF: permite su carga en runtimes compatibles con este formato, sin necesidad de convertir pesos.
- Cuantizacion flexible: tres niveles disponibles (Q5_K_M, Q8_0, F16) que permiten ajustar el equilibrio entre precision y consumo de memoria.
- Soporte de tool calling / function calling: no disponible (no aplicable a un modelo ASR segun la informacion disponible).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se especifican los idiomas soportados.
- Capacidades de vision, audio generativo o modo thinking: no disponible.

## Casos de uso

- Transcripcion de reuniones en tiempo directo: un modelo ASR en streaming de ~0,6B puede alimentar sistemas de subtitulado en vivo o actas automaticas, procesando el audio por fragmentos a medida que llega en lugar de esperar al final de la grabacion.
- Subtitulado automatico de video: integrado en un pipeline de postproduccion, el modelo podria generar pistas de subtitulos a partir de la banda sonora, con la ventaja de que las variantes Q5_K_M y Q8_0 ocupan menos de 1 GB y pueden ejecutarse en maquinas de edicion sin GPU dedicada.
- Asistentes de voz para aplicaciones de escritorio: al caber en memoria de un portatil convencional, permite incorporar dictado por voz o comandos hablados en herramientas locales sin enviar audio a servicios externos.
- Analitica de centros de contacto: transcripcion de grabaciones de llamadas para su posterior analisis de calidad, busqueda por palabras clave o generacion de resumenes mediante un modelo de lenguaje aguas abajo.
- Accesibilidad para personas con dificultades auditivas: conversion de audio ambiente o de conversaciones presenciales en texto sobre el dispositivo, con la ventaja de que el procesamiento local evita la transmision de conversaciones privadas.
- Prototipado e investigacion en ASR: el modelo sirve como punto de partida para experimentar con decodificacion en streaming, comparar estrategias de cuantizacion (Q5_K_M frente a Q8_0 frente a F16) o evaluar el impacto de la precision en la tasa de error.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de un repositorio de podcasts o grabaciones para habilitar busqueda full-text sobre el contenido hablado.
- Integracion en dispositivos con recursos limitados: el tamano reducido de las cuantizaciones abre la puerta a despliegues en mini-PC, Raspberry Pi de gama alta o sistemas embebidos con suficiente RAM, siempre que el runtime GGUF elegido soporte la arquitectura del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye metricas de tasa de error de palabras (WER), latencia ni comparaciones con otros sistemas ASR. La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo: los enlaces obtenidos corresponden a contenido no relacionado con inteligencia artificial y han sido descartados por completo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB para la variante Q5_K_M, 0,8 GB para Q8_0 y 1,3 GB para F16, segun los tamanos de fichero declarados. A estas cifras hay que anadir el consumo del runtime y los buffers de audio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre es suficiente en principio; no se dispone de datos oficiales sobre GPUs validadas por NVIDIA para esta variante GGUF.
- Compatibilidad con GPU de consumo: si. Las tres cuantizaciones caben holgadamente en GPUs de gama de entrada y media (por ejemplo, series GTX 1050/1650 en adelante, RTX 3050, RTX 4060), asi como en iGPUs con memoria unificada suficiente.
- Ejecucion en CPU: viable, dado el reducido numero de parametros (637.991.968) y el tamano de los ficheros cuantizados. Se espera un rendimiento aceptable en CPU de escritorio moderna, aunque no se dispone de cifras de throughput medidas.
- Opciones de despliegue: los ficheros estan en formato GGUF, por lo que requieren un runtime que soporte dicha arquitectura. La informacion disponible no especifica que motores (llama.cpp, Ollama, whisper.cpp u otros) han sido validados con este modelo, por lo que la compatibilidad debe verificarse contra la documentacion de la fuente GGUF en `voconly-org`.
- Opciones de despliegue en servidor (vLLM, TGI): no disponible. Estos motores estan orientados a modelos de lenguaje y no se documenta soporte para este modelo ASR.
- Latencia y throughput estimados: no disponible. Al tratarse de un modelo de streaming, la latencia depende en gran medida del tamano de fragmento de audio configurado y del motor de inferencia empleado, parametros que no se detallan en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de rendimiento de todos los modelos de la tabla figuran como "no disponible": la informacion proporcionada no incluye benchmarks. Las cifras de parametros y licencias de los modelos alternativos proceden de su documentacion publica y no han sido verificadas en el contexto de esta busqueda.

| Modelo | Parametros | Tarea | Licencia | Disponibilidad | Rendimiento |
|---|---:|---|---|---|---|
| nemotron-3.5-asr-streaming-0.6b (este modelo, via espejo GGUF) | ~638 M | ASR en streaming | openmdw-1.1 (segun este espejo) | GGUF en este repositorio | no disponible |
| Whisper large-v3 (OpenAI) | ~1.550 M | ASR multilingue por lotes | MIT | Pesos originales y multiples conversiones GGUF | no disponible en esta comparativa |
| Whisper small / medium (OpenAI) | ~244 M / ~769 M | ASR multilingue por lotes | MIT | Pesos originales y multiples conversiones GGUF | no disponible en esta comparativa |
| Alternativas ASR en streaming de ~0,6B | no disponible | ASR | no disponible | no disponible | no disponible |

La diferencia mas relevante que puede afirmarse con la informacion disponible es de naturaleza estructural: este modelo esta disenado para streaming, mientras que la familia Whisper opera sobre ventanas de audio completas, lo que afecta a la latencia en aplicaciones en tiempo real. No es posible establecer comparaciones cuantitativas de precision sin datos de WER.

## Limitaciones y advertencias

- Modelo espejo, no original: el repositorio no aporta entrenamiento ni cuantizacion propios. Cualquier problema de calidad debe atribuirse al modelo base de NVIDIA o a la conversion GGUF de `voconly-org`, no al publicador de este espejo.
- Ambiguedad de licencia: la model card advierte explicitamente de que la tarjeta de la fuente GGUF contiene una etiqueta o declaracion de licencia diferente de la que figura en este espejo (`openmdw-1.1`). Antes de cualquier uso comercial es imprescindible revisar `LICENSE.txt` y `NOTICE.txt` en ambos repositorios y, en caso de duda, consultar al autor original.
- Ausencia total de documentacion tecnica en este repositorio: no se detallan idiomas soportados, arquitectura, datos de entrenamiento, ni condiciones de uso recomendadas. La documentacion del modelo original y de la fuente GGUF se conserva como ficheros separados y debe consultarse alli.
- Riesgo de alucinacion en transcripcion: los sistemas ASR pueden generar texto plausible en segmentos con ruido, musica o habla solapada. No se dispone de datos de WER que permitan acotar este riesgo.
- Idiomas no confirmados: al no especificarse los idiomas soportados, no puede asumirse cobertura multilingue ni un rendimiento homogeneo entre lenguas.
- Sin validacion de compatibilidad: no se indica que runtimes GGUF han sido probados con estos ficheros. Un fichero GGUF de un modelo ASR no es necesariamente cargable por los mismos motores que un modelo de lenguaje.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Fechas de metadatos anomales: el repositorio figura como creado el 2026-10-07, fecha que conviene verificar antes de citarla como referencia.
- Busqueda web sin resultados utiles: las consultas realizadas no devolvieron ninguna fuente tecnica sobre este modelo. Cualquier afirmacion adicional sobre su rendimiento requeriria consultar directamente el repositorio de NVIDIA.

## Enlaces

- Repositorio de este espejo GGUF: https://huggingface.co/willspeak/nemotron-3.5-asr-streaming-0.6b-gguf
- Modelo original de NVIDIA: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Fuente GGUF original: https://huggingface.co/voconly-org/nemotron-3.5-asr-streaming-0.6b-gguf
- Revision de la fuente declarada: `04f5d5db715acd085490116682742d415e4b2585`
- Ficheros de licencia en el repositorio: `LICENSE.txt` y `NOTICE.txt` (referenciados en la model card, no incluidos en la informacion proporcionada)
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre el modelo. Todas las URLs devueltas por la busqueda correspondian a contenido no relacionado con inteligencia artificial y han sido descartadas.
