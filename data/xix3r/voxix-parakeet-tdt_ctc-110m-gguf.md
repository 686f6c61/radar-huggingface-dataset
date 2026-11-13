# xix3r/voxix-parakeet-tdt_ctc-110m-gguf

## Resumen

`voxix-parakeet-tdt_ctc-110m-gguf` es una conversión al formato GGUF del modelo ASR `nvidia/parakeet-tdt_ctc-110m`, publicada por el usuario xix3r para su uso con el runtime [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp). El modelo original es un sistema de reconocimiento automático del habla en inglés desarrollado conjuntamente por los equipos de NVIDIA NeMo y Suno.ai, orientado a transcripción offline con puntuación y mayúsculas automáticas.

La arquitectura es un encoder FastConformer de aproximadamente 114 millones de parámetros con un decoder transducer TDT/RNNT; la cabeza CTC auxiliar del checkpoint híbrido original se descarta durante la conversión. El modelo está pensado para transcripción de audio de hasta 20 minutos en una sola pasada gracias a su atención completa, y no soporta streaming ni traducción.

Su relevancia práctica radica en que esta conversión GGUF permite ejecutar un modelo ASR de calidad competitiva (2,43 % de WER en LibriSpeech test-clean) en hardware de consumo, con cuantizaciones que van desde 457 MB en F32 hasta 90 MB en Q4_K_M, manteniendo una degradación de WER mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + TDT/RNNT transducer decoder (híbrido TDT-CTC original, cabeza CTC descartada en la conversión) |
| Parametros totales | 114.113.670 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en tokens; admite hasta 20 minutos de audio en una sola pasada según el modelo original |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (runtime transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura FastConformer con atención completa, lo que le permite procesar secuencias de audio largas (hasta 20 minutos) sin fragmentación. Sobre el encoder se sitúa un decoder transducer TDT (Token-and-Duration Transducer), que predice conjuntamente tokens y duraciones, combinado en el checkpoint original con una cabeza CTC auxiliar para entrenamiento híbrido. En esta conversión GGUF se conserva únicamente el camino TDT/RNNT, que es el utilizado en inferencia con decodificación greedy.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en ASR). El modelo original reporta un RTFx medio de aproximadamente 5300 sobre los conjuntos de evaluación del leaderboard de Hugging Face en una A100, lo que refleja un diseño optimizado para throughput. La conversión fue validada numéricamente contra la referencia NeMo en el commit `42528dd` de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación y mayúsculas automáticas.
- Procesamiento offline de audio de hasta 20 minutos en una sola pasada.
- Generación de timestamps a nivel de token.
- Ejecución en CPU, Metal (Apple Silicon) y Vulkan según los datos de rendimiento del autor.
- No soporta streaming (procesamiento por lotes únicamente).
- No soporta traducción.
- No incluye detección de idioma.
- No dispone de tool calling ni capacidades de agente (es un modelo puramente ASR).
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Transcripción por lotes de reuniones y entrevistas: el modelo procesa hasta 20 minutos de audio en una sola pasada y genera puntuación y mayúsculas, lo que reduce el postprocesado necesario para actas y notas.
- Subtitulado offline de vídeo: los timestamps a nivel de token permiten alinear el texto transcrito con la pista de audio para generar subtítulos sincronizados en pipelines de postproducción.
- Dictado local en aplicaciones de escritorio: con cuantización Q4_K_M (90 MB) cabe en cualquier equipo y puede ejecutarse en CPU o Metal sin GPU dedicada, lo que facilita integrar dictado en herramientas de productividad sin enviar audio a la nube.
- Indexación y búsqueda de archivos de audio: transcripciones con WER bajo (~2,5 %) permiten construir índices de texto sobre archivos de voz para búsqueda semántica o por palabras clave en archivos históricos.
- Preprocesado de datasets de voz para investigación: al ser un modelo pequeño y rápido (RTF de 347,5 en Metal en un M4 Max), sirve para etiquetar grandes volúmenes de audio en inglés antes de entrenar otros modelos.
- Transcripción en dispositivos con recursos limitados: las versiones Q5_K_M y Q6_K mantienen WER por debajo del 2,5 % con tamaños de 101-112 MB, adecuadas para entornos embebidos o aplicaciones móviles con CPU.
- Accesibilidad en tiempo casi real por lotes: procesamiento de grabaciones de voz de usuarios para generar transcripciones en aplicaciones de accesibilidad, aceptando la limitación de no ser streaming.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 2,43 | 2,43 | 2,43 | 2,44 | 2,47 | 2,53 |
| Tamano (MB) | 457 | 229 | 135 | 112 | 101 | 90 |

| Metrica de velocidad | Valor |
|---|---|
| RTF en Metal (M4 Max) | 347,5 |
| RTF en CPU (M4 Max) | 116 |
| RTF en Vulkan (Ryzen 4750U) | 32,5 |
| RTF en CPU (Ryzen 4750U) | 23,5 |

El WER se midió sobre el split completo de LibriSpeech test-clean (2620 utterances) con decodificación greedy TDT/RNN-T y sin LM externo. La referencia F32 es 2,43 %; NVIDIA reporta 2,40 % en el mismo split. El modelo original reporta un RTFx medio de ~5300 en A100 sobre los conjuntos del leaderboard de Hugging Face.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones (90-457 MB de pesos); no requiere GPU dedicada.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan; en el modelo original se reportan cifras de RTFx en A100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer e incluso en CPU sin GPU.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`); el modelo original puede usarse con NVIDIA NeMo.
- Latencia y throughput: RTF de 347,5 en Metal (M4 Max), 116 en CPU (M4 Max), 32,5 en Vulkan (Ryzen 4750U) y 23,5 en CPU (Ryzen 4750U). El audio debe convertirse previamente a WAV mono a 16 kHz.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| parakeet-tdt_ctc-110m (este, GGUF) | 114 M | hasta 20 min | en | CC-BY-4.0 | GGUF |
| nvidia/parakeet-tdt_ctc-110m (original) | 114 M | hasta 20 min | en | CC-BY-4.0 | NeMo (.nemo) |
| Whisper small | no disponible en la informacion | no disponible en la informacion | multilingüe | no disponible en la informacion | no disponible en la informacion |

No se dispone en la información proporcionada de datos de benchmarks comparativos con otros modelos ASR, por lo que la comparación cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas ni traducción.
- No es streaming: requiere procesar el audio completo por lotes, lo que impide su uso en transcripción en vivo sin segmentación manual.
- No incluye detección de idioma.
- Riesgo de alucinación y errores en audio con ruido, acentos no nativos o vocabulario técnico; el WER de referencia (2,43 %) corresponde a LibriSpeech test-clean, un corpus limpio de lectura.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario citar al autor original (NVIDIA/Suno.ai) y respetar los términos del modelo base.
- La cuantización Q4_K_M eleva el WER a 2,53 %, una degradación pequeña pero medible frente a F32.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026; no hay evidencia de uso en producción.
- Requiere convertir el audio a WAV mono de 16 kHz antes de la inferencia.
- La cabeza CTC del checkpoint original se descarta, por lo que no se puede usar decodificación CTC con esta conversión.

## Enlaces

- [Hugging Face: xix3r/voxix-parakeet-tdt_ctc-110m-gguf](https://huggingface.co/xix3r/voxix-parakeet-tdt_ctc-110m-gguf)
- [Modelo base: nvidia/parakeet-tdt_ctc-110m](https://huggingface.co/nvidia/parakeet-tdt_ctc-110m)
- [Commit del modelo base 431a349](https://huggingface.co/nvidia/parakeet-tdt_ctc-110m/commit/431a349)
- [Repositorio transcribe.cpp](https://github.com/handy-computer/transcribe.cpp)
- [Commit de validación 42528dd](https://github.com/handy-computer/transcribe.cpp/tree/42528dd)
- [Página del modelo en transcribe.cpp](https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-tdt_ctc-110m.md)
- [NVIDIA NeMo](https://github.com/NVIDIA/NeMo)
- [Documentación FastConformer de NeMo](https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer)
- [Suno.ai](https://www.suno.ai/)
- Paper FastConformer: [arXiv:2305.05084](https://arxiv.org/abs/2305.05084)
- Paper TDT: [arXiv:2304.06795](https://arxiv.org/abs/2304.06795)
- Paper RNNT: [arXiv:2104.02821](https://arxiv.org/abs/2104.02821)
