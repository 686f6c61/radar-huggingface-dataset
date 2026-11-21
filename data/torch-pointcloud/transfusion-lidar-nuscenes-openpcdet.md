# torch-pointcloud/transfusion-lidar.nuscenes.openpcdet

## Resumen

TransFusion-L es un detector de objetos 3D sobre nubes de puntos LiDAR, publicado en CVPR 2022 por Xuyang Bai y colaboradores. Este checkpoint concreto, `transfusion-lidar.nuscenes.openpcdet`, es una conversión del modelo original de OpenPCDet al formato de la librería `torch-pointcloud`, mantenida por Arthur Dujardin. Resuelve la detección de objetos 3D en escenas de conducción autónoma a partir exclusivamente de LiDAR, sin cámara, empleando un cabezal de consultas tipo transformer sobre un mapa BEV (Bird's Eye View).

El modelo es notablemente compacto: 8,3 millones de parámetros, lo que lo sitúa muy por debajo de los detectores basados en transformers de gran escala. Su relevancia actual radica en que ofrece un punto de partida reproducible y ligero para tareas de percepción 3D, con pesos en safetensors y una API de carga directa mediante `torch-pointcloud`. Está entrenado y evaluado sobre el dataset nuScenes, con 10 clases de objetos y una entrada de 5 canales por punto.

No es un modelo de lenguaje ni procesa texto: es un detector 3D puro que consume vóxeles de nube de puntos y produce cajas 3D con clase y orientación. La ficha siguiente lo describe en esos términos, sin extrapolar capacidades que no posee.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TransFusion-L (detector 3D LiDAR-only con cabezal de consultas transformer sobre mapa BEV) |
| Parametros totales | 8.315.854 (8,3 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de percepción 3D, no de texto) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; el checkpoint se distribuye en safetensors) |
| Idiomas soportados | no aplica (modelo de visión 3D; la model card no declara idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 5 por punto |
| Clases de salida | 10 |
| Dimension de features | 512 |
| Dataset de entrenamiento | nuScenes |
| Libreria | torch-pointcloud |
| Dependencia adicional | spconv (compilación específica para torch y CUDA) |

## Arquitectura y entrenamiento

TransFusion-L sigue el diseño descrito en el paper *TransFusion: Robust LiDAR-Camera Fusion for 3D Object Detection with Transformers* (Bai et al., CVPR 2022). La variante L es la rama LiDAR-only: la nube de puntos se voxeliza, se procesa con un backbone 3D (implementado sobre `spconv`) y se proyecta a un mapa BEV. Sobre ese mapa, un cabezal de transformer con consultas aprendidas predice las cajas 3D, asignando cada consulta a un objeto mediante atención sobre las features BEV. El checkpoint declara 5 canales de entrada por punto (coordenadas, intensidad y timestamp), 512 canales de features y 10 clases.

El entrenamiento se realizó sobre nuScenes, el dataset multimodal de conducción autónoma con 1000 escenas anotadas en 10 clases. La model card no detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de refinamiento posteriores; esos datos deben consultarse en el paper original. La conversión desde OpenPCDet (Apache-2.0) preserva la arquitectura y los pesos, y la librería `torch-pointcloud` expone tanto la inferencia completa (`model.forward`) como la extracción de features (`forward_features`, 512 canales). Una innovación destacable del diseño original es el uso de consultas transformer para asociar detecciones sin necesidad de NMS dependiente de la cámara, lo que simplifica el pipeline respecto a fusiones LiDAR-cámara.

## Capacidades

- Detección de objetos 3D en nubes de puntos LiDAR: devuelve cajas 3D con clase, centro, dimensiones y orientación sobre 10 clases de nuScenes.
- Procesamiento de vóxeles con 5 canales de entrada (posición, intensidad, timestamp).
- Extracción de features BEV de 512 canales mediante `forward_features`, útil como backbone para tareas posteriores.
- Inferencia por lotes mediante `collate` sobre `pos_voxel`, con soporte de `voxel_num_points` y `batch`.
- Ejecución GPU-only: los kernels de `spconv` requieren CUDA.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingües ni de generación de texto.
- No incorpora modo thinking, visión 2D, audio ni modalidades distintas del LiDAR.

## Casos de uso

- Percepción LiDAR en conducción autónoma: el modelo consume la nube de puntos de un vehículo y produce cajas 3D de vehículos, peatones y ciclistas, adecuado como módulo de detección en un stack de autonomía con 8,3 M de parámetros y latencia baja.
- Etiquetado automático de datos: generar pre-anotaciones 3D sobre nuevas grabaciones LiDAR para acelerar el etiquetado humano, usando la salida del modelo como propuesta inicial que los anotadores revisan.
- Extracción de features BEV para modelos downstream: `forward_features` proporciona 512 canales por posición BEV que pueden alimentar cabezales de predicción de trayectorias, segmentación de suelo o clasificación de escenas.
- Benchmarking y reproducibilidad: sirve como referencia ligera de TransFusion-L sobre nuScenes para comparar pipelines de voxelización, conversiones de formato y librerías de inferencia 3D.
- Investigación en detección 3D: base para experimentos de ablación sobre canales de entrada, resolución de vóxeles o estrategias de consultas transformer, dado su reducido coste computacional.
- Despliegue en vehículos con recursos limitados: al tener 8,3 M de parámetros, es candidato para plataformas embebidas con GPU, siempre que se compile `spconv` para la versión de CUDA y torch del dispositivo.
- Simulación y robótica: detección de obstáculos en robots móviles equipados con LiDAR, reutilizando el checkpoint tras adaptar la voxelización al sensor concreto.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Tarea | Metrica | Valor | Verificado |
|---|---|---|---|---|
| nuScenes | 3d-object-detection | mAP | 64,49 | No |
| nuScenes | 3d-object-detection | NDS | 69,39 | No |

No se han publicado en la información disponible otros resultados de benchmarks (por ejemplo, por clase o comparativas con modelos similares) más allá de los anteriores.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 8,3 M de parámetros el peso de los pesos es del orden de decenas de MB, pero el consumo real depende del número de vóxeles y de la resolución de voxelización, que no se documenta.
- GPU recomendadas: no disponibles en la información proporcionada; el modelo requiere GPU con CUDA por los kernels de `spconv`.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo; la dependencia de `spconv` compilado para la versión concreta de torch y CUDA es el principal condicionante.
- Opciones de despliegue: `torch-pointcloud` con `spconv`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de otros detectores 3D sobre nuScenes ni sus especificaciones, por lo que no es posible establecer una comparativa fiable sin inventar datos.

## Limitaciones y advertencias

- Modelo LiDAR-only: no utiliza cámara, por lo que carece de la fusión multimodal de la variante completa de TransFusion y puede degradarse en escenarios con objetos poco representados en LiDAR.
- Dependencia de `spconv`: requiere una compilación específica para la versión de torch y CUDA, lo que complica la portabilidad y el despliegue.
- Solo GPU: los kernels no funcionan en CPU, lo que limita entornos de desarrollo sin GPU.
- Dominio restringido a nuScenes: las 10 clases y las condiciones de captura del dataset condicionan la generalización a otros sensores, ciudades o climas.
- Resultados no verificados: mAP y NDS son valores declarados por el autor en la model card, sin verificación independiente.
- Sin datos de sesgos, alucinación o comportamiento fuera de dominio: no disponibles en la información proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las licencias de las dependencias (OpenPCDet, `spconv`, `torch-pointcloud`) y las condiciones de uso de nuScenes para los datos de entrenamiento.
- Fecha de creación y actualización del repositorio (2026) posterior a la publicación del paper (2022): el checkpoint es una conversión reciente, no el artefacto original del autor del paper.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/transfusion-lidar.nuscenes.openpcdet
- Paper TransFusion (arXiv): https://arxiv.org/abs/2203.11496
- Repositorio OpenPCDet: https://github.com/open-mmlab/OpenPCDet
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Guía de instalación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Dataset nuScenes: https://www.nuscenes.org/
