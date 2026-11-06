# tryambientai/orukeet-gguf

## Resumen

Orukeet es un modelo de reconocimiento automático del habla (ASR) multilingüe de 627 millones de parámetros desarrollado por Oruk AI, con contribuciones de investigadores de Stanford, la Universidad de Cambridge, OpenWhispr y Hoid. Se construye a partir de NVIDIA Parakeet TDT 0.6B v3 y resuelve el problema de la transcripción precisa en 25 lenguas europeas, incluyendo varias de bajos recursos como el maltés, el letón o el esloveno. Su relevancia actual radica en que iguala o supera al modelo base en 61 de las 74 particiones de evaluación probadas, manteniendo el mismo coste computacional.

La innovación principal es la sustitución de la mitad de los filtros temporales depthwise del encoder por 12.288 kernels Gabor ajustados y congelados, lo que reduce el número de parámetros entrenables y mejora la generalización multilingüe. El resto de parámetros se entrena sobre datos multilingües y multiacento. La arquitectura subyacente es un Conformer con decodificación TDT (Token-and-Duration Transducer).

Esta ficha describe la conversión a GGUF publicada por tryambientai para su uso con transcribe.cpp, una implementación en C++ que permite ejecución local en CPU, Metal y Vulkan. El modelo acepta audio de 16 kHz mono y devuelve texto con puntuación y mayúsculas. No soporta streaming ni traducción, pero sí detección de idioma y marcas de tiempo a nivel de token.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer con decodificación TDT (Token-and-Duration Transducer), encoder con filtros Gabor |
| Parámetros totales | 627.052.166 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | GGUF (conversión de safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo base es un Conformer de NVIDIA Parakeet TDT 0.6B v3, un transformer convolucional con decodificación TDT que predice tanto tokens como duraciones. Orukeet modifica el encoder reemplazando la mitad de los filtros temporales depthwise por 12.288 kernels Gabor preajustados y congelados, lo que reduce el espacio de parámetros entrenables y aporta invariancia temporal. Los parámetros restantes se entrenan sobre datos multilingües y multiacento, aunque la información disponible no detalla el número de tokens ni la composición exacta del dataset.

No se especifica en la información proporcionada si hubo RLHF, DPO u otras etapas de alineación. La model card del autor original menciona que el modelo supera a Parakeet en 61 de 74 particiones de evaluación, incluyendo LibriSpeech, pero no se detallan las técnicas de aumento de datos ni el esquema de entrenamiento más allá de la sustitución de filtros Gabor.

## Capacidades

- Transcripción de voz a texto en 25 lenguas europeas con puntuación y mayúsculas automáticas.
- Detección automática de idioma (`lang_detect: true`).
- Marcas de tiempo a nivel de token (`timestamps: token`).
- Entrada de audio de 16 kHz mono en formato WAV.
- Ejecución offline en CPU, Metal y Vulkan mediante transcribe.cpp.
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No dispone de tool calling, agentes ni razonamiento multi-paso (es un modelo ASR puro).

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo procesa audio de 16 kHz mono y devuelve texto con puntuación, adecuado para generar actas automáticas en entornos sin conexión.
- Subtitulado offline de vídeo: las marcas de tiempo a nivel de token permiten alinear subtítulos con precisión en 25 idiomas europeos, sin depender de servicios en la nube.
- Atención al cliente multilingüe: la detección automática de idioma y el soporte de 25 lenguas permiten transcribir llamadas de soporte en tiempo no real (batch) para su análisis posterior.
- Investigación lingüística y corpus: la cobertura de lenguas de bajos recursos (mt, lv, sl, et) facilita la creación de corpus transcritos donde otros modelos no llegan.
- Despliegue en dispositivos de borde: con cuantización Q4_K_M (485 MB) y ejecución en CPU (RTF 13,62 en Ryzen 4750U) o Vulkan (RTF 25,09), cabe en equipos sin GPU dedicada.
- Accesibilidad: transcripción local de audio para personas con discapacidad auditiva en aplicaciones de escritorio, sin enviar datos a terceros.
- Análisis de grabaciones históricas o periodísticas: la ejecución offline y la licencia CC-BY-SA-4.0 permiten procesar archivos sensibles en infraestructura propia.

## Benchmarks y rendimiento

WER (%) en LibriSpeech test-clean (2.620 enunciados, batch 8, sin timestamps, hint `en`, CUDA):

| Cuantización | WER LibriSpeech test-clean |
|---|---:|
| F32 | 1,86 |
| F16 | 1,86 |
| Q8_0 | 1,86 |
| Q6_K | 1,86 |
| Q5_K_M | 1,83 |
| Q4_K_M | 1,95 |

WER (%) en FLEURS con cuantización Q8_0:

| Idioma | WER |
|---|---:|
| it | 3,11 |
| es | 3,75 |
| en | 4,43 |
| pt | 4,56 |
| de | 5,64 |
| fr | 6,17 |
| uk | 6,53 |
| ru | 6,70 |
| nl | 6,93 |
| pl | 7,35 |
| sk | 8,99 |
| cs | 10,22 |
| ro | 10,86 |
| bg | 11,14 |
| hr | 11,26 |
| fi | 11,88 |
| sv | 13,26 |
| hu | 13,53 |
| et | 15,16 |
| da | 16,58 |
| mt | 17,18 |
| lt | 17,72 |
| lv | 19,53 |
| sl | 24,00 |
| el | 33,12 |

Rendimiento en tiempo real (RTF, mayor es mejor):

| Plataforma | CPU | Aceleración |
|---|---:|---:|
| Apple M4 Max | 36,31 | Metal 203,7 |
| AMD Ryzen 4750U | 13,62 | Vulkan 25,09 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el tamaño de los pesos GGUF va de 485 MB (Q4_K_M) a 2,51 GB (F32), por lo que la memoria necesaria es del orden del tamaño del archivo más overhead.
- GPU recomendadas: no se especifican modelos concretos; la validación se realizó en CUDA (sin especificar GPU) y en Apple M4 Max con Metal.
- Cabe en GPU de consumo: sí, cualquier GPU con al menos 1-3 GB de memoria libre según cuantización; también funciona en CPU.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake; soporta CPU, Metal y Vulkan. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 36,31 en CPU de M4 Max y 203,7 con Metal; 13,62 en CPU Ryzen 4750U y 25,09 con Vulkan. Un RTF superior a 1 indica procesamiento más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Orukeet (este) | 627 M | 25 europeos | CC-BY-SA-4.0 | GGUF | Supera a Parakeet en 61/74 splits |
| NVIDIA Parakeet TDT 0.6B v3 | ~600 M | 25 europeos | no disponible en la información | no disponible | Modelo base; Orukeet es más preciso en inglés y en 20 de 25 lenguas |
| parakeet-ultra | no disponible | no disponible | no disponible | no disponible | Más preciso que Orukeet y Parakeet en casi todo, según la model card |

No se dispone de datos de benchmarks comparativos adicionales con otros modelos ASR en la información proporcionada.

## Limitaciones y advertencias

- No soporta streaming: requiere audio completo en archivo, no procesa flujo continuo.
- No traduce: solo transcribe en el idioma detectado.
- Requiere audio de 16 kHz mono WAV; es necesario convertir otros formatos con ffmpeg.
- WER elevado en griego (33,12 %), esloveno (24,00 %) y letón (19,53 %), lo que limita su uso en esos idiomas para producción crítica.
- Licencia CC-BY-SA-4.0: permite uso comercial pero obliga a compartir obras derivadas bajo la misma licencia y a atribuir.
- Riesgo de alucinación en audio con ruido, acentos no representados o solapamiento de hablantes; no se documentan sesgos específicos.
- El repositorio GGUF tiene 0 descargas y 0 likes, y fue creado el 2026-11-01; es una conversión reciente sin validación comunitaria amplia.
- La model card original no detalla la composición del dataset ni posibles sesgos demográficos o dialectales.

## Enlaces

- Hugging Face (esta conversión GGUF): https://huggingface.co/tryambientai/orukeet-gguf
- Modelo base: https://huggingface.co/oruk/orukeet
- Commit del modelo base: https://huggingface.co/oruk/orukeet/commit/b59c13a
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/65856fac
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/orukeet.md
- Descarga F32: https://huggingface.co/handy-computer/orukeet-gguf/resolve/main/orukeet-F32.gguf
- Descarga F16: https://huggingface.co/handy-computer/orukeet-gguf/resolve/main/orukeet-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/orukeet-gguf/resolve/main/orukeet-Q8_0.gguf
- Descarga Q6_K: https://huggingface.co/handy-computer/orukeet-gguf/resolve/main/orukeet-Q6_K.gguf
- Descarga Q5_K_M: https://huggingface.co/handy-computer/orukeet-gguf/resolve/main/orukeet-Q5_K_M.gguf
- Descarga Q4_K_M: https://huggingface.co/handy-computer/orukeet-gguf/resolve/main/orukeet-Q4_K_M.gguf
- Sitio de Oruk AI: https://oruk.ai
- Paper referenciado: arXiv:2609.10054 (no verificado en la información disponible)
