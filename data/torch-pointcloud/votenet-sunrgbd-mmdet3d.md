# torch-pointcloud/votenet.sunrgbd.mmdet3d

## Resumen

VoteNet es un detector de objetos 3D en nubes de puntos basado en el mecanismo de *deep Hough voting*, publicado originalmente por Charles R. Qi, Or Litany, Kaiming He y Leonidas J. Guibas en ICCV 2019. Este repositorio concreto, `torch-pointcloud/votenet.sunrgbd.mmdet3d`, es una conversión de los pesos oficiales de MMDetection3D al formato de la librería `torch-pointcloud`, empaquetada en safetensors y con licencia Apache-2.0.

El modelo resuelve la detección de objetos 3D (cajas orientadas con clase) a partir de nubes de puntos, en este caso entrenado sobre el benchmark SUN RGB-D con 10 clases de interior. No es un modelo de lenguaje ni un modelo generativo: es una red neuronal convolucional/PointNet++ específica para visión 3D, con tan solo 959.442 parámetros reales en safetensors (la model card redondea a 1,0 M), lo que lo convierte en un modelo extremadamente ligero y apto para despliegue en entornos con recursos limitados.

Su relevancia actual es la de servir como referencia reproducible y ligera para pipelines de detección 3D en interiores dentro del ecosistema PyTorch, y como ejemplo de conversión de pesos entre frameworks (MMDetection3D → torch-pointcloud). No obstante, conviene señalar que la información disponible es escasa: no hay datos sobre composición del dataset de entrenamiento más allá del nombre, ni sobre idiomas, ni sobre latencias medidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoteNet (deep Hough voting sobre backbone PointNet++; detector 3D) |
| Parametros totales | 959.442 (≈1,0 M segun model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D, no secuencial) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 1 |
| Clases | 10 |
| Dimensión de features | 256 |
| Dataset de entrenamiento | SUN RGB-D |
| Tarea | 3D object detection |
| Librería | torch-pointcloud |

## Arquitectura y entrenamiento

VoteNet es un detector de una sola etapa que opera directamente sobre nubes de puntos. La arquitectura consta de un backbone PointNet++ que extrae *seed points* con features de 256 canales, seguido de un módulo de votación tipo Hough que desplaza cada semilla hacia el centro del objeto al que pertenece, y finalmente un módulo de agrupación y propuesta que agrupa los votos y regresa cajas 3D orientadas con puntuaciones de clase. La innovación principal del paper original es precisamente ese mecanismo de votación: en lugar de predecir cajas directamente desde cada punto, el modelo aprende a votar por el centro del objeto, lo que mitiga la ambigüedad de las predicciones densas en nubes de puntos.

Los detalles de entrenamiento (número de épocas, aumentos de datos, función de pérdida exacta, composición del dataset) no están disponibles en la información proporcionada. La model card solo indica que se entrenó sobre SUN RGB-D con 10 clases, 1 canal de entrada y 256 features, y que los pesos se convirtieron desde MMDetection3D (Apache-2.0). No se documenta si hubo ajuste fino adicional, RLHF/DPO (no aplica en este dominio) ni innovaciones técnicas más allá de las del paper original.

## Capacidades

- Detección de objetos 3D en nubes de puntos: devuelve cajas orientadas 3D con clase y puntuación para 10 categorías de interior de SUN RGB-D.
- Extracción de features: expone `forward_features` con 256 canales por punto, útil como backbone para tareas posteriores.
- Procesamiento de nubes de puntos con coordenadas (`pos`) y color (`color`) como entradas; el pipeline interno aplica transformaciones y *collate* para lotes.
- No soporta tool calling, function calling ni agentes: no es un modelo de lenguaje.
- No soporta multilingüismo ni generación de texto.
- No dispone de modo *thinking*, visión 2D general, audio ni otras capacidades multimodales más allá de la nube de puntos 3D.
- Inferencia en PyTorch (CPU/GPU) mediante la librería `torch-pointcloud`.

## Casos de uso

- Detección de objetos en escenas de interior para robótica móvil: el modelo puede localizar sillas, mesas, camas y otras 10 clases de SUN RGB-D a partir de nubes de puntos de un sensor RGB-D, proporcionando cajas 3D orientadas que un planificador de navegación puede consumir. Su tamaño (≈1 M de parámetros) permite ejecutarlo en el propio robot.
- Preprocesado para realidad aumentada: identificar y posicionar objetos 3D en una habitación escaneada para anclar contenido virtual de forma coherente con la geometría real.
- Anotación semiautomática de datasets 3D: usar las detecciones como propuestas iniciales que un anotador humano revisa, reduciendo el coste de etiquetado de nuevas nubes de puntos de interior.
- Benchmark y validación de pipelines de detección 3D: al ser una conversión de MMDetection3D con métricas declaradas (mAP@0.25 59,8; mAP@0.5 36,87), sirve como referencia para comprobar la corrección de un pipeline propio en `torch-pointcloud`.
- Extracción de features para clasificación o segmentación posterior: `forward_features` devuelve 256 canales por punto que pueden alimentar cabezas ligeras para tareas auxiliares (por ejemplo, segmentación semántica de escenas de interior).
- Prototipado en entornos con recursos limitados: al caber holgadamente en cualquier GPU consumer e incluso en CPU para lotes pequeños, permite iterar rápidamente en investigación sin infraestructura dedicada.
- Educación y reproducción de resultados: implementación ligera y de licencia permisiva para cursos o talleres sobre detección 3D y deep Hough voting.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados):

| Benchmark | Métrica | Valor |
|---|---|---|
| SUN RGB-D | mAP@0.25 | 59,8 |
| SUN RGB-D | mAP@0.5 | 36,87 |

No se han publicado en la información disponible resultados comparativos adicionales (por ejemplo, frente a otros detectores 3D) ni latencias o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con ≈1 M de parámetros y features de 256 canales, el modelo ocupa del orden de unos pocos MB en FP32, por lo que cualquier GPU con 2 GB o más es suficiente. No se dispone de mediciones exactas en la información proporcionada.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; funcionará en RTX 3060, RTX 4090, A100 o H100 sin problema, pero el cuello de botella será el preprocesado de la nube de puntos, no el modelo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer con al menos 2 GB de VRAM; también es viable en CPU para lotes pequeños.
- Opciones de despliegue: `torch-pointcloud` (librería nativa del modelo) sobre PyTorch; no se han publicado exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni Ollama (no aplican a este dominio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | mAP@0.25 (SUN RGB-D) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| votenet.sunrgbd.mmdet3d (este) | ≈1,0 M | nube de puntos, 10 clases | 59,8 | Apache-2.0 | HuggingFace, torch-pointcloud |
| VoteNet original (MMDetection3D) | ≈1,0 M | nube de puntos, 10 clases | ≈59,8 (referencia del paper) | Apache-2.0 | GitHub open-mmlab |
| Otros detectores 3D de la familia MMDetection3D | no disponible | nube de puntos | no disponible | Apache-2.0 | GitHub open-mmlab |

No se dispone en la información proporcionada de datos comparativos con alternativas como PointPillars, CenterPoint o FCAF3D sobre SUN RGB-D, por lo que la comparativa se limita a la referencia del propio paper y a la implementación de origen.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente sobre SUN RGB-D con 10 clases de interior; no generaliza a exteriores, vehículos autónomos ni categorías fuera de ese conjunto.
- Métricas no verificadas: los valores de mAP declarados en la model card tienen `verified: false`; conviene reproducirlos antes de usarlos como referencia en producción.
- Sesgos de dataset: SUN RGB-D tiene una distribución concreta de escenas de interior (habitaciones domésticas y de oficina), lo que puede introducir sesgos de clase y de geometría.
- Riesgo de falsos positivos y negativos en escenas con oclusiones severas o nubes de puntos muy dispersas; el mecanismo de votación mitiga pero no elimina este problema.
- Sin información sobre idiomas ni texto: no aplica, pero conviene no confundirlo con un modelo multimodal.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; no obstante, los pesos derivan de MMDetection3D, cuya licencia también es Apache-2.0, por lo que se recomienda conservar los avisos de copyright.
- Documentación escasa: no se detallan hiperparámetros de entrenamiento, composición del dataset ni procedimiento de conversión, lo que dificulta la reproducibilidad exacta.
- Sin variantes cuantizadas publicadas: si se necesita despliegue en edge, habrá que generar la cuantización manualmente.

## Enlaces

- HuggingFace: https://huggingface.co/torch-pointcloud/votenet.sunrgbd.mmdet3d
- Paper (Deep Hough Voting for 3D Object Detection in Point Clouds): https://arxiv.org/abs/1904.09664
- Repositorio de la librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- MMDetection3D (origen de los pesos): https://github.com/open-mmlab/mmdetection3d
- DOI de la librería: https://doi.org/10.5281/zenodo.22159632
