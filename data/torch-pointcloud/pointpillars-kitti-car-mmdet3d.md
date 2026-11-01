# torch-pointcloud/pointpillars.kitti-car.mmdet3d

## Resumen

PointPillars es un detector de objetos 3D para nubes de puntos LiDAR que codifica la nube en un conjunto de "pilares" verticales y aplica un backbone 2D sobre esa representacion. Este checkpoint concreto, `pointpillars.kitti-car.mmdet3d`, es una conversion a la libreria `torch-pointcloud` de los pesos originales de MMDetection3D, entrenado sobre KITTI para la clase coche (una sola clase). El modelo lo publica el mantenedor de `torch-pointcloud`, Arthur Dujardin, bajo licencia Apache-2.0.

Su relevancia practica esta en el coste: con solo 4,8 millones de parametros y una arquitectura pilar + CNN 2D, es un detector 3D extremadamente ligero que puede ejecutarse en tiempo real en GPUs de consumo, algo imposible para detectores basados en voxels 3D densos o en transformers sobre puntos. Es la referencia clasica de la literatura (Lang et al., CVPR 2019) y sigue siendo una linea base habitual en pipelines de conduccion autonoma y robotica.

La ficha cubre un modelo de vision 3D, no un LLM: no hay generacion de texto, tool calling ni capacidades linguisticas. El contexto, los idiomas y las capacidades conversacionales no aplican y se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointPillars: codificador de pilares (PointNet simplificado) + backbone 2D (CNN) + cabeza de deteccion densa |
| Parametros totales | 4.820.884 (4,8 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada = nube de puntos, 8192 puntos en el ejemplo de la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada por el autor) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `torch-pointcloud`) |
| Canales de entrada | 4 (x, y, z, intensidad) |
| Clases | 1 (coche) |
| Dimension de features | 384 |
| Dataset de entrenamiento | KITTI |

## Arquitectura y entrenamiento

PointPillars divide el plano XY en una rejilla de pilares y, para cada pilar, agrega los puntos que caen en el mediante una MLP tipo PointNet que produce un vector de features por pilar. Esa representacion se proyecta como una imagen 2D pseudo-ortografica sobre la que se aplica un backbone convolucional 2D (en la implementacion de MMDetection3D, una variante de RPN con bloques de deconvolucion para recuperar resolucion). La cabeza de deteccion predice, por ancla, clase, offset y dimensiones de caja 3D, ademas de la orientacion. El modelo declara 4 canales de entrada, 384 features y una unica clase (coche).

Los pesos proceden de la conversion de los checkpoints de MMDetection3D (Apache-2.0) al formato de `torch-pointcloud`. El autor no documenta en la model card el numero de tokens/puntos de entrenamiento, la composicion exacta del split de KITTI ni si hubo aumentos de datos especificos; esa informacion no esta disponible. La innovacion tecnica central es la propia codificacion en pilares, que sustituye las convoluciones 3D dispersas por una CNN 2D, reduciendo drasticamente el coste computacional manteniendo precision competitiva en KITTI.

## Capacidades

- Deteccion de objetos 3D de la clase coche en nubes de puntos LiDAR con 4 canales (x, y, z, intensidad).
- Prediccion de cajas 3D con centro, dimensiones y orientacion (yaw) por objeto.
- Extraccion de features de 384 canales mediante `forward_features`, util para tareas aguas abajo (clasificacion de escenas, re-identificacion, segmentacion por transferencia).
- Entrada por lotes mediante `collate` sobre `pos_voxel`, con soporte de `voxel_num_points` para pilares de densidad variable.
- Inferencia en modo `eval()` con `torch.no_grad()`, apta para despliegue en produccion.
- No soporta tool calling, agentes, razonamiento multi-paso, vision 2D, audio ni capacidades multilingues.

## Casos de uso

- Deteccion de vehiculos en tiempo real para conduccion autonoma: el modelo procesa barridos LiDAR completos con 4,8 M de parametros, lo que permite integrarlo en el bucle de percepcion a frecuencias compatibles con sistemas ADAS embarcados.
- Robotica movil en exteriores: deteccion de coches y obstaculos vehiculares para planificacion de trayectorias en robots de reparto o plataformas de logistica, donde el presupuesto de computo a bordo es limitado.
- Etiquetado automatico de datos (auto-labeling): pre-anotar cajas 3D de coches en nuevos datasets LiDAR para reducir el coste de anotacion manual, usando el modelo como generador de propuestas que un humano revisa.
- Linea base en investigacion: referencia reproducible para comparar nuevos detectores 3D sobre KITTI, con pesos ya convertidos y una API de carga de una linea (`tp.create_model`).
- Extraccion de features para tareas aguas abajo: usar `forward_features` (384 canales) como codificador congelado en modelos de clasificacion de escenas o de prediccion de trayectorias.
- Simulacion y gemelos digitales: poblar entornos simulados con detecciones de vehiculos a partir de nubes sinteticas o reales para generar escenarios de entrenamiento.
- Sistemas de conteo y monitorizacion de trafico: detectar y contar coches en secuencias LiDAR de infraestructura vial, con un coste de inferencia bajo que permite desplegar en GPUs de gama media.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| KITTI (3D object detection) | mAP | 77,61 |
| KITTI (clase Car) | AP/Car | 77,61 |

No se han publicado en la informacion disponible otros resultados (BEV AP, AP por dificultad facil/moderada/dificil, latencia o throughput) ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los 4,8 M de parametros en fp32; el cuello de botella es la nube de puntos y los mapas de features intermedios, no los pesos. Con 8192 puntos por muestra, la huella es minima.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobradas. Tambien es viable en CPU para inferencia por lotes pequenos.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante), e incluso en placas integradas con expectativas de latencia mayores.
- Opciones de despliegue: la libreria nativa `torch-pointcloud` (`pip install torch-pointcloud`); al proceder de MMDetection3D, los pesos son compatibles conceptualmente con ese ecosistema, aunque el autor solo documenta la ruta de `torch-pointcloud`. No hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI (no aplican a vision 3D).
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo se espera inferencia en el orden de milisegundos en GPU moderna, pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | KITTI Car AP | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pointpillars.kitti-car.mmdet3d (este) | 4,8 M | nube LiDAR, 4 canales | 77,61 (mAP declarado) | Apache-2.0 | HuggingFace, `torch-pointcloud` |
| PointPillars original (MMDetection3D) | ~4,8 M | nube LiDAR, 4 canales | no disponible en esta ficha | Apache-2.0 | GitHub open-mmlab |
| VoxelNet / SECOND (detectores voxel 3D) | no disponible | nube LiDAR | no disponible | varía | MMDetection3D |
| CenterPoint (detectores center-based) | no disponible | nube LiDAR | no disponible | varía | MMDetection3D |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada; solo se confirma que este checkpoint es una conversion de los pesos de MMDetection3D bajo la misma licencia Apache-2.0.

## Limitaciones y advertencias

- Entrenado exclusivamente para la clase coche en KITTI: no detecta peatones, ciclistas, camiones ni otras clases sin reentrenamiento.
- Dominio limitado: KITTI procede de entornos urbanos y de carretera en Alemania; el rendimiento puede degradarse en otros sensores, climas o densidades de puntos.
- Entrada fija de 4 canales (x, y, z, intensidad): no acepta caracteristicas adicionales (color, velocidad radial) sin modificar el modelo.
- Riesgo de falsos positivos y negativos en objetos ocluidos, lejanos o con pocos puntos; la metrica declarada (77,61 mAP) no esta verificada por un tercero.
- El autor no documenta sesgos demograficos ni de escena; al ser un detector geometrico, los sesgos relevantes son de dominio y de representatividad del dataset, no linguisticos.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion; conservar el aviso de licencia y las citas del paper original y de KITTI.
- Sin garantias de produccion: el checkpoint se publica como conversion de referencia, con 19 descargas y sin validacion externa; conviene revalidar sobre el dataset objetivo antes de desplegar.
- No es un modelo de lenguaje: no admite prompts, tool calling ni razonamiento; cualquier uso conversacional es inaplicable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/pointpillars.kitti-car.mmdet3d
- Paper PointPillars (arXiv): https://arxiv.org/abs/1812.05784
- Repositorio `torch-pointcloud`: https://github.com/arthurdjn/pytorch-pointcloud
- Repositorio MMDetection3D (origen de los pesos): https://github.com/open-mmlab/mmdetection3d
- DOI de `torch-pointcloud`: https://doi.org/10.5281/zenodo.22159632
- Dataset KITTI: https://www.cvlibs.net/datasets/kitti/
