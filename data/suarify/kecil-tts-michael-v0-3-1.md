# Suarify/kecil-tts-michael-v0.3.1

## Resumen

Kecil-TTS Michael v0.3.1 es un modelo de síntesis de voz (text-to-speech) para bahasa melayu (malayo de Malasia) con voz masculina, desarrollado por Suarify. Se trata de un modelo extremadamente compacto: 7,9 millones de parámetros y un único archivo ONNX cuantizado de 8,47 MB, pensado para ejecutarse íntegramente en el dispositivo, ya sea en una pestaña del navegador mediante transformers.js con WebGPU o WASM, o en un solo hilo de CPU en Python. Deriva del modelo base Paradee-8M-v1.3 de sahilmahendrakar y es el hermano masculino de Kecil-TTS Yati v0.4.1 (voz femenina).

El modelo resuelve el problema de disponer de TTS offline, sin servidor ni API, con coste de inferencia nulo y funcionamiento sin conexión. Su relevancia radica en la combinación de tamano mínimo, licencia Apache 2.0 y velocidad de inferencia muy superior al tiempo real (unas 19 veces en un hilo de CPU y unas 4,5 veces en navegador con WebGPU), lo que lo hace adecuado para aplicaciones web y embebidas donde no se puede depender de servicios en la nube.

La versión v0.3.1 mantiene los pesos de v0.3.0 y elimina el límite de duración mínima por fonema que ralentizaba el habla un 22 %. La síntesis es fiel a la salida del vocoder, sin enmascaramiento de huecos ni suavizado de ganancia. El modelo genera audio mono a 24 kHz y acepta como entradas `input_ids` y un parámetro `speed`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal con front end fonético basado en reglas y vocoder de armónicos (128 armónicos); vocabulario de 178 símbolos estilo Kokoro |
| Parametros totales | 7,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada por fonemas, sin ventana de contexto declarada) |
| Tipos de cuantizacion | int8 (archivo `onnx/model_quantized.onnx`) |
| Idiomas soportados | Bahasa Melayu (Malasia), con palabras inglesas de uso común en el habla malasia |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (cuantizado int8); paquete Python `kecil_tts_8m-0.3.0-py3-none-any.whl`; port JavaScript en `js/` |
| Frecuencia de salida | 24 kHz mono |
| Entradas | `input_ids` (int64 `[1,T]`) y `speed` (float32 `[1]`) |
| Tamano del archivo | 8,47 MB |

## Arquitectura y entrenamiento

El modelo sigue un esquema en dos etapas: un front end fonético basado en reglas para malayo (implementado en `kecil_tts/` y portado a `js/`) que convierte el texto en fonemas dentro del vocabulario de 178 símbolos de Kokoro, y un decodificador acústico de 7,9 M de parámetros que predice duraciones y características espectrales. La ruta de sonido emplea 128 armónicos, ruido de respiración enmascarado entre parciales, un hangover de 22 ms para las consonantes, suavizado de ganancia de ruido en 3 tramas y un estante de agudos de +3 dB por encima de 6,5 kHz.

El entrenamiento se realizó sobre 1.261 clips de malayo (87 minutos) generados con Chatterbox Multilingual y convertidos a la voz masculina; 767 de ellos se usaron en la fase descrita. La versión v0.3.0 se exportó desde los checkpoints reales de entrenamiento en precisión completa, en lugar de reconstruirse desde el ONNX int8, lo que corrigió la distorsión temporal (el modelo real produce fonemas de 1 a 8 tramas frente a las 16 tramas, 400 ms, del reconstruido). Sobre el conjunto fusionado se añadieron 4.000 pasos de decodificador (16.000 en total) y 4.500 pasos del lado de texto, con una pérdida espectral retenida que bajó de 2,545 a 2,497. El coste de entrenamiento de esta continuación fue de unos 15 minutos en una T4; la ejecución base de 12.000/7.500 pasos requirió unos 35 minutos en T4. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Síntesis de voz a partir de texto en bahasa melayu con voz masculina sintética.
- Control de velocidad mediante el parámetro `speed` de entrada.
- Manejo de palabras inglesas de uso común en el habla malasia, aunque con menor precisión.
- Inferencia offline en Python (onnxruntime) y en Node, sin conexión a internet una vez descargado el archivo.
- Ejecución en navegador mediante transformers.js con WebGPU o WASM, con caché tras la primera carga.
- Streaming de audio: se incluyen ejemplos `stream_python.py` y `stream_node.mjs`.
- No dispone de control de emoción, estilo ni de múltiples voces: una sola voz masculina.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz en aplicaciones web: el modelo puede sintetizar respuestas en malayo directamente en la pestaña del navegador con transformers.js y WebGPU, sin enviar texto a ningún servidor, lo que preserva la privacidad del usuario y elimina costes de API.
- Lectura de contenido en aplicaciones móviles o de escritorio offline: al ocupar 8,47 MB y funcionar con un solo archivo, puede empaquetarse en una app para leer noticias, mensajes o documentación sin conexión.
- Sistemas de anuncios y avisos en transporte o comercio: la velocidad de aproximadamente 19 veces el tiempo real en un hilo de CPU permite generar avisos pregrabados o dinámicos en dispositivos de bajo consumo.
- Prototipado rápido de interfaces conversacionales en malayo: el paquete Python y los ejemplos de streaming permiten integrar TTS en un pipeline de diálogo en minutos, con coste de inferencia cero.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual en entornos sin internet, con latencia baja gracias a la inferencia local.
- Educacion y aprendizaje de idiomas: generación de ejemplos de pronunciación en malayo con control de velocidad para adaptar el ritmo al estudiante.
- Pruebas y evaluación de pipelines de voz: su tamano mínimo y su licencia Apache 2.0 lo hacen útil como componente de referencia en tests automatizados de sistemas TTS.

## Benchmarks y rendimiento

Tasa de error de caracteres (CER) medida con Whisper large-v3; menor es mejor. Los datos corresponden a los pesos desde los que continúa esta versión (checkpoint C4); los pesos exactos de v0.3.0 no se habían reevaluado a fecha de 2026-11-17.

| Modelo | Test (200 frases) | Held-out (60 frases) | Proporción ≤ 8 % CER (test) |
|---|---|---|---|
| Michael v0.2 (antes de los datos C4) | 8,7 % / 14,3 % | 7,1 % / 14,3 % | 49 % |
| Michael C4 → v0.3.0 | 6,9 % / 10,6 % | 2,2 % / 8,2 % | 55 % |
| Yati v0.4 (femenina, referencia) | 5,5 % / 9,5 % | 4,8 % / 8,5 % | 68 % |

Textura sonora (mismas 6 frases, sesión de esta versión):

| Métrica | Objetivos de referencia Chatterbox | Yati v0.4.1 | Michael v0.2.2 | Michael v0.3.0 |
|---|---|---|---|---|
| Periodicidad (claridad de tono) | 0,699 | 0,751 | 0,634 | 0,662 |
| Planitud espectral 2–6 kHz | 0,621 | 0,597 | 0,470 | 0,440 |
| Proporción de energía por encima de 4 kHz | 0,080 | 0,025 | 0,095 | 0,091 |
| Proporción de energía por encima de 7 kHz | no disponible | 0,003 | 0,043 | 0,043 |

Tamano, velocidad y coste:

| Métrica | Michael v0.3.0 | Yati v0.4.1 |
|---|---|---|
| Archivo del modelo | 8,47 MB | 8,46 MB |
| Parámetros | 7,9 M | 7,9 M |
| Velocidad en CPU (1 hilo onnxruntime) | ~19× tiempo real | ~21× tiempo real |
| Velocidad en navegador (transformers.js, WebGPU) | ~4,5× tiempo real | ~4–5× tiempo real |
| Primera carga en navegador | ~7–10 s (con caché después) | ~7–10 s |
| Coste de inferencia | 0 (sin servidor ni API) | 0 |
| Offline | sí (un archivo, sin internet en Python/Node) | sí |

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el archivo int8 de 8,47 MB cabe en memoria de cualquier dispositivo.
- GPU recomendadas: ninguna imprescindible; opcionalmente cualquier GPU compatible con WebGPU para la ejecución en navegador.
- Cabe en cualquier GPU de consumo e incluso en CPU de un solo hilo.
- Opciones de despliegue: onnxruntime en Python, transformers.js en navegador o Node (WebGPU o WASM), paquete Python `kecil_tts` y ejemplos de streaming en Python y Node.
- Latencia y throughput: aproximadamente 19 veces el tiempo real en un hilo de CPU y 4,5 veces en navegador con WebGPU; primera carga en navegador de 7 a 10 segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kecil-TTS Michael v0.3.1 | 7,9 M | no disponible | Malayo | Apache 2.0 | Hugging Face, ONNX |
| Kecil-TTS Yati v0.4.1 (misma familia, voz femenina) | 7,9 M | no disponible | Malayo | Apache 2.0 (según familia) | Hugging Face |
| Paradee-8M-v1.3 (modelo base) | ~8 M | no disponible | no disponible | no disponible | Hugging Face |
| Chatterbox Multilingual (usado para generar datos) | no disponible | no disponible | Multilingüe | no disponible | no disponible |

## Limitaciones y advertencias

- La temporización está limitada: en v0.3.1 se eliminó el límite de 75 ms por fonema de v0.3.0, pero la model card de limitaciones aún menciona el clamping; conviene usar `speed` para un habla más rápida.
- Las palabras en inglés y las frases largas son los puntos débiles, con mayor CER.
- El timbre conserva el carácter de doble conversión de voz del audio de entrenamiento (ligeramente apagado en vocales largas).
- Una sola voz masculina sintética, sin control de emoción ni de estilo.
- Es habla sintética: debe indicarse al usuario cuando se utilice.
- El reconocedor empleado para medir el CER confunde aproximadamente el 9 % de los caracteres de los clips de entrenamiento, por lo que ningún modelo obtiene 0.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan restricciones adicionales ni garantías.
- El repositorio muestra 0 descargas y 0 likes, y el tamano declarado es 0,0 GB, lo que sugiere un modelo muy reciente o poco difundido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suarify/kecil-tts-michael-v0.3.1
- Modelo base: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Hermano femenino Kecil-TTS Yati v0.4.1: https://huggingface.co/Suarify/kecil-tts-yati-v0.4.1
- Paquete Python: https://huggingface.co/Suarify/kecil-tts-michael-v0.3.1/resolve/main/dist/kecil_tts_8m-0.3.0-py3-none-any.whl
