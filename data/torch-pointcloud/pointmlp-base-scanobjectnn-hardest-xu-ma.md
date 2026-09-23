# torch-pointcloud/pointmlp-base.scanobjectnn-hardest.xu-ma

## Resumen

pointmlp-base.scanobjectnn-hardest.xu-ma es un modelo de clasificación de nubes de puntos 3D publicado en HuggingFace por el usuario torch-pointcloud. Se trata de la conversión a safetensors del PointMLP base entrenado sobre la variante más exigente del dataset ScanObjectNN (PB_T50_RS), a partir del checkpoint original del repositorio ma-xu/pointMLP-pytorch. El modelo tiene 13.268.303 parámetros (13,2 M), 3 canales de entrada, 15 clases de salida y una cabeza de características de 1024 dimensiones, con un repositorio de apenas 0,1 GB y licencia apache-2.0.

La arquitectura PointMLP, presentada en el artículo "Rethinking Network Design and Local Geometry in Point Cloud: A Simple Residual MLP Framework" (ICLR 2022), demuestra que una red residual de perceptrones multicapa con agrupación afín geométrica puede competir con arquitecturas de convolución y de atención en clasificación de nubes de puntos, con un coste computacional menor. Frente a transformers de puntos, el modelo evita mecanismos de atención y operaciones de vecindad costosas, lo que simplifica su despliegue y su integración en pipelines de inferencia en tiempo real.

Su relevancia práctica es doble: por un lado, sirve como línea base reproducible y ligera para tareas de reconocimiento de objetos 3D sobre escaneos reales; por otro, su integración en la librería torch-pointcloud permite cargarlo con una sola llamada y reutilizarlo como extractor de características de 1024 dimensiones para transfer learning, recuperación o preanotación de datasets.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointMLP: red residual de MLP con agrupación afín geométrica (sin convoluciones ni atención) |
| Parametros totales | 13.268.303 (13,2 M) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica; la entrada es una nube de puntos. El ejemplo de uso emplea 8192 puntos con coordenadas (3 canales) y normales |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se documentan variantes GGUF, GPTQ, AWQ ni int8) |
| Idiomas soportados | no aplica (modelo de visión 3D; no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PyTorch, librería torch-pointcloud) |
| Canales de entrada | 3 (coordenadas xyz; el ejemplo de uso añade normales) |
| Clases de salida | 15 |
| Dimension de caracteristicas | 1024 |
| Dataset de entrenamiento | ScanObjectNN, variante PB_T50_RS |
| Tarea | point-cloud-classification |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-08-28 / 2026-09-23 |

## Arquitectura y entrenamiento

PointMLP es una red jerárquica compuesta por etapas de muestreo y agrupación seguidas de bloques residuales de MLP. Su componente distintivo es el módulo de agrupación afín geométrica (geometric affine grouping), que normaliza localmente las coordenadas de cada vecindario antes de aplicar el MLP, de modo que la red se vuelve invariante a transformaciones locales sin necesidad de operaciones de atención ni de convoluciones sobre la nube. El modelo base descrito aquí produce una representación global de 1024 dimensiones que alimenta una cabeza lineal de clasificación sobre 15 clases. La model card no detalla el número de etapas, los canales internos por etapa ni el esquema de muestreo de puntos, por lo que esos datos figuran como no disponibles.

El entrenamiento se realizó sobre ScanObjectNN en su variante PB_T50_RS, la más difícil del benchmark: objetos escaneados del mundo real con perturbaciones y oclusiones, en lugar de mallas sintéticas limpias. La información proporcionada no incluye el número de épocas, el optimizador, el tamaño de lote, el esquema de aumento de datos ni el número total de puntos vistos durante el entrenamiento. No se aplicaron técnicas de alineamiento por preferencias (RLHF o DPO), ya que no es un modelo generativo de lenguaje. Los pesos son una conversión directa del repositorio ma-xu/pointMLP-pytorch, también bajo licencia Apache-2.0.

## Capacidades

- Clasificación de nubes de puntos 3D en 15 clases de objetos escaneados del mundo real.
- Extracción de características: `forward_features` devuelve embeddings de 1024 dimensiones por muestra, reutilizables como entrada de clasificadores lineales, cabezas de detección o sistemas de recuperación.
- Reemplazo de la cabeza de clasificación mediante `reset_classifier(num_classes=N)`, lo que permite ajuste fino sobre dominios y taxonomías propias.
- Procesamiento de nubes con coordenadas y, opcionalmente, normales, con transformación y colación de datos incluidas en la librería.
- Inferencia en CPU o GPU mediante PyTorch estándar.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión 2D, de audio ni modo de razonamiento explícito.

## Casos de uso

- Etiquetado automático de escenas 3D: dado un escaneo de interiores segmentado en instancias, el modelo asigna una de las 15 clases a cada objeto, lo que permite generar anotaciones preliminares sobre grandes volúmenes de capturas sin intervención manual.
- Inspección de calidad industrial: en una línea con escáner 3D, el modelo clasifica piezas o componentes a partir de su nube de puntos para verificar que el objeto detectado corresponde a la referencia esperada antes de pasar a metrología dimensional.
- Percepción en robótica de manipulación: un brazo robótico puede reconocer la categoría del objeto que tiene delante (silla, caja, papelera, etc.) y seleccionar una estrategia de agarre adecuada, con la ventaja de que 13,2 M de parámetros permiten ejecutar el modelo en el propio controlador o en una GPU embebida.
- Preanotación y curaduría de datasets 3D: el modelo actúa como etiquetador débil dentro de un bucle de aprendizaje activo, de forma que solo las muestras con baja confianza se envían a revisión humana.
- Recuperación de objetos 3D por similitud: usando los embeddings de 1024 dimensiones, se puede construir un índice vectorial para buscar formas similares en catálogos de escaneos, útil en comercio electrónico o en gestión de inventario de piezas.
- Transfer learning a dominios específicos: con `reset_classifier` y un conjunto reducido de ejemplos etiquetados, el modelo se reajusta para taxonomías propias (por ejemplo, tipos de componentes en un almacén) partiendo de una representación ya entrenada sobre escaneos reales.
- Digitalización de interiores y gemelos digitales: clasificar el mobiliario de un escaneo de edificio para poblar automáticamente el inventario de un modelo BIM o de un gemelo digital.
- Filtrado previo en pipelines de reconstrucción: descartar o agrupar objetos irrelevantes antes de etapas más costosas de registro, mallado o segmentación semántica.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index de la model card (no verificados de forma independiente):

| Dataset | Tarea | Métrica | Valor |
|---|---|---|---|
| ScanObjectNN (PB_T50_RS) | Clasificación de nubes de puntos | OA (overall accuracy) | 85,81 |
| ScanObjectNN (PB_T50_RS) | Clasificación de nubes de puntos | mAcc (mean accuracy) | 84,29 |

La propia model card indica un valor de referencia de 86,1 para esta configuración, por lo que la conversión publicada se sitúa ligeramente por debajo del resultado de referencia del artículo. No se han publicado en la información disponible resultados de benchmarks adicionales (ModelNet40, ShapeNet ni otros) para este checkpoint concreto.

## Requisitos de hardware

- Tamaño de los pesos: 13.268.303 parámetros, aproximadamente 53 MB en fp32 y 26,5 MB en fp16 (cálculo aritmético a partir del recuento de parámetros, no una cifra publicada por el autor).
- VRAM para inferencia: no disponible. El consumo está dominado por las activaciones, que dependen del número de puntos por muestra y del tamaño de lote; la model card no publica mediciones.
- GPU recomendadas: no disponible en la información proporcionada. Dado el reducido tamaño del modelo, cualquier GPU con soporte CUDA y memoria suficiente para las activaciones debería ser apta, pero no hay cifras oficiales que lo confirmen.
- Ejecución en GPU de consumo: previsiblemente viable por tamaño de pesos, si bien no se documenta el consumo real de memoria ni la latencia en tarjetas como la RTX 4090 o inferiores.
- Ejecución en CPU: posible, al ser un modelo PyTorch estándar; no se publican tiempos.
- Opciones de despliegue: PyTorch con la librería torch-pointcloud (`pip install torch-pointcloud`), que expone `create_model`, transformación de muestras y colación. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que son herramientas para modelos de lenguaje. La exportación a ONNX, TensorRT u otros formatos no está documentada y no se declara un pipeline de HuggingFace asociado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

PointMLP pertenece a la familia de clasificadores de nubes de puntos de tipo jerárquico, junto a PointNet++, DGCNN, Point Transformer, CurveNet o PointNeXt. La información proporcionada solo contiene datos de este checkpoint, por lo que la comparación cuantitativa no puede completarse sin consultar el artículo original.

| Modelo | Categoria | Parametros | Dataset de referencia | Licencia | Disponibilidad en el repositorio analizado |
|---|---|---|---|---|---|
| pointmlp-base.scanobjectnn-hardest.xu-ma | MLP residual + agrupación afín | 13,2 M | ScanObjectNN PB_T50_RS | apache-2.0 | pesos safetensors en HuggingFace, librería torch-pointcloud |
| PointNet++ | Jerárquico con operaciones de vecindad | no disponible | no disponible | no disponible | no disponible |
| DGCNN | Grafo dinámico + convolución de aristas | no disponible | no disponible | no disponible | no disponible |
| Point Transformer | Atención sobre vecindarios | no disponible | no disponible | no disponible | no disponible |

El artículo arXiv:2202.07123 incluye la comparación oficial de PointMLP con estas arquitecturas sobre ScanObjectNN y ModelNet40; esas cifras no forman parte de la información proporcionada y, por tanto, no se reproducen aquí.

## Limitaciones y advertencias

- Ámbito de clases restringido: el modelo solo distingue las 15 categorías de ScanObjectNN. Cualquier objeto fuera de esa taxonomía se asignará a una de las clases existentes.
- Métricas no verificadas: los valores de OA y mAcc de la model card figuran marcados como `verified: false` y proceden del propio autor.
- Sin validación de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia externa de reproducibilidad del resultado declarado.
- Ausencia de información sobre sesgos: no se documenta la composición demográfica, geográfica ni de captura del dataset, ni se analizan sesgos de clase. ScanObjectNN contiene objetos escaneados en entornos concretos, lo que puede introducir desviaciones respecto a otros dominios de captura.
- Rendimiento fuera de distribución desconocido: no se publican evaluaciones con sensores, densidades de puntos, ruidos u oclusiones distintos de los de la variante PB_T50_RS.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí existe riesgo de clasificación errónea con alta confianza en objetos ambiguos o parcialmente ocluidos, especialmente en clases visualmente próximas.
- Dependencia de la librería: el modelo se carga con `torch-pointcloud` y no declara un pipeline estándar de HuggingFace, por lo que no es directamente compatible con `transformers` ni con servidores de inferencia para modelos de lenguaje.
- Limitación de idioma: no procesa texto ni entrada multimodal lingüística; no puede usarse para tareas de lenguaje.
- Licencia: apache-2.0 permite uso comercial y modificación, siempre que se conserve el aviso de copyright y la atribución correspondiente; el código original del que procede la conversión también es Apache-2.0. No se imponen restricciones adicionales conocidas, pero conviene conservar la cita del artículo y de los repositorios de origen.
- Sin datos de entrenamiento reproducibles: la información disponible no detalla hiperparámetros, aumentos de datos ni semillas, lo que dificulta reproducir el resultado desde cero.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/pointmlp-base.scanobjectnn-hardest.xu-ma
- Articulo de PointMLP (ICLR 2022): https://arxiv.org/abs/2202.07123
- Repositorio original de PointMLP: https://github.com/ma-xu/pointMLP-pytorch
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la libreria (Zenodo): https://doi.org/10.5281/zenodo.22159632
- Dataset ScanObjectNN: Uy, Pham, Hua, Nguyen y Yeung, "Revisiting Point Cloud Classification: A New Benchmark Dataset and Classification Model on Real-World Data", ICCV 2019 (sin URL incluida en la informacion proporcionada)

Nota: los resultados de busqueda web disponibles durante la elaboracion de esta ficha (pytorch.org, pypi.org/project/torch y paginas de descarga del navegador Torch) no aportan informacion adicional relevante sobre este modelo.
