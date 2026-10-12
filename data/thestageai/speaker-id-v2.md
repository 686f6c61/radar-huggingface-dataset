# TheStageAI/speaker-id-v2

## Resumen

TheStageAI/speaker-id-v2 es un paquete de embeddings de hablante (speaker embeddings) exportado a CoreML y distribuido por TheStageAI para su SDK de Apple. No se trata de un modelo de lenguaje, sino de un artefacto de inferencia orientado al reconocimiento de hablante que se integra a traves del `SpeakerIDPipeline` del SDK. El repositorio entrega el binario de inferencia listo para dispositivo (on-device), no el checkpoint de entrenamiento original.

El modelo fuente es PalabraAI/redimnet2, en concreto el checkpoint `b0-vox2-lm.pt` (revision `ffe8f272bfaf6a41efb7814b28d94377b1613ac9`), del que se ha exportado una version CoreML cuyo hash SHA-256 es `4b5a8c00f813ab0d92fc81ea7c504475d8201bed608fb2c6aaba65be723e9c61`. El bundle de la release se publica en la revision `v1.5`, dentro de la ruta `subscription/macos_ios`, y requiere TheStage Apple SDK 1.5.0 o superior. La version anterior del bundle, `TheStageAI/redimnet2`, sigue disponible en `v1.4`.

La relevancia de esta ficha radica en que ilustra el patron de distribucion de artefactos cifrados para inferencia en el ecosistema Apple: un archivo `.thestage` protegido con contrasena que contiene motores CoreML cifrados con el esquema QLPA y ligados al bundle, que el SDK descarga y descifra automaticamente. No se publican parametros, licencia, idiomas ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de embeddings de hablante ReDimNet2 (fuente: PalabraAI/redimnet2, checkpoint `b0-vox2-lm.pt`), exportado a CoreML |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de embeddings de audio, no un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen motores CoreML cifrados con QLPA dentro de un archivo `.thestage`) |
| Idiomas soportados | no disponible (modelo de embeddings de voz, en principio independiente del idioma) |
| Licencia | no disponible |
| Formato de pesos | CoreML (archivo `.thestage` cifrado con QLPA); no se distribuyen pesos crudos en safetensors ni GGUF |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo subyacente es PalabraAI/redimnet2, y que este repositorio distribuye unicamente el artefacto de inferencia para el SDK de Apple derivado del checkpoint `b0-vox2-lm.pt`. La familia ReDimNet corresponde a modelos de embeddings de hablante, pero los detalles concretos de arquitectura, numero de capas, dimension del embedding, datos de entrenamiento, composicion del dataset y uso de tecnicas de ajuste (RLHF, DPO u otras) no estan disponibles en la documentacion proporcionada.

En cuanto al empaquetado tecnico, si se conoce que el bundle de la revision `v1.5` contiene motores CoreML cifrados con QLPA, ligados al bundle y dentro de un archivo `.thestage` protegido con contrasena. El SDK se encarga de descargar y descifrar el paquete de forma automatica, de modo que el desarrollador no manipula directamente los pesos. El proceso de exportacion del checkpoint original a CoreML tampoco se documenta en la informacion disponible.

## Capacidades

- Extraccion de embeddings de hablante para tareas de reconocimiento y verificacion de voz.
- Inferencia en dispositivo (on-device) sobre plataformas Apple, a traves de CoreML.
- Integracion con el `SpeakerIDPipeline` del TheStage Apple SDK 1.5.0 o superior.
- Descarga y descifrado automatico del bundle cifrado por parte del SDK.
- Soporte de tool calling / function calling: no aplicable (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): vision no aplicable; audio inherente al proposito del modelo (procesamiento de voz). Detalles adicionales no disponibles.

## Casos de uso

- Verificacion de identidad por voz: el modelo genera un embedding del hablante que puede compararse con un embedding de referencia almacenado localmente para autenticar al usuario sin enviar audio a un servidor, aprovechando la inferencia on-device en CoreML.
- Diarizacion de hablantes en transcripciones: en una app de reuniones o notas de voz para iOS/macOS, los embeddings permiten etiquetar quien habla en cada segmento y agrupar intervenciones del mismo interlocutor.
- Personalizacion de asistentes de voz: al identificar al hablante activo, un asistente puede cargar un perfil de usuario concreto (idioma, preferencias, historial) antes de responder.
- Deteccion de hablante en dispositivos sin conexion: escenarios de campo o con requisitos de privacidad donde el audio no puede salir del dispositivo y todo el reconocimiento debe ejecutarse en local mediante el Neural Engine.
- Control de acceso fisico por voz: integracion en apps de cerraduras o paneles que verifiquen la identidad del usuario comparando el embedding captado con el registrado.
- Segmentacion previa a la transcripcion automatica: usar el embedding para separar locutores antes de pasar cada segmento a un motor ASR, mejorando la calidad de los subtitulos o actas.
- Indexado y busqueda de archivos de audio: asociar embeddings a grabaciones para recuperar despues fragmentos pronunciados por una persona concreta dentro de un archivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un artefacto CoreML on-device, el destino son dispositivos Apple (iPhone, iPad y Mac) con soporte de CoreML y, cuando este disponible, aceleracion por Neural Engine.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no aplicable en el sentido habitual; el despliegue se orienta a hardware Apple integrado (CPU, GPU y Neural Engine del SoC).
- Compatibilidad con GPU de consumo tipo RTX 4090, A100 o H100: no aplicable, ya que el artefacto esta empaquetado para CoreML y no como pesos exportables a esos backends.
- Opciones de despliegue: TheStage Apple SDK 1.5.0 o superior mediante `SpeakerIDPipeline`; no se documentan opciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TheStageAI/speaker-id-v2 | Embeddings de hablante (ReDimNet2, CoreML) | no disponible | no aplicable | no disponible | no disponible | CoreML cifrado via TheStage Apple SDK |
| PalabraAI/redimnet2 | Embeddings de hablante (modelo fuente) | no disponible | no aplicable | no disponible | no disponible | Repositorio de origen en GitHub |
| TheStageAI/redimnet2 | Embeddings de hablante (bundle SDK previo, `v1.4`) | no disponible | no aplicable | no disponible | no disponible | CoreML via TheStage Apple SDK |

No se dispone de datos suficientes para comparar parametros, contexto, rendimiento o licencia con alternativas como ECAPA-TDNN o x-vector.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no aplicable en el sentido de generacion de texto; el modelo produce embeddings y su principal riesgo es la confusion entre hablantes o la degradacion ante ruido, extremo que no puede cuantificarse con la informacion disponible.
- Limitaciones de contexto o idioma: no disponible; al ser un modelo de embeddings de voz, el rendimiento puede variar segun el idioma, el canal y las condiciones acusticas, pero no se aportan datos.
- Restricciones de licencia para uso comercial: la licencia no esta indicada en la informacion disponible, por lo que debe verificarse antes de cualquier uso en produccion.
- El repositorio distribuye un artefacto de inferencia cifrado y ligado al bundle, no los pesos originales; esto limita la inspeccion, la modificacion y la reutilizacion fuera del SDK de TheStage.
- El bundle requiere TheStage Apple SDK 1.5.0 o superior y esta atado a las plataformas Apple (ruta `subscription/macos_ios`), lo que restringe su uso a ese ecosistema.
- El repositorio aparece con 0 descargas y 0 likes, sin pipeline definido y con un tamano de repo de 0.0 GB, lo que sugiere un artefacto recien publicado y con poca validacion publica.
- La dependencia de un archivo `.thestage` protegido con contrasena y cifrado con QLPA implica que el acceso al modelo queda condicionado a la gestion de claves y a la disponibilidad del SDK.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/TheStageAI/speaker-id-v2
- Revision del bundle `v1.5`: https://huggingface.co/TheStageAI/speaker-id-v2/tree/v1.5/subscription/macos_ios
- Modelo fuente (GitHub): https://github.com/PalabraAI/redimnet2
- Bundle SDK previo: https://huggingface.co/TheStageAI/redimnet2
