# torch-pointcloud/kpfcnn-base-sm-deform.s3dis-area5.hugues-thomas

# torch-pointcloud/kpfcnn-base-sm-deform.s3dis-area5.hugues-thomas

## Resumen

kpfcnn-base-sm-deform.s3dis-area5.hugues-thomas es un modelo de segmentación semántica de nubes de puntos 3D publicado por el proyecto torch-pointcloud. No es un modelo de lenguaje: es una red convolucional para nubes de puntos basada en KPConv con kernel deformable (deformable kernel point convolution), la arquitectura propuesta en el paper "KPConv: Flexible and Deformable Convolution for Point Clouds" (ICCV 2019). El modelo tiene 25.629.701 parámetros, 5 canales de entrada, 128 características internas y una cabeza de clasificación de 13 clases, y está entrenado sobre el dataset S3DIS siguiendo el protocolo de validación en el Area 5.

El modelo se distribuye como pesos safetensors (0,1 GB de repositorio) y se carga mediante la librería torch-pointcloud, que expone una API `create_model` con soporte de `pretrained=True`, extracción de características (`forward_features`) y reinicialización del clasificador (`reset_classifier`). Es, por tanto, una pieza de infraestructura para pipelines de percepción 3D: escaneo de interiores, gemelos digitales, robótica o preetiquetado de datos.

Su relevancia práctica es doble. Por un lado, empaqueta una implementación de referencia de KPConv (originalmente en HuguesTHOMAS/KPConv-PyTorch) en un formato cargable desde HuggingFace con pesos convertidos y licencia MIT. Por otro, ofrece un punto de partida reproducible para tareas de segmentación de interiores, con métricas declaradas de mIoU 66,01 y OA 89,53 sobre S3DIS Area 5, muy próximas al 66,7 de referencia citado en la propia model card. El repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KPConv deformable (kernel point convolution) sobre nubes de puntos; red convolucional jerárquica, no transformer |
| Parametros totales | 25.629.701 (25,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es una nube de puntos de cardinalidad variable (el ejemplo de la model card usa 8192 puntos) |
| Tipos de cuantizacion | no disponible; la model card no declara cuantizaciones ni pesos reducidos (se distribuyen pesos safetensors) |
| Idiomas soportados | no aplica (modelo de visión 3D; no procesa texto ni audio) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | segmentación semántica de nubes de puntos (point-cloud-segmentation) |
| Canales de entrada | 5 |
| Clases de salida | 13 |
| Dimension de caracteristicas | 128 |
| Dataset de entrenamiento | S3DIS (protocolo Area 5) |
| Tamano del repositorio | 0,1 GB |
| Libreria de carga | torch-pointcloud |
| Fecha de creacion / actualizacion | 2026-08-28 / 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura es una KPConv deformable. KPConv define convoluciones directamente sobre nubes de puntos: en lugar de proyectar a vóxeles o a imágenes, coloca un conjunto de "kernel points" en el espacio 3D y pondera la contribución de cada vecino según su distancia a dichos puntos. La variante deformable aprende además un desplazamiento por kernel point, de modo que las posiciones del kernel se adaptan a la geometría local en cada capa, en lugar de permanecer en una rejilla rígida. El modelo se organiza en una jerarquía de capas con submuestreo de la nube (grid subsampling) y operaciones de vecindad, con 128 características por punto en las capas internas y una cabeza de clasificación sobre 13 clases.

Según la model card, los pesos se han convertido desde la implementación de referencia HuguesTHOMAS/KPConv-PyTorch (MIT) y se cargan a través de la librería torch-pointcloud. El entrenamiento se realizó sobre S3DIS, un dataset de escaneos de interiores a escala de habitación, evaluando con el protocolo de dejar fuera el Area 5. La información proporcionada no detalla el número de tokens/puntos vistos durante el entrenamiento, la composición exacta del dataset, si se aplicaron técnicas de aumento de datos ni si hubo etapas de refinamiento posteriores (RLHF/DPO no aplican a un modelo discriminativo de este tipo). Tampoco se documenta la composición de los 5 canales de entrada; el ejemplo de uso de la model card combina posiciones (`pos`, 3 valores) y color (`color`, 3 valores) antes de aplicar la transformación del modelo, por lo que la correspondencia exacta entre ambos debe verificarse en el código de la librería.

## Capacidades

- Segmentación semántica densa de nubes de puntos: asigna una de 13 clases a cada punto de la nube de entrada (clases definidas por S3DIS, no listadas en la model card).
- Procesamiento de nubes de puntos de tamaño variable: la API acepta tensores de posiciones, características y un índice de batch, por lo que admite tanto una habitación completa como lotes de varias nubes.
- Extracción de características: `forward_features` y `reset_classifier(num_classes=0)` devuelven un embedding de 128 dimensiones por punto, reutilizable como backbone en tareas posteriores.
- Entrada multimodal geométrica y radiométrica: 5 canales de entrada, lo que permite combinar coordenadas con información de color u otros atributos por punto según la transformación configurada.
- Integración nativa con PyTorch: los pesos se cargan directamente en un módulo `torch.nn.Module`, ejecutable en CPU o GPU.
- No dispone de generación de texto, tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión 2D, audio ni capacidades multilingües. Estas categorías no aplican a este modelo.

## Casos de uso

- Gemelos digitales de edificios: segmentar escaneos de interiores para separar suelo, paredes, techos y mobiliario, obteniendo una nube etiquetada que alimenta visores 3D y sistemas de gestión de activos.
- Verificación as-built frente a BIM: comparar la semántica extraída de un escaneo con el modelo CAD del edificio para detectar elementos ausentes, mal ubicados o no documentados en obra.
- Inventario de mobiliario y facility management: contar y localizar sillas, mesas, estanterías u otros elementos escaneados, con salida a nivel de punto que después se agrupa en instancias.
- Percepción para robótica móvil en interiores: usar el modelo como módulo de segmentación para identificar superficies transitables y obstáculos a partir de la nube de puntos de un LiDAR o cámara de profundidad.
- Preetiquetado y anotación semiautomática: generar etiquetas iniciales sobre nubes no anotadas para reducir el coste de anotación manual, revisando después únicamente las regiones de baja confianza.
- Backbone para tareas downstream: extraer embeddings de 128 dimensiones por punto y entrenar cabezas ligeras para clasificación de escenas, detección de objetos 3D o recuperación de escenas similares.
- Inspección y documentación de patrimonio construido: segmentar elementos arquitectónicos en escaneos de edificios históricos para documentación, restauración o análisis estructural.
- Generación de datos sintéticos y simulación: etiquetar escenas sintéticas o reales para entrenar otros modelos, o alimentar motores de simulación con semántica por punto.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (métricas no verificadas de forma independiente):

| Dataset | Tarea | Metrica | Valor | Verificado |
|---|---|---|---|---|
| S3DIS (Area 5) | Segmentación semántica de nubes de puntos | mIoU | 66,01 | no |
| S3DIS (Area 5) | Segmentación semántica de nubes de puntos | OA | 89,53 | no |

La model card indica además un valor de referencia de mIoU 66,7 para esta configuración. No se han publicado en la información disponible resultados adicionales (por ejemplo, por clase, sobre otras áreas de S3DIS u otros datasets).

## Requisitos de hardware

- Pesos en precisión de entrenamiento (32 bits): aproximadamente 102,5 MB (25,63 M de parámetros x 4 bytes). En 16 bits, unos 51 MB. Estimación propia a partir del recuento de parámetros.
- La VRAM real está dominada por las activaciones, que crecen con el número de puntos y con el número de vecinos por kernel point, no por el tamaño de los pesos. Como estimación orientativa: 2-4 GB para lotes pequeños (del orden de 8192 puntos, el ejemplo de la model card) y 8-12 GB o más para habitaciones completas de S3DIS procesadas de una sola pasada.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070/4080, RTX 4090 para desarrollo y lotes pequeños o medianos; A100 o H100 si se procesan escenas completas con lotes grandes o se entrena/afina.
- Cabe en GPU de consumo: sí, con margen amplio con 8 GB o más de VRAM si se limita el número de puntos por lote; con 4-6 GB conviene reducir el tamaño de la nube o procesarla por regiones.
- Opciones de despliegue: no hay soporte declarado para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje). El despliegue es vía PyTorch con la librería torch-pointcloud (`pip install torch-pointcloud`), exportable a TorchScript o formatos propios de PyTorch si se validan las operaciones de vecindad. No se declara exportación a ONNX o TensorRT.
- Latencia y throughput: no disponible. La model card no publica tiempos de inferencia ni métricas de velocidad, y estos dependen fuertemente del número de puntos por escena y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | S3DIS Area 5 (mIoU) | Licencia | Disponibilidad |
|---|---|---|---|---|
| kpfcnn-base-sm-deform.s3dis-area5.hugues-thomas (este modelo) | 25,6 M | 66,01 (declarado, no verificado) | MIT | HuggingFace, carga con torch-pointcloud |
| KPConv original, HuguesTHOMAS/KPConv-PyTorch (origen de la conversión) | no disponible en la información | 66,7 (valor de referencia citado en la model card) | MIT | GitHub |
| Otras arquitecturas de segmentación de nubes de puntos (PointNet++, RandLA-Net, Point Transformer, etc.) | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye especificaciones ni métricas de alternativas, por lo que la comparación se limita al modelo de referencia del que se convirtieron los pesos. Cualquier comparación con arquitecturas más recientes requeriría consultar sus propias publicaciones y repositorios.

## Limitaciones y advertencias

- Modelo discriminativo, no generativo: no produce texto ni código, y conceptos como alucinación en el sentido de los modelos de lenguaje no aplican. El riesgo equivalente es la sobreconfianza en clases incorrectas en regiones ambiguas o escasamente representadas.
- Dominio restringido: entrenado sobre S3DIS, un dataset de interiores (habitaciones y oficinas) capturado con un sensor concreto. El rendimiento en exteriores, vehículos, escenas industriales o con sensores distintos no está documentado y no puede asumirse.
- Evaluación limitada al Area 5: no se publican resultados sobre el resto de áreas de S3DIS ni validación cruzada completa, lo que dificulta estimar la varianza del modelo.
- Métricas no verificadas: los valores de mIoU y OA del model-index están marcados como `verified: false`, es decir, son declaraciones del autor.
- Categorías fijas: la cabeza de salida está fijada a 13 clases de S3DIS. Usar otro esquema de etiquetas requiere reentrenar o reemplazar el clasificador, con datos anotados en el nuevo esquema.
- Sesgos de muestreo del dataset: S3DIS sobrerrepresenta ciertos tipos de mobiliario y distribuciones de sala; los elementos poco frecuentes tendrán un rendimiento inferior. La model card no incluye un desglose por clase que permita cuantificarlo.
- Entrada de 5 canales: si los datos de entrada no aportan esos 5 canales en el mismo orden y normalización que el entrenamiento, el rendimiento se degrada. La model card no documenta con precisión la composición ni la normalización de esos canales.
- Sin soporte de lenguaje ni multilingüismo: no aplica ni se declara.
- Licencia MIT: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright y la licencia. Conviene revisar además las condiciones de los datos de entrenamiento (S3DIS) si se redistribuye el modelo o se publican resultados derivados.
- Madurez del artefacto: 0 descargas y 0 valoraciones, sin pipeline declarado en HuggingFace, lo que indica que es un artefacto reciente y poco contrastado por la comunidad.
- Sin datos de latencia, throughput, consumo de memoria ni robustez a oclusiones, ruido o variaciones de densidad de la nube.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/kpfcnn-base-sm-deform.s3dis-area5.hugues-thomas
- Paper de KPConv (arXiv:1904.08889): https://arxiv.org/abs/1904.08889
- Repositorio original de KPConv (HuguesTHOMAS/KPConv-PyTorch, MIT): https://github.com/HuguesTHOMAS/KPConv-PyTorch
- Librería torch-pointcloud (Arthur Dujardin): https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la librería (Zenodo): https://doi.org/10.5281/zenodo.22159632
- Dataset S3DIS: referencia Armeni et al., CVPR 2016 ("3D Semantic Parsing of Large-Scale Indoor Spaces"); no se proporciona URL en la información disponible.
