# YMmim/object-detection-scratch

## Resumen

YMmim/object-detection-scratch es un repositorio educativo que implementa un detector de objetos Faster R-CNN desde cero con PyTorch, y lo compara con YOLOv8 de Ultralytics como referencia de práctica estándar. El proyecto está diseñado para que desarrolladores e investigadores comprendan los fundamentos internos de un detector de dos etapas (2-stage): generación de propuestas de región, RoI Align y clasificación, en contraste con el enfoque de una sola etapa (1-stage) de YOLO.

El modelo incluye un backbone ResNet50 (hasta layer3, stride 16), una RPN (Region Proposal Network) con 9 anclas por celda, y un RoI Head con RoI Align de 7×7. Los pesos publicados (`frcnn.pth`) se entrenaron únicamente con una época sobre Pascal VOC 2007 (20 clases) con fines de verificación de implementación, no de rendimiento. Es una pieza didáctica relevante para quienes quieren comprender la mecánica de Faster R-CNN sin depender de cajas negras, aunque no es apta para producción.

El proyecto incluye scripts de entrenamiento (`train.py`), inferencia (`infer.py`), utilidades de cajas (`box_utils.py`), y un comparador con YOLOv8 (`yolo_infer.py`). La licencia del código es MIT, pero el uso de YOLOv8 implica la licencia AGPL-3.0 de Ultralytics si se integra en proyectos de código cerrado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN (ResNet50 backbone, RPN, RoI Align, RoI Head) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (detección de objetos, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pth`) |

## Arquitectura y entrenamiento

El modelo implementa Faster R-CNN desde cero en PyTorch. La arquitectura se compone de un backbone ResNet50 truncado en la capa `layer3` (stride 16) que produce el mapa de características, una RPN que genera 9 anclas por celda (3 escalas × 3 relaciones de aspecto) y emite dos salidas por ancla: objetividad (1 logit con BCE) y regresión de cajas. Las propuestas se filtran mediante NMS y se pasan a un RoI Align que extrae características de 7×7 para el RoI Head, compuesto por capas totalmente conectadas en lugar de la capa `layer4` original. El RoI Head realiza clasificación en 20 clases de VOC + fondo y regresión de cajas específica por clase.

El entrenamiento se realizó con batch size fijo de 1, asignación de anclas con IoU ≥ 0.7 para positivos y < 0.3 para negativos en la RPN, y asignación de RoI con IoU ≥ 0.5. La función de pérdida combina clasificación (BCE/CE) y regresión (smooth L1) solo sobre positivos. El conjunto de datos es Pascal VOC 2007, descargado automáticamente mediante torchvision. El modelo publica pesos entrenados con solo 1 época, con el objetivo explícito de validar la correcta implementación del código, no de alcanzar buen rendimiento. Se omiten deliberadamente FPN, batch normalización adicional y otras técnicas del documento original para simplificar el código.

## Capacidades

- Detección de objetos de 20 clases de Pascal VOC (persona, coche, perro, etc.) mediante un pipeline de dos etapas.
- Generación de propuestas de región a través de RPN con anclas múltiples y NMS.
- Extracción de características con RoI Align de 7×7.
- Inferencia básica con umbral de confianza configurable (`--score_thresh`).
- Comparación directa con YOLOv8 en el mismo script (`yolo_infer.py`) para contrastar resultados y filosofía.
- Visualización de cajas delimitadoras sobre imágenes.
- Capacidades multilingües: no aplica (es un modelo de visión, no de texto).
- Tool calling / agentes: no aplica.

## Casos de uso

- Aprendizaje de arquitecturas de detección de objetos: el código es legible y está comentado, ideal para que estudiantes de visión por computador comprendan cómo funciona internamente una RPN, el muestreo de RoI y la pérdida de smooth L1.
- Proyectos académicos de final de grado o máster: sirve como base para implementar variantes (cambiar backbone, añadir FPN, modificar anclas) sin depender de bibliotecas de alto nivel.
- Comparación de paradigmas 1-stage vs 2-stage: los scripts permiten ejecutar el mismo imagen con el Faster R-CNN propio y con YOLOv8, para medir diferencias de velocidad y calidad de detección.
- Validación de conceptos de entrenamiento: el código de asignación de objetivos (IoU thresholds) y las pérdidas pueden adaptarse para experimentos docentes sobre el efecto de hiperparámetros.
- Prototipado rápido de un detector básico sobre VOC: aunque los pesos son de demostración, el script de entrenamiento permite reentrenar con más épocas para obtener un modelo funcional en entornos académicos.
- Depuración de errores en implementaciones propias: sirve como referencia de implementación correcta (aunque simplificada) para contrastar con otros desarrollos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que los pesos proporcionados se entrenaron con una sola época y tienen fines puramente demostrativos, por lo que cualquier métrica (mAP@0.5, etc.) sería engañosa y no representativa del potencial de la arquitectura. El repositorio incluye una función de evaluación `mAP@0.5` en `train.py`, pero no se han reportado valores concretos.

## Requisitos de hardware

- El modelo es ligero para los estándares actuales de detección de objetos (backbone ResNet50 parcial, sin FPN). La inferencia se puede ejecutar en cualquier GPU con al menos 4 GB de VRAM.
- Una GPU consumer como RTX 3060 o superior es suficiente para entrenar con batch_size=1 sobre VOC 2007.
- Para entrenar desde cero con más épocas, se recomienda al menos 8 GB de VRAM (RTX 3070/4060 o superior) para evitar problemas de memoria.
- No se ha probado en CPU, pero con batch_size=1 podría funcionar con tiempos de inferencia del orden de segundos por imagen.
- Opciones de despliegue: los scripts son de línea de comandos directos (`infer.py`, `train.py`). No se ha integrado con vLLM, Ollama ni TGI porque no es un modelo de texto.
- No se dispone de datos de latencia o throughput medidos en la documentación.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YMmim/object-detection-scratch | Faster R-CNN (ResNet50, sin FPN) | no disponible | Pascal VOC 2007 | MIT | Peso .pth (1 época, educativo) |
| torchvision `fasterrcnn_resnet50_fpn_v2` | Faster R-CNN con FPN | 41.7 M aprox. | COCO | BSD-3-Clause | Pesos oficiales, producción |
| Ultralytics YOLOv8 | 1-stage CNN | 3.2 M – 68 M según variante | COCO | AGPL-3.0 | Pesos oficiales, producción |

La comparativa muestra que el modelo de YMmim es una implementación educativa sin rendimiento comparable, mientras que las alternativas de torchvision y Ultralytics son modelos entrenados y listos para producción. No se dispone de más modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Los pesos publicados se entrenaron con una sola época y no son útiles para ninguna tarea práctica de detección real.
- No se aplican técnicas de aumento de datos, FPN ni otras optimizaciones del documento original, lo que limita la precisión en objetos pequeños.
- La implementación está simplificada: batch size fijo a 1, RoI Head con capas FC en lugar de layer4, y objectness de la RPN con un solo logit BCE.
- No se garantiza la ausencia de sesgos en el entrenamiento; el dataset VOC 2001 es limitado y desactualizado.
- Riesgo de alucinación en detección: al estar mal entrenado, puede producir falsos positivos o cajas mal ajustadas.
- Licencia MIT para el código, pero el script `yolo_infer.py` depende de Ultralytics YOLO, que es AGPL-3.0; para uso comercial cerrado se necesita licencia comercial de Ultralytics.
- No se han publicado métricas de rendimiento ni resultados de evaluación en el repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/YMmim/object-detection-scratch
- GitHub (README): https://github.com/MinhCYB/object-detection-scratch/blob/main/README.md
- Repositorio YOLOv8 desde cero (referencia educativa): https://github.com/Pranay22077/YOLOv8-architecture-from-scratch
- Guía de mejores modelos de detección de objetos (blog): https://blog.roboflow.com/best-object-detection-models/
- Tutorial de detector desde cero con TensorFlow: https://pub.towardsai.net/building-your-own-object-detector-from-scratch-with-tensorflow-bfeadfaddad8
