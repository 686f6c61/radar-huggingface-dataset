# xix3r/voxix-whisper-large-v2-gguf

## Resumen

voxix-whisper-large-v2-gguf es una conversión a formato GGUF del modelo openai/whisper-large-v2, publicada por el usuario xix3r y destinada a su uso con el runtime transcribe.cpp. No se trata de un modelo nuevo: es una cuantización del checkpoint original de OpenAI, fijada al commit ae46427 (25 de abril de 2026) y validada contra la implementación de referencia de transformers en la versión 5.6.1 de transcribe.cpp. El modelo base es un transformer encoder-decoder para reconocimiento automático del habla (ASR) y traducción de voz, con 1.543.321.440 parámetros (aproximadamente 1,54 mil millones).

La relevancia de esta ficha es práctica: el repositorio ofrece seis niveles de cuantización (F32, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) con pesos que van de 5,75 GB a 950 MB, lo que permite ejecutar un modelo Whisper large en hardware modesto, incluidos equipos de consumo. El autor publica además métricas de WER sobre LibriSpeech test-clean y tasas de tiempo real (RTF) medidas en Apple M4 Max y AMD Ryzen 4750U, lo que facilita estimar viabilidad de despliegue antes de descargar.

El modelo soporta 99 idiomas, detección automática de idioma, marcas de tiempo a nivel de segmento y traducción de voz a texto en inglés. La licencia es Apache-2.0, heredada del modelo base, lo que permite uso comercial sin restricciones adicionales. La ventana de audio es de 30 segundos por chunk, con decodificación encadenada para audio de formato largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v2) |
| Parametros totales | 1.543.321.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 s con decodificacion por chunks para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 99 idiomas (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder-decoder secuencia-a-secuencia entrenado por OpenAI sobre 680.000 horas de audio etiquetado mediante supervisión débil a gran escala. La variante large-v2 se entrenó durante 2,5 veces más épocas que la large original, con regularización adicional para mejorar el rendimiento. El encoder procesa espectrogramas Mel de ventanas de 30 segundos y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales para idioma, tarea (transcripción o traducción) y marcas de tiempo.

Esta conversión concreta no reentrena ni modifica los pesos más allá de la cuantización. El autor documenta que los pesos se portaron desde el commit ae46427 del modelo original y se validaron numéricamente contra la referencia de transformers con transcribe.cpp 5.6.1 el 26 de abril de 2026. La decodificación por defecto en transcribe.cpp es greedy con suppress_tokens, fallback de temperatura y marcas de tiempo de segmento activadas, lo que difiere del `model.generate()` de OpenAI (que por defecto usa `<|notimestamps|>`) y explica parte de las diferencias de WER observadas. No hay información sobre RLHF ni DPO en esta conversión, ya que el modelo base es un ASR supervisado y no un modelo de lenguaje instruido.

## Capacidades

- Transcripción de voz a texto multilingüe en 99 idiomas, sin necesidad de fine-tuning.
- Detección automática de idioma (`lang_detect: true`).
- Traducción de voz a texto en inglés desde cualquiera de los idiomas soportados (`translate: true`).
- Marcas de tiempo a nivel de segmento (`timestamps: segment`), útiles para subtitulado y alineación.
- Procesamiento de audio largo mediante decodificación por chunks de 30 segundos.
- No soporta streaming (`streaming: false`): requiere audio completo o chunks cerrados.
- No es un modelo de chat ni soporta tool calling, function calling ni razonamiento multi-paso: es exclusivamente ASR y traducción de voz.
- No tiene capacidades de visión, audio generativo ni salida de audio.

## Casos de uso

- Subtitulado automático de vídeo y audio: el modelo genera marcas de tiempo por segmento, lo que permite producir ficheros SRT/VTT directamente desde la salida de transcribe.cpp sin post-procesado de alineación.
- Transcripción de reuniones y entrevistas: con la cuantización Q8_0 (1,55 GB) se puede ejecutar en portátiles y procesar audio largo por chunks, manteniendo un WER de 2,65 % en LibriSpeech test-clean.
- Traducción de contenido audiovisual a inglés: la tarea `translate` convierte audio en cualquier idioma soportado a texto en inglés, útil para indexación y búsqueda de archivos multilingües.
- Despliegue en dispositivos de borde: la cuantización Q4_K_M ocupa 950 MB y mantiene un WER de 2,46 %, lo que permite ASR local en equipos sin GPU dedicada o en entornos con restricciones de memoria.
- Archivado y búsqueda de grabaciones: transcripción masiva por lotes con detección automática de idioma, sin necesidad de configurar el idioma por fichero.
- Accesibilidad: generación de transcripciones para contenido educativo o institucional, con la ventaja de la licencia Apache-2.0 para uso comercial y modificación.
- Integración en pipelines de datos: al ser GGUF y ejecutarse con transcribe.cpp (binario CLI y librería), se puede invocar desde scripts de procesamiento por lotes con ffmpeg para normalizar la entrada a 16 kHz mono WAV.

## Benchmarks y rendimiento

El autor publica WER sobre la partición completa de LibriSpeech test-clean (2620 utterances) con la decodificación por defecto de transcribe.cpp (greedy, suppress_tokens, fallback de temperatura, marcas de tiempo activadas):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 5,75 GB | 2,68 % |
| F16 | 2,89 GB | 2,68 % |
| Q8_0 | 1,55 GB | 2,65 % |
| Q6_K | 1,21 GB | 2,83 % |
| Q5_K_M | 1,08 GB | 2,72 % |
| Q4_K_M | 950 MB | 2,46 % |

El número autoinformado por OpenAI para el mismo split es 2,83 %. El autor señala que la diferencia probable se debe a que `model.generate()` de OpenAI usa `<|notimestamps|>` por defecto, mientras que transcribe.cpp ejecuta con marcas de tiempo. Las cifras provienen de una única ejecución sobre Metal, cuya reducción paralela no determinista puede desplazar el WER del corpus en torno a 0,1 puntos porcentuales entre ejecuciones.

Tasas de tiempo real (RTF) publicadas:

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 23,7 |
| Apple M4 Max | CPU | 1,5 |
| AMD Ryzen 4750U | Vulkan | 2,1 |
| AMD Ryzen 4750U | CPU | 0,6 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo es exclusivamente ASR.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más overhead del runtime. Q4_K_M ~950 MB, Q5_K_M ~1,08 GB, Q6_K ~1,21 GB, Q8_0 ~1,55 GB, F16 ~2,89 GB, F32 ~5,75 GB.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) con al menos 2 GB de memoria para cuantizaciones Q4–Q8. Para F16/F32 se recomienda 4–8 GB.
- Cabe en GPU de consumo: sí, con Q4_K_M, Q5_K_M, Q6_K y Q8_0 en tarjetas con 2 GB o más (GTX 1650, RTX 3050, RTX 4060, iGPU recientes). F16 requiere al menos 4 GB y F32 al menos 8 GB.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli` y librería), compilado con CMake. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible; el formato GGUF es específico de transcribe.cpp en este repositorio.
- Latencia y throughput: RTF 23,7 en M4 Max con Metal y 2,1 en Ryzen 4750U con Vulkan (valores mayores indican más rápido que tiempo real). En CPU, RTF 1,5 en M4 Max y 0,6 en Ryzen 4750U, es decir, por debajo de tiempo real en el segundo caso.
- Requiere entrada de audio a 16 kHz mono WAV; el autor recomienda convertir con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato | Notas |
|---|---|---:|---|---|---|---|
| voxix-whisper-large-v2-gguf (este) | 1,54 B | 30 s por chunk | 99 | Apache-2.0 | GGUF | Cuantizaciones Q4–F32, WER 2,46–2,83 % en LibriSpeech test-clean |
| openai/whisper-large-v2 | 1,54 B | 30 s por chunk | 99 | Apache-2.0 | safetensors/PyTorch | Modelo original; requiere transformers y mayor huella de memoria |
| openai/whisper-large-v3 | no disponible en la informacion | 30 s por chunk | 99 | Apache-2.0 | safetensors/PyTorch | Versión posterior de OpenAI; no se dispone de datos comparativos en la información proporcionada |
| handy-computer/whisper-large-v2-gguf | 1,54 B | 30 s por chunk | 99 | Apache-2.0 | GGUF | Repositorio upstream de conversión citado por el autor; mismos ficheros de descarga referenciados |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada más allá del 2,83 % autoinformado por OpenAI para whisper-large-v2.

## Limitaciones y advertencias

- Es un modelo exclusivamente ASR: no genera texto libre, no razona, no soporta tool calling ni agentes. No debe evaluarse como LLM.
- No soporta streaming (`streaming: false`); requiere audio cerrado o chunks completos, lo que añade latencia en aplicaciones en tiempo real.
- Riesgo de alucinación en clips cortos o con ruido: el autor atribuye parte de la variabilidad del WER (~0,1 pp entre ejecuciones) a "short-clip hallucination outcomes on the noise floor".
- El WER publicado corresponde a LibriSpeech test-clean, un corpus de lectura en inglés relativamente limpio; el rendimiento en audio espontáneo, con acentos o ruido de fondo puede degradarse notablemente y no se documenta en esta ficha.
- Diferencias de decodificación respecto a OpenAI (`<|notimestamps|>` vs marcas de tiempo) hacen que los WER no sean directamente comparables con los publicados por OpenAI.
- La validación numérica se hizo contra transformers en una versión concreta (transcribe.cpp 5.6.1); cambios de versión del runtime pueden alterar resultados.
- Requiere audio de entrada a 16 kHz mono WAV; no acepta directamente MP3, vídeo ni otros formatos sin preprocesado.
- Licencia Apache-2.0 permite uso comercial, pero se heredan las limitaciones y consideraciones éticas del modelo base de OpenAI (sesgos en el reconocimiento según acento, dialecto y calidad de audio).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 13 de noviembre de 2026; se trata de una conversión reciente sin validación comunitaria independiente más allá de la del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xix3r/voxix-whisper-large-v2-gguf
- Modelo base: https://huggingface.co/openai/whisper-large-v2
- Commit del modelo base fijado: https://huggingface.co/openai/whisper-large-v2/commit/ae46427
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Versión de transcribe.cpp usada para validación: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-large-v2.md
- Repositorio upstream de conversión GGUF: https://huggingface.co/handy-computer/whisper-large-v2-gguf
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Código original de OpenAI: https://github.com/openai/whisper
