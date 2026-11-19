# torch-pointcloud/point-mamba-base.scanobjectnn-hardest.dingkang-liang

## Resumen

PointMamba es un modelo de clasificación de nubes de puntos 3D que aplica un modelo de espacio de estados (SSM) sobre secuencias de puntos serializados. Este checkpoint concreto, `point-mamba-base.scanobjectnn-hardest.dingkang-liang`, es un ajuste fino del modelo preentrenado `point-mamba-base.pretrain.dingkang-liang` sobre la partición más difícil del dataset ScanObjectNN (PB_T50_RS), que contiene objetos reales escaneados con oclusión y perturbaciones. Lo publica la organización `torch-pointcloud` como parte del ecosistema de la librería PyTorch PointCloud, y procede de la implementación original de los autores del paper en el repositorio LMD0311/PointMamba.

El modelo resuelve la tarea de clasificación de nubes de puntos en 15 clases con solo 12,3 millones de parámetros y una dimensión de características de 384. Su relevancia radica en que sustituye los mecanismos de atención cuadráticos habituales en los transformers de nubes de puntos por un SSM de complejidad lineal, lo que reduce el coste computacional al procesar secuencias largas de puntos (hasta 8192 puntos en el ejemplo de uso de la model card).

Este checkpoint está pensado para inferencia en GPU (los kernels de `mamba-ssm` son GPU-only) y para extracción de características de nubes de puntos, lo que lo hace útil como extractor de embeddings para tareas posteriores de segmentación, detección o recuperación. La licencia Apache-2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | State space model (Mamba) sobre puntos serializados, tipo PointMamba |
| Parametros totales | 12.293.647 (12,3 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ejemplo de uso con 8192 puntos por muestra) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no aplica (modelo de nubes de puntos, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Dimension de caracteristicas | 384 |
| Numero de clases | 15 |
| Dataset de ajuste | ScanObjectNN (PB_T50_RS) |
| Libreria | torch-pointcloud (requiere mamba-ssm) |
| Modelo base | torch-pointcloud/point-mamba-base.pretrain.dingkang-liang |

## Arquitectura y entrenamiento

PointMamba es un modelo de espacio de estados selectivo (SSM) aplicado a nubes de puntos. La nube de puntos se serializa en una secuencia ordenada de tokens y se procesa con bloques Mamba, que modelan dependencias de largo alcance con complejidad lineal en la longitud de la secuencia, en lugar de la complejidad cuadratica de la autoatencion. El checkpoint tiene 12,3 M de parametros y produce caracteristicas de 384 dimensiones para la cabeza de clasificacion de 15 clases.

El modelo parte de un preentrenamiento (`point-mamba-base.pretrain.dingkang-liang`) y se ajusta despues sobre ScanObjectNN en su variante PB_T50_RS, la particion mas dificil del benchmark, que incluye objetos reales con ruido de escaneo, oclusion y perturbaciones. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a esta tarea). El checkpoint ha sido convertido desde la implementacion original del repositorio LMD0311/PointMamba (Apache-2.0) al formato de la libreria torch-pointcloud.

## Capacidades

- Clasificacion de nubes de puntos 3D en 15 clases (tarea `point-cloud-classification`).
- Extraccion de caracteristicas: `forward_features` devuelve embeddings de 384 dimensiones por muestra, utiles para tareas downstream.
- Capacidad de resetear el clasificador (`reset_classifier(num_classes=0)`) para usar el modelo como backbone.
- Procesamiento de nubes de puntos de hasta 8192 puntos por muestra en el ejemplo de la model card.
- Inferencia en GPU con kernels de `mamba-ssm`; requiere compilacion compatible con la version de torch y CUDA.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente perceptivo 3D.
- No dispone de modo thinking, vision 2D, audio ni generacion de texto.

## Casos de uso

- Clasificacion de objetos escaneados en robotica movil: el modelo recibe nubes de puntos de sensores LiDAR o RGB-D y asigna una de 15 clases, adecuado por su bajo coste (12,3 M de parametros) y su robustez en la particion mas dificil de ScanObjectNN.
- Inventario y logistica automatizada: clasificacion de objetos en cintas transportadoras a partir de escaneos 3D, con inferencia en GPU de gama media y latencia baja gracias a la complejidad lineal del SSM.
- Extraccion de embeddings para busqueda y recuperacion 3D: usar `forward_features` para generar vectores de 384 dimensiones e indexarlos en un motor de similitud para recuperacion de modelos o deteccion de duplicados.
- Preentrenamiento de backbones para segmentacion semantica 3D: el checkpoint sirve como inicializacion de un backbone PointMamba para tareas de segmentacion de partes o escenas, aprovechando que la arquitectura admite `reset_classifier`.
- Control de calidad en fabricacion aditiva: clasificacion de piezas escaneadas para detectar categorias erroneas o piezas fuera de catalogo en un pipeline de inspeccion.
- Prototipado e investigacion en arquitecturas SSM para vision 3D: el modelo permite reproducir los resultados de PointMamba en ScanObjectNN y comparar frente a backbones basados en atencion con un coste de computo mucho menor.
- Vehiculos aereos no tripulados y escaneo de interiores: clasificacion de objetos en nubes de puntos capturadas con drones o escaneres moviles, donde la robustez a oclusion de PB_T50_RS es relevante.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Metrica | Valor |
|---|---|---|
| ScanObjectNN (PB_T50_RS) | OA (overall accuracy) | 89,24 |
| ScanObjectNN (PB_T50_RS) | mAcc (mean accuracy) | 88,05 |

No se han publicado en la informacion disponible resultados adicionales de otros benchmarks (ModelNet40, ShapeNet, etc.) ni comparaciones oficiales con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 12,3 M de parametros en fp32, los pesos ocupan aproximadamente 49 MB; el consumo real depende del tamano del lote y del numero de puntos (8192 en el ejemplo), por lo que se estima un uso de VRAM bajo, del orden de cientos de MB a pocos GB.
- GPU recomendadas: cualquier GPU NVIDIA compatible con los kernels de `mamba-ssm` (la model card indica que los kernels son GPU-only). Se recomienda una GPU con soporte CUDA reciente; no se especifican modelos concretos.
- GPU de consumo: por el tamano del modelo, es previsible que quepa en GPUs de consumo como RTX 3060, RTX 4060 o RTX 4090, siempre que la compilacion de `mamba-ssm` sea compatible con la version de torch y CUDA instalada.
- Opciones de despliegue: la libreria `torch-pointcloud` con `tp.create_model(..., pretrained=True)`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de nubes de puntos).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de benchmarks de modelos alternativos de clasificacion de nubes de puntos (por ejemplo, PointNet++, DGCNN, Point Transformer o PointNeXt) medidos en las mismas condiciones, por lo que la comparativa cuantitativa no esta disponible. A nivel cualitativo:

| Modelo | Parametros | Contexto / puntos | Licencia | Disponibilidad |
|---|---|---|---|---|
| PointMamba base (este checkpoint) | 12,3 M | hasta 8192 puntos en el ejemplo | Apache-2.0 | Hugging Face, via torch-pointcloud |
| Alternativas basadas en atencion (Point Transformer, PointNeXt) | no disponible | no disponible | variable | no disponible en esta busqueda |
| Alternativas basadas en convolucion (PointNet++, DGCNN) | no disponible | no disponible | variable | no disponible en esta busqueda |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificacion de nubes de puntos con 15 clases; no es un modelo de lenguaje ni admite instrucciones en lenguaje natural.
- Los resultados de benchmarks (OA 89,24, mAcc 88,05) estan declarados por el autor y marcados como no verificados; no deben tomarse como cifras auditadas.
- Requiere GPU y una compilacion de `mamba-ssm` compatible con la version de torch y CUDA, lo que complica el despliegue en entornos con versiones fijas de CUDA.
- El rendimiento puede degradarse fuera de la distribucion de ScanObjectNN (objetos reales escaneados con ruido y oclusion); no se documenta su comportamiento en otros dominios.
- No se documentan sesgos especificos, pero al entrenarse sobre un dataset acotado de 15 clases, el modelo no generaliza a categorias no vistas.
- Riesgo de clasificaciones erroneas en objetos con oclusion severa o ruido de sensor, inherente a la tarea.
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y atribucion; conviene revisar las licencias del modelo base y del dataset ScanObjectNN para usos derivados.
- El repositorio ocupa 0,0 GB segun los metadatos, lo que puede indicar que los pesos se cargan de forma remota o que el tamano reportado no es fiable; verificar la descarga completa antes de usar en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/point-mamba-base.scanobjectnn-hardest.dingkang-liang
- Modelo base preentrenado: https://huggingface.co/torch-pointcloud/point-mamba-base.pretrain.dingkang-liang
- Paper PointMamba (arXiv:2402.10739): https://arxiv.org/abs/2402.10739
- Repositorio original PointMamba: https://github.com/LMD0311/PointMamba
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentacion de instalacion de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Paper de ScanObjectNN (ICCV 2019): https://arxiv.org/abs/1908.00463 (referencia de la cita del dataset)
