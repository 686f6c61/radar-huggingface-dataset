# torch-pointcloud/second.kitti-car.mmdet3d

## Resumen

`second.kitti-car.mmdet3d` es un checkpoint de deteccion de objetos 3D sobre nubes de puntos LiDAR, basado en la arquitectura SECOND (Sparsely Embedded Convolutional Detection) publicada por Yan, Mao y Li en 2018 en la revista *Sensors*. El modelo ha sido convertido desde el zoo de MMDetection3D y empaquetado por el autor Arthur Dujardin para la libreria `torch-pointcloud`, con pesos en formato safetensors y licencia Apache-2.0. Detecta una unica clase, `Car`, a partir de entradas LiDAR de 4 canales (coordenadas XYZ mas intensidad).

Con 5,3 millones de parametros, es un modelo muy ligero orientado a inferencia en tiempo real sobre GPU, no a un LLM ni a un modelo multimodal. Su relevancia practica esta en que ofrece un baseline de deteccion 3D de coches ya entrenado sobre KITTI, reproducible con una API de alto nivel (`tp.create_model`) y exportable como extractor de caracteristicas de 512 canales. Resulta util para prototipado rapido de pipelines de percepcion autonoma, para comparar arquitecturas de convolucion dispersa y como punto de partida para fine-tuning en dominios propios.

No es un modelo generativo: no procesa texto ni imagenes RGB de forma nativa, y su "contexto" no aplica en el sentido de ventana de tokens. La ficha siguiente adapta por tanto las secciones obligatorias a la naturaleza real del modelo (deteccion 3D sobre nubes de puntos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SECOND (sparse convolutional voxel detector, backbone con convoluciones 3D dispersas) |
| Parametros totales | 5.305.812 (5,3 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de deteccion 3D, no secuencial) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision de entrenamiento) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (x, y, z, intensidad) |
| Clases | 1 (`Car`) |
| Dimension de features | 512 |
| Dataset de entrenamiento | KITTI |
| Hardware requerido | GPU con kernels `spconv` compatibles con la version de torch y CUDA |

## Arquitectura y entrenamiento

SECOND es un detector 3D de una etapa que voxeliza la nube de puntos LiDAR y aplica una red de convolucion 3D dispersa (sparse convolution) sobre los voxeles ocupados, evitando el coste computacional de las convoluciones densas en el espacio vacio. El backbone genera un mapa de caracteristicas de 512 canales que alimenta una cabeza de deteccion que regresiona cajas 3D (centro, dimensiones, orientacion) y su clase. El checkpoint esta configurado para una sola clase, `Car`, con entrada de 4 canales.

El entrenamiento se realizo sobre el dataset KITTI, el benchmark de referencia para percepcion en conduccion autonoma (Geiger et al., CVPR 2012). La model card no detalla el numero de tokens ni de iteraciones, la composicion exacta del split, ni si se aplicaron tecnicas de aumento de datos o refinamiento posteriores; esa informacion no esta disponible. El checkpoint procede de la conversion de los pesos originales de MMDetection3D al formato de `torch-pointcloud`, por lo que la receta de entrenamiento subyacente es la del zoo oficial de MMDetection3D.

La innovacion tecnica principal del paper original es el uso de sparse convolution con una regla de generacion de indices optimizada, que permite procesar nubes de puntos de forma eficiente en GPU. La implementacion practica depende de la libreria `spconv`, que requiere compilacion especifica contra la version de PyTorch y CUDA del entorno.

## Capacidades

- Deteccion de coches en nubes de puntos LiDAR 3D, devolviendo cajas delimitadoras orientadas.
- Procesamiento de nubes de puntos con coordenadas XYZ e intensidad (4 canales de entrada).
- Voxelizacion y transformacion de muestras mediante el pipeline de `info["transform"]` que expone la libreria.
- Extraccion de caracteristicas densas de 512 canales por voxel a traves de `model.forward_features(...)`, reutilizables como embedding para tareas posteriores.
- Inferencia por lotes (`collate` con `batch_from="pos_voxel"`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No soporta vision RGB, audio ni modalidades distintas de la nube de puntos.
- Capacidades multilingues: no aplica.

## Casos de uso

- Prototipado de percepcion para conduccion autonoma: el modelo detecta coches a partir de LiDAR en KITTI y sirve como baseline funcional para validar un pipeline completo de voxelizacion, inferencia y post-proceso antes de invertir en arquitecturas mas pesadas.
- Extraccion de caracteristicas para modelos downstream: `forward_features` devuelve 512 canales por voxel, utiles para entrenar clasificadores, segmentadores o modelos de prediccion de trayectorias sobre representaciones preentrenadas.
- Fine-tuning en dominios propios: al ser un checkpoint ligero (5,3 M de parametros) con licencia Apache-2.0, se puede reentrenar con datos de un sensor o entorno concreto (por ejemplo, LiDAR de robot de almacen o vehiculo industrial) partiendo de pesos ya ajustados a KITTI.
- Benchmarking interno de arquitecturas de convolucion dispersa: sirve como referencia reproducible para comparar latencia y mAP frente a alternativas como PointPillars o CenterPoint en el mismo hardware.
- Docencia y formacion: la API de alto nivel de `torch-pointcloud` y el tamano reducido del modelo permiten ejecutar ejemplos completos de deteccion 3D en un portatil con GPU consumer, algo inviable con detectores 3D de gran escala.
- Pre-etiquetado semiautomatico de datos LiDAR: usar el modelo para generar cajas candidatas de coches sobre nuevas grabaciones y revisarlas manualmente, acelerando la anotacion de datasets propios.
- Integracion en simulacion y robotica: al ser GPU-only y de baja latencia por su tamano, encaja en bucles de simulacion donde se necesita deteccion 3D rapida con precision moderada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, campo `verified: false`):

| Metrica | Dataset | Valor | Verificado |
|---|---|---|---|
| mAP | KITTI | 78,21 | No |
| AP/Car | KITTI | 78,21 | No |

No se han publicado en la informacion disponible otros resultados (BEV AP, 3D AP desglosado por dificultad, latencia o throughput). No se aportan numeros adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamano del modelo (5,3 M de parametros, aproximadamente 21 MB en fp32 solo de pesos); el consumo dominante proviene de los buffers de voxelizacion y del grid disperso, no de los pesos.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA compatible con la build de `spconv`; el modelo esta pensado para ejecutarse en GPU (`model.cuda().eval()`, kernels GPU-only).
- Cabe en GPU consumer: si, practicamente en cualquier GPU NVIDIA consumer moderna (serie GTX 10xx en adelante, RTX 20xx/30xx/40xx), siempre que se compile `spconv` para la version de CUDA correspondiente.
- Opciones de despliegue: la libreria `torch-pointcloud` con `spconv`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. El checkpoint original es compatible con el ecosistema MMDetection3D.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependen criticamente de la resolucion de voxel, del numero de puntos por muestra y de la build de `spconv`.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Dataset | mAP declarado | Licencia |
|---|---|---|---|---|---|---|
| second.kitti-car.mmdet3d | 5,3 M | LiDAR 4 canales | 1 (Car) | KITTI | 78,21 (no verificado) | Apache-2.0 |
| PointPillars (MMDetection3D) | no disponible | LiDAR | multi-clase en configuracion estandar | KITTI | no disponible | Apache-2.0 |
| CenterPoint (MMDetection3D) | no disponible | LiDAR | multi-clase en configuracion estandar | KITTI / nuScenes | no disponible | Apache-2.0 |

No se dispone de cifras comparativas verificadas en la informacion proporcionada para PointPillars ni CenterPoint en la misma metrica y split; la comparativa se limita por tanto a la naturaleza arquitectonica y a la licencia. SECOND destaca por su simplicidad y bajo numero de parametros frente a detectores 3D mas recientes, a costa de menor precision y de estar restringido a una unica clase en este checkpoint.

## Limitaciones y advertencias

- Una sola clase: el checkpoint solo detecta `Car`; no detecta peatones, ciclistas, camiones ni senalizacion.
- Entrenado exclusivamente en KITTI: el dominio (LiDAR de un sensor concreto, entorno de conduccion alemana) puede no generalizar a otros sensores, densidades de puntos o escenarios (interiores, robots, drones).
- Metrica no verificada: el mAP de 78,21 esta marcado como `verified: false` en la model card; no se especifica split, dificultad ni umbral IoU, por lo que no es directamente comparable con cifras publicadas en el benchmark oficial de KITTI.
- Dependencia fragil de `spconv`: requiere compilar la libreria contra la version exacta de PyTorch y CUDA, lo que complica la reproducibilidad y el despliegue en entornos gestionados.
- Solo GPU: los kernels son GPU-only; no hay ruta CPU documentada.
- Riesgo de falsos negativos en objetos ocluidos o lejanos, inherente a los detectores de una etapa con voxelizacion fija.
- Sin informacion sobre sesgos: la model card no documenta analisis de sesgo por condiciones meteorologicas, hora del dia o densidad de trafico.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero se debe conservar el aviso de licencia y la atribucion correspondiente a los autores originales de SECOND y de MMDetection3D.
- No apto para produccion safety-critical sin validacion extensa en el dominio objetivo: es un baseline de investigacion, no un sistema certificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/second.kitti-car.mmdet3d
- Paper SECOND: https://www.mdpi.com/1424-8220/18/10/3337
- Repositorio MMDetection3D (origen de los pesos): https://github.com/open-mmlab/mmdetection3d
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Guia de instalacion de torch-pointcloud (incluye `spconv`): https://pytorch-pointcloud.org/latest/installation/
- Dataset KITTI (paper CVPR 2012): Geiger, Lenz, Urtasun, *Are we ready for Autonomous Driving? The KITTI Vision Benchmark Suite*
