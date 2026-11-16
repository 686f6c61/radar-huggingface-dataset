# Yakimask/kikimimi-hiragana-9m-v2

## Resumen

kikimimi-hiragana-9m-v2 (聞き耳) es un modelo de reconocimiento automático de voz (ASR) en japonés desarrollado por Yakimask (焼きマスク) que transcribe audio a hiragana puro en forma de pronunciación. Con solo 9,1 millones de parámetros, está entrenado desde cero (sin inicialización sobre modelos preentrenados) y diseñado específicamente como el componente de "escucha" de sistemas de diálogo full-duplex, donde la latencia y el streaming continuo son críticos.

La arquitectura es un Conformer causal de 12 capas con atención restringida al pasado y convoluciones causales, entrenado con CTC. Emite una hipótesis cada 40 ms sin mirar audio futuro, lo que lo diferencia de los ASR tradicionales (Whisper, NeMo, etc.) que necesitan la utterance completa antes de decodificar. La versión v2 amplía los datos de entrenamiento de 304 a unas 600 horas de YODAS `ja000`, añade ruido y música de MUSAN, e incorpora caché de cómputo incremental y un componente de segmentación por pausas.

El modelo es relevante porque demuestra que un ASR causal extremadamente pequeño puede alcanzar una precisión de caracteres razonable (75,2 puntos sobre 100 en FLEURS ja) en condiciones de streaming estricto, superando a Whisper-small (242M) pese a ser 26 veces menor. Su salida limitada a hiragana lo posiciona como pieza intermedia en pipelines donde un LLM posterior se encarga de la normalización ortográfica y la semántica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer causal (12 capas, anchura 176, 4 cabezas, conv kernel 15, RoPE) con CTC |
| Parámetros totales | 9.133.670 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | streaming continuo; segmentos de 1 a 8 s con corte por pausa de 0,3 s |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente fp32/bf16; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | japonés (ja) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El pipeline es el siguiente: audio a 16 kHz, segmentador por energía (corte tras 0,3 s de silencio, mínimo 1 s, máximo 8 s), log-mel de 80 dimensiones cada 10 ms con normalización fija (sin estadísticas de utterance), subsampling por convolución depthwise separable a 40 ms, 12 capas de Conformer con atención causal y convoluciones enmascaradas a la izquierda, y cabeza lineal de 86 clases (84 hiragana de ぁ a ゔ, el alargador ー y espacio) decodificadas con CTC greedy. El cómputo incremental sigue el enfoque cache-aware streaming de NVIDIA (arXiv 2312.17279): se reutilizan las claves/valores de atención y los 14 frames convolucionales previos, procesando solo los 160 ms recién llegados.

El entrenamiento parte de los pesos de v1 y continúa sobre unas 600 horas de YODAS `ja000` con subtítulos convertidos a hiragana mediante fugashi + unidic-lite en forma de pronunciación, filtrando utterances con dígitos, letras o densidad de 3 a 15 caracteres por segundo. Se aplica aumento de datos con MUSAN (ruido y música a 0–20 dB SNR en la mitad de las utterances, 5 % de ejemplos solo-ruido con etiqueta vacía), SpecAugment y variación de velocidad 0,9/1,0/1,1×. Optimizador AdamW, precisión bf16, validación separada por vídeo (11,5 h) y promediado de los 5 mejores checkpoints.

## Capacidades

- Reconocimiento de voz en japonés en streaming causal con emisión cada 40 ms.
- Salida exclusiva en hiragana en forma de pronunciación ("こんにちは" → "こんにちわ", "を" → "お", "今日" → "きょー").
- Detección de silencio/ruido: entrenado para no emitir caracteres ante ruido o música sin voz.
- Cómputo incremental con caché (coste constante independiente de la duración total del audio).
- Segmentación automática por pausas para evitar degradación en habla larga.
- Lectura desde micrófono o fichero WAV (conversión automática a 16 kHz).
- Ejecución en CPU con latencia de ~20 ms por bloque de 160 ms.
- No soporta tool calling, function calling, agentes, visión ni audio más allá del ASR.
- No emite kanji ni katakana; no transcribe dígitos ni caracteres latinos.

## Casos de uso

- Ears de un sistema de diálogo full-duplex: el modelo consume audio del micrófono en bloques arbitrarios y devuelve hipótesis parciales cada 40 ms, permitiendo que el componente de diálogo reaccione antes de que el usuario termine de hablar.
- Subtitulado en vivo de baja latencia en japonés: integrado en un pipeline con un LLM posterior que convierte hiragana a kanji/katakana y puntúa, se obtiene un subtitulado incremental sin esperar al cierre de la utterance.
- Voice UI en dispositivos embebidos: con 9 M de parámetros y ejecución en CPU a ~20 ms por bloque, cabe en Raspberry Pi, móviles o navegador (vía ONNX/WASM) para comandos de voz en japonés.
- Preprocesado para pipelines de ASR de mayor calidad: al ser causal y ligero, puede usarse como detector de actividad de voz y generador de transcripciones preliminares que un modelo grande (Whisper, NeMo) refine después.
- Transcripción de reuniones o clases con un LLM corrector: el modelo produce hiragana fonética continua y un modelo de lenguaje posterior normaliza ortografía y añade puntuación.
- Investigación en ASR causal y streaming: base reproducible (CC BY 4.0, entrenamiento desde cero documentado) para experimentar con Conformer causal, CTC y cache-aware streaming en japonés.
- Prototipado de interfaces de voz para accesibilidad: dictado en japonés con salida fonética que puede vocalizarse o convertirse a texto estándar mediante reglas o un modelo pequeño.

## Benchmarks y rendimiento

Evaluación sobre 100 utterances de FLEURS japonés test (puntuación = 100 × (1 − CER), todo normalizado a hiragana con fugashi + unidic-lite):

| Modelo | Parámetros | Puntuación | Streaming |
|---|---|---|---|
| nvidia/parakeet-tdt_ctc-0.6b-ja | 622M | 94,5 | No |
| openai/whisper-large-v3-turbo | 809M | 91,0 | No |
| kotoba-tech/kotoba-whisper-v2.0 | 756M | 88,9 | No |
| reazon-research/reazonspeech-nemo-v2 | 619M | 87,5 | No |
| **kikimimi v2** | **9M** | **75,2** | **Sí (40 ms)** |
| openai/whisper-small | 242M | 74,5 | No |
| openai/whisper-base | 73M | 63,4 | No |
| openai/whisper-tiny | 38M | 39,3 | No |

Validación interna sobre YODAS (11,5 h, YouTube):

| Versión | CER audio limpio | CER audio con ruido |
|---|---|---|
| v1 | 0,434 | 0,514 |
| v2 | 0,420 | 0,471 |

Robustez y latencia: en 15 sonidos no vocales (timbre, alarma, etc.) v1 emitía texto en 8 casos y v2 en 1. Con ruido a 1/3 de la amplitud de la voz, CER pasa de 0,297 (v1) a 0,223 (v2). El cómputo de 160 ms de audio tarda ~20 ms en CPU de escritorio y no crece con la duración total (verificado con 46 s).

## Requisitos de hardware

- VRAM: el modelo completo en bf16 ocupa aproximadamente 18 MB de pesos; la inferencia puede ejecutarse íntegramente en CPU sin GPU.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna (RTX 3060 en adelante, A100, H100) acelera el procesado por lotes, pero no es necesario.
- Consumer GPU: cabe holgadamente en cualquier GPU de consumo e incluso en dispositivos sin GPU dedicada.
- Despliegue: el repositorio incluye `transcribe.py` (fichero o micrófono) y `stream_cache.py` (integración por chunks); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo CTC de este tamaño).
- Latencia y throughput: ~20 ms de cómputo por bloque de 160 ms en CPU de escritorio, es decir, un factor de tiempo real de ~8× en CPU; el coste es constante con la duración del audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / modalidad | FLEURS ja (100×1−CER) | Streaming | Licencia |
|---|---|---|---|---|---|
| kikimimi-hiragana-9m-v2 | 9M | streaming causal, 40 ms | 75,2 | Sí | CC BY 4.0 |
| openai/whisper-small | 242M | offline, 30 s | 74,5 | No | MIT (según modelo original) |
| openai/whisper-large-v3-turbo | 809M | offline, 30 s | 91,0 | No | MIT (según modelo original) |
| nvidia/parakeet-tdt_ctc-0.6b-ja | 622M | offline | 94,5 | No | no disponible en la información proporcionada |
| reazon-research/reazonspeech-nemo-v2 | 619M | offline | 87,5 | No | no disponible en la información proporcionada |

La comparación es asimétrica: los modelos offline disponen de la utterance completa, mientras que kikimimi opera en modo causal estricto. Frente a whisper-small, de tamaño 26× mayor, kikimimi obtiene una puntuación ligeramente superior en este conjunto, aunque con una salida restringida a hiragana y sin puntuación ni mayúsculas.

## Limitaciones y advertencias

- En habla conversacional y audio de YouTube, la tasa de error de caracteres ronda el 40 % (CER 0,420 en validación limpia).
- Puede perder el primer carácter de un segmento: el segmentador solo mira energía y confunde sonidos como "す" o el cierre de boca previo a "か" con silencio, cortando a mitad de palabra.
- Los umbrales del segmentador (0,3 s de silencio, mínimo 1 s, máximo 8 s) están fijados manualmente y no se adaptan al hablante.
- No transcribe dígitos ni caracteres latinos (excluidos del entrenamiento); no emite kanji ni katakana.
- No incluye cancelación de eco; en sistemas full-duplex hay que añadirla externamente para evitar que el modelo transcriba su propia salida por el altavoz.
- Sesgos: al entrenar solo con YODAS `ja000` (subtítulos de YouTube), el dominio y la distribución de hablantes están sesgados hacia ese corpus; no se documentan análisis de sesgo por género, edad o dialecto.
- Riesgo de alucinación: bajo en comparación con ASR generativos, ya que la decodificación es CTC greedy sobre 86 clases; aun así puede emitir hiragana espurio ante ruidos no vistos.
- Licencia CC BY 4.0 permite uso comercial con atribución; los datos de entrenamiento (YODAS, CC BY 3.0; MUSAN, CC BY 4.0) imponen sus propias obligaciones de atribución.
- Para producción en japonés estándar se recomienda un postprocesado con LLM o un modelo ASR de mayor tamaño; kikimimi está pensado como primera etapa de bajo coste y baja latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yakimask/kikimimi-hiragana-9m-v2
- Dataset YODAS: https://huggingface.co/datasets/espnet/yodas
- Paper YODAS (Li et al., ASRU 2023): https://arxiv.org/abs/2312.17279 (referenciado en la model card como base del enfoque cache-aware streaming)
- MUSAN: https://www.openslr.org/17/
- Paper MUSAN (Snyder et al., 2015): https://arxiv.org/abs/1510.08484
- FLEURS: https://huggingface.co/datasets/google/fleurs
- Referencia cache-aware streaming de NVIDIA: https://arxiv.org/abs/2312.17279
