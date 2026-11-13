# xix3r/voxix-moonshine-base-ko-gguf

## Resumen

`voxix-moonshine-base-ko-gguf` es una conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) `UsefulSensors/moonshine-base-ko`, desarrollada por el usuario `xix3r` para su uso con el runtime `transcribe.cpp`. Se trata de un modelo encoder-decoder transformer de 61,5 millones de parámetros, especializado exclusivamente en transcripción de audio en coreano, que hereda la arquitectura Moonshine original de Useful Sensors (variante base).

El modelo resuelve el problema de la transcripción de voz a texto en coreano en entornos donde no se dispone de una GPU de altas prestaciones o donde se busca una latencia mínima. Su principal innovación frente a Whisper es que consume PCM crudo a 16 kHz directamente mediante un stem de tres capas Conv1d, sin STFT ni banco de filtros mel, lo que reduce el coste computacional del preprocesado y permite ejecución eficiente en CPU y GPUs integradas. El contexto de audio es dinámico: el modelo procesa la señal de entrada completa sin ventana fija predefinida.

La relevancia de esta ficha radica en que es una de las pocas distribuciones GGUF verificadas de Moonshine para coreano, con métricas de CER publicadas y validación numérica frente a la referencia en Transformers. El repo ocupa 0,1 GB e incluye tres cuantizaciones (F32, F16 y Q8_0), lo que facilita el despliegue en dispositivos de borde y en pipelines de transcripción de bajo coste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Moonshine base) |
| Parámetros totales | 61.513.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de longitud variable; sin ventana fija documentada) |
| Tipos de cuantización | F32, F16, Q8_0 |
| Idiomas soportados | coreano (ko) únicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp); pesos originales en safetensors en el modelo base |
| Tamaño del repo | 0,1 GB |
| Entrada de audio | PCM crudo a 16 kHz, mono |
| Salida | solo transcripción (sin traducción, sin detección de idioma, sin timestamps) |
| Streaming | no soportado |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine base: un encoder-decoder transformer de 62M parámetros que sustituye el frontend clásico de Whisper (STFT + mel filterbank) por un stem de tres capas Conv1d que opera directamente sobre PCM crudo a 16 kHz. Esta decisión elimina el coste de preprocesado espectral y hace que el modelo escale con la duración real del audio en lugar de con una ventana fija de 30 segundos, lo que reduce la latencia en utterances cortas. La salida es únicamente texto transcrito, sin etiquetas de tiempo ni detección de idioma.

El modelo base `UsefulSensors/moonshine-base-ko` es un fine-tuning de Moonshine base sobre coreano, según indica la model card. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión a GGUF se realizó a partir del commit `fff6035` del modelo base (fijado el 2026-05-12) y se validó numéricamente contra la referencia en Transformers en el commit `90bf720` de transcribe.cpp el 2026-05-12.

## Capacidades

- Transcripción de voz a texto en coreano a partir de audio PCM de 16 kHz mono.
- Procesamiento de utterances de duración variable sin ventana fija de 30 segundos.
- Ejecución en CPU, GPU integrada (Metal) y GPUs discretas vía Vulkan.
- Inferencia de baja latencia gracias a la eliminación del frontend mel y al reducido tamaño del modelo (62M parámetros).
- No soporta traducción: la salida es siempre texto en coreano.
- No soporta detección automática de idioma.
- No soporta timestamps ni alineación temporal a nivel de palabra o segmento.
- No soporta streaming: requiere el audio completo antes de emitir la transcripción.
- No soporta tool calling ni function calling (es un modelo ASR, no un LLM conversacional).
- No soporta razonamiento multi-paso ni modo de pensamiento.

## Casos de uso

- Transcripción de reuniones y notas de voz en coreano: el modelo procesa el audio completo de la reunión y devuelve la transcripción en una sola pasada, con un CER del 8,00% en F32 y 8,13% en Q8_0 sobre FLEURS-ko, adecuado para actas y resúmenes posteriores.
- Subtitulado offline de contenido audiovisual en coreano: integrado en un pipeline con `ffmpeg` para convertir a 16 kHz mono WAV y `transcribe-cli` para generar el texto, sin necesidad de GPU dedicada.
- Asistentes de voz embebidos en dispositivos de borde: los 74 MB de la cuantización Q8_0 permiten cargar el modelo en memoria de un SoC o una Raspberry Pi, con un RTF de 22 en CPU Ryzen 4750U (es decir, procesa audio aproximadamente 22 veces más rápido que tiempo real).
- Transcripción en tiempo casi real en portátiles con GPU integrada: el RTF de 79,5 en Metal sobre un chip M4 Max permite transcribir audio en directo con una latencia muy baja, útil para aplicaciones de dictado.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: el RTF de 80,5 en CPU sobre M4 Max permite procesar grandes volúmenes de grabaciones en coreano con un coste energético reducido.
- Integración en aplicaciones móviles o de escritorio multiplataforma: al ser GGUF y ejecutarse con transcribe.cpp (C++), puede enlazarse en apps nativas sin depender de Python ni de PyTorch.
- Transcripción de llamadas de atención al cliente en coreano: el modelo puede alimentar un pipeline posterior de análisis de sentimiento o extracción de entidades, dado que la transcripción es la única salida y no requiere postprocesado de etiquetas.

## Benchmarks y rendimiento

Resultados de CER sobre el split de test de FLEURS-ko (382 utterances), decodificación greedy con `num_beams=1` y `max_length=192` (configuración por defecto de transcribe.cpp):

| Cuantización | Tamaño | CER (FLEURS ko test) |
|---|---:|---:|
| F32 | 236 MB | 8,00% |
| F16 | 126 MB | 8,00% |
| Q8_0 | 74 MB | 8,13% |
| Referencia Transformers F32 (MPS) | no disponible | 8,19% |

Métricas de velocidad (RTF, real-time factor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 79,5 |
| Apple M4 Max | CPU | 80,5 |
| AMD Ryzen 4750U | Vulkan | 34,5 |
| AMD Ryzen 4750U | CPU | 22,0 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo ASR y no de un LLM generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones (236 MB en F32, 126 MB en F16, 74 MB en Q8_0), incluyendo overhead del runtime.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA); no requiere GPU dedicada de altas prestaciones.
- Cabe en GPU de consumo: sí, en cualquier GPU integrada o discreta de los últimos 10 años, así como en CPUs modernas.
- Opciones de despliegue: `transcribe.cpp` (runtime C++ con CLI `transcribe-cli`); el modelo base también es compatible con Transformers (`MoonshineForConditionalGeneration`).
- Latencia y throughput: RTF de 79,5–80,5 en M4 Max y 22–34,5 en Ryzen 4750U, lo que implica que el modelo procesa audio entre 22 y 80 veces más rápido que tiempo real según plataforma.
- Almacenamiento: menos de 250 MB para cualquier cuantización individual.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto de audio | Licencia | Formato | CER FLEURS-ko |
|---|---:|---|---|---|---|---:|
| voxix-moonshine-base-ko-gguf | 61,5M | coreano | variable (PCM 16 kHz) | MIT | GGUF | 8,00% (F32) |
| UsefulSensors/moonshine-base-ko | 61,5M | coreano | variable (PCM 16 kHz) | MIT | safetensors | 8,19% (referencia Transformers) |
| Whisper base | 74M | multilingüe (99 idiomas) | 30 s fijos | MIT | safetensors, GGUF, etc. | no disponible en la información |
| Whisper small | 244M | multilingüe (99 idiomas) | 30 s fijos | MIT | safetensors, GGUF, etc. | no disponible en la información |

La comparativa con Whisper se ofrece como referencia de categoría (ASR de tamaño pequeño), pero no se dispone de cifras de CER de Whisper sobre FLEURS-ko en la información proporcionada, por lo que no se establece una comparación numérica directa.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe coreano; no detecta el idioma ni traduce a otros idiomas.
- Sin timestamps: no proporciona alineación temporal, lo que limita su uso en subtitulado con sincronización precisa.
- Sin streaming: requiere el audio completo antes de generar la transcripción, lo que añade latencia en utterances largas.
- Riesgo de alucinación: como todo modelo ASR, puede generar texto plausible en segmentos con ruido, silencios largos o audio ininteligible; la model card original recomienda limitar la longitud máxima de generación para evitar bucles de alucinación.
- Sensible a la calidad del audio: al consumir PCM crudo sin normalización mel, el rendimiento puede degradarse con ruido de fondo, reverberación o micrófonos de baja calidad.
- Requiere remuestreo previo: la entrada debe ser WAV mono a 16 kHz; audio en otros formatos o frecuencias necesita conversión con `ffmpeg` u otra herramienta.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda revisar los términos del modelo base y citar adecuadamente a Useful Sensors.
- Validación limitada: el CER publicado se basa en un único conjunto (FLEURS-ko, 382 utterances); no hay evaluación en dominios específicos (médico, legal, técnico) ni en habla espontánea o con acentos regionales.
- Repo con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de adopción comunitaria ni de mantenimiento continuado por parte del autor de la conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xix3r/voxix-moonshine-base-ko-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-base-ko
- Commit del modelo base utilizado: https://huggingface.co/UsefulSensors/moonshine-base-ko/commit/fff6035
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentación de Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Paper de Moonshine: https://arxiv.org/abs/2410.15608
- Blog de presentación de Moonshine: https://petewarden.com/2024/10/21/introducing-moonshine-the-new-state-of-the-art-for-speech-to-text/
- Repositorio de Useful Sensors: https://github.com/usefulsensors/moonshine
- Paper de model cards (Mitchell et al.): https://arxiv.org/abs/1810.03993
- Podcast de presentación: https://notebooklm.google.com/notebook/d787d6c2-7d7b-478c-b7d5-a0be4c74ae19/audio
- Descarga F32: https://huggingface.co/handy-computer/moonshine-base-ko-gguf/resolve/main/moonshine-base-ko-F32.gguf
- Descarga F16: https://huggingface.co/handy-computer/moonshine-base-ko-gguf/resolve/main/moonshine-base-ko-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/moonshine-base-ko-gguf/resolve/main/moonshine-base-ko-Q8_0.gguf
