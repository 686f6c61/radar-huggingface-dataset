# Suarify/suaradee-v0.2

## Resumen

Suaradee v0.2 es un modelo de síntesis de voz (text-to-speech) para bahasa Melayu (malayo de Malasia) desarrollado por Suarify. Se trata de un modelo extremadamente compacto: 7,9 millones de parámetros y un único fichero ONNX cuantizado a int8 de 8,46 MB, lo que permite ejecutarlo dentro de una pestaña del navegador mediante transformers.js (WebGPU o WASM) o en un solo hilo de CPU en Python con onnxruntime, sin necesidad de PyTorch.

El modelo parte de la arquitectura Paradee-8M-v1.3 de sahilmahendrakar y se ha especializado en malayo mediante un front-end fonético basado en reglas y un conjunto de entrenamiento sintético generado con Chatterbox Multilingual. La versión 0.2 corrige el alineamiento fonético del entrenamiento (v0.1 estimaba los límites de fonema por proporciones), lo que reduce aproximadamente a la mitad el error de carácter medido con Whisper large-v3 respecto a v0.1.

Su relevancia actual reside en el nicho: TTS multilingüe de muy bajo coste computacional y despliegue íntegramente local (incluido navegador), con licencia Apache 2.0. No obstante, el propio autor advierte de que el audio sigue teniendo una calidad apagada (déficit de energía por encima de 4 kHz) y de que el modelo está pensado para frases cortas y dominios acotados, no para texto libre general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (StyleTextToSpeech2Model), decoder de la familia Paradee-8M |
| Parámetros totales | 7,9 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de hasta 402 fonemas (T ≤ 402) |
| Tipos de cuantización | int8 (pesos cuantizados, fichero `onnx/model_quantized.onnx`) |
| Idiomas soportados | ms (bahasa Melayu, Malasia), con ~430 palabras inglesas de uso común |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (cuantizado int8); paquete Python `suaradee-0.2.0-py3-none-any.whl`; integración JS vía transformers.js 3.x |
| Frecuencia de salida | 24 kHz mono |
| Entradas | `input_ids` (int64 `[1,T]`, ids de fonema con 0 en cada extremo) y `speed` (float32 `[1]`) |
| Vocabulario fonético | 178 símbolos (el de Kokoro-82M) |
| Léxico | 24.000 palabras para vocales pepet y taling |
| Voz | una única voz femenina sintética, sin control de emoción ni estilo |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura StyleTTS2 tal como la implementa Paradee-8M-v1.3, de la que hereda los pesos iniciales. La entrada no es texto directo sino secuencias de fonemas: un front-end basado en reglas (`suaradee/`, portado línea a línea a `js/`) convierte el malayo escrito en fonemas del vocabulario de 178 símbolos de Kokoro-82M, apoyándose en un léxico de 24.000 palabras para resolver las vocales pepet y taling. El decoder genera audio a 24 kHz mono.

El entrenamiento se realizó sobre aproximadamente 750 frases sintetizadas con Chatterbox Multilingual (un modelo mayor), convertidas a una voz consistente y recortadas hasta unos 49 minutos de audio útil; 60 frases se reservaron para evaluación. La innovación principal de v0.2 es el alineamiento temporal: en v0.1 la mitad de los límites de fonema dentro de palabra tenían un error superior a un frame (25 ms) porque se estimaban por proporciones; en v0.2 se temporizan los fonemas de cada palabra malaya mediante alineamiento forzado a nivel de letra sobre el audio de entrenamiento (6.050 de 6.318 palabras), manteniendo la misma arquitectura y receta. El entrenamiento completo llevó menos de una hora. El fichero ONNX se adaptó para ser seguro en WebGPU (acumulador de fase en float32, límites de slice de 64 bits recortados, eliminación de una inversión de ruido innecesaria), sin alterar el audio resultante.

## Capacidades

- Síntesis de voz a partir de texto en bahasa Melayu (Malasia) con salida de 24 kHz mono.
- Pronunciación de números, importes, fechas, horas y teléfonos mediante un normalizador basado en reglas que los lee en malayo.
- Manejo de unas 430 palabras inglesas frecuentes en el habla malasia, dentro de frases en malayo.
- Inferencia en navegador con transformers.js 3.x (WebGPU si está disponible, si no WASM) y en Python con onnxruntime, sin PyTorch.
- Control de velocidad mediante la entrada `speed` (float32).
- Procesamiento de texto largo troceado por fin de frase en fragmentos de como máximo 400 fonemas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento.

## Casos de uso

- Lectura de avisos y confirmaciones en aplicaciones de atención al cliente en malayo: el modelo rinde especialmente bien en estilo call-centre (CER mediano del 4,8 % en frases no vistas de citas, facturas y entregas), por lo que encaja en respuestas habladas de IVR o chatbots de soporte.
- Anuncios de importes, fechas y horas en sistemas de facturación o recordatorios: el normalizador basado en reglas lee números y cantidades en malayo con un CER mediano del 2,9 % en el conjunto de prueba de números y dinero.
- Accesibilidad web sin backend: al ejecutarse en una pestaña con transformers.js y WebGPU, permite leer contenido en malayo en el navegador sin enviar texto a ningún servidor, útil para lectores de pantalla o modos de lectura.
- Kioscos y dispositivos embebidos de bajo consumo: con 8,46 MB de pesos y unas 25 veces tiempo real en un solo hilo de CPU, cabe en hardware modesto (Raspberry Pi, terminales de punto de venta) para mensajes pregrabados dinámicamente.
- Prototipado rápido de interfaces de voz en malayo: el paquete Python y los ejemplos de Gradio permiten generar muestras en minutos sin infraestructura GPU.
- Pruebas automatizadas de pipelines de audio: su velocidad (unas 15 veces tiempo real en WebGPU) y su naturaleza determinista por frase facilitan generar corpus de prueba o validar integraciones de TTS en CI.
- Aplicaciones offline de aprendizaje de malayo: pronunciación de frases cortas y vocabulario con una voz consistente, aceptando la limitación de calidad tímbrica.

## Benchmarks y rendimiento

La evaluación se realizó con Whisper large-v3 como reconocedor y comparando la transcripción con el texto original (CER, menor es mejor). El propio reconocedor comete aproximadamente un 9 % de error sobre los clips de referencia, por lo que ningún modelo alcanza 0.

| Conjunto (frases no vistas) | n | CER mediano v0.1 | CER mediano v0.2 | v0.2 ≤ 8 % |
|---|---|---|---|---|
| Estilo call-centre (citas, facturas, entregas) | 40 | 9,7 % | 4,8 % | 70 % |
| Conjunto mixto retenido, global | 60 | 17 % | 6,3 % | 52 % |
| — de estilo call-centre | 23 | 12,5 % | 2,9 % | — |
| — números y dinero | 12 | 21 % | 2,9 % | — |
| — texto general | 17 | 17 % | 12 % | — |
| — malayo con palabras inglesas | 6 | 17 % | 18 % | — |

Rendimiento de inferencia declarado por el autor: aproximadamente 25 veces tiempo real en un hilo de CPU con onnxruntime; unas 15 veces tiempo real en navegador con WebGPU (6 veces en la primera llamada).

## Requisitos de hardware

- VRAM: no requiere GPU; el fichero ONNX int8 ocupa 8,46 MB y la inferencia puede ejecutarse en CPU.
- GPU recomendadas: no aplica para CPU; para aceleración en navegador, cualquier GPU compatible con WebGPU (el autor no especifica modelos concretos).
- GPU de consumo: irrelevante por tamaño; cabe en cualquier equipo, incluidos dispositivos de gama baja y navegadores móviles con WebGPU o WASM.
- Despliegue: onnxruntime + numpy en Python (paquete `suaradee`), transformers.js 3.x en navegador o Node, Gradio para demo local (`examples/gradio_app.py`), y el Space web oficial.
- Latencia y throughput: ~25× tiempo real en un hilo de CPU; ~15× en WebGPU (6× en la primera llamada). No se publican cifras de latencia absoluta por frase.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto/entrada | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|---|
| Suaradee v0.2 | 7,9 M | ms (+ inglés limitado) | hasta 402 fonemas | Apache 2.0 | ONNX, transformers.js, onnxruntime | Voz única, calidad apagada, CER mediano 6,3 % en mixto |
| Paradee-8M-v1.3 (modelo base) | ~8 M | no disponible | no disponible | no disponible | no disponible | Arquitectura y receta de origen; Suaradee parte de sus pesos |
| Kokoro-82M | 82 M | múltiples (no disponible el detalle) | no disponible | no disponible | no disponible | Origen del vocabulario fonético de 178 símbolos usado por Suaradee |
| Chatterbox Multilingual | no disponible | multilingüe | no disponible | no disponible | no disponible | Usado por el autor para generar el audio de entrenamiento sintético |

## Limitaciones y advertencias

- Sonido apagado sin corregir respecto a v0.1: aproximadamente un 30 % menos de energía por encima de 4 kHz que el audio de entrenamiento y armónicos superiores difuminados (cualidad sorda o ligeramente faseada). La causa está en el entrenamiento del decoder, no en la corrección temporal.
- Punto débil en palabras inglesas: las frases que mezclan malayo e inglés obtienen un CER mediano del 18 %; solo se manejan palabras inglesas de una lista de unas 430.
- Texto general (estilo Wikipedia, nombres propios, topónimos) presenta un CER mediano del 12 %.
- Una única voz femenina sintética, sin control de emoción ni de estilo.
- Diseñado para frases cortas: el texto largo se trocea por fin de frase en fragmentos de hasta 400 fonemas, lo que puede afectar a la prosodia entre fragmentos.
- Las cifras de evaluación provienen de frases del mismo pool de prompts que el entrenamiento (distintas frases, estilo similar); el texto libre real será más difícil.
- Es voz sintética: el autor pide indicarlo explícitamente cuando se use.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni auditorías de sesgo; el modelo se distribuye con 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- No soporta tool calling, agentes, visión ni otras modalidades; su ámbito es exclusivamente TTS de malayo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suarify/suaradee-v0.2
- Versión anterior v0.1: https://huggingface.co/Suarify/suaradee-v0.1
- Demo web (Space): https://huggingface.co/spaces/Suarify/suaradee-web
- Modelo base Paradee-8M-v1.3: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Paquete Python: https://huggingface.co/Suarify/suaradee-v0.2/resolve/main/dist/suaradee-0.2.0-py3-none-any.whl
- Fichero ONNX cuantizado: `onnx/model_quantized.onnx` dentro del repositorio del modelo
- Ejemplos incluidos en el repositorio: `examples/gradio_app.py`, scripts de Python y Node, y `samples/sentences.txt`
