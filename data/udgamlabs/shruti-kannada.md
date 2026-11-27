# udgamlabs/shruti-kannada

## Resumen

Shruti Kannada es un modelo de reconocimiento automático del habla (ASR) desarrollado por Udgam Labs, diseñado específicamente para transcribir audio en kannada con mezcla de inglés (code-switching), tal y como se habla en contextos reales. Forma parte de la familia Shruti, que cubre también hindi, marathi, tamil, bengalí, telugu, gujarati y odia. El modelo deriva de Shruti Hindi, que a su vez se construye sobre Cactus Whistle (Apache-2.0) de Cactus Compute, y ha sido reentrenado íntegramente con voz kannada e inglesa de licencia abierta, añadiendo 700 piezas de vocabulario kannada.

Con aproximadamente 56 millones de parámetros (55.875.913), una arquitectura encoder-decoder de 8 capas en cada lado y anchura 512, el modelo está pensado para inferencia en dispositivo (on-device) sin conexión. Su fichero cuantizado `.cact` ocupa 29,7 MB con pesos de 4 bits y activaciones de 8 bits, lo que permite ejecutarlo en un teléfono móvil, un portátil o directamente en el navegador mediante WebAssembly. En una prueba sobre un Samsung Galaxy F62 de 2021 transcribe 11,2 veces más rápido que el tiempo real usando 64 MB de memoria.

Su relevancia actual radica en que ofrece transcripción de kannada con code-switching inglés en entornos sin servidor ni internet, un escenario habitual en dispositivos móviles de gama media en la India. El modelo reconoce el kannada en escritura kannada y mantiene las palabras inglesas en caracteres latinos, reflejando la forma en que los hablantes bilingües escriben realmente. La licencia Apache-2.0 facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder (transformer) de 8 capas de encoder y 8 de decoder, anchura 512 |
| Parametros totales | 55.875.913 (aproximadamente 56M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (acepta audio de cualquier longitud según la model card) |
| Tipos de cuantizacion | Pesos de 4 bits y activaciones de 8 bits en el fichero `.cact`; fichero fp32 en safetensors incluido (no probado por el autor) |
| Idiomas soportados | Kannada (kn), inglés (en) y kannada mezclado con inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | `.cact` (motor Cactus) y `.safetensors` (fp32) |

## Arquitectura y entrenamiento

Shruti Kannada es un modelo seq2seq encoder-decoder de tipo transformer con 8 capas en el encoder y 8 en el decoder, anchura 512 y alrededor de 56M de parámetros. Se construye sobre Cactus Whistle (Apache-2.0) a través de Shruti Hindi: Udgam Labs reentrenó todos los pesos sobre voz kannada e inglesa con licencia abierta y amplió el vocabulario con 700 piezas específicas de kannada. La entrada es audio a 16 kHz de cualquier duración y la salida es texto, con detección automática de si el audio es kannada o inglés.

Los datos de entrenamiento provienen de varios conjuntos abiertos: ai4bharat/IndicVoices, ai4bharat/Kathbath, SPRINGLab/SPRING_INX_Kannada_R1, ARTPARK-IISc/Vaani-transcription-part y openslr/librispeech_asr. La model card no detalla el número total de tokens ni la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. La innovación principal es la optimización para despliegue en dispositivo mediante el motor Cactus, con compilación nativa y WebAssembly, y cuantización agresiva a 4 bits de pesos que reduce el modelo a 29,7 MB.

## Capacidades

- Transcripción de voz a texto en kannada, con salida en escritura kannada.
- Reconocimiento de palabras inglesas dentro de habla kannada, manteniéndolas en caracteres latinos (code-switching kn-en).
- Detección automática del idioma del audio (kannada o inglés) sin configuración manual.
- Procesamiento de audio de cualquier longitud a 16 kHz.
- Ejecución totalmente offline, sin servidor ni conexión a internet.
- Inferencia en dispositivo: motor nativo (Mac, Android) y WebAssembly en navegador.
- Modelo pequeño (29,7 MB cuantizado) apto para móviles y entornos con recursos limitados.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de conversaciones bilingües kannada-inglés en movilidad: el modelo gestiona audio de cualquier duración y mantiene las palabras inglesas en latín, útil para notas de voz o reuniones informales donde los hablantes alternan idiomas.
- Subtitulado y accesibilidad offline en aplicaciones móviles: al ejecutarse en el propio teléfono mediante el motor Cactus nativo, permite generar subtítulos sin conexión en zonas con conectividad limitada.
- Dictado por voz en aplicaciones de mensajería: la salida respeta la forma en que los usuarios bilingües escriben (kannada en escritura kannada, inglés en latín), lo que facilita la integración directa en chats.
- Transcripción en navegador sin backend: la compilación WebAssembly permite ofrecer transcripción de kannada en una página web sin enviar audio a ningún servidor, reduciendo costes y preservando la privacidad.
- Digitalización de audio de atención al cliente en kannada: con 29,7 MB y 64 MB de memoria en un Galaxy F62, puede desplegarse en dispositivos de gama media para transcribir llamadas localmente.
- Procesamiento por lotes en equipos con pocos recursos: el tamaño reducido y la velocidad de 11,2x tiempo real en un móvil de 2021 lo hacen adecuado para transcribir archivos en portátiles sin GPU dedicada.
- Investigación en ASR de lenguas indias de bajos recursos: sirve como línea base ligera y reproducible para experimentos de code-switching kn-en con licencia permisiva.

## Benchmarks y rendimiento

Word error rate (%, menor es mejor), 200 clips por conjunto, mismas muestras y mismo evaluador para todos los modelos; Shruti Kannada medido en su motor on-device sobre un Mac el 2 de noviembre de 2026. El tamaño es el fichero publicado por cada autor (whisper.cpp q8_0 para Whisper).

| Modelo | Tamano fichero | FLEURS (lectura) | Kathbath test-unknown (lectura) | DiarBench, ingles en ingles (conversacion, held out) | DiarBench, referencia nativa |
|---|---|---|---|---|---|
| **Shruti Kannada** | **29,7 MB** | 33,1 | 29,4 | **56,6** | 69,5 |
| Whisper tiny | 43,5 MB | 305,5 | 371,7 | 574,5 | 584,5 |
| Whisper base | 81,8 MB | 179,5 | 178,5 | 248,8 | 252,4 |
| IndicConformer Kannada (int8) | 137,7 MB | 20,4 | 19,8 | 67,1 | 56,7 |
| Whisper-tiny Kannada (vasista22) | 151,1 MB | 29,7 | no disponible | no disponible | no disponible |

En conversación real con mezcla de inglés, Shruti Kannada obtiene un WER de 56,6% con palabras inglesas puntuadas en letras inglesas y 69,5% frente a la referencia nativa, superando a IndicConformer Kannada (67,1) pese a ser casi cinco veces menor, y a los fine-tunes Whisper Kannada de vasista22 (88,7 a 91,4). En lectura de kannada y en la referencia nativa, los modelos más grandes son más precisos (IndicConformer obtiene 20,4 y 19,8 en FLEURS y Kathbath, frente a 33,1 y 29,4 de Shruti Kannada).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo cuantizado ocupa 29,7 MB en disco y el autor reporta 64 MB de memoria en uso durante la inferencia en un Samsung Galaxy F62.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU y ejecución en dispositivo, no para GPU de datacenter.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles; no requiere GPU dedicada.
- Opciones de despliegue: motor Cactus (nativo y WebAssembly), paquete Python `cactus-compute`, binario `cactus` de línea de comandos y build `wasm/` para navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 11,2 veces más rápido que el tiempo real en un Samsung Galaxy F62 de 2021 con 64 MB de memoria; no se publican cifras adicionales de latencia o throughput en otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FLEURS (WER) | DiarBench conversacion (WER) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Shruti Kannada | ~56M | Audio de cualquier longitud | 33,1 | 56,6 | Apache-2.0 | Hugging Face, motor Cactus |
| IndicConformer Kannada (int8) | No disponible (fichero 137,7 MB) | No disponible | 20,4 | 67,1 | No disponible en la informacion | Hugging Face (ONNX) |
| Whisper base | 74M (aproximado, no confirmado en la informacion) | No disponible en la informacion | 179,5 | 248,8 | MIT (no confirmado en la informacion) | Hugging Face, whisper.cpp |
| Whisper-tiny Kannada (vasista22) | No disponible (fichero 151,1 MB) | No disponible | 29,7 | 88,7 a 91,4 (rango de los tres fine-tunes) | No disponible en la informacion | Hugging Face |

Shruti Kannada destaca por su tamaño mínimo y su capacidad de ejecución offline en dispositivo, con mejor WER en conversación code-switching que modelos hasta 33 veces mayores, aunque pierde en lectura de kannada frente a IndicConformer.

## Limitaciones y advertencias

- Más de la mitad de las palabras son erróneas en el conjunto de conversación del autor: WER de 56,6% (inglés en letras inglesas) y 69,5% (referencia nativa).
- En lectura de kannada es menos preciso que modelos mayores como IndicConformer Kannada (33,1 y 29,4 frente a 20,4 y 19,8).
- Se observan errores concretos en palabras inglesas: la model card cita "parcel" transcrito como "ಭಾರಿಸಲ್ಲ" en el motor nativo del teléfono, aunque en el navegador del mismo dispositivo se escribió correctamente; los resultados pueden variar entre motores.
- Solo cubre kannada e inglés; para otras lenguas indias hay que usar los otros miembros de la familia Shruti.
- El fichero fp32 en safetensors se incluye pero el autor no lo ha probado.
- El paquete `cactus-compute` envía recuentos anónimos de uso por defecto; hay que definir `CACTUS_TELEMETRY=0` para desactivarlo.
- No se documentan sesgos específicos ni evaluaciones de robustez más allá de los conjuntos citados.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las licencias de los datasets de entrenamiento citados.
- No se dispone de información sobre comportamiento con acentos, ruido de fondo o audio de baja calidad más allá de las pruebas reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/shruti-kannada
- Demo en navegador (Udgam Labs): https://udgamlabs.com/models/shruti/kannada
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Código y ejemplos (GitHub): https://github.com/udgamlabs/shruti/blob/main/docs/kannada.md
- Shruti Hindi (modelo base): https://huggingface.co/udgamlabs/Shruti
- Shruti Marathi: https://huggingface.co/udgamlabs/shruti-marathi
- Shruti Tamil: https://huggingface.co/udgamlabs/shruti-tamil
- Shruti Bengali: https://huggingface.co/udgamlabs/shruti-bengali
- Shruti Telugu: https://huggingface.co/udgamlabs/shruti-telugu
- Shruti Gujarati: https://huggingface.co/udgamlabs/shruti-gujarati
- Shruti Odia: https://huggingface.co/udgamlabs/shruti-odia
- Cactus Whistle (modelo base original): https://huggingface.co/Cactus-Compute/whistle
- Motor Cactus: https://huggingface.co/Cactus-Compute/cactus
- Binarios Cactus 4.1.0: https://huggingface.co/Cactus-Compute/cactus/tree/main/releases/4.1.0
- Whisper tiny: https://huggingface.co/openai/whisper-tiny
- Whisper base: https://huggingface.co/openai/whisper-base
- IndicConformer Kannada (ONNX): https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-kn-onnx
- Whisper-tiny Kannada (vasista22): https://huggingface.co/vasista22/whisper-kannada-tiny
