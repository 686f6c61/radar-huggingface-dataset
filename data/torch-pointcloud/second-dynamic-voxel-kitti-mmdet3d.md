# torch-pointcloud/second-dynamic-voxel.kitti.mmdet3d

## Resumen

second-dynamic-voxel.kitti.mmdet3d es un checkpoint de deteccion de objetos 3D sobre nubes de puntos LiDAR, basado en la arquitectura SECOND (Sparsely Embedded Convolutional Detection) publicada por Yan, Mao y Li en 2018. El modelo ha sido convertido desde la implementacion de referencia de OpenMMLab en MMDetection3D y empaquetado para la libreria torch-pointcloud, mantenida por Arthur Dujardin. Detecta tres clases de objetos en escenas de conduccion autonoma: coche, peaton y ciclista.

Se trata de un modelo pequeno y especializado: 5,3 millones de parametros, 4 canales de entrada (coordenadas xyz mas intensidad de retorno) y 512 caracteristicas en el cuello de botella de la red. No es un modelo de lenguaje ni un modelo generativo; su unica tarea es la deteccion 3D en el dataset KITTI, el benchmark historico de referencia para percepcion en conduccion autonoma.

Su relevancia actual es la de un baseline reproducible y ligero: permite validar pipelines de voxelizacion, entrenamiento e inferencia en entornos PyTorch con spconv sin tener que reconstruir la conversion desde MMDetection3D. Es util como punto de partida para experimentos de percepcion 3D, no como modelo de produccion de ultima generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SECOND (detector 3D con convoluciones dispersas sobre vóxeles, tipo VoxelNet) |
| Parametros totales | 5.332.488 (5,3 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de percepcion 3D, no secuencial) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SECOND es un detector 3D de una etapa que transforma la nube de puntos LiDAR en una rejilla de vóxeles dispersos y aplica convoluciones 3D dispersas (sparse convolution) para extraer caracteristicas sin densificar el volumen, lo que reduce drasticamente el coste computacional y de memoria frente a aproximaciones densas. La red produce un mapa de caracteristicas 2D mediante un submanifold sparse convolutional network y una cabeza de deteccion anclada que regresiona cajas 3D (centro, dimensiones y orientacion) para las tres clases de KITTI. El checkpoint declara 512 canales de caracteristicas y 4 canales de entrada.

El entrenamiento se realizo sobre el dataset KITTI (Geiger, Lenz y Urtasun, CVPR 2012), el benchmark clasico de percepcion para conduccion autonoma. La model card no detalla el numero de tokens ni la composicion exacta del split, ni si hubo aumentos de datos especificos; solo indica el dataset y las metricas. El checkpoint es una conversion de los pesos de MMDetection3D, no un reentrenamiento desde cero, por lo que hereda el protocolo de entrenamiento de la implementacion original de OpenMMLab.

## Capacidades

- Deteccion de objetos 3D en nubes de puntos LiDAR con cajas orientadas (yaw) para tres clases: coche, peaton y ciclista.
- Extraccion de caracteristicas de 512 canales mediante `forward_features`, util para tareas posteriores de clasificacion, segmentacion o recuperacion sobre nubes de puntos.
- Procesamiento de muestras con coordenadas `pos` (xyz) e `intensity` (intensidad de retorno), con transformacion y colacion incluidas en la informacion del modelo (`info["transform"]`).
- Inferencia por lotes mediante `collate` con `batch_from="pos_voxel"`, pensada para pipelines de evaluacion sobre KITTI.
- No soporta tool calling, agentes, razonamiento multi-paso, vision 2D, audio ni capacidades multilingues: es un detector puramente geometrico.
- Requiere kernels GPU especificos de spconv; la model card indica que el modelo es `cuda().eval()` y que los kernels son solo para GPU.

## Casos de uso

- Baseline de percepcion 3D en investigacion: sirve como referencia reproducible para comparar nuevas arquitecturas de deteccion LiDAR sobre KITTI, ya que sus metricas estan declaradas y el checkpoint se carga con una sola llamada a `tp.create_model`.
- Validacion de pipelines de voxelizacion: permite comprobar que la conversion de nube de puntos a vóxeles dispersos, la colacion por lotes y la transformacion de entrada funcionan correctamente antes de escalar a modelos mayores.
- Extraccion de caracteristicas para tareas downstream: con `forward_features` se obtienen descriptores de 512 canales por vóxel que pueden alimentar clasificadores ligeros, modelos de segmentacion o sistemas de recuperacion de escenas.
- Prototipado de conduccion autonoma en entornos de laboratorio: deteccion de coches, peatones y ciclistas en secuencias KITTI para estudiar el comportamiento de un detector de una etapa con convoluciones dispersas.
- Docencia y formacion tecnica: su tamano reducido (5,3 M de parametros) y su licencia Apache-2.0 lo hacen adecuado para explicar deteccion 3D, anclas y convoluciones dispersas en cursos de vision por computador.
- Integracion en herramientas de anotacion asistida: el modelo puede preetiquetar cajas 3D en nuevas nubes de puntos con formato compatible, reduciendo el trabajo manual de anotadores en proyectos de datos LiDAR.
- Pruebas de regresion de infraestructura: al ser un checkpoint pequeno y con dependencias acotadas (spconv, PyTorch, CUDA), es util para verificar que una imagen de contenedor o un entorno de CI tiene las versiones correctas de kernels antes de desplegar modelos mas grandes.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, campo `verified: false`):

| Metrica | Dataset | Valor |
|---|---|---|
| mAP | KITTI | 65,23 |
| AP/Car | KITTI | 76,66 |
| AP/Cyclist | KITTI | 62,26 |
| AP/Pedestrian | KITTI | 56,78 |

No se han publicado en la informacion disponible resultados adicionales de latencia, throughput ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 5,3 M de parametros los pesos ocupan del orden de decenas de MB en fp32, pero el consumo real depende del numero de vóxeles y del tamano del lote, no solo del modelo.
- GPU recomendadas: cualquier GPU NVIDIA compatible con los kernels de spconv para la version de PyTorch y CUDA instalada; la model card no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo, pero la model card no lo confirma ni detalla requisitos minimos.
- Opciones de despliegue: la via documentada es la libreria `torch-pointcloud` con `spconv` compilado para la combinacion de PyTorch y CUDA del entorno. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI (ninguna de estas ultimas aplica a un detector 3D).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Dataset | mAP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| second-dynamic-voxel.kitti.mmdet3d | 5,3 M | Deteccion 3D LiDAR | KITTI | 65,23 | Apache-2.0 | HuggingFace (torch-pointcloud) |
| PointPillars (referencia MMDetection3D) | no disponible | Deteccion 3D LiDAR | KITTI | no disponible en esta ficha | Apache-2.0 | OpenMMLab |
| VoxelNet (referencia original) | no disponible | Deteccion 3D LiDAR | KITTI | no disponible en esta ficha | no disponible | Implementaciones de terceros |
| CenterPoint (referencia MMDetection3D) | no disponible | Deteccion 3D LiDAR | KITTI / nuScenes | no disponible en esta ficha | Apache-2.0 | OpenMMLab |

No se dispone de datos verificados de los modelos alternativos en la informacion proporcionada; la comparativa se limita a identificar alternativas de la misma categoria sin cifras contrastadas.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en deteccion 3D sobre KITTI; no generaliza a otros dominios sin reentrenamiento y no procesa texto, imagen 2D ni audio.
- Las metricas declaradas estan marcadas como no verificadas (`verified: false`); conviene reproducirlas antes de usarlas como referencia en publicaciones.
- Dependencia critica de `spconv`: requiere una compilacion que coincida exactamente con la version de PyTorch y CUDA, lo que complica el despliegue reproducible en entornos heterogeneos.
- Solo se documentan tres clases (coche, peaton, ciclista) y 4 canales de entrada; no cubre otras clases de trafico ni sensores adicionales como camaras o radar.
- Riesgo de sesgo hacia la distribucion de KITTI (escenas urbanas y rurales de una unica plataforma de captura), con posible degradacion en condiciones climaticas, densidad de puntos o sensores distintos.
- No se documentan sesgos demograficos ni de otro tipo, pero al ser un modelo de percepcion para conduccion autonoma cualquier fallo de deteccion tiene implicaciones de seguridad fisica.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia; el modelo original SECOND y KITTI tienen sus propias condiciones de citacion.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no opera sobre secuencias de texto.
- El repositorio tiene un tamano declarado de 0.0 GB y 18 descargas, lo que sugiere poca validacion comunitaria; no hay evidencia de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/second-dynamic-voxel.kitti.mmdet3d
- Paper SECOND: https://www.mdpi.com/1424-8220/18/10/3337
- Repositorio MMDetection3D: https://github.com/open-mmlab/mmdetection3d
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Guia de instalacion de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Dataset KITTI (paper CVPR 2012): https://www.cvlibs.net/datasets/kitti/
