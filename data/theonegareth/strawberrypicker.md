# theonegareth/strawberryPicker

## Resumen

Strawberry Picker es un repositorio de artefactos asociado a un proyecto academico de robotica desarrollado por el Grupo 2 (Kelompok 2) del curso de Cinematica y Dinamica de Robots en la BINUS ASO School of Engineering entre septiembre de 2025 y enero de 2026. El proyecto consistia en un brazo robotico de cinco servomotores para la recoleccion de fresas, en el que un portatil ejecutaba un detector YOLOv8n sobre dos webcams, calculaba la posicion de cada fresa en centimetros mediante triangulacion estereo y enviaba el objetivo por puerto serie USB a un Arduino Uno que controlaba los servos a traves de un driver PCA9685.

El unico peso incluido en el repositorio es `classification/best_ripeness_classifier.pth`, un state dict de PyTorch (9,2 MB) correspondiente a una MobileNetV2 de torchvision con una cabeza de dos salidas, entrenada para clasificar fresas en dos clases (`unripe` y `ripe`). Se trata de un experimento separado del sistema principal de deteccion; el detector YOLO que usaba el brazo no esta incluido en el repositorio. El resto del contenido son notas, scripts, notebooks, un log de entrenamiento de YOLOv8n y documentacion del proyecto.

El modelo es relevante unicamente como referencia para quienes trabajen en vision artificial aplicada a agricultura de precision o en sistemas roboticos de recoleccion, y como ejemplo de publicacion de artefactos academicos incompletos. No es un modelo de proposito general ni compite en la categoria de modelos de lenguaje o vision de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (torchvision) con cabeza lineal de 2 salidas, envuelta en un modulo con atributo `backbone` |
| Parametros totales | no disponible (MobileNetV2 estandar ronda los 3,4 M, pero el dato no se declara en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes) |
| Tipos de cuantizacion | no disponible (solo se distribuye el state dict en precision original) |
| Idiomas soportados | en (etiquetas de clase en ingles) |
| Licencia | MIT |
| Formato de pesos | `.pth` (state dict de PyTorch, 9,2 MB) |

## Arquitectura y entrenamiento

La arquitectura es una MobileNetV2 de torchvision con la capa `classifier[1]` sustituida por una `nn.Linear` de `last_channel` a 2 clases. Los pesos se guardaron como state dict con las claves bajo el prefijo `backbone.`, lo que implica que la red se envolvio en un modulo contenedor con atributo `backbone` durante el entrenamiento. El checkpoint se genero en GPU y requiere `map_location="cpu"` para cargarse en una maquina sin CUDA.

Los detalles de entrenamiento no estan documentados en el repositorio: el script de entrenamiento de esta ejecucion no aparece en ninguno de los dos repositorios, y por tanto se desconocen el tamano de entrada, la normalizacion empleada y el orden de las dos salidas. La model card indica que el resumen de entrenamiento nombra las clases `unripe` y `ripe`, y que el ejemplo de inferencia usa el preprocesado estandar de ImageNet a 224x224 como suposicion, no como registro fiel del entrenamiento. Existe tambien un resumen de una ejecucion posterior con EfficientNet-B0 (`best_enhanced_classifier.pth`) cuyos pesos no estan incluidos. No se documenta uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador de imagenes.

## Capacidades

- Clasificacion binaria de imagenes de fresas en las categorias `unripe` y `ripe`.
- Inferencia sobre recortes de imagen RGB con preprocesado tipo ImageNet (supuesto, no confirmado).
- Carga mediante `torch.load(..., weights_only=True)` en CPU o GPU.
- Integracion en pipelines de vision con PyTorch y torchvision.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta agentes ni modos de pensamiento.
- No tiene capacidades multilingues mas alla de las etiquetas en ingles.
- No soporta vision mas alla de la clasificacion de imagen fija; no hay deteccion, segmentacion ni captioning en este checkpoint.

## Casos de uso

- Clasificacion de madurez en lineas de recoleccion robotica: el clasificador puede recibir recortes de fresa delimitados por un detector externo (YOLOv8n u otro) y etiquetar cada fruto como `unripe` o `ripe` antes de que el brazo ejecute la accion de recogida.
- Prototipado academico de vision agricola: sirve como punto de partida para estudiantes que quieran reproducir un pipeline de clasificacion binaria con MobileNetV2 y comparar con alternativas como EfficientNet-B0.
- Filtrado previo en inventario de fresas: en un contexto de laboratorio, se puede usar para separar lotes de fresas por madurez a partir de fotografias controladas.
- Integracion en demos de robotica con webcam: combinado con `webcam_inference.py`, permite montar una demo en tiempo real de clasificacion sobre recortes capturados por una camara USB.
- Base para fine-tuning en otros frutos: al ser un state dict de MobileNetV2 con cabeza de 2 clases, es trivial sustituir la cabeza y reentrenar para otra tarea de clasificacion binaria agricola.
- Docencia sobre publicacion de artefactos: el repositorio ilustra practicas habituales (y sus carencias) en la publicacion de checkpoints academicos, util como caso de estudio en asignaturas de ML engineering.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, precision, recall ni F1 para el clasificador de madurez, y tampoco se aportan resultados del detector YOLOv8n mas alla de la existencia de un log de entrenamiento (`results.csv`) cuyo contenido numerico no se detalla.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 para el clasificador MobileNetV2 (9,2 MB de pesos mas activaciones de una imagen 224x224); en la practica, cualquier GPU con 2 GB o mas es suficiente.
- GPU recomendadas: no se requiere GPU dedicada; una GTX 1050 Ti, RTX 3050 o superior funciona sin problemas. En CPU, la inferencia de una sola imagen es del orden de milisegundos a decenas de milisegundos.
- Cabe en cualquier GPU de consumo actual e incluso en dispositivos embebidos tipo Raspberry Pi con PyTorch compilado, aunque no se documenta dicha configuracion.
- Opciones de despliegue: PyTorch nativo, TorchScript, ONNX Runtime o TensorRT tras exportacion. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imagenes.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| theonegareth/strawberryPicker (clasificador) | no disponible (MobileNetV2) | imagen 224x224 (supuesto) | Clasificacion binaria de madurez | MIT | Hugging Face, solo state dict |
| EfficientNet-B0 (run posterior del mismo proyecto) | no disponible | no disponible | Clasificacion binaria de madurez | no disponible | Pesos no incluidos en el repo |
| YOLOv8n (detector del sistema, no incluido) | no disponible | imagen variable | Deteccion de fresas | AGPL-3.0 (Ultralytics) | Pesos no incluidos; solo log y notas |
| MobileNetV2 preentrenado en ImageNet (torchvision) | ~3,4 M | imagen 224x224 | Clasificacion 1000 clases | BSD-3-Clause | Disponible en torchvision |

La comparativa es limitada porque no se dispone de metricas del clasificador ni de los detectores del proyecto. Frente a MobileNetV2 preentrenado en ImageNet, este checkpoint esta especializado en una tarea binaria concreta pero carece de documentacion de entrenamiento. Frente al EfficientNet-B0 del mismo equipo, no hay datos para decidir cual rinde mejor.

## Limitaciones y advertencias

- El unico peso incluido es un clasificador binario de madurez; el detector YOLO que usaba el brazo no esta en el repositorio, por lo que no se puede reproducir el sistema completo solo con estos artefactos.
- Se desconoce el preprocesado exacto (tamano de entrada, normalizacion, orden de clases); la model card advierte que el ejemplo con preprocesado ImageNet a 224x224 es una suposicion.
- El checkpoint es un state dict, no un modelo serializado; `torch.load(...)` directo devuelve el diccionario de pesos y no un modelo listo para inferencia.
- Riesgo de sobreajuste y sesgo de dominio: entrenado presumiblemente con un conjunto pequeno y condiciones de iluminacion concretas; no se documenta composicion del dataset ni evaluacion en dominios distintos.
- Riesgo de alucinacion en el sentido de falsos positivos/negativos: sin metricas publicadas, no se puede estimar la fiabilidad en produccion.
- Limitacion idiomatica: etiquetas y documentacion solo en ingles.
- Restricciones de licencia: MIT permite uso comercial, pero el proyecto incluye dependencias (Ultralytics YOLOv8) cuya licencia AGPL-3.0 puede afectar a la distribucion del sistema completo si se reutiliza el codigo.
- El repositorio contiene `requirements.txt` con marcadores de merge sin resolver y un `config.yaml` que apunta a un arbol `model/` ausente, lo que complica la reproducibilidad.
- Solo 3 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/theonegareth/strawberryPicker
- Repositorio GitHub del proyecto: https://github.com/theonegareth/strawberryPicker
- Pagina del proyecto (write-up con fotos): enlazada desde la model card como `[project-page]`, URL no disponible en la informacion proporcionada
- Log de entrenamiento YOLOv8n en Kaggle: referenciado como `kaggle_strawberry_yolov8n_20251204_115538`, URL no disponible en la informacion proporcionada
- Script `combine3.py` en GitHub `main`: referenciado como `[combine3]`, URL no disponible en la informacion proporcionada
- Checkpoint del clasificador en GitHub `commit_fixes`: `model_backup/results/ripeness_classification/best_ripeness_classifier.pth`, URL no disponible en la informacion proporcionada
