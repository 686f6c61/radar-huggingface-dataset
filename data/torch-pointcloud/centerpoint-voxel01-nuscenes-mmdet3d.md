# torch-pointcloud/centerpoint-voxel01.nuscenes.mmdet3d

## Resumen

CenterPoint (variante voxel01) es un detector de objetos 3D para nubes de puntos LiDAR, entrenado sobre el dataset nuScenes y publicado por el proyecto torch-pointcloud. No es un modelo de lenguaje: es un modelo de visión 3D que predice cajas 3D (clase, centro, dimensiones, orientación y velocidad) a partir de nubes de puntos, mediante una arquitectura de detección basada en centros sobre un mapa de calor en vista aérea (BEV). El checkpoint es una conversión del modelo original de OpenMMLab (mmdetection3d) al formato de la librería torch-pointcloud.

El modelo es relevante para quien trabaja en percepción para conducción autónoma o robótica móvil y quiere un detector 3D ligero (8,9 M de parámetros, 512 canales de features) que se pueda cargar con una API de alto nivel en PyTorch, sin depender del ecosistema completo de mmdetection3d. Su punto fuerte es el equilibrio entre coste computacional y precisión: obtiene mAP 56,09 y NDS 64,52 en el split de validación de nuScenes, cifras competitivas para un backbone de una sola etapa.

La ficha describe sus especificaciones, la arquitectura CenterPoint, las capacidades de detección y extracción de features, los casos de uso realistas en pipelines de percepción, los benchmarks declarados por el autor y las limitaciones prácticas (dependencia de spconv, kernels solo para GPU, licencia Apache-2.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CenterPoint (detector 3D basado en centros sobre heatmap BEV, backbone tipo voxel) |
| Parametros totales | 8.951.286 (8,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint de torch-pointcloud) |
| Canales de entrada | 5 |
| Clases | 10 |
| Canales de features | 512 |
| Dataset de entrenamiento | nuScenes |
| Pipeline | object-detection (3D) |
| Libreria | torch-pointcloud |

## Arquitectura y entrenamiento

CenterPoint es un detector de una sola etapa que proyecta la nube de puntos LiDAR en vóxeles, extrae features con un backbone 3D disperso (spconv) y las colapsa en un mapa de calor BEV. Sobre ese mapa se predicen los centros de los objetos, y a partir de cada centro se regresan las dimensiones, la orientación y la velocidad, evitando el uso de anchors y simplificando el post-procesado. La variante voxel01 usa vóxeles de 0,1 m como unidad de discretización.

El modelo se entrena sobre nuScenes, un dataset de conducción autónoma con 10 clases de objetos anotadas en 3D (coche, peatón, camión, autobús, bicicleta, moto, remolque, construcción, barrera, tráfico) y múltiples sensores. La model card no detalla el número de tokens ni la composición exacta del dataset, ni si hubo etapas de refinamiento adicionales; el checkpoint es una conversión directa del modelo de mmdetection3d, por lo que hereda el entrenamiento original de OpenMMLab. La innovación principal es la representación center-based, que reduce la complejidad del detector y facilita el tracking posterior al asociar centros entre frames.

## Capacidades

- Detección de objetos 3D en nubes de puntos LiDAR: clase, centro, dimensiones, orientación y velocidad.
- Detección sobre 10 clases de nuScenes.
- Extracción de features de 512 canales mediante `forward_features`, útil para tareas downstream (clasificación, segmentación, tracking).
- Entrada de 5 canales (coordenadas, intensidad, timestamp u otras features según la transformación).
- Procesamiento por lotes (`collate` con `batch_from="pos_voxel"`).
- Integración con PyTorch y kernels GPU (requiere spconv).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo de razonamiento (thinking), visión 2D general, audio ni generación de texto.

## Casos de uso

- Percepción en conducción autónoma: detección de coches, peatones y ciclistas en tiempo real sobre nubes LiDAR de vehículos equipados con sensores tipo nuScenes; el modelo ligero (8,9 M de parámetros) permite integrarse en pipelines embebidos.
- Tracking multi-objeto: al predecir centros y velocidad, los centros detectados se pueden asociar entre frames para construir trayectorias de objetos en escenas urbanas.
- Anotación asistida de datos: usar las detecciones como pre-etiquetado de nubes de puntos para acelerar la revisión humana en nuevos datasets de robótica o automoción.
- Robótica móvil en interiores o exteriores: detección de obstáculos y personas a partir de LiDAR para planificación de trayectorias en robots autónomos.
- Extracción de features para modelos downstream: usar `forward_features` (512 canales) como representación de la escena para clasificación de escenas o segmentación semántica.
- Validación de pipelines de percepción: comparar detecciones contra ground truth en nuScenes para evaluar regresiones en preprocesado, calibración o sensores.
- Investigación en detección 3D: servir como baseline reproducible (mAP 56,09 / NDS 64,52) para comparar nuevas arquitecturas o técnicas de aumento de datos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| nuScenes (validación) | mAP | 56,09 |
| nuScenes (validación) | NDS | 64,52 |

No se han publicado otros resultados de benchmarks en la información disponible (no hay datos de latencia ni throughput).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 8,9 M de parámetros y features de 512 canales, el modelo es muy ligero, pero el consumo real depende del número de vóxeles y del tamaño del batch.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA compatible con spconv; se recomienda una GPU con al menos 8-16 GB para lotes moderados de nubes de puntos.
- Compatibilidad con GPU de consumo: sí, es plausible en RTX 3060/4060 o superiores, siempre que se compile spconv para la versión de torch y CUDA correspondiente.
- Despliegue: la model card solo documenta el uso con la librería `torch-pointcloud` (pip install torch-pointcloud) y spconv; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | mAP / NDS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| centerpoint-voxel01.nuscenes.mmdet3d | 8,9 M | nuScenes | 56,09 / 64,52 | Apache-2.0 | Hugging Face (torch-pointcloud) |
| CenterPoint original (mmdetection3d) | no disponible | nuScenes | no disponible en esta ficha | Apache-2.0 | GitHub OpenMMLab |
| Otras variantes de CenterPoint (p. ej. pillar) | no disponible | nuScenes | no disponible en esta ficha | Apache-2.0 | Hugging Face / mmdetection3d |

No se dispone de datos comparativos de otros detectores 3D (PointPillars, SECOND, PV-RCNN) en la información proporcionada; se indica "no disponible".

## Limitaciones y advertencias

- Modelo especializado en nubes de puntos LiDAR de nuScenes: el rendimiento puede degradarse fuera de la distribución de ese dataset (sensores, calibración, densidad de puntos o entornos distintos).
- Requiere kernels GPU y la compilación de spconv compatible con la versión de torch y CUDA; esto complica el despliegue en entornos CPU o con versiones desalineadas.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks de NLP.
- Riesgo de falsos positivos y negativos en objetos pequeños, oclusiones o condiciones meteorológicas adversas; los benchmarks declarados no están verificados de forma independiente.
- Sesgos potenciales derivados del dataset nuScenes (escenas urbanas de Singapur y Boston, condiciones de captura concretas).
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene revisar las obligaciones de atribución y las licencias de las dependencias (spconv, torch-pointcloud).
- No se documentan cuantizaciones ni formatos alternativos de pesos; el checkpoint está pensado para cargarse con la librería torch-pointcloud.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/centerpoint-voxel01.nuscenes.mmdet3d
- Paper CenterPoint: https://arxiv.org/abs/2006.11275
- Repositorio torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación: https://pytorch-pointcloud.org/latest/installation/
- OpenMMLab mmdetection3d: https://github.com/open-mmlab/mmdetection3d
- Paper nuScenes: https://arxiv.org/abs/1903.11027 (referencia del dataset citado en la model card)
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
