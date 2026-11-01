# tryambientai/Fun-ASR-Nano-2512-gguf

## Resumen

Fun-ASR-Nano-2512-gguf es la conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) Fun-ASR-Nano-2512, desarrollado originalmente por Tongyi Lab (Alibaba) y portado por el usuario tryambientai para su uso con la librería transcribe.cpp. El modelo resuelve el problema de transcripción de voz a texto offline en chino, inglés y japonés, además de siete dialectos chinos (wu, cantonés, min, hakka, gan, xiang y jin) y 26 acentos regionales del mandarín.

Arquitectónicamente es un modelo híbrido audio-LLM: un codificador SenseVoiceEncoderSmall congelado (50 bloques principales SAN-M y 20 bloques transformer) alimenta un adaptador de audio de 2 capas (512 → 1024) que conecta con un LLM Qwen3-0.6B empaquetado (28 capas, GQA 16/8, BF16) que genera la transcripción de forma autorregresiva. El conjunto suma aproximadamente 800 millones de parámetros entrenables y acepta audio WAV mono a 16 kHz.

Su relevancia actual reside en que ofrece una alternativa ligera y cuantizable (desde 531 MB en Q4_K_M) para transcripción multilingüe en entornos sin GPU dedicada, con una tasa de error de palabra (WER) de 1,78 % en LibriSpeech test-clean en BF16 y degradación mínima hasta Q6_K. No es un modelo de streaming ni soporta traducción, detección de idioma ni marcas de tiempo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM híbrido: SenseVoiceEncoderSmall (congelado) + adaptador de audio de 2 capas + Qwen3-0.6B autorregresivo |
| Parametros totales | 829.791.840 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | zh, en, ja (más 7 dialectos chinos y 26 acentos regionales del mandarín) |
| Licencia | FunASR Model Open Source License Agreement v1.1 (heredada del modelo base) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo sigue un diseño de audio-LLM en dos etapas. La primera etapa es un codificador SenseVoiceEncoderSmall congelado compuesto por 50 bloques principales SAN-M y 20 bloques transformer, que extrae representaciones acústicas del audio de entrada. La segunda etapa es un adaptador de 2 capas que proyecta las características de 512 a 1024 dimensiones y las inyecta en un LLM Qwen3-0.6B (28 capas, atención GQA con 16 cabezas de consulta y 8 de clave/valor, precisión BF16) que genera el texto de forma autorregresiva. El modelo base fue entrenado por Tongyi Lab sobre decenas de millones de horas de audio real, según la model card original.

La innovación principal es el uso de un codificador acústico congelado combinado con un LLM pequeño, lo que reduce el coste de entrenamiento y permite cuantizar el conjunto a menos de 600 MB sin pérdida apreciable de precisión (Q6_K mantiene 1,78 % de WER, idéntico a BF16). El port a transcribe.cpp se validó contra la referencia FunASR 1.3.1 en el commit f094d28 y se ancla al commit upstream a7088d6 del 6 de mayo de 2026. No se dispone de información sobre el uso de RLHF o DPO en el entrenamiento.

## Capacidades

- Transcripción de voz a texto offline en chino, inglés y japonés.
- Reconocimiento de 7 dialectos chinos: wu, cantonés, min, hakka, gan, xiang y jin.
- Reconocimiento de 26 acentos regionales del mandarín.
- Normalización inversa de texto (ITN) activable mediante el flag `--itn` en la CLI o el parámetro `use_itn` en la API de la librería.
- Procesamiento de audio WAV mono a 16 kHz como entrada.
- Generación autorregresiva de la transcripción mediante el cabezal Qwen3-0.6B.
- No soporta streaming, traducción, detección de idioma ni marcas de tiempo.
- No soporta tool calling ni function calling (es un modelo ASR, no un LLM de propósito general).
- No dispone de capacidades de agente ni razonamiento multi-paso.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa archivos WAV completos de forma offline, adecuado para generar actas en inglés, chino o japonés sin depender de servicios en la nube, con un WER de 1,78 % en inglés limpio.
- Subtitulado de contenido audiovisual en chino: gracias a su cobertura de dialectos (wu, cantonés, min, hakka, gan, xiang, jin) y acentos regionales, puede transcribir material con hablantes no estándar que otros modelos ASR fallan en reconocer.
- Atención al cliente en centros de contacto: integrado en pipelines de post-procesado, permite transcribir grabaciones de llamadas en japonés o chino para análisis de calidad y cumplimiento normativo, con despliegue en CPU mediante transcribe.cpp.
- Investigación lingüística y dialectología: la cobertura de 26 acentos del mandarín y 7 dialectos lo hace útil para corpus de habla regional, con la ventaja de ejecutarse en hardware modesto (Ryzen 4750U a 6,5x tiempo real en CPU).
- Transcripción en dispositivos de borde: con Q4_K_M (531 MB) y un rendimiento de 27x tiempo real en CPU de un M4 Max, es viable en portátiles y mini-PC sin GPU dedicada para dictado o notas de voz.
- Accesibilidad y documentación médica o legal: transcripción de consultas o declaraciones en inglés o chino con ITN activado para normalizar números, fechas y unidades, desplegable on-premise por la licencia y el tamaño reducido.
- Procesamiento por lotes de archivos de audio: al no ser streaming, encaja en pipelines batch donde se convierten ficheros MP3 a WAV 16 kHz mono con ffmpeg y se transcriben en cola con la CLI de transcribe.cpp.

## Benchmarks y rendimiento

| Benchmark | BF16 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,78 | 1,79 | 1,79 | 1,78 | 1,82 | 1,92 |

| Plataforma | Backend | RTF (x tiempo real) |
|---|---|---:|
| Apple M4 Max | Metal | 77,5 |
| Apple M4 Max | CPU | 27 |
| AMD Ryzen 4750U | Vulkan | 10,5 |
| AMD Ryzen 4750U | CPU | 6,5 |

El WER se midió sobre la partición completa de LibriSpeech test-clean (2620 enunciados) con decodificación greedy del cabezal Qwen3-0.6B. El editor del modelo base reporta 1,76 % en la misma partición; la referencia FunASR 1.3.1 obtiene 1,79 % (IC 95 % [1,63 %, 1,95 %]). No se han publicado resultados de benchmarks en chino (AISHELL-1, WenetSpeech) ni japonés (CommonVoice JA) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el tamaño de los pesos va de 531 MB (Q4_K_M) a 1590 MB (BF16/F16), por lo que cabe holgadamente en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) es suficiente; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU con Vulkan.
- Despliegue: transcribe.cpp (CLI `transcribe-cli` y API de librería); no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 77,5x tiempo real en Metal sobre M4 Max, 27x en CPU sobre M4 Max, 10,5x en Vulkan sobre Ryzen 4750U y 6,5x en CPU sobre Ryzen 4750U.
- El audio de entrada debe convertirse previamente a WAV mono 16 kHz (por ejemplo con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---|---|---|---|---|
| Fun-ASR-Nano-2512 (este, GGUF) | ~830 M | zh, en, ja + dialectos | no disponible | 1,78 % (BF16) | FunASR License v1.1 | GGUF |
| Fun-ASR-Nano-2512 (original) | ~830 M | zh, en, ja + dialectos | no disponible | 1,76 % (reportado) | FunASR License v1.1 | safetensors |
| Whisper large-v3 | 1550 M | multilingüe (99 idiomas) | 30 s por ventana | no disponible en la información | MIT | safetensors, GGUF, etc. |
| Whisper small | 244 M | multilingüe (99 idiomas) | 30 s por ventana | no disponible en la información | MIT | safetensors, GGUF, etc. |

La comparación con Whisper se ofrece como referencia de categoría (ASR multilingüe), pero no se dispone de cifras de WER comparables en la información proporcionada. La ventaja diferencial de Fun-ASR-Nano es la cobertura de dialectos chinos y acentos regionales, ausente en Whisper.

## Limitaciones y advertencias

- No es un modelo de streaming: no admite transcripción en tiempo real por fragmentos.
- No soporta traducción entre idiomas ni detección automática del idioma de entrada.
- No genera marcas de tiempo (timestamps) a nivel de palabra ni de segmento.
- No incluye fragmentación integrada para audio de larga duración; el usuario debe dividir manualmente los archivos largos.
- Solo acepta audio WAV mono a 16 kHz; requiere preprocesado con ffmpeg u otra herramienta.
- Riesgo de alucinación inherente a los modelos generativos autorregresivos, especialmente en audio con ruido o silencios largos.
- La licencia FunASR Model Open Source License Agreement v1.1 es distinta de las licencias OSI estándar; es necesario revisar los términos completos en la model card upstream antes de un uso comercial.
- El port GGUF está anclado al commit a7088d6 del modelo base (6 de mayo de 2026); cambios posteriores en upstream no están reflejados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.
- No se han publicado resultados de benchmarks en chino ni japonés en la información disponible; el WER de 1,78 % corresponde solo a inglés limpio (LibriSpeech).

## Enlaces

- Repositorio HuggingFace del port GGUF: https://huggingface.co/tryambientai/Fun-ASR-Nano-2512-gguf
- Modelo base en HuggingFace: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512
- Modelo base en ModelScope: https://www.modelscope.cn/models/FunAudioLLM/Fun-ASR-Nano-2512
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/fun-asr-nano-2512.md
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/f094d28
- Commit upstream del modelo base: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512/commit/a7088d620f755dcdca575b63db184c3ad55b2865
- Página del proyecto Fun-ASR: https://funaudiollm.github.io/funasr
- Paper de referencia (arXiv): https://arxiv.org/abs/2509.12508
- Demo en ModelScope: https://modelscope.cn/studios/FunAudioLLM/Fun-ASR-Nano
- Descargas GGUF (espejo handy-computer): https://huggingface.co/handy-computer/Fun-ASR-Nano-2512-gguf
