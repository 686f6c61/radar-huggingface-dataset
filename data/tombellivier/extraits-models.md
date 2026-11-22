# TomBellivier/extraits-models

## Resumen

EXTRAITS models (v0.1.0) es un conjunto de pesos publicado por TomBellivier que da soporte al pipeline EXTRAITS para la medicion morfometrica automatica de insectos a partir de imagenes dorsales. No se trata de un modelo de lenguaje, sino de un paquete de tres componentes de vision por computador: un ensamblado de modelos YOLO-pose que detecta 42 keypoints (esquema `insect42_v1`), un detector YOLO que localiza la barra de escala de la imagen (cuyo valor lee EasyOCR) y un conjunto de clasificadores random forest de scikit-learn que validan cada una de las 27 medidas derivadas.

El modelo resuelve un problema concreto de biologia y taxonomia: extraer medidas morfometricas estandarizadas (longitud total, anchura de cabeza, distancia interocular, longitudes de alas y patas, etc.) de especimenes de cuatro ordenes de insectos (coleoptera, diptera, hymenoptera y lepidoptera) sin intervencion manual. Los pesos se distribuyen como artefactos de un pipeline reproducible, con verificacion sha256 integrada en la herramienta de linea de comandos.

Es relevante para investigadores y desarrolladores que trabajen en digitalizacion de colecciones de historia natural, ecologia de comunidades o fenotipado de alta productividad, porque ofrece un flujo de trabajo completo (deteccion de pose, calibracion de escala y validacion de medida) bajo licencia AGPL-3.0 y con metricas de validacion cruzada publicadas. El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de YOLO-pose (Ultralytics) + detector YOLO + random forests de scikit-learn |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 (pesos); el codigo fuente de EXTRAITS es MIT |
| Formato de pesos | `.pt` (Ultralytics YOLO) y `.joblib` (pickles de scikit-learn) |
| Entrada | imagenes de 640 x 640 px |
| Keypoints | 42 (esquema `insect42_v1`) |
| Medidas derivadas | 27 |
| Ordenes de insectos | Coleoptera, Diptera, Hymenoptera, Lepidoptera |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El componente principal es un ensamblado de cinco modelos YOLO-pose, uno por cada fold de una validacion cruzada agrupada (`kfold5_grouped_seed42_pooled`), afinados a partir de `yolo26n-pose.pt` de Ultralytics. Cada miembro predice 42 keypoints sobre la imagen dorsal del insecto, a partir de los cuales se calculan 27 medidas morfometricas. El detector de barra de escala es un YOLO entrenado fuera del repositorio EXTRAITS y publicado unicamente como pesos; su valor numerico lo extrae EasyOCR. La validacion de cada medida la realiza un random forest independiente por medida (scikit-learn), que clasifica si la medida es fiable o "no medible".

El entrenamiento se realizo sobre 2643 imagenes dorsales anotadas para el proyecto GRIT, procedentes de varias bases de datos de imagenes de historia natural: 1060 coleopteros, 487 dipteros, 341 himenopteros y 661 lepidopteros. Las imagenes y las anotaciones no son redistribuibles, por lo que no se publican. No se documenta el numero de tokens ni el volumen de aumentacion de datos, ni si hubo etapas de ajuste fino adicionales mas alla del fine-tuning de los modelos YOLO-pose.

## Capacidades

- Deteccion de pose de insectos con 42 keypoints sobre imagenes dorsales de cuatro ordenes.
- Derivacion automatica de 27 medidas morfometricas a partir de los keypoints.
- Localizacion de la barra de escala en la imagen para la calibracion fisica de las medidas.
- Lectura OCR del valor de la barra de escala mediante EasyOCR.
- Clasificacion de validez por medida: cada random forest indica si una medida concreta es fiable o "no medible".
- Procesamiento por lotes de carpetas de imagenes con salida a CSV mediante `extraits process`.
- Ajuste fino opcional de los modelos de pose a nuevas imagenes mediante `extraits finetune`.
- Verificacion de integridad de los pesos descargados mediante sha256 fijado en el paquete.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingues ni modo de pensamiento: es un pipeline de vision especializado.

## Casos de uso

- Digitalizacion de colecciones entomologicas: procesar lotes de fotografias dorsales de especimenes de museo y generar un CSV con las 27 medidas por individuo, sustituyendo la medicion manual con calibre o software de anotacion.
- Fenotipado de alta productividad en ecologia: medir miles de individuos capturados en trampas para analizar variacion morfometrica entre poblaciones o a lo largo de gradientes ambientales.
- Monitorizacion de polinizadores: usar las medidas de himenopteros (distancia intertegular, longitud de ala) como proxies de tamano corporal y condicion en estudios de salud de colonias.
- Control de calidad de datos morfometricos: emplear los clasificadores de validez para descartar automaticamente medidas no fiables (por ejemplo, antenas ocluidas) antes de incluirlas en analisis estadisticos.
- Taxonomia asistida y morfometria geometrica: extraer coordenadas de keypoints para analisis de forma (procrustes, PCA) y comparacion entre especies o morfos.
- Adaptacion a nuevas colecciones: reentrenar los modelos de pose con `extraits finetune` sobre imagenes propias de un orden o una condicion de captura distinta, manteniendo el resto del pipeline.
- Docencia e investigacion reproducible: desplegar el pipeline completo con verificacion sha256 de pesos para garantizar la reproducibilidad de los resultados publicados.

## Benchmarks y rendimiento

Los unicos datos publicados son las metricas de validacion cruzada del propio autor.

Pose ensemble (oks_ap sobre el fold retenido, 5 folds):

| Miembro | Fold retenido | oks_ap |
|---|---|---|
| fold0 | 0 | 0.809 |
| fold1 | 1 | 0.808 |
| fold2 | 2 | 0.820 |
| fold3 | 3 | 0.801 |
| fold4 | 4 | 0.812 |
| Media del ensamblado | — | 0.810 ± 0.007 |

Clasificadores de validez de medida (n = 1201 por medida; "no medible" es la clase positiva para la average precision):

| Medida | MCC | Average precision | Balanced accuracy |
|---|---|---|---|
| total length | 0.489 | 0.720 | 0.700 |
| head width | 0.826 | 0.908 | 0.897 |
| head length | 0.523 | 0.684 | 0.776 |
| inter ocular distance | 0.964 | 0.982 | 0.975 |
| right antenna length | 0.981 | 0.952 | 0.993 |
| left antenna length | 0.981 | 0.954 | 0.998 |
| thorax width | 0.991 | 0.984 | 0.998 |
| abdomen width | 0.895 | 0.940 | 0.935 |
| abdomen length | 0.478 | 0.685 | 0.762 |
| intertegular distance | 0.984 | 0.997 | 0.995 |
| left hind wing length | 0.943 | 0.999 | 0.976 |
| right hind wing length | 0.912 | 0.999 | 0.946 |
| left hind wing width | 0.961 | 0.999 | 0.976 |
| right hind wing width | 0.926 | 0.999 | 0.948 |
| left fore wing length | 0.594 | 0.703 | 0.872 |
| right fore wing length | 0.613 | 0.747 | 0.871 |
| left fore wing width | 0.745 | 0.934 | 0.875 |
| right fore wing width | 0.794 | 0.946 | 0.899 |
| left hind leg length | 0.879 | 1.000 | 0.947 |
| left hind leg femur length | 0.916 | 1.000 | 0.934 |
| left hind leg tibia length | 0.976 | 0.995 | 0.985 |
| left hind leg tarsus length | 0.964 | 0.994 | 0.976 |
| right hind leg length | 0.784 | 0.999 | 0.955 |
| right hind leg femur length | 0.928 | 0.999 | 0.970 |
| right hind leg tibia length | 0.972 | 0.992 | 0.983 |
| right hind leg tarsus length | 0.969 | 0.991 | 0.981 |

No se han publicado resultados de benchmarks comparativos frente a otros modelos en la informacion disponible.

## Requisitos de hardware

- No se publican requisitos de VRAM en la informacion disponible. Al tratarse de modelos YOLO-pose de tamano `n` (nano) a 640 x 640 px, la inferencia cabe con holgura en GPU de consumo, aunque el dato exacto no esta documentado.
- GPU recomendadas: no disponible. Por el tamano de los modelos YOLO-pose nano, cualquier GPU con al menos 4-8 GB de VRAM es suficiente en la practica; no se confirma en la documentacion.
- Cabe en GPU de consumo (RTX 3060, RTX 4060, RTX 4090) con alta probabilidad, pero el autor no publica cifras de VRAM ni de latencia.
- Opciones de despliegue: la libreria declarada es Ultralytics; el pipeline se ejecuta mediante la CLI de EXTRAITS (`extraits download-models`, `extraits process`, `extraits finetune`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. La comparacion cualitativa con alternativas genericas de keypoint detection (por ejemplo, otros pesos YOLO-pose de Ultralytics o modelos tipo HRNet) no puede sustentarse con cifras y se marca como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EXTRAITS models v0.1.0 | no disponible | no aplica | oks_ap 0.810 ± 0.007 (5 folds) | AGPL-3.0 | Hugging Face, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado unicamente sobre cuatro ordenes de insectos (Coleoptera, Diptera, Hymenoptera, Lepidoptera) fotografiados en vista dorsal; otros ordenes o vistas quedan fuera de distribucion.
- Las imagenes y anotaciones de entrenamiento no son redistribuibles, lo que impide reproducir el entrenamiento desde cero y limita la auditoria externa del dataset.
- Los clasificadores de validez tienen rendimiento desigual: medidas como "total length" (MCC 0.489) o "abdomen length" (MCC 0.478) son claramente menos fiables que "thorax width" (MCC 0.991) o "intertegular distance" (MCC 0.984).
- Riesgo de error en la lectura OCR de la barra de escala: si EasyOCR falla, la calibracion fisica de todas las medidas del individuo queda comprometida.
- Los archivos `.joblib` son pickles de Python y solo deben cargarse desde una fuente de confianza; la CLI de EXTRAITS verifica su sha256, pero una carga manual fuera del pipeline evita esa comprobacion.
- Licencia AGPL-3.0 en los pesos, derivada de Ultralytics YOLO: el uso en servicios en red puede obligar a liberar el codigo del servicio. El codigo fuente de EXTRAITS es MIT, pero los pesos no.
- No se documentan sesgos demograficos ni de otro tipo mas alla de la distribucion taxonomica y de vista de las imagenes.
- No hay informacion sobre latencia, throughput ni requisitos de hardware, lo que dificulta planificar despliegues en produccion.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/TomBellivier/extraits-models
- Repositorio EXTRAITS (referenciado en la model card, sin URL explicita): no disponible
- Proyecto GRIT (referenciado en la model card, sin URL explicita): no disponible
- Ultralytics YOLO (modelo base `yolo26n-pose.pt`): no disponible
- EasyOCR (lectura de la barra de escala): no disponible
- Paper o blog del modelo: no disponible
- Demo: no disponible
