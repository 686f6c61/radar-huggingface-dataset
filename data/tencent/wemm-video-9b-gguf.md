# tencent/WeMM-Video-9B-GGUF

## Resumen

WeMM-Video-9B es un modelo multimodal bilingue (chino-ingles) desarrollado por Tencent para la comprension y el razonamiento conjunto de audio y video. Acepta entradas de texto, imagen, audio y video, y genera respuestas en texto. La familia WeMM-Video se presenta como un sistema nativo para el entendimiento audio-visual, no como un adaptador de un modelo de lenguaje sobre un codificador visual, sino como un runtime propio ("WeMM native runtime") con componentes separados para lenguaje, vision y audio.

El repositorio que nos ocupa, `tencent/WeMM-Video-9B-GGUF`, es la distribucion cuantizada en formato GGUF con receta Q4_K_M del modelo base `tencent/WeMM-Video-9B`. El bundle se compone de tres ficheros: el modelo de lenguaje con tokenizador y plantilla de chat (`language.gguf`, 10,41 GiB), el codificador visual y proyector (`mmproj.gguf`, 0,86 GiB) y el codificador de audio y proyector (`audio.gguf`, 2,01 GiB). El tag `qwen3_5` en Hugging Face sugiere una base arquitectonica derivada de la familia Qwen, aunque la model card no lo confirma explicitamente.

La relevancia de esta ficha radica en que se trata de una publicacion reciente (noviembre de 2026) con licencia Apache 2.0, lo que facilita su adopcion comercial, y en que ofrece una via de despliegue en CPU a traves del runtime nativo de WeMM, un escenario poco habitual en modelos multimodales de video y audio. No obstante, la informacion publica disponible es muy limitada: no hay benchmarks, no se detalla la composicion del dataset de entrenamiento y el numero de parametros reportado en safetensors (1.078.789.128) no concuerda con la denominacion "9B" del modelo, lo que obliga a tratar ese dato con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (tag `qwen3_5` en Hugging Face; multimodal con codificadores separados de vision y audio) |
| Parametros totales | 1.078.789.128 segun safetensors del repo base; la denominacion comercial es "9B" (dato no coherente, ver limitaciones) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (tensores seleccionados de atencion y entrada/salida en BF16) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`language.gguf`, `mmproj.gguf`, `audio.gguf`) |

## Arquitectura y entrenamiento

La informacion publica no detalla la arquitectura interna mas alla de que se trata de un modelo multimodal con componentes diferenciados: un modelo de lenguaje con tokenizador y plantilla de chat, un codificador visual con proyector y un codificador de audio con proyector. El tag `qwen3_5` sugiere que el backbone linguistico podria derivar de la familia Qwen, pero la model card no lo confirma ni aporta detalles sobre el numero de capas, dimensiones ocultas o mecanismo de atencion. Tampoco se especifica si emplea atencion completa, atencion lineal u otra variante.

No se han publicado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La unica informacion sobre el proceso de cuantizacion es que la receta Q4_K_M preserva en BF16 tensores seleccionados de atencion y de entrada/salida, con un ambito de precision documentado en `scope.json` y un manifiesto en `manifest.json`. El modelo base es `tencent/WeMM-Video-9B`, y este repositorio es una conversion cuantizada del mismo.

## Capacidades

- Generacion de texto a partir de entradas multimodales: texto, imagen, audio y video.
- Comprension de video: procesa fotogramas de video (con `--video` y control de `--max-frames`) para describir lo que ocurre en pantalla.
- Comprension audio-visual conjunta: con `--video-audio` procesa simultaneamente los fotogramas y la pista de sonido original, permitiendo describir la escena y resumir el habla.
- Transcripcion de audio: la model card incluye un ejemplo de transcripcion de habla en ingles.
- Descripcion de imagenes: ejemplo incluido de descripcion de una imagen fija.
- Razonamiento aritmetico basico sobre texto: el ejemplo de la model card resuelve un problema de duracion de reunion ("A 20-minute meeting starts at 09:45. When does it end?").
- Soporte bilingue chino-ingles.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte explicito de agentes o razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking mode) ni otras capacidades especiales.

## Casos de uso

- Analisis de reuniones y videoconferencias: el modelo puede procesar la pista de audio de una grabacion para transcribir y resumir el habla, y combinarla con los fotogramas para describir la escena, gracias al modo `--video-audio` que procesa ambas modalidades de forma conjunta.
- Indexado y descripcion de archivos audiovisuales: util para generar metadatos descriptivos de videos en bibliotecas o plataformas, usando `--video` con un numero controlado de fotogramas (`--max-frames`) para ajustar el coste computacional al tamano del catalogo.
- Accesibilidad: generacion de descripciones de contenido visual y resumenes de audio para personas con discapacidad visual o auditiva, aprovechando la capacidad de describir la escena y resumir el habla en una sola pasada.
- Transcripcion y analisis de material de archivo historico: el ejemplo de la model card con material del Apolo 11 sugiere su uso para transcribir grabaciones y describir imagenes de archivo, un escenario donde el procesamiento en CPU puede ser suficiente para lotes pequenos.
- Despliegue en entornos sin GPU: al distribuirse en GGUF y contar con un runtime nativo de CPU validado por el autor, es adecuado para estaciones de trabajo, servidores sin acelerador o entornos edge donde no se dispone de CUDA.
- Prototipado rapido de aplicaciones multimodales: el launcher `native/run_hf.py` descarga automaticamente los tres componentes desde el Hub, lo que permite validar flujos de imagen, audio y video con pocas lineas de comando antes de invertir en infraestructura.
- Investigacion en comprension audio-visual: con licencia Apache 2.0, sirve como base para experimentos academicos sobre razonamiento conjunto de audio y video en ingles y chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion reportada por el autor es que el runtime nativo de CPU de WeMM cargo el bundle y completo comprobaciones de generacion para texto, imagen, audio y video con pista de sonido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, el bundle Q4_K_M ocupa aproximadamente 13,28 GiB en disco (10,41 + 0,86 + 2,01 GiB), por lo que un despliegue integro en GPU requeriria al menos esa cantidad de memoria mas el overhead del runtime.
- GPU recomendadas: no especificadas por el autor. Por tamano del bundle, una GPU con 24 GB (RTX 4090, A10G, L4 con limitaciones) seria el minimo razonable para cargar los tres componentes; A100 o H100 permitirian margen para contexto y lotes mayores.
- Compatibilidad con GPU de consumo: probable en RTX 4090 (24 GB) si se cargan los tres ficheros; en GPUs de 16 GB o menos habria que valorar la descarga parcial de componentes o la offload a CPU.
- Opciones de despliegue: el autor documenta exclusivamente el runtime nativo de WeMM (`native/run_hf.py`), con soporte de offload a CUDA segun la guia nativa. No se menciona compatibilidad con llama.cpp, Ollama, vLLM ni TGI, y el tag `custom_code` sugiere que el modelo requiere codigo propio.
- Latencia y throughput: no disponibles. El autor solo confirma que el runtime de CPU completo las comprobaciones de generacion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (multimodales de video y audio con licencia permisiva) ni datos de rendimiento que permitan establecer una comparacion rigurosa. La model card no cita alternativas ni benchmarks frente a otros sistemas.

## Limitaciones y advertencias

- Incoherencia en el recuento de parametros: el dato de safetensors del repo base indica 1.078.789.128 parametros, mientras que la denominacion del modelo es "9B". Esta discrepancia no queda explicada en la informacion disponible y debe verificarse antes de dimensionar infraestructura.
- Ausencia total de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, lo que impide estimar su calidad relativa frente a alternativas.
- Cobertura linguistica limitada a ingles y chino; no se documenta soporte de castellano ni de otros idiomas.
- Longitud de contexto no documentada, lo que dificulta planificar casos de uso con entradas largas (por ejemplo, videos extensos o conversaciones multi-turno prolongadas).
- Dependencia de un runtime propietario: el modelo requiere el WeMM native runtime y no se documenta compatibilidad con ecosistemas estandar como llama.cpp u Ollama, pese al formato GGUF. El tag `custom_code` refuerza esta dependencia.
- Riesgo de alucinacion no cuantificado: al no haber evaluaciones publicadas, no es posible estimar la tasa de errores en transcripcion, descripcion o razonamiento.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento ni se han publicado analisis de sesgo.
- Restricciones de licencia: el modelo se distribuye bajo Apache 2.0, lo que permite uso comercial, pero los componentes de terceros incluidos siguen sujetos a sus terminos originales, segun indica la model card.
- Madurez temprana: el repositorio se creo en noviembre de 2026 y no registra descargas ni valoraciones, por lo que no existe evidencia de uso en produccion por parte de la comunidad.
- Consistencia del bundle: el autor advierte de que los tres ficheros GGUF deben mantenerse en la misma revision del Hub; mezclar revisiones puede romper la inferencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tencent/WeMM-Video-9B-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Video-9B
- Proyecto en GitHub: https://github.com/Tencent/WeMM-Video
- Coleccion de modelos WeMM-Video: https://huggingface.co/collections/tencent/wemm-video
- Guia del runtime nativo: https://github.com/Tencent/WeMM-Video/blob/main/native/README.md
- Ejecucion desde el Hub: https://github.com/Tencent/WeMM-Video/blob/main/native/README.md#run-from-the-hub
- Licencia y atribuciones de terceros: https://github.com/Tencent/WeMM-Video/blob/main/LICENSE
- Ambito de precision de la cuantizacion: https://huggingface.co/tencent/WeMM-Video-9B-GGUF/blob/main/scope.json
- Manifiesto del bundle: https://huggingface.co/tencent/WeMM-Video-9B-GGUF/blob/main/manifest.json
