# ZefanCai/Open-Jev-9B

## Resumen

Open-Jev-9B es un adaptador LoRA acompanado de una cabeza de decision escalar, publicado por el usuario ZefanCai sobre el modelo base Qwen/Qwen3.5-9B. No es un modelo generativo: no produce respuestas autoregresivas, sino que puntua directamente un conjunto de candidatos proporcionado por quien realiza la llamada y devuelve decisiones tipadas. Su interfaz define tres tipos de salida: Choice (distribucion de probabilidad sobre un conjunto de candidatos y el candidato mas probable), Noul (probabilidad para una pregunta de si/no) y Score (probabilidad sobre niveles ordinales junto con su valor esperado).

El artefacto publicado es un checkpoint de decision completo, no pesos fusionados ni un modelo autonomo: requiere la revision exacta del modelo y tokenizador upstream `c202236235762e1c871ad0ccb60c8ee5ba337b9a` y el cargador propio del proyecto Open-Jev. Una llamada generica a `AutoPeftModel` para generacion de texto no implementa esta interfaz ni aplica la cabeza de decision separada ni la temperatura guardada.

Su relevancia actual radica en el enfoque: sustituye la generacion de texto por puntuacion calibrada de decisiones, con un error de calibracion (ECE) de 0,007707 en el split de test. El entrenamiento cubre 20.204 pasos de optimizador con batch global 4, lo que supone 80.816 filas consumidas en una pasada completa sobre el split congelado `release-v2`. La comunidad apenas lo ha adoptado todavia (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 8, alpha 16) sobre el backbone de texto de Qwen/Qwen3.5-9B, mas una cabeza escalar de decision entrenada conjuntamente |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen/Qwen3.5-9B tiene 9B de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens de entrada por cada candidato puntuado de forma independiente |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA y cabeza escalar; no se distribuyen pesos fusionados) |

## Arquitectura y entrenamiento

El modelo combina dos componentes sobre el backbone de texto de Qwen/Qwen3.5-9B: un adaptador LoRA de rango 8 y alpha 16, y una cabeza escalar de decision inicializada a partir del readout preentrenado "Yes minus No" y entrenada de forma conjunta con el LoRA. La funcion del conjunto no es generar tokens, sino proyectar el estado del backbone sobre probabilidades tipadas segun el tipo de pregunta declarado por el llamante (Choice, Noul o Score). La temperatura guardada es 1,8969118766347646 y se ajusto unicamente sobre 512 filas de calibracion.

El entrenamiento consta de 20.204 pasos de optimizador con batch global 4, equivalentes a 80.816 filas consumidas en una unica pasada completa sobre el split de entrenamiento congelado `release-v2`. El commit de origen del entrenamiento es `99e881108c6cacadafd364088505e84975ca43fc` y el manifiesto de datos congelado tiene SHA-256 `56105dc9fc89ef74919f5beb60bb6ae8c6e17bb95699dab59205f67d8b338d97`. El repositorio publico de dataset ofrece la proyeccion `release-v2-redistributable`, cuyo split de entrenamiento contiene 79.116 filas, 1.700 menos que el conjunto original, ya que se excluyeron los registros de `wikispeedia-v1` al no haberse confirmado permiso de redistribucion; por tanto, no es identico byte a byte al conjunto de 80.816 filas usado para estos pesos. La expansion posterior de navegador/dron y los cinco corpus posteriores de control de extraccion no forman parte de esta mezcla de entrenamiento.

## Capacidades

- Decision de eleccion (Choice): devuelve una distribucion de probabilidad sobre el conjunto de candidatos suministrado y el candidato mas probable.
- Decision binaria (Noul): devuelve una probabilidad para una pregunta de si/no.
- Puntuacion ordinal (Score): devuelve probabilidades sobre niveles ordinales suministrados y su valor esperado.
- Puntuacion de candidatos sin generacion autoregresiva de respuestas, con interfaz HTTP en el endpoint `/v1/systemone`.
- Instrucciones y criterios por pregunta: el llamante puede declarar tipo, instrucciones y criterios de cada etiqueta.
- Calibracion supervisada: incorpora una temperatura guardada y metricas de calibracion (ECE, Brier, NLL) sobre los splits evaluados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no ejecuta las acciones propuestas.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles; el adaptador se dirige al backbone de texto.

## Casos de uso

- Clasificacion de intencion en atencion al cliente: el ejemplo del README envia un estado textual ("I was charged twice and want a refund") y un conjunto de intenciones candidatas (`billing`, `technical`, `other`), obteniendo una distribucion de probabilidad sobre ellas. Es adecuado porque el modelo puntua etiquetas declaradas en lugar de generar texto libre.
- Enrutado de tickets y colas de soporte: la salida Choice permite derivar el ticket a un equipo concreto usando el candidato mas probable y un umbral de confianza sobre la distribucion.
- Decisiones binarias en validacion de flujos: la salida Noul devuelve una probabilidad de si/no, util para compuertas de aceptacion o rechazo en pipelines automatizados donde se necesita una puntuacion y no una respuesta redactada.
- Encuestas y escalas ordinales: la salida Score devuelve probabilidades sobre niveles ordinales y su valor esperado, aprovechable para estimar puntuaciones medias tipo satisfaccion o prioridad sin post-procesar texto generado.
- Reranking de respuestas candidatas: dado un conjunto de respuestas suministradas por otro sistema, el adaptador puede puntuar cada candidato de forma independiente (hasta 4096 tokens por candidato) y seleccionar el mas probable.
- Componente de decision en agentes multi-paso: al no generar texto, encaja como modulo de scoring dentro de un orquestador externo que aporte los candidatos y ejecute las acciones; el servidor devuelve claves declaradas y probabilidades, pero no ejecuta las acciones propuestas.
- Anotacion asistida con control de calibracion: el ECE de 0,007707 en test permite usar las probabilidades como señal de confianza para revision humana en tareas de etiquetado.

## Benchmarks y rendimiento

La informacion proporcionada no incluye resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Se publica una evaluacion completa sobre datos retenidos que cubre 10.532 registros de test mas 15.920 fuera de distribucion (OOD), en total 26.452 registros, sin registros ausentes, duplicados ni fallos de inferencia. Los cinco hashes de los ficheros de inferencia coinciden con los pesos y metadatos publicados.

| Split | Filas totales | Correctas duras / filas duras | Precision dura | Precision esperada | NLL | Brier | ECE |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Test | 10.532 | 9.799 / 10.046 | 97,54% | 94,72% | 0,130947 | 0,039113 | 0,007707 |
| OOD | 15.920 | 14.205 / 15.446 | 91,97% | 90,40% | 0,299441 | 0,126647 | 0,037398 |

La precision dura excluye las filas con objetivos suaves (soft targets). La precision esperada es la masa del objetivo de referencia en el candidato elegido sobre todas las filas; no es una tasa de victoria en un juego ni de finalizacion de un flujo de trabajo. NLL, Brier y ECE usan todas las filas y la calibracion guardada. No se evaluo ninguna linea base sobre los datos completos, por lo que esta tabla no establece la ganancia aportada por el entrenamiento. El paquete original conserva ademas metricas muestreadas separadas de 512 registros de test y 512 OOD en `package/metrics.json`, que no deben confundirse con la tabla anterior.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, un modelo de 9B en bf16 ronda los 18 GB solo en pesos, a lo que se suman adaptador, cache KV y activaciones para entradas de hasta 4096 tokens.
- GPU recomendadas: el README indica usar una GPU adecuada con `--device cuda:0`; se citan como ejemplos habituales para este tamano A100 (40/80 GB), H100 y, con margen ajustado, RTX 4090 de 24 GB en bf16 y batch 1. No hay especificacion oficial de modelos soportados.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; con 9B en bf16 y batch 1 la RTX 4090 queda en el limite. No se documentan opciones de cuantizacion que reduzcan el requisito.
- Opciones de despliegue: unicamente el servidor propio del proyecto, `python -m jev.server --checkpoint ... --device cuda:0 --max-length 4096 --batch-size 1 --no-prefix-cache --host 127.0.0.1 --port 8791`. Requiere Transformers 5.10.2 y PEFT 0.19.1 (extra `train` del repositorio). No se soportan vLLM, llama.cpp, Ollama ni TGI, y una llamada estandar de generacion de texto con `AutoPeftModel` no implementa la interfaz.
- Cache de prefijos: opcional y desactivada en el ejemplo; la validacion A/B en GPU con el checkpoint real queda como tarea separada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- |
| Open-Jev-9B | 9B en el modelo base; adaptador LoRA r8/alpha 16 + cabeza escalar | 4096 tokens por candidato | Decisiones tipadas (Choice, Noul, Score) | Apache 2.0 | Adaptador en HuggingFace, requiere cargador propio |
| Qwen/Qwen3.5-9B | 9B | No disponible | Generacion de texto autoregresiva | No disponible en la informacion facilitada | Modelo base upstream |
| Otros adaptadores de decision tipada comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica alternativa identificable en la informacion disponible es el propio modelo base Qwen/Qwen3.5-9B, del que Open-Jev-9B hereda el backbone pero al que sustituye la interfaz generativa por puntuacion de candidatos. No se dispone de datos de comparacion con otros cabezales de decision o clasificadores basados en LLM.

## Limitaciones y advertencias

- El repositorio contiene un adaptador y una cabeza de decision, no pesos fusionados ni un modelo autonomo; no puede usarse como sustituto directo del modelo base.
- Requiere la revision exacta `c202236235762e1c871ad0ccb60c8ee5ba337b9a` del modelo y tokenizador upstream y el cargador del proyecto Open-Jev. Una llamada generica de generacion de texto no aplica la cabeza de decision ni la temperatura guardada.
- Longitud maxima de 4096 tokens por candidato puntuado de forma independiente; la entrada se rechaza en lugar de truncarse silenciosamente, lo que exige controlar el tamano en el cliente.
- El servidor devuelve claves declaradas y probabilidades, pero no ejecuta las acciones propuestas; cualquier accion derivada requiere logica externa.
- No se evaluo ninguna linea base sobre los datos completos, por lo que no se puede atribuir la ganancia de rendimiento al entrenamiento con los datos publicados.
- El conjunto de datos redistribuible (79.116 filas) no es identico byte a byte al usado en el entrenamiento (80.816 filas), ya que excluye 1.700 registros de `wikispeedia-v1` por permisos no confirmados. La expansion posterior de navegador/dron y los cinco corpus de control de extraccion no forman parte de esta mezcla.
- La temperatura guardada (1,8969118766347646) se ajusto solo sobre 512 filas de calibracion; la calibracion en dominios muy distintos puede degradarse, como sugiere el salto de ECE entre test (0,007707) y OOD (0,037398).
- Riesgo de sesgo y de alucinacion: no se documentan analisis de sesgo. Al no generar texto, el riesgo de alucinacion se traslada a la asignacion de probabilidad sobre candidatos fuera de distribucion.
- Idiomas soportados y sesgos por idioma: no disponibles.
- Restricciones de licencia: el adaptador se publica bajo Apache 2.0, pero el uso comercial esta tambien sujeto a los terminos del modelo base Qwen/Qwen3.5-9B, cuya licencia no se detalla en la informacion facilitada.
- Adopcion practicamente nula (0 descargas, 0 likes) y sin validacion independiente publicada; el propio README advierte que la validacion A/B en GPU con el checkpoint real queda pendiente.
- No se documentan soporte de cuantizacion ni integraciones con servidores de inferencia estandar (vLLM, TGI, llama.cpp, Ollama), lo que limita su despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZefanCai/Open-Jev-9B
- Repositorio del cargador y servidor Open-Jev: https://github.com/Zefan-Cai/Open-Jev
- Dataset publico: https://huggingface.co/datasets/ZefanCai/Open-Jev (proyeccion `release-v2-redistributable`)
- Provenance del paquete: `package/provenance.json` dentro del repositorio del modelo
- Resultados completos legibles por maquina: `evaluation/full-data.json` dentro del repositorio del modelo
- Manifiesto de release: `release-manifest.json` en la raiz del repositorio del modelo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a paginas de soporte de Microsoft sin relacion con el artefacto.
