# yeowon/qwen3_asr_1.7b_ko-MLX-4bit

## Resumen

`yeowon/qwen3_asr_1.7b_ko-MLX-4bit` es una versión cuantizada a 4 bits en formato MLX del modelo de reconocimiento automático del habla (ASR) en coreano `TeamUNIVA/qwen3_asr_1.7b_ko`, que a su vez es un ajuste fino de `Qwen/Qwen3-ASR-1.7B`. Lo publica el usuario yeowon con el objetivo de hacer viable la inferencia local de ASR coreano en ordenadores con Apple Silicon (M1/M2/M3/M4) sin necesidad de GPU dedicada ni de conexión a la nube.

El modelo conserva la arquitectura original de Qwen3-ASR: un codificador de audio seguido de un decodificador de texto basado en transformer Qwen3 de 28 capas con vocabulario de 151.936 tokens y embeddings atados. La cuantización aplica 4 bits con `group_size=64` a las capas lineales del codificador y del decodificador, dejando en BF16 las convoluciones y normalizaciones del codificador de audio. El resultado pasa de 4.480,9 MB en BF16 a 1.099,6 MB, una reducción del 75,5 %.

Su relevancia práctica es doble: por un lado demuestra que un ASR de 2.038 millones de parámetros puede ejecutarse en un portátil Apple con un factor de tiempo real (RTF) de 0,133x, es decir, transcribir 7,5 veces más rápido que la duración del audio; por otro, ofrece una receta reproducible de cuantización MLX para modelos de la familia Qwen3-ASR. Está pensado exclusivamente para coreano y su licencia Apache-2.0 permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder ASR (audio tower + decoder Qwen3 de 28 capas) |
| Parametros totales | 2.038.052.480 (~2,04 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX 4-bit con `group_size=64` (lineales del encoder y decoder); Conv2D y normalizaciones en BF16 |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), repo de 1,2 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-ASR-1.7B: un codificador de audio que transforma la señal en representaciones y un decodificador de texto tipo transformer Qwen3 con 28 capas y vocabulario de 151.936 tokens con embeddings atados. El ajuste fino al coreano lo realizó TeamUNIVA sobre el modelo base de Qwen, y esta versión de yeowon no reentrena nada: solo cuantiza los pesos. Según la model card, el codificador ocupa 176,4 MB tras la cuantización (lineales a 4 bits, convoluciones y normalizaciones en BF16) y el decodificador 923,2 MB.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus coreano, ni si hubo etapas de RLHF o DPO en el ajuste fino original. La innovación técnica destacable de esta ficha es la propia cuantización MLX: mantiene las operaciones sensibles (Conv2D y normas) en BF16 mientras comprime las lineales, lo que permite cargar el modelo en unos 0,43 segundos en un M1 Pro y obtener un RTF de 0,133x. El repositorio incluye además el script `mlx_quantized_asr.py` con inferencia por fichero y un servidor web de streaming por micrófono.

## Capacidades

- Transcripción de voz a texto en coreano, con salida de texto plano.
- Reconocimiento sobre ficheros de audio (`transcribe("audio.wav", language="Korean")`).
- Streaming en tiempo real desde micrófono mediante el servidor incluido (`--serve --port 7860`).
- Carga rápida de pesos pre-cuantizados (aproximadamente 0,43 s en M1 Pro).
- Ejecución en CPU/GPU unificada de Apple Silicon mediante MLX.
- No se documentan capacidades de traducción, diarización de hablantes, timestamps por palabra, tool calling ni modo de razonamiento.

## Casos de uso

- Transcripción local de reuniones en coreano: el modelo procesa audio a 7,5x tiempo real en un M1 Pro, lo que permite transcribir una hora de reunión en unos 8 minutos sin enviar datos a servicios externos.
- Subtitulado de vídeo en coreano: integrado en un pipeline de postproducción, genera el texto base que luego se alinea temporalmente con herramientas externas; el RTF bajo hace viable procesar lotes de episodios en un portátil.
- Dictado por voz en aplicaciones de escritorio para macOS: el servidor de streaming incluido permite conectar un micrófono y obtener transcripciones incrementales en local, útil en entornos con requisitos de privacidad.
- Prototipado de asistentes de voz en coreano: al ocupar solo 1,07 GB, cabe junto a otros modelos en la memoria unificada de un Mac de 16 GB, lo que facilita montar demos de extremo a extremo (ASR + LLM + TTS).
- Investigación en ASR de bajo recurso: sirve como punto de partida cuantizado para comparar el impacto de INT4 frente a BF16 e INT8 en precisión de transcripción sobre coreano.
- Procesamiento por lotes de archivos de audio en estaciones de trabajo Apple: el bajo consumo de memoria permite ejecutar varias instancias o encadenar tareas sin agotar la RAM unificada.
- Evaluación de despliegue en edge: útil para validar si un ASR de 2 B parámetros cuantizado cumple los requisitos de latencia de un producto antes de invertir en infraestructura GPU.

## Benchmarks y rendimiento

Los únicos datos publicados son mediciones de velocidad y memoria realizadas por el autor en un Apple M1 Pro de 16 GB sobre tres audios coreanos que suman 26,34 segundos (2,50 s, 7,20 s y 16,64 s). No hay resultados de precisión (WER/CER) ni comparaciones con otros modelos.

| Configuracion | Memoria total | Memoria encoder | Memoria decoder | Tiempo total (3 audios) | RTF medio | Velocidad vs. tiempo real |
|---|---|---|---|---|---|---|
| MLX BF16 (original) | 3.887,3 MB | 605,5 MB | 3.281,7 MB | 5.533,3 ms | 0,210x | 4,8x |
| MLX INT8 (decoder 8-bit) | 2.349,1 MB | 605,5 MB | 1.743,5 MB | 3.707,1 ms | 0,141x | 7,1x |
| MLX INT4 (este modelo) | 1.099,6 MB | 176,4 MB | 923,2 MB | 3.499,4 ms | 0,133x | 7,5x |

No se han publicado resultados de benchmarks de precisión (WER, MMLU u otros) en la información disponible.

## Requisitos de hardware

- VRAM/RAM unificada: aproximadamente 1,1 GB para los pesos en INT4; el autor reporta 1.099,6 MB de memoria total en inferencia sobre M1 Pro.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4). El formato MLX no está pensado para GPU NVIDIA ni AMD.
- Cabe holgadamente en cualquier Mac con 8 GB o más de memoria unificada; en un equipo de 16 GB convive sin problema con otras aplicaciones.
- Tiempos de referencia en M1 Pro 16 GB: carga de pesos en ~0,43 s y RTF de 0,133x (7,5x tiempo real).
- Despliegue: librería `mlx` más el paquete `qwen3-asr-mlx`; el repo incluye `mlx_quantized_asr.py` para inferencia por fichero y modo servidor (`--serve --port 7860`).
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato es específico de MLX.
- Throughput estimado: a partir del RTF de 0,133x, en torno a 7,5 segundos de audio transcritos por segundo de cómputo en M1 Pro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| yeowon/qwen3_asr_1.7b_ko-MLX-4bit | ~2,04 B | No disponible | Coreano | Apache-2.0 | MLX 4-bit (Apple Silicon) |
| TeamUNIVA/qwen3_asr_1.7b_ko | No disponible | No disponible | Coreano | Apache-2.0 | Pesos originales (BF16/FP16) |
| Qwen/Qwen3-ASR-1.7B | No disponible | No disponible | No disponible | No disponible | Pesos originales |

La comparación cuantitativa de precisión entre estas tres variantes no está disponible: no se han publicado métricas de WER ni evaluaciones comparativas en la información consultada. La diferencia medible es de memoria y velocidad, resumida en la tabla de benchmarks.

## Limitaciones y advertencias

- Solo reconoce coreano; no se ha validado su comportamiento con otros idiomas y la etiqueta de idioma del pipeline es exclusivamente `ko`.
- No hay datos publicados de precisión (WER/CER) ni del impacto de la cuantización INT4 en la calidad de transcripción frente al modelo BF16 original.
- Las mediciones de rendimiento provienen de un único equipo (M1 Pro 16 GB) y de solo tres audios de prueba; no deben extrapolarse sin validación a otros chips o condiciones de audio.
- El formato MLX limita el despliegue a Apple Silicon; no es portable a servidores con GPU NVIDIA sin reconversión.
- Riesgo de alucinación y de errores en audio con ruido, acentos marcados o solapamiento de hablantes, habitual en modelos ASR; no se documenta ningún mecanismo de mitigación.
- No se documentan sesgos específicos del ajuste fino coreano ni la composición del corpus de entrenamiento, lo que dificulta evaluar su cobertura dialectal.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `Qwen/Qwen3-ASR-1.7B` y del ajuste de TeamUNIVA antes de un despliegue en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yeowon/qwen3_asr_1.7b_ko-MLX-4bit
- Modelo base (ajuste fino coreano): https://huggingface.co/TeamUNIVA/qwen3_asr_1.7b_ko
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Paquete de inferencia: `qwen3-asr-mlx` (instalable vía pip, sin URL de repositorio indicada en la model card)
- Script de inferencia y servidor: `mlx_quantized_asr.py`, incluido en el repositorio del modelo
