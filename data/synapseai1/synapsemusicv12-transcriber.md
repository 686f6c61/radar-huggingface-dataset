# SYNAPSEai1/SynapseMusicV12-Transcriber

## Resumen

SynapseMusicV12-Transcriber es un modelo de transcripción de audio publicado en HuggingFace por el usuario SYNAPSEai1. Según su model card, corresponde a ACE-Step Transcriber, el modelo de anotación empleado por ACE-Step v1.5 para etiquetar datos de entrenamiento, y está especializado en transcribir tanto voz hablada como voz cantada, incluyendo anotaciones de estructura musical (verso, estribillo, puente, interludio instrumental, etc.). El pipeline declarado es audio-text-to-text y la librería de referencia es transformers.

El repositorio declara 10.732.225.408 parámetros (aproximadamente 10,7 mil millones) en pesos safetensors, con un tamaño de repositorio de 22,4 GB, lo que es coherente con pesos en bf16/fp16 más los componentes de audio. La model card indica que el uso es equivalente al de Qwen2.5-Omni-7B, de modo que el modelo parece derivar de esa familia multimodal, aunque el número de parámetros declarado no coincide con los 7B nominales de Qwen2.5-Omni-7B.

La relevancia actual del modelo radica en su enfoque específico: la mayoría de sistemas ASR están optimizados para habla y fallan con voz cantada, mientras que este modelo añade etiquetado estructural de canciones y salida en un formato estructurado reutilizable. Su licencia MIT y su compatibilidad con endpoints lo hacen atractivo para pipelines de anotación automática, aunque el repositorio presenta señales de adopción muy baja (0 descargas, 1 like en el momento de la consulta) y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; la model card indica que el uso es idéntico al de Qwen2.5-Omni-7B, por lo que se asume una arquitectura transformer multimodal con entrada de audio (familia Qwen2.5-Omni). No confirmado por el autor en el repositorio |
| Parametros totales | 10.732.225.408 (dato real de los safetensors) |
| Parametros activos | No aplica / no disponible (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Solo se declaran pesos safetensors; no se han publicado variantes GGUF, AWQ, GPTQ ni FP8 en el repositorio |
| Idiomas soportados | Más de 50 idiomas según la model card: chino, japonés, coreano, vietnamita, tailandés, indonesio, malayo, filipino, hindi, bengalí, tamil, urdu, inglés, alemán, francés, español, italiano, portugués, ruso, polaco, neerlandés, griego, turco, árabe, hebreo, persa, entre otros |
| Licencia | MIT (declarada en la model card y en los metadatos del repositorio) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La información pública disponible es limitada. La model card no describe la arquitectura interna más allá de indicar que "el uso es el mismo que el de Qwen2.5-Omni-7B", lo que sugiere una arquitectura derivada de dicha familia: un transformer multimodal con codificador de audio y decodificación de texto. El repositorio está etiquetado con `qwen2_5_omni` y `audio-text-to-text`, lo que respalda esa hipótesis. No se detalla si existe un componente de decodificación tipo Talker, ni la estrategia de alineación temporal del audio (por ejemplo, TMRoPE u otras variantes).

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o ajuste supervisado posterior. La model card únicamente contextualiza el modelo como anotador de datos para ACE-Step v1.5, lo que implica que fue ajustado (o al menos seleccionado) para producir transcripciones con etiquetas estructurales de canción en un formato concreto: un bloque `# Languages` con el código de idioma y un bloque `# Lyrics` con etiquetas de sección entre corchetes. Se referencia un tech report en arXiv (2602.00744), pero su contenido no forma parte de la información proporcionada.

## Capacidades

- Transcripción de voz hablada en más de 50 idiomas, con salida en texto plano.
- Transcripción de voz cantada (letras de canciones), que es la capacidad diferencial frente a los sistemas ASR convencionales.
- Anotación automática de estructura musical mediante etiquetas de sección: `[Intro]`, `[Outro]`, `[Verse 1]`, `[Verse 2]`, `[Chorus]`, `[Pre-Chorus]`, `[Post-Chorus]`, `[Bridge]`, `[Guitar Interlude]`, `[Instrumental]`, `[Spoken]`.
- Etiquetado opcional de instrumentación asociada a una sección, por ejemplo `[Intro - Acoustic Guitar]`.
- Detección y declaración del idioma del audio transcrito en un campo dedicado (`# Languages`).
- Salida estructurada y parseable, adecuada para ingesta automática en bases de datos o pipelines de entrenamiento.
- Procesamiento de audio de entrada (capacidad multimodal audio-texto), según el pipeline declarado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está orientado a anotación, no a razonamiento general.
- Modo "thinking" explícito, visión o procesamiento de imagen: no disponible en la información proporcionada.
- Generación de audio o música: no disponible; aunque el repositorio incluye la etiqueta `text-to-audio`, la model card describe exclusivamente funciones de transcripción y anotación.

## Casos de uso

- Creación de datasets de letras etiquetadas para entrenamiento de modelos de música: el modelo genera pares audio-letra con estructura de canción, lo que permite construir corpus supervisados para modelos de generación musical o de alineación letra-audio sin anotación manual.
- Prelabeling en pipelines de anotación humana: se ejecuta el modelo sobre un catálogo de pistas y se revisan únicamente las salidas dudosas, reduciendo el coste de anotación frente a la transcripción manual desde cero.
- Producción musical y extracción de letras de referencia: a partir de una maqueta o de una mezcla de referencia, el modelo devuelve la letra con secciones marcadas, lo que facilita la reescritura, la traducción o la adaptación de la estructura.
- Enriquecimiento de metadatos en plataformas de streaming: detección de idioma y segmentación estructural (intro, verso, estribillo) para alimentar sistemas de recomendación, generación de fragmentos de previsualización o navegación por secciones.
- Accesibilidad y subtitulado: generación de transcripciones para contenido hablado y cantado, útil en karaoke, vídeos musicales y material educativo, teniendo en cuenta que el formato de salida no incluye marcas de tiempo.
- Análisis musical y music information retrieval: extracción de la estructura formal de una canción para estudios de musicología computacional, comparación entre versiones de un mismo tema o análisis de formas populares.
- Transcripción multilingüe de audio hablado: podcasts, entrevistas y material audiovisual en cualquiera de los más de 50 idiomas declarados, con identificación automática del idioma.
- Investigación en transcripción de canto: evaluación de técnicas de ASR aplicadas a voz cantada, un dominio donde los modelos de habla convencionales degradan su precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de WER, MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros sistemas, y la búsqueda web realizada no ha devuelto documentación técnica relevante sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 21-22 GB solo para pesos, más el consumo adicional del codificador de audio, caché de atención y buffers de activaciones; conviene presupuestar 24 GB o más.
- VRAM estimada con cuantización de 8 bits: aproximadamente 11-12 GB para pesos, más overhead (del orden de 14-16 GB en total).
- VRAM estimada con cuantización de 4 bits: aproximadamente 6-7 GB para pesos, más overhead (del orden de 8-10 GB en total). Estas estimaciones son teóricas a partir del número de parámetros; no se han publicado pesos cuantizados en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para despliegue en bf16 sin cuantizar. En gama consumer, RTX 4090 o RTX 3090 con 24 GB pueden alojar el modelo en bf16 al límite; RTX 4080, RTX 4070 Ti Super o RTX 4060 Ti de 16 GB requerirían cuantización.
- Cabe en GPU consumer: sí, en GPUs de 24 GB con precisión completa ajustada y, con cuantización, en GPUs de 12-16 GB, siempre que se disponga de una ruta de cuantización compatible (no publicada en el repositorio).
- Opciones de despliegue: la model card indica el uso estándar con la librería `transformers`; el repositorio está marcado como compatible con endpoints de HuggingFace. No se declaran ni se han publicado pesos GGUF para llama.cpp u Ollama, ni integraciones verificadas con vLLM o TGI.
- Latencia y throughput: no disponibles. No se han publicado datos de latencia por minuto de audio ni de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SynapseMusicV12-Transcriber (ACE-Step Transcriber) | 10,7B | No disponible | Transcripción de habla y canto con etiquetado estructural de canción | MIT | HuggingFace, safetensors, transformers |
| Qwen2.5-Omni-7B | 7B (nominales) | No disponible en esta ficha | Modelo multimodal audio-texto-video de propósito general | Apache-2.0 | HuggingFace, transformers, ecosistema amplio (vLLM, etc.) |
| Whisper large-v3 | 1,55B | 30 segundos por ventana en la práctica estándar | ASR multilingüe de habla; no orientado a canto ni a estructura musical | Apache-2.0 | HuggingFace, múltiples runtimes (whisper.cpp, faster-whisper, vLLM) |

Nota: los datos de los modelos comparados no se han verificado mediante búsqueda web en esta consulta y deben confirmarse en sus respectivas model cards. La comparación de rendimiento no es posible porque SynapseMusicV12-Transcriber no publica métricas.

## Limitaciones y advertencias

- No se han publicado benchmarks, métricas de WER ni evaluaciones de precisión. Es imposible estimar su calidad relativa frente a otros sistemas sin una evaluación propia.
- Adopción prácticamente nula: 0 descargas y 1 like en el momento de la consulta. No hay evidencia de uso en producción ni validación por terceros.
- Discrepancia de identidad: el repositorio se llama `SynapseMusicV12-Transcriber` y pertenece a `SYNAPSEai1`, pero la model card solo menciona "ACE-Step Transcriber" y ACE-Step v1.5. No se documenta la relación entre ambos nombres ni si se trata de una redistribución o de un ajuste propio.
- Discrepancia de tamaño: la model card afirma que el uso es idéntico al de Qwen2.5-Omni-7B, pero el repositorio declara 10,7B parámetros. Conviene verificar la correspondencia real entre arquitectura, tokenizador y pesos antes de integrarlo.
- Riesgo de alucinación en letras: en pasajes con mezcla densa, coros superpuestos, voz procesada o idiomas poco representados, el modelo puede generar texto plausible pero incorrecto. No se han publicado tasas de error.
- Ausencia de marcas de tiempo: la salida estructurada incluye idioma y letra con etiquetas de sección, pero no timestamps. Esto limita su uso directo para subtitulado sincronizado o karaoke.
- Cobertura de idiomas no verificada: los "más de 50 idiomas" proceden de la model card y no se acompañan de métricas por idioma. Es esperable un rendimiento desigual entre lenguas y entre habla y canto.
- Riesgo de sesgo: no hay documentación sobre la composición del dataset de entrenamiento, por lo que no puede evaluarse el sesgo por género musical, acento, dialecto o idioma.
- Licencia: se declara MIT, lo que en principio permite uso comercial, modificación y redistribución. Sin embargo, si el modelo deriva de Qwen2.5-Omni, conviene revisar las condiciones de la licencia original (Apache-2.0) y confirmar que la relicencia a MIT es válida según los términos de la obra derivada.
- Compatibilidad de despliegue limitada: al no existir pesos GGUF ni cuantizaciones publicadas, el despliegue en CPU o en GPUs de gama baja requiere generar las cuantizaciones por cuenta propia.
- Formato de prompt rígido: la entrada debe seguir el patrón `*Task* Transcribe this audio in detail` seguido del audio; desviarse del formato puede degradar la calidad o romper el parseo de la salida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SYNAPSEai1/SynapseMusicV12-Transcriber
- Tech report referenciado en la model card: https://arxiv.org/abs/2602.00744
- Qwen2.5-Omni-7B, referencia de uso indicada por el autor: https://huggingface.co/Qwen/Qwen2.5-Omni-7B

Nota: la búsqueda web realizada no ha devuelto resultados relevantes sobre el modelo, su paper ni su repositorio de código. No se dispone de enlaces a demo, repositorio GitHub ni documentación adicional.
