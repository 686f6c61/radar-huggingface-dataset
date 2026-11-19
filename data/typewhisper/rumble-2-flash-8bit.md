# TypeWhisper/Rumble-2-Flash-8bit

## Resumen

Rumble-2-Flash-8bit es una conversión cuantizada a 8 bits del modelo de reconocimiento automático del habla (ASR) Reson8/Rumble-2-Flash, publicada por TypeWhisper para su ejecución en Apple Silicon mediante la librería mlx-audio. El modelo original, desarrollado por Reson8, emplea la arquitectura Qwen3-ASR con un decodificador de texto de 14 capas y un vocabulario de 99.630 tokens, y suma 508.631.552 parámetros totales. Esta variante mantiene el codificador de audio y el proyector en BF16 y cuantiza únicamente el decodificador de texto a 8 bits (afín, tamaño de grupo 64), lo que reduce los pesos a 692 MB.

La relevancia de esta ficha radica en que ofrece transcripción multilingüe (28 idiomas declarados) con un coste computacional muy bajo y un factor de tiempo real de 0,013 en un Mac mini, además de una tasa de error de palabra del 6,3 % en el benchmark propio de TypeWhisper, frente al 10,2 % de Qwen3-ASR 0.6B 8-bit en el mismo conjunto de pruebas. Es, por tanto, una opción práctica para transcripción local en equipos Apple sin GPU dedicada.

El modelo se distribuye bajo licencia Apache 2.0, heredada del checkpoint original de Reson8, y está pensado para integrarse en aplicaciones de dictado, subtitulado y procesamiento de audio en tiempo real sobre macOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (codificador de audio + proyector + decodificador de texto transformer de 14 capas) |
| Parametros totales | 508.631.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín con tamaño de grupo 64 en el decodificador de texto; codificador de audio y proyector en BF16 |
| Idiomas soportados | en, de, fr, es, it, pt, nl, ru, zh, ja, ko, ar, hi, tr, pl, sv, da, fi, cs, el, ro, hu, id, vi, th, ms, fa, mk |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |
| Vocabulario | 99.630 tokens |
| Tamano del repositorio | 0,7 GB (pesos: 692 MB) |
| Libreria | mlx-audio 0.6.3 |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-ASR: un codificador de audio que procesa la señal acústica, un proyector multimodal que la alinea con el espacio del decodificador y un decodificador de texto de 14 capas con vocabulario de 99.630 tokens. En esta conversión, el decodificador se cuantiza a 8 bits con cuantización afín y grupo de 64, mientras que el codificador y el proyector permanecen en BF16. La conversión se realizó desde el checkpoint BF16 en la revisión `a0c34287229103b706c670d70791683e34379732` con el script `convert-rumble-2-flash.py` y mlx-audio 0.6.3, remapeando los nombres de pesos de transformers 5 al layout original de Qwen3-ASR que carga mlx-audio, moviendo los kernels de convolución al orden channel-last de MLX e incorporando `text_config.rope_theta` en `config.json`. Se copiaron sin cambios el tokenizer, la plantilla de chat y los ficheros de procesador, y se omitió la cabeza CTC opcional del repositorio original.

El modelo original fue entrenado con tres tokens de control al inicio del system prompt; su plantilla de chat usa por defecto `<digits><nofiller><verbatim>`, que fuerza números en dígitos, elimina muletillas y conserva palabras repetidas. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en 28 idiomas.
- Detección automática del idioma si no se especifica el parámetro `language`.
- Control de estilo de transcripción mediante tokens de control en el system prompt: `<digits>` (números como dígitos), `<nofiller>` (sin muletillas) y `<verbatim>` (conserva repeticiones).
- Especificación explícita del idioma de entrada para mejorar la precisión.
- Ejecución local en Apple Silicon mediante MLX.
- No se documenta soporte de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Dictado por voz en macOS: el modelo transcribe audio en local con un factor de tiempo real de 0,013, lo que permite integrarlo en aplicaciones de escritura por voz sin latencia perceptible y sin enviar datos a la nube.
- Subtitulado automático de vídeos multilingües: con 28 idiomas declarados y detección automática de lengua, puede generar subtítulos para contenido en inglés, alemán, francés, español, ruso, chino, japonés y otros.
- Actas y notas de reuniones: la plantilla `<nofiller><verbatim>` reduce muletillas y conserva el contenido literal, útil para transcripciones fieles de conversaciones largas.
- Procesamiento por lotes de archivos de audio: al ejecutarse en mlx-audio sobre Mac mini con un coste bajo, permite transcribir grandes volúmenes de grabaciones sin GPU dedicada.
- Accesibilidad: conversión de voz a texto para personas con discapacidad auditiva o para interfaces controladas por voz, con soporte de múltiples idiomas europeos y asiáticos.
- Investigación en ASR: al ser un checkpoint abierto Apache 2.0 y cuantizado, sirve como base para experimentos de evaluación y comparación de técnicas de cuantización en modelos de voz.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos con mlx-audio en un Mac mini sobre el benchmark de TypeWhisper (media sobre 22 suites en inglés, alemán, francés, español, italiano, portugués y ruso):

| Modelo | WER | Factor de tiempo real |
|---|---:|---:|
| Rumble-2-Flash 8-bit (este repositorio) | 6,3 % | 0,013 |
| Qwen3-ASR 0.6B 8-bit | 10,2 % | 0,035 |

El modelo convertido iguala a la API alojada de Reson8 en las 25 suites en las que se ejecutaron ambos.

## Requisitos de hardware

- VRAM/peso en memoria: 692 MB de pesos en 8 bits, lo que permite ejecución en equipos con memoria unificada modesta.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4 y superiores) mediante MLX; el benchmark se midió en un Mac mini.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon; no se documenta soporte para GPU NVIDIA o AMD en esta conversión.
- Opciones de despliegue: mlx-audio 0.6.3 (Python) y mlx-audio-swift (con la corrección indicada para el tokenizer); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: factor de tiempo real de 0,013, es decir, procesa aproximadamente 77 segundos de audio por segundo de cómputo en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER (benchmark TypeWhisper) | Factor de tiempo real | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Rumble-2-Flash-8bit | 508,6 M | 28 | 6,3 % | 0,013 | Apache 2.0 | safetensors MLX |
| Qwen3-ASR 0.6B 8-bit | no disponible | no disponible | 10,2 % | 0,035 | no disponible | no disponible |
| Reson8/Rumble-2-Flash (BF16 original) | no disponible | 28 | iguala a la API de Reson8 en 25 suites | no disponible | Apache 2.0 | safetensors |

No se dispone de datos de otros modelos ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- La generación no se detiene al final de la transcripción en mlx-audio-swift sin la corrección del tokenizer, ya que Rumble-2-Flash numera `<|im_end|>` y `<|endoftext|>` de forma distinta a Qwen3-ASR (99564 y 99562).
- Solo se documenta ejecución en Apple Silicon con MLX; no hay soporte verificado en CUDA ni en otros backends.
- No se dispone de información sobre sesgos, tasas de alucinación ni comportamiento en idiomas de bajos recursos más allá de los 28 declarados.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el fichero LICENSE del repositorio original de Reson8.
- El WER del 6,3 % corresponde a la media de 22 suites en siete idiomas; el rendimiento en el resto de idiomas declarados no está cuantificado en la información disponible.
- La cabeza CTC opcional del modelo original no está incluida en esta conversión.

## Enlaces

- Hugging Face: https://huggingface.co/TypeWhisper/Rumble-2-Flash-8bit
- Modelo base: https://huggingface.co/Reson8/Rumble-2-Flash
- Licencia: https://huggingface.co/Reson8/Rumble-2-Flash/blob/main/LICENSE
- Script de conversión: https://github.com/TypeWhisper/typewhisper-benchmark/blob/main/bench/scripts/convert-rumble-2-flash.py
- Benchmark TypeWhisper: https://github.com/TypeWhisper/typewhisper-benchmark
- Corrección de tokenizer para mlx-audio-swift: https://github.com/TypeWhisper/mlx-audio-swift/tree/seofood/qwen3-asr-tokenizer-eos-on-0.31
- TypeWhisper: https://www.typewhisper.com
