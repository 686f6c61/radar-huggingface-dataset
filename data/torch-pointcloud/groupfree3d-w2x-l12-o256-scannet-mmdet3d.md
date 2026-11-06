# torch-pointcloud/groupfree3d-w2x-l12-o256.scannet.mmdet3d

## Resumen

Group-Free 3D es un detector de objetos 3D sobre nubes de puntos presentado por investigadores de Microsoft Research Asia (Ze Liu, Zheng Zhang, Yue Cao, Han Hu, Xin Tong) en ICCV 2021. Este checkpoint concreto, `groupfree3d-w2x-l12-o256.scannet.mmdet3d`, es una conversión del modelo original de MMDetection3D al formato de la librería `torch-pointcloud`, publicada por el autor Arthur Dujardin. El modelo resuelve la detección de objetos 3D en interiores: recibe una nube de puntos con coordenadas, color y normales, y devuelve cajas 3D con clase y puntuación para 18 categorías de objetos.

La innovación central del paper es eliminar el módulo de agrupamiento de puntos (point grouping) que usaban los detectores 3D anteriores, como VoteNet. En su lugar, el modelo muestrea un conjunto fijo de candidatos a objeto (256 en esta variante, de ahí el sufijo `o256`) y los refina iterativamente con un decoder transformer de 12 capas y anchura 288 (`l12`), aplicando self-attention entre todos los candidatos para que cada uno vea el contexto global de la escena.

Es relevante para quien necesite un detector 3D ligero y con licencia permisiva que pueda ejecutarse en PyTorch puro sin depender del stack completo de MMDetection3D. Con 29,6 millones de parámetros y un repositorio de 0,1 GB, es un modelo pequeño y fácil de desplegar en pipelines de percepción 3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Group-Free 3D: backbone PointNet++ + decoder transformer (12 capas, anchura 288) sobre candidatos a objeto |
| Parametros totales | 29.597.377 (29,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (nube de puntos; 8192 puntos por muestra en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, precisión original) |
| Idiomas soportados | no aplica (modelo de vision 3D, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Clases | 18 |
| Canales de caracteristicas | 288 |
| Dataset de entrenamiento | ScanNet |
| Tarea | Deteccion de objetos 3D (`3d-object-detection`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Group-Free 3D. Un backbone PointNet++ extrae características por punto a partir de las coordenadas, el color y las normales de la nube de puntos. Sobre esas características se muestrean 256 candidatos a objeto (posiciones 3D iniciales). Un decoder transformer de 12 capas con dimensión oculta 288 aplica self-attention entre todos los candidatos, de modo que cada candidato agrega información de la escena completa, y refina iterativamente su posición y sus características. Finalmente, cabezas de clasificación y regresión producen las cajas 3D con clase y confianza.

El entrenamiento se realizó sobre ScanNet, el dataset de reconstrucciones 3D de interiores con anotaciones ricas (Dai et al., CVPR 2017), con 18 clases de objetos. La información disponible no detalla el número de tokens ni la composición exacta del dataset más allá de la referencia a ScanNet, ni si se aplicaron fases de refinamiento posteriores. El checkpoint es una conversión directa de los pesos de MMDetection3D, no un reentrenamiento.

## Capacidades

- Detección de objetos 3D en nubes de puntos de interiores: devuelve cajas 3D con clase y puntuación para 18 categorías de ScanNet.
- Entrada multimodal por punto: coordenadas (`pos`), color RGB (`color`) y normales (`normal`), más etiquetas de segmento e instancia opcionales.
- Extracción de características: `forward_features` devuelve un tensor de 288 canales por punto, utilizable como representación para tareas posteriores.
- Procesamiento por lotes mediante `collate` de `torch_pointcloud`.
- Integración nativa con PyTorch y con la API `tp.create_model` de la librería `torch-pointcloud`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente perceptivo 3D.

## Casos de uso

- Robotica de interior y navegacion: el modelo detecta sillas, mesas, puertas y otros objetos de ScanNet en la nube de puntos de un robot, proporcionando cajas 3D que alimentan la planificacion de trayectorias y la evitacion de obstaculos.
- Digitalizacion y modelado de interiores: a partir de un escaneo con LiDAR o fotogrametria, se extraen instancias de mobiliario y estructura para generar planos semánticos o gemelos digitales de edificios.
- Realidad aumentada y virtual: colocar objetos virtuales sobre superficies reales requiere conocer la posicion y orientacion de mesas, suelos y paredes; el modelo aporta esas cajas 3D en tiempo de captura.
- Analisis de escenas para inventario: en entornos de retail o almacenes, contar y localizar objetos (estanterias, cajas, productos) sobre nubes de puntos capturadas con sensores de profundidad.
- Preprocesado para pipelines de manipulacion: un brazo robotico necesita la pose 3D del objeto a agarrar; el modelo ofrece la caja delimitadora que se usa como region de interes para estimacion de pose 6D posterior.
- Investigacion en percepcion 3D: servir de baseline reproducible y ligero (29,6 M de parametros) para comparar arquitecturas de deteccion 3D o para hacer fine-tuning sobre otros datasets de interiores con la misma taxonomia de 18 clases.
- Extraccion de caracteristicas para tareas downstream: usar `forward_features` (288 canales) como embedding por punto para segmentacion semantica, clustering o recuperacion de escenas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en el model-index (no verificados, `verified: false`):

| Metrica | Dataset | Valor |
|---|---|---|
| mAP@0.25 | ScanNet | 66,97 |
| mAP@0.5 | ScanNet | 49,53 |

No se han publicado en la informacion disponible otros resultados de benchmarks (por ejemplo, mAP@0.5 en clases por separado, latencia o throughput).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 29,6 M de parametros (unos 118 MB en FP32 y unos 59 MB en FP16). Con el backbone y los buffers de activacion para 8192 puntos, la inferencia cabe holgadamente en GPUs con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB, como RTX 3060, RTX 4060, RTX 4090, A100 o H100. El modelo no requiere hardware de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo reciente (GTX 1660, RTX 2060 en adelante).
- Opciones de despliegue: PyTorch nativo a traves de la libreria `torch-pointcloud` (`pip install torch-pointcloud`). La informacion disponible no menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de nubes de puntos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | mAP@0.25 | mAP@0.5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Group-Free 3D (este checkpoint) | 29,6 M | ScanNet | 66,97 | 49,53 | Apache 2.0 | Hugging Face + torch-pointcloud |
| VoteNet | no disponible en la informacion | ScanNet | no disponible | no disponible | MIT (MMDetection3D) | MMDetection3D |
| Group-Free 3D original (MMDetection3D) | no disponible en la informacion | ScanNet | no disponible | no disponible | Apache 2.0 | GitHub MMDetection3D |
| PointNet++ (clasificacion/segmentacion) | no disponible en la informacion | ScanNet | no aplica | no aplica | MIT | Varios repositorios |

La informacion proporcionada no incluye cifras de rendimiento de los modelos alternativos, por lo que la comparacion cuantitativa no esta disponible. La ventaja diferencial de este checkpoint frente al original de MMDetection3D es su empaquetado ligero en safetensors y su API directa en `torch-pointcloud`, sin necesidad de instalar el stack completo de MMDetection3D.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente en ScanNet (interiores de escenas reales), por lo que el rendimiento fuera de ese dominio (exteriores, escenas sinteticas, otros sensores) no esta garantizado.
- Taxonomia fija de 18 clases: no detecta categorias fuera de las definidas en ScanNet.
- Requiere nube de puntos con color y normales: si el sensor no proporciona normales, hay que estimarlas previamente, lo que puede degradar el rendimiento.
- Riesgo de alucinacion: como todo detector, puede producir falsos positivos con alta confianza en regiones ambiguas o con oclusiones severas; los umbrales de confianza deben calibrarse para produccion.
- Sesgos: la distribucion de ScanNet (habitaciones, mobiliario y sensores concretos) puede introducir sesgos hacia escenas de interior tipicas de oficina u hogar.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las obligaciones de atribucion y las licencias del dataset ScanNet, que tiene sus propios terminos de uso para los datos de entrenamiento.
- Resultados no verificados: las metricas del model-index estan marcadas como `verified: false`; no se han reproducido de forma independiente en la informacion disponible.
- Sin soporte de lenguaje: no procesa texto ni instrucciones; cualquier capa conversacional o de agente debe construirse por encima.
- Repositorio pequeno y poco difundido (20 descargas, 0 likes): menor soporte comunitario y menor probabilidad de correcciones o actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/groupfree3d-w2x-l12-o256.scannet.mmdet3d
- Paper Group-Free 3D: https://arxiv.org/abs/2104.00678
- Repositorio MMDetection3D (origen de los pesos): https://github.com/open-mmlab/mmdetection3d
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Dataset ScanNet: https://github.com/ScanNet/ScanNet
- Paper ScanNet (CVPR 2017): https://arxiv.org/abs/1702.04405
