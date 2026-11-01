# tryambientai/parakeet-ultra-gguf

## Resumen

parakeet-ultra-gguf es una conversión a formato GGUF del modelo de reconocimiento automático del habla moondream/parakeet-ultra, publicada por el usuario tryambientai para su uso con el runtime transcribe.cpp. El modelo subyacente es un ajuste (post-training) de NVIDIA parakeet-tdt-0.6b-v3 realizado por Moondream, que mantiene la arquitectura original FastConformer con decodificador transducer TDT y un total de 627.265.543 parámetros en precisión completa. Está pensado para transcripción offline multilingüe sobre 25 lenguas europeas, con detección de actividad de voz integrada para segmentar grabaciones largas.

La relevancia de esta ficha radica en que ofrece inferencia local en C++ sin dependencias de Python, con cuantizaciones que van desde 486 MB (Q4_K_M) hasta 2,51 GB (F32) y una degradación de precisión prácticamente nula: el WER en LibriSpeech test-clean se mantiene entre 1,80 % y 1,82 % en todas las cuantizaciones. Frente a la versión v3 del modelo base, el autor reporta menores tasas de error tanto en inglés como en todas las lenguas FLEURS medidas.

No es un modelo de streaming ni traduce entre idiomas: procesa audio WAV mono a 16 kHz y devuelve una transcripción con puntuación, mayúsculas y marcas de tiempo opcionales a nivel de token. La licencia CC-BY-4.0 se hereda del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + decodificador transducer TDT + cabeza de actividad de voz |
| Parámetros totales | 627.265.543 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (segmentos de audio de hasta 30 s por corte de VAD) |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 25 lenguas europeas: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (runtime transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo es un sistema de ASR híbrido compuesto por un encoder FastConformer seguido de un decodificador transducer TDT (Token-and-Duration Transducer), la misma arquitectura de parakeet-tdt-0.6b-v3 de NVIDIA. Incluye además una pequeña cabeza de detección de actividad de voz que el propio modelo utiliza para trocear grabaciones largas en pausas, generando segmentos de como máximo 30 segundos antes de la decodificación. La entrada es audio WAV mono a 16 kHz y la salida es texto con puntuación y capitalización, con marcas de tiempo a nivel de token opcionales.

El ajuste lo realizó Moondream sobre el checkpoint v3, manteniendo arquitectura, tokenizador y número de parámetros. La model card no detalla la composición del dataset de post-entrenamiento ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible. La decodificación es greedy de transducer sin modelo de lenguaje externo. La conversión a GGUF está fijada al commit 73175eb del modelo original (2026-10-04) y validada contra la referencia kestrel 0.9.1 (Photon) en el commit 08f9e6f0 de transcribe.cpp el 2026-10-05.

## Capacidades

- Transcripción de voz a texto offline en 25 lenguas europeas.
- Detección automática del idioma (lang_detect: true).
- Puntuación y capitalización en la salida.
- Marcas de tiempo a nivel de token (timestamps: token).
- Segmentación de audio largo mediante cabeza de VAD integrada (segmentos de hasta 30 s).
- Soporte de cuantizaciones con pérdida mínima de precisión (diferencia máxima de 0,02 pp en LibriSpeech test-clean entre F32 y Q4_K_M).
- No soporta streaming (streaming: false).
- No soporta traducción entre idiomas (translate: false).
- No dispone de tool calling ni capacidades de agente.

## Casos de uso

- Subtitulado automático de vídeo y audio: el modelo genera marcas de tiempo a nivel de token, lo que permite alinear la transcripción con la pista de audio y producir subtítulos sincronizados sin post-procesado adicional.
- Transcripción de reuniones y entrevistas largas: la cabeza de VAD corta la grabación en segmentos de hasta 30 s en las pausas naturales, de modo que se puede procesar una hora de audio sin intervención manual y con coherencia entre segmentos.
- Archivado y búsqueda de contenido audiovisual: al ejecutarse en C++ sobre CPU o GPU consumer con cuantizaciones de menos de 1 GB, permite indexar grandes volúmenes de grabaciones en servidores sin aceleradores dedicados.
- Aplicaciones de escritorio y edge: la cuantización Q4_K_M (486 MB) y Q8_0 (740 MB) caben en equipos modestos; el modelo reporta un factor de tiempo real de 35,03 en CPU sobre un Apple M4 Max y 13,29 en CPU sobre un Ryzen 4750U, suficiente para transcripción por lotes en local.
- Atención al cliente y análisis de llamadas: la cobertura de 25 lenguas europeas y la detección automática de idioma permiten procesar conversaciones multilingües sin enrutar cada audio a un modelo distinto.
- Investigación lingüística y corpus: la licencia CC-BY-4.0 y la disponibilidad de pesos GGUF facilitan la reproducibilidad de experimentos de ASR en lenguas con pocos recursos dentro del conjunto europeo (por ejemplo, maltés, esloveno o letón).
- Accesibilidad: generación de transcripciones para contenido hablado en aplicaciones de accesibilidad, con despliegue local que evita enviar audio a servicios en la nube.

## Benchmarks y rendimiento

WER en LibriSpeech test-clean (2.620 enunciados, batch 8, sin marcas de tiempo, hint de idioma `en`, decodificado en CUDA):

| Cuantización | Tamaño | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 2,51 GB | 1,80 % |
| F16 | 1,26 GB | 1,80 % |
| Q8_0 | 740 MB | 1,80 % |
| Q6_K | 611 MB | 1,81 % |
| Q5_K_M | 550 MB | 1,81 % |
| Q4_K_M | 486 MB | 1,82 % |

WER en FLEURS con Q8_0:

| Idioma | WER |
|---|---:|
| it | 2,34 % |
| es | 3,06 % |
| pt | 4,16 % |
| en | 4,26 % |
| de | 4,58 % |
| fr | 4,66 % |
| ru | 5,63 % |
| uk | 5,71 % |
| pl | 6,16 % |
| nl | 6,70 % |
| sk | 7,83 % |
| ro | 10,12 % |
| cs | 11,04 % |
| bg | 11,04 % |
| fi | 11,14 % |
| hr | 11,30 % |
| sv | 12,83 % |
| hu | 13,09 % |
| et | 14,44 % |
| da | 15,98 % |
| mt | 17,01 % |
| lt | 17,06 % |
| lv | 18,04 % |
| sl | 18,98 % |
| el | 32,25 % |

Long-form: en 11 charlas completas de TED-LIUM 3, segmentadas con la cabeza de VAD del modelo, F32 obtiene 2,22 % de WER, idéntico a la referencia kestrel, y todas las cuantizaciones se mantienen dentro de 0,05 pp.

Rendimiento (factor de tiempo real, RTF):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | CPU | 35,03 |
| Apple M4 Max | Metal | 189,12 |
| AMD Ryzen 4750U | CPU | 13,29 |
| AMD Ryzen 4750U | Vulkan | 23,00 |

Nota: la model card de Moondream reporta 1,41 % en LibriSpeech test-clean usando los normalizadores del Open ASR Leaderboard con alineamiento de compuestos; el pipeline de transcribe.cpp reproduce 1,80 % con kestrel, por lo que las cifras no son directamente comparables.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,5 GB para Q4_K_M, 0,74 GB para Q8_0, 1,26 GB para F16 y 2,51 GB para F32 (más overhead del runtime).
- Cabe en cualquier GPU consumer con al menos 2 GB de VRAM, incluidas GTX 1050, RTX 3050, RTX 4060, RTX 4090, así como en Apple Silicon vía Metal.
- Funciona íntegramente en CPU: el modelo reporta RTF de 35,03 en CPU de M4 Max y 13,29 en Ryzen 4750U, lo que permite transcripción en tiempo real o más rápido incluso sin GPU.
- Backends disponibles: CPU, Metal (Apple) y Vulkan (AMD/Intel), según los datos de RTF publicados.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli` y librería), compilado con CMake. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no se publican valores absolutos de latencia ni de tokens por segundo; solo el factor de tiempo real por plataforma.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formato / runtime | WER LibriSpeech test-clean |
|---|---:|---|---|---|---:|
| parakeet-ultra-gguf (este) | 627 M | 25 europeas | CC-BY-4.0 | GGUF / transcribe.cpp | 1,80 % (F32) |
| nvidia/parakeet-tdt-0.6b-v3 | ~600 M | 25 europeas | no disponible en la información | NeMo / PyTorch | no disponible en la información |
| moondream/parakeet-ultra (base) | 627 M | 25 europeas | CC-BY-4.0 | safetensors / kestrel | 1,41 % (con normalizadores del leaderboard; 1,80 % con el scorer de transcribe.cpp) |
| Whisper large-v3 | no disponible en la información | multilingüe amplio | MIT (según conocimiento general, no verificado aquí) | múltiples | no disponible en la información |

La comparación directa con Whisper u otros sistemas queda limitada porque la información proporcionada no incluye sus métricas en el mismo pipeline de evaluación. El propio autor advierte que las cifras de la model card de Moondream no son comparables con las de transcribe.cpp por diferencias en los normalizadores.

## Limitaciones y advertencias

- No es un modelo de streaming: requiere el audio completo o segmentado de antemano.
- No traduce: solo transcribe en el idioma hablado.
- Solo acepta WAV mono a 16 kHz; es necesario convertir otros formatos con ffmpeg u otra herramienta.
- Rendimiento muy desigual entre lenguas: el WER en FLEURS va del 2,34 % en italiano al 32,25 % en griego, pasando por 18,98 % en esloveno o 18,04 % en letón. Para lenguas del extremo alto de la tabla, el uso en producción requiere revisión humana.
- Riesgo de alucinación en audio con ruido, música o habla solapada; no se documentan mecanismos específicos de mitigación.
- Sesgos: no se documentan sesgos demográficos ni acústicos en la información disponible.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es obligatorio citar al autor original (Moondream) y respetar los términos del modelo base.
- El repositorio GGUF tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-01; se trata de una conversión reciente y poco validada por la comunidad.
- La validación numérica se hizo contra kestrel 0.9.1 en un commit concreto de transcribe.cpp; cambios en el runtime pueden alterar los resultados.
- La model card advierte de discrepancias entre sus cifras y las de Moondream por diferencias en el scorer; conviene fijar el pipeline de evaluación antes de comparar con otros sistemas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tryambientai/parakeet-ultra-gguf
- Modelo base (Moondream): https://huggingface.co/moondream/parakeet-ultra
- Commit del modelo base usado: https://huggingface.co/moondream/parakeet-ultra/commit/73175eb
- Modelo NVIDIA original: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/08f9e6f0
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-ultra.md
- Descarga directa Q8_0: https://huggingface.co/handy-computer/parakeet-ultra-gguf/resolve/main/parakeet-ultra-Q8_0.gguf
