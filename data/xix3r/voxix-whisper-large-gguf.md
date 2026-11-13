# xix3r/voxix-whisper-large-gguf

## Resumen

voxix-whisper-large-gguf es una conversión al formato GGUF del modelo openai/whisper-large, publicada por el usuario xix3r para su uso con el runtime transcribe.cpp. Se trata de un modelo de reconocimiento automático del habla (ASR) de tipo encoder-decoder transformer, con 1.543.321.440 parámetros, que hereda las capacidades multilingües del Whisper original: transcripción en 99 idiomas, detección de idioma y traducción de voz a texto en inglés.

El valor de esta ficha no está en el modelo base, sino en el empaquetado: ofrece cuantizaciones GGUF (F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) con pesos que van desde 950 MB hasta 5,75 GB, validadas numéricamente contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp. Esto permite ejecutar un modelo de la familia Whisper large en hardware modesto, incluyendo CPU y GPUs de consumo, algo impracticable con los pesos originales en safetensors.

Es relevante ahora porque transcribe.cpp es una implementación en C++ centrada en eficiencia, con soporte Metal y Vulkan, y porque las cuantizaciones K-quant mantienen el WER prácticamente idéntico al de precisión completa (2,62 % en Q6_K frente a 2,72 % en F32 sobre LibriSpeech test-clean). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que debe considerarse un artefacto reciente y poco validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large) |
| Parametros totales | 1.543.321.440 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | ventanas de audio de 30 segundos con decodificación por chunks para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 99 idiomas (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper large, un transformer encoder-decoder presentado por Radford et al. en el paper "Robust Speech Recognition via Large-Scale Weak Supervision" (arXiv:2212.04356). El encoder procesa espectrogramas Mel de audio en ventanas de 30 segundos y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales para detección de idioma, transcripción, traducción al inglés y marcas de tiempo. El entrenamiento original se realizó sobre 680.000 horas de audio etiquetado, lo que le confiere una capacidad de generalización notable sin fine-tuning.

Esta conversión concreta no reentrena ni modifica la arquitectura: parte del commit 4ef9b41 de openai/whisper-large (fijado el 2026-04-25) y se valida contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp (2026-04-26). La innovación técnica está en el pipeline de decodificación del runtime: greedy decoding con suppress_tokens, temperature fallback y marcas de tiempo a nivel de segmento activadas por defecto. La model card advierte que OpenAI evalúa con `<|notimestamps|>` por defecto, mientras que transcribe.cpp ejecuta con timestamps habilitados, lo que explica pequeñas divergencias en el WER reportado.

## Capacidades

- Transcripción automática de voz a texto en 99 idiomas, incluyendo español, catalán, gallego, euskera y una cobertura amplia de lenguas de bajos recursos.
- Detección automática de idioma (`lang_detect: true`) en el propio pipeline de decodificación.
- Traducción de voz a texto en inglés desde cualquier idioma soportado (`translate: true`).
- Marcas de tiempo a nivel de segmento (`timestamps: segment`), útiles para subtitulado y alineación.
- Procesamiento de audio largo mediante decodificación por chunks sobre ventanas de 30 segundos.
- Ejecución en CPU y GPU a través de transcribe.cpp, con backends Metal y Vulkan.
- No soporta streaming (`streaming: false`); el procesamiento es por fichero o bloque completo.
- No es un modelo de instrucciones ni soporta tool calling; su única tarea es ASR y traducción de voz.

## Casos de uso

- Subtitulado automático de vídeo y audio: el modelo genera marcas de tiempo por segmento, lo que permite producir ficheros SRT o VTT directamente a partir de la salida, con cobertura de 99 idiomas para catálogos internacionales.
- Transcripción de reuniones y actas: con la cuantización Q6_K (1,21 GB) puede ejecutarse en un portátil con CPU, procesando audio de 16 kHz mono convertido previamente con ffmpeg, sin depender de servicios en la nube.
- Traducción de contenido audiovisual a inglés: la capacidad `translate: true` convierte audio en cualquier idioma soportado a texto en inglés, útil para indexación y búsqueda en archivos multimedia multilingües.
- Archivado y búsqueda de grabaciones: transcripción por lotes de horas de audio para generar índices de texto buscables en bibliotecas de podcasts, llamadas o entrevistas.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en aplicaciones de escritorio o embebidas, aprovechando el bajo peso de Q4_K_M (950 MB) para integrarse en dispositivos con recursos limitados.
- Investigación en ASR multilingüe: servir como línea base reproducible en transcribe.cpp para comparar cuantizaciones, medir WER por idioma y validar pipelines de decodificación alternativos.
- Preprocesado para pipelines de NLP: convertir audio a texto antes de pasarlo a modelos de lenguaje para resumen, análisis de sentimiento o extracción de entidades.

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean (2620 utterances), decodificación por defecto de transcribe.cpp (greedy, suppress_tokens, temperature fallback, timestamps de segmento):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 5,75 GB | 2,72 % |
| F16 | 2,89 GB | 2,74 % |
| Q8_0 | 1,55 GB | 2,74 % |
| Q6_K | 1,21 GB | 2,62 % |
| Q5_K_M | 1,08 GB | 2,70 % |
| Q4_K_M | 950 MB | 2,67 % |

Referencia: OpenAI reporta 2,73 % en el mismo split con su propia configuración de evaluación. La model card atribuye las diferencias a que `model.generate()` usa `<|notimestamps|>` por defecto, mientras que transcribe.cpp ejecuta con timestamps. Los números provienen de una única ejecución con backend Metal, cuyas reducciones paralelas no deterministas pueden desplazar el WER del corpus en torno a 0,1 puntos porcentuales entre ejecuciones.

Rendimiento (RTF, real-time factor):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 24,9 |
| Apple M4 Max | CPU | 1,5 |
| AMD Ryzen 4750U | Vulkan | 2,1 |
| AMD Ryzen 4750U | CPU | 0,5 |

## Requisitos de hardware

- VRAM/RAM estimada: 950 MB (Q4_K_M), 1,08 GB (Q5_K_M), 1,21 GB (Q6_K), 1,55 GB (Q8_0), 2,89 GB (F16), 5,75 GB (F32). Cabe holgadamente en GPUs de consumo con 4 GB o más, e incluso en sistemas integrados.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA). No se documentan requisitos específicos de CUDA en la información disponible.
- Cabe en consumer GPU: sí, desde tarjetas de gama baja con 4 GB de VRAM usando Q4_K_M o Q5_K_M.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato GGUF está adaptado al runtime transcribe.cpp.
- Latencia y throughput: RTF de 24,9 en Metal sobre M4 Max y 1,5 en CPU sobre el mismo equipo; 2,1 en Vulkan y 0,5 en CPU sobre Ryzen 4750U. Un RTF superior a 1 indica procesamiento más rápido que tiempo real; los valores inferiores a 1 en CPU implican procesamiento más lento que la reproducción del audio.
- Preprocesado obligatorio: el audio debe ser WAV mono a 16 kHz; la model card proporciona el comando ffmpeg para la conversión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato | WER LibriSpeech test-clean |
|---|---|---|---:|---|---|---:|
| voxix-whisper-large-gguf (Q6_K) | 1,54 B | ventanas de 30 s | 99 | Apache-2.0 | GGUF | 2,62 % |
| openai/whisper-large (original) | 1,55 B | ventanas de 30 s | 99 | Apache-2.0 | safetensors | 2,73 % (reportado por OpenAI) |
| openai/whisper-large-v2 | no disponible en la información | ventanas de 30 s | 99 | Apache-2.0 | safetensors | no disponible en la información |
| handy-computer/whisper-large-gguf | 1,54 B | ventanas de 30 s | 99 | Apache-2.0 | GGUF | 2,62 % (Q6_K, misma conversión de referencia) |

La comparativa con otras familias ASR (por ejemplo, modelos basados en Conformer o wav2vec 2.0) no está disponible en la información proporcionada. La model card recomienda usar whisper-large-v2 en lugar de whisper-large original por su mejor rendimiento tras 2,5 veces más épocas de entrenamiento, aunque no se aportan cifras concretas de esa comparación.

## Limitaciones y advertencias

- El modelo base es whisper-large original, no large-v2 ni large-v3; la propia model card de OpenAI recomienda large-v2 en su lugar por su mejor rendimiento.
- Riesgo de alucinación en pasajes de silencio o ruido de fondo: la model card señala que las variaciones de WER entre ejecuciones en Metal se deben principalmente a "short-clip hallucination outcomes on the noise floor".
- No soporta streaming; la decodificación es por fichero o bloque completo, lo que limita su uso en aplicaciones de transcripción en vivo.
- Requiere audio WAV mono a 16 kHz como entrada; sin el preprocesado con ffmpeg la calidad se degrada o el runtime puede rechazar el fichero.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-13); no hay validación de la comunidad ni informes independientes de calidad.
- La evaluación se limita a LibriSpeech test-clean en inglés; no se publican métricas por idioma ni sobre dominios con acento, ruido o audio telefónico.
- Los pesos apuntan a URLs de handy-computer/whisper-large-gguf en la tabla de descargas, no al repositorio xix3r; conviene verificar la procedencia antes de usarlos en producción.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial, pero sin garantías de idoneidad para dominios específicos.
- El formato GGUF está adaptado a transcribe.cpp; no se garantiza compatibilidad con llama.cpp u otros runtimes GGUF genéricos.
- No dispone de capacidades de instrucciones, tool calling ni razonamiento multi-paso; es exclusivamente un modelo ASR.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xix3r/voxix-whisper-large-gguf
- Modelo base: https://huggingface.co/openai/whisper-large
- Commit del modelo base usado: https://huggingface.co/openai/whisper-large/commit/4ef9b41
- Paper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI: https://github.com/openai/whisper
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-large.md
- Conversión GGUF de referencia: https://huggingface.co/handy-computer/whisper-large-gguf
