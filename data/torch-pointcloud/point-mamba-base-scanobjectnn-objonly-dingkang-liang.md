# torch-pointcloud/point-mamba-base.scanobjectnn-objonly.dingkang-liang

## Resumen

Point-Mamba base es un modelo de clasificación de nubes de puntos 3D desarrollado por Dingkang Liang y colaboradores (publicado en NeurIPS 2024) y distribuido en HuggingFace por la organización `torch-pointcloud`. Se trata de un modelo de espacio de estados (SSM, familia Mamba) que opera sobre puntos serializados, en lugar de las arquitecturas basadas en transformers o en convoluciones típicas del análisis de nubes de puntos. Con 12.293.647 parámetros (12,3 M) y 384 características por punto, es un modelo compacto orientado a una tarea concreta: asignar una de 15 clases a una nube de puntos.

El checkpoint concreto de esta ficha es un ajuste fino (fine-tune) del modelo preentrenado `point-mamba-base.pretrain.dingkang-liang` sobre el subconjunto OBJ_ONLY del dataset ScanObjectNN, un benchmark de clasificación de objetos 3D escaneados en condiciones reales. Según los resultados declarados por el autor, alcanza un OA (overall accuracy) de 92,6 y un mAcc (mean accuracy) de 92,4 en dicho subconjunto.

Su relevancia actual es doble: por un lado, demuestra que los modelos de espacio de estados, que han ganado protagonismo en el procesamiento de secuencias, son competitivos en visión 3D con un coste computacional bajo; por otro, está empaquetado para la librería `torch-pointcloud`, lo que facilita su uso como extractor de características o como base para ajuste fino en otras tareas de nubes de puntos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointMamba (modelo de espacio de estados, SSM, sobre puntos serializados) |
| Parametros totales | 12.293.647 (12,3 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el ejemplo de uso de la model card emplea nubes de 8192 puntos |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision 3D; no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato PyTorch, libreria torch-pointcloud) |
| Numero de clases | 15 |
| Dimension de caracteristicas | 384 |
| Dataset de ajuste | ScanObjectNN (OBJ_ONLY) |
| Modelo base | torch-pointcloud/point-mamba-base.pretrain.dingkang-liang |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

PointMamba es un modelo de espacio de estados aplicado a nubes de puntos. La idea central, según el paper que lo respalda (arXiv:2402.10739), es serializar la nube de puntos en una secuencia y procesarla con un bloque SSM de tipo Mamba, evitando los mecanismos de atención cuadráticos propios de los transformers de visión 3D. El modelo base del que deriva este checkpoint fue preentrenado y después ajustado sobre la tarea de clasificación de ScanObjectNN en su variante OBJ_ONLY, es decir, empleando únicamente los objetos sin el fondo de la escena. Los detalles concretos del esquema de serialización, del número de tokens de entrenamiento, de la composición del dataset y de si se aplicaron técnicas de optimización posteriores (RLHF, DPO u otras) no están disponibles en la información proporcionada.

Una innovación destacable es la propia elección de un SSM en lugar de un transformer: reduce el coste computacional y el número de parámetros necesarios para una tarea de clasificación de objetos 3D. El checkpoint ha sido convertido desde el repositorio original de referencia `LMD0311/PointMamba` (licencia Apache-2.0) para ser compatible con la librería `torch-pointcloud` de Arthur Dujardin. La model card advierte de que los kernels de `mamba-ssm` son exclusivos de GPU, por lo que la inferencia en CPU no está soportada tal cual.

## Capacidades

- Clasificacion de nubes de puntos 3D: asigna una de 15 clases a una nube de puntos de entrada.
- Extraccion de caracteristicas: expone `forward_features` y permite obtener embeddings de 384 dimensiones por nube mediante `reset_classifier(num_classes=0)`.
- Procesamiento de nubes de gran tamano: el ejemplo oficial maneja 8192 puntos por muestra.
- Reutilizacion como backbone: al ser un ajuste fino de un modelo preentrenado, puede servir de punto de partida para otras tareas de nubes de puntos.
- Soporte de tool calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica (modelo puramente geometrico, sin entrada ni salida de texto).
- Capacidades especiales: no se documentan modos de vision adicionales, audio ni thinking mode.

## Casos de uso

- Clasificacion de objetos en robotica movil: un robot equipado con LiDAR o camara de profundidad puede segmentar objetos de su entorno y usar el modelo para etiquetarlos antes de manipularlos, gracias a su bajo coste de inferencia (12,3 M de parametros).
- Inventario y logistica en almacenes: escaneo de bultos o palets con sensores 3D para clasificarlos automaticamente por categoria, integrando el modelo en un pipeline de captura y clasificacion en tiempo casi real.
- Preprocesado para conduccion autonoma: etiquetado de objetos escaneados (vehiculos, mobiliario urbano, peatones) como paso previo a modulos de deteccion o segmentacion de mayor complejidad.
- Digitalizacion de patrimonio y escaneo 3D: clasificacion automatica de fragmentos u objetos escaneados en campanas de fotogrametria, reduciendo el trabajo manual de catalogacion.
- Extraccion de embeddings para busqueda de similitud 3D: usando las caracteristicas de 384 dimensiones, construir un indice vectorial que permita recuperar objetos geometricamente similares en catalogos de modelos 3D.
- Control de calidad en fabricacion: clasificacion de piezas escaneadas en linea de produccion para detectar piezas que no correspondan a la categoria esperada.
- Inicializacion de modelos downstream: servir como backbone preentrenado y ajustarlo despues para tareas de segmentacion semantica o deteccion de partes en nubes de puntos.
- Realidad aumentada e interiorismo: reconocimiento de la categoria de muebles y objetos presentes en una habitacion escaneada con un dispositivo movil, para anclajes virtuales o recomendacion de producto.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Clasificacion de nubes de puntos | ScanObjectNN (OBJ_ONLY) | OA (accuracy) | 92,6 | No |
| Clasificacion de nubes de puntos | ScanObjectNN (OBJ_ONLY) | mAcc (accuracy) | 92,4 | No |

La model card indica un valor de referencia de 92,60 para OA. No se han publicado en la informacion disponible resultados de otros benchmarks (por ejemplo ModelNet40) para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los 12,3 M de parametros, los pesos ocupan aproximadamente 49 MB en fp32 y unos 25 MB en fp16; el grueso del consumo proviene de las activaciones de la nube (8192 puntos por muestra), que se mantiene en el orden de cientos de MB segun el tamano de lote.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA moderno; no se requiere una A100 o H100 para esta tarea. Una RTX 3060, RTX 4090 o una T4 son suficientes.
- Cabe en GPU de consumo: si, con margen amplio, dado el reducido numero de parametros.
- Restriccion importante: los kernels de `mamba-ssm` requieren compilacion especifica para la version de PyTorch y CUDA, y la model card indica que son exclusivos de GPU; la inferencia en CPU no esta soportada tal cual.
- Opciones de despliegue: libreria `torch-pointcloud` (`pip install torch-pointcloud`) junto con `mamba-ssm`. No aplican vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a categoria y disponibilidad.

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Point-Mamba base (este checkpoint) | SSM sobre puntos serializados | 12,3 M | no disponible | Apache-2.0 | HuggingFace (torch-pointcloud) |
| Point-Mamba base pretrain | SSM sobre puntos serializados | no disponible | no disponible | Apache-2.0 | HuggingFace (torch-pointcloud) |
| PointMamba original (LMD0311/PointMamba) | SSM sobre puntos serializados | no disponible | no disponible | Apache-2.0 | GitHub |
| Point-MAE | Transformer enmascarado para nubes de puntos | no disponible | no disponible | no disponible | repositorio publico |
| Point-BERT | Transformer con tokenizacion de puntos | no disponible | no disponible | no disponible | repositorio publico |
| DGCNN | Red convolucional sobre grafos dinamicos | no disponible | no disponible | no disponible | repositorio publico |

Los valores de precision de las alternativas sobre ScanObjectNN (OBJ_ONLY) no estan disponibles en la informacion proporcionada y no se incluyen para no introducir datos no verificados.

## Limitaciones y advertencias

- Modelo de tarea unica: solo clasifica nubes de puntos en 15 clases; no genera texto, no razona y no admite instrucciones en lenguaje natural.
- Sesgos del dataset: entrenado sobre ScanObjectNN (OBJ_ONLY), un benchmark de escenas interiores escaneadas; el rendimiento fuera de esa distribucion (exteriores, objetos industriales, sensores distintos) no esta caracterizado.
- Resultados no verificados: las metricas OA 92,6 y mAcc 92,4 proceden del model-index declarado por el autor y figuran como no verificadas.
- Ausencia de variante OBJ_BG: este checkpoint se ajusta solo sobre objetos sin fondo, por lo que su robustez frente a ruido de escena no esta cubierta.
- Riesgo de error en clases proximas: al operar sobre 15 clases, la confusion entre categorias geometricamente parecidas es un riesgo inherente; no se publican matrices de confusion en la informacion disponible.
- Dependencia de `mamba-ssm`: la instalacion exige compilar kernels compatibles con la version de PyTorch y CUDA, lo que complica la reproducibilidad en entornos heterogeneos y bloquea la inferencia en CPU.
- Limitaciones de idioma y contexto: no aplican idiomas; respecto al contexto, el numero maximo de puntos soportado no esta documentado, solo el ejemplo de 8192 puntos.
- Licencia: Apache-2.0 permite uso comercial, pero conviene conservar los avisos de atribucion del proyecto original PointMamba y de la conversion a `torch-pointcloud`.
- Adopcion muy baja: el repositorio registra 0 descargas y 0 likes, por lo que no existe una comunidad amplia que valide su comportamiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/point-mamba-base.scanobjectnn-objonly.dingkang-liang
- Modelo base preentrenado: https://huggingface.co/torch-pointcloud/point-mamba-base.pretrain.dingkang-liang
- Paper PointMamba: https://arxiv.org/abs/2402.10739
- Repositorio original PointMamba: https://github.com/LMD0311/PointMamba
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Guia de instalacion de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Dataset ScanObjectNN (paper, ICCV 2019): https://arxiv.org/abs/1905.07441
