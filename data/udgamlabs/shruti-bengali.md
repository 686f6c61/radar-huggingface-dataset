# udgamlabs/shruti-bengali

## Resumen

Shruti Bengali es un modelo de reconocimiento automático del habla (ASR) desarrollado por Udgam Labs, diseñado para transcribir audio en bengalí con mezcla de inglés de forma totalmente offline y en dispositivos de consumo. Con 55,9 millones de parámetros y un único archivo de 29,7 MB en cuantización de 4 bits, el modelo se ejecuta sobre el motor Cactus needle en macOS, Linux, Windows, Android, iOS y WebAssembly, sin necesidad de servidor ni conexión a internet. Forma parte de la familia Shruti, junto a las variantes de hindi, maratí y tamil.

El modelo aborda un problema específico y frecuente en contextos reales: el code-switching entre bengalí e inglés. A diferencia de otros sistemas que transliteran los términos ingleses a escritura bengalí, Shruti Bengali mantiene las palabras inglesas en caracteres latinos, replicando cómo los hablantes bilingües escriben habitualmente. Está construido sobre Shruti Hindi, que a su vez deriva de Cactus Whistle (Apache-2.0), y ha sido reentrenado íntegramente con voz bengalí e inglesa de licencia abierta, añadiendo 700 piezas de vocabulario bengalí.

Su relevancia actual radica en la combinación de tamaño reducido, latencia baja y funcionamiento en dispositivo: en un Samsung Galaxy F62 de 2021 transcribe 12,6 veces más rápido que tiempo real con 64 MB de memoria. En conversaciones cotidianas con mezcla de inglés supera en precisión a Vosk Bengali (90 MB) e IndicConformer Bengali (137,7 MB), modelos tres y cinco veces más grandes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder tipo transformer (8 capas de encoder + 8 de decoder, anchura 512) |
| Parámetros totales | 55,9 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (acepta audio de 16 kHz de cualquier longitud) |
| Tipos de cuantización | Pesos de 4 bits, activaciones de 8 bits (formato `.cact`) |
| Idiomas soportados | Bengalí (bn), inglés (en) y bengalí mezclado con inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | `.cact` para el motor Cactus needle |

## Arquitectura y entrenamiento

Shruti Bengali es un modelo seq2seq con arquitectura encoder-decoder de 8 capas en cada bloque y anchura 512, con 55,9 millones de parámetros en total. El modelo parte de Shruti Hindi, que a su vez se construyó sobre Cactus Whistle (Cactus Compute, Apache-2.0). Udgam Labs reentrenó todos los pesos con voz bengalí e inglesa de licencia abierta y amplió el vocabulario con 700 piezas específicas del bengalí. La entrada es audio de 16 kHz de duración arbitraria y la salida es texto: bengalí en escritura bengalí e inglés en caracteres latinos en minúscula.

Los datos de entrenamiento provienen de seis conjuntos abiertos: ai4bharat/IndicVoices, ai4bharat/Kathbath, SPRINGLab/SPRING_INX_Bengali_R1, SPRINGLab/SPRING_INX_Bengali_R2, ARTPARK-IISc/Vaani-transcription-part y openslr/librispeech_asr. La model card no detalla el número total de tokens ni la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. La innovación principal es la compresión extrema (29,7 MB en 4 bits) manteniendo calidad competitiva en habla conversacional con code-switching, junto con un motor de inferencia (Cactus needle) multiplataforma que incluye WebAssembly para ejecución en navegador.

## Capacidades

- Transcripción de voz a texto en bengalí e inglés, con detección automática del idioma.
- Manejo de code-switching bengalí-inglés: las palabras inglesas se emiten en caracteres latinos, no transliteradas.
- Procesamiento de audio de 16 kHz de cualquier duración.
- Ejecución totalmente offline y en dispositivo, sin servidor.
- Funcionamiento en macOS, Linux, Windows, Android, iOS y navegador web (WebAssembly).
- Interfaz Python (`cactus-needle`) y binario de línea de comandos (`needle`).
- No dispone de tool calling, capacidades de agente, visión, audio de salida ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de reuniones bilingües: el modelo gestiona conversaciones donde los hablantes alternan bengalí e inglés, manteniendo los términos técnicos ingleses en caracteres latinos, lo que facilita su búsqueda y revisión posterior.
- Subtitulado en directo en dispositivos móviles: al ejecutarse en Android e iOS con 64 MB de memoria y 12,6 veces más rápido que tiempo real, permite generar subtítulos sin conexión en aplicaciones de accesibilidad.
- Notas de voz en aplicaciones de mensajería: integrado vía WebAssembly en una página web, transcribe mensajes de audio localmente sin enviar datos a un servidor, lo que preserva la privacidad.
- Asistentes de voz para atención al cliente en bengalí: la detección automática de idioma y la salida en escritura nativa permiten construir interfaces conversacionales que registran y procesan consultas de usuarios bilingües.
- Digitalización de archivos orales: investigaciones lingüísticas o archivos periodísticos en bengalí pueden transcribirse por lotes con el binario de línea de comandos, sin depender de servicios en la nube.
- Herramientas educativas offline: aplicaciones para escuelas con conectividad limitada pueden ofrecer transcripción de clases y apuntes en bengalí ejecutando el modelo en portátiles o tabletas de gama media.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, %, menor es mejor), 200 clips por conjunto, mismos clips y mismo evaluador para todos los modelos; Shruti Bengali medido en su motor on-device sobre un Mac. Medición del 2 de noviembre de 2026.

| Modelo | Tamaño | FLEURS (lectura) | Kathbath test-unknown (lectura) | DiarBench, inglés en inglés (conversación) | DiarBench, referencia nativa |
|---|---|---|---|---|---|
| **Shruti Bengali** | **29,7 MB** | 29,9 | 22,2 | **36,0** | 41,8 |
| Whisper tiny | 43,5 MB | 361,6 | 403,7 | 540,9 | 543,2 |
| Whisper base | 81,8 MB | 176,7 | 214,5 | 339,9 | 341,6 |
| Vosk Bengali int8 | 28,6 MB | 20,9 | 22,4 | 43,3 | 39,1 |
| Vosk Bengali (Zipformer) | 90,0 MB | 20,8 | 21,65 | 42,8 | 38,5 |
| Dolphin base (int8) | 103,7 MB | 41,1 | 45,9 | 93,0 | 93,2 |
| IndicConformer Bengali (int8) | 137,7 MB | 20,65 | **12,07** | 39,3 | **34,8** |
| Dolphin small (int8) | 249,7 MB | 40,3 | 33,6 | 99,4 | 99,4 |
| Whisper small | 264,5 MB | 184,3 | 173,2 | 167,1 | 167,9 |
| SraVaani-1.0 | 908,8 MB | **15,7** | 11,3 | 34,6 | 27,1 |

Shruti Bengali obtiene el mejor resultado en DiarBench con inglés en inglés (36,0) entre los modelos de tamaño comparable, superando a Vosk Bengali (42,8-43,3) e IndicConformer (39,3). En lectura pura (FLEURS y Kathbath), Vosk e IndicConformer son más precisos, y SraVaani-1.0 lidera ambos conjuntos con un tamaño 30 veces mayor.

## Requisitos de hardware

- Memoria en inferencia: 64 MB en el dispositivo medido (Samsung Galaxy F62).
- Archivo de modelo: 29,7 MB en disco.
- GPU dedicada: no necesaria; el modelo está pensado para CPU y ejecución en dispositivo.
- Cabe holgadamente en cualquier GPU de consumo, aunque no es su escenario objetivo.
- Despliegue: motor Cactus needle (macOS, Linux, Windows, Android, iOS, WebAssembly), paquete Python `cactus-needle` y binario `needle` de línea de comandos.
- Latencia: 12,6 veces más rápido que tiempo real en un Samsung Galaxy F62 (2021).
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.cact` es específico del motor needle.

## Comparativa con modelos similares

| Modelo | Parámetros / tamaño | Idiomas | Contexto | WER DiarBench (inglés en inglés) | Licencia | Ejecución |
|---|---|---|---|---|---|---|
| Shruti Bengali | 55,9 M / 29,7 MB | bn, en, code-switching | audio de cualquier longitud | 36,0 | Apache-2.0 | On-device, WASM |
| Vosk Bengali | no disponible / 90 MB | bn | streaming | 42,8 | no disponible | On-device |
| IndicConformer Bengali | no disponible / 137,7 MB | bn | no disponible | 39,3 | no disponible | Servidor/ONNX |
| SraVaani-1.0 | no disponible / 908,8 MB | varias índicas | no disponible | 34,6 | no disponible | Servidor |

Shruti Bengali es el único de la comparativa con licencia Apache-2.0 confirmada, soporte explícito de code-switching con salida en escritura latina para el inglés y ejecución en navegador mediante WebAssembly.

## Limitaciones y advertencias

- En habla leída (FLEURS, Kathbath) es menos preciso que Vosk Bengali e IndicConformer Bengali, ambos de mayor tamaño.
- Comete errores de transliteración: en la propia model card se documenta que "derby" y "goal" se escribieron en escritura bengalí en lugar de caracteres latinos.
- Solo cubre bengalí e inglés; para hindi, maratí o tamil deben usarse las variantes correspondientes de la familia Shruti.
- El paquete `cactus-needle` envía recuentos anónimos de uso por defecto; debe definirse `NEEDLE_TELEMETRY=0` para desactivarlo.
- El formato `.cact` es propietario del motor needle, lo que limita la portabilidad a otros runtimes de inferencia.
- No se documentan sesgos específicos del dataset ni tasas de alucinación medidas; al ser un modelo ASR, los errores se manifiestan como sustituciones y omisiones de palabras.
- La licencia Apache-2.0 permite uso comercial, pero no se detallan las licencias individuales de todos los datasets de entrenamiento más allá de su origen abierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/shruti-bengali
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Demo en navegador: https://udgamlabs.com/models/shruti?lang=bn
- Código y ejemplos (documentación bengalí): https://github.com/udgamlabs/shruti/blob/main/docs/bengali.md
- Modelo base Shruti Hindi: https://huggingface.co/udgamlabs/Shruti
- Shruti Marathi: https://huggingface.co/udgamlabs/shruti-marathi
- Shruti Tamil: https://huggingface.co/udgamlabs/shruti-tamil
- Motor Cactus needle: https://huggingface.co/Cactus-Compute/needle3
- Cactus Whistle: https://huggingface.co/Cactus-Compute/whistle
