# TujiaNLP/tujia-tts-v0.3

## Resumen

`tujia-tts-v0.3` es un modelo de síntesis de voz (text-to-speech) de un solo hablante desarrollado por TujiaNLP para el tujia, una lengua minoritaria y en peligro de extinción hablada en China. El modelo toma como entrada pinyin Ye (la transcripción de Ye De-shu, con letras tonales `x/f/r/v`) o IPA con tonos en notación Chao, y genera audio mono a 16 kHz en una única voz fija denominada *badou*. Está construido sobre la arquitectura VITS y se distribuye en formato ONNX (opset 15) con un fichero de configuración estilo piper, lo que permite inferencia ligera vía `onnxruntime`.

Se trata de una publicación de investigación de recursos limitados: el corpus de entrenamiento es de solo 6,40 horas y 3.958 clips, y no se distribuye. La relevancia del modelo radica en que aborda una lengua con muy pocos recursos digitales, con un pipeline de normalización de texto delegado al paquete `tujia-nlp` y una evaluación basada en tasa de error de fonemas medida con un ASR propio del tujia. La versión 0.3 mejora la 0.2 en pérdida de mel de validación (0,4523 frente a 0,5108) y en error de fonemas (0,690 frente a 0,784).

El modelo no soporta caracteres chinos, no tiene control de prosodia más allá de `length_scale`, no permite selección ni clonación de voz, y su licencia es únicamente para investigación. Es adecuado para prototipado y demostraciones revisadas por hablantes nativos, no para material docente o publicación sin revisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (SynthesizerTrn de un solo hablante), exportado a ONNX opset 15 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase, sin ventana de contexto declarada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | tujia (`zh` como etiqueta de idioma en el repo; entrada en pinyin Ye o IPA con tonos) |
| Licencia | research-preview (uso solo para investigación; código MIT, pesos bajo `NOTICE`) |
| Formato de pesos | ONNX (`.onnx`) + configuración `.onnx.json` estilo piper |
| Frecuencia de muestra de salida | 16.000 Hz, mono |
| Hablantes | 1 (`num_speakers=1`, `speaker_id_map` vacío) |
| Símbolos | 41 (fonemas IPA + tokens de tono `T0`–`T4`) |
| Entradas del grafo ONNX | `input`, `input_lengths`, `scales` (sin `emb_g`/`sid`) |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema de TTS de extremo a extremo que combina un codificador de texto, un prior variacional, un decoder generativo y un discriminador adversarial en entrenamiento. En esta release el `SynthesizerTrn` es de un solo hablante, por lo que el grafo ONNX exportado tiene exactamente tres entradas (`input`, `input_lengths`, `scales`) y carece de canal de identidad de hablante (`emb_g`/`sid`). La configuración usa un hop de 256 muestras a 16 kHz, lo que da una resolución de 16 ms por frame.

El entrenamiento se realizó sobre 3.958 clips que suman 6,40 horas, con el timbre unificado a la voz *badou*. El corpus es interno y no se distribuye. La validación alcanzó una pérdida de mel de 0,4523. El vocabulario consta de 41 símbolos: fonemas IPA más tokens de tono `T0`–`T4`, con finales `-ng` representados como `aŋ/eŋ/iŋ/oŋ` y la regla `z/c/s/r + i → ɿ`. El front-end delega la segmentación silábica, el análisis de iniciales/finales y la normalización tonal al paquete `tujia-nlp` (`tujia_nlp.corpus`, `tujia_nlp.tones`), y añade un token de tono por sílaba. No se documenta uso de RLHF ni DPO; es un entrenamiento supervisado clásico de TTS.

## Capacidades

- Síntesis de voz de texto tujia en pinyin Ye (letras tonales `x`=55, `f`=35, `r`=21, `v`=53) o IPA con tonos en notación Chao (dígitos, superíndices o letras Chao).
- Detección automática de la notación de entrada empleada.
- Normalización de notación, segmentación silábica y análisis de iniciales/finales mediante `tujia-nlp`.
- Descarte controlado de símbolos desconocidos con conteo (nunca un `KeyError` silencioso); entrada vacía lanza excepción.
- Postprocesado de la forma de onda: recorte de silencio inicial y final (−40 dBFS relativo al pico, margen de 30 ms), normalización de pico a −1 dBFS y fundido de entrada/salida de 10 ms.
- Control de duración mediante `length_scale` (único parámetro de prosodia disponible).
- Salida mono a 16 kHz.
- No soporta caracteres chinos, SSML, pausas, énfasis, clonación ni conversión de voz.

## Casos de uso

- Investigación en TTS de bajos recursos: el modelo sirve como línea base reproducible para experimentos con corpus de menos de 10 horas, con métricas de validación (mel loss 0,4523) y de error de fonemas (0,690) publicadas para comparar.
- Prototipado de interfaces de voz en tujia: permite generar avisos y respuestas cortas para aplicaciones comunitarias, con la salvedad de que la salida debe revisarse por hablantes nativos antes de su difusión.
- Demostraciones comunitarias revisadas: material de divulgación sobre la lengua tujia que pase por revisión de hablantes nativos, aprovechando la voz única *badou* y el pipeline de postprocesado incluido.
- Evaluación de front-ends de normalización: al delegar la segmentación y el análisis tonal en `tujia-nlp`, el modelo sirve para validar ese paquete con entradas en pinyin Ye e IPA con tonos.
- Integración en pipelines ONNX ligeros: al ser un grafo ONNX de tres entradas con `onnxruntime`, encaja en servicios de inferencia de baja latencia sin dependencias de frameworks pesados.
- Experimentación con vocabularios fonéticos: los 41 símbolos y las reglas de finales (`-ng` como `aŋ/eŋ/iŋ/oŋ`, `z/c/s/r + i → ɿ`) permiten probar variantes de transcripción y medir su efecto en la inteligibilidad.
- Comparación de versiones: la tabla de evaluación v0.2/v0.3 (error de fonemas 0,784 → 0,690) permite estudiar el efecto de ampliar el corpus de 4,10 h a 6,40 h.

## Benchmarks y rendimiento

| Métrica | v0.2 | v0.3 |
|---|---|---|
| Tasa de error de fonemas, 40 frases de prueba (audio sintetizado) | 0,784 | 0,690 (mediana) |
| Tasa de error de fonemas, mismas frases (audio humano) | 0,567 | 0,567 |
| Pérdida de mel de validación | 0,5108 | 0,4523 |

La evaluación consiste en sintetizar las 40 frases, pasarlas por el ASR de tujia y comparar con la cadena IPA esperada. La fila de audio humano representa el suelo de ruido del ASR sobre las grabaciones originales, por lo que solo la diferencia entre filas es significativa. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo pesa 0,1 GB y el modelo es un VITS de un solo hablante, por lo que la huella es muy reducida y cabe en CPU.
- GPU recomendadas: no se especifican; al ejecutarse con `onnxruntime`, cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 4090, A100, H100) puede acelerar la inferencia, pero no hay datos publicados de rendimiento por GPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna e incluso en CPU, dado el tamaño del repo (0,1 GB); no hay cifras oficiales de VRAM.
- Opciones de despliegue: `onnxruntime` (librería declarada). No es compatible con el front-end estándar de piper (espeak-ng) porque usa `phoneme_type: "text"` con tokens de tono de dos caracteres; debe usarse el front-end incluido en el paquete.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| tujia-tts-v0.3 | VITS, un hablante | no disponible | no aplica | tujia | research-preview | ONNX |
| Piper (voces estándar) | VITS | no disponible | no aplica | múltiples | MIT (mayoría) | ONNX |
| Modelos TTS multilingües comerciales | variable | no disponible | no aplica | decenas | propietaria | variable |

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la información proporcionada. La comparación con piper es relevante por formato (ONNX + `.onnx.json`) pero el modelo no es una voz piper compatible por su front-end fonético.

## Limitaciones y advertencias

- El tono es aproximado: los tokens de tono se entrenan con la anotación del corpus y no se modelan sandhi ni alargamiento enfático.
- Las palabras monosilábicas cortas son el punto más débil, por su sensibilidad a la prosodia y a la tasa de frames de 16 ms.
- Sin control de prosodia: no hay SSML, pausas ni énfasis; `length_scale` es el único parámetro.
- Un solo hablante: sin conversión de voz, clonación ni selección multi-hablante; cambiar de voz requiere cambiar el fichero del modelo.
- Las oclusivas se difuminan: la configuración 16 kHz / hop 256 da 16 ms por frame, más grueso que una explosión de oclusiva; el audio sintético es más brillante que las grabaciones reales (proporción de energía en banda alta 0,177 frente a 0,104) y las explosiones son menos densas.
- No es una voz piper: `phoneme_type: "text"` con tokens de tono de dos caracteres impide usar el front-end estándar de piper (espeak-ng).
- No soporta caracteres chinos.
- Riesgo de alucinación y errores de pronunciación en vocabulario poco frecuente, dado el corpus de 6,40 h.
- Licencia de solo investigación: los pesos no permiten redistribución comercial; el código es MIT pero los pesos están bajo `NOTICE`.
- El consentimiento de los hablantes no se ha confirmado por grabación de origen; cualquier uso comercial o redistribución requiere revisión de derechos.
- El tujia está en peligro: las salidas deben revisarse por hablantes nativos antes de uso comunitario o educativo.
- No apto para material de publicación o enseñanza sin revisión nativa, ni para afirmar que la salida es una grabación de una persona real.

## Enlaces

- Hugging Face: https://huggingface.co/TujiaNLP/tujia-tts-v0.3
- Licencia (NOTICE): https://github.com/ibaibing/tujia-tts/blob/main/NOTICE
- Repositorio del proyecto: https://github.com/ibaibing/tujia-tts
