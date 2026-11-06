# tryambientai/parakeet-tdt-1.1b-gguf

## Resumen

parakeet-tdt-1.1b-gguf es una conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) nvidia/parakeet-tdt-1.1b, publicada por el usuario tryambientai para su uso con el motor de inferencia transcribe.cpp. El modelo original fue desarrollado conjuntamente por los equipos de NVIDIA NeMo y Suno.ai, y está diseñado para transcribir voz en inglés en minúsculas. Se trata de una variante XXL de la arquitectura FastConformer con decodificador TDT (Token-and-Duration Transducer) y aproximadamente 1.100 millones de parámetros.

La relevancia de esta ficha radica en que empaqueta un modelo ASR de alto rendimiento en cuantizaciones que van desde 825 MB (Q4_K_M) hasta 4,28 GB (F32), permitiendo su despliegue en hardware de consumo sin depender del ecosistema NeMo/PyTorch. La conversión mantiene una tasa de error de palabra (WER) muy baja en LibriSpeech test-clean: 1,38 % en Q8_0 y 1,42 % en Q4_K_M, frente al 1,39 % del modelo de referencia en F32.

El modelo es offline, no soporta streaming ni traducción, y genera marcas de tiempo a nivel de token. Su licencia CC-BY-4.0 permite uso comercial con atribución. Esta ficha evalúa la conversión GGUF y su viabilidad práctica en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-XL (encoder) + TDT/RNNT (decoder transducer) |
| Parametros totales | 1.070.516.870 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR offline; entrada de audio, no texto) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura FastConformer [1] como encoder, una variante de Conformer optimizada para reducir el coste computacional mediante subsampling de la secuencia de entrada, con un tamaño XXL de aproximadamente 1.100 millones de parámetros. El decoder es un transducer TDT (Token-and-Duration Transducer) [2], que predice conjuntamente tokens y duraciones, lo que permite un alineamiento más eficiente que el RNN-T clásico y habilita la generación de marcas de tiempo a nivel de token. La salida es texto en inglés en minúsculas.

Los detalles concretos sobre el volumen de datos de entrenamiento, la composición del dataset y el uso de RLHF o DPO no están disponibles en la información proporcionada. La model card original reproduce la documentación de NVIDIA NeMo, que remite a su documentación técnica para los detalles completos de arquitectura. La conversión GGUF fue portada desde el commit 53276c6 del modelo upstream (fijado el 2026-05-10) y validada numéricamente contra la referencia NeMo en el commit 42528dd de transcribe.cpp el 2026-05-10.

## Capacidades

- Transcripción de voz a texto en inglés (ASR offline) a partir de audio WAV mono a 16 kHz.
- Generación de marcas de tiempo a nivel de token (timestamps: token).
- Decodificación greedy con transducer TDT/RNN-T, sin modelo de lenguaje externo.
- Salida en alfabeto inglés en minúsculas.
- No soporta streaming (streaming: false).
- No soporta traducción (translate: false).
- No soporta detección de idioma (lang_detect: false).
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Transcripción por lotes de reuniones y entrevistas: el modelo procesa archivos WAV de 16 kHz mono y devuelve transcripciones con marcas de tiempo por token, lo que facilita la alineación con actas o subtítulos. Su WER de 1,39 % en LibriSpeech test-clean lo hace adecuado para documentación interna.
- Generación de subtítulos para vídeo: las marcas de tiempo a nivel de token permiten segmentar la transcripción y sincronizarla con pistas de vídeo, usando la cuantización Q8_0 (1,27 GB) para minimizar el uso de disco en servidores de renderizado.
- Indexación y búsqueda de archivos de audio: transcripción de archivos históricos para construir índices de texto searchable; la licencia CC-BY-4.0 permite integrar el resultado en productos comerciales con atribución.
- Despliegue en hardware de consumo: con Q4_K_M (825 MB) el modelo cabe en equipos con poca VRAM o incluso en CPU; los datos de rendimiento reportados indican RTF de 125,5 en Metal sobre M4 Max y 17,5 en CPU sobre el mismo equipo, y 11,5 en Vulkan y 5,5 en CPU sobre Ryzen 4750U.
- Preprocesado para pipelines de NLP: transcripción de audio a texto como paso previo a análisis de sentimiento, resumen o extracción de entidades, ejecutándose localmente con transcribe.cpp sin dependencia de servicios en la nube.
- Transcripción en entornos con requisitos de privacidad: al ser un modelo offline que corre en local, permite procesar audio sensible (sanitario, legal) sin enviar datos a terceros, usando la cuantización F16 (2,15 GB) para máxima fidelidad.
- Evaluación y benchmarking de ASR: la disponibilidad de múltiples cuantizaciones con WER medido en el mismo split (LibriSpeech test-clean, 2620 utterances) permite estudiar el impacto de la cuantización en la calidad de transcripción.

## Benchmarks y rendimiento

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 4,28 GB | 1,39 % |
| F16 | 2,15 GB | 1,39 % |
| Q8_0 | 1,27 GB | 1,38 % |
| Q6_K | 1,04 GB | 1,40 % |
| Q5_K_M | 936 MB | 1,39 % |
| Q4_K_M | 825 MB | 1,42 % |

WER medido sobre el split completo de LibriSpeech test-clean (2620 utterances) con decodificación greedy TDT/RNN-T y sin LM externo. La referencia F32 es 1,39 %, que coincide con el dato auto-reportado por NVIDIA para el mismo split.

Rendimiento en tiempo real (RTF, mayor es mejor):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 125,5 |
| Apple M4 Max | CPU | 17,5 |
| AMD Ryzen 4750U | Vulkan | 11,5 |
| AMD Ryzen 4750U | CPU | 5,5 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el tamaño de los pesos GGUF va de 825 MB (Q4_K_M) a 4,28 GB (F32), por lo que el consumo de memoria es del orden del tamaño del archivo más overhead de runtime.
- GPU recomendadas: no se especifican en la información disponible; los datos de rendimiento reportados cubren Apple M4 Max (Metal) y AMD Ryzen 4750U (Vulkan/CPU).
- GPU de consumo: el modelo cabe en GPUs de consumo con 2 GB o más de VRAM en cuantizaciones Q4_K_M a Q8_0; la cuantización F32 requiere aproximadamente 4,3 GB.
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake; binario transcribe-cli). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo ASR y no un LLM.
- Latencia y throughput: RTF de 125,5 en Metal (M4 Max), 17,5 en CPU (M4 Max), 11,5 en Vulkan (Ryzen 4750U) y 5,5 en CPU (Ryzen 4750U). Un RTF superior a 1 indica procesamiento más rápido que tiempo real.
- Preprocesado requerido: conversión previa del audio a WAV mono a 16 kHz (por ejemplo, con ffmpeg: `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---|---|---|---|
| parakeet-tdt-1.1b-gguf (esta ficha) | 1,07 B | no disponible | 1,38–1,42 % (según cuantización) | CC-BY-4.0 | GGUF |
| nvidia/parakeet-tdt-1.1b (original) | 1,1 B | no disponible | 1,39 % (auto-reportado) | CC-BY-4.0 | NeMo (.nemo) |
| Otros modelos ASR comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks de modelos alternativos de la misma categoría para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Solo inglés: el modelo no soporta otros idiomas ni detección de idioma (lang_detect: false).
- No es streaming: requiere el archivo de audio completo; no apto para transcripción en tiempo real por fragmentos.
- No traduce: la salida es únicamente transcripción en inglés.
- Salida en minúsculas: el alfabeto de salida es inglés en minúsculas, sin puntuación ni capitalización garantizadas por el modelo.
- Riesgo de alucinación: como todo modelo ASR, puede generar texto incorrecto en audio con ruido, acentos no nativos o solapamiento de hablantes; el WER de 1,39 % corresponde a LibriSpeech, un corpus de lectura limpia, no a audio real.
- Dependencia de transcribe.cpp: el despliegue requiere compilar el motor desde fuente; no hay integración documentada con ecosistemas como Hugging Face Transformers, vLLM u Ollama.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario conservar la atribución a NVIDIA y a los autores de la conversión.
- Madurez de la conversión: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-01; conviene validar numéricamente contra la referencia NeMo antes de usarlo en producción.
- Preprocesado obligatorio: el audio debe convertirse a WAV mono a 16 kHz; otros formatos o frecuencias de muestreo no están soportados directamente.

## Enlaces

- Repositorio Hugging Face de la conversión: https://huggingface.co/tryambientai/parakeet-tdt-1.1b-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-1.1b
- Commit del modelo base utilizado: https://huggingface.co/nvidia/parakeet-tdt-1.1b/commit/53276c6
- Motor transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-tdt-1.1b.md
- Pesos GGUF (F32): https://huggingface.co/handy-computer/parakeet-tdt-1.1b-gguf/resolve/main/parakeet-tdt-1.1b-F32.gguf
- Pesos GGUF (F16): https://huggingface.co/handy-computer/parakeet-tdt-1.1b-gguf/resolve/main/parakeet-tdt-1.1b-F16.gguf
- Pesos GGUF (Q8_0): https://huggingface.co/handy-computer/parakeet-tdt-1.1b-gguf/resolve/main/parakeet-tdt-1.1b-Q8_0.gguf
- Pesos GGUF (Q6_K): https://huggingface.co/handy-computer/parakeet-tdt-1.1b-gguf/resolve/main/parakeet-tdt-1.1b-Q6_K.gguf
- Pesos GGUF (Q5_K_M): https://huggingface.co/handy-computer/parakeet-tdt-1.1b-gguf/resolve/main/parakeet-tdt-1.1b-Q5_K_M.gguf
- Pesos GGUF (Q4_K_M): https://huggingface.co/handy-computer/parakeet-tdt-1.1b-gguf/resolve/main/parakeet-tdt-1.1b-Q4_K_M.gguf
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Documentación de modelos ASR de NeMo: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Documentación de NeMo Toolkit ASR: https://docs.nvidia.com/nemo-framework/user-guide/latest/nemotoolkit/asr/models.html
- Suno.ai: https://www.suno.ai/
- NVIDIA Developer Portal: https://developer.nvidia.com/
- NVIDIA Nemotron: https://developer.nvidia.com/nemotron
- NVIDIA Riva Speech: https://developer.nvidia.com/riva
- Paper FastConformer (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper TDT (arXiv:2304.06795): https://arxiv.org/abs/2304.06795
- Paper Conformer (arXiv:2104.02821): https://arxiv.org/abs/2104.02821
