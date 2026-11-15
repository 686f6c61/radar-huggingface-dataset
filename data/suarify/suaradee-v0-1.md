# Suarify/suaradee-v0.1

## Resumen

Suaradee v0.1 es un modelo de síntesis de voz (text-to-speech) para bahasa melayu (malasio) desarrollado por Suarify. Se trata de un modelo extremadamente compacto: 7,9 millones de parámetros y un único archivo ONNX cuantizado a int8 de 8,46 MB, lo que permite ejecutarlo tanto en una pestaña de navegador mediante transformers.js (WebGPU o WASM) como en un solo hilo de CPU en Python con onnxruntime. La arquitectura es la de Paradee-8M-v1.3, de la que hereda los pesos iniciales, con una parte textual que predice duraciones de fonemas, tono, sonoridad y características, y un decodificador que las convierte en audio a 24 kHz mono.

El modelo resuelve el problema de disponer de TTS local, sin conexión y de huella mínima para una lengua con pocos recursos como el malayo. Su relevancia radica en la combinación de tamano (menos de 10 MB), velocidad (unas 25 veces tiempo real en un hilo de CPU y unas 15 veces en WebGPU) y despliegue ubicuo (Python, Node y navegador). No obstante, es una primera versión con calidad limitada: sonido apagado, aproximadamente una frase de cada diez con una palabra errónea y una única voz sintética femenina sin control de emoción ni estilo.

El autor indica explícitamente que existe una versión más precisa, Suaradee v0.2, con el error típico aproximadamente reducido a la mitad. Esta ficha describe v0.1 tal como se publicó.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paradee-8M (modelo acústico con predictor de duración, tono y sonoridad más decodificador de audio); exportado como `StyleTextToSpeech2Model` |
| Parametros totales | 7,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entrada `input_ids` de hasta T = 402 fonemas, texto largo dividido en fragmentos de como máximo 400 fonemas |
| Tipos de cuantizacion | int8 (archivo `onnx/model_quantized.onnx`) |
| Idiomas soportados | Bahasa Melayu (Malasia), con palabras inglesas frecuentes en el habla malasia |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`, 8,46 MB); paquete Python `suaradee-0.1.0-py3-none-any.whl`; JavaScript con transformers.js 3.x |

## Arquitectura y entrenamiento

El modelo sigue la receta y arquitectura de Paradee-8M-v1.3, partiendo de sus pesos. Consta de una parte textual que predice duraciones de fonemas, tono, sonoridad y características acústicas, y un decodificador que transforma esas predicciones en audio a 24 kHz mono. La entrada son identificadores de fonemas (int64, `[1,T]`, con un 0 en cada extremo y T hasta 402) y un parámetro `speed` (float32, `[1]`). El front end es una cadena de reglas en malayo (carpeta `suaradee/`, portada línea a línea a `js/`) que escribe el texto como fonemas usando el vocabulario de 178 símbolos de Kokoro-82M; distingue la vocal pepet de la taling mediante un léxico de 24.000 palabras y normaliza números, abreviaturas y préstamos ingleses.

Los datos de entrenamiento se generaron sintéticamente: unas 750 frases se convirtieron en voz con Chatterbox Multilingual (un modelo mayor), se unificaron en una única voz y, tras el recorte, se conservaron aproximadamente 49 minutos de audio, de los cuales 60 frases se reservaron para prueba. El archivo ONNX se adaptó para ser compatible con WebGPU: se movió un acumulador de fase de doble precisión a float32 y se limitaron los límites de slice de 64 bits, ya que el backend WebGPU de ONNX Runtime Web no puede ejecutarlos; según el autor, el audio no cambia respecto a la exportación sin parchear. No se documentan fases de RLHF ni DPO.

## Capacidades

- Síntesis de voz a partir de texto en bahasa melayu, con salida de audio a 24 kHz mono.
- Normalización de números, cantidades, fechas, horas y números de teléfono mediante reglas, leídos en malayo.
- Manejo de palabras inglesas de uso común en el habla malasia, limitado a una lista de unas 430 palabras (`confirm`, `booking`, `email`, etc.).
- Control de velocidad mediante el parámetro `speed`.
- Ejecución en navegador con transformers.js (WebGPU o WASM) y en Node 24 con transformers.js 3.8, con salida idéntica muestra a muestra respecto a Python.
- Ejecución en Python con onnxruntime y numpy, sin PyTorch, en un solo hilo de CPU.
- Segmentación automática de texto largo en frases y fragmentos de como máximo 400 fonemas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento.

## Casos de uso

- Lectura de texto en aplicaciones web sin conexión: el modelo se carga en una pestaña mediante transformers.js y WebGPU, y todo el procesamiento ocurre en el dispositivo, sin enviar texto a ningún servidor; adecuado para interfaces de accesibilidad o lectores de contenido en malayo.
- Asistentes de voz para atención al cliente en malayo: el modelo obtiene una tasa de error de caracteres mediana del 9,7 % en frases de estilo call-centre (citas, facturas, entregas), su punto más fuerte, por lo que sirve para respuestas guionizadas de baja latencia.
- Prototipado rápido de productos de voz: con 8,46 MB y dependencias mínimas (onnxruntime y numpy), se puede integrar en un pipeline de CI/CD o en un contenedor ligero para validar flujos de TTS antes de invertir en un modelo mayor.
- Sistemas embebidos y de borde: al ejecutarse a unas 25 veces tiempo real en un solo hilo de CPU, cabe en dispositivos con recursos muy limitados donde no es viable un modelo de cientos de millones de parámetros.
- Anuncios y avisos automatizados en malayo: la normalización por reglas de números, fechas y horas permite generar avisos de citas, importes o horarios sin preprocesado adicional.
- Pruebas de integración continua de pipelines de audio: al ser determinista y coincidir la salida entre Python y Node muestra a muestra, sirve como referencia para validar conversiones ONNX y despliegues de transformers.js.
- Demos educativas de TTS en el navegador: el Space web y el ejemplo Gradio permiten mostrar el funcionamiento completo de un sistema TTS sin infraestructura de servidor.

## Benchmarks y rendimiento

La calidad se midió reproduciendo el audio del modelo a Whisper large-v3 y comparando lo transcrito con el texto original (tasa de error de caracteres, CER; menor es mejor). El propio reconocedor confunde entre el 7 % y el 9 % de los caracteres de los clips humanos que el modelo imita, por lo que ningún modelo puntúa 0.

| Frases no vistas | n | CER mediana | Proporción con CER ≤ 8 % |
|---|---|---|---|
| Estilo call-centre (citas, facturas, entregas) | 40 | 9,7 % | 42 % |
| Conjunto mixto reservado, global | 60 | 17 % | 23 % |
| — texto general | 17 | 17 % | no disponible |
| — números y dinero | 12 | 21 % | no disponible |
| — malayo con palabras inglesas | 6 | 17 % | no disponible |

Rendimiento de inferencia declarado por el autor: aproximadamente 25 veces tiempo real en un hilo de CPU con onnxruntime; aproximadamente 15 veces en una pestaña de navegador con WebGPU (6 veces en la primera llamada).

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB; el archivo ONNX pesa 8,46 MB y el modelo completo son 7,9 M de parámetros, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU. En navegador se beneficia de WebGPU (probado en Chromium) y recurre a WASM si no está disponible.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, integradas) y en CPU de un solo hilo.
- Opciones de despliegue: onnxruntime en Python, transformers.js 3.x en navegador y Node 24, y Gradio mediante `examples/gradio_app.py`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: unas 25 veces tiempo real en CPU de un hilo y unas 15 veces en WebGPU (6 veces en la primera llamada).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Suaradee v0.1 | 7,9 M | hasta 402 fonemas por fragmento | ms (con inglés frecuente) | Apache 2.0 | ONNX int8 |
| Suaradee v0.2 | no disponible | no disponible | ms | no disponible | no disponible |
| Paradee-8M-v1.3 (modelo base) | 8 M (aproximado, según nombre) | no disponible | no disponible | no disponible | no disponible |
| Kokoro-82M (referencia de vocabulario) | 82 M (según nombre) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada; la única comparación documentada es que Suaradee v0.2 reduce el error típico aproximadamente a la mitad respecto a v0.1.

## Limitaciones y advertencias

- Sonido apagado: el audio tiene aproximadamente un 40 % menos de energía por encima de 4 kHz que el habla de entrenamiento y armónicos superiores difuminados (cualidad "damp" o ligeramente faseada), un problema conocido de la primera ejecución de entrenamiento.
- Aproximadamente una frase de cada diez contiene una palabra errónea, con más frecuencia en nombres, números y palabras poco comunes.
- Una única voz sintética femenina, sin control de emoción ni de estilo.
- Pensado para frases cortas: el texto largo se divide al final de frase y se envía en fragmentos de como máximo 400 fonemas.
- Las palabras inglesas solo se gestionan si figuran en una lista de unas 430 palabras comunes.
- El texto libre fuera del estilo call-centre, los nombres propios, los topónimos y los números son los puntos débiles (CER mediana del 17 % en el conjunto mixto y del 21 % en números y dinero).
- Es voz sintética: el autor pide indicarlo cuando se utilice.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y no se ofrece garantía alguna.
- Riesgo de alucinación acústica: al ser un modelo generativo, puede producir pronunciaciones incorrectas o palabras no presentes en el texto, especialmente en dominios no representados en el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suarify/suaradee-v0.1
- Versión más reciente, Suaradee v0.2: https://huggingface.co/Suarify/suaradee-v0.2
- Demo web en el navegador: https://huggingface.co/spaces/Suarify/suaradee-web
- Modelo base, Paradee-8M-v1.3: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Paquete Python: https://huggingface.co/Suarify/suaradee-v0.1/resolve/main/dist/suaradee-0.1.0-py3-none-any.whl
