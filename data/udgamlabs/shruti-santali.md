# udgamlabs/shruti-santali

## Resumen

Shruti Santali es un modelo de reconocimiento automatico del habla (ASR) desarrollado por Udgam Labs, disenado especificamente para transcribir santali (escrito en alfabeto Ol Chiki) y para gestionar de forma nativa el cambio de codigo santali-ingles. Con aproximadamente 56 millones de parametros, es un modelo compacto que se distribuye en un unico archivo de 29,7 MB con pesos cuantizados a 4 bits, pensado para ejecutarse integramente en el dispositivo (telefono, portatil o navegador) sin conexion a internet ni servidor.

El modelo forma parte de la familia Shruti, que sigue la filosofia de "un modelo pequeno por idioma". Se construye sobre Cactus Whistle (Apache-2.0) a traves de Shruti Hindi, reentrenando todos los pesos con voz en santali e ingles y anadiendo 700 piezas de vocabulario santali. Su relevancia radica en cubrir una lengua de bajos recursos como el santali con un modelo desplegable offline mediante el motor Cactus, que ofrece ejecucion nativa y compilacion a WebAssembly.

La propuesta es deliberadamente modesta en sus afirmaciones: el autor indica que en sus dos pruebas no se observa una diferencia clara frente a IndicConformer Santali, un modelo casi cinco veces mayor, y advierte de que la salida aun no ha sido revisada por hablantes nativos de santali.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder de 8 capas de encoder y 8 de decoder, anchura 512 (familia Cactus Whistle) |
| Parametros totales | Aproximadamente 56M (55.875.913) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Audio de 16 kHz de cualquier longitud (no se especifica limite en tokens) |
| Tipos de cuantizacion | 4 bits pesos / 8 bits activaciones (archivo .cact); se incluye version fp32 en safetensors |
| Idiomas soportados | Santali (Ol Chiki), ingles y santali mezclado con ingles |
| Licencia | Apache-2.0 (sujeta a los terminos de los datos de entrenamiento) |
| Formato de pesos | `.cact` (motor Cactus) y `.safetensors` (fp32) |

## Arquitectura y entrenamiento

Shruti Santali es un modelo encoder-decoder de tipo transformer con 8 capas en el encoder y 8 en el decoder, con una anchura de 512 dimensiones y cerca de 56 millones de parametros. La arquitectura subyacente es Cactus Whistle (Apache-2.0), que Udgam Labs tomo a traves de su modelo intermedio Shruti Hindi: se reentrenaron todos los pesos sobre voz en santali e ingles y se anadieron 700 piezas de vocabulario especificas del santali para cubrir el alfabeto Ol Chiki.

El entrenamiento combina conjuntos de datos publicos: ai4bharat/IndicVoices, ARTPARK-IISc/Vaani-transcription-part y openslr/librispeech_asr. No se detalla en la informacion disponible el numero exacto de horas ni la composicion porcentual del dataset, ni si se aplicaron fases de RLHF o DPO (poco habituales en ASR). La innovacion principal no es arquitectonica sino de despliegue: cuantizacion agresiva a 4 bits y un motor (Cactus) con backend nativo y WebAssembly que permite inferencia offline en dispositivos de gama media.

## Capacidades

- Reconocimiento automatico del habla para santali con salida en alfabeto Ol Chiki.
- Transcripcion de ingles y de habla con cambio de codigo santali-ingles, manteniendo algunas palabras inglesas en caracteres latinos.
- Deteccion automatica del idioma de la entrada (santali o ingles) sin configuracion manual.
- Procesamiento de audio de 16 kHz de cualquier duracion.
- Ejecucion offline y on-device: nativa (Mac, Android) y en navegador via WebAssembly.
- Inferencia con huella de memoria reducida (unos 64 MB en el telefono de prueba).
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion de reuniones y conversaciones en santali en entornos sin conectividad: el modelo funciona completamente offline en un telefono, lo que permite registrar actas en zonas rurales o con red limitada.
- Subtitulado y documentacion de contenido audiovisual en santali: al procesar audio de cualquier longitud y emitir Ol Chiki, sirve para generar subtitulos de videos comunitarios o educativos.
- Aplicaciones moviles de accesibilidad para hablantes de santali: integrado mediante el motor Cactus en Android, permite dictado por voz sin enviar audio a la nube, lo que reduce riesgos de privacidad.
- Digitalizacion de archivos orales y patrimonio linguistico: investigadores pueden transcribir grabaciones de campo en lotes sobre un portatil, con un modelo de 29,7 MB facil de versionar y desplegar.
- Asistentes de voz en navegador para comunidades santali: la build WebAssembly permite incrustar la transcripcion en una pagina web sin backend, util para formularios o servicios publicos.
- Manejo de habla mixta santali-ingles en contextos laborales o urbanos: el modelo conserva terminos ingleses en alfabeto latino, lo que facilita la lectura de transcripciones donde se mezclan ambos idiomas.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, %, menor es mejor), medidos el 3 de noviembre de 2026 con los mismos clips y scorer para cada modelo; Shruti Santali evaluado en su motor on-device sobre un Mac.

| Modelo | Tamano de archivo | IndicVoices valid | DiarBench, ingles en ingles | DiarBench, nativo |
|---|---|---|---|---|
| Shruti Santali | 29,7 MB | 40,3 | 33,0 | 33,6 |
| IndicConformer Santali (int8) | 137,7 MB | 42,6 | 35,4 | 34,2 |

El autor senala que IndicConformer Santali tiene menos errores de caracter en ambas pruebas (11,7 % frente a 15,88 % y 13,3 % frente a 16,88 %). Los intervalos de confianza pareados al 95 % (Shruti Santali menos el otro modelo) incluyen el 0 en IndicVoices valid (-5,29 a +0,52 por clip) y en DiarBench nativo (-3,16 a +2,03 por clip; -2,67 a +1,61 por conversacion), por lo que no se puede afirmar una ventaja. En DiarBench "ingles en ingles" el intervalo es -4,94 a +0,25 por clip y -4,60 a +0,10 por conversacion. El modelo escribe en letras latinas el 36,5 % de las 63 palabras inglesas de DiarBench, mientras que IndicConformer Santali no escribe ninguna. En LibriSpeech test-clean obtiene 5,98 (dato truncado en la informacion disponible).

## Requisitos de hardware

- VRAM/RAM estimada: alrededor de 64 MB de memoria en inferencia con el archivo `.cact` de 4 bits (medido en un Samsung Galaxy F62 de 2021).
- GPU recomendadas: no requiere GPU; esta disenado para CPU. No se especifican requisitos para ejecucion en GPU.
- Cabe en cualquier GPU de consumo e incluso en moviles de gama media; el modelo completo ocupa 29,7 MB en disco.
- Opciones de despliegue: motor Cactus (`cactus-compute` en Python, binario `cactus` de linea de comandos y build WebAssembly). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 13 veces mas rapido que tiempo real en un Samsung Galaxy F62 (2021). No se aportan cifras de latencia en otros dispositivos.
- Nota: la version fp32 en safetensors se incluye pero el autor indica que no la ha probado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | WER DiarBench nativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shruti Santali | ~56M | Audio 16 kHz de cualquier longitud | 33,6 | Apache-2.0 | Hugging Face, motor Cactus (nativo y WASM) |
| IndicConformer Santali (int8) | No disponible (archivo 137,7 MB, ~5x mayor) | No disponible | 34,2 | No disponible en la informacion | Hugging Face (ONNX) |
| Shruti Hindi (modelo base de la familia) | ~56M (misma familia) | Audio 16 kHz | No disponible | Apache-2.0 | Hugging Face, motor Cactus |

La comparativa se limita a IndicConformer Santali, unico modelo con resultados medidos en la misma prueba. La diferencia de tamano (29,7 MB frente a 137,7 MB) es el principal argumento del autor, que no reclama superioridad en precision.

## Limitaciones y advertencias

- La salida no ha sido revisada por ningun hablante nativo de santali; la calidad linguistica real esta pendiente de validacion humana.
- La prueba en ingles es muy reducida (63 palabras en DiarBench), por lo que las conclusiones sobre su rendimiento en ingles son debiles.
- IndicConformer Santali obtiene menos errores de caracter en ambas pruebas (11,7 % y 13,3 % frente a 15,88 % y 16,88 %).
- El conjunto IndicVoices valid comparte fuente con los datos de entrenamiento, lo que puede favorecer al modelo; DiarBench, externo, es la referencia mas fiable.
- Riesgo de sesgo por la composicion de los datos de entrenamiento (IndicVoices, Vaani, LibriSpeech), no documentada en detalle.
- La licencia del modelo es Apache-2.0, pero el autor remite a los terminos de los datos de entrenamiento, que pueden imponer restricciones adicionales para uso comercial.
- El paquete `cactus-compute` envia conteos de uso anonimos por defecto; es necesario definir `CACTUS_TELEMETRY=0` para desactivarlo.
- La version fp32 en safetensors no ha sido probada por el autor.
- El modelo solo cubre santali e ingles; otros idiomas requieren sus propios modelos de la familia Shruti.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/shruti-santali
- Coleccion de la familia Shruti: https://huggingface.co/collections/udgamlabs/shruti-6ad5f80d9d300685a6249c9b
- Modelo base Cactus Whistle: https://huggingface.co/Cactus-Compute/whistle
- Motor Cactus: https://huggingface.co/Cactus-Compute/cactus
- Binarios de Cactus 4.1.0: https://huggingface.co/Cactus-Compute/cactus/tree/main/releases/4.1.0
- Pagina del modelo en Udgam Labs: https://udgamlabs.com/models/shruti/santali
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Codigo y ejemplos (documentacion santali): https://github.com/udgamlabs/shruti/blob/main/docs/santali.md
- IndicConformer Santali (ONNX): https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-sat-onnx
