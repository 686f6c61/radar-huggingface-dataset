# xix3r/voxix-canary-qwen-2.5b-gguf

## Resumen

Voxix Canary Qwen 2.5B GGUF es una conversión al formato GGUF del modelo `nvidia/canary-qwen-2.5b`, publicada por el usuario xix3r para su uso con la librería transcribe.cpp. El modelo original de NVIDIA es un sistema de reconocimiento automático del habla (ASR) en inglés que combina un codificador de audio FastConformer con un modelo de lenguaje causal Qwen3-1.7B mediante la arquitectura SALM (Speech-Augmented Language Model). El resultado son 2.533.757.456 parámetros totales que producen transcripciones con puntuación y mayúsculas a partir de audio WAV mono a 16 kHz.

La relevancia de esta conversión radica en que empaqueta el modelo en cuantizaciones GGUF de entre 1,74 GB (Q4_K_M) y 5,08 GB (BF16), lo que permite ejecutar un ASR de calidad estado del arte en hardware de consumo y en CPU, sin necesidad de GPU dedicada. Las pruebas reportadas mantienen un WER de 1,63 % en LibriSpeech test-clean en las seis cuantizaciones publicadas, lo que indica que la pérdida de precisión por cuantización es despreciable en esta tarea.

El modelo está pensado exclusivamente para inglés, funciona en modo offline, no soporta streaming ni detección de idioma, y no genera timestamps. Es una opción adecuada para pipelines de transcripción por lotes o para aplicaciones de escritorio que requieran privacidad y funcionamiento sin conexión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SALM (Speech-Augmented Language Model): FastConformer (32 capas, d_model=1024) + Qwen3-1.7B (28 capas, hidden_size=2048) |
| Parametros totales | 2.533.757.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (librería transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SALM de NVIDIA NeMo: un codificador de audio FastConformer de 32 capas con dimensión de modelo 1024 extrae representaciones del audio, que se inyectan como tokens en una posición centinela del prompt de un modelo de lenguaje causal Qwen3-1.7B de 28 capas y dimensión oculta 2048. La decodificación es greedy y el modelo opera en modo ASR puro, sin retener capacidades de razonamiento del LLM subyacente durante la transcripción.

La conversión a GGUF se realizó a partir del commit `b1469e1` del modelo original de NVIDIA, fijado el 2026-05-15, y se validó contra la referencia NeMo SALM 2.7.3 en el commit `6f6c699` de transcribe.cpp el 2026-05-16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en la información proporcionada.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación y mayúsculas (PnC).
- Entrada de audio WAV mono a 16 kHz; se requiere conversión previa con ffmpeg para otros formatos.
- Decodificación greedy offline, sin necesidad de conexión a red.
- Modo LLM en el modelo original (post-procesado del transcript, resumen o preguntas sobre el texto), aunque en modo LLM no procesa audio directamente.
- No soporta streaming.
- No soporta traducción.
- No realiza detección de idioma.
- No genera timestamps.
- No soporta tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso en modo ASR.

## Casos de uso

- Transcripción por lotes de reuniones y entrevistas: el modelo procesa archivos WAV a 16 kHz y genera transcripciones con puntuación, adecuado para pipelines offline donde la privacidad impide enviar audio a servicios en la nube.
- Subtitulado de contenido audiovisual en inglés: la salida con mayúsculas y puntuación reduce el post-procesado necesario antes de publicar subtítulos, aunque requiere un paso adicional para alinear timestamps.
- Notas de voz en aplicaciones de escritorio: con la cuantización Q4_K_M (1,74 GB) el modelo cabe en equipos de consumo y puede ejecutarse en CPU, lo que permite integrarlo en herramientas locales de dictado.
- Archivado y búsqueda de grabaciones: transcripción de grandes volúmenes de audio histórico para indexación textual, aprovechando el rendimiento en CPU (RTF 2,51 en Ryzen 4750U) y la aceleración Vulkan (RTF 3,98).
- Accesibilidad para personas con dificultades auditivas: generación de transcripciones en tiempo no real de contenido pregrabado, con calidad medida de 1,63 % WER en LibriSpeech test-clean.
- Investigación en ASR: base cuantizada para experimentos de evaluación y comparación de pipelines, con resultados reproducibles mediante los scripts `scripts/wer/run.py` y `scripts/wer/score.py` del repositorio transcribe.cpp.
- Procesamiento en dispositivos Apple Silicon: con Metal se alcanza un RTF de 42,43 en M4 Max, lo que permite transcripciones rápidas en portátiles sin GPU dedicada.

## Benchmarks y rendimiento

| Benchmark | BF16 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,63 | 1,63 | 1,63 | 1,63 | 1,63 | 1,63 |
| WER FLEURS en (%) | no disponible | no disponible | 3,58 | no disponible | no disponible | no disponible |

| Plataforma | RTF CPU | RTF acelerado |
|---|---:|---:|
| Apple M4 Max | 10,03 | 42,43 (Metal) |
| AMD Ryzen 4750U | 2,51 | 3,98 (Vulkan) |

La referencia NeMo SALM en la misma máquina (CPU torch, dither=0.0, greedy) obtiene 1,61 % con intervalo de confianza bootstrap del 95 % [1,47 %, 1,75 %], frente al 1,60 % publicado por NVIDIA. Las seis cuantizaciones GGUF quedan en 1,63 %, dentro del ruido estadístico.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 1,74 GB (Q4_K_M), 1,98 GB (Q5_K_M), 2,21 GB (Q6_K), 2,80 GB (Q8_0), 5,08 GB (BF16/F16).
- GPU recomendadas: no se especifican modelos concretos en la información disponible; se reportan pruebas en Apple M4 Max con Metal y en AMD Ryzen 4750U con Vulkan.
- Cabe en GPU de consumo: sí, las cuantizaciones Q4_K_M a Q8_0 caben en cualquier GPU con 3 GB o más de VRAM; incluso puede ejecutarse en CPU.
- Opciones de despliegue: transcribe.cpp (compilación con CMake y binario `transcribe-cli`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF 42,43 con Metal en M4 Max, RTF 3,98 con Vulkan en Ryzen 4750U, RTF 2,51 en CPU Ryzen 4750U y RTF 10,03 en CPU M4 Max.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---|---|---|---|
| Voxix Canary Qwen 2.5B GGUF | 2,53 B | no disponible | 1,63 % | CC-BY-4.0 | GGUF |
| nvidia/canary-qwen-2.5b (original) | 2,5 B | no disponible | 1,60 % (publicado) | CC-BY-4.0 | NeMo |
| Referencia NeMo SALM 2.7.3 (misma máquina) | 2,5 B | no disponible | 1,61 % | CC-BY-4.0 | NeMo |

No se dispone de datos de otros modelos ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo admite inglés; no procesa otros idiomas.
- No soporta streaming, por lo que no es adecuado para transcripción en tiempo real.
- No genera timestamps, lo que limita su uso en subtitulado que requiera alineación temporal.
- No realiza detección de idioma ni traducción.
- El audio debe ser WAV mono a 16 kHz; es necesario convertirlo previamente con ffmpeg.
- En modo ASR no retiene capacidades de razonamiento del LLM subyacente.
- Riesgo de errores en homófonos, límites de palabra y palabras funcionales, según el análisis de diferencias por utterance del autor.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario conservar el aviso de licencia y el NOTICE del repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria adicional.
- La fecha de creación (2026-11-13) es posterior a la de validación reportada (2026-05-16), lo que conviene verificar antes de usar en producción.

## Enlaces

- Hugging Face: https://huggingface.co/xix3r/voxix-canary-qwen-2.5b-gguf
- Modelo base: https://huggingface.co/nvidia/canary-qwen-2.5b
- Commit del modelo base: https://huggingface.co/nvidia/canary-qwen-2.5b/commit/b1469e1
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/6f6c699
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/canary-qwen-2.5b.md
- Licencia: https://huggingface.co/handy-computer/canary-qwen-2.5b-gguf/blob/main/LICENSE
- NOTICE: https://huggingface.co/handy-computer/canary-qwen-2.5b-gguf/blob/main/NOTICE
- Paper SALM (arXiv:2503.05931): https://arxiv.org/abs/2503.05931
- Paper FastConformer (arXiv:2310.09424): https://arxiv.org/abs/2310.09424
- Paper attention (arXiv:1706.03762): https://arxiv.org/abs/1706.03762
- Paper adicional (arXiv:2505.13404): https://arxiv.org/abs/2505.13404
- Paper adicional (arXiv:2104.02821): https://arxiv.org/abs/2104.02821
