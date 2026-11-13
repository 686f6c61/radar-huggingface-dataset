# xix3r/voxix-whisper-base-gguf

## Resumen

voxix-whisper-base-gguf es una conversión a formato GGUF del modelo openai/whisper-base, publicada por el usuario xix3r para su uso con transcribe.cpp, un runtime de inferencia en C++ centrado en tareas de reconocimiento automático del habla. El modelo subyacente es Whisper base de OpenAI, un transformer encoder-decoder de tipo secuencia-a-secuencia con 72,6 millones de parámetros, entrenado sobre 680.000 horas de audio etiquetado mediante supervisión débil. Esta conversión no aporta cambios arquitectónicos: su valor está en empaquetar los pesos en GGUF con varias cuantizaciones (de F32 a Q4_K_M) y validar numéricamente la salida frente a la referencia de transformers.

El modelo resuelve tres tareas: transcripción multilingüe (audio en cualquiera de los idiomas soportados a texto en el mismo idioma), detección automática de idioma y traducción de voz a texto en inglés. Al ser la variante base, está pensado para escenarios donde el coste computacional y el tamaño del binario importan más que la precisión máxima: el fichero Q4_K_M ocupa 56 MB y el Q8_0 81 MB, lo que permite ejecutarlo en hardware muy modesto, incluidos dispositivos de borde.

La relevancia actual de esta ficha es acotada pero concreta: el repositorio tiene cero descargas y cero likes en el momento de la consulta, y el pipeline declarado es automatic-speech-recognition con la librería transcribe.cpp. Es útil para quien necesite ASR local, offline y ligero con licencia Apache-2.0, no como sustituto de modelos ASR de mayor tamaño para producción de alta precisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (secuencia-a-secuencia) |
| Parámetros totales | 72.610.400 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; procesa audio en ventanas de 30 segundos con decodificación por trozos para audio largo |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 99 idiomas, entre ellos en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transcribe.cpp) |
| Modelo base | openai/whisper-base (commit e37978b, fijado el 2026-04-25) |
| Tamaño del repositorio | 0,1 GB |
| Streaming | no soportado |
| Traducción a inglés | sí |
| Detección de idioma | sí |
| Timestamps | a nivel de segmento |

## Arquitectura y entrenamiento

Whisper es un transformer encoder-decoder entrenado con 680.000 horas de audio etiquetado mediante supervisión débil a gran escala, según el paper *Robust Speech Recognition via Large-Scale Weak Supervision* (Radford et al., OpenAI, arXiv:2212.04356). El encoder procesa espectrogramas de audio en ventanas de 30 segundos y el decoder genera tokens de texto de forma autorregresiva. Los modelos multilingües, como esta variante base, se entrenaron conjuntamente en tareas de reconocimiento (transcripción en el mismo idioma del audio) y traducción (audio en cualquier idioma soportado a texto en inglés). No se dispone de información sobre composición exacta del dataset, número de tokens de entrenamiento ni si hubo fases de RLHF o DPO en la información proporcionada.

Esta conversión concreta no modifica la arquitectura: aplica cuantización de bloques tipo GGUF (Q4_K_M, Q5_K_M, Q6_K, Q8_0) sobre los pesos originales y valida la salida contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp, con fecha de validación 2026-04-26. La decodificación por defecto del runtime es greedy con suppress_tokens, temperature fallback y timestamps de segmento activados; esta configuración difiere de la de `model.generate()` de OpenAI, que por defecto desactiva los timestamps, y es la causa más probable de las pequeñas divergencias de WER observadas. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Transcripción automática de voz a texto en 99 idiomas, incluyendo español, catalán, euskera y gallego.
- Detección automática del idioma del audio.
- Traducción de voz a texto en inglés desde cualquiera de los idiomas soportados.
- Generación de timestamps a nivel de segmento.
- Procesamiento de audio largo mediante decodificación por trozos sobre ventanas de 30 segundos.
- Ejecución local y offline en CPU, Metal (Apple) y Vulkan, según los datos de rendimiento del autor.
- No soporta streaming: el pipeline declarado indica `streaming: false`.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso; es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el modelo convierte audio de 30 segundos por ventana y encadena trozos para grabaciones largas, con timestamps de segmento que facilitan la revisión posterior. Es adecuado cuando la privacidad impide enviar el audio a servicios en la nube.
- Subtitulado automático de vídeo: la salida con timestamps por segmento permite generar ficheros de subtítulos sin infraestructura GPU dedicada, dado el reducido tamaño del modelo (56-81 MB en cuantizaciones habituales).
- Detección de idioma en pipelines de enrutamiento: antes de enviar un audio a un transcriptor especializado o a un traductor, el modelo identifica el idioma con una pasada corta.
- Traducción de voz a inglés para contenidos multilingües: útil para generar borradores de transcripción en inglés a partir de entrevistas o pódcasts en otros idiomas, con la advertencia de que la calidad de traducción de la variante base es limitada.
- Asistencia a la accesibilidad: transcripción en tiempo casi real de conversaciones presenciales en dispositivos de borde, aprovechando el rendimiento en CPU y Vulkan documentado (RTF 11,9 en CPU de Ryzen 4750U y 34,8 en Vulkan).
- Prototipado y evaluación de pipelines ASR: al estar validado numéricamente contra transformers y ofrecer seis cuantizaciones con WER medido, sirve como referencia ligera para comparar configuraciones de decodificación o de cuantización antes de escalar a modelos mayores.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: con 72,6 millones de parámetros y pesos de 56 MB en Q4_K_M, se pueden ejecutar múltiples instancias concurrentes en un solo nodo CPU.

## Benchmarks y rendimiento

Datos de WER sobre LibriSpeech test-clean (2620 utterances), decodificación por defecto de transcribe.cpp (greedy, suppress_tokens, temperature fallback, timestamps de segmento activados), según la model card del autor:

| Cuantización | Tamaño | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 279 MB | 5,10 % |
| F16 | 144 MB | 5,10 % |
| Q8_0 | 81 MB | 5,12 % |
| Q6_K | 65 MB | 5,12 % |
| Q5_K_M | 61 MB | 5,19 % |
| Q4_K_M | 56 MB | 5,36 % |

El dato autoinformado por OpenAI sobre el mismo split es 5,009 %. El autor señala que la divergencia probable se debe a la configuración de timestamps y que las reducciones paralelas no deterministas de Metal pueden desplazar el WER del corpus en torno a 0,1 puntos porcentuales entre ejecuciones.

Rendimiento en tiempo real (RTF, mayor es mejor), según la model card:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 209,4 |
| Apple M4 Max | CPU | 36,6 |
| AMD Ryzen 4750U | Vulkan | 34,8 |
| AMD Ryzen 4750U | CPU | 11,9 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de los pesos, entre 56 MB (Q4_K_M) y 279 MB (F32), más el overhead del runtime y del buffer de audio.
- GPU recomendadas: no se especifican modelos concretos; el autor documenta ejecución en Metal (Apple M4 Max) y Vulkan (AMD Ryzen 4750U con gráficos integrados).
- Cabe en GPU consumer y en hardware integrado: los tamaños de 56-81 MB en cuantizaciones Q4_K_M y Q8_0 permiten ejecución en cualquier GPU con unos cientos de MB libres, así como en CPU.
- Opciones de despliegue: transcribe.cpp (compilación con CMake y binario `transcribe-cli`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 209,4 en Metal (M4 Max), 36,6 en CPU (M4 Max), 34,8 en Vulkan (Ryzen 4750U) y 11,9 en CPU (Ryzen 4750U). Un RTF superior a 1 indica procesamiento más rápido que el tiempo real.
- Requisito de entrada: audio en WAV mono a 16 kHz; el autor recomienda convertir con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER LibriSpeech test-clean | Licencia | Formato / disponibilidad |
|---|---:|---|---:|---|---|
| voxix-whisper-base-gguf (este) | 72,6 M | 99 | 5,10-5,36 % según cuantización | Apache-2.0 | GGUF para transcribe.cpp |
| openai/whisper-base (original) | 72,6 M | 99 | 5,009 % (autoinformado) | Apache-2.0 | PyTorch / safetensors en Hugging Face |
| openai/whisper-small | 244 M | 99 | no disponible en la información proporcionada | Apache-2.0 | PyTorch / safetensors en Hugging Face |
| openai/whisper-tiny | 39 M | 99 | no disponible en la información proporcionada | Apache-2.0 | PyTorch / safetensors en Hugging Face |

La comparación con whisper-small y whisper-tiny se ofrece por categoría (misma familia ASR), pero no se dispone de sus cifras de WER ni de sus especificaciones completas en la información proporcionada. Frente al original de OpenAI, la diferencia principal es el formato GGUF y el runtime C++ con backends CPU, Metal y Vulkan, con una pérdida de precisión de entre 0,09 y 0,35 puntos porcentuales de WER en el split evaluado.

## Limitaciones y advertencias

- El repositorio tiene cero descargas y cero likes en el momento de la consulta; es una conversión reciente (creada el 2026-11-13) sin validación comunitaria independiente.
- El modelo base es la variante base de Whisper: su precisión es inferior a la de las variantes small, medium y large, y no es adecuada para producción de alta exactitud sin evaluación previa en el dominio objetivo.
- Riesgo de alucinación en pasajes de silencio o ruido: el autor menciona que las diferencias de WER entre ejecuciones dependen en parte del comportamiento de alucinación en clips cortos sobre el suelo de ruido.
- No soporta streaming (`streaming: false`), lo que limita su uso en transcripción en vivo con baja latencia.
- Los timestamps son solo a nivel de segmento, no a nivel de palabra.
- La calidad de traducción a inglés de la variante base es limitada en comparación con modelos mayores.
- La salida depende de la configuración de decodificación del runtime; los WER publicados no son directamente comparables con los de `model.generate()` de OpenAI por la diferencia en timestamps.
- Licencia Apache-2.0 heredada del modelo base: permite uso comercial, pero se recomienda revisar la model card original de openai/whisper-base como fuente autoritativa.
- No se documentan sesgos específicos en la información disponible; al entrenarse con datos web a gran escala, es esperable que herede sesgos de ese corpus, aunque no se cuantifican.
- Requiere audio en WAV mono a 16 kHz; no acepta directamente otros formatos o canales sin preprocesado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xix3r/voxix-whisper-base-gguf
- Modelo base: https://huggingface.co/openai/whisper-base
- Commit del modelo base referenciado: https://huggingface.co/openai/whisper-base/commit/e37978b
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Versión validada de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Página de modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-base.md
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI: https://github.com/openai/whisper
- Pesos GGUF alternativos referenciados en la model card: https://huggingface.co/handy-computer/whisper-base-gguf
