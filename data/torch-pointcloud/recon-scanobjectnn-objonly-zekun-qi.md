# torch-pointcloud/recon.scanobjectnn-objonly.zekun-qi

## Resumen

ReCon (Contrast with Reconstruct) es un modelo de clasificación de nubes de puntos 3D desarrollado por Zekun Qi y colaboradores (ICML 2023). Esta ficha concreta, `recon.scanobjectnn-objonly.zekun-qi`, es un checkpoint afinado sobre el subconjunto OBJ_ONLY del dataset ScanObjectNN, orientado a clasificar objetos 3D del mundo real capturados con sensores. El modelo parte del preentrenamiento autosupervisado `recon.pretrain.zekun-qi` y ha sido convertido al ecosistema `torch-pointcloud` por el usuario Arthur Dujardin.

La arquitectura es un transformer enmascarado de puntos (masked point transformer) con consultas contrastivas multimodales, con 43,6 millones de parametros y una dimension de caracteristica de 1536. Resuelve la tarea de clasificacion de nubes de puntos en 15 clases, una tarea central en vision 3D con aplicaciones en robotica, conduccion autonoma y digitalizacion de entornos.

Su relevancia actual radica en que combina dos paradigmas de aprendizaje autosupervisado (contrastivo y generativo) y ofrece un rendimiento alto en un benchmark realista (ScanObjectNN), con una licencia MIT permisiva y pesos en formato safetensors, lo que facilita su integracion en pipelines de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Masked point transformer con consultas contrastivas multimodales (ReCon) |
| Parametros totales | 43.573.519 (43,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de nube de puntos de 8192 puntos en el ejemplo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Clases | 15 |
| Dimension de caracteristica | 1536 |
| Dataset de evaluacion | ScanObjectNN (OBJ_ONLY) |
| Libreria | torch-pointcloud |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ReCon, un transformer enmascarado de puntos que combina aprendizaje contrastivo con aprendizaje generativo. La innovacion principal del paper es el uso de consultas contrastivas multimodales que guian el preentrenamiento generativo: en lugar de reconstruir unicamente coordenadas enmascaradas, el modelo aprende representaciones guiadas por objetivos contrastivos, lo que segun los autores mejora la transferibilidad de las representaciones 3D. El checkpoint aqui descrito es el resultado del preentrenamiento autosupervisado (`recon.pretrain.zekun-qi`) seguido de un afinamiento supervisado sobre ScanObjectNN OBJ_ONLY.

El entrenamiento de afinamiento se realiza sobre el subconjunto OBJ_ONLY de ScanObjectNN, que contiene objetos 3D escaneados del mundo real sin fondo. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens, la composicion exacta del dataset de preentrenamiento, ni sobre el uso de RLHF/DPO (tecnicas no aplicables a este tipo de modelo). La conversion a `torch-pointcloud` la realiza Arthur Dujardin a partir del repositorio original `qizekun/ReCon` (MIT).

## Capacidades

- Clasificacion de nubes de puntos 3D en 15 clases de objetos del mundo real.
- Extraccion de caracteristicas (embeddings) de 1536 dimensiones mediante `forward_features` o `reset_classifier(num_classes=0)`.
- Procesamiento de nubes de puntos de hasta 8192 puntos (segun el ejemplo de uso de la model card).
- Aprendizaje de representaciones transferibles gracias al preentrenamiento contrastivo-generativo.
- Integracion nativa con PyTorch mediante la libreria `torch-pointcloud`.
- Soporte de inferencia por lotes mediante `collate` y el tensor de indices de batch.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades linguisticas o multimodales de texto: es un modelo puramente de vision 3D.

## Casos de uso

- Clasificacion de objetos escaneados en robotica: el modelo puede identificar objetos del mundo real a partir de nubes de puntos capturadas por sensores LiDAR o RGB-D, con 15 clases y un OA declarado de 93,63 sobre OBJ_ONLY, adecuado para tareas de manipulacion y navegacion.
- Digitalizacion y catalogacion de patrimonio: permite clasificar automaticamente escaneos 3D de objetos fisicos en categorias, agilizando inventarios en museos o archivos.
- Preprocesado en pipelines de vision 3D: sirve como extractor de caracteristicas (1536 dimensiones) para alimentar clasificadores posteriores, sistemas de recuperacion o clustering de formas 3D.
- Control de calidad en fabricacion: clasificacion de piezas escaneadas en linea de produccion para detectar categorias o anomalias, aprovechando la robustez del modelo ante datos reales de ScanObjectNN.
- Investigacion en representacion 3D: punto de partida para experimentos de transferencia, ablaciones o comparativas de aprendizaje autosupervisado en nubes de puntos, dado que parte de un checkpoint preentrenado publico.
- Prototipado rapido en PyTorch: la instalacion via `pip install torch-pointcloud` y la API `tp.create_model` permiten integrar el modelo en notebooks o scripts con pocas lineas, util para validar ideas antes de escalar.
- Sistemas de realidad aumentada: reconocimiento de objetos del entorno para anclar contenido virtual, gracias a la clasificacion de nubes de puntos en tiempo de inferencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Dataset | Metrica | Valor |
|---|---|---|
| ScanObjectNN (OBJ_ONLY) | OA (Overall Accuracy) | 93,63 |
| ScanObjectNN (OBJ_ONLY) | mAcc (Mean Accuracy) | 93,74 |

No se han publicado en la informacion disponible resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) ni comparativas numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 43,6 M de parametros; en precision FP32 ocupa aproximadamente 175 MB de pesos, y en FP16 unos 87 MB. La VRAM real dependera del tamano del lote y del numero de puntos por muestra (8192 en el ejemplo), por lo que se recomienda al menos 2-4 GB de VRAM para lotes pequenos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en GPUs de datacenter (A100, H100) para lotes grandes o despliegues de alto throughput.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: inferencia nativa en PyTorch mediante `torch-pointcloud`; no se dispone de informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos linguisticos y no aplicables directamente a este modelo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos numericos de modelos comparables (por ejemplo, PointNet++, DGCNN, Point Transformer o PointNeXt sobre ScanObjectNN). La siguiente tabla recoge unicamente lo que se conoce del modelo descrito; el resto de celdas se marca como no disponible.

| Modelo | Parametros | Contexto/entrada | OA en ScanObjectNN OBJ_ONLY | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| recon.scanobjectnn-objonly.zekun-qi | 43,6 M | 8192 puntos (ejemplo) | 93,63 | MIT | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificacion de nubes de puntos 3D; no procesa texto, imagenes 2D ni audio.
- Entrenado y evaluado solo sobre ScanObjectNN OBJ_ONLY (15 clases); el rendimiento fuera de esa distribucion (objetos con fondo, otras categorias, otros sensores) no esta garantizado.
- Los resultados de benchmarks estan declarados por el autor y marcados como no verificados (`verified: false`); conviene reproducirlos antes de usarlos en produccion.
- Riesgo de sobreajuste a las caracteristicas de los escaneos de ScanObjectNN; puede degradarse con nubes de puntos de distinta densidad, ruido o convencion de ejes.
- No se dispone de informacion sobre sesgos especificos del dataset ni sobre evaluaciones de robustez fuera de OBJ_ONLY.
- Licencia MIT: permite uso comercial y modificacion, pero se recomienda conservar la atribucion del paper original y del repositorio de conversion.
- No se dispone de informacion sobre cuantizacion ni sobre optimizaciones de despliegue; el rendimiento en produccion dependera de la implementacion en PyTorch.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/torch-pointcloud/recon.scanobjectnn-objonly.zekun-qi)
- [Paper: Contrast with Reconstruct (arXiv:2302.02318)](https://arxiv.org/abs/2302.02318)
- [Repositorio original qizekun/ReCon](https://github.com/qizekun/ReCon)
- [Libreria torch-pointcloud](https://github.com/arthurdjn/pytorch-pointcloud)
- [DOI de PyTorch PointCloud](https://doi.org/10.5281/zenodo.22159632)
- [Paper de ScanObjectNN (ICCV 2019)](https://arxiv.org/abs/1908.03641)
