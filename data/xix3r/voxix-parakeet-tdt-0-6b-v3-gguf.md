# xix3r/voxix-parakeet-tdt-0.6b-v3-gguf

## Resumen

voxix-parakeet-tdt-0.6b-v3-gguf es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) nvidia/parakeet-tdt-0.6b-v3, publicada por el usuario xix3r y pensada para su uso con el runtime transcribe.cpp. El modelo base lo desarrolla NVIDIA y resuelve transcripción de voz a texto multilingüe en 25 lenguas europeas, incluyendo el español, con detección automática de idioma. Con 627.052.166 parámetros, se sitúa en la franja de 0,6B, lo que permite ejecución local en hardware modesto.

La arquitectura combina un encoder Conformer (FastConformer) con un decodificador transducer TDT/RNNT, una elección habitual en ASR de alto rendimiento por su capacidad de alinear audio y texto sin modelos de lenguaje externos. La conversión GGUF aporta cuantizaciones desde F32 hasta Q4_K_M, con tamaños que van de 2,51 GB a 502 MB, manteniendo un WER en LibriSpeech test-clean entre 1,92 % y 1,98 %, prácticamente idéntico al baseline F32 de 1,95 %.

Su relevancia actual radica en que ofrece transcripción multilingüe con puntuación, mayúsculas y marcas de tiempo a nivel de token en un paquete ligero y desplegable en CPU o GPU de consumo mediante Metal o Vulkan. No es un modelo de streaming ni traduce, pero cubre el caso de uso de transcripción offline de ficheros de audio con una calidad medida y reproducible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (FastConformer) con decodificador transducer TDT/RNNT |
| Parámetros totales | 627.052.166 (0,6B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; entrada de audio de 16 kHz mono) |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 25 lenguas europeas: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura FastConformer como encoder, seguida de un decodificador transducer de tipo TDT (Token-and-Duration Transducer), una variante de RNNT que modela conjuntamente tokens y duraciones para mejorar la eficiencia de alineación. Esta combinación es típica en los modelos Parakeet de NVIDIA y permite decodificación greedy sin necesidad de un modelo de lenguaje externo, como confirma la evaluación del autor de la conversión.

El entrenamiento se apoya en el corpus multilingüe Granary de NVIDIA, según la model card upstream, y el modelo extiende el soporte de idioma de su predecesor parakeet-tdt-0.6b-v2 (solo inglés) a 25 lenguas europeas. La model card original menciona puntuación y mayúsculas automáticas, así como marcas de tiempo a nivel de palabra y token. No se detallan en la información proporcionada el número exacto de tokens de entrenamiento, la composición completa del dataset ni si hubo fases de RLHF o DPO; esos datos figuran como no disponibles.

La conversión GGUF fue portada desde el commit upstream 6d590f7 y validada contra la referencia NeMo en el commit bf0d0b7 de transcribe.cpp. Las cuantizaciones conservan el rendimiento del baseline: el WER en LibriSpeech test-clean varía solo entre 1,92 % (Q5_K_M) y 1,98 % (Q4_K_M), frente al 1,95 % de F32 y el 1,93 % autoinformado por NVIDIA.

## Capacidades

- Transcripción de voz a texto multilingüe en 25 lenguas europeas, con detección automática de idioma (lang_detect: true).
- Puntuación y capitalización automáticas en la salida.
- Marcas de tiempo a nivel de token (timestamps: token), útiles para subtitulado y alineación.
- Decodificación greedy con transducer TDT/RNNT, sin modelo de lenguaje externo.
- Entrada de audio de 16 kHz mono WAV; requiere conversión previa de otros formatos con ffmpeg.
- No soporta streaming (streaming: false).
- No soporta traducción (translate: false).
- No incluye tool calling, function calling ni capacidades de agente, al ser un modelo puramente ASR.
- No dispone de visión ni audio generativo; solo transcribe audio entrante.

## Casos de uso

- Subtitulado automático de vídeo: el modelo genera transcripciones con marcas de tiempo a nivel de token, lo que permite segmentar subtítulos con precisión temporal en 25 idiomas europeos sin necesidad de alineadores externos.
- Actas y notas de reuniones: al aceptar audio de 16 kHz mono y producir puntuación y mayúsculas automáticas, se puede transcribir grabaciones de reuniones en español, inglés o francés y obtener texto listo para revisión.
- Transcripción de entrevistas y podcasts: la calidad medida (WER 1,92-1,98 % en LibriSpeech test-clean) y la cuantización Q5_K_M de 565 MB permiten procesar horas de audio en local en un portátil, sin enviar datos a la nube.
- Atención al cliente y análisis de llamadas: la detección automática de idioma facilita transcribir llamadas en distintos idiomas europeos y alimentar sistemas de análisis de sentimiento o búsqueda sobre el texto resultante.
- Accesibilidad y documentación: conversión de notas de voz y grabaciones a texto para personas con discapacidad auditiva o para archivos documentales, ejecutable en CPU con Vulkan o Metal.
- Procesamiento por lotes en servidores modestos: el runtime transcribe.cpp permite desplegar el modelo en CPU (Ryzen 4750U con RTF 7,5) o en GPU integrada (RTF 12,5 con Vulkan), adecuado para pipelines de transcripción masiva sin GPUs dedicadas.
- Investigación en ASR multilingüe: el modelo sirve como referencia reproducible con cuantizaciones validadas numéricamente contra NeMo, útil para comparar técnicas de compresión en tareas de reconocimiento de voz.

## Benchmarks y rendimiento

| Métrica | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,95 | 1,95 | 1,94 | 1,93 | 1,92 | 1,98 |
| Tamaño (GB) | 2,51 | 1,26 | 0,740 | 0,627 | 0,565 | 0,502 |

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 151 |
| Apple M4 Max | CPU | 28 |
| AMD Ryzen 4750U | Vulkan | 12,5 |
| AMD Ryzen 4750U | CPU | 7,5 |

El WER se midió sobre el split completo de LibriSpeech test-clean (2620 utterances) con decodificación greedy del transducer y sin modelo de lenguaje externo. El baseline F32 es 1,95 %; NVIDIA autoinforma 1,93 % en el mismo split. El RTF (real-time factor) indica veces más rápido que tiempo real: 151 significa 151 veces más rápido que la reproducción del audio.

## Requisitos de hardware

- VRAM estimada: 2,51 GB para F32, 1,26 GB para F16, 740 MB para Q8_0, 627 MB para Q6_K, 565 MB para Q5_K_M y 502 MB para Q4_K_M.
- Cabe en cualquier GPU de consumo moderna; la cuantización Q8_0 (740 MB) o Q4_K_M (502 MB) es adecuada incluso para GPUs integradas.
- GPU recomendadas: no se especifican modelos concretos en la información; los datos de rendimiento se han medido en Apple M4 Max (Metal) y AMD Ryzen 4750U (Vulkan).
- Despliegue: exclusivamente mediante transcribe.cpp, que requiere compilación desde fuente con CMake. No se mencionan soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 151 en Metal (M4 Max), 28 en CPU (M4 Max), 12,5 en Vulkan (Ryzen 4750U) y 7,5 en CPU (Ryzen 4750U). En todos los casos supera ampliamente el tiempo real.
- Requiere audio de entrada en WAV mono a 16 kHz; la conversión desde otros formatos se hace con ffmpeg.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto/entrada | Licencia | Formato |
|---|---|---|---|---|---|
| voxix-parakeet-tdt-0.6b-v3-gguf | 627 M | 25 europeos | audio 16 kHz mono | CC-BY-4.0 | GGUF |
| nvidia/parakeet-tdt-0.6b-v3 (base) | 600 M | 25 europeos | audio 16 kHz mono | CC-BY-4.0 | NeMo |
| nvidia/parakeet-tdt-0.6b-v2 | 600 M | inglés | audio 16 kHz mono | no disponible en la información | NeMo |

No se dispone en la información proporcionada de datos de benchmarks comparativos con otros modelos ASR de la competencia (Whisper, Wav2Vec2, etc.), por lo que la comparación cuantitativa de rendimiento entre familias queda como no disponible. La comparación principal es con el modelo base y su predecesor, donde la conversión GGUF mantiene el WER dentro de 0,05 puntos porcentuales y añade portabilidad a CPU y GPU integradas.

## Limitaciones y advertencias

- No es un modelo de streaming: requiere ficheros de audio completos, lo que lo descarta para transcripción en tiempo real de micrófono.
- No traduce: solo transcribe en el idioma detectado; no hay salida bilingüe.
- Solo acepta WAV mono a 16 kHz; el audio en otros formatos o frecuencias debe convertirse previamente.
- El WER de 1,92-1,98 % corresponde a LibriSpeech test-clean en inglés; el rendimiento en las otras 24 lenguas no se documenta en la información disponible.
- Riesgo de alucinación inherente a los modelos transducer en audio con ruido, silencios largos o habla solapada; no se documentan tasas específicas.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero conviene revisar los términos completos en la model card upstream de NVIDIA.
- El despliegue depende de transcribe.cpp, un runtime específico que debe compilarse desde fuente; no hay integración documentada con ecosistemas estándar como Hugging Face Transformers, vLLM o llama.cpp.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la conversión fue validada contra un commit concreto de transcribe.cpp; cambios posteriores del runtime podrían afectar a la compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xix3r/voxix-parakeet-tdt-0.6b-v3-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Commit upstream de referencia: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3/commit/6d590f7
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/bf0d0b7
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-tdt-0.6b-v3.md
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/nvidia/parakeet-tdt-0.6b-v3
- Dataset Granary: https://huggingface.co/datasets/nvidia/Granary
- Predecesor parakeet-tdt-0.6b-v2: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Papers referenciados en los tags: arXiv 2509.14128, 2505.13404, 2305.05084, 2304.06795, 2410.01036, 2406.00899, 2205.12446, 2012.03411, 2007.10310, 1510.08484
