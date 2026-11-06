# tryambientai/whisper-large-v2-gguf

## Resumen

Whisper large-v2 GGUF es una conversión al formato GGUF del modelo openai/whisper-large-v2, publicada por el usuario tryambientai y pensada para su uso con transcribe.cpp, una implementación en C++ del pipeline de inferencia de Whisper. El modelo original lo desarrolló OpenAI y se presentó en el artículo "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., 2022). Resuelve el problema de reconocimiento automático del habla (ASR) y traducción de voz a texto en entornos donde no se quiere depender de Python, PyTorch o CUDA.

Se trata de un transformer encoder-decoder de tipo secuencia-a-secuencia con 1.543.321.440 parámetros (aproximadamente 1,54 mil millones), entrenado sobre 680.000 horas de audio etiquetado mediante supervisión débil. La versión large-v2 se entrenó durante 2,5 veces más épocas que large-v1 e incorpora regularización adicional, lo que mejora la robustez en dominios y acentos no vistos durante el entrenamiento.

La relevancia de esta ficha concreta está en el empaquetado: el repositorio ofrece seis cuantizaciones GGUF (F32, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) que van de 5,75 GB a 950 MB, con una degradación de WER mínima respecto al modelo en precisión completa. Esto permite ejecutar un modelo ASR multilingüe de referencia en CPU, en GPUs de consumo e incluso en hardware Apple Silicon mediante Metal, con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (secuencia-a-secuencia) con ventanas de audio de 30 s |
| Parametros totales | 1.543.321.440 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos con decodificación por chunks para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 99 idiomas, entre ellos en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp); el modelo base original está en safetensors/PyTorch |

## Arquitectura y entrenamiento

Whisper large-v2 es un transformer encoder-decoder clásico. El encoder procesa espectrogramas mel de 80 canales calculados sobre ventanas de 30 segundos a 16 kHz, y el decoder genera tokens de texto de forma autorregresiva. El modelo incorpora tokens especiales de control para la tarea (transcripción o traducción al inglés), el idioma de origen, la detección de idioma y la emisión de marcas de tiempo a nivel de segmento.

El entrenamiento se realizó sobre 680.000 horas de audio etiquetado obtenido de internet y anotado mediante supervisión débil a gran escala, sin fine-tuning posterior en los benchmarks de evaluación. Ese es precisamente el punto del artículo original: el modelo generaliza a muchos datasets y dominios sin ajuste específico. La variante large-v2 se entrenó durante 2,5 veces más épocas que large-v1 con regularización añadida. La model card de esta conversión no documenta detalles adicionales sobre la composición exacta del dataset ni sobre fases de RLHF o DPO, que no se aplican a este tipo de modelo ASR.

La innovación de esta publicación concreta no está en el modelo sino en el empaquetado: la conversión a GGUF se hizo a partir del commit upstream ae46427 (fijado el 2026-04-25) y se validó numéricamente contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp el 2026-04-26. El pipeline de decodificación usa greedy decoding, supresión de tokens, fallback por temperatura y marcas de tiempo de segmento activadas por defecto.

## Capacidades

- Transcripción de voz a texto multilingüe en 99 idiomas, incluido el castellano.
- Detección automática del idioma del audio (lang_detect: true).
- Traducción de voz a texto en inglés desde cualquiera de los idiomas soportados (translate: true).
- Emisión de marcas de tiempo a nivel de segmento (timestamps: segment).
- Procesamiento de audio largo mediante decodificación por chunks sobre ventanas de 30 segundos.
- Robustez ante acentos, ruido y dominios no vistos sin necesidad de fine-tuning, según el artículo original.
- Inferencia en CPU (backend CPU), GPU AMD/Intel vía Vulkan y Apple Silicon vía Metal.
- No soporta streaming (streaming: false en la model card).
- No es un modelo de chat ni de tool calling: no genera texto libre ni razona sobre instrucciones, solo transcribe y traduce audio.

## Casos de uso

- Subtitulado automático de vídeo y podcasts: el modelo genera marcas de tiempo por segmento, lo que permite producir ficheros SRT o VTT directamente a partir de audio de 16 kHz mono. La cuantización Q8_0 (1,55 GB) mantiene un WER de 2,65 % en LibriSpeech test-clean, muy cercano al F32.
- Transcripción de reuniones y actas: con ventanas de 30 segundos y decodificación por chunks, puede procesar grabaciones de horas en una sola pasada; el despliegue en CPU con Q4_K_M (950 MB) abarata el coste frente a servicios en la nube.
- Traducción de contenido audiovisual al inglés: el modo translate convierte audio en cualquier idioma soportado a texto en inglés, útil para publicar material en mercados angloparlantes sin un paso intermedio de traducción.
- Aplicaciones de escritorio y herramientas locales de dictado: al compilarse como binario C++ con transcribe.cpp, se puede integrar en apps nativas sin dependencias de Python ni de CUDA, lo que simplifica la distribución.
- Procesamiento por lotes en servidores sin GPU: en un Ryzen 4750U con Vulkan el factor de tiempo real (RTF) es de 2,1 y en CPU pura de 0,6, lo que permite transcribir archivos más rápido que en tiempo real en hardware modesto.
- Investigación en ASR multilingüe: sirve como línea base reproducible con cuantizaciones comparables y validación numérica contra transformers, útil para medir el impacto de la cuantización en el WER.
- Archivado y búsqueda de audio histórico: transcripción local de grabaciones con requisitos de privacidad, sin enviar el audio a terceros, gracias a la licencia Apache-2.0 y a la ejecución totalmente offline.

## Benchmarks y rendimiento

La model card proporciona WER sobre la partición completa de LibriSpeech test-clean (2.620 enunciados) con la decodificación por defecto de transcribe.cpp:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 5,75 GB | 2,68 % |
| F16 | 2,89 GB | 2,68 % |
| Q8_0 | 1,55 GB | 2,65 % |
| Q6_K | 1,21 GB | 2,83 % |
| Q5_K_M | 1,08 GB | 2,72 % |
| Q4_K_M | 950 MB | 2,46 % |

El WER autoinformado por OpenAI sobre la misma partición es de 2,83 %. El autor señala que la diferencia probable se debe a que `model.generate()` de OpenAI usa por defecto `<|notimestamps|>`, mientras que el pipeline de transcribe.cpp ejecuta con marcas de tiempo activadas. Los números provienen de una única ejecución sobre Metal, cuyas reducciones paralelas no deterministas pueden desplazar el WER del corpus en torno a 0,1 puntos porcentuales entre ejecuciones.

Rendimiento (factor de tiempo real, RTF):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 23,7 |
| Apple M4 Max | CPU | 1,5 |
| Ryzen 4750U | Vulkan | 2,1 |
| Ryzen 4750U | CPU | 0,6 |

No se han publicado en la información disponible resultados de otros benchmarks estándar de ASR (por ejemplo, Common Voice o FLEURS) para esta conversión concreta.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 950 MB con Q4_K_M, 1,08 GB con Q5_K_M, 1,21 GB con Q6_K, 1,55 GB con Q8_0, 2,89 GB con F16 y 5,75 GB con F32.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA); el repositorio no publica requisitos de VRAM específicos para CUDA porque transcribe.cpp no documenta backend CUDA en esta ficha.
- Cabe en GPU de consumo: sí, todas las cuantizaciones caben en GPUs de consumo con 4 GB o más de memoria; Q4_K_M y Q5_K_M caben incluso en iGPU compartidas.
- Opciones de despliegue: transcribe.cpp (compilación con CMake y binario `transcribe-cli`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 23,7 en M4 Max con Metal (unas 23,7 veces más rápido que tiempo real), 2,1 en Ryzen 4750U con Vulkan y 0,6 en CPU pura del mismo equipo.
- Preprocesado obligatorio: el audio debe convertirse a WAV mono a 16 kHz, por ejemplo con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---:|---|---|---|---|
| whisper-large-v2 (esta conversion) | 1.543 M | Ventanas de 30 s, chunks para audio largo | 99 | Apache-2.0 | GGUF |
| openai/whisper-large-v3 | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Apache-2.0 (upstream) | safetensors |
| openai/whisper-large-v1 | no disponible en la informacion | Ventanas de 30 s | 99 | Apache-2.0 | safetensors/PyTorch |

Frente a large-v1, large-v2 se entrenó con 2,5 veces más épocas y regularización adicional, lo que según la model card original mejora el rendimiento. No se dispone en la información proporcionada de datos de benchmarks de large-v3 ni de otros modelos ASR comparables para establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Alucinaciones en silencios o ruido de fondo: el propio autor atribuye parte de la variabilidad del WER a "short-clip hallucination outcomes on the noise floor"; conviene filtrar segmentos sin voz.
- No soporta streaming: la model card indica `streaming: false`, por lo que la transcripción es por lotes sobre ficheros completos o chunks.
- Ventana fija de 30 segundos: el audio largo requiere decodificación por chunks, con posible pérdida de contexto entre fragmentos.
- Idiomas de bajos recursos: aunque se listan 99 idiomas, la calidad no es uniforme; el WER publicado solo cubre inglés (LibriSpeech).
- Sesgos: el modelo se entrenó con datos de internet anotados débilmente, por lo que puede heredar sesgos de acento, género y dominio presentes en esa distribución; la model card de esta conversión no documenta análisis de sesgo específicos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar los términos upstream; la model card remite a openai/whisper-large-v2 como fuente autoritativa.
- Reproducibilidad: los resultados de WER provienen de una sola ejecución en Metal y pueden variar en torno a 0,1 puntos porcentuales por no determinismo.
- Madurez del ecosistema: transcribe.cpp es una implementación específica; no hay soporte documentado para otros runtimes, lo que limita la portabilidad frente a GGUF de llama.cpp.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente más allá de la del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tryambientai/whisper-large-v2-gguf
- Modelo base: https://huggingface.co/openai/whisper-large-v2
- Commit upstream fijado: https://huggingface.co/openai/whisper-large-v2/commit/ae46427
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Versión de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-large-v2.md
- Artículo original: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI: https://github.com/openai/whisper
- Descarga F32: https://huggingface.co/handy-computer/whisper-large-v2-gguf/resolve/main/whisper-large-v2-F32.gguf
- Descarga F16: https://huggingface.co/handy-computer/whisper-large-v2-gguf/resolve/main/whisper-large-v2-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/whisper-large-v2-gguf/resolve/main/whisper-large-v2-Q8_0.gguf
- Descarga Q6_K: https://huggingface.co/handy-computer/whisper-large-v2-gguf/resolve/main/whisper-large-v2-Q6_K.gguf
- Descarga Q5_K_M: https://huggingface.co/handy-computer/whisper-large-v2-gguf/resolve/main/whisper-large-v2-Q5_K_M.gguf
- Descarga Q4_K_M: https://huggingface.co/handy-computer/whisper-large-v2-gguf/resolve/main/whisper-large-v2-Q4_K_M.gguf
