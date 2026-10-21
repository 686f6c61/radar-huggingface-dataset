# torch-pointcloud/votenet.sunrgbd.fair

## Resumen

VoteNet es un detector de objetos 3D en nubes de puntos que implementa la técnica de *deep Hough voting*: en lugar de predecir cajas directamente sobre los puntos, cada punto vota por el centro del objeto al que podría pertenecer y los votos se agrupan para generar propuestas de cajas 3D. Este checkpoint concreto, `votenet.sunrgbd.fair`, es una conversión del modelo original de `facebookresearch/votenet` al formato de la librería `torch-pointcloud`, mantenida por Arthur Dujardin, y está entrenado sobre el conjunto de datos SUN RGB-D.

El modelo es deliberadamente pequeño: 959.442 parámetros según los pesos en safetensors (la model card indica 1,0 M), 256 canales de características, 1 canal de entrada y 10 clases de objetos. No es un modelo de lenguaje ni procesa texto: su entrada son nubes de puntos con coordenadas XYZ y color, y su salida son cajas 3D orientadas con clase y puntuación de confianza. Resulta relevante para quien necesite un detector 3D ligero, reproducible y con licencia MIT para experimentar con percepción 3D en interiores, o como referencia para comparar arquitecturas de detección sobre nubes de puntos.

La conversión a `torch-pointcloud` facilita su uso: se instancia con `tp.create_model("votenet.sunrgbd.fair", pretrained=True)` y se ejecuta sobre tensores de puntos agrupados por batch, sin depender del ecosistema original de Detectron2/VoteNet. El checkpoint se publicó en agosto de 2026 y se actualizó en octubre de 2026, sin descargas ni valoraciones registradas hasta la fecha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoteNet: red de votacion Hough profunda sobre PointNet++ (backbone de extraccion de caracteristicas por puntos) con cabeceras de voto, clasificacion y regresion de cajas 3D |
| Parametros totales | 959.442 (segun safetensors); la model card indica 1,0 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de secuencia de texto) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors; no se documentan variantes GGUF, INT8 ni FP16) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 1 (segun la model card) |
| Caracteristicas internas | 256 canales |
| Clases | 10 |
| Tarea (pipeline) | object-detection (deteccion de objetos 3D) |
| Dataset de entrenamiento | SUN RGB-D |
| Libreria | torch-pointcloud |

## Arquitectura y entrenamiento

VoteNet combina un backbone PointNet++ que extrae características por punto con un módulo de votación tipo Hough: cada punto con semilla predice un desplazamiento tridimensional hacia el centro del objeto al que pertenece, más un peso de voto. Los votos se agrupan espacialmente (en el trabajo original mediante *seed clustering* y *farthest point sampling*) y de cada grupo se derivan propuestas de cajas 3D que se refinan y clasifican en una etapa posterior. La innovación clave frente a detectores 2D proyectados es que la votación se hace en el espacio 3D, lo que evita la pérdida de información de la proyección y funciona bien en escenas de interior con oclusiones.

Según la model card, este checkpoint se entrenó sobre SUN RGB-D con 1 canal de entrada, 256 características internas y 10 clases, y se convirtió directamente desde el repositorio oficial `facebookresearch/votenet` (también MIT). No se documentan en la información disponible el número de tokens/puntos de entrenamiento, la composición exacta del dataset, la configuración de aumentado de datos ni si se aplicaron etapas de ajuste fino adicionales; la denominación `fair` en el identificador sugiere una variante de comparación equitativa dentro del catálogo de `torch-pointcloud`, pero su significado exacto no está descrito.

## Capacidades

- Deteccion de objetos 3D en nubes de puntos de escenas de interior: devuelve cajas 3D orientadas con clase y confianza.
- Localizacion basada en votacion: los centros de objeto se infieren agregando votos por punto, lo que permite detectar objetos parcialmente ocluidos.
- Clasificacion en 10 clases de SUN RGB-D (categorias tipicas de interior, como silla, mesa, sofa, cama, sanitario, etc.; el listado exacto no se detalla en la informacion disponible).
- Entrada multimodal a nivel de punto: coordenadas XYZ y color RGB por punto.
- Extraccion de caracteristicas: `model.forward_features(...)` devuelve un vector de 256 canales por punto, reutilizable como descriptor para otras tareas.
- Procesamiento por lotes: la API acepta tensores `pos`, `batch` y características agrupadas mediante `collate`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, vision 2D general, audio ni modo *thinking*: no es un modelo generativo de lenguaje.

## Casos de uso

- Percepcion 3D en robotica de interior: integrado en la pila de navegacion de un robot movil, el modelo detecta sillas, mesas y otros obstaculos volumetricos a partir de la nube de puntos de una camara de profundidad, aportando cajas 3D que el planificador puede usar para evitar colisiones.
- Reconstruccion y anotacion semiautomatica de escenas: al ejecutarse en CPU o en una GPU modesta, permite preetiquetar nubes de puntos de oficinas y hogares y reducir el coste de anotacion manual de nuevos datasets.
- Prototipado rapido en investigacion: la instalacion via `pip install torch-pointcloud` y la carga con una sola llamada (`create_model`) lo convierten en una linea base reproducible para comparar nuevas arquitecturas de deteccion 3D.
- Extraccion de descriptores para *retrieval* o segmentacion: usando `forward_features`, los 256 canales por punto sirven como entrada a cabeceras propias (segmentacion semantica, agrupamiento de instancias) sin reentrenar el backbone.
- Docencia y divulgacion sobre votacion Hough profunda: el tamano reducido (menos de 1 M de parametros) permite ejecutar el modelo completo en un portatil y visualizar el proceso de votacion paso a paso.
- Validacion de pipelines de datos 3D: como detector pequeno y rapido, es util para comprobar de extremo a extremo la cadena de preprocesado (muestreo de puntos, normalizacion, colaciones) antes de invertir en modelos mayores.
- Demos interactivas en navegador o en dispositivos de borde: la huella de memoria es minima, por lo que puede desplegarse junto a un sensor RGB-D en hardware embebido con GPU integrada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Dataset | Metrica | Valor |
|---|---|---|---|
| Deteccion de objetos 3D | SUN RGB-D | mAP@0.25 | 58,81 |
| Deteccion de objetos 3D | SUN RGB-D | mAP@0.5 | 34,15 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas de lenguaje, ya que el modelo no las cubre. Tampoco se aportan latencias, throughput ni curvas de precision-recall.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos (menos de 1 M de parametros en FP32, en torno a 4 MB); el consumo real lo domina el numero de puntos de entrada y los mapas intermedios del backbone, no el modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas GTX 1050, RTX 2060, RTX 3060, RTX 4090, A100 o H100; no se aprovechan las capacidades de las GPU de gama alta por el reducido tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo e incluso en CPU para inferencia puntual.
- Opciones de despliegue: la propia libreria `torch-pointcloud` (basada en PyTorch), exportacion a TorchScript/ONNX no documentada en la informacion disponible; no hay soporte conocido de vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia de orden de magnitud, el ejemplo de la model card procesa una muestra sintetica de 8192 puntos en una unica pasada; las cifras reales dependen del numero de puntos y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| votenet.sunrgbd.fair (este) | 959.442 | Nube de puntos XYZ+RGB, 10 clases | mAP@0.25 58,81; mAP@0.5 34,15 (SUN RGB-D, no verificado) | MIT | HuggingFace, libreria torch-pointcloud |
| VoteNet original (facebookresearch/votenet) | no disponible en la informacion | Nube de puntos, SUN RGB-D y ScanNet | no disponible | MIT | Repositorio GitHub oficial |
| ImVoteNet | no disponible en la informacion | Nube de puntos + imagen RGB | no disponible | no disponible | Repositorio de investigacion |
| H3DNet | no disponible en la informacion | Nube de puntos, deteccion 3D hibrida | no disponible | no disponible | Repositorio de investigacion |

No se dispone de datos verificados de parametros, contexto ni metricas de las alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa queda abierta. La ventaja principal de este checkpoint frente a las implementaciones de investigacion es la integracion en una libreria con API estable y conversion a safetensors.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente con SUN RGB-D, compuesto por escenas de interior. El rendimiento en exteriores, escenas industriales o nubes de puntos generadas por LiDAR de largo alcance no está caracterizado.
- Solo 10 clases: el vocabulario de objetos es limitado y no cubre categorías frecuentes fuera del conjunto de interior.
- Sensibilidad al preprocesado: el detector asume el esquema de muestreo, normalización y codificación de color del dataset de entrenamiento; desviarse del transformador proporcionado en `info["transform"]` degrada las detecciones.
- Métricas no verificadas: los valores de mAP proceden de la model card y están marcados como `verified: false`; no hay evaluación independiente publicada.
- Riesgo de falsos positivos y detecciones incompletas en escenas densas o con objetos muy solapados, una limitación conocida de los detectores basados en votación con agrupamiento de semillas.
- Sin datos de sesgo: no se documenta ningún análisis de sesgo por tipo de escena, iluminación o geometría, ni de equidad entre categorías.
- Licencia MIT: permisiva y compatible con uso comercial, pero conviene conservar el aviso de copyright y las atribuciones del modelo original de Meta y del dataset SUN RGB-D, que puede tener sus propias condiciones de uso.
- Sin mantenimiento garantizado: el repositorio tiene 0 descargas y 0 valoraciones, y no se documenta soporte a largo plazo ni hoja de ruta.
- No apto para tareas de lenguaje: cualquier uso esperando generación de texto, razonamiento o diálogo es un error de categoría.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/votenet.sunrgbd.fair
- Paper Deep Hough Voting for 3D Object Detection in Point Clouds: https://arxiv.org/abs/1904.09664
- Repositorio original VoteNet (Meta): https://github.com/facebookresearch/votenet
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Referencia de la libreria (Zenodo, DOI 10.5281/zenodo.22159632): https://github.com/arthurdjn/pytorch-pointcloud
- Dataset SUN RGB-D (paper CVPR 2015): no se proporciona URL directa en la informacion disponible
