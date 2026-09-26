# spybyscript/nemotron-3.5-asr-streaming-0.6b-litert

## Resumen

Nemotron 3.5 ASR Streaming 0.6B — LiteRT es una conversion comunitaria del modelo de reconocimiento automatico del habla (ASR) en streaming de NVIDIA, publicada por el usuario spybyscript. El modelo base, `nvidia/nemotron-3.5-asr-streaming-0.6b`, es un sistema ASR de aproximadamente 600 millones de parametros con arquitectura FastConformer (encoder) mas decodificador RNN-T, disenado para transcripcion incremental con baja latencia. Esta conversion no anade entrenamiento ni ajuste fino: su proposito es portar los pesos originales al formato LiteRT/TFLite para ejecucion en dispositivos moviles y entornos edge.

La relevancia de esta ficha reside en que el paquete no es un modelo unico listo para usar, sino un conjunto de grafos por componentes para una integracion stateful. Cada variante contiene 31 archivos `.tflite` mas un manifiesto de tensores y estado, vocabulario, procedencia del codigo fuente y evidencia de paridad. La aplicacion anfitriona debe implementar el troceado de audio, la gestion de caches y la decodificacion greedy de RNN-T. Se distribuyen tres variantes: FP32 (referencia), FP16 (referencia reducida) e INT8 (cuantizacion parcial para CPU).

La revision actual incorpora la correccion de puntuacion `nemotron35-hf560-v2`, que restaura la puntuacion terminal de frase enmascarando el ultimo chunk rellenado a traves de subsampling y atencion del encoder. Esta version esta validada unicamente para ingles estadounidense (en-US), prompt ID 0 y perfil de chunk de 560 ms; el resto de idiomas y tamanos de chunk del checkpoint original no se han validado en esta conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + RNN-T (decoder), ASR en streaming con estado |
| Parametros totales | ~0,6 mil millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica en el sentido de LLM; perfil de chunk de 560 ms con caches de estado de encoder y decoder |
| Tipos de cuantizacion | FP32, FP16 (almacenamiento de pesos) e INT8 (cuantizacion parcial, dinamica por canal en pesos FC del encoder) |
| Idiomas soportados | en (solo en-US validado en esta conversion); el checkpoint upstream es multilingue pero no validado aqui |
| Licencia | openmdw-1.1 (OpenMDW-1.1) |
| Formato de pesos | TFLite / LiteRT (`.tflite`), 31 grafos por variante mas manifiesto de tensores y estado |
| Tamano del repositorio | 9,0 GB |
| Descargas | 1504 |
| Likes | 0 |
| Modelo base | nvidia/nemotron-3.5-asr-streaming-0.6b |
| Revision del codigo fuente base | 1c8deaecc64b91f034d73e08dd8b64625eb3395d |
| SHA-256 de los pesos originales | 9eebdd6590289cb3030f310858f3df93256600a800a3e8200c5993d5f967e174 |

## Arquitectura y entrenamiento

El modelo es un sistema ASR encoder-decoder de tipo RNN-T sobre un encoder FastConformer. El encoder procesa mel-espectrogramas por chunks y mantiene estado entre fragmentos, lo que permite transcripcion incremental en streaming. El decodificador RNN-T consume las salidas del encoder y genera tokens de forma greedy, con prediccion conjunta. No se ha realizado entrenamiento ni ajuste fino adicional en esta conversion: los pesos se derivan directamente del checkpoint oficial de NVIDIA.

La innovacion tecnica de esta publicacion es la conversion a LiteRT en grafos por componentes y la correccion de puntuacion introducida en `nemotron35-hf560-v2`. La correccion enmascara el ultimo chunk rellenado mediante subsampling y atencion del encoder para recuperar la puntuacion terminal, preservando todos los payloads constantes y parametros de cuantizacion originales. El grafo anadido ocupa aproximadamente entre 39 y 57 KB por variante. Los grafos de subsampling anaden un `args_4` Int32 (frames mel validos), cada bloque del encoder anade un `args_5` Int32 (frames validos del encoder) y el decodificador debe consumir solo los frames finales validos; esto exige actualizar el host. En la variante INT8, 192 buffers de pesos de capas totalmente conectadas distribuidas en 24 bloques del encoder son INT8, mientras que 72 buffers de convolucion/depthwise permanecen en FP32 y los grafos fuera de los bloques del encoder siguen siendo byte-identicos a la linea base FP32. Las activaciones, interfaces y caches de streaming son en coma flotante, y no se uso calibracion estatica de activaciones con dataset representativo.

## Capacidades

- Reconocimiento automatico del habla en streaming con perfil de chunk de 560 ms y baja latencia (validado en en-US, prompt ID 0).
- Transcripcion incremental con gestion de estado entre chunks (caches de encoder y decoder).
- Generacion de puntuacion terminal de frase mediante el mecanismo de enmascaramiento del chunk final (variante v2), sin postprocesado que inserte puntuacion.
- Decodificacion RNN-T greedy implementable por la aplicacion anfitriona.
- Ejecucion en dispositivos moviles y edge mediante LiteRT/TFLite, con variantes FP32, FP16 e INT8.
- No soporta tool calling, function calling ni comportamiento de agente: es un modelo exclusivamente de ASR.
- No dispone de modo de razonamiento, vision ni audio generativo; no genera texto libre, solo transcripciones.

## Casos de uso

- Transcripcion en vivo en aplicaciones Android: el modelo se ejecuta con LiteRT sobre CPU y produce texto incremental con chunks de 560 ms, adecuado para subtitulado en tiempo real sin conexion.
- Dictado por voz en editores de texto y apps de notas: la decodificacion RNN-T greedy con caches de estado permite insertar texto conforme se habla, manteniendo el contexto entre fragmentos.
- Accesibilidad para personas con discapacidad auditiva: transcripcion en dispositivo de conversaciones cercanas, sin enviar audio a la nube, lo que reduce latencia y preserva la privacidad.
- Asistentes de voz integrados en aplicaciones moviles: el resultado del ASR puede alimentar un modulo de NLU separado, ya que el modelo no realiza comprension ni ejecucion de acciones por si mismo.
- Transcripcion de reuniones o notas de voz: con audio de calidad razonable y hablantes claros, el paquete FP16 puede ejecutarse en hardware movil moderno para generar borradores de transcripcion que luego se revisan.
- Procesamiento por lotes en servidores con CPU: la variante INT8 (aproximadamente 981 MB de grafos) reduce el uso de memoria frente a FP32 y sirve para transcribir clips cortos en pipelines sin GPU.
- Prototipado y verificacion de integraciones LiteRT: la variante FP32 sirve como referencia de precision para comparar el resto de cuantizaciones en pruebas de paridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (WER, MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente documenta pruebas de validacion internas centradas en puntuacion y paridad de transcripcion, no un benchmark completo.

| Prueba (v2, correccion de puntuacion) | Resultado |
|---|---|
| Clips evaluados | 80 clips de 40 hablantes |
| Transcripciones con puntuacion terminal (antes) | 0 |
| Transcripciones con puntuacion terminal (despues) | 73 |
| Cambios en palabras reconocidas respecto al bundle anterior de la misma precision | 0 |
| Paridad FP32 frente al modelo original en safetensors | 80/80 transcripciones |
| Paridad FP16 frente al modelo original | 79/80 transcripciones |
| Paridad INT8 frente al modelo original | 68/80 transcripciones |
| Entorno de prueba multihablante | Python LiteRT 2.1.2 en CPU |
| Casos diagnosticos adicionales | 24 por variante, superados en LiteRT 2.2.0 |
| Grafos actualizados probados en Android o GPU/NPU | No |

Se mencionan mediciones historicas de precision y rendimiento en Android correspondientes a la revision v1 (Samsung S23 Ultra, Snapdragon 8 Gen 2, Android 16, LiteRT 2.2.0, cuatro hilos de CPU, 23 clips de audiolibro en ingles de 10 hablantes con 569 palabras de referencia), pero los valores numericos completos no estan disponibles en la informacion proporcionada.

## Requisitos de hardware

- VRAM/memoria estimada segun variante: FP32 aproximadamente 2,49 GB de grafos; FP16 aproximadamente 1,27 GB; INT8 aproximadamente 981 MB. A esto hay que sumar el espacio de trabajo en tiempo de ejecucion para caches de streaming y activaciones.
- Cabe en GPU de consumo: el modelo base de 0,6 B es pequeno, pero la model card no documenta requisitos oficiales de VRAM ni una lista de GPU recomendadas. Las pruebas de GPU/NPU actuales no se han ejecutado.
- GPU profesionales: no disponible (no se especifican en la informacion proporcionada).
- Despliegue movil y edge: validado en Samsung S23 Ultra con Snapdragon 8 Gen 2, Android 16, LiteRT 2.2.0 y cuatro hilos de CPU (mediciones de la revision v1).
- Opciones de despliegue: LiteRT/TFLite (Python LiteRT en CPU; experimental mixto en GPU), integracion en Android mediante grafos por componentes. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un LLM sino un paquete ASR en TFLite. Se incluye un runner de referencia en CPU (`reference_inference.py`).
- Latencia y throughput: no disponible; no se facilitan cifras completas de latencia ni de throughput en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos ASR de tamano o categoria similares, ni datos de rendimiento comparables (WER) que permitan una tabla rigurosa.

## Limitaciones y advertencias

- No es un modelo listo para usar: son grafos por componentes que requieren implementar troceado de audio, gestion de caches y decodificacion RNN-T greedy en la aplicacion anfitriona.
- Conversion no oficial: no es una publicacion de NVIDIA ni de Google; no se ha realizado entrenamiento ni ajuste fino adicional.
- Idioma: solo se ha validado en-US con prompt ID 0 y chunk de 560 ms; no se deben inferir otros idiomas, deteccion automatica de idioma ni otros tamanos de chunk a partir del checkpoint upstream.
- Actualizacion obligatoria del host: la revision v2 cambia el contrato de finalizacion (nuevos `args_4` y `args_5`); los hosts antiguos deben fijar la revision `153a7dbd809a255e5999130397bcd60a66f81a54`.
- Paridad imperfecta en cuantizaciones bajas: INT8 coincide con el modelo original en 68 de 80 transcripciones y FP16 en 79 de 80; FP32 en 80 de 80.
- INT8 es cuantizacion parcial, no un modelo enteramente entero; no es un modelo precompilado para NPU de Qualcomm.
- En FP16, el almacenamiento en FP16 no garantiza que toda operacion en CPU se ejecute con aritmetica FP16.
- Los grafos actualizados (v2) no se han vuelto a ejecutar en Android ni en hardware GPU/NPU; las pruebas de la v2 se hicieron con Python LiteRT en CPU.
- La integracion original completa es privada: no se distribuye APK ni el codigo fuente de la integracion; solo se ofrece el contrato publico y un runner de referencia.
- Sesgos y alucinacion: no disponibles; la informacion proporcionada no documenta evaluaciones de sesgo ni tasas de error por acento o ruido.
- Licencia: OpenMDW-1.1; al redistribuir deben conservarse la licencia y los avisos de procedencia aplicables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/spybyscript/nemotron-3.5-asr-streaming-0.6b-litert
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Revision exacta del codigo fuente base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b/tree/1c8deaecc64b91f034d73e08dd8b64625eb3395d
- Pagina oficial de la licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Contrato de integracion: `INTEGRATION.md`
- Documento de correccion de puntuacion: `PUNCTUATION_FIX.md`
- Resumen de validacion: `validation-summary.json`
- Avisos de procedencia: `NOTICE.md`
- Runner de referencia en CPU: `reference_inference.py`
- Variante FP32: https://huggingface.co/spybyscript/nemotron-3.5-asr-streaming-0.6b-litert/tree/main/fp32
- Variante FP16: https://huggingface.co/spybyscript/nemotron-3.5-asr-streaming-0.6b-litert/tree/main/fp16
- Variante INT8: https://huggingface.co/spybyscript/nemotron-3.5-asr-streaming-0.6b-litert/tree/main/int8
