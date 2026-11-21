# torch-pointcloud/pointrcnn-iou.kitti.openpcdet

## Resumen

PointRCNN es un detector de objetos 3D sobre nubes de puntos LiDAR, publicado originalmente en CVPR 2019 por Shaoshuai Shi, Xiaogang Wang y Hongsheng Li. Este repositorio concreto, `torch-pointcloud/pointrcnn-iou.kitti.openpcdet`, es una conversion de los pesos de OpenPCDet al formato de la libreria `torch-pointcloud` de Arthur Dujardin, empaquetada en safetensors y con licencia Apache-2.0. El modelo resuelve la tarea de localizar y clasificar coches, peatones y ciclistas en escenas de conduccion autonoma a partir de barridos LiDAR.

La arquitectura es un detector de dos etapas basado en puntos: una primera fase genera propuestas de cajas 3D segmentando los puntos de primer plano, y una segunda fase refina cada propuesta con caracteristicas locales y globales. El modelo es deliberadamente compacto: 4.060.531 parametros, 4 canales de entrada (x, y, z e intensidad), 128 caracteristicas internas y 3 clases de salida. No es un modelo de lenguaje ni procesa texto; su modalidad es exclusivamente geometrica 3D.

Su relevancia actual es practica: permite reproducir el baseline PointRCNN de KITTI sin depender de la pila original de OpenPCDet, con carga directa desde Hugging Face mediante `tp.create_model(...)`, pesos en safetensors y extraccion de caracteristicas de 128 canales para tareas posteriores (deteccion, segmentacion o clasificacion sobre puntos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointRCNN (detector 3D de dos etapas basado en puntos, backbone tipo PointNet++) |
| Parametros totales | 4.060.531 (4.0 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de secuencia; entrada de nube de puntos, el ejemplo usa 8192 puntos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (modelo no linguistico, solo geometria 3D) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

Otros datos tecnicos declarados: canales de entrada 4, clases 3 (Car, Pedestrian, Cyclist), caracteristicas 128, dataset KITTI, conversion desde `open-mmlab/OpenPCDet`.

## Arquitectura y entrenamiento

PointRCNN sigue un esquema de dos etapas. La primera etapa segmenta la nube de puntos en primer plano y fondo y genera propuestas de cajas 3D a partir de los puntos segmentados, evitando anclas en el espacio 3D completo. La segunda etapa refina cada propuesta combinando caracteristicas locales de los puntos dentro de la caja con caracteristicas globales del contexto, lo que mejora la precision de la caja y de la clasificacion. El backbone es una red de extraccion sobre puntos (estilo PointNet++) con 128 canales de caracteristicas.

El entrenamiento se realizo sobre el dataset KITTI, el benchmark de referencia para deteccion 3D en conduccion autonoma. La model card no detalla el numero de tokens ni la composicion exacta del dataset, ni indica si hubo etapas de refinamiento adicionales mas alla del entrenamiento supervisado estandar de OpenPCDet. La innovacion destacable es la propuesta de cajas 3D generada directamente desde los puntos de primer plano, en lugar de sobre un voxel grid o anclas densas.

## Capacidades

- Deteccion de objetos 3D en nubes de puntos LiDAR: localiza y clasifica coches, peatones y ciclistas con cajas 3D.
- Segmentacion de primer plano: la primera etapa distingue puntos de objetos de puntos de fondo.
- Generacion de propuestas de cajas 3D a partir de puntos segmentados.
- Refinamiento de cajas en segunda etapa con caracteristicas locales y globales.
- Extraccion de caracteristicas de 128 canales mediante `model.forward_features(...)`, reutilizables para tareas posteriores.
- Entrada multimodal geometrica: coordenadas (x, y, z) e intensidad de retorno LiDAR (4 canales).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Deteccion de obstaculos en conduccion autonoma: el modelo procesa barridos LiDAR de KITTI y devuelve cajas 3D para coches, peatones y ciclistas, adecuado como modulo de percepcion en pipelines de planificacion de trayectorias.
- Baseline de investigacion en deteccion 3D: sirve como referencia reproducible para comparar nuevas arquitecturas sobre KITTI, con pesos cargables en una linea y metricas declaradas (mAP 69.72).
- Preprocesado para seguimiento multi-objeto: las cajas 3D por frame pueden alimentar un tracker (por ejemplo, filtros de Kalman o SORT 3D) para estimar trayectorias de vehiculos y viandantes.
- Extraccion de caracteristicas geometricas: `forward_features` devuelve 128 canales por punto, utiles para entrenar cabezas de segmentacion semantica o clasificacion sobre nubes LiDAR.
- Validacion de pipelines de datos LiDAR: al ser un modelo pequeno (4 M de parametros) y con formato safetensors, es adecuado para pruebas de integracion de sistemas de adquisicion y preprocesado de nubes de puntos.
- Prototipado en robotica movil: deteccion de personas y vehiculos en entornos urbanos con LiDAR, integrable en stacks ROS mediante exportacion de las cajas a mensajes estandar.
- Docencia y demos: ejemplo minimo de deteccion 3D con `torch-pointcloud`, sin necesidad de instalar OpenPCDet completo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre el dataset KITTI:

| Metrica | Valor |
|---|---|
| mAP | 69.72 |
| AP/Car | 78.72 |
| AP/Pedestrian | 58.48 |
| AP/Cyclist | 71.96 |

No se han publicado en la informacion disponible otros benchmarks (latencia, throughput, resultados por dificultad Easy/Moderate/Hard) ni comparaciones oficiales con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 4,06 M de parametros en FP32 los pesos ocupan aproximadamente 16 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con CUDA, incluidas RTX 3060, RTX 4090, A100 o H100; el cuello de botella sera el preprocesado de la nube de puntos, no los pesos.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas e incluso en CPU para inferencia puntual.
- Opciones de despliegue: libreria `torch-pointcloud` (instalacion via `pip install torch-pointcloud`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP KITTI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pointrcnn-iou.kitti.openpcdet | 4,06 M | nube de puntos LiDAR, 4 canales | 69.72 (declarado) | Apache-2.0 | Hugging Face, safetensors |
| PointRCNN original (OpenPCDet) | no disponible | nube de puntos LiDAR | referencia del paper (no disponible en esta informacion) | Apache-2.0 | GitHub open-mmlab/OpenPCDet |
| Alternativas de deteccion 3D (PointPillars, SECOND, PV-RCNN) | no disponible | nube de puntos / voxels | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks de los modelos alternativos para una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre KITTI: el dominio son escenas de conduccion urbana y rural con LiDAR; el rendimiento fuera de ese dominio (interiores, otros sensores, otros paises) no esta garantizado.
- Solo tres clases (Car, Pedestrian, Cyclist); no detecta camiones, autobuses, motocicletas ni senalizacion.
- Requiere nubes de puntos LiDAR con intensidad; no procesa imagenes RGB ni texto.
- Los resultados de benchmarks son declarados por el autor y no estan verificados (`verified: false`); deben tratarse como referencia, no como cifra auditada.
- Riesgo de falsos positivos y negativos en objetos ocluidos o lejanos, habitual en detectores 3D de una sola modalidad.
- La model card no documenta sesgos especificos ni evaluaciones de robustez; no hay informacion sobre rendimiento por nivel de dificultad de KITTI.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribucion y revisarse las licencias del codigo original de OpenPCDet y de la libreria `torch-pointcloud`.
- No es un modelo generativo: no hay riesgo de alucinacion linguistica, pero si de cajas espurias en escenas atipicas.
- El repositorio tiene 0.0 GB declarados y 902 descargas; conviene verificar la integridad de los pesos antes de usarlos en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/pointrcnn-iou.kitti.openpcdet
- Paper PointRCNN: https://arxiv.org/abs/1812.04244
- Repositorio OpenPCDet: https://github.com/open-mmlab/OpenPCDet
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
