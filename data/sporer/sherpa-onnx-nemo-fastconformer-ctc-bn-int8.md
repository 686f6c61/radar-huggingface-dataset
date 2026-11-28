# Sporer/sherpa-onnx-nemo-fastconformer-ctc-bn-int8

## Resumen

El modelo `sherpa-onnx-nemo-fastconformer-ctc-bn-int8` es una conversion a ONNX con cuantizacion dinamica a int8 del modelo de reconocimiento automatico del habla (ASR) `SayedShaun/stt_bn_fastconformer_ctc_large`, desarrollado originalmente sobre la arquitectura NeMo FastConformer con cabecera CTC para bengali. El autor de la conversion es el usuario de Hugging Face Sporer, que no ha reentrenado los pesos: unicamente ha exportado el modelo a formato ONNX y lo ha cuantizado a int8 para reducir el peso y acelerar la inferencia en CPU.

El modelo resuelve la transcripcion de audio en bengali (`bn`) y esta pensado para integrarse en el ecosistema sherpa-onnx, una libreria de inferencia de voz en C++/Python orientada a despliegues ligeros en produccion. Su relevancia radica en que ofrece un ASR bengali de tamano contenido (repositorio de aproximadamente 0,1 GB) que puede ejecutarse en CPU con un factor de tiempo real (RTF) de 0,10, lo que lo hace viable para transcripcion por lotes y servicios de bajo coste.

No se dispone de informacion publica sobre el numero de parametros, la longitud de contexto de audio ni la composicion exacta del dataset de entrenamiento original en la informacion proporcionada. La model card reporta resultados de evaluacion en FLEURS bengali con un WER del 14,3 % y un CER del 3,6 %, ligeramente mejores en WER que la version fp32 (14,5 %) y claramente por delante de Omnilingual 1B (21,0 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo FastConformer con cabecera CTC (exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamica (ONNX); existe version fp32 de referencia |
| Idiomas soportados | bengali (bn) |
| Licencia | CC-BY-4.0 (atribucion obligatoria) |
| Formato de pesos | ONNX (`model.int8.onnx`) + `tokens.txt` |

## Arquitectura y entrenamiento

La arquitectura subyacente es FastConformer, un transformer convolucional de NeMo disenado para ASR que combina capas de atencion con subsampling convolucional para reducir la longitud de la secuencia de entrada. La cabecera es CTC (Connectionist Temporal Classification), lo que permite decodificacion sin alineamientos explicitos y sin modelo de lenguaje externo en el pipeline de sherpa-onnx. El modelo original se distribuye como `stt_bn_fastconformer_ctc_large`, aunque no se detalla en la informacion disponible el numero de capas, dimension del modelo ni horas de audio de entrenamiento.

La conversion realizada por Sporer no incluye reentrenamiento: se exporta el modelo `.nemo` a ONNX con NeMo 2.x en CPU y se aplica cuantizacion dinamica a int8. La model card advierte que los datos de entrenamiento originales podrian incluir el split de entrenamiento de FLEURS, por lo que la evaluacion reportada podria estar contaminada y conviene validar el modelo sobre audio fuera de dominio. No se documenta el uso de RLHF, DPO ni tecnicas de refinamiento posteriores, algo esperable en un modelo CTC clasico.

## Capacidades

- Transcripcion de voz a texto en bengali (`bn`) a partir de audio.
- Decodificacion CTC sin modelo de lenguaje externo, integrada en sherpa-onnx mediante `OfflineRecognizer.from_nemo_ctc`.
- Inferencia en CPU con cuantizacion int8, apta para entornos sin GPU.
- Procesamiento por lotes de ficheros de audio (modo offline, no streaming).
- Ejecucion multihilo configurable (`num_threads`, por ejemplo 4).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente ASR).
- No soporta vision, audio generativo ni modo thinking.
- La salida no incluye puntuacion ni mayusculas; el texto se devuelve en minusculas y sin signos.

## Casos de uso

- Transcripcion de reuniones y entrevistas en bengali: el modelo convierte grabaciones completas a texto en modo offline con un RTF de 0,10 en CPU de 4 hilos, lo que permite procesar una hora de audio en aproximadamente seis minutos en un servidor sin GPU.
- Subtitulado de contenido audiovisual bengali: util para generar subtitulos automaticos en plataformas de video, con la salvedad de que habra que aplicar un postprocesado de puntuacion y mayusculas, ya que el modelo no las genera.
- Servicios de atencion al cliente en bengali: transcripcion de llamadas grabadas para analitica, busqueda y control de calidad, desplegando el modelo en contenedores CPU de bajo coste.
- Investigacion linguistica y corpus: generacion de transcripciones a gran escala de audio bengali para estudios de fonetica, sociolinguistica o construccion de datasets.
- Digitalizacion de archivos de audio historicos o radiales en bengali: el modelo puede ejecutarse en maquinas modestas y procesar lotes nocturnos sin necesidad de infraestructura GPU.
- Asistencia a la accesibilidad: transcripcion en tiempo casi real de conversaciones presenciales o grabadas para personas con discapacidad auditiva en entornos bengaliparlantes, siempre que se acepte la latencia del modo offline.
- Integracion en pipelines de datos: uso como etapa de ASR dentro de flujos ETL que procesan audio y generan indices de busqueda o resumentes posteriores con un LLM.

## Benchmarks y rendimiento

Evaluacion reportada en la model card sobre el subconjunto de test `bn_in` de FLEURS (92 utterances, sin digitos, normalizacion NFKC, minusculas y sin puntuacion):

| Modelo | WER | CER | RTF (CPU, 4 hilos) |
|---|---|---|---|
| Este modelo (int8) | 14,3 % | 3,6 % | 0,10 |
| Version fp32 | 14,5 % | 3,4 % | 0,09 |
| Omnilingual 1B | 21,0 % | 5,0 % | 0,35 |

La cuantizacion int8 apenas degrada el CER (3,6 % frente a 3,4 %) y mejora ligeramente el WER, con un coste de RTF practicamente identico al fp32. Frente a Omnilingual 1B, el modelo reduce el WER en 6,7 puntos y el RTF en 0,25, aunque la comparacion debe tomarse con cautela por la posible contaminacion del conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada: no aplica para despliegue en CPU; en GPU, el peso del repositorio es de aproximadamente 0,1 GB, por lo que cabria en cualquier GPU con al menos 1 GB de memoria libre, aunque no se documentan requisitos oficiales.
- GPU recomendadas: no se especifican; el modelo esta optimizado para CPU mediante ONNX Runtime.
- Cabe en GPU consumer: si, practicamente cualquier GPU consumer moderna (GTX 1050 o superior) podria alojarlo, aunque el uso previsto es CPU.
- Opciones de despliegue: sherpa-onnx (Python/C++), ONNX Runtime; no se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a LLM.
- Latencia y throughput: RTF de 0,10 en CPU con 4 hilos, es decir, aproximadamente 10 veces mas rapido que tiempo real en ese entorno; el throughput absoluto depende del hardware y del numero de hilos configurado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (FLEURS bn) | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (int8) | no disponible | no disponible | 14,3 % | CC-BY-4.0 | ONNX int8 |
| Version fp32 del mismo modelo | no disponible | no disponible | 14,5 % | CC-BY-4.0 | NeMo / ONNX |
| Omnilingual 1B | 1B | no disponible | 21,0 % | no disponible en la informacion | no disponible |

No se dispone de datos de otros modelos ASR bengali comparables en la informacion proporcionada. La comparacion con Omnilingual 1B procede de la propia model card y no detalla la licencia ni el formato de ese modelo.

## Limitaciones y advertencias

- Solo soporta bengali; no es multilingue y no transcribe otros idiomas.
- La salida carece de puntuacion, mayusculas y normalizacion; requiere postprocesado para muchos casos de uso.
- Riesgo de alucinacion y errores en audio con ruido, acentos no vistos o dominio distinto al de entrenamiento; la model card recomienda validar sobre audio fuera de dominio.
- Posible contaminacion del benchmark: los datos de entrenamiento originales podrian incluir el split de entrenamiento de FLEURS, por lo que el WER reportado podria ser optimista.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion al autor original y a la conversion; es necesario conservar los avisos de copyright.
- El autor original del modelo base es `SayedShaun`; la conversion la firma Sporer, un tercero, por lo que no hay garantias de soporte ni mantenimiento.
- Modelo offline (no streaming): no esta pensado para transcripcion en tiempo real con baja latencia.
- No es un modelo de lenguaje: no genera texto libre, no razona ni ejecuta herramientas; su unico cometido es ASR.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sporer/sherpa-onnx-nemo-fastconformer-ctc-bn-int8
- Modelo base: https://huggingface.co/SayedShaun/stt_bn_fastconformer_ctc_large
- sherpa-onnx (libreria de inferencia): no se proporciona enlace en la informacion disponible
- NeMo (framework original): no se proporciona enlace en la informacion disponible
- Paper de FastConformer: no se proporciona enlace en la informacion disponible
- Dataset FLEURS: no se proporciona enlace en la informacion disponible
