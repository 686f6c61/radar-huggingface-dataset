# torch-pointcloud/act.scanobjectnn-objonly.runpei-dong

## Resumen

ACT (Autoencoder as Cross-Modal Teacher) es un modelo de clasificación de nubes de puntos 3D desarrollado por Runpei Dong y colaboradores en el marco del paper presentado en ICLR 2023. La variante aquí descrita, `act.scanobjectnn-objonly.runpei-dong`, es un checkpoint afinado para clasificación de objetos 3D sobre el subconjunto OBJ_ONLY del dataset ScanObjectNN, con 15 clases de salida y 22,1 millones de parámetros. La idea central del trabajo es destilar representaciones de un transformer de imágenes 2D preentrenado (MAE) hacia un transformer de puntos 3D mediante un esquema de autoencoder enmascarado, lo que permite transferir conocimiento visual 2D al dominio 3D sin necesidad de grandes volúmenes de datos anotados en 3D.

Este checkpoint concreto no es un modelo generativo ni un LLM: es un extractor y clasificador de nubes de puntos que recibe coordenadas 3D (típicamente 8192 puntos por muestra) y produce logits sobre 15 categorías de objetos cotidianos. Su relevancia radica en que demuestra que el preentrenamiento cruzado entre modalidades (2D a 3D) funciona para tareas de reconocimiento de objetos en escenas reales escaneadas, y en que se distribuye empaquetado para la librería `torch-pointcloud`, lo que facilita su uso directo en pipelines de PyTorch.

El modelo se publica bajo licencia MIT, con pesos en formato safetensors y un tamaño de repositorio de 0,1 GB, lo que lo hace ligero y apto para experimentación en hardware modesto. Está pensado para investigadores y desarrolladores que trabajan en visión 3D, robótica, realidad aumentada o conducción autónoma y necesitan un clasificador de objetos 3D preentrenado y fácilmente integrable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de puntos con autoencoder enmascarado (ACT), destilado de un transformer de imágenes 2D (MAE) |
| Parametros totales | 22.095.631 (22,1 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; opera sobre nubes de puntos de 8192 puntos por muestra en el ejemplo de uso) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de caracteristicas | 768 |
| Clases de salida | 15 |
| Dataset de evaluacion | ScanObjectNN (OBJ_ONLY) |
| Libreria | torch-pointcloud |
| Modelo base | torch-pointcloud/act.pretrain.runpei-dong |

## Arquitectura y entrenamiento

ACT se basa en un transformer de nubes de puntos que se entrena mediante un esquema de autoencoder enmascarado (masked point modeling). La innovación principal del trabajo es el uso de un autoencoder de imágenes 2D preentrenado (tipo MAE) como "profesor" cross-modal: las representaciones latentes del transformer 2D se utilizan para guiar el aprendizaje del transformer 3D, de modo que el modelo de puntos aprende a alinear su espacio de representación con el de un modelo visual 2D ya entrenado a gran escala. Este proceso de destilación cross-modal permite aprovechar el conocimiento visual 2D para mejorar la representación 3D sin requerir un preentrenamiento 3D masivo.

El checkpoint aquí descrito parte del modelo preentrenado `torch-pointcloud/act.pretrain.runpei-dong` y se afina para clasificación sobre ScanObjectNN en su variante OBJ_ONLY, que contiene objetos escaneados en entornos reales con ruido y oclusiones. La arquitectura produce un vector de características de 768 dimensiones por nube de puntos, sobre el que se aplica una cabeza de clasificación de 15 clases. No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset de preentrenamiento ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio). El modelo fue convertido desde el repositorio original `RunpeiDong/ACT` (MIT) al formato de la librería `torch-pointcloud`.

## Capacidades

- Clasificación de nubes de puntos 3D en 15 categorías de objetos (dataset ScanObjectNN OBJ_ONLY).
- Extracción de características (embeddings) de 768 dimensiones por nube de puntos mediante `forward_features`.
- Soporte para clasificación con número de clases configurable mediante `reset_classifier` (incluido `num_classes=0` para obtener solo embeddings).
- Procesamiento por lotes (batching) de nubes de puntos con collate específico de la librería.
- Integración nativa con PyTorch y la librería `torch-pointcloud`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingües, visión 2D directa, audio ni modo "thinking".
- Capacidad de transferencia: al ser un modelo preentrenado con destilación cross-modal, puede servir como base para fine-tuning en otras tareas de visión 3D.

## Casos de uso

- Clasificación de objetos en escenas escaneadas: el modelo recibe nubes de puntos de 8192 puntos y devuelve la categoría del objeto, adecuado para pipelines de reconocimiento en escenas reales con ruido, gracias a su entrenamiento sobre ScanObjectNN OBJ_ONLY.
- Preprocesamiento en robótica móvil: un robot equipado con LiDAR o cámara de profundidad puede usar el modelo para identificar objetos del entorno (sillas, mesas, etc.) antes de tareas de manipulación o navegación.
- Extracción de embeddings para búsqueda y recuperación 3D: usando `forward_features` o `reset_classifier(num_classes=0)`, se obtienen vectores de 768 dimensiones que pueden indexarse en bases vectoriales para búsqueda de objetos 3D similares.
- Base para fine-tuning en dominios específicos: al ser un checkpoint preentrenado y ligero (22,1 M de parámetros), es adecuado como inicialización para clasificación en datasets propios de visión 3D industrial o médico.
- Realidad aumentada: clasificación en tiempo real de objetos detectados por sensores de profundidad para superponer información contextual.
- Conducción autónoma y percepción 3D: clasificación de objetos detectados por LiDAR en el entorno del vehículo, como parte de un pipeline de percepción más amplio.
- Investigación en aprendizaje cross-modal: el modelo sirve como referencia reproducible para estudiar la transferencia de conocimiento 2D a 3D, con pesos y métricas públicas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Metrica | Valor |
|---|---|---|
| ScanObjectNN (OBJ_ONLY) | OA (Overall Accuracy) | 91,22 |
| ScanObjectNN (OBJ_ONLY) | mAcc (Mean Accuracy) | 90,26 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 22,1 M de parámetros en fp32 el modelo ocupa aproximadamente 88 MB de pesos, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna es suficiente; para lotes grandes se recomienda RTX 3060/4090, A100 o H100, aunque el modelo no las requiere.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: PyTorch nativo con la librería `torch-pointcloud`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada; al tratarse de un transformer de 22 M de parámetros sobre 8192 puntos, la latencia por muestra es del orden de milisegundos en GPU moderna, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de benchmarks de modelos alternativos de clasificación de nubes de puntos sobre ScanObjectNN (OBJ_ONLY), por lo que no es posible establecer una comparativa rigurosa sin inventar datos.

## Limitaciones y advertencias

- El modelo está especializado en clasificación de 15 clases del dataset ScanObjectNN OBJ_ONLY; no generaliza a categorías fuera de ese conjunto sin reentrenamiento o fine-tuning.
- Al operar sobre nubes de puntos escaneadas, puede verse afectado por ruido, oclusiones y variaciones de densidad propios de sensores reales.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- Los resultados de benchmarks (OA 91,22; mAcc 90,26) están declarados por el autor y marcados como no verificados; deben tomarse con cautela.
- No se documentan sesgos específicos, pero al entrenarse sobre un dataset concreto puede heredar los sesgos de composición y captura de ScanObjectNN.
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí existe riesgo de clasificaciones erróneas con alta confianza en objetos ambiguos o mal segmentados.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda citar el paper y el repositorio original según las buenas prácticas académicas.
- No se dispone de información sobre cuantizaciones soportadas ni sobre rendimiento en hardware específico; para producción conviene validar latencia y precisión en el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/act.scanobjectnn-objonly.runpei-dong
- Modelo base preentrenado: https://huggingface.co/torch-pointcloud/act.pretrain.runpei-dong
- Paper (arXiv): https://arxiv.org/abs/2212.08320
- Repositorio original ACT: https://github.com/RunpeiDong/ACT
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la librería: https://doi.org/10.5281/zenodo.22159632
