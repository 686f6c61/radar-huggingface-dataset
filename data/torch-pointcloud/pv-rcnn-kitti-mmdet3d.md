# torch-pointcloud/pv-rcnn.kitti.mmdet3d

## Resumen

PV-RCNN (Point-Voxel Feature Set Abstraction for 3D Object Detection) es un detector de objetos en 3D para nubes de puntos LiDAR. Esta ficha corresponde al checkpoint `torch-pointcloud/pv-rcnn.kitti.mmdet3d`, publicado por el proyecto torch-pointcloud como conversión del modelo original de OpenMMLab (mmdetection3d) al formato de la librería `torch-pointcloud`. El modelo resuelve la detección de cajas 3D con orientación para tres clases (coche, peatón y ciclista) sobre escenas de KITTI, y está pensado para integrarse en pipelines de percepción para conducción autónoma, robótica móvil o etiquetado automático de datos LiDAR.

Técnicamente es una red en dos etapas que combina un backbone de convoluciones dispersas sobre vóxeles con una segunda etapa basada en puntos, en la que se muestrean keypoints y se agregan características mediante abstracción de conjuntos (estilo PointNet++). El modelo es pequeño: 13.129.009 parámetros (13,1 M), 4 canales de entrada, 3 clases y 512 canales de características, con un repositorio de 0,1 GB en safetensors.

Su relevancia ahora es práctica más que de estado del arte: permite reproducir y desplegar un detector 3D clásico de referencia (CVPR 2020) desde una única librería en PyTorch, sin depender del stack completo de mmdetection3d, y ofrece extracción de características de 512 canales para reutilizar el backbone en tareas posteriores. Conviene tener en cuenta que las métricas declaradas están marcadas como no verificadas y que el modelo requiere GPU y dependencias nativas (`spconv`, `pyg-lib`) compiladas contra la versión de PyTorch y CUDA del entorno.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PV-RCNN: detector 3D en dos etapas (backbone de vóxeles con convoluciones dispersas + abstracción de conjuntos de puntos sobre keypoints) |
| Parámetros totales | 13.129.009 (13,1 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de visión 3D sobre nubes de puntos) |
| Tipos de cuantización | no disponible (el checkpoint se distribuye en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no procesa lenguaje; entrada geométrica de nube de puntos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (x, y, z, intensidad) |
| Clases detectadas | 3 (Car, Pedestrian, Cyclist) |
| Canales de características | 512 |
| Dataset de entrenamiento | KITTI |
| Librería / runtime | torch-pointcloud (requiere `spconv` y `pyg-lib`) |
| Tamaño del repositorio | 0,1 GB |
| Origen de los pesos | conversión desde open-mmlab/mmdetection3d (Apache-2.0) |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-10-23 / 2026-10-23 |

## Arquitectura y entrenamiento

PV-RCNN es un detector en dos etapas que unifica representaciones de vóxeles y de puntos. La primera etapa voxeliza la nube LiDAR y aplica un backbone de convoluciones 3D dispersas (sparse convolutions, de ahí la dependencia de `spconv`) para producir un mapa de características volumétrico y una primera propuesta de cajas 3D. Sobre esa representación se muestrean keypoints en el espacio de puntos y se aplica abstracción de conjuntos (set abstraction, esquema PointNet++) para agregar características multi-escala; la segunda etapa refina las propuestas mediante ROI-grid pooling, combinando las características de vóxeles con las de los keypoints. El resultado son cajas 3D con centro, dimensiones y orientación para las tres clases de KITTI.

El checkpoint se ha entrenado con el dataset KITTI (nubes de puntos LiDAR de escenas urbanas, rurales y de autopista, con anotaciones de coche, peatón y ciclista). La información disponible no detalla el número de muestras utilizado, el split exacto (train/val), el número de épocas, el esquema de aumentación de datos, la función de pérdida ni si hubo etapas de refinamiento posteriores al entrenamiento supervisado; tampoco se documenta ninguna innovación adicional más allá de la descrita en el paper original (arXiv:1912.13192, CVPR 2020). El autor indica que los pesos proceden de una conversión desde mmdetection3d, por lo que la receta de entrenamiento subyacente es la del modelo de referencia de ese repositorio, sin que se expliciten los hiperparámetros en la model card.

La interfaz de la librería expone dos puntos de entrada: `model(...)`, que recibe vóxeles, coordenadas de vóxeles, número de puntos por vóxel, índices de batch, puntos crudos y máscara de batch, y devuelve las detecciones; y `model.forward_features(...)`, que devuelve un tensor de 512 canales por instancia, útil para reutilizar el modelo como extractor de características.

## Capacidades

- Detección de objetos 3D en nubes de puntos LiDAR: devuelve cajas 3D con posición, dimensiones y orientación para tres clases (Car, Pedestrian, Cyclist).
- Entrada multimodal a nivel de punto: 4 canales (coordenadas x, y, z e intensidad de retorno), lo que permite explotar la reflectividad del LiDAR además de la geometría.
- Razonamiento geométrico multi-escala: combinación de características densas de vóxeles con agregación sobre keypoints, lo que mejora la localización de objetos pequeños o parcialmente ocluidos frente a detectores de una sola etapa.
- Extracción de características: `forward_features` proporciona representaciones de 512 canales reutilizables para clasificación de escenas, segmentación, reidentificación o búsqueda de similitud sobre nubes de puntos.
- Integración en pipelines: la API de `torch-pointcloud` permite crear el modelo con `tp.create_model(..., pretrained=True)` y aplicar la transformación de datos incluida en `info["transform"]`.
- Soporte de tool calling / function calling: no aplica (no es un modelo generativo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de agentes LLM; el modelo ejecuta una pasada de inferencia por escena.
- Capacidades multilingües: no aplica.
- Capacidades especiales: modo "thinking", visión 2D, audio o generación de texto, no disponibles; el modelo es exclusivamente de detección 3D sobre nubes de puntos.

## Casos de uso

- Percepción para conducción autónoma en entorno urbano: detección de coches, peatones y ciclistas a partir de la nube LiDAR del vehículo, usando las cajas 3D orientadas como entrada al módulo de planificación y seguimiento de trayectorias.
- Etiquetado automático (prelabeling) de datasets LiDAR propios: ejecutar el modelo sobre nubes sin anotar para generar propuestas de cajas 3D que un anotador humano solo tiene que revisar y corregir, lo que reduce el coste por escena frente al etiquetado desde cero.
- Robótica móvil y AGV en almacén o exterior: detección de obstáculos y personas con un LiDAR 3D de a bordo, aprovechando que el modelo es ligero (13,1 M de parámetros) y que las cajas 3D con orientación facilitan el cálculo de distancias y volúmenes de colisión.
- Análisis de tráfico con infraestructura LiDAR fija: conteo y clasificación de vehículos, viandantes y ciclistas en intersecciones instrumentadas, con la ventaja de que una nube de puntos no contiene información identificativa directa, lo que simplifica el cumplimiento de privacidad frente a vídeo.
- Módulo de extracción de características para tareas downstream: usar `forward_features` para obtener descriptores de 512 canales y entrenar un cabezal ligero de clasificación de escenas, detección de anomalías o recuperación de escenas similares.
- Baseline reproducible para investigación en detección 3D: comparar variantes propias (cambios en voxelización, muestreo de keypoints, aumentación) contra un PV-RCNN de referencia sobre KITTI sin reconstruir el entorno de mmdetection3d.
- Fine-tuning sobre datos propios con LiDAR de distintas características: al estar empaquetado en `torch-pointcloud`, sirve como inicialización para reentrenar con la sensorística y las clases de un dominio concreto (por ejemplo, maquinaria de obra o vehículos industriales), siempre que se ajuste la cabeza de clasificación.
- Mapeo móvil y drones con LiDAR: detección de elementos dinámicos que deben excluirse antes de construir un mapa estático del entorno.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (marcados como `verified: false`, es decir, no verificados de forma independiente). No se especifica en la información disponible la dificultad de evaluación de KITTI (fácil, moderada o difícil), el protocolo de cálculo (11 u 40 puntos) ni el split utilizado, por lo que las cifras deben interpretarse con cautela.

| Benchmark | Métrica | Valor | Verificado |
|---|---|---|---|
| KITTI (3D object detection) | mAP | 72,16 | No |
| KITTI | AP / Car | 83,54 | No |
| KITTI | AP / Pedestrian | 59,73 | No |
| KITTI | AP / Cyclist | 73,20 | No |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de lenguaje, ya que el modelo no es un modelo de lenguaje. Tampoco se han publicado mediciones de latencia, FPS ni consumo de memoria.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. A partir del número de parámetros, los pesos ocupan aproximadamente 52 MB en fp32 y unos 26 MB en fp16, de modo que el consumo real vendrá dominado por las activaciones (voxelización, mapa de características volumétrico, muestreo de keypoints y ROI-grid pooling) y por el número de puntos de entrada, factores no cuantificados en la información disponible.
- GPU recomendadas: no disponible. El modelo requiere GPU con CUDA: la model card indica explícitamente `# GPU-only kernels` y la necesidad de compilar `spconv` y `pyg-lib` contra la versión de PyTorch y CUDA del entorno.
- Compatibilidad con GPU de consumo: no confirmada. Dado el tamaño del modelo (13,1 M de parámetros), es plausible que quepa en GPUs de consumo con soporte CUDA y `spconv` funcional, pero no hay cifras de VRAM ni de latencia publicadas que lo confirmen.
- Ejecución en CPU: no soportada según la model card (kernels exclusivos de GPU).
- Opciones de despliegue: `torch-pointcloud` con PyTorch (vía `tp.create_model`). vLLM, TGI, llama.cpp y Ollama no aplican, al no ser un modelo generativo de texto. No se documenta exportación a ONNX, TensorRT ni TorchScript.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de parámetros, contexto ni métricas de los modelos alternativos en la información proporcionada; la comparación siguiente es cualitativa y se limita al tipo de arquitectura.

| Modelo | Arquitectura | Etapas | Datos disponibles en esta ficha |
|---|---|---|---|
| PV-RCNN (`torch-pointcloud/pv-rcnn.kitti.mmdet3d`) | Vóxeles con convolución dispersa + abstracción de puntos sobre keypoints | 2 | 13,1 M de parámetros; mAP 72,16 y AP por clase en KITTI (no verificado); Apache-2.0; safetensors |
| PointPillars | Codificación en pilares (pillars) sobre BEV, detector de una etapa | 1 | No disponible en la información proporcionada |
| SECOND | Backbone de convoluciones 3D dispersas, detector de una etapa | 1 | No disponible en la información proporcionada |
| CenterPoint | Detección anchor-free mediante mapa de calor de centros, con refinamiento opcional | 1 o 2 | No disponible en la información proporcionada |
| Part-A2-Net | Detector en dos etapas con pooling consciente de las partes del objeto | 2 | No disponible en la información proporcionada |

Como referencia de comparación válida, el model zoo de mmdetection3d (del que procede este checkpoint) publica las métricas de estos detectores sobre KITTI con protocolos homogéneos; esas cifras no se incluyen en la información disponible y no se reproducen aquí.

## Limitaciones y advertencias

- Dominio restringido a KITTI: el modelo está entrenado sobre escenas de KITTI (LiDAR de 64 haces, entorno alemán urbano, rural y de autopista). El rendimiento puede degradarse con otros sensores (LiDAR de 16 o 32 haces,固态, sensores de corto alcance) o con condiciones meteorológicas y geometrías de escena distintas.
- Solo tres clases: Car, Pedestrian y Cyclist. Cualquier otra categoría (camiones, autobuses, motocicletas, animales, mobiliario urbano) no está cubierta y puede generar falsos positivos o detecciones incompletas.
- Desequilibrio de rendimiento entre clases: el AP de peatón (59,73) es notablemente inferior al de coche (83,54), lo que anticipa un peor comportamiento en objetos pequeños, dispersos o parcialmente ocluidos, precisamente los más críticos en seguridad.
- Riesgo de falsos positivos y negativos: no existe "alucinación" en sentido generativo, pero sí errores de localización y clasificación en escenas con oclusiones densas, lluvia, nieve o retornos escasos; no se han publicado curvas de calibración de confianza ni umbrales recomendados.
- Métricas no verificadas: los valores de mAP y AP están marcados como `verified: false` en la model card y no se especifica dificultad ni protocolo de evaluación de KITTI, por lo que no deben usarse como cifra contractual en producción.
- Reproducibilidad incompleta: no se documentan split de entrenamiento, épocas, aumentación, semilla ni proceso de conversión detallado desde mmdetection3d; solo se indica el repositorio de origen.
- Dependencias frágiles: requiere `spconv` y `pyg-lib` compilados para la combinación exacta de PyTorch y CUDA, lo que complica el despliegue en contenedores y en entornos con drivers heterogéneos. La ejecución en CPU no está soportada.
- Licencia del modelo frente a licencia de los datos: los pesos se publican bajo Apache-2.0, que permite uso comercial, pero el modelo se ha entrenado con KITTI; conviene revisar los términos del dataset KITTI antes de un despliegue comercial, extremo que no se detalla en la información proporcionada.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Sin soporte multimodal: el modelo no consume imágenes de cámara ni texto; si el sistema requiere fusión LiDAR-cámara, hay que añadir módulos externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/pv-rcnn.kitti.mmdet3d
- Paper PV-RCNN (arXiv:1912.13192): https://arxiv.org/abs/1912.13192
- Repositorio de la librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Guía de instalación de torch-pointcloud (compilación de `spconv` y `pyg-lib`): https://pytorch-pointcloud.org/latest/installation/
- Repositorio de origen de los pesos (mmdetection3d, Apache-2.0): https://github.com/open-mmlab/mmdetection3d
- Referencia del software PyTorch PointCloud (DOI): https://doi.org/10.5281/zenodo.22159632

Las búsquedas web realizadas no devolvieron enlaces adicionales relevantes para este modelo: los resultados obtenidos corresponden a páginas genéricas sobre PyTorch y a un navegador homónimo sin relación con el proyecto.
