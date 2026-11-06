# torch-pointcloud/groupfree3d-l6-o256.scannet.mmdet3d

## Resumen

Group-Free 3D es un detector de objetos 3D para nubes de puntos desarrollado originalmente por investigadores de Microsoft Research Asia (Ze Liu, Zheng Zhang, Yue Cao, Han Hu y Xin Tong) y publicado en ICCV 2021. Esta ficha corresponde a la conversión del modelo original de MMDetection3D al ecosistema `torch-pointcloud`, empaquetada por el autor Arthur Dujardin. El modelo resuelve la detección de objetos 3D en interiores: dado un conjunto de puntos con coordenadas, color y normales, predice cajas 3D etiquetadas con 18 clases semánticas de ScanNet.

La innovación principal del trabajo original es sustituir los mecanismos habituales de votación o agrupamiento de propuestas por un transformer que razona directamente sobre un conjunto de candidatos a objeto muestreados, sin depender de anclas ni de clústeres geométricos. Esta variante concreta (`l6-o256`) usa 6 capas de decoder y 256 candidatos por escena, con 14,5 millones de parámetros y 288 canales de características.

Es relevante para desarrolladores que necesitan un detector 3D ligero, con licencia Apache-2.0 y pesos en safetensors, integrable en pipelines de PyTorch sin depender del stack completo de MMDetection3D. El modelo está entrenado exclusivamente sobre ScanNet, por lo que su dominio es la reconstrucción de interiores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sobre candidatos a objeto (Group-Free 3D), backbone de extracción de puntos + decoder de 6 capas |
| Parametros totales | 14.495.937 (14,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa nubes de puntos de 8.192 puntos en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors en precision original) |
| Idiomas soportados | no disponible (modelo de vision 3D, sin entrada de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `torch-pointcloud`) |
| Clases | 18 (ScanNet) |
| Canales de caracteristicas | 288 |
| Candidatos por escena | 256 |
| Capas del decoder | 6 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Group-Free 3D: un backbone que extrae características por punto (288 canales) y un decoder transformer de 6 capas que refina iterativamente un conjunto de 256 candidatos a objeto. A diferencia de enfoques como VoteNet, no hay votación de centros ni agrupamiento espacial: cada candidato es un query aprendido que atiende a las características de los puntos mediante self-attention y cross-attention, y en cada capa se predicen clase y caja 3D. El modelo devuelve también `forward_features`, útil para reutilizar el extractor de características de 288 canales en tareas posteriores.

El entrenamiento se realizó sobre ScanNet, el dataset de reconstrucciones 3D de interiores con anotaciones densas de Dai et al. (CVPR 2017), con 18 clases de objetos. La model card no detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de refinamiento adicionales; esos datos deben consultarse en el paper original (arXiv:2104.00678). Esta versión es una conversión de los pesos oficiales de MMDetection3D, no un reentrenamiento.

## Capacidades

- Detección de objetos 3D en nubes de puntos de interiores: devuelve cajas 3D con clase, centro, dimensiones y orientación para 18 categorías de ScanNet.
- Entrada multimodal por punto: coordenadas (`pos`), color RGB (`color`) y normales (`normal`), más etiquetas de segmento e instancia opcionales en el pipeline de datos.
- Extracción de características: `forward_features` produce un tensor de 288 canales por punto, reutilizable para segmentación, clasificación o recuperación.
- Procesamiento por lotes: el ejemplo de uso emplea `collate` para agrupar varias escenas con índices de batch.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo generativo de lenguaje.
- No tiene capacidades multilingües ni modo de pensamiento: la salida es puramente geométrica.
- Inferencia determinista con `model.eval()` y `torch.no_grad()`.

## Casos de uso

- Digitalización de interiores: procesar reconstrucciones de escaneo (por ejemplo, con un escáner móvil o un dron de interior) para inventariar sillas, mesas, puertas y sanitarios automáticamente; el modelo está entrenado en el mismo dominio que ScanNet.
- Robótica de navegación indoor: alimentar el detector con la nube de puntos de una cámara de profundidad para que un robot móvil identifique obstáculos y objetos manipulables antes de planificar la trayectoria.
- Realidad aumentada: anclar contenido virtual a objetos físicos detectados en la escena, aprovechando las cajas 3D y la orientación que devuelve el modelo.
- Análisis de inventario en retail y logística: contar y localizar productos o cajas sobre estanterías a partir de escaneos 3D del almacén, con la limitación de que las clases deben mapearse a las 18 de ScanNet.
- Etiquetado asistido de datos 3D: usar las predicciones como preanotaciones para acelerar el etiquetado humano de nuevas nubes de puntos, revisando después las cajas de baja confianza.
- Extracción de características para tareas downstream: reutilizar `forward_features` (288 canales) como entrada de un cabezal propio de segmentación semántica o de clasificación de escenas.
- Investigación en detección 3D: servir como baseline reproducible y ligero (14,5 M de parámetros) para comparar arquitecturas transformer frente a enfoques de votación.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados por un tercero):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| ScanNet | 3d-object-detection | mAP@0.25 | 65,92 |
| ScanNet | 3d-object-detection | mAP@0.5 | 47,59 |

No se han publicado en la informacion disponible resultados comparativos adicionales (por ejemplo, frente a VoteNet o el Group-Free original en otras configuraciones).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 14,5 M de parámetros (unos 58 MB en fp32), por lo que cabe holgadamente en cualquier GPU con 4 GB o más; el cuello de botella es la nube de puntos (8.192 puntos por escena en el ejemplo), no los pesos.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA, desde una GTX 1650 hasta una A100 o H100; para lotes grandes de escenas conviene una RTX 3090, RTX 4090, A10, L4 o superior.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 4 GB de VRAM; también puede ejecutarse en CPU para pruebas puntuales.
- Opciones de despliegue: la librería `torch-pointcloud` (`pip install torch-pointcloud`) con PyTorch nativo; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un transformer con 256 candidatos y 6 capas sobre 8.192 puntos, se espera una latencia de milisegundos por escena en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP@0.25 ScanNet | mAP@0.5 ScanNet | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| groupfree3d-l6-o256 (esta ficha) | 14,5 M | 8.192 puntos (ejemplo) | 65,92 | 47,59 | Apache-2.0 | Hugging Face (`torch-pointcloud`) |
| Group-Free 3D original (MMDetection3D) | no disponible en la informacion | nube de puntos completa | no disponible en la informacion | no disponible en la informacion | Apache-2.0 | GitHub open-mmlab |
| VoteNet | no disponible en la informacion | nube de puntos completa | no disponible en la informacion | no disponible en la informacion | licencia del repositorio original | MMDetection3D |
| Otros detectores 3D de `torch-pointcloud` | no disponible en la informacion | nube de puntos | no disponible en la informacion | no disponible en la informacion | Apache-2.0 | Hugging Face |

La comparación cuantitativa con alternativas no puede completarse con la informacion disponible; los valores de mAP de esta ficha son los únicos declarados por el autor.

## Limitaciones y advertencias

- Dominio restringido: entrenado solo en ScanNet (interiores de habitaciones), por lo que el rendimiento fuera de ese dominio (exteriores, industria, vehículos) no está garantizado.
- Catálogo cerrado de 18 clases: no detecta categorías fuera de las definidas en ScanNet; requiere remapeo si se usa en otro inventario.
- Métricas no verificadas: los valores de mAP del model-index están marcados como `verified: false`; conviene reproducirlos antes de usarlos en producción.
- Sesgos de dataset: ScanNet contiene escenas de un conjunto limitado de edificios y regiones geográficas, lo que puede sesgar la detección hacia layouts y mobiliario sobrerrepresentados.
- Riesgo de falsos positivos y cajas mal ajustadas en escenas con oclusión, objetos pequeños o nubes de puntos ruidosas; se recomienda umbral de confianza y filtrado no máximo.
- Sin soporte de texto ni de instrucciones: no puede usarse como modelo conversacional ni como agente.
- Licencia Apache-2.0: permite uso comercial y modificación, pero exige conservar el aviso de licencia y la atribución; verificar también las licencias del paper, de MMDetection3D y de ScanNet para los datos.
- Repositorio pequeño (0,1 GB) y pocas descargas (16): menor comunidad y soporte que modelos más populares; la API depende de la librería `torch-pointcloud` y de su compatibilidad con la versión de PyTorch instalada.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/groupfree3d-l6-o256.scannet.mmdet3d
- Paper Group-Free 3D: https://arxiv.org/abs/2104.00678
- Repositorio `torch-pointcloud`: https://github.com/arthurdjn/pytorch-pointcloud
- MMDetection3D (origen de los pesos): https://github.com/open-mmlab/mmdetection3d
- Dataset ScanNet: https://github.com/ScanNet/ScanNet
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
