# udgamlabs/shruti-gujarati

## Resumen

Shruti Gujarati es un modelo de reconocimiento automático del habla (ASR) desarrollado por Udgam Labs, diseñado para transcribir audio en gujarati e inglés directamente en el dispositivo, sin conexión a internet ni servidor. Forma parte de la familia Shruti, que incluye variantes para hindi, marathi, tamil, bengalí y telugu, y se construye a partir de Shruti Hindi, que a su vez deriva de Cactus Whistle (Apache-2.0). El modelo tiene aproximadamente 56 millones de parámetros (55.875.913), con 8 capas de encoder y 8 de decoder y una anchura de 512, y se distribuye como un único archivo de 29,7 MB con pesos en 4 bits y activaciones en 8 bits para el motor Cactus needle.

El problema que resuelve es la transcripción de conversaciones reales en gujarati que mezclan palabras en inglés, un fenómeno de code-switching muy habitual en el habla cotidiana. El modelo mantiene el gujarati en escritura gujarati y las palabras inglesas en caracteres latinos, tal como se escribiría de forma natural. Su relevancia radica en que ofrece esta capacidad en un formato extremadamente compacto que cabe en un teléfono móvil o en una página web mediante WebAssembly, con un rendimiento medido de 10,3 veces más rápido que el tiempo real en un Samsung Galaxy F62 de 2021 usando 64 MB de memoria.

La arquitectura es un modelo seq2seq de tipo encoder-decoder (transformer), entrenado sobre corpus abiertos de habla gujarati e inglesa. Su licencia Apache-2.0 permite uso comercial sin restricciones significativas, lo que lo hace adecuado para integrarse en aplicaciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq), 8 capas de encoder y 8 de decoder, anchura 512 |
| Parametros totales | 55.875.913 (aproximadamente 56M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (acepta audio de cualquier duración a 16 kHz) |
| Tipos de cuantizacion | Pesos en 4 bits y activaciones en 8 bits (formato `.cact` para el motor Cactus needle) |
| Idiomas soportados | Gujarati (gu), inglés (en) y gujarati mezclado con inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | `.cact` (formato propietario del motor Cactus needle), 29,7 MB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer encoder-decoder con 8 capas en cada bloque y una dimensión de modelo de 512, lo que da lugar a los aproximadamente 56 millones de parámetros. Deriva de Shruti Hindi, que a su vez se construye sobre Cactus Whistle (Apache-2.0) de Cactus Compute. Para la variante gujarati se reentrenaron todos los pesos sobre habla gujarati e inglesa con licencia abierta y se añadieron 700 piezas de vocabulario específicas del gujarati.

Los datos de entrenamiento provienen de varios corpus: ai4bharat/IndicVoices, ai4bharat/Kathbath, SPRINGLab/SPRING_INX_Gujarati_R1, SPRINGLab/SPRING_INX_Gujarati_R2, ARTPARK-IISc/Vaani-transcription-part y openslr/librispeech_asr. No se especifica en la información disponible el número total de horas de audio ni la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en ASR). La innovación principal es la compresión extrema: el modelo se ejecuta mediante el motor Cactus needle tanto de forma nativa como en WebAssembly dentro del navegador, lo que permite inferencia completamente offline en dispositivos de consumo.

## Capacidades

- Transcripción de voz a texto en gujarati, con salida en escritura gujarati.
- Reconocimiento de palabras inglesas dentro de habla gujarati, manteniéndolas en caracteres latinos (code-switching).
- Detección automática del idioma de entrada (gujarati o inglés).
- Procesamiento de audio de cualquier duración a 16 kHz.
- Ejecución offline y en el dispositivo, sin servidor ni conexión a internet.
- Funcionamiento en navegador mediante WebAssembly, además de motor nativo.
- Despliegue en teléfonos móviles, portátiles y páginas web.
- No se documentan capacidades de tool calling, agentes, visión ni audio de salida.

## Casos de uso

- Transcripción de conversaciones cotidianas en gujarati con préstamos del inglés: el modelo está entrenado específicamente para preservar las palabras inglesas en caracteres latinos, lo que facilita la lectura y la búsqueda posterior en notas o actas.
- Aplicaciones móviles de dictado offline: al ocupar 29,7 MB y ejecutarse con 64 MB de memoria, puede integrarse en apps Android o iOS sin depender de conectividad, útil en zonas con cobertura limitada.
- Subtitulado en directo de reuniones o clases: con una velocidad de 10,3 veces el tiempo real en un teléfono de gama media de 2021, permite generar subtítulos con margen suficiente para su visualización.
- Asistentes de voz embebidos en páginas web: la compilación WebAssembly del motor Cactus needle permite transcribir audio del micrófono del usuario directamente en el navegador, sin enviar datos a un servidor, lo que reduce riesgos de privacidad.
- Digitalización de entrevistas y testimonios en gujarati: la ventana de audio de duración arbitraria y el bajo coste computacional permiten procesar grabaciones largas en portátiles convencionales.
- Investigación lingüística sobre code-switching gujarati-inglés: el modelo sirve como herramienta de anotación automática y como referencia de rendimiento frente a modelos mayores en corpus mixtos.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, %, menor es mejor), 200 clips por conjunto, mismos clips y mismo evaluador para todos los modelos; Shruti Gujarati medido en su motor on-device sobre un Mac el 2 de noviembre de 2026.

| Modelo | Tamano de archivo | FLEURS (lectura) | Kathbath test-unknown (lectura) | DiarBench, inglés en inglés (conversación, held out) | DiarBench, referencia nativa |
|---|---|---|---|---|---|
| **Shruti Gujarati** | **29,7 MB** | 27,9 | 20,7 | **28,5** | 33,6 |
| Whisper tiny | 43,5 MB | 205,9 | 222,9 | 469,1 | 472,4 |
| Whisper base | 81,8 MB | 191,1 | 189,4 | 278,6 | 280,9 |
| Dolphin base (int8) | 103,7 MB | 74,7 | 64,0 | 77,6 | 79,5 |
| Vosk Gujarati (small, 0.42) | 108,1 MB | 36,5 | 28,0 | 71,9 | 70,2 |
| IndicConformer Gujarati (int8) | 137,7 MB | 18,8 | 14,5 | 44,9 | 40,2 |
| Dolphin small (int8) | 249,7 MB | 61,6 | 47,3 | 92,9 | 93,4 |
| Whisper small | 264,5 MB | 131,9 | 136,0 | 131,8 | 132,4 |

En habla conversacional con mezcla de inglés, Shruti Gujarati obtiene un WER de 28,5 frente a 32,4 de SraVaani-1.0 (modelo aproximadamente 30 veces mayor) y 44,9 de IndicConformer Gujarati (casi 5 veces mayor). En lectura de gujarati puro, IndicConformer Gujarati (18,8 en FLEURS, 14,5 en Kathbath) y Vosk Gujarati (36,5 y 28,0) superan a Shruti Gujarati en FLEURS, aunque el modelo de Udgam Labs mantiene ventaja en el escenario conversacional mixto. La información proporcionada no incluye resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo consume aproximadamente 64 MB de memoria en inferencia según la medición del autor en un Samsung Galaxy F62.
- GPU recomendadas: no requiere GPU; funciona en CPU. Se ha medido en un Mac y en un Android de 2021.
- Cabe en cualquier GPU de consumo, e incluso en dispositivos móviles sin GPU dedicada.
- Opciones de despliegue: motor Cactus needle (nativo y WebAssembly), paquete Python `cactus-needle` (`pip install cactus-needle`), binario `needle` para distintas plataformas desde Cactus-Compute/needle3, y compilación wasm para navegador.
- Latencia y throughput: 10,3 veces más rápido que el tiempo real en un Samsung Galaxy F62 de 2021 con 64 MB de memoria.
- El paquete Python envía contadores de uso anónimos por defecto; se desactivan con `NEEDLE_TELEMETRY=0`.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Shruti Gujarati | ~56M | 29,7 MB | gu, en (code-switching) | Apache-2.0 | On-device, offline, WebAssembly |
| IndicConformer Gujarati | No disponible (casi 5 veces mayor) | 137,7 MB (int8) | gu | No disponible en la informacion | ASR Indic, mayor precision en lectura |
| Vosk Gujarati (small 0.42) | No disponible | 108,1 MB | gu | No disponible en la informacion | ASR offline clasico |
| Whisper small | 244M (aproximado, no confirmado en la informacion) | 264,5 MB | multilingue | MIT (no confirmado en la informacion) | ASR generalista |

Shruti Gujarati destaca por su tamano minimo y su capacidad de ejecucion en navegador, con mejor rendimiento en habla conversacional mixta que modelos mucho mayores, aunque pierde en precision de lectura frente a IndicConformer Gujarati y Vosk Gujarati en FLEURS.

## Limitaciones y advertencias

- En lectura de gujarati puro, modelos mayores como IndicConformer Gujarati y Vosk Gujarati obtienen menor WER; Shruti Gujarati esta optimizado para habla conversacional con mezcla de ingles.
- Se documentan errores reales de transcripcion, como escribir ઉછીની ("en prestamo") como ઓછીની, lo que indica confusiones entre palabras foneticamente proximas.
- El modelo solo cubre gujarati e ingles; para hindi, marathi, tamil, bengali o telugu deben usarse las variantes correspondientes de la familia Shruti.
- No se documentan sesgos especificos, pero al entrenarse sobre corpus abiertos de habla puede heredar sesgos de dominio, acento o registro de esos datasets.
- Riesgo de alucinacion inherente a los modelos seq2seq de ASR, especialmente en audio ruidoso o con acentos no representados en el entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el formato `.cact` esta ligado al motor Cactus needle; la portabilidad a otros runtimes no esta documentada.
- El paquete Python envia telemetria anonima por defecto, lo que debe tenerse en cuenta en entornos con requisitos de privacidad.
- No se especifican en la informacion disponible el numero de horas de entrenamiento ni la composicion exacta del dataset, lo que limita la evaluacion de su cobertura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/shruti-gujarati
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Prueba en navegador: https://udgamlabs.com/models/shruti#gujarati
- Codigo y ejemplos (GitHub): https://github.com/udgamlabs/shruti/blob/main/docs/gujarati.md
- Shruti Hindi (modelo base): https://huggingface.co/udgamlabs/Shruti
- Shruti Marathi: https://huggingface.co/udgamlabs/shruti-marathi
- Shruti Tamil: https://huggingface.co/udgamlabs/shruti-tamil
- Shruti Bengali: https://huggingface.co/udgamlabs/shruti-bengali
- Shruti Telugu: https://huggingface.co/udgamlabs/shruti-telugu
- Cactus Whistle: https://huggingface.co/Cactus-Compute/whistle
- Motor Cactus needle3: https://huggingface.co/Cactus-Compute/needle3
- Whisper tiny: https://huggingface.co/openai/whisper-tiny
- Whisper base: https://huggingface.co/openai/whisper-base
- Dolphin base: https://huggingface.co/DataoceanAI/dolphin-base
- Dolphin small: https://huggingface.co/DataoceanAI/dolphin-small
- Vosk Gujarati: https://alphacephei.com/vosk/models
- IndicConformer Gujarati (ONNX): https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-gu-onnx
