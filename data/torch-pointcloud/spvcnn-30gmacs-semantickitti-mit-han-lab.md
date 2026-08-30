# torch-pointcloud/spvcnn-30gmacs.semantickitti.mit-han-lab

## Resumen

El modelo `spvcnn-30gmacs.semantickitti.mit-han-lab` es un modelo de segmentación semántica de nubes de puntos 3D basado en la arquitectura SPVCNN (Sparse Point-Voxel Convolution), desarrollado por el equipo de MIT Han Lab y convertido a la librería `torch-pointcloud`. Está entrenado sobre el dataset SemanticKITTI, un referente para escenas urbanas capturadas con LiDAR, y alcanza un mIoU de 60.7 en la partición de evaluación. Con solo 5,4 millones de parámetros, el modelo está diseñado para ser eficiente en cómputo y memoria, lo que lo hace adecuado para aplicaciones de percepción en tiempo real sobre hardware embebido o GPUs de gama media.

La relevancia de este modelo radica en su origen: SPVCNN fue propuesto en el contexto de búsqueda de arquitecturas neuronales (NAS) para 3D, combinando convoluciones dispersas sobre vóxeles con operaciones directas sobre puntos. Esta hibridación permite capturar tanto la estructura geométrica regular de una rejilla como la densidad irregular de los datos LiDAR, logrando un equilibrio entre precisión y velocidad que supera a alternativas como MinkowskiNet. La versión publicada aquí es un checkpoint concreto de esa familia, listo para usar con la librería `torch-pointcloud`.

El modelo se distribuye bajo licencia MIT y los pesos están en formato safetensors. Aunque no es un modelo de lenguaje, su inclusión en un blog técnico orientado a desarrolladores e investigadores se justifica por su utilidad en sistemas de conducción autónoma, robótica y análisis de escenas 3D, donde la segmentación punto a punto es un paso fundamental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SPVCNN (Sparse Point-Voxel Convolution) |
| Parametros totales | 5.455.891 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de nubes de puntos, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision 3D, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SPVCNN combina dos representaciones complementarias: una malla voxelizada dispersa donde se aplican convoluciones 3D eficientes (usando la librería `torchsparse`) y una rama que opera directamente sobre los puntos originales para refinar las predicciones. Esta arquitectura híbrida permite explotar la regularidad de la rejilla para acelerar el cómputo y, al mismo tiempo, preservar la información geométrica de alta resolución de los puntos individuales. El modelo concreto aquí presentado es el resultado de un proceso de búsqueda de arquitectura (NAS) que optimiza el equilibrio entre precisión y coste computacional, identificando una configuración con 30 GMACs (giga operaciones de multiplicación-acumulación) de coste.

El entrenamiento se realizó sobre el dataset SemanticKITTI, que contiene secuencias de escaneo LiDAR en entornos urbanos, con anotaciones semánticas para 19 clases (vehículos, peatones, edificios, vegetación, etc.). Los datos de entrenamiento corresponden a las secuencias 00-07 y 09-10, evaluándose en la secuencia 08, siguiendo el protocolo estándar del dataset. No se menciona el uso de técnicas de RLHF o DPO, que son propias de modelos de lenguaje; el entrenamiento es supervisado con pérdida de entropía cruzada sobre las etiquetas punto a punto. El checkpoint ha sido convertido desde el repositorio original `mit-han-lab/spvnas` a la librería `torch-pointcloud`, que unifica la interfaz de carga y uso.

## Capacidades

- Segmentación semántica de nubes de puntos LiDAR, asignando una clase a cada punto (19 clases predefinidas de SemanticKITTI).
- Extracción de características densas por punto: el modelo produce una representación de 48 dimensiones por punto, útil para tareas posteriores como detección de objetos o agrupamiento.
- Inferencia eficiente gracias a la arquitectura híbrida punto-vóxel, con un coste de 30 GMACs y 5,4 millones de parámetros.
- Soporte para clasificación personalizada: la API de `torch-pointcloud` permite reinicializar el clasificador final para adaptar el modelo a nuevos conjuntos de clases.
- Integración con el ecosistema PyTorch y con la librería `torch-pointcloud`, que facilita la carga de datos, transformaciones y collate.
- No incluye capacidades de generación de texto, tool calling, agentes ni procesamiento de lenguaje; es exclusivamente un modelo de percepción 3D.

## Casos de uso

- Percepción en conducción autónoma: el modelo segmenta en tiempo real los objetos y estructuras del entorno (vehículos, peatones, carreteras, señalización) a partir de datos LiDAR, proporcionando la entrada para planificación de trayectorias y evitación de obstáculos.
- Robótica móvil: robots de interior o exterior pueden utilizar la segmentación semántica para navegar en entornos no estructurados, distinguiendo superficies transitables de obstáculos o elementos dinámicos.
- Mapeo y digitalización de escenas urbanas: la clasificación punto a punto permite generar mapas semánticos tridimensionales de ciudades, útiles para planificación urbana, simulación o gestión de infraestructuras.
- Análisis de datos LiDAR en agricultura de precisión: la segmentación de vegetación, suelo y estructuras artificiales ayuda a monitorizar cultivos o inventariar masas forestales.
- Sistemas de seguridad y vigilancia: la detección de personas, vehículos u objetos en escenas 3D capturadas por sensores LiDAR fijos o móviles puede alimentar sistemas de alerta o seguimiento.
- Investigación en visión por computador 3D: sirve como modelo base para estudiar técnicas de compresión, cuantización o destilación de conocimiento en redes neuronales para nubes de puntos, gracias a su tamaño reducido y su arquitectura representativa.

## Benchmarks y rendimiento

El único resultado oficial publicado en la model card es el mIoU sobre SemanticKITTI, reportado como 60.7. Este valor se corresponde con la evaluación en la secuencia 08, siguiendo el protocolo del dataset. En el paper original (Tang et al., ECCV 2020) se indica que el modelo SPVNAS supera a MinkowskiNet en 3.3 puntos de mIoU, con una reducción de cómputo de 8 veces y una aceleración medida de 3 veces, aunque no se proporcionan los valores absolutos de MinkowskiNet en la información disponible.

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| SemanticKITTI | Segmentacion semantica de nubes de puntos | mIoU | 60.7 |

## Requisitos de hardware

- El modelo requiere GPU con soporte CUDA, ya que los kernels de `torchsparse` están implementados para GPU y no funcionan en CPU.
- Dado el tamaño reducido (5,4 millones de parámetros), la VRAM necesaria para inferencia es baja: se estima que cabe en GPUs con 2-4 GB, como una GTX 1650 o RTX 3050, aunque se recomienda al menos 4 GB para manejar lotes de datos.
- GPUs recomendadas: cualquier GPU NVIDIA moderna (serie 20, 30, 40 o superiores) con al menos 8 GB de VRAM para trabajar cómodamente con secuencias completas de LiDAR.
- El despliegue se realiza mediante PyTorch y la librería `torch-pointcloud`, junto con `torchsparse`. No se mencionan soportes para vLLM, Ollama o TGI, que son específicos de modelos de lenguaje.
- La latencia depende del número de puntos procesados; con 8192 puntos por muestra, la inferencia es prácticamente instantánea en una GPU moderna, aunque no se han publicado cifras concretas de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | mIoU (SemanticKITTI) | Coste computacional | Licencia |
|---|---|---|---|---|
| SPVCNN (este modelo) | 5,4 M | 60.7 | 30 GMACs | MIT |
| MinkowskiNet (referencia del paper) | no disponible | inferior en 3.3 puntos al SPVNAS | 8 veces mayor que SPVNAS | no disponible |
| PointNet++ (alternativa clásica) | no disponible | no disponible | mayor (procesa todos los puntos) | no disponible |

Los datos de MinkowskiNet provienen del paper original, donde se reporta que SPVNAS lo supera en 3.3 puntos de mIoU con una reducción de cómputo de 8x. No se dispone de valores absolutos de MinkowskiNet ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en SemanticKITTI, un dataset de conducción urbana; su rendimiento puede degradarse significativamente en otros dominios (interiores, entornos rurales, datos de sensores diferentes).
- La segmentación es a nivel de punto, por lo que no produce instancias separadas (no distingue entre dos coches contiguos), solo etiquetas semánticas.
- Requiere kernels GPU específicos (`torchsparse`), lo que limita su portabilidad a entornos sin CUDA y complica la compilación en versiones de PyTorch/CUDA no soportadas.
- No se han publicado análisis de sesgos ni estudios de robustez frente a condiciones adversas (lluvia, niebla, oclusión), por lo que su uso en producción debe validarse con datos propios.
- Aunque la licencia MIT permite uso comercial, el modelo depende de librerías de terceros (`torchsparse`, `torch-pointcloud`) que pueden tener licencias o requisitos adicionales.
- La mIoU de 60.7 es un valor moderado; para aplicaciones críticas de seguridad puede ser insuficiente sin postprocesado o fusión con otras modalidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/spvcnn-30gmacs.semantickitti.mit-han-lab
- Paper original (arXiv): https://arxiv.org/abs/2007.16100
- Proyecto SPVNAS (MIT Han Lab): https://hanlab.mit.edu/projects/spvnas
- Repositorio GitHub de SPVNAS: https://github.com/mit-han-lab/spvnas
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación de torch-pointcloud: https://pytorch-pointcloud.org/installation/
