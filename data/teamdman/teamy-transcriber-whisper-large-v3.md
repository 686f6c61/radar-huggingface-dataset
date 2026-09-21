# TeamDman/teamy-transcriber-whisper-large-v3

## Resumen

TeamDman/teamy-transcriber-whisper-large-v3 es un paquete de pesos listo para usar, publicado por el desarrollador TeamDman, que empaqueta el checkpoint canonico de openai/whisper-large-v3 (revision 06f233fe06e710322aca913c1bc4249a0d71fce1) junto con metadatos derivados y tensores de deteccion de voz Silero a 16 kHz. No es un modelo nuevo ni un fine-tuning: los pesos de Whisper son los originales, sin reentrenar ni cuantizar, y ocupan 3.087.130.976 bytes (unos 3,09 GB decimales).

El paquete existe para alimentar el runtime nativo en Rust y CUDA de la aplicacion Teamy Transcriber. El repositorio no contiene codigo de inferencia, grafo TorchScript, modulo Python ni grabaciones de audio; la computacion vive en el codigo fuente de la aplicacion, que expone los comandos `transcribe` y seleccion local de modelo. Esto lo convierte en una dependencia de datos para una CLI de transcripcion de voz, no en un modelo desplegable con las herramientas habituales del ecosistema HuggingFace.

Su relevancia es acotada y muy especifica: ofrece transcripcion en ingles con marca de tiempo por clip y deteccion de voz opcional, sobre GPU NVIDIA con CUDA. El modelo tiene 1.543.490.560 parametros (1,54 B) y la validacion oficial se hizo en Windows x64 con una RTX 4090. El paquete no publica ningun resultado de evaluacion propio ni endpoint de inferencia alojado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de la familia Whisper (large-v3); el paquete no redefine arquitectura, solo distribuye pesos y metadatos |
| Parametros totales | 1.543.490.560 (1,54 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 30 s de audio por ventana (caracteristica de la arquitectura Whisper large-v3; el paquete no documenta un valor propio) |
| Tipos de cuantizacion | no disponible; el paquete distribuye los pesos originales sin cuantizar y la aplicacion los expande a FP32 en VRAM |
| Idiomas soportados | en (el paquete declara unicamente ingles; la app actual no expone soporte multilingue ni traduccion) |
| Licencia | Apache-2.0 (checkpoint upstream y metadatos anadidos); incluye LICENSE-OPENAI-MIT.txt y Silero VAD bajo MIT |
| Formato de pesos | safetensors (mas config, tokenizer, dims.json, vad/ y model-manifest.json con checksums SHA-256) |

Otros datos del paquete: tamano del repositorio 3,1 GB; revisiones publicadas con etiqueta `v1`; 0 descargas y 0 likes en el momento de la consulta; fecha de creacion y ultima actualizacion 2026-09-20.

## Arquitectura y entrenamiento

Los pesos corresponden a Whisper large-v3, un modelo encoder-decoder de tipo transformer para reconocimiento automatico del habla que trabaja sobre ventanas de audio de 30 segundos. El paquete conserva el checkpoint canonico, el config, el tokenizer y la politica de generacion greedy originales de openai/whisper-large-v3, sin modificaciones en los tensores. No hay entrenamiento nuevo, no hay destilado, no hay cuantizacion y no se aplica RLHF ni DPO: es una redistribucion de pesos ya entrenados.

Lo que anade el repositorio es infraestructura auxiliar: `dims.json` con metadatos de dimensiones que consume Teamy Transcriber, una carpeta `vad/` con tensores preparados del detector de voz Silero a 16 kHz (esquema, manifiesto de checksum y licencia MIT original), y `model-manifest.json` con tamanos de cada activo, checksums SHA-256 y procedencia. La deteccion de voz se ejecuta como codigo de CPU definido en el origen de la aplicacion. No se describe ninguna innovacion de atencion, decodificacion especulativa ni tecnica de eficiencia adicional: la inferencia y sus optimizaciones pertenecen al binario Rust/CUDA de Teamy Transcriber, no a este repositorio. Un detalle operativo relevante es que la aplicacion expande los pesos a FP32 en la GPU, por lo que el consumo de VRAM supera el tamano del archivo descargado.

## Capacidades

- Transcripcion de voz a texto en ingles con decodificacion greedy, validada como caso de uso principal.
- Marcas de tiempo por clip de audio.
- Deteccion de voz (VAD) opcional basada en Silero a 16 kHz, que evita procesar entradas silenciosas.
- Seleccion local de modelo mediante los comandos `model prepare` y `transcribe` de la CLI nativa.
- Validacion declarada en Windows x64 sobre RTX 4090 con CUDA.
- Sin soporte de tool calling ni de function calling: no hay ninguna referencia a ello en el paquete ni en su model card.
- Sin capacidades de agente, razonamiento multi-paso, vision, audio generativo ni modo de pensamiento.
- Sin alineacion a nivel de palabra, sin diarizacion de hablantes, sin beam search y sin traduccion en la version actual de la aplicacion.
- Sin soporte multilingue expuesto por la aplicacion, pese a que el checkpoint base de Whisper large-v3 es multilingue.
- Sin endpoint de inferencia alojado.

## Casos de uso

- Transcripcion de reuniones en local con GPU NVIDIA: la CLI procesa el audio en la propia maquina sin enviar datos a servicios externos, lo que encaja en organizaciones con requisitos estrictos de confidencialidad. El VAD incluido evita gastar computo en silencios.
- Subtitulado de videos y streams: las marcas de tiempo por clip permiten generar subtitulos alineados de forma aproximada por fragmento, suficiente para publicacion rapida o revision manual posterior.
- Actas y notas de voz en equipos de desarrollo: grabaciones cortas en ingles se transcriben a texto plano para pegarlas en un issue, una wiki o un documento de reunion.
- Preprocesado de corpus de voz para investigacion: el paquete se puede usar como paso de transcripcion por lotes dentro de un pipeline propio, siempre que el audio este en ingles y se disponga de CUDA.
- Indexacion y busqueda de archivos de audio archivados: convertir grabaciones a texto permite busquedas por palabra clave en repositorios de audio que antes solo eran consultables por nombre de archivo.
- Entornos aislados o air-gapped: al no depender de un endpoint alojado y descargarse el snapshot una sola vez con `hf download`, es viable en maquinas sin salida a internet una vez preparado el modelo.
- Documentacion automatica de sesiones tecnicas: transcripcion de charlas o revisiones de codigo grabadas en ingles para generar borradores de notas tecnicas que despues se editan a mano.
- Automatizacion de flujos internos en Windows: al ser una CLI, se puede invocar desde scripts de PowerShell y encadenar con otras herramientas del equipo, con la salvedad de que requiere GPU NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el paquete no anade ninguna afirmacion nueva de entrenamiento ni de evaluacion sobre el modelo subyacente, y remite a la model card de openai/whisper-large-v3 para informacion de entrenamiento, uso previsto y limitaciones. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan unos 3,09 GB en safetensors, pero la aplicacion los expande a FP32 en la GPU, lo que situa el peso del modelo en el entorno de 6,2 GB; sumando activaciones, buffers de atencion y el detector de voz, se recomienda una GPU con al menos 10-12 GB de VRAM (estimacion derivada de los datos del paquete, no confirmada por el autor).
- GPU recomendadas: la validacion oficial se realizo en una RTX 4090 (24 GB). Cualquier GPU NVIDIA con soporte CUDA y VRAM suficiente deberia poder ejecutarlo, aunque no hay una lista oficial de hardware soportado.
- Requisito obligatorio: GPU NVIDIA y bibliotecas de runtime CUDA. No hay soporte de CPU para Whisper en la aplicacion actual.
- Cabe en GPU de consumo: si, previsiblemente en modelos con 12 GB o mas de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090), siempre que se cumplan los requisitos de CUDA. No hay confirmacion oficial mas alla de la RTX 4090.
- Opciones de despliegue: unicamente el binario nativo de Teamy Transcriber con su runtime Rust/CUDA. No hay soporte para vLLM, llama.cpp, Ollama, TGI ni transformers, ya que el repositorio no incluye codigo de inferencia ni pesos en GGUF.
- Preparacion del modelo: descarga del snapshot con `hf download TeamDman/teamy-transcriber-whisper-large-v3 --revision v1 --quiet` y posterior `teamy-transcriber model prepare`. El snapshot debe mantenerse en la cache local; la variable de entorno `TEAMY_TRANSCRIBER_MODEL_DIR` permite forzar una ruta.
- Latencia y throughput: no disponible. No se publican mediciones de velocidad ni de tiempo real factor (RTF).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Enfoque de despliegue |
|---|---|---|---|---|---|
| TeamDman/teamy-transcriber-whisper-large-v3 | 1,54 B | en (segun el paquete) | Apache-2.0 | safetensors + VAD Silero | CLI nativa Rust/CUDA, solo NVIDIA |
| openai/whisper-large-v3 (modelo base) | 1,54 B (mismos pesos) | multilingue segun el modelo original | Apache-2.0 | safetensors | Ecosistema HuggingFace, transformers y derivados |
| Alternativas de la misma categoria (distil-whisper, faster-whisper) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con modelos de terceros no puede completarse con la informacion proporcionada: la busqueda web no devolvio resultados utiles y el paquete no incluye datos comparativos. La diferencia funcional verificable frente al checkpoint original es el empaquetado (metadatos de dimensiones, VAD preparado, manifiesto con checksums) y la integracion con la CLI de Teamy Transcriber, no el rendimiento del modelo.

## Limitaciones y advertencias

- Solo ingles: el paquete declara `en` como unico idioma y la aplicacion no expone soporte multilingue ni traduccion, aunque el checkpoint base si sea multilingue.
- Requiere GPU NVIDIA con CUDA: no hay soporte de CPU para Whisper en la version actual, lo que excluye equipos sin GPU compatible.
- Sin funcionalidades avanzadas de decodificacion: no hay beam search, alineacion a nivel de palabra ni diarizacion de hablantes en la aplicacion actual.
- Riesgo de alucinacion: la propia model card advierte de que Whisper puede generar texto incorrecto o inventado, especialmente con entradas ruidosas o silenciosas. El VAD reduce el procesado de silencio, pero no garantiza la precision.
- Dependencia de la cache local: si se elimina el snapshot descargado, hay que volver a descargarlo y seleccionarlo; no se copia ni se recodifica.
- Compatibilidad de version: se debe usar la compilacion nativa reciente de Teamy Transcriber, ya que compilaciones anteriores de la aplicacion pueden no soportar los comandos `transcribe` y seleccion de modelo.
- Sin endpoint alojado ni codigo de inferencia en el repositorio: integrarlo en un stack Python o en un servidor de inferencia convencional requiere trabajo adicional no incluido.
- Licencias mezcladas: el checkpoint upstream y los metadatos anadidos son Apache-2.0, el aviso MIT original de OpenAI Whisper se conserva aparte y el VAD de Silero es MIT. Conviene revisar cada archivo antes de redistribuir.
- Adopcion nula verificable: 0 descargas y 0 likes en el momento de la consulta, sin senales publicas de validacion por parte de terceros.
- Fechas del repositorio: creado y actualizado el 2026-09-20, sin historial de mantenimiento posterior en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TeamDman/teamy-transcriber-whisper-large-v3
- Repositorio de la aplicacion (runtime Rust/CUDA): https://github.com/TeamDman/teamy-transcriber
- Modelo base en HuggingFace: https://huggingface.co/openai/whisper-large-v3
- Model card upstream (revision 06f233fe06e710322aca913c1bc4249a0d71fce1): https://huggingface.co/openai/whisper-large-v3/blob/06f233fe06e710322aca913c1bc4249a0d71fce1/README.md
- Silero VAD: no disponible en los resultados de busqueda proporcionados
- Paper o blog tecnico especifico de este paquete: no disponible
- Demo o endpoint alojado: no disponible
- Nota: la busqueda web realizada devolvio unicamente resultados no relacionados con el modelo (sitios de efemerides historicas), por lo que no se han podido incorporar enlaces adicionales relevantes.
