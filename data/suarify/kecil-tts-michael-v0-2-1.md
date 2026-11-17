# Suarify/kecil-tts-michael-v0.2.1

## Resumen

Kecil-TTS Michael v0.2.1 es un modelo de síntesis de voz (text-to-speech) para bahasa melayu (malasio) con voz masculina, desarrollado por el usuario Suarify. Se trata de un modelo extremadamente compacto: 7,9 millones de parámetros y un único archivo ONNX de 8,46 MB con pesos en int8, lo que permite ejecutarlo dentro de una pestaña del navegador mediante transformers.js (WebGPU o WASM) o en un solo hilo de CPU en Python. Su relevancia radica en demostrar que es posible desplegar TTS funcional en entornos con recursos mínimos, sin GPU dedicada y con latencia de arranque prácticamente nula.

El modelo no entrena desde cero: parte de Paradee-8M-v1.3 de Sahil Mahendrakar, reutiliza su arquitectura y receta de entrenamiento, y se ajusta sobre aproximadamente 49 minutos de voz sintética malasia generada con Chatterbox Multilingual y convertida dos veces mediante voice conversion (primero a voz femenina, luego a masculina) usando como referencia la voz `am_michael` de Kokoro-82M. El front-end de texto a fonemas es una implementación basada en reglas del malasio, portada línea a línea entre Python y JavaScript, que mapea a un vocabulario de 178 símbolos heredado de Kokoro-82M.

La versión v0.2.1 no cambia los pesos respecto a v0.2: solo reexporta el ONNX corrigiendo la colocación del ruido de respiración (entre los armónicos en lugar de superpuestos) y restringiendo la ruta de ruido "burst" a tramas no sonoras. Es la contraparte masculina de Kecil-TTS Yati v0.4.1, de la misma autora y con idéntico tamaño y código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paradee-8M (arquitectura neuronal de TTS de 8M parámetros, exportada a ONNX opset 17) |
| Parametros totales | 7,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de TTS; el texto se divide por frases) |
| Tipos de cuantizacion | int8 (pesos cuantizados en el ONNX); no se documentan otras variantes |
| Idiomas soportados | Bahasa Melayu (Malasia), con palabras inglesas de uso común en el habla malasia |
| Licencia | Apache-2.0 (el léxico `lexicon_e.json` es CC BY-SA 4.0) |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`, 8,46 MB); front-end en transformers.js |
| Frecuencia de salida | 24 kHz mono |
| Entradas | `input_ids` (int64 `[1,T]`) y `speed` (float32 `[1]`) |
| Vocabulario fonético | 178 símbolos (heredado de Kokoro-82M) |
| Armónicos del decodificador | 128 senos |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Paradee-8M, un diseño neuronal compacto de síntesis de voz que en esta variante se exporta a ONNX con pesos int8 y se prepara para ser compatible con WebGPU. La generación de audio se realiza mediante un decodificador con 128 armónicos senoidales (frente a los 64 de la versión v0.1), lo que permite cubrir la banda de 7,5 a 11 kHz con contenido armónico en lugar de rellenarla con ruido. El front-end de texto es una implementación basada en reglas del malasio que convierte el texto a fonemas en el vocabulario de 178 símbolos de Kokoro-82M.

El entrenamiento se realizó sobre aproximadamente 49 minutos de voz sintética malasia: unas 750 frases convertidas a audio con Chatterbox Multilingual y posteriormente sometidas a voice conversion en dos pasos (primero a voz femenina, luego a voz masculina) usando una referencia leída por Kokoro `am_michael`. Se partió de la fila de voz masculina estadounidense de Paradee-8M-v1.3 y el ajuste completo requirió menos de una hora en una única GPU T4. No se documenta el uso de RLHF ni DPO. La innovación técnica principal de v0.2.1 es la corrección en la exportación: el ruido de respiración se coloca entre los armónicos y la ruta de ruido rápido solo se activa en tramas no sonoras; la verificación de la cabeza del export frente a la de entrenamiento arroja una diferencia máxima de 3e-7.

## Capacidades

- Síntesis de voz a partir de texto en bahasa melayu (malasio), con salida mono a 24 kHz.
- Una única voz masculina sintética (cercana a `am_michael` de Kokoro), sin control de emoción ni de estilo.
- Control de velocidad mediante el parámetro de entrada `speed` (float32).
- Procesamiento de palabras inglesas de uso común en el habla malasia (code-switching limitado).
- Ejecución en navegador mediante transformers.js con WebGPU o WASM, y en Python con onnxruntime en un solo hilo de CPU.
- Soporte de streaming en los front-ends de Python (`stream_python.py`) y Node (`stream_node.mjs`).
- División automática de textos largos por finales de frase.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura de notificaciones y avisos en aplicaciones web malasias: el modelo cabe en 8,46 MB y se ejecuta en la pestaña del navegador con WebGPU o WASM, por lo que puede sintetizar avisos cortos sin enviar texto a un servidor.
- Asistentes de voz embebidos en dispositivos de bajos recursos: con 7,9 M de parámetros y ejecución en un solo hilo de CPU, es viable en Raspberry Pi o móviles de gama baja para respuestas habladas breves en malasio.
- Prototipado rápido de interfaces de voz: el paquete pip y el front-end de transformers.js permiten integrar TTS en menos de una hora de trabajo, útil para validar flujos conversacionales antes de invertir en un modelo mayor.
- Accesibilidad web para contenido en malasio: lectura en voz alta de artículos o formularios directamente en el cliente, sin dependencia de servicios cloud de TTS.
- Generación de avisos pregrabados para sistemas de megafonía o kioscos: frases cortas y predecibles (números, preguntas, saludos) donde el modelo obtiene CER bajo (0,0 % en las categorías de números y preguntas de su conjunto de evaluación).
- Demostraciones educativas de TTS y voice conversion: el modelo documenta con detalle su pipeline (Chatterbox Multilingual, voice conversion, Paradee-8M) y sirve como caso de estudio reproducible en menos de una hora de GPU T4.

## Benchmarks y rendimiento

La calidad se midió haciendo escuchar la síntesis a Whisper large-v3 y comparando la transcripción con el texto original mediante character error rate (CER); menor es mejor. Las puntuaciones se midieron sobre v0.2, cuya ruta de texto y duración es idéntica a la de v0.2.1.

| Conjunto de evaluación | n | CER mediana | CER media acotada | Proporción ≤ 8 % |
|---|---|---|---|---|
| Frases de test no vistas (cada 5.ª fila de 200) | 40 | 6,2 % | 10,2 % | 57 % |
| Frases reservadas del conjunto de entrenamiento | 60 | 6,8 % | 12,9 % | 52 % |

| Categoría | n | CER mediana |
|---|---|---|
| codeswitch | 4 | 13,1 % |
| conversational | 12 | 7,0 % |
| general | 14 | 8,2 % |
| numbers | 6 | 0,0 % |
| question | 2 | 0,0 % |
| short | 2 | 13,5 % |

Como referencia, el audio de entrenamiento obtiene un 4,3 % de CER mediana en los clips reservados. En textura sonora, v0.2.1 mejora a v0.2: periodicidad 0,651 frente a 0,635; planitud espectral 2-6 kHz 0,436 frente a 0,528; y proporción de energía por encima de 4 kHz 0,082 frente a 0,105.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente despreciable; el archivo ONNX int8 ocupa 8,46 MB y puede ejecutarse en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en cualquier GPU compatible con WebGPU para la ruta de navegador.
- Cabe en cualquier GPU de consumo e incluso en CPU de un solo hilo; también en Raspberry Pi y móviles.
- Opciones de despliegue: onnxruntime (Python), transformers.js con WebGPU o WASM (navegador), front-end Node (`stream_node.mjs`).
- Latencia y throughput: no disponibles en la información proporcionada; el autor indica que el ajuste completo del modelo requirió menos de una hora en una T4, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / idioma | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kecil-TTS Michael v0.2.1 | 7,9 M | TTS malasio, voz masculina | Apache-2.0 | Hugging Face, ONNX + transformers.js |
| Kecil-TTS Yati v0.4.1 | ~8 M (misma arquitectura) | TTS malasio, voz femenina | Apache-2.0 | Hugging Face, ONNX + transformers.js |
| Paradee-8M-v1.3 (modelo base) | 8 M | TTS, voz masculina estadounidense | no disponible en la información | Hugging Face |
| Kokoro-82M | 82 M | TTS multilingüe, vocabulario de 178 símbolos | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, salvo la referencia del autor de que el modelo femenino Yati es más preciso que Michael.

## Limitaciones y advertencias

- Tasa de error elevada: el 43 % de las frases de test superan el 8 % de CER (una palabra errónea o ausente o más); nombres, números, palabras inglesas y frases largas son los puntos débiles.
- Calidad de sonido todavía algo robótica en algunos tramos; el timbre apagado se hereda del audio de entrenamiento, y algunas frases suenan con acento ligeramente estadounidense.
- Una sola voz masculina sintética, sin control de emoción ni de estilo.
- Entrenado sobre un conjunto pequeño: unos 49 minutos de voz sintética malasia, no voz humana real.
- Diseñado para frases cortas; el texto largo se divide por finales de frase.
- El modelo es sintético: el autor pide indicarlo explícitamente cuando se use.
- El léxico `lexicon_e.json` está bajo CC BY-SA 4.0, con obligaciones de atribución y compartir igual que conviene revisar antes de uso comercial.
- No se documentan sesgos específicos más allá de los derivados del acento y del vocabulario limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suarify/kecil-tts-michael-v0.2.1
- Versión anterior v0.2: https://huggingface.co/Suarify/kecil-tts-michael-v0.2
- Modelo femenino Kecil-TTS Yati v0.4.1: https://huggingface.co/Suarify/kecil-tts-yati-v0.4.1
- Modelo base Paradee-8M-v1.3: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Chatterbox Multilingual (Resemble AI): https://huggingface.co/ResembleAI/chatterbox
- Paquete Python del modelo: https://huggingface.co/Suarify/kecil-tts-michael-v0.2.1/resolve/main/dist/kecil_tts_8m-0.3.0-py3-none-any.whl
