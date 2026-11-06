# tryambientai/parakeet-rnnt-1.1b-gguf

## Resumen

`tryambientai/parakeet-rnnt-1.1b-gguf` es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-rnnt-1.1b`, desarrollado originalmente por los equipos de NVIDIA NeMo y Suno.ai. El modelo original es un FastConformer Transducer de aproximadamente 1.100 millones de parámetros, diseñado para transcribir voz en inglés en minúsculas y sin puntuación. Esta versión GGUF está pensada para ejecutarse con `transcribe.cpp`, un runtime en C++ que permite inferencia local en CPU y GPU sin depender del stack de PyTorch o NeMo.

La relevancia de esta conversión radica en que traslada un modelo ASR de referencia (WER del 1,45 % en LibriSpeech test-clean) a un formato portátil y cuantizado que ocupa entre 825 MB y 4,28 GB según la precisión. Esto permite desplegar transcripción de alta calidad en hardware de consumo, incluyendo Mac con Metal y CPUs x86 con Vulkan, con factores de tiempo real (RTF) muy bajos: 125,5 en Metal sobre un M4 Max y 17,5 en CPU.

El modelo está limitado al inglés, no soporta streaming ni traducción, y produce salidas en minúsculas sin puntuación. Su licencia CC-BY-4.0 permite uso comercial con atribución. Es una opción adecuada para pipelines de transcripción offline donde se prioriza precisión y eficiencia sobre funcionalidades como diarización o detección de idioma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer-XL encoder + RNN-T transducer decoder |
| Parámetros totales | 1.070.513.665 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF |
| Entrada de audio | WAV mono a 16 kHz |
| Decodificación | RNN-T greedy, sin LM externo |
| Timestamps | a nivel de token |
| Streaming | no |
| Traducción | no |
| Detección de idioma | no |
| Librería | transcribe.cpp |
| Tamaño del repo | 1,3 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura FastConformer Transducer: un encoder FastConformer-XL de aproximadamente 1.100 millones de parámetros que procesa características acústicas y un decoder RNN-T (transducer) que genera tokens de forma autorregresiva con decodificación greedy. FastConformer es una variante de Conformer con downsampling en las capas iniciales, lo que reduce el coste computacional manteniendo la capacidad de modelado local y global mediante atención y convoluciones.

El modelo fue entrenado conjuntamente por NVIDIA NeMo y Suno.ai. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en ASR). La conversión GGUF fue realizada por `tryambientai` a partir del commit upstream `a07b19e` (fijado el 2026-05-10) y validada contra la referencia de NeMo en el commit `42528dd` de transcribe.cpp. La cuantización no degrada el WER de forma significativa: F32 y F16 dan 1,45 %, Q8_0 1,46 %, y las variantes K-quant incluso mejoran ligeramente (1,41-1,43 %), probablemente por efectos de regularización numérica.

## Capacidades

- Transcripción de voz a texto en inglés, salida en minúsculas y sin puntuación.
- Decodificación RNN-T greedy sin modelo de lenguaje externo.
- Generación de timestamps a nivel de token.
- Inferencia offline sobre audio WAV mono a 16 kHz.
- Ejecución en CPU (x86 con Vulkan, ARM) y GPU (Metal en Apple Silicon).
- Cuantizaciones que permiten desplegar el modelo en menos de 1 GB de disco.
- No soporta streaming, traducción, detección de idioma ni puntuación automática.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un LLM).
- No soporta visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción offline de reuniones y entrevistas: el modelo procesa archivos WAV de 16 kHz de forma local, sin enviar audio a servicios externos, con WER del 1,45 % en inglés limpio. Adecuado para entornos con requisitos de privacidad.
- Subtitulado automático de vídeo en inglés: los timestamps a nivel de token permiten alinear la transcripción con la línea temporal del vídeo, aunque la ausencia de puntuación requiere post-procesado.
- Indexación y búsqueda de archivos de audio: transcribir grandes volúmenes de grabaciones para generar índices de texto searchable, aprovechando el bajo RTF (125,5 en Metal M4 Max) para procesar horas de audio en minutos.
- Asistentes de voz embebidos en dispositivos: la cuantización Q4_K_M (825 MB) y la ejecución en CPU con Vulkan (RTF 11 en Ryzen 4750U) permiten integrar el modelo en equipos sin GPU dedicada.
- Generación de actas y notas en herramientas de productividad: transcripción de dictados y llamadas en inglés para posterior resumen con un LLM, usando la salida del ASR como entrada.
- Investigación en ASR y evaluación de runtimes: sirve como referencia para comparar implementaciones de transcribe.cpp frente a NeMo, con métricas de WER reproducibles sobre LibriSpeech test-clean.
- Pipelines de accesibilidad: transcripción en tiempo casi real de audio pregrabado para generar subtítulos en aplicaciones de accesibilidad, siempre que el audio sea inglés y mono a 16 kHz.

## Benchmarks y rendimiento

| Métrica | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,45 | 1,45 | 1,46 | 1,43 | 1,43 | 1,41 |
| Tamaño (GB) | 4,28 | 2,15 | 1,27 | 1,04 | 0,936 | 0,825 |

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 125,5 |
| Apple M4 Max | CPU | 17,5 |
| AMD Ryzen 4750U | Vulkan | 11 |
| AMD Ryzen 4750U | CPU | 5,5 |

El WER se midió sobre el split completo de LibriSpeech test-clean (2.620 utterances) con decodificación RNN-T greedy y sin LM externo. La referencia F32 es 1,45 %; el número autoinformado por NVIDIA en el mismo split es 1,46 %. No se han publicado en la información disponible resultados de otros benchmarks (p. ej., Common Voice, TED-LIUM, MLS).

## Requisitos de hardware

- VRAM/RAM estimada: entre 825 MB (Q4_K_M) y 4,28 GB (F32) para los pesos; añadir overhead del runtime y buffers de audio.
- GPU recomendadas: Apple Silicon con Metal (M1/M2/M3/M4) para máximo throughput; GPUs x86 compatibles con Vulkan.
- Cabe en GPU de consumo: sí, cualquier GPU con al menos 1-2 GB de memoria libre para cuantizaciones Q4/Q5/Q8.
- CPU: funciona en x86 con Vulkan (RTF 11 en Ryzen 4750U) y en ARM; en CPU pura el RTF baja a 5,5 en Ryzen 4750U y 17,5 en M4 Max.
- Opciones de despliegue: `transcribe.cpp` (CLI `transcribe-cli`), compilado desde fuente con CMake. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a ASR).
- Latencia y throughput: RTF de 125,5 en Metal M4 Max implica procesar 125,5 segundos de audio por segundo de cómputo; en CPU Ryzen 4750U, 5,5 segundos de audio por segundo.
- Preprocesado obligatorio: audio convertido a WAV mono 16 kHz con ffmpeg (`-ar 16000 -ac 1`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---:|---:|---|---|
| parakeet-rnnt-1.1b (GGUF) | 1,07 B | no disponible | 1,45 % (F32) | CC-BY-4.0 | GGUF |
| nvidia/parakeet-rnnt-1.1b (original) | 1,1 B | no disponible | 1,46 % (autoinformado) | CC-BY-4.0 | NeMo (.nemo) |
| Whisper large-v3 | 1,55 B | 30 s por ventana | ~1,8-2,0 % (referencia pública) | MIT | safetensors, GGUF, etc. |
| Wav2Vec2 large | ~0,3 B | no disponible | ~1,8-2,0 % (referencia pública) | MIT/Apache-2.0 | safetensors |

La comparación con Whisper y Wav2Vec2 se basa en cifras públicas de referencia y no en una evaluación directa en la información proporcionada; tómense como orientativas. La ventaja principal de esta conversión es el formato GGUF y el runtime C++ ligero, frente a la dependencia de NeMo o PyTorch del modelo original.

## Limitaciones y advertencias

- Solo inglés: no transcribe otros idiomas ni detecta el idioma de entrada.
- Salida en minúsculas y sin puntuación: requiere post-procesado para texto legible.
- No es streaming: procesa el audio completo por ventanas, no en tiempo real continuo.
- No traduce: la transcripción es monolingüe.
- Riesgo de alucinación en audio con ruido, acentos no nativos o solapamiento de hablantes; el WER de 1,45 % corresponde a LibriSpeech (audio limpio de lectura).
- Sin diarización ni identificación de hablantes.
- Sin modelo de lenguaje externo: errores en nombres propios y términos técnicos no se corrigen contextualmente.
- Licencia CC-BY-4.0: permite uso comercial con atribución; no hay restricciones adicionales conocidas, pero conviene revisar la model card upstream.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema reducido, menor probabilidad de soporte comunitario.
- Dependencia de `transcribe.cpp`, un runtime con commits fijados; cambios en la API pueden romper la integración.
- No apto para tareas de razonamiento, generación de texto, código o agentes.

## Enlaces

- Hugging Face: https://huggingface.co/tryambientai/parakeet-rnnt-1.1b-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-rnnt-1.1b
- Commit upstream fijado: https://huggingface.co/nvidia/parakeet-rnnt-1.1b/commit/a07b19e
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-rnnt-1.1b.md
- Paper FastConformer: https://arxiv.org/abs/2305.05084
- Documentación NeMo ASR: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- NVIDIA Developer Portal: https://developer.nvidia.com
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo
