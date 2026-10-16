# volantis-labs/nemotron-3-diarization-coreml

## Resumen

Este repositorio es un espejo (mirror) fijado de los ficheros que la aplicacion Moxie descarga para la deteccion de cambios de hablante en directo sobre Apple silicon. No es un entrenamiento propio: empaqueta el modelo NVIDIA Nemotron 3 Diarization, un sistema de diarizacion de hablantes en streaming de tipo Sortformer con soporte para hasta 8 hablantes, convertido a Core ML por FluidInference y redistribuido aqui por volantis-labs.

La relevancia practica es acotada pero clara: permite ejecutar diarizacion de hablantes en tiempo real de forma local en equipos Mac con chip de la serie M, sin depender de GPU NVIDIA ni de servicios en la nube. El artefacto incluido corresponde al preset `low`, con una latencia declarada de 1,04 s, lo que lo orienta a deteccion de cambios de turno en vivo mas que a diarizacion offline de alta precision.

El repositorio ocupa 0,2 GB y contiene un `.mlmodelc` monolítico junto con los assets raiz que carga FluidAudio. Se publica bajo licencia OpenMDW-1.1, la misma que el modelo upstream, y en el momento de redactar esta ficha no registra descargas ni interacciones, por lo que debe tratarse como un artefacto de conveniencia sin validacion externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sortformer (diarizacion de hablantes en streaming); detalles de capas, atencion y encoder no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible; el artefacto se define por presets de latencia, no por ventana de contexto |
| Tipos de cuantizacion | no disponible; se distribuye un artefacto Core ML compilado (`.mlmodelc`), no pesos cuantizados en GGUF o safetensors |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | Core ML (`monolithic/v2/Nemotron3Diarizer_low.mlmodelc`) mas assets binarios (`learnable_sil_emb.bin`, `pre_encode_proj_t.bin`) y `config.json` |
| Tarea declarada | voice-activity-detection / speaker-diarization (streaming) |
| Autor del repositorio | volantis-labs (mirror, no autor del modelo) |
| Modelo base | nvidia/Nemotron-3-Diarization |
| Conversion Core ML origen | FluidInference/nemotron-3-diarization-coreml, revision `25a90f97f254428d4b30374b76af9c74fdee8327` |
| Numero de hablantes | hasta 8 en streaming |
| Tamano del repositorio | 0,2 GB |
| Libreria de carga | fluidaudio |

## Arquitectura y entrenamiento

La informacion disponible identifica la arquitectura como Sortformer, dentro de la familia de modelos de diarizacion de hablantes de NVIDIA para streaming, y confirma el soporte de hasta 8 hablantes simultaneos. Sortformer es un enfoque de diarizacion basado en transformer que resuelve la asignacion de hablantes mediante un mecanismo de ordenacion ("sort") sobre las representaciones temporales, lo que evita el clustering posterior tipico de los pipelines de diarizacion tradicionales y habilita el procesamiento incremental. No obstante, la model card de este repositorio no incluye detalles de numero de capas, dimension del modelo, regimen de atencion ni estrategia de entrenamiento, por lo que estos extremos quedan como no disponibles.

Tampoco se proporcionan datos sobre el corpus de entrenamiento del modelo upstream: no se indica numero de tokens, horas de audio, composicion del dataset, ni si se aplicaron etapas de ajuste fino con RLHF, DPO u otras tecnicas. La model card conserva el README original como `UPSTREAM_README.md`, que es donde habria que consultar esos datos si el autor upstream los publica. La unica intervencion tecnica documentada en este repositorio es la conversion a Core ML mediante coremltools y el empaquetado de los assets auxiliares (`learnable_sil_emb.bin` para el embedding de silencio y `pre_encode_proj_t.bin` para la proyeccion de pre-encoder), manteniendo el mismo layout que el repositorio de FluidInference para que la clase `Nemotron3Models` de FluidAudio pueda cargarlo desde un directorio local.

## Capacidades

- Diarizacion de hablantes en streaming, con deteccion de cambios de hablante en tiempo real y hasta 8 hablantes.
- Deteccion de actividad de voz (VAD), segun la etiqueta de pipeline declarada (`voice-activity-detection`).
- Etiquetado de segmentos por hablante sobre audio continuo, orientado a alimentar pipelines de transcripcion con atribucion de turno.
- Ejecucion local en Apple silicon mediante Core ML, sin envio de audio a servicios externos.
- Carga desde directorio local a traves de FluidAudio (`Nemotron3Models`), con `config.json` y assets auxiliares incluidos.
- Capacidades multilingues: no disponibles; la diarizacion no depende del idioma del contenido, pero no se declara soporte ni evaluacion por idioma.
- Tool calling / function calling: no disponible, no es una capacidad propia de este tipo de modelo.
- Razonamiento multi-paso, generacion de texto, codigo, matematicas o vision: no aplica, es un modelo de audio especializado.
- Modo "thinking" o variantes de razonamiento extendido: no aplica.

## Casos de uso

- Transcripcion de reuniones en local sobre Mac: el modelo etiqueta cada turno con su hablante y permite generar actas con atribucion correcta sin subir el audio a la nube, algo critico en entornos con datos confidenciales.
- Subtitulado y accesibilidad en directo: con una latencia de preset de 1,04 s, el flujo de salida puede alimentar subtitulos que indiquen quien habla en eventos, clases o retransmisiones.
- Analisis de calidad en centros de contacto: segmentar llamadas por agente y cliente para medir tiempos de habla, interrupciones y solapamientos, integrable en herramientas de QA que corran en portatiles Apple.
- Asistentes de voz y agentes conversacionales: deteccion de turno de palabra para decidir cuando el agente debe responder, reduciendo interrupciones cuando varias personas hablan cerca del microfono.
- Investigacion cualitativa y ciencias sociales: diarizacion de entrevistas grupales o grupos focales en el propio equipo del investigador, sin depender de APIs externas para material sujeto a confidencialidad.
- Postproduccion de podcasts y contenido de audio: separar pistas por hablante antes de la edicion, generar marcas de capitulo por intervencion y automatizar la rotacion de voces en la mezcla.
- Moderacion y monitorizacion de audio en vivo: detectar cuantos interlocutores distintos hay en un flujo y marcar cambios anormales de turno en sistemas de supervision.
- Pipelines de transcripcion propios: combinado con un ASR local, este modelo aporta la capa de "quien dijo que" que los transcriptores puros no generan, y encaja en un stack 100 % on-device en Apple silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del mirror no incluye metricas de DER (Diarization Error Rate), tasa de falsos positivos de VAD, ni comparaciones con otros sistemas, y la busqueda web realizada no devolvio ningun resultado tecnico relacionado con el modelo, unicamente paginas sin relacion (articulos sobre la ciudad ficticia de Volantis). Los unicos datos de rendimiento declarados son la latencia del preset utilizado, 1,04 s, y el tamano del repositorio, 0,2 GB.

## Requisitos de hardware

- Plataforma objetivo: Apple silicon (Core ML). El modelo esta pensado para ejecutarse en chips de la serie M; no se declara soporte para CPU x86 ni para CUDA.
- VRAM: no disponible. Al operar sobre memoria unificada, la huella depende del preset y del runtime; el repositorio completo ocupa 0,2 GB, lo que da una cota superior orientativa del peso de los artefactos en disco.
- GPU recomendadas: no disponibles. La ejecucion puede repartirse entre CPU, GPU y Neural Engine segun la politica que aplique FluidAudio, pero no se documenta la asignacion.
- Compatibilidad con GPU de consumo: no aplica en el sentido habitual; no hay soporte declarado para RTX 4090, A100, H100 ni similares, ya que el artefacto es Core ML y no safetensors o GGUF.
- Opciones de despliegue: FluidAudio como runtime principal, cargando `Nemotron3Models` desde un directorio local. vLLM, llama.cpp, Ollama y TGI no son aplicables a un `.mlmodelc`.
- Latencia: 1,04 s en el preset `low` incluido. El repositorio no incluye los presets de mayor latencia que podrian ofrecer mas precision.
- Throughput y consumo de memoria en ejecucion: no disponibles.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto / latencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| volantis-labs/nemotron-3-diarization-coreml | Este repositorio | no disponible | preset `low`, 1,04 s de latencia | OpenMDW-1.1 | HuggingFace, 0 descargas |
| FluidInference/nemotron-3-diarization-coreml | Conversion Core ML de origen, mismo layout | no disponible | incluye varios presets de latencia segun la descripcion del mirror | no disponible | HuggingFace |
| nvidia/Nemotron-3-Diarization | Modelo upstream, Sortformer de 8 hablantes en streaming | no disponible | no disponible | OpenMDW-1.1 segun la model card del mirror | HuggingFace |

No se dispone de datos de parametros, contexto, rendimiento ni licencia de alternativas de terceros (por ejemplo, otros sistemas de diarizacion como pyannote o los Sortformer previos de NVIDIA) en la informacion proporcionada, por lo que no se incluye una comparacion numerica.

## Limitaciones y advertencias

- Es un mirror, no el modelo original: el autor del repositorio es volantis-labs, no NVIDIA, y el contenido se declara copiado sin cambios desde FluidInference. La trazabilidad depende de que esas afirmaciones sean correctas.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Solo se incluye el preset `low`. Si se necesita mas precision, hay que acudir al repositorio de FluidInference para obtener los presets de mayor latencia.
- Limite de 8 hablantes en streaming. Escenarios con mas interlocutores simultaneos no estan cubiertos.
- Dependencia de plataforma: al ser Core ML, no se puede desplegar directamente en servidores Linux con GPU NVIDIA sin una conversion adicional.
- Riesgos propios de la diarizacion: confusion o fusion de hablantes con voces similares, errores en tramos de voz solapada, falsos positivos de actividad de voz en ruido de fondo y cortes incorrectos en transiciones rapidas de turno. El preset de baja latencia tiende a priorizar la respuesta inmediata sobre la precision.
- Sesgos no evaluados: no hay informacion sobre comportamiento diferencial por acento, genero, edad, idioma o calidad de captura. La ausencia de benchmarks publicos impide cuantificar cualquier disparidad.
- Idiomas: no declarados. No se puede asumir un rendimiento homogeneo entre lenguas.
- Licencia: OpenMDW-1.1, tanto en este mirror como en el modelo upstream. No se detallan en la informacion proporcionada los terminos concretos de uso comercial, atribucion o redistribucion, por lo que conviene revisar el texto completo de la licencia antes de integrarlo en un producto.
- El README del modelo upstream se conserva como `UPSTREAM_README.md` dentro del repositorio; cualquier dato tecnico ausente en esta ficha deberia verificarse ahi o en la model card de NVIDIA.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/volantis-labs/nemotron-3-diarization-coreml
- Modelo upstream: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Conversion Core ML de origen: https://huggingface.co/FluidInference/nemotron-3-diarization-coreml
- Libreria de carga declarada: fluidaudio (`library_name`), sin URL disponible en la informacion proporcionada
- Papers, blogs, repositorios de codigo y demos adicionales: no disponibles; la busqueda web no devolvio resultados tecnicos relacionados con el modelo
