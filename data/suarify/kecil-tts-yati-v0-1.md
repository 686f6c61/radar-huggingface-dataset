# Suarify/kecil-tts-yati-v0.1

## Resumen

Kecil-TTS Yati v0.1 es un modelo de síntesis de voz (text-to-speech) para bahasa melayu (malayo de Malasia) desarrollado por Suarify. Se trata de un modelo extremadamente compacto: 7,9 millones de parámetros y un único archivo ONNX cuantizado de 8,46 MB, lo que permite ejecutarlo tanto en una pestaña del navegador mediante transformers.js (WebGPU o WASM) como en un solo hilo de CPU en Python. El modelo deriva de la arquitectura Paradee-8M-v1.3 de sahilmahendrakar, reutilizando sus pesos como punto de partida.

El modelo resuelve el problema de la síntesis de voz malaya en entornos con recursos muy limitados, donde los TTS multilingües de gran tamaño resultan inviables. Genera audio mono a 24 kHz y funciona a aproximadamente 25 veces tiempo real en un hilo de CPU con onnxruntime, y alrededor de 15 veces tiempo real en WebGPU (6 veces en la primera llamada). Es una primera versión con calidad limitada: sonido ligeramente apagado y aproximadamente una frase de cada diez contiene una palabra errónea.

La relevancia actual del modelo radica en su extrema ligereza y su despliegue íntegramente local (nada sale del dispositivo del usuario), lo que lo hace adecuado para aplicaciones web, sistemas embebidos y escenarios con requisitos estrictos de privacidad. Existe una versión posterior, Kecil-TTS Yati v0.2, con un error típico aproximadamente reducido a la mitad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paradee-8M (arquitectura de dos etapas: predicción de duración, tono, sonoridad y características fonéticas; decodificador que genera audio) |
| Parametros totales | 7,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Entrada de hasta 402 fonemas por segmento (`input_ids` int64 `[1,T]`, T hasta 402) |
| Tipos de cuantizacion | int8 (archivo `onnx/model_quantized.onnx`) |
| Idiomas soportados | Bahasa Melayu (Malasia), con palabras inglesas comunes del habla malasia |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`, 8,46 MB); librería transformers.js |
| Frecuencia de muestreo de salida | 24 kHz mono |
| Vocabulario | 178 símbolos (vocabulario de Kokoro-82M) |
| Entradas | `input_ids` (int64 `[1,T]`, ids de fonemas con 0 en cada extremo) y `speed` (float32 `[1]`) |

## Arquitectura y entrenamiento

El modelo sigue la receta arquitectónica de Paradee-8M: una parte textual que predice la duración de los fonemas, el tono, la sonoridad y otras características, y un decodificador que transforma esas predicciones en audio. El front end de texto es un componente basado en reglas (`suaradee/`, portado línea a línea a `js/`) que convierte el malayo escrito en fonemas usando el vocabulario de 178 símbolos de Kokoro-82M; distingue la vocal pepet de la taling mediante un léxico de 24.000 palabras y normaliza números, abreviaturas y préstamos ingleses.

Los datos de entrenamiento consistieron en aproximadamente 750 frases sintetizadas con Chatterbox Multilingual (un modelo mayor), convertidas a una voz consistente. Tras el recorte se conservaron unos 49 minutos de audio, de los cuales 60 frases se reservaron para evaluación. El entrenamiento partió de los pesos de Paradee-8M-v1.3 y duró menos de una hora en una única GPU T4. El archivo ONNX se adaptó para ser compatible con WebGPU: se movió un acumulador de fase de doble precisión a float32 y se acotaron los límites de slice de 64 bits, sin cambios medibles en el audio.

## Capacidades

- Síntesis de voz a partir de texto en bahasa melayu (Malasia), con salida mono a 24 kHz.
- Pronunciación de palabras inglesas comunes integradas en el habla malasia (lista de unas 430 palabras: `confirm`, `booking`, `email`, etc.).
- Normalización basada en reglas de números, cantidades, fechas, horas y números de teléfono, leídos en malayo.
- Diferenciación de las vocales pepet y taling mediante léxico de 24.000 palabras.
- Control de velocidad mediante la entrada `speed` (float32).
- Ejecución en navegador (WebGPU o WASM) y en Python/Node sin PyTorch (solo onnxruntime).
- División automática de textos largos en fragmentos de hasta 400 fonemas, cortando en finales de frase.
- No dispone de control de emoción, estilo ni de múltiples voces: una única voz femenina sintética.
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Lectura de textos cortos en aplicaciones web: el modelo se carga con transformers.js y sintetiza frases de hasta 400 fonemas directamente en el navegador, sin enviar datos a ningún servidor, lo que resulta adecuado para interfaces de accesibilidad y lectores de contenido.
- Asistentes de voz para atención al cliente de estilo call-centre: según las mediciones del autor, el modelo alcanza un CER mediano del 9,7% en frases de citas, facturas y entregas, lo que lo hace utilizable para respuestas guiadas en malayo.
- Sistemas embebidos y dispositivos de bajo consumo: con 8,46 MB y ejecución a 25 veces tiempo real en un solo hilo de CPU, puede integrarse en hardware sin GPU para anuncios hablados o avisos.
- Aplicaciones con requisitos estrictos de privacidad: al ejecutarse íntegramente en local (WebGPU/WASM en el navegador o onnxruntime en Python), el texto del usuario nunca abandona el dispositivo.
- Prototipado rápido de interfaces de voz en malayo: el despliegue mediante un único archivo ONNX y la disponibilidad de scripts de ejemplo en Python y Node permiten montar demos en minutos.
- Generación de avisos y mensajes normalizados con números, fechas y horas: el normalizador basado en reglas lee correctamente este tipo de contenido en malayo, aunque es uno de los puntos débiles según las métricas del autor.
- Síntesis de frases con préstamos ingleses habituales: la lista de 430 palabras inglesas cubre términos frecuentes en el habla malasia, útil para confirmaciones, reservas y correos electrónicos.

## Benchmarks y rendimiento

La calidad se midió haciendo escuchar la voz generada a Whisper large-v3 y comparando la transcripción con el texto original (character error rate, CER; menor es mejor). El propio reconocedor comete errores del 7-9% sobre los clips humanos que el modelo imita, por lo que ninguna puntuación es cero.

| Conjunto de frases no vistas | n | CER mediana | Proporción con CER ≤ 8% |
|---|---|---|---|
| Estilo call-centre (citas, facturas, entregas) | 40 | 9,7% | 42% |
| Conjunto mixto reservado, global | 60 | 17% | 23% |
| — texto general | 17 | 17% | no disponible |
| — números y dinero | 12 | 21% | no disponible |
| — malayo con palabras inglesas | 6 | 17% | no disponible |

Rendimiento de ejecución (según el autor):

| Entorno | Velocidad |
|---|---|
| Python, onnxruntime, un hilo de CPU | ~25x tiempo real |
| Navegador, WebGPU | ~15x tiempo real (6x en la primera llamada) |
| Navegador, WASM | no disponible |

## Requisitos de hardware

- VRAM estimada: no aplica en la práctica; el archivo ONNX cuantizado ocupa 8,46 MB y puede ejecutarse en CPU o en el navegador.
- GPU recomendadas: no se requieren GPU dedicadas; el autor probó CPU (Python 3.12 con onnxruntime en Windows), Node 24 con transformers.js 3.8 y Chromium con WebGPU y WASM.
- Cabe en cualquier GPU consumer e incluso en dispositivos sin GPU; el requisito es disponer de WebGPU (navegadores Chromium) o WASM como alternativa.
- Opciones de despliegue: onnxruntime (Python, sin PyTorch), transformers.js 3.x (navegador y Node), Gradio (`examples/gradio_app.py`) y el Space web del autor.
- Latencia y throughput: aproximadamente 25x tiempo real en un hilo de CPU y 15x en WebGPU (6x en la primera llamada).
- Dependencias Python: `onnxruntime`, `numpy`, `huggingface_hub`, `soundfile` y el wheel `suaradee-0.1.0-py3-none-any.whl`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kecil-TTS Yati v0.1 | 7,9 M | hasta 402 fonemas por segmento | Malayo (Malasia) | Apache 2.0 | ONNX, transformers.js, WebGPU/WASM |
| Paradee-8M-v1.3 (modelo base) | ~8 M | no disponible | no disponible | no disponible | Hugging Face |
| Chatterbox Multilingual (usado para generar los datos) | no disponible | no disponible | Multilingüe | no disponible | no disponible |
| Kokoro-82M (origen del vocabulario de 178 símbolos) | 82 M | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento (CER) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sonido apagado: el audio tiene aproximadamente un 40% menos de energía por encima de 4 kHz que el habla de entrenamiento, con armónicos superiores difuminados (cualidad "damp" o ligeramente phasey); es un problema conocido de la primera ejecución de entrenamiento.
- Aproximadamente una frase de cada diez contiene una palabra errónea, con más frecuencia en nombres, números y palabras poco comunes.
- Una única voz femenina sintética, sin control de emoción ni de estilo.
- Diseñado para frases cortas: los textos largos se dividen en finales de frase y se envían en piezas de como máximo 400 fonemas.
- Las palabras inglesas solo se manejan si pertenecen a la lista de unas 430 palabras comunes.
- Números, cantidades, fechas, horas y teléfonos se leen en malayo mediante un normalizador basado en reglas, lo que constituye uno de los puntos débiles medidos (CER mediana del 21% en números y dinero).
- Es habla sintética: el autor pide indicarlo cuando se utilice.
- Existe una versión posterior, Kecil-TTS Yati v0.2, con el error típico aproximadamente reducido a la mitad; esta ficha describe v0.1.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los modelos base y de los datos sintéticos empleados (Chatterbox Multilingual).
- No se han publicado datos sobre sesgos demográficos o acentos regionales más allá del malayo de Malasia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suarify/kecil-tts-yati-v0.1
- Versión posterior v0.2: https://huggingface.co/Suarify/kecil-tts-yati-v0.2
- Demo web (Space): https://huggingface.co/spaces/Suarify/suaradee-web
- Modelo base Paradee-8M-v1.3: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Wheel de Python: https://huggingface.co/Suarify/kecil-tts-yati-v0.1/resolve/main/dist/suaradee-0.1.0-py3-none-any.whl
- Ejemplos Gradio: `examples/gradio_app.py` (repositorio del modelo)
- Código del Space Gradio: `hf/space_gradio` (repositorio del proyecto)
