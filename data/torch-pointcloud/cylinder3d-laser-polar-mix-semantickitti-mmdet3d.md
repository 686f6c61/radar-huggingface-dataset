# torch-pointcloud/cylinder3d-laser-polar-mix.semantickitti.mmdet3d

## Resumen

Cylinder3D es un modelo de segmentación semántica de nubes de puntos LiDAR basado en partición cilíndrica y convoluciones dispersas asimétricas, propuesto originalmente en el artículo "Cylindrical and Asymmetrical 3D Convolution Networks for LiDAR Segmentation" (CVPR 2021). Este checkpoint concreto, publicado por `torch-pointcloud`, es una conversión del modelo entrenado en MMDetection3D sobre el conjunto de datos SemanticKITTI, empaquetada en formato safetensors para su uso con la librería `torch-pointcloud`.

El modelo resuelve la tarea de asignar una clase semántica (19 categorías, como coche, peatón, carretera, edificio o vegetación) a cada punto de una nube LiDAR de escenas urbanas. Su innovación principal es sustituir la voxelización cartesiana habitual por una partición cilíndrica del espacio, que preserva mejor la densidad angular del sensor y reduce el desequilibrio entre puntos cercanos y lejanos. Sobre esa rejilla cilíndrica aplica convoluciones dispersas asimétricas para capturar contexto vertical y horizontal de forma eficiente.

Con 49,6 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto y ligero, pensado para integrarse en pipelines de percepción 3D en robótica y conducción autónoma. Declara un mIoU de 67,54 y una precisión global (OA) de 91,87 sobre el conjunto de validación de SemanticKITTI, según los datos aportados por el autor. Su licencia Apache-2.0 facilita el uso comercial, y su conversión desde MMDetection3D lo hace atractivo para quienes trabajan con el ecosistema OpenMMLab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cylinder3D (partición cilíndrica + convoluciones dispersas asimétricas 3D) |
| Parametros totales | 49.599.943 (49,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de nube de puntos, ejemplo de 8192 puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión 3D, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

Otros datos técnicos: canales de entrada 1, 19 clases de salida, 128 características por punto, dependencia de `spconv` compilado contra la versión de torch y CUDA del entorno.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Cylinder3D descrita por Zhu et al. (2021). La nube de puntos se proyecta sobre una rejilla cilíndrica que discretiza el espacio en coordenadas (radio, ángulo, altura), lo que mantiene una resolución angular uniforme independiente de la distancia al sensor. Sobre esa representación se aplican convoluciones dispersas 3D con kernels asimétricos, que descomponen la convolución en direcciones separadas para reducir el coste computacional y capturar estructura vertical (por ejemplo, postes y fachadas) y horizontal (superficie del suelo) de forma específica. La red produce una predicción por punto entre las 19 clases de SemanticKITTI.

Los detalles de entrenamiento (número de épocas, composición exacta del dataset, uso de augmentation o de funciones de pérdida específicas) no se detallan en la información proporcionada. Se sabe que el checkpoint se entrenó sobre SemanticKITTI, el benchmark de referencia para segmentación semántica LiDAR en entornos urbanos, y que se ha convertido desde el modelo original de MMDetection3D manteniendo los pesos. No se documenta en la información disponible si hubo ajuste fino posterior, RLHF ni técnicas de decodificación especulativa, algo que no aplica a este tipo de modelo.

## Capacidades

- Segmentación semántica densa de nubes de puntos LiDAR en 19 clases (coche, bicicleta, moto, camión, persona, ciclista, acera, carretera, edificio, valla, vegetación, tronco, terreno, poste, señal de tráfico y otras).
- Procesamiento de nubes de puntos de escenas urbanas con geometría cilíndrica, adecuado para sensores rotacionales tipo Velodyne o Hesai.
- Extracción de características por punto (128 dimensiones) mediante `forward_features`, útil para tareas posteriores como clustering, recuperación o clasificación.
- Posibilidad de reinicializar el clasificador (`reset_classifier`) para adaptar el modelo a un número distinto de clases.
- Inferencia solo en GPU (kernels dependientes de CUDA y `spconv`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente perceptivo 3D.
- No incluye modo thinking, visión 2D, audio ni generación de texto.

## Casos de uso

- Percepción en conducción autónoma: el modelo etiqueta cada punto de la nube LiDAR con su clase semántica, proporcionando a la pila de planificación un mapa de obstáculos, calzada y vegetación con mIoU de 67,54 sobre SemanticKITTI, suficiente como etapa de preprocesado en sistemas de asistencia a la conducción.
- Segmentación de escenas para robótica móvil: un robot terrestre o aéreo equipado con LiDAR puede usar el modelo para distinguir suelo transitable, obstáculos y estructuras, integrándolo en un pipeline ROS con inferencia por frame a través de `torch-pointcloud`.
- Etiquetado automático y preanotación de datasets: dado su OA de 91,87, el modelo sirve para generar etiquetas preliminares sobre nuevas nubes de puntos que luego se revisan manualmente, reduciendo el coste de anotación en proyectos de percepción 3D.
- Análisis de infraestructura urbana: la clase "edificio", "valla" y "poste" permite extraer inventarios de mobiliario urbano o evaluar el estado de fachadas a partir de levantamientos LiDAR móviles.
- Extracción de características para búsqueda y recuperación: usando `forward_features` se obtienen descriptores de 128 dimensiones por punto que pueden alimentar modelos de segmentación de instancias, clustering o sistemas de localización basados en descriptores.
- Investigación y benchmarking: al ser una conversión reproducible desde MMDetection3D con licencia Apache-2.0, es útil como línea base para comparar nuevas arquitecturas de segmentación LiDAR bajo las mismas condiciones de evaluación en SemanticKITTI.
- Prototipado rápido en robótica educativa: el tamaño reducido (49,6 M de parámetros, 0,2 GB) permite desplegarlo en GPUs de gama media para experimentos docentes o pruebas de concepto.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Modelo | Dataset | mIoU | OA | Verificado |
|---|---|---|---|---|
| cylinder3d-laser-polar-mix.semantickitti.mmdet3d | SemanticKITTI | 67,54 | 91,87 | No |

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla. Los valores corresponden al conjunto de validación de SemanticKITTI según la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 49,6 M de parámetros en FP32 los pesos ocupan aproximadamente 0,2 GB, pero la memoria real depende del número de puntos por frame, del tamaño de la rejilla cilíndrica y de las activaciones intermedias de `spconv`. En la práctica, una GPU con 8-12 GB es suficiente para lotes pequeños de nubes de puntos de decenas de miles de puntos.
- GPU recomendadas: cualquier GPU NVIDIA compatible con la versión de CUDA contra la que se compile `spconv`. Para investigación y producción se sugiere RTX 3090, RTX 4090, A100 o H100; para prototipado, RTX 3060/4060 o superiores.
- ¿Cabe en GPU de consumo? Sí, siempre que se compile `spconv` para la arquitectura correspondiente; el modelo es pequeño y la limitación principal es la compilación de kernels, no la VRAM.
- Opciones de despliegue: `torch-pointcloud` (interfaz `create_model`), PyTorch nativo y `spconv`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de nube de puntos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de benchmarks de modelos alternativos evaluados bajo las mismas condiciones, por lo que la comparación numérica no está disponible. A modo orientativo cualitativo, Cylinder3D se sitúa en la familia de segmentadores LiDAR basados en convoluciones dispersas 3D, junto a propuestas como SPVNAS, MinkowskiNet o Cylinder3D original, todos ellos evaluados habitualmente sobre SemanticKITTI. Para una comparación rigurosa se recomienda consultar el leaderboard oficial de SemanticKITTI, no incluido en esta ficha.

| Modelo | Parámetros | Contexto / entrada | mIoU SemanticKITTI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cylinder3d-laser-polar-mix (este) | 49,6 M | nube de puntos (ej. 8192 puntos) | 67,54 | Apache-2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo específico para nubes de puntos LiDAR de escenas urbanas; no es un modelo de lenguaje ni procesa texto, imágenes 2D, audio o vídeo.
- Entrenado exclusivamente sobre SemanticKITTI: puede degradarse en sensores con distinta configuración de haces, en entornos no urbanos (interior, off-road, industrial) o con condiciones meteorológicas adversas no representadas en el dataset.
- Riesgo de confusión entre clases geométricamente similares (por ejemplo, acera frente a carretera, o ciclista frente a peatón) en puntos lejanos o con oclusión.
- El modelo requiere GPU y la compilación de `spconv` contra la versión exacta de PyTorch y CUDA; esto complica el despliegue en entornos sin GPU o con drivers desactualizados.
- Los resultados de mIoU y OA están marcados como no verificados en la model card; conviene reproducirlos antes de usarlos como referencia en producción.
- No se documentan sesgos demográficos ni sociales, pero al ser un modelo perceptivo puede heredar los sesgos de representación del dataset SemanticKITTI (escenas de Karlsruhe, Alemania, con predominio de entornos urbanos europeos).
- Licencia Apache-2.0: permite uso comercial y modificaciones, siempre que se conserve el aviso de copyright y la atribución; no se han identificado restricciones adicionales en la información disponible.
- El número de descargas (18) y de likes (0) es muy bajo, por lo que la validación comunitaria del checkpoint es escasa.
- No se especifican límites de puntos por inferencia ni comportamiento con nubes vacías o mal formadas; es responsabilidad del usuario validar el preprocesado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/cylinder3d-laser-polar-mix.semantickitti.mmdet3d
- Paper Cylinder3D (arXiv): https://arxiv.org/abs/2011.10033
- Repositorio MMDetection3D: https://github.com/open-mmlab/mmdetection3d
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Dataset SemanticKITTI (paper, ICCV 2019): https://arxiv.org/abs/1904.01416
