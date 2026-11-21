# torch-pointcloud/votenet.scannet.mmdet3d

## Resumen

VoteNet es un detector de objetos 3D para nubes de puntos desarrollado originalmente por Charles R. Qi, Or Litany, Kaiming He y Leonidas J. Guibas (Facebook AI Research y Stanford University), publicado en ICCV 2019 bajo el título "Deep Hough Voting for 3D Object Detection in Point Clouds". Esta ficha corresponde a la versión `votenet.scannet.mmdet3d`, un checkpoint convertido desde MMDetection3D y empaquetado para la librería `torch-pointcloud` de Arthur Dujardin. El modelo detecta 18 clases de objetos en escenas interiores de ScanNet mediante un mecanismo de votación tipo Hough profundo.

A diferencia de los modelos de lenguaje, VoteNet opera exclusivamente sobre nubes de puntos 3D: recibe coordenadas XYZ (con canales opcionales de color, normal y segmento) y produce cajas 3D orientadas con sus etiquetas de clase. Con aproximadamente 1 millón de parámetros (961.764 según el fichero safetensors), es un modelo muy compacto que puede ejecutarse en CPU o en GPUs de consumo, lo que lo hace atractivo para robótica, realidad aumentada y análisis de escenas interiores.

La relevancia actual de este checkpoint radica en su empaquetado moderno: pesos en safetensors, API unificada mediante `tp.create_model`, y compatibilidad con el ecosistema PyTorch. Es una alternativa ligera y con licencia Apache-2.0 frente a detectores 3D más pesados, y sirve como referencia reproducible de los resultados originales de VoteNet en ScanNet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoteNet (deep Hough voting sobre PointNet++, backbone tipo PointNet2) |
| Parametros totales | 961.764 (≈1,0 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (nube de puntos; ejemplo de la model card con 8192 puntos) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no aplica (modelo de vision 3D, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 0.0 GB) |

Datos adicionales de la model card: canales de entrada 1, 18 clases, 256 canales de features, dataset ScanNet.

## Arquitectura y entrenamiento

VoteNet combina un backbone PointNet++ para extraer features de la nube de puntos con un módulo de votación profunda tipo Hough: cada punto semilla predice un desplazamiento hacia el centro del objeto al que pertenece, y los votos se agrupan para proponer cajas 3D. Sobre esas propuestas se aplica un cabezal de clasificación y regresión de cajas con orientación. El modelo usa 256 canales de features y un único canal de entrada según la model card, y produce detecciones sobre 18 clases de ScanNet.

El checkpoint fue entrenado sobre el dataset ScanNet (escenas interiores RGB-D anotadas con cajas 3D) y posteriormente convertido desde MMDetection3D. No se dispone en la información proporcionada de detalles sobre número de tokens/puntos de entrenamiento, composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos o ajuste fino adicional más allá del entrenamiento original descrito en el paper. La innovación técnica principal es el esquema de votación Hough profundo, que permite detectar objetos a partir de nubes de puntos dispersas sin depender de voxelización densa.

## Capacidades

- Detección de objetos 3D en nubes de puntos de escenas interiores, con 18 clases de ScanNet.
- Predicción de cajas 3D orientadas (centro, dimensiones y rotación) junto con etiqueta de clase.
- Extracción de features de 256 canales mediante `forward_features`, útil para tareas downstream (clasificación, segmentación, retrieval).
- Entrada flexible: coordenadas XYZ con canales opcionales de color, normal y segmento, tal como se muestra en el ejemplo de uso.
- Procesamiento por lotes mediante `collate` de `torch-pointcloud`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión 3D.
- No dispone de modo "thinking", visión 2D, audio ni generación de texto.

## Casos de uso

- Robótica móvil en interiores: detección de sillas, mesas, puertas y otros objetos de ScanNet a partir de la nube de puntos de un LiDAR o cámara de profundidad, para planificación de navegación y manipulación. Su tamaño de ~1 M de parámetros permite ejecución en el propio robot.
- Realidad aumentada y escaneo 3D: identificación y anclaje de objetos en reconstrucciones de habitaciones para superponer contenido virtual o generar inventarios automáticos.
- Análisis de escenas para inmobiliaria y arquitectura: extracción automática de mobiliario y elementos estructurales de escaneos interiores para generar planos o presupuestos.
- Preprocesado en pipelines de datos 3D: uso de `forward_features` como extractor de representaciones de 256 canales para alimentar clasificadores o modelos de segmentación posteriores.
- Investigación y reproducción de resultados: referencia reproducible de VoteNet en ScanNet (mAP@0.25 61,17; mAP@0.5 39,67) para comparar nuevas arquitecturas de detección 3D.
- Prototipado rápido en CPU: al ser un modelo pequeño, permite validar ideas de detección 3D sin GPU dedicada antes de escalar a modelos mayores.
- Docencia y experimentación: ejemplo didáctico de votación Hough profunda y de conversión de checkpoints MMDetection3D a `torch-pointcloud`.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| ScanNet (3D object detection) | mAP@0.25 | 61,17 |
| ScanNet (3D object detection) | mAP@0.5 | 39,67 |

No se han publicado en la información disponible otros resultados (latencia, throughput, comparativas numéricas con modelos alternativos).

## Requisitos de hardware

- VRAM estimada: muy baja; con ~1 M de parámetros y entradas de 8192 puntos, la inferencia cabe holgadamente en GPUs de 4-8 GB e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA; RTX 3060/4090, A100 o H100 son más que suficientes. Para lotes grandes de nubes de puntos, una RTX 4090 o A100 reduce el tiempo por muestra.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos unos pocos GB de VRAM; también es viable en CPU para inferencia puntual.
- Opciones de despliegue: librería `torch-pointcloud` (`tp.create_model`), PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión 3D).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | mAP@0.25 ScanNet | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoteNet (este checkpoint) | ≈1,0 M | nube de puntos (p. ej. 8192 puntos) | 61,17 | Apache-2.0 | Hugging Face, `torch-pointcloud` |
| VoteNet original (MMDetection3D) | ≈1,0 M | nube de puntos | no disponible en esta ficha | Apache-2.0 | GitHub MMDetection3D |
| Alternativas 3D (p. ej. PointRCNN, FCAF3D) | no disponible | nube de puntos | no disponible en esta ficha | no disponible | no disponible |

No se dispone en la información proporcionada de resultados numéricos de modelos alternativos para una comparación rigurosa; los datos de la fila de VoteNet original y alternativas deben consultarse en sus respectivas fuentes.

## Limitaciones y advertencias

- Entrenado exclusivamente en ScanNet: generaliza mal a dominios distintos (exteriores, LiDAR vehicular, objetos no presentes en las 18 clases).
- Depende de la calidad y densidad de la nube de puntos; nubes muy dispersas o con ruido pueden degradar la detección.
- Riesgo de falsos positivos y de cajas mal orientadas en escenas con oclusiones o mobiliario poco representado.
- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no soporta instrucciones en lenguaje natural.
- Los resultados de benchmarks están marcados como no verificados por el autor; conviene reproducirlos antes de usarlos en producción.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda citar el paper original y el software `torch-pointcloud` según indica la model card.
- El repo indica tamaño 0.0 GB y 875 descargas; verificar la integridad de los pesos tras la descarga.
- No se documentan sesgos demográficos (no aplica), pero sí posibles sesgos de dominio derivados del dataset de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/votenet.scannet.mmdet3d
- Paper VoteNet: https://arxiv.org/abs/1904.09664
- Paper ScanNet: https://arxiv.org/abs/1704.03847
- Repositorio `torch-pointcloud`: https://github.com/arthurdjn/pytorch-pointcloud
- MMDetection3D: https://github.com/open-mmlab/mmdetection3d
- DOI `torch-pointcloud`: https://doi.org/10.5281/zenodo.22159632
