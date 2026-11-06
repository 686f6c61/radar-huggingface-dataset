# torch-pointcloud/minkunet34-w32-spconv-amp.semantickitti.mmdet3d

## Resumen

MinkUNet34-W32-SPConv es un modelo de segmentación semántica de nubes de puntos LiDAR, no un modelo de lenguaje. Implementa una U-Net residual dispersa (sparse residual U-Net) sobre convoluciones de Minkowski, según la arquitectura descrita en el paper "4D Spatio-Temporal ConvNets: Minkowski Convolutional Neural Networks" (Choy et al., CVPR 2019). El checkpoint lo publica el proyecto torch-pointcloud (Arthur Dujardin) y se ha convertido desde la implementación de referencia de OpenMMLab en MMDetection3D, con licencia Apache-2.0.

El modelo resuelve la asignación de una clase semántica a cada punto de una escena LiDAR entre 19 categorías (carretera, vehículo, peatón, vegetación, edificio, etc.), que es la tarea estándar del dataset SemanticKITTI. Tiene 37,89 millones de parámetros, 4 canales de entrada (coordenadas XYZ más intensidad) y 96 canales de características internas. El repositorio ocupa 0,2 GB y los pesos se distribuyen en formato safetensors.

Su relevancia es práctica: ofrece un baseline reproducible y ligero para percepción 3D en conducción autónoma y robótica, integrado en el ecosistema torch-pointcloud, que permite cargarlo con una sola llamada y usarlo tanto para inferencia como para extracción de características. No es un modelo generativo ni conversacional; no tiene ventana de contexto, idiomas ni capacidad de tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MinkUNet34-W32 con convoluciones dispersas (SPConv / Minkowski), U-Net residual |
| Parametros totales | 37.892.787 (37,9 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada = nube de puntos de tamano variable) |
| Tipos de cuantizacion | no disponible (entrenado con AMP, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (no aplica; modelo de vision 3D) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (XYZ + intensidad) |
| Clases de salida | 19 (SemanticKITTI) |
| Canales de caracteristica | 96 |
| Dataset de entrenamiento | SemanticKITTI |
| Libreria | torch-pointcloud (requiere spconv) |

## Arquitectura y entrenamiento

La red es una U-Net residual de 34 capas adaptada a datos dispersos mediante convoluciones de Minkowski: en lugar de densificar el voxel grid, las convoluciones se calculan únicamente sobre las posiciones ocupadas, lo que permite procesar nubes LiDAR de decenas de miles de puntos con un coste proporcional a la ocupación. La variante W32 fija el ancho base de canales en 32, y el sufijo `amp` indica que el entrenamiento se realizó con precisión mixta automática. La entrada son 4 canales (coordenadas y intensidad) y la salida son logits por punto para 19 clases.

El checkpoint se ha convertido desde MMDetection3D (Apache-2.0) al formato de torch-pointcloud. La model card no detalla el número de épocas, la composición exacta del dataset ni si hubo aumentos de datos específicos; solo indica el dataset (SemanticKITTI) y las métricas finales. No se documenta RLHF, DPO ni ningún proceso de alineación, algo esperable en un modelo discriminativo de segmentación. La innovación técnica principal es heredada del paper de Minkowski: convolución dispersa generalizada que soporta kernels arbitrarios sobre coordenadas, base de muchas arquitecturas 3D posteriores.

## Capacidades

- Segmentación semántica por punto de nubes LiDAR en 19 clases de SemanticKITTI.
- Procesamiento de nubes dispersas de tamano variable sin densificación del voxel grid.
- Entrada multimodal a nivel de punto: coordenadas XYZ más intensidad de retorno.
- Extracción de características por punto mediante `forward_features`, con vector de 96 dimensiones por punto.
- Reutilización como backbone: `reset_classifier(num_classes=0)` para transferencia a otras tareas o datasets.
- Inferencia en GPU con kernels dispersos (spconv); no soporta CPU en la ruta documentada.
- No soporta tool calling, agentes, razonamiento multi-paso, visión 2D, audio ni generación de texto.
- No tiene capacidades multilingües ni modo thinking.

## Casos de uso

- Percepción LiDAR en conducción autónoma: segmentar cada barrido de un vehículo en carretera, vehículo, peatón, ciclista y vegetación para alimentar la pila de planificación y frenado de emergencia. El modelo es ligero (37,9 M de parámetros) y apto para inferencia por frame.
- Etiquetado semiautomático de datasets: preanotar nubes de puntos nuevas con las 19 clases de SemanticKITTI y revisar solo las regiones de baja confianza, reduciendo el coste de anotación manual.
- Robótica móvil en exteriores: clasificar el terreno circundante de un robot (carretera, acera, hierba, edificio) para navegación y evitación de obstáculos con LiDAR 3D.
- Análisis de escenas urbanas y gemelos digitales: extraer máscaras semánticas de levantamientos LiDAR para inventariar mobiliario urbano, edificios y vegetación en pipelines GIS.
- Destilación y preentrenamiento de backbones 3D: usar las características de 96 dimensiones por punto como entrada de cabezales ligeros para detección 3D o segmentación de instancias.
- Benchmarking reproducible: servir como baseline de referencia en experimentos de segmentación semántica LiDAR dentro del ecosistema torch-pointcloud y comparar contra nuevas arquitecturas con las mismas métricas (mIoU y OA).
- Filtrado previo en pipelines de mapas HD: eliminar puntos dinámicos (vehículos, peatones) antes de agregar barridos en la construcción de mapas, usando la clase predicha por punto.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| SemanticKITTI | Segmentacion semantica de nubes de puntos | mIoU | 68,57 |
| SemanticKITTI | Segmentacion semantica de nubes de puntos | OA (accuracy global) | 92,79 |

No se han publicado en la informacion disponible resultados desglosados por clase, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 37,9 M de parametros (unos 152 MB en fp32 y unos 76 MB en fp16); el consumo real depende del numero de puntos y del grafo disperso construido por spconv, no solo del peso de los parametros.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA compatible con la build de spconv instalada; tarjetas de gama media como RTX 3060 o RTX 4090 son suficientes para inferencia por frame.
- Cabe en GPU consumer: si, con margen amplio; el cuello de botella es la compilacion de kernels dispersos y el tamano de la nube, no la memoria de pesos.
- No se documenta soporte CPU: la model card indica explicitamente "GPU-only kernels".
- Opciones de despliegue: libreria torch-pointcloud con spconv compilado para la version concreta de PyTorch y CUDA; no hay integracion documentada con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | mIoU SemanticKITTI | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MinkUNet34-W32-SPConv (este) | 37,9 M | XYZ + intensidad | 19 | 68,57 | Apache-2.0 | Hugging Face (torch-pointcloud) |
| MinkUNet34 original (MMDetection3D) | ~37,9 M (misma arquitectura) | XYZ + intensidad | 19 | no disponible en esta ficha | Apache-2.0 | GitHub OpenMMLab |
| Otras arquitecturas LiDAR (Cylinder3D, SPVCNN, RangeNet++) | no disponible | no disponible | 19 | no disponible | variable | variable |

La comparativa con alternativas concretas no esta disponible en la informacion proporcionada; solo se confirma que el checkpoint deriva de la implementacion de MMDetection3D.

## Limitaciones y advertencias

- Modelo especializado: solo segmenta nubes de puntos LiDAR; no genera texto, no razona y no responde a instrucciones.
- Dominio cerrado: entrenado exclusivamente en SemanticKITTI (escenas de conduccion en Alemania); el rendimiento puede degradarse en otros sensores, densidades, climas o entornos interiores.
- Las metricas (mIoU 68,57, OA 92,79) estan declaradas por el autor y marcadas como no verificadas; conviene reproducirlas antes de usarlas como referencia en produccion.
- Dependencia fragil: requiere spconv compilado contra la version exacta de PyTorch y CUDA; una actualizacion de cualquiera de las dos rompe la instalacion.
- Solo GPU: no hay ruta CPU documentada, lo que limita el despliegue en entornos sin NVIDIA.
- Riesgo de clases minoritarias: en segmentacion LiDAR las clases poco frecuentes (motocicleta, persona sentada, etc.) suelen tener IoU bajo; la model card no publica el desglose por clase.
- Licencia Apache-2.0 permite uso comercial y modificacion, pero el modelo se apoya en spconv y en el codigo de torch-pointcloud, cuyas licencias deben revisarse por separado.
- No hay informacion sobre sesgos, calibracion de incertidumbre ni robustez ante condiciones adversas (lluvia, nieve, oclusiones).

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/minkunet34-w32-spconv-amp.semantickitti.mmdet3d
- Paper de Minkowski Convolutional Neural Networks: https://arxiv.org/abs/1904.08755
- Repositorio torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentacion de instalacion de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- OpenMMLab MMDetection3D (origen de la conversion): https://github.com/open-mmlab/mmdetection3d
- Dataset SemanticKITTI: http://semantic-kitti.org/
