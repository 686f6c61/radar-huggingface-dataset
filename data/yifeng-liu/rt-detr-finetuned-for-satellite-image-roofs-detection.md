# Yifeng-Liu/rt-detr-finetuned-for-satellite-image-roofs-detection

## Resumen

El modelo `Yifeng-Liu/rt-detr-finetuned-for-satellite-image-roofs-detection` es un detector de objetos basado en RT-DETR (Real-Time Detection Transformer) afinado específicamente para la detección de tejados en imágenes de teledetección. Desarrollado por Yifeng-Liu, parte del modelo base `PekingU/rtdetr_r101vd_coco_o365`, que combina un backbone ResNet-101-vd con un decodificador transformer de consultas, y se ha ajustado con el dataset `keremberke/satellite-building-segmentation`. Con 76,6 millones de parámetros, ofrece una solución ligera y eficiente para localizar edificaciones en imágenes aéreas o satelitales, con una licencia MIT que permite uso comercial sin restricciones.

La relevancia de este modelo radica en su especialización: la detección de tejados es una tarea recurrente en ámbitos como la planificación urbana, la gestión de seguros o la evaluación de potencial solar. Al estar afinado sobre un dataset de segmentación de edificios, el modelo produce cajas delimitadoras (bounding boxes) con una precisión media (AP) de 0,434 en el conjunto de validación, lo que lo convierte en una opción práctica para pipelines de anotación automática o análisis geoespacial. Su integración con la librería `transformers` facilita su uso mediante la API estándar de detección de objetos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR (Real-Time Detection Transformer) con backbone ResNet-101-vd |
| Parametros totales | 76.636.355 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

RT-DETR es un detector de objetos en tiempo real que combina un backbone convolucional (ResNet-101-vd) con un decodificador basado en transformer. A diferencia de los detectores de una etapa como YOLO, RT-DETR utiliza consultas aprendidas para predecir directamente las cajas y las clases, eliminando la necesidad de anclas o NMS. El modelo base fue preentrenado en los conjuntos COCO y Objects365, lo que le proporciona una representación visual robusta. Posteriormente, se realizó un fine-tuning sobre el dataset `keremberke/satellite-building-segmentation`, que contiene imágenes de edificios con anotaciones de segmentación, adaptando el modelo a la detección de tejados en imágenes satelitales. No se dispone de información sobre el número exacto de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO, ya que se trata de un modelo de visión y no de lenguaje.

## Capacidades

- Detección de objetos: localiza tejados o edificios en imágenes satelitales o aéreas, devolviendo cajas delimitadoras con puntuaciones de confianza.
- Procesamiento de imágenes de alta resolución: al estar entrenado con imágenes de teledetección, maneja escalas y orientaciones variadas propias de este dominio.
- Inferencia en tiempo real: gracias a la arquitectura RT-DETR, es adecuado para aplicaciones que requieren latencia baja.
- Integración con Hugging Face Transformers: se puede cargar con `AutoModelForObjectDetection` y `AutoImageProcessor`, lo que simplifica su despliegue en pipelines existentes.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales más allá de la visión.

## Casos de uso

- Anotación automática de tejados para catastro: el modelo puede procesar ortofotos o imágenes satelitales y generar cajas delimitadoras que sirvan como entrada para sistemas de información geográfica (GIS), reduciendo el trabajo manual de delineación.
- Evaluación de potencial solar fotovoltaico: detectar tejados en una zona urbana permite estimar la superficie disponible para instalar paneles solares, combinando las detecciones con datos de irradiación.
- Gestión de seguros y reclamaciones: tras un desastre natural, el modelo puede identificar rápidamente estructuras dañadas en imágenes aéreas, facilitando la evaluación de daños y la priorización de inspecciones.
- Planificación urbana y desarrollo inmobiliario: analizar la densidad de edificaciones en una región ayuda a los planificadores a tomar decisiones sobre zonificación, infraestructuras o expansión.
- Monitorización de cambios en el uso del suelo: comparar detecciones de tejados en diferentes fechas permite detectar nuevas construcciones o demoliciones, útil para organismos reguladores.
- Generación de datasets de entrenamiento: el modelo puede usarse como pre-anotador para crear conjuntos de datos etiquetados de edificios en nuevas regiones, acelerando el desarrollo de modelos específicos.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación son los declarados por el autor en la model card, evaluados sobre el dataset `keremberke/satellite-building-segmentation`. No se han verificado de forma independiente.

| Metrica | Valor |
|---|---|
| AP @ IoU=0.50:0.95 (area=all) | 0.434 |
| AP @ IoU=0.50 (area=all) | 0.652 |
| AP @ IoU=0.75 (area=all) | 0.464 |
| AP @ IoU=0.50:0.95 (area=small) | 0.248 |
| AP @ IoU=0.50:0.95 (area=medium) | 0.510 |
| AP @ IoU=0.50:0.95 (area=large) | 0.632 |
| AR @ IoU=0.50:0.95 (maxDets=1) | 0.056 |
| AR @ IoU=0.50:0.95 (maxDets=10) | 0.328 |
| AR @ IoU=0.50:0.95 (maxDets=100) | 0.519 |
| AR @ IoU=0.50:0.95 (area=small) | 0.337 |
| AR @ IoU=0.50:0.95 (area=medium) | 0.601 |
| AR @ IoU=0.50:0.95 (area=large) | 0.714 |

El rendimiento es notablemente mejor en objetos medianos y grandes, mientras que los objetos pequeños presentan una precisión más baja, algo esperable en imágenes satelitales donde los tejados pequeños son difíciles de distinguir.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware en la información disponible.
- El modelo tiene 76,6 millones de parámetros y un tamaño de pesos de aproximadamente 0,9 GB, por lo que es relativamente ligero en comparación con modelos de lenguaje grandes.
- Puede ejecutarse en CPU para inferencia puntual, aunque se recomienda una GPU para procesamiento en lote o en tiempo real. GPUs de consumo como la NVIDIA RTX 3060 o superiores son suficientes para una latencia aceptable.
- Para despliegue en producción, se puede usar la API de Hugging Face Transformers con `pipeline("object-detection")`, o servidores de inferencia como vLLM (aunque vLLM está orientado a modelos de lenguaje, para visión se suele usar TorchServe o FastAPI). No se dispone de datos de throughput o latencia específicos.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de detección de tejados en imágenes satelitales en la información proporcionada. RT-DETR es una alternativa moderna a detectores clásicos como YOLO o Faster R-CNN, pero no se pueden ofrecer cifras concretas de comparación sin fuentes adicionales. Se recomienda evaluar el modelo frente a alternativas como YOLOv8 o DETR afinados en el mismo dataset para decidir cuál se adapta mejor a cada caso.

## Limitaciones y advertencias

- El modelo está especializado en la detección de tejados y puede no generalizar bien a otros tipos de objetos o a imágenes con condiciones muy diferentes (nubes, sombras, ángulos extremos).
- La precisión en objetos pequeños es limitada (AP de 0,248), por lo que en escenarios con edificaciones pequeñas o densas los resultados pueden ser menos fiables.
- No se han documentado sesgos específicos, pero el dataset de entrenamiento puede estar sesgado hacia ciertas regiones geográficas o estilos arquitectónicos, lo que afectaría a la generalización.
- Al ser un modelo de visión, no presenta riesgo de alucinación textual, pero sí puede producir falsos positivos o negativos en la detección.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario es responsable de validar el rendimiento en su caso de uso concreto.
- No se proporcionan garantías sobre la precisión en producción; se recomienda realizar una evaluación propia con datos representativos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Yifeng-Liu/rt-detr-finetuned-for-satellite-image-roofs-detection)
- [Notebook de fine-tuning en GitHub](https://github.com/ownEyes/satellite-image-roofs-auto-annotation-sourcecode/blob/dev/notebooks/finetune_rtdetr.ipynb)
- [Demo en Hugging Face Space](https://huggingface.co/spaces/Yifeng-Liu/satellite-image-roofs-auto-annotation)
- [Catálogo de modelos de Microsoft Foundry](https://ai.azure.com/catalog/models/yifeng-liu-rt-detr-finetuned-for-satellite-image-roofs-detection)
