# Suarify/kecil-tts-yati-v0.4.1

## Resumen

Kecil-TTS Yati v0.4.1 es un modelo de síntesis de voz (text-to-speech) para bahasa melayu (malayo de Malasia) desarrollado por Suarify. Se trata de un modelo extremadamente compacto: 7,9 millones de parámetros y un único archivo ONNX cuantizado a int8 de 8,46 MB, lo que permite ejecutarlo en una pestaña del navegador mediante transformers.js (WebGPU o WASM) o en un solo hilo de CPU en Python con onnxruntime. La voz es femenina y se llama Yati; la misma arquitectura también da soporte a una voz masculina (Michael) en otro repositorio.

El modelo deriva de `sahilmahendrakar/Paradee-8M-v1.3` y se distribuye bajo licencia Apache 2.0. La versión v0.4.1 comparte exactamente los pesos entrenados de v0.4; únicamente cambia el export ONNX, que recoloca el ruido de respiración entre los parciales armónicos en lugar de superponerlo, reduciendo la textura apagada o "acuosa" del audio sintetizado. La precisión de reconocimiento (medida con Whisper large-v3 vía CER) se mantiene idéntica por construcción.

Su relevancia actual radica en la combinación de tamaño (menos de 9 MB), latencia (unas 25 veces tiempo real en un hilo de CPU y unas 15 veces en WebGPU) y privacidad (todo el procesamiento ocurre en el dispositivo). Es un caso de TTS neuronal desplegable en entornos con recursos mínimos, sin GPU dedicada y sin conexión a servicios externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo acústico neuronal con decodificador armónico + ruido; detalle arquitectónico no publicado en la model card) |
| Parametros totales | 7,9 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; entrada `input_ids` de hasta T=402 fonemas (con 0 en cada extremo) |
| Tipos de cuantizacion | int8 (archivo `onnx/model_quantized.onnx`) |
| Idiomas soportados | Bahasa Melayu (Malasia), con palabras inglesas comunes en el habla malasia |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (cuantizado int8); paquete Python `suaradee` y módulo JS `suaradee.js` para transformers.js 3.x |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de describir el decodificador: sintetiza una parte armónica (pitch y fase aprendida) más una parte de ruido (respiración). El export ONNX está adaptado para ser seguro en WebGPU: sin operadores float64 (el acumulador de fase de pitch corre en float32), límites de slice de 64 bits con clamp y eliminación de la reversión de ruido innecesaria. La conversión de voz a un segundo hablante solo requiere la ruta de pitch y sonoridad, que el export conserva intacta.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La model card sí menciona que duplicar el audio de entrenamiento no mejoró el rendimiento en frases mixtas malayo-inglés, lo que indica que el cuello de botella está en el lado texto/pronunciación del inglés, no en la cantidad de audio. La salida es mono a 24 kHz.

## Capacidades

- Síntesis de voz a partir de texto en bahasa melayu, con salida mono a 24 kHz.
- Control de velocidad mediante el parámetro `speed` (float32).
- Manejo de palabras inglesas comunes en el habla malasia (con limitaciones, ver sección de limitaciones).
- Procesamiento de números y cantidades monetarias (con CER bajo en la categoría de números y dinero).
- Ejecución en navegador (WebGPU o WASM) mediante transformers.js, sin salida de datos del dispositivo.
- Ejecución en Python con onnxruntime y numpy, sin dependencia de PyTorch.
- Capacidad de conversión de voz a un segundo hablante (la ruta de pitch y sonoridad se mantiene en el export).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio de entrada ni modo de razonamiento; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de textos en malayo en el navegador: integración en una página web mediante transformers.js para leer artículos, avisos o contenido de Wikipedia en voz alta sin enviar texto a ningún servidor, aprovechando que el modelo pesa 8,46 MB y corre en WebGPU o WASM.
- Asistentes de voz para atención al cliente en malayo: el modelo rinde especialmente bien en estilo call-centre (CER mediano del 4,3% en citas, facturas y entregas), por lo que es adecuado para locuciones de confirmación, recordatorios y respuestas guiadas en sistemas IVR.
- Accesibilidad en dispositivos de gama baja: al ejecutarse en un solo hilo de CPU a unas 25 veces tiempo real, puede integrarse en aplicaciones de lectura para personas con discapacidad visual en hardware sin GPU.
- Generación de avisos y anuncios locutados: lectura de números, importes y fechas (CER mediano del 2,2% en la categoría de números y dinero) para sistemas de megafonía, transporte público o notificaciones automáticas.
- Prototipado rápido de interfaces de voz: el paquete Python `suaradee` y el módulo JS permiten generar audio de prueba en minutos sin infraestructura de GPU, útil para validar flujos conversacionales antes de invertir en un TTS mayor.
- Aplicaciones offline y de privacidad: despliegue en entornos sin conectividad (kioscos, dispositivos embebidos, aplicaciones de escritorio) donde el procesamiento local es un requisito, gracias al formato ONNX y a la ausencia de dependencia de PyTorch.
- Síntesis de voz para contenido educativo en malayo: generación de narraciones de material didáctico con control de velocidad para adaptar el ritmo a distintos niveles.

## Benchmarks y rendimiento

Los datos publicados miden la inteligibilidad mediante la reproducción del audio sintetizado a Whisper large-v3 y el cálculo del character error rate (CER) frente al texto original. Las puntuaciones de v0.4 se trasladan a v0.4.1 porque comparten exactamente el pipeline de texto y duración. Las tres versiones se evaluaron en la misma sesión sobre las mismas 200 frases de test. El propio reconocedor se equivoca en torno al 9% de los caracteres de los clips de entrenamiento, por lo que ninguna puntuación es 0 y las diferencias inferiores a 1,5 puntos deben tratarse como ruido.

| Categoria | n | v0.2 | v0.3 | v0.4 / v0.4.1 |
|---|---|---|---|---|
| Texto general (estilo Wikipedia, nombres, lugares) | 70 | 9,9% / 13,1% | 6,4% / 11,2% | 5,9% / 10,2% |
| Estilo call-centre (citas, facturas, entregas) | 60 | 5,2% / 6,5% | 4,9% / 7,3% | 4,3% / 6,2% |
| Numeros y dinero | 30 | 5,0% / 6,5% | 0% / 5,8% | 2,2% / 6,0% |
| Malayo con palabras en ingles | 20 | 18,4% / 23,9% | 19,2% / 26,2% | 17,9% / 24,9% |
| Preguntas | 10 | 1,7% / 3,3% | 0% / 2,4% | 0% / 4,3% |
| Frases cortas | 10 | 13,5% / 15,9% | 0% / 15,4% | 4,0% / 10,2% |
| Total | 200 | 7,5% / 10,8% | 5,9% / 10,5% | 5,5% / 9,5% |

En el conjunto separado de 60 frases held-out: v0.4 obtiene 4,8% / 8,5%, v0.2 4,9% / 8,9% y v0.3 5,6% / 10,3%. v0.4 es el mejor de los tres en el conjunto held-out.

Textura sonora (medida sobre las mismas frases que el habla de referencia de Chatterbox):

| Metrica | Chatterbox ref | v0.4 | v0.4.1 |
|---|---|---|---|
| Periodicidad | 0,699 | 0,745 | 0,750 |
| Planitud espectral 2-6 kHz | 0,621 | 0,698 | 0,598 |
| Proporcion de energia > 4 kHz | 0,080 | 0,040 | 0,032 |

Rendimiento de inferencia: aproximadamente 25 veces tiempo real en un hilo de CPU con onnxruntime; aproximadamente 15 veces en una pestaña de navegador con WebGPU (6 veces en la primera llamada).

## Requisitos de hardware

- VRAM estimada: no aplica en la práctica; el modelo pesa 8,46 MB en int8 y cabe en memoria de sistema o en memoria de navegador sin GPU dedicada.
- GPU recomendadas: ninguna imprescindible; WebGPU acelera la inferencia en navegador (unas 15 veces tiempo real frente a WASM). Cualquier GPU con soporte WebGPU es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU consumer con WebGPU; también funciona sin GPU en CPU.
- Opciones de despliegue: onnxruntime (Python, un solo hilo de CPU), transformers.js 3.x (navegador o Node, WebGPU o WASM), paquete `suaradee` (Python), demo Gradio (`examples/gradio_app.py`), Space web de Kecil-TTS.
- Latencia y throughput: unas 25 veces tiempo real en CPU de un hilo; unas 15 veces en WebGPU (6 veces en la primera llamada). No se publican cifras absolutas de latencia por frase.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Idioma | Licencia | Despliegue |
|---|---|---|---|---|---|
| Kecil-TTS Yati v0.4.1 | 7,9 M | Hasta 402 fonemas | Malayo (con inglés común) | Apache 2.0 | ONNX, navegador y CPU |
| Kecil-TTS Michael v0.2 | No disponible | No disponible | Malayo | No disponible en la información | ONNX, navegador y CPU |
| Paradee-8M-v1.3 (modelo base) | ~8 M (por nombre) | No disponible | No disponible | No disponible en la información | No disponible en la información |

No se dispone en la información proporcionada de datos de benchmarks comparativos con otros modelos TTS de la misma categoría (por ejemplo, modelos multilingües de mayor tamaño) más allá de las métricas de textura frente al habla de referencia de Chatterbox recogidas en la sección de benchmarks.

## Limitaciones y advertencias

- El amortiguamiento de altas frecuencias es heredado del entrenamiento del decodificador, no del export; v0.4.1 elimina la textura acuosa pero el brillo general sigue por debajo de la referencia de Chatterbox y puede quedar una cola acuosa tenue al final de las frases.
- Las palabras en inglés son el punto débil: las frases que mezclan malayo e inglés puntúan alrededor del 18% de CER. Duplicar el audio de entrenamiento no movió esta cifra, por lo que el límite está en el lado texto/pronunciación del inglés.
- El reconocedor usado para evaluar (Whisper large-v3) se equivoca en torno al 9% de los caracteres de los clips de entrenamiento, lo que introduce un suelo en las métricas; diferencias inferiores a 1,5 puntos son ruido.
- El modelo está entrenado para bahasa melayu de Malasia; no se documenta soporte para otros dialectos o variantes del malayo ni para otros idiomas.
- Es un modelo TTS puro: no tiene tool calling, razonamiento, visión ni capacidades de agente.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar el cumplimiento de las condiciones aplicables al modelo base `sahilmahendrakar/Paradee-8M-v1.3`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB; conviene verificar la integridad de los archivos antes de desplegarlo en producción.
- Riesgo de alucinación no aplica en el sentido de generación de texto libre, pero sí existe riesgo de pronunciación incorrecta en nombres propios, siglas y palabras no vistas durante el entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Suarify/kecil-tts-yati-v0.4.1
- Versión anterior v0.4: https://huggingface.co/Suarify/kecil-tts-yati-v0.4
- Voz masculina Michael v0.2: https://huggingface.co/Suarify/kecil-tts-michael-v0.2
- Modelo base: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Demo web (Space): https://huggingface.co/spaces/Suarify/suaradee-web
- Paquete Python (wheel): https://huggingface.co/Suarify/kecil-tts-yati-v0.4.1/resolve/main/dist/suaradee-0.4.1-py3-none-any.whl
