# udgamlabs/Shruti

## Resumen

Shruti es un modelo de reconocimiento automático del habla (ASR) desarrollado por Udgam Labs, un fine-tuning completo del modelo Cactus Whistle de Cactus Compute. Con 55 millones de parámetros y un tamaño de fichero de tan solo 29,5 MB en su formato cuantizado para el motor Cactus, el modelo está diseñado para transcribir voz en hindi, inglés y hinglish (código mezclado) de forma totalmente offline y en dispositivos de consumo, incluyendo teléfonos móviles y navegadores web.

El modelo resuelve un problema concreto: la transcripción de habla code-mixed indo-inglesa, donde los hablantes alternan entre hindi y palabras en inglés dentro de la misma frase. Shruti produce hindi en escritura devanagari y mantiene las palabras inglesas en latín en minúsculas, reflejando cómo los usuarios escriben realmente hinglish (por ejemplo, «मेरा order कब आएगा»). Esto lo diferencia de sistemas que romanizan todo el texto o que fuerzan una sola escritura.

Udgam Labs retrenó los 55M de pesos de Whistle sobre 2.732 horas de habla india con licencia abierta y añadió 714 piezas de vocabulario devanagari. El resultado es un modelo Apache-2.0 que se ejecuta en macOS, Linux, Windows, Android, iOS y WebAssembly mediante el motor Cactus, sin llamadas de red en sus versiones CLI y WASM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (8 capas de encoder + 8 de decoder, anchura 512) |
| Parametros totales | 55M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (acepta audio de cualquier duración según la model card) |
| Tipos de cuantizacion | 4-bit pesos / 8-bit activaciones (formato `.cact`); fp32 completo en safetensors |
| Idiomas soportados | Hindi, inglés, hinglish (code-mixed); otros idiomas de Whistle (alemán, francés, español, italiano, neerlandés, polaco) no evaluados y probablemente más débiles |
| Licencia | Apache-2.0 |
| Formato de pesos | `.cact` (29,5 MB, motor Cactus), `.safetensors` (222 MB, fp32), ONNX disponible en `udgamlabs/Shruti-ONNX` |

## Arquitectura y entrenamiento

Shruti es un transformer encoder-decoder de 55M de parámetros con 8 capas de encoder y 8 de decoder, anchura 512. Parte del modelo base Cactus Whistle (Apache-2.0) y se retrenó completamente sobre 2.732 horas de habla india con licencia abierta. Los conjuntos de datos empleados incluyen IndicVoices, Vaani-transcription-part, Shrutilipi, NPTEL, Kathbath, Rural_Women_ASR_v2, Common Voice 17.0, LibriSpeech, FLEURS y MUCS-Hinglish. Además, se añadieron 714 piezas de vocabulario devanagari para manejar la escritura hindi nativa.

El modelo no emplea técnicas como decodificación especulativa ni atención lineal; su innovación principal es la eficiencia extrema en dispositivo: 29,5 MB en 4 bits y 80 MB de memoria en un Samsung Galaxy F62 de 2021, transcribiendo una frase en aproximadamente un segundo. La entrada es audio de 16 kHz de cualquier duración; la salida es texto con hindi en devanagari e inglés en latín minúsculas. El motor Cactus (Apache-2.0) soporta ejecución single-threaded en WebAssembly sin cabeceras especiales de servidor, y en móviles recomienda 2 hilos.

## Capacidades

- Transcripción de voz a texto en hindi, inglés y hinglish code-mixed, con detección automática del idioma.
- Salida con hindi en devanagari e inglés en latín minúsculas, preservando la mezcla de escrituras típica del hinglish.
- Soporte de `keywords=[...]` para favorecer nombres o términos concretos durante la transcripción.
- Soporte de `word_timestamps=True` para obtener marcas de tiempo por palabra.
- Transcripción en streaming (`--audio-stream`) palabra por palabra en la CLI.
- Ejecución totalmente offline en macOS, Linux, Windows, Android, iOS y WebAssembly.
- Entrada de audio de cualquier duración a 16 kHz.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step; es exclusivamente un modelo ASR.

## Casos de uso

- **Transcripción de reuniones y notas de voz en hinglish**: el modelo convierte audio de conversaciones informales donde los hablantes alternan hindi e inglés en texto con la mezcla de escrituras correcta, gracias a su entrenamiento específico en MUCS-Hinglish y su vocabulario devanagari ampliado.
- **Subtitulado offline en aplicaciones móviles**: con 29,5 MB y 80 MB de memoria, Shruti puede integrarse en apps Android o iOS mediante la librería C del motor Cactus (`cactus_load`, `cactus_transcribe`), generando subtítulos sin conexión y sin servidor.
- **Dictado por voz en navegador**: la build WebAssembly permite transcribir audio directamente en una página web single-threaded, sin cabeceras especiales de servidor, útil para herramientas de accesibilidad o formularios por voz.
- **Atención al cliente en centros de contacto indios**: el modelo transcribe consultas de clientes que mezclan hindi e inglés (por ejemplo, «मेरा order कब आएगा»), permitiendo analítica de llamadas y búsqueda de texto en grabaciones sin enviar audio a la nube.
- **Transcripción de contenido educativo**: dado su entrenamiento con NPTEL y Shrutilipi, puede transcribir clases y materiales educativos en hindi e inglés para generar apuntes o subtítulos buscables.
- **Procesamiento por lotes en CLI en servidores modestos**: el binario `cactus` permite transcribir ficheros de audio en macOS, Linux o Windows sin GPU, con la opción de streaming para procesamiento incremental.
- **Investigación en ASR code-mixed**: al ser Apache-2.0 y con pesos safetensors fp32, sirve como base para experimentos académicos sobre hinglish y acentos indios.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, %, menor es mejor). Todos los modelos fueron ejecutados por Udgam Labs sobre los mismos conjuntos de prueba con el mismo normalizador y scorer; Shruti en el motor on-device (5-beam, conjunto de idiomas), los demás en GPU o Mac. Medido el 2026-10-18/19. n/c: no comparable (el modelo solo escribe en alfabeto latino); –: no medido.

| Modelo | Tamano | Monsoon Hindi | FLEURS Hindi | Lahaja (acentos hindi) | MUCS Hinglish | Svarah (inglés indio) | LibriSpeech (inglés) | Palabras inventadas en 100 clips silenciosos |
|---|---|---|---|---|---|---|---|---|
| **Shruti** | **29,5 MB** | 20,46 | 19,92 | 26,28 | **35,21** | 22,47 | 5,95 | 0 |
| Koyal-hi-120M | 481 MB | **11,64** | **9,56** | 18,70 | 57,51 | Solo hindi | Solo hindi | 0 |
| IndicConformer Hindi (fp32) | 482 MB | 15,31 | 11,31 | **13,18** | 64,48 | Solo hindi | Solo hindi | 88 |
| Vosk small Hindi + Indian English | 139 MB | 35,75 | 18,0 | – | – | – | – | – |

## Requisitos de hardware

- **VRAM / memoria estimada**: 80 MB de memoria en un Samsung Galaxy F62 (2021) según la model card; el fichero `.cact` ocupa 29,5 MB en disco. El safetensors fp32 ocupa 222 MB.
- **GPU recomendadas**: no requiere GPU; el motor Cactus está pensado para CPU. No se especifican GPU recomendadas en la información disponible.
- **Consumer GPU**: no aplica; el modelo cabe en cualquier dispositivo de consumo, incluidos teléfonos móviles de gama media.
- **Opciones de despliegue**: motor Cactus (Python `cactus-compute`, CLI `cactus`, librería C `cactus.h`, WebAssembly), ONNX Runtime y sherpa-onnx mediante `udgamlabs/Shruti-ONNX`.
- **Latencia y throughput**: aproximadamente 1 segundo por frase en un Samsung Galaxy F62 con 2 hilos; no se proporcionan cifras de throughput para otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER Monsoon Hindi | WER MUCS Hinglish | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Shruti** | 55M | No disponible | 20,46 | **35,21** | Apache-2.0 | Hugging Face, ONNX, WASM |
| Koyal-hi-120M | 120M | No disponible | **11,64** | 57,51 | No disponible en la información | Hugging Face |
| IndicConformer Hindi | No disponible | No disponible | 15,31 | 64,48 | No disponible en la información | Hugging Face (ONNX) |
| Vosk small Hindi + Indian English | No disponible | No disponible | 35,75 | – | No disponible en la información | alphacephei.com |

Shruti es el único de los comparados que maneja hinglish con WER competitivo (35,21) y que se ejecuta offline en 29,5 MB; Koyal e IndicConformer obtienen mejor WER en hindi puro pero son mucho más grandes y no cubren inglés indio ni hinglish.

## Limitaciones y advertencias

- **Idiomas no evaluados**: los demás idiomas de Whistle (alemán, francés, español, italiano, neerlandés, polaco) no se evaluaron y probablemente sean más débiles tras el reentrenamiento.
- **Inglés puro**: la model card indica que la opción `language="en"` debe usarse solo para habla completamente en inglés; no se detalla el comportamiento en mezclas no evaluadas.
- **Sesgos**: no se documentan sesgos específicos en la información disponible; el entrenamiento con datasets indios puede reflejar sesgos de acento y registro de esas fuentes.
- **Alucinación**: el modelo muestra 0 palabras inventadas en 100 clips silenciosos, pero no se proporcionan métricas de alucinación en audio con ruido o dominio fuera de distribución.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo base Whistle también es Apache-2.0; no se indican restricciones adicionales.
- **Telemetría**: el paquete Python `cactus-compute` envía conteos de uso anónimos por defecto; debe configurarse `CACTUS_TELEMETRY=0` para desactivarla. La CLI y WebAssembly no hacen llamadas de red.
- **Contexto**: no se especifica una longitud máxima de audio; la model card afirma que acepta audio de cualquier duración, pero no hay datos de rendimiento en audios muy largos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/udgamlabs/Shruti)
- [Modelo base Cactus Whistle](https://huggingface.co/Cactus-Compute/whistle)
- [Shruti ONNX](https://huggingface.co/udgamlabs/Shruti-ONNX)
- [Demo en Hugging Face Spaces](https://huggingface.co/spaces/udgamlabs/Shruti)
- [Motor Cactus](https://huggingface.co/Cactus-Compute/cactus)
- [Demo en navegador](https://udgamlabs.com/models/shruti)
- [Código y ejemplos en GitHub](https://github.com/udgamlabs/shruti)
- [Informe técnico](https://udgamlabs.com/research/shruti)
- [Comparativa de evaluación](eval/comparison.md) (referenciada en la model card)
- [Modelos Vosk](https://alphacephei.com/vosk/models)
- [Koyal-hi-120M](https://huggingface.co/adalat-ai/koyal-hi-120m-1.0)
- [IndicConformer Hindi ONNX](https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-hi-onnx)
