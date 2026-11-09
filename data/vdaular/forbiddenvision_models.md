# vdaular/ForbiddenVision_Models

## Resumen

ForbiddenVision_Models es una colección de modelos de visión por computador entrenados a medida para detección de rostros y segmentación facial en contenido realista, anime y estilizado. Está desarrollado por el usuario vdaular y se distribuye como pesos auxiliares para el conjunto de nodos personalizados ComfyUI-Forbidden-Vision, un plugin de ComfyUI orientado a flujos de trabajo de generación y edición de imágenes centrados en rostros.

El repositorio deriva de arquitecturas Ultralytics YOLO11 (detección y segmentación) y de un backbone timm EfficientNetV2-S preentrenado en ImageNet-21k, según los metadatos de modelo base. No se trata de un modelo de lenguaje ni de un modelo generativo: es un conjunto de detectores y segmentadores de propósito específico que se ejecutan dentro de un pipeline de difusión para localizar y recortar caras antes o después de la generación.

Su relevancia es acotada pero práctica: cubre un nicho (rostros en estilos no fotorrealistas) que los detectores genéricos como los de OpenCV o los modelos COCO suelen resolver con menor precisión. El repositorio ocupa unos 0,1 GB, está publicado bajo licencia Apache 2.0 y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO11 (deteccion y segmentacion) con backbone timm tf_efficientnetv2_s.in21k_ft_in1k |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | ONNX exportado; cuantizacion explicita no detallada |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) y ONNX |

## Arquitectura y entrenamiento

La coleccion se compone de detectores y segmentadores basados en Ultralytics YOLO11, una familia de redes convolucionales de una sola etapa para deteccion de objetos e instancias. Los metadatos indican que el backbone empleado es tf_efficientnetv2_s.in21k_ft_in1k, un EfficientNetV2-S de timm preentrenado en ImageNet-21k y ajustado en ImageNet-1k, lo que sugiere un proceso de transferencia desde clasificacion general hacia deteccion y segmentacion facial. El repositorio incluye variantes exportadas a ONNX, lo que permite inferencia sin PyTorch en entornos de produccion.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el numero de imagenes anotadas, ni sobre si se aplicaron tecnicas de aumento especificas para dominios anime o estilizados. Tampoco se documentan procesos de RLHF, DPO ni refinamiento por preferencias, algo esperable en un modelo de vision y no de lenguaje. La innovacion tecnica declarada es el ajuste especifico a rostros en contenido no fotorrealista, un dominio donde los detectores genericos pierden recall.

## Capacidades

- Deteccion de rostros en imagenes realistas, de anime y estilizadas.
- Segmentacion facial a nivel de instancia (mascaras por rostro).
- Exportacion a ONNX para despliegue en entornos sin dependencia de PyTorch.
- Integracion nativa con ComfyUI mediante los nodos personalizados ComfyUI-Forbidden-Vision.
- Procesamiento de imagenes individuales en pipelines de generacion y postprocesado.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingues ni de procesamiento de texto.
- No incluye modo thinking, vision generativa, audio ni otras modalidades.

## Casos de uso

- Preprocesado en flujos de img2img: el detector localiza rostros antes de aplicar inpainting o restauracion facial, permitiendo enmascarar solo la region de la cara y preservar el resto de la composicion.
- Recorte y alineado automatico de caras en datasets: util para construir corpus de entrenamiento de modelos de identidad o de estilo a partir de imagenes realistas y de anime, donde los detectores COCO fallan con frecuencia.
- Segmentacion de rostros para composicion multietapa: las mascaras por instancia permiten separar cada personaje en escenas con varias caras, algo necesario en workflows de edicion selectiva.
- Integracion en ComfyUI para generacion de retratos: los nodos conectan deteccion y segmentacion directamente con nodos de difusion, sin scripts externos.
- Filtrado y curaduria de contenido: deteccion de rostros para clasificar, recortar o anonimizar imagenes en lotes dentro de un pipeline automatizado.
- Control de calidad en generacion de personajes: verificar que la salida generada contiene un rostro detectable y bien delimitado antes de aceptar la imagen en produccion.
- Despliegue en inferencia ONNX: uso en servicios ligeros que ya cuentan con runtime ONNX y quieren evitar instalar PyTorch completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de mAP, precision, recall, IoU ni comparaciones cuantitativas con otros detectores faciales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del repositorio (0,1 GB) y la familia YOLO11, es esperable un consumo bajo, en el orden de cientos de MB a pocos GB, pero no hay dato confirmado.
- GPU recomendadas: cualquier GPU con soporte CUDA capaz de ejecutar YOLO11; no se especifican modelos concretos.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del repositorio, aunque no se confirma con mediciones.
- Opciones de despliegue: Ultralytics (PyTorch), runtime ONNX, y los nodos ComfyUI-Forbidden-Vision. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de vision de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ForbiddenVision_Models | Deteccion y segmentacion facial (YOLO11) | no disponible | no aplica | Apache 2.0 | Hugging Face |
| Ultralytics YOLO11 (base) | Deteccion y segmentacion generica | no disponible en la informacion | no aplica | AGPL-3.0 / Enterprise | Ultralytics |
| MediaPipe Face Detection | Deteccion facial ligera | no disponible | no aplica | Apache 2.0 | Google |
| RetinaFace | Deteccion facial | no disponible | no aplica | MIT (implementaciones) | GitHub |

La comparativa es cualitativa: no se dispone de metricas de rendimiento del modelo de vdaular ni de los alternativos en la informacion proporcionada. La diferencia principal frente a los detectores genericos es el ajuste a dominios estilizados y anime.

## Limitaciones y advertencias

- No se han publicado metricas de evaluacion; el rendimiento real en dominios concretos es desconocido.
- El repositorio no registra descargas ni likes, lo que dificulta validar su robustez en produccion.
- No hay informacion sobre sesgos demograficos, de iluminacion o de estilo en el dataset de entrenamiento.
- Riesgo de falsos negativos en rostros ocluidos, de perfil extremo o en estilos muy alejados de los vistos en entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la compatibilidad con la licencia de Ultralytics YOLO11 (AGPL-3.0 o comercial) si se redistribuyen los pesos derivados.
- La integracion esta disenada para ComfyUI; fuera de ese entorno requiere adaptacion manual.
- No apto para tareas de reconocimiento de identidad ni verificacion biometrica sin validacion adicional.
- La fecha de creacion indicada (2026-11-09) y la ausencia de historial de actualizaciones impiden confirmar mantenimiento activo.

## Enlaces

- Hugging Face: https://huggingface.co/vdaular/ForbiddenVision_Models
- Repositorio ComfyUI-Forbidden-Vision: https://github.com/luxdelux7/ComfyUI-Forbidden-Vision
- Issues del repositorio: https://github.com/luxdelux7/ComfyUI-Forbidden-Vision/issues
- Apoyo al autor (Ko-fi): https://ko-fi.com/luxdelux
- Ultralytics YOLO11: https://github.com/ultralytics/ultralytics
- Backbone timm EfficientNetV2: https://huggingface.co/timm/tf_efficientnetv2_s.in21k_ft_in1k
