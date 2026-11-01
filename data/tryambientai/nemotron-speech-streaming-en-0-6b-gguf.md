# tryambientai/nemotron-speech-streaming-en-0.6b-gguf

## Resumen

Nemotron-speech-streaming-en-0.6b-gguf es una conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) `nvidia/nemotron-speech-streaming-en-0.6b`, publicada por el usuario tryambientai para su uso con el motor de inferencia transcribe.cpp. El modelo original lo desarrolla NVIDIA y está diseñado para transcripción de inglés con puntuación y capitalización nativas, con una arquitectura Cache-Aware FastConformer con decodificador RNN-T (transducer). Cuenta con 618.079.745 parámetros totales y está pensado tanto para cargas de baja latencia en streaming como para procesamiento por lotes de alto rendimiento.

La relevancia de esta conversión concreta reside en que permite ejecutar un modelo ASR de calidad de producción en hardware de consumo y en CPU, sin depender del stack NeMo de NVIDIA ni de GPUs dedicadas. Las cuantizaciones publicadas van desde F32 (2,30 GB) hasta Q4_K_M (453 MB), con una degradación de WER muy contenida: 2,31 % en F32 frente a 2,38 % en Q4_K_M sobre LibriSpeech test-clean completo (2620 enunciados).

El modelo base fue actualizado en marzo de 2026 con un checkpoint entrenado sobre corpus mayores. Esta conversión se realizó desde el commit `ef3bf40` del modelo upstream, fijado el 2026-05-11, y se validó numéricamente contra la referencia de NeMo en el commit `12f1076` de transcribe.cpp en la misma fecha. Es importante señalar que, aunque el encoder es cache-aware y soporta streaming en origen, transcribe.cpp todavía no expone una API de sesión de streaming, por lo que esta conversión funciona en modo offline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cache-Aware FastConformer (encoder) + RNN-T transducer (decoder) |
| Parametros totales | 618.079.745 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; atención cache-aware con `att_context_size=[70, 13]` (chunk de 1,12 s) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | GGUF (librería transcribe.cpp) |
| Pipeline | automatic-speech-recognition |
| Entrada de audio | WAV mono a 16 kHz |
| Timestamps | a nivel de token |
| Traducción | no soportada |
| Detección de idioma | no soportada |
| Streaming | sí en el modelo base; no expuesto aún en transcribe.cpp (modo offline) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Cache-Aware FastConformer como encoder, una variante del Conformer optimizada para atención con caché que permite procesar audio de forma incremental con una ventana de atención efectiva de `att_context_size=[70, 13]`, equivalente a chunks de 1,12 segundos. El decoder es un transducer RNN-T, que decodifica de forma conjunta acústica y lingüística sin necesidad de un modelo de lenguaje externo, y produce puntuación y capitalización nativas. Esta combinación es la habitual en los modelos Parakeet de NVIDIA y está optimizada para latencia baja y throughput alto.

El modelo base admite tamaños de chunk configurables de 80 ms, 160 ms, 560 ms y 1120 ms en tiempo de ejecución, lo que permite ajustar el compromiso entre latencia y precisión. La conversión GGUF preserva la máscara de atención cache-aware de extremo a extremo. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa. La decodificación utilizada en la validación es greedy RNN-T.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación y capitalización nativas.
- Procesamiento offline de ficheros de audio WAV mono a 16 kHz.
- Soporte de timestamps a nivel de token.
- Arquitectura preparada para streaming en origen (chunks de 80, 160, 560 y 1120 ms), aunque no expuesta en transcribe.cpp.
- Ejecución en CPU y en GPU con backend Metal (Apple Silicon) y Vulkan.
- Cuantizaciones ligeras que permiten despliegue en hardware de gama baja.
- No soporta traducción, detección de idioma ni otros idiomas distintos del inglés.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo procesa ficheros WAV de 16 kHz en modo offline y genera texto con puntuación y capitalización, adecuado para actas automáticas y resúmenes posteriores. Su WER de 2,31 % en LibriSpeech test-clean lo hace fiable para audio limpio de micrófono.
- Subtitulado y generación de transcripciones con marcas temporales: los timestamps a nivel de token permiten alinear el texto con el audio para generar subtítulos o índices navegables en vídeos y pódcasts.
- Integración en aplicaciones de escritorio y utilidades locales: con cuantización Q4_K_M (453 MB) y ejecución en CPU, cabe en portátiles sin GPU dedicada, lo que facilita asistentes de dictado offline y herramientas de accesibilidad.
- Procesamiento por lotes de archivos de audio: el throughput medido (RTF 154,5 en Metal sobre M4 Max y 32 en CPU sobre el mismo equipo) permite transcribir grandes volúmenes de grabaciones en pipelines automatizados.
- Análisis de llamadas de atención al cliente: la transcripción con puntuación y timestamps facilita la extracción de métricas, búsqueda de palabras clave y auditoría de conversaciones en inglés.
- Investigación y evaluación de ASR: al estar validado contra la referencia NeMo, sirve como banco de pruebas reproducible para comparar cuantizaciones GGUF y medir el impacto en WER.
- Despliegue en dispositivos con recursos limitados: las variantes Q6_K (573 MB) y Q5_K_M (514 MB) mantienen WER por debajo del 2,35 % y permiten ejecución en Raspberry Pi o mini-PC con backend Vulkan o CPU.

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean completo (2620 enunciados), decodificación greedy RNN-T, modo offline:

| Cuantizacion | Tamano | WER (%) |
|---|---:|---:|
| F32 | 2,30 GB | 2,31 |
| F16 | 1,16 GB | 2,31 |
| Q8_0 | 696 MB | 2,31 |
| Q6_K | 573 MB | 2,29 |
| Q5_K_M | 514 MB | 2,34 |
| Q4_K_M | 453 MB | 2,38 |

Referencia: NVIDIA reporta 2,32 % en el mismo split con `att_context_size=[70, 13]` (chunk de 1,12 s, sin puntuación ni capitalización). La baseline F32 de esta conversión es 2,31 %.

Rendimiento (RTF, factor de tiempo real; mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 154,5 |
| Apple M4 Max | CPU | 32 |
| AMD Ryzen 4750U | Vulkan | 13 |
| AMD Ryzen 4750U | CPU | 7,5 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, al tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 2,5 GB con F32, 1,3 GB con F16, 0,8 GB con Q8_0 y 0,5 GB con Q4_K_M, incluyendo overhead del runtime.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon, incluido M4 Max) o Vulkan (AMD, Intel, NVIDIA). No requiere GPU de datacenter.
- Cabe en GPU de consumo: sí, incluso en iGPU y en CPU. La variante Q4_K_M (453 MB) es la más adecuada para dispositivos con poca memoria.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al ser un modelo ASR con formato específico.
- Latencia y throughput: RTF de 154,5 en Metal sobre M4 Max y de 32 en CPU sobre el mismo equipo; 13 en Vulkan y 7,5 en CPU sobre Ryzen 4750U. A mayor RTF, menor latencia relativa.
- Requisito de entrada: audio WAV mono a 16 kHz; conversión previa con ffmpeg (`-ar 16000 -ac 1`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/chunk | WER LibriSpeech test-clean | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| nemotron-speech-streaming-en-0.6b (GGUF, esta ficha) | 618 M | chunk 1,12 s (configurable 80-1120 ms) | 2,31 % (F32) | NVIDIA Open Model License | HuggingFace (GGUF) |
| nvidia/nemotron-speech-streaming-en-0.6b (original) | 600 M | chunk 1,12 s (configurable) | 2,32 % (reportado NVIDIA) | NVIDIA Open Model License | HuggingFace (NeMo) |
| Whisper large-v3 | 1550 M | 30 s | no disponible en esta informacion | MIT | HuggingFace, múltiples runtimes |
| Whisper small | 244 M | 30 s | no disponible en esta informacion | MIT | HuggingFace, múltiples runtimes |

La comparación con Whisper se ofrece solo como referencia de categoría; no se dispone en la información proporcionada de cifras de WER comparables para esos modelos en el mismo split y condiciones.

## Limitaciones y advertencias

- Solo soporta inglés; no traduce ni detecta idioma.
- El modo streaming no está expuesto en transcribe.cpp: la conversión funciona en modo offline pese a que el encoder sea cache-aware.
- El WER se ha medido sobre LibriSpeech test-clean, audio limpio de lectura; el rendimiento en audio con ruido, acentos marcados o solapamientos no está documentado.
- Riesgo de alucinación y errores en nombres propios, siglas y términos técnicos, habitual en modelos ASR de este tamaño.
- Posibles sesgos derivados de los corpus de entrenamiento de NVIDIA, no detallados en la información disponible.
- Licencia NVIDIA Open Model License: es necesario revisar los términos completos del modelo base antes de uso comercial; no es una licencia permisiva tipo MIT o Apache.
- La conversión GGUF la mantiene un tercero (tryambientai) y se basa en un commit fijado del modelo upstream; futuras actualizaciones de NVIDIA no se reflejarán automáticamente.
- Requiere audio WAV mono a 16 kHz; otros formatos o frecuencias deben convertirse previamente.
- No se documentan garantías de soporte ni mantenimiento por parte del autor de la conversión.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/tryambientai/nemotron-speech-streaming-en-0.6b-gguf
- Modelo base en HuggingFace: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Commit del modelo base utilizado: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b/commit/ef3bf40
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/12f1076
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/nemotron-speech-streaming-en-0.6b.md
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Paper de referencia (arXiv:2312.17279): https://arxiv.org/abs/2312.17279
- Paper de referencia (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
