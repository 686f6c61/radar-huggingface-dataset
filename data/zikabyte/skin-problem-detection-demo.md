# zikabyte/skin-problem-detection-demo

## Resumen

`zikabyte/skin-problem-detection-demo` es un modelo de deteccion de objetos basado en YOLO26 nano, desarrollado por el usuario zikabyte como prueba de viabilidad tecnica para localizar problemas cutaneos faciales comunes: lunares, acné, rosácea y arrugas. El modelo se entrenó con el framework Ultralytics YOLO26 sobre el dataset `skin-problem-4f8bc` de Roboflow, compuesto por 9182 imágenes bajo licencia CC BY 4.0, durante 60 épocas y con un tamaño de imagen de 640 píxeles.

El modelo no está concebido como producto médico ni de producción, sino como demostración de la capacidad de YOLO26 para tareas de análisis de imagen dermatológica. Su relevancia radica en que ejemplifica un flujo completo de entrenamiento y exportación (PyTorch y ONNX) para despliegue en entornos con recursos limitados, aunque su rendimiento por clase es desigual, con resultados notablemente bajos en clases difíciles como el acné (mAP@50-95 de 0,0989) frente a los lunares (0,6638). El repositorio tiene un tamaño de 0,0 GB y no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 nano (CNN de deteccion de objetos de una sola etapa) |
| Parametros totales | no disponible (variante nano de la familia YOLO26) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 640x640) |
| Tipos de cuantizacion | FP32 en PyTorch; exportacion ONNX disponible (sin cuantizacion documentada) |
| Idiomas soportados | no aplica (modelo de vision sin modalidad de texto) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (.pt) y ONNX |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura YOLO26 en su variante nano (`yolo26n.pt`), un detector de objetos de una sola etapa basado en CNN que predice cajas delimitadoras y probabilidades de clase directamente sobre la imagen de entrada. El entrenamiento se realizó con Ultralytics YOLO26 sobre un dataset de Roboflow (CC BY 4.0) con 9182 imágenes de aproximadamente 700 píxeles de resolución, durante 60 épocas y con un tamaño de entrada de 640x640. No se documenta el uso de técnicas como aumento de datos específico, preentrenamiento adicional o ajuste fino con RLHF/DPO, al tratarse de un modelo de visión supervisado clásico.

La exportación a ONNX permite inferencia fuera del ecosistema PyTorch, facilitando el despliegue en motores de inferencia como ONNX Runtime o TensorRT. No se especifican innovaciones técnicas adicionales más allá de las propias de la familia YOLO26.

## Capacidades

- Deteccion de objetos en imagen: localiza y clasifica cuatro clases de problemas cutaneos faciales (lunar, acné, rosácea, arruga) con cajas delimitadoras.
- Procesamiento de imagenes a resolucion 640x640 con umbral de confianza configurable (ejemplo de uso con `conf=0.25`).
- Exportacion a ONNX para despliegue en entornos de inferencia ligera (edge, CPU, dispositivos embebidos).
- No soporta tool calling, razonamiento multi-paso, generacion de texto ni capacidades multimodales de lenguaje.
- No dispone de modo "thinking" ni de capacidades de vision-lenguaje; es exclusivamente un detector de objetos.

## Casos de uso

- Prototipado de aplicaciones de analisis dermatologico: el modelo puede integrarse en una demo o MVP para localizar lunares y arrugas en fotografias faciales, sirviendo como base para validar el flujo de producto antes de invertir en un modelo clinico.
- Evaluacion de la familia YOLO26 para vision medica: desarrolladores que quieran comparar el rendimiento de YOLO26 nano frente a YOLOv8 o YOLOv5 en tareas de deteccion de anomalias cutaneas pueden usar este modelo como referencia de linea base.
- Pipeline de preprocesado para diagnostico asistido: las cajas delimitadoras generadas pueden alimentar un sistema posterior (clasificador, segmentador o modelo de lenguaje con vision) que analice la region detectada con mayor detalle.
- Educacion e investigacion academica: el repositorio incluye metricas desglosadas por clase y un dataset publico, lo que lo hace util como caso de estudio de entrenamiento de detectores con datos de una unica fuente y sus limitaciones de generalizacion.
- Demo de despliegue con ONNX: el formato ONNX permite probar la inferencia en CPU o en dispositivos embebidos (Raspberry Pi, Jetson Nano) para validar la viabilidad de un sistema de analisis cutaneo en el punto de atencion.
- Filtrado o triaje de imagenes en aplicaciones de telemedicina: aunque no es un producto medico, puede usarse internamente para pre-seleccionar imagenes que contengan lunares visibles y derivarlas a revision manual por un especialista.

## Benchmarks y rendimiento

Metricas reportadas en la model card sobre el split de validacion (mejor checkpoint) y el split de test retenido:

| Split | Precision | Recall | mAP@50 | mAP@50-95 |
|---|---|---|---|---|
| Validacion | 0,543 | 0,5102 | 0,4955 | 0,273 |
| Test retenido (global) | 0,5523 | 0,5308 | 0,5211 | 0,2897 |

Desglose por clase en el test retenido (mAP@50-95):

| Clase | mAP@50-95 |
|---|---|
| Mole | 0,6638 |
| acne | 0,0989 |
| rosacea | 0,2436 |
| wrinkle | 0,1525 |

El rendimiento es claramente desigual: las lesiones bien delimitadas (lunares) obtienen resultados mucho mejores que las lesiones pequeñas, agrupadas o difusas (acné, arrugas). No se han publicado comparativas con otros modelos en la informacion disponible.

## Requisitos de hardware

- Al tratarse de la variante nano de YOLO26, el modelo es ligero y puede ejecutarse en GPU de consumo. Los requisitos exactos de VRAM no estan documentados en la informacion proporcionada; como referencia orientativa, un modelo YOLO nano con entrada 640x640 suele requerir entre 1 y 2 GB de VRAM en FP32, y menos en FP16 o INT8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100) es suficiente para inferencia.
- Inferencia en CPU viable gracias al tamano nano y a la exportacion ONNX; adecuado para despliegue en edge (Raspberry Pi, Jetson) con latencias del orden de decenas de milisegundos por imagen, aunque no se aportan mediciones concretas.
- Opciones de despliegue: Ultralytics YOLO (Python), ONNX Runtime, TensorRT; no se documenta compatibilidad con vLLM, llama.cpp u Ollama, que son especificos de modelos de lenguaje.
- El entrenamiento se realizó con un unico archivo `.pt` de tamano reducido (repositorio de 0,0 GB), lo que confirma que el peso del modelo es minimo.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. Como alternativas conceptuales de la misma categoria (deteccion de objetos con YOLO nano), cabria considerar `yolov8n.pt` o `yolov5nu.pt` de Ultralytics, que comparten el mismo paradigma de una sola etapa y tamano nano, y podrian entrenarse sobre el mismo dataset para comparar mAP. Sin embargo, no se han publicado resultados de esta comparativa para este modelo concreto.

## Limitaciones y advertencias

- No es una herramienta de diagnostico: la propia model card advierte explicitamente que se trata de una prueba de viabilidad tecnica, no de un producto medico o de produccion.
- Sesgo de dominio: entrenado sobre un dataset de una unica fuente con imagenes de aproximadamente 700 píxeles; se espera degradacion del rendimiento (domain shift) ante cambios de iluminacion, tonos de piel y configuraciones de camara distintas a las del dataset.
- Rendimiento por clase muy desigual: el acné obtiene un mAP@50-95 de 0,0989, lo que indica que las lesiones pequeñas, agrupadas o difusas se detectan de forma poco fiable.
- Sin datos de robustez: no se documentan pruebas frente a oclusiones, desenfoque, compresion de imagen ni variaciones extremas de iluminacion.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero no exime de las responsabilidades legales y eticas asociadas al uso de modelos de vision en contextos sanitarios.
- Sin registro de uso: el repositorio no tiene descargas ni valoraciones, por lo que no hay evidencia de validacion externa o uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zikabyte/skin-problem-detection-demo
- Dataset de entrenamiento (Roboflow): https://universe.roboflow.com/niloofar/skin-problem-4f8bc/dataset/2
- No se han encontrado papers, repositorios GitHub adicionales ni demos asociados a este modelo concreto en la busqueda web.
