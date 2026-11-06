# torch-pointcloud/pct.modelnet40.strawberry-eat-mango

## Resumen

El modelo `pct.modelnet40.strawberry-eat-mango` es un clasificador de nubes de puntos 3D basado en PCT (Point Cloud Transformer), una arquitectura de tipo transformer con mecanismo de offset-attention presentada en el articulo "PCT: Point Cloud Transformer" (Guo et al., 2021). Lo publica el proyecto `torch-pointcloud` de Arthur Dujardin, que lo ha convertido a partir de la implementacion original en PyTorch de Strawberry-Eat-Mango, y lo distribuye como checkpoint listo para usar con su libreria homonima.

El modelo resuelve el problema de clasificacion de formas 3D representadas como nubes de puntos sin estructura de rejilla, es decir, asignar una de 40 categorias (silla, mesa, avion, etc.) a un conjunto de puntos tridimensionales. Es relevante para quienes trabajan en vision 3D, robotica o analisis de datos LiDAR porque ofrece una arquitectura transformer compacta (2,9 millones de parametros) con un rendimiento declarado del 93,27 % de exactitud global sobre ModelNet40, un benchmark clasico de clasificacion de formas 3D.

A diferencia de los modelos de lenguaje, este checkpoint no genera texto ni admite instrucciones: es un extractor de caracteristicas y clasificador puro. Su interes practico esta en la integracion dentro de pipelines de PyTorch Geometric a traves de `torch-pointcloud`, con soporte de extraccion de embeddings de 1024 dimensiones y una licencia MIT permisiva para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PCT (Point Cloud Transformer) con offset-attention |
| Parametros totales | 2.885.096 (2,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de nube de puntos de hasta 8192 puntos en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors en precision nativa) |
| Idiomas soportados | no disponible (no aplica; modelo no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension del embedding | 1024 |
| Numero de clases | 40 (ModelNet40) |
| Libreria | torch-pointcloud |
| Dependencias adicionales | pyg-lib (compilacion especifica segun torch y CUDA) |

## Arquitectura y entrenamiento

PCT aplica el mecanismo de atencion de los transformers a nubes de puntos desordenadas. En lugar de la self-attention estandar, emplea una offset-attention que modela la relacion entre las caracteristicas y su diferencia respecto a la entrada, lo que segun los autores mejora la capacidad de representacion geometrica. El modelo incorpora ademas modulos de embedding posicional y de agregacion de caracteristicas globales. La implementacion concreta de este checkpoint produce representaciones de 1024 dimensiones y una cabeza de clasificacion de 40 clases.

El entrenamiento se realiza sobre ModelNet40, un dataset de formas 3D CAD con 40 categorias y 12.311 mallas (9.843 de entrenamiento y 2.468 de test en la particion habitual). No se dispone de informacion sobre el numero exacto de tokens, la composicion del dataset mas alla de ModelNet40, ni sobre el uso de tecnicas de RLHF o DPO, algo que no aplica a un modelo de clasificacion. El checkpoint es una conversion de la implementacion de referencia `Strawberry-Eat-Mango/PCT_Pytorch` (MIT) al formato de `torch-pointcloud`, por lo que las innovaciones tecnicas son las del paper original y no se documentan modificaciones adicionales en la model card.

## Capacidades

- Clasificacion de nubes de puntos 3D en 40 categorias de ModelNet40.
- Extraccion de embeddings globales de 1024 dimensiones mediante `forward_features` o `reset_classifier(num_classes=0)`.
- Procesamiento de nubes de puntos desordenadas sin estructura de rejilla, con soporte de coordenadas (`pos`) y normales (`normal`).
- Entrada de hasta 8192 puntos por muestra en el ejemplo de la model card.
- Integracion con PyTorch y PyTorch Geometric a traves de `torch_pointcloud.create_model`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, vision 2D, audio ni capacidades multilingues.

## Casos de uso

- Clasificacion de objetos escaneados en robotica: un robot equipado con LiDAR o camara de profundidad puede segmentar la escena en nubes de puntos y usar el modelo para identificar la categoria del objeto (silla, mesa, puerta) antes de planificar una interaccion.
- Analisis de datos LiDAR en automocion: clasificar agrupaciones de puntos de sensores de vehiculos para distinguir peatones, vehiculos y elementos de mobiliario urbano, aprovechando la invariancia al orden de los puntos.
- Digitalizacion y catalogacion de patrimonio 3D: procesar escaneos de piezas arqueologicas o modelos CAD y asignarles una categoria para su indexacion automatica en repositorios.
- Control de calidad en fabricacion aditiva: comparar nubes de puntos de piezas impresas en 3D con la geometria esperada y clasificar la pieza para enrutar el control dimensional correspondiente.
- Preentrenamiento y transferencia en vision 3D: usar los embeddings de 1024 dimensiones como caracteristicas congeladas para entrenar clasificadores ligeros en datasets propios con pocas muestras.
- Prototipado rapido en investigacion: servir como linea base reproducible de PCT sobre ModelNet40 para comparar nuevas arquitecturas de transformers de nubes de puntos.
- Indexacion de assets 3D en motores de videojuegos o plataformas de contenido: clasificar automaticamente mallas convertidas a nubes de puntos para organizar bibliotecas de modelos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| ModelNet40 | OA (exactitud global) | 93,27 |
| ModelNet40 | mAcc (exactitud media por clase) | 89,99 |

No se han publicado en la informacion disponible resultados adicionales de latencia, throughput ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los pesos en precision nativa (2,9 M de parametros, aproximadamente 11,5 MB en fp32), mas el consumo de activaciones segun el numero de puntos de entrada.
- GPU recomendadas: cualquier GPU con soporte CUDA moderna es suficiente; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con CUDA; tambien es viable en CPU para lotes pequenos.
- Opciones de despliegue: `torch-pointcloud` sobre PyTorch y PyTorch Geometric; requiere `pyg-lib` compilado para la version de torch y CUDA correspondiente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | ModelNet40 OA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pct.modelnet40.strawberry-eat-mango | 2,9 M | hasta 8192 puntos (ejemplo) | 93,27 | MIT | HuggingFace (torch-pointcloud) |
| PointNet++ | no disponible | no disponible | no disponible | no disponible | no disponible |
| DGCNN | no disponible | no disponible | no disponible | no disponible | no disponible |
| Point Transformer | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos verificables de parametros, contexto o rendimiento de los modelos alternativos, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en ModelNet40, un dataset de formas CAD limpias y sinteticas; su rendimiento puede degradarse en nubes de puntos reales con ruido, oclusiones o densidad variable.
- Las metricas declaradas (OA 93,27, mAcc 89,99) no estan verificadas de forma independiente (`verified: false` en la model card).
- No es un modelo generativo ni linguistico: no admite instrucciones, texto, tool calling ni razonamiento; cualquier uso fuera de clasificacion o extraccion de caracteristicas no esta soportado.
- La licencia MIT permite uso comercial, pero el usuario debe cumplir ademas las licencias de las dependencias (PyTorch, PyTorch Geometric, pyg-lib) y del dataset ModelNet40.
- La instalacion de `pyg-lib` requiere compilar contra la version exacta de torch y CUDA, lo que anade friccion al despliegue en produccion.
- No se documentan sesgos especificos ni riesgos de alucinacion, ya que el modelo no genera contenido abierto; el riesgo principal es la clasificacion erronea en categorias visualmente similares o en dominios distintos al de entrenamiento.
- No se dispone de informacion sobre robustez frente a rotaciones, traslaciones o escalados no vistos durante el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/pct.modelnet40.strawberry-eat-mango
- Paper PCT: https://arxiv.org/abs/2012.09688
- Repositorio original PCT_Pytorch: https://github.com/Strawberry-Eat-Mango/PCT_Pytorch
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentacion de instalacion de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
