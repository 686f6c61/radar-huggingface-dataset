# torch-pointcloud/pointgpt-l.modelnet40-8k.guangyan-chen

## Resumen

PointGPT-L (variante `pointgpt-l.modelnet40-8k.guangyan-chen`) es un modelo de clasificación de nubes de puntos 3D basado en la arquitectura PointGPT, un transformer con preentrenamiento generativo autorregresivo presentado en NeurIPS 2023. Lo publica el proyecto `torch-pointcloud` como conversión de los pesos originales del repositorio de referencia `CGuangyan-BIT/PointGPT`, empaquetados para su uso directo con la librería `torch-pointcloud`. El modelo resuelve la tarea de clasificación de formas 3D en 40 categorías sobre el conjunto de datos ModelNet40.

Con 360,4 millones de parámetros y una entrada de 8192 puntos (cada uno con posición y normal), se sitúa en la gama alta de los clasificadores de nubes de puntos. Su relevancia actual radica en que ofrece pesos preentrenados y afinados listos para usar en PyTorch con una API de una línea (`tp.create_model`), además de extracción de características de 2048 dimensiones para tareas downstream como recuperación de formas, segmentación o detección.

A diferencia de los modelos de lenguaje, no procesa texto ni mantiene conversaciones: es un modelo puramente geométrico. Su interés para desarrolladores e investigadores está en pipelines de visión 3D, robótica, CAD o conducción autónoma donde se necesita clasificar o embeber objetos representados como nubes de puntos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con preentrenamiento generativo autorregresivo (PointGPT) |
| Parámetros totales | 360.372.360 (360,4 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de 8192 puntos por muestra |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de nube de puntos, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,4 GB) |

Otros datos técnicos: 40 clases de salida, vector de características de 2048 dimensiones, entrada con claves `pos` (coordenadas) y `normal` (normales), librería `torch-pointcloud`.

## Arquitectura y entrenamiento

PointGPT aplica la idea del preentrenamiento generativo autorregresivo de los modelos de lenguaje al dominio de las nubes de puntos. El modelo divide la nube en parches y los ordena mediante un criterio geométrico, de modo que el transformer aprende a predecir parches sucesivos condicionados en los anteriores. Esto produce representaciones geométricas ricas que después se transfieren a tareas downstream mediante ajuste fino. La variante "L" corresponde al tamaño grande dentro de la familia PointGPT.

El modelo publicado es un ajuste fino (finetune) del checkpoint base `torch-pointcloud/pointgpt-l.labeled-hybrid.guangyan-chen`, entrenado para clasificación sobre ModelNet40 con 8192 puntos por muestra. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables en este dominio). La conversión de pesos desde el repositorio original a `torch-pointcloud` la realiza el proyecto de Arthur Dujardin.

## Capacidades

- Clasificación de nubes de puntos 3D en 40 categorías de ModelNet40 (silla, mesa, avión, coche, etc.).
- Extracción de características: `forward_features` devuelve embeddings de 2048 dimensiones por muestra.
- Uso como backbone congelado o ajustable para tareas downstream (clasificación con otro número de clases mediante `reset_classifier`).
- Procesamiento de muestras con posición y normales por punto (8192 puntos en la configuración publicada).
- Soporte de batches mediante la función `collate` de la librería.
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto.
- No dispone de capacidades multilingües, visión 2D, audio ni modo "thinking".

## Casos de uso

- Clasificación de objetos 3D en robótica: un robot equipado con LiDAR o cámara de profundidad puede segmentar la escena en objetos y usar el modelo para etiquetar cada nube de puntos en una de las 40 categorías de ModelNet40, aprovechando los 8192 puntos de entrada para geometrías detalladas.
- Recuperación de formas (shape retrieval): usando los embeddings de 2048 dimensiones de `forward_features`, se puede construir un índice vectorial de modelos CAD o escaneos y buscar formas geométricamente similares por similitud coseno.
- Preetiquetado en pipelines de anotación 3D: el modelo actúa como clasificador preliminar para reducir el trabajo manual en la anotación de datasets de nubes de puntos, con revisión humana posterior.
- Control de calidad en fabricación: clasificación automática de piezas escaneadas en 3D para verificar que corresponden a la categoría esperada antes de pasar a inspección dimensional.
- Base para ajuste fino en dominios específicos: al ser un checkpoint afinado sobre un backbone preentrenado, sirve como punto de partida para clasificadores con clases propias (por ejemplo, tipos de vegetación en datos LiDAR forestal) usando `reset_classifier`.
- Investigación en representación 3D: comparación de arquitecturas autorregresivas frente a alternativas (PointNet++, DGCNN, Point Transformer) usando el mismo protocolo de ModelNet40 y los pesos ya convertidos a PyTorch.
- Prototipado rápido en visión 3D: la API `tp.create_model(..., pretrained=True)` permite tener un clasificador funcional en pocas líneas, útil para validar ideas antes de invertir en entrenamiento propio.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Métrica | Valor |
|---|---|---|
| ModelNet40 | OA (overall accuracy) | 93,92 |
| ModelNet40 | mAcc (mean per-class accuracy) | 92,06 |

No se han publicado en la información disponible resultados de otros benchmarks (p. ej. ScanObjectNN, ShapeNet part segmentation) ni comparativas numéricas oficiales con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,5-2 GB para los pesos (1,4 GB de safetensors) más activaciones; con batches pequeños cabe holgadamente en GPUs de 4-6 GB.
- VRAM estimada en FP16: en torno a 0,8-1 GB para pesos, más activaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060/4060, RTX 4090, A100 o H100 funcionan sin problema. Para entrenamiento o ajuste fino se recomienda RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en todas las GPU modernas con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: PyTorch nativo con la librería `torch-pointcloud` (vía `pip install torch-pointcloud`); exportación a TorchScript u ONNX no documentada en la información disponible. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | ModelNet40 OA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PointGPT-L (este) | 360,4 M | 8192 puntos + normales | 93,92 | MIT | Hugging Face (`torch-pointcloud`) |
| PointGPT (original, CGuangyan-BIT) | no disponible en la información | no disponible | no disponible en la información | MIT | GitHub |
| Otras variantes PointGPT de la colección `torch-pointcloud` | no disponible en la información | no disponible | no disponible en la información | MIT | Hugging Face |

No se dispone en la información proporcionada de datos numéricos de PointNet++, DGCNN, Point Transformer u otros clasificadores de nubes de puntos para establecer una comparativa cuantitativa fiable. Se recomienda consultar el paper de PointGPT para las comparaciones publicadas por los autores.

## Limitaciones y advertencias

- Dominio restringido: solo clasifica nubes de puntos en las 40 clases de ModelNet40; no generaliza a categorías fuera de ese vocabulario sin reentrenamiento.
- ModelNet40 está compuesto por mallas CAD sintéticas; el rendimiento sobre escaneos reales (ruido, oclusiones, densidad variable) puede degradarse notablemente. No se han publicado resultados en la información disponible sobre datasets reales como ScanObjectNN.
- Dependencia de la entrada: espera exactamente la estructura de 8192 puntos con posición y normales; un preprocesado distinto (número de puntos, ausencia de normales, escala) puede alterar los resultados.
- Riesgo de sobreajuste al protocolo de evaluación: la métrica OA 93,92 no está verificada de forma independiente (`verified: false` en el model-index).
- Sin capacidades lingüísticas ni multimodales: no admite texto, imágenes 2D ni audio; no es un modelo de propósito general.
- Sesgos: no documentados en la información disponible; cabe esperar sesgos heredados de la distribución de clases de ModelNet40 (posible desequilibrio entre categorías).
- Licencia MIT: permite uso comercial y modificación, pero se recomienda citar el paper original y el software de conversión según indica la model card.
- Trazabilidad: es una conversión de terceros de los pesos originales; para producción conviene validar la equivalencia numérica con el repositorio de referencia.
- Repo de 1,4 GB y solo 25 descargas: ecosistema pequeño, poca comunidad y escaso soporte ante problemas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointgpt-l.modelnet40-8k.guangyan-chen
- Colección PointGPT en Hugging Face: https://huggingface.co/collections/torch-pointcloud/pointgpt
- Modelo base: https://huggingface.co/torch-pointcloud/pointgpt-l.labeled-hybrid.guangyan-chen
- Paper PointGPT (arXiv 2305.11487): https://arxiv.org/abs/2305.11487
- Repositorio original PointGPT: https://github.com/CGuangyan-BIT/PointGPT
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Dataset ModelNet40 (referencia, 3D ShapeNets): https://arxiv.org/abs/1406.5670
