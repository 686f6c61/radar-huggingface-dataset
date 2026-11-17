# Suarify/kecil-tts-michael-v0.2.2

## Resumen

Kecil-TTS Michael v0.2.2 es un modelo de síntesis de voz (text-to-speech) para bahasa melayu (malasio) con voz masculina, desarrollado por Suarify. Se trata de un modelo extremadamente compacto: 7,9 millones de parámetros y un único fichero ONNX de 8,47 MB con pesos int8, lo que permite ejecutarlo dentro de una pestaña del navegador mediante transformers.js (WebGPU o WASM) o en un solo hilo de CPU en Python. Deriva del modelo Paradee-8M-v1.3 de Sahil Mahendrakar, reutilizando su arquitectura y receta de entrenamiento.

El modelo resuelve un problema muy concreto: disponer de TTS en malasio con un coste computacional mínimo y despliegue trivial en entornos web o embebidos. La versión v0.2.2 no modifica los pesos respecto a v0.2; solo se ha reconstruido la exportación ONNX para corregir artefactos de síntesis (banco de 128 armónicos, ruido de respiración entre armónicos, control de duraciones de fonema y un realce de agudos). La voz resultante se aproxima a `am_michael` de Kokoro.

Es relevante para desarrolladores que necesiten TTS ligero en producción web o en dispositivos con recursos limitados, y como ejemplo de adaptación de un modelo base pequeño a un idioma de bajos recursos mediante datos sintéticos y conversión de voz. Sus prestaciones, sin embargo, son modestas: la tasa de error de caracteres mediana es del 6,2 % en frases no vistas, y el 43 % de las frases de test superan el 8 % de CER.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (hereda la de Paradee-8M-v1.3; exportada a ONNX opset 17) |
| Parametros totales | 7,9 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (pensado para frases cortas; el texto largo se divide por frases) |
| Tipos de cuantizacion | Pesos int8 (`onnx/model_quantized.onnx`) |
| Idiomas soportados | Bahasa Melayu (Malasia), con palabras inglesas de uso comun en el habla malasia |
| Licencia | Apache-2.0 (el lexico `lexicon_e.json` es CC BY-SA 4.0) |
| Formato de pesos | ONNX (`model_quantized.onnx`, 8,47 MB); front end en transformers.js |
| Entradas | `input_ids` (int64 `[1,T]`) y `speed` (float32 `[1]`) |
| Salida de audio | 24 kHz mono |
| Vocabulario | 178 simbolos (el de Kokoro-82M) |
| Modelo base | sahilmahendrakar/Paradee-8M-v1.3 |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura y la receta de entrenamiento de Paradee-8M-v1.3, un TTS de 8M de parámetros, inicializado desde su fila de voz masculina estadounidense. El entrenamiento completo requirió menos de una hora en una única GPU T4. La entrada de texto se procesa mediante un front end basado en reglas para malasio (`kecil_tts/`, portado línea por línea a `js/`), que convierte el texto en fonemas dentro del vocabulario de 178 símbolos de Kokoro-82M.

Los datos de entrenamiento son sintéticos: unas 750 frases en malasio convertidas a voz con Chatterbox Multilingual y posteriormente sometidas a conversión de voz en dos pasos (primero a una voz femenina y después a la voz masculina, usando como referencia una lectura de Kokoro `am_michael`). El total asciende a aproximadamente 49 minutos de audio. Los pesos se exportaron a ONNX (opset 17) con cuantización int8 y compatibilidad con WebGPU.

La innovación de v0.2.2 está exclusivamente en la exportación: se reconstruyó el ONNX desde los pesos de v0.2 manteniendo el banco de 128 armónicos original (un primer reexport con 64 armónicos perdía la banda de 7,7–11 kHz), se enmascaró el ruido de respiración en los huecos entre armónicos en tramas sonoras, se limitó el ruido de ráfaga a tramas sordas con un hangover de 22 ms, se acotaron las duraciones de fonema a 75–200 ms (el modelo de duración generaba fonemas de 25 ms y vocales de 400 ms), se suavizaron las ganancias de ruido en tres tramas (−60 ms) y se añadió un estante lineal de +3 dB por encima de 6,5 kHz.

## Capacidades

- Síntesis de voz en bahasa melayu (malasio) con voz masculina sintética, a 24 kHz mono.
- Procesamiento de palabras inglesas frecuentes en el habla malasia mediante el front end de reglas.
- Control de velocidad mediante la entrada `speed` (float32).
- Ejecución en navegador con transformers.js sobre WebGPU o WASM.
- Ejecución en Python con onnxruntime en un único hilo de CPU.
- Soporte de streaming en los front ends de Python y JavaScript (`stream_python.py`, `stream_node.mjs`).
- División automática de texto largo por finales de frase.
- No dispone de control de emoción, estilo ni de selección de voz: una única voz masculina.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de contenido web en malasio: integrado vía transformers.js, el modelo puede sintetizar titulares y párrafos cortos directamente en el navegador del usuario sin enviar texto a un servidor, gracias a su tamaño de 8,47 MB y a la ejecución sobre WebGPU o WASM.
- Asistentes de voz para aplicaciones móviles o de escritorio en malasio: su reducido consumo permite ejecutarlo en un solo hilo de CPU, lo que encaja en entornos sin GPU dedicada para respuestas habladas de frases cortas.
- Accesibilidad para lectores de pantalla: puede convertir texto de interfaz en audio en tiempo real dentro de una pestaña, con streaming para reducir la latencia percibida en frases encadenadas.
- Prototipado rápido de productos de voz: al instalarse con un único fichero ONNX y un paquete Python de 0.3.0, permite validar flujos de TTS en malasio en horas, no en semanas, antes de invertir en un modelo mayor.
- Generación de avisos y notificaciones pregrabadas: para mensajes cortos y repetitivos (confirmaciones, recordatorios) donde la calidad sintética es aceptable y el coste por inferencia es prácticamente nulo.
- Investigación sobre TTS de bajos recursos: sirve como línea base reproducible para experimentar con adaptación de idioma mediante datos sintéticos y conversión de voz, dado que toda la receta (front end, exportación ONNX, límites de duración) está documentada.
- Demos educativas de TTS en el navegador: su tamaño y su licencia Apache-2.0 facilitan incluirlo en tutoriales y entornos de aprendizaje sin infraestructura de servidor.

## Benchmarks y rendimiento

La calidad se midió reproduciendo el audio del modelo a Whisper large-v3 y comparando con el texto de entrada mediante tasa de error de caracteres (CER; menor es mejor). Las puntuaciones corresponden a v0.2, cuyos pesos de texto comparte exactamente v0.2.2.

| Conjunto de frases no vistas | n | CER mediana | CER media acotada | Proporcion con CER ≤ 8 % |
|---|---|---|---|---|
| Frases de test (cada 5.ª fila de un conjunto de 200, seis categorias) | 40 | 6,2 % | 10,2 % | 57 % |
| Frases reservadas del conjunto de entrenamiento | 60 | 6,8 % | 12,9 % | 52 % |

Como referencia, el audio original del que aprendió el modelo obtiene un 4,3 % de CER mediana en los clips reservados. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el fichero ONNX cuantizado ocupa 8,47 MB y el modelo tiene 7,9 M de parámetros.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU para la ejecución en navegador; en Python basta una CPU. Una T4 fue suficiente para el entrenamiento completo en menos de una hora.
- Cabe en cualquier GPU de consumo, e incluso en CPU: el autor indica que se ejecuta en un solo hilo de CPU en Python.
- Opciones de despliegue: onnxruntime (Python), transformers.js (navegador, WebGPU o WASM), paquete `kecil_tts` 0.3.0 distribuido como wheel desde el propio repositorio, y scripts de Node.
- Latencia y throughput: no disponibles en la información proporcionada. El modelo admite streaming para reducir la latencia percibida en frases largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kecil-TTS Michael v0.2.2 | 7,9 M | No disponible (frases cortas) | Malasio | Apache-2.0 | Hugging Face, ONNX |
| Kecil-TTS Yati v0.4.1 (mismo autor) | 7,9 M (mismo tamano) | No disponible | Malasio | No disponible en la informacion | Hugging Face |
| Paradee-8M-v1.3 (modelo base) | 8 M | No disponible | Ingles (voz masculina US) | No disponible en la informacion | Hugging Face |
| Kokoro-82M | 82 M | No disponible | Multiples (incluye `am_michael`) | No disponible en la informacion | Hugging Face |

Según el autor, la variante femenina Yati es más precisa que Michael, aunque comparte tamaño y código. Frente a Paradee-8M y Kokoro-82M, Kecil-TTS Michael es entre uno y diez órdenes de magnitud menor en parámetros, lo que explica su despliegue trivial pero también su mayor tasa de error.

## Limitaciones y advertencias

- Tasa de error: el 43 % de las frases de test superan el 8 % de CER; los nombres, números, palabras inglesas y frases largas son los puntos débiles. La variante femenina Yati es más precisa.
- Calidad de sonido: mejor que v0.2 (más brillante, menos acuosa y robótica), pero sigue siendo sintética; el timbre apagado proviene del audio de entrenamiento, convertido dos veces mediante voice conversion.
- Duraciones acotadas: ningún fonema dura menos de 75 ms, por lo que el habla rápida es ligeramente más lenta que en v0.2; debe compensarse con la entrada `speed`.
- Una única voz masculina sintética, sin control de emoción ni de estilo; algunas frases suenan con un ligero acento estadounidense.
- Entrenado con un conjunto pequeño: unos 49 minutos de voz sintética en malasio generada con Chatterbox Multilingual y convertida dos veces.
- Diseñado para frases cortas; el texto largo se divide por finales de frase.
- Riesgo de alucinación acústica: el modelo puede omitir o pronunciar mal palabras, especialmente en nombres propios y cifras, como refleja el CER.
- Licencia: código y pesos bajo Apache-2.0, lo que permite uso comercial; el léxico `lexicon_e.json` derivado de Wiktionary queda bajo CC BY-SA 4.0 y exige atribución y compartir igual.
- Es voz sintética: el autor pide indicarlo explícitamente cuando se utilice.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suarify/kecil-tts-michael-v0.2.2
- Versión anterior (mismos pesos): https://huggingface.co/Suarify/kecil-tts-michael-v0.2
- Variante femenina: https://huggingface.co/Suarify/kecil-tts-yati-v0.4.1
- Modelo base Paradee-8M-v1.3: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Wheel del paquete Python: https://huggingface.co/Suarify/kecil-tts-michael-v0.2.2/resolve/main/dist/kecil_tts_8m-0.3.0-py3-none-any.whl
- Ficheros ONNX: https://huggingface.co/Suarify/kecil-tts-michael-v0.2.2/tree/main/onnx
- Ejemplos y scripts de streaming: https://huggingface.co/Suarify/kecil-tts-michael-v0.2.2/tree/main/examples
- Front end transformers.js: https://huggingface.co/Suarify/kecil-tts-michael-v0.2.2/tree/main/js
