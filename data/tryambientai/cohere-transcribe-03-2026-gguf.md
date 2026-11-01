# tryambientai/cohere-transcribe-03-2026-gguf

## Resumen

Cohere Transcribe (cohere-transcribe-03-2026) es un modelo de reconocimiento automático del habla (ASR) dedicado, audio-entrada y texto-salida, desarrollado por Cohere y Cohere Labs. Con aproximadamente 2.049 millones de parámetros (2B), está diseñado específicamente para transcripción multilingüe offline en 14 idiomas, sin capacidades generativas generales ni multimodalidad más allá del audio.

La ficha que nos ocupa corresponde a la conversión GGUF del modelo original, publicada por el usuario tryambientai y preparada para su uso con transcribe.cpp, un runtime de inferencia especializado en modelos ASR. Esta conversión permite ejecutar el modelo en CPU y GPU de consumo mediante cuantizaciones de 4 a 16 bits, con una degradación de precisión mínima: el WER en LibriSpeech test-clean se mantiene entre 1,25 % y 1,27 % en todas las cuantizaciones, frente al 1,26 % de la referencia BF16.

El interés actual de esta ficha reside en que ofrece una vía práctica para desplegar un ASR multilingüe de 2B parámetros en hardware modesto (1,55 GB en Q4_K_M) con licencia Apache-2.0, lo que facilita su integración en productos comerciales y flujos de trabajo de transcripción sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder + Transformer encoder-decoder con cross-attention y embeddings de token atados |
| Parametros totales | 2.049.026.832 (aproximadamente 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, it, pt, nl, pl, el, ar, ja, zh, vi, ko (14 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transcribe.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura conformer-based encoder-decoder. Un encoder Conformer de gran tamano extrae representaciones acusticas a partir de un espectrograma log-Mel de la forma de onda de entrada; la senal se remuestrea automaticamente a 16 kHz y, si es multicanal, se promedia a mono. Sobre esa representacion actua una cabeza Transformer encoder-decoder con atencion cruzada y embeddings de token atados, que genera la transcripcion de forma autoregresiva. La entrada es siempre un WAV mono de 16 kHz; la salida es texto plano.

No se dispone de informacion detallada sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card original de Cohere no detalla estos aspectos en la informacion proporcionada. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. La decodificacion es autoregresiva y, segun la ficha de transcribe.cpp, el modelo no soporta streaming, traduccion ni deteccion de idioma, y no emite timestamps.

## Capacidades

- Transcripcion de voz a texto offline en 14 idiomas: ingles, frances, aleman, espanol, italiano, portugues, neerlandes, polaco, griego, arabe, japones, chino, vietnamita y coreano.
- Procesamiento de audio de entrada en formato WAV mono a 16 kHz (remuestreo y conversion a mono automaticos en el preprocesado).
- Decodificacion autoregresiva con encoder Conformer y cabeza Transformer encoder-decoder.
- No soporta streaming: la transcripcion es por lotes sobre ficheros completos.
- No soporta traduccion automatica ni deteccion automatica de idioma.
- No genera timestamps a nivel de palabra o segmento.
- No dispone de tool calling, function calling ni capacidades de agente.
- No es un modelo multimodal general: solo acepta audio y produce texto.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo puede procesar grabaciones completas en WAV mono a 16 kHz y generar la transcripcion en uno de los 14 idiomas soportados, adecuado para equipos distribuidos en Europa y Asia.
- Subtitulado offline de contenido audiovisual: convirtiendo previamente el audio con ffmpeg a 16 kHz mono, se puede transcribir video para generar subtitulos en español, frances, aleman o japones sin depender de APIs externas.
- Atencion al cliente basada en voz: integrado en un pipeline que convierte llamadas grabadas en texto, permite analizar conversaciones multilingues para control de calidad y extraccion de motivos de consulta.
- Documentacion clinica dictada: transcripcion de notas de voz de profesionales sanitarios en entornos con requisitos de privacidad, al ejecutarse localmente sin enviar audio a la nube.
- Investigacion en lingüistica y corpus orales: generacion de transcripciones para corpus multilingues con WER bajo (1,25 % en LibriSpeech test-clean), util para anotacion semiautomatica de datos.
- Accesibilidad: conversion de contenido hablado en texto para personas con discapacidad auditiva, desplegable en hardware de consumo (1,55 GB en Q4_K_M) en aplicaciones de escritorio.
- Procesamiento por lotes en servidores modestos: con el runtime transcribe.cpp y cuantizacion Q4_K_M, se puede transcribir grandes volumenes de audio en CPU (RTF 3 en Ryzen 4750U) o GPU integrada (RTF 8 con Vulkan).

## Benchmarks y rendimiento

Resultados de WER en LibriSpeech test-clean (2620 utterances, decodificacion greedy, sin LM externo, normalizador EnglishTextNormalizer de Whisper):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 4,10 GB | 1,26 % |
| F16 | 4,11 GB | 1,26 % |
| Q8_0 | 2,41 GB | 1,27 % |
| Q6_K | 1,97 GB | 1,27 % |
| Q5_K_M | 1,76 GB | 1,25 % |
| Q4_K_M | 1,55 GB | 1,25 % |
| Referencia Cohere (Open ASR Leaderboard, 2026-03-26) | No disponible | 1,25 % |

Rendimiento medido (RTF, real-time factor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 73 |
| Apple M4 Max | CPU | 9 |
| AMD Ryzen 4750U | Vulkan | 8 |
| AMD Ryzen 4750U | CPU | 3 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que el modelo es exclusivamente ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB en Q4_K_M, 2,0 GB en Q6_K, 2,4 GB en Q8_0 y 4,1 GB en BF16/F16 (tamano de pesos; el consumo real anade overhead del runtime).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de memoria para cuantizaciones bajas; en el modelo base sin cuantizar se recomienda A100, H100 o RTX 4090 para maximizar throughput.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas (por ejemplo, RTX 3050, RTX 4060, GTX 1660) usando Q4_K_M o Q5_K_M.
- Opciones de despliegue: transcribe.cpp (runtime oficial de esta conversion), con soporte de backend CPU, Metal y Vulkan. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: en Apple M4 Max con Metal, RTF 73 (aproximadamente 73 veces mas rapido que tiempo real); en CPU del mismo equipo, RTF 9; en AMD Ryzen 4750U con Vulkan, RTF 8; en CPU del mismo, RTF 3.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto audio | Licencia | Formato | WER LibriSpeech test-clean |
|---|---:|---|---|---|---|---:|
| cohere-transcribe-03-2026 (esta ficha, GGUF) | 2B | 14 | No disponible | Apache-2.0 | GGUF | 1,25-1,27 % |
| Whisper large-v3 (referencia de la categoria) | 1,55B | ~99 | 30 s por ventana | MIT | safetensors, GGUF, etc. | No disponible en la informacion proporcionada |
| Otros modelos ASR comparables | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos directos con otros modelos ASR en la informacion proporcionada, salvo la referencia del propio Cohere en el Open ASR Leaderboard (1,25 %). La comparacion con Whisper large-v3 se incluye por categoria y tamano, pero sin cifras de rendimiento verificadas en esta ficha.

## Limitaciones y advertencias

- El modelo solo acepta audio WAV mono a 16 kHz; es necesario convertir previamente otros formatos con ffmpeg u otra herramienta.
- No soporta streaming: la transcripcion es offline y por lotes, lo que lo hace inadecuado para aplicaciones de voz en tiempo real.
- No realiza deteccion automatica de idioma ni traduccion: el idioma de salida debe corresponder al audio de entrada.
- No genera timestamps, lo que limita su uso en subtitulado sincronizado o analisis temporal fino.
- Riesgo de alucinacion en segmentos con ruido, silencios largos o audio de baja calidad, comun en modelos ASR autoregresivos; se recomienda validacion en produccion.
- Sesgos potenciales derivados de los datos de entrenamiento no documentados en la informacion disponible; el rendimiento puede variar entre los 14 idiomas y acentos.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card original de Cohere para terminos adicionales.
- Esta ficha corresponde a una conversion GGUF de terceros (tryambientai) validada contra la referencia de Transformers en un commit concreto; cambios en el runtime transcribe.cpp pueden afectar la compatibilidad.
- El numero de descargas y likes es 0 en el momento de la consulta, lo que indica poca validacion comunitaria de esta conversion especifica.

## Enlaces

- HuggingFace (esta conversion GGUF): https://huggingface.co/tryambientai/cohere-transcribe-03-2026-gguf
- Modelo base en HuggingFace: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Commit del modelo base referenciado: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026/commit/76b8b23
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/bf0d0b7
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/cohere-transcribe-03-2026.md
- Cohere Labs: https://cohere.com/research
- Cohere: https://cohere.com
