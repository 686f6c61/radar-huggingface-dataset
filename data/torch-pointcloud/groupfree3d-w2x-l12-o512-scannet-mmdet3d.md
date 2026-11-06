# torch-pointcloud/groupfree3d-w2x-l12-o512.scannet.mmdet3d

## Resumen

Group-Free 3D es un detector de objetos 3D para nubes de puntos de interiores, publicado originalmente por investigadores de Microsoft Research Asia en ICCV 2021. Este checkpoint concreto, `groupfree3d-w2x-l12-o512.scannet.mmdet3d`, es una conversión de los pesos de MMDetection3D al formato de la librería `torch-pointcloud`, mantenida por Arthur Dujardin, y está entrenado sobre el dataset ScanNet para 18 clases de objetos de interior.

A diferencia de aproximaciones anteriores basadas en agrupar puntos (point grouping) con heurísticas de clustering, Group-Free 3D formula la detección como un problema de predicción directa de cajas a partir de un conjunto de candidatos (semillas) mediante un transformer encoder-decoder. El modelo usa 288 canales de características, 512 candidatos de objeto y 12 capas de decoder, lo que se refleja en la nomenclatura `w2x-l12-o512`.

Con 29,6 millones de parámetros y un tamaño de repositorio de 0,1 GB, es un modelo ligero y desplegable en GPUs de consumo, orientado a tareas de percepción 3D en robótica, realidad aumentada y digitalización de interiores. Su relevancia actual radica en que ofrece una implementación limpia en PyTorch con pesos en safetensors, fácil de integrar en pipelines de investigación sin depender del ecosistema completo de MMDetection3D.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Group-Free 3D (transformer encoder-decoder sobre candidatos de objeto) |
| Parámetros totales | 29.597.377 (29,6 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre nubes de puntos de 8192 puntos en el ejemplo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica, modelo de visión 3D) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de características | 288 |
| Candidatos de objeto | 512 |
| Capas del decoder | 12 |
| Clases | 18 |
| Dataset de entrenamiento | ScanNet |
| Librería | torch-pointcloud |
| Tarea | object-detection (3D object detection) |

## Arquitectura y entrenamiento

Group-Free 3D sustituye el agrupamiento geométrico clásico por un transformer que procesa un conjunto de K candidatos de objeto (en este checkpoint, 512) generados a partir de las features de la nube de puntos. Cada candidato se refina iterativamente mediante capas de self-attention y cross-attention que permiten a los candidatos intercambiar información, evitando la dependencia de un clustering previo y capturando relaciones globales entre objetos. El backbone extrae features de 288 canales que alimentan el decoder de 12 capas; la salida son cajas 3D con clase y puntuación de confianza para 18 categorías de ScanNet.

El entrenamiento se realizó sobre ScanNet, un dataset de reconstrucciones 3D de interiores con anotaciones semánticas e instancias. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un detector 3D). El checkpoint es una conversión directa desde MMDetection3D, por lo que la arquitectura y los pesos siguen la implementación de referencia del paper original de Liu et al. (2021). La innovación principal es precisamente la eliminación del agrupamiento manual en favor de atención entre candidatos, lo que simplifica el pipeline y mejora la precisión en escenas con objetos próximos.

## Capacidades

- Detección de objetos 3D en nubes de puntos de interiores: predice cajas 3D con clase y confianza para 18 categorías de ScanNet (sillas, mesas, sofás, camas, etc.).
- Procesamiento de nubes de puntos con posición (xyz), color y normales como entrada.
- Extracción de features de 288 canales mediante `forward_features`, útil para tareas downstream como segmentación o clasificación.
- Inferencia batch mediante la utilidad `collate` de `torch-pointcloud`.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso en el sentido de LLM.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión 2D, audio ni generación de texto.

## Casos de uso

- Digitalización de interiores: el modelo detecta y localiza muebles y objetos en reconstrucciones 3D de habitaciones, permitiendo generar inventarios automáticos o planos amueblados a partir de escaneos con sensores RGB-D o LiDAR.
- Robótica de manipulación: un brazo robótico puede usar las cajas 3D predichas para localizar objetos sobre una mesa y planificar agarres, aprovechando que el modelo trabaja directamente sobre nubes de puntos sin necesidad de proyecciones 2D.
- Realidad aumentada: inserción de objetos virtuales anclados a superficies reales requiere conocer la posición y orientación de muebles; Group-Free 3D proporciona esas cajas 3D en tiempo de ejecución.
- Navegación asistida: un agente móvil en interiores puede emplear las detecciones para evitar obstáculos y reconocer elementos del entorno (puertas, sillas, mesas) a partir de su nube de puntos.
- Anotación semiautomática de datasets 3D: las predicciones del modelo pueden servir como preanotaciones para acelerar el etiquetado humano de nuevas escenas de interior, reduciendo el coste de construir datasets propietarios.
- Investigación en percepción 3D: al ser una conversión limpia de MMDetection3D a `torch-pointcloud`, sirve como baseline reproducible para comparar nuevas arquitecturas de detección 3D sin depender del stack completo de OpenMMLab.
- Extracción de features para tareas downstream: `forward_features` devuelve representaciones de 288 canales que pueden alimentar clasificadores o segmentadores ligeros en pipelines de investigación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| ScanNet | mAP@0.25 | 68,32 |
| ScanNet | mAP@0.5 | 51,00 |

No se han publicado en la información disponible resultados adicionales (por ejemplo, mAP@0.5 en clases por categoría, latencia o throughput) ni comparaciones directas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 29,6 M de parámetros, los pesos en FP32 ocupan aproximadamente 118 MB; con overhead de activaciones para 8192 puntos y 512 candidatos, la inferencia cabe holgadamente en GPUs con 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB, como RTX 3060, RTX 4060, RTX 4090, A100 o H100. Para entrenamiento o fine-tuning se recomienda al menos 8-12 GB.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas consumer actuales (GTX 1660, RTX 2060 en adelante).
- Opciones de despliegue: la librería `torch-pointcloud` sobre PyTorch es la vía oficial. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un detector 3D).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | mAP@0.25 (ScanNet) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| groupfree3d-w2x-l12-o512.scannet.mmdet3d | 29,6 M | nube de puntos (8192 puntos en ejemplo) | 68,32 | Apache-2.0 | Hugging Face (torch-pointcloud) |
| Group-Free 3D original (MMDetection3D) | ~29,6 M (misma arquitectura) | nube de puntos | 68,32 (referencia del paper) | Apache-2.0 | GitHub OpenMMLab |
| VoteNet | no disponible en la información | nube de puntos | no disponible en la información | Apache-2.0 (MMDetection3D) | GitHub OpenMMLab |
| FCAF3D | no disponible en la información | nube de puntos | no disponible en la información | Apache-2.0 (MMDetection3D) | GitHub OpenMMLab |

La comparación con VoteNet y FCAF3D se incluye por ser alternativas habituales en detección 3D de interiores sobre ScanNet, pero no se dispone de sus métricas en la información proporcionada, por lo que no se ofrece una comparación numérica directa.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre ScanNet, por lo que su generalización a otros dominios (exteriores, escenas industriales, sensores distintos) no está garantizada.
- Las 18 clases están fijadas por ScanNet; no detecta categorías fuera de ese vocabulario.
- Riesgo de alucinación en el sentido de falsos positivos: puede predecir cajas con alta confianza sobre regiones sin objeto, especialmente en escenas con oclusiones o ruido en la nube de puntos.
- No se documentan sesgos específicos, pero al derivar de un dataset de interiores predominantemente occidental, el rendimiento puede degradarse en tipologías de vivienda no representadas.
- La licencia Apache-2.0 permite uso comercial, pero el dataset ScanNet tiene sus propias condiciones de uso que deben respetarse si se redistribuyen datos derivados.
- La model card no documenta cuantizaciones ni optimizaciones de despliegue; el rendimiento en producción dependerá de la implementación en PyTorch.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`).
- El checkpoint se creó en 2026 según los metadatos; conviene verificar compatibilidad con versiones recientes de `torch-pointcloud` y PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/groupfree3d-w2x-l12-o512.scannet.mmdet3d
- Paper Group-Free 3D: https://arxiv.org/abs/2104.00678
- Repositorio torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Repositorio MMDetection3D (origen de la conversión): https://github.com/open-mmlab/mmdetection3d
- Dataset ScanNet: https://github.com/ScanNet/ScanNet
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
