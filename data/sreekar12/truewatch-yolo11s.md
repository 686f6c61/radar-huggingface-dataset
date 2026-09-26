# sreekar12/truewatch-yolo11s

## Resumen

TRUEWATCH detector (final) es un detector de objetos exportado a ONNX por el usuario sreekar12 para el canal de apariencia de la pila de vigilancia fronteriza TRUEWATCH. Se trata de un ajuste fino de la variante pequeña de YOLO11 (YOLO11-s) de Ultralytics, una red convolucional de detección en una sola etapa, convertida a ONNX opset 17 en FP32 mediante el script `export_onnx.py` del repositorio fuente. El modelo resuelve un problema acotado: localizar y clasificar cinco categorías de interés para vigilancia de fronteras y tráfico (persona, vehículo de dos ruedas, coche, camión y carro).

El repositorio no publica cifras de precisión. La propia model card remite a `METRICS.md` en el repositorio de GitHub para los resultados medidos, con su split y el host de medición. Tampoco se declaran parámetros, idiomas soportados ni variantes cuantizadas, y el tamaño del repositorio figura como 0,0 GB, por lo que conviene verificar que el archivo `final.onnx` está efectivamente disponible antes de integrarlo.

Su relevancia es práctica más que de investigación: es un artefacto de despliegue (ONNX, entrada fija de 640×640, eje de batch dinámico) pensado para incrustarse en una pila de videovigilancia existente, con la advertencia de que la licencia AGPL-3.0 heredada de Ultralytics condiciona fuertemente su uso en servicios accesibles por red.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red convolucional de detección en una sola etapa (single-stage), familia YOLO11 de Ultralytics, variante "s" (small), exportada a ONNX opset 17 |
| Parámetros totales | no disponible (la model card no publica el recuento; corresponde a la variante "s" de YOLO11) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen fija de 640×640 píxeles, sin ventana de contexto textual) |
| Tipos de cuantización | no disponible; el único artefacto documentado es FP32 y no se publican variantes INT8/FP16 |
| Idiomas soportados | no disponible (modelo de detección visual; no se declaran idiomas; el repositorio está etiquetado como region:us) |
| Licencia | AGPL-3.0 (heredada de Ultralytics YOLO11; la sección 13 aplica al uso del modelo a través de red) |
| Formato de pesos | ONNX (`final.onnx`), opset 17, FP32 |
| Entrada | `images`: float32, forma (batch, 3, 640, 640), RGB escalado a 0-1, con letterbox sobre relleno gris 114; eje de batch dinámico, alto y ancho fijos |
| Salida | `output0`: float32, forma (batch, 9, anchors); filas 0-3 son cx, cy, w, h en píxeles de entrada y las 5 restantes son puntuaciones por clase tras sigmoide |
| Clases detectadas | 0: person, 1: two_wheeler, 2: car, 3: truck, 4: cart |
| Post-procesado | No hay NMS dentro del grafo; debe aplicarse externamente |
| Datos de ajuste fino | IDD, LLVIP y KAIST (conjuntos públicos de investigación, no redistribuidos) |
| Tamaño del repositorio | 0,0 GB (según los metadatos de HuggingFace) |
| Hash SHA-256 del archivo | `dd63db0a7b4e5ef6b22687f54953742b6d5012c31b4b6f432656fc7c5f39921b` |
| Hash SHA-256 de los pesos fuente | `9c84ced99b63825061f2d7ae33a10a101acf62e5ff37eb64423c952d96ee9e67` |

## Arquitectura y entrenamiento

El modelo es un detector convolucional de una sola etapa de la familia YOLO11, en su variante "s". La cabeza produce un tensor de forma (batch, 9, anchors): las cuatro primeras filas contienen las coordenadas de caja (centro, ancho y alto en píxeles de la entrada) y las cinco restantes, las puntuaciones por clase ya pasadas por sigmoide. La exportación a ONNX opset 17 en FP32 mantiene el eje de batch dinámico y fija alto y ancho en 640×640, con preprocesado de letterbox sobre relleno gris de valor 114. El grafo no incluye supresión de no máximos (NMS), de modo que cualquier consumidor debe aplicarla por su cuenta. Los nombres de clase y el tamaño de entrada van embebidos en el archivo como `metadata_props` de ONNX, lo que permite leerlos sin documentación externa.

No se detallan en la model card el número de tokens o imágenes de entrenamiento, la composición exacta del dataset, el régimen de aumento de datos, la resolución de entrenamiento ni el número de épocas. Se indica únicamente que los pesos proceden de un ajuste fino de YOLO11-s sobre tres conjuntos públicos de investigación (IDD, LLVIP y KAIST) y que los datos no se redistribuyen. Técnicas como RLHF o DPO no aplican a un detector de objetos. La model card tampoco documenta innovaciones adicionales (atención lineal, decodificación especulativa u otras), más allá de la exportación a ONNX y la trazabilidad mediante hashes SHA-256.

## Capacidades

- Detección de objetos en una sola pasada sobre cinco clases cerradas: persona, vehículo de dos ruedas, coche, camión y carro.
- Salida estructurada y directamente consumible: cajas en píxeles de entrada más puntuaciones por clase, sin NMS embebida, lo que permite al integrador elegir su propio umbral de confianza y su algoritmo de supresión.
- Procesamiento por lotes de imágenes o fotogramas gracias al eje de batch dinámico, con resolución de entrada fija de 640×640.
- Metadatos integrados: nombres de clase y tamaño de entrada embebidos como `metadata_props` de ONNX.
- Ejecución portable mediante cualquier runtime compatible con ONNX opset 17 (ONNX Runtime, TensorRT, OpenCV DNN, entre otros).
- Orientado a fotogramas RGB de vídeo procedentes de cámaras o streams, no a imágenes térmicas de forma declarada en la tarjeta.
- No implementa generación de texto, razonamiento, código, matemáticas, tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües ni ningún modo de pensamiento. Es exclusivamente un detector visual.

## Casos de uso

- Vigilancia perimetral y control fronterizo: es el caso de uso declarado por el autor; el modelo actúa como canal de apariencia de la pila TRUEWATCH, detectando peatones, vehículos y carros en fotogramas de cámara y entregando cajas con clase para que la capa de seguimiento o de reglas decida alertas.
- Analítica de tráfico y conteo vehicular: la separación explícita entre `car`, `truck` y `two_wheeler` permite clasificar el flujo por tipo de vehículo y agregar conteos por carril o por franja horaria sin necesidad de un segundo modelo.
- Control de accesos en recintos industriales o logísticos: la clase `cart` resulta útil para detectar carros de carga o carretillas en muelles y almacenes, mientras que `person` y `truck` cubren la operativa de personal y vehículos pesados.
- Integración en plataformas de videovigilancia IP: al ser ONNX opset 17 en FP32, puede cargarse en ONNX Runtime o TensorRT y desplegarse junto a un decodificador RTSP, aprovechando el batch dinámico para atender varios canales desde una misma GPU.
- Automatización de revisiones en cámara de circuito cerrado (CCTV): procesado por lotes de grabaciones para etiquetar y filtrar segmentos con presencia de personas o vehículos, reduciendo el tiempo de revisión manual.
- Investigación aplicada en visión por computador: el modelo sirve como línea base reproducible (con hashes publicados) para comparar estrategias de preprocesado, letterbox, umbrales de confianza y algoritmos de NMS sobre las cinco clases.
- Despliegue en el borde (edge): su tamaño reducido y su formato ONNX permiten compilarlo a TensorRT o ejecutarlo en aceleradores de baja potencia para cámaras inteligentes y dispositivos tipo Jetson.
- Prototipado rápido en el navegador o en el escritorio: mediante ONNX Runtime Web o DirectML puede ejecutarse localmente sin servicio de inferencia dedicado, útil para demos y validación de la interfaz de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no incluye cifras de precisión y remite a `METRICS.md` en el repositorio de origen para los resultados medidos, con su split y el host de medición. No se dispone de valores de mAP, precisión, recall, latencia ni throughput verificables para este artefacto.

## Requisitos de hardware

- VRAM estimada: no publicada. A modo orientativo, un detector de escala "s" con entrada FP32 de 640×640 y batch 1 suele requerir del orden de 1 a 2 GB de VRAM entre pesos y activaciones; con lotes grandes la memoria crece de forma aproximadamente lineal con el batch. Estas cifras son estimaciones, no medidas del autor.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente. Para producción con varios streams, resultan adecuadas NVIDIA T4, L4, RTX 3060/4060/4090, A10, A100 o H100, aunque las gamas altas quedan sobredimensionadas para este tamaño de modelo.
- Compatibilidad con GPU de consumo: sí. Debería ejecutarse sin problemas en tarjetas de gama media y baja con soporte ONNX/CUDA o DirectML, incluidas RTX 3050, RTX 4060 y similares.
- Aceleradores de borde: Jetson Orin y Jetson Nano, así como NPU integradas en cámaras inteligentes, previa compilación del grafo ONNX al runtime correspondiente.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), NVIDIA TensorRT, OpenCV DNN, NVIDIA Triton Inference Server y NVIDIA DeepStream para pipelines de vídeo. Los servidores orientados a modelos de lenguaje (vLLM, TGI, llama.cpp, Ollama) no son aplicables a este artefacto.
- Latencia y throughput: no disponibles. No se han publicado mediciones. Tenga en cuenta que el coste de aplicar NMS fuera del grafo se suma al tiempo de inferencia.

## Comparativa con modelos similares

Los datos de los modelos alternativos no forman parte de la información proporcionada; se listan únicamente como referencia de categoría y deben verificarse en sus repositorios oficiales.

| Modelo | Tarea y clases | Parámetros | Entrada | Métricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TRUEWATCH YOLO11-s (este modelo) | Detección de 5 clases (person, two_wheeler, car, truck, cart) | no disponible | 640×640, batch dinámico | No en la model card; remite a METRICS.md | AGPL-3.0 | HuggingFace, ONNX FP32 |
| Ultralytics YOLO11-s (modelo base) | Detección genérica, 80 clases COCO | no disponible en esta información | 640×640 | no disponible | AGPL-3.0 | Repositorio de Ultralytics |
| YOLOv8-s | Detección genérica, 80 clases COCO | no disponible | 640×640 | no disponible | AGPL-3.0 (familia Ultralytics) | Repositorio de Ultralytics |
| Detectores end-to-end sin NMS (por ejemplo, familia RT-DETR) | Detección genérica | no disponible | resolución variable | no disponible | no disponible en esta información | Repositorios de referencia |

La diferencia funcional relevante frente a los detectores genéricos es la especialización en cinco clases de interés para vigilancia y tráfico, a cambio de perder el vocabulario completo de COCO. Frente a los detectores end-to-end, la ausencia de NMS en el grafo traslada esa responsabilidad al integrador.

## Limitaciones y advertencias

- Ausencia total de métricas en la model card: no hay mAP, precisión, recall ni latencia. No debe desplegarse en producción sin medir antes el rendimiento en el dominio objetivo; la referencia `METRICS.md` no se incluye en el repositorio de HuggingFace.
- Vocabulario cerrado de cinco clases: cualquier objeto distinto de persona, vehículo de dos ruedas, coche, camión o carro no se reconocerá correctamente, y las clases semánticamente próximas (por ejemplo `car` frente a `truck` o `cart`) pueden confundirse en escenas ambiguas.
- Sin NMS dentro del grafo: si no se aplica supresión de no máximos en el post-procesado, se obtendrán detecciones duplicadas y conteos inflados.
- Entrada rígida de 640×640 con letterbox sobre gris 114: alimentar el modelo con otro preprocesado degrada los resultados. Los objetos muy pequeños en escenas lejanas pueden perderse por el reescalado.
- Licencia AGPL-3.0 heredada de Ultralytics: la sección 13 exige que, si el modelo o una versión modificada se ofrece a usuarios a través de una red, se les ofrezca el código fuente correspondiente del servicio. Esto condiciona seriamente el uso comercial en modalidad cerrada o SaaS sin liberar el código.
- Los conjuntos de entrenamiento (IDD, LLVIP y KAIST) tienen sus propios términos de uso, no se redistribuyen aquí y emplear este modelo no concede derecho alguno sobre ellos. IDD procede de escenarios de conducción en India y LLVIP y KAIST incorporan captura multiespectral (visible/térmica) de peatones en la literatura pública; conviene verificar la composición modal real y el posible sesgo geográfico y de dominio heredado.
- Riesgo de falsos positivos y falsos negativos: no aplica el concepto de alucinación generativa, pero sí el de detecciones espurias o ausentes en dominios distintos al de entrenamiento (por ejemplo, imagen térmica pura, nocturno extremo o condiciones meteorológicas adversas).
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide el artefacto. Verifique la integridad del archivo descargado contra el SHA-256 `dd63db0a7b4e5ef6b22687f54953742b6d5012c31b4b6f432656fc7c5f39921b`.
- Tamaño de repositorio declarado de 0,0 GB: compruebe que el peso `final.onnx` está realmente alojado y es descargable antes de integrarlo en un pipeline.
- Incoherencia en los metadatos de HuggingFace: las fechas de creación y actualización (26/09/2026) son futuras, lo que sugiere un error de registro.
- Este modelo no ofrece texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es sustituible por un modelo de lenguaje para tareas conversacionales o de generación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sreekar12/truewatch-yolo11s
- Repositorio fuente TRUEWATCH (código de entrenamiento, exportación y servicio): https://github.com/0XSreekar/True-Watch-AI
- Métricas medidas (referenciadas por la model card): https://github.com/0XSreekar/True-Watch-AI/blob/main/training/results/METRICS.md
- Texto completo de la licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
