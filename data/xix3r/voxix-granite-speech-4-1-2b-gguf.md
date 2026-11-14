# xix3r/voxix-granite-speech-4.1-2b-gguf

## Resumen

Voxix Granite Speech 4.1 2B GGUF es una conversión a formato GGUF del modelo `ibm-granite/granite-speech-4.1-2b` de IBM, publicada por el usuario xix3r para su uso con el runtime transcribe.cpp. Se trata de un modelo de voz a texto (ASR) y traducción de voz (AST) offline, multilingüe, con 2.313.228.092 parámetros totales y licencia Apache-2.0. La conversión preserva la arquitectura original del modelo base y ofrece seis niveles de cuantización, desde BF16/F16 hasta Q4_K_M, con un tamaño que va de 4,63 GB a 1,60 GB.

El modelo resuelve dos tareas concretas: transcribir audio en inglés, francés, alemán, español, portugués y japonés, y traducir voz entre el inglés y cada uno de esos cinco idiomas en ambas direcciones (siempre pasando por inglés, sin traducción directa entre pares no ingleses). La relevancia de esta conversión radica en que permite ejecutar un audio-LLM de 2B parámetros en hardware de consumo y en CPU, con tasas de error competitivas (WER de 1,29–1,37 % en LibriSpeech test-clean según la cuantización) y un factor de tiempo real (RTF) de 33 en Metal sobre un Apple M4 Max.

La arquitectura combina un encoder Conformer con atención Shaw de bloque local, un proyector Q-Former de tipo BLIP-2 y un decoder autoregresivo basado en granite-4.0-1b-base. Esta versión 4.1 incorpora mejoras en puntuación y uso de mayúsculas respecto a 4.0-1b, además de un encoder CTC de doble cabeza (salidas grafémicas y BPE) con muestreo de importancia de frames.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM: encoder Conformer con atención Shaw de bloque local + proyector Q-Former (BLIP-2) + decoder autoregresivo granite-4.0-1b-base |
| Parametros totales | 2.313.228.092 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, pt, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un audio-LLM que alinea un checkpoint intermedio de `granite-4.0-1b-base` con voz mediante un encoder Conformer equipado con atención Shaw de bloque local y un proyector Q-Former de tipo BLIP-2, que conecta las representaciones acústicas con el espacio del decoder lingüístico. El decoder es autoregresivo y genera la transcripción o traducción token a token. La versión 4.1 introduce un encoder CTC de doble cabeza con salidas grafémicas y BPE, junto con muestreo de importancia de frames para centrarse en las partes informativas del audio, lo que mejora la precisión multilingüe.

El entrenamiento se realizó sobre 174.000 horas de audio procedentes de corpus públicos para ASR y AST, complementadas con datasets sintéticos orientados a ASR en japonés, ASR con sesgo por palabras clave y traducción de voz. No se dispone de información sobre el uso de RLHF o DPO en la información proporcionada. La conversión a GGUF fue realizada por xix3r a partir del commit upstream `8f4bb5f` (fijado el 2026-05-17) y validada contra la referencia de Transformers en el commit `275332d` de transcribe.cpp el 2026-05-17.

## Capacidades

- Transcripción de voz a texto offline en inglés, francés, alemán, español, portugués y japonés.
- Traducción de voz bidireccional entre inglés y cada uno de los otros cinco idiomas (en ↔ fr, en ↔ de, en ↔ es, en ↔ pt, en ↔ ja), siempre a través del inglés.
- Puntuación y uso de mayúsculas correctos en ASR y AST para todos los idiomas, incluida la capitalización de sustantivos en alemán, mediante un cambio simple de prompt.
- Sesgo por lista de palabras clave (keyword list biasing) para mejorar el reconocimiento de nombres, acrónimos y jerga técnica.
- Entrada de audio en WAV mono a 16 kHz.
- No soporta streaming (según metadatos de transcribe.cpp).
- No soporta detección de idioma (lang_detect: false).
- No genera timestamps (timestamps: none).
- Soporta traducción (translate: true).

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa audio WAV mono a 16 kHz y genera transcripciones con puntuación y mayúsculas correctas, lo que reduce el post-procesado necesario en herramientas de documentación corporativa.
- Subtitulado multilingüe de vídeo: al soportar ASR en seis idiomas y traducción vía inglés, permite generar subtítulos en inglés a partir de audio en francés, alemán, español, portugués o japonés, y viceversa, en pipelines offline.
- Atención al cliente con grabaciones: la función de sesgo por palabras clave mejora el reconocimiento de nombres de producto, acrónimos internos y jerga técnica en llamadas grabadas, útil para análisis de calidad y compliance.
- Transcripción en dispositivos de borde: con cuantización Q4_K_M (1,60 GB) y RTF de 5,8 en CPU sobre un M4 Max, el modelo puede ejecutarse en portátiles sin GPU dedicada para dictado o notas de voz.
- Traducción de entrevistas y contenido periodístico: la traducción bidireccional en ↔ es/pt/fr/de/ja permite transcribir y traducir entrevistas completas sin conexión, preservando la privacidad del contenido.
- Investigación en ASR multilingüe: al ser una conversión GGUF validada numéricamente contra la referencia de Transformers, sirve como base reproducible para experimentos de cuantización y evaluación de WER en distintos backends (Metal, Vulkan, CPU).
- Procesamiento por lotes en servidores sin GPU: con RTF de 1,4 en CPU sobre Ryzen 4750U y 2,8 en Vulkan, es viable transcribir archivos de audio en servidores modestos sin acelerador dedicado.

## Benchmarks y rendimiento

WER medido sobre el split completo LibriSpeech test-clean (2620 enunciados) con decodificación greedy y normalizador de texto Whisper `EnglishTextNormalizer`:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 4,63 GB | 1,31 % |
| F16 | 4,63 GB | 1,32 % |
| Q8_0 | 2,56 GB | 1,32 % |
| Q6_K | 2,02 GB | 1,29 % |
| Q5_K_M | 1,83 GB | 1,33 % |
| Q4_K_M | 1,60 GB | 1,37 % |

El baseline BF16 local (1,31 %) queda 0,02 pp por debajo del 1,33 % publicado por el autor upstream, diferencia atribuida a normalización y dentro del intervalo de confianza bootstrap.

Rendimiento en factor de tiempo real (RTF):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 33 |
| Apple M4 Max | CPU | 5,8 |
| Apple M4 | Metal | 12 |
| Apple M4 | CPU | 4 |
| Ryzen 4750U | Vulkan | 2,8 |
| Ryzen 4750U | CPU | 1,4 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que el modelo es específico de ASR/AST.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB con Q4_K_M (1,60 GB de pesos), unos 3 GB con Q8_0 (2,56 GB) y alrededor de 5 GB con BF16/F16 (4,63 GB), añadiendo overhead de runtime.
- GPU recomendadas: Apple Silicon (M4, M4 Max) con backend Metal; GPU AMD/Intel con Vulkan; no se especifican modelos NVIDIA concretos en la información disponible.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M a Q8_0 en GPUs con 4–6 GB de VRAM o memoria unificada; también en CPU.
- Opciones de despliegue: transcribe.cpp (runtime oficial de esta conversión, con CLI `transcribe-cli`); no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 33 en Metal sobre M4 Max, 12 en Metal sobre M4, 5,8 en CPU sobre M4 Max, 4 en CPU sobre M4, 2,8 en Vulkan sobre Ryzen 4750U y 1,4 en CPU sobre Ryzen 4750U. Un RTF superior a 1 indica procesamiento más rápido que el tiempo real.
- Entrada requerida: WAV mono a 16 kHz; conversión previa con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---:|---|---|---|---|
| Voxix Granite Speech 4.1 2B GGUF | 2,31 B | no disponible | en, fr, de, es, pt, ja | Apache-2.0 | GGUF | ASR + AST, offline, RTF alto en Metal/CPU |
| ibm-granite/granite-speech-4.1-2b (base) | 2,31 B | no disponible | en, fr, de, es, pt, ja | Apache-2.0 | safetensors | Modelo original, requiere Transformers |
| granite-4.0-1b-speech (predecesor) | no disponible | no disponible | no disponible | Apache-2.0 | no disponible | Misma arquitectura, sin mejoras de puntuación ni doble cabeza CTC |

No se dispone de datos de benchmarks comparativos con otros modelos ASR (Whisper, etc.) en la información proporcionada.

## Limitaciones y advertencias

- No soporta streaming: requiere audio completo en WAV mono a 16 kHz.
- No realiza detección automática de idioma: el idioma debe especificarse o inferirse externamente.
- No genera timestamps, lo que limita su uso en subtitulado sincronizado.
- La traducción solo funciona entre inglés y los otros cinco idiomas; no hay traducción directa fr↔de, es↔pt, etc.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en audio con ruido, acentos no cubiertos o solapamiento de hablantes.
- El WER se ha medido únicamente en LibriSpeech test-clean (inglés); el rendimiento en otros idiomas y dominios no está cuantificado en la información disponible.
- Sesgos conocidos: no se documentan en la información proporcionada; al entrenarse con corpus públicos, puede heredar sesgos de esos datasets.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card upstream para términos completos.
- La conversión GGUF está validada contra un commit concreto de transcribe.cpp (`275332d`); cambios en el runtime pueden afectar la compatibilidad.
- El repositorio tiene solo 31 descargas y 0 likes, lo que indica validación comunitaria limitada.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/xix3r/voxix-granite-speech-4.1-2b-gguf
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-4.1-2b
- Commit upstream fijado: https://huggingface.co/ibm-granite/granite-speech-4.1-2b/commit/8f4bb5f
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/275332d
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/granite-speech-4.1-2b.md
- Descargas GGUF (handy-computer): https://huggingface.co/handy-computer/granite-speech-4.1-2b-gguf
- Predecesor: https://huggingface.co/ibm-granite/granite-4.0-1b-speech
- LLM base: https://huggingface.co/ibm-granite/granite-4.0-1b-base
