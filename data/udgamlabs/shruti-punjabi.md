# udgamlabs/shruti-punjabi

## Resumen

Shruti Punjabi es un modelo de reconocimiento automático del habla (ASR) desarrollado por Udgam Labs, un laboratorio que publica una familia de modelos pequeños, uno por idioma, bajo licencia Apache-2.0. Este modelo concreto transcribe punjabi y inglés, incluyendo el fenómeno de code-switching tan habitual en hablantes punjabi (frases donde palabras inglesas aparecen intercaladas en una oración en punjabi). El modelo se distribuye como un único fichero de 29,7 MB con pesos en 4 bits y activaciones en 8 bits, diseñado para ejecutarse en el motor Cactus needle tanto de forma nativa como compilado a WebAssembly, lo que permite inferencia completamente offline en un teléfono, un portátil o un navegador.

La arquitectura es un encoder-decoder de tipo transformer con 8 capas en cada bloque y anchura 512, sumando aproximadamente 56 millones de parámetros (55.875.913). Se construye sobre Shruti Hindi (a su vez basado en Cactus Whistle, Apache-2.0): Udgam Labs reentrenó todos los pesos con voz en punjabi e inglés y añadió 700 piezas de vocabulario específicas del punjabi. Una particularidad relevante es que el modelo conserva parte de las palabras inglesas en caracteres latinos en lugar de transliterarlas a gurmukhi, lo que refleja cómo escriben realmente muchos hablantes.

Su relevancia actual radica en la combinación de tamaño mínimo, licencia permisiva y ejecución on-device sin conexión, algo poco común en ASR para lenguas indias de bajos recursos. El autor declara explícitamente que en conversaciones en punjabi el modelo está a la par de IndicConformer Punjabi y SraVaani-1.0, no por delante, y que ninguna persona nativa ha revisado aún las transcripciones de ejemplo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (8 capas de encoder + 8 de decoder, anchura 512) |
| Parámetros totales | ~56M (55.875.913) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (acepta audio de cualquier duración según el autor) |
| Tipos de cuantización | Pesos en 4 bits, activaciones en 8 bits (formato `.cact` del motor needle) |
| Idiomas soportados | Punjabi (gurmukhi), inglés y punjabi mezclado con inglés |
| Licencia | Apache-2.0 (modelo); condiciones de los datos de entrenamiento sujetas a sus propias licencias |
| Formato de pesos | `.cact` (motor Cactus needle), fichero de 29,7 MB |
| Entrada / salida | Audio a 16 kHz de cualquier duración → texto |
| Modelo base | Shruti Hindi (Udgam Labs), construido sobre Cactus Whistle (Cactus Compute) |
| Runtime | Cactus needle (nativo y WebAssembly) |
| Librería | `cactus-needle` (Python) |

## Arquitectura y entrenamiento

El modelo sigue el esquema encoder-decoder de Cactus Whistle: 8 capas de encoder y 8 de decoder con anchura 512, unos 56M de parámetros en total. Udgam Labs partió de Shruti Hindi y reentrenó la totalidad de los pesos con datos de voz en punjabi e inglés, ampliando además el vocabulario con 700 piezas específicas del punjabi. El resultado se empaqueta en el formato `.cact` con cuantización de pesos a 4 bits y activaciones a 8 bits, lo que reduce el artefacto a 29,7 MB y permite su ejecución en el motor needle, disponible de forma nativa y compilado a WebAssembly.

Los datos de entrenamiento declarados incluyen `ai4bharat/IndicVoices`, `ai4bharat/Kathbath`, `SPRINGLab/SPRING_INX_Punjabi_R1`, `SPRINGLab/SPRING_INX_Punjabi_R2`, `ARTPARK-IISc/Vaani-transcription-part` y `openslr/librispeech_asr` (este último para la parte inglesa). No se especifican en la información disponible el número total de horas, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; al tratarse de un modelo ASR, el ajuste se realiza mediante entrenamiento supervisado sobre pares audio-transcripción. La innovación destacable no es arquitectónica sino de despliegue: inferencia offline en navegador vía WebAssembly y en dispositivos móviles de gama media, con un consumo de memoria declarado de 64 MB en un Samsung Galaxy F62 de 2021.

## Capacidades

- Transcripción de voz en punjabi escrita en gurmukhi, con detección automática del idioma de entrada.
- Manejo de code-switching punjabi-inglés: conserva parte de las palabras inglesas en caracteres latinos en minúscula en lugar de transliterarlas (el autor reporta un 58,7% de palabras inglesas escritas en alfabeto latino).
- Entrada de audio a 16 kHz de duración arbitraria, sin segmentación manual por parte del usuario.
- Ejecución completamente offline, sin servidor ni conexión a internet.
- Inferencia en dispositivo: motor nativo (Mac, Android) y WebAssembly (navegador Chrome en Android).
- Interfaz Python (`needle.Whistle`), línea de comandos (`./needle`) y build WASM para páginas web.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de conversaciones cotidianas con mezcla de idiomas: el modelo está entrenado específicamente para frases como las del ejemplo del autor, donde términos ingleses (visa, flight, service) aparecen dentro de una oración en punjabi, por lo que resulta adecuado para diarios de voz y notas personales de hablantes bilingües.
- Subtitulado y actas de reuniones en entornos sin conectividad: al ejecutarse en un portátil o teléfono sin red, puede transcribir reuniones o entrevistas en zonas con cobertura limitada o por requisitos de privacidad.
- Aplicaciones móviles de accesibilidad: con 64 MB de memoria en un Galaxy F62 y un fichero de 29,7 MB, cabe en aplicaciones Android que transcriban voz a texto para personas con dificultades auditivas o motoras.
- Dictado por voz en el navegador: el build WebAssembly permite integrar la transcripción en una página web sin backend, útil para formularios, chats de voz o herramientas educativas.
- Procesamiento por lotes de archivos de audio en pipelines de datos: la API de Python permite recorrer directorios de grabaciones y generar transcripciones para análisis posteriores (por ejemplo, minería de opiniones o indexación de audio).
- Preservación y documentación lingüística: al escribir en gurmukhi y conservar parte del inglés en latino, sirve para digitalizar entrevistas orales de comunidades punjabi-parlantes manteniendo fielmente el registro mixto.
- Prototipado rápido de productos de voz en dispositivos de bajo coste: la licencia Apache-2.0 y el tamaño reducido permiten embarcar el modelo en hardware con recursos limitados sin costes de servidor.

## Benchmarks y rendimiento

Resultados publicados por el autor (WER en %, menor es mejor; mismas muestras y mismo scorer para todos los modelos; Shruti Punjabi medido en su motor on-device sobre un Mac el 2 de noviembre de 2026). El tamaño es el del fichero publicado por cada fabricante.

| Modelo | Tamaño | FLEURS (lectura) | Kathbath test-unknown (lectura) | DiarBench, inglés en inglés | DiarBench, nativo |
|---|---|---|---|---|---|
| **Shruti Punjabi** | 29,7 MB | 29,3 | 18,6 | 32,6 | 38,3 |
| Whisper tiny | 43,5 MB | 311,5 | 337,8 | 468,7 | 467,7 |
| Whisper base | 81,8 MB | 201,6 | 207,9 | 275,9 | 275,3 |
| Dolphin base | 103,7 MB | 83,6 | 71,6 | 98,5 | 99,4 |
| IndicConformer Punjabi (int8) | 137,7 MB | 16,9 | 13,7 | 34,6 | 28,4 |
| Dolphin small | 249,7 MB | 62,2 | 51,0 | 99,2 | 99,2 |
| Whisper small | 264,5 MB | 129,4 | 123,4 | 145,1 | 144,7 |
| SraVaani-1.0 | 908,8 MB | 15,1 | 12,7 | 31,9 | 23,9 |

Contexto de lectura de la tabla según el autor: FLEURS es habla leída no vista en entrenamiento; Kathbath test-unknown tiene hablantes no vistos, pero su split de entrenamiento forma parte de los datos de entrenamiento del modelo (y muy probablemente de los demás); DiarBench son conversaciones reales fuera del conjunto de entrenamiento (200 turnos de 44 conversaciones, 5.881 palabras de referencia, 659 en inglés). En DiarBench, el autor sitúa a Shruti Punjabi a la par de IndicConformer Punjabi y SraVaani-1.0 (intervalos pareados que incluyen 0), y por detrás de ambos cuando se evalúa contra la referencia nativa (38,3 frente a 28,4 y 23,9) y en FLEURS (29,3 frente a 16,9 y 15,1). No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 64 MB de memoria en uso según la medición del autor en un Samsung Galaxy F62 (2021); el fichero de pesos ocupa 29,7 MB.
- GPU recomendadas: no disponible; el modelo está pensado para CPU y ejecución on-device, no se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: no aplica según la información disponible; el despliegue objetivo es CPU móvil, portátil y navegador.
- Opciones de despliegue: motor Cactus needle nativo (binario `needle` por plataforma), build WebAssembly para navegador y paquete Python `cactus-needle`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 11 veces más rápido que tiempo real en un Samsung Galaxy F62 de 2021, según el autor. No se publican cifras de throughput para otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Idiomas | FLEURS (WER) | DiarBench nativo (WER) | Licencia | Comentario |
|---|---|---|---|---|---|---|---|
| Shruti Punjabi | ~56M | 29,7 MB | pa, en (code-switching) | 29,3 | 38,3 | Apache-2.0 | On-device, WASM, conserva inglés en latino |
| IndicConformer Punjabi | no disponible | 137,7 MB (int8) | pa | 16,9 | 28,4 | no disponible en la información | Mejor WER en lectura y referencia nativa |
| SraVaani-1.0 | no disponible | 908,8 MB | pa (y otras lenguas indias) | 15,1 | 23,9 | no disponible en la información | Mejor WER global, mucho mayor tamaño |
| Whisper small | 244M | 264,5 MB | multilingüe | 129,4 | 144,7 | MIT (según el proyecto original) | WER muy superior en punjabi |

La ventaja de Shruti Punjabi frente a IndicConformer y SraVaani-1.0 no es la precisión sino el tamaño (entre 4,6 y 30 veces menor), la licencia Apache-2.0 explícita y la capacidad de ejecutarse en navegador y dispositivos móviles sin conexión. Frente a Whisper, la mejora en WER para punjabi es de un orden de magnitud.

## Limitaciones y advertencias

- Precisión: el autor reconoce que en conversaciones en punjabi el modelo está a la par de IndicConformer Punjabi y SraVaani-1.0, no por delante, y que contra la referencia nativa queda claramente por detrás (38,3 frente a 28,4 y 23,9 de WER).
- Validación humana pendiente: ninguna persona nativa ha revisado las transcripciones de ejemplo publicadas; los textos de muestra proceden de voces sintéticas.
- Errores observados en los ejemplos del autor: sustituciones como ਕੈਨੇਡਾ → canada, ਟੋਰਾਂਟੋ → toronto, ਕਰਾਉਣੀ → ਕਰਵਾਉਣੀ y brake → break, que indican confusión entre formas ortográficas y homófonos.
- Idiomas: solo punjabi e inglés; otras lenguas requieren otros modelos de la familia Shruti. No se documenta comportamiento en acentos o dialectos distintos del punjabi estándar.
- Sesgos: no se documenta ningún análisis de sesgos por género, edad, acento o región en la información disponible.
- Riesgo de alucinación: no evaluado en la información disponible; en ASR este riesgo se manifiesta como sustituciones o inserciones de palabras, no como texto inventado de forma extensa.
- Licencia: el modelo es Apache-2.0, pero los datasets de entrenamiento (IndicVoices, Kathbath, SPRING_INX, Vaani, LibriSpeech) tienen sus propias condiciones, que el autor remite a la sección de datos y que deben revisarse antes de un uso comercial.
- Telemetría: el paquete `cactus-needle` envía recuentos de uso anónimos por defecto; debe desactivarse con `NEEDLE_TELEMETRY=0` en entornos con requisitos de privacidad.
- Dependencia de runtime: el modelo solo se distribuye en formato `.cact` para el motor needle; no hay pesos en safetensors ni GGUF, lo que limita su uso con otras herramientas del ecosistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/shruti-punjabi
- Página del modelo en Udgam Labs: https://udgamlabs.com/models/shruti/punjabi
- Familia Shruti: https://udgamlabs.com/models/shruti
- Colección Shruti en Hugging Face: https://huggingface.co/collections/udgamlabs/shruti-6ad5f80d9d300685a6249c9b
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Código y ejemplos (GitHub): https://github.com/udgamlabs/shruti/blob/main/docs/punjabi.md
- Motor Cactus needle: https://huggingface.co/Cactus-Compute/needle3
- Modelo base Cactus Whistle: https://huggingface.co/Cactus-Compute/whistle
- Investigación de Udgam Labs: https://udgamlabs.com/research
- IndicConformer Punjabi (comparativa): https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-pa-onnx
- SraVaani-1.0 (comparativa): https://huggingface.co/ARTPARK-IISc/SraVaani-1.0
- Whisper tiny (comparativa): https://huggingface.co/openai/whisper-tiny
- Whisper base (comparativa): https://huggingface.co/openai/whisper-base
- Whisper small (comparativa): https://huggingface.co/openai/whisper-small
- Dolphin base (comparativa): https://huggingface.co/DataoceanAI/dolphin-base
- Dolphin small (comparativa): https://huggingface.co/DataoceanAI/dolphin-small
