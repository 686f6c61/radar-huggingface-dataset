# torch-pointcloud/randlanet.semantickitti.open3d

## Resumen

RandLA-Net es una arquitectura de segmentación semántica de nubes de puntos 3D diseñada para escenas de gran escala. Este checkpoint concreto, `randlanet.semantickitti.open3d`, es una conversión a PyTorch (librería `torch-pointcloud` de Arthur Dujardin) de los pesos originales de Open3D-ML, entrenados sobre el dataset SemanticKITTI para etiquetar nubes de puntos LiDAR en 19 clases (carretera, coche, peatón, vegetación, edificio, etc.).

El modelo resuelve el problema de asignar una clase semántica a cada punto individual de un barrido LiDAR, algo crítico en conducción autónoma, robótica móvil y digitalización de entornos urbanos. Su relevancia práctica está en el coste: con solo 1,25 millones de parámetros y una estrategia de muestreo aleatorio (frente a búsquedas de vecinos más caras), procesa nubes de decenas de miles de puntos en hardware modesto, lo que lo hace apto para despliegue en tiempo real o en sistemas embebidos.

Frente a los modelos fundacionales de gran tamaño, este checkpoint no es un modelo generativo ni un LLM: es un segmentador puro de nubes de puntos, con entrada de 3 canales (coordenadas) más intensidad opcional, y salida de logits por punto. Sus resultados declarados en SemanticKITTI son 46,18 de mIoU y 83,99 de accuracy global (OA), no verificados por un tercero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RandLA-Net (encoder-decoder con muestreo aleatorio de puntos y agregacion local de caracteristicas, LFA) |
| Parametros totales | 1.250.003 (segun safetensors); la model card indica 1,2 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es una nube de puntos de N puntos (el ejemplo de la model card usa 8192 puntos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, INT8 ni FP16) |
| Idiomas soportados | no aplica (modelo de vision 3D, no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 3 (coordenadas XYZ); intensidad como canal adicional segun transformacion |
| Numero de clases | 19 (SemanticKITTI) |
| Dimensión de caracteristicas | 32 |
| Dataset de entrenamiento | SemanticKITTI |
| Libreria | torch-pointcloud (`pip install torch-pointcloud`) |

## Arquitectura y entrenamiento

RandLA-Net es un transformer-de-puntos hibrido con estructura encoder-decoder. La clave del diseno es sustituir las operaciones costosas de busqueda de vecinos (kNN o radio search en todo el cloud) por un muestreo aleatorio de puntos (random sampling), que reduce el coste computacional de O(N log N) a O(N) y permite escalar a nubes de hasta millones de puntos. Cada bloque de agregacion local de caracteristicas (LocSE + attentive pooling) codifica la geometria relativa de cada punto respecto a sus vecinos en espacio de features de 32 dimensiones. La red decodifica despues mediante upsampling por interpolacion para recuperar la resolucion original punto a punto.

El checkpoint se ha entrenado sobre SemanticKITTI, el benchmark de referencia para segmentacion semantica de secuencias LiDAR (escenas urbanas de Karlsruhe, Alemania, capturadas con Velodyne HDL-64E). No se documentan en la informacion disponible el numero exacto de tokens/puntos de entrenamiento, la composicion del dataset, ni si hubo etapas de refinamiento. Tampoco se documenta RLHF ni preferencias humanas, algo que no aplica a una tarea de segmentacion supervisada por punto. La conversion procede de los pesos de Open3D-ML (licencia MIT) al formato de la libreria torch-pointcloud, lo que habilita `create_model` con `pretrained=True` y extraccion de caracteristicas via `forward_features`.

## Capacidades

- Segmentacion semantica densa de nubes de puntos LiDAR en 19 clases de SemanticKITTI (road, sidewalk, building, vegetation, trunk, terrain, car, truck, bicycle, motorcycle, pedestrian, etc.).
- Clasificacion punto a punto con salida de logits (`logits = model(x, pos, batch)`), apta para pipelines de inferencia por lotes.
- Extraccion de descriptores por punto: `forward_features` devuelve un vector de 32 dimensiones por punto, util para tareas downstream (clustering, retrieval, transfer learning).
- Reduccion a extractor puro: `reset_classifier(num_classes=0)` permite usar el modelo como backbone sin cabeza de clasificacion.
- Procesamiento de nubes de tamanos arbitrarios gracias al muestreo aleatorio (no requiere voxelizacion fija ni rejillas regulares).
- Uso de la intensidad de retorno LiDAR como canal adicional de entrada si el transform del dataset lo incluye.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.
- No soporta vision 2D ni audio; su dominio es exclusivamente geometrico 3D.

## Casos de uso

- **Conduccion autonoma y ADAS: perception stack.** El modelo etiqueta cada punto del barrido LiDAR del vehiculo (carretera, coche, peaton, ciclista) y alimenta modulos de prediccion de trayectoria y planificacion. Su coste de 1,25 M de parametros permite ejecutarlo a bordo a frecuencia de LiDAR (10-20 Hz) sin GPU dedicada de gama alta.
- **Robotica movil en interiores y exteriores.** Un robot de reparto o de limpieza industrial puede usar la segmentacion para distinguir suelo transitable de obstaculos y personas. La entrada de nube de puntos sin rejilla encaja con LiDAR 3D de 16 o 32 haces.
- **Digitalizacion urbana y BIM.** Procesado de campanas de escaneo movil (MLS) para separar fachadas, vegetacion y mobiliario urbano antes de generar modelos de informacion de edificios o gemelos digitales.
- **Pre-anotacion de datasets de nubes de puntos.** El modelo genera etiquetas iniciales sobre nuevos escaneos que un equipo humano revisa y corrige en herramientas como SUSTechPOINTS o CVAT, reduciendo el coste de anotacion manual por punto.
- **Mantenimiento de infraestructuras viarias.** Deteccion automatica de elementos de la via (senalizacion, bordillos, vegetacion invasora) a partir de escaneos periodicos, comparando segmentaciones entre campanas para detectar cambios.
- **Analisis de accesibilidad urbana.** Cuantificacion de aceras, pasos de cebra y obstaculos en escaneos de ciudad para estudios de movilidad peatonal o planificacion de rutas accesibles.
- **Inventario forestal y agricola con LiDAR terrestre o dron.** Aunque el modelo esta entrenado en escenas urbanas, las clases trunk y vegetation permiten separar fuste y copa en inventarios de biomasa; requiere validacion previa por el sesgo de dominio.
- **Extraccion de caracteristicas para busqueda de escenas 3D.** Usando `forward_features` se obtienen descriptores por punto de 32 dimensiones utiles para place recognition o recuperacion de escaneos similares.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados por un tercero independiente):

| Dataset | Tarea | Metrica | Valor | Verificado |
|---|---|---|---|---|
| SemanticKITTI | Segmentacion semantica de nubes de puntos | mIoU | 46,18 | No |
| SemanticKITTI | Segmentacion semantica de nubes de puntos | OA (accuracy global) | 83,99 | No |

No se han publicado resultados de benchmarks adicionales (tiempo de inferencia, fps, mIoU por clase) en la informacion disponible. La brecha entre OA (83,99) y mIoU (46,18) es indicativa de un fuerte desbalance de clases: las clases mayoritarias (carretera, edificio, coche) se predicen bien mientras que las minoritarias (peaton, ciclista, motocicleta, camion) concentran el error.

## Requisitos de hardware

- **VRAM estimada:** los pesos en FP32 ocupan aproximadamente 5 MB (1,25 M de parametros x 4 bytes). El consumo real lo dominan las activaciones, que escalan con el numero de puntos de entrada; no hay cifras publicadas.
- **GPU recomendadas:** cualquier GPU con al menos 4-8 GB de VRAM es suficiente en la practica; una RTX 3060, RTX 4060, T4 o superior cubre el caso de uso sin problemas.
- **Consumer GPU:** si, cabe holgadamente en cualquier GPU de consumo de los ultimos ocho anos, e incluso es viable en CPU para inferencia por lotes de tamano moderado.
- **Opciones de despliegue:** PyTorch nativo via `torch-pointcloud`; exportacion a TorchScript u ONNX no documentada pero tecnicamente factible por ser un modelo puramente convolutional/MLP. vLLM, llama.cpp, Ollama y TGI no aplican (no es un LLM).
- **Latencia y throughput:** no disponibles en la informacion proporcionada. Como referencia estructural, el cuello de botella tipico de RandLA-Net es el bloque de agregacion local sobre los puntos muestreados, no el numero de parametros.
- **Memoria en CPU:** el ejemplo de la model card procesa 8192 puntos con `torch.no_grad()` sin requisitos especiales; nubes completas de SemanticKITTI superan los 100.000 puntos y conviene trocearlas o limitar el numero de puntos por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mIoU SemanticKITTI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| randlanet.semantickitti.open3d (este) | 1,25 M | nube de puntos de N puntos | 46,18 (declarado, no verificado) | MIT | HuggingFace, torch-pointcloud |
| RandLA-Net original (paper CVPR 2020) | no disponible en la informacion | nube de puntos de N puntos | no disponible en la informacion | codigo de investigacion (consultar repositorio) | TensorFlow, repositorio de los autores |
| PointNet++ | no disponible en la informacion | nube de puntos de N puntos | no disponible en la informacion | no disponible | implementaciones multiples |
| KPConv | no disponible en la informacion | nube de puntos de N puntos | no disponible en la informacion | no disponible | implementaciones multiples |
| MinkowskiNet / SPVCNN | no disponible en la informacion | voxelizacion dispersa | no disponible en la informacion | no disponible | Open3D-ML, MinkowskiEngine |

La comparacion cuantitativa con alternativas no puede completarse con los datos suministrados: solo se dispone del resultado declarado para este checkpoint. Cualitativamente, la ventaja de RandLA-Net frente a PointNet++ y KPConv es el coste lineal en el numero de puntos, y su desventaja frente a los modelos basados en convolucion dispersa (MinkowskiNet, SPVCNN) es una menor precision absoluta en benchmarks publicos, a cambio de mucha menor complejidad de despliegue.

## Limitaciones y advertencias

- **Sesgo de dominio fuerte:** entrenado exclusivamente con LiDAR Velodyne HDL-64E en escenas urbanas de Karlsruhe. El rendimiento cae previsiblemente con otros sensores (LiDAR de estado solido, 16 haces), otras geometrias de escena (interiores, forestal, industrial) u otras condiciones meteorologicas.
- **Desbalance de clases:** la diferencia entre OA (83,99) y mIoU (46,18) confirma que las clases minoritarias se segmentan mal; no es fiable para deteccion de peatones o ciclistas sin validacion especifica.
- **Riesgo de alucinacion geometrica:** el modelo asigna una clase a cada punto aunque la escena no pertenezca al dominio de entrenamiento (por ejemplo, un almacen interior), produciendo etiquetas plausibles pero incorrectas sin senal de incertidumbre calibrada.
- **Metricas no verificadas:** los valores de mIoU y OA proceden de la model card y estan marcados como `verified: false`; conviene reproducirlos antes de usarlos en una decision de arquitectura.
- **Sin informacion de calibracion ni incertidumbre:** no se documentan tecnicas de calibracion, umbrales de confianza ni abstención.
- **Restricciones de licencia:** licencia MIT, permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. El codigo de Open3D-ML de origen tambien es MIT; verificar la cadena de atribuciones al redistribuir.
- **Mantenimiento:** el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto de conversion reciente (creado en 2026) sin comunidad consolidada. Asumir soporte limitado.
- **Documentacion escasa:** no se detallan hiperparametros de entrenamiento, numero de epocas, aumentos de datos ni procesos de validacion; la reproducibilidad del 46,18 de mIoU no esta garantizada.
- **Entrada no conversacional:** cualquier uso que requiera lenguaje natural, instrucciones o razonamiento queda fuera del alcance del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/randlanet.semantickitti.open3d
- Paper RandLA-Net (CVPR 2020): https://arxiv.org/abs/1911.11236
- Repositorio de la libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Repositorio Open3D-ML (origen de los pesos): https://github.com/isl-org/Open3D-ML
- DOI de la libreria (Zenodo): https://doi.org/10.5281/zenodo.22159632
- Dataset SemanticKITTI (referencia en la cita de la model card): no se proporciona URL directa en la informacion disponible
