# tooltd/Qwen3.8-27B-GSQ-RCO-BuffedMod-GGUF

## Resumen

Este repositorio contiene variantes GGUF modificadas de Qwen3.8-27B-GSQ-RCO, un modelo multimodal de aproximadamente 27.300 millones de parámetros (27.320.697.856 según los pesos en safetensors) con pipeline `image-text-to-text`, es decir, capaz de procesar imagen y texto de entrada. La modificación la firma el usuario tooltd y parte del trabajo previo de ISTA-DASLab (Qwen3.8-27B-GSQ-RCO-GGUF), que a su vez cuantiza el modelo base Qwen/Qwen3.8-27B. La licencia declarada es Apache 2.0.

La particularidad técnica del repositorio, denominada BuffedMod, es que no se recuantiza el modelo desde pesos FP16/BF16, sino que se editan tensores concretos dentro del binario GGUF ya cuantizado. En concreto, se sustituye el tensor `output.weight` (LM Head) de Q4_K a Q6_K para mejorar la precisión de la distribución de probabilidad final, y en una de las variantes se recuantizan a la baja los tensores MTP (Multi-Token Prediction) de Q6_K a IQ4_XS para recuperar tamaño.

El interés práctico es acotado pero real: es un ejemplo de optimización de cuantizaciones de 3 bits orientada a reducir la degradación respecto al modelo base, con métricas de perplejidad y divergencia KL publicadas por el autor. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no cuenta con validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + vision), con tensores MTP (Multi-Token Prediction); detalles de capas y atencion no disponibles |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: IQ3_S (base), Q4_K, Q6_K, IQ4_XS; cuantizacion con imatrix; etiquetas GSQ y RCO |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria `gguf`); el modelo base original en safetensors |
| Tamano del repositorio | 24,8 GB (incluye varias variantes) |
| Tamano por variante | 11,29 GB (IQ3_S original), 11,49 GB (BuffedMod IQ4XS MTP), 11,59 GB (BuffedMod Q6_K MTP) |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.8-27B (relacion: quantized) |
| Fecha de creacion | 2026-09-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Qwen3.8-27B mas alla de lo que indican las etiquetas del repositorio: modelo multimodal con vision, conversacional, entrenado o cuantizado con imatrix y con cabezas MTP (Multi-Token Prediction). La presencia de tensores MTP separados, que en la variante IQ4XS se recuantizan de forma independiente, confirma que el modelo incorpora un modulo de prediccion multi-token, habitualmente empleado para acelerar la decodificacion o como base para decodificacion especulativa. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre si hubo RLHF, DPO u otra fase de alineamiento.

El trabajo de este repositorio es exclusivamente de cuantizacion y post-procesado de pesos, no de entrenamiento. El autor modifica directamente tensores dentro del fichero GGUF binario en lugar de recuantizar desde los pesos originales. La intervencion principal es el reemplazo del tensor `output.weight` (LM Head) de Q4_K a Q6_K, partiendo de la hipotesis de que en cuantizaciones de 3 bits la cabeza de salida es un cuello de botella para la precision de la generacion. La segunda variante anade una recuantizacion a la baja de los tensores MTP de Q6_K a IQ4_XS para compensar el aumento de tamano. La evaluacion se realizo con `llama-perplexity` sobre wikitext-2-raw, midiendo PPL, divergencia KL y coincidencia de token superior contra un fichero de referencia del modelo base en BF16.

## Capacidades

- Generacion de texto conversacional (etiqueta `conversational`).
- Procesamiento de entrada multimodal imagen-texto (pipeline `image-text-to-text`, etiqueta `vision`): el modelo base puede recibir imagenes junto con texto.
- Prediccion multi-token (tensores MTP presentes), potencialmente aprovechable para decodificacion acelerada o especulativa segun el runtime.
- Cuantizacion optimizada para inferencia en CPU/GPU con llama.cpp y derivados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Modo de razonamiento explicito (thinking), audio u otras modalidades: no disponible.

## Casos de uso

- Despliegue local multimodal en estacion de trabajo: con 11,3-11,6 GB de pesos, el modelo cabe en GPUs de 16-24 GB y permite consultas sobre imagenes y texto sin enviar datos a servicios externos, algo relevante para material confidencial.
- Analisis de documentacion escaneada en local: al aceptar entrada imagen-texto, puede usarse para extraer y resumir informacion de capturas, diagramas o documentos digitalizados, siempre que el runtime cargue el proyector multimodal correspondiente.
- Asistente conversacional de larga duracion en hardware de gama alta para consumidor: la etiqueta `conversational` y el formato GGUF lo hacen adecuado para chats multi-turno servidos con llama.cpp u Ollama en una RTX 4090 o RTX 3090.
- Evaluacion de tecnicas de cuantizacion: el repositorio es un caso de estudio reproducible para comparar el efecto de subir la precision del LM Head en cuantizaciones de 3 bits, con metricas de PPL y KLD publicadas.
- Prototipado de pipelines de vision-lenguaje en investigación: util para validar arquitecturas o prompts sobre un modelo de ~27B cuantizado antes de escalar a versiones de mayor precision.
- Inferencia en equipos con VRAM limitada: la variante IQ3_S permite ejecutar un modelo de 27B en GPUs de 12-16 GB recurriendo a offload parcial de capas a CPU, con el coste de latencia asociado.
- Base para decodificacion especulativa: los tensores MTP conservados en la variante Q6_K pueden emplearse en runtimes que soporten prediccion multi-token para reducir el coste por token generado, sujeto a soporte del motor de inferencia.

## Benchmarks y rendimiento

Los unicos datos publicados son metricas de calidad de cuantizacion (perplejidad y divergencia KL), no benchmarks de tarea. No hay resultados de MMLU, HumanEval, GSM8K ni similares en la informacion disponible.

Comparativa de las variantes, medida con `llama-perplexity` sobre wikitext-2-raw y referencia BF16 del modelo base:

| Metrica | Original (IQ3_S) | BuffedMod (Q6_K output) | Variacion |
|---|---|---|---|
| PPL(Q) media | 7,062697 | 7,032142 | -0,030555 |
| Diferencia de PPL vs base | 0,112205 | 0,081650 | -27,2% de error |
| KLD media | 0,055475 | 0,051738 | -6,7% |
| KLD mediana | 0,022928 | 0,018899 | -17,5% |
| Coincidencia de token superior | 89,657% | 90,535% | +0,878 puntos |
| RMS delta p | 6,537% | 6,285% | -0,252 puntos |

| Variante | Tamano | PPL(Q) | Dif. PPL vs base | KLD media | KLD mediana | Coincidencia top-token |
|---|---|---|---|---|---|---|
| Original (IQ3_S-mtp) | 11,29 GB | 7,0627 | 0,1122 | 0,0555 | 0,0229 | 89,66% |
| BuffedMod (IQ4XS MTP) | 11,49 GB | 7,0321 | 0,0817 | 0,0517 | 0,0189 | 90,54% |
| BuffedMod (Q6_K MTP) | 11,59 GB | 7,0321 | 0,0817 | 0,0517 | 0,0189 | 90,54% |

Referencia del modelo base empleada por el autor: PPL(base) 6,950493.

## Requisitos de hardware

- VRAM estimada para los pesos: 11,3 GB (IQ3_S original), 11,5 GB (IQ4XS MTP) y 11,6 GB (Q6_K MTP) en disco, segun los tamanos publicados. La VRAM necesaria en ejecucion es superior por el cache KV, el proyector multimodal y el overhead del runtime; se situa de forma orientativa en el rango de 13-16 GB, aunque no se dispone de mediciones publicadas.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB o H100 para despliegues con contexto amplio y concurrencia; en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) el modelo entra con margen justo y requiere reducir contexto.
- GPUs de 12 GB: es posible ejecutarlo con offload parcial de capas a CPU (por ejemplo, RTX 3060 12 GB), a costa de latencia.
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas de VRAM, especialmente con la variante de 11,3-11,6 GB y contexto moderado.
- Opciones de despliegue: llama.cpp (referencia, es el runtime con el que se generaron las metricas), llama.cpp server, Ollama importando el GGUF, LM Studio, koboldcpp. El soporte en vLLM para GGUF es limitado y depende de la arquitectura, por lo que no se puede garantizar; TGI no es una via habitual para GGUF.
- Vision: para el procesamiento de imagenes se necesita el fichero proyector multimodal (`mmproj`) compatible. En la informacion disponible no se confirma que el repositorio lo incluya.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

Comparativa dentro del propio ecosistema del modelo, ya que no se dispone de datos de rendimiento de alternativas:

| Modelo | Parametros | Contexto | Formato / tamano | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tooltd/Qwen3.8-27B-GSQ-RCO-BuffedMod-GGUF (este) | 27,3B | No disponible | GGUF, 11,49-11,59 GB | PPL(Q) 7,0321; KLD media 0,0517 | Apache 2.0 | Publico, 0 descargas |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF (origen) | 27,3B | No disponible | GGUF, IQ3_S 11,29 GB | PPL(Q) 7,0627; KLD media 0,0555 | No disponible en la informacion | Publico |
| Qwen/Qwen3.8-27B (base) | 27,3B | No disponible | safetensors, BF16 | PPL(base) 6,950493 en la referencia del autor | No disponible en la informacion (el derivado declara Apache 2.0) | Publico |

No se dispone de informacion sobre modelos comparables de otros autores (mismo tamano o misma tarea) en los resultados de busqueda consultados, que no devolvieron material relevante sobre el modelo.

## Limitaciones y advertencias

- Cuantizacion agresiva: la base es IQ3_S (aproximadamente 3 bits por peso). La PPL(Q) de 7,0321 frente a 6,9505 del modelo BF16 implica una degradacion medible, y la divergencia KL media se mantiene en 0,0517, con un maximo de 15,75, lo que indica colas de error altas en algunos tokens.
- Riesgo de alucinacion: la cuantizacion de baja precision incrementa la probabilidad de errores de generacion respecto al modelo en BF16, especialmente en tareas que requieren exactitud factual o razonamiento largo.
- Modificacion manual de tensores: la tecnica BuffedMod edita el binario GGUF de forma no estandar. Conviene verificar la integridad de los ficheros y reproducir la evaluacion antes de usarlos en produccion, ya que el metodo no esta documentado con detalle reproducible.
- Idiomas: no declarados. No se puede asumir un buen rendimiento en castellano sin evaluacion previa.
- Longitud de contexto: no disponible. No es posible planificar cargas con contexto largo sin medirla.
- Vision: el pipeline declarado es `image-text-to-text`, pero no se confirma en la informacion disponible la presencia del proyector multimodal necesario; sin el, el modelo solo procesaria texto.
- Licencia: el derivado declara Apache 2.0, pero no se especifica la licencia del modelo base en la informacion proporcionada. Verificar los terminos de Qwen/Qwen3.8-27B antes de uso comercial.
- Adopcion nula: 0 descargas y 0 likes. No hay validacion independiente, informes de terceros ni issues publicos sobre posibles fallos.
- Sesgos: no disponible. No se ha publicado ninguna evaluacion de sesgos ni de seguridad.
- Rendimiento en produccion: sin datos de latencia ni throughput, y con soporte incierto en servidores de inferencia de alto rendimiento distintos de llama.cpp.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tooltd/Qwen3.8-27B-GSQ-RCO-BuffedMod-GGUF
- Modelo de origen (cuantizacion base): https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog o demo adicionales: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
