# xtxx/HFLX_Model_Weights

## Resumen

`xtxx/HFLX_Model_Weights` es un repositorio de pesos en PyTorch que contiene un detector de objetos basado en FCOS (Fully Convolutional One-Stage), orientado a la deteccion de figuras mitoticas en imagenes de histopatologia canina. El modelo lo publica el usuario `xtxx` y esta asociado, segun los tags del repositorio, al reto MIDOG25, una competicion centrada en la deteccion de mitosis en patologia digital. El pipeline declarado en HuggingFace es `object-detection`, por lo que no se trata de un modelo generativo ni de un modelo de lenguaje, sino de un detector visual de una sola etapa que devuelve cajas delimitadoras y puntuaciones de clase.

El repositorio ocupa 0,4 GB, lo que situa los pesos en el orden de la decena o el centenar de millones de parametros (estimacion a partir del tamano, no confirmada por el autor). No se publica informacion sobre la backbone, el numero de imagenes de entrenamiento, la resolucion de entrada ni los resultados de validacion. El acceso es restringido (gated): es necesario aceptar las condiciones en HuggingFace para descargar los pesos, y la licencia no aparece especificada en la informacion disponible.

Su relevancia actual es acotada pero concreta: la deteccion automatica de figuras mitoticas es la base del indice mitotico, un biomarcador de proliferacion usado en el diagnostico y el pronostico de tumores caninos. Un detector especializado permite precribar laminas completas (whole-slide images) y reducir el tiempo de revision del patologo, aunque la falta de documentacion y de metricas publicadas limita por ahora su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FCOS (Fully Convolutional One-Stage), detector denso sin anchors con rama de centerness y FPN (no se detalla la backbone) |
| Parametros totales | no disponible (el repositorio ocupa 0,4 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; modelo de vision. Resolucion de entrada y tamano de parche: no disponible |
| Tipos de cuantizacion | no disponible (solo se declaran pesos PyTorch; no se publican GGUF, ONNX ni TensorRT) |
| Idiomas soportados | zh, en (metadatos del repositorio; se refieren a la documentacion, no a capacidad linguistica del modelo) |
| Licencia | no disponible |
| Formato de pesos | no disponible con detalle; repositorio PyTorch de 0,4 GB (libreria declarada: pytorch) |

Otros metadatos: creado el 2026-10-23, actualizado el 2026-10-23, 0 descargas, 0 likes, acceso gated, region `us`.

## Arquitectura y entrenamiento

FCOS es un detector de una sola etapa y sin anchors que formula la deteccion como una prediccion densa por pixel: cada localizacion del mapa de caracteristicas regresiona distancias al centro de la caja (izquierda, arriba, derecha, abajo) y una puntuacion de clase, y anade una rama auxiliar de centerness para penalizar cajas de baja calidad generadas lejos del centro del objeto. Habitualmente se apoya en una red piramidal de caracteristicas (FPN) para cubrir varios niveles de escala, lo que es relevante en histopatologia, donde las mitosis son objetos pequenos (del orden de decenas de pixeles) frente a un fondo de tejido muy heterogeneo. La perdida habitual combina focal loss para la clasificacion y una perdida de regresion de cajas (IoU/GIoU).

No se dispone de informacion sobre la backbone concreta, el numero de imagenes de entrenamiento, la composicion del dataset (mas alla de la referencia a histopatologia canina y a MIDOG25), el esquema de aumento de datos ni el procedimiento de validacion. Tampoco se documenta ningun proceso de alineamiento tipo RLHF/DPO, algo que no aplica a un detector. La innovacion tecnica declarada, si puede llamarse asi, es el uso de un detector anchor-free de una etapa para un dominio de objetos pequenos y densos, donde los enfoques de dos etapas suelen ser mas costosos en inferencia sobre laminas completas.

## Capacidades

- Deteccion de objetos con cajas delimitadoras y puntuaciones de confianza en imagenes de tejido histopatologico.
- Localizacion de figuras mitoticas en parches o regiones de lamina, segun el uso previsto en MIDOG25.
- Prediccion multi-escala gracias a la piramide de caracteristicas propia de FCOS (niveles de escala no documentados).
- Capacidad de generalizacion entre dominios (escamer, tincion, laboratorio) potencialmente buscada por el contexto del reto, aunque no confirmada en la informacion disponible.
- Inferencia sobre imagenes individuales o por parches; no se documenta procesamiento nativo de laminas completas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No es un modelo multimodal: no procesa texto, audio ni video.
- No dispone de modo "thinking", vision-language ni generacion de texto.

## Casos de uso

- Conteo de figuras mitoticas por area (indice mitotico) en biopsias caninas: el detector recibe parches de tejido teñido y devuelve cajas con su puntuacion; el conteo se agrega por region de interes (hotspot) para obtener la densidad mitotica.
- Precribado y triage de laminas: ejecutar el detector sobre todos los parches de una whole-slide image y priorizar en la cola de revision aquellas laminas con densidad mitotica alta o incierta.
- Segunda lectura asistida en patologia veterinaria: presentar al patologo las regiones candidatas marcadas por el modelo para reducir el riesgo de omision en barridos manuales a bajo aumento.
- Pre-etiquetado para anotacion: usar las cajas predichas como borrador en herramientas de anotacion (QuPath, CVAT, Label Studio) y corregir manualmente, reduciendo el coste de crear nuevos conjuntos de datos etiquetados.
- Control de calidad de digitalizacion: detectar cambios en la distribucion de detecciones entre escaneres o lotes de tincion como senal de deriva de dominio (domain shift) en el pipeline.
- Investigacion en oncologia veterinaria: cuantificar proliferacion de forma reproducible en cohortes retrospectivas de laminas digitalizadas, con la salvedad de que la ausencia de metricas publicadas exige validacion local previa.
- Benchmark interno de detectores: servir como linea base FCOS frente a otros detectores (Faster R-CNN, YOLO, DETR) en tareas de deteccion de objetos pequenos en histopatologia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de mAP, F1, recall por objeto ni resultados en el conjunto de test de MIDOG25, ni comparaciones con lineas base en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, un repositorio de 0,4 GB en precision completa sugiere pesos de decenas a pocos cientos de millones de parametros, lo que tipicamente permite inferencia por debajo de 2-4 GB de VRAM con lotes pequenos de parches; es una estimacion, no un dato del autor.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para lotes pequenos. Para procesar laminas completas (miles de parches por lamina) conviene una GPU de datacenter tipo A100, H100, L4 o A10, o una RTX 4090 para exploracion.
- Cabe en GPU de consumo: si, previsiblemente en GTX 1660 Super, RTX 3060, RTX 4060 Ti y superiores, supeditado al tamano de parche y al backbone real, que no se documenta.
- Opciones de despliegue: PyTorch nativo; exportacion a TorchScript u ONNX para servir con Triton Inference Server, TorchServe o ONNX Runtime; lectura de laminas con OpenSlide/HistomicsTK para la generacion de parches.
- Latencia y throughput: no disponibles. Dependen del backbone, de la resolucion de parche y del hardware; en un detector de una etapa se espera un coste por parche bajo frente a alternativas de dos etapas, pero no hay cifras publicadas.

## Comparativa con modelos similares

No hay resultados publicados de este modelo, por lo que la comparacion solo puede ser cualitativa y a nivel de familia arquitectonica. Cualquier comparacion numerica requeriria reentrenar y evaluar cada alternativa sobre el mismo conjunto de test.

| Modelo | Familia | Anchors | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `xtxx/HFLX_Model_Weights` | FCOS (una etapa, anchor-free) | No | no disponible | imagen/parche, resolucion no disponible | no disponible | gated en HuggingFace |
| Faster R-CNN (referencia torchvision/mmdetection) | dos etapas, basada en regiones | Si (RPN) | depende de la backbone | imagen | BSD-3 (torchvision) / Apache-2.0 (mmdetection, segun version) | publica |
| YOLOv8/YOLO11 (Ultralytics) | una etapa, anchor-free | No | 3M-70M segun variante | imagen | AGPL-3.0 / licencia comercial Enterprise | publica |
| DETR / Deformable DETR | transformer, set prediction | No | ~40M+ segun configuracion | imagen | Apache-2.0 (implementacion de referencia) | publica |

Nota: los datos de parametros y licencias de las alternativas corresponden a sus implementaciones de referencia; no se dispone de metricas comparativas frente a este modelo en el dominio de histopatologia canina.

## Limitaciones y advertencias

- Acceso restringido: los pesos estan en modo gated y requieren aceptar condiciones en HuggingFace, lo que puede bloquear despliegues automatizados o pipelines de CI.
- Licencia no disponible: sin terminos explicitos no se puede asumir uso comercial, redistribucion ni uso en productos sanitarios o veterinarios regulados.
- Sin metricas publicadas: no hay mAP, sensibilidad, especificidad ni tasas de falsos positivos, por lo que el rendimiento real es desconocido.
- Sesgo de dominio: un detector entrenado en un conjunto limitado de escaneres, tinciones y laboratorios puede degradarse con cambios de coloracion (H&E de otro proveedor), grosores de corte o resoluciones de digitalizacion distintos.
- Falsos positivos estructurales: en histopatologia abundan estructuras morfologicamente parecidas a mitosis (nucleos oscuros y compactos, apoptosis, artefactos de tincion, linfocitos densos), una fuente de error conocida en esta tarea que exige validacion experta.
- Objetos pequenos: el rendimiento depende criticamente del aumento de la lamina y del tamano de parche; no se documenta ninguno de los dos.
- Reproducibilidad: al no publicarse backbone, hiperparametros ni composicion del dataset, no es posible reproducir el entrenamiento ni auditar sus datos.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso o validacion por terceros.
- Idiomas: los tags `zh` y `en` describen la documentacion, no una capacidad multilingue del modelo, que no procesa texto.
- No es un modelo generativo: no procede hablar de alucinacion, pero si de detecciones espurias con puntuacion alta y de ausencia de calibracion documentada de las confianzas.

## Enlaces

- HuggingFace: https://huggingface.co/xtxx/HFLX_Model_Weights
- No se han encontrado otros enlaces (paper, blog, repositorio de codigo o demo) en la informacion proporcionada.
