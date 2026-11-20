# tencent/WeMM-Video-2B

## Resumen

WeMM-Video-2B es un modelo multimodal denso de 2B (3.283.624.264 parámetros reales según safetensors) desarrollado por Tencent, perteneciente a la familia WeMM-Video para comprensión y razonamiento conjunto de audio y vídeo. Acepta texto, imágenes, audio y vídeo como entrada, y genera respuestas de texto en inglés o chino. Resuelve el problema de alinear la información visual (fotogramas de vídeo con marcas temporales) con la pista de audio original en un único modelo compacto, algo que la mayoría de modelos de la misma escala no cubren de forma nativa.

El modelo se apoya en codificadores de visión y audio independientes que proyectan las modalidades a tokens que el modelo de lenguaje procesa junto al texto. Se entrenó con aproximadamente 1,2 billones de tokens multimodales y un post-entrenamiento que incluye OPD multi-profesor, MrDPO anti-repetición y aprendizaje por refuerzo especializado. Está disponible en BF16 safetensors (6,12 GiB de pesos) y variantes cuantizadas FP8 Block128, AWQ W4A16, GGUF Q4_K_M y NVFP4 W4A16.

Su relevancia actual radica en que ofrece comprensión audiovisual conjunta en un tamaño que cabe en GPUs de consumo, con licencia Apache 2.0 y soporte para vLLM y SGLang mediante parches específicos, además de un modo de razonamiento opcional (`enable_thinking`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con codificadores de visión y audio separados que alimentan tokens al modelo de lenguaje (etiqueta `qwen3_5` en la librería) |
| Parametros totales | 3.283.624.264 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; los ejemplos de despliegue usan `--max-model-len 8192` y `--context-length 8192` |
| Tipos de cuantizacion | BF16, FP8 Block128, AWQ W4A16, GGUF Q4_K_M, NVFP4 W4A16 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); GGUF en la variante cuantizada |

## Arquitectura y entrenamiento

WeMM-Video-2B es un modelo denso (no MoE) en el que codificadores de visión y audio transforman los medios en tokens que el modelo de lenguaje procesa junto al texto. Los fotogramas de vídeo incorporan marcas temporales, lo que permite razonar sobre la secuencia temporal de los eventos. El modelo se expone a través de `AutoModelForImageTextToText` y `AutoProcessor` con `trust_remote_code=True`, e incluye código personalizado (`custom_code`) en el repositorio.

El entrenamiento consta de un preentrenamiento sobre aproximadamente 1,2 billones de tokens multimodales, seguido de un post-entrenamiento con OPD multi-profesor (destilación desde varios profesores), MrDPO anti-repetición (para mitigar bucles degenerados en generación) y aprendizaje por refuerzo con especialistas. La model card no detalla la composición exacta del dataset ni el número de tokens por modalidad.

## Capacidades

- Comprensión audiovisual conjunta: combina fotogramas de vídeo con la pista de sonido original para describir eventos, transcribir habla y razonar sobre lo visto y oído.
- Procesamiento de vídeo silencioso (solo fotogramas) y de audio independiente.
- Comprensión de imágenes y generación de texto a partir de ellas.
- Transcripción de habla (speech-to-text) en el audio de entrada.
- Razonamiento aritmético y de sentido común sobre texto (el ejemplo de la model card resuelve un problema de duración de reunión).
- Modo instructivo por defecto y modo de razonamiento opcional mediante `enable_thinking=True` en `apply_chat_template`.
- Respuestas en inglés y chino.
- Entrada multimodal combinada: hasta 4 imágenes, 2 vídeos y 2 audios por prompt según la configuración de vLLM de ejemplo.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Análisis de reuniones y videollamadas: el modelo recibe el vídeo con su audio y puede describir lo que ocurre en pantalla mientras resume o transcribe lo que se dice, gracias al procesamiento conjunto de fotogramas con marcas temporales y pista de sonido.
- Accesibilidad y subtitulado enriquecido: generar descripciones de escenas y transcripciones sincronizadas para contenido audiovisual en inglés o chino, usando la entrada `video_audio` con fps y límites de fotogramas configurables.
- Moderación de contenido multimedia: clasificar y describir eventos en clips de vídeo con audio para revisión humana posterior, aprovechando que el modelo cabe en una sola GPU y admite cuantización GGUF Q4_K_M para despliegues de bajo coste.
- Archivado y etiquetado de bibliotecas de vídeo: indexar clips por contenido visual y hablado generando descripciones textuales que alimenten un motor de búsqueda, con lotes controlados mediante `max_frames` y `total_pixels`.
- Asistencia en atención al cliente sobre material audiovisual: responder preguntas de usuarios sobre vídeos de producto o tutoriales, combinando la descripción visual con la transcripción del audio en una sola llamada.
- Procesamiento de audio independiente: transcripción de grabaciones y respuesta a preguntas sobre su contenido sin necesidad de vídeo, útil para notas de voz o entrevistas.
- Análisis de imágenes en pipelines documentales: descripción y razonamiento sobre imágenes sueltas dentro de flujos de extracción de información, con el modo de razonamiento activable cuando la tarea lo requiera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos BF16: 6,12 GiB de archivos de pesos; el repositorio completo ocupa 6,6 GB. Hay que sumar memoria para entradas multimedia y caché de generación.
- Cuantizaciones: existen variantes FP8 Block128, AWQ W4A16, GGUF Q4_K_M y NVFP4 W4A16 que reducen la huella de memoria; no se especifican cifras exactas de VRAM por variante en la información disponible.
- GPU recomendadas: no se indican modelos concretos; los ejemplos de despliegue usan BF16 con `device_map="auto"` y `--dtype bfloat16`.
- GPU de consumo: por el tamaño de pesos (6,12 GiB en BF16) es plausible en GPUs de consumo con suficiente VRAM, especialmente con las variantes cuantizadas; no hay confirmación oficial en la información proporcionada.
- Despliegue: vLLM parcheado 0.18.0 (y 0.31.0 para BF16), SGLang parcheado 0.5.16 o 0.5.19, y Transformers con `trust_remote_code=True`. Requiere instalar el parche de runtime de WeMM y seguir la guía de serving con perfiles de dependencias e imágenes Docker.
- Configuración de serving de ejemplo: `--max-model-len 8192`, `--no-enable-prefix-caching`, `--mamba-ssm-cache-dtype float32`, límites multimodales `{"image":4,"video":2,"audio":2}` y parámetros de vídeo `{"fps":2,"min_frames":4,"max_frames":16,"total_pixels":262144}`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia estructural, dentro de la propia familia WeMM-Video existen otros checkpoints y variantes cuantizadas del mismo modelo (FP8, AWQ, GGUF, NVFP4), pero no se detallan sus diferencias de rendimiento.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| WeMM-Video-2B | 3.283.624.264 | no disponible (ejemplos a 8192) | Apache 2.0 | Hugging Face, variantes cuantizadas |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: solo inglés y chino; no hay soporte declarado para castellano ni otras lenguas.
- Riesgo de alucinación: no se documenta en la model card; como en todo modelo generativo, las descripciones de vídeo y las transcripciones deben validarse en producción.
- Sesgos: no se detallan sesgos conocidos en la información proporcionada.
- Contexto: la longitud de contexto no se declara explícitamente; los ejemplos de serving usan 8192 tokens, lo que limita la cantidad de fotogramas y audio procesables por petición.
- Dependencia de parches: el despliegue en vLLM y SGLang requiere versiones parcheadas y el parche de runtime de WeMM, lo que añade complejidad operativa y riesgo de incompatibilidades.
- Código personalizado: requiere `trust_remote_code=True`, con la implicación de seguridad que ello conlleva.
- Límites multimodales: la configuración de ejemplo restringe a 4 imágenes, 2 vídeos y 2 audios por prompt.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los términos de los componentes de terceros incluidos en el repositorio.
- Madurez: el repositorio muestra 0 descargas y 1 like en el momento de la consulta, lo que sugiere adopción temprana y poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Video-2B
- Repositorio del proyecto: https://github.com/Tencent/WeMM-Video
- Colección de modelos WeMM-Video: https://huggingface.co/collections/tencent/wemm-video
- Variante FP8 Block128: https://huggingface.co/tencent/WeMM-Video-2B-FP8
- Variante AWQ W4A16: https://huggingface.co/tencent/WeMM-Video-2B-AWQ
- Variante GGUF Q4_K_M: https://huggingface.co/tencent/WeMM-Video-2B-GGUF
- Variante NVFP4 W4A16: https://huggingface.co/tencent/WeMM-Video-2B-NVFP4
- Guía de instalación del parche: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md#manual-install-and-patch
- Guía de serving: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md#runtime-profiles
- Receta vLLM: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md#serve-with-vllm
- Receta SGLang: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md#serve-with-sglang
- Visión general de la familia: https://github.com/Tencent/WeMM-Video#overview
