# torch-pointcloud/part-a2.kitti-car.mmdet3d

## Resumen

Part-A2 (`part-a2.kitti-car.mmdet3d`) es un detector de objetos 3D sobre nubes de puntos LiDAR, en concreto la implementación del artículo "From Points to Parts" (Shi et al., IEEE TPAMI 2020) entrenada sobre el dataset KITTI para una única clase: coche. El checkpoint lo publica el proyecto torch-pointcloud, que lo ha convertido desde open-mmlab/mmdetection3d manteniendo los pesos en formato safetensors y una API de inferencia propia (`tp.create_model`).

El modelo tiene 54.876.768 parámetros (~54,9 M), recibe vóxeles con 4 canales de entrada y produce features de 512 dimensiones. No es un modelo lingüístico ni multimodal: es un componente de percepción 3D pensado para integrarse en pipelines de conducción autónoma, robótica o etiquetado automático de datos. El repositorio ocupa 0,2 GB y se distribuye con licencia Apache-2.0.

Su relevancia práctica está en que permite reproducir un detector de referencia de KITTI sin depender del ecosistema OpenMMLab completo: la librería torch-pointcloud expone carga, transformación de la muestra, `collate`, inferencia y extracción de features en pocas líneas. La contrapartida es que requiere `spconv` compilado contra la versión exacta de PyTorch y CUDA, y que sus kernels son exclusivamente GPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Part-A2: detector 3D de dos etapas sobre vóxeles, con parte-aprendizaje (part-aware) y parte-agregación (RoI-aware pooling) sobre convoluciones dispersas |
| Parametros totales | 54.876.768 (~54,9 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: la entrada es una nube de puntos; la model card no documenta un límite máximo de puntos ni de vóxeles (el ejemplo de uso emplea 8192 puntos) |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint en safetensors; no hay variantes int8, fp16 ni GGUF) |
| Idiomas soportados | no aplica (modelo de visión 3D, sin componente lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 4 |
| Clases | 1 (Car) |
| Canales de features | 512 |
| Dataset de entrenamiento | KITTI |
| Pipeline declarado | object-detection |
| Tamaño del repositorio | 0,2 GB |
| Dependencia adicional | `spconv` (compilación acorde a torch y CUDA) |
| Origen de la conversión | open-mmlab/mmdetection3d (Apache-2.0) |

## Arquitectura y entrenamiento

Part-A2 es un detector de dos etapas sobre vóxeles. La primera etapa aplica convoluciones dispersas 3D sobre la nube voxelizada para generar propuestas, con un módulo *part-aware* que aprende a descomponer cada objeto en partes (superficie libre, superficie del objeto y centro) en lugar de tratarlo como una masa homogénea. La segunda etapa refina las propuestas mediante *part-aggregation*: agrupa las partes predichas dentro de cada RoI y fusiona la información con pooling consciente de la posición. El resultado son cajas 3D con orientación. La model card indica 4 canales de entrada (típicamente x, y, z e intensidad), 512 features y 1 clase.

El entrenamiento se realizó sobre KITTI, el benchmark de percepción para conducción autónoma de Geiger, Lenz y Urtasun (CVPR 2012), tal como declara el autor del checkpoint. No se especifican en la información disponible el número de tokens/puntos de entrenamiento, la composición exacta del dataset, la resolución de vóxeles, el número de épocas ni si hubo etapas de refinamiento posteriores (RLHF/DPO no aplican a este dominio). Este checkpoint concreto es una conversión de pesos desde mmdetection3d, no un reentrenamiento: la innovación aquí es de empaquetado (formato safetensors, API de torch-pointcloud, extracción de features vía `forward_features`), no de método.

## Capacidades

- Detección de coches en nubes de puntos LiDAR: devuelve la salida cruda de la red de dos etapas para la clase Car.
- Entrada voxelizada de 4 canales, con `voxel`, `pos_voxel`, `voxel_num_points` y `batch` como tensores de entrada del `forward`.
- Extracción de features de 512 canales por objeto/región mediante `model.forward_features(...)`, reutilizable para tareas downstream.
- Preprocesado integrado: `info["transform"](sample)` convierte una muestra con `pos` (N, 3) e `intensity` (N, 1) al formato que espera el modelo, y `collate(..., batch_from="pos_voxel")` construye el batch.
- Inferencia en GPU con kernels dispersos: `model.cuda().eval()` es obligatorio, no hay ruta CPU documentada.
- Integración con PyTorch nativo: el modelo es un `torch.nn.Module`, compatible con `torch.no_grad()`, exportación a otros formatos no documentada.
- No soporta tool calling, agentes, razonamiento multi-paso, visión 2D, audio ni capacidades multilingües: no es un modelo generativo.

## Casos de uso

- Percepción LiDAR en conducción autónoma: detección de vehículos en la nube de puntos de un sensor de 64 haces, con la caja 3D y la orientación como salida para el módulo de seguimiento y planificación.
- Pre-etiquetado de datasets LiDAR: generar propuestas de cajas de coche sobre grandes volúmenes de capturas y revisarlas manualmente después, reduciendo el coste de anotación a una sola clase bien delimitada.
- Extracción de features para modelos downstream: usar los 512 canales de `forward_features` como entrada de un clasificador de escenas, un módulo de tracking o un detector de atributos, evitando reentrenar el backbone.
- Transfer learning a otros dominios LiDAR: fine-tuning sobre datos propios (robótica, minería, puertos) partiendo de pesos ya convergidos en KITTI y ajustando la cabeza a las clases del nuevo dominio.
- Validación y regresión de pipelines: servir como referencia reproducible frente a la implementación original de mmdetection3d para comprobar que una conversión de pesos o un cambio de preprocesado no degrada la salida.
- Robótica móvil y AGV: detección de vehículos y obstáculos con forma de coche en entornos de almacén o vía pública, siempre que la geometría del sensor se aproxime a la de KITTI.
- Análisis de tráfico y aforo: conteo de vehículos en capturas LiDAR fijas (pórticos, intersecciones) usando el modelo como detector por fotograma y agregando después las detecciones.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Tarea | Metrica | Valor | Verificado |
|---|---|---|---|---|
| KITTI | 3D object detection | mAP | 79,08 | No |
| KITTI | 3D object detection (clase Car) | AP/Car | 79,08 | No |

El valor de mAP y el de AP/Car coinciden porque el checkpoint cubre una única clase. La model card no indica el umbral de IoU, ni el split de dificultad (easy/moderate/hard), ni si la métrica es AP con orientación (AP3D) o sin ella (AP-BEV): esos detalles figuran como no disponibles. No se han publicado en la información disponible resultados comparativos con otros detectores.

## Requisitos de hardware

- Pesos: ~0,22 GB en fp32 y ~0,11 GB en fp16 solo para los 54,9 M de parámetros (cálculo a partir del recuento, no publicado por el autor). El repo completo son 0,2 GB.
- Memoria de activaciones: depende del número de puntos y de vóxeles de la muestra, no del contexto; no hay cifras publicadas. Con nubes tipo KITTI (~10^5 puntos) el consumo se sitúa en el orden de pocos GB, pero es una estimación.
- GPU: se requiere CUDA de forma explícita (`model.cuda().eval()`; kernels GPU-only). Encajan GPUs con soporte de `spconv` para la versión de CUDA instalada: RTX 3090/4090, A100, H100, entre otras. No hay lista oficial validada.
- Consumer GPU: sí, previsiblemente cabe en RTX 3090/4090 y en GPUs de 8-12 GB para inferencia en fp32 con lotes pequeños, condicionado a poder compilar `spconv`. No verificado por el autor.
- CPU: no soportado de forma documentada; el modelo no arranca sin GPU.
- Despliegue: no aplican vLLM, TGI, llama.cpp ni Ollama (no es un modelo de lenguaje ni tiene pesos GGUF). La vía es `pip install torch-pointcloud` más `spconv`, con la guía de instalación de la documentación oficial.
- Latencia y throughput: no disponibles. La conversión a TensorRT/ONNX no está documentada en la model card.

## Comparativa con modelos similares

No se han proporcionado resultados numéricos de modelos comparables, por lo que la comparación cuantitativa figura como no disponible. Contexto cualitativo:

| Modelo | Categoria | Parametros | Contexto / entrada | mAP KITTI declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| part-a2.kitti-car.mmdet3d | Detector 3D LiDAR, 2 etapas, 1 clase | 54,9 M | Nube de puntos voxelizada, 4 canales | 79,08 (no verificado) | Apache-2.0 | HuggingFace, 0,2 GB |
| PointPillars | Detector 3D LiDAR, 1 etapa | no disponible | Nube de puntos en pilares | no disponible | no disponible en la información | Implementación en mmdetection3d |
| SECOND | Detector 3D LiDAR, 1 etapa, sparse conv | no disponible | Vóxeles | no disponible | no disponible en la información | Implementación en mmdetection3d |
| PV-RCNN | Detector 3D LiDAR, 2 etapas (vóxeles + puntos) | no disponible | Vóxeles y puntos clave | no disponible | no disponible en la información | Implementación en mmdetection3d |

La comparación honesta es de arquitectura y coste, no de precisión: Part-A2 es más pesado que un detector de una etapa (PointPillars, SECOND) a cambio de un refinamiento por partes, y comparte con PV-RCNN el esquema de dos etapas. Cualquier cifra de mAP de los rivales debe consultarse en sus propias model cards.

## Limitaciones y advertencias

- Una única clase: solo detecta Car. Peatones, ciclistas, camiones y cualquier otra categoría quedan fuera del ámbito del checkpoint.
- Dominio KITTI: entrenado con capturas de un Velodyne HDL-64E en entorno urbano y de carretera alemana, en condiciones mayoritariamente diurnas y despejadas. El rendimiento cae fuera de esa distribución (lluvia, nieve, niebla, sensores de 16/32 haces, domótica interior).
- Riesgo de falsos positivos y negativos en puntos dispersos, oclusiones severas y objetos truncados; en este dominio el equivalente a la alucinación son detecciones espurias generadas a partir de geometría ambigua.
- Requiere `spconv` compilado contra la versión exacta de PyTorch y CUDA; es la causa más habitual de fallo de instalación y no hay rueda universal.
- Sin ruta de inferencia en CPU ni cuantización publicada: no es desplegable en dispositivos sin GPU compatible.
- La model card no documenta el post-procesado ni la conversión de las predicciones a coordenadas del sensor o de la cámara; el `forward` devuelve la salida cruda de la red.
- Métricas no verificadas: mAP 79,08 y AP/Car 79,08 las declara el autor, sin indicar IoU ni split de dificultad. No deben usarse como cifra de referencia en producción sin reproducirlas.
- Licencia Apache-2.0: permite uso comercial y concede licencia de patentes, con obligación de conservar avisos de copyright y el texto de la licencia. Conviene revisar también la licencia de `spconv` y de las dependencias transitivas antes de distribuir un producto.
- Disponibilidad comunitaria nula en el momento de los datos (0 descargas, 0 likes): no hay issues ni validaciones de terceros que sirvan de soporte.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/torch-pointcloud/part-a2.kitti-car.mmdet3d)
- [Paper: From Points to Parts (arXiv:1907.03670)](https://arxiv.org/abs/1907.03670)
- [Repositorio open-mmlab/mmdetection3d](https://github.com/open-mmlab/mmdetection3d)
- [Librería torch-pointcloud](https://github.com/arthurdjn/pytorch-pointcloud)
- [Guía de instalación de torch-pointcloud (spconv)](https://pytorch-pointcloud.org/latest/installation/)
- [DOI de PyTorch PointCloud (Zenodo)](https://doi.org/10.5281/zenodo.22159632)
