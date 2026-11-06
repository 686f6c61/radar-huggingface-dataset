# tryambientai/granite-speech-4.1-2b-plus-gguf

## Resumen

Granite-Speech-4.1-2B-Plus es un modelo de reconocimiento automático del habla (ASR) desarrollado por IBM Research dentro de la familia Granite. Esta ficha concreta corresponde a la conversión a formato GGUF realizada por el usuario `tryambientai` para su uso con el runtime `transcribe.cpp`, una implementación en C++ orientada a inferencia offline eficiente. El modelo resuelve el problema de transcripción multilingüe con marcas de tiempo a nivel de palabra y atribución de hablante, capacidades que la variante base de la familia no ofrece.

La arquitectura combina un encoder Conformer, un proyector BLIP-2 Q-Former y un decodificador autorregresivo basado en Granite-4.0-1B, sumando 2.111.899.452 parámetros totales. La variante "plus" introduce dos modificaciones respecto al modelo base 4.1-2b: el encoder concatena los estados ocultos de la capa intermedia (índice 3) con los de la capa final, duplicando la entrada K/V del proyector de 1024 a 2048 dimensiones, y los embeddings de tokens del LM están atados con el `lm_head`.

Es relevante ahora porque ofrece transcripción multilingüe (inglés, francés, alemán, español y portugués) con timestamps por palabra en un paquete de 2,3 GB que puede ejecutarse en hardware de consumo, algo poco habitual en modelos de audio-LLM de esta calidad. La licencia Apache-2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder + BLIP-2 Q-Former projector + decodificador autorregresivo Granite-4.0-1B |
| Parametros totales | 2.111.899.452 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, pt |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de audio-LLM en tres etapas. El encoder Conformer procesa audio de entrada a 16 kHz mono y genera representaciones acústicas. En esta variante "plus", el encoder concatena los estados ocultos de la capa intermedia (índice 3) con los de la capa final (`cat_hidden_layers=[3]`), lo que duplica la dimensión de entrada K/V del proyector Q-Former de 1024 a 2048. El proyector BLIP-2 Q-Former mapea estas representaciones al espacio del decodificador, que es un LLM autorregresivo Granite-4.0-1B con embeddings de tokens atados al `lm_head`.

Según la model card upstream, el entrenamiento se realizó sobre corpus similares a los de Granite-Speech-4.1-2B, aumentados con turnos de hablante y etiquetas de timestamp a nivel de palabra para habilitar las nuevas capacidades de transcripción enriquecida. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La variante "plus" no proporciona puntuación ni capitalización, a diferencia del modelo base.

## Capacidades

- Transcripción de voz a texto offline en inglés, francés, alemán, español y portugués.
- Marcas de tiempo a nivel de palabra, extraídas de los marcadores `[T:N]` en centisegundos que emite el modelo.
- Atribución de hablante (speaker-attributed ASR): etiquetas de hablante junto con la transcripción de palabras.
- Procesamiento de audio de entrada en formato WAV mono a 16 kHz.
- No realiza traducción de voz (a diferencia del modelo base 4.1-2b).
- No realiza detección de idioma automática.
- No soporta streaming (procesamiento por lotes offline).
- No soporta japonés en esta variante.

## Casos de uso

- Transcripción de reuniones y actas: el modelo genera transcripciones con timestamps por palabra y atribución de hablante, lo que permite reconstruir quién dijo qué y cuándo, adecuado para generar actas estructuradas automáticamente.
- Subtitulado de vídeo y audio: los timestamps a nivel de palabra facilitan la alineación de subtítulos con precisión de centisegundos, útil en pipelines de postproducción.
- Archivado y búsqueda de contenido audiovisual: la transcripción multilingüe con marcas temporales permite indexar y buscar dentro de grabaciones en cinco idiomas europeos.
- Atención al cliente y análisis de llamadas: la atribución de hablante y los timestamps permiten separar agente y cliente en grabaciones de call center y analizar tiempos de intervención.
- Despliegue en dispositivos de borde: con cuantización Q4_K_M (1,49 GB) y Q5_K_M (1,69 GB), el modelo cabe en hardware modesto y puede ejecutarse offline sin conexión, útil para aplicaciones de privacidad.
- Investigación en ASR multilingüe: al ser Apache-2.0 y estar disponible en GGUF, sirve como baseline reproducible para experimentos con `transcribe.cpp` y comparaciones de WER entre cuantizaciones.
- Accesibilidad: generación de transcripciones en tiempo no real para personas con discapacidad auditiva en contenido en inglés, francés, alemán, español o portugués.

## Benchmarks y rendimiento

Resultados de WER sobre LibriSpeech test-clean (2620 utterances, decodificación greedy, normalizador `EnglishTextNormalizer`):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 4,23 GB | 1,49% |
| F16 | 4,23 GB | 1,48% |
| Q8_0 | 2,35 GB | 1,50% |
| Q6_K | 1,86 GB | 1,46% |
| Q5_K_M | 1,69 GB | 1,48% |
| Q4_K_M | 1,49 GB | 1,56% |

El baseline BF16 reportado por el autor de la conversión es 1,48%, frente al 1,44% publicado por el upstream, diferencia de 0,04 pp atribuida a diferencias de plantilla de chat o normalización.

Rendimiento en tiempo real (RTF, menor es mejor):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 33 |
| Apple M4 Max | CPU | 5,2 |
| Apple M4 | Metal | 11 |
| Apple M4 | CPU | 5 |
| Ryzen 4750U | Vulkan | 2,75 |
| Ryzen 4750U | CPU | 1,4 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB para Q4_K_M, 1,7 GB para Q5_K_M, 1,9 GB para Q6_K, 2,4 GB para Q8_0 y 4,3 GB para BF16/F16.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el modelo se ha validado en Apple M4 y M4 Max con backend Metal, y en Ryzen 4750U con Vulkan.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.) usando cuantizaciones Q4_K_M o Q5_K_M.
- Opciones de despliegue: `transcribe.cpp` (runtime nativo en C++ con soporte Metal, Vulkan y CPU). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: RTF de 33 en M4 Max con Metal (unas 33 veces más rápido que tiempo real), RTF de 11 en M4 con Metal, RTF de 2,75 en Ryzen 4750U con Vulkan y RTF de 1,4 en el mismo Ryzen con CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Timestamps por palabra | Atribucion de hablante | Licencia | Formato |
|---|---|---:|---|---|---|---|
| granite-speech-4.1-2b-plus (este) | 2,11 B | en, fr, de, es, pt | si | si | Apache-2.0 | GGUF |
| granite-speech-4.1-2b (base) | no disponible | en, fr, de, es, pt, ja | no disponible | no disponible | Apache-2.0 | safetensors |
| Whisper large-v3 | no disponible | multilingue | si (a nivel de segmento) | no | MIT | safetensors, GGUF, etc. |

La comparación con Whisper large-v3 se incluye por categoría (ASR multilingüe de referencia); los datos concretos de parámetros y contexto de Whisper no se detallan en la información proporcionada. El modelo base 4.1-2b ofrece traducción de voz y japonés, capacidades que esta variante "plus" no incluye.

## Limitaciones y advertencias

- Esta variante no realiza traducción de voz ni detección automática de idioma.
- No soporta streaming: el procesamiento es offline por lotes.
- No proporciona puntuación ni capitalización en las transcripciones (a diferencia del modelo base).
- No soporta japonés, a diferencia de la variante base 4.1-2b.
- El modelo requiere audio de entrada en WAV mono a 16 kHz; es necesario remuestrear con herramientas externas como ffmpeg.
- Riesgo de alucinación inherente a los modelos de audio-LLM, especialmente en audio con ruido o habla solapada.
- La conversión GGUF es de un tercero (`tryambientai`) y está validada contra una versión concreta de `transcribe.cpp` (commit 275332d); cambios en el runtime pueden afectar la compatibilidad.
- La licencia Apache-2.0 permite uso comercial, pero conviene consultar la model card upstream para términos completos.
- No se dispone de datos sobre sesgos específicos del modelo en la información proporcionada.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/tryambientai/granite-speech-4.1-2b-plus-gguf
- Modelo base upstream: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-plus
- Commit upstream de referencia: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-plus/commit/edd3bf5
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/275332d
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/granite-speech-4.1-2b-plus.md
- Modelo base 4.1-2b (sin plus): https://huggingface.co/ibm-granite/granite-speech-4.1-2b
- Conversión GGUF alternativa en handy-computer: https://huggingface.co/handy-computer/granite-speech-4.1-2b-plus-gguf
