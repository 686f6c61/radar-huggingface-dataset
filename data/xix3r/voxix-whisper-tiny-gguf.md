# xix3r/voxix-whisper-tiny-gguf

## Resumen

voxix-whisper-tiny-gguf es una conversión al formato GGUF del modelo openai/whisper-tiny, publicada por el usuario xix3r para su uso con el runtime transcribe.cpp. Se trata de un modelo de reconocimiento automático del habla (ASR) y traducción de voz, basado en la arquitectura encoder-decoder transformer de Whisper, con 37.777.120 parámetros totales y ventanas de audio de 30 segundos con decodificación por trozos para audio de larga duración.

El modelo resuelve dos tareas principales: transcripción multilingüe (audio en cualquiera de los idiomas soportados a texto en el mismo idioma) y traducción de voz (audio en cualquier idioma soportado a texto en inglés). Además incluye detección automática de idioma y marcas de tiempo a nivel de segmento. Su relevancia radica en que ofrece las capacidades del Whisper tiny original en un formato optimizado para inferencia local en CPU y GPU de gama baja, con cuantizaciones que van desde 42 MB hasta 146 MB.

La conversión se realizó a partir del commit upstream 169d4a4 de openai/whisper-tiny (fijado el 2026-04-25) y se validó contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp el 2026-04-26. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 37.777.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos con decodificacion por trozos para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 99 idiomas, entre ellos en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Whisper es un transformer encoder-decoder entrenado sobre 680.000 horas de datos de habla etiquetados mediante supervisión débil a gran escala. Los modelos multilingües se entrenaron tanto para reconocimiento del habla (transcripción en el mismo idioma que el audio) como para traducción de voz (transcripción a un idioma distinto, en este caso al inglés). El modelo base whisper-tiny es la variante más pequeña de la familia Whisper de OpenAI, descrita en el paper *Robust Speech Recognition via Large-Scale Weak Supervision* (Radford et al., arXiv:2212.04356).

La conversión a GGUF no modifica la arquitectura ni los pesos más allá de la cuantización. El pipeline de transcribe.cpp opera con decodificación greedy, supresión de tokens, fallback de temperatura y marcas de tiempo de segmento activadas. La conversión se validó numéricamente contra la implementación de referencia de transformers. No se dispone de información sobre datos adicionales de entrenamiento o ajuste posteriores a la publicación del modelo base.

## Capacidades

- Transcripción automática del habla multilingüe en 99 idiomas, incluyendo español, catalán, gallego, euskera y la mayoría de lenguas europeas y asiáticas principales.
- Traducción de voz: audio en cualquier idioma soportado a texto en inglés.
- Detección automática de idioma del audio de entrada.
- Marcas de tiempo a nivel de segmento.
- Procesamiento de audio de larga duración mediante decodificación por trozos sobre ventanas de 30 segundos.
- No soporta streaming (indicado explícitamente como `streaming: false` en la model card).
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso; es exclusivamente un modelo ASR/traducción.

## Casos de uso

- Subtitulado automático de vídeo en local: el modelo genera transcripciones con marcas de tiempo de segmento, adecuadas para generar ficheros de subtítulos en herramientas de edición o pipelines de publicación.
- Transcripción de reuniones y notas de voz en dispositivos de gama baja: con cuantización Q4_K_M (42 MB), puede ejecutarse en CPU sin GPU dedicada, lo que permite desplegarlo en portátiles o sistemas embebidos.
- Traducción de audio a inglés para investigación multilingüe: dado un audio en cualquiera de los 99 idiomas soportados, el modelo produce texto en inglés, útil para normalizar corpus de audio de distintas procedencias.
- Detección de idioma en archivos de audio: la capacidad de language detection permite clasificar automáticamente grabaciones por idioma antes de enrutarlas a otros sistemas.
- Preprocesado de datos de voz para entrenamiento de otros modelos: transcripciones rápidas de grandes volúmenes de audio con un coste computacional mínimo gracias al tamaño reducido del modelo.
- Prototipado y validación de pipelines ASR: al ser una conversión validada numéricamente contra transformers, sirve para verificar integraciones de transcribe.cpp antes de escalar a modelos Whisper de mayor tamaño.
- Aplicaciones de accesibilidad en tiempo casi real: transcripción de conversaciones presenciales en un dispositivo local, con latencia baja en hardware Apple Silicon (RTF 302,1 en Metal sobre M4 Max).

## Benchmarks y rendimiento

Resultados de WER sobre LibriSpeech test-clean (2620 utterances) con la decodificación por defecto de transcribe.cpp:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 146 MB | 7,54 % |
| F16 | 76 MB | 7,49 % |
| Q8_0 | 44 MB | 7,53 % |
| Q6_K | 43 MB | 7,63 % |
| Q5_K_M | 42 MB | 7,63 % |
| Q4_K_M | 42 MB | 7,76 % |

El dato autodeclarado por OpenAI sobre el mismo split es 7,54 %. La model card señala que la diferencia puede deberse a que `model.generate()` de OpenAI usa por defecto `<|notimestamps|>` mientras que el pipeline de transcribe.cpp ejecuta con marcas de tiempo activadas. Los números provienen de una única ejecución sobre Metal, cuyas reducciones paralelas no deterministas pueden desplazar el WER del corpus en torno a 0,1 puntos porcentuales entre ejecuciones.

Rendimiento en tiempo real (RTF, mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 302,1 |
| Apple M4 Max | CPU | 76,1 |
| AMD Ryzen 4750U | Vulkan | 61 |
| AMD Ryzen 4750U | CPU | 24,8 |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 42 MB (Q4_K_M) y 146 MB (F32) para los pesos; el consumo adicional de memoria es mínimo dado el tamaño del modelo.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) es suficiente; no se requiere una GPU de datacenter.
- Cabe en cualquier GPU de consumo, incluida una iGPU, y también funciona únicamente en CPU.
- Opciones de despliegue: transcribe.cpp (runtime nativo para el que está empaquetado el GGUF). No se indica compatibilidad con llama.cpp, Ollama, vLLM ni TGI en la información disponible.
- Latencia y throughput: RTF de 302,1 en Metal sobre M4 Max, 76,1 en CPU sobre M4 Max, 61 en Vulkan sobre Ryzen 4750U y 24,8 en CPU sobre Ryzen 4750U. Un RTF superior a 1 indica procesamiento más rápido que el tiempo real.
- Requiere audio de entrada en WAV mono a 16 kHz; la model card recomienda convertir con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| voxix-whisper-tiny-gguf | 37,8 M | ventanas de 30 s | 99 | Apache-2.0 | GGUF |
| openai/whisper-tiny | 37,8 M | ventanas de 30 s | 99 | Apache-2.0 | safetensors/bin |
| openai/whisper-base | 74,4 M | ventanas de 30 s | 99 | Apache-2.0 | safetensors/bin |
| openai/whisper-small | 244 M | ventanas de 30 s | 99 | Apache-2.0 | safetensors/bin |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada. La comparativa se limita a parámetros, contexto de audio, idiomas, licencia y formato, que son los datos disponibles.

## Limitaciones y advertencias

- Al ser la variante tiny de Whisper, la precisión es notablemente inferior a la de modelos mayores de la misma familia; el WER de 7,54 % en LibriSpeech test-clean debe interpretarse en ese contexto y empeora en audio con ruido, acentos marcados o dominios alejados del corpus de entrenamiento.
- Riesgo de alucinación en clips cortos o con relación señal-ruido baja; la propia model card atribuye parte de la variabilidad del WER a "short-clip hallucination outcomes on the noise floor".
- No soporta streaming; está pensado para procesar ficheros de audio completos o por ventanas, no para transcripción en tiempo real continua.
- La decodificación por defecto de transcribe.cpp activa marcas de tiempo, lo que puede producir diferencias de WER respecto a la configuración de referencia de OpenAI.
- El modelo no incluye tool calling, agentes ni razonamiento multi-paso; cualquier caso de uso que requiera esas capacidades debe combinarse con otro modelo.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar los términos completos en la model card de openai/whisper-tiny.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB; la disponibilidad y mantenimiento del artefacto no están garantizados por un proyecto consolidado.
- La conversión está fijada a un commit concreto de transcribe.cpp (5.6.1) y del modelo base (169d4a4); cambios posteriores en cualquiera de los dos podrían invalidar la validación numérica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xix3r/voxix-whisper-tiny-gguf
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Commit del modelo base usado en la conversión: https://huggingface.co/openai/whisper-tiny/commit/169d4a4
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-tiny.md
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI Whisper: https://github.com/openai/whisper
