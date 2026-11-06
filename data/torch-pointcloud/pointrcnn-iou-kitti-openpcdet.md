# torch-pointcloud/pointrcnn-iou.kitti.openpcdet

## Resumen

PointRCNN es un detector de objetos 3D sobre nubes de puntos LiDAR, publicado originalmente en CVPR 2019 por Shaoshuai Shi, Xiaogang Wang y Hongsheng Li. Esta ficha corresponde a la conversión del modelo original de OpenPCDet al formato de la librería `torch-pointcloud`, publicada por el usuario `torch-pointcloud` en Hugging Face. Se trata de un modelo de dos etapas puramente basado en puntos: la primera etapa genera propuestas de cajas 3D mediante segmentación de primer plano en cada punto, y la segunda refina dichas propuestas con información agregada de la nube.

El modelo es pequeño (4.060.531 parámetros, aproximadamente 4,0 M) y está entrenado exclusivamente sobre el dataset KITTI para tres clases: coche, peatón y ciclista. No es un modelo de lenguaje ni un transformer generativo; es una red convolucional sobre puntos con atención de características, orientada a percepción 3D para conducción autónoma y robótica.

Su relevancia actual es la de un baseline clásico y reproducible: sirve como referencia de comparación para detectores 3D modernos, como modelo de extracción de características (128 canales) y como ejemplo de despliegue ligero en pipelines de percepción con requisitos de cómputo moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointRCNN (dos etapas, point-based: segmentación de primer plano + refinamiento de propuestas) |
| Parametros totales | 4.060.531 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de nube de puntos; entrada típica de 8192 puntos por muestra en el ejemplo de la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (x, y, z, intensidad) |
| Clases | 3 (Car, Pedestrian, Cyclist) |
| Dimensión de características | 128 |
| Dataset de entrenamiento | KITTI |
| Librería | torch-pointcloud |

## Arquitectura y entrenamiento

PointRCNN es una arquitectura de detección 3D en dos etapas. La primera etapa aplica una red de segmentación sobre los puntos crudos para clasificar cada punto como primer plano o fondo y, a partir de los puntos de primer plano, genera propuestas de cajas 3D. La segunda etapa refina cada propuesta combinando las características locales del punto con características globales de la región, lo que permite corregir posición, dimensiones y orientación de la caja. La red usa capas de convolución sobre puntos y un mecanismo de atención de características para agregar información entre puntos vecinos; no emplea voxelización ni proyecciones a vista de pájaro como paso principal.

El entrenamiento se realizó sobre KITTI, el benchmark de referencia para percepción en conducción autónoma, con las tres clases estándar del dataset. La model card no detalla el número de tokens ni la composición exacta del dataset más allá de indicar KITTI, y tampoco documenta si hubo aumentos de datos, funciones de pérdida específicas o ajuste fino adicional durante la conversión a `torch-pointcloud`. La conversión procede de OpenPCDet (Apache 2.0), y la innovación técnica destacable es precisamente el enfoque de dos etapas puramente basado en puntos, que evita la pérdida de información geométrica asociada a la cuantización en vóxeles.

## Capacidades

- Detección de objetos 3D en nubes de puntos LiDAR: devuelve cajas 3D con clase, posición, dimensiones y orientación para coche, peatón y ciclista.
- Segmentación de primer plano a nivel de punto como subproducto de la primera etapa.
- Extracción de características de 128 canales mediante `forward_features`, útil como backbone para tareas posteriores.
- Procesamiento de muestras con 4 canales de entrada (coordenadas x, y, z e intensidad).
- Soporte de batching mediante la utilidad `collate` de `torch-pointcloud`.
- Inferencia en modo evaluación (`model.eval()`) con `torch.no_grad()`, apta para despliegue en producción.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión RGB, audio ni generación de texto.

## Casos de uso

- Percepción 3D en vehículos autónomos: el modelo detecta coches, peatones y ciclistas en nubes LiDAR de KITTI, adecuado como módulo de detección en un stack de conducción autónoma con sensores LiDAR de 64 haces.
- Baseline de investigación en detección 3D: sirve como referencia reproducible (mAP 68,5 en KITTI) para comparar nuevos detectores point-based o basados en vóxeles.
- Extracción de características para tareas downstream: `forward_features` produce descriptores de 128 canales por punto que pueden alimentar clasificadores de escena, segmentación semántica o modelos de registro.
- Robótica móvil indoor/outdoor: con solo 4 M de parámetros, el modelo cabe en plataformas embebidas con GPU modesta para detección de obstáculos en tiempo real.
- Anotación asistida de datasets LiDAR: las propuestas de cajas 3D pueden pre-anotar escenas y reducir el coste de etiquetado manual, con revisión humana posterior.
- Docencia y prototipado: la instalación vía `pip install torch-pointcloud` y la API de `create_model` permiten montar un pipeline de detección 3D funcional en pocas líneas para experimentación académica.
- Análisis de tráfico y aforo: conteo y localización de peatones y ciclistas en secuencias LiDAR para estudios de movilidad urbana.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre el dataset KITTI:

| Metrica | Valor |
|---|---|
| mAP | 68,50 |
| AP/Car | 78,57 |
| AP/Pedestrian | 55,02 |
| AP/Cyclist | 71,92 |

No se han publicado en la información disponible resultados adicionales (latencia, throughput, métricas por dificultad fácil/moderada/difícil) ni comparaciones oficiales con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, en torno a 0,5-1 GB para lotes pequeños, dado el tamaño de 4,06 M de parámetros y una entrada típica de 8192 puntos; no se han publicado mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 y H100 funcionan sin problema, aunque el modelo no aprovecha la capacidad de las GPU de datacenter.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida para lotes reducidos.
- Opciones de despliegue: la librería `torch-pointcloud` (PyTorch) es la vía documentada; no se han publicado integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | mAP KITTI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pointrcnn-iou.kitti.openpcdet | 4,06 M | PointRCNN, dos etapas point-based | 68,50 | Apache 2.0 | Hugging Face (torch-pointcloud) |
| PointRCNN original (OpenPCDet) | ~4 M | PointRCNN, dos etapas point-based | no disponible en esta ficha | Apache 2.0 | GitHub OpenPCDet |
| Segundo (point-based) | no disponible | Detección 3D point-based de una etapa | no disponible | no disponible | Repositorio académico |
| PointPillars (voxel/pillar) | no disponible | Detección 3D basada en pillars | no disponible | MIT (implementaciones) | Múltiples repositorios |

Los datos de los modelos alternativos no están disponibles en la información proporcionada; la comparación se limita a indicar categoría y licencia conocida, sin cifras de rendimiento verificadas.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre KITTI: el dominio se limita a escenas de conducción urbana y rural con LiDAR de 64 haces; el rendimiento puede degradarse con otros sensores, densidades de puntos o entornos indoor.
- Solo tres clases (coche, peatón, ciclista); no detecta camiones, señales, semáforos ni otras categorías.
- Métricas declaradas por el autor y marcadas como no verificadas (`verified: false`); conviene reproducirlas antes de usarlas en comparaciones.
- Riesgo de falsos negativos en objetos ocluidos o alejados, habitual en detectores LiDAR de una sola modalidad; no fusiona cámara.
- Requiere preprocesado específico (transformación de la muestra y `collate`) documentado en la model card; un uso incorrecto de la API produce salidas inválidas.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; el modelo deriva de OpenPCDet, también Apache 2.0.
- No es un modelo generativo ni lingüístico: no debe evaluarse con métricas de texto ni usarse para tareas de NLP.
- No se documentan sesgos demográficos ni de escena más allá de la distribución de KITTI; la ausencia de datos al respecto no implica ausencia de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointrcnn-iou.kitti.openpcdet
- Paper PointRCNN: https://arxiv.org/abs/1812.04244
- Repositorio OpenPCDet: https://github.com/open-mmlab/OpenPCDet
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
