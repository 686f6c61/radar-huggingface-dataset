# touati-kamel/Hadra-TTS-piper

## Resumen

Hadra-TTS Piper es un motor de síntesis de voz (text-to-speech) neuronal desarrollado por el usuario touati-kamel, orientado a la lengua argelina (darja, código `arq`) con soporte también para árabe estándar (`ar`). El modelo se distribuye en formato ONNX Runtime y es compatible con el ecosistema Piper, lo que permite inferencia offline en dispositivos embebidos, Raspberry Pi y aplicaciones móviles sin dependencia de servicios en la nube. Está construido sobre la arquitectura VITS, un modelo generativo end-to-end que combina inferencia variacional con entrenamiento adversario para producir audio directamente a partir de texto.

La relevancia del modelo radica en su especialización: la darja argelina es una variedad dialectal con escasa cobertura en sistemas TTS comerciales, y este proyecto la aborda con un modelo multi-hablante de tres voces (una conversacional con realización velar `g`, una narrativa masculina y una narrativa femenina). El modelo se entrenó con tres colecciones de audio argelino publicadas en Hugging Face bajo el prefijo `oddadmix/arabic-audio-collection-algerian-*`.

Las especificaciones publicadas son limitadas: no se detallan el número de parámetros, la longitud de contexto textual ni los resultados de evaluación. La model card se centra en las características de despliegue (formato ONNX, frecuencia de muestreo, latencia) y en la identificación de las tres voces disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | árabe (`ar`), darja argelina (`arq`) |
| Licencia | MIT |
| Formato de pesos | ONNX Runtime (`model.onnx` + `model.onnx.json`) |
| Frecuencia de muestreo | 22.050 Hz, PCM mono 16 bits |
| Voces / speaker IDs | 3 (`0` kahwa, `1` rawi, `2` loubna) |
| Librería | Piper |
| Latencia declarada | < 50 ms en Raspberry Pi 4 / CPU moderna |

## Arquitectura y entrenamiento

El modelo emplea VITS, una arquitectura de síntesis end-to-end que integra un codificador de texto, un predictor de duración, un flujo normalizador y un decodificador generativo entrenado de forma adversarial junto a un discriminador. Esta combinación permite generar formas de onda directamente desde la secuencia de texto sin necesidad de un vocoder externo, lo que explica su idoneidad para despliegue en dispositivos con recursos limitados y su baja latencia declarada.

El entrenamiento se realizó sobre tres conjuntos de datos de audio argelino alojados en Hugging Face: `oddadmix/arabic-audio-collection-algerian-kahwa-postcast`, `oddadmix/arabic-audio-collection-algerian-rawi` y `oddadmix/arabic-audio-collection-algerian-loubna-stories`. Cada conjunto corresponde presumiblemente a una de las tres voces del modelo (podcast conversacional, narración masculina y narración femenina). No se especifican en la información disponible el número de horas de audio, el volumen de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron técnicas de ajuste como RLHF o DPO, algo por otra parte poco habitual en modelos TTS.

## Capacidades

- Síntesis de voz multi-hablante con tres voces diferenciadas: `kahwa` (conversacional, realización velar `g`), `rawi` (narrador masculino expresivo, realización uvular `q`) y `loubna` (narradora femenina, realización uvular `q`).
- Generación de audio a 22.050 Hz en PCM mono de 16 bits.
- Inferencia offline mediante ONNX Runtime, compatible con la CLI de Piper en C++ y Python.
- Manejo de texto mixto darja-árabe con inserciones de código y latinas, como se observa en el ejemplo de la model card (code-switching árabe-francés).
- No se documentan capacidades de clonación de voz, control de emociones, tool calling ni razonamiento multi-paso (no aplicables a un modelo TTS).

## Casos de uso

- Asistentes de voz para darja argelina en aplicaciones móviles: el formato ONNX y la latencia inferior a 50 ms en CPU permiten ejecutar la síntesis en el propio dispositivo, sin conexión y sin enviar texto del usuario a servidores externos.
- Lectura de noticias y contenidos en árabe argelino: las voces `rawi` y `loubna` están orientadas a narración, por lo que encajan en la locución automatizada de artículos, boletines o resúmenes.
- Podcasts y audiolibros generados: la voz `kahwa`, con su realización conversacional, es adecuada para contenido de estilo coloquial y diálogo, mientras que `loubna` cubre narración de historias.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de interfaces y documentos para hablantes de darja, una comunidad con poca cobertura en TTS comerciales.
- Sistemas de megafonía y avisos en entornos con recursos limitados: la compatibilidad con Raspberry Pi 4 permite desplegar anuncios automatizados en estaciones, comercios o edificios sin infraestructura de servidor.
- Prototipado e investigación en dialectología: el modelo sirve como base para experimentos de TTS en variedades magrebíes y para comparar realizaciones fonéticas (`g` frente a `q`) entre voces.
- Integración en pipelines de doblaje o subtitulado: la CLI de Piper facilita la generación por lotes de pistas de audio a partir de guiones de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica de rendimiento declarada es una latencia de inferencia inferior a 50 ms en Raspberry Pi 4 y CPU moderna, sin especificar el hardware exacto, la longitud del texto de entrada ni el método de medición.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un modelo VITS de tamaño reducido y ejecutarse mediante ONNX Runtime, es esperable que quepa en memoria de CPU sin GPU dedicada, aunque no se publica el tamaño de los pesos.
- GPU recomendadas: no se especifican. El modelo está optimizado para CPU y dispositivos embebidos; una GPU no es necesaria para su funcionamiento.
- Compatibilidad con GPU de consumo: no confirmada explícitamente, pero el diseño orientado a Raspberry Pi 4 sugiere que cualquier GPU de consumo moderna es sobradamente suficiente si se desea acelerar la inferencia.
- Opciones de despliegue: CLI de Piper (C++ y Python) con ONNX Runtime; el formato `model.onnx` más `model.onnx.json` es el estándar de Piper.
- Latencia y throughput: latencia declarada inferior a 50 ms en Raspberry Pi 4 / CPU moderna; no se publica throughput (caracteres o segundos de audio por segundo).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia conceptual, otros sistemas TTS multi-hablante ligeros (por ejemplo, variantes de Piper para otras lenguas o modelos VITS multilingües) comparten arquitectura y formato de despliegue, pero no se aportan datos de parámetros, contexto ni rendimiento que permitan una comparación cuantitativa rigurosa.

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hadra-TTS Piper | VITS | ar, arq | ONNX (Piper) | MIT | Hugging Face |
| Alternativas Piper para otras lenguas | VITS | varias | ONNX (Piper) | variable | Hugging Face / repositorios Piper |
| Modelos TTS multilingües comerciales | no disponible | amplio | API / pesos propietarios | propietaria | servicios en la nube |

## Limitaciones y advertencias

- La información publicada es muy escasa: no se detallan parámetros, datos de entrenamiento (horas de audio, número de hablantes de origen), métricas de calidad (MOS, WER) ni evaluación objetiva alguna.
- El modelo está especializado en darja argelina y árabe; no se declara soporte para otras lenguas, y el rendimiento fuera de `ar`/`arq` es desconocido.
- Riesgo de alucinación y artefactos de pronunciación en palabras fuera del vocabulario de entrenamiento, especialmente en code-switching con francés u otras lenguas no documentadas.
- Posibles sesgos derivados del corpus: las tres voces proceden de un número reducido de fuentes (`kahwa`, `rawi`, `loubna`), lo que limita la diversidad de edad, género y registro más allá de esas tres identidades.
- Sin datos sobre robustez ante texto con números, abreviaturas, siglas o puntuación atípica; el comportamiento en esos casos no está documentado.
- La licencia MIT permite uso comercial, pero el usuario debe verificar las condiciones de los conjuntos de datos de origen (`oddadmix/arabic-audio-collection-algerian-*`) antes de explotar el modelo en producción.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se documenta el proceso de conversión a ONNX ni la versión de Piper requerida; la compatibilidad con versiones futuras de Piper no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/touati-kamel/Hadra-TTS-piper
- Dataset de entrenamiento (voz kahwa): https://huggingface.co/datasets/oddadmix/arabic-audio-collection-algerian-kahwa-postcast
- Dataset de entrenamiento (voz rawi): https://huggingface.co/datasets/oddadmix/arabic-audio-collection-algerian-rawi
- Dataset de entrenamiento (voz loubna): https://huggingface.co/datasets/oddadmix/arabic-audio-collection-algerian-loubna-stories
- Proyecto Piper (motor de inferencia): https://github.com/rhasspy/piper
