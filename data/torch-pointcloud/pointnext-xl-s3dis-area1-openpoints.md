# torch-pointcloud/pointnext-xl.s3dis-area1.openpoints

## Resumen

PointNeXt-XL es un modelo de segmentación semántica de nubes de puntos 3D, es decir, asigna una etiqueta de clase a cada punto individual de una escena capturada con sensores LiDAR o cámaras de profundidad. Lo desarrolla el ecosistema de la librería torch-pointcloud (Arthur Dujardin) a partir de la implementación de referencia de PointNeXt de Guocheng Qian, publicada en NeurIPS 2022, y se distribuye con licencia MIT en HuggingFace bajo el identificador `torch-pointcloud/pointnext-xl.s3dis-area1.openpoints`.

La arquitectura es una versión escalada de PointNet++ con bloques residuales invertidos (inverted residual blocks) y estrategias de entrenamiento y escalado revisadas. Con 41,6 millones de parámetros, 4 canales de entrada (coordenadas XYZ más color RGB) y 13 clases de salida, está especializado en interiores: suelos, paredes, techos, vigas, columnas, ventanas, puertas, mesas, sillas, sofás, estanterías, pizarras y clutter. Se ha entrenado sobre la zona 1 del dataset S3DIS (Stanford 3D Indoor Spaces), el benchmark de referencia para parsing semántico de interiores a gran escala.

Su relevancia práctica es doble: por un lado ofrece un checkpoint listo para usar en PyTorch con pesos en safetensors y una API de una línea (`tp.create_model`), lo que elimina la fricción de reproducir el entorno original de PointNeXt; por otro, al ser un modelo puramente geométrico y no generativo, cubre un nicho (percepción 3D) que los modelos de lenguaje y visión 2D no resuelven y que resulta crítico en robótica, BIM y digitalización de edificios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointNeXt (PointNet++ escalado con bloques residuales invertidos y set abstraction layers) |
| Parametros totales | 41.705.677 (41,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada = N puntos 3D con 4 canales; el ejemplo de la model card usa 8192 puntos) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, INT8 ni FP16 empaquetadas) |
| Idiomas soportados | no aplica (modelo de vision 3D, sin entrada ni salida de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,2 GB) |

Otros datos declarados por el autor: canales de entrada 4, numero de clases 13, dimension de caracteristicas 64, dataset S3DIS (Area 1), metrica mIoU 79,59 y OA 91,22.

## Arquitectura y entrenamiento

PointNeXt retoma la familia PointNet++ y la reformula: sustituye los bloques MLP basicos por bloques residuales invertidos (estilo MobileNetV2 adaptado a grafos de vecinos), anade conexiones residuales entre etapas de set abstraction y aplica tecnicas modernas de entrenamiento (aumento de datos, inicializacion, optimizador y politicas de learning rate revisadas) que en conjunto elevan de forma notable el rendimiento frente al PointNet++ original sin cambiar el paradigma de agregacion local de vecinos. El modelo aqui publicado corresponde a la variante XL, la de mayor anchura/profundidad de la familia, con 64 caracteristicas base y 41,6 M de parametros; la salida es una prediccion por punto sobre 13 clases, precedida de capas de feature propagation con interpolacion por vecinos mas cercanos para recuperar la resolucion original de la nube.

En cuanto a los datos, el checkpoint se ha entrenado unicamente con la zona 1 (Area 1) del dataset S3DIS, compuesto por escaneos Matterport de habitaciones de oficina y espacios interiores con anotaciones semanticas por punto. La model card no documenta el numero de tokens/puntos vistos, la composicion exacta del split, ni si se aplicaron fases de RLHF/DPO (no aplicables en un modelo discriminativo de segmentacion). Tampoco se detalla si se emplearon las estrategias de escalado completas del paper original o un subconjunto. Los pesos proceden de la conversion del repositorio oficial `guochengqian/PointNeXt` (MIT) al formato de la libreria torch-pointcloud.

## Capacidades

- Segmentacion semantica densa de nubes de puntos: asigna una de 13 clases a cada punto de la escena (suelo, pared, techo, viga, columna, ventana, puerta, mesa, silla, sofa, estanteria, pizarra y clutter).
- Entrada multimodal geometrica-cromatica: 4 canales por punto (XYZ + color RGB), lo que permite desambiguar elementos con geometria similar pero apariencia distinta.
- Extraccion de caracteristicas: `forward_features` devuelve un descriptor por punto; con `reset_classifier(num_classes=0)` se obtiene un vector de 64 dimensiones por punto, util como backbone para tareas posteriores.
- Transferencia a otros dominios: la cabeza de clasificacion es reemplazable (`reset_classifier`), de modo que el backbone puede reentrenarse para otro numero de clases o para clasificacion de nube completa.
- Procesamiento por lotes con gestion de indices de batch (`data["batch"]`), lo que permite inferencia sobre varias escenas simultaneamente.
- Soporte de tool calling / function calling: no aplica (modelo discriminativo, sin interfaz de texto ni de herramientas).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales: no dispone de modo "thinking", vision 2D, audio ni generacion de texto.

## Casos de uso

- Digitalizacion BIM y levantamientos indoor: a partir de un escaneo LiDAR o fotogrametria de una planta de oficina, el modelo etiqueta cada punto como suelo, pared, techo, columna o viga, lo que permite generar un modelo geometrico semantico reutilizable en herramientas BIM sin etiquetado manual punto a punto.
- Robotica movil y navegacion: en la nube de puntos de un robot con LiDAR, distinguir suelo transitable de paredes, muebles y clutter aporta la semantica necesaria para planificacion de trayectorias y evitacion de obstaculos en interiores.
- Inventario automatizado de mobiliario: contar y localizar mesas, sillas, sofas y estanterias en escaneos de oficinas para auditorias de activos, con la salvedad de que se trata de etiquetado por punto y requeriria un paso de clustering para obtener instancias.
- Realidad aumentada y gemelos digitales: la segmentacion por punto permite anclar contenido virtual sobre superficies fisicas concretas (por ejemplo, sustituir el suelo o resaltar paredes) en aplicaciones de visualizacion de espacios.
- Mantenimiento y auditoria de edificios: detectar la extension de elementos estructurales (vigas, columnas) y de cerramientos (ventanas, puertas, pizarras) en inspecciones periodicas para comparar el estado del espacio con el plano original.
- Preentrenamiento y backbone para tareas downstream: usar los descriptores de 64 dimensiones por punto como caracteristicas de entrada para modelos de deteccion 3D, segmentacion de instancias o clasificacion de escena, reduciendo el coste de entrenar desde cero.
- Anotacion asistida de datasets propios: preetiquetar nubes de puntos nuevas y corregir manualmente solo los errores, lo que acelera la creacion de corpora anotados en dominios distintos al de S3DIS.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Segmentacion semantica de nubes de puntos | S3DIS (Area 1) | mIoU | 79,59 |
| Segmentacion semantica de nubes de puntos | S3DIS (Area 1) | OA (accuracy global) | 91,22 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (PointNet++, Point Transformer, variantes S o L de PointNeXt) sobre el mismo split, ni cifras de latencia o throughput. Cualquier comparacion numerica con alternativas requeriria ejecutar la evaluacion en el mismo protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 167 MB en FP32 y unos 83 MB en FP16, por lo que el peso del modelo no es el factor limitante. El consumo real lo domina el numero de puntos por escena y el batch: para 8192 puntos por muestra en FP32 cabe holgadamente en 2-4 GB, y crece de forma aproximadamente lineal con puntos y batch.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060 12 GB, RTX 4070, RTX 4090). Para entrenamiento o fine-tuning con nubes densas y lotes grandes son preferibles A100 o H100 por ancho de banda de memoria.
- Cabe en GPU consumer: si, sin practicamente restricciones; incluso en GPUs de 6-8 GB con lotes moderados.
- Opciones de despliegue: la via documentada es PyTorch con la libreria `torch-pointcloud` (`pip install torch-pointcloud`) y la funcion `tp.create_model`. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI (ninguna de estas herramientas aplica a un modelo de nubes de puntos).
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tiempo de inferencia ni de puntos procesados por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Contexto / puntos | Licencia | Datos de rendimiento en esta ficha |
|---|---|---|---|---|---|---|
| PointNeXt-XL S3DIS Area 1 (este modelo) | 41,6 M | XYZ + RGB (4 canales) | 13 | no fijo (ejemplo: 8192 puntos) | MIT | mIoU 79,59 / OA 91,22 (Area 1, no verificado) |
| PointNet++ (referencia original) | no disponible | XYZ (+ normales/color) | configurable | no fijo | MIT (implementaciones) | no disponible |
| PointNeXt-S / PointNeXt-L (paper original) | no disponible | XYZ + color | 13 en S3DIS | no fijo | MIT | no disponible |
| Point Transformer (v1/v2/v3) | no disponible | XYZ + color | 13 en S3DIS | no fijo | licencias variables segun implementacion | no disponible |

La comparacion cuantitativa no es posible con la informacion proporcionada: no se incluyen resultados de las alternativas bajo el mismo split (Area 1 como entrenamiento). Las cifras habituales del paper de PointNeXt corresponden al protocolo estandar de S3DIS (entrenamiento en Areas 1, 2, 3, 4 y 6, evaluacion en Area 5), que no es el protocolo de este checkpoint, por lo que no son directamente contrastables.

## Limitaciones y advertencias

- Especializacion de dominio: entrenado solo con la zona 1 de S3DIS (interiores de oficina tipo Matterport). La generalizacion a exteriores, industria, obra civil o escaneos con sensores muy distintos no esta garantizada y probablemente requiera fine-tuning.
- Entrenamiento en una unica area: usar una sola area para entrenar (y, presumiblemente, tambien para reportar metricas) implica riesgo de sobreajuste a la distribucion de esa zona; los valores de mIoU y OA deben interpretarse con cautela y no como rendimiento en escenas no vistas.
- Metricas no verificadas: los resultados de la model card figuran con `verified: false`; no han sido reproducidos de forma independiente.
- Dependencia del color: la entrada espera 4 canales (XYZ + RGB). Nubes de puntos sin informacion cromatica (LiDAR puro sin camara) requieren una adaptacion explicita de la primera capa; el comportamiento en ese caso no esta documentado.
- Salida por punto, no por instancia: distingue clases semanticas, pero no separa objetos individuales; tareas como contar sillas requieren un paso adicional de agrupacion (clustering) o un modelo de segmentacion de instancias.
- Sin capacidades de texto: no genera explicaciones, no admite instrucciones en lenguaje natural, no soporta tool calling ni agentes; no debe presentarse como un modelo conversacional.
- Idioma: no aplica, pero conviene senalar que no hay soporte linguistico de ningun tipo; la ficha no debe reutilizarse como plantilla de modelo de lenguaje.
- Licencia MIT: permisiva para uso comercial y modificacion, con la obligacion habitual de conservar el aviso de copyright y la atribucion. Conviene verificar asimismo las condiciones del dataset S3DIS y de la implementacion original de PointNeXt, tambien MIT, si se redistribuyen datos derivados.
- Caveat de produccion: el preprocesado es critico (normalizacion `norm_pos`, muestreo a un numero fijo de puntos, construccion de vecinos). Diferencias en el pipeline respecto al usado en entrenamiento degradan la segmentacion de forma dificil de diagnosticar.
- Sin datos de robustez: no se documenta el comportamiento frente a oclusiones, ruido de sensor, densidad variable de puntos ni escenas a gran escala divididas en bloques.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/pointnext-xl.s3dis-area1.openpoints
- Paper PointNeXt (NeurIPS 2022): https://arxiv.org/abs/2206.04670
- Repositorio original PointNeXt: https://github.com/guochengqian/PointNeXt
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la libreria (Zenodo): https://doi.org/10.5281/zenodo.22159632
- Dataset S3DIS (Armeni et al., CVPR 2016, "3D Semantic Parsing of Large-Scale Indoor Spaces"): enlace no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible
