# torch-pointcloud/volt-b-joint.scannet20.kadir-yilmaz

## Resumen

Volt-b-joint.scannet20.kadir-yilmaz es un modelo de segmentación semántica de nubes de puntos 3D desarrollado por Kadir Yilmaz y colaboradores (Universidad RWTH Aachen, grupo de Bastian Leibe) y empaquetado para la librería torch-pointcloud por el usuario torch-pointcloud. Implementa la arquitectura Volume Transformer, presentada en el artículo "Volume Transformer: Revisiting Vanilla Transformers for 3D Scene Understanding" (ECCV 2026). A diferencia de las arquitecturas habituales para nubes de puntos, que recurren a operadores de vecindad local o sparse convolutions, Volt apuesta por un transformer "vanilla" que opera sobre tokens de parches volumétricos.

El checkpoint contiene 94 millones de parámetros, procesa 6 canales de entrada (coordenadas, color y normales) y produce etiquetas para 20 clases de la escena. Fue entrenado de forma conjunta sobre ScanNet, ScanNet200, ScanNet++ y ARKitScenes, manteniendo un clasificador independiente por conjunto de etiquetas; este checkpoint conserva únicamente el clasificador de ScanNet con 20 clases.

Su relevancia radica en que demuestra que un transformer estándar, sin sesgos inductivos específicos de 3D, puede alcanzar un mIoU de 80,45 en ScanNet, compitiendo con arquitecturas especializadas. Está publicado con licencia MIT, aunque los datos de entrenamiento de ScanNet++ y ARKitScenes imponen términos no comerciales que condicionan su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Volume Transformer (transformer vanilla sobre tokens de parches volumétricos) |
| Parámetros totales | 94.033.428 (94,0 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre 8192 puntos por muestra en el ejemplo de uso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo 3D, no lingüístico) |
| Licencia | MIT (con caveats por los datasets de entrenamiento) |
| Formato de pesos | safetensors |
| Canales de entrada | 6 (posición, color, normal) |
| Clases de salida | 20 (ScanNet) |
| Dimensión de features | 256 |
| Tamaño del repo | 0,4 GB |
| Librería | torch-pointcloud |
| Dependencias | flash-attn (build específico para torch y CUDA) |

## Arquitectura y entrenamiento

Volt es un transformer "vanilla" aplicado a nubes de puntos: en lugar de emplear mecanismos de atención local sobre vecinos o convoluciones dispersas, agrupa los puntos en parches volumétricos y los proyecta como tokens secuenciales que procesa con atención estándar. El modelo consume 6 canales por punto (coordenadas xyz, color RGB y normales) y produce un vector de 256 dimensiones por punto, que se mapea a las 20 clases mediante un clasificador lineal. La atención se implementa con kernels de flash-attn, de ahí que la inferencia sea exclusivamente en GPU.

El entrenamiento es conjunto sobre cuatro conjuntos de datos de interiores: ScanNet, ScanNet200, ScanNet++, y ARKitScenes, con un clasificador por conjunto de etiquetas. Este checkpoint conserva el clasificador de ScanNet (20 clases). No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO (no aplicables en segmentación). La innovación principal es la demostración de que la atención global sobre tokens volumétricos es suficiente para la comprensión de escenas 3D, sin necesidad de sesgos inductivos específicos del dominio.

## Capacidades

- Segmentación semántica de nubes de puntos 3D en 20 clases de interior (suelo, pared, silla, mesa, etc.).
- Procesamiento de 6 canales por punto: posición, color y normales.
- Extracción de features por punto (256 dimensiones) mediante `forward_features` o `reset_classifier(num_classes=0)`, útil para tareas downstream como clasificación de escena o recuperación.
- Inferencia por lotes con collate de torch-pointcloud.
- Soporte de GPU exclusivamente (kernels de flash-attn).
- No soporta tool calling, agentes, ni capacidades lingüísticas: es un modelo puramente perceptivo 3D.
- No dispone de modo "thinking", visión 2D, audio ni generación de texto.

## Casos de uso

- Segmentación de escenas de interior para robótica móvil: el modelo etiqueta punto a punto suelo, paredes, muebles y obstáculos a partir de la nube de puntos de un sensor LiDAR o RGB-D, permitiendo a un robot doméstico construir mapas semánticos navegables.
- Digitalización y modelado BIM: a partir de escaneos de edificios, el modelo separa elementos estructurales (suelo, pared, techo) de mobiliario, acelerando la reconstrucción de gemelos digitales.
- Realidad aumentada y mixta: la segmentación semántica por punto permite anclar objetos virtuales sobre superficies reales (mesas, suelos) y ocluir correctamente la geometría física.
- Anotación asistida de datasets 3D: el modelo preetiqueta nubes de puntos nuevas, reduciendo el coste de anotación manual en pipelines de datos para percepción 3D.
- Análisis de escenas para retail y logística: segmentación de estanterías, cajas y estructures en escaneos de almacenes para inventario volumétrico.
- Investigación en percepción 3D: extracción de features de 256 dimensiones por punto para entrenar clasificadores de escena o modelos de segmentación de instancias downstream con pocas etiquetas.
- Control de calidad en escaneos: detección de regiones mal etiquetadas o geometrías anómalas comparando la predicción semántica con la nube original.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Dataset | Métrica | Valor |
|---|---|---|
| ScanNet (20 clases) | mIoU | 80,45 |
| ScanNet (20 clases) | OA (accuracy global) | 93,13 |
| ScanNet (20 clases) | simple/mIoU | 79,69 |
| ScanNet (20 clases) | simple/OA | 92,78 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la model card, ni métricas en ScanNet200, ScanNet++ o ARKitScenes para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 94 M de parámetros en fp32 los pesos ocupan unos 0,38 GB, pero los kernels de atención sobre 8192 puntos y el estado intermedio elevan el consumo. Se recomienda al menos 8-16 GB de VRAM para lotes pequeños.
- GPU recomendadas: cualquier GPU NVIDIA compatible con el build de flash-attn y CUDA correspondiente (A100, H100, RTX 3090, RTX 4090, RTX A6000).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 (12 GB) en adelante, siempre que flash-attn compile para la arquitectura.
- Opciones de despliegue: exclusivamente mediante la librería torch-pointcloud (`tp.create_model`), con `flash-attn` instalado. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo 3D).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. Cualitativamente, Volt se posiciona frente a arquitecturas de segmentación de nubes de puntos como PointNet++, MinkowskiNet o SPVCNN, que emplean operadores de vecindad local o convoluciones dispersas; Volt apuesta por atención global sobre tokens volumétricos. La comparación de parámetros, contexto, rendimiento y licencia con esas alternativas no puede realizarse con los datos disponibles.

## Limitaciones y advertencias

- Modelo específico de segmentación semántica de interiores; no generaliza a exteriores, objetos aislados ni otras modalidades sin reentrenamiento.
- El checkpoint solo conserva el clasificador de ScanNet (20 clases); no etiqueta las 200 clases de ScanNet200 ni las de ScanNet++/ARKitScenes.
- Requiere GPU y un build de `flash-attn` compatible con la versión de torch y CUDA; la instalación puede ser frágil en entornos no controlados.
- Aunque el código y los pesos se publican bajo licencia MIT, el entrenamiento incluye ScanNet++ y ARKitScenes, cuyos términos son no comerciales; el uso comercial del modelo puede estar condicionado por las licencias de los datos de entrenamiento.
- Riesgo de alucinación semántica: puntos ambiguos (superficies reflectantes, oclusiones) pueden recibir etiquetas incorrectas con alta confianza.
- Sesgos derivados de los datasets de entrenamiento: sobrerrepresentación de escenas domésticas y de oficina occidentales; posible bajo rendimiento en tipologías de interior no representadas.
- No soporta texto, tool calling, agentes ni razonamiento multi-paso; no debe presentarse como un modelo de lenguaje.
- Métricas no verificadas (`verified: false`): los resultados de la model card proceden del autor y no han sido reproducidos de forma independiente.
- El número de puntos de entrada en el ejemplo es 8192; no se documenta el comportamiento con nubes de mayor densidad ni el coste computacional asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/volt-b-joint.scannet20.kadir-yilmaz
- Repositorio original: https://huggingface.co/KadirYilmaz/Volt
- Paper: https://arxiv.org/abs/2604.19609
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación: https://pytorch-pointcloud.org/latest/installation/
- Dataset ScanNet: https://github.com/ScanNet/ScanNet
