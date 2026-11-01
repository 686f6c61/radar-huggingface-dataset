# torch-pointcloud/voxel-rcnn.kitti-car.openpcdet

## Resumen

Voxel R-CNN es un detector de objetos 3D en nubes de puntos basado en vóxeles y con una segunda etapa de refinamiento mediante RoI pooling sobre vóxeles. Este checkpoint concreto, publicado por `torch-pointcloud`, ha sido convertido desde OpenPCDet y está entrenado exclusivamente sobre la clase coche del dataset KITTI. Con 7,6 millones de parámetros, es un modelo muy compacto orientado a detección 3D en entornos de conducción autónoma.

El modelo resuelve el problema de localizar y clasificar coches en escenas LiDAR representadas como vóxeles, devolviendo cajas 3D con orientación. Su relevancia radica en que combina la eficiencia computacional de los detectores basados en vóxeles con la precisión de las arquitecturas de dos etapas, algo que en su momento supuso una mejora notable frente a propuestas basadas en puntos puros como PointRCNN.

La ficha se centra en el checkpoint publicado en HuggingFace, que depende de la librería `torch-pointcloud` y de kernels GPU específicos (`spconv`, `pyg-lib`). No se trata de un modelo de lenguaje ni de un modelo multimodal: es un detector 3D puro para nubes de puntos LiDAR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Voxel R-CNN (detector 3D de dos etapas con voxel RoI pooling) |
| Parametros totales | 7.594.364 (7,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de nube de puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; tarea de vision 3D) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 4 |
| Clases detectadas | 1 (coche) |
| Dimension de caracteristicas | 256 |
| Dataset de entrenamiento | KITTI |
| Libreria | torch-pointcloud |
| Pipeline | object-detection |

## Arquitectura y entrenamiento

Voxel R-CNN es un transformer de vóxeles en el sentido amplio del término: la nube de puntos se voxeliza y se procesa con un backbone 3D disperso (típicamente un 3D sparse CNN), seguido de una primera etapa de propuestas y una segunda etapa que aplica voxel RoI pooling para refinar las cajas candidatas. La innovación clave del paper original es sustituir el PointNet-based RoI pooling de arquitecturas como PointRCNN por un pooling sobre vóxeles, lo que reduce el coste computacional manteniendo la precisión. El checkpoint aquí descrito usa 4 canales de entrada (coordenadas x, y, z más intensidad) y produce características de 256 dimensiones.

El entrenamiento se realizó sobre el dataset KITTI, un benchmark clásico de conducción autónoma con escenas LiDAR y anotaciones 3D. Este checkpoint está restringido a la clase coche. No se dispone de información sobre el número de tokens o muestras exactas, la composición detallada del dataset ni sobre si se aplicaron técnicas de aumento de datos específicas en esta conversión. Tampoco hay datos sobre RLHF, DPO ni etapas de alineación, ya que no aplican a este tipo de modelo.

La conversión desde OpenPCDet a `torch-pointcloud` es el valor añadido de este checkpoint: permite cargar el modelo con `tp.create_model(...)` y obtener tanto predicciones como características intermedias de 256 canales mediante `forward_features`. Requiere `spconv` y `pyg-lib` compilados contra la versión de PyTorch y CUDA del entorno, y los kernels son exclusivos de GPU.

## Capacidades

- Detección de objetos 3D de la clase coche en nubes de puntos LiDAR con 4 canales de entrada (xyz + intensidad).
- Predicción de cajas 3D con posición, dimensiones y orientación.
- Extracción de características de 256 canales mediante `forward_features`, útil como backbone para tareas posteriores.
- Procesamiento de nubes de puntos voxelizadas con kernels dispersos en GPU.
- Integración con el ecosistema `torch-pointcloud` para carga, transformación y collate de datos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un detector 3D puro.
- No dispone de modo thinking, visión 2D genérica, audio ni generación de texto.

## Casos de uso

- Detección de coches en vehículos autónomos: el modelo procesa la nube LiDAR del vehículo y devuelve cajas 3D de los coches circundantes, adecuado por su bajo coste computacional (7,6 M de parámetros) para ejecución en tiempo real en GPUs de a bordo.
- Etiquetado automático de datos LiDAR: pre-anotar escenas KITTI o similares para acelerar la revisión humana en pipelines de anotación, usando las cajas predichas como propuestas iniciales.
- Extracción de características para modelos downstream: `forward_features` permite obtener representaciones de 256 canales por vóxel para alimentar clasificadores de escena, segmentación o modelos de predicción de trayectorias.
- Validación de pipelines de percepción: al ser una conversión oficial de OpenPCDet, sirve como referencia para comprobar que un pipeline propio de voxelización, collate y post-proceso produce resultados coherentes.
- Investigación en detección 3D: punto de partida reproducible para comparar variantes de backbone, voxel RoI pooling o estrategias de aumento de datos sobre KITTI.
- Prototipado en robótica móvil: detección de coches en entornos controlados o aparcamientos con LiDAR, donde la clase única y el tamaño reducido del modelo simplifican el despliegue.
- Benchmarking de hardware: por su tamaño compacto, es útil para medir latencia y throughput de kernels dispersos (`spconv`) en distintas GPUs antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Metrica | Dataset | Valor |
|---|---|---|
| mAP | KITTI | 84,53 |
| AP/Car | KITTI | 84,53 |

No se han publicado en la información disponible resultados adicionales (por ejemplo, desglose por dificultad fácil/moderada/difícil, AP 3D frente a AP BEV, ni comparaciones numéricas con otros modelos).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 7,6 M de parámetros el peso del modelo es de decenas de MB, pero el consumo real depende del número de vóxeles y del tamaño del buffer de `spconv`.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA compatible con `spconv` y `pyg-lib`; el modelo es GPU-only por sus kernels.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, siempre que la compilación de `spconv` coincida con la versión de CUDA.
- Opciones de despliegue: `torch-pointcloud` con PyTorch, `spconv` y `pyg-lib`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Clases | Dataset | mAP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| voxel-rcnn.kitti-car.openpcdet | 7,6 M | 1 (coche) | KITTI | 84,53 | Apache-2.0 | HuggingFace (torch-pointcloud) |
| PointRCNN (referencia del paper) | no disponible | 3 (coche, peatón, ciclista) | KITTI | no disponible | MIT (repo original) | GitHub |
| OpenPCDet Voxel R-CNN original | no disponible | 3 | KITTI | no disponible | Apache-2.0 | GitHub |

La comparación numérica con alternativas no está disponible en la información proporcionada. La diferencia principal frente a las implementaciones originales de OpenPCDet es la integración con la librería `torch-pointcloud` y el formato safetensors, además de la restricción a una sola clase.

## Limitaciones y advertencias

- Entrenado solo para la clase coche: no detecta peatones, ciclistas ni otras categorías de KITTI.
- Dominio limitado a KITTI: el rendimiento puede degradarse en otros sensores LiDAR, densidades de puntos o condiciones meteorológicas distintas.
- Solo entrada LiDAR de 4 canales; no acepta imágenes ni fusión multimodal.
- Dependencia de kernels GPU específicos (`spconv`, `pyg-lib`): la instalación requiere compilación contra la versión exacta de PyTorch y CUDA, lo que complica el despliegue reproducible.
- Riesgo de falsos positivos y negativos en escenas con oclusiones, objetos lejanos o nubes de puntos dispersas; no se documentan métricas por nivel de dificultad.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las licencias de las dependencias (`spconv`, `pyg-lib`) y del dataset KITTI, que tiene sus propias condiciones de uso.
- Sin información sobre sesgos demográficos o geográficos más allá del origen del dataset.
- El checkpoint tiene muy pocas descargas (18) y ningún like, por lo que su validación por la comunidad es escasa.
- No se han verificado los resultados de benchmark declarados (`verified: false`).

## Enlaces

- HuggingFace: https://huggingface.co/torch-pointcloud/voxel-rcnn.kitti-car.openpcdet
- Paper Voxel R-CNN: https://arxiv.org/abs/2012.15712
- Repositorio OpenPCDet: https://github.com/open-mmlab/OpenPCDet
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Guia de instalacion: https://pytorch-pointcloud.org/latest/installation/
- Dataset KITTI: https://www.cvlibs.net/datasets/kitti/
