# udgamlabs/shruti-sanskrit

## Resumen

Shruti Sanskrit es un modelo de reconocimiento automatico del habla (ASR) desarrollado por Udgam Labs, especializado en sanscrito hablado y en habla mixta sanscrito-ingles (code-switching). Forma parte de la familia Shruti, que agrupa un modelo pequeno por idioma, y se distribuye como un unico fichero de 29,7 MB en formato propietario `.cact` (pesos en 4 bits, activaciones en 8 bits) para el motor Cactus needle. Con aproximadamente 56 millones de parametros, esta disenado para inferencia totalmente offline en dispositivos: movil, portatil o navegador via WebAssembly, sin servidor ni conexion a internet.

El modelo se construye sobre Cactus Whistle (Apache-2.0) a traves de Shruti Hindi: Udgam Labs reentreno todos los pesos con habla en sanscrito e ingles y anadio 400 piezas de vocabulario sanscrito. La salida es texto con el sanscrito en escritura devanagari y las palabras inglesas en latin minusculas, de modo que una frase mixta como "अधुना अन्तिमम् over प्रचलति" se transcribe preservando ambos alfabetos.

Su relevancia no reside en la precision —el propio autor advierte que IndicConformer Sanskrit es mas preciso en el conjunto de validacion de IndicVoices (24,4 frente a 30,9 de WER) y que aproximadamente un tercio de las palabras fallan en sus dos pruebas— sino en el compromiso tamano/prestaciones: un fichero de menos de 30 MB que transcribe unas 12 veces mas rapido que el tiempo real en un Samsung Galaxy F62 de 2021 usando 64 MB de memoria. Es, por tanto, una pieza para ASR embebido y sin conectividad, no un sustituto de modelos ASR de mayor tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder tipo transformer (8 capas de encoder + 8 de decoder, anchura 512); base Cactus Whistle via Shruti Hindi |
| Parametros totales | Aproximadamente 56M (55.722.313) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (audio de entrada de cualquier duracion, segun el autor) |
| Tipos de cuantizacion | Pesos en 4 bits y activaciones en 8 bits (formato `.cact`); no se documentan otras |
| Idiomas soportados | Sanscrito hablado, ingles y sanscrito mezclado con ingles (sa, en) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.cact` (motor Cactus needle); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

Shruti Sanskrit es un modelo encoder-decoder de tipo transformer con 8 capas en el encoder y 8 en el decoder y una anchura de 512, lo que suma unos 55,7 millones de parametros. Hereda la arquitectura de Cactus Whistle (Cactus Compute, Apache-2.0) a traves de Shruti Hindi, el modelo intermedio de la familia Shruti. Udgam Labs reentreno la totalidad de los pesos sobre habla en sanscrito e ingles y amplio el vocabulario con 400 piezas especificas de sanscrito, lo que permite emitir devanagari de forma nativa.

Los datos de entrenamiento declarados son `ai4bharat/IndicVoices` y `openslr/librispeech_asr`. No se especifica en la informacion disponible el numero total de tokens ni de horas de audio, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en ASR). El resultado se distribuye cuantizado en 4 bits para pesos y 8 bits para activaciones, en un unico fichero de 29,7 MB pensado para el motor Cactus needle, disponible tanto en binario nativo como en compilacion WebAssembly para ejecucion en navegador.

## Capacidades

- Transcripcion de voz a texto en sanscrito hablado, con salida en escritura devanagari.
- Reconocimiento de habla mixta sanscrito-ingles (code-switching): las palabras inglesas se mantienen en latin minusculas y el sanscrito en devanagari.
- Deteccion automatica del idioma de la entrada (sanscrito o ingles) sin configuracion previa.
- Entrada de audio a 16 kHz de cualquier duracion.
- Inferencia completamente offline y en dispositivo: movil, portatil y navegador via WebAssembly.
- Motor nativo (binario `needle`) y API Python (`cactus-needle`) para integracion en aplicaciones.
- No se documentan capacidades de traduccion, diarizacion de hablantes, puntuacion automatica ni marcas de tiempo.

## Casos de uso

- Aplicaciones moviles de transcripcion de sanscrito sin conectividad: el modelo cabe en 29,7 MB y consume 64 MB de memoria, por lo que puede empaquetarse dentro de una app Android o iOS y transcribir grabaciones de clase o estudio sin enviar audio a un servidor.
- Notas de clase de sanscrito en el navegador: la compilacion WebAssembly permite transcribir en tiempo real desde una pagina web (como la demo de Udgam Labs) sin instalar software ni depender de la nube.
- Subtitulado offline de material docente bilingue sanscrito-ingles: el modelo preserva las palabras inglesas en latin dentro de una frase en devanagari, util para grabaciones de seminarios donde el ponente alterna idiomas.
- Herramientas de accesibilidad en dispositivos de bajos recursos: al ejecutarse en un Galaxy F62 con 64 MB de memoria, puede integrarse en dispositivos antiguos o de gama baja para dictado en sanscrito.
- Prototipado e investigacion en ASR de lenguas clasicas: al ser Apache-2.0 y con pesos abiertos, sirve como punto de partida para fine-tuning o para estudiar code-switching sanscrito-ingles.
- Transcripcion de campo sin infraestructura: en entornos sin red (zonas rurales, archivos, trabajo de campo linguistico) el motor nativo permite transcribir audio localmente en un portatil.
- Procesamiento por lotes de audio de cualquier duracion: la entrada admite audio de longitud arbitraria a 16 kHz, adecuada para transcribir grabaciones largas en un pipeline local.

## Benchmarks y rendimiento

Resultados de word error rate (%, menor es mejor), medidos el 3 de noviembre de 2026 con las mismas muestras y el mismo scorer para todos los modelos. IndicVoices valid contiene 200 muestras y DiarBench 55 turnos. El tamano es el fichero publicado por cada fabricante (whisper.cpp q8_0 en el caso de Whisper).

| Modelo | Tamano de fichero | IndicVoices valid | DiarBench, ingles en ingles (conversacion, held out) | DiarBench, referencia nativa |
|---|---|---|---|---|
| **Shruti Sanskrit** | 29,7 MB | 30,9 | 32,3 | 38,1 |
| Whisper tiny | 43,5 MB | 617,4 | 522,9 | 528,1 |
| Whisper base | 81,8 MB | 440,6 | 367,7 | 374,7 |
| IndicConformer Sanskrit (int8) | 137,7 MB | 24,4 | 36,6 | 33,4 |
| Su-srota (int8 ONNX) | 187,5 MB | 38,7 | 43,8 | 41,8 |
| Whisper small | 264,5 MB | 443,3 | 367,4 | 369,4 |

Advertencias del autor sobre la lectura de la tabla: IndicVoices valid procede de la misma fuente que los datos de entrenamiento (aunque con hablantes y frases excluidos), por lo que favorece al modelo; DiarBench es conversacion real externa con solo 68 palabras inglesas en 15 turnos, insuficiente para conclusiones solidas sobre habla mixta. En rendimiento en dispositivo, el autor reporta unas 12 veces mas rapido que el tiempo real en un Samsung Galaxy F62 de 2021 con 64 MB de memoria.

## Requisitos de hardware

- VRAM/memoria estimada: 64 MB de memoria en el dispositivo segun el autor; el fichero pesa 29,7 MB en cuantizacion 4 bits de pesos y 8 bits de activaciones.
- GPU dedicadas: no requiere GPU; el motor Cactus needle esta pensado para CPU. No se documenta soporte de CUDA ni de aceleracion en A100, H100 o RTX 4090.
- GPU de consumo: no aplica; funciona en CPU de movil, portatil y navegador.
- Despliegue: motor Cactus needle (binario nativo y WebAssembly), paquete Python `cactus-needle` (`from needle import Whistle`), CLI `./needle --model shruti-sanskrit.cact --audio clip.wav`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 12x tiempo real en un Samsung Galaxy F62 (2021); mediciones adicionales en un Mac y en Chrome de ese mismo movil, sin cifras publicadas.
- Telemetria: el paquete `cactus-needle` envia conteos de uso anonimos por defecto; se desactiva con `NEEDLE_TELEMETRY=0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | WER IndicVoices valid | WER DiarBench (ingles en ingles) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Shruti Sanskrit | ~56M | Audio de cualquier duracion a 16 kHz | 30,9 | 32,3 | Apache-2.0 | `.cact`, motor Cactus needle |
| IndicConformer Sanskrit | No disponible | No disponible | 24,4 | 36,6 | No disponible en la informacion | ONNX int8, 137,7 MB |
| Su-srota | No disponible | No disponible | 38,7 | 43,8 | No disponible en la informacion | ONNX int8, 187,5 MB |
| Whisper tiny | 39M | Ventana de 30 s | 617,4 | 522,9 | MIT (no indicado en la informacion) | whisper.cpp q8_0, 43,5 MB |
| Whisper base | 74M | Ventana de 30 s | 440,6 | 367,7 | MIT (no indicado en la informacion) | whisper.cpp q8_0, 81,8 MB |

Frente a IndicConformer Sanskrit, Shruti Sanskrit pierde en precision sobre IndicVoices (30,9 frente a 24,4) pero gana en conversacion con referencia nativa (38,1 frente a 33,4) y ocupa menos de una cuarta parte del tamano. Frente a Whisper tiny y base, el modelo de Udgam Labs es drasticamente mas preciso en sanscrito (30,9 frente a 617,4 y 440,6) con un fichero menor o comparable. Su-srota queda por detras en ambas pruebas pese a ser mas de seis veces mas grande.

## Limitaciones y advertencias

- Precision limitada: aproximadamente un tercio de las palabras son erroneas en ambas pruebas del autor; no es el modelo de sanscrito mas preciso que midieron.
- El autor declara explicitamente que no hace ninguna afirmacion comparativa de superioridad y que IndicConformer Sanskrit es mas preciso en IndicVoices.
- Sesgo de evaluacion: el conjunto IndicVoices valid comparte fuente con los datos de entrenamiento, lo que infla los resultados.
- Evaluacion de habla mixta insuficiente: DiarBench solo contiene 68 palabras inglesas en 15 turnos, insuficiente para caracterizar el code-switching.
- No probado en canto, verso ni recitacion: solo se evaluo habla cotidiana.
- Ningun lector nativo de sanscrito ha revisado las transcripciones; los errores de escritura devanagari (por ejemplo, कन्दुकः transcrito como कण्डुकः) son posibles.
- Diferencias entre motores: el motor nativo y el de navegador pueden producir textos distintos para el mismo audio (por ejemplo, "slide" aparece en latin en uno y como स्लैड् en el otro).
- Idiomas: solo sanscrito e ingles; otros idiomas requieren sus propios modelos Shruti.
- Formato propietario `.cact`: no hay pesos en safetensors ni GGUF, lo que limita su uso fuera del ecosistema Cactus needle.
- Telemetria activada por defecto en el paquete Python (desactivable con `NEEDLE_TELEMETRY=0`).
- Licencia Apache-2.0: permite uso comercial, pero no se documentan garantias ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/shruti-sanskrit
- Coleccion de la familia Shruti: https://huggingface.co/collections/udgamlabs/shruti-6ad5f80d9d300685a6249c9b
- Modelo base Cactus Whistle: https://huggingface.co/Cactus-Compute/whistle
- Motor Cactus needle: https://huggingface.co/Cactus-Compute/needle3
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Demo en navegador (Udgam Labs): https://udgamlabs.com/models/shruti/sanskrit
- Codigo y ejemplos (GitHub): https://github.com/udgamlabs/shruti/blob/main/docs/sanskrit.md
- Pagina de la familia Shruti: https://udgamlabs.com/models/shruti
- Sitio de Udgam Labs: https://udgamlabs.com/
- IndicConformer Sanskrit (comparativa): https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-sa-onnx
- Su-srota (comparativa): https://huggingface.co/gnumanth/sushrota-sanskrit-asr-onnx
- Whisper tiny (comparativa): https://huggingface.co/openai/whisper-tiny
- Whisper base (comparativa): https://huggingface.co/openai/whisper-base
- Whisper small (comparativa): https://huggingface.co/openai/whisper-small
