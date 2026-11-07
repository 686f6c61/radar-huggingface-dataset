# udgamlabs/shruti-nepali

## Resumen

Shruti Nepali es un modelo de reconocimiento automático del habla (ASR) desarrollado por Udgam Labs, un laboratorio que publica modelos de voz pequeños y offline, uno por idioma, bajo licencia Apache-2.0. Este modelo concreto transcribe nepalí y inglés, incluyendo habla mezclada de ambos idiomas (code-switching), y devuelve el nepalí en escritura devanagari manteniendo las palabras inglesas en caracteres latinos. Con unos 56 millones de parámetros y un archivo de 29,7 MB en cuantización de 4 bits, está diseñado para ejecutarse íntegramente en el dispositivo, sin servidor ni conexión a internet.

El modelo se construye sobre Cactus Whistle (Apache-2.0) a través de Shruti Hindi: Udgam Labs reentrenó todos los pesos con voz en nepalí e inglés y añadió 400 piezas de vocabulario nepalí. La arquitectura es un encoder-decoder de 8 capas por lado con anchura 512, y se distribuye en formato `.cact` para el motor Cactus needle, disponible tanto de forma nativa como en WebAssembly. Según el autor, en un Samsung Galaxy F62 de 2021 transcribe unas 10 veces más rápido que el tiempo real usando 64 MB de memoria.

Su relevancia radica en la combinación de tamaño mínimo, funcionamiento offline y soporte de code-switching nepalí-inglés, un escenario muy común en Nepal pero poco cubierto por los modelos ASR multilingües convencionales. El propio autor advierte que no supera a IndicConformer Nepali en precisión sobre habla leída y que la salida aún no ha sido revisada por hablantes nativos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder (transformer), 8 capas de encoder + 8 de decoder, anchura 512 |
| Parámetros totales | ~56M (55.722.313) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (acepta audio de cualquier duración según el autor) |
| Tipos de cuantización | Pesos de 4 bits, activaciones de 8 bits (formato `.cact` del motor Cactus needle) |
| Idiomas soportados | Nepalí (ne), inglés (en) y nepalí mezclado con inglés |
| Licencia | Apache-2.0 (sujeta a los términos de los datos de entrenamiento) |
| Formato de pesos | `.cact` (29,7 MB), para el motor Cactus needle nativo y WebAssembly |

## Arquitectura y entrenamiento

Shruti Nepali es un transformer encoder-decoder de tamaño reducido: 8 capas de encoder y 8 de decoder con anchura 512, lo que suma aproximadamente 55,7 millones de parámetros. Deriva de Shruti Hindi, que a su vez se construye sobre Cactus Whistle (Cactus Compute, Apache-2.0). Udgam Labs reentrenó la totalidad de los pesos con voz en nepalí e inglés y amplió el vocabulario con 400 piezas específicas de nepalí. La entrada es audio a 16 kHz de cualquier duración y la salida es texto, con el nepalí en devanagari y las palabras inglesas en minúsculas latinas cuando el modelo las mantiene en inglés.

Los datos de entrenamiento declarados son ai4bharat/IndicVoices, ARTPARK-IISc/Vaani-transcription-part y openslr/librispeech_asr. No se especifica en la información disponible el número total de horas ni de tokens, ni si hubo etapas de ajuste con RLHF o DPO. La innovación principal no está en la arquitectura sino en el empaquetado: cuantización a 4 bits de pesos y 8 bits de activaciones en un único archivo de 29,7 MB ejecutable por el motor Cactus needle en nativo y en WebAssembly, lo que permite inferencia completamente offline en teléfonos, portátiles y navegadores.

## Capacidades

- Transcripción de voz a texto en nepalí, con salida en escritura devanagari.
- Transcripción de inglés y de habla mixta nepalí-inglés (code-switching), conservando las palabras inglesas en caracteres latinos.
- Detección automática de idioma, con la posibilidad de fijar el idioma manualmente mediante `language="ne"` o `--audio-language ne`.
- Entrada de audio a 16 kHz de cualquier duración.
- Ejecución completamente offline y en el dispositivo, sin servidor ni conexión a internet.
- Despliegue nativo (binario `needle`) y en navegador mediante WebAssembly.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Subtitulado offline en dispositivos móviles: el modelo transcribe audio de 16 kHz de cualquier duración en un archivo de 29,7 MB, por lo que puede integrarse en aplicaciones Android o iOS que generen subtítulos sin conexión, útil en zonas de Nepal con conectividad limitada.
- Transcripción de conversaciones con code-switching: al mantener el inglés en caracteres latinos y el nepalí en devanagari, es adecuado para reuniones, entrevistas o atención al cliente donde los hablantes alternan ambos idiomas, un patrón habitual en el contexto nepalí.
- Dictado y notas de voz en el navegador: la build WebAssembly del motor Cactus needle permite ejecutar el modelo dentro de una página web, de modo que una aplicación de notas puede transcribir directamente en el cliente sin enviar audio a un servidor.
- Procesamiento por lotes en portátiles: con 64 MB de memoria y unas 10 veces el tiempo real en un Galaxy F62 de 2021, puede transcribir archivos de audio en un portátil modesto para tareas de archivado, investigación o periodismo.
- Asistentes de voz locales para kioscos o terminales: al no requerir red, encaja en terminales de autoservicio o dispositivos empotrados donde la privacidad del audio y la ausencia de conectividad son requisitos.
- Preprocesado de corpus de voz nepalí: puede usarse para generar transcripciones preliminares de grabaciones que luego se revisen manualmente, dado que el autor advierte que la salida aún no ha sido validada por lectores nativos.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, %, menor es mejor), con las mismas muestras y el mismo evaluador para todos los modelos; Shruti Nepali medido en su motor on-device sobre un Mac el 3 de noviembre de 2026. El tamaño es el del archivo publicado por cada fabricante (whisper.cpp q8_0 para Whisper).

| Modelo | Tamaño | FLEURS (leído) | IndicVoices valid | DiarBench, inglés en inglés | DiarBench, nativo |
|---|---|---|---|---|---|
| Shruti Nepali | 29,7 MB | 46,0 | 27,1 | 34,0 | 40,5 |
| Whisper tiny | 43,5 MB | 270,5 | 488,6 | 308,4 | 310,5 |
| Whisper base | 81,8 MB | 200,4 | 371,4 | 287,2 | 288,3 |
| IndicConformer Nepali (int8) | 137,7 MB | 29,9 | 18,4 | 37,4 | 28,6 |
| Whisper small | 264,5 MB | 126,7 | 226,5 | 238,0 | 237,6 |

Según el autor, fijar el idioma en nepalí mejora el resultado en FLEURS de 46,0 a 42,2; sin fijarlo, el motor envió 20 de 200 clips de FLEURS íntegramente a letras inglesas, y con nepalí fijado ninguno lo hizo. IndicVoices valid es la partición reservada de IndicVoices, con hablantes excluidos del entrenamiento y frases bloqueadas, pero de la misma fuente que los datos de entrenamiento, por lo que favorece al modelo. DiarBench consta de 45 turnos de 19 conversaciones, 874 palabras de referencia, 118 de ellas en inglés.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el autor reporta 64 MB de memoria en uso sobre un teléfono Android.
- GPU recomendadas: no se requieren GPU; el modelo está pensado para CPU en teléfonos, portátiles y navegadores.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU dedicada, dado su tamaño de 29,7 MB y su cuantización a 4 bits.
- Opciones de despliegue: motor Cactus needle nativo (binario `needle`), paquete Python `cactus-needle` (`from needle import Whistle`) y build WebAssembly para navegador. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 10 veces más rápido que el tiempo real en un Samsung Galaxy F62 de 2021, según el autor; no se publican cifras de latencia por clip ni de throughput en otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | FLEURS (WER) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shruti Nepali | ~56M | audio de cualquier duración | 46,0 | Apache-2.0 | Hugging Face, motor Cactus needle nativo y WASM |
| IndicConformer Nepali | no disponible | no disponible | 29,9 | no disponible en la información | Hugging Face (ONNX int8) |
| Whisper tiny | 39M | 30 s por ventana | 270,5 | MIT (según el modelo original de OpenAI) | Hugging Face, whisper.cpp |
| Whisper base | 74M | 30 s por ventana | 200,4 | MIT (según el modelo original de OpenAI) | Hugging Face, whisper.cpp |

IndicConformer Nepali es más preciso en habla leída y en IndicVoices valid, pero ocupa 137,7 MB frente a 29,7 MB y no se documenta en la información disponible su ejecución offline en navegador. Los modelos Whisper son mucho menos precisos en nepalí en estas pruebas, aunque su licencia y ecosistema están ampliamente extendidos.

## Limitaciones y advertencias

- El autor declara explícitamente que no hace ninguna afirmación comparativa de superioridad: IndicConformer Nepali está por delante en FLEURS (29,9 frente a 46,0), IndicVoices valid (18,4 frente a 27,1) y DiarBench nativo (28,6 frente a 40,5).
- Sin fijar el idioma, el motor puede desviar clips de nepalí íntegramente a letras inglesas (20 de 200 en FLEURS); se recomienda fijar `language="ne"` cuando se sepa que el audio es nepalí.
- La salida no ha sido revisada por ningún lector nativo de nepalí, según el autor.
- Riesgo de errores en la transcripción de palabras inglesas y en la representación de palabras nepalíes: el propio autor señala discrepancias como अलि → अलिक o घर जान → घरजाना en sus ejemplos.
- Solo cubre nepalí e inglés; otros idiomas tienen sus propios modelos Shruti.
- La licencia del modelo es Apache-2.0, pero el autor remite a los términos de los datos de entrenamiento (IndicVoices, Vaani, LibriSpeech) para el uso comercial; conviene revisarlos antes de producción.
- El paquete `cactus-needle` envía recuentos anónimos de uso por defecto; debe definirse `NEEDLE_TELEMETRY=0` para desactivarlo.
- No se documentan sesgos específicos ni tasas de alucinación en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/shruti-nepali
- Página del modelo en Udgam Labs: https://udgamlabs.com/models/shruti/nepali
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Código y ejemplos: https://github.com/udgamlabs/shruti/blob/main/docs/nepali.md
- Colección de la familia Shruti: https://huggingface.co/collections/udgamlabs/shruti-6ad5f80d9d300685a6249c9b
- Modelo base Cactus Whistle: https://huggingface.co/Cactus-Compute/whistle
- Motor Cactus needle: https://huggingface.co/Cactus-Compute/needle3
- Familia Shruti en Udgam Labs: https://udgamlabs.com/models/shruti
- Catálogo de modelos de Udgam Labs: https://udgamlabs.com/models
- Whisper tiny: https://huggingface.co/openai/whisper-tiny
- Whisper base: https://huggingface.co/openai/whisper-base
- Whisper small: https://huggingface.co/openai/whisper-small
- IndicConformer Nepali (ONNX int8): https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-ne-onnx
