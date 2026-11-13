# xix3r/voxix-parakeet-rnnt-1.1b-gguf

## Resumen

Voxix Parakeet RNNT 1.1B GGUF es una conversión al formato GGUF del modelo de reconocimiento automático del habla `nvidia/parakeet-rnnt-1.1b`, publicada por el usuario `xix3r` para su uso con el runtime [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp). El modelo original es un FastConformer Transducer (variante XXL, alrededor de 1.100 millones de parámetros) desarrollado conjuntamente por los equipos de NVIDIA NeMo y Suno.ai, y esta conversión concreta está portada desde el commit `a07b19e` del repositorio upstream y validada contra la implementación de referencia NeMo.

La relevancia de esta ficha reside en que traslada un modelo ASR de gama alta a un formato ligero e independiente de framework (GGUF) que puede ejecutarse en CPU, GPU y aceleradores Apple Silicon mediante transcribe.cpp, sin necesidad de instalar el stack completo de NeMo. Se trata de un modelo exclusivamente de inglés, offline (no streaming), que transcribe voz a texto en minúsculas y sin puntuación, con un WER de referencia de 1,45 % en LibriSpeech test-clean.

El repositorio ocupa 0,9 GB e incluye varias cuantizaciones (desde F32 de 4,28 GB hasta Q4_K_M de 825 MB), lo que permite desplegarlo en hardware muy modesto manteniendo una precisión prácticamente idéntica a la del modelo en coma flotante. No es un modelo generativo: su única tarea es la transcripción de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-XL encoder con decodificador RNN-T (transducer), greedy decoding |
| Parametros totales | 1.070.513.665 (1,07 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo offline, no streaming; no se especifica ventana de audio máxima) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |
| Entrada | audio WAV mono a 16 kHz |
| Salida | texto en minúsculas, sin puntuación |
| Streaming | no |
| Traduccion | no |
| Deteccion de idioma | no |
| Timestamps | a nivel de token |
| Tamano del repo | 0,9 GB |

## Arquitectura y entrenamiento

El modelo base es un FastConformer Transducer en configuración XL: un encoder Convolucional-Atención (Conformer con mejoras de eficiencia propias de FastConformer) que procesa el audio, combinado con un decodificador RNN-T (Recurrent Neural Network Transducer) que genera la secuencia de tokens de forma autorregresiva con decodificación greedy. El decoder RNN-T es el responsable de la alineación entre frames de audio y tokens de texto, y la decodificación greedy implica que no se usa un modelo de lenguaje externo durante la inferencia.

La model card de esta conversión no aporta detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF/DPO (no tendría sentido en un modelo ASR). La información disponible se limita a la arquitectura, al número de parámetros y a la procedencia (NVIDIA NeMo y Suno.ai). La innovación técnica destacable en esta publicación no está en el modelo en sí, sino en la conversión a GGUF y su validación numérica contra la referencia NeMo en el commit `42528dd` de transcribe.cpp, lo que garantiza que la cuantización no degrada la calidad de transcripción de forma apreciable.

## Capacidades

- Transcripción de voz a texto en inglés, offline, sobre audio WAV mono a 16 kHz.
- Decodificación RNN-T greedy sin modelo de lenguaje externo.
- Salida en minúsculas y sin puntuación.
- Timestamps a nivel de token (marcas temporales por token).
- Ejecución en CPU, GPU (Vulkan/Metal) y Apple Silicon mediante transcribe.cpp.
- No soporta streaming: requiere el audio completo de antemano.
- No traduce: transcribe únicamente en el idioma de entrada (inglés).
- No realiza detección de idioma.
- No dispone de tool calling, function calling ni capacidades de agente.
- No tiene capacidades multimodales más allá del audio (sin visión, sin audio generativo).

## Casos de uso

- Transcripción de reuniones y entrevistas: al ser un modelo offline, se le pasa el archivo de audio completo (previamente convertido a WAV mono 16 kHz con ffmpeg) y devuelve la transcripción con timestamps por token, útil para generar subtítulos o actas.
- Generación de subtítulos para vídeo: los timestamps a nivel de token permiten alinear el texto con el audio en pipelines de postproducción, con un WER de referencia de 1,45 % en LibriSpeech test-clean.
- Dictado y notas de voz: integrado en una aplicación de escritorio o móvil mediante transcribe.cpp, transcribe grabaciones de voz de forma local sin depender de servicios en la nube.
- Indexación y búsqueda de archivos de audio: transcribir grandes volúmenes de grabaciones para hacerlas buscables, aprovechando que la cuantización Q4_K_M ocupa solo 825 MB y puede correr en CPU.
- Transcripción en entornos con recursos limitados: la versión Q4_K_M (825 MB) permite desplegar ASR de alta calidad en dispositivos de borde o portátiles sin GPU dedicada, con un RTF de 17,5 en CPU en un Apple M4 Max y 5,5 en un Ryzen 4750U.
- Automatización de accesibilidad: generar transcripciones de contenido en inglés para cumplir requisitos de accesibilidad, con la ventaja de que la licencia CC-BY-4.0 permite uso comercial con atribución.
- Procesamiento por lotes en servidores: usar la versión F16 o Q8_0 con aceleración Vulkan/Metal para throughput alto en pipelines de transcripción masiva.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,45 | 1,45 | 1,46 | 1,43 | 1,43 | 1,41 |
| Tamano (GB) | 4,28 | 2,15 | 1,27 | 1,04 | 0,936 | 0,825 |

WER medido sobre el split completo LibriSpeech test-clean (2620 utterances) con decodificación RNN-T greedy y sin LM externo. El baseline F32 de referencia es 1,45 %; el dato autodeclarado por NVIDIA sobre el mismo split es 1,46 %.

Rendimiento (RTF, real-time factor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 125,5 |
| Apple M4 Max | CPU | 17,5 |
| AMD Ryzen 4750U | Vulkan | 11 |
| AMD Ryzen 4750U | CPU | 5,5 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo ASR y no de un modelo generativo de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: entre aproximadamente 1 GB (Q4_K_M) y 4,5 GB (F32) para los pesos; el consumo real depende del backend y del búfer de audio.
- GPU recomendadas: cualquier GPU con soporte Vulkan o Metal; en Apple Silicon se obtiene un RTF de 125,5 en un M4 Max con Metal.
- Cabe en GPU de consumo: sí, prácticamente cualquier GPU moderna; las cuantizaciones Q4_K_M y Q5_K_M caben incluso en GPUs integradas.
- Ejecución en CPU: viable; RTF de 17,5 en CPU de Apple M4 Max y 5,5 en CPU de Ryzen 4750U.
- Opciones de despliegue: transcribe.cpp (runtime oficial para estos GGUF), compilado desde fuente con CMake. No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: expresados como RTF en la tabla anterior; un RTF de 17,5 implica transcribir 17,5 segundos de audio por cada segundo de cómputo en ese hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---:|---:|---|---|
| Voxix Parakeet RNNT 1.1B GGUF (este) | 1,07 B | en | 1,41-1,46 % | CC-BY-4.0 | GGUF |
| nvidia/parakeet-rnnt-1.1b (original) | 1,1 B | en | 1,46 % (autodeclarado) | CC-BY-4.0 | NeMo (.nemo) |
| Whisper large-v3 | no disponible en la información | multilingüe | no disponible en la información | MIT (según conocimiento general, no verificado aquí) | safetensors, GGUF, etc. |

La comparación con Whisper large-v3 no puede completarse con los datos proporcionados: no se dispone de sus parámetros, WER ni contexto en la información de esta ficha. La diferencia principal frente al modelo original de NVIDIA es el formato (GGUF frente a .nemo) y el runtime (transcribe.cpp frente a NeMo), con una precisión prácticamente idéntica.

## Limitaciones y advertencias

- Solo inglés: no transcribe otros idiomas ni detecta el idioma de entrada.
- No es streaming: requiere el audio completo antes de empezar a transcribir; no apto para reconocimiento en tiempo real continuo.
- Salida sin puntuación y en minúsculas: no genera mayúsculas ni signos de puntuación, lo que puede requerir postprocesado.
- No traduce: la transcripción se limita al idioma de entrada.
- Riesgo de alucinación y errores en audio ruidoso, con acentos marcados o con solapamiento de hablantes; el WER de 1,45 % corresponde a LibriSpeech test-clean, un conjunto relativamente limpio, y empeorará en condiciones reales.
- Sesgos: no se documentan sesgos específicos en la información disponible; al ser un modelo entrenado principalmente con datos en inglés, puede rendir peor con variedades dialectales no representadas.
- Licencia CC-BY-4.0: permite uso comercial, incluida la redistribución, siempre que se atribuya la autoría; conviene revisar los términos completos en la model card upstream.
- Conversión de terceros: esta publicación no es oficial de NVIDIA; está portada y validada por un usuario independiente, por lo que la estabilidad y el mantenimiento dependen de transcribe.cpp y del autor de la conversión.
- Timestamps a nivel de token: no se garantiza una alineación a nivel de palabra o de segmento sin postprocesado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xix3r/voxix-parakeet-rnnt-1.1b-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-rnnt-1.1b
- Commit del modelo base usado: https://huggingface.co/nvidia/parakeet-rnnt-1.1b/commit/a07b19e
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-rnnt-1.1b.md
- Repositorio GGUF de referencia (handy-computer): https://huggingface.co/handy-computer/parakeet-rnnt-1.1b-gguf
- Paper FastConformer Transducer: https://arxiv.org/abs/2305.05084
- Documentación NeMo ASR: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- NVIDIA Developer Portal: https://developer.nvidia.com
- Suno.ai: https://www.suno.ai/
