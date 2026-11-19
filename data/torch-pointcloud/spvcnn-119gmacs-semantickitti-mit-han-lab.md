# torch-pointcloud/spvcnn-119gmacs.semantickitti.mit-han-lab

## Resumen

SPVCNN es un modelo de segmentación semántica de nubes de puntos LiDAR basado en convoluciones dispersas punto-vóxel (Sparse Point-Voxel Convolution). Lo desarrolla el grupo de Song Han en MIT HAN Lab y esta versión concreta la distribuye `torch-pointcloud` como checkpoint convertido desde el repositorio original `mit-han-lab/spvnas`. El modelo resuelve la asignación de una clase semántica a cada punto de una escena 3D captada por LiDAR, una tarea central en conducción autónoma, robótica móvil y cartografía.

La variante publicada tiene 21,8 millones de parámetros, una configuración de 119 GMACs y 96 canales de características, y está entrenada sobre SemanticKITTI con 19 clases. Su relevancia actual radica en que ofrece un baseline reproducible y ligero para percepción 3D, con pesos en safetensors y una API de carga directa mediante la librería `torch-pointcloud`, lo que simplifica la evaluación frente a reimplementaciones dispersas.

A diferencia de los modelos de lenguaje, no procesa texto ni mantiene contexto conversacional: su entrada es una nube de puntos con coordenadas e intensidad y su salida son logits por punto. Por tanto, esta ficha se centra en sus especificaciones de percepción 3D, su rendimiento declarado en SemanticKITTI y los requisitos de despliegue con kernels GPU dispersos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SPVCNN (Sparse Point-Voxel Convolution), red convolucional dispersa híbrida punto-vóxel |
| Parámetros totales | 21.791.251 (21,8 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de nube de puntos, ejemplo de 8192 puntos) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica; tarea de visión 3D) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `torch-pointcloud`, requiere `torchsparse`) |

Otros datos técnicos declarados: 4 canales de entrada, 19 clases de salida, 96 canales de características, coste computacional de 119 GMACs, tamaño del repositorio 0,1 GB.

## Arquitectura y entrenamiento

SPVCNN combina dos representaciones complementarias: una rama de convolución dispersa sobre vóxeles, eficiente para agregar contexto espacial, y una rama de convolución sobre puntos que preserva la geometría fina sin cuantización. La fusión de ambas ramas permite capturar estructura local y contexto global con un coste computacional contenido. El diseño proviene del trabajo "Searching Efficient 3D Architectures with Sparse Point-Voxel Convolution" (Tang et al., ECCV 2020), donde la arquitectura se obtiene mediante búsqueda de arquitecturas neuronales (NAS) sobre el espacio de bloques SPVConv.

El checkpoint está entrenado sobre SemanticKITTI, el conjunto de secuencias LiDAR anotadas con 19 clases semánticas derivado de KITTI Odometry. La model card no detalla el número de tokens o puntos de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de ajuste posteriores como aumento de datos específico o refinamiento con validación cruzada. Tampoco se documentan innovaciones adicionales de inferencia (decodificación especulativa, atención lineal u otras), que no aplican a este tipo de red.

## Capacidades

- Segmentación semántica por punto en nubes LiDAR con 19 clases (por ejemplo, carretera, vehículo, peatón, vegetación, edificio).
- Procesamiento de nubes de puntos con 4 canales de entrada (coordenadas xyz e intensidad).
- Extracción de características de 96 dimensiones mediante `forward_features`, útil para tareas posteriores de clasificación o clustering.
- Reemplazo del cabezal de clasificación con `reset_classifier(num_classes=0)` para obtener embeddings por punto.
- Procesamiento por lotes con agrupación (`collate`) de muestras de distinto tamaño.
- Ejecución en GPU mediante kernels dispersos de `torchsparse`; la model card indica que los kernels son GPU-only.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión 2D, audio ni capacidades multilingües.

## Casos de uso

- Percepción para conducción autónoma: el modelo etiqueta cada punto LiDAR de la escena con una de las 19 clases de SemanticKITTI, lo que permite construir mapas semánticos del entorno y alimentar módulos de planificación y evitación de obstáculos.
- Robótica móvil en interiores y exteriores: con 21,8 M de parámetros y 119 GMACs, es viable en plataformas con GPU embebida para segmentar el entorno en tiempo real y distinguir suelo transitable, obstáculos y personas.
- Cartografía y mantenimiento de infraestructuras: procesar barridos LiDAR de vehículos de levantamiento para separar carretera, vegetación, edificaciones y mobiliario urbano, reduciendo el etiquetado manual.
- Análisis de escenas urbanas a escala: al ser un modelo ligero y con licencia MIT, puede desplegarse en pipelines por lotes sobre grandes volúmenes de secuencias sin coste de licencia.
- Baseline de investigación en percepción 3D: sirve como referencia reproducible (mIoU 63,74, OA 92,46) para comparar nuevas arquitecturas o estrategias de aumento de datos sobre SemanticKITTI.
- Preentrenamiento para tareas posteriores: usar `forward_features` para extraer descriptores de 96 dimensiones por punto y entrenar cabezales específicos de detección, clustering o clasificación de escenas con menos datos.
- Filtrado y depuración de datos LiDAR: identificar puntos anómalos o clases minoritarias en conjuntos de datos antes de entrenar modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Segmentación de nubes de puntos | SemanticKITTI | mIoU | 63,74 |
| Segmentación de nubes de puntos | SemanticKITTI | OA (accuracy) | 92,46 |

No se han publicado en la información disponible otros resultados de benchmarks ni comparaciones directas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 21,8 M de parámetros en fp32, los pesos ocupan aproximadamente 87 MB; el consumo real depende del número de puntos y del tamaño del voxel, que determinan las estructuras dispersas intermedias.
- GPU recomendadas: cualquier GPU NVIDIA compatible con la compilación de `torchsparse` para la versión de PyTorch y CUDA instalada (por ejemplo, A100, H100, RTX 4090, RTX 3090, según la guía de instalación de la librería).
- GPU de consumo: es plausible en tarjetas consumer con soporte CUDA, dado el reducido número de parámetros, aunque la memoria efectiva vendrá marcada por el tamaño de la nube y la resolución de voxelización; no hay cifras publicadas.
- Opciones de despliegue: `torch-pointcloud` con `torchsparse` (requiere compilación acorde a torch y CUDA). No se documentan exportaciones a ONNX, TensorRT, llama.cpp, vLLM, TGI ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos comparables (parámetros, contexto, rendimiento o licencia) para establecer una comparativa rigurosa. Los modelos de referencia habituales en segmentación LiDAR sobre SemanticKITTI (por ejemplo, arquitecturas de la familia SPVNAS o Cylinder3D) no están documentados aquí con cifras verificables, por lo que la comparación se indica como no disponible.

| Modelo | Parámetros | Contexto | mIoU SemanticKITTI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| spvcnn-119gmacs.semantickitti.mit-han-lab | 21,8 M | no aplica | 63,74 | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados de mIoU y OA están declarados por el autor y marcados como no verificados; conviene reproducirlos antes de usarlos como referencia en producción.
- El modelo está entrenado exclusivamente sobre SemanticKITTI; su generalización a otros sensores LiDAR, resoluciones, densidades de puntos o entornos no representados en ese dataset no está garantizada.
- Solo contempla 19 clases; cualquier objeto o superficie fuera de ese vocabulario se asignará a una clase existente, con el consiguiente riesgo de error semántico.
- Requiere kernels GPU dispersos (`torchsparse`) compilados para la combinación exacta de PyTorch y CUDA, lo que complica el despliegue reproducible y la portabilidad a CPU.
- No se documentan sesgos específicos, pero los sesgos del dataset subyacente (ciudades alemanas, condiciones de captura concretas) pueden trasladarse al modelo.
- No hay información sobre cuantización, por lo que no se puede garantizar el comportamiento en precisión reducida.
- La licencia MIT permite uso comercial, pero debe conservarse el aviso de copyright y la atribución correspondiente; además, el uso de SemanticKITTI puede estar sujeto a sus propias condiciones.
- No es un modelo de lenguaje: no procesa texto, no mantiene contexto conversacional y no soporta tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/spvcnn-119gmacs.semantickitti.mit-han-lab
- Paper SPVNAS (arXiv 2007.16100): https://arxiv.org/abs/2007.16100
- Repositorio original mit-han-lab/spvnas: https://github.com/mit-han-lab/spvnas
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
