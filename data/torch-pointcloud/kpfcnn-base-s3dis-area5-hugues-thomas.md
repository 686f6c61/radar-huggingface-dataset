# torch-pointcloud/kpfcnn-base.s3dis-area5.hugues-thomas

## Resumen

`kpfcnn-base.s3dis-area5.hugues-thomas` es un modelo de segmentación semántica de nubes de puntos 3D basado en KPConv (Kernel Point Convolution), la arquitectura de convolución deformable sobre puntos presentada por Hugues Thomas et al. en ICCV 2019. El modelo ha sido convertido y empaquetado por el proyecto `torch-pointcloud` (Arthur Dujardin) a partir de la implementación de referencia `HuguesTHOMAS/KPConv-PyTorch`, y se distribuye con pesos en formato safetensors y licencia MIT.

No es un modelo de lenguaje: es un modelo de visión 3D que asigna una etiqueta semántica a cada punto de una escena, con 13 clases de interior (suelo, pared, silla, mesa, etc.). Con 24,4 millones de parámetros, 5 canales de entrada (coordenadas XYZ más color RGB) y 128 características internas, está entrenado sobre el dataset S3DIS con validación en el Area 5, el protocolo estándar de evaluación de segmentación semántica de interiores.

Su relevancia práctica está en que ofrece un checkpoint listo para usar vía `pip install torch-pointcloud`, sin necesidad de reproducir el pipeline de entrenamiento original, y con una API homogénea para inferencia y extracción de características. Es útil como línea base reproducible para tareas de comprensión de escenas interiores y como extractor de descriptores por punto para modelos posteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KPConv / KP-FCNN (Kernel Point Convolution, convolución deformable sobre nubes de puntos) |
| Parametros totales | 24.419.651 (24,4 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de nubes de puntos; en el ejemplo de la model card se usan 8192 puntos por muestra) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de visión 3D, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 5 (XYZ + RGB) |
| Clases de salida | 13 (S3DIS) |
| Dimension de caracteristicas | 128 |
| Dataset de entrenamiento/evaluacion | S3DIS, validación en Area 5 |
| Libreria | torch-pointcloud |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

KPConv sustituye las convoluciones sobre rejilla por convoluciones definidas directamente en el espacio euclídeo de la nube de puntos: un conjunto de "kernel points" con pesos aprendidos se dispersa alrededor de cada punto y la respuesta se agrega ponderando por la distancia a dichos kernel points. La variante deformable aprende además desplazamientos por kernel point, lo que permite adaptar la geometría del filtro a la densidad y forma local de la superficie. El modelo empaquetado es un KP-FCNN (fully convolutional network sobre KPConv) con 128 características por capa y una cabeza de clasificación por punto sobre 13 clases.

El checkpoint corresponde al entrenamiento estándar sobre S3DIS con partición por áreas y evaluación en el Area 5, con entrada de 5 canales (posición y color). La model card no documenta el número exacto de tokens/puntos vistos, la composición detallada del dataset, ni si hubo aumentos de datos o estrategias de regularización específicas más allá de lo descrito en el paper original. Tampoco se indica ningún proceso de ajuste por preferencias (RLHF/DPO), algo que no aplica a esta familia de modelos. La conversión desde la implementación de referencia a `torch-pointcloud` es el principal trabajo de ingeniería asociado a esta publicación.

## Capacidades

- Segmentación semántica por punto en escenas interiores: asigna una de 13 clases S3DIS a cada punto de la nube.
- Consumo de nubes de puntos con atributos de color (5 canales de entrada: XYZ + RGB).
- Extracción de características por punto mediante `forward_features`, devolviendo descriptores de dimensión 128.
- Posibilidad de reutilizar el backbone como extractor congelado (`reset_classifier(num_classes=0)`) para tareas posteriores.
- Procesamiento por lotes con gestión de índices de batch (`data["batch"]`), lo que permite agrupar varias nubes en una sola pasada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües, de audio ni de visión 2D.
- No dispone de modo "thinking" ni de decodificación especulativa.

## Casos de uso

- Digitalización de interiores y BIM: el modelo etiqueta suelo, paredes, techos, mobiliario y elementos estructurales punto a punto, lo que permite generar inventarios semánticos de espacios escaneados con LiDAR o fotogrametría antes de alimentar un modelo BIM.
- Robótica móvil en interiores: un robot puede usar las etiquetas por punto para distinguir superficies transitables (suelo) de obstáculos (mesas, sillas, paredes) y planificar navegación, aprovechando que el modelo procesa la nube completa sin rasterizar.
- Realidad aumentada y gemelos digitales: segmentar la escena para anclar objetos virtuales sobre superficies identificadas (mesas, paredes) y para ocluir geometría real con etiquetas semánticas.
- Análisis de accesibilidad y cumplimiento normativo: detectar y cuantificar elementos como puertas, ventanas, escaleras o sillas en un escaneo para auditorías de espacios, usando la salida por punto como base de conteo y medición.
- Preprocesado para pipelines de reconstrucción: emplear los descriptores de 128 dimensiones de `forward_features` como entrada para clasificadores de escena, clustering de objetos o modelos de detección 3D posteriores.
- Etiquetado asistido y control de calidad de datasets: usar las predicciones del modelo como preanotación en herramientas de anotación 3D, reduciendo el coste manual en la creación de nuevos conjuntos de datos de interiores.
- Investigación en visión 3D: línea base reproducible para comparar variantes de convolución sobre puntos (PointNet++, RandLA-Net, MinkowskiNet) bajo el mismo protocolo S3DIS Area 5.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (no verificados de forma independiente, `verified: false`):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| S3DIS (Area 5) | Segmentacion semantica de nubes de puntos | mIoU | 66,6 |
| S3DIS (Area 5) | Segmentacion semantica de nubes de puntos | OA (accuracy global) | 89,64 |

No se han publicado en la informacion disponible resultados adicionales (por clase, por área, latencia o throughput) ni comparaciones numéricas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 24,4 M de parámetros en FP32, los pesos ocupan aproximadamente 98 MB; el consumo real está dominado por las activaciones de la nube de puntos (en el ejemplo, 8192 puntos por muestra) y por el tamaño del batch.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos unos pocos GB de VRAM es suficiente para inferencia en FP32; no se documentan requisitos mínimos oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas tipo RTX 3060/4060 en adelante para lotes moderados; no hay cifras oficiales de consumo por configuración.
- Opciones de despliegue: la vía soportada es la librería `torch-pointcloud` (`pip install torch-pointcloud`) sobre PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Dataset / protocolo | mIoU (S3DIS Area 5) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kpfcnn-base.s3dis-area5 (este modelo) | 24,4 M | XYZ + RGB (5 canales) | S3DIS Area 5 | 66,6 (declarado, no verificado) | MIT | Hugging Face, via torch-pointcloud |
| KPConv original (HuguesTHOMAS/KPConv-PyTorch) | no disponible en la informacion | XYZ + RGB | S3DIS Area 5 | no disponible en la informacion | MIT | GitHub |
| PointNet++ | no disponible en la informacion | XYZ (+ normales/color) | S3DIS Area 5 | no disponible en la informacion | no disponible | Implementaciones multiples |
| RandLA-Net | no disponible en la informacion | XYZ + RGB | S3DIS Area 5 | no disponible en la informacion | no disponible | GitHub |

No se dispone en la informacion proporcionada de cifras de parámetros, contexto ni rendimiento de los modelos alternativos, por lo que la comparación cuantitativa queda limitada al dato declarado de este checkpoint.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente en S3DIS (escenas de interior de oficinas y aulas); el rendimiento fuera de ese dominio (exteriores, industria, escaneos con sensores distintos) no está caracterizado.
- Dependencia del color: la entrada incluye RGB; sin color fiable (por ejemplo, LiDAR sin cámara) el modelo puede degradarse, ya que no se documenta una variante solo-geométrica.
- Métricas no verificadas: los valores de mIoU y OA provienen del model-index del autor con `verified: false`; no hay validación independiente publicada en la información disponible.
- Sin datos de sesgo ni de calibración: no se documentan análisis de sesgo por clase, por densidad de nube ni por tipo de sensor.
- Riesgo de error en clases minoritarias: la mIoU agregada no informa del comportamiento por clase; clases poco representadas pueden tener IoU muy bajo.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución; deben respetarse además las condiciones de los datos S3DIS y citar los trabajos originales (KPConv y S3DIS) según indica la model card.
- Sin soporte documentado de cuantización ni de exportación a formatos de inferencia optimizados (ONNX, TensorRT), lo que limita despliegues de baja latencia sin trabajo adicional.
- Ausencia de garantías de producción: no se publican latencias, curvas de rendimiento ni pruebas de robustez frente a ruido, oclusiones o densidades variables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/kpfcnn-base.s3dis-area5.hugues-thomas
- Paper KPConv (arXiv): https://arxiv.org/abs/1904.08889
- Implementación de referencia KPConv: https://github.com/HuguesTHOMAS/KPConv-PyTorch
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Dataset S3DIS (referencia en la model card): Armeni et al., "3D Semantic Parsing of Large-Scale Indoor Spaces", CVPR 2016
