# torch-pointcloud/kpfcnn-base-sm.s3dis-area5.hugues-thomas

## Resumen

kpfcnn-base-sm.s3dis-area5.hugues-thomas es un modelo de segmentación semántica de nubes de puntos 3D publicado por la organización torch-pointcloud en Hugging Face. Se trata de una implementación KPConv (Kernel Point Convolution) en su variante deformable, convertida desde el repositorio de referencia HuguesTHOMAS/KPConv-PyTorch y empaquetada para la librería torch-pointcloud. No es un modelo de lenguaje: su entrada es un conjunto de puntos con coordenadas y atributos, y su salida es una etiqueta semántica por punto entre 13 clases de interior.

El modelo tiene 23.943.913 parámetros (23,9 M), 128 features por punto y 5 canales de entrada, y está entrenado sobre la partición Area 5 del dataset S3DIS. Declara un mIoU de 65,27 y una exactitud global (OA) de 88,93, cifras alineadas con la referencia de 65,4 mIoU del artículo original de KPConv (ICCV 2019).

Su relevancia es práctica: ofrece un checkpoint listo para usar bajo licencia MIT en digitalización de interiores, BIM, robótica indoor y extracción de características 3D, sin reentrenamiento. Como contrapartida, el repositorio no registra descargas ni likes y las métricas declaradas están marcadas como no verificadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | KPConv (Kernel Point Convolution) deformable, red totalmente convolucional KPFCNN con submuestreo en rejilla |
| Parámetros totales | 23.943.913 (23,9 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (la entrada es un conjunto de N puntos, no una secuencia de tokens) |
| Tipos de cuantización | no disponible; el repositorio solo publica safetensors en precisión de entrenamiento (el tamaño del repo, 0,1 GB, es coherente con FP32) |
| Idiomas soportados | no aplica (procesa geometría 3D, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 5 |
| Clases de salida | 13 |
| Dimensión de features | 128 |
| Tarea | Segmentación semántica de nubes de puntos |
| Dataset de entrenamiento | S3DIS (partición Area 5 como test) |
| Librería | torch-pointcloud |
| Tamaño del repositorio | 0,1 GB |
| Versión de pesos | creado el 2026-08-28, actualizado el 2026-09-23 |

## Arquitectura y entrenamiento

KPConv sustituye la convolución sobre rejilla regular por una convolución definida sobre vecindades esféricas: para cada punto se seleccionan los vecinos dentro de un radio y se ponderan mediante funciones de correlación ancladas a "kernel points". En la variante deformable, las posiciones de esos kernel points se aprenden y se desplazan, lo que permite adaptar el filtro a geometrías locales irregulares. La red KPFCNN es un encoder-decoder totalmente convolucional compuesto por bloques residuales con KPConv, capas KPConv con stride para submuestreo en rejilla y una fase de decodificación con upsampling por vecino más cercano y conexiones residuales (skip connections).

La configuración declarada es de 23,9 M de parámetros, 5 canales de entrada, 128 features y 13 clases, entrenada sobre S3DIS (Armeni et al., CVPR 2016). La model card no documenta el número de puntos de entrenamiento, la composición exacta del dataset, el optimizador, el número de épocas ni el uso de RLHF o DPO (no aplica en este dominio). El propio autor indica que el checkpoint es una conversión de HuguesTHOMAS/KPConv-PyTorch, es decir, una migración de pesos a la librería torch-pointcloud más que un reentrenamiento desde cero, por lo que su comportamiento esperado es el de la implementación de referencia del artículo.

## Capacidades

- Segmentación semántica por punto en 13 clases de interior definidas por S3DIS (techo, suelo, pared, viga, columna, ventana, puerta, mesa, silla, sofá, estantería, pizarra y clutter).
- Convolución de núcleo deformable, que adapta las posiciones del kernel a la geometría local, lo que mejora el comportamiento en superficies irregulares y densidades variables.
- Procesamiento conjunto de geometría y atributos por punto: la primera capa acepta 5 canales de entrada (coordenadas y canales adicionales como color).
- Extracción de características: `forward_features` devuelve un embedding de 128 dimensiones por punto, y `reset_classifier(num_classes=0)` permite usar el modelo como extractor puro.
- Inferencia por lotes sobre conjuntos de puntos con índice de batch, mediante la API `create_model(..., task="segmentation", pretrained=True)` de la librería torch-pointcloud.
- No soporta tool calling ni function calling (no aplica).
- No soporta agentes ni razonamiento multi-paso (no aplica).
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión 2D, audio ni generación de texto.

## Casos de uso

- Modelado BIM y digitalización de interiores: a partir de un escaneo LiDAR terrestre o fotogrametría de una planta, el modelo asigna una de las 13 clases a cada punto, lo que permite reconstruir un modelo semántico con suelos, paredes, techos, ventanas y puertas separados por categoría.
- Facility management e inventario de activos: el modelo distingue mobiliario (mesa, silla, sofá, estantería) e instalaciones fijas (columna, viga, pizarra), de modo que se puede automatizar el recuento de elementos por estancia sin inspección manual.
- Medición automática para presupuestos de reforma: combinando las etiquetas de suelo, pared y techo con las coordenadas de los puntos se pueden calcular superficies por estancia, una entrada directa para herramientas de presupuestación y certificación de obra.
- Robótica móvil y navegación indoor: la semántica por punto permite generar mapas donde el robot diferencia suelo transitable de paredes u obstáculos, útil en planificación de trayectorias y evasión de colisiones en interiores.
- Gemelos digitales y realidad aumentada: la segmentación semántica actúa como paso previo para poblar un gemelo digital con objetos etiquetados y para anclar contenido virtual sobre elementos reconocidos (por ejemplo, superponer información sobre una pizarra o una puerta).
- Preetiquetado para anotación y aprendizaje activo: el modelo sirve como etiquetador automático inicial sobre nubes nuevas, de forma que el anotador humano solo corrige errores, reduciendo el coste por escena en proyectos de anotación 3D.
- Recuperación y agrupación de escenas 3D: usando los embeddings de 128 dimensiones por punto (o agregados por escena) se pueden construir índices de similitud, clustering de estancias o clasificación con cabezas ligeras entrenadas encima.
- Control de avance de obra: comparando nubes capturadas en fechas distintas con las mismas etiquetas semánticas se puede detectar la aparición o desaparición de elementos (por ejemplo, tabiques o mobiliario) entre dos levantamientos.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index, no verificados por terceros (`verified: false`):

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Segmentación de nubes de puntos | S3DIS (Area 5) | mIoU | 65,27 | No |
| Segmentación de nubes de puntos | S3DIS (Area 5) | OA (exactitud global) | 88,93 | No |
| Referencia citada en la model card (KPConv original, Area 5) | S3DIS (Area 5) | mIoU | 65,4 | No |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- Peso de los pesos en FP32: aproximadamente 95,8 MB (23.943.913 parámetros × 4 bytes). En FP16/BF16 serían unos 47,9 MB y en int8 unos 23,9 MB. Son cálculos aritméticos derivados del número de parámetros, no cifras publicadas.
- La VRAM real en inferencia no la determina el tamaño de los pesos, sino el número de puntos de entrada y las vecindades que construye KPConv (búsqueda de vecinos por radio y activaciones por punto). En el ejemplo de la model card se procesan 8192 puntos. No hay cifras publicadas de consumo por escena: no disponible.
- GPU de consumo: sí cabe, cualquier GPU con soporte CUDA y varios GB de VRAM (por ejemplo, RTX 3060, RTX 4070 o RTX 4090) es suficiente para inferencia sobre escenas de tamaño moderado, dado que los pesos ocupan menos de 100 MB.
- GPU de centro de datos (A100, H100): no son necesarias para inferencia; resultan útiles para entrenamiento, ajuste fino o procesado masivo por lotes de muchas escenas.
- CPU: la inferencia es posible con PyTorch en CPU, pero la búsqueda de vecinos se convierte en el cuello de botella y la latencia será muy superior a la de GPU.
- Opciones de despliegue: PyTorch junto con la librería torch-pointcloud (`pip install torch-pointcloud`), usando `create_model` con `pretrained=True`. No hay soporte documentado para vLLM, TGI, llama.cpp, Ollama ni exportación a ONNX o TorchScript: no disponible o no aplica para este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | mIoU en S3DIS Area 5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kpfcnn-base-sm.s3dis-area5.hugues-thomas (este modelo) | KPConv deformable sobre KPFCNN | 23,9 M | 65,27 (declarado, sin verificar) | MIT | Hugging Face (torch-pointcloud) |
| KPConv original (HuguesTHOMAS/KPConv-PyTorch) | Idéntico, es el origen de la conversión | no disponible | 65,4 (referencia citada en la model card) | MIT | GitHub |
| PointNet++ | Muestreo jerárquico con set abstraction | no disponible | no disponible | no disponible | no disponible |
| Point Transformer | Atención sobre tokens de puntos | no disponible | no disponible | no disponible | no disponible |
| RandLA-Net | Muestreo aleatorio con agregación local por atención | no disponible | no disponible | no disponible | no disponible |

Las tres últimas filas se incluyen como familias comparables del mismo problema (segmentación semántica de nubes de puntos), pero no se dispone de datos verificados sobre ellas en la información aportada, por lo que sus celdas quedan como no disponibles. La comparación más significativa es con el KPConv original: al tratarse de una conversión de pesos, no se espera una mejora de rendimiento, sino la misma calidad con un empaquetado distinto.

## Limitaciones y advertencias

- Dominio cerrado: el modelo solo reconoce las 13 clases de S3DIS y está entrenado con escenas de interior. Su uso en exteriores, LiDAR aéreo, entornos industriales o conducción autónoma no está respaldado por los datos declarados.
- Sesgo de dominio: S3DIS está compuesto por edificios de oficinas y aulas, con tipologías de mobiliario y alturas propias de ese contexto. Escenas de otras regiones o tipologías pueden degradar el mIoU de forma notable.
- Sensibilidad a la configuración del preprocesado: el transform de la librería fija el radio de vecindad, el tamaño de rejilla y el número de puntos. Modificar estos parámetros respecto a los del entrenamiento altera los resultados.
- Entrada de 5 canales fija: no se pueden añadir canales (por ejemplo, intensidad o normales) sin modificar y reentrenar la primera capa.
- No es un modelo generativo ni conversacional: no acepta instrucciones, no soporta diálogo, tool calling, agentes ni razonamiento multi-paso. No debe emplearse para tareas de texto.
- Etiquetado forzado: el modelo siempre asigna una de las 13 clases, sin categoría de "desconocido", por lo que en geometría no vista tiende a producir falsos positivos con apariencia plausible.
- Riesgo de predicciones erróneas en zonas de baja densidad de puntos, oclusiones o superficies ambiguas (por ejemplo, límites entre pared y columna).
- Métricas no verificadas y sin validación cruzada completa: los valores de 65,27 de mIoU y 88,93 de OA corresponden a la partición Area 5 y están marcados como no verificados, sin resultados de las seis particiones estándar de S3DIS.
- Adopción nula en el Hub (0 descargas, 0 likes), lo que implica poca validación independiente por parte de la comunidad antes de un uso en producción.
- Licencia: los pesos y el código se distribuyen bajo MIT, lo que permite uso comercial, pero esa licencia no cubre necesariamente los términos del dataset S3DIS, que deben revisarse por separado.
- Fechas de creación y actualización poco habituales (2026), por lo que conviene comprobar la versión concreta de los pesos descargados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/kpfcnn-base-sm.s3dis-area5.hugues-thomas
- Artículo de KPConv (ICCV 2019): https://arxiv.org/abs/1904.08889
- Implementación original de KPConv en PyTorch: https://github.com/HuguesTHOMAS/KPConv-PyTorch
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud en Zenodo: https://doi.org/10.5281/zenodo.22159632
- Paquete en PyPI, según el comando de instalación de la model card: https://pypi.org/project/torch-pointcloud/
- Dataset S3DIS: Armeni et al., "3D Semantic Parsing of Large-Scale Indoor Spaces", CVPR 2016 (sin URL aportada en la información disponible)
- Nota sobre la búsqueda web: los resultados devueltos no contienen enlaces relevantes al modelo, ya que corresponden a páginas sobre PyTorch y sobre el navegador Torch.
