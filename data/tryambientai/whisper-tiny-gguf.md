# tryambientai/whisper-tiny-gguf

## Resumen

`tryambientai/whisper-tiny-gguf` es una conversión al formato GGUF del modelo `openai/whisper-tiny`, publicada por el usuario tryambientai para su uso con el runtime [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp). Se trata de un modelo de reconocimiento automático del habla (ASR) de tipo encoder-decoder transformer, con 37,7 millones de parámetros, derivado del Whisper original de OpenAI y pensado para transcripción multilingüe, detección de idioma y traducción de voz a inglés. Su interés radica en que permite ejecutar un modelo de ASR en hardware muy modesto (CPU, GPUs integradas, dispositivos Apple Silicon) gracias a las cuantizaciones GGUF de entre 42 y 146 MB.

El modelo hereda la arquitectura y el entrenamiento de Whisper tiny: ventanas de audio de 30 segundos, decodificación por trozos para audio largo y soporte para más de 90 idiomas. La conversión a GGUF no altera los pesos más allá de la cuantización, y el autor valida numéricamente contra la implementación de referencia de transformers (commit 5.6.1 de transcribe.cpp, 26 de abril de 2026) y contra el commit upstream 169d4a4 de `openai/whisper-tiny` (fijado el 25 de abril de 2026).

La relevancia actual de esta ficha es doble: por un lado, ofrece una alternativa ligera y de licencia Apache-2.0 para transcripción en producción o en el borde; por otro, sirve como ejemplo de empaquetado GGUF de modelos de audio para runtimes C++ especializados, un ecosistema que hasta hace poco estaba dominado por llama.cpp para texto y que ahora se extiende a ASR con transcribe.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq), Whisper tiny |
| Parametros totales | 37.777.120 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 s; decodificacion por trozos para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 90+ idiomas (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) |

## Arquitectura y entrenamiento

Whisper tiny es un transformer encoder-decoder entrenado por OpenAI sobre 680.000 horas de audio etiquetado mediante supervisión débil a gran escala, según el paper *Robust Speech Recognition via Large-Scale Weak Supervision* (Radford et al., 2022). El modelo procesa audio en ventanas de 30 segundos, convierte la señal a espectrogramas mel y genera texto autorregresivamente. La variante tiny es la de menor tamaño de la familia Whisper y está pensada para entornos con recursos limitados.

La conversión a GGUF realizada por tryambientai no modifica el entrenamiento original; únicamente serializa los pesos en el formato de transcribe.cpp y aplica cuantizaciones de bloque (Q8_0, Q6_K, Q5_K_M, Q4_K_M). El autor valida la conversión contra la implementación de referencia de transformers y documenta que la decodificación por defecto de transcribe.cpp (greedy, `suppress_tokens`, *temperature fallback* y timestamps de segmento activados) difiere de la configuración de `model.generate()` de OpenAI, que usa `<|notimestamps|>` por defecto; esto explica pequeñas divergencias en el WER reportado.

## Capacidades

- Transcripción automática del habla (ASR) en el mismo idioma del audio.
- Traducción de voz a texto en inglés desde cualquiera de los idiomas soportados (`translate: true`).
- Detección automática de idioma (`lang_detect: true`).
- Marcas de tiempo a nivel de segmento (`timestamps: segment`).
- Procesamiento de audio largo mediante decodificación por trozos sobre ventanas de 30 s.
- Soporte multilingüe amplio (más de 90 idiomas listados en la model card).
- No soporta streaming (`streaming: false`).
- No incluye tool calling, function calling ni capacidades de agente; es un modelo puramente de audio a texto.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo convierte audio de 30 s por ventana en texto con marcas de tiempo por segmento, lo que permite generar actas o subtítulos sincronizados sin infraestructura GPU dedicada.
- Subtitulado automático de vídeo: gracias a los timestamps de segmento y a la detección de idioma, se puede integrar en pipelines de postproducción para generar ficheros SRT o VTT en múltiples idiomas.
- Traducción de audio a inglés: útil para indexar contenido audiovisual en otros idiomas (español, francés, alemán, etc.) y hacerlo buscable en inglés sin pasar por un modelo de traducción de texto adicional.
- Asistentes de voz en el borde: con cuantizaciones Q4_K_M o Q5_K_M de 42 MB, el modelo cabe en dispositivos con poca memoria (Raspberry Pi, móviles, navegadores) y permite dictado o comandos de voz locales.
- Preprocesado de datasets de audio: para etiquetar o limpiar grandes volúmenes de grabaciones en CPU, con un throughput de 24,8× en tiempo real sobre un Ryzen 4750U (Vulkan) y 61× en el mismo equipo, según los datos del autor.
- Accesibilidad: generación de transcripciones en vivo o diferidas para personas con discapacidad auditiva en aplicaciones de escritorio o web, con latencia baja en Apple Silicon (RTF 302,1 con Metal).
- Moderación y análisis de contenido: transcripción masiva de audio para clasificación posterior, aprovechando el bajo coste computacional del modelo tiny.

## Benchmarks y rendimiento

El autor publica WER sobre el split completo de LibriSpeech test-clean (2.620 enunciados) con la decodificación por defecto de transcribe.cpp:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 146 MB | 7,54 % |
| F16 | 76 MB | 7,49 % |
| Q8_0 | 44 MB | 7,53 % |
| Q6_K | 43 MB | 7,63 % |
| Q5_K_M | 42 MB | 7,63 % |
| Q4_K_M | 42 MB | 7,76 % |

Rendimiento en tiempo real (RTF, mayor es mejor) reportado por el autor:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 302,1 |
| Apple M4 Max | CPU | 76,1 |
| Ryzen 4750U | Vulkan | 61,0 |
| Ryzen 4750U | CPU | 24,8 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, ya que el modelo no es de lenguaje general.

## Requisitos de hardware

- VRAM estimada: inferior a 200 MB en F32 (146 MB de pesos) y en torno a 42-44 MB en cuantizaciones Q4_K_M/Q5_K_M/Q8_0, más el overhead del runtime.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon), Vulkan (AMD, Intel, NVIDIA) o CUDA; no requiere GPUs de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU integrada o dedicada con al menos 1 GB de memoria; también en CPU sin GPU.
- Opciones de despliegue: transcribe.cpp (runtime oficial del formato), compilación desde fuente con CMake; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ya que estos runtimes no están orientados a ASR Whisper en GGUF.
- Latencia y throughput: RTF de 302,1 en Metal (M4 Max), 76,1 en CPU (M4 Max), 61,0 en Vulkan (Ryzen 4750U) y 24,8 en CPU (Ryzen 4750U); es decir, entre 24 y 300 veces más rápido que tiempo real según plataforma.
- Nota: las cifras de RTF provienen de una única ejecución respaldada por Metal; las reducciones paralelas no deterministas de Metal pueden desplazar el WER del corpus en torno a 0,1 pp entre ejecuciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | WER LibriSpeech test-clean | Licencia | Formato |
|---|---:|---|---:|---|---|
| whisper-tiny-gguf (este) | 37,7 M | 30 s por ventana | 7,49-7,76 % | Apache-2.0 | GGUF |
| openai/whisper-tiny | 37,7 M | 30 s por ventana | 7,54 % (reportado por OpenAI) | Apache-2.0 | safetensors / PyTorch |
| openai/whisper-base | 74 M | 30 s por ventana | no disponible en la informacion | Apache-2.0 | safetensors / PyTorch |
| openai/whisper-small | 244 M | 30 s por ventana | no disponible en la informacion | Apache-2.0 | safetensors / PyTorch |

La comparativa con whisper-base y whisper-small se ofrece por categoría (misma familia y tarea); no se dispone de sus WER en la información proporcionada. Frente a la versión original en safetensors, esta conversión GGUF añade cuantizaciones de 42 MB y un runtime C++ sin dependencias de Python, a costa de requerir transcribe.cpp en lugar de transformers.

## Limitaciones y advertencias

- Modelo tiny: precisión limitada en comparación con variantes base, small, medium o large de Whisper; el WER de 7,5 % en LibriSpeech test-clean es aceptable para audio limpio, pero empeora en dominios ruidosos o con acentos marcados.
- Riesgo de alucinación: el autor señala que las diferencias de WER entre ejecuciones se deben en gran medida a "short-clip hallucination outcomes on the noise floor", es decir, alucinaciones en clips cortos con ruido.
- No soporta streaming (`streaming: false`); la decodificación es por lotes de 30 s con troceado para audio largo.
- Idiomas: aunque la model card lista más de 90 idiomas, el rendimiento en idiomas de bajos recursos no está cuantificado en la información disponible.
- Licencia Apache-2.0, heredada del modelo base; permite uso comercial, pero conviene revisar la model card upstream de `openai/whisper-tiny` para los términos completos.
- Dependencia de transcribe.cpp: no es un GGUF estándar de llama.cpp; requiere el runtime específico y su CLI (`transcribe-cli`) o integración vía la biblioteca C++.
- Requiere audio de entrada en WAV mono a 16 kHz; el autor recomienda convertir con ffmpeg antes de la inferencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de repo de 0,0 GB (los pesos se enlazan a `handy-computer/whisper-tiny-gguf`), lo que sugiere que es una publicación reciente y poco validada por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/tryambientai/whisper-tiny-gguf
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Commit upstream fijado: https://huggingface.co/openai/whisper-tiny/commit/169d4a4
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp 5.6.1: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-tiny.md
- Pesos GGUF (repo handy-computer): https://huggingface.co/handy-computer/whisper-tiny-gguf
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI Whisper: https://github.com/openai/whisper
