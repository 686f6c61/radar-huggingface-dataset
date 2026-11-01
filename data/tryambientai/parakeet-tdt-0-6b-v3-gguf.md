# tryambientai/parakeet-tdt-0.6b-v3-gguf

## Resumen

`tryambientai/parakeet-tdt-0.6b-v3-gguf` es la conversion a formato GGUF del modelo de reconocimiento automatico del habla `nvidia/parakeet-tdt-0.6b-v3`, realizada por el usuario tryambientai para su uso con el runtime [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp). El modelo original lo desarrolla NVIDIA y esta pensado para transcripcion multilingue offline de alta velocidad sobre 25 idiomas europeos, incluyendo el castellano. La conversion preserva la licencia CC-BY-4.0 del modelo base y anade cuantizaciones de 4 a 8 bits que reducen el peso de 2,51 GB (F32) hasta 502 MB (Q4_K_M) con una degradacion de WER practicamente nula.

Arquitectonicamente es un FastConformer-TDT: un encoder Conformer de unos 600 millones de parametros acoplado a un decodificador transducer TDT/RNNT. No es un modelo generativo de texto ni un LLM, sino un sistema ASR especializado que recibe audio de 16 kHz mono en WAV y produce transcripcion con puntuacion, mayusculas, deteccion automatica de idioma y marcas temporales a nivel de token. No soporta streaming ni traduccion.

Su relevancia practica esta en que ofrece una alternativa libre y ejecutable en CPU o GPU de consumo para transcripcion multilingue, con ratios de tiempo real (RTF) muy bajos: 151x en Metal sobre un Apple M4 Max y 12,5x en Vulkan sobre un Ryzen 4750U. Eso lo hace viable para procesamiento por lotes de audio en equipos sin acelerador dedicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + decodificador transducer TDT/RNNT |
| Parametros totales | 627.052.166 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio, no contexto de texto) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 25 idiomas europeos: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo base es un FastConformer-TDT de 0,6B parametros. El encoder Conformer combina convoluciones y auto-atencion para capturar dependencias locales y globales en la señal acustica; el decodificador es un transducer TDT (Token-and-Duration Transducer), que predice conjuntamente el token y su duracion, lo que reduce el numero de pasos de decodificacion frente a un RNNT clasico y acelera la inferencia. La salida incluye puntuacion, mayusculas, deteccion automatica de idioma y timestamps a nivel de token.

Segun la model card upstream, el entrenamiento se apoya principalmente en el corpus multilingue [Granary](https://huggingface.co/datasets/nvidia/Granary), que NVIDIA usa como dataset primario para esta familia de modelos. La model card disponible no detalla el numero exacto de horas de audio, la composicion del dataset ni si hubo etapas de RLHF o ajuste fino con preferencias; esos datos no estan disponibles en la informacion proporcionada. La conversion a GGUF se realizo desde el commit `6d590f7` del modelo original (fijado el 2026-04-16) y se valido contra la referencia NeMo en el commit `bf0d0b7` de transcribe.cpp el 2026-04-18.

## Capacidades

- Transcripcion de voz a texto offline en 25 idiomas europeos, con deteccion automatica del idioma sin necesidad de prompt.
- Generacion de puntuacion y mayusculas en la salida.
- Marcas temporales a nivel de token (`timestamps: token`).
- Soporte de deteccion de idioma (`lang_detect: true`).
- Entrada de audio a 16 kHz mono en formato WAV.
- No soporta streaming (`streaming: false`).
- No soporta traduccion (`translate: false`).
- No es un modelo generativo de texto: no hay tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No dispone de vision ni audio generativo; solo ASR.

## Casos de uso

- Transcripcion de reuniones y entrevistas: el modelo procesa ficheros WAV de 16 kHz mono y devuelve texto con puntuacion y timestamps por token, lo que permite generar actas o subtitulos sincronizados en un solo paso.
- Subtitulado por lotes de contenido audiovisual: con un RTF de 151x en Metal (M4 Max), un lote de horas de audio se transcribe en minutos, y las marcas temporales a nivel de token facilitan el alineado con el video.
- Atencion al cliente con analitica de llamadas: al detectar automaticamente el idioma, un mismo pipeline puede procesar grabaciones en castellano, aleman, frances o polaco sin enrutado previo por idioma.
- Archivado y busqueda de audio corporativo: la transcripcion offline permite indexar grabaciones historicas y hacerlas consultables por texto, sin enviar datos a servicios externos.
- Investigacion en linguistica y ASR multilingue: el modelo sirve como linea base reproducible en 25 idiomas con cuantizaciones de 4 a 8 bits y WER documentado en LibriSpeech test-clean.
- Despliegue en hardware de consumo: con Q4_K_M (502 MB) y un RTF de 12,5x en Vulkan sobre un Ryzen 4750U, es viable transcribir en portatiles sin GPU dedicada.
- Preprocesado para pipelines de datos: convertir audio a texto antes de alimentar sistemas de analisis, moderacion o resumen con LLM, aprovechando que la salida ya viene puntuada y con mayusculas.

## Benchmarks y rendimiento

Resultados de WER sobre LibriSpeech test-clean (2620 utterances, decodificacion greedy del transducer, sin LM externo):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 2,51 GB | 1,95% |
| F16 | 1,26 GB | 1,95% |
| Q8_0 | 740 MB | 1,94% |
| Q6_K | 627 MB | 1,93% |
| Q5_K_M | 565 MB | 1,92% |
| Q4_K_M | 502 MB | 1,98% |

Referencia: la cifra autoinformada por NVIDIA sobre la misma particion es 1,93%. La baseline F32 de esta conversion es 1,95%.

Rendimiento de inferencia (RTF, mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 151 |
| Apple M4 Max | CPU | 28 |
| AMD Ryzen 4750U | Vulkan | 12,5 |
| AMD Ryzen 4750U | CPU | 7,5 |

No se han publicado en la informacion disponible resultados de benchmarks multilingues (por ejemplo, sobre FLEURS o MLS) ni comparativas con otros modelos ASR.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 0,6B parametros, la huella es pequena. F32 requiere unos 2,5 GB, F16 unos 1,3 GB y Q4_K_M unos 0,5 GB. Estas cifras corresponden al tamano de los ficheros GGUF; la VRAM real depende del backend y del buffer de audio.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de memoria libre para las cuantizaciones bajas. No se especifican modelos concretos de A100, H100 o RTX 4090 en la informacion disponible; el modelo esta optimizado para ejecucion ligera, no para grandes aceleradores.
- Cabe en GPU de consumo: si, con cuantizaciones Q4_K_M a Q8_0 (502-740 MB). Los datos de rendimiento publicados corresponden a un Apple M4 Max (Metal) y a un Ryzen 4750U (Vulkan/CPU), no a GPUs discretas.
- Opciones de despliegue: el runtime oficial es transcribe.cpp (compilacion con CMake y binario `transcribe-cli`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; el formato GGUF es especifico de transcribe.cpp en este caso.
- Latencia y throughput: RTF de 151x en Metal (M4 Max), 28x en CPU (M4 Max), 12,5x en Vulkan y 7,5x en CPU (Ryzen 4750U). Un RTF de 151x implica transcribir 151 segundos de audio por segundo de computo.
- Preprocesado obligatorio: el audio debe convertirse a WAV de 16 kHz mono (por ejemplo, con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| parakeet-tdt-0.6b-v3 (GGUF, esta ficha) | 0,6B | 25 europeos | GGUF (transcribe.cpp) | CC-BY-4.0 | Conversion cuantizada, RTF alto en CPU/GPU de consumo |
| nvidia/parakeet-tdt-0.6b-v3 (original) | 0,6B | 25 europeos | NeMo (.nemo) | CC-BY-4.0 | Requiere NeMo; referencia upstream del GGUF |
| nvidia/parakeet-tdt-0.6b-v2 | 0,6B | solo ingles | NeMo (.nemo) | CC-BY-4.0 | Predecesor monolingue |
| Whisper (familia OpenAI) | 0,04B-1,55B | ~99 idiomas | multiples (incl. GGUF via whisper.cpp) | MIT | No se dispone de comparativa de WER en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos directos con Whisper u otros modelos ASR en la informacion proporcionada; la comparativa se limita a parametros, idiomas y licencia.

## Limitaciones y advertencias

- No soporta streaming: el modelo es offline y requiere el audio completo (o segmentado manualmente) antes de transcribir.
- No traduce: solo transcribe en el idioma detectado.
- Cobertura limitada a 25 idiomas europeos; no cubre arabe, mandarin, hindi, japones ni otras familias linguisticas.
- Entrada restringida a WAV de 16 kHz mono; cualquier otro formato o frecuencia requiere conversion previa.
- Riesgo de alucinacion y errores en audio con ruido, acentos no representados en el corpus Granary o solapamiento de hablantes; el WER de referencia (1,92-1,98%) corresponde a LibriSpeech test-clean, un dominio limpio de lectura, no a audio real.
- No se detallan en la informacion disponible los sesgos conocidos del modelo base ni la composicion exacta del dataset de entrenamiento.
- Licencia CC-BY-4.0: permite uso comercial con atribucion. Es necesario citar a NVIDIA y al autor de la conversion, y revisar los terminos completos en la model card upstream.
- La conversion GGUF esta validada contra NeMo en un commit concreto; cambios futuros en transcribe.cpp pueden alterar la compatibilidad.
- El repositorio de esta conversion registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni de mantenimiento continuado.

## Enlaces

- Repositorio HuggingFace de la conversion: https://huggingface.co/tryambientai/parakeet-tdt-0.6b-v3-gguf
- Modelo base en HuggingFace: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Commit del modelo base usado en la conversion: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3/commit/6d590f7
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/bf0d0b7
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-tdt-0.6b-v3.md
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/nvidia/parakeet-tdt-0.6b-v3
- Dataset Granary: https://huggingface.co/datasets/nvidia/Granary
- Predecesor monolingue: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Referencias arXiv citadas en los tags: arxiv:2509.14128, arxiv:2505.13404, arxiv:2305.05084, arxiv:2304.06795, arxiv:2410.01036, arxiv:2406.00899, arxiv:2205.12446, arxiv:2012.03411, arxiv:2007.10310, arxiv:1510.08484
