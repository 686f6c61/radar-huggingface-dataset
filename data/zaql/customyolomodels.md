# zaql/CustomYOLOModels

## Resumen

El repositorio `zaql/CustomYOLOModels` es una colección de modelos de detección de objetos basados en la familia YOLO (You Only Look Once) de Ultralytics, entrenados sobre datos personalizados por el usuario Rasaq Lawani (zaql). Según la model card, el único modelo documentado hasta la fecha es `YOLO8s-XBOXController`, una variante de YOLOv8s entrenada para detectar mandos de Xbox en imágenes. La licencia es Apache 2.0 y el idioma declarado es inglés, aunque al ser un modelo de visión el idioma tiene escasa relevancia práctica.

La relevancia de este tipo de modelos reside en la facilidad de entrenar YOLO con datasets propios mediante la herramienta Ultralytics, lo que permite a desarrolladores e integradores crear detectores específicos sin necesidad de construir una arquitectura desde cero. Sin embargo, la documentación del repositorio es mínima: no se especifican datos de entrenamiento, métricas de rendimiento, ni el resto de modelos que se mencionan como parte de la colección (se citan YOLOv8, YOLO11 y YOLO26 como bases). La ausencia de métricas y de un dataset público hace que su utilidad sea limitada para producción sin una evaluación previa por parte del usuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8s (variante pequeña de YOLOv8) para el modelo documentado; la colección incluye modelos basados en YOLOv8, YOLO11 y YOLO26 |
| Parametros totales | no disponible (la variante YOLOv8s de Ultralytics tiene aproximadamente 11 millones de parametros, pero no se confirma para este modelo) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no aplicable (modelo de vision por imagenes) |
| Tipos de cuantizacion | no disponible (Ultralytics permite exportar a FP16, INT8, ONNX, TensorRT, pero no se documenta en el repo) |
| Idiomas soportados | en (irrelevante para un detector de objetos) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors o PyTorch nativo de Ultralytics, pero no se especifica) |

## Arquitectura y entrenamiento

YOLO es una arquitectura de detección de objetos en una sola pasada, basada en redes neuronales convolucionales. Su diseño divide la imagen en una rejilla y predice cajas delimitadoras y clases directamente, lo que la hace especialmente adecuada para inferencia en tiempo real. El modelo documentado, `YOLO8s-XBOXController`, se basa en la variante "s" (small) de YOLOv8, que equilibra velocidad y precisión y es la elección típica para tareas de detección de objetos con recursos moderados.

El entrenamiento se realizó con Ultralytics, como indica el campo `base_model:Ultralytics/YOLO11` en los tags. No se proporcionan datos sobre el tamaño del dataset, el número de épocas, el número de tokens (no aplicable) ni si se usaron técnicas de aumentación de datos o aprendizaje por transferencia. Al tratarse de un modelo personalizado, es razonable asumir que se partió de pesos preentrenados en COCO y se fine-tuneó con imágenes de mandos de Xbox, pero este proceso no está documentado.

## Capacidades

- Detección de mandos de Xbox en imágenes o vídeo, según el modelo `YOLOv8s-XBOXController` documentado.
- Detección de objetos en tiempo real, gracias a la arquitectura YOLO de una sola pasada.
- Capacidades de visión por computador básicas: localización y clasificación de objetos mediante cajas delimitadoras.
- No incluye generación de texto, razonamiento, tool calling, soporte de agentes ni capacidades multimodales (solo visión).
- El resto de modelos de la colección (basados en YOLO11 y YOLO26) no están documentados, por lo que sus capacidades son desconocidas.

## Casos de uso

- Inventario y control de stock de mandos de Xbox: un detector automático puede contar y localizar mandos en imágenes de almacenes o estanterías, facilitando la gestión de inventario en tiendas o centros logísticos.
- Pruebas de calidad en fabricación: integrar el modelo en una línea de producción para verificar que los mandos de Xbox se empaquetan o ensamblan correctamente, detectando ausencias o errores de posición.
- Automatización de pruebas de hardware: en laboratorios de testing, el modelo puede verificar visualmente que un mando está presente en una configuración de prueba antes de ejecutar pruebas automatizadas.
- Control de accesorios en vídeo o streaming: detectar mandos de Xbox en grabaciones para analizar el uso de periféricos en sesiones de juego o tutoriales.
- Aplicaciones de asistencia a la accesibilidad: un sistema puede detectar si un mando de Xbox está presente en la escena para adaptar la interfaz de una aplicación de juego.
- Formación de nuevos modelos: el dataset y el modelo pueden servir como punto de partida para entrenar detectores de otros periféricos (PlayStation, Switch) mediante fine-tuning con Ultralytics.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como mAP, precisión, recall o comparativas con otros modelos. Tampoco hay datos de latencia o throughput. Para evaluar el modelo sería necesario ejecutarlo sobre un dataset de validación propio y medir mAP@0.5 y mAP@0.5:0.95.

## Requisitos de hardware

- Los requisitos dependen de la variante de YOLO utilizada; el modelo documentado es YOLOv8s, que es una variante pequeña.
- VRAM estimada: para inferencia en FP32, YOLOv8s requiere aproximadamente 2-4 GB de VRAM en GPU; con cuantización FP16 o INT8 puede bajar a 1-2 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1660, RTX 2060, RTX 3060) es suficiente para inferencia en tiempo real. Para entrenamiento se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080).
- En CPU: es posible ejecutar YOLOv8s en CPU a baja resolución (320x320) con latencias de 100-300 ms por imagen, pero no es ideal para tiempo real.
- Opciones de despliegue: Ultralytics permite exportar a ONNX, TensorRT, CoreML, TFLite y OpenVINO. Puede integrarse con servidores de inferencia como Triton o usar la API de Ultralytics en Python.
- Latencia estimada: no disponible en la documentación, pero YOLOv8s suele alcanzar 30-60 FPS en una RTX 3060 con entrada 640x640.

## Comparativa con modelos similares

No se dispone de benchmarks para comparar este modelo con alternativas de la misma categoría. La comparativa se limita a los modelos base de Ultralytics:

| Modelo | Parametros | mAP COCO (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|
| YOLOv8s (Ultralytics) | 11,1 M | 44,9 % | AGPL-3.0 | HuggingFace, GitHub |
| YOLO11s (Ultralytics) | 9,4 M | 47,0 % | AGPL-3.0 | HuggingFace, GitHub |
| YOLOv8s-XBOController (zaql) | no disponible | no publicado | Apache 2.0 | HuggingFace |

La principal diferencia es la licencia: mientras que los modelos oficiales de Ultralytics usan AGPL-3.0 (que obliga a compartir el código si se ofrece como servicio), este modelo personalizado está bajo Apache 2.0, más permisiva para uso comercial cerrado. Sin embargo, la falta de métricas hace imposible valorar su rendimiento real frente a los modelos base.

## Limitaciones y advertencias

- Solo se ha documentado un modelo de la colección (detección de mandos de Xbox); el resto de modelos listados no están descritos ni probados.
- No hay métricas de rendimiento publicadas: no se puede afirmar su precisión, mAP ni su comportamiento en condiciones reales.
- El dataset de entrenamiento no se especifica: es probable que tenga un número limitado de clases (una única clase de mando de Xbox), lo que limita su generalización a otros objetos.
- Riesgo de sobreajuste: al ser un modelo personalizado con datos probablemente limitados, puede fallar ante variaciones de iluminación, ángulo o fondo no vistas en el entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero no se proporciona información sobre los datos de entrenamiento, por lo que el usuario debe verificar que no hay problemas de propiedad intelectual sobre los datos utilizados.
- No se indica el formato de pesos: si solo se publican pesos de PyTorch, será necesario convertirlos para usarlos en otros frameworks.
- El modelo está orientado a una única clase (mandos de Xbox); no sirve para detección genérica de objetos.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/zaql/CustomYOLOModels
- Perfil del autor en HuggingFace: https://huggingface.co/zaql
- Ultralytics YOLOv8: https://huggingface.co/Ultralytics/YOLOv8
- Ultralytics YOLO11: https://huggingface.co/Ultralytics/YOLO11
- Ultralytics YOLO26: https://huggingface.co/Ultralytics/YOLO26
