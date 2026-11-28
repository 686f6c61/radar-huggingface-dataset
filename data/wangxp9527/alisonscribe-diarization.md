# wangxp9527/alisonscribe-diarization

## Resumen

AlisonScribe speaker diarization (Core ML) es un paquete de artefactos de diarización de hablantes empaquetados en formato Core ML, publicado por el usuario wangxp9527 bajo el identificador `wangxp9527/alisonscribe-diarization`. No se trata de un modelo entrenado desde cero, sino de un espejo (mirror) byte a byte de los ficheros de `FluidInference/speaker-diarization-coreml`, que a su vez son conversiones a Core ML del pipeline `pyannote/speaker-diarization-community-1`. Su propósito es servir como descarga fija y verificable para la aplicación AlisonScribe, que lo utiliza para separar hablantes en transcripciones de idiomas distintos del chino, ejecutándose en el dispositivo mediante FluidAudio sin subir audio a ningún servidor.

El repositorio contiene un único conjunto de ficheros de 21 MB dentro de `v1/speaker-diarization/`: los componentes `Segmentation`, `FBank`, `Embedding`, `PldaRho`, `plda-parameters.json`, `xvector-transform.json` y `config.json`. El autor declara que las copias coinciden con los valores SHA-256 del repositorio upstream y que la revisión está fijada en `7eab74f3463c736418d0eb10296261ae581146c9`, de modo que la versión no cambia aunque el upstream se actualice.

La relevancia de esta ficha es acotada: no es un modelo de lenguaje ni un sistema de diarización nuevo, sino un contenedor de pesos y parámetros para inferencia local en el ecosistema Apple. La licencia es CC BY 4.0, heredada del trabajo original de Fluid Inference, pyannote y BUT Speech@FIT, y el autor no introduce modificaciones adicionales sobre las conversiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de diarizacion: segmentacion neuronal (Powerset multi-class cross entropy), extraccion de embeddings de hablante (WeSpeaker) y clustering VBx con parametros PLDA; empaquetado en Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio, no texto; la ventana depende de la configuracion de segmentacion) |
| Tipos de cuantizacion | no disponible (artefactos Core ML; no se documentan variantes de cuantizacion) |
| Idiomas soportados | no disponibles (la model card indica que la app lo usa para idiomas distintos del chino, sin enumerarlos) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML (ficheros `Segmentation`, `FBank`, `Embedding`, `PldaRho`, `plda-parameters.json`, `xvector-transform.json`, `config.json`) |

## Arquitectura y entrenamiento

El sistema es una cadena de diarización clásica modular, no un transformer monolítico. La segmentación de hablante sigue el enfoque de Powerset multi-class cross entropy descrito por Plaquet y Bredin (INTERSPEECH 2023), que formula la detección de cambios de turno como una clasificación multiclase sobre combinaciones de hablantes. Sobre los segmentos resultantes se extraen embeddings de hablante con WeSpeaker (Wang et al., ICASSP 2023), y el agrupamiento final se realiza con clustering VBx, el método bayesiano de HMM sobre secuencias de x-vectors descrito por Landini et al. (Computer Speech & Language, 2022), usando parámetros PLDA proporcionados por Brno University of Technology / BUT Speech@FIT.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo ajuste fino adicional: el repositorio es una conversión y espejo de pesos ya entrenados por terceros. La innovación técnica relevante no está en el entrenamiento, sino en el empaquetado: conversión a Core ML para ejecución en dispositivo vía FluidAudio, con ficheros verificados por SHA-256 y revisión fijada para garantizar reproducibilidad en la app que los consume.

## Capacidades

- Diarización de hablantes offline: identifica y separa quién habla en cada tramo de una grabación de audio.
- Segmentación de cambios de turno mediante el componente `Segmentation`.
- Extracción de características espectrales con `FBank`.
- Cálculo de embeddings de hablante con `Embedding` y transformación x-vector asociada.
- Agrupamiento de hablantes con parámetros PLDA (`PldaRho`, `plda-parameters.json`).
- Ejecución local en dispositivo mediante FluidAudio, sin subida de audio a servidores.
- Uso previsto en transcripciones multilingües (idiomas distintos del chino) según la model card.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes.

## Casos de uso

- Transcripción con etiquetado de hablantes en la app AlisonScribe: el paquete se descarga y ejecuta con FluidAudio para asignar cada fragmento de transcripción a un hablante, en idiomas distintos del chino, manteniendo el audio en el dispositivo.
- Actas de reuniones y entrevistas: separar intervenciones de varios participantes en grabaciones locales para producir transcripciones legibles por hablante sin depender de servicios en la nube.
- Investigación cualitativa con entrevistas: procesar audio de campo en un portátil Apple, etiquetando entrevistador y entrevistado sin exponer material sensible a terceros.
- Subtitulado y postproducción de pódcast: generar marcas de cambio de hablante que se integren en herramientas de edición para revisar turnos de conversación.
- Cumplimiento y privacidad: despliegues en entornos donde el audio no puede salir del dispositivo, aprovechando que la inferencia es local vía Core ML.
- Fijación de versiones en pipelines internos: al estar el repositorio espejado con revisión fija y verificación SHA-256, sirve como dependencia reproducible en builds de aplicaciones que necesitan un artefacto estable.
- Distribución redundante: al mirror en Hugging Face y ModelScope permite a la app descargar desde la fuente accesible en cada red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en dispositivo mediante Core ML y FluidAudio; el repositorio no documenta requisitos mínimos de hardware.
- Tamaño de artefactos: 21 MB en `v1/speaker-diarization/`, lo que permite almacenarlos en dispositivos con poco espacio.
- No se especifican GPU, NPU ni modelos de Apple compatibles; Core ML puede ejecutar en CPU, GPU o Neural Engine según la configuración del runtime, pero el autor no detalla ninguna de estas rutas.
- No se documentan opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI no aplican a este formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Notas |
|---|---|---|---|---|
| wangxp9527/alisonscribe-diarization | Espejo de pipeline de diarizacion | Core ML | CC BY 4.0 | Copia byte a byte de FluidInference, revision fijada |
| FluidInference/speaker-diarization-coreml | Pipeline de diarizacion original | Core ML | CC BY 4.0 (segun la model card del espejo) | Fuente upstream de la que se copian los ficheros |
| pyannote/speaker-diarization-community-1 | Pipeline de diarizacion | no disponible | no disponible en la informacion proporcionada | Base original convertida a Core ML por Fluid Inference |

No se dispone de datos de parámetros, contexto ni rendimiento de estas alternativas en la información proporcionada, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo original: es un espejo de terceros, por lo que cualquier limitación del pipeline pyannote/FluidInference se hereda sin cambios.
- La model card no documenta sesgos conocidos, tasas de error ni comportamiento por idioma; solo indica el uso para idiomas distintos del chino.
- Riesgo de atribución errónea de hablantes en solapamientos, ruido o voces similares, inherente a los sistemas de diarización; no se cuantifica en la información disponible.
- No se especifican límites de duración de audio, número máximo de hablantes ni requisitos de calidad de muestra.
- La licencia CC BY 4.0 exige atribución a Fluid Inference, pyannote y BUT Speech@FIT; el autor remite a `LICENSE` y a `NOTICE.md` para el alcance exacto, que no se detalla en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB reportado por la plataforma frente a los 21 MB declarados en la model card; conviene verificar los ficheros antes de usarlo en producción.
- Depende del runtime FluidAudio y del ecosistema Core ML; no es portable a otros stacks de inferencia sin conversión adicional.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wangxp9527/alisonscribe-diarization
- Modelo base (Core ML): https://huggingface.co/FluidInference/speaker-diarization-coreml
- Pipeline original de pyannote: https://huggingface.co/pyannote/speaker-diarization-community-1
- Runtime FluidAudio: https://github.com/FluidInference/FluidAudio
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Referencia de segmentación (Plaquet y Bredin, INTERSPEECH 2023): no disponible como enlace en la información proporcionada
- Referencia de embeddings WeSpeaker (Wang et al., ICASSP 2023): no disponible como enlace en la información proporcionada
- Referencia de clustering VBx (Landini et al., 2022): no disponible como enlace en la información proporcionada
- DiarizationLM (resultado de búsqueda web, contexto general de post-procesado con LLM): http://go/v1/AaC_CGMUvYMbawqaLAF48kBA1Sj-MR_9kIppFwvagbmWI3GwPtlCIUxHWG1lHjn9eOs3QOyuempd21CJB8g4U2kjeQ0c0qESH_u3yaFgcfBN4Lbu68b5JeB2cB4tMiQ8uI8Qo4vSUHSgiadAAnmQIwuTaYFcj9MMVz_7krlqcHlrjjpg6z0naPZ_iuHYx7TSSy5uOMZWAw
