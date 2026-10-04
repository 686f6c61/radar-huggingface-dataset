# W4ashabii/waste_classifier

## Resumen

Waste Classifier (Bio vs Non-Bio) es un clasificador de imágenes binario desarrollado por el usuario W4ashabii que distingue entre residuos biodegradables (`Bio`) y no biodegradables (`Non_Bio`). Se trata de un ajuste fino del checkpoint preentrenado `yolov8s-cls.pt` de Ultralytics sobre el dataset Pramudit/Waste_SIP_Dataset, con entrada de 224 × 224 píxeles y un checkpoint de aproximadamente 10 MB. No es un modelo de lenguaje ni un sistema multimodal: es una red convolucional de clasificación de imagen completa, sin detección ni localización de objetos.

El modelo resuelve un problema acotado y muy concreto: dado una fotografía de un residuo, asignarle una de dos etiquetas. Su relevancia práctica reside en que sirve como base reproducible y ligera para prototipos de clasificación automática de residuos, así como punto de partida para ajustes finos posteriores. El entrenamiento documentado es muy corto (20 épocas, unos 140 segundos en una NVIDIA RTX 4070 de 8 GB) y la mejor precisión top-1 reportada en validación es 0,960.

El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y fue creado y actualizado el 4 de octubre de 2026. La licencia es AGPL-3.0, heredada de Ultralytics YOLOv8, lo que condiciona su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8s-cls (red convolucional de clasificacion de imagenes, Ultralytics) |
| Parametros totales | no disponible (el autor solo indica un checkpoint de ~10 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch `.pt` (archivo `best.pt`) |

## Arquitectura y entrenamiento

La arquitectura es YOLOv8s-cls, la variante «small» de la tarea de clasificación de Ultralytics dentro de la familia YOLOv8. Se parte del checkpoint `yolov8s-cls.pt`, preentrenado por Ultralytics sobre COCO/ImageNet, y se ajusta fino sobre el dataset Waste_SIP_Dataset. La entrada es de 224 × 224 píxeles y la salida es una distribución de probabilidad sobre dos clases (`Bio`, `Non_Bio`). No hay componente de detección ni de segmentación: el modelo clasifica la imagen completa.

Los detalles de entrenamiento documentados son: 20 épocas con paciencia de early stopping de 5, tamaño de imagen 224, batch size 64, optimizador AdamW con tasa de aprendizaje inicial de 1e-3 y schedule coseno, precisión mixta FP16 (AMP), sobre una NVIDIA RTX 4070 de 8 GB. La pérdida final de entrenamiento fue 0,038. No se documenta el número de tokens ni de imágenes de entrenamiento, ni la composición detallada del dataset, ni si se aplicaron técnicas de aumento de datos o de regularización adicionales. No hay información sobre RLHF, DPO ni técnicas de decodificación especulativa, ya que no aplican a este tipo de modelo. La innovación técnica es nula más allá del ajuste fino: se trata de un baseline sencillo y reproducible.

## Capacidades

- Clasificación binaria de imágenes en dos categorías: `Bio` y `Non_Bio`.
- Procesamiento por lotes de carpetas de imágenes mediante `model.predict("path/to/images/", imgsz=224)`.
- Devolución de la clase predicha y de la confianza asociada (`r.probs.top1`, `r.probs.top1conf`), lo que permite aplicar umbrales de confianza en producción.
- Inferencia sobre imágenes individuales con un único paso de `predict`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa texto.
- No dispone de visión más allá de la clasificación: no detecta, no localiza objetos y no genera descripciones.
- No tiene modo «thinking» ni salidas estructuradas más allá del vector de probabilidades.

## Casos de uso

- Prototipado de clasificación automática de residuos: integrado en un script de Python con Ultralytics, el modelo etiqueta cada fotografía como `Bio` o `Non_Bio` en una sola pasada, lo que permite validar rápidamente la viabilidad de un sistema de triaje antes de invertir en anotación y modelos mayores.
- Clasificación por lotes de archivos históricos de imágenes: gracias a la predicción por lotes sobre carpetas completas, se puede procesar un conjunto de fotografías ya recolectado y generar un CSV con ruta, clase y confianza para su posterior análisis estadístico.
- Módulo de etiquetado asistido: usar la confianza devuelta (`top1conf`) para preetiquetar imágenes y enviar solo los casos de baja confianza a revisión humana, reduciendo el coste de anotación de nuevos datasets.
- Base para ajuste fino específico de dominio: al ser un checkpoint de ~10 MB y entrenarse en unos 140 segundos en una GPU de gama media, sirve como punto de partida para transfer learning en flujos de residuos concretos (por ejemplo, residuos de una planta específica).
- Demostraciones docentes: el pipeline completo (descarga desde HuggingFace, `YOLO(weights)`, `predict`) cabe en unas pocas líneas, lo que lo hace adecuado para prácticas de visión por computador en cursos.
- Prueba de concepto en dispositivos de borde: dado el tamanio reducido del checkpoint, es razonable evaluar su despliegue en una Jetson o en una Raspberry Pi con acelerador, siempre que se valide antes la degradación por cambio de dominio.
- Filtro previo en un pipeline mayor: actuar como primera etapa barata que separa residuo biodegradable de no biodegradable antes de un clasificador multietiqueta más costoso que identifique material concreto.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el split de validación, con el mejor checkpoint (`best.pt`, época 19 de 20):

| Metrica | Valor |
|---|---|
| Top-1 accuracy (mejor checkpoint, epoca 19) | 0,960 |
| Top-1 accuracy (epoca final, 20) | 0,955 |
| Perdida final de entrenamiento | 0,038 |
| Recall clase `Bio` | 0,97 |
| Recall clase `Non_Bio` | 0,95 |
| Top-5 accuracy | 1,000 (no informativa con dos clases) |

El autor advierte expresamente de que `best.pt` se seleccionó por precisión de validación, por lo que estas cifras son ligeramente optimistas y recomienda evaluar sobre el split `test` reservado del dataset para obtener una estimación insesgada. No se proporcionan resultados comparativos con otros modelos sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para el checkpoint de ~10 MB a 224 × 224 y lote pequeno; se trata de una estimacion a partir del tamanio del modelo, no de una medicion publicada.
- GPU de entrenamiento documentada: NVIDIA RTX 4070 de 8 GB, con batch 64 y AMP FP16, 20 épocas en aproximadamente 140 segundos.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4070, RTX 4090, e incluso en GPUs con 4 GB o menos.
- Es viable la inferencia en CPU para volúmenes moderados, dado el tamanio del modelo y las entradas de 224 × 224, aunque no se publican cifras de latencia.
- Opciones de despliegue: Ultralytics (Python), exportación a ONNX, TensorRT, OpenVINO u otros formatos soportados por Ultralytics. No se ha publicado una integración específica con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles. No se han publicado mediciones de inferencia.

## Comparativa con modelos similares

La comparación cuantitativa no es posible porque no hay resultados publicados de otros modelos sobre el split de validación de Waste_SIP_Dataset. La tabla siguiente recoge solo lo que se puede afirmar sin inventar cifras.

| Modelo | Tarea | Tamano | Licencia | Rendimiento en este dataset |
|---|---|---|---|---|
| W4ashabii/waste_classifier (YOLOv8s-cls ajustado) | Clasificacion binaria Bio / Non_Bio | Checkpoint de ~10 MB | AGPL-3.0 | Top-1 0,960 en validacion |
| Otras variantes YOLOv8-cls (n, m, l, x) | Clasificacion de imagenes | no disponible | AGPL-3.0 | no disponible |
| ResNet, EfficientNet o MobileNet ajustados | Clasificacion de imagenes | no disponible | depende del checkpoint de origen | no disponible |
| Ultralytics/YOLOv8 (modelo base) | Deteccion, segmentacion, clasificacion, pose | no disponible | AGPL-3.0 | no evaluado en este dataset |

## Limitaciones y advertencias

- Clasificación exclusivamente binaria: el modelo no identifica tipos de material (plástico, vidrio, metal, papel) y no detecta ni localiza objetos dentro de la imagen.
- Suposición de objeto único: clasifica la imagen completa, por lo que fotografías con residuos mezclados o escenas desordenadas pueden producir resultados poco fiables.
- Cambio de dominio: la precisión se midió sobre imágenes de un único dataset. Cámaras, iluminación, fondos o tipos de residuo poco representados en el entrenamiento pueden degradar el rendimiento de forma significativa.
- Selección sesgada del checkpoint: `best.pt` se eligió maximizando la precisión de validación, por lo que las cifras reportadas son optimistas. El propio autor recomienda evaluar sobre el split `test`.
- No es un modelo de seguridad crítica: no debe usarse como único responsable de decisiones reales de manipulación de residuos, higiene o cumplimiento normativo.
- Licencia AGPL-3.0: los pesos heredan la licencia de Ultralytics YOLOv8. El uso en productos o servicios propietarios exige revisar las obligaciones de copyleft o adquirir una licencia comercial de Ultralytics.
- Licencia del dataset independiente: el autor remite a la página de Pramudit/Waste_SIP_Dataset para consultar su licencia antes de cualquier uso comercial.
- Sesgos conocidos en las clases: no se documenta la distribución de clases del dataset ni su método de recolección, por lo que no se puede evaluar el desequilibrio ni el sesgo geográfico o cultural de las imágenes.
- Riesgo de alucinación: no aplica en el sentido habitual de los modelos generativos, pero sí existe riesgo de predicciones erróneas con alta confianza en imágenes fuera de dominio.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación independiente por terceros.
- Idiomas y contexto: no aplica, al no ser un modelo de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/W4ashabii/waste_classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/Pramudit/Waste_SIP_Dataset
- Documentación de clasificación de Ultralytics: https://docs.ultralytics.com/tasks/classify/
- Repositorio de Ultralytics: https://github.com/ultralytics/ultralytics
- Cita del modelo base (Jocher, Chaurasia y Qiu, 2023): https://github.com/ultralytics/ultralytics
- Nota: la búsqueda web realizada no devolvió resultados relevantes para este modelo; los enlaces obtenidos correspondían a contenidos sobre la planta Dieffenbachia y no guardan relación con el clasificador de residuos. No se han encontrado papers, blogs ni demos adicionales publicados por el autor.
