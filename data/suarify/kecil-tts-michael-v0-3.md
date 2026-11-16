# Suarify/kecil-tts-michael-v0.3

## Resumen

Kecil-TTS Michael v0.3 es un modelo de síntesis de voz (text-to-speech) en bahasa Melayu (Malasia) con voz masculina, desarrollado por Suarify. Se trata de un modelo extremadamente compacto: 7,9 millones de parámetros y un único fichero ONNX de 8,46 MB con pesos int8. Su objetivo es ofrecer TTS en malayo ejecutable en el navegador mediante transformers.js (WebGPU o WASM) o en un solo hilo de CPU en Python, sin necesidad de infraestructura GPU.

El modelo deriva de Paradee-8M-v1.3 de Sahil Mahendrakar, del que hereda arquitectura y receta de entrenamiento, y emplea el vocabulario de 178 símbolos fonéticos de Kokoro-82M. Es el hermano masculino de Kecil-TTS Yati v0.4 (voz femenina), con el mismo tamano, código y front end de malayo. Genera audio mono a 24 kHz.

Su relevancia radica en la combinación de tamano minimo, licencia Apache-2.0 y despliegue web nativo, lo que lo hace adecuado para prototipos, aplicaciones offline y entornos con recursos muy limitados. No obstante, el propio autor advierte de que la calidad es limitada: la tasa de error de caracteres mediana es del 6,9% en frases no vistas, con un 45% de frases por encima del 8% de CER.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Paradee-8M (decodificador con 128 armónicos sinusoidales, vocabulario fonético Kokoro-82M de 178 símbolos) |
| Parametros totales | 7,9 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (disenado para frases cortas; el texto largo se divide en finales de frase) |
| Tipos de cuantizacion | Pesos int8 (fichero `onnx/model_quantized.onnx`) |
| Idiomas soportados | Bahasa Melayu (Malasia), con palabras inglesas comunes en el habla malasia |
| Licencia | Apache-2.0 (el lexico `lexicon_e.json` es CC BY-SA 4.0) |
| Formato de pesos | ONNX (opset 17), compatible con transformers.js |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura y receta de Paradee-8M-v1.3, partiendo de su fila de voz masculina estadounidense (en v0.3, desde el decodificador de Yati ya entrenado). Un front end basado en reglas (`suaradee/`, portado a `js/`) convierte el texto malayo en fonemas dentro del vocabulario de 178 símbolos de Kokoro-82M. El decodificador mantiene 128 armónicos sinusoidales (v0.2 lo amplió desde 64, ya que para una voz de 120 Hz los 64 armónicos se cortan en torno a 7,5 kHz). La salida es audio mono a 24 kHz.

El entrenamiento utilizó aproximadamente 1.500 frases en malayo (descartando clips que un reconocedor no podía leer de vuelta), convertidas a voz con Chatterbox Multilingual y transformadas a la voz masculina mediante conversión de voz con una referencia leída por Kokoro `am_michael`. Se recorta el audio posterior a la última palabra alineada. El conjunto total ronda 1,5 horas de habla sintética en malayo, con doble conversión de voz (primero a voz femenina, luego a masculina). El entrenamiento completo requirió aproximadamente una hora en una única GPU T4. Los pesos se exportaron a ONNX (opset 17) con pesos int8 y se hicieron compatibles con WebGPU.

## Capacidades

- Síntesis de voz a partir de texto en bahasa Melayu, con salida mono a 24 kHz.
- Voz masculina única, cercana a `am_michael` de Kokoro, sin control de emoción ni de estilo.
- Entrada de texto con `input_ids` (int64 `[1,T]`) y parámetro `speed` (float32 `[1]`) para controlar la velocidad.
- Procesamiento de palabras inglesas comunes presentes en el habla malasia (code-switching limitado).
- Ejecución en navegador mediante transformers.js con WebGPU o WASM.
- Ejecución en Python en un solo hilo de CPU mediante onnxruntime.
- Soporte de streaming en los front ends de Python y JavaScript.
- División automática de texto largo en finales de frase.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente TTS.

## Casos de uso

- Lectura de contenido web en malayo: integración en el navegador con transformers.js y WebGPU para leer artículos o interfaces sin enviar texto a servidores externos, gracias al reducido tamano del modelo (8,46 MB).
- Asistentes de voz offline en dispositivos de bajos recursos: despliegue en una sola hebra de CPU con onnxruntime para dar respuestas habladas en malayo en entornos sin GPU ni conectividad.
- Prototipado rápido de aplicaciones TTS: el paquete `suaradee` y los ejemplos en `examples/` permiten validar flujos de voz en minutos, con la misma API que el modelo femenino Yati.
- Accesibilidad para hablantes de malayo: conversión de texto a voz en lectores de pantalla o aplicaciones de accesibilidad, con streaming para reducir la latencia percibida.
- Generación de avisos y mensajes cortos: adecuado para frases breves (categorías `short` y `numbers` con 0,0% de CER mediano), como anuncios de transporte o notificaciones.
- Pruebas de concepto de doblaje o narración: generación de audio de referencia para vídeos o demos internas, asumiendo la calidad sintética y la necesidad de indicar que la voz es generada.
- Investigación sobre TTS de muy bajo coste: base para experimentos de destilación o adaptación a otros idiomas partiendo de un modelo de 7,9 M de parámetros entrenable en una T4 en aproximadamente una hora.

## Benchmarks y rendimiento

La calidad se midió reproduciendo el habla del modelo a Whisper large-v3 y comparando con el texto original mediante tasa de error de caracteres (CER; menor es mejor).

| Conjunto de prueba | n | CER mediana | CER media truncada | Proporción ≤ 8% |
|---|---|---|---|---|
| 200 frases no vistas (6 categorías) | 200 | 6,9% | 10,6% | 55% |
| Frases reservadas del conjunto de entrenamiento | 60 | 2,2% | 8,2% | 65% |

| Categoría | n | CER mediana |
|---|---|---|
| Code-switching | 20 | 27,2% |
| Conversacional | 60 | 3,3% |
| General | 70 | 8,5% |
| Números | 30 | 0,0% |
| Preguntas | 10 | 6,7% |
| Frases cortas | 10 | 0,0% |

Como referencia, el habla con la que se entrenó el modelo obtiene un 4,3% de CER mediana en los clips reservados. En comparación con v0.2, la CER mediana en las mismas 200 frases baja de 8,7% a 6,9% y la media truncada de 14,3% a 10,6%.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo pesa 8,46 MB en int8 y cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU para ejecución en navegador; en servidor, una T4 es suficiente (el entrenamiento completo cupo en una T4 en aproximadamente una hora).
- Cabe en GPU consumer: sí, en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: transformers.js (WebGPU o WASM) en navegador, onnxruntime en Python, paquete `suaradee` con soporte de streaming, y front end JavaScript en `js/`.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el autor indica que funciona en un solo hilo de CPU, pero no publica cifras de latencia ni de RTF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kecil-TTS Michael v0.3 | 7,9 M | No disponible | Malayo (ms) | Apache-2.0 | ONNX int8 | Voz masculina, 8,46 MB, CER mediana 6,9% |
| Kecil-TTS Yati v0.4 | No disponible (mismo tamano declarado) | No disponible | Malayo (ms) | Apache-2.0 (presumible, no confirmado) | ONNX | Voz femenina, misma base y front end, más precisa según el autor |
| Paradee-8M-v1.3 | 8 M (aproximado) | No disponible | Inglés (voz US) | No disponible | No disponible | Modelo base del que deriva Michael; arquitectura y receta reutilizadas |
| Kokoro-82M | 82 M | No disponible | Inglés y otros | No disponible | No disponible | Fuente del vocabulario fonético y de la referencia de voz `am_michael` |

## Limitaciones y advertencias

- Tasa de error elevada: el 45% de las frases de prueba superan el 8% de CER (una o más palabras erróneas o ausentes); los nombres, números, palabras inglesas y frases largas son los puntos débiles.
- Calidad de sonido sintética y en ocasiones robótica o apagada; el audio de entrenamiento es generado y convertido por voz, lo que limita la nitidez final.
- Voz masculina sintética única, sin control de emoción ni estilo; algunas frases suenan ligeramente con acento estadounidense.
- Entrenado con un conjunto muy pequeno: aproximadamente 1,5 horas de habla sintética en malayo con doble conversión de voz, lo que puede introducir artefactos.
- Disenado para frases cortas; el texto largo se divide en finales de frase, lo que puede afectar la prosodia entre oraciones.
- Code-switching con inglés limitado: la categoría de code-switching obtiene un 27,2% de CER mediana, muy por encima del resto.
- Riesgo de alucinación acústica: al ser un modelo generativo de audio, puede producir palabras o sonidos no presentes en el texto de entrada.
- Licencia Apache-2.0 para código y pesos, pero el lexico `lexicon_e.json` derivado de Wiktionary es CC BY-SA 4.0, lo que impone obligaciones de atribución y compartición sobre ese fichero.
- Es habla sintética: el autor pide indicarlo explícitamente cuando se utilice.
- No disponible información sobre sesgos demográficos o acentos más allá de la observación del acento estadounidense ocasional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suarify/kecil-tts-michael-v0.3
- Modelo hermano femenino (Kecil-TTS Yati v0.4): https://huggingface.co/Suarify/kecil-tts-yati-v0.4
- Modelo base (Paradee-8M-v1.3): https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Paquete Python `suaradee` (wheel): https://huggingface.co/Suarify/kecil-tts-michael-v0.3/resolve/main/dist/suaradee_michael-0.3.0-py3-none-any.whl
- Kokoro-82M (hexgrad): https://huggingface.co/hexgrad/Kokoro-82M
- Chatterbox Multilingual (Resemble AI): https://huggingface.co/ResembleAI/chatterbox
- Repositorio de transformers.js: https://github.com/huggingface/transformers.js
