# Suarify/kecil-tts-michael-v0.2

## Resumen

Kecil-TTS Michael v0.2 es un modelo de síntesis de voz (text-to-speech) para bahasa melayu (malayo de Malasia) con voz masculina, desarrollado por el usuario Suarify. Se trata de un modelo extremadamente compacto: 7,9 millones de parámetros y un único archivo ONNX de 8,46 MB con pesos cuantizados a int8, lo que permite ejecutarlo dentro de una pestaña de navegador mediante transformers.js (WebGPU o WASM) o en un solo hilo de CPU en Python. Su arquitectura y receta de entrenamiento derivan de Paradee-8M-v1.3 de Sahil Mahendrakar, partiendo de su fila de voz masculina estadounidense.

El modelo resuelve un problema muy concreto: disponer de TTS en malayo con un coste computacional y de despliegue mínimo, sin necesidad de GPU dedicada ni de servicios en la nube. Es la primera versión de la variante masculina y el hermano del modelo femenino Kecil-TTS Yati v0.3, con el que comparte tamano, código y front end lingüístico. La salida es audio mono a 24 kHz.

Es relevante ahora porque demuestra que es viable llevar TTS a entornos de borde y web con un modelo de menos de 10 MB, aunque con una calidad todavía limitada: la propia model card advierte de que es comprensible pero comete más errores de palabra que el modelo femenino, y de que el audio suena en ocasiones robótico. La licencia Apache-2.0 facilita su integración comercial, con la salvedad de los recursos léxicos derivados de Wiktionary.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Paradee-8M-v1.3 (modelo acústico neuronal con decodificador de 128 armónicos sinusoidales); front end fonémico basado en reglas con vocabulario de 178 símbolos de Kokoro-82M |
| Parametros totales | 7,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (diseñado para frases cortas; el texto largo se divide en finales de frase) |
| Tipos de cuantizacion | int8 (pesos cuantizados en el archivo ONNX distribuido) |
| Idiomas soportados | Bahasa Melayu (Malasia), con palabras inglesas de uso común en el habla malasia |
| Licencia | Apache-2.0 (los léxicos `lexicon_e.json` derivan de Wiktionary y son CC BY-SA 4.0) |
| Formato de pesos | ONNX (opset 17), archivo `onnx/model_quantized.onnx` de 8,46 MB; compatible con transformers.js |
| Frecuencia de salida | 24 kHz mono |
| Entradas | `input_ids` (int64 `[1,T]`) y `speed` (float32 `[1]`) |
| Tamano del repo | 0,0 GB (reportado por Hugging Face) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura y la receta de entrenamiento de Paradee-8M-v1.3, un modelo de 8 millones de parámetros, partiendo de su fila de voz masculina estadounidense. El pipeline consta de dos piezas: un front end lingüístico basado en reglas (`suaradee/`, portado línea por línea a `js/`) que convierte el texto malayo en fonemas dentro del vocabulario de 178 símbolos de Kokoro-82M, y un modelo acústico que genera audio a 24 kHz. El decodificador emplea 128 armónicos sinusoidales en lugar de los 64 de la versión v0.1, lo que extiende la cobertura espectral hasta la banda de 7,5-11 kHz y elimina parte del ruido de siseo que rellenaba ese rango.

El entrenamiento se realizó sobre aproximadamente 49 minutos de habla sintética en malayo: unas 750 frases convertidas a voz con Chatterbox Multilingual y transformadas dos veces por conversión de voz (primero a una voz femenina y después a la voz masculina, usando una referencia leída por Kokoro `am_michael`). El audio posterior a la última palabra alineada se recorta. El entrenamiento completo requirió menos de una hora en una única GPU T4. Los pesos se exportaron a ONNX (opset 17) con cuantización int8 y se validaron para ser seguros en WebGPU.

## Capacidades

- Síntesis de voz en bahasa melayu a partir de texto, con salida mono a 24 kHz.
- Voz masculina sintética única, cercana a la voz `am_michael` de Kokoro.
- Manejo de palabras inglesas comunes en el habla malasia (code-switching limitado).
- Control de velocidad mediante la entrada `speed` (float32).
- Procesamiento de texto largo mediante división en finales de frase.
- Soporte de streaming en los front ends de Python y JavaScript.
- Ejecución en navegador con transformers.js (WebGPU o WASM) y en Python con ONNX Runtime.
- No dispone de control de emoción, estilo ni prosodia; no es un modelo multimodal ni soporta tool calling.

## Casos de uso

- Lectura de contenido web en malayo: integración en el navegador mediante transformers.js y WebGPU para leer artículos o interfaces en voz alta sin enviar texto a un servidor, gracias al tamano de 8,46 MB del archivo ONNX.
- Asistentes de voz para aplicaciones móviles o de escritorio en Malasia: el modelo cabe en un solo hilo de CPU, lo que permite síntesis local en dispositivos sin GPU dedicada.
- Accesibilidad para personas con discapacidad visual: conversión de texto a voz en malayo dentro de aplicaciones de lectura, con latencia baja por el reducido coste computacional.
- Prototipado rápido de productos de voz: al tener licencia Apache-2.0 y un paquete Python instalable, sirve para validar flujos de TTS antes de invertir en modelos mayores.
- Sistemas de anuncios o avisos automatizados: mensajes cortos y frases predecibles (números y preguntas obtuvieron CER del 0 % en la evaluación) son el escenario donde el modelo rinde mejor.
- Investigación en TTS de bajo recurso: modelo de referencia para estudiar destilación, conversión de voz y cuantización int8 en arquitecturas de menos de 10 M de parámetros.
- Demos educativas de TTS en el navegador: ejemplo práctico de despliegue de ONNX con transformers.js y WebGPU sin infraestructura de servidor.

## Benchmarks y rendimiento

La calidad se midió reproduciendo el habla del modelo a Whisper large-v3 y comparando con el texto original mediante tasa de error de caracteres (CER; menor es mejor). Los resultados publicados en la model card son los siguientes:

| Conjunto de evaluacion | n | CER mediana | CER media truncada | Proporcion con CER <= 8% |
|---|---|---|---|---|
| Frases de test no vistas (cada 5.ª fila de 200, seis categorías) | 40 | 6,2% | 10,2% | 57% |
| Frases reservadas del conjunto de entrenamiento | 60 | 6,8% | 12,9% | 52% |

Desglose por categoría en el conjunto de test:

| Categoria | n | CER mediana |
|---|---|---|
| codeswitch | 4 | 13,1% |
| conversational | 12 | 7,0% |
| general | 14 | 8,2% |
| numbers | 6 | 0,0% |
| question | 2 | 0,0% |
| short | 2 | 13,5% |

Como referencia, el audio de entrenamiento original obtiene un 4,3 % de CER mediana en los clips reservados. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el archivo ONNX pesa 8,46 MB, por lo que cabe holgadamente en cualquier GPU moderna e incluso en memoria compartida.
- GPU recomendadas: cualquier GPU con soporte WebGPU para ejecución en navegador; en servidor, una T4 es suficiente (el entrenamiento se completó en menos de una hora en una T4).
- Compatibilidad con GPU de consumo: sí, en cualquier GPU de consumo con WebGPU (por ejemplo, series RTX 20/30/40) e incluso en CPU.
- Opciones de despliegue: ONNX Runtime en Python (paquete `suaradee`), transformers.js en navegador con WebGPU o WASM, y scripts de streaming en Python (`stream_python.py`) y Node (`stream_node.mjs`).
- Latencia y throughput: no disponibles de forma numérica en la información proporcionada; el diseno de un solo hilo de CPU y 8,46 MB sugiere latencias bajas para frases cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kecil-TTS Michael v0.2 | 7,9 M | no disponible (frases cortas) | ms | Apache-2.0 | ONNX int8 | Voz masculina, 8,46 MB, navegador y CPU |
| Kecil-TTS Yati v0.3 | no disponible (mismo tamano según la model card) | no disponible | ms | Apache-2.0 | ONNX | Voz femenina, mismo código y front end; más precisa según el autor |
| Paradee-8M-v1.3 | 8 M | no disponible | en (voz masculina US) | no disponible en la informacion | no disponible | Modelo base del que deriva la arquitectura y la receta |
| Kokoro-82M | 82 M | no disponible | varios (incluye en) | no disponible en la informacion | no disponible | Fuente del vocabulario fonémico de 178 símbolos y de la voz de referencia `am_michael` |

## Limitaciones y advertencias

- Tasa de error elevada: el 43 % de las frases de test superaron el 8 % de CER (una palabra errónea o ausente o más); los nombres, números, palabras inglesas y frases largas son los puntos débiles.
- Calidad de sonido mejorable: suena en ocasiones robótico o apagado; el audio de entrenamiento es sintético y convertido por voz, lo que limita la nitidez que el modelo puede imitar.
- Voz sintética única, sin control de emoción ni de estilo; algunas frases suenan con un ligero acento estadounidense.
- Entrenado con un conjunto muy pequeno: unos 49 minutos de habla sintética en malayo, con doble conversión de voz.
- Disenado para frases cortas; el texto largo se divide en finales de frase y puede perder coherencia prosódica entre segmentos.
- El modelo es habla sintética: la model card pide indicarlo explícitamente cuando se use.
- Licencia: el código y los pesos son Apache-2.0, pero los léxicos `lexicon_e.json` derivan de datos de Wiktionary y están bajo CC BY-SA 4.0, lo que impone obligaciones de atribución y compartir igual para esos recursos.
- Riesgo de alucinación en el sentido de pronunciación incorrecta o palabras omitidas, no de contenido factual, al ser un modelo de TTS.
- No hay datos publicados sobre sesgos demográficos o acentuales más allá del acento estadounidense observado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suarify/kecil-tts-michael-v0.2
- Modelo hermano femenino (Kecil-TTS Yati v0.3): https://huggingface.co/Suarify/kecil-tts-yati-v0.3
- Modelo base Paradee-8M-v1.3: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
