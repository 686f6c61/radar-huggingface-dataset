# tryambientai/whisper-large-v3-turbo-gguf

## Resumen

whisper-large-v3-turbo-gguf es una conversión al formato GGUF del modelo OpenAI Whisper large-v3-turbo, publicada por el usuario tryambientai para su uso con transcribe.cpp, una implementación en C++ del pipeline de inferencia de Whisper. El modelo base es un transformer encoder-decoder de reconocimiento automático del habla (ASR) desarrollado por OpenAI, resultado de podar las capas del decodificador de Whisper large-v3 de 32 a 4, lo que reduce drásticamente el coste de decodificación a cambio de una degradación menor de calidad. Esta conversión concreta empaqueta los pesos en cinco cuantizaciones (F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) y está validada numéricamente contra la referencia de transformers.

El interés de esta ficha es práctico: permite ejecutar un modelo ASR multilingüe de referencia en hardware modesto, incluidas CPU y GPUs de consumo, con una huella de entre 511 MB y 1,51 GB según cuantización. El modelo soporta transcripción y detección de idioma en 100 idiomas, pero no soporta traducción de voz (la variante turbo fue ajustada solo con datos de transcripción). La licencia Apache-2.0 heredada del modelo base facilita su uso comercial.

La relevancia actual reside en la combinación de un modelo ASR de alta calidad con un runtime ligero (transcribe.cpp) y cuantizaciones agresivas que mantienen el WER prácticamente intacto: la diferencia entre Q4_K_M y F16 en LibriSpeech test-clean es de 0,00 puntos porcentuales en las mediciones reportadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo, decodificador podado de 32 a 4 capas) |
| Parámetros totales | 808.904.208 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos con decodificación por chunks para audio largo |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 100 idiomas (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su, yue) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder-decoder con entrada mel de 128 bins (introducido en la familia v3) y ventanas de audio de 30 segundos. Whisper large-v3-turbo se obtiene podando el decodificador de large-v3 de 32 a 4 capas, manteniendo el encoder intacto; el resultado es un modelo mucho más rápido en decodificación con una degradación de calidad menor. El entrenamiento original de Whisper se realizó sobre más de 5 millones de horas de datos etiquetados, con un fuerte énfasis en generalización zero-shot a dominios y datasets no vistos. La variante turbo se ajustó únicamente con datos de transcripción, excluyendo la traducción, por lo que la tarea `translate` no está disponible.

Esta conversión concreta no introduce cambios arquitectónicos: es una cuantización de los pesos originales. El autor indica que el port se realizó desde el commit 41f01f3 del modelo base (fijado el 2026-04-25) y se validó contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp el 2026-04-26. La decodificación por defecto de transcribe.cpp es greedy con `suppress_tokens`, fallback de temperatura y timestamps por segmento activados, lo que difiere de los valores por defecto de `model.generate()` de OpenAI (que usa `<|notimestamps|>`), y es la causa más probable de las pequeñas divergencias en WER.

## Capacidades

- Transcripción automática del habla multilingüe en 100 idiomas, incluidos el castellano, el catalán, el gallego, el euskera y el chino cantonés (yue), añadido en la familia v3.
- Detección automática de idioma (`lang_detect: true`).
- Timestamps a nivel de segmento (`timestamps: segment`).
- Procesamiento de audio largo mediante decodificación por chunks sobre ventanas de 30 segundos.
- No soporta streaming (`streaming: false`).
- No soporta traducción de voz (`translate: false`); para traducción hay que usar whisper-large-v3.
- No es un modelo de texto: no genera código, no hace razonamiento textual ni tool calling. Su única entrada es audio y su salida es texto transcrito.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa audio largo mediante chunks de 30 segundos y genera timestamps por segmento, lo que permite alinear la transcripción con el hablante o el minuto de la reunión en herramientas de documentación interna.
- Subtitulado automático de vídeo: la salida con timestamps por segmento se puede convertir directamente a formato SRT o VTT, y la cuantización Q4_K_M (511 MB) permite ejecutarlo en el mismo servidor de codificación sin GPU dedicada.
- Dictado y notas de voz en aplicaciones de escritorio: con Q5_K_M o Q6_K cabe en memoria de cualquier portátil y se ejecuta por CPU con un factor de tiempo real de 0,8 en un Ryzen 4750U (procesa audio ligeramente más rápido que tiempo real).
- Indexación y búsqueda de archivos de audio: transcripción masiva de un archivo histórico de llamadas o podcasts para alimentar un motor de búsqueda de texto completo, aprovechando el throughput de 46,4x en tiempo real con Metal en un M4 Max.
- Cumplimiento y auditoría en centros de contacto: transcripción local de conversaciones con clientes sin enviar audio a servicios externos, lo que simplifica el cumplimiento de protección de datos al no salir el audio de la infraestructura propia.
- Accesibilidad: generación de transcripciones para contenido audiovisual en castellano y otras lenguas cooficiales (catalán, gallego, euskera) en plataformas educativas o institucionales.
- Preprocesado para pipelines de NLP: convertir audio a texto antes de pasarlo a un LLM para resumen, análisis de sentimiento o extracción de entidades, usando la detección de idioma para enrutar cada audio al modelo de texto adecuado.

## Benchmarks y rendimiento

| Métrica | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 2,00 | 2,00 | 1,96 | 2,00 | 2,00 |
| Tamaño (GB) | 1,51 | 0,845 | 0,660 | 0,591 | 0,511 |

| Métrica de velocidad | Backend | Valor (RTF) |
|---|---|---:|
| Factor de tiempo real, M4 Max | Metal | 46,4 |
| Factor de tiempo real, M4 Max | CPU | 1,8 |
| Factor de tiempo real, Ryzen 4750U | Vulkan | 3,4 |
| Factor de tiempo real, Ryzen 4750U | CPU | 0,8 |

El WER se midió sobre el split completo de LibriSpeech test-clean (2620 utterances) con la decodificación por defecto de transcribe.cpp. OpenAI reporta 2,10 % en el mismo split con su propia configuración de evaluación. Las cifras provienen de una única ejecución en CUDA (L4) contra estos GGUF exactos; la variación entre ejecuciones y backends en este corpus es de aproximadamente 0,1 puntos porcentuales, atribuida principalmente a resultados de alucinación en clips cortos cerca del suelo de ruido. No se han publicado resultados de benchmarks adicionales (p. ej. FLEURS, Common Voice) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB con Q4_K_M, 0,6 GB con Q5_K_M, 0,7 GB con Q6_K, 0,9 GB con Q8_0 y 1,6 GB con F16, incluyendo overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor reporta mediciones en NVIDIA L4 (CUDA) y en Apple M4 Max (Metal). No se han publicado cifras para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 2 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.), y también en CPU sin GPU.
- Despliegue: exclusivamente mediante transcribe.cpp (compilación desde fuente con CMake). No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI, ya que Whisper no es un modelo de texto y estos runtimes no implementan su pipeline de audio.
- Latencia y throughput: con Metal en M4 Max se alcanza un factor de tiempo real de 46,4 (unas 46 veces más rápido que tiempo real); con Vulkan en Ryzen 4750U, 3,4; con CPU en M4 Max, 1,8; con CPU en Ryzen 4750U, 0,8 (ligeramente por debajo de tiempo real). No se dispone de cifras de latencia por utterance ni de throughput en GPU NVIDIA más allá de la mención a una ejecución en L4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Formato | Notas |
|---|---|---:|---|---|---|---|
| whisper-large-v3-turbo (GGUF, esta ficha) | 808,9 M | 30 s por ventana, chunks para audio largo | 100 | Apache-2.0 | GGUF | Solo transcripción; decodificador de 4 capas |
| openai/whisper-large-v3 | no disponible en la información | 30 s por ventana | 100 | Apache-2.0 | safetensors | Decodificador de 32 capas; soporta traducción; más lento |
| openai/whisper-large-v3-turbo (original) | 808,9 M | 30 s por ventana | 100 | Apache-2.0 | safetensors | Pesos sin cuantizar; requiere transformers o similar |

La comparación con modelos ASR alternativos (p. ej. NVIDIA Parakeet, Meta MMS, Wav2Vec2) no está disponible en la información proporcionada. El dato diferencial frente a whisper-large-v3 es la velocidad de decodificación: 4 capas frente a 32, con una degradación de calidad descrita como menor por el autor del modelo base.

## Limitaciones y advertencias

- Solo transcripción: `task="translate"` no está soportado; para traducción de voz hay que usar whisper-large-v3.
- Sin streaming: el modelo requiere audio completo por chunks de 30 segundos; no es apto para reconocimiento en tiempo real continuo sin segmentación externa.
- Riesgo de alucinación en clips cortos o con ruido de fondo: el propio autor señala que la variación de WER entre ejecuciones se debe a resultados de alucinación en clips cerca del suelo de ruido.
- El WER reportado (1,96–2,00 %) corresponde a LibriSpeech test-clean, un corpus de lectura en inglés limpio; el rendimiento en audio real con acentos, ruido o code-switching será peor y no está cuantificado en la información disponible.
- Sesgos: no se documentan análisis de sesgo específicos en la información proporcionada; al heredar el modelo base de OpenAI, arrastra los sesgos de sus datos de entrenamiento (más de 5 millones de horas de datos etiquetados de origen no detallado).
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar la model card de OpenAI para los términos completos del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y los enlaces de descarga de la model card apuntan a `handy-computer/whisper-large-v3-turbo-gguf`, no a `tryambientai/whisper-large-v3-turbo-gguf`; verificar el origen de los pesos antes de usarlos en producción.
- El tamaño del repositorio (0,9 GB) es menor que el del fichero F16 (1,51 GB), lo que sugiere que no todas las cuantizaciones están alojadas en el repositorio de tryambientai.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tryambientai/whisper-large-v3-turbo-gguf
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Commit del modelo base usado para la conversión: https://huggingface.co/openai/whisper-large-v3-turbo/commit/41f01f3
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-large-v3-turbo.md
- Release 5.6.1 de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Paper de Whisper: https://huggingface.co/papers/2212.04356
- Discusión sobre large-v3-turbo en el repositorio de OpenAI: https://github.com/openai/whisper/discussions/2363
- Pesos GGUF en handy-computer (destino de los enlaces de descarga): https://huggingface.co/handy-computer/whisper-large-v3-turbo-gguf
