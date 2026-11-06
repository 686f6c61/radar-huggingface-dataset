# torch-pointcloud/curvenet.shapenetpart.tiange-xiang

## Resumen

CurveNet es un modelo de segmentación de nubes de puntos 3D desarrollado originalmente por Tiange Xiang, Chaoyi Zhang, Yang Song, Jianhui Yu y Weidong Cai (Universidad de Sídney) y presentado en ICCV 2021 bajo el título "Walk in the Cloud: Learning Curves for Point Clouds Shape Analysis". Este checkpoint concreto es una conversión del repositorio oficial `tiangexiang/CurveNet` al formato de la librería `torch-pointcloud`, publicada por el usuario `torch-pointcloud`. Resuelve la tarea de segmentación semántica por partes sobre la nube de puntos, es decir, asignar a cada punto de una malla 3D una etiqueta de parte (por ejemplo, ala, motor o fuselaje en un avión).

El modelo es notablemente compacto: 5,5 millones de parámetros (5.571.078 según los pesos en safetensors), 50 clases de segmentación y un ancho de características de 256 dimensiones. Su innovación principal es el agrupamiento y agregación de curvas: en lugar de procesar los puntos de forma aislada o mediante vecindarios locales fijos, aprende "caminos" (walks) sobre la nube que capturan estructuras geométricas de largo alcance, lo que mejora la coherencia de las partes segmentadas.

Es relevante para desarrolladores e investigadores que trabajan en visión 3D, reconstrucción, robótica o pipelines CAD, porque ofrece un punto de partida preentrenado en ShapeNetPart con licencia MIT, integrado en un ecosistema PyTorch moderno (`torch-pointcloud` + `pyg-lib`), y con métricas de referencia publicadas (ins_mIoU 86,67 y cls_mIoU 83,79).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CurveNet (red de segmentación de nubes de puntos basada en agrupamiento y agregación de curvas/walks) |
| Parametros totales | 5.571.078 (5,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre nubes de puntos de 8.192 puntos en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo 3D, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `torch-pointcloud`) |

## Arquitectura y entrenamiento

CurveNet es una red neuronal profunda para nubes de puntos que introduce el concepto de "curvas" aprendidas: agrupa puntos mediante walks (caminos) sobre el grafo de vecindad y agrega la información a lo largo de esas secuencias, en lugar de limitarse a operaciones de vecindario local como PointNet++ o a mecanismos de atención global. La arquitectura mantiene un ancho de características de 256 dimensiones y una cabeza de clasificación sobre 50 clases de partes, lo que explica su bajo número de parámetros (5,5 M) frente a alternativas más pesadas.

El checkpoint está entrenado sobre ShapeNetPart, el conjunto de referencia para segmentación de partes en 16 categorías de objetos (aviones, sillas, coches, etc.) con 50 etiquetas de parte en total. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la referencia a ShapeNetPart, ni indica si se aplicaron técnicas de refinamiento posteriores como RLHF o DPO (no aplicables en este dominio). La innovación técnica destacable es el mecanismo de curve grouping y aggregation descrito en el paper de ICCV 2021.

## Capacidades

- Segmentación de partes en nubes de puntos 3D: asigna una etiqueta de parte a cada punto de una nube de entrada.
- Clasificación de categoría de objeto: el modelo recibe la categoría como entrada (`data["category"]`) y la utiliza para condicionar la segmentación.
- Extracción de características: expone `forward_features` y `reset_classifier(num_classes=0)` para obtener embeddings de 256 dimensiones por nube.
- Procesamiento de nubes de hasta 8.192 puntos en el ejemplo oficial de uso.
- Integración con el ecosistema PyTorch mediante `torch-pointcloud` y `pyg-lib`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente geométrico/3D.

## Casos de uso

- Segmentación de piezas en escaneos 3D industriales: el modelo etiqueta cada punto de una nube capturada por un escáner con su parte correspondiente, lo que permite separar componentes de una pieza mecánica para inspección o control de calidad.
- Reconstrucción y edición CAD asistida: dado un modelo 3D escaneado, la segmentación por partes facilita seleccionar, aislar o modificar regiones concretas (por ejemplo, el asiento de una silla) en herramientas de diseño.
- Robótica de manipulación: un brazo robótico puede usar la segmentación por partes para identificar el punto de agarre o la parte desmontable de un objeto antes de interactuar con él.
- Anotación semiautomática de datasets 3D: el modelo preentrenado en ShapeNetPart sirve como etiquetador inicial para acelerar el etiquetado de nuevas nubes de puntos, revisando y corrigiendo las predicciones.
- Investigación en visión 3D: base reproducible para comparar arquitecturas de segmentación de partes, gracias a sus métricas publicadas y a su integración con `torch-pointcloud`.
- Preentrenamiento y fine-tuning: los embeddings de 256 dimensiones pueden reutilizarse como extractor de características para tareas posteriores de clasificación o detección sobre nubes de puntos.
- Docencia y prototipado: su reducido tamaño (5,5 M de parámetros) permite ejecutarlo en entornos de laboratorio con recursos limitados para experimentar con segmentación 3D.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Segmentación de partes en nubes de puntos | ShapeNetPart | ins_mIoU | 86,67 |
| Segmentación de partes en nubes de puntos | ShapeNetPart | cls_mIoU | 83,79 |

No se han publicado en la información disponible otros resultados de benchmarks ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de cientos de MB, dado que el modelo tiene 5,5 M de parámetros y procesa nubes de 8.192 puntos; no se dispone de una cifra oficial.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el modelo cabe holgadamente en tarjetas de consumo como RTX 3060, RTX 4060 o superiores, así como en A100 o H100 si se integra en un pipeline mayor.
- Cabe en GPU de consumo: sí, con amplio margen.
- Opciones de despliegue: la vía oficial es la librería `torch-pointcloud` junto con `pyg-lib` (compilado para la versión de PyTorch y CUDA correspondientes). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos numéricos de modelos comparables (por ejemplo, PointNet++, DGCNN o Point Transformer) sobre ShapeNetPart para establecer una comparación rigurosa. A continuación se indican únicamente los datos conocidos de este modelo:

| Modelo | Parámetros | Contexto / entrada | ins_mIoU (ShapeNetPart) | Licencia |
|---|---|---|---|---|
| CurveNet (este checkpoint) | 5,5 M | nubes de puntos (8.192 puntos en el ejemplo) | 86,67 | MIT |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en segmentación de partes de nubes de puntos; no es un modelo de lenguaje ni admite otras modalidades.
- Requiere conocer la categoría del objeto como entrada (`data["category"]`), lo que limita su uso en escenarios donde la categoría no se conoce a priori.
- Entrenado sobre ShapeNetPart (16 categorías de objetos); su generalización a categorías o dominios no vistos (escaneos reales con ruido, oclusiones o densidades distintas) no está documentada.
- Las métricas publicadas están marcadas como no verificadas (`verified: false`) en la model card.
- Dependencia de `pyg-lib`, que debe compilarse para la versión concreta de PyTorch y CUDA, lo que puede complicar el despliegue en producción.
- Riesgo de alucinación en el sentido geométrico: puede asignar etiquetas de parte inconsistentes en regiones ambiguas o con pocos puntos.
- No se documentan sesgos conocidos ni restricciones adicionales de la licencia MIT para uso comercial; la licencia MIT permite uso comercial, modificación y redistribución con atribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/curvenet.shapenetpart.tiange-xiang
- Paper (arXiv): https://arxiv.org/abs/2105.01288
- Repositorio original CurveNet: https://github.com/tiangexiang/CurveNet
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
