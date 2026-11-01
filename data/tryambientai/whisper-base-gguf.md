# tryambientai/whisper-base-gguf

## Resumen

`tryambientai/whisper-base-gguf` es una conversión al formato GGUF del modelo `openai/whisper-base`, empaquetada para su uso con la librería [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp). Se trata de un modelo de reconocimiento automático del habla (ASR) y traducción de voz, basado en la arquitectura encoder-decoder Transformer de OpenAI Whisper, con 72,6 millones de parámetros totales y ventanas de audio de 30 segundos con decodificación por trozos para audio largo.

El modelo resuelve dos tareas principales: transcripción multilingüe (audio en cualquiera de los ~99 idiomas soportados → texto en el mismo idioma) y traducción de voz (audio en cualquier idioma soportado → texto en inglés). Además incorpora detección automática de idioma y marcas de tiempo a nivel de segmento. Su relevancia actual radica en que permite ejecutar Whisper base en hardware modesto (CPU, Metal, Vulkan) con cuantizaciones desde 56 MB (Q4_K_M) hasta 279 MB (F32), manteniendo una tasa de error de palabra (WER) muy cercana a la del modelo original en precisión completa.

Esta ficha describe la conversión GGUF y las características heredadas del modelo base `openai/whisper-base`; los detalles de entrenamiento y evaluación originales provienen de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq), ventanas de 30 s |
| Parametros totales | 72.610.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 s con decodificación por trozos para audio largo (contexto textual en tokens: no disponible) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 99 idiomas (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo base es un Transformer encoder-decoder (secuencia a secuencia) entrenado por OpenAI sobre 680.000 horas de audio etiquetado mediante supervisión débil a gran escala. El encoder procesa espectrogramas de audio en ventanas de 30 segundos y el decoder genera texto autorregresivamente. Los modelos multilingües se entrenaron conjuntamente en tareas de reconocimiento del habla (transcripción en el mismo idioma) y traducción del habla (transcripción al inglés). No se dispone en la información proporcionada de detalles sobre el uso de RLHF/DPO ni sobre la composición exacta del dataset más allá del volumen total.

La conversión a GGUF está portada desde el commit upstream `e37978b` (fijado el 2026-04-25) y validada contra la referencia de transformers en el commit `5.6.1` de transcribe.cpp (2026-04-26). La decodificación por defecto en transcribe.cpp es greedy con `suppress_tokens`, *temperature fallback* y marcas de tiempo de segmento activadas. El modelo soporta detección de idioma y traducción, pero no streaming (`streaming: false`). Las marcas de tiempo se generan a nivel de segmento.

## Capacidades

- Transcripción automática del habla multilingüe en 99 idiomas.
- Traducción de voz: audio en cualquier idioma soportado → texto en inglés.
- Detección automática del idioma del audio.
- Marcas de tiempo a nivel de segmento.
- Decodificación de audio largo mediante troceado en ventanas de 30 s.
- Ejecución en CPU, Metal (Apple Silicon) y Vulkan.
- No soporta streaming en tiempo real (según la model card).
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo ASR, no un LLM generativo de propósito general).
- No dispone de visión ni audio de salida (solo entrada de audio, salida de texto).

## Casos de uso

- **Subtitulado automático de vídeo y pódcast**: el modelo genera transcripciones con marcas de tiempo de segmento, lo que permite alinear subtítulos con el audio. Adecuado para contenido en cualquiera de los 99 idiomas soportados y para traducción de subtítulos al inglés.
- **Transcripción de reuniones y notas de voz**: con ventanas de 30 s y decodificación por trozos, puede procesar grabaciones largas en local sin depender de servicios en la nube, gracias a su reducido tamaño (56-81 MB en cuantizaciones Q4-Q8).
- **Traducción de audio a inglés**: útil para ingesta de contenido en idiomas extranjeros (entrevistas, conferencias) que debe convertirse a texto en inglés para su posterior análisis o indexación.
- **Procesamiento por lotes en servidores sin GPU**: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar la transcripción en CPU (por ejemplo, Ryzen 4750U con Vulkan o CPU) con un rendimiento aceptable para lotes de audio.
- **Aplicaciones de accesibilidad**: generación de transcripciones en tiempo casi real en dispositivos de gama media o en el propio dispositivo (edge), sin enviar audio a terceros, lo que ayuda a cumplir requisitos de privacidad.
- **Preprocesamiento de datasets de voz**: conversión masiva de audio a texto para construir corpus etiquetados o para alimentar pipelines de NLP posteriores (búsqueda, resumen, análisis de sentimiento) en múltiples idiomas.
- **Detección de idioma en pipelines de enrutamiento**: usar la capacidad de detección automática para dirigir el audio al modelo o al equipo adecuado antes de la transcripción completa.

## Benchmarks y rendimiento

Datos publicados en la model card de la conversión (WER sobre LibriSpeech test-clean completo, 2620 enunciados, decodificación por defecto de transcribe.cpp):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 279 MB | 5,10 % |
| F16 | 144 MB | 5,10 % |
| Q8_0 | 81 MB | 5,12 % |
| Q6_K | 65 MB | 5,12 % |
| Q5_K_M | 61 MB | 5,19 % |
| Q4_K_M | 56 MB | 5,36 % |

El dato autoinformado por OpenAI para el mismo split es 5,009 %. La diferencia se atribuye probablemente a que `model.generate()` de OpenAI usa por defecto `<|notimestamps|>`, mientras que el pipeline de transcribe.cpp ejecuta con marcas de tiempo activadas. Los números provienen de una única ejecución con backend Metal; las reducciones paralelas no deterministas de Metal pueden desplazar el WER del corpus ~0,1 pp entre ejecuciones.

Rendimiento (RTF, *real-time factor*, según la model card):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 209,4 |
| Apple M4 Max | CPU | 36,6 |
| AMD Ryzen 4750U | Vulkan | 34,8 |
| AMD Ryzen 4750U | CPU | 11,9 |

No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) porque el modelo es un sistema ASR, no un LLM de propósito general.

## Requisitos de hardware

- **VRAM/RAM estimada para inferencia**: desde ~56 MB (Q4_K_M) hasta ~279 MB (F32); en la práctica, el consumo de memoria es muy bajo y dominado por el búfer de audio y el runtime.
- **GPU recomendadas**: no requiere GPU dedicada; funciona en Apple Silicon (Metal), GPUs con soporte Vulkan y CPU. Para altas cargas, una GPU de consumo moderna (por ejemplo, RTX 4090) o una A100/H100 no son necesarias para este tamaño, pero podrían usarse para maximizar throughput en lotes.
- **¿Cabe en GPU de consumo?**: sí, con enorme holgura; cualquier GPU de consumo con al menos unos cientos de MB libres puede ejecutarlo.
- **Opciones de despliegue**: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake. No se mencionan en la información proporcionada integraciones con vLLM, llama.cpp, Ollama o TGI (son runtimes para LLM, no para este modelo ASR).
- **Latencia y throughput estimados**: RTF de 209,4 en M4 Max con Metal (es decir, procesa ~209 veces más rápido que tiempo real), 36,6 en M4 Max con CPU, 34,8 en Ryzen 4750U con Vulkan y 11,9 en Ryzen 4750U con CPU. La entrada debe ser WAV mono a 16 kHz (convertible con ffmpeg).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato / runtime |
|---|---:|---|---|---|---|
| `tryambientai/whisper-base-gguf` (este) | 72,6 M | 30 s por ventana, troceado para audio largo | 99 | Apache-2.0 | GGUF / transcribe.cpp |
| `openai/whisper-base` (original) | 72,6 M | 30 s por ventana | 99 | Apache-2.0 | safetensors / transformers |
| `openai/whisper-small` | 244 M | 30 s por ventana | 99 | Apache-2.0 | safetensors / transformers |
| `openai/whisper-tiny` | 39 M | 30 s por ventana | 99 | Apache-2.0 | safetensors / transformers |

El modelo original y esta conversión comparten arquitectura y pesos; la diferencia es el formato y el runtime (GGUF + transcribe.cpp frente a safetensors + transformers). Whisper-small ofrece mayor precisión a costa de ~3,4 veces más parámetros y mayor consumo; Whisper-tiny es más ligero pero con mayor WER. No se dispone en la información proporcionada de WER comparativo para whisper-small ni whisper-tiny en el mismo pipeline.

## Limitaciones y advertencias

- **Sesgos**: al entrenarse con 680.000 horas de datos web débilmente supervisados, puede heredar sesgos de dominio, acento y demografía presentes en esos datos; no se detallan en la información proporcionada.
- **Riesgo de alucinación**: la model card menciona "short-clip hallucination outcomes on the noise floor" como causa de variación del WER; en clips cortos o con ruido, el modelo puede generar texto inventado.
- **Limitaciones de contexto e idioma**: ventanas de 30 s; el audio largo requiere troceado y puede perder coherencia entre segmentos. El rendimiento varía notablemente entre los 99 idiomas (no se aportan WER por idioma).
- **Sin streaming**: `streaming: false`; no es adecuado para transcripción en tiempo real continua sin un pipeline de troceado propio.
- **Restricciones de licencia**: Apache-2.0, permisiva para uso comercial, heredada del modelo base. Verificar términos upstream en la model card de `openai/whisper-base`.
- **Caveats de producción**: requiere audio WAV mono a 16 kHz (conversión previa con ffmpeg); los resultados en Metal pueden variar ~0,1 pp de WER entre ejecuciones por reducciones no deterministas; el repositorio tiene 0 descargas y 0 likes, por lo que su adopción y mantenimiento comunitario son mínimos.
- **Formato**: es una conversión GGUF para un runtime específico (transcribe.cpp); no es directamente cargable en transformers sin reconversión.

## Enlaces

- HuggingFace: https://huggingface.co/tryambientai/whisper-base-gguf
- Modelo base: https://huggingface.co/openai/whisper-base
- Commit upstream del modelo base: https://huggingface.co/openai/whisper-base/commit/e37978b
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp 5.6.1: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-base.md
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI Whisper: https://github.com/openai/whisper
- Descargas GGUF (referenciadas en la model card): https://huggingface.co/handy-computer/whisper-base-gguf/resolve/main/whisper-base-F32.gguf , https://huggingface.co/handy-computer/whisper-base-gguf/resolve/main/whisper-base-F16.gguf , https://huggingface.co/handy-computer/whisper-base-gguf/resolve/main/whisper-base-Q8_0.gguf , https://huggingface.co/handy-computer/whisper-base-gguf/resolve/main/whisper-base-Q6_K.gguf , https://huggingface.co/handy-computer/whisper-base-gguf/resolve/main/whisper-base-Q5_K_M.gguf , https://huggingface.co/handy-computer/whisper-base-gguf/resolve/main/whisper-base-Q4_K_M.gguf
