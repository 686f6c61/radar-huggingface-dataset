# subly-app/subly

## Resumen

Subly es una aplicación de código abierto publicada en Hugging Face bajo el identificador `subly-app/subly`. No se trata de un modelo de lenguaje en sentido estricto, sino de un pipeline de subtitulado automático empaquetado como aplicación Docker (SDK `docker`, puerto 7860). El sistema recibe la URL de un vídeo o un archivo subido, detecta el idioma del audio, lo transcribe con Whisper generando marcas de tiempo, traduce el resultado al portugués preservando el tono del original y produce ficheros de subtítulos SRT/VTT sincronizados. Opcionalmente, embebe los subtítulos en el vídeo mediante ffmpeg.

La relevancia del proyecto radica en su enfoque de producto: gestiona vídeos largos mediante una cola que procesa el material en fragmentos de 10 minutos, expone el progreso en tiempo real y no añade marca de agua a la salida. La configuración se realiza mediante variables de entorno (`GROQ_API_KEY` como secreto obligatorio, más `WHISPER_MODEL`, `LLM_MODEL`, `WORKERS` y `KEEP_HOURS`), lo que sugiere que la transcripción se ejecuta con Whisper y la traducción se delega a un LLM servido a través de Groq.

La información pública disponible es muy limitada: el repositorio no declara pipeline, licencia, idiomas soportados ni métricas de rendimiento, y en el momento de la consulta registra 0 descargas y 0 likes. Cualquier evaluación cuantitativa del sistema requiere inspeccionar el código del repositorio, que no forma parte de la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (aplicación Docker con pipeline ASR + traducción; no se especifica la arquitectura de los modelos subyacentes) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | entrada: detección automática de idioma; salida de traducción: portugués |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio se distribuye como aplicación Docker, no como pesos) |

## Arquitectura y entrenamiento

El repositorio describe una aplicación, no un modelo entrenado. El pipeline declarado consta de cuatro etapas: (1) detección de idioma y transcripción con Whisper, con generación de timestamps; (2) traducción al portugués mediante un LLM, con instrucción explícita de mantener el tono; (3) generación de ficheros SRT/VTT sincronizados; y (4) quemado opcional de subtítulos en el vídeo con ffmpeg.

La orquestación incluye una cola para vídeos largos que los divide en partes de 10 minutos y reporta progreso en tiempo real. Las variables `WHISPER_MODEL` y `LLM_MODEL` permiten seleccionar los modelos concretos en tiempo de despliegue, pero la información proporcionada no especifica qué checkpoint de Whisper ni qué LLM se usan por defecto. La presencia de `GROQ_API_KEY` como secreto obligatorio indica que la inferencia del LLM se realiza contra la API de Groq. No se dispone de datos sobre datasets de entrenamiento, número de tokens, RLHF/DPO ni innovaciones técnicas más allá del diseño de la cola por fragmentos.

## Capacidades

- Transcripción de audio a texto con marcas de tiempo mediante Whisper.
- Detección automática del idioma del audio de entrada.
- Traducción al portugués preservando el tono del original.
- Generación de subtítulos en formato SRT y VTT sincronizados.
- Incrustación opcional de subtítulos en el vídeo mediante ffmpeg.
- Procesamiento de vídeos largos en fragmentos de 10 minutos con cola de trabajos.
- Reporte de progreso en tiempo real durante el procesamiento.
- Entrada por URL de vídeo o por subida/pegado de contenido.
- Salida sin marca de agua.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio generativo ni modo de pensamiento.

## Casos de uso

- Subtitulado de contenido audiovisual para audiencias lusohablantes: el pipeline transcribe el audio en el idioma original y traduce al portugués manteniendo el tono, lo que resulta adecuado para canales de YouTube, cursos online o vídeos corporativos que necesitan subtítulos en portugués sin pasar por un editor manual.
- Localización de webinars y formaciones largas: la cola que divide el vídeo en fragmentos de 10 minutos permite procesar sesiones de una o varias horas sin bloquear la aplicación, y el progreso en tiempo real facilita el seguimiento del trabajo.
- Generación de ficheros de accesibilidad: la salida SRT/VTT sincronizada se puede cargar directamente en reproductores y plataformas que exigen subtítulos para cumplir requisitos de accesibilidad.
- Distribución de vídeo con subtítulos incrustados: la opción de quemar los subtítulos con ffmpeg es útil para publicar en redes sociales o plataformas que no admiten pistas de subtítulos externas.
- Archivado y búsqueda de contenido hablado: la transcripción con timestamps sirve como base para indexar o revisar el contenido de un vídeo sin visionarlo completo.
- Prototipado de servicios de subtitulado: al ser una aplicación Docker con variables de entorno para seleccionar modelos, se puede desplegar como servicio interno o como base para un producto de subtitulado gestionado.
- Traducción de material ya transcrito: si se dispone de una transcripción previa, el componente de traducción basado en LLM puede reutilizarse para adaptar el texto al portugués conservando el registro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del checkpoint de Whisper y del LLM seleccionados mediante `WHISPER_MODEL` y `LLM_MODEL`.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: aplicación Docker con SDK `docker` y puerto 7860, pensada para Hugging Face Spaces o cualquier entorno con Docker; requiere `GROQ_API_KEY` como secreto obligatorio para la fase de traducción.
- Latencia y throughput: no disponibles; el diseño procesa vídeos largos en fragmentos de 10 minutos y encola los trabajos, pero no se publican cifras de rendimiento.

## Comparativa con modelos similares

| Sistema | Tipo | Idiomas de salida | Licencia | Despliegue | Contexto |
|---|---|---|---|---|---|
| Subly | Aplicación ASR + traducción | Portugués | no disponible | Docker (puerto 7860) | no disponible |
| Whisper (OpenAI) | Modelo ASR | Transcripción multilingüe | MIT (según la distribución pública de Whisper) | local, múltiples runtimes | no disponible |
| faster-whisper | Implementación optimizada de ASR | Transcripción multilingüe | MIT (según la distribución pública) | local, CTranslate2 | no disponible |
| Modelos de traducción NMT genéricos | Traducción automática | Múltiples | variable según modelo | local o API | no disponible |

La comparación es estructural: Subly no compite como modelo, sino como orquestador de ASR más traducción. No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No se declara licencia en el repositorio, por lo que el uso comercial queda sin marco legal explícito hasta que el autor la publique.
- La información pública es mínima: sin pipeline declarado, sin idiomas documentados, sin métricas y con 0 descargas y 0 likes, lo que impide validar su calidad de forma objetiva.
- La traducción depende de un LLM servido a través de Groq y de una `GROQ_API_KEY` obligatoria; sin esa clave el pipeline de traducción no puede funcionar y se introduce una dependencia de un servicio externo.
- La salida de traducción está limitada al portugués, según la model card; no se documenta soporte para otras lenguas de destino.
- El procesamiento por fragmentos de 10 minutos puede introducir discontinuidades en la sincronización o en la coherencia del tono entre fragmentos, aunque no se documenta cómo se mitiga.
- Riesgo de alucinación y de errores de traducción inherente al uso de un LLM para la fase de traducción; no se publican evaluaciones al respecto.
- No se documentan sesgos conocidos, límites de contexto ni restricciones de idioma más allá de la detección automática de la entrada.
- La transcripción con Whisper puede degradarse en audio con ruido, múltiples hablantes solapados o acentos marcados; no se indica si hay diarización de hablantes.
- Al ser una aplicación Docker, el coste de cómputo y el almacenamiento dependen de la duración del vídeo y de la retención configurada mediante `KEEP_HOURS`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/subly-app/subly
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
