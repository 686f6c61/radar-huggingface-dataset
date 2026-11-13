# xix3r/voxix-Voxtral-Mini-3B-2507-gguf

## Resumen

Voxtral-Mini-3B-2507 es un modelo de reconocimiento automático del habla (ASR) y traducción de voz desarrollado por Mistral AI, publicado en julio de 2025. Combina un encoder de audio bidireccional basado en Whisper-large-v3 con un decodificador de lenguaje causal Ministral-3B, unidos mediante un proyector de tokens de audio. El resultado es un audio-LLM capaz de transcribir, traducir y responder preguntas sobre audio en ocho idiomas, con una ventana de contexto de 32.000 tokens que permite procesar hasta 30 minutos de audio para transcripción y 40 minutos para comprensión.

La ficha que nos ocupa, sin embargo, no es el modelo original, sino una conversión a formato GGUF realizada por el usuario xix3r para su uso con transcribe.cpp, una implementación en C++ orientada a inferencia local y offline. Esta conversión cuantiza el modelo base a varios niveles (BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) manteniendo una calidad prácticamente idéntica al original: la variante Q4_K_M, de solo 2,98 GB, logra un WER del 1,94 % en LibriSpeech test-clean frente al 1,88 % del BF16.

Su relevancia actual radica en que permite ejecutar un modelo de transcripción multilingüe de calidad estado del arte en hardware de consumo, sin GPU dedicada y sin dependencia de servicios en la nube. La licencia Apache-2.0 del modelo base facilita su integración en productos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Audio-LLM: encoder Whisper-large-v3 + proyector + decoder Ministral-3B (transformer causal, 30 capas, GQA 32/8, NEOX RoPE, SwiGLU) |
| Parámetros totales | 4.676.297.232 (según safetensors del modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens (hasta 30 min de audio para transcripción, 40 min para comprensión) |
| Tipos de cuantización | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | en, fr, de, es, it, pt, nl, hi |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (librería transcribe.cpp) |
| Tokenizador | Tekken (mistral-common) |
| Entrada de audio | WAV mono a 16 kHz |
| Decodificación | Greedy |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de inyección de tokens de audio: un encoder de audio bidireccional derivado de Whisper-large-v3 procesa el espectrograma log-mel y genera representaciones que un proyector de agrupación de 4 frames condensa en 375 tokens de audio por cada fragmento de 30 segundos. Estos tokens se inyectan en el decodificador de lenguaje causal Ministral-3B, que comparte encoder, proyector, frontend log-mel y tokenizador con el modelo mayor Voxtral Small 24B, sustituyendo únicamente el decodificador Mistral-Small-24B por uno de 3B parámetros.

El modelo base fue entrenado por Mistral AI; la model card original no detalla el número de tokens de entrenamiento ni la composición exacta del dataset en la información disponible. El modelo soporta modo de transcripción dedicado con detección automática del idioma de origen, y la traducción de voz se gestiona mediante la plantilla instruct de mistral-common. Esta conversión GGUF concreta fue portada desde el commit 3060fe3 del modelo upstream (fijado el 6 de junio de 2026) y validada contra la referencia de Transformers en el commit 483c122 de transcribe.cpp, con paridad numérica a nivel de tensor: 43 tensores verificados dentro de tolerancia y transcripción byte a byte idéntica a la referencia BF16.

## Capacidades

- Transcripción de voz a texto offline en ocho idiomas (inglés, francés, alemán, español, italiano, portugués, neerlandés e hindi).
- Detección automática del idioma de origen del audio en modo transcripción.
- Traducción de voz (speech translation) mediante la plantilla instruct de mistral-common.
- Comprensión de audio: preguntas y respuestas y resumen sobre contenido hablado (hasta 40 minutos de audio).
- Procesamiento de audio de formato largo (hasta 30 minutos por transcripción gracias a los 32k tokens de contexto).
- Modo de transcripción dedicado que maximiza la precisión del ASR.
- No soporta streaming (indicado explícitamente en la metadata: `streaming: false`).
- No genera timestamps (`timestamps: none`).
- Capacidad de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa hasta 30 minutos de audio en una sola pasada gracias a su contexto de 32k tokens, lo que permite transcribir reuniones completas sin segmentación manual y con detección automática del idioma.
- Subtitulado y traducción de contenido audiovisual: la función de speech translation permite generar traducciones de audio en inglés, francés, alemán, español, italiano, portugués, neerlandés e hindi, útil para localización de pódcast o vídeos.
- Asistentes de voz para atención al cliente: al ejecutarse offline con transcribe.cpp, permite desplegar transcripción en entornos con requisitos de privacidad o sin conectividad, procesando audio en local sin enviar datos a la nube.
- Documentación clínica o legal dictada: la variante Q8_0 (5 GB) mantiene un WER del 1,87 % en LibriSpeech test-clean, adecuada para transcribir dictados donde la fidelidad literal es crítica.
- Investigación en ASR multilingüe: la licencia Apache-2.0 y el formato GGUF facilitan la experimentación y el ajuste de pipelines de evaluación en ocho idiomas sin restricciones de uso comercial.
- Análisis de grabaciones en dispositivos de borde: la variante Q4_K_M (2,98 GB) con WER del 1,94 % permite transcripción en CPU (RTF 0,56 en Ryzen 4750U) o GPU integrada, apta para dispositivos con recursos limitados.
- Resumen y Q&A sobre pódcast o clases: el modo de comprensión de audio (hasta 40 minutos) permite extraer respuestas y resúmenes del contenido hablado, no solo la transcripción literal.

## Benchmarks y rendimiento

WER (%) en LibriSpeech test-clean (2.620 enunciados, batch 8, sin timestamps, normalizador de texto inglés de Whisper, GPU NVIDIA L40S):

| Cuantización | Tamaño | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 9,37 GB | 1,88 |
| F16 | 9,38 GB | 1,89 |
| Q8_0 | 5,00 GB | 1,87 |
| Q6_K | 3,87 GB | 1,87 |
| Q5_K_M | 3,46 GB | 1,91 |
| Q4_K_M | 2,98 GB | 1,94 |
| Referencia HF Transformers (BF16, eager, greedy) | — | 1,87 |

WER (%) en FLEURS por idioma (solo Q8_0):

| Idioma | WER Q8_0 |
|---|---:|
| Italiano | 2,56 |
| Español | 3,52 |
| Portugués | 3,84 |
| Inglés | 3,89 |
| Francés | 4,51 |
| Alemán | 4,71 |
| Neerlandés | 6,57 |
| Hindi | 8,93 |

Rendimiento (RTF, real-time factor):

| Plataforma | Aceleración | RTF |
|---|---|---:|
| Apple M4 Max | CPU | 2,12 |
| Apple M4 Max | Metal | 13,42 |
| AMD Ryzen 4750U | CPU | 0,56 |
| AMD Ryzen 4750U | Vulkan | 1,08 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 2,98 GB (Q4_K_M), 3,46 GB (Q5_K_M), 3,87 GB (Q6_K), 5,00 GB (Q8_0), 9,37 GB (BF16).
- Cabe en GPU de consumo: sí, desde tarjetas con 4-6 GB de VRAM para Q4_K_M/Q5_K_M; Q8_0 requiere unos 5-6 GB.
- GPU recomendadas: NVIDIA L40S (usada para los benchmarks), A100/H100 para mayor throughput; RTX 4090 y RTX 3090 sobradas para cualquier cuantización.
- Ejecución en CPU: viable; RTF 0,56 en Ryzen 4750U (más rápido que tiempo real) y RTF 2,12 en Apple M4 Max con CPU.
- Aceleración en Apple Silicon: Metal alcanza RTF 13,42 en M4 Max.
- Aceleración en GPU AMD: Vulkan alcanza RTF 1,08 en Ryzen 4750U.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde código fuente con CMake; requiere audio WAV mono a 16 kHz (conversión previa con ffmpeg).
- Latencia y throughput: el RTF superior a 1 en las configuraciones probadas indica procesamiento más rápido que tiempo real; no se dispone de cifras de throughput en tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | WER LibriSpeech test-clean |
|---|---|---:|---|---|---|---:|
| Voxtral-Mini-3B-2507 (esta conversión, Q8_0) | ~4,7B | 32k tokens | 8 | Apache-2.0 | GGUF | 1,87 |
| Voxtral Small 24B | 24B | 32k tokens | 8 | Apache-2.0 | safetensors | no disponible |
| Whisper-large-v3 | ~1,55B | 30 s por ventana | ~99 | MIT | safetensors, GGUF | no disponible en esta información |

La comparación directa con Whisper-large-v3 o con Voxtral Small 24B en WER no está disponible en la información proporcionada. La ventaja principal de esta conversión frente a Voxtral Small 24B es el tamaño (2,98 GB frente a un modelo de 24B) y la ejecución en CPU; frente a Whisper, añade comprensión de audio, traducción de voz y contexto largo.

## Limitaciones y advertencias

- No soporta streaming: el audio debe procesarse completo, lo que introduce latencia en aplicaciones en tiempo real.
- No genera timestamps, lo que limita su uso en subtitulado sincronizado o alineación a nivel de palabra.
- Solo acepta WAV mono a 16 kHz; requiere preprocesado con ffmpeg para otros formatos.
- El hindi presenta un WER notablemente superior (8,93 %) al resto de idiomas; el neerlandés también empeora (6,57 %).
- No se dispone de datos de sesgos, alucinación o robustez ante ruido en la información proporcionada.
- La conversión GGUF es de un tercero (xix3r) y no está publicada por Mistral AI; aunque se valida numéricamente contra la referencia, conviene verificar el commit upstream para producción.
- La model card original no detalla la composición del dataset de entrenamiento ni si hubo RLHF/DPO.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse el texto de licencia y el NOTICE incluidos en el repositorio.

## Enlaces

- Repositorio de la conversión GGUF: https://huggingface.co/xix3r/voxix-Voxtral-Mini-3B-2507-gguf
- Modelo base original: https://huggingface.co/mistralai/Voxtral-Mini-3B-2507
- Repositorio de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/voxtral-mini-3b-2507.md
- Paper de Voxtral: https://arxiv.org/abs/2507.13264
- Blog de Mistral AI sobre Voxtral: https://mistral.ai/news/voxtral
- Blog de Ministral 3B: https://mistral.ai/news/ministraux
- Commit upstream fijado: https://huggingface.co/mistralai/Voxtral-Mini-3B-2507/commit/3060fe3
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/483c122
