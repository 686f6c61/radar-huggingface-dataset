# torch-pointcloud/pointgpt-l.modelnet40.guangyan-chen

## Resumen

PointGPT-L es un modelo de clasificación de nubes de puntos 3D basado en la arquitectura PointGPT, un transformer con preentrenamiento generativo autorregresivo. Lo desarrolla Guangyan Chen y colaboradores (Universidad de Pekín / BIT) y esta versión concreta ha sido convertida y publicada por el proyecto torch-pointcloud (Arthur Dujardin) como un checkpoint afinado sobre el dataset ModelNet40 para la tarea de clasificación de formas 3D en 40 categorías.

El modelo resuelve el problema de clasificación de objetos 3D representados como nubes de puntos sin estructura de rejilla, aprovechando el preentrenamiento autorregresivo sobre parches de puntos para aprender representaciones geométricas transferibles. Con 360,4 millones de parámetros y 2048 características de embedding, se sitúa en la gama alta de los modelos PointGPT y reporta un 93,88 % de exactitud global (OA) y un 92,05 % de exactitud media por clase (mAcc) sobre ModelNet40.

Es relevante para desarrolladores que trabajan en visión 3D, robótica, conducción autónoma o modelado industrial, porque ofrece un checkpoint listo para usar mediante la librería `torch-pointcloud` con licencia MIT, tanto para inferencia de clasificación como para extracción de características (embeddings de 2048 dimensiones) que pueden alimentar otros pipelines.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer PointGPT con preentrenamiento generativo autorregresivo sobre parches de puntos |
| Parametros totales | 360.372.360 (360,4 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre nubes de puntos; ejemplo de la model card con 8192 puntos de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Clases de salida | 40 (ModelNet40) |
| Dimension de caracteristicas | 2048 |
| Libreria | torch-pointcloud |
| Modelo base | torch-pointcloud/pointgpt-l.labeled-hybrid.guangyan-chen |
| Tamano del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

PointGPT es un transformer diseñado para nubes de puntos que aplica la filosofía de los modelos GPT al dominio 3D: divide la nube en parches locales y los procesa de forma autorregresiva, prediciendo parches a partir de los anteriores. Este preentrenamiento generativo permite aprender representaciones geométricas ricas sin necesidad de etiquetas, que después se transfieren a tareas downstream como clasificación, segmentación o detección. El checkpoint aquí descrito parte del modelo base `pointgpt-l.labeled-hybrid.guangyan-chen` y se ha afinado sobre ModelNet40 para la tarea de clasificación en 40 clases.

Los detalles concretos sobre el número de tokens de entrenamiento, la composición exacta del dataset de preentrenamiento y el uso de RLHF/DPO no están disponibles en la información proporcionada. La model card indica que el modelo se convirtió desde el repositorio oficial `CGuangyan-BIT/PointGPT` (licencia MIT) al formato de la librería `torch-pointcloud`, que gestiona las transformaciones de datos, el collate y la API de creación del modelo.

## Capacidades

- Clasificación de nubes de puntos 3D en 40 categorías de objetos (ModelNet40).
- Extracción de características: `forward_features` devuelve embeddings de 2048 dimensiones por muestra, útiles para tareas downstream.
- Capacidad de reiniciar el clasificador (`reset_classifier(num_classes=0)`) para usar el modelo como extractor puro de representaciones.
- Procesamiento de nubes de puntos con coordenadas (`pos`) y normales (`normal`) como entradas.
- Manejo de batching mediante la función `collate` de `torch_pointcloud.utils.data`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente perceptivo 3D.
- No dispone de modo thinking, visión 2D, audio ni generación de texto.

## Casos de uso

- Clasificación de objetos 3D en robótica: integrado en el pipeline de percepción de un robot móvil o brazo manipulador, el modelo recibe la nube de puntos captada por un sensor LiDAR o RGB-D y devuelve la categoría del objeto para decidir la acción de agarre o navegación.
- Inventario y control de calidad industrial: clasificación automática de piezas fabricadas a partir de escaneos 3D, comparando la categoría predicha con la esperada para detectar piezas mal colocadas o defectuosas.
- Extracción de embeddings para búsqueda de formas 3D: usar `forward_features` para generar vectores de 2048 dimensiones y construir un índice de similitud que permita recuperar modelos 3D parecidos en un catálogo.
- Preentrenamiento base para tareas downstream: el checkpoint puede servir como inicialización para fine-tuning en segmentación semántica o detección de objetos 3D con datasets propios, aprovechando las representaciones geométricas aprendidas.
- Digitalización de patrimonio y catalogación: clasificación semiautomática de escaneos de objetos arqueológicos o museísticos en categorías predefinidas para su registro.
- Conducción autónoma y percepción vial: clasificación de objetos detectados en la nube de puntos LiDAR (vehículos, peatones, mobiliario urbano) como componente de un sistema de percepción más amplio.
- Prototipado rápido en investigación 3D: benchmark de referencia para comparar nuevas arquitecturas de nubes de puntos contra un baseline PointGPT-L con métricas publicadas sobre ModelNet40.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados) sobre ModelNet40:

| Metrica | Valor |
|---|---|
| OA (Overall Accuracy) | 93,88 |
| mAcc (Mean per-class Accuracy) | 92,05 |

No se han publicado en la información disponible resultados de otros benchmarks (p. ej. segmentación o detección) ni comparaciones directas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 360,4 M de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 1,4 GB; en fp16 aproximadamente 0,7 GB. A ello hay que sumar la memoria de activaciones, que depende del número de puntos de entrada (el ejemplo de la model card usa 8192 puntos).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia en fp32 con lotes pequeños; para lotes grandes o entrenamiento se recomiendan A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4080 o RTX 4090, incluso con margen para batching.
- Opciones de despliegue: la librería `torch-pointcloud` sobre PyTorch es la vía oficial; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | OA ModelNet40 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pointgpt-l.modelnet40.guangyan-chen | 360,4 M | nube de puntos (ej. 8192 puntos) | 93,88 | MIT | Hugging Face (torch-pointcloud) |
| pointgpt-s.modelnet40.guangyan-chen | no disponible | nube de puntos | no disponible | MIT | Hugging Face (torch-pointcloud) |
| PointGPT original (CGuangyan-BIT) | no disponible | nube de puntos | no disponible en la información | MIT | GitHub |

La información disponible solo permite confirmar la existencia de la variante small del mismo modelo dentro del proyecto torch-pointcloud; no se han proporcionado datos de rendimiento de esa variante ni de alternativas de otros autores (p. ej. PointNet++, Point Transformer, Point-MAE) que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación de nubes de puntos 3D; no es un modelo de lenguaje ni procesa texto, imágenes 2D o audio.
- El dominio de entrenamiento es ModelNet40, compuesto por formas 3D sintéticas y limpias; el rendimiento puede degradarse con nubes de puntos reales ruidosas, incompletas o con oclusiones.
- Las métricas declaradas (OA 93,88, mAcc 92,05) no están verificadas por un tercero (`verified: false` en el model-index).
- Riesgo de confusión entre clases geométricamente similares dentro de las 40 categorías, y de sobreajuste a la distribución de ModelNet40.
- No se documentan sesgos específicos, pero al tratarse de un dataset académico de objetos cotidianos puede presentar sesgo de cobertura hacia ciertas categorías y culturas materiales.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar la atribución a los autores originales (Chen et al., NeurIPS 2023) y al proyecto torch-pointcloud.
- La API de uso depende de la librería `torch-pointcloud`; cambios de versión podrían alterar las transformaciones de datos o la firma de `create_model`.
- No se dispone de información sobre cuantizaciones oficiales ni sobre optimizaciones para despliegue en producción (TensorRT, ONNX, etc.).

## Enlaces

- Hugging Face (modelo): https://huggingface.co/torch-pointcloud/pointgpt-l.modelnet40.guangyan-chen
- Hugging Face (variante small): https://huggingface.co/torch-pointcloud/pointgpt-s.modelnet40.guangyan-chen
- Paper PointGPT (arXiv:2305.11487): https://arxiv.org/abs/2305.11487
- Repositorio original PointGPT: https://github.com/CGuangyan-BIT/PointGPT
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
