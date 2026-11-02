# udgamlabs/shruti-marathi

## Resumen

Shruti Marathi es un modelo de reconocimiento automático del habla (ASR) desarrollado por Udgam Labs, especializado en transcribir marathi y code-switching marathi-inglés. Se trata de un modelo compacto de 55,7 millones de parámetros (8 capas de encoder y 8 de decoder, anchura 512) que se distribuye como un único fichero de 29,7 MB con pesos en 4 bits y activaciones en 8 bits, diseñado para ejecutarse íntegramente en dispositivo (móvil, portátil o navegador) sin conexión a internet ni servidor.

El modelo forma parte de la familia Shruti y deriva de Shruti Hindi, que a su vez se construye sobre Cactus Whistle (Apache-2.0) de Cactus Compute. Udgam Labs reentrenó todos los pesos sobre voz marathi e inglesa con licencia abierta y añadió 400 piezas de vocabulario marathi. La salida en marathi se produce en escritura devanagari, mientras que las palabras inglesas se mantienen en latín en minúsculas, reflejando cómo escriben realmente los hablantes bilingües.

Su relevancia radica en la combinación de tamaño extremadamente reducido, licencia permisiva (Apache-2.0) y un rendimiento en marathi que supera ampliamente a Whisper tiny y Whisper base en las mismas pruebas, acercándose a modelos cinco veces más grandes en conversaciones con code-switching. El motor de inferencia Cactus needle es multiplataforma (macOS, Linux, Windows, Android, iOS y WebAssembly), lo que permite desplegarlo en aplicaciones móviles y páginas web sin infraestructura de servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (8 capas encoder + 8 capas decoder, anchura 512) |
| Parametros totales | 55,7 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de cualquier longitud como entrada) |
| Tipos de cuantizacion | Pesos en 4 bits, activaciones en 8 bits (formato `.cact` para el motor Cactus needle) |
| Idiomas soportados | Marathi (mr), inglés (en), y marathi mezclado con inglés; no soporta hindi |
| Licencia | Apache-2.0 |
| Formato de pesos | `.cact` (motor Cactus needle); fichero de 29,7 MB |

## Arquitectura y entrenamiento

Shruti Marathi es un transformer encoder-decoder de 55,7 millones de parámetros, con 8 capas de encoder y 8 de decoder y una anchura de 512. Deriva de Shruti Hindi, que a su vez se construye sobre Cactus Whistle (Apache-2.0) de Cactus Compute. Udgam Labs reentrenó todos los pesos sobre voz marathi e inglesa con licencia abierta y amplió el vocabulario con 400 piezas específicas de marathi. El modelo se distribuye cuantizado a 4 bits en pesos y 8 bits en activaciones, lo que reduce el fichero a 29,7 MB y permite su ejecución en dispositivos con recursos limitados mediante el motor Cactus needle.

Los datos de entrenamiento provienen de varios conjuntos con licencia abierta: ai4bharat/IndicVoices, ai4bharat/Kathbath, SPRINGLab/SPRING_INX_Marathi_R1, SPRINGLab/SPRING_INX_Marathi_R2, ARTPARK-IISc/Vaani-transcription-part y openslr/librispeech_asr. No se especifica en la información disponible el número total de horas ni la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. La innovación principal es la compresión extrema del modelo manteniendo un rendimiento competitivo en marathi conversacional, junto con el soporte de code-switching marathi-inglés con salida en escritura mixta (devanagari para marathi, latín para inglés).

## Capacidades

- Reconocimiento automático del habla (ASR) para marathi e inglés, con detección automática del idioma de la entrada.
- Transcripción de code-switching marathi-inglés: el marathi se escribe en devanagari y las palabras inglesas se mantienen en latín en minúsculas, tal como escriben los hablantes bilingües.
- Entrada de audio de 16 kHz de cualquier duración.
- Ejecución completamente offline y en dispositivo: móvil, portátil, navegador (WebAssembly) y aplicaciones Android/iOS mediante la librería C del motor.
- Transcripción en streaming palabra a palabra mediante el modo `--audio-stream` del motor de línea de comandos.
- No soporta tool calling, function calling ni razonamiento multi-step; es un modelo puramente ASR.
- No soporta hindi; para hindi debe usarse Shruti Hindi.

## Casos de uso

- **Transcripción offline en aplicaciones móviles**: integrar el fichero `shruti-marathi.cact` con la librería C del motor (`needle.h`) en apps Android o iOS para dictado de notas de voz, con 64 MB de memoria y sin conexión, adecuado para entornos con conectividad limitada.
- **Subtitulado y actas de reuniones bilingües**: transcribir conversaciones que mezclan marathi e inglés (frecuentes en entornos laborales y educativos de Maharashtra) manteniendo el inglés en latín, lo que facilita la lectura y la búsqueda posterior.
- **Atención al cliente en marathi**: procesar grabaciones de llamadas telefónicas (el modelo obtiene 42,9 % de WER en SPRING-INX, llamadas telefónicas) para generar transcripciones y alimentar sistemas de análisis de calidad o resúmenes.
- **Transcripción en el navegador sin servidor**: usar la build WebAssembly del motor para ofrecer dictado en una página web sin enviar audio a ningún servidor, útil por privacidad y por coste de infraestructura.
- **Accesibilidad y notas de voz**: convertir dictados de voz en texto en dispositivos de gama media; en un Samsung Galaxy F62 de 2021 transcribe 12 veces más rápido que tiempo real con 64 MB de memoria.
- **Procesamiento de audio de campo o agricultura**: transcribir grabaciones espontáneas de habla rural (el modelo obtiene 32,2 % de WER en Vaani, habla espontánea), por ejemplo para digitalizar consultas agrícolas o encuestas de campo.
- **Pipelines de datos para ASR en marathi**: generar transcripciones preliminares de grandes volúmenes de audio a bajo coste computacional, que luego puedan revisarse o servir como pseudoetiquetas para entrenar modelos mayores.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, %, menor es mejor), 200 clips por conjunto, medidos por el autor entre el 30 de octubre y el 2 de noviembre de 2026 con el mismo normalizador y scorer:

| Modelo | Tamano | FLEURS (lectura) | Kathbath (lectura) | DiarBench (conversacion) | IndicVoices | SPRING-INX (telefono) | Vaani (espontaneo) |
|---|---|---|---|---|---|---|---|
| **Shruti Marathi** | **29,7 MB** | 29,9 | 24,5 | **38,2** | **22,2** | **42,9** | **32,2** |
| Whisper tiny | 44 MB | 273,1 | 278,1 | 373,9 | 321,8 | 375,6 | 338,7 |
| Whisper base | 82 MB | 177,9 | 193,2 | 402,9 | 450,2 | 420,6 | 412,3 |
| Dolphin base (int8) | 103,7 MB | 71,6 | 74,0 | 97,0 | 95,8 | 96,2 | 94,4 |
| marathi-conformer-33m-moe (fp32) | 136,7 MB | 41,0 | 32,2 | 76,7 | 66,0 | 77,3 | 64,0 |
| IndicConformer Marathi (int8) | 137,7 MB | **22,4** | **14,1** | 41,5 | 27,6 | 53,0 | 44,0 |

Shruti Marathi es el más preciso en los conjuntos conversacionales (DiarBench, IndicVoices, SPRING-INX y Vaani) entre los modelos de menos de 100 MB medidos, y supera a IndicConformer Marathi (unas cinco veces más grande) en esos mismos conjuntos, aunque IndicConformer es mejor en lectura (FLEURS y Kathbath).

## Requisitos de hardware

- VRAM/memoria estimada: 64 MB de memoria en dispositivo según el autor (Samsung Galaxy F62 de 2021); el fichero de pesos ocupa 29,7 MB.
- GPU recomendadas: no requiere GPU; está diseñado para CPU y ejecución en dispositivo. No se especifican GPU de datacenter para este modelo.
- Cabe en cualquier GPU de consumo e incluso en microcontroladores y navegadores; no se requiere hardware especializado.
- Opciones de despliegue: motor Cactus needle (binario de línea de comandos para macOS, Linux y Windows; librería C `needle.h` para Android e iOS; build WebAssembly para navegador) y paquete Python `cactus-needle` (`pip install cactus-needle`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 12 veces más rápido que tiempo real en un Samsung Galaxy F62 de 2021. No se dispone de cifras de throughput en otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | WER IndicVoices | WER DiarBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Shruti Marathi | 55,7 M | audio de cualquier longitud | 22,2 | 38,2 | Apache-2.0 | HuggingFace, Cactus needle |
| Whisper tiny | 39 M | audio de hasta 30 s por ventana | 321,8 | 373,9 | MIT | HuggingFace, multiples runtimes |
| Whisper base | 74 M | audio de hasta 30 s por ventana | 450,2 | 402,9 | MIT | HuggingFace, multiples runtimes |
| IndicConformer Marathi | no disponible | no disponible | 27,6 | 41,5 | no disponible | HuggingFace (ONNX int8) |

Shruti Marathi ofrece el mejor equilibrio tamano/precision en conversaciones marathi-inglés entre los modelos comparados, con la ventaja adicional de ejecución offline en dispositivo y licencia Apache-2.0. Whisper tiny y base, aunque mas universales y con licencia MIT, obtienen errores muy superiores en marathi. IndicConformer Marathi es mas preciso en lectura pero unas cinco veces mas grande y con menor rendimiento en conversaciones.

## Limitaciones y advertencias

- No soporta hindi; para hindi debe usarse Shruti Hindi. Tampoco se documentan otros idiomas.
- El rendimiento en lectura (FLEURS 29,9 %, Kathbath 24,5 %) es inferior al de IndicConformer Marathi, por lo que no es la mejor opción para texto leído o locución profesional.
- Los benchmarks son mediciones del propio autor (Udgam Labs) y no han sido replicados de forma independiente; deben interpretarse con cautela.
- El paquete Python `cactus-needle` envía por defecto contadores anónimos de uso (nombre de función, versiones, sistema operativo); debe desactivarse con `NEEDLE_TELEMETRY=0` en entornos sensibles. El motor de línea de comandos y la build WebAssembly no realizan llamadas de red.
- Riesgo de alucinación y errores en audio con ruido, acentos no vistos o habla muy espontánea; el WER en llamadas telefónicas (42,9 %) y habla espontánea (32,2 %) indica que la transcripción requiere revisión en producción.
- No se documentan sesgos específicos ni composición detallada del dataset de entrenamiento, lo que limita la evaluación de sesgos demográficos o dialectales.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- El formato `.cact` está ligado al motor Cactus needle; no es directamente compatible con otros runtimes ASR sin conversión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/udgamlabs/shruti-marathi
- Modelo base Shruti Hindi: https://huggingface.co/udgamlabs/Shruti
- Cactus Whistle (modelo base original): https://huggingface.co/Cactus-Compute/whistle
- Motor Cactus needle: https://huggingface.co/Cactus-Compute/needle3
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Demo en navegador: https://udgamlabs.com/models/shruti?lang=mr
- Codigo y ejemplos: https://github.com/udgamlabs/shruti
- Comparativa de evaluacion: https://huggingface.co/udgamlabs/shruti-marathi/blob/main/eval/comparison.md
- Whisper tiny: https://huggingface.co/openai/whisper-tiny
- Whisper base: https://huggingface.co/openai/whisper-base
- Dolphin base: https://huggingface.co/DataoceanAI/dolphin-base
- marathi-conformer-33m-moe: https://huggingface.co/rimrafadii/marathi-conformer-33m-moe
- IndicConformer Marathi (ONNX): https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-mr-onnx
