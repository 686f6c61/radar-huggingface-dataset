# torch-pointcloud/part-a2.kitti.mmdet3d

## Resumen

Part-A2 es un detector de objetos 3D sobre nubes de puntos LiDAR, publicado originalmente por Shi et al. (CUHK, SenseTime, Huawei) en 2020 y convertido a la librería `torch-pointcloud` por Arthur Dujardin. El checkpoint `torch-pointcloud/part-a2.kitti.mmdet3d` es la conversión directa de los pesos de `mmdetection3d` (Apache-2.0) al formato safetensors, lista para cargarse con `tp.create_model()` y ejecutarse en GPU. Resuelve la detección de coches, peatones y ciclistas en escenas de conducción autónoma sobre el benchmark KITTI.

El modelo emplea una arquitectura de dos etapas con representación voxelizada: una primera etapa part-aware que aprende representaciones intra-objeto a partir de las partes libres y las partes de primer plano de cada objeto, y una segunda etapa part-aggregation que refina las propuestas combinando las partes con la caja candidata. Con 54,9 millones de parámetros, 4 canales de entrada (x, y, z, intensidad) y 512 características por voxel, es un modelo compacto y específico para detección 3D, no un modelo de lenguaje.

Su relevancia actual es doble: por un lado, sirve como referencia canónica para comparar detectores LiDAR en KITTI; por otro, su disponibilidad en `torch-pointcloud` con pesos safetensors y API Python simplifica la integración en pipelines de percepción sin depender de la pila de `mmdetection3d`. El repo ocupa 0,2 GB y acumula 2275 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Part-A2: detector 3D en dos etapas, part-aware y part-aggregation, sobre voxelización |
| Parametros totales | 54.903.444 (54,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original) |
| Idiomas soportados | no aplica (modelo de percepción, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (x, y, z, intensidad) |
| Clases detectadas | 3 (Car, Pedestrian, Cyclist) |
| Dimension de caracteristicas | 512 |
| Dataset de entrenamiento | KITTI |
| Libreria | torch-pointcloud (requiere spconv) |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

Part-A2 es un detector de objetos 3D en dos etapas sobre nubes de puntos LiDAR. La primera etapa, part-aware, voxeliza la nube y aprende representaciones a dos niveles: partes libres (fragmentos de objeto sin asignación previa) y partes de primer plano (segmentos dentro de las cajas candidatas). Estas representaciones se agregan para generar propuestas de caja. La segunda etapa, part-aggregation, refina cada propuesta combinando las características de sus partes con las de la caja completa, lo que mejora la localización y la clasificación. El backbone es una red convolucional 3D dispersa (spconv) sobre vóxeles, seguida de cabezas de clasificación y regresión de cajas.

El checkpoint se entrenó sobre KITTI, el benchmark clásico de conducción autónoma con escenas LiDAR anotadas para coche, peatón y ciclista. La model card no detalla el número de tokens, la composición exacta del dataset ni si hubo ajuste fino adicional; el modelo original se publicó en IEEE TPAMI en 2020 y este checkpoint es una conversión de los pesos de `mmdetection3d`. No se documentan innovaciones adicionales como decodificación especulativa ni atención lineal, ya que no es un modelo generativo.

## Capacidades

- Detección de objetos 3D en nubes de puntos LiDAR: devuelve cajas 3D con clase, centro, dimensiones y orientación para coches, peatones y ciclistas.
- Voxelización y agregación de partes: representa objetos como conjuntos de partes para mejorar la localización en escenas con oclusiones.
- Extracción de características: el método `forward_features` devuelve un vector de 512 canales por voxel, reutilizable para tareas posteriores (clasificación, segmentación, recuperación).
- Procesamiento por lotes: acepta lotes de muestras con las claves `voxel`, `pos_voxel`, `voxel_num_points` y `batch`.
- Ejecución solo en GPU: los kernels de spconv requieren CUDA.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente perceptivo.

## Casos de uso

- Percepción en conducción autónoma: detección de coches, peatones y ciclistas en tiempo real sobre nubes LiDAR de un vehículo, usando las cajas 3D para planificación de trayectorias y frenado de emergencia.
- Etiquetado semiautomático de datasets: preanotar nubes de puntos nuevas con las detecciones del modelo y revisar manualmente solo los casos dudosos, reduciendo el coste de anotación.
- Extracción de características para modelos posteriores: usar `forward_features` para obtener embeddings de 512 canales por voxel y alimentar clasificadores o segmentadores aguas abajo.
- Validación de pipelines de percepción: comparar las detecciones del modelo con las de otros detectores sobre KITTI para detectar regresiones en el preprocesado o en la calibración de sensores.
- Robótica móvil en exteriores: detección de obstáculos y personas en robots de reparto o vehículos de interior/exterior con LiDAR, aprovechando que el modelo es compacto (54,9 M de parámetros).
- Investigación en detección 3D: línea base reproducible para experimentos de ablación sobre voxelización, agregación de partes o funciones de pérdida, al estar disponible en `torch-pointcloud` con API sencilla.
- Análisis de tráfico y movilidad: procesamiento offline de grabaciones LiDAR para contar vehículos y peatones y estimar flujos en intersecciones.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Metrica | Dataset | Valor |
|---|---|---|
| mAP | KITTI | 68,34 |
| AP/Car | KITTI | 79,03 |
| AP/Pedestrian | KITTI | 55,28 |
| AP/Cyclist | KITTI | 70,70 |

No se han publicado en la información disponible resultados adicionales (latencia, throughput, comparación con otros detectores) más allá de estos valores.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; con 54,9 M de parámetros y un backbone 3D disperso, el consumo depende del número de vóxeles y del tamaño de la nube de entrada.
- GPU recomendadas: no disponible; el modelo requiere CUDA por los kernels de spconv, por lo que cualquier GPU NVIDIA compatible con la versión de CUDA de spconv es válida.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; por tamaño de parámetros es plausible en GPUs consumer, pero la viabilidad depende de la memoria para vóxeles y del build de spconv.
- Opciones de despliegue: `torch-pointcloud` con `spconv`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión 3D).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | mAP | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Part-A2 (este) | 54,9 M | KITTI | 68,34 | Apache-2.0 | Hugging Face, torch-pointcloud |
| PointPillars | no disponible | KITTI | no disponible | Apache-2.0 (mmdetection3d) | mmdetection3d |
| SECOND | no disponible | KITTI | no disponible | Apache-2.0 (mmdetection3d) | mmdetection3d |
| PV-RCNN | no disponible | KITTI | no disponible | Apache-2.0 (mmdetection3d) | mmdetection3d |

No se dispone en la información proporcionada de los valores de parámetros, mAP ni contexto de los modelos alternativos; la comparativa se limita a indicar que Part-A2, PointPillars, SECOND y PV-RCNN son detectores LiDAR 3D comparables disponibles en `mmdetection3d` bajo Apache-2.0.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó exclusivamente en KITTI, con cámaras y LiDAR de un único tipo de sensor y escenas de conducción alemana; puede degradarse en otros sensores, densidades de nube o condiciones meteorológicas.
- Riesgo de alucinación: como todo detector, puede producir falsos positivos y cajas mal localizadas, especialmente en objetos ocluidos o lejanos; los resultados deben validarse en el dominio de despliegue.
- Limitaciones de contexto e idioma: no aplica el concepto de contexto lingüístico; el modelo no procesa texto ni imágenes 2D, solo nubes de puntos con 4 canales.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar las licencias de `spconv` y de los pesos originales de `mmdetection3d`.
- Dependencia de `spconv`: requiere compilar `spconv` con una versión de CUDA y PyTorch compatible, lo que complica el despliegue en entornos reproducibles.
- Solo GPU: los kernels no funcionan en CPU, lo que limita su uso en portátiles sin GPU o en servidores sin CUDA.
- Métricas no verificadas: los valores de mAP y AP de la model card están marcados como `verified: false`; no se han reproducido de forma independiente en la información disponible.
- Sin datos de latencia: no se documenta el rendimiento en tiempo real, crítico para aplicaciones de conducción autónoma.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/part-a2.kitti.mmdet3d
- Paper Part-A2: https://arxiv.org/abs/1907.03670
- Repositorio torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- mmdetection3d (origen de los pesos): https://github.com/open-mmlab/mmdetection3d
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Benchmark KITTI: https://www.cvlibs.net/datasets/kitti/
