# torch-pointcloud/voxelnext.nuscenes.openpcdet

## Resumen

VoxelNeXt es un detector de objetos 3D sobre nubes de puntos LiDAR, presentado en CVPR 2023 por Yukang Chen, Jianhui Liu, Xiangyu Zhang, Xiaojuan Qi y Jiaya Jia. Este checkpoint concreto, `voxelnext.nuscenes.openpcdet`, es una conversión del modelo original de OpenPCDet al formato de la librería `torch-pointcloud`, publicada por el autor de dicha librería (Arthur Dujardin) bajo licencia Apache-2.0. El modelo está entrenado sobre el dataset nuScenes y predice 10 clases de objetos propios de la conducción autónoma urbana.

La innovación central de VoxelNeXt es ser un detector "fully sparse": no proyecta los vóxeles a un mapa BEV denso ni usa anchors, sino que predice directamente sobre los vóxeles dispersos que contienen puntos. Esto elimina operaciones densas costosas y permite que la arquitectura escale a resoluciones de vóxel muy finas sin disparar el coste computacional. Con solo 8 millones de parámetros, es un modelo muy ligero, pensado para inferencia en tiempo real en entornos con GPU.

Es relevante ahora porque la conversión a `torch-pointcloud` facilita su uso desde Python sin depender del stack completo de OpenPCDet, y porque los detectores LiDAR 3D sparse se han convertido en el estándar de facto para percepción en robótica y conducción autónoma. No es un modelo de lenguaje: no procesa texto ni tiene ventana de contexto lingüístico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoxelNeXt (detector 3D fully sparse basado en vóxeles, sin anchors ni NMS denso) |
| Parametros totales | 7.996.086 (~8,0 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de percepción 3D; entrada = nube de puntos) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 5 |
| Clases de salida | 10 |
| Dimension de features | 128 |
| Dataset de entrenamiento | nuScenes |
| Repo | 0,1 GB |

## Arquitectura y entrenamiento

VoxelNeXt es un backbone y cabeza de detección que operan íntegramente sobre vóxeles dispersos. La nube de puntos se voxeliza (con 5 canales de entrada por vóxel) y se procesa mediante convoluciones dispersas 3D implementadas con `spconv`. A diferencia de aproximaciones híbridas (punto–vóxel) o de detectores que colapsan a BEV, VoxelNeXt mantiene la representación dispersa de extremo a extremo y predice centro, dimensiones, orientación y clase directamente desde los vóxeles activos, evitando la supresión no máxima densa y los anchors. El modelo produce features de 128 canales, expuestas vía `forward_features` para tareas de extracción de características.

El entrenamiento se realizó sobre nuScenes, el dataset multimodal de conducción urbana con 10 clases de objetos anotadas en 3D. La información disponible no detalla el número de tokens/puntos de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de refinamiento posteriores (por ejemplo, ajuste con datos aumentados o destilación). La model card tampoco documenta técnicas como decodificación especulativa o atención lineal, que no aplican a este tipo de arquitectura. El checkpoint es una conversión directa de los pesos de OpenPCDet, por lo que hereda el pipeline de preprocesado y las transformaciones del modelo original.

## Capacidades

- Detección de objetos 3D en nubes de puntos LiDAR: cajas 3D con centro, dimensiones, orientación y clase.
- Clasificación en 10 clases de nuScenes (coche, peatón, camión, autobús, bicicleta, moto, remolque, construcción, barrera de tráfico y otros objetos).
- Procesamiento de nubes de puntos dispersas con resolución de vóxel fina sin mapa BEV denso.
- Extracción de features por vóxel de 128 canales mediante `forward_features`, útil para tareas posteriores (segmentación, tracking, clasificación).
- Inferencia por lotes con `collate` sobre `pos_voxel`, soportando múltiples muestras en un mismo batch.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo generativo.
- No tiene capacidades multilingües, de visión 2D ni de audio.

## Casos de uso

- Percepción en conducción autónoma urbana: el modelo detecta vehículos, peatones y ciclistas en nubes LiDAR de nuScenes, adecuado como módulo de percepción en pipelines de planificación de trayectorias gracias a su bajo coste (8 M de parámetros) y a su operación sparse.
- Robótica móvil indoor/outdoor: integración en robots con LiDAR para detección de obstáculos y personas en tiempo real, aprovechando que el modelo cabe holgadamente en GPUs de consumo.
- Sistemas ADAS de bajo coste: al no requerir mapa BEV denso, puede desplegarse en plataformas embebidas con GPU moderada para alertas de colisión y detección de peatones.
- Etiquetado automático de datos (auto-labeling): usar el modelo para pre-anotar nubes de puntos nuevas y acelerar la creación de datasets propios, con revisión humana posterior.
- Extracción de features para downstream: emplear `forward_features` (128 canales) como representación de vóxeles para tareas de segmentación semántica, tracking multi-objeto o clasificación de escenas.
- Benchmarking y reproducción de investigación: comparar resultados contra el original de OpenPCDet y validar pipelines de conversión de pesos, dado que el checkpoint es una conversión directa.
- Tracking 3D: el paper original de VoxelNeXt cubre detección y tracking; el detector puede servir como etapa de detección en un tracker (por ejemplo, CenterPoint-style) para seguimiento de objetos en secuencias temporales.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Dataset | Metrica | Valor |
|---|---|---|
| nuScenes | mAP | 60,43 |
| nuScenes | NDS | 66,63 |

No se han publicado en la información disponible resultados de otros benchmarks (por ejemplo, desglose por clase, métricas de tracking o comparativas frente a otros detectores) ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~8 M de parámetros y un backbone sparse, el peso de los pesos es mínimo (repo de 0,1 GB). El consumo dominante es el de las estructuras dispersas de `spconv`, que depende del número de vóxeles activos por muestra.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA compatible con `spconv` (por ejemplo, RTX 3090/4090, A100, H100). El modelo está pensado para ejecutarse en GPU ("GPU-only kernels"); la model card no documenta ejecución en CPU.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el reducido tamaño de parámetros; la limitación real es la compilación de `spconv` contra la versión de PyTorch y CUDA instalada.
- Opciones de despliegue: `torch-pointcloud` (vía `tp.create_model`), PyTorch nativo con `spconv`, y exportación a OpenPCDet. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | mAP | NDS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VoxelNeXt (este checkpoint) | ~8,0 M | nuScenes | 60,43 | 66,63 | Apache-2.0 | Hugging Face (`torch-pointcloud`) |
| VoxelNeXt (original OpenPCDet) | ~8,0 M | nuScenes | no disponible en esta ficha | no disponible en esta ficha | Apache-2.0 | GitHub OpenPCDet |
| CenterPoint | no disponible | nuScenes | no disponible | no disponible | no disponible | OpenPCDet |
| PointPillars | no disponible | nuScenes | no disponible | no disponible | no disponible | OpenPCDet |

Nota: los datos de los modelos alternativos no están incluidos en la información proporcionada; se indican como no disponibles para no inventar cifras. La comparación fiable debe hacerse contra el checkpoint original de OpenPCDet, que comparte arquitectura y pesos.

## Limitaciones y advertencias

- Modelo de percepción 3D, no generativo: no procesa texto, no responde preguntas y no tiene capacidades de razonamiento lingüístico.
- Específico de nuScenes: las 10 clases y la distribución de sensores (LiDAR de 32 haces, condiciones urbanas de Boston y Singapur) limitan la generalización a otros sensores, climas o entornos sin reentrenamiento.
- Dependencia de `spconv`: requiere compilar la extensión contra la versión exacta de PyTorch y CUDA, lo que complica el despliegue y la reproducibilidad.
- Solo GPU: los kernels no están pensados para CPU; la inferencia en entornos sin GPU no está soportada según la model card.
- Riesgo de falsos negativos y positivos en objetos pequeños o lejanos, típico de los detectores LiDAR sparse; no se documentan métricas por rango ni por clase.
- Sesgos de dataset: la composición de nuScenes puede infrarrepresentar ciertos tipos de vehículos, peatones o condiciones meteorológicas adversas.
- Métricas no verificadas: mAP 60,43 y NDS 66,63 están declaradas por el autor (`verified: false`); conviene reproducirlas antes de usarlas en producción.
- Licencia Apache-2.0: permite uso comercial con atribución y sin garantías; el modelo se distribuye "tal cual", sin soporte del autor.
- No se documentan limitaciones de calibración, sincronización temporal ni requisitos de preprocesado más allá de las transformaciones incluidas en `info["transform"]`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/voxelnext.nuscenes.openpcdet
- Paper VoxelNeXt (arXiv 2303.11301): https://arxiv.org/abs/2303.11301
- Repositorio OpenPCDet: https://github.com/open-mmlab/OpenPCDet
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Dataset nuScenes: https://www.nuscenes.org/
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
