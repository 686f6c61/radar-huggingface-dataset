# tvosch/Qwen3-ASR-0.6B-Jev-Dutch

## Resumen

Qwen3-ASR-0.6B-Jev-Dutch es un modelo de clasificación de audio en neerlandés desarrollado por el usuario tvosch a partir de Qwen/Qwen3-ASR-0.6B. No es un modelo de transcripción: es un modelo de decisión (siguiendo el enfoque Qwen-Audio-Jev, arXiv 2610.21614) que, en una sola pasada por el audio, responde 12 preguntas calibradas sobre cada clip: quién habla (género, franja de edad, niño o adulto, neerlandés de Países Bajos o flamenco) y cómo es la grabación (presencia de voz, número de hablantes, solapamiento, música, ruido, reverberación, canal telefónico y calidad global).

Su propósito principal es la curación y enriquecimiento de datos de voz en neerlandés: filtrar clips inutilizables antes de entrenar un reconocedor ASR, seleccionar datos de voz para TTS, describir y balancear corpus, y añadir metadatos a colecciones de audio sin etiquetar (podcasts, archivos de radio, entrevistas). El rendimiento es notable: unos 35 ms por clip en una A100, lo que lo hace viable para procesar colecciones masivas.

Técnicamente, mantiene el encoder de audio del modelo base (782,5 millones de parámetros reales según safetensors) y sustituye la generación de texto por tres tipos de cabeceras de decisión ligeras (elección, puntuación ordenada y sí/no), entrenadas con datos CC0 y abiertos como Common Voice 17, VoxPopuli y Multilingual LibriSpeech.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio de Qwen3-ASR + decoder con cabeceras de decisión (choice, score, yes/no), estilo Qwen-Audio-Jev |
| Parametros totales | 782.502.987 (dato real de safetensors) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en fp; tamaño de repo 1,6 GB) |
| Idiomas soportados | Neerlandés (nl), con detección de "no neerlandés" entrenada con clips en inglés, alemán, francés, español, italiano y danés |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder de voz de Qwen3-ASR-0.6B. El audio pasa una única vez por el encoder y el decoder lee la representación junto con una pregunta corta en neerlandés (por ejemplo, "Is de spreker een man of een vrouw?"). En lugar de generar texto, el estado oculto al final de la pregunta se conecta a una de tres cabeceras ligeras: una cabecera de elección (opciones discretas como género o variedad NL/BE), una cabecera de puntuación (escalas ordenadas como década de edad, nivel de ruido, reverberación y calidad, con nivel esperado) y una cabecera sí/no (una única probabilidad para voz, múltiples hablantes, solapamiento, música, teléfono o neerlandés). Este diseño evita la decodificación autoregresiva y explica la latencia de unos 35 ms por clip en una A100.

El entrenamiento combina varias fuentes etiquetadas: Common Voice 17 nl (468 hablantes, 6,7 horas) para género, edad, variedad NL/BE y detección de neerlandés; VoxPopuli nl y datos abiertos del Parlamento Europeo (78 hablantes, 4,5 horas) para las mismas tareas; Multilingual LibriSpeech nl (40 hablantes, 4 horas) para género y neerlandés; Common Voice 17 en inglés, alemán, francés, español, italiano y danés (5.589 hablantes, 57,8 horas) para género, edad y "no neerlandés"; y speechocean762 (125 hablantes, 2,9 horas) para género y edad exacta. Las condiciones de grabación se etiquetan mediante mezcla sintética durante el entrenamiento: segundos hablantes, salas simuladas de OpenSLR 28 y 2.000 salas propias, ruido y música de MUSAN, canal telefónico de banda estrecha y clips sin voz. Las etiquetas de calidad provienen de DNSMOS P.835.

## Capacidades

- Clasificación de género del hablante (female/male, con "unknown" si la voz suena menor de 20 años).
- Estimación de franja de edad por décadas (lt20, 20s, 30s, 40s, 50s, 60s, 70+) y agrupación (por ejemplo 40-59), con detección de voz infantil.
- Detección de la variedad del neerlandés: Países Bajos (NL) o Flandes/Bélgica (BE).
- Detección de si se habla neerlandés, sensible a acentos (probabilidad).
- Detección de presencia de voz, múltiples hablantes y solapamiento de conversación (probabilidades).
- Detección de música de fondo, canal telefónico de banda estrecha.
- Estimación de niveles de ruido y reverberación (none/light/moderate/strong) y calidad global tipo DNSMOS (bad/poor/fair/good/excellent).
- Estadísticas de señal opcionales con `signal=True` (duración, nivel, clipping, silencio, SNR aproximado, ancho de banda), calculadas sin el modelo.
- Procesamiento por lotes de rutas de ficheros, bytes codificados o arrays con frecuencia de muestreo, y selección de cabeceras concretas mediante el parámetro `heads`.
- No transcribe voz ni evalúa transcripciones; para eso hay que usar Qwen3-ASR u otro reconocedor.

## Casos de uso

- Limpieza de datos de entrenamiento para ASR: descartar clips sin voz, con varios hablantes o solapamiento, con música, ruido o reverberación fuertes, o que no estén en neerlandés, antes de entrenar o ajustar un reconocedor de voz.
- Selección de datos para TTS y voz: conservar solo clips monohablante, de micrófono cercano y con calidad "good" o "excellent", filtrando además por género, franja de edad y variedad NL/BE.
- Descripción y balanceo de corpus: cuantificar cuántas mujeres, niños, personas mayores o hablantes flamencos contiene un dataset, para elaborar datasheets, rebalancear o detectar huecos antes de entrenar.
- Etiquetado de audio sin anotar: añadir metadatos a archivos de radio, podcasts, entrevistas o conferencias, por turno de hablante combinándolo con una diarización como pyannote, o por ventana temporal para eventos como música, ruido o solapamiento.
- Búsquedas rápidas en grandes colecciones: localizar voz infantil, grabaciones telefónicas o fragmentos con música en millones de clips gracias a los ~35 ms por clip en una A100.
- Control de calidad de grabaciones de campo: detectar clipping, banda estrecha telefónica, reverberación excesiva o mala calidad antes de incorporar grabaciones a un corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento indicado por el autor es una latencia de aproximadamente 35 ms por clip en una GPU A100.

## Requisitos de hardware

- VRAM estimada: con 782,5 millones de parámetros en pesos completos (~1,6 GB de repo), el modelo cabe con holgura en GPUs de 8 GB o menos; también funciona en CPU según el ejemplo del autor.
- GPU recomendadas: cualquier GPU moderna con CUDA; el autor referencia una A100 para la cifra de latencia, pero no es necesaria.
- Consumer GPUs: sí, cabe fácilmente en una RTX 3060, RTX 4060 o superiores; incluso en portátiles con GPU de 6 GB.
- CPU: viable según el código de ejemplo del autor (`.to("cuda")  # or CPU`), con latencia mayor no documentada.
- Despliegue: mediante la librería `transformers` (versión 5.20 o superior) con `trust_remote_code=True`, junto a torch, soundfile y librosa. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia: ~35 ms por clip en una A100; otros valores no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| tvosch/Qwen3-ASR-0.6B-Jev-Dutch | Atributos de hablante y calidad de audio (12 decisiones) | 782,5 M | Neerlandés | Apache-2.0 | Cabeceras de decisión, ~35 ms/clip en A100 |
| Qwen/Qwen3-ASR-0.6B (base) | Transcripción ASR | 0,6 B (nominal) | Multilingue | Apache-2.0 | Modelo base; transcribe, no clasifica atributos |
| pyannote (speaker diarization) | Diarización y atributos de hablante | No disponible | Agnostico al idioma | MIT (pyannote/audio) | Complementario: da turnos de hablante, no calidad ni variedad NL/BE |

No hay alternativas publicadas específicas de atributos de hablante y calidad para neerlandés con datos comparables; la comparación más útil es con el modelo base (transcripción frente a clasificación) y con pipelines modulares tipo pyannote más DNSMOS, que este modelo sustituye por una única pasada.

## Limitaciones y advertencias

- El modelo solo responde sus 12 preguntas fijas: no transcribe, no evalúa transcripciones, no estima SNR o tiempo de reverberación en dB o segundos (solo niveles), ni proporciona atributos como dialecto regional, lengua materna, emoción o estilo de habla.
- Las etiquetas de género no son fiables en voz infantil: devuelve "unknown" por debajo de los 20 años aproximados.
- Las respuestas son estimaciones pensadas para analizar grupos de clips; el autor advierte explícitamente de no usarlas para decisiones sobre personas individuales ni para identificar, verificar o perfilar hablantes.
- Riesgo de sesgo por dominio de entrenamiento: los datos de neerlandés suman solo unas 15 horas y ~600 hablantes, con predominio de lecturas (Common Voice, LibriSpeech) y parlamento europeo; el rendimiento en neerlandés coloquial o acentos no cubiertos puede degradarse.
- Las condiciones adversas (ruido, reverberación, música, teléfono) se aprenden de mezclas sintéticas (MUSAN, OpenSLR 28), lo que puede no transferir perfectamente a condiciones reales.
- Requiere `trust_remote_code=True` por usar código personalizado, lo que implica ejecutar código del autor del repositorio.
- La licencia Apache-2.0 del modelo no cubre necesariamente las condiciones de uso de los datasets de entrenamiento; para uso comercial conviene revisar las licencias de los datos (aunque CC0, CC-BY-4.0 y Apache-2.0 son permisivas).
- Estadísticas como la edad son estimaciones por décadas con incertidumbre; no deben tratarse como datos demográficos exactos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tvosch/Qwen3-ASR-0.6B-Jev-Dutch
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Paper Qwen-Audio-Jev (arXiv): https://arxiv.org/abs/2610.21614
- Dataset Common Voice 17: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0
- Dataset VoxPopuli: https://huggingface.co/datasets/facebook/voxpopuli
- Dataset Multilingual LibriSpeech: https://huggingface.co/datasets/facebook/multilingual_librispeech
- Dataset speechocean762: https://huggingface.co/datasets/mispeech/speechocean762
