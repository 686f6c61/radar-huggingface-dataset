# udgamlabs/Shruti

## Resumen

Shruti es un modelo de reconocimiento automático del habla (ASR) de 55 millones de parámetros desarrollado por Udgam Labs, especializado en transcribir voz en hindi, inglés e hinglish (código mezclado hindi-inglés) en dispositivos locales sin conexión. Se construye sobre Cactus Whistle de Cactus Compute (licencia Apache-2.0) mediante un reentrenamiento completo de sus pesos sobre 2.732 horas de voz india con licencia abierta, añadiendo 714 piezas de vocabulario en devanagari para producir hindi en ese alfabeto y mantener las palabras inglesas en latín, tal como se escribe el hinglish de forma natural.

El modelo resuelve un problema concreto: la transcripción de habla code-mixed india en entornos sin conectividad y con recursos limitados. Con un único archivo de 29,5 MB en cuantización de 4 bits (8 bits en activaciones) para el motor Cactus needle, transcribe una frase en aproximadamente un segundo usando 80 MB de memoria en un Samsung Galaxy F62 de 2021. Funciona en macOS, Linux, Windows, Android, iOS y WebAssembly, lo que permite desplegarlo tanto en aplicaciones móviles como directamente en el navegador.

Su relevancia actual radica en la combinación de tamaño reducido, licencia permisiva y soporte nativo de code-switching, un escenario infraatendido por los modelos ASR multilingües convencionales. La ficha se basa exclusivamente en la información publicada por el autor en HuggingFace y en la model card; los datos no disponibles se indican explícitamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (8 capas de encoder + 8 de decoder, anchura 512) |
| Parámetros totales | 55M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (audio de cualquier longitud según el autor; sin cifra de ventana) |
| Tipos de cuantización | 4 bits pesos / 8 bits activaciones (`shruti.cact`); fp32 completo (`shruti.safetensors`) |
| Idiomas soportados | Hindi, inglés, hinglish (code-mixed). Otros idiomas de Whistle (alemán, francés, español, italiano, neerlandés, polaco) no evaluados y probablemente degradados |
| Licencia | Apache-2.0 |
| Formato de pesos | `.cact` (motor Cactus needle, 29,5 MB) y `.safetensors` (fp32, 222 MB) |

## Arquitectura y entrenamiento

Shruti es un transformer encoder-decoder de 55M parámetros con 8 capas de encoder y 8 de decoder y anchura 512, heredado de Cactus Whistle (Apache-2.0). Udgam Labs reentrenó la totalidad de los 55M de pesos sobre 2.732 horas de voz india con licencia abierta y amplió el vocabulario con 714 piezas en devanagari, lo que permite emitir hindi en escritura devanagari y palabras inglesas en latín minúscula dentro de la misma transcripción.

Los datos de entrenamiento provienen de diez conjuntos: ai4bharat/IndicVoices, ARTPARK-IISc/Vaani-transcription-part, ai4bharat/Shrutilipi, ai4bharat/NPTEL, ai4bharat/Kathbath, ai4bharat/Rural_Women_ASR_v2, fixie-ai/common_voice_17_0, openslr/librispeech_asr, google/fleurs y dianavdavidson/MUCS-Hinglish. La model card no detalla la composición exacta por dataset, el número de tokens de audio ni si se aplicaron etapas de RLHF o DPO; esos datos no están disponibles. La innovación principal es la integración con el motor Cactus needle, que ofrece inferencia en 4 bits con activaciones de 8 bits, decodificación por haces (5-beam según la evaluación), detección automática de idioma, transcripción en streaming palabra a palabra y palabras clave de sesgo (`keywords`), además de marcas de tiempo por palabra.

## Capacidades

- Transcripción de voz a texto en hindi (devanagari), inglés e hinglish code-mixed, con detección automática de idioma.
- Salida híbrida de escritura: hindi en devanagari y términos ingleses en latín minúscula, reflejando la convención de escritura real del hinglish.
- Procesamiento de audio de 16 kHz de cualquier longitud según el autor.
- Modo streaming en tiempo real palabra a palabra (`--audio-stream`).
- Marcas de tiempo a nivel de palabra (`word_timestamps=True`).
- Sesgo de vocabulario mediante palabras clave (`keywords=[...]`) para nombres propios o términos técnicos.
- Ejecución totalmente offline y on-device en macOS, Linux, Windows, Android, iOS y WebAssembly.
- Interfaz de bajo nivel en C (`needle.h`: `needle_load`, `needle_transcribe`, `needle_stream_transcribe_process`) para integración en aplicaciones nativas.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Subtitulado y transcripción offline en aplicaciones móviles: integrar `shruti.cact` con la biblioteca C del motor needle permite transcribir notas de voz o reuniones sin conexión, con 80 MB de memoria en un teléfono de gama media de 2021.
- Asistentes de voz para usuarios de hinglish: el modelo mantiene la mezcla hindi-inglés en la salida, lo que evita traducciones forzadas y mejora la fidelidad en comandos como "मेरा order कब आएगा".
- Transcripción en el navegador sin servidor: la compilación WebAssembly funciona en una página web con un solo hilo y sin cabeceras especiales, útil para demos, herramientas de accesibilidad o formularios por voz.
- Digitalización de contenido educativo y conferencias en hindi: con entrada de audio de cualquier longitud y marcas de tiempo por palabra, se pueden generar subtítulos sincronizados para clases grabadas (por ejemplo, material de NPTEL).
- Atención al cliente en centros de contacto indios: la detección automática de idioma y el sesgo por palabras clave permiten transcribir conversaciones con nombres de productos o términos técnicos concretos en tiempo real.
- Aplicaciones de campo con conectividad intermitente: al no requerir red ni servidor, encaja en escenarios rurales o de campo donde la transcripción debe ejecutarse en el dispositivo (el modelo se entrenó con corpus como Rural_Women_ASR_v2).
- Investigación en ASR code-mixed: el modelo sirve como línea base pequeña y reproducible para experimentos de code-switching hindi-inglés con licencia Apache-2.0.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, %, menor es mejor). Según el autor, todos los modelos se ejecutaron sobre los mismos conjuntos de prueba con el mismo normalizador y scorer; Monsoon usa el scorer oficial OIWER del Open ASR Leaderboard de Hugging Face. Shruti se ejecutó en el motor on-device (5-beam, conjunto de idiomas); el resto en GPU o Mac. Medición del 18-19 de octubre de 2026. n/c: no comparable (el modelo solo escribe en alfabeto latino); –: no medido.

| Modelo | Tamaño | Monsoon Hindi | FLEURS Hindi | Lahaja (acentos hindi) | MUCS Hinglish | Svarah (inglés indio) | LibriSpeech (inglés) | Palabras inventadas en 100 clips silenciosos |
|---|---|---|---|---|---|---|---|---|
| Shruti | 29,5 MB | 20,46 | 19,92 | 26,28 | 35,21 | 22,47 | 5,95 | 0 |
| Koyal-hi-120M | 481 MB | 11,64 | 9,56 | 18,70 | 57,51 | Solo hindi | Solo hindi | 0 |
| IndicConformer Hindi (fp32) | 482 MB | 15,31 | 11,31 | 13,18 | 64,48 | Solo hindi | Solo hindi | 88 |
| Vosk small Hindi + Indian English | 139 MB | 35,75 | 18,07 | 26,60 | 61,14 | 38,51 | 30,18 | 1 |

Shruti no es el más preciso en hindi puro frente a Koyal o IndicConformer, pero obtiene el mejor resultado en MUCS Hinglish (35,21) y en LibriSpeech inglés (5,95) entre los modelos comparados, y no genera palabras alucinadas en clips silenciosos. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, al tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM estimada: 80 MB de memoria en inferencia on-device según el autor (modelo de 29,5 MB en 4 bits); el archivo fp32 de 222 MB requiere más memoria, cifra no disponible.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU y ejecución on-device, no para GPU de datacenter.
- Cabe en cualquier GPU de consumo e incluso en teléfonos: probado en un Samsung Galaxy F62 (2021) con unos 80 MB de memoria y aproximadamente un segundo por frase.
- Despliegue: motor Cactus needle (Python `cactus-needle`, binario `needle` para macOS arm64, Linux x86_64, Windows x86_64, Android arm64, entre otros, y build WebAssembly). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: aproximadamente 1 segundo por frase en el dispositivo citado; no se publican cifras de throughput ni de latencia en otros hardware. Se recomienda usar 2 hilos en teléfonos con dos núcleos rápidos.

## Comparativa con modelos similares

| Modelo | Parámetros / tamaño | Idiomas | Code-switching | Licencia | Disponibilidad | WER MUCS Hinglish |
|---|---|---|---|---|---|---|
| Shruti | 55M / 29,5 MB (4 bits) | Hindi, inglés, hinglish | Sí, nativo | Apache-2.0 | HuggingFace, GitHub, demo web | 35,21 |
| Koyal-hi-120M | 120M / 481 MB | Solo hindi | No | No disponible en la información | HuggingFace | 57,51 |
| IndicConformer Hindi | No disponible / 482 MB (fp32) | Solo hindi | No | No disponible en la información | HuggingFace (ONNX) | 64,48 |
| Vosk small Hindi + Indian English | No disponible / 139 MB | Hindi, inglés indio | No documentado | No disponible en la información | alphacephei.com | 61,14 |

Shruti destaca por tamaño (entre 5 y 16 veces menor que los comparables), soporte nativo de code-switching y licencia Apache-2.0 explícita; sus competidores obtienen mejor WER en hindi puro pero fallan en hinglish o no lo cubren.

## Limitaciones y advertencias

- Precisión inferior a modelos más grandes en hindi puro: 20,46 de WER en Monsoon frente a 11,64 de Koyal y 15,31 de IndicConformer.
- Los idiomas de Whistle distintos del hindi y el inglés (alemán, francés, español, italiano, neerlandés, polaco) no se evaluaron y probablemente se degradaron tras el reentrenamiento.
- El modo `language="en"` está pensado solo para habla íntegramente en inglés; forzarlo en audio code-mixed puede degradar la salida.
- Riesgo de alucinación bajo en silencio (0 palabras inventadas en 100 clips), pero no se documentan métricas de sesgo demográfico, de acento o de género.
- No se detalla la composición exacta del corpus de entrenamiento ni posibles sesgos derivados de los datasets de origen.
- El paquete Python `cactus-needle` envía recuentos anónimos de uso por defecto (nombre de función, versiones, sistema operativo); debe desactivarse con `NEEDLE_TELEMETRY=0` en entornos sensibles. El binario de línea de comandos y la build WebAssembly no hacen llamadas de red.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar los avisos de atribución a Udgam Labs y Cactus Compute.
- En producción, validar el rendimiento con el acento y dominio concretos, ya que las cifras publicadas corresponden a conjuntos de prueba específicos y a una configuración de decodificación concreta (5-beam).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/udgamlabs/Shruti
- Modelo base Cactus Whistle: https://huggingface.co/Cactus-Compute/whistle
- Motor Cactus needle: https://huggingface.co/Cactus-Compute/needle3
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Código y ejemplos: https://github.com/udgamlabs/shruti
- Informe técnico: https://udgamlabs.com/research/shruti
- Página del modelo con demo en navegador: https://udgamlabs.com/models/shruti
- Koyal-hi-120M: https://huggingface.co/adalat-ai/koyal-hi-120m-1.0
- IndicConformer Hindi (ONNX): https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-hi-onnx
- Modelos Vosk: https://alphacephei.com/vosk/models
