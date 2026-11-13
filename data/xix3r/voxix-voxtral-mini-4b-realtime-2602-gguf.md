# xix3r/voxix-Voxtral-Mini-4B-Realtime-2602-gguf

## Resumen

Voxtral Mini 4B Realtime 2602 es un modelo de reconocimiento automatico del habla (ASR) multimodal desarrollado por Mistral AI, disenado para transcripcion en tiempo real con una latencia inferior a 500 ms. Combina un codificador de audio causal de aproximadamente 970 millones de parametros con un decodificador de lenguaje Ministral de unos 3.400 millones de parametros, sumando un total de 4.429.707.024 parametros. Su principal innovacion es lograr una precision comparable a los sistemas offline manteniendo un flujo de transcripcion incremental, algo poco habitual en el ecosistema abierto.

Esta ficha corresponde a la conversion a formato GGUF publicada por el usuario xix3r, derivada del modelo original de Mistral AI y pensada para su uso con la libreria transcribe.cpp. La conversion incluye seis niveles de cuantizacion (BF16, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) y ha sido validada numericamente contra la implementacion de referencia de Transformers, con resultados de WER practicamente identicos entre cuantizaciones.

El modelo soporta 13 idiomas con deteccion automatica de lengua, emite un token de texto por cada ranura de audio de 80 ms (12,5 Hz) y admite tanto transcripcion en streaming con latencia configurable como transcripcion offline orientada a maxima precision. Su licencia Apache-2.0 facilita la adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM: codificador de audio causal (~970M, conv stem causal con left-pad + transformer de 32 capas con RoPE de ventana deslizante) + proyector de 4 grupos de frames + decodificador Ministral (~3,4B, 26 capas, GQA 32/8, NEOX RoPE) con delay-token conditioning |
| Parametros totales | 4.429.707.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, es, de, ru, zh, ja, it, pt, nl, ar, hi, ko (13 idiomas, deteccion automatica) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura es un audio-LLM de fusion aditiva: un codificador de audio causal de aproximadamente 970 millones de parametros (conv stem causal con left-pad y transformer de 32 capas con RoPE de ventana deslizante) procesa el audio y alimenta un proyector de 4 grupos de frames cuyas embeddings se suman directamente sobre el decodificador Ministral de aproximadamente 3.400 millones de parametros (26 capas, GQA con 32 cabezas de consulta y 8 de clave/valor, NEOX RoPE). El modelo emplea delay-token latency conditioning y emite un token de texto por cada ranura de audio de 80 ms (12,5 Hz). Segun la model card, es arquitectonicamente distinto de la familia offline Voxtral 2507: tiene arquitectura propia, frontend de streaming, codificador causal y fusion aditiva del audio.

La entrada es audio WAV mono a 16 kHz. El modelo admite dos modos: streaming incremental, con latencia y calidad configurables mediante `--stream-chunk-ms` y `--stream-voxtral-delay`, y transcripcion offline con un delay de 2400 ms orientado a maxima precision. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Transcripcion de voz a texto en tiempo real con latencia inferior a 500 ms en modo streaming.
- Transcripcion offline de alta precision con delay de 2400 ms.
- Soporte multilingue en 13 idiomas: ingles, frances, espanol, aleman, ruso, chino, japones, italiano, portugues, neerlandes, arabe, hindi y coreano.
- Deteccion automatica de idioma (`lang_detect: true`).
- Emision de un token de texto por ranura de audio de 80 ms (12,5 Hz), lo que habilita el flujo incremental.
- Modo streaming configurable en latencia y calidad.
- No soporta traduccion (`translate: false`).
- No genera timestamps (`timestamps: none`).
- No se documentan capacidades de tool calling, agentes ni vision.

## Casos de uso

- Subtitulado en directo de reuniones y videoconferencias: el modo streaming con latencia configurable permite generar transcripciones incrementales mientras se habla, adecuado para actas automaticas y accesibilidad en tiempo real.
- Asistentes de voz interactivos: la latencia inferior a 500 ms hace viable integrar el modelo en bucles de conversacion donde el usuario espera respuesta casi inmediata.
- Transcripcion de archivos de audio y video en lote: el modo offline con delay de 2400 ms prioriza precision, util para generar transcripciones de podcasts, clases o entrevistas.
- Atencion al cliente con analitica de llamadas: la deteccion automatica de idioma y el soporte de 13 lenguas permiten procesar conversaciones telefonicas multilingues sin preconfigurar el idioma.
- Sistemas de documentacion clinica o legal: la transcripcion offline de alta precision resulta adecuada para dictado de informes donde prima la exactitud sobre la latencia.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (2,83 GB) y Q5_K_M (3,28 GB) permiten ejecutar el modelo en equipos sin GPU dedicada o con GPU de gama media, habilitando transcripcion local con privacidad de datos.
- Investigacion en ASR multilingue: la disponibilidad de seis niveles de cuantizacion con WER practicamente identico facilita experimentos de eficiencia sin degradar la calidad.

## Benchmarks y rendimiento

Resultados de WER/CER sobre FLEURS con cuantizacion Q8_0 (publicados en la model card):

| Idioma | Metrica | Q8_0 |
|---|---|---|
| Arabe | WER | 14,53 |
| Aleman | WER | 4,24 |
| Ingles | WER | 6,27 |
| Espanol | WER | 2,67 |
| Frances | WER | 6,29 |
| Hindi | WER | 14,44 |
| Italiano | WER | 2,25 |
| Japones | CER | 5,44 |
| Coreano | CER | 5,27 |
| Neerlandes | WER | 6,09 |
| Portugues | WER | 3,87 |
| Ruso | WER | 5,41 |
| Chino | CER | 10,41 |

Resultados sobre LibriSpeech test-clean (2.620 utterances, batch size 8, sin timestamps, normalizador de texto ingles de Whisper, camino offline a delay 6, GPU NVIDIA L40S):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---|---|
| BF16 | 8,87 GB | 2,08% |
| F16 | 8,88 GB | 2,09% |
| Q8_0 | 4,73 GB | 2,07% |
| Q6_K | 3,66 GB | 2,08% |
| Q5_K_M | 3,28 GB | 2,08% |
| Q4_K_M | 2,83 GB | 2,08% |

La referencia con Transformers (VoxtralRealtimeForConditionalGeneration, BF16, greedy) en la misma maquina obtiene 2,08%, por lo que el GGUF BF16 iguala la referencia. Todas las cuantizaciones se mantienen dentro del ruido bootstrap (2,07-2,09%), lo que indica que la escala de cuantizacion es neutra en WER hasta Q4_K_M.

Rendimiento en tiempo real (RTF, real-time factor):

| Plataforma | Backend | RTF |
|---|---|---|
| Apple M4 Max | CPU | 2,41 |
| Apple M4 Max | Metal | 6,63 |
| AMD Ryzen 4750U | CPU | 0,58 |
| AMD Ryzen 4750U | Vulkan | 0,76 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,83 GB para Q4_K_M, 3,28 GB para Q5_K_M, 3,66 GB para Q6_K, 4,73 GB para Q8_0 y 8,87-8,88 GB para BF16/F16.
- Cabe en GPU de consumo: Q4_K_M y Q5_K_M entran en GPUs con 4-6 GB de VRAM; Q8_0 requiere al menos 6-8 GB; BF16/F16 requieren 10-12 GB.
- GPUs recomendadas: NVIDIA L40S (usada para los benchmarks de WER), A100, H100 para maxima capacidad; RTX 4090 y GPUs de gama media para cuantizaciones bajas.
- Aceleracion en Apple Silicon mediante Metal (RTF 6,63 en M4 Max) y en AMD mediante Vulkan (RTF 0,76 en Ryzen 4750U).
- Despliegue: la libreria transcribe.cpp (compilacion con CMake, binario `transcribe-cli`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: inferior a 500 ms en modo streaming; delay de 2400 ms en modo offline de maxima precision.
- Entrada: WAV mono a 16 kHz (conversion previa con ffmpeg si es necesario).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada que permitan una comparacion cuantitativa rigurosa. Como referencia cualitativa, la model card situa a este modelo entre las primeras soluciones abiertas que logran precision comparable a sistemas offline con latencia inferior a 500 ms, y lo distingue explicitamente de la familia offline Voxtral 2507 de Mistral AI por su arquitectura propia de streaming. Los datos comparativos con otros sistemas ASR quedan como no disponibles.

## Limitaciones y advertencias

- No genera timestamps (`timestamps: none`), lo que limita su uso en subtitulado con sincronizacion temporal precisa.
- No soporta traduccion (`translate: false`): transcribe en el idioma original, no traduce.
- El WER publicado es unicamente para ingles (LibriSpeech); el rendimiento multilingue se documenta solo en FLEURS y con cuantizacion Q8_0.
- El WER en arabe (14,53) y hindi (14,44) es notablemente superior al de lenguas europeas, lo que debe tenerse en cuenta en despliegues en esos idiomas.
- El CER en chino (10,41) es el mas alto de los idiomas evaluados con metrica de caracteres.
- La medicion con delay-30 esta pendiente segun la model card; los resultados actuales corresponden a delay 6.
- Riesgo de alucinacion inherente a los modelos de lenguaje en la decodificacion, especialmente en audio con ruido o solapamiento de hablantes.
- La conversion GGUF ha sido validada contra la referencia de Transformers, pero el repositorio tiene 0 descargas y 0 likes, por lo que su adopcion y validacion por la comunidad es practicamente nula.
- Requiere audio WAV mono a 16 kHz como entrada; es necesario preprocesar otros formatos.
- Licencia Apache-2.0 heredada del modelo base, sin restricciones comerciales adicionales conocidas, pero conviene consultar la model card upstream para los terminos completos.

## Enlaces

- Repositorio Hugging Face de esta conversion: https://huggingface.co/xix3r/voxix-Voxtral-Mini-4B-Realtime-2602-gguf
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602
- Commit upstream de referencia: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602/commit/2769294
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/483c122
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/voxtral-realtime.md
- Repositorio GGUF de referencia de handy-computer: https://huggingface.co/handy-computer/Voxtral-Mini-4B-Realtime-2602-gguf
- Paper referenciado: arxiv:2602.11298
