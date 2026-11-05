# yinheyugongqiao/U2-multilingual

## Resumen

U2-multilingual es un servicio de reconocimiento automatico del habla (ASR) multilingue desarrollado por yinheyugongqiao (vinculado al dominio unisound.com) y distribuido exclusivamente a traves de una API HTTPS autenticada. No se publican pesos descargables: el repositorio de HuggingFace actua unicamente como punto de documentacion y acceso al endpoint `https://llm-eval.unisound.com/asr/v1/audio/transcriptions`. El modelo declara soporte para 13 idiomas, aunque la API solo expone actualmente cinco: aleman, italiano, portugues, espanol y frances.

El problema que resuelve es la transcripcion de audio a texto en entornos empresariales con grabaciones de entrevistas, reuniones, notas de voz y audio con ruido de fondo. Cada peticion acepta un unico archivo WAV mono a 16 kHz de hasta 300 segundos y 25 MiB, y devuelve un JSON con el texto transcrito, el nombre del modelo y el UUID de la peticion.

Su relevancia actual es limitada pero concreta: se trata de un servicio cerrado, sin codigo ni pesos publicos, con resultados de WER autodeclarados y medidos a traves de su propia API el 4 de noviembre de 2026 sobre FLEURS, MCV y MLS. Es util como referencia de rendimiento ASR multilingue en cinco lenguas europeas, pero no es desplegable localmente ni auditable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (servicio API; no se publica la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (audio de hasta 300 s por peticion) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos) |
| Idiomas soportados | 13 declarados: ar, de, es, fr, id, it, ja, ko, pt, ru, th, tr, vi; API activa solo en de, it, pt, es, fr |
| Licencia | no disponible |
| Formato de pesos | no disponible (acceso exclusivo via API HTTPS; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo (transformer, Conformer, CTC/attention hibrido, etc.), el volumen de datos de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. La model card solo describe el contrato del servicio: entrada WAV mono 16 kHz, salida de texto plano, sin etiquetas de hablante ni timestamps a nivel de palabra.

La unica innovacion tecnica documentada es de caracter operativo: normalizacion y calculo de WER con las funciones oficiales del `open_asr_leaderboard` en su version congelada del 4 de noviembre de 2026, y verificacion independiente del WER recalculado contra las listas de muestras fuente. Se reporta cobertura del 100% en 13 pares dataset/idioma, sin fallos finales ni muestras duplicadas. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades

- Transcripcion de voz a texto multilingue en cinco idiomas activos por API: aleman, italiano, portugues, espanol y frances.
- Procesamiento de grabaciones de hasta 300 segundos por peticion, con tamano maximo de 25 MiB y cuerpo multipart de 26 MiB.
- Entrada estandarizada: WAV mono a 16 kHz.
- Robustez declarada frente a ruido de fondo en grabaciones de entrevistas, reuniones y notas de voz.
- Salida JSON con campo `text` (transcripcion cruda), `model` y `request_id`.
- Soporte de hasta 16 peticiones concurrentes, con HTTP 429 y cabecera `Retry-After` para el exceso.
- Sin soporte de etiquetado de hablante (diarizacion) ni timestamps a nivel de palabra en la respuesta actual.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio generation.

## Casos de uso

- Transcripcion de entrevistas grabadas: el servicio acepta un WAV mono de 16 kHz de hasta 5 minutos por peticion, adecuado para entrevistas periodisticas o de investigacion cualitativa en espanol, frances, aleman, italiano o portugues, con salida de texto lista para analisis posterior.
- Actas de reuniones de empresa: para reuniones divididas en segmentos de hasta 300 segundos, se pueden encadenar peticiones concurrentes (hasta 16 en paralelo) y reconstruir la transcripcion completa en una aplicacion downstream de gestion documental.
- Notas de voz en aplicaciones moviles: el cliente puede convertir la grabacion a WAV mono 16 kHz y enviarla al endpoint, obteniendo texto para busqueda, indexacion o resumen en el backend.
- Transcripcion de audio con ruido de fondo: la model card indica explicitamente que el servicio esta pensado para grabaciones con ruido ambiental, lo que lo hace apto para capturas de campo o entornos no controlados.
- Localizacion de contenido audiovisual en cinco lenguas europeas: generacion de subtitulos preliminares (sin timestamps por palabra) para posterior revision humana en flujos de traduccion y doblaje.
- Enriquecimiento de CRM y atencion al cliente: transcripcion de llamadas grabadas en espanol, frances, italiano, portugues o aleman para alimentar sistemas de analisis de sentimiento o extraccion de entidades en aplicaciones de negocio.
- Procesamiento por lotes de archivo historico de audio: con 16 peticiones concurrentes y un limite de 300 s por archivo, se puede disenar un pipeline de transcripcion masiva respetando `Retry-After` ante HTTP 429.

## Benchmarks y rendimiento

Resultados autodeclarados por el autor, medidos a traves de la API HTTPS el 4 de noviembre de 2026, con normalizacion oficial de `open_asr_leaderboard` (version congelada). WER en porcentaje; menor es mejor.

| Idioma | FLEURS WER | MCV WER | MLS WER |
|---|---:|---:|---:|
| Aleman | 2,95% | 3,35% | — |
| Italiano | 1,52% | 2,17% | 4,46% |
| Portugues | 2,31% | — | 3,42% |
| Espanol | 2,07% | 3,01% | 2,81% |
| Frances | 3,06% | 4,34% | 2,67% |

Cobertura declarada del 100% en 13 pares dataset/idioma, sin fallos finales, muestras ausentes ni muestras duplicadas; WER recalculado de forma independiente. El guion (—) indica pares fuera de la configuracion de evaluacion (MLS aleman y MCV portugues no forman parte de los conjuntos publicos seleccionados). No se aportan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- No aplica VRAM local: el modelo no se distribuye en pesos y solo es accesible via API HTTPS autenticada.
- No requiere GPU propia; el cliente solo necesita conectividad de red y capacidad de construir peticiones multipart.
- Cliente minimo: `curl` (ejemplo oficial) o cualquier libreria HTTP capaz de enviar formularios multipart con cabeceras `Authorization: Bearer` y `X-Request-ID`.
- Opciones de despliegue local (vLLM, llama.cpp, Ollama, TGI): no disponibles; no hay pesos publicos.
- Latencia y throughput: no disponibles como cifras; el ejemplo oficial fija `--connect-timeout 10` y `--max-time 310`, y el servicio admite hasta 16 peticiones concurrentes por cliente.
- Preparacion de audio en cliente: conversion a WAV mono 16 kHz (por ejemplo con ffmpeg) antes del envio.

## Comparativa con modelos similares

| Modelo | Tipo de acceso | Idiomas | Pesos | Licencia | Despliegue local |
|---|---|---|---|---|---|
| U2-multilingual | API HTTPS cerrada | 13 declarados, 5 activos en API | No | no disponible | No |
| Whisper (OpenAI) | Pesos abiertos | ~99 idiomas | Si (safetensors, GGUF) | MIT | Si (vLLM, faster-whisper, llama.cpp) |
| MMS (Meta) | Pesos abiertos | >1000 idiomas | Si | CC-BY-NC | Si |
| SeamlessM4T (Meta) | Pesos abiertos | Multilingue (voz y texto) | Si | CC-BY-NC | Si |

La comparacion se limita a caracteristicas de disponibilidad y licencia, ya que no se han publicado resultados de benchmarks de U2-multilingual frente a estos modelos en la informacion proporcionada. La diferencia principal es que U2-multilingual es un servicio cerrado sin pesos, mientras que las alternativas citadas permiten inspeccion, ajuste y despliegue local.

## Limitaciones y advertencias

- Servicio cerrado: no se publican pesos, codigo de entrenamiento ni arquitectura, lo que impide auditoria, ajuste fino y despliegue en infraestructura propia.
- Cobertura real limitada a cinco idiomas (de, it, pt, es, fr), pese a declarar 13; el resto no esta disponible via API actualmente.
- Sin diarizacion ni timestamps a nivel de palabra en la respuesta, lo que limita su uso en subtitulado profesional y analisis conversacional.
- Limite de 300 segundos y 25 MiB por peticion, con necesidad de segmentar audios largos y gestionar la reconstruccion en el cliente.
- Limite de 16 peticiones concurrentes; el exceso devuelve HTTP 429 y requiere respetar `Retry-After`.
- Entrada restringida a WAV mono a 16 kHz; no se documenta soporte de otros formatos o frecuencias de muestreo.
- Resultados de WER autodeclarados por el autor y medidos sobre su propia API; no hay evaluacion independiente publicada.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion; es imprescindible contactar con el proveedor antes de integrarlo en produccion.
- Riesgo de alucinacion y errores en audio con acentos marcados, ruido extremo o solapamiento de hablantes no cuantificado en la informacion disponible.
- Dependencia de un unico endpoint externo (`llm-eval.unisound.com`), con implicaciones de disponibilidad, latencia de red y cumplimiento normativo (envio de audio a terceros).
- Sesgos demograficos y dialectales no documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yinheyugongqiao/U2-multilingual
- Endpoint de la API: https://llm-eval.unisound.com/asr/v1/audio/transcriptions
- Normalizador y funciones WER de referencia (open_asr_leaderboard, version congelada): https://github.com/huggingface/open_asr_leaderboard/tree/f58d58a3f98eb9d5c2dd284ce85954b3cd801759/normalizer
