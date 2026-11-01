# torch-pointcloud/minkunet34-w32-minkowski.semantickitti.mmdet3d

## Resumen

MinkUNet34-W32 es un modelo de segmentación semántica de nubes de puntos LiDAR, implementado como una U-Net residual con convoluciones dispersas de Minkowski. Lo publica el proyecto torch-pointcloud (Arthur Dujardin) como conversión del checkpoint original de MMDetection3D, lo que permite cargarlo directamente con la librería `torch-pointcloud` en lugar de depender del ecosistema OpenMMLab completo. El modelo resuelve la asignación de una clase semántica a cada punto de una escena LiDAR, una tarea central en percepción para conducción autónoma y robótica móvil.

La arquitectura sigue el diseño MinkUNet propuesto en el artículo "4D Spatio-Temporal ConvNets" (Choy et al., CVPR 2019): un backbone tipo ResNet-34 adaptado a convoluciones dispersas sobre vóxeles, con 96 canales base y anchura 32 en el primer nivel. El checkpoint tiene 37,9 millones de parámetros, recibe 4 canales de entrada (coordenadas xyz más intensidad) y predice 19 clases, entrenado sobre el dataset SemanticKITTI.

Su relevancia práctica es doble: por un lado ofrece un baseline consolidado y reproducible para segmentación LiDAR con un mIoU de 69,21 y una exactitud global de 92,36 sobre SemanticKITTI; por otro, su empaquetado en safetensors y su integración en `torch-pointcloud` simplifican el despliegue y la extracción de características en pipelines propios. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MinkUNet34-W32 (U-Net residual con convoluciones dispersas de Minkowski, backbone tipo ResNet-34) |
| Parametros totales | 37.892.787 (37,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre nubes de puntos de tamaño variable) |
| Tipos de cuantizacion | no disponible (checkpoint en safetensors de precisión nativa; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (xyz + intensidad) |
| Clases de salida | 19 |
| Canales de caracteristicas | 96 |
| Dataset de entrenamiento | SemanticKITTI |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es una MinkUNet, es decir, una U-Net con conexiones residuales en la que las convoluciones 3D densas se sustituyen por convoluciones dispersas de Minkowski. Estas operaciones se aplican únicamente sobre los vóxeles ocupados, de modo que el coste computacional escala con el número de puntos y no con el volumen del espacio voxelizado. La variante W32 fija la anchura del primer nivel en 32 canales y emplea 96 canales de características base, con un encoder de tipo ResNet-34 y un decoder simétrico con skip connections.

El entrenamiento se realiza sobre SemanticKITTI, el benchmark de segmentación semántica de secuencias LiDAR de KITTI, con 19 clases evaluables. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos o ajuste fino adicional; únicamente declara los resultados finales. El checkpoint se ha convertido desde MMDetection3D (Apache-2.0) y se distribuye a través de la librería `torch-pointcloud`, que requiere `spconv` compilado contra la versión de PyTorch y CUDA del entorno de ejecución.

## Capacidades

- Segmentación semántica densa de nubes de puntos LiDAR en 19 clases (vehículo, peatón, ciclista, carretera, acera, edificio, vegetación, etc.).
- Procesamiento de nubes de puntos de tamaño variable mediante estructuras dispersas, sin necesidad de voxelizar de forma densa.
- Extracción de características por punto: `forward_features` devuelve un vector de 96 dimensiones por punto, útil para tareas downstream (clustering, detección, recuperación).
- Clasificación por punto a partir de coordenadas xyz e intensidad; no requiere imágenes ni datos multimodales.
- Operación exclusiva en GPU, ya que los kernels de `spconv` no tienen implementación CPU funcional en este flujo.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades lingüísticas: es un modelo puramente perceptivo 3D.

## Casos de uso

- Percepción en conducción autónoma: el modelo etiqueta cada punto de un barrido LiDAR con su clase semántica, lo que permite construir mapas de ocupación y alimentar módulos de planificación de trayectorias con información de carretera, acera y obstáculos.
- Anotación automática de datasets: dado su mIoU de 69,21 sobre SemanticKITTI, puede emplearse para preetiquetar nubes de puntos y reducir el coste de anotación manual, con revisión humana posterior.
- Robótica móvil en exteriores: integrado en la pila de percepción de un robot, distingue suelo transitable (carretera, acera) de vegetación o edificios, lo que facilita la navegación segura en entornos urbanos y semiurbanos.
- Extracción de características para modelos downstream: usando `forward_features` se obtienen embeddings de 96 dimensiones por punto que pueden alimentar clasificadores ligeros, clustering o modelos de detección de objetos 3D.
- Análisis de escenas urbanas y gemelos digitales: la segmentación permite separar edificios, vegetación, vehículos y mobiliario urbano en levantamientos LiDAR para inventario o planificación.
- Control de calidad en pipelines de datos LiDAR: detectar puntos anómalos o clases mal asignadas comparando la predicción del modelo con anotaciones existentes en grandes volúmenes de datos.
- Investigación y baselines reproducibles: sirve como referencia para comparar nuevas arquitecturas de segmentación LiDAR bajo la misma configuración de evaluación en SemanticKITTI.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Dataset | Tarea | Metrica | Valor | Verificado |
|---|---|---|---|---|
| SemanticKITTI | Segmentacion semantica de nubes de puntos | mIoU | 69,21 | No |
| SemanticKITTI | Segmentacion semantica de nubes de puntos | OA (exactitud global) | 92,36 | No |

No se han publicado en la información disponible resultados desagregados por clase ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 37,9 M de parámetros, los pesos ocupan aproximadamente 150 MB en FP32 y unos 76 MB en FP16; el consumo real depende del número de puntos de la escena y de la memoria intermedia de las estructuras dispersas, que suele dominar el uso total.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA compatible con la compilación de `spconv`; se recomienda al menos 8 GB de VRAM para escenas LiDAR típicas de SemanticKITTI.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4070 o superiores, siempre que la versión de `spconv` esté compilada contra la CUDA y PyTorch instalados.
- Opciones de despliegue: la vía documentada es la librería `torch-pointcloud` con `spconv`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Dataset | mIoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| MinkUNet34-W32 (este modelo) | 37,9 M | 4 canales | 19 | SemanticKITTI | 69,21 | Apache-2.0 | HuggingFace (torch-pointcloud) |
| Cylinder3D | no disponible | no disponible | 19 | SemanticKITTI | no disponible | no disponible | no disponible |
| SPVCNN | no disponible | no disponible | 19 | SemanticKITTI | no disponible | no disponible | no disponible |

No se dispone de datos verificados de otros modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no puede completarse.

## Limitaciones y advertencias

- Los resultados de mIoU y OA están declarados por el autor y marcados como no verificados; conviene reproducirlos antes de usarlos como referencia en producción.
- El modelo está entrenado exclusivamente sobre SemanticKITTI, por lo que su rendimiento puede degradarse en dominios distintos (LiDAR de otros sensores, entornos interiores, condiciones meteorológicas no representadas).
- Requiere GPU y una compilación de `spconv` alineada con la versión de PyTorch y CUDA; esto complica el despliegue y la portabilidad entre entornos.
- No procesa texto ni imágenes; no debe emplearse para tareas lingüísticas o multimodales.
- Riesgo de confusión entre clases visualmente próximas (por ejemplo, tipos de vegetación o mobiliario urbano), habitual en segmentación LiDAR con 19 clases.
- La model card no documenta sesgos específicos ni análisis de robustez frente a oclusiones, lluvia o sensores con distinta densidad de puntos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo deriva de MMDetection3D y del artículo de Minkowski, cuyas condiciones conviene revisar si se redistribuye.
- No se documentan variantes cuantizadas ni optimizaciones para inferencia de baja latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/minkunet34-w32-minkowski.semantickitti.mmdet3d
- Paper de Minkowski Convolutional Neural Networks: https://arxiv.org/abs/1904.08755
- Repositorio de torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Repositorio de MMDetection3D: https://github.com/open-mmlab/mmdetection3d
- Dataset SemanticKITTI: http://semantic-kitti.org/
