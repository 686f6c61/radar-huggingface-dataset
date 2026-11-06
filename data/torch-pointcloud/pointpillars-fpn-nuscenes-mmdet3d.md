# torch-pointcloud/pointpillars-fpn.nuscenes.mmdet3d

## Resumen

PointPillars es un detector de objetos 3D para nubes de puntos LiDAR que codifica la nube en una representacion de "pilares" verticales (pillars) y aplica una red convolucional 2D sobre el mapa disperso resultante. Este checkpoint concreto, `pointpillars-fpn.nuscenes.mmdet3d`, es una conversion al formato de la libreria `torch-pointcloud` del modelo originalmente implementado en MMDetection3D, entrenado sobre el dataset nuScenes para deteccion de 10 clases de objetos propios de la conduccion autonoma.

El modelo es relevante como referencia ligera y rapida para deteccion 3D en tiempo real: con solo 6,1 millones de parametros y una arquitectura puramente convolucional 2D tras la codificacion de pilares, es adecuado para prototipado, extraccion de caracteristicas y pipelines donde el coste computacional importa mas que la precision maxima del estado del arte. Declara un mAP de 40,17 y un NDS de 52,98 sobre nuScenes.

No es un modelo de lenguaje ni un transformer generativo: es un detector 3D de vision por computador sobre nubes de puntos. Su interes para desarrolladores e investigadores radica en su licencia Apache-2.0, su integracion con `torch-pointcloud` y la disponibilidad de pesos en safetensors, lo que facilita su uso como baseline reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointPillars (codificador de pilares + backbone convolucional 2D, variante FPN) |
| Parametros totales | 6.155.560 (6,1 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision sobre nubes de puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

Otros datos tecnicos declarados en la model card: canales de entrada 4, 10 clases de salida, 256 caracteristicas por pilar, entrenado sobre nuScenes, convertido desde open-mmlab/mmdetection3d, libreria `torch-pointcloud`.

## Arquitectura y entrenamiento

PointPillars organiza la nube de puntos LiDAR en una rejilla de pilares verticales sobre el plano XY y, para cada pilar, aprende una representacion densa mediante una red de tipo PointNet simplificada. Esa representacion se proyecta a un tensor 2D disperso sobre el que se aplica un backbone convolucional 2D (en esta variante con FPN) y una cabeza de deteccion que predice cajas 3D con orientacion. La innovacion principal del metodo original es evitar operaciones 3D costosas (voxelizacion 3D o convoluciones 3D) y reducir la deteccion a un problema 2D sobre el mapa de pilares, lo que se traduce en latencias muy bajas en GPU.

El checkpoint esta entrenado sobre nuScenes, un dataset multimodal de conduccion autonoma con 10 clases de objetos anotados y escenas de varias ciudades. La model card no detalla el numero de tokens, la composicion exacta del dataset, ni si se aplicaron tecnicas de aumento de datos o ajuste fino especificas; esos datos no estan disponibles. Tampoco se documenta el proceso de conversion desde MMDetection3D mas alla de indicar el repositorio de origen.

## Capacidades

- Deteccion de objetos 3D en nubes de puntos LiDAR con cajas orientadas (10 clases de nuScenes).
- Codificacion de nubes de puntos en pilares y extraccion de caracteristicas de 256 canales por pilar mediante `forward_features`.
- Prediccion de cajas 3D con posicion, dimensiones y orientacion (yaw) sobre el plano del suelo.
- Integracion nativa con la libreria `torch-pointcloud` mediante `tp.create_model` y la funcion `collate`.
- Soporte de inferencia por lotes a traves del tensor `batch` de indices de pilar.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades linguisticas o multimodales de texto.
- No dispone de modo "thinking", vision RGB, audio ni funciones generativas.

## Casos de uso

- Deteccion de vehiculos y peatones en tiempo real para prototipos de conduccion autonoma: el modelo procesa nubes LiDAR y devuelve cajas 3D con orientacion, adecuado para validar pipelines de percepcion antes de pasar a detectores mas pesados.
- Baseline reproducible en investigacion: al estar convertido desde MMDetection3D y tener licencia Apache-2.0, sirve como referencia para comparar nuevas propuestas de deteccion 3D con un coste de entrenamiento e inferencia bajo.
- Extraccion de caracteristicas de nubes de puntos: `forward_features` devuelve un tensor de 256 canales por pilar que puede reutilizarse como entrada para cabezas personalizadas, clasificadores de escena o modelos de segmentacion.
- Sistemas de alerta en robots moviles o AGV: con 6,1 M de parametros puede desplegarse en GPUs de gama media embebidas para detectar obstaculos en el entorno cercano.
- Anotacion asistida de datos LiDAR: el modelo puede preetiquetar cajas 3D en nuevas capturas para que un humano las revise, acelerando la creacion de datasets propios.
- Educacion y docencia en vision 3D: la simplicidad de la arquitectura y la API de `torch-pointcloud` permiten explicar el flujo completo de voxelizacion en pilares, backbone 2D y cabeza de deteccion en un cuaderno interactivo.
- Benchmarking de hardware y runtimes: su tamano reducido lo hace util para medir latencia y throughput de frameworks de inferencia sobre nubes de puntos en distintas GPUs.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| nuScenes | 3d-object-detection | mAP | 40,17 |
| nuScenes | 3d-object-detection | NDS | 52,98 |

No se han publicado en la informacion disponible otros resultados de benchmarks (por ejemplo desgloses por clase, metricas de velocidad ni comparaciones oficiales con otros detectores).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 6,1 M de parametros y pesos en safetensors, el modelo es muy ligero; la memoria dominante sera la de los tensores intermedios del mapa de pilares y del backbone 2D, no los pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA y suficiente memoria para el tensor de pilares; el modelo esta pensado para ejecutarse en GPUs de escritorio y de centro de datos. No se especifican modelos concretos (A100, H100, RTX 4090) en la documentacion.
- Cabe en GPU de consumo: previsiblemente si, dado el reducido numero de parametros, aunque no se aportan cifras oficiales de VRAM.
- Opciones de despliegue: la via documentada es la libreria `torch-pointcloud` con PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros detectores 3D comparables (por ejemplo CenterPoint, SECOND, VoxelNet o variantes de PointPillars en otros frameworks) con sus parametros, contexto, rendimiento y licencia. Por tanto, la comparativa se indica como no disponible.

| Modelo | Parametros | Contexto | mAP nuScenes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pointpillars-fpn.nuscenes.mmdet3d | 6,1 M | no aplica | 40,17 | Apache-2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de vision 3D: no procesa texto ni mantiene conversaciones; no debe evaluarse con criterios de modelos de lenguaje.
- Los resultados de mAP y NDS estan declarados por el autor y marcados como no verificados; conviene reproducirlos antes de usarlos como referencia en publicaciones.
- La model card no detalla sesgos del dataset nuScenes ni la distribucion de clases; los sesgos inherentes al dataset (geografia, condiciones meteorologicas, tipo de escenas) se trasladaran al modelo.
- Riesgo de falsos negativos y positivos en objetos poco representados o a distancias largas, propio de la codificacion en pilares y de la resolucion del mapa 2D.
- No se documentan limitaciones de idioma porque el modelo no es linguistico.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion; no obstante, el dataset nuScenes tiene sus propias condiciones de uso que deben respetarse al reentrenar o redistribuir derivados.
- La fecha de creacion indicada (2026-10-30) y el DOI de la libreria sugieren un empaquetado reciente; la madurez y el mantenimiento de la integracion `torch-pointcloud` deben validarse en el entorno de produccion.
- No se aportan datos de cuantizacion ni de optimizacion para despliegue en hardware embebido, por lo que el rendimiento real en produccion debe medirse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointpillars-fpn.nuscenes.mmdet3d
- Paper PointPillars: https://arxiv.org/abs/1812.05784
- Repositorio MMDetection3D (origen de la conversion): https://github.com/open-mmlab/mmdetection3d
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la libreria: https://doi.org/10.5281/zenodo.22159632
- Dataset nuScenes: https://www.nuscenes.org/
