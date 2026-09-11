# tintitu/speech_paraformer-large-contextual_asr_nat-zh-cn-16k-common-vocab8404-onnx

## Resumen

Paraformer-Large-Contextual es un modelo de reconocimiento automatico del habla (ASR) en chino mandarin, de tipo extremo a extremo y no autorregresivo, desarrollado originalmente por el Alibaba DAMO Academy / Tongyi Lab dentro del proyecto FunASR. La ficha que nos ocupa, publicada por el usuario `tintitu`, es una redistribucion en formato ONNX ya cuantizado del checkpoint oficial alojado en ModelScope. Su rasgo diferencial frente al Paraformer estandar es la integracion de una red de sesgo contextual (*contextual biasing network*, o *embedding biaser*) que permite inyectar en tiempo de inferencia listas de palabras clave —nombres propios, toponimos, terminologia sectorial o marcas— para aumentar la tasa de acierto sobre ese vocabulario concreto.

El repositorio ocupa 0,8 GB e incluye el modelo acustico principal cuantizado a INT8 (`model_quant.onnx`), la red de sesgo (`model_eb.onnx`), el diccionario de segmentacion para las hotwords (`seg_dict`), el vocabulario de 8.404 tokens (`tokens.json`), la configuracion de decodificacion (`config.yaml`) y las estadisticas de normalizacion CMVN (`am.mvn`). El modelo esta disenado para ejecucion en CPU: la propia model card indica un consumo de entre 1,1 GB y 1,6 GB de RAM y un RTF de 0,12 a 0,22 en CPUs tipicas de 8 nucleos, lo que lo situa en el terreno de la transcripcion offline de coste bajo.

Su relevancia practica reside en dos factores. Por un lado, el soporte de hotwords resuelve un problema clasico del ASR en produccion: los nombres de producto, apellidos poco frecuentes o jerga tecnica que los modelos genericos transcriben mal. Por otro lado, su empaquetado ONNX permite desplegarlo con ONNX Runtime, sherpa-onnx o FunASR Runtime sin depender de PyTorch ni de GPU, algo util para despliegues en edge, en contenedores ligeros o en entornos con presupuesto de computo restringido. La contrapartida es que se trata de un modelo monoingue (zh-cn) y sin puntuacion ni marcas de tiempo integradas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo (NAT) con red de sesgo contextual (*contextual biasing network*) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de ASR; no opera con contexto de texto, procesa segmentos de audio) |
| Tipos de cuantizacion | INT8 estatica en el modelo acustico principal (`model_quant.onnx`); la red de sesgo se distribuye tambien en ONNX |
| Idiomas soportados | chino mandarin (zh-cn) unicamente |
| Licencia | la model card indica Apache-2.0 / ModelScope Community License; el campo de licencia del repositorio de HuggingFace figura como no disponible |
| Formato de pesos | ONNX (`model_quant.onnx`, `model_eb.onnx`) mas `config.yaml`, `tokens.json`, `seg_dict` y `am.mvn` |
| Tamano del repositorio | 0,8 GB |
| Vocabulario | 8.404 tokens (caracteres chinos y tokens especiales) |
| Frecuencia de muestreo de entrada | 16.000 Hz, mono, PCM 16 bits o float normalizado en [-1,0, 1,0] |
| Caracteristicas acusticas | 80 dimensiones de Fbank log-Mel con normalizacion CMVN |
| Motor de inferencia | ONNX Runtime, sherpa-onnx, FunASR Runtime |
| Autor de la redistribucion | tintitu (repositorio de HuggingFace) |
| Autor original | Alibaba DAMO Academy / Tongyi Lab (proyecto FunASR) |
| Fecha de creacion del repositorio | 2026-09-11 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe la arquitectura como un Transformer no autorregresivo con una red de sesgo contextual. El termino NAT (*non-autoregressive*) implica que el modelo genera la secuencia completa de tokens de una sola pasada, en lugar de decodificar token a token como hacen los modelos autorregresivos tipo Whisper. Esto elimina el cuello de botella secuencial del decodificador y es la razon principal del RTF bajo documentado (0,12-0,22 en CPU de 8 nucleos). La red de sesgo contextual se distribuye como un modulo independiente (`model_eb.onnx`, *embedding biaser*) que se activa durante la decodificacion para favorecer la aparicion de las hotwords proporcionadas por el usuario. Segun la model card, si no se inyecta ninguna hotword el comportamiento del modelo equivale al del Paraformer-Large estandar. No se detallan en la informacion disponible ni el numero de capas, ni la dimension de los embeddings, ni la composicion exacta del dataset de entrenamiento, ni si hubo fases de ajuste con RLHF o DPO.

La informacion proporcionada tampoco incluye el numero de horas de audio utilizadas, la procedencia de los datos ni el esquema de aumentacion de datos. Lo que si esta documentado es la composicion exacta del repositorio y las sumas de verificacion SHA-256 de cada fichero, lo que permite auditar la integridad de la descarga. Los tamanos son los siguientes: `model_quant.onnx` 871.251.660 bytes (~831 MiB), `model_eb.onnx` 25.618.359 bytes (~24,4 MiB), `seg_dict` 8.287.834 bytes (~7,9 MiB), `tokens.json` 93.676 bytes, `am.mvn` 11.203 bytes y `config.yaml` 2.532 bytes.

| Fichero | Tamano (bytes) | Funcion |
|---|---|---|
| `model_quant.onnx` | 871.251.660 | Modelo acustico principal, cuantizado estaticamente a INT8 |
| `model_eb.onnx` | 25.618.359 | Red de sesgo de embeddings para hotwords |
| `seg_dict` | 8.287.834 | Diccionario de segmentacion para tokenizar las hotwords |
| `tokens.json` | 93.676 | Mapeo de caracteres y tokens del vocabulario de 8.404 entradas |
| `am.mvn` | 11.203 | Estadisticas de normalizacion CMVN de caracteristicas acusticas |
| `config.yaml` | 2.532 | Configuracion de inferencia y parametros de decodificacion con sesgo |

Cabe senalar que el tamano de `model_quant.onnx` (871 MB) es notablemente superior al que cabria esperar de una cuantizacion INT8 completa sobre un modelo de esta familia; esto sugiere que la conversion puede ser parcial (algunas capas mantenidas en precision superior) o que el checkpoint subyacente tiene un numero de parametros elevado. No se dispone de datos para confirmarlo, ya que el recuento de parametros no aparece en la informacion proporcionada.

## Capacidades

- Reconocimiento de voz offline (no en streaming) para chino mandarin, con entrada de 16 kHz mono.
- Inyeccion dinamica de hotwords en tiempo de inferencia: listas de nombres propios, toponimos, marcas, terminos sectoriales o cualquier vocabulario de dominio, separadas por espacios o saltos de linea.
- Mejora de la recall y la precision sobre el vocabulario sesgado gracias a la red `model_eb.onnx` y al diccionario de segmentacion `seg_dict`.
- Salida de texto plano sin puntuacion: la model card recomienda encadenar un modelo de restauracion de puntuacion (`punc_ct-transformer_zh-cn-common-vocab272727-onnx`).
- Integracion con deteccion de actividad de voz (`speech_fsmn_vad_zh-cn-16k-common-onnx`) para segmentar audio largo y descartar silencios.
- Ejecucion en CPU sin GPU, con huella de memoria contenida (1,1-1,6 GB de RAM, pico ~1,4 GB).
- Compatibilidad con ONNX Runtime, sherpa-onnx y FunASR Runtime, lo que facilita el despliegue en C++, Python, Java, C# y otros lenguajes con bindings de ONNX.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio generation, diarizacion de hablantes, marcas de tiempo a nivel de palabra, deteccion de emociones ni traduccion.

## Casos de uso

- Transcripcion de reuniones corporativas en chino: el modelo acepta como hotwords los nombres de los empleados, los nombres de proyecto y la jerga interna de la organizacion, lo que reduce drasticamente los errores en los terminos que mas importan en un acta. El encadenado con VAD permite procesar reuniones de una hora troceandolas en segmentos.
- Subtitulado offline de contenido audiovisual: dado que el modelo trabaja sobre ficheros de audio a 16 kHz mono, se puede integrar en un pipeline de postproduccion que extrae la pista de audio, la transcodifica, la segmenta con VAD, transcribe con Paraformer y restaura la puntuacion con el modelo posterior. El RTF de 0,12-0,22 permite procesar varias horas de material en una sola maquina de CPU.
- Analitica de contact center: transcripcion masiva de grabaciones de llamadas para su posterior analisis de sentimiento o clasificacion. El coste por hora de audio es bajo al no requerir GPU, y las hotwords permiten sesgar el reconocimiento hacia los nombres de producto que la empresa quiere monitorizar.
- Cumplimiento normativo y auditoria: en sectores regulados se pueden inyectar como hotwords los terminos legales o las advertencias obligatorias que deben aparecer en una conversacion, de modo que el sistema detecte de forma fiable su presencia o su ausencia en la transcripcion.
- Transcripcion de dominios tecnicos (medicina, derecho, ingenieria): la lista de hotwords admite terminologia especializada (farmacos, articulos legales, referencias tecnicas) que un modelo generico transcribiria mal. Es el escenario para el que la red de sesgo contextual esta disenada de forma explicita.
- Despliegue en dispositivos edge o entornos sin GPU: aplicaciones de escritorio, kioscos, equipos industriales o contenedores ligeros que solo disponen de CPU y 8 GB de RAM pueden ejecutar el modelo con ONNX Runtime o sherpa-onnx, con un pico de memoria de aproximadamente 1,4 GB.
- Procesamiento por lotes en servidores de CPU: para pipelines nocturnos de transcripcion de grandes volumenes de audio donde no es viable alquilar GPU; la tasa de 4,5 a 8,3 veces el tiempo real por nucleo de 8 hace el coste predecible.
- Investigacion en ASR no autorregresivo y sesgo contextual: el modelo sirve como referencia reproducible para estudiar la decodificacion paralela y el efecto de las redes de sesgo sobre la tasa de acierto en vocabulario especifico, al estar disponible en un formato ONNX portable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de CER, WER ni comparaciones con otros sistemas. Los unicos datos de rendimiento aportados son operativos y se refieren a CPU:

| Metrica | Valor declarado |
|---|---|
| Memoria RAM en reposo | 1,1 GB - 1,6 GB (incluyendo red de sesgo y diccionario) |
| Pico de RAM en inferencia | ~1,4 GB |
| RTF (8 nucleos, sin hotwords o con lista de menos de 100 terminos) | 0,12 - 0,22 |
| Tiempo de proceso de un audio de 10 s | 1,2 s - 2,2 s |
| Aceleracion respecto al tiempo real (derivada del RTF) | ~4,5x a ~8,3x |
| Configuracion minima recomendada | 4 nucleos de CPU, 8 GB de RAM |

## Requisitos de hardware

- No requiere GPU: el modelo esta empaquetado en ONNX y cuantizado a INT8 precisamente para inferencia en CPU.
- RAM: 1,1 GB a 1,6 GB en total, con un pico aproximado de 1,4 GB incluyendo la red de sesgo y el diccionario de segmentacion.
- Configuracion recomendada por el autor: 4 o mas nucleos de CPU y 8 GB o mas de memoria del sistema.
- VRAM estimada para GPU: no disponible. No se documenta una ruta de ejecucion en GPU ni cifras de VRAM.
- GPU recomendadas: no disponibles. Al ser un modelo orientado a CPU, no se especifican modelos de tarjeta grafica.
- Compatibilidad con GPU de consumo: no disponible; no se documenta.
- Opciones de despliegue: ONNX Runtime, sherpa-onnx y FunASR Runtime, segun la model card.
- Latencia: 1,2 a 2,2 segundos para un clip de 10 segundos en una CPU tipica de 8 nucleos.
- Throughput: no se publican cifras de audio por segundo agregadas ni de concurrencia; la unica referencia es el RTF de 0,12-0,22 por flujo.
- Almacenamiento: aproximadamente 0,9 GB para el conjunto de ficheros del repositorio.

## Comparativa con modelos similares

Los datos de las alternativas que figuran a continuacion proceden de conocimiento general sobre estos sistemas y no de la informacion proporcionada en esta ficha, salvo en la fila del modelo objeto de analisis. No se dispone de cifras de precision comparadas.

| Modelo | Parametros | Idiomas | Licencia | Formato y despliegue | Notas |
|---|---|---|---|---|---|
| Paraformer-Large-Contextual (este repositorio) | no disponible | chino mandarin | Apache-2.0 / ModelScope segun la model card | ONNX INT8; ONNX Runtime, sherpa-onnx, FunASR | No autorregresivo, hotwords dinamicas, orientado a CPU |
| Paraformer-Large estandar (sin sesgo contextual) | no disponible | chino mandarin | Apache-2.0 | PyTorch y ONNX | Mismo rendimiento base cuando no se pasan hotwords, segun la model card |
| Whisper large-v3 (OpenAI) | ~1.550 M (dato de conocimiento general) | multilingue, decenas de idiomas | MIT | PyTorch, ONNX, CTranslate2, whisper.cpp | Autorregresivo; mejor cobertura multilingue, mayor coste computacional y necesidad de GPU para baja latencia |
| Zipformer (k2-fsa / sherpa-onnx) | no disponible | varios, incluido chino | Apache-2.0 | ONNX | Disenado para reconocimiento en streaming, a diferencia de este modelo, que es offline |

La ventaja competitiva de este Paraformer frente a Whisper en el nicho de chino mandarin offline es doble: por un lado, la inyeccion de hotwords no tiene equivalente directo en Whisper; por otro, el consumo de recursos en CPU es mucho menor al evitar la decodificacion autorregresiva. La desventaja es la cobertura idiomatica, limitada al chino mandarin.

## Limitaciones y advertencias

- Modelo monoingue: solo chino mandarin (zh-cn). No acepta entradas en otros idiomas.
- Salida sin puntuacion: requiere un modelo adicional de restauracion (por ejemplo, `punc_ct-transformer_zh-cn-common-vocab272727-onnx`) si se necesita texto legible.
- Modelo offline: no esta documentado para reconocimiento en streaming con baja latencia; el flujo natural es procesar segmentos de audio completos.
- Riesgo de alucinacion y de sustitucion de palabras: como cualquier sistema de ASR, puede generar texto plausible pero incorrecto, especialmente con ruido de fondo, solapamiento de hablantes o acentos marcados. La lista de hotwords mitiga el problema en vocabulario conocido, pero no lo elimina.
- Sesgos: no se documenta la composicion del conjunto de entrenamiento, por lo que no se puede evaluar el sesgo respecto a acentos regionales, genero, edad o registro del habla. Es un dato no disponible.
- Sin diarizacion de hablantes ni marcas de tiempo a nivel de palabra en la informacion proporcionada: si se necesitan, hay que resolverlas con modulos externos.
- Restricciones de licencia: la model card menciona Apache-2.0 / ModelScope Community License, pero el campo de licencia del repositorio de HuggingFace figura como no disponible. Para uso comercial o redistribucion conviene verificar la licencia vigente en el repositorio de ModelScope y conservar los avisos de copyright del autor original (Alibaba DAMO Academy / Tongyi Lab) y los enlaces de procedencia.
- Repositorio de terceros con cero descargas y cero likes: se trata de una redistribucion de un usuario individual y no del canal oficial. Se recomienda contrastar los SHA-256 publicados antes de desplegarlo en produccion y valorar el uso del checkpoint oficial en ModelScope.
- Observacion tecnica: el tamano de `model_quant.onnx` (871 MB) es elevado para un modelo declarado como INT8 estatico, lo que puede indicar una cuantizacion parcial. No hay datos para confirmarlo.
- El recuento de parametros no esta disponible, lo que dificulta estimar con precision el coste de inferencia en escenarios de alta concurrencia.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/tintitu/speech_paraformer-large-contextual_asr_nat-zh-cn-16k-common-vocab8404-onnx
- Proyecto upstream FunASR: https://github.com/alibaba-damo-academy/FunASR
- Repositorio oficial en ModelScope: https://modelscope.cn/models/damo/speech_paraformer-large-contextual_asr_nat-zh-cn-16k-common-vocab8404-onnx
- Nota: la busqueda web realizada no devolvio resultados relevantes para este modelo; los enlaces anteriores son los unicos pertinentes encontrados en la informacion proporcionada.
