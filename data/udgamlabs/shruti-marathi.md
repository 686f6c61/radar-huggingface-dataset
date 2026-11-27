# udgamlabs/shruti-marathi

## Resumen

Shruti Marathi es un modelo de reconocimiento automático del habla (ASR) desarrollado por Udgam Labs, especializado en transcribir marathi y conversaciones con mezcla de marathi e inglés (*code-switching*). Con 55,7 millones de parámetros y un fichero de pesos de apenas 29,7 MB en cuantización de 4 bits, está diseñado para ejecutarse íntegramente en el dispositivo, sin conexión a internet y sin servidor, sobre el motor Cactus (Apache-2.0) en macOS, Linux, Windows, Android, iOS y WebAssembly.

El modelo parte de Shruti Hindi (también de Udgam Labs), que a su vez se construye sobre Cactus Whistle (Cactus Compute). Udgam Labs reentrenó todos los pesos sobre corpus abiertos de habla marathi e inglesa y añadió 400 piezas de vocabulario marathi. La salida en marathi se produce en escritura devanagari, mientras que las palabras inglesas se mantienen en latín en minúsculas, reflejando la forma en que los hablantes bilingües escriben realmente.

Su relevancia radica en la combinación de tamaño mínimo, ejecución offline y buen rendimiento en habla conversacional y espontánea con mezcla de idiomas: en las mediciones publicadas por el autor, supera a Whisper tiny y Whisper base por márgenes amplios en todos los conjuntos evaluados, y queda por detrás de IndicConformer Marathi (unas 5 veces más grande) solo en habla leída.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (8 capas de encoder + 8 de decoder, anchura 512), heredada de Cactus Whistle vía Shruti Hindi |
| Parametros totales | 55,7 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (acepta audio de 16 kHz de cualquier duración según el autor) |
| Tipos de cuantizacion | Pesos de 4 bits con activaciones de 8 bits (fichero `.cact`); se incluye un fichero fp32 en safetensors no probado |
| Idiomas soportados | Marathi (mr), inglés (en) y marathi mezclado con inglés; no soporta hindi |
| Licencia | Apache-2.0 |
| Formato de pesos | `.cact` (motor Cactus, 29,7 MB) y `.safetensors` (fp32) |

## Arquitectura y entrenamiento

Shruti Marathi es un transformer encoder-decoder compacto de 55,7 M de parámetros, con 8 capas en el encoder y 8 en el decoder y una anchura de 512. La arquitectura procede de Cactus Whistle, un modelo ASR ligero de Cactus Compute, y llega a Shruti Marathi a través de Shruti Hindi. Udgam Labs reentrenó la totalidad de los pesos sobre datos abiertos de habla marathi e inglesa y amplió el vocabulario con 400 piezas específicas del marathi, lo que permite emitir devanagari para el marathi y latín para el inglés dentro de la misma transcripción.

Los conjuntos de datos empleados, según la model card, son ai4bharat/IndicVoices, ai4bharat/Kathbath, SPRINGLab/SPRING_INX_Marathi_R1, SPRINGLab/SPRING_INX_Marathi_R2, ARTPARK-IISc/Vaani-transcription-part y openslr/librispeech_asr. No se detalla el número exacto de horas de audio, la composición porcentual del corpus ni si se aplicaron etapas de RLHF o DPO; esa información no está disponible. La innovación principal no reside en la arquitectura, sino en el formato de despliegue: pesos de 4 bits con activaciones de 8 bits empaquetados en un único fichero de 29,7 MB ejecutable en el motor Cactus, con soporte de transcripción en streaming palabra a palabra y una compilación WebAssembly de un solo hilo que no requiere cabeceras de servidor especiales.

## Capacidades

- Transcripción de voz a texto en marathi, con salida en escritura devanagari.
- Transcripción de inglés, con salida en latín en minúsculas.
- Manejo de *code-switching* marathi-inglés dentro de la misma frase, preservando las palabras inglesas sin traducirlas.
- Detección automática del idioma del audio (devuelve el campo `language` junto al texto).
- Aceptación de audio de 16 kHz de cualquier duración.
- Modo de transcripción en streaming palabra a palabra mediante `--audio-stream`.
- Ejecución totalmente offline en macOS, Linux, Windows, Android, iOS y WebAssembly.
- Integración en aplicaciones móviles mediante la biblioteca C del motor (`cactus.h`).
- No soporta hindi; para ese idioma el autor remite a Shruti Hindi.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Subtitulado y transcripción de reuniones en marathi: el modelo acepta audio de cualquier duración y puede ejecutarse en local sobre el portátil del usuario, de modo que las conversaciones confidenciales no salen del dispositivo.
- Aplicaciones móviles de notas de voz: con 29,7 MB y 64 MB de memoria en un Samsung Galaxy F62 (2021), el modelo cabe en el binario de una app Android o iOS y transcribe sin conexión, útil en zonas con conectividad intermitente.
- Atención al cliente en marathi con mezcla de inglés: el modelo preserva términos ingleses habituales en el habla comercial (por ejemplo, "order pick", "deliver", "location share"), lo que reduce la corrección manual posterior en centros de contacto bilingües.
- Transcripción de llamadas telefónicas: en el conjunto SPRING-INX de llamadas telefónicas obtiene un 42,9 % de WER, el mejor resultado entre los modelos comparados de tamaño similar, lo que lo hace adecuado para análisis de calidad en centros de llamadas.
- Herramientas web sin backend: la compilación WebAssembly permite ofrecer dictado en una página web sin enviar audio a ningún servidor, relevante para aplicaciones educativas o administrativas con requisitos de privacidad.
- Accesibilidad y dictado en campo: técnicos agrícolas o sanitarios que trabajan en zonas rurales de Maharashtra pueden dictar informes por voz en el dispositivo, sin depender de cobertura de datos.
- Investigación lingüística sobre marathi conversacional: al ser Apache-2.0 y ejecutable en CPU, sirve para generar transcripciones a gran escala de corpus propios sin coste de infraestructura GPU.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, %, menor es mejor) sobre 200 clips por conjunto, medida por el autor entre el 30 de octubre y el 2 de noviembre de 2026 con el mismo normalizador y scorer para todos los modelos:

| Modelo | Tamano | FLEURS (leido) | Kathbath (leido) | DiarBench (conversacion) | IndicVoices | SPRING-INX (telefono) | Vaani (espontaneo) |
|---|---|---|---|---|---|---|---|
| Shruti Marathi | 29,7 MB | 29,9 | 24,5 | 38,2 | 22,2 | 42,9 | 32,2 |
| Whisper tiny | 44 MB | 273,1 | 278,1 | 373,9 | 321,8 | 375,6 | 338,7 |
| Whisper base | 82 MB | 177,9 | 193,2 | 402,9 | 450,2 | 420,6 | 412,3 |
| Dolphin base (int8) | 103,7 MB | 71,6 | 74,0 | 97,0 | 95,8 | 96,2 | 94,4 |
| marathi-conformer-33m-moe (fp32) | 136,7 MB | 41,0 | 32,2 | 76,7 | 66,0 | 77,3 | 64,0 |
| IndicConformer Marathi (int8) | 137,7 MB | 22,4 | 14,1 | 41,5 | 27,6 | 53,0 | 44,0 |

Según el autor, Shruti Marathi es el modelo abierto de menos de 100 MB más preciso en marathi entre los medidos, y solo IndicConformer Marathi, unas 5 veces mayor, lo supera en habla leída. Además, en un Samsung Galaxy F62 de 2021 transcribe 12 veces más rápido que el tiempo real con 64 MB de memoria.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el fichero `.cact` ocupa 29,7 MB y el autor reporta 64 MB de memoria en uso durante la inferencia en un Galaxy F62.
- GPU recomendadas: no aplica; el motor Cactus está pensado para CPU. No se documenta soporte de aceleración por GPU.
- Compatibilidad con GPU de consumo: irrelevante por diseño, ya que el objetivo es ejecución en CPU y dispositivos móviles.
- Plataformas de despliegue: motor Cactus (binario de línea de comandos, biblioteca C `cactus.h`, paquete Python `cactus-compute`, compilación WebAssembly) en macOS, Linux, Windows, Android, iOS y navegador.
- Latencia y throughput: 12 veces más rápido que el tiempo real en un Samsung Galaxy F62 de 2021; no se publican cifras de latencia por fragmento ni de throughput en otros dispositivos.
- Nota operativa: el paquete Python `cactus-compute` envía contadores de uso anónimos salvo que se defina `CACTUS_TELEMETRY=0`; el binario de línea de comandos y la compilación WebAssembly no realizan llamadas de red.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | WER medio en los seis conjuntos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shruti Marathi | 55,7 M | Audio de cualquier duración | Mejor en conversación, telefono y espontaneo entre los modelos de su tamano | Apache-2.0 | Hugging Face, motor Cactus, WASM |
| IndicConformer Marathi | No disponible (137,7 MB int8) | No disponible | Mejor en habla leida (22,4 y 14,1), peor en telefono y espontaneo | No disponible en la informacion | ONNX en Hugging Face |
| marathi-conformer-33m-moe | 33 M (MoE) | No disponible | Intermedio; peor que Shruti Marathi en todos los conjuntos | No disponible en la informacion | Hugging Face |
| Whisper tiny | 39 M | 30 s por ventana | Muy superior en error en marathi (273-376) | MIT | OpenAI, ampliamente desplegado |

Frente a Whisper tiny y Whisper base, Shruti Marathi reduce el WER en un orden de magnitud en marathi, a costa de perder cobertura multilingue general. Frente a IndicConformer Marathi, cede en habla leida pero gana en habla conversacional y telefonica, y ofrece un despliegue en dispositivo mucho más ligero.

## Limitaciones y advertencias

- Solo cubre marathi e inglés; no soporta hindi ni otras lenguas indias, pese a que el habla real en Maharashtra puede incluir otras.
- El WER en habla espontánea y telefónica sigue siendo alto en términos absolutos (42,9 % en SPRING-INX), por lo que las transcripciones requerirán revisión en entornos de producción exigentes.
- No se han publicado datos sobre sesgos demográficos, acentos regionales o variedades dialectales del marathi; se desconoce su comportamiento fuera de los corpus de evaluación.
- Riesgo de alucinación y de errores en nombres propios, cifras y términos técnicos no vistos en entrenamiento, habitual en modelos ASR pequeños.
- El fichero fp32 en safetensors se incluye pero el autor indica explícitamente que no lo ha probado; el formato soportado y validado es `.cact`.
- No se documenta el número de horas de entrenamiento ni la composición del corpus, lo que dificulta evaluar la cobertura y las licencias de los datos subyacentes más allá de los conjuntos listados.
- El paquete Python activa telemetría anónima por defecto; en despliegues con requisitos de privacidad debe desactivarse con `CACTUS_TELEMETRY=0` o usarse el binario o la versión WASM.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Cactus Whistle y los corpus de terceros pueden tener condiciones propias que conviene verificar antes de un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/shruti-marathi
- Shruti Hindi (modelo base directo): https://huggingface.co/udgamlabs/Shruti
- Cactus Whistle (modelo base original): https://huggingface.co/Cactus-Compute/whistle
- Motor Cactus: https://huggingface.co/Cactus-Compute/cactus
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Demo en navegador: https://udgamlabs.com/models/shruti?lang=mr
- Codigo y ejemplos: https://github.com/udgamlabs/shruti
- Comparativa de evaluacion: https://huggingface.co/udgamlabs/shruti-marathi/blob/main/eval/comparison.md
- Whisper tiny: https://huggingface.co/openai/whisper-tiny
- Whisper base: https://huggingface.co/openai/whisper-base
- Dolphin base: https://huggingface.co/DataoceanAI/dolphin-base
- marathi-conformer-33m-moe: https://huggingface.co/rimrafadii/marathi-conformer-33m-moe
- IndicConformer Marathi (ONNX): https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-mr-onnx
