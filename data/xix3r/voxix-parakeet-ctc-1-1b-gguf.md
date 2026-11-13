# xix3r/voxix-parakeet-ctc-1.1b-gguf

## Resumen

voxix-parakeet-ctc-1.1b-gguf es una conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) nvidia/parakeet-ctc-1.1b, publicada por el usuario xix3r para su uso con el runtime transcribe.cpp. El modelo subyacente es un FastConformer-XL de aproximadamente 1.100 millones de parámetros con una cabeza CTC lineal, desarrollado conjuntamente por los equipos de NVIDIA NeMo y Suno.ai. Resuelve la transcripción de voz a texto en inglés de forma totalmente offline, sin dependencia de frameworks de deep learning pesados en tiempo de ejecución.

La aportación de esta ficha no es un modelo nuevo, sino un artefacto de despliegue: pesos cuantizados en GGUF (desde F32 hasta Q4_K_M) que permiten ejecutar un ASR de 1.1B en CPU, GPU integrada o Apple Silicon mediante Metal/Vulkan. El repositorio ocupa 0,9 GB y la cuantización más pequeña (Q4_K_M) baja a 818 MB, lo que lo hace viable en hardware de consumo modesto.

Es relevante ahora porque demuestra que la familia Parakeet de NVIDIA puede salir del ecosistema NeMo/PyTorch y ejecutarse en runtimes ligeros tipo llama.cpp, manteniendo una tasa de error de palabra (WER) de 1,85 % en LibriSpeech test-clean, prácticamente idéntica a la referencia oficial de NVIDIA (1,83 %). La licencia CC-BY-4.0 permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-XL (encoder Conformer) con cabeza CTC lineal |
| Parametros totales | 1.062.626.305 (aprox. 1,1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no de texto; procesa audio de entrada) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |
| Modelo base | nvidia/parakeet-ctc-1.1b |
| Commit upstream | a707e81 (fijado 2026-05-10) |
| Streaming | no |
| Traduccion | no |
| Deteccion de idioma | no |
| Marcas de tiempo | a nivel de token |

## Arquitectura y entrenamiento

El modelo base es un FastConformer CTC en variante XXL. FastConformer es una evolución del Conformer que reduce la complejidad computacional del encoder mediante downsampling de las secuencias de audio, manteniendo bloques de atención y convolución para capturar dependencias locales y globales. Sobre el encoder se sitúa una cabeza CTC lineal que emite directamente tokens de texto sin decoder autorregresivo, lo que simplifica la inferencia y permite decodificación greedy.

Los detalles de entrenamiento del modelo original (número de horas de audio, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. La model card indica que el modelo transcribe al alfabeto inglés en minúsculas, sin puntuación, y que fue desarrollado conjuntamente por NVIDIA NeMo y Suno.ai. Esta conversión GGUF se validó numéricamente contra la referencia NeMo en el commit 42528dd de transcribe.cpp, con fecha 2026-05-10. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá de las propias de FastConformer.

## Capacidades

- Transcripción de voz a texto en inglés, offline, con decodificación CTC greedy.
- Salida en minúsculas y sin puntuación (formato normalizado del alfabeto inglés).
- Marcas de tiempo a nivel de token.
- Ejecución sin dependencias de PyTorch/NeMo en tiempo de inferencia (runtime transcribe.cpp).
- Compatibilidad con múltiples backends de cómputo: CPU, Metal (Apple Silicon) y Vulkan.
- No soporta streaming: requiere audio completo como entrada.
- No traduce y no detecta idioma automáticamente.
- No dispone de tool calling, function calling ni capacidades de agente (es un modelo ASR puro).
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa audio de 16 kHz mono y genera transcripciones con marcas de tiempo por token, útiles para alinear subtítulos o indexar segmentos. Su WER de 1,85 % en LibriSpeech test-clean lo hace adecuado para audio limpio de estudio o micrófono.
- Generación de subtítulos offline: al ejecutarse sin conexión y en CPU, permite crear subtítulos en entornos sin acceso a la nube o con requisitos de privacidad estrictos, usando las marcas de tiempo para sincronizar.
- Notas de voz en aplicaciones de escritorio: con Q4_K_M (818 MB) cabe en equipos de consumo y puede integrarse en apps nativas mediante transcribe.cpp para dictado local.
- Procesamiento por lotes de archivos de audio: la conversión previa con ffmpeg a WAV 16 kHz mono y la ejecución por CLI facilitan pipelines de transcripción masiva en servidores sin GPU.
- Investigación en ASR y evaluación de cuantizaciones: sirve como artefacto reproducible para comparar el impacto de F32 frente a Q4_K_M en WER (1,85 % frente a 1,90 %) y en velocidad (RTF) sobre distintos backends.
- Transcripción en dispositivos Apple Silicon: el backend Metal alcanza un RTF de 139,5 en un chip M4 Max, lo que permite transcripción casi en tiempo real o más rápida que tiempo real en portátiles.
- Despliegue en hardware modesto con Vulkan: en un Ryzen 4750U el backend Vulkan logra RTF 14 y el CPU RTF 6, lo que habilita transcripción en portátiles sin GPU dedicada.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| WER LibriSpeech test-clean (F32) | 1,85 % |
| WER LibriSpeech test-clean (F16) | 1,85 % |
| WER LibriSpeech test-clean (Q8_0) | 1,85 % |
| WER LibriSpeech test-clean (Q6_K) | 1,85 % |
| WER LibriSpeech test-clean (Q5_K_M) | 1,84 % |
| WER LibriSpeech test-clean (Q4_K_M) | 1,90 % |
| WER referencia NVIDIA (mismo split) | 1,83 % |
| RTF M4 Max (Metal) | 139,5 |
| RTF M4 Max (CPU) | 17,5 |
| RTF Ryzen 4750U (Vulkan) | 14 |
| RTF Ryzen 4750U (CPU) | 6 |

Las mediciones de WER se realizaron sobre el split completo de LibriSpeech test-clean (2620 utterances) con decodificación CTC greedy y sin modelo de lenguaje externo. El RTF (real-time factor) indica cuántas veces más rápido que tiempo real procesa el audio; valores superiores a 1 implican procesamiento más rápido que la reproducción.

## Requisitos de hardware

- VRAM/RAM estimada: F32 requiere 4,25 GB; F16, 2,13 GB; Q8_0, 1,26 GB; Q6_K, 1,04 GB; Q5_K_M, 929 MB; Q4_K_M, 818 MB.
- GPU recomendadas: no se especifican modelos concretos; los benchmarks reportados usan Apple M4 Max (Metal) y Ryzen 4750U (Vulkan/CPU).
- Cabe en GPU de consumo: sí, especialmente en cuantizaciones Q4_K_M a Q8_0, que ocupan menos de 1,3 GB.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake. Backends soportados: CPU, Metal y Vulkan. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: RTF 139,5 en Metal (M4 Max), 17,5 en CPU (M4 Max), 14 en Vulkan (Ryzen 4750U) y 6 en CPU (Ryzen 4750U).
- Requisito de entrada: audio WAV 16 kHz mono; conversión previa con ffmpeg si es necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---|---|---|---|
| voxix-parakeet-ctc-1.1b-gguf | 1,1B | audio (no streaming) | 1,85 % (F32) | CC-BY-4.0 | GGUF |
| nvidia/parakeet-ctc-1.1b (original) | 1,1B | audio (no streaming) | 1,83 % (reportado) | CC-BY-4.0 | NeMo/.nemo |
| whisper-large-v3 | no disponible en la informacion | audio (30 s por ventana) | no disponible en la informacion | MIT (no confirmado en la informacion) | safetensors, GGUF via terceros |
| wav2vec2-large-960h | no disponible en la informacion | audio | no disponible en la informacion | no disponible en la informacion | safetensors |

No se dispone de datos de benchmarks comparativos con otros modelos ASR en la información proporcionada; la comparación con whisper-large-v3 y wav2vec2 se limita a categoría y formato, sin cifras verificadas.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas ni detección automática de idioma.
- Salida sin puntuación ni mayúsculas, lo que requiere postprocesado para texto legible.
- No es un modelo de streaming: necesita el audio completo antes de transcribir.
- No traduce.
- Riesgo de errores en audio con ruido, acentos no nativos, solapamiento de hablantes o vocabulario técnico fuera del dominio de entrenamiento; el WER reportado corresponde a LibriSpeech, un corpus de lectura limpia.
- No se documentan sesgos específicos en la información proporcionada, aunque al estar entrenado principalmente con inglés estadounidense puede tener peor rendimiento en otras variedades.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar a NVIDIA y respetar los términos del modelo base.
- Artefacto de terceros: la conversión GGUF la mantiene xix3r, no NVIDIA; la validez depende del commit fijado y de la versión de transcribe.cpp.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo ASR.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xix3r/voxix-parakeet-ctc-1.1b-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-ctc-1.1b
- Commit upstream fijado: https://huggingface.co/nvidia/parakeet-ctc-1.1b/commit/a707e81
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-ctc-1.1b.md
- Repositorio NeMo: https://github.com/NVIDIA/NeMo
- Documentación FastConformer: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Paper de referencia (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Suno.ai: https://www.suno.ai/
