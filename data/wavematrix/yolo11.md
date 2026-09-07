# WaveMatrix/YOLO11

## Resumen

YOLO11 es un modelo de detección de objetos de una sola etapa desarrollado por Ultralytics, que en esta versión ha sido convertido por WaveMatrix para ejecutarse en la NPU de Axera. La conversión utiliza cuantización w8a16 y una optimización basada en LoRA, lo que permite desplegar el modelo en dispositivos edge de bajo consumo, como los chips AX650 y AX630C. Este modelo resuelve el problema de ejecutar detección de objetos en tiempo real en hardware embebido, reduciendo la latencia a aproximadamente 25 ms en AX650. Su relevancia actual radica en el creciente interés por sistemas de visión artificial en el edge, donde la eficiencia energética y la latencia son factores críticos. El repositorio incluye variantes yolo11s y yolo11x en formato axmodel, junto con los archivos ONNX necesarios para la conversión. La arquitectura es YOLO11, basada en redes neuronales convolucionales, y el tamaño del repositorio es de 0.1 GB.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO11 (detección de objetos de una etapa basada en CNN) |
| Parámetros totales | no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantización | w8a16 |
| Idiomas soportados | en (etiqueta del modelo; no aplica para visión) |
| Licencia | MIT |
| Formato de pesos | axmodel (para NPU Axera), ONNX |

## Arquitectura y entrenamiento

YOLO11 es una arquitectura de detección de objetos de una sola etapa (one-stage) basada en redes neuronales convolucionales, que mejora la eficiencia y la precisión de versiones anteriores como YOLOv8. En esta variante, el modelo original de Ultralytics se ha convertido al formato axmodel para la NPU de Axera mediante una cuantización de pesos a 8 bits y activaciones a 16 bits (w8a16), junto con una optimización basada en LoRA. El proceso de conversión se realiza con la herramienta Pulsar2 en su versión 3.4. No se dispone de información detallada sobre los datos de entrenamiento, el número de tokens o la composición del dataset, ya que estos datos corresponden al modelo base de Ultralytics y no se incluyen en esta conversión.

## Capacidades

- Detección de objetos en imágenes, devolviendo cajas delimitadoras, clases y confianza (por ejemplo, personas y balones en el caso de uso de fútbol).
- Inferencia optimizada para NPU Axera, con soporte para los chips AX650 y AX630C.
- Compatibilidad con el entorno Pulsar2 (versión 3.4) para la conversión de modelos.
- Incluye herramientas de ejecución listas para aarch64 y x86_64 (ax_yolo11 y axcl_yolo11).
- No soporta funciones de lenguaje como tool calling, generación de texto o razonamiento multi-paso, al ser un modelo de visión.
- No ofrece capacidades multilingües en el sentido lingüístico; la etiqueta de idioma "en" hace referencia al modelo base, pero no afecta a la detección de objetos.

## Casos de uso

- Videovigilancia en dispositivos edge: el modelo puede detectar personas y vehículos en tiempo real con una latencia de aproximadamente 25 ms en AX650, lo que permite desplegar cámaras inteligentes sin depender de la nube.
- Control de calidad en fabricación: en líneas de producción, el modelo detecta defectos o anomalías en piezas, gracias a su capacidad de identificar objetos con bounding boxes. Su cuantización w8a16 permite ejecutarlo en módulos NPU de bajo coste.
- Robótica móvil: para navegación autónoma, el modelo puede detectar obstáculos y objetos en el entorno. La baja latencia (25 ms) facilita reacciones rápidas en robots de servicio.
- Análisis deportivo: como se muestra en el ejemplo de la model card, puede detectar jugadores y balones en un partido de fútbol, permitiendo métricas de rendimiento o automatización de clips.
- Smart retail: el modelo puede contar personas en tiendas o detectar productos en estanterías. Su despliegue en NPU de bajo consumo lo hace adecuado para instalaciones con múltiples cámaras.
- Conducción asistida (ADAS): en vehículos, el modelo detecta peatones, vehículos y señales. Al ejecutarse en hardware embebido, reduce el consumo y el coste del sistema.
- Vigilancia con drones: el modelo puede detectar objetivos desde el aire, aprovechando la eficiencia energética para prolongar la autonomía de vuelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica una latencia de inferencia de 25 ms en el chip AX650, y en el ejemplo de ejecución se registran tiempos medios de 24.56 ms y 24.73 ms para el modelo yolo11x, pero no se proporcionan métricas de precisión como mAP.

## Requisitos de hardware

- No requiere VRAM, ya que está diseñado para ejecutarse en NPU, no en GPU.
- Dispositivos compatibles: AX650 (por ejemplo, M4N-Dock o tarjeta aceleradora M.2) y AX630C (por ejemplo, Module-LLM o LLM630 Compute Kit).
- Latencia estimada: 25 ms en AX650 para yolo11x; latencia en AX630C no disponible (TBD).
- Opciones de despliegue: conversión de ONNX a axmodel mediante Pulsar2 3.4; ejecución con los binarios ax_yolo11 o axcl_yolo11.
- No aplica a GPU consumer (RTX 4090, A100, etc.) ni a frameworks como vLLM, llama.cpp u Ollama, al no ser un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos comparativos de rendimiento o características frente a otros modelos de detección de objetos.

## Limitaciones y advertencias

- Modelo específico para la NPU de Axera; no puede ejecutarse directamente en GPU o CPU sin una conversión adicional.
- La cuantización w8a16 puede introducir una pérdida de precisión frente a pesos en coma flotante, aunque la model card no cuantifica esa degradación.
- Solo realiza detección de objetos; no soporta segmentación, clasificación ni estimación de pose, capacidades que sí están presentes en el modelo base Ultralytics/YOLO11.
- Requiere la versión 3.4 de Pulsar2 para la conversión; el uso de otras versiones podría causar incompatibilidades.
- La latencia en AX630C no se ha determinado (TBD), por lo que su rendimiento en ese chip es incierto.
- Riesgo de falsos positivos o detecciones erróneas en escenas complejas, como en cualquier modelo de detección de objetos.
- La licencia MIT del modelo convertido permite uso comercial; para el modelo base Ultralytics/YOLO11 se debe consultar su licencia en su repositorio original.

## Enlaces

- HuggingFace: https://huggingface.co/WaveMatrix/YOLO11
- Repositorio de ejemplo de Axera (ax-samples): https://github.com/AXERA-TECH/ax-samples
- Repositorio de ejemplo de Axera (axcl-samples): https://github.com/AXERA-TECH/axcl-samples
- Documentación de Pulsar2: https://pulsar2-docs.readthedocs.io/en/latest/pulsar2/introduction.html
- Repositorio de Ultralytics YOLO11: https://github.com/ultralytics/yolo11
