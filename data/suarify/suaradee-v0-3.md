# Suarify/suaradee-v0.3

## Resumen

Suaradee v0.3 es un modelo de síntesis de voz (text-to-speech) para bahasa Melayu (malayo de Malasia) desarrollado por Suarify. Se trata de un modelo extremadamente compacto: 7,9 millones de parámetros y un único archivo ONNX cuantizado de 8,46 MB, lo que permite ejecutarlo en una pestaña del navegador mediante transformers.js (WebGPU o WASM) o en un solo hilo de CPU en Python con onnxruntime. Está construido sobre la arquitectura Paradee-8M-v1.3 de sahilmahendrakar, de la que hereda la topología StyleTextToSpeech2.

La relevancia del modelo reside en su perfil de despliegue: no requiere GPU dedicada ni PyTorch, y su huella de memoria lo hace apto para entornos edge, aplicaciones web offline y dispositivos con recursos limitados. La versión v0.3 es una iteración centrada en precisión: se reentrenó el decodificador y la parte textual tras eliminar 120 de los 742 clips de entrenamiento que el reconocedor automático leía mal, lo que redujo el error a nivel de palabra aproximadamente un 15 % respecto a v0.2.

El modelo acepta texto en malayo (con un conjunto limitado de palabras inglesas frecuentes en el habla malasia), lo convierte a fonemas mediante un front-end propio y genera audio mono a 24 kHz. Su principal limitación conocida es una calidad tímbrica apagada ("muffled") heredada de versiones anteriores, que el autor documenta explícitamente y que no se corrigió en esta entrega.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | StyleTextToSpeech2 (Paradee-8M-v1.3), exportada a ONNX |
| Parámetros totales | 7,9 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de hasta 402 fonemas (T ≤ 402) |
| Tipos de cuantización | int8 (pesos cuantizados, `model_quantized.onnx`) |
| Idiomas soportados | Bahasa Melayu (Malasia), con ~430 palabras inglesas comunes |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`, 8,46 MB) |
| Frecuencia de salida | 24 kHz, mono |
| Entradas | `input_ids` (int64 `[1,T]`, ids de fonemas con 0 en cada extremo) y `speed` (float32 `[1]`) |
| Modelo base | sahilmahendrakar/Paradee-8M-v1.3 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura StyleTextToSpeech2 en su variante Paradee de 8 M de parámetros, un diseño de síntesis acústica ligera que mapea secuencias de ids de fonemas a formas de onda o representaciones acústicas. La inferencia se realiza íntegramente mediante ONNX Runtime, sin dependencia de PyTorch, y el archivo exportado incorpora adaptaciones para compatibilidad con WebGPU: el acumulador de fase en float64 se convirtió a float32, los límites de slice de 64 bits se recortan y se eliminó una inversión de ruido superflua, sin alterar el audio resultante.

El entrenamiento de v0.3 partió del mismo recetario que v0.2, pero con un conjunto de datos depurado: se puntuaron los 742 clips de entrenamiento con el mismo reconocedor empleado en la evaluación (Whisper large-v3) y se descartaron los 120 peores (109 ilegibles por el reconocedor y 30 con velocidades de habla atípicas o solapamientos). Sobre ese corpus limpio se reentrenaron el decodificador y la parte textual. El front-end textual es propio: un conversor grafema-fonema específico para malayo que también normaliza por reglas números, importes, fechas, horas y teléfonos. No se documentan fases de RLHF ni DPO; el ajuste es puramente supervisado sobre pares texto-audio.

## Capacidades

- Síntesis de voz en bahasa Melayu a partir de texto escrito, con salida mono a 24 kHz.
- Conversión grafema-fonema integrada para malayo, con normalización basada en reglas de números, cantidades monetarias, fechas, horas y números de teléfono.
- Manejo de un vocabulario cerrado de aproximadamente 430 palabras inglesas de uso común en el habla malasia.
- Control de velocidad mediante el parámetro de entrada `speed` (float32).
- Ejecución en navegador con transformers.js 3.x, seleccionando WebGPU si está disponible y WASM en caso contrario.
- Ejecución en Python con onnxruntime y numpy, sin PyTorch, en un solo hilo de CPU.
- Procesamiento por fragmentos: el texto largo se divide en límites de frase y se envía en piezas de como máximo 400 fonemas.
- No dispone de control de emoción, estilo ni de selección entre múltiples voces: una única voz femenina sintética.
- No soporta tool calling, razonamiento multi-paso ni otras capacidades de agente; es un modelo estrictamente de TTS.

## Casos de uso

- Lectura de textos en malayo en aplicaciones web offline: el modelo se carga como un único ONNX de 8,46 MB y se ejecuta en la pestaña del navegador vía WebGPU o WASM, de modo que el texto del usuario nunca sale del dispositivo. Adecuado para herramientas de accesibilidad o lectores de artículos.
- Asistentes de voz para atención al cliente en malayo: con un CER mediano del 5,3 % en el conjunto de estilo call-centre (citas, facturas, entregas), el modelo es apto para generar respuestas habladas en flujos de IVR o chatbots telefónicos donde la inteligibilidad prima sobre la naturalidad tímbrica.
- Anuncios y avisos automatizados con cifras: la categoría de números y dinero alcanza un CER mediano del 0,8 %, lo que lo hace utilizable para leer importes, fechas y horarios normalizados por reglas en sistemas de facturación o recordatorios.
- Prototipado rápido de interfaces de voz en entornos con recursos limitados: al correr en un solo hilo de CPU a unas 25 veces tiempo real, puede integrarse en Raspberry Pi, contenedores pequeños o funciones serverless sin GPU.
- Pruebas de regresión y evaluación de pipelines de TTS: su tamaño reducido y su API simple (texto a array de audio) permiten incluirlo en tests automatizados de calidad de audio o en la validación de front-ends G2P para malayo.
- Generación de audio para contenido educativo o divulgativo en malayo: para frases cortas, donde el modelo obtiene un CER mediano del 0 % en el conjunto de prueba, resulta adecuado para locuciones breves de cursos, flashcards o avisos.
- Demos interactivas en el navegador sin backend: el Space web de Suarify demuestra que puede desplegarse como aplicación estática con selección de versión, útil para mostrar capacidades de TTS sin infraestructura de servidor.

## Benchmarks y rendimiento

La calidad se midió haciendo escuchar la salida del modelo a Whisper large-v3 y comparando la transcripción con el texto original (character error rate, CER; menor es mejor). El propio reconocedor comete alrededor de un 9 % de errores sobre los clips de entrenamiento, por lo que ninguna puntuación llega a 0; el autor considera ruido las diferencias inferiores a 2 puntos. Resultados sobre 200 frases de test no vistas (mediana / media acotada):

| Categoría | n | v0.2 | v0.3 |
|---|---|---|---|
| Texto general (estilo Wikipedia, nombres, lugares) | 70 | 11,8 % / 14,7 % | 7,0 % / 10,0 % |
| Estilo call-centre (citas, facturas, entregas) | 60 | 5,6 % / 6,3 % | 5,3 % / 7,1 % |
| Números y dinero | 30 | 5,0 % / 8,3 % | 0,8 % / 6,3 % |
| Malayo con palabras inglesas | 20 | 21,2 % / 23,0 % | 22,5 % / 24,6 % |
| Preguntas | 10 | 0 % / 3,0 % | 0 % / 2,7 % |
| Frases cortas | 10 | 7,3 % / 14,3 % | 0 % / 10,4 % |
| Total | 200 | 7,5 % / 11,4 % | 6,2 % / 9,7 % |

En un conjunto separado de 60 frases retenidas (distintas pero de estilo similar) la mediana es del 5,3 %. El autor advierte que las frases retenidas provienen del mismo pool de prompts que las de entrenamiento, por lo que texto libre externo será más difícil que estas cifras.

Rendimiento de inferencia declarado: aproximadamente 25 veces tiempo real en un solo hilo de CPU con onnxruntime; aproximadamente 15 veces en una pestaña de navegador con WebGPU (6 veces en la primera llamada).

## Requisitos de hardware

- VRAM estimada: no aplica en la práctica; el archivo ONNX pesa 8,46 MB y puede ejecutarse en CPU. En GPU, la huella es mínima (del orden de decenas de MB incluyendo buffers de runtime).
- GPU recomendadas: cualquiera compatible con WebGPU para la ejecución en navegador; no se especifican modelos concretos (A100, H100, RTX 4090) porque el modelo no los necesita.
- Cabe en cualquier GPU de consumo y en iGPU; también funciona sin GPU.
- Opciones de despliegue: onnxruntime en Python (un solo hilo de CPU), transformers.js 3.x en navegador o Node (WebGPU o WASM), y Gradio mediante `examples/gradio_app.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: ~25x tiempo real en CPU de un hilo; ~15x en navegador con WebGPU (6x en la primera llamada).
- Almacenamiento: el wheel de Python `suaradee-0.3.0-py3-none-any.whl` más el ONNX; el repositorio figura como 0.0 GB en Hugging Face.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| Suaradee v0.3 | 7,9 M | hasta 402 fonemas | Malayo (+ inglés limitado) | Apache 2.0 | ONNX, CPU o navegador |
| Paradee-8M-v1.3 (modelo base) | ~8 M | no disponible | no disponible | no disponible | no disponible |
| v0.2 de Suaradee (versión previa) | 7,9 M | hasta 402 fonemas | Malayo (+ inglés limitado) | Apache 2.0 | ONNX, CPU o navegador |

No se dispone en la información proporcionada de datos sobre otros modelos de TTS en malayo comparables (parámetros, contexto, rendimiento o licencia), por lo que la comparativa con alternativas externas se indica como no disponible.

## Limitaciones y advertencias

- Sonido apagado ("muffled") heredado de v0.1/v0.2: el audio tiene aproximadamente un 30 % menos de energía por encima de 4 kHz que el habla de entrenamiento y los armónicos superiores están difuminados. El autor probó una reparación sin reentrenamiento y la rechazó porque el sonido publicado fue preferido 8 de cada 8 veces.
- Las palabras inglesas son el punto débil: las frases que mezclan malayo e inglés puntúan alrededor del 22 % de CER, y solo se manejan palabras inglesas incluidas en una lista de unas 430.
- El texto general (estilo Wikipedia, nombres propios, topónimos) presenta alrededor de un 7 % de error mediano.
- Una única voz femenina sintética, sin control de emoción ni de estilo.
- Diseñado para frases cortas: el texto largo se fragmenta en límites de frase y en trozos de como máximo 400 fonemas, lo que puede introducir discontinuidades en la prosodia.
- Los números, importes, fechas, horas y teléfonos se leen mediante un normalizador basado en reglas, con la consiguiente rigidez ante formatos no previstos.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas o artefactos en texto fuera de distribución; las métricas del autor se obtuvieron sobre prompts del mismo pool que el entrenamiento.
- Es habla sintética: el autor pide indicarlo explícitamente cuando se utilice.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene conservar los avisos de licencia y verificar las condiciones del modelo base Paradee-8M-v1.3, cuya licencia no se detalla en la información disponible.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suarify/suaradee-v0.3
- Versión anterior v0.2: https://huggingface.co/Suarify/suaradee-v0.2
- Modelo base Paradee-8M-v1.3: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Demo web en el navegador (Space): https://huggingface.co/spaces/Suarify/suaradee-web
- Wheel de Python: https://huggingface.co/Suarify/suaradee-v0.3/resolve/main/dist/suaradee-0.3.0-py3-none-any.whl
- Archivo ONNX cuantizado: https://huggingface.co/Suarify/suaradee-v0.3/blob/main/onnx/model_quantized.onnx
- Ejemplos y app Gradio: carpeta `examples/` del repositorio del modelo
