# xix3r/voxix-parakeet-rnnt-0.6b-gguf

## Resumen

Voxix Parakeet RNNT 0.6B GGUF es una conversión al formato GGUF del modelo de reconocimiento automático del habla `nvidia/parakeet-rnnt-0.6b`, publicada por el usuario xix3r para su uso con el motor de inferencia transcribe.cpp. El modelo original lo desarrollaron conjuntamente los equipos de NVIDIA NeMo y Suno.ai, y se trata de una variante XL de la arquitectura FastConformer Transducer (alrededor de 600 millones de parámetros) especializada en transcripción de voz en inglés.

La relevancia de esta conversión concreta reside en el empaquetado: ofrece el modelo en seis niveles de cuantización GGUF (de F32 a Q4_K_M) que van desde 2,47 GB hasta 476 MB, lo que permite ejecutar ASR de calidad cercana al estado del arte en hardware modesto, incluidos CPU y GPUs de consumo. La conversión está validada numéricamente contra la referencia de NeMo y mantiene un WER de 1,62 % en LibriSpeech test-clean en todas las cuantizaciones salvo Q4_K_M, que incluso mejora ligeramente hasta 1,59 %.

Se trata de un modelo puramente de transcripción offline: no soporta streaming, no traduce, no detecta idioma y su salida es en minúsculas y sin puntuación. Está pensado para pipelines de speech-to-text en inglés donde se prioriza precisión y eficiencia en inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-Large encoder + RNN-T transducer decoder |
| Parametros totales | ~0.6B (600 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, opera sobre audio; ventana de atención del encoder no especificada en la información disponible) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura FastConformer Transducer, que combina un encoder FastConformer-Large (una variante de Conformer con atención por bloques que reduce el coste computacional) con un decoder de tipo transducer RNN-T. La decodificación es greedy RNN-T, sin modelo de lenguaje externo. El modelo base fue desarrollado por NVIDIA NeMo y Suno.ai; la información disponible no detalla el volumen de tokens de audio ni la composición exacta del dataset de entrenamiento, ni si se aplicaron etapas de RLHF o DPO (no aplicables habitualmente en ASR).

La conversión a GGUF fue realizada por xix3r a partir del commit `c0c1f09` del modelo upstream (fijado el 2026-05-10) y validada contra la referencia de NeMo en el commit `42528dd` de transcribe.cpp. La innovación destacable de esta ficha es el propio proceso de cuantización: se preserva la precisión del modelo original (WER idéntico en F16, Q8_0, Q6_K y Q5_K_M respecto a F32) incluso en formatos de 540 MB, lo que demuestra robustez de la arquitectura frente a la cuantización K-quant.

## Capacidades

- Transcripción de voz a texto en inglés, offline, con salida en minúsculas y sin puntuación.
- Decodificación greedy RNN-T sin modelo de lenguaje externo.
- Generación de timestamps a nivel de token (campo `timestamps: token` en la configuración de transcribe.cpp).
- Ejecución en CPU y GPU mediante backends Metal (macOS) y Vulkan, además de CPU pura.
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No soporta detección de idioma (`lang_detect: false`).
- No dispone de tool calling, function calling ni capacidades de agente (es un modelo ASR, no un LLM).
- No dispone de capacidades de visión, audio generativo ni modo thinking.

## Casos de uso

- Transcripción de reuniones y entrevistas en inglés: el modelo procesa audio de 16 kHz mono WAV de forma offline con un WER de 1,62 % en LibriSpeech test-clean, adecuado para generar actas o subtítulos de grabaciones ya existentes.
- Subtitulado automático de vídeo bajo demanda: integrado en un pipeline que convierte pistas de audio a WAV 16 kHz mono con ffmpeg y ejecuta `transcribe-cli`, generando transcripciones con timestamps a nivel de token para alinear subtítulos.
- Procesamiento por lotes en servidores sin GPU: la cuantización Q4_K_M (476 MB) permite ejecutar la transcripción en CPU con un RTF de 8 sobre un Ryzen 4750U (8 veces más rápido que tiempo real), lo que hace viable transcribir horas de audio en hardware de bajo coste.
- Aplicaciones de escritorio y utilidades locales en macOS: con backend Metal sobre un M4 Max se alcanza un RTF de 185,5, lo que permite transcripción casi instantánea en portátiles Apple Silicon para herramientas de dictado o notas de voz.
- Transcripción en dispositivos con GPU integrada o Vulkan: el backend Vulkan sobre Ryzen 4750U logra un RTF de 14,5, útil para aplicaciones de accesibilidad o asistentes de voz locales en equipos sin GPU dedicada.
- Pipelines de análisis de llamadas y atención al cliente en inglés: al ser offline y no requerir servicios en la nube, permite transcribir grabaciones de centros de contacto manteniendo los datos en la infraestructura propia, con la salvedad de que la salida no incluye puntuación ni mayúsculas y requerirá un postprocesado.
- Investigación en ASR y evaluación de cuantizaciones: sirve como referencia reproducible para comparar el impacto de distintas cuantizaciones GGUF en la precisión de un modelo transducer, dado que el autor documenta el WER por cuantización.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1.62 | 1.62 | 1.62 | 1.62 | 1.62 | 1.59 |
| Tamano (GB) | 2.47 | 1.24 | 0.73 | 0.601 | 0.540 | 0.476 |

| Metrica de velocidad | Backend | RTF |
|---|---|---:|
| M4 Max | Metal | 185.5 |
| M4 Max | CPU | 30 |
| Ryzen 4750U | Vulkan | 14.5 |
| Ryzen 4750U | CPU | 8 |

El WER se midió sobre el split completo de LibriSpeech test-clean (2620 utterances) con decodificación greedy RNN-T y sin LM externo. La referencia F32 es 1,62 %; el dato autoinformado por NVIDIA en el mismo split es 1,63 %. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no ser aplicables a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más overhead; entre ~0,5 GB (Q4_K_M) y ~2,5 GB (F32) en memoria.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon, validado en M4 Max) o Vulkan (validado en Ryzen 4750U con GPU integrada); GPUs dedicadas NVIDIA/AMD no documentadas explícitamente en la información disponible.
- Cabe en GPUs de consumo: sí, con amplio margen; incluso la versión F32 (2,47 GB) cabe en GPUs con 4 GB o más de VRAM.
- Ejecución en CPU: viable, con RTF de 8 sobre Ryzen 4750U y de 30 sobre M4 Max.
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: expresados como RTF (factor de tiempo real); a mayor RTF, más rápido que tiempo real. Metal sobre M4 Max ofrece el mejor rendimiento documentado (185,5).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---:|---:|---|---|
| Voxix Parakeet RNNT 0.6B GGUF (esta ficha) | ~0.6B | en | 1.62 % (1.59 % en Q4_K_M) | CC-BY-4.0 | GGUF |
| nvidia/parakeet-rnnt-0.6b (original) | ~0.6B | en | 1.63 % (autoinformado) | CC-BY-4.0 | NeMo (.nemo) |
| Otras variantes Parakeet de NVIDIA (CTC, TDT) | no disponible | en | no disponible | CC-BY-4.0 | no disponible |

La información disponible solo permite comparar con el modelo base original, del que esta conversión hereda arquitectura y precisión. No se dispone de datos de otros modelos ASR comparables (por ejemplo, Whisper) en la documentación proporcionada, por lo que no se incluyen cifras adicionales.

## Limitaciones y advertencias

- Solo soporta inglés; no detecta idioma ni traduce, por lo que audio en otros idiomas producirá transcripciones incorrectas o vacías.
- Salida en minúsculas y sin puntuación: requiere postprocesado (capitalización, puntuación, segmentación) para muchos usos en producción.
- No es un modelo de streaming: debe procesarse audio completo o por segmentos ya grabados, no en tiempo real continuo.
- Riesgo de alucinación y errores en audio con ruido, acentos no vistos en entrenamiento, solapamiento de hablantes o vocabulario técnico; el WER de 1,62 % corresponde a LibriSpeech test-clean, un conjunto relativamente limpio y no representativo de todas las condiciones reales.
- Sesgos potenciales heredados del dataset de entrenamiento de NVIDIA, no documentados en la información disponible.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución; es necesario citar a NVIDIA y respetar los términos del modelo upstream.
- Dependencia de transcribe.cpp: el modelo solo es utilizable con ese motor, lo que limita la portabilidad frente a ecosistemas como NeMo, ONNX o PyTorch.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopción comunitaria ni de mantenimiento a largo plazo por parte del autor de la conversión.
- El audio debe convertirse previamente a WAV 16 kHz mono; otros formatos o frecuencias de muestreo no se procesan directamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xix3r/voxix-parakeet-rnnt-0.6b-gguf
- Modelo base original: https://huggingface.co/nvidia/parakeet-rnnt-0.6b
- Commit del modelo base utilizado: https://huggingface.co/nvidia/parakeet-rnnt-0.6b/commit/c0c1f09
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-rnnt-0.6b.md
- Documentación de arquitecturas ASR de NeMo (FastConformer): https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Documentación de NeMo Toolkit para ASR: https://docs.nvidia.com/nemo-framework/user-guide/latest/nemotoolkit/asr/models.html
- Repositorio NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Paper de referencia (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Portal de desarrolladores de NVIDIA: https://developer.nvidia.com
- NVIDIA Riva Speech: https://developer.nvidia.com/riva
- Suno.ai: https://www.suno.ai/
