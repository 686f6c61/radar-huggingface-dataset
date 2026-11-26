# tencent/WeMM-Video-9B-GGUF

## Resumen

WeMM-Video-9B-GGUF es la versión cuantizada en formato GGUF (receta Q4_K_M) de WeMM-Video-9B, un modelo multimodal de la familia WeMM-Video desarrollada por Tencent para comprensión y razonamiento conjunto de audio y vídeo. El modelo acepta texto, imágenes, audio y vídeo como entrada y genera respuestas de texto, lo que lo sitúa en la categoría de modelos omni-modales orientados a tareas de video-text-to-text. La familia está diseñada para el bilingüismo chino-inglés y se distribuye bajo licencia Apache 2.0.

El bundle GGUF se compone de tres ficheros: el modelo de lenguaje con tokenizador y plantilla de chat (10,41 GiB), el codificador visual con su proyector (0,86 GiB) y el codificador de audio con su proyector (2,01 GiB). Está pensado para ejecutarse con el runtime nativo de WeMM, que permite offload a CUDA, y no con los runners genéricos habituales de llama.cpp. La cuantización Q4_K_M preserva en BF16 determinados tensores de atención y de entrada/salida, según el manifiesto incluido en el repositorio.

La relevancia de esta ficha radica en que ofrece un modelo de comprensión audiovisual conjunta en un formato cuantizado y con licencia permisiva, algo poco frecuente en la categoría. No obstante, conviene señalar una discrepancia importante: la model card describe el modelo como "9B", pero el recuento de parámetros en safetensors del modelo base es de 1.078.789.128 parámetros (aproximadamente 1,08 mil millones), un dato que debe verificarse antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia qwen3_5 según tags) con codificador visual y codificador de audio independientes más proyector |
| Parametros totales | 1.078.789.128 según safetensors del modelo base; la model card usa la denominación comercial "9B" (discrepancia no aclarada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (tensores seleccionados de atención y E/S preservados en BF16) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (language.gguf, mmproj.gguf, audio.gguf); el modelo base en safetensors |

## Arquitectura y entrenamiento

WeMM-Video-9B es un modelo multimodal que combina un modelo de lenguaje con un codificador visual y un codificador de audio, cada uno con su proyector correspondiente, de modo que el sistema procesa de forma conjunta fotogramas de vídeo y la pista de audio original. Los tags del repositorio lo etiquetan como `qwen3_5`, lo que sugiere que el backbone lingüístico deriva de la familia Qwen 3.5, aunque la model card no detalla la arquitectura interna ni el número de capas, dimensiones ocultas o mecanismo de atención. El modelo soporta modos "Thinking" e "Instruct", con parámetros de muestreo recomendados distintos para cada tarea y modalidad.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. La model card remite al informe técnico (arXiv 2611.26409) para los detalles de entrenamiento y evaluación, y enlaza los resultados de benchmarks a la variante WeMM-Video-35B-A3B. La innovación destacable es la integración nativa de audio y vídeo en un mismo pipeline de razonamiento, junto con un runtime propio ("WeMM native runtime") que soporta ejecución en CPU y offload a CUDA.

## Capacidades

- Comprensión de vídeo: descripción de escenas a partir de fotogramas, con control del número máximo de fotogramas procesados (`--max-frames`).
- Comprensión audiovisual conjunta: procesa simultáneamente fotogramas y la banda sonora original para describir la escena y resumir el habla.
- Comprensión de audio: transcripción de voz y respuesta a preguntas sobre grabaciones.
- Comprensión de imágenes: descripción y razonamiento sobre imágenes estáticas.
- Razonamiento multimodal en modo "Thinking": cadena de razonamiento interna con parámetros de muestreo específicos por modalidad.
- Modo "Instruct" para tareas generales con decodificación directa.
- Generación de texto y razonamiento textual puro (petición solo con prompt).
- Capacidades multilingües limitadas a inglés y chino.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso.

## Casos de uso

- Análisis de reuniones y videollamadas: el modelo puede recibir el vídeo con su audio y resumir el contenido hablado junto con la descripción de la escena, útil para generar actas automáticas a partir de grabaciones.
- Accesibilidad y subtitulado enriquecido: transcripción del audio combinada con descripción de lo que ocurre en pantalla, adecuado para generar pistas descriptivas para personas con discapacidad auditiva o visual.
- Moderación de contenido audiovisual: clasificación y descripción de vídeos subidos por usuarios, procesando tanto imagen como sonido en una sola pasada para detectar contenido inapropiado.
- Indexación y búsqueda semántica de archivos multimedia: generación de descripciones textuales de vídeos y audios que alimenten un motor de búsqueda o un sistema RAG sobre una videoteca.
- Transcripción y análisis de entrevistas o podcasts: el modo de audio permite transcribir y responder preguntas sobre grabaciones de voz sin necesidad de vídeo.
- Asistencia en documentación técnica con imágenes: descripción de diagramas, capturas o fotografías técnicas en flujos de soporte, aprovechando el modo imagen.
- Prototipado de investigación en modelos omni-modales: al distribuirse en GGUF con licencia Apache 2.0, sirve para experimentar con pipelines de audio-vídeo en entornos con recursos limitados mediante el runtime nativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la página de evaluación de la variante WeMM-Video-35B-A3B para la comparativa del informe técnico, pero no incluye cifras para esta variante de 9B.

## Requisitos de hardware

- VRAM estimada para inferencia: el bundle completo ocupa aproximadamente 13,3 GiB en disco (10,41 + 0,86 + 2,01 GiB); con overhead de contexto y caché KV, se recomienda un mínimo de 16 GB de VRAM para cargar las tres componentes en GPU.
- GPU recomendadas: no disponible de forma explícita; por tamaño, una RTX 4090 (24 GB) o una A100/H100 permiten cargar el bundle completo con margen para contexto.
- GPU de consumo: cabe en GPUs de 24 GB (RTX 3090, RTX 4090); en GPUs de 16 GB requiere ajustar el contexto o hacer offload parcial a CPU.
- Opciones de despliegue: runtime nativo de WeMM (`native/run_hf.py`) con soporte de offload a CUDA; no se documenta compatibilidad con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponible. El modelo procesa vídeo por fotogramas (`--max-frames`), por lo que el coste crece linealmente con el número de fotogramas seleccionados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| WeMM-Video-9B-GGUF | ~1,08B (safetensors) / "9B" comercial | no disponible | texto, imagen, audio, vídeo | Apache 2.0 | GGUF |
| WeMM-Video-35B-A3B | 35B totales, 3B activos (MoE) | no disponible | texto, imagen, audio, vídeo | Apache 2.0 | no disponible |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de comprensión audiovisual conjunta en la documentación proporcionada, por lo que la comparativa con terceros queda como no disponible.

## Limitaciones y advertencias

- Discrepancia de tamaño: la denominación comercial "9B" no concuerda con los 1.078.789.128 parámetros de safetensors del modelo base; verificar el recuento real antes de dimensionar infraestructura.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano, lo que restringe su uso en producción en español.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en descripciones de vídeo con pocos fotogramas o audio de baja calidad.
- Dependencia del runtime nativo de WeMM: el bundle no está pensado para llama.cpp, Ollama u otros runners estándar, lo que limita las opciones de despliegue y añade coste de integración.
- Los tres ficheros GGUF deben mantenerse en la misma revisión del Hub; mezclar revisiones puede romper la carga del modelo.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al modelo base en BF16, con impacto no cuantificado en tareas de razonamiento audiovisual.
- Licencia Apache 2.0 para el modelo, pero los componentes de terceros quedan sujetos a sus propios términos, según indica la model card.
- No se documentan capacidades de tool calling ni de agentes, lo que limita su integración en pipelines automatizados complejos.
- No se publican benchmarks de esta variante, por lo que el rendimiento real en tareas concretas debe validarse empíricamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tencent/WeMM-Video-9B-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Video-9B
- Colección WeMM-Video: https://huggingface.co/collections/tencent/wemm-video
- Informe técnico (arXiv): https://arxiv.org/abs/2611.26409
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.26409
- Repositorio GitHub: https://github.com/Tencent/WeMM-Video
- Guía del runtime nativo: https://github.com/Tencent/WeMM-Video/blob/main/native/README.md
- Evaluación de WeMM-Video-35B-A3B: https://huggingface.co/tencent/WeMM-Video-35BA3B#evaluation
- Licencia y atribuciones de terceros: https://github.com/Tencent/WeMM-Video/blob/main/LICENSE
