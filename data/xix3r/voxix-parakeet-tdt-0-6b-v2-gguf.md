# xix3r/voxix-parakeet-tdt-0.6b-v2-gguf

## Resumen

`xix3r/voxix-parakeet-tdt-0.6b-v2-gguf` es una conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-tdt-0.6b-v2`, publicada por el usuario xix3r. El modelo original lo desarrolla NVIDIA y está diseñado para transcripción de inglés de alta calidad con puntuación, mayúsculas y marcas de tiempo a nivel de token. Esta versión GGUF está pensada para ejecutarse con `transcribe.cpp`, una implementación en C++ que permite inferencia local en CPU y GPU sin depender del stack de NeMo.

Arquitectónicamente es un FastConformer XL de aproximadamente 618 millones de parámetros con decodificador TDT (Token-and-Duration Transducer), un tipo de RNNT que predice conjuntamente tokens y duraciones. El modelo procesa audio de hasta 24 minutos en una sola pasada y no es de tipo streaming. Solo soporta inglés; para capacidades multilingües NVIDIA remite a la versión v3.

La relevancia de esta conversión reside en que empaqueta el modelo en cuantizaciones que van de 483 MB (Q4_K_M) a 2,47 GB (F32), con una degradación de WER mínima (1,68 % en F32 frente a 1,72 % en Q4_K_M sobre LibriSpeech test-clean). Esto lo hace viable para transcripción offline en hardware de consumo, incluyendo portátiles con CPU y aceleración Vulkan o Metal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer XL con decodificador TDT/RNNT (transducer) |
| Parametros totales | 617.869.958 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | audio de hasta 24 minutos en una sola pasada (no es contexto de texto) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (librería `transcribe.cpp`) |

## Arquitectura y entrenamiento

El modelo base es un FastConformer XL, una variante del encoder Conformer optimizada para eficiencia en ASR, combinada con un decodificador TDT (Token-and-Duration Transducer). El TDT extiende el esquema RNNT clásico prediciendo de forma conjunta el token y su duración, lo que reduce el número de pasos de decodificación y mejora el throughput. Según la model card upstream, el encoder se entrena con atención completa, lo que permite transcribir segmentos de audio de hasta 24 minutos en una única pasada. El modelo reporta un RTFx de 3380 en el leaderboard HF-Open-ASR con batch de 128, aunque ese valor depende de la duración del audio y del tamaño de batch.

La información proporcionada no detalla el volumen de tokens de audio, la composición exacta del dataset de entrenamiento ni si se aplicaron etapas de RLHF o DPO (no aplicables habitualmente en ASR). La model card upstream menciona robustez en números hablados y transcripción de letras de canciones, así como predicción de puntuación, mayúsculas y marcas de tiempo a nivel de palabra. La conversión GGUF se realizó a partir del commit `1b149a3` del modelo original (fijado el 2026-04-15) y se validó numéricamente contra la referencia de NeMo en el commit `bf0d0b7` de `transcribe.cpp` el 2026-04-18.

## Capacidades

- Transcripción de voz a texto offline en inglés a partir de WAV mono a 16 kHz.
- Predicción de puntuación y mayúsculas automáticas en la salida.
- Marcas de tiempo a nivel de token (el campo `timestamps: token` de la model card).
- Robustez en números hablados y en transcripción de letras de canciones.
- Procesamiento de segmentos largos de audio de hasta 24 minutos en una sola pasada.
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No soporta detección de idioma (`lang_detect: false`).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- Capacidad multilingüe limitada al inglés; para 25 idiomas europeos NVIDIA remite a `parakeet-tdt-0.6b-v3`.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo acepta segmentos de hasta 24 minutos en una sola pasada, lo que permite transcribir una reunión completa sin fragmentar el audio y con marcas de tiempo por token para alinear la transcripción con la grabación.
- Subtitulado y generación de subtítulos: las marcas de tiempo a nivel de token y la puntuación automática facilitan la construcción de ficheros de subtítulos (SRT/VTT) a partir de audio en inglés.
- Actas y notas de voz en local: al ejecutarse con `transcribe.cpp` sobre CPU o GPU de consumo, permite transcribir notas de voz sin enviar audio a servicios externos, relevante por privacidad.
- Indexación y búsqueda de archivos de audio: transcribir un archivo de podcasts o una biblioteca de grabaciones para habilitar búsqueda por texto sobre el contenido hablado.
- Preprocesado para pipelines de NLP: generar transcripciones con puntuación y mayúsculas listas para alimentar resúmenes, análisis de sentimiento o extracción de entidades en inglés.
- Transcripción de contenido multimedia para accesibilidad: generar texto a partir de vídeos o grabaciones en inglés para cumplir requisitos de accesibilidad.
- Despliegue en dispositivos con recursos limitados: la cuantización Q4_K_M (483 MB) permite ejecutar el modelo en portátiles sin GPU dedicada, con un coste de WER de solo 0,04 puntos porcentuales frente a F32.

## Benchmarks y rendimiento

Resultados de WER sobre LibriSpeech test-clean (2620 utterances), decodificación greedy del transducer sin LM externo, según la model card de la conversión:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 2,47 GB | 1,68 % |
| F16 | 1,24 GB | 1,68 % |
| Q8_0 | 730 MB | 1,69 % |
| Q6_K | 608 MB | 1,70 % |
| Q5_K_M | 547 MB | 1,70 % |
| Q4_K_M | 483 MB | 1,72 % |

NVIDIA reporta 1,69 % en el mismo split para el modelo original, por lo que las conversiones F32 y Q8_0 coinciden con la referencia upstream dentro del redondeo.

Rendimiento (RTF, factor de tiempo real) reportado en la model card:

| Plataforma | Backend | RTF |
|---|---|---:|
| Ryzen 4750U | CPU | 8 |
| Ryzen 4750U | Vulkan | 15 |
| Apple M4 Max | CPU | 29 |
| Apple M4 Max | Metal | 175 |

El modelo original reporta un RTFx de 3380 en el leaderboard HF-Open-ASR con batch de 128, valor que depende de la duración del audio y del tamaño de batch. No se han publicado en la información disponible resultados de benchmarks comparativos adicionales (por ejemplo, MMLU, HumanEval o GSM8K), que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 483 MB (Q4_K_M) y 2,47 GB (F32) solo para los pesos; hay que añadir el overhead del runtime y los buffers de audio.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; la model card reporta cifras en Apple M4 Max con Metal y en Ryzen 4750U con Vulkan.
- Cabe en GPU de consumo: sí, incluso las cuantizaciones más pequeñas caben en iGPU y en GPU de gama baja; la Q4_K_M (483 MB) es apta para equipos sin GPU dedicada.
- Opciones de despliegue: `transcribe.cpp` (CLI `transcribe-cli`), compilado desde fuente con CMake. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato y runtime.
- Latencia y throughput: RTF de 8 en CPU Ryzen 4750U, 15 con Vulkan en la misma CPU, 29 en CPU de Apple M4 Max y 175 con Metal en M4 Max. Un RTF más alto implica mayor velocidad relativa al tiempo real del audio.
- Requisito de entrada: audio WAV mono a 16 kHz; la model card sugiere convertir con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Formato |
|---|---:|---|---|---|---|
| xix3r/voxix-parakeet-tdt-0.6b-v2-gguf | 617,9 M | inglés | hasta 24 min por pasada | CC-BY-4.0 | GGUF |
| nvidia/parakeet-tdt-0.6b-v2 (original) | 0,6 B | inglés | hasta 24 min por pasada | CC-BY-4.0 | NeMo (.nemo) |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | 25 idiomas europeos | no disponible | no disponible en la información proporcionada | no disponible |

La comparación con otros modelos ASR de tamaño similar (por ejemplo, Whisper small/medium) no está disponible en la información proporcionada; no se aportan datos de WER ni de rendimiento de esos modelos en esta ficha para no inventar cifras.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas, detección de idioma ni traducción; para multilingüe NVIDIA remite a `parakeet-tdt-0.6b-v3`.
- No es streaming: requiere el audio completo (o un segmento) como entrada; no apto para transcripción en tiempo real continua sin segmentar.
- Riesgo de alucinación y errores en audio con ruido, acentos no nativos, solapamiento de hablantes o vocabulario muy específico; el WER de referencia (1,68 %) corresponde a LibriSpeech test-clean, un corpus limpio de lectura, no a audio real.
- Sesgos: la información disponible no documenta análisis de sesgos por acento, género o demografía; se desconoce el comportamiento en dominios no representados en el entrenamiento.
- Licencia CC-BY-4.0: permite uso comercial con atribución; hay que conservar la atribución a NVIDIA y al autor de la conversión, y revisar los términos upstream.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: la conversión es reciente y no tiene validación comunitaria amplia; conviene verificar la integridad de los ficheros y reproducir las cifras de WER antes de usarla en producción.
- Dependencia de `transcribe.cpp`: el soporte, el rendimiento y la estabilidad dependen de ese runtime, no del ecosistema NeMo; la validación se hizo contra un commit concreto (`bf0d0b7`).
- Requiere audio WAV mono a 16 kHz; hay que preprocesar otros formatos y sample rates.

## Enlaces

- Repositorio Hugging Face de la conversión: https://huggingface.co/xix3r/voxix-parakeet-tdt-0.6b-v2-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Modelo multilingüe v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Commit del modelo base usado para la conversión: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2/commit/1b149a3
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/bf0d0b7
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-tdt-0.6b-v2.md
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/nvidia/parakeet-tdt-0.6b-v2
- Documentación de NeMo sobre FastConformer: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode.en
- Referencias arXiv citadas en los tags: arxiv:2305.05084, arxiv:2304.06795, arxiv:2406.00899, arxiv:2410.01036, arxiv:2505.13404
