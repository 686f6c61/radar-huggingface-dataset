# thiagocassimiro/YOLOv8s-dog-detection

## Resumen

YOLOv8s-dog-detection es un modelo de deteccion de objetos basado en YOLOv8s (variante "small" de Ultralytics), ajustado finamente por el usuario thiagocassimiro para una unica tarea: detectar perros en imagenes. Se trata de un fine-tuning del checkpoint oficial Ultralytics/YOLOv8 sobre un subconjunto del dataset Google Open Images v7, con aproximadamente 4.000 instancias de la clase `dog`. El modelo resultante es una red de deteccion de una sola clase, distribuida en formato de pesos PyTorch (`.pt`) y pensada para su uso a traves de la libreria `ultralytics`.

El modelo es relevante como ejemplo de especializacion de un detector generico en un dominio muy concreto, un patron habitual en pipelines de vision por computador para aplicaciones de nicho (monitorizacion de mascotas, filtrado de imagenes, analitica de refugios de animales). Su licencia Apache 2.0 y su reducido tamano lo hacen facilmente desplegable en entornos con recursos limitados, si bien la escasa documentacion publicada y la ausencia de metricas de evaluacion limitan su uso en produccion sin una validacion previa.

No se dispone de informacion sobre la arquitectura interna detallada mas alla de la familia YOLOv8, ni sobre el numero exacto de parametros del checkpoint ajustado, ni sobre resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 (familia Ultralytics), variante "s" (small); red de deteccion de objetos de una etapa |
| Parametros totales | no disponible (el checkpoint corresponde a YOLOv8s; no se especifica el recuento exacto en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (el autor solo distribuye `best.pt` en precision original; no se documentan exportaciones a ONNX, TensorRT, INT8 ni FP16) |
| Idiomas soportados | no aplica (modelo de vision; las etiquetas de clase estan en ingles: `dog`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`, archivo `best.pt`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura YOLOv8 en su variante "small", una red neuronal convolucional de deteccion de objetos de una sola etapa que predice cajas delimitadoras y puntuaciones de clase directamente a partir de la imagen de entrada, sin etapa de propuestas regionales. La familia YOLOv8 emplea un backbone con bloques CSP y un cuello de tipo PAN-FPN, con cabecera de deteccion anclada libre (anchor-free) y asignacion dinamica de etiquetas; no obstante, la informacion proporcionada no detalla la configuracion exacta de capas ni el recuento de parametros del checkpoint ajustado.

El entrenamiento consistio en un fine-tuning supervisado sobre aproximadamente 4.000 instancias de la clase `dog` extraidas de Google Open Images v7, partiendo del checkpoint base Ultralytics/YOLOv8. La tarea se reduce a deteccion de una unica clase. No se documenta en la model card el numero de epochs, el tamano de imagen de entrenamiento, las augmentaciones aplicadas, la particion train/val/test, ni si se emplearon tecnicas adicionales como mosaic, mixup o close mosaic. Tampoco se indica si hubo ajuste de hiperparametros ni procesos de RLHF/DPO (no aplicables en un detector de objetos).

## Capacidades

- Deteccion de objetos de una sola clase: localiza perros en imagenes mediante cajas delimitadoras con puntuacion de confianza asociada.
- Inferencia por linea de comandos mediante `yolo detect predict` con parametros configurables (`imgsz`, `conf`, `save`).
- Inferencia programatica en Python a traves de la API de `ultralytics` (`YOLO("best.pt")`, `model.predict(...)`).
- Procesamiento por lotes de carpetas de imagenes (`source="images_folder/"`).
- Visualizacion y guardado de resultados con las cajas dibujadas sobre la imagen (`results[0].show()`, `results[0].save()`).
- Umbral de confianza ajustable para controlar la precision/recall en tiempo de inferencia.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, capacidades multilingues, modo thinking, vision multimodal, audio ni generacion de texto: es exclusivamente un detector de objetos.

## Casos de uso

- Monitorizacion de mascotas en el hogar: integrado en un pipeline de camaras domesticas, el modelo puede disparar alertas o grabaciones cuando detecta un perro en el encuadre, con un umbral de confianza ajustable para reducir falsos positivos.
- Filtrado y organizacion de fototecas: procesamiento por lotes de carpetas de imagenes para separar automaticamente las fotografias que contienen perros, aprovechando la inferencia batch documentada por el autor.
- Analitica en refugios y protectoras: conteo y localizacion de perros en imagenes de inventario o de jaulas para tareas de catalogacion, usando las cajas delimitadoras como base para metricas de ocupacion.
- Moderacion de contenido en plataformas: deteccion de perros en imagenes subidas por usuarios como paso previo a un clasificador de contenido mas amplio, gracias a su bajo coste computacional.
- Preprocesado para pipelines de vision mas complejos: uso del detector como etapa de region-of-interest para alimentar un segundo modelo (por ejemplo, identificacion de raza o estado de salud) unicamente sobre los recortes de perro detectados.
- Investigacion y docencia en vision por computador: ejemplo reproducible de fine-tuning de YOLOv8 sobre un dataset publico (Open Images v7) con licencia permisiva, util para comparar estrategias de especializacion de detectores genericos.
- Automatizacion de tareas de anotacion: generacion de pre-anotaciones de cajas de perro sobre nuevas imagenes para acelerar el etiquetado humano en proyectos de mayor escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (mAP, precision, recall, curvas PR) ni comparaciones con el checkpoint base Ultralytics/YOLOv8, por lo que no es posible cuantificar la mejora obtenida con el fine-tuning.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por la familia del modelo (YOLOv8s, resolucion de entrada 640x640), la huella es reducida y cabe holgadamente en GPUs de consumo, aunque el autor no publica cifras.
- GPU recomendadas: no especificadas por el autor. Por la clase de modelo, cualquier GPU con soporte CUDA es suficiente; no se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: el modelo esta pensado para ejecutarse en hardware modesto (la variante "s" de YOLOv8 es la segunda mas pequena de la familia), aunque no se aportan mediciones concretas.
- Opciones de despliegue: la unica via documentada es la libreria `ultralytics` con el archivo `best.pt` (CLI y Python). No se documentan exportaciones a ONNX, TensorRT, OpenVINO, TFLite ni integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un detector de objetos).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thiagocassimiro/YOLOv8s-dog-detection | no disponible (YOLOv8s) | imagen 640x640 (configurable) | Deteccion de 1 clase (`dog`) | Apache 2.0 | Hugging Face |
| Ultralytics/YOLOv8 (checkpoint base) | no disponible en la informacion | imagen 640x640 (configurable) | Deteccion de 80 clases (COCO) | AGPL-3.0 / licencia comercial Ultralytics | Ultralytics, Hugging Face |
| YOLOv8n (variante nano) | no disponible en la informacion | imagen 640x640 (configurable) | Deteccion de 80 clases (COCO) | AGPL-3.0 / licencia comercial Ultralytics | Ultralytics |
| YOLOv8m (variante medium) | no disponible en la informacion | imagen 640x640 (configurable) | Deteccion de 80 clases (COCO) | AGPL-3.0 / licencia comercial Ultralytics | Ultralytics |

La comparativa se limita a la familia YOLOv8 porque la informacion proporcionada no incluye otros detectores especializados en perros ni metricas que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de una sola clase: no detecta otras clases de objetos; si se necesita deteccion multietiqueta, debe combinarse con el checkpoint base o con otro detector.
- Sesgo de dominio: el entrenamiento se limita a aproximadamente 4.000 instancias de Google Open Images v7, lo que puede provocar un rendimiento desigual en razas poco representadas, condiciones de iluminacion atipicas, oclusiones severas o imagenes de baja resolucion.
- Riesgo de alucinacion en sentido amplio: como todo detector, puede generar falsos positivos (cajas sobre regiones sin perro) y falsos negativos, especialmente con umbrales de confianza bajos; el autor recomienda `conf=0.25` como valor por defecto, pero no se aportan curvas precision-recall que justifiquen ese umbral.
- Ausencia de metricas publicadas: no hay mAP, precision ni recall documentados, ni comparacion con el modelo base, por lo que no es posible verificar la calidad del fine-tuning sin una evaluacion propia.
- Documentacion escasa: no se detallan hiperparametros de entrenamiento, particion del dataset ni proceso de validacion, lo que dificulta la reproducibilidad.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Ultralytics/YOLOv8, cuya licencia original (AGPL-3.0 o comercial) puede imponer obligaciones adicionales segun el uso.
- Sin soporte multilingue ni de texto: no es un modelo de lenguaje; no debe emplearse para tareas de generacion, razonamiento o dialogo.
- Idiomas: las etiquetas de clase estan en ingles; no hay adaptacion a otros idiomas ni a variantes regionales.
- Sin garantias de mantenimiento: el repositorio no presenta descargas ni likes en el momento de la consulta, y no se documenta soporte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thiagocassimiro/YOLOv8s-dog-detection
- Modelo base en Hugging Face: https://huggingface.co/Ultralytics/YOLOv8
- Repositorio Ultralytics (YOLOv8): https://github.com/ultralytics/ultralytics
- Documentacion Ultralytics: https://docs.ultralytics.com/
- Dataset Google Open Images v7: https://storage.googleapis.com/openimages/web/index.html
