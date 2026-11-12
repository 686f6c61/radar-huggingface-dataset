# veajeaahvey/caramel-1

## Resumen

`caramel-1` es un modelo de conversación de voz a voz (speech-to-speech) de tipo full-duplex desarrollado por el autor independiente veajeaahvey (naklecha en GitHub). Se trata de un transformer de 413 millones de parámetros entrenado exclusivamente con audio de habla humana, sin haber visto nunca texto. El modelo resuelve el problema de la conversación hablada en tiempo real: en lugar de encadenar ASR, un LLM y TTS, aprende de extremo a extremo a escuchar y responder audio, decidiendo por sí mismo cuándo hablar y cuándo callar.

La arquitectura es un transformer de dos etapas: cada 80 ms un transformer de anchura 1024 lee ambos flujos de audio (la propia voz del modelo y la del interlocutor) y un transformer menor de anchura 512 genera los 8 tokens del siguiente frame de forma autorregresiva. No incorpora detector de actividad de voz ni reglas de turno de palabra; el modelo predice el momento de hablar igual que predice el audio. Cada conversación se usa dos veces en entrenamiento, una por cada hablante, de modo que dos copias del mismo modelo pueden mantener un diálogo entre sí.

Su relevancia actual reside en que demuestra que un modelo pequeño (413M) entrenado solo con habla, sin texto, puede sostener conversaciones en tiempo real (unas 11 veces más rápido que tiempo real en GPU y 4 veces en un MacBook Pro M3 Pro) y que el escalado de datos de audio mejora la claridad del habla. El código, la receta de entrenamiento y los pesos son abiertos bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de dos etapas (encoder de contexto, anchura 1024, + decoder de tokens de audio, anchura 512), full-duplex |
| Parametros totales | 413.198.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa flujos de audio continuos en ventanas de 80 ms) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no se especifican idiomas; el modelo no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

`caramel-1` es un transformer full-duplex con dos flujos de entrada: la voz del propio modelo y la del interlocutor. Cada 80 ms, un transformer de anchura 1024 lee todo lo dicho hasta el momento por ambos hablantes y produce una representación de contexto; a continuación, un transformer de anchura 512 genera los 8 tokens del siguiente frame de audio de forma autorregresiva. El primer token codifica principalmente el contenido lingüístico y los siete restantes la voz y el entorno acústico. El audio no se procesa en crudo: un codec neuronal de audio convierte el habla de cada hablante en 12,5 frames por segundo con 8 tokens por frame (360.000 tokens por hora de habla de una persona).

El entrenamiento se realizó sobre aproximadamente 11.555 horas de habla pública de internet: 5.743 horas de conversaciones entre dos personas (podcasts, entrevistas) y 5.812 horas de habla individual (audiolibros, charlas). Cada grabación se separó en pistas por hablante para que el modelo aprendiera ambos lados de la conversación, incluidos los solapamientos. En total, el modelo procesó unos 33.000 millones de tokens durante el entrenamiento, ya que vio los datos varias veces. No se menciona el uso de RLHF ni DPO; el entrenamiento es de modelado autorregresivo del siguiente frame de audio. La selección de datos se guió por una métrica de "cercanía" a conversaciones de referencia (estadísticas de solapamiento, pausas, backchannels, ruido de fondo), y se comprobó que más horas y más pasadas reducían la pérdida en conversaciones no vistas (de 1,954 con 1.356 horas a 1,809 con 5.743 horas y 5,65 pasadas) y mejoraban la claridad del habla.

## Capacidades

- Generación de voz a voz en tiempo real con latencia de frame de 80 ms.
- Conversación full-duplex: el modelo decide por sí mismo cuándo hablar y cuándo permanecer en silencio, sin detector de actividad de voz ni reglas de turno.
- Manejo de solapamientos y backchannels propios de una conversación natural.
- Dos copias del mismo modelo pueden dialogar entre sí en tiempo real.
- Generación de audio aproximadamente 11 veces más rápida que tiempo real en GPU y 4 veces en un MacBook Pro M3 Pro (dos copias simultáneas).
- No procesa texto: no hay capacidades de generación de texto, código, matemáticas ni tool calling.
- No se documentan capacidades de visión, audio de entrada distinto del habla ni modos de razonamiento.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en conversación hablada full-duplex: el modelo sirve como banco de pruebas para estudiar turnos de palabra, solapamientos y backchannels sin reglas heurísticas, ya que aprende el timing directamente de los datos.
- Generación de datos sintéticos de diálogo: dos copias del modelo pueden generar conversaciones de voz continuas para aumentar datasets de entrenamiento de sistemas de diálogo o de ASR.
- Prototipado de agentes de voz en tiempo real: su velocidad (11x tiempo real en GPU) permite integrarlo en demos interactivas donde la latencia es crítica.
- Evaluación de codecs neuronales de audio: al depender de un codec de 12,5 frames/s y 8 tokens/frame, es un caso de uso para medir el impacto del codec en la calidad del habla generada.
- Simulación de interlocutores para pruebas de sistemas de atención al cliente: permite generar respuestas habladas con timing humano para validar pipelines de voz antes de usar actores reales.
- Investigación sobre el "bitter lesson" en modalidad de audio: el modelo y su receta permiten reproducir experimentos de escalado de datos de habla y medir claridad del habla con reconocedores automáticos.
- Despliegue en hardware de consumo para demos offline: al caber en un MacBook Pro M3 Pro y funcionar a 4x tiempo real con dos copias, sirve para demos locales sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo no procesa texto. La model card reporta métricas propias de audio:

| Metrica | Valor |
|---|---|
| Perdida en conversaciones no vistas (1.356 h, 2,5 pasadas) | 1,954 |
| Perdida en conversaciones no vistas (5.743 h, 2,4 pasadas) | 1,867 |
| Perdida en conversaciones no vistas (5.743 h, 5,65 pasadas) | 1,809 |
| Claridad de palabra (1.356 h, 2,5 pasadas) | -0,47 |
| Claridad de palabra (5.743 h, 5,65 pasadas) | -0,29 |
| Claridad de palabra (personas reales, referencia) | -0,18 |
| Velocidad de generacion en GPU | ~11x tiempo real |
| Velocidad de generacion en MacBook Pro M3 Pro (dos copias) | ~4x tiempo real |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 413M parámetros en safetensors, el peso en fp32 ronda 1,6 GB y en fp16 unos 0,8 GB, más overhead de activaciones y codec de audio.
- GPU recomendadas: no se especifican modelos concretos; la model card menciona ejecución en GPU genérica a ~11x tiempo real.
- Cabe en GPU de consumo: sí, según la model card funciona en un MacBook Pro M3 Pro (Apple Silicon, no GPU dedicada) con dos copias a ~4x tiempo real.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el repositorio de GitHub (github.com/naklecha/caramel) contiene el código y la receta de entrenamiento.
- Latencia y throughput: frame de decisión de 80 ms; ~11x tiempo real en GPU y ~4x en M3 Pro con dos copias simultáneas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| caramel-1 | 413M | no disponible (streaming de 80 ms) | audio a audio full-duplex | Apache 2.0 | Hugging Face + GitHub |
| Dessa (referencia) | no disponible | no disponible | audio a audio full-duplex | no disponible | no disponible (solo referencia en la model card) |
| Modelos speech-to-speech con ASR+LLM+TTS | variable (varios miles de millones) | variable | audio a audio en cascada | variable | amplia |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada. La única comparación cualitativa es con Dessa, citada como inspiración y referencia para la métrica de cercanía de conversaciones.

## Limitaciones y advertencias

- El propio autor indica que la mayor parte de lo que dice `caramel-1` no tiene sentido todavía; la claridad del habla mejora con más datos pero sigue por debajo de personas reales (-0,29 frente a -0,18 en la métrica de claridad).
- No procesa texto ni tiene capacidades de razonamiento, código o matemáticas; no es un sustituto de un LLM.
- No se documentan idiomas soportados; el entrenamiento se basa en habla pública de internet sin especificar composición lingüística.
- Riesgo de alucinación en el contenido hablado: al ser un modelo autorregresivo de audio, puede generar palabras y frases sin sentido.
- No se documentan sesgos conocidos, pero al entrenarse con podcasts, entrevistas y audiolibros públicos puede heredar sesgos de esas fuentes.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para producción y su calidad conversacional es experimental.
- No hay detector de actividad de voz ni reglas de turno: el comportamiento de turnos depende enteramente de lo aprendido y puede fallar en dominios distintos del entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un proyecto de investigación reciente (noviembre de 2026) sin validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/veajeaahvey/caramel-1
- Hugging Face (autor, según model card): https://huggingface.co/naklecha/caramel-1
- GitHub: https://github.com/naklecha/caramel
- Dessa (referencia): https://block.xyz/dessa
- Vídeo de muestras: https://huggingface.co/naklecha/caramel-1/resolve/main/docs/caramel_samples.mp4
- Gráfica de pérdida: https://huggingface.co/naklecha/caramel-1/resolve/main/docs/more_data.png
- The Bitter Lesson: http://www.incompleteideas.net/IncIdeas/BitterLesson.html
