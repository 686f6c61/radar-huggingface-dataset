# tryambientai/whisper-small-gguf

## Resumen

`tryambientai/whisper-small-gguf` es una conversión al formato GGUF del modelo `openai/whisper-small` para su uso con el runtime `transcribe.cpp`, una implementación en C++ orientada a inferencia local de modelos de reconocimiento automático del habla. El modelo original es un transformer encoder-decoder desarrollado por OpenAI, presentado en el artículo "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., 2022), entrenado sobre 680 000 horas de audio etiquetado mediante supervisión débil. Esta conversión no modifica los pesos ni el comportamiento del modelo base: solo los empaqueta en GGUF con distintas cuantizaciones para reducir el espacio en disco y el coste computacional.

La relevancia de esta ficha radica en que permite ejecutar un modelo ASR multilingüe de 241,7 millones de parámetros en hardware modesto, incluyendo CPU y GPUs de consumo, con una degradación de precisión mínima respecto al modelo en precisión completa. Según los datos del autor, la cuantización Q4_K_M ocupa 164 MB y eleva el WER en LibriSpeech test-clean de 3,33 % (F32) a 3,40 %, lo que la convierte en una opción práctica para despliegues con restricciones de memoria.

El modelo soporta transcripción en más de 90 idiomas, detección automática de idioma y traducción de voz a texto en inglés. No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y los enlaces de descarga del README apuntan al repositorio `handy-computer/whisper-small-gguf`, no al de `tryambientai`, lo que conviene verificar antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) |
| Parametros totales | 241.751.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos con decodificación por trozos para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 90+ idiomas, incluyendo en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder-decoder con atención completa, diseñado para recibir espectrogramas Mel de audio y generar tokens de texto de forma autorregresiva. Procesa audio en ventanas de 30 segundos y, para grabaciones más largas, aplica decodificación por trozos (chunked long-form decoding). El entrenamiento original de OpenAI utilizó 680 000 horas de audio etiquetado mediante supervisión débil, combinando datos English-only y multilingües; los modelos multilingües se entrenaron tanto para reconocimiento del habla (transcripción en el mismo idioma del audio) como para traducción de voz a inglés.

Esta conversión concreta no introduce cambios arquitectónicos ni reentrenamiento: es una cuantización de los pesos originales, portada desde el commit `973afd2` de `openai/whisper-small` (fijado el 2026-04-25) y validada contra la referencia de transformers en el commit `5.6.1` de `transcribe.cpp` (2026-04-26). El runtime `transcribe.cpp` implementa la inferencia en C++ con soporte para Metal y Vulkan, y su pipeline por defecto aplica decodificación greedy con `suppress_tokens`, fallback de temperatura y marcas de tiempo a nivel de segmento. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación adicionales sobre el modelo base.

## Capacidades

- Transcripción automática del habla (ASR) en el mismo idioma del audio, con salida de texto plano.
- Traducción de voz a texto en inglés desde cualquiera de los idiomas soportados (`translate: true`).
- Detección automática de idioma (`lang_detect: true`).
- Generación de marcas de tiempo a nivel de segmento (`timestamps: segment`).
- Procesamiento de audio largo mediante decodificación por trozos sobre ventanas de 30 segundos.
- Cobertura multilingüe amplia: más de 90 idiomas listados en la model card, con especial solidez en inglés y principales lenguas europeas y asiáticas.
- No soporta streaming (`streaming: false`): requiere el audio completo o troceado externamente antes de la inferencia.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión ni audio generation; es exclusivamente un modelo ASR/traducción.

## Casos de uso

- Subtitulado automático de vídeo y pódcast: el modelo genera marcas de tiempo por segmento, lo que permite producir archivos SRT o VTT directamente a partir de audio de 30 segundos por ventana, con la ventaja de que la cuantización Q8_0 (257 MB) mantiene un WER de 3,33 %, idéntico al de F32.
- Transcripción de reuniones y notas de voz en local: al ejecutarse con `transcribe.cpp` en CPU o GPU de consumo, permite procesar audio sin enviarlo a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Traducción de contenido audiovisual a inglés: la capacidad `translate: true` permite convertir audio en cualquiera de los idiomas soportados a texto en inglés, útil para equipos que consumen contenido en otros idiomas y necesitan una primera versión en inglés.
- Indexación y búsqueda de archivos de audio: la transcripción con marcas de tiempo segmentadas facilita la creación de índices buscables sobre archivos de audio o vídeo, por ejemplo en sistemas de gestión documental o archivos de medios.
- Detección de idioma en pipelines de enrutamiento: `lang_detect: true` permite clasificar el idioma de una grabación antes de derivarla a un transcriptor específico o a un agente humano, con un coste de 164 MB en Q4_K_M.
- Prototipado y evaluación de sistemas ASR: al estar disponible en múltiples cuantizaciones con WER medido, sirve como referencia ligera para comparar pipelines propios o para validar integraciones en C++ antes de escalar a modelos mayores.
- Transcripción en dispositivos de borde: con 164 MB en Q4_K_M y soporte Vulkan en CPU/GPU integradas (RTF 12,1 en Ryzen 4750U vía Vulkan), es viable en equipos sin GPU dedicada.

## Benchmarks y rendimiento

Datos de WER sobre LibriSpeech test-clean (2620 utterances) con la decodificación por defecto de `transcribe.cpp` (greedy, `suppress_tokens`, fallback de temperatura, timestamps de segmento activados):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 924 MB | 3,33 % |
| F16 | 470 MB | 3,34 % |
| Q8_0 | 257 MB | 3,33 % |
| Q6_K | 202 MB | 3,33 % |
| Q5_K_M | 185 MB | 3,37 % |
| Q4_K_M | 164 MB | 3,40 % |

El dato autodeclarado por OpenAI para el mismo split es 3,432 %. El autor señala que la diferencia puede deberse a que `model.generate()` de OpenAI usa `<|notimestamps|>` por defecto, mientras que el pipeline de `transcribe.cpp` ejecuta con timestamps activados. Las cifras provienen de una única ejecución con backend Metal, cuyas reducciones paralelas no deterministas pueden desplazar el WER del corpus en torno a 0,1 pp entre ejecuciones.

Rendimiento en tiempo real (RTF, menor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 99,2 |
| Apple M4 Max | CPU | 9,8 |
| AMD Ryzen 4750U | Vulkan | 12,1 |
| AMD Ryzen 4750U | CPU | 3,4 |

No se han publicado resultados de benchmarks en la información disponible para otras tareas (p. ej. FLEURS, Common Voice) ni comparativas directas con otros modelos ASR.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 164 MB (Q4_K_M) y 924 MB (F32) solo para los pesos; hay que añadir el buffer de activaciones y el audio de entrada, por lo que en la práctica conviene reservar al menos 2 veces el tamaño del archivo.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. El runtime soporta Metal (Apple Silicon) y Vulkan (GPUs integradas y dedicadas compatibles).
- Cabe en GPU de consumo: sí, cualquier GPU con al menos 1-2 GB de memoria libre puede ejecutar las cuantizaciones Q4_K_M a Q8_0; también funciona en CPU.
- Opciones de despliegue: `transcribe.cpp` (CLI `transcribe-cli`), compilado desde fuente con CMake. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato GGUF está adaptado a `transcribe.cpp`.
- Latencia y throughput: RTF de 99,2 en Metal sobre M4 Max, 12,1 en Vulkan sobre Ryzen 4750U, 9,8 en CPU sobre M4 Max y 3,4 en CPU sobre Ryzen 4750U. Un RTF mayor indica mayor velocidad relativa; conviene interpretar estos valores según la definición exacta del runtime.
- Requisito de entrada: audio en WAV mono a 16 kHz; para otras fuentes hay que convertir con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato | WER LibriSpeech test-clean |
|---|---:|---|---|---|---|---:|
| whisper-small-gguf (esta ficha) | 241,7 M | 30 s por ventana, chunked | 90+ | Apache-2.0 | GGUF | 3,33 % (F32) / 3,40 % (Q4_K_M) |
| openai/whisper-small (original) | 241,7 M | 30 s por ventana | 90+ | Apache-2.0 | safetensors / PyTorch | 3,432 % (autodeclarado) |
| openai/whisper-base | 74 M | 30 s por ventana | 90+ | Apache-2.0 | safetensors / PyTorch | no disponible en esta información |
| openai/whisper-medium | 769 M | 30 s por ventana | 90+ | Apache-2.0 | safetensors / PyTorch | no disponible en esta información |

La comparación con `whisper-base` y `whisper-medium` se incluye por ser alternativas del mismo linaje y licencia, pero no se dispone de sus cifras de WER en la información proporcionada. Frente al modelo original, la conversión GGUF ofrece el mismo rendimiento con menor huella de memoria y un runtime en C++ sin dependencias de Python.

## Limitaciones y advertencias

- El repositorio `tryambientai/whisper-small-gguf` tiene 0 descargas y 0 likes, y los enlaces de descarga del README apuntan a `handy-computer/whisper-small-gguf`; verifica la procedencia de los archivos antes de usarlos en producción.
- No soporta streaming: requiere audio completo o troceado externo, lo que limita su uso en aplicaciones de transcripción en vivo.
- Ventana de audio fija de 30 segundos; el audio largo se procesa por trozos, con posible pérdida de contexto entre segmentos y errores en los límites.
- Riesgo de alucinación en clips cortos o con ruido de fondo: el propio autor indica que las diferencias de WER entre ejecuciones se deben en gran medida a "short-clip hallucination outcomes on the noise floor".
- El WER de referencia es sobre LibriSpeech test-clean (inglés leído y limpio); el rendimiento en audio real con acentos, ruido o idiomas menos representados puede degradarse sustancialmente.
- No se documentan sesgos específicos del modelo en la información disponible; al ser un modelo entrenado con datos web a gran escala, es esperable un sesgo hacia variedades del inglés y hacia dominios sobrerrepresentados.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene revisar los términos del modelo base en `openai/whisper-small` por si hubiera condiciones adicionales.
- El runtime `transcribe.cpp` está en desarrollo activo (validado en el commit 5.6.1); la API y el formato pueden cambiar.
- No se dispone de información sobre el proceso de cuantización más allá de los tipos listados, ni de validación numérica independiente de la reportada por el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tryambientai/whisper-small-gguf
- Modelo base: https://huggingface.co/openai/whisper-small
- Commit del modelo base: https://huggingface.co/openai/whisper-small/commit/973afd2
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit validado de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-small.md
- Repositorio alternativo de descargas: https://huggingface.co/handy-computer/whisper-small-gguf
- Artículo original: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI: https://github.com/openai/whisper
