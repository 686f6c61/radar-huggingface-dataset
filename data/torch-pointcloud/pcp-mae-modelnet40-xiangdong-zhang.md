# torch-pointcloud/pcp-mae.modelnet40.xiangdong-zhang

## Resumen

PCP-MAE (Point Cloud Prediction Masked Autoencoder) es un modelo de clasificación de nubes de puntos 3D desarrollado por Xiangdong Zhang, Shaofeng Zhang y Junchi Yan, publicado en NeurIPS 2024. Esta ficha concreta corresponde al checkpoint afinado sobre el dataset ModelNet40 y convertido al ecosistema `torch-pointcloud` por Arthur Dujardin. El modelo resuelve la tarea de clasificación de formas 3D a partir de nubes de puntos, asignando cada objeto a una de 40 categorías (silla, mesa, avión, etc.).

La innovación central de PCP-MAE es formular el preentrenamiento autoencoder enmascarado no como reconstrucción de las coordenadas de los puntos enmascarados, sino como predicción de sus centros (centroides de parches). Esto reduce la ambigüedad del objetivo de reconstrucción y mejora la calidad de las representaciones aprendidas. El modelo tiene 22,3 millones de parámetros, una dimensión de característica de 768 y se distribuye en formato safetensors con licencia MIT.

Es relevante para desarrolladores e investigadores que necesitan un clasificador de nubes de puntos ligero, con licencia permisiva y resultados sólidos en el benchmark estándar ModelNet40 (93,52 % de accuracy global), sin depender de infraestructura propietaria ni de modelos de gran tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con autoencoder enmascarado (masked point autoencoder, predicción de centros de parche) |
| Parametros totales | 22.347.688 (22,3 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de nube de puntos, ejemplo con 8192 puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico; opera sobre geometría 3D) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de caracteristica | 768 |
| Numero de clases | 40 |
| Libreria | torch-pointcloud |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

PCP-MAE es un transformer de tipo masked autoencoder adaptado a nubes de puntos. La entrada consiste en puntos 3D con sus normales (`pos` y `normal`), que se agrupan en parches y se enmascaran parcialmente. A diferencia de los MAE clásicos de imágenes o de nubes de puntos que reconstruyen coordenadas, PCP-MAE entrena al modelo para predecir los centros (centroides) de los parches enmascarados, un objetivo más estable y menos ambiguo. El encoder produce una representación global de 768 dimensiones que alimenta una cabeza de clasificación de 40 clases.

El checkpoint aquí descrito parte del modelo preentrenado `torch-pointcloud/pcp-mae.pretrain.xiangdong-zhang` y se afina sobre ModelNet40, un dataset de referencia de formas 3D con 40 categorías. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición detallada del dataset de preentrenamiento ni si se aplicaron etapas de RLHF o DPO (no aplicables en un modelo de visión 3D). La conversión a `torch-pointcloud` la realizó Arthur Dujardin a partir del repositorio original `aHapBean/PCP-MAE` (MIT).

## Capacidades

- Clasificación de nubes de puntos 3D en 40 categorías de ModelNet40.
- Extracción de características globales de 768 dimensiones mediante `forward_features` o `reset_classifier(num_classes=0)`.
- Procesamiento de nubes de puntos con coordenadas y normales; el ejemplo de la model card usa 8192 puntos por muestra.
- Soporte de inferencia por lotes mediante `collate` de `torch-pointcloud`.
- No soporta tool calling, function calling ni agentes: es un modelo puramente perceptivo de visión 3D.
- No dispone de capacidades multilingües, de generación de texto, de código ni de matemáticas.
- No dispone de modo thinking, visión 2D, audio ni otras modalidades.

## Casos de uso

- Clasificación de objetos 3D en pipelines de escaneo: dado un escaneo LiDAR o de profundidad convertido a nube de puntos, el modelo asigna una de las 40 categorías de ModelNet40, útil para inventariado automático de objetos en interiores.
- Preprocesado en robótica de manipulación: clasificar la forma del objeto antes de planificar una prensión, usando las 768 dimensiones de características como entrada a un planificador posterior.
- Etiquetado asistido de datasets 3D: el modelo puede preetiquetar nubes de puntos y reducir el coste de anotación manual, con revisión humana posterior.
- Extracción de embeddings para búsqueda de formas: usar `forward_features` para indexar objetos 3D y recuperar formas similares por similitud vectorial.
- Baseline de investigación en visión 3D: punto de partida reproducible (MIT, 22,3 M de parámetros) para comparar nuevas arquitecturas de autoencoders enmascarados sobre ModelNet40.
- Filtrado de calidad en digitalización 3D: clasificar objetos capturados por escáneres para descartar capturas fuera de las categorías esperadas antes de almacenarlas.
- Módulo de percepción en prototipos de realidad aumentada: identificar el tipo de objeto físico que el usuario enfoca para superponer información contextual.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| ModelNet40 | point-cloud-classification | OA (accuracy global) | 93,52 |
| ModelNet40 | point-cloud-classification | mAcc (accuracy media por clase) | 90,5 |

No se han publicado en la información disponible resultados adicionales (por ejemplo, en ScanObjectNN, ShapeNet o tareas de segmentación) ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 22,3 M de parámetros en fp32 el peso ocupa aproximadamente 90 MB, y con un lote pequeño de 8192 puntos la inferencia cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4090, A100, H100 y también en CPU para inferencia puntual.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: PyTorch nativo mediante `torch-pointcloud` (`tp.create_model`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por muestra en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados numéricos de modelos alternativos comparables (por ejemplo, Point-MAE, PointNet++ o Point Transformer afinados en ModelNet40), por lo que la comparación cuantitativa se marca como no disponible. A nivel cualitativo:

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| PCP-MAE (este) | 22,3 M | nube de puntos (ej. 8192 puntos) | MIT | Hugging Face, torch-pointcloud |
| Alternativas de la familia MAE de nubes de puntos | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre ModelNet40, un dataset de formas 3D sintéticas y limpias; su rendimiento en escaneos reales con ruido, oclusiones o densidades distintas puede degradarse de forma significativa.
- Solo clasifica en 40 categorías; cualquier objeto fuera de ese vocabulario se asignará a la clase más parecida, con riesgo de error.
- Los resultados de 93,52 % OA y 90,5 % mAcc son declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- No hay información publicada sobre sesgos del dataset (por ejemplo, desbalance entre clases o sobrerrepresentación de ciertas categorías), aunque mAcc inferior a OA sugiere cierto desbalance de rendimiento entre clases.
- No aplica el riesgo de alucinación lingüística, pero sí el de clasificaciones erróneas con alta confianza en entradas fuera de distribución.
- La licencia MIT permite uso comercial y modificación; conviene conservar el aviso de copyright y citar el paper original.
- No se documentan cuantizaciones oficiales ni formatos alternativos a safetensors; para despliegue en CPU o edge habría que exportar el modelo uno mismo.
- El modelo no procesa texto ni lenguaje natural; no debe emplearse en tareas de NLP.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/pcp-mae.modelnet40.xiangdong-zhang
- Modelo base (preentrenamiento): https://huggingface.co/torch-pointcloud/pcp-mae.pretrain.xiangdong-zhang
- Paper PCP-MAE (arXiv): https://arxiv.org/abs/2408.08753
- Repositorio original: https://github.com/aHapBean/PCP-MAE
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Dataset ModelNet40 (referencia, 3D ShapeNets): https://modelnet.cs.princeton.edu/
