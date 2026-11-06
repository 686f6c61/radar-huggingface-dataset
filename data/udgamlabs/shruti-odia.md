# udgamlabs/shruti-odia

## Resumen

Shruti Odia es un modelo de reconocimiento automático del habla (ASR) desarrollado por Udgam Labs, diseñado específicamente para transcribir audio en odia e inglés, incluyendo conversaciones que mezclan ambos idiomas (code-switching). El modelo forma parte de la familia Shruti y se construye sobre Cactus Whistle (Apache-2.0) mediante un reentrenamiento completo de los pesos con datos de habla en odia e inglés de licencia abierta. Con aproximadamente 56 millones de parámetros y un archivo de solo 29,7 MB en cuantización de 4 bits, el modelo está pensado para inferencia en dispositivo (on-device), sin conexión y con despliegue nativo o vía WebAssembly.

La relevancia de Shruti Odia radica en su enfoque en un caso de uso muy concreto y poco cubierto: la transcripción de odia con inserción natural de palabras en inglés, manteniendo el inglés en caracteres latinos y el odia en escritura odia, tal como los hablantes bilingües escriben realmente. Según la model card, en conversaciones que mezclan inglés supera en precisión a modelos mucho más grandes, como SraVaani-1.0 (unas 31 veces mayor) e IndicConformer Odia (casi cinco veces mayor), aunque estos últimos son más precisos en odia leído y en referencias sin palabras inglesas.

El modelo se distribuye con licencia Apache-2.0, soporta entrada de audio de 16 kHz de cualquier duración y está disponible a través del motor Cactus needle, con soporte para Python, línea de comandos y navegador web. Su tamaño reducido y su arquitectura encoder-decoder de 8+8 capas lo hacen adecuado para aplicaciones móviles, web y entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder de 8 capas de encoder y 8 de decoder, anchura 512 (transformer) |
| Parametros totales | Aproximadamente 56M (55.875.913) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Audio de 16 kHz de cualquier duración (sin límite de contexto especificado) |
| Tipos de cuantizacion | Pesos en 4 bits, activaciones en 8 bits (formato .cact) |
| Idiomas soportados | Odia (or), inglés (en) y odia mezclado con inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | .cact (motor Cactus needle); no se distribuyen safetensors ni GGUF |
| Tamano del archivo | 29,7 MB (4-bit weights, 8-bit activations) |
| Entrada / salida | Audio 16 kHz de cualquier duración → texto; odia en escritura odia, inglés en minúsculas latinas |
| Runtime | Cactus needle (Apache-2.0), nativo y WebAssembly |
| Modelo base | Shruti Hindi (Udgam Labs), construido sobre Cactus Whistle (Cactus Compute) |

## Arquitectura y entrenamiento

Shruti Odia es un transformer encoder-decoder con 8 capas en el encoder y 8 en el decoder, con una anchura de 512 y aproximadamente 56 millones de parámetros. Se construye sobre Cactus Whistle (Apache-2.0) a través de Shruti Hindi: los autores reentrenaron todos los pesos con datos de habla en odia e inglés de licencia abierta y añadieron 700 piezas de vocabulario específicas del odia. El modelo se distribuye en un formato propietario del motor Cactus needle (.cact) con pesos cuantizados a 4 bits y activaciones a 8 bits, lo que reduce el archivo a 29,7 MB.

Los datos de entrenamiento provienen de varios conjuntos de datos abiertos: ai4bharat/IndicVoices, ai4bharat/Kathbath, SPRINGLab/SPRING_INX_Odia_R1, ARTPARK-IISc/Vaani-transcription-part y openslr/librispeech_asr. No se especifica en la información disponible el número total de tokens ni la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. La innovación principal es la optimización para inferencia en dispositivo con un tamaño muy reducido y soporte para code-switching odia-inglés con salida en escritura mixta.

## Capacidades

- Transcripción de voz a texto en odia, con salida en escritura odia.
- Transcripción de inglés, con salida en caracteres latinos en minúsculas.
- Manejo de code-switching odia-inglés: las palabras inglesas se mantienen en inglés y las odia en escritura odia, reflejando la forma natural de escribir de hablantes bilingües.
- Detección automática del idioma de entrada (odia o inglés).
- Procesamiento de audio de 16 kHz de cualquier duración.
- Inferencia en dispositivo (on-device) sin conexión a internet.
- Despliegue nativo y en navegador mediante WebAssembly.
- No se mencionan capacidades de tool calling, agentes, visión, audio de entrada más allá de ASR, ni modo de razonamiento (thinking mode).

## Casos de uso

- Transcripción de conversaciones bilingües odia-inglés en atención al cliente: el modelo mantiene las palabras inglesas en inglés y el odia en escritura odia, lo que facilita la revisión humana y el análisis posterior de conversaciones reales de soporte.
- Subtitulado y actas de reuniones en odia con términos técnicos en inglés: adecuado para entornos empresariales donde se mezclan ambos idiomas, con inferencia local que evita enviar audio a servidores externos.
- Aplicaciones móviles de dictado y notas de voz: el archivo de 29,7 MB y el uso de 64 MB de memoria en un Samsung Galaxy F62 (2021) permiten integrarlo en apps Android sin depender de la nube.
- Transcripción en navegador mediante WebAssembly: útil para herramientas web de accesibilidad o edición de audio que necesitan procesar voz en odia sin backend, como la demo disponible en udgamlabs.com.
- Digitalización de archivos orales y entrevistas en odia: el modelo puede transcribir audio de cualquier duración en local, lo que facilita la creación de corpus y la preservación de contenido oral.
- Asistentes de voz sin conexión para hablantes de odia: al funcionar offline y en dispositivo, es adecuado para entornos con conectividad limitada o requisitos de privacidad, como aplicaciones de campo o kioscos.
- Herramientas de aprendizaje de idiomas: permite a estudiantes de odia o inglés practicar la transcripción de audio mixto y comparar su pronunciación con la salida del modelo.

## Benchmarks y rendimiento

Los resultados publicados en la model card miden la tasa de error de palabras (WER, %, menor es mejor) con los mismos clips y el mismo evaluador para todos los modelos. Shruti Odia se evaluó en su motor on-device sobre un Mac. FLEURS y Kathbath tienen 200 clips cada uno; DiarBench, 196 turnos.

| Modelo | Tamano de archivo | FLEURS (leido) | Kathbath test-unknown (leido) | DiarBench, ingles en ingles (conversacion, held out) | DiarBench, referencia nativa |
|---|---|---|---|---|---|
| **Shruti Odia** | **29,7 MB** | 39,5 | 32,5 | **36,2** | 49,2 |
| Dolphin base (int8) | 103,7 MB | 68,1 | 52,7 | 97,5 | 99,4 |
| IndicConformer Odia (int8) | 137,7 MB | 25,9 | **21,1** | 49,9 | 40,7 |
| Dolphin small (int8) | 249,7 MB | 71,1 | 40,4 | 99,9 | 99,9 |
| SraVaani-1.0 | 908,8 MB | **22,1** | 21,4 | 43,4 | **34,9** |

DiarBench es conversación real que mezcla inglés: 196 turnos de 37 conversaciones, 5.859 palabras de referencia, de las cuales 1.459 son inglesas. La columna "English in English" puntúa contra referencias que escriben las palabras inglesas en inglés (latín), como hace Shruti Odia; la columna nativa elimina las palabras inglesas de la referencia. FLEURS y Kathbath son odia leído. Whisper no aparece en la tabla porque su lista de idiomas no incluye odia.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica VRAM; el modelo usa 64 MB de memoria en un Samsung Galaxy F62 (2021) según la model card.
- GPU recomendadas: no se indican GPU concretas; el modelo está optimizado para CPU y dispositivos móviles mediante el motor Cactus needle.
- Cabe en GPU consumer: sí, por su tamaño (29,7 MB) y su consumo de memoria (64 MB), aunque no se detallan requisitos de GPU.
- Opciones de despliegue: motor Cactus needle (nativo y WebAssembly), paquete Python `cactus-needle`, binario `needle` para línea de comandos y build WASM para navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en un Samsung Galaxy F62 (2021) transcribe 10,3 veces más rápido que tiempo real usando 64 MB de memoria. No se proporcionan cifras de latencia para otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER DiarBench (ingles en ingles) | WER FLEURS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Shruti Odia | ~56M | Audio de cualquier duración | 36,2 | 39,5 | Apache-2.0 | Hugging Face, motor Cactus needle |
| IndicConformer Odia | No disponible (archivo int8 de 137,7 MB) | No disponible | 49,9 | 25,9 | No disponible en la informacion | Hugging Face (ONNX int8) |
| SraVaani-1.0 | No disponible (archivo de 908,8 MB) | No disponible | 43,4 | 22,1 | No disponible en la informacion | Hugging Face |
| Dolphin base | No disponible (archivo int8 de 103,7 MB) | No disponible | 97,5 | 68,1 | No disponible en la informacion | Hugging Face |

Shruti Odia destaca en conversación con code-switching (DiarBench, inglés en inglés) con 36,2 de WER, frente a 43,4 de SraVaani-1.0 y 49,9 de IndicConformer Odia, pese a ser mucho más pequeño. En odia leído (FLEURS y Kathbath), IndicConformer Odia y SraVaani-1.0 obtienen mejores resultados. No se dispone de datos de parámetros totales ni de licencia de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- En odia leído (FLEURS y Kathbath), modelos más grandes como IndicConformer Odia y SraVaani-1.0 son más precisos; Shruti Odia no es el mejor en ese escenario.
- En DiarBench con referencia nativa (sin palabras inglesas), SraVaani-1.0 e IndicConformer Odia obtienen mejor WER que Shruti Odia (34,9 y 40,7 frente a 49,2).
- La model card muestra errores reales en palabras como "Cyclone" transcrito como ସାଇଟ୍ରୋନର y "ମହମବତୀ" como ମହମ୍ମଦୀ, lo que indica riesgo de errores en términos poco frecuentes o préstamos.
- El modelo solo soporta odia e inglés; para otros idiomas indios existen otros miembros de la familia Shruti.
- El formato de pesos es .cact, propietario del motor Cactus needle; no se distribuyen safetensors ni GGUF, lo que limita su uso con otras herramientas de inferencia.
- El paquete `cactus-needle` envía recuentos de uso anónimos por defecto; se debe establecer `NEEDLE_TELEMETRY=0` para desactivarlo.
- No se dispone de información sobre sesgos específicos, datos de entrenamiento detallados ni evaluaciones de robustez más allá de los benchmarks publicados.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de las licencias de los datasets de entrenamiento citados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/udgamlabs/shruti-odia)
- [Demo en Hugging Face Spaces](https://huggingface.co/spaces/udgamlabs/Shruti)
- [Prueba en navegador (Udgam Labs)](https://udgamlabs.com/models/shruti/odia)
- [Codigo y ejemplos en GitHub](https://github.com/udgamlabs/shruti/blob/main/docs/odia.md)
- [Shruti Hindi](https://huggingface.co/udgamlabs/Shruti)
- [Shruti Marathi](https://huggingface.co/udgamlabs/shruti-marathi)
- [Shruti Tamil](https://huggingface.co/udgamlabs/shruti-tamil)
- [Shruti Bengali](https://huggingface.co/udgamlabs/shruti-bengali)
- [Shruti Telugu](https://huggingface.co/udgamlabs/shruti-telugu)
- [Shruti Gujarati](https://huggingface.co/udgamlabs/shruti-gujarati)
- [Cactus Whistle](https://huggingface.co/Cactus-Compute/whistle)
- [Cactus needle3](https://huggingface.co/Cactus-Compute/needle3)
- [Dolphin base](https://huggingface.co/DataoceanAI/dolphin-base)
- [Dolphin small](https://huggingface.co/DataoceanAI/dolphin-small)
- [IndicConformer Odia (ONNX)](https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-or-onnx)
- [SraVaani-1.0](https://huggingface.co/ARTPARK-IISc/SraVaani-1.0)
