# tryambientai/parakeet-tdt_ctc-110m-gguf

## Resumen

`tryambientai/parakeet-tdt_ctc-110m-gguf` es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-tdt_ctc-110m`, desarrollado originalmente por los equipos de NVIDIA NeMo y Suno.ai. La conversión la firma el usuario `tryambientai` y está pensada para su uso con `transcribe.cpp`, un motor de inferencia en C++ derivado del ecosistema de llama.cpp. El modelo resuelve transcripción de voz a texto en inglés, offline, con puntuación y mayúsculas incluidas.

Arquitectónicamente es un encoder FastConformer de aproximadamente 114 millones de parámetros con un decoder transducer TDT/RNNT. La conversión descarta la cabeza CTC auxiliar del checkpoint híbrido original, de modo que la inferencia se realiza con decodificación TDT/RNN-T greedy. Al ser un modelo compacto (90-457 MB según cuantización) y con un RTFx muy alto, está orientado a despliegues en CPU, GPUs de consumo y dispositivos con Metal o Vulkan.

Su relevancia práctica radica en que permite ejecutar un ASR de calidad cercana al estado del arte (2,43 % de WER en LibriSpeech test-clean con F32) en hardware modesto, sin dependencias de Python ni de la pila de NeMo. No es un modelo de streaming ni traduce: está diseñado para transcripción offline de audio en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT/RNNT transducer (decoder); cabeza CTC descartada en la conversion |
| Parametros totales | 114.113.670 (aprox. 114 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; admite hasta 20 minutos de audio en una sola pasada segun la model card original |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp); el modelo base original esta en formato NeMo/.nemo |

## Arquitectura y entrenamiento

El modelo base es un FastConformer híbrido TDT-CTC. El encoder FastConformer es una variante de Conformer con atención completa, lo que permite procesar hasta 20 minutos de audio en una única pasada sin chunking. El decoder es un transducer TDT (Token-and-Duration Transducer), una variante de RNN-T que predice conjuntamente tokens y duraciones, lo que acelera la decodificación frente a RNN-T clásico. El checkpoint original incluye además una cabeza CTC auxiliar que se usa durante el entrenamiento para regularizar; en esta conversión GGUF esa cabeza se elimina y la inferencia se hace exclusivamente con el decoder TDT/RNN-T en modo greedy.

La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o ajuste con preferencias, por lo que esos datos deben considerarse no disponibles en la información proporcionada. La conversión se realizó a partir del commit `431a349` del modelo upstream (fijado el 2026-05-10) y se validó numéricamente contra la referencia de NeMo en el commit `42528dd` de transcribe.cpp. Las etiquetas de la model card hacen referencia a los papers arXiv 2305.05084, 2304.06795 y 2104.02821, que corresponden a la arquitectura FastConformer, TDT y Conformer respectivamente.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación y capitalización automáticas.
- Procesamiento offline de audio de hasta 20 minutos en una sola pasada (según la model card upstream).
- Generación de timestamps a nivel de token (campo `timestamps: token` en la metadata de transcribe.cpp).
- Inferencia en CPU, GPU con Metal (Apple Silicon) y GPU con Vulkan, gracias al backend transcribe.cpp.
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No soporta detección de idioma (`lang_detect: false`).
- No es un modelo de lenguaje general: no hace tool calling, function calling, razonamiento multi-paso ni generación de código.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa hasta 20 minutos de audio por pasada y añade puntuación y mayúsculas, lo que reduce el post-procesado necesario para generar actas o notas.
- Subtitulado offline de vídeo: con timestamps a nivel de token, se pueden alinear segmentos de texto con el audio para generar ficheros de subtítulos en pipelines de postproducción.
- Dictado en aplicaciones de escritorio: al ejecutarse con transcribe.cpp en CPU o Metal, se puede integrar en apps nativas de macOS o Linux sin dependencias de Python ni de CUDA.
- Indexación y búsqueda de archivos de audio: transcripciones de alta calidad (WER 2,43 % en LibriSpeech test-clean) permiten construir índices de texto sobre archivos de voz para búsqueda semántica o por palabras clave.
- Atención al cliente y análisis de llamadas: la transcripción de grabaciones telefónicas en inglés permite extraer texto para análisis de sentimiento, cumplimiento normativo o resumen posterior con un LLM.
- Transcripción en dispositivos con recursos limitados: con cuantización Q4_K_M (90 MB) o Q5_K_M (101 MB), cabe en sistemas embebidos, Raspberry Pi o portátiles sin GPU dedicada, manteniendo un WER de 2,53 % y 2,47 % respectivamente.
- Generación de datasets de voz: al ser un modelo pequeño y rápido, se puede usar para pre-etiquetar grandes volúmenes de audio en inglés antes de una revisión humana o de un fine-tuning posterior.

## Benchmarks y rendimiento

Resultados de WER sobre LibriSpeech test-clean (2620 utterances, decodificación greedy TDT/RNN-T, sin LM externo):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 (referencia) | 457 MB | 2,43 % |
| F16 | 229 MB | 2,43 % |
| Q8_0 | 135 MB | 2,43 % |
| Q6_K | 112 MB | 2,44 % |
| Q5_K_M | 101 MB | 2,47 % |
| Q4_K_M | 90 MB | 2,53 % |

El dato autoinformado por NVIDIA para el mismo split es 2,40 %. La model card original reporta un RTFx medio de aproximadamente 5300 en los conjuntos de evaluación del leaderboard de Hugging Face sobre A100.

Rendimiento medido en transcribe.cpp (RTF, mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 347,5 |
| Apple M4 Max | CPU | 116 |
| AMD Ryzen 4750U | Vulkan | 32,5 |
| AMD Ryzen 4750U | CPU | 23,5 |

## Requisitos de hardware

- VRAM/RAM para inferencia: entre 90 MB (Q4_K_M) y 457 MB (F32) de pesos; el consumo total de memoria incluye buffers de audio y del decoder, pero se mantiene en el rango de cientos de MB.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) es suficiente; no requiere A100 ni H100 para inferencia.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de memoria libre; también funciona en CPU sin GPU.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que el formato GGUF aquí es específico de transcribe.cpp y no del ecosistema llama.cpp.
- Latencia y throughput: con RTF de 347,5 en Metal (M4 Max) y 23,5 en CPU (Ryzen 4750U), el modelo transcribe audio muchas veces más rápido que tiempo real en hardware modesto.
- Preprocesado obligatorio: el audio debe estar en WAV mono a 16 kHz; la model card sugiere convertir con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato / despliegue |
|---|---:|---|---|---|---|
| parakeet-tdt_ctc-110m (este GGUF) | 114 M | hasta 20 min por pasada | en | CC-BY-4.0 | GGUF para transcribe.cpp |
| nvidia/parakeet-tdt_ctc-110m (original) | 114 M | hasta 20 min por pasada | en | CC-BY-4.0 | NeMo (.nemo), requiere nemo_toolkit |
| Whisper large-v3 (referencia de la categoria) | 1550 M | 30 s por ventana | multilingue | MIT | safetensors, GGUF, multiples backends |
| Whisper small | 244 M | 30 s por ventana | multilingue | MIT | safetensors, GGUF, multiples backends |

Frente al modelo original de NVIDIA, esta conversión pierde la cabeza CTC y la integración con NeMo, pero gana portabilidad y elimina la dependencia de PyTorch y CUDA. Frente a Whisper, el modelo de Parakeet es mucho más pequeño y rápido, pero está limitado a inglés y no ofrece traducción ni detección de idioma. No se dispone de datos de benchmarks comparativos directos con Whisper en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no transcribe otros idiomas ni detecta el idioma del audio.
- No es streaming: requiere el audio completo (o un segmento de hasta 20 minutos) antes de transcribir.
- No traduce: la salida es siempre texto en inglés.
- Riesgo de alucinación y errores en audio con ruido, acentos no nativos, solapamiento de hablantes o vocabulario técnico fuera del dominio de entrenamiento.
- La cuantización Q4_K_M degrada ligeramente el WER (2,53 % frente a 2,43 % en F32); para producción con requisitos estrictos de precisión conviene usar Q8_0 o F16.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario citar a NVIDIA y Suno.ai según los términos del modelo base.
- El modelo es una conversión de terceros (`tryambientai`), no oficial de NVIDIA; la model card original es la fuente autoritativa.
- El formato GGUF es específico de transcribe.cpp; no es directamente compatible con llama.cpp, Ollama ni otros runners GGUF genéricos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de esta conversión concreta.
- No se dispone de información sobre sesgos específicos del dataset de entrenamiento en la documentación proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tryambientai/parakeet-tdt_ctc-110m-gguf
- Modelo base original: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Commit del modelo base usado en la conversión: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m/commit/431a349
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-tdt_ctc-110m.md
- Descargas GGUF (handy-computer): https://huggingface.co/handy-computer/parakeet-tdt_ctc-110m-gguf
- Paper FastConformer (arXiv 2305.05084): https://arxiv.org/abs/2305.05084
- Paper TDT (arXiv 2304.06795): https://arxiv.org/abs/2304.06795
- Paper Conformer (arXiv 2104.02821): https://arxiv.org/abs/2104.02821
- Documentación de NVIDIA NeMo ASR: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Repositorio NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Suno.ai: https://www.suno.ai/
