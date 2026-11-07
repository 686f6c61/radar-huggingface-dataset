# udgamlabs/shruti-bodo

## Resumen

Shruti Bodo es un modelo de reconocimiento automatico del habla (ASR) desarrollado por Udgam Labs, un laboratorio de investigacion centrado en modelos pequenos que puedan ejecutarse en dispositivo. Forma parte de la familia Shruti, que ofrece un modelo compacto por idioma, y en este caso cubre bodo (escrito en devanagari) e ingles, incluyendo conversaciones con mezcla de codigos (code-switching) entre ambos. El modelo resuelve el problema de transcribir habla bodo en entornos sin conectividad, con un consumo de recursos minimo.

Tecnicamente es un modelo encoder-decoder de aproximadamente 56 millones de parametros (55.722.313), con 8 capas de encoder y 8 de decoder y anchura 512. Se distribuye como un unico fichero de 29,7 MB con pesos en 4 bits y activaciones en 8 bits, pensado para el motor Cactus needle, disponible de forma nativa y en WebAssembly. Deriva de Shruti Hindi, que a su vez se construye sobre Cactus Whistle (Apache-2.0), y anade 400 piezas de vocabulario bodo tras reentrenar todos los pesos con habla bodo e inglesa.

Su relevancia actual reside en la combinacion de tamano, licencia permisiva y ejecucion totalmente offline: transcribe en un telefono, un portatil o un navegador sin servidor ni conexion, y en un Samsung Galaxy F62 de 2021 procesa aproximadamente 11 veces mas rapido que el tiempo real usando 64 MB de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (8 capas de encoder + 8 de decoder, anchura 512) |
| Parametros totales | Aproximadamente 56M (55.722.313) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (acepta audio de 16 kHz de cualquier duracion) |
| Tipos de cuantizacion | Pesos en 4 bits, activaciones en 8 bits (formato `.cact` del motor Cactus needle) |
| Idiomas soportados | Bodo (brx), ingles (en) y bodo mezclado con ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | `.cact` (motor Cactus needle); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo Whisper-like, con 8 capas en cada bloque y anchura 512, que procesa audio de entrada a 16 kHz de duracion arbitraria y genera texto. Se construye sobre Cactus Whistle (Apache-2.0) a traves de Shruti Hindi: Udgam Labs reentreno todos los pesos con habla bodo e inglesa y amplio el vocabulario con 400 piezas especificas de bodo. La salida en bodo se escribe en devanagari, mientras que aproximadamente la mitad de las palabras inglesas se mantienen en caracteres latinos en minuscula, lo que refleja el comportamiento real de hablantes bilingues.

Los datos de entrenamiento declarados incluyen `ai4bharat/IndicVoices` y `openslr/librispeech_asr`. La model card no detalla el numero total de tokens ni la composicion exacta del dataset, ni menciona fases de RLHF o DPO. La innovacion principal no es arquitectonica sino de despliegue: la cuantizacion agresiva (4 bits en pesos, 8 en activaciones) y el motor Cactus needle permiten inferencia nativa y en WebAssembly dentro del navegador, con un fichero unico de 29,7 MB que cubre dos idiomas.

## Capacidades

- Transcripcion de voz a texto en bodo (salida en devanagari) e ingles, con deteccion automatica del idioma de entrada.
- Manejo de code-switching bodo-ingles: en las pruebas, el 50,4% de las 409 palabras inglesas de DiarBench se escribieron en caracteres latinos.
- Procesamiento de audio de 16 kHz de cualquier duracion.
- Ejecucion totalmente offline en dispositivo: telefono, portatil o navegador mediante WebAssembly.
- Inferencia en tiempo real: aproximadamente 11 veces mas rapida que el tiempo real en un Samsung Galaxy F62 (2021) con 64 MB de memoria.
- API sencilla mediante la libreria `cactus-needle` (`Whistle("shruti-bodo.cact").transcribe("clip.wav")`) y binario de linea de comandos `needle`.
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion de reuniones y conversaciones comunitarias en bodo: el modelo gestiona audio de cualquier duracion y mezcla de bodo e ingles, adecuado para actas de reuniones locales sin necesidad de subir audio a la nube.
- Subtitulado en directo en dispositivos moviles: con inferencia 11 veces mas rapida que el tiempo real en un telefono de gama media de 2021, puede generar subtitulos en tiempo real en aplicaciones Android.
- Aplicaciones web de transcripcion sin servidor: el build WebAssembly permite integrar la transcripcion en una pagina web, como demuestra la demo de udgamlabs.com, sin costes de backend ni envio de datos a terceros.
- Preservacion linguistica y archivo oral: al ejecutarse offline y con licencia Apache-2.0, facilita la digitalizacion de grabaciones en bodo en contextos con conectividad limitada.
- Asistentes de voz embebidos: el fichero de 29,7 MB y los 64 MB de memoria permiten integrarlo en dispositivos con recursos restringidos para comandos y dictado en bodo.
- Investigacion en ASR de bajos recursos: sirve como linea base reproducible para experimentos con code-switching y para comparar con modelos mucho mayores como IndicConformer Bodo.
- Herramientas de accesibilidad para hablantes de bodo: dictado por voz en editores de texto o aplicaciones de notas que funcione sin conexion.

## Benchmarks y rendimiento

Tasa de error de palabras (WER, %, menor es mejor), con los mismos clips y el mismo evaluador para cada modelo; Shruti Bodo medido en su motor on-device sobre un Mac, el 3 de noviembre de 2026.

| Modelo | Tamano de fichero | IndicVoices valid | DiarBench, ingles en ingles | DiarBench, nativo |
|---|---|---|---|---|
| Shruti Bodo | 29,7 MB | 34,5 | 39,9 | 51,5 |
| IndicConformer Bodo (int8) | 137,7 MB | 28,6 | 55,0 | 46,9 |

Notas sobre la medicion: IndicVoices valid es el split reservado de IndicVoices, con hablantes excluidos del entrenamiento y frases bloqueadas, pero de la misma fuente que los datos de entrenamiento, por lo que favorece al modelo. DiarBench es conversacion real externa: 112 turnos utilizables de 25 conversaciones, 1.592 palabras de referencia (409 en ingles) en 97 turnos. La columna "ingles en ingles" puntua contra referencias que escriben las palabras inglesas en caracteres latinos, y solo cuenta las palabras inglesas escritas en letras inglesas; la columna nativa puntua contra referencias que las escriben en devanagari.

Intervalos de confianza pareados al 95% (Shruti Bodo menos el otro modelo, en puntos de WER; negativo significa menos errores para Shruti Bodo):

| Comparacion | Intervalo |
|---|---|
| IndicVoices valid, por clip | +3,47 a +8,51 |
| DiarBench nativo, por clip | +1,77 a +7,65 |
| DiarBench nativo, por conversacion | +1,28 a +8,03 |
| DiarBench nativo, ignorando escritura | +2,62 a +8,40 |
| DiarBench ingles en ingles, por clip | -19,42 a -10,63 |
| DiarBench ingles en ingles, por conversacion | -19,89 a -10,54 |
| DiarBench ingles en ingles, ignorando escritura | -17,42 a -8,43 |

Otros datos: LibriSpeech test-clean 5,99 (Shruti Hindi: 5,95). En silencio, 0 palabras generadas. IndicConformer Bodo no escribe ninguna palabra inglesa en caracteres latinos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el fichero de pesos ocupa 29,7 MB y el modelo usa 64 MB de memoria en un telefono Android.
- GPU recomendadas: no se especifican; el modelo esta disenado para CPU y entornos moviles, no para GPU de datacenter.
- Cabe en cualquier GPU consumer, y tambien en telefonos y navegadores; se ha medido en un Mac, en un Samsung Galaxy F62 (2021) y en Chrome sobre ese mismo telefono.
- Opciones de despliegue: motor Cactus needle (nativo y WebAssembly), paquete Python `cactus-needle` y binario `needle` de linea de comandos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 11 veces mas rapido que el tiempo real en un Galaxy F62 con 64 MB de memoria; no se publican cifras de latencia por clip ni de throughput en otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | IndicVoices valid (WER) | DiarBench ingles en ingles (WER) | Licencia | Formato |
|---|---|---|---|---|---|---|
| Shruti Bodo | ~56M | Bodo, ingles | 34,5 | 39,9 | Apache-2.0 | `.cact` (Cactus needle) |
| IndicConformer Bodo (int8) | No disponible (fichero 137,7 MB, casi 5 veces mayor) | Bodo | 28,6 | 55,0 | No disponible | ONNX int8 |
| Shruti Hindi | No disponible | Hindi, ingles | No disponible | No disponible | Apache-2.0 | `.cact` |

Shruti Bodo es el unico rival medido por el autor. Frente a IndicConformer Bodo, es mas preciso en conversacion real con mezcla de ingles (39,9 frente a 55,0) y en la escritura de palabras inglesas en caracteres latinos, pero pierde en IndicVoices valid (34,5 frente a 28,6) y en DiarBench con referencia nativa (51,5 frente a 46,9). Shruti Hindi es el modelo base de la familia y comparte arquitectura y formato, pero no se han publicado resultados comparables en la informacion disponible.

## Limitaciones y advertencias

- Sobre DiarBench con referencia nativa, IndicConformer Bodo obtiene mejor WER (46,9 frente a 51,5); la ventaja de Shruti Bodo se concentra en la preservacion de palabras inglesas en caracteres latinos.
- En IndicVoices valid, IndicConformer Bodo tambien es mejor (28,6 frente a 34,5), aunque ese split comparte fuente con los datos de entrenamiento.
- Ningun hablante nativo de bodo ha revisado aun las transcripciones del modelo; los ejemplos de la model card provienen de una voz sintetica, no de habla real.
- Solo se ha medido un rival (IndicConformer Bodo); no hay comparaciones con otros sistemas ASR para bodo.
- El modelo solo cubre bodo e ingles; otros idiomas requieren otros modelos de la familia Shruti.
- Riesgo de alucinacion no cuantificado mas alla de la prueba de silencio (0 palabras generadas); no se documentan sesgos especificos.
- La licencia del modelo es Apache-2.0, pero los terminos de los datos de entrenamiento (IndicVoices, LibriSpeech) pueden imponer condiciones adicionales que la model card remite a su seccion de datos.
- El paquete `cactus-needle` envia conteos de uso anonimos por defecto; debe definirse `NEEDLE_TELEMETRY=0` para desactivarlos.
- El formato `.cact` esta ligado al motor Cactus needle; no hay pesos en safetensors ni GGUF, lo que limita la portabilidad a otros runtimes.
- El repositorio de Hugging Face figura con 0 GB de tamano y 0 descargas en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/shruti-bodo
- Coleccion de la familia Shruti: https://huggingface.co/collections/udgamlabs/shruti-6ad5f80d9d300685a6249c9b
- Modelo base Shruti Hindi: https://huggingface.co/udgamlabs/Shruti
- Cactus Whistle (modelo base original): https://huggingface.co/Cactus-Compute/whistle
- Motor Cactus needle: https://huggingface.co/Cactus-Compute/needle3
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Codigo y ejemplos (documentacion de bodo): https://github.com/udgamlabs/shruti/blob/main/docs/bodo.md
- Pagina del modelo en Udgam Labs: https://udgamlabs.com/models/shruti/bodo
- Sitio de Udgam Labs: https://udgamlabs.com/
- Catalogo de modelos de Udgam Labs: https://udgamlabs.com/models
- Modelo de referencia IndicConformer Bodo (ONNX int8): https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-brx-onnx
- Dataset IndicVoices: https://huggingface.co/datasets/ai4bharat/IndicVoices
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
