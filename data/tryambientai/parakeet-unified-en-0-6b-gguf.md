# tryambientai/parakeet-unified-en-0.6b-gguf

## Resumen

parakeet-unified-en-0.6b-gguf es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) nvidia/parakeet-unified-en-0.6b, publicada por el usuario tryambientai para su uso con la librería transcribe.cpp. El modelo original lo desarrolla NVIDIA y se basa en una arquitectura transducer RNN-T con un codificador FastConformer (familia Parakeet) de aproximadamente 618 millones de parámetros, entrenado como modelo "unificado" que soporta tanto inferencia offline como streaming con una latencia mínima de 160 ms.

El propósito de esta conversión es ofrecer una alternativa ligera y ejecutable localmente para transcripción de voz en inglés, con soporte de puntuación y mayúsculas, sin depender de infraestructura de servidor. Al estar cuantizado en GGUF, el modelo puede ejecutarse en CPU y GPU de consumo mediante transcribe.cpp, con tamaños que van desde 477 MB (Q4_K_M) hasta 2,47 GB (F32), manteniendo un WER prácticamente idéntico al de la referencia en precisión completa.

Es relevante porque demuestra que un modelo ASR de calidad competitiva (WER del 1,59 % en LibriSpeech test-clean) puede desplegarse en hardware modesto con pérdida de precisión mínima tras la cuantización, y porque el ecosistema GGUF se extiende más allá de los LLM hacia tareas de transcripción. La conversión está validada contra la referencia NeMo y fijada a un commit concreto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer RNN-T con codificador FastConformer (Parakeet) |
| Parametros totales | 618.309.121 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo ASR; ventana de audio, no contexto de texto) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Inglés (en-US) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transducer RNN-T: un codificador FastConformer (variante eficiente del Conformer que combina atención y convoluciones) acoplado a un decodificador RNN-T que realiza la predicción conjunta token a token. El codificador está entrenado de forma conjunta en modos offline y streaming, lo que permite al modelo original operar con distintos tamaños de chunk y contexto derecho, con latencias configurables entre 2080 ms y 160 ms en pasos de 80 ms. Esta conversión GGUF conserva los contextos de atención de streaming en el fichero, pero transcribe.cpp solo expone actualmente la inferencia offline.

El entrenamiento original se realizó mayoritariamente sobre la parte en inglés del dataset Granary, que contiene aproximadamente 250.000 horas de habla en inglés estadounidense en condiciones acústicas diversas. El modelo produce texto en alfabeto inglés, espacios y apóstrofos, con soporte integrado de puntuación y mayúsculas. La conversión GGUF está portada desde el commit d4ac992 del modelo base (fijado el 2026-05-10) y validada contra la referencia NeMo en el commit 42528dd de transcribe.cpp el 2026-05-10. No se dispone de información sobre el uso de RLHF o DPO en el entrenamiento.

## Capacidades

- Transcripción de voz a texto en inglés (ASR) con decodificación greedy RNN-T.
- Soporte integrado de puntuación y capitalización en la salida.
- Inferencia offline en esta conversión (el streaming está presente en los pesos pero no expuesto por transcribe.cpp).
- Salida con marcas de tiempo a nivel de token (timestamps: token).
- No soporta traducción (translate: false).
- No soporta detección de idioma (lang_detect: false).
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un LLM).
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo procesa audio de 16 kHz mono WAV y genera texto con puntuación, adecuado para actas automáticas en inglés con hardware de consumo gracias a su tamaño de 477-731 MB en cuantizaciones bajas.
- Subtitulado offline de vídeo: al producir marcas de tiempo a nivel de token, permite generar subtítulos sincronizados en inglés para archivos de vídeo previamente convertidos con ffmpeg a 16 kHz mono.
- Dictado y accesibilidad: integración en aplicaciones de escritorio que transcriben voz a texto en local, sin enviar audio a la nube, usando la versión Q5_K_M o Q6_K con WER en torno al 1,6 %.
- Procesamiento por lotes de archivos de audio: transcripción masiva de grabaciones en pipelines de CPU (RTF de 7,5 en Ryzen 4750U) o GPU (RTF de 163 en Metal sobre M4 Max), útil para archivos de centros de llamadas en inglés.
- Asistentes de voz y agentes conversacionales: aunque esta conversión es offline, el modelo base soporta streaming con latencia de 160 ms, lo que lo hace apto para sistemas de voz interactivos en inglés una vez que transcribe.cpp exponga esa funcionalidad.
- Investigación en ASR y evaluación de cuantización: sirve como referencia reproducible para estudiar el impacto de la cuantización GGUF en WER, con resultados medidos sobre LibriSpeech test-clean completo (2620 enunciados).
- Transcripción en dispositivos de borde: el tamaño reducido de las cuantizaciones Q4_K_M y Q5_K_M permite ejecución en equipos con poca memoria, incluyendo portátiles sin GPU dedicada mediante backend CPU o Vulkan.

## Benchmarks y rendimiento

Resultados de WER sobre LibriSpeech test-clean (2620 enunciados, decodificación greedy RNN-T, sin LM externo):

| Cuantizacion | Tamano | WER (%) |
|---|---:|---:|
| F32 | 2,47 GB | 1,59 |
| F16 | 1,24 GB | 1,59 |
| Q8_0 | 731 MB | 1,60 |
| Q6_K | 602 MB | 1,61 |
| Q5_K_M | 541 MB | 1,58 |
| Q4_K_M | 477 MB | 1,62 |

Referencia: la línea base F32 es 1,59 %; el dato autoinformado por NVIDIA sobre el mismo split es 1,63 %.

Rendimiento (RTF, factor de tiempo real):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 163 |
| Apple M4 Max | CPU | 28,5 |
| AMD Ryzen 4750U | Vulkan | 12,5 |
| AMD Ryzen 4750U | CPU | 7,5 |

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente el tamaño del fichero GGUF más overhead. F32 ~2,5 GB; F16 ~1,3 GB; Q8_0 ~750 MB; Q6_K ~620 MB; Q5_K_M ~560 MB; Q4_K_M ~500 MB.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan; los datos publicados muestran RTF de 163 en Metal sobre M4 Max y de 12,5 en Vulkan sobre Ryzen 4750U (iGPU).
- Cabe en GPU de consumo: sí, todas las cuantizaciones caben en GPUs con 4 GB o más de memoria; las versiones Q4_K_M y Q5_K_M caben incluso en sistemas con 1 GB de memoria libre.
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake); no se indica soporte de vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo ASR y no un LLM.
- Latencia y throughput: RTF de 163 (Metal, M4 Max) implica procesar audio aproximadamente 163 veces más rápido que tiempo real; RTF de 7,5 en CPU de Ryzen 4750U sigue siendo más rápido que tiempo real.
- Requisito de entrada: audio en WAV mono a 16 kHz; conversión previa con ffmpeg si es necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---:|---:|---|---|
| parakeet-unified-en-0.6b (esta conversion GGUF) | 618 M | en | 1,59 % (F32) | CC-BY-4.0 | GGUF |
| nvidia/parakeet-unified-en-0.6b (original) | 618 M | en | 1,63 % (autoinformado) | CC-BY-4.0 | NeMo |
| Modelos transducer offline/streaming previos de NVIDIA | No disponible | en | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos comparativos con alternativas de otros fabricantes (por ejemplo, Whisper) en parámetros, contexto o WER sobre los mismos conjuntos.

## Limitaciones y advertencias

- Solo soporta inglés (en-US); no traduce ni detecta idioma.
- Esta conversión funciona únicamente en modo offline; el streaming no está expuesto por transcribe.cpp pese a estar presente en los pesos.
- Requiere audio de entrada en WAV mono a 16 kHz; otros formatos deben convertirse previamente.
- Riesgo de alucinación y errores en condiciones acústicas adversas, habla con acento no estadounidense, ruido de fondo o solapamiento de hablantes; el WER de referencia es sobre LibriSpeech, un corpus relativamente limpio.
- No es un LLM: no soporta tool calling, razonamiento multi-paso ni generación de texto libre.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario citar al autor original (NVIDIA) y cumplir los términos del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la conversión está fijada a commits concretos, lo que puede afectar al soporte a largo plazo.
- La validación numérica se realizó contra NeMo en una fecha concreta; cambios posteriores en transcribe.cpp podrían alterar el comportamiento.
- No se han publicado datos sobre sesgos demográficos o acústicos específicos en la información disponible.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/tryambientai/parakeet-unified-en-0.6b-gguf
- Modelo base original: https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- Commit del modelo base usado: https://huggingface.co/nvidia/parakeet-unified-en-0.6b/commit/d4ac992
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-unified-en-0.6b.md
- Descarga F32: https://huggingface.co/handy-computer/parakeet-unified-en-0.6b-gguf/resolve/main/parakeet-unified-en-0.6b-F32.gguf
- Descarga F16: https://huggingface.co/handy-computer/parakeet-unified-en-0.6b-gguf/resolve/main/parakeet-unified-en-0.6b-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/parakeet-unified-en-0.6b-gguf/resolve/main/parakeet-unified-en-0.6b-Q8_0.gguf
- Descarga Q6_K: https://huggingface.co/handy-computer/parakeet-unified-en-0.6b-gguf/resolve/main/parakeet-unified-en-0.6b-Q6_K.gguf
- Descarga Q5_K_M: https://huggingface.co/handy-computer/parakeet-unified-en-0.6b-gguf/resolve/main/parakeet-unified-en-0.6b-Q5_K_M.gguf
- Descarga Q4_K_M: https://huggingface.co/handy-computer/parakeet-unified-en-0.6b-gguf/resolve/main/parakeet-unified-en-0.6b-Q4_K_M.gguf
- Paper referenciado (arXiv:2604.19079): https://arxiv.org/abs/2604.19079
- Paper referenciado (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper referenciado (arXiv:2304.09325): https://arxiv.org/abs/2304.09325
