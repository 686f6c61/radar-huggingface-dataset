# udgamlabs/shruti-telugu

## Resumen

Shruti Telugu es un modelo de reconocimiento automático del habla (ASR) desarrollado por Udgam Labs, especializado en transcribir audio en telugu y en inglés, incluyendo conversaciones con cambio de código (code-switching) entre ambos idiomas. Con 55,9 millones de parámetros y un fichero de pesos de solo 29,7 MB en cuantización de 4 bits, está diseñado para ejecutarse íntegramente en dispositivo (móvil, portátil o navegador) sin conexión a internet ni servidor. Forma parte de la familia Shruti, junto a las variantes de hindi, marathi, tamil y bengalí.

El modelo se construye sobre Cactus Whistle (Apache-2.0) a través de Shruti Hindi, con todos los pesos reentrenados sobre corpus abiertos de habla en telugu e inglés, y con 700 piezas adicionales de vocabulario telugu. Su propuesta diferencial es el equilibrio entre tamaño mínimo y calidad en habla conversacional mixta: mantiene las palabras inglesas en alfabeto latino y el telugu en escritura telugu, tal como escribiría un hablante real.

Es relevante ahora porque demuestra que un modelo de menos de 60 millones de parámetros puede superar en habla conversacional con code-switching a modelos hasta 32 veces mayores, incluyendo IndicConformer Telugu y fine-tunes de Whisper, a una fracción del coste computacional y con despliegue offline en WebAssembly.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder tipo transformer (8 capas de encoder + 8 de decoder, anchura 512), derivada de Cactus Whistle |
| Parametros totales | 55.875.913 (55,9M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Audio de cualquier duración a 16 kHz como entrada; no se especifica límite de contexto en tokens |
| Tipos de cuantizacion | 4 bits en pesos y 8 bits en activaciones (fichero `.cact`); se incluye fichero fp32 en safetensors no probado |
| Idiomas soportados | Telugu (te), inglés (en) y telugu mezclado con inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | `.cact` (motor Cactus) y `.safetensors` (fp32) |

## Arquitectura y entrenamiento

La arquitectura es un encoder-decoder transformer compacto de 8 capas en cada bloque y anchura 512, heredado de Cactus Whistle y ajustado desde Shruti Hindi. El modelo original se reentrenó por completo sobre corpus de habla abiertos: ai4bharat/IndicVoices, ai4bharat/Kathbath, ARTPARK-IISc/Vaani-transcription-part y openslr/librispeech_asr. Además, se amplió el vocabulario con 700 piezas específicas de telugu para cubrir la escritura nativa y los patrones de code-switching.

La innovación principal no está en el entrenamiento sino en el despliegue: el motor Cactus (Apache-2.0) permite ejecutar el modelo de forma nativa y en WebAssembly, con cuantización agresiva a 4 bits en pesos y 8 bits en activaciones. No se documentan en la información disponible detalles sobre RLHF, DPO ni composición exacta del dataset en número de horas o tokens.

## Capacidades

- Transcripción de voz a texto en telugu, con salida en escritura telugu.
- Reconocimiento de palabras en inglés dentro de habla telugu, manteniéndolas en alfabeto latino en minúsculas.
- Manejo de code-switching telugu-inglés en conversaciones naturales.
- Detección automática del idioma de entrada (telugu o inglés).
- Procesamiento de audio de cualquier duración a 16 kHz.
- Ejecución offline en dispositivo: móvil Android, Mac y navegador vía WebAssembly.
- No se documentan capacidades de traducción, resumen, tool calling ni razonamiento multi-paso; el modelo es exclusivamente ASR.

## Casos de uso

- **Transcripción de reuniones y conversaciones informales en telugu**: el modelo gestiona audio de cualquier duración y mantiene los términos ingleses que aparecen de forma natural en el habla técnica o corporativa, lo que lo hace adecuado para actas y notas en entornos bilingües.
- **Subtitulado en directo en dispositivos móviles**: con 29,7 MB y ejecución 9,8 veces más rápida que tiempo real en un Samsung Galaxy F62 (64 MB de memoria), puede generar subtítulos en el propio teléfono sin conexión.
- **Aplicaciones web de accesibilidad**: mediante el build WebAssembly del motor Cactus, se integra en una página web para dictado o transcripción en el navegador sin enviar audio a servidores, útil por privacidad.
- **Asistentes de voz embebidos en dispositivos de bajo consumo**: su tamaño permite incluirlo en firmware o apps ligeras para comandos de voz en telugu, con latencia baja y sin dependencia de red.
- **Digitalización de entrevistas y encuestas de campo**: al funcionar offline, permite transcribir grabaciones en zonas sin cobertura, manteniendo la mezcla de telugu e inglés típica de entrevistas reales.
- **Pipelines de análisis de atención al cliente**: transcripción de llamadas en telugu con términos ingleses (productos, marcas, acciones) para su posterior procesamiento de texto, con la ventaja de que el inglés queda en alfabeto latino y facilita el análisis automático.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, %, menor es mejor), 200 clips por conjunto, mismos clips y evaluador para todos los modelos; Shruti Telugu medido en su motor on-device en un Mac. Medición del 2 de noviembre de 2026.

| Modelo | Tamano fichero | FLEURS (lectura) | Kathbath test-unknown (lectura) | DiarBench, ingles en ingles (conversacion) | DiarBench, referencia nativa |
|---|---|---|---|---|---|
| **Shruti Telugu** | **29,7 MB** | 38,0 | 32,9 | **45,4** | 58,0 |
| Whisper tiny | 43,5 MB | 687,8 | 583,3 | 659,1 | 665,9 |
| Vosk Telugu (small, 0.42) | 60,5 MB | 77,1 | 80,1 | 93,8 | 92,0 |
| Whisper base | 81,8 MB | 220,1 | 363,3 | 371,3 | 375,5 |
| Dolphin base (int8) | 103,7 MB | 73,4 | 66,2 | 86,9 | 90,3 |
| IndicConformer Telugu (int8) | 137,7 MB | 24,5 | 23,0 | 52,9 | 37,3 |
| Whisper-tiny Telugu (vasista22) | 151,1 MB | 34,2 | 34,4 | 59,2 | 47,5 |
| Dolphin small (int8) | 249,7 MB | 60,9 | 52,6 | 98,0 | 98,7 |
| Whisper small | 264,5 MB | 169,7 | 154,1 | 201,1 | 205,1 |

En habla conversacional con code-switching (DiarBench, inglés en inglés), Shruti Telugu obtiene 45,4 de WER, mejor que IndicConformer Telugu (52,9) y que los fine-tunes de Whisper Telugu (59,2), pese a ser entre 5 y 32 veces menor. En habla leída (FLEURS y Kathbath), IndicConformer Telugu es más preciso (24,5 y 23,0 frente a 38,0 y 32,9).

## Requisitos de hardware

- VRAM estimada: 64 MB de memoria en dispositivo durante la inferencia con el fichero de 29,7 MB en 4 bits.
- GPU recomendadas: no requiere GPU dedicada; el modelo está pensado para CPU móvil, CPU de portátil y WebAssembly en navegador. Se midió en un Mac, un Android (Samsung Galaxy F62) y Chrome en ese teléfono.
- Cabe en cualquier GPU de consumo, pero su uso previsto es en dispositivo sin GPU.
- Opciones de despliegue: motor Cactus (nativo y WebAssembly), paquete Python `cactus-compute` con clase `Whistle`, binario `cactus` de línea de comandos y build `wasm/` para navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 9,8 veces más rápido que tiempo real en un Samsung Galaxy F62 con 64 MB de memoria (dato del autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | WER conversacional (DiarBench) | Licencia | Despliegue |
|---|---|---|---|---|---|
| Shruti Telugu | 55,9M | Audio de cualquier duración a 16 kHz | 45,4 | Apache-2.0 | On-device, WASM |
| IndicConformer Telugu | No disponible (fichero 137,7 MB int8) | No disponible | 52,9 | No disponible en la informacion | Servidor/ONNX |
| Whisper-tiny Telugu (vasista22) | No disponible (fichero 151,1 MB) | 30 s por ventana (Whisper) | 59,2 | No disponible en la informacion | whisper.cpp, servidor |
| Vosk Telugu small | No disponible (fichero 60,5 MB) | No disponible | 93,8 | No disponible en la informacion | On-device |

Shruti Telugu es el más pequeño de los cuatro y el mejor en habla conversacional con code-switching, aunque pierde en habla leída frente a IndicConformer Telugu.

## Limitaciones y advertencias

- En habla leída (FLEURS, Kathbath) es menos preciso que IndicConformer Telugu y que Whisper-tiny Telugu: 38,0 y 32,9 de WER frente a 24,5 y 23,0 del primero.
- Puede escribir palabras inglesas en escritura telugu en lugar de alfabeto latino; la model card documenta el error con "show" transcrito en telugu.
- Puede unir palabras que deberían ir separadas (por ejemplo, "హైదరాబాద్ లో" escrito como una sola palabra).
- Solo cubre telugu e inglés; no soporta otros idiomas ni traducción.
- El fichero fp32 en safetensors se incluye pero no ha sido probado por el autor.
- El paquete `cactus-compute` envía recuentos de uso anónimos por defecto; debe configurarse `CACTUS_TELEMETRY=0` para desactivarlo.
- No se documentan sesgos específicos ni tasas de alucinación en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero no se documentan garantías ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/shruti-telugu
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Prueba en navegador: https://udgamlabs.com/models/shruti#telugu
- Codigo y ejemplos (telugu): https://github.com/udgamlabs/shruti/blob/main/docs/telugu.md
- Modelo base Shruti Hindi: https://huggingface.co/udgamlabs/Shruti
- Shruti Marathi: https://huggingface.co/udgamlabs/shruti-marathi
- Shruti Tamil: https://huggingface.co/udgamlabs/shruti-tamil
- Shruti Bengali: https://huggingface.co/udgamlabs/shruti-bengali
- Cactus Whistle: https://huggingface.co/Cactus-Compute/whistle
- Motor Cactus: https://huggingface.co/Cactus-Compute/cactus
- Releases del binario Cactus: https://huggingface.co/Cactus-Compute/cactus/tree/main/releases/4.1.0
- Whisper tiny: https://huggingface.co/openai/whisper-tiny
- Whisper base: https://huggingface.co/openai/whisper-base
- Whisper small: https://huggingface.co/openai/whisper-small
- Whisper-tiny Telugu (vasista22): https://huggingface.co/vasista22/whisper-telugu-tiny
- IndicConformer Telugu (ONNX): https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-te-onnx
- Dolphin base: https://huggingface.co/DataoceanAI/dolphin-base
- Dolphin small: https://huggingface.co/DataoceanAI/dolphin-small
- Vosk models: https://alphacephei.com/vosk/models
