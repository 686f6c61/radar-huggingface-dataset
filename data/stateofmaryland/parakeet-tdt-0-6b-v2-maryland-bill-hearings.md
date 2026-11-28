# stateofmaryland/parakeet-tdt-0.6b-v2-maryland-bill-hearings

## Resumen

Parakeet TDT 0.6B v2 Maryland Bill Hearings es un modelo de reconocimiento automatico del habla (ASR) especializado en las vistas de comisiones de la Asamblea General de Maryland. Lo publica la organizacion stateofmaryland como un ajuste fino del modelo abierto nvidia/parakeet-tdt-0.6b-v2 de NVIDIA. El problema que resuelve es concreto: la transcripcion fiable de audio legislativo en ingles con terminologia juridica, nombres propios y numeros de proyecto de ley, un dominio en el que los sistemas genericos cometen un numero elevado de omisiones de palabras.

La arquitectura subyacente es FastConformer con decodificacion TDT (Token-and-Duration Transducer), con aproximadamente 600 millones de parametros. Se distribuye en dos formatos: un checkpoint completo `.nemo` de 2,5 GB para NeMo (GPU o CPU) y una exportacion ONNX cuantizada a int8 de 630 MB para sherpa-onnx, que permite transcribir una hora de audio en unos tres minutos en la CPU de un portatil sin GPU.

Su relevancia ahora es doble. Por un lado, demuestra que un ajuste fino de 81,3 horas de audio sobre un modelo de 0,6B puede reducir el WER de un 5,52% a un 3,06% en su dominio, superando a Whisper large-v3 (10,37%) y a las subtitulos automaticos de YouTube (5,04%). Por otro, publica junto al modelo un benchmark reproducible de 32 sistemas con codigo de entrenamiento, exportacion y evaluacion, lo que lo convierte en una referencia practica para quien necesite ASR especializado en dominio legislativo con despliegue en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 0,6B (aproximadamente 600 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con clips de aproximadamente 2 minutos; se recomienda trocear audio largo) |
| Tipos de cuantizacion | int8 (exportacion ONNX); pesos completos en el checkpoint `.nemo` |
| Idiomas soportados | en (solo ingles) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.nemo` (NeMo), ONNX (encoder, decoder y joiner int8) y `tokens.txt` |

## Arquitectura y entrenamiento

El modelo parte de nvidia/parakeet-tdt-0.6b-v2, un transducer FastConformer con decodificacion TDT que predice conjuntamente tokens y duraciones, lo que reduce el coste de decodificacion frente a un transducer convencional. El ajuste fino mantiene la arquitectura y adapta los pesos al dominio de vistas legislativas. La salida incluye puntuacion y mayusculas.

El entrenamiento uso el conjunto de 100 horas del dataset stateofmaryland/maryland-bill-hearings, del que se emplearon 81,3 horas (2.410 clips de unos 2 minutos). Para evitar fuga de datos, se excluyeron de entrenamiento las 10 vistas del benchmark y se reservaron otras 3 vistas (4,2 horas) como validacion. Se realizaron 6 epocas con tasa de aprendizaje 5e-5, warm-up y decaimiento coseno, batches de 16 clips en precision mixta bf16, y se conservo el checkpoint de la epoca 5 por ser el mejor en validacion. El coste total fue de unos 35 minutos en 8 GPU NVIDIA H100. El codigo de entrenamiento, exportacion y evaluacion esta en el repositorio `ft/` del proyecto de benchmark.

## Capacidades

- Transcripcion de voz a texto en ingles con puntuacion y mayusculas automaticas.
- Reconocimiento de habla espontanea en contexto de vistas legislativas: intervenciones de legisladores, testigos y personal tecnico.
- Ejecucion en CPU sin GPU mediante la exportacion ONNX int8 con sherpa-onnx.
- Ejecucion en GPU o CPU mediante NeMo (`nemo_toolkit[asr]`).
- Procesamiento por streaming a traves de la API de sherpa-onnx (`create_stream`, `accept_waveform`, `decode_stream`).
- No soporta tool calling, function calling, agentes, vision ni audio mas alla de la transcripcion.
- Capacidad multilingue: no disponible (solo ingles).

## Casos de uso

- Transcripcion de actas oficiales de comisiones: el modelo convierte las grabaciones de vistas en borradores de transcripcion con puntuacion, que despues revisa un taquigrafo humano antes de su publicacion como registro oficial.
- Indexacion y busqueda de archivo legislativo: al transcribir horas de audio con un WER del 3,06% en el dominio, permite generar indices de texto buscable sobre el catalogo historico de vistas de la Asamblea General.
- Accesibilidad y subtitulado: genera subtitulos para retransmisiones y videos de vistas con una calidad muy superior a los subtitulos automaticos de YouTube (5,04% de WER en el mismo benchmark).
- Despliegue en equipos modestos de oficina legislativa: la version ONNX int8 transcribe una hora de audio en unos tres minutos en la CPU de un portatil, sin necesidad de GPU ni de servicios en la nube, lo que facilita el cumplimiento de requisitos de residencia de datos.
- Analisis de politicas publicas a escala: transcripcion masiva de audios para mineria de texto, deteccion de temas y seguimiento de proyectos de ley a lo largo de una legislatura.
- Prototipado y evaluacion de pipelines ASR: el modelo y su benchmark de 32 sistemas sirven como linea base reproducible para comparar decodificadores, cuantizaciones y motores de inferencia en un dominio realista.
- Generacion de resumenes asistidos: la transcripcion limpia alimenta modelos de lenguaje posteriores para producir resumenes de vistas y actas de reunion.

## Benchmarks y rendimiento

Resultados declarados por el autor en el benchmark Maryland Bill Hearings (1h), configuracion `1h`, split `test`, con 30 clips de 10 vistas y normalizacion de texto segun el Open ASR Leaderboard. WER en porcentaje, menor es mejor.

| Modelo | WER | WER con hablantes solapados |
|---|---:|---:|
| mai-transcribe-2 (API) | 1,02% | 0,82% |
| Nemotron 3.5 Transcribe 30B (verbatim) | 2,81% | 3,64% |
| **Este modelo (NeMo, GPU)** | **3,06%** | 5,23% |
| gemini-3.5-transcribe (API) | 3,26% | 5,28% |
| **Este modelo (int8 ONNX, CPU)** | **3,39%** | 4,76% |
| Subtitulos automaticos de YouTube | 5,04% | 6,30% |
| Modelo base (parakeet-tdt-0.6b-v2) | 5,52% | 8,71% |
| Whisper medium.en | 6,25% | 7,53% |
| Whisper large-v3 | 10,37% | 15,16% |

El ajuste fino redujo los errores un 45% respecto al modelo base, con la mayor parte de la mejora concentrada en menos palabras omitidas: las deleciones cayeron de 368 a 91. La version int8 en CPU pierde solo 0,33 puntos de WER frente a la version NeMo en GPU y rinde mejor que esta en el subconjunto de hablantes solapados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 0,6B de parametros el checkpoint `.nemo` (2,5 GB) cabe holgadamente en cualquier GPU de consumo con 4 GB o mas.
- GPU recomendadas: NVIDIA H100 para entrenamiento (8 GPU, 35 minutos); para inferencia es suficiente cualquier GPU moderna, incluida una RTX 4090 o incluso GPUs de gama baja.
- Cabe en GPU de consumo: si, con amplio margen. Tambien funciona sin GPU.
- Despliegue en CPU: exportacion ONNX int8 de 630 MB con sherpa-onnx; una hora de audio en unos tres minutos en la CPU de un portatil.
- Opciones de despliegue: NeMo (`nemo_toolkit[asr]`) en GPU o CPU, y sherpa-onnx con los ficheros `encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx` y `tokens.txt`.
- Latencia y throughput: aproximadamente 20x tiempo real en CPU de portatil (1 hora de audio en 3 minutos); throughput en GPU no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (benchmark Maryland) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (NeMo, GPU) | 0,6B | clips de ~2 min | 3,06% | CC-BY-4.0 | Hugging Face, NeMo, ONNX |
| Modelo base parakeet-tdt-0.6b-v2 | 0,6B | no disponible | 5,52% | CC-BY-4.0 | Hugging Face |
| Whisper large-v3 | no disponible en la informacion | no disponible | 10,37% | no disponible en la informacion | no disponible en la informacion |
| Whisper medium.en | no disponible en la informacion | no disponible | 6,25% | no disponible en la informacion | no disponible en la informacion |
| Nemotron 3.5 Transcribe 30B (verbatim) | 30B | no disponible | 2,81% | no disponible en la informacion | no disponible en la informacion |

La comparativa se limita al benchmark del propio autor; los datos de parametros y contexto de los modelos alternativos no figuran en la informacion disponible. El modelo ofrece un equilibrio destacable entre tamano (0,6B), WER en dominio y capacidad de ejecucion en CPU, mientras que Nemotron 3.5 Transcribe 30B obtiene mejor WER a costa de un tamano 50 veces mayor.

## Limitaciones y advertencias

- Conjunto de test pequeno: solo 10 vistas; los resultados pueden variar en otras comisiones, salas o hablantes.
- Habla solapada: el WER sube del 3,06% al 5,23% en GPU cuando varias personas hablan a la vez.
- Nombres y numeros: puede escribir mal nombres de personas y lugares, asi como numeros de proyecto de ley.
- Grabaciones largas: entrenado con clips de unos 2 minutos; para vistas completas hay que trocear el audio en fragmentos de pocos minutos.
- Solo ingles: no transcribe otros idiomas.
- Revision humana obligatoria: el autor recomienda revision por una persona antes de usar las transcripciones como registro oficial.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; el dominio de entrenamiento (vistas legislativas de Maryland) puede introducir sesgo hacia ese tipo de habla, acentos y terminologia.
- Riesgo de alucinacion: inherente a los modelos ASR; el autor cuantifica deleciones (91 tras el ajuste fino) pero no analiza inserciones de texto no presente en el audio.
- Licencia: CC-BY-4.0 permite uso comercial con atribucion; es necesario citar al autor y conservar el aviso de licencia. El dataset de entrenamiento es CC0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stateofmaryland/parakeet-tdt-0.6b-v2-maryland-bill-hearings
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Dataset de vistas legislativas: https://huggingface.co/datasets/stateofmaryland/maryland-bill-hearings
- Repositorio de benchmark, entrenamiento y evaluacion: https://github.com/DoIT-Artificial-Intelligence/asr-maryland-bill-hearings
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
