# xix3r/voxix-whisper-medium.en-gguf

## Resumen

`xix3r/voxix-whisper-medium.en-gguf` es una conversión a formato GGUF del modelo `openai/whisper-medium.en`, publicada por el usuario xix3r para su uso con la librería `transcribe.cpp` (implementación en C++ del pipeline de inferencia de Whisper, mantenida por handy-computer). Se trata, por tanto, de una redistribución cuantizada del checkpoint original de OpenAI, no de un modelo entrenado desde cero: la autoría intelectual del modelo subyacente corresponde a OpenAI y la conversión a GGUF a handy-computer, con este repositorio actuando como réplica o espejo.

El modelo base es un transformer encoder-decoder de tipo sequence-to-sequence especializado en reconocimiento automático de habla (ASR) en inglés, entrenado con 680 000 horas de audio etiquetado mediante supervisión débil. La variante "medium.en" es la versión monolingüe inglesa de tamaño medio de la familia Whisper, con aproximadamente 769 millones de parámetros y ventanas de audio de 30 segundos con decodificación por trozos para audio largo.

Su relevancia práctica radica en que permite ejecutar un ASR de calidad cercana al estado del arte en hardware modesto (CPU, Apple Silicon vía Metal, GPUs integradas vía Vulkan) sin dependencias de Python ni de PyTorch, gracias al formato GGUF y a `transcribe.cpp`. La licencia Apache-2.0 heredada del modelo base facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | no disponible (la familia Whisper medium se documenta en ~769 M en la model card original, sin cifra exacta en este repositorio) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos con decodificacion por trozos (chunked long-form decoding); contexto de texto no disponible |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | ingles unicamente (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para `transcribe.cpp`) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer encoder-decoder de tipo sequence-to-sequence. El encoder procesa espectrogramas log-Mel de ventanas de 30 segundos y el decoder genera la transcripcion de forma autorregresiva. Para audio de duracion superior a 30 segundos, el pipeline aplica decodificacion por trozos (chunked long-form decoding). La variante `.en` esta entrenada exclusivamente con datos en ingles y solo realiza la tarea de reconocimiento de habla (no traduccion).

El entrenamiento original de Whisper, descrito por Radford et al. (OpenAI) en el paper *Robust Speech Recognition via Large-Scale Weak Supervision*, emplea 680 000 horas de audio etiquetado mediante supervisión débil, lo que le confiere una capacidad notable de generalizacion a dominios y datasets no vistos sin fine-tuning. La model card del repositorio no documenta detalles adicionales sobre composicion del dataset, uso de RLHF/DPO ni innovaciones de decodificacion mas alla de la ya mencionada decodificacion por trozos y el esquema de fallback por temperatura propio del pipeline de `transcribe.cpp`.

La conversion a GGUF se realizo a partir del commit upstream `2e98eb6` (fijado el 2026-04-25) y se valido contra la referencia de `transformers` en el commit `5.6.1` de `transcribe.cpp` (2026-04-26). Las cuantizaciones incluyen F32 (2,85 GB), F16 (1,44 GB), Q8_0 (793 MB), Q6_K (618 MB), Q5_K_M (556 MB) y Q4_K_M (481 MB).

## Capacidades

- Reconocimiento automatico de habla (ASR) en ingles sobre audio de 16 kHz mono.
- Transcripcion de audio largo mediante decodificacion por trozos sobre ventanas de 30 segundos.
- Generacion de marcas de tiempo a nivel de segmento (`timestamps: segment`).
- Robustez ante dominios y acentos no vistos, derivada del entrenamiento masivo con supervisión débil.
- No soporta streaming (`streaming: false`).
- No soporta traduccion (`translate: false`).
- No realiza deteccion automatica de idioma (`lang_detect: false`), coherente con ser un modelo monolingue.
- No soporta tool calling ni razonamiento multi-paso: es un modelo puramente acustico-textual.
- Salida de texto plano; no genera audio ni otras modalidades.

## Casos de uso

- **Transcripcion de reuniones y entrevistas**: el modelo procesa audio largo mediante decodificacion por trozos y devuelve marcas de tiempo por segmento, lo que permite generar actas sincronizadas con el audio sin necesidad de segmentar manualmente la grabacion.
- **Subtitulado de video en ingles**: usando las marcas de tiempo por segmento se pueden generar subtitulos alineados con la pista de audio; el flujo tipico es extraer el audio, convertirlo a WAV 16 kHz mono con `ffmpeg` y ejecutar `transcribe-cli`.
- **Transcripcion en el dispositivo (edge)**: con la cuantizacion Q4_K_M (481 MB) el modelo cabe en dispositivos con poca memoria; los datos de rendimiento reportados (RTF 45,1 en Metal sobre M4 Max y 4,6 en Vulkan sobre Ryzen 4750U) indican viabilidad en hardware de consumo sin GPU dedicada.
- **Pipelines de accesibilidad**: generacion de transcripciones en tiempo casi real para aplicaciones de accesibilidad auditiva en entornos de habla inglesa, aprovechando la ejecucion nativa en C++ sin dependencias de Python.
- **Indexacion y busqueda de archivos de audio**: transcripcion por lotes de archivos WAV de un repositorio para alimentar un motor de busqueda textual o un sistema RAG sobre contenido hablado, beneficiandose de la licencia Apache-2.0 para uso comercial.
- **Preprocesado de datos para entrenamiento**: generacion de transcripciones pseudo-etiquetadas de corpus de audio en ingles para tareas posteriores de fine-tuning, dado el bajo WER reportado (2,72-2,91 % en LibriSpeech test-clean segun cuantizacion).

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 2,74 | 2,73 | 2,72 | 2,83 | 2,74 | 2,91 |
| Tamano (GB) | 2,85 | 1,44 | 0,793 | 0,618 | 0,556 | 0,481 |

| Metrica de velocidad | Valor |
|---|---|
| RTF en Apple M4 Max (Metal) | 45,1 |
| RTF en Apple M4 Max (CPU) | 3,2 |
| RTF en Ryzen 4750U (Vulkan) | 4,6 |
| RTF en Ryzen 4750U (CPU) | 1,1 |

Notas: el WER se midio sobre el split completo de LibriSpeech test-clean (2620 enunciados) con la decodificacion por defecto de `transcribe.cpp` (greedy, `suppress_tokens`, fallback por temperatura, timestamps de segmento activados). OpenAI reporta 3,02 % en el mismo split; la divergencia se atribuye probablemente a que `model.generate()` de OpenAI usa `<|notimestamps|>` por defecto. Los valores provienen de una unica ejecucion sobre Metal, cuya no determinacion en reducciones paralelas puede desplazar el WER ~0,1 pp entre ejecuciones.

## Requisitos de hardware

- **VRAM/RAM estimada**: desde ~0,5 GB (Q4_K_M) hasta ~2,9 GB (F32) para los pesos; el consumo real depende del backend y del buffer de audio.
- **GPU recomendadas**: no se documentan GPU dedicadas concretas; los datos disponibles cubren Apple Silicon (Metal, M4 Max) y GPUs integradas AMD (Vulkan, Ryzen 4750U).
- **Consumer GPU**: si, el modelo cabe con holgura en cualquier GPU de consumo actual gracias al tamano reducido de las cuantizaciones (Q4_K_M: 481 MB).
- **Opciones de despliegue**: `transcribe.cpp` (CLI `transcribe-cli`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: RTF (real-time factor) de 45,1 en Metal/M4 Max, 4,6 en Vulkan/Ryzen 4750U, 3,2 en CPU/M4 Max y 1,1 en CPU/Ryzen 4750U. Un RTF superior a 1 indica procesamiento mas rapido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato | WER LibriSpeech test-clean |
|---|---|---|---:|---|---|---|
| whisper-medium.en (este repo, GGUF) | ~769 M (familia) | 30 s por ventana, chunked | en | Apache-2.0 | GGUF | 2,72-2,91 % (segun cuantizacion) |
| openai/whisper-medium (multilingue) | ~769 M (familia) | 30 s por ventana, chunked | multilingue | Apache-2.0 | safetensors, GGUF (via terceros) | no disponible en esta informacion |
| openai/whisper-small.en | no disponible en esta informacion | 30 s por ventana | en | Apache-2.0 | safetensors | no disponible en esta informacion |
| openai/whisper-large-v3 | no disponible en esta informacion | 30 s por ventana | multilingue | Apache-2.0 | safetensors | no disponible en esta informacion |

La comparativa se limita a la familia Whisper porque la informacion proporcionada no incluye datos de modelos ASR alternativos (p. ej., Wav2Vec2, Conformer, Parakeet). El dato diferencial de este repositorio es la disponibilidad en GGUF para `transcribe.cpp` con cuantizaciones de hasta 481 MB y WER apenas degradado respecto a F32.

## Limitaciones y advertencias

- **Monolingue**: solo transcribe ingles; no traduce ni detecta idioma (`lang_detect: false`), por lo que audio en otros idiomas producira salidas incorrectas o alucinaciones.
- **Sin streaming**: `streaming: false`; no apto para transcripcion en tiempo real continua sin segmentacion externa.
- **Riesgo de alucinacion**: la model card advierte que las diferencias de WER entre ejecuciones provienen en gran medida de "short-clip hallucination outcomes on the noise floor", es decir, clips cortos con ruido pueden generar texto inventado.
- **No determinismo en Metal**: las reducciones paralelas no deterministas de Metal pueden variar el WER ~0,1 pp entre ejecuciones; no usar para validacion estricta de reproducibilidad.
- **Ventana fija de 30 s**: el audio largo requiere decodificacion por trozos, con posible perdida de contexto entre fragmentos.
- **Repositorio espejo**: el autor del repositorio es xix3r, pero los ficheros enlazados apuntan a `handy-computer/whisper-medium.en-gguf`; conviene verificar la integridad y procedencia antes de usarlo en produccion.
- **Licencia**: Apache-2.0 permite uso comercial, pero los terminos del modelo base de OpenAI son la fuente autoritativa; revisar la model card upstream.
- **Sin datos de sesgo**: la informacion disponible no documenta evaluaciones de sesgo demografico o acustico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xix3r/voxix-whisper-medium.en-gguf
- Modelo base: https://huggingface.co/openai/whisper-medium.en
- Commit upstream fijado: https://huggingface.co/openai/whisper-medium.en/commit/2e98eb6
- Repositorio `transcribe.cpp`: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion `transcribe.cpp` 5.6.1: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Pagina del modelo en `transcribe.cpp`: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-medium.en.md
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI: https://github.com/openai/whisper
- Repositorio de ficheros GGUF referenciado: https://huggingface.co/handy-computer/whisper-medium.en-gguf
