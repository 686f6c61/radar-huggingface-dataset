# TomBellivier/extraits-models

## Resumen

EXTRAITS models (v0.1.0) es una coleccion de pesos publicada por TomBellivier que implementa el componente de vision por computador del proyecto EXTRAITS, una herramienta para medir morfometricamente insectos a partir de imagenes dorsales. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de un conjunto de tres artefactos especializados: un ensemble de cinco modelos YOLO-pose (uno por pliegue de validacion cruzada) que detectan 42 puntos clave anatomicos, un detector YOLO de barra de escala y 27 clasificadores de random forest (scikit-learn) que validan si cada medicion derivada es fiable.

La relevancia del artefacto es practica y de nicho: automatiza la morfometria de insectos, una tarea que tradicionalmente requiere medicion manual con software como ImageJ y que resulta cuello de botella en estudios de biodiversidad, taxonomia y ecologia. El ensemble de pose alcanza un oks_ap de 0,810 ± 0,007 en validacion cruzada de 5 pliegues sobre 2643 imagenes anotadas del proyecto GRIT, cubriendo Coleoptera, Diptera, Hymenoptera y Lepidoptera.

El repositorio ocupa 0,1 GB, se distribuye bajo licencia AGPL-3.0 (heredada de Ultralytics YOLO) y esta pensado para consumirse mediante la CLI `extraits`, que verifica la integridad de cada fichero contra un sha256 fijado en el paquete. La fecha de creacion del repositorio (2026-11-21) y su actualizacion inmediata (2026-11-22) indican una publicacion inicial reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 5 modelos YOLO-pose (Ultralytics `yolo26n-pose.pt` fine-tuneado) + 1 detector YOLO de barra de escala + 27 random forests (scikit-learn) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 640x640 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de vision) |
| Licencia | AGPL-3.0 (pesos); codigo EXTRAITS bajo MIT |
| Formato de pesos | `.pt` (Ultralytics) para pose y detector; `.joblib` (pickle de Python) para los clasificadores |
| Puntos clave | 42 keypoints (esquema `insect42_v1`), de los que se derivan 27 mediciones |
| Tamano del repositorio | 0,1 GB |
| Descargas | 208 |
| Pipeline declarado | keypoint-detection |

## Arquitectura y entrenamiento

El nucleo del sistema es un ensemble de cinco modelos YOLO-pose, uno por pliegue de una validacion cruzada agrupada (`kfold5_grouped_seed42_pooled`). Cada miembro se fine-tunea desde `yolo26n-pose.pt` de Ultralytics y predice 42 puntos clave sobre imagenes de entrada de 640x640 pixeles. A partir de esos keypoints se calculan 27 mediciones morfometricas (longitud total, anchura de cabeza, distancia interocular, longitudes de antenas, alas, patas con femur/tibia/tarso, etc.). El detector de barra de escala, entrenado fuera del repositorio EXTRAITS y publicado solo como pesos, localiza la barra de calibracion; su valor numerico lo lee EasyOCR.

Los clasificadores de validez son 27 random forests independientes, uno por medicion, entrenados sobre 1201 muestras cada uno, que determinan si la medicion correspondiente es fiable ("unmeasurable" es la clase positiva para la average precision). Los datos de entrenamiento son imagenes dorsales de insectos de varias bases de datos de historia natural, anotadas para el proyecto GRIT: 2643 imagenes en total (1060 Coleoptera, 487 Diptera, 341 Hymenoptera, 661 Lepidoptera). Las imagenes y anotaciones no son redistribuibles y no se publican. No se documentan detalles sobre funciones de perdida, aumentos de datos ni hiperparametros de entrenamiento mas alla de la configuracion de validacion cruzada.

## Capacidades

- Deteccion de 42 puntos clave anatomicos en imagenes dorsales de insectos de cuatro ordenes (Coleoptera, Diptera, Hymenoptera, Lepidoptera).
- Derivacion de 27 mediciones morfometricas a partir de los keypoints.
- Deteccion de barra de escala en la imagen y lectura de su valor mediante EasyOCR para calibracion metrica.
- Validacion automatica de la fiabilidad de cada medicion mediante clasificadores de random forest.
- Inferencia por lotes a traves de la CLI `extraits process -i <carpeta> -o results.csv`, que produce un CSV de resultados.
- Descarga verificada de pesos con `extraits download-models`, con comprobacion sha256 de cada fichero.
- Adaptacion a nuevas imagenes mediante `extraits finetune` para reentrenar los modelos de pose.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un pipeline de vision especifico.

## Casos de uso

- Digitalizacion de colecciones entomologicas: procesar lotes de fotografias dorsales de especimenes de museo para extraer automaticamente 27 mediciones por individuo y exportarlas a CSV, sustituyendo la medicion manual en ImageJ.
- Estudios de morfometria comparada: comparar proporciones anatomicas (por ejemplo, distancia intertegular o longitud de alas) entre poblaciones de abejas o escarabajos con mediciones reproducibles y validadas por los clasificadores de fiabilidad.
- Monitorizacion de biodiversidad: medir rasgos funcionales de insectos capturados en trampas o muestreos para estudios de ecologia de comunidades, aprovechando que el pipeline cubre los cuatro ordenes mas frecuentes en muestreos.
- Control de calidad de datasets de imagen: usar los clasificadores de validez para descartar automaticamente imagenes donde una medicion concreta no es fiable (por ejemplo, alas ocultas o antenas rotas) antes de un analisis estadistico.
- Taxonomia asistida: obtener mediciones estandarizadas de alta precision (interocular MCC 0,964; thorax width MCC 0,991) como apoyo a la identificacion y descripcion de especies.
- Investigacion en biologia del desarrollo o evolutiva: cuantificar asimetrias izquierda-derecha comparando mediciones homologas (ala izquierda frente a derecha, pata izquierda frente a derecha), para lo que el modelo predice ambos lados de forma independiente.
- Docencia y talleres de morfometria: pipeline reproducible y con pesos verificados por sha256 que permite a estudiantes obtener mediciones sin experiencia previa en software de analisis de imagen.

## Benchmarks y rendimiento

### Ensemble de pose (oks_ap sobre pliegue retenido)

| Miembro | Pliegue retenido | oks_ap |
|---|---|---|
| fold0 | 0 | 0,809 |
| fold1 | 1 | 0,808 |
| fold2 | 2 | 0,820 |
| fold3 | 3 | 0,801 |
| fold4 | 4 | 0,812 |
| Ensemble (media ± desv.) | 5 pliegues | 0,810 ± 0,007 |

### Validez de medicion (seleccion de las 27 mediciones)

| Medicion | n | MCC | Average precision | Balanced accuracy |
|---|---|---|---|---|
| total length | 1201 | 0,489 | 0,720 | 0,700 |
| head width | 1201 | 0,826 | 0,908 | 0,897 |
| head length | 1201 | 0,523 | 0,684 | 0,776 |
| inter ocular distance | 1201 | 0,964 | 0,982 | 0,975 |
| right antenna length | 1201 | 0,981 | 0,952 | 0,993 |
| left antenna length | 1201 | 0,981 | 0,954 | 0,998 |
| thorax width | 1201 | 0,991 | 0,984 | 0,998 |
| abdomen width | 1201 | 0,895 | 0,940 | 0,935 |
| abdomen length | 1201 | 0,478 | 0,685 | 0,762 |
| intertegular distance | 1201 | 0,984 | 0,997 | 0,995 |
| left hind wing length | 1201 | 0,943 | 0,999 | 0,976 |
| right hind wing length | 1201 | 0,912 | 0,999 | 0,946 |
| left hind wing width | 1201 | 0,961 | 0,999 | 0,976 |
| right hind wing width | 1201 | 0,926 | 0,999 | 0,948 |
| left fore wing length | 1201 | 0,594 | 0,703 | 0,872 |
| right fore wing length | 1201 | 0,613 | 0,747 | 0,871 |
| left fore wing width | 1201 | 0,745 | 0,934 | 0,875 |
| right fore wing width | 1201 | 0,794 | 0,946 | 0,899 |
| left hind leg length | 1201 | 0,879 | 1,000 | 0,947 |
| left hind leg femur length | 1201 | 0,916 | 1,000 | 0,934 |
| left hind leg tibia length | 1201 | 0,976 | 0,995 | 0,985 |
| left hind leg tarsus length | 1201 | 0,964 | 0,994 | 0,976 |
| right hind leg length | 1201 | 0,784 | 0,999 | 0,955 |
| right hind leg femur length | 1201 | 0,928 | 0,999 | 0,970 |
| right hind leg tibia length | 1201 | 0,972 | 0,992 | 0,983 |
| right hind leg tarsus length | 1201 | 0,969 | 0,991 | 0,981 |

Las mediciones con peor discriminacion son total length (MCC 0,489) y abdomen length (MCC 0,478), seguidas de head length (MCC 0,523) y las longitudes de ala anterior (MCC 0,594 y 0,613). No se han publicado resultados comparativos frente a otros modelos de keypoint detection en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Al tratarse de un ensemble de cinco modelos YOLO-n pose (variante nano, `yolo26n`) con entrada de 640x640, la huella es reducida y cabe holgadamente en GPUs de consumo, pero el autor no publica cifras.
- GPU recomendadas: no especificadas. Por el tamano de los modelos (variante nano) y la entrada 640x640, cualquier GPU con CUDA resulta suficiente; una RTX 3060 o superior deberia manejar el pipeline sin problemas, aunque esta estimacion no procede de datos publicados por el autor.
- GPU de consumo: si, segun el tamano de los modelos; no hay requisitos oficiales documentados.
- Opciones de despliegue: la via prevista es la CLI `extraits` (`extraits download-models` y `extraits process`), que orquesta Ultralytics para pose y deteccion, EasyOCR para la barra de escala y scikit-learn para los clasificadores. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EXTRAITS models (v0.1.0) | Ensemble YOLO-pose + random forests | 42 keypoints y 27 mediciones en insectos | no disponible | 640x640 px | AGPL-3.0 | Hugging Face + CLI |
| Ultralytics YOLO-pose (`yolo26n-pose.pt`) | YOLO-pose | Keypoints genericos (persona) | no disponible | 640x640 px | AGPL-3.0 | Ultralytics |
| Detectores de keypoints de insectos especificos | no disponible | Keypoints en insectos | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados de otros modelos de keypoint detection especificos para morfometria de insectos en la informacion proporcionada, por lo que la comparativa cuantitativa con alternativas no esta disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente con imagenes dorsales de cuatro ordenes (Coleoptera, Diptera, Hymenoptera, Lepidoptera); otros ordenes o vistas distintas de la dorsal quedan fuera de distribucion.
- Las imagenes y anotaciones de entrenamiento no se publican por restricciones de redistribucion, lo que limita la reproducibilidad completa del entrenamiento.
- Los clasificadores de validez tienen rendimiento desigual: las mediciones de longitud total y abdomen length presentan MCC en torno a 0,48-0,49, por lo que su validacion automatica es poco fiable.
- Riesgo de mediciones erroneas en imagenes con oclusiones, alas plegadas, antenas rotas o escalas ausentes; el pipeline depende de la deteccion correcta de la barra de escala y de su lectura por EasyOCR.
- Licencia AGPL-3.0 en los pesos (heredada de Ultralytics): el uso en servicios en red puede obligar a liberar el codigo del servicio; revisar implicaciones antes de uso comercial. El codigo EXTRAITS es MIT, pero los pesos no.
- Los ficheros `.joblib` son pickles de Python: solo deben cargarse desde fuentes de confianza; la CLI `extraits` verifica su sha256, pero una carga manual sin verificacion es un riesgo de seguridad.
- No se documentan sesgos demograficos ni linguisticos (no aplica), pero si un sesgo de dominio claro hacia las condiciones de fotografia de las bases de datos de historia natural usadas.
- No hay informacion sobre latencia, throughput ni requisitos minimos de hardware, lo que dificulta planificar despliegues a escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TomBellivier/extraits-models
- Repositorio del proyecto EXTRAITS: https://github.com/TomBellivier/EXTRAITS
- DOI Zenodo: https://doi.org/10.5281/zenodo.24439992
- Ultralytics YOLO: https://github.com/ultralytics/ultralytics
- EasyOCR: https://github.com/JaidedAI/EasyOCR
- scikit-learn: https://scikit-learn.org
