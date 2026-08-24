# YMmim/faster-rcnn-voc-scratch

## Resumen

El modelo `YMmim/faster-rcnn-voc-scratch` es una implementación educativa de Faster R-CNN entrenada desde cero sobre el dataset Pascal VOC 2007. Fue desarrollado por el usuario YMmim con el objetivo de enseñar los principios fundamentales de la detección de objetos mediante la reconstrucción manual de los componentes clave del algoritmo: generación de anclas, RPN, RoI Align, RoI Head y funciones de pérdida. A diferencia de las implementaciones oficiales de torchvision, este modelo no utiliza pesos preentrenados en ImageNet ni COCO, y prescinde de FPN y de técnicas de aumento de datos, lo que lo convierte en un recurso didáctico para entender el funcionamiento interno de Faster R-CNN.

El modelo está pensado exclusivamente como material de aprendizaje, y el propio autor advierte de que los pesos publicados son de una única época de entrenamiento y no son aptos para uso en producción. La arquitectura sigue el esquema clásico: un backbone ResNet50 (hasta la capa `layer3`) genera un mapa de características, que alimenta una RPN para proponer regiones candidatas y un RoI Head que clasifica y refina los cuadros delimitadores. No se dispone del número exacto de parámetros, ni de la longitud de contexto (al tratarse de un modelo de visión). El modelo está disponible bajo licencia MIT, y el formato de pesos es un archivo `.pth` de PyTorch.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Faster R-CNN (ResNet50 backbone, RPN, RoI Align, RoI Head) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (documentación en coreano) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` |

## Arquitectura y entrenamiento

El modelo implementa Faster R-CNN desde cero, sin utilizar las utilidades de torchvision para la construcción de los componentes. La arquitectura se compone de un backbone ResNet50 que extrae características de la imagen a un stride de 16 píxeles, seguido de una RPN que genera propuestas de regiones mediante un conjunto de 9 anclas por celda del mapa de características. Cada ancla produce una puntuación de objetividad y una corrección de caja. Las propuestas se seleccionan mediante NMS y pasan por una capa de RoI Align que extrae características de 7x7 para cada región. Finalmente, un RoI Head compuesto por capas completamente conectadas realiza la clasificación (20 clases de VOC + fondo) y la regresión de cajas.

El entrenamiento se realizó sobre el dataset Pascal VOC 2007 (trainval), con un único epoch de demostración. El autor reporta una curva de pérdida decreciente (de 2.71 a 0.98 en 4400 iteraciones), lo que valida la correcta implementación del pipeline. No se utilizaron técnicas de entrenamiento avanzadas como FPN, aumento de datos extensivo, o multi-escala. El batch size se fijó en 1 y la RPN usa una pérdida de entropía cruzada binaria de un solo logit. El modelo no ha sido sometido a un proceso de ajuste fino con RLHF ni DPO, ya que se trata de un modelo de visión y no de lenguaje.

## Capacidades

- Detección de objetos en imágenes: identifica y localiza objetos de las 20 clases de Pascal VOC (persona, coche, avión, etc.) mediante cuadros delimitadores.
- Clasificación de objetos: asigna una etiqueta de clase a cada región propuesta.
- Regresión de cajas: ajusta las coordenadas de los cuadros delimitadores a los objetos.
- Inferencia completa: incluye un script `infer.py` para ejecutar la detección sobre imágenes y visualizar los resultados con cajas, etiquetas y puntuaciones.
- Proceso de entrenamiento completo: incluye scripts para entrenar, evaluar y calcular mAP@0.5.
- No soporta tool calling, ni agentes, ni razonamiento multilingüe, ni capacidades de visión más allá de la detección de objetos.
- El modelo solo está entrenado para el vocabulario de Pascal VOC; no puede generalizar a otras clases.

## Casos de uso

- Educación en arquitecturas de detección de objetos: el modelo sirve para estudiar los componentes de Faster R-CNN, desde la generación de anclas hasta el RoI Align, mediante código legible y bien comentado.
- Pruebas de concepto de entrenamiento desde cero: útil para experimentar con el entrenamiento de un detector sin depender de pesos pre-entrenados, evaluando el efecto de diferentes hiperparámetros.
- Prototipado rápido de pipelines de detección: para desarrolladores que necesitan una base mínima para integrar detección de objetos en un entorno de investigación.
- Visualización de regiones propuestas: el script `infer.py` permite ver cómo la RPN genera candidatos y cómo el RoI Head los clasifica, lo que facilita la depuración de problemas de detección.
- Estudio de la pérdida y convergencia: la curva de pérdida muestra cómo el modelo aprende a localizar objetos, lo que puede usarse para enseñar conceptos de optimización.
- Experimentación con modificaciones arquitectónicas: al ser una implementación modular, se puede alterar fácilmente la RPN, el RoI Head o la pérdida para probar variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye una curva de pérdida decreciente durante el entrenamiento de una época, pero no se reporta mAP ni ninguna comparación con otros modelos. El autor indica explícitamente que el modelo es una demo y que no se debe esperar un rendimiento competitivo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no se dispone de datos concretos, pero al tratarse de un modelo ResNet50 con resolución de entrada de 800 píxeles, se estima que puede caber en una GPU con 8 GB de VRAM en FP32. Para entrenamiento con batch_size=1, se requeriría una cantidad similar.
- **GPU recomendadas**: una GPU de consumo como una RTX 3060 (12 GB) o superior sería suficiente para inferencia. Para entrenamiento de varias épocas, una GPU con al menos 16 GB es recomendable.
- **Cabe en consumer GPU**: sí, es probable que funcione en GPUs de consumo con 8 GB o más, aunque el tamaño exacto no está documentado.
- **Opciones de despliegue**: el modelo se distribuye como checkpoint `.pth` de PyTorch, por lo que se puede cargar con `torch.load` y ejecutar con `infer.py`. No se proporcionan integraciones con vLLM, Ollama o TGI, ya que es un modelo de visión.
- **Latencia y throughput**: no se proporcionan datos.

## Comparativa con modelos similares

No se dispone de datos comparativos. El modelo es una implementación educativa de Faster R-CNN, y las alternativas más cercanas son:

| Modelo | Arquitectura | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| YMmim/faster-rcnn-voc-scratch | Faster R-CNN (ResNet50) | no disponible | no aplica | no reportado | MIT |
| torchvision fasterrcnn_resnet50_fpn | Faster R-CNN (ResNet50 + FPN) | ~41M | no aplica | mAP@0.5 ~ 60 en COCO | BSD-3 |
| Detectron2 Faster R-CNN | Faster R-CNN (ResNet50 + FPN) | ~41M | no aplica | mAP@0.5 ~ 58 en COCO | Apache-2.0 |

Nota: los datos de parámetros y rendimiento de torchvision y Detectron2 son aproximados y se basan en información pública, pero el modelo de YMmim no reporta números.

## Limitaciones y advertencias

- **Pesos de demostración**: el modelo solo se ha entrenado durante 1 época, por lo que su rendimiento es muy bajo y no debe usarse en aplicaciones reales.
- **Sin FPN**: al no utilizar Feature Pyramid Network, el modelo es débil en la detección de objetos pequeños.
- **Sin pre-entrenamiento**: al entrenar desde cero sin pesos de ImageNet, la representación de características es menos rica que la de modelos pre-entrenados.
- **Batch size fijo a 1**: limita el uso de técnicas de normalización por lotes y puede afectar a la estabilidad del entrenamiento.
- **Solo vocabulario Pascal VOC**: no puede detectar objetos fuera de las 20 clases del dataset.
- **Documentación en coreano**: la mayor parte de la documentación está en coreano, aunque el código y los comentarios están en inglés.
- **Licencia MIT**: permite uso comercial, pero el dataset Pascal VOC tiene su propia licencia (verificar los términos).
- **Sin soporte de cuantización**: no se ofrecen versiones cuantizadas (GGUF, ONNX, etc.), lo que limita su uso en entornos de inferencia ligera.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/YMmim/faster-rcnn-voc-scratch)
- [Repositorio FasterRCNN-PyTorch (config VOC)](https://github.com/explainingai-code/FasterRCNN-PyTorch/blob/main/config/voc.yaml)
- [Faster-RCNN-From-Scratch (GitHub)](https://github.com/Daddy-Myth/Faster-RCNN-From-Scratch)
- [Documentación de VOC dataset en Faster RCNN](https://faster-rcnn.readthedocs.io/en/latest/tutorial/voc.html)
- [Notebook de entrenamiento Faster RCNN (Colab)](https://colab.research.google.com/github/pantelis/eng-ai-agents/blob/main/notebooks/scene-understanding/object-detection/faster-rcnn/pytorch/05_training/05_training.ipynb)
- [Documentación oficial de torchvision Faster R-CNN](https://docs.pytorch.org/vision/master/models/faster_rcnn.html)
