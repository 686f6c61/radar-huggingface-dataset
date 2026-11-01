# tryambientai/whisper-medium-gguf

## Resumen

Whisper medium en formato GGUF es una conversión del modelo de reconocimiento automático del habla (ASR) `openai/whisper-medium` de OpenAI, empaquetada por el usuario tryambientai para su uso con el motor de inferencia transcribe.cpp. El modelo original, presentado en el paper "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., 2022), es un transformer encoder-decoder de aproximadamente 764 millones de parámetros entrenado sobre 680.000 horas de audio etiquetado mediante supervisión débil. Esta conversión concreta mantiene las capacidades del original (transcripción multilingüe, detección de idioma y traducción de voz a inglés) pero las ofrece en un formato optimizado para ejecución local en CPU y GPU.

La relevancia de esta ficha radica en que permite desplegar un modelo ASR de referencia en hardware de consumo: la cuantización Q4_K_M ocupa solo 481 MB y mantiene un WER del 2,59 % en LibriSpeech test-clean, prácticamente idéntico al F32 (2,63 %). El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una conversión reciente y poco difundida, pero validada numéricamente contra la implementación de referencia de transformers en el commit 5.6.1 de transcribe.cpp.

El modelo procesa audio en ventanas de 30 segundos con decodificación por trozos para audio largo, soporta 99 idiomas y hereda la licencia Apache-2.0 del modelo base, lo que lo hace apto para uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 763.874.400 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos con decodificacion por trozos para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 99 idiomas, entre ellos en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

Whisper medium es un transformer encoder-decoder entrenado con 680.000 horas de audio etiquetado mediante supervisión débil a gran escala. El encoder procesa espectrogramas Mel de 80 canales en ventanas de 30 segundos y el decoder genera tokens de texto de forma autorregresiva. El entrenamiento combinó datos de reconocimiento del habla (transcripción en el mismo idioma del audio) y de traducción del habla (audio en cualquier idioma soportado → texto en inglés). La conversión a GGUF no modifica los pesos más allá de la cuantización; el autor indica que el port se realizó desde el commit `abdf7c3` del modelo upstream, fijado el 2026-04-25, y se validó contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp el 2026-04-26.

La innovación práctica de esta conversión es la integración con transcribe.cpp, un motor en C++ que implementa decodificación greedy con `suppress_tokens`, fallback de temperatura y timestamps por segmento. La decodificación por trozos permite transcribir audio de duración arbitraria sin recortar manualmente. El autor reporta que las diferencias de WER frente al número oficial de OpenAI (2,90 %) probablemente se deben a que `model.generate()` usa por defecto `<|notimestamps|>`, mientras que el pipeline de transcribe.cpp ejecuta con timestamps habilitados.

## Capacidades

- Transcripción automática del habla multilingüe en 99 idiomas, incluyendo español, catalán, gallego y euskera.
- Detección automática del idioma del audio (`lang_detect: true`).
- Traducción de voz a inglés desde cualquier idioma soportado (`translate: true`).
- Generación de timestamps a nivel de segmento (`timestamps: segment`).
- Procesamiento de audio largo mediante decodificación por trozos sobre ventanas de 30 segundos.
- No soporta streaming (`streaming: false`): requiere el audio completo o trozos cerrados.
- No dispone de tool calling, function calling ni capacidades de agente; es un modelo puramente ASR.
- No procesa vídeo, imagen ni audio en tiempo real más allá del troceado manual.

## Casos de uso

- Subtitulado automático de vídeo y pódcasts: el modelo genera timestamps por segmento, lo que permite producir ficheros SRT directamente a partir de audio de cualquier duración gracias a la decodificación por trozos.
- Transcripción de reuniones y actas: con 99 idiomas y detección automática, puede procesar reuniones multilingües y producir texto en el idioma original; la cuantización Q4_K_M (481 MB) permite ejecutarlo en portátiles sin GPU dedicada.
- Traducción de contenido audiovisual a inglés: la tarea `translate` convierte audio en cualquier idioma soportado a texto en inglés, útil para indexar contenido internacional en buscadores o sistemas de recomendación.
- Asistentes de voz locales y privados: al ejecutarse con transcribe.cpp en CPU o Metal/Vulkan, el audio no sale del dispositivo, lo que encaja en escenarios con requisitos de privacidad (sanidad, legal, administración pública).
- Generación de transcripciones para accesibilidad: subtitulado en directo diferido de clases, webinars o eventos, con coste cero de API y latencia controlada por el hardware local.
- Preprocesado de datasets de audio para entrenamiento de otros modelos: transcripción masiva por lotes de corpus en 99 idiomas usando la variante F16 (1,44 GB), que mantiene el WER del F32 (2,63 %).
- Análisis de llamadas de atención al cliente: transcripción de grabaciones telefónicas (previa conversión a WAV 16 kHz mono con ffmpeg) para alimentar sistemas de análisis de sentimiento o QA.

## Benchmarks y rendimiento

El autor publica WER sobre el split completo de LibriSpeech test-clean (2.620 utterances) con la decodificación por defecto de transcribe.cpp (greedy, suppress_tokens, temperature fallback, timestamps de segmento habilitados):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 2,85 GB | 2,63 % |
| F16 | 1,44 GB | 2,63 % |
| Q8_0 | 793 MB | 2,64 % |
| Q6_K | 618 MB | 2,59 % |
| Q5_K_M | 556 MB | 2,62 % |
| Q4_K_M | 481 MB | 2,59 % |

Referencia: OpenAI reporta 2,90 % en el mismo split con su propia configuración de evaluación. El autor advierte que las diferencias pueden deberse a que `model.generate()` usa `<|notimestamps|>` por defecto, y que las reducciones paralelas no deterministas de Metal pueden desplazar el WER del corpus en torno a 0,1 pp entre ejecuciones.

Rendimiento (RTF, real-time factor; mayor es mejor):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 41,6 |
| Apple M4 Max | CPU | 3,0 |
| Ryzen 4750U | Vulkan | 4,3 |
| Ryzen 4750U | CPU | 1,1 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 481 MB (Q4_K_M), 556 MB (Q5_K_M), 618 MB (Q6_K), 793 MB (Q8_0), 1,44 GB (F16), 2,85 GB (F32).
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en iGPU y en CPU pura.
- En Apple Silicon funciona con backend Metal; en GPUs AMD/Intel con Vulkan; en CPU con el backend nativo.
- Despliegue: exclusivamente mediante transcribe.cpp (compilación con CMake y binario `transcribe-cli`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que el formato GGUF de esta conversión está adaptado al motor transcribe.cpp.
- Latencia y throughput: el RTF de 41,6 en M4 Max con Metal implica procesar unas 41,6 veces más rápido que tiempo real (1 hora de audio en ~86 segundos); en CPU de M4 Max el RTF es 3,0; en Ryzen 4750U con Vulkan es 4,3 y con CPU 1,1.
- Requiere audio de entrada en WAV mono a 16 kHz; el autor recomienda convertir con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | WER LibriSpeech test-clean |
|---|---:|---|---|---|---|---:|
| whisper-medium (esta conversion) | 764 M | Ventanas de 30 s | 99 | Apache-2.0 | GGUF (transcribe.cpp) | 2,59-2,64 % segun cuantizacion |
| openai/whisper-medium (original) | 764 M | Ventanas de 30 s | 99 | Apache-2.0 | safetensors / PyTorch | 2,90 % (reportado por OpenAI) |
| openai/whisper-small | 244 M | Ventanas de 30 s | 99 | Apache-2.0 | safetensors / PyTorch | no disponible en la informacion proporcionada |
| openai/whisper-large-v3 | 1.550 M | Ventanas de 30 s | 99 | Apache-2.0 | safetensors / PyTorch | no disponible en la informacion proporcionada |

No se dispone de datos de benchmarks de whisper-small ni whisper-large-v3 en la información proporcionada, por lo que la comparación cuantitativa se limita al modelo base y a su versión original.

## Limitaciones y advertencias

- Riesgo de alucinación en clips cortos o con ruido de fondo: el propio autor señala que las diferencias de WER entre ejecuciones en Metal se deben principalmente a "short-clip hallucination outcomes on the noise floor".
- No soporta streaming: requiere audio completo o troceado manual, lo que limita su uso en transcripción en directo sin infraestructura adicional.
- Ventana fija de 30 segundos: el audio largo depende de la decodificación por trozos de transcribe.cpp, que puede introducir errores en las fronteras entre trozos.
- Solo salida de texto: no genera diarización de hablantes ni marcas de puntuación avanzadas más allá de lo que produce el modelo base.
- La traducción solo va hacia inglés; no traduce entre dos idiomas distintos del inglés.
- Repo con 0 descargas y 0 likes: conversión reciente y sin validación comunitaria independiente; conviene verificar los pesos contra el modelo base antes de usarla en producción.
- Dependencia de transcribe.cpp: no es un GGUF estándar de llama.cpp, por lo que no se puede cargar con las herramientas habituales de ese ecosistema.
- Licencia Apache-2.0 heredada del modelo base: permite uso comercial, pero se recomienda revisar la model card original de OpenAI para los términos completos.
- El rendimiento en CPU pura (RTF 1,1 en Ryzen 4750U) es solo ligeramente superior al tiempo real, insuficiente para transcripción masiva sin GPU.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/tryambientai/whisper-medium-gguf
- Repositorio de la conversión de referencia (handy-computer): https://huggingface.co/handy-computer/whisper-medium-gguf
- Modelo base original: https://huggingface.co/openai/whisper-medium
- Commit del modelo base usado: https://huggingface.co/openai/whisper-medium/commit/abdf7c3
- Motor transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-medium.md
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI Whisper: https://github.com/openai/whisper
