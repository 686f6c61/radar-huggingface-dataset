# torch-pointcloud/votenet.scannet.fair

## Resumen

VoteNet es un detector de objetos 3D sobre nubes de puntos propuesto por Charles R. Qi, Or Litany, Kaiming He y Leonidas J. Guibas (Facebook AI Research) en el paper "Deep Hough Voting for 3D Object Detection in Point Clouds" (ICCV 2019). Esta ficha corresponde a `torch-pointcloud/votenet.scannet.fair`, una conversión del modelo original `facebookresearch/votenet` al formato de la librería `torch-pointcloud`, publicada por Arthur Dujardin y entrenada sobre el dataset ScanNet. No es un modelo de lenguaje: es un detector de objetos 3D para escenas de interior, con 18 clases y una cabeza de regresión de cajas orientadas.

El modelo combina un backbone PointNet++ que extrae semillas de puntos, una etapa de votación tipo Hough en la que cada semilla predice un desplazamiento hacia el centro del objeto, y un módulo de propuestas que agrupa los votos y regresa cajas 3D con clase y confianza. Con 961.764 parámetros (aproximadamente 1,0 M según la model card), es un modelo muy compacto: el coste computacional está dominado por el procesamiento de la nube de puntos, no por el número de pesos.

Su relevancia práctica está en que ofrece un pipeline de detección 3D listo para usar con `pip install torch-pointcloud`, con pesos en `safetensors`, licencia MIT y métricas declaradas sobre ScanNet (mAP@0.25 de 57,65 y mAP@0.5 de 34,1). Es útil como línea base reproducible para percepción 3D en robótica, realidad aumentada o anotación semiautomática de escenas, y como referencia para comparar implementaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoteNet: backbone PointNet++ + votacion Hough profunda (deep Hough voting) + modulo de propuestas + regresion de cajas 3D |
| Parametros totales | 961.764 (~0,96 M) segun safetensors; 1,0 M segun la model card |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje); el ejemplo de uso emplea 8192 puntos por muestra |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors |
| Idiomas soportados | No aplica (no procesa texto ni voz) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | Deteccion de objetos 3D (`object-detection`) |
| Dataset de entrenamiento | ScanNet |
| Numero de clases | 18 |
| Canales de entrada | 1 (segun la model card) |
| Dimension de features | 256 canales (`forward_features`) |
| Tamano del repositorio | 0,0 GB |
| Libreria | `torch-pointcloud` |

## Arquitectura y entrenamiento

VoteNet sustituye el paradigma de propuestas 2D por una votacion en el espacio 3D. El backbone PointNet++ muestrea y agrupa la nube de puntos para producir un conjunto de semillas con features de 256 canales; cada semilla predice un voto (desplazamiento tridimensional) hacia el centro del objeto al que pertenece, ademas de un offset de features. Los votos se agrupan mediante un modulo de propuestas que genera clusters, y cada cluster se procesa para clasificar la clase (18 categorias de ScanNet) y regresar los parametros de la caja 3D: centro, dimensiones, orientacion y angulo de alineacion con el plano del suelo. La implementacion de `torch-pointcloud` expone tanto la salida de deteccion completa como una extraccion de features de 256 canales mediante `forward_features(x, pos, batch)`.

El modelo se entrena sobre ScanNet, un dataset de reconstrucciones 3D de interiores con anotaciones semanticas e instancias. La model card no detalla el numero de tokens ni de epochs, la composicion exacta de las clases, ni si hubo etapas de refinamiento posteriores; tampoco especifica el esquema de aumentado de datos ni el protocolo de evaluacion mas alla de las metricas declaradas. El sufijo `fair` hace referencia a la configuracion de evaluacion comparativa de la libreria, pero la informacion disponible no documenta en que consiste exactamente esa variante frente a otras versiones del mismo modelo. Los pesos se distribuyen como conversion de la implementacion oficial de Meta (`facebookresearch/votenet`, licencia MIT).

## Capacidades

- Deteccion de objetos 3D en nubes de puntos de escenas de interior: devuelve cajas 3D con clase, centro, dimensiones, orientacion y score de confianza.
- Clasificacion en 18 categorias de ScanNet (mobiliario y elementos de interior como sillas, mesas, camas, armarios, puertas, ventanas, sanitarios o electrodomesticos).
- Votacion Hough profunda: agregacion de votos por objeto, lo que permite separar instancias cercanas o parcialmente ocluidas.
- Extraccion de features por punto/semilla de 256 canales, util para tareas downstream (segmentacion, recuperacion, clustering).
- Procesamiento de nubes con posiciones, color, normales y etiquetas de segmento, segun la interfaz de `collate` de la libreria.
- No soporta generacion de texto, tool calling, function calling, agentes, razonamiento multi-paso, vision 2D a partir de imagenes RGB ni audio.
- No tiene capacidades multilingues: no hay tokenizador ni vocabulario.

## Casos de uso

- Percepcion para robotica movil de interior: el detector recibe la nube de puntos de una camara de profundidad o LiDAR y devuelve las cajas de mobiliario y obstaculos, que se pueden proyectar en el mapa de navegacion para evitar colisiones en tiempo de ejecucion.
- Anotacion semiautomatica de datasets 3D: preetiquetar escenas ScanNet-like con las 18 clases y revisar despues manualmente, reduciendo el coste de anotacion de instancias en estudios de reconstruccion de interiores.
- Realidad aumentada y virtual: colocar anclas u objetos virtuales sobre elementos detectados (mesas, sillas, estanterias) a partir de un escaneo del entorno con el movil o con un visor.
- Escaneo y modelado BIM: inventariar mobiliario de una estancia escaneada para generar listados de elementos y comprobar el estado de una reforma antes de la intervencion.
- Manipulacion robotica: localizar la caja 3D de un objeto sobre una superficie de trabajo para calcular la pose de agarre con un brazo robotico, usando las dimensiones y la orientacion devueltas por el detector.
- Analisis de espacios comerciales o de oficina: conteo y localizacion de sillas, mesas y estanterias en escaneos periodicos para analitica de ocupacion y planificacion de espacio.
- Linea base de investigacion: comparar nuevas arquitecturas de deteccion 3D contra un VoteNet reproducible con pesos publicados, mismo dataset y misma licencia permisiva.
- Extraccion de features para aprendizaje autosupervisado: usar los 256 canales de `forward_features` como entrada de cabezas ligeras de segmentacion o clasificacion de escena.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Deteccion de objetos 3D | ScanNet | mAP@0.25 | 57,65 | No |
| Deteccion de objetos 3D | ScanNet | mAP@0.5 | 34,10 | No |

No se han publicado en la informacion disponible otros resultados (por ejemplo, desglose por clase, mAP@0.5 en categorias minoritarias, latencia o consumo de memoria) ni comparaciones oficiales con otras implementaciones.

## Requisitos de hardware

- Peso de los parametros: 961.764 parametros, aproximadamente 3,8 MB en fp32 y 1,9 MB en fp16. El modelo cabe holgadamente en memoria en cualquier GPU.
- VRAM estimada para inferencia: menos de 1 GB para una sola escena con 8192 puntos en fp32, dominada por activaciones del backbone PointNet++ mas que por los pesos. Para lotes de 8 a 16 escenas es razonable reservar entre 2 y 6 GB, cifra orientativa que depende del numero de puntos por muestra y de la implementacion de las operaciones de agrupacion.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100. El cuello de botella es el muestreo y agrupamiento de puntos, sensible a la implementacion; no se dispone de cifras de throughput publicadas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con al menos 4 GB de VRAM; tambien es viable en CPU para inferencia puntual, aunque con mayor latencia.
- Opciones de despliegue: `torch-pointcloud` sobre PyTorch con `tp.create_model("votenet.scannet.fair", pretrained=True)`; exportacion a TorchScript o ONNX no documentada; no aplica vLLM, Ollama, TGI ni llama.cpp, que son servidores para modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento en ScanNet | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| votenet.scannet.fair (esta ficha) | 961.764 | Nube de puntos; 8192 puntos en el ejemplo | mAP@0.25 57,65 / mAP@0.5 34,10 (declarado, no verificado) | MIT | Pesos en HuggingFace, libreria `torch-pointcloud` |
| facebookresearch/votenet (original) | 1,0 M aproximadamente (misma arquitectura) | Nube de puntos | No disponible en la informacion proporcionada | MIT | Codigo y checkpoints en GitHub |
| H3DNet | No disponible | Nube de puntos | No disponible en la informacion proporcionada | No disponible | Repositorio de investigacion |
| Group-Free 3D | No disponible | Nube de puntos | No disponible en la informacion proporcionada | No disponible | Repositorio de investigacion |
| 3DETR | No disponible | Nube de puntos | No disponible en la informacion proporcionada | No disponible | Repositorio de investigacion |

La comparacion se limita a categoria y disponibilidad: no se dispone de datos verificados de parametros ni de metricas homogeneas para las alternativas en la informacion proporcionada, por lo que no se establece una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Ambito restringido: solo escenas de interior y solo 18 clases de ScanNet; no detecta categorias fuera de ese vocabulario ni objetos de exterior, vehiculos o personas.
- Precision limitada con umbrales estrictos: el mAP@0.5 declarado es 34,10, lo que indica que la localizacion fina de cajas orientadas es la parte mas debil del detector.
- Metricas no verificadas: los valores proceden de la model card y no han sido reproducidos de forma independiente; el repositorio registra 0 descargas, por lo que no hay evidencia de uso en produccion.
- Desbalanceo de clases del dataset: es previsible un rendimiento inferior en categorias poco frecuentes de ScanNet (por ejemplo, banera o cortina de ducha) frente a sillas y mesas, aunque no se publica el desglose por clase.
- Dependencia del muestreo y de la calidad de la nube: cambios en el numero de puntos, ruido de profundidad, oclusiones severas o reconstrucciones incompletas afectan a las semillas y, por tanto, a los votos.
- Sin informacion sobre sesgos: no se documentan analisis de sesgo por tipo de estancia, geometria o material; al tratarse de un dataset acotado de interiores, la generalizacion a otros entornos no esta caracterizada.
- Riesgo de alucinacion en el sentido de falsos positivos: como cualquier detector, puede emitir cajas con alta confianza sobre regiones sin objeto; requiere umbral de score y, preferiblemente, verificacion geometrica posterior.
- No procesa texto ni imagenes RGB: si el pipeline parte de video, hace falta un paso previo de reconstruccion o proyeccion a nube de puntos.
- Licencia MIT: permite uso comercial y modificacion con atribucion; conviene conservar los avisos de copyright del modelo original de Meta y del trabajo derivado, y citar el paper y la libreria.
- Documentacion incompleta para produccion: no se publican hiperparametros de entrenamiento, receta de aumentado, ni detalles de la variante `fair`, lo que dificulta reproducir el resultado exacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/votenet.scannet.fair
- Paper de VoteNet (ICCV 2019): https://arxiv.org/abs/1904.09664
- Implementacion original: https://github.com/facebookresearch/votenet
- Libreria `torch-pointcloud`: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la libreria (Zenodo): https://doi.org/10.5281/zenodo.22159632
- Dataset ScanNet (paper CVPR 2017): https://arxiv.org/abs/1702.04405
- Web de ScanNet: http://www.scan-net.org/
