# Suarify/kecil-tts-yati-v0.4

## Resumen

Kecil-TTS Yati v0.4 es un modelo de síntesis de voz (text-to-speech) para bahasa Melayu (Malasia) desarrollado por Suarify. Se trata de un modelo extremadamente compacto, con 7,9 millones de parámetros y un único archivo ONNX de 8,46 MB en pesos int8, diseñado para ejecutarse en el navegador mediante transformers.js (WebGPU o WASM) o en un solo hilo de CPU en Python con onnxruntime. Deriva del modelo base sahilmahendrakar/Paradee-8M-v1.3 y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo reside en su relación tamaño-prestaciones: produce audio mono a 24 kHz a aproximadamente 25 veces el tiempo real en un hilo de CPU y unas 15 veces en tiempo real en una pestaña de navegador con WebGPU (6 veces en la primera llamada). Esto lo hace adecuado para aplicaciones web sin servidor, entornos con recursos muy limitados y despliegues edge donde no es viable cargar un modelo TTS convencional de cientos de megabytes.

La versión 0.4 duplica aproximadamente los datos de entrenamiento respecto a la v0.3 (1.281 frases alineadas, unos 118 minutos de audio, frente a 634 frases y 49 minutos), mejorando un 8% relativo en texto general y alcanzando el mejor resultado hasta la fecha en el conjunto de validación reservado. Mantiene una única voz femenina sintética (Yati) sin control de emoción ni estilo, y conserva el problema de sonido apagado heredado de versiones anteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS derivado de Paradee-8M-v1.3; exportado a ONNX) |
| Parametros totales | 7,9 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; entrada de hasta 402 ids de fonemas (`input_ids` int64 `[1,T]`) |
| Tipos de cuantizacion | int8 (pesos cuantizados en `onnx/model_quantized.onnx`) |
| Idiomas soportados | Bahasa Melayu (Malasia), con palabras inglesas comunes del habla malasia (lista de ~430) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (transformers.js / onnxruntime) |

## Arquitectura y entrenamiento

El modelo es una exportación ONNX de una arquitectura TTS derivada de Paradee-8M-v1.3, con 7,9 millones de parámetros y salida de audio mono a 24 kHz. La entrada son identificadores de fonemas (`input_ids` en int64 con un 0 en cada extremo y longitud máxima de 402) junto con un parámetro `speed` en float32. La exportación está optimizada para WebGPU: no emplea operadores float64 (el acumulador de fase de tono funciona en float32), los límites de slice de 64 bits están acotados y se eliminó una inversión de ruido innecesaria. La ruta de tono y sonoridad se mantiene intacta para permitir la conversión de voz a un segundo hablante.

El entrenamiento de la v0.4 parte del conjunto limpio de la v0.3 (que descartó 120 de 742 clips que el reconocedor no podía leer de vuelta) y añade 767 clips nuevos generados, unos 69 minutos, dirigidos a las categorías débiles: 295 frases de texto general, 136 de malayo con inglés, 174 conversacionales, 142 con números y 20 preguntas. En total, 1.281 frases alineadas y unos 118 minutos de audio. No se documenta en la información disponible el uso de RLHF, DPO ni detalles sobre la composición completa del dataset original.

## Capacidades

- Síntesis de voz a partir de texto en bahasa Melayu (Malasia) con salida mono a 24 kHz.
- Manejo de palabras inglesas comunes integradas en el habla malasia (lista de aproximadamente 430 términos).
- Normalización basada en reglas de números, cantidades, fechas, horas y números de teléfono, leídos en malayo.
- Procesamiento de texto largo mediante división por finales de frase en fragmentos de como máximo 400 fonemas.
- Ejecución en navegador mediante transformers.js 3.x con WebGPU o WASM, sin enviar datos fuera del dispositivo.
- Ejecución en Python con onnxruntime y numpy, sin dependencia de PyTorch.
- Control de velocidad mediante el parámetro `speed`.
- Una única voz femenina (Yati); la misma arquitectura da soporte a la voz masculina Michael en un modelo separado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.

## Casos de uso

- Lectura por voz en aplicaciones web sin servidor: el modelo se ejecuta íntegramente en la pestaña del navegador con WebGPU o WASM, de modo que el texto del usuario nunca sale de su dispositivo; adecuado para lectores de artículos, accesibilidad o interfaces de voz en sitios estáticos.
- Asistentes de voz para malayo en dispositivos de bajos recursos: con 8,46 MB y unos 25x tiempo real en un solo hilo de CPU, puede integrarse en raspberry pi, routers o terminales empotrados que no pueden alojar un TTS convencional.
- Atención al cliente automatizada en malayo: el estilo de centro de llamadas obtiene un CER mediano del 4,3% en el conjunto de prueba, lo que lo hace viable para respuestas de cita, facturas y entregas en sistemas IVR.
- Anuncios y avisos con números y cantidades: la normalización por reglas lee importes, fechas y horas en malayo, útil en sistemas de megafonía, banca telefónica o notificaciones de pedidos.
- Generación de audio para prototipos y demos: al no requerir GPU ni PyTorch, permite añadir voz malasia a un prototipo en minutos con `pip install onnxruntime numpy`.
- Preprocesado de datos y aumentación: la velocidad de inferencia (25x tiempo real en CPU) permite generar grandes volúmenes de audio sintético para pruebas de pipelines ASR o para validación de sistemas de reconocimiento de voz en malayo.
- Conversión de voz a un segundo hablante: la exportación conserva la ruta de tono y sonoridad, lo que habilita experimentos de cambio de voz sobre la misma arquitectura.

## Benchmarks y rendimiento

Los resultados se miden con Whisper large-v3 transcribiendo el audio generado y comparándolo con el texto original (tasa de error de caracteres, CER; menor es mejor). Las tres versiones se evaluaron en la misma sesión sobre las mismas 200 frases de prueba. El propio reconocedor comete alrededor de un 9% de errores sobre los clips de entrenamiento, por lo que las diferencias inferiores a 1,5 puntos deben considerarse ruido.

| Categoria | n | v0.2 | v0.3 | v0.4 |
|---|---|---|---|---|
| Texto general (estilo Wikipedia, nombres, lugares) | 70 | 9,9% / 13,1% | 6,4% / 11,2% | 5,9% / 10,2% |
| Estilo centro de llamadas (citas, facturas, entregas) | 60 | 5,2% / 6,5% | 4,9% / 7,3% | 4,3% / 6,2% |
| Números y dinero | 30 | 5,0% / 6,5% | 0% / 5,8% | 2,2% / 6,0% |
| Malayo con palabras inglesas | 20 | 18,4% / 23,9% | 19,2% / 26,2% | 17,9% / 24,9% |
| Preguntas | 10 | 1,7% / 3,3% | 0% / 2,4% | 0% / 4,3% |
| Frases cortas | 10 | 13,5% / 15,9% | 0% / 15,4% | 4,0% / 10,2% |
| Total | 200 | 7,5% / 10,8% | 5,9% / 10,5% | 5,5% / 9,5% |

En el conjunto reservado de 60 frases: v0.4 obtiene 4,8% / 8,5%, frente a 4,9% / 8,9% de v0.2 y 5,6% / 10,3% de v0.3. No se han publicado comparaciones con otros modelos TTS en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier configuración; el archivo ONNX pesa 8,46 MB en int8, por lo que cabe holgadamente en memoria de sistema o en memoria de navegador.
- GPU recomendadas: no requiere GPU. Funciona en CPU de un solo hilo con onnxruntime; en navegador aprovecha WebGPU si está disponible y recurre a WASM en caso contrario.
- Cabe en cualquier GPU de consumo, incluida una RTX 4090, así como en iGPU y dispositivos empotrados; el uso de GPU no es un requisito.
- Opciones de despliegue: onnxruntime (Python), transformers.js 3.x (navegador y Node), y el paquete `suaradee` 0.4.0 distribuido como wheel desde el propio repositorio. También hay una demo Gradio en `examples/gradio_app.py`.
- Latencia y throughput: aproximadamente 25x tiempo real en un hilo de CPU con onnxruntime; aproximadamente 15x en tiempo real en una pestaña de navegador con WebGPU (6x en la primera llamada, por el calentamiento).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kecil-TTS Yati v0.4 | 7,9 M | Hasta 402 ids de fonemas | Malayo (+ inglés común) | Apache 2.0 | ONNX int8 | 8,46 MB, 24 kHz, ejecución en navegador |
| Kecil-TTS Michael v0.2 | No disponible | No disponible | Malayo | Apache 2.0 | ONNX | Misma arquitectura, voz masculina |
| Paradee-8M-v1.3 (modelo base) | ~8 M (por nombre) | No disponible | No disponible | No disponible | No disponible | Modelo del que deriva Kecil-TTS |
| Kecil-TTS Yati v0.3 | 7,9 M (misma arquitectura) | Hasta 402 ids de fonemas | Malayo | Apache 2.0 | ONNX int8 | Versión anterior con 634 frases / 49 min de entrenamiento |

No se dispone en la información proporcionada de comparaciones con otros modelos TTS de la misma categoría (por ejemplo, modelos multilingües de mayor tamaño); por tanto, la comparativa se limita a las variantes del propio linaje Kecil-TTS.

## Limitaciones y advertencias

- Sonido apagado heredado desde la v0.1: la energía de alta frecuencia es similar a la de la v0.3 (0,0125 frente a 0,0129 de energía total por encima de 4 kHz en 24 frases), con la misma cualidad amortiguada y con desfase de fase. Proviene del entrenamiento del decodificador, no del tiempo ni del volumen de datos; una reparación sin entrenamiento fue probada y rechazada (el sonido original se prefirió 8 de 8 veces).
- Las palabras inglesas son el punto débil: las frases que mezclan malayo e inglés puntúan alrededor del 18% de CER. Duplicar el audio de entrenamiento no movió esta cifra, lo que indica que el límite está en el texto y la pronunciación ingleses, no en la cantidad de audio. Solo se manejan palabras inglesas incluidas en una lista de aproximadamente 430 términos comunes.
- Ruido por frase: comparando v0.4 con v0.3 frase a frase, 103 mejoraron, 62 quedaron igual y 95 empeoraron; la mejora es agregada, no uniforme.
- Una única voz femenina sintética (Yati), sin control de emoción ni de estilo.
- Diseñado para frases cortas: el texto largo se divide en fragmentos de como máximo 400 fonemas.
- Números, importes, fechas, horas y teléfonos se leen en malayo mediante un normalizador basado en reglas, con posibles errores en formatos no contemplados.
- Es habla sintética: el autor pide indicarlo explícitamente cuando se use.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- No se documentan sesgos específicos ni tasas de alucinación en la información disponible; al ser un modelo TTS, el riesgo principal es la pronunciación incorrecta o ininteligible, no la generación de contenido falso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suarify/kecil-tts-yati-v0.4
- Modelo base: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Versión anterior v0.3: https://huggingface.co/Suarify/kecil-tts-yati-v0.3
- Voz masculina Michael v0.2: https://huggingface.co/Suarify/kecil-tts-michael-v0.2
- Demo web en el navegador (Space): https://huggingface.co/spaces/Suarify/suaradee-web
- Paquete Python `suaradee` 0.4.0 (wheel): https://huggingface.co/Suarify/kecil-tts-yati-v0.4/resolve/main/dist/suaradee-0.4.0-py3-none-any.whl
