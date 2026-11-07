# udgamlabs/shruti-sindhi

## Resumen

Shruti Sindhi es un modelo de reconocimiento automático del habla (ASR) desarrollado por Udgam Labs, parte de la familia Shruti de modelos pequeños, uno por idioma. Con aproximadamente 56 millones de parámetros (55.722.313), transcribe audio en sindhi y en inglés, incluyendo habla mezclada sindhi-inglés, y produce la salida en escritura devanagari para el sindhi, manteniendo las palabras inglesas en caracteres latinos. El modelo se distribuye como un único archivo de 29,7 MB con pesos en 4 bits y activaciones en 8 bits, diseñado para ejecutarse en el motor Cactus needle de forma nativa y vía WebAssembly.

El modelo resuelve el problema de la transcripción de voz en sindhi en entornos sin conectividad: funciona en un teléfono, un portátil o un navegador sin servidor ni conexión a internet. Según el autor, en un Samsung Galaxy F62 de 2021 transcribe aproximadamente 11 veces más rápido que el tiempo real usando 64 MB de memoria. Está construido sobre Cactus Whistle (Apache-2.0) a través de Shruti Hindi, con todos los pesos reentrenados sobre voz sindhi e inglesa y 400 piezas de vocabulario sindhi añadidas.

Es relevante ahora porque ofrece una alternativa de despliegue local y offline para una lengua con pocos recursos como el sindhi, con un tamaño de archivo muy inferior al de modelos multilingües convencionales. El autor advierte explícitamente que no formula ninguna reclamación comparativa de superioridad: en IndicVoices valid está a la par de IndicConformer Sindhi (33,0 frente a 33,1), en un conjunto que comparte fuente con sus datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (8 capas de encoder + 8 de decoder, anchura 512) |
| Parámetros totales | Aproximadamente 56M (55.722.313) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (acepta audio de 16 kHz de cualquier longitud) |
| Tipos de cuantización | Pesos en 4 bits, activaciones en 8 bits (formato propietario del motor Cactus needle) |
| Idiomas soportados | Sindhi, inglés y sindhi mezclado con inglés |
| Licencia | Apache-2.0 (sujeta a los términos de los datos de entrenamiento) |
| Formato de pesos | `.cact` (formato del motor Cactus needle) |

## Arquitectura y entrenamiento

Shruti Sindhi es un transformer encoder-decoder con 8 capas de encoder y 8 de decoder y anchura 512, con aproximadamente 55,7 millones de parámetros. Deriva de Cactus Whistle (Apache-2.0) a través de Shruti Hindi: el autor reentrenó todos los pesos sobre voz sindhi e inglesa y añadió 400 piezas de vocabulario sindhi. La entrada es audio de 16 kHz de cualquier longitud y la salida es texto, con el sindhi en devanagari y las palabras inglesas en latín minúsculas cuando se mantienen en inglés.

Los datos de entrenamiento declarados incluyen ai4bharat/IndicVoices, ARTPARK-IISc/Vaani-transcription-part y openslr/librispeech_asr. El autor no detalla el número total de tokens ni la composición exacta del dataset, ni si hubo RLHF o DPO. La innovación técnica destacable es el formato de despliegue: pesos en 4 bits y activaciones en 8 bits en un archivo de 29,7 MB para el motor Cactus needle, con builds nativos y WebAssembly, lo que permite inferencia offline en dispositivos de consumo y en el navegador.

## Capacidades

- Reconocimiento automático del habla en sindhi, con salida en escritura devanagari.
- Reconocimiento de inglés y de habla mezclada sindhi-inglés, manteniendo las palabras inglesas en caracteres latinos cuando el modelo las conserva en inglés.
- Detección automática de idioma entre sindhi e inglés en la misma llamada de transcripción.
- Procesamiento de audio de 16 kHz de cualquier longitud.
- Ejecución offline en dispositivo (teléfono, portátil, navegador) sin servidor ni conexión a internet.
- Despliegue nativo y vía WebAssembly mediante el motor Cactus needle.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción offline en dispositivos móviles: el modelo puede transcribir notas de voz y conversaciones en sindhi directamente en el teléfono, sin conexión, gracias a su archivo de 29,7 MB y su consumo de 64 MB de memoria medido en un Galaxy F62.
- Aplicaciones web de dictado en el navegador: el build WebAssembly del motor Cactus needle permite integrar la transcripción en una página web sin backend, como demuestra la página de demostración del autor.
- Documentación de reuniones y entrevistas en sindhi: al aceptar audio de cualquier longitud, puede transcribir grabaciones completas y producir texto en devanagari para su revisión posterior.
- Subtitulado y accesibilidad para contenido en sindhi: la transcripción local permite generar subtítulos sin enviar audio a servicios en la nube, útil por privacidad y por falta de conectividad.
- Asistentes de voz embebidos en entornos con recursos limitados: su tamaño permite incluirlo en aplicaciones de escritorio o dispositivos con poca memoria, con una velocidad declarada de unas 11 veces el tiempo real en hardware móvil de 2021.
- Procesamiento de habla con mezcla de código sindhi-inglés: adecuado para conversaciones reales donde se alternan ambos idiomas, ya que detecta el idioma automáticamente y conserva las palabras inglesas en latín.
- Investigación sobre ASR de bajos recursos: sirve como punto de partida reproducible para experimentos con sindhi, con pesos y código disponibles bajo Apache-2.0.

## Benchmarks y rendimiento

Tasa de error de palabras (WER, %, menor es mejor), con las mismas grabaciones y el mismo evaluador para cada modelo; Shruti Sindhi en su motor on-device sobre un Mac. Medición del 3 de noviembre de 2026. El tamaño es el archivo tal como lo publica su autor.

| Modelo | Tamaño de archivo | IndicVoices valid | DiarBench, inglés en inglés | DiarBench, nativo |
|---|---|---|---|---|
| Shruti Sindhi | 29,7 MB | 33,0 | 34,2 | 38,0 |
| IndicConformer Sindhi (int8) | 137,7 MB | 33,1 | 38,7 | 35,8 |

El autor advierte que IndicVoices valid es el split reservado de IndicVoices, con hablantes excluidos del entrenamiento y frases bloqueadas, pero de la misma fuente que sus datos de entrenamiento, por lo que favorece al modelo. DiarBench es conversación real externa: 27 turnos de 17 conversaciones, 971 palabras de referencia, 51 de ellas en inglés, en 12 turnos. La columna "inglés en inglés" puntúa contra referencias que escriben las palabras inglesas en latín; la columna nativa puntúa contra referencias que las escriben en devanagari.

Intervalos de confianza pareados del 95 % (Shruti Sindhi menos el otro modelo, en puntos de WER; 1.000 remuestreos; un valor negativo indica menos errores de Shruti Sindhi):

- Frente a IndicConformer Sindhi: IndicVoices valid de -2,45 a +2,39 por clip; DiarBench nativo de -1,53 a +6,04 por clip, de -1,43 a +4,91 por conversación y de +1,99 a +8,99 ignorando la escritura; DiarBench inglés en inglés de -8,37 a +0,10 por clip y de -8,46 a -0,36 por conversación.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor indica 64 MB de memoria en un Samsung Galaxy F62 de 2021; el archivo de pesos ocupa 29,7 MB.
- GPU recomendadas: no disponible; el modelo está diseñado para CPU y ejecución en dispositivo, no se documentan requisitos de GPU.
- Cabe en GPU de consumo: sí, por su tamaño (56M de parámetros), aunque el motor Cactus needle está orientado a CPU nativa y WebAssembly.
- Opciones de despliegue: motor Cactus needle (nativo y WebAssembly), paquete Python `cactus-needle` y binario `needle` para línea de comandos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 11 veces más rápido que el tiempo real en un Samsung Galaxy F62 de 2021, según el autor; no se publican cifras adicionales de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER IndicVoices valid | WER DiarBench nativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Shruti Sindhi | ~56M | No disponible (audio de cualquier longitud) | 33,0 | 38,0 | Apache-2.0 | Hugging Face, motor Cactus needle |
| IndicConformer Sindhi (int8) | No disponible | No disponible | 33,1 | 35,8 | No disponible en la información proporcionada | Hugging Face (ONNX, int8) |
| Whisper-small | No disponible en la información proporcionada (el autor cita 971 MB de archivo) | No disponible | No evaluado: apenas escribe devanagari en estos conjuntos | No evaluado | No disponible en la información proporcionada | No disponible en la información proporcionada |

El autor señala que Whisper no aparece en su tabla de resultados porque apenas produce devanagari en estos conjuntos, de modo que sus tasas de error medirían la escritura y no la precisión. La comparación directa disponible se limita a IndicConformer Sindhi, con diferencias dentro o cerca del intervalo de confianza en IndicVoices valid.

## Limitaciones y advertencias

- El modelo escribe el sindhi en devanagari, no en escritura perso-árabe, por lo que los lectores de sindhi en perso-árabe no pueden usar su salida.
- El autor no formula ninguna reclamación comparativa de superioridad: en IndicVoices valid está a la par de IndicConformer Sindhi, y el conjunto comparte fuente con los datos de entrenamiento.
- La prueba de conversación DiarBench es pequeña: solo 27 turnos, 17 conversaciones y 971 palabras de referencia.
- Ningún lector nativo de sindhi ha revisado la salida del modelo, según el autor.
- Las líneas de ejemplo del autor fueron leídas por voces sintéticas de bibliotecas hindi, no por hablantes nativos de sindhi.
- Riesgo de alucinación y de errores de transcripción: no se documentan métricas específicas de sesgo ni de robustez ante ruido, acentos o dominio.
- Limitación de idioma: solo sindhi, inglés y su mezcla; otros idiomas tienen sus propios modelos Shruti.
- Licencia Apache-2.0 para el modelo, pero sujeta a los términos de los datos de entrenamiento (IndicVoices, Vaani, LibriSpeech), que el autor remite a la sección de datos.
- El paquete `cactus-needle` envía recuentos de uso anónimos por defecto; debe definirse `NEEDLE_TELEMETRY=0` para desactivarlo.
- El formato de pesos `.cact` requiere el motor Cactus needle; no hay conversión documentada a safetensors ni GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/shruti-sindhi
- Colección de la familia Shruti: https://huggingface.co/collections/udgamlabs/shruti-6ad5f80d9d300685a6249c9b
- Modelo base Cactus Whistle: https://huggingface.co/Cactus-Compute/whistle
- Motor Cactus needle: https://huggingface.co/Cactus-Compute/needle3
- Página del modelo en Udgam Labs: https://udgamlabs.com/models/shruti/sindhi
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Repositorio GitHub: https://github.com/udgamlabs/shruti
- Documentación específica de sindhi: https://github.com/udgamlabs/shruti/blob/main/docs/sindhi.md
- Página general de Shruti: https://udgamlabs.com/models/shruti
- IndicConformer Sindhi (ONNX, int8): https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-sd-onnx
- Dataset IndicVoices: https://huggingface.co/datasets/ai4bharat/IndicVoices
- Dataset Vaani transcription: https://huggingface.co/datasets/ARTPARK-IISc/Vaani-transcription-part
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
