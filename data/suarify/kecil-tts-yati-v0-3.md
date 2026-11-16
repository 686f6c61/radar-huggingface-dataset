# Suarify/kecil-tts-yati-v0.3

## Resumen

Kecil-TTS Yati v0.3 es un modelo de síntesis de voz (text-to-speech) en bahasa melayu desarrollado por Suarify. Se trata de un modelo extremadamente compacto: 7,9 millones de parámetros y un único fichero ONNX cuantizado a int8 de 8,46 MB, derivado del modelo base sahilmahendrakar/Paradee-8M-v1.3. Su propuesta de valor es la eficiencia: síntesis a 24 kHz mono que corre en una pestaña de navegador mediante transformers.js (WebGPU o WASM) o en un solo hilo de CPU en Python con onnxruntime, sin necesidad de PyTorch.

La versión v0.3 es una iteración centrada en la precisión, no en la calidad acústica. Mantiene la misma arquitectura que v0.2 pero reentrena el decodificador y la parte textual tras eliminar 120 de los 742 clips de entrenamiento que el reconocedor automático leía mal. El resultado es una mejora de aproximadamente el 15% en la tasa de error a nivel de palabra, especialmente visible en texto general y en la lectura de números y cantidades monetarias.

El modelo está pensado para integrarse en aplicaciones web y entornos con recursos muy limitados, con una latencia muy baja (unas 25 veces más rápido que tiempo real en un hilo de CPU). Su alcance es deliberadamente acotado: una única voz femenina sintética, sin control de emoción ni de estilo, y una ventana de entrada de hasta 402 identificadores de fonema. La licencia Apache 2.0 facilita su uso comercial, aunque la calidad acústica apagada y el manejo deficiente de palabras en inglés son limitaciones documentadas por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTextToSpeech2 (transformers.js), exportada a ONNX; derivada de Paradee-8M-v1.3 |
| Parametros totales | 7,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de hasta 402 identificadores de fonema (`input_ids` int64 `[1,T]`) |
| Tipos de cuantizacion | int8 (fichero `onnx/model_quantized.onnx`, 8,46 MB) |
| Idiomas soportados | Bahasa Melayu (Malasia), con palabras inglesas comunes del habla malasia |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (transformers.js); wheel de Python `suaradee-0.3.0-py3-none-any.whl` |
| Frecuencia de salida | 24 kHz mono |
| Entradas | `input_ids` (int64 `[1,T]`, ids de fonema con 0 en cada extremo) y `speed` (float32 `[1]`) |
| Modelo base | sahilmahendrakar/Paradee-8M-v1.3 |

## Arquitectura y entrenamiento

El modelo es un sistema TTS de dos etapas: un front-end específico de malayo (directorio `js/`) convierte el texto en fonemas, y un modelo StyleTextToSpeech2 carga esos identificadores de fonema para generar audio a 24 kHz. La exportación a ONNX incluye adaptaciones para compatibilidad con WebGPU: el acumulador de fase en float64 se convirtió a float32, los límites de slice de 64 bits se recortaron y se eliminó una inversión de ruido innecesaria, sin alterar el audio resultante. La inferencia no requiere PyTorch en Python, solo onnxruntime y numpy.

El entrenamiento parte del modelo Paradee-8M-v1.3 y se reentrenó con el mismo recetario que v0.2 tras una fase de depuración de datos: los clips de entrenamiento se puntuaron con el mismo reconocedor usado en evaluación y se descartaron los 120 peores de 742 (109 que el reconocedor no podía leer de vuelta y 30 con velocidades de habla inusuales o solapamientos). No se documentan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Síntesis de voz a partir de texto en bahasa melayu, con salida de audio mono a 24 kHz.
- Manejo de números, cantidades monetarias, fechas, horas y números de teléfono mediante un normalizador basado en reglas que los lee en malayo.
- Procesamiento de palabras inglesas comunes: aproximadamente 430 palabras frecuentes del habla malasia.
- Segmentación automática de texto largo: el texto se divide en finales de frase y se envía en trozos de como máximo 400 fonemas.
- Ejecución en navegador mediante transformers.js 3.x con WebGPU o WASM, y en Python con onnxruntime en un solo hilo de CPU.
- Control de velocidad mediante la entrada `speed` (float32).
- No dispone de control de emoción, estilo ni de selección de voz: una única voz femenina sintética.
- No es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento multi-step ni generación de texto.

## Casos de uso

- Lectura por voz en aplicaciones web sin backend: el modelo se ejecuta íntegramente en la pestaña del navegador vía WebGPU o WASM, de modo que el texto del usuario no sale de su dispositivo. Adecuado para lectores de artículos, accesibilidad o asistentes locales en malayo.
- Sistemas de respuesta vocal interactiva (IVR) para el mercado malasio: las categorías de estilo call-centre (citas, facturas, entregas) obtienen una CER mediana del 5,3%, y la latencia de unas 25 veces tiempo real en un hilo de CPU permite generar respuestas cortas casi al instante en hardware modesto.
- Anuncios y avisos de voz en kioscos o señalización digital: el modelo cabe en 8,46 MB y puede desplegarse en dispositivos embebidos o navegadores sin GPU dedicada, generando locuciones de frases cortas con una CER mediana del 0% en la categoría de frases cortas.
- Prototipado rápido de interfaces de voz: la wheel de Python y los ejemplos de Gradio permiten integrar TTS en un script de pocas líneas sin instalar PyTorch, útil para pruebas de concepto y demos internas.
- Generación de audio para contenido educativo o de divulgación en malayo: la lectura de números y cantidades monetarias tiene una CER mediana del 0,8%, lo que la hace apta para materiales con cifras, precios y fechas.
- Pruebas de accesibilidad en aplicaciones web malayas: al ejecutarse en el cliente, permite ofrecer síntesis de voz en navegadores sin depender de servicios cloud y sin coste por petición, con la advertencia de que la calidad acústica es apagada.

## Benchmarks y rendimiento

La evaluación se realizó reproduciendo el audio del modelo a Whisper large-v3 y comparando la transcripción con el texto original (tasa de error de caracteres, CER; menor es mejor). El propio reconocedor comete errores en aproximadamente el 9% de los caracteres de los clips de entrenamiento, por lo que ninguna puntuación es 0. El autor indica que diferencias inferiores a unos 2 puntos son ruido entre ejecuciones.

| Categoria | n | v0.2 (mediana / media acotada) | v0.3 (mediana / media acotada) |
|---|---|---|---|
| Texto general (estilo Wikipedia, nombres, lugares) | 70 | 11,8% / 14,7% | 7,0% / 10,0% |
| Estilo call-centre (citas, facturas, entregas) | 60 | 5,6% / 6,3% | 5,3% / 7,1% |
| Números y dinero | 30 | 5,0% / 8,3% | 0,8% / 6,3% |
| Malayo con palabras inglesas | 20 | 21,2% / 23,0% | 22,5% / 24,6% |
| Preguntas | 10 | 0% / 3,0% | 0% / 2,7% |
| Frases cortas | 10 | 7,3% / 14,3% | 0% / 10,4% |
| **Global** | **200** | **7,5% / 11,4%** | **6,2% / 9,7%** |

En el conjunto separado de 60 frases retenidas (distintas frases, estilo similar), la mediana es del 5,3%. El autor advierte que las frases retenidas provienen del mismo conjunto de prompts que las de entrenamiento, por lo que texto libre de otras fuentes será más difícil que estas cifras.

Rendimiento de inferencia declarado:

| Métrica | Valor |
|---|---|
| Velocidad en CPU (onnxruntime, un hilo) | ~25x tiempo real |
| Velocidad en navegador con WebGPU | ~15x tiempo real (6x en la primera llamada) |
| Tamaño del fichero ONNX int8 | 8,46 MB |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo pesa 8,46 MB en int8 y puede ejecutarse en CPU o en el navegador con WebGPU. No se dispone de cifras de VRAM específicas en la información proporcionada.
- GPU recomendadas: no se especifican modelos concretos; el autor indica ejecución en WebGPU del navegador y en un solo hilo de CPU. Cualquier GPU con soporte WebGPU puede acelerar la inferencia en navegador.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU dedicada: el tamaño del modelo (8,46 MB) lo permite.
- Opciones de despliegue: onnxruntime en Python (con numpy), transformers.js 3.x en navegador o Node (WebGPU o WASM), y una demo Gradio mediante `examples/gradio_app.py`.
- Latencia y throughput estimados: aproximadamente 25 veces tiempo real en un hilo de CPU con onnxruntime; aproximadamente 15 veces tiempo real en una pestaña de navegador con WebGPU (6 veces en la primera llamada).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. La comparación más directa disponible es con las versiones anteriores del mismo modelo:

| Modelo | Parámetros | Formato | CER global (mediana / media acotada) | Licencia |
|---|---|---|---|---|
| Kecil-TTS Yati v0.3 | 7,9 M | ONNX int8 (8,46 MB) | 6,2% / 9,7% | Apache 2.0 |
| Kecil-TTS Yati v0.2 | 7,9 M | ONNX int8 | 7,5% / 11,4% | Apache 2.0 |
| Paradee-8M-v1.3 (modelo base) | ~8 M | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sonido apagado: el audio tiene aproximadamente un 30% menos de energía por encima de 4 kHz que el habla de entrenamiento y los armónicos superiores están difuminados (cualidad "damp" o ligeramente faseada). El autor atribuye la causa al entrenamiento del decodificador y señala que una reparación sin reentrenamiento fue rechazada porque el sonido enviado se prefirió 8 veces de 8.
- Punto débil en palabras inglesas: las frases que mezclan malayo e inglés obtienen alrededor del 22% de CER, y las palabras inglesas solo se manejan si están en una lista de unas 430 palabras comunes.
- Texto general con aproximadamente un 7% de error mediano: nombres propios y topónimos de estilo Wikipedia siguen siendo un punto débil.
- Una única voz femenina sintética, sin control de emoción ni de estilo.
- Diseñado para frases cortas: el texto largo se divide en finales de frase y se envía en piezas de como máximo 400 fonemas.
- Sesgos conocidos: no se documentan en la información disponible más allá de las limitaciones de cobertura léxica y de idioma.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el modelo puede producir pronunciaciones incorrectas en palabras fuera de su vocabulario o en texto mixto malayo-inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial; el autor solicita que se indique que la voz es sintética.
- Caveat para producción: las cifras de evaluación provienen de frases del mismo conjunto de prompts que el entrenamiento, por lo que el rendimiento en texto libre será peor que el reportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suarify/kecil-tts-yati-v0.3
- Versión anterior v0.2: https://huggingface.co/Suarify/kecil-tts-yati-v0.2
- Demo web en el navegador (Space): https://huggingface.co/spaces/Suarify/suaradee-web
- Modelo base: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Wheel de Python: https://huggingface.co/Suarify/kecil-tts-yati-v0.3/resolve/main/dist/suaradee-0.3.0-py3-none-any.whl
