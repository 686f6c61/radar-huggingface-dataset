# tryambientai/whisper-large-v3-gguf

## Resumen

Whisper large-v3 GGUF es una conversión cuantizada del modelo de reconocimiento automático del habla (ASR) `openai/whisper-large-v3` de OpenAI, empaquetada en formato GGUF para su uso con el runtime `transcribe.cpp` del proyecto Handy Computer. El modelo original es un transformer encoder-decoder entrenado sobre más de 5 millones de horas de audio etiquetado y pseudo-etiquetado, y esta conversión permite ejecutarlo en hardware de consumo con pérdidas de precisión mínimas (WER de 1,86 % en LibriSpeech test-clean con cuantización Q4_K_M frente a 1,81 % en F16).

La relevancia de esta ficha radica en que traslada un modelo ASR multilingüe de referencia (99 idiomas, detección de idioma y traducción al inglés) a un formato portable y ligero, con pesos que van desde 951 MB (Q4_K_M) hasta 2,88 GB (F16). Frente a la inferencia en PyTorch, `transcribe.cpp` ofrece despliegue nativo en CPU, Metal y Vulkan sin dependencias de Python ni CUDA.

El modelo base incorpora las mejoras de la familia v3: entrada mel de 128 bins en lugar de 80 y un token de idioma nuevo para cantonés (`yue`). Esta conversión concreta está portada desde el commit `06f233f` de OpenAI y validada contra la referencia de transformers en el commit `5.6.1` de transcribe.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 1.543.516.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos con decodificación por fragmentos para audio largo |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 99 idiomas, incluidos es, en, zh, de, fr, ja, ru, ko, pt, ar, hi, ca, gl, eu y yue (cantonés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder-decoder clásico de Whisper. El encoder procesa espectrogramas mel de 128 bins (frente a los 80 de las versiones anteriores) y el decoder genera tokens de texto de forma autorregresiva. La entrada se estructura en ventanas de 30 segundos; para audio de mayor duración, transcribe.cpp aplica decodificación por fragmentos (*chunked long-form decoding*) con marcas de tiempo a nivel de segmento.

El entrenamiento del modelo original combina 1 millón de horas de audio débilmente etiquetado con 4 millones de horas de audio pseudo-etiquetado generado por Whisper large-v2, durante 2,0 épocas sobre esa mezcla. La familia v3 reduce entre un 10 % y un 20 % los errores respecto a large-v2 en una amplia variedad de idiomas. No se documenta en la información disponible el uso de RLHF o DPO; el entrenamiento es de supervisión débil a gran escala. La innovación principal de esta conversión es la cuantización GGUF con validación numérica frente a la referencia de transformers, manteniendo una degradación de WER inferior a 0,05 puntos porcentuales entre F16 y Q4_K_M.

## Capacidades

- Transcripción multilingüe de voz a texto en 99 idiomas.
- Detección automática de idioma (`lang_detect: true`).
- Traducción de voz a texto en inglés desde cualquier idioma soportado (`translate: true`).
- Marcas de tiempo a nivel de segmento (`timestamps: segment`).
- Procesamiento de audio largo mediante decodificación por fragmentos sobre ventanas de 30 segundos.
- Soporte de cantonés (`yue`) como novedad de la familia v3.
- No soporta streaming (`streaming: false`).
- No incluye tool calling, function calling, capacidades de agente ni visión.

## Casos de uso

- Subtitulado automático de vídeo y audio: el modelo genera marcas de tiempo por segmento, lo que permite producir ficheros de subtítulos alineados directamente a partir de la transcripción.
- Transcripción de reuniones y entrevistas: con decodificación por fragmentos puede procesar grabaciones de duración arbitraria, y la detección de idioma facilita entornos multilingües.
- Traducción de contenido audiovisual al inglés: la capacidad `translate` convierte audio en cualquier idioma soportado a texto en inglés, útil para catalogación y búsqueda de archivos en idiomas diversos.
- Despliegue en dispositivos sin GPU dedicada: las cuantizaciones Q4_K_M (951 MB) y Q5_K_M (1,08 GB) caben en equipos modestos y se ejecutan en CPU o Vulkan, como demuestra el RTF de 0,6 en CPU de un Ryzen 4750U.
- Integración en pipelines de accesibilidad: transcripción en tiempo casi real de audio en directo grabado por bloques, con RTF de 1,5 en CPU de un M4 Max (es decir, procesa audio más rápido que tiempo real).
- Procesamiento por lotes de archivos de audio: el runtime nativo sin dependencias de Python simplifica el empaquetado en contenedores y la ejecución en servidores sin CUDA.
- Análisis de llamadas y atención al cliente: transcripción de conversaciones telefónicas para extracción posterior de métricas y búsqueda de texto.

## Benchmarks y rendimiento

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F16 | 2,88 GB | 1,81 % |
| Q8_0 | 1,55 GB | 1,82 % |
| Q6_K | 1,21 GB | 1,83 % |
| Q5_K_M | 1,08 GB | 1,84 % |
| Q4_K_M | 951 MB | 1,86 % |

El WER se midió sobre la partición completa de LibriSpeech test-clean (2620 enunciados) con la decodificación por defecto de transcribe.cpp (greedy, `suppress_tokens`, *temperature fallback* y marcas de tiempo de segmento activadas). OpenAI reporta un 2,01 % en la misma partición con su propia configuración, cuya divergencia se atribuye probablemente a que `model.generate()` usa `<|notimestamps|>` por defecto. Las cifras proceden de una única ejecución con backend Metal; las reducciones paralelas no deterministas de Metal pueden desplazar el WER del corpus en torno a 0,1 puntos porcentuales entre ejecuciones.

Rendimiento en tiempo real (RTF):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 23,6 |
| Apple M4 Max | CPU | 1,5 |
| AMD Ryzen 4750U | Vulkan | 2,1 |
| AMD Ryzen 4750U | CPU | 0,6 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 951 MB (Q4_K_M) y 2,88 GB (F16) de pesos, más el *overhead* del runtime.
- Cabe en GPU de consumo: las cuantizaciones Q4_K_M y Q5_K_M son adecuadas para GPUs con 2-4 GB de memoria; F16 requiere al menos 4 GB.
- GPU recomendadas: cualquier GPU compatible con Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) con al menos 2-4 GB de memoria según la cuantización.
- Despliegue: exclusivamente mediante `transcribe.cpp` (compilación con CMake); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 23,6 en Metal sobre M4 Max, 1,5 en CPU sobre M4 Max, 2,1 en Vulkan sobre Ryzen 4750U y 0,6 en CPU sobre Ryzen 4750U. Un RTF superior a 1 indica procesamiento más rápido que tiempo real.
- El audio de entrada debe ser WAV mono a 16 kHz; se recomienda convertir previamente con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| whisper-large-v3-gguf (esta ficha) | 1.543.516.688 | 99 | GGUF (transcribe.cpp) | Apache-2.0 | Cuantizaciones de 951 MB a 2,88 GB; WER 1,81-1,86 % en LibriSpeech test-clean |
| openai/whisper-large-v3 (original) | 1.543.516.688 | 99 | safetensors (PyTorch) | Apache-2.0 | WER 2,01 % reportado por OpenAI en la misma partición con su configuración |
| openai/whisper-large-v2 | no disponible | 99 (sin yue) | safetensors | Apache-2.0 | Entrada mel de 80 bins; v3 reduce errores un 10-20 % respecto a v2 |

No se dispone en la información proporcionada de datos de otros modelos ASR comparables (por ejemplo, alternativas de otros autores) para ampliar la comparativa.

## Limitaciones y advertencias

- No soporta streaming: la decodificación es por fragmentos completos, lo que añade latencia en aplicaciones de transcripción en vivo.
- Riesgo de alucinación en clips cortos o con ruido de fondo; el propio autor señala que las diferencias de WER entre ejecuciones con Metal se deben principalmente a resultados de alucinación en el límite de ruido.
- El rendimiento depende del backend: Metal puede introducir no determinismo por reducciones paralelas, con variaciones de ~0,1 puntos porcentuales en el WER del corpus.
- Requiere audio en WAV mono a 16 kHz; otras frecuencias o canales deben convertirse previamente.
- El modelo está validado únicamente contra transcribe.cpp en el commit 5.6.1; no se garantiza compatibilidad con otras versiones del runtime.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial; conviene revisar los términos completos en la model card de OpenAI.
- No dispone de tool calling ni capacidades de agente; es un modelo puramente ASR.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de adopción comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/tryambientai/whisper-large-v3-gguf
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Commit del modelo base: https://huggingface.co/openai/whisper-large-v3/commit/06f233f
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Versión validada de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-large-v3.md
- Paper: https://huggingface.co/papers/2212.04356
- Pesos F16: https://huggingface.co/handy-computer/whisper-large-v3-gguf/resolve/main/whisper-large-v3-F16.gguf
- Pesos Q8_0: https://huggingface.co/handy-computer/whisper-large-v3-gguf/resolve/main/whisper-large-v3-Q8_0.gguf
- Pesos Q6_K: https://huggingface.co/handy-computer/whisper-large-v3-gguf/resolve/main/whisper-large-v3-Q6_K.gguf
- Pesos Q5_K_M: https://huggingface.co/handy-computer/whisper-large-v3-gguf/resolve/main/whisper-large-v3-Q5_K_M.gguf
- Pesos Q4_K_M: https://huggingface.co/handy-computer/whisper-large-v3-gguf/resolve/main/whisper-large-v3-Q4_K_M.gguf
