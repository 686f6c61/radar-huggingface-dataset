# udgamlabs/shruti-konkani

## Resumen

Shruti Konkani es un modelo de reconocimiento automatico del habla (ASR) desarrollado por Udgam Labs, pensado para transcribir conversaciones en konkani y en konkani mezclado con ingles. Forma parte de la familia Shruti, que sigue la filosofia de un modelo pequeno por idioma, y se construye sobre Cactus Whistle (Apache-2.0) a traves de Shruti Hindi, cuyos pesos se reentrenaron sobre voz en konkani e ingles anadiendo 400 piezas de vocabulario konkani. El modelo tiene unos 56 millones de parametros (55.722.313), con 8 capas de encoder y 8 de decoder y anchura 512, y se distribuye en un unico archivo de 29,7 MB con pesos en 4 bits y activaciones en 8 bits para el motor Cactus needle.

Su relevancia esta en el despliegue: funciona en un telefono, un portatil o un navegador sin servidor ni conexion a internet, y en un Samsung Galaxy F62 de 2021 transcribe aproximadamente 12 veces mas rapido que el tiempo real usando 64 MB de memoria. En conversaciones reales en konkani reduce el error un 15 % frente a IndicConformer Konkani, un modelo casi cinco veces mas grande, si bien pierde frente a este cuando la referencia es nativa. La salida en konkani se escribe en devanagari y alrededor de la mitad de las palabras inglesas se mantienen en alfabeto latino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (8 capas de encoder + 8 de decoder, anchura 512), derivada de Cactus Whistle via Shruti Hindi |
| Parametros totales | Aproximadamente 56M (55.722.313) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (acepta audio de 16 kHz de cualquier duracion) |
| Tipos de cuantizacion | Pesos en 4 bits y activaciones en 8 bits (formato `.cact`) |
| Idiomas soportados | Konkani (kok), ingles (en) y konkani mezclado con ingles |
| Licencia | Apache-2.0 para el modelo (los terminos de los datos de entrenamiento se detallan en la model card) |
| Formato de pesos | `.cact` (motor Cactus needle); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder compacto de 8 + 8 capas con anchura 512, heredado de Cactus Whistle y afinado a partir de Shruti Hindi. Udgam Labs reentreno todos los pesos sobre voz en konkani e ingles y amplio el vocabulario con 400 piezas especificas de konkani. La entrada es audio a 16 kHz de cualquier duracion y la salida es texto, con deteccion automatica de konkani o ingles y escritura del konkani en devanagari.

Los datos de entrenamiento provienen de ai4bharat/IndicVoices, ARTPARK-IISc/Vaani-transcription-part y openslr/librispeech_asr. No se especifican en la informacion disponible el numero total de tokens ni el volumen de horas de audio, ni si hubo fases de RLHF o DPO. La innovacion principal es el empaquetado en un unico archivo de 29,7 MB con cuantizacion mixta (4 bits en pesos, 8 bits en activaciones) para el motor Cactus needle, con soporte nativo y WebAssembly, lo que permite inferencia completamente offline en dispositivos de gama baja.

## Capacidades

- Transcripcion de voz a texto en konkani escrito en devanagari.
- Reconocimiento de ingles y de habla con code-switching konkani-ingles, manteniendo una parte de las palabras inglesas en alfabeto latino.
- Deteccion automatica del idioma de entrada sin configuracion adicional.
- Procesamiento de audio de 16 kHz de cualquier duracion.
- Inferencia offline en dispositivo: nativa (Mac, Android) y en navegador mediante WebAssembly.
- Ejecucion en moviles de gama media con un consumo de memoria de unos 64 MB.
- No se documentan capacidades de tool calling, agentes, vision ni audio de salida.

## Casos de uso

- Transcripcion de conversaciones cotidianas en konkani: el modelo convierte audio de 16 kHz en texto en devanagari sin conexion, adecuado para grabaciones domesticas o entrevistas de campo donde no hay red.
- Subtitulado local en dispositivos moviles: al ejecutarse en un telefono Android con unos 64 MB de memoria y a 12 veces el tiempo real, permite generar subtitulos al vuelo sin enviar audio a un servidor.
- Aplicaciones web de accesibilidad: mediante el build WebAssembly del motor Cactus needle, se puede integrar la transcripcion directamente en una pagina sin backend.
- Digitalizacion de archivos orales en konkani: procesamiento por lotes en portatil de grabaciones historicas o comunitarias, con la ventaja de no depender de servicios en la nube.
- Asistentes de voz para entornos con conectividad limitada: el modelo puede alimentar interfaces de voz en zonas rurales o instalaciones sin internet, transcribiendo ordenes o notas en konkani e ingles.
- Investigacion linguistica y sociolinguistica: permite analizar el code-switching konkani-ingles en corpus de habla real, ya que conserva parte de las palabras inglesas en alfabeto latino.
- Prototipado rapido en entornos de desarrollo: la instalacion via `pip install cactus-needle` y la descarga de un unico archivo de 29,7 MB facilitan pruebas en portatiles sin GPU.

## Benchmarks y rendimiento

Word error rate (%, menor es mejor), medido el 3 de noviembre de 2026 con los mismos clips y el mismo scorer para todos los modelos; Shruti Konkani ejecutado en su motor on-device sobre un Mac.

| Modelo | Tamano de archivo | IndicVoices valid | DiarBench, ingles en ingles | DiarBench, nativo |
|---|---|---|---|---|
| Shruti Konkani | 29,7 MB | 41,4 | 40,0 | 47,3 |
| IndicConformer Konkani (int8) | 137,7 MB | 33,4 | 47,0 | 37,3 |

DiarBench es un conjunto retenido de conversacion real: 90 turnos de 23 conversaciones, 1.457 palabras de referencia (278 en ingles) en 71 turnos. La columna "ingles en ingles" puntua contra referencias que escriben las palabras inglesas en alfabeto latino, y las palabras inglesas solo cuentan si estan en letras inglesas; la columna nativa puntua contra referencias que escriben esas palabras en devanagari. IndicVoices valid es el split retenido propio de IndicVoices, con hablantes excluidos del entrenamiento pero de la misma fuente que los datos de entrenamiento, por lo que favorece al modelo.

Los intervalos de confianza pareados al 95 % (Shruti Konkani menos el otro modelo, en puntos de WER, 1.000 remuestreos) indican: frente a IndicConformer Konkani, IndicVoices valid +6,10 a +10,00 por clip; DiarBench nativo +6,41 a +13,71 por clip, +6,60 a +13,63 por conversacion y +6,69 a +12,53 (el intervalo se corta en la informacion disponible). Un valor negativo significa menos errores de Shruti Konkani; un intervalo que incluye 0 no muestra ventaja en ningun sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo consume unos 64 MB de memoria en el dispositivo medido (Samsung Galaxy F62).
- GPU recomendadas: no se requieren; el modelo esta disenado para CPU y ejecucion on-device. No se documentan requisitos de GPU dedicada.
- Cabe en GPU consumer: si, aunque no es su objetivo; el despliegue previsto es en CPU movil, portatil y navegador.
- Opciones de despliegue: motor Cactus needle (nativo y WebAssembly), paquete Python `cactus-needle`, binario `needle` para linea de comandos y build WASM para navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 12 veces mas rapido que el tiempo real en un Samsung Galaxy F62 de 2021; no se publican cifras de latencia absoluta ni de throughput en otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER DiarBench (ingles en ingles) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shruti Konkani | ~56M | No disponible (audio de cualquier duracion) | 40,0 | Apache-2.0 | Hugging Face, motor Cactus needle |
| IndicConformer Konkani (int8) | No disponible (archivo de 137,7 MB, casi 5 veces mayor) | No disponible | 47,0 | No disponible en la informacion | Hugging Face (OpenVoiceOS/ai4bharat-indicconformer-kok-onnx) |
| Otros modelos de la familia Shruti | ~56M (por idioma) | No disponible | No disponible | Apache-2.0 | Hugging Face (coleccion Shruti) |

La comparativa se limita a IndicConformer Konkani, el unico rival medido por el autor. En IndicVoices valid y en DiarBench con referencia nativa, IndicConformer Konkani obtiene mejor WER (33,4 y 37,3 frente a 41,4 y 47,3), mientras que Shruti Konkani gana en DiarBench cuando las palabras inglesas se escriben en alfabeto latino (40,0 frente a 47,0).

## Limitaciones y advertencias

- Solo cubre konkani e ingles; otros idiomas requieren sus propios modelos de la familia Shruti.
- La salida en konkani se limita a devanagari; no genera escritura romi ni kannada.
- Ningun lector nativo de konkani ha revisado aun la salida del modelo, segun la model card.
- Riesgo de alucinacion y errores en palabras inglesas: solo alrededor de la mitad se mantienen en alfabeto latino, y el WER en DiarBench con referencia nativa es del 47,3 %.
- El resultado en IndicVoices valid esta favorecido porque comparte fuente con los datos de entrenamiento.
- Los terminos de los datos de entrenamiento (IndicVoices, Vaani, LibriSpeech) pueden imponer condiciones adicionales al uso comercial; deben revisarse en la model card.
- El paquete `cactus-needle` envia recuentos anonimos de uso por defecto; hay que definir `NEEDLE_TELEMETRY=0` para desactivarlo.
- No se documentan sesgos especificos ni evaluaciones de robustez mas alla de los conjuntos citados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/shruti-konkani
- Pagina del modelo en Udgam Labs: https://udgamlabs.com/models/shruti/konkani
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Codigo y ejemplos (documentacion de konkani): https://github.com/udgamlabs/shruti/blob/main/docs/konkani.md
- Coleccion de la familia Shruti: https://huggingface.co/collections/udgamlabs/shruti-6ad5f80d9d300685a6249c9b
- Modelo base Cactus Whistle: https://huggingface.co/Cactus-Compute/whistle
- Motor Cactus needle: https://huggingface.co/Cactus-Compute/needle3
- Pagina general de la familia Shruti: https://udgamlabs.com/models/shruti
- Catalogo de modelos de Udgam Labs: https://udgamlabs.com/models
- Modelo comparable IndicConformer Konkani: https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-kok-onnx
