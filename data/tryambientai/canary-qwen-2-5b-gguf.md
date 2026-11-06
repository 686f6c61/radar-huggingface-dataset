# tryambientai/canary-qwen-2.5b-gguf

## Resumen

Canary-Qwen-2.5B es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por NVIDIA, publicado originalmente como `nvidia/canary-qwen-2.5b`. La versión aquí descrita es una conversión a formato GGUF realizada por el usuario `tryambientai`, pensada para su uso con el motor de inferencia `transcribe.cpp`. El modelo resuelve la transcripción de audio a texto con puntuación y capitalización (PnC) en inglés, y combina un codificador de audio con un modelo de lenguaje para lograrlo.

La arquitectura es de tipo SALM (Speech-Augmented Language Model): un codificador FastConformer de 32 capas con `d_model=1024` procesa el audio y proyecta sus embeddings en el espacio de un modelo causal Qwen3-1.7B de 28 capas con `hidden_size=2048`, mediante inyección de tokens de audio en una posición centinela del prompt. El modelo total suma 2.533.757.456 parámetros y opera sobre audio WAV mono a 16 kHz, produciendo la transcripción mediante decodificación voraz (greedy).

La relevancia de esta conversión GGUF radica en que permite ejecutar un modelo ASR de 2,5B en hardware de consumo, con cuantizaciones que van desde BF16/F16 (4,73 GB) hasta Q4_K_M (1,62 GB), manteniendo un WER idéntico de 1,63 % en LibriSpeech test-clean en las seis variantes probadas. Es una opción práctica para transcripción offline en inglés sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SALM (Speech-Augmented Language Model): FastConformer (32 capas, d_model=1024) + Qwen3-1.7B (28 capas, hidden_size=2048) |
| Parametros totales | 2.533.757.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SALM descrita por NVIDIA: un codificador FastConformer de 32 capas y dimensión de modelo 1024 procesa la señal de audio y genera embeddings que se inyectan como tokens de audio en una posición centinela del prompt de un modelo de lenguaje causal Qwen3-1.7B (28 capas, hidden_size=2048). La inferencia se realiza con decodificación voraz sobre audio de entrada WAV mono a 16 kHz.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni sobre si se aplicaron etapas de RLHF o DPO. La model card original de NVIDIA menciona que el modelo alcanza 418 RTFx y que soporta dos modos: modo ASR (solo transcripción, sin retener capacidades de razonamiento del LLM) y modo LLM (conserva las capacidades del LLM para tareas de posprocesamiento del texto, como resumir o responder preguntas sobre la transcripción, pero sin acceso al audio crudo). La conversión GGUF fue portada desde el commit `b1469e1bba1cfe140205529c79c434ca47180960` del modelo base y validada contra la referencia NeMo SALM 2.7.3.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación y capitalización (PnC).
- Entrada de audio: WAV mono a 16 kHz (se requiere conversión previa con ffmpeg para otros formatos).
- Decodificación voraz (greedy) para la generación de la transcripción.
- Modo ASR: transcripción pura sin capacidades de razonamiento del LLM subyacente.
- Modo LLM (según la model card original de NVIDIA): posprocesamiento del texto transcrito, como resumen o respuesta a preguntas sobre la transcripción, sin acceso al audio.
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No soporta detección de idioma (`lang_detect: false`).
- No genera marcas de tiempo (`timestamps: none`).
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Transcripción offline de reuniones en inglés: el modelo procesa ficheros WAV mono a 16 kHz y genera actas con puntuación y capitalización, ejecutable en local sin conexión a servicios externos gracias a las cuantizaciones de 1,62 GB a 4,73 GB.
- Subtitulado de contenido audiovisual en inglés: conversión previa del audio con `ffmpeg -ar 16000 -ac 1` y transcripción por lotes con `transcribe-cli`, adecuado para archivos de vídeo o podcast donde no se requieren marcas de tiempo.
- Dictado y notas de voz: integración en aplicaciones de escritorio o móvil que necesiten convertir notas de voz en inglés a texto, aprovechando el bajo requisito de memoria de las variantes Q4_K_M y Q5_K_M.
- Archivado y búsqueda de grabaciones: transcripción masiva de archivos de audio históricos en inglés para indexación y búsqueda textual, con throughput medido de 39,8 RTF en Metal (Apple M4) y 4,1 RTF en Vulkan (Ryzen 4750U).
- Posprocesamiento de transcripciones en modo LLM: uso del modelo base en modo LLM para resumir o responder preguntas sobre el texto ya transcrito, según la model card original de NVIDIA.
- Prototipado e investigación en ASR: validación de pipelines de reconocimiento de voz con una referencia de WER de 1,63 % en LibriSpeech test-clean, útil para comparar implementaciones o cuantizaciones.
- Despliegue en hardware de consumo: ejecución en equipos sin GPU dedicada mediante el backend CPU de transcribe.cpp (7,3 RTF en Apple M4, 2,1 RTF en Ryzen 4750U).

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| LibriSpeech test-clean (2620 utterances) | WER BF16 | 1,63 % |
| LibriSpeech test-clean | WER F16 | 1,63 % |
| LibriSpeech test-clean | WER Q8_0 | 1,63 % |
| LibriSpeech test-clean | WER Q6_K | 1,63 % |
| LibriSpeech test-clean | WER Q5_K_M | 1,63 % |
| LibriSpeech test-clean | WER Q4_K_M | 1,63 % |
| Referencia NeMo SALM (misma máquina) | WER | 1,61 % (IC 95 %: 1,47 %–1,75 %) |
| Referencia NVIDIA publicada | WER | 1,60 % |
| Rendimiento Apple M4 Max | RTF Metal | 39,8 |
| Rendimiento Apple M4 Max | RTF CPU | 7,3 |
| Rendimiento Ryzen 4750U | RTF Vulkan | 4,1 |
| Rendimiento Ryzen 4750U | RTF CPU | 2,1 |
| Throughput modelo base (NVIDIA) | RTFx | 418 |

El WER se midió con el normalizador de texto inglés estilo Whisper y jiwer 3.x sobre el split completo de LibriSpeech test-clean. Las seis cuantizaciones GGUF presentan exactamente el mismo WER (1,63 %), lo que indica que la cuantización no degrada la precisión en esta métrica. Las diferencias por utterance se atribuyen a ruido a nivel de token consistente con la precisión de pesos BF16 (homófonos, cambios en límites de palabra, sustituciones de palabras funcionales).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB (Q4_K_M), 1,85 GB (Q5_K_M), 2,06 GB (Q6_K), 2,61 GB (Q8_0) y 4,73 GB (BF16/F16), según el tamaño de los ficheros GGUF.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; los datos de rendimiento se han medido en Apple M4 Max (backend Metal) y en CPU Ryzen 4750U (backend Vulkan y CPU).
- Cabe en GPU de consumo: sí, las cuantizaciones Q4_K_M a Q8_0 caben en GPUs con 4 GB o más de VRAM; las variantes BF16/F16 requieren al menos 6 GB.
- Opciones de despliegue: `transcribe.cpp` (compilación desde fuente con CMake y ejecución mediante `transcribe-cli`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 39,8 (Metal, Apple M4 Max), 7,3 (CPU, Apple M4 Max), 4,1 (Vulkan, Ryzen 4750U) y 2,1 (CPU, Ryzen 4750U). El modelo base reporta 418 RTFx según NVIDIA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---|---|---|---|
| canary-qwen-2.5b (GGUF, esta ficha) | 2,53B | no disponible | 1,63 % | CC-BY-4.0 | GGUF |
| nvidia/canary-qwen-2.5b (original) | 2,5B | no disponible | 1,60 % (publicado) | CC-BY-4.0 | NeMo |
| Referencia NeMo SALM (misma máquina) | 2,5B | no disponible | 1,61 % | CC-BY-4.0 | NeMo |

No se dispone en la información proporcionada de datos de otros modelos ASR comparables (por ejemplo, Whisper u otros) para ampliar la comparativa.

## Limitaciones y advertencias

- Solo soporta inglés (`language: en`); no admite otros idiomas.
- No soporta streaming, traducción, detección de idioma ni generación de marcas de tiempo.
- Requiere audio de entrada en WAV mono a 16 kHz; es necesaria conversión previa con ffmpeg para otros formatos o frecuencias.
- En modo ASR no retiene capacidades de razonamiento del LLM subyacente; en modo LLM no procesa audio crudo, solo el texto transcrito.
- Riesgo de alucinación y errores de transcripción: la model card documenta ruido a nivel de token (homófonos, cambios en límites de palabra, sustituciones de palabras funcionales) atribuido a la precisión de pesos BF16.
- No se documentan sesgos conocidos en la información disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario revisar los términos completos en la model card del modelo base.
- La model card de esta conversión GGUF no es la fuente autoritativa; el modelo base de NVIDIA lo es.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-01, por lo que su adopción y validación comunitaria son nulas.
- La conversión fue validada contra una versión concreta de transcribe.cpp (commit `6f6c699`) y NeMo SALM 2.7.3; otras versiones pueden presentar diferencias.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/tryambientai/canary-qwen-2.5b-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/canary-qwen-2.5b
- Commit del modelo base usado para el port: https://huggingface.co/nvidia/canary-qwen-2.5b/commit/b1469e1bba1cfe140205529c79c434ca47180960
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/6f6c699
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/canary-qwen-2.5b.md
- Licencia CC-BY-4.0: https://choosealicense.com/licenses/cc-by-4.0/
- Paper Attention Is All You Need (referenciado en tags): https://arxiv.org/abs/1706.03762
- Paper referenciado en tags arXiv:2503.05931: https://arxiv.org/abs/2503.05931
- Paper referenciado en tags arXiv:2505.13404: https://arxiv.org/abs/2505.13404
- Paper referenciado en tags arXiv:2310.09424: https://arxiv.org/abs/2310.09424
- Paper referenciado en tags arXiv:2104.02821: https://arxiv.org/abs/2104.02821
