# torch-pointcloud/transfusion-lidar.nuscenes.openpcdet

## Resumen

TransFusion-L es un detector de objetos 3D para nubes de puntos LiDAR basado en una arquitectura transformer con cabecera de consultas (query head) sobre un mapa BEV (Bird's Eye View). Este checkpoint concreto, publicado por el autor `torch-pointcloud`, es una conversión del modelo original de OpenPCDet (open-mmlab) al formato de la librería PyTorch PointCloud, y está entrenado sobre el dataset nuScenes para la tarea de detección de objetos 3D en 10 clases.

El modelo resuelve el problema de localizar y clasificar objetos (vehículos, peatones, ciclistas, etc.) en escenas de conducción autónoma a partir de datos LiDAR. Frente a detectores convolucionales clásicos, TransFusion introduce un mecanismo de atención que permite que las consultas del transformer se adapten a la distribución espacial de los objetos, lo que mejora la robustez en detecciones con oclusiones o puntos dispersos.

Es relevante ahora porque ofrece un checkpoint ligero (8,3 millones de parámetros) y de licencia permisiva (Apache-2.0) que se puede cargar directamente con `torch-pointcloud`, facilitando la experimentación y el despliegue en pipelines de percepción 3D sin necesidad de reproducir el entrenamiento original desde OpenPCDet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TransFusion-L (detector LiDAR con cabecera transformer sobre mapa BEV) |
| Parametros totales | 8.315.854 (8,3 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada por nube de puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de percepcion 3D, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

Otros datos tecnicos declarados por el autor: canales de entrada 5, 10 clases, 512 caracteristicas (features). Requiere `spconv` compilado contra la version de torch y CUDA correspondiente. El repositorio ocupa 0.0 GB segun HuggingFace (checkpoint de pequeno tamano).

## Arquitectura y entrenamiento

TransFusion-L emplea un backbone de extraccion de caracteristicas sobre vóxeles de la nube de puntos que proyecta a un mapa BEV, sobre el que se aplica una cabeza transformer con consultas aprendidas. Cada consulta atiende al mapa BEV para predecir centro, dimensiones, orientacion y clase de los objetos. La variante "L" (LiDAR-only) prescinde de la rama de camara del modelo original, que en el paper combinaba LiDAR y camara mediante fusion con transformers.

El checkpoint esta entrenado sobre el dataset nuScenes (Caesar et al., CVPR 2020), que contiene escenas de conduccion en Boston y Singapur con anotaciones 3D en 10 clases. La model card no detalla el numero de tokens, la composicion exacta del dataset ni si se aplico RLHF/DPO (no aplica en este dominio). La innovacion tecnica destacable es el uso de atencion por consultas para manejar la distribucion no uniforme de objetos en el espacio BEV, descrita en el paper TransFusion (Bai et al., CVPR 2022, arXiv:2203.11496). El modelo se ha convertido desde OpenPCDet manteniendo la arquitectura y los pesos, y expone `forward_features` para extraer las 512 caracteristicas del backbone.

## Capacidades

- Deteccion de objetos 3D en nubes de puntos LiDAR: prediccion de cajas 3D (centro, dimensiones, orientacion) y clase para 10 categorias de nuScenes.
- Entrada multimodal de puntos: posicion (3 canales), intensidad y timestamp (5 canales en total).
- Extraccion de caracteristicas del backbone mediante `forward_features` (512 canales), reutilizable para tareas aguas abajo.
- Procesamiento por lotes (`collate`) y ejecucion en GPU con kernels especializados (`spconv`).
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente de percepcion 3D.
- No incluye modo thinking, vision 2D, audio ni generacion de texto.

## Casos de uso

- Percepcion para conduccion autonoma: el modelo detecta vehiculos, peatones y ciclistas en escenas nuScenes, adecuado como modulo de deteccion 3D en stacks de planificacion y control.
- Anotacion automatica de datos LiDAR: pre-etiquetar nubes de puntos para acelerar el etiquetado humano en pipelines de datos de conduccion.
- Investigacion en deteccion 3D: punto de partida reproducible (Apache-2.0) para comparar arquitecturas transformer frente a detectores convolucionales sobre nuScenes.
- Extraccion de caracteristicas para tareas aguas abajo: usar `forward_features` como encoder de nubes de puntos para clasificacion de escenas, segmentacion o tracking.
- Robotica movil y AGV: deteccion de obstaculos en entornos estructurados con LiDAR, aprovechando el bajo numero de parametros (8,3 M) para despliegue en hardware limitado.
- Validacion de pipelines de conversion: servir como referencia para verificar la integracion de OpenPCDet con `torch-pointcloud` y `spconv` en un entorno de produccion.
- Prototipado rapido en cuadernos: cargar el checkpoint con `tp.create_model(..., pretrained=True)` y ejecutar inferencia sobre muestras sinteticas o reales sin reentrenar.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Dataset | Valor |
|---|---|---|
| mAP | nuScenes | 65,32 |
| NDS | nuScenes | 69,71 |

No se han publicado en la informacion disponible resultados adicionales (por clase, por rango de distancia ni comparativas oficiales con otros modelos).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 8,3 M de parametros el checkpoint es muy ligero, pero el consumo depende del numero de vóxeles y del tamano de la nube de entrada, no solo de los pesos.
- GPU recomendadas: no especificadas por el autor; el modelo requiere GPU con kernels `spconv` compatibles con la version de torch y CUDA instalada.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras consumer; el requisito critico es compilar `spconv` para la arquitectura CUDA correspondiente.
- Opciones de despliegue: `torch-pointcloud` (libreria nativa del checkpoint), con dependencia de `spconv`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este dominio).
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Instalacion: `pip install torch-pointcloud` mas `spconv` compilado segun la guia oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | mAP | NDS | Licencia |
|---|---|---|---|---|---|
| transfusion-lidar.nuscenes.openpcdet | 8,3 M | nuScenes | 65,32 | 69,71 | Apache-2.0 |
| TransFusion (original, LiDAR+camara) | no disponible | nuScenes | no disponible | no disponible | Apache-2.0 (OpenPCDet) |
| Otros detectores de OpenPCDet (p. ej. PointPillars, CenterPoint) | no disponible | nuScenes | no disponible | no disponible | Apache-2.0 |

No se dispone en la informacion proporcionada de cifras de benchmarks de los modelos alternativos para una comparacion cuantitativa; los valores de la tabla para alternativas figuran como "no disponible".

## Limitaciones y advertencias

- Sesgos: el modelo esta entrenado exclusivamente en nuScenes (Boston y Singapur); su rendimiento puede degradarse en otras ciudades, sensores o condiciones meteorologicas no representadas.
- Alucinacion: como todo detector, puede generar falsos positivos en regiones con puntos dispersos o ruido, y falsos negativos en objetos muy ocluidos.
- Contexto e idioma: no aplica; es un modelo de percepcion 3D, no linguistico.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo deriva de OpenPCDet (tambien Apache-2.0); conviene revisar las licencias de `spconv` y de las dependencias de la cadena de compilacion.
- Dependencia de `spconv`: la compilacion debe coincidir con torch y CUDA; un desajuste impide la ejecucion. El modelo es GPU-only segun la model card.
- Metricas no verificadas: los valores de mAP y NDS estan marcados como `verified: false`; no se han validado de forma independiente en la informacion disponible.
- Uso en produccion: no se documentan pruebas de robustez, calibracion ni evaluacion por clase; se recomienda validacion propia antes de desplegar.
- Fecha de publicacion: el checkpoint figura creado en 2026-10-30, lo que conviene contrastar con la version real del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/torch-pointcloud/transfusion-lidar.nuscenes.openpcdet
- Paper TransFusion (arXiv): https://arxiv.org/abs/2203.11496
- Repositorio OpenPCDet: https://github.com/open-mmlab/OpenPCDet
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Guia de instalacion de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Dataset nuScenes: https://www.nuscenes.org/
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
