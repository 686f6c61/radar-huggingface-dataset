# torch-pointcloud/pointpillars.kitti.mmdet3d

## Resumen

PointPillars es un detector de objetos 3D para nubes de puntos LiDAR que codifica la nube en un conjunto de "pilares" verticales (columnas en el plano XY) y aplica una red 2D sobre esa representacion. Este checkpoint concreto, `torch-pointcloud/pointpillars.kitti.mmdet3d`, es la conversion a la libreria PyTorch PointCloud del modelo original de MMDetection3D, entrenado sobre el dataset KITTI para detectar tres clases: coche, peaton y ciclista.

El modelo resuelve el problema de la deteccion 3D eficiente en entornos de conduccion autonoma: en lugar de procesar la nube de puntos con operaciones 3D costosas, proyecta los puntos en pilares y ejecuta una CNN 2D, lo que reduce drasticamente el coste computacional y permite inferencia en tiempo real. Con solo 4,8 millones de parametros, es un modelo extremadamente ligero comparado con los detectores 3D basados en voxels o en transformers.

Es relevante ahora como referencia de linea base y para despliegues con restricciones de computo (vehiculos embebidos, robots, drones) donde un detector 3D de gran tamano no es viable. Su licencia Apache-2.0 y su integracion en `torch-pointcloud` facilitan su uso y reproducibilidad. El checkpoint fue publicado en Hugging Face en octubre de 2026 y acumula 19 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointPillars (encoder de pilares + backbone 2D + cabeza de deteccion) |
| Parametros totales | 4.840.904 (4,8 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre nubes de puntos de tamano fijo, 8192 puntos en el ejemplo de la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision 3D, no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (x, y, z, intensidad) |
| Clases detectadas | 3 (coche, peaton, ciclista) |
| Canales de features | 384 |
| Dataset de entrenamiento | KITTI |
| Libreria | torch-pointcloud |

## Arquitectura y entrenamiento

PointPillars, propuesto por Lang et al. en CVPR 2019, organiza la nube de puntos LiDAR en pilares verticales sobre una rejilla en el plano XY. Cada pilar se procesa con una red tipo PointNet simplificada que genera una representacion de 384 canales por pilar, formando un pseudo-imagen 2D. Sobre esa pseudo-imagen se aplica un backbone 2D (tipicamente una red similar a VGG o ResNet) y una cabeza de deteccion que predice cajas 3D con orientacion (yaw) para cada clase. Esta estrategia elimina las convoluciones 3D y reduce el coste computacional de forma drastica.

El checkpoint fue convertido desde MMDetection3D (Apache-2.0) a la libreria `torch-pointcloud` de Arthur Dujardin. El entrenamiento se realizo sobre el dataset KITTI, el benchmark de referencia para deteccion 3D en conduccion autonoma. La model card no detalla el numero de tokens ni la composicion exacta del dataset, ni si se aplicaron tecnicas de aumento de datos especificas mas alla de las del pipeline original de MMDetection3D. No se documenta el uso de RLHF/DPO (no aplica a un detector 3D).

## Capacidades

- Deteccion de objetos 3D en nubes de puntos LiDAR con cajas delimitadoras orientadas (yaw) para tres clases: coche, peaton y ciclista.
- Entrada multimodal por punto: coordenadas (x, y, z) e intensidad de retorno LiDAR (4 canales).
- Extraccion de features de 384 canales por pilar mediante `forward_features`, util para tareas downstream (clasificacion, segmentacion, reutilizacion como backbone).
- Pipeline de preprocesado integrado: la funcion `info["transform"]` aplica las transformaciones necesarias (voxelizacion en pilares, normalizacion) y `collate` agrupa las muestras por `pos_voxel`.
- Inferencia por lotes con `model.eval()` y `torch.no_grad()`, apta para integracion en pipelines de PyTorch.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente perceptivo.

## Casos de uso

- Deteccion de obstaculos en conduccion autonoma: el modelo identifica coches, peatones y ciclistas en la nube de puntos LiDAR de un vehiculo, proporcionando cajas 3D con orientacion que alimentan el modulo de planificacion de trayectorias. Su bajo coste computacional permite ejecutarlo a bordo.
- Linea base para investigacion en deteccion 3D: sirve como referencia reproducible (mAP 64 en KITTI) para comparar nuevos detectores o tecnicas de aumento de datos sin reentrenar desde cero.
- Robotica movil en interiores y exteriores: con 4,8 M de parametros, se puede desplegar en plataformas embebidas (Jetson, Raspberry Pi con acelerador) para evitar colisiones con personas y vehiculos.
- Extraccion de features para tareas downstream: mediante `forward_features` se obtienen representaciones de 384 canales por pilar que pueden alimentar clasificadores de escena, modelos de prediccion de trayectorias o sistemas de segmentacion semantica.
- Prototipado rapido de pipelines LiDAR: la API de `torch-pointcloud` (`create_model`, `collate`, `transform`) permite montar un pipeline completo de deteccion en pocas lineas, util para validar hipotesis antes de invertir en modelos mayores.
- Sistemas de vigilancia y conteo de trafico: desplegado sobre LiDAR fijo en infraestructura viaria, detecta y cuenta vehiculos, peatones y ciclistas en tiempo real con un coste de hardware minimo.
- Vehiculos de reparto autonomos de baja velocidad: la deteccion de peatones y ciclistas con cajas orientadas es suficiente para la navegacion segura en entornos urbanos controlados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`). Dataset KITTI, tarea de deteccion 3D de objetos.

| Metrica | Valor |
|---|---|
| mAP | 64,00 |
| AP / Car | 77,66 |
| AP / Cyclist | 62,10 |
| AP / Pedestrian | 52,26 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en la model card, ni curvas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 4,8 M de parametros en FP32, los pesos ocupan aproximadamente 19 MB; el grueso del consumo proviene de las activaciones de la pseudo-imagen 2D y de la nube de puntos de entrada (8192 puntos en el ejemplo de la model card).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente. Se puede ejecutar en RTX 3060, RTX 4090, A100, H100 o GPUs integradas.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: PyTorch nativo con `torch-pointcloud`; exportacion a ONNX o TorchScript para despliegue en produccion (no documentada en la model card, pero viable por la naturaleza del modelo); TensorRT para aceleracion en embebidos. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. La arquitectura PointPillars esta disenada para inferencia en tiempo real, pero no se aportan cifras concretas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | mAP | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pointpillars.kitti.mmdet3d (este) | 4,8 M | KITTI | 64,00 | Apache-2.0 | Hugging Face |
| PointPillars original (Lang et al., 2019) | no disponible | KITTI | no disponible en esta ficha | Codigo de referencia | Paper + repos |
| Otros detectores 3D de MMDetection3D (p. ej. SECOND, PV-RCNN) | no disponible | KITTI | no disponible en esta ficha | Apache-2.0 (MMDetection3D) | GitHub |

No se dispone en la informacion proporcionada de datos de benchmarks de los modelos alternativos para una comparacion cuantitativa rigurosa. La comparacion cualitativa: PointPillars es sustancialmente mas ligero que los detectores basados en voxels 3D (SECOND, PV-RCNN) a costa de una precision algo menor, lo que lo hace preferible en entornos con restricciones de computo.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre KITTI: el dominio es conduccion en carretera con un sensor LiDAR concreto; el rendimiento puede degradarse en otros sensores, densidades de puntos o entornos (interiores, lluvia intensa, nieve).
- Solo tres clases (coche, peaton, ciclista): no detecta camiones, autobuses, motocicletas, senales ni otros objetos relevantes en produccion.
- Metricas no verificadas: los valores de mAP y AP de la model card estan marcados como `verified: false`; conviene reproducirlos antes de usarlos como referencia.
- Riesgo de falsos negativos en objetos pequenos o lejanos: la discretizacion en pilares pierde resolucion vertical y puede fusionar objetos proximos en el plano XY.
- Sin cuantizaciones publicadas: no hay pesos GGUF, ONNX ni TensorRT oficiales; el despliegue en embebidos requiere conversion manual.
- Licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantias; el autor original (MMDetection3D) y el conversor (`torch-pointcloud`) deben citarse segun sus respectivas licencias.
- No es un modelo generativo: no alucina texto, pero puede producir detecciones espurias (falsos positivos) en zonas con ruido LiDAR o reflexiones.
- Idiomas no aplicables: cualquier evaluacion de sesgos linguisticos o multilingues carece de sentido para este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointpillars.kitti.mmdet3d
- Paper PointPillars (arXiv): https://arxiv.org/abs/1812.05784
- Paper KITTI (CVPR 2012): https://www.cvlibs.net/publications/Geiger2012CVPR.pdf
- Repositorio MMDetection3D (origen de la conversion): https://github.com/open-mmlab/mmdetection3d
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Dataset KITTI: https://www.cvlibs.net/datasets/kitti/
