# torch-pointcloud/votenet.scannet.mmdet3d

## Resumen

VoteNet es un detector de objetos 3D para nubes de puntos basado en el mecanismo de *deep Hough voting*, publicado originalmente por Charles R. Qi, Or Litany, Kaiming He y Leonidas J. Guibas en ICCV 2019. El modelo parte de una nube de puntos de una escena interior y predice cajas 3D con clase y orientacion, sin depender de anclas ni de propuestas generadas sobre una rejilla volumetrica. Esta version concreta, `torch-pointcloud/votenet.scannet.mmdet3d`, es una conversion de los pesos oficiales de MMDetection3D al formato de la libreria torch-pointcloud, empaquetada en safetensors.

El modelo es extremadamente compacto: aproximadamente 0,96 millones de parametros (1,0 M segun la model card), 256 caracteristicas internas y 18 clases de objetos de interior. Trabaja sobre nubes de puntos con coordenadas, color, normales y etiquetas de segmentacion por punto, tal como las entrega el dataset ScanNet. No es un modelo de lenguaje ni un modelo generativo multimodal: es un detector puro de objetos 3D, y su interes para desarrolladores e investigadores esta en disponer de un baseline ligero, reproducible y con licencia Apache-2.0 para tareas de percepcion 3D en interiores.

La relevancia actual es la de un punto de partida y referencia: VoteNet sigue siendo un metodo de comparacion habitual en deteccion 3D indoor, y esta version permite cargarlo con una sola llamada (`tp.create_model`) sin necesidad de montar el ecosistema completo de MMDetection3D. Su tamano minimo lo hace adecuado para prototipado rapido, validacion de pipelines de datos y experimentos academicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoteNet (deep Hough voting sobre PointNet++ como backbone de extraccion de caracteristicas) |
| Parametros totales | 961.764 (1,0 M segun la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de nube de puntos, no secuencial) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VoteNet combina un backbone PointNet++ que extrae caracteristicas por punto (256 canales) con un modulo de votacion que predice, para cada punto semilla, un desplazamiento hacia el centro del objeto al que pertenece. Los votos se agrupan y se procesan para generar propuestas de cajas 3D, que se refinan y clasifican en 18 categorias de objetos de interior. El modelo no usa anclas ni voxelizacion densa, lo que reduce el coste computacional frente a detectores basados en rejillas 3D.

El entrenamiento se realizo sobre ScanNet, un dataset de reconstrucciones 3D de escenas interiores con anotaciones ricas (CVPR 2017). La model card no detalla el numero de tokens ni la composicion exacta del dataset, ni indica si hubo etapas de refinamiento posteriores; la informacion disponible se limita a la conversion de pesos desde MMDetection3D (Apache-2.0) y a los hiperparametros de inferencia (8192 puntos de entrada en el ejemplo de uso, 1 canal de entrada, 18 clases, 256 caracteristicas). No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal, que no aplican a este tipo de modelo.

## Capacidades

- Deteccion de objetos 3D en nubes de puntos de escenas interiores: predice cajas 3D con clase y orientacion para 18 categorias de ScanNet.
- Entrada multimodal por punto: coordenadas (`pos`), color (`color`), normales (`normal`), etiqueta de segmentacion (`segment`) e instancia (`instance`).
- Extraccion de caracteristicas: `forward_features` devuelve un vector de 256 canales por punto, reutilizable para tareas aguas abajo (clasificacion, segmentacion, retrieval).
- Procesamiento por lotes: la API acepta un `batch` de indices para agrupar varias nubes de puntos en una sola pasada.
- Sin tool calling, sin function calling y sin capacidades de agente: no es un modelo linguistico.
- Sin capacidades multilingues ni de generacion de texto.
- Sin modo de razonamiento explicito ni vision 2D: opera exclusivamente sobre geometria 3D.

## Casos de uso

- Prototipado de percepcion 3D en interiores: cargar el modelo con `tp.create_model` y ejecutar inferencia sobre nubes de puntos de 8192 puntos permite validar un pipeline completo en minutos, sin dependencias de MMDetection3D.
- Baseline academico para deteccion 3D: usar los resultados mAP@0.25 (62,02) y mAP@0.5 (39,94) como referencia contra la que comparar metodos nuevos sobre ScanNet.
- Robotica de interior y navegacion: detectar sillas, mesas, puertas y otros objetos de las 18 clases para construir mapas semanticos o planificar trayectorias en entornos domesticos y de oficina.
- Extraccion de caracteristicas para modelos aguas abajo: emplear `forward_features` (256 canales) como encoder congelado en tareas de segmentacion semantica o instance retrieval sobre nubes de puntos.
- Aumento de datos y validacion de anotaciones: ejecutar el detector sobre reconstrucciones 3D para generar propuestas que ayuden a revisar o preanotar cajas en flujos de etiquetado.
- Docencia y experimentacion con Hough voting: su tamano (menos de 1 M de parametros) permite entrenar y depurar variantes en una sola GPU consumer, algo inviable con detectores 3D mas pesados.
- Integracion en pipelines de captura 3D: procesar nubes de puntos procedentes de escaneres o SLAM en interiores para inventariar objetos y calcular estadisticas de escena.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| ScanNet | Deteccion de objetos 3D | mAP@0.25 | 62,02 |
| ScanNet | Deteccion de objetos 3D | mAP@0.5 | 39,94 |

No se han publicado en la informacion disponible resultados adicionales (por ejemplo, mAP@0.5 por clase, latencia o throughput) ni comparaciones oficiales con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con menos de 1 M de parametros, los pesos ocupan unos pocos megabytes y el cuello de botella es la nube de puntos de entrada (8192 puntos por muestra en el ejemplo), no el modelo. Una GPU con 4-8 GB es suficiente para lotes pequenos.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. Para lotes grandes o muchas nubes simultaneas, una A100 o H100 aportan margen.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer con al menos 4 GB de VRAM.
- Opciones de despliegue: la libreria `torch-pointcloud` (instalable con `pip install torch-pointcloud`) es la via documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. El despliegue natural es PyTorch nativo o TorchScript/ONNX si se exporta.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros modelos comparables (por ejemplo, variantes de VoteNet en MMDetection3D u otros detectores 3D indoor) con parametros, contexto y licencia verificables en esta ficha. Se indica, por tanto, que la comparativa detallada no esta disponible. Como referencia cualitativa, la model card cita MMDetection3D como origen de los pesos, pero no incluye metricas de modelos alternativos.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente en ScanNet (escenas interiores), por lo que el rendimiento fuera de ese dominio (exteriores, industria, escenas sinteticas) no esta garantizado.
- Sin datos de sesgo: la model card no documenta sesgos conocidos ni analisis de equidad; al ser un detector geometrico, los sesgos potenciales dependen de la distribucion de clases y geometrias de ScanNet.
- Riesgo de falsos positivos y negativos: como todo detector, puede producir detecciones espurias en escenas con oclusiones o geometrias atipicas; no se han publicado curvas de precision-recall por clase.
- Limitaciones de idioma: no aplica, pero tampoco hay soporte linguistico; no debe usarse como modelo de texto.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar las licencias del dataset ScanNet y de MMDetection3D si se redistribuyen pesos o datos derivados.
- Caveat de produccion: los resultados de benchmarks estan declarados por el autor y no verificados (`verified: false`); conviene reproducirlos antes de tomar decisiones criticas. Ademas, el modelo es de 2019 y no incorpora tecnicas modernas de deteccion 3D.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/votenet.scannet.mmdet3d
- Paper VoteNet: https://arxiv.org/abs/1904.09664
- Paper ScanNet: https://arxiv.org/abs/1704.03847 (referencia citada en la model card como CVPR 2017)
- Repositorio MMDetection3D: https://github.com/open-mmlab/mmdetection3d
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
