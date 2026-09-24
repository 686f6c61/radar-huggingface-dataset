# tari-tech/asr-voice-recognition-models

## Resumen

Este repositorio no es un modelo entrenado por su autor, sino un paquete de artefactos de reconocimiento automatico del habla (ASR) publicado por el usuario `tari-tech` como espejo byte a byte de varios repositorios de ModelScope. Su proposito es permitir que un servicio de transcripcion con diarizacion de hablantes basado en Ascend 910B y TorchAir arranque sin depender de la red, descargando en una sola operacion todos los ficheros que necesita.

El paquete agrupa cuatro componentes: el checkpoint `large-v3.pt` de Whisper (3,09 GB), un modelo VAD FSMN (`speech_fsmn_vad_zh-cn-16k-common-pytorch`, 4 MB), un modelo de verificacion de hablante CAM++ (`speech_campplus_sv_zh-cn_16k-common`, 29 MB) y el modulo de diarizacion por segmentacion y clustering de CAM++ (347 MB). El total del repositorio es de aproximadamente 3,47 GB, distribuido en formato PyTorch (`.pt`) y ONNX.

Su relevancia es operativa, no cientifica: fija versiones concretas de dependencias (`@master`, `@v2.0.4`, `@v1.0.0`) y garantiza la reproducibilidad del arranque de un contenedor. El propio README advierte que la ausencia de `whisper-torchair/large-v3.pt` provoca un fallo inmediato del servicio (`FileNotFoundError`), porque no hay carga perezosa. No incluye benchmarks, no documenta parametros y no ha recibido descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paquete heterogeneo: encoder-decoder transformer (Whisper large-v3), FSMN VAD, red de embeddings de hablante CAM++ y modulo de diarizacion segmentacion-clustering. No es una arquitectura unica. |
| Parametros totales | No disponible. El README solo indica tamanos de fichero por componente. |
| Parametros activos | No aplica: el paquete no contiene modelos MoE. |
| Longitud de contexto | No documentado en el repositorio. Whisper large-v3 procesa ventanas de audio de 30 s por pasada; los componentes VAD y diarizacion trabajan sobre flujos de audio segmentados. |
| Tipos de cuantizacion | No disponibles. El repositorio contiene los checkpoints originales sin convertir. |
| Idiomas soportados | No disponibles en los metadatos. El componente Whisper large-v3 es multilingue; los componentes VAD, verificacion de hablante y diarizacion llevan el sufijo `zh-cn` en su nombre, lo que indica entrenamiento sobre chino mandarin. |
| Licencia | No disponible a nivel de repositorio. El README indica que los pesos de Whisper son MIT (OpenAI) y que el resto de componentes se rigen por sus paginas de ModelScope. |
| Formato de pesos | PyTorch (`.pt`) para Whisper y ONNX para los componentes VAD, verificacion de hablante y diarizacion. |

## Arquitectura y entrenamiento

El unico componente de gran tamano es `whisper-torchair/large-v3.pt`, procedente de `iic/Whisper-large-v3@master`. Se trata del checkpoint de Whisper large-v3, un transformer encoder-decoder con atencion completa, preparado para ejecutarse sobre el backend TorchAir del Ascend 910B. El resto de piezas son modelos auxiliares de menor tamano: un VAD basado en redes de memoria finita (FSMN) para detectar actividad de voz, un extractor de embeddings de hablante CAM++ para verificacion y un modulo `speech_campplus_speaker-diarization_common` que implementa el clasico esquema de segmentacion seguida de clustering por backend.

No hay ningun proceso de entrenamiento, ajuste fino, RLHF o DPO realizado por el autor del repositorio. El README es explicito: los ficheros se copian "tal cual" desde ModelScope, conservando README, audios de ejemplo y estructura de directorios original, sin conversion de formato. La unica modificacion documentada ocurre en tiempo de arranque del contenedor: el script de entrada reescribe los campos `speaker_model` y `vad_model` del `configuration.json` de diarizacion para apuntar a rutas locales, habilitando asi el arranque offline. El README anade dos detalles de integracion: el campo `damo/speech_campplus-transformer_scl_zh-cn_16k-common` que referencia la configuracion no se utiliza (se elimina al arrancar) y el subdirectorio `onnx/` de 325 MB del modulo de diarizacion, asociado a rutas de cara y audio-visual, tampoco se usa, pero se conserva por fidelidad al repositorio original.

La verificacion de integridad declarada consiste en descargar el arbol con `huggingface_hub` en la version fijada (`>=0.23,<1`, probada con 0.36.2) y comprobar que los ficheros coinciden byte a byte con los originales.

## Capacidades

- Transcripcion de audio a texto mediante Whisper large-v3, con la cobertura multilingue inherente a ese checkpoint (el repositorio no enumera idiomas).
- Deteccion de actividad de voz (VAD) sobre flujos de audio de 16 kHz, para segmentar y recortar silencios.
- Verificacion de hablante: extraccion de embeddings CAM++ para comparar identidades de voz.
- Diarizacion de hablantes: particion de una grabacion en turnos atribuidos a cada interlocutor, mediante segmentacion y clustering.
- Despliegue offline y reproducible: todos los artefactos se obtienen con una sola llamada a `snapshot_download` o al CLI `hf download`.
- Ejecucion sobre acelerador Ascend 910B a traves de TorchAir, con los componentes ONNX potencialmente desplegables en CPU o GPU mediante un runtime ONNX.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, modo thinking ni audio-visual en el pipeline declarado (el subdirectorio `onnx/` asociado a rutas de cara y ASD se conserva pero no se utiliza).
- No se documenta ninguna capacidad de generacion de texto libre mas alla de la propia salida de transcripcion de Whisper.

## Casos de uso

- Servicio de transcripcion en produccion sobre Ascend 910B: el paquete existe precisamente para que un contenedor con TorchAir Whisper arranque sin acceder a ModelScope; el punto de montaje esperado es `/data/asr-service/models` y el fichero critico es `whisper-torchair/large-v3.pt`.
- Actas de reunion con atribucion de interlocutor: la combinacion de VAD, verificacion de hablante y diarizacion permite separar turnos de habla y despues transcribir cada segmento, de modo que el acta indique quien dijo que.
- Despliegue en entornos aislados o air-gapped: al fijar versiones concretas y copiar los ficheros sin transformarlos, el paquete se puede preinstalar en la imagen y arrancar el servicio sin conectividad externa.
- Preprocesado y curado de corpus de audio: usar el VAD para trocear grabaciones largas eliminando silencio y el modelo de hablante para descartar o agrupar segmentos antes de alimentar un pipeline de etiquetado.
- Verificacion biometrica de locutor en aplicaciones de control de acceso o autenticacion por voz, empleando los embeddings CAM++ y comparando distancias entre muestras.
- Reproducibilidad y fijacion de dependencias en CI/CD: el repositorio actua como artefacto inmutable de modelos para pipelines de integracion que necesitan reconstruir el mismo entorno de inferencia en cada ejecucion.
- Plataforma de subtitulado automático para contenido en chino mandarin: es el escenario para el que estan entrenados los componentes VAD, hablante y diarizacion, con Whisper aportando la transcripcion.
- Punto de partida para experimentar con pipelines ASR completos: los ficheros de ejemplo y los README originales de cada subdirectorio permiten reproducir las recetas de ModelScope sin descargarlas por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de WER, DER ni latencias, y la model card se limita a describir el contenido, el procedimiento de descarga y los requisitos de integracion. Tampoco se ofrecen cifras de throughput ni de consumo del Ascend 910B para estas cargas.

## Requisitos de hardware

- VRAM estimada para Whisper large-v3: en torno a 3 GB solo para los pesos en precision de 16 bits, segun el tamano del fichero `large-v3.pt` (3,09 GB), mas el coste de activaciones y cache de atencion; un presupuesto practico de 4 a 6 GB de memoria dedicada es prudente. No hay cifras oficiales en el repositorio.
- Los componentes auxiliares son ligeros: 4 MB (VAD), 29 MB (verificacion de hablante) y 347 MB (diarizacion), por lo que el grueso del consumo lo determina Whisper.
- GPU consumer: si, siempre que dispongan de al menos 4-6 GB de memoria libre; una RTX 4090 o cualquier GPU de gama media-alta reciente puede alojar el componente Whisper. No hay validacion publicada en el repositorio.
- El destino declarado del paquete no es una GPU, sino un Ascend 910B con backend TorchAir. Los componentes ONNX pueden ejecutarse con un runtime ONNX en CPU o GPU, aunque el README no detalla esa ruta.
- Opciones de despliegue documentadas: `huggingface_hub.snapshot_download`, el CLI `hf download` y el arranque del contenedor ASR que realiza la descarga automatica si falta `/data/asr-service/models/whisper-torchair/large-v3.pt`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (son runtimes de modelos de lenguaje, no aplicables a este paquete).
- Latencia y throughput: no disponibles. El repositorio no publica mediciones.

## Comparativa con modelos similares

| Alternativa | Que es | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tari-tech/asr-voice-recognition-models` | Espejo agregado de 4 componentes ASR y diarizacion (3,47 GB) | No disponible por componente | No documentado | No disponible a nivel de repo; MIT para los pesos de Whisper segun el README | Hugging Face, 0 descargas y 0 likes |
| `iic/Whisper-large-v3` (ModelScope) | Repositorio original del que se copia `large-v3.pt` | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | La de ModelScope | ModelScope |
| `iic/speech_fsmn_vad_zh-cn-16k-common-pytorch@v2.0.4` (ModelScope) | Componente VAD original de 4 MB | No disponible en la informacion proporcionada | No aplica | La de ModelScope | ModelScope |
| `iic/speech_campplus_speaker-diarization_common@master` (ModelScope) | Componente de diarizacion original de 347 MB | No disponible en la informacion proporcionada | No aplica | La de ModelScope | ModelScope |

La comparativa relevante no es frente a otros modelos, sino frente a los repositorios upstream: este paquete aporta unicamente agregacion, fijacion de versiones y garantia de arranque offline, sin reentrenamiento, conversion ni evaluacion adicional. No se dispone de datos para comparar con alternativas de diarizacion de otros proveedores.

## Limitaciones y advertencias

- No es un modelo entrenado ni ajustado por el autor: es una copia literal de artefactos de terceros. Cualquier merito o defecto de los componentes corresponde a sus repositorios originales.
- La licencia del repositorio no esta declarada en los metadatos. El README remite a las paginas de ModelScope de cada componente y solo confirma el MIT para los pesos de Whisper. Antes de un uso comercial es imprescindible verificar la licencia de los componentes VAD, verificacion de hablante y diarizacion.
- Los componentes VAD, CAM++ SV y diarizacion llevan el sufijo `zh-cn` en su nombre: estan orientados a chino mandarin y su rendimiento en castellano no esta documentado ni evaluado aqui.
- No hay benchmarks, evaluacion de sesgos ni analisis de robustez publicados para este paquete. Cualquier cifra de calidad debe obtenerse por evaluacion propia.
- Riesgo de alucinacion y de transcripciones espurias en pasajes de silencio, ruido o musica, comportamiento conocido en la familia Whisper; el repositorio no documenta mitigaciones.
- El servicio falla al arrancar si falta `whisper-torchair/large-v3.pt`, porque la carga no es perezosa: la disponibilidad del fichero es un requisito duro, no una optimizacion.
- El repositorio incluye 325 MB de artefactos ONNX de cara y audio-visual que el propio README declara no utilizados, ademas de un campo de configuracion (`damo/speech_campplus-transformer_scl_zh-cn_16k-common`) que se elimina en el arranque. Son residuos que incrementan el tamano de descarga sin aportar funcionalidad al pipeline declarado.
- El README esta redactado en chino, lo que limita la audiencia y complica la integracion para equipos que no lo lean.
- Los metadatos indican creacion y ultima actualizacion el mismo dia (24 de septiembre de 2026), con cero descargas y cero likes: no existe validacion por parte de la comunidad.
- La verificacion de integridad depende de una version concreta de `huggingface_hub` (`>=0.23,<1`); usar otra version invalida la garantia de coincidencia byte a byte.
- En redes restringidas puede ser necesario configurar `HF_ENDPOINT=https://hf-mirror.com`, lo que implica confiar en un espejo de terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tari-tech/asr-voice-recognition-models
- `iic/Whisper-large-v3@master` (ModelScope), origen de `large-v3.pt`: https://modelscope.cn/models/iic/Whisper-large-v3
- `iic/speech_fsmn_vad_zh-cn-16k-common-pytorch@v2.0.4` (ModelScope): https://modelscope.cn/models/iic/speech_fsmn_vad_zh-cn-16k-common-pytorch
- `iic/speech_campplus_sv_zh-cn_16k-common@v1.0.0` (ModelScope): https://modelscope.cn/models/iic/speech_campplus_sv_zh-cn_16k-common
- `iic/speech_campplus_speaker-diarization_common@master` (ModelScope): https://modelscope.cn/models/iic/speech_campplus_speaker-diarization_common
- Espejo alternativo de Hugging Face para redes restringidas: https://hf-mirror.com
- La busqueda web realizada no devolvio ningun resultado relevante para este modelo; los enlaces obtenidos correspondian a un proyecto de criptomonedas, a definiciones de diccionario y a una wiki de personajes de videojuegos, por lo que se han descartado.
