# torch-pointcloud/spvcnn-47gmacs.semantickitti.mit-han-lab

## Resumen

SPVCNN (47 GMACs) es un modelo de segmentación semántica de nubes de puntos LiDAR, concretamente la variante de 47 GMACs de la arquitectura Sparse Point-Voxel Convolution (SPVCNN), publicada por el grupo de Song Han en el MIT (mit-han-lab) en el artículo "Searching Efficient 3D Architectures with Sparse Point-Voxel Convolution" (ECCV 2020). Este checkpoint concreto es una conversión al formato de la librería `torch-pointcloud` realizada por el usuario `torch-pointcloud`, que empaqueta los pesos originales del repositorio `mit-han-lab/spvnas` en safetensors para su uso directo con PyTorch.

El modelo resuelve la tarea de asignar una de 19 clases semánticas (vehículo, peatón, carretera, edificio, vegetación, etc.) a cada punto de una escena LiDAR, un paso fundamental en percepción para conducción autónoma, robótica móvil y cartografía 3D. Su relevancia radica en que combina la eficiencia de las convoluciones dispersas en vóxeles con la fidelidad geométrica de las representaciones basadas en puntos, logrando un equilibrio entre precisión y coste computacional que lo hace desplegable en sistemas con recursos limitados.

Con solo 8,8 millones de parámetros y 47 GMACs por fotograma, es un modelo compacto comparado con los transformers 3D y las redes densas de gran tamaño. Está entrenado sobre SemanticKITTI, el benchmark de referencia para segmentación semántica de secuencias LiDAR, y declara un mIoU de 61,59 y una exactitud global (OA) de 92,22 sobre dicho dataset.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SPVCNN (Sparse Point-Voxel Convolution), red convolucional híbrida punto-vóxel |
| Parámetros totales | 8.802.021 (8,8 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de nubes de puntos, no de secuencia de texto) |
| Tipos de cuantización | no disponible (los pesos se distribuyen en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (x, y, z, intensidad) |
| Clases de salida | 19 |
| Dimensión de características | 61 |
| Coste computacional | 47 GMACs |
| Dataset de entrenamiento | SemanticKITTI |
| Librería | torch-pointcloud (requiere torchsparse) |

## Arquitectura y entrenamiento

SPVCNN es una red convolucional 3D que combina dos representaciones complementarias de la nube de puntos. Por un lado, una rama de convolución dispersa sobre vóxeles, que procesa la escena de forma eficiente al operar únicamente sobre las celdas ocupadas y permitir un crecimiento del campo receptivo con bajo coste. Por otro, una rama de convolución sobre puntos que preserva la geometría original y evita la pérdida de información provocada por la voxelización. Ambas ramas se fusionan de forma iterativa en bloques SPVConv, de modo que el modelo aprovecha la eficiencia de la rejilla dispersa y la fidelidad de la representación puntual.

La variante aquí publicada corresponde al punto de la curva de compromiso precisión/coste de 47 GMACs, obtenido mediante la búsqueda de arquitecturas descrita en el artículo original, que explora el espacio de diseño de bloques SPVConv bajo restricciones de latencia. El modelo se entrena de forma supervisada sobre SemanticKITTI con 19 clases, tomando como entrada cuatro canales (coordenadas e intensidad) y produciendo logits por punto. La model card no documenta el número exacto de tokens ni la composición detallada del dataset más allá de la referencia a SemanticKITTI, ni indica si se emplearon técnicas de refinamiento posteriores al entrenamiento supervisado.

La innovación técnica principal es la propia convolución dispersa punto-vóxel, que reduce drásticamente el coste de memoria frente a las convoluciones densas 3D y permite ejecutar el modelo en GPUs de gama media. El checkpoint distribuido en este repositorio es una conversión directa de los pesos de `mit-han-lab/spvnas` al formato safetensors, con los transformadores de datos y el pipeline de inferencia integrados en `torch-pointcloud`.

## Capacidades

- Segmentación semántica por punto de nubes de puntos LiDAR en 19 clases de SemanticKITTI.
- Procesamiento de escenas 3D dispersas con entradas de 4 canales (posición e intensidad).
- Extracción de características por punto mediante `forward_features`, con salida de 61 dimensiones reutilizable para tareas aguas abajo.
- Clasificación configurable mediante `reset_classifier`, lo que permite adaptar la cabeza de salida a otro número de clases.
- Inferencia por lotes con gestión de índices de batch (`collate`) para procesar varias nubes simultáneamente.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente perceptivo y no generativo.
- No dispone de modo de razonamiento (thinking mode), visión 2D, audio ni generación de texto.

## Casos de uso

- Percepción en conducción autónoma: el modelo etiqueta cada retorno LiDAR de un vehículo con clases como coche, peatón, carretera o edificio, proporcionando la base para la planificación de trayectorias y la detección de obstáculos. Su coste de 47 GMACs permite ejecutarlo en tiempo real en GPUs embarcadas de gama media.
- Robótica móvil en interiores y exteriores: un robot equipado con LiDAR puede usar el modelo para construir mapas semánticos del entorno y distinguir superficies transitables de obstáculos, con la ventaja de que solo requiere 8,8 M de parámetros y cabe en memoria de dispositivos con recursos acotados.
- Cartografía y gemelos digitales: procesamiento por lotes de secuencias LiDAR para generar nubes de puntos etiquetadas que alimenten sistemas de información geográfica, inventarios de mobiliario urbano o modelos 3D de ciudades.
- Análisis de escenas para vehículos aéreos y terrestres no tripulados: segmentación de terreno, vegetación y estructuras en vuelos de inspección o misiones de exploración, aprovechando la naturaleza dispersa de la convolución para escenas de gran extensión.
- Preentrenamiento y extracción de características: las representaciones de 61 dimensiones por punto obtenidas con `forward_features` sirven como entrada para cabezas de detección de objetos 3D, segmentación de instancias o modelos de predicción de ocupación, reduciendo el coste de entrenar un backbone desde cero.
- Investigación en eficiencia de arquitecturas 3D: el checkpoint sirve como referencia reproducible del punto de 47 GMACs de la búsqueda de arquitecturas SPVNAS, útil para comparar técnicas de poda, cuantización o destilación sobre un baseline conocido.
- Anotación asistida de datos: preetiquetar grandes volúmenes de nubes de puntos LiDAR antes de la revisión humana, acelerando la creación de datasets propios con un modelo de licencia MIT y sin restricciones de uso comercial.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| SemanticKITTI | mIoU | 61,59 |
| SemanticKITTI | OA (exactitud global) | 92,22 |

No se han publicado en la información disponible resultados adicionales de benchmarks ni comparaciones numéricas con otros modelos sobre el mismo split.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos (8,8 M de parámetros en fp32 ocupan unos 35 MB), aunque el consumo real depende del número de puntos y del tamaño de la rejilla dispersa; en la práctica se recomienda al menos 4-8 GB para procesar escenas completas de SemanticKITTI por lotes.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA compatible con `torchsparse`; el modelo está pensado para GPUs de gama media y no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores, siempre que se compile `torchsparse` para la versión de PyTorch y CUDA correspondiente.
- El modelo es GPU-only: los kernels de convolución dispersa no tienen implementación CPU funcional en este pipeline, por lo que no puede ejecutarse en CPU ni en Ollama o llama.cpp.
- Opciones de despliegue: inferencia directa con PyTorch y `torch-pointcloud`; no se documentan integraciones con vLLM, TGI ni TensorRT.
- Latencia y throughput: no disponibles en la información proporcionada; el dato de 47 GMACs por fotograma sirve como referencia del coste computacional, no como medida de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Dataset | mIoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SPVCNN 47 GMACs (este) | 8,8 M | LiDAR, 4 canales | SemanticKITTI | 61,59 | MIT | Hugging Face, safetensors |
| SPVCNN otras variantes (SPVNAS) | no disponible en esta ficha | LiDAR, 4 canales | SemanticKITTI | no disponible | MIT | Repositorio mit-han-lab/spvnas |
| Otras arquitecturas de segmentación LiDAR | no disponible | LiDAR | SemanticKITTI | no disponible | variable | no disponible |

No se dispone en la información proporcionada de datos numéricos de modelos alternativos (por ejemplo Cylinder3D, RangeNet++ o MinkUNet) que permitan una comparación rigurosa de parámetros, contexto y rendimiento. La comparativa se limita, por tanto, a la variante documentada y a la referencia genérica al repositorio original.

## Limitaciones y advertencias

- Modelo específico de dominio: solo segmenta nubes de puntos LiDAR con el esquema de 19 clases de SemanticKITTI; no es un modelo de propósito general ni admite entradas de texto o imagen.
- Dependencia de compilación: requiere `torchsparse` compilado contra la versión exacta de PyTorch y CUDA, lo que complica el despliegue y la reproducibilidad en entornos heterogéneos.
- Sin soporte CPU: la inferencia está restringida a GPU, lo que limita su uso en dispositivos sin CUDA.
- Riesgo de degradación fuera de dominio: el rendimiento declarado corresponde a SemanticKITTI; sensores con distinta densidad, calibración o distribución de clases pueden reducir notablemente el mIoU.
- Sesgos del dataset: SemanticKITTI procede de grabaciones en entornos urbanos y rurales de Alemania, por lo que el modelo puede generalizar peor en otros países, condiciones meteorológicas extremas o escenas interiores.
- Métricas no verificadas: los valores de mIoU y OA figuran como `verified: false` en el model-index; conviene reproducirlos antes de usarlos como referencia en producción.
- Licencia MIT: permite uso comercial y modificación sin restricciones relevantes, pero se recomienda citar los trabajos originales (SPVNAS y SemanticKITTI) según indica la model card.
- Sin garantías de calibración de incertidumbre: el modelo produce logits por punto sin mecanismo documentado de estimación de confianza, lo que exige umbrales y validación adicionales en aplicaciones críticas de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/spvcnn-47gmacs.semantickitti.mit-han-lab
- Paper SPVNAS: https://arxiv.org/abs/2007.16100
- Repositorio original: https://github.com/mit-han-lab/spvnas
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación: https://pytorch-pointcloud.org/latest/installation/
- Dataset SemanticKITTI: http://semantic-kitti.org/
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
