# torch-pointcloud/second-iou.kitti.openpcdet

## Resumen

SECOND (Sparsely Embedded Convolutional Detection) es un detector de objetos 3D sobre nubes de puntos LiDAR. Este checkpoint concreto, `torch-pointcloud/second-iou.kitti.openpcdet`, es una conversión del modelo original de OpenPCDet al formato de la librería `torch-pointcloud`, publicada por el autor de dicha librería (Arthur Dujardin). El modelo resuelve la tarea de detección 3D de coches, peatones y ciclistas a partir de vóxeles generados desde nubes de puntos, y es relevante porque ofrece un baseline clásico y ligero (11,9 M de parámetros) para pipelines de percepción en conducción autónoma y robótica.

La arquitectura es una red convolucional dispersa (sparse convolutional) sobre vóxeles, no un transformer ni un modelo de lenguaje: no genera texto ni procesa instrucciones. Su entrada son nubes de puntos con 4 canales (coordenadas XYZ más intensidad) y su salida son cajas 3D con clase y orientación. El contexto, en el sentido de ventana de tokens, no aplica; el equivalente es el número de puntos y el rango de vóxelización configurado en el transform asociado al checkpoint.

El modelo se entrenó sobre el dataset KITTI y declara métricas de mAP y AP por clase en la model card. Su licencia Apache-2.0 y su reducido tamaño lo hacen adecuado para prototipado, investigación y despliegue en GPUs de gama media, aunque requiere compilar `spconv` con la versión de PyTorch y CUDA correctas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SECOND (sparse convolutional voxel detector) |
| Parametros totales | 11.955.977 (11,9 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de nube de puntos) |
| Tipos de cuantizacion | no disponible (checkpoint en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (XYZ + intensidad) |
| Clases | 3 (Car, Pedestrian, Cyclist) |
| Dimension de features | 512 |
| Dataset de entrenamiento | KITTI |
| Libreria | torch-pointcloud |
| Dependencia adicional | spconv (compilacion acorde a torch y CUDA) |

## Arquitectura y entrenamiento

SECOND es una red de detección 3D que voxeliza la nube de puntos LiDAR y aplica convoluciones dispersas (sparse convolutions) para extraer features sin densificar el volumen, lo que reduce coste computacional y memoria frente a enfoques densos. La cabeza de detección predice cajas 3D con clase y orientación para las tres categorías de KITTI. El checkpoint expone `forward_features` con 512 canales, útil para extracción de representaciones intermedias.

El modelo se entrenó sobre KITTI, el benchmark clásico de percepción para conducción autónoma (Geiger et al., CVPR 2012). La model card no detalla el número de tokens ni la composición exacta del dataset, ni si hubo etapas de refinamiento posteriores al entrenamiento supervisado; esa información no está disponible. La conversión procede de OpenPCDet (Apache-2.0) y el paper de referencia es Yan, Mao y Li (Sensors, 2018).

## Capacidades

- Detección de objetos 3D en nubes de puntos LiDAR: coches, peatones y ciclistas.
- Predicción de cajas 3D con clase y orientación a partir de vóxeles.
- Extracción de features de 512 canales mediante `forward_features`, reutilizable en tareas downstream (clasificación de regiones, segmentación, embeddings de escena).
- Procesamiento de nubes de puntos con 4 canales de entrada (XYZ + intensidad).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión 2D genérica, audio ni otras modalidades.

## Casos de uso

- Percepción en conducción autónoma: detección de coches, peatones y ciclistas en escenas KITTI o similares para alimentar módulos de planificación y frenado de emergencia; el modelo está entrenado específicamente para estas tres clases.
- Baseline de investigación en detección 3D: comparar nuevas arquitecturas (PointPillars, VoxelNet, CenterPoint) contra un SECOND de referencia con métricas públicas en KITTI.
- Extracción de embeddings de escena: usar `forward_features` para obtener representaciones de 512 canales y entrenar cabezas ligeras para tareas como clasificación de escenas o detección de anomalías en entornos LiDAR.
- Robótica móvil y AGVs: detección de obstáculos y personas en entornos industriales o logísticos con sensores LiDAR de 64 haces, aprovechando el bajo coste computacional del modelo.
- Prototipado rápido en GPUs de consumo: validar pipelines de percepción en una RTX 3090 o 4090 antes de escalar a modelos mayores, gracias a sus 11,9 M de parámetros.
- Anotación asistida de datasets: pre-etiquetar nubes de puntos con cajas 3D y revisar manualmente, reduciendo el coste de anotación en proyectos de percepción.
- Vehículos autónomos a escala de laboratorio: integración en plataformas tipo KITTI o simuladores para pruebas de extremo a extremo con un detector ligero y de licencia permisiva.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| mAP | 68,71 |
| AP/Car | 79,09 |
| AP/Pedestrian | 55,75 |
| AP/Cyclist | 71,31 |

Dataset: KITTI. Tarea: detección de objetos 3D. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 11,9 M de parámetros y vóxeles dispersos, el consumo es moderado (del orden de pocos GB, dependiendo del número de puntos y del rango de vóxelización).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA compatible con `spconv`; una RTX 3090, RTX 4090, A100 o H100 son suficientes y sobradas para este modelo.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1660, RTX 2060 y superiores, siempre que la compilación de `spconv` sea compatible con la versión de CUDA.
- El modelo es GPU-only según la model card ("GPU-only kernels"); no se documenta inferencia en CPU.
- Opciones de despliegue: `torch-pointcloud` con `spconv`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP KITTI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SECOND (este checkpoint) | 11,9 M | Nube de puntos, 4 canales | 68,71 | Apache-2.0 | Hugging Face (torch-pointcloud) |
| PointPillars | no disponible | Nube de puntos (pilares) | no disponible | Apache-2.0 (OpenPCDet) | OpenPCDet |
| VoxelNet | no disponible | Nube de puntos (vóxeles) | no disponible | MIT (implementaciones) | Repos académicos |
| CenterPoint | no disponible | Nube de puntos (center-based) | no disponible | Apache-2.0 (OpenPCDet) | OpenPCDet |

No se dispone de métricas comparables verificadas para las alternativas en la información proporcionada; los valores de mAP de otros modelos deben consultarse en sus respectivas model cards o papers.

## Limitaciones y advertencias

- Entrenado exclusivamente en KITTI: puede degradarse en dominios distintos (sensores, climatología, densidad de puntos, ciudades).
- Solo detecta tres clases (Car, Pedestrian, Cyclist); no cubre camiones, señales, semáforos ni otros objetos.
- Requiere compilar `spconv` con la versión exacta de PyTorch y CUDA; una compilación incorrecta impide la ejecución.
- Inferencia GPU-only: no se documenta soporte en CPU.
- Riesgo de falsos negativos en objetos ocluidos o lejanos, habitual en detectores LiDAR de una sola etapa.
- Las métricas declaradas no están verificadas de forma independiente (`verified: false`).
- Licencia Apache-2.0: permite uso comercial con atribución y sin garantías; conviene revisar las licencias de las dependencias (`spconv`, `torch-pointcloud`).
- No es un modelo de lenguaje: no debe usarse para generación de texto, razonamiento, agentes ni tareas NLP.
- No se documentan sesgos específicos; los sesgos potenciales provienen de la distribución de KITTI (escenas urbanas y rurales de Alemania).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/second-iou.kitti.openpcdet
- Paper SECOND: https://www.mdpi.com/1424-8220/18/10/3337
- OpenPCDet (origen del checkpoint): https://github.com/open-mmlab/OpenPCDet
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentacion de instalacion: https://pytorch-pointcloud.org/latest/installation/
- Dataset KITTI: https://www.cvlibs.net/datasets/kitti/
