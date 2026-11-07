# udgamlabs/shruti-santali

## Resumen

Shruti Santali es un modelo de reconocimiento automático del habla (ASR) desarrollado por Udgam Labs, un laboratorio de investigación en IA centrado en modelos pequeños que se ejecutan en dispositivo. El modelo transcribe audio de 16 kHz de cualquier duración a texto en santali (escritura ol chiki) y en inglés, incluyendo habla con mezcla de código (code-switching) entre ambos idiomas. Forma parte de la familia Shruti, que ofrece un modelo pequeño por idioma, y deriva de Shruti Hindi, que a su vez se construye sobre Cactus Whistle (Apache-2.0) de Cactus Compute.

La relevancia del modelo radica en su tamaño y su modo de despliegue: con aproximadamente 56 millones de parámetros y un archivo de pesos de 29,7 MB en cuantización de 4 bits, se ejecuta sin servidor y sin conexión a internet en un teléfono, un portátil o directamente en el navegador mediante WebAssembly. Según el autor, en un Samsung Galaxy F62 de 2021 transcribe unas 13 veces más rápido que el tiempo real usando 64 MB de memoria, lo que lo sitúa en la categoría de ASR verdaderamente en dispositivo para una lengua de bajos recursos como el santali.

El modelo se distribuye bajo licencia Apache-2.0 y se ha entrenado sobre datos de IndicVoices, Vaani y LibriSpeech. Sus resultados publicados lo comparan con IndicConformer Santali, un modelo casi cinco veces mayor, sin diferencias claras en las dos pruebas realizadas, aunque con una tasa de error de caracteres algo superior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (8 capas de encoder + 8 de decoder, anchura 512), derivado de Cactus Whistle |
| Parámetros totales | Aproximadamente 56M (55.875.913) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (acepta audio de cualquier longitud) |
| Tipos de cuantización | Pesos en 4 bits, activaciones en 8 bits (formato `.cact`) |
| Idiomas soportados | Santali (ol chiki), inglés y santali mezclado con inglés |
| Licencia | Apache-2.0 (modelo); condiciones de los datos de entrenamiento según la sección de datos del autor |
| Formato de pesos | `.cact` (motor Cactus needle); también `config.json` |
| Entrada / salida | Audio 16 kHz de cualquier duración → texto |
| Runtime | Cactus needle (nativo y WebAssembly) |
| Tamaño del archivo | 29,7 MB |

## Arquitectura y entrenamiento

Shruti Santali es un transformer encoder-decoder de 8 capas en cada bloque y anchura 512, con unos 56 millones de parámetros. Se construye sobre Cactus Whistle (Apache-2.0) a través de Shruti Hindi: el autor indica que reentrenó todos los pesos sobre habla en santali e inglés y añadió 700 piezas de vocabulario específicas del santali. El modelo opera sobre audio de 16 kHz y genera texto en ol chiki para el santali, manteniendo en alfabeto latino en minúsculas las palabras inglesas que conserva en inglés.

Los datos de entrenamiento declarados incluyen IndicVoices (ai4bharat), Vaani-transcription-part (ARTPARK-IISc) y LibriSpeech (OpenSLR). No se especifican en la información disponible el número total de tokens ni la composición detallada del dataset, ni si hubo etapas de RLHF o DPO. La innovación técnica principal es la eficiencia: un modelo de 56M parámetros cuantizado a 4 bits que cabe en 29,7 MB y se ejecuta en el motor Cactus needle, con implementaciones nativas y WebAssembly, lo que permite inferencia local en navegador y en dispositivos móviles sin conexión.

## Capacidades

- Reconocimiento automático del habla en santali, con salida en escritura ol chiki.
- Reconocimiento de inglés y de habla con mezcla de código santali-inglés, con detección automática del idioma.
- Salida de palabras inglesas en alfabeto latino en minúsculas cuando el modelo las mantiene en inglés.
- Procesamiento de audio de 16 kHz de cualquier duración.
- Inferencia totalmente en dispositivo, sin servidor ni conexión a internet.
- Ejecución en teléfono, portátil y navegador mediante WebAssembly.
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo puramente ASR.

## Casos de uso

- Transcripción de conversaciones en santali en dispositivos móviles sin conectividad: el modelo se ejecuta en el propio teléfono con 64 MB de memoria, adecuado para zonas rurales o entornos con red limitada.
- Subtitulado y documentación de audio en ol chiki: permite generar transcripciones de entrevistas, grabaciones comunitarias o material educativo en santali sin depender de servicios en la nube.
- Aplicaciones web de dictado en navegador: al compilarse a WebAssembly, puede integrarse en una página web para transcribir audio localmente, como demuestra la demo de udgamlabs.com.
- Procesamiento de habla con mezcla de código santali-inglés: útil en contextos laborales o urbanos donde los hablantes alternan entre santali e inglés, con detección automática del idioma.
- Herramientas de accesibilidad y preservación lingüística: transcripción offline de material oral en una lengua de bajos recursos, con salida en su escritura propia.
- Integración en pipelines de transcripción por lotes en hardware modesto: el bajo consumo de memoria y la velocidad (unas 13 veces el tiempo real en un Galaxy F62) permiten procesar archivos largos en portátiles convencionales.
- Transcripción de audio en inglés como capacidad secundaria: el modelo también transcribe inglés (LibriSpeech test-clean 5,98 de WER), lo que permite un único archivo para dos idiomas.

## Benchmarks y rendimiento

Tasa de error de palabras (WER, %, menor es mejor). Misma muestra y mismo evaluador para todos los modelos; Shruti Santali medido en su motor en dispositivo sobre un Mac el 3 de noviembre de 2026.

| Modelo | Tamaño de archivo | IndicVoices valid | DiarBench, inglés en inglés | DiarBench, nativo |
|---|---|---|---|---|
| Shruti Santali | 29,7 MB | 40,3 | 33,0 | 33,6 |
| IndicConformer Santali (int8) | 137,7 MB | 42,6 | 35,4 | 34,2 |

Datos adicionales aportados por el autor:

- Intervalos de confianza pareados al 95 % (Shruti Santali menos IndicConformer Santali, en puntos de WER): IndicVoices valid de -5,29 a +0,52 por clip; DiarBench nativo de -3,16 a +2,03 por clip y de -2,67 a +1,61 por conversación; DiarBench inglés en inglés de -4,94 a +0,25 por clip y de -4,60 a +0,10 por conversación. Todos los intervalos incluyen 0.
- Tasa de error de caracteres: IndicConformer Santali tiene menos errores en ambas pruebas (11,7 % frente a 15,88 %; 13,3 % frente a 16,88 %).
- Palabras inglesas en letras latinas: 36,5 % de las 63 palabras inglesas de DiarBench en 99 turnos; IndicConformer Santali no escribe ninguna.
- LibriSpeech test-clean: 5,98 (Shruti Hindi: 5,95).
- Silencio: 0 palabras inventadas en 100 clips silenciosos.
- DiarBench: 99 turnos de 28 conversaciones, 2.897 palabras de referencia, 63 de ellas en inglés, en 34 turnos.

## Requisitos de hardware

- VRAM/memoria estimada: 64 MB de memoria en el dispositivo según la medición del autor en un Samsung Galaxy F62; el archivo de pesos ocupa 29,7 MB.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU y ejecución en dispositivo, no para GPU de datacenter.
- Compatibilidad con GPU de consumo: no aplica como requisito; funciona en teléfonos, portátiles y navegador.
- Opciones de despliegue: motor Cactus needle (nativo y WebAssembly), paquete Python `cactus-needle`, binario `needle` por plataforma y build `wasm/` para navegador. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 13 veces más rápido que el tiempo real en un Samsung Galaxy F62 de 2021; no se publican más cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Contexto | WER IndicVoices valid | WER DiarBench nativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Shruti Santali | ~56M | 29,7 MB | No disponible (audio de cualquier duración) | 40,3 | 33,6 | Apache-2.0 | Hugging Face, GitHub, demo web |
| IndicConformer Santali (int8) | No disponible (casi 5 veces mayor según el autor) | 137,7 MB | No disponible | 42,6 | 34,2 | No disponible en la información | Hugging Face (OpenVoiceOS/ai4bharat-indicconformer-sat-onnx) |
| Shruti Hindi | No disponible | 29,5 MB (según el repositorio GitHub) | No disponible | No disponible | No disponible | Apache-2.0 | Hugging Face, GitHub |

## Limitaciones y advertencias

- El autor advierte que IndicVoices valid procede de la misma fuente que los datos de entrenamiento, aunque con hablantes y frases separados, por lo que favorece al modelo.
- La prueba de inglés es muy reducida: solo 63 palabras inglesas en 99 turnos de DiarBench.
- Ningún hablante nativo de santali ha revisado las salidas del modelo; el ejemplo de la model card procede de una voz sintética, no de habla real.
- Mayor tasa de error de caracteres que IndicConformer Santali en ambas pruebas (15,88 % frente a 11,7 % y 16,88 % frente a 13,3 %).
- Los intervalos de confianza pareados incluyen 0 en todas las comparaciones, por lo que no hay evidencia de superioridad frente a IndicConformer Santali.
- Solo cubre santali e inglés; otros idiomas requieren sus propios modelos Shruti.
- Riesgo de alucinación no cuantificado más allá de la prueba de silencio (0 palabras inventadas en 100 clips); no se documentan sesgos conocidos.
- La licencia del modelo es Apache-2.0, pero el autor remite a las condiciones de los datos de entrenamiento para su uso.
- El paquete `cactus-needle` envía recuentos de uso anónimos por defecto; debe desactivarse con `NEEDLE_TELEMETRY=0`.
- No se documentan resultados de benchmarks estándar de ASR más allá de los indicados, ni soporte para tool calling o agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/shruti-santali
- Colección de la familia Shruti: https://huggingface.co/collections/udgamlabs/shruti-6ad5f80d9d300685a6249c9b
- Modelo base Shruti Hindi: https://huggingface.co/udgamlabs/Shruti
- Cactus Whistle: https://huggingface.co/Cactus-Compute/whistle
- Motor Cactus needle: https://huggingface.co/Cactus-Compute/needle3
- Demo en Hugging Face: https://huggingface.co/spaces/udgamlabs/Shruti
- Código y ejemplos: https://github.com/udgamlabs/shruti
- Documentación específica de santali: https://github.com/udgamlabs/shruti/blob/main/docs/santali.md
- Página del modelo en Udgam Labs: https://udgamlabs.com/models/shruti/santali
- Sitio de Udgam Labs: https://udgamlabs.com/
- IndicConformer Santali (ONNX int8): https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-sat-onnx
