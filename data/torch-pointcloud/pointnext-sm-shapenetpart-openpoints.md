# torch-pointcloud/pointnext-sm.shapenetpart.openpoints

## Resumen

PointNeXt-S (variante small) es un modelo de segmentación de partes de nubes de puntos en 3D, publicado en HuggingFace bajo el repositorio `torch-pointcloud/pointnext-sm.shapenetpart.openpoints`. No es un modelo de lenguaje: recibe una nube de puntos (coordenadas, normales y etiqueta de categoría) y predice, punto a punto, a qué parte del objeto pertenece dentro de un vocabulario de 50 clases de parte repartidas en las 16 categorías de ShapeNetPart. Lo mantiene el proyecto PyTorch PointCloud de Arthur Dujardin, que actúa como conversor y distribuidor del modelo original de Guocheng Qian (`guochengqian/PointNeXt`).

La arquitectura es PointNeXt, una revisión de PointNet++ que sustituye los bloques MLP por bloques residuales invertidos y aplica estrategias de entrenamiento y escalado mejoradas (paper NeurIPS 2022, arXiv:2206.04670). El modelo es muy pequeno: 990.770 parámetros, 96 canales de característica, 7 canales de entrada y 50 clases de salida. Aun así alcanza 86,88 de mIoU por instancia y 84,48 de mIoU por clase en ShapeNetPart según los valores declarados por el autor (métricas no verificadas de forma independiente).

Su relevancia práctica está en que ofrece un punto de partida ligero, con licencia MIT y en formato safetensors, para tareas de segmentación fina en pipelines 3D (robotica, inspección industrial, anotación automática), con la ventaja de que se puede ejecutar en CPU o en cualquier GPU de consumo. La contrapartida es que está entrenado exclusivamente sobre datos sintéticos de ShapeNetPart y no se han publicado variantes cuantizadas ni resultados fuera de ese dominio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointNeXt-S (PointNet++ con bloques residuales invertidos y estrategias de escalado) |
| Parametros totales | 990.770 (1,0 M según la model card) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa nubes de puntos de tamaño variable, 8192 puntos en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan variantes GGUF, INT8 ni AWQ) |
| Idiomas soportados | no disponible (modelo no linguistico; no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 7 (posicion 3 + normal 3 + categoria 1) |
| Clases de salida | 50 clases de parte (16 categorías de objeto de ShapeNetPart) |
| Canales de caracteristica | 96 |
| Dataset de entrenamiento | ShapeNetPart |
| Libreria de inferencia | torch-pointcloud (`pip install torch-pointcloud`) |
| Tarea | point-cloud-part-segmentation |

## Arquitectura y entrenamiento

PointNeXt-S es una red jerárquica de agregación local sobre nubes de puntos. Hereda de PointNet++ el esquema de muestreo de puntos (set abstraction), agrupación por vecindad y agregación con max-pooling, pero reemplaza los perceptrones multicapa de cada bloque por bloques residuales invertidos al estilo MobileNet, con conexiones skip y normalización, lo que mejora la propagación del gradiente y la eficiencia por parámetro. La variante "SM" (small) es la más estrecha de la familia: 96 canales de característica y 990.770 parámetros en total. La cabeza de segmentación es condicionada por categoría: el modelo recibe la etiqueta de categoría del objeto (16 posibles) además de la geometría, lo que permite desambiguar partes con nombres compartidos entre categorías y llegar a las 50 clases de parte de ShapeNetPart.

El entrenamiento se realizó sobre ShapeNetPart, el conjunto de 16.880 formas con anotaciones de partes a nivel de punto derivado de ShapeNet (Yi et al., 2016). El paper de PointNeXt demuestra que buena parte de la mejora sobre PointNet++ proviene de estrategias de entrenamiento (aumentación de datos, ajustes de optimizador y época) y de escalado, más que de cambios puramente arquitectónicos. En la información disponible no se especifican el número exacto de tokens/puntos de entrenamiento, la composición detallada del dataset, el número de épocas ni si hubo ajuste por refuerzo (no aplica en esta tarea). El modelo es una conversión directa del checkpoint oficial de `guochengqian/PointNeXt` (MIT) al formato de la librería `torch-pointcloud`.

## Capacidades

- Segmentación de partes a nivel de punto en nubes de puntos 3D, con 50 clases de parte sobre 16 categorías de objeto de ShapeNetPart.
- Entrada geométrica con normales: 7 canales (posición, normal, categoría), lo que permite aprovechar orientación de superficie cuando el escáner la proporciona.
- Condicionamiento por categoría: la etiqueta de objeto se pasa como entrada, lo que restringe y mejora la predicción de partes.
- Extracción de características: `forward_features` devuelve un vector de 96 dimensiones por nube, reutilizable para clasificación, retrieval o clustering con una cabeza propia (`reset_classifier(num_classes=0)`).
- Procesamiento de nubes de tamaño variable mediante muestreo y agrupación por vecindad (el ejemplo oficial usa 8192 puntos).
- Inferencia por lotes con función `collate` de `torch_pointcloud.utils.data`, apta para pipelines de PyTorch.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión 2D, audio ni generación de texto: no es un modelo generativo ni multimodal en ese sentido.
- No hay capacidades multilingües ni modo "thinking"; la salida es un tensor de logits por punto.

## Casos de uso

- Inspección industrial de piezas escaneadas: el modelo etiqueta punto a punto cada componente de una pieza (cuerpo, asa, tapa, tornillo) a partir de un escaneo 3D, lo que permite comprobar automáticamente que un ensamblaje contiene todas las partes esperadas. Es adecuado por su coste computacional mínimo (1 M de parámetros) y su salida densa por punto.
- Robótica de manipulación y agarre: dado un escaneo del objeto a coger, segmentar asa, cuerpo y base permite calcular puntos de agarre estables y planificar la pinza. La integración es directa en un nodo ROS 2 con PyTorch, y la latencia cabe en el bucle de control en GPU de consumo.
- Anotación automática de datasets 3D: pre-etiquetar nubes de puntos antes de la revisión humana reduce el coste de construir corpus de segmentación. El modelo sirve como etiquetador débil y las etiquetas se corrigen después con una herramienta de anotación.
- Reconstrucción y edición en realidad aumentada: separar partes de un objeto escaneado con el móvil para permitir edición selectiva (cambiar el color solo de la base, ocultar el asa) o para generar mallas por componentes.
- Reverse engineering y CAD: a partir de un escaneo de un objeto físico, obtener la segmentación de sus partes facilita ajustar primitivas geométricas y reconstruir el modelo CAD pieza a pieza.
- Búsqueda y recuperación de formas 3D: usar el vector de 96 dimensiones de `forward_features` como embedding para indexar un catálogo de modelos 3D y hacer búsqueda por similitud geométrica o detección de duplicados.
- Preprocesado para gemelos digitales y logística: inventariar y clasificar componentes de objetos escaneados en almacén (contenedores, herramientas) segmentando sus partes antes de un modelo de clasificación posterior.
- Docencia e investigación en visión 3D: punto de entrada ligero para reproducir resultados de PointNeXt y experimentar con aumentación de datos o cambios de cabeza sin necesitar GPUs de gama alta.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index). Ninguno está marcado como verificado (`verified: false`).

| Benchmark | Tarea | Métrica | Valor |
|---|---|---|---|
| ShapeNetPart | Segmentación de partes de nube de puntos | ins_mIoU (mIoU por instancia) | 86,88 |
| ShapeNetPart | Segmentación de partes de nube de puntos | cls_mIoU (mIoU por clase) | 84,48 |

No se han publicado en la información disponible resultados de otras evaluaciones (por ejemplo, generalization a escaneos reales, ScanNet, S3DIS ni ablaciones de velocidad).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Los pesos en fp32 ocupan aproximadamente 4 MB (990.770 parámetros × 4 bytes); con activaciones para lotes pequeños de 8192 puntos la huella se mantiene en el orden de cientos de MB, por lo que 1-2 GB de VRAM son suficientes en la práctica.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una RTX 4090, RTX 3090, RTX 4060 Ti o incluso una GTX 1650 son más que suficientes. El modelo está claramente sobredimensionado por la GPU, así que el cuello de botella será el preprocesado (vecinos, muestreo) y la carga de datos.
- CPU: viable. Al tener ~1 M de parámetros, la inferencia en CPU es práctica para procesos por lotes fuera de línea; para tiempo real conviene GPU.
- Despliegue: `torch-pointcloud` sobre PyTorch es la vía oficial (`tp.create_model(..., pretrained=True)`). No hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI, que son stacks para modelos de lenguaje. La exportación a TorchScript u ONNX es plausible al ser una CNN/MLP sobre tensores, pero no está documentada en la información disponible.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de puntos por segundo en la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Dataset / tarea | ins_mIoU (ShapeNetPart) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pointnext-sm.shapenetpart.openpoints (este) | 990.770 | ShapeNetPart, segmentación de partes | 86,88 | MIT | HuggingFace, safetensors, librería torch-pointcloud |
| PointNet++ (Qi et al., 2017) | no disponible en la información proporcionada | ShapeNetPart, segmentación de partes | no disponible en la información proporcionada | MIT (repo original) | Repositorio oficial en PyTorch |
| PointNeXt original (guochengqian) | no disponible en la información proporcionada (familia S/B/L) | ShapeNetPart y otros | no disponible en la información proporcionada | MIT | GitHub oficial con checkpoints |

La comparación cuantitativa con PointNet++ y con otras variantes de PointNeXt (B, L) no puede completarse con los datos disponibles: la model card solo declara las métricas de esta variante small y no se han proporcionado cifras de los modelos alternativos.

## Limitaciones y advertencias

- Dominio sintético: entrenado solo con ShapeNetPart, compuesto por mallas CAD sintéticas y muestreos uniformes de superficie. El rendimiento caerá con escaneos reales (ruido, oclusiones, densidad irregular) sin reentrenamiento o ajuste fino.
- Requiere la etiqueta de categoría como entrada. Si se desconoce la categoría del objeto, hay que estimarla antes con un clasificador, lo que añade un paso y una fuente de error.
- Vocabulario cerrado: 50 clases de parte y 16 categorías. Cualquier objeto fuera de ese conjunto se etiquetará forzosamente con alguna de las clases existentes, sin señal de "desconocido".
- Métricas no verificadas: los valores 86,88 y 84,48 proceden del autor y están marcados como `verified: false`; no hay evaluación independiente ni réplica publicada en la información disponible.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí de predicciones erróneas confiadas: geometrías ambiguas o partes poco representadas en el dataset pueden recibir etiquetas incorrectas con logits altos.
- Sesgos: no documentados. Cabe esperar sesgo hacia las categorías y formas sobrerrepresentadas en ShapeNetPart y hacia la densidad de muestreo usada en el ejemplo (8192 puntos).
- Sin cuantizaciones ni formatos alternativos publicados; el repo ocupa 0,0 GB y no incluye documentación sobre conversiones a ONNX, TensorRT o núcleos de CPU optimizados.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación de la comunidad ni issues públicos sobre el comportamiento del checkpoint convertido.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar la atribución del autor original (Guocheng Qian) y del conversor (Arthur Dujardin), y revisar la licencia de ShapeNetPart para los datos, que es independiente de la del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/pointnext-sm.shapenetpart.openpoints
- Paper PointNeXt (NeurIPS 2022): https://arxiv.org/abs/2206.04670
- Repositorio original PointNeXt: https://github.com/guochengqian/PointNeXt
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Paper de ShapeNetPart (Yi et al., 2016): incluido en la cita de la model card, sin URL directa disponible en la información proporcionada
