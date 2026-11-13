# xix3r/voxix-Fun-ASR-MLT-Nano-2512-gguf

## Resumen

voxix-Fun-ASR-MLT-Nano-2512-gguf es una conversión a formato GGUF del modelo de reconocimiento automático del habla Fun-ASR-MLT-Nano-2512, publicado originalmente por FunAudioLLM (equipo de Alibaba vinculado a FunASR y ModelScope). La conversión la mantiene el usuario xix3r y está pensada para ejecutarse con transcribe.cpp, una implementación en C++ de inferencia ASR derivada del ecosistema llama.cpp. El modelo resuelve transcripción de voz a texto offline en 31 idiomas, con especial énfasis en lenguas del este y sudeste asiático.

Arquitectónicamente es un modelo híbrido audio-LLM de aproximadamente 830 millones de parámetros totales: un codificador SenseVoiceEncoderSmall congelado, un adaptador de audio de dos capas y una cabeza generativa Qwen3-0.6B que produce el texto mediante decodificación greedy. Esto lo sitúa en la categoría de modelos ASR "nano": suficientemente pequeños para ejecutarse en CPU y en GPUs de consumo, pero con cobertura multilingüe amplia.

Su relevancia actual radica en que ofrece una alternativa ligera y de pesos abiertos (con licencia específica de FunASR) frente a soluciones ASR propietarias, y en que la conversión GGUF permite desplegarlo sin dependencias de Python ni de frameworks pesados. No obstante, conviene subrayar que no es streaming, no traduce y no genera timestamps, y que su rendimiento en varias lenguas europeas es claramente deficiente según los datos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM híbrido: SenseVoiceEncoderSmall (congelado) + adaptador de audio de 2 capas + Qwen3-0.6B como decodificador |
| Parametros totales | 829.791.840 (~830 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 31: zh, en, yue, ja, ko, vi, id, th, ms, tl, ar, hi, bg, hr, cs, da, nl, et, fi, el, hu, ga, lv, lt, mt, pl, pt, ro, sk, sl, sv |
| Licencia | funasr-model-license-v1.1 (licencia "other", no estándar) |
| Formato de pesos | GGUF (conversión para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue un diseño de tipo audio-LLM en el que un codificador acústico preentrenado y congelado (SenseVoiceEncoderSmall) extrae representaciones del audio, un adaptador de dos capas las proyecta al espacio del modelo de lenguaje y una instancia de Qwen3-0.6B genera la transcripción token a token mediante decodificación greedy. La entrada es un WAV mono a 16 kHz y la salida es texto plano. La normalización inversa de texto (ITN) está activada por defecto, de modo que la salida incluye puntuación, mayúsculas y dígitos en forma legible; puede desactivarse con `--no-itn`.

Según la model card, esta variante MLT se entrenó sobre un corpus multilingüe descrito como "cientos de miles de horas", notablemente menor que las "decenas de millones de horas" del modelo Nano original, lo que explica en parte su menor precisión en varias lenguas. La conversión GGUF se realizó a partir del commit upstream cf67a93 (fijado el 2026-05-06) y se validó contra la referencia FunASR en el commit f094d28 de transcribe.cpp. No se detalla en la información disponible si hubo fases de RLHF o DPO; al tratarse de un modelo ASR con decodificación greedy, es probable que no, pero no se confirma.

## Capacidades

- Transcripción de voz a texto offline en 31 idiomas, con optimización específica para chino, inglés, cantonés, japonés, coreano, vietnamita, indonesio, tailandés, malayo y filipino.
- Detección automática de idioma (`lang_detect: true`) y selección explícita de idioma (`explicit_language_selection: true`), por ejemplo mediante el hint `en`.
- Normalización inversa de texto (ITN) activada por defecto: puntuación, mayúsculas y conversión de números hablados a dígitos.
- Procesamiento por lotes (los benchmarks se midieron con batch size 8).
- Ejecución en CPU (con soporte de Metal en Apple Silicon y Vulkan en AMD) y en GPU CUDA.
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No genera timestamps (`timestamps: none`).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo puramente ASR.

## Casos de uso

- Transcripción por lotes de reuniones y entrevistas: el modelo procesa archivos WAV de 16 kHz mono de forma offline, lo que permite transcribir grandes volúmenes de audio sin enviar datos a servicios en la nube; adecuado para entornos con requisitos de privacidad.
- Subtitulado de contenido en lenguas asiáticas: su cobertura de chino, cantonés, japonés, coreano, vietnamita, tailandés e indonesio lo hace útil para generar borradores de subtítulos en plataformas de vídeo con audiencia del sudeste asiático.
- Dictado y notas de voz en aplicaciones de escritorio: al ejecutarse en CPU con un rendimiento en tiempo real aceptable (RTF de 11,33 en un Apple M4 y 5,47 en un Ryzen 4750U), puede integrarse en herramientas locales de productividad.
- Indexación y búsqueda de archivos de audio: transcribir un archivo de audio y volcar el texto a un motor de búsqueda o base de datos vectorial para recuperación posterior.
- Atención al cliente con grabaciones: transcribir llamadas o mensajes de voz para su análisis de calidad, clasificación de incidencias o cumplimiento normativo, siempre que el idioma esté entre los bien cubiertos (inglés, chino, indonesio, malayo, vietnamita).
- Investigación lingüística y creación de corpus: generar transcripciones de material multilingüe para anotación y estudio, con la advertencia de que en lenguas europeas como húngaro, griego, irlandés o maltés la tasa de error es muy alta y requiere revisión humana.
- Prototipado rápido en C++: al estar en formato GGUF y depender solo de transcribe.cpp, sirve para integrar ASR en aplicaciones nativas sin cadena de dependencias Python.

## Benchmarks y rendimiento

Datos publicados en la model card de la conversión (WER en LibriSpeech test-clean, 2.620 utterances, batch 8, hint `en`, decodificado en CUDA, ITN activado):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 1,67 GB | 1,71 % |
| F16 | 1,67 GB | 1,71 % |
| Q8_0 | 891 MB | 1,72 % |
| Q6_K | 691 MB | 1,66 % |
| Q5_K_M | 631 MB | 1,74 % |
| Q4_K_M | 557 MB | 1,80 % |

Referencia FunASR 1.3.1 sobre el mismo manifiesto con ITN: 1,71 % (IC 95 % [1,55 %, 1,89 %]). La conversión BF16 iguala esa referencia con -0,01 puntos porcentuales de diferencia.

WER/CER en FLEURS con cuantización Q8_0 (los valores superiores a 100 % indican que la salida es más larga que la referencia; los idiomas con escritura no latina se miden con CER):

| Idioma | Metrica | Q8_0 |
|---|---|---:|
| en | WER | 5,02 |
| id | WER | 7,32 |
| vi | WER | 8,22 |
| ms | WER | 9,11 |
| fil | WER | 14,29 |
| pt | WER | 22,23 |
| hi | WER | 23,07 |
| ar | WER | 25,88 |
| nl | WER | 42,36 |
| cs | WER | 48,70 |
| lv | WER | 52,14 |
| pl | WER | 52,34 |
| bg | WER | 55,78 |
| da | WER | 55,94 |
| sk | WER | 60,13 |
| et | WER | 61,09 |
| fi | WER | 65,77 |
| hr | WER | 67,52 |
| ro | WER | 67,83 |
| sv | WER | 71,60 |
| sl | WER | 72,73 |
| lt | WER | 75,25 |
| mt | WER | 89,25 |
| ga | WER | 95,78 |
| el | WER | 100,43 |
| hu | WER | 110,75 |
| zh | CER | 7,33 |
| yue | CER | 8,39 |
| ja | CER | 2,10 |
| ko | CER | 5,41 |
| th | CER | 7,28 |

Rendimiento en tiempo real (RTF, menor es mejor): Apple M4 con CPU 11,33 y Metal 25,82; Apple M4 Max con CPU 19,54 y Metal 70,03; Ryzen 4750U con CPU 5,47 y Vulkan 8,84. No se han publicado resultados de benchmarks comparativos con otros modelos ASR en la información disponible.

## Requisitos de hardware

- VRAM estimada: muy baja. El archivo Q4_K_M ocupa 557 MB y el BF16 1,67 GB, por lo que cualquier GPU con 2-4 GB de VRAM libre puede alojar el modelo.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (los benchmarks se midieron en CUDA), GPUs Apple Silicon con Metal y GPUs AMD con Vulkan. No requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en iGPU y en CPU pura.
- Despliegue: transcribe.cpp (compilación con CMake y binario `transcribe-cli`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible, dado que el formato y la librería son específicos de transcribe.cpp.
- Latencia y throughput: RTF de 5,47 (CPU Ryzen 4750U) y 8,84 (Vulkan en el mismo equipo); 11,33 (CPU M4) y 25,82 (Metal M4); 19,54 (CPU M4 Max) y 70,03 (Metal M4 Max). Los RTF de Metal superiores a los de CPU en M4 y M4 Max indican que la ruta Metal es más lenta que la CPU en esta implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Streaming | Traduccion | Timestamps | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| voxix-Fun-ASR-MLT-Nano-2512-gguf | ~830 M | 31 | No | No | No | funasr-model-license-v1.1 | GGUF (transcribe.cpp) |
| Fun-ASR-Nano-2512 (original) | ~800 M entrenables | No disponible en la informacion | No disponible | No disponible | No disponible | FunASR | safetensors |
| Whisper large-v3 | ~1.550 M | ~99 | No | Si | Si (nivel de segmento) | MIT | safetensors, GGUF, etc. |
| Whisper small | ~244 M | ~99 | No | Si | Si | MIT | safetensors, GGUF, etc. |

La comparación con Whisper es la más pertinente por categoría (ASR multilingüe de pesos abiertos), pero no se dispone de cifras de WER comparables en la información proporcionada para establecer una comparación numérica rigurosa. La ventaja de este modelo es el tamaño reducido y la licencia permisiva dentro del ecosistema FunASR; su desventaja es la falta de streaming, traducción y timestamps, y el rendimiento pobre en varias lenguas europeas.

## Limitaciones y advertencias

- Rendimiento muy desigual por idioma: WER superior al 50 % en búlgaro, danés, estonio, finlandés, croata, rumano, sueco, esloveno, lituano, maltés, irlandés, griego y húngaro (este último supera el 100 %). No es apto para producción en esas lenguas sin revisión humana.
- No soporta streaming: requiere el archivo de audio completo, lo que lo descarta para dictado en tiempo real o asistentes de voz interactivos.
- No genera timestamps, lo que complica la alineación con vídeo o la creación de subtítulos sincronizados.
- No traduce: solo transcribe en el idioma hablado.
- Riesgo de alucinación y de salida degenerada: al usar una cabeza LLM (Qwen3-0.6B) con decodificación greedy, puede producir repeticiones o texto inventado en audio ruidoso o con silencios largos.
- Licencia funasr-model-license-v1.1: no es una licencia OSI estándar; es necesario revisar sus términos antes de uso comercial. La model card la etiqueta como "other".
- La conversión GGUF está vinculada a una versión concreta de transcribe.cpp (commit f094d28) y a un commit upstream fijado; cambios en la herramienta pueden romper la compatibilidad.
- El modelo base se entrenó con un corpus menor que el Nano original ("cientos de miles de horas" frente a "decenas de millones"), lo que se refleja en la precisión multilingüe.
- Entrada restringida a WAV mono a 16 kHz; requiere preprocesado del audio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.
- No se documentan sesgos específicos ni evaluación de robustez frente a acentos, ruido o audio telefónico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xix3r/voxix-Fun-ASR-MLT-Nano-2512-gguf
- Modelo base: https://huggingface.co/FunAudioLLM/Fun-ASR-MLT-Nano-2512
- Commit upstream fijado: https://huggingface.co/FunAudioLLM/Fun-ASR-MLT-Nano-2512/commit/cf67a93
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/f094d28
- Conversión GGUF de referencia (handy-computer): https://huggingface.co/handy-computer/Fun-ASR-MLT-Nano-2512-gguf
- Licencia FunASR: https://github.com/modelscope/FunASR/blob/main/MODEL_LICENSE
- Paper asociado (arXiv:2509.12508): https://arxiv.org/abs/2509.12508
