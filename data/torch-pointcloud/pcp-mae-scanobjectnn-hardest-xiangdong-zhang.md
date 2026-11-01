# torch-pointcloud/pcp-mae.scanobjectnn-hardest.xiangdong-zhang

## Resumen

PCP-MAE es un modelo de clasificación de nubes de puntos 3D basado en un autoencoder enmascarado de puntos (masked point autoencoder) que predice los centros de las regiones enmascaradas en lugar de reconstruir las coordenadas punto a punto. Esta ficha concreta, `pcp-mae.scanobjectnn-hardest.xiangdong-zhang`, es el checkpoint afinado del preentrenamiento `pcp-mae.pretrain.xiangdong-zhang` sobre la partición más difícil del dataset ScanObjectNN (PB_T50_RS), con 15 clases de objetos reales escaneados.

El modelo lo desarrollan Xiangdong Zhang, Shaofeng Yan y Junchi Yan (paper NeurIPS 2024) y ha sido convertido al ecosistema `torch-pointcloud` por Arthur Dujardin. Con 22,3 millones de parámetros y features de 768 dimensiones, es un modelo compacto pensado para tareas de percepción 3D en robótica, conducción autónoma y análisis de escenas, no para generación de texto ni tareas de lenguaje.

Su relevancia actual radica en que demuestra que un enfoque de predicción de centros (en lugar de reconstrucción directa) mejora la calidad de las representaciones aprendidas en el preentrenamiento auto-supervisado de nubes de puntos, alcanzando un 90,28 % de accuracy global en el benchmark más exigente de ScanObjectNN con un coste computacional muy contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para nubes de puntos con masked point autoencoder (predicción de centros) |
| Parametros totales | 22.341.263 (22,3 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (nubes de 8192 puntos en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Clases de salida | 15 |
| Dimension de features | 768 |
| Dataset de evaluacion | ScanObjectNN (PB_T50_RS) |
| Libreria | torch-pointcloud |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo sigue la familia de masked point autoencoders (MAE adaptados a nubes de puntos). La innovación principal de PCP-MAE es que, en lugar de reconstruir las coordenadas de los puntos enmascarados, el decodificador predice los centros de los grupos de puntos enmascarados. Este objetivo de predicción de centros actúa como una señal de supervisión más estable y semánticamente significativa que la reconstrucción punto a punto, lo que se traduce en mejores representaciones para tareas posteriores de clasificación y segmentación.

El flujo de entrenamiento es en dos fases: primero un preentrenamiento auto-supervisado sobre nubes de puntos (checkpoint `pcp-mae.pretrain.xiangdong-zhang`) y después un afinado supervisado sobre ScanObjectNN, en su variante PB_T50_RS (la partición con perturbaciones y rotaciones, considerada la más difícil del benchmark). El modelo resultante tiene 15 clases de salida y una dimensión de embedding de 768. No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset de preentrenamiento ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Clasificación de nubes de puntos 3D en 15 categorías de objetos (ScanObjectNN).
- Extracción de features (embeddings de 768 dimensiones) mediante `forward_features` o `reset_classifier(num_classes=0)`.
- Robustez ante perturbaciones: el checkpoint está afinado sobre la partición PB_T50_RS, que incluye rotaciones y perturbaciones de los objetos.
- Procesamiento de nubes de puntos de 8192 puntos por muestra en el ejemplo de uso.
- Integración con el ecosistema `torch-pointcloud` y PyTorch.
- No soporta tool calling, agentes, generación de texto, visión 2D, audio ni capacidades multilingües.

## Casos de uso

- Clasificación de objetos en robótica móvil: el modelo puede etiquetar nubes de puntos capturadas por LiDAR o cámaras de profundidad para que un robot identifique objetos del entorno (sillas, mesas, puertas) y planifique la manipulación.
- Inspección de inventario en almacenes: clasificación de objetos escaneados en 3D sobre cintas transportadoras, aprovechando la robustez del checkpoint ante rotaciones y perturbaciones del dataset PB_T50_RS.
- Preprocesado para conducción autónoma: uso del modelo como extractor de features 3D (`forward_features`) para alimentar etapas posteriores de detección o segmentación en pipelines de percepción.
- Análisis de escenas escaneadas en interior: clasificación de muebles y objetos en reconstrucciones 3D de viviendas u oficinas para aplicaciones de realidad aumentada o modelado BIM.
- Búsqueda y recuperación de objetos 3D: uso de los embeddings de 768 dimensiones para indexar nubes de puntos y realizar búsquedas por similitud en catálogos de modelos 3D.
- Docencia e investigación en aprendizaje 3D: el modelo sirve como baseline reproducible (MIT, 22,3 M de parámetros) para experimentos de clasificación de nubes de puntos y comparación de métodos auto-supervisados.
- Control de calidad industrial: clasificación de piezas escaneadas en 3D para detectar categorías o piezas defectuosas en líneas de fabricación.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Benchmark | Metrica | Valor |
|---|---|---|
| ScanObjectNN (PB_T50_RS) | OA (overall accuracy) | 90,28 |
| ScanObjectNN (PB_T50_RS) | mAcc (mean accuracy) | 89,42 |

No se han publicado en la información disponible resultados adicionales de benchmarks ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 22,3 M de parámetros en fp32 el modelo ocupa aproximadamente 90 MB de pesos, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. Para lotes grandes de nubes de 8192 puntos, una RTX 4090 o A100 acelera el throughput.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: PyTorch nativo con la librería `torch-pointcloud` (`tp.create_model(...)`), exportación a TorchScript/ONNX no documentada en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos numéricos de modelos comparables (Point-MAE, PointNet++, Point Transformer, etc.) para construir una comparativa rigurosa. Se indica "no disponible".

| Modelo | Parametros | Contexto | OA en ScanObjectNN PB_T50_RS | Licencia |
|---|---|---|---|---|
| pcp-mae.scanobjectnn-hardest | 22,3 M | no aplica (nubes de puntos) | 90,28 | MIT |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo específico de clasificación de nubes de puntos: no genera texto, no procesa imágenes 2D, audio ni lenguaje natural.
- El dominio de entrenamiento es ScanObjectNN (objetos de interior escaneados); el rendimiento puede degradarse en escenas exteriores, LiDAR de larga distancia o categorías fuera de las 15 clases.
- Riesgo de sobreajuste al benchmark: los resultados declarados (OA 90,28) no están verificados (`verified: false`) y provienen del propio autor.
- No se documentan sesgos específicos ni análisis de robustez fuera de PB_T50_RS.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda citar el paper original y el software `torch-pointcloud` según indica la model card.
- El checkpoint depende de la librería `torch-pointcloud` para cargarse correctamente; no se documenta compatibilidad con otros frameworks.
- No se dispone de información sobre cuantización, por lo que el despliegue en entornos de muy bajos recursos no está documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/pcp-mae.scanobjectnn-hardest.xiangdong-zhang
- Modelo base (preentrenamiento): https://huggingface.co/torch-pointcloud/pcp-mae.pretrain.xiangdong-zhang
- Paper PCP-MAE (arXiv): https://arxiv.org/abs/2408.08753
- Repositorio original PCP-MAE: https://github.com/aHapBean/PCP-MAE
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
