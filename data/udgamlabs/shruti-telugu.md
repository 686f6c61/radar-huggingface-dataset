# udgamlabs/shruti-telugu

## Resumen

Shruti Telugu es un modelo de reconocimiento automático del habla (ASR) desarrollado por Udgam Labs, especializado en transcribir telugu y su mezcla con inglés (code-switching), que es el patrón real de habla de millones de personas en Telangana y Andhra Pradesh. Con 55,9 millones de parámetros y un fichero de solo 29,7 MB en cuantización de 4 bits, el modelo está diseñado para ejecutarse completamente offline en dispositivos móviles, portátiles y navegadores mediante WebAssembly, sin necesidad de servidor ni conexión a internet.

El modelo forma parte de la familia Shruti (junto a las variantes Hindi, Marathi, Tamil y Bengali) y se construye sobre Cactus Whistle (Apache-2.0) vía Shruti Hindi: Udgam Labs reentrenó todos los pesos con voz telugu e inglesa de licencia abierta y añadió 700 piezas de vocabulario telugu. La propuesta de valor es clara: un modelo casi cinco veces más pequeño que IndicConformer Telugu (137,7 MB) comete menos errores en conversaciones cotidianas con mezcla de inglés, aunque en telugu leído los modelos grandes siguen siendo más precisos.

La relevancia actual reside en su enfoque en la eficiencia extrema y el despliegue en el borde: transcribe 9,8 veces más rápido que el tiempo real en un Samsung Galaxy F62 de 2021 usando 64 MB de memoria. Esto lo posiciona como una opción práctica para aplicaciones de accesibilidad, notas de voz y asistentes locales en regiones con conectividad limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (8 capas de encoder + 8 de decoder, anchura 512) |
| Parametros totales | 55.875.913 (55,9M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (audio de cualquier longitud según el autor) |
| Tipos de cuantizacion | Pesos 4 bits, activaciones 8 bits (formato .cact) |
| Idiomas soportados | Telugu (te), inglés (en), y telugu mezclado con inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | .cact (motor Cactus needle); no disponible en safetensors ni GGUF |

## Arquitectura y entrenamiento

Shruti Telugu es un transformer encoder-decoder con 8 capas en cada bloque y anchura 512, derivado de Shruti Hindi, que a su vez se construye sobre Cactus Whistle (Apache-2.0) de Cactus Compute. Udgam Labs reentrenó la totalidad de los pesos sobre voz telugu e inglesa con licencia abierta y amplió el vocabulario con 700 piezas específicas de telugu para mejorar la cobertura del script telugu y la mezcla con inglés.

Los datos de entrenamiento provienen de cuatro conjuntos: ai4bharat/IndicVoices, ai4bharat/Kathbath, ARTPARK-IISc/Vaani-transcription-part y openslr/librispeech_asr. No se especifica el número exacto de horas ni la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO (no disponible). La innovación técnica principal es la compresión agresiva a 4 bits de pesos y 8 bits de activaciones en un fichero de 29,7 MB, junto con la integración en el motor Cactus needle con soporte nativo y WebAssembly, que permite inferencia en el navegador sin servidor. El modelo está optimizado para code-switching telugu-inglés, preservando las palabras inglesas en latín minúscula mientras el telugu se emite en script telugu.

## Capacidades

- Transcripción de voz a texto en telugu, inglés y mezcla de ambos (code-switching) con detección automática del idioma.
- Salida en script telugu para palabras telugu y en latín minúscula para palabras inglesas, imitando la forma natural de escribir de los hablantes.
- Ejecución completamente offline en dispositivos móviles, portátiles y navegadores web (WebAssembly).
- Procesamiento de audio de 16 kHz de cualquier longitud.
- Inferencia en el borde con un consumo de memoria de 64 MB y velocidad 9,8x tiempo real en hardware móvil de 2021.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo ASR puro).
- Capacidades multilingües limitadas a telugu e inglés; para hindi, marathi, tamil o bengalí existen modelos separados de la familia Shruti.
- No dispone de modo thinking, visión ni audio generation.

## Casos de uso

- **Transcripción de notas de voz en el móvil**: el modelo convierte grabaciones de voz en texto directamente en el dispositivo, sin enviar audio a la nube, lo que preserva la privacidad y funciona en zonas sin cobertura. Su tamaño de 29,7 MB y consumo de 64 MB lo hacen viable en teléfonos de gama media.
- **Subtitulado en directo de conversaciones telugu-inglés**: gracias a su velocidad de 9,8x tiempo real y su manejo de code-switching, puede generar subtítulos en tiempo real en reuniones o llamadas donde los hablantes alternan telugu e inglés.
- **Aplicaciones web de accesibilidad**: al ejecutarse vía WebAssembly en el navegador, permite integrar transcripción de voz en páginas web sin backend, útil para formularios por voz o lectura de contenido para personas con discapacidad visual.
- **Asistentes de voz locales para comercio**: pequeños comercios pueden usar el modelo en una tablet o portátil para dictar pedidos o inventario en telugu mezclado con términos ingleses (nombres de productos, marcas), sin depender de internet.
- **Transcripción de reuniones y entrevistas**: el modelo puede procesar audio de cualquier longitud y generar actas o transcripciones de entrevistas en telugu-inglés, adecuado para periodistas o investigadores que trabajan en región telugu.
- **Integración en pipelines de datos sin conexión**: en entornos rurales o con conectividad intermitente, el modelo permite digitalizar entrevistas, historiales clínicos dictados o registros administrativos en el propio dispositivo, sincronizándose después cuando haya red.
- **Prototipado rápido en investigación ASR**: su licencia Apache-2.0 y su formato compacto facilitan experimentos de fine-tuning o evaluación en entornos con recursos limitados, así como la comparación con modelos mayores en tareas de code-switching.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, %, menor es mejor), 200 clips por conjunto, mismos clips y evaluador para todos los modelos; Shruti Telugu medido en su motor on-device en un Mac el 2 de noviembre de 2026. El tamaño es el fichero publicado por cada fabricante (whisper.cpp q8_0 para Whisper).

| Modelo | Tamano fichero | FLEURS (leido) | Kathbath test-unknown (leido) | DiarBench, ingles en ingles (conversacion, held out) | DiarBench, referencia nativa |
|---|---|---|---|---|---|
| **Shruti Telugu** | **29,7 MB** | 38,0 | 32,9 | **45,4** | 58,0 |
| Whisper tiny | 43,5 MB | 687,8 | 583,3 | 659,1 | 665,9 |
| Vosk Telugu (small, 0.42) | 60,5 MB | 77,1 | 80,1 | 93,8 | 92,0 |
| Whisper base | 81,8 MB | 220,1 | 363,3 | 371,3 | 375,5 |
| Dolphin base (int8) | 103,7 MB | 73,4 | 66,2 | 86,9 | 90,3 |
| IndicConformer Telugu (int8) | 137,7 MB | 24,5 | 23,0 | 52,9 | 37,3 |
| Whisper-tiny Telugu (vasista22) | 151,1 MB | 34,2 | 34,4 | 59,2 | 47,5 |
| Dolphin small (int8) | 249,7 MB | 60,9 | 52,6 | 98,0 | 98,7 |
| Whisper small | 264,5 MB | 169,7 | 154,1 | 201,1 | 205,1 |
| Whisper-base Telugu (vasista22) | 290,5 MB | 28,9 | 29,5 | 55,3 | 41,3 |
| SraVaani-1.0 | No disponible en el extracto | No disponible | No disponible | No disponible | No disponible |

En conversación con mezcla de inglés (DiarBench, inglés en inglés), Shruti Telugu logra un WER de 45,4, mejor que IndicConformer Telugu (52,9) y que los fine-tunes de Whisper Telugu (55,3 y 59,2), pese a ser entre 5 y 32 veces más pequeño. En telugu leído (FLEURS y Kathbath), los modelos mayores como IndicConformer (24,5 y 23,0) y Whisper-base Telugu (28,9 y 29,5) superan a Shruti Telugu (38,0 y 32,9).

## Requisitos de hardware

- **VRAM estimada para inferencia**: 64 MB de memoria en el dispositivo según el autor (modelo de 29,7 MB en 4 bits); no requiere GPU dedicada.
- **GPU recomendadas**: no aplica para el despliegue previsto; el modelo está pensado para CPU móvil y navegador. Puede ejecutarse en cualquier CPU moderna.
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU de consumo e incluso en microcontroladores y teléfonos de gama media; no se especifican requisitos mínimos de GPU porque el motor Cactus needle está optimizado para CPU y WebAssembly.
- **Opciones de despliegue**: motor Cactus needle (nativo y WebAssembly), paquete Python `cactus-needle`, binario `needle` para línea de comandos, y build WASM para navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no disponibles para este formato).
- **Latencia y throughput**: 9,8x más rápido que tiempo real en un Samsung Galaxy F62 de 2021 con 64 MB de memoria; no se proporcionan cifras de latencia absoluta ni throughput en otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER DiarBench (ingles en ingles) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Shruti Telugu** | 55,9M | Audio de cualquier longitud | 45,4 | Apache-2.0 | Hugging Face, motor propio |
| IndicConformer Telugu (int8) | No disponible (137,7 MB) | No disponible | 52,9 | No disponible en el extracto | Hugging Face (ONNX) |
| Whisper-base Telugu (vasista22) | No disponible (290,5 MB) | No disponible | 55,3 | No disponible en el extracto | Hugging Face |
| Vosk Telugu (small, 0.42) | No disponible (60,5 MB) | No disponible | 93,8 | No disponible en el extracto | alphacephei.com |

Shruti Telugu ofrece el mejor WER en conversación con code-switching entre los modelos comparados, con el fichero más pequeño (29,7 MB) y licencia Apache-2.0 explícita. IndicConformer Telugu es más preciso en telugu leído (FLEURS 24,5 frente a 38,0) pero casi cinco veces más grande y con WER superior en conversación. Los fine-tunes de Whisper Telugu son más grandes y rinden peor en conversación, aunque Whisper-base Telugu supera a Shruti en FLEURS (28,9 frente a 38,0).

## Limitaciones y advertencias

- **Sesgos conocidos**: no se documentan sesgos específicos, pero al entrenarse con datasets de voz abiertos puede reflejar sesgos de género, edad, acento o registro presentes en IndicVoices, Kathbath, Vaani y LibriSpeech.
- **Riesgo de alucinación**: como todo modelo ASR, puede generar palabras o frases no presentes en el audio, especialmente en condiciones de ruido o acentos no representados. El autor documenta errores reales como escribir "show" en script telugu en lugar de mantenerlo en inglés.
- **Limitaciones de contexto o idioma**: solo soporta telugu e inglés; no cubre otros idiomas indios (para hindi, marathi, tamil o bengalí hay modelos separados de la familia Shruti). El rendimiento en telugu leído es inferior al de modelos más grandes (FLEURS 38,0 frente a 24,5 de IndicConformer).
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales en la información disponible.
- **Caveats para producción**: el formato .cact solo es compatible con el motor Cactus needle, lo que limita la portabilidad a otros runtimes (no hay safetensors ni GGUF). El paquete `cactus-needle` envía telemetría anónima por defecto (desactivable con `NEEDLE_TELEMETRY=0`), lo que debe considerarse en despliegues empresariales. No se especifican garantías de precisión en dominios especializados (médico, legal) ni en audio con ruido intenso.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/udgamlabs/shruti-telugu)
- [Demo en Hugging Face Spaces](https://huggingface.co/spaces/udgamlabs/Shruti)
- [Prueba en navegador (Udgam Labs)](https://udgamlabs.com/models/shruti#telugu)
- [Código y ejemplos en GitHub](https://github.com/udgamlabs/shruti/blob/main/docs/telugu.md)
- [Shruti Hindi (modelo base)](https://huggingface.co/udgamlabs/Shruti)
- [Shruti Marathi](https://huggingface.co/udgamlabs/shruti-marathi)
- [Shruti Tamil](https://huggingface.co/udgamlabs/shruti-tamil)
- [Shruti Bengali](https://huggingface.co/udgamlabs/shruti-bengali)
- [Cactus Whistle (modelo base original)](https://huggingface.co/Cactus-Compute/whistle)
- [Motor Cactus needle](https://huggingface.co/Cactus-Compute/needle3)
- [Whisper tiny](https://huggingface.co/openai/whisper-tiny)
- [Whisper base](https://huggingface.co/openai/whisper-base)
- [Whisper small](https://huggingface.co/openai/whisper-small)
- [Whisper-tiny Telugu (vasista22)](https://huggingface.co/vasista22/whisper-telugu-tiny)
- [Whisper-base Telugu (vasista22)](https://huggingface.co/vasista22/whisper-telugu-base)
- [IndicConformer Telugu (ONNX)](https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-te-onnx)
- [Dolphin base](https://huggingface.co/DataoceanAI/dolphin-base)
- [Dolphin small](https://huggingface.co/DataoceanAI/dolphin-small)
- [Vosk Telugu](https://alphacephei.com/vosk/models)
- [SraVaani-1.0](https://huggingface.co/ARTPAR)
