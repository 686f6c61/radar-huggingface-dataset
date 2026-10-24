# torch-pointcloud/part-a2.kitti.mmdet3d

## Resumen

Part-A2 (`part-a2.kitti.mmdet3d`) es un detector de objetos 3D sobre nubes de puntos LiDAR, publicado por el proyecto torch-pointcloud como checkpoint listo para usar dentro de su libreria. Implementa la arquitectura Part-A2 descrita en el paper "From Points to Parts: 3D Object Detection from Point Cloud with Part-aware and Part-aggregation Network" (Shi et al., IEEE TPAMI 2020) y es una conversion de los pesos originales de OpenMMLab mmdetection3d. El modelo tiene 54,9 millones de parametros, recibe vóxeles con 4 canales (x, y, z, intensidad) y devuelve cajas 3D orientadas para tres clases: coche, peaton y ciclista.

La relevancia practica esta en que empaqueta un detector de dos etapas con reputacion consolidada en KITTI dentro de una API de PyTorch (`tp.create_model`), con pesos en safetensors y extraccion de caracteristicas de 512 canales. Sirve como base para percepcion 3D en automocion, robotica movil y pre-anotacion de datasets, sin necesidad de reconstruir el pipeline de mmdetection3d.

No es un modelo de lenguaje: no procesa texto, no tiene ventana de contexto conversacional ni capacidades de tool calling. Su dominio es exclusivamente geometrico (nubes de puntos), y declara mAP 68,34 en KITTI segun la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Part-A2: detector 3D de dos etapas con backbone de convolucion dispersa (voxel), etapa part-aware y cabeza de part-aggregation con RoI pooling |
| Parametros totales | 54.903.444 (54,9 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision 3D sobre nubes de puntos; sin ventana de texto) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplica / no disponible (no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |
| Canales de entrada | 4 (x, y, z, intensidad) |
| Clases de salida | 3 (Car, Pedestrian, Cyclist) |
| Dimension de caracteristicas | 512 |
| Dataset de entrenamiento | KITTI |
| Pipeline | object-detection (3D) |
| Libreria | torch-pointcloud (requiere spconv) |
| Origen de los pesos | Conversion desde open-mmlab/mmdetection3d |

## Arquitectura y entrenamiento

Part-A2 es un detector de dos etapas sobre vóxeles. La primera etapa (part-aware) aplica un backbone de convoluciones 3D dispersas para generar propuestas y, de forma conjunta, predice localizaciones de partes del objeto (superficie libre, superficie del objeto y centro), lo que aporta supervisión intra-objeto a la representacion. La segunda etapa (part-aggregation) refina cada propuesta agrupando caracteristicas de las regiones de interes mediante un RoI-aware point cloud pooling que respeta la estructura de partes aprendida en la etapa anterior. El checkpoint expuesto sigue esta pipeline con backbone de 512 canales y entrada de 4 canales por vóxel.

El modelo fue entrenado sobre KITTI, el benchmark clasico de conduccion autonoma con escenas LiDAR de tres clases anotadas. La model card no detalla el numero de tokens/puntos de entrenamiento, la composicion exacta del dataset, el numero de epocas ni si hubo tecnicas de refinamiento posteriores; esos datos figuran en el paper original y en la configuracion de mmdetection3d, no en la informacion disponible. El autor unicamente declara que los pesos proceden de la conversion de mmdetection3d (Apache-2.0) a la libreria torch-pointcloud, y que la inferencia requiere kernels de GPU (spconv) compilados contra la version concreta de torch y CUDA.

## Capacidades

- Deteccion de objetos 3D en nubes de puntos LiDAR: devuelve cajas 3D orientadas con clase, centro, dimensiones y angulo de giro para coche, peaton y ciclista.
- Deteccion en dos etapas: propuestas part-aware seguidas de refinamiento por part-aggregation, lo que mejora la localizacion frente a esquemas de una sola etapa.
- Aprendizaje y prediccion de localizaciones de partes del objeto, usadas como senal intermedia de la representacion.
- Extraccion de caracteristicas: `model.forward_features(...)` devuelve un vector de 512 canales por region/voxel, reutilizable para clasificacion, segmentacion o recuperacion de similitud.
- Preprocesado integrado: el objeto `info` devuelto por `create_model` incluye la transformacion necesaria para pasar de puntos crudos (pos + intensity) a vóxeles con `collate(..., batch_from="pos_voxel")`.
- Inferencia por lotes: la API acepta `voxel`, `pos_voxel`, `voxel_num_points` y `batch` con `collate`, lo que permite procesar varias muestras por pasada.
- Capacidades multilingues: no aplica.
- Tool calling, agentes, razonamiento multi-paso, vision 2D, audio o modo "thinking": no disponibles / no aplica.

## Casos de uso

- Percepcion en vehiculos autonomos y ADAS: el modelo consume la nube de puntos de un LiDAR rotacional y devuelve cajas 3D de coches, peatones y ciclistas, que se pueden proyectar al plano del vehículo para planificacion de trayectorias y frenada de emergencia. Es adecuado porque su naturaleza de dos etapas prioriza calidad de localizacion sobre latencia minima.
- Pre-anotacion de datasets LiDAR: generar propuestas automaticas antes de la revision humana reduce el coste de etiquetado en proyectos con miles de frames; la salida se puede volcar a formato KITTI y corregir manualmente en herramientas como CVAT o SUSTechPOINTS.
- Seguridad de usuarios vulnerables en entornos urbanos: el modelo tiene clases explicitas de peaton y ciclista, lo que permite desplegar alertas en intersecciones instrumentadas con LiDAR y analizar trayectorias de usuarios vulnerables.
- Robotica movil y AGV en interiores industriales: con la nube de puntos de un LiDAR 3D embarcado, se pueden detectar obstaculos y personas para navegacion segura; el modelo es ligero (54,9 M de parametros) y cabe en GPUs embarcadas tipo Jetson o RTX de gama media.
- Analisis de trafico y aforo en infraestructuras: con LiDAR estatico en un poste, el modelo permite contar vehiculos, peatones y ciclistas por franja horaria sin depender de camaras ni de datos personales identificables.
- Extraccion de caracteristicas para modelos downstream: usar `forward_features` para obtener descriptores de 512 canales y entrenar clasificadores o cabezas de segmentacion especificas del dominio con un coste de entrenamiento mucho menor que partir de cero.
- Baseline academico y reproduccion de resultados: sirve para replicar cifras de Part-A2 en KITTI dentro de un entorno PyTorch moderno, y como referencia contra la que medir detectores mas recientes.
- Validacion de pipelines de percepcion: al ser un checkpoint deterministico y ligero, es util como componente de pruebas de regresion en CI para verificar que el preprocesado de voxelizacion no se rompe entre versiones.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (todos con `verified: false`):

| Metrica | Dataset | Valor |
|---|---|---|
| mAP | KITTI | 68,34 |
| AP / Car | KITTI | 79,03 |
| AP / Pedestrian | KITTI | 55,28 |
| AP / Cyclist | KITTI | 70,70 |

No se han publicado en la informacion disponible la dificultad del split (facil, moderado o dificil), el umbral de IoU, si las metricas son 3D o BEV, ni resultados de latencia o throughput. No se deben asumir como directamente comparables con otras tablas de KITTI sin verificar esas condiciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,22 GB solo para los pesos en FP32 (54,9 M de parametros a 4 bytes); con activaciones, voxelizacion y espacio de trabajo de spconv, el consumo realista se situa en el rango de 1 a 3 GB, dependiendo del numero de puntos y del tamano de vóxel configurado.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA y soporte de spconv. Para desarrollo, RTX 3060/4060 o superiores; para produccion con lotes grandes, A100 o H100; una RTX 4090 o L4 es sobrada para inferencia en tiempo real.
- Cabe en GPU de consumo: si. El limite practico no es el tamano del modelo sino la compilacion de spconv contra la version de torch y CUDA instalada, y la memoria consumida por la voxelizacion de nubes densas.
- Despliegue: requiere PyTorch, `torch-pointcloud` y `spconv` compilado a medida (ver guia de instalacion de pytorch-pointcloud.org). No es compatible con vLLM, TGI, llama.cpp ni Ollama, que estan orientados a modelos de lenguaje. El despliegue tipico es un servicio Python con PyTorch, o exportacion a TorchScript/ONNX si el soporte de spconv lo permite (no confirmado en la informacion disponible).
- Inferencia solo en GPU: la model card indica explicitamente que los kernels son GPU-only, por lo que no hay ruta de ejecucion en CPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Part-A2 (este modelo) | Dos etapas, voxel part-aware | 54,9 M | Nube de puntos LiDAR, 4 canales | Apache-2.0 | Checkpoint en HF, via torch-pointcloud |
| PointPillars | Una etapa, pilares | No disponible en la informacion | Nube de puntos LiDAR | Apache-2.0 en mmdetection3d (no verificado aqui) | Implementado en mmdetection3d |
| SECOND | Una etapa, voxel disperso | No disponible en la informacion | Nube de puntos LiDAR | Apache-2.0 en mmdetection3d (no verificado aqui) | Implementado en mmdetection3d |
| PV-RCNN | Dos etapas, voxel + puntos | No disponible en la informacion | Nube de puntos LiDAR | Apache-2.0 en mmdetection3d (no verificado aqui) | Implementado en mmdetection3d |

No se dispone en la informacion proporcionada de cifras de parametros, mAP ni requisitos de contexto de las alternativas, por lo que no se incluye una comparacion numerica de rendimiento. La diferencia cualitativa conocida es el esquema de dos etapas con supervisacion de partes, que prioriza precision de localizacion frente a los detectores de una sola etapa.

## Limitaciones y advertencias

- Dominio restringido: entrenado solo en KITTI (escenas de conduccion alemana), con tres clases. El rendimiento fuera de ese dominio (LiDAR distinto, densidad de puntos diferente, entornos industriales, otros paises) no esta garantizado ni documentado.
- Metricas no verificadas: los valores de la model card tienen `verified: false` y no se especifican dificultad ni umbral de IoU; no deben presentarse como resultados de benchmark confirmados.
- Dependencia critica de spconv: la instalacion falla si la compilacion de spconv no coincide con la version de torch y CUDA; es la principal fuente de friccion en produccion y complica el empaquetado en contenedores.
- Solo GPU: no hay ruta de inferencia en CPU, lo que impide desplegar en entornos sin CUDA.
- Sensibilidad al preprocesado: el rendimiento depende del rango de vóxeles, el tamano de vóxel, el numero maximo de puntos y el sistema de coordenadas; cambios en la calibracion o en la transformacion a vóxeles degradan las detecciones sin aviso.
- Falsos positivos y negativos en escenas densas o con oclusiones: la clase peaton es la mas debil (AP 55,28), por lo que no es recomendable como unico sistema de seguridad para usuarios vulnerables.
- Sin calibracion de incertidumbre: las cajas no incorporan puntuaciones calibradas para decision de riesgo; hay que ajustar umbrales con datos propios.
- Sin capacidades de lenguaje, dialogo, tool calling ni razonamiento multi-paso.
- Licencia: los pesos y el codigo se distribuyen bajo Apache-2.0, lo que permite uso comercial con atribucion y conservacion del aviso de licencia; el dataset KITTI tiene sus propias condiciones de uso, que hay que respetar si se redistribuyen datos o modelos derivados.
- Trazabilidad: al ser una conversion de mmdetection3d, conviene conservar la atribucion a OpenMMLab y citar el paper original en publicaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/part-a2.kitti.mmdet3d
- Paper Part-A2 (arXiv): https://arxiv.org/abs/1907.03670
- Repositorio torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentacion y guia de instalacion de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Repositorio mmdetection3d (origen de los pesos): https://github.com/open-mmlab/mmdetection3d
- DOI de PyTorch PointCloud (Zenodo): https://doi.org/10.5281/zenodo.22159632
