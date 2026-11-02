# udgamlabs/shruti-tamil

## Resumen

Shruti Tamil es un modelo de reconocimiento automático del habla (ASR) desarrollado por Udgam Labs, diseñado específicamente para transcribir audio en tamil, inglés y, de forma destacable, tamil con mezcla de inglés (code-switching), que es el modo real de habla de gran parte de la población tamil. El modelo forma parte de la familia Shruti, junto a Shruti Hindi y Shruti Marathi, y se presenta como la variante tamil de una arquitectura compacta pensada para inferencia en dispositivo (on-device) sin conexión a internet.

Con 55,9 millones de parámetros (8 capas de encoder y 8 de decoder, anchura 512), el modelo se distribuye como un único fichero de 29,7 MB con pesos en 4 bits y activaciones en 8 bits para el motor Cactus needle. Esta compacidad le permite ejecutarse en un teléfono móvil, un portátil o dentro de una página web vía WebAssembly, con un consumo de memoria de 64 MB y una velocidad de transcripción 10,8 veces superior al tiempo real en un Samsung Galaxy F62 de 2021.

La relevancia del modelo radica en su enfoque en el code-switching tamil-inglés: a diferencia de otros sistemas que transcriben las palabras inglesas en escritura tamil, Shruti Tamil mantiene el inglés en alfabeto latino, reflejando cómo escriben realmente los hablantes. Está construido sobre Cactus Whistle (Apache-2.0) a través de Shruti Hindi, con todos los pesos reentrenados sobre datos de habla tamil e inglesa con licencia abierta y un vocabulario ampliado con 700 piezas específicas del tamil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (8 capas encoder + 8 capas decoder, anchura 512) |
| Parametros totales | 55,9 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (acepta audio de cualquier duración según la model card) |
| Tipos de cuantizacion | Pesos en 4 bits, activaciones en 8 bits (formato `.cact`) |
| Idiomas soportados | Tamil (ta), inglés (en), tamil mezclado con inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | `.cact` (motor Cactus needle); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

Shruti Tamil es un transformer encoder-decoder compacto de 55,9 M de parámetros, con 8 capas en el encoder y 8 en el decoder y una anchura de 512. Deriva de Cactus Whistle (Apache-2.0) a través de Shruti Hindi, sobre el que Udgam Labs reentrenó todos los pesos con datos de habla tamil e inglesa de licencia abierta. Además, se añadieron 700 piezas de vocabulario específicas del tamil para mejorar la cobertura del idioma.

Los datos de entrenamiento provienen de conjuntos de habla india de licencia abierta: ai4bharat/IndicVoices, ai4bharat/Kathbath, SPRINGLab/SPRING_INX_Tamil_R1 y R2, ARTPARK-IISc/Vaani-transcription-part y openslr/librispeech_asr (este último para el componente inglés). La model card no detalla el número total de tokens de audio ni si se aplicaron técnicas de RLHF o DPO; esa información no está disponible. La innovación principal es la compresión extrema (4 bits de pesos, 8 bits de activaciones) junto con un motor de inferencia (Cactus needle) que permite ejecución offline multiplataforma, incluido WebAssembly.

## Capacidades

- Transcripción de voz a texto en tamil, con salida en escritura tamil.
- Transcripción de inglés, con salida en latín minúscula.
- Manejo de code-switching tamil-inglés: las palabras inglesas se mantienen en alfabeto latino en lugar de transliterarse al tamil.
- Detección automática del idioma de entrada (tamil o inglés) sin configuración manual.
- Procesamiento de audio de 16 kHz de cualquier duración.
- Ejecución offline en dispositivo: macOS, Linux, Windows, Android, iOS y WebAssembly.
- No se documentan capacidades de tool calling, agentes, visión, audio de salida ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de reuniones y conversaciones informales en tamil con términos técnicos o de negocio en inglés: el modelo mantiene "catering order confirm" en latín, lo que facilita la lectura y la búsqueda posterior en entornos laborales bilingües.
- Subtitulado y actas de atención al cliente: al ejecutarse offline y con 64 MB de memoria, puede integrarse en aplicaciones móviles de soporte que graban llamadas y generan transcripciones sin enviar audio a la nube, reduciendo riesgos de privacidad.
- Notas de voz en aplicaciones de mensajería: la velocidad de 10,8x tiempo real en un Galaxy F62 permite transcribir mensajes de voz de forma casi instantánea en el propio teléfono.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo real de conversaciones presenciales en tamil e inglés desde un portátil o móvil, sin dependencia de conectividad.
- Digitalización de archivos orales y entrevistas: procesamiento por lotes de grabaciones de campo (por ejemplo, testimonios o encuestas) en equipos sin GPU dedicada, gracias al reducido tamaño del fichero de 29,7 MB.
- Aplicaciones web de dictado: el build WebAssembly permite ofrecer dictado en tamil dentro del navegador sin backend, útil para formularios, blogs o herramientas educativas.
- Investigación lingüística sobre code-switching: la salida diferenciada por alfabeto facilita el análisis de préstamos léxicos del inglés en el tamil hablado.

## Benchmarks y rendimiento

Word error rate (%, menor es mejor), 200 clips por conjunto, mismos clips y scorer para todos los modelos; Shruti Tamil medido en su motor on-device sobre un Mac. Medición del 2 de noviembre de 2026.

| Modelo | Tamano de fichero | FLEURS (lectura) | Kathbath test-unknown (lectura) | DiarBench (conversacion, held out) |
|---|---|---|---|---|
| **Shruti Tamil** | **29,7 MB** | 38,5 | 33,2 | **52,5** |
| Whisper tiny | 43,5 MB | 226,7 | 239,6 | 244,8 |
| Whisper base | 81,8 MB | 124,5 | 108,8 | 152,5 |
| Dolphin base (int8) | 103,7 MB | 71,9 | 65,0 | 92,4 |
| Thedal v11 (licencia no comercial) | 102,6 MB | 42,2 | 38,1 | 70,1 |
| IndicConformer Tamil (int8) | 137,7 MB | **27,8** | **25,0** | 58,7 |
| deepdml whisper-tiny-ta (fp32) | 151,1 MB | 47,9 | 45,6 | 90,3 |
| deepdml whisper-base-ta (fp32) | 290,4 MB | 38,7 | 39,1 | 81,1 |

Datos adicionales reportados en la model card:
- Inglés dentro del tamil: Shruti Tamil escribe el 51,5% de las palabras inglesas de DiarBench en alfabeto latino; el resto de modelos medidos, el 8% o menos.
- Inglés: LibriSpeech test-clean 6,37 (Shruti Hindi: 5,95); Svarah (inglés indio) 23,36.
- Silencio: 0 palabras inventadas en el conjunto de prueba de silencio (dato truncado en la información disponible).
- Con las palabras inglesas eliminadas de la referencia, IndicConformer Tamil supera a Shruti Tamil en DiarBench (51,4 frente a 62,2), al igual que SraVaani-1.0 (908,8 MB; 44,0).

## Requisitos de hardware

- VRAM estimada para inferencia: 64 MB de memoria en el dispositivo según la model card; no requiere GPU dedicada.
- GPU recomendadas: no aplica; el modelo está diseñado para CPU y ejecución on-device. Funciona en móviles, portátiles y navegadores.
- Cabe en cualquier GPU de consumo (RTX 4090, etc.) de forma sobrada, aunque no es su objetivo; también en dispositivos sin GPU.
- Opciones de despliegue: motor Cactus needle (paquete `cactus-needle` de Python, binario `needle` para macOS/Linux/Windows/Android/iOS y build WebAssembly). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 10,8x tiempo real en un Samsung Galaxy F62 de 2021 con 64 MB de memoria. No se proporcionan cifras de latencia absoluta ni throughput en otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | WER DiarBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shruti Tamil | 55,9 M | Audio de cualquier duración | 52,5 | Apache-2.0 | HuggingFace, motor needle |
| IndicConformer Tamil (int8) | No disponible | No disponible | 58,7 | No disponible en la información | HuggingFace (ONNX) |
| Thedal v11 | No disponible | No disponible | 70,1 | No comercial | HuggingFace (ONNX) |
| deepdml whisper-base-ta | No disponible (fichero 290,4 MB fp32) | No disponible | 81,1 | No disponible en la información | HuggingFace |

Shruti Tamil destaca por su reducido tamaño (29,7 MB) frente a alternativas de mayor peso, con un WER competitivo en conversación con code-switching. IndicConformer Tamil obtiene mejor WER en lectura (FLEURS y Kathbath) pero peor en DiarBench y con un fichero 4,6 veces mayor. Thedal v11 tiene una licencia no comercial que limita su uso en producción.

## Limitaciones y advertencias

- El WER en lectura (FLEURS 38,5; Kathbath 33,2) es superior al de IndicConformer Tamil (27,8 y 25,0), por lo que para transcripción de lectura pura puede haber opciones más precisas.
- En DiarBench, cuando se eliminan las palabras inglesas de la referencia, IndicConformer Tamil y SraVaani-1.0 superan a Shruti Tamil; su ventaja se concentra en el tratamiento del code-switching.
- La model card documenta errores reales: palabras inglesas transcritas en escritura tamil (por ejemplo, "meter" como மீட்டர்) y confusión de numerales (நூத்தம்பது, 150, transcrito como மூத்தம்பது).
- El modelo solo cubre tamil e inglés; para hindi o marathi existen variantes separadas de la familia Shruti.
- No se detallan sesgos conocidos ni tasas de alucinación en la información disponible; el dato de silencio sugiere 0 palabras inventadas en ese conjunto, pero el texto está truncado.
- La licencia Apache-2.0 permite uso comercial, pero el paquete `cactus-needle` envía telemetría anónima por defecto; debe desactivarse con `NEEDLE_TELEMETRY=0` si se requiere privacidad.
- El formato de pesos es propietario del motor Cactus needle (`.cact`); no hay safetensors ni GGUF, lo que limita la integración con ecosistemas estándar de inferencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB, lo que puede indicar que los pesos no están alojados directamente en el repo o que la métrica no se ha actualizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/udgamlabs/shruti-tamil
- Modelo base Shruti Hindi: https://huggingface.co/udgamlabs/Shruti
- Shruti Marathi: https://huggingface.co/udgamlabs/shruti-marathi
- Cactus Whistle: https://huggingface.co/Cactus-Compute/whistle
- Motor Cactus needle: https://huggingface.co/Cactus-Compute/needle3
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Demo en navegador: https://udgamlabs.com/models/shruti?lang=ta
- Código y ejemplos: https://github.com/udgamlabs/shruti
- Anuncio de Shruti en LinkedIn: https://www.linkedin.com/posts/udgamlabs_shruti-is-out-speech-to-text-for-hindi-activity-7518185684088709120-L4D4
- Whisper tiny: https://huggingface.co/openai/whisper-tiny
- Whisper base: https://huggingface.co/openai/whisper-base
- Dolphin base: https://huggingface.co/DataoceanAI/dolphin-base
- Thedal v11: https://huggingface.co/Badri0510/Thedal-AED-Tamil-Tanglish-English-INT4-ConvINT8-ONNX
- IndicConformer Tamil: https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-ta-onnx
- deepdml whisper-tiny-ta: https://huggingface.co/deepdml/whisper-tiny-ta-mix-norm
- deepdml whisper-base-ta: https://huggingface.co/deepdml/whisper-base-ta-mix-norm
