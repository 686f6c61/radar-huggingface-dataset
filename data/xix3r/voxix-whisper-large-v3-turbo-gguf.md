# xix3r/voxix-whisper-large-v3-turbo-gguf

## Resumen

Voxix Whisper Large v3 Turbo GGUF es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) `openai/whisper-large-v3-turbo`, publicada por el usuario xix3r y destinada a su ejecución con el runtime `transcribe.cpp`. Se trata de una cuantización del checkpoint original de OpenAI, no de un modelo entrenado desde cero: la autoría intelectual y los pesos subyacentes corresponden a OpenAI, mientras que esta ficha describe el artefacto empaquetado y sus cuantizaciones asociadas.

El modelo base es un transformer encoder-decoder con aproximadamente 809 millones de parámetros, resultado de podar las capas del decodificador de Whisper large-v3 de 32 a 4, lo que reduce drásticamente el coste de inferencia a cambio de una degradación menor de calidad. Soporta transcripción multilingüe en torno a 100 idiomas, detección de idioma y marcas de tiempo a nivel de segmento, pero no soporta traducción de voz a texto.

La relevancia de esta conversión radica en que permite ejecutar un modelo ASR de calidad cercana al estado del arte en hardware modesto, con cuantizaciones que van desde 511 MB (Q4_K_M) hasta 1,51 GB (F16), manteniendo un WER de aproximadamente el 2 % en LibriSpeech test-clean. Es una opción práctica para transcripción local, privada y de baja latencia en CPU, GPU o Apple Silicon.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), decodificador podado a 4 capas |
| Parametros totales | 808.904.208 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos con decodificación por chunks para audio largo; contexto textual no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | ~100 idiomas, incluidos en, es, ca, gl, eu, zh, de, fr, ru, ja, pt, ar, hi, entre otros; añade cantonés (yue) respecto a v2 |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (runtime transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de la familia Whisper. La entrada de audio se convierte en un espectrograma mel de 128 bins (frente a los 80 de versiones anteriores), procesado en ventanas de 30 segundos; para audio más largo se aplica decodificación por chunks. La innovación principal de la variante turbo es la poda del decodificador: se reduce de 32 a 4 capas, lo que disminuye el coste computacional de forma sustancial con una pérdida de calidad mínima.

El entrenamiento procede de OpenAI: Whisper fue entrenado con más de 5 millones de horas de datos etiquetados y demuestra una fuerte capacidad de generalización zero-shot. La variante turbo se afinó específicamente con datos de transcripción, excluyendo la traducción, de ahí que no soporte `task="translate"`. Esta conversión GGUF se portó desde el commit upstream `41f01f3` (fijado el 2026-04-25) y se validó contra la referencia de transformers en el commit `5.6.1` de transcribe.cpp el 2026-04-26.

## Capacidades

- Transcripción automática de voz a texto multilingüe en aproximadamente 100 idiomas.
- Detección automática de idioma (`lang_detect: true`).
- Marcas de tiempo a nivel de segmento (`timestamps: segment`).
- Procesamiento de audio largo mediante ventanas de 30 segundos y decodificación por chunks.
- No soporta traducción de voz a texto (`translate: false`); para ello debe usarse `whisper-large-v3`.
- No soporta streaming (`streaming: false`).
- No incluye tool calling, razonamiento multi-paso ni capacidades de agente; es un modelo puramente ASR.

## Casos de uso

- Transcripción local de reuniones y entrevistas: el modelo procesa audio en ventanas de 30 segundos con decodificación por chunks, lo que permite transcribir grabaciones largas en un portátil sin enviar datos a la nube.
- Subtitulado automático de vídeo: las marcas de tiempo a nivel de segmento permiten generar ficheros de subtítulos alineados con el audio, útiles en pipelines de postproducción.
- Dictado y notas de voz: con la cuantización Q4_K_M (511 MB) puede ejecutarse en CPU y ofrecer transcripción en tiempo real o casi real en hardware de consumo.
- Atención al cliente y análisis de llamadas: la transcripción multilingüe permite procesar conversaciones en distintos idiomas y alimentar sistemas de análisis de sentimiento o extracción de entidades.
- Investigación lingüística y corpus: el soporte de ~100 idiomas, incluidos idiomas de bajos recursos (haw, mi, yue, entre otros), facilita la creación de corpus transcritos en contextos con pocos recursos.
- Procesamiento por lotes en servidores: con la variante F16 (1,51 GB) y una GPU L4 o similar se obtiene un WER de ~2 % en LibriSpeech test-clean, adecuado para pipelines de transcripción masiva.
- Aplicaciones de accesibilidad: generación de transcripciones en vivo para personas con discapacidad auditiva en entornos con hardware modesto.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| WER LibriSpeech test-clean, F16 | 2,00 % |
| WER LibriSpeech test-clean, Q8_0 | 2,00 % |
| WER LibriSpeech test-clean, Q6_K | 1,96 % |
| WER LibriSpeech test-clean, Q5_K_M | 2,00 % |
| WER LibriSpeech test-clean, Q4_K_M | 2,00 % |
| WER reportado por OpenAI (misma partición) | 2,10 % |
| RTF en Apple M4 Max (Metal) | 46,4 |
| RTF en Apple M4 Max (CPU) | 1,8 |
| RTF en Ryzen 4750U (Vulkan) | 3,4 |
| RTF en Ryzen 4750U (CPU) | 0,8 |

Las cifras de WER se midieron sobre la partición completa de LibriSpeech test-clean (2620 enunciados) con la decodificación por defecto de transcribe.cpp (greedy, suppress_tokens, temperature fallback, timestamps de segmento activados), en una única ejecución sobre CUDA (L4). La variación entre ejecuciones y backends es de aproximadamente 0,1 puntos porcentuales. El RTF (factor de tiempo real) indica cuántas veces más rápido que el tiempo real procesa el audio: valores superiores a 1 implican procesamiento más rápido que la reproducción.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 GB (Q4_K_M) y 1,5 GB (F16) para los pesos; el consumo real depende del backend y del búfer de audio.
- GPU recomendadas: NVIDIA L4 (usada para las mediciones de WER), A100, H100 para despliegues de alto rendimiento; RTX 4090 y GPUs consumer con suficiente VRAM para las cuantizaciones mayores.
- Cabe en GPU consumer: sí, todas las cuantizaciones caben en GPUs con 2 GB o más de VRAM; Q4_K_M y Q5_K_M son adecuadas para GPUs de gama baja.
- Apple Silicon: el modelo se ejecuta con backend Metal, con un RTF de 46,4 en M4 Max.
- CPU: funciona en CPU x86 con backend Vulkan o CPU nativo; en Ryzen 4750U el RTF es de 3,4 con Vulkan y 0,8 con CPU.
- Opciones de despliegue: transcribe.cpp (runtime nativo del artefacto), compilado desde fuente con CMake; no se indica soporte oficial de vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: el RTF de 46,4 en M4 Max (Metal) implica procesar unas 46 veces más rápido que el tiempo real; en CPU de portátil el RTF es inferior a 1, por lo que no alcanza tiempo real en ese hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| whisper-large-v3-turbo (este GGUF) | ~809 M | ventanas de 30 s | ~100 | Apache-2.0 | GGUF |
| openai/whisper-large-v3 | ~1550 M | ventanas de 30 s | ~100 | Apache-2.0 | safetensors |
| openai/whisper-large-v3-turbo (original) | ~809 M | ventanas de 30 s | ~100 | Apache-2.0 | safetensors |

Frente a `whisper-large-v3`, la variante turbo reduce el decodificador de 32 a 4 capas, lo que la hace mucho más rápida con una degradación de calidad menor, pero pierde la capacidad de traducción de voz. Frente al checkpoint original en safetensors, esta conversión GGUF ofrece cuantizaciones de 4 a 8 bits con un WER prácticamente idéntico y un tamaño mucho menor, a cambio de requerir el runtime transcribe.cpp.

## Limitaciones y advertencias

- No soporta traducción de voz a texto: `task="translate"` no está disponible; para traducción debe usarse `whisper-large-v3`.
- No soporta streaming: la decodificación es por segmentos y chunks, no en tiempo real continuo.
- Riesgo de alucinación en clips cortos o con ruido de fondo, según advierte el autor; es la principal fuente de variación en el WER.
- El WER se midió únicamente en LibriSpeech test-clean (inglés); no hay datos publicados de rendimiento en otros idiomas ni en dominios con acento o ruido.
- El rendimiento en CPU de portátiles puede no alcanzar el tiempo real (RTF inferior a 1 en Ryzen 4750U con CPU).
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial; deben consultarse los términos upstream para detalles.
- El artefacto tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su validación comunitaria es inexistente.
- Depende del runtime transcribe.cpp; no se garantiza compatibilidad con otras herramientas de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/xix3r/voxix-whisper-large-v3-turbo-gguf
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Commit upstream del modelo base: https://huggingface.co/openai/whisper-large-v3-turbo/commit/41f01f3
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-large-v3-turbo.md
- Paper de Whisper: https://huggingface.co/papers/2212.04356
- Discusión sobre la variante turbo: https://github.com/openai/whisper/discussions/2363
