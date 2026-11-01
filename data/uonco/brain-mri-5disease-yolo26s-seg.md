# uonco/brain-mri-5disease-yolo26s-seg

## Resumen

Brain MRI 5-Disease YOLO26s-Seg es un prototipo de segmentación de instancias basado en la arquitectura YOLO26s-Seg de Ultralytics, publicado por el usuario uonco en HuggingFace. El modelo detecta y segmenta lesiones asociadas a cinco enfermedades cerebrales sobre cortes 2D de resonancia magnética: schwannoma vestibular, glioma, metástasis cerebral, ictus isquémico y esclerosis múltiple. Cada enfermedad se entrenó con una secuencia de MRI distinta (T1, T1CE, T1C, DWI y FLAIR respectivamente), lo que condiciona fuertemente su aplicabilidad.

Se trata de un artefacto educativo y de investigación, no de un producto clínico. El propio autor declara explícitamente que no es un dispositivo médico y que no debe emplearse para diagnóstico, cribado, triaje ni decisiones terapéuticas. El repositorio ocupa aproximadamente 0,1 GB y el peso `best.pt` tiene 92.393.497 bytes.

Su relevancia es limitada y acotada al ámbito docente: sirve como ejemplo práctico de pipeline de segmentación médica con Ultralytics, de exportación de cortes a PNG de 8 bits y de evaluación de métricas de máscara por clase. No aporta innovación arquitectónica ni datos de entrenamiento a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s-Seg (Ultralytics), segmentación de instancias |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | other (sin términos detallados en la información disponible) |
| Formato de pesos | PyTorch (`best.pt`), 92.393.497 bytes |
| Tarea | Detección y segmentación de instancias en cortes 2D de MRI |
| Entrada | PNG o JPEG de 8 bits, corte 2D |
| Clases | 5 (schwannoma vestibular, glioma, metástasis cerebral, ictus isquémico, esclerosis múltiple) |
| Tamaño de imagen de evaluación | 512 px (`imgsz=512`) |
| Checksum MD5 | `5ab0561235ab4aeb27f11ce2a1afb4da` |
| Checksum SHA256 | `d35c2fcd360ae8e1ec17ee850f6da6ff2cc1becc040e14689b8a840f7fb9344c` |

## Arquitectura y entrenamiento

El modelo emplea YOLO26s-Seg, la variante small de la familia YOLO26 de Ultralytics orientada a segmentación de instancias. La salida combina máscaras poligonales, cajas delimitadoras, clase y una puntuación de confianza por detección. No se dispone de información sobre el número de parámetros, la composición exacta del dataset, el número de imágenes de entrenamiento, ni sobre el uso de técnicas de aumento de datos o ajuste fino específico.

El aspecto técnico más relevante es el diseño por secuencia: cada una de las cinco clases se aprendió a partir de una secuencia de MRI diferente (T1 para schwannoma vestibular, T1CE para glioma, T1C para metástasis cerebral, DWI para ictus isquémico y FLAIR para esclerosis múltiple). Esto implica que el modelo no es un segmentador general de MRI, sino un conjunto de cinco detectores especializados integrados en un único checkpoint. No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de visión de este tipo.

## Capacidades

- Segmentación de instancias de lesiones cerebrales en cortes 2D de MRI para cinco enfermedades concretas.
- Detección con caja delimitadora, máscara poligonal, clase y puntuación de confianza por instancia.
- Procesamiento de imágenes PNG o JPEG de 8 bits preprocesadas según el pipeline de entrenamiento.
- Evaluación reproducible mediante la API de Ultralytics (`model.val(split="val", imgsz=512)`).
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades multilingües, de visión general, de audio ni de modo de razonamiento extendido.
- No procesa DICOM, NIfTI ni volúmenes 3D de forma directa.

## Casos de uso

- Docencia en imagen médica: usar el modelo como ejemplo práctico en un curso de segmentación con Ultralytics, mostrando el flujo completo desde la exportación de cortes a PNG de 8 bits hasta la obtención de máscaras y métricas por clase.
- Prototipado de pipelines de preprocesamiento: servir de banco de pruebas para validar la conversión de DICOM o NIfTI a imágenes de 8 bits compatibles con el modelo, identificando cuellos de botella antes de escalar a un modelo clínico real.
- Comparación de arquitecturas de segmentación: emplear las métricas de máscara por clase como referencia para contrastar YOLO26s-Seg con otros segmentadores (U-Net, SAM, Mask R-CNN) en un subconjunto de datos de investigación.
- Demostración de limitaciones de generalización: ilustrar en un artículo o taller cómo un modelo entrenado con una única secuencia por patología falla ante secuencias, planos o equipos distintos, subrayando la necesidad de validación externa.
- Análisis de calibración de confianza: estudiar por qué las puntuaciones del detector no equivalen a probabilidades de enfermedad y cómo afecta esto a la interpretación de resultados en entornos de investigación.
- Generación de conjuntos de datos sintéticos o aumentados: usar las máscaras predichas como punto de partida para anotación asistida en proyectos de investigación, siempre con revisión humana y sin uso clínico.

## Benchmarks y rendimiento

Métricas de máscara por clase del `best.pt` final, evaluadas con `model.val(split="val", imgsz=512)` sobre el split de validación. El autor advierte que este split pudo haberse usado para seleccionar el checkpoint, por lo que los valores pueden ser optimistas.

| Clase | Precision | Recall | mAP50 | mAP50-95 | mAP75 |
|---|---|---|---|---|---|
| vestibular_schwannoma | 0.877 | 0.826 | 0.877 | 0.546 | 0.602 |
| glioma | 0.787 | 0.413 | 0.438 | 0.240 | 0.252 |
| brain_metastasis | 0.759 | 0.450 | 0.484 | 0.218 | 0.161 |
| ischemic_stroke | 0.618 | 0.466 | 0.488 | 0.202 | 0.139 |
| multiple_sclerosis | 0.518 | 0.392 | 0.409 | 0.130 | 0.062 |
| Media simple (5 clases) | 0.712 | 0.510 | 0.539 | 0.267 | 0.243 |

No se han publicado resultados de benchmarks frente a modelos comparables en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint ocupa unos 92 MB, por lo que la inferencia en FP32 requiere previsiblemente menos de 1 GB de VRAM, aunque no se confirma en la documentación.
- GPU recomendadas: no disponible. Por el tamaño del modelo, cualquier GPU consumer moderna (RTX 3060 o superior) debería ser suficiente, pero no se aporta confirmación.
- Compatibilidad con GPU consumer: probablemente sí, dado el reducido tamaño del checkpoint, aunque no se documenta.
- Opciones de despliegue: la única vía documentada es la librería Ultralytics (`from ultralytics import YOLO`). No se mencionan exportaciones a ONNX, TensorRT, OpenVINO ni integraciones con vLLM, llama.cpp, Ollama o TGI (estas últimas no aplican a un modelo de visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, la familia YOLO de Ultralytics incluye variantes de segmentación (YOLOv8-Seg, YOLO11-Seg) con API compatible, pero no se aportan datos de rendimiento que permitan una comparación rigurosa con este checkpoint concreto.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| uonco/brain-mri-5disease-yolo26s-seg | no disponible | no aplica | other | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un dispositivo médico: el autor prohíbe explícitamente su uso para diagnóstico, cribado, triaje o decisiones de tratamiento.
- Cada enfermedad está ligada a una única secuencia de MRI; otras secuencias, planos, escáneres o protocolos quedan fuera de distribución.
- Solo admite cortes 2D en PNG o JPEG de 8 bits que coincidan con el preprocesamiento de entrenamiento; no procesa DICOM, NIfTI ni volúmenes 3D.
- Las puntuaciones de confianza no son probabilidades calibradas de enfermedad y no deben presentarse como tales.
- Cobertura limitada a cinco enfermedades: otros hallazgos, anatomía normal y artefactos pueden pasarse por alto o etiquetarse incorrectamente.
- Rendimiento muy desigual: el mAP50 de máscara va de 0,877 en schwannoma vestibular a 0,409 en esclerosis múltiple; el recall es bajo en glioma (0,413), metástasis (0,450), ictus (0,466) y esclerosis múltiple (0,392), por lo que se pierden lesiones con frecuencia.
- Las métricas proceden del split de validación, no de un conjunto de test independiente, y el checkpoint pudo seleccionarse con ese mismo split.
- No se ha establecido el rendimiento en datos de otras instituciones.
- Licencia "other" sin términos detallados: es necesario contactar con el autor o revisar el repositorio antes de cualquier uso, incluido el comercial.
- No se documentan sesgos demográficos ni la composición del dataset de entrenamiento, lo que impide evaluar su representatividad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/uonco/brain-mri-5disease-yolo26s-seg
- Ultralytics (librería y documentación): https://github.com/ultralytics/ultralytics
- No se han encontrado otros enlaces (papers, blogs, demos) en la información disponible.
