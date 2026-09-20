# Vishva007/Qwen3.5-9B-W4A16-AutoRound

## Resumen

Vishva007/Qwen3.5-9B-W4A16-AutoRound es una version cuantizada del modelo base Qwen/Qwen3.5-9B, publicada por el usuario Vishva007. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos a 4 bits (W4A16) generada con AutoRound, el metodo de cuantizacion basado en descenso de gradiente de signo desarrollado por Intel. El objetivo es reducir el consumo de memoria de un modelo multimodal de ~9B parametros hasta aproximadamente la mitad respecto a la version en FP16, manteniendo la precision lo mas cerca posible del original.

La particularidad de esta publicacion es que no cuantiza todo el grafo: la torre de vision se conserva en bfloat16 (el parametro `quant_nontext_module` esta a `False`) y los modulos de prediccion multi-token (`mtp`, `mtp.fc`) tambien se mantienen en bfloat16 nativo. Es decir, se cuantizan los pesos de texto y se preservan en precision alta los componentes asociados a razonamiento visual y OCR, y a la decodificacion especulativa.

Es relevante ahora porque permite desplegar un modelo multimodal de ~9B en GPUs de gama media o consumer con backend vLLM o SGLang, sin renunciar a la torre de vision. Conviene advertir que la model card no incluye contexto, idiomas, ni resultados de benchmarks, y que los metadatos del repo presentan inconsistencias de tamano que se detallan mas abajo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Qwen3.5-9B (torre de vision + modulo de prediccion multi-token, MTP); detalle completo no disponible |
| Parametros totales | 2.491.309.296 segun los metadatos safetensors del repo; el modelo base se denomina "9B" en el nombre del repositorio (discrepancia no aclarada por el autor) |
| Parametros activos | No aplica (no consta que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A16 (pesos a 4 bits, activaciones en FP16) en formato AutoRound; group size 32; simetrica; torre de vision y modulos `mtp`/`mtp.fc` en bfloat16 |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | Safetensors (formato AutoRound) |
| Metodo de cuantizacion | AutoRound (Intel), 1000 iteraciones, 512 muestras de calibracion, longitud de secuencia 2048, torch compile activado |
| Modelo base | Qwen/Qwen3.5-9B |
| Tamano del repositorio | 57,7 GB |
| Descargas / likes | 226 descargas / 0 likes |
| Fecha de creacion | 2026-03-03 |
| Ultima actualizacion | 2026-09-19 |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen3.5-9B, que segun los indicios de la model card incluye una torre de vision (los terminos "visual reasoning" y "OCR precision" aparecen explicitamente) y un modulo de Multi-Token Prediction (`mtp` y `mtp.fc`), usado habitualmente para decodificacion especulativa o prediccion de varios tokens por paso. No se dispone de informacion sobre el numero de capas, dimension oculta, numero de cabezas de atencion, mecanismo de atencion ni tipo de positional encoding. Tampoco hay datos sobre el entrenamiento del modelo base: numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otra etapa de alineamiento. Todo ello debe consultarse en la model card de Qwen/Qwen3.5-9B.

Lo que si describe con detalle la model card es el proceso de cuantizacion. Se aplico AutoRound con configuracion de alta precision: 1000 iteraciones, 512 muestras de calibracion, longitud de secuencia 2048, cuantizacion simetrica y group size de 32. La torre de vision se excluyo de la cuantizacion (`quant_nontext_module: False`) y permanece en bfloat16, igual que los modulos de prediccion multi-token. Segun el autor, el resultado es una reduccion de memoria de aproximadamente el 50% frente al base en FP16. No hay ninguna innovacion arquitectonica propia de esta publicacion: es exclusivamente una conversion de pesos.

## Capacidades

- Generacion de texto y razonamiento en lenguaje natural, heredados del modelo base Qwen3.5-9B (no verificados de forma independiente en esta publicacion).
- Vision y OCR: la torre de vision se mantiene en bfloat16 precisamente para preservar "razonamiento visual y precision de OCR", segun el autor. Es la capacidad que la cuantizacion intenta proteger de forma explicita.
- Prediccion multi-token (MTP): los modulos `mtp` y `mtp.fc` se conservan en bfloat16, lo que sugiere soporte para decodificacion especulativa o generacion multi-token.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada; depende del modelo base.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada; depende del modelo base.
- Capacidades multilingues: no disponible.
- Modo de pensamiento (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Extraccion de datos de documentos con OCR: al mantener la torre de vision en bfloat16, el modelo puede procesar facturas, formularios o capturas y devolver texto estructurado sin la perdida de precision que suele introducir la cuantizacion de la parte visual.
- Digitalizacion de archivos historicos o escaneados: el peso reducido en 4 bits permite ejecutar el modelo en una unica GPU de gama media mientras se conserva la precision de reconocimiento de caracteres.
- Asistente multimodal de atencion al cliente: el modelo puede recibir capturas de pantalla o fotos de producto junto al texto de la conversacion; el despliegue en vLLM o SGLang permite servir varias conversaciones concurrentes con menor VRAM por replica.
- Inferencia de bajo coste en produccion: la reduccion de memoria declarada (~50%) permite aumentar el numero de replicas por GPU o desplegar en instancias mas baratas, manteniendo el mismo modelo base.
- Decodificacion especulativa con MTP: los modulos multi-token en bfloat16 pueden aprovecharse en backends que soporten MTP para reducir la latencia por token en tareas de generacion larga, siempre que el backend lo implemente.
- Prototipado e investigacion en una sola GPU consumer: permite evaluar el comportamiento de Qwen3.5-9B multimodal sin acceso a clusters con A100/H100, a costa de asumir la degradacion no medida de la cuantizacion.
- Servicio de clasificacion o resumen de imagenes a gran escala: el menor coste por token hace viable procesar volumenes altos de imagenes con un modelo de ~9B en lugar de recurrir a APIs externas.
- Base para ajuste fino con QLoRA: al ser pesos de 4 bits compatibles con el ecosistema transformers y AutoRound, puede servir como punto de partida para adaptaciones de dominio; conviene verificar antes la compatibilidad real del backend de entrenamiento con el formato AutoRound.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluacion (MMLU, HumanEval, GSM8K, MMMU, DocVQA u otras), ni comparacion con el modelo base sin cuantizar. La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo ni sobre Qwen3.5-9B: los unicos resultados obtenidos fueron paginas sin relacion (contenido de television comercial en aleman). Por tanto, no es posible cuantificar la degradacion introducida por la cuantizacion W4A16.

## Requisitos de hardware

- VRAM estimada (calculo propio a partir del tamano declarado, no confirmado por el autor): un modelo de ~9B parametros en FP16 ocupa aproximadamente 18 GB solo en pesos. Con pesos a 4 bits, el peso del texto baja a unos 5-6 GB, a lo que hay que sumar la torre de vision y los modulos MTP en bfloat16 y la cache KV.
- Estimacion practica: entre 8 y 12 GB de VRAM para inferencia con contexto moderado, dependiendo de la longitud de contexto real (no disponible) y del backend.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue multiproceso; RTX 4090 (24 GB) y RTX 3090 (24 GB) como opciones de gama alta consumer.
- Cabe en GPU consumer: con toda probabilidad si, en tarjetas de 12 GB o mas (RTX 4070 Ti, RTX 4080, RTX 4090) si la ventana de contexto utilizada es moderada. No hay confirmacion oficial.
- Opciones de despliegue: el autor declara compatibilidad con `transformers`, AutoRound, vLLM y SGLang. No se menciona soporte de llama.cpp, Ollama, TGI ni formato GGUF, por lo que la inferencia en CPU o en entornos tipo Ollama no esta garantizada con estos pesos.
- Latencia y throughput: no disponibles. El autor no publica medidas de tokens por segundo ni de latencia por token.
- Advertencia sobre el tamano: el repositorio ocupa 57,7 GB, un tamano muy superior al esperado para pesos de 4 bits de un modelo de ~9B (que rondaria los 5-7 GB). Esta cifra puede deberse a shards redundantes, a componentes en precision completa o a otros artefactos del repo, pero el autor no lo explica. Conviene inspeccionar los archivos antes de planificar el despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vishva007/Qwen3.5-9B-W4A16-AutoRound | 2.491.309.296 segun metadatos safetensors (nombre del base: 9B) | No disponible | W4A16 AutoRound, group size 32; vision y MTP en bfloat16 | apache-2.0 | HuggingFace, 226 descargas, 0 likes |
| Qwen/Qwen3.5-9B | 9B (segun denominacion del repositorio) | No disponible | Ninguna (BF16/FP16) | apache-2.0 | HuggingFace (modelo base oficial) |
| Otras cuantizaciones de 4 bits del mismo base (GPTQ, AWQ, bitsandbytes) | No disponible | No disponible | 4 bits, varios formatos | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de rendimiento de ninguno de los modelos comparados, por lo que la comparativa se limita a parametros, formato y licencia. No es posible afirmar que esta cuantizacion sea mejor o peor que otras alternativas de 4 bits sin benchmarks publicados.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks ni medicion de la degradacion respecto al modelo base. La afirmacion del autor de "calidad de produccion con degradacion minima" no esta respaldada con numeros.
- Discrepancia en el numero de parametros: los metadatos safetensors indican 2.491.309.296 parametros, mientras que el nombre del modelo base es "9B". Puede tratarse de metadatos incompletos o de un recuento parcial; conviene verificarlo antes de asumir un tamano concreto.
- Discrepancia en el tamano del repositorio: 57,7 GB es desproporcionado para una cuantizacion de 4 bits de un modelo de ~9B y no esta justificado en la model card.
- Sin soporte declarado de GGUF, llama.cpp ni Ollama: el despliegue esta limitado a backends que soporten el formato AutoRound (transformers, vLLM, SGLang).
- Modelo base no verificado: parte de los pesos (torre de vision y modulos MTP) permanecen en bfloat16, por lo que el ahorro real de memoria es inferior al 50% teorico de una cuantizacion completa.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluacion especifica en esta publicacion.
- Sesgos: no documentados por el autor. Deben asumirse los del modelo base, no descritos aqui.
- Idiomas y contexto: no declarados; no se puede garantizar comportamiento multilingue ni longitudes de contexto concretas.
- Validacion comunitaria muy baja: 0 likes y 226 descargas, publicado por un usuario individual y no por el equipo de Qwen ni por Intel.
- Procedencia de los pesos: al ser una cuantizacion de terceros, no existe garantia de reproducibilidad del proceso ni de que los pesos correspondan exactamente al base oficial.
- Enlaces promocionales: la model card incluye enlaces de referencia a RunPod con credito promocional para el autor. No afectan al modelo, pero conviene tenerlos en cuenta al valorar el documento.
- Licencia: apache-2.0 permite uso comercial, pero conviene revisar los terminos del modelo base Qwen/Qwen3.5-9B por si imponen condiciones adicionales.
- Fechas de metadatos en el futuro (creacion 2026-03-03, actualizacion 2026-09-19) respecto a la informacion disponible en esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vishva007/Qwen3.5-9B-W4A16-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- AutoRound (Intel), repositorio de la herramienta de cuantizacion: https://github.com/intel/auto-round
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web realizada; los resultados obtenidos no guardaban relacion con el modelo.
