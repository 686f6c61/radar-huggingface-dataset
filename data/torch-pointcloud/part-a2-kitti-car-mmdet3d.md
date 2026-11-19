# torch-pointcloud/part-a2.kitti-car.mmdet3d

## Resumen

Part-A2 es un detector de objetos 3D sobre nubes de puntos LiDAR, publicado originalmente por Shaoshuai Shi y colaboradores (CUHK, SenseTime, Huawei) en 2019 y posteriormente extendido en IEEE TPAMI en 2020. Este checkpoint concreto, `part-a2.kitti-car.mmdet3d`, es una conversión del modelo oficial de OpenMMLab (mmdetection3d) al formato de la librería `torch-pointcloud`, mantenida por Arthur Dujardin, y contiene únicamente el detector entrenado para la clase `Car` del dataset KITTI.

El modelo resuelve la detección de coches en escenas de conducción autónoma a partir de nubes de puntos LiDAR: recibe vóxeles con 4 canales de entrada y devuelve cajas 3D orientadas con su clase y puntuación. Su arquitectura es un detector de dos etapas con representación en vóxeles, con 54,9 millones de parámetros y un backbone de 512 canales de características. La innovación principal del trabajo original es el diseño *part-aware* (predicción de partes intra-objeto en la primera etapa) y *part-aggregation* (agregación de características a nivel de parte en la segunda etapa), que mejora la localización fina de los objetos.

Es relevante ahora porque permite reproducir el pipeline Part-A2 sin depender del ecosistema completo de mmdetection3d, integrándolo en proyectos PyTorch puros a través de `torch-pointcloud`, y porque sirve como extractor de características 3D de 512 dimensiones para tareas posteriores (clasificación, segmentación o *transfer learning* en robótica y conducción autónoma).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Part-A2: detector 3D de dos etapas basado en vóxeles (part-aware + part-aggregation) |
| Parametros totales | 54.876.768 (54,9 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D; entrada de nube de puntos, no secuencia de texto) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 4 |
| Clases detectadas | 1 (`Car`) |
| Canales de características | 512 |
| Dataset de entrenamiento | KITTI |
| Tamaño del repositorio | 0,2 GB |
| Librería | torch-pointcloud |
| Dependencia adicional | spconv (compilación específica para la versión de PyTorch y CUDA) |
| Dispositivo | solo GPU (kernels GPU-only) |

## Arquitectura y entrenamiento

Part-A2 es un detector de objetos 3D en dos etapas sobre vóxeles. La primera etapa (RPN) opera sobre una representación volumétrica dispersa de la nube de puntos y predice, además de las cajas candidatas, etiquetas de partes intra-objeto (*part-aware*): por ejemplo, para un coche, distingue entre techo, laterales, frontal y trasera. La segunda etapa agrega características a nivel de parte mediante *RoI-aware* pooling y produce la caja 3D final refinada (*part-aggregation*). Este diseño permite al modelo razonar sobre la geometría local del objeto y mejora la precisión de localización frente a detectores de una sola etapa.

El checkpoint está entrenado sobre KITTI, el benchmark de referencia para percepción en conducción autónoma, y solo para la clase `Car`. La model card no detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de refinamiento adicionales más allá del entrenamiento supervisado estándar de detección. La conversión procede de mmdetection3d (Apache-2.0) y se distribuye a través de `torch-pointcloud`, que exige `spconv` compilado contra la versión concreta de PyTorch y CUDA del entorno.

## Capacidades

- Detección de objetos 3D de la clase `Car` en nubes de puntos LiDAR con 4 canales de entrada (coordenadas e intensidad).
- Predicción de cajas 3D orientadas (centro, dimensiones y ángulo de guiñada) con puntuación de confianza.
- Detección en dos etapas con refinamiento a nivel de parte para mejor localización.
- Extracción de características 3D de 512 canales mediante `model.forward_features(...)`, útil para tareas posteriores.
- Procesamiento por vóxeles con operaciones dispersas (spconv), orientado a GPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye visión 2D, audio ni modo *thinking*.

## Casos de uso

- Percepción en conducción autónoma: detección de coches en tiempo real a partir de LiDAR en vehículos o bancos de pruebas, usando el checkpoint como módulo de percepción 3D dentro de un pipeline mayor.
- Etiquetado automático de datos: preanotar cajas 3D de coches en nuevas capturas LiDAR para acelerar el etiquetado humano, con revisión posterior.
- Extracción de características para *transfer learning*: usar `forward_features` para obtener descriptores de 512 canales por región y entrenar clasificadores o cabezas de segmentación específicas.
- Análisis de tráfico y aforo: conteo y localización de vehículos en escenas urbanas grabadas con LiDAR para estudios de movilidad.
- Validación de pipelines de percepción: servir como referencia reproducible de Part-A2 en PyTorch puro para comparar con otros detectores 3D.
- Robótica móvil: detección de vehículos en entornos de aparcamiento o logística donde se dispone de LiDAR y se requiere localización 3D precisa.
- Investigación académica: reproducción de resultados de Part-A2 sobre KITTI sin instalar todo mmdetection3d, útil para experimentos controlados.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados):

| Benchmark | Tarea | Metrica | Valor |
|---|---|---|---|
| KITTI | 3d-object-detection | mAP | 79,08 |
| KITTI | 3d-object-detection | AP/Car | 79,08 |

No se han publicado en la información disponible resultados adicionales (por ejemplo, desglose por dificultad Easy/Moderate/Hard, ni métricas de latencia o throughput).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 54,9 M de parámetros, los pesos en FP32 ocupan aproximadamente 0,22 GB, pero el consumo real depende de la representación dispersa y del tamaño de la escena.
- GPU recomendadas: no disponible; el modelo requiere kernels GPU-only y `spconv`, por lo que necesita una GPU NVIDIA con CUDA compatible.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de pesos sería viable en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales de consumo en escena real.
- Opciones de despliegue: `torch-pointcloud` con `spconv`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP KITTI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| part-a2.kitti-car.mmdet3d | 54,9 M | Nube de puntos LiDAR, 4 canales | 79,08 (declarado) | Apache-2.0 | Hugging Face (torch-pointcloud) |
| PointPillars (mmdetection3d) | no disponible | Nube de puntos LiDAR | no disponible | Apache-2.0 | mmdetection3d |
| SECOND (mmdetection3d) | no disponible | Nube de puntos LiDAR | no disponible | Apache-2.0 | mmdetection3d |

No se dispone en la información proporcionada de resultados comparables verificados para otros detectores 3D; la comparación cuantitativa queda pendiente.

## Limitaciones y advertencias

- Solo detecta la clase `Car`; no detecta peatones, ciclistas ni otras clases de KITTI.
- Entrenado exclusivamente con KITTI: puede degradarse en dominios distintos (otros sensores LiDAR, densidades de puntos, condiciones meteorológicas o geografías).
- Requiere GPU y `spconv` compilado para la combinación exacta de PyTorch y CUDA; esto complica el despliegue y la portabilidad.
- Riesgo de falsos positivos y negativos en escenas con oclusiones severas o puntos dispersos; no hay métricas publicadas por nivel de dificultad.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las licencias de las dependencias (`spconv`, `torch-pointcloud`) y del dataset KITTI para usos derivados.
- No es un modelo de lenguaje: no admite prompts, tool calling ni razonamiento textual; cualquier uso conversacional es inaplicable.
- Los resultados de benchmark son declarados por el autor y no están verificados (`verified: false`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/part-a2.kitti-car.mmdet3d
- Paper Part-A2: https://arxiv.org/abs/1907.03670
- Repositorio torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Repositorio mmdetection3d (origen de la conversión): https://github.com/open-mmlab/mmdetection3d
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
