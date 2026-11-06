# tryambientai/parakeet-rnnt-0.6b-gguf

## Resumen

parakeet-rnnt-0.6b-gguf es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) nvidia/parakeet-rnnt-0.6b, publicada por el usuario tryambientai para su uso con transcribe.cpp, una implementación en C++ orientada a inferencia local eficiente. El modelo original fue desarrollado conjuntamente por los equipos de NVIDIA NeMo y Suno.ai, y se trata de una variante XL de la arquitectura FastConformer Transducer con aproximadamente 600 millones de parámetros (616.736.257 exactos según los pesos en safetensors).

El modelo resuelve la transcripción de voz a texto en inglés, en línea con la familia Parakeet de NVIDIA, que prioriza velocidad y precisión sobre funcionalidades adicionales. La conversión GGUF permite ejecutar el modelo fuera del ecosistema NeMo/PyTorch, con soporte para cuantizaciones que van desde F32 (2,47 GB) hasta Q4_K_M (476 MB), lo que lo hace viable en hardware de consumo y en CPU. El repositorio ocupa 0,7 GB y la librería asociada es transcribe.cpp.

Es relevante ahora porque ofrece una vía ligera y portable para ASR offline en inglés con una precisión competitiva (WER de 1,62 % en LibriSpeech test-clean, frente al 1,63 % reportado por NVIDIA), sin dependencia de frameworks de deep learning pesados y con licencia permisiva CC-BY-4.0 para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer-Large encoder + RNN-T transducer decoder (FastConformer-Transducer) |
| Parámetros totales | 616.736.257 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR offline, no streaming) |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura FastConformer-Transducer: un encoder FastConformer-Large (variante optimizada del Conformer con atención por bloques y submuestreo agresivo) acoplado a un decodificador RNN-T (transducer). La decodificación es greedy RNN-T, sin modelo de lenguaje externo. La salida es en minúsculas y sin puntuación. No es un modelo de streaming ni realiza traducción ni detección de idioma, según la model card.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. La model card original de NVIDIA indica que el modelo fue desarrollado conjuntamente por NeMo y Suno.ai, y remite a la documentación de NeMo para los detalles completos de la arquitectura FastConformer. La conversión GGUF se realizó a partir del commit upstream c0c1f09 (fijado el 2026-05-10) y se validó contra la referencia NeMo en el commit 42528dd de transcribe.cpp el 2026-05-10.

## Capacidades

- Transcripción de voz a texto en inglés (ASR offline).
- Decodificación greedy RNN-T sin modelo de lenguaje externo.
- Salida en minúsculas y sin puntuación.
- Generación de timestamps a nivel de token (según el campo `timestamps: token` de la model card).
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No soporta detección de idioma (`lang_detect: false`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción por lotes de grabaciones en inglés: el modelo procesa archivos WAV de 16 kHz mono con decodificación greedy, adecuado para pipelines offline de generación de subtítulos o actas donde no se requiere streaming.
- Subtitulado y generación de transcripciones con timestamps: al producir timestamps a nivel de token, permite alinear el texto con el audio para herramientas de subtitulado o búsqueda dentro de grabaciones.
- Procesamiento en CPU sin GPU: con cuantizaciones Q4_K_M (476 MB) y Q8_0 (730 MB), puede ejecutarse en servidores sin acelerador, con un RTF de 8 en un Ryzen 4750U (CPU) según la model card.
- Despliegue en dispositivos de borde o portátiles: la versión Q4_K_M cabe en memoria de sistemas modestos y permite transcripción local sin conexión, útil en entornos con requisitos de privacidad.
- Aceleración con Metal en Apple Silicon: la model card reporta un RTF de 185,5 con Metal en un chip M4 Max, lo que lo hace adecuado para aplicaciones de escritorio en macOS.
- Aceleración con Vulkan en GPU de consumo: RTF de 14,5 en un Ryzen 4750U con Vulkan, útil para integraciones en equipos con GPU integrada o de gama baja.
- Integración en herramientas de línea de comandos: el binario transcribe-cli permite incorporar la transcripción en scripts y flujos automatizados de procesamiento de audio.

## Benchmarks y rendimiento

| Métrica | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,62 | 1,62 | 1,62 | 1,62 | 1,62 | 1,59 |
| Tamaño (GB) | 2,47 | 1,24 | 0,73 | 0,601 | 0,54 | 0,476 |

| Plataforma | Backend | RTF |
|---|---|---:|
| M4 Max | Metal | 185,5 |
| M4 Max | CPU | 30 |
| Ryzen 4750U | Vulkan | 14,5 |
| Ryzen 4750U | CPU | 8 |

El WER se midió sobre el conjunto completo LibriSpeech test-clean (2620 enunciados) con decodificación greedy RNN-T y sin LM externo. La referencia F32 es 1,62 %; NVIDIA reporta 1,63 % en el mismo conjunto. El RTF (real-time factor) indica la relación entre duración del audio y tiempo de procesamiento; valores más altos implican mayor velocidad relativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de los archivos, F32 requiere ~2,47 GB, F16 ~1,24 GB, Q8_0 ~730 MB y Q4_K_M ~476 MB de memoria.
- GPU recomendadas: no se especifican modelos concretos; la model card reporta pruebas en Apple M4 Max (Metal) y en un Ryzen 4750U (Vulkan y CPU).
- Cabe en GPU de consumo: sí, las cuantizaciones Q4_K_M y Q5_K_M caben en GPU integradas y de gama baja; las versiones F32 y F16 requieren más memoria.
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake y uso del binario transcribe-cli); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: RTF de 185,5 (Metal, M4 Max), 30 (CPU, M4 Max), 14,5 (Vulkan, Ryzen 4750U) y 8 (CPU, Ryzen 4750U), según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER LibriSpeech test-clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parakeet-rnnt-0.6b-gguf (este) | 616.736.257 | no disponible (offline) | 1,62 % (F32), 1,59 % (Q4_K_M) | CC-BY-4.0 | GGUF en Hugging Face (transcribe.cpp) |
| nvidia/parakeet-rnnt-0.6b (base) | ~600 M | no disponible (offline) | 1,63 % (reportado por NVIDIA) | CC-BY-4.0 | Pesos originales en Hugging Face (NeMo) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos ASR comparables en la información proporcionada; la comparación se limita al modelo base y a la versión GGUF.

## Limitaciones y advertencias

- Solo soporta inglés (`language: en`); no es multilingüe.
- No es un modelo de streaming; no apto para transcripción en tiempo real.
- No traduce ni detecta idioma automáticamente.
- La salida es en minúsculas y sin puntuación, lo que puede requerir postprocesado para textos finales.
- Riesgo de alucinación y errores en audio con ruido, acentos no ingleses o dominios específicos; no se documentan sesgos concretos en la información disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario revisar los términos completos en la model card upstream.
- La conversión GGUF está validada contra NeMo en un commit concreto; cambios futuros en transcribe.cpp podrían afectar a la compatibilidad.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación comunitaria amplia.
- La fecha de creación del repositorio (2026-11-01) y la fijación del commit upstream (2026-05-10) deben tenerse en cuenta para reproducibilidad.

## Enlaces

- [Hugging Face: tryambientai/parakeet-rnnt-0.6b-gguf](https://huggingface.co/tryambientai/parakeet-rnnt-0.6b-gguf)
- [Modelo base: nvidia/parakeet-rnnt-0.6b](https://huggingface.co/nvidia/parakeet-rnnt-0.6b)
- [Commit upstream c0c1f09](https://huggingface.co/nvidia/parakeet-rnnt-0.6b/commit/c0c1f09)
- [transcribe.cpp (GitHub)](https://github.com/handy-computer/transcribe.cpp)
- [Commit de validación 42528dd](https://github.com/handy-computer/transcribe.cpp/tree/42528dd)
- [Documentación del modelo en transcribe.cpp](https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-rnnt-0.6b.md)
- [NVIDIA NeMo](https://github.com/NVIDIA/NeMo)
- [Documentación FastConformer de NeMo](https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer)
- [Suno.ai](https://www.suno.ai/)
- [Licencia CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/)
- [NVIDIA Developer Portal](https://developer.nvidia.com)
- [NVIDIA Riva Speech](https://developer.nvidia.com/riva)
- [Paper arXiv:2305.05084](https://arxiv.org/abs/2305.05084)
