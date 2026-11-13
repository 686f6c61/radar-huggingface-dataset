# xix3r/voxix-SenseVoiceSmall-gguf

## Resumen

voxix-SenseVoiceSmall-gguf es una conversión al formato GGUF del modelo de reconocimiento automático del habla SenseVoiceSmall, desarrollado originalmente por FunAudioLLM (Alibaba). Esta versión, publicada por el usuario xix3r, está empaquetada específicamente para el runtime transcribe.cpp, una implementación en C++ orientada a inferencia local y offline. El modelo resuelve la transcripción multilingüe de audio en cinco idiomas (chino mandarín, cantonés, inglés, japonés y coreano) sin necesidad de infraestructura en la nube.

La relevancia de esta ficha radica en su formato: al ser GGUF y estar pensado para transcribe.cpp, permite ejecutar ASR en hardware modesto, incluyendo CPU y aceleración Metal o Vulkan, con un tamaño que va desde 146 MB en cuantización Q4_K_M hasta 937 MB en F32. El modelo base cuenta con 234 millones de parámetros y emplea una arquitectura SAN-M (Self-Attention with Memory) con una única cabeza CTC sobre un vocabulario SentencePiece de 25.055 tokens.

Además de la transcripción, la misma cabeza CTC emite etiquetas de identificación de idioma, emoción, eventos de audio y control de normalización de texto inversa (ITN). Es un modelo offline, no streaming, sin traducción y con un límite de 30 segundos por llamada según el contrato de inferencia directa del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAN-M (encoder) con cabeza CTC única |
| Parametros totales | 234.000.287 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada limitado a 30 segundos por llamada) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | zh, yue, en, ja, ko |
| Licencia | model-license (FunASR MODEL_LICENSE) |
| Formato de pesos | GGUF |
| Vocabulario | SentencePiece, 25.055 tokens |
| Entrada de audio | WAV mono a 16 kHz |
| Streaming | no |
| Traduccion | no |
| Deteccion de idioma | si |
| Timestamps | no disponible (la model card indica "none") |

## Arquitectura y entrenamiento

El modelo base SenseVoiceSmall emplea una arquitectura SAN-M, un encoder basado en self-attention con mecanismos de memoria, sobre el que se monta una única cabeza CTC que decodifica directamente sobre un vocabulario SentencePiece de 25.055 tokens. La decodificación es CTC voraz (greedy), sin modelo de lenguaje externo ni beam search en la configuración reportada. La misma cabeza CTC produce etiquetas auxiliares de identificación de idioma, emoción, eventos de audio y control de ITN, que permanecen ocultas salvo que se active `--raw-tokens`.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card del autor de la conversión no incluye esa información y la sección reproducida del modelo original está truncada. La conversión GGUF se realizó a partir del commit upstream `3eb3b4e` (fijado el 2026-05-06) y se validó contra la referencia FunASR en el commit `f094d28` de transcribe.cpp en la misma fecha.

## Capacidades

- Transcripción de voz a texto offline en chino mandarín, cantonés, inglés, japonés y coreano.
- Identificación automática de idioma (LID) integrada en la salida CTC.
- Reconocimiento de emociones del habla (SER) mediante etiquetas emitidas por la cabeza CTC.
- Detección de eventos de audio (AED), como etiquetas de eventos acústicos.
- Normalización de texto inversa (ITN) activada por defecto para obtener mayúsculas, puntuación y dígitos legibles; se puede desactivar con `--no-itn` para obtener la forma hablada original.
- Soporte de etiquetas de control ITN en la salida cuando se usa `--raw-tokens`.
- No soporta streaming.
- No soporta traducción.
- No soporta timestamps.
- No dispone de tool calling ni capacidades de agente (es un modelo ASR puro).

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo procesa audio WAV mono a 16 kHz de hasta 30 segundos por llamada, adecuado para fragmentos de conversación o dictado. Para reuniones largas sería necesario segmentar el audio previamente, ya que no incluye chunking de formato largo.
- Subtitulado de contenido en inglés: con un WER de 3,13 % en LibriSpeech test-clean en cuantizaciones F32, F16 y Q8_0, es adecuado para generar subtítulos en inglés con alta fidelidad en hardware de consumo.
- Atención al cliente en mercados asiáticos: la combinación de ASR multilingüe (zh, yue, ja, ko) y detección de idioma permite enrutar llamadas o transcribir conversaciones en centros de contacto sin depender de servicios en la nube.
- Análisis de emoción en grabaciones: las etiquetas SER emitidas por la cabeza CTC permiten clasificar el tono emocional del habla, útil en estudios de calidad de servicio o investigación de experiencia de usuario.
- Indexación y búsqueda de archivos de audio: la transcripción local con Q4_K_M (146 MB) permite generar texto buscable a partir de archivos de audio en entornos con recursos limitados, sin enviar datos a terceros.
- Despliegue en dispositivos edge: con cuantizaciones de 146 a 253 MB y soporte de Metal y Vulkan en transcribe.cpp, el modelo puede ejecutarse en portátiles y equipos sin GPU dedicada para dictado o accesibilidad en tiempo casi real.
- Moderación de contenido en audio: la detección de eventos de audio y la transcripción permiten filtrar o clasificar grabaciones automáticamente en pipelines locales.

## Benchmarks y rendimiento

| Benchmark | Metrica | Cuantizacion | Resultado |
|---|---|---|---|
| LibriSpeech test-clean | WER | F32 | 3,13 % |
| LibriSpeech test-clean | WER | F16 | 3,13 % |
| LibriSpeech test-clean | WER | Q8_0 | 3,13 % |
| LibriSpeech test-clean | WER | Q6_K | 3,14 % |
| LibriSpeech test-clean | WER | Q5_K_M | 3,18 % |
| LibriSpeech test-clean | WER | Q4_K_M | 3,45 % |
| FLEURS en | WER | Q8_0 | 7,14 % |
| FLEURS ja | CER | Q8_0 | 7,63 % |
| FLEURS ko | CER | Q8_0 | 8,27 % |
| FLEURS yue | CER | Q8_0 | 37,44 % |
| FLEURS zh | CER | Q8_0 | 10,12 % |

Los valores de LibriSpeech se midieron sobre las 2.620 utterances del split test-clean completo, con ITN desactivado para coincidir con la referencia FunASR 1.3.1 (3,13 %, IC 95 % [2,93 %, 3,34 %]). La conversión F32 de transcribe.cpp coincide con esa referencia dentro de +0,002 puntos porcentuales. El autor advierte que LibriSpeech es un benchmark en inglés y que el punto fuerte de SenseVoice es el mandarín, por lo que recomienda AISHELL-1 (CER) como comprobación complementaria.

Rendimiento en tiempo real (RTF):

| Plataforma | Aceleracion | RTF |
|---|---|---|
| Apple M4 Max | CPU | 49,53 |
| Apple M4 Max | Metal | 266,99 |
| AMD Ryzen 7 4750U | CPU | 19,73 |
| AMD Ryzen 7 4750U | Vulkan | 27,69 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de los pesos, Q4_K_M ocupa 146 MB, Q8_0 253 MB y F32 937 MB, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no se especifican modelos concretos; la model card reporta aceleración Metal (Apple M4 Max) y Vulkan (AMD Ryzen 7 4750U).
- Cabe en GPU de consumo: sí, dado el reducido tamaño de los pesos en todas las cuantizaciones.
- Opciones de despliegue: transcribe.cpp (runtime nativo para el que está empaquetado). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 49,53 en CPU de M4 Max, 266,99 con Metal, 19,73 en CPU de Ryzen 7 4750U y 27,69 con Vulkan (cuanto mayor el RTF, más rápido que tiempo real).
- Requisito de entrada: audio WAV mono a 16 kHz; se recomienda convertir con ffmpeg antes de la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Streaming | Licencia | Formato |
|---|---|---|---|---|---|
| voxix-SenseVoiceSmall-gguf | 234 M | zh, yue, en, ja, ko | no | model-license (FunASR) | GGUF |
| FunAudioLLM/SenseVoiceSmall (original) | 234 M | zh, yue, en, ja, ko | no | model-license (FunASR) | pesos originales (no disponible el detalle) |
| Whisper small (referencia de categoria) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos alternativos que permitan una comparación cuantitativa rigurosa. La comparación con el modelo original es directa en cuanto a arquitectura y parámetros, diferenciándose únicamente en el formato GGUF y el runtime transcribe.cpp.

## Limitaciones y advertencias

- No es un modelo de streaming: no puede transcribir audio en tiempo real continuo.
- No realiza traducción: solo transcribe en el idioma de entrada.
- No genera timestamps.
- Límite de 30 segundos por llamada según el contrato de inferencia directa del modelo original; no incluye chunking integrado para audio de formato largo.
- El cantonés presenta un CER notablemente alto en FLEURS (37,44 %), muy superior al resto de idiomas, lo que limita su fiabilidad en ese idioma.
- El rendimiento en inglés (WER 3,13 % en LibriSpeech) no es representativo del rendimiento en mandarín, que es el caso de uso principal del modelo.
- No se dispone de información sobre sesgos del modelo en la documentación proporcionada.
- Riesgo de alucinación: no documentado en la información disponible; en modelos CTC la salida está acotada al vocabulario, pero no se aportan datos específicos.
- Licencia model-license (FunASR MODEL_LICENSE): es necesario revisar los términos completos antes de uso comercial, ya que la model card remite al enlace de licencia upstream y no detalla restricciones.
- La cuantización Q4_K_M degrada ligeramente el WER (3,45 % frente a 3,13 %), lo que debe tenerse en cuenta en aplicaciones sensibles a la precisión.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- La fecha de creación del repositorio (2026-11-13) es posterior a la fecha de validación reportada (2026-05-06), lo que conviene verificar en el historial del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xix3r/voxix-SenseVoiceSmall-gguf
- Modelo base: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Commit del modelo base usado: https://huggingface.co/FunAudioLLM/SenseVoiceSmall/commit/3eb3b4e
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/f094d28
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/sensevoice-small.md
- Repositorio SenseVoice: https://github.com/FunAudioLLM/SenseVoice
- Página del proyecto FunAudioLLM: https://fun-audio-llm.github.io/
- Licencia FunASR MODEL_LICENSE: https://github.com/modelscope/FunASR/blob/main/MODEL_LICENSE
- Pesos GGUF (repositorio handy-computer): https://huggingface.co/handy-computer/SenseVoiceSmall-gguf
- Fichero de licencia en el repo: https://huggingface.co/handy-computer/SenseVoiceSmall-gguf/blob/main/LICENSE
- Fichero NOTICE en el repo: https://huggingface.co/handy-computer/SenseVoiceSmall-gguf/blob/main/NOTICE
