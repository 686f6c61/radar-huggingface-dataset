# torch-pointcloud/pcp-mae.scanobjectnn-objonly.xiangdong-zhang

## Resumen

PCP-MAE (Point Cloud Prediction Masked Autoencoder) es un modelo de clasificación de nubes de puntos 3D desarrollado por Xiangdong Zhang, Shaofeng Zhang y Junchi Yan, presentado en NeurIPS 2024. Esta ficha concreta corresponde al checkpoint afinado sobre el subconjunto OBJ_ONLY del dataset ScanObjectNN, convertido al formato de la librería `torch-pointcloud` por el usuario `torch-pointcloud`. El modelo resuelve la tarea de clasificación de objetos 3D a partir de nubes de puntos, es decir, asignar una de 15 clases a una muestra de puntos 3D.

La innovación central de PCP-MAE frente a los masked autoencoders (MAE) convencionales para nubes de puntos es que, en lugar de reconstruir las coordenadas de los puntos enmascarados, el modelo predice los centros de las regiones enmascaradas. Esto reduce la ambigüedad del objetivo de reconstrucción y mejora la calidad de las representaciones aprendidas durante el preentrenamiento auto-supervisado.

Con 22,3 millones de parámetros y una dimensión de características de 768, es un modelo ligero orientado a investigación y despliegue en entornos con recursos limitados. Su relevancia actual radica en que ofrece un rendimiento competitivo en ScanObjectNN (94,32 % de accuracy global) con un coste computacional muy contenido, y está disponible con licencia MIT tanto en pesos como en código de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con masked point autoencoder (PCP-MAE); predicción de centros de regiones enmascaradas |
| Parametros totales | 22.341.263 (22,3 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de nube de puntos, ejemplo con 8192 puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico; opera sobre geometria 3D) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Clases de salida | 15 |
| Dimension de caracteristicas | 768 |
| Dataset de evaluacion | ScanObjectNN (OBJ_ONLY) |
| Libreria | torch-pointcloud |

## Arquitectura y entrenamiento

PCP-MAE se basa en un transformer con un esquema de masked point modeling. Durante el preentrenamiento auto-supervisado, se enmascaran regiones de la nube de puntos y el modelo aprende a predecir los centros de esas regiones en lugar de las coordenadas individuales de los puntos, lo que constituye la contribución principal del paper. Este objetivo de predicción de centros reduce la ambigüedad intrínseca de la reconstrucción punto a punto, donde múltiples configuraciones de puntos pueden explicar la misma región enmascarada.

El checkpoint aquí descrito parte del modelo preentrenado `torch-pointcloud/pcp-mae.pretrain.xiangdong-zhang` y se afina para clasificación sobre ScanObjectNN en su variante OBJ_ONLY, que contiene únicamente objetos sin el fondo de escena. La salida es un vector de 15 clases con una representación de 768 dimensiones. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset de preentrenamiento ni el uso de RLHF/DPO (no aplicable a esta tarea). La conversión a `torch-pointcloud` proviene del repositorio original `aHapBean/PCP-MAE` (MIT).

## Capacidades

- Clasificación de nubes de puntos 3D en 15 clases de objetos (tarea principal del checkpoint).
- Extracción de características: `forward_features` devuelve embeddings de 768 dimensiones por muestra, útiles para tareas downstream (retrieval, clustering, clasificación lineal).
- Adaptación a otros números de clases mediante `reset_classifier(num_classes=N)` para transferencia.
- Procesamiento de nubes de puntos de tamaño variable (el ejemplo de uso emplea 8192 puntos).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingües, de visión 2D, audio ni modo de razonamiento explícito.
- No se han documentado capacidades de segmentación, detección o generación de nubes de puntos en esta ficha.

## Casos de uso

- Clasificación de objetos 3D en robótica de manipulación: el modelo permite identificar la categoría de un objeto capturado por un sensor LiDAR o cámara de profundidad, con 22,3 M de parámetros que facilitan su ejecución en el borde junto al robot.
- Inspección industrial y control de calidad: clasificación de piezas escaneadas en 3D para detectar categorías o verificar que el objeto capturado corresponde al esperado, aprovechando la robustez del afinado sobre ScanObjectNN (datos reales con ruido).
- Preprocesamiento para pipelines de percepción: uso de `forward_features` para obtener embeddings de 768 dimensiones que alimenten clasificadores ligeros, sistemas de retrieval de objetos 3D o clustering no supervisado.
- Investigación en representación 3D: punto de partida para ablaciones y comparativas de masked point modeling, dado que el checkpoint y el código están disponibles con licencia MIT.
- Prototipado rápido en entornos con recursos limitados: al ser un modelo de 22,3 M de parámetros, cabe en GPUs de consumo y permite iterar sobre datasets propios con coste bajo.
- Transferencia a dominios específicos: reentrenamiento del clasificador (`reset_classifier`) sobre nubes de puntos de un dominio concreto (por ejemplo, escaneos médicos o piezas mecánicas) partiendo de las características preentrenadas.
- Educación y demostraciones: ejemplo mínimo de uso con `torch-pointcloud` que ilustra el flujo completo desde una muestra sintética hasta logits, útil para docencia en visión 3D.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| ScanObjectNN (OBJ_ONLY) | Clasificacion de nubes de puntos | OA (Overall Accuracy) | 94,32 |
| ScanObjectNN (OBJ_ONLY) | Clasificacion de nubes de puntos | mAcc (Mean Accuracy) | 94,06 |

No se han publicado en la información disponible resultados comparativos con otros modelos en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 22,3 M de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 89 MB, y en fp16 unos 45 MB. La memoria dominante será la de las activaciones de la nube de puntos de entrada.
- GPU recomendadas: cualquier GPU moderna es suficiente; para lotes grandes se recomienda A100, H100 o RTX 4090. Para inferencia individual basta una GPU de consumo.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2-4 GB de VRAM efectiva para lotes moderados (estimación orientativa; no confirmada en la información disponible).
- Opciones de despliegue: la librería `torch-pointcloud` (PyTorch) es la vía documentada. No se ha confirmado soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos comparables de la misma categoría para establecer una comparativa rigurosa. Se indica "no disponible".

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación de nubes de puntos; no es un modelo de lenguaje ni multimodal en el sentido habitual, por lo que no debe evaluarse con métricas de NLP.
- El checkpoint está afinado sobre ScanObjectNN OBJ_ONLY (objetos sin fondo); su rendimiento puede degradarse en escenas completas con fondo o en dominios muy distintos (escaneos médicos, LiDAR aéreo, etc.).
- Los resultados de benchmarks (OA 94,32, mAcc 94,06) están declarados por el autor y marcados como no verificados; deben tratarse con cautela.
- Riesgo de sobreajuste al dominio ScanObjectNN: la transferencia a otros datasets requiere validación empírica.
- No se han documentado sesgos específicos, pero al entrenarse sobre un dataset concreto de objetos escaneados, la cobertura de clases y la distribución geométrica estarán limitadas a ese corpus.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar la atribución al autor original y citar el paper y el repositorio.
- No se dispone de información sobre cuantizaciones soportadas, latencia en producción ni robustez frente a oclusiones o ruido severo.
- El identificador del modelo incluye el año 2026 en la fecha de creación del repo, lo que puede indicar una conversión reciente; conviene verificar la integridad de los pesos antes de usarlos en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/pcp-mae.scanobjectnn-objonly.xiangdong-zhang
- Modelo base preentrenado: https://huggingface.co/torch-pointcloud/pcp-mae.pretrain.xiangdong-zhang
- Paper PCP-MAE (arXiv): https://arxiv.org/abs/2408.08753
- Repositorio original del modelo: https://github.com/aHapBean/PCP-MAE
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de torch-pointcloud: https://doi.org/10.5281/zenodo.22159632
