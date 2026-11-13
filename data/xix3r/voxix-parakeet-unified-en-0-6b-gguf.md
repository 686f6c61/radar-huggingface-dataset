# xix3r/voxix-parakeet-unified-en-0.6b-gguf

## Resumen

voxix-parakeet-unified-en-0.6b-gguf es una conversión al formato GGUF del modelo NVIDIA `parakeet-unified-en-0.6b`, publicada por el usuario xix3r para su uso con la librería transcribe.cpp. Se trata de un sistema de reconocimiento automático del habla (ASR) en inglés, basado en una arquitectura transducer RNN-T con encoder FastConformer de aproximadamente 618 millones de parámetros. El modelo original de NVIDIA se entrenó como modelo "unificado", capaz de operar tanto en modo offline como en streaming con latencias de entre 160 ms y 2080 ms, si bien esta conversión GGUF expone únicamente el modo offline.

El problema que resuelve es la transcripción de voz a texto en inglés con puntuación y capitalización integradas, sin necesidad de un modelo de lenguaje externo. La conversión GGUF permite ejecutar el modelo en hardware de consumo mediante cuantización, con tamaños que van desde 477 MB (Q4_K_M) hasta 2,47 GB (F32), manteniendo una tasa de error de palabra (WER) muy estable en torno al 1,6 % sobre LibriSpeech test-clean.

Es relevante ahora porque traslada un modelo ASR de referencia de NVIDIA al ecosistema de inferencia local ligera (transcribe.cpp), con backend Metal, Vulkan y CPU, y porque demuestra que la cuantización agresiva (Q4_K_M) apenas degrada la precisión en este tipo de arquitecturas. La licencia CC-BY-4.0 permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + RNN-T transducer decoder |
| Parametros totales | 618.309.121 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; el modelo base soporta contextos de streaming configurables de 160 a 2080 ms) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura combina un encoder FastConformer (variante eficiente de Conformer con atención subsampleada) con un decoder transducer RNN-T. El modelo base fue entrenado por NVIDIA como modelo unificado para inferencia offline y streaming, con contextos de atención de streaming configurables en pasos de 80 ms entre 160 ms y 2080 ms de latencia mínima. El entrenamiento se realizó mayoritariamente sobre la porción en inglés del dataset Granary, que contiene aproximadamente 250.000 horas de habla en inglés estadounidense (en-US) en condiciones acústicas diversas. El modelo produce texto en alfabeto inglés con espacios y apóstrofos, con puntuación y capitalización integradas.

Esta conversión GGUF se portó desde el commit upstream `d4ac992` (fijado el 2026-05-10) y se validó contra la referencia NeMo en el commit `42528dd` de transcribe.cpp. Aunque los contextos de atención de streaming están presentes en el GGUF, transcribe.cpp todavía no expone una entrada de streaming, por lo que esta conversión funciona exclusivamente en modo offline. La decodificación es greedy RNN-T sin modelo de lenguaje externo.

## Capacidades

- Transcripción de voz a texto en inglés (speech-to-text) con puntuación y capitalización automáticas.
- Reconocimiento offline de audio de 16 kHz mono.
- Soporte de timestamps a nivel de token (según metadatos de la model card).
- No soporta traducción (`translate: false`).
- No soporta detección de idioma (`lang_detect: false`).
- No soporta tool calling, function calling ni razonamiento multi-step (no es un modelo generativo de propósito general).
- No dispone de modo visión ni audio más allá de la transcripción ASR.
- El modelo base soporta streaming, pero esta conversión GGUF no lo expone todavía.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo procesa audio de 16 kHz mono y devuelve texto con puntuación y capitalización, adecuado para generar actas automáticas de reuniones en inglés sin infraestructura de GPU dedicada.
- Subtitulado offline de vídeos: dado el WER de ~1,6 % en LibriSpeech test-clean y los timestamps a nivel de token, puede usarse para generar subtítulos sincronizados en pipelines de postproducción.
- Dictado y productividad personal: con la cuantización Q4_K_M (477 MB) cabe en equipos modestos y permite integrar dictado por voz en aplicaciones de escritorio con backend CPU o Vulkan.
- Anonimización y análisis de llamadas de atención al cliente: transcripción por lotes de grabaciones en inglés para extracción de texto posterior, con despliegue en CPU (RTF 7,5 en Ryzen 4750U) o Vulkan (RTF 12,5).
- Investigación en ASR y evaluación de cuantización: el modelo sirve como referencia reproducible para medir el impacto de F32 frente a Q4_K_M en WER (1,59 % frente a 1,62 %), útil en estudios de compresión de modelos.
- Despliegue en dispositivos Apple Silicon: con backend Metal y RTF de 163 en M4 Max, es adecuado para transcripción casi en tiempo real en portátiles Mac sin GPU dedicada.
- Preprocesado de corpus de voz para entrenamiento de otros modelos: transcripción masiva de audio inglés con un modelo ligero y licencia permisiva.

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean completo (2620 utterances), decodificación greedy RNN-T sin LM externo:

| Cuantizacion | Tamano | WER (%) |
|---|---:|---:|
| F32 | 2,47 GB | 1,59 |
| F16 | 1,24 GB | 1,59 |
| Q8_0 | 731 MB | 1,60 |
| Q6_K | 602 MB | 1,61 |
| Q5_K_M | 541 MB | 1,58 |
| Q4_K_M | 477 MB | 1,62 |

Referencia: NVIDIA reporta 1,63 % en el mismo split. El baseline F32 de esta conversión es 1,59 %.

Rendimiento (RTF, real-time factor):

| Hardware / backend | RTF |
|---|---:|
| Apple M4 Max, Metal | 163 |
| Apple M4 Max, CPU | 28,5 |
| AMD Ryzen 4750U, Vulkan | 12,5 |
| AMD Ryzen 4750U, CPU | 7,5 |

No se han publicado en la información disponible resultados de benchmarks en otros conjuntos (MMLU, HumanEval, GSM8K u otros), que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 477 MB (Q4_K_M) hasta 2,47 GB (F32); Q8_0 requiere 731 MB.
- Cabe en GPU de consumo: cualquier GPU con al menos 1 GB de memoria libre puede ejecutar Q4_K_M o Q5_K_M; F16 requiere ~1,3 GB.
- GPU recomendadas: no se especifican modelos concretos; los datos de RTF disponibles corresponden a Apple M4 Max (Metal) y AMD Ryzen 4750U (Vulkan/CPU).
- Despliegue: transcribe.cpp (compilación desde fuente con CMake), con backends Metal, Vulkan y CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: RTF de 163 en M4 Max con Metal y 12,5 en Ryzen 4750U con Vulkan; en CPU, RTF de 28,5 (M4 Max) y 7,5 (Ryzen 4750U). Un RTF superior a 1 indica transcripción más rápida que tiempo real.
- Requiere audio de entrada en WAV mono a 16 kHz; conversión previa con ffmpeg si el origen es MP3 u otro formato.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / latencia | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---:|---:|---|---|
| voxix-parakeet-unified-en-0.6b-gguf (esta ficha) | 618 M | offline (streaming no expuesto) | 1,59 % (F32) | CC-BY-4.0 | GGUF |
| nvidia/parakeet-unified-en-0.6b (base) | 0,6 B | offline + streaming 160-2080 ms | 1,63 % (reportado) | CC-BY-4.0 | NeMo |
| Modelos transducer offline/streaming previos de NVIDIA | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos comparativos de otros modelos ASR (por ejemplo Whisper) para establecer una comparativa numérica fiable; no se inventan cifras.

## Limitaciones y advertencias

- Solo inglés (en-US): no soporta otros idiomas ni detección de idioma.
- No soporta traducción; transcribe únicamente en inglés.
- Esta conversión GGUF no expone el modo streaming, pese a que el modelo base lo soporta; el uso es exclusivamente offline.
- Sin modelo de lenguaje externo: la decodificación greedy puede producir errores en nombres propios, jerga o audio con ruido extremo.
- Riesgo de alucinación inherente a modelos ASR en segmentos de silencio, ruido o habla solapada; no se han publicado análisis específicos de sesgos en la información disponible.
- El WER reportado proviene de LibriSpeech (dominio lectura), no de habla espontánea o condiciones acústicas adversas; el rendimiento en producción puede ser peor.
- Licencia CC-BY-4.0: permite uso comercial con atribución; consultar los términos completos del modelo base de NVIDIA.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; validación limitada a la comunidad.
- Dependencia de transcribe.cpp: requiere compilación desde fuente y no está disponible en runtimes más extendidos como llama.cpp u Ollama.
- El modelo base se fijó en el commit `d4ac992`; cambios posteriores en upstream no están reflejados.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/xix3r/voxix-parakeet-unified-en-0.6b-gguf
- Modelo base NVIDIA: https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- Commit upstream del modelo base: https://huggingface.co/nvidia/parakeet-unified-en-0.6b/commit/d4ac992
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-unified-en-0.6b.md
- Descargas GGUF (repo handy-computer): https://huggingface.co/handy-computer/parakeet-unified-en-0.6b-gguf
- Paper de referencia (arXiv 2604.19079): https://arxiv.org/abs/2604.19079
- Paper de referencia (arXiv 2305.05084): https://arxiv.org/abs/2305.05084
- Paper de referencia (arXiv 2304.09325): https://arxiv.org/abs/2304.09325
