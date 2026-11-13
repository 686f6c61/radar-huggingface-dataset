# xix3r/voxix-whisper-small.en-gguf

## Resumen

`xix3r/voxix-whisper-small.en-gguf` es una conversión a formato GGUF del modelo `openai/whisper-small.en`, publicada por el usuario xix3r para su uso con la librería `transcribe.cpp`. Se trata de un modelo de reconocimiento automático del habla (ASR) basado en la arquitectura encoder-decoder Transformer de Whisper, especializado exclusivamente en inglés y con 241.750.624 parámetros totales. El repositorio ocupa 0,3 GB e incluye varias cuantizaciones (F32, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) que reducen el peso desde 924 MB hasta 164 MB.

El modelo resuelve el problema de la transcripción de audio a texto en inglés con una calidad cercana al estado del arte para su tamaño, manteniendo un WER (Word Error Rate) en torno al 3 % sobre LibriSpeech test-clean. Su relevancia radica en que permite ejecutar un modelo Whisper en hardware modesto (CPU, GPU consumer o Apple Silicon vía Metal) gracias a las cuantizaciones GGUF y al motor `transcribe.cpp`, que reporta velocidades de decodificación muy superiores al tiempo real (RTF de 104,4 en Metal sobre un M4 Max y de 12,8 en Vulkan sobre un Ryzen 4750U).

La ficha se centra en la conversión GGUF, no en el modelo original, pero conserva las características del modelo base: ventanas de 30 segundos con decodificación por fragmentos para audio largo, marcas de tiempo a nivel de segmento y ausencia de traducción, detección de idioma o streaming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241.750.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos con decodificación por fragmentos para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo base es `openai/whisper-small.en`, un Transformer encoder-decoder de tipo secuencia-a-secuencia entrenado por OpenAI sobre 680 000 horas de audio etiquetado mediante supervisión débil a gran escala. La variante `.en` se entrenó exclusivamente con datos en inglés y para la tarea de reconocimiento del habla (no traducción). El encoder procesa espectrogramas Mel de ventanas de 30 segundos y el decoder genera la transcripción de forma autorregresiva. La conversión GGUF se realizó a partir del commit `e872752` del modelo original (fijado el 2026-04-25) y se validó contra la referencia de `transformers` en el commit `5.6.1` de `transcribe.cpp` el 2026-04-26.

La conversión no introduce cambios arquitectónicos: se limita a serializar los pesos en formato GGUF con distintas precisiones. El pipeline de decodificación por defecto de `transcribe.cpp` emplea búsqueda greedy, `suppress_tokens`, fallback de temperatura y marcas de tiempo de segmento activadas. La model card señala que la diferencia de WER frente al 3,05 % reportado por OpenAI probablemente se debe a que `model.generate()` de OpenAI usa por defecto `<|notimestamps|>`, mientras que el pipeline de `transcribe.cpp` ejecuta con timestamps activados.

## Capacidades

- Transcripción de audio a texto en inglés (ASR) sobre audio de 16 kHz mono WAV.
- Manejo de audio largo mediante decodificación por fragmentos sobre ventanas de 30 segundos.
- Marcas de tiempo a nivel de segmento (no a nivel de palabra).
- Robustez ante dominios y acentos diversos sin fine-tuning, gracias al entrenamiento con 680 000 horas de datos.
- No soporta streaming (indicado como `streaming: false` en la model card).
- No soporta traducción de voz a otro idioma (`translate: false`).
- No soporta detección automática de idioma (`lang_detect: false`).
- No soporta otras modalidades (visión, audio generativo, tool calling).

## Casos de uso

- Transcripción de reuniones y entrevistas en inglés: el modelo procesa audio largo mediante fragmentos de 30 segundos y devuelve marcas de tiempo por segmento, lo que facilita la generación de actas o subtítulos sincronizados.
- Subtitulado automático de vídeo en inglés: las marcas de tiempo de segmento permiten alinear los subtítulos con el audio sin necesidad de un alineador forzado adicional.
- Dictado y notas de voz en aplicaciones de escritorio: con la cuantización Q4_K_M (164 MB) el modelo cabe en memoria de cualquier portátil y puede ejecutarse en CPU con un RTF de 3,6 en un Ryzen 4750U, es decir, más rápido que el tiempo real.
- Transcripción en dispositivos con Apple Silicon: la ejecución vía Metal alcanza un RTF de 104,4 en un M4 Max, lo que permite transcribir horas de audio en minutos en un portátil.
- Indexación y búsqueda de archivos de audio: la transcripción con timestamps de segmento permite construir índices buscables sobre archivos de audio o vídeo en inglés.
- Preprocesado de datasets de voz para pipelines de NLP: transcripción masiva de corpus en inglés antes de tareas posteriores (análisis de sentimiento, resumen, extracción de entidades).
- Asistentes de voz locales sin conexión: al ser un modelo pequeño y cuantizable, puede integrarse en aplicaciones de escritorio o embebidas que requieran privacidad y funcionamiento offline.

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean (2620 utterances) con la decodificación por defecto de `transcribe.cpp`:

| Cuantizacion | Tamano | WER (%) |
|---|---:|---:|
| F32 | 924 MB | 3,09 |
| F16 | 470 MB | 2,97 |
| Q8_0 | 257 MB | 3,09 |
| Q6_K | 202 MB | 2,97 |
| Q5_K_M | 185 MB | 3,12 |
| Q4_K_M | 164 MB | 3,08 |

Referencia de OpenAI sobre la misma partición: 3,05 %. La model card advierte que las cifras provienen de una única ejecución con backend Metal y que las reducciones paralelas no deterministas de Metal pueden desplazar el WER del corpus en torno a 0,1 pp entre ejecuciones.

Rendimiento (RTF, mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 104,4 |
| Apple M4 Max | CPU | 10,3 |
| AMD Ryzen 4750U | Vulkan | 12,8 |
| AMD Ryzen 4750U | CPU | 3,6 |

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~164 MB (Q4_K_M) hasta ~924 MB (F32); en la práctica, la memoria necesaria es muy baja y cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon), Vulkan (AMD, Intel) o CUDA; no se requiere una GPU de datacenter.
- Cabe en GPU consumer: sí, en todas las cuantizaciones; incluso la F32 (924 MB) cabe en GPUs integradas.
- Opciones de despliegue: `transcribe.cpp` (CLI `transcribe-cli`); no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 104,4 en Metal (M4 Max) y 12,8 en Vulkan (Ryzen 4750U), lo que implica decodificación muy por encima del tiempo real; el RTF de 3,6 en CPU del Ryzen 4750U sigue siendo superior al tiempo real.
- El audio de entrada debe convertirse previamente a 16 kHz mono WAV (por ejemplo, con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---:|---|---|---|---|---|
| xix3r/voxix-whisper-small.en-gguf | 241,75 M | ventanas de 30 s | inglés | Apache-2.0 | GGUF | WER 3,09 % (F32) en LibriSpeech test-clean |
| openai/whisper-small.en | 241,75 M | ventanas de 30 s | inglés | Apache-2.0 | safetensors/bin | WER 3,05 % reportado por OpenAI; requiere transformers |
| openai/whisper-small | 241,75 M | ventanas de 30 s | multilingüe | Apache-2.0 | safetensors/bin | Multilingüe, incluye traducción; mayor coste por tarea en inglés |
| openai/whisper-base.en | 74 M | ventanas de 30 s | inglés | Apache-2.0 | safetensors/bin | Menor tamaño y precisión; no disponible en este repo |

## Limitaciones y advertencias

- Modelo exclusivamente en inglés: no transcribe otros idiomas ni detecta el idioma automáticamente.
- No soporta traducción de voz a texto en otro idioma.
- No soporta streaming: la decodificación es por fragmentos completos de audio.
- Las marcas de tiempo son a nivel de segmento, no de palabra.
- Riesgo de alucinación en clips cortos con ruido de fondo, según advierte la model card (afecta al WER en torno a 0,1 pp entre ejecuciones).
- El WER reportado se midió con una única ejecución en Metal; la variabilidad entre ejecuciones y backends no está cuantificada más allá de esa advertencia.
- La licencia Apache-2.0 se hereda del modelo base; no se indican restricciones adicionales para uso comercial en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- Depende de `transcribe.cpp`; no se documenta compatibilidad con otros motores de inferencia (llama.cpp, vLLM, Ollama, TGI).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xix3r/voxix-whisper-small.en-gguf
- Modelo base: https://huggingface.co/openai/whisper-small.en
- Commit del modelo base usado: https://huggingface.co/openai/whisper-small.en/commit/e872752
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Página de modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-small.en.md
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI Whisper: https://github.com/openai/whisper
- Pesos GGUF (referenciados en la model card, alojados en handy-computer): https://huggingface.co/handy-computer/whisper-small.en-gguf
