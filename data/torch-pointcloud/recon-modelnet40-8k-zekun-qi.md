# torch-pointcloud/recon.modelnet40-8k.zekun-qi

## Resumen

ReCon (recon.modelnet40-8k.zekun-qi) es un modelo de clasificación de nubes de puntos 3D desarrollado originalmente por Zekun Qi y colaboradores (Universidad de Shanghai Jiao Tong y Shanghai AI Laboratory) y publicado en ICML 2023 bajo el título "Contrast with Reconstruct: Contrastive 3D Representation Learning Guided by Generative Pretraining". Esta versión concreta ha sido convertida al ecosistema torch-pointcloud por Arthur Dujardin, empaquetada en formato safetensors y publicada en HuggingFace con licencia MIT.

El modelo parte de un backbone de tipo masked point transformer con consultas contrastivas multimodales (cross-modal contrastive queries), preentrenado de forma autosupervisada y posteriormente afinado para la tarea de clasificación de 40 clases del dataset ModelNet40. Con 43,6 millones de parámetros y un vector de características de 1536 dimensiones, está pensado para trabajar con nubes de puntos de 8192 puntos con normales, aunque la transformación del pipeline puede remuestrear la entrada.

Su relevancia actual reside en que ofrece un checkpoint listo para usar dentro de PyTorch mediante una única llamada a `tp.create_model`, con resultados declarados de 94,25 % de accuracy global (OA) y 91,35 % de accuracy media por clase (mAcc) en ModelNet40. Es una pieza útil tanto para evaluación de pipelines de clasificación 3D como para extracción de embeddings de nubes de puntos en tareas downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Masked point transformer con consultas contrastivas multimodales (ReCon) |
| Parametros totales | 43.579.944 (43,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 8192 puntos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no aplica; modelo 3D, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

ReCon combina aprendizaje contrastivo con reconstruccion generativa. El backbone es un transformer sobre puntos (point transformer) que procesa tokens derivados de las coordenadas y normales de la nube de puntos, con atencion sobre vecindarios locales. Durante el preentrenamiento, el modelo enmascara partes de la nube y aprende a reconstruirlas, mientras que en paralelo alinea representaciones mediante consultas contrastivas multimodales que conectan la informacion geometrica con la semantica. Esta doble senal (contrastiva y generativa) es la innovacion central del paper de Qi et al.

El checkpoint publicado aqui corresponde al afinamiento supervisado sobre ModelNet40 (40 clases, 8192 puntos por muestra con normales). El modelo base declarado es `torch-pointcloud/recon.pretrain.zekun-qi`, es decir, el preentrenamiento autosupervisado convertido al mismo ecosistema. La model card no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset de preentrenamiento ni si se aplico RLHF o DPO (tecnicas no aplicables a este tipo de modelo). La cabeza de clasificacion produce logits sobre 40 clases y el extractor de caracteristicas expone un vector de 1536 dimensiones.

## Capacidades

- Clasificacion de nubes de puntos 3D en 40 categorias de objetos (ModelNet40).
- Extraccion de embeddings de 1536 dimensiones por nube de puntos mediante `forward_features` o `reset_classifier(num_classes=0)`.
- Procesamiento de nubes de 8192 puntos con coordenadas y normales.
- Integracion nativa con PyTorch a traves de la libreria torch-pointcloud (`tp.create_model`).
- Soporte de inferencia por lotes mediante la funcion `collate` del paquete.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente perceptivo 3D.
- No dispone de modo "thinking", vision 2D, audio ni generacion de texto.

## Casos de uso

- Clasificacion de objetos escaneados: dado un escaneo LiDAR o de profundidad remuestreado a 8192 puntos, el modelo devuelve la categoria del objeto entre 40 clases, util para inventario robotico o inspeccion industrial.
- Extraccion de embeddings para busqueda por similitud: usando `forward_features` se obtienen vectores de 1536 dimensiones que pueden indexarse en una base vectorial para recuperacion de formas 3D similares.
- Preentrenamiento de tareas downstream: el checkpoint sirve como inicializacion para segmentacion de partes, deteccion 3D o estimacion de pose, aprovechando las representaciones geometricas aprendidas.
- Benchmarking de pipelines 3D: al estar empaquetado en torch-pointcloud con una API estable, es util como referencia reproducible (OA 94,25) para comparar preprocesados, aumentos de datos o arquitecturas propias.
- Control de calidad en fabricacion: clasificar piezas escaneadas en linea para detectar categorias erroneas o piezas desconocidas (baja confianza en los logits).
- Docencia e investigacion en vision 3D: ejemplo compacto (43,6 M de parametros, 0,2 GB) para estudiar transformers sobre nubes de puntos sin requerir grandes recursos.
- Filtrado previo en pipelines de reconstruccion: clasificar la nube antes de aplicar un modelo generativo o de reconstruccion especifico de la categoria.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| ModelNet40 | OA (accuracy global) | 94,25 |
| ModelNet40 | mAcc (accuracy media por clase) | 91,35 |

No se han publicado en la informacion disponible otros resultados (latencia, throughput, comparativas con otros checkpoints dentro del mismo repo).

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 0,17 GB (43,6 M de parametros en FP32); con activaciones para lotes de 8192 puntos, se estima un consumo de 1-2 GB en FP32 y menos de 1 GB en FP16.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 (12 GB) o superior permite lotes grandes. Para entrenamiento o fine-tuning se recomienda RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 2 GB de VRAM para inferencia en FP16.
- Opciones de despliegue: al ser un modelo PyTorch puro integrado en torch-pointcloud, el despliegue se realiza via `torch.jit`, ONNX o directamente con PyTorch. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | ModelNet40 OA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReCon (este checkpoint) | 43,6 M | 8192 puntos + normales | 94,25 (declarado) | MIT | HuggingFace, torch-pointcloud |
| PointNet++ | ~1,5 M (según configuracion) | 1024-8192 puntos | ~91-93 (referencia de la literatura) | MIT | Implementaciones multiples |
| Point Transformer (v1) | ~7 M (clasificacion) | 1024 puntos | ~93,7 (referencia de la literatura) | MIT | Repos oficiales |
| DGCNN | ~1,8 M | 1024 puntos | ~92,9 (referencia de la literatura) | MIT | Repos oficiales |

Nota: los valores de los modelos alternativos son cifras de referencia habituales en la literatura y no se han verificado contra una fuente concreta en esta ficha; los unicos datos confirmados aqui son los del checkpoint ReCon publicados en su model card.

## Limitaciones y advertencias

- Solo clasifica 40 clases de ModelNet40 (categorias de objetos cotidianos); cualquier objeto fuera de ese vocabulario se asignara a la clase mas cercana sin senal explicita de rechazo.
- Entrenado con nubes de puntos sinteticas o remuestreadas a 8192 puntos con normales; el rendimiento puede degradarse con escaneos reales ruidosos, oclusiones o densidades muy distintas.
- Riesgo de sobreajuste al dominio de ModelNet40: la accuracy declarada no garantiza generalizacion a datos reales de LiDAR o sensores de profundidad.
- Los resultados de benchmarks estan marcados como no verificados (`verified: false`); conviene reproducirlos antes de usarlos en produccion.
- No dispone de mecanismos de calibracion de incertidumbre ni de deteccion de clases desconocidas.
- No es un modelo linguistico: no procesa texto, no soporta instrucciones ni razonamiento, y no debe presentarse como tal.
- Licencia MIT permite uso comercial y modificacion, pero se recomienda citar el paper original de ReCon y el paquete torch-pointcloud segun indica la model card.
- La fecha de creacion del repo (2026-10-30) y el bajo numero de descargas (22) sugieren un ecosistema joven; puede haber cambios de API en torch-pointcloud.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/recon.modelnet40-8k.zekun-qi
- Paper ReCon (ICML 2023): https://arxiv.org/abs/2302.02318
- Repositorio original ReCon: https://github.com/qizekun/ReCon
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Dataset ModelNet40 (paper 3D ShapeNets): https://arxiv.org/abs/1406.5670
