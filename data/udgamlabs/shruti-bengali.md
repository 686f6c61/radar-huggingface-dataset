# udgamlabs/shruti-bengali

## Resumen

Shruti Bengali es un modelo de reconocimiento automático del habla (ASR) desarrollado por Udgam Labs, diseñado para transcribir voz en bengalí, inglés y, de forma destacable, conversaciones que mezclan ambos idiomas (code-switching). Con 55,9 millones de parámetros, es un modelo compacto pensado para ejecutarse íntegramente en dispositivos locales —teléfonos, portátiles y navegadores web— sin conexión a internet ni servidores externos. Forma parte de la familia Shruti, junto a las variantes de hindi, maratí y tamil.

El modelo resuelve un problema concreto: la transcripción fiable de habla bengalí cotidiana que incorpora palabras en inglés, un fenómeno muy habitual en contextos urbanos de India y Bangladés. A diferencia de modelos monolingües más grandes, Shruti Bengali mantiene las palabras inglesas en caracteres latinos y el bengalí en escritura bengalí, reproduciendo la forma en que los hablantes escriben realmente. Su peso cuantizado ocupa solo 29,7 MB, lo que lo hace viable en hardware muy limitado.

La relevancia actual del modelo radica en su eficiencia extrema: según la model card, transcribe 12,6 veces más rápido que el tiempo real en un Samsung Galaxy F62 de 2021 usando 64 MB de memoria. Está construido sobre Cactus Whistle (Apache-2.0) mediante Shruti Hindi, con todos los pesos reentrenados sobre datos de voz bengalí e inglesa con licencias abiertas, y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder (8 capas de encoder + 8 de decoder, anchura 512); base Cactus Whistle |
| Parametros totales | 55,9 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (acepta audio de cualquier longitud según la model card) |
| Tipos de cuantizacion | Pesos 4 bits y activaciones 8 bits (formato .cact); incluye archivo fp32 sin probar |
| Idiomas soportados | Bengalí (bn), inglés (en) y bengalí mezclado con inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | .cact (motor Cactus) y safetensors (fp32) |

## Arquitectura y entrenamiento

Shruti Bengali es un transformer encoder-decoder de 55,9 millones de parámetros, con 8 capas en el encoder y 8 en el decoder y una anchura de 512. Deriva de Cactus Whistle (Apache-2.0) a través de Shruti Hindi: el equipo de Udgam Labs reentrenó todos los pesos sobre voz bengalí e inglesa con licencias abiertas y añadió 700 piezas de vocabulario bengalí. El modelo consume audio a 16 kHz de cualquier duración y produce texto, con detección automática del idioma de entrada.

El entrenamiento empleó varios conjuntos de datos abiertos: ai4bharat/IndicVoices, ai4bharat/Kathbath, SPRINGLab/SPRING_INX_Bengali_R1 y R2, ARTPARK-IISc/Vaani-transcription-part y openslr/librispeech_asr. No se detallan en la información disponible el número total de tokens de audio, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica principal es la eficiencia del motor Cactus, que permite inferencia offline en WebAssembly y en dispositivos móviles con un consumo de memoria de 64 MB.

## Capacidades

- Transcripción de voz en bengalí con salida en escritura bengalí.
- Transcripción de voz en inglés con salida en caracteres latinos en minúscula.
- Reconocimiento de habla con code-switching bengalí-inglés, manteniendo cada idioma en su escritura correspondiente.
- Detección automática del idioma de entrada.
- Procesamiento de audio de cualquier longitud a 16 kHz.
- Ejecución completamente offline en macOS, Linux, Windows, Android, iOS y WebAssembly.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de salida.

## Casos de uso

- Transcripción de reuniones y conversaciones informales en bengalí con términos técnicos en inglés: el modelo mantiene "rehearsal" o "derby" en caracteres latinos, lo que facilita la lectura a hablantes bilingües y evita transliteraciones erróneas.
- Subtitulado en directo en dispositivos móviles: al transcribir 12,6 veces más rápido que el tiempo real en un Galaxy F62, puede generar subtítulos en tiempo real sin conexión, útil en entornos con conectividad limitada.
- Aplicaciones web de dictado sin servidor: mediante el build WebAssembly del motor Cactus, se puede integrar la transcripción en una página web que procesa el audio localmente, sin enviar datos a la nube.
- Atención al cliente en centros de llamadas bengalíes: la transcripción offline permite registrar conversaciones y generar actas sin depender de infraestructura cloud, reduciendo costes y cumpliendo requisitos de privacidad.
- Herramientas de accesibilidad para personas con discapacidad auditiva: la transcripción en tiempo real en el propio dispositivo permite mostrar el texto de una conversación sin latencia de red.
- Digitalización de archivos orales y entrevistas: el modelo acepta audio de cualquier duración y puede procesar grabaciones históricas en bengalí para su indexación y búsqueda textual.
- Asistentes de voz embebidos en aplicaciones Android o iOS: con solo 29,7 MB de peso y 64 MB de memoria, cabe en aplicaciones móviles sin penalizar el tamaño de la app.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, %, menor es mejor), 200 clips por conjunto, mismos clips y evaluador para todos los modelos; Shruti Bengali evaluado en su motor on-device sobre un Mac. Medición del 2 de noviembre de 2026.

| Modelo | Tamano | FLEURS (lectura) | Kathbath test-unknown (lectura) | DiarBench, ingles en ingles (conversacion) | DiarBench, referencia nativa |
|---|---|---|---|---|---|
| Shruti Bengali | 29,7 MB | 29,9 | 22,2 | 36,0 | 41,8 |
| Whisper tiny | 43,5 MB | 361,6 | 403,7 | 540,9 | 543,2 |
| Whisper base | 81,8 MB | 176,7 | 214,5 | 339,9 | 341,6 |
| Vosk Bengali int8 | 28,6 MB | 20,9 | 22,4 | 43,3 | 39,1 |
| Vosk Bengali (Zipformer) | 90,0 MB | 20,8 | 21,65 | 42,8 | 38,5 |
| Dolphin base (int8) | 103,7 MB | 41,1 | 45,9 | 93,0 | 93,2 |
| IndicConformer Bengali (int8) | 137,7 MB | 20,65 | 12,07 | 39,3 | 34,8 |
| Dolphin small (int8) | 249,7 MB | 40,3 | 33,6 | 99,4 | 99,4 |
| Whisper small | 264,5 MB | 184,3 | 173,2 | 167,1 | 167,9 |
| SraVaani-1.0 | 908,8 MB | 1,... (dato truncado en la informacion disponible) | No disponible | No disponible | No disponible |

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo consume 64 MB de memoria en inferencia según la model card.
- GPU recomendadas: no requiere GPU; está diseñado para CPU y ejecución on-device.
- Cabe en cualquier GPU de consumo y en dispositivos móviles; el ejemplo documentado es un Samsung Galaxy F62 de 2021.
- Opciones de despliegue: motor Cactus (macOS, Linux, Windows, Android, iOS, WebAssembly), paquete Python `cactus-compute`, binario `cactus` de línea de comandos y build WebAssembly para navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 12,6 veces más rápido que el tiempo real en un Galaxy F62, con 64 MB de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER FLEURS | WER DiarBench (ingles en ingles) | Licencia | Tamano |
|---|---|---|---|---|---|---|
| Shruti Bengali | 55,9 M | Audio de cualquier longitud | 29,9 | 36,0 | Apache-2.0 | 29,7 MB |
| Vosk Bengali (Zipformer) | No disponible | No disponible | 20,8 | 42,8 | No disponible en la informacion | 90,0 MB |
| IndicConformer Bengali | No disponible | No disponible | 20,65 | 39,3 | No disponible en la informacion | 137,7 MB |
| Whisper base | 74 M (aprox., no confirmado en la informacion) | No disponible | 176,7 | 339,9 | MIT (no confirmado en la informacion) | 81,8 MB |

Shruti Bengali es el más pequeño de la comparativa y el mejor en conversación con code-switching (DiarBench con inglés en inglés), aunque Vosk e IndicConformer obtienen mejor WER en lectura pura de bengalí. Su ventaja principal es el tamano y la ejecucion offline multiplataforma.

## Limitaciones y advertencias

- En lectura de bengalí puro, Vosk Bengali e IndicConformer Bengali son más precisos (WER de 20,8 y 20,65 frente a 29,9 en FLEURS), por lo que Shruti Bengali no es la mejor opción para transcripción de texto leído.
- Puede escribir palabras inglesas en escritura bengalí en lugar de caracteres latinos; la model card documenta el caso de "derby" y "goal" transcritos en bengalí.
- Se observan diferencias ortográficas menores en bengalí (por ejemplo, রবীন্দ্রসঙ্গীতের frente a রবীন্দ্রসংগীতের).
- El archivo fp32 en safetensors se incluye pero no ha sido probado por el equipo.
- El paquete `cactus-compute` envía recuentos de uso anónimos por defecto; debe configurarse `CACTUS_TELEMETRY=0` para desactivarlo.
- No se documentan sesgos específicos, riesgos de alucinación ni restricciones de licencia para uso comercial más allá de la licencia Apache-2.0.
- No se dispone de información sobre el rendimiento en otros idiomas distintos del bengalí y el inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/shruti-bengali
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Prueba en navegador: https://udgamlabs.com/models/shruti?lang=bn
- Codigo y ejemplos (GitHub): https://github.com/udgamlabs/shruti/blob/main/docs/bengali.md
- Shruti Hindi: https://huggingface.co/udgamlabs/Shruti
- Shruti Marathi: https://huggingface.co/udgamlabs/shruti-marathi
- Shruti Tamil: https://huggingface.co/udgamlabs/shruti-tamil
- Cactus Whistle (modelo base): https://huggingface.co/Cactus-Compute/whistle
- Motor Cactus: https://huggingface.co/Cactus-Compute/cactus
- Binarios Cactus 4.1.0: https://huggingface.co/Cactus-Compute/cactus/tree/main/releases/4.1.0
