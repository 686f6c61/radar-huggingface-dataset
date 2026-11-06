# tryambientai/SenseVoiceSmall-gguf

## Resumen

SenseVoiceSmall-gguf es una conversión al formato GGUF del modelo FunAudioLLM/SenseVoiceSmall, un sistema de reconocimiento automático del habla (ASR) desarrollado originalmente por el equipo FunAudioLLM y empaquetado por tryambientai para su uso con la librería transcribe.cpp. El modelo resuelve el problema de la transcripción multilingüe offline en cinco idiomas (chino mandarín, cantonés, inglés, japonés y coreano) con un tamaño muy reducido: 234 millones de parámetros, lo que lo sitúa en la categoría de modelos ligeros desplegables en hardware modesto.

La arquitectura es un encoder SAN-M con una única cabeza CTC sobre un vocabulario SentencePiece de 25.055 tokens. Acepta audio WAV mono a 16 kHz con un límite de 30 segundos por llamada, coherente con el contrato de inferencia directa del modelo original. No es un modelo de streaming, no traduce y no incorpora troceado nativo de audio largo, aunque la misma cabeza CTC emite etiquetas de identificación de idioma, emoción simple, eventos de audio y un indicador de normalización inversa de texto.

Su relevancia actual radica en la combinación de tamaño reducido (desde 139 MB en cuantización Q4_K_M), licencia heredada del modelo base y ejecución local sin dependencias de servicios en la nube. Las cuantizaciones publicadas mantienen una tasa de error de palabra (WER) prácticamente idéntica al modelo en precisión completa sobre LibriSpeech test-clean, lo que lo hace atractivo para despliegues en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder SAN-M con cabeza CTC (transformer no autorregresivo) |
| Parametros totales | 234.000.287 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por llamada (límite de inferencia directa) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | chino mandarín (zh), cantonés (yue), inglés (en), japonés (ja), coreano (ko) |
| Licencia | other (FunASR MODEL_LICENSE, heredada del modelo base) |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo es un encoder SAN-M (Self-Attention Network con arquitectura tipo transformer) con una única cabeza CTC que opera sobre un vocabulario SentencePiece de 25.055 tokens. Al ser un modelo CTC no autorregresivo, la decodificación es codiciosa y no requiere un decodificador separado, lo que reduce la latencia y simplifica el despliegue. La conversión a GGUF se realizó desde el commit upstream `3eb3b4eeffc2f2dde6051b853983753db33e35c3` (fijado el 2026-05-06) y se validó contra la referencia FunASR en el commit `f094d28` de transcribe.cpp el 2026-05-06.

Según la model card original, el entrenamiento se realizó con más de 400.000 horas de datos y cubre más de 50 idiomas, si bien esta conversión concreta documenta soporte para cinco idiomas. El modelo base incorpora capacidades de reconocimiento de emociones y detección de eventos de audio entrenadas conjuntamente con la tarea ASR. No se detalla en la información disponible la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO, dado que se trata de un modelo discriminativo de ASR y no de un modelo generativo de lenguaje.

## Capacidades

- Reconocimiento automático del habla (ASR) offline en chino mandarín, cantonés, inglés, japonés y coreano.
- Identificación de idioma (LID) mediante la misma cabeza CTC, activable con `--raw-tokens`.
- Reconocimiento de emociones del habla (SER) con etiquetas simples.
- Detección de eventos de audio (AED) con etiquetas simples.
- Normalización inversa de texto (ITN) activable mediante el flag `--itn`.
- Entrada de audio WAV mono a 16 kHz, con límite de 30 segundos por llamada.
- No soporta streaming (indicado explícitamente como `streaming: false`).
- No soporta traducción entre idiomas (`translate: false`).
- No genera marcas de tiempo (`timestamps: none`).
- No incluye troceado nativo de audio de larga duración.

## Casos de uso

- Transcripción de notas de voz y reuniones cortas: el modelo procesa fragmentos de hasta 30 segundos en WAV mono a 16 kHz, adecuado para dictados, mensajes de voz o segmentos de reuniones divididos previamente con ffmpeg u otra herramienta.
- Subtitulado de contenido audiovisual en cinco idiomas asiáticos y el inglés: al soportar chino, cantonés, japonés, coreano e inglés, resulta útil para pipelines de subtitulado de series, vídeos de formación o material educativo, segmentando el audio en ventanas de 30 segundos.
- Atención al cliente en centros de contacto multilingües: la transcripción local sin envío de audio a servicios externos permite cumplir requisitos de privacidad en sectores regulados, con la ventaja de un modelo de 139-241 MB desplegable en servidores modestos.
- Análisis de emoción y eventos acústicos en grabaciones: las etiquetas de emoción y eventos de audio emitidas por la cabeza CTC permiten enriquecer la transcripción con metadatos útiles para control de calidad o análisis de sentimiento en llamadas.
- Despliegue en dispositivos de borde y sistemas empotrados: con cuantizaciones desde 139 MB y soporte de backends Metal (Apple Silicon) y Vulkan (GPU integradas), el modelo puede ejecutarse en portátiles, mini-PC o dispositivos con aceleración gráfica limitada.
- Herramientas de accesibilidad y dictado local: integración en aplicaciones de escritorio para transcripción en tiempo real por fragmentos, sin dependencia de red, útil en entornos sin conectividad o con restricciones de soberanía del dato.
- Preprocesado de corpus de voz para investigación: generación de transcripciones a gran escala en varios idiomas con un modelo pequeño y rápido, útil para etiquetar datasets o construir conjuntos de evaluación.

## Benchmarks y rendimiento

| Prueba | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 3,13 | 3,13 | 3,13 | 3,14 | 3,18 | 3,45 |

| Plataforma | Backend | RTF (factor de tiempo real) |
|---|---|---:|
| Apple M4 Max | Metal | 289,5 |
| Apple M4 Max | CPU | 51,5 |
| Ryzen 4750U | Vulkan | 32,5 |
| Ryzen 4750U | CPU | 15,5 |

El WER se midió sobre la partición completa de LibriSpeech test-clean (2.620 enunciados) con decodificación CTC codiciosa. El editor no publica un WER numérico de LibriSpeech (la model card original solo incluye gráficos PNG), por lo que la referencia es la ejecución propia con FunASR 1.3.1 sobre el mismo manifiesto: 3,13 % (IC 95 % [2,93 %, 3,34 %]). El port F32 de transcribe.cpp coincide con esa referencia dentro de +0,002 puntos porcentuales. LibriSpeech es una prueba en inglés; el caso más fuerte de SenseVoice es el mandarín, y se recomienda AISHELL-1 (CER) como comprobación complementaria. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; el fichero más grande (F32) ocupa 893 MB y el más pequeño (Q4_K_M) 139 MB, por lo que la memoria necesaria es mínima.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) puede acelerar la inferencia; no requiere GPU de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU con Vulkan, dado el reducido tamaño del modelo.
- Opciones de despliegue: transcribe.cpp (librería nativa con CLI `transcribe-cli`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que el modelo es un ASR CTC y no un modelo de lenguaje generativo.
- Latencia y throughput: RTF de 289,5 con Metal en Apple M4 Max, 51,5 con CPU en el mismo equipo, 32,5 con Vulkan en Ryzen 4750U y 15,5 con CPU en Ryzen 4750U. Un RTF superior a 1 implica procesamiento más rápido que el tiempo real.
- Requisito de entrada: audio WAV mono a 16 kHz; conversión previa con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Formato |
|---|---|---|---|---|---|
| SenseVoiceSmall-gguf (este) | 234 M | zh, yue, en, ja, ko | 30 s por llamada | FunASR MODEL_LICENSE | GGUF |
| Whisper small | no disponible en la información | multilingüe amplio | 30 s por llamada | MIT (según información pública de OpenAI) | múltiples |
| Whisper large-v3 | no disponible en la información | multilingüe amplio | 30 s por llamada | MIT (según información pública de OpenAI) | múltiples |

La información disponible no incluye datos comparativos de rendimiento frente a Whisper u otros modelos ASR, más allá de la afirmación de la model card original de que SenseVoice supera a Whisper en reconocimiento multilingüe. No se dispone de cifras verificables de esa comparación en esta ficha.

## Limitaciones y advertencias

- No es un modelo de streaming: requiere audio completo por llamada y no admite entrada incremental.
- Límite estricto de 30 segundos por llamada; el audio más largo debe trocearse externamente, con el riesgo de cortes en fronteras de palabras.
- No realiza traducción: transcribe en el idioma de origen, no traduce a otro idioma.
- No genera marcas de tiempo, lo que complica la alineación con subtítulos o la sincronización fina.
- La licencia es "other" (FunASR MODEL_LICENSE), heredada del modelo base; es imprescindible revisar los términos upstream antes de un uso comercial.
- El modelo está optimizado para mandarín; el rendimiento en otros idiomas puede ser inferior y LibriSpeech solo cubre inglés.
- Riesgo de alucinación y errores en audio con ruido, solapamiento de hablantes o acentos no representados en el entrenamiento.
- Las etiquetas de emoción y eventos de audio son "simples" según la documentación y no deben tratarse como detecciones de alta fiabilidad en producción.
- No se documentan sesgos específicos del modelo en la información disponible, pero al entrenarse con más de 400.000 horas de datos multilingües puede reflejar sesgos de los corpus de origen.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; se trata de una conversión reciente y poco validada por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tryambientai/SenseVoiceSmall-gguf
- Modelo base: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Commit upstream del modelo base: https://huggingface.co/FunAudioLLM/SenseVoiceSmall/commit/3eb3b4eeffc2f2dde6051b853983753db33e35c3
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/f094d28
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/sensevoice-small.md
- Repositorio GitHub de SenseVoice: https://github.com/FunAudioLLM/SenseVoice
- Página del proyecto FunAudioLLM: https://fun-audio-llm.github.io/
- Modelo en ModelScope: https://www.modelscope.cn/models/iic/SenseVoiceSmall
- Demo en ModelScope: https://www.modelscope.cn/studios/iic/SenseVoice
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/FunAudioLLM/SenseVoice
