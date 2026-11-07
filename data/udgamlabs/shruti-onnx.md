# udgamlabs/Shruti-ONNX

## Resumen

Shruti ONNX es una familia de modelos de reconocimiento automatico de voz (ASR) publicada por Udgam Labs, derivada del modelo base Cactus-Compute/whistle. El repositorio distribuye un modelo independiente por idioma, cada uno con aproximadamente 55 millones de parametros y un peso de unos 32 MB en su variante ONNX principal. El objetivo es claro: transcripcion de voz completamente offline en dispositivos modestos (telefonos, navegadores, portatiles), sin depender de servicios en la nube.

La relevancia del proyecto esta en su cobertura linguistica: 22 idiomas indios (asames, bengali, bodo, dogri, gujarati, hindi, kannada, konkani, kashmiri, maithili, malayalam, manipuri, marathi, nepali, odia, punyabi, sanscrito, santali, sindhi, tamil, telugu y urdu) mas el ingles. Cada modelo cubre su idioma nativo, el ingles y la mezcla de ambos (code-switching), con las palabras inglesas transcritas en alfabeto latino. Esto lo convierte en una solucion practica para contextos multilingues indios donde la alternancia de codigo es la norma.

El repositorio esta empaquetado para tres runtimes: ONNX Runtime (Python, servidores y escritorio), onnxruntime-web (navegador y Node) y sherpa-onnx (Android, iOS y C++ de escritorio, bajo el formato Moonshine). La licencia es Apache 2.0 y el formato de pesos es ONNX con cuantizacion de 4 bits en la variante principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo derivado de Cactus-Compute/whistle; empaquetado como Moonshine en sherpa-onnx) |
| Parametros totales | 55 M (por idioma) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (variante `onnx/`); int8 (variante `onnx-int8/`) |
| Idiomas soportados | as, bn, brx, doi, gu, hi, kn, kok, ks, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur, en (22 idiomas indios + ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (variantes `onnx/`, `onnx-int8/` y `sherpa-onnx/`) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la informacion disponible; el modelo base es Cactus-Compute/whistle, del que Shruti ONNX es una conversion a operadores ONNX estandar y una cuantizacion a 4 bits (con variante int8 adicional). Cada carpeta de idioma contiene los pesos del modelo publicado, escritos con operadores ONNX estandar, y el empaquetado para sherpa-onnx sigue el formato Moonshine (preprocesador, encoder, decodificador sin cache y decodificador con cache, mas el fichero de tokens).

No se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre tecnicas de RLHF o DPO. La model card indica que se evaluo cada build contra el mismo modelo en el motor original sobre los conjuntos de test propios de cada idioma, con intervalos de confianza apareados al 95 % sobre clips, lo que sugiere un proceso de validacion sistematico pero no describe el pipeline de entrenamiento.

## Capacidades

- Reconocimiento automatico de voz (ASR) offline, sin conexion a red.
- Transcripcion en 22 idiomas indios mas ingles, con deteccion automatica del idioma en la llamada `transcribe`.
- Soporte de code-switching (mezcla idioma nativo + ingles) con palabras inglesas en alfabeto latino.
- Seleccion manual del idioma de salida (`language="en"`) para mejorar la transcripcion de ingles con acento indio.
- Ejecucion en ONNX Runtime (Python y CLI), onnxruntime-web (navegador y Node) y sherpa-onnx (Android, iOS, C++ de escritorio).
- Entrada de audio a 16 kHz mono en formato Float32Array o WAV decodificado.
- Variante int8 para maquinas de baja memoria (unos 120 MB de memoria tras la carga, medido en hindi).

## Casos de uso

- Transcripcion offline en telefonos y portatiles: cada modelo pesa 32 MB en la variante ONNX principal y se ejecuta en ONNX Runtime, por lo que puede integrarse en aplicaciones moviles o de escritorio sin subir audio a la nube.
- Dictado y notas de voz en el navegador: con onnxruntime-web y el paquete `shruti-onnx` (npm), el modelo transcribe audio capturado del microfono directamente en el cliente, sin backend.
- Aplicaciones Android/iOS con sherpa-onnx: los ficheros de la carpeta `sherpa-onnx/` funcionan en las APIs Android, iOS y C++ de sherpa-onnx como modelo Moonshine, lo que permite integrar ASR en apps moviles nativas.
- Atencion al cliente en contextos multilingues indios: la cobertura de 22 idiomas y el soporte de code-switching permiten transcribir conversaciones donde el usuario alterna entre su idioma nativo y el ingles.
- Subtitulado y transcripcion de reuniones en hindi, tamil, telugu, bengali, etc.: el modelo cubre el idioma nativo y el ingles en el mismo pipeline, util para equipos con mezcla linguistica.
- Servidores de baja memoria en ARM: la variante `onnx-int8/` ocupa 53 MB en disco y unos 120 MB de memoria tras la carga (medido en hindi), adecuada para despliegues en dispositivos edge.
- Procesamiento por lotes de audios en Python: el paquete `shruti-onnx` y la CLI `shruti-onnx clip.wav --lang urdu` permiten automatizar transcripciones en pipelines de datos.
- Investigacion en ASR de lenguas de bajos recursos: los modelos por idioma y las tablas de resultados publicadas en RESULTS.md facilitan la comparacion entre builds y referencias.

## Benchmarks y rendimiento

La model card publica una tabla de resultados por idioma comparando cada build (`onnx/`, `onnx-int8/`, `sherpa-onnx/`) con el mismo modelo en el motor original, sobre los conjuntos de test propios de cada idioma, con intervalos de confianza apareados al 95 % sobre clips. La metrica es Word Error Rate (WER); un valor positivo significa mas errores que el motor original. La tabla completa esta en RESULTS.md; aqui se recogen las filas con conjuntos fuera del intervalo.

| Idioma | Codigo | Check | `onnx/` | `onnx-int8/` | `sherpa-onnx/` |
|---|---|---|---|---|---|
| Asames | as | MIXED | ninguno | ninguno | Svarah, English, set / detected: -0.80 [-1.50, -0.19] |
| Bengali | bn | MIXED | ninguno | ninguno | Svarah, English, set / detected: +0.90 [+0.21, +1.66] |
| Bodo | brx | MIXED | ninguno | DiarBench, romanised: +1.44 [+0.18, +3.07] | ninguno |
| Dogri | doi | FAIL | DiarBench, own script: +1.88 [+0.40, +3.29]; DiarBench, romanised: +1.46 [+0.22, +2.83] | IndicVoices, romanised: -1.17 [-2.73, -0.02] | ninguno |
| Gujarati | gu | MIXED | LibriSpeech, English, set / detected: -0.16 [-0.28, -0.04] | ninguno | ninguno |
| Hindi | hi | FAIL | DiarBench, own script: +1.19 [+0.09, +3.14]; DiarBench, romanised: +1.19 [+0.03, +3.17] | DiarBench, own script: +1.25 [+0.14, +3.21]; DiarBench, romanised: +1.22 [+0.04, +3.26] | DiarBench, own script: +1.18 [+0.06, +3.12] |
| Kannada | kn | FAIL | FLEURS, own script: +0.65 [+0.03, +1.29] | FLEURS, own script: +1.20 [+0.53, +1.97] | ninguno |
| Konkani | kok | FAIL | IndicVoices, own script: -0.56 [-1.07, -0.09]; IndicVoices, romanised: -0.74 [-1.49, -0.16] | IndicVoices, own script: -0.68 [-1.25, -0.15]; IndicVoices, romanised: -0.92 [-1.73, -0.27] | IndicVoices, romanised: -0.77 [-1.56, -0.12] |
| Kashmiri | ks | MIXED | ninguno | ninguno | ninguno |
| Maithili | mai | MIXED | ninguno | ninguno | ninguno |
| Malayalam | ml | MIXED | ninguno | Svarah, English, set / detected: -0.45 [-0.92, -0.02] | ninguno |
| Manipuri | mni | MIXED | DiarBench, romanised: +6.01 [+0.11, +18.87] | ninguno | ninguno |
| Marathi | mr | MIXED | DiarBench, romanised: +1.62 [+0.25, +3.32] | DiarBench, romanised: +1.38 [+0.07, +3.09] | ninguno |
| Nepali | ne | MIXED | ninguno | ninguno | FLEURS, own script: +1.45 [+0.21, +2.94] |
| Odia | or | FAIL | Svarah, English, set / detected: (dato truncado en la model card) | no disponible | no disponible |

Nota: la tabla de la model card esta truncada en la informacion proporcionada a partir de la fila de Odia; el resto de idiomas (pa, sa, sat, sd, ta, te, ur) no tienen datos publicados en el material disponible. Ningun idioma alcanzo las seis reglas de validacion del autor, por lo que ninguno esta etiquetado como PASS; todos los idiomas incumplen la regla de que sherpa-onnx debe coincidir con Python en cada clip, principalmente en dos clips de ingles de 30 s o mas, donde los paquetes recortan audio y sherpa-onnx no. En marathi, manipuri y nepali la proporcion de letras latinas en la salida de sherpa-onnx tambien difiere de la del motor en mas de un punto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es de 55 M de parametros y esta pensado para ejecucion en CPU.
- Memoria tras la carga: unos 120 MB en la variante `onnx-int8/` (medido en hindi); la variante `onnx/` es la de menor descarga (32 MB en disco).
- GPU recomendadas: no aplica; el modelo se ejecuta en ONNX Runtime (CPU), onnxruntime-web (navegador) y sherpa-onnx (Android, iOS, C++ de escritorio). No se especifican GPU.
- Cabe en GPU consumer: si, por el tamano (32-55 MB de pesos), pero el diseno apunta a CPU y ejecucion en dispositivo.
- Opciones de despliegue: ONNX Runtime (Python via `pip install shruti-onnx`), onnxruntime-web (npm `shruti-onnx` + `onnxruntime-web`), sherpa-onnx (APIs Android, iOS y C++), CLI `shruti-onnx clip.wav --lang urdu`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shruti ONNX (udgamlabs) | 55 M por idioma | no disponible | 22 idiomas indios + en | Apache 2.0 | Hugging Face (ONNX, int8, sherpa-onnx) |
| Cactus-Compute/whistle (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Shruti Tamil (udgamlabs) | no disponible | no disponible | tamil, en, code-switching | Apache 2.0 | Hugging Face |
| Shruti (udgamlabs, repo GitHub) | 29.5 MB de pesos | no disponible | hindi, en, hinglish | no disponible | GitHub |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada; la comparativa se limita a tamano, cobertura linguistica y licencia.

## Limitaciones y advertencias

- Ningun idioma alcanzo las seis reglas de validacion del autor; ninguno esta etiquetado como PASS, y varios idiomas (dogri, hindi, kannada, konkani, odia) estan marcados como FAIL en la tabla de resultados.
- Todos los idiomas incumplen la regla de que sherpa-onnx debe coincidir con Python en cada clip, principalmente en clips de ingles de 30 s o mas, donde los paquetes recortan audio y sherpa-onnx no.
- En marathi, manipuri y nepali la proporcion de letras latinas en la salida de sherpa-onnx difiere de la del motor original en mas de un punto.
- El rendimiento varia por build: la variante `onnx-int8/` muestra desviaciones en bodo, dogri, hindi, kannada, konkani y malayalam; la variante `onnx/` en dogri, gujarati, hindi, kannada, konkani, manipuri y marathi.
- La tabla de resultados de la model card esta truncada a partir de odia; no hay datos publicados para los idiomas pa, sa, sat, sd, ta, te, ur en el material disponible.
- No se detallan sesgos conocidos, riesgo de alucinacion ni limitaciones de contexto en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los terminos del modelo base Cactus-Compute/whistle y de los datasets de evaluacion (Svarah, DiarBench, IndicVoices, FLEURS, LibriSpeech) antes de un despliegue en produccion.
- El modelo esta disenado para audio a 16 kHz mono; otras frecuencias o canales requieren remuestreo previo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/Shruti-ONNX
- Modelo base: https://huggingface.co/Cactus-Compute/whistle
- Repositorio GitHub de Shruti: https://github.com/udgamlabs/shruti
- Modelo Shruti Tamil: https://huggingface.co/udgamlabs/shruti-tamil
- Tabla completa de resultados: RESULTS.md (referenciado en la model card, no se proporciona URL directa)
- Manifiesto de ficheros: MANIFEST.json (incluido en el repositorio, no se proporciona URL directa)
