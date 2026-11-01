# tryambientai/cohere-transcribe-arabic-07-2026-gguf

## Resumen

Cohere Transcribe Arabic 07-2026 es un modelo de reconocimiento automático del habla (ASR) de 2.049 millones de parámetros desarrollado por Cohere y Cohere Labs. Está especializado en árabe (incluidos dialectos) y en cambio de código árabe-inglés, con inglés como idioma secundario. La ficha que nos ocupa es la conversión a GGUF realizada por tryambientai para su uso con transcribe.cpp, una implementación en C++ pensada para inferencia local y offline.

El modelo parte de la arquitectura Cohere Transcribe 03-2026: un encoder Conformer con una cabeza encoder-decoder Transformer (atención cruzada y embeddings de token compartidos). Recibe audio de 16 kHz mono y produce una transcripción de forma autorregresiva, con un flag de idioma (`-l ar` o `-l en`). La conversión GGUF está portada del commit upstream 0a8193c (fijado el 2026-07-07) y validada contra la referencia de Transformers en el commit d89ecb7 de transcribe.cpp.

La relevancia de esta ficha radica en que permite ejecutar un modelo ASR de 2B parámetros en hardware de consumo (incluido Metal en Apple Silicon y Vulkan en GPUs AMD), con cuantizaciones que van de BF16 (4,10 GB) a Q4_K_M (1,56 GB) sin degradación significativa del WER. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder + Transformer encoder-decoder (atención cruzada, embeddings de token compartidos) |
| Parametros totales | 2.049.026.832 (2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Árabe (ar), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transcribe.cpp); pesos originales en safetensors |
| Entrada | Audio 16 kHz mono WAV (log-Mel spectrogram) |
| Decodificacion | Autorregresiva, greedy |
| Modelo base | CohereLabs/cohere-transcribe-arabic-07-2026 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Cohere Transcribe 03-2026: un encoder basado en Conformer que procesa el espectrograma log-Mel del audio y una cabeza encoder-decoder Transformer con atención cruzada y embeddings de token compartidos entre encoder y decoder. La decodificación es autorregresiva y, en esta conversión, se ejecuta con decodificación greedy sin modelo de lenguaje externo.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El modelo está optimizado explícitamente para árabe dialectal y para cambio de código árabe-inglés, lo que sugiere un conjunto de entrenamiento con material dialectal y conversacional. La conversión GGUF se realizó desde el commit upstream 0a8193c y se validó numéricamente contra la referencia de Transformers en el commit d89ecb7 de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto offline para árabe (incluidos dialectos) e inglés.
- Manejo de cambio de código árabe-inglés dentro de una misma locución.
- Selección de idioma mediante flag (`-l ar` o `-l en`).
- Procesamiento de audio de 16 kHz mono WAV (con conversión previa desde otros formatos mediante ffmpeg).
- Inferencia local en CPU, Apple Silicon (Metal) y GPUs AMD (Vulkan).
- No soporta streaming (según la model card: `streaming: false`).
- No soporta traducción (`translate: false`).
- No realiza detección automática de idioma (`lang_detect: false`).
- No genera timestamps (`timestamps: none`).
- No soporta tool calling ni function calling (es un modelo ASR puro, no un LLM conversacional).

## Casos de uso

- Transcripción de reuniones y entrevistas en árabe: el modelo procesa audio de 16 kHz mono y genera transcripciones completas de forma offline, adecuado para entornos con requisitos de privacidad donde no se puede enviar audio a la nube.
- Subtitulado de contenido audiovisual en árabe dialectal: gracias a su enfoque en dialectos, puede transcribir series, podcasts o vídeos en variedades egipcias y otras variantes que los modelos centrados en árabe estándar suelen fallar.
- Atención al cliente en centros de contacto: permite transcribir llamadas en árabe e inglés para su análisis posterior (control de calidad, búsqueda de texto, cumplimiento normativo) sin depender de servicios externos.
- Investigación lingüística sobre dialectos árabes: la disponibilidad de cuantizaciones ligeras (Q4_K_M, 1,56 GB) permite desplegar el modelo en portátiles para anotar corpus dialectales en campo.
- Transcripción de contenido con code-switching: útil en comunidades bilingües árabe-inglés donde las locuciones mezclan ambos idiomas, un escenario mal cubierto por modelos monolingües.
- Despliegue en dispositivos de borde: con Q4_K_M y Q5_K_M (1,56-1,77 GB) el modelo cabe en equipos con poca VRAM o incluso en CPU, lo que habilita aplicaciones de transcripción en tiempo casi real en entornos sin GPU dedicada.
- Integración en pipelines de accesibilidad: generación de subtítulos para vídeos en árabe en plataformas educativas o administrativas, con coste de inferencia nulo tras el despliegue.

## Benchmarks y rendimiento

Resultados de WER sobre el conjunto de test completo de FLEURS Arabic (`ar_eg`, 428 utterances), decodificación greedy sin LM externo, normalizador Whisper BasicTextNormalizer:

| Cuantizacion | Tamano | WER FLEURS Arabic test |
|---|---:|---:|
| BF16 (referencia Transformers) | 4,10 GB | 11,00% |
| BF16 (port GGUF) | 4,10 GB | 11,02% |
| F16 | 4,11 GB | 11,00% |
| Q8_0 | 2,41 GB | 11,06% |
| Q6_K | 1,97 GB | 11,07% |
| Q5_K_M | 1,77 GB | 10,95% |
| Q4_K_M | 1,56 GB | 11,18% |

Todas las cuantizaciones caen dentro del intervalo de confianza del 95% de la referencia, lo que indica que la cuantización no degrada el WER de forma significativa. FLEURS Arabic es habla dialectal egipcia; los números publicados por el autor original en otros conjuntos de test árabes no son directamente comparables.

Rendimiento (RTF, real-time factor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 73 |
| Apple M4 Max | CPU | 9 |
| Ryzen 4750U | Vulkan | 8 |
| Ryzen 4750U | CPU | 3 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 1,56 GB (Q4_K_M), 1,77 GB (Q5_K_M), 1,97 GB (Q6_K), 2,41 GB (Q8_0), 4,10-4,11 GB (BF16/F16).
- GPU recomendadas: funciona en Apple Silicon con Metal (M4 Max reportado con RTF 73) y en GPUs AMD con Vulkan (Ryzen 4750U con RTF 8). No se dispone de datos específicos para A100, H100 o RTX 4090 en la información proporcionada.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M a Q8_0 (1,56-2,41 GB) en tarjetas con 4 GB o más de VRAM; también en CPU.
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake), con binario `transcribe-cli`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: RTF de 73 en Metal (M4 Max), 9 en CPU (M4 Max), 8 en Vulkan (Ryzen 4750U) y 3 en CPU (Ryzen 4750U). Un RTF mayor indica mayor velocidad relativa al tiempo real.

## Comparativa con modelos similares

No se han publicado en la información disponible datos de benchmarks comparativos con otros modelos ASR (Whisper, MMS, etc.). La model card solo advierte que FLEURS Arabic es dialecto egipcio y que los números upstream en otros conjuntos no son directamente comparables.

| Modelo | Parametros | Idiomas | Licencia | Formato |
|---|---:|---|---|---|
| cohere-transcribe-arabic-07-2026 (GGUF) | 2B | ar, en | Apache-2.0 | GGUF |
| Cohere Transcribe 03-2026 (base) | no disponible | no disponible | no disponible | safetensors |
| Whisper large-v3 | no disponible en esta ficha | multilingue | MIT | safetensors/GGUF |
| MMS (Meta) | no disponible en esta ficha | multilingue | CC-BY-NC | safetensors |

Los datos de Whisper y MMS no provienen de la información proporcionada y se incluyen solo como referencia de categoría; no se dispone de comparación de WER entre ellos y este modelo.

## Limitaciones y advertencias

- Solo soporta árabe e inglés; no es un modelo multilingüe general.
- No soporta streaming: requiere el audio completo (o segmentos) como entrada.
- No realiza detección automática de idioma: es necesario indicar `-l ar` o `-l en`.
- No genera timestamps ni traducción.
- Requiere audio de 16 kHz mono WAV; otros formatos deben convertirse previamente con ffmpeg.
- Riesgo de alucinación inherente a los modelos ASR autorregresivos, especialmente en audio con ruido o solapamientos.
- Los resultados de WER se han medido en FLEURS Arabic (dialecto egipcio); el rendimiento en otras variedades dialectales o en dominios especializados (médico, legal) no está documentado en la información disponible.
- Sesgos: no se documentan sesgos específicos en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card upstream para términos completos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha; es una conversión reciente (creada el 2026-11-01) sin validación comunitaria amplia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tryambientai/cohere-transcribe-arabic-07-2026-gguf
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- Commit upstream: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026/commit/0a8193c
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/d89ecb7
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/cohere-transcribe-arabic-07-2026.md
- Cohere: https://cohere.com
- Cohere Labs: https://cohere.com/research
