# torch-pointcloud/pointnext-sm.scanobjectnn-hardest.openpoints

## Resumen

pointnext-sm.scanobjectnn-hardest.openpoints es un modelo de clasificación de nubes de puntos 3D publicado por el usuario torch-pointcloud en HuggingFace. Se trata de una conversión del modelo PointNeXt en su variante "small" (PointNeXt-S), una revisión de PointNet++ que incorpora bloques residuales invertidos y estrategias de escalado para mejorar la precision sin disparar el coste computacional. El modelo tiene 1.376.815 parametros (aproximadamente 1,4 M) y es, por tanto, un modelo muy ligero orientado a inferencia rapida y a despliegue en entornos con recursos limitados.

El modelo resuelve una tarea concreta: clasificar una nube de puntos que representa un objeto 3D en una de 15 categorias. Esta entrenado sobre la variante PB_T50_RS del benchmark ScanObjectNN, que segun el propio identificador del modelo corresponde al caso "hardest" del dataset: objetos escaneados en escenas interiores reales y sometidos a perturbaciones. Los pesos se distribuyen en formato safetensors bajo licencia MIT y se cargan mediante la libreria torch-pointcloud (arthurdjn/pytorch-pointcloud), que expone una API de creacion de modelo, transformacion de datos y extraccion de caracteristicas.

Su relevancia actual es la de un componente listo para usar dentro de pipelines de vision 3D: al ser tan pequeno, se puede ejecutar en CPU o en cualquier GPU consumer, y sus embeddings de 512 dimensiones sirven como extractor de caracteristicas congelado para tareas posteriores (recuperacion, clustering, etiquetado asistido o fine-tuning en dominios propios). No es un modelo generativo ni un modelo de lenguaje: no procesa texto ni imagenes 2D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointNeXt-S (PointNet++ escalado, con bloques residuales invertidos) |
| Parametros totales | 1.376.815 (1,4 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de nubes de puntos; el ejemplo de la model card usa 8192 puntos por muestra) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Libreria de carga | torch-pointcloud (PyTorch) |
| Canales de entrada | 4 |
| Numero de clases | 15 |
| Dimension de features | 512 |
| Dataset de entrenamiento | ScanObjectNN (PB_T50_RS) |
| Tamano del repositorio | 0.0 GB (valor declarado por HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es PointNeXt, presentada en el articulo "PointNeXt: Revisiting PointNet++ with Improved Training and Scaling Strategies" (Qian et al., NeurIPS 2022, arXiv:2206.04670). PointNeXt parte de PointNet++ y le anade bloques residuales invertidos (al estilo de MobileNetV2, con expansion de canales, convolucion depthwise sobre vecinos y proyeccion) junto con estrategias de entrenamiento y escalado revisadas. La variante empleada aqui es la "small" (sm), que en el articulo ronda los 1,4 M de parametros, con 4 canales de entrada por punto, 512 caracteristicas en la cabeza de clasificacion y una salida de 15 clases. La nube de puntos se procesa mediante capas de set abstraction y operaciones de agrupacion por vecindad; la model card no detalla el numero de capas ni los radios de vecindad concretos de esta conversion.

En cuanto a los datos, el modelo se entrena sobre ScanObjectNN en su variante PB_T50_RS, el benchmark de referencia para clasificacion de objetos 3D escaneados en interiores reales (Uy et al., ICCV 2019). La model card no especifica el numero de epocas, el optimizador, el esquema de aumento de datos ni si hubo fases de ajuste adicionales; tampoco indica el numero de tokens o muestras procesadas. El modelo se distribuye como conversion de los pesos originales del repositorio guochengqian/PointNeXt (licencia MIT) al formato safetensors de la libreria torch-pointcloud, con un pipeline de transformacion de datos (`info["transform"]`) y una funcion de collate que genera los tensores `x`, `pos` y `batch`.

## Capacidades

- Clasificacion de nubes de puntos 3D en 15 clases de objetos, a partir de una muestra con coordenadas `pos` de forma (N, 3) mas un cuarto canal de entrada.
- Extraccion de caracteristicas: `forward_features(...)` devuelve embeddings; con `reset_classifier(num_classes=0)` la salida es un vector de 512 dimensiones por muestra, util como representacion para tareas posteriores.
- Inferencia por lotes: la API acepta tensores `x`, `pos` y `batch`, por lo que admite varias nubes de puntos en una misma llamada.
- Ajuste fino: la cabeza de clasificacion se puede sustituir (`reset_classifier`) para reentrenar sobre un numero de clases distinto al original.
- Integracion en PyTorch: el modelo se instancia con `tp.create_model(..., task="classification", pretrained=True)` y se comporta como un `nn.Module` convencional (`.eval()`, `torch.no_grad()`).
- No dispone de tool calling, function calling, capacidades de agente, generacion de texto, razonamiento multi-paso, vision 2D, audio ni capacidades multilingues, ya que no es un modelo de lenguaje ni multimodal.

## Casos de uso

- Clasificacion de objetos en robotica de manipulacion: dado el escaneo parcial de un objeto sobre una mesa, el modelo predice su categoria en una de 15 clases; su tamano de 1,4 M de parametros permite ejecutarlo en el propio robot o en un equipo de borde junto al controlador.
- Etiquetado asistido de datasets 3D: el modelo puede preanotar grandes colecciones de nubes de puntos y dejar solo la revision humana de los casos de baja confianza, reduciendo el coste de anotacion en proyectos de vision 3D.
- Extraccion de caracteristicas para busqueda y recuperacion de modelos 3D: los embeddings de 512 dimensiones permiten construir indices vectoriales para recuperar objetos similares en un catalogo CAD o en un repositorio de escaneos.
- Control de calidad en fabricacion: clasificacion de piezas escaneadas en linea para verificar que el objeto detectado corresponde a la referencia esperada, con inferencia en CPU si no hay GPU disponible en planta.
- Preprocesado en pipelines de digitalizacion (BIM, patrimonio, interiorismo): separar y etiquetar objetos capturados con LiDAR o fotogrametria antes de alimentar etapas posteriores de reconstruccion o modelado.
- Deteccion de obstaculos y categorizacion en robots moviles de almacen: clasificar los objetos que aparecen en el barrido de un sensor 3D para decidir si son manipulables, evitables o inventariables.
- Base para transfer learning en dominios especificos: reemplazando la cabeza de 15 clases y ajustando con pocas muestras, se puede adaptar a categorias propias de un sector (medicina, construccion, agricultura) partiendo de pesos ya entrenados en datos reales perturbados.
- Generacion de embeddings para clustering no supervisado: agrupar escaneos sin etiquetas para descubrir categorias recurrentes o detectar anomalias en una coleccion de objetos 3D.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados, campo `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Clasificacion de nubes de puntos | ScanObjectNN (PB_T50_RS) | OA (accuracy overall) | 88,17 |
| Clasificacion de nubes de puntos | ScanObjectNN (PB_T50_RS) | mAcc (mean accuracy) | 86,75 |

La propia model card indica un valor de referencia de 88,20 de OA, ligeramente superior al del modelo convertido. No se han publicado en la informacion disponible otros resultados de benchmarks (por ejemplo, sobre ModelNet40, ShapeNet o ScanObjectNN en sus variantes OBJ-BG y OBJ-ONLY).

## Requisitos de hardware

- Pesos en FP32: 1.376.815 parametros x 4 bytes ≈ 5,5 MB. El modelo es marginal en terminos de memoria de pesos.
- VRAM estimada: no disponible la cifra exacta de pico de memoria; el consumo lo dominan las activaciones de las capas de agrupacion de vecinos y el numero de puntos por muestra (8192 en el ejemplo de la model card), no los parametros.
- GPU recomendadas: cualquier GPU con soporte CUDA sirve; el modelo es sobredimensionado para GPU de gama alta (A100, H100) y su uso natural es GPU consumer o incluso CPU.
- Cabe en GPU consumer: si, en cualquier GPU consumer actual e incluso en GPU integradas; tambien es viable la inferencia en CPU para lotes pequenos.
- Opciones de despliegue: PyTorch con la libreria torch-pointcloud (`pip install torch-pointcloud`). No se documentan pesos GGUF, ni soporte en vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo. La exportacion a ONNX o TorchScript no esta documentada en la informacion disponible.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo de inferencia ni de muestras por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | OA | mAcc | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pointnext-sm.scanobjectnn-hardest.openpoints (este modelo) | 1,4 M | ScanObjectNN PB_T50_RS | 88,17 | 86,75 | MIT | HuggingFace, safetensors, via torch-pointcloud |
| PointNeXt-S original (referencia citada en la model card) | 1,4 M | ScanObjectNN PB_T50_RS | 88,20 (referencia) | no disponible | MIT | GitHub guochengqian/PointNeXt |
| PointNet++ (arquitectura base) | no disponible | ScanObjectNN PB_T50_RS | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| Point Transformer y otras familias de clasificacion 3D | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

La unica comparacion con datos concretos disponible es la del propio PointNeXt-S de referencia, con 88,20 de OA frente a los 88,17 declarados para esta conversion, es decir, una diferencia de 0,03 puntos. Para el resto de alternativas habituales de la categoria no se dispone de cifras en la informacion proporcionada.

## Limitaciones y advertencias

- Resultados no verificados: las metricas de la model card estan marcadas con `verified: false`; no han sido reproducidas ni auditadas de forma independiente.
- Modelo sin adopcion: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad ni informes de uso en produccion.
- Inconsistencia en los metadatos: el repositorio declara un tamano de 0.0 GB, un valor que no cuadra con los 1,4 M de parametros declarados (unos 5,5 MB en FP32). Conviene verificar los ficheros reales antes de integrarlo en un pipeline.
- Dominio muy acotado: entrenado sobre ScanObjectNN PB_T50_RS, un benchmark de objetos de interior con 15 clases. No es un modelo de segmentacion semantica, deteccion de objetos ni comprension de escenas completas, y su rendimiento fuera de ese dominio (exteriores, LiDAR de vehiculo, objetos industriales) no esta documentado.
- Sensibilidad a la variante del dataset: el identificador "hardest" sugiere entrenamiento sobre la variante mas perturbada de ScanObjectNN; no se documenta el rendimiento en las variantes mas faciles del mismo benchmark.
- Entrada fija de 4 canales: el modelo espera 4 canales por punto; las muestras que solo aportan coordenadas xyz deben pasar por la transformacion indicada en la model card.
- Sin datos de sesgo ni de robustez: no se publican analisis de sesgo por categoria, ni estudios de robustez frente a ruido, oclusion o densidad de puntos distinta a la de entrenamiento.
- Alucinacion: el concepto no aplica de forma directa a un clasificador, pero si existe riesgo de predicciones erroneas con alta confianza ante objetos fuera de las 15 clases, situaciones de oclusion severa o distribuciones de puntos distintas a las de entrenamiento.
- Idiomas: no aplica; el modelo no procesa lenguaje natural.
- Licencia: MIT, permisiva y apta para uso comercial, siempre que se conserve el aviso de copyright. El codigo original de PointNeXt tambien es MIT. La licencia del dataset ScanObjectNN debe comprobarse por separado si se reentrena.
- Reproducibilidad: la model card no documenta hiperparametros de entrenamiento, semillas, epocas ni detalles de aumento de datos, por lo que no se puede reproducir el entrenamiento a partir de la informacion publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/pointnext-sm.scanobjectnn-hardest.openpoints
- Paper de PointNeXt (NeurIPS 2022): https://arxiv.org/abs/2206.04670
- Repositorio original de PointNeXt: https://github.com/guochengqian/PointNeXt
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud (Zenodo): https://doi.org/10.5281/zenodo.22159632
- Paper de ScanObjectNN (ICCV 2019): "Revisiting Point Cloud Classification: A New Benchmark Dataset and Classification Model on Real-World Data", Uy et al. (referencia bibliografica incluida en la model card; no se proporciona URL)
- Nota: las busquedas web realizadas no devolvieron enlaces relevantes a este modelo; los resultados obtenidos correspondian a PyTorch y a un navegador no relacionado con el proyecto.
