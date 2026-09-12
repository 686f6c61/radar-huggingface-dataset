# wannaphong/typhoon-asr-streaming-115m

## Resumen

Typhoon ASR Streaming 115M es un modelo de reconocimiento automatico del habla (ASR) en tailandes con arquitectura FastConformer-Transducer (RNN-T) y capacidad de decodificacion en streaming cache-aware. Lo publica el usuario wannaphong en HuggingFace y deriva de scb10x/typhoon-asr-realtime, que a su vez procede de nvidia/stt_en_fastconformer_transducer_large. El modelo resuelve un problema concreto: el modelo base de contexto completo degrada su precision hasta un 62,8 % de CER cuando se le fuerza a operar en streaming a 1040 ms, mientras que esta version, tras sustituir convoluciones por variantes causales y atencion por chunks de contexto limitado, decodifica en vivo con un 19,4 % de CER en la misma configuracion.

El modelo tiene 115 millones de parametros, un tokenizador BPE tailandes de 2048 tokens y un mecanismo de latencia ajustable mediante `chunk_size` (multiplos de 80 ms), con perfiles de contexto `[[70,13],[70,6],[70,1],[70,0]]` que permiten operar a 1040, 480 u 80 ms de latencia. El contexto de atencion es de 70 frames a la izquierda (unos 5,6 s) mas el bloque derecho correspondiente a cada perfil, por lo que no se trata de una ventana de tokens al estilo de un LLM, sino de contexto acustico por chunks.

Su relevancia actual es doble: por un lado demuestra que es posible convertir un modelo full-context en cache-aware streaming mediante un warm start que copia todos los pesos, en lugar de reentrenar desde cero; por otro, ofrece una alternativa de bajo coste computacional (RTF de 0,020 en una H100, unas 50 veces tiempo real) para aplicaciones de voz en tailandes donde el code-switching con ingles es ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-Transducer (RNN-T), streaming cache-aware |
| Parametros totales | 115 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 70 frames a la izquierda (~5,6 s) mas bloque derecho; perfiles `att_context_size` `[[70,13],[70,6],[70,1],[70,0]]` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tailandes (th); code-switching ligero con ingles |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.nemo` (checkpoint de NVIDIA NeMo); tamano del repo 0,5 GB |

Datos adicionales: clase NeMo `EncDecRNNTBPEModel`, tokenizador BPE tailandes unico de 2048 tokens, latencia seleccionable mediante `chunk_size` × 80 ms (1040 / 480 / 80 ms). Modelo base declarado: `scb10x/typhoon-asr-realtime`.

## Arquitectura y entrenamiento

La arquitectura es un FastConformer-Transducer, es decir, un encoder Conformer con submuestreo agresivo de frames combinado con un decoder de tipo Transducer (RNN-T) y un joint network. La innovacion principal de esta version es la conversion de contexto completo a streaming cache-aware: se sustituyen las convoluciones por convoluciones causales y la atencion global por atencion con contexto limitado por chunks, de modo que la cache del encoder se arrastra de un chunk al siguiente. Cada peso del modelo original se copia como warm start, sin reinicializacion aleatoria, lo que preserva el conocimiento acustico ya adquirido.

Sobre esa base convertida se aplica un fine-tune de una epoca sobre el corpus tailandes de aproximadamente 11.000 horas que ya usaba Typhoon ASR Real-time. El modelo soporta multiples perfiles de latencia en un unico conjunto de pesos gracias al parametro `att_context_size`, y en tiempo de decodificacion admite guiado de vocabulario: phrase boosting y shallow fusion con un modelo n-gram apareado. No se menciona en la informacion disponible el uso de RLHF ni DPO, algo por otra parte poco habitual en tareas de ASR.

## Capacidades

- Reconocimiento de voz en tailandes con salida de texto, tanto en modo offline (archivo completo) como en streaming real por chunks.
- Decodificacion en vivo con cache de encoder propagada entre chunks, sin recortes de audio ni espera al final de la frase.
- Latencia configurable en tiempo de ejecucion: 1040, 480 u 80 ms segun `chunk_size` y el perfil de contexto elegido.
- Guiado de vocabulario en decodificacion: phrase boosting y shallow fusion con un n-gram (modelo apareado `typhoon-ai/typhoon-asr-streaming-115m-ngram`).
- Manejo de code-switching ligero tailandes-ingles; el propio autor recomienda usar otro modelo si el cambio de idioma es intenso.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: no es un modelo generativo de proposito general.
- No tiene capacidades de vision, audio generativo, texto a voz ni traduccion.
- Multilingue limitado: la unica lengua declarada es el tailandes.

## Casos de uso

- Subtitulado en directo de television y retransmisiones: con 1040 ms de latencia y 19,4 % de CER en TVSpeech, es adecuado para generar subtitulos en emisiones tailandesas donde el desfase de un segundo es aceptable para el espectador.
- Transcripcion de call centers: el modelo puede procesar audio telefonico en streaming y alimentar sistemas de analitica de conversacion, con shallow fusion para forzar nombres de producto o terminologia interna mediante phrase boosting.
- Asistentes de voz embebidos: con 115 M de parametros cabe en GPU de gama baja e incluso en entornos con recursos limitados, y su RTF de 0,020 en H100 deja margen para ejecutar varios flujos concurrentes en el mismo acelerador.
- Actas y notas de reunion en tailandes: el modo offline (`model.transcribe`) permite transcribir grabaciones completas con mayor precision que el modo streaming cuando no hay requisito de tiempo real.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de un archivo historico de audio tailandes para construir un indice de texto buscable, aprovechando el bajo coste por hora de audio.
- Moderacion y cumplimiento normativo: analisis de llamadas o emisiones con deteccion de terminos sensibles, usando el diccionario de boosting para reducir falsos negativos en vocabulario critico.
- Prototipado rapido de productos de voz en tailandes: al ser un modelo pequeno con licencia permisiva, sirve para validar una idea de producto antes de invertir en el modelo de 0,6 B.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| CER en streaming (TVSpeech) | @1040 ms | 19,4 % |
| CER en streaming (TVSpeech) | @3200 ms | 16,4 % |
| CER en streaming (modelo base full-context forzado a streaming) | @1040 ms | 62,8 % |
| RTF (batch 1, H100) | @1040 ms | 0,020 (~50× tiempo real) |

No se han publicado en la informacion disponible resultados de otros benchmarks habituales (WER/CER en otros corpus, MMLU, HumanEval u otros), ni comparativas numericas frente a los modelos de la cadena de derivacion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (los 115 M de parametros ocupan en torno a 0,23 GB, mas activaciones y cache del encoder), aunque no se publican cifras oficiales y debe considerarse una estimacion.
- GPU recomendadas: cualquier GPU NVIDIA moderna con soporte CUDA sirve; el dato de rendimiento publicado esta medido en una H100. Una RTX 3090 o RTX 4090 es mas que suficiente para multiples flujos concurrentes.
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares. Incluso las iGPU mas modestas pueden quedarse cortas solo por requisitos de CUDA de NeMo.
- Opciones de despliegue: NVIDIA NeMo (`nemo.collections.asr`), con `ASRModel.restore_from` y `map_location="cuda"`. Para streaming real se requiere `model.encoder.setup_streaming_params(chunk_size=13, left_chunks=2, shift_size=13)` y `conformer_stream_step`, ademas de fijar el commit de NeMo indicado en el repositorio del proyecto.
- No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a LLM que no aplican a este tipo de modelo. Tampoco se ofrece una version GGUF.
- Latencia y throughput: RTF de 0,020 en batch 1 sobre H100 a 1040 ms, es decir, unas 50 veces tiempo real. No hay datos publicados de throughput agregado con lotes mayores ni de rendimiento en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / latencia | CER streaming | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wannaphong/typhoon-asr-streaming-115m | 115 M | `[[70,13],[70,6],[70,1],[70,0]]`; 1040 / 480 / 80 ms | 19,4 % @1040 ms; 16,4 % @3200 ms | CC-BY-4.0 | HuggingFace, formato `.nemo` |
| scb10x/typhoon-asr-realtime (base) | no disponible | contexto completo | 62,8 % @1040 ms forzado a streaming | CC-BY-4.0 | HuggingFace |
| typhoon-ai/typhoon-asr-streaming-nemotron-0.6b | 0,6 B | no disponible | no disponible | no disponible | HuggingFace; recomendado por el autor para maxima precision |
| nvidia/stt_en_fastconformer_transducer_large | no disponible | contexto completo | no disponible | CC-BY-4.0 | HuggingFace |
| typhoon-ai/typhoon-asr-streaming-115m-ngram | no disponible | modelo n-gram apareado para shallow fusion | no disponible | no disponible | HuggingFace |

La comparacion directa mas util es contra el modelo base de contexto completo, que pasa de 62,8 % a 19,4 % de CER al operar en streaming gracias a esta conversion. Para precision maxima, el propio autor remite al modelo de 0,6 B, aunque no publica cifras comparativas en la informacion disponible.

## Limitaciones y advertencias

- Idioma: solo tailandes declarado. El code-switching con ingles funciona de forma ligera; para dominios bilingues intensos el autor recomienda otro modelo.
- Precision: un 19,4 % de CER en streaming a 1040 ms implica aproximadamente uno de cada cinco caracteres erroneos en ese corpus; puede ser insuficiente para transcripcion literal o uso legal sin revision humana.
- Alucinacion y errores: como todo modelo ASR, puede generar texto plausible donde el audio es ininteligible, especialmente con ruido de fondo, acentos regionales marcados o vocabulario de dominio muy especifico.
- Dependencia de infraestructura: el streaming real exige una version concreta de NeMo con soporte cache-aware streaming, fijada a un commit del repositorio del proyecto. No se puede ejecutar con runtimes genericos de LLM.
- Sin datos de cuantizacion publicados, por lo que no se puede garantizar el comportamiento en precision reducida (int8, int4).
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a atribuir de forma explicita la cadena de autores (NVIDIA, SCB DataX y el autor de la conversion).
- Metadatos de validacion escasos: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- Fecha de publicacion registrada como 2026-09-12, sin actualizaciones posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wannaphong/typhoon-asr-streaming-115m
- Modelo base: https://huggingface.co/scb10x/typhoon-asr-realtime
- Modelo origen de la cadena: https://huggingface.co/nvidia/stt_en_fastconformer_transducer_large
- Modelo n-gram apareado: https://huggingface.co/typhoon-ai/typhoon-asr-streaming-115m-ngram
- Modelo alternativo de mayor precision: https://huggingface.co/typhoon-ai/typhoon-asr-streaming-nemotron-0.6b
- Repositorio del proyecto (loop de streaming, servidor y demo): https://github.com/warit-s/typhoon-asr-streaming
- Documentacion de shallow fusion y phrase boosting: `docs/SHALLOW_FUSION.md` dentro del repositorio anterior
