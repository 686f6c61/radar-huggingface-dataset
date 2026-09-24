# violetxi/qwen35-9b-harvey-v4-notes-conditioned-100m

## Resumen

qwen35-9b-harvey-v4-notes-conditioned-100m es un ajuste fino completo (full-model, no LoRA) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario violetxi. Se trata de un checkpoint de servicio derivado de un experimento de internalizacion de notas: el entrenamiento combina un 70 % de tokens supervisados correspondientes a etiquetas de notas y un 30 % de etiquetas de asistente procedentes de trayectorias condicionadas por esas notas, sin regularizacion KL. El objetivo declarado es estudiar si el conocimiento contenido en notas externas puede internalizarse en los pesos del modelo en lugar de suministrarse en el contexto.

El repositorio publica la revision final `checkpoint-6134` (2 epocas, 6.134 actualizaciones de optimizador) y una revision intermedia `epoch1` / `checkpoint-3067`. El volumen de datos supervisados es de 99.998.917 tokens antes del desplazamiento causal (69.999.985 etiquetas de nota y 29.998.932 etiquetas de asistente), con una exposicion acumulada de 199.986.182 tokens tras el desplazamiento causal hasta ese checkpoint.

Su relevancia actual es fundamentalmente metodologica: documenta con detalle poco habitual la composicion del dataset, el esquema de perdida, la verificacion de la exportacion de tensores y los artefactos de evaluacion, lo que lo convierte en un caso util para investigacion sobre memoria parametrica y agentes con herramientas. No obstante, los resultados publicados en la evaluacion tipo Harvey son bajos (5,00 % de exito con presupuesto de 5 turnos y 8,00 % con 20 turnos), por lo que debe considerarse un artefacto de investigacion mas que un modelo listo para produccion. El modelo tiene 9.653.104.368 parametros segun los pesos safetensors y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no documenta la arquitectura interna; el modelo base es Qwen/Qwen3.5-9B) |
| Parametros totales | 9.653.104.368 (9,65 B), segun los pesos safetensors publicados |
| Parametros activos | no aplica / no disponible (no se documenta una configuracion de mezcla de expertos) |
| Longitud de contexto | no disponible (la secuencia empaquetada durante el entrenamiento fue de 16.384 tokens) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors de precision de servicio) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (4 shards compuestos, 775 tensores) |
| Modelo base | Qwen/Qwen3.5-9B, revision c202236235762e1c871ad0ccb60c8ee5ba337b9a |
| Tamano del repositorio | 38,6 GB |
| Clase de modelo en transformers | AutoModelForImageTextToText |
| Revisiones publicadas | main / final / checkpoint-6134 (epoca 2); epoch1 / checkpoint-3067 (epoca 1) |

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna del modelo (tipo de atencion, presencia de capas recurrentes, configuracion de expertos, etc.); se sabe que hereda la del modelo base Qwen/Qwen3.5-9B y que la clase de carga indicada por el autor es `AutoModelForImageTextToText`, lo que sugiere soporte multimodal en el modelo base, aunque este ajuste fino concreto solo declara la etiqueta de idioma `en` y la tarea `text-generation`.

En cuanto al entrenamiento, el proceso parte de Qwen/Qwen3.5-9B y entrena todos los parametros del modelo sobre un dataset de 99.998.917 tokens supervisados antes del desplazamiento causal: 69.999.985 tokens corresponden a etiquetas de nota y 29.998.932 a etiquetas de asistente extraidas de trayectorias condicionadas por notas, lo que da la mezcla 70/30 declarada. Las notas se entrenan con prediccion causal del siguiente token, mientras que la perdida de trayectoria se aplica unicamente a las etiquetas de asistente. La configuracion de optimizacion es: longitud de secuencia empaquetada 16.384, batch global de 4 filas empaquetadas, acumulacion de gradiente 1, tasa de aprendizaje 5e-06 y un esquema total de 2 epocas / 6.134 actualizaciones. Tras el desplazamiento causal quedan 99.993.091 tokens supervisados por epoca y una exposicion acumulada de 199.986.182 tokens en el checkpoint final. No se aplica regularizacion KL. La verificacion de exportacion indica que los 4 shards contienen 775 tensores, de los cuales 427 son tensores de texto entrenados y 348 son tensores auxiliares del modelo base preservados; todos los valores son finitos.

## Capacidades

- Generacion de texto y conversacion en ingles, con la clase `text-generation` declarada en la pipeline.
- Razonamiento agentico multi-turno mediante un protocolo de herramientas basado en `glob`, `grep` y `read`, tal y como se uso en las generaciones de evaluacion historicas con presupuestos de 5 y 20 turnos.
- Flujo de "notas" (notes-conditioned): el modelo fue entrenado para operar con etiquetas de nota y trayectorias derivadas de ellas, orientado a internalizar ese contenido.
- Recuerdo en modo closed-book: se ejecutaron 7.933 sondas de recuerdo con puntuacion determinista y sin juez GPT, cuyos resultados se publican como artefacto de evaluacion.
- Capacidades conversacionales basicas en ingles (etiqueta `conversational`).
- No se documentan capacidades de vision, audio, tool calling generico, function calling ni modos de pensamiento explicitos para este checkpoint concreto, mas alla del protocolo de herramientas usado en la evaluacion.
- Soporte multilingue limitado al ingles segun la etiqueta de idioma declarada.

## Casos de uso

- Investigacion sobre internalizacion de conocimiento: el modelo permite estudiar si el contenido de notas externas pasa a los pesos, comparando la revision `epoch1` (3.067 actualizaciones) con la final `checkpoint-6134` (6.134 actualizaciones) bajo el mismo esquema de datos.
- Reproduccion de experimentos de memoria parametrica: al publicarse la composicion exacta del dataset (70 % notas / 30 % trayectorias), la tasa de aprendizaje y el numero de actualizaciones, se puede replicar el entrenamiento y contrastar resultados.
- Prototipado de agentes de exploracion de repositorios: el protocolo `glob`/`grep`/`read` con 5 y 20 turnos es directamente reutilizable para construir y depurar bucles de agente sobre arboles de ficheros, asumiendo los bajos ratios de exito publicados.
- Evaluacion de memorizacion closed-book: las 7.933 sondas de recuerdo con puntuacion determinista sirven como banco de pruebas para medir cuanto conocimiento factual ha quedado codificado en los pesos.
- Generacion de texto tecnico en ingles: puede emplearse como modelo conversacional de 9,65 B en tareas de redaccion y resumen en ingles, dentro de un rango de tamano manejable en una sola GPU de 24 GB con cuantizacion.
- Punto de partida para ajuste posterior: al ser un checkpoint completo (no un adaptador), puede actuar como inicializacion para fine-tuning adicional en dominios especificos en ingles.
- Analisis de condicionamiento por contexto: comparar el rendimiento con y sin las notas en el contexto permite cuantificar cuanto del comportamiento depende del prompt frente a los pesos.

## Benchmarks y rendimiento

Los unicos datos de evaluacion publicados corresponden a la evaluacion tipo Harvey, regradada con gpt-5.6-sol y la rubrica original por criterio. La metrica es la fraccion de intentos que superan todos los criterios, sobre 250 tareas con 4 muestras cada una. Las generaciones usaron el protocolo historico de 5 y 20 turnos con `glob`/`grep`/`read`; no se ejecuto inferencia de benchmark nueva para esta publicacion.

| Presupuesto de turnos | Tasa de exito en todos los criterios | Conjunto de evaluacion |
|---|---:|---|
| 5 | 5,00 % | violetxi/harvey-eval-gpt56sol-qwen35-9b-notes70-notecondtraj30-100m-historical-5t-think |
| 20 | 8,00 % | violetxi/harvey-eval-gpt56sol-qwen35-9b-notes70-notecondtraj30-100m-historical-20t-think |

Adicionalmente se publicaron 7.933 sondas de recuerdo closed-book con puntuacion determinista y sin juez GPT. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 9,65 B de parametros (estimacion propia, no publicada por el autor): en fp16/bf16 en torno a 19-20 GB solo de pesos, con 22-26 GB contando cache KV y overhead; en int8 en torno a 10-12 GB; en int4 en torno a 5-7 GB.
- GPU de datacenter recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB para servicio concurrente en precision completa.
- GPU de consumo: cabe en RTX 4090 o RTX 3090 de 24 GB en fp16 con secuencias cortas y batch pequeno, y con holgura en int8 o int4.
- Opciones de despliegue confirmadas: transformers, con `AutoTokenizer` y `AutoModelForImageTextToText`, y `device_map="auto"` con `dtype="auto"`.
- Opciones de despliegue no confirmadas en el repositorio: vLLM, TGI, llama.cpp u Ollama. No se publican pesos GGUF, por lo que llama.cpp y Ollama requeririan una conversion propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos alternativos en la informacion proporcionada. La unica comparacion posible con datos verificables es frente al modelo base.

| Modelo | Parametros | Contexto | Evaluacion tipo Harvey (5 turnos) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| qwen35-9b-harvey-v4-notes-conditioned-100m | 9,65 B | no disponible (entrenamiento a 16.384) | 5,00 % | apache-2.0 | HuggingFace, 8 descargas |
| Qwen/Qwen3.5-9B (base) | no disponible en esta informacion | no disponible | no disponible | no disponible en esta informacion | HuggingFace |
| Otras alternativas de ~9 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion disponible modelos comparables de la misma categoria con datos de rendimiento publicados.

## Limitaciones y advertencias

- Ratios de exito muy bajos en la evaluacion publicada (5,00 % con 5 turnos y 8,00 % con 20 turnos sobre 250 tareas), lo que desaconseja su uso en produccion para tareas agenticas de alta exigencia.
- El modelo esta declarado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera degradado.
- Sesgos conocidos: no disponibles; el autor no publica analisis de sesgo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero es relevante en un modelo entrenado con un 70 % de tokens de nota y con sondas de recuerdo como principal mecanismo de verificacion.
- Limitaciones de contexto: la longitud de contexto del modelo base no se documenta en esta ficha; los 16.384 tokens corresponden a la longitud de secuencia empaquetada del entrenamiento, no necesariamente al maximo en inferencia.
- El repositorio tiene un volumen muy bajo de adopcion (8 descargas, 0 likes) y una unica autoria, por lo que no existe validacion independiente de los resultados.
- La evaluacion fue regradada con un modelo juez externo (gpt-5.6-sol) y no se ejecuto inferencia de benchmark nueva para esta publicacion, lo que limita la comparabilidad con otros modelos.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen/Qwen3.5-9B conviene verificar las condiciones de la licencia y los terminos del modelo base antes de un despliegue comercial.
- Los pesos se publican solo en safetensors de precision de servicio; no hay versiones cuantizadas oficiales, lo que anade trabajo de conversion para despliegues en hardware limitado.
- La busqueda web asociada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados tratan sobre peliculas de artes marciales y no guardan relacion con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-harvey-v4-notes-conditioned-100m
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- README de evaluaciones del autor: https://huggingface.co/violetxi/qwen35-9b-harvey-v4-notes-conditioned-100m/blob/main/evals/harvey-20260923/README.md
- Dataset de evaluacion, 5 turnos: https://huggingface.co/datasets/violetxi/harvey-eval-gpt56sol-qwen35-9b-notes70-notecondtraj30-100m-historical-5t-think
- Dataset de evaluacion, 20 turnos: https://huggingface.co/datasets/violetxi/harvey-eval-gpt56sol-qwen35-9b-notes70-notecondtraj30-100m-historical-20t-think
- Dataset de sondas de recuerdo closed-book: https://huggingface.co/datasets/violetxi/harvey-eval-recall-qwen35-9b-notes70-notecondtraj30-100m-think
- Paper, blog o repositorio adicional: no disponible
- Demo: no disponible
