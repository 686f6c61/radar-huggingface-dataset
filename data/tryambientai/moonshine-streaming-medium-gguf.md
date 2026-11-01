# tryambientai/moonshine-streaming-medium-gguf

## Resumen

moonshine-streaming-medium-gguf es la conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) UsefulSensors/moonshine-streaming-medium, publicada por el usuario tryambientai para su uso con la librería transcribe.cpp. El modelo original lo desarrolla Useful Sensors y forma parte de la familia Moonshine Streaming, diseñada específicamente para transcripción de voz en streaming de baja latencia sobre hardware de clase edge. Con 265.898.113 parámetros totales (245M según la model card del autor de la conversión), es la variante más profunda y ancha de las tres de la familia (tiny, small y medium).

La relevancia de esta conversión es práctica: empaqueta un modelo ASR de 245M parámetros en ficheros GGUF de entre 282 MB (Q8_0) y 1015 MB (F32), lo que permite ejecutar transcripción en CPU y GPU de consumo sin depender de PyTorch ni de CUDA. La validación numérica reportada muestra que las cuantizaciones F32, F16 y Q8_0 son indistinguibles entre sí en la métrica WER sobre LibriSpeech test-clean (2,16 % en las tres), por lo que la versión Q8_0 de 282 MB es la opción racional para despliegue.

Se trata de un modelo exclusivamente en inglés, sin traducción, sin detección de idioma y sin marcas de tiempo. Su licencia MIT, heredada del modelo base, facilita la integración en productos comerciales. El repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una conversión reciente y de nicho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer con encoder ergódico (atención local con ventana deslizante, sin embeddings posicionales) y adaptador posicional antes del decoder autorregresivo |
| Parámetros totales | 265.898.113 (245M según la model card del conversor) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | F32, F16, Q8_0 (no se distribuyen Q6_K, Q5_K_M ni Q4_K_M para esta variante) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp) |
| Frontend de audio | 50 Hz en dominio temporal, entrada WAV mono a 16 kHz |
| Capas | 14 encoder / 14 decoder |
| Dimensiones ocultas | Encoder 768 / decoder 640 |
| Tamaño del repo | 0,3 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder Transformer adaptada a streaming. El encoder es "ergódico": emplea atención local con ventana deslizante y prescinde de embeddings posicionales, de modo que la representación es invariante a la posición absoluta y puede procesar audio de forma incremental. Un adaptador inyecta información posicional antes del decoder autorregresivo estándar, que genera la transcripción token a token. El frontend de audio opera a 50 Hz en el dominio temporal, lo que reduce la carga computacional frente a enfoques basados en espectrogramas de mayor resolución.

La model card del conversor no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo base fue entrenado y publicado por Useful Sensors, y la documentación técnica completa se remite al paper de Moonshine Streaming enlazado en la model card original. La innovación destacable es el diseño para baja latencia en hardware edge: atención local acotada, frontend ligero y soporte nativo de streaming, validado en transcribe.cpp con métricas de tiempo real (RTF) sobre Apple M4 Max y AMD Ryzen 4750U.

## Capacidades

- Transcripción de voz a texto en inglés a partir de audio WAV mono a 16 kHz.
- Procesamiento en streaming: el modelo está diseñado para transcripción incremental con baja latencia, no solo por lotes.
- Funcionamiento en CPU y GPU de consumo gracias al formato GGUF y a las cuantizaciones disponibles.
- Salida de transcripción sin traducción: no convierte inglés a otros idiomas.
- Sin detección automática de idioma: asume entrada en inglés.
- Sin generación de marcas de tiempo (timestamps: none).
- No soporta tool calling, function calling ni razonamiento multi-step; es un modelo ASR puro.
- No dispone de capacidades de visión, audio generativo ni modo thinking.

## Casos de uso

- Subtitulado en directo de reuniones y videollamadas: el modelo procesa audio en streaming con ventana deslizante y puede alimentar un pipeline que emita transcripciones parciales mientras se habla, gracias a su encoder ergódico y a su frontend de 50 Hz.
- Dictado por voz en aplicaciones de escritorio: con la cuantización Q8_0 (282 MB) cabe en memoria de cualquier portátil y se ejecuta en CPU, lo que permite integrar dictado local sin enviar audio a la nube.
- Transcripción de notas de voz y podcasts en inglés: la conversión por lotes de ficheros WAV permite procesar grabaciones completas con una calidad de 2,16 % WER en LibriSpeech test-clean, adecuada para contenido hablado limpio.
- Asistentes de voz embebidos en dispositivos edge: el diseño para hardware de clase edge y el RTF reportado (63 en Metal sobre M4 Max, 7,5 en CPU sobre Ryzen 4750U) lo hacen viable en equipos sin GPU dedicada.
- Indexación y búsqueda de archivos de audio: transcribir un corpus de grabaciones en inglés para generar texto indexable en motores de búsqueda o sistemas RAG, usando Q8_0 para minimizar el espacio en disco.
- Accesibilidad para personas con discapacidad auditiva: generación de subtítulos en tiempo real en aplicaciones locales, con la ventaja de que el procesamiento ocurre en el dispositivo y no requiere conexión.
- Automatización de actas en atención al cliente: transcripción de llamadas grabadas en inglés para su posterior análisis, con la ventaja de una licencia MIT que no impone restricciones de uso comercial.

## Benchmarks y rendimiento

| Métrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 2,16 | 2,16 | 2,16 |
| RTF en Apple M4 Max (Metal) | 63 | 63 | 63 |
| RTF en Apple M4 Max (CPU) | 35,5 | 35,5 | 35,5 |
| RTF en AMD Ryzen 4750U (Vulkan) | 14 | 14 | 14 |
| RTF en AMD Ryzen 4750U (CPU) | 7,5 | 7,5 | 7,5 |

El WER se midió sobre el split completo de LibriSpeech test-clean (2620 utterances) con decodificación greedy (`num_beams=1`, `do_sample=False`). Useful Sensors reporta 2,08 % en el mismo split según la tabla del Open ASR Leaderboard; la diferencia de +0,08 pp se atribuye a diferencias de scoring y normalización de texto, no a deriva numérica, y se ha verificado que las hipótesis del port coinciden en un 99,6 % con las de HF Transformers en la variante tiny. El RTF (real-time factor) indica cuántas veces más rápido que tiempo real procesa el modelo; valores más altos son mejores.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el fichero Q8_0 ocupa 282 MB y F16 509 MB, por lo que la memoria necesaria es del orden de esas cifras más el overhead del runtime.
- GPU recomendadas: no se especifican requisitos mínimos; el modelo está pensado para edge y CPU. Se ha validado con backend Metal en Apple M4 Max y Vulkan en AMD Ryzen 4750U.
- Cabe en cualquier GPU de consumo: los 282 MB de Q8_0 no suponen ninguna restricción para tarjetas como RTX 4090, RTX 3060 o integradas.
- Opciones de despliegue: transcribe.cpp (librería nativa del formato), y el modelo base es compatible con Hugging Face Transformers (`MoonshineStreamingForConditionalGeneration`) y con el framework Moonshine Voice para dispositivos edge. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia y throughput: RTF de 63 (Metal, M4 Max), 35,5 (CPU, M4 Max), 14 (Vulkan, Ryzen 4750U) y 7,5 (CPU, Ryzen 4750U). Un RTF de 7,5 implica procesar 7,5 segundos de audio por cada segundo de cómputo.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---:|---|---:|---|---|
| moonshine-streaming-medium (esta conversión) | 245M | en | No disponible | 2,16 % | MIT | GGUF |
| moonshine-streaming-small | No disponible | en | No disponible | No disponible | MIT (presumible, misma familia) | Safetensors / GGUF |
| moonshine-streaming-tiny | No disponible | en | No disponible | No disponible | MIT (presumible, misma familia) | Safetensors / GGUF |
| Whisper large-v3 | 1550M | multilingüe | 30 s de audio | No disponible en esta ficha | MIT | Safetensors, GGUF, etc. |

La comparación directa con las variantes tiny y small de la misma familia es la más pertinente: medium es la más profunda (14/14 capas) y ancha (768/640), a costa de un mayor tamaño de fichero. Frente a Whisper large-v3, la ventaja de Moonshine Streaming es el tamaño (245M frente a 1550M) y el diseño para streaming de baja latencia, mientras que Whisper ofrece multilingüismo y marcas de tiempo que Moonshine Streaming no soporta. No se dispone de cifras de WER de las variantes tiny y small en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no traduce ni detecta idioma, por lo que audio en otros idiomas producirá transcripciones incorrectas o alucinadas.
- Sin marcas de tiempo: no apto para aplicaciones que requieran alineación temporal palabra a palabra.
- Sin datos publicados sobre sesgos: la model card no documenta evaluación de sesgos por acento, género, edad o dialecto; el rendimiento en inglés no nativo o con ruido puede degradarse respecto al 2,16 % de LibriSpeech.
- Riesgo de alucinación: como todo modelo seq2seq, puede generar texto plausible en segmentos de audio ininteligibles o silenciosos.
- Contexto no documentado: se desconoce la longitud máxima de audio procesable en una sola pasada; el diseño streaming sugiere procesamiento incremental, pero no se especifica el límite.
- Cuantizaciones limitadas: solo se distribuyen F32, F16 y Q8_0; no hay Q4_K_M ni Q5_K_M, lo que limita aún más la reducción de tamaño si se necesitara.
- Repo con 0 descargas y 0 likes: conversión reciente y sin validación comunitaria amplia; conviene verificar el comportamiento en el caso de uso concreto antes de producción.
- Licencia MIT: permisiva para uso comercial, pero se recomienda revisar la model card del modelo base para confirmar términos y atribuciones.
- Dependencia de transcribe.cpp: el formato GGUF de esta conversión está pensado para esa librería; otros runtimes pueden no cargarlo.

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/tryambientai/moonshine-streaming-medium-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-streaming-medium
- Commit del modelo base portado: https://huggingface.co/UsefulSensors/moonshine-streaming-medium/commit/57b8436
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/0d312ce
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine-streaming-medium.md
- Paper de Moonshine Streaming: https://download.moonshine.ai/docs/moonshine_streaming_paper.pdf
- Framework Moonshine Voice: https://github.com/moonshine-ai/moonshine
- Descarga directa F32: https://huggingface.co/handy-computer/moonshine-streaming-medium-gguf/resolve/main/moonshine-streaming-medium-F32.gguf
- Descarga directa F16: https://huggingface.co/handy-computer/moonshine-streaming-medium-gguf/resolve/main/moonshine-streaming-medium-F16.gguf
- Descarga directa Q8_0: https://huggingface.co/handy-computer/moonshine-streaming-medium-gguf/resolve/main/moonshine-streaming-medium-Q8_0.gguf
