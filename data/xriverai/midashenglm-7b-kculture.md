# xriverAI/midashenglm-7b-kculture

## Resumen

MiDashengLM-7B 국악 (kculture) es un ajuste fino mediante LoRA del modelo de audio-lenguaje MiDashengLM-7B de Xiaomi (mispeech), especializado en música tradicional coreana (국악, gugak). Lo desarrolla el usuario xriverAI y resuelve un problema concreto: los modelos de audio generalistas rinden muy mal en dominios musicales específicos, y este ajuste les aporta capacidad de describir, clasificar y responder preguntas sobre piezas de música tradicional coreana.

El modelo parte de una arquitectura de audio-lenguaje que combina un codificador de audio con un LLM de ~7B parámetros (8.281.739.904 parámetros totales según los pesos en safetensors). Se distribuye como modelo completo con los pesos LoRA ya fusionados en el modelo base, de modo que puede cargarse directamente sin necesidad de aplicar el adaptador por separado. El contexto y la arquitectura interna heredan las del modelo base MiDashengLM, orientado a comprensión de audio general con descripciones ("general audio captions").

Es relevante ahora porque demuestra que un ajuste LoRA ligero (rank 32, una época) sobre un corpus de ~35.000 clips de música tradicional puede multiplicar el rendimiento en tareas de dominio (por ejemplo, FENSE en captioning inglés pasa de 17,11 a 46,91), y porque publica una evaluación comparativa explícita frente al modelo base. Su alcance es deliberadamente estrecho: audio de música coreana tradicional, con salidas en coreano e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-lenguaje (codificador de audio + LLM); detalles internos del backbone no disponibles en la información proporcionada |
| Parametros totales | 8.281.739.904 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un ajuste LoRA del base `mispeech/midashenglm-7b-0804-bf16`, un modelo de audio-lenguaje de Xiaomi presentado en el paper "MiDashengLM: Efficient Audio Understanding with General Audio Captions" (arXiv:2508.03983). La arquitectura exacta del backbone (tipo de codificador de audio, transformer del LLM, mecanismos de atención) no se detalla en la información proporcionada; lo que sí se indica es que procesa audio a 16 kHz mono de hasta 30 segundos y genera texto.

El entrenamiento consistió en un LoRA de rank 32 y alpha 32, con tasa de aprendizaje 1e-4, una sola época y tamaño de lote 8, sobre un corpus de aproximadamente 35.000 clips de música tradicional coreana (sumando entrenamiento y evaluación), en formato 16 kHz mono con duración máxima de 30 segundos. Los pesos LoRA se fusionaron posteriormente en el modelo base, por lo que el repositorio contiene un modelo completo listo para cargar. No se documenta en la información disponible el uso de RLHF, DPO ni otras etapas de alineación adicionales sobre el ajuste.

## Capacidades

- Generación de descripciones (captioning) de piezas musicales en coreano e inglés.
- Clasificación de instrumento musical, género, sexo del intérprete vocal y región de origen de la canción folclórica.
- Respuesta a preguntas de opción múltiple y de formato abierto sobre la pieza (장단 jangdan, 조 jo, velocidad, ambiente).
- Transcripción de letras cantadas (reconocimiento de voz aplicado a canto).
- Etiquetado de audio multiobjetivo (audio tagging).
- Verificación e identificación de hablante/intérprete.
- Procesamiento de audio de 1 a 30 segundos, en wav, flac, ogg o mp3 (m4a/aac requieren ffmpeg).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades de visión o audio general más allá de música: orientado específicamente a música tradicional coreana.

## Casos de uso

- Catalogación de archivos de música tradicional: el modelo puede recibir cada clip de hasta 30 segundos y devolver instrumento, género y región, lo que permite etiquetar automáticamente fondos de archivo musical coreano con un coste muy inferior al etiquetado manual.
- Descripción automatizada para plataformas de streaming o museos: genera captions en coreano e inglés que pueden mostrarse junto a cada pieza, aprovechando su FENSE de 68,11 en coreano y 46,91 en inglés frente al modelo base.
- Asistencia a investigadores en etnomusicología: responde preguntas sobre jangdan, jo, velocidad y ambiente, sirviendo como primer filtro o herramienta de exploración sobre grandes colecciones.
- Transcripción de letras para subtitulado o karaoke: la tarea de ASR sobre canto alcanza un CER de 39,45 frente a 137,21 del base, lo que la hace viable como borrador que un humano revisa.
- Enriquecimiento de metadatos en pipelines de gestión de derechos: clasificación de género e instrumento para agrupar y detectar duplicados en catálogos de sellos discográficos.
- Generación de fichas descriptivas combinando análisis y redacción: el autor documenta un flujo en el que este modelo analiza el audio y pasa los resultados a un LLM de texto (Gemma 4) para redactar la caption final, útil cuando se quiere un texto más elaborado.
- Clasificación de voces por sexo y verificación de intérprete en estudios de música tradicional, con precisiones de 96,76 y 87,10 respectivamente en la evaluación del autor.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando el modelo base sin ajuste frente a este modelo sobre el corpus de música tradicional coreana:

| Tarea | Métrica | MiDashengLM-7B (base) | Este modelo |
|---|---|---|---|
| Music captioning (inglés) | FENSE | 17,11 | 46,91 |
| Music captioning (coreano) | FENSE | 41,56 | 68,11 |
| Clasificación de instrumento | ACC | 0,90 | 86,20 |
| Clasificación de género | ACC | 0,00 | 58,50 |
| Music QA (opción múltiple) | ACC | 37,30 | 68,90 |
| Audio tagging multiobjetivo | mAP | 39,61 | 51,33 |
| Reconocimiento de sexo | ACC | 89,88 | 96,76 |
| Verificación de hablante | ACC | 53,60 | 87,10 |
| Identificación de región | ACC | 0,35 | 86,51 |
| ASR de letras | CER | 137,21 | 39,45 |
| Audio QA (abierto) | FENSE | 64,88 | 91,37 |

El autor advierte que estas cifras se obtuvieron con su propio conjunto de evaluación y el mismo código que el paper, por lo que no son directamente comparables con los resultados publicados del modelo base en datasets estándar (MusicCaps, NSynth, FMA, MuChoMusic, FSD50K, VoxCeleb, AISHELL-2), que se listan en la model card como referencia.

Throughput medido por el autor (audio de 30 s, 100 tokens nuevos, H200, bf16):

| Tamaño de lote | 1 | 8 | 64 | 512 |
|---|---|---|---|---|
| Muestras/segundo | 0,39 | 2,98 | 14,21 | 21,15 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB para el modelo en bf16, según indica el autor.
- GPU recomendadas: H200 para el throughput medido; cualquier GPU con al menos 16 GB de VRAM para inferencia en bf16 (A100, H100, L40S, RTX 4090, RTX A6000).
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más (RTX 4090, RTX 4080 Super, RTX 3090/4090). No cabe en GPUs de 8-12 GB sin cuantización, y no se documentan cuantizaciones oficiales.
- Despliegue: transformers con `AutoModelForCausalLM` y `AutoProcessor`, `trust_remote_code=True`, `torch_dtype=torch.bfloat16`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este modelo; el autor usa vLLM únicamente para el LLM de texto auxiliar (Gemma 4) del ejemplo de captioning.
- Latencia y throughput: 0,39 muestras/s con lote 1 y 21,15 muestras/s con lote 512 en H200, para clips de 30 s y 100 tokens generados.
- El flujo de captioning con Gemma 4 31B requiere además unos 86 GB de VRAM para el servidor auxiliar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| xriverAI/midashenglm-7b-kculture | 8,28B | no disponible | Audio-lenguaje especializado en música tradicional coreana | Apache 2.0 |
| mispeech/midashenglm-7b-0804-bf16 | ~7B (base) | no disponible | Audio-lenguaje general (captioning de audio) | Apache 2.0 |
| google/gemma-4-31B-it | 31B | no disponible | LLM multimodal de texto (usado como auxiliar en el ejemplo del autor) | Gemma 4 License |

La comparación directa más relevante es con el modelo base: este ajuste mejora de forma drástica en todas las tareas de dominio evaluadas, a costa de un rendimiento presumiblemente peor fuera del dominio de música tradicional coreana (no evaluado en la información disponible). No se dispone de comparaciones con otros modelos de audio-lenguaje especializados en música coreana.

## Limitaciones y advertencias

- El modelo responde con letra y sexo del intérprete incluso en piezas instrumentales, según reconoce el autor.
- Puede inventar nombres de escuelas o títulos de piezas en las captions (alucinación documentada por el autor).
- Dominio muy estrecho: música tradicional coreana; el rendimiento en otros géneros o en audio general no está evaluado y probablemente sea inferior al del base.
- Solo soporta coreano e inglés como idiomas de salida.
- Audio limitado a 30 segundos; los clips más largos se truncan a los primeros 30 segundos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar antes de usarlo en producción.
- No se documentan cuantizaciones oficiales ni soporte de motores de inferencia de alto rendimiento distintos de transformers.
- Licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento (audio y captions) no se distribuyen con el repositorio, por lo que la procedencia y los derechos del corpus no son verificables desde la información disponible.
- El flujo de captioning documentado depende de un segundo modelo (Gemma 4 31B) con su propia licencia y requisitos de hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xriverAI/midashenglm-7b-kculture
- Modelo base: https://huggingface.co/mispeech/midashenglm-7b-0804-bf16
- Paper MiDashengLM: https://arxiv.org/abs/2508.03983
- Paper FENSE: https://arxiv.org/abs/2110.04684
- Repositorio GitHub: https://github.com/xiaomi-research/dasheng-lm
- Gemma 4 (modelo auxiliar del ejemplo): https://huggingface.co/google/gemma-4-31B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
