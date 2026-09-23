# torch-pointcloud/point-mamba-base.scanobjectnn-objbg.dingkang-liang

## Resumen

Point-Mamba base (scanobjectnn-objbg) es un modelo de clasificación de nubes de puntos 3D desarrollado por Dingkang Liang y colaboradores, publicado en NeurIPS 2024 con el artículo "PointMamba: A Simple State Space Model for Point Cloud Analysis" (arXiv:2402.10739). La versión aquí descrita es una conversión realizada por el proyecto torch-pointcloud (Arthur Dujardin) a partir del repositorio original LMD0311/PointMamba, y se distribuye con pesos en formato safetensors y licencia Apache-2.0.

A diferencia de los transformadores basados en atención, PointMamba emplea un modelo de espacio de estados (SSM, familia Mamba) que opera sobre una secuencia serializada de puntos. Este checkpoint concreto es un ajuste fino sobre el modelo preentrenado `point-mamba-base.pretrain.dingkang-liang`, especializado en la variante OBJ_BG del dataset ScanObjectNN, con 15 clases de objetos de interior. Cuenta con 12.293.647 parámetros (12,3 M), una dimensión de características de 384 y declara un 94,32 % de accuracy global (OA) y un 92,66 % de accuracy media por clase (mAcc).

Su relevancia es doble: por un lado, demuestra que los SSM compiten con las arquitecturas basadas en atención en análisis de nubes de puntos con un coste computacional bajo; por otro, su tamaño (12,3 M de parámetros, ~25 MB en FP16) lo convierte en un candidato viable para inferencia en GPUs de consumo e integración en pipelines 3D reales. La conversión a `torch-pointcloud` facilita la carga con `create_model`, la extracción de embeddings de 384 dimensiones y el reajuste de la cabeza de clasificación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de espacio de estados (SSM, familia Mamba) sobre puntos serializados; no basado en atención |
| Parámetros totales | 12.293.647 (12,3 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); la entrada es una nube de puntos. El ejemplo oficial de uso emplea 8192 puntos por muestra |
| Tipos de cuantización | no disponible (el repositorio solo distribuye pesos en safetensors; no se documentan versiones GGUF, int8 ni int4) |
| Idiomas soportados | no aplica (modelo de clasificación 3D, no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimensión de características | 384 |
| Clases de salida | 15 |
| Librería de carga | torch-pointcloud (`pip install torch-pointcloud`) |
| Dependencia adicional | mamba-ssm (kernels solo GPU, requieren build compatible con la versión de torch y CUDA) |
| Modelo base | torch-pointcloud/point-mamba-base.pretrain.dingkang-liang |
| Dataset de ajuste | ScanObjectNN (variante OBJ_BG) |

## Arquitectura y entrenamiento

La arquitectura se describe en la model card como un "state space model over serialized points": la nube de puntos se serializa en una secuencia y se procesa mediante bloques SSM de tipo Mamba, con una dimensión de características de 384. Esto sustituye el mecanismo de atención cuadrático habitual en los transformers de nubes de puntos por una recurrencia de espacio de estados de coste lineal respecto a la longitud de la secuencia. El checkpoint aquí documentado no entrena desde cero: parte del modelo preentrenado `point-mamba-base.pretrain.dingkang-liang` y se ajusta para clasificación sobre ScanObjectNN (OBJ_BG), una variante del benchmark con objetos reales escaneados y fondo, lo que la hace más difícil que las nubes sintéticas tipo ModelNet.

La información proporcionada no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de alineación como RLHF o DPO (no aplicables en un modelo discriminativo de este tipo). Tampoco se especifican innovaciones de decodificación, mecanismos de serialización concretos (por ejemplo, curvas de orden espacial) ni el número de capas y dimensión de estado del SSM; esos detalles deben consultarse en el artículo arXiv:2402.10739. La model card sí confirma que el modelo expone dos modos de uso: clasificación directa (logits sobre 15 clases) y extracción de características (`forward_features`, embeddings de 384 dimensiones), además de `reset_classifier(num_classes=N)` para adaptar la cabeza a un número distinto de clases.

## Capacidades

- Clasificación de nubes de puntos 3D en 15 clases de objetos de interior (dataset ScanObjectNN, variante OBJ_BG, que incluye fondo y objetos escaneados en condiciones reales).
- Extracción de embeddings de 384 dimensiones por muestra, mediante `forward_features` o `reset_classifier(num_classes=0)`, útiles para recuperación por similitud, clustering o aprendizaje por transferencia.
- Reutilización como backbone preentrenado: la cabeza de clasificación puede sustituirse para ajuste fino en otros datasets de nubes de puntos.
- Procesamiento de nubes con 8192 puntos por muestra en el ejemplo oficial de uso, con transformaciones de datos y `collate` provistos por la librería `torch-pointcloud`.
- Inferencia con kernels Mamba acelerados por GPU (la model card indica explícitamente que los kernels son "GPU-only").
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, visión 2D, audio ni capacidades multilingües: es un modelo puramente discriminativo sobre geometría 3D.

## Casos de uso

- Clasificación de objetos en robótica doméstica: un robot equipado con cámara de profundidad o LiDAR puede procesar la nube de puntos de una escena (muestreada a 8192 puntos) y obtener la categoría del objeto, con 12,3 M de parámetros y ~25 MB en FP16, lo que permite ejecutar el modelo en el propio robot si dispone de GPU.
- Inventario y reconocimiento de mobiliario en interiores: dado que el checkpoint está ajustado en ScanObjectNN OBJ_BG, se adapta bien a escenas de interior con fondo; sirve para catalogar objetos en escaneos de viviendas, oficinas o almacenes.
- Etiquetado asistido de datasets 3D: el modelo puede preetiquetar automáticamente nubes de puntos con las 15 clases aprendidas y reducir el coste de anotación manual, dejando al humano la revisión de los casos de baja confianza.
- Búsqueda y recuperación de modelos 3D: usando los embeddings de 384 dimensiones se puede construir un índice vectorial para buscar geometrías similares en un catálogo (por ejemplo, localizar todas las sillas de un repositorio CAD escaneado).
- Preprocesado para pipelines de reconstrucción o segmentación semántica: como backbone preentrenado, sus características de 384 dimensiones pueden alimentar cabezas de segmentación, detección 3D o registro de nubes, aprovechando que el preentrenamiento es sobre puntos reales y no sintéticos.
- Verificación de inventario en logística: clasificar nubes de puntos de paquetes u objetos apilados para comprobar que la categoría declarada coincide con la geometría escaneada, con un modelo lo bastante pequeño para desplegarse en varios nodos de un almacén.
- Evaluación comparativa de arquitecturas SSM frente a transformers: por su tamaño reducido y sus métricas publicadas en OBJ_BG, es un punto de referencia práctico para reproducir experimentos de investigación en análisis de nubes de puntos.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (campo `verified: false`, es decir, no verificados de forma independiente). No se han publicado en la información disponible otros resultados de benchmarks.

| Dataset | Tarea | Métrica | Valor | Verificado |
|---|---|---|---|---|
| ScanObjectNN (OBJ_BG) | Clasificación de nubes de puntos | OA (accuracy global) | 94,32 | No |
| ScanObjectNN (OBJ_BG) | Clasificación de nubes de puntos | mAcc (accuracy media por clase) | 92,66 | No |

No se proporcionan resultados para MMLU, HumanEval, GSM8K ni ningún otro benchmark: no son aplicables a un modelo de clasificación 3D.

## Requisitos de hardware

- Tamaño de los pesos: 12.293.647 parámetros, aproximadamente 49,2 MB en FP32, 24,6 MB en FP16/BF16 y ~12,3 MB en una hipotética cuantización a 8 bits (no distribuida oficialmente).
- VRAM estimada para inferencia: muy baja; con lotes pequeños (1-8 muestras de 8192 puntos) el consumo se sitúa en el rango de cientos de MB a pocos GB, dominado por activaciones y por el contexto de ejecución de CUDA más que por los pesos. No se publican mediciones exactas en la información disponible.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA reciente. Para desarrollo y pruebas, RTX 3060, RTX 4060, RTX 4090 o superiores. Para despliegue en servidor, A100 o H100 resultan sobredimensionadas para este modelo, pero son compatibles; una T4 o L4 es suficiente.
- Cabe en GPU de consumo: sí. Cualquier GPU de consumo con CUDA y drivers actualizados puede ejecutar el modelo; el cuello de botella real es la compilación de `mamba-ssm`, no la memoria.
- Opciones de despliegue: carga mediante `torch-pointcloud` (`tp.create_model(...)`) sobre PyTorch. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia de modelos de lenguaje, ya que no es un modelo generativo.
- Limitación de despliegue destacable: los kernels de Mamba son exclusivos de GPU, por lo que la inferencia en CPU no está soportada según la model card. Además, `mamba-ssm` requiere una compilación específica para la combinación de versión de PyTorch y CUDA, lo que añade fricción al entorno.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La información disponible solo incluye métricas del propio checkpoint. Los valores de los modelos alternativos se marcan como no disponibles para no inventar cifras.

| Modelo | Categoría | Parámetros | Entrada | Licencia | Disponibilidad | OA en OBJ_BG |
|---|---|---|---|---|---|---|
| point-mamba-base.scanobjectnn-objbg (este modelo) | SSM sobre puntos serializados | 12,3 M | Nube de puntos (8192 puntos en el ejemplo oficial) | Apache-2.0 | HuggingFace, safetensors, librería torch-pointcloud | 94,32 |
| torch-pointcloud/point-mamba-base.pretrain | SSM preentrenado (modelo base) | no disponible | Nube de puntos | Apache-2.0 | HuggingFace | no disponible (sin ajuste a OBJ_BG) |
| Point-Mamba original (LMD0311/PointMamba) | SSM sobre puntos serializados | no disponible | Nube de puntos | Apache-2.0 | GitHub | no disponible en la información proporcionada |
| Point-MAE | Transformer enmascarado para nubes de puntos | no disponible | Nube de puntos | no disponible | Repositorio del autor | no disponible en la información proporcionada |
| PointNet++ / DGCNN | Redes de nubes de puntos clásicas | no disponible | Nube de puntos | no disponible | Múltiples implementaciones | no disponible en la información proporcionada |

Como referencia cualitativa, Point-Mamba se presenta en el artículo (NeurIPS 2024) como una alternativa de coste lineal frente a los enfoques basados en atención para análisis de nubes de puntos; para una comparación numérica rigurosa debe consultarse la tabla de resultados del propio artículo.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta instrucciones, tool calling, agentes ni razonamiento multi-paso. Cualquier expectativa de ese tipo es incorrecta.
- Dominio restringido: está ajustado únicamente sobre ScanObjectNN OBJ_BG (escenas de interior con fondo). Su rendimiento fuera de ese dominio (exteriores, LiDAR de conducción, objetos industriales, nubes sintéticas) no está documentado y probablemente se degrade.
- Cabeza fija de 15 clases: para etiquetas distintas hay que reentrenar o sustituir el clasificador (`reset_classifier`), lo que requiere datos etiquetados del nuevo dominio.
- Sensibilidad a la representación de entrada: el número de puntos, el muestreo, la normalización y las transformaciones aplicadas influyen directamente en el resultado; el ejemplo oficial usa 8192 puntos y las transformaciones de `torch-pointcloud`.
- Riesgo de sobreconfianza: aunque no "alucina" en sentido generativo, sí puede asignar probabilidades altas a clases incorrectas en objetos ocluidos, con ruido de escaneo o con geometrías ambiguas. Conviene calibrar o aplicar umbrales de rechazo en producción.
- Sesgos del dataset: ScanObjectNN procede de escaneos del mundo real con la distribución de objetos, entornos y condiciones de captura de sus autores; puede infrarrepresentar ciertas categorías, materiales o contextos geográficos y culturales.
- Métricas no verificadas: los valores OA 94,32 y mAcc 92,66 están declarados por el autor con `verified: false` y no se han reproducido de forma independiente en la información disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificaciones, pero exige conservar el aviso de licencia y la atribución. Deben citarse el artículo de PointMamba (NeurIPS 2024), el dataset ScanObjectNN (ICCV 2019) y el software PyTorch PointCloud.
- Fricción de despliegue: dependencia de `mamba-ssm` compilado contra una versión concreta de PyTorch y CUDA, y kernels exclusivos de GPU. Esto complica la reproducibilidad y el empaquetado en contenedores.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopción ni de soporte de la comunidad sobre este checkpoint concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/point-mamba-base.scanobjectnn-objbg.dingkang-liang
- Modelo base (preentrenado): https://huggingface.co/torch-pointcloud/point-mamba-base.pretrain.dingkang-liang
- Artículo PointMamba (arXiv:2402.10739): https://arxiv.org/abs/2402.10739
- Repositorio original de PointMamba (LMD0311/PointMamba): https://github.com/LMD0311/PointMamba
- Librería torch-pointcloud (PyTorch PointCloud): https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación de torch-pointcloud (incluye guía de mamba-ssm): https://pytorch-pointcloud.org/latest/installation/
- Dataset ScanObjectNN (artículo ICCV 2019, Uy et al.): https://arxiv.org/abs/1905.03621 (referencia citada en la model card)
- DOI del software PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
