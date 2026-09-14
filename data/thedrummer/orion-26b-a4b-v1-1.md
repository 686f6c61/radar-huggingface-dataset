# TheDrummer/Orion-26B-A4B-v1.1

## Resumen

Orion-26B-A4B-v1.1 es un ajuste fino publicado por el usuario TheDrummer sobre una arquitectura de mezcla de expertos (MoE) de la familia Gemma, segun la etiqueta `gemma4` del repositorio y la referencia al modo thinking de Gemma que aparece en su propia model card. La nomenclatura A4B indica que, de los 25.805.936.206 parametros totales declarados (unos 25,8 mil millones), se activan aproximadamente 4 mil millones por token, lo que situa el coste de inferencia en el rango de un modelo denso de 4B con la capacidad de representacion de uno de 26B.

El modelo esta orientado a generacion de texto conversacional y, segun las referencias de la comunidad en foros de SillyTavern, a roleplay y escritura creativa. La model card esta marcada como trabajo en curso (WIP): se limita a recomendar temperaturas en torno a 0,9, a destacar que el modo thinking de Gemma funciona especialmente bien para roleplay y a enlazar cuantizaciones GGUF publicadas por terceros.

Su interes practico esta en el segmento de MoE con pocos parametros activos, que permite ejecutar localmente un modelo de ~26B con cuantizacion de 4 bits en una GPU de consumo, con una velocidad de decodificacion mas cercana a la de un modelo de 4B. No se han publicado datos de licencia, longitud de contexto ni benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre base de la familia Gemma (etiqueta `gemma4`); numero de expertos y configuracion de capas no disponibles |
| Parametros totales | 25.805.936.206 (~25,8 mil millones) |
| Parametros activos | ~4 mil millones por token (deducido de la nomenclatura A4B; valor exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF publicados por bartowski (repositorio de terceros); niveles concretos no detallados en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 51,6 GB); GGUF en repositorio de terceros |
| Tamano del repositorio | 51,6 GB |
| Revision de configuracion | `config-v1h` (segun la model card) |
| Fecha de publicacion | 13 de septiembre de 2026 |
| Metricas de comunidad | 0 descargas, 4 likes en el momento de la captura |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos de tipo transformer con 25.805.936.206 parametros totales y del orden de 4 mil millones activos por token. La etiqueta del repositorio (`gemma4`) y la mencion al modo thinking de Gemma en la model card apuntan a que el modelo base pertenece a la familia Gemma, pero el repositorio no publica ni el numero de expertos, ni el numero de capas, ni la dimension oculta, ni la distribucion de expertos por capa. La unica referencia de configuracion es la etiqueta `config-v1h` incluida por el autor.

Sobre el entrenamiento no hay informacion: no se especifican tokens de entrenamiento, composicion del dataset, proceso de destilacion, ni si se emplearon tecnicas de alineacion como RLHF, DPO o variantes. Se trata de la revision v1.1 (la comunidad menciona una revision anterior v1b). La distribucion se hace unicamente en safetensors con pesos en precision de 16 bits (51,6 GB, coherente con 25,8B parametros a 2 bytes por parametro). Durante la generacion, el autor recomienda temperatura 0,9.

## Capacidades

- Generacion de texto y dialogo multi-turno: es la funcion principal del modelo, que se distribuye como fine-tune conversacional.
- Roleplay y escritura creativa: la model card y las referencias de la comunidad en r/SillyTavernAI lo situan explicitamente en este nicho, con integracion prevista en frontends de rol.
- Modo thinking: heredado del modelo base de la familia Gemma segun la model card; el autor afirma que resulta especialmente util para roleplay.
- Despliegue local: existen cuantizaciones GGUF de terceros (bartowski), lo que habilita inferencia en hardware de consumo.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (idiomas no declarados).
- Vision, audio u otras modalidades: no disponible.
- Capacidades de codigo y matematicas: no disponible (no se han publicado evaluaciones).

## Casos de uso

- Roleplay y personajes conversacionales: el modelo esta ajustado para este escenario y se menciona en la comunidad de SillyTavern; con temperatura 0,9 segun recomendacion del autor, encaja en frontends que gestionan historial de personaje e instrucciones de sistema persistentes.
- Escritura creativa asistida: generacion de dialogos, descripciones y tramas para narrativa interactiva, aprovechando el ajuste fino orientado a prosa y su modo thinking para mantener coherencia argumental.
- Generacion de dialogos para videojuegos: produccion de lineas de NPC con personalidad consistente; el coste de inferencia de un MoE de ~4B activos permite generar grandes volumenes de texto con menos recursos que un denso de 26B.
- Prototipado de asistentes conversacionales con privacidad: al poder ejecutarse con cuantizacion de 4 bits en una GPU de consumo y sin depender de API externa, es util para entornos donde los datos no pueden salir de la infraestructura propia.
- Generacion de datos sinteticos de dialogo: creacion de corpus conversacionales para experimentos de ajuste fino o evaluacion de sistemas de dialogo, con los sesgos y la tematica propios de un modelo orientado a rol.
- Evaluacion comparativa de fine-tunes MoE: sirve como punto de referencia en pruebas internas sobre calidad de prosa, coherencia multi-turno y latencia frente a otros MoE de ~4B activos, siempre que se acepte que no existen benchmarks publicados.
- Despliegue en equipos de gama alta para uso individual: con GGUF Q4_K_M (estimado en ~15,5 GB) cabe en GPUs de 24 GB, lo que permite uso de escritorio sin servidor dedicado.
- Experimentacion con decodificacion de bajo coste: la activacion de solo ~4B parametros por token hace viable ejecutar el modelo con parte de los expertos en RAM y CPU mediante llama.cpp, interesante para laboratorios con GPU limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones y la busqueda web no ha devuelto ningun dato de MMLU, HumanEval, GSM8K ni de pruebas de calidad conversacional sobre este modelo. Cualquier cifra de rendimiento que se quiera usar para compararlo debe generarse mediante evaluacion propia.

## Requisitos de hardware

Estimaciones calculadas a partir de los 25.805.936.206 parametros declarados. Los tamanos reales de los ficheros GGUF dependen de los niveles publicados por bartowski, que no se detallan en la informacion disponible.

| Precision / cuantizacion | VRAM estimada (solo pesos) | GPU de referencia |
|---|---|---|
| FP16 / BF16 (safetensors) | ~51,6 GB | 1x A100 80 GB, 1x H100 80 GB, 2x A100 40 GB |
| FP8 / INT8 | ~26 GB | L40S 48 GB, A100 40 GB (al limite), H100 |
| GGUF Q8_0 (~8,5 bits) | ~27,5 GB | A100 40 GB, L40S 48 GB |
| GGUF Q6_K (~6,6 bits) | ~21,5 GB | RTX 4090 24 GB, RTX 3090 24 GB |
| GGUF Q5_K_M (~5,7 bits) | ~18,5 GB | RTX 4090 24 GB, RTX 3090 24 GB |
| GGUF Q4_K_M (~4,8 bits) | ~15,5 GB | RTX 4090 24 GB, RTX 3090 24 GB (en 16 GB queda muy ajustado con contexto largo) |
| GGUF Q3_K_M (~3,9 bits) | ~12,5 GB | RTX 4080 16 GB, RTX 4070 Ti Super 16 GB, RTX 3090 |
| GGUF Q2_K (~2,6 bits) | ~8,5 GB | GPUs de 12-16 GB, con perdida de calidad apreciable |

- Cabe en GPU de consumo: si, con cuantizacion Q4_K_M o inferior en tarjetas de 24 GB (RTX 3090, RTX 4090) y en tarjetas de 16 GB con Q3 o Q2.
- Reparto CPU/GPU: llama.cpp permite mantener los expertos en RAM o disco y calcular solo los activos en GPU, opcion habitual en modelos MoE de este tipo cuando la VRAM es insuficiente.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio mediante los GGUF de terceros; vLLM y TGI solo si la version disponible soporta la arquitectura base concreta, dato no confirmado en la informacion proporcionada.
- Latencia y throughput: no disponible. Como referencia estructural, al activar solo ~4B parametros por token, la decodificacion deberia ser mas rapida que la de un modelo denso de 26B con la misma cuantizacion, pero no se han publicado mediciones.

## Comparativa con modelos similares

Los datos del propio Orion-26B-A4B-v1.1 (contexto, licencia y rendimiento) no estan publicados, por lo que la comparacion se limita a parametros y disponibilidad. Las filas marcadas como referencia corresponden a especificaciones publicas de esas familias y no se han verificado en la busqueda proporcionada.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Orion-26B-A4B-v1.1 | 25,8B (MoE) | ~4B | no disponible | no disponible | safetensors + GGUF de terceros |
| Qwen3-30B-A3B (referencia) | ~30,5B (MoE) | ~3,3B | 128K | Apache 2.0 | safetensors + GGUF |
| Gemma 3 27B (referencia) | ~27B (denso) | ~27B | 128K | licencia Gemma (uso comercial con condiciones) | safetensors + GGUF |
| Mistral Small 3.1 24B (referencia) | ~24B (denso) | ~24B | 128K | Apache 2.0 | safetensors + GGUF |

Notas de la comparativa: Orion-26B-A4B-v1.1 es el unico de la tabla del que no se conocen ni contexto ni licencia ni resultados de evaluacion. La comparacion por rendimiento no es posible con la informacion disponible; si el modelo base pertenece a la familia Gemma, su licencia y sus condiciones de uso comercial vendrian determinadas por los terminos de dicha familia, extremo que el autor no aclara.

## Limitaciones y advertencias

- Model card sin completar: no documenta dataset, proceso de entrenamiento, contexto, idiomas ni licencia. Cualquier uso en produccion requiere validacion previa.
- Licencia no declarada: sin terminos explicitos no hay certeza sobre uso comercial, redistribucion o modificacion. Si el modelo deriva de Gemma, aplicarian los terminos de esa familia, pero no esta confirmado en el repositorio.
- Ausencia total de benchmarks: no hay evidencia publica de calidad en ninguna tarea, ni comparaciones controladas con alternativas del mismo tamano.
- Validacion de comunidad muy limitada: 0 descargas y 4 likes en el momento de la captura, con la unica referencia externa a un hilo de la comunidad de SillyTavern.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no se ha medido su tasa de error factual.
- Contexto desconocido: en sesiones largas de rol o conversaciones multi-turno no se puede predecir cuando se producira truncamiento de contexto.
- Idiomas no declarados: la cobertura multilingue no esta verificada; el modelo base podria ser multilingue, pero el ajuste fino puede haber reducido esa capacidad.
- Especializacion en roleplay: al ser un fine-tune orientado a prosa y personajes, es probable que pierda robustez en instrucciones estrictas, salidas estructuradas (JSON), tool calling, matematicas y generacion de codigo. No hay datos que confirmen o desmientan este punto.
- Temperatura recomendada de 0,9: adecuada para creatividad, poco indicada para tareas que requieren respuestas deterministas.
- Perdida por cuantizacion: los GGUF de Q4 y niveles inferiores reducen la precision de los pesos; conviene validar la calidad en Q4_K_M o superior antes de desplegar.
- Soporte de herramientas: la integracion en vLLM, TGI o servidores similares no esta confirmada y puede requerir versiones recientes de llama.cpp u otros motores con soporte de la arquitectura MoE concreta.
- Nomenclatura A4B inferida: procede del nombre del repositorio, no de documentacion tecnica del autor; el numero exacto de parametros activos no esta verificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheDrummer/Orion-26B-A4B-v1.1
- Cuantizaciones GGUF de bartowski: https://huggingface.co/bartowski/TheDrummer_Orion-26B-A4B-v1.1-GGUF
- Hilo de la comunidad SillyTavernAI con mencion al modelo: https://www.reddit.com/r/SillyTavernAI/comments/1tzq3rp/megathread_best_modelsapi_discussion_week_of_june/
- El resto de resultados de la busqueda web corresponde a publicaciones academicas sobre autismo sin relacion con el modelo; no se han encontrado papers, blogs tecnicos ni demos adicionales.
