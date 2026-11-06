# torch-pointcloud/recon.scanobjectnn-objbg.zekun-qi

## Resumen

ReCon (scanobjectnn-objbg) es un modelo de clasificación de nubes de puntos 3D desarrollado originalmente por Zekun Qi y colaboradores (Universidad de Pekín, Shanghai AI Laboratory y otras instituciones) y publicado en ICML 2023. Esta variante concreta ha sido convertida al ecosistema `torch-pointcloud` por el usuario `torch-pointcloud` y publicada en Hugging Face como checkpoint afinado sobre el subconjunto OBJ_BG del benchmark ScanObjectNN.

El modelo resuelve la tarea de clasificación de objetos 3D a partir de nubes de puntos sin color, asignando cada muestra a una de 15 categorías. Su arquitectura es un transformer de puntos con enmascaramiento (masked point transformer) que combina aprendizaje contrastivo con reconstrucción generativa, una innovación que busca aprovechar las representaciones aprendidas por modelos generativos previos para mejorar el rendimiento en tareas discriminativas.

Con 43,6 millones de parámetros, un vector de características de 1536 dimensiones y un tamaño de repositorio de 0,2 GB, es un modelo compacto y ligero, adecuado para inferencia en entornos con recursos limitados. Su relevancia actual radica en que ofrece un checkpoint listo para usar dentro de una librería unificada de PyTorch para nubes de puntos, con licencia MIT y métricas declaradas de 95,18 % de precisión global (OA) y 94,48 % de precisión media por clase (mAcc) sobre ScanObjectNN OBJ_BG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Masked point transformer con consultas contrastivas multimodales (ReCon) |
| Parametros totales | 43.573.519 (43,6 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de nubes de puntos; entrada de 8192 puntos en el ejemplo de uso) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Clases de salida | 15 |
| Dimension del vector de caracteristicas | 1536 |
| Dataset de evaluacion | ScanObjectNN (OBJ_BG) |
| Libreria | torch-pointcloud |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ReCon, presentada en el articulo "Contrast with Reconstruct: Contrastive 3D Representation Learning Guided by Generative Pretraining" (Qi et al., ICML 2023). Se trata de un transformer de puntos con enmascaramiento que integra dos objetivos de aprendizaje: por un lado, un objetivo contrastivo que alinea las representaciones de la nube de puntos con las de un modelo generativo preentrenado (el modelo base `torch-pointcloud/recon.pretrain.zekun-qi`); por otro, un objetivo de reconstruccion que obliga al modelo a recuperar las partes enmascaradas de la nube de puntos. Esta combinacion busca mitigar la brecha entre el preentrenamiento generativo y las tareas discriminativas posteriores.

El checkpoint publicado corresponde a un ajuste fino (finetune) sobre el subconjunto OBJ_BG de ScanObjectNN, un benchmark de clasificacion de objetos 3D en escenas reales con oclusion y ruido. El modelo procesa nubes de puntos con coordenadas 3D (`pos`) y produce logits sobre 15 clases. No se dispone de informacion detallada sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, ya que estos datos no aparecen en la informacion proporcionada.

## Capacidades

- Clasificacion de nubes de puntos 3D en 15 categorias de objetos.
- Extraccion de caracteristicas (embeddings) de 1536 dimensiones mediante `forward_features` o reemplazando el clasificador por una capa identidad.
- Procesamiento de nubes de puntos de gran tamano (el ejemplo de uso emplea 8192 puntos por muestra).
- Inferencia por lotes con gestion de indices de batch (`data["batch"]`).
- Integracion con la libreria `torch-pointcloud` mediante `tp.create_model` con carga de pesos preentrenados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo linguistico).
- No dispone de capacidades multilingues, de vision 2D, audio ni modo de razonamiento explicito.

## Casos de uso

- Clasificacion de objetos en escaneos 3D: el modelo recibe una nube de puntos de un escaneo real y asigna una de las 15 clases de ScanObjectNN, util para inventariado automatico en entornos de robotica movil.
- Preprocesamiento en pipelines de percepcion robotica: sirve como etapa de reconocimiento de objetos antes de la manipulacion, aprovechando su bajo coste computacional (43,6 M de parametros) para ejecucion en el borde.
- Extraccion de embeddings para busqueda por similitud: usando `forward_features` se obtienen vectores de 1536 dimensiones que pueden indexarse en una base vectorial para recuperacion de objetos 3D similares.
- Etiquetado automatico de datasets 3D: el modelo puede preanotar grandes colecciones de nubes de puntos y reducir el trabajo manual de anotacion en proyectos de vision 3D.
- Transfer learning a dominios especificos: al ser un checkpoint afinado con licencia MIT, puede reentrenarse con `reset_classifier` para nuevas categorias en dominios como logistica, construccion o inspeccion industrial.
- Benchmarking y reproducibilidad en investigacion: sirve como linea base reproducible sobre ScanObjectNN OBJ_BG dentro de la libreria `torch-pointcloud`, facilitando comparaciones con otros metodos de clasificacion de nubes de puntos.
- Deteccion de anomalias en inventario 3D: comparando las predicciones del modelo con la categoria esperada de cada objeto escaneado, puede señalarse discrepancias en almacenes o lineas de produccion.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| ScanObjectNN (OBJ_BG) | Clasificacion de nubes de puntos | OA (accuracy) | 95,18 |
| ScanObjectNN (OBJ_BG) | Clasificacion de nubes de puntos | mAcc (accuracy) | 94,48 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos sobre el mismo benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con pesos en FP32 (43,6 M de parametros, aproximadamente 175 MB de pesos) mas el coste de activaciones para lotes de 8192 puntos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una NVIDIA RTX 3060, RTX 4090, A100 o H100 son mas que suficientes. Tambien puede ejecutarse en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: la libreria `torch-pointcloud` (PyTorch) es la via oficial; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientadas a modelos linguisticos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros modelos sobre ScanObjectNN OBJ_BG que permitan una comparacion rigurosa de parametros, contexto, rendimiento y licencia. Se indica por tanto "no disponible". Como referencia contextual, el articulo original de ReCon reporta comparaciones con Point-MAE, Point-BERT y otros metodos de aprendizaje autosupervisado en 3D, pero esos datos no forman parte de la informacion facilitada y no se reproducen aqui.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificacion de nubes de puntos; no genera texto, codigo ni imagenes.
- Entrenado y evaluado sobre ScanObjectNN OBJ_BG, un dataset con 15 clases; su generalizacion a otras categorias o dominios requiere reentrenamiento.
- Las metricas declaradas (OA 95,18, mAcc 94,48) no estan verificadas de forma independiente (`verified: false` en el model-index).
- No se documentan sesgos especificos, pero al derivar de un dataset academico de escenas reales puede heredar desequilibrios de clase y sesgos de captura del sensor.
- Riesgo de degradacion ante nubes de puntos con ruido, oclusion severa o densidades muy distintas a las del entrenamiento.
- La licencia MIT permite uso comercial, pero se recomienda revisar las condiciones del modelo base y del dataset ScanObjectNN para usos derivados.
- No se dispone de informacion sobre cuantizacion, por lo que el despliegue en precision reducida (FP16, INT8) no esta documentado oficialmente.
- El ejemplo de uso emplea 8192 puntos; entradas con un numero muy distinto de puntos pueden requerir remuestreo previo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/recon.scanobjectnn-objbg.zekun-qi
- Modelo base (preentrenamiento): https://huggingface.co/torch-pointcloud/recon.pretrain.zekun-qi
- Paper ReCon (arXiv): https://arxiv.org/abs/2302.02318
- Repositorio original ReCon: https://github.com/qizekun/ReCon
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Paper ScanObjectNN (ICCV 2019): https://arxiv.org/abs/1908.00661 (referencia de la cita incluida en la model card)
