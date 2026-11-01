# torch-pointcloud/minkunet34v2-w32.semantickitti.mmdet3d

## Resumen

MinkUNet34v2-w32 es un modelo de segmentación semántica de nubes de puntos LiDAR, concretamente una U-Net residual dispersa (sparse residual U-Net) implementada con convoluciones de Minkowski. Lo publica el proyecto torch-pointcloud (Arthur Dujardin) como conversión del checkpoint original de MMDetection3D al formato de su librería, con pesos en safetensors. Resuelve la tarea de asignar una clase semántica a cada punto de una escena 3D captada por LiDAR, con 19 clases de SemanticKITTI.

El modelo tiene 37,9 millones de parámetros, recibe 4 canales de entrada (coordenadas x, y, z e intensidad) y produce logits por punto sobre 19 clases. Su relevancia actual está en que permite usar un checkpoint de referencia de MMDetection3D dentro del ecosistema `torch-pointcloud`, con una API unificada de carga, transformación de datos y extracción de características, sin depender del stack completo de OpenMMLab.

No es un modelo de lenguaje: no procesa texto ni tiene ventana de contexto en el sentido habitual. Su "contexto" es la nube de puntos completa que se le pasa en una pasada, y su licencia Apache-2.0 facilita el uso comercial. Los resultados declarados por el autor son mIoU 70,2 y OA 92,34 sobre el split de validación de SemanticKITTI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MinkUNet34v2-w32: U-Net residual dispersa con convoluciones de Minkowski (sparse 3D convolutions) |
| Parametros totales | 37.900.083 (37,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; procesa nubes de puntos de tamaño variable) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no aplica; modelo de visión 3D, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (x, y, z, intensidad) |
| Clases de salida | 19 (SemanticKITTI) |
| Dimension de caracteristicas | 480 |
| Biblioteca | torch-pointcloud (requiere spconv compilado para torch/CUDA) |
| Tamano del repositorio | 0,2 GB |
| Hardware de inferencia | solo GPU (kernels GPU-only) |

## Arquitectura y entrenamiento

La arquitectura es una MinkUNet34v2 con ancho de features 32 (w32), es decir, una U-Net con encoder y decoder residuales construida sobre convoluciones dispersas de Minkowski. Las convoluciones de Minkowski operan únicamente sobre las posiciones ocupadas del voxel grid, lo que evita el coste computacional de convolucionar el espacio vacío, dominante en escenas LiDAR. El modelo recibe 4 canales por punto (coordenadas e intensidad), genera una representación de 480 dimensiones y clasifica cada punto en una de las 19 clases de SemanticKITTI.

El checkpoint se entrenó sobre el dataset SemanticKITTI, que contiene secuencias LiDAR de escenas de conducción urbana y de carretera anotadas a nivel de punto. La model card no detalla el número de épocas, la composición exacta del split, la función de pérdida ni si hubo aumentos de datos o refinamiento posterior; esos datos figuran en la configuración original de MMDetection3D, de la que se convirtió el modelo, pero no se reproducen en la información disponible. Tampoco se documenta ningún proceso de RLHF/DPO, algo que no aplica a este tipo de modelo. La innovación técnica relevante es la propia convolución de Minkowski (paper arXiv:1904.08755) y la conversión a una API de carga unificada con extracción de características (`forward_features`, `reset_classifier`).

## Capacidades

- Segmentación semántica por punto de nubes LiDAR en 19 clases de SemanticKITTI (vehículo, peatón, ciclista, carretera, acera, edificio, vegetación, etc.).
- Procesamiento de nubes de puntos dispersas de tamaño variable mediante convoluciones de Minkowski.
- Entrada multimodal a nivel de punto: coordenadas x, y, z e intensidad de retorno LiDAR.
- Extracción de características densas por punto (480 dimensiones) mediante `forward_features` o `reset_classifier(num_classes=0)`, reutilizables para tareas downstream.
- Inferencia por lotes con `collate` y transformaciones integradas en `torch-pointcloud`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo de texto.
- No dispone de modo "thinking", visión 2D, audio ni otras modalidades distintas de la nube de puntos 3D.

## Casos de uso

- Segmentación de escenas LiDAR en vehículos autónomos: el modelo clasifica cada punto de la nube en clases de SemanticKITTI, lo que permite separar carretera, vehículos y peatones para módulos de planificación y percepción. Es adecuado porque está entrenado exactamente en ese dominio y formato de sensor.
- Etiquetado automático (pre-anotación) de datasets LiDAR: se puede usar para generar etiquetas preliminares sobre nuevas capturas y reducir el trabajo manual de anotadores, revisando después las clases con mayor confusión.
- Detección de obstáculos y ocupación de vía: la segmentación por punto permite identificar regiones transitables y no transitables en tiempo real sobre la nube de puntos, útil en sistemas ADAS.
- Análisis de escenas urbanas para cartografía: extracción de edificios, vegetación, aceras y mobiliario urbano a partir de barridos LiDAR para actualizar mapas de alta definición.
- Segmentación de nubes de puntos en robótica móvil: integración del modelo en un pipeline ROS/ROS 2 para que un robot diferencial o cuadrúpedo distinga suelo, obstáculos y personas en interiores y exteriores.
- Investigación en percepción 3D: uso como baseline reproducible de MinkUNet sobre SemanticKITTI para comparar arquitecturas, funciones de pérdida o estrategias de aumento de datos, gracias a la API de `torch-pointcloud` y a la licencia Apache-2.0.
- Extracción de características para transferencia: las representaciones de 480 dimensiones por punto pueden alimentar cabezales ligeros para tareas como detección 3D, clustering de instancias o clasificación de escenas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| SemanticKITTI | point-cloud-segmentation | mIoU | 70,2 |
| SemanticKITTI | point-cloud-segmentation | OA | 92,34 |

No se han publicado en la información disponible resultados desglosados por clase (IoU por categoría), ni comparaciones con otros checkpoints en la misma model card. Tampoco se documentan latencias ni throughput medidos.

## Requisitos de hardware

- Inferencia exclusivamente en GPU: los kernels de `spconv` y las convoluciones de Minkowski del checkpoint son GPU-only, según la propia model card.
- VRAM estimada: no disponible de forma oficial. Con 37,9 M de parámetros en FP32, los pesos ocupan aproximadamente 150 MB; el consumo real depende del número de puntos por muestra y de la resolución del voxel grid, que no se documenta.
- GPU recomendadas: no disponible. Por tamaño de modelo, cualquier GPU con soporte CUDA y `spconv` compilado para la versión de torch debería poder ejecutarlo; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? Probablemente sí por tamaño de pesos, pero no hay confirmación oficial ni requisitos de VRAM publicados para el pipeline completo.
- Opciones de despliegue: `torch-pointcloud` con `spconv` (requiere compilación nativa compatible con torch y CUDA); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | mIoU (SemanticKITTI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MinkUNet34v2-w32 (este) | 37,9 M | 4 canales (xyz + intensidad) | 19 | 70,2 (declarado) | Apache-2.0 | HuggingFace, safetensors |
| MinkUNet original (MMDetection3D) | no disponible en la informacion | 4 canales | 19 | no disponible en la informacion | Apache-2.0 | GitHub open-mmlab |
| Otras alternativas (Cylinder3D, SPVCNN, etc.) | no disponible en la informacion | no disponible | 19 | no disponible en la informacion | no disponible | no disponible |

No se dispone en la información proporcionada de resultados comparables de otros modelos sobre SemanticKITTI, por lo que la comparativa cuantitativa queda limitada al dato declarado por el autor.

## Limitaciones y advertencias

- Modelo específico de dominio: entrenado solo en SemanticKITTI (escenas de conducción), por lo que su rendimiento puede degradarse en interiores, minería, agricultura u otros sensores y configuraciones LiDAR distintas.
- Solo 19 clases: no reconoce categorías fuera del etiquetado de SemanticKITTI; puntos de clases desconocidas se asignarán a alguna de las 19 existentes.
- Métricas no verificadas: mIoU 70,2 y OA 92,34 están declaradas por el autor con `verified: false`; no hay evaluación independiente publicada.
- Dependencia de `spconv`: requiere compilar una versión compatible con la versión de torch y CUDA, lo que complica el despliegue y la reproducibilidad en entornos cambiantes.
- Solo GPU: no hay soporte documentado de inferencia en CPU.
- Sin datos de sesgo: la model card no documenta análisis de sesgos por clase, condiciones meteorológicas, hora del día o densidad de tráfico.
- Riesgo de error en clases minoritarias: como en la mayoría de segmentadores LiDAR, peatones y ciclistas suelen tener menos puntos y peor IoU; no se publica el desglose por clase para cuantificarlo.
- Licencia Apache-2.0: permite uso comercial y modificación, pero exige conservar el aviso de copyright y la licencia; conviene revisar también las licencias de `torch-pointcloud` y `spconv`.
- Sin garantías de producción: no se documentan latencias, consumo de VRAM ni pruebas de robustez, por lo que cualquier despliegue en producción requiere validación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/minkunet34v2-w32.semantickitti.mmdet3d
- Paper de Minkowski Convolutional Neural Networks: https://arxiv.org/abs/1904.08755
- Repositorio de torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Checkpoint original en MMDetection3D: https://github.com/open-mmlab/mmdetection3d
- Dataset SemanticKITTI: http://semantic-kitti.org/
- Paper de SemanticKITTI: https://arxiv.org/abs/1904.01416
