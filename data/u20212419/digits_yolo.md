# U20212419/digits_yolo

## Resumen

El modelo `U20212419/digits_yolo` es un detector de dígitos basado en la arquitectura Ultralytics YOLOv8n, ajustado finamente sobre un dataset propio del autor (disponible en Hugging Face como `U20212419/digits`) y entrenado a partir de los pesos preentrenados de YOLOv8n sobre el conjunto de datos SVHN (Street View House Numbers). Su propósito es la detección y clasificación de dígitos individuales en imágenes, una tarea fundamental en aplicaciones de reconocimiento óptico de caracteres (OCR) y visión por computador.

El modelo se publica bajo licencia AGPL-3.0 y su repositorio en Hugging Face no incluye pesos ni archivos de modelo (tamaño 0.0 GB), por lo que la información disponible es limitada. A pesar de ello, su relevancia radica en ofrecer una solución ligera y de código abierto para la detección de dígitos, aprovechando la eficiencia de YOLOv8n, que es una de las variantes más pequeñas de la familia YOLOv8, diseñada para funcionar en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (Ultralytics) |
| Parametros totales | no disponible (YOLOv8n tiene aproximadamente 3.2 millones, pero no se confirma para este ajuste) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (repositorio vacio) |

## Arquitectura y entrenamiento

El modelo se basa en YOLOv8n, la variante nano de la familia YOLOv8 desarrollada por Ultralytics. YOLOv8 es un detector de objetos de una sola etapa (one-stage) que utiliza una red troncal (backbone) basada en CSPDarknet, un cuello (neck) con estructura PAN-FPN y una cabeza de detección acoplada (coupled head) que predice cajas y clases simultáneamente. La versión nano está optimizada para latencia baja y uso en dispositivos edge, con un número reducido de parámetros (alrededor de 3.2 millones en la versión original, aunque no se confirma el valor exacto para este ajuste).

El entrenamiento se realizó mediante fine-tuning sobre el dataset `U20212419/digits`, que no está documentado en detalle. El modelo base fue preentrenado en SVHN, un conjunto de datos de dígitos extraídos de imágenes de números de casas en Google Street View, compuesto por más de 600.000 dígitos etiquetados. No se especifica el número de épocas, el tamaño de lote, la resolución de entrada ni si se aplicaron técnicas de aumento de datos. Tampoco se indica si se utilizó algún esquema de regularización o cuantización posterior.

## Capacidades

- Detección de dígitos individuales (0-9) en imágenes, devolviendo cajas delimitadoras y etiquetas de clase.
- Clasificación de dígitos dentro de las cajas detectadas, basada en el aprendizaje transferido de SVHN.
- Inferencia en tiempo real gracias a la arquitectura YOLOv8n, adecuada para aplicaciones con restricciones de latencia.
- Soporte para múltiples dígitos por imagen, ya que YOLOv8 detecta objetos de forma simultánea.
- Capacidad de integración con el ecosistema Ultralytics (Python, ONNX, TensorRT, etc.), aunque no se confirma la exportación a otros formatos en este repositorio.

## Casos de uso

- Reconocimiento de matrículas de vehículos: el modelo puede localizar y leer los dígitos de una matrícula en imágenes capturadas por cámaras de tráfico, siempre que se ajuste a la orientación y escala de los dígitos.
- Lectura de contadores y medidores: en entornos industriales o domésticos, se puede usar para extraer automáticamente los dígitos de contadores de electricidad, agua o gas a partir de fotografías.
- Digitalización de formularios manuscritos: para extraer números de teléfono, códigos postales o cantidades escritas a mano en documentos escaneados, como paso previo a un sistema OCR completo.
- Automatización de cajas de supermercado: detección de precios o códigos numéricos en etiquetas de productos, aunque requeriría un ajuste adicional para el dominio específico.
- Análisis de imágenes de street view: dado que el modelo se entrena sobre SVHN, puede utilizarse para localizar números de casas en imágenes urbanas, útil para sistemas de navegación o mapeo.
- Prototipos de visión por computador en educación: como base para enseñar detección de objetos con YOLO, gracias a su simplicidad y licencia abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como mAP, precisión o recall sobre SVHN o el dataset de ajuste. Tampoco se comparan con otros detectores de dígitos. Se recomienda evaluar el modelo en el dataset de interés antes de usarlo en producción.

## Requisitos de hardware

- Al ser un modelo YOLOv8n, la inferencia puede ejecutarse en CPU con tiempos de procesamiento de decenas de milisegundos por imagen a resolución baja (p. ej., 640x640), aunque no se confirman cifras exactas.
- En GPU, cabe en tarjetas con 2 GB de VRAM o menos, como NVIDIA GTX 1650, RTX 2060 o incluso en hardware integrado (Jetson Nano, Raspberry Pi con acelerador).
- Para entrenamiento o fine-tuning, se recomienda al menos 4 GB de VRAM, aunque el ajuste sobre un dataset pequeño puede realizarse en Google Colab (GPU T4).
- Opciones de despliegue: el ecosistema Ultralytics permite exportar a ONNX, TensorRT, CoreML y TFLite, pero este repositorio no incluye dichos artefactos. Se puede usar el paquete `ultralytics` de Python para cargar y ejecutar el modelo si se dispone de los pesos (no publicados aquí).
- La latencia estimada en GPU moderna (RTX 3090) sería inferior a 5 ms por imagen a 640x640, pero no se dispone de mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| U20212419/digits_yolo | YOLOv8n | ~3.2M (estimado) | N/A (vision) | AGPL-3.0 | Repositorio vacio |
| YOLOv8n original (Ultralytics) | YOLOv8n | 3.2M | N/A | AGPL-3.0 | Pesos disponibles en GitHub |
| Faster R-CNN con ResNet-50 (detectron2) | Two-stage | ~41M | N/A | Apache-2.0 | Pesos en model zoo |
| SSD MobileNetV2 (TensorFlow) | One-stage | ~5M | N/A | Apache-2.0 | Pesos en TF Hub |

La comparativa se basa en arquitecturas genéricas de detección de objetos, ya que no se dispone de otros modelos específicos de dígitos con los que comparar directamente. El modelo `digits_yolo` se distingue por su tamaño reducido y su enfoque en dígitos, pero la falta de pesos publicados limita su utilidad práctica frente a alternativas con pesos descargables.

## Limitaciones y advertencias

- El repositorio de Hugging Face no contiene los pesos del modelo (tamaño 0.0 GB), por lo que no es posible utilizarlo directamente sin contactar al autor o reconstruir el entrenamiento.
- No se documentan los detalles del dataset de fine-tuning (`U20212419/digits`), lo que impide evaluar su calidad, tamaño o posibles sesgos.
- El modelo se entrena sobre SVHN, que contiene dígitos de números de casas en EE. UU.; puede tener un rendimiento deficiente en otros estilos de escritura, fuentes o condiciones de iluminación.
- La licencia AGPL-3.0 implica que cualquier uso en servicios en red debe publicar el código fuente completo, lo que puede ser restrictivo para aplicaciones comerciales propietarias.
- No se proporcionan métricas de rendimiento, por lo que no se puede garantizar su precisión en escenarios reales.
- Al ser un modelo de visión, no soporta tareas de lenguaje natural ni generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/U20212419/digits_yolo
- Dataset de entrenamiento: https://huggingface.co/datasets/U20212419/digits
- Repositorio de Ultralytics YOLOv8: https://github.com/ultralytics/ultralytics
- Paper de SVHN: http://ufldl.stanford.edu/housenumbers/nips2011_housenumbers.pdf
