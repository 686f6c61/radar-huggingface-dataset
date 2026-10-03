# Yash2dx/rt_detrv2_finetuned_trashify_box_detector_v1

## Resumen

rt_detrv2_finetuned_trashify_box_detector_v1 es un detector de objetos basado en RT-DETR v2 (Real-Time DEtection TRansformer) afinado por el usuario Yash2dx a partir del checkpoint PekingU/rtdetr_v2_r50vd. El modelo resuelve una tarea de vision por computador muy concreta: localizar mediante cajas contenedores de residuos, basura, brazos y manos, dentro de un proyecto denominado "trashify". No es un modelo de lenguaje: no genera texto ni procesa contexto conversacional, sino que devuelve bounding boxes y etiquetas de clase sobre una imagen de entrada.

El checkpoint tiene 42.869.429 parametros (unos 42,9 millones) y se distribuye en formato safetensors bajo licencia Apache 2.0, con un tamano de repositorio de 0,2 GB. La arquitectura es la de RT-DETR v2 con backbone ResNet-50, un detector end-to-end de la familia DETR disenado para inferencia en tiempo real y sin supresion de no maximos (NMS) posterior.

Su relevancia es acotada y practica: es un ejemplo de ajuste fino de un detector generico a un dominio especifico de gestion de residuos, con siete etiquetas inferidas de las metricas por clase (bin, hand, trash, trash_arm, not_bin, not_hand, not_trash). La model card esta generada automaticamente y no documenta el dataset, los usos previstos ni las limitaciones, por lo que debe tratarse como un experimento con validacion insuficiente para produccion sin auditoria propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR v2 (transformer detector end-to-end, sin NMS) con backbone convolucional ResNet-50 |
| Parametros totales | 42.869.429 (42,9 M) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos; la entrada es una imagen) |
| Tipos de cuantizacion | no disponible. No se publican variantes cuantizadas; el repo de 0,2 GB es coherente con pesos fp32 (~171 MB teoricos para 42,9 M de parametros) |
| Idiomas soportados | no aplica (no procesa texto). Las etiquetas de clase estan en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tarea | object-detection (deteccion con cajas) |
| Modelo base | PekingU/rtdetr_v2_r50vd |
| Numero de clases | 7 etiquetas inferidas de las metricas: bin, hand, trash, trash_arm, not_bin, not_hand, not_trash |
| Resolucion de entrada | no disponible (la model card no la especifica; RT-DETR v2 se entrena habitualmente a 640x640) |
| Libreria | transformers |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

RT-DETR v2 es un detector transformer end-to-end. Frente a los detectores clasicos basados en anchors (familia YOLO, Faster R-CNN), formula la deteccion como un problema de prediccion de conjuntos: un decoder transformer produce directamente un conjunto fijo de cajas sin necesidad de supresion de no maximos. La variante empleada aqui, r50vd, usa un backbone ResNet-50 y la cabeza de deteccion de RT-DETR v2. El modelo final conserva exactamente la arquitectura del checkpoint base; el ajuste fino solo modifica los pesos, no la topologia.

Los hiperparametros de entrenamiento documentados son: 10 epocas, learning rate 1e-4, batch de entrenamiento y evaluacion de 16, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 50 pasos de calentamiento, precision mixta nativa (AMP) y semilla 42. El log muestra incrementos de 50 pasos por epoca, lo que situa el entrenamiento en torno a 500 pasos totales y, con batch 16, sugiere un conjunto de entrenamiento del orden de 800 imagenes (estimacion a partir del log; la model card no declara el tamano del dataset, que figura como "unknown dataset"). No se documenta el origen de los datos, la composicion del dataset ni si se aplico aumento de datos, y tampoco hay evidencia de RLHF/DPO, tecnicas que no aplican a un detector.

Un detalle relevante: la perdida de validacion deja de mejorar a partir de la epoca 5 (8,8160) y repunta ligeramente en las epocas 8 y 9, mientras la perdida de entrenamiento sigue bajando (de 72,9 a 10,4). El patron es compatible con sobreajuste moderado y con un ajuste fino de pocos centenares de pasos sobre un dataset reducido.

## Capacidades

- Deteccion de objetos con cajas delimitadoras sobre imagenes, en una sola pasada y sin postprocesado NMS.
- Localizacion de contenedores de residuos y de basura (etiquetas bin, trash) con buen rendimiento relativo: mAP 0,7784 para bin y 0,6819 para trash.
- Deteccion de brazos y manos en escenas de manipulacion (trash_arm, hand), con mAP 0,6329 y 0,4795 respectivamente; util para contextos de robotica o de interaccion persona-objeto.
- Clases negativas o auxiliares (not_trash, not_bin, not_hand) pensadas para discriminar objetos que no pertenecen a la categoria positiva.
- Inferencia en tiempo real: RT-DETR v2 esta disenado para regimenes de baja latencia, aunque no se publican cifras de FPS ni de throughput para este checkpoint.
- Exportacion a otros formatos (ONNX, TensorRT, OpenVINO) mediante las herramientas estandar de transformers y del repositorio oficial de RT-DETR, no verificada en esta ficha.
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, vision-lenguaje, audio ni capacidades multilingues: es exclusivamente un detector de objetos.

## Casos de uso

- Triaje automatizado en plantas de reciclaje: el modelo localiza contenedores (bin) y residuos (trash) sobre el flujo de una cinta transportadora; su mAP de 0,7784 en bin lo hace adecuado para verificar la presencia y posicion de contenedores, aunque la deteccion de objetos pequenos (mAP small 0,0078) desaconseja su uso para residuos de pocos pixeles.
- Robotica de recogida de residuos: las clases trash_arm y trash permiten a un brazo robotico identificar simultaneamente el objeto a recoger y su propio efector, lo que simplifica el calculo de la pose de agarre sin necesidad de cinematica externa.
- Vigilancia de vertido ilegal con camaras fijas: deteccion de acumulaciones de basura (trash, mAP 0,6819) y de contenedores en imagenes de videovigilancia para generar alertas al servicio municipal de limpieza.
- Aplicacion movil o web de reciclaje asistido ("trashify"): el usuario fotografia un residuo y el modelo devuelve la caja y la etiqueta, que se puede mapear a instrucciones de reciclaje. La clase hand permite filtrar imagenes en las que el usuario sostiene el objeto, mejorando la calidad de la deteccion sobre objetos grandes y medianos.
- Control de acceso o higiene en puntos limpios: la etiqueta not_hand y la etiqueta hand permiten comprobar si hay una mano dentro de la zona de deposito, util para abrir compuertas automaticas o para registrar incidencias.
- Analisis de imagenes en auditorias de contenedores: procesado por lotes de fotografias de campo para cuantificar la ocupacion y la presencia de residuos mal depositados, con la clase not_bin para separar objetos que no son contenedores.
- Preetiquetado en anotacion de datasets: el modelo puede generar cajas candidatas sobre imagenes nuevas del dominio de residuos y reducir el trabajo de anotacion manual, siempre con revision humana dado el mAP global de 0,4286.
- Filtrado de falsos positivos en pipelines existentes: las clases not_trash y not_bin actuan como discriminadores auxiliares para descartar candidatos antes de pasar a un segundo clasificador.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de evaluacion (task object detection). El model-index del repositorio esta vacio, por lo que estos valores no estan registrados de forma estructurada:

| Metrica | Valor |
|---|---|
| Loss | 9,3397 |
| mAP (global) | 0,4286 |
| mAP@50 | 0,5754 |
| mAP@75 | 0,4827 |
| mAP small | 0,0078 |
| mAP medium | 0,2329 |
| mAP large | 0,4436 |
| MAR@1 | 0,4885 |
| MAR@10 | 0,6936 |
| MAR@100 | 0,7376 |
| MAR small | 0,4000 |
| MAR medium | 0,5334 |
| MAR large | 0,7533 |

Desglose por clase:

| Clase | mAP | MAR@100 |
|---|---|---|
| bin | 0,7784 | 0,8913 |
| hand | 0,4795 | 0,8354 |
| trash | 0,6819 | 0,8020 |
| trash_arm | 0,6329 | 0,8286 |
| not_bin | 0,1427 | 0,6909 |
| not_trash | 0,2303 | 0,5484 |
| not_hand | 0,0547 | 0,5667 |

Evolucion durante el entrenamiento (extracto del log del Trainer; se omiten las columnas de recall por clase):

| Epoca | Paso | Training loss | Validation loss | mAP | mAP@50 | mAP@75 | mAP small | mAP medium | mAP large |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 50 | 72,8997 | 17,4681 | 0,1939 | 0,2898 | 0,2032 | 0,0000 | 0,0232 | 0,2059 |
| 2 | 100 | 24,1341 | 10,6460 | 0,3428 | 0,4877 | 0,3628 | 0,0061 | 0,2901 | 0,3649 |
| 3 | 150 | 17,8868 | 9,7106 | 0,4920 | 0,6587 | 0,5529 | 0,0543 | 0,1969 | 0,5095 |
| 4 | 200 | 15,7085 | 9,0400 | 0,4948 | 0,6607 | 0,5792 | 0,1605 | 0,2307 | 0,5221 |
| 5 | 250 | 14,2732 | 8,8160 | 0,5502 | 0,7201 | 0,6196 | 0,0515 | 0,2757 | 0,5812 |
| 6 | 300 | 12,9796 | 8,8343 | 0,5244 | 0,6973 | 0,6007 | 0,0402 | 0,2293 | 0,5530 |
| 7 | 350 | 11,9877 | 8,8858 | 0,5111 | 0,6732 | 0,5873 | 0,1503 | 0,2045 | 0,5473 |
| 8 | 400 | 11,0629 | 8,8844 | 0,5102 | 0,6775 | 0,5784 | 0,0786 | 0,1900 | 0,5482 |
| 9 | 450 | 10,3675 | 9,0487 | 0,5147 | 0,6795 | 0,5886 | 0,0668 | 0,2263 | 0,5487 |

Observacion relevante: la metrica global declarada en la model card (mAP 0,4286) no coincide con ningun valor del log de entrenamiento, cuyo maximo es 0,5502 en la epoca 5. La discrepancia no esta explicada por el autor y sugiere que la evaluacion final se hizo sobre un split o un checkpoint distintos de los registrados en la tabla. No hay resultados comparativos con modelos de referencia (COCO u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB solo para los pesos en fp16 (~86 MB) o fp32 (~171 MB); contando activaciones a 640x640 y batch pequeno, el consumo realista se situa en el rango de 1 a 2 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM. Una RTX 3060, RTX 4060, RTX 4090 o similar es mas que suficiente. En el segmento profesional, A100, H100, L4 o T4 quedan ampliamente sobredimensionadas para un modelo de 42,9 M de parametros.
- GPU de consumo: si, cabe sin problemas en practicamente cualquier GPU de consumo de los ultimos ocho anos (GTX 1050 Ti en adelante) e incluso en CPU para inferencia con pocas imagenes por segundo.
- Opciones de despliegue: transformers con AutoModelForObjectDetection; exportacion a ONNX / ONNX Runtime (CPU y GPU); TensorRT; OpenVINO; TorchScript; servidores de inferencia genericos como Triton o TorchServe. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponible. No se publican mediciones de FPS ni de tiempo por imagen para este checkpoint. La arquitectura base RT-DETR v2 esta disenada para inferencia en tiempo real, pero el rendimiento efectivo depende del hardware y de la resolucion de entrada.
- Almacenamiento: el repositorio completo ocupa 0,2 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Dominio / clases | mAP | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| rt_detrv2_finetuned_trashify_box_detector_v1 | 42,9 M | Residuos, 7 etiquetas propias | 0,4286 (global declarado), 0,5502 maximo en log | apache-2.0 | safetensors | HuggingFace, 0 descargas |
| PekingU/rtdetr_v2_r50vd (modelo base) | 42,9 M (misma arquitectura) | COCO, 80 clases | no disponible en la informacion proporcionada | apache-2.0 | safetensors | HuggingFace, checkpoint oficial |
| PekingU/rtdetr_r50vd (RT-DETR v1, R50) | no disponible | COCO, 80 clases | no disponible en la informacion proporcionada | apache-2.0 | safetensors | HuggingFace, checkpoint oficial |
| Detectores de la familia YOLO (p. ej. Ultralytics YOLO11) | no disponible | COCO, 80 clases; requieren ajuste fino para residuos | no disponible en la informacion proporcionada | licencia propia de Ultralytics (AGPL-3.0 o comercial) | PyTorch, ONNX, TensorRT | Amplia, con ecosistema maduro |

La comparacion significativa es contra el modelo base: este checkpoint sustituye la cabeza de 80 clases COCO por siete etiquetas de dominio y pierde generalidad a cambio de especializacion. Frente a la familia YOLO, RT-DETR v2 ofrece la ventaja de no requerir NMS y de tener un pipeline end-to-end mas simple de exportar, a costa de un ecosistema de herramientas y de pesos preentrenados menos extenso. No hay datos de benchmarks que permitan afirmar cual rinde mejor en el dominio de residuos: el autor no publica comparaciones.

## Limitaciones y advertencias

- Rendimiento global modesto: mAP 0,4286 declarado y perdida de validacion de 9,3397. No es un modelo listo para produccion sin una evaluacion propia sobre el dominio objetivo.
- Deteccion de objetos pequenos practicamente inexistente: mAP small 0,0078, con una media de recall de 0,4. Los residuos de pocos pixeles no se detectaran de forma fiable.
- Clases negativas con mAP muy bajo: not_hand (0,0547), not_bin (0,1427) y not_trash (0,2303). Su recall alto (MAR@100 entre 0,55 y 0,69) indica que disparan con frecuencia, lo que puede generar falsos positivos si se usan como filtros estrictos.
- Discrepancia no explicada entre el mAP declarado (0,4286) y el mejor valor del log de entrenamiento (0,5502 en la epoca 5). Hay que reproducir la evaluacion antes de fiarse de cualquier cifra.
- Senales de sobreajuste: la perdida de validacion toca minimo en la epoca 5 y empeora en las dos ultimas epocas mientras la perdida de entrenamiento sigue descendiendo.
- Dataset desconocido: la model card indica "unknown dataset" y no documenta composicion, origen, numero de imagenes ni criterios de anotacion. No es posible evaluar sesgos de dominio, de iluminacion, de geografia ni de tipo de residuo. Toda extrapolacion a entornos distintos del dataset original es especulativa.
- Documentacion inexistente: la model card esta generada automaticamente y los apartados de descripcion, usos previstos y datos de entrenamiento dicen "More information needed". No hay guia de integracion, ni lista oficial de clases, ni resolucion de entrada declarada.
- Sin validacion externa: 0 descargas y 0 likes en HuggingFace, y el model-index del repositorio no contiene resultados. No hay terceros que hayan reproducido las metricas.
- Modelo puramente visual: no entiende lenguaje natural, no admite prompts de texto, no soporta tool calling ni agentes, y las etiquetas de salida estan en ingles y no son configurables sin reentrenar la cabeza.
- Licencia: apache-2.0 en este checkpoint, lo que permite uso comercial y modificacion. Conviene verificar de forma independiente la licencia y las condiciones del modelo base y del dataset de ajuste fino, no declaradas en la model card.
- Anomalia de metadatos: la fecha de creacion registrada (2026-10-03) es posterior a la fecha actual, lo que sugiere un error de marca de tiempo y refuerza la cautela sobre la trazabilidad del artefacto.
- Riesgo de alucinacion en sentido estricto: no aplica, porque el modelo no genera texto. El riesgo equivalente es la deteccion de cajas espurias o de clases incorrectas, especialmente en las categorias negativas y en objetos pequenos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yash2dx/rt_detrv2_finetuned_trashify_box_detector_v1
- Modelo base en HuggingFace: https://huggingface.co/PekingU/rtdetr_v2_r50vd
- Busqueda web: no se han recuperado enlaces relevantes. Los resultados devueltos por el buscador no guardan ninguna relacion con el modelo ni con la deteccion de objetos, por lo que se han descartado. No se dispone de paper, blog, repositorio ni demo asociados a este checkpoint mas alla de su propia pagina en HuggingFace.
