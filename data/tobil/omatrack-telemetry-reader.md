# tobil/omatrack-telemetry-reader

## Resumen

El modelo `tobil/omatrack-telemetry-reader` es un lector de indicadores de telemetría de carreras desarrollado por tobil para extraer cuatro campos visuales de un HUD AiM naranja en resolución 1920×1080. No es un modelo de lenguaje, sino una red neuronal de visión por computadora exportada a ONNX, diseñada para funcionar como componente de un sistema de análisis de telemetría por imagen. Su propósito es obtener datos de marcha, contador de stint/vuelta y barras de freno y acelerador a partir de vídeos onboard cuando no se dispone de telemetría nativa.

La arquitectura se basa en un backbone MobileNetV3-Small parcial, del que se conservan el stem y las capas tempranas stride-8, junto con un codificador espacial de crops y cabezas de predicción para logits de dígitos, relleno visible y conteo de dígitos. El modelo final tiene 551.783 parámetros y un tamaño de 2.213.746 bytes en formato ONNX (opset 17, float32). Está pensado para ejecutarse en CPU, sin necesidad de GPU, y se integra con la aplicación Omatrack a partir de la versión 1.8.2.

La relevancia del modelo radica en su enfoque conservador: no inventa valores cuando no puede leer un campo con confianza, sino que devuelve observaciones desconocidas (`null`) con razones explícitas. Esto lo hace adecuado para pipelines de análisis de vídeo donde la incertidumbre debe gestionarse de forma transparente y donde la telemetría nativa tiene prioridad sobre la derivada de imagen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone MobileNetV3-Small parcial (stem y capas stride-8) + codificador espacial de crops + cabezas de predicción (dígitos, relleno, conteo) |
| Parametros totales | 551.783 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | float32 (ONNX); no se ofrecen cuantizaciones adicionales |
| Idiomas soportados | No disponible (OCR de dígitos, sin declaración de idiomas) |
| Licencia | Apache-2.0 (upstream) y MIT (código de Omatrack) |
| Formato de pesos | ONNX (`gauge-reader.onnx`, opset 17) |

## Arquitectura y entrenamiento

El modelo es una red neuronal densa de visión por computadora, no un transformer ni un modelo de lenguaje. Retiene únicamente el stem y las capas tempranas stride-8 del backbone `timm/mobilenetv3_small_100.lamb_in1k` de MobileNetV3-Small, y añade un codificador espacial que procesa cuatro crops de imagen preparados, no un frame completo. Las salidas del grafo ONNX son logits de dígitos, predicciones de relleno visible y conteo de dígitos. El sistema completo incluye además un decodificador CTC con restricción de conteo y máscaras de desconocido, que son componentes de comportamiento en tiempo de ejecución y no salidas adicionales del modelo neuronal.

No se han publicado en la información disponible los datos de entrenamiento, el número de tokens (al no ser un modelo de texto), ni la composición del dataset. Tampoco se menciona si se utilizó RLHF, DPO o cualquier técnica de alineamiento. El README indica que la inferencia no requiere PyTorch, timm, el checkout de entrenamiento ni un archivo `.pt`. El modelo se distribuye como un artefacto ONNX fijo, con un contrato de lector denominado `omatrack-crop-count-v1` y un SHA256 documentado para verificar su integridad.

## Capacidades

- Lectura de cuatro campos de un HUD AiM naranja en 1920×1080: `gear`, `stint_lap`, `brake_fill_pct` y `throttle_fill_pct`.
- Acepta exactamente cuatro crops preprocesados como entrada, no un frame completo ni un vídeo.
- Devuelve observaciones con máscaras de `known` y `unknown_reason` para cada campo; los valores desconocidos son `null`, nunca un cero inventado.
- Distingue entre un cero numérico conocido y un valor no observado.
- Soporta inferencia en CPU mediante ONNX Runtime, con un script de ejemplo (`read_frame.py`) que verifica el hash y el contrato del grafo.
- Integración con Omatrack 1.8.2 o superior a través de Preferencias → Image telemetry, donde el descargador gestionado verifica manifest, hash y compatibilidad.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, generación de texto ni capacidades multimodales más allá de la lectura de los cuatro campos especificados.

## Casos de uso

- Análisis de vídeos onboard en carreras: extraer la marcha mostrada y el contador de stint/vuelta de un vídeo grabado con un HUD AiM, cuando la telemetría nativa no está disponible o es incompleta.
- Post-proceso de sesiones de entrenamiento: usar las barras de freno y acelerador como referencia visual para reconstruir el uso de pedales, con la advertencia de que no representan presión física calibrada.
- Verificación cruzada de telemetría: comparar las lecturas derivadas de imagen con los datos nativos registrados para detectar discrepancias o fallos de sincronización.
- Investigación de rendimiento en simuladores o vehículos sin acceso a CAN: obtener señales de HUD para análisis de delta, siempre que el layout del HUD coincida con el revisado.
- Automatización de análisis por lotes: integrar el modelo en un pipeline con ONNX Runtime en CPU para procesar múltiples vídeos o fotogramas sin necesidad de GPU.
- Auditoría forense de registros de telemetría: utilizar las lecturas de imagen como evidencia independiente en la revisión de eventos de carrera, respetando las máscaras de incertidumbre.
- Desarrollo de herramientas de análisis para simracing: alimentar aplicaciones de telemetría con datos derivados de vídeo cuando el juego no exporta telemetría nativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README no incluye métricas de precisión, exactitud, F1 ni comparaciones con otros modelos. La única información de rendimiento es que el script de ejemplo imprime `latency_ms` en la salida, pero no se proporcionan valores de referencia. No se deben asumir números concretos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: 0 MB; el modelo está diseñado para inferencia en CPU.
- GPU recomendadas: ninguna; una CPU moderna (x86-64 o ARM) es suficiente para ejecutar el modelo ONNX.
- Cabe en hardware de consumo, incluidos ordenadores portátiles, mini-PC y placas tipo Raspberry Pi.
- Opciones de despliegue: ONNX Runtime en Python mediante el script `read_frame.py`, integración en la aplicación Omatrack, o carga directa del archivo `gauge-reader.onnx` con cualquier runtime compatible con ONNX opset 17.
- Latencia y throughput: no disponibles; se recomienda medir con el `latency_ms` reportado por el script en el hardware objetivo.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables para la tarea específica de lectura de HUD de telemetría de carreras con cuatro crops predefinidos. El backbone original `timm/mobilenetv3_small_100.lamb_in1k` tiene más parámetros y una tarea distinta (clasificación ImageNet), por lo que no es una alternativa equivalente.

## Limitaciones y advertencias

- No es un detector de HUD arbitrario; solo funciona con el layout revisado (AiM naranja, 1920×1080). Otros layouts, colores o resoluciones no son soportados.
- Requiere cuatro crops preprocesados y una preparación específica de la imagen. No se deben redimensionar, recortar, voltear ni aplicar rotación EXIF para adaptar un frame distinto.
- Las predicciones de barra de freno y acelerador representan el relleno visible del HUD, no la presión física, la fuerza del pedal ni un canal calibrado.
- Las lecturas de marcha y contador de vuelta son lo que se muestra en pantalla, no clasificaciones de vueltas, cruces de línea, posición de carrera ni tiempos de vuelta.
- Los valores desconocidos se devuelven como `null`; un cero numérico puede ser conocido, por lo que no debe interpretarse `null` como cero.
- En pipelines de vídeo, no sustituir el PTS de presentación real por `time-pos`, un ordinal o una aritmética de FPS nominal.
- La telemetría nativa siempre tiene prioridad; el modelo de imagen es un fallback conservador y no debe usarse como fuente autoritativa si existen datos nativos.
- No se han publicado estudios de sesgos, robustez ante iluminación variable, oclusiones o condiciones meteorológicas adversas.
- La licencia es doble: revisar los archivos `LICENSE-APACHE-2.0-UPSTREAM.txt` y `LICENSE-MIT-OMATRACK-CODE.txt` para entender las restricciones de cada componente.
- No es un modelo de lenguaje, por lo que no soporta generación de texto, tool calling ni ningún tipo de razonamiento lingüístico.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tobil/omatrack-telemetry-reader
- Repositorio de Omatrack en GitHub: https://github.com/tobi/omatrack
- Modelo base: https://huggingface.co/timm/mobilenetv3_small_100.lamb_in1k
