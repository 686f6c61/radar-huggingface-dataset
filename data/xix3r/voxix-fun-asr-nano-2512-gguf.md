# xix3r/voxix-Fun-ASR-Nano-2512-gguf

## Resumen

Fun-ASR-Nano-2512 es un modelo de reconocimiento automático del habla (ASR) end-to-end desarrollado por Tongyi Lab (Alibaba). Combina un codificador de audio SenseVoiceEncoderSmall congelado con un adaptador de audio de dos capas y un LLM Qwen3-0.6B que genera la transcripción de forma autorregresiva. El conjunto suma aproximadamente 830 millones de parámetros entrenables y está diseñado para transcripción offline de audio de 16 kHz mono en chino, inglés y japonés, además de siete dialectos chinos y 26 acentos regionales del mandarín.

La relevancia de esta ficha concreta reside en que se trata de una conversión a GGUF del modelo original, publicada por el usuario `xix3r` y pensada para ejecutarse con `transcribe.cpp`, una implementación en C++ derivada del ecosistema llama.cpp adaptada a modelos de audio. Esto permite desplegar un ASR de calidad competitiva en CPU y GPU de consumo sin depender de frameworks de Python ni de entornos CUDA complejos.

El modelo base está entrenado sobre decenas de millones de horas de audio real según su model card original, e incluye detección de idioma, selección explícita de idioma y normalización de texto inversa (ITN) opcional. No soporta streaming, traducción ni marcas de tiempo, y su licencia (FunASR Model Open Source License Agreement v1.1) impone condiciones específicas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: codificador SenseVoiceEncoderSmall (50 bloques SAN-M + 20 bloques transformer) + adaptador de audio de 2 capas (512 → 1024) + LLM Qwen3-0.6B (28 capas, GQA 16/8, BF16) |
| Parametros totales | 829.791.840 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | zh, en, ja (más 7 dialectos chinos: wu, cantonés, min, hakka, gan, xiang, jin, y 26 acentos regionales del mandarín) |
| Licencia | funasr-model-license-v1.1 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo sigue un esquema de audio-LLM en el que un codificador acústico preentrenado y congelado (SenseVoiceEncoderSmall, compuesto por 50 bloques SAN-M y 20 bloques transformer) extrae representaciones del audio de entrada. Un adaptador de dos capas proyecta esas representaciones de dimensión 512 a 1024 para alinearlas con el espacio de embeddings de un LLM Qwen3-0.6B, que genera la transcripción token a token de forma autorregresiva con decodificación greedy. El resultado es un sistema end-to-end que evita pipelines separados de alineamiento y decodificación acústica.

Según la model card del modelo original, el entrenamiento se realizó sobre decenas de millones de horas de habla real, con especial énfasis en dominios verticales como educación y finanzas, y con el objetivo explícito de mitigar la generación de alucinaciones y la confusión de idiomas. No se detallan en la información disponible la composición exacta del dataset, el número de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO. La conversión a GGUF se realizó desde el commit `a7088d6` del modelo base (fijado el 2026-05-06) y se validó contra la referencia FunASR 1.3.1 en el commit `f094d28` de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto offline en chino, inglés y japonés.
- Reconocimiento de siete dialectos chinos (wu, cantonés, min, hakka, gan, xiang, jin) y 26 acentos regionales del mandarín.
- Detección automática de idioma (`lang_detect: true`) y selección explícita de idioma (`explicit_language_selection: true`).
- Normalización de texto inversa (ITN) opcional mediante el flag `--itn`, útil para dígitos y puntuación en chino; desactivada por defecto porque en inglés puede devolver texto en mayúsculas.
- Entrada de audio de 16 kHz mono WAV; requiere conversión previa con ffmpeg si el formato difiere.
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No genera marcas de tiempo (`timestamps: none`).
- No incluye chunking integrado para audio de larga duración.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa audio de 16 kHz mono y genera texto en chino, inglés o japonés, adecuado para equipos multilingües que necesitan actas sin depender de servicios en la nube.
- Subtitulado de contenido audiovisual: al no generar marcas de tiempo, se usaría como paso de transcripción previo a un alineador externo; su WER de 1,78 % en LibriSpeech test-clean lo hace competitivo para material en inglés.
- Atención al cliente en centros de contacto: la detección automática de idioma y los 26 acentos del mandarín permiten transcribir llamadas de usuarios de distintas regiones sin configuración manual.
- Documentación clínica o legal dictada: el énfasis del modelo base en dominios verticales y su resistencia a alucinaciones lo hacen apto para transcripción de terminología especializada en educación y finanzas.
- Despliegue en dispositivos de borde: con cuantización Q4_K_M (557 MB) o Q5_K_M (631 MB), el modelo cabe en CPU y en GPU de consumo, lo que permite transcripción local sin conexión.
- Investigación lingüística sobre dialectos chinos: el soporte de wu, cantonés, min, hakka, gan, xiang y jin facilita la creación de corpus transcritos de variedades poco representadas.
- Integración en herramientas de accesibilidad: transcripción de audio a texto en tiempo no real para generar subtítulos de vídeos educativos o grabaciones de clase.

## Benchmarks y rendimiento

| Benchmark | BF16 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,78 | 1,79 | 1,79 | 1,78 | 1,82 | 1,92 |
| WER FLEURS EN (%) | — | — | 5,49 | — | — | — |
| CER FLEURS JA (%) | — | — | 8,50 | — | — | — |
| CER FLEURS ZH (%) | — | — | 8,59 | — | — | — |

Rendimiento en tiempo real (RTF, menor es mejor):

| Plataforma | RTF medio | RTF máximo |
|---|---:|---:|
| Apple M4, CPU | 18,12 | 28,06 |
| Apple M4, Metal | 32,87 | 78,13 |
| AMD Ryzen 4750U, CPU | 7,95 | — |
| AMD Ryzen 4750U, Vulkan | 10,73 | — |

El editor del modelo base reporta 1,76 % de WER en LibriSpeech test-clean, y la ejecución de referencia con FunASR 1.3.1 obtiene 1,79 % (IC 95 % [1,63 %, 1,95 %]). La conversión BF16 de transcribe.cpp se mantiene dentro de 0,01 puntos porcentuales de esa referencia. Las cifras de LibriSpeech se midieron con ITN desactivada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,7 GB para BF16/F16, 0,9 GB para Q8_0, 0,7 GB para Q6_K y 0,55-0,63 GB para Q4_K_M y Q5_K_M.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para BF16; para cuantizaciones Q4-Q8 basta con 1 GB. Funciona en Apple Silicon vía Metal y en GPUs AMD/Intel vía Vulkan.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y cualquier iGPU moderna con soporte Metal o Vulkan.
- Opciones de despliegue: `transcribe.cpp` (CLI `transcribe-cli`), compilado con CMake. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: los valores de RTF indican que el modelo es más lento que tiempo real en las plataformas medidas (RTF 7,95 en Ryzen 4750U CPU y 18,12 en M4 CPU); el rendimiento es mejor en CPU que en las rutas GPU probadas (Metal y Vulkan), lo que sugiere que la aceleración por GPU no está optimizada en esta versión.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Fun-ASR-Nano-2512 (este) | ~830 M | zh, en, ja + dialectos | no disponible | FunASR v1.1 | GGUF |
| Whisper large-v3 | ~1.550 M | 99 idiomas | 30 s por ventana | MIT | safetensors, GGUF, etc. |
| SenseVoice-Small | ~234 M | zh, en, ja, ko, yue | no disponible | FunASR v1.1 | safetensors, ONNX |
| Qwen3-ASR | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con Whisper large-v3 es la más directa por categoría de uso: Whisper ofrece cobertura de 99 idiomas y licencia MIT permisiva, mientras que Fun-ASR-Nano se centra en tres idiomas y dialectos chinos con una licencia más restrictiva. Frente a SenseVoice-Small, del mismo ecosistema FunASR, este modelo añade el decodificador LLM Qwen3-0.6B y mayor tamaño, lo que se traduce en mejor WER en inglés (1,78 % frente a cifras no disponibles en la información proporcionada). No se dispone de datos de Qwen3-ASR para una comparación cuantitativa.

## Limitaciones y advertencias

- No soporta streaming: la transcripción es offline y requiere el audio completo.
- No genera marcas de tiempo, lo que limita su uso directo en subtitulado sin un alineador posterior.
- No traduce: solo transcribe en el idioma de origen.
- No incluye chunking integrado para audio largo; el usuario debe segmentar manualmente.
- La ITN está desactivada por defecto; activarla puede provocar que el inglés se devuelva en mayúsculas.
- Riesgo de alucinación y confusión de idiomas, aunque el modelo base se entrenó explícitamente para mitigarlo.
- Cobertura lingüística limitada a zh, en, ja y variedades del chino; no apto para otros idiomas.
- Licencia FunASR Model Open Source License Agreement v1.1: no es una licencia permisiva tipo MIT o Apache; es necesario revisar los términos antes de uso comercial.
- El rendimiento en GPU (Metal, Vulkan) es peor que en CPU según los RTF publicados, lo que indica una aceleración por hardware aún inmadura en transcribe.cpp.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es una conversión de terceros, no oficial, y su mantenimiento no está garantizado.
- El modelo base está fijado a un commit concreto (2026-05-06); futuras actualizaciones del original no se reflejarán automáticamente.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/xix3r/voxix-Fun-ASR-Nano-2512-gguf
- Modelo base original: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512
- Commit del modelo base utilizado: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512/commit/a7088d6
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/f094d28
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/fun-asr-nano-2512.md
- Licencia FunASR: https://github.com/modelscope/FunASR/blob/main/MODEL_LICENSE
- Paper de referencia (arXiv:2509.12508): https://arxiv.org/abs/2509.12508
- Repositorio FunASR: https://github.com/modelscope/FunASR
